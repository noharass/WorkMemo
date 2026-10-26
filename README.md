# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前处于第二阶段：SQLite 工作记录与可靠计时。支持开始、暂停、继续、结束、暂停后切换任务，以及未结束任务恢复为暂停。界面显示最近 5 条真实完成记录，并保留基础连接检查。
原生透明、四种皮肤、完整历史查询/删除与统计尚未实现。

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
保留系统标题栏。窗口移动、缩放与完整鼠标流程尚待人工验收，不能以编译通过代替交互验收。

```powershell
npm run build
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
构建不生成安装包；正式安装包在后续阶段验收。各项实际验证结果见 docs/PHASE-2.md。

`npm run dev` 仅为浏览器预览，不能证明原生能力，页面会明确提示预览模式。

## 文件关系

- src/：React 界面、表单、任务接口与轮询逻辑，不保存业务数据。
- src-tauri/src/database.rs：任务状态机、SQLite 校验与事务。
- src-tauri/src/clock.rs：单调时钟与实际日期时间。
- src-tauri/src/service.rs：Tauri 命令、后台检查点与关闭保存。
- src-tauri/migrations/：按 user_version 管理的数据库结构。
- src-tauri/tauri.conf.json：窗口、构建、安全配置。
- src-tauri/capabilities/：仅开放接收保存错误通知所需的事件订阅权限，不向界面开放文件系统或 SQL。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
- AGENTS.md：后续开发约束。
- package-lock.json / src-tauri/Cargo.lock：锁定前后端依赖。

开发顺序：可靠持久化与计时 → 原生透明 → 主题 → 主界面 → 历史统计 → 综合验收。
每阶段结束后等待用户确认。

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
