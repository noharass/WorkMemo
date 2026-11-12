use super::*;
use crate::database::tests::{TestClock, TestDirectory};

const MIDNIGHT: i64 = 16 * 3_600_000; // UTC 16:00 = Beijing next day 00:00.

fn memory(wall: i64) -> (Store, TestClock) {
    let clock = TestClock::new();
    clock.jump_wall(wall - clock.now().wall_ms);
    let store = Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(clock.clone()),
        None,
    )
    .unwrap();
    (store, clock)
}
fn input() -> StartInput {
    StartInput {
        category: "开发".into(),
        quantity: Some(2.5),
        remark: "保留原记录".into(),
    }
}
fn start(store: &mut Store) -> i64 {
    store.start(input()).unwrap();
    store.active().unwrap().unwrap().id
}
fn paused_at(store: &Store, id: i64) -> Option<i64> {
    store
        .connection
        .query_row(
            "SELECT paused_at FROM work_records WHERE id=?1",
            [id],
            |r| r.get(0),
        )
        .unwrap()
}
fn reminders(store: &Store) -> i64 {
    store
        .connection
        .query_row("SELECT COUNT(*) FROM end_reminders", [], |r| r.get(0))
        .unwrap()
}

#[test]
fn boundary_is_fixed_beijing_midnight_and_not_a_rolling_24_hours() {
    assert_eq!(beijing_day_start(0), -BEIJING_OFFSET_MS);
    assert_eq!(beijing_day_start(MIDNIGHT - 1), -BEIJING_OFFSET_MS);
    assert_eq!(beijing_day_start(MIDNIGHT), MIDNIGHT);
    assert_eq!(beijing_day_start(MIDNIGHT + DAY_MS - 1), MIDNIGHT);
    let (mut store, clock) = memory(MIDNIGHT - 2000);
    let id = start(&mut store);
    clock.advance(500);
    store.pause(id).unwrap();
    let stop = paused_at(&store, id).unwrap();
    clock.advance(1499);
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 0);
    clock.advance(1);
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 1);
    let saved = store.record(id).unwrap();
    assert_eq!(saved.status, "FINISHED");
    assert_eq!(saved.duration_ms, 500);
    assert_eq!(saved.quantity, Some(2.5));
    assert_eq!(saved.remark, "保留原记录");
    assert_eq!(saved.end_time, Some(stop));
    assert_eq!(saved.confirmed_end_time, Some(MIDNIGHT));
    assert_eq!(saved.settlement_status, "PENDING");
    assert_eq!(saved.end_reason.as_deref(), Some("IDLE"));
    assert!(!saved.recovery_pending);
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 0);
    assert_eq!(reminders(&store), 1);
}

#[test]
fn all_pause_reasons_suspended_and_browsing_are_included() {
    for reason in [
        "MANUAL",
        "APP_CLOSE",
        "RECOVERY",
        "AWAY",
        "MONITOR",
        "IDLE_PAUSE",
        "SUSPENDED",
        "BROWSING",
    ] {
        let (mut store, clock) = memory(MIDNIGHT - 2000);
        let id = start(&mut store);
        clock.advance(1000);
        match reason {
            "SUSPENDED" => store.switch_page_task(None, clock.now()).unwrap(),
            "BROWSING" => store.enter_browsing().unwrap(),
            _ => store.pause_with_reason(id, reason).unwrap(),
        }
        if reason == "RECOVERY" {
            store
                .connection
                .execute(
                    "UPDATE work_records SET recovery_pending=1 WHERE id=?1",
                    [id],
                )
                .unwrap();
        }
        clock.advance(1000);
        assert_eq!(store.expire_previous_day_pauses().unwrap(), 1, "{reason}");
        let saved = store.record(id).unwrap();
        assert_eq!(saved.status, "FINISHED", "{reason}");
        assert_eq!(saved.duration_ms, 1000, "{reason}");
        assert_eq!(reminders(&store), 1);
    }
}

#[test]
fn running_work_and_a_pause_started_after_midnight_remain_untouched() {
    let (mut store, clock) = memory(MIDNIGHT - 2000);
    let id = start(&mut store);
    clock.advance(3000);
    assert_eq!(store.snapshot().unwrap().active.unwrap().id, id);
    assert_eq!(store.record(id).unwrap().duration_ms, 3000);
    store.pause(id).unwrap();
    assert_eq!(paused_at(&store, id), Some(MIDNIGHT + 1000));
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 0);
    assert_eq!(reminders(&store), 0);
}

#[test]
fn finishing_old_suspended_work_does_not_reset_another_running_timer() {
    let (mut store, clock) = memory(MIDNIGHT - 4000);
    let old = start(&mut store);
    clock.advance(1000);
    store.switch_page_task(None, clock.now()).unwrap();
    let current = start(&mut store);
    clock.advance(4000);
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 1);
    assert_eq!(store.record(old).unwrap().duration_ms, 1000);
    assert_eq!(store.snapshot().unwrap().active.unwrap().id, current);
    assert_eq!(store.record(current).unwrap().duration_ms, 4000);
    assert_eq!(store.segment.as_ref().unwrap().id, current);
}

#[test]
fn repeated_pause_keeps_the_anchor_and_resume_then_pause_uses_the_new_day() {
    let (mut store, clock) = memory(MIDNIGHT - 3000);
    let id = start(&mut store);
    clock.advance(500);
    store.pause(id).unwrap();
    let first = paused_at(&store, id);
    clock.advance(500);
    store.pause(id).unwrap();
    assert_eq!(paused_at(&store, id), first);
    store.resume(id).unwrap();
    assert_eq!(paused_at(&store, id), None);
    clock.advance(3000);
    store.pause(id).unwrap();
    assert_eq!(paused_at(&store, id), Some(MIDNIGHT + 1000));
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 0);
    clock.advance(DAY_MS - 1000);
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 1);
    assert_eq!(store.record(id).unwrap().duration_ms, 3500);
}

#[test]
fn expired_record_cannot_be_resumed_or_selected_again() {
    for named in [false, true] {
        let (mut store, clock) = memory(MIDNIGHT - 2000);
        let id = start(&mut store);
        clock.advance(1000);
        store.pause(id).unwrap();
        let task = store
            .page_tasks()
            .unwrap()
            .into_iter()
            .find(|t| t.record_id == Some(id))
            .unwrap()
            .id;
        clock.advance(1000);
        let result = if named {
            store.switch_to_named_task(task)
        } else {
            store.resume(id)
        };
        assert!(result.is_err());
        assert_eq!(store.record(id).unwrap().status, "FINISHED");
        assert!(store.active().unwrap().is_none());
        assert_eq!(reminders(&store), 1);
    }
}

#[test]
fn batch_failure_rolls_back_records_and_reminders_then_retries_once() {
    let (mut store, clock) = memory(MIDNIGHT - 4000);
    let first = start(&mut store);
    clock.advance(500);
    store.switch_page_task(None, clock.now()).unwrap();
    let second = start(&mut store);
    clock.advance(500);
    store.switch_page_task(None, clock.now()).unwrap();
    let current = start(&mut store);
    store.connection.execute_batch(&format!("CREATE TRIGGER fail_rollover BEFORE INSERT ON end_reminders WHEN NEW.record_id={second} BEGIN SELECT RAISE(ABORT,'injected'); END;")).unwrap();
    clock.advance(3000);
    assert!(store.expire_previous_day_pauses().is_err());
    assert_eq!(store.record(first).unwrap().status, "SUSPENDED");
    assert_eq!(store.record(second).unwrap().status, "SUSPENDED");
    assert_eq!(reminders(&store), 0);
    assert_eq!(store.segment.as_ref().unwrap().id, current);
    store
        .connection
        .execute_batch("DROP TRIGGER fail_rollover")
        .unwrap();
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 2);
    assert_eq!(store.expire_previous_day_pauses().unwrap(), 0);
    assert_eq!(reminders(&store), 2);
    assert_eq!(store.active().unwrap().unwrap().id, current);
}

#[test]
fn closed_app_and_crash_recovery_expire_on_the_first_next_day_snapshot() {
    for graceful in [true, false] {
        let directory = TestDirectory::new();
        let clock = TestClock::new();
        clock.jump_wall(MIDNIGHT - 2000 - clock.now().wall_ms);
        let id;
        {
            let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
            id = start(&mut store);
            clock.advance(500);
            if graceful {
                store.pause_for_close().unwrap();
            } else {
                store.checkpoint().unwrap();
            }
        }
        clock.advance(2000);
        {
            let mut reopened = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
            assert_eq!(paused_at(&reopened, id), Some(MIDNIGHT - 1500));
            assert!(reopened.snapshot().unwrap().active.is_none());
            assert_eq!(reopened.record(id).unwrap().duration_ms, 500);
            assert_eq!(reopened.record(id).unwrap().end_time, Some(MIDNIGHT - 1500));
            assert_eq!(reminders(&reopened), 1);
        }
        let mut reopened = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        assert_eq!(reopened.expire_previous_day_pauses().unwrap(), 0);
        assert_eq!(reminders(&reopened), 1);
    }
}

#[test]
fn schema_ten_upgrade_preserves_records_children_bindings_and_sequence() {
    let (mut store, clock) = memory(MIDNIGHT - 3000);
    let id = start(&mut store);
    clock.advance(500);
    store.pause(id).unwrap();
    let task = store
        .page_tasks()
        .unwrap()
        .into_iter()
        .find(|t| t.record_id == Some(id))
        .unwrap()
        .id;
    store.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES('https://example.test/','开发','origin',?1)", [task]).unwrap();
    store.connection.execute_batch("DROP TABLE manual_entry_requests; DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; PRAGMA user_version=10; UPDATE sqlite_sequence SET seq=999 WHERE name='work_records';").unwrap();
    let mut migrated = Store::initialize(store.connection, Box::new(clock.clone()), None).unwrap();
    assert_eq!(paused_at(&migrated, id), Some(MIDNIGHT - 2500));
    assert_eq!(migrated.record(id).unwrap().quantity, Some(2.5));
    assert_eq!(migrated.record(id).unwrap().remark, "保留原记录");
    let foreign_keys: i64 = migrated
        .connection
        .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |r| {
            r.get(0)
        })
        .unwrap();
    assert_eq!(foreign_keys, 0);
    assert_eq!(
        migrated
            .connection
            .query_row("SELECT task_id FROM work_urls", [], |r| r.get::<_, i64>(0))
            .unwrap(),
        task
    );
    clock.advance(2500);
    assert_eq!(migrated.expire_previous_day_pauses().unwrap(), 1);
    assert!(migrated.rule_task_finished(1).unwrap());
    assert_eq!(start(&mut migrated), 1000);
    assert_eq!(migrated.record(id).unwrap().duration_ms, 500);
}

#[test]
fn failed_schema_upgrade_rolls_back_the_added_column_and_version() {
    let (store, clock) = memory(MIDNIGHT - 3000);
    store.connection.execute_batch("DROP TABLE manual_entry_requests; DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; PRAGMA user_version=10; CREATE TABLE paused_records_by_day(marker TEXT); INSERT INTO paused_records_by_day VALUES('keep');").unwrap();
    let directory = TestDirectory::new();
    store
        .connection
        .backup(
            "main",
            directory.db(),
            None::<fn(rusqlite::backup::Progress)>,
        )
        .unwrap();
    assert!(Store::open(&directory.db(), Box::new(clock)).is_err());
    let connection = Connection::open(directory.db()).unwrap();
    assert_eq!(
        connection
            .query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
            .unwrap(),
        10
    );
    assert_eq!(
        connection
            .query_row(
                "SELECT COUNT(*) FROM pragma_table_info('work_records') WHERE name='paused_at'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        0
    );
    assert_eq!(
        connection
            .query_row("SELECT marker FROM paused_records_by_day", [], |r| r
                .get::<_, String>(0))
            .unwrap(),
        "keep"
    );
}
