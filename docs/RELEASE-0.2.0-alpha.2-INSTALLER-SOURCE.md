# v0.2.0-alpha.2 EXE 安装器完整变更源码

本文件完整收录安装器补充交付的变更文本，统一换行，不用省略号代替代码。除本汇编自身外，交付清单全部文件均完整收录；构建使用各原始文件，历史源码汇编保持原样。

## UPDATE E:\WorkMemo\README.md

````````markdown
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前源码正在分阶段改造自动工作记录。第一阶段已加入持久计时区间和结束后补填工作量；第二阶段已实现 Windows 输入/系统状态、Chrome 原生通信、5/7 分钟与离页计时规则、托盘和非模态提醒的代码，**真实 Chrome 接入及原生交互尚待验收**。已确认规则见 [自动记录规范](docs/AUTO-TRACKING-SPEC.md)，当前结果见 [第二阶段进度](docs/AUTO-TRACKING-PHASE-2.md)，接入步骤见 [独立验收说明](docs/BROWSER-BRIDGE.md)。源码数据库升级到版本 3 后，旧版程序会拒绝读取；本轮未迁移真实工作数据库。下文成品信息及既有验收记录对应已发布版本，不能作为此次改造的验收结果。

[下载自动记录预览版 v0.2.0-alpha.2](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.2)：[中文 EXE 安装包](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe) · [Windows x64 免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip)。均包含独立数据的主程序、浏览器主机、Chrome 扩展及接入脚本；[安装版说明](docs/PREVIEW-INSTALLER-GUIDE.md) · [免安装版说明](docs/PREVIEW-GUIDE.md) · [发布检查、完整路径与源码](docs/RELEASE-0.2.0-alpha.2.md)。真实浏览器与原生交互仍待验收，稳定版下载保留如下。

WorkMemo 0.1.1，Windows x64 本地工作记录工具。支持可靠计时、暂停恢复、历史查询、删除确认和每日/类别统计；提供原生透明窗口、Glass / Cream / Dark / Neon 四种皮肤和独立外观保存。本次更新采用用户选定的黑白 C 图标，记录与计时规则沿用已有实现。

八阶段开发已完成，当前为图标更新。本轮检查见 [图标更新记录](docs/ICON-UPDATE.md)，0.1.0 最终交付与兼容性范围见 docs/PHASE-8.md，综合验收见 docs/PHASE-7.md。

## 普通用户使用成品

最新公开版本为 v0.1.1，采用选定的黑白 C 图标。更新前请保存关闭旧版窗口，安装后沿用现有记录与外观配置。

[下载 v0.1.1 中文安装版](https://github.com/noharass/WorkMemo/releases/download/v0.1.1/WorkMemo_0.1.1_x64-setup.exe) · [下载 v0.1.1 免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.1.1/WorkMemo_0.1.1_windows_x64.zip) · [v0.1.1 下载页与校验文件](https://github.com/noharass/WorkMemo/releases/tag/v0.1.1)

- 安装版：WorkMemo_0.1.1_x64-setup.exe，中文向导，安装到当前用户；缺少 WebView2 时联网补齐。
- 免安装版：WorkMemo_0.1.1_windows_x64.zip，解压后运行 WorkMemo/workmemo.exe，需要已安装 WebView2。
- 无需 Node.js、Rust、Visual Studio、Git、Python 或数据库服务。使用、更新和数据备份见 [使用说明](docs/USER-GUIDE.md)。
- 源码仓库不提交二进制产物；本机构建输出在 artifacts/0.1.1，公开成品通过上述 GitHub Releases 分发。

## 从源码运行

需要 Node 24 x64、Rust stable MSVC、Visual Studio 2022 C++ Build Tools（含 Windows SDK）和 WebView2；使用 git clone 时还需 Git。SQLite 已编入程序，不用单独安装。完整安装清单与命令见 [源码构建说明](docs/BUILDING.md)。

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
以上 --no-bundle 仅构建程序；正式打包运行 scripts/package-windows.ps1，生成中文 NSIS 安装器、免安装 ZIP、第三方许可文本和 SHA256SUMS.txt。也可使用 npm run tauri -- build --ci --no-binary-patching 只生成 Tauri 官方安装器。实际结果见 docs/PHASE-8.md。

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
- src/assets/workmemo-icon.png：用户选定的原始 C；npm run icons 在原图后添加黑色圆角底板并生成 src-tauri/icons 原生图标和 public/workmemo.png 标题栏/页面图标。
- scripts/package-windows.ps1：Windows x64 成品打包；scripts/collect-licenses.mjs 汇编锁定依赖的许可文本，docs/THIRD-PARTY-LICENSES.txt 随安装包分发。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
- docs/PHASE-3.md：原生透明、窗口操作与实际验收记录。
- docs/PHASE-4.md：换肤、外观持久化、测试及文件清单。
- docs/PHASE-5.md：主界面反馈、表单校验、实际测试与完整源码交付。
- docs/PHASE-6.md：历史查询、删除、统计口径与实际验收；完整文件清单和源码见同名前缀的 FILES、SOURCE 文档。
- docs/PHASE-7.md：综合验收矩阵、故障测试方法、实际结果及剩余限制；同名前缀 FILES、SOURCE 提供文件与完整变更源码。
- docs/PHASE-8.md：最终交付、安装验证、校验值和限制；docs/USER-GUIDE.md、docs/BUILDING.md 分别面向普通用户与源码开发者。
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
````````

## UPDATE E:\WorkMemo\docs\BUILDING.md

````````markdown
# 从 GitHub 源码运行和构建

下面针对 Windows x64。普通用户使用已构建成品见 USER-GUIDE.md，不需要安装整套开发工具。

## 需要安装什么

| 工具 | 本项目要求 | 用途 |
| --- | --- | --- |
| Git | 使用 git clone 时需要；下载源码 ZIP 可省略 | 拉取仓库 |
| Node.js + npm | Node 24 x64，npm 随 Node 安装 | 前端依赖、构建及内置测试 |
| Rust + Cargo | rustup 安装 stable，默认 host 为 x86_64-pc-windows-msvc | Tauri/Rust 编译 |
| Visual Studio 2022 Build Tools | 勾选“使用 C++ 的桌面开发”，包含 MSVC x64 与 Windows SDK | Windows 原生编译和链接 |
| Microsoft Edge WebView2 Runtime | 已安装可复用；没有则安装 Evergreen Runtime | 桌面界面运行 |

无需单独安装 React、TypeScript、Vite、Tauri CLI，它们由 npm ci 安装到项目；Rust crates 在首次编译时按 Cargo.lock 下载。SQLite 使用 bundled 模式编入程序，不需要数据库服务器或独立 SQLite 安装。Python 不属于本项目构建依赖。

官方安装说明：https://v2.tauri.app/start/prerequisites/
Node：https://nodejs.org/
Rust：https://rustup.rs/
C++ Build Tools：https://visualstudio.microsoft.com/visual-cpp-build-tools/
WebView2：https://developer.microsoft.com/microsoft-edge/webview2/

安装后重新打开 PowerShell，确认 node、npm、rustc、cargo、git 可用。不要为运行脚本更改系统安全设置；如果 PowerShell 阻止 npm.ps1，可直接使用 npm.cmd。

## 拉取并启动

```powershell
git clone https://github.com/noharass/WorkMemo.git
Set-Location WorkMemo
npm.cmd ci
npm.cmd run tauri dev
```

第一次需要联网下载 npm 和 Cargo 依赖，耗时取决于网络及机器。npm run dev 仅为浏览器预览，没有本地任务保存能力；使用桌面命令 tauri dev。

## 测试与前端构建

```powershell
npm.cmd run build
npm.cmd test
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
npm.cmd run build
```

## 正式交付包

自动记录开发版本增加一个独立的 workmemo-browser 原生通信程序；Cargo 默认运行目标仍为 workmemo。Chrome 接入、独立应用标识的验收构建与当前限制见 BROWSER-BRIDGE.md 和 AUTO-TRACKING-PHASE-2.md。普通源码构建会使用正式数据目录；独立验收程序应按说明单独构建和复制。

当前源码版本 0.2.0-alpha.2，自动记录预览包请运行 scripts/package-preview.ps1。脚本执行许可证收集、Tauri release/no-bundle 构建，使用 src-tauri/tauri.preview.conf.json 将标识设为 com.workmemo.test.monitor，输出 artifacts/0.2.0-alpha.2 下的免安装 ZIP、说明、许可和校验文件。ZIP 包含主程序、原生通信主机、扩展及可在解压目录运行的注册脚本，不包含工作数据库、运行时端点或凭据。此脚本不会启动程序或注册主机。使用步骤见 PREVIEW-GUIDE.md；实际发布结果另见 RELEASE-0.2.0-alpha.2.md。

~~~powershell
Set-Location 'E:\WorkMemo'
& .\scripts\package-preview.ps1
~~~

用户要求补充的 EXE 安装器使用已经公开且校验一致的预览 ZIP 字节，不重新编译业务程序：

~~~powershell
& .\scripts\package-preview-installer.ps1 -PortableZip .\artifacts\0.2.0-alpha.2\WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip -ExpectedSha256 ec9e0fa7da07655eadf2515eac77ba406f686daf5fa6f7f68a34605e74e1dcc6
~~~

输出到 artifacts/0.2.0-alpha.2/installer。NSIS 当前用户安装器使用 WorkMemo Preview 名称及 workmemo-preview.exe 进程，包含主机与扩展，沿用独立测试数据。安装器打包与解包字节核对已完成，实际安装/卸载仍待验收；公开下载和校验结果见 RELEASE-0.2.0-alpha.2-INSTALLER.md。

下面正式安装器打包记录对应已发布的稳定版源码；预览阶段使用上面的独立数据打包入口。

先保存关闭全部 WorkMemo 窗口，然后在 Windows PowerShell 中执行：

```powershell
& .\scripts\package-windows.ps1
```

脚本会执行 npm ci、Tauri release/NSIS 构建，收集本地依赖包附带的许可文本，生成免安装 ZIP 和 SHA256SUMS.txt。输出到 artifacts/版本号，产物不提交 Git。相同版本重建会覆盖该目录中的同名交付文件。

如当前脚本执行策略阻止本地脚本，不需要修改策略；可分别执行以下构建命令生成官方安装器和原始程序：

```powershell
npm.cmd ci
npm.cmd run tauri -- build --ci --no-binary-patching
```

原始程序：src-tauri/target/release/workmemo.exe。
中文安装器：src-tauri/target/release/bundle/nsis/WorkMemo_0.1.1_x64-setup.exe。

安装器使用 NSIS，缺 WebView2 时联网下载官方 bootstrapper；不构建 MSI，不要求启用额外的 VBSCRIPT 功能。首次打包需要下载 NSIS 构建工具。安装模式为 currentUser，应用标识保持 com.workmemo.desktop。

本项目未启用自动更新插件。打包时使用 --no-binary-patching，保留安装版与免安装版相同的程序字节，便于核对 SHA256；不写入仅自动更新分发需要的 bundle 类型标记。依赖许可文本不变时不重复改写，避免无意义的重新编译。

版本在 package.json、package-lock.json、src-tauri/Cargo.toml、src-tauri/Cargo.lock、src-tauri/tauri.conf.json 中保持一致。用户选定的原始 C 图标为 src/assets/workmemo-icon.png；需要重新生成图标时执行 npm.cmd run icons。脚本保持原图标记，在后方添加黑色圆角底板，使用现有 Tauri CLI 生成原生尺寸及 public/workmemo.png；没有新增构建依赖。临时画布和额外平台产物保留在被忽略的 target 目录。完整源码与阶段记录保存在 docs 中。
````````

## UPDATE E:\WorkMemo\docs\PREVIEW-GUIDE.md

````````markdown
# WorkMemo v0.2.0-alpha.2 自动记录预览版

这是第二阶段的 Windows x64 预发布版，包含自动开始、5/7 分钟空闲规则、离页暂停、后台托盘、结束提醒及待补全工作量。实际 Chrome 接入、连续等待、锁屏/休眠、提醒焦点和四皮肤原生透明仍待验收。发布下载包不代表第二阶段全部验收通过。

## 解压与启动

完整解压 ZIP 到一个固定目录，再双击 workmemo-preview.exe。保留旁边的 workmemo-browser.exe、profile JSON 和 extension 文件夹。需要 Windows x64 与 Microsoft Edge WebView2 Runtime；本预览 ZIP 不安装运行环境。程序没有代码签名，下载后可用随附 SHA256SUMS.txt 核对 ZIP。

首次发布的 ZIP 保留原样，用户要求后另补充了 [EXE 安装器](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe)，安装版步骤见 PREVIEW-INSTALLER-GUIDE.md。两种分发方式均不替换正式 v0.1.1。工作数据使用 %LOCALAPPDATA%\com.workmemo.test.monitor，外观使用 %APPDATA%\com.workmemo.test.monitor；与正式 com.workmemo.desktop 分开。此前独立验收程序使用相同测试标识，因此已有测试记录会保留。不要将真实数据库复制到测试目录；数据库版本 3 不支持旧程序读取。

同一测试数据目录只运行一个实例。关闭主窗口后程序继续在托盘运行；从托盘选择“退出 WorkMemo”才会保存暂停并退出。

## 接入 Chrome

1. 在解压后的 WorkMemo-Preview 目录打开 PowerShell，执行：

~~~powershell
& .\Register-Browser.ps1
~~~

脚本只注册当前用户的 com.workmemo.browser_bridge_test，不需要管理员权限。若系统执行策略阻止脚本，先检查脚本内容和包校验值，再按本机管理要求运行；脚本不修改执行策略。注册生成的主机清单引用当前绝对目录，移动目录后需要重新运行脚本。旧测试主机路径会备份到本目录 previous-registration-*.json；正式主机名称不变。

2. 用户在 Chrome 打开 chrome://extensions，开启开发者模式，加载解压目录中的 extension 文件夹。扩展 ID 应为 oljcealhccdhaddceacnokihjefloaih。若已加载旧测试扩展，改用新目录并重新加载；相同 ID 的扩展无需并存。
3. 启动程序，在“监测设置”中添加自己选定的工作 URL 与类别，启用并保存。打开 Chrome 的 WorkMemo 扩展，点击“同步工作站点授权”，由用户确认站点权限。
4. 回到已配置工作页，保持 Chrome 前台并进行一次新的鼠标/键盘操作。预期约 5 秒内自动开始；仅打开页面且没有新输入不开始。

扩展不采集网页内容、具体按键、文本或鼠标轨迹。页面匹配只限用户配置的 URL；工作记录仅存本地 SQLite。站点权限不足、浏览器断连或锁屏/休眠时，不会把无法确认的时间直接算成有效工时。

## 计时与补填

- 连续 5 分钟无输入：显示非阻塞提醒；7 分钟无输入：结束计时。结束时间暂取最后输入，后续 7 分钟扣除；阅读、思考等低输入工作可能少记，需要人工处理，完整时间修正界面尚不在本阶段。
- 连续离页 2 分钟暂停，再保留 10 分钟；期间返回工作页并有新输入则恢复原记录。空闲和离页规则先到期者生效，同刻优先空闲，不重复结算。
- 手动暂停后自动监测不能恢复；需要手动继续。结束先保存计时结果，工作量可稍后补填；明确填写 0 可保存。关闭提醒后可在待补全列表继续填写。
- 使用者优先保护实际工作，不为测试强制结束或删除自己的任务。

## 停用接入

先从托盘退出预览程序。若需要移除本目录注册的测试主机：

~~~powershell
& .\Register-Browser.ps1 -Unregister
~~~

脚本只移除仍指向本目录的测试注册值，不删除工作记录。Chrome 扩展由用户手动停用或移除。详细阶段记录与完整源码见 https://github.com/noharass/WorkMemo ，稳定版仍见 v0.1.1 Release。
````````

## NEW FILE E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md

````````markdown
# WorkMemo v0.2.0-alpha.2 EXE 安装版

双击 WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe，按中文安装向导完成。安装完成后从桌面或开始菜单打开 WorkMemo Preview。

这是 Windows x64 预发布版，使用当前用户安装模式，无需手动解压。需要 Microsoft Edge WebView2 Runtime；缺少时安装器联网下载微软运行环境。程序尚无代码签名。真实 Chrome 接入、5/7 分钟等待、锁屏/休眠、托盘、提醒焦点和四皮肤原生透明仍待验收。

安装目录可在向导中选择，默认在当前用户的本地应用目录。安装器随程序放置 workmemo-browser.exe、Register-Browser.ps1、workmemo-browser.profile.json、extension 文件夹、使用说明与第三方许可。右键程序快捷方式并选择“打开文件所在的位置”，可找到这些文件。

## 首次接入 Chrome

1. 在安装目录打开 PowerShell，运行：

~~~powershell
& .\Register-Browser.ps1
~~~

脚本只注册当前用户的 com.workmemo.browser_bridge_test，不需要管理员权限。若被本机脚本执行策略阻止，先核对发布包与脚本内容，按本机管理要求运行；安装器和脚本均不修改执行策略。原有测试主机若指向其他目录，会在当前目录保存旧值备份。此备份是本地环境信息，不应公开上传。

2. 用户在 Chrome 打开 chrome://extensions，开启开发者模式，选择“加载已解压的扩展程序”，选安装目录里的 extension 文件夹。已加载旧测试扩展时，改用新目录并重新加载。
3. 在 WorkMemo 的“监测设置”添加自己选定的工作网址与类别，启用并保存。打开 Chrome 的 WorkMemo 扩展，点击“同步工作站点授权”，由用户确认站点权限。
4. 回到匹配工作页，保持 Chrome 前台并进行一次新的点击或键盘输入，约 5 秒内预期自动开始。仅打开工作页面不开始。

## 日常使用

- 最后输入后 5 分钟提醒，7 分钟结束；最后输入后的尾段不计入有效工时。阅读、思考等低输入工作可能少记，完整时间修正界面尚不在本阶段。
- 连续离页 2 分钟暂停，再保留 10 分钟；期间返回工作页并有新输入，恢复原记录。规则先到期者生效，同刻优先空闲。
- 结束后填写工作量，也可稍后到待补全列表填写。手动暂停需要手动继续。
- 关闭窗口继续在托盘运行；从托盘选择“退出 WorkMemo”才会保存暂停并退出。

工作数据在 %LOCALAPPDATA%\com.workmemo.test.monitor，外观在 %APPDATA%\com.workmemo.test.monitor。安装版与之前的独立验收/免安装预览版使用相同测试数据；同一时间只运行一个预览实例。正式版 com.workmemo.desktop 使用另一数据目录。不要复制真实数据库到测试目录，版本 3 不能由旧版程序读取。

## 卸载

先从托盘退出预览程序；若此前运行过注册脚本，在安装目录执行以下命令，再从 Windows 的已安装应用中卸载 WorkMemo Preview：

~~~powershell
& .\Register-Browser.ps1 -Unregister
~~~

脚本只移除仍指向本安装目录的测试注册值。Chrome 扩展由用户手动停用或移除。卸载时保留工作记录；不要选择安装器中清除应用数据的选项，除非确认需要删除测试记录。
````````

## NEW FILE E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-INSTALLER.md

````````markdown
# v0.2.0-alpha.2 补充 EXE 安装器

日期：2026-10-27（Asia/Shanghai）。用户明确要求补充 EXE 安装包。继续使用同一预发布 Release，不修改业务功能，不将原生交互尚待验收的项目写为通过。

## 目标与兼容性

从已公开的免安装 ZIP 提取经过 SHA256 核对的原始程序与浏览器主机，使用 Tauri NSIS 打包为当前用户的中文 EXE 安装器。主程序命名 workmemo-preview.exe，产品名称 WorkMemo Preview，数据标识 com.workmemo.test.monitor；不覆盖正式 v0.1.1，也不影响其 workmemo.exe 进程。

安装器包含 Chrome 扩展、通信主机、独立 profile、注册脚本、安装版说明和许可。安装过程不自动注册主机或授予 Chrome 站点权限；安装后按说明接入。打包不运行安装器、不启动 GUI、不操作用户任务或数据库。

原免安装 ZIP 与原有 4 个 Release 资产保持字节不变；补充 EXE、INSTALLER-GUIDE.md、INSTALLER-SHA256SUMS.txt 三个资产。原应用源码标签 556c85e 保留；INSTALLER-BUILD-INFO.json 另记本次打包源码提交及原始 ZIP 摘要。

## 文件与完整代码

| 状态 | 完整路径 |
| --- | --- |
| NEW FILE | E:\WorkMemo\scripts\package-preview-installer.ps1 |
| NEW FILE | E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-INSTALLER.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-INSTALLER-SOURCE.md |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\PREVIEW-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2.md |

完整变更文本保存在 RELEASE-0.2.0-alpha.2-INSTALLER-SOURCE.md，构建使用各原始文件。历史发布源码汇编保留。

## 检查记录

- 脚本语法解析通过，Tauri tauri bundle --bundles nsis --no-binary-patching 实际执行成功。安装器约 2.33 MiB。打包日志与生成脚本确认 currentUser、WorkMemo Preview、workmemo-preview.exe、com.workmemo.test.monitor。
- 7-Zip 对实际 EXE 执行完整性测试及解包成功；逐项核对主程序、主机、profile、扩展、注册脚本、说明、许可与构建信息，共 15 个应用/资源文件，字节与原始输入完全一致。另有标准 NSIS 插件及卸载器。
- 主程序使用原公开 ZIP 的原始字节，没有因为打包写入 bundle 类型标记。程序与数据逻辑没有变化，本轮没有重新执行此前已通过的 102 个业务测试执行项。
- EXE、安装说明和安装校验文件上传成功，GitHub 返回的大小、SHA256 与本地一致；又从 3 个公开地址无认证下载复算，全部一致。
- 原有 4 个资产的大小、摘要均未改变。Release 正文顶部已加入 EXE 直链，目前共 7 个公开资产；latest 稳定版 API 仍为 v0.1.1。
- 没有实际安装、卸载或启动本安装器中的程序，未为验收改动用户任务、数据库或现有主机注册。原生交互及完整安装流程仍待验收；没有把解包检查称为实际安装通过。

## 下载与校验

[下载 EXE 安装包](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe) · [安装说明](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/INSTALLER-GUIDE.md) · [校验文件](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/INSTALLER-SHA256SUMS.txt)

交付目录 E:\WorkMemo\artifacts\0.2.0-alpha.2\installer，公开回执保存 INSTALLER-RELEASE-RECEIPT.json，公开下载复算副本保存 download-check；这些产物不提交 Git。

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe | 2438793 | 1f9c467a42718e84e7bb300158c545befd83f4c339a8d32095becff26e979057 |
| INSTALLER-GUIDE.md | 3356 | bb9d739eaa9b7eed8276ff3b830fac16bab6f688c156de2be193bcaed0ab352c |
| INSTALLER-SHA256SUMS.txt | 198 | ffdcbf73923de4a999b494c57fce830f7a5f29611a631615e4df8b3ecc7ffe2e |

应用源码标识 556c85e9eeb9a99ec19e7dc205d03314250fa88a；补充安装器打包源码 3cf68e6，随后文档回执另行提交，不移动原标签。

## PowerShell 重现

~~~powershell
Set-Location 'E:\WorkMemo'
& .\scripts\package-preview-installer.ps1 -PortableZip .\artifacts\0.2.0-alpha.2\WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip -ExpectedSha256 ec9e0fa7da07655eadf2515eac77ba406f686daf5fa6f7f68a34605e74e1dcc6
Get-Content .\artifacts\0.2.0-alpha.2\installer\INSTALLER-SHA256SUMS.txt
~~~

需要既有 Windows 源码工具环境与 Tauri NSIS 缓存。脚本仅将验证过的程序复制到 target/release/workmemo-preview.exe，再调用 tauri bundle --no-binary-patching；不重新编译或重写原 ZIP。预期生成带完整接入文件的 EXE，并在安装器解包后逐项核对原始程序字节。

## Git 与发布

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "build: package the automatic tracking preview installer"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

安装器源码与随后的公开发布回执分别提交同步；不强制推送、不移动已有标签、不替换旧资产。上传只使用进程内已有 Git 凭据，回执仅含公开元数据。
````````

## UPDATE E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2.md

````````markdown
# v0.2.0-alpha.2 预发布交付

日期：2026-10-27（Asia/Shanghai）。用户明确要求将本次改造发布到 GitHub Release。

目标是提供第二阶段自动记录代码的可下载 Windows x64 预览包，不跨入第三阶段开发。真实 Chrome 接入、5/7 分钟等待、离页 2+10 分钟、锁屏/休眠、托盘、提醒焦点与四皮肤原生透明仍待实际验收。

用户随后要求的 [EXE 安装包](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_x64-preview-setup.exe) 已补充到同一 Release；详见 [安装器交付与完整源码](RELEASE-0.2.0-alpha.2-INSTALLER.md)。下文保留最初 4 个资产的检查回执，原有资产字节未替换；目前另有安装器、安装说明、安装器校验文件，共 7 个公开资产。

## 文件与兼容性

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\package.json |
| UPDATE | E:\WorkMemo\package-lock.json |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\tauri.conf.json |
| NEW FILE | E:\WorkMemo\src-tauri\tauri.preview.conf.json |
| NEW FILE | E:\WorkMemo\scripts\package-preview.ps1 |
| NEW FILE | E:\WorkMemo\scripts\register-preview-browser.ps1 |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| UPDATE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2.md |
| NEW FILE | E:\WorkMemo\docs\PREVIEW-GUIDE.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2.md |
| NEW FILE | E:\WorkMemo\docs\RELEASE-0.2.0-alpha.2-SOURCE.md |

应用版本统一为 0.2.0-alpha.2。完整变更文本代码见 [RELEASE-0.2.0-alpha.2-SOURCE.md](RELEASE-0.2.0-alpha.2-SOURCE.md)，原始代码保存在表中各文件；历史第二阶段源码汇编保持原样。

没有改动业务计时、数据库迁移、历史或换肤代码。预览包使用 com.workmemo.test.monitor，沿用本机独立验收数据标识；正式 com.workmemo.desktop 不变。使用独立窗口标题、release 优化的主程序和配套原生主机；首次发布 ZIP，后来按用户要求补充独立安装器，均不覆盖 v0.1.1 Release。

注册脚本随 ZIP 分发，按解压目录生成绝对主机路径；仅在用户主动运行时注册 HKCU 的测试主机，不修改 Chrome 站点权限。PrepareOnly 仅生成本地清单，Unregister 仅移除仍归本目录所有的注册值。打包 ZIP 使用明确文件清单，不递归收集本地配置、工作数据库或 previous-registration 备份。

## 本轮检查

- Node 测试 26 项、Rust 库测试 72 项、主机单元测试 2 项、主机子进程通信测试 2 项通过，共 102 个执行项（共享协议测试分别运行，不称为全部独立案例）；Rust 格式检查通过。
- 版本号一致性、两个 PowerShell 脚本语法解析通过；TypeScript/Vite 生产构建通过。
- 实际 Tauri Windows release/no-bundle 优化构建通过，用时 3 分 25 秒；主程序 PE 的 FileVersion、ProductVersion 均为 0.2.0-alpha.2，ProductName 为 WorkMemo Preview。实际构建日志中的 WORKMEMO_IDENTIFIER 为 com.workmemo.test.monitor。
- ZIP 恰好 14 个预期文件，CRC、主程序及主机与原始构建字节、独立 profile、测试主机名称、构建提交与全部本地 SHA256 校验通过；没有用户数据、注册备份、凭据或运行时端点文件。
- 从 ZIP 解压到带空格的新目录后，在当前 PowerShell 实际运行 PrepareOnly；生成的主机路径指向新目录，allowed_origins 只有固定扩展，注册表前后不变。
- Windows PowerShell 5.1 直接运行脚本被本机执行策略阻止，没有改写系统策略，也不称为该运行环境已通过。注册/撤销注册未在本轮额外改写用户环境；完整接入仍需用户按使用说明操作。
- GitHub draft 上传的 4 个资产大小及响应摘要与本地一致，随后公开为 prerelease。又从 4 个公开下载地址无认证实际下载，逐项复算大小和 SHA256 均一致；latest 稳定版 API 仍返回 v0.1.1。
- 远程 v0.2.0-alpha.2 标签与实际构建源码提交 556c85e9eeb9a99ec19e7dc205d03314250fa88a 相同；打包源码先提交推送，下载入口与本回执随后补充到 main。不强制推送。

## 下载与校验

[GitHub 预发布页](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.2) · [Windows x64 免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.2/WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip)

本机交付目录 E:\WorkMemo\artifacts\0.2.0-alpha.2，4 个公开资产如下。公开回执与下载复算副本位于此目录，未提交产物。

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.0-alpha.2_windows_x64_preview.zip | 3417580 | ec9e0fa7da07655eadf2515eac77ba406f686daf5fa6f7f68a34605e74e1dcc6 |
| PREVIEW-GUIDE.md | 3902 | 6a5b5e13d1b5e1e37499659548fc37da4b2f3e483c554d06f7811f70dda1211b |
| THIRD-PARTY-LICENSES.txt | 2235369 | 209d8cf282922bd772bb7901c77bf97dd3934cc98556050bae41c33dcd027786 |
| SHA256SUMS.txt | 290 | 16420a5183958306dae380358e537c0ff7db846d23eef607b7ed19fa27a89a25 |

## 重现命令与预期

~~~powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
& .\scripts\package-preview.ps1
Get-Content .\artifacts\0.2.0-alpha.2\SHA256SUMS.txt
~~~

预期自动测试通过；构建为 release 配置，ZIP 同时包含主程序、通信主机、独立 profile、7 个扩展文件、注册脚本、使用说明、许可、构建信息。构建信息记录实际构建源码提交。打包过程不启动 GUI、不操作用户任务、不迁移正式数据库。

## Git 与发布

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "build: prepare isolated automatic tracking preview release"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

发布使用 GitHub Release API，先创建 draft、上传并核对明确的 4 个资产，再设为 prerelease=true、draft=false、make_latest=false。只使用已有 Git 凭据的进程内值，不把凭据写入文件、命令参数、URL 或回执。GitHub API 依据 https://docs.github.com/en/rest/releases/releases 和 https://docs.github.com/en/rest/releases/assets 。
````````

## NEW FILE E:\WorkMemo\scripts\package-preview-installer.ps1

````````powershell
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$PortableZip,
    [Parameter(Mandatory=$true)][ValidatePattern('^[0-9a-fA-F]{64}$')][string]$ExpectedSha256
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($env:OS -ne 'Windows_NT') { throw 'Windows x64 is required.' }
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskZipPath = (Resolve-Path -LiteralPath $PortableZip).ProviderPath
if ((Get-FileHash -LiteralPath $taskZipPath -Algorithm SHA256).Hash -ne $ExpectedSha256) { throw 'Portable ZIP checksum mismatch.' }
$taskVersion = (Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
if ($taskVersion -notmatch '^\d+\.\d+\.\d+-alpha\.\d+$') { throw 'Expected an alpha version.' }
$taskOutput = Join-Path $taskRoot ('artifacts\' + $taskVersion + '\installer')
$taskStaging = Join-Path $taskOutput 'staging'
[IO.Directory]::CreateDirectory((Join-Path $taskStaging 'extension')) | Out-Null
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskNames = @('workmemo-preview.exe','workmemo-browser.exe','Register-Browser.ps1','使用说明.md','THIRD-PARTY-LICENSES.txt','workmemo-browser.profile.json','BUILD-INFO.json')
foreach ($taskName in @('manifest.json','background.js','matching.js','popup.html','popup.js','popup.css','bridge-config.js')) { $taskNames += 'extension/' + $taskName }
$taskZip = [IO.Compression.ZipFile]::OpenRead($taskZipPath)
try {
    if ($taskZip.Entries.Count -ne $taskNames.Count) { throw 'Unexpected portable ZIP entry count.' }
    foreach ($taskName in $taskNames) {
        $taskEntry = $taskZip.GetEntry('WorkMemo-Preview/' + $taskName)
        if ($null -eq $taskEntry) { throw ('Missing portable entry: ' + $taskName) }
        [IO.Compression.ZipFileExtensions]::ExtractToFile($taskEntry, (Join-Path $taskStaging $taskName), $true)
    }
} finally { $taskZip.Dispose() }
$taskInfo = Get-Content -LiteralPath (Join-Path $taskStaging 'BUILD-INFO.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskInfo.version -ne $taskVersion -or $taskInfo.identifier -ne 'com.workmemo.test.monitor' -or $taskInfo.configuration -ne 'release') { throw 'Portable metadata does not match preview release.' }
$taskProfile = Get-Content -LiteralPath (Join-Path $taskStaging 'workmemo-browser.profile.json') -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskProfile.identifier -ne $taskInfo.identifier) { throw 'Browser profile mismatch.' }
$taskLicense = Join-Path $taskRoot 'docs\THIRD-PARTY-LICENSES.txt'
if ((Get-FileHash -LiteralPath $taskLicense).Hash -ne (Get-FileHash -LiteralPath (Join-Path $taskStaging 'THIRD-PARTY-LICENSES.txt')).Hash) { throw 'Dependency notices differ from the portable release.' }
$taskPackagingCommit = & git -C $taskRoot rev-parse HEAD
if ($LASTEXITCODE -ne 0) { throw 'Unable to identify packaging commit.' }
$taskUtf8 = New-Object Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $taskStaging 'INSTALLER-BUILD-INFO.json'), (@{version=$taskVersion;application_source_commit=$taskInfo.source_commit;packaging_source_commit=$taskPackagingCommit;portable_sha256=$ExpectedSha256.ToLowerInvariant();identifier=$taskInfo.identifier;runtime_acceptance='pending'} | ConvertTo-Json), $taskUtf8)

# Bundle the exact published app bytes under a separate process name.
$taskBinary = Join-Path $taskRoot 'src-tauri\target\release\workmemo-preview.exe'
[IO.Directory]::CreateDirectory((Split-Path -Parent $taskBinary)) | Out-Null
Copy-Item -LiteralPath (Join-Path $taskStaging 'workmemo-preview.exe') -Destination $taskBinary -Force
$taskResources = @{}
foreach ($taskName in $taskNames) {
    if ($taskName -in @('workmemo-preview.exe','THIRD-PARTY-LICENSES.txt','使用说明.md')) { continue }
    $taskResources[(Join-Path $taskStaging $taskName)] = $taskName
}
$taskResources[(Join-Path $taskRoot 'docs\PREVIEW-INSTALLER-GUIDE.md')] = '使用说明.md'
$taskResources[(Join-Path $taskStaging 'INSTALLER-BUILD-INFO.json')] = 'INSTALLER-BUILD-INFO.json'
$taskOverlay = @{mainBinaryName='workmemo-preview';bundle=@{resources=$taskResources;windows=@{nsis=@{startMenuFolder='WorkMemo Preview'}}}}
$taskOverlayPath = Join-Path $taskOutput 'installer.conf.json'
[IO.File]::WriteAllText($taskOverlayPath, ($taskOverlay | ConvertTo-Json -Depth 10), $taskUtf8)
Push-Location $taskRoot
try {
    & npm.cmd run tauri -- bundle --ci --bundles nsis --no-binary-patching --config src-tauri/tauri.preview.conf.json --config $taskOverlayPath
    if ($LASTEXITCODE -ne 0) { throw 'NSIS installer bundling failed.' }
} finally { Pop-Location }
if ((Get-FileHash -LiteralPath $taskBinary).Hash -ne (Get-FileHash -LiteralPath (Join-Path $taskStaging 'workmemo-preview.exe')).Hash) { throw 'Bundler changed published application bytes.' }
$taskGeneratedSetup = Join-Path $taskRoot ('src-tauri\target\release\bundle\nsis\WorkMemo Preview_' + $taskVersion + '_x64-setup.exe')
$taskSetupName = 'WorkMemo_' + $taskVersion + '_x64-preview-setup.exe'
Copy-Item -LiteralPath $taskGeneratedSetup -Destination (Join-Path $taskOutput $taskSetupName) -Force
Copy-Item -LiteralPath (Join-Path $taskRoot 'docs\PREVIEW-INSTALLER-GUIDE.md') -Destination (Join-Path $taskOutput 'INSTALLER-GUIDE.md') -Force
$taskChecksums = foreach ($taskName in @($taskSetupName,'INSTALLER-GUIDE.md')) {
    (Get-FileHash -LiteralPath (Join-Path $taskOutput $taskName)).Hash.ToLowerInvariant() + '  ' + $taskName
}
[IO.File]::WriteAllLines((Join-Path $taskOutput 'INSTALLER-SHA256SUMS.txt'), $taskChecksums, $taskUtf8)
Write-Output ('Installer delivery: ' + $taskOutput)
````````
