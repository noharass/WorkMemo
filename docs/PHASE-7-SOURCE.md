# 第七阶段完整源码与开发说明

以下完整收录本阶段变更的源文件和开发说明。原文件可直接编辑运行，测试仅写独立临时目录。阶段报告和清单保留在对应文档中，文档不递归嵌入自身。

## UPDATE — E:\WorkMemo\AGENTS.md

````
# WorkMemo 开发约束

- 开发前阅读 `docs/PRODUCT-SPEC.md`，这是用户提供的完整长期产品规范。
- 固定技术栈：Tauri 2、React、TypeScript、Vite、Rust、SQLite；保持轻量依赖。
- 优先级：数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
- 先检查实际文件、实现与启动状态，再制定最小改动；不覆盖可靠的已有功能。
- 按阶段开发，每阶段结束后总结并等待用户确认，不自动跨入下一阶段。
- 用户已确认进入第七阶段：业务、窗口、换肤和数据恢复的综合验收。完成后等待确认，不自动进入第八阶段修复优化和最终交付。
- 不使用虚构记录、统计数据或装饰性按钮，不把未完成的功能包装为可用功能。
- Rust 校验并持久化业务数据，使用 SQLite；外观设置与工作记录分开管理。
- 同时只能有一个活动任务；暂停不计时；重启必须处理未完成任务。
- 计时不能只靠前端逐秒累加，必须基于真实时间和状态。
- 原生透明与 Glass / Cream / Dark / Neon 四种皮肤是必需功能，CSS 透明不能代替原生验证。
- 权限仅授予当前功能确实需要的范围。
- 只有实际执行过的启动、构建和测试才能报告为通过。
- 中文交付包含目标、检查结果、完整路径及 NEW FILE / UPDATE、完整代码、PowerShell 命令、测试方法与预期、兼容性和 Git 命令。
- 完整代码保存在项目文件中，较长交付另提供完整源码清单，不能用省略号代替代码。
- 当前阶段进度见 `docs/PHASE-7.md`，已有阶段记录保留在 docs 中，启动方式见 `README.md`。

## GitHub 同步约定

- 用户已授权：每个明确完成的开发步骤或阶段，在完成适当检查并记录结果后，创建 Git 提交并推送到 `origin`；不需要重复询问是否推送。
- 本项目仓库为 `https://github.com/noharass/WorkMemo`，默认分支 `main`。修改远程地址、公开范围或进行破坏性操作需要新的明确授权。
- 提交身份只在当前仓库设置，使用用户提供的身份；不修改全局 Git 身份。
- 推送前检查暂存区，不提交依赖目录、构建产物、本地工作数据库、凭据或环境私密配置。
- 验收受限或未通过的项目必须如实记录。保存当前开发进度不代表相关功能已经验收通过。
- 不强制推送。远程有新提交时，先检查并安全整合，不能覆盖远程历史。
- 推送后比较本地提交和远程分支的提交标识，并检查工作区状态，确认同步结果。
- 认证、网络或冲突导致推送失败时，保留本地提交并明确报告，不声称已同步，也不将凭据写入文件或远程 URL。
````

## UPDATE — E:\WorkMemo\README.md

````
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前处于第七阶段综合验收。应用提供历史查询、删除确认及数量和有效时长汇总；保留可靠计时、原生透明窗口、Glass/Cream/Dark/Neon 四种皮肤和独立外观配置。支持开始、暂停、继续、结束、暂停后切换任务，以及未结束任务恢复为暂停。主界面显示最近 5 条真实完成记录，并保留基础连接检查。
本机验收结果、实际检查限制和跨环境待验收项见 docs/PHASE-7.md，未将本机测试等同于所有 Windows 环境验证。

## Windows 环境

- Node.js：使用与 Vite 兼容的版本，本机为 Node 24。
- Rust stable 的 x86_64-pc-windows-msvc 工具链。
- Visual Studio 2022 C++ Build Tools 和 Windows SDK。
- Microsoft Edge WebView2 Runtime。

安装工具链后重新打开 PowerShell，以刷新 PATH。
环境依据：https://v2.tauri.app/start/prerequisites/

## PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
npm ci
npm run tauri dev
```

原生窗口应显示任务表单；基础连接检查折叠面板中的「重新检查」仍会调用 Rust。
标题栏左侧可拖动窗口；右侧提供最小化与保存关闭，输入区不参与拖动。拖动窗口边缘或四角可缩放，内容区可滚动。窗口保留任务栏入口，不强制置顶。
用户已在本机确认透明效果、文字可读性、移动、缩放和最小化恢复正常；其他实际验收结果见 docs/PHASE-3.md。
用户已确认保存关闭正常退出，正式版已在开发服务器关闭后独立启动并读取本地记录。

```powershell
npm run build
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
npm run test:themes
npm run test:workflow
npm run test:history
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
构建不生成安装包；正式安装包在后续阶段验收。当前阶段实际验证结果见 docs/PHASE-7.md。

`npm run dev` 仅为浏览器预览，不能证明原生能力，页面会明确提示预览模式。

## 文件关系

- src/：React 界面、表单、任务接口与轮询逻辑，不保存业务数据。
- src-tauri/src/database.rs：任务状态机、SQLite 校验与事务。
- src-tauri/src/clock.rs：单调时钟与实际日期时间。
- src-tauri/src/service.rs：Tauri 命令、后台检查点与关闭保存。
- src-tauri/migrations/：按 user_version 管理的数据库结构。
- src-tauri/tauri.conf.json：窗口、构建、安全配置。
- src-tauri/capabilities/：仅开放保存错误通知的事件订阅及移动、缩放、最小化、关闭所需窗口权限，不向界面开放文件系统或 SQL。
- src/DesktopWindow.tsx：自定义标题栏、窗口控制和边缘缩放，关闭使用 Tauri close 保留保存事件。
- src/themes.ts：四种皮肤的完整设计令牌；src/useAppearance.ts：预览、取消、加载和保存状态。
- src/AppearanceSettings.tsx：外观选择、滑块及保存面板；src-tauri/src/appearance.rs：独立配置校验与文件保存。
- src/workInput.ts：开始任务的前端字段校验；src/workView.ts：根据真实快照派生界面状态和保存确认。
- src/HistoryPanel.tsx：筛选、历史列表、确认删除和统计面板；src/useHistory.ts：历史查询与删除异步状态；src/history.ts：查询类型、日期校验和显示辅助。
- src-tauri/src/history.rs：沿用 Store 的历史只读事务和已完成记录删除；src-tauri/src/history_tests.rs：独立临时数据库回归测试。
- src-tauri/src/reliability_tests.rs：长期状态序列、真实子进程退出恢复、失败保存保护及 1 万条记录隔离测试；只编译到测试程序，不进入桌面程序。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
- docs/PHASE-3.md：原生透明、窗口操作与实际验收记录。
- docs/PHASE-4.md：换肤、外观持久化、测试及文件清单。
- docs/PHASE-5.md：主界面反馈、表单校验、实际测试与完整源码交付。
- docs/PHASE-6.md：历史查询、删除、统计口径与实际验收；完整文件清单和源码见同名前缀的 FILES、SOURCE 文档。
- docs/PHASE-7.md：综合验收矩阵、故障测试方法、实际结果及剩余限制；同名前缀 FILES、SOURCE 提供文件与完整变更源码。
- AGENTS.md：后续开发约束。
- package-lock.json / src-tauri/Cargo.lock：锁定前后端依赖。

开发顺序：可靠持久化与计时 → 原生透明 → 主题 → 主界面 → 历史统计 → 综合验收。
每阶段结束后等待用户确认。

## 主界面状态

启动读取完成前及连接失败时，不把未知数据显示为准备开始；连接中断保留上次读取的任务和时长并禁用业务操作。前端每秒重新读取后端有效时长，不自行逐秒累加。

各业务按钮提交期间会显示正在开始、暂停、继续或保存，并禁止重复提交。结束命令成功且返回同 id、FINISHED、带结束时间的真实记录后，保留本次时长、数量与保存时间，并提示已保存在本机。开始下一项后清除本次完成提示；重启只读取真实记录，不伪造上次操作成功提示。

类别、数量与备注错误分别在字段旁提示，并将焦点移到首个错误字段。备注按 Unicode 字符计数，最多 2000 字符；后端仍保留最终校验。保存失败保留输入和现有任务，显示错误，不显示保存成功。

## 历史与统计

点击主界面下方「查看历史与统计」打开轻量面板。默认最近 30 个本地日历日，可按起止日期（两端包含）及类别查询任意更早记录；单次最多 366 天，每页 20 条，按开始时间和 id 倒序。日期范围是单次返回量限制，不会删除或限制历史保存。

只统计 FINISHED 记录；进行中和暂停任务不计入汇总，也不能在历史中删除。工作日期按电脑本地时区的开始日归属；跨午夜记录整条归入开始日，不把暂停或关闭期间计入有效时长。更改系统时区可能改变历史日期分组。

全部已完成总览始终覆盖整个数据库，当前范围汇总、每日汇总和类别汇总覆盖全部筛选结果，均不限于当前页。数量直接相加，浮点显示保留最多 12 位有效数字；时长先合计毫秒再取整显示到秒。没有记录时显示空状态，不填充示例数据。

删除先展示具体类别、数量、起止时间、有效时长和备注，默认焦点在取消；再次确认才调用后端。删除不可撤销。成功后重新读取列表和统计，主界面即时移除该记录，过期刷新结果不能重新显示它；失败保留记录并显示原因。查询或重读失败显示错误，不把失败伪装成零记录。

历史沿用同一 SQLite 连接、锁和数据表；记录、计数及统计在同一只读事务中生成，删除在单独事务中限定 FINISHED。没有新增通用 SQL、文件系统权限或第二套数据存储。

## GitHub 同步

仓库：https://github.com/noharass/WorkMemo

每个明确完成的开发步骤或阶段，在检查并记录实际结果后提交、推送到 main。
同步操作不替代阶段验收；未完成的原生交互验收在阶段文档中保留。
同步规则见 AGENTS.md，操作说明见 docs/GITHUB-SYNC.md。

## 数据与恢复规则

数据库位于 Windows 当前用户的本地应用数据目录，默认是
`%LOCALAPPDATA%\com.workmemo.desktop\workmemo.sqlite3`，不在 Git 仓库中。
数据库使用 WAL；应用打开期间请勿单独移动数据库文件或删除其 -wal/-shm 文件。

Rust 使用单调时钟计算有效时长，每秒尝试保存检查点；暂停不计时。
正常关闭会保存并暂停当前任务。重新打开时，未完成任务保持原 id 并恢复为暂停，关闭期间不计时。
异常退出只恢复最后成功保存的检查点，不能保证最后一秒绝不丢失；调度或磁盘问题可能使检查点间隔更长。
不要用手机时间与记录起止时间之差代替有效工作时间。
Windows 仅允许一个进程持有同一数据目录的锁，第二个窗口会显示错误并保持数据不变。

## 透明窗口

Tauri 窗口配置 transparent=true、decorations=false、backgroundColor=#00000000；HTML、body、根节点和外围容器均保持透明。只有圆角面板使用半透明背景，文字保持不透明。禁用 Windows 原生阴影，使用面板内的 CSS 轻阴影；noRedirectionBitmap 用于缓解 Windows 透明窗口初始白闪。
点击「外观 · 当前皮肤」打开设置。切换皮肤与滑块会即时预览，点击「保存外观」后下次沿用；取消、右上角关闭或 Esc 会还原到上次保存的外观。
背景不透明度范围 80%–100%，仅影响面板背景，文字和可用按钮不整体变淡。可恢复当前皮肤的默认值：Glass 82%、Cream 88%、Dark 94%、Neon 90%。
外观保存到 `%APPDATA%\com.workmemo.desktop\appearance.json`，与本地工作 SQLite 分开。临时文件写入并同步后再替换原配置；损坏配置在明确保存修复前会备份，较新版本配置不会覆盖。
浏览器只支持预览，不能保存桌面配置，也不能证明原生透明效果。重开恢复的实际验收状态见阶段报告。
````

## UPDATE — E:\WorkMemo\src-tauri\src\database.rs

````
use crate::clock::{Clock, TimePoint};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use std::{fs::File, path::Path, time::Duration};

pub type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Debug, Serialize)]
pub struct WorkRecord {
    pub id: i64,
    pub category: String,
    pub quantity: f64,
    pub remark: String,
    /// Unix milliseconds; durations use the independent monotonic clock.
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub duration_seconds: i64,
    pub duration_ms: i64,
    pub status: String,
    pub is_paused: bool,
    pub recovery_pending: bool,
}

#[derive(Debug, Deserialize)]
pub struct StartInput {
    pub category: String,
    pub quantity: f64,
    pub remark: String,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub active: Option<WorkRecord>,
    pub recent_records: Vec<WorkRecord>,
    pub warning: Option<String>,
}

struct Segment {
    id: i64,
    base_ms: i64,
    started_ticks: i64,
}

pub struct Store {
    connection: Connection,
    clock: Box<dyn Clock>,
    segment: Option<Segment>,
    pub warning: Option<String>,
    // Keep the Windows share-mode lock alive for the entire database session.
    _instance_lock: Option<File>,
}

const COLUMNS: &str = "id, category, quantity, remark, start_time, end_time,
    duration_seconds, duration_ms, status, is_paused, recovery_pending";

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
            .execute_batch("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;")
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
                tx.pragma_update(None, "user_version", 1)
                    .map_err(db_error)?;
            }
            1 => {}
            _ => return Err("数据库来自较新版本，请使用较新版本的 WorkMemo；未修改数据。".into()),
        }
        // Never infer work while the application was closed from wall-clock time.
        tx.execute(
            "UPDATE work_records SET is_paused=1, recovery_pending=1 WHERE status='WORKING'",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(Self {
            connection,
            clock,
            segment: None,
            warning: None,
            _instance_lock: lock,
        })
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
        let duration = self.elapsed(&record, self.clock.now())?;
        let changed = self.connection.execute(
            "UPDATE work_records SET duration_ms=?1, duration_seconds=?2 WHERE id=?3 AND status='WORKING' AND is_paused=0",
            params![duration, duration / 1000, record.id],
        ).map_err(db_error)?;
        if changed != 1 {
            return Err("计时保存失败，任务状态已变更。".into());
        }
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
        })
    }

    pub fn start(&mut self, input: StartInput) -> Result<()> {
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if !input.quantity.is_finite() || input.quantity <= 0.0 || input.quantity > 1_000_000_000.0
        {
            return Err("数量必须大于 0，且不超过 10 亿。".into());
        }
        let remark = input.remark.trim();
        if remark.chars().count() > 2000 {
            return Err("备注不能超过 2000 个字符。".into());
        }
        let previous = self.active()?;
        if previous.as_ref().is_some_and(|r| !r.is_paused) {
            return Err("请先暂停或结束当前任务。".into());
        }
        let now = self.clock.now();
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        if let Some(previous) = previous {
            tx.execute("UPDATE work_records SET status='FINISHED', end_time=?1, recovery_pending=0 WHERE id=?2",
                params![now.wall_ms.max(previous.start_time), previous.id]).map_err(db_error)?;
        }
        tx.execute("INSERT INTO work_records(category, quantity, remark, start_time, status, is_paused) VALUES(?1,?2,?3,?4,'WORKING',0)",
            params![input.category, input.quantity, remark, now.wall_ms]).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            base_ms: 0,
            started_ticks: now.ticks_ms,
        });
        self.warning = None;
        Ok(())
    }

    pub fn pause(&mut self, id: i64) -> Result<()> {
        let record = self.current(id)?;
        if record.is_paused {
            return Ok(());
        }
        let duration = self.elapsed(&record, self.clock.now())?;
        self.connection.execute("UPDATE work_records SET is_paused=1, duration_ms=?1, duration_seconds=?2 WHERE id=?3",
            params![duration, duration / 1000, id]).map_err(db_error)?;
        self.segment = None;
        self.warning = None;
        Ok(())
    }

    pub fn resume(&mut self, id: i64) -> Result<()> {
        let record = self.current(id)?;
        if !record.is_paused {
            return Ok(());
        }
        let now = self.clock.now();
        self.connection
            .execute(
                "UPDATE work_records SET is_paused=0, recovery_pending=0 WHERE id=?1",
                [id],
            )
            .map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            base_ms: record.duration_ms,
            started_ticks: now.ticks_ms,
        });
        self.warning = None;
        Ok(())
    }

    pub fn finish(&mut self, id: i64) -> Result<()> {
        if self.record(id)?.status == "FINISHED" {
            return Ok(());
        }
        let record = self.current(id)?;
        let now = self.clock.now();
        let duration = self.elapsed(&record, now)?;
        self.connection
            .execute(
                "UPDATE work_records SET status='FINISHED', is_paused=1, recovery_pending=0,
            duration_ms=?1, duration_seconds=?2, end_time=?3 WHERE id=?4",
                params![
                    duration,
                    duration / 1000,
                    now.wall_ms.max(record.start_time),
                    id
                ],
            )
            .map_err(db_error)?;
        self.segment = None;
        self.warning = None;
        Ok(())
    }

    pub fn pause_for_close(&mut self) -> Result<()> {
        if let Some(record) = self.active()? {
            self.pause(record.id)?;
        }
        Ok(())
    }
}

#[cfg(test)]
#[path = "database_tests.rs"]
mod tests;

#[path = "history.rs"]
mod history;
pub use history::{HistoryPage, HistoryQuery};

#[cfg(test)]
#[path = "reliability_tests.rs"]
mod reliability_tests;
````

## NEW FILE — E:\WorkMemo\src-tauri\src\reliability_tests.rs

````
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
        let path =
            std::env::temp_dir().join(format!("workmemo-phase7-{}-{nonce}", std::process::id()));
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
        quantity,
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
            assert_eq!(active.quantity, quantity);
        }
        store.finish(id).unwrap();
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
    clock.advance(86_400_000);
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
            let mut insert = tx.prepare("INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused)
                VALUES(?1,1.25,'隔离容量测试',?2,?2+1250,1250,1,'FINISHED',1)").unwrap();
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
````
