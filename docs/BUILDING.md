# 从源码运行和构建 WorkMemo

普通用户请下载 [Release 成品](https://github.com/noharass/WorkMemo/releases/latest)，无需安装开发工具。使用方法见 [USER-GUIDE.md](USER-GUIDE.md)。

## Windows x64 环境

需要 Node.js 24 x64、Rust stable MSVC、Visual Studio 2022 C++ Build Tools（含 Windows SDK）、Microsoft Edge WebView2 Runtime。通过 git clone 获取源码时需要 Git。

前端依赖和 Tauri CLI 由 npm 安装；Rust 依赖由 Cargo 按锁文件获取。SQLite 编入程序，不需要数据库服务。首次安装依赖需要联网。

## 开发

```powershell
git clone https://github.com/noharass/WorkMemo.git
Set-Location WorkMemo
npm.cmd ci
npm.cmd run tauri dev
```

`npm.cmd run dev` 只提供浏览器预览，不能保存桌面工作记录。`tauri dev` 会先准备配套浏览器组件。Chrome 需加载程序「监测设置 → 打开配套扩展文件夹」中的已构建 extension；不要直接加载 browser-extension 源文件目录。

普通源码运行使用正式标识 `com.workmemo.desktop`，会打开正式数据。预览配置 `src-tauri/tauri.preview.conf.json` 使用 `com.workmemo.test.monitor`。不要用真实工作记录做测试。

## 检查

```powershell
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --locked --manifest-path src-tauri/Cargo.toml
```

测试与打包按顺序执行；不要让不同配置的 Cargo 构建并行复用 target 目录。特别是复制隔离可执行文件前，要核对其编译标识，避免把另一构建产生的文件作为隔离程序。

### 网页组件与隔离回归

2026-11-10 灵动岛源码修订增加 `node scripts/verify-island-manual-expand.mjs`，覆盖默认收起、连续切页与提醒更新、手动展开、补填草稿、收起区域 IPC、四皮肤和减少动态效果。`verify-page-task-ui.mjs`、`verify-page-binding-entry.mjs`、`verify-v027-island.mjs` 已改为显式点击展开入口；历史 v025/v026 脚本中的自动展开假设尚未全部改写，不能用它们判定本次默认收起为故障。源码范围和原生验收限制见 [FIX-ISLAND-MANUAL-EXPAND.md](FIX-ISLAND-MANUAL-EXPAND.md)。

网页通过共享 `src/ui/UiProvider.tsx` 使用 Ant Design 6.6.8，保留桌面原有控件和样式。不要在网页继续手写标准按钮、选择框、表格或弹层；主题通过官方 token、语义样式及共享封装配置。未引入全局 reset，图表继续使用 ECharts。

先在一个 PowerShell 窗口运行 `npm.cmd run dev -- --host 127.0.0.1`，再在另一个窗口运行：

```powershell
# Playwright 是验收工具，不是应用运行依赖；填写本机已有的 playwright/index.mjs。
$env:WORKMEMO_PLAYWRIGHT = 'C:\path\to\playwright\index.mjs'
npm.cmd run test:web
node scripts/verify-v025.mjs
node scripts/verify-v026.mjs
node scripts/verify-v025-followup.mjs
node scripts/verify-titlebar.mjs
node scripts/verify-ui-022.mjs --desktop-only
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
```

这些浏览器回归使用隔离 HTTP／IPC 数据，不对真实任务发送操作。新版网页回归以 `test:web` 为准。0.2.7 将分类连续补填改为先选记录、保存后返回列表；历史命令 verify-v025-followup.mjs 转到新的 verify-v027-web.mjs，桌面收高仍由 verify-v025.mjs 检查。旧网页脚本中的原生 select、侧抽屉及清空统计的断言对应历史布局，不能当作新版的验收入口。新截图和结果写入 `artifacts/web-ui/qa`；CSS 缩放和模拟 IPC 不等于 Windows 原生透明、系统 DPI 或实际浏览器扩展验收。完整说明见 [WEB-UI-UPDATE.md](WEB-UI-UPDATE.md)。

0.2.6 源码阶段新增 `verify-v026.mjs`，覆盖监测首页、连续开工入口、旧结算草稿、新任务并存，以及设置保存的节点、请求次数、焦点和逐帧稳定性；支持 `WORKMEMO_UI_URL` 指向生产预览资源。`--baseline` 仅用于开发前的缺陷复现，不能作为修复后的验收入口。既有桌面、名称脚本已适配显式「新建任务」入口和取消后保留草稿。源码阶段与原生限制见 [UPDATE-0.2.6-PHASE-1.md](UPDATE-0.2.6-PHASE-1.md)。

## 构建 v0.2.7 同版本修订成品

2026-11-10 按用户要求将灵动岛默认收起修正继续以 0.2.7 构建发布，包含此前入口修复、页面与任务绑定和 schema 10，详见 [RELEASE-0.2.7-ISLAND.md](RELEASE-0.2.7-ISLAND.md)。原始 0.2.7 使用 schema 9；请按构建日期、提交和 SHA256 区分成品，不以同版本号推断数据库兼容性。运行下方打包脚本时输出目录为 `artifacts/0.2.7`。正式构建必须使用 Tauri build，确保启用 `custom-protocol` 内嵌前端。原 v0.2.7 标签保持历史提交不移动，本次资产源码使用修订发布记录中的构建提交。

## 0.2.7 历史记录

0.2.7 发布后的页面任务自动切换仍处于源码阶段，数据库 schema 10 和隔离检查说明见 [PAGE-TASK-SWITCH-PHASE-1.md](PAGE-TASK-SWITCH-PHASE-1.md)。隔离界面脚本为 `node scripts/verify-page-task-ui.mjs`，请勿把开发构建复制到正式应用目录。

0.2.7 已进入成品发布阶段，发布核对与兼容性见 [RELEASE-0.2.7.md](RELEASE-0.2.7.md)；前序阶段记录、独立 Windows 构建及完整命令见 [UPDATE-0.2.7-PHASE-1.md](UPDATE-0.2.7-PHASE-1.md)。新增回归：

```powershell
node scripts/verify-v027-web.mjs
node scripts/verify-v027-feedback.mjs
node scripts/verify-v027-island.mjs
node scripts/verify-v027-visual.mjs
```

视觉脚本覆盖四皮肤、40/65/100% 不透明度及两种密度，网页截图只用于浏览器合成效果检查。原始音效只在素材编辑时需要，普通构建直接使用仓库 WAV，不联网下载。

```powershell
& .\scripts\package-windows.ps1
```

脚本收集第三方许可，执行前端与 Tauri release 构建，准备浏览器组件，生成 NSIS 安装器和免安装 ZIP：

- `artifacts/0.2.7/WorkMemo_0.2.7_x64-setup.exe`
- `artifacts/0.2.7/WorkMemo_0.2.7_windows_x64.zip`
- `artifacts/0.2.7/THIRD-PARTY-LICENSES.txt`
- `artifacts/0.2.7/SHA256SUMS.txt`

脚本不启动成品或执行安装。产物、数据库、凭据和本机配置不提交 Git。相同版本重建会替换该输出目录中的同名文件。

不运行打包脚本时：

```powershell
npm.cmd ci
node scripts/collect-licenses.mjs
npm.cmd run tauri -- build --ci --no-binary-patching
```

原始程序在 `src-tauri/target/release/workmemo.exe`，安装器在 `src-tauri/target/release/bundle/nsis/`。`custom-protocol` 功能用于内嵌前端，成品不依赖 Vite 开发服务器。打包前的资源脚本会核对 helper 的版本和配置，并构建本地扩展弹窗。

安装模式为 currentUser，数据标识为 `com.workmemo.desktop`。本项目未启用应用内自动更新；安装器使用 `--no-binary-patching` 保持与免安装包相同的程序字节。第三方许可通过 `scripts/collect-licenses.mjs` 从锁定依赖收集。

版本在 package.json、package-lock.json、Cargo.toml、Cargo.lock、tauri.conf.json 和扩展 version_name 中同步。扩展的 Chrome 数字版本另行递增，固定 key 保持扩展标识不变。

正式 release 标识首次运行默认注册当前用户开机启动；开发、隔离预览不会注册。自启以 `--autostart` 进入后台，单实例插件最先初始化。主窗口内容高度命令只允许 main 调用，状态岛区域命令只允许 notice；不要扩大前端原生权限。

0.2.7 反馈回归 `verify-v027-feedback.mjs` 覆盖侧栏提示／滚动／键盘、类别工时饼图及筛选、三／二／单列、文案与圆角。完整结果与原生限制见 [FIX-0.2.7-FEEDBACK.md](FIX-0.2.7-FEEDBACK.md)。
