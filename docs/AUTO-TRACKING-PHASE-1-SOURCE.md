# 自动记录第一阶段完整文本源码

本文件完整收录本阶段变更的文本文件，不以省略号替代内容。除本汇编自身外，文件清单中的所有文件均逐字收录；原始文件是实际执行与构建的来源。

## UPDATE E:\WorkMemo\README.md

````````markdown
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前源码正在分阶段改造自动工作记录，已实现第一阶段的数据迁移、持久计时区间和结束后补填工作量；**浏览器监测、自动开始/结束和后台提醒尚未接入**。已确认规则见 [自动记录规范](docs/AUTO-TRACKING-SPEC.md)，实际检查及限制见 [第一阶段记录](docs/AUTO-TRACKING-PHASE-1.md)。源码数据库升级到版本 2 后，旧版程序会拒绝读取；本阶段未安装或迁移真实工作数据库。下文成品信息及既有验收记录对应已发布版本，不能作为此次改造的验收结果。

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

## NEW FILE E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1-FILES.md

````````markdown
# 自动记录第一阶段完整文件清单

所有文件均位于 E:\WorkMemo。NEW FILE 表示新增，UPDATE 表示更新。构建产物、隔离配置与用户数据库未列入源码交付。

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1-FILES.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1-SOURCE.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md |
| UPDATE | E:\WorkMemo\docs\PRODUCT-SPEC.md |
| NEW FILE | E:\WorkMemo\src-tauri\migrations\002_settlement.sql |
| UPDATE | E:\WorkMemo\src-tauri\src\appearance_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\lib.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\reliability_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\settlement.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\settlement_tests.rs |
| UPDATE | E:\WorkMemo\src\App.css |
| UPDATE | E:\WorkMemo\src\App.tsx |
| UPDATE | E:\WorkMemo\src\HistoryPanel.tsx |
| NEW FILE | E:\WorkMemo\src\SettlementPanel.tsx |
| UPDATE | E:\WorkMemo\src\WorkForm.tsx |
| UPDATE | E:\WorkMemo\src\history.ts |
| UPDATE | E:\WorkMemo\src\types.ts |
| UPDATE | E:\WorkMemo\src\useWorkSession.ts |
| UPDATE | E:\WorkMemo\src\workInput.ts |
| UPDATE | E:\WorkMemo\src\workView.ts |
| UPDATE | E:\WorkMemo\tests\history.test.mjs |
| UPDATE | E:\WorkMemo\tests\workflow.test.mjs |

文件关系：002_settlement.sql 管理兼容迁移；database.rs 管理计时及区间事务；settlement.rs 管理待补全与审计；service.rs/lib.rs 注册命令；types.ts、useWorkSession.ts 与表单/待补全面板连接真实服务；history.rs/HistoryPanel.tsx 使用相同结算统计口径；测试覆盖迁移、事务、恢复和前端校验；规范与阶段文档记录确认边界和实际结果。

完整代码在项目原文件及 AUTO-TRACKING-PHASE-1-SOURCE.md。源码汇编不递归包含自身；本清单明确列出该生成文档。
````````

## NEW FILE E:\WorkMemo\docs\AUTO-TRACKING-PHASE-1.md

````````markdown
# 自动记录改造第一阶段：数据与手动结算基础

日期：2026-10-26（Asia/Shanghai）。用户已确认按 AUTO-TRACKING-SPEC.md 的建议开始开发。本阶段不代表自动监测功能完成。

## 目标与实际检查

- 起点 main / origin/main 为 ecc82be，工作区干净。阅读 PRODUCT-SPEC.md、AGENTS.md、PHASE-8.md、BUILDING.md 和实际前后端源码。
- 旧数据库版本 1，工作量非空且必须大于 0；计时累计使用单调时钟、每秒保存检查点，暂停与重启已有保护。前端通过 Tauri 命令读取快照，没有浏览器监测连接。
- 开发前实际启动已安装的旧版，读取真实主界面，显示准备开始；没有创建、结束或删除任务。该检查不等于修改后源码的启动验收。
- 修改前当前源码通过前端及 Tauri Windows 调试构建。验收使用临时配置 identifier=com.workmemo.test.settlement，避免测试程序读写真实数据目录。
- 电脑控制中一次控件点击返回 coordinate input geometry is unavailable，随后截图返回 FrameArrived timed out: timed out waiting on channel。正常关闭快捷键后，后续进程检查已无旧版运行。准备启动源码隔离构建时，工具报告用户按物理 Escape 停止电脑控制；此后没有继续电脑控制，也未用其他 UI 自动化方式绕过。
- 本轮末仅用 SQLite 只读连接核对真实库：仍为版本 1、4 条记录、0 条活动任务，integrity_check=ok。未对真实库执行新迁移；这些计数不是产品演示数据。

## 本阶段实现

1. 增加 002_settlement.sql，将数量改为可空及非负数，增加填写状态、来源、暂停原因、确认结束时间、最后输入时间、结束原因、历史时长基数和修订号。
2. 迁移在原数据库事务中完成，保留记录 ID、原字段值和 AUTOINCREMENT 高水位。旧已结束记录保留为已结算；旧时长保留为 legacy_duration_ms，不伪造历史工作区间。旧版未保存暂停原因，因此旧暂停记录保守按人工暂停保护。
3. 新增 work_segments。开始、继续、检查点、暂停、结束同步维护累计时长和区间；区间与记录同事务保存。重启将未闭合区间截断到最后成功检查点，不补算关闭时间。单调时钟回归保持通过，系统回拨时保持区间顺序。
4. 开始前可以不填工作量，也可预填 0 或正数。所有新结束记录先进入 PENDING；预填值不等于已结算。工作量在单独保存后才成为 COMPLETE。
5. 新增 get_pending_records 和 settle_record 命令，沿用 Rust 服务锁、SQLite 连接和 Tauri 通信；没有开放通用 SQL、文件系统或新增窗口权限，没有引入依赖。
6. 结算允许确认 0、修改类别与备注。record_revisions 保存修改前后完整记录 JSON；保存和审计同事务，重复请求不产生重复审计，旧修订号的冲突修改被拒绝。
7. 主界面提供真实待补全数量和非模态内嵌列表，手动结束成功后展开入口，可稍后填写。列表包含所有待补全记录，不限最近 5 条；旧记录补全时不影响正在进行的新任务。
8. 历史保留已结束记录，时间包含待补全，数量只汇总已结算值，并显示待补全数量。数量未填显示“待填写”，明确的 0 显示为 0。成功修改及删除会更新刷新版本，避免旧记录操作后分类统计不刷新。
9. 新界面复用现有主题变量。未修改四种皮肤配置、原生透明窗口配置、应用正式标识或外观存储。

最后输入时间、自动来源和自动暂停/结束原因目前只是后续监测所需字段；本阶段尚未生成真实输入监测数据，不能据此宣称自动记录可用。

## 实际执行与结果

- npm test：24 项通过。覆盖 0、空值与结算必填区别、下溢和非法数字、待补全状态及已有主题/历史辅助行为。
- cargo test --locked：47 项通过，含新增 10 项结算与迁移测试；已有真实子进程退出恢复、64 项随机工作序列、1 万条隔离历史、主题独立保存等继续通过。
- 新增测试覆盖：结束结果重启可读且不阻止新任务、结算审计与冲突、审计失败整体回滚、区间与记录检查点原子性、旧字段与 ID 序列迁移、待补全工时和数量口径、结束写入失败、迁移中途失败回滚、35 条待补全及关联数据删除、非法结算保护。
- 首轮 Rust 检查发现测试时钟回拨至 Unix 纪元之前，确认结束时间违反非负约束。已在结束写入边界按已有时钟约定归零处理；没有减小或跳过该测试，后续 47 项全部通过。
- cargo fmt -- --check：通过。
- TypeScript / Vite 生产构建：通过。
- Tauri Windows debug / no-bundle 实际构建：通过，产物 E:\WorkMemo\src-tauri\target\debug\workmemo.exe，使用隔离应用标识。未生成本次 NSIS 安装器或公开发布新版本。
- 改造后原生界面操作、实际重开、四种皮肤下待补全界面的可读性与透明效果：尚未验收，不能用上述测试或编译替代。

## PowerShell 复现命令

在 E:\WorkMemo 执行；源码依赖沿用 BUILDING.md。不要在验收时结束或删除真实任务。

~~~powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd test
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm.cmd run build
~~~

以下命令构建与真实库分离的验收程序。临时配置位于已忽略的 target 目录，不修改正式应用标识。

~~~powershell
Set-Content -LiteralPath .\src-tauri\target\settlement-test.conf.json -Value '{"identifier":"com.workmemo.test.settlement"}' -Encoding utf8
npm.cmd run tauri -- build --debug --no-bundle --config src-tauri/target/settlement-test.conf.json
& .\src-tauri\target\debug\workmemo.exe
~~~

最后一条启动命令是后续人工验收方法，本轮没有成功执行并确认其界面。隔离库目录为 %LOCALAPPDATA%\com.workmemo.test.settlement，外观目录为 %APPDATA%\com.workmemo.test.settlement；正式数据目录仍为 com.workmemo.desktop。正常源码运行与正式构建不加测试配置。

## 后续原生验收步骤与预期

1. 在隔离程序中选择类别，工作量留空开始：创建一条任务，显示待填写；手动暂停和继续保持同 ID，暂停不增加工时。
2. 结束计时：结果进入待补全，页面显示有效结束时间、系统确认时间及有效工时。选择稍后填写后仍可立即开始下一项。
3. 在新任务运行时打开待补全列表，给旧记录填写 0 并保存：旧记录完成结算，新任务不中断，工作量统计为真实的 0。
4. 对另一条待补全记录填入正小数、调整类别与备注后保存：列表及统计刷新，数据库保留前后审计；空值、负数及超长备注不能保存成功。
5. 保留待补全记录，正常关闭并重新打开：待补全记录仍在；活动任务保持暂停，不补算关闭时间。
6. 切换四皮肤和透明度：界面可读，待补全和活动记录不改变；核对真实桌面透明、滚动和小尺寸窗口可用性。

这些步骤尚待实际执行。自动监测相关验收仍按 AUTO-TRACKING-SPEC.md 后续阶段实施。

## 兼容性与未完成范围

- 数据库升级至版本 2 后，旧版程序会拒绝读取。迁移本身已在隔离数据库验证；本轮没有升级用户真实数据库，也没有安装新程序。
- 旧记录只保留其原本可知的累计时长，无法恢复过去未存储的暂停边界。旧暂停任务没有可追溯区间时，不能凭起止时间声称恢复了有效结束边界。
- 本阶段尚无浏览器扩展/连接、URL 配置、Windows 输入采样、5/7 分钟状态机、离页 2+10 分钟规则、锁屏/休眠监测或托盘后台运行。现有关闭窗口行为继续保存暂停并退出。
- 完整人工时间修正、补录、重叠处理、审计查询界面和结束时间编辑属于后续阶段；本阶段只有类别、工作量、备注的结算与后端审计基础，没有放置这些未实现功能的装饰按钮。
- 不把本机编译、单元测试或旧版启动核对当成修改后原生功能全部验收。

## 文件与完整代码

完整绝对路径、NEW FILE / UPDATE 及文件关系见 AUTO-TRACKING-PHASE-1-FILES.md。所有完整代码保存在项目对应文件；AUTO-TRACKING-PHASE-1-SOURCE.md 逐文件收录本阶段完整文本，不使用省略号代替代码。

## Git 同步

按已有授权完成暂存检查后提交推送 main，不包含依赖、构建产物、测试配置或真实数据库。原生验收受限仍如实记录；保存代码进度不代表全部功能验收通过。

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: persist work intervals and deferred quantity settlement"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

实际推送结果以本轮交付回复及 Git 提交为准。本阶段结束后等待用户确认，不自动进入第二阶段。
````````

## NEW FILE E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md

````````markdown
# 自动工作记录：已确认业务规则与分阶段改造

用户于 2026-10-26（Asia/Shanghai）确认按规则整理方案开始实施。本文件补充 PRODUCT-SPEC.md；关于开始前填写数量、结束与结算的旧规则，以本文件为准。原技术栈、真实透明窗口、四种皮肤、数据可靠性及阶段确认约束继续适用。

## 已确认口径

- 自动开始必须同时满足：浏览器在前台、活动标签页命中配置的工作 URL、进入该工作环境后有最近 5 秒内的新输入、监测连接可信、没有未结束记录。
- 初期每 5 秒读取输入活动状态；页面每 3～5 秒或通过事件更新。只使用最后输入时间、页面匹配和连接状态，不采集按键、文本、轨迹或页面内容。
- 最后输入后 5 分钟提醒，7 分钟结束。阈值按真实最后输入时间计算，不按轮询时间计算。
- 离页前 2 分钟为计时宽限；满 2 分钟暂停，暂停后保留 10 分钟，即离页满 12 分钟结束。保留期内返回且有新输入可恢复原记录。
- 空闲与离页独立计算，先到的结束期限生效，同刻优先空闲；后端只结束一次、生成一项结算提醒。
- 空闲结束时有效尾段回退到最后输入；暂停、离线、锁屏、休眠和无法确认区间不计时。确认结束时间另存。其他应用的输入不能补回已暂停时间。
- 计时结束先提交 SQLite，再提示填写工作量。待补全记录不占用活动任务位置，不妨碍新记录。
- 工作量开始时可空，结算时必填；允许明确填写 0、正小数和科学计数，最大 10 亿。NULL 表示未填，0 表示已确认无产出；拒绝非有限数、负数及下溢成 0 的非零输入。
- 工作类别保留评测、质检、开发、文档。工作 URL 绑定默认类别；同一记录内切换匹配 URL 不自动拆分，结算时可以修正类别。
- 手动开始、继续不要求匹配 URL，开启人工计时区间；仍受空闲及系统状态保护。手动暂停只能由用户明确继续，不自动结束或另开记录。
- 明确从暂停任务切换到另一项时，旧记录结束与新记录创建须原子执行。自动监测不得复用该切换行为绕过手动暂停。
- 自动结束后必须创建新记录，不合并旧记录。新记录需要结束后的新活动信号。
- 补录标为人工补录；修改类别、工作量、备注或时间保留原值和修正信息，时间修正需核对有效区间，不能把暂停时长直接加回。
- 结束提醒非模态、可稍后填写、不持续抢焦点。关闭提醒保留待补全记录。待补全及提醒状态可重启恢复。
- 工时统计包含已结束待补全记录，工作量汇总仅含已结算数量，并显示待补全数量；日期归属沿用当前按开始日统计的规则。
- 第一版先验证一种明确支持的浏览器。URL 使用明确域名及可选路径前缀，默认忽略查询参数和片段，不加入复杂智能判断。
- 后续关闭主窗口继续后台监测，提供明确退出入口。开机启动未纳入本次默认实施范围。完全退出期间不能自动记录。

阅读、思考等连续低输入工作可能被少计。第一版保留固定阈值和人工修正，不进行内容识别；实际使用后再决定阈值或阅读模式。

## 阶段与确认边界

1. **数据与手动结算基础（当前阶段）**：兼容迁移现有 SQLite；工作量可空及 0；计时区间持久化；暂停与重启恢复；结束、待补全、填写独立；真实待补全列表及保存入口；已有手动计时、历史和主题回归。此阶段不声称已提供自动监测。
2. **自动监测与后台运行**：Windows 输入与系统状态、浏览器连接及 URL 配置、截止时间状态机、自动开始/暂停/结束、后台窗口生命周期和非阻塞提醒。接入真实监测，验证故障恢复与最小权限。
3. **人工补录修正与成品验收**：完整时间修正、补录、重叠处理及原始结果追溯；实际 Windows 场景、迁移、四皮肤及透明回归；打包与交付。

每阶段结束记录实际结果，提交并推送 Git，等待用户确认后进入下一阶段。完成某一阶段不代表整个自动记录功能已经完成。

## 数据迁移原则

- 旧记录的 ID、类别、数量、备注、起止时间和毫秒时长保留；旧已结束记录作为已结算历史。
- 旧版只有累计时长，不能凭开始与结束时间伪造有效区间。旧时长保留为历史基数，新产生的区间另存。
- 新旧记录继续使用同一数据库和历史入口；填写状态与计时状态分开。
- 所有业务写入由 Rust 校验并事务提交。迁移失败回滚，不重置数据库。
- 外观配置、原生透明配置及应用标识不因计时改造而改变。隔离验收使用独立应用标识，不对真实数据库制造测试任务。
````````

## UPDATE E:\WorkMemo\docs\PRODUCT-SPEC.md

````````markdown
WorkMemo — 完整桌面工作留痕工具开发规范
2026-10-26 补充：用户已确认自动记录改造，新增规则与阶段边界见 docs/AUTO-TRACKING-SPEC.md。开始前数量必填、结束即完成等冲突处以该补充为准，其余长期约束继续适用。
你现在是这个项目的主要软件开发工程师。请协助我开发一款真实可用、稳定、美观的 Windows 桌面应用 WorkMemo。
请将本指令作为整个项目的长期产品需求与开发规范。后续所有实现都必须遵守这些规则，除非我明确要求修改。
一、产品定位
WorkMemo 是一个个人本地工作留痕、任务计时和工作量统计工具。
它的核心不是复杂的项目管理，而是让用户能够在桌面上快速记录工作类别、工作数量、备注和有效工作时间。
产品应具备以下特点：
1. 轻量化：不需要复杂的导航和大量页面。
2. 桌面化：适合以小窗口形式放置在 Windows 桌面上。
3. 透明化：支持透明背景和多种外观皮肤。
4. 高效率：开始、暂停、继续和结束任务应当简单直接。
5. 数据可靠：历史记录可以持久保存、查询和统计。
6. 易于维护：代码清晰，适合初学者理解和继续开发。
最终目标是一个可以长期使用的个人桌面工具，而不是只有外观、没有实际业务能力的 Demo。
二、固定技术栈
必须使用：
- Tauri 2：桌面应用框架。
- React + TypeScript：前端界面与交互。
- Vite：前端开发和构建。
- Rust：桌面端业务逻辑和可靠的数据处理。
- SQLite：结构化本地数据存储，优先复用现有数据库实现。
- HTML、CSS：界面和视觉效果。
不要擅自改为 Electron、JavaFX、纯网页应用或其他技术栈。
优先使用轻量依赖。引入新依赖前，先确认是否有必要，以及它是否与当前 Tauri 2 版本兼容。
如果现有项目已经使用了不同但合理的数据持久化方案，请先检查实际代码，不要未经确认就重写或迁移。
三、开发前的强制要求
开始任何开发任务之前：
1. 检查实际项目目录和文件结构。
2. 阅读相关的 React、Rust、Tauri 配置和数据持久化代码。
3. 确认项目当前能否正常启动。
4. 区分已完成、未完成和存在问题的功能。
5. 找出本次任务会影响的文件。
6. 制定最小必要的修改方案。
不能假设你已经读取了我的本地文件。
如果无法访问本地项目，请告诉我需要提供哪些文件或命令输出。
不要直接从零生成整个项目，也不要随意覆盖现有代码。优先在现有项目基础上迭代。
四、核心工作记录功能
4.1 工作记录数据结构
每条工作记录至少包含：
- id：唯一记录标识。
- category：工作类别。
- quantity：工作数量。
- remark：工作备注。
- start_time：开始时间。
- end_time：结束时间。
- duration_seconds：有效工作时长。
- status：工作状态。
工作状态：
- NOT_STARTED
- WORKING
- FINISHED
可以根据实际实现增加必要字段，但不得随意删除已有字段或破坏兼容性。
4.2 工作类别
初始工作类别：
- 评测
- 质检
- 开发
- 文档
类别应当以清晰的选择控件呈现，不能要求用户每次手动输入类别。
未来可以考虑自定义类别，但不需要在第一版中实现复杂的类别管理系统。
4.3 开始工作
开始工作之前，用户必须选择类别并填写大于 0 的数量。
校验要求：
- 类别不能为空。
- 数量必须是合法的正数。
- 非法输入不能启动任务。
- 应显示清晰、简短的错误提示。
开始后，记录实际开始时间，进入 WORKING 状态，并开始计算有效工作时长。
同一时间只能有一个活动任务。
4.4 暂停和继续
工作过程中可以暂停。
暂停期间不计入有效工作时长。
继续时恢复同一任务，不新建记录，不重置已经累计的时长。
计时逻辑应当基于真实时间和任务状态，而不是仅依赖每秒递增的前端变量。
应考虑窗口失去焦点、系统时间变化和应用重启等情况，避免出现明显的计时错误。
4.5 结束和切换任务
结束任务后：
- 记录结束时间。
- 计算有效工作时长。
- 保存完整记录。
- 更新任务状态。
- 更新历史记录和统计数据。
如果当前任务处于暂停状态，用户开始另一项任务时，应按照既定业务规则自动结束并保存之前的任务。
如果当前任务仍在进行，应避免直接覆盖它或意外丢失数据。
4.6 应用重启与异常恢复
应用关闭或重启后，不得无提示地丢失已经保存的数据。
启动时应检查是否存在未完成任务，并根据保存的状态恢复或提示用户处理。
如果要恢复计时，必须能够区分工作时间与暂停时间。
不要因为重新打开应用就将旧任务当成一条全新的工作记录。
五、桌面窗口和透明背景
透明背景是 WorkMemo 的重要产品特色，不是可有可无的装饰。
5.1 原生透明窗口
在 Tauri 2 中实现真正的桌面透明效果。
要求：
- 原生窗口支持透明背景。
- 前端页面背景能够透出桌面。
- 不允许整个页面仍然存在不透明的默认白色背景。
- 窗口尺寸应适合桌面小组件。
- 可以合理地拖动窗口。
- 不出现明显的白色方块、黑色背景残留或不自然的矩形边缘。
- 确保文字和交互控件仍然清晰可用。
必须检查 Tauri 窗口配置、前端根节点背景、各层容器背景和实际 Windows 渲染结果。
不要只通过修改 CSS 就宣称原生透明窗口已经实现。
5.2 无边框与窗口操作
在不影响可用性的前提下，实现简洁的无边框窗口外观。
窗口应当具有明确的拖动区域，并保留必要的窗口操作能力。
如果采用自定义标题栏，需要确保用户仍能移动窗口和关闭应用。
拖动区域不能覆盖按钮、输入框或其他交互控件。
5.3 透明度与可读性
支持调整皮肤透明度。
透明度应有合理范围，不能因为用户调得过低而让文字和按钮完全无法辨认。
应保证文字、按钮、输入框和计时器在不同背景下具有足够的对比度。
如果必要，可以使用半透明面板、柔和阴影和细微边缘高光来增强可读性。
5.4 窗口行为
核心功能应当在窗口移动、缩放和重新打开后继续正常工作。
如果实现置顶功能，应提供明确的开关，而不是强制将窗口永远置顶。
点击穿透等高级桌面功能不属于第一版的必需功能，不得为了实现这些功能破坏基本的鼠标操作。
六、换肤系统
换肤功能是第一版的重要功能。
6.1 内置皮肤
至少提供以下四种预设皮肤：
1. Glass：半透明玻璃风格。
2. Cream：温暖奶油风格。
3. Dark：简洁深色风格。
4. Neon：赛博科技风格。
每种皮肤应具有独立、统一的视觉规范，包括：
- 面板背景。
- 背景透明度默认值。
- 文字颜色。
- 主强调色。
- 按钮样式。
- 边框和圆角。
- 阴影与高光。
- 输入控件样式。
- 交互状态和提示样式。
不要只改变主背景颜色，而让其他控件仍然保留原皮肤的颜色。
6.2 皮肤切换
提供一个简洁的皮肤选择入口。
用户可以通过预览或清晰的名称切换皮肤。
切换后应立即生效，不需要重启应用。
切换皮肤不能重置当前任务、计时状态或历史记录。
6.3 自定义透明度
提供透明度滑块或其他直观控件。
调整时应能实时预览。
用户可以在合理范围内调整面板透明程度，并在必要时恢复默认值。
不要把整个应用内容一起降低透明度，否则文字和按钮会变得难以辨认。
应优先调整背景和面板的透明度，保持文字和交互控件清晰。
6.4 皮肤持久化
用户选定的皮肤和透明度应在应用重启后保留。
优先采用适合桌面应用的本地持久化方式。
皮肤设置与工作记录分开管理，避免修改外观时影响业务数据。
6.5 换肤架构
建立统一的主题变量或设计令牌，例如：
- background
- panelBackground
- textPrimary
- textSecondary
- accent
- border
- radius
- shadow
- opacity
避免在各个 React 组件中散落大量固定颜色。
新增皮肤时，应尽可能只需要添加主题配置，而不必重写所有组件。
七、界面设计与交互
7.1 整体设计
界面应当像一个精致的桌面小工具，而不是传统后台管理系统。
设计原则：
- 简洁、现代、轻量。
- 有明确的视觉层级。
- 控件尺寸适合桌面小窗口。
- 减少无意义的装饰。
- 使用细腻但克制的动画。
- 让用户能够迅速理解当前状态。
不要为了追求玻璃质感而让面板、文字和背景混在一起。
7.2 工作主界面
主界面优先展示：
- 当前任务信息。
- 工作类别选择。
- 工作数量输入。
- 备注输入入口。
- 实时工作时长。
- 开始、暂停、继续和结束操作。
- 历史记录入口。
- 皮肤设置入口。
不需要同时展示所有统计图表和大量历史信息。
可以采用简洁的主面板，并将历史记录、统计和设置放入独立的轻量视图或弹出面板中。
7.3 状态展示
工作状态可以通过按钮变化、计时器、图标和适度的视觉反馈表达。
不要堆叠重复的状态标签。
不同状态下，用户必须明确知道下一步可以做什么。
7.4 交互反馈
所有按钮都必须真正执行对应操作。
所有输入都必须能够正常编辑。
所有弹出面板都应当可以正常打开和关闭。
不能存在仅用于装饰的按钮、失效的点击区域或不完整的操作流程。
八、历史记录与统计
8.1 历史记录
提供真实的历史记录查询界面。
至少显示：
- 工作日期。
- 工作类别。
- 工作数量。
- 备注。
- 开始和结束时间。
- 有效工作时长。
历史记录必须来自真实持久化数据。
用户应能够查看过去的记录，并在需要时删除记录。
删除操作必须有确认机制。
8.2 统计功能
至少支持：
- 每日工作数量汇总。
- 按类别汇总工作数量。
- 每日有效工作时长。
- 历史记录总览。
统计结果必须由真实数据计算。
当没有记录时，应显示友好的空状态，而不是虚构数字或图表。
8.3 数据一致性
保存、修改和删除记录后，历史记录与统计视图应及时更新。
如果后端操作失败，必须向用户说明失败，不得显示虚假的成功状态。
九、数据安全与可靠性
所有关键业务数据必须持久保存。
如果采用 SQLite，应当：
- 使用明确的数据表结构。
- 合理处理时间、数量和状态字段。
- 正确处理数据库错误。
- 避免重复写入。
- 保证记录查询与统计结果一致。
- 在需要调整结构时考虑已有数据迁移。
不要把 React 内存状态当作永久存储。
皮肤配置与工作记录应分别管理。
如果现有项目已经有数据库，不要在未经检查的情况下创建第二套互不兼容的数据存储。
十、代码结构与维护规范
1. 保持 React 组件职责清晰。
2. 将业务逻辑与纯视觉组件合理分离。
3. Rust 负责必要的后端校验和数据持久化。
4. 避免过度复杂的状态管理。
5. 避免无必要的依赖。
6. 不使用大量重复 CSS。
7. 不随意更改现有数据结构。
8. 不删除已有功能。
9. 不允许使用伪实现冒充真实功能。
10. 不使用省略号代替要求交付的完整代码。
对于窗口控制、持久化和原生能力，必须使用与当前 Tauri 2 项目兼容的实现。
涉及权限配置时，只授予必要权限，不要为了省事开启过宽的权限。
十一、开发与交付流程
按照阶段开发，不要一次性生成整个项目的所有代码。
建议阶段：
阶段 1：检查现有项目，确认架构、进度和启动方式。
阶段 2：梳理并验证工作记录、计时和数据持久化逻辑。
阶段 3：实现原生透明窗口、无边框外观和基本拖动。
阶段 4：实现主题系统、四种预设皮肤和透明度调节。
阶段 5：完成主界面与各工作状态的交互。
阶段 6：完成历史记录、删除操作和统计功能。
阶段 7：进行完整的业务测试、窗口测试、换肤测试和数据恢复测试。
阶段 8：修复问题，优化视觉细节，并验证正式构建。
这些阶段可以根据现有代码调整。如果某个功能已经可靠完成，不要重复实现。
每个阶段结束后，先总结结果并等待我确认，再继续下一个阶段。
十二、每次回复的格式
每次开发任务都应包含：
1. 本次目标。
2. 对现有实现的检查结果。
3. 完整文件路径清单，并标注 NEW FILE 或 UPDATE。
4. 必要的完整代码。
5. 在 Windows PowerShell 中执行的命令。
6. 逐步测试方法和预期结果。
7. 可能存在的兼容性问题。
8. Git 提交命令。
修改多个文件时，应说明文件之间的关系。
优先给出可以直接使用的完整文件内容；如果完整文件很长，可以先询问是否分批交付，不得为了简短而省略关键代码。
如果发生错误，先分析原因并针对性修复，不要直接推翻整个项目。
不得声称已经运行、测试或验证某项功能，除非确实完成了相应操作。
十三、验收标准
WorkMemo 第一版只有满足以下条件，才能认为基本完成：
- 应用能够在 Windows 上正常启动。
- 工作任务可以创建、暂停、继续和结束。
- 暂停时间不计入有效工作时长。
- 任务记录能够持久保存。
- 重启后能够正确读取历史数据。
- 同一时间不会出现多个正在进行的任务。
- 透明窗口能够真实显示桌面背景。
- 窗口能够正常移动，基础操作不受影响。
- 四种预设皮肤均可正常切换。
- 透明度能够调整并保存。
- 换肤不会影响工作任务和历史数据。
- 历史记录能够查询和删除。
- 统计数据来源于真实记录。
- 空状态、错误状态和正常状态均有合理反馈。
- 主要控件在不同皮肤下都具有良好的可读性。
- 项目能够完成正式构建。
十四、最终开发原则
始终遵循：
数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
同时，透明桌面窗口与皮肤切换是本项目的特色需求，不能被当作普通配色修改敷衍处理。
现在请先检查现有 WorkMemo 项目，报告当前的实际实现情况、需要修复的问题和建议的开发顺序。
不要立刻修改大量代码，也不要直接重写整个项目。先给出检查结果和第一阶段计划，等待我确认后再执行。
````````

## NEW FILE E:\WorkMemo\src-tauri\migrations\002_settlement.sql

````````sql
-- Preserve the AUTOINCREMENT high-water mark, including deleted record IDs.
CREATE TEMP TABLE old_record_sequence AS SELECT seq FROM sqlite_sequence WHERE name='work_records';
CREATE TABLE work_records_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档')),
    quantity REAL CHECK(quantity IS NULL OR (quantity >= 0 AND quantity <= 1000000000)),
    remark TEXT NOT NULL DEFAULT '' CHECK(length(remark) <= 2000),
    start_time INTEGER NOT NULL CHECK(start_time >= 0),
    end_time INTEGER,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms >= 0),
    status TEXT NOT NULL CHECK(status IN ('NOT_STARTED','WORKING','FINISHED')),
    is_paused INTEGER NOT NULL DEFAULT 1 CHECK(is_paused IN (0,1)),
    recovery_pending INTEGER NOT NULL DEFAULT 0 CHECK(recovery_pending IN (0,1)),
    settlement_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(settlement_status IN ('IN_PROGRESS','PENDING','COMPLETE')),
    source TEXT NOT NULL DEFAULT 'MANUAL_START' CHECK(source IN ('AUTO','MANUAL_START','MANUAL_ENTRY')),
    pause_reason TEXT CHECK(pause_reason IN ('MANUAL','APP_CLOSE','RECOVERY','AWAY','MONITOR')),
    confirmed_end_time INTEGER CHECK(confirmed_end_time >= 0),
    last_input_time INTEGER CHECK(last_input_time >= 0),
    end_reason TEXT CHECK(end_reason IN ('MANUAL','SWITCH','IDLE','AWAY','RECOVERY')),
    legacy_duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(legacy_duration_ms >= 0),
    revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
    CHECK(duration_seconds = duration_ms / 1000),
    CHECK((status='FINISHED' AND end_time IS NOT NULL AND end_time >= start_time AND is_paused=1 AND settlement_status!='IN_PROGRESS')
       OR (status!='FINISHED' AND end_time IS NULL AND settlement_status='IN_PROGRESS')),
    CHECK(settlement_status!='COMPLETE' OR quantity IS NOT NULL)
);
INSERT INTO work_records_v2(id,category,quantity,remark,start_time,end_time,duration_seconds,duration_ms,status,is_paused,recovery_pending,
    settlement_status,pause_reason,confirmed_end_time,legacy_duration_ms)
SELECT id,category,quantity,remark,start_time,end_time,duration_seconds,duration_ms,status,is_paused,recovery_pending,
    CASE WHEN status='FINISHED' THEN 'COMPLETE' ELSE 'IN_PROGRESS' END,
    CASE WHEN status='WORKING' AND is_paused=1 THEN 'MANUAL' ELSE NULL END,
    end_time,duration_ms FROM work_records;
DROP TABLE work_records;
ALTER TABLE work_records_v2 RENAME TO work_records;
UPDATE sqlite_sequence SET seq=MAX(seq,COALESCE((SELECT seq FROM old_record_sequence),0)) WHERE name='work_records';
INSERT INTO sqlite_sequence(name,seq) SELECT 'work_records',seq FROM old_record_sequence
    WHERE NOT EXISTS(SELECT 1 FROM sqlite_sequence WHERE name='work_records');
DROP TABLE old_record_sequence;
CREATE UNIQUE INDEX one_active_task ON work_records(status) WHERE status='WORKING';
CREATE INDEX pending_settlement ON work_records(id) WHERE status='FINISHED' AND settlement_status='PENDING';

-- Old durations remain a baseline; no synthetic historical intervals are created.
CREATE TABLE work_segments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL REFERENCES work_records(id) ON DELETE CASCADE,
    start_time INTEGER NOT NULL CHECK(start_time >= 0),
    end_time INTEGER,
    checkpoint_time INTEGER NOT NULL CHECK(checkpoint_time >= start_time),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms >= 0),
    state TEXT NOT NULL CHECK(state IN ('OPEN','CLOSED','RECOVERED')),
    CHECK((state='OPEN' AND end_time IS NULL) OR (state!='OPEN' AND end_time=checkpoint_time)),
    CHECK(checkpoint_time-start_time=duration_ms)
);
CREATE UNIQUE INDEX one_open_segment ON work_segments(record_id) WHERE state='OPEN';
CREATE INDEX record_segments ON work_segments(record_id,id);
CREATE TABLE record_revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id INTEGER NOT NULL REFERENCES work_records(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL CHECK(revision > 0),
    changed_at INTEGER NOT NULL CHECK(changed_at >= 0),
    before_json TEXT NOT NULL,
    after_json TEXT NOT NULL,
    UNIQUE(record_id,revision)
);
````````

## UPDATE E:\WorkMemo\src-tauri\src\appearance_tests.rs

````````rust
use super::*;

struct Directory(PathBuf);
impl Directory {
    fn new() -> Self {
        let sequence = NEXT_TEMP.fetch_add(1, Ordering::Relaxed);
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "workmemo-appearance-{}-{nonce}-{sequence}",
            std::process::id()
        ));
        fs::create_dir(&path).unwrap();
        Self(path)
    }
    fn settings(&self) -> PathBuf {
        self.0.join("appearance.json")
    }
}
impl Drop for Directory {
    fn drop(&mut self) {
        for item in fs::read_dir(&self.0).unwrap().flatten() {
            let _ = fs::remove_file(item.path());
        }
        let _ = fs::remove_dir(&self.0);
    }
}

#[test]
fn missing_file_uses_default_without_writing() {
    let directory = Directory::new();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    assert!(!directory.settings().exists());
}

#[test]
fn all_themes_and_boundaries_round_trip_over_existing_file() {
    let directory = Directory::new();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        for opacity in [80, 88, 100] {
            let expected = Appearance {
                version: 1,
                theme,
                opacity,
            };
            save(&directory.settings(), expected.clone()).unwrap();
            assert_eq!(load(&directory.settings()).unwrap(), expected);
        }
    }
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn invalid_opacity_does_not_replace_saved_settings() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original = fs::read(directory.settings()).unwrap();
    for opacity in [0, 79, 101, 255] {
        assert!(
            save(
                &directory.settings(),
                Appearance {
                    opacity,
                    ..Appearance::default()
                }
            )
            .is_err()
        );
    }
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn corrupted_file_is_reported_and_backed_up_before_explicit_repair() {
    let directory = Directory::new();
    let original = b"invalid settings";
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
    save(&directory.settings(), Appearance::default()).unwrap();
    assert_eq!(load(&directory.settings()).unwrap(), Appearance::default());
    let backup = fs::read_dir(&directory.0)
        .unwrap()
        .flatten()
        .find(|item| item.file_name().to_string_lossy().contains("recovery"))
        .unwrap();
    assert_eq!(fs::read(backup.path()).unwrap(), original);
}

#[test]
fn newer_schema_is_not_overwritten() {
    let directory = Directory::new();
    let original = br#"{"version":2,"theme":"future","opacity":90}"#;
    fs::write(directory.settings(), original).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original);
}

#[test]
fn rejects_unknown_theme_and_oversized_configuration() {
    let directory = Directory::new();
    fs::write(
        directory.settings(),
        br#"{"version":1,"theme":"unknown","opacity":90}"#,
    )
    .unwrap();
    assert!(load(&directory.settings()).is_err());
    fs::write(directory.settings(), vec![b' '; MAX_BYTES as usize + 1]).unwrap();
    assert!(load(&directory.settings()).is_err());
    assert!(save(&directory.settings(), Appearance::default()).is_err());
}

#[cfg(windows)]
#[test]
fn failed_replace_keeps_original_and_removes_temporary_file() {
    let directory = Directory::new();
    save(&directory.settings(), Appearance::default()).unwrap();
    let original_bytes = fs::read(directory.settings()).unwrap();
    let original_permissions = fs::metadata(directory.settings()).unwrap().permissions();
    let mut readonly = original_permissions.clone();
    readonly.set_readonly(true);
    fs::set_permissions(directory.settings(), readonly).unwrap();
    let result = save(
        &directory.settings(),
        Appearance {
            theme: Theme::Dark,
            ..Appearance::default()
        },
    );
    fs::set_permissions(directory.settings(), original_permissions).unwrap();
    assert!(result.is_err());
    assert_eq!(fs::read(directory.settings()).unwrap(), original_bytes);
    assert_eq!(fs::read_dir(&directory.0).unwrap().count(), 1);
}

#[test]
fn saving_appearance_never_changes_the_work_session() {
    use crate::{
        clock::SystemClock,
        database::{StartInput, Store},
    };
    let directory = Directory::new();
    let mut store = Store::open(
        &directory.0.join("workmemo.sqlite3"),
        Box::new(SystemClock::new()),
    )
    .unwrap();
    store
        .start(StartInput {
            category: "开发".into(),
            quantity: Some(2.5),
            remark: "isolation test".into(),
        })
        .unwrap();
    let original = store.snapshot().unwrap().active.unwrap();
    for theme in [Theme::Glass, Theme::Cream, Theme::Dark, Theme::Neon] {
        save(
            &directory.settings(),
            Appearance {
                version: 1,
                theme,
                opacity: 85,
            },
        )
        .unwrap();
    }
    let current = store.snapshot().unwrap().active.unwrap();
    assert_eq!(current.id, original.id);
    assert_eq!(current.start_time, original.start_time);
    assert_eq!(current.remark, original.remark);
    assert_eq!(current.quantity, original.quantity);
    assert_eq!(current.status, "WORKING");
    assert!(!current.is_paused);
    assert!(store.snapshot().unwrap().recent_records.is_empty());
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\database.rs

````````rust
use crate::clock::{Clock, TimePoint};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use std::{fs::File, path::Path, time::Duration};

pub type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Debug, Serialize)]
pub struct WorkRecord {
    pub id: i64,
    pub category: String,
    pub quantity: Option<f64>,
    pub remark: String,
    /// Unix milliseconds; durations use the independent monotonic clock.
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub duration_seconds: i64,
    pub duration_ms: i64,
    pub status: String,
    pub is_paused: bool,
    pub recovery_pending: bool,
    pub settlement_status: String,
    pub source: String,
    pub pause_reason: Option<String>,
    pub confirmed_end_time: Option<i64>,
    pub last_input_time: Option<i64>,
    pub end_reason: Option<String>,
    pub legacy_duration_ms: i64,
    pub revision: i64,
}

#[derive(Debug, Deserialize)]
pub struct StartInput {
    pub category: String,
    pub quantity: Option<f64>,
    pub remark: String,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub active: Option<WorkRecord>,
    pub recent_records: Vec<WorkRecord>,
    pub warning: Option<String>,
    pub pending_count: i64,
}

struct Segment {
    id: i64,
    row_id: i64,
    base_ms: i64,
    started_ticks: i64,
    started_wall: i64,
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
    duration_seconds, duration_ms, status, is_paused, recovery_pending,
    settlement_status, source, pause_reason, confirmed_end_time, last_input_time,
    end_reason, legacy_duration_ms, revision";

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
        settlement_status: row.get(11)?,
        source: row.get(12)?,
        pause_reason: row.get(13)?,
        confirmed_end_time: row.get(14)?,
        last_input_time: row.get(15)?,
        end_reason: row.get(16)?,
        legacy_duration_ms: row.get(17)?,
        revision: row.get(18)?,
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
            .execute_batch(
                "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;",
            )
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
            }
            1 | 2 => {}
            _ => return Err("数据库来自较新版本，请使用较新版本的 WorkMemo；未修改数据。".into()),
        }
        if version < 2 {
            tx.execute_batch(include_str!("../migrations/002_settlement.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 2)
                .map_err(db_error)?;
        }
        // Never infer work while the application was closed from wall-clock time.
        tx.execute("UPDATE work_segments SET state='RECOVERED',end_time=checkpoint_time WHERE state='OPEN'", [])
            .map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET is_paused=1, recovery_pending=1,
             pause_reason=COALESCE(pause_reason,'RECOVERY') WHERE status='WORKING'",
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
        self.save_running(&record, None)
    }

    fn save_running(&mut self, record: &WorkRecord, pause_reason: Option<&str>) -> Result<()> {
        let duration = self.elapsed(record, self.clock.now())?;
        let tx = self.connection.transaction().map_err(db_error)?;
        write_segment(
            &tx,
            self.segment.as_ref(),
            record.id,
            duration,
            pause_reason.is_some(),
        )?;
        let changed = tx.execute(
            "UPDATE work_records SET duration_ms=?1, duration_seconds=?2 WHERE id=?3 AND status='WORKING' AND is_paused=0",
            params![duration, duration / 1000, record.id],
        ).map_err(db_error)?;
        if changed != 1 {
            return Err("计时保存失败，任务状态已变更。".into());
        }
        if let Some(reason) = pause_reason {
            tx.execute(
                "UPDATE work_records SET is_paused=1,pause_reason=?1 WHERE id=?2",
                params![reason, record.id],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
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
            pending_count: self.connection.query_row(
                "SELECT COUNT(*) FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING'", [], |r| r.get(0)
            ).map_err(db_error)?,
        })
    }

    pub fn start(&mut self, input: StartInput) -> Result<()> {
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if input
            .quantity
            .is_some_and(|quantity| !valid_quantity(quantity))
        {
            return Err("工作量必须为 0 到 10 亿之间的有限数值。".into());
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
            finish_row(&tx, previous.id, previous.start_time, now.wall_ms, "SWITCH")?;
        }
        tx.execute("INSERT INTO work_records(category, quantity, remark, start_time, status, is_paused,settlement_status) VALUES(?1,?2,?3,?4,'WORKING',0,'IN_PROGRESS')",
            params![input.category, input.quantity, remark, now.wall_ms]).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        let row_id = insert_segment(&tx, id, now.wall_ms)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: 0,
            started_ticks: now.ticks_ms,
            started_wall: now.wall_ms,
        });
        self.warning = None;
        Ok(())
    }

    pub fn pause(&mut self, id: i64) -> Result<()> {
        self.pause_with_reason(id, "MANUAL")
    }

    fn pause_with_reason(&mut self, id: i64, reason: &str) -> Result<()> {
        let record = self.current(id)?;
        if record.is_paused {
            return Ok(());
        }
        self.save_running(&record, Some(reason))?;
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
        let tx = self.connection.transaction().map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET is_paused=0, recovery_pending=0,pause_reason=NULL WHERE id=?1",
            [id],
        )
        .map_err(db_error)?;
        // A wall-clock rollback must not make new intervals overlap old intervals.
        let previous_end: Option<i64> = tx
            .query_row(
                "SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?1",
                [id],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        let started_wall = now
            .wall_ms
            .max(record.start_time)
            .max(previous_end.unwrap_or(0));
        let row_id = insert_segment(&tx, id, started_wall)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: record.duration_ms,
            started_ticks: now.ticks_ms,
            started_wall,
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
        let tx = self.connection.transaction().map_err(db_error)?;
        if !record.is_paused {
            write_segment(&tx, self.segment.as_ref(), id, duration, true)?;
        }
        tx.execute(
            "UPDATE work_records SET duration_ms=?1,duration_seconds=?2 WHERE id=?3",
            params![duration, duration / 1000, id],
        )
        .map_err(db_error)?;
        finish_row(&tx, id, record.start_time, now.wall_ms, "MANUAL")?;
        tx.commit().map_err(db_error)?;
        self.segment = None;
        self.warning = None;
        Ok(())
    }

    pub fn pause_for_close(&mut self) -> Result<()> {
        if let Some(record) = self.active()? {
            self.pause_with_reason(record.id, "APP_CLOSE")?;
        }
        Ok(())
    }
}

fn valid_quantity(quantity: f64) -> bool {
    quantity.is_finite() && (0.0..=1_000_000_000.0).contains(&quantity)
}

fn insert_segment(tx: &rusqlite::Transaction<'_>, record_id: i64, start: i64) -> Result<i64> {
    tx.execute("INSERT INTO work_segments(record_id,start_time,checkpoint_time,state) VALUES(?1,?2,?2,'OPEN')",params![record_id,start]).map_err(db_error)?;
    Ok(tx.last_insert_rowid())
}

fn write_segment(
    tx: &rusqlite::Transaction<'_>,
    segment: Option<&Segment>,
    id: i64,
    total: i64,
    close: bool,
) -> Result<()> {
    let segment = segment
        .filter(|s| s.id == id)
        .ok_or("计时区间不一致，请重新打开应用恢复任务。")?;
    let duration = total.saturating_sub(segment.base_ms);
    let checkpoint = segment
        .started_wall
        .checked_add(duration)
        .ok_or("计时数值超出范围。")?;
    let changed = tx
        .execute(
            "UPDATE work_segments SET duration_ms=?1,checkpoint_time=?2,
        end_time=CASE WHEN ?3 THEN ?2 ELSE NULL END,state=CASE WHEN ?3 THEN 'CLOSED' ELSE 'OPEN' END
        WHERE id=?4 AND record_id=?5 AND state='OPEN'",
            params![duration, checkpoint, close, segment.row_id, id],
        )
        .map_err(db_error)?;
    if changed != 1 {
        return Err("计时区间保存失败，未修改任务。".into());
    }
    Ok(())
}

fn finish_row(
    tx: &rusqlite::Transaction<'_>,
    id: i64,
    start: i64,
    confirmed: i64,
    reason: &str,
) -> Result<()> {
    let confirmed = confirmed.max(0);
    tx.execute("UPDATE work_records SET status='FINISHED',is_paused=1,recovery_pending=0,pause_reason=NULL,
        settlement_status='PENDING',confirmed_end_time=?1,end_reason=?2,
        end_time=MAX(?3,COALESCE((SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?4),?1)) WHERE id=?4 AND status='WORKING'",
        params![confirmed,reason,start,id]).map_err(db_error)?;
    Ok(())
}

#[cfg(test)]
#[path = "database_tests.rs"]
mod tests;

#[path = "history.rs"]
mod history;
pub use history::{HistoryPage, HistoryQuery};

#[path = "settlement.rs"]
mod settlement;
pub use settlement::SettleInput;

#[cfg(test)]
#[path = "settlement_tests.rs"]
mod settlement_tests;

#[cfg(test)]
#[path = "reliability_tests.rs"]
mod reliability_tests;
````````

## UPDATE E:\WorkMemo\src-tauri\src\database_tests.rs

````````rust
use super::*;
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

#[derive(Clone)]
pub(super) struct TestClock(Arc<Mutex<TimePoint>>);

impl TestClock {
    pub(super) fn new() -> Self {
        Self(Arc::new(Mutex::new(TimePoint {
            wall_ms: 1_000_000,
            ticks_ms: 0,
        })))
    }
    pub(super) fn advance(&self, ms: i64) {
        let mut time = self.0.lock().unwrap();
        time.wall_ms += ms;
        time.ticks_ms += ms;
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

fn input() -> StartInput {
    StartInput {
        category: "开发".into(),
        quantity: Some(2.5),
        remark: "实际测试".into(),
    }
}
fn memory() -> (Store, TestClock) {
    let clock = TestClock::new();
    let store = Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(clock.clone()),
        None,
    )
    .unwrap();
    (store, clock)
}
fn id(store: &Store) -> i64 {
    store.active().unwrap().unwrap().id
}

pub(super) struct TestDirectory(PathBuf);
impl TestDirectory {
    pub(super) fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir =
            std::env::temp_dir().join(format!("workmemo-test-{}-{nonce}", std::process::id()));
        std::fs::create_dir(&dir).unwrap();
        Self(dir)
    }
    pub(super) fn db(&self) -> PathBuf {
        self.0.join("test.sqlite3")
    }
}
impl Drop for TestDirectory {
    fn drop(&mut self) {
        for name in [
            "test.sqlite3",
            "test.sqlite3-wal",
            "test.sqlite3-shm",
            "test.lock",
        ] {
            let _ = std::fs::remove_file(self.0.join(name));
        }
        let _ = std::fs::remove_dir(&self.0);
    }
}

#[test]
fn rejects_invalid_input_without_creating_records() {
    let (mut store, _) = memory();
    for quantity in [-1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        let mut value = input();
        value.quantity = Some(quantity);
        assert!(store.start(value).is_err());
    }
    for category in ["", "未知"] {
        let mut value = input();
        value.category = category.into();
        assert!(store.start(value).is_err());
    }
    let mut long = input();
    long.remark = "字".repeat(2001);
    assert!(store.start(long).is_err());
    assert!(store.snapshot().unwrap().active.is_none());
    assert!(store.snapshot().unwrap().recent_records.is_empty());
}

#[test]
fn pause_resume_preserves_subseconds_and_excludes_pause() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1250);
    store.pause(task).unwrap();
    clock.advance(30_000);
    assert_eq!(store.snapshot().unwrap().active.unwrap().duration_ms, 1250);
    store.resume(task).unwrap();
    clock.advance(1750);
    store.finish(task).unwrap();
    let saved = &store.snapshot().unwrap().recent_records[0];
    assert_eq!(saved.id, task);
    assert_eq!(saved.duration_ms, 3000);
    assert_eq!(saved.duration_seconds, 3);
    assert_eq!(saved.status, "FINISHED");
    assert_eq!(saved.quantity, Some(2.5));
}

#[test]
fn monotonic_time_survives_wall_clock_changes_and_focus_gaps() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(500);
    clock.jump_wall(3_600_000);
    store.checkpoint().unwrap();
    clock.advance(2500);
    clock.jump_wall(-7_200_000);
    store.finish(task).unwrap();
    let record = &store.snapshot().unwrap().recent_records[0];
    assert_eq!(record.duration_ms, 3000);
    assert!(record.end_time.unwrap() >= record.start_time);
}

#[test]
fn running_task_is_protected_and_database_enforces_one_active() {
    let (mut store, _) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    assert!(store.start(input()).is_err());
    assert_eq!(id(&store), task);
    assert!(store.connection.execute("INSERT INTO work_records(category,quantity,start_time,status) VALUES('文档',1,1,'WORKING')", []).is_err());
}

#[test]
fn paused_switch_finishes_old_task_atomically() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let old = id(&store);
    clock.advance(2000);
    store.pause(old).unwrap();
    clock.advance(5000);
    let mut next = input();
    next.category = "文档".into();
    store.start(next).unwrap();
    assert_ne!(id(&store), old);
    let snapshot = store.snapshot().unwrap();
    assert_eq!(snapshot.recent_records.len(), 1);
    assert_eq!(snapshot.recent_records[0].duration_seconds, 2);
    assert_eq!(snapshot.active.unwrap().category, "文档");
}

#[test]
fn failed_switch_rolls_back_and_keeps_previous_task() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let old = id(&store);
    clock.advance(1000);
    store.pause(old).unwrap();
    store.connection.execute_batch("CREATE TRIGGER reject_new BEFORE INSERT ON work_records BEGIN SELECT RAISE(ABORT,'test write failure'); END;").unwrap();
    assert!(store.start(input()).is_err());
    let snapshot = store.snapshot().unwrap();
    assert!(snapshot.recent_records.is_empty());
    let active = snapshot.active.unwrap();
    assert_eq!(active.id, old);
    assert!(active.is_paused);
}

#[test]
fn repeated_commands_do_not_duplicate_time_or_records() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1500);
    store.pause(task).unwrap();
    store.pause(task).unwrap();
    store.resume(task).unwrap();
    clock.advance(500);
    store.resume(task).unwrap();
    clock.advance(1000);
    store.finish(task).unwrap();
    store.finish(task).unwrap();
    let saved = store.snapshot().unwrap().recent_records;
    assert_eq!(saved.len(), 1);
    assert_eq!(saved[0].duration_ms, 3000);
}

#[test]
fn stale_task_commands_cannot_change_replacement() {
    let (mut store, _) = memory();
    store.start(input()).unwrap();
    let old = id(&store);
    store.pause(old).unwrap();
    store.start(input()).unwrap();
    let current = id(&store);
    assert!(store.pause(old).is_err());
    assert!(store.resume(old).is_err());
    store.finish(old).unwrap();
    assert_eq!(id(&store), current);
}

#[test]
fn checkpoint_recovery_keeps_id_and_never_counts_downtime() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let task;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(input()).unwrap();
        task = id(&store);
        clock.advance(2400);
        store.checkpoint().unwrap();
        clock.advance(800); // Simulate process death before the next checkpoint.
    }
    clock.advance(86_400_000);
    let mut reopened = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let restored = reopened.snapshot().unwrap().active.unwrap();
    assert_eq!(restored.id, task);
    assert_eq!(restored.duration_ms, 2400);
    assert!(restored.is_paused && restored.recovery_pending);
    reopened.resume(task).unwrap();
    clock.advance(600);
    reopened.finish(task).unwrap();
    assert_eq!(
        reopened.snapshot().unwrap().recent_records[0].duration_seconds,
        3
    );
    drop(reopened);
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(reopened.active().unwrap().is_none());
    assert_eq!(reopened.snapshot().unwrap().recent_records[0].id, task);
}

#[test]
fn normal_close_saves_exact_duration_and_reopens_paused() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(input()).unwrap();
        clock.advance(975);
        store.pause_for_close().unwrap();
    }
    clock.advance(50_000);
    let mut store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    let record = store.snapshot().unwrap().active.unwrap();
    assert_eq!(record.duration_ms, 975);
    assert!(record.is_paused);
}

#[test]
fn failed_pause_retains_running_segment_for_retry() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1000);
    store.connection.execute_batch("CREATE TRIGGER reject_update BEFORE UPDATE ON work_records BEGIN SELECT RAISE(ABORT,'test disk failure'); END;").unwrap();
    assert!(store.pause(task).is_err());
    assert!(!store.active().unwrap().unwrap().is_paused);
    store
        .connection
        .execute_batch("DROP TRIGGER reject_update;")
        .unwrap();
    clock.advance(2000);
    store.pause(task).unwrap();
    assert_eq!(store.active().unwrap().unwrap().duration_seconds, 3);
}

#[test]
fn rejects_newer_schema_without_resetting_it() {
    let directory = TestDirectory::new();
    {
        let connection = Connection::open(directory.db()).unwrap();
        connection.execute_batch("CREATE TABLE existing_data(value TEXT); INSERT INTO existing_data VALUES('keep me'); PRAGMA user_version=999;").unwrap();
    }
    assert!(Store::open(&directory.db(), Box::new(TestClock::new())).is_err());
    let connection = Connection::open(directory.db()).unwrap();
    let version: i64 = connection
        .pragma_query_value(None, "user_version", |row| row.get(0))
        .unwrap();
    let value: String = connection
        .query_row("SELECT value FROM existing_data", [], |row| row.get(0))
        .unwrap();
    assert_eq!(version, 999);
    assert_eq!(value, "keep me");
}

#[test]
fn repeated_checkpoints_do_not_double_count_or_discard_subseconds() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    for _ in 0..5 {
        clock.advance(250);
        store.checkpoint().unwrap();
        store.snapshot().unwrap();
    }
    store.finish(task).unwrap();
    assert_eq!(
        store.snapshot().unwrap().recent_records[0].duration_ms,
        1250
    );
}

#[test]
fn invalid_switch_does_not_finish_the_paused_record() {
    let (mut store, clock) = memory();
    store.start(input()).unwrap();
    let task = id(&store);
    clock.advance(1500);
    store.pause(task).unwrap();
    let mut invalid = input();
    invalid.quantity = Some(-1.0);
    assert!(store.start(invalid).is_err());
    let snapshot = store.snapshot().unwrap();
    assert!(snapshot.recent_records.is_empty());
    let active = snapshot.active.unwrap();
    assert_eq!(active.id, task);
    assert_eq!(active.duration_ms, 1500);
    assert!(active.is_paused);
}

#[cfg(windows)]
#[test]
fn second_instance_cannot_recover_or_modify_live_database() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let mut first = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    first.start(input()).unwrap();
    assert!(Store::open(&directory.db(), Box::new(clock)).is_err());
    assert!(!first.active().unwrap().unwrap().is_paused);
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\history.rs

````````rust
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
    pub pending_records: i64,
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
        pending_records: row.get(offset + 3)?,
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
        let columns = "COUNT(*), COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity END),0.0), COALESCE(SUM(duration_ms),0), COALESCE(SUM(settlement_status='PENDING'),0)";
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
````````

## UPDATE E:\WorkMemo\src-tauri\src\history_tests.rs

````````rust
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
        duration_ms,duration_seconds,status,is_paused,settlement_status) VALUES(?1,?2,'测试夹具',
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000,
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000+86400000,?4,?4/1000,'FINISHED',1,'COMPLETE')",
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
            quantity: Some(2.0),
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
        assert_eq!(version, 2);
    }
    // Exact temporary test directory, created above; never a user database path.
    assert_eq!(directory.parent(), Some(std::env::temp_dir().as_path()));
    std::fs::remove_dir_all(directory).unwrap();
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\lib.rs

````````rust
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
            service::get_pending_records,
            service::settle_record,
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
````````

## UPDATE E:\WorkMemo\src-tauri\src\reliability_tests.rs

````````rust
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
        quantity: Some(quantity),
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
            assert_eq!(active.quantity, Some(quantity));
        }
        store.finish(id).unwrap();
        let finished = store.record(id).unwrap();
        store
            .settle(SettleInput {
                id,
                expected_revision: finished.revision,
                category: finished.category,
                quantity,
                remark: finished.remark,
            })
            .unwrap();
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
            let mut insert = tx.prepare("INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status)
                VALUES(?1,1.25,'隔离容量测试',?2,?2+1250,1250,1,'FINISHED',1,'COMPLETE')").unwrap();
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
````````

## UPDATE E:\WorkMemo\src-tauri\src\service.rs

````````rust
use crate::{
    clock::SystemClock,
    database::{
        HistoryPage, HistoryQuery, Result, SettleInput, Snapshot, StartInput, Store, WorkRecord,
    },
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

#[tauri::command]
pub async fn get_pending_records(state: State<'_, Backend>) -> Result<Vec<WorkRecord>> {
    access(state.inner.clone(), |store| store.pending_records()).await
}

#[tauri::command]
pub async fn settle_record(state: State<'_, Backend>, input: SettleInput) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.settle(input)).await
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\settlement.rs

````````rust
use super::{COLUMNS, Result, Store, WorkRecord, db_error, read_record, valid_quantity};
use rusqlite::params;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SettleInput {
    pub id: i64,
    pub expected_revision: i64,
    pub category: String,
    pub quantity: f64,
    pub remark: String,
}

impl Store {
    pub fn pending_records(&self) -> Result<Vec<WorkRecord>> {
        let mut statement = self.connection.prepare(&format!(
            "SELECT {COLUMNS} FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING' ORDER BY id"
        )).map_err(db_error)?;
        statement
            .query_map([], read_record)
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)
    }

    pub fn settle(&mut self, input: SettleInput) -> Result<()> {
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if !valid_quantity(input.quantity) {
            return Err("请填写 0 到 10 亿之间的有效工作量。".into());
        }
        let remark = input.remark.trim();
        if remark.chars().count() > 2000 {
            return Err("备注不能超过 2000 个字符。".into());
        }
        let before = self.record(input.id)?;
        if before.status != "FINISHED" {
            return Err("请先结束计时，再保存结算信息。".into());
        }
        // Repeating a successful request is safe; stale edits with different data are rejected.
        if before.settlement_status == "COMPLETE"
            && before.category == input.category
            && before.quantity == Some(input.quantity)
            && before.remark == remark
        {
            return Ok(());
        }
        if before.revision != input.expected_revision {
            return Err("记录已被修改，请重新读取后保存。".into());
        }
        let mut after = before.clone();
        after.category = input.category;
        after.quantity = Some(input.quantity);
        after.remark = remark.into();
        after.settlement_status = "COMPLETE".into();
        after.revision = before.revision.checked_add(1).ok_or("修订次数超出范围。")?;
        let before_json =
            serde_json::to_string(&before).map_err(|e| format!("无法保存原始记录：{e}"))?;
        let after_json =
            serde_json::to_string(&after).map_err(|e| format!("无法保存修订记录：{e}"))?;
        let changed_at = self.clock.now().wall_ms.max(0);
        let tx = self.connection.transaction().map_err(db_error)?;
        let changed = tx.execute("UPDATE work_records SET category=?1,quantity=?2,remark=?3,settlement_status='COMPLETE',revision=?4
            WHERE id=?5 AND status='FINISHED' AND revision=?6",
            params![after.category,after.quantity,after.remark,after.revision,input.id,before.revision]).map_err(db_error)?;
        if changed != 1 {
            return Err("记录状态已变化，请重新读取后保存。".into());
        }
        tx.execute("INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(?1,?2,?3,?4,?5)",
            params![input.id,after.revision,changed_at,before_json,after_json]).map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(())
    }
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\settlement_tests.rs

````````rust
use super::tests::{TestClock, TestDirectory};
use super::*;

fn start(quantity: Option<f64>) -> StartInput {
    StartInput {
        category: "开发".into(),
        quantity,
        remark: "原始备注".into(),
    }
}
fn settle(id: i64, quantity: f64) -> SettleInput {
    SettleInput {
        id,
        expected_revision: 0,
        category: "文档".into(),
        quantity,
        remark: "  结算备注  ".into(),
    }
}
fn memory() -> (Store, TestClock) {
    let clock = TestClock::new();
    (
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap(),
        clock,
    )
}

#[test]
fn empty_quantity_finishes_durably_without_blocking_next_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let first;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(start(None)).unwrap();
        first = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(first).unwrap();
        store.finish(first).unwrap();
        let pending = store.pending_records().unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].quantity, None);
        assert_eq!(pending[0].duration_ms, 1250);
        assert_eq!(pending[0].settlement_status, "PENDING");
        store.start(start(Some(0.0))).unwrap();
        assert_ne!(store.active().unwrap().unwrap().id, first);
        assert_eq!(store.snapshot().unwrap().pending_count, 1);
    }
    clock.advance(86_400_000);
    let mut reopened = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert_eq!(reopened.pending_records().unwrap()[0].id, first);
    reopened.settle(settle(first, 0.0)).unwrap();
    assert_eq!(reopened.pending_records().unwrap().len(), 0);
    let saved = reopened.record(first).unwrap();
    assert_eq!(saved.quantity, Some(0.0));
    assert_eq!(saved.settlement_status, "COMPLETE");
    assert_eq!(saved.duration_ms, 1250);
    assert!(reopened.active().unwrap().is_some());
}

#[test]
fn settlement_audits_original_data_rejects_stale_edits_and_is_idempotent() {
    let (mut store, clock) = memory();
    store.start(start(Some(2.0))).unwrap();
    let id = store.active().unwrap().unwrap().id;
    assert!(store.settle(settle(id, 3.0)).is_err());
    clock.advance(1000);
    store.finish(id).unwrap();
    store.settle(settle(id, 3.0)).unwrap();
    store.settle(settle(id, 3.0)).unwrap();
    assert!(store.settle(settle(id, 4.0)).is_err());
    let (count, before, after): (i64, String, String) = store
        .connection
        .query_row(
            "SELECT COUNT(*),before_json,after_json FROM record_revisions WHERE record_id=?1",
            [id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .unwrap();
    assert_eq!(count, 1);
    let before: serde_json::Value = serde_json::from_str(&before).unwrap();
    let after: serde_json::Value = serde_json::from_str(&after).unwrap();
    assert_eq!(before["quantity"], 2.0);
    assert_eq!(before["remark"], "原始备注");
    assert_eq!(before["settlement_status"], "PENDING");
    assert_eq!(after["quantity"], 3.0);
    assert_eq!(after["duration_ms"], 1000);
    let mut correction = settle(id, 4.0);
    correction.expected_revision = 1;
    store.settle(correction).unwrap();
    assert_eq!(store.record(id).unwrap().revision, 2);
}

#[test]
fn failed_audit_write_rolls_back_entire_settlement() {
    let (mut store, _) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    store.finish(id).unwrap();
    store.connection.execute_batch("CREATE TRIGGER reject_audit BEFORE INSERT ON record_revisions BEGIN SELECT RAISE(ABORT,'disk failure'); END;").unwrap();
    assert!(store.settle(settle(id, 0.0)).is_err());
    let saved = store.record(id).unwrap();
    assert_eq!(saved.quantity, None);
    assert_eq!(saved.revision, 0);
    assert_eq!(saved.settlement_status, "PENDING");
}

#[test]
fn intervals_and_record_checkpoint_are_atomic_and_recover_at_last_checkpoint() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store.start(start(None)).unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1500);
        store.checkpoint().unwrap();
        store.connection.execute_batch("CREATE TRIGGER reject_record BEFORE UPDATE ON work_records BEGIN SELECT RAISE(ABORT,'disk failure'); END;").unwrap();
        clock.advance(500);
        assert!(store.checkpoint().is_err());
        let duration: i64 = store
            .connection
            .query_row("SELECT duration_ms FROM work_segments", [], |r| r.get(0))
            .unwrap();
        assert_eq!(duration, 1500);
        store
            .connection
            .execute_batch("DROP TRIGGER reject_record;")
            .unwrap();
    }
    clock.advance(86_400_000);
    let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
    let recovered = store.active().unwrap().unwrap();
    assert_eq!(recovered.duration_ms, 1500);
    assert_eq!(recovered.pause_reason.as_deref(), Some("RECOVERY"));
    let state: String = store
        .connection
        .query_row("SELECT state FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(state, "RECOVERED");
    store.resume(id).unwrap();
    clock.advance(750);
    store.pause(id).unwrap();
    clock.advance(30_000);
    store.finish(id).unwrap();
    let saved = store.record(id).unwrap();
    assert_eq!(saved.duration_ms, 2250);
    assert!(saved.confirmed_end_time.unwrap() > saved.end_time.unwrap());
    let sum: i64 = store
        .connection
        .query_row(
            "SELECT SUM(duration_ms) FROM work_segments WHERE record_id=?1",
            [id],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(sum, saved.duration_ms);
}

#[test]
fn migration_preserves_legacy_fields_duration_id_sequence_and_manual_pause() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=1;
        INSERT INTO work_records(id,category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused) VALUES(7,'文档',1.25,'保留原文',1000,9000,1234,1,'FINISHED',1);
        INSERT INTO work_records(id,category,quantity,start_time,duration_ms,duration_seconds,status,is_paused) VALUES(9,'开发',2.5,10000,2400,2,'WORKING',1);
        UPDATE sqlite_sequence SET seq=100 WHERE name='work_records';").unwrap();
    let clock = TestClock::new();
    let mut store = Store::initialize(connection, Box::new(clock.clone()), None).unwrap();
    let old = store.record(7).unwrap();
    assert_eq!(
        (
            old.id,
            old.quantity,
            old.duration_ms,
            old.legacy_duration_ms
        ),
        (7, Some(1.25), 1234, 1234)
    );
    assert_eq!(old.remark, "保留原文");
    assert_eq!(old.end_time, Some(9000));
    assert_eq!(old.settlement_status, "COMPLETE");
    let paused = store.active().unwrap().unwrap();
    assert_eq!(paused.pause_reason.as_deref(), Some("MANUAL"));
    assert!(paused.is_paused && paused.recovery_pending);
    let count: i64 = store
        .connection
        .query_row("SELECT COUNT(*) FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(count, 0);
    store.resume(9).unwrap();
    clock.advance(600);
    store.finish(9).unwrap();
    assert_eq!(store.record(9).unwrap().duration_ms, 3000);
    store.start(start(None)).unwrap();
    assert_eq!(store.active().unwrap().unwrap().id, 101);
    assert_eq!(
        store
            .connection
            .query_row("PRAGMA integrity_check", [], |r| r.get::<_, String>(0))
            .unwrap(),
        "ok"
    );
}

#[test]
fn pending_work_counts_time_but_not_prefilled_quantity() {
    let (mut store, clock) = memory();
    store.start(start(Some(42.0))).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(1200);
    store.finish(id).unwrap();
    let query = || HistoryQuery {
        start_date: "1970-01-01".into(),
        end_date: "1970-01-02".into(),
        category: None,
        page: 1,
    };
    let before = store.query_history(query()).unwrap();
    assert_eq!(before.filtered.quantity, 0.0);
    assert_eq!(before.filtered.duration_ms, 1200);
    assert_eq!(before.filtered.pending_records, 1);
    store.settle(settle(id, 0.0)).unwrap();
    let after = store.query_history(query()).unwrap();
    assert_eq!(after.filtered.quantity, 0.0);
    assert_eq!(after.filtered.pending_records, 0);
    assert_eq!(after.filtered.duration_ms, 1200);
}

#[test]
fn failed_finish_does_not_close_interval_or_create_pending_record() {
    let (mut store, clock) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(1000);
    store.connection.execute_batch("CREATE TRIGGER reject_finish BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'finish failure'); END;").unwrap();
    assert!(store.finish(id).is_err());
    assert!(!store.active().unwrap().unwrap().is_paused);
    assert!(store.pending_records().unwrap().is_empty());
    let state: String = store
        .connection
        .query_row("SELECT state FROM work_segments", [], |r| r.get(0))
        .unwrap();
    assert_eq!(state, "OPEN");
    store
        .connection
        .execute_batch("DROP TRIGGER reject_finish")
        .unwrap();
    clock.advance(500);
    store.finish(id).unwrap();
    assert_eq!(store.record(id).unwrap().duration_ms, 1500);
}

#[test]
fn failed_migration_rolls_back_schema_records_and_sequence() {
    let directory = TestDirectory::new();
    {
        let connection = Connection::open(directory.db()).unwrap();
        connection
            .execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        connection.execute_batch("PRAGMA user_version=1;
            INSERT INTO work_records(id,category,quantity,start_time,end_time,status,is_paused) VALUES(7,'文档',2.5,1000,2000,'FINISHED',1);
            UPDATE sqlite_sequence SET seq=100 WHERE name='work_records';
            CREATE TABLE work_segments(marker TEXT);").unwrap();
    }
    assert!(Store::open(&directory.db(), Box::new(TestClock::new())).is_err());
    let connection = Connection::open(directory.db()).unwrap();
    assert_eq!(
        connection
            .query_row("PRAGMA user_version", [], |r| r.get::<_, i64>(0))
            .unwrap(),
        1
    );
    assert_eq!(
        connection
            .query_row("SELECT quantity FROM work_records WHERE id=7", [], |r| r
                .get::<_, f64>(0))
            .unwrap(),
        2.5
    );
    assert_eq!(
        connection
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name='work_records'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        100
    );
    assert_eq!(
        connection
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE name='work_records_v2'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        0
    );
}

#[test]
fn pending_list_includes_older_records_and_delete_cascades_dependent_data() {
    let (mut store, _) = memory();
    for _ in 0..35 {
        store.start(start(None)).unwrap();
        let id = store.active().unwrap().unwrap().id;
        store.finish(id).unwrap();
    }
    assert_eq!(store.snapshot().unwrap().recent_records.len(), 5);
    assert_eq!(store.snapshot().unwrap().pending_count, 35);
    let pending = store.pending_records().unwrap();
    assert_eq!(pending.len(), 35);
    let old = pending[0].id;
    store.settle(settle(old, 0.0)).unwrap();
    store.delete_record(old).unwrap();
    for table in ["work_segments", "record_revisions"] {
        let remaining: i64 = store
            .connection
            .query_row(
                &format!("SELECT COUNT(*) FROM {table} WHERE record_id=?1"),
                [old],
                |r| r.get(0),
            )
            .unwrap();
        assert_eq!(remaining, 0);
    }
    assert_eq!(store.pending_records().unwrap().len(), 34);
    assert_eq!(
        store
            .connection
            .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |r| r
                .get::<_, i64>(
                0
            ))
            .unwrap(),
        0
    );
}

#[test]
fn invalid_settlement_keeps_time_and_pending_status() {
    let (mut store, clock) = memory();
    store.start(start(None)).unwrap();
    let id = store.active().unwrap().unwrap().id;
    clock.advance(500);
    store.finish(id).unwrap();
    for quantity in [-1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        assert!(store.settle(settle(id, quantity)).is_err());
    }
    let mut invalid = settle(id, 1.0);
    invalid.remark = "字".repeat(2001);
    assert!(store.settle(invalid).is_err());
    let mut invalid = settle(id, 1.0);
    invalid.category = "未知".into();
    assert!(store.settle(invalid).is_err());
    let saved = store.record(id).unwrap();
    assert_eq!(saved.duration_ms, 500);
    assert_eq!(saved.quantity, None);
    assert_eq!(saved.settlement_status, "PENDING");
    assert_eq!(saved.revision, 0);
}
````````

## UPDATE E:\WorkMemo\src\App.css

````````css
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
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); --content-gap: 12px; }
.desktop-frame[data-density="comfortable"] { --content-gap: 20px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: grid; grid-template-columns: auto auto minmax(64px, 1fr) auto; align-items: center; gap: 12px; flex-shrink: 0; min-height: 56px; padding: 8px 14px; background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: block; width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
.brand-name { display: block; font-size: 13px; font-weight: 600; letter-spacing: -.25px; white-space: nowrap; }
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.main-nav { display: flex; align-items: center; gap: 3px; }
button.nav-button { position: relative; width: 31px; height: 34px; padding: 5px; justify-content: center; color: var(--text-muted); background: transparent; box-shadow: none; border-radius: 9px; }
button.nav-button:hover:not(:disabled) { background: var(--control-hover); }
button.nav-button[aria-pressed="true"] { color: var(--accent-text); }
button.nav-button[aria-pressed="true"]::after { content: ""; position: absolute; height: 2px; left: 8px; right: 8px; bottom: -3px; border-radius: 2px; background: var(--accent); }
.category-strip { display: flex; gap: 6px; min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 3px 0; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.category-strip::-webkit-scrollbar { height: 2px; }
.category-strip::-webkit-scrollbar-thumb { border-radius: 2px; background: var(--scroll-thumb); }
.category-strip:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; border-radius: 6px; }
.category-chip { display: inline-flex; align-items: center; flex: 0 0 auto; gap: 6px; padding: 5px 9px; border-radius: 9px; font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgb(var(--surface-rgb) / 30%); white-space: nowrap; }
.category-chip span { font-variant-numeric: tabular-nums; }
.category-chip[data-current="true"] { color: var(--accent-text); background: var(--control-hover); }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; }
.window-content { display: flex; flex-direction: column; min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { width: 100%; max-width: 648px; margin: 0 auto; padding: var(--content-gap) 24px 18px; outline: none; }
.workspace.is-active { margin-block: auto; }
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
button.window-control { width: 27px; height: 30px; padding: 5px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .62)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }
.task-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.task-copy { min-width: 0; }
.task-copy h1 { margin: 0; font-size: 20px; font-weight: 550; letter-spacing: -.4px; }
.task-summary { margin: 7px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.meta-dot { margin-inline: 7px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; flex-shrink: 0; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(24px, 4.6vw, 34px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -.8px; line-height: 1.3; white-space: nowrap; }
.timer-long { font-size: clamp(18px, 3.5vw, 26px); }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 160px; overflow-y: auto; }
.actions { display: flex; align-items: center; gap: 20px; margin-top: calc(var(--content-gap) + 6px); }
.actions button { width: auto; justify-content: center; }
button.round-action { width: 42px; height: 42px; padding: 11px; flex: 0 0 auto; border-radius: 50%; }
.round-action .icon-pause { stroke-width: 3; }
.round-action .icon-play { fill: currentColor; stroke-width: 1; }
button.quiet-action { padding: 7px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); font-size: 12px; box-shadow: none; }
button.quiet-action:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button.quiet-action:not(.finish-action) { margin-inline: auto; }
.form-card { width: min(100%, 560px); margin: var(--content-gap) auto 0; }
.form-card h2 { font-size: 12px; color: var(--text-muted); font-weight: 500; margin: 0 0 9px; }
.work-form { display: grid; gap: 10px; }
.work-form > button { min-height: 34px; padding: 8px 12px; }
.form-note > summary { display: flex; align-items: center; gap: 5px; width: fit-content; font-size: 11px; list-style: none; }
.form-note > summary::-webkit-details-marker { display: none; }
.form-note .icon { width: 15px; height: 15px; }
.form-note[open] > summary { margin-bottom: 3px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / 96%); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 44px; max-height: 150px; line-height: 1.6; }
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
.switch-panel, .recent-panel, .connection-panel { margin-top: var(--content-gap); padding-top: 4px; font-size: 11px; }
.switch-panel { max-width: 560px; margin-inline: auto; }
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
.appearance-feedback { margin: 0 0 10px; color: var(--accent-text); }
.preview-notice { padding: 6px 9px; margin-bottom: 10px; font-size: 10px; }
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
@media (max-width: 540px) {
  .brand-name { font-size: 12px; }
  .titlebar { gap: 8px; padding-inline: 10px; }
  .workspace { padding-inline: 14px; }
}
@media (max-width: 380px) {
  .titlebar { gap: 4px; padding-inline: 8px; }
  .titlebar-drag { gap: 6px; }
  .brand-name { font-size: 11px; }
  .brand-mark { width: 25px; height: 25px; }
  button.nav-button { width: 27px; }
  .main-nav { gap: 0; }
  .window-controls { gap: 0; }
  .titlebar .window-control { width: 24px; }
  .workspace { padding-inline: 10px; }
  .task-row { gap: 10px; }
  .timer-card { padding: var(--content-gap); }
  .task-copy h1 { font-size: 17px; }
  .actions { gap: 14px; }
}
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
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / 98%); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.ui-dialog::backdrop { background: rgb(0 0 0 / 18%); }
.density-settings { margin: 20px 0 0; padding: 0; border: 0; }
.density-settings legend { margin-bottom: 10px; font-size: 12px; }
.density-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.density-options button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--control-hover); }
.utilities-panel { margin-top: 20px; font-size: 11px; }
.utilities-panel > button { margin-top: 12px; }
.note-heading { margin-top: 20px; font-size: 13px; }
.settlement-entry { margin-top: 12px; }
.settlement-panel { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); }
.settlement-panel h2 { margin: 0; font-size: 16px; }
.settlement-panel .settings-heading .secondary { width: auto; flex-shrink: 0; font-size: 12px; line-height: 1.5; }
.settlement-record { padding: 12px 0; border-top: 1px solid var(--line); }
.settlement-record summary { cursor: pointer; }
.settlement-form { display: grid; gap: 12px; margin-top: 12px; }
````````

## UPDATE E:\WorkMemo\src\App.tsx

````````tsx
import { useRef, useState } from "react";
import { ConnectionPanel } from "./ConnectionPanel";
import { DesktopWindow } from "./DesktopWindow";
import { AppearanceSettings } from "./AppearanceSettings";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { CATEGORIES, formatDuration, formatTime } from "./types";
import { workView } from "./workView";
import { HistoryPanel } from "./HistoryPanel";
import { useHistory } from "./useHistory";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import { SettlementPanel } from "./SettlementPanel";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const workspace = useRef<HTMLElement>(null);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const unavailable = !view.canOperate || session.busy;
  const refreshKey = `${session.dataVersion}:${session.snapshot?.pending_count ?? 0}:` + (session.snapshot?.recent_records.map((item) => `${item.id}:${item.end_time}:${item.revision}`).join(",") ?? "");
  // Reuse the existing read-only history query and its complete category aggregates.
  const categories = useHistory(session.native, refreshKey, session.recordDeleted);
  const selected = appearance.open ? "appearance" : historyOpen ? "history" : layoutOpen ? "layout" : "home";
  const pauseLabel = session.pending === "resume_task" ? "正在继续…" : session.pending === "pause_task" ? "正在暂停…"
    : active?.is_paused ? "继续工作" : "暂停";

  return (
    <DesktopWindow appearanceStyle={themeStyle(appearance.current)} density={density}
      navigation={<nav className="main-nav" aria-label="主导航">
        <button type="button" className="nav-button" aria-label="首页" title="首页" aria-pressed={selected === "home"}
          onClick={() => { workspace.current?.focus(); workspace.current?.scrollIntoView({ block: "start" }); }}><Icon name="home" /></button>
        <button type="button" className="nav-button" aria-label="历史记录" title="历史记录" aria-pressed={selected === "history"}
          onClick={() => setHistoryOpen(true)}><Icon name="history" /></button>
        <button type="button" className="nav-button" aria-label="皮肤设置" title="皮肤设置" aria-pressed={selected === "appearance"}
          disabled={appearance.loading} onClick={appearance.begin}><Icon name="palette" /></button>
        <button type="button" className="nav-button" aria-label="布局设置" title="布局设置" aria-pressed={selected === "layout"}
          onClick={() => setLayoutOpen(true)}><Icon name="layout" /></button>
      </nav>}
      categories={<div className="category-strip" tabIndex={0} role="region" aria-label="最近30天已结束记录，横向滚动"
        onWheel={(event) => { if (event.deltaX === 0) event.currentTarget.scrollLeft += event.deltaY; }}
        aria-busy={categories.loading} title={categories.error ? "分类数量暂时无法读取" : "最近30天的已结束记录数，可横向滚动"}>
        {CATEGORIES.map((category) => <span className="category-chip" key={category} data-current={active?.category === category}>
          {category}<span>{categories.result
            ? `${categories.result.categories.find((row) => row.category === category)?.totals.records ?? 0}条` : "—"}</span>
        </span>)}
      </div>}>
    <main ref={workspace} tabIndex={-1} className={`workspace${active ? " is-active" : ""}`}>
      {appearance.notice && <p className="hint appearance-feedback" role="status">{appearance.notice}</p>}
      {appearance.loadError && <div className="notice" role="alert">
        <p>外观设置读取失败，暂时使用默认外观。工作记录不受影响。</p>
        <p className="appearance-error-detail">{appearance.loadError}</p>
        <button type="button" className="text-button" disabled={appearance.loading || appearance.open}
          onClick={() => { void appearance.reload(); }}>重新读取外观</button>
      </div>}
      {!session.native && <p className="notice preview-notice" role="status">浏览器预览 · 本地计时和保存请使用桌面应用</p>}
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
        <div className="task-row">
          <div className="task-copy">
            <h1>{record ? record.category : view.label}</h1>
            <p className="task-summary">
              {record ? <>数量 {formatQuantity(record.quantity)}<span className="meta-dot" aria-hidden="true">·</span>
                <span className={`state-label ${view.mode === "working" ? "working" : ""}`} role="status">{view.label}</span></>
                : view.caption}
            </p>
            {record && view.mode === "unavailable" && <p className="hint">{view.caption}</p>}
          </div>
          <output className={`timer${view.timer.length > 9 ? " timer-long" : ""}`} aria-label="有效工作时长" title={view.caption} aria-live="off">{view.timer}</output>
        </div>
        {record && <div className="actions">
          {active && <button type="button" className="round-action" disabled={unavailable} aria-label={pauseLabel} title={pauseLabel}
            onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}>
            <Icon name={active.is_paused ? "play" : "pause"} /><span className="sr-only">{pauseLabel}</span>
          </button>}
          <button type="button" className="quiet-action" onClick={() => setNoteOpen(true)} aria-label="查看任务备注">
            <Icon name="note" /><span>备注</span>
          </button>
          {active && <button type="button" className="quiet-action finish-action" disabled={unavailable} aria-label="结束并保存"
            onClick={() => { void session.finish(active.id).then(saved => { if (saved) setSettlementOpen(true); }); }}><Icon name="check" /><span>{session.pending === "finish_task" ? "正在保存…" : "结束计时"}</span></button>}
        </div>}
      </section>

      {!active && (session.snapshot || !session.native) && <section className="form-card" aria-label="开始新的工作">
        <h2 className="sr-only">{view.finished ? "开始下一项" : "开始一项工作"}</h2>
        <WorkForm disabled={unavailable} starting={session.pending === "start_task"} onStart={session.start} />
      </section>}
      {active?.is_paused && <details className="switch-panel">
        <summary>开始另一项工作</summary>
        <WorkForm disabled={unavailable} switching starting={session.pending === "start_task"} onStart={session.start} />
      </details>}

      {session.native && session.snapshot && <div className="settlement-entry">
        <button type="button" className="secondary" onClick={() => setSettlementOpen(open => !open)}>
          待补全工作量（{session.snapshot.pending_count}）</button>
      </div>}
      <SettlementPanel open={settlementOpen} onClose={() => setSettlementOpen(false)} refreshKey={refreshKey}
        busy={unavailable} onSave={session.settle} />

      <AppearanceSettings appearance={appearance} />
      <UiDialog open={layoutOpen} onClose={() => setLayoutOpen(false)} id="layout-title" title="布局设置">
        <fieldset className="density-settings">
          <legend>显示间距</legend>
          <div className="density-options">
            <button type="button" className="secondary" aria-pressed={density === "compact"} onClick={() => setDensity("compact")}>紧凑</button>
            <button type="button" className="secondary" aria-pressed={density === "comfortable"} onClick={() => setDensity("comfortable")}>舒展</button>
          </div>
          <p className="hint">调整当前窗口的显示间距。</p>
        </fieldset>
        <details className="utilities-panel">
          <summary>连接与刷新</summary>
          <button className="secondary" type="button" disabled={!session.native || session.busy}
            onClick={() => { void session.refresh(); void categories.reload(); }}><Icon name="refresh" />刷新记录</button>
          <ConnectionPanel />
        </details>
      </UiDialog>
      <UiDialog open={noteOpen && !!record} onClose={() => setNoteOpen(false)} id="note-title" title="任务详情与备注">
        {record && <>
          <p className="note-heading">{record.category} · 数量 {formatQuantity(record.quantity)}</p>
          <p className="hint">开始 {formatTime(record.start_time)}
            {record.end_time !== null && <><br />保存 {formatTime(record.end_time)}</>}</p>
          <p className="task-remark">{record.remark || "这项工作未填写备注。"}</p>
        </>}
      </UiDialog>
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} onDeleted={session.recordDeleted} refreshKey={refreshKey}>
        <details className="recent-panel">
          <summary>最近保存的记录</summary>
          {session.snapshot?.recent_records.length ? <ul className="record-list">
            {session.snapshot.recent_records.map((record) => <li key={record.id}>
              <div className="record-heading"><strong>{record.category} · {formatQuantity(record.quantity)} · {record.settlement_status === "PENDING" ? "待补全" : "已结算"}</strong>
                <span>{formatDuration(record.duration_seconds)}</span></div>
              <p className="hint">{formatTime(record.start_time)}<br />至 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
              {record.remark && <p className="record-remark">{record.remark}</p>}
            </li>)}
          </ul> : <p className="hint">{session.snapshot ? "还没有已结束的记录。结束计时后会保存在这台电脑上。" : "连接本地数据后可查看真实记录。"}</p>}
          <p className="hint">此处显示最近 5 条计时已结束的记录。</p>
        </details>
      </HistoryPanel>
    </main>
    </DesktopWindow>
  );
}

export default App;
````````

## UPDATE E:\WorkMemo\src\HistoryPanel.tsx

````````tsx
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CATEGORIES, formatDuration, formatTime } from "./types";
import { formatQuantity, historyQueryError, localDate, type Totals } from "./history";
import { useHistory } from "./useHistory";

interface Props {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  onDeleted: (id: number) => Promise<void>;
  children?: ReactNode;
}

function StatsTable({ label, rows }: { label: string; rows: { name: string; totals: Totals }[] }) {
  return <section className="stats-section">
    <h3>{label}</h3>
    <div className="stats-scroll"><table>
      <caption className="sr-only">{label}的记录数、待补全数、已结算数量和有效工作时长</caption>
      <thead><tr><th scope="col">{label === "每日汇总" ? "工作日期" : "工作类别"}</th>
        <th scope="col">记录</th><th scope="col">待补全</th><th scope="col">数量</th><th scope="col">有效时长</th></tr></thead>
      <tbody>{rows.map(({ name, totals }) => <tr key={name}><th scope="row">{name}</th>
        <td>{totals.records}</td><td>{totals.pending_records}</td><td>{formatQuantity(totals.quantity)}</td>
        <td>{formatDuration(totals.duration_ms / 1000)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}

export function HistoryPanel({ open, onClose, refreshKey, onDeleted, children }: Props) {
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
    {children}
    <p className="hint">按本机时间的任务开始日期查询。工时包含待补全记录，数量仅汇总已结算记录。跨午夜归入开始日。</p>
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
      <p className="history-overview">全部已结束：{result.overview.records} 条 · 待补全 {result.overview.pending_records} 条 · 已结算数量 {formatQuantity(result.overview.quantity)}
        <br />累计有效时长 {formatDuration(result.overview.duration_ms / 1000)}</p>
      <p className="hint">当前范围：{query.start_date} 至 {query.end_date} · {query.category ?? "全部类别"}</p>
      <dl className="summary-grid">
        <div><dt>结束记录</dt><dd>{result.filtered.records}<small> 条（待补全 {result.filtered.pending_records}）</small></dd></div>
        <div><dt>工作数量</dt><dd>{formatQuantity(result.filtered.quantity)}</dd></div>
        <div><dt>有效时长</dt><dd>{formatDuration(result.filtered.duration_ms / 1000)}</dd></div>
      </dl>
      {result.filtered.records === 0 ? <p className="history-empty">这个范围还没有已结束记录。可以调整日期或类别；结束计时后记录会出现在这里。</p>
        : tab === "records" ? <>
          <ol className="history-records">
            {result.records.map((record) => <li key={record.id}>
              <div className="record-heading"><strong>{record.category} · {formatQuantity(record.quantity)} · {record.settlement_status === "PENDING" ? "待补全" : "已结算"}</strong>
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
````````

## NEW FILE E:\WorkMemo\src\SettlementPanel.tsx

````````tsx
import { useEffect, useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CATEGORIES, formatDuration, formatTime, type SettleInput, type WorkRecord } from "./types";
import { validateWorkInput } from "./workInput";

function SettlementForm({ record, busy, onSave }: {
  record: WorkRecord; busy: boolean; onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const [category, setCategory] = useState(record.category);
  const [quantity, setQuantity] = useState(record.quantity === null ? "" : String(record.quantity));
  const [remark, setRemark] = useState(record.remark);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const result = validateWorkInput(category, quantity, remark, true);
    if (!result.ok) { setError(Object.values(result.errors).join(" ")); return; }
    if (result.input.quantity === null) return;
    setError("");
    const saved = await onSave({ ...result.input, quantity: result.input.quantity, id: record.id, expected_revision: record.revision });
    if (!saved) setError("保存未完成，请查看上方错误信息后重试。输入内容仍保留。");
  }
  return <form className="settlement-form" onSubmit={(event) => { void submit(event); }} noValidate>
    <p className="hint">开始 {formatTime(record.start_time)}<br />
      有效结束 {record.end_time === null ? "—" : formatTime(record.end_time)}<br />
      系统确认 {record.confirmed_end_time === null ? "—" : formatTime(record.confirmed_end_time)}<br />
      有效工时 {formatDuration(record.duration_seconds)}</p>
    <div className="field-row">
      <label>工作类别<select value={category} disabled={busy} onChange={(event) => setCategory(event.target.value)}>
        {CATEGORIES.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <label>工作量（必填）<input type="number" min="0" max="1000000000" step="any" inputMode="decimal"
        value={quantity} disabled={busy} placeholder="0 表示无产出" onChange={(event) => setQuantity(event.target.value)} /></label>
    </div>
    <label>备注（选填）<textarea rows={2} value={remark} disabled={busy} maxLength={4000}
      onChange={(event) => setRemark(event.target.value)} /></label>
    {error && <p className="inline-error" role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? "正在保存…" : "填写工作量并保存"}</button>
  </form>;
}

export function SettlementPanel({ open, onClose, refreshKey, busy, onSave }: {
  open: boolean; onClose: () => void; refreshKey: string; busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const [records, setRecords] = useState<WorkRecord[] | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!open) return;
    let stale = false;
    setError("");
    void invoke<WorkRecord[]>("get_pending_records").then(data => { if (!stale) setRecords(data); })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, refreshKey, reload]);
  if (!open) return null;
  return <section className="settlement-panel" aria-labelledby="settlement-title">
    <div className="settings-heading"><h2 id="settlement-title">待补全工作量</h2>
      <button type="button" className="secondary" onClick={onClose}>稍后填写</button></div>
    <p className="hint">计时结果已保存。可以关闭这里并继续下一项工作。</p>
    {error && <div className="error-banner" role="alert">{error}
      <button type="button" className="text-button" disabled={busy} onClick={() => setReload(value => value + 1)}>重新读取</button></div>}
    {records === null && !error && <p role="status">正在读取待补全记录…</p>}
    {records?.length === 0 && <p role="status">没有待补全记录。</p>}
    {records?.map(record => <details key={`${record.id}:${record.revision}`} className="settlement-record" open={records.length === 1}>
      <summary>{record.category} · {formatTime(record.start_time)} · {formatDuration(record.duration_seconds)}</summary>
      <SettlementForm record={record} busy={busy || error !== ""} onSave={async input => {
        const saved = await onSave(input);
        if (saved) setRecords(current => current?.filter(item => item.id !== input.id) ?? null);
        return saved;
      }} />
    </details>)}
  </section>;
}
````````

## UPDATE E:\WorkMemo\src\WorkForm.tsx

````````tsx
import { useId, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";
import { validateWorkInput, type InputErrors } from "./workInput";
import { Icon } from "./Icon";

interface Props {
  disabled: boolean;
  switching?: boolean;
  starting?: boolean;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({ disabled, switching = false, starting = false, onStart }: Props) {
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<InputErrors>({});
  const id = useId();
  const categoryRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const remarkRef = useRef<HTMLTextAreaElement>(null);
  const remarkDetails = useRef<HTMLDetailsElement>(null);

  function clearError(field: keyof StartInput) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const result = validateWorkInput(category, quantity, remark);
    if (!result.ok) {
      setErrors(result.errors);
      if (result.errors.remark && remarkDetails.current) remarkDetails.current.open = true;
      (result.errors.category ? categoryRef : result.errors.quantity ? quantityRef : remarkRef).current?.focus();
      return;
    }
    setErrors({});
    await onStart(result.input);
  }

  return (
    <form className="work-form" aria-busy={starting} onSubmit={(event) => { void submit(event); }} noValidate>
      <div className="field-row">
        <label>工作类别
          <select ref={categoryRef} value={category} disabled={disabled}
            aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? `${id}-category` : undefined}
            onChange={(event) => { setCategory(event.target.value); clearError("category"); }}>
            <option value="">请选择类别</option>
            {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          {errors.category && <span id={`${id}-category`} className="field-error" role="alert">{errors.category}</span>}
        </label>
        <label>工作量（可稍后填写）
          <input ref={quantityRef} type="number" inputMode="decimal" min="0" max="1000000000" step="any"
            placeholder="结束后填写；0 表示无产出" value={quantity} disabled={disabled}
            aria-invalid={Boolean(errors.quantity)} aria-describedby={errors.quantity ? `${id}-quantity` : undefined}
            onChange={(event) => { setQuantity(event.target.value); clearError("quantity"); }} />
          {errors.quantity && <span id={`${id}-quantity`} className="field-error" role="alert">{errors.quantity}</span>}
        </label>
      </div>
      <details className="form-note" ref={remarkDetails}>
      <summary><Icon name="note" />备注 <span className="optional">选填</span></summary>
      <label><span className="sr-only">工作备注</span>
        <textarea ref={remarkRef} rows={1} maxLength={4000} placeholder="记下这次工作的内容…" value={remark}
          disabled={disabled} aria-invalid={Boolean(errors.remark)}
          aria-describedby={`${id}-remark-count${errors.remark ? ` ${id}-remark` : ""}`}
          onChange={(event) => { setRemark(event.target.value); clearError("remark"); }} />
        <span id={`${id}-remark-count`} className="field-count">{Array.from(remark.trim()).length} / 2000</span>
        {errors.remark && <span id={`${id}-remark`} className="field-error" role="alert">{errors.remark}</span>}
      </label>
      </details>
      <p className="hint">先记录时间，结束后在待补全列表确认工作量。</p>
      {switching && <p className="hint">开始后将结束并保存当前已暂停的任务，工作量稍后结算。</p>}
      <button type="submit" disabled={disabled}>{starting ? (switching ? "正在保存并开始…" : "正在开始…") : switching ? "保存上一项，开始新工作" : "开始工作"}<span aria-hidden="true">↗</span></button>
    </form>
  );
}
````````

## UPDATE E:\WorkMemo\src\history.ts

````````typescript
import { CATEGORIES, type WorkRecord } from "./types.ts";

export interface HistoryQuery {
  start_date: string;
  end_date: string;
  category: string | null;
  page: number;
}
export interface Totals { records: number; quantity: number; duration_ms: number; pending_records: number }
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

export function formatQuantity(quantity: number | null): string {
  if (quantity === null) return "待填写";
  return quantity.toLocaleString("zh-CN", { maximumSignificantDigits: 12 });
}
````````

## UPDATE E:\WorkMemo\src\types.ts

````````typescript
export const CATEGORIES = ["评测", "质检", "开发", "文档"] as const;

export interface WorkRecord {
  id: number;
  category: string;
  quantity: number | null;
  remark: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  duration_ms: number;
  status: "NOT_STARTED" | "WORKING" | "FINISHED";
  is_paused: boolean;
  recovery_pending: boolean;
  settlement_status: "IN_PROGRESS" | "PENDING" | "COMPLETE";
  source: "AUTO" | "MANUAL_START" | "MANUAL_ENTRY";
  pause_reason: "MANUAL" | "APP_CLOSE" | "RECOVERY" | "AWAY" | "MONITOR" | null;
  confirmed_end_time: number | null;
  last_input_time: number | null;
  end_reason: string | null;
  legacy_duration_ms: number;
  revision: number;
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
  pending_count: number;
}

export interface StartInput {
  category: string;
  quantity: number | null;
  remark: string;
}

export interface SettleInput {
  id: number;
  expected_revision: number;
  category: string;
  quantity: number;
  remark: string;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatTime(milliseconds: number): string {
  return new Date(milliseconds).toLocaleString("zh-CN", { hour12: false });
}
````````

## UPDATE E:\WorkMemo\src\useWorkSession.ts

````````typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Snapshot, StartInput, SettleInput } from "./types";
import { confirmedFinish, reconcileDeleted } from "./workView";

type WorkCommand = "start_task" | "pause_task" | "resume_task" | "finish_task" | "settle_record";

export function useWorkSession() {
  const native = isTauri();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(native);
  const [pending, setPending] = useState<WorkCommand | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
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
        if (command === "start_task" || command === "finish_task" || command === "settle_record") setDataVersion(value => value + 1);
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
    setDataVersion(value => value + 1);
    setSavedId((current) => current === id ? null : current);
    setSnapshot((current) => current ? reconcileDeleted(current, deletedIds.current) : current);
    await refresh();
  }, [refresh]);

  return {
    native, snapshot, loading, busy: pending !== null, pending, savedId, dataVersion,
    connectionError, commandError, refresh, recordDeleted,
    start: (input: StartInput) => run("start_task", { input }),
    pause: (id: number) => run("pause_task", { id }),
    resume: (id: number) => run("resume_task", { id }),
    finish: (id: number) => run("finish_task", { id }),
    settle: (input: SettleInput) => run("settle_record", { input }),
  };
}
````````

## UPDATE E:\WorkMemo\src\workInput.ts

````````typescript
import { CATEGORIES, type StartInput } from "./types.ts";

export type InputErrors = Partial<Record<keyof StartInput, string>>;
type Validation = { ok: true; input: StartInput } | { ok: false; errors: InputErrors };

export function validateWorkInput(category: string, quantity: string, remark: string, requireQuantity = false): Validation {
  const errors: InputErrors = {};
  if (!CATEGORIES.some((value) => value === category)) errors.category = "请选择工作类别。";
  const text = quantity.trim();
  const amount = text === "" ? null : Number(text);
  if (amount === null ? requireQuantity : (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)
    || !Number.isFinite(amount) || amount < 0 || amount > 1_000_000_000
    || (amount === 0 && /[1-9]/.test(text.split(/e/i)[0])))) {
    errors.quantity = "请填写 0 到 10 亿之间的有效工作量，0 表示无产出。";
  }
  if (Array.from(remark.trim()).length > 2000) errors.remark = "备注不能超过 2000 个字符。";
  return Object.keys(errors).length ? { ok: false, errors }
    : { ok: true, input: { category, quantity: amount, remark: remark.trim() } };
}
````````

## UPDATE E:\WorkMemo\src\workView.ts

````````typescript
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
    paused: "已暂停", working: "进行中", finished: finished?.settlement_status === "PENDING" ? "计时已保存，待补全" : "已完成并保存", ready: "准备开始" };
  const captions = { preview: "请在桌面应用中开始工作", loading: "正在读取本地工作记录",
    unavailable: record ? "上次读取的时长，暂未更新" : "连接本地数据后显示时长",
    paused: "暂停期间不计时", working: "有效工作时长",
    finished: "本次有效工作时长", ready: "选择类别即可开始，工作量稍后填写" };
  return {
    mode, record, finished, label: labels[mode], caption: captions[mode],
    timer: record ? formatDuration(record.duration_seconds) : mode === "ready" ? "00:00:00" : "--:--:--",
    canOperate: mode === "ready" || mode === "working" || mode === "paused" || mode === "finished",
  };
}
````````

## UPDATE E:\WorkMemo\tests\history.test.mjs

````````javascript
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
  assert.equal(formatQuantity(null), '待填写');
  assert.equal(formatQuantity(0), '0');
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
````````

## UPDATE E:\WorkMemo\tests\workflow.test.mjs

````````javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkInput } from '../src/workInput.ts';
import { confirmedFinish, workView } from '../src/workView.ts';

// Only test fixtures: never loaded into the app or written to a user's database.
const record = { id: 7, category: '开发', quantity: 1.5, remark: '测试夹具',
  start_time: 1000, end_time: null, duration_seconds: 65, duration_ms: 65000,
  status: 'WORKING', is_paused: false, recovery_pending: false };
const snapshot = { active: record, recent_records: [], warning: null };
const saved = { ...record, status: 'FINISHED', end_time: 100000 };
const finished = { active: null, recent_records: [saved], warning: null };
const view = (overrides = {}) => workView({ native: true, loading: false,
  snapshot, connectionError: '', savedId: null, ...overrides });

test('数量接受明确的0、正小数、科学计数及上界，保留类别并去除备注首尾空白', () => {
  for (const [text, quantity] of [['0', 0], ['0.0', 0], ['1.25', 1.25], ['.5', .5], ['1e3', 1000], ['1000000000', 1e9]]) {
    assert.deepEqual(validateWorkInput('开发', text, '  内容  '), {
      ok: true, input: { category: '开发', quantity, remark: '内容' },
    });
  }
});

test('非有限数、负数、下溢、越界、十六进制及逗号不会启动任务', () => {
  for (const quantity of ['NaN', 'Infinity', '-1', '1000000001',
    '1e309', '1e-999', '0x10', '1,000', '1 2', 'abc']) {
    const result = validateWorkInput('开发', quantity, '');
    assert.equal(result.ok, false, quantity);
    assert.ok(result.errors.quantity, quantity);
  }
});

test('开始允许数量未填，结算必须显式填写；0与未填不同', () => {
  for (const text of ['', ' ']) {
    assert.deepEqual(validateWorkInput('开发', text, ''), { ok: true, input: { category: '开发', quantity: null, remark: '' } });
    assert.equal(validateWorkInput('开发', text, '', true).ok, false);
  }
  assert.equal(validateWorkInput('文档', '0', '', true).input.quantity, 0);
});

test('同时返回各字段错误，拒绝未知类别，按 Unicode 字符计算备注边界', () => {
  const invalid = validateWorkInput('', '-1', '😀'.repeat(2001));
  assert.equal(invalid.ok, false);
  assert.deepEqual(Object.keys(invalid.errors), ['category', 'quantity', 'remark']);
  assert.equal(validateWorkInput('任意类别', '1', '').ok, false);
  assert.equal(validateWorkInput('文档', '1', ' 😀'.trim().repeat(2000)).ok, true);
});

test('首次读取和读取失败不伪装为空任务，不提供业务操作', () => {
  for (const overrides of [{ loading: true }, { connectionError: '读取失败' }, {}]) {
    const state = view({ snapshot: null, ...overrides });
    assert.notEqual(state.mode, 'ready');
    assert.equal(state.timer, '--:--:--');
    assert.equal(state.canOperate, false);
  }
  assert.equal(view({ snapshot: { active: null, recent_records: [], warning: null } }).mode, 'ready');
});

test('断线保留上次真实任务与时长，禁用操作；恢复后重新显示进行中', () => {
  const disconnected = view({ connectionError: '断线' });
  assert.equal(disconnected.mode, 'unavailable');
  assert.equal(disconnected.record.id, record.id);
  assert.equal(disconnected.timer, '00:01:05');
  assert.equal(disconnected.canOperate, false);
  assert.equal(view().mode, 'working');
  assert.equal(view().canOperate, true);
});

test('暂停、恢复使用同一条任务及后端累计时间', () => {
  const paused = view({ snapshot: { ...snapshot, active: { ...record, is_paused: true } } });
  assert.equal(paused.mode, 'paused');
  assert.equal(paused.timer, view().timer);
  assert.equal(paused.record.id, view().record.id);
});

test('只接受本次结束操作确认的已完成记录，有结束时间且没有活动任务', () => {
  assert.equal(confirmedFinish(finished, 7), saved);
  assert.equal(confirmedFinish(finished, null), null);
  assert.equal(confirmedFinish(finished, 8), null);
  assert.equal(confirmedFinish(snapshot, 7), null);
  assert.equal(confirmedFinish({ ...finished, active: record }, 7), null);
  assert.equal(confirmedFinish({ ...finished, recent_records: [{ ...saved, end_time: null }] }, 7), null);
  assert.equal(confirmedFinish({ ...finished, recent_records: [record] }, 7), null);
});

test('保存确认保留本次时长；失败、旧记录、开始新任务均不显示完成', () => {
  assert.equal(view({ snapshot: finished, savedId: 7 }).mode, 'finished');
  assert.equal(view({ snapshot: finished, savedId: 7 }).timer, '00:01:05');
  assert.equal(view({ snapshot: finished }).mode, 'ready');
  assert.equal(view({ savedId: 7 }).mode, 'working');
  assert.equal(view({ snapshot: finished, savedId: 7, connectionError: '断线' }).mode, 'unavailable');
});

test('计时结束待补全不显示已结算，且不阻止开始下一项', () => {
  const pending = { ...saved, quantity: null, settlement_status: 'PENDING' };
  const state = view({ snapshot: { ...finished, recent_records: [pending], pending_count: 1 }, savedId: 7 });
  assert.equal(state.mode, 'finished');
  assert.equal(state.label, '计时已保存，待补全');
  assert.equal(state.canOperate, true);
  assert.equal(state.record.quantity, null);
});

test('浏览器预览不能通过已有快照启用业务操作', () => {
  assert.equal(view({ native: false }).mode, 'preview');
  assert.equal(view({ native: false }).canOperate, false);
});
````````
