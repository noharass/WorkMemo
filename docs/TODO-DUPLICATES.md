# 待办同名修复

## 行为与兼容性

未完成项的标题在去除首尾空白后必须不同，英文字母大小写视为相同。Rust 在同一 SQLite 写事务内检查并保存，覆盖添加、改名和取消勾选。已完成后可以重新添加同名事项。新增或改名遇到重名时，输入框保留文字并显示提示。取消勾选遇到重名时，提示显示在该已完成项下方。

旧的同名待办沿用原有记录，清单和相应操作显示各自的编号。修改标题可以消除歧义，原有工时及其待办关联继续保留。沿用 schema 13，现有数据可直接打开。

2026-11-20 实际通过 69 项 Node 测试、192 项 Rust 测试、前端生产构建和生产预览下的待办回归。回归覆盖重名输入保留、旧同名项编号及取消勾选冲突。桌面交互回归使用隔离 IPC 模拟，正式 Windows 安装包未在本轮重新打包。

## 完整文件

- UPDATE [E:\WorkMemo\src-tauri\src\todos.rs](../src-tauri/src/todos.rs)
- UPDATE [E:\WorkMemo\src-tauri\src\database_tests.rs](../src-tauri/src/database_tests.rs)
- UPDATE [E:\WorkMemo\src\TodoDialog.tsx](../src/TodoDialog.tsx)
- UPDATE [E:\WorkMemo\src\App.tsx](../src/App.tsx)
- UPDATE [E:\WorkMemo\scripts\desktop-fixture.mjs](../scripts/desktop-fixture.mjs)
- UPDATE [E:\WorkMemo\scripts\verify-todos.mjs](../scripts/verify-todos.mjs)
- UPDATE [E:\WorkMemo\docs\USER-GUIDE.md](USER-GUIDE.md)
- UPDATE [E:\WorkMemo\docs\PHASE-8.md](PHASE-8.md)
- NEW FILE [E:\WorkMemo\docs\TODO-DUPLICATES.md](TODO-DUPLICATES.md)

## PowerShell 检查

```powershell
Set-Location E:\WorkMemo
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
npm.cmd test
npm.cmd run build
npm.cmd run preview -- --host 127.0.0.1 --port 1423 --strictPort
```

在另一窗口运行 `node scripts/verify-todos.mjs`。如有单独安装的 Playwright，可通过 `WORKMEMO_PLAYWRIGHT` 指向它的 `index.mjs`。预期第二次提交「111」显示重名提示且保留输入。旧的同名项显示不同编号，选中的编号会出现在开工表单。取消勾选与未完成项同名时，已完成状态保持。

```powershell
git add -- src-tauri/src/todos.rs src-tauri/src/database_tests.rs src/TodoDialog.tsx src/App.tsx scripts/desktop-fixture.mjs scripts/verify-todos.mjs docs/USER-GUIDE.md docs/PHASE-8.md docs/TODO-DUPLICATES.md
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: prevent duplicate pending todo titles"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```
