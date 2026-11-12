# 北京时间零点结束：完整源码

2026-11-12。13 个程序／迁移／测试文件全文。完整路径、检查、命令和兼容性见 E:\WorkMemo\docs\DAY-ROLLOVER.md。

## NEW FILE — E:\WorkMemo\src-tauri\migrations\011_pause_day.sql

```sql

-- Persist the time a record stopped so restarts and repeated pauses do not
-- extend its lifetime. This additive migration preserves records and children.
ALTER TABLE work_records ADD COLUMN paused_at INTEGER
    CHECK(paused_at IS NULL OR paused_at >= 0);
CREATE INDEX paused_records_by_day ON work_records(paused_at)
    WHERE status IN ('WORKING','SUSPENDED') AND is_demo=0;

```

## NEW FILE — E:\WorkMemo\src-tauri\src\day_rollover.rs

```rust

use super::*;

const DAY_MS: i64 = 86_400_000;
const BEIJING_OFFSET_MS: i64 = 8 * 3_600_000;

// Calendar policy uses fixed UTC+8, independently of the Windows time zone.
fn beijing_day_start(wall_ms: i64) -> i64 {
    wall_ms.max(0).saturating_add(BEIJING_OFFSET_MS) / DAY_MS * DAY_MS - BEIJING_OFFSET_MS
}

#[cfg(test)]
#[path = "day_rollover_tests.rs"]
mod tests;

impl Store {
    pub(crate) fn expire_previous_day_pauses(&mut self) -> Result<usize> {
        let now = self.clock.now();
        let boundary = beijing_day_start(now.wall_ms);
        let ids: Vec<i64> = self
            .connection
            .prepare(
                "SELECT id FROM work_records WHERE status IN ('WORKING','SUSPENDED')
             AND (is_paused=1 OR recovery_pending=1 OR status='SUSPENDED')
             AND is_demo=0 AND paused_at<?1 ORDER BY id",
            )
            .map_err(db_error)?
            .query_map([boundary], |row| row.get(0))
            .map_err(db_error)?
            .collect::<rusqlite::Result<_>>()
            .map_err(db_error)?;
        if ids.is_empty() {
            return Ok(0);
        }
        let active_id = self.active()?.map(|record| record.id);
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let mut expired_rules = Vec::<i64>::new();
        for id in &ids {
            expired_rules.extend(
                tx.prepare(
                    "SELECT u.id FROM work_urls u JOIN work_tasks t ON t.id=u.task_id
                 WHERE t.current_record_id=?1",
                )
                .map_err(db_error)?
                .query_map([id], |row| row.get::<_, i64>(0))
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?,
            );
            // Keep the saved duration, quantity, remark and real segment end.
            // IDLE is the existing automatic-inactivity reason; no synthetic work.
            let changed = tx
                .execute(
                    "UPDATE work_records SET status='FINISHED',is_paused=1,recovery_pending=0,
                 settlement_status='PENDING',confirmed_end_time=?2,end_reason='IDLE',
                 end_time=MAX(start_time,COALESCE((SELECT MAX(checkpoint_time) FROM work_segments
                    WHERE record_id=?1 AND duration_ms>0),paused_at,last_input_time,start_time)),
                 pause_reason=NULL,paused_at=NULL WHERE id=?1
                 AND status IN ('WORKING','SUSPENDED') AND paused_at<?3
                 AND (is_paused=1 OR recovery_pending=1 OR status='SUSPENDED') AND is_demo=0",
                    params![id, now.wall_ms.max(0), boundary],
                )
                .map_err(db_error)?;
            if changed != 1 {
                return Err("跨日结束时任务状态已变化，未提交本批修改。".into());
            }
            tx.execute(
                "INSERT INTO end_reminders(record_id) VALUES(?1) ON CONFLICT(record_id) DO NOTHING",
                [id],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        if active_id.is_some_and(|id| ids.contains(&id)) {
            self.segment = None;
            self.monitor.record_ended(now);
        }
        if self
            .monitor
            .candidate
            .as_ref()
            .is_some_and(|c| expired_rules.contains(&c.rule_id))
        {
            self.monitor.candidate = None;
            self.monitor.status.start_candidate = None;
        }
        if let Some(rule) = self
            .monitor
            .page
            .as_ref()
            .and_then(|p| p.rule_id)
            .filter(|rule| expired_rules.contains(rule))
        {
            self.monitor.status.finished_page_rule = Some(rule);
        }
        Ok(ids.len())
    }
}

```

## NEW FILE — E:\WorkMemo\src-tauri\src\day_rollover_tests.rs

```rust

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
    store.connection.execute_batch("DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; PRAGMA user_version=10; UPDATE sqlite_sequence SET seq=999 WHERE name='work_records';").unwrap();
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
    store.connection.execute_batch("DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; PRAGMA user_version=10; CREATE TABLE paused_records_by_day(marker TEXT); INSERT INTO paused_records_by_day VALUES('keep');").unwrap();
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

```

## UPDATE — E:\WorkMemo\src-tauri\src\database.rs

```rust

use crate::clock::{Clock, TimePoint};
use crate::monitor::{MonitorStatus, Runtime};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::{fs::File, path::Path, time::Duration};
static NEXT_CLOCK_SESSION: AtomicU64 = AtomicU64::new(0);

pub type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Debug, Serialize)]
pub struct WorkRecord {
    pub id: i64,
    pub task_name: Option<String>,
    pub category: String,
    pub quantity: Option<f64>,
    pub remark: String,
    /// Unix milliseconds; durations use the independent monotonic clock.
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub duration_seconds: i64,
    pub duration_ms: i64,
    pub status: String,
    pub is_paused: bool,
    pub recovery_pending: bool,
    pub settlement_status: String,
    pub source: String,
    pub pause_reason: Option<String>,
    pub confirmed_end_time: Option<i64>,
    pub last_input_time: Option<i64>,
    pub end_reason: Option<String>,
    pub legacy_duration_ms: i64,
    pub revision: i64,
    pub control_mode: String,
}

#[derive(Debug, Deserialize)]
pub struct StartInput {
    pub category: String,
    pub quantity: Option<f64>,
    pub remark: String,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub active: Option<WorkRecord>,
    pub recent_records: Vec<WorkRecord>,
    pub warning: Option<String>,
    pub pending_count: i64,
    pub monitoring: MonitorStatus,
}

struct Segment {
    id: i64,
    row_id: i64,
    base_ms: i64,
    started_ticks: i64,
    started_wall: i64,
}

pub struct Store {
    pub(crate) sounds: crate::sound::Tracker,
    pub(crate) sound_config: Option<std::path::PathBuf>,
    connection: Connection,
    clock: Box<dyn Clock>,
    segment: Option<Segment>,
    pub warning: Option<String>,
    // Keep the Windows share-mode lock alive for the entire database session.
    _instance_lock: Option<File>,
    clock_session: String,
    pub(crate) monitor: Runtime,
}

const COLUMNS: &str = "id, category, quantity, remark, start_time, end_time,
    duration_seconds, duration_ms, status, is_paused, recovery_pending,
    settlement_status, source, pause_reason, confirmed_end_time, last_input_time,
    end_reason, legacy_duration_ms, revision, control_mode,
    (SELECT name FROM work_tasks WHERE current_record_id=work_records.id ORDER BY id DESC LIMIT 1) AS task_name";

fn db_error(error: rusqlite::Error) -> String {
    format!("本地数据读写失败：{error}")
}

fn read_record(row: &rusqlite::Row<'_>) -> rusqlite::Result<WorkRecord> {
    Ok(WorkRecord {
        id: row.get(0)?,
        task_name: row.get(20)?,
        category: row.get(1)?,
        quantity: row.get(2)?,
        remark: row.get(3)?,
        start_time: row.get(4)?,
        end_time: row.get(5)?,
        duration_seconds: row.get(6)?,
        duration_ms: row.get(7)?,
        status: row.get(8)?,
        is_paused: row.get(9)?,
        recovery_pending: row.get(10)?,
        settlement_status: row.get(11)?,
        source: row.get(12)?,
        pause_reason: row.get(13)?,
        confirmed_end_time: row.get(14)?,
        last_input_time: row.get(15)?,
        end_reason: row.get(16)?,
        legacy_duration_ms: row.get(17)?,
        revision: row.get(18)?,
        control_mode: row.get(19)?,
    })
}

impl Store {
    pub fn open(path: &Path, clock: Box<dyn Clock>) -> Result<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| format!("无法创建数据目录：{e}"))?;
        }
        #[cfg(windows)]
        let instance_lock = {
            use std::os::windows::fs::OpenOptionsExt;
            Some(
                std::fs::OpenOptions::new()
                    .read(true)
                    .write(true)
                    .create(true)
                    .truncate(false)
                    .share_mode(0)
                    .open(path.with_extension("lock"))
                    .map_err(|e| {
                        format!("无法打开数据锁；请确认没有其他 WorkMemo 窗口正在使用数据：{e}")
                    })?,
            )
        };
        #[cfg(not(windows))]
        let instance_lock = None;
        let connection = Connection::open(path).map_err(db_error)?;
        Self::initialize(connection, clock, instance_lock)
    }

    fn initialize(
        mut connection: Connection,
        clock: Box<dyn Clock>,
        lock: Option<File>,
    ) -> Result<Self> {
        connection
            .busy_timeout(Duration::from_secs(2))
            .map_err(db_error)?;
        connection
            .execute_batch(
                "PRAGMA foreign_keys=OFF; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;",
            )
            .map_err(db_error)?;
        let tx = connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let version: i64 = tx
            .pragma_query_value(None, "user_version", |r| r.get(0))
            .map_err(db_error)?;
        match version {
            0 => {
                tx.execute_batch(include_str!("../migrations/001_initial.sql"))
                    .map_err(db_error)?;
            }
            1..=11 => {}
            _ => return Err("数据库来自较新版本，请使用较新版本的 WorkMemo；未修改数据。".into()),
        }
        if version < 2 {
            tx.execute_batch(include_str!("../migrations/002_settlement.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 2)
                .map_err(db_error)?;
        }
        if version < 3 {
            tx.execute_batch(include_str!("../migrations/003_monitoring.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 3)
                .map_err(db_error)?;
        }
        if version < 4 {
            tx.execute_batch(include_str!("../migrations/004_tracking_times.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 4)
                .map_err(db_error)?;
        }
        if version < 5 {
            tx.execute_batch(include_str!("../migrations/005_monitor_options.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 5)
                .map_err(db_error)?;
        }
        if version < 6 {
            tx.execute_batch(include_str!("../migrations/006_import_sources.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 6)
                .map_err(db_error)?;
        }
        if version < 7 {
            tx.execute_batch(include_str!("../migrations/007_dashboard_intent.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 7)
                .map_err(db_error)?;
        }
        if version < 8 {
            tx.execute_batch(include_str!("../migrations/008_url_matching.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 8)
                .map_err(db_error)?;
        }
        if version < 9 {
            tx.execute_batch(include_str!("../migrations/009_idle_categories.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 9)
                .map_err(db_error)?;
        }
        if version < 10 {
            tx.execute_batch(include_str!("../migrations/010_page_tasks.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 10)
                .map_err(db_error)?;
        }
        if version < 11 {
            tx.execute_batch(include_str!("../migrations/011_pause_day.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 11)
                .map_err(db_error)?;
        }
        let invalid: Option<String> = tx
            .query_row(
                "SELECT [table] FROM pragma_foreign_key_check LIMIT 1",
                [],
                |r| r.get(0),
            )
            .optional()
            .map_err(db_error)?;
        if invalid.is_some() {
            return Err("数据库关联校验失败，迁移未提交。".into());
        }
        // Never infer work while the application was closed from wall-clock time.
        tx.execute("UPDATE work_segments SET state='RECOVERED',end_time=checkpoint_time WHERE state='OPEN'", [])
            .map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET paused_at=COALESCE(paused_at,
                (SELECT checkpoint_time FROM work_segments WHERE record_id=work_records.id ORDER BY id DESC LIMIT 1),
                last_input_time,start_time),is_paused=1, recovery_pending=1,
             pause_reason=COALESCE(pause_reason,'RECOVERY') WHERE status IN ('WORKING','SUSPENDED')",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        connection
            .pragma_update(None, "foreign_keys", true)
            .map_err(db_error)?;
        let now = clock.now();
        let mut store = Self {
            sounds: crate::sound::Tracker::default(),
            sound_config: None,
            connection,
            clock,
            segment: None,
            warning: None,
            _instance_lock: lock,
            clock_session: format!(
                "{}:{}:{}:{}",
                std::process::id(),
                now.wall_ms,
                now.ticks_ms,
                NEXT_CLOCK_SESSION.fetch_add(1, Ordering::Relaxed)
            ),
            monitor: Runtime::default(),
        };
        store.monitor.config = store.monitor_config()?;
        store.category_names()?;
        Ok(store)
    }

    pub fn active(&self) -> Result<Option<WorkRecord>> {
        self.connection
            .query_row(
                &format!("SELECT {COLUMNS} FROM work_records WHERE status='WORKING'"),
                [],
                read_record,
            )
            .optional()
            .map_err(db_error)
    }

    fn record(&self, id: i64) -> Result<WorkRecord> {
        self.connection
            .query_row(
                &format!("SELECT {COLUMNS} FROM work_records WHERE id=?1"),
                [id],
                read_record,
            )
            .optional()
            .map_err(db_error)?
            .ok_or_else(|| "找不到这条工作记录，请刷新后重试。".into())
    }

    fn current(&self, id: i64) -> Result<WorkRecord> {
        let record = self.active()?.ok_or("当前没有活动任务。")?;
        if record.id != id {
            return Err("当前任务已变更，请刷新后重试。".into());
        }
        Ok(record)
    }

    fn elapsed(&self, record: &WorkRecord, now: TimePoint) -> Result<i64> {
        if record.is_paused {
            return Ok(record.duration_ms);
        }
        let segment = self
            .segment
            .as_ref()
            .filter(|s| s.id == record.id)
            .ok_or("计时状态不一致，请重新打开应用恢复任务。")?;
        Ok(segment
            .base_ms
            .saturating_add(now.ticks_ms.saturating_sub(segment.started_ticks).max(0)))
    }

    pub fn checkpoint(&mut self) -> Result<()> {
        if self.segment.is_none() {
            return Ok(());
        }
        let record = self.active()?.ok_or("活动任务丢失，请重新打开应用。")?;
        self.save_running(&record, None)
    }

    fn save_running(&mut self, record: &WorkRecord, pause_reason: Option<&str>) -> Result<()> {
        let now = self.clock.now();
        let duration = self.elapsed(record, now)?;
        let tx = self.connection.transaction().map_err(db_error)?;
        write_segment(
            &tx,
            self.segment.as_ref(),
            record.id,
            duration,
            pause_reason.is_some(),
        )?;
        let changed = tx.execute(
            "UPDATE work_records SET duration_ms=?1, duration_seconds=?2 WHERE id=?3 AND status='WORKING' AND is_paused=0",
            params![duration, duration / 1000, record.id],
        ).map_err(db_error)?;
        if changed != 1 {
            return Err("计时保存失败，任务状态已变更。".into());
        }
        if let Some(reason) = pause_reason {
            tx.execute(
                "UPDATE work_records SET is_paused=1,pause_reason=?1,paused_at=COALESCE(paused_at,?3) WHERE id=?2",
                params![reason, record.id,now.wall_ms.max(0)],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        Ok(())
    }

    pub fn snapshot(&mut self) -> Result<Snapshot> {
        self.expire_previous_day_pauses()?;
        self.checkpoint()?;
        let active = self.active()?;
        let mut statement = self.connection.prepare(
            &format!("SELECT {COLUMNS} FROM work_records WHERE status='FINISHED' AND is_demo=0 ORDER BY id DESC LIMIT 5")
        ).map_err(db_error)?;
        let recent_records = statement
            .query_map([], read_record)
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)?;
        Ok(Snapshot {
            active,
            recent_records,
            warning: self.warning.clone(),
            pending_count: self.connection.query_row(
                "SELECT COUNT(*) FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING' AND is_demo=0", [], |r| r.get(0)
            ).map_err(db_error)?,
            monitoring: self.monitor.status.clone(),
        })
    }

    pub fn start_checked(
        &mut self,
        input: StartInput,
        expected_active_id: Option<i64>,
    ) -> Result<()> {
        self.expire_previous_day_pauses()?;
        if self.active()?.map(|record| record.id) != expected_active_id {
            return Err("当前任务已变化，请刷新后重新确认。".into());
        }
        self.start(input)
    }

    pub fn start(&mut self, input: StartInput) -> Result<()> {
        if self.monitor.active && !self.monitor.status.native_available {
            return Err("当前无法确认系统活动状态，暂不能开始计时；已有记录保持保存。".into());
        }
        self.start_at(input, "MANUAL_START", self.clock.now(), true)
    }

    fn start_at(
        &mut self,
        input: StartInput,
        source: &str,
        now: TimePoint,
        allow_switch: bool,
    ) -> Result<()> {
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if input
            .quantity
            .is_some_and(|quantity| !valid_quantity(quantity))
        {
            return Err("工作量必须为 0 到 10 亿之间的有限数值。".into());
        }
        let remark = input.remark.trim();
        if remark.chars().count() > 2000 {
            return Err("备注不能超过 2000 个字符。".into());
        }
        let previous = self.active()?;
        if previous
            .as_ref()
            .is_some_and(|r| !r.is_paused || !allow_switch)
        {
            return Err("请先暂停或结束当前任务。".into());
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        if let Some(previous) = previous {
            finish_row(&tx, previous.id, previous.start_time, now.wall_ms, "SWITCH")?;
        }
        tx.execute("INSERT INTO work_records(category, quantity, remark, start_time, status, is_paused,settlement_status,source,control_mode,last_input_time) VALUES(?1,?2,?3,?4,'WORKING',0,'IN_PROGRESS',?5,?6,?4)",
            params![input.category, input.quantity, remark, now.wall_ms,source,if source=="AUTO"{"AUTO"}else{"MANUAL"}]).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        if source == "MANUAL_START" {
            tx.execute(
                "INSERT INTO work_tasks(name,category,current_record_id) VALUES(?1,?2,?3)",
                params![format!("{} #{}", input.category, id), input.category, id],
            )
            .map_err(db_error)?;
        }
        let row_id = insert_segment(&tx, id, now.wall_ms, &self.clock_session, now.ticks_ms)?;
        tx.execute(
            "UPDATE monitoring_settings SET browsing_only=0 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: 0,
            started_ticks: now.ticks_ms,
            started_wall: now.wall_ms,
        });
        self.warning = None;
        self.monitor.record_changed(id, now);
        Ok(())
    }

    pub fn pause(&mut self, id: i64) -> Result<()> {
        self.expire_previous_day_pauses()?;
        let record = self.current(id)?;
        if record.is_paused {
            self.connection
                .execute(
                    "UPDATE work_records SET pause_reason='MANUAL' WHERE id=?1",
                    [id],
                )
                .map_err(db_error)?;
            self.monitor.input_floor = self.clock.now().ticks_ms;
            self.monitor.status.idle_warning = false;
            return Ok(());
        }
        self.pause_with_reason(id, "MANUAL")?;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        Ok(())
    }

    fn pause_with_reason(&mut self, id: i64, reason: &str) -> Result<()> {
        let record = self.current(id)?;
        if record.is_paused {
            return Ok(());
        }
        self.save_running(&record, Some(reason))?;
        self.segment = None;
        self.warning = None;
        self.monitor.status.idle_warning = false;
        Ok(())
    }

    pub fn resume(&mut self, id: i64) -> Result<()> {
        if self.monitor.active && !self.monitor.status.native_available {
            return Err("当前无法确认系统活动状态，暂不能继续计时。".into());
        }
        let record = self.current(id)?;
        let mode = if record.control_mode == "AUTO" {
            "AUTO"
        } else {
            "MANUAL"
        };
        self.resume_at(id, self.clock.now(), mode)
    }
    fn resume_at(&mut self, id: i64, now: TimePoint, mode: &str) -> Result<()> {
        self.expire_previous_day_pauses()?;
        let record = self.current(id)?;
        if !record.is_paused {
            return Ok(());
        }
        let tx = self.connection.transaction().map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET is_paused=0, recovery_pending=0,pause_reason=NULL,paused_at=NULL,control_mode=?2,last_input_time=?3 WHERE id=?1",
            params![id,mode,now.wall_ms],
        )
        .map_err(db_error)?;
        // A wall-clock rollback must not make new intervals overlap old intervals.
        let previous_end: Option<i64> = tx
            .query_row(
                "SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?1",
                [id],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        let started_wall = now
            .wall_ms
            .max(record.start_time)
            .max(previous_end.unwrap_or(0));
        let row_id = insert_segment(&tx, id, started_wall, &self.clock_session, now.ticks_ms)?;
        tx.execute(
            "UPDATE monitoring_settings SET browsing_only=0 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: record.duration_ms,
            started_ticks: now.ticks_ms,
            started_wall,
        });
        self.warning = None;
        self.monitor.record_changed(id, now);
        Ok(())
    }

    pub fn finish(&mut self, id: i64) -> Result<()> {
        if self.record(id)?.status == "FINISHED" {
            return Ok(());
        }
        let record = self.current(id)?;
        let now = self.clock.now();
        let duration = self.elapsed(&record, now)?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if !record.is_paused {
            write_segment(&tx, self.segment.as_ref(), id, duration, true)?;
        }
        tx.execute(
            "UPDATE work_records SET duration_ms=?1,duration_seconds=?2 WHERE id=?3",
            params![duration, duration / 1000, id],
        )
        .map_err(db_error)?;
        finish_row(&tx, id, record.start_time, now.wall_ms, "MANUAL")?;
        tx.commit().map_err(db_error)?;
        self.segment = None;
        self.warning = None;
        self.monitor.record_ended(now);
        Ok(())
    }

    pub fn pause_for_close(&mut self) -> Result<()> {
        if let Some(record) = self.active()? {
            self.pause_with_reason(record.id, "APP_CLOSE")?;
        }
        Ok(())
    }
}

fn valid_quantity(quantity: f64) -> bool {
    quantity.is_finite() && (0.0..=1_000_000_000.0).contains(&quantity)
}

fn insert_segment(
    tx: &rusqlite::Transaction<'_>,
    record_id: i64,
    start: i64,
    session: &str,
    ticks: i64,
) -> Result<i64> {
    tx.execute("INSERT INTO work_segments(record_id,start_time,checkpoint_time,state,clock_session,start_ticks_ms,end_ticks_ms) VALUES(?1,?2,?2,'OPEN',?3,?4,?4)",params![record_id,start,session,ticks]).map_err(db_error)?;
    Ok(tx.last_insert_rowid())
}

fn write_segment(
    tx: &rusqlite::Transaction<'_>,
    segment: Option<&Segment>,
    id: i64,
    total: i64,
    close: bool,
) -> Result<()> {
    let segment = segment
        .filter(|s| s.id == id)
        .ok_or("计时区间不一致，请重新打开应用恢复任务。")?;
    let duration = total.saturating_sub(segment.base_ms);
    let checkpoint = segment
        .started_wall
        .checked_add(duration)
        .ok_or("计时数值超出范围。")?;
    let changed = tx
        .execute(
            "UPDATE work_segments SET duration_ms=?1,checkpoint_time=?2,
        end_time=CASE WHEN ?3 THEN ?2 ELSE NULL END,state=CASE WHEN ?3 THEN 'CLOSED' ELSE 'OPEN' END,end_ticks_ms=?6
        WHERE id=?4 AND record_id=?5 AND state='OPEN'",
            params![duration, checkpoint, close, segment.row_id, id,segment.started_ticks.saturating_add(duration)],
        )
        .map_err(db_error)?;
    if changed != 1 {
        return Err("计时区间保存失败，未修改任务。".into());
    }
    Ok(())
}

fn finish_row(
    tx: &rusqlite::Transaction<'_>,
    id: i64,
    start: i64,
    confirmed: i64,
    reason: &str,
) -> Result<()> {
    let confirmed = confirmed.max(0);
    tx.execute("UPDATE work_records SET status='FINISHED',is_paused=1,recovery_pending=0,pause_reason=NULL,paused_at=NULL,
        settlement_status='PENDING',confirmed_end_time=?1,end_reason=?2,
        end_time=MAX(?3,COALESCE((SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?4 AND duration_ms>0),CASE WHEN legacy_duration_ms>0 THEN ?1 ELSE ?3 END)) WHERE id=?4 AND status='WORKING'",
        params![confirmed,reason,start,id]).map_err(db_error)?;
    tx.execute(
        "INSERT INTO end_reminders(record_id) VALUES(?1) ON CONFLICT(record_id) DO NOTHING",
        [id],
    )
    .map_err(db_error)?;
    Ok(())
}

#[cfg(test)]
#[path = "database_tests.rs"]
mod tests;

#[path = "history.rs"]
mod history;
pub use history::{HistoryPage, HistoryQuery};

#[path = "settlement.rs"]
mod settlement;
pub use settlement::SettleInput;

#[cfg(test)]
#[path = "settlement_tests.rs"]
mod settlement_tests;

#[path = "day_rollover.rs"]
mod day_rollover;
#[path = "tracking.rs"]
mod tracking;
pub use tracking::Notice;
#[path = "page_tasks.rs"]
mod page_tasks;
pub use page_tasks::{BindPageInput, IgnoredPage, PageTask, RebindPageInput};
#[cfg(test)]
#[path = "tracking_tests.rs"]
mod tracking_tests;

#[cfg(test)]
#[path = "reliability_tests.rs"]
mod reliability_tests;

#[path = "data_center.rs"]
pub mod data_center;

#[path = "data_tools.rs"]
pub mod data_tools;

#[path = "categories.rs"]
pub mod categories;

```

## UPDATE — E:\WorkMemo\src-tauri\src\tracking.rs

```rust

use super::*;
use crate::monitor::*;
use serde::Serialize;
use std::collections::HashSet;

#[derive(Clone, Debug, Serialize)]
pub struct Notice {
    pub kind: String,
    pub record: WorkRecord,
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
}

impl Store {
    pub(super) fn switch_page_task(&mut self, rule_id: Option<i64>, now: TimePoint) -> Result<()> {
        let target: Option<(i64, String, Option<i64>)> = if let Some(rule_id) = rule_id {
            self.connection.query_row(
                "SELECT t.id,t.category,t.current_record_id FROM work_urls u JOIN work_tasks t ON t.id=u.task_id WHERE u.id=?1",
                [rule_id], |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
            ).optional().map_err(db_error)?
        } else {
            None
        };
        let changed_rule = rule_id != self.monitor.active_rule_id;
        self.switch_resolved_task(target, now, false, changed_rule, rule_id)
    }
    pub(super) fn switch_to_named_task(&mut self, task_id: i64) -> Result<()> {
        if self.monitor.active && !self.monitor.status.native_available {
            return Err("无法确认系统状态，暂不能切换任务。".into());
        }
        let target = self
            .connection
            .query_row(
                "SELECT id,category,current_record_id FROM work_tasks WHERE id=?1",
                [task_id],
                |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
            )
            .optional()
            .map_err(db_error)?
            .ok_or("任务已变化，请刷新。")?;
        self.switch_resolved_task(Some(target), self.clock.now(), true, false, None)
    }
    fn switch_resolved_task(
        &mut self,
        mut target: Option<(i64, String, Option<i64>)>,
        now: TimePoint,
        explicit: bool,
        changed_rule: bool,
        rule_id: Option<i64>,
    ) -> Result<()> {
        self.expire_previous_day_pauses()?;
        let current = self.active()?;
        if !explicit
            && current
                .as_ref()
                .is_some_and(|r| r.recovery_pending || r.pause_reason.as_deref() == Some("MANUAL"))
        {
            return Ok(());
        }
        if let Some((_, _, Some(id))) = &target {
            if current
                .as_ref()
                .is_some_and(|r| r.id == *id && !r.is_paused && !changed_rule)
            {
                return Ok(());
            }
            let record = self.record(*id)?;
            if record.status == "FINISHED" {
                if explicit {
                    return Err("任务已结束，请选择其他任务。".into());
                } else {
                    target = None
                }
            } else if (record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL"))
                && !explicit
            {
                target = None;
            }
        }
        if current.is_none() && target.is_none() {
            return Ok(());
        }
        let duration = current.as_ref().map(|r| self.elapsed(r, now)).transpose()?;
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        if let (Some(old), Some(total)) = (&current, duration) {
            if !old.is_paused {
                write_segment(&tx, self.segment.as_ref(), old.id, total, true)?;
            }
            tx.execute("UPDATE work_records SET status='SUSPENDED',is_paused=1,paused_at=COALESCE(paused_at,?4),pause_reason=CASE WHEN pause_reason='MANUAL' THEN 'MANUAL' ELSE 'AWAY' END,duration_ms=?2,duration_seconds=?3 WHERE id=?1 AND status='WORKING'",
                params![old.id,total,total/1000,now.wall_ms.max(0)]).map_err(db_error)?;
            let linked: i64 = tx
                .query_row(
                    "SELECT COUNT(*) FROM work_tasks WHERE current_record_id=?1",
                    [old.id],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            if linked == 0 {
                tx.execute(
                    "INSERT INTO work_tasks(name,category,current_record_id) VALUES(?1,?2,?3)",
                    params![
                        format!("{} #{}", old.category, old.id),
                        old.category,
                        old.id
                    ],
                )
                .map_err(db_error)?;
            }
        }
        let preceding_end: Option<i64> = current
            .as_ref()
            .map(|old| {
                tx.query_row(
                    "SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?1",
                    [old.id],
                    |r| r.get(0),
                )
                .map_err(db_error)
            })
            .transpose()?
            .flatten();
        let mut next_segment = None;
        let mut next_id = None;
        if let Some((task_id, category, linked_id)) = target {
            let id = if let Some(id) = linked_id {
                tx.execute("UPDATE work_records SET status='WORKING',is_paused=0,recovery_pending=0,pause_reason=NULL,paused_at=NULL,control_mode=CASE WHEN ?3 THEN control_mode ELSE 'AUTO' END,last_input_time=?2 WHERE id=?1 AND status IN ('SUSPENDED','WORKING')",params![id,now.wall_ms,explicit]).map_err(db_error)?;
                id
            } else {
                tx.execute("INSERT INTO work_records(category,quantity,remark,start_time,status,is_paused,settlement_status,source,control_mode,last_input_time) VALUES(?1,NULL,'',?2,'WORKING',0,'IN_PROGRESS','AUTO','AUTO',?2)",params![category,now.wall_ms]).map_err(db_error)?;
                let id = tx.last_insert_rowid();
                tx.execute(
                    "UPDATE work_tasks SET current_record_id=?1 WHERE id=?2",
                    params![id, task_id],
                )
                .map_err(db_error)?;
                id
            };
            let previous_end: Option<i64> = tx
                .query_row(
                    "SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?1",
                    [id],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            let start = now
                .wall_ms
                .max(previous_end.unwrap_or(0))
                .max(preceding_end.unwrap_or(0));
            let base: i64 = tx
                .query_row(
                    "SELECT duration_ms FROM work_records WHERE id=?1",
                    [id],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            let row_id = insert_segment(&tx, id, start, &self.clock_session, now.ticks_ms)?;
            next_segment = Some(Segment {
                id,
                row_id,
                base_ms: base,
                started_ticks: now.ticks_ms,
                started_wall: start,
            });
            next_id = Some(id);
        }
        tx.commit().map_err(db_error)?;
        self.segment = next_segment;
        if let Some(id) = next_id {
            self.monitor.record_changed(id, now);
            self.monitor.active_rule_id = rule_id;
        } else {
            self.monitor.record_ended(now)
        }
        Ok(())
    }

    pub fn monitor_config(&self) -> Result<MonitorConfig> {
        let (enabled, revision, times, poll_interval_seconds, auto_resume_manual, browsing_only) = self
            .connection
            .query_row(
                "SELECT enabled,revision,idle_warning_seconds,idle_end_seconds,away_pause_seconds,hold_seconds,poll_interval_seconds,auto_resume_manual,browsing_only,idle_pause_seconds FROM monitoring_settings WHERE id=1",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, TrackingTimes { idle_pause_seconds: r.get(9)?, idle_warning_seconds: r.get(2)?, idle_end_seconds: r.get(3)?, away_pause_seconds: r.get(4)?, hold_seconds: r.get(5)? }, r.get(6)?, r.get(7)?, r.get(8)?)),
            )
            .map_err(db_error)?;
        let mut statement = self
            .connection
            .prepare("SELECT id,url_prefix,category,match_mode FROM work_urls ORDER BY id")
            .map_err(db_error)?;
        let rules = statement
            .query_map([], |r| {
                Ok(WorkUrl {
                    id: r.get(0)?,
                    url_prefix: r.get(1)?,
                    category: r.get(2)?,
                    match_mode: r.get(3)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)?;
        times.validate()?;
        if !(1..=5).contains(&poll_interval_seconds) {
            return Err("检测间隔必须为 1 到 5 秒。".into());
        }
        Ok(MonitorConfig {
            browsing_only,
            poll_interval_seconds,
            auto_resume_manual,
            times,
            enabled,
            revision,
            rules,
        })
    }

    pub fn save_monitor_config(&mut self, input: ConfigInput) -> Result<MonitorConfig> {
        input.times.validate()?;
        if !(1..=5).contains(&input.poll_interval_seconds) {
            return Err("检测间隔必须为 1 到 5 秒。".into());
        }
        if input.rules.len() > 50 {
            return Err("最多配置 50 条工作 URL。".into());
        }
        let mut seen = HashSet::new();
        let mut rules = Vec::new();
        for rule in input.rules {
            let prefix = normalize_rule(&rule.url_prefix, &rule.match_mode)?;
            if !seen.insert((rule.match_mode.clone(), prefix.clone())) {
                return Err("工作 URL 重复，请合并重复规则。".into());
            }
            if !["评测", "质检", "开发", "文档"].contains(&rule.category.as_str()) {
                return Err("请选择有效的工作类别。".into());
            }
            rules.push((prefix, rule.category, rule.match_mode));
        }
        let current = self.monitor_config()?;
        let mut old_bindings = std::collections::HashMap::new();
        {
            let mut stmt = self
                .connection
                .prepare("SELECT u.match_mode,u.url_prefix,u.task_id,t.category FROM work_urls u LEFT JOIN work_tasks t ON t.id=u.task_id")
                .map_err(db_error)?;
            for row in stmt
                .query_map([], |r| {
                    Ok((
                        r.get::<_, String>(0)?,
                        r.get::<_, String>(1)?,
                        r.get::<_, Option<i64>>(2)?,
                        r.get::<_, Option<String>>(3)?,
                    ))
                })
                .map_err(db_error)?
            {
                let (mode, url, task, task_category) = row.map_err(db_error)?;
                old_bindings.insert((mode, url), (task, task_category));
            }
        }
        if input.expected_revision != current.revision {
            return Err("监测配置已变化，请重新读取。".into());
        }
        let now = self.clock.now();
        let active = self.active()?.filter(|r| {
            r.control_mode == "AUTO"
                && !r.recovery_pending
                && r.pause_reason.as_deref() != Some("MANUAL")
        });
        let duration = active.as_ref().map(|r| self.elapsed(r, now)).transpose()?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if let (Some(record), Some(duration)) = (&active, duration) {
            if !record.is_paused {
                write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
            }
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,paused_at=COALESCE(paused_at,?6),pause_reason=?3,control_mode=?4 WHERE id=?5",
                params![duration,duration/1000,if input.enabled{"MONITOR"}else{"MANUAL"},if input.enabled{"AUTO"}else{"MANUAL"},record.id,now.wall_ms.max(0)]).map_err(db_error)?;
        }
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for (prefix, category, mode) in rules {
            let task_id =
                old_bindings
                    .get(&(mode.clone(), prefix.clone()))
                    .and_then(|(id, old_category)| {
                        (old_category.as_deref() == Some(category.as_str()))
                            .then_some(*id)
                            .flatten()
                    });
            let task_id = if let Some(id) = task_id {
                id
            } else {
                tx.query_row(
                    "SELECT id FROM work_tasks WHERE category=?1 ORDER BY id LIMIT 1",
                    [&category],
                    |r| r.get(0),
                )
                .map_err(db_error)?
            };
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES(?1,?2,?3,?4)",
                params![prefix, category, mode, task_id],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET enabled=?1,revision=revision+1,idle_warning_seconds=?2,idle_end_seconds=?3,away_pause_seconds=?4,hold_seconds=?5,poll_interval_seconds=?6,auto_resume_manual=?7,idle_pause_seconds=?8 WHERE id=1",
            params![input.enabled,input.times.idle_warning_seconds,input.times.idle_end_seconds,input.times.away_pause_seconds,input.times.hold_seconds,input.poll_interval_seconds,input.auto_resume_manual,input.times.idle_pause_seconds],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        if active.is_some() {
            self.segment = None;
            self.monitor.monitor_pause_since = Some(now.ticks_ms);
        }
        self.monitor.config = self.monitor_config()?;
        self.monitor.status.idle_pause_seconds = self.monitor.config.times.idle_pause_seconds;
        self.monitor.status.idle_warning_seconds = self.monitor.config.times.idle_warning_seconds;
        self.monitor.status.idle_end_seconds = self.monitor.config.times.idle_end_seconds;
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.away_since = None;
        self.monitor.status.away_pause_remaining_seconds = None;
        self.monitor.input_floor = now.ticks_ms;
        Ok(self.monitor.config.clone())
    }

    pub fn activate_monitoring(&mut self) {
        self.monitor.active = true;
        self.monitor.status.browsing_only = self.monitor.config.browsing_only;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.idle_pause_seconds = self.monitor.config.times.idle_pause_seconds;
        self.monitor.status.idle_warning_seconds = self.monitor.config.times.idle_warning_seconds;
        self.monitor.status.idle_end_seconds = self.monitor.config.times.idle_end_seconds;
    }

    pub fn observe_page(&mut self, page: PageSample) {
        if page.ready && page.revision == self.monitor.config.revision {
            self.monitor.last_trusted_page = Some(page.at.ticks_ms);
        }
        self.monitor.page = Some(page);
    }

    pub fn monitor_sample_due(&self, now: i64) -> bool {
        self.monitor.page_activity_at.is_some()
            || self.monitor.native.is_none_or(|sample| {
                now.saturating_sub(sample.at.ticks_ms)
                    >= self.monitor.config.poll_interval_seconds * 1000
            })
            || self.monitor.last_input.is_some_and(|last| {
                [
                    self.monitor.config.times.idle_pause_seconds * 1000,
                    self.monitor.config.times.idle_warning_seconds * 1000,
                    self.monitor.config.times.idle_end_seconds * 1000,
                ]
                .iter()
                .any(|threshold| {
                    now >= last + threshold
                        && self
                            .monitor
                            .native
                            .is_none_or(|s| s.at.ticks_ms < last + threshold)
                })
            })
    }

    pub fn observe_browser_page(&mut self, client: u64, page: PageSample) {
        // A background Chrome profile cannot overwrite the focused profile.
        if page.focused
            || self.monitor.browser_owner.is_none()
            || self.monitor.browser_owner == Some(client)
        {
            self.monitor.browser_owner = Some(client);
            self.observe_page(page);
        }
    }

    pub fn observe_browser_activity(&mut self, client: u64) {
        if self.monitor.browser_owner == Some(client) {
            if let Some(page) = self.monitor.page.as_ref().filter(|p| {
                p.focused
                    && p.ready
                    && p.rule_id.is_some()
                    && p.revision == self.monitor.config.revision
            }) {
                self.monitor.page_activity_at = Some(page.at.ticks_ms);
            }
        }
    }

    // Close/trim current-process intervals at a trusted monotonic boundary.
    // Old sessions and legacy baselines are never reconstructed from wall time.
    fn close_at(
        &mut self,
        cutoff: i64,
        reason: &str,
        finish: bool,
        confirmed: TimePoint,
    ) -> Result<()> {
        let Some(record) = self.active()? else {
            return Ok(());
        };
        if record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL") {
            return Ok(());
        }
        if finish {
            self.monitor.status.idle_warning = false;
        }
        let duration = self.elapsed(&record, confirmed)?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if !record.is_paused {
            write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
        }
        tx.execute(
            "UPDATE work_segments SET duration_ms=MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            checkpoint_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_ticks_ms=start_ticks_ms+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),state='CLOSED'
            WHERE record_id=?2 AND clock_session=?3 AND start_ticks_ms IS NOT NULL",
            params![cutoff, record.id, self.clock_session],
        )
        .map_err(db_error)?;
        let total:i64=tx.query_row("SELECT legacy_duration_ms+COALESCE((SELECT SUM(duration_ms) FROM work_segments WHERE record_id=?1),0) FROM work_records WHERE id=?1",[record.id],|r|r.get(0)).map_err(db_error)?;
        let paused_wall = confirmed
            .wall_ms
            .saturating_sub(confirmed.ticks_ms.saturating_sub(cutoff))
            .max(0);
        tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3,paused_at=CASE WHEN ?5 THEN NULL ELSE COALESCE(paused_at,?6) END WHERE id=?4",params![total,total/1000,if finish{None}else{Some(reason)},record.id,finish,paused_wall]).map_err(db_error)?;
        if finish {
            finish_row(&tx, record.id, record.start_time, confirmed.wall_ms, reason)?;
        }
        tx.commit().map_err(db_error)?;
        self.segment = None;
        if finish {
            self.monitor.record_ended(confirmed);
            self.monitor.input_floor = cutoff;
        }
        self.expire_previous_day_pauses()?;
        Ok(())
    }

    fn tracking_deadlines(&self, last: Option<i64>) -> Vec<(i64, u8, &'static str, i64)> {
        let times = &self.monitor.config.times;
        let mut deadlines = Vec::new();
        if let Some(last) = last {
            deadlines.push((
                last.saturating_add(times.idle_end_seconds * 1000),
                0,
                "IDLE",
                last,
            ));
        }
        if let Some(away) = self.monitor.away_since {
            deadlines.push((
                away.saturating_add((times.away_pause_seconds + times.hold_seconds) * 1000),
                1,
                "AWAY",
                away.saturating_add(times.away_pause_seconds * 1000),
            ));
        }
        if let Some(pause) = self.monitor.monitor_pause_since {
            deadlines.push((
                pause.saturating_add(times.hold_seconds * 1000),
                2,
                "RECOVERY",
                pause,
            ));
        }
        deadlines.sort_by_key(|d| (d.0, d.1));
        deadlines
    }

    pub fn system_unavailable(&mut self, at: TimePoint) -> Result<()> {
        self.close_at(at.ticks_ms, "MONITOR", false, self.clock.now())?;
        self.monitor.monitor_pause_since.get_or_insert(at.ticks_ms);
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.idle_warning = false;
        Ok(())
    }

    pub fn monitor_tick(&mut self, sample: NativeSample, now: TimePoint) -> Result<()> {
        self.expire_previous_day_pauses()?;
        if !self.monitor.active {
            return Ok(());
        }
        let last_tick = self.monitor.last_tick.replace(now.ticks_ms);
        if let Some(last) = last_tick.filter(|last| now.ticks_ms.saturating_sub(*last) > 10_000) {
            self.system_unavailable(TimePoint {
                ticks_ms: last,
                wall_ms: now.wall_ms.saturating_sub(now.ticks_ms - last).max(0),
            })?;
        }
        let previous_native = self.monitor.native;
        self.monitor.native = Some(sample);
        let native_ok = sample.reliable
            && sample.unlocked
            && now.ticks_ms.saturating_sub(sample.at.ticks_ms) <= 10_000
            && sample.last_input_ticks <= now.ticks_ms
            && sample.last_input_ticks >= 0;
        if !native_ok {
            self.system_unavailable(now)?;
        }
        let old_input = self.monitor.last_input;
        let new_input = if native_ok {
            Some(old_input.map_or(sample.last_input_ticks, |old| {
                old.max(sample.last_input_ticks)
            }))
        } else {
            old_input
        };
        let protected = |record: &WorkRecord| {
            record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL")
        };
        // Resolve old deadlines before fresh input resets inactivity. This also
        // catches a pause crossed between two samples without counting the gap.
        if let (Some(old), Some(new)) = (old_input, new_input) {
            if new > old && self.active()?.is_some_and(|r| !protected(&r)) {
                if let Some((deadline, _, reason, cutoff)) = self
                    .tracking_deadlines(Some(old))
                    .into_iter()
                    .find(|d| d.0 <= new)
                {
                    self.close_at(cutoff, reason, true, now)?;
                    self.monitor.input_floor = deadline.saturating_sub(1);
                } else if new
                    >= old.saturating_add(self.monitor.config.times.idle_pause_seconds * 1000)
                    // A delta between two last-input values alone cannot prove
                    // inactivity: multiple inputs can happen between samples.
                    // Require an observed quiet interval (or a protected scheduler gap).
                    && (previous_native.is_some_and(|s| s.at.ticks_ms.saturating_sub(old) >= 1_000)
                        || last_tick.is_some_and(|last| now.ticks_ms.saturating_sub(last) > 10_000))
                    && self.active()?.is_some_and(|r| r.pause_reason.as_deref() != Some("IDLE_PAUSE"))
                {
                    self.close_at(old, "IDLE_PAUSE", false, now)?;
                    self.monitor.input_floor = self.monitor.input_floor.max(old);
                }
            }
        }
        self.monitor.last_input = new_input;
        if new_input != old_input {
            self.monitor.warning_dismissed_for = None;
        }
        let connected = self
            .monitor
            .page
            .as_ref()
            .is_some_and(|p| now.ticks_ms.saturating_sub(p.at.ticks_ms) <= BROWSER_TIMEOUT_MS);
        let page_known = connected
            && self
                .monitor
                .page
                .as_ref()
                .is_some_and(|p| p.ready && p.revision == self.monitor.config.revision);
        let rule = self
            .monitor
            .page
            .as_ref()
            .and_then(|page| {
                self.monitor
                    .config
                    .rules
                    .iter()
                    .find(|rule| Some(rule.id) == page.rule_id)
            })
            .cloned();
        let matched = page_known
            && self.monitor.config.enabled
            && sample.chrome_foreground
            && self.monitor.page.as_ref().is_some_and(|p| p.focused)
            && rule.is_some();
        if !page_known
            || !self.monitor.config.enabled
            || self.monitor.config.browsing_only
            || self.active()?.is_some()
            || self
                .monitor
                .candidate
                .as_ref()
                .is_some_and(|c| rule.as_ref().is_none_or(|r| r.id != c.rule_id))
        {
            self.monitor.candidate = None;
        }
        if matched && !self.monitor.page_was_matched {
            self.monitor.entered_at = self.monitor.page.as_ref().map(|page| page.at.ticks_ms);
        }
        if !matched {
            self.monitor.entered_at = None;
        }
        self.monitor.page_was_matched = matched;
        let activity = self.monitor.page_activity_at.take();
        let candidate_input = new_input.map(|last| {
            if matched
                && native_ok
                && last > self.monitor.input_floor
                && now.ticks_ms - last <= RECENT_INPUT_MS
            {
                if let Some(at) = activity.filter(|at| {
                    *at >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                        && *at <= now.ticks_ms
                        && now.ticks_ms - *at <= 2_000
                }) {
                    return last.max(at);
                }
            }
            last
        });

        if self.monitor.config.enabled
            && !self.monitor.config.browsing_only
            && page_known
            && native_ok
            && sample.chrome_foreground
            && self.monitor.page.as_ref().is_some_and(|p| p.focused)
            && self
                .active()?
                .is_none_or(|r| !r.recovery_pending && r.pause_reason.as_deref() != Some("MANUAL"))
        {
            let fresh = candidate_input.is_some_and(|last| {
                last >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                    && last > self.monitor.input_floor
                    && now.ticks_ms - last <= RECENT_INPUT_MS
            });
            if rule.is_none() || fresh || self.active()?.is_some_and(|r| !r.is_paused) {
                self.switch_page_task(rule.as_ref().map(|r| r.id), now)?;
            }
        }

        if !page_known
            || !self.monitor.config.enabled
            || self
                .monitor
                .browse_ready_rule
                .is_some_and(|id| rule.as_ref().is_none_or(|r| r.id != id))
        {
            self.monitor.browse_ready_rule = None;
        }
        if matched
            && native_ok
            && candidate_input.is_some_and(|i| {
                i > self.monitor.input_floor && now.ticks_ms - i <= RECENT_INPUT_MS
            })
        {
            self.monitor.browse_ready_rule = rule.as_ref().map(|r| r.id);
        }
        // A deliberate pause remains in force until the user explicitly resumes.

        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if record.control_mode == "AUTO" && (!page_known || !native_ok) {
                let cutoff = self
                    .monitor
                    .last_trusted_page
                    .unwrap_or(now.ticks_ms)
                    .min(now.ticks_ms);
                if !record.is_paused || record.pause_reason.as_deref() != Some("MONITOR") {
                    self.close_at(cutoff, "MONITOR", false, now)?;
                    self.monitor.monitor_pause_since = Some(cutoff);
                }
            }
            let deadlines = self.tracking_deadlines(new_input);
            if let Some((deadline, _, reason, cutoff)) =
                deadlines.first().copied().filter(|d| d.0 <= now.ticks_ms)
            {
                self.close_at(cutoff, reason, true, now)?;
                self.monitor.input_floor = deadline;
            } else {
                if native_ok
                    && new_input.is_some_and(|last| {
                        now.ticks_ms.saturating_sub(last)
                            >= self.monitor.config.times.idle_pause_seconds * 1000
                    })
                    && self
                        .active()?
                        .is_some_and(|r| !r.is_paused || r.pause_reason.as_deref() == Some("AWAY"))
                {
                    let last = new_input.unwrap();
                    self.close_at(last, "IDLE_PAUSE", false, now)?;
                    self.monitor.input_floor = self.monitor.input_floor.max(last);
                }
                // Re-read after close_at: its transaction may have just paused the record.
                if let Some(current) = self.active()? {
                    if current.control_mode == "AUTO" && native_ok && page_known {
                        if matched {
                            self.monitor.away_since = None;
                            let fresh = candidate_input.is_some_and(|last| {
                                last >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                                    && last > self.monitor.input_floor
                                    && now.ticks_ms - last <= RECENT_INPUT_MS
                            });
                            if current.is_paused
                                && matches!(
                                    current.pause_reason.as_deref(),
                                    Some("AWAY" | "MONITOR" | "IDLE_PAUSE")
                                )
                                && fresh
                                && !self.monitor.config.browsing_only
                            {
                                let last = candidate_input.unwrap();
                                self.resume_at(
                                    current.id,
                                    TimePoint {
                                        ticks_ms: last,
                                        wall_ms: now
                                            .wall_ms
                                            .saturating_sub(now.ticks_ms - last)
                                            .max(current.start_time),
                                    },
                                    "AUTO",
                                )?;
                            }
                        } else {
                            let away = *self.monitor.away_since.get_or_insert(now.ticks_ms);
                            if now.ticks_ms
                                >= away.saturating_add(
                                    self.monitor.config.times.away_pause_seconds * 1000,
                                )
                                && !current.is_paused
                            {
                                self.close_at(
                                    away.saturating_add(
                                        self.monitor.config.times.away_pause_seconds * 1000,
                                    ),
                                    "AWAY",
                                    false,
                                    now,
                                )?;
                            }
                        }
                    } else if current.control_mode == "MANUAL"
                        && native_ok
                        && current.pause_reason.as_deref() == Some("IDLE_PAUSE")
                        && !self.monitor.config.browsing_only
                        && new_input.is_some_and(|last| {
                            last > self.monitor.input_floor
                                && now.ticks_ms - last <= RECENT_INPUT_MS
                        })
                    {
                        let last = new_input.unwrap();
                        self.resume_at(
                            current.id,
                            TimePoint {
                                ticks_ms: last,
                                wall_ms: now
                                    .wall_ms
                                    .saturating_sub(now.ticks_ms - last)
                                    .max(current.start_time),
                            },
                            "MANUAL",
                        )?;
                    }
                }
            }
        }

        if self.active()?.is_none() && matched && native_ok {
            if let (Some(last), Some(entered), Some(rule)) =
                (candidate_input, self.monitor.entered_at, rule.clone())
            {
                if last >= entered
                    && last > self.monitor.input_floor
                    && now.ticks_ms - last <= RECENT_INPUT_MS
                    && !self.rule_task_finished(rule.id)?
                {
                    if !self.monitor.config.browsing_only && self.monitor.candidate.is_none() {
                        self.monitor.candidate_sequence += 1;
                        self.monitor.candidate = Some(StartCandidate {
                            id: self.monitor.candidate_sequence,
                            rule_id: rule.id,
                            category: rule.category.clone(),
                        });
                    }
                }
            }
        }
        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if let Some(last) = self.monitor.last_input {
                let input_wall = now
                    .wall_ms
                    .saturating_sub(now.ticks_ms.saturating_sub(last))
                    .max(record.start_time);
                if new_input != old_input || record.last_input_time.is_none() {
                    self.connection
                        .execute(
                            "UPDATE work_records SET last_input_time=?1 WHERE id=?2",
                            params![input_wall, record.id],
                        )
                        .map_err(db_error)?;
                }
                self.monitor.status.idle_warning = native_ok
                    && now.ticks_ms.saturating_sub(last)
                        >= self.monitor.config.times.idle_warning_seconds * 1000
                    && now.ticks_ms.saturating_sub(last)
                        < self.monitor.config.times.idle_end_seconds * 1000
                    && self.monitor.warning_dismissed_for != Some(last);
            }
        } else {
            self.monitor.status.idle_warning = false;
        }
        self.monitor.status.away_pause_remaining_seconds = if native_ok
            && page_known
            && !matched
            && self
                .active()?
                .is_some_and(|r| r.control_mode == "AUTO" && !r.is_paused && !r.recovery_pending)
        {
            self.monitor.away_since.map(|away| {
                let remaining = away
                    .saturating_add(self.monitor.config.times.away_pause_seconds * 1000)
                    .saturating_sub(now.ticks_ms)
                    .max(0);
                (remaining + 999) / 1000
            })
        } else {
            None
        };
        self.monitor.status.browsing_only = self.monitor.config.browsing_only;
        self.monitor.status.start_candidate = self.monitor.candidate.clone();
        self.monitor.status.unknown_page_url = if page_known
            && self
                .monitor
                .page
                .as_ref()
                .is_some_and(|p| p.rule_id.is_none())
        {
            self.monitor.unknown_page_url.clone()
        } else {
            None
        };
        if self
            .monitor
            .status
            .unknown_page_url
            .as_deref()
            .is_some_and(|u| self.is_ignored_page(u).unwrap_or(false))
        {
            self.monitor.status.unknown_page_url = None;
        }
        self.monitor.status.finished_page_rule = if page_known
            && rule
                .as_ref()
                .is_some_and(|r| self.rule_task_finished(r.id).unwrap_or(false))
        {
            rule.as_ref().map(|r| r.id)
        } else {
            None
        };
        self.monitor.status.browse_ready = self.monitor.config.enabled
            && page_known
            && native_ok
            && self.monitor.browse_ready_rule.is_some();
        self.monitor.status.browse_category = if self.monitor.status.browse_ready {
            self.monitor
                .config
                .rules
                .iter()
                .find(|r| Some(r.id) == self.monitor.browse_ready_rule)
                .map(|r| r.category.clone())
        } else {
            None
        };
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.revision = self.monitor.config.revision;
        self.monitor.status.native_available = native_ok;
        self.monitor.status.browser_connected = connected;
        self.monitor.status.work_page = matched;
        self.monitor.status.message = if !native_ok {
            "系统状态暂不可确认，已暂停计时"
        } else if !self.monitor.config.enabled {
            "自动页面识别未启用；手动计时仍有空闲保护"
        } else if self.monitor.config.browsing_only {
            if matched {
                "仅浏览 · 工作页面已就绪，点击开始记录"
            } else {
                "仅浏览 · 当前不计时"
            }
        } else if self.monitor.candidate.is_some() {
            "工作页面已就绪，等待确认开始记录"
        } else if self.active()?.is_some_and(|r| r.recovery_pending) {
            "有上次待恢复任务，请先继续或结束"
        } else if self
            .active()?
            .is_some_and(|r| r.pause_reason.as_deref() == Some("MANUAL"))
        {
            if self.monitor.config.auto_resume_manual {
                "已手动暂停，返回工作页面操作后自动继续"
            } else {
                "已手动暂停，等待明确继续"
            }
        } else if !connected {
            "等待 Chrome 扩展连接"
        } else if !page_known {
            "等待扩展同步最新工作页面规则"
        } else if !matched {
            "当前不在配置的工作页面"
        } else if self.active()?.is_none() {
            "已识别工作页面，等待新的鼠标或键盘活动"
        } else {
            "工作监测正常"
        }
        .into();
        self.checkpoint()
    }

    pub fn current_notice(&self) -> Result<Option<Notice>> {
        let id:Option<i64>=self.connection.query_row("SELECT record_id FROM end_reminders JOIN work_records ON work_records.id=end_reminders.record_id WHERE dismissed=0 AND status='FINISHED' AND settlement_status='PENDING' AND is_demo=0 ORDER BY record_id LIMIT 1",[],|r|r.get(0)).optional().map_err(db_error)?;
        if let Some(id) = id {
            return Ok(Some(Notice {
                kind: "ended".into(),
                idle_warning_seconds: self.monitor.config.times.idle_warning_seconds,
                idle_end_seconds: self.monitor.config.times.idle_end_seconds,
                record: self.record(id)?,
            }));
        }
        if self.monitor.status.idle_warning {
            if let Some(record) = self.active()? {
                return Ok(Some(Notice {
                    kind: "idle".into(),
                    idle_warning_seconds: self.monitor.config.times.idle_warning_seconds,
                    idle_end_seconds: self.monitor.config.times.idle_end_seconds,
                    record,
                }));
            }
        }
        Ok(None)
    }
    pub fn defer_notice(&mut self, id: i64, kind: &str) -> Result<()> {
        match kind {
            "ended" => {
                self.connection
                    .execute(
                        "UPDATE end_reminders SET dismissed=1 WHERE record_id=?1",
                        [id],
                    )
                    .map_err(db_error)?;
            }
            "idle" => {
                if self.active()?.is_some_and(|r| r.id == id) {
                    self.monitor.warning_dismissed_for = self.monitor.last_input;
                    self.monitor.status.idle_warning = false;
                }
            }
            _ => return Err("提醒类型无效。".into()),
        }
        Ok(())
    }
}

impl Store {
    pub fn enter_browsing(&mut self) -> Result<()> {
        let active = self.active()?;
        let now = self.clock.now();
        let tx = self.connection.transaction().map_err(db_error)?;
        if let Some(r) = active.as_ref() {
            let duration = match self.segment.as_ref() {
                Some(s) if s.row_id == r.id => {
                    s.base_ms + now.ticks_ms.saturating_sub(s.started_ticks).max(0)
                }
                _ => r.duration_ms,
            };
            if !r.is_paused {
                write_segment(&tx, self.segment.as_ref(), r.id, duration, true)?;
            }
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,paused_at=COALESCE(paused_at,?4),pause_reason='MANUAL' WHERE id=?3",params![duration,duration/1000,r.id,now.wall_ms.max(0)]).map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET browsing_only=1 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.segment = None;
        self.monitor.config.browsing_only = true;
        self.monitor.browse_ready_rule = None;
        self.monitor.status.browse_ready = false;
        self.monitor.candidate = None;
        self.monitor.status.start_candidate = None;
        self.monitor.status.browsing_only = true;
        self.monitor.status.idle_warning = false;
        self.monitor.status.message = "仅浏览 · 当前不计时".into();
        self.monitor.input_floor = now.ticks_ms;
        Ok(())
    }
    pub fn confirm_work(&mut self, candidate_id: Option<u64>, own_focus: bool) -> Result<()> {
        let now = self.clock.now();
        let native = self
            .monitor
            .native
            .filter(|n| {
                n.reliable
                    && n.unlocked
                    && now.ticks_ms - n.at.ticks_ms <= 5000
                    && (n.chrome_foreground || own_focus)
            })
            .ok_or("无法确认系统状态，请返回工作页面后重试。")?;
        let _ = native;
        let page = self
            .monitor
            .page
            .as_ref()
            .filter(|p| {
                p.ready
                    && p.revision == self.monitor.config.revision
                    && now.ticks_ms - p.at.ticks_ms <= BROWSER_TIMEOUT_MS
            })
            .ok_or("页面连接已变化，请返回工作页面后重试。")?;
        let rule = self
            .monitor
            .config
            .rules
            .iter()
            .find(|r| Some(r.id) == page.rule_id)
            .cloned()
            .ok_or("当前页面未匹配工作规则。")?;
        if self.rule_task_finished(rule.id)? {
            return Err("此网页绑定的任务已结束，请选择其他任务。".into());
        }
        if !self.monitor.config.enabled {
            return Err("请先启用工作页面识别。".into());
        }
        let active = self.active()?;
        if let Some(c) = candidate_id {
            if self
                .monitor
                .candidate
                .as_ref()
                .is_none_or(|p| p.id != c || p.rule_id != rule.id)
                || active.is_some()
            {
                return Err("开工提示已失效，请重新确认。".into());
            }
        } else if !self.monitor.config.browsing_only
            || self.monitor.browse_ready_rule != Some(rule.id)
        {
            return Err("请返回工作页面操作后，再点击开工入口。".into());
        }
        if let Some(record) = active {
            if record.recovery_pending {
                return Err("请先在主窗口处理上次待恢复的任务。".into());
            }
            if !record.is_paused {
                return Err("当前任务已在计时。".into());
            }
            self.resume_at(record.id, now, "AUTO")?;
        } else {
            self.start_at(
                StartInput {
                    category: rule.category,
                    quantity: None,
                    remark: String::new(),
                },
                "AUTO",
                now,
                false,
            )?;
        }
        self.monitor.active_rule_id = Some(rule.id);
        Ok(())
    }
}

impl Store {
    pub fn browser_disconnected(&mut self, client: u64) {
        if self.monitor.browser_owner != Some(client) {
            return;
        }
        self.monitor.browser_owner = None;
        self.monitor.page = None;
        self.monitor.candidate = None;
        self.monitor.browse_ready_rule = None;
        self.monitor.status.start_candidate = None;
        self.monitor.status.browse_ready = false;
        self.monitor.status.browse_category = None;
        self.monitor.status.browser_connected = false;
    }
}

```

## UPDATE — E:\WorkMemo\src-tauri\src\service.rs

```rust

use crate::{
    browser_bridge,
    monitor::{ConfigInput, MonitorConfig, NativeSample},
    native_activity,
};
use crate::{
    clock::{Clock, SystemClock},
    database::{
        HistoryPage, HistoryQuery, Notice, Result, SettleInput, Snapshot, StartInput, Store,
        WorkRecord,
    },
};
use std::{
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};
use tauri::{Emitter, Manager, State};

pub(crate) type SharedStore = Arc<Mutex<Result<Store>>>;

// Use the same priority as the island frontend; old settlements stay persisted.
fn island_presentation_key(
    active: Option<i64>,
    candidate: Option<u64>,
    notice: Option<(&str, i64)>,
    enabled: bool,
    browsing: bool,
    binding_pending: bool,
) -> Option<String> {
    if let Some(id) = active {
        if notice == Some(("idle", id)) {
            return Some(format!("idle:{id}"));
        }
        return enabled.then(|| format!("active:{id}"));
    }
    if let Some(id) = candidate {
        return Some(format!("candidate:{id}"));
    }
    notice
        .map(|(kind, id)| format!("{kind}:{id}"))
        .or_else(|| (enabled && binding_pending).then(|| "page-binding".into()))
        .or_else(|| (enabled && browsing).then(|| "browsing".into()))
}

pub struct Backend {
    pub(crate) inner: SharedStore,
    pub tray_ready: AtomicBool,
    pub exiting: AtomicBool,
}

impl Backend {
    pub fn initialize(app: &tauri::App) -> Self {
        let directory = app.path().app_local_data_dir();
        let opened = app
            .path()
            .app_local_data_dir()
            .map_err(|e| format!("无法定位本地数据目录：{e}"))
            .and_then(|directory| {
                Store::open(
                    &directory.join("workmemo.sqlite3"),
                    Box::new(SystemClock::new()),
                )
            });
        let inner = Arc::new(Mutex::new(opened));
        if let Ok(mut guard) = inner.lock() {
            if let Ok(store) = guard.as_mut() {
                if let Ok(dir) = app.path().app_config_dir() {
                    if let Err(e) = crate::database::data_tools::recover_pending(store, &dir) {
                        *guard = Err(e);
                    }
                }
                if let Ok(store) = guard.as_mut() {
                    store.sound_config = app
                        .path()
                        .app_config_dir()
                        .ok()
                        .map(|p| p.join("window-layout.json"));
                    store.activate_monitoring();
                }
            }
        }
        if let Ok(directory) = directory {
            let ready = inner.lock().ok().is_some_and(|g| g.is_ok());
            if ready {
                if let Err(error) = browser_bridge::start(inner.clone(), &directory) {
                    if let Ok(mut guard) = inner.lock() {
                        if let Ok(store) = guard.as_mut() {
                            store.warning = Some(error);
                        }
                    }
                } else {
                    let handle = app.handle().clone();
                    std::thread::spawn(move || {
                        let _ = handle
                            .state::<crate::connection::ConnectionState>()
                            .refresh(true);
                    });
                }
            }
        }
        let weak = Arc::downgrade(&inner);
        let app_handle = app.handle().clone();
        let signals = native_activity::listen();
        std::thread::spawn(move || {
            let mut presented = None;
            let mut last_pending = None;
            let mut listener_ok = true;
            let mut reported_error: Option<String> = None;
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                let mut notice = None;
                let mut active_id = None;
                let mut candidate_id = None;
                let mut browsing = false;
                let mut binding_pending = false;
                let mut runtime_failure: Option<String> = None;
                // Sample after the preceding loop has finished creating and positioning the window.
                // Creation emits transient move events, so those events must not overwrite saved coordinates.
                if let Some(window) = app_handle.get_webview_window("notice") {
                    if let Ok(position) = window.outer_position() {
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .moved(position);
                    }
                }
                if let Err(error) = app_handle.state::<crate::desktop::IslandState>().flush() {
                    runtime_failure = Some(format!("状态岛设置未能保存：{error}"));
                }
                if let Ok(mut guard) = shared.lock() {
                    if let Ok(store) = guard.as_mut() {
                        observe_sound(store, false);
                        let now = SystemClock::new().now();
                        for signal in signals.try_iter() {
                            match signal {
                                Ok(signal) => {
                                    if !signal.available {
                                        if let Err(error) = store.system_unavailable(signal.at) {
                                            store.warning = Some(error.clone());
                                            runtime_failure = Some(error);
                                        }
                                    }
                                    store.monitor.native = None;
                                }
                                Err(error) => {
                                    listener_ok = false;
                                    store.monitor.events_failed = true;
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    let _ = store.system_unavailable(now);
                                }
                            }
                        }
                        let sample = if store.monitor_sample_due(now.ticks_ms) {
                            match native_activity::sample() {
                                Ok(mut sample) => {
                                    sample.reliable &= listener_ok;
                                    sample
                                }
                                Err(error) => {
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    NativeSample {
                                        at: now,
                                        last_input_ticks: 0,
                                        chrome_foreground: false,
                                        unlocked: false,
                                        reliable: false,
                                    }
                                }
                            }
                        } else {
                            store.monitor.native.unwrap()
                        };
                        let now = SystemClock::new().now();
                        if let Err(error) = store.monitor_tick(sample, now) {
                            store.warning = Some(error.clone());
                            runtime_failure = Some(error);
                        }
                        observe_sound(store, true);
                        match store.current_notice() {
                            Ok(value) => notice = value,
                            Err(error) => {
                                store.warning = Some(error.clone());
                                runtime_failure = Some(error);
                            }
                        }
                        match store.snapshot() {
                            Ok(snapshot) => {
                                if last_pending != Some(snapshot.pending_count) {
                                    let _ = app_handle.emit("workmemo:data-changed", ());
                                    last_pending = Some(snapshot.pending_count);
                                }
                                candidate_id =
                                    snapshot.monitoring.start_candidate.as_ref().map(|c| c.id);
                                browsing = snapshot.monitoring.browsing_only;
                                binding_pending = snapshot.monitoring.unknown_page_url.is_some()
                                    || snapshot.monitoring.finished_page_rule.is_some();
                                active_id = snapshot.active.map(|record| record.id);
                            }
                            Err(error) => runtime_failure = Some(error),
                        }
                    }
                }
                let key = island_presentation_key(
                    active_id,
                    candidate_id,
                    notice.as_ref().map(|n| (n.kind.as_str(), n.record.id)),
                    app_handle.state::<crate::desktop::IslandState>().enabled(),
                    browsing,
                    binding_pending,
                );
                let key = key.or_else(|| {
                    app_handle
                        .state::<crate::desktop::IslandState>()
                        .holding
                        .load(Ordering::Relaxed)
                        .then(|| "expanded".into())
                });
                if key != presented {
                    match crate::desktop::present_notice(
                        &app_handle,
                        key.is_some(),
                        notice.is_some(),
                        candidate_id.is_some(),
                    ) {
                        Ok(()) => presented = key,
                        Err(error) => {
                            let message =
                                format!("提醒窗口未能显示，记录仍保留在待补全列表：{error}");
                            if let Ok(mut guard) = shared.lock() {
                                if let Ok(store) = guard.as_mut() {
                                    store.warning = Some(message.clone());
                                }
                            }
                            runtime_failure = Some(message);
                        }
                    }
                }
                if let Some(error) = runtime_failure {
                    if reported_error.as_ref() != Some(&error) {
                        // Surface background failures without stealing keyboard focus.
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = crate::desktop::set_visibility(
                                &window.as_ref().window(),
                                true,
                                false,
                            );
                        }
                        let _ = app_handle.emit("workmemo:runtime-error", error.clone());
                    }
                    reported_error = Some(error);
                } else if listener_ok {
                    if let Ok(mut guard) = shared.lock() {
                        if let Ok(store) = guard.as_mut() {
                            if store.monitor.native.is_some_and(|sample| sample.reliable) {
                                if let Some(previous) = reported_error.take() {
                                    if store.warning.as_ref() == Some(&previous) {
                                        store.warning = None;
                                    }
                                    let _ = app_handle.emit("workmemo:runtime-recovered", previous);
                                }
                            }
                        }
                    }
                }
            }
        });
        Self {
            inner,
            tray_ready: AtomicBool::new(false),
            exiting: AtomicBool::new(false),
        }
    }

    pub fn save_on_exit(&self) -> Result<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| "数据服务锁异常，未能保存当前任务。")?;
        // A window showing a startup database error must still be closable.
        if let Ok(store) = guard.as_mut() {
            if let Err(error) = store.pause_for_close() {
                store.warning = Some(format!("关闭时保存失败，已阻止关闭，请重试：{error}"));
                return Err(error);
            }
        }
        Ok(())
    }
}

pub(crate) async fn access<T: Send + 'static>(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<T> + Send + 'static,
) -> Result<T> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = shared
            .lock()
            .map_err(|_| "本地数据服务异常，请重新打开应用。")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        store.expire_previous_day_pauses()?;
        observe_sound(store, false);
        let result = action(store);
        observe_sound(store, true);
        result
    })
    .await
    .map_err(|e| format!("数据操作未能完成：{e}"))?
}

async fn execute(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<()> + Send + 'static,
) -> Result<Snapshot> {
    access(shared, move |store| {
        // Resolve expired automatic deadlines before a manual command can
        // pause/finish the same record or start another one.
        before_action(store)?;
        action(store)?;
        store.snapshot()
    })
    .await
}

fn before_action(store: &mut Store) -> Result<()> {
    if store.monitor.active {
        let sample = native_activity::sample();
        let now = SystemClock::new().now();
        let mut sample = sample.unwrap_or(NativeSample {
            at: now,
            last_input_ticks: 0,
            chrome_foreground: false,
            unlocked: false,
            reliable: false,
        });
        sample.reliable &= !store.monitor.events_failed;
        store.monitor_tick(sample, now)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn query_history(state: State<'_, Backend>, query: HistoryQuery) -> Result<HistoryPage> {
    access(state.inner.clone(), move |store| store.query_history(query)).await
}

#[tauri::command]
pub async fn delete_record(state: State<'_, Backend>, id: i64) -> Result<()> {
    access(state.inner.clone(), move |store| store.delete_record(id)).await
}

#[tauri::command]
pub async fn get_snapshot(state: State<'_, Backend>) -> Result<Snapshot> {
    access(state.inner.clone(), |store| store.snapshot()).await
}

#[tauri::command]
pub async fn start_task(
    state: State<'_, Backend>,
    input: StartInput,
    expected_active_id: Option<i64>,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.start_checked(input, expected_active_id)
    })
    .await
}

#[tauri::command]
pub async fn pause_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.pause(id)).await
}

#[tauri::command]
pub async fn resume_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.resume(id)).await
}

#[tauri::command]
pub async fn finish_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.finish(id)).await
}

#[tauri::command]
pub async fn get_pending_records(state: State<'_, Backend>) -> Result<Vec<WorkRecord>> {
    access(state.inner.clone(), |store| store.pending_records()).await
}

#[tauri::command]
pub async fn settle_record(state: State<'_, Backend>, input: SettleInput) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.settle(input)).await
}

#[tauri::command]
pub async fn get_monitor_config(state: State<'_, Backend>) -> Result<MonitorConfig> {
    access(state.inner.clone(), |store| store.monitor_config()).await
}
#[tauri::command]
pub async fn get_page_tasks(state: State<'_, Backend>) -> Result<Vec<crate::database::PageTask>> {
    access(state.inner.clone(), |store| store.page_tasks()).await
}
#[tauri::command]
pub async fn bind_page(
    state: State<'_, Backend>,
    input: crate::database::BindPageInput,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.bind_page(input)).await
}
#[tauri::command]
pub async fn get_ignored_pages(
    state: State<'_, Backend>,
) -> Result<Vec<crate::database::IgnoredPage>> {
    access(state.inner.clone(), |store| store.ignored_pages()).await
}
#[tauri::command]
pub async fn remove_ignored_page(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.remove_ignored_page(id)
    })
    .await
}
#[tauri::command]
pub async fn rebind_finished_page(
    state: State<'_, Backend>,
    input: crate::database::RebindPageInput,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.rebind_finished_page(input)
    })
    .await
}
#[tauri::command]
pub async fn confirm_recovery_task(state: State<'_, Backend>, task_id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.confirm_recovery_task(task_id)
    })
    .await
}
#[tauri::command]
pub async fn get_category_names(
    state: State<'_, Backend>,
) -> Result<crate::database::categories::CategoryNames> {
    access(state.inner.clone(), |store| store.category_names()).await
}
#[tauri::command]
pub async fn save_category_names(
    app: tauri::AppHandle,
    state: State<'_, Backend>,
    input: crate::database::categories::CategoryNames,
) -> Result<crate::database::categories::CategoryNames> {
    let saved = access(state.inner.clone(), move |store| {
        store.save_category_names(input)
    })
    .await?;
    let _ = app.emit("workmemo:categories-changed", ());
    Ok(saved)
}
#[tauri::command]
pub async fn save_monitor_config(
    state: State<'_, Backend>,
    input: ConfigInput,
) -> Result<MonitorConfig> {
    access(state.inner.clone(), move |store| {
        before_action(store)?;
        store.save_monitor_config(input)
    })
    .await
}
#[tauri::command]
pub async fn get_notice(state: State<'_, Backend>) -> Result<Option<Notice>> {
    access(state.inner.clone(), |store| store.current_notice()).await
}
#[tauri::command]
pub async fn defer_notice(state: State<'_, Backend>, id: i64, kind: String) -> Result<()> {
    access(state.inner.clone(), move |store| {
        store.defer_notice(id, &kind)
    })
    .await
}
#[tauri::command]
pub fn show_main(app: tauri::AppHandle, settlement: bool) -> Result<()> {
    crate::desktop::show_main(&app, settlement)
}
#[tauri::command]
pub fn exit_app(app: tauri::AppHandle, state: State<'_, Backend>) -> Result<()> {
    if let Err(error) = crate::desktop::save_island_position(&app) {
        let _ = app.emit(
            "workmemo:runtime-error",
            format!("状态岛设置未能保存：{error}"),
        );
    }
    if crate::windows::has_drafts(&app) {
        let _ = app.emit("workmemo:request-close", ());
        return Err("请先保存或放弃二级窗口中的修改，再退出。".into());
    }
    state.save_on_exit()?;
    state.exiting.store(true, Ordering::Relaxed);
    app.exit(0);
    Ok(())
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let backend = window.state::<Backend>();
        let _ = crate::windows::capture(window);
        if matches!(window.label(), "settings" | "history" | "settlement") {
            api.prevent_close();
            let _ = window.emit("workmemo:request-close", ());
            return;
        }
        if window.label() == "notice" {
            api.prevent_close();
            if window
                .state::<crate::desktop::IslandState>()
                .holding
                .load(Ordering::Relaxed)
            {
                let _ = window.emit("workmemo:request-close", ());
                return;
            }
            let result = (|| -> Result<()> {
                let mut guard = backend.inner.lock().map_err(|_| "本地服务锁异常。")?;
                let store = guard.as_mut().map_err(|e| e.clone())?;
                if let Some(notice) = store.current_notice()? {
                    store.defer_notice(notice.record.id, &notice.kind)?;
                } else {
                    window.state::<crate::desktop::IslandState>().disable()?;
                }
                Ok(())
            })();
            if let Err(error) = result {
                let _ = window.emit("workmemo:storage-error", error);
            }
            return;
        }
        if window.label() == "main"
            && backend.tray_ready.load(Ordering::Relaxed)
            && !backend.exiting.load(Ordering::Relaxed)
        {
            api.prevent_close();
            if let Err(error) = crate::desktop::set_visibility(window, false, false) {
                let _ = window.emit("workmemo:storage-error", error.to_string());
            }
            return;
        }
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}

#[tauri::command]
pub async fn enter_browsing(state: State<'_, Backend>) -> Result<Snapshot> {
    execute(state.inner.clone(), |store| store.enter_browsing()).await
}
#[tauri::command]
pub async fn confirm_work(
    state: State<'_, Backend>,
    candidate_id: Option<u64>,
) -> Result<Snapshot> {
    let own = crate::native_activity::own_process_foreground();
    execute(state.inner.clone(), move |store| {
        store.confirm_work(candidate_id, own)
    })
    .await
}

fn observe_sound(store: &mut Store, enabled: bool) {
    if let Ok(active) = store.active() {
        let state = active.map(|r| crate::sound::Status {
            id: r.id,
            paused: r.is_paused,
            recovery: r.recovery_pending,
        });
        let cues = store
            .sounds
            .observe(state, store.monitor.status.idle_warning);
        if enabled {
            if let Some(layout) = store
                .sound_config
                .as_ref()
                .and_then(|p| crate::windows::load(p).ok())
                .filter(|layout| layout.sound_enabled)
            {
                if let Some(cue) = cues.first() {
                    let _ = crate::sound::play(*cue, layout.sound_theme);
                }
            }
        }
    }
}

#[cfg(test)]
mod island_tests {
    use super::island_presentation_key as key;

    #[test]
    fn new_work_supersedes_old_reminders_without_changing_visibility_preference() {
        assert_eq!(
            key(None, Some(2), Some(("ended", 1)), false, false, false).as_deref(),
            Some("candidate:2")
        );
        assert_eq!(
            key(Some(3), None, Some(("ended", 1)), true, false, false).as_deref(),
            Some("active:3")
        );
        assert_eq!(
            key(Some(3), None, Some(("ended", 1)), false, false, false),
            None
        );
        assert_eq!(
            key(None, None, Some(("ended", 1)), false, false, false).as_deref(),
            Some("ended:1")
        );
        assert_eq!(
            key(Some(3), None, Some(("idle", 3)), false, false, false).as_deref(),
            Some("idle:3")
        );
        assert_eq!(
            key(None, None, None, true, true, false).as_deref(),
            Some("browsing")
        );
    }

    #[test]
    fn collapsed_binding_hint_stays_visible_without_holding_or_an_active_task() {
        assert_eq!(
            key(None, None, None, true, false, true).as_deref(),
            Some("page-binding")
        );
        assert_eq!(key(None, None, None, true, false, false), None);
        // Respect an explicit tray hide while the page still needs processing.
        assert_eq!(key(None, None, None, false, false, true), None);
    }
}

```

## UPDATE — E:\WorkMemo\src-tauri\src\data_tools.rs

```rust

use super::*;
use crate::{
    clock::SystemClock,
    service::{self, Backend},
};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::PathBuf};
use tauri::{Emitter, Manager};
const FILES: [&str; 4] = [
    "appearance.json",
    "window-layout.json",
    "island.json",
    "presentation.json",
];
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Archive {
    version: u32,
    database: Vec<u8>,
    settings: BTreeMap<String, Vec<u8>>,
}
#[derive(Serialize, Default)]
pub struct ImportReport {
    pub source: Option<String>,
    pub conflict_ids: Vec<i64>,
    pub skipped_active_ids: Vec<i64>,
    pub records: usize,
    pub pending: usize,
    pub active: usize,
    pub imported: usize,
    pub duplicates: usize,
    pub conflicts: usize,
    pub skipped_active: usize,
    pub backup: Option<String>,
}
struct Scratch(PathBuf);
impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(self.0.with_extension("lock"));
        for suffix in ["", "-wal", "-shm"] {
            let _ = std::fs::remove_file(format!("{}{suffix}", self.0.display()));
        }
    }
}
fn scratch(dir: &Path) -> Result<Scratch> {
    let n = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    Ok(Scratch(dir.join(format!(
        "snapshot-{}-{n}.sqlite3",
        std::process::id()
    ))))
}
fn configs(dir: &Path) -> Result<BTreeMap<String, Vec<u8>>> {
    let mut m = BTreeMap::new();
    for name in FILES {
        match std::fs::read(dir.join(name)) {
            Ok(b) => {
                m.insert(name.into(), b);
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(e.to_string()),
        }
    }
    if let Some(bytes) = m.get("presentation.json") {
        let p: crate::presentation::Presentation =
            serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
        p.validate()?;
        if let Some(bg) = p.background {
            let bytes =
                std::fs::read(dir.join("backgrounds").join(&bg.file)).map_err(|e| e.to_string())?;
            m.insert(format!("backgrounds/{}", bg.file), bytes);
        }
    }
    Ok(m)
}
fn validate_settings(settings: &BTreeMap<String, Vec<u8>>) -> Result<()> {
    for (name, b) in settings {
        if let Some(file) = name.strip_prefix("backgrounds/") {
            if !crate::presentation::image_name(file) {
                return Err("备份图片路径无效".into());
            }
            crate::presentation::validate_image(b)?;
            continue;
        }
        if !FILES.contains(&name.as_str()) || b.len() > 65536 {
            return Err("备份设置无效。".into());
        }
        let v: serde_json::Value = serde_json::from_slice(b).map_err(|e| e.to_string())?;
        match name.as_str() {
            "presentation.json" => {
                let p: crate::presentation::Presentation =
                    serde_json::from_slice(b).map_err(|e| e.to_string())?;
                p.validate()?;
                if let Some(bg) = p.background {
                    if !settings.contains_key(&format!("backgrounds/{}", bg.file)) {
                        return Err("备份缺少背景图片".into());
                    }
                }
            }
            "appearance.json" => {
                let a: crate::appearance::Appearance =
                    serde_json::from_value(v).map_err(|e| e.to_string())?;
                if ![1, 2].contains(&a.version) || !(80..=100).contains(&a.opacity) {
                    return Err("备份外观无效。".into());
                }
            }
            "island.json" => {
                crate::desktop::validate_island(b)?;
            }
            "window-layout.json" => {
                crate::windows::decode_layout(b)?;
                if !["compact", "comfortable"].contains(&v["density"].as_str().unwrap_or("")) {
                    return Err("备份布局无效。".into());
                }
            }
            _ => unreachable!(),
        }
    }
    Ok(())
}
fn write_configs(dir: &Path, settings: &BTreeMap<String, Vec<u8>>) -> Result<()> {
    validate_settings(settings)?;
    std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    for (name, bytes) in settings
        .iter()
        .filter(|(n, _)| n.starts_with("backgrounds/"))
    {
        let path = dir.join(name);
        std::fs::create_dir_all(path.parent().ok_or("图片目录无效")?).map_err(|e| e.to_string())?;
        let pending = path.with_extension("restore-pending");
        std::fs::write(&pending, bytes).map_err(|e| e.to_string())?;
        std::fs::rename(pending, path).map_err(|e| e.to_string())?;
    }
    for name in FILES {
        let path = dir.join(name);
        if let Some(b) = settings.get(name) {
            let temp = path.with_extension("restore-pending");
            std::fs::write(&temp, b).map_err(|e| e.to_string())?;
            std::fs::rename(temp, path).map_err(|e| e.to_string())?;
        } else if path.exists() {
            std::fs::remove_file(path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}
impl Store {
    fn archive(&mut self, dir: &Path) -> Result<Archive> {
        self.checkpoint()?;
        let t = scratch(dir)?;
        self.connection
            .backup("main", &t.0, None::<fn(rusqlite::backup::Progress)>)
            .map_err(db_error)?;
        Ok(Archive {
            version: 2,
            database: std::fs::read(&t.0).map_err(|e| e.to_string())?,
            settings: configs(dir)?,
        })
    }
    fn apply_image(&mut self, image: &Path) -> Result<()> {
        self.connection
            .execute(
                "ATTACH DATABASE ?1 AS restore_source",
                [image.to_string_lossy().as_ref()],
            )
            .map_err(db_error)?;
        let result = (|| {
            let tx = self
                .connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .map_err(db_error)?;
            let tables = [
                "category_names",
                "import_sources",
                "end_reminders",
                "record_revisions",
                "work_segments",
                "ignored_work_urls",
                "work_urls",
                "work_tasks",
                "monitoring_settings",
                "work_records",
            ];
            for table in tables {
                tx.execute(&format!("DELETE FROM main.{table}"), [])
                    .map_err(db_error)?;
            }
            for table in tables.into_iter().rev() {
                tx.execute(
                    &format!("INSERT INTO main.{table} SELECT * FROM restore_source.{table}"),
                    [],
                )
                .map_err(db_error)?;
            }
            tx.execute("DELETE FROM main.sqlite_sequence", [])
                .map_err(db_error)?;
            tx.execute(
                "INSERT INTO main.sqlite_sequence SELECT * FROM restore_source.sqlite_sequence",
                [],
            )
            .map_err(db_error)?;
            let invalid: Option<String> = tx
                .query_row(
                    "SELECT \"table\" FROM pragma_foreign_key_check LIMIT 1",
                    [],
                    |r| r.get(0),
                )
                .optional()
                .map_err(db_error)?;
            if invalid.is_some() {
                return Err("备份关联数据无效。".into());
            }
            tx.commit().map_err(db_error)
        })();
        let _ = self
            .connection
            .execute("DETACH DATABASE restore_source", []);
        result?;
        self.segment = None;
        self.monitor = Runtime::default();
        self.monitor.config = self.monitor_config()?;
        self.activate_monitoring();
        Ok(())
    }
}
fn read_archive(path: &Path) -> Result<Archive> {
    if std::fs::metadata(path).map_err(|e| e.to_string())?.len() > 256 * 1024 * 1024 {
        return Err("备份文件超过256MB限制。".into());
    }
    let a: Archive = serde_json::from_slice(&std::fs::read(path).map_err(|e| e.to_string())?)
        .map_err(|_| "备份格式无效。")?;
    if ![1, 2].contains(&a.version) || a.database.len() > 128 * 1024 * 1024 {
        return Err("备份版本或大小不受支持。".into());
    }
    validate_settings(&a.settings)?;
    Ok(a)
}
fn checked_image(a: &Archive, dir: &Path) -> Result<Scratch> {
    let t = scratch(dir)?;
    std::fs::write(&t.0, &a.database).map_err(|e| e.to_string())?;
    let c = Connection::open(&t.0).map_err(db_error)?;
    let ok: String = c
        .query_row("PRAGMA integrity_check", [], |r| r.get(0))
        .map_err(db_error)?;
    if ok != "ok" {
        return Err("备份数据库损坏。".into());
    }
    let store = Store::initialize(c, Box::new(SystemClock::new()), None)?;
    let invalid: Option<String> = store
        .connection
        .query_row(
            "SELECT \"table\" FROM pragma_foreign_key_check LIMIT 1",
            [],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    if invalid.is_some() {
        return Err("备份外键校验失败。".into());
    }
    store.monitor_config()?;
    for record in store
        .connection
        .prepare(&format!("SELECT {COLUMNS} FROM work_records"))
        .map_err(db_error)?
        .query_map([], read_record)
        .map_err(db_error)?
    {
        record.map_err(db_error)?;
    }
    drop(store);
    Ok(t)
}
fn save_archive(path: &Path, a: &Archive) -> Result<()> {
    let parent = path.parent().ok_or("备份路径无效")?;
    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let t = path.with_extension("workmemo-pending");
    let mut f = std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&t)
        .map_err(|e| e.to_string())?;
    use std::io::Write;
    let result = (|| {
        serde_json::to_writer(&mut f, a).map_err(|e| e.to_string())?;
        f.flush()
            .and_then(|_| f.sync_all())
            .map_err(|e| e.to_string())
    })();
    drop(f);
    if result.is_err() {
        let _ = std::fs::remove_file(&t);
        return result;
    }
    std::fs::rename(t, path).map_err(|e| e.to_string())
}
fn automatic_backup(store: &mut Store, dir: &Path) -> Result<PathBuf> {
    let n = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    let path = dir
        .join("backups")
        .join(format!("before-change-{n}.workmemo"));
    save_archive(&path, &store.archive(dir)?)?;
    Ok(path)
}
// A durable rollback journal precedes every restore. Startup restores the old
// snapshot if a process stops between file writes and the SQLite commit.
pub fn recover_pending(store: &mut Store, dir: &Path) -> Result<()> {
    let p = dir.join("restore-journal.workmemo");
    if p.exists() {
        let a = read_archive(&p)?;
        let image = checked_image(&a, dir)?;
        store.apply_image(&image.0)?;
        write_configs(dir, &a.settings)?;
        std::fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}
pub struct ArchiveSelection(pub std::sync::Mutex<Option<Archive>>);
#[tauri::command]
pub async fn inspect_backup(app: tauri::AppHandle) -> Result<Option<ImportReport>> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        let Some(path) = native_file(false)? else {
            return Ok(None);
        };
        let a = read_archive(&path)?;
        let image = checked_image(&a, &dir)?;
        let source = Store::open(&image.0, Box::new(SystemClock::new()))?;
        let mut r = report(&source)?;
        r.backup = Some(path.display().to_string());
        *app.state::<ArchiveSelection>()
            .0
            .lock()
            .map_err(|_| "备份选择锁异常")? = Some(a);
        Ok(Some(r))
    })
    .await
    .map_err(|e| e.to_string())?
}
fn native_file(save: bool) -> Result<Option<PathBuf>> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::Controls::Dialogs::*;
        let mut file = vec![0u16; 32768];
        let filter: Vec<u16> = "WorkMemo Backup\0*.workmemo\0\0".encode_utf16().collect();
        let extension: Vec<u16> = "workmemo\0".encode_utf16().collect();
        let mut ofn: OPENFILENAMEW = unsafe { std::mem::zeroed() };
        ofn.lStructSize = std::mem::size_of::<OPENFILENAMEW>() as u32;
        ofn.lpstrFile = file.as_mut_ptr();
        ofn.nMaxFile = file.len() as u32;
        ofn.lpstrFilter = filter.as_ptr();
        ofn.lpstrDefExt = extension.as_ptr();
        ofn.Flags = OFN_EXPLORER
            | OFN_NOCHANGEDIR
            | if save {
                OFN_OVERWRITEPROMPT
            } else {
                OFN_FILEMUSTEXIST
            };
        let ok = unsafe {
            if save {
                GetSaveFileNameW(&mut ofn)
            } else {
                GetOpenFileNameW(&mut ofn)
            }
        };
        if ok == 0 {
            let e = unsafe { CommDlgExtendedError() };
            return if e == 0 {
                Ok(None)
            } else {
                Err(format!("文件选择失败：{e}"))
            };
        }
        let n = file.iter().position(|c| *c == 0).ok_or("路径无效")?;
        Ok(Some(PathBuf::from(
            String::from_utf16(&file[..n]).map_err(|e| e.to_string())?,
        )))
    }
    #[cfg(not(windows))]
    {
        let _ = save;
        Err("文件选择目前仅支持Windows。".into())
    }
}
fn config_dir(app: &tauri::AppHandle) -> Result<PathBuf> {
    {
        let d = app.path().app_config_dir().map_err(|e| e.to_string())?;
        std::fs::create_dir_all(&d).map_err(|e| e.to_string())?;
        Ok(d)
    }
}
#[tauri::command]
pub async fn create_backup(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<String>> {
    let dir = config_dir(&app)?;
    let shared = state.inner.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let Some(path) = native_file(true)? else {
            return Ok(None);
        };
        let mut guard = shared.lock().map_err(|_| "数据锁异常")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        save_archive(&path, &store.archive(&dir)?)?;
        Ok(Some(path.display().to_string()))
    })
    .await
    .map_err(|e| e.to_string())?
}
#[tauri::command]
pub async fn restore_backup(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<String>> {
    if app
        .state::<crate::windows::WindowState>()
        .dirty
        .lock()
        .map_err(|_| "草稿状态异常")?
        .iter()
        .any(|(k, v)| k != "settings" && *v)
    {
        return Err("请先保存或放弃其他窗口中的修改，再恢复。".into());
    }
    let selected = app
        .state::<ArchiveSelection>()
        .0
        .lock()
        .map_err(|_| "备份选择锁异常")?
        .take()
        .ok_or("请先选择并校验备份。")?;
    let dir = config_dir(&app)?;
    let handle = app.clone();
    let result = service::access(state.inner.clone(), move |store| {
        if store.active()?.is_some_and(|r| !r.is_paused) {
            return Err("请先暂停当前计时，再恢复备份。".into());
        }
        let a = selected;
        let image = checked_image(&a, &dir)?;
        let backup = automatic_backup(store, &dir)?;
        let journal = dir.join("restore-journal.workmemo");
        save_archive(&journal, &store.archive(&dir)?)?;
        let result = write_configs(&dir, &a.settings).and_then(|_| store.apply_image(&image.0));
        if let Err(e) = result {
            recover_pending(store, &dir)?;
            return Err(format!("恢复失败，已回滚：{e}"));
        }
        std::fs::remove_file(journal).map_err(|e| e.to_string())?;
        Ok(Some(format!(
            "已恢复；原数据备份：{}。请重新打开设置以加载恢复后的界面设置。",
            backup.display()
        )))
    })
    .await;
    if matches!(result, Ok(Some(_))) {
        crate::windows::reload(&handle)?;
        crate::desktop::reload_island(&handle)?;
        let _ = handle.emit("workmemo:layout-changed", ());
        let _ = handle.emit("workmemo:data-changed", ());
        let _ = handle.emit("workmemo:appearance-changed", ());
        let _ = handle.emit("workmemo:presentation-changed", ());
    }
    result
}
fn preview_path(app: &tauri::AppHandle) -> Result<PathBuf> {
    let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    #[cfg(debug_assertions)]
    if app.config().identifier.starts_with("com.workmemo.test.")
        && app.config().identifier != "com.workmemo.test.monitor"
    {
        // Debug QA profiles never inspect the user's actual preview records.
        return Ok(dir
            .parent()
            .ok_or("数据目录无效")?
            .join(format!("{}.migration-source", app.config().identifier))
            .join("workmemo.sqlite3"));
    }
    Ok(dir
        .parent()
        .ok_or("数据目录无效")?
        .join("com.workmemo.test.monitor")
        .join("workmemo.sqlite3"))
}
fn preview_copy(path: &Path, dir: &Path) -> Result<(Store, Scratch, File)> {
    if !path.is_file() {
        return Err("未发现预览数据。".into());
    }
    #[cfg(windows)]
    let lock = {
        use std::os::windows::fs::OpenOptionsExt;
        std::fs::OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .truncate(false)
            .share_mode(0)
            .open(path.with_extension("lock"))
            .map_err(|_| "请从托盘退出预览程序后再迁移。")?
    };
    #[cfg(not(windows))]
    let lock = File::open(path).map_err(|e| e.to_string())?;
    let source = Connection::open_with_flags(path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
        .map_err(db_error)?;
    let t = scratch(dir)?;
    source
        .backup("main", &t.0, None::<fn(rusqlite::backup::Progress)>)
        .map_err(db_error)?;
    let store = Store::initialize(
        Connection::open(&t.0).map_err(db_error)?,
        Box::new(SystemClock::new()),
        None,
    )?;
    Ok((store, t, lock))
}
fn report(source: &Store) -> Result<ImportReport> {
    let (records,pending,active)=source.connection.query_row("SELECT COUNT(*),COALESCE(SUM(settlement_status='PENDING'),0),COALESCE(SUM(status='WORKING'),0) FROM work_records",[],|r|Ok((r.get::<_,i64>(0)? as usize,r.get::<_,i64>(1)? as usize,r.get::<_,i64>(2)? as usize))).map_err(db_error)?;
    Ok(ImportReport {
        records,
        pending,
        active,
        ..Default::default()
    })
}
fn fingerprint(source: &Store, id: i64) -> Result<String> {
    let record = serde_json::to_value(source.record(id)?).map_err(|e| e.to_string())?;
    let segments:Vec<String>=source.connection.prepare("SELECT printf('%lld:%lld:%lld:%lld:%s',start_time,COALESCE(end_time,0),checkpoint_time,duration_ms,state) FROM work_segments WHERE record_id=?1 ORDER BY id").map_err(db_error)?.query_map([id],|r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
    let revisions:Vec<String>=source.connection.prepare("SELECT before_json||after_json FROM record_revisions WHERE record_id=?1 ORDER BY revision").map_err(db_error)?.query_map([id],|r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
    serde_json::to_string(&(record, segments, revisions)).map_err(|e| e.to_string())
}
fn copy_row(
    tx: &rusqlite::Transaction,
    source: &Connection,
    table: &str,
    source_id: i64,
    new_parent: Option<i64>,
) -> Result<i64> {
    let cols: Vec<String> = source
        .prepare(&format!("PRAGMA table_info({table})"))
        .map_err(db_error)?
        .query_map([], |r| r.get(1))
        .map_err(db_error)?
        .collect::<rusqlite::Result<_>>()
        .map_err(db_error)?;
    let mut vals: Vec<rusqlite::types::Value> = source
        .query_row(
            &format!("SELECT {} FROM {table} WHERE id=?1", cols.join(",")),
            [source_id],
            |r| (0..cols.len()).map(|i| r.get(i)).collect(),
        )
        .map_err(db_error)?;
    vals[0] = rusqlite::types::Value::Null;
    if let Some(parent) = new_parent {
        if let Some(i) = cols.iter().position(|n| n == "record_id") {
            vals[i] = parent.into();
        }
        if table == "record_revisions" {
            for field in ["before_json", "after_json"] {
                let i = cols
                    .iter()
                    .position(|n| n == field)
                    .ok_or("修正记录格式无效")?;
                if let rusqlite::types::Value::Text(text) = &vals[i] {
                    let mut json: serde_json::Value =
                        serde_json::from_str(text).map_err(|e| e.to_string())?;
                    if let Some(id) = json.get_mut("id") {
                        *id = parent.into();
                    }
                    vals[i] = serde_json::to_string(&json)
                        .map_err(|e| e.to_string())?
                        .into();
                }
            }
        }
    }
    let marks = vec!["?"; cols.len()].join(",");
    tx.execute(
        &format!("INSERT INTO {table}({}) VALUES({marks})", cols.join(",")),
        rusqlite::params_from_iter(vals),
    )
    .map_err(db_error)?;
    Ok(tx.last_insert_rowid())
}
#[cfg(test)]
fn merge(target: &mut Store, source: &Store) -> Result<ImportReport> {
    merge_options(target, source, false)
}
fn merge_options(target: &mut Store, source: &Store, include_config: bool) -> Result<ImportReport> {
    if include_config && target.active()?.is_some() {
        return Err("当前有未结束任务，请先只迁移记录；监测配置需在任务处理后导入。".into());
    }
    let config = if include_config {
        Some(source.monitor_config()?)
    } else {
        None
    };
    let names = if include_config {
        Some(source.category_names()?)
    } else {
        None
    };
    let mut r = report(source)?;
    let active = target.active()?.is_some();
    let ids: Vec<i64> = source
        .connection
        .prepare("SELECT id FROM work_records ORDER BY id")
        .map_err(db_error)?
        .query_map([], |r| r.get(0))
        .map_err(db_error)?
        .collect::<rusqlite::Result<_>>()
        .map_err(db_error)?;
    let tx = target
        .connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(db_error)?;
    for id in ids {
        let record = source.record(id)?;
        let key = format!("preview:{id}:{}", record.start_time);
        let fp = fingerprint(source, id)?;
        let previous: Option<String> = tx
            .query_row(
                "SELECT fingerprint FROM import_sources WHERE source_key=?1",
                [&key],
                |r| r.get(0),
            )
            .optional()
            .map_err(db_error)?;
        if let Some(old) = previous {
            if old == fp {
                r.duplicates += 1
            } else {
                r.conflicts += 1;
                r.conflict_ids.push(id);
            }
            continue;
        }
        if record.status == "SUSPENDED" || (active && record.status == "WORKING") {
            r.skipped_active += 1;
            r.skipped_active_ids.push(id);
            continue;
        }
        let new_id = copy_row(&tx, &source.connection, "work_records", id, None)?;
        for table in ["work_segments", "record_revisions"] {
            let children: Vec<i64> = source
                .connection
                .prepare(&format!(
                    "SELECT id FROM {table} WHERE record_id=?1 ORDER BY id"
                ))
                .map_err(db_error)?
                .query_map([id], |r| r.get(0))
                .map_err(db_error)?
                .collect::<rusqlite::Result<_>>()
                .map_err(db_error)?;
            for child in children {
                copy_row(&tx, &source.connection, table, child, Some(new_id))?;
            }
        }
        if record.status == "FINISHED" && record.settlement_status == "PENDING" {
            tx.execute(
                "INSERT INTO end_reminders(record_id,dismissed) VALUES(?1,1)",
                [new_id],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "INSERT INTO import_sources VALUES(?1,?2,?3)",
            params![key, new_id, fp],
        )
        .map_err(db_error)?;
        r.imported += 1;
    }
    if let Some(c) = config {
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for rule in c.rules {
            let task_id: i64 = tx
                .query_row(
                    "SELECT id FROM work_tasks WHERE category=?1 ORDER BY id LIMIT 1",
                    [&rule.category],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES(?1,?2,?3,?4)",
                params![rule.url_prefix, rule.category, rule.match_mode, task_id],
            )
            .map_err(db_error)?;
        }
        tx.execute("UPDATE monitoring_settings SET enabled=0,revision=revision+1,idle_warning_seconds=?1,idle_end_seconds=?2,away_pause_seconds=?3,hold_seconds=?4,poll_interval_seconds=?5,auto_resume_manual=?6,browsing_only=?7,idle_pause_seconds=?8 WHERE id=1",params![c.times.idle_warning_seconds,c.times.idle_end_seconds,c.times.away_pause_seconds,c.times.hold_seconds,c.poll_interval_seconds,c.auto_resume_manual,c.browsing_only,c.times.idle_pause_seconds]).map_err(db_error)?;
    }
    if let Some(names) = names {
        // Temporarily use unique names so swaps never violate the UNIQUE constraint.
        tx.execute(
            "UPDATE category_names SET display_name=category||char(1)",
            [],
        )
        .map_err(db_error)?;
        for (category, name) in names.names {
            tx.execute(
                "UPDATE category_names SET display_name=?1,revision=revision+1 WHERE category=?2",
                params![name, category],
            )
            .map_err(db_error)?;
        }
    }
    tx.commit().map_err(db_error)?;
    target.monitor.config = target.monitor_config()?;
    if include_config {
        target.monitor.page = None;
        target.monitor.entered_at = None;
        target.monitor.page_was_matched = false;
    }
    Ok(r)
}
#[tauri::command]
pub async fn preview_migration(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<ImportReport>> {
    let path = preview_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let dir = config_dir(&app)?;
    service::access(state.inner.clone(), move |_| {
        let (s, _t, _lock) = preview_copy(&path, &dir)?;
        let mut r = report(&s)?;
        r.source = Some(path.display().to_string());
        Ok(Some(r))
    })
    .await
}
#[tauri::command]
pub async fn import_preview(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
    include_config: bool,
) -> Result<ImportReport> {
    let path = preview_path(&app)?;
    let dir = config_dir(&app)?;
    let result = service::access(state.inner.clone(), move |store| {
        let (source, _temp, _lock) = preview_copy(&path, &dir)?;
        let backup = automatic_backup(store, &dir)?;
        let mut r = merge_options(store, &source, include_config)?;
        r.source = Some(path.display().to_string());
        r.backup = Some(backup.display().to_string());
        Ok(r)
    })
    .await;
    if result.is_ok() {
        let _ = app.emit("workmemo:data-changed", ());
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::{TestClock, TestDirectory};
    #[test]
    fn merge_is_idempotent_conflicts_do_not_replace_and_restore_rolls_back() {
        let mut a = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        let mut b = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        a.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "original".into(),
        })
        .unwrap();
        a.finish(1).unwrap();
        assert_eq!(merge(&mut b, &a).unwrap().imported, 1);
        assert_eq!(merge(&mut b, &a).unwrap().duplicates, 1);
        a.connection
            .execute("UPDATE work_records SET remark='changed' WHERE id=1", [])
            .unwrap();
        assert_eq!(merge(&mut b, &a).unwrap().conflicts, 1);
        assert_eq!(b.record(1).unwrap().remark, "original");
        let d = TestDirectory::new();
        let archive = b.archive(d.db().parent().unwrap()).unwrap();
        let image = checked_image(&archive, d.db().parent().unwrap()).unwrap();
        b.connection
            .execute("UPDATE work_records SET remark='temporary' WHERE id=1", [])
            .unwrap();
        b.apply_image(&image.0).unwrap();
        assert_eq!(b.record(1).unwrap().remark, "original");
    }
    #[test]
    fn backup_restore_keeps_names_and_idle_threshold_while_records_only_import_keeps_local_names() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        let mut names = source.category_names().unwrap();
        names.names.insert("开发".into(), "编程任务".into());
        source.save_category_names(names).unwrap();
        source
            .connection
            .execute("UPDATE monitoring_settings SET idle_pause_seconds=25", [])
            .unwrap();
        let archive = source.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        let mut target = empty();
        merge(&mut target, &source).unwrap();
        assert_eq!(target.category_names().unwrap().names["开发"], "开发");
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.category_names().unwrap(),
            source.category_names().unwrap()
        );
        assert_eq!(
            target.monitor_config().unwrap().times.idle_pause_seconds,
            25
        );
        assert_eq!(target.record(1).unwrap().category, "开发");
    }
    #[test]
    fn legacy_schema_backup_and_new_rule_modes_restore() {
        let d = TestDirectory::new();
        let dir = d.db().parent().unwrap().to_path_buf();
        let mut source = empty();
        source.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode) VALUES('cn-beijing-vpc.fcapp.run','开发','domain_suffix')",[]).unwrap();
        let image = checked_image(&source.archive(&dir).unwrap(), &dir).unwrap();
        let mut target = empty();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.monitor_config().unwrap().rules[0].match_mode,
            "domain_suffix"
        );
        source.connection.execute_batch("PRAGMA foreign_keys=OFF; DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; DROP TABLE ignored_work_urls; DROP TABLE work_tasks; DELETE FROM work_urls; ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; INSERT INTO work_urls(url_prefix,category) VALUES('https://example.com/','开发'); ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;").unwrap();
        let image = checked_image(&source.archive(&dir).unwrap(), &dir).unwrap();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.monitor_config().unwrap().rules[0].match_mode,
            "path_prefix"
        );
    }
    #[test]
    fn full_restore_preserves_named_tasks_bindings_and_ignored_pages() {
        let d = TestDirectory::new();
        let dir = d.db().parent().unwrap().to_path_buf();
        let mut source = empty();
        source
            .connection
            .execute(
                "INSERT INTO work_tasks(name,category) VALUES('客户甲','开发')",
                [],
            )
            .unwrap();
        let task = source.connection.last_insert_rowid();
        source.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES('https://client.example.test/work','开发','path_prefix',?1)",[task]).unwrap();
        source.connection.execute("INSERT INTO ignored_work_urls(match_mode,url_prefix) VALUES('origin','https://private.example.test/')",[]).unwrap();
        let image = checked_image(&source.archive(&dir).unwrap(), &dir).unwrap();
        let mut target = empty();
        target.apply_image(&image.0).unwrap();
        assert!(
            target
                .page_tasks()
                .unwrap()
                .iter()
                .any(|t| t.name == "客户甲")
        );
        assert!(
            target
                .is_ignored_page("https://private.example.test/read")
                .unwrap()
        );
        let mapped: i64 = target
            .connection
            .query_row(
                "SELECT task_id FROM work_urls WHERE url_prefix='https://client.example.test/work'",
                [],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(mapped, task);
    }
    #[test]
    fn full_restore_keeps_pause_date_and_expiration_excludes_downtime() {
        let d = TestDirectory::new();
        let database_path = d.db();
        let dir = database_path.parent().unwrap();
        let clock = TestClock::new();
        let midnight = 16 * 3_600_000;
        clock.jump_wall(midnight - 1000 - clock.now().wall_ms);
        let mut source = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        start(&mut source);
        let id = source.active().unwrap().unwrap().id;
        clock.advance(100);
        source.pause(id).unwrap();
        let image = checked_image(&source.archive(dir).unwrap(), dir).unwrap();
        let mut target = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target
                .connection
                .query_row(
                    "SELECT paused_at FROM work_records WHERE id=?1",
                    [id],
                    |r| r.get::<_, i64>(0)
                )
                .unwrap(),
            midnight - 900
        );
        clock.advance(900);
        assert!(target.snapshot().unwrap().active.is_none());
        assert_eq!(target.record(id).unwrap().status, "FINISHED");
        assert_eq!(target.record(id).unwrap().duration_ms, 100);
        assert_eq!(target.pending_records().unwrap().len(), 1);
    }

    fn empty() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    fn start(s: &mut Store) {
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "test".into(),
        })
        .unwrap();
    }
    #[test]
    fn active_conflicts_preserve_both_tasks_but_import_finished() {
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        start(&mut source);
        source.pause(2).unwrap();
        let mut target = empty();
        start(&mut target);
        target.pause(1).unwrap();
        let r = merge(&mut target, &source).unwrap();
        assert_eq!(r.imported, 1);
        assert_eq!(r.skipped_active_ids, vec![2]);
        assert_eq!(target.active().unwrap().unwrap().id, 1);
        assert!(source.active().unwrap().is_some());
    }
    #[test]
    fn id_collisions_remap_segments_and_audit_without_changing_times() {
        let clock = TestClock::new();
        let mut source = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        start(&mut source);
        clock.advance(12345);
        source.finish(1).unwrap();
        let before = source.record(1).unwrap();
        source
            .settle(SettleInput {
                id: 1,
                expected_revision: before.revision,
                category: "文档".into(),
                quantity: 3.5,
                remark: "corrected".into(),
            })
            .unwrap();
        let original = source.record(1).unwrap();
        let mut target = empty();
        start(&mut target);
        target.finish(1).unwrap();
        assert_eq!(merge(&mut target, &source).unwrap().imported, 1);
        let imported = target.record(2).unwrap();
        assert_eq!(imported.duration_ms, original.duration_ms);
        assert_eq!(imported.end_time, original.end_time);
        assert_eq!(imported.confirmed_end_time, original.confirmed_end_time);
        assert_eq!(imported.quantity, Some(3.5));
        let (parent, duration): (i64, i64) = target
            .connection
            .query_row(
                "SELECT record_id,duration_ms FROM work_segments WHERE record_id=2",
                [],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .unwrap();
        assert_eq!((parent, duration), (2, 12345));
        let (parent, before, after): (i64, String, String) = target
            .connection
            .query_row(
                "SELECT record_id,before_json,after_json FROM record_revisions",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
            )
            .unwrap();
        assert_eq!(parent, 2);
        let before: serde_json::Value = serde_json::from_str(&before).unwrap();
        let after: serde_json::Value = serde_json::from_str(&after).unwrap();
        assert_eq!(before["id"], 2);
        assert_eq!(after["id"], 2);
        assert_eq!(after["remark"], "corrected");
        let r = merge(&mut target, &source).unwrap();
        assert_eq!(r.duplicates, 1);
        source
            .connection
            .execute(
                "UPDATE work_records SET remark='changed again' WHERE id=1",
                [],
            )
            .unwrap();
        assert_eq!(merge(&mut target, &source).unwrap().conflict_ids, vec![1]);
    }
    #[test]
    fn unfinished_preview_is_imported_as_recovery_without_downtime() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut source = empty();
        start(&mut source);
        let archive = source.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        let recovered = Store::open(&image.0, Box::new(SystemClock::new())).unwrap();
        let mut target = empty();
        assert_eq!(merge(&mut target, &recovered).unwrap().imported, 1);
        let task = target.active().unwrap().unwrap();
        assert!(task.is_paused && task.recovery_pending);
        assert_eq!(task.duration_ms, 0);
        assert!(!source.active().unwrap().unwrap().is_paused);
    }
    #[test]
    fn migration_preserves_config_by_default_and_imports_options_only_when_requested() {
        let mut source = empty();
        let mut names = source.category_names().unwrap();
        names.names.insert("开发".into(), "编程".into());
        source.save_category_names(names).unwrap();
        source.connection.execute("UPDATE monitoring_settings SET poll_interval_seconds=5,auto_resume_manual=0,enabled=1,idle_pause_seconds=15",[]).unwrap();
        let mut target = empty();
        merge(&mut target, &source).unwrap();
        assert_eq!(target.monitor_config().unwrap().poll_interval_seconds, 1);
        assert_eq!(target.category_names().unwrap().names["开发"], "开发");
        merge_options(&mut target, &source, true).unwrap();
        let config = target.monitor_config().unwrap();
        assert_eq!(config.poll_interval_seconds, 5);
        assert_eq!(config.times.idle_pause_seconds, 15);
        assert_eq!(target.category_names().unwrap().names["开发"], "编程");
        assert!(!config.auto_resume_manual);
        assert!(!config.enabled);
        start(&mut target);
        assert!(merge_options(&mut target, &source, true).is_err());
        assert!(target.active().unwrap().is_some());
    }
    #[test]
    fn migration_failure_rolls_back_all_imported_rows() {
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        let mut target = empty();
        target.connection.execute_batch("CREATE TRIGGER refuse_import BEFORE INSERT ON import_sources BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(merge(&mut target, &source).is_err());
        assert_eq!(
            target
                .connection
                .query_row("SELECT COUNT(*) FROM work_records", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            0
        );
    }
    #[test]
    fn restore_failure_rolls_back_database_and_journal_recovers_old_snapshot() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut store = empty();
        start(&mut store);
        store.finish(1).unwrap();
        let archive = store.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        store
            .connection
            .execute("UPDATE work_records SET remark='current' WHERE id=1", [])
            .unwrap();
        store.connection.execute_batch("CREATE TRIGGER fail_restore BEFORE INSERT ON work_records BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(store.apply_image(&image.0).is_err());
        assert_eq!(store.record(1).unwrap().remark, "current");
        store
            .connection
            .execute_batch("DROP TRIGGER fail_restore")
            .unwrap();
        save_archive(&dir.join("restore-journal.workmemo"), &archive).unwrap();
        recover_pending(&mut store, dir).unwrap();
        assert_eq!(store.record(1).unwrap().remark, "test");
        assert!(!dir.join("restore-journal.workmemo").exists());
    }
    #[test]
    fn corrupted_backup_and_future_layout_are_rejected() {
        let mut archive = Archive {
            version: 1,
            database: vec![1, 2, 3],
            settings: BTreeMap::new(),
        };
        let d = TestDirectory::new();
        assert!(checked_image(&archive, d.db().parent().unwrap()).is_err());
        archive.settings.insert("window-layout.json".into(),br#"{"density":"comfortable","windows":{"evil":{"x":0,"y":0,"width":400,"height":400}}}"#.to_vec());
        assert!(validate_settings(&archive.settings).is_err());
        archive.settings.clear();
        archive.settings.insert(
            "island.json".into(),
            br#"{"version":1,"enabled":true,"position":["invalid",0]}"#.to_vec(),
        );
        assert!(validate_settings(&archive.settings).is_err());
    }
}

#[tauri::command]
pub fn detect_preview_data(app: tauri::AppHandle) -> Result<bool> {
    Ok(preview_path(&app)?.is_file())
}

#[cfg(test)]
mod image_backup_tests {
    use super::*;
    use crate::{
        database::tests::{TestClock, TestDirectory},
        presentation::{Background, Presentation},
    };
    #[test]
    fn snapshot_keeps_managed_background_and_rejects_missing_image() {
        let source = TestDirectory::new();
        let path = source.db();
        let directory = path.parent().unwrap();
        let backgrounds = directory.join("backgrounds");
        std::fs::create_dir(&backgrounds).unwrap();
        let mut bytes = std::io::Cursor::new(Vec::new());
        image::DynamicImage::new_rgb8(2, 2)
            .write_to(&mut bytes, image::ImageFormat::Png)
            .unwrap();
        std::fs::write(backgrounds.join("bg-test.png"), bytes.get_ref()).unwrap();
        let p = Presentation {
            background: Some(Background {
                file: "bg-test.png".into(),
                opacity: 37,
            }),
            ..Default::default()
        };
        std::fs::write(
            directory.join("presentation.json"),
            serde_json::to_vec(&p).unwrap(),
        )
        .unwrap();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        let archive = store.archive(directory).unwrap();
        assert_eq!(archive.version, 2);
        validate_settings(&archive.settings).unwrap();
        assert_eq!(
            &archive.settings["backgrounds/bg-test.png"],
            bytes.get_ref()
        );
        let target = TestDirectory::new();
        let target_path = target.db();
        let target_dir = target_path.parent().unwrap();
        write_configs(target_dir, &archive.settings).unwrap();
        assert_eq!(
            crate::presentation::load(target_dir)
                .unwrap()
                .background
                .unwrap()
                .opacity,
            37
        );
        let mut missing = archive.settings.clone();
        missing.remove("backgrounds/bg-test.png");
        assert!(validate_settings(&missing).is_err());
        let mut invalid = archive.settings.clone();
        invalid.insert("backgrounds/../secret.png".into(), vec![1]);
        assert!(validate_settings(&invalid).is_err());
        for dir in [directory, target_dir] {
            std::fs::remove_file(dir.join("backgrounds/bg-test.png")).unwrap();
            std::fs::remove_dir(dir.join("backgrounds")).unwrap();
            std::fs::remove_file(dir.join("presentation.json")).unwrap();
        }
    }
}

```

## UPDATE — E:\WorkMemo\src-tauri\src\database_tests.rs

```rust

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

```

## UPDATE — E:\WorkMemo\src-tauri\src\settlement_tests.rs

```rust

use super::tests::{TestClock, TestDirectory};
use super::*;

fn start(quantity: Option<f64>) -> StartInput {
    StartInput {
        category: "开发".into(),
        quantity,
        remark: "原始备注".into(),
    }
}
fn settle(id: i64, quantity: f64) -> SettleInput {
    SettleInput {
        id,
        expected_revision: 0,
        category: "文档".into(),
        quantity,
        remark: "  结算备注  ".into(),
    }
}
fn memory() -> (Store, TestClock) {
    let clock = TestClock::new();
    (
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap(),
        clock,
    )
}

#[test]
fn empty_quantity_finishes_durably_without_blocking_next_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let first;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(start(None)).unwrap();
        first = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(first).unwrap();
        store.finish(first).unwrap();
        let pending = store.pending_records().unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].quantity, None);
        assert_eq!(pending[0].duration_ms, 1250);
        assert_eq!(pending[0].settlement_status, "PENDING");
        store.start(start(Some(0.0))).unwrap();
        assert_ne!(store.active().unwrap().unwrap().id, first);
        assert_eq!(store.snapshot().unwrap().pending_count, 1);
    }
    clock.advance(30_000); // Recovery within the same Beijing day remains resumable.
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert_eq!(reopened.pending_records().unwrap()[0].id, first);
    reopened.settle(settle(first, 0.0)).unwrap();
    assert_eq!(reopened.pending_records().unwrap().len(), 0);
    let saved = reopened.record(first).unwrap();
    assert_eq!(saved.quantity, Some(0.0));
    assert_eq!(saved.settlement_status, "COMPLETE");
    assert_eq!(saved.duration_ms, 1250);
    assert!(reopened.active().unwrap().is_some());
}

#[test]
fn settlement_audits_original_data_rejects_stale_edits_and_is_idempotent() {
    let (mut store, clock) = memory();
    store.start(start(Some(2.0))).unwrap();
    let id = store.active().unwrap().unwrap().id;
    assert!(store.settle(settle(id, 3.0)).is_err());
    clock.advance(1000);
    store.finish(id).unwrap();
    store.settle(settle(id, 3.0)).unwrap();
    store.settle(settle(id, 3.0)).unwrap();
    assert!(store.settle(settle(id, 4.0)).is_err());
    let (count, before, after): (i64, String, String) = store
        .connection
        .query_row(
            "SELECT COUNT(*),before_json,after_json FROM record_revisions WHERE record_id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .unwrap();
    assert_eq!(count, 1);
    let before: serde_json::Value = serde_json::from_str(&before).unwrap();
    let after: serde_json::Value = serde_json::from_str(&after).unwrap();
    assert_eq!(before["quantity"], 2.0);
    assert_eq!(before["remark"], "原始备注");
    assert_eq!(before["settlement_status"], "PENDING");
    assert_eq!(after["quantity"], 3.0);
    assert_eq!(after["duration_ms"], 1000);
    let mut correction = settle(id, 4.0);
    correction.expected_revision = 1;
    store.settle(correction).unwrap();
    assert_eq!(store.record(id).unwrap().revision, 2);
}

#[test]
fn failed_audit_write_rolls_back_entire_settlement() {
    let (mut store, _) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    store.finish(id).unwrap();
    store.connection.execute_batch("CREATE TRIGGER reject_audit BEFORE INSERT ON record_revisions BEGIN SELECT RAISE(ABORT,'disk failure'); END;").unwrap();
    assert!(store.settle(settle(id, 0.0)).is_err());
    let saved = store.record(id).unwrap();
    assert_eq!(saved.quantity, None);
    assert_eq!(saved.revision, 0);
    assert_eq!(saved.settlement_status, "PENDING");
}

#[test]
fn intervals_and_record_checkpoint_are_atomic_and_recover_at_last_checkpoint() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(start(None)).unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1500);
        store.checkpoint().unwrap();
        store.connection.execute_batch("CREATE TRIGGER reject_record BEFORE UPDATE ON work_records BEGIN SELECT RAISE(ABORT,'disk failure'); END;").unwrap();
        clock.advance(500);
        assert!(store.checkpoint().is_err());
        let duration: i64 = store
            .connection
            .query_row("SELECT duration_ms FROM work_segments", [], |r| r.get(0))
            .unwrap();
        assert_eq!(duration, 1500);
        store
            .connection
            .execute_batch("DROP TRIGGER reject_record;")
            .unwrap();
    }
    clock.advance(30_000); // Same-day recovery keeps this atomic checkpoint scenario resumable.
    let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let recovered = store.active().unwrap().unwrap();
    assert_eq!(recovered.duration_ms, 1500);
    assert_eq!(recovered.pause_reason.as_deref(), Some("RECOVERY"));
    let state: String = store
        .connection
        .query_row("SELECT state FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(state, "RECOVERED");
    store.resume(id).unwrap();
    clock.advance(750);
    store.pause(id).unwrap();
    clock.advance(30_000);
    store.finish(id).unwrap();
    let saved = store.record(id).unwrap();
    assert_eq!(saved.duration_ms, 2250);
    assert!(saved.confirmed_end_time.unwrap() > saved.end_time.unwrap());
    let sum: i64 = store
        .connection
        .query_row(
            "SELECT SUM(duration_ms) FROM work_segments WHERE record_id=?1",
            [id],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(sum, saved.duration_ms);
}

#[test]
fn migration_preserves_legacy_fields_duration_id_sequence_and_manual_pause() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=1;
        INSERT INTO work_records(id,category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused) VALUES(7,'文档',1.25,'保留原文',1000,9000,1234,1,'FINISHED',1);
        INSERT INTO work_records(id,category,quantity,start_time,duration_ms,duration_seconds,status,is_paused) VALUES(9,'开发',2.5,10000,2400,2,'WORKING',1);
        UPDATE sqlite_sequence SET seq=100 WHERE name='work_records';").unwrap();
    let clock = TestClock::new();
    let mut store = Store::initialize(connection, Box::new(clock.clone()), None).unwrap();
    let old = store.record(7).unwrap();
    assert_eq!(
        (
            old.id,
            old.quantity,
            old.duration_ms,
            old.legacy_duration_ms
        ),
        (7, Some(1.25), 1234, 1234)
    );
    assert_eq!(old.remark, "保留原文");
    assert_eq!(old.end_time, Some(9000));
    assert_eq!(old.settlement_status, "COMPLETE");
    let paused = store.active().unwrap().unwrap();
    assert_eq!(paused.pause_reason.as_deref(), Some("MANUAL"));
    assert!(paused.is_paused && paused.recovery_pending);
    let count: i64 = store
        .connection
        .query_row("SELECT COUNT(*) FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(count, 0);
    store.resume(9).unwrap();
    clock.advance(600);
    store.finish(9).unwrap();
    assert_eq!(store.record(9).unwrap().duration_ms, 3000);
    store.start(start(None)).unwrap();
    assert_eq!(store.active().unwrap().unwrap().id, 101);
    assert_eq!(
        store
            .connection
            .query_row("PRAGMA integrity_check", [], |r| r.get::<_, String>(0))
            .unwrap(),
        "ok"
    );
}

#[test]
fn pending_work_counts_time_but_not_prefilled_quantity() {
    let (mut store, clock) = memory();
    store.start(start(Some(42.0))).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(1200);
    store.finish(id).unwrap();
    let query = || HistoryQuery {
        start_date: "1970-01-01".into(),
        end_date: "1970-01-02".into(),
        category: None,
        page: 1,
    };
    let before = store.query_history(query()).unwrap();
    assert_eq!(before.filtered.quantity, 0.0);
    assert_eq!(before.filtered.duration_ms, 1200);
    assert_eq!(before.filtered.pending_records, 1);
    store.settle(settle(id, 0.0)).unwrap();
    let after = store.query_history(query()).unwrap();
    assert_eq!(after.filtered.quantity, 0.0);
    assert_eq!(after.filtered.pending_records, 0);
    assert_eq!(after.filtered.duration_ms, 1200);
}

#[test]
fn failed_finish_does_not_close_interval_or_create_pending_record() {
    let (mut store, clock) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(1000);
    store.connection.execute_batch("CREATE TRIGGER reject_finish BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'finish failure'); END;").unwrap();
    assert!(store.finish(id).is_err());
    assert!(!store.active().unwrap().unwrap().is_paused);
    assert!(store.pending_records().unwrap().is_empty());
    let state: String = store
        .connection
        .query_row("SELECT state FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(state, "OPEN");
    store
        .connection
        .execute_batch("DROP TRIGGER reject_finish")
        .unwrap();
    clock.advance(500);
    store.finish(id).unwrap();
    assert_eq!(store.record(id).unwrap().duration_ms, 1500);
}

#[test]
fn failed_migration_rolls_back_schema_records_and_sequence() {
    let directory = TestDirectory::new();
    {
        let connection = Connection::open(directory.db()).unwrap();
        connection
            .execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        connection.execute_batch("PRAGMA user_version=1;
            INSERT INTO work_records(id,category,quantity,start_time,end_time,status,is_paused) VALUES(7,'文档',2.5,1000,2000,'FINISHED',1);
            UPDATE sqlite_sequence SET seq=100 WHERE name='work_records';
            CREATE TABLE work_segments(marker TEXT);").unwrap();
    }
    assert!(Store::open(&directory.db(), Box::new(TestClock::new())).is_err());
    let connection = Connection::open(directory.db()).unwrap();
    assert_eq!(
        connection
            .query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
            .unwrap(),
        1
    );
    assert_eq!(
        connection
            .query_row("SELECT quantity FROM work_records WHERE id=7", [], |r| r
                .get::<_, f64>(0))
            .unwrap(),
        2.5
    );
    assert_eq!(
        connection
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name='work_records'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        100
    );
    assert_eq!(
        connection
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE name='work_records_v2'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        0
    );
}

#[test]
fn pending_list_includes_older_records_and_delete_cascades_dependent_data() {
    let (mut store, _) = memory();
    for _ in 0..35 {
        store.start(start(None)).unwrap();
        let id = store.active().unwrap().unwrap().id;
        store.finish(id).unwrap();
    }
    assert_eq!(store.snapshot().unwrap().recent_records.len(), 5);
    assert_eq!(store.snapshot().unwrap().pending_count, 35);
    let pending = store.pending_records().unwrap();
    assert_eq!(pending.len(), 35);
    let old = pending[0].id;
    store.settle(settle(old, 0.0)).unwrap();
    store.delete_record(old).unwrap();
    for table in ["work_segments", "record_revisions"] {
        let remaining: i64 = store
            .connection
            .query_row(
                &format!("SELECT COUNT(*) FROM {table} WHERE record_id=?1"),
                [old],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(remaining, 0);
    }
    assert_eq!(store.pending_records().unwrap().len(), 34);
    assert_eq!(
        store
            .connection
            .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |r| r
                .get::<_, i64>(
                0
            ))
            .unwrap(),
        0
    );
}

#[test]
fn invalid_settlement_keeps_time_and_pending_status() {
    let (mut store, clock) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(500);
    store.finish(id).unwrap();
    for quantity in [-1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        assert!(store.settle(settle(id, quantity)).is_err());
    }
    let mut invalid = settle(id, 1.0);
    invalid.remark = "字".repeat(2001);
    assert!(store.settle(invalid).is_err());
    let mut invalid = settle(id, 1.0);
    invalid.category = "未知".into();
    assert!(store.settle(invalid).is_err());
    let saved = store.record(id).unwrap();
    assert_eq!(saved.duration_ms, 500);
    assert_eq!(saved.quantity, None);
    assert_eq!(saved.settlement_status, "PENDING");
    assert_eq!(saved.revision, 0);
}

```

## UPDATE — E:\WorkMemo\src-tauri\src\reliability_tests.rs

```rust

use super::*;
use crate::appearance::{self, Appearance, Theme};
use std::{
    path::PathBuf,
    process::Command,
    sync::{Arc, Mutex},
};

struct Directory(PathBuf);
impl Directory {
    fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "workmemo-phase7-{}-{nonce}-{}",
            std::process::id(),
            {
                static NEXT: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
                NEXT.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
            }
        ));
        std::fs::create_dir(&path).unwrap();
        Self(path)
    }
    fn db(&self) -> PathBuf {
        self.0.join("probe.sqlite3")
    }
    fn settings(&self) -> PathBuf {
        self.0.join("appearance.json")
    }
}
impl Drop for Directory {
    fn drop(&mut self) {
        // Only the exact, freshly created test directory can be recursively removed.
        let temp = std::env::temp_dir().canonicalize().unwrap();
        let path = self.0.canonicalize().unwrap();
        assert_eq!(path.parent(), Some(temp.as_path()));
        assert!(
            path.file_name()
                .unwrap()
                .to_string_lossy()
                .starts_with("workmemo-phase7-")
        );
        std::fs::remove_dir_all(path).unwrap();
    }
}

#[derive(Clone)]
struct TestClock(Arc<Mutex<TimePoint>>);
impl TestClock {
    fn new() -> Self {
        Self(Arc::new(Mutex::new(TimePoint {
            wall_ms: 1_792_000_000_000,
            ticks_ms: 0,
        })))
    }
    fn advance(&self, ms: i64) {
        let mut t = self.0.lock().unwrap();
        t.wall_ms += ms;
        t.ticks_ms += ms;
    }
    fn jump_wall(&self, ms: i64) {
        self.0.lock().unwrap().wall_ms += ms;
    }
}
impl Clock for TestClock {
    fn now(&self) -> TimePoint {
        *self.0.lock().unwrap()
    }
}

fn input(category: &str, quantity: f64) -> StartInput {
    StartInput {
        category: category.into(),
        quantity: Some(quantity),
        remark: "隔离可靠性测试，非产品数据".into(),
    }
}
fn query() -> HistoryQuery {
    HistoryQuery {
        start_date: "2026-01-01".into(),
        end_date: "2026-12-31".into(),
        category: None,
        page: 1,
    }
}
fn integrity(store: &Store) {
    let value: String = store
        .connection
        .query_row("PRAGMA integrity_check", [], |row| row.get(0))
        .unwrap();
    assert_eq!(value, "ok");
}

#[test]
fn long_workflow_matches_independent_time_model_across_themes_and_deletion() {
    let directory = Directory::new();
    let clock = TestClock::new();
    let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let mut seed = 0x4d454d4fu64;
    let mut completed = Vec::new();
    let mut expected_theme = Appearance::default();
    for task in 0..64 {
        let quantity = f64::from(task % 4 + 1) / 4.0;
        store
            .start(input(
                ["评测", "质检", "开发", "文档"][(task % 4) as usize],
                quantity,
            ))
            .unwrap();
        let id = store.active().unwrap().unwrap().id;
        let mut paused = false;
        let mut expected_ms = 0;
        for event in 0..24 {
            seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
            let elapsed = ((seed >> 32) % 4097) as i64;
            clock.advance(elapsed);
            if !paused {
                expected_ms += elapsed;
            }
            match (seed >> 16) % 7 {
                0 => {
                    store.pause(id).unwrap();
                    paused = true;
                }
                1 => {
                    store.resume(id).unwrap();
                    paused = false;
                }
                2 => {
                    store.checkpoint().unwrap();
                }
                3 => {
                    store.snapshot().unwrap();
                }
                4 => {
                    clock.jump_wall(if event % 2 == 0 { 600_000 } else { -600_000 });
                }
                5 => {
                    store.pause(id).unwrap();
                    store.pause(id).unwrap();
                    paused = true;
                }
                _ => {
                    expected_theme = Appearance {
                        version: 1,
                        theme: [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon]
                            [(event % 4) as usize],
                        opacity: if event % 2 == 0 { 80 } else { 100 },
                    };
                    appearance::save(&directory.settings(), expected_theme.clone()).unwrap();
                }
            }
            let active = store.snapshot().unwrap().active.unwrap();
            assert_eq!(
                (active.id, active.duration_ms, active.is_paused),
                (id, expected_ms, paused)
            );
            assert_eq!(active.quantity, Some(quantity));
        }
        store.finish(id).unwrap();
        let finished = store.record(id).unwrap();
        store
            .settle(SettleInput {
                id,
                expected_revision: finished.revision,
                category: finished.category,
                quantity,
                remark: finished.remark,
            })
            .unwrap();
        completed.push((id, expected_ms, quantity));
    }
    let summary = store.query_history(query()).unwrap();
    assert_eq!(summary.filtered.records, 64);
    assert_eq!(
        summary.filtered.duration_ms,
        completed.iter().map(|row| row.1).sum::<i64>()
    );
    assert_eq!(
        summary.filtered.quantity,
        completed.iter().map(|row| row.2).sum::<f64>()
    );
    for (index, row) in completed.iter().enumerate() {
        if index % 4 == 0 {
            store.delete_record(row.0).unwrap();
        }
    }
    let remaining = store.query_history(query()).unwrap();
    assert_eq!(remaining.filtered.records, 48);
    let expected: i64 = completed
        .iter()
        .enumerate()
        .filter(|(i, _)| i % 4 != 0)
        .map(|(_, row)| row.1)
        .sum();
    assert_eq!(remaining.filtered.duration_ms, expected);
    assert_eq!(
        remaining
            .daily
            .iter()
            .map(|row| row.totals.duration_ms)
            .sum::<i64>(),
        expected
    );
    assert_eq!(
        remaining
            .categories
            .iter()
            .map(|row| row.totals.records)
            .sum::<i64>(),
        48
    );
    integrity(&store);
    drop(store);
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(reopened.active().unwrap().is_none());
    assert_eq!(
        reopened
            .query_history(query())
            .unwrap()
            .filtered
            .duration_ms,
        expected
    );
    assert_eq!(
        appearance::load(&directory.settings()).unwrap(),
        expected_theme
    );
    integrity(&reopened);
}

#[test]
fn abrupt_process_exit_recovers_last_checkpoint_and_independent_appearance() {
    // The same test executable runs a guarded child branch and exits without Drop.
    // It does not launch, terminate, or alter the real WorkMemo application.
    if let Some(value) = std::env::var_os("WORKMEMO_TEST_CRASH_DIRECTORY") {
        let path = PathBuf::from(value).canonicalize().unwrap();
        assert_eq!(
            path.parent(),
            Some(std::env::temp_dir().canonicalize().unwrap().as_path())
        );
        assert!(
            path.file_name()
                .unwrap()
                .to_string_lossy()
                .starts_with("workmemo-phase7-")
        );
        assert_eq!(
            std::fs::read(path.join("worker-marker")).unwrap(),
            b"isolated recovery probe"
        );
        let clock = TestClock::new();
        let mut store = Store::open(&path.join("probe.sqlite3"), Box::new(clock.clone())).unwrap();
        store.start(input("文档", 1.0)).unwrap();
        let first = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(first).unwrap();
        store.start(input("开发", 2.5)).unwrap();
        clock.advance(2500);
        store.checkpoint().unwrap();
        appearance::save(
            &path.join("appearance.json"),
            Appearance {
                version: 1,
                theme: Theme::Neon,
                opacity: 83,
            },
        )
        .unwrap();
        clock.advance(800); // Unsaved tail must not be invented on recovery.
        std::process::exit(27);
    }
    let directory = Directory::new();
    std::fs::write(
        directory.0.join("worker-marker"),
        b"isolated recovery probe",
    )
    .unwrap();
    let output = Command::new(std::env::current_exe().unwrap())
        .args(["--exact", "database::reliability_tests::abrupt_process_exit_recovers_last_checkpoint_and_independent_appearance", "--nocapture"])
        .env("WORKMEMO_TEST_CRASH_DIRECTORY", &directory.0)
        .output().unwrap();
    assert_eq!(
        output.status.code(),
        Some(27),
        "child stdout: {} stderr: {}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert!(
        std::fs::metadata(directory.0.join("probe.sqlite3-wal"))
            .unwrap()
            .len()
            > 0
    );
    let clock = TestClock::new();
    clock.advance(30_000); // Same-day crash recovery; next-day expiry is tested separately.
    let mut recovered = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let active = recovered.snapshot().unwrap().active.unwrap();
    assert_eq!(active.id, 2);
    assert_eq!(active.duration_ms, 2500);
    assert!(active.is_paused && active.recovery_pending);
    assert_eq!(
        recovered
            .query_history(query())
            .unwrap()
            .filtered
            .duration_ms,
        1250
    );
    assert_eq!(
        appearance::load(&directory.settings()).unwrap(),
        Appearance {
            version: 1,
            theme: Theme::Neon,
            opacity: 83
        }
    );
    recovered.resume(active.id).unwrap();
    clock.advance(500);
    recovered.finish(active.id).unwrap();
    let summary = recovered.query_history(query()).unwrap();
    assert_eq!(summary.filtered.records, 2);
    assert_eq!(summary.filtered.duration_ms, 4250);
    integrity(&recovered);
}

#[test]
fn failed_close_and_failed_recovery_keep_saved_data_until_storage_is_repaired() {
    let directory = Directory::new();
    let clock = TestClock::new();
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(input("质检", 3.0)).unwrap();
        clock.advance(1500);
        store.checkpoint().unwrap();
        store.connection.execute_batch("CREATE TRIGGER reject_save BEFORE UPDATE ON work_records BEGIN SELECT RAISE(ABORT,'isolated write failure'); END;").unwrap();
        clock.advance(500);
        assert!(store.pause_for_close().is_err());
        let active = store.active().unwrap().unwrap();
        assert!(!active.is_paused);
        assert_eq!(active.duration_ms, 1500);
    }
    assert!(Store::open(&directory.db(), Box::new(clock.clone())).is_err());
    {
        let connection = Connection::open(directory.db()).unwrap();
        let saved: i64 = connection
            .query_row("SELECT duration_ms FROM work_records", [], |row| row.get(0))
            .unwrap();
        assert_eq!(saved, 1500);
        connection
            .execute_batch("DROP TRIGGER reject_save")
            .unwrap();
    }
    let mut repaired = Store::open(&directory.db(), Box::new(clock)).unwrap();
    let active = repaired.snapshot().unwrap().active.unwrap();
    assert_eq!(active.duration_ms, 1500);
    assert!(active.is_paused && active.recovery_pending);
    integrity(&repaired);
}

#[test]
fn ten_thousand_record_history_keeps_paging_and_aggregates_consistent() {
    let directory = Directory::new();
    let mut store = Store::open(&directory.db(), Box::new(TestClock::new())).unwrap();
    {
        let tx = store.connection.transaction().unwrap();
        {
            let mut insert = tx.prepare("INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status)
                VALUES(?1,1.25,'隔离容量测试',?2,?2+1250,1250,1,'FINISHED',1,'COMPLETE')").unwrap();
            for index in 0..10_000i64 {
                insert
                    .execute(params![
                        ["评测", "质检", "开发", "文档"][(index % 4) as usize],
                        1_792_000_000_000i64 + index * 1000
                    ])
                    .unwrap();
            }
        }
        tx.commit().unwrap();
    }
    let started = std::time::Instant::now();
    let first = store.query_history(query()).unwrap();
    assert_eq!(first.filtered.records, 10_000);
    assert_eq!(first.filtered.quantity, 12_500.0);
    assert_eq!(first.filtered.duration_ms, 12_500_000);
    assert_eq!(first.records.len(), 20);
    let mut last_query = query();
    last_query.page = 500;
    let last = store.query_history(last_query).unwrap();
    assert_eq!(last.records.len(), 20);
    assert_eq!(last.records.last().unwrap().id, 1);
    assert_eq!(
        first
            .categories
            .iter()
            .map(|row| row.totals.records)
            .sum::<i64>(),
        10_000
    );
    println!(
        "isolated 10000-record first/last history query elapsed_ms={}",
        started.elapsed().as_millis()
    );
    integrity(&store);
}

```

## UPDATE — E:\WorkMemo\src-tauri\src\tracking_tests.rs

```rust

use super::tests::{TestClock, TestDirectory};
use super::*;
use crate::monitor::*;

#[test]
fn page_task_switches_close_exactly_one_segment_and_resume_same_record() {
    let mut h = Harness::new();
    let first = h.start();
    h.clock.advance(1_234);
    let second_rule=h.store.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES('https://other.example.test/','文档','origin',(SELECT id FROM work_tasks WHERE category='文档' ORDER BY id LIMIT 1))",[]).unwrap();
    assert_eq!(second_rule, 1);
    let second_rule_id = h.store.connection.last_insert_rowid();
    h.store
        .switch_page_task(Some(second_rule_id), h.clock.now())
        .unwrap();
    let second = h.store.active().unwrap().unwrap().id;
    assert_ne!(first, second);
    assert_eq!(h.saved(first).status, "SUSPENDED");
    assert_eq!(h.saved(first).duration_ms, 1_234);
    h.clock.advance(432);
    let first_rule_id = h.store.monitor.config.rules[0].id;
    h.store
        .switch_page_task(Some(first_rule_id), h.clock.now())
        .unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().id, first);
    assert_eq!(h.saved(second).duration_ms, 432);
    let open: i64 = h
        .store
        .connection
        .query_row(
            "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(open, 1);
}

#[test]
fn two_bound_pages_of_one_task_create_distinct_segments() {
    let mut h = Harness::new();
    let id = h.start();
    h.store.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES('https://same-task.example.test/','开发','origin',(SELECT id FROM work_tasks WHERE current_record_id=?1))",[id]).unwrap();
    let second_rule = h.store.connection.last_insert_rowid();
    h.clock.advance(250);
    h.store
        .switch_page_task(Some(second_rule), h.clock.now())
        .unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    let segments: i64 = h
        .store
        .connection
        .query_row(
            "SELECT COUNT(*) FROM work_segments WHERE record_id=?1",
            [id],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(segments, 2);
    assert_eq!(h.saved(id).duration_ms, 250);
}

#[test]
fn unknown_page_suspends_running_task_without_finishing_it() {
    let mut h = Harness::new();
    let id = h.start();
    h.clock.advance(777);
    h.store.switch_page_task(None, h.clock.now()).unwrap();
    assert!(h.store.active().unwrap().is_none());
    assert_eq!(h.saved(id).status, "SUSPENDED");
    assert_eq!(h.saved(id).duration_ms, 777);
}

#[test]
fn recovery_pending_suspended_task_requires_explicit_selection() {
    let mut h = Harness::new();
    let id = h.start();
    h.clock.advance(321);
    h.store.switch_page_task(None, h.clock.now()).unwrap();
    h.store
        .connection
        .execute(
            "UPDATE work_records SET recovery_pending=1,pause_reason='RECOVERY' WHERE id=?1",
            [id],
        )
        .unwrap();
    let rule = h.store.monitor.config.rules[0].id;
    h.store.switch_page_task(Some(rule), h.clock.now()).unwrap();
    assert!(h.store.active().unwrap().is_none());
    let task_id: i64 = h
        .store
        .connection
        .query_row(
            "SELECT id FROM work_tasks WHERE current_record_id=?1",
            [id],
            |r| r.get(0),
        )
        .unwrap();
    h.store.switch_to_named_task(task_id).unwrap();
    let resumed = h.store.active().unwrap().unwrap();
    assert_eq!(resumed.id, id);
    assert!(!resumed.recovery_pending);
    assert_eq!(resumed.duration_ms, 321);
}

#[test]
fn failed_page_switch_keeps_previous_timer_and_open_segment() {
    let mut h = Harness::new();
    let id = h.start();
    h.clock.advance(300);
    h.store.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES('https://other.example.test/','文档','origin',(SELECT id FROM work_tasks WHERE category='文档' ORDER BY id LIMIT 1))",[]).unwrap();
    let rule = h.store.connection.last_insert_rowid();
    h.store.connection.execute_batch("CREATE TRIGGER reject_switch BEFORE INSERT ON work_segments WHEN NEW.record_id!=1 BEGIN SELECT RAISE(ABORT,'switch denied'); END;").unwrap();
    assert!(h.store.switch_page_task(Some(rule), h.clock.now()).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert!(!h.saved(id).is_paused);
    let open: i64 = h
        .store
        .connection
        .query_row(
            "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(open, 1);
}

#[test]
fn wall_clock_rollback_does_not_overlap_switched_task_segments() {
    let mut h = Harness::new();
    let first = h.start();
    h.clock.advance(1_000);
    h.store.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode,task_id) VALUES('https://other.example.test/','文档','origin',(SELECT id FROM work_tasks WHERE category='文档' ORDER BY id LIMIT 1))",[]).unwrap();
    let rule = h.store.connection.last_insert_rowid();
    h.clock.jump_wall(-10_000);
    h.store.switch_page_task(Some(rule), h.clock.now()).unwrap();
    let second = h.store.active().unwrap().unwrap().id;
    let old_end: i64 = h
        .store
        .connection
        .query_row(
            "SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?1",
            [first],
            |r| r.get(0),
        )
        .unwrap();
    let new_start: i64 = h
        .store
        .connection
        .query_row(
            "SELECT start_time FROM work_segments WHERE record_id=?1 AND state='OPEN'",
            [second],
            |r| r.get(0),
        )
        .unwrap();
    assert!(new_start >= old_end);
    assert_eq!(h.saved(first).duration_ms, 1_000);
}

#[test]
fn binding_new_page_persists_task_mapping_and_rejects_stale_confirmation() {
    let mut h = Harness::new();
    let address = "https://new.example.test/work/one";
    let revision = h.store.monitor.config.revision;
    h.store.monitor.unknown_page_url = Some(address.into());
    h.store.monitor.page = Some(PageSample {
        at: h.clock.now(),
        focused: false,
        rule_id: None,
        revision,
        ready: true,
    });
    let input = super::page_tasks::BindPageInput {
        expected_url: address.into(),
        expected_revision: revision,
        match_mode: "path_prefix".into(),
        pattern: "https://new.example.test/work".into(),
        task_id: None,
        new_name: Some("任务甲".into()),
        category: Some("开发".into()),
        ignore: false,
    };
    h.store.bind_page(input).unwrap();
    let task = h
        .store
        .page_tasks()
        .unwrap()
        .into_iter()
        .find(|t| t.name == "任务甲")
        .unwrap();
    let mapped: i64 = h
        .store
        .connection
        .query_row(
            "SELECT task_id FROM work_urls WHERE url_prefix='https://new.example.test/work'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(mapped, task.id);
    assert_eq!(h.store.monitor.config.revision, revision + 1);
    assert!(h.store.monitor.unknown_page_url.is_none());
}

#[test]
fn empty_rule_configuration_can_discover_first_page_after_permission() {
    let clock = TestClock::new();
    let mut store = Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(clock.clone()),
        None,
    )
    .unwrap();
    store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: 0,
            rules: vec![],
            times: TrackingTimes::default(),
            poll_interval_seconds: 1,
            auto_resume_manual: false,
        })
        .unwrap();
    store.activate_monitoring();
    let now = clock.now();
    store.observe_page(PageSample {
        at: now,
        focused: true,
        rule_id: None,
        revision: 1,
        ready: true,
    });
    store.monitor.unknown_page_url = Some("https://first.example.test/".into());
    store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert_eq!(
        store.monitor.status.unknown_page_url.as_deref(),
        Some("https://first.example.test/")
    );
}

#[test]
fn ignored_page_can_be_revoked_and_does_not_leak_into_work_rules() {
    let mut h = Harness::new();
    let address = "https://private.example.test/read";
    let revision = h.store.monitor.config.revision;
    h.store.monitor.unknown_page_url = Some(address.into());
    h.store.monitor.page = Some(PageSample {
        at: h.clock.now(),
        focused: false,
        rule_id: None,
        revision,
        ready: true,
    });
    h.store
        .bind_page(super::page_tasks::BindPageInput {
            expected_url: address.into(),
            expected_revision: revision,
            match_mode: "origin".into(),
            pattern: "https://private.example.test/".into(),
            task_id: None,
            new_name: None,
            category: None,
            ignore: true,
        })
        .unwrap();
    assert!(h.store.is_ignored_page(address).unwrap());
    let ignored = h.store.ignored_pages().unwrap();
    assert_eq!(ignored.len(), 1);
    h.store.remove_ignored_page(ignored[0].id).unwrap();
    assert!(!h.store.is_ignored_page(address).unwrap());
}

struct Harness {
    store: Store,
    clock: TestClock,
    input: i64,
    connected: bool,
    matched: bool,
    ready: bool,
}
impl Harness {
    fn new() -> Self {
        let clock = TestClock::new();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: 0,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
                    url_prefix: "https://work.example.test/tasks?ignored=1#fragment".into(),
                    category: "开发".into(),
                }],
            })
            .unwrap();
        store.activate_monitoring();
        let mut harness = Self {
            store,
            clock,
            input: 0,
            connected: true,
            matched: true,
            ready: true,
        };
        harness.tick();
        harness
    }
    fn tick_unconfirmed(&mut self) {
        let now = self.clock.now();
        if self.connected {
            self.store.observe_page(PageSample {
                at: now,
                focused: self.matched,
                rule_id: self
                    .matched
                    .then_some(self.store.monitor.config.rules[0].id),
                revision: self.store.monitor.config.revision,
                ready: self.ready,
            });
        }
        self.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: self.input,
                    chrome_foreground: self.matched,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
    }
    fn tick(&mut self) {
        self.tick_unconfirmed();
        self.accept();
    }
    // Existing timer scenarios model a user accepting the initial prompt immediately.
    // Dedicated confirmation tests below leave candidates unanswered explicitly.
    fn accept(&mut self) {
        if let Some(c) = self.store.monitor.candidate.clone() {
            self.store.confirm_work(Some(c.id), false).unwrap();
        }
    }
    fn step(&mut self, ms: i64, input: bool) {
        self.clock.advance(ms);
        if input {
            self.input = self.clock.now().ticks_ms;
        }
        self.tick();
    }
    fn advance(&mut self, mut ms: i64, input: bool) {
        while ms > 0 {
            let step = ms.min(5000);
            self.step(step, input);
            ms -= step;
        }
    }
    fn start(&mut self) -> i64 {
        self.step(1000, true);
        self.store.active().unwrap().unwrap().id
    }
    fn saved(&self, id: i64) -> WorkRecord {
        self.store.record(id).unwrap()
    }
}

#[test]
fn merely_open_or_background_page_does_not_start_and_new_input_starts_once() {
    let mut h = Harness::new();
    h.advance(30_000, false);
    assert!(h.store.active().unwrap().is_none());
    h.matched = false;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1, false);
    assert!(h.store.active().unwrap().is_none());
    let id = h.start();
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    let record = h.saved(id);
    assert_eq!(record.source, "AUTO");
    assert_eq!(record.control_mode, "AUTO");
    assert_eq!(record.quantity, None);
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn idle_thresholds_use_input_time_warning_cancels_and_seven_minutes_are_removed() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(299_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "idle");
    h.store.defer_notice(id, "idle").unwrap();
    h.step(1000, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1000, true);
    assert!(!h.store.monitor.status.idle_warning);
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(420_000, false);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 420_000));
    assert_eq!(record.duration_ms, 20_000);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "ended");
    h.step(5000, false);
    assert_eq!(
        h.store
            .connection
            .query_row(
                "SELECT count(*) FROM end_reminders WHERE record_id=?1",
                [id],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        1
    );
}

#[test]
fn idle_end_wins_over_away_and_rolls_back_the_two_minute_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(120_000, false);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("IDLE_PAUSE"));
    h.advance(300_000, false);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn other_application_input_cannot_extend_work_beyond_away_grace_or_twelve_minutes() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(119_999, true);
    assert!(!h.saved(id).is_paused);
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    h.advance(599_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("AWAY"));
    assert_eq!(record.duration_ms, 130_000);
    assert_eq!(
        record.confirmed_end_time.unwrap() - record.end_time.unwrap(),
        600_000
    );
}

#[test]
fn return_inside_hold_needs_new_input_and_resumes_same_record_excluding_pause() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(180_000, true);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    assert!(!h.saved(id).is_paused);
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).duration_ms, 140_000);
}

#[test]
fn equal_idle_and_away_deadlines_produce_one_idle_result() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(300_000, true);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 130_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[test]
fn first_input_at_idle_deadline_keeps_finished_record_closed() {
    let mut h = Harness::new();
    let old = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.candidate.is_none());
    assert_eq!(h.saved(old).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_remains_protected_when_auto_resume_disabled() {
    let mut h = Harness::new();
    h.store.monitor.config.auto_resume_manual = false;
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.advance(900_000, false);
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).status, "WORKING");
    h.advance(10_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(180_000, true);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 135_000);
}

#[test]
fn lost_browser_connection_removes_unconfirmed_tail_and_recovers_only_with_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let trusted = h.clock.now();
    h.connected = false;
    h.advance(20_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.monitor.last_trusted_page, Some(trusted.ticks_ms));
    h.connected = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
}

#[test]
fn revoked_permission_is_unknown_not_a_counted_away_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.ready = false;
    h.advance(5000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn lock_or_suspended_scheduler_gap_never_counts_unknown_time() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let lock = h.clock.now();
    h.clock.advance(5000);
    h.store.system_unavailable(lock).unwrap();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.clock.advance(60_000);
    h.tick();
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn deferred_reminder_and_pending_record_survive_restart_without_blocking_new_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(id).unwrap();
        assert!(store.current_notice().unwrap().is_some());
        store.defer_notice(id, "ended").unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
    }
    let store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(store.current_notice().unwrap().is_none());
    assert_eq!(store.pending_records().unwrap()[0].id, id);
    assert!(store.active().unwrap().unwrap().recovery_pending);
}

#[test]
fn config_validation_conflict_and_storage_failure_keep_previous_rules() {
    let mut h = Harness::new();
    let original = h.store.monitor_config().unwrap();
    for url in [
        "file:///private",
        "https://name:password@work.example.test/",
        "not-a-url",
    ] {
        assert!(
            h.store
                .save_monitor_config(ConfigInput {
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    times: TrackingTimes::default(),
                    enabled: true,
                    expected_revision: original.revision,
                    rules: vec![RuleInput {
                        match_mode: "path_prefix".into(),
                        url_prefix: url.into(),
                        category: "开发".into()
                    }]
                })
                .is_err()
        );
    }
    h.store.connection.execute_batch("CREATE TRIGGER reject_rule BEFORE INSERT ON work_urls BEGIN SELECT RAISE(ABORT,'rule failure'); END;").unwrap();
    assert!(
        h.store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: original.revision,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
                    url_prefix: "https://other.example.test/".into(),
                    category: "开发".into()
                }]
            })
            .is_err()
    );
    let current = h.store.monitor_config().unwrap();
    assert_eq!(current.revision, original.revision);
    assert_eq!(current.rules, original.rules);
}

#[test]
fn delayed_detection_does_not_add_poll_delay_to_effective_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(419_000, false);
    h.step(4_003, false);
    let record = h.saved(id);
    assert_eq!(record.duration_ms, 10_000);
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 423_003));
}

#[test]
fn unconfirmed_browser_outage_cannot_hold_record_forever_while_input_continues() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.connected = false;
    h.advance(615_000, true);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("RECOVERY"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn background_browser_profiles_cannot_override_the_focused_profile() {
    let mut h = Harness::new();
    let at = h.clock.now();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let page = |focused| PageSample {
        at,
        focused,
        rule_id: focused.then_some(rule),
        revision,
        ready: true,
    };
    h.store.observe_browser_page(11, page(true));
    h.store.observe_browser_page(22, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(11));
    h.store.observe_browser_page(22, page(true));
    h.store.observe_browser_page(11, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(22));
}

#[test]
fn last_input_timestamp_does_not_move_when_wall_clock_changes_without_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.saved(id).last_input_time;
    h.clock.jump_wall(3_600_000);
    h.advance(5000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn second_schema_pending_intervals_survive_upgrade_without_an_upgrade_popup() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection
        .execute_batch(include_str!("../migrations/002_settlement.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=2;
        INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time)
        VALUES(10,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);
        INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(10,1000,2250,2250,1250,'CLOSED');").unwrap();
    let mut store = Store::initialize(connection, Box::new(TestClock::new()), None).unwrap();
    let pending = store.pending_records().unwrap();
    assert_eq!(pending[0].id, 10);
    assert_eq!(pending[0].duration_ms, 1250);
    assert_eq!(pending[0].quantity, None);
    assert!(store.current_notice().unwrap().is_none());
    store
        .settle(SettleInput {
            id: 10,
            expected_revision: 0,
            category: "开发".into(),
            quantity: 0.0,
            remark: "".into(),
        })
        .unwrap();
    assert_eq!(store.record(10).unwrap().duration_ms, 1250);
}

#[test]
fn automatic_finish_failure_rolls_back_trim_and_retries_without_duplicate_reminders() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.store.connection.execute_batch("CREATE TRIGGER reject_auto_end BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'auto end failure'); END;").unwrap();
    h.clock.advance(1);
    let now = h.clock.now();
    assert!(
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: h.input,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true
                },
                now
            )
            .is_err()
    );
    assert_eq!(h.saved(id).status, "WORKING");
    assert!(h.store.current_notice().unwrap().is_none());
    h.store
        .connection
        .execute_batch("DROP TRIGGER reject_auto_end")
        .unwrap();
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_rejects_bad_auth_and_replay_before_changing_page_state() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    crate::browser_bridge::start(shared.clone(), directory.db().parent().unwrap()).unwrap();
    let endpoint_path = directory
        .db()
        .parent()
        .unwrap()
        .join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let send = |stream: &mut TcpStream, token: String, sequence, focused| {
        let frame = BrowserFrame {
            match_modes: true,
            page_activity: false,
            version: 1,
            sequence,
            config_revision: revision,
            focused,
            ready: true,
            rule_id: Some(rule),
            page_url: None,
        };
        let mut bytes = serde_json::to_vec(&WireRequest { token, frame }).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        stream.flush().unwrap();
    };
    let mut bad = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    bad.set_read_timeout(Some(Duration::from_secs(2))).unwrap();
    send(&mut bad, "invalid".into(), 1, false);
    let mut line = String::new();
    let rejected = |result: std::io::Result<usize>| match result {
        Ok(0) => (),
        Err(error)
            if matches!(
                error.kind(),
                std::io::ErrorKind::ConnectionReset | std::io::ErrorKind::ConnectionAborted
            ) =>
        {
            ()
        }
        other => panic!("expected a rejected connection, got {other:?}"),
    };
    // Windows may close a rejected socket with FIN or RST. Neither may return
    // a successful reply or change the page state.
    rejected(BufReader::new(bad).read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    let mut valid = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    valid
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(valid.try_clone().unwrap());
    send(&mut valid, endpoint.token.clone(), 1, true);
    reader.read_line(&mut line).unwrap();
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&line).unwrap()["connected"],
        true
    );
    line.clear();
    send(&mut valid, endpoint.token, 1, false);
    rejected(reader.read_line(&mut line));
    assert!(line.is_empty());
    // Rejecting a replay may already have cleared the disconnected page.
    // A replay must never publish the supplied focused=false state.
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .is_none_or(|page| page.focused)
    );
    drop(reader);
    drop(valid);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn unavailable_native_metadata_blocks_manual_start_and_resume_without_losing_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: h.input,
                chrome_foreground: true,
                unlocked: false,
                reliable: false,
            },
            now,
        )
        .unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into()
            })
            .is_err()
    );
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert!(h.saved(id).is_paused);
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 10000);
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_keeps_one_connection_between_heartbeats() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    let folder = directory.db().parent().unwrap().to_path_buf();
    crate::browser_bridge::start(shared.clone(), &folder).unwrap();
    let endpoint_path = folder.join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let mut stream = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    stream
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(stream.try_clone().unwrap());
    for sequence in 1..=3 {
        if sequence > 1 {
            // A real browser waits between heartbeats. Windows accepted sockets
            // inherit the listener's nonblocking mode unless explicitly reset.
            std::thread::sleep(Duration::from_millis(120));
        }
        let request = WireRequest {
            token: endpoint.token.clone(),
            frame: BrowserFrame {
                match_modes: true,
                page_activity: false,
                version: 1,
                sequence,
                config_revision: revision,
                focused: false,
                ready: true,
                rule_id: None,
                page_url: None,
            },
        };
        let mut bytes = serde_json::to_vec(&request).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        let mut reply = String::new();
        let length = reader.read_line(&mut reply).unwrap();
        assert!(length > 0, "connection closed before heartbeat {sequence}");
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&reply).unwrap()["connected"],
            true
        );
    }
    drop(reader);
    drop(stream);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn already_expired_record_cannot_be_resurrected_by_manual_finish_or_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    h.advance(420_000, false);
    h.store.finish(id).unwrap();
    assert!(h.store.resume(id).is_err());
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
}

#[test]
fn configured_deadlines_control_work_and_status() {
    let mut h = Harness::new();
    let mut cfg = h.store.monitor_config().unwrap();
    cfg.times = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 20,
        idle_end_seconds: 30,
        away_pause_seconds: 4,
        hold_seconds: 6,
    };
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times.clone(),
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.matched = false;
    h.tick();
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(4));
    h.advance(3_999, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(1));
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, None);
    h.advance(5_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 4_000);
}

#[test]
fn configured_idle_deadline_and_notice_are_consistent() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: TrackingTimes {
                idle_pause_seconds: 1,
                idle_warning_seconds: 2,
                idle_end_seconds: 4,
                ..TrackingTimes::default()
            },
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(1_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    let notice = h.store.current_notice().unwrap().unwrap();
    assert_eq!(
        (notice.idle_warning_seconds, notice.idle_end_seconds),
        (2, 4)
    );
    h.advance(2_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 0);
}

#[test]
fn schema_three_migrates_defaults_and_settings_persist_with_validation() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=3; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=8 WHERE id=1;").unwrap();
    }
    let chosen = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 12,
        idle_end_seconds: 23,
        away_pause_seconds: 34,
        hold_seconds: 45,
    };
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let old = store.monitor_config().unwrap();
        assert_eq!(old.times, TrackingTimes::default());
        assert_eq!(old.revision, 8);
        let rule = || {
            vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }]
        };
        let invalid = TrackingTimes {
            idle_warning_seconds: 24,
            idle_end_seconds: 23,
            ..chosen.clone()
        };
        assert!(
            store
                .save_monitor_config(ConfigInput {
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    enabled: true,
                    expected_revision: 8,
                    times: invalid,
                    rules: rule()
                })
                .is_err()
        );
        assert_eq!(store.monitor_config().unwrap().revision, 8);
        store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                enabled: true,
                expected_revision: 8,
                times: chosen.clone(),
                rules: rule(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    assert_eq!(store.monitor_config().unwrap().times, chosen);
    assert_eq!(store.monitor_config().unwrap().rules.len(), 1);
}

#[test]
fn saving_settings_clears_old_away_deadline_and_requires_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.tick();
    h.advance(5_000, true);
    assert!(h.store.monitor.away_since.is_some());
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    assert!(h.store.monitor.away_since.is_none());
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    h.matched = true;
    h.tick();
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn manual_pause_requires_explicit_resume_even_after_matching_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.step(1_000, false);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert_eq!(h.saved(id).id, id);
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.store.resume(id).unwrap();
    assert!(!h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    h.advance(120_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
}

#[test]
fn manual_running_task_switches_but_manual_pause_is_preserved() {
    let mut h = Harness::new();
    h.store
        .start(StartInput {
            category: "文档".into(),
            quantity: None,
            remark: "".into(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    let next = h.store.active().unwrap().unwrap().id;
    assert_ne!(next, id);
    assert_eq!(h.saved(id).status, "SUSPENDED");
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    h.store.pause(next).unwrap();
    h.step(1_000, true);
    assert!(h.saved(next).is_paused);
}

#[test]
fn checked_start_rejects_stale_or_missing_confirmation_without_modifying_task() {
    let mut h = Harness::new();
    let id = h.start();
    h.store.pause(id).unwrap();
    let input = || StartInput {
        category: "文档".into(),
        quantity: None,
        remark: "".into(),
    };
    assert!(h.store.start_checked(input(), None).is_err());
    assert!(h.store.start_checked(input(), Some(id + 1)).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).status, "WORKING");
    h.store.start_checked(input(), Some(id)).unwrap();
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("SWITCH"));
    assert_ne!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn browser_evidence_time_allows_first_input_before_next_state_machine_tick() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1_000, true);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(100);
    let input = h.clock.now();
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: input.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_some());
    let active = h
        .store
        .active()
        .unwrap()
        .expect("first input after confirmed page should start");
    assert_eq!(active.control_mode, "AUTO");
    assert_eq!(active.duration_ms, 0);
}

#[test]
fn monitor_interval_is_validated_persisted_and_changes_sample_due() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 1);
    assert!(cfg.auto_resume_manual);
    let input = |seconds| ConfigInput {
        enabled: true,
        expected_revision: cfg.revision,
        times: cfg.times.clone(),
        poll_interval_seconds: seconds,
        auto_resume_manual: false,
        rules: cfg
            .rules
            .iter()
            .map(|r| RuleInput {
                match_mode: r.match_mode.clone(),
                url_prefix: r.url_prefix.clone(),
                category: r.category.clone(),
            })
            .collect(),
    };
    assert!(h.store.save_monitor_config(input(0)).is_err());
    assert!(h.store.save_monitor_config(input(6)).is_err());
    h.store.save_monitor_config(input(5)).unwrap();
    let saved = h.store.monitor_config().unwrap();
    assert_eq!(saved.poll_interval_seconds, 5);
    assert!(!saved.auto_resume_manual);
    let now = h.clock.now();
    h.store.monitor.native = Some(NativeSample {
        at: now,
        last_input_ticks: 0,
        chrome_foreground: true,
        unlocked: true,
        reliable: true,
    });
    assert!(!h.store.monitor_sample_due(now.ticks_ms + 4_999));
    assert!(h.store.monitor_sample_due(now.ticks_ms + 5_000));
}

#[test]
fn schema_four_migrates_options_without_changing_records_or_existing_thresholds() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/004_tracking_times.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=4; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=9,idle_warning_seconds=12,idle_end_seconds=23,away_pause_seconds=34,hold_seconds=45 WHERE id=1; INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time) VALUES(17,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);").unwrap();
    }
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let cfg = store.monitor_config().unwrap();
        assert_eq!(cfg.revision, 9);
        assert_eq!(cfg.poll_interval_seconds, 1);
        assert!(cfg.auto_resume_manual);
        assert_eq!(
            cfg.times,
            TrackingTimes {
                idle_pause_seconds: 22,
                idle_warning_seconds: 12,
                idle_end_seconds: 23,
                away_pause_seconds: 34,
                hold_seconds: 45
            }
        );
        assert_eq!(store.record(17).unwrap().duration_ms, 1250);
        store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: 9,
                times: cfg.times,
                poll_interval_seconds: 5,
                auto_resume_manual: false,
                rules: cfg
                    .rules
                    .into_iter()
                    .map(|r| RuleInput {
                        match_mode: r.match_mode.clone(),
                        url_prefix: r.url_prefix,
                        category: r.category,
                    })
                    .collect(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    let cfg = store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 5);
    assert!(!cfg.auto_resume_manual);
    assert_eq!(store.record(17).unwrap().duration_ms, 1250);
}

#[test]
fn manually_paused_task_is_not_auto_resumed_after_restart() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: String::new(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        store.pause(id).unwrap();
    }
    let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
    let cfg = store.monitor_config().unwrap();
    store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }],
        })
        .unwrap();
    store.activate_monitoring();
    clock.advance(1000);
    let now = clock.now();
    store.observe_page(PageSample {
        at: now,
        focused: true,
        rule_id: Some(store.monitor.config.rules[0].id),
        revision: store.monitor.config.revision,
        ready: true,
    });
    store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    let record = store.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
}

#[test]
fn input_before_page_evidence_does_not_start_or_backfill_unknown_time() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1000, true);
    let before_evidence = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: before_evidence,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_some());
}

#[test]
fn page_activity_starts_at_confirmation_without_backfilling_earlier_input() {
    let mut h = Harness::new();
    h.step(1000, false);
    let input = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let confirmed = h.clock.now();
    h.store.observe_browser_page(
        99,
        PageSample {
            at: confirmed,
            focused: true,
            rule_id: Some(h.store.monitor.config.rules[0].id),
            revision: h.store.monitor.config.revision,
            ready: true,
        },
    );
    h.store.observe_browser_activity(99);
    h.store.monitor.page_was_matched = false;
    h.store
        .monitor_tick(
            NativeSample {
                at: confirmed,
                last_input_ticks: input,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            confirmed,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_some());
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, confirmed.wall_ms);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn confirmation_deduplicates_and_counts_only_after_acceptance() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let first = h.store.active().unwrap().unwrap();
    for _ in 0..4 {
        h.clock.advance(1000);
        h.input = h.clock.now().ticks_ms;
        h.tick_unconfirmed();
        assert_eq!(h.store.active().unwrap().unwrap().id, first.id);
    }
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, first.start_time);
    assert_eq!(record.duration_ms, 4_000);
    assert!(h.store.confirm_work(Some(999), false).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, record.id);
}

#[test]
fn manual_finish_keeps_binding_but_requires_new_task_choice() {
    for other_rule in [false] {
        let mut h = Harness::new();
        if other_rule {
            h.store.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode) VALUES('https://other.example.test/','文档','origin')", []).unwrap();
            h.store.monitor.config = h.store.monitor_config().unwrap();
        }
        let id = h.start();
        h.clock.advance(1000);
        h.store.finish(id).unwrap();
        let floor = h.clock.now();
        h.tick_unconfirmed();
        assert!(h.store.monitor.candidate.is_none());
        assert!(h.store.active().unwrap().is_none());
        // Browser heartbeats alone cannot reuse the input that ended the work.
        h.clock.advance(1000);
        h.tick_unconfirmed();
        assert!(h.store.monitor.candidate.is_none());
        h.input = h.clock.now().ticks_ms;
        if other_rule {
            h.store.monitor.config.rules.reverse();
        }
        h.tick_unconfirmed();
        assert!(h.store.monitor.candidate.is_none());
        assert!(h.store.active().unwrap().is_none());
        assert_eq!(h.store.current_notice().unwrap().unwrap().record.id, id);
        assert_eq!(h.saved(id).settlement_status, "PENDING");
        h.clock.advance(1000);
        h.tick_unconfirmed();
        assert!(h.store.active().unwrap().is_none());
        assert!(h.store.confirm_work(None, true).is_err());
        assert_eq!(h.store.snapshot().unwrap().pending_count, 1);
        assert!(h.clock.now().wall_ms > floor.wall_ms);
    }
}

#[test]
fn automatic_finish_waits_for_new_task_binding() {
    let mut h = Harness::new();
    let id = h.start();
    h.clock.advance(420_000);
    h.tick_unconfirmed();
    assert_eq!(h.saved(id).status, "FINISHED");
    assert!(h.store.monitor.candidate.is_none());
    h.clock.advance(1000);
    h.tick_unconfirmed();
    assert!(h.store.monitor.candidate.is_none());
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.active().unwrap().is_none());
    h.clock.advance(2000);
    h.tick_unconfirmed();
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.confirm_work(None, true).is_err());
    assert_eq!(h.store.snapshot().unwrap().pending_count, 1);
}

#[test]
fn finished_page_rebinding_rejects_stale_rule_and_preserves_pending_record() {
    let mut h = Harness::new();
    let id = h.start();
    h.store.finish(id).unwrap();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    assert!(
        h.store
            .rebind_finished_page(super::page_tasks::RebindPageInput {
                expected_rule_id: rule,
                expected_revision: revision - 1,
                task_id: None,
                new_name: Some("新任务".into()),
                category: Some("开发".into())
            })
            .is_err()
    );
    assert!(h.store.active().unwrap().is_none());
    assert_eq!(h.saved(id).settlement_status, "PENDING");
    h.store
        .rebind_finished_page(super::page_tasks::RebindPageInput {
            expected_rule_id: rule,
            expected_revision: revision,
            task_id: None,
            new_name: Some("新任务".into()),
            category: Some("开发".into()),
        })
        .unwrap();
    assert_eq!(h.store.snapshot().unwrap().pending_count, 1);
}
#[test]
fn confirmation_survives_own_window_focus_but_rejects_stale_page() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.active().unwrap().unwrap();
    h.clock.advance(3000);
    let now = h.clock.now();
    h.store.observe_page(PageSample {
        at: now,
        focused: false,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: false,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().id, c.id);
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.active().unwrap().unwrap();
    h.connected = false;
    h.clock.advance(16000);
    h.tick_unconfirmed();
    assert!(h.store.confirm_work(Some(c.id as u64), true).is_err());
    assert!(h.store.active().unwrap().unwrap().is_paused);
}
#[test]
fn browsing_blocks_new_work_and_protects_a_paused_task_until_explicit_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.step(1, false);
    h.advance(120000, false);
    assert!(h.saved(id).is_paused);
    h.store.enter_browsing().unwrap();
    h.advance(3600000, true);
    assert_eq!(h.saved(id).status, "WORKING");
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MANUAL"));
    h.matched = true;
    h.step(1000, true);
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.status.browse_ready);
    h.store.confirm_work(None, false).unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor.config.browsing_only);
    h.store.finish(id).unwrap();
    h.store.enter_browsing().unwrap();
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.monitor.status.browse_ready);
}
#[test]
fn browsing_intent_persists_across_restart_without_ending_work() {
    let d = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut s = Store::open(&d.db(), Box::new(clock.clone())).unwrap();
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
        id = s.active().unwrap().unwrap().id;
        s.enter_browsing().unwrap();
    }
    clock.advance(600000);
    let mut s = Store::open(&d.db(), Box::new(clock)).unwrap();
    s.activate_monitoring();
    assert!(s.monitor.config.browsing_only);
    assert!(s.monitor.status.browsing_only);
    let record = s.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn leaving_browse_mode_commits_atomically_with_start_or_resume() {
    let mut h = Harness::new();
    h.store.enter_browsing().unwrap();
    let trigger = "CREATE TRIGGER refuse_work_intent BEFORE UPDATE OF browsing_only ON monitoring_settings WHEN NEW.browsing_only=0 BEGIN SELECT RAISE(ABORT,'injected intent failure'); END;";
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: String::new()
            })
            .is_err()
    );
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.config.browsing_only);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.store.enter_browsing().unwrap();
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.config.browsing_only);
    let open: i64 = h
        .store
        .connection
        .query_row(
            "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(open, 0);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store.resume(id).unwrap();
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor_config().unwrap().browsing_only);
}

#[test]
fn schema_seven_rules_migrate_and_modes_round_trip_without_touching_active_work() {
    let h = Harness::new();
    h.store
        .connection
        .execute_batch("PRAGMA foreign_keys=OFF; DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; DROP TABLE ignored_work_urls; DROP TABLE work_tasks; ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; UPDATE sqlite_sequence SET seq=99 WHERE name='work_urls'; ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;")
        .unwrap();
    let c = h.store.connection;
    let mut store = Store::initialize(c, Box::new(h.clock), None).unwrap();
    let config = store.monitor_config().unwrap();
    assert_eq!(config.rules[0].match_mode, "path_prefix");
    assert_eq!(
        store
            .connection
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name='work_urls'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        99
    );
    store
        .connection
        .execute(
            "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
            params![config.rules[0].url_prefix, "开发", "origin"],
        )
        .unwrap();
    let saved = store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: false,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/sheets/a".into(),
                    category: "开发".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    assert_eq!(saved.rules[0].url_prefix, "https://moonshot.feishu.cn/");
    assert_eq!(saved.rules[1].url_prefix, "cn-beijing-vpc.fcapp.run");
    assert_eq!(store.monitor_config().unwrap().rules, saved.rules);
}

#[test]
fn multiple_sites_for_one_work_keep_one_record_and_continuous_time() {
    let mut h = Harness::new();
    let config = h.store.monitor_config().unwrap();
    let config = h
        .store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/".into(),
                    category: "评测".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(5_000, true);
    for index in 0..6 {
        h.clock.advance(1_000);
        let now = h.clock.now();
        h.input = now.ticks_ms;
        h.store.observe_page(PageSample {
            at: now,
            focused: true,
            ready: true,
            revision: config.revision,
            rule_id: Some(config.rules[(index + 1) % 2].id),
        });
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: now.ticks_ms,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
        let snapshot = h.store.snapshot().unwrap();
        let record = snapshot.active.unwrap();
        assert_eq!(record.id, id);
        assert_eq!(record.category, "评测");
        assert!(!record.is_paused);
        assert!(snapshot.monitoring.start_candidate.is_none());
        assert!(snapshot.monitoring.away_pause_remaining_seconds.is_none());
        assert_eq!(snapshot.pending_count, 0);
    }
    h.store.finish(id).unwrap();
    assert_eq!(h.saved(id).duration_ms, 11_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[path = "idle_pause_tests.rs"]
mod idle_pause_tests;

```

## UPDATE — E:\WorkMemo\src-tauri\src\history_tests.rs

```rust

use super::*;
use crate::clock::{Clock, TimePoint};
use rusqlite::Connection;

struct FixedClock;
impl Clock for FixedClock {
    fn now(&self) -> TimePoint {
        TimePoint {
            wall_ms: 1_000_000,
            ticks_ms: 0,
        }
    }
}

fn memory() -> Store {
    Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(FixedClock),
        None,
    )
    .unwrap()
}

fn query() -> HistoryQuery {
    HistoryQuery {
        start_date: "2026-10-01".into(),
        end_date: "2026-10-31".into(),
        category: None,
        page: 1,
    }
}

// Fixtures live only in isolated test databases, never in the production data directory.
fn saved(store: &Store, local_time: &str, category: &str, quantity: f64, duration_ms: i64) -> i64 {
    store
        .connection
        .execute(
            "INSERT INTO work_records(category,quantity,remark,start_time,end_time,
        duration_ms,duration_seconds,status,is_paused,settlement_status) VALUES(?1,?2,'测试夹具',
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000,
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000+86400000,?4,?4/1000,'FINISHED',1,'COMPLETE')",
            params![category, quantity, local_time, duration_ms],
        )
        .unwrap();
    store.connection.last_insert_rowid()
}

#[test]
fn empty_history_has_real_zero_totals_and_no_summary_rows() {
    let mut store = memory();
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.page, 1);
    assert_eq!(result.page_size, 20);
    assert!(result.records.is_empty() && result.daily.is_empty() && result.categories.is_empty());
    assert_eq!(result.filtered.records, 0);
    assert_eq!(result.filtered.quantity, 0.0);
    assert_eq!(result.overview.duration_ms, 0);
}

#[test]
fn filters_include_local_day_boundaries_and_category_without_changing_overview() {
    let mut store = memory();
    saved(&store, "2026-09-30 23:59:59", "开发", 1.0, 1000);
    let first = saved(&store, "2026-10-01 00:00:00", "开发", 2.5, 1500);
    let last = saved(&store, "2026-10-31 23:59:59", "开发", 3.5, 2500);
    saved(&store, "2026-10-15 12:00:00", "文档", 4.0, 4000);
    saved(&store, "2026-11-01 00:00:00", "开发", 5.0, 5000);
    let mut filter = query();
    filter.category = Some("开发".into());
    let result = store.query_history(filter).unwrap();
    assert_eq!(
        result
            .records
            .iter()
            .map(|record| record.id)
            .collect::<Vec<_>>(),
        vec![last, first]
    );
    assert_eq!(result.filtered.records, 2);
    assert_eq!(result.filtered.quantity, 6.0);
    assert_eq!(result.filtered.duration_ms, 4000);
    assert_eq!(result.overview.records, 5);
    assert_eq!(result.overview.quantity, 16.0);
}

#[test]
fn pagination_is_stable_for_identical_start_times_and_clamps_after_deletion() {
    let mut store = memory();
    for _ in 0..41 {
        saved(&store, "2026-10-20 10:00:00", "开发", 1.0, 500);
    }
    let first = store.query_history(query()).unwrap();
    assert_eq!(first.records.len(), 20);
    assert_eq!(first.records[0].id, 41);
    let mut filter = query();
    filter.page = 2;
    let second = store.query_history(filter.clone()).unwrap();
    assert_eq!(second.records.len(), 20);
    assert_eq!(second.records[0].id, 21);
    assert!(
        !first
            .records
            .iter()
            .any(|r| second.records.iter().any(|other| other.id == r.id))
    );
    filter.page = u32::MAX;
    let last = store.query_history(filter.clone()).unwrap();
    assert_eq!(last.page, 3);
    assert_eq!(last.records.len(), 1);
    store.delete_record(last.records[0].id).unwrap();
    assert_eq!(store.query_history(filter).unwrap().page, 2);
}

#[test]
fn aggregates_preserve_subseconds_and_assign_cross_midnight_work_to_start_day() {
    let mut store = memory();
    saved(&store, "2026-10-20 23:59:59", "开发", 0.1, 600);
    saved(&store, "2026-10-20 23:59:59", "开发", 0.2, 600);
    saved(&store, "2026-10-21 00:00:00", "文档", 2.0, 1900);
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.filtered.duration_ms, 3100);
    assert!((result.filtered.quantity - 2.3).abs() < 1e-10);
    assert_eq!(result.daily.len(), 2);
    assert_eq!(result.daily[1].date, "2026-10-20");
    assert_eq!(result.daily[1].totals.duration_ms, 1200);
    assert_eq!(
        result
            .daily
            .iter()
            .map(|d| d.totals.duration_ms)
            .sum::<i64>(),
        result.filtered.duration_ms
    );
    assert_eq!(
        result
            .categories
            .iter()
            .map(|c| c.totals.records)
            .sum::<i64>(),
        result.filtered.records
    );
}

#[test]
fn invalid_query_is_rejected_without_deleting_or_altering_records() {
    let mut store = memory();
    saved(&store, "2026-10-01 00:00:00", "文档", 1.0, 1000);
    for date in [
        "",
        "2026-2-01",
        "2026-02-29",
        "2026-04-31",
        "1969-12-31",
        "2026-00-10",
        "2026-13-01",
        "2026-10-00",
        "2026-10-32",
        "二〇二六-10-01",
        "2026-10-01' OR 1=1--",
    ] {
        let mut filter = query();
        filter.start_date = date.into();
        assert!(store.query_history(filter).is_err(), "{date}");
    }
    let mut filter = query();
    filter.start_date = "2026-11-01".into();
    assert!(store.query_history(filter).is_err());
    let mut filter = query();
    filter.page = 0;
    assert!(store.query_history(filter).is_err());
    let mut filter = query();
    filter.category = Some("开发' OR 1=1--".into());
    assert!(store.query_history(filter).is_err());
    let mut filter = query();
    filter.start_date = "2024-01-01".into();
    filter.end_date = "2025-01-01".into();
    assert!(store.query_history(filter).is_err());
    assert_eq!(store.query_history(query()).unwrap().overview.records, 1);
}

#[test]
fn leap_day_and_maximum_range_are_validated() {
    let mut store = memory();
    let mut filter = query();
    filter.start_date = "2024-01-01".into();
    filter.end_date = "2024-12-31".into();
    assert!(store.query_history(filter).is_ok());
    let mut filter = query();
    filter.start_date = "2024-02-29".into();
    filter.end_date = "2024-02-29".into();
    assert!(store.query_history(filter).is_ok());
    let mut filter = query();
    filter.start_date = "2100-02-29".into();
    assert!(store.query_history(filter).is_err());
}

#[test]
fn active_and_paused_records_cannot_be_deleted_or_counted_and_timer_is_untouched() {
    let mut store = memory();
    let old = saved(&store, "2026-10-20 10:00:00", "开发", 1.0, 600);
    store
        .start(super::super::StartInput {
            category: "文档".into(),
            quantity: Some(2.0),
            remark: "".into(),
        })
        .unwrap();
    let active = store.active().unwrap().unwrap().id;
    assert!(store.delete_record(active).is_err());
    assert_eq!(store.query_history(query()).unwrap().overview.records, 1);
    assert_eq!(store.segment.as_ref().unwrap().id, active);
    assert!(!store.active().unwrap().unwrap().is_paused);
    store.pause(active).unwrap();
    assert!(store.delete_record(active).is_err());
    store.delete_record(old).unwrap();
    assert_eq!(store.active().unwrap().unwrap().id, active);
    assert_eq!(store.query_history(query()).unwrap().overview.records, 0);
}

#[test]
fn delete_updates_history_recent_and_all_summaries_without_affecting_other_records() {
    let mut store = memory();
    let target = saved(&store, "2026-10-20 10:00:00", "开发", 2.0, 1200);
    let keep = saved(&store, "2026-10-21 10:00:00", "文档", 3.0, 2400);
    store.delete_record(target).unwrap();
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.overview.records, 1);
    assert_eq!(result.filtered.quantity, 3.0);
    assert_eq!(result.filtered.duration_ms, 2400);
    assert_eq!(result.records[0].id, keep);
    assert_eq!(result.daily.len(), 1);
    assert_eq!(result.categories.len(), 1);
    assert_eq!(store.snapshot().unwrap().recent_records[0].id, keep);
    assert!(store.delete_record(target).is_err());
    assert!(store.delete_record(-1).is_err());
}

#[test]
fn failed_delete_rolls_back_and_keeps_history_and_totals() {
    let mut store = memory();
    let target = saved(&store, "2026-10-20 10:00:00", "开发", 2.0, 1200);
    store
        .connection
        .execute_batch(
            "CREATE TRIGGER reject_delete BEFORE DELETE ON work_records
        BEGIN SELECT RAISE(ABORT,'test disk failure'); END;",
        )
        .unwrap();
    assert!(store.delete_record(target).is_err());
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.records[0].id, target);
    assert_eq!(result.filtered.quantity, 2.0);
    assert_eq!(result.filtered.duration_ms, 1200);
}

#[test]
fn deletion_persists_when_reopened_and_existing_schema_stays_compatible() {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let directory =
        std::env::temp_dir().join(format!("workmemo-history-{}-{nonce}", std::process::id()));
    std::fs::create_dir(&directory).unwrap();
    let path = directory.join("history.sqlite3");
    {
        let mut store = Store::open(&path, Box::new(FixedClock)).unwrap();
        let target = saved(&store, "2026-10-20 10:00:00", "开发", 2.0, 1200);
        saved(&store, "2026-10-21 10:00:00", "文档", 3.0, 2400);
        store.delete_record(target).unwrap();
    }
    {
        let mut reopened = Store::open(&path, Box::new(FixedClock)).unwrap();
        assert_eq!(reopened.query_history(query()).unwrap().overview.records, 1);
        let version: i64 = reopened
            .connection
            .pragma_query_value(None, "user_version", |row| row.get(0))
            .unwrap();
        assert_eq!(version, 11);
    }
    // Exact temporary test directory, created above; never a user database path.
    assert_eq!(directory.parent(), Some(std::env::temp_dir().as_path()));
    std::fs::remove_dir_all(directory).unwrap();
}

```

## UPDATE — E:\WorkMemo\src-tauri\src\categories.rs

```rust

//! Stable category identities stay in records and URL rules; names are metadata.
use super::*;
use std::collections::{BTreeMap, HashSet};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct CategoryNames {
    pub revision: i64,
    pub names: BTreeMap<String, String>,
}

impl CategoryNames {
    pub fn validate(&self) -> Result<()> {
        if self.revision < 0 || self.names.len() != 4 {
            return Err("工作类别配置不完整。".into());
        }
        let mut seen = HashSet::new();
        for key in crate::presentation::CATEGORIES {
            let name = self.names.get(key).ok_or("工作类别配置不完整。")?;
            if name.is_empty()
                || name.chars().count() > 20
                || name.chars().any(char::is_control)
                || name.trim() != name
                || !seen.insert(name.to_lowercase())
            {
                return Err("工作名称须为 1 至 20 个字符，不能重复或含控制字符。".into());
            }
        }
        Ok(())
    }
}

impl Store {
    pub fn category_names(&self) -> Result<CategoryNames> {
        let mut stmt = self
            .connection
            .prepare("SELECT category,display_name,revision FROM category_names")
            .map_err(db_error)?;
        let rows = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i64>(2)?,
                ))
            })
            .map_err(db_error)?;
        let mut names = BTreeMap::new();
        let mut revision = None;
        for row in rows {
            let (key, name, rev) = row.map_err(db_error)?;
            if revision.is_some_and(|old| old != rev) {
                return Err("工作名称版本不一致，未覆盖配置。".into());
            }
            revision = Some(rev);
            names.insert(key, name);
        }
        let result = CategoryNames {
            revision: revision.unwrap_or(0),
            names,
        };
        result.validate()?;
        Ok(result)
    }

    pub fn save_category_names(&mut self, mut input: CategoryNames) -> Result<CategoryNames> {
        for name in input.names.values_mut() {
            *name = name.trim().to_string();
        }
        input.validate()?;
        let current = self.category_names()?;
        if input.revision != current.revision {
            return Err("工作名称已被其他窗口修改，请重新读取后保存。".into());
        }
        if input.names == current.names {
            return Ok(current);
        }
        input.revision = input
            .revision
            .checked_add(1)
            .ok_or("工作名称版本超出范围。")?;
        let tx = self.connection.transaction().map_err(db_error)?;
        // Reserve names outside the user-input alphabet to support name swaps.
        tx.execute(
            "UPDATE category_names SET display_name=category||char(1)",
            [],
        )
        .map_err(db_error)?;
        for (key, name) in &input.names {
            tx.execute(
                "UPDATE category_names SET display_name=?1,revision=?2 WHERE category=?3",
                params![name, input.revision, key],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        Ok(input)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::{TestClock, TestDirectory};

    fn memory() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    fn schema_eight(c: &Connection) {
        for sql in [
            include_str!("../migrations/001_initial.sql"),
            include_str!("../migrations/002_settlement.sql"),
            include_str!("../migrations/003_monitoring.sql"),
            include_str!("../migrations/004_tracking_times.sql"),
            include_str!("../migrations/005_monitor_options.sql"),
            include_str!("../migrations/006_import_sources.sql"),
            include_str!("../migrations/007_dashboard_intent.sql"),
            include_str!("../migrations/008_url_matching.sql"),
        ] {
            c.execute_batch(sql).unwrap();
        }
        c.execute_batch("PRAGMA user_version=8;").unwrap();
    }

    #[test]
    fn rename_trims_supports_swaps_and_preserves_records_rules_and_visual_identity() {
        let mut store = memory();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: Some(0.5),
                remark: "保留".into(),
            })
            .unwrap();
        store
            .connection
            .execute(
                "INSERT INTO work_urls(url_prefix,category) VALUES('https://example.test/','开发')",
                [],
            )
            .unwrap();
        let before = serde_json::to_value(store.active().unwrap()).unwrap();
        let mut config = store.category_names().unwrap();
        config.names.insert("评测".into(), "质检".into());
        config.names.insert("质检".into(), "评测".into());
        config.names.insert("开发".into(), "  编程开发  ".into());
        let saved = store.save_category_names(config).unwrap();
        assert_eq!(saved.revision, 1);
        assert_eq!(saved.names["开发"], "编程开发");
        assert_eq!(
            serde_json::to_value(store.active().unwrap()).unwrap(),
            before
        );
        assert_eq!(store.monitor_config().unwrap().rules[0].category, "开发");
        assert_eq!(
            store.save_category_names(saved.clone()).unwrap().revision,
            1
        );
        assert_eq!(store.category_names().unwrap(), saved);
    }

    #[test]
    fn invalid_and_stale_names_never_replace_saved_config() {
        let mut store = memory();
        let initial = store.category_names().unwrap();
        for invalid in [
            "",
            " \t ",
            "质检",
            "a\nb",
            "abcdefghijklmnopqrstu",
            "零\0字",
        ] {
            let mut input = initial.clone();
            input.names.insert("开发".into(), invalid.into());
            assert!(store.save_category_names(input).is_err(), "{invalid:?}");
            assert_eq!(store.category_names().unwrap(), initial);
        }
        let mut missing = initial.clone();
        missing.names.remove("文档");
        assert!(store.save_category_names(missing).is_err());
        let mut extra = initial.clone();
        extra.names.insert("未知".into(), "新类型".into());
        assert!(store.save_category_names(extra).is_err());
        let mut changed = initial.clone();
        changed.names.insert("开发".into(), "程序".into());
        store.save_category_names(changed).unwrap();
        assert!(store.save_category_names(initial).is_err());
        let mut duplicate = store.category_names().unwrap();
        duplicate.names.insert("开发".into(), "code".into());
        duplicate.names.insert("文档".into(), "CODE".into());
        assert!(store.save_category_names(duplicate).is_err());
    }

    #[test]
    fn failed_name_transaction_rolls_back_temporary_names_and_revision() {
        let mut store = memory();
        let initial = store.category_names().unwrap();
        let mut input = initial.clone();
        input.names.insert("开发".into(), "新名字".into());
        store.connection.execute_batch("CREATE TRIGGER fail_names BEFORE UPDATE ON category_names WHEN NEW.display_name='新名字' BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(store.save_category_names(input).is_err());
        assert_eq!(store.category_names().unwrap(), initial);
    }

    #[test]
    fn eight_to_nine_preserves_children_high_water_mark_and_existing_settings() {
        let c = Connection::open_in_memory().unwrap();
        schema_eight(&c);
        c.execute_batch("INSERT INTO work_records(id,category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status) VALUES(7,'文档',0.25,'历史',1000,2250,1250,1,'FINISHED',1,'COMPLETE');
            INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(7,1000,2250,2250,1250,'CLOSED');
            INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(7,1,3000,'{}','{}');
            INSERT INTO end_reminders VALUES(7,1);
            INSERT INTO work_urls(id,url_prefix,category,match_mode) VALUES(9,'example.test','文档','domain_suffix');
            UPDATE sqlite_sequence SET seq=99 WHERE name='work_records';
            UPDATE monitoring_settings SET idle_warning_seconds=12,idle_end_seconds=23,hold_seconds=55,revision=17;").unwrap();
        let mut store = Store::initialize(c, Box::new(TestClock::new()), None).unwrap();
        assert_eq!(store.record(7).unwrap().duration_ms, 1250);
        assert_eq!(store.record(7).unwrap().quantity, Some(0.25));
        assert_eq!(store.record(7).unwrap().remark, "历史");
        for table in ["work_segments", "record_revisions", "end_reminders"] {
            assert_eq!(
                store
                    .connection
                    .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r
                        .get::<_, i64>(0))
                    .unwrap(),
                1
            );
        }
        assert_eq!(store.monitor_config().unwrap().times.idle_pause_seconds, 22);
        assert_eq!(store.monitor_config().unwrap().times.hold_seconds, 55);
        assert_eq!(store.monitor_config().unwrap().revision, 17);
        assert_eq!(store.monitor_config().unwrap().rules[0].id, 9);
        assert_eq!(
            store
                .connection
                .pragma_query_value(None, "foreign_keys", |r| r.get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(
            store
                .connection
                .query_row("PRAGMA integrity_check", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "ok"
        );
        store.delete_record(7).unwrap();
        for table in ["work_segments", "record_revisions", "end_reminders"] {
            assert_eq!(
                store
                    .connection
                    .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r
                        .get::<_, i64>(0))
                    .unwrap(),
                0
            );
        }
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: String::new(),
            })
            .unwrap();
        assert_eq!(store.active().unwrap().unwrap().id, 100);
    }

    #[test]
    fn migration_failure_rolls_back_rebuild_and_user_version() {
        let d = TestDirectory::new();
        let c = Connection::open(d.db()).unwrap();
        schema_eight(&c);
        // An invalid reference must be detected without deleting the original child.
        c.pragma_update(None, "foreign_keys", false).unwrap();
        c.execute_batch("INSERT INTO work_segments(record_id,start_time,checkpoint_time,state) VALUES(999,0,0,'OPEN');").unwrap();
        drop(c);
        assert!(Store::open(&d.db(), Box::new(TestClock::new())).is_err());
        let c = Connection::open(d.db()).unwrap();
        assert_eq!(
            c.pragma_query_value(None, "user_version", |r| r.get::<_, i64>(0))
                .unwrap(),
            8
        );
        assert_eq!(
            c.query_row("SELECT COUNT(*) FROM work_segments", [], |r| r
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(c.query_row("SELECT COUNT(*) FROM sqlite_master WHERE name IN ('category_names','work_records_v9')", [], |r| r.get::<_,i64>(0)).unwrap(), 0);
        assert!(
            c.prepare("SELECT idle_pause_seconds FROM monitoring_settings")
                .is_err()
        );
    }

    #[test]
    fn names_persist_across_restart_without_rerunning_migration() {
        let d = TestDirectory::new();
        let saved = {
            let mut store = Store::open(&d.db(), Box::new(TestClock::new())).unwrap();
            let mut input = store.category_names().unwrap();
            input.names.insert("开发".into(), "自定义开发".into());
            store.save_category_names(input).unwrap()
        };
        let store = Store::open(&d.db(), Box::new(TestClock::new())).unwrap();
        assert_eq!(store.category_names().unwrap(), saved);
        assert_eq!(
            store
                .connection
                .pragma_query_value(None, "user_version", |r| r.get::<_, i64>(0))
                .unwrap(),
            11
        );
    }
}

```
