# 网页直接补记录：完整源码清单

2026-11-12，当前源码步骤快照。18 个新增／更新程序、迁移与测试文件全文，路径根目录 E:\WorkMemo。交付报告与测试见 [WEB-MANUAL-ENTRY.md](WEB-MANUAL-ENTRY.md)。不包含依赖目录、编译产物、真实数据或凭据。

## E:\WorkMemo\src-tauri\migrations\012_manual_entries.sql

```sql
-- Keep creation request IDs durable so a lost HTTP response cannot duplicate work.
CREATE TABLE manual_entry_requests (
    request_id TEXT PRIMARY KEY CHECK(length(request_id) BETWEEN 16 AND 80),
    record_id INTEGER UNIQUE REFERENCES work_records(id) ON DELETE SET NULL,
    fingerprint TEXT NOT NULL
);
```

## E:\WorkMemo\src-tauri\src\manual_entry.rs

```rust
use super::*;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ManualEntryInput {
    pub request_id: String,
    pub category: String,
    pub quantity: f64,
    pub remark: String,
    pub start_time: i64,
    pub end_time: i64,
    pub duration_ms: i64,
}

impl Store {
    pub fn create_manual_entry(&mut self, input: ManualEntryInput) -> Result<i64> {
        if !(16..=80).contains(&input.request_id.len())
            || !input
                .request_id
                .bytes()
                .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
        {
            return Err("补录请求标识无效，请重新打开补记录。".into());
        }
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if !valid_quantity(input.quantity) {
            return Err("请填写 0 到 10 亿之间的有效工作量。".into());
        }
        let remark = input.remark.trim();
        if remark.chars().count() > 2000 {
            return Err("备注不能超过 2000 个字符。".into());
        }
        if input.start_time < 0
            || input.end_time <= input.start_time
            || input.duration_ms < 0
            || input.duration_ms > input.end_time - input.start_time
        {
            return Err("起止时间或有效工时无效；有效工时不能超过起止时间跨度。".into());
        }
        let quantity = if input.quantity == 0.0 {
            0.0
        } else {
            input.quantity
        };
        let fingerprint = serde_json::to_string(&(
            &input.category,
            quantity,
            remark,
            input.start_time,
            input.end_time,
            input.duration_ms,
        ))
        .map_err(|e| format!("补录校验失败：{e}"))?;
        let now = self.clock.now().wall_ms.max(0);
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let previous: Option<(Option<i64>, String)> = tx
            .query_row(
                "SELECT record_id,fingerprint FROM manual_entry_requests WHERE request_id=?1",
                [&input.request_id],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .optional()
            .map_err(db_error)?;
        if let Some((id, saved)) = previous {
            if saved != fingerprint {
                return Err("该补录请求已保存，内容与本次不同，请刷新明细核对。".into());
            }
            return id.ok_or_else(|| "这条补录已被删除，请重新打开补记录。".into());
        }
        if input.end_time > now {
            return Err("不能补录未来的工作时间。".into());
        }
        // Manually supplied work is a baseline, never a fabricated timer segment.
        tx.execute(
            "INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,
             duration_seconds,status,is_paused,recovery_pending,settlement_status,source,
             confirmed_end_time,end_reason,legacy_duration_ms,control_mode)
             VALUES(?1,?2,?3,?4,?5,?6,?6/1000,'FINISHED',1,0,'COMPLETE','MANUAL_ENTRY',?7,'MANUAL',?6,'MANUAL')",
            params![input.category,quantity,remark,input.start_time,input.end_time,input.duration_ms,now],
        ).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        tx.execute(
            "INSERT INTO manual_entry_requests(request_id,record_id,fingerprint) VALUES(?1,?2,?3)",
            params![input.request_id, id, fingerprint],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(id)
    }
}

#[cfg(test)]
#[path = "manual_entry_tests.rs"]
mod tests;
```

## E:\WorkMemo\src-tauri\src\manual_entry_tests.rs

```rust
use super::*;
use crate::database::tests::{TestClock, TestDirectory};

fn input() -> ManualEntryInput {
    ManualEntryInput {
        request_id: "manual-request-0001".into(),
        category: "文档".into(),
        quantity: 2.5,
        remark: "  真实补录  ".into(),
        start_time: 100_000,
        end_time: 200_000,
        duration_ms: 75_250,
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
fn count(store: &Store, table: &str) -> i64 {
    store
        .connection
        .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r.get(0))
        .unwrap()
}

#[test]
fn manual_work_is_complete_and_preserves_active_timer_without_fabricated_segments() {
    let (mut store, clock) = memory();
    store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "当前工作".into(),
        })
        .unwrap();
    let active = store.active().unwrap().unwrap().id;
    clock.advance(1250);
    let id = store.create_manual_entry(input()).unwrap();
    let record = store.record(id).unwrap();
    assert_eq!(record.source, "MANUAL_ENTRY");
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.settlement_status, "COMPLETE");
    assert_eq!(record.quantity, Some(2.5));
    assert_eq!(record.remark, "真实补录");
    assert_eq!(record.duration_ms, 75_250);
    assert_eq!(record.duration_seconds, 75);
    assert_eq!(record.legacy_duration_ms, 75_250);
    let detail = store.dashboard_detail(id).unwrap();
    assert_eq!(detail["record"]["is_demo"], false);
    assert!(detail["segments"].as_array().unwrap().is_empty());
    assert!(store.pending_records().unwrap().is_empty());
    assert_eq!(store.snapshot().unwrap().active.unwrap().id, active);
    assert_eq!(store.record(active).unwrap().duration_ms, 1250);
    assert_eq!(store.segment.as_ref().unwrap().id, active);
    let totals = store
        .dashboard_query(data_center::DashboardQuery {
            scope: "real".into(),
            ..Default::default()
        })
        .unwrap();
    assert_eq!(totals["totals"]["records"], 1);
    assert_eq!(totals["totals"]["quantity"], 2.5);
    assert_eq!(totals["totals"]["duration_ms"], 75_250);
}

#[test]
fn retries_and_restart_create_exactly_one_record() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        id = store.create_manual_entry(input()).unwrap();
        // A clock rollback after commit must not turn a response retry into a new write.
        clock.jump_wall(-900_000);
        assert_eq!(store.create_manual_entry(input()).unwrap(), id);
        assert_eq!(count(&store, "work_records"), 1);
    }
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert_eq!(reopened.create_manual_entry(input()).unwrap(), id);
    assert_eq!(count(&reopened, "work_records"), 1);
    assert_eq!(count(&reopened, "manual_entry_requests"), 1);
}

#[test]
fn reused_request_cannot_replace_or_duplicate_saved_or_deleted_work() {
    let (mut store, _) = memory();
    let id = store.create_manual_entry(input()).unwrap();
    let mut changed = input();
    changed.quantity = 8.0;
    assert!(store.create_manual_entry(changed).is_err());
    assert_eq!(store.record(id).unwrap().quantity, Some(2.5));
    store.dashboard_delete(id, 0).unwrap();
    assert!(store.create_manual_entry(input()).is_err());
    assert_eq!(count(&store, "work_records"), 0);
    assert_eq!(count(&store, "manual_entry_requests"), 1);
}

#[test]
fn request_write_failure_rolls_back_record_and_allows_safe_retry() {
    let (mut store, _) = memory();
    store.connection.execute_batch("CREATE TRIGGER fail_manual BEFORE INSERT ON manual_entry_requests BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
    assert!(store.create_manual_entry(input()).is_err());
    assert_eq!(count(&store, "work_records"), 0);
    assert_eq!(count(&store, "manual_entry_requests"), 0);
    store
        .connection
        .execute_batch("DROP TRIGGER fail_manual")
        .unwrap();
    assert_eq!(store.create_manual_entry(input()).unwrap(), 1);
    assert_eq!(count(&store, "work_records"), 1);
}

#[test]
fn invalid_times_durations_and_quantities_never_create_work() {
    let (mut store, _) = memory();
    for (start, end, duration) in [
        (-1, 200_000, 1),
        (100_000, 100_000, 0),
        (200_000, 100_000, 1),
        (100_000, 1_000_001, 1),
        (100_000, 200_000, -1),
        (100_000, 200_000, 100_001),
    ] {
        let mut value = input();
        value.start_time = start;
        value.end_time = end;
        value.duration_ms = duration;
        assert!(store.create_manual_entry(value).is_err());
    }
    for quantity in [-1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        let mut value = input();
        value.quantity = quantity;
        assert!(store.create_manual_entry(value).is_err());
    }
    for request in ["short", "../../unsafe/request", "请求标识不合法0000000000"] {
        let mut value = input();
        value.request_id = request.into();
        assert!(store.create_manual_entry(value).is_err());
    }
    let mut value = input();
    value.category = "未知".into();
    assert!(store.create_manual_entry(value).is_err());
    let mut value = input();
    value.remark = "😀".repeat(2001);
    assert!(store.create_manual_entry(value).is_err());
    assert_eq!(count(&store, "work_records"), 0);
}

#[test]
fn zero_quantity_zero_duration_and_unicode_boundary_are_valid() {
    let (mut store, _) = memory();
    let mut value = input();
    value.quantity = 0.0;
    value.duration_ms = 0;
    value.remark = "😀".repeat(2000);
    let id = store.create_manual_entry(value).unwrap();
    assert_eq!(store.record(id).unwrap().quantity, Some(0.0));
    assert_eq!(store.record(id).unwrap().duration_ms, 0);
    assert_eq!(store.record(id).unwrap().remark.chars().count(), 2000);
    // Input rejects fields that might otherwise pretend to create a running or demo task.
    assert!(serde_json::from_str::<ManualEntryInput>(r#"{"request_id":"manual-request-0001","category":"开发","quantity":0,"remark":"","start_time":0,"end_time":1,"duration_ms":0,"status":"WORKING"}"#).is_err());
}
```

## E:\WorkMemo\src-tauri\src\database.rs

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
            1..=12 => {}
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
        if version < 12 {
            tx.execute_batch(include_str!("../migrations/012_manual_entries.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 12)
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
#[path = "manual_entry.rs"]
mod manual_entry;
pub use manual_entry::ManualEntryInput;
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

## E:\WorkMemo\src-tauri\src\dashboard.rs

```rust
use crate::{
    database::{ManualEntryInput, SettleInput, data_center::DashboardQuery},
    service::{Backend, SharedStore},
};
use serde_json::{Value, json};
use std::{
    io::Read,
    path::PathBuf,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};
use tauri::{Emitter, Manager};
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};
type Result<T> = std::result::Result<T, String>;
pub struct DashboardState {
    pub origin: String,
    pub token: String,
}
fn token() -> Result<String> {
    let mut bytes = [0u8; 32];
    #[cfg(windows)]
    {
        use windows_sys::Win32::Security::Cryptography::*;
        if unsafe {
            BCryptGenRandom(
                std::ptr::null_mut(),
                bytes.as_mut_ptr(),
                32,
                BCRYPT_USE_SYSTEM_PREFERRED_RNG,
            )
        } < 0
        {
            return Err("无法生成网页访问令牌".into());
        }
    }
    #[cfg(not(windows))]
    {
        return Err("数据中心目前仅支持Windows".into());
    }
    Ok(bytes.iter().map(|b| format!("{b:02x}")).collect())
}
pub fn initialize(app: &tauri::App) -> Result<DashboardState> {
    let server = Server::http(("127.0.0.1", 0)).map_err(|e| e.to_string())?;
    let address = server.server_addr().to_ip().ok_or("本机地址无效")?;
    let origin = format!("http://{address}");
    let token = token()?;
    // Runtime connection information is outside the backup whitelist and bundles.
    let directory = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let endpoint = directory.join("dashboard.endpoint.json");
    let pending = directory.join("dashboard.endpoint.pending");
    std::fs::write(
        &pending,
        serde_json::to_vec(&json!({"origin":origin,"token":token})).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    std::fs::rename(pending, endpoint).map_err(|e| e.to_string())?;
    let handle = app.handle().clone();
    let shared = app.state::<Backend>().inner.clone();
    let authority = address.to_string();
    let secret = token.clone();
    let base = origin.clone();
    let clients = Arc::new(AtomicUsize::new(0));
    std::thread::spawn(move || {
        for req in server.incoming_requests() {
            if clients.load(Ordering::Relaxed) >= 16 {
                let _ = req.respond(Response::from_string("busy").with_status_code(503));
                continue;
            }
            clients.fetch_add(1, Ordering::Relaxed);
            let count = clients.clone();
            let app = handle.clone();
            let store = shared.clone();
            let host = authority.clone();
            let key = secret.clone();
            let origin = base.clone();
            std::thread::spawn(move || {
                serve(req, &app, &store, &host, &origin, &key);
                count.fetch_sub(1, Ordering::Relaxed);
            });
        }
    });
    Ok(DashboardState { origin, token })
}
fn header<'a>(req: &'a Request, name: &str) -> Option<&'a str> {
    req.headers()
        .iter()
        .find(|h| h.field.as_str().as_str().eq_ignore_ascii_case(name))
        .map(|h| h.value.as_str())
}
fn authorize(
    host: Option<&str>,
    origin: Option<&str>,
    auth: Option<&str>,
    expected_host: &str,
    base: &str,
    key: &str,
    write: bool,
) -> bool {
    if host != Some(expected_host)
        || origin.is_some_and(|v| v != base)
        || (write && origin != Some(base))
    {
        return false;
    }
    let expected = format!("Bearer {key}");
    let actual = auth.unwrap_or("").as_bytes();
    actual.len() == expected.len()
        && actual
            .iter()
            .zip(expected.bytes())
            .fold(0u8, |a, (b, c)| a | (*b ^ c))
            == 0
}
fn serve(
    mut req: Request,
    app: &tauri::AppHandle,
    shared: &SharedStore,
    host: &str,
    origin: &str,
    key: &str,
) {
    let path = req.url().split('?').next().unwrap_or("").to_string();
    if header(&req, "Host") != Some(host) {
        respond(req, 403, b"forbidden".to_vec(), "text/plain");
        return;
    }
    if path.starts_with("/api/") {
        let write = req.method() == &Method::Post;
        if !authorize(
            header(&req, "Host"),
            header(&req, "Origin"),
            header(&req, "Authorization"),
            host,
            origin,
            key,
            write,
        ) || (!write && req.method() != &Method::Get)
        {
            respond(req, 403, b"forbidden".to_vec(), "text/plain");
            return;
        }
        if req.body_length().is_some_and(|n| n > 65536) {
            respond(req, 413, b"too large".to_vec(), "text/plain");
            return;
        }
        let result = (|| -> Result<Value> {
            let mut body = String::new();
            req.as_reader()
                .take(65537)
                .read_to_string(&mut body)
                .map_err(|e| e.to_string())?;
            if body.len() > 65536 {
                return Err("请求过大".into());
            }
            let input: Value = if body.is_empty() {
                json!({})
            } else {
                serde_json::from_str(&body).map_err(|_| "请求格式无效")?
            };
            if path == "/api/meta" && !write {
                let presentation = crate::presentation::load(
                    &app.state::<crate::presentation::PresentationState>().dir,
                )?;
                let guard = shared.lock().map_err(|_| "数据库锁异常")?;
                let store = guard.as_ref().map_err(|e| e.clone())?;
                return Ok(
                    json!({"version":env!("CARGO_PKG_VERSION"),"manual_entry":true,"presentation":presentation,"active":store.active()?,"category_names":store.category_names()?}),
                );
            }
            if !write {
                return Err("此接口需要POST请求".into());
            }
            let mut guard = shared.lock().map_err(|_| "数据库锁异常")?;
            let store = guard.as_mut().map_err(|e| e.clone())?;
            store.expire_previous_day_pauses()?;
            let value = match path.as_str() {
                "/api/manual-entry" => {
                    let id = store.create_manual_entry(
                        serde_json::from_value::<ManualEntryInput>(input)
                            .map_err(|_| "补录参数无效")?,
                    )?;
                    store.dashboard_detail(id)?
                }
                "/api/query" => store.dashboard_query(
                    serde_json::from_value::<DashboardQuery>(input).map_err(|_| "筛选参数无效")?,
                )?,
                "/api/detail" => {
                    store.dashboard_detail(input["id"].as_i64().ok_or("记录编号无效")?)?
                }
                "/api/save" => {
                    store.settle(
                        serde_json::from_value::<SettleInput>(input).map_err(|_| "保存参数无效")?,
                    )?;
                    json!({"saved":true})
                }
                "/api/delete" => {
                    store.dashboard_delete(
                        input["id"].as_i64().ok_or("记录编号无效")?,
                        input["expected_revision"].as_i64().ok_or("记录版本无效")?,
                    )?;
                    json!({"deleted":true})
                }
                _ => return Err("接口不存在".into()),
            };
            if ["/api/save", "/api/delete", "/api/manual-entry"].contains(&path.as_str()) {
                let _ = app.emit("workmemo:data-changed", ());
            }
            Ok(value)
        })();
        match result {
            Ok(value) => respond(
                req,
                200,
                serde_json::to_vec(&value).unwrap_or_default(),
                "application/json",
            ),
            Err(error) => respond(
                req,
                400,
                serde_json::to_vec(&json!({"error":error})).unwrap_or_default(),
                "application/json",
            ),
        };
    } else {
        if req.method() != &Method::Get {
            respond(req, 405, Vec::new(), "text/plain");
            return;
        }
        let asset = if path == "/" || path == "/dashboard" {
            "index.html"
        } else {
            path.trim_start_matches('/')
        };
        if asset.contains("..")
            || asset.contains('%')
            || asset.contains('\\')
            || !(asset == "index.html" || asset == "workmemo.png" || asset.starts_with("assets/"))
        {
            respond(req, 404, Vec::new(), "text/plain");
            return;
        }
        if let Some(content) = app.asset_resolver().get(asset.into()) {
            respond(req, 200, content.bytes, &content.mime_type);
            return;
        }
        #[cfg(debug_assertions)]
        {
            let file = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../dist")
                .join(asset);
            if let Ok(bytes) = std::fs::read(file) {
                respond(
                    req,
                    200,
                    bytes,
                    if asset.ends_with(".js") {
                        "text/javascript"
                    } else if asset.ends_with(".css") {
                        "text/css"
                    } else {
                        "text/html"
                    },
                );
                return;
            }
        }
        respond(req, 404, Vec::new(), "text/plain");
    }
}
fn respond(req: Request, status: u16, body: Vec<u8>, mime: &str) {
    let mut response = Response::from_data(body).with_status_code(StatusCode(status));
    for (key, value) in [
        ("Content-Type", mime),
        ("Cache-Control", "no-store"),
        ("X-Content-Type-Options", "nosniff"),
        ("Referrer-Policy", "no-referrer"),
        (
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
        ),
    ] {
        response.add_header(Header::from_bytes(key, value).unwrap());
    }
    let _ = req.respond(response);
}
fn address(app: &tauri::AppHandle, view: &str, scope: &str) -> String {
    let state = app.state::<DashboardState>();
    let view = if ["today", "pending", "all"].contains(&view) {
        view
    } else {
        "all"
    };
    let scope = if scope == "demo" { "demo" } else { "real" };
    format!(
        "{}/dashboard#token={}&view={view}&scope={scope}",
        state.origin, state.token
    )
}
fn chrome_path() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::System::Registry::*;
        let sub: Vec<u16> = "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe\0"
            .encode_utf16()
            .collect();
        for key in [HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE] {
            let mut data = vec![0u16; 32768];
            let mut size = (data.len() * 2) as u32;
            if unsafe {
                RegGetValueW(
                    key,
                    sub.as_ptr(),
                    std::ptr::null(),
                    RRF_RT_REG_SZ,
                    std::ptr::null_mut(),
                    data.as_mut_ptr() as _,
                    &mut size,
                )
            } == 0
            {
                let n = data.iter().position(|c| *c == 0).unwrap_or(0);
                let p = PathBuf::from(String::from_utf16_lossy(&data[..n]));
                if p.is_file() {
                    return Some(p);
                }
            }
        }
    }
    for var in ["LOCALAPPDATA", "PROGRAMFILES", "PROGRAMFILES(X86)"] {
        if let Some(root) = std::env::var_os(var) {
            let path = PathBuf::from(root).join("Google/Chrome/Application/chrome.exe");
            if path.is_file() {
                return Some(path);
            }
        }
    }
    None
}
pub fn open_impl(
    app: &tauri::AppHandle,
    view: &str,
    scope: &str,
    default_browser: bool,
) -> Result<()> {
    let url = address(app, view, scope);
    if default_browser {
        #[cfg(windows)]
        {
            use windows_sys::Win32::UI::Shell::ShellExecuteW;
            let verb: Vec<u16> = "open\0".encode_utf16().collect();
            let file: Vec<u16> = url.encode_utf16().chain(Some(0)).collect();
            let result = unsafe {
                ShellExecuteW(
                    std::ptr::null_mut(),
                    verb.as_ptr(),
                    file.as_ptr(),
                    std::ptr::null(),
                    std::ptr::null(),
                    1,
                )
            };
            if result as isize <= 32 {
                return Err("无法打开默认浏览器，请复制网页地址。".into());
            }
            return Ok(());
        }
        #[cfg(not(windows))]
        {
            return Err("仅支持Windows浏览器启动".into());
        }
    }
    let chrome = chrome_path().ok_or("未找到Chrome，请选择默认浏览器或复制数据中心地址。")?;
    let mut command = std::process::Command::new(chrome);
    command.arg(url);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    command
        .spawn()
        .map_err(|_| "无法启动Chrome，请选择默认浏览器或复制地址。")?;
    Ok(())
}
#[tauri::command]
pub async fn open_dashboard(
    app: tauri::AppHandle,
    view: Option<String>,
    scope: Option<String>,
    default_browser: Option<bool>,
) -> Result<()> {
    tauri::async_runtime::spawn_blocking(move || {
        open_impl(
            &app,
            view.as_deref().unwrap_or("all"),
            scope.as_deref().unwrap_or("real"),
            default_browser.unwrap_or(false),
        )
    })
    .await
    .map_err(|e| e.to_string())?
}
#[tauri::command]
pub fn get_dashboard_address(
    app: tauri::AppHandle,
    view: Option<String>,
    scope: Option<String>,
) -> String {
    address(
        &app,
        view.as_deref().unwrap_or("all"),
        scope.as_deref().unwrap_or("real"),
    )
}
#[tauri::command]
pub async fn get_today_workload(
    state: tauri::State<'_, Backend>,
) -> Result<Vec<crate::database::data_center::TodayWorkload>> {
    crate::service::access(state.inner.clone(), |s| s.today_workload()).await
}
#[tauri::command]
pub async fn seed_demo_data(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<i64> {
    let result = crate::service::access(state.inner.clone(), |s| s.seed_demo()).await?;
    let _ = app.emit("workmemo:data-changed", ());
    Ok(result)
}
#[tauri::command]
pub async fn clear_demo_data(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<usize> {
    let result = crate::service::access(state.inner.clone(), |s| s.clear_demo()).await?;
    let _ = app.emit("workmemo:data-changed", ());
    Ok(result)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn authentication_rejects_cross_origin_and_wrong_host() {
        let key = "test-secret";
        assert!(authorize(
            Some("127.0.0.1:1234"),
            Some("http://127.0.0.1:1234"),
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            true
        ));
        assert!(!authorize(
            Some("evil:1234"),
            None,
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            false
        ));
        assert!(!authorize(
            Some("127.0.0.1:1234"),
            Some("https://evil.test"),
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            true
        ));
        assert!(!authorize(
            Some("127.0.0.1:1234"),
            None,
            Some("Bearer wrong"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            false
        ));
    }
}

pub fn cleanup(app: &tauri::AppHandle) {
    if let (Some(state), Ok(dir)) = (
        app.try_state::<DashboardState>(),
        app.path().app_local_data_dir(),
    ) {
        let path = dir.join("dashboard.endpoint.json");
        if let Ok(bytes) = std::fs::read(&path) {
            if serde_json::from_slice::<Value>(&bytes)
                .ok()
                .is_some_and(|v| v["token"] == state.token)
            {
                let _ = std::fs::remove_file(path);
            }
        }
    }
}
```

## E:\WorkMemo\src-tauri\src\data_tools.rs

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
                "manual_entry_requests",
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
    fn manual_entry_backup_restores_retry_registry_and_deleted_tombstone() {
        let d = TestDirectory::new();
        let path = d.db();
        let dir = path.parent().unwrap();
        let mut source = empty();
        let input = |request: &str| crate::database::ManualEntryInput {
            request_id: request.into(),
            category: "文档".into(),
            quantity: 3.0,
            remark: "补录备份".into(),
            start_time: 1,
            end_time: 1000,
            duration_ms: 900,
        };
        let id = source
            .create_manual_entry(input("backup-manual-entry-1"))
            .unwrap();
        let deleted = source
            .create_manual_entry(input("backup-manual-entry-2"))
            .unwrap();
        source.dashboard_delete(deleted, 0).unwrap();
        let image = checked_image(&source.archive(dir).unwrap(), dir).unwrap();
        let mut target = empty();
        // Restore replaces existing registry entries before replacing records (foreign keys stay on).
        target
            .create_manual_entry(input("discarded-target-entry"))
            .unwrap();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target
                .create_manual_entry(input("backup-manual-entry-1"))
                .unwrap(),
            id
        );
        assert!(
            target
                .create_manual_entry(input("backup-manual-entry-2"))
                .is_err()
        );
        assert_eq!(target.record(id).unwrap().duration_ms, 900);
        assert_eq!(
            target
                .connection
                .query_row("SELECT COUNT(*) FROM manual_entry_requests", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            2
        );
        let mut imported = empty();
        assert_eq!(merge(&mut imported, &source).unwrap().imported, 1);
        assert_eq!(imported.record(1).unwrap().source, "MANUAL_ENTRY");
        assert_eq!(imported.record(1).unwrap().duration_ms, 900);
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
        source.connection.execute_batch("PRAGMA foreign_keys=OFF; DROP TABLE manual_entry_requests; DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; DROP TABLE ignored_work_urls; DROP TABLE work_tasks; DELETE FROM work_urls; ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; INSERT INTO work_urls(url_prefix,category) VALUES('https://example.com/','开发'); ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;").unwrap();
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

## E:\WorkMemo\src-tauri\src\categories.rs

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
            12
        );
    }
}
```

## E:\WorkMemo\src-tauri\src\history_tests.rs

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
        assert_eq!(version, 12);
    }
    // Exact temporary test directory, created above; never a user database path.
    assert_eq!(directory.parent(), Some(std::env::temp_dir().as_path()));
    std::fs::remove_dir_all(directory).unwrap();
}
```

## E:\WorkMemo\src-tauri\src\tracking_tests.rs

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
        .execute_batch("PRAGMA foreign_keys=OFF; DROP TABLE manual_entry_requests; DROP INDEX paused_records_by_day; ALTER TABLE work_records DROP COLUMN paused_at; DROP TABLE ignored_work_urls; DROP TABLE work_tasks; ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; UPDATE sqlite_sequence SET seq=99 WHERE name='work_urls'; ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;")
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

## E:\WorkMemo\src-tauri\src\day_rollover_tests.rs

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
```

## E:\WorkMemo\src\Dashboard.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  type InputRef,
  type TableColumnsType,
} from "antd";
import dayjs from "dayjs";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  shiftPeriod,
  reportRangeLabel,
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import { UiProvider, useMediaQuery } from "./ui/UiProvider";
import { BottomSheet } from "./ui/BottomSheet";
import {
  api,
  initialQuery,
  type CategoryTotal,
  type Detail,
  type Data,
  type Query,
  type Row,
} from "./dashboard/api";
import { useDashboardData } from "./dashboard/useDashboardData";
import { ManualEntryModal } from "./dashboard/ManualEntryModal";
import { CalendarChart, CategoryChart, DurationPieChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

const minDate = dayjs("1970-01-01"),
  maxDate = dayjs("9999-12-31");
function RecordStatus({ row }: { row: Row }) {
  return (
    <Space size={4} wrap>
    <Tag
      color={
        row.status !== "FINISHED"
          ? "processing"
          : row.settlement_status === "PENDING"
            ? "gold"
            : "success"
      }
    >
      {row.status !== "FINISHED"
        ? "进行中"
        : row.settlement_status === "PENDING"
          ? "待补全"
          : "已确认"}
    </Tag>
    {row.source === "MANUAL_ENTRY" && !row.is_demo && <Tag color="blue">人工补录</Tag>}
    </Space>
  );
}
function Title({ title, description }: { title: string; description?: string }) {
  return (
    <div className="dc-card-title">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
function DashboardContent() {
  const { message } = AntApp.useApp();
  const { name } = useCategoryNames();
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [refresh, setRefresh] = useState(0);
  const { data, meta, error, online, refreshing, updatedAt, loading } =
    useDashboardData(query, refresh);
  const [actionError, setActionError] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [detailStale, setDetailStale] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<Query | null>(null);
  const [pendingData, setPendingData] = useState<Data | null>(null);
  const [pendingError, setPendingError] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const selectedPending = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<InputRef>(null);
  const safeConfirmAction = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const recordsRef = useRef<HTMLElement>(null);
  const [confirmation, setConfirmation] = useState<"guard" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const next = useRef<(() => void) | null>(null);
  const afterConfirm = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const [section, setSection] = useState("overview");
  const [hideNavHints, setHideNavHints] = useState(false);
  const [navHint, setNavHint] = useState<string | null>(null);
  const navScrollFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(navScrollFrame.current), []);
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: name(value),
  }));
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const blocked = busy || confirmation !== null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0])
          setSection(entries[0].isIntersecting ? "records" : "overview");
      },
      { rootMargin: "-64px 0px -25% 0px" },
    );
    if (recordsRef.current) observer.observe(recordsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (editing && sheetOpen && !confirmation)
      quantityInput.current?.focus({ preventScroll: true });
  }, [editing, sheetOpen, confirmation, detail?.record.id]);
  function applyQuery(value: Query) {
    setFilters(value);
    setQuery(value);
  }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({
      ...filters,
      period,
      anchor_date:
        period === "custom"
          ? null
          : filters.anchor_date || data?.range.anchor_date || null,
      start_date: period === "custom" ? (data?.range.start_date ?? null) : null,
      end_date: period === "custom" ? (data?.range.end_date ?? null) : null,
      page: 1,
    });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    const shifted = anchor && shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  function leave(action: () => void) {
    if (busyRef.current || confirmation) return;
    if (dirty) {
      next.current = action;
      setConfirmation("guard");
      setConfirmOpen(true);
    } else action();
  }
  function showDetail(value: Detail, edit: boolean) {
    setDetail(value);
    setDetailStale(false);
    setFields({
      category: value.record.category,
      quantity: value.record.quantity === null ? "" : String(value.record.quantity),
      remark: value.record.remark,
    });
    setEditing(edit && value.record.status === "FINISHED");
    setSheetOpen(true);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current || detail) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setEditorError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      setPendingQuery(null);
      showDetail(value, edit);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const readPending = useCallback(async (criteria: Query) => {
    let list = await api<Data>("query", criteria);
    if (criteria.page > list.pages && list.pages > 0)
      list = await api<Data>("query", { ...criteria, page: list.pages });
    setPendingQuery({ ...criteria, page: list.page });
    setPendingData(list);
    setPendingError("");
  }, []);
  async function refreshPending(criteria: Query) {
    if (busyRef.current || !online) return;
    busyRef.current = true; setBusy(true);
    try { await readPending(criteria); }
    catch (e) { setPendingError(String(e instanceof Error ? e.message : e)); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function returnToPending() {
    if (!pendingQuery) return;
    setDetail(null); setEditing(false); setEditorError("");
    void refreshPending(pendingQuery);
  }
  useEffect(() => {
    if (!sheetOpen || detail || !pendingData) return;
    const frame = requestAnimationFrame(() => {
      const id = selectedPending.current;
      const button = document.querySelector<HTMLElement>(`[data-pending-id="${id}"]`)
        ?? document.querySelector<HTMLElement>("[data-pending-id]")
        ?? document.querySelector<HTMLElement>(".dc-pending-refresh");
      button?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [sheetOpen, detail, pendingData]);
  async function selectPending(row: Row) {
    if (!pendingQuery || !pendingData || busyRef.current || !online) return;
    selectedPending.current = row.id;
    busyRef.current = true; setBusy(true); setPendingError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      const record = value.record;
      const date = localDate(new Date(record.start_time));
      if (record.status !== "FINISHED" || record.settlement_status !== "PENDING"
        || record.category !== pendingQuery.category
        || (pendingQuery.scope !== "all" && record.is_demo !== (pendingQuery.scope === "demo"))
        || (pendingData.range.start_date && date < pendingData.range.start_date)
        || (pendingData.range.end_date && date > pendingData.range.end_date)) {
        setPendingStatus("这条记录已变化，请重新选择。");
        await readPending(pendingQuery);
        return;
      }
      showDetail(value, true); setEditorError("");
    } catch (e) {
      // A removed row must not silently open a different record.
      try { await readPending(pendingQuery); }
      catch { /* Preserve the original error and offer an explicit retry. */ }
      setPendingError(e instanceof Error ? e.message : String(e));
    } finally { busyRef.current = false; setBusy(false); }
  }
  async function openCategoryPending(category: string) {
    if (busyRef.current || sheetOpen || !online) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const criteria: Query = { ...query, anchor_date: data?.range.anchor_date ?? query.anchor_date, category, status: "pending", page: 1 };
    setPendingQuery(criteria); setPendingData(null); setPendingError(""); setPendingStatus("");
    selectedPending.current = null; setSheetOpen(true);
    setActionError("");
    await refreshPending(criteria);
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    let committed = false;
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      committed = true;
      // A successful write remains successful if its follow-up read fails.
      const record: Row = {
        ...detail.record,
        ...result.input,
        settlement_status: "COMPLETE",
      };
      setDetail({ ...detail, record });
      setEditing(false);
      setDetailStale(true);
      setFields({
        category: record.category,
        quantity: String(record.quantity),
        remark: record.remark,
      });
      setRefresh((value) => value + 1);
      if (pendingQuery) {
        setDetail(null); setEditing(false); setEditorError("");
        setPendingStatus("工作量已保存，请选择下一条记录。");
        // A committed write stays committed even when refreshing the list fails.
        setPendingData(null);
        try { await readPending(pendingQuery); }
        catch (e) { setPendingError(`已保存，列表刷新失败：${e instanceof Error ? e.message : String(e)}`); }
        return true;
      }
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setDetailStale(false);
      void message.success({ content: "工作量已保存", key: "workload-save" });
      return true;
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      setEditorError(
        committed
          ? `已保存，详情刷新失败：${text}。请关闭后重新打开详情。`
          : text,
      );
      if (committed)
        void message.warning({
          content: "已保存，详情刷新失败",
          key: "workload-save",
        });
      return committed;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online, message, pendingQuery, readPending]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        editing &&
        sheetOpen &&
        !confirmation
      ) {
        event.preventDefault();
        void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, editing, sheetOpen, confirmation, save]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      setConfirmOpen(false);
      setRefresh((value) => value + 1);
      void message.success("记录已删除");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function closeConfirmation() {
    if (!busyRef.current) {
      next.current = null;
      afterConfirm.current = null;
      setConfirmOpen(false);
    }
  }
  function restoreTrigger() {
    requestAnimationFrame(() => {
      (trigger.current?.isConnected
        ? trigger.current
        : recordsRef.current
      )?.focus({ preventScroll: true });
    });
  }
  function pendingLink(row: CategoryTotal) {
    return row.pending > 0 ? <Button type="link" size="small" className="dc-pending-link"
      aria-label={`${name(row.category)}待补填${row.pending}条`} disabled={!online || busy || sheetOpen}
      onClick={() => { void openCategoryPending(row.category); }}>{row.pending} 条</Button>
      : <span className="dc-muted">0 条</span>;
  }
  const reportColumns: TableColumnsType<CategoryTotal> = [
    {
      title: "工作类型",
      dataIndex: "category",
      width: "29%",
      render: (value: string) => (
        <WorkBadge category={value} presentation={presentation} />
      ),
    },
    {
      title: "已确认工作量",
      key: "quantity",
      render: (_, row) => (
        <div className="dc-report-quantity">
          <strong>
            {row.complete > 0
              ? formatQuantity(row.quantity)
              : row.pending > 0
                ? "待补填"
                : "—"}
          </strong>
          <small>
            {row.complete > 0
              ? `已确认 ${row.complete} 条`
              : row.pending > 0
                ? "尚未确认产出"
                : "暂无已结束记录"}
          </small>
        </div>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "已结束记录",
      dataIndex: "records",
      render: (value: number) => <span className="dc-number">{value} 条</span>,
    },
    {
      title: "待补填",
      dataIndex: "pending",
      render: (_, row) => pendingLink(row),
    },
  ];
  const recordColumns: TableColumnsType<Row> = [
    {
      title: "类别",
      dataIndex: "category",
      width: 150,
      render: (value: string, row) => (
        <Space orientation="vertical" size={4}>
          <WorkBadge category={value} presentation={presentation} />
          {row.task_name && row.task_name !== value && row.task_name !== name(value) && <span className="dc-muted">{row.task_name}</span>}
          {row.is_demo && <Tag color="gold">演示</Tag>}
        </Space>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      width: 170,
      render: (value: number) => (
        <span className="dc-date">{formatTime(value)}</span>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      width: 120,
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "工作量",
      key: "quantity",
      width: 110,
      render: (_, row) =>
        row.settlement_status === "COMPLETE" ? (
          <span className="dc-number">{formatQuantity(row.quantity)}</span>
        ) : (
          <span className="dc-muted">
            {row.status === "FINISHED" ? "待补填" : "进行中"}
          </span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_, row) => <RecordStatus row={row} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 190,
      ellipsis: true,
      render: (value: string) => (
        <span className="dc-muted">{value || "—"}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space size={2} className="dc-row-actions">
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => {
              void openDetail(row);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              void openDetail(row, true);
            }}
          >
            {row.settlement_status === "PENDING" ? "补填" : "编辑"}
          </Button>
          <Button
            type="text"
            danger
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              setEditorError("");
              setDeleting(row);
              setConfirmation("delete");
              setConfirmOpen(true);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const totals = data?.totals;
  const scrollBehavior = reduced ? "instant" : "smooth";
  const dateField = (
    label: string,
    value: string | null,
    change: (value: string | null) => void,
    required = false,
  ) => (
    <Form.Item label={label}>
      <DatePicker
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => change(date?.format("YYYY-MM-DD") ?? null)}
        inputReadOnly={false}
      />
    </Form.Item>
  );
  return (
    <div className="data-center">
      <aside className="dc-sidebar" inert={!!detail || !!confirmation || manualOpen}>
        <Tooltip title="WorkMemo 工作数据中心" placement="right">
          <a
            className="dc-brand"
            href="/dashboard"
            aria-label="WorkMemo 工作数据中心"
          >
            <img src="/workmemo.png" alt="" />
          </a>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[section]}
          tooltip={false}
          onMouseLeave={() => { setHideNavHints(false); setNavHint(null); }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHideNavHints(false); }}
          items={[
            {
              key: "overview",
              icon: <Tooltip title="工作总览" placement="right" trigger={[]} open={!hideNavHints && navHint === "overview"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="chart" /></span>
              </Tooltip>,
              label: "工作总览",
              onMouseEnter: () => setNavHint("overview"),
              onMouseLeave: () => setNavHint(null),
            },
            {
              key: "records",
              icon: <Tooltip title="工作明细" placement="right" trigger={[]} open={!hideNavHints && navHint === "records"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="list" /></span>
              </Tooltip>,
              label: "工作明细",
              onMouseEnter: () => setNavHint("records"),
              onMouseLeave: () => setNavHint(null),
            },
          ]}
          onClick={({ key, domEvent }) => {
            setHideNavHints(domEvent.type !== "keydown");
            setNavHint(null);
            cancelAnimationFrame(navScrollFrame.current);
            navScrollFrame.current = requestAnimationFrame(() => {
              // Commit the closed tooltip first, and cancel an older smooth scroll.
              window.scrollTo({ top: window.scrollY, behavior: "instant" });
              if (key === "records")
                recordsRef.current?.scrollIntoView({ behavior: scrollBehavior });
              else window.scrollTo({ top: 0, behavior: scrollBehavior });
            });
          }}
        />
        <div className="dc-sidebar-bottom">
          <Tooltip
            title={`${online ? "本机连接正常" : "等待本机连接"} · v${meta?.version ?? "0.2.4"}`}
            placement="right"
          >
            <span
              className={`connection-dot ${online ? "connected" : ""}`}
              role="img"
              aria-label={online ? "本机连接正常" : "等待本机连接"}
            />
          </Tooltip>
        </div>
      </aside>
      <div className="dc-page" inert={!!detail || !!confirmation || manualOpen}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync" aria-live="polite">
              {refreshing
                ? "正在刷新…"
                : updatedAt
                  ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
                  : "等待连接"}
            </span>
            <Button type="primary" disabled={blocked || !online || !meta?.manual_entry || query.scope === "demo"}
              onClick={() => setManualOpen(true)}>补记录</Button>
            <Button
              icon={<Icon name="refresh" />}
              onClick={() => setRefresh((value) => value + 1)}
            >
              刷新连接
            </Button>
          </Space>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>
            <Tag variant="filled">记录保存在本机</Tag>
          </div>
          {query.scope !== "real" && (
            <Alert
              className="dc-notice"
              type="warning"
              showIcon
              title={
                query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"
              }
              description="示例仅用于查看效果，日常真实统计默认排除。"
            />
          )}
          {(error || actionError) && (
            <Alert
              className="dc-notice"
              type="error"
              showIcon
              title={
                data && error ? "刷新失败，当前显示上次结果" : "操作未完成"
              }
              description={actionError || error}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setActionError("");
                    setRefresh((value) => value + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          )}
          {meta?.active && (
            <Alert
              className="dc-notice dc-active"
              type="info"
              showIcon
              title={
                <Space wrap>
                  <WorkBadge
                    category={meta.active.category}
                    presentation={presentation}
                  />
                  <span>
                    {meta.active.is_paused
                      ? "当前任务已暂停"
                      : "当前任务正在计时"}
                  </span>
                </Space>
              }
              description="结束后可在这里补填工作量，进行中的任务不计入已结束报表。"
            />
          )}
          <Card
            className="dc-filters"
            styles={{ body: { padding: narrow ? 16 : 20 } }}
          >
            <div className="dc-period-bar">
              <Segmented
                aria-label="统计周期"
                value={filters.period}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                  { value: "custom", label: "自定义" },
                ]}
                onChange={(value) => selectPeriod(value as ReportPeriod)}
              />
              {query.period !== "custom" && (
                <div className="dc-period-nav">
                  <Button
                    aria-label="上一周期"
                    icon={<Icon name="left" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, -1)
                    }
                    onClick={() => movePeriod(-1)}
                  />
                  <strong>
                    {data ? reportRangeLabel(data.range) : "正在读取周期…"}
                  </strong>
                  <Button
                    aria-label="下一周期"
                    icon={<Icon name="right" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, 1)
                    }
                    onClick={() => movePeriod(1)}
                  />
                  <Button
                    onClick={() =>
                      applyQuery({ ...query, anchor_date: null, page: 1 })
                    }
                  >
                    {
                      {
                        day: "今天",
                        week: "本周",
                        month: "本月",
                        custom: "当前",
                      }[query.period]
                    }
                  </Button>
                </div>
              )}
            </div>
            <Form
              layout="vertical"
              className="dc-filter-form"
              onFinish={() => applyQuery({ ...filters, page: 1 })}
            >
              {filters.period === "custom" ? (
                <>
                  {dateField("开始日期", filters.start_date, (value) =>
                    setFilters({ ...filters, start_date: value }),
                  )}
                  {dateField("结束日期", filters.end_date, (value) =>
                    setFilters({ ...filters, end_date: value }),
                  )}
                </>
              ) : (
                dateField(
                  "基准日期",
                  filters.anchor_date ??
                    data?.range.anchor_date ??
                    localDate(new Date()),
                  (value) => setFilters({ ...filters, anchor_date: value }),
                  true,
                )
              )}
              <Form.Item label="类别">
                <Select
                  aria-label="筛选工作类别"
                  value={filters.category ?? ""}
                  options={[
                    { value: "", label: "全部类别" },
                    ...categoryOptions,
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, category: value || null })
                  }
                />
              </Form.Item>
              <Form.Item label="状态">
                <Select
                  aria-label="筛选记录状态"
                  value={filters.status}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "pending", label: "待补全" },
                    { value: "complete", label: "已确认" },
                    { value: "working", label: "进行中" },
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                />
              </Form.Item>
              <Form.Item label="数据范围">
                <Select
                  aria-label="数据范围"
                  value={filters.scope}
                  options={[
                    { value: "real", label: "真实数据" },
                    { value: "demo", label: "演示数据" },
                    { value: "all", label: "全部数据" },
                  ]}
                  onChange={(value) => setFilters({ ...filters, scope: value })}
                />
              </Form.Item>
              <div className="dc-filter-actions">
                {filters.period === "custom" && (
                  <Button
                    onClick={() =>
                      applyQuery({
                        ...filters,
                        start_date: null,
                        end_date: null,
                        page: 1,
                      })
                    }
                  >
                    全部日期
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Icon name="search" />}
                >
                  应用筛选
                </Button>
              </div>
            </Form>
            <div className="dc-filter-summary">
              {JSON.stringify(filters) !== JSON.stringify(query)
                ? "筛选条件已修改，点击应用筛选后更新结果。"
                : `当前已应用 · ${data ? reportRangeLabel(data.range) : "正在读取周期"} · ${query.category ? name(query.category) : "全部类别"} · ${({ all: "全部状态", pending: "待补全", complete: "已确认", working: "进行中" } as Record<string, string>)[query.status]}`}
            </div>
          </Card>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals ? (totals.duration_ms / 3600000).toFixed(1) : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已结束记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "进行中的任务单独保留",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((item) => (
              <Card key={item.label} className="dc-kpi">
                <div className="dc-kpi-label">
                  <span>{item.label}</span>
                  <Icon name={item.icon} />
                </div>
                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
                <p>{item.caption}</p>
              </Card>
            ))}
          </section>
          <Card
            className="dc-card dc-category-report"
            title={
              <Title
                title="分类工作量"
                description={`${data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计`}
              />
            }
            styles={{ body: { padding: 0 } }}
          >
            {loading ? (
              <div className="dc-loading" role="status">
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              </div>
            ) : data ? (
              <>
                {narrow ? (
                  <div className="dc-report-cards">
                    {data.categories.map((row) => (
                      <Card
                        size="small"
                        key={row.category}
                        title={
                          <WorkBadge
                            category={row.category}
                            presentation={presentation}
                          />
                        }
                      >
                        <dl>
                          <div>
                            <dt>已确认工作量</dt>
                            <dd className="dc-report-quantity">
                              <strong>
                                {row.complete > 0
                                  ? formatQuantity(row.quantity)
                                  : row.pending > 0
                                    ? "待补填"
                                    : "—"}
                              </strong>
                              <small>
                                {row.complete > 0
                                  ? `已确认 ${row.complete} 条`
                                  : row.pending > 0
                                    ? "尚未确认产出"
                                    : "暂无已结束记录"}
                              </small>
                            </dd>
                          </div>
                          <div>
                            <dt>有效工时</dt>
                            <dd className="dc-number">
                              {formatDuration(row.duration_ms / 1000)}
                            </dd>
                          </div>
                          <div>
                            <dt>已结束记录</dt>
                            <dd>{row.records} 条</dd>
                          </div>
                          <div>
                            <dt>待补填</dt>
                            <dd>
                              {pendingLink(row)}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<CategoryTotal>
                    className="dc-report-table"
                    rowKey="category"
                    columns={reportColumns}
                    dataSource={data.categories}
                    pagination={false}
                    scroll={{ x: 680 }}
                  />
                )}
                <p className="dc-report-note">
                  按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。
                </p>
                {data.totals.records === 0 && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="这个范围还没有已结束记录"
                  />
                )}
              </>
            ) : (
              <Empty
                description="暂无统计结果，请检查连接后重试"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          <Card
            className="dc-card dc-trend"
            title={
              <Title
                title="工作趋势"
                description={`${data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时`}
              />
            }
            styles={{ body: { padding: "12px 8px 8px" } }}
          >
            {data ? (
              <TrendChart trend={data.trend} range={data.range} />
            ) : loading ? (
              <div className="dc-loading">
                <Skeleton active />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无趋势数据"
              />
            )}
          </Card>
          <Collapse
            className="dc-auxiliary"
            items={[
              {
                key: "analysis",
                label: "辅助分析",
                children: data ? (
                  <div className="dc-auxiliary-grid">
                    <Card
                      className="dc-category"
                      title={
                        <Title
                          title="工作分布"
                        />
                      }
                      extra={
                        <Select
                          aria-label="工作分布指标"
                          value={categoryMetric}
                          options={[
                            { value: "duration", label: "工时（小时）" },
                            { value: "quantity", label: "工作量" },
                          ]}
                          onChange={setCategoryMetric}
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CategoryChart
                        categories={data.categories}
                        presentation={presentation}
                        metric={categoryMetric}
                        onCategory={(label) => {
                          const key = CATEGORIES.find(
                            (value) => name(value) === label,
                          );
                          if (key)
                            applyQuery({ ...query, category: key, page: 1 });
                        }}
                      />
                    </Card>
                    <Card className="dc-pie" title={<Title title="工时占比" />} styles={{ body: { padding: 8 } }}>
                      <DurationPieChart categories={data.categories} presentation={presentation}
                        onCategory={category => applyQuery({ ...query, category, page: 1 })} />
                    </Card>
                    <Card
                      className="dc-calendar"
                      title={
                        <Title
                          title="工作的节奏"
                          description="近90天有效工时"
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CalendarChart
                        calendar={data.calendar}
                        range={data.range}
                      />
                      <div className="dc-heat-legend" aria-label="工时由少到多">
                        少{" "}
                        {[
                          "#ebedf0",
                          "#9be9a8",
                          "#40c463",
                          "#30a14e",
                          "#216e39",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}{" "}
                        多
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分析数据"
                  />
                ),
              },
            ]}
          />
          <section
            className="dc-records"
            id="records"
            ref={recordsRef}
            tabIndex={-1}
          >
            <Card
              className="dc-card"
              title={
                <Title
                  title="工作明细"
                />
              }
              extra={<Tag>{data ? data.record_count : "—"} 条记录</Tag>}
              styles={{ body: { padding: 0 } }}
            >
              {loading ? (
                <div className="dc-loading">
                  <Skeleton active paragraph={{ rows: 5 }} />
                </div>
              ) : (
                <Table<Row>
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={data?.records ?? []}
                  pagination={false}
                  scroll={{ x: 1010 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          error ? "未能读取工作明细" : "当前筛选没有工作记录"
                        }
                      />
                    ),
                  }}
                />
              )}
              <footer className="dc-pagination">
                <span>每页 50 条 · 共 {data?.pages ?? "—"} 页</span>
                <Pagination
                  current={data?.page ?? query.page}
                  total={data?.record_count ?? 0}
                  pageSize={50}
                  showSizeChanger={false}
                  size={narrow ? "small" : undefined}
                  onChange={(page) => applyQuery({ ...query, page })}
                />
              </footer>
            </Card>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      <BottomSheet
        open={sheetOpen}
        blocked={blocked}
        covered={!!confirmation}
        title={
          <div className="dc-sheet-title">
            <span className="dc-eyebrow">
              WORK RECORD {detail ? `#${detail.record.id}` : ""}
            </span>
            <h2>
              {pendingQuery && !detail ? "选择待补填记录" : editing ? "填写工作量" : "工作详情"}{" "}
              {detail?.record.is_demo && <Tag color="gold">演示数据</Tag>}
            </h2>
          </div>
        }
        drawerRender={(node) => (
          <div inert={!!confirmation} style={{ display: "contents" }}>
            {node}
          </div>
        )}
        onClose={() => leave(() => setSheetOpen(false))}
        afterOpenChange={(open) => {
          if (open && editing)
            quantityInput.current?.focus({ preventScroll: true });
          if (!open) {
            setDetail(null);
            setEditing(false);
            setEditorError("");
            setPendingQuery(null);
            setPendingData(null); setPendingError(""); setPendingStatus("");
            restoreTrigger();
          }
        }}
        footer={
          <div className="dc-sheet-footer">
            <span className={dirty ? "dc-unsaved" : "dc-muted"}>
              {pendingQuery?.category ? `${name(pendingQuery.category)} · ` : ""}
              {dirty ? "有未保存修改" : "数据保存在本机"}
            </span>
            <Space wrap>
              <Button
                disabled={blocked}
                onClick={() => leave(() => setSheetOpen(false))}
              >
                关闭
              </Button>
              {pendingQuery && detail && <Button disabled={blocked} onClick={() => leave(returnToPending)}>
                返回列表
              </Button>}
              {editing ? (
                <Button
                  key="save"
                  type="primary"
                  form="dc-editor"
                  htmlType="submit"
                  aria-label="保存工作量"
                  aria-busy={busy}
                  loading={busy ? { delay: 120 } : false}
                  disabled={!online || !!confirmation}
                >
                  保存工作量
                </Button>
              ) : detail ? (
                <Button
                  key="edit"
                  type="primary"
                  aria-label="编辑工作量"
                  disabled={
                    !online ||
                    blocked ||
                    detailStale ||
                    detail?.record.status !== "FINISHED"
                  }
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </Button>
              ) : null}
            </Space>
          </div>
        }
      >
        {pendingQuery && !detail && <section className="dc-pending-list" aria-label="待补填记录列表">
          <p>{name(pendingQuery.category ?? "")} · {pendingData ? reportRangeLabel(pendingData.range) : "当前已应用周期"} · 请选择具体记录</p>
          {pendingStatus && <Alert type={pendingStatus.startsWith("工作量已保存") ? "success" : "info"} title={pendingStatus} role="status" />}
          {pendingError && <Alert type="error" title={pendingError} showIcon />}
          <Button className="dc-pending-refresh" disabled={blocked || !online} loading={busy} onClick={() => { void refreshPending(pendingQuery); }}>刷新待补填列表</Button>
          {busy && !pendingData ? <Skeleton active /> : pendingData && <>
            <Table<Row> rowKey="id" pagination={false} dataSource={pendingData.records} scroll={{ x: 550 }}
              locale={{ emptyText: "当前分类在这个范围已没有待补填记录。" }} columns={[
                { title: "记录", key: "record", render: (_, row) => <><strong>#{row.id}</strong><div>{formatTime(row.start_time)}</div><div>至 {row.end_time ? formatTime(row.end_time) : "—"}</div></> },
                { title: "有效工时", key: "duration", render: (_, row) => formatDuration(row.duration_ms / 1000) },
                { title: "备注", dataIndex: "remark", render: (value: string) => value || "无备注" },
                { title: "操作", key: "action", render: (_, row) => <Button data-pending-id={row.id} aria-label={`补填记录${row.id}`} disabled={blocked || !online || !!pendingError} onClick={() => { void selectPending(row); }}>补填</Button> },
              ]} />
            <Pagination current={pendingData.page} total={pendingData.record_count} pageSize={50} showSizeChanger={false} disabled={blocked || !online}
              onChange={page => { void refreshPending({ ...pendingQuery, page }); }} />
          </>}
        </section>}
        {detail && (
          <div className="dc-detail-content">
            <div className="dc-record-summary">
              <WorkBadge
                category={detail.record.category}
                presentation={presentation}
              />
              <div>
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <small>有效工时</small>
              </div>
              <RecordStatus row={detail.record} />
            </div>
            <Descriptions
              className="dc-detail-times"
              size="small"
              column={narrow ? 1 : 2}
              items={[
                {
                  key: "start",
                  label: "开始",
                  children: formatTime(detail.record.start_time),
                },
                {
                  key: "end",
                  label: "结束",
                  children: detail.record.end_time
                    ? formatTime(detail.record.end_time)
                    : "尚未结束",
                },
              ]}
            />
            {editing ? (
              <Form
                id="dc-editor"
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category">
                  <Select
                    id="dc-category"
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) =>
                      setFields((previous) => ({
                        ...previous,
                        category: value,
                      }))
                    }
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  extra="0 表示已确认无产出；支持小数和科学计数，最大 10 亿。"
                >
                  <Input
                    id="dc-quantity"
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark">
                  <Input.TextArea
                    id="dc-remark"
                    maxLength={4000}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        remark: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <p className="dc-muted">
                  修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                </p>
              </Form>
            ) : (
              <div>
                <div className="dc-detail-quantity">
                  <span>已确认工作量</span>
                  <strong>
                    {detail.record.settlement_status === "COMPLETE"
                      ? formatQuantity(detail.record.quantity)
                      : detail.record.status === "FINISHED"
                        ? "待补填"
                        : "进行中"}
                  </strong>
                </div>
                <div className="dc-detail-remark">
                  {detail.record.remark || "未填写备注。"}
                </div>
              </div>
            )}
            {editorError && (
              <Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              />
            )}
            <Collapse
              className="dc-audit"
              items={[
                {
                  key: "segments",
                  label: `计时区间（${detail.segments.length}）`,
                  children: detail.segments.length ? (
                    detail.segments.map((segment) => (
                      <div className="dc-segment" key={segment.id}>
                        <span>
                          {formatTime(segment.start_time)}
                          <br />
                          {segment.end_time
                            ? formatTime(segment.end_time)
                            : "计时中"}
                        </span>
                        <strong className="dc-number">
                          {formatDuration(segment.duration_ms / 1000)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">
                      {detail.record.source === "MANUAL_ENTRY" && !detail.record.is_demo
                        ? "人工补录的有效工时，没有自动计时区间。"
                        : "旧记录仅保留累计工时，没有可展示的区间。"}
                    </p>
                  ),
                },
                {
                  key: "revisions",
                  label: `修正记录（${detail.revisions.length}）`,
                  children: detail.revisions.length ? (
                    detail.revisions.map((revision) => (
                      <div className="dc-revision" key={revision.revision}>
                        <strong>
                          第 {revision.revision} 次 ·{" "}
                          {formatTime(revision.changed_at)}
                        </strong>
                        <p>
                          {name(revision.before?.category)} →{" "}
                          {name(revision.after?.category)} · 数量{" "}
                          {formatQuantity(revision.before?.quantity)} →{" "}
                          {formatQuantity(revision.after?.quantity)}
                        </p>
                        <p>
                          备注：{revision.before?.remark || "未填"} →{" "}
                          {revision.after?.remark || "未填"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">尚无修正。</p>
                  ),
                },
              ]}
            />
          </div>
        )}
      </BottomSheet>
      {manualOpen && <ManualEntryModal online={online} onClose={() => setManualOpen(false)} onSaved={saved => {
        setManualOpen(false);
        applyQuery({ ...query, period: "day", anchor_date: localDate(new Date(saved.record.start_time)),
          start_date: null, end_date: null, category: null, scope: "real", status: "all", page: 1 });
        setRefresh(value => value + 1);
        void message.success("补记录已保存，可在工作明细中查看。");
      }} />}
      <Modal
        open={confirmOpen}
        centered
        width={460}
        zIndex={1200}
        mask={{ closable: false }}
        keyboard={!busy}
        closable={false}
        destroyOnHidden
        title={
          confirmation === "delete" ? "删除这条记录？" : "保留未保存的修改？"
        }
        onCancel={closeConfirmation}
        afterOpenChange={(open) => {
          if (open) safeConfirmAction.current?.focus({ preventScroll: true });
        }}
        afterClose={() => {
          setConfirmation(null);
          setDeleting(null);
          const action = afterConfirm.current;
          afterConfirm.current = null;
          action?.();
        }}
        footer={
          confirmation === "delete" ? (
            <Space>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                取消
              </Button>
              <Button
                danger
                type="primary"
                aria-label="确认删除"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void remove();
                }}
              >
                确认删除
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button
                type="primary"
                aria-label="保存并继续"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      afterConfirm.current = next.current;
                      next.current = null;
                      setConfirmOpen(false);
                    }
                  });
                }}
              >
                保存并继续
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  afterConfirm.current = next.current;
                  next.current = null;
                  setConfirmOpen(false);
                }}
              >
                放弃修改
              </Button>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                继续编辑
              </Button>
            </Space>
          )
        }
      >
        {confirmation === "delete" ? (
          <>
            <p className="dc-confirm-description">
              {deleting &&
                `${name(deleting.category)} · ${formatTime(deleting.start_time)}${deleting.is_demo ? " · 演示数据" : ""}`}
            </p>
            <p className="dc-confirm-description">
              删除后不可撤销，计时区间和修正记录也会一同删除。
            </p>
          </>
        ) : (
          <p className="dc-confirm-description">
            保存成功后再离开；保存失败会保留输入。
          </p>
        )}
        {editorError && (
          <Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          />
        )}
      </Modal>
    </div>
  );
}
export default function Dashboard() {
  return (
    <UiProvider>
      <DashboardContent />
    </UiProvider>
  );
}
```

## E:\WorkMemo\src\Dashboard.css

```css
/* Web-only layout. Ant Design owns control appearance, focus, motion and overlays. */
/* Keep specificity below the library's `html body` scroll locker. */
body:where(:has(.data-center)) {
  overflow: auto;
  background: #edf2ee;
}
/* Legacy desktop buttons use width:100%; web controls opt out without a global reset. */
.wm-ui-root .wm-btn:not(.wm-btn-icon-only),
.dc-sheet-root .wm-btn:not(.wm-btn-icon-only),
.wm-modal .wm-btn:not(.wm-btn-icon-only) {
  width: auto;
}
.dc-manual-entry .wm-picker-clear {
  width: auto;
}
.dc-manual-entry-picker button {
  width: auto;
}
@media (max-width: 640px) {
  .dc-manual-entry-picker .wm-picker-datetime-panel {
    flex-direction: column;
  }
  .dc-manual-entry-picker .wm-picker-panel-container {
    max-height: calc(100dvh - 24px);
    overflow-y: auto;
  }
  .dc-manual-entry-picker.wm-picker-dropdown .wm-picker-time-panel .wm-picker-content {
    height: 112px;
  }
}
.data-center {
  min-height: 100vh;
  color: #243c33;
  background: #edf2ee;
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
}
.data-center *,
.dc-sheet-root * {
  box-sizing: border-box;
}
.data-center h1,
.data-center h2,
.dc-sheet-title h2 {
  margin: 0;
  font-weight: 650;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 16px;
}
.data-center p {
  margin: 0;
}
.data-center .icon,
.dc-sheet-root .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 17px;
}
.data-center .work-badge,
.dc-sheet-root .work-badge {
  min-width: 0;
  gap: 9px;
  font-weight: 550;
}
.data-center .work-badge > span:last-child,
.dc-sheet-root .work-badge > span:last-child {
  white-space: normal;
  overflow-wrap: anywhere;
}
.data-center .work-symbol,
.dc-sheet-root .work-symbol {
  width: 30px;
  height: 30px;
  border-radius: 9px;
}
.data-center .work-symbol .icon,
.dc-sheet-root .work-symbol .icon {
  font-size: 16px;
}
.dc-sidebar {
  width: 68px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  background: rgb(255 255 255 / 60%);
  border-right: 1px solid #e3ebe5;
}
.dc-brand {
  display: inline-flex;
  margin-bottom: 26px;
}
.dc-brand img {
  width: 36px;
  height: 36px;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding-top: 20px;
}
.connection-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b48350;
  box-shadow: 0 0 0 4px #b4835010;
}
.connection-dot.connected {
  background: #37936d;
  box-shadow: 0 0 0 4px #37936d10;
}
.dc-page {
  margin-left: 68px;
}
.dc-topbar {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 28px;
  background: rgb(255 255 255 / 65%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e3ebe5;
}
.dc-breadcrumb {
  font-size: 12px;
  color: #64796d;
  white-space: nowrap;
}
.dc-breadcrumb > span {
  color: #89998f;
  margin-left: 12px;
}
.dc-sync {
  display: inline-block;
  min-width: 118px;
  color: #89998f;
  font-size: 11px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dc-main {
  max-width: 1380px;
  margin: auto;
  padding: 28px 28px 0;
}
.dc-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.dc-eyebrow {
  display: block;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #86998d;
  margin-bottom: 6px;
  font-weight: 600;
}
.dc-heading h1 {
  font-size: 28px;
  line-height: 1.3;
  margin-bottom: 7px;
}
.dc-heading p {
  font-size: 13px;
  color: #718579;
}
.dc-notice {
  margin-block: 14px;
}
.dc-period-bar,
.dc-period-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-period-nav {
  justify-content: flex-start;
}
.dc-period-nav strong {
  min-width: 154px;
  text-align: center;
  color: #355b46;
  font-size: 14px;
  font-weight: 550;
}
.dc-filter-form {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.dc-filter-form > .wm-form-item {
  flex: 1 1 136px;
  min-width: 120px;
  margin-bottom: 0;
}
.dc-filter-form .wm-picker,
.dc-filter-form .wm-select {
  width: 100%;
}
.dc-filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filter-summary {
  border-top: 1px solid #edf2ee;
  margin-top: 16px;
  padding-top: 12px;
  min-height: 30px;
  font-size: 11px;
  color: #7b8e81;
  overflow-wrap: anywhere;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-block: 18px;
}
.dc-kpi-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #718579;
}
.dc-kpi-label .icon {
  color: #87a58f;
}
.dc-kpi strong {
  display: block;
  font-size: 30px;
  font-weight: 650;
  line-height: 1.6;
  color: #284d3a;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-kpi strong small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 8px;
  color: #7b8e81;
}
.dc-kpi p {
  font-size: 11px;
  color: #7b8e81;
}
.dc-card {
  min-width: 0;
  margin-bottom: 18px;
}
.dc-card-title {
  padding-block: 16px;
  white-space: normal;
}
.dc-card-title p {
  margin-top: 4px;
  font-size: 11px;
  color: #7b8e81;
  font-weight: 400;
}
.dc-report-quantity strong {
  display: block;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.4;
  color: #284d3a;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-report-quantity small {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: #7b8e81;
}
.dc-number {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dc-date {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dc-muted {
  color: #7b8e81;
  font-size: 12px;
}
.dc-report-note {
  padding: 14px 24px;
  color: #7b8e81;
  font-size: 11px;
}
.dc-report-cards {
  display: grid;
  gap: 12px;
  padding: 12px;
}
.dc-report-cards dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}
.dc-report-cards dt {
  font-size: 11px;
  color: #7b8e81;
  margin-bottom: 6px;
}
.dc-report-cards dd {
  margin: 0;
}
.dc-chart {
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.dc-auxiliary {
  margin-bottom: 18px;
}
.dc-auxiliary small {
  margin-left: 10px;
}
.dc-auxiliary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.dc-auxiliary-grid > * {
  min-width: 0;
}
.dc-category .dc-chart {
  height: 180px;
}
.dc-calendar .dc-chart {
  height: 158px;
}
.dc-heat-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  font-size: 10px;
  color: #7b8e81;
}
.dc-heat-legend i {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid #1f23281a;
}
.dc-records {
  scroll-margin-top: 80px;
  outline: none;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  flex-wrap: wrap;
}
.dc-pagination > span {
  color: #7b8e81;
  font-size: 11px;
}
.dc-page-footer {
  text-align: center;
  color: #899c8f;
  font-size: 11px;
  padding: 12px 0 28px;
}
.dc-loading {
  padding: 24px;
}
.dc-sheet-title h2 {
  font-size: 20px;
  color: #243c33;
}
.dc-sheet-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dc-unsaved {
  font-size: 12px;
  color: #9c752f;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px;
  background: #f4f8f5;
  border: 1px solid #e6eee8;
  border-radius: 12px;
}
.dc-record-summary > div {
  margin-left: auto;
  text-align: right;
}
.dc-record-summary strong {
  display: block;
  font:
    600 24px/1.4 ui-monospace,
    monospace;
  color: #284d3a;
}
.dc-record-summary small {
  display: block;
  color: #7b8e81;
  font-size: 11px;
}
.dc-detail-times {
  margin-block: 22px;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #7b8e81;
}
.dc-detail-quantity strong {
  color: #284d3a;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}
.dc-detail-remark {
  padding: 16px;
  min-height: 76px;
  background: #f7faf8;
  border-radius: 10px;
  color: #526c5d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
}
.dc-audit {
  margin-top: 22px;
}
.dc-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
}
.dc-revision {
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
  overflow-wrap: anywhere;
}
.dc-revision p {
  margin-block: 8px 0;
  white-space: pre-wrap;
}
.dc-confirm-description {
  color: #65796f;
  line-height: 1.9;
  margin-block: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 1000px) {
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 20px;
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-breadcrumb > span,
  .dc-sync {
    display: none;
  }
  .dc-main {
    padding: 20px 16px 0;
  }
  .dc-topbar {
    padding-inline: 16px;
  }
}
@media (max-width: 640px) {
  .dc-main {
    padding-inline: 12px;
  }
  .dc-heading {
    align-items: flex-start;
  }
  .dc-heading h1 {
    font-size: 24px;
  }
  .dc-heading > .wm-tag {
    display: none;
  }
  .dc-period-bar {
    justify-content: center;
  }
  .dc-period-nav {
    justify-content: center;
    gap: 6px;
  }
  .dc-period-nav strong {
    min-width: 138px;
    font-size: 12px;
  }
  .dc-filter-form {
    gap: 12px;
  }
  .dc-filter-form > .wm-form-item {
    flex-basis: calc(50% - 6px);
    min-width: 0;
  }
  .dc-filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .dc-kpis {
    gap: 8px;
  }
  .dc-kpi .wm-card-body {
    padding: 12px 10px;
  }
  .dc-kpi strong {
    font-size: 23px;
  }
  .dc-kpi strong small {
    display: block;
    margin: 0;
    line-height: 1.4;
  }
  .dc-kpi-label {
    font-size: 11px;
  }
  .dc-kpi-label .icon {
    display: none;
  }
  .dc-kpi p {
    font-size: 10px;
    margin-top: 8px;
  }
  .dc-auxiliary small {
    display: block;
    margin-left: 0;
  }
  .dc-pagination {
    padding: 16px;
  }
  .dc-sheet-footer {
    flex-wrap: wrap;
  }
  .dc-sheet-footer > span {
    font-size: 11px;
  }
  .dc-report-note {
    padding-inline: 16px;
  }
}

/* Local browser translucency: the page canvas stays a normal browser surface. */
.data-center { background: linear-gradient(145deg, #f3f2eb, #e7efea 52%, #edf0f5); }
.data-center .wm-card { backdrop-filter: blur(12px); }
.dc-pending-list { display: grid; gap: 16px; min-width: 0; }
.dc-pending-list > p { color: #536b5b; }
.dc-pending-list .wm-table-cell { overflow-wrap: anywhere; }
.dc-pending-refresh { justify-self: start; }

.dc-pie .dc-chart { height:190px; }
.dc-pie-legend { list-style:none; margin:0; padding:0 4px 4px; display:grid; gap:2px; }
.dc-pie-legend .wm-btn { display:flex; align-items:center; width:100%; height:auto; min-height:30px; padding:4px 7px; gap:7px; }
.dc-pie-legend i { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.dc-pie-name { flex:1; min-width:0; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dc-pie-value { flex-shrink:0; font-size:12px; font-variant-numeric:tabular-nums; }
@media (min-width:760px) and (max-width:1199px) {
  .dc-auxiliary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .dc-auxiliary-grid .dc-calendar { grid-column:1/-1; }
}
@media (max-width:759px) { .dc-auxiliary-grid { grid-template-columns:minmax(0,1fr); } }
```

## E:\WorkMemo\src\dashboard\api.ts

```typescript
import type { WorkRecord } from "../types";
import type { CategoryNames } from "../categoryNames";
import type { Presentation } from "../desktopPreferences";
import type { ReportPeriod, ReportRange } from "../reportPeriod";

export type Row = WorkRecord & { is_demo: boolean; demo_batch: string | null };
export type Query = {
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  scope: "real" | "demo" | "all";
  status: string;
  page: number;
};
export type CategoryTotal = {
  category: string;
  duration_ms: number;
  quantity: number;
  records: number;
  complete: number;
  pending: number;
};
export type Data = {
  range: ReportRange;
  totals: {
    duration_ms: number;
    quantity: number;
    records: number;
    pending: number;
  };
  trend: {
    date: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  monthly: boolean;
  categories: CategoryTotal[];
  calendar: [string, number][];
  records: Row[];
  record_count: number;
  page: number;
  pages: number;
  scope: string;
};
export type Detail = {
  record: Row;
  segments: {
    id: number;
    start_time: number;
    end_time: number | null;
    duration_ms: number;
    state: string;
  }[];
  revisions: {
    revision: number;
    changed_at: number;
    before: WorkRecord;
    after: WorkRecord;
  }[];
};
export type Meta = {
  version: string;
  manual_entry?: boolean;
  category_names: CategoryNames;
  presentation: Presentation;
  active: WorkRecord | null;
};
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
const entry = new URLSearchParams(location.hash.slice(1));
const incoming = entry.get("token");
if (incoming) {
  sessionStorage.setItem("workmemo-token", incoming);
  history.replaceState(null, "", location.pathname + location.search);
}
const sessionToken = incoming ?? sessionStorage.getItem("workmemo-token") ?? "";
export function initialQuery(): Query {
  const pending = entry.get("view") === "pending";
  return {
    period: pending ? "custom" : "day",
    anchor_date: null,
    start_date: null,
    end_date: null,
    category: null,
    scope: entry.get("scope") === "demo" ? "demo" : "real",
    status: pending ? "pending" : "all",
    page: 1,
  };
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  if (!sessionToken)
    throw new ApiError("请从 WorkMemo 打开数据中心，以建立本机连接。", 403);
  try {
    const response = await fetch(`/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(8000),
    });
    let result: T & { error?: string };
    try {
      result = await response.json();
    } catch {
      throw new ApiError(
        "连接授权已失效，请从 WorkMemo 重新打开数据中心。",
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiError(result.error ?? "操作未完成。", response.status);
    return result;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "与 WorkMemo 的连接已中断。请保持软件在后台运行，再刷新连接。",
    );
  }
}
```

## E:\WorkMemo\src\dashboard\ManualEntryModal.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { Alert, App, Button, DatePicker, Form, Input, Modal, Select, Space, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { CATEGORIES, formatDuration } from "../types";
import { useCategoryNames } from "../categoryNames";
import { api, type Detail } from "./api";
import { validateManualEntry } from "./manualEntry";

dayjs.extend(utc);

export function ManualEntryModal({ online, onClose, onSaved }: {
  online: boolean; onClose: () => void; onSaved: (value: Detail) => void;
}) {
  const { modal } = App.useApp();
  const { name } = useCategoryNames();
  const [requestId] = useState(() => crypto.randomUUID());
  const [initialEnd] = useState(() => dayjs().utcOffset(8).startOf("minute"));
  const [category, setCategory] = useState("开发");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [rest, setRest] = useState("");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>([initialEnd.subtract(1, "hour"), initialEnd]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const saving = useRef(false);
  const confirming = useRef(false);
  // Interpret the displayed calendar components in Beijing, even on computers in other zones.
  const start = range?.[0]?.utcOffset(8, true).valueOf() ?? NaN;
  const end = range?.[1]?.utcOffset(8, true).valueOf() ?? NaN;
  const dirty = category !== "开发" || quantity !== "" || remark !== "" || rest !== ""
    || start !== initialEnd.subtract(1, "hour").valueOf() || end !== initialEnd.valueOf();
  const span = end - start;
  const restMs = Number(rest || "0") * 60_000;
  const preview = Number.isFinite(span) && span > 0 && Number.isFinite(restMs) && restMs >= 0 && restMs <= span
    ? formatDuration(Math.round(span - restMs) / 1000) : "—";
  useEffect(() => { setError(""); }, [category, quantity, remark, rest, start, end]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault(); void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty || saving.current) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => { window.removeEventListener("keydown", keys); window.removeEventListener("beforeunload", unload); };
  });
  function close() {
    if (saving.current || confirming.current) return;
    if (!dirty) { onClose(); return; }
    confirming.current = true;
    modal.confirm({
      title: "放弃这次补记录？",
      content: "未确认保存的输入将被放弃。若刚才连接中断，请先原样重试或刷新明细核对。",
      okText: "放弃补录", cancelText: "继续填写", autoFocusButton: "cancel",
      onOk: onClose,
      afterClose: () => { confirming.current = false; },
    });
  }
  async function save() {
    if (!online || saving.current || confirming.current) return;
    const result = validateManualEntry(requestId, category, quantity, remark, start, end, rest);
    if (!result.ok) { setError(result.error); return; }
    saving.current = true; setBusy(true); setError("");
    try {
      const saved = await api<Detail>("manual-entry", result.input);
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "补记录未完成，请保留输入后重试。");
    } finally { saving.current = false; setBusy(false); }
  }
  return <Modal open title="补记录" onCancel={close} centered width={560} className="dc-manual-entry"
    mask={{ closable: false }} keyboard={!busy} closable={!busy}
    styles={{ body: { maxHeight: "calc(100dvh - 220px)", overflowY: "auto" } }}
    footer={<Space wrap>
      <Button disabled={busy} onClick={close}>取消</Button>
      <Button type="primary" aria-label="保存补录" aria-busy={busy} loading={busy} disabled={!online || busy} onClick={() => void save()}>保存补录</Button>
    </Space>}>
    <p>补录已完成的工作，保存后计入统计，并标记为「人工补录」。</p>
    <Form layout="vertical" disabled={busy} onFinish={() => void save()}>
      <Form.Item label="工作类别" required>
        <Select aria-label="补录类别" value={category} onChange={setCategory}
          options={CATEGORIES.map(value => ({ value, label: name(value) }))} />
      </Form.Item>
      <Form.Item label="工作量" required extra="0 表示无产出。">
        <Input aria-label="补录工作量" autoFocus inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)} />
      </Form.Item>
      <Form.Item label="起止时间（北京时间）" required>
        <Space wrap style={{ width: "100%" }}>
          <DatePicker aria-label="补录开始时间" value={range?.[0]} onChange={value => setRange([value, range?.[1] ?? null])}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="开始时间" minDate={dayjs("1970-01-01")} />
          <span>至</span>
          <DatePicker aria-label="补录结束时间" value={range?.[1]} onChange={value => setRange([range?.[0] ?? null, value])}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="结束时间" minDate={dayjs("1970-01-01")} />
        </Space>
      </Form.Item>
      <Form.Item label="扣除休息（分钟）" extra="不填按 0 分钟计算，可填写小数。">
        <Input aria-label="扣除休息分钟数" inputMode="decimal" value={rest} onChange={e => setRest(e.target.value)} />
      </Form.Item>
      <Form.Item label="备注">
        <Input.TextArea aria-label="补录备注" value={remark} onChange={e => setRemark(e.target.value)} rows={3} />
      </Form.Item>
      <Typography.Paragraph>有效工时：<strong>{preview}</strong></Typography.Paragraph>
      {!online && <Alert type="warning" showIcon title="本机连接已中断，请恢复连接后保存。" />}
      {error && <Alert type="error" showIcon title={error} />}
    </Form>
  </Modal>;
}
```

## E:\WorkMemo\src\dashboard\manualEntry.ts

```typescript
import { validateWorkInput } from "../workInput.ts";

export type ManualEntry = {
  request_id: string;
  category: string;
  quantity: number;
  remark: string;
  start_time: number;
  end_time: number;
  duration_ms: number;
};
export function validateManualEntry(
  requestId: string, category: string, quantity: string, remark: string,
  start: number, end: number, restMinutes: string, now = Date.now(),
): { ok: true; input: ManualEntry } | { ok: false; error: string } {
  const work = validateWorkInput(category, quantity, remark, true);
  if (!work.ok) return { ok: false, error: Object.values(work.errors)[0]! };
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end <= start)
    return { ok: false, error: "请选择有效的起止时间，结束时间须晚于开始时间。" };
  if (end > now) return { ok: false, error: "不能补录未来的工作时间。" };
  const text = restMinutes.trim();
  const rest = text === "" ? 0 : Number(text);
  if ((text !== "" && !/^\d+(?:\.\d+)?$/.test(text)) || !Number.isFinite(rest)
    || rest < 0 || rest * 60_000 > end - start)
    return { ok: false, error: "休息分钟数须大于或等于 0，且不能超过起止时间跨度。" };
  return { ok: true, input: {
    request_id: requestId, category: work.input.category, quantity: work.input.quantity!,
    remark: work.input.remark, start_time: start, end_time: end,
    duration_ms: Math.round(end - start - rest * 60_000),
  } };
}
```

## E:\WorkMemo\tests\manual-entry.test.mjs

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManualEntry } from '../src/dashboard/manualEntry.ts';
const validate = (overrides = {}) => {
  const value = { id: 'valid-request-0001', category: '开发', quantity: '2.5', remark: '  工作  ', start: 1000, end: 361000, rest: '1.5', now: 400000, ...overrides };
  return validateManualEntry(value.id, value.category, value.quantity, value.remark, value.start, value.end, value.rest, value.now);
};
test('补录按真实时间跨度扣除休息，保留小数工作量和去空白备注', () => {
  assert.deepEqual(validate(), { ok: true, input: { request_id: 'valid-request-0001', category: '开发', quantity: 2.5, remark: '工作', start_time: 1000, end_time: 361000, duration_ms: 270000 } });
  assert.equal(validate({ rest: '' }).input.duration_ms, 360000);
  assert.equal(validate({ quantity: '0', rest: '6' }).input.duration_ms, 0);
});
test('补录拒绝缺失数量、无效时间、未来时间和超长休息', () => {
  for (const input of [{ quantity: '' }, { quantity: '-1' }, { quantity: '1e-9999' }, { category: '' }, { start: NaN }, { end: NaN }, { start: -1 }, { start: 0.5 }, { end: 999 }, { end: 400001 }, { rest: '-1' }, { rest: '7' }, { rest: 'Infinity' }, { rest: '0x1' }, { rest: '1e-3' }, { remark: '😀'.repeat(2001) }]) {
    assert.equal(validate(input).ok, false, JSON.stringify(input));
  }
  assert.equal(validate({ remark: '😀'.repeat(2000) }).ok, true);
});
```

## E:\WorkMemo\scripts\dashboard-fixture.mjs

```javascript
// HTTP fixtures for browser verification only. Never connects to a WorkMemo database.
export const keys = ["评测", "质检", "开发", "文档"];
export const fixtureDate = "2026-10-29";
export async function dashboardFixture(page) {
  const names = {
    revision: 1,
    names: { 评测: "评测", 质检: "质检", 开发: "代码开发", 文档: "文档" },
  };
  const presentation = {
    version: 1,
    revision: 0,
    background: null,
    categories: Object.fromEntries(
      keys.map((key, i) => [
        key,
        {
          icon: ["checkSquare", "safety", "code", "note"][i],
          color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
        },
      ]),
    ),
  };
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "评测" : i === 5 ? "质检" : "开发",
    quantity: i < 4 ? [30, 40, 50, 8.5][i] : i === 5 ? 0 : null,
    remark: "隔离测试记录 · 不写入用户数据库",
    start_time: Date.parse(`${fixtureDate}T09:00:00+08:00`) + i * 1800000,
    end_time: Date.parse(`${fixtureDate}T10:00:00+08:00`) + i * 1800000,
    duration_ms: i < 5 ? 1920000 : i === 5 ? 1200000 : 2250000,
    duration_seconds: i < 5 ? 1920 : i === 5 ? 1200 : 2250,
    status: "FINISHED",
    is_paused: true,
    recovery_pending: false,
    settlement_status: i < 4 || i === 5 ? "COMPLETE" : "PENDING",
    source: "MANUAL_START",
    pause_reason: null,
    confirmed_end_time: null,
    last_input_time: null,
    end_reason: "MANUAL",
    legacy_duration_ms: 0,
    revision: 0,
    control_mode: "MANUAL",
    is_demo: false,
    demo_batch: null,
  }));
  const active = {
    ...records[0],
    id: 99,
    category: "开发",
    quantity: null,
    status: "WORKING",
    settlement_status: "IN_PROGRESS",
    end_time: null,
    is_paused: false,
    duration_ms: 25000,
    duration_seconds: 25,
  };
  const state = {
    records,
    active,
    names,
    presentation,
    saveFailure: null,
    queryFailure: false,
    detailFailure: false,
    queryDelay: 0,
    delayFor: null,
    saveDelay: 0,
    saves: 0,
    queries: 0,
    details: 0,
    deletes: 0,
    currentQuery: null,
    requests: [],
    revisions: [],
    segments: [],
    many: false,
    manualCapability: true,
    manualSaves: 0,
    manualFailure: false,
    manualDelay: 0,
    manualLoseResponse: false,
    manualEntries: new Map(),
  };
  const iso = (date) => date.toISOString().slice(0, 10);
  function range(query) {
    const anchor = query.anchor_date ?? fixtureDate;
    const date = new Date(anchor + "T12:00:00Z");
    let start = query.start_date,
      end = query.end_date;
    if (query.period === "day") start = end = anchor;
    if (query.period === "week") {
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      start = iso(date);
      date.setUTCDate(date.getUTCDate() + 6);
      end = iso(date);
    }
    if (query.period === "month") {
      date.setUTCDate(1);
      start = iso(date);
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      end = iso(date);
    }
    return {
      period: query.period,
      anchor_date: query.period === "custom" ? null : anchor,
      start_date: start,
      end_date: end,
      trend_unit: query.period === "day" ? "hour" : "day",
    };
  }
  function aggregate(rows) {
    return {
      duration_ms: rows.reduce((n, row) => n + row.duration_ms, 0),
      quantity: rows
        .filter((row) => row.settlement_status === "COMPLETE")
        .reduce((n, row) => n + row.quantity, 0),
      records: rows.length,
      pending: rows.filter((row) => row.settlement_status === "PENDING").length,
      complete: rows.filter((row) => row.settlement_status === "COMPLETE")
        .length,
    };
  }
  function data(query) {
    const resolved = range(query);
    const extras = state.many
      ? Array.from({ length: 52 }, (_, i) => ({
          ...records[0],
          id: 200 + i,
          quantity: 1,
        }))
      : [];
    const demo = {
      ...records[0],
      id: 500,
      is_demo: true,
      demo_batch: "isolated-browser-fixture",
      quantity: 999,
    };
    const filtered = [
      ...state.records,
      ...extras,
      ...(state.active ? [state.active] : []),
      demo,
    ].filter((row) => {
      const date = iso(new Date(row.start_time + 8 * 3600000));
      return (
        (query.scope === "all" || row.is_demo === (query.scope === "demo")) &&
        (!resolved.start_date || date >= resolved.start_date) &&
        (!resolved.end_date || date <= resolved.end_date) &&
        (!query.category || row.category === query.category) &&
        (query.status === "all" ||
          (query.status === "working" && row.status !== "FINISHED") ||
          (query.status === "pending" && row.settlement_status === "PENDING") ||
          (query.status === "complete" && row.settlement_status === "COMPLETE"))
      );
    });
    const ended = filtered.filter((row) => row.status === "FINISHED");
    const categories = keys
      .filter((key) => !query.category || key === query.category)
      .map((category) => ({
        category,
        ...aggregate(ended.filter((row) => row.category === category)),
      }));
    const buckets =
      query.period === "day"
        ? Array.from(
            { length: 24 },
            (_, hour) => String(hour).padStart(2, "0") + ":00",
          )
        : query.period === "custom"
          ? [fixtureDate]
          : Array.from({ length: 32 }, (_, i) => {
              const date = new Date(resolved.start_date + "T12:00:00Z");
              date.setUTCDate(date.getUTCDate() + i);
              return iso(date);
            }).filter((date) => date <= resolved.end_date);
    const trend = buckets.map((date) => ({
      date,
      ...aggregate(
        ended.filter((row) =>
          query.period === "day"
            ? new Date(row.start_time + 8 * 3600000).getUTCHours() ===
              Number(date.slice(0, 2))
            : iso(new Date(row.start_time + 8 * 3600000)) === date,
        ),
      ),
    }));
    const pages = Math.max(1, Math.ceil(filtered.length / 50)),
      current = Math.min(query.page, pages);
    return {
      range: resolved,
      totals: aggregate(ended),
      categories,
      trend,
      monthly: false,
      calendar: ended.length
        ? [[fixtureDate, aggregate(ended).duration_ms]]
        : [],
      records: filtered.slice((current - 1) * 50, current * 50),
      record_count: filtered.length,
      page: current,
      pages,
      scope: query.scope,
    };
  }
  state.data = data;
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split("/").at(-1);
    const body = route.request().postData()
      ? route.request().postDataJSON()
      : null;
    state.requests.push({ endpoint, body });
    if (endpoint === "meta")
      return route.fulfill({
        json: {
          version: "0.2.5 · 隔离验收",
          manual_entry: state.manualCapability,
          category_names: names,
          presentation,
          active: state.active,
        },
      });
    if (endpoint === "query") {
      state.queries++;
      state.currentQuery = body;
      const result = data(body),
        failure = state.queryFailure;
      const delay = state.delayFor ? state.delayFor(body) : state.queryDelay;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return failure
        ? route.fulfill({ status: 500, json: { error: "隔离统计读取失败" } })
        : route.fulfill({ json: result });
    }
    if (endpoint === "detail") {
      state.details++;
      if (state.detailFailure)
        return route.fulfill({
          status: 500,
          json: { error: "隔离详情读取失败" },
        });
      const record = [
        ...state.records,
        ...(state.active ? [state.active] : []),
      ].find((row) => row.id === body.id);
      if (!record) return route.fulfill({ status: 404, json: { error: "记录已删除，请刷新列表" } });
      return route.fulfill({
        json: { record, segments: state.segments, revisions: state.revisions },
      });
    }
    if (endpoint === "manual-entry") {
      state.manualSaves++;
      if (state.manualDelay) await new Promise(resolve => setTimeout(resolve, state.manualDelay));
      if (state.manualFailure) return route.fulfill({ status: 500, json: { error: "隔离补录保存失败" } });
      let record = state.manualEntries.get(body.request_id);
      if (!record) {
        record = { ...state.records[0], ...body, id: 1000 + state.manualEntries.size,
          duration_seconds: Math.floor(body.duration_ms / 1000), legacy_duration_ms: body.duration_ms,
          source: "MANUAL_ENTRY", status: "FINISHED", settlement_status: "COMPLETE", is_demo: false, revision: 0 };
        state.manualEntries.set(body.request_id, record);
        state.records.push(record);
      }
      if (state.manualLoseResponse) { state.manualLoseResponse = false; return route.abort('connectionreset'); }
      return route.fulfill({ json: { record, segments: [], revisions: [] } });
    }
    if (endpoint === "save") {
      state.saves++;
      if (state.saveDelay)
        await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (state.saveFailure)
        return route.fulfill({
          status: state.saveFailure,
          json: {
            error:
              state.saveFailure === 409
                ? "记录已被其他窗口修改"
                : "隔离保存失败",
          },
        });
      const row = state.records.find((row) => row.id === body.id);
      const before = structuredClone(row);
      Object.assign(row, body, {
        revision: row.revision + 1,
        settlement_status: "COMPLETE",
      });
      state.revisions.push({
        revision: row.revision,
        changed_at: Date.now(),
        before,
        after: structuredClone(row),
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (endpoint === "delete") {
      state.deletes++;
      state.records = state.records.filter((row) => row.id !== body.id);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      status: 404,
      json: { error: "No fixture endpoint" },
    });
  });
  return state;
}
```

## E:\WorkMemo\scripts\verify-manual-entry.mjs

```javascript
// Isolated HTTP fixtures only: never opens the desktop app or a real work database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:1422';
const output = new URL('../artifacts/manual-entry/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [];
let page;
const dialog = () => page.getByRole('dialog', { name: '补记录', exact: true });
const field = name => dialog().getByRole('textbox', { name, exact: true });
const save = () => dialog().getByRole('button', { name: '保存补录', exact: true });
async function setup(width = 1440, timezoneId = 'Asia/Shanghai') {
  await page?.close();
  page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId });
  page.setDefaultTimeout(10000);
  page.on('pageerror', e => errors.push(e.message));
  // Match the production Rust server's CSP on the built frontend.
  await page.route('**/dashboard', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'" } });
  });
  return dashboardFixture(page);
}
async function goto(extra = '') {
  await page.goto(`${base}/dashboard#token=isolated-manual-entry${extra}`);
  await page.getByRole('button', { name: '刷新连接', exact: true }).waitFor();
  await page.locator('.connection-dot.connected').first().waitFor({ state: 'attached' });
}
async function open() {
  await page.getByRole('button', { name: '补记录', exact: true }).click();
  await dialog().waitFor();
  await page.waitForTimeout(300); // Wait for Ant Design's entrance focus and motion.
}
async function dates(start = '2026-10-28 09:00', end = '2026-10-28 11:00') {
  for (const [name, value] of [['补录开始时间', start], ['补录结束时间', end]]) {
    await field(name).fill(value);
    await field(name).press('Enter');
    await page.locator('.wm-picker-dropdown:visible').waitFor({ state: 'hidden' });
    assert.equal(await field(name).inputValue(), value);
  }
}
async function shot(name) { await page.screenshot({ path: fileURLToPath(new URL(name + '.png', output)) }); }
async function test(name, action) { await action(); results.push(name); }
try {
  await test('validates input; saves Beijing times and net duration once; refreshes saved day without changing active work', async () => {
    const state = await setup(); await goto(); const active = structuredClone(state.active); await open();
    await save().click(); await dialog().getByRole('alert').waitFor(); assert.equal(state.manualSaves, 0);
    await field('补录工作量').fill('12.5'); await dates(); await field('扣除休息分钟数').fill('121');
    await save().click(); await dialog().getByRole('alert').filter({ hasText: '休息分钟数' }).waitFor();
    assert.equal(state.manualSaves, 0);
    await field('扣除休息分钟数').fill('30'); await field('补录备注').fill('  网页补录验收  ');
    await dialog().getByText('01:30:00', { exact: true }).waitFor();
    await shot('filled-desktop'); state.manualDelay = 350;
    await save().evaluate(button => { button.click(); button.click(); });
    assert.equal(await dialog().getByRole('button', { name: '取消', exact: true }).isDisabled(), true);
    await dialog().waitFor({ state: 'hidden' });
    assert.equal(state.manualSaves, 1); assert.equal(state.manualEntries.size, 1);
    const record = state.records.at(-1);
    assert.equal(record.start_time, Date.parse('2026-10-28T09:00:00+08:00'));
    assert.equal(record.end_time, Date.parse('2026-10-28T11:00:00+08:00'));
    assert.equal(record.duration_ms, 5400000); assert.equal(record.quantity, 12.5); assert.equal(record.remark, '网页补录验收');
    assert.deepEqual(state.active, active);
    await page.locator('.dc-page').getByText('人工补录', { exact: true }).waitFor();
    assert.equal(state.currentQuery.anchor_date, '2026-10-28');
    assert.equal(state.currentQuery.scope, 'real'); assert.equal(state.currentQuery.status, 'all');
    await shot('saved-record');
    await page.locator('tr').filter({ hasText: '网页补录验收' }).getByRole('button', { name: '详情', exact: true }).click();
    await page.getByRole('button', { name: '计时区间（0）', exact: true }).click();
    await page.getByText('人工补录的有效工时，没有自动计时区间。', { exact: true }).waitFor();
  });
  await test('failed saves preserve drafts; lost-response retry uses the same request and creates exactly one record', async () => {
    const state = await setup(); await goto(); await open(); await field('补录工作量').fill('0'); await dates();
    state.manualFailure = true; await save().click();
    await dialog().getByRole('alert').filter({ hasText: '隔离补录保存失败' }).waitFor();
    assert.equal(await field('补录工作量').inputValue(), '0');
    await dialog().getByRole('button', { name: '取消', exact: true }).click();
    const guard = page.getByRole('dialog', { name: '放弃这次补记录？', exact: true });
    await guard.getByRole('button', { name: '继续填写', exact: true }).click();
    await guard.waitFor({ state: 'hidden' }); await page.waitForTimeout(300);
    assert.equal(await field('补录工作量').inputValue(), '0');
    state.manualFailure = false; state.manualLoseResponse = true;
    await save().click(); await dialog().getByRole('alert').filter({ hasText: '连接已中断' }).waitFor();
    assert.equal(state.manualEntries.size, 1); await save().click(); await dialog().waitFor({ state: 'hidden' });
    const requests = state.requests.filter(r => r.endpoint === 'manual-entry');
    assert.equal(requests.length, 3); assert.deepEqual(requests[0].body, requests[1].body); assert.deepEqual(requests[1].body, requests[2].body);
    assert.equal(state.manualEntries.size, 1); assert.equal(state.records.filter(r => r.source === 'MANUAL_ENTRY').length, 1);
  });
  await test('Beijing calendar values stay fixed on a computer in New York, across a daylight-saving transition', async () => {
    const state = await setup(1440, 'America/New_York'); await goto(); await open();
    const expected = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());
    assert.equal(await field('补录结束时间').inputValue(), expected);
    await field('补录工作量').fill('1'); await dates('2026-11-01 01:00', '2026-11-01 03:00');
    await save().click(); await dialog().waitFor({ state: 'hidden' });
    const record = state.records.at(-1);
    assert.equal(record.start_time, Date.parse('2026-11-01T01:00:00+08:00'));
    assert.equal(record.end_time, Date.parse('2026-11-01T03:00:00+08:00')); assert.equal(record.duration_ms, 7200000);
  });
  await test('360px form and date panel fit; discard asks first; a fresh draft can save zero effective time', async () => {
    const state = await setup(360); await goto(); await open(); await field('补录工作量').fill('3');
    assert.equal(await page.evaluate(() => { const event = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; }), true);
    await field('补录开始时间').click();
    const panel = page.locator('.wm-picker-dropdown:visible'); await panel.waitFor();
    await page.waitForTimeout(300);
    const bounds = await panel.boundingBox(); assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= 361, JSON.stringify(bounds));
    assert.ok(bounds.y >= -1 && bounds.y + bounds.height <= 901, JSON.stringify(bounds));
    await shot('mobile-calendar');
    await panel.getByRole('button', { name: '确定', exact: true }).click();
    await panel.waitFor({ state: 'hidden' }); await shot('mobile-form');
    const box = await dialog().boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 360);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await dialog().getByRole('button', { name: '取消', exact: true }).click();
    await page.getByRole('dialog', { name: '放弃这次补记录？', exact: true }).getByRole('button', { name: '放弃补录', exact: true }).click();
    await dialog().waitFor({ state: 'hidden' }); assert.equal(state.manualSaves, 0);
    await open(); assert.equal(await field('补录工作量').inputValue(), '');
    await field('补录工作量').fill('0'); await dates(); await field('扣除休息分钟数').fill('120');
    await field('扣除休息分钟数').press('Control+s'); await dialog().waitFor({ state: 'hidden' }); assert.equal(state.records.at(-1).duration_ms, 0);
  });
  await test('older backend and demonstration scope do not enable real manual writes', async () => {
    const state = await setup(); state.manualCapability = false; await goto();
    assert.equal(await page.getByRole('button', { name: '补记录', exact: true }).isDisabled(), true);
    const demo = await setup(); await goto('&scope=demo');
    assert.equal(await page.getByRole('button', { name: '补记录', exact: true }).isDisabled(), true);
    assert.equal(demo.manualSaves, 0); assert.equal(state.manualSaves, 0);
  });
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ base, passed: results, pageErrors: errors }, null, 2));
  console.log(JSON.stringify({ passed: results.length, results, pageErrors: errors }, null, 2));
} catch (error) {
  await shot('failure').catch(() => {});
  await writeFile(new URL('failure-dom.txt', output), await page.locator('body').ariaSnapshot());
  await writeFile(new URL('failure.html', output), await page.content());
  await writeFile(new URL('failure.txt', output), String(error));
  throw error;
} finally { await browser.close(); }
```
