# alpha.6 公开发布文档完整源码

本文件为 NEW FILE E:\WorkMemo\docs\ALPHA6-RELEASE-SOURCE.md，完整收录此次发布的三个 UPDATE 文档，自身不递归收录。

## UPDATE E:\WorkMemo\README.md

````````
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前源码正在分阶段改造自动工作记录。第一阶段已加入持久计时区间和结束后补填工作量；第二阶段已实现 Windows 输入/系统状态、Chrome 原生通信、5/7 分钟与离页计时规则、托盘和非模态提醒的代码，**真实 Chrome 接入及原生交互尚待验收**。已确认规则见 [自动记录规范](docs/AUTO-TRACKING-SPEC.md)，当前结果见 [第二阶段进度](docs/AUTO-TRACKING-PHASE-2.md)，接入步骤见 [独立验收说明](docs/BROWSER-BRIDGE.md)。源码数据库升级到版本 3 后，旧版程序会拒绝读取；本轮未迁移真实工作数据库。下文成品信息及既有验收记录对应已发布版本，不能作为此次改造的验收结果。

[下载自动记录预览版 v0.2.0-alpha.6](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.6)：[中文 EXE](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.6/WorkMemo_0.2.0-alpha.6_x64-preview-setup-r1.exe) · [免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.2.0-alpha.6/WorkMemo_0.2.0-alpha.6_windows_x64_preview.zip)。自动恢复、1–5 秒检测、页面活动信号与界面更新；更新前退出旧版并备份预览数据。[使用说明](docs/PREVIEW-GUIDE.md) · [交付记录](docs/UPDATE-ALPHA6.md)。原生验收仍有未完成项；稳定版保留 v0.1.1。

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


源码开发更新：alpha.6 增加自动恢复、1–5 秒检测、页面活动信号，并使用 Ant Design 图标和 Tailwind 重做界面。本地构建与验收边界见 [更新记录](docs/UPDATE-ALPHA6.md)；上面的公开下载已更新为 alpha.6。
````````

## UPDATE E:\WorkMemo\docs\UPDATE-ALPHA6.md

````````
# alpha.6 自动恢复、检测与界面更新

日期：2026-10-28（Asia/Shanghai）。按用户确认方案实施，并根据后续许可增加授权工作页面活动信号。版本 0.2.0-alpha.6，Windows x64。本轮提供 EXE 与 ZIP；用户随后明确要求发布，现已公开 alpha.6 预发布 Release，旧版资产保持原样。

## 业务行为

- 正在进行的手动任务不会被自动监测替换；自动任务点击继续后仍按自动规则管理。手动暂停默认可在可信工作页的新操作后恢复同一记录并转自动管理，设置可关闭。重启待恢复记录必须用户明确处理。
- 切换暂停任务增加明确确认，并在后端校验被确认的记录 ID；旧确认不能误结束新的任务。结束旧记录和创建新记录保持事务执行。
- 检测间隔 1–5 秒，默认 1 秒，同时用于 Chrome 心跳与系统输入采样。已有离页与空闲秒数独立。SQLite schema 5 迁移保留旧记录和原阈值，新增默认自动恢复开关。升级前正常退出并备份，旧版可能不能打开升级后的数据库。
- 页面事件在通信忙时合并并重新读取最新状态；过期查询不发送。新增 scripting 权限，仅在配置且已授权的站点注入活动监听。脚本只发可信操作信号，不读取按键值、文本、坐标或网页内容；后台标签、未授权站点及脚本合成事件不作为活动信号。后端还核对原生输入、前台状态及暂停边界，从确认时刻计时，不回填未知区间。首次安装、未授权或监听尚未就绪时仍可能需要再次操作；没有严格实时保证。顶层页面活动监听不覆盖跨站 iframe。

## 界面与依赖

主窗口、任务卡、历史统计、删除确认、工作量结算、外观/监测设置、状态岛及 Chrome 弹窗统一整理，使用 Ant Design Icons 与 Tailwind Vite。Tailwind v4 样式要求现代 Chromium（111+）WebView2；未在旧运行环境验证。保持四套主题变量与原生透明配置；未导入 Tailwind Preflight。扩展弹窗图标和样式在本地打包，配套文件清单新增 activity.js；源码 extension 需先构建，不直接加载原始 popup.js。依赖许可汇编含 Ant 图标、Tailwind 产出样式及其依赖，缺失的包内许可按版本从上游或包内 README 补齐。

## 实际检查与限制

- npm test：37 项通过；cargo test --locked --offline：86 项库测试、2 项 helper 协议测试、2 项实际主机集成及 1 项注册测试通过，共 91 项。覆盖迁移、1/5 秒、自动恢复、重启保护、切换旧确认、首次输入边界、页面活动与授权范围、事件竞争和原有数据可靠性。
- TypeScript/Vite 构建、Rust 格式检查、bridge:dev 资源准备与扩展弹窗构建通过。桌面产物 JS 约 316.40 kB（gzip 97.03 kB），CSS 31.78 kB（gzip 6.73 kB）。
- 以独立应用标识 com.workmemo.test.qacd3bafcc2cc0 构建过隔离 GUI，并通过只读原生 probe。桌面工具请求启动该路径时实际启动了 C:\Users\Administrator\AppData\Local\WorkMemo\workmemo.exe，进程父级证实来自桌面工具；发现后停止对该窗口操作，没有结束、删除或改写真实任务。启动本身可能读取真实数据库并执行原有连接检查，无法声称真实状态全程未变化。
- 浏览器预览实际打开并检查了新版主界面布局、图标和文本，随后关闭临时页及开发服务；未将浏览器预览计为原生验收。
- 新版实际安装、Chrome 授权后的端到端联调、锁屏休眠、多屏/DPI、四皮肤原生透明、键盘焦点及提醒交互仍未验收。自动测试与构建不代替这些实测；本轮不报告为全面验收通过。

## PowerShell 命令、测试方法与预期

```powershell
Set-Location 'E:\WorkMemo'
npm.cmd test
npm.cmd run build
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
npm.cmd run bridge:dev
& .\scripts\package-preview.ps1
$taskZip = 'E:\WorkMemo\artifacts\0.2.0-alpha.6\WorkMemo_0.2.0-alpha.6_windows_x64_preview.zip'
& .\scripts\package-preview-installer.ps1 -PortableZip $taskZip -ExpectedSha256 (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash
```

验证须使用独立数据：切换间隔1与5秒并重启读取；自动任务暂停继续仍受离页规则管理；手动任务在工作页不被覆盖；开启自动恢复时新操作恢复原 ID，关闭时保持暂停；旧任务确认对新 ID 被拒绝；连接中断及锁屏不累计未知时间。重新加载构建后的扩展，并由用户同步站点权限。仅检查测试任务，不以结束或删除真实工作完成验收。

文件清单（完整路径与 NEW FILE / UPDATE）及完整变更文本在 UPDATE-ALPHA6-SOURCE.md。原先未跟踪的 DYNAMIC-ISLAND-PLAN.md 保留且未纳入提交。第三方完整许可另在原路径 docs/THIRD-PARTY-LICENSES.txt，源码汇编同时保留。

```powershell
git diff --cached --check
git diff --cached --name-status
git commit -m "docs: record alpha.6 local delivery and acceptance limits"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```


## 本地成品

正式 release 与 NSIS 实际构建成功；ZIP 16 项精确清单、CRC、主程序/许可字节及安装器共享文件逐字节核对通过。尚未实际安装。源码提交为 b40179522cc6b48c6557c1cb3c75a002fb9ff727。

- E:\WorkMemo\artifacts\0.2.0-alpha.6\WorkMemo_0.2.0-alpha.6_windows_x64_preview.zip，3520900 字节；SHA256 `bd9bae6ac2cd69984ad59c208c794c42a5e741985ddb1133da31219ca0f28c1a`。
- E:\WorkMemo\artifacts\0.2.0-alpha.6\installer-r1\WorkMemo_0.2.0-alpha.6_x64-preview-setup-r1.exe，2501168 字节；SHA256 `a2f55aade14a9c3707b9379c01d3edeba7cb6fd8e0898423fde77d247d64aa67`。

校验文件：E:\WorkMemo\artifacts\0.2.0-alpha.6\DELIVERY-SHA256SUMS.txt。


## 2026-10-28 公开发布

[WorkMemo v0.2.0-alpha.6](https://github.com/noharass/WorkMemo/releases/tag/v0.2.0-alpha.6) 已发布，tag 指向构建源码 b40179522cc6b48c6557c1cb3c75a002fb9ff727。六个资产（EXE、ZIP、两类使用说明、许可和 ALL-SHA256SUMS.txt）经上传摘要及无认证公开下载复算通过。稳定 Latest 仍为 v0.1.1。发布不改变以上未验收项目。发布回执只包含公开元数据，保存在忽略目录 artifacts/0.2.0-alpha.6/RELEASE-RECEIPT.json。

本次发布文档的 NEW FILE / UPDATE 完整路径和完整文本见 ALPHA6-RELEASE-SOURCE.md；原始开发汇编 UPDATE-ALPHA6-SOURCE.md 保留当时快照。
````````

## UPDATE E:\WorkMemo\docs\PHASE-8.md

````````
# WorkMemo 第八阶段：最终检查与 Windows 交付

日期：2026-10-26（Asia/Shanghai）。用户确认进入第八阶段。起点 9b2c73a，main 与 origin/main 一致且工作区干净；开始时有一项暂停任务，最终用户操作及数据核对结果见第 4 节。

## 1. 目标与检查结果

阅读 PRODUCT-SPEC.md、AGENTS.md、PHASE-7.md、README，检查实际进程、暂停任务、历史、配置、前后端命令和安装资源。已有工作、计时、SQLite、历史、删除、统计和透明换肤通过前七阶段验证，本轮没有可复现的业务缺陷需要重写。

发现交付缺口：仍使用 Tauri 默认原生图标；尚无中文安装器、免安装压缩包和校验文件；源码开发与普通用户依赖说明未分开。采用最小方案补齐图标、NSIS 打包、许可文本、打包脚本及两类说明，保留应用标识、数据库结构、数据路径、窗口透明配置、业务逻辑和运行权限。

## 2. 成品与源码依赖

- 普通用户：使用中文安装版或解压 ZIP；无需 Node、Rust、Visual Studio、Git、Python 或 SQLite 服务。Windows 桌面界面使用 WebView2。
- 安装器为 currentUser，只安装到当前 Windows 用户。WebView2 使用 downloadBootstrapper，缺少时联网下载 Microsoft 官方运行环境；本机已有 WebView2，因此本轮未实际覆盖运行环境缺失的下载分支。
- 免安装版仍需要已有 WebView2，数据保存在当前用户目录，不是随 ZIP 移动的数据目录。
- 源码：Node 24 x64、Rust stable MSVC、Visual Studio 2022 C++ Build Tools/Windows SDK、WebView2；git clone 还需要 Git。npm ci 和 Cargo.lock 安装锁定依赖，SQLite bundled，无独立数据库服务。
- 本轮未配置代码签名，不能称为可信发布者签名版本；新电脑可能提示发布者未知。未修改或自动绕过 Windows 安全机制。

配置依据：[Tauri Windows 前置要求](https://v2.tauri.app/start/prerequisites/#windows)、[Windows 安装器](https://v2.tauri.app/distribute/windows-installer/)、[配置参考](https://v2.tauri.app/reference/config/#nsisconfig)。

## 3. 最小修改与文件关系

- public/workmemo.svg 为可维护的矢量图标源，与现有绿色 w. 标识保持一致；使用当前 Tauri icon 命令生成原有 16 个平台图标。没有引入图像生成服务或新运行依赖。
- index.html 增加同源 favicon；既有布局、主题和透明层级不变。
- tauri.conf.json 指定 NSIS、中文/英文、currentUser、WebView2 检测下载和图标；应用 id 保持 com.workmemo.desktop。
- package.json 及 lock 根条目声明 Node 24，.nvmrc 提供版本提示，增加统一 npm test；没有升级或新增依赖。
- package-windows.ps1 检查环境、版本、运行实例，执行 npm ci 和 Tauri 正式构建，产生安装包、ZIP 与 SHA256SUMS。
- collect-licenses.mjs 按 Windows Cargo 解析图与 npm 生产依赖收集许可，缺少包内文本时使用有明确来源及版本约束的补充；找不到许可文本就失败。汇编 253 个包版本的文本，随安装版和 ZIP 附带，不把构建依赖全部声称为运行组件。
- USER-GUIDE.md 面向成品用户；BUILDING.md 面向 GitHub 源码使用者；README 提供入口。
- artifacts/ 与 target/ 均不提交 Git。完整路径及 NEW FILE / UPDATE 见 PHASE-8-FILES.md；完整文本源码见 PHASE-8-SOURCE.md；二进制图标和许可汇编完整保存在原路径，未使用省略号代替内容。
- 上游许可文本保留原有空白，仅为这些原始文本设置窄范围 Git whitespace 属性；项目代码仍执行标准暂存检查。补充许可全文也完整保存在 scripts/third-party-licenses 中。

## 4. 实际构建与测试

- npm ci 成功，锁定依赖安装后 npm 报告 0 项已知漏洞；这是此次 npm 检查结果，不等同完整安全审计。
- Node 22 项、Rust 37 项测试通过，共 59 项；Rust 格式检查、TypeScript/Vite 生产构建通过。
- Tauri release/NSIS 实际构建成功，下载的 NSIS 及 Tauri 插件由 bundler 校验摘要后使用；没有修改全局开发工具链。
- 原生图标 PNG 实际打开检查，图形、圆角和透明边缘正确；该检查不是 Windows 所有 DPI 下的任务栏截图。
- 检查 NSIS 生成脚本确认 currentUser、HKCU、原应用 id、许可文件资源及 WebView2 分支；卸载的数据删除选项仅用户勾选时执行。本轮没有执行卸载，也没有删除真实数据。
- 首次本机安装退出码 0，但安装后的程序与原构建相差 3 个字节。确认这是 Tauri 默认 bundle 类型标记后，统一采用 --no-binary-patching。当前没有自动更新插件，该分发标记无业务用途；最终安装版和 ZIP 使用同一程序字节以便 SHA256 核对。
- PE 导入表检查仅见 Windows 系统/UCRT DLL，没有额外 VCRUNTIME/MSVCP 运行库导入；未将此表检查替代干净机器实测。

- 最终打包脚本完整执行通过，最后一次 Rust release 编译耗时 1 分 47 秒；此前也实际执行过完整构建。Node/Rust 依赖未升级。PowerShell 7.6.5 执行打包，脚本保存为 UTF-8 BOM 并显式 UTF8 读取 JSON；Windows PowerShell 5.1 语法和中文路径字面量解析检查通过，未将解析检查声称为完整 5.1 打包实测。
- NSIS 本机静默安装退出码 0，HKCU 安装信息为 WorkMemo 0.1.0，安装路径 C:\Users\Administrator\AppData\Local\WorkMemo。最终安装后的 EXE 与原始 release EXE 的 SHA256 完全相同，许可文本也相同。
- ZIP 逐项检查通过，恰好 3 个条目：WorkMemo/workmemo.exe、WorkMemo/使用说明.md、WorkMemo/THIRD-PARTY-LICENSES.txt；解压内容摘要与源文件逐个一致，不含真实用户记录。
- 开发服务关闭、1420 无监听时，通过桌面工具启动安装后的程序；可访问性树确认程序路径为安装目录、页面来自 http://tauri.localhost/、真实主界面和保存的外观入口正常。
- 数据只读核对：安装前已有的全部历史 id 均保留，数据库完整性为 ok，外观文件保持。原暂停任务在期间变成已完成，用户明确确认是自己主动点击结束；该记录仍在，时长未减少。不能将此轮记为原暂停状态全程不变，但历史无丢失。
- 用户确认安装版新图标和显示正常。未通过修改真实数据库制造暂停或完成结果，也未为验收结束、删除其工作。

## 5. PowerShell 命令

```powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd ci
npm.cmd test
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
& .\scripts\package-windows.ps1
```

单独构建官方安装器：

```powershell
npm.cmd run tauri -- build --ci --no-binary-patching
```

查看交付文件及校验：

```powershell
Get-ChildItem .\artifacts\0.1.0
Get-Content .\artifacts\0.1.0\SHA256SUMS.txt
Get-FileHash .\artifacts\0.1.0\WorkMemo_0.1.0_x64-setup.exe -Algorithm SHA256
Get-FileHash .\artifacts\0.1.0\WorkMemo_0.1.0_windows_x64.zip -Algorithm SHA256
```

脚本会覆盖同版本 artifacts 目录的同名交付文件，不进行递归删除；打包前要求正常保存关闭旧窗口。源码环境安装细节见 BUILDING.md。

## 6. 逐步验收与预期

1. 核对 SHA256 与交付清单一致；ZIP 仅含程序、使用说明、第三方许可，不含任何用户数据库、备注、凭据或本地外观配置。
2. 安装到当前用户，程序、卸载入口、开始菜单等安装资源可见；已安装 WebView2 的机器不下载额外运行环境。
3. 在开发服务关闭时启动安装后的程序，打开真实界面；暂停任务 id、毫秒时长、历史 id 集合和外观应与安装前基准一致。
4. 核对 WorkMemo 图标、透明、窗口控制、历史及外观入口。保留当前实际任务暂停，不为验收结束或删除它。
5. 源码使用者按 BUILDING.md 安装工具、npm ci、tauri dev；第一次需要网络。完整正式构建的可复现命令来自实际执行的打包脚本。
6. 新 Windows 11、缺 WebView2、不同 DPI/多显示器/时区、真实断电等未实际覆盖的场景，不因打包成功而计为通过。

## 7. 交付信息及兼容性

版本 0.1.0，目标 Windows x64；本机 Windows 10 22H2 19045、WebView2 155、Node 24.18、Rust 1.99.1 MSVC、VS 2022 Build Tools。Windows 11 及其他环境的完整实测仍未执行。

交付目录 E:\WorkMemo\artifacts\0.1.0：

| 文件 | 字节数 | SHA256 |
| --- | ---: | --- |
| WorkMemo_0.1.0_x64-setup.exe | 2,226,650 | b9f7d79a1346000e94517dd03e0f55c4dfedd68d87840ddfc6c6af593c1c4e39 |
| WorkMemo_0.1.0_windows_x64.zip | 3,008,860 | 7c120e314bcbb24622c6351a846fe1ddd40db6a2aebc98207257775b6c7086ec |
| THIRD-PARTY-LICENSES.txt | 2,235,369 | 209d8cf282922bd772bb7901c77bf97dd3934cc98556050bae41c33dcd027786 |
| SHA256SUMS.txt | 286 | 文件内列出上面 3 项的校验值 |

程序本体 E:\WorkMemo\src-tauri\target\release\workmemo.exe，6,137,856 字节，SHA256 5cab45d472feaf7d87804630ea824f7f5cf540427d3b50e9332c92772eda0acb。安装位置中的程序与其一致。现有所有阶段记录保留，真实任务已由用户主动结束。

用户明确授权后，已公开发布 [WorkMemo v0.1.0](https://github.com/noharass/WorkMemo/releases/tag/v0.1.0)，tag 指向本轮构建源码提交 38b69c09a3982485f6d0433fc4cf64db01173ec3。安装包、ZIP、许可文本、校验文件共 4 个资产；上传响应摘要及大小核对通过，公开 API 确认非草稿，另以无认证方式实际下载全部 4 项并逐个复算 SHA256，与上传前一致。发布回执仅保存公开元数据到被忽略的 artifacts 目录，没有把认证凭据写入文件或 URL。

- [中文安装版](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/WorkMemo_0.1.0_x64-setup.exe)
- [免安装 ZIP](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/WorkMemo_0.1.0_windows_x64.zip)
- [校验文件](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/SHA256SUMS.txt)
- [第三方许可](https://github.com/noharass/WorkMemo/releases/download/v0.1.0/THIRD-PARTY-LICENSES.txt)

## 8. Git 和发布边界

按既有授权提交推送 main，检查暂存区排除产物、依赖、真实数据库、凭据和个人配置，随后比较本地和远程提交并检查工作区。

```powershell
git fetch origin main
git add .
git diff --cached --check
git commit -m "build: prepare Windows installer and final delivery"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
```

公开发布已按用户明确确认完成。构建源码与随后补充的下载文档分别提交同步，未强制推送、覆盖远程历史或变更仓库公开范围。完成第八阶段及本轮最终交付后，等待新的明确需求，不自动扩展功能。


## 2026-10-27 浏览器连接全面修复

用户要求覆盖所有安装方式，灵动岛保持搁置。本轮 alpha.4 将 EXE、ZIP、源码 dev、目录迁移统一到 Rust 注册引擎，加入启动修复、连接诊断与双主机回退。SQLite schema 3 和计时/皮肤规则不变。当前自动测试 31 项 Node + 78 项 Rust 通过；正式/预览两配置隔离 NSIS 安装、CMD 修复、目录迁移、旧卸载保护与所属卸载通过。Windows 预览 EXE/ZIP 与默认源码 NSIS 均已构建并核对；alpha.4 已发布，全部 9 个资产经无认证下载比对。结果见 BROWSER-CONNECTION-DELIVERY.md，不能据此声称其他用户电脑连接或全部原生交互已验收。


## 2026-10-27 状态岛与计时参数预览发布

用户要求发布 alpha.5。状态岛首阶段和可调整的离页/空闲阈值已构建为 EXE 与 ZIP 并公开发布，自动测试和公开下载校验通过。新窗口的透明、焦点、多屏和真实浏览器关闭场景尚待验收；具体记录见 RELEASE-0.2.0-alpha.5.md。


## 2026-10-28 自动恢复与界面更新

按用户确认方案实现 alpha.6，并按后续明确许可增加已授权页面活动信号。源码、测试及本地 EXE/ZIP 结果见 UPDATE-ALPHA6.md，完整源码见 UPDATE-ALPHA6-SOURCE.md。原生 GUI 验收遇到工具误启动已安装版的限制，不能声称通过；未操作或结束真实任务。


## 2026-10-28 alpha.6 公开预发布

按用户明确要求已发布 alpha.6 EXE 与 ZIP，六个资产均经无认证公开下载复算验证；稳定 Latest 保持 v0.1.1。详情见 UPDATE-ALPHA6.md；原生验收限制继续保留。
````````
