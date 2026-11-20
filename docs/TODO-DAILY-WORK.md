# 待办日计划和工时明细

- 在待办的「更多」中加入或移出「今天要做」。当天选中的未完成事项集中在顶部，按北京时间跨日后回到其他待办，完成状态由用户更新。应用重开后仍读取当天的选择。
- 已结束的关联工作记录提供计时次数和累计有效工时，展开可看每次开始时间、类别和有效时长。暂停时段沿用原计时记录的排除规则。删除一条工作记录后，待办汇总相应更新。
- 从同一待办再次开工时预选最近一次已结束记录的类别，用户可改选后确认。列表常态只显示勾选框、标题、主要工作按钮和「更多」。需要修改、删除或安排今日时再展开操作。

## 数据兼容性

SQLite 从 schema 13 升级到 14，为待办新增日期列。旧待办和关联工时随数据库保留，首次升级时今日组为空。现有完整备份流程会迁移旧备份并保存新版本的今日标记。升级前请保留完整备份。回退到 v0.2.13 时使用升级前的备份。

## 文件清单

- NEW FILE [E:\WorkMemo\src-tauri\migrations\014_todo_day_plan.sql](../src-tauri/migrations/014_todo_day_plan.sql)
- NEW FILE [E:\WorkMemo\docs\TODO-DAILY-WORK.md](TODO-DAILY-WORK.md)
- UPDATE [E:\WorkMemo\src-tauri\src\database.rs](../src-tauri/src/database.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\todos.rs](../src-tauri/src/todos.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\day_rollover.rs](../src-tauri/src/day_rollover.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\service.rs](../src-tauri/src/service.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\lib.rs](../src-tauri/src/lib.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\database_tests.rs](../src-tauri/src/database_tests.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\data_tools.rs](../src-tauri/src/data_tools.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\categories.rs](../src-tauri/src/categories.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\history_tests.rs](../src-tauri/src/history_tests.rs)
- UPDATE [E:\WorkMemo\src\TodoDialog.tsx](../src/TodoDialog.tsx)
- UPDATE [E:\WorkMemo\src\App.tsx](../src/App.tsx)
- UPDATE [E:\WorkMemo\src\App.css](../src/App.css)
- UPDATE [E:\WorkMemo\scripts\desktop-fixture.mjs](../scripts/desktop-fixture.mjs)
- UPDATE [E:\WorkMemo\scripts\verify-todos.mjs](../scripts/verify-todos.mjs)
- UPDATE [E:\WorkMemo\docs\USER-GUIDE.md](USER-GUIDE.md)
- UPDATE [E:\WorkMemo\docs\PHASE-8.md](PHASE-8.md)

## PowerShell 验收

2026-11-20 实际通过 69 项 Node 测试、195 项 Rust 测试、前端生产构建和三组生产预览回归。Rust 覆盖北京时间跨日、重启、工时汇总、最新类别及 schema 12/13/14 备份恢复。待办界面回归覆盖键盘展开、加入和移出今天、工时明细、类别预选、同名项及 360 像素窗口的长标题。界面回归使用隔离 IPC 模拟。本次交付源码，正式安装包和 Windows 原生窗口未在本轮复验。

```powershell
Set-Location E:\WorkMemo
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd test
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 1423 --strictPort
```

在另一个终端运行下列脚本。如果使用独立安装的 Playwright，可用 `WORKMEMO_PLAYWRIGHT` 指向对应的 `index.mjs`。预期今天组、工时展开、类别预选、重名和窄窗通过，原有灵动岛与页面任务操作可继续使用。

```powershell
node scripts/verify-todos.mjs
node scripts/verify-island-manual-expand.mjs
node scripts/verify-page-task-ui.mjs
```

```powershell
git add -- src-tauri/migrations/014_todo_day_plan.sql src-tauri/src/database.rs src-tauri/src/todos.rs src-tauri/src/day_rollover.rs src-tauri/src/service.rs src-tauri/src/lib.rs src-tauri/src/database_tests.rs src-tauri/src/data_tools.rs src-tauri/src/categories.rs src-tauri/src/history_tests.rs src/TodoDialog.tsx src/App.tsx src/App.css scripts/desktop-fixture.mjs scripts/verify-todos.mjs docs/USER-GUIDE.md docs/PHASE-8.md docs/TODO-DAILY-WORK.md
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: add daily todo planning and work history"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```
