# 待办清单首版源码交付

## 功能与兼容性

- 桌面主窗口和灵动岛打开同一份待办。用户填写标题就可添加，未完成按添加顺序显示，已完成默认折叠。
- 待办发起计时使用原有的类别、工作量、暂停及切换流程。已有未结束记录时，可回到现有任务继续。工作记录保存开工时的标题，待办完成状态由用户手动更新。
- SQLite schema 13 增加待办和关联表。任务切换、工作记录写入及关联在同一事务提交。待办 ID 在备份恢复后仍可识别，过期操作无法修改恢复后新建的另一条待办。使用完整 `.workmemo` 备份迁移待办和关联。
- 从 schema 12 升级前先创建完整备份。较旧程序无法直接打开 schema 13 数据库。如需回到公开 v0.2.12，请使用升级前的备份。待办使用既有本地桌面权限，适用于 Windows x64 与 Microsoft Edge WebView2。

完整文件和代码见 [源码清单](TODO-SOURCE.md)。

## 2026-11-19 验收结果

- 69 项 Node 测试、190 项 Rust 测试（库 185 项、浏览器助手 2 项、浏览器主机 2 项、注册集成 1 项）、Cargo 格式和前端生产构建通过。新增 Rust 覆盖独立完成和重启、多次计时、恢复与挂起、切换事务回滚、删除及新旧备份。
- 生产前端通过待办、既有灵动岛、页面任务三组隔离回归。键盘可勾选和关闭，写入失败保留标题，Chromium 中文 IME 合成模拟中确认回车没有提交。真实微软拼音候选窗未单独复验。
- 隔离 Windows 原生构建及启动通过。空闲灵动岛能唤起隐藏的主窗口并打开待办。Glass、Cream、Dark、Neon 均用两个底色作窗口像素取样，确认原生透明。实际开工、暂停、继续、结束、手动勾选和 Esc 通过。隔离数据库复查确认 schema 13、同一条已结束记录关联、两个工时段及外键完整。
- 验收使用 `com.workmemo.test.todo1119145457`，截图保存在 `E:\WorkMemo\artifacts\todo-qa`。本次交付源码，Windows 安装版和免安装包待发布确认。

## PowerShell 检查

```powershell
Set-Location E:\WorkMemo
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

生产构建后，在另一个终端启动 `npm.cmd run preview -- --host 127.0.0.1 --port 1423`。使用本机 Playwright 和 Edge 运行以下脚本。Playwright 不在项目运行依赖中，如已单独安装，按需用 `WORKMEMO_PLAYWRIGHT` 指向它的 `index.mjs`。

```powershell
node scripts/verify-todos.mjs
node scripts/verify-island-manual-expand.mjs
node scripts/verify-page-task-ui.mjs
```

## Windows 隔离验收

```powershell
$qa = New-Item -ItemType Directory -Force -Path artifacts/todo-qa
$profile = 'com.workmemo.test.todo' + (Get-Date -Format 'MMddHHmmss')
$config = Get-Content -Raw -LiteralPath src-tauri/tauri.web-acceptance.conf.json | ConvertFrom-Json
$config.identifier = $profile
$config.productName = 'WorkMemo Todo QA'
$config.app.windows[0].title = 'WorkMemo Todo QA'
$configPath = Join-Path $qa.FullName 'tauri.todo-qa.json'
$config | ConvertTo-Json -Depth 6 | Set-Content -Encoding ascii -LiteralPath $configPath
$profile | Set-Content -Encoding ascii -LiteralPath (Join-Path $qa.FullName 'identifier.txt')
npm.cmd run tauri build -- --debug --no-bundle --config $configPath
if ($LASTEXITCODE -ne 0) { throw 'Windows debug build failed' }
Copy-Item -LiteralPath src-tauri/target/debug/workmemo.exe -Destination (Join-Path $qa.FullName 'WorkMemo-Todo-QA.exe')
powershell.exe -NoProfile -STA -ExecutionPolicy Bypass -File scripts/verify-todo-native.ps1
```

预期空闲灵动岛可以唤起已隐藏的主窗口并打开待办。分别在 Glass、Cream、Dark、Neon 下，原生窗口圆角外围应透出测试背景，清单文字和控件可读。新增待办后从清单开工，暂停再继续应复用同一条记录。结束后待办仍待勾选，空格可勾选，Esc 可退出清单。隔离版用单独的数据与配置目录，验收结束可通过该实例的托盘菜单退出。

## Git 检查

```powershell
git status --short --branch
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: add desktop todo checklist with timer links"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
```
