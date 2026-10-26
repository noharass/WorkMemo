# 第六阶段完整源码与配置

以下是本阶段全部变更源码、测试、配置和开发说明的完整内容，原件可直接编辑运行。阶段报告、文件清单及 PNG 分别保存在对应路径；文档不递归嵌入自身。

## UPDATE — E:\WorkMemo\AGENTS.md

````
# WorkMemo 开发约束

- 开发前阅读 `docs/PRODUCT-SPEC.md`，这是用户提供的完整长期产品规范。
- 固定技术栈：Tauri 2、React、TypeScript、Vite、Rust、SQLite；保持轻量依赖。
- 优先级：数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
- 先检查实际文件、实现与启动状态，再制定最小改动；不覆盖可靠的已有功能。
- 按阶段开发，每阶段结束后总结并等待用户确认，不自动跨入下一阶段。
- 用户已确认进入第六阶段：完整历史查询、删除确认和真实数据统计。完成后等待确认，不自动进入第七阶段综合验收。
- 不使用虚构记录、统计数据或装饰性按钮，不把未完成的功能包装为可用功能。
- Rust 校验并持久化业务数据，使用 SQLite；外观设置与工作记录分开管理。
- 同时只能有一个活动任务；暂停不计时；重启必须处理未完成任务。
- 计时不能只靠前端逐秒累加，必须基于真实时间和状态。
- 原生透明与 Glass / Cream / Dark / Neon 四种皮肤是必需功能，CSS 透明不能代替原生验证。
- 权限仅授予当前功能确实需要的范围。
- 只有实际执行过的启动、构建和测试才能报告为通过。
- 中文交付包含目标、检查结果、完整路径及 NEW FILE / UPDATE、完整代码、PowerShell 命令、测试方法与预期、兼容性和 Git 命令。
- 完整代码保存在项目文件中，较长交付另提供完整源码清单，不能用省略号代替代码。
- 当前阶段进度见 `docs/PHASE-6.md`，已有阶段记录保留在 docs 中，启动方式见 `README.md`。

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

## UPDATE — E:\WorkMemo\package.json

````
{
  "name": "workmemo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "test:themes": "node --test tests/themes.test.mjs",
    "test:workflow": "node --test tests/workflow.test.mjs",
    "test:history": "node --test tests/history.test.mjs",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "@tauri-apps/api": "^2"
  },
  "devDependencies": {
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^6.0.2",
    "typescript": "~6.0.3",
    "vite": "^8.0.16",
    "@tauri-apps/cli": "^2"
  }
}
````

## UPDATE — E:\WorkMemo\README.md

````
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前处于第六阶段：在主界面下方提供历史查询、删除确认及数量和有效时长汇总。在 SQLite 工作记录、可靠计时与原生透明窗口基础上，保留 Glass、Cream、Dark、Neon 四种皮肤、背景不透明度调节和独立外观配置。支持开始、暂停、继续、结束、暂停后切换任务，以及未结束任务恢复为暂停。主界面显示最近 5 条真实完成记录，并保留基础连接检查。
完整跨环境业务、窗口和恢复综合验收仍留待第七阶段。

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
构建不生成安装包；正式安装包在后续阶段验收。当前阶段实际验证结果见 docs/PHASE-6.md。

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
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
- docs/PHASE-3.md：原生透明、窗口操作与实际验收记录。
- docs/PHASE-4.md：换肤、外观持久化、测试及文件清单。
- docs/PHASE-5.md：主界面反馈、表单校验、实际测试与完整源码交付。
- docs/PHASE-6.md：历史查询、删除、统计口径与实际验收；完整文件清单和源码见同名前缀的 FILES、SOURCE 文档。
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
````

## NEW FILE — E:\WorkMemo\src-tauri\src\history_tests.rs

````
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
        duration_ms,duration_seconds,status,is_paused) VALUES(?1,?2,'测试夹具',
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000,
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000+86400000,?4,?4/1000,'FINISHED',1)",
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
            quantity: 2.0,
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
        assert_eq!(version, 1);
    }
    // Exact temporary test directory, created above; never a user database path.
    assert_eq!(directory.parent(), Some(std::env::temp_dir().as_path()));
    std::fs::remove_dir_all(directory).unwrap();
}
````

## NEW FILE — E:\WorkMemo\src-tauri\src\history.rs

````
use super::{COLUMNS, Result, Store, WorkRecord, db_error, read_record};
use rusqlite::{Row, params};
use serde::{Deserialize, Serialize};

const PAGE_SIZE: i64 = 20;
const FILTER: &str = "status='FINISHED'
    AND date(start_time / 1000, 'unixepoch', 'localtime') BETWEEN ?1 AND ?2
    AND (?3 IS NULL OR category=?3)";

#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct HistoryQuery {
    pub start_date: String,
    pub end_date: String,
    pub category: Option<String>,
    pub page: u32,
}

#[derive(Debug, Serialize)]
pub struct Totals {
    pub records: i64,
    pub quantity: f64,
    pub duration_ms: i64,
}

#[derive(Debug, Serialize)]
pub struct DailyTotal {
    pub date: String,
    pub totals: Totals,
}

#[derive(Debug, Serialize)]
pub struct CategoryTotal {
    pub category: String,
    pub totals: Totals,
}

#[derive(Debug, Serialize)]
pub struct HistoryPage {
    pub records: Vec<WorkRecord>,
    pub page: u32,
    pub page_size: i64,
    pub overview: Totals,
    pub filtered: Totals,
    pub daily: Vec<DailyTotal>,
    pub categories: Vec<CategoryTotal>,
}

fn valid_date(value: &str) -> bool {
    let bytes = value.as_bytes();
    if bytes.len() != 10
        || bytes[4] != b'-'
        || bytes[7] != b'-'
        || !bytes
            .iter()
            .enumerate()
            .all(|(index, c)| index == 4 || index == 7 || c.is_ascii_digit())
    {
        return false;
    }
    let year: u32 = value[..4].parse().unwrap_or(0);
    let month: usize = value[5..7].parse().unwrap_or(0);
    let day: u32 = value[8..].parse().unwrap_or(0);
    let leap = year.is_multiple_of(4) && (!year.is_multiple_of(100) || year.is_multiple_of(400));
    let days = [
        31,
        if leap { 29 } else { 28 },
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ];
    (1970..=9999).contains(&year) && (1..=12).contains(&month) && day > 0 && day <= days[month - 1]
}

fn totals(row: &Row<'_>, offset: usize) -> rusqlite::Result<Totals> {
    Ok(Totals {
        records: row.get(offset)?,
        quantity: row.get(offset + 1)?,
        duration_ms: row.get(offset + 2)?,
    })
}

impl Store {
    pub fn query_history(&mut self, query: HistoryQuery) -> Result<HistoryPage> {
        if !valid_date(&query.start_date)
            || !valid_date(&query.end_date)
            || query.start_date > query.end_date
        {
            return Err("请选择有效的开始和结束日期，开始日期不能晚于结束日期。".into());
        }
        if query.page == 0
            || query.category.as_ref().is_some_and(|category| {
                !["评测", "质检", "开发", "文档"].contains(&category.as_str())
            })
        {
            return Err("历史查询的类别或页码无效。".into());
        }
        let days: i64 = self
            .connection
            .query_row(
                "SELECT CAST(julianday(?2) - julianday(?1) AS INTEGER)",
                params![query.start_date, query.end_date],
                |row| row.get(0),
            )
            .map_err(db_error)?;
        if days > 365 {
            return Err("单次查询最多 366 天，请缩小日期范围后重试。".into());
        }

        // One read transaction makes records, counts and aggregates a consistent snapshot.
        // History excludes active tasks and does not checkpoint or change their timer.
        let tx = self.connection.transaction().map_err(db_error)?;
        let columns = "COUNT(*), COALESCE(SUM(quantity),0.0), COALESCE(SUM(duration_ms),0)";
        let overview = tx
            .query_row(
                &format!("SELECT {columns} FROM work_records WHERE status='FINISHED'"),
                [],
                |row| totals(row, 0),
            )
            .map_err(db_error)?;
        let filtered = tx
            .query_row(
                &format!("SELECT {columns} FROM work_records WHERE {FILTER}"),
                params![query.start_date, query.end_date, query.category],
                |row| totals(row, 0),
            )
            .map_err(db_error)?;
        let page = i64::from(query.page)
            .min(((filtered.records + PAGE_SIZE - 1) / PAGE_SIZE).max(1)) as u32;
        let records = {
            let mut statement = tx
                .prepare(&format!(
                    "SELECT {COLUMNS} FROM work_records WHERE {FILTER}
                ORDER BY start_time DESC, id DESC LIMIT ?4 OFFSET ?5"
                ))
                .map_err(db_error)?;
            statement
                .query_map(
                    params![
                        query.start_date,
                        query.end_date,
                        query.category,
                        PAGE_SIZE,
                        (i64::from(page) - 1) * PAGE_SIZE
                    ],
                    read_record,
                )
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?
        };
        let daily = {
            let mut statement = tx
                .prepare(&format!(
                    "SELECT date(start_time / 1000, 'unixepoch', 'localtime') AS day,
                {columns} FROM work_records WHERE {FILTER} GROUP BY day ORDER BY day DESC"
                ))
                .map_err(db_error)?;
            statement
                .query_map(
                    params![query.start_date, query.end_date, query.category],
                    |row| {
                        Ok(DailyTotal {
                            date: row.get(0)?,
                            totals: totals(row, 1)?,
                        })
                    },
                )
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?
        };
        let categories = {
            let mut statement = tx
                .prepare(&format!(
                    "SELECT category, {columns} FROM work_records
                WHERE {FILTER} GROUP BY category ORDER BY category"
                ))
                .map_err(db_error)?;
            statement
                .query_map(
                    params![query.start_date, query.end_date, query.category],
                    |row| {
                        Ok(CategoryTotal {
                            category: row.get(0)?,
                            totals: totals(row, 1)?,
                        })
                    },
                )
                .map_err(db_error)?
                .collect::<rusqlite::Result<Vec<_>>>()
                .map_err(db_error)?
        };
        tx.commit().map_err(db_error)?;
        Ok(HistoryPage {
            records,
            page,
            page_size: PAGE_SIZE,
            overview,
            filtered,
            daily,
            categories,
        })
    }

    pub fn delete_record(&mut self, id: i64) -> Result<()> {
        if id <= 0 {
            return Err("记录编号无效。".into());
        }
        let tx = self.connection.transaction().map_err(db_error)?;
        let changed = tx
            .execute(
                "DELETE FROM work_records WHERE id=?1 AND status='FINISHED'",
                [id],
            )
            .map_err(db_error)?;
        if changed != 1 {
            return Err("记录不存在或尚未完成，请刷新后重试。".into());
        }
        tx.commit().map_err(db_error)?;
        Ok(())
    }
}

#[cfg(test)]
#[path = "history_tests.rs"]
mod tests;
````

## UPDATE — E:\WorkMemo\src-tauri\src\lib.rs

````
use serde::Serialize;
use tauri::{Emitter, Manager};

mod appearance;
mod clock;
mod database;
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
            app.manage(service::Backend::initialize(app));
            app.manage(appearance::AppearanceState::initialize(app));
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            appearance::get_appearance,
            appearance::save_appearance,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
            service::query_history,
            service::delete_record,
        ])
        .build(tauri::generate_context!())
        .expect("WorkMemo failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if let Err(error) = app.state::<service::Backend>().save_on_exit() {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:storage-error", error);
                }
            }
        });
}
````

## UPDATE — E:\WorkMemo\src-tauri\src\service.rs

````
use crate::{
    clock::SystemClock,
    database::{HistoryPage, HistoryQuery, Result, Snapshot, StartInput, Store},
};
use std::{
    sync::{Arc, Mutex},
    time::Duration,
};
use tauri::{Emitter, Manager, State};

type SharedStore = Arc<Mutex<Result<Store>>>;
pub struct Backend {
    inner: SharedStore,
}

impl Backend {
    pub fn initialize(app: &tauri::App) -> Self {
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
        let weak = Arc::downgrade(&inner);
        std::thread::spawn(move || {
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                if let Ok(mut guard) = shared.lock() {
                    if let Ok(store) = guard.as_mut() {
                        if let Err(error) = store.checkpoint() {
                            store.warning = Some(error);
                        }
                    }
                }
            }
        });
        Self { inner }
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
        action(store)?;
        store.snapshot()
    })
    .await
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
    execute(state.inner.clone(), |_| Ok(())).await
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

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}
````

## UPDATE — E:\WorkMemo\src\App.css

````
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
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: flex; align-items: center; gap: 6px; flex-shrink: 0; min-height: 60px; padding: 8px 10px 8px 14px; border-bottom: 1px solid var(--line); background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; flex: 1; align-items: center; gap: 10px; min-width: 0; min-height: 40px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border-radius: var(--control-radius); background: var(--accent); color: var(--on-accent); font: 600 24px Georgia, serif; padding-bottom: 5px; }
.brand-name { display: block; font-size: 15px; font-weight: 650; letter-spacing: -.3px; }
.brand-caption { display: block; margin-top: 3px; font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }
.drag-grip { margin-left: auto; color: var(--text-muted); opacity: .5; padding: 0 5px; font-size: 18px; }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; }
.window-content { min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { max-width: 520px; margin: 0 auto; padding: 20px; }
.workspace-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 17px; }
.toolbar-actions { display: flex; gap: 6px; margin-left: auto; }
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
button.window-control { width: 30px; height: 30px; padding: 6px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { padding: 21px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); box-shadow: var(--panel-shadow); }
.card-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.eyebrow { font-size: 11px; color: var(--accent-text); letter-spacing: 1px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; margin: 18px 0 4px; text-align: center; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(33px, 10vw, 45px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -1px; line-height: 1.4; overflow-wrap: anywhere; }
.timer-caption { font-size: 10px; color: var(--text-muted); text-align: center; margin: 0 0 16px; }
.task-meta { display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding-top: 15px; border-top: 1px solid var(--line); }
.task-meta span { color: var(--text-muted); }
.task-meta strong { font-size: 14px; font-weight: 600; }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 100px; overflow-y: auto; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 15px; }
.actions button { justify-content: center; }
.form-card { margin-top: 22px; }
h1 { font-size: 16px; font-weight: 550; margin: 0 0 17px; }
.work-form { display: grid; gap: 14px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 7px; padding: 10px 11px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / 96%); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 65px; max-height: 200px; line-height: 1.6; }
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
.switch-panel, .recent-panel, .connection-panel { border-top: 1px solid var(--line); margin-top: 22px; padding-top: 14px; font-size: 11px; }
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
footer { margin-top: 22px; color: var(--text-muted); font-size: 9px; text-align: center; line-height: 1.8; }
.appearance-feedback { margin: -7px 0 14px; color: var(--accent-text); }
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
@media (max-width: 380px) { .workspace { padding: 17px; } .timer-card { padding: 17px; } .drag-grip { display: none; } }
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
````

## UPDATE — E:\WorkMemo\src\App.tsx

````
import { useState } from "react";
import { ConnectionPanel } from "./ConnectionPanel";
import { DesktopWindow } from "./DesktopWindow";
import { AppearanceSettings } from "./AppearanceSettings";
import { useAppearance } from "./useAppearance";
import { THEMES, themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatDuration, formatTime } from "./types";
import { workView } from "./workView";
import { HistoryPanel } from "./HistoryPanel";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const [historyOpen, setHistoryOpen] = useState(false);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const unavailable = !view.canOperate || session.busy;

  return (
    <DesktopWindow appearanceStyle={themeStyle(appearance.current)}>
    <main className="workspace">
      <div className="workspace-toolbar">
        <span className="eyebrow">工作手记</span>
        <div className="toolbar-actions">
          <button className="text-button" type="button" disabled={appearance.loading}
            onClick={appearance.begin}>外观 · {THEMES[appearance.current.theme].name}</button>
          <button className="text-button" type="button" disabled={!session.native || session.busy}
            onClick={() => { void session.refresh(); }}>刷新记录</button>
        </div>
      </div>

      {appearance.notice && <p className="hint appearance-feedback" role="status">{appearance.notice}</p>}
      {appearance.loadError && <div className="notice" role="alert">
        <p>外观设置读取失败，暂时使用默认外观。工作记录不受影响。</p>
        <p className="appearance-error-detail">{appearance.loadError}</p>
        <button type="button" className="text-button" disabled={appearance.loading || appearance.open}
          onClick={() => { void appearance.reload(); }}>重新读取外观</button>
      </div>}

      {!session.native && <p className="notice" role="status">浏览器预览模式。请打开桌面应用，使用本地计时和保存功能。</p>}
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

      <section className={`timer-card${view.mode === "finished" ? " finished-card" : ""}`}
        aria-label="当前工作" aria-busy={session.loading || session.busy}>
        <div className="card-heading">
          <span className="eyebrow">{record ? record.category : "为今天留下一笔"}</span>
          <span className={`state-label ${view.mode === "working" ? "working" : ""}`} role="status">
            {view.label}
          </span>
        </div>
        <output className="timer" aria-label="有效工作时长" aria-live="off">
          {view.timer}
        </output>
        <p className="timer-caption">
          {view.caption}
        </p>
        {record && <>
          <div className="task-meta"><span>工作数量</span><strong>{record.quantity}</strong></div>
          {record.remark && <p className="task-remark">{record.remark}</p>}
          <p className="hint">开始于 {formatTime(record.start_time)}
            {record.end_time !== null && <><br />保存于 {formatTime(record.end_time)}</>}</p>
        </>}
        {view.mode === "finished" && <p className="saved-feedback">记录已保存在这台电脑上，可在下方查看，也可以开始下一项。</p>}
        {active && <>
          <div className="actions">
            <button type="button" disabled={unavailable}
              onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}>
              {session.pending === "resume_task" ? "正在继续…" : session.pending === "pause_task" ? "正在暂停…"
                : active.is_paused ? "继续工作" : "暂停"}
            </button>
            <button className="secondary" type="button" disabled={unavailable}
              onClick={() => { void session.finish(active.id); }}>{session.pending === "finish_task" ? "正在保存…" : "结束并保存"}</button>
          </div>
        </>}
      </section>

      {!active && (session.snapshot || !session.native) && <section className="form-card" aria-label="开始新的工作">
        <h1>{view.finished ? "下一份投入，从这里开始。" : "工作，从一次专注开始。"}</h1>
        <WorkForm disabled={unavailable} starting={session.pending === "start_task"} onStart={session.start} />
      </section>}
      {active?.is_paused && <details className="switch-panel">
        <summary>开始另一项工作</summary>
        <WorkForm disabled={unavailable} switching starting={session.pending === "start_task"} onStart={session.start} />
      </details>}

      <details className="recent-panel">
        <summary>最近保存的记录</summary>
        {session.snapshot?.recent_records.length ? <ul className="record-list">
          {session.snapshot.recent_records.map((record) => <li key={record.id}>
            <div className="record-heading"><strong>{record.category} · {record.quantity}</strong>
              <span>{formatDuration(record.duration_seconds)}</span></div>
            <p className="hint">{formatTime(record.start_time)}<br />至 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
            {record.remark && <p className="record-remark">{record.remark}</p>}
          </li>)}
        </ul> : <p className="hint">{session.snapshot ? "还没有已完成的记录。完成后会保存在这台电脑上。" : "连接本地数据后可查看真实记录。"}</p>}
        <p className="hint">此处显示最近 5 条已完成记录。</p>
      </details>
      <button type="button" className="secondary history-entry" onClick={() => setHistoryOpen(true)}>查看历史与统计<span aria-hidden="true">↗</span></button>
      <ConnectionPanel />
      <footer>本地保存 · 让每一份投入都有迹可循</footer>
      <AppearanceSettings appearance={appearance} />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} onDeleted={session.recordDeleted}
        refreshKey={session.snapshot?.recent_records.map((item) => `${item.id}:${item.end_time}`).join(",") ?? ""} />
    </main>
    </DesktopWindow>
  );
}

export default App;
````

## NEW FILE — E:\WorkMemo\src\history.ts

````
import { CATEGORIES, type WorkRecord } from "./types.ts";

export interface HistoryQuery {
  start_date: string;
  end_date: string;
  category: string | null;
  page: number;
}
export interface Totals { records: number; quantity: number; duration_ms: number }
export interface HistoryPage {
  records: WorkRecord[];
  page: number;
  page_size: number;
  overview: Totals;
  filtered: Totals;
  daily: { date: string; totals: Totals }[];
  categories: { category: string; totals: Totals }[];
}

export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function defaultHistoryQuery(today = new Date()): HistoryQuery {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - 29);
  return { start_date: localDate(start), end_date: localDate(today), category: null, page: 1 };
}

function dateDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  if (year < 1970 || year > 9999) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date.getTime() / 86_400_000;
}

export function historyQueryError(query: HistoryQuery): string {
  const start = dateDay(query.start_date);
  const end = dateDay(query.end_date);
  if (start === null || end === null || start > end) return "请选择有效日期，开始日期不能晚于结束日期。";
  if (end - start > 365) return "单次查询最多 366 天，请缩小日期范围。";
  if (query.category !== null && !CATEGORIES.some((category) => category === query.category)) return "请选择有效的工作类别。";
  if (!Number.isInteger(query.page) || query.page < 1 || query.page > 4_294_967_295) return "页码无效，请重新查询。";
  return "";
}

export function formatQuantity(quantity: number): string {
  return quantity.toLocaleString("zh-CN", { maximumSignificantDigits: 12 });
}
````

## NEW FILE — E:\WorkMemo\src\HistoryPanel.tsx

````
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, formatDuration, formatTime } from "./types";
import { formatQuantity, historyQueryError, localDate, type Totals } from "./history";
import { useHistory } from "./useHistory";

interface Props {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  onDeleted: (id: number) => Promise<void>;
}

function StatsTable({ label, rows }: { label: string; rows: { name: string; totals: Totals }[] }) {
  return <section className="stats-section">
    <h3>{label}</h3>
    <div className="stats-scroll"><table>
      <caption className="sr-only">{label}的记录数、数量和有效工作时长</caption>
      <thead><tr><th scope="col">{label === "每日汇总" ? "工作日期" : "工作类别"}</th>
        <th scope="col">记录</th><th scope="col">数量</th><th scope="col">有效时长</th></tr></thead>
      <tbody>{rows.map(({ name, totals }) => <tr key={name}><th scope="row">{name}</th>
        <td>{totals.records}</td><td>{formatQuantity(totals.quantity)}</td>
        <td>{formatDuration(totals.duration_ms / 1000)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}

export function HistoryPanel({ open, onClose, refreshKey, onDeleted }: Props) {
  const history = useHistory(open, refreshKey, onDeleted);
  const { query, result, target } = history;
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmation = useRef<HTMLDialogElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<"records" | "stats">("records");
  const [draft, setDraft] = useState(query);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (target && !confirmation.current?.open) {
      confirmation.current?.showModal();
      cancelDelete.current?.focus();
    }
    if (!target && confirmation.current?.open) confirmation.current.close();
  }, [target]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = { ...draft, page: 1 };
    const message = historyQueryError(next);
    setFilterError(message);
    if (!message) history.apply(next);
  }
  const pages = result ? Math.max(1, Math.ceil(result.filtered.records / result.page_size)) : 1;

  return <dialog ref={dialog} className="history-dialog" aria-labelledby="history-title"
    onCancel={(event) => { event.preventDefault(); if (!history.deleting) onClose(); }}>
    <div className="settings-heading">
      <h2 id="history-title">历史与统计</h2>
      <button type="button" className="window-control" aria-label="关闭历史与统计"
        disabled={history.deleting} onClick={onClose}>×</button>
    </div>
    <p className="hint">按本机时间的任务开始日期查询，仅统计已完成记录。跨午夜任务归入开始日。</p>
    <form className="history-filters" onSubmit={submit} noValidate>
      <div className="field-row">
        <label>开始日期<input type="date" min="1970-01-01" max="9999-12-31" value={draft.start_date}
          disabled={!history.native || history.deleting} onChange={(event) => { setFilterError(""); setDraft({ ...draft, start_date: event.target.value }); }} /></label>
        <label>结束日期<input type="date" min="1970-01-01" max="9999-12-31" value={draft.end_date}
          disabled={!history.native || history.deleting} onChange={(event) => { setFilterError(""); setDraft({ ...draft, end_date: event.target.value }); }} /></label>
      </div>
      <div className="filter-category-row">
        <label>工作类别<select value={draft.category ?? ""} disabled={!history.native || history.deleting}
          onChange={(event) => { setFilterError(""); setDraft({ ...draft, category: event.target.value || null }); }}>
          <option value="">全部类别</option>
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select></label>
        <button type="submit" disabled={!history.native || history.loading || history.deleting}>
          {history.loading ? "正在查询…" : "查询"}</button>
      </div>
      <p className="hint">默认最近 30 天，单次最多 366 天；可更改日期查看更早记录。</p>
      {filterError && <p className="inline-error" role="alert">{filterError}</p>}
    </form>
    <div className="history-tabs" aria-label="查看内容">
      <button type="button" className="secondary" aria-pressed={tab === "records"} onClick={() => setTab("records")}>工作记录</button>
      <button type="button" className="secondary" aria-pressed={tab === "stats"} onClick={() => setTab("stats")}>统计汇总</button>
    </div>
    {!history.native && <p className="notice">浏览器预览不能查询或删除本地工作记录，请打开桌面应用。</p>}
    {history.notice && <p className="history-feedback" role="status">{history.notice}</p>}
    {history.loading && <p className="hint" role="status">正在读取记录和汇总…</p>}
    {history.error && <div className="error-banner" role="alert">
      <p>{history.error}</p><button type="button" className="text-button" disabled={history.loading || history.deleting}
        onClick={() => { void history.reload(); }}>重新读取</button>
    </div>}
    {result && <div aria-busy={history.loading}>
      <p className="history-overview">全部已完成：{result.overview.records} 条 · 数量 {formatQuantity(result.overview.quantity)}
        <br />累计有效时长 {formatDuration(result.overview.duration_ms / 1000)}</p>
      <p className="hint">当前范围：{query.start_date} 至 {query.end_date} · {query.category ?? "全部类别"}</p>
      <dl className="summary-grid">
        <div><dt>完成记录</dt><dd>{result.filtered.records}<small> 条</small></dd></div>
        <div><dt>工作数量</dt><dd>{formatQuantity(result.filtered.quantity)}</dd></div>
        <div><dt>有效时长</dt><dd>{formatDuration(result.filtered.duration_ms / 1000)}</dd></div>
      </dl>
      {result.filtered.records === 0 ? <p className="history-empty">这个范围还没有已完成记录。可以调整日期或类别；完成工作后记录会出现在这里。</p>
        : tab === "records" ? <>
          <ol className="history-records">
            {result.records.map((record) => <li key={record.id}>
              <div className="record-heading"><strong>{record.category} · {formatQuantity(record.quantity)}</strong>
                <span>{formatDuration(record.duration_seconds)}</span></div>
              <p className="hint">工作日期 {localDate(new Date(record.start_time))}<br />
                开始 {formatTime(record.start_time)}<br />结束 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
              <p className="record-remark">{record.remark || "未填写备注"}</p>
              <button type="button" className="text-button delete-link" disabled={history.loading || history.deleting}
                aria-label={`删除 ${record.category} 记录 ${record.id}`} onClick={() => history.chooseDelete(record)}>删除记录</button>
            </li>)}
          </ol>
          <nav className="history-pagination" aria-label="历史记录分页">
            <button type="button" className="secondary" disabled={history.loading || result.page <= 1}
              onClick={() => history.apply({ ...query, page: result.page - 1 })}>上一页</button>
            <span>第 {result.page} / {pages} 页</span>
            <button type="button" className="secondary" disabled={history.loading || result.page >= pages}
              onClick={() => history.apply({ ...query, page: result.page + 1 })}>下一页</button>
          </nav>
        </> : <>
          <StatsTable label="按类别汇总" rows={result.categories.map((row) => ({ name: row.category, totals: row.totals }))} />
          <StatsTable label="每日汇总" rows={result.daily.map((row) => ({ name: row.date, totals: row.totals }))} />
          <p className="hint">汇总覆盖当前全部筛选结果，不限于当前页。数量直接相加；时长先合计毫秒再显示到秒。</p>
        </>}
    </div>}

    <dialog ref={confirmation} className="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); history.cancelDelete(); }}>
      <h2 id="delete-title">删除这条记录？</h2>
      <p id="delete-description">将永久删除这条已完成记录，并重新计算统计。此操作不能撤销。</p>
      {target && <div className="delete-record-detail">
        <strong>{target.category} · {formatQuantity(target.quantity)}</strong>
        <p>开始 {formatTime(target.start_time)}<br />结束 {target.end_time !== null ? formatTime(target.end_time) : "—"}
          <br />有效时长 {formatDuration(target.duration_seconds)}</p>
        <p className="record-remark">{target.remark || "未填写备注"}</p>
      </div>}
      {history.deleteError && <p className="error-banner" role="alert">{history.deleteError}</p>}
      <div className="settings-actions">
        <button ref={cancelDelete} type="button" className="secondary" disabled={history.deleting} onClick={history.cancelDelete}>取消</button>
        <button type="button" className="danger-button" disabled={history.deleting} onClick={() => { void history.remove(); }}>
          {history.deleting ? "正在删除…" : "确认删除"}</button>
      </div>
    </dialog>
  </dialog>;
}
````

## NEW FILE — E:\WorkMemo\src\useHistory.ts

````
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { defaultHistoryQuery, historyQueryError, type HistoryPage, type HistoryQuery } from "./history";
import type { WorkRecord } from "./types";

export function useHistory(open: boolean, refreshKey: string, onDeleted: (id: number) => Promise<void>) {
  const native = isTauri();
  const [query, setQuery] = useState(defaultHistoryQuery);
  const [result, setResult] = useState<HistoryPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [target, setTarget] = useState<WorkRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const mounted = useRef(false);
  const visible = useRef(open);
  const revision = useRef(0);
  const deleteBusy = useRef(false);
  visible.current = open;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; revision.current += 1; };
  }, []);

  const reload = useCallback(async () => {
    if (!native || !visible.current || deleteBusy.current) return;
    const request = ++revision.current;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const page = await invoke<HistoryPage>("query_history", { query });
      if (mounted.current && visible.current && request === revision.current) setResult(page);
    } catch (failure: unknown) {
      if (mounted.current && visible.current && request === revision.current) setError(String(failure));
    } finally {
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }, [native, query]);

  useEffect(() => {
    if (open) { void reload(); }
    else {
      revision.current += 1;
      setResult(null);
      setLoading(false);
      setTarget(null);
      setNotice("");
      setError("");
    }
    return () => { revision.current += 1; };
  }, [open, refreshKey, reload]);

  function apply(next: HistoryQuery) {
    if (deleteBusy.current) return;
    const message = historyQueryError(next);
    if (message) { setError(message); return; }
    setNotice("");
    setQuery({ ...next });
  }

  async function remove() {
    if (!native || !target || deleteBusy.current || loading) return;
    deleteBusy.current = true;
    setDeleting(true);
    setDeleteError("");
    const id = target.id;
    let deleted = false;
    try {
      await invoke<void>("delete_record", { id });
      deleted = true;
      if (mounted.current) {
        setTarget(null);
        setNotice("记录已删除。");
      }
    } catch (failure: unknown) {
      if (mounted.current) setDeleteError(String(failure));
    } finally {
      deleteBusy.current = false;
      if (mounted.current) setDeleting(false);
    }
    if (deleted) { void onDeleted(id); void reload(); }
  }

  return { native, query, result, loading, error, notice, target, deleting, deleteError, apply, reload, remove,
    chooseDelete: (record: WorkRecord) => { if (!loading && !deleteBusy.current) { setDeleteError(""); setTarget(record); } },
    cancelDelete: () => { if (!deleteBusy.current) setTarget(null); },
  };
}
````

## UPDATE — E:\WorkMemo\src\useWorkSession.ts

````
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Snapshot, StartInput } from "./types";
import { confirmedFinish, reconcileDeleted } from "./workView";

type WorkCommand = "start_task" | "pause_task" | "resume_task" | "finish_task";

export function useWorkSession() {
  const native = isTauri();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(native);
  const [pending, setPending] = useState<WorkCommand | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState("");
  const [commandError, setCommandError] = useState("");
  const mounted = useRef(false);
  const busyRef = useRef(false);
  const polling = useRef(false);
  const revision = useRef(0);
  const deletedIds = useRef(new Set<number>());

  const refresh = useCallback(async () => {
    if (!native || busyRef.current || polling.current) return;
    polling.current = true;
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>("get_snapshot");
      if (mounted.current && request === revision.current) {
        setSnapshot(reconcileDeleted(data, deletedIds.current));
        setConnectionError("");
      }
    } catch (error: unknown) {
      if (mounted.current && request === revision.current) setConnectionError(String(error));
    } finally {
      polling.current = false;
      if (mounted.current && request === revision.current) setLoading(false);
    }
  }, [native]);

  useEffect(() => {
    mounted.current = true;
    if (!native) return () => { mounted.current = false; };
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 1000);
    const onFocus = () => { void refresh(); };
    const onVisibility = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    let stopped = false;
    let unlisten: UnlistenFn | undefined;
    void listen<string>("workmemo:storage-error", ({ payload }) => {
      if (!stopped) setCommandError(`保存失败，已阻止关闭：${payload}`);
    }).then((unsubscribe) => {
      if (stopped) unsubscribe(); else unlisten = unsubscribe;
    }).catch((error: unknown) => {
      if (!stopped) setCommandError(`无法接收保存错误通知：${String(error)}`);
    });
    return () => {
      stopped = true;
      mounted.current = false;
      revision.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      unlisten?.();
    };
  }, [native, refresh]);

  const run = useCallback(async (command: WorkCommand, args: Record<string, unknown>) => {
    if (!native || busyRef.current) return false;
    busyRef.current = true;
    setPending(command);
    setCommandError("");
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>(command, args);
      if (mounted.current && request === revision.current) {
        const current = reconcileDeleted(data, deletedIds.current);
        setSnapshot(current);
        setConnectionError("");
        if (command === "start_task") setSavedId(null);
        if (command === "finish_task") {
          const id = typeof args.id === "number" ? args.id : null;
          setSavedId(confirmedFinish(current, id)?.id ?? null);
        }
      }
      return true;
    } catch (error: unknown) {
      if (mounted.current) setCommandError(String(error));
      return false;
    } finally {
      busyRef.current = false;
      if (mounted.current) { setPending(null); setLoading(false); }
    }
  }, [native]);

  const recordDeleted = useCallback(async (id: number) => {
    deletedIds.current.add(id);
    setSavedId((current) => current === id ? null : current);
    setSnapshot((current) => current ? reconcileDeleted(current, deletedIds.current) : current);
    await refresh();
  }, [refresh]);

  return {
    native, snapshot, loading, busy: pending !== null, pending, savedId,
    connectionError, commandError, refresh, recordDeleted,
    start: (input: StartInput) => run("start_task", { input }),
    pause: (id: number) => run("pause_task", { id }),
    resume: (id: number) => run("resume_task", { id }),
    finish: (id: number) => run("finish_task", { id }),
  };
}
````

## UPDATE — E:\WorkMemo\src\workView.ts

````
import { formatDuration, type Snapshot, type WorkRecord } from "./types.ts";

interface ViewInput {
  native: boolean;
  loading: boolean;
  snapshot: Snapshot | null;
  connectionError: string;
  savedId: number | null;
}

export function confirmedFinish(snapshot: Snapshot | null, id: number | null): WorkRecord | null {
  if (id === null || !snapshot || snapshot.active) return null;
  return snapshot.recent_records.find((record) => record.id === id
    && record.status === "FINISHED" && record.end_time !== null) ?? null;
}

// A read started before a confirmed deletion may arrive after it. Never revive that record.
export function reconcileDeleted(snapshot: Snapshot, deleted: ReadonlySet<number>): Snapshot {
  return { ...snapshot, recent_records: snapshot.recent_records.filter((record) => !deleted.has(record.id)) };
}

export function workView({ native, loading, snapshot, connectionError, savedId }: ViewInput) {
  const finished = confirmedFinish(snapshot, savedId);
  const record = snapshot?.active ?? finished;
  const mode = !native ? "preview" : loading ? "loading"
    : connectionError || !snapshot ? "unavailable"
    : snapshot.active ? (snapshot.active.is_paused ? "paused" : "working")
    : finished ? "finished" : "ready";
  const labels = { preview: "桌面预览", loading: "正在读取", unavailable: "暂不可用",
    paused: "已暂停", working: "进行中", finished: "已完成并保存", ready: "准备开始" };
  const captions = { preview: "请在桌面应用中开始工作", loading: "正在读取本地工作记录",
    unavailable: record ? "上次读取的时长，暂未更新" : "连接本地数据后显示时长",
    paused: "暂停期间不计时", working: "有效工作时长",
    finished: "本次有效工作时长", ready: "选择类别和数量，即可开始" };
  return {
    mode, record, finished, label: labels[mode], caption: captions[mode],
    timer: record ? formatDuration(record.duration_seconds) : mode === "ready" ? "00:00:00" : "--:--:--",
    canOperate: mode === "ready" || mode === "working" || mode === "paused" || mode === "finished",
  };
}
````

## NEW FILE — E:\WorkMemo\tests\history.test.mjs

````
import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultHistoryQuery, historyQueryError, localDate, formatQuantity } from '../src/history.ts';
import { confirmedFinish, reconcileDeleted } from '../src/workView.ts';

const query = { start_date: '2026-10-01', end_date: '2026-10-31', category: null, page: 1 };

test('默认范围使用本地日历，包含今天共30天，并正确跨越年界', () => {
  const today = new Date(2026, 0, 5, 0, 30);
  assert.deepEqual(defaultHistoryQuery(today), { start_date: '2025-12-07', end_date: '2026-01-05', category: null, page: 1 });
  assert.equal(localDate(new Date(2026, 9, 26, 23, 59)), '2026-10-26');
  assert.equal(today.getDate(), 5); // Helper must not mutate the caller's date.
});

test('本地日历范围跨闰日，不用固定毫秒回退30天', () => {
  assert.equal(defaultHistoryQuery(new Date(2024, 2, 1)).start_date, '2024-02-01');
  assert.equal(defaultHistoryQuery(new Date(2026, 2, 1)).start_date, '2026-01-31');
});

test('有效闰日、同日与最多366天可以查询', () => {
  for (const [start_date, end_date] of [['2024-02-29', '2024-02-29'], ['2024-01-01', '2024-12-31'], ['2026-10-01', '2026-10-01']]) {
    assert.equal(historyQueryError({ ...query, start_date, end_date }), '');
  }
  assert.equal(historyQueryError({ ...query, category: '质检' }), '');
});

test('拒绝无效日历日期、未填写日期、倒置日期和超过366天', () => {
  for (const date of ['', '2026-2-01', '2026-02-29', '2100-02-29', '2026-04-31', '2026-00-01', '2026-13-01', '2026-10-00', '1969-12-31']) {
    assert.notEqual(historyQueryError({ ...query, start_date: date }), '', date);
  }
  assert.notEqual(historyQueryError({ ...query, start_date: '2026-11-01' }), '');
  assert.notEqual(historyQueryError({ ...query, start_date: '2024-01-01', end_date: '2025-01-01' }), '');
});

test('未知类别和非法页码不会提交给桌面后端', () => {
  assert.notEqual(historyQueryError({ ...query, category: '未知' }), '');
  for (const page of [0, -1, 1.5, Infinity, NaN, 4294967296]) {
    assert.notEqual(historyQueryError({ ...query, page }), '');
  }
});

test('数量汇总隐藏二进制浮点尾差，同时保留小数量', () => {
  assert.equal(formatQuantity(.1 + .2), '0.3');
  assert.equal(formatQuantity(.000001), '0.000001');
  assert.equal(formatQuantity(1000.25), '1,000.25');
});

test('较早刷新结果不能复活已确认删除的记录或完成提示，同时保留其他数据', () => {
  const active = { id: 9, status: 'WORKING' };
  const saved = { id: 7, status: 'FINISHED', end_time: 1000 };
  const keep = { id: 8, status: 'FINISHED', end_time: 2000 };
  const stale = { active, recent_records: [keep, saved], warning: '原警告' };
  const reconciled = reconcileDeleted(stale, new Set([7]));
  assert.equal(reconciled.active, active);
  assert.equal(reconciled.warning, '原警告');
  assert.deepEqual(reconciled.recent_records, [keep]);
  assert.equal(stale.recent_records.length, 2);
  assert.equal(confirmedFinish({ ...reconciled, active: null }, 7), null);
  assert.deepEqual(reconcileDeleted(stale, new Set()), stale);
});
````
