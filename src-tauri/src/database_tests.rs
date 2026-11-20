use super::*;
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

#[derive(Clone)]
pub(super) struct TestClock(Arc<Mutex<TimePoint>>);

impl TestClock {
    pub(super) fn new() -> Self {
        Self(Arc::new(Mutex::new(TimePoint {
            wall_ms: 1_000_000,
            ticks_ms: 0,
        })))
    }
    pub(super) fn advance(&self, ms: i64) {
        let mut time = self.0.lock().unwrap();
        time.wall_ms += ms;
        time.ticks_ms += ms;
    }
    pub(super) fn jump_wall(&self, ms: i64) {
        self.0.lock().unwrap().wall_ms += ms;
    }
}

impl Clock for TestClock {
    fn now(&self) -> TimePoint {
        *self.0.lock().unwrap()
    }
}

fn input() -> StartInput {
    StartInput {
        category: "开发".into(),
        quantity: Some(2.5),
        remark: "实际测试".into(),
    }
}
fn memory() -> (Store, TestClock) {
    let clock = TestClock::new();
    let store = Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(clock.clone()),
        None,
    )
    .unwrap();
    (store, clock)
}
fn id(store: &Store) -> i64 {
    store.active().unwrap().unwrap().id
}

#[test]
fn todo_crud_is_persistent_and_keeps_pending_order() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    for invalid in ["　", "工作\n内容", "有\0字", &"🌱".repeat(81)] {
        assert!(store.create_todo(invalid).is_err());
    }
    store.create_todo("　检查记录 🌱 ").unwrap();
    store.create_todo("复查").unwrap();
    let first = store.list_todos().unwrap().remove(0);
    assert_eq!(first.title, "检查记录 🌱");
    store.rename_todo(&first.id, "改名").unwrap();
    store.set_todo_completed(&first.id, true).unwrap();
    clock.advance(1000);
    store.set_todo_completed(&first.id, true).unwrap();
    assert_eq!(store.list_todos().unwrap()[1].completed_at, Some(1_000_000));
    assert!(store.snapshot().unwrap().recent_records.is_empty());
    drop(store);

    let mut store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    let items = store.list_todos().unwrap();
    assert_eq!(items[0].title, "复查");
    assert_eq!(items[1].title, "改名");
    assert_eq!(items[1].completed_at, Some(1_000_000));
    store.set_todo_completed(&first.id, false).unwrap();
    assert_eq!(store.list_todos().unwrap()[0].id, first.id);
    store.delete_todo(&first.id).unwrap();
    assert_eq!(store.list_todos().unwrap().len(), 1);
    assert!(store.rename_todo(&first.id, "下标失效").is_err());
}

#[test]
fn pending_todo_names_are_unique_on_add_rename_and_reopen() {
    let (mut store, _) = memory();
    store.create_todo("　QA　").unwrap();
    let original = store.list_todos().unwrap().remove(0);
    assert!(store.create_todo(" qa ").is_err());
    store.rename_todo(&original.id, "qa").unwrap();
    store.create_todo("复查").unwrap();
    let other = store.list_todos().unwrap().remove(1);
    assert!(store.rename_todo(&other.id, " QA ").is_err());
    assert_eq!(store.list_todos().unwrap()[1].title, "复查");
    store.set_todo_completed(&original.id, true).unwrap();
    store.create_todo("QA").unwrap();
    assert!(store.set_todo_completed(&original.id, false).is_err());
    assert!(store.list_todos().unwrap()[2].completed_at.is_some());
    store.rename_todo(&original.id, "上次 QA").unwrap();
    store.set_todo_completed(&original.id, false).unwrap();
    assert!(store.list_todos().unwrap()[0].completed_at.is_none());
}

#[test]
fn legacy_duplicate_todos_keep_distinct_numbers_and_can_be_renamed() {
    let (mut store, _) = memory();
    store.create_todo("111").unwrap();
    // Released schema 13 allowed identical pending titles.
    store
        .connection
        .execute("INSERT INTO todos(title,created_at) VALUES('111',0)", [])
        .unwrap();
    store.create_todo("222").unwrap();
    let items = store.list_todos().unwrap();
    assert_eq!(items[0].duplicate_number, Some(1));
    assert_eq!(items[1].duplicate_number, Some(2));
    assert_eq!(items[2].duplicate_number, None);
    store.rename_todo(&items[1].id, "111").unwrap();
    store.rename_todo(&items[1].id, "111 复查").unwrap();
    let after = store.list_todos().unwrap();
    assert_eq!(after.len(), 3);
    assert_eq!(after[1].id, items[1].id);
    assert!(after.iter().all(|todo| todo.duplicate_number.is_none()));
}

#[test]
fn todo_can_be_timed_more_than_once_and_keeps_existing_records() {
    let (mut store, clock) = memory();
    store.create_todo("检查记录").unwrap();
    let todo = store.list_todos().unwrap().remove(0).id;
    store.start_checked(input(), None, Some(&todo)).unwrap();
    let first = id(&store);
    assert_eq!(store.list_todos().unwrap()[0].open_record_id, Some(first));
    assert!(store.start_checked(input(), None, Some(&todo)).is_err());
    clock.advance(2400);
    store.pause(first).unwrap();
    clock.advance(800);
    assert!(
        store
            .start_checked(input(), Some(first), Some(&todo))
            .is_err()
    );
    assert_eq!(id(&store), first);
    store.rename_todo(&todo, "检查修订记录").unwrap();
    store.resume(first).unwrap();
    clock.advance(500);
    store.finish(first).unwrap();
    assert_eq!(store.list_todos().unwrap()[0].completed_at, None);
    assert_eq!(store.list_todos().unwrap()[0].open_record_id, None);
    store.start_checked(input(), None, Some(&todo)).unwrap();
    let second = id(&store);
    assert_ne!(first, second);
    store.set_todo_completed(&todo, true).unwrap();
    assert_eq!(store.list_todos().unwrap()[0].open_record_id, Some(second));
    store.delete_todo(&todo).unwrap();
    assert_eq!(id(&store), second);
    let record = store.record(first).unwrap();
    assert_eq!(record.task_name.as_deref(), Some("检查记录"));
    assert_eq!(record.duration_ms, 2900);
    let record = store.record(second).unwrap();
    assert_eq!(record.task_name.as_deref(), Some("检查修订记录"));
    assert!(!record.is_paused);
    assert!(store.list_todos().unwrap().is_empty());
}

#[test]
fn todo_switch_rejects_stale_or_completed_items_and_rolls_back_failed_association() {
    let (mut store, clock) = memory();
    store.create_todo("继续写文档").unwrap();
    let todo = store.list_todos().unwrap().remove(0).id;
    store.start(input()).unwrap();
    let previous = id(&store);
    clock.advance(7000);
    assert!(
        store
            .start_checked(input(), Some(previous), Some(&todo))
            .is_err()
    );
    store.pause(previous).unwrap();
    assert!(
        store
            .start_checked(input(), Some(previous), Some("missing-todo"))
            .is_err()
    );
    store.set_todo_completed(&todo, true).unwrap();
    assert!(
        store
            .start_checked(input(), Some(previous), Some(&todo))
            .is_err()
    );
    store.set_todo_completed(&todo, false).unwrap();
    store.connection.execute_batch("CREATE TRIGGER fail_todo_link BEFORE INSERT ON todo_work_records BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
    assert!(
        store
            .start_checked(input(), Some(previous), Some(&todo))
            .is_err()
    );
    let current = store.active().unwrap().unwrap();
    assert_eq!(current.id, previous);
    assert_eq!(current.duration_ms, 7000);
    assert!(current.is_paused);
    assert!(store.pending_records().unwrap().is_empty());
    assert_eq!(store.list_todos().unwrap()[0].open_record_id, None);
    store
        .connection
        .execute_batch("DROP TRIGGER fail_todo_link;")
        .unwrap();
    store
        .start_checked(input(), Some(previous), Some(&todo))
        .unwrap();
    assert_eq!(store.pending_records().unwrap()[0].id, previous);
    assert_eq!(
        store.list_todos().unwrap()[0].open_record_id,
        Some(id(&store))
    );
}

#[test]
fn todo_links_resume_after_reopening_and_suspend_in_existing_task_list() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let (first, todo);
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.create_todo("等待恢复").unwrap();
        todo = store.list_todos().unwrap().remove(0).id;
        store.start_checked(input(), None, Some(&todo)).unwrap();
        first = id(&store);
        clock.advance(2200);
        store.pause(first).unwrap();
    }
    let mut store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(store.active().unwrap().unwrap().recovery_pending);
    assert_eq!(store.list_todos().unwrap()[0].open_record_id, Some(first));
    let target = store
        .page_tasks()
        .unwrap()
        .into_iter()
        .find(|task| task.record_id == Some(first))
        .unwrap();
    store.confirm_recovery_task(target.id).unwrap();
    assert_eq!(id(&store), first);
    let other = store
        .page_tasks()
        .unwrap()
        .into_iter()
        .find(|task| task.record_id.is_none())
        .unwrap();
    store.confirm_recovery_task(other.id).unwrap();
    assert_eq!(store.record(first).unwrap().status, "SUSPENDED");
    assert_eq!(store.list_todos().unwrap()[0].open_record_id, Some(first));
    let current = id(&store);
    store.pause(current).unwrap();
    assert!(
        store
            .start_checked(input(), Some(current), Some(&todo))
            .is_err()
    );
    assert_eq!(id(&store), current);
}

pub(super) struct TestDirectory(PathBuf);
impl TestDirectory {
    pub(super) fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir =
            std::env::temp_dir().join(format!("workmemo-test-{}-{nonce}", std::process::id()));
        std::fs::create_dir(&dir).unwrap();
        Self(dir)
    }
    pub(super) fn db(&self) -> PathBuf {
        self.0.join("test.sqlite3")
    }
}
impl Drop for TestDirectory {
    fn drop(&mut self) {
        for name in [
            "test.sqlite3",
            "test.sqlite3-wal",
            "test.sqlite3-shm",
            "test.lock",
        ] {
            let _ = std::fs::remove_file(self.0.join(name));
        }
        let _ = std::fs::remove_dir(&self.0);
    }
}

#[test]
fn rejects_invalid_input_without_creating_records() {
    let (mut store, _) = memory();
    for quantity in [-1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        let mut value = input();
        value.quantity = Some(quantity);
        assert!(store.start(value).is_err());
    }
    for category in ["", "未知"] {
        let mut value = input();
        value.category = category.into();
        assert!(store.start(value).is_err());
    }
    let mut long = input();
    long.remark = "字".repeat(2001);
    assert!(store.start(long).is_err());
    assert!(store.snapshot().unwrap().active.is_none());
    assert!(store.snapshot().unwrap().recent_records.is_empty());
}

#[test]
fn pause_resume_preserves_subseconds_and_excludes_pause() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1250);
    store.pause(task).unwrap();
    clock.advance(30_000);
    assert_eq!(store.snapshot().unwrap().active.unwrap().duration_ms, 1250);
    store.resume(task).unwrap();
    clock.advance(1750);
    store.finish(task).unwrap();
    let saved = &store.snapshot().unwrap().recent_records[0];
    assert_eq!(saved.id, task);
    assert_eq!(saved.duration_ms, 3000);
    assert_eq!(saved.duration_seconds, 3);
    assert_eq!(saved.status, "FINISHED");
    assert_eq!(saved.quantity, Some(2.5));
}

#[test]
fn monotonic_time_survives_wall_clock_changes_and_focus_gaps() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(500);
    clock.jump_wall(3_600_000);
    store.checkpoint().unwrap();
    clock.advance(2500);
    clock.jump_wall(-7_200_000);
    store.finish(task).unwrap();
    let record = &store.snapshot().unwrap().recent_records[0];
    assert_eq!(record.duration_ms, 3000);
    assert!(record.end_time.unwrap() >= record.start_time);
}

#[test]
fn running_task_is_protected_and_database_enforces_one_active() {
    let (mut store, _) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    assert!(store.start(input()).is_err());
    assert_eq!(id(&store), task);
    assert!(store.connection.execute("INSERT INTO work_records(category,quantity,start_time,status) VALUES('文档',1,1,'WORKING')", []).is_err());
}

#[test]
fn paused_switch_finishes_old_task_atomically() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let old = id(&store);
    clock.advance(2000);
    store.pause(old).unwrap();
    clock.advance(5000);
    let mut next = input();
    next.category = "文档".into();
    store.start(next).unwrap();
    assert_ne!(id(&store), old);
    let snapshot = store.snapshot().unwrap();
    assert_eq!(snapshot.recent_records.len(), 1);
    assert_eq!(snapshot.recent_records[0].duration_seconds, 2);
    assert_eq!(snapshot.active.unwrap().category, "文档");
}

#[test]
fn failed_switch_rolls_back_and_keeps_previous_task() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let old = id(&store);
    clock.advance(1000);
    store.pause(old).unwrap();
    store.connection.execute_batch("CREATE TRIGGER reject_new BEFORE INSERT ON work_records BEGIN SELECT RAISE(ABORT,'test write failure'); END;").unwrap();
    assert!(store.start(input()).is_err());
    let snapshot = store.snapshot().unwrap();
    assert!(snapshot.recent_records.is_empty());
    let active = snapshot.active.unwrap();
    assert_eq!(active.id, old);
    assert!(active.is_paused);
}

#[test]
fn repeated_commands_do_not_duplicate_time_or_records() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1500);
    store.pause(task).unwrap();
    store.pause(task).unwrap();
    store.resume(task).unwrap();
    clock.advance(500);
    store.resume(task).unwrap();
    clock.advance(1000);
    store.finish(task).unwrap();
    store.finish(task).unwrap();
    let saved = store.snapshot().unwrap().recent_records;
    assert_eq!(saved.len(), 1);
    assert_eq!(saved[0].duration_ms, 3000);
}

#[test]
fn stale_task_commands_cannot_change_replacement() {
    let (mut store, _) = memory();
    store.start(input()).unwrap();
    let old = id(&store);
    store.pause(old).unwrap();
    store.start(input()).unwrap();
    let current = id(&store);
    assert!(store.pause(old).is_err());
    assert!(store.resume(old).is_err());
    store.finish(old).unwrap();
    assert_eq!(id(&store), current);
}

#[test]
fn checkpoint_recovery_keeps_id_and_never_counts_downtime() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let task;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(input()).unwrap();
        task = id(&store);
        clock.advance(2400);
        store.checkpoint().unwrap();
        clock.advance(800); // Simulate process death before the next checkpoint.
    }
    clock.advance(30_000); // Same Beijing day; cross-day expiry has dedicated tests.
    let mut reopened = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let restored = reopened.snapshot().unwrap().active.unwrap();
    assert_eq!(restored.id, task);
    assert_eq!(restored.duration_ms, 2400);
    assert!(restored.is_paused && restored.recovery_pending);
    reopened.resume(task).unwrap();
    clock.advance(600);
    reopened.finish(task).unwrap();
    assert_eq!(
        reopened.snapshot().unwrap().recent_records[0].duration_seconds,
        3
    );
    drop(reopened);
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(reopened.active().unwrap().is_none());
    assert_eq!(reopened.snapshot().unwrap().recent_records[0].id, task);
}

#[test]
fn normal_close_saves_exact_duration_and_reopens_paused() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(input()).unwrap();
        clock.advance(975);
        store.pause_for_close().unwrap();
    }
    clock.advance(50_000);
    let mut store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    let record = store.snapshot().unwrap().active.unwrap();
    assert_eq!(record.duration_ms, 975);
    assert!(record.is_paused);
}

#[test]
fn failed_pause_retains_running_segment_for_retry() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1000);
    store.connection.execute_batch("CREATE TRIGGER reject_update BEFORE UPDATE ON work_records BEGIN SELECT RAISE(ABORT,'test disk failure'); END;").unwrap();
    assert!(store.pause(task).is_err());
    assert!(!store.active().unwrap().unwrap().is_paused);
    store
        .connection
        .execute_batch("DROP TRIGGER reject_update;")
        .unwrap();
    clock.advance(2000);
    store.pause(task).unwrap();
    assert_eq!(store.active().unwrap().unwrap().duration_seconds, 3);
}

#[test]
fn rejects_newer_schema_without_resetting_it() {
    let directory = TestDirectory::new();
    {
        let connection = Connection::open(directory.db()).unwrap();
        connection.execute_batch("CREATE TABLE existing_data(value TEXT); INSERT INTO existing_data VALUES('keep me'); PRAGMA user_version=999;").unwrap();
    }
    assert!(Store::open(&directory.db(), Box::new(TestClock::new())).is_err());
    let connection = Connection::open(directory.db()).unwrap();
    let version: i64 = connection
        .pragma_query_value(None, "user_version", |row| row.get(0))
        .unwrap();
    let value: String = connection
        .query_row("SELECT value FROM existing_data", [], |row| row.get(0))
        .unwrap();
    assert_eq!(version, 999);
    assert_eq!(value, "keep me");
}

#[test]
fn repeated_checkpoints_do_not_double_count_or_discard_subseconds() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    for _ in 0..5 {
        clock.advance(250);
        store.checkpoint().unwrap();
        store.snapshot().unwrap();
    }
    store.finish(task).unwrap();
    assert_eq!(
        store.snapshot().unwrap().recent_records[0].duration_ms,
        1250
    );
}

#[test]
fn invalid_switch_does_not_finish_the_paused_record() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1500);
    store.pause(task).unwrap();
    let mut invalid = input();
    invalid.quantity = Some(-1.0);
    assert!(store.start(invalid).is_err());
    let snapshot = store.snapshot().unwrap();
    assert!(snapshot.recent_records.is_empty());
    let active = snapshot.active.unwrap();
    assert_eq!(active.id, task);
    assert_eq!(active.duration_ms, 1500);
    assert!(active.is_paused);
}

#[cfg(windows)]
#[test]
fn second_instance_cannot_recover_or_modify_live_database() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let mut first = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    first.start(input()).unwrap();
    assert!(Store::open(&directory.db(), Box::new(clock)).is_err());
    assert!(!first.active().unwrap().unwrap().is_paused);
}
