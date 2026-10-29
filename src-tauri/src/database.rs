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
    end_reason, legacy_duration_ms, revision, control_mode";

fn db_error(error: rusqlite::Error) -> String {
    format!("本地数据读写失败：{error}")
}

fn read_record(row: &rusqlite::Row<'_>) -> rusqlite::Result<WorkRecord> {
    Ok(WorkRecord {
        id: row.get(0)?,
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
            1..=9 => {}
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
            "UPDATE work_records SET is_paused=1, recovery_pending=1,
             pause_reason=COALESCE(pause_reason,'RECOVERY') WHERE status='WORKING'",
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
        let duration = self.elapsed(record, self.clock.now())?;
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
                "UPDATE work_records SET is_paused=1,pause_reason=?1 WHERE id=?2",
                params![reason, record.id],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        Ok(())
    }

    pub fn snapshot(&mut self) -> Result<Snapshot> {
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
        let record = self.current(id)?;
        if !record.is_paused {
            return Ok(());
        }
        let tx = self.connection.transaction().map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET is_paused=0, recovery_pending=0,pause_reason=NULL,control_mode=?2,last_input_time=?3 WHERE id=?1",
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
    tx.execute("UPDATE work_records SET status='FINISHED',is_paused=1,recovery_pending=0,pause_reason=NULL,
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

#[path = "tracking.rs"]
mod tracking;
pub use tracking::Notice;
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
