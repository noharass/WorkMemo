# 灵动岛首阶段与计时参数完整源码

以下完整收录本轮源码和阶段记录（本汇编自身除外）；原文件为执行和构建依据。原有未跟踪方案草稿未纳入本轮变更。

## UPDATE E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md

````````
# 自动工作记录：已确认业务规则与分阶段改造

用户于 2026-10-26（Asia/Shanghai）确认按规则整理方案开始实施。本文件补充 PRODUCT-SPEC.md；关于开始前填写数量、结束与结算的旧规则，以本文件为准。原技术栈、真实透明窗口、四种皮肤、数据可靠性及阶段确认约束继续适用。

## 已确认口径

- 自动开始必须同时满足：浏览器在前台、活动标签页命中配置的工作 URL、进入该工作环境后有最近 5 秒内的新输入、监测连接可信、没有未结束记录。
- 初期每 5 秒读取输入活动状态；页面每 3～5 秒或通过事件更新。只使用最后输入时间、页面匹配和连接状态，不采集按键、文本、轨迹或页面内容。
- 最后输入后 5 分钟提醒，7 分钟结束。阈值按真实最后输入时间计算，不按轮询时间计算。
- 离页前 2 分钟为计时宽限；满 2 分钟暂停，暂停后保留 10 分钟，即离页满 12 分钟结束。保留期内返回且有新输入可恢复原记录。
- 空闲与离页独立计算，先到的结束期限生效，同刻优先空闲；后端只结束一次、生成一项结算提醒。
- 空闲结束时有效尾段回退到最后输入；暂停、离线、锁屏、休眠和无法确认区间不计时。确认结束时间另存。其他应用的输入不能补回已暂停时间。
- 计时结束先提交 SQLite，再提示填写工作量。待补全记录不占用活动任务位置，不妨碍新记录。
- 工作量开始时可空，结算时必填；允许明确填写 0、正小数和科学计数，最大 10 亿。NULL 表示未填，0 表示已确认无产出；拒绝非有限数、负数及下溢成 0 的非零输入。
- 工作类别保留评测、质检、开发、文档。工作 URL 绑定默认类别；同一记录内切换匹配 URL 不自动拆分，结算时可以修正类别。
- 手动开始、继续不要求匹配 URL，开启人工计时区间；仍受空闲及系统状态保护。手动暂停只能由用户明确继续，不自动结束或另开记录。
- 明确从暂停任务切换到另一项时，旧记录结束与新记录创建须原子执行。自动监测不得复用该切换行为绕过手动暂停。
- 自动结束后必须创建新记录，不合并旧记录。新记录需要结束后的新活动信号。
- 补录标为人工补录；修改类别、工作量、备注或时间保留原值和修正信息，时间修正需核对有效区间，不能把暂停时长直接加回。
- 结束提醒非模态、可稍后填写、不持续抢焦点。关闭提醒保留待补全记录。待补全及提醒状态可重启恢复。
- 工时统计包含已结束待补全记录，工作量汇总仅含已结算数量，并显示待补全数量；日期归属沿用当前按开始日统计的规则。
- 第一版先验证一种明确支持的浏览器。URL 使用明确域名及可选路径前缀，默认忽略查询参数和片段，不加入复杂智能判断。
- 后续关闭主窗口继续后台监测，提供明确退出入口。开机启动未纳入本次默认实施范围。完全退出期间不能自动记录。

阅读、思考等连续低输入工作可能被少计。第一版保留固定阈值和人工修正，不进行内容识别；实际使用后再决定阈值或阅读模式。

## 阶段与确认边界

1. **数据与手动结算基础（代码已提交，原生回归待验收）**：兼容迁移现有 SQLite；工作量可空及 0；计时区间持久化；暂停与重启恢复；结束、待补全、填写独立；真实待补全列表及保存入口；已有手动计时、历史和主题回归。此阶段不声称已提供自动监测。
2. **自动监测与后台运行（当前阶段，用户于 2026-10-27 确认进入）**：Windows 输入与系统状态、浏览器连接及 URL 配置、截止时间状态机、自动开始/暂停/结束、后台窗口生命周期和非阻塞提醒。接入真实监测，验证故障恢复与最小权限。
3. **人工补录修正与成品验收**：完整时间修正、补录、重叠处理及原始结果追溯；实际 Windows 场景、迁移、四皮肤及透明回归；打包与交付。

每阶段结束记录实际结果，提交并推送 Git，等待用户确认后进入下一阶段。完成某一阶段不代表整个自动记录功能已经完成。

## 数据迁移原则

- 旧记录的 ID、类别、数量、备注、起止时间和毫秒时长保留；旧已结束记录作为已结算历史。
- 旧版只有累计时长，不能凭开始与结束时间伪造有效区间。旧时长保留为历史基数，新产生的区间另存。
- 新旧记录继续使用同一数据库和历史入口；填写状态与计时状态分开。
- 所有业务写入由 Rust 校验并事务提交。迁移失败回滚，不重置数据库。
- 外观配置、原生透明配置及应用标识不因计时改造而改变。隔离验收使用独立应用标识，不对真实数据库制造测试任务。


## 2026-10-27 计时参数补充

用户要求可修改计时参数。原先固定的 5/7 分钟空闲阈值、离页 2 分钟暂停和暂停后 10 分钟结束，现作为旧数据库迁移及首次使用的默认值；用户可以在监测设置中分别设置四项，单位为秒，每项 1 至 86400，空闲提醒必须早于空闲结束。保存监测配置会安全暂停当前自动记录，重新确认页面并出现新输入后恢复。离页暂停和记录结束是两个事件，空闲与离页仍以先到的截止时间为准；浏览器连接不可信时立即保护计时，不以离页宽限补算未知时间。SQLite schema 4 保存参数，外观与状态岛设置仍独立保存。
````````

## UPDATE E:\WorkMemo\src-tauri\src\appearance.rs

````````
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File, OpenOptions},
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::{
        Mutex,
        atomic::{AtomicU64, Ordering},
    },
};
use tauri::{Emitter, Manager, State};

const VERSION: u32 = 1;
const MAX_BYTES: u64 = 65_536;
static NEXT_TEMP: AtomicU64 = AtomicU64::new(0);
type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Copy, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Theme {
    Glass,
    Cream,
    Dark,
    Neon,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct Appearance {
    pub version: u32,
    pub theme: Theme,
    pub opacity: u8,
}

impl Default for Appearance {
    fn default() -> Self {
        Self {
            version: VERSION,
            theme: Theme::Cream,
            opacity: 88,
        }
    }
}

impl Appearance {
    fn validate(&self) -> Result<()> {
        if self.version != VERSION {
            return Err("外观设置版本不受支持，请使用匹配的应用版本。".into());
        }
        if !(80..=100).contains(&self.opacity) {
            return Err("背景不透明度须在 80% 到 100% 之间。".into());
        }
        Ok(())
    }
}

fn io_error(error: std::io::Error) -> String {
    format!("外观设置读写失败：{error}")
}

fn read_bytes(path: &Path) -> Result<Option<Vec<u8>>> {
    let file = match File::open(path) {
        Ok(file) => file,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
        Err(error) => return Err(io_error(error)),
    };
    let mut bytes = Vec::new();
    file.take(MAX_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(io_error)?;
    if bytes.len() as u64 > MAX_BYTES {
        return Err("外观配置文件过大，请检查配置后重试。".into());
    }
    Ok(Some(bytes))
}

fn decode(bytes: &[u8]) -> Result<Appearance> {
    let settings: Appearance =
        serde_json::from_slice(bytes).map_err(|e| format!("无法读取外观配置：{e}"))?;
    settings.validate()?;
    Ok(settings)
}

pub fn load(path: &Path) -> Result<Appearance> {
    match read_bytes(path)? {
        Some(bytes) => decode(&bytes),
        None => Ok(Appearance::default()),
    }
}

struct TemporaryFile(PathBuf);
impl Drop for TemporaryFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

fn write_unique(parent: &Path, label: &str, extension: &str, bytes: &[u8]) -> Result<PathBuf> {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
    let path = parent.join(format!(
        "appearance.{label}.{}.{nonce}.{sequence}.{extension}",
        std::process::id()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&path)
        .map_err(io_error)?;
    if let Err(error) = file.write_all(bytes).and_then(|_| file.sync_all()) {
        drop(file);
        let _ = fs::remove_file(&path);
        return Err(io_error(error));
    }
    Ok(path)
}

pub fn save(path: &Path, settings: Appearance) -> Result<Appearance> {
    settings.validate()?;
    let previous = read_bytes(path)?;
    if let Some(bytes) = &previous {
        if let Ok(value) = serde_json::from_slice::<serde_json::Value>(bytes) {
            if value
                .get("version")
                .and_then(|v| v.as_u64())
                .is_some_and(|v| v > u64::from(VERSION))
            {
                return Err("外观配置来自较新版本，未覆盖文件。请升级应用。".into());
            }
        }
    }
    let parent = path.parent().ok_or("外观配置目录无效。")?;
    fs::create_dir_all(parent).map_err(io_error)?;
    // An explicit save can repair invalid settings, retaining the original bytes.
    if let Some(bytes) = &previous {
        if decode(bytes).is_err() {
            write_unique(parent, "recovery", "json", bytes)?;
        }
    }
    let mut bytes =
        serde_json::to_vec_pretty(&settings).map_err(|e| format!("无法编码外观配置：{e}"))?;
    bytes.push(b'\n');
    let temporary = TemporaryFile(write_unique(parent, "pending", "tmp", &bytes)?);
    // Same-directory replacement: never truncate the live configuration first.
    fs::rename(&temporary.0, path).map_err(io_error)?;
    Ok(settings)
}

pub struct AppearanceState {
    path: Result<PathBuf>,
    gate: Mutex<()>,
}

impl AppearanceState {
    pub fn initialize(app: &tauri::App) -> Self {
        Self {
            path: app
                .path()
                .app_config_dir()
                .map(|p| p.join("appearance.json"))
                .map_err(|e| format!("无法定位外观配置目录：{e}")),
            gate: Mutex::new(()),
        }
    }
}

#[tauri::command]
pub async fn get_appearance(app: tauri::AppHandle) -> Result<Appearance> {
    tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        load(state.path.as_ref().map_err(|e| e.clone())?)
    })
    .await
    .map_err(|e| format!("无法加载外观设置：{e}"))?
}

#[tauri::command]
pub async fn save_appearance(app: tauri::AppHandle, settings: Appearance) -> Result<Appearance> {
    let handle = app.clone();
    let saved = tauri::async_runtime::spawn_blocking(move || {
        let state: State<'_, AppearanceState> = app.state();
        let _guard = state
            .gate
            .lock()
            .map_err(|_| "外观设置服务异常，请重新打开应用。")?;
        save(state.path.as_ref().map_err(|e| e.clone())?, settings)
    })
    .await
    .map_err(|e| format!("无法保存外观设置：{e}"))??;
    let _ = handle.emit("workmemo:appearance-changed", ());
    Ok(saved)
}

#[cfg(test)]
#[path = "appearance_tests.rs"]
mod tests;
````````

## UPDATE E:\WorkMemo\src-tauri\src\database.rs

````````
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
                "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;",
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
            1 | 2 | 3 | 4 => {}
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
        let now = clock.now();
        let mut store = Self {
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
            &format!("SELECT {COLUMNS} FROM work_records WHERE status='FINISHED' ORDER BY id DESC LIMIT 5")
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
                "SELECT COUNT(*) FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING'", [], |r| r.get(0)
            ).map_err(db_error)?,
            monitoring: self.monitor.status.clone(),
        })
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
            self.connection.execute("UPDATE work_records SET pause_reason='MANUAL',control_mode='MANUAL',recovery_pending=0 WHERE id=?1",[id]).map_err(db_error)?;
            self.monitor.status.idle_warning = false;
            return Ok(());
        }
        self.pause_with_reason(id, "MANUAL")
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
        self.resume_at(id, self.clock.now(), "MANUAL")
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
````````

## UPDATE E:\WorkMemo\src-tauri\src\desktop.rs

````````
use serde::{Deserialize, Serialize};
use std::{
    path::PathBuf,
    sync::{Mutex, atomic::Ordering},
};
use tauri::{
    Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct IslandSettings {
    version: u32,
    enabled: bool,
    position: Option<(i32, i32)>,
}
impl Default for IslandSettings {
    fn default() -> Self {
        Self {
            version: 1,
            enabled: true,
            position: None,
        }
    }
}
pub struct IslandState {
    path: Result<PathBuf, String>,
    data: Mutex<(IslandSettings, bool)>,
}
impl IslandState {
    pub fn initialize(app: &tauri::App) -> Self {
        let path = app
            .path()
            .app_config_dir()
            .map(|p| p.join("island.json"))
            .map_err(|e| e.to_string());
        let loaded =
            path.as_ref()
                .map_err(|e| e.clone())
                .and_then(|path| match std::fs::read(path) {
                    Ok(bytes) => serde_json::from_slice::<IslandSettings>(&bytes)
                        .map_err(|e| e.to_string())
                        .and_then(|v| {
                            if v.version == 1 {
                                Ok(v)
                            } else {
                                Err("状态岛配置版本不受支持".into())
                            }
                        }),
                    Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                        Ok(IslandSettings::default())
                    }
                    Err(e) => Err(e.to_string()),
                });
        let (path, settings) = match loaded {
            Ok(settings) => (path, settings),
            Err(error) => (
                Err(format!("状态岛配置无法读取，未覆盖原文件：{error}")),
                IslandSettings::default(),
            ),
        };
        Self {
            path,
            data: Mutex::new((settings, false)),
        }
    }
    pub fn enabled(&self) -> bool {
        self.data.lock().map(|d| d.0.enabled).unwrap_or(true)
    }
    fn toggle(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        data.0.enabled = !data.0.enabled;
        data.1 = true;
        drop(data);
        self.flush()
    }
    pub fn disable(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        data.0.enabled = false;
        data.1 = true;
        drop(data);
        self.flush()
    }
    pub fn moved(&self, p: tauri::PhysicalPosition<i32>) {
        if let Ok(mut data) = self.data.lock() {
            if data.0.position != Some((p.x, p.y)) {
                data.0.position = Some((p.x, p.y));
                data.1 = true;
            }
        }
    }
    pub fn flush(&self) -> Result<(), String> {
        let mut data = self.data.lock().map_err(|_| "状态岛设置锁异常")?;
        if !data.1 {
            return Ok(());
        }
        let path = self.path.as_ref().map_err(|e| e.clone())?;
        let parent = path.parent().ok_or("状态岛设置目录无效")?;
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        let temp = path.with_extension("pending");
        std::fs::write(
            &temp,
            serde_json::to_vec(&data.0).map_err(|e| e.to_string())?,
        )
        .map_err(|e| e.to_string())?;
        std::fs::rename(&temp, path).map_err(|e| e.to_string())?;
        data.1 = false;
        Ok(())
    }
    fn position(&self) -> Option<(i32, i32)> {
        self.data.lock().ok().and_then(|d| d.0.position)
    }
}

pub fn show_main(app: &tauri::AppHandle, settlement: bool) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("主窗口不可用。")?;
    set_visibility(&window.as_ref().window(), true, true)?;
    window
        .show()
        .and_then(|_| window.unminimize())
        .and_then(|_| window.set_focus())
        .map_err(|e| e.to_string())?;
    if settlement {
        window
            .emit("workmemo:open-settlement", ())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "打开 WorkMemo", true, None::<&str>)?;
    let pending = MenuItem::with_id(app, "pending", "待补全工作量", true, None::<&str>)?;
    let island = MenuItem::with_id(app, "island", "显示 / 隐藏状态岛", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出 WorkMemo", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &pending, &island, &quit])?;
    let mut builder = TrayIconBuilder::with_id("workmemo-tray")
        .tooltip("WorkMemo · 后台工作记录")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                let _ = show_main(app, false);
            }
            "pending" => {
                let _ = show_main(app, true);
            }
            "island" => {
                if let Err(error) = app.state::<IslandState>().toggle() {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
            }
            "quit" => {
                if let Err(error) = save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                let backend = app.state::<crate::service::Backend>();
                match backend.save_on_exit() {
                    Ok(()) => {
                        backend.exiting.store(true, Ordering::Relaxed);
                        app.exit(0);
                    }
                    Err(error) => {
                        let _ = show_main(app, false);
                        let _ = app.emit("workmemo:storage-error", error);
                    }
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                }
            ) {
                let _ = show_main(tray.app_handle(), false);
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    app.state::<crate::service::Backend>()
        .tray_ready
        .store(true, Ordering::Relaxed);
    Ok(())
}

pub fn save_island_position(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<IslandState>();
    if let Some(window) = app.get_webview_window("notice") {
        state.moved(window.outer_position().map_err(|e| e.to_string())?);
    }
    state.flush()
}

pub fn present_notice(app: &tauri::AppHandle, visible: bool, expanded: bool) -> Result<(), String> {
    if !visible {
        if let Some(window) = app.get_webview_window("notice") {
            set_visibility(&window.as_ref().window(), false, false)?;
        }
        return Ok(());
    }
    let window = match app.get_webview_window("notice") {
        Some(window) => window,
        None => {
            let saved_position = app.state::<IslandState>().position();
            let window = WebviewWindowBuilder::new(
                app,
                "notice",
                WebviewUrl::App("index.html?notice=1".into()),
            )
            .title("WorkMemo 工作提醒")
            .inner_size(360.0, 80.0)
            .resizable(false)
            .transparent(true)
            .no_redirection_bitmap(true)
            .decorations(false)
            .shadow(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .focused(false)
            .visible(false)
            .background_color(tauri::window::Color(0, 0, 0, 0))
            .build()
            .map_err(|e| e.to_string())?;
            if let Some((x, y)) = saved_position {
                window
                    .set_position(tauri::PhysicalPosition::new(x, y))
                    .map_err(|e| e.to_string())?;
            } else if let Some(monitor) = window.primary_monitor().map_err(|e| e.to_string())? {
                let scale = monitor.scale_factor();
                let origin = &monitor.work_area().position;
                let size = &monitor.work_area().size;
                let width = (360.0 * scale) as i32;
                let x = origin.x + ((size.width as i32 - width) / 2).max(0);
                let y = origin.y + (16.0 * scale) as i32;
                window
                    .set_position(tauri::PhysicalPosition::new(x, y))
                    .map_err(|e| e.to_string())?;
            }
            window
        }
    };
    // Tao's creation-only focused(false) marker is cleared after creation;
    // a later generic show() may activate the window. Use the native no-activate
    // command consistently for both showing and hiding this auxiliary window.
    let (width, height) = if expanded {
        (420.0, 460.0)
    } else {
        (360.0, 80.0)
    };
    window
        .set_size(tauri::LogicalSize::new(width, height))
        .map_err(|e| e.to_string())?;
    let position = window.outer_position().map_err(|e| e.to_string())?;
    let monitors = window.available_monitors().map_err(|e| e.to_string())?;
    let monitor = monitors
        .iter()
        .find(|m| {
            let a = m.work_area();
            position.x >= a.position.x
                && position.y >= a.position.y
                && i64::from(position.x) < i64::from(a.position.x) + i64::from(a.size.width)
                && i64::from(position.y) < i64::from(a.position.y) + i64::from(a.size.height)
        })
        .or_else(|| monitors.first());
    if let Some(monitor) = monitor {
        let a = monitor.work_area();
        let scale = monitor.scale_factor();
        let max_x = (i64::from(a.position.x) + i64::from(a.size.width) - (width * scale) as i64)
            .max(i64::from(a.position.x));
        let max_y = (i64::from(a.position.y) + i64::from(a.size.height) - (height * scale) as i64)
            .max(i64::from(a.position.y));
        let x = i64::from(position.x).clamp(i64::from(a.position.x), max_x) as i32;
        let y = i64::from(position.y).clamp(i64::from(a.position.y), max_y) as i32;
        if (x, y) != (position.x, position.y) {
            window
                .set_position(tauri::PhysicalPosition::new(x, y))
                .map_err(|e| e.to_string())?;
        }
    }
    set_visibility(&window.as_ref().window(), true, false)
}

pub fn set_visibility(window: &tauri::Window, visible: bool, activate: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SW_HIDE, SW_SHOWNOACTIVATE, SW_SHOWNORMAL, ShowWindowAsync,
        };
        let handle = window.hwnd().map_err(|e| e.to_string())?;
        let command = if !visible {
            SW_HIDE
        } else if activate {
            SW_SHOWNORMAL
        } else {
            SW_SHOWNOACTIVATE
        };
        if unsafe { ShowWindowAsync(handle.0 as _, command) } == 0 {
            return Err(format!(
                "原生窗口显示请求失败：{}",
                std::io::Error::last_os_error()
            ));
        }
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = activate;
        if visible {
            window.show()
        } else {
            window.hide()
        }
        .map_err(|e| e.to_string())
    }
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\history_tests.rs

````````
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
        assert_eq!(version, 4);
    }
    // Exact temporary test directory, created above; never a user database path.
    assert_eq!(directory.parent(), Some(std::env::temp_dir().as_path()));
    std::fs::remove_dir_all(directory).unwrap();
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\lib.rs

````````
use serde::Serialize;
use tauri::{Emitter, Manager};

mod appearance;
mod browser_bridge;
mod browser_protocol;
mod clock;
mod connection;
mod database;
mod desktop;
mod monitor;
mod native_activity;
#[allow(dead_code)] // Shared with the separately built native host CLI.
mod registration;
mod service;

/// A real IPC round trip verifies that the desktop backend is available.
#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "WorkMemo",
        version: env!("CARGO_PKG_VERSION"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(desktop::IslandState::initialize(app));
            app.manage(connection::ConnectionState::initialize(app));
            app.manage(service::Backend::initialize(app));
            app.manage(appearance::AppearanceState::initialize(app));
            desktop::setup(app)?;
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            connection::get_connection_status,
            connection::repair_browser_connection,
            connection::open_browser_extension,
            appearance::get_appearance,
            appearance::save_appearance,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
            service::query_history,
            service::delete_record,
            service::get_pending_records,
            service::settle_record,
            service::get_monitor_config,
            service::save_monitor_config,
            service::get_notice,
            service::defer_notice,
            service::show_main,
            service::exit_app,
        ])
        .build(tauri::generate_context!())
        .expect("WorkMemo failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if let Err(error) = desktop::save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                if let Err(error) = app.state::<service::Backend>().save_on_exit() {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:storage-error", error);
                }
            }
        });
}

#[cfg(debug_assertions)]
pub fn monitor_probe() -> String {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let application_id = &context.config().identifier;
    match native_activity::sample() {
        Ok(sample)=>serde_json::json!({"application_id":application_id,"native_available":sample.reliable,"unlocked":sample.unlocked,
            "chrome_foreground":sample.chrome_foreground,"last_input_age_ms":sample.at.ticks_ms.saturating_sub(sample.last_input_ticks)}).to_string(),
        Err(error)=>serde_json::json!({"application_id":application_id,"native_available":false,"error":error}).to_string(),
    }
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\monitor.rs

````````
use crate::clock::TimePoint;
use serde::{Deserialize, Serialize};

pub const INPUT_POLL_MS: i64 = 5_000;
pub const RECENT_INPUT_MS: i64 = 5_000;
pub const BROWSER_TIMEOUT_MS: i64 = 15_000;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct WorkUrl {
    pub id: i64,
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct TrackingTimes {
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
    pub away_pause_seconds: i64,
    pub hold_seconds: i64,
}
impl Default for TrackingTimes {
    fn default() -> Self {
        Self {
            idle_warning_seconds: 300,
            idle_end_seconds: 420,
            away_pause_seconds: 120,
            hold_seconds: 600,
        }
    }
}
impl TrackingTimes {
    pub fn validate(&self) -> Result<(), String> {
        if [
            self.idle_warning_seconds,
            self.idle_end_seconds,
            self.away_pause_seconds,
            self.hold_seconds,
        ]
        .iter()
        .any(|v| !(1..=86400).contains(v))
        {
            return Err("计时参数必须为 1 到 86400 秒的整数。".into());
        }
        if self.idle_warning_seconds >= self.idle_end_seconds {
            return Err("空闲提醒时间必须早于空闲结束时间。".into());
        }
        Ok(())
    }
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MonitorConfig {
    pub enabled: bool,
    pub revision: i64,
    pub rules: Vec<WorkUrl>,
    pub times: TrackingTimes,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuleInput {
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConfigInput {
    pub enabled: bool,
    pub expected_revision: i64,
    pub rules: Vec<RuleInput>,
    pub times: TrackingTimes,
}

#[derive(Clone, Copy, Debug)]
pub struct NativeSample {
    pub at: TimePoint,
    pub last_input_ticks: i64,
    pub chrome_foreground: bool,
    pub unlocked: bool,
    pub reliable: bool,
}

#[derive(Clone, Debug)]
pub struct PageSample {
    pub at: TimePoint,
    pub focused: bool,
    pub rule_id: Option<i64>,
    pub revision: i64,
    pub ready: bool,
}

#[derive(Clone, Debug, Default, Serialize)]
pub struct MonitorStatus {
    pub enabled: bool,
    pub browser_connected: bool,
    pub native_available: bool,
    pub work_page: bool,
    pub idle_warning: bool,
    pub message: String,
    pub revision: i64,
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
    pub away_pause_remaining_seconds: Option<i64>,
}

#[derive(Default)]
pub struct Runtime {
    pub active: bool,
    pub events_failed: bool,
    pub config: MonitorConfig,
    pub native: Option<NativeSample>,
    pub page: Option<PageSample>,
    pub last_trusted_page: Option<i64>,
    pub browser_owner: Option<u64>,
    pub last_tick: Option<i64>,
    pub last_input: Option<i64>,
    pub record_id: Option<i64>,
    pub entered_at: Option<i64>,
    pub page_was_matched: bool,
    pub away_since: Option<i64>,
    pub monitor_pause_since: Option<i64>,
    pub input_floor: i64,
    pub warning_dismissed_for: Option<i64>,
    pub status: MonitorStatus,
}

impl Runtime {
    pub fn record_changed(&mut self, id: i64, at: TimePoint) {
        self.record_id = Some(id);
        self.last_input = Some(at.ticks_ms);
        self.away_since = None;
        self.monitor_pause_since = None;
        self.warning_dismissed_for = None;
        self.status.idle_warning = false;
    }
    pub fn record_ended(&mut self, at: TimePoint) {
        self.record_id = None;
        self.input_floor = at.ticks_ms;
        self.away_since = None;
        self.monitor_pause_since = None;
        self.status.idle_warning = false;
    }
}

pub fn normalize_url(value: &str) -> Result<String, String> {
    if value.len() > 2048 {
        return Err("工作 URL 不能超过 2048 字节。".into());
    }
    let mut url =
        url::Url::parse(value.trim()).map_err(|_| "请输入完整的 http 或 https 工作 URL。")?;
    if !["http", "https"].contains(&url.scheme())
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err("工作 URL 只支持不含用户名或密码的 http/https 地址。".into());
    }
    url.set_query(None);
    url.set_fragment(None);
    let result = url.to_string();
    if result.len() > 2048 {
        return Err("规范化后的 URL 过长。".into());
    }
    Ok(result)
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\service.rs

````````
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
pub struct Backend {
    inner: SharedStore,
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
                store.activate_monitoring();
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
            let mut listener_ok = true;
            let mut reported_error: Option<String> = None;
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                let mut notice = None;
                let mut active_id = None;
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
                        match store.current_notice() {
                            Ok(value) => notice = value,
                            Err(error) => {
                                store.warning = Some(error.clone());
                                runtime_failure = Some(error);
                            }
                        }
                        match store.snapshot() {
                            Ok(snapshot) => active_id = snapshot.active.map(|record| record.id),
                            Err(error) => runtime_failure = Some(error),
                        }
                    }
                }
                let key = notice
                    .as_ref()
                    .map(|n| format!("{}:{}", n.kind, n.record.id))
                    .or_else(|| {
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .enabled()
                            .then_some(active_id)
                            .flatten()
                            .map(|id| format!("active:{id}"))
                    });
                if key != presented {
                    match crate::desktop::present_notice(
                        &app_handle,
                        key.is_some(),
                        notice.is_some(),
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

async fn access<T: Send + 'static>(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<T> + Send + 'static,
) -> Result<T> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = shared
            .lock()
            .map_err(|_| "本地数据服务异常，请重新打开应用。")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        action(store)
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
pub async fn start_task(state: State<'_, Backend>, input: StartInput) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.start(input)).await
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
    state.save_on_exit()?;
    state.exiting.store(true, Ordering::Relaxed);
    app.exit(0);
    Ok(())
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let backend = window.state::<Backend>();
        if window.label() == "notice" {
            api.prevent_close();
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
````````

## UPDATE E:\WorkMemo\src-tauri\src\tracking.rs

````````
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
    pub fn monitor_config(&self) -> Result<MonitorConfig> {
        let (enabled, revision, times) = self
            .connection
            .query_row(
                "SELECT enabled,revision,idle_warning_seconds,idle_end_seconds,away_pause_seconds,hold_seconds FROM monitoring_settings WHERE id=1",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, TrackingTimes { idle_warning_seconds: r.get(2)?, idle_end_seconds: r.get(3)?, away_pause_seconds: r.get(4)?, hold_seconds: r.get(5)? })),
            )
            .map_err(db_error)?;
        let mut statement = self
            .connection
            .prepare("SELECT id,url_prefix,category FROM work_urls ORDER BY id")
            .map_err(db_error)?;
        let rules = statement
            .query_map([], |r| {
                Ok(WorkUrl {
                    id: r.get(0)?,
                    url_prefix: r.get(1)?,
                    category: r.get(2)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)?;
        times.validate()?;
        Ok(MonitorConfig {
            times,
            enabled,
            revision,
            rules,
        })
    }

    pub fn save_monitor_config(&mut self, input: ConfigInput) -> Result<MonitorConfig> {
        input.times.validate()?;
        if input.rules.len() > 50 || (input.enabled && input.rules.is_empty()) {
            return Err("请配置 1 到 50 条工作 URL 后启用自动识别。".into());
        }
        let mut seen = HashSet::new();
        let mut rules = Vec::new();
        for rule in input.rules {
            let prefix = normalize_url(&rule.url_prefix)?;
            if !seen.insert(prefix.clone()) {
                return Err("工作 URL 重复，请合并重复规则。".into());
            }
            if !["评测", "质检", "开发", "文档"].contains(&rule.category.as_str()) {
                return Err("请选择有效的工作类别。".into());
            }
            rules.push((prefix, rule.category));
        }
        let current = self.monitor_config()?;
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
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3,control_mode=?4 WHERE id=?5",
                params![duration,duration/1000,if input.enabled{"MONITOR"}else{"MANUAL"},if input.enabled{"AUTO"}else{"MANUAL"},record.id]).map_err(db_error)?;
        }
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for (prefix, category) in rules {
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category) VALUES(?1,?2)",
                params![prefix, category],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET enabled=?1,revision=revision+1,idle_warning_seconds=?2,idle_end_seconds=?3,away_pause_seconds=?4,hold_seconds=?5 WHERE id=1",
            params![input.enabled,input.times.idle_warning_seconds,input.times.idle_end_seconds,input.times.away_pause_seconds,input.times.hold_seconds],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        if active.is_some() {
            self.segment = None;
            self.monitor.monitor_pause_since = Some(now.ticks_ms);
        }
        self.monitor.config = self.monitor_config()?;
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
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.enabled = self.monitor.config.enabled;
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
        self.monitor
            .native
            .is_none_or(|sample| now.saturating_sub(sample.at.ticks_ms) >= INPUT_POLL_MS)
            || self.monitor.last_input.is_some_and(|last| {
                [
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
        tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3 WHERE id=?4",params![total,total/1000,if finish{None}else{Some(reason)},record.id]).map_err(db_error)?;
        if finish {
            finish_row(&tx, record.id, record.start_time, confirmed.wall_ms, reason)?;
        }
        tx.commit().map_err(db_error)?;
        self.segment = None;
        if finish {
            self.monitor.record_ended(confirmed);
            self.monitor.input_floor = cutoff;
        }
        Ok(())
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
        // A restored input arriving after an expired idle deadline starts a new
        // record; it must not silently extend the old one.
        if let (Some(old), Some(new)) = (old_input, new_input) {
            if new > old
                && new >= old.saturating_add(self.monitor.config.times.idle_end_seconds * 1000)
                && self.active()?.is_some_and(|r| !protected(&r))
            {
                self.close_at(old, "IDLE", true, now)?;
                self.monitor.input_floor = old
                    .saturating_add(self.monitor.config.times.idle_end_seconds * 1000)
                    .saturating_sub(1);
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
        if matched && !self.monitor.page_was_matched {
            self.monitor.entered_at = Some(now.ticks_ms);
        }
        if !matched {
            self.monitor.entered_at = None;
        }
        self.monitor.page_was_matched = matched;

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
            let mut deadlines = Vec::new();
            if let Some(last) = new_input {
                deadlines.push((
                    last.saturating_add(self.monitor.config.times.idle_end_seconds * 1000),
                    0,
                    "IDLE",
                    last,
                ));
            }
            if let Some(away) = self.monitor.away_since {
                deadlines.push((
                    away.saturating_add(
                        self.monitor.config.times.away_pause_seconds * 1000
                            + self.monitor.config.times.hold_seconds * 1000,
                    ),
                    1,
                    "AWAY",
                    away.saturating_add(self.monitor.config.times.away_pause_seconds * 1000),
                ));
            }
            if let Some(pause) = self.monitor.monitor_pause_since {
                deadlines.push((
                    pause.saturating_add(self.monitor.config.times.hold_seconds * 1000),
                    2,
                    "RECOVERY",
                    pause,
                ));
            }
            deadlines.sort_by_key(|d| (d.0, d.1));
            if let Some((deadline, _, reason, cutoff)) =
                deadlines.first().copied().filter(|d| d.0 <= now.ticks_ms)
            {
                self.close_at(cutoff, reason, true, now)?;
                self.monitor.input_floor = deadline;
            } else if record.control_mode == "AUTO" && native_ok && page_known {
                if matched {
                    self.monitor.away_since = None;
                    let fresh = new_input.is_some_and(|last| {
                        last >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                            && last > self.monitor.input_floor
                            && now.ticks_ms - last <= RECENT_INPUT_MS
                    });
                    if record.is_paused
                        && matches!(record.pause_reason.as_deref(), Some("AWAY" | "MONITOR"))
                        && fresh
                    {
                        let last = new_input.unwrap();
                        self.resume_at(
                            record.id,
                            TimePoint {
                                ticks_ms: last,
                                wall_ms: now
                                    .wall_ms
                                    .saturating_sub(now.ticks_ms - last)
                                    .max(record.start_time),
                            },
                            "AUTO",
                        )?;
                    }
                } else {
                    let away = *self.monitor.away_since.get_or_insert(now.ticks_ms);
                    if now.ticks_ms
                        >= away.saturating_add(self.monitor.config.times.away_pause_seconds * 1000)
                        && !record.is_paused
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
            }
        }

        if self.active()?.is_none() && matched && native_ok {
            if let (Some(last), Some(entered), Some(rule)) =
                (self.monitor.last_input, self.monitor.entered_at, rule)
            {
                if last >= entered
                    && last > self.monitor.input_floor
                    && now.ticks_ms - last <= RECENT_INPUT_MS
                {
                    self.start_at(
                        StartInput {
                            category: rule.category,
                            quantity: None,
                            remark: String::new(),
                        },
                        "AUTO",
                        TimePoint {
                            ticks_ms: last,
                            wall_ms: now.wall_ms.saturating_sub(now.ticks_ms - last).max(0),
                        },
                        false,
                    )?;
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
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.revision = self.monitor.config.revision;
        self.monitor.status.native_available = native_ok;
        self.monitor.status.browser_connected = connected;
        self.monitor.status.work_page = matched;
        self.monitor.status.message = if !native_ok {
            "系统状态暂不可确认，已暂停计时"
        } else if !self.monitor.config.enabled {
            "自动页面识别未启用；手动计时仍有空闲保护"
        } else if self.active()?.is_some_and(|r| r.recovery_pending) {
            "有上次待恢复任务，请先继续或结束"
        } else if self
            .active()?
            .is_some_and(|r| r.pause_reason.as_deref() == Some("MANUAL"))
        {
            "已手动暂停，等待明确继续"
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
        let id:Option<i64>=self.connection.query_row("SELECT record_id FROM end_reminders JOIN work_records ON work_records.id=end_reminders.record_id WHERE dismissed=0 AND status='FINISHED' AND settlement_status='PENDING' ORDER BY record_id LIMIT 1",[],|r|r.get(0)).optional().map_err(db_error)?;
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
````````

## UPDATE E:\WorkMemo\src-tauri\src\tracking_tests.rs

````````
use super::tests::{TestClock, TestDirectory};
use super::*;
use crate::monitor::*;

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
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: 0,
                rules: vec![RuleInput {
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
    fn tick(&mut self) {
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
    let last = h.clock.now();
    h.advance(420_000, false);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 420_000));
    assert_eq!(record.duration_ms, last.ticks_ms - 1000);
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
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
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
fn first_input_at_idle_deadline_starts_new_record_instead_of_merging() {
    let mut h = Harness::new();
    let old = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    let current = h.store.active().unwrap().unwrap();
    assert_ne!(current.id, old);
    assert_eq!(current.duration_ms, 0);
    assert_eq!(h.saved(old).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_is_never_ended_resumed_or_bypassed_and_manual_resume_ignores_url() {
    let mut h = Harness::new();
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
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 190_000);
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
                    times: TrackingTimes::default(),
                    enabled: true,
                    expected_revision: original.revision,
                    rules: vec![RuleInput {
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
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: original.revision,
                rules: vec![RuleInput {
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
            version: 1,
            sequence,
            config_revision: revision,
            focused,
            ready: true,
            rule_id: Some(rule),
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
                version: 1,
                sequence,
                config_revision: revision,
                focused: false,
                ready: true,
                rule_id: None,
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
        idle_warning_seconds: 20,
        idle_end_seconds: 30,
        away_pause_seconds: 4,
        hold_seconds: 6,
    };
    h.store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times.clone(),
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
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
            enabled: true,
            expected_revision: cfg.revision,
            times: TrackingTimes {
                idle_warning_seconds: 2,
                idle_end_seconds: 4,
                ..TrackingTimes::default()
            },
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
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
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
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
````````

## UPDATE E:\WorkMemo\src\App.css

````````
:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); --content-gap: 12px; }
.desktop-frame[data-density="comfortable"] { --content-gap: 20px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: grid; grid-template-columns: auto auto minmax(64px, 1fr) auto; align-items: center; gap: 12px; flex-shrink: 0; min-height: 56px; padding: 8px 14px; background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: block; width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
.brand-name { display: block; font-size: 13px; font-weight: 600; letter-spacing: -.25px; white-space: nowrap; }
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.main-nav { display: flex; align-items: center; gap: 3px; }
button.nav-button { position: relative; width: 31px; height: 34px; padding: 5px; justify-content: center; color: var(--text-muted); background: transparent; box-shadow: none; border-radius: 9px; }
button.nav-button:hover:not(:disabled) { background: var(--control-hover); }
button.nav-button[aria-pressed="true"] { color: var(--accent-text); }
button.nav-button[aria-pressed="true"]::after { content: ""; position: absolute; height: 2px; left: 8px; right: 8px; bottom: -3px; border-radius: 2px; background: var(--accent); }
.category-strip { display: flex; gap: 6px; min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 3px 0; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.category-strip::-webkit-scrollbar { height: 2px; }
.category-strip::-webkit-scrollbar-thumb { border-radius: 2px; background: var(--scroll-thumb); }
.category-strip:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; border-radius: 6px; }
.category-chip { display: inline-flex; align-items: center; flex: 0 0 auto; gap: 6px; padding: 5px 9px; border-radius: 9px; font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgb(var(--surface-rgb) / 30%); white-space: nowrap; }
.category-chip span { font-variant-numeric: tabular-nums; }
.category-chip[data-current="true"] { color: var(--accent-text); background: var(--control-hover); }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; }
.window-content { display: flex; flex-direction: column; min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { width: 100%; max-width: 648px; margin: 0 auto; padding: var(--content-gap) 24px 18px; outline: none; }
.workspace.is-active { margin-block: auto; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: var(--control-radius); background: var(--error-background); color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.resize-handle { position: absolute; z-index: 10; touch-action: none; }
.resize-North, .resize-South { left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
.resize-North { top: 0; }
.resize-South { bottom: 0; }
.resize-East, .resize-West { top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
.resize-East { right: 0; }
.resize-West { left: 0; }
.resize-NorthEast, .resize-NorthWest, .resize-SouthEast, .resize-SouthWest { width: 12px; height: 12px; }
.resize-NorthEast { top: 0; right: 0; cursor: nesw-resize; }
.resize-NorthWest { top: 0; left: 0; cursor: nwse-resize; }
.resize-SouthEast { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-SouthWest { bottom: 0; left: 0; cursor: nesw-resize; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--accent); color: var(--on-accent); border: 1px solid transparent; border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--accent-hover); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent-text); border-color: var(--line); justify-content: center; box-shadow: none; }
button.secondary:hover:not(:disabled) { background: var(--secondary-hover); }
button.text-button { width: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; box-shadow: none; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 27px; height: 30px; padding: 5px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .62)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }
.task-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.task-copy { min-width: 0; }
.task-copy h1 { margin: 0; font-size: 20px; font-weight: 550; letter-spacing: -.4px; }
.task-summary { margin: 7px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.meta-dot { margin-inline: 7px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; flex-shrink: 0; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(24px, 4.6vw, 34px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -.8px; line-height: 1.3; white-space: nowrap; }
.timer-long { font-size: clamp(18px, 3.5vw, 26px); }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 160px; overflow-y: auto; }
.actions { display: flex; align-items: center; gap: 20px; margin-top: calc(var(--content-gap) + 6px); }
.actions button { width: auto; justify-content: center; }
button.round-action { width: 42px; height: 42px; padding: 11px; flex: 0 0 auto; border-radius: 50%; }
.round-action .icon-pause { stroke-width: 3; }
.round-action .icon-play { fill: currentColor; stroke-width: 1; }
button.quiet-action { padding: 7px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); font-size: 12px; box-shadow: none; }
button.quiet-action:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button.quiet-action:not(.finish-action) { margin-inline: auto; }
.form-card { width: min(100%, 560px); margin: var(--content-gap) auto 0; }
.form-card h2 { font-size: 12px; color: var(--text-muted); font-weight: 500; margin: 0 0 9px; }
.work-form { display: grid; gap: 10px; }
.work-form > button { min-height: 34px; padding: 8px 12px; }
.form-note > summary { display: flex; align-items: center; gap: 5px; width: fit-content; font-size: 11px; list-style: none; }
.form-note > summary::-webkit-details-marker { display: none; }
.form-note .icon { width: 15px; height: 15px; }
.form-note[open] > summary { margin-bottom: 3px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / 96%); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 44px; max-height: 150px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: var(--control-radius); padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: var(--notice-text); background: var(--notice-background); border: 1px solid var(--notice-border); }
.notice p { margin: 0 0 6px; }
.error-banner { color: var(--error); background: var(--error-background); border: 1px solid var(--error-border); }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.field-error { display: block; margin-top: 6px; color: var(--error); font-size: 10px; overflow-wrap: anywhere; }
.field-count { display: block; text-align: right; margin-top: 4px; color: var(--text-muted); font-size: 10px; }
[aria-invalid="true"] { border-color: var(--error); }
.finished-card { border-color: var(--accent-text); }
.saved-feedback { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.switch-panel, .recent-panel, .connection-panel { margin-top: var(--content-gap); padding-top: 4px; font-size: 11px; }
.switch-panel { max-width: 560px; margin-inline: auto; }
summary { color: var(--text-muted); cursor: pointer; padding: 3px 0; }
details[open] > summary { margin-bottom: 15px; }
.connection-panel { margin-top: 15px; font-size: 10px; }
.connection-panel > p { font-size: 11px; }
.connection-panel button { margin-top: 10px; }
.record-list { list-style: none; padding: 0; margin: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list li:last-child { border-bottom: 0; }
.record-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
.record-heading strong { font-weight: 550; }
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent-text); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
.appearance-feedback { margin: 0 0 10px; color: var(--accent-text); }
.preview-notice { padding: 6px 9px; margin-bottom: 10px; font-size: 10px; }
.appearance-error-detail { font-size: 10px; }
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }
.theme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb)); border: 1px solid var(--line); }
.theme-sample span { height: 2px; width: 100%; background: var(--text-muted); border-radius: 2px; }
.theme-sample span:first-child { width: 60%; height: 4px; background: var(--accent); }
.theme-label { display: grid; gap: 5px; min-width: 0; }
.theme-label strong { font-size: 12px; font-weight: 600; }
.theme-label > span { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.opacity-heading { display: flex; align-items: center; justify-content: space-between; }
.opacity-heading output { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--accent-text); }
input.opacity-slider { padding: 0; margin: 10px 0 3px; border: 0; background: transparent; min-height: 24px; accent-color: var(--accent); cursor: pointer; }
.opacity-scale { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9px; }
button.reset-opacity { margin: 15px 0 0; padding: 6px 8px; font-size: 10px; }
.settings-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }
.settings-actions button { justify-content: center; }
.appearance-dialog > .notice, .appearance-dialog > .error-banner { margin: 14px 0 0; }
@media (max-width: 540px) {
  .brand-name { font-size: 12px; }
  .titlebar { gap: 8px; padding-inline: 10px; }
  .workspace { padding-inline: 14px; }
}
@media (max-width: 380px) {
  .titlebar { gap: 4px; padding-inline: 8px; }
  .titlebar-drag { gap: 6px; }
  .brand-name { font-size: 11px; }
  .brand-mark { width: 25px; height: 25px; }
  button.nav-button { width: 27px; }
  .main-nav { gap: 0; }
  .window-controls { gap: 0; }
  .titlebar .window-control { width: 24px; }
  .workspace { padding-inline: 10px; }
  .task-row { gap: 10px; }
  .timer-card { padding: var(--content-gap); }
  .task-copy h1 { font-size: 17px; }
  .actions { gap: 14px; }
}
@media (prefers-reduced-motion: reduce) { button { transition: none; } }
.history-entry { margin-top: 15px; }
.history-dialog, .delete-dialog { width: min(500px, calc(100% - 32px)); max-height: calc(100% - 32px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.history-dialog::backdrop, .delete-dialog::backdrop { background: rgb(0 0 0 / 25%); }
.history-filters { display: grid; gap: 10px; margin-top: 18px; }
.history-filters input, .history-filters select { padding: 9px 6px; font-size: 11px; }
.history-filters .hint { margin-top: 0; }
.filter-category-row { display: grid; grid-template-columns: 1fr 90px; gap: 12px; align-items: end; }
.filter-category-row button { justify-content: center; }
.history-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 18px 0 15px; }
.history-tabs button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--secondary-hover); }
.history-overview { font-size: 11px; line-height: 1.8; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; margin: 13px 0 18px; }
.summary-grid > div { min-width: 0; padding: 11px 7px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); }
.summary-grid dt { font-size: 10px; color: var(--text-muted); }
.summary-grid dd { margin: 7px 0 0; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.summary-grid small { font-size: 9px; font-weight: normal; }
.history-empty { margin: 15px 0; font-size: 12px; line-height: 1.9; color: var(--text-muted); }
.history-records { list-style: none; margin: 0; padding: 0; }
.history-records li { padding: 15px 0; border-bottom: 1px solid var(--line); }
.history-records .record-remark { max-height: 110px; overflow: auto; }
button.delete-link { margin: 9px 0 0 auto; color: var(--error); }
.history-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 18px; font-size: 10px; color: var(--text-muted); }
.history-pagination button { width: auto; padding: 8px 10px; font-size: 11px; }
.stats-section { margin-top: 20px; }
.stats-section h3 { font-size: 12px; font-weight: 600; }
.stats-scroll { overflow-x: auto; }
.stats-section table { width: 100%; border-collapse: collapse; font-size: 10px; font-variant-numeric: tabular-nums; }
.stats-section th, .stats-section td { padding: 9px 5px; border-bottom: 1px solid var(--line); text-align: right; overflow-wrap: anywhere; }
.stats-section th { font-weight: 500; }
.stats-section tr > :first-child { text-align: left; white-space: nowrap; }
.stats-section thead { color: var(--text-muted); }
.history-feedback { color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.delete-dialog { width: min(350px, calc(100% - 40px)); }
.delete-dialog h2 { margin: 0; font-size: 17px; }
.delete-dialog > p { font-size: 12px; line-height: 1.8; }
.delete-record-detail { padding: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 11px; line-height: 1.8; max-height: 160px; overflow: auto; }
button.danger-button { color: var(--error); background: var(--error-background); border-color: var(--error-border); }
button.danger-button:hover:not(:disabled) { background: var(--error-background); border-color: var(--error); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / 98%); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.ui-dialog::backdrop { background: rgb(0 0 0 / 18%); }
.density-settings { margin: 20px 0 0; padding: 0; border: 0; }
.density-settings legend { margin-bottom: 10px; font-size: 12px; }
.density-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.density-options button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--control-hover); }
.utilities-panel { margin-top: 20px; font-size: 11px; }
.utilities-panel > button { margin-top: 12px; }
.note-heading { margin-top: 20px; font-size: 13px; }
.settlement-entry { margin-top: 12px; }
.settlement-panel { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); }
.settlement-panel h2 { margin: 0; font-size: 16px; }
.settlement-panel .settings-heading .secondary { width: auto; flex-shrink: 0; font-size: 12px; line-height: 1.5; }
.settlement-record { padding: 12px 0; border-top: 1px solid var(--line); }
.settlement-record summary { cursor: pointer; }
.settlement-form { display: grid; gap: 12px; margin-top: 12px; }
.monitor-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; font-size: 10px; color: var(--text-muted); }
.monitor-status button { flex-shrink: 0; }
.monitor-settings { display: grid; gap: 12px; margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
.island-frame { padding: 5px; }
.island-shell { flex-direction: row; align-items: center; border-radius: 32px; padding: 0 8px 0 14px; }
.island-drag { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 100%; cursor: grab; }
.island-mark { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; color: var(--accent); border: 1px solid var(--window-border); font-weight: 700; }
.island-info { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.island-info strong, .island-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.island-info strong { font-size: 14px; }
.island-info small { font-size: 11px; color: var(--text-secondary); }
.island-time { font: 600 15px ui-monospace, monospace; white-space: nowrap; }
.island-open { flex: 0 0 30px; width: 30px; height: 30px; margin-left: 5px; padding: 0; border-radius: 50%; }
.island-error { color: var(--accent); font-weight: bold; }
````````

## UPDATE E:\WorkMemo\src\App.tsx

````````
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { ConnectionPanel } from "./ConnectionPanel";
import { DesktopWindow } from "./DesktopWindow";
import { AppearanceSettings } from "./AppearanceSettings";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { CATEGORIES, formatDuration, formatTime } from "./types";
import { workView } from "./workView";
import { HistoryPanel } from "./HistoryPanel";
import { useHistory } from "./useHistory";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import { SettlementPanel } from "./SettlementPanel";
import { MonitoringSettings } from "./MonitoringSettings";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [monitorOpen, setMonitorOpen] = useState(false);
  const [navigationError, setNavigationError] = useState("");
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const workspace = useRef<HTMLElement>(null);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const unavailable = !view.canOperate || session.busy;
  const refreshKey = `${session.dataVersion}:${session.snapshot?.pending_count ?? 0}:` + (session.snapshot?.recent_records.map((item) => `${item.id}:${item.end_time}:${item.revision}`).join(",") ?? "");
  // Reuse the existing read-only history query and its complete category aggregates.
  const categories = useHistory(session.native, refreshKey, session.recordDeleted);
  const selected = appearance.open ? "appearance" : historyOpen ? "history" : layoutOpen ? "layout" : "home";
  const pauseLabel = session.pending === "resume_task" ? "正在继续…" : session.pending === "pause_task" ? "正在暂停…"
    : active?.is_paused ? "继续工作" : "暂停";
  useEffect(() => {
    if (!session.native) return;
    let stopped = false; let unlisten: UnlistenFn | undefined;
    void listen("workmemo:open-settlement", () => { if (!stopped) setSettlementOpen(true); })
      .then(unsubscribe => { if (stopped) unsubscribe(); else unlisten = unsubscribe; })
      .catch((failure: unknown) => { if (!stopped) setNavigationError(String(failure)); });
    return () => { stopped = true; unlisten?.(); };
  }, [session.native]);

  return (
    <DesktopWindow appearanceStyle={themeStyle(appearance.current)} density={density}
      navigation={<nav className="main-nav" aria-label="主导航">
        <button type="button" className="nav-button" aria-label="首页" title="首页" aria-pressed={selected === "home"}
          onClick={() => { workspace.current?.focus(); workspace.current?.scrollIntoView({ block: "start" }); }}><Icon name="home" /></button>
        <button type="button" className="nav-button" aria-label="历史记录" title="历史记录" aria-pressed={selected === "history"}
          onClick={() => setHistoryOpen(true)}><Icon name="history" /></button>
        <button type="button" className="nav-button" aria-label="皮肤设置" title="皮肤设置" aria-pressed={selected === "appearance"}
          disabled={appearance.loading} onClick={appearance.begin}><Icon name="palette" /></button>
        <button type="button" className="nav-button" aria-label="布局设置" title="布局设置" aria-pressed={selected === "layout"}
          onClick={() => setLayoutOpen(true)}><Icon name="layout" /></button>
      </nav>}
      categories={<div className="category-strip" tabIndex={0} role="region" aria-label="最近30天已结束记录，横向滚动"
        onWheel={(event) => { if (event.deltaX === 0) event.currentTarget.scrollLeft += event.deltaY; }}
        aria-busy={categories.loading} title={categories.error ? "分类数量暂时无法读取" : "最近30天的已结束记录数，可横向滚动"}>
        {CATEGORIES.map((category) => <span className="category-chip" key={category} data-current={active?.category === category}>
          {category}<span>{categories.result
            ? `${categories.result.categories.find((row) => row.category === category)?.totals.records ?? 0}条` : "—"}</span>
        </span>)}
      </div>}>
    <main ref={workspace} tabIndex={-1} className={`workspace${active ? " is-active" : ""}`}>
      {appearance.notice && <p className="hint appearance-feedback" role="status">{appearance.notice}</p>}
      {appearance.loadError && <div className="notice" role="alert">
        <p>外观设置读取失败，暂时使用默认外观。工作记录不受影响。</p>
        <p className="appearance-error-detail">{appearance.loadError}</p>
        <button type="button" className="text-button" disabled={appearance.loading || appearance.open}
          onClick={() => { void appearance.reload(); }}>重新读取外观</button>
      </div>}
      {!session.native && <p className="notice preview-notice" role="status">浏览器预览 · 本地计时和保存请使用桌面应用</p>}
      {session.connectionError && <div className="error-banner" role="alert">
        <strong>无法读取或保存本地数据</strong>
        <p>{session.connectionError}</p>
        <p>显示为上次读取的状态，操作暂不可用。可先尝试刷新；若已打开另一个 WorkMemo，请使用原窗口。仍无法恢复时请重新打开应用。</p>
      </div>}
      {!session.connectionError && session.commandError && <p className="error-banner" role="alert">{session.commandError}</p>}
      {!session.connectionError && !session.commandError && session.snapshot?.warning
        && <p className="notice" role="alert">{session.snapshot.warning}</p>}
      {active?.recovery_pending && <p className="notice" role="status">
        已恢复上次未结束的任务，并保持暂停。应用关闭期间不计时，请确认后继续。
      </p>}
      {navigationError && <p className="error-banner" role="alert">托盘导航通知不可用：{navigationError}</p>}
      {session.native && <div className="monitor-status">
        <span role="status">{session.snapshot?.monitoring?.message || "正在读取监测状态…"}</span>
        <button type="button" className="text-button" onClick={() => setMonitorOpen(true)}>监测设置</button>
      </div>}
      {session.snapshot?.monitoring?.idle_warning && <p className="notice" role="status">已连续 {session.snapshot.monitoring.idle_warning_seconds} 秒没有输入，{session.snapshot.monitoring.idle_end_seconds} 秒时将自动结束。恢复操作后会取消提醒。</p>}

      <section className={`timer-card${view.mode === "finished" ? " finished-card" : ""}`}
        aria-label="当前工作" aria-busy={session.loading || session.busy}>
        <div className="task-row">
          <div className="task-copy">
            <h1>{record ? record.category : view.label}</h1>
            <p className="task-summary">
              {record ? <>数量 {formatQuantity(record.quantity)}<span className="meta-dot" aria-hidden="true">·</span>
                <span className={`state-label ${view.mode === "working" ? "working" : ""}`} role="status">{view.label}</span></>
                : view.caption}
            </p>
            {record && view.mode === "unavailable" && <p className="hint">{view.caption}</p>}
          </div>
          <output className={`timer${view.timer.length > 9 ? " timer-long" : ""}`} aria-label="有效工作时长" title={view.caption} aria-live="off">{view.timer}</output>
        </div>
        {record && <div className="actions">
          {active && <button type="button" className="round-action" disabled={unavailable} aria-label={pauseLabel} title={pauseLabel}
            onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}>
            <Icon name={active.is_paused ? "play" : "pause"} /><span className="sr-only">{pauseLabel}</span>
          </button>}
          <button type="button" className="quiet-action" onClick={() => setNoteOpen(true)} aria-label="查看任务备注">
            <Icon name="note" /><span>备注</span>
          </button>
          {active && <button type="button" className="quiet-action finish-action" disabled={unavailable} aria-label="结束并保存"
            onClick={() => { void session.finish(active.id); }}><Icon name="check" /><span>{session.pending === "finish_task" ? "正在保存…" : "结束计时"}</span></button>}
        </div>}
      </section>

      {!active && (session.snapshot || !session.native) && <section className="form-card" aria-label="开始新的工作">
        <h2 className="sr-only">{view.finished ? "开始下一项" : "开始一项工作"}</h2>
        <WorkForm disabled={unavailable} starting={session.pending === "start_task"} onStart={session.start} />
      </section>}
      {active?.is_paused && <details className="switch-panel">
        <summary>开始另一项工作</summary>
        <WorkForm disabled={unavailable} switching starting={session.pending === "start_task"} onStart={session.start} />
      </details>}

      {session.native && session.snapshot && <div className="settlement-entry">
        <button type="button" className="secondary" onClick={() => setSettlementOpen(open => !open)}>
          待补全工作量（{session.snapshot.pending_count}）</button>
      </div>}
      <SettlementPanel open={settlementOpen} onClose={() => setSettlementOpen(false)} refreshKey={refreshKey}
        busy={unavailable} onSave={session.settle} />

      <AppearanceSettings appearance={appearance} />
      <MonitoringSettings open={monitorOpen} onClose={() => setMonitorOpen(false)} onSaved={() => { void session.refresh(); }} />
      <UiDialog open={layoutOpen} onClose={() => setLayoutOpen(false)} id="layout-title" title="布局设置">
        <fieldset className="density-settings">
          <legend>显示间距</legend>
          <div className="density-options">
            <button type="button" className="secondary" aria-pressed={density === "compact"} onClick={() => setDensity("compact")}>紧凑</button>
            <button type="button" className="secondary" aria-pressed={density === "comfortable"} onClick={() => setDensity("comfortable")}>舒展</button>
          </div>
          <p className="hint">调整当前窗口的显示间距。</p>
        </fieldset>
        <details className="utilities-panel">
          <summary>连接与刷新</summary>
          <button className="secondary" type="button" disabled={!session.native || session.busy}
            onClick={() => { void session.refresh(); void categories.reload(); }}><Icon name="refresh" />刷新记录</button>
          <ConnectionPanel />
          <button type="button" className="secondary" disabled={!session.native || session.busy}
            onClick={() => { void invoke("exit_app").catch(failure => setNavigationError(String(failure))); }}>退出 WorkMemo</button>
        </details>
      </UiDialog>
      <UiDialog open={noteOpen && !!record} onClose={() => setNoteOpen(false)} id="note-title" title="任务详情与备注">
        {record && <>
          <p className="note-heading">{record.category} · 数量 {formatQuantity(record.quantity)}</p>
          <p className="hint">开始 {formatTime(record.start_time)}
            {record.end_time !== null && <><br />保存 {formatTime(record.end_time)}</>}</p>
          <p className="task-remark">{record.remark || "这项工作未填写备注。"}</p>
        </>}
      </UiDialog>
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} onDeleted={session.recordDeleted} refreshKey={refreshKey}>
        <details className="recent-panel">
          <summary>最近保存的记录</summary>
          {session.snapshot?.recent_records.length ? <ul className="record-list">
            {session.snapshot.recent_records.map((record) => <li key={record.id}>
              <div className="record-heading"><strong>{record.category} · {formatQuantity(record.quantity)} · {record.settlement_status === "PENDING" ? "待补全" : "已结算"}</strong>
                <span>{formatDuration(record.duration_seconds)}</span></div>
              <p className="hint">{formatTime(record.start_time)}<br />至 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
              {record.remark && <p className="record-remark">{record.remark}</p>}
            </li>)}
          </ul> : <p className="hint">{session.snapshot ? "还没有已结束的记录。结束计时后会保存在这台电脑上。" : "连接本地数据后可查看真实记录。"}</p>}
          <p className="hint">此处显示最近 5 条计时已结束的记录。</p>
        </details>
      </HistoryPanel>
    </main>
    </DesktopWindow>
  );
}

export default App;
````````

## UPDATE E:\WorkMemo\src\MonitoringSettings.tsx

````````
import { useEffect, useState, type FormEvent } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES, type MonitorConfig } from "./types";
import { UiDialog } from "./UiDialog";

type ConnectionStatus = { state: string; message: string; identifier: string; version: string; host_name: string; manifest_path: string | null; extension_path: string | null };

export function MonitoringSettings({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open || !isTauri()) return;
    let stale = false;
    setConnection(null);
    void invoke<ConnectionStatus>("get_connection_status").then(value => { if (!stale) setConnection(value); }).catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    setConfig(null); setError(""); setNotice("");
    void invoke<MonitorConfig>("get_monitor_config").then(value => { if (!stale) setConfig(value); })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, retry]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!config || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await invoke<MonitorConfig>("save_monitor_config", { input: {
        enabled: config.enabled, expected_revision: config.revision, times: config.times,
        rules: config.rules.map(({ url_prefix, category }) => ({ url_prefix, category })),
      } });
      setConfig(saved); setNotice("配置已保存。请在 Chrome 扩展中同步工作站点授权。"); onSaved();
    } catch (failure: unknown) { setError(String(failure)); }
    finally { setBusy(false); }
  }
  return <UiDialog open={open} onClose={() => { if (!busy) onClose(); }} id="monitor-settings-title" title="自动工作监测">
    {!isTauri() && <p className="notice">请在 Windows 桌面程序中配置监测。</p>}
    {error && <p className="error-banner" role="alert">{error}</p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {!config && isTauri() && <button className="secondary" type="button" onClick={() => setRetry(value => value + 1)}>读取监测配置</button>}
    {isTauri() && <section className="monitor-rule" aria-label="浏览器连接诊断">
      <p role="status">{connection?.message ?? "正在检查本机连接…"}</p>
      {connection && <details><summary>连接详情</summary><p className="hint">版本 {connection.version} · {connection.identifier}<br />主机 {connection.host_name}<br />清单 {connection.manifest_path ?? "尚未就绪"}</p></details>}
      <button type="button" className="secondary" disabled={repairing} onClick={() => {
        setRepairing(true); setError("");
        void invoke<ConnectionStatus>("repair_browser_connection").then(setConnection).catch((failure: unknown) => setError(String(failure))).finally(() => setRepairing(false));
      }}>{repairing ? "正在修复…" : "修复本机连接"}</button>
      <button type="button" className="text-button" onClick={() => { void invoke("open_browser_extension").catch((failure: unknown) => setError(String(failure))); }}>打开配套扩展文件夹</button>
      <p className="hint">Chrome 扩展需加载一次本目录。EXE、ZIP 和源码版启动时均会检查并修复当前用户的本机主机注册。</p>
    </section>}
    {config && <form className="monitor-settings" onSubmit={(event) => { void save(event); }}>
      <label className="monitor-toggle"><input type="checkbox" checked={config.enabled} disabled={busy}
        onChange={event => setConfig({ ...config, enabled: event.target.checked })} />启用工作页面自动识别</label>
      <p className="hint">浏览器前台工作页面匹配，并有新的输入活动时开始。仅打开页面不会开始。手动计时也受空闲保护。</p>
      <fieldset className="monitor-rule"><legend>计时参数（秒）</legend>
        {([
          ["away_pause_seconds", "离开工作页面后继续计时"],
          ["hold_seconds", "暂停后保留记录"],
          ["idle_warning_seconds", "无输入后提醒"],
          ["idle_end_seconds", "无输入后结束"],
        ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min={1} max={86400} step={1} required disabled={busy}
          value={config.times[key]} onChange={event => setConfig({ ...config, times: { ...config.times, [key]: event.target.valueAsNumber } })} /></label>)}
        <p className="hint">每项 1 至 86400 秒；空闲提醒须早于空闲结束。离页宽限后暂停，再等待保留期结束记录。连接中断时不计入无法确认的时间；保留期同样适用。空闲结束可能更早发生。</p>
      </fieldset>
      {config.rules.map((rule, index) => <fieldset key={rule.id} className="monitor-rule">
        <legend>工作页面 {index + 1}</legend>
        <label>工作 URL<input type="url" required maxLength={2048} disabled={busy} value={rule.url_prefix}
          placeholder="https://工作站点/路径" onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, url_prefix: event.target.value } : item) })} /></label>
        <label>默认类别<select value={rule.category} disabled={busy} onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, category: event.target.value } : item) })}>
          {CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
        <button type="button" className="text-button" disabled={busy} onClick={() => setConfig({ ...config, rules: config.rules.filter((_, i) => i !== index) })}>移除这条配置</button>
      </fieldset>)}
      <button type="button" className="secondary" disabled={busy || config.rules.length >= 50} onClick={() => setConfig({ ...config, rules: [...config.rules, { id: -Date.now(), url_prefix: "", category: "评测" }] })}>添加工作 URL</button>
      <p className="hint">匹配精确站点及路径边界；查询参数和片段不参与匹配。保存监测配置会暂停当前自动记录；重新确认工作页面并产生新的输入后才会恢复。</p>
      <button type="submit" disabled={busy}>{busy ? "正在保存…" : "保存监测配置"}</button>
      <details><summary>连接与隐私说明</summary>
        <p className="hint">第一版配套 Chrome 扩展。安装扩展和本机通信主机后，在扩展面板同步已配置站点授权。只传规则标识、前台匹配状态和连接状态；不传 URL、网页内容或输入文本。连接断开时暂停自动累计。</p>
        <p className="hint">离开工作页面后按设置暂停并保留记录。空闲结束时扣除最后输入后的尾段，阅读或思考可能少计，可稍后人工修正。</p>
      </details>
    </form>}
  </UiDialog>;
}
````````

## UPDATE E:\WorkMemo\src\NotificationApp.tsx

````````
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { SettlementForm } from "./SettlementPanel";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { formatDuration, type Snapshot, type WorkNotice, type SettleInput } from "./types";
import "./App.css";

export function NotificationApp() {
  const appearance = useAppearance();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  useEffect(() => {
    let stopped = false; let reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      try {
        const [value, current] = await Promise.all([invoke<WorkNotice | null>("get_notice"), invoke<Snapshot>("get_snapshot")]);
        if (!stopped) { setNotice(value); setSnapshot(current); setReadError(""); }
      }
      catch (failure: unknown) { if (!stopped) { setSnapshot(null); setReadError(String(failure)); } }
      finally { reading = false; }
    }
    void refresh(); const timer = window.setInterval(() => { void refresh(); }, 1000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, []);
  const key = notice ? `${notice.kind}:${notice.record.id}` : "";
  useEffect(() => { if (key) void appearance.reload(); }, [key]);
  useEffect(() => {
    let stopped = false;
    let unlisten: (() => void) | undefined;
    void listen("workmemo:appearance-changed", () => { void appearance.reload(); }).then(fn => { if (stopped) fn(); else unlisten = fn; });
    return () => { stopped = true; unlisten?.(); };
  }, [appearance.reload]);
  async function later() {
    if (!notice || busy) return;
    setBusy(true); setError("");
    try { await invoke("defer_notice", { id: notice.record.id, kind: notice.kind }); setNotice(null); }
    catch (failure: unknown) { setError(String(failure)); }
    finally { setBusy(false); }
  }
  async function save(input: SettleInput) {
    if (busy) return false;
    setBusy(true); setError("");
    try {
      await invoke<Snapshot>("settle_record", { input });
      await invoke("defer_notice", { id: input.id, kind: "ended" });
      setNotice(null); return true;
    } catch (failure: unknown) { setError(String(failure)); return false; }
    finally { setBusy(false); }
  }
  const active = snapshot?.active;
  const state = active?.recovery_pending ? "上次工作待恢复"
    : active?.pause_reason === "MANUAL" ? "手动暂停 · 已停表"
    : active?.pause_reason === "AWAY" ? "离页暂停 · 已停表"
    : active?.pause_reason === "MONITOR" ? "监测中断 · 已停表"
    : active?.is_paused ? "已暂停 · 已停表"
    : snapshot?.monitoring.idle_warning ? "空闲提醒 · 暂计"
    : snapshot?.monitoring.away_pause_remaining_seconds != null ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
    : active?.control_mode === "AUTO" ? "自动记录中 · 暂计" : "手动计时 · 暂计";
  if (!notice) return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}><div className="app-shell island-shell">
    <div className="island-drag" onMouseDown={event => { if (event.button === 0) void getCurrentWindow().startDragging().catch(() => {}); }} aria-label="拖动状态岛">
      <span className="island-mark">C</span><span className="island-info"><strong>{active?.category ?? "状态读取中"}</strong><small>{snapshot ? (active ? state : "无活动任务") : "状态不可用"}</small></span>
      <strong className="island-time">{active ? formatDuration(active.duration_seconds) : "--:--:--"}</strong>
    </div>
    <button type="button" className="island-open" onClick={() => { void invoke("show_main", { settlement: false }).catch(failure => setError(String(failure))); }} aria-label="打开 WorkMemo">↗</button>
    {(error || readError) && <span className="island-error" role="alert" title={[error, readError].filter(Boolean).join("；")}>!</span>}
  </div></div>;
  return <div className="desktop-frame notice-frame" style={themeStyle(appearance.current)}><div className="app-shell">
    <header className="notice-titlebar"><span onMouseDown={event => { if (event.button === 0) void getCurrentWindow().startDragging().catch(() => {}); }}>WorkMemo 工作提醒</span>
      <button className="secondary" type="button" disabled={!notice || busy} onClick={() => { void later(); }}>稍后</button></header>
    <main className="notice-content">
      {error && <p className="error-banner" role="alert">{error}</p>}
      {readError && <p className="error-banner" role="alert">读取状态失败：{readError}</p>}
      {notice?.kind === "idle" && <section aria-label="空闲提醒">
        <h1>已连续 {formatDuration(notice.idle_warning_seconds)} 没有输入活动</h1>
        <p>到达 {formatDuration(notice.idle_end_seconds)} 时将结束本次计时，最后一次输入后的尾段不计入有效工时。恢复操作后会取消此提醒。</p>
        <p>当前暂计 {formatDuration(notice.record.duration_seconds)}</p>
        <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了，继续稍后处理</button>
      </section>}
      {notice?.kind === "ended" && <section aria-label="工作结束提醒">
        <h1>本次工作已结束，请填写工作量</h1>
        <p className="hint">结果已保存。稍后填写不会影响下一段工作。</p>
        <SettlementForm key={`${notice.record.id}:${notice.record.revision}`} record={notice.record} busy={busy} onSave={save} />
        <button type="button" className="secondary" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
      </section>}
      {!notice && <p role="status">提醒已处理，正在更新。</p>}
      <button type="button" className="text-button" onClick={() => { void invoke("show_main", { settlement: true }).catch(failure => setError(String(failure))); }}>打开 WorkMemo 待补全列表</button>
    </main>
  </div></div>;
}
````````

## UPDATE E:\WorkMemo\src\types.ts

````````
export const CATEGORIES = ["评测", "质检", "开发", "文档"] as const;

export interface WorkRecord {
  id: number;
  category: string;
  quantity: number | null;
  remark: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  duration_ms: number;
  status: "NOT_STARTED" | "WORKING" | "FINISHED";
  is_paused: boolean;
  recovery_pending: boolean;
  settlement_status: "IN_PROGRESS" | "PENDING" | "COMPLETE";
  source: "AUTO" | "MANUAL_START" | "MANUAL_ENTRY";
  pause_reason: "MANUAL" | "APP_CLOSE" | "RECOVERY" | "AWAY" | "MONITOR" | null;
  confirmed_end_time: number | null;
  last_input_time: number | null;
  end_reason: string | null;
  legacy_duration_ms: number;
  revision: number;
  control_mode: "AUTO" | "MANUAL";
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
  pending_count: number;
  monitoring: MonitorStatus;
}

export interface StartInput {
  category: string;
  quantity: number | null;
  remark: string;
}

export interface MonitorStatus {
  enabled: boolean;
  browser_connected: boolean;
  native_available: boolean;
  work_page: boolean;
  idle_warning: boolean;
  message: string;
  revision: number;
  idle_warning_seconds: number;
  idle_end_seconds: number;
  away_pause_remaining_seconds: number | null;
}
export interface WorkUrl { id: number; url_prefix: string; category: string }
export interface TrackingTimes { idle_warning_seconds: number; idle_end_seconds: number; away_pause_seconds: number; hold_seconds: number }
export interface MonitorConfig { enabled: boolean; revision: number; rules: WorkUrl[]; times: TrackingTimes }
export interface WorkNotice { kind: "idle" | "ended"; record: WorkRecord; idle_warning_seconds: number; idle_end_seconds: number }

export interface SettleInput {
  id: number;
  expected_revision: number;
  category: string;
  quantity: number;
  remark: string;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatTime(milliseconds: number): string {
  return new Date(milliseconds).toLocaleString("zh-CN", { hour12: false });
}
````````

## NEW FILE E:\WorkMemo\src-tauri\migrations\004_tracking_times.sql

````````
ALTER TABLE monitoring_settings ADD COLUMN idle_warning_seconds INTEGER NOT NULL DEFAULT 300 CHECK(idle_warning_seconds BETWEEN 1 AND 86400);
ALTER TABLE monitoring_settings ADD COLUMN idle_end_seconds INTEGER NOT NULL DEFAULT 420 CHECK(idle_end_seconds BETWEEN 1 AND 86400);
ALTER TABLE monitoring_settings ADD COLUMN away_pause_seconds INTEGER NOT NULL DEFAULT 120 CHECK(away_pause_seconds BETWEEN 1 AND 86400);
ALTER TABLE monitoring_settings ADD COLUMN hold_seconds INTEGER NOT NULL DEFAULT 600 CHECK(hold_seconds BETWEEN 1 AND 86400);
````````

## NEW FILE E:\WorkMemo\docs\ISLAND-AND-TIMING-PHASE1.md

````````
# 灵动岛首阶段与计时参数

日期：2026-10-27（Asia/Shanghai）。用户要求继续灵动岛方案，并允许修改关闭工作页面后多久停止记录等参数。本轮完成首阶段源码与检查；后续事件提示及原生验收仍需单独确认，不自动进入下一阶段。

## 当前行为

- 复用现有提醒窗口：有活动任务时显示常驻状态胶囊，后端快照提供类别、时长和暂停原因；离页宽限倒计时来自后端。入口按钮打开主窗口。无任务及提醒时隐藏。拖动位置和托盘开关存于独立的 island.json；提醒优先显示，隐藏状态岛不会清除待补全记录。皮肤通过外观保存事件同步。空闲和结束时仍沿用已有提醒与结算界面。
- 监测设置四个参数以秒为单位：离页后继续计时、暂停后保留记录、无输入后提醒、无输入后结束。允许 1–86400 的整数，空闲提醒须早于空闲结束；旧设置迁移默认分别为 120、600、300、420 秒。
- 离页时间到后暂停计时，保留期届满才结束记录；空闲结束可能更早。浏览器连接中断会停止累计无法确认的时间，不按离页宽限盲目记时。保存监测设置会暂停当前自动记录，重新确认工作页面并产生新输入后才恢复。
- SQLite schema 4 通过迁移保存参数，迁移保留旧设置与记录。旧版软件可能无法打开已升级的数据库，升级前应备份数据库；不得用旧版重置或覆盖它。

## 检查与限制

- npm test：31 项通过；cargo test --locked --offline：77 项库测试、2 项主机协议测试、2 项集成测试、1 项注册测试通过；npm run build、cargo fmt --check 通过。参数测试覆盖旧 schema 迁移、重启后保存、修改后的截止时间、保存设置后的旧截止状态、连接中断保护等。
- 使用独立应用标识和独立数据目录构建隔离 Windows 测试程序，运行目录不含浏览器 helper，以避免修改真实浏览器注册。隔离构建及增量构建成功。尝试启动后的桌面操作被用户物理 Escape 中断，未完成窗口检查；因此不声称 GUI 启动、透明、不抢焦点、位置、多屏或四皮肤的原生验收通过。隔离测试进程可能仍在运行，未强制终止。
- 开始/恢复的一次性提示、事件去重和计划中的完整展开操作属于后续阶段，尚未交付。实际 Chrome 页面关闭后的端到端联调、不同 DPI 和多显示器亦未验收。本轮未新建、覆盖或发布安装包，现有 alpha.4 下载不包含本轮改动。

## 命令与验收步骤

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
npm.cmd run tauri dev
```

最后一条使用正式数据目录及本机浏览器接入配置；实际操作前先备份数据，并了解 schema 升级与旧版兼容限制。完整源码环境见 BUILDING.md。手动验证时可在监测设置选择较短但合理的阈值，保存后确认工作页和新输入，依次验证离页宽限、停表、保留期结束与待补全；再测试空闲先到、浏览器断连、托盘开关、拖动及重启恢复。仅使用隔离测试记录，不应为测试结束或删除真实任务。

完整文件路径及代码见 ISLAND-AND-TIMING-SOURCE.md；开发前已有的未跟踪 DYNAMIC-ISLAND-PLAN.md 保留，不作为本次改动覆盖。
````````
