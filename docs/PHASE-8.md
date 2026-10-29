# WorkMemo 第八阶段：最终检查与 Windows 交付

## 2026-10-29 网页组件与底部浮窗优化（源码交付）

按用户确认方案接入完整 Ant Design 6.6.8，统一网页标准控件、共享主题及底部 Drawer，修复同查询刷新清空背景和滚动样式覆盖弹层锁的问题。保留统计、校验、真实／演示隔离及原接口；增加写后读取失败的明确反馈和嵌套确认保护。49 项 Node、TypeScript／生产构建、生产资源 CSP 隔离网页回归及桌面／名称／多 URL 浏览器回归通过；包括逐帧保存检查、官方进出动画、六档宽度、短屏和 CSS 缩放。原生透明／DPI／真实扩展未重做，不发布新安装包、不操作真实任务。完整结果、体积变化、路径、命令与代码见 [WEB-UI-UPDATE.md](WEB-UI-UPDATE.md) 及 [WEB-UI-SOURCE.md](WEB-UI-SOURCE.md)。保留旧阶段与原有未跟踪规划，等待用户确认本阶段效果。

## 2026-10-29 v0.2.3 第 3 阶段：正式成品与发行

用户明确要求「发版吧」，进入成品及公开发布阶段。已统一 0.2.3 版本并更新中文文档；49 项 Node、144 项 Rust、格式检查、生产构建及四组隔离浏览器回归通过，中文 NSIS 与完整 ZIP 构建完成，安装器与 ZIP 的主程序／浏览器资源逐字节一致。已公开为 Latest，四项资产均匿名下载并复核 SHA256；构建提交及标签为 83a2e2cfbbd3cb254de397d148c995082c1b4210。实际摘要和原生验收限制见 [RELEASE-0.2.3.md](RELEASE-0.2.3.md)。前两阶段等待确认是历史状态，本次「发版吧」已授权进入第 3 阶段；不结束或删除真实任务。

## 2026-10-29 v0.2.3 第 2 阶段

按用户确认继续，完成自然日／周／月分类工作量报表、报表优先排版、单工时趋势及可展开辅助图表，并增加柔和／清脆两套原生提示音及五项独立试听。49 项 Node、144 项 Rust 测试、生产构建与四组隔离浏览器回归通过，Windows 十条音频播放 API 与独立程序的真实报表接口检查通过；原生设置窗口输入及截图仍有工具限制，不将其称为验收通过。完整路径、完整代码、素材许可、检查及边界见 [UPDATE-0.2.3-PHASE-2.md](UPDATE-0.2.3-PHASE-2.md)。保留真实数据与旧阶段，等待用户确认页面和音效后进入第 3 阶段成品打包。

## 2026-10-29 趋势图右上角排版修正

按用户截图反馈，将趋势图图例与坐标轴单位分为独立两行，修正「小时」紧贴「有效工时」造成的换行错觉。TypeScript/Vite 构建、七种宽度的原有总览回归通过，另核对五种宽度的有数据与空图文字边界并打开截图检查。完整路径、代码、命令与交付边界见 [FIX-0.2.3-TREND-HEADER.md](FIX-0.2.3-TREND-HEADER.md)。修正保存在源码，未替换用户运行程序及公开下载。

## 2026-10-29 v0.2.3 第 1 阶段

按用户确认方案完成空闲自动暂停、四类工作名称配置及 SQLite schema 9 兼容迁移。47 项 Node、137 项 Rust 测试、生产构建及隔离浏览器回归通过；独立 Windows 程序构建、启动与本机鉴权接口检查通过，原生窗口捕获超时导致 GUI 计时验收受限。完整说明、文件清单、源码及限制见 [UPDATE-0.2.3-PHASE-1.md](UPDATE-0.2.3-PHASE-1.md)。保留真实任务、旧阶段及未跟踪规划文件，不修改已发布 v0.2.2 下载。本阶段结束后等待确认，再进入报表与音效阶段。

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


## 2026-10-28 v0.2.2 本地成品迭代

按用户明确确认的九项需求，完成紧凑灵动岛、布局居中、网址匹配三模式、提示音、四皮肤按钮悬浮、紧凑总览、详情编辑修复及两项图表修正。检查、成品摘要及原生工具验收限制见 UPDATE-0.2.2.md。保留用户真实任务与既有阶段记录；仅本地交付及源码同步，不自动公开 Release 或添加新功能。


## 2026-10-28 v0.2.2 总览紧凑布局修订

按用户新截图反馈，收窄筛选与工作节奏卡片、让应用筛选按钮紧邻状态选项、将图例移至日历下方，并移除趋势的灰色缩放条及其空白。保留用户正在运行的 Downloads 目录程序；仅重建项目目录成品。实现、验证与新摘要见 UPDATE-0.2.2-COMPACT.md，完整变更代码见 UPDATE-0.2.2-COMPACT-SOURCE.md。


## 2026-10-28 同一工作多个 URL

按用户需求把监测设置改为现有四类工作分组，每组可添加多个 URL、独立配置匹配模式、移除或调整归属。复用已有平面规则数组及 SQLite schema 8，旧配置无需重填。定向计时测试确认匹配站点来回切换保留同一记录和连续时长。检查与当前成品摘要见 UPDATE-0.2.2-MULTI-URL.md，完整变更代码见 UPDATE-0.2.2-MULTI-URL-SOURCE.md。保留正在运行的用户实例，不操作其真实任务。


## 2026-10-28 工作总览整体网格排版

按用户反馈，重新编排整个总览：统一筛选工具栏与四统计卡，宽屏趋势占左侧、类别及节奏上下占右侧，明细紧接图表；平板改为趋势整行及右侧两卡并排，手机单列。修正图表尺寸监听同步重绘警告，保留取消灰色缩放条及多 URL 功能。七种宽度与详情编辑浏览器回归、46 项 Node 测试通过；当前交付与兼容性见 UPDATE-0.2.2-LAYOUT.md，完整代码见 UPDATE-0.2.2-LAYOUT-SOURCE.md。


## 2026-10-28 v0.2.2 版本结束与正式发布

用户明确授权完成其余上传并结束该版本。已公开发布 WorkMemo v0.2.2，设为正式 Latest，tag 指向应用最终构建源码 20758c6830d002939303aeab00f9c8a679a0ff0e。安装版、完整 ZIP、第三方许可、SHA256SUMS 共四项上传摘要核对通过，并逐项无认证公开下载复算通过；旧版本资产不变。公开发布前仅把 ZIP 的使用说明改为公开下载地址，原程序、安装器及其余解压条目保持不变。

README 与使用说明更新为公开入口，完整回执、校验值与未完成的原生验收范围见 RELEASE-0.2.2.md。保留原有未跟踪规划文件，不上传 QA 数据、截图、凭据或用户数据库。本版本开发和发布收尾结束，不自动启动下一版本或添加功能。
