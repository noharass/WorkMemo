# Chrome 本机主机注册修复完整源码

完整收录本轮变更文本，统一换行，不使用省略号替代代码。除本汇编自身外，交付清单文件均完整收录；实际构建使用原始文件。暂缓的灵动岛草稿不属于本次变更。

## 文件清单

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\.gitattributes |
| UPDATE | E:\WorkMemo\README.md |
| UPDATE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-DELIVERY.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-FIX.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md |
| UPDATE | E:\WorkMemo\scripts\package-preview-installer.ps1 |
| NEW FILE | E:\WorkMemo\scripts\register-preview-browser.cmd |
| NEW FILE | E:\WorkMemo\scripts\test-browser-registration.ps1 |
| NEW FILE | E:\WorkMemo\src-tauri\installer\browser-bridge.nsh |
| NEW FILE | E:\WorkMemo\src-tauri\installer\com.workmemo.browser_bridge_test.json |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-SOURCE.md |

## UPDATE E:\WorkMemo\.gitattributes

````````text
* text=auto eol=lf
*.cmd text eol=crlf

# Preserve third-party license text verbatim, including upstream whitespace.
docs/THIRD-PARTY-LICENSES.txt -text -whitespace
scripts/third-party-licenses/*.txt -text -whitespace
*.png binary
*.ico binary
*.icns binary
````````

## UPDATE E:\WorkMemo\README.md

````````markdown
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前源码正在分阶段改造自动工作记录。第一阶段已加入持久计时区间和结束后补填工作量；第二阶段已实现 Windows 输入/系统状态、Chrome 原生通信、5/7 分钟与离页计时规则、托盘和非模态提醒的代码，**真实 Chrome 接入及原生交互尚待验收**。已确认规则见 [自动记录规范](docs/AUTO-TRACKING-SPEC.md)，当前结果见 [第二阶段进度](docs/AUTO-TRACKING-PHASE-2.md)，接入步骤见 [独立验收说明](docs/BROWSER-BRIDGE.md)。源码数据库升级到版本 3 后，旧版程序会拒绝读取；本轮未迁移真实工作数据库。下文成品信息及既有验收记录对应已发布版本，不能作为此次改造的验收结果。

[下载自动记录预览版 v0.2.0-alpha.3](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.3)：[中文 EXE 安装修复版 R2](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/WorkMemo_0.2.0-alpha.3_x64-preview-setup-r2.exe) · [Windows x64 免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/WorkMemo_0.2.0-alpha.3_windows_x64_preview.zip)。R2 会自动注册 Chrome 本机主机，修复已安装软件仍提示 host not found 的首次接入问题；原应用计时与 UI 不变。均包含独立数据的主程序、浏览器主机、Chrome 扩展及接入文件；[安装版说明](docs/PREVIEW-INSTALLER-GUIDE.md) · [连接修复说明](docs/BROWSER-REGISTRATION-FIX.md) · [完整检查与源码](docs/BROWSER-REGISTRATION-DELIVERY.md)。完整原生交互仍待验收，稳定版下载保留如下。

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

## UPDATE E:\WorkMemo\docs\BROWSER-BRIDGE.md

````````markdown
# Chrome 接入与第二阶段独立验收

当前是开发验收版本，尚未发布到 Chrome 商店。第二阶段代码与自动测试已准备，真实浏览器、托盘、提醒窗口和锁屏/休眠交互仍待验收；不能把编译或模拟时钟测试当成这些场景已通过。

用户要求后已发布独立数据的 release 优化预览 ZIP：[v0.2.0-alpha.3](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.3)。从 GitHub 下载后按 PREVIEW-GUIDE.md 接入；下文保留本机 debug 验收包路径与源码准备步骤，两种程序使用相同测试数据标识，不能同时运行。

遇到 Specified native messaging host not found 时，参见 BROWSER-REGISTRATION-FIX.md。新的 alpha.3 R2 EXE 会自动注册当前用户主机；早先 EXE 与 ZIP 仍需要注册步骤，源码扩展与预览包的主机名不能混用。R2 实际检查与下载见 BROWSER-REGISTRATION-DELIVERY.md。

## 本机已准备的独立验收包

- 程序：E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe
- 扩展目录：E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\extension
- 原生主机：同目录 workmemo-browser.exe。
- 原生主机清单：同目录 com.workmemo.browser_bridge_test.json。
- 扩展 ID：oljcealhccdhaddceacnokihjefloaih。
- 程序标题：WorkMemo 第二阶段验收（独立数据）。

只读探针已实际确认程序的 Tauri 应用标识为 com.workmemo.test.monitor。其数据库位于 %LOCALAPPDATA%\com.workmemo.test.monitor，外观位于 %APPDATA%\com.workmemo.test.monitor，与正式 com.workmemo.desktop 分开。默认没有工作 URL，也不启用自动页面识别。

独立 EXE 已复制出 target/debug，后续源码编译不会覆盖这份验收程序。不要将默认构建的 target/debug/workmemo.exe 直接当作独立验收包运行；普通构建仍使用正式应用标识。

## 手动接入步骤

1. 在 PowerShell 执行下面两条命令。第一条注册当前用户的独立测试主机，第二条启动独立程序。

~~~powershell
& 'E:\WorkMemo\scripts\prepare-browser-bridge.ps1' -ProfileId 'com.workmemo.test.monitor' -Register
& 'E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe'
~~~

注册只写 HKCU\Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test，不需要管理员权限，不修改正式主机名称。脚本未加 -Register 时只准备文件；本轮已实际执行独立测试主机注册并只读核对该值。

2. 在 Chrome 打开 chrome://extensions。由用户开启开发者模式并选择“加载已解压的扩展程序”，选择上面的 extension 目录。首次安装或站点授权应由用户操作；没有自动修改 Chrome 的权限设置。
3. 在独立 WorkMemo 中打开“监测设置”，添加自己明确选择的工作 URL 和类别，勾选启用后保存。URL 只支持 http/https，不含用户名或密码；查询参数和片段会去除。
4. 打开 Chrome 工具栏中的 WorkMemo 扩展，点击“同步工作站点授权”，由用户确认只授权已配置站点。扩展会显示当前连接和授权状态。
5. 切换到该工作页面并保持 Chrome 前台，再进行一次新的鼠标或键盘操作，等待约一个检查周期。预期自动出现一条记录，来源为自动监测，工作量未填；仅打开页面或后台保留标签页不开始。

请在完成后回复“已接入，可以继续验收”，或描述实际错误。安装与授权本身不代表已验证所有计时场景。

## 建议验收顺序

1. 先验证自动开始、手动暂停保护、手动继续不要求 URL、结束后填写 0、稍后填写及新任务不受旧待补全阻碍。
2. 离开匹配页面并在其他应用持续操作：约 2 分钟自动暂停；再保留 10 分钟后结束。返回工作页面后需要新输入，保留期内应恢复同 ID，暂停段不计时。
3. 有合适空档时才验证整段空闲：5 分钟非阻塞提醒，7 分钟结束，最后输入后的尾段扣除。不要为验收中断实际工作；模拟时钟覆盖与真实等待结果分别记录。
4. 关闭主窗口后从托盘重新打开，确认记录仍在后台运行；托盘“退出 WorkMemo”与布局设置里的退出入口会保存暂停并退出。
5. 核对提醒不抢走其他应用的键盘焦点；关闭提醒后待补全保留。再检查四种皮肤、透明、缩放、滚动和重启恢复。
6. 锁屏/休眠需要用户在适当时机操作，不自动锁定电脑。期间不可确认的时间不得计入工时。

## 通信与权限

扩展只使用 nativeMessaging、用于重连的 alarms，以及用户按需授予的工作站点权限；不申请全量 tabs 权限，不注入内容脚本，不采集文本或鼠标轨迹。Chrome 站点权限的路径行为见 [Chrome 匹配模式](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns)；业务匹配另校验精确来源、端口与路径边界。

扩展发给本机的帧只含协议版本、消息序号、配置版本、窗口是否前台、授权是否齐备、匹配规则 ID。网页 URL、标题、内容和输入文本均不在帧中。配套主机仅允许固定扩展 origin，使用 Windows 的长度前缀 JSON 协议；依据 [Chrome Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)。

桌面与原生主机之间只监听动态 127.0.0.1 端口，使用每次启动重新生成的随机校验值。端点文件位于当前用户应用数据目录，不进入源码、交付包或浏览器回复；没有云服务器。原生端口保持扩展 worker 活跃的行为依据 [Chrome worker 生命周期](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)。

页面心跳失联超过 15 秒、权限不足或配置版本不匹配时，自动记录暂停，并回退至最后可信页面边界；不会把发现断连前的整段等待直接计入工时。异常暂停保留 10 分钟，期间仍受更早的 7 分钟空闲结束约束，超时结束为待补全，避免永久占用活动记录。手动暂停及重启待恢复记录不被自动处理。

Windows 仅读取当前会话最后输入、前台程序身份及锁屏/电源状态。GetLastInputInfo 的会话与时间特性见 [Microsoft 文档](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getlastinputinfo)。不会记录按键、输入内容或鼠标坐标。

## 从源码重新准备

先完成 npm build 和 Rust 检查。Tauri 隔离构建应在其他测试之后运行，再立即复制，避免后续普通 Cargo 构建覆盖 target/debug 中的同名程序。

~~~powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd run build
New-Item -ItemType Directory -Force .\src-tauri\target | Out-Null
$taskConfig = Get-Content -Raw .\src-tauri\tauri.conf.json | ConvertFrom-Json
$taskConfig.identifier = 'com.workmemo.test.monitor'
$taskConfig.productName = 'WorkMemo Monitor Test'
$taskConfig.app.windows[0].title = 'WorkMemo 第二阶段验收（独立数据）'
[IO.File]::WriteAllText((Join-Path (Get-Location) 'src-tauri\target\monitor-test.conf.json'), ($taskConfig | ConvertTo-Json -Depth 20), (New-Object Text.UTF8Encoding($false)))
npm.cmd run tauri -- build --debug --no-bundle --config src-tauri/target/monitor-test.conf.json
& .\scripts\prepare-browser-bridge.ps1 -ProfileId com.workmemo.test.monitor -AppBinaryPath .\src-tauri\target\debug\workmemo.exe
& .\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe --monitor-probe
~~~

最后一条是 debug 专用只读探针，不创建窗口或打开数据库。预期 application_id 为 com.workmemo.test.monitor；只有 native_available=true 且 unlocked=true 时，当前会话的监测状态才可用。
````````

## NEW FILE E:\WorkMemo\docs\BROWSER-REGISTRATION-DELIVERY.md

````````markdown
# Chrome 本机主机注册修复交付

日期：2026-10-27（Asia/Shanghai）。用户确认其他用户使用 Google Chrome 且已安装完整 EXE，但扩展报 Specified native messaging host not found。灵动岛更新按用户要求暂缓，草稿保留，不混入本次修复。

## 原因、范围与兼容性

已检查实际打包脚本、NSIS 配置、注册脚本、扩展主机名及 Chrome 官方 Native Messaging 说明。原安装器只复制文件，需要另行运行 Register-Browser.ps1；首次安装遗漏注册或执行策略阻止脚本时，Chrome 找不到主机。本错误发生在连接软件之前，不能通过重复站点授权解决。

补充 alpha.3 R2 安装器，在当前用户安装成功后自动生成主机清单并注册 HKCU；另提供无需 PowerShell 的 Register-Browser.cmd 一键修复。主机名及固定扩展 origin 不变，不扩大站点权限。清单使用 Windows 支持的相对主机路径，避免中文目录写入 JSON 的编码问题。卸载只移除仍属于本目录的注册。

业务程序与主机复用已发布 alpha.3 ZIP 中的原始字节，应用版本仍为 0.2.0-alpha.3，R2 表示安装器打包修订。SQLite、计时、历史、外观与 UI 代码均不修改。原有 Release 资产与标签不覆盖；新增资产另用 R2 名称和单独校验文件。暂缓的灵动岛草稿不提交到本次修复。

## 文件与完整源码

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\.gitattributes |
| NEW FILE | E:\WorkMemo\scripts\register-preview-browser.cmd |
| NEW FILE | E:\WorkMemo\scripts\test-browser-registration.ps1 |
| NEW FILE | E:\WorkMemo\src-tauri\installer\browser-bridge.nsh |
| NEW FILE | E:\WorkMemo\src-tauri\installer\com.workmemo.browser_bridge_test.json |
| UPDATE | E:\WorkMemo\scripts\package-preview-installer.ps1 |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-FIX.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-DELIVERY.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-REGISTRATION-SOURCE.md |
| UPDATE | E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| UPDATE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| UPDATE | E:\WorkMemo\README.md |

完整代码另保存在 BROWSER-REGISTRATION-SOURCE.md，不使用省略号代替代码；构建使用各原始文件。

## 已实际执行的检查

- 隔离 NSIS 测试安装器在 artifacts 下的中文、空格、&、! 目录完成静默安装及卸载。注册只写随机的 HKCU\Software\WorkMemo\RegistrationTests 测试键，不修改真实 Chrome 主机键。
- 核对主机清单字段、固定 origin、相对 EXE 路径、注册表完整路径；所属目录卸载会清除注册，旧目录卸载不会删除模拟较新目录的注册。
- 核对 Tauri 实际卸载模板顺序后，将注册清理放到 POSTUNINSTALL；清单作为普通资源打包，取消运行中程序的卸载不会在检查前删掉注册或清单。
- CMD 的 prepare-only 模式实际验证缺少文件会失败、正确预览包可生成清单、混用源码扩展会失败，且真实 Chrome 主机注册前后保持不变。首次测试工具的 CMD 引号传参失败，改为 ProcessStartInfo 原始参数后重跑通过。
- CMD 使用 ASCII 内容和 CRLF 换行，Git 属性显式保留 Windows 换行，避免后续检出改变修复文件格式。
- 不依赖客户机 PowerShell 执行策略；测试工具使用 PowerShell 只是源码环境的检查方式。没有为测试修改系统策略、停止用户任务或操作真实工作数据库。

- R2 实际 NSIS 打包通过，7-Zip 完整性测试、解包与 17 项应用/资源字节核对通过；原始主程序及主机字节与 alpha.3 ZIP 一致，CMD 为 ASCII/CRLF。
- 安装包、修复 CMD、说明、校验文件共 4 个新资产上传成功；从正式公开地址无认证下载后逐项复算大小与 SHA256，全部一致。原 7 个资产字节不变，当前预发布共 11 个资产，latest 稳定版仍为 v0.1.1。
- 本次未修改业务代码，不将先前的 106 个测试执行项称为本轮重新执行。其他用户机器的真实 Chrome 重连需要用户反馈，不以隔离测试替代；没有在当前真实安装目录运行成品安装器或卸载器。

## 下载与校验

[R2 EXE 安装修复版](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/WorkMemo_0.2.0-alpha.3_x64-preview-setup-r2.exe) · [一键修复 CMD](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/Register-Browser.cmd) · [使用说明](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.3/REGISTRATION-FIX-GUIDE.md)

本机交付目录 E:\WorkMemo\artifacts\0.2.0-alpha.3\installer-r2；公开回执 RELEASE-RECEIPT.json 与下载复算副本 download-check 位于该忽略目录，不提交产物或私密配置。

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.2.0-alpha.3_x64-preview-setup-r2.exe | 2441209 | b5e3b9cfc3811fc2af7ec28d6d51e78ba31c1e1c9eda9d455187efe984379c7d |
| Register-Browser.cmd | 2500 | c67408890124940fedd9cfb100a01b8aae0cc3b80967ff247e90cb52e01c2cc6 |
| REGISTRATION-FIX-GUIDE.md | 3025 | f9811efd308fd2f04103041e2d8ea05ddcbec3913334f618d7849e6ff614edc4 |
| REGISTRATION-FIX-SHA256SUMS.txt | 296 | 7ab31fd7560744aec0585bd7d31dc687956b529e9c9e80d8a8ba53587ebb0b16 |

原应用源码提交 fb615040ab95448cecb3236f67e08e44cee77e66，R2 打包源码 b52fae6；随后文档回执另行提交。原应用标签不移动。

## PowerShell 重现与预期

~~~powershell
Set-Location 'E:\WorkMemo'
& .\scripts\test-browser-registration.ps1
& .\scripts\package-preview-installer.ps1 -PortableZip .\artifacts\0.2.0-alpha.3\WorkMemo_0.2.0-alpha.3_windows_x64_preview.zip -ExpectedSha256 15a6dd85dca26eb589fd7a2675f9d4cd21c67b3cbf5a2fb19563b7baa6f527a3 -InstallerRevision r2
~~~

预期测试仅影响随机隔离键和 artifacts 内测试目录，真实 Chrome 注册不变；R2 成品包含已测试的安装/卸载钩子和一键修复文件，复用原始应用字节。用户无需运行源码测试；使用步骤见 BROWSER-REGISTRATION-FIX.md。

## Git 与发布

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "fix: register the Chrome native host during preview installation"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

只提交注册修复相关文件，排除依赖、产物、数据库、凭据与暂缓草稿；随后补充公开回执。不强制推送、不移动原应用标签。GitHub 凭据仅在上传进程内使用，回执仅保存公开元数据。
````````

## NEW FILE E:\WorkMemo\docs\BROWSER-REGISTRATION-FIX.md

````````markdown
# Chrome 提示 native messaging host not found

适用：Windows x64、Google Chrome、WorkMemo v0.2.0-alpha.3 预览包。报错为“Specified native messaging host not found”。

它表示 Chrome 没找到可用的本机主机注册/清单，尚未进入软件通信，更不是站点授权未生效。可能是未注册、路径已失效，或混用了源码扩展与预览包。Chrome 的[官方排查说明](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging#debug-native-messaging)要求检查主机名、注册表默认值、清单和主机文件。

## 推荐：使用修复安装器

从同一 GitHub v0.2.0-alpha.3 Release 下载文件名以 x64-preview-setup-r2.exe 结尾的安装包。先从托盘正常退出旧 WorkMemo，再运行安装器；已安装同版本时选择重新安装。R2 会自动在当前 Windows 用户下注册 Chrome 本机主机，无需运行 PowerShell 脚本或更改执行策略。

打开 WorkMemo，并在 Chrome 扩展管理页重新加载包内 extension。连接成功后再同步工作站点授权。原有记录、待补全、工作网址与外观保持在原数据目录；不要删除这些目录。

## 已有完整预览包的一键修复

将随修复版提供的 Register-Browser.cmd 放到 workmemo-browser.exe 所在的文件夹，再双击运行。它会验证配套 extension、预览数据标识及主机文件，生成本机清单并写入当前用户的 Chrome 主机注册。成功后启动 WorkMemo，重新加载 Chrome 的 WorkMemo 扩展。

该文件不能放在任意下载目录直接运行，必须与 workmemo-browser.exe、workmemo-browser.profile.json 和 extension 文件夹放在一起。若提示缺文件，重新完整安装或解压；若提示配置不匹配，使用安装包内的 extension，不要使用 GitHub 源码目录 browser-extension 来连接预览版。

一键修复不依赖 PowerShell，不修改脚本执行策略或 Chrome 站点权限，不清空数据库。若组织策略禁止注册，修复程序会报告失败；不把失败当作连接成功。

## 范围与核对

- 主机名：com.workmemo.browser_bridge_test。
- 注册位置：HKCU\Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test；默认值为本机清单的完整路径。
- 清单只允许 chrome-extension://oljcealhccdhaddceacnokihjefloaih/。
- 清单 path 使用 Windows 支持的相对路径 workmemo-browser.exe，以清单所在目录解析，兼容空格与中文安装目录。
- 主机 profile 为 com.workmemo.test.monitor，与当前预览程序一致。

安装器卸载时只清除仍指向本安装目录的注册；旧目录的卸载器不得删除较新目录的注册。工作数据仍按已有卸载选项处理，默认保留。

仍报错时，提供扩展面板错误文字、所用浏览器名称、下载的包文件名及修复窗口报错即可；不要发送工作数据库、网页内容或认证值。alpha.2 还有已修复的心跳问题，应升级到 alpha.3 R2。
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

当前源码版本 0.2.0-alpha.3，自动记录预览包请运行 scripts/package-preview.ps1。脚本执行许可证收集、Tauri release/no-bundle 构建，使用 src-tauri/tauri.preview.conf.json 将标识设为 com.workmemo.test.monitor，输出 artifacts/0.2.0-alpha.3 下的免安装 ZIP、说明、许可和校验文件。ZIP 包含主程序、原生通信主机、扩展及可在解压目录运行的注册脚本，不包含工作数据库、运行时端点或凭据。此脚本不会启动程序或注册主机。使用步骤见 PREVIEW-GUIDE.md；实际发布结果另见 RELEASE-0.2.0-alpha.3.md。

~~~powershell
Set-Location 'E:\WorkMemo'
& .\scripts\package-preview.ps1
~~~

用户要求补充的 EXE 安装器使用已经公开且校验一致的预览 ZIP 字节，不重新编译业务程序：

~~~powershell
& .\scripts\package-preview-installer.ps1 -PortableZip .\artifacts\0.2.0-alpha.3\WorkMemo_0.2.0-alpha.3_windows_x64_preview.zip -ExpectedSha256 15a6dd85dca26eb589fd7a2675f9d4cd21c67b3cbf5a2fb19563b7baa6f527a3
~~~

当前打包脚本默认生成 R2，输出到 artifacts/0.2.0-alpha.3/installer-r2。NSIS 当前用户安装器使用 WorkMemo Preview 名称及 workmemo-preview.exe 进程，包含主机与扩展，沿用独立测试数据，并自动注册 HKCU 的 Chrome 本机主机。主机清单是相对 EXE 路径的固定资源，安装后写注册，卸载成功后只清除所属目录的注册。成品字节核对、隔离安装/卸载测试及公开下载复算见 BROWSER-REGISTRATION-DELIVERY.md。

~~~powershell
& .\scripts\test-browser-registration.ps1
~~~

测试只使用 artifacts 内的随机目录与 HKCU\Software\WorkMemo\RegistrationTests 隔离键；真实 Chrome 注册前后须相同。R2 另包含不依赖 PowerShell 的 Register-Browser.cmd。客户机不需要运行源码测试或修改执行策略；接入步骤见 BROWSER-REGISTRATION-FIX.md。

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

## UPDATE E:\WorkMemo\docs\PREVIEW-INSTALLER-GUIDE.md

````````markdown
# WorkMemo v0.2.0-alpha.3 EXE 安装版 R2

先从托盘正常退出旧预览程序，再双击 WorkMemo_0.2.0-alpha.3_x64-preview-setup-r2.exe，按中文安装向导完成。已有相同版本时选择重新安装。安装完成后从桌面或开始菜单打开 WorkMemo Preview。

R2 补充安装时自动注册 Chrome 本机主机，不改应用计时或 UI，也不需要删除已有记录、工作网址或外观设置。请在运行 Chrome 的同一个 Windows 用户下安装，无需管理员权限。

这是 Windows x64 预发布版，使用当前用户安装模式，无需手动解压。需要 Microsoft Edge WebView2 Runtime；缺少时安装器联网下载微软运行环境。程序尚无代码签名。真实 Chrome 接入、5/7 分钟等待、锁屏/休眠、托盘、提醒焦点和四皮肤原生透明仍待验收。

安装目录可在向导中选择，默认在当前用户的本地应用目录。安装器随程序放置 workmemo-browser.exe、Register-Browser.cmd、Register-Browser.ps1、workmemo-browser.profile.json、extension 文件夹、使用说明与第三方许可。右键程序快捷方式并选择“打开文件所在的位置”，可找到这些文件。

## 首次接入 Chrome

1. R2 安装器已自动注册当前用户的 com.workmemo.browser_bridge_test，一般无需再运行脚本。若旧安装、移动目录或需要修复，双击安装目录里的 Register-Browser.cmd；它不依赖 PowerShell、不修改脚本执行策略。原来的 .ps1 文件作为备用保留。

2. 用户在 Chrome 打开 chrome://extensions，开启开发者模式，选择“加载已解压的扩展程序”，选当前安装目录里的 extension 文件夹。不要选择 GitHub 源码目录 browser-extension。已加载其他目录时，重新选择正确目录；只点旧目录的重新加载按钮不会改变扩展来源。
3. 在 WorkMemo 的“监测设置”添加自己选定的工作网址与类别，启用并保存。打开 Chrome 的 WorkMemo 扩展，点击“同步工作站点授权”，由用户确认站点权限。
4. 回到匹配工作页，保持 Chrome 前台并进行一次新的点击或键盘输入，约 5 秒内预期自动开始。仅打开工作页面不开始。

## 日常使用

- 最后输入后 5 分钟提醒，7 分钟结束；最后输入后的尾段不计入有效工时。阅读、思考等低输入工作可能少记，完整时间修正界面尚不在本阶段。
- 连续离页 2 分钟暂停，再保留 10 分钟；期间返回工作页并有新输入，恢复原记录。规则先到期者生效，同刻优先空闲。
- 结束后填写工作量，也可稍后到待补全列表填写。手动暂停需要手动继续。
- 关闭窗口继续在托盘运行；从托盘选择“退出 WorkMemo”才会保存暂停并退出。

工作数据在 %LOCALAPPDATA%\com.workmemo.test.monitor，外观在 %APPDATA%\com.workmemo.test.monitor。安装版与之前的独立验收/免安装预览版使用相同测试数据；同一时间只运行一个预览实例。正式版 com.workmemo.desktop 使用另一数据目录。不要复制真实数据库到测试目录，版本 3 不能由旧版程序读取。

## 卸载

先从托盘退出预览程序，再从 Windows 的已安装应用中卸载 WorkMemo Preview。R2 卸载器只清除仍指向本安装目录的测试主机注册，不移除较新目录的注册。Chrome 扩展由用户手动停用或移除。卸载时保留工作记录；不要选择清除应用数据，除非确认需要删除测试记录。
````````

## UPDATE E:\WorkMemo\scripts\package-preview-installer.ps1

````````powershell
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$PortableZip,
    [Parameter(Mandatory=$true)][ValidatePattern('^[0-9a-fA-F]{64}$')][string]$ExpectedSha256,
    [ValidatePattern('^[a-z0-9-]+$')][string]$InstallerRevision = 'r2'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ($env:OS -ne 'Windows_NT') { throw 'Windows x64 is required.' }
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskZipPath = (Resolve-Path -LiteralPath $PortableZip).ProviderPath
if ((Get-FileHash -LiteralPath $taskZipPath -Algorithm SHA256).Hash -ne $ExpectedSha256) { throw 'Portable ZIP checksum mismatch.' }
$taskVersion = (Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
if ($taskVersion -notmatch '^\d+\.\d+\.\d+-alpha\.\d+$') { throw 'Expected an alpha version.' }
$taskOutput = Join-Path $taskRoot ('artifacts\' + $taskVersion + '\installer-' + $InstallerRevision)
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
$taskResources[(Join-Path $taskRoot 'scripts\register-preview-browser.cmd')] = 'Register-Browser.cmd'
$taskResources[(Join-Path $taskRoot 'src-tauri\installer\com.workmemo.browser_bridge_test.json')] = 'com.workmemo.browser_bridge_test.json'
$taskResources[(Join-Path $taskStaging 'INSTALLER-BUILD-INFO.json')] = 'INSTALLER-BUILD-INFO.json'
$taskOverlay = @{mainBinaryName='workmemo-preview';bundle=@{resources=$taskResources;windows=@{nsis=@{startMenuFolder='WorkMemo Preview';installerHooks=(Join-Path $taskRoot 'src-tauri\installer\browser-bridge.nsh')}}}}
$taskOverlayPath = Join-Path $taskOutput 'installer.conf.json'
[IO.File]::WriteAllText($taskOverlayPath, ($taskOverlay | ConvertTo-Json -Depth 10), $taskUtf8)
Push-Location $taskRoot
try {
    & npm.cmd run tauri -- bundle --ci --bundles nsis --no-binary-patching --config src-tauri/tauri.preview.conf.json --config $taskOverlayPath
    if ($LASTEXITCODE -ne 0) { throw 'NSIS installer bundling failed.' }
} finally { Pop-Location }
if ((Get-FileHash -LiteralPath $taskBinary).Hash -ne (Get-FileHash -LiteralPath (Join-Path $taskStaging 'workmemo-preview.exe')).Hash) { throw 'Bundler changed published application bytes.' }
$taskGeneratedSetup = Join-Path $taskRoot ('src-tauri\target\release\bundle\nsis\WorkMemo Preview_' + $taskVersion + '_x64-setup.exe')
$taskSetupName = 'WorkMemo_' + $taskVersion + '_x64-preview-setup-' + $InstallerRevision + '.exe'
Copy-Item -LiteralPath $taskGeneratedSetup -Destination (Join-Path $taskOutput $taskSetupName) -Force
Copy-Item -LiteralPath (Join-Path $taskRoot 'docs\BROWSER-REGISTRATION-FIX.md') -Destination (Join-Path $taskOutput 'REGISTRATION-FIX-GUIDE.md') -Force
Copy-Item -LiteralPath (Join-Path $taskRoot 'scripts\register-preview-browser.cmd') -Destination (Join-Path $taskOutput 'Register-Browser.cmd') -Force
$taskChecksums = foreach ($taskName in @($taskSetupName,'REGISTRATION-FIX-GUIDE.md','Register-Browser.cmd')) {
    (Get-FileHash -LiteralPath (Join-Path $taskOutput $taskName)).Hash.ToLowerInvariant() + '  ' + $taskName
}
[IO.File]::WriteAllLines((Join-Path $taskOutput 'REGISTRATION-FIX-SHA256SUMS.txt'), $taskChecksums, $taskUtf8)
Write-Output ('Installer delivery: ' + $taskOutput)
````````

## NEW FILE E:\WorkMemo\scripts\register-preview-browser.cmd

````````batch
@echo off
setlocal DisableDelayedExpansion
set "wm_host=com.workmemo.browser_bridge_test"
set "wm_key=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test"
set "wm_manifest=%~dp0com.workmemo.browser_bridge_test.json"
if not exist "%~dp0workmemo-browser.exe" (
  echo ERROR: Put this file next to workmemo-browser.exe in the WorkMemo Preview folder.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
if not exist "%~dp0extension\bridge-config.js" (
  echo ERROR: The bundled extension folder is missing. Extract the complete package.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
if not exist "%~dp0workmemo-browser.profile.json" (
  echo ERROR: The browser profile is missing. Use the complete WorkMemo Preview package.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
findstr /L /C:"com.workmemo.test.monitor" "%~dp0workmemo-browser.profile.json" >nul
if errorlevel 1 (
  echo ERROR: This repair file is only for the com.workmemo.test.monitor preview package.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
findstr /L /C:"com.workmemo.browser_bridge_test" "%~dp0extension\bridge-config.js" >nul
if errorlevel 1 (
  echo ERROR: Use the extension bundled with WorkMemo Preview, not browser-extension from the source repository.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
> "%wm_manifest%" echo {"name":"com.workmemo.browser_bridge_test","description":"WorkMemo Preview local browser bridge","path":"workmemo-browser.exe","type":"stdio","allowed_origins":["chrome-extension://oljcealhccdhaddceacnokihjefloaih/"]}
if errorlevel 1 (
  echo ERROR: Cannot write the host manifest. Use your current-user installation folder.
  if /I not "%~1"=="/prepare-only" pause
  exit /b 1
)
if /I "%~1"=="/prepare-only" (
  echo Host manifest prepared. Registry unchanged.
  exit /b 0
)
if not exist "%~dp0previous-browser-registration.txt" (
  reg.exe query "%wm_key%" /ve >nul 2>nul
  if not errorlevel 1 reg.exe query "%wm_key%" /ve > "%~dp0previous-browser-registration.txt"
)
reg.exe add "%wm_key%" /ve /t REG_SZ /d "%wm_manifest%" /f >nul
if errorlevel 1 (
  echo ERROR: Current-user Chrome host registration failed. Check your organization policy.
  pause
  exit /b 1
)
echo WorkMemo Preview browser host registered for the current Windows user.
echo Start WorkMemo, then reload the bundled extension in Chrome.
echo Work records and site permissions were not changed.
pause
exit /b 0
````````

## NEW FILE E:\WorkMemo\scripts\test-browser-registration.ps1

````````powershell
[CmdletBinding()]
param([string]$HostBinary)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskVersion = (Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $taskRoot 'package.json') | ConvertFrom-Json).version
if (-not $HostBinary) { $HostBinary = Join-Path $taskRoot ('artifacts\' + $taskVersion + '\portable\WorkMemo-Preview\workmemo-browser.exe') }
$taskHost = (Resolve-Path -LiteralPath $HostBinary).ProviderPath
$taskNsis = Join-Path $env:LOCALAPPDATA 'tauri\NSIS\makensis.exe'
if (-not (Test-Path -LiteralPath $taskNsis)) { throw 'The cached NSIS tool is required.' }
$taskNonce = [Guid]::NewGuid().ToString('N')
$taskDirectory = Join-Path $taskRoot ('artifacts\browser-registration-tests\' + $taskNonce)
$taskInstall = Join-Path $taskDirectory '中文安装 & !'
$taskWorkspace = [IO.Path]::GetFullPath((Join-Path $taskRoot 'artifacts')) + [IO.Path]::DirectorySeparatorChar
if (-not ([IO.Path]::GetFullPath($taskInstall)).StartsWith($taskWorkspace, [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe test path.' }
[IO.Directory]::CreateDirectory($taskDirectory) | Out-Null
$taskTestKey = 'Software\WorkMemo\RegistrationTests\' + $taskNonce
$taskActualKey = 'Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test'
function Read-DefaultValue([string]$Path) {
    $taskKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($Path)
    if ($null -eq $taskKey) { return $null }
    try { return $taskKey.GetValue('') } finally { $taskKey.Dispose() }
}
$taskBefore = Read-DefaultValue $taskActualKey
$taskTemplate = @'
Unicode true
RequestExecutionLevel user
SilentInstall silent
SilentUnInstall silent
Name "WorkMemo bridge registration test"
OutFile "@SETUP@"
InstallDir "@INSTALL@"
!define WM_BRIDGE_REGISTRY_KEY "@KEY@"
!include "@HOOK@"
Section
  SetRegView 64
  SetOutPath "$INSTDIR"
  File /oname=workmemo-browser.exe "@HOST@"
  File /oname=com.workmemo.browser_bridge_test.json "@MANIFEST@"
  !insertmacro NSIS_HOOK_POSTINSTALL
  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd
Section Uninstall
  SetRegView 64
  Delete "$INSTDIR\workmemo-browser.exe"
  Delete "$INSTDIR\com.workmemo.browser_bridge_test.json"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"
  !insertmacro NSIS_HOOK_POSTUNINSTALL
SectionEnd
'@
$taskSetup = Join-Path $taskDirectory 'registration-test.exe'
$taskSource = $taskTemplate.Replace('@SETUP@',$taskSetup).Replace('@INSTALL@',$taskInstall).Replace('@KEY@',$taskTestKey).Replace('@HOOK@',(Join-Path $taskRoot 'src-tauri\installer\browser-bridge.nsh')).Replace('@HOST@',$taskHost).Replace('@MANIFEST@',(Join-Path $taskRoot 'src-tauri\installer\com.workmemo.browser_bridge_test.json'))
$taskNsi = Join-Path $taskDirectory 'registration-test.nsi'
[IO.File]::WriteAllText($taskNsi,$taskSource,(New-Object Text.UTF8Encoding($true)))
& $taskNsis /V2 /INPUTCHARSET UTF8 $taskNsi
if ($LASTEXITCODE -ne 0) { throw 'NSIS test harness compilation failed.' }
function Run-Silent([string]$Path) {
    $taskProcess = Start-Process -FilePath $Path -ArgumentList '/S' -WindowStyle Hidden -Wait -PassThru
    if ($taskProcess.ExitCode -ne 0) { throw ('Test installer failed with exit ' + $taskProcess.ExitCode) }
}
Run-Silent $taskSetup
$taskManifestPath = Join-Path $taskInstall 'com.workmemo.browser_bridge_test.json'
if ((Read-DefaultValue $taskTestKey) -ne $taskManifestPath) { throw 'Installer registered the wrong path.' }
$taskManifest = Get-Content -LiteralPath $taskManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($taskManifest.path -ne 'workmemo-browser.exe' -or $taskManifest.name -ne 'com.workmemo.browser_bridge_test' -or $taskManifest.allowed_origins.Count -ne 1 -or $taskManifest.allowed_origins[0] -ne 'chrome-extension://oljcealhccdhaddceacnokihjefloaih/') { throw 'Invalid installer host manifest.' }
Run-Silent (Join-Path $taskInstall 'uninstall.exe')
if ((Read-DefaultValue $taskTestKey) -or (Test-Path -LiteralPath $taskManifestPath)) { throw 'Owned registration was not removed.' }
Write-Output 'PASS: silent install registers valid relative-path JSON under a Unicode directory; owned uninstall removes it.'

Run-Silent $taskSetup
$taskNewerManifest = Join-Path $taskDirectory 'newer-install\com.workmemo.browser_bridge_test.json'
$taskKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($taskTestKey)
try { $taskKey.SetValue('',$taskNewerManifest) } finally { $taskKey.Dispose() }
Run-Silent (Join-Path $taskInstall 'uninstall.exe')
if ((Read-DefaultValue $taskTestKey) -ne $taskNewerManifest) { throw 'Old uninstall removed a newer registration.' }
$taskKey = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($taskTestKey,$true)
try { $taskKey.DeleteValue('',$false) } finally { $taskKey.Dispose() }
[Microsoft.Win32.Registry]::CurrentUser.DeleteSubKey($taskTestKey,$false)
Write-Output 'PASS: old uninstall preserves a newer directory registration.'

$taskCmdDirectory = Join-Path $taskDirectory '中文修复 & !'
[IO.Directory]::CreateDirectory((Join-Path $taskCmdDirectory 'extension')) | Out-Null
$taskCmd = Join-Path $taskCmdDirectory 'Register-Browser.cmd'
Copy-Item -LiteralPath (Join-Path $taskRoot 'scripts\register-preview-browser.cmd') -Destination $taskCmd
function Run-Prepare {
    $taskInfo = New-Object Diagnostics.ProcessStartInfo
    $taskInfo.FileName = $env:ComSpec
    $taskInfo.Arguments = '/d /s /c ""' + $taskCmd + '" /prepare-only"'
    $taskInfo.UseShellExecute = $false
    $taskInfo.CreateNoWindow = $true
    $taskInfo.RedirectStandardOutput = $true
    $taskInfo.RedirectStandardError = $true
    $taskProcess = New-Object Diagnostics.Process
    $taskProcess.StartInfo = $taskInfo
    [void]$taskProcess.Start()
    $null = $taskProcess.StandardOutput.ReadToEnd()
    $null = $taskProcess.StandardError.ReadToEnd()
    $taskProcess.WaitForExit()
    $taskExitCode = $taskProcess.ExitCode
    $taskProcess.Dispose()
    return $taskExitCode
}
if ((Run-Prepare) -eq 0) { throw 'Missing host files were accepted.' }
Copy-Item -LiteralPath $taskHost -Destination (Join-Path $taskCmdDirectory 'workmemo-browser.exe')
[IO.File]::WriteAllText((Join-Path $taskCmdDirectory 'workmemo-browser.profile.json'),'{"identifier":"com.workmemo.test.monitor"}')
[IO.File]::WriteAllText((Join-Path $taskCmdDirectory 'extension\bridge-config.js'),'export const HOST_NAME = "com.workmemo.browser_bridge_test";')
if ((Run-Prepare) -ne 0) { throw 'One-click prepare failed under the Unicode directory.' }
$taskPrepared = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $taskCmdDirectory 'com.workmemo.browser_bridge_test.json') | ConvertFrom-Json
if ($taskPrepared.path -ne 'workmemo-browser.exe' -or $taskPrepared.allowed_origins.Count -ne 1) { throw 'One-click manifest is invalid.' }
[IO.File]::WriteAllText((Join-Path $taskCmdDirectory 'extension\bridge-config.js'),'export const HOST_NAME = "com.workmemo.browser_bridge";')
if ((Run-Prepare) -eq 0) { throw 'A mismatched source extension was accepted.' }
if ((Read-DefaultValue $taskActualKey) -ne $taskBefore) { throw 'Production Chrome registration changed during tests.' }
Write-Output 'PASS: one-click prepare rejects missing files and mixed extensions, handles Unicode/ampersand paths, and leaves real Chrome registration unchanged.'
Write-Output ('Test evidence directory: ' + $taskDirectory)
````````

## NEW FILE E:\WorkMemo\src-tauri\installer\browser-bridge.nsh

````````text
!include "LogicLib.nsh"

; Tests override only this key at compile time, never the shipped host identity.
!ifndef WM_BRIDGE_REGISTRY_KEY
  !define WM_BRIDGE_REGISTRY_KEY "Software\Google\Chrome\NativeMessagingHosts\com.workmemo.browser_bridge_test"
!endif
!define WM_BRIDGE_MANIFEST "com.workmemo.browser_bridge_test.json"

!macro NSIS_HOOK_POSTINSTALL
  Push $R0
  ${IfNot} ${FileExists} "$INSTDIR\${WM_BRIDGE_MANIFEST}"
    SetErrorLevel 1
    Abort "The WorkMemo browser host manifest is missing."
  ${EndIf}
  ${IfNot} ${FileExists} "$INSTDIR\workmemo-browser.exe"
    SetErrorLevel 1
    Abort "The WorkMemo browser host executable is missing."
  ${EndIf}
  ClearErrors
  WriteRegStr HKCU "${WM_BRIDGE_REGISTRY_KEY}" "" "$INSTDIR\${WM_BRIDGE_MANIFEST}"
  ${If} ${Errors}
    SetErrorLevel 1
    Abort "Cannot register the WorkMemo browser host for the current user."
  ${EndIf}
  DetailPrint "WorkMemo Chrome bridge registered for the current user."
  Pop $R0
!macroend

; Run only after Tauri's running-app/cancel check and resource removal.
; The manifest is a normal bundled resource, so cancellation preserves it.
!macro NSIS_HOOK_POSTUNINSTALL
  Push $R0
  ReadRegStr $R0 HKCU "${WM_BRIDGE_REGISTRY_KEY}" ""
  ${If} $R0 == "$INSTDIR\${WM_BRIDGE_MANIFEST}"
    DeleteRegValue HKCU "${WM_BRIDGE_REGISTRY_KEY}" ""
    DeleteRegKey /ifempty HKCU "${WM_BRIDGE_REGISTRY_KEY}"
  ${EndIf}
  ; An old uninstaller must not remove a newer directory's registration.
  Pop $R0
!macroend
````````

## NEW FILE E:\WorkMemo\src-tauri\installer\com.workmemo.browser_bridge_test.json

````````json
{
  "name": "com.workmemo.browser_bridge_test",
  "description": "WorkMemo Preview local browser bridge",
  "path": "workmemo-browser.exe",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://oljcealhccdhaddceacnokihjefloaih/"]
}
````````
