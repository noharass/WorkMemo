# WorkMemo v0.2.5 发行修改完整源码

日期：2026-10-30（Asia/Shanghai）。以下保存本次修改的程序、版本、锁文件、许可收集器及用户说明完整文本。发行与阶段回执见 RELEASE-0.2.5.md、PHASE-8.md；第三方许可聚合全文见 E:\WorkMemo\docs\THIRD-PARTY-LICENSES.txt。功能阶段完整代码见 UPDATE-0.2.5-PHASE-1-SOURCE.md、FIX-0.2.5-FEEDBACK-SOURCE.md。完整仓库由标签 v0.2.5 的源码归档提供。

## UPDATE — E:\WorkMemo\README.md

~~~~~~~~~~~~markdown
<p align="center">
  <img src="public/workmemo.png" width="88" height="88" alt="WorkMemo 图标" />
</p>

<h1 align="center">WorkMemo</h1>

<p align="center"><strong>让忙过的一天，有迹可循。</strong></p>
<p align="center">一个安静待在桌面上的工作记录小工具。记下做了什么、花了多久，工作量可以忙完再补。</p>

<p align="center">
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.5/WorkMemo_0.2.5_x64-setup.exe"><strong>下载 Windows 安装版</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.5/WorkMemo_0.2.5_windows_x64.zip">下载免安装 ZIP</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/tag/v0.2.5">v0.2.5 更新说明</a>
</p>
<p align="center">Windows 10 / 11 · x64 · 无需注册账号 · 记录保存在本机</p>

---

## 把注意力留给手上的事

有时候，一天下来做了不少事，回头却想不起时间都花在哪里。WorkMemo 想帮你留下一份简单的记录：什么时候开始，真正工作了多久，最后完成了多少。

- **顺手记一段工作**：选好类别就能开始，暂停不计时；数量和备注可以结束后再补。评测、质检、开发、文档都能分开看。
- **让工作页面帮你开表**：配置 Chrome 工作站点并授权后，检测到工作页面和新操作后，先问一句要不要开工。只想看看时选「仅浏览」，等你主动开始。检测和暂停阈值都能自己调整。
- **桌面上少一点打扰**：主窗口关闭后继续在后台运行，状态岛方便看一眼当前计时。Glass、Cream、Dark、Neon 四种皮肤，搭配自己的背景图；想少占些地方，就切到紧凑模式。
- **回头看，也找得到**：在 Chrome 数据中心看趋势、日历与每段工作的明细，补填数量和备注；需要换电脑或整理数据时，可以完整备份。

<p align="center"><img src="docs/assets/themes.svg" alt="Glass、Cream、Dark、Neon 四种皮肤配色" width="1000" /></p>
<p align="center"><sub>四种配色，选一个看着舒服的。</sub></p>

## 第一次用

1. 下载上面的安装版，或把 ZIP **完整解压**后运行 `WorkMemo/workmemo.exe`。不要只拿出主程序。
2. 想先试试，直接选类别，点击「开始工作」；结束后到「待补全」填写工作量，填 `0` 也可以。
3. 想用自动记录，打开「监测设置」，按[使用说明](docs/USER-GUIDE.md#使用-chrome-自动记录)装好配套扩展、添加工作网址并同步授权。

自动记录需要 Chrome 配套扩展；手动计时不需要。软件使用 Microsoft WebView2，安装版会在缺少时引导安装。

## 这次更新：紧凑桌面与连续补填

**v0.2.5** 沿用透明悬浮和四种皮肤，把「仅浏览」收进顶部工具栏；暂停后可用双箭头进入独立新建页，主窗口按内容收紧高度，底部以横向文字展示当天工作量。

状态岛主体保持固定，提醒和工作量表单在下方平滑展开，保存成功后收起。网页详情与补填面板居中，分类右侧的待补填数量可直接进入，并能保存后继续下一条。默认开启当前用户开机自启，登录后在托盘后台运行，可在布局设置关闭。

已有计时、暂停、历史、自然周期报表、工作改名、音效、多网址和备份继续保留；数据库仍为 schema 9。升级前请备份并从托盘正常退出旧版，完整安装或解压新版，并重新加载配套扩展。

[查看 v0.2.5 下载与更新说明](https://github.com/noharass/WorkMemo/releases/tag/v0.2.5) · [构建校验与验收限制](docs/RELEASE-0.2.5.md)

完整实施记录见[桌面与状态岛](docs/UPDATE-0.2.5-PHASE-1.md)和[反馈修正](docs/FIX-0.2.5-FEEDBACK.md)。旧版下载与阶段记录保留。

## 从旧版本过来

更新前请先备份数据、从托盘退出旧版；更新后在 Chrome 扩展页重新加载配套扩展。**正式版与预览版的数据各自独立**：

- 从正式版更新：安装新版，沿用原有正式记录。
- 从预览版迁移：先退出预览版，再到新版「设置 → 数据管理」查看来源和数量，确认后合并；重复导入会跳过，有变化的记录会提示冲突。
- 想回退旧版：保留旧安装包和升级前的数据备份；旧程序不能直接读取新版数据格式。

具体步骤与数据位置见[使用说明](docs/USER-GUIDE.md#升级迁移与回退)。历史预览版仍保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。

## 你的记录，留在你的电脑里

WorkMemo 不需要云账号。工作记录、监测设置、背景图片和备份都保存在本机。数据中心也由本机软件提供，使用期间请保持 WorkMemo 在后台运行。Chrome 扩展只在你授权的工作站点观察页面是否匹配、是否发生操作，不读取输入内容、具体按键或网页正文。

自动记录依赖页面连接和输入活动；阅读、思考时可能少计。遇到连接中断，会暂停无法确认的时间。检测间隔是目标频率，浏览器休眠或系统繁忙时可能延迟。

## 有哪里不顺手，告诉我

欢迎[提一个 Issue](https://github.com/noharass/WorkMemo/issues/new)。描述一下当时做了什么、希望它怎样工作，再附上软件版本和错误提示就好。请不要上传真实工作数据库或私人备注。

[使用说明](docs/USER-GUIDE.md) · [下载与更新](https://github.com/noharass/WorkMemo/releases/latest) · [反馈问题](https://github.com/noharass/WorkMemo/issues)
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\browser-extension\manifest.json

~~~~~~~~~~~~json
{
  "manifest_version": 3,
  "name": "WorkMemo 本地工作监测",
  "version": "0.2.5",
  "version_name": "0.2.5",
  "description": "仅将已配置工作页面的匹配状态传给本机 WorkMemo；不读取网页内容或输入文本。",
  "minimum_chrome_version": "120",
  "permissions": [
    "nativeMessaging",
    "alarms",
    "scripting"
  ],
  "optional_host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "WorkMemo 工作监测"
  },
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtGKBoVQeI/+nL0Zq//7RFyrT35o4sVV2QMJ7kfe8vhaz471T5FxJLX1gu4WTArqWf0e+WwSHlxIiI/PfefgiWdXB/HpuamuopdfFFYuJ57D/GgzPiQvSiyifGGNtH3Tz7fDvQDVSmzhbS6/0KwHe/csgYyzrKa7OyW1R6x9+EirVYhJM1XLJ0Rvu+Y/1l6p0BApkVteGRfn7BGLK4qsUlRoow7pyG1DSlFapBUS/e9oT+ozUT2OX2fLkqtPg9M9scthII08XUATKeD3jtyUqqU0v2Pc9V4KF36J1Jnpt50PEpey/KK/TGLN9T21F8jRxHuDFFQs1mZDDvVVRWjUXCwIDAQAB"
}
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\docs\BUILDING.md

~~~~~~~~~~~~markdown
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

网页通过共享 `src/ui/UiProvider.tsx` 使用 Ant Design 6.6.8，保留桌面原有控件和样式。不要在网页继续手写标准按钮、选择框、表格或弹层；主题通过官方 token、语义样式及共享封装配置。未引入全局 reset，图表继续使用 ECharts。

先在一个 PowerShell 窗口运行 `npm.cmd run dev -- --host 127.0.0.1`，再在另一个窗口运行：

```powershell
# Playwright 是验收工具，不是应用运行依赖；填写本机已有的 playwright/index.mjs。
$env:WORKMEMO_PLAYWRIGHT = 'C:\path\to\playwright\index.mjs'
npm.cmd run test:web
node scripts/verify-v025.mjs
node scripts/verify-v025-followup.mjs
node scripts/verify-titlebar.mjs
node scripts/verify-ui-022.mjs --desktop-only
node scripts/verify-v023-phase1.mjs
node scripts/verify-multi-url.mjs
```

这些浏览器回归使用隔离 HTTP／IPC 数据，不对真实任务发送操作。新版网页回归以 `test:web` 为准，v0.2.5 的连续补填和桌面收高分别由 verify-v025-followup.mjs 与 verify-v025.mjs 检查；旧网页脚本中的原生 select、侧抽屉及清空统计的断言对应历史布局，不能当作新版的验收入口。新截图和结果写入 `artifacts/web-ui/qa`；CSS 缩放和模拟 IPC 不等于 Windows 原生透明、系统 DPI 或实际浏览器扩展验收。完整说明见 [WEB-UI-UPDATE.md](WEB-UI-UPDATE.md)。

## 构建 v0.2.5 成品

```powershell
& .\scripts\package-windows.ps1
```

脚本收集第三方许可，执行前端与 Tauri release 构建，准备浏览器组件，生成 NSIS 安装器和免安装 ZIP：

- `artifacts/0.2.5/WorkMemo_0.2.5_x64-setup.exe`
- `artifacts/0.2.5/WorkMemo_0.2.5_windows_x64.zip`
- `artifacts/0.2.5/THIRD-PARTY-LICENSES.txt`
- `artifacts/0.2.5/SHA256SUMS.txt`

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
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\docs\USER-GUIDE.md

~~~~~~~~~~~~markdown
# WorkMemo v0.2.5 使用说明

WorkMemo 是 Windows 本地工作记录工具。可以手动计时，也可以配合 Chrome，识别工作页面并确认开工后记录。数量和备注可以忙完再补。

## 安装与启动

适用于 Windows 10 / 11 x64，需要 Microsoft Edge WebView2 Runtime。

- **安装版**：运行 `WorkMemo_0.2.5_x64-setup.exe`，按向导安装。缺少 WebView2 时需要联网安装 Microsoft 官方运行环境。
- **免安装版**：完整解压 `WorkMemo_0.2.5_windows_x64.zip`，打开 `WorkMemo/workmemo.exe`。主程序旁边的浏览器组件、`extension` 文件夹和修复脚本都请保留。缺少 WebView2 时，从 [Microsoft 官网](https://developer.microsoft.com/microsoft-edge/webview2/)安装。
- 不需要开发工具或数据库服务。免安装表示程序不用安装；记录仍存放在当前 Windows 用户的数据目录，不会随解压文件夹移动。
- 从 [WorkMemo v0.2.5 正式版](https://github.com/noharass/WorkMemo/releases/tag/v0.2.5)下载安装版或完整 ZIP。程序暂未签名，可用随附 `SHA256SUMS.txt` 核对下载文件。

## 手动记录一段工作

1. 选择工作类别（初始为评测、质检、开发、文档，可在设置改名），点击「开始工作」。工作量和备注可以先不填。
2. 需要停一下时点击暂停；继续会累计同一条记录，暂停期间不计时。
3. 结束计时后，结果先保存。可在状态岛下方直接填写工作量和备注，成功保存后自动收起；也可在 Chrome 数据中心的「待补全」选择记录填写。数量允许 `0`，表示本次没有产出。

同一时间只会有一个未结束任务。先暂停，再点双箭头「切换任务」进入独立新建页；可填写类别、工作量和备注，取消切换返回原暂停任务。点击「开始工作」时，会先提示结束并保存上一项，再开始新任务。手动任务进行中，自动页面识别不会替换它；手动计时仍有空闲保护。

## 使用 Chrome 自动记录

首次设置：

1. 打开 WorkMemo「监测设置」，点击「打开配套扩展文件夹」。
2. Chrome 打开 `chrome://extensions`，开启开发者模式，选择「加载已解压的扩展程序」，选中上一步的 **extension 文件夹**。
3. 回到 WorkMemo，在监测设置里启用自动识别，添加工作网址和类别，然后保存。
4. 打开 Chrome 的 WorkMemo 扩展，点击同步工作站点授权，并确认需要记录的站点。
5. 保持工作页面在 Chrome 前台，进行一次新的鼠标或键盘操作。软件确认页面与输入后显示「准备开始工作？」；点击「开始记录」才从此刻计时，不补算等待时间。只是打开页面不会开始。

扩展标识固定为 `oljcealhccdhaddceacnokihjefloaih`。更新软件后，也请在 Chrome 中重新加载配套扩展；如果换了解压目录，重新加载新目录的扩展。

站点授权仅针对你配置的工作网页。扩展只发送匹配状态及是否发生可信操作的信号，不发送网页正文、输入文字、具体按键或鼠标轨迹。

### 只想浏览一下

点击主窗口顶部眼睛图标旁的「仅浏览」，或在状态岛开工提示中选择「仅浏览」，就不会新建任务或自动恢复暂停的任务。此选择会保存，重启后仍然有效，不会隔一会儿再问一次。

回到匹配的工作页面并产生操作后，状态岛会显示就绪入口，主窗口顶部「仅浏览」也可以切回记录。点击开始入口开工；已有暂停任务时显示「继续记录」，继续原任务。隐藏状态岛时，主窗口中也有入口。监测未启用时仍可手动选择类别开始。

正在计时时进入「仅浏览」会立即暂停并保留任务，不结束、不删除。离开工作页后显示「仅浏览」，再次工作由你主动开始或继续。重启后待恢复的任务仍需先处理。

### 自动记录的日常规则

- 检测间隔可选 **1–5 秒**，默认 1 秒。浏览器休眠或系统繁忙时可能延迟。
- 默认连续离开工作页 2 分钟后暂停，再保留 10 分钟；期间回到工作页面并产生新操作，可以继续同一条记录。
- 默认键鼠无操作 2 分钟自动暂停，扣除最后输入后的空闲尾段；5 分钟提醒，7 分钟结束。纯手动任务空闲暂停后有新键鼠操作即恢复原任务；自动任务须回到可信匹配工作页并产生新操作才恢复。阅读、思考时可能少计。
- 非「仅浏览」状态下，默认手动暂停后，回到工作页并产生新操作可自动恢复；在设置中关闭此选项后，只能手动继续。
- 自动任务手动继续后仍由自动规则管理。保存监测设置会暂停当前自动任务，需要重新确认页面并有新操作后恢复。
- 浏览器连接中断或系统状态无法确认时，停止累计无法确认的时间。重启后的未结束任务会停在「待恢复」，请确认后继续，不补计软件关闭期间的时间。

这些时间可在监测设置中分别调整。空闲暂停及提醒时间均须早于空闲结束时间；不同结束条件中，先到期的条件生效。

### 连不上浏览器时

先看监测设置中的连接诊断，再点击「修复本机连接」；回到 Chrome 扩展刷新连接并同步站点授权。仍不行时，完整更新软件和扩展，确认没有只复制主 EXE。

也可双击程序目录的 `Register-Browser.cmd` 修复本机注册。安装版、ZIP 都会在启动时检查本机连接。不要同时运行正式版和预览版计时。

## 窗口、外观与保存

舒展模式默认宽约 780px，紧凑模式约 420px；主窗口高度随新建／工作中内容收紧，屏幕较小时保留内容滚动。设置使用独立原生窗口；历史和待补全在 Chrome 中打开。

- 拖动标题栏移动窗口，拖动边缘调整大小。两种模式分别记住主窗口布局；正文内容变化时只拟合高度，宽度保持；设置内可以恢复默认布局。
- 设置窗口只在标题栏右上角保留关闭叉号，正文独立滚动，底部保存操作保持可见。
- 有未保存修改时，关闭或切换栏目会提示「保存、放弃、继续编辑」。`Ctrl+S` 保存当前表单；保存失败保留输入。
- 「外观」有 Glass、Cream、Dark、Neon 四种皮肤。可选择自己的 PNG、JPEG、WebP 背景，文件不超过 10 MiB、解码后不超过 1600 万像素。图片会复制保存，移动原图不影响使用。图片透明度独立调整，默认 25%；取消预览恢复已保存外观。
- 「工作名称与外观」可以修改四类名称、图标和颜色。名称去除首尾空白后须为 1～20 个字符，不能重名。保存名称后，新旧记录和网址分组统一显示新名，原有归属保持；名称与外观各自保存。
- 「布局」可选择舒展或紧凑、正文 12–18px、字重与行距，也可开关提示音、选择柔和／清脆套装并分别试听五种状态。保存后生效，原有静音选择保留；试听不受开关限制。紧凑模式说明和高级选项按需展开。
- **关闭主窗口只是隐藏到后台**。要完全关闭，从托盘选择「退出 WorkMemo」。

## Chrome 数据中心

点击底部「今日工作量」或「待补全」打开；状态岛结束提醒可直接在展开区域补填。优先使用已安装的 Chrome；未找到时可以复制本机地址或选择默认浏览器。

数据中心需要 WorkMemo 在后台运行。退出软件后连接断开，不能提交修改；重新启动后从软件重新打开数据页。页面资源在本地，不需要云账号。

- 默认查看今天，可切换自然日／周／月，前后翻周期或回到当前周期。每周从周一到周日；月份按自然月。自定义范围也可选择全部日期。
- 分类工作量表分别汇总每类已确认数量、有效工时、已结束记录和待补填数，不把不同类型数量混加。明确填写 0 显示 0，待补填不视为 0。当前任务单独显示，不计入已结束报表。右侧正数待补填「x 条」可直接进入当前周期、分类和数据范围的补填；支持「保存并下一条」，保存失败或冲突保留输入，不会跳过记录。
- 工时趋势按记录开始小时（日）或开始日期（周／月）汇总，跨午夜仍归入开始日；不是实时逐小时工作区间。类别分布与工作日历在「辅助分析」展开，日历最多展示筛选范围内的近 90 天。自定义长跨度可按月汇总；明细继续分页。
- 点开已结束记录的详情／补填面板会在页面水平、垂直居中，可以补填或修改类别、数量、备注，也能查看计时区间与修改历史。进行中记录只读；此版本不修改起止时间和有效工时。
- 页面表单支持 `Ctrl+S`。未保存就关闭明细时会提醒；其他窗口有更新时不会覆盖当前输入。遇到版本冲突，请保留输入、重新查看最新记录后再处理。
- 删除前需要确认，重要记录请先备份。

首页底部横向展示当天各类已确认工作量；未超出可用宽度时静止，超出时平滑循环滚动，悬停或键盘聚焦时暂停。系统选择减少动态效果时保持静止，可横向查看。未填数量会标记「待补填」，明确填写的 `0` 则正常计入。跨午夜的任务归入开始当天。

### 看看演示效果

「设置 → 数据管理」可生成最近 90 天的演示批次，再打开演示视图。演示覆盖四类工作、待补全和修改示例，全部是已结束记录，不改变当前任务。

真实、演示、全部三种范围可分别筛选。演示记录始终带标记，普通入口默认只看真实数据，首页统计也排除演示。重复生成不会重复插入；专门的「清理演示数据」入口需确认后才删除演示记录。

## 备份与恢复

打开「设置 → 数据管理」：

- **创建备份**：选择保存位置，生成 `.workmemo` 文件，包含工作数据库、监测配置、四类名称、外观、类别图标颜色、背景图片、布局（含音效选择）和状态岛设置，以及演示标记与浏览意图；不包含运行时连接令牌或浏览器注册信息。
- **从备份恢复**：先暂停正在计时的任务，保存或放弃其他窗口的修改。选择备份并核对数量后确认恢复。恢复会整体替换当前数据，软件会先自动备份原数据；校验或写入失败时保留或回滚原数据。

恢复出的未结束任务保持暂停、待恢复状态，不自动补计停机时间。恢复后请检查监测配置，并在 Chrome 扩展中同步站点授权。v0.2.5 也支持恢复兼容的旧版备份，并在临时副本中完成迁移。

自动备份位于 `%APPDATA%\com.workmemo.desktop\backups`。请另存一份重要备份到其他磁盘；保存在同一台电脑上的备份不能防止硬盘损坏。

## 升级、迁移与回退

### 从正式版升级

1. 从托盘正常退出旧软件。
2. **升级前保留旧安装包，并复制下面两个目录作为备份**。
3. 安装新版，或完整解压新版 ZIP 后启动。正式版沿用原数据位置，会自动升级数据格式。更新后请在 Chrome 扩展页重新加载新版本配套扩展。

| 内容 | 位置 |
| --- | --- |
| 工作记录与监测配置 | `%LOCALAPPDATA%\com.workmemo.desktop` |
| 外观、背景、窗口及状态岛设置 | `%APPDATA%\com.workmemo.desktop` |

安装版与免安装版共用这些数据。同一份数据只运行一个实例。应用运行时不要单独复制、移动或删除 SQLite、WAL、SHM 文件；使用内置备份，或退出后复制整个目录。

### 从预览版迁移

预览数据在 `%LOCALAPPDATA%\com.workmemo.test.monitor`，与正式版独立，不会因为安装正式版就自动覆盖。

1. 先从托盘退出预览程序，不必为了迁移强制结束工作任务。
2. 在正式版「设置 → 数据管理」核对来源、记录数、待补全和未结束任务。
3. 默认只导入记录，保留正式版监测配置。需要预览监测配置时单独勾选；正式版有未结束任务时，先只导入记录。导入配置后监测先保持关闭，请核对后手动开启。
4. 确认后软件先备份当前正式数据，再合并记录。原正式记录保留，重复导入会跳过，已经导入但后来变化的预览记录列为冲突，不自动覆盖。
5. 两边都有未结束任务时，历史和待补全可以先导入，冲突任务留在原处。处理后可以重试。正式版没有未结束任务时，预览任务迁为待恢复状态。

来源中的原记录不会被删除。若提示预览程序仍在运行，请从托盘正常退出后重试。

### 回退旧版本

v0.2.5 使用 schema 9，升级后的数据库不能直接交给 v0.2.2 等旧版本读取。先从托盘退出新版，保留新版数据的副本，再安装旧版并恢复**升级前保存的整目录备份**。`.workmemo` 备份应使用支持此格式的 WorkMemo 版本恢复，不要直接交给旧版。

旧版和历史预览版安装包保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。卸载或清理目录前，请确认重要备份已经另存。

## 反馈问题

在 [GitHub Issues](https://github.com/noharass/WorkMemo/issues/new) 提供软件版本、Windows 版本、错误文字和复现步骤即可。不要公开真实工作数据库、私人备注或连接信息。

第三方依赖声明见随附 `THIRD-PARTY-LICENSES.txt`。

## v0.2.5 桌面与连续补填更新

- 顶部保留标识、设置、拖动区域和窗口操作；「仅浏览」使用眼睛图标及简短文字，开启时突出显示。
- 双箭头「切换任务」和原有暂停、备注、结束同排。新建与当前任务互斥；暂停后可切换，工作量仍可稍后填写，0 与未填不同。
- 状态岛主体保持固定尺寸和位置，允许拖动；提醒及填写区域只向下动画展开，共用背景。保存成功后收起，失败保留输入；新任务不会覆盖正在补填的旧记录。
- 默认开启当前用户开机启动，登录 Windows 后主窗口留在后台，可从托盘打开。在「设置 → 布局 → 开机启动」可以立即关闭；已有关闭选择或任务管理器禁用后不会强制重开。开发与隔离预览不注册启动项。
- 同一正式标识只运行一个实例。重复手动启动会打开已有窗口，重复自启不会抢出主窗口。
- 自启是软件完整退出后的再次启动，不会补算关闭期间工时，也不会绕过未结束任务的待恢复确认。移动 ZIP 目录后运行一次新目录的主程序可更新已启用的自启路径；不要删除正在使用的程序目录。
- 网页分类待补填数量可直达当前范围的表单，支持连续补填；详情居中，保留未保存保护、滚动和减少动态效果。

更新后请手动安装或完整解压新版，并在 Chrome 重新加载 0.2.5 配套扩展；旧程序不会自行替换。新版本验收范围与限制见 [RELEASE-0.2.5.md](https://github.com/noharass/WorkMemo/blob/v0.2.5/docs/RELEASE-0.2.5.md)。

## 延续 v0.2.3 的功能

- 键鼠空闲自动暂停，可修改阈值；继续原任务，暂停不计时，保留较长空闲结束规则。
- 四类可改名，新旧记录与网址归属保持一致。
- 自然日／周／月分类报表及新的报表优先布局，0、待补填和无记录分开显示。
- 柔和／清脆两套原生提示音，开始、暂停、恢复、结束、空闲提醒可分别试听。
- 数据库迁移至 schema 9，保留旧记录、有效区间、修正历史及自增 ID。

### 延续 v0.2.2 的功能

- 灵动岛常态约 320×56 逻辑像素，暂停与继续位于计时右侧，继续沿用同一记录。开工确认时临时展开，浏览状态的开始入口位于右侧。
- 「监测设置 → 工作页面」可选择路径前缀、整个站点、域名后缀。已有规则默认保留路径前缀；新规则保存后，在 Chrome 扩展页重新加载 0.2.5 配套扩展并同步工作站点授权。
- 整个站点示例：`https://moonshot.feishu.cn` 覆盖该来源所有路径；域名后缀示例：`.cn-beijing-vpc.fcapp.run` 覆盖该域名及其子域名。匹配后仍需新操作和开工确认。
- 重叠时路径规则优先，其次整个站点，最后域名后缀；同类优先更具体的规则。域名后缀授权包含 HTTP 与 HTTPS，范围仅为配置的域名及子域名。
- 「布局」新增关键状态提示音开关和试听；默认开启，修改后点击保存布局。音效音量跟随 Windows 应用音量，播放失败不会影响记录。
- 总览侧栏、筛选及卡片更紧凑；工作节奏改为灰色零值与四档绿色。详情中的编辑入口修复，保存失败会保留输入。

## 一项工作使用多个网站

打开「监测设置 → 工作与网址」，展开对应工作（评测、质检、开发、文档），点击「为这项工作添加 URL」继续添加网址。每个 URL 可独立选择路径前缀、整个站点或域名后缀；例如评测可同时添加飞书站点和工作平台域名后缀。

点击「保存监测配置」后，在 Chrome 扩展中同步所有工作站点授权。已有配置会自动按归属工作分组，无需重新填写；全部工作合计最多 50 个 URL。进行中的同一工作在匹配站点之间切换时不拆分、不重复开工；空闲、离页和暂停规则保持。移除某个 URL 不影响同组其他网址；可用「归属工作」移动网址。

## 总览布局

周期与筛选在顶部，其下为有效工时、已结束记录和待补全三个概览，再展示分类工作量表。趋势和可展开的辅助分析位于下方，底部保留完整工作明细。窄屏分类表改为卡片，长名称可换行；明细表在自身区域横向滚动。趋势图例与坐标轴单位分行留出间距，不显示灰色缩放条。
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\package-lock.json

~~~~~~~~~~~~json
{
  "name": "workmemo",
  "version": "0.2.5",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "workmemo",
      "version": "0.2.5",
      "dependencies": {
        "@ant-design/icons": "^6.3.4",
        "@ant-design/icons-svg": "^4.6.0",
        "@rc-component/motion": "1.3.3",
        "@tauri-apps/api": "^2",
        "antd": "6.6.8",
        "dayjs": "1.11.13",
        "echarts": "6.1.0",
        "react": "^19.1.0",
        "react-dom": "^19.1.0"
      },
      "devDependencies": {
        "@tailwindcss/vite": "^4.3.3",
        "@tauri-apps/cli": "^2",
        "@types/react": "^19.1.8",
        "@types/react-dom": "^19.1.6",
        "@vitejs/plugin-react": "^6.0.2",
        "tailwindcss": "^4.3.3",
        "typescript": "~6.0.3",
        "vite": "^8.0.16"
      },
      "engines": {
        "node": ">=24 <25"
      }
    },
    "node_modules/@ant-design/colors": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/@ant-design/colors/-/colors-8.0.1.tgz",
      "integrity": "sha512-foPVl0+SWIslGUtD/xBr1p9U4AKzPhNYEseXYRRo5QSzGACYZrQbe11AYJbYfAWnWSpGBx6JjBmSeugUsD9vqQ==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/fast-color": "^3.0.0"
      }
    },
    "node_modules/@ant-design/cssinjs": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/@ant-design/cssinjs/-/cssinjs-2.1.2.tgz",
      "integrity": "sha512-2Hy8BnCEH31xPeSLbhhB2ctCPXE2ZnASdi+KbSeS79BNbUhL9hAEe20SkUk+BR8aKTmqb6+FKFruk7w8z0VoRQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.11.1",
        "@emotion/hash": "^0.8.0",
        "@emotion/unitless": "^0.7.5",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1",
        "csstype": "^3.1.3",
        "stylis": "^4.3.4"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@ant-design/cssinjs-utils": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/@ant-design/cssinjs-utils/-/cssinjs-utils-2.1.2.tgz",
      "integrity": "sha512-5fTHQ158jJJ5dC/ECeyIdZUzKxE/mpEMRZxthyG1sw/AKRHKgJBg00Yi6ACVXgycdje7KahRNvNET/uBccwCnA==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/cssinjs": "^2.1.2",
        "@babel/runtime": "^7.23.2",
        "@rc-component/util": "^1.4.0"
      },
      "peerDependencies": {
        "react": ">=18",
        "react-dom": ">=18"
      }
    },
    "node_modules/@ant-design/fast-color": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/@ant-design/fast-color/-/fast-color-3.0.1.tgz",
      "integrity": "sha512-esKJegpW4nckh0o6kV3Tkb7NPIZYbPnnFxmQDUmL08ukXZAvV85TZBr70eGuke/CIArLaP6aw8lt9KILjnWuOw==",
      "license": "MIT",
      "engines": {
        "node": ">=8.x"
      }
    },
    "node_modules/@ant-design/icons": {
      "version": "6.3.4",
      "resolved": "https://registry.npmjs.org/@ant-design/icons/-/icons-6.3.4.tgz",
      "integrity": "sha512-kDoUlppczVyCUTFthF6cHmPzMBYqNZQhu9j6EyIX/YIdM9j9CZNZoJUjzVw7/1v1VO8WwVMmPp15r/uwIAS0AQ==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/colors": "^8.0.1",
        "@ant-design/icons-svg": "^4.6.0",
        "@rc-component/util": "^1.11.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@ant-design/icons-svg": {
      "version": "4.6.0",
      "resolved": "https://registry.npmjs.org/@ant-design/icons-svg/-/icons-svg-4.6.0.tgz",
      "integrity": "sha512-PRomU725ABMf/lnQp5HiB7my1kjEbFY0D10N4lXYxK6TIB1gKjIVD5MRThpDaezLgw1D774J8eOeeDB0M6wHrQ==",
      "license": "MIT"
    },
    "node_modules/@ant-design/react-slick": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@ant-design/react-slick/-/react-slick-2.0.0.tgz",
      "integrity": "sha512-HMS9sRoEmZey8LsE/Yo6+klhlzU12PisjrVcydW3So7RdklyEd2qehyU6a7Yp+OYN72mgsYs3NFCyP2lCPFVqg==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.28.4",
        "clsx": "^2.1.1",
        "json2mq": "^0.2.0",
        "throttle-debounce": "^5.0.0"
      },
      "peerDependencies": {
        "react": "^0.14.0 || ^15.0.1 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^0.14.0 || ^15.0.1 || ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.10",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.10.tgz",
      "integrity": "sha512-NpugTzbKgGrNe45Ui32cN8vCFFMxVtP/9rtfwv0nP5FRDAjvYBxJcLVpYA9mr1jxP6cnIT7x9LUzuDTbWYYNRA==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@emotion/hash": {
      "version": "0.8.0",
      "resolved": "https://registry.npmjs.org/@emotion/hash/-/hash-0.8.0.tgz",
      "integrity": "sha512-kBJtf7PH6aWwZ6fka3zQ0p6SBYzx4fl1LoZXE2RrnYST9Xljm7WfKJrU4g/Xr3Beg72MLrp1AWNUmuYJTL7Cow==",
      "license": "MIT"
    },
    "node_modules/@emotion/unitless": {
      "version": "0.7.5",
      "resolved": "https://registry.npmjs.org/@emotion/unitless/-/unitless-0.7.5.tgz",
      "integrity": "sha512-OWORNpfjMsSSUBVrRBVGECkhWcULOAJz9ZW8uK9qgxD+87M7jHRcvh/A96XXNhXTLmKcoYSQtBEX7lHMO7YRwg==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@oxc-project/types": {
      "version": "0.155.0",
      "resolved": "https://registry.npmjs.org/@oxc-project/types/-/types-0.155.0.tgz",
      "integrity": "sha512-SeE8JPwW1xs1tHeNycjUtUBdhorRa8o4jlvjwk49R7/Z291i+4DQa7JJIgOm/TaYQZx+QrPQbVJ/9c8dMIZN8Q==",
      "dev": true,
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/oxc-project"
      }
    },
    "node_modules/@rc-component/async-validator": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/@rc-component/async-validator/-/async-validator-6.0.0.tgz",
      "integrity": "sha512-D3AGQwdyE58gmvx6waVSXJ80JGO+IY5L2O8HDnSOex7JNlzB3GuN/4hyHNTdhy2qtOhkpbIjmeAN3tL993wKbA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.24.4"
      },
      "engines": {
        "node": ">=14.x"
      }
    },
    "node_modules/@rc-component/cascader": {
      "version": "1.22.0",
      "resolved": "https://registry.npmjs.org/@rc-component/cascader/-/cascader-1.22.0.tgz",
      "integrity": "sha512-SffrA57aS9oub3VuI7ajPhJTPtaNxngSvtRhD40Rd8dwJ5vfWPSrVanWgeepdWFGBt7EHftIK5RUU0u3rCTwWw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/select": "~1.10.0",
        "@rc-component/tree": "~1.4.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/checkbox": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@rc-component/checkbox/-/checkbox-2.0.0.tgz",
      "integrity": "sha512-3CXGPpAR9gsPKeO2N78HAPOzU30UdemD6HGJoWVJOpa6WleaGB5kzZj3v6bdTZab31YuWgY/RxV3VKPctn0DwQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/collapse": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/@rc-component/collapse/-/collapse-1.2.0.tgz",
      "integrity": "sha512-ZRYSKSS39qsFx93p26bde7JUZJshsUBEQRlRXPuJYlAiNX0vyYlF5TsAm8JZN3LcF8XvKikdzPbgAtXSbkLUkw==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.10.1",
        "@rc-component/motion": "^1.1.4",
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/color-picker": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/color-picker/-/color-picker-3.1.1.tgz",
      "integrity": "sha512-OHaCHLHszCegdXmIq2ZRIZBN/EtpT6Wm8SG/gpzLATHbVKc/avvuKi+zlOuk05FTWvgaMmpxAko44uRJ3M+2pg==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/fast-color": "^3.0.1",
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/context": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/@rc-component/context/-/context-2.0.2.tgz",
      "integrity": "sha512-uiGpAlblCNlziHPwj4S4Iy/oemeuz/hR03mbiEjTCXwsqOIN3BOzsRMyDwpyO5Fm0vIEEJRUf9ZtbRLbhksuTA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.0"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/dialog": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@rc-component/dialog/-/dialog-1.10.0.tgz",
      "integrity": "sha512-eDukNlz9vNszAGv7i3zKXdxEd3wgVmNxuJijYt8zvTh17QwTu8KK/bdURRd/lU4qaMzhO1HKKmMrwOnkaw0BvQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.3.3",
        "@rc-component/portal": "^2.1.0",
        "@rc-component/util": "^1.9.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/drawer": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/@rc-component/drawer/-/drawer-1.4.2.tgz",
      "integrity": "sha512-1ib+fZEp6FBu+YvcIktm+nCQ+Q+qIpwpoaJH6opGr4ofh2QMq+qdr5DLC4oCf5qf3pcWX9lUWPYX652k4ini8Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/portal": "^2.1.3",
        "@rc-component/util": "^1.9.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/dropdown": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rc-component/dropdown/-/dropdown-1.0.3.tgz",
      "integrity": "sha512-YTST/N6kpqpDz3IMuM/PSSZnrDpSOA6dgHv12gPA90ZTSLv2CoqkZ0+9NtwTY6BeO7dstPblSic2QJg7dSFy/g==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.11.0",
        "react-dom": ">=16.11.0"
      }
    },
    "node_modules/@rc-component/form": {
      "version": "1.8.6",
      "resolved": "https://registry.npmjs.org/@rc-component/form/-/form-1.8.6.tgz",
      "integrity": "sha512-1EXVsSKPZC6kGrIqxVck7kAWM6T65b6et/n5wIcyiaIa41VrDshD0nVLHoBDEIZr2ATQsOP6icb4XQkNFMLBAw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/async-validator": "^6.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/image": {
      "version": "1.10.0",
      "resolved": "https://registry.npmjs.org/@rc-component/image/-/image-1.10.0.tgz",
      "integrity": "sha512-BjeZCRQ+hw+4WAhvrw8rJvy5fckA2xpf/X2XQEOABUHvLTNB9inB98X3Mp54jYQ7g10DfWERQWHXeC4ylxp1Uw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.0.0",
        "@rc-component/portal": "^2.1.2",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/input": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/@rc-component/input/-/input-1.3.1.tgz",
      "integrity": "sha512-iFvTUT9W+JC/MSin2aGAk8NqsVlTzcExNC9DZariON1IWirju9NoNeEk47an4Q8iHazkoVI/y1LnDi88+CPcig==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/resize-observer": "^1.1.1",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@rc-component/input-number": {
      "version": "1.6.2",
      "resolved": "https://registry.npmjs.org/@rc-component/input-number/-/input-number-1.6.2.tgz",
      "integrity": "sha512-Gjcq7meZlCOiWN1t1xCC+7/s85humHVokTBI7PJgTfoyw5OWF74y3e6P8PHX104g9+b54jsodFIzyaj6p8LI9w==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/mini-decimal": "^1.0.1",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/listy": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rc-component/listy/-/listy-1.2.3.tgz",
      "integrity": "sha512-IXiMjV5s0rczLBlfh7G5nB4M3365mrEeedjwKtf5I+Ns3PqRUsebR2h5u8CeFarsVfLUPC2I5p0h09TNoOWyvQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/portal": "^2.0.0",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/util": "^1.3.1",
        "@rc-component/virtual-list": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/mentions": {
      "version": "1.12.0",
      "resolved": "https://registry.npmjs.org/@rc-component/mentions/-/mentions-1.12.0.tgz",
      "integrity": "sha512-v5MBx8zDcqCT+uybJgKpcx3Fgrvj0m3u+A/15RlSBaMx12lLoJZTTYggC3pbYYfohcKujWWUyBz6O6Gp2vGiNA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/input": "~1.3.1",
        "@rc-component/menu": "~1.5.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/menu": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/@rc-component/menu/-/menu-1.5.0.tgz",
      "integrity": "sha512-RjvzPsZkwVEg3xu+/jDDqDeUCBJAnWylONFlGeQgg5enlNAnlpybqhaMGE/UPEIvr6hL90PGhjFBguJqj0Qb2Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/overflow": "^1.0.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/mini-decimal": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@rc-component/mini-decimal/-/mini-decimal-1.1.4.tgz",
      "integrity": "sha512-xiuXcaCwyOWpD8a8scdExFl+bntNphAW8XeenL1ig2en0AAZY0Pcp4pC0dI22qJ+NvxKn9RoNIoRdqYU3BLH4w==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.18.0"
      },
      "engines": {
        "node": ">=8.x"
      }
    },
    "node_modules/@rc-component/motion": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/@rc-component/motion/-/motion-1.3.3.tgz",
      "integrity": "sha512-Xh3IszxvlSv3/PLYFyC2UZi9LNB83yOnkB/LNmRzaypZLvkhqUIPS7MQpGZcCMWrNsXV2p6YTSWbSGvFpEle9A==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/mutate-observer": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/@rc-component/mutate-observer/-/mutate-observer-2.0.1.tgz",
      "integrity": "sha512-AyarjoLU5YlxuValRi+w8JRH2Z84TBbFO2RoGWz9d8bSu0FqT8DtugH3xC3BV7mUwlmROFauyWuXFuq4IFbH+w==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.2.0"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/notification": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/notification/-/notification-2.1.1.tgz",
      "integrity": "sha512-HD+Gx/HUjivBI6GZtfPVLjvOJZybSEIoE2upnmoVg4w9vZQHMaIPWP6B52cHWOGg+u48HBbO+HnyVNN8AKQxgQ==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.1.4",
        "@rc-component/util": "^1.13.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/overflow": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rc-component/overflow/-/overflow-1.0.1.tgz",
      "integrity": "sha512-syfmgAABaHCnCDzPwHZ/2tuvIcpOO3jefYZMmfkN+pmo8HKTzsfhS57vxo4ksPdN0By+uWVJhJWNFozNBxi2eA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.11.1",
        "@rc-component/resize-observer": "^1.0.1",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/pagination": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/pagination/-/pagination-1.4.0.tgz",
      "integrity": "sha512-CW1g7P9V8u+e8JQdUsl2RWg+GCsoee0mtJjZUCCxn/vb3jzOwDKm6hAdwddHCVBfWJ58eGUBZz3IvnU8rRktjw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/picker": {
      "version": "1.12.2",
      "resolved": "https://registry.npmjs.org/@rc-component/picker/-/picker-1.12.2.tgz",
      "integrity": "sha512-ZB1A+tzTQkgtR4flPrAMvxIAOelIIOOOsp22fU2Nad6PbZcJacnyGJUJqUH7ZS9mwxeUwurf1pLMKXrVsK1tlA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/overflow": "^1.0.0",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/trigger": "^3.6.15",
        "@rc-component/util": "^1.13.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=12.x"
      },
      "peerDependencies": {
        "date-fns": ">= 2.x",
        "dayjs": ">= 1.x",
        "luxon": ">= 3.x",
        "moment": ">= 2.x",
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      },
      "peerDependenciesMeta": {
        "date-fns": {
          "optional": true
        },
        "dayjs": {
          "optional": true
        },
        "luxon": {
          "optional": true
        },
        "moment": {
          "optional": true
        }
      }
    },
    "node_modules/@rc-component/portal": {
      "version": "2.2.1",
      "resolved": "https://registry.npmjs.org/@rc-component/portal/-/portal-2.2.1.tgz",
      "integrity": "sha512-ck+r1kW/JSv0wxPji3KN2ss9K6Z0qqwusw/mf/0JobXhZ8hC2ejZwCJObW/SvDi0uhA0VzmCnx0CaCci95tcmA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=12.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/progress": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rc-component/progress/-/progress-1.0.3.tgz",
      "integrity": "sha512-Q1nPLIvKr95el/q76yaBh5nv1hqCsWaHQb8U7vXEDMefEhHgM7n3CPoN+o4LHnTyANQHmMFgoS/naAT4Bhxuaw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/qrcode": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/@rc-component/qrcode/-/qrcode-2.0.0.tgz",
      "integrity": "sha512-aAv3QhPP1xyafuTZOxub6a54pCeBnN3IwQkpETrBtthq4BL5IgxnCbuoBWPDpdLw1y1j6BgBUCAKV92+yX06Dw==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.24.7"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/rate": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rc-component/rate/-/rate-1.0.1.tgz",
      "integrity": "sha512-bkXxeBqDpl5IOC7yL7GcSYjQx9G8H+6kLYQnNZWeBYq2OYIv1MONd6mqKTjnnJYpV0cQIU2z3atdW0j1kttpTw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/resize-observer": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@rc-component/resize-observer/-/resize-observer-1.1.2.tgz",
      "integrity": "sha512-t/Bb0W8uvL4PYKAB3YcChC+DlHh0Wt5kM7q/J+0qpVEUMLe7Hk5zuvc9km0hMnTFPSx5Z7Wu/fzCLN6erVLE8Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.2.0"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/segmented": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/segmented/-/segmented-1.4.0.tgz",
      "integrity": "sha512-NZlpKGSplOYlmF5ukUF1fCLr0ns5WfjNoqMlMkf4AHP0iu90wyiP7hn2qZKRHEuRlG4CvEEz/lF9qRiYnLTofQ==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^8.0.0",
        "@rc-component/motion": "^1.1.4",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.0.0",
        "react-dom": ">=16.0.0"
      }
    },
    "node_modules/@rc-component/segmented/node_modules/@babel/runtime": {
      "version": "8.0.8",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-8.0.8.tgz",
      "integrity": "sha512-dEu8nGlRqjsJsvviUUoSMfcRHpwomCiRlXsc2mPfJ79+ffTpDm+JtfUtTMzUrqCApHQnCsVPD3gT1ZT8RgBRCQ==",
      "license": "MIT"
    },
    "node_modules/@rc-component/select": {
      "version": "1.10.1",
      "resolved": "https://registry.npmjs.org/@rc-component/select/-/select-1.10.1.tgz",
      "integrity": "sha512-H+yQsl+qED9NilQ3g6zdpsMwUgwVjrcMTkNHAWRVU/MoNCYgTbDgU+MIMgZDK+rVdd2JUfI/MkysMcZZ0cyQKw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/overflow": "^1.0.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.11.1",
        "@rc-component/virtual-list": "^1.2.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": "*",
        "react-dom": "*"
      }
    },
    "node_modules/@rc-component/slider": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/slider/-/slider-1.1.1.tgz",
      "integrity": "sha512-LSzgWGYDgeCDgR4r1XlU29gbYws6HpLnvJd/uMhLeW/vQgxldeR+Wb4uzHDCHiYEbr1bnEHWdjkPxjJRHxuiig==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/steps": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@rc-component/steps/-/steps-1.2.3.tgz",
      "integrity": "sha512-/b9gHcvDGjTDWJZW7+1kKFvzs0jrEeQ8mFvvIgX+h7xNT0FsOYODJYKjyJR4fPbvMBCfCOEqaBK66HBxov5BQA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/switch": {
      "version": "1.0.3",
      "resolved": "https://registry.npmjs.org/@rc-component/switch/-/switch-1.0.3.tgz",
      "integrity": "sha512-Jgi+EbOBquje/XNdofr7xbJQZPYJP+BlPfR0h+WN4zFkdtB2EWqEfvkXJWeipflwjWip0/17rNbxEAqs8hVHfw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.3.0",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/table": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/@rc-component/table/-/table-1.11.1.tgz",
      "integrity": "sha512-OWdS6DMmeWb7bJBGqPxYZpQbzBlBiXZUu2sqo6Ii7Sjs9GeK1IsrXrWk26SL2c6KEseabswdxrRj7WUm9LdECw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/context": "^2.0.1",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/util": "^1.11.1",
        "@rc-component/virtual-list": "^1.0.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/tabs": {
      "version": "1.13.0",
      "resolved": "https://registry.npmjs.org/@rc-component/tabs/-/tabs-1.13.0.tgz",
      "integrity": "sha512-3FXr+9ZII8tFLWuDWrgjRaxZd2mazkKJAGRFEfVmp4r1qnBglOlxQ78l54Td1aj6/iFaaEReKSAF2HToztU5uw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/dropdown": "~1.0.0",
        "@rc-component/menu": "~1.5.0",
        "@rc-component/motion": "^1.1.3",
        "@rc-component/resize-observer": "^1.0.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/tooltip": {
      "version": "1.5.2",
      "resolved": "https://registry.npmjs.org/@rc-component/tooltip/-/tooltip-1.5.2.tgz",
      "integrity": "sha512-VLq4BclU3LgRe46g2hTr2bdsM8tFYs7dVwpuD88rPNNg4lCGe8mBSS4FiRzYzS+ffnZ46y4SI8KYKo9K7qBnhw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/trigger": "^3.10.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/tour": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/tour/-/tour-2.4.0.tgz",
      "integrity": "sha512-aui4r4TqmTzwaBgcQxHYep8kM8PTjZFufjokObpy35KfFeZ0k9ArquWFZqegQlH24P14t+F0qO0mGTgzlav1yg==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/portal": "^2.2.0",
        "@rc-component/trigger": "^3.0.0",
        "@rc-component/util": "^1.7.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/tree": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/@rc-component/tree/-/tree-1.4.0.tgz",
      "integrity": "sha512-dGsJGDJQedA0BqqVgj3F8BvHXTSZijyhTXdbAdkcx8lynzZkty/CV3Z3LOm/fxz+BCfl3dfGiAQpb7Q5XNvl0Q==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.0.0",
        "@rc-component/util": "^1.11.1",
        "@rc-component/virtual-list": "^1.2.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=10.x"
      },
      "peerDependencies": {
        "react": "*",
        "react-dom": "*"
      }
    },
    "node_modules/@rc-component/tree-select": {
      "version": "1.16.1",
      "resolved": "https://registry.npmjs.org/@rc-component/tree-select/-/tree-select-1.16.1.tgz",
      "integrity": "sha512-a1Oi6EJhqAhdOxxupdJi6fP0RPHMKn5TcfkX2+llaQ4lF4nwfH7b6SCHcnsybaa2s+pk1yZYwVyeOYkDnEBRdg==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/select": "~1.10.0",
        "@rc-component/tree": "~1.4.0",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": "*",
        "react-dom": "*"
      }
    },
    "node_modules/@rc-component/trigger": {
      "version": "3.10.1",
      "resolved": "https://registry.npmjs.org/@rc-component/trigger/-/trigger-3.10.1.tgz",
      "integrity": "sha512-mXlDN0IXdtV8Yqqm8195ECCyrbmfvvfKvwVvSlH0+qvKD6BUF8gRhEjSy0FOcD1+CcDRHgTiX99LoxfQrmh3Cw==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/motion": "^1.3.3",
        "@rc-component/portal": "^2.2.1",
        "@rc-component/resize-observer": "^1.1.2",
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/upload": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/@rc-component/upload/-/upload-1.1.1.tgz",
      "integrity": "sha512-GvYWSKeaJTOxxC5p6+nOSadzfvXA1h8C/iHFPFZX+szH3JUXrvs+DLiW8YUTBgvMh8m63mJeHrlYlJzAlg+pDA==",
      "license": "MIT",
      "dependencies": {
        "@rc-component/util": "^1.11.1",
        "clsx": "^2.1.1"
      },
      "peerDependencies": {
        "react": ">=16.9.0",
        "react-dom": ">=16.9.0"
      }
    },
    "node_modules/@rc-component/util": {
      "version": "1.14.0",
      "resolved": "https://registry.npmjs.org/@rc-component/util/-/util-1.14.0.tgz",
      "integrity": "sha512-qFpkGBCiyN3NNAU+FOnZdcdz7A/rXCg3JdQk+bujUKAExZgRqzf2yy1f4YN63Lwctic5FcK9rgjQ6aWbykqwEw==",
      "license": "MIT",
      "dependencies": {
        "is-mobile": "^5.0.0",
        "react-is": "^19.2.7"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/virtual-list": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@rc-component/virtual-list/-/virtual-list-1.6.0.tgz",
      "integrity": "sha512-aHPlTWVtfgDmzb4oJNrqBW1yeEdFeIS28EoJLQ/dGBgZPRlrQ84c2Rk/Il6JxDUV5P7FDtNFD0aXc7EB22kR3Q==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^8.0.0",
        "@rc-component/resize-observer": "^1.0.1",
        "@rc-component/util": "^1.4.0",
        "clsx": "^2.1.1"
      },
      "engines": {
        "node": ">=8.x"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/@rc-component/virtual-list/node_modules/@babel/runtime": {
      "version": "8.0.8",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-8.0.8.tgz",
      "integrity": "sha512-dEu8nGlRqjsJsvviUUoSMfcRHpwomCiRlXsc2mPfJ79+ffTpDm+JtfUtTMzUrqCApHQnCsVPD3gT1ZT8RgBRCQ==",
      "license": "MIT"
    },
    "node_modules/@rolldown/binding-android-arm-eabi": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm-eabi/-/binding-android-arm-eabi-1.2.15.tgz",
      "integrity": "sha512-aLcgK9gIJ3YRvrrtfSBbRa27F5WrpiTaPulnFpsHPxpUHgFlSgnU4854MHwoRGEBhfRJDWCS2WQ7lIjskE9Olw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-android-arm64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-android-arm64/-/binding-android-arm64-1.2.15.tgz",
      "integrity": "sha512-xD7DdZCrbThKuxNg7ooQmvp07ys4J/pnSEMTG3/OdOWl6daC67m/Q4fL78sRHMxTH/N4fGUbYhcPM0MF5WFHkg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-arm64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-arm64/-/binding-darwin-arm64-1.2.15.tgz",
      "integrity": "sha512-m2WuQ6r0B4OTYxyPpNLtXaMRbRDUbG8YQV2Q3KTdSSK8Th6KHCnC8jVCJt8bvYeSB5WivkkNbc85mKadaSdOxA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-darwin-x64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-darwin-x64/-/binding-darwin-x64-1.2.15.tgz",
      "integrity": "sha512-5RtnsHM36nodM9WbMy+zip0LGS/G+y5wro5RHrpOlr4ac24+1zSi9kiV2MP1myZeZ/ifEHfulQcWjnAXzc2C2A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-freebsd-x64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-freebsd-x64/-/binding-freebsd-x64-1.2.15.tgz",
      "integrity": "sha512-g3l09pyFqhu+135JKkbkwiKGQmwU5hUMUPJ4VdBADvuqR8d33L6H578rh8m7rtxbdp+VmX/+nzI7nvhSZlzpUQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm-gnueabihf": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm-gnueabihf/-/binding-linux-arm-gnueabihf-1.2.15.tgz",
      "integrity": "sha512-nIe3VugI97nGQtspPxDqA4sXMUpeiocKIP/CqpY/u/vgbT+alX+cVxu1C/oVBPKg4feNTmYovE91v4DgXvXNwQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-gnu/-/binding-linux-arm64-gnu-1.2.15.tgz",
      "integrity": "sha512-iTBjXx+B5QSvgI89lJfmqh4wTh8NabR1YZIIN3hNx4zSG0EVfVqkOvLulNpG4251pbd6/IAmZ/LefVk1Y4rPhw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-arm64-musl": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-arm64-musl/-/binding-linux-arm64-musl-1.2.15.tgz",
      "integrity": "sha512-uN26XOnVR7rqQupG3V9oAG2EGGatWjcJHOeDOHUFCh4TBWmP2tHTFoVN13aYbwfm0aHqJAEmcwhAu6sooIjfqQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-ppc64-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-ppc64-gnu/-/binding-linux-ppc64-gnu-1.2.15.tgz",
      "integrity": "sha512-9nWkcdd+H+XhaA3fQIwpHnKIrfx/PQ6rO0pivr78Og07tXlUlctBBJoEYLPfhTmCR/QxEVdn6uPjHV5SymPhdw==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-s390x-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-s390x-gnu/-/binding-linux-s390x-gnu-1.2.15.tgz",
      "integrity": "sha512-Ggh0ciFjLwIusLSLz7LZYEaGdxOAUJXI+Qu5JCbhPJJHEt8vP+IjRATTJheiJsdzzTYgUiHUiw3X1Ea3ZpMBdA==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-gnu": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-gnu/-/binding-linux-x64-gnu-1.2.15.tgz",
      "integrity": "sha512-FHg60rS6DBePAYZ9X9F67x+JObFdmgn6tupA1C/a3B+CufFmTD4mX+e8M75tCiAO3foR/6xwVBI0KQiI7sn/rw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-linux-x64-musl": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-linux-x64-musl/-/binding-linux-x64-musl-1.2.15.tgz",
      "integrity": "sha512-/cvV/7v5VGz/moiz0XKRj2dE8DzsKyhIu1KpOvJGPjRywg3yscON889UGvAe8zfiJLHup7VLjBduoGWi3HusWQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-openharmony-arm64": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-openharmony-arm64/-/binding-openharmony-arm64-1.2.15.tgz",
      "integrity": "sha512-MyzC5Hrv/sm+Z7TSGKP/j8001RO2xQm1zOpCNVL4j0cY/VhBZviludA2YFQ7i4lH6ZAXxQm0lcMdBzM+99mE7w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-arm64-msvc": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-arm64-msvc/-/binding-win32-arm64-msvc-1.2.15.tgz",
      "integrity": "sha512-+PgYiS+AH5omy6L45ZLxybasauJaj3M8buoT83D+nzPmCayXlxUV9hydhciCKVyIg0B/v0BtXPDE1uGqNwCPpg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/binding-win32-x64-msvc": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@rolldown/binding-win32-x64-msvc/-/binding-win32-x64-msvc-1.2.15.tgz",
      "integrity": "sha512-HFZd2QNQYn1JbIi+Hpd7H+r/lkWxcfIu28nirZ6eCn2LafuvmExMlb/P96Sfx5tf7pPArw39IdhmCF8vmV+NhQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.1.tgz",
      "integrity": "sha512-2j9bGt5Jh8hj+vPtgzPtl72j0yRxHAyumoo6TNfAjsLB04UtpSvPbPcDcBMxz7n+9CYB0c1GxQFxYRg2jimqGw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@tailwindcss/node": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/node/-/node-4.3.3.tgz",
      "integrity": "sha512-/T8IKEsf9VTU6tLjgC7+sv2mOPtQxzE2jMw7u4Tt40Tx+QSZxpzh95/H6cMKoja9XuW7iMdLJYBB0o9G1CaAgg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/remapping": "^2.3.5",
        "enhanced-resolve": "^5.24.1",
        "jiti": "^2.7.0",
        "lightningcss": "1.32.0",
        "magic-string": "^0.30.21",
        "source-map-js": "^1.2.1",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz",
      "integrity": "sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz",
      "integrity": "sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/node/node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/@tailwindcss/oxide": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.3.3.tgz",
      "integrity": "sha512-krXjAikiaFSPaK/FkAQT5UTx3VormQaiZ5hBFlJZ9UFQGB/rwg1MZIhHAG9smMQRTdyJxP6Qt5MwMtdyU5FWrA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 20"
      },
      "optionalDependencies": {
        "@tailwindcss/oxide-android-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-x64": "4.3.3",
        "@tailwindcss/oxide-freebsd-x64": "4.3.3",
        "@tailwindcss/oxide-linux-arm-gnueabihf": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-musl": "4.3.3",
        "@tailwindcss/oxide-linux-x64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-x64-musl": "4.3.3",
        "@tailwindcss/oxide-wasm32-wasi": "4.3.3",
        "@tailwindcss/oxide-win32-arm64-msvc": "4.3.3",
        "@tailwindcss/oxide-win32-x64-msvc": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide-android-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz",
      "integrity": "sha512-Y85A2gmPSkl5Ve5qR86GL4HT509cFqQh1aes9p3sSkyTPwt0Pppf3GkwGe4JPACcRYjgJIEhQgM6dBClnr0NYw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.3.3.tgz",
      "integrity": "sha512-BiaWatpBcERQFDlOjRDpIVXuFK5PJez5SA4JMg6VYZdBYU+qKfV/vqjcIs+IYmtitf1xYQZTwXvU/8y4lfZUGw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz",
      "integrity": "sha512-fAeUqfV5ndhxRwai8cXGzdLvul9utWOmeTkv69unv4ZXixjn61Z+p9lCWdwOwA3TYboG3BwdVuN/RDjhBRl0mw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-freebsd-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz",
      "integrity": "sha512-iyf5bV6+wnAlflVeEy7R25dupxTNECZN5QMI0qNT6eT+EgaGdZcKhGkr5SdoaWiLJ3spLqIY9VCeSGrwmtg4kw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm-gnueabihf": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz",
      "integrity": "sha512-aAYUprJAJQWWbRrPvtjdroZ56Md+JM8pMiopS6xGEwDfLhqj+2ver2p4nU4Mb3CRqcMmNBjo8KkUgcxhkzVQGQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz",
      "integrity": "sha512-nDxldcEENOxZRzC2uu9jrutZdAAQtb+8WWDCSnWL1zvBk1+FN+x6MtDViPB5AJMfttVCUhehGWus3XBPgatM/w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz",
      "integrity": "sha512-Md44bD6veX/PC5iyF8cDVnw4HBIANZepRZZ7a8DQOvkfo5WUBwcp6iAuCUz23u+4SUkhJlD3eL7hNdW8ezd/kA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz",
      "integrity": "sha512-tx7us1muwOKAKWao2v/GaafFeQboE6aj88vC6ziN2NCGcRm8gWUhwjzg+YdVB1e4boAtdtma4L43onunI6NS4w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz",
      "integrity": "sha512-SJxX60smvHgasZoBy11dX6YRjXJFovwWBoedhbQPOBzgFWBHGB+TVPWB9BxzR7TTxU8FQZAI2AyiNCMzFm8Img==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz",
      "integrity": "sha512-jx1+rPhY/5Ympkktd656HBWEBLxP7dH06losBLjjf5vgCODXvi9KhtftWcMIwTFIDqBr7cRnQkdLnAG+IOlGvQ==",
      "bundleDependencies": [
        "@napi-rs/wasm-runtime",
        "@emnapi/core",
        "@emnapi/runtime",
        "@tybys/wasm-util",
        "@emnapi/wasi-threads",
        "tslib"
      ],
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.11.1",
        "@emnapi/runtime": "^1.11.1",
        "@emnapi/wasi-threads": "^1.2.2",
        "@napi-rs/wasm-runtime": "^1.1.4",
        "@tybys/wasm-util": "^0.10.2",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-arm64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz",
      "integrity": "sha512-3rc292Ca2ceK6Ulcc/bAVnTs/3nDtoPhyEKlgPv+yQJQi/JS/AMJlqzxvlDacL1nekbrcf6bTqp/jV4qgnPxNQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-x64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz",
      "integrity": "sha512-yJ0pwIVc/nYeGoV02WtsN8KYyLQv7kyI2wDnkezyJlGGjkd4QLwDGAwl47YpPJeuI0M0ObaXGSPjvWDPeTPggw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/vite": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/vite/-/vite-4.3.3.tgz",
      "integrity": "sha512-yYU8cogLeSh/ms2jh8Fj7jaba/EWa7Ja6GoUqYZaraEuCI5YS6ms6ObZgjjedm+jm6XZjdNRWBpPP6Z86oOxcw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@tailwindcss/node": "4.3.3",
        "@tailwindcss/oxide": "4.3.3",
        "tailwindcss": "4.3.3"
      },
      "peerDependencies": {
        "vite": "^5.2.0 || ^6 || ^7 || ^8"
      }
    },
    "node_modules/@tauri-apps/api": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/api/-/api-2.12.4.tgz",
      "integrity": "sha512-pVmfis+4zT8H0Qhp3xPZx9Ju7kpzvA6rr/PSJPyuwfvucTQ8sVt61NYU9KMkK703UFlYadFmjKA4HhybOtN0gg==",
      "license": "Apache-2.0 OR MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/tauri"
      }
    },
    "node_modules/@tauri-apps/cli": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli/-/cli-2.12.4.tgz",
      "integrity": "sha512-JI9bHfudSRJikGOrjbXEm6RjzzvmKuLc+JixB1NE8hNzQkNlCCIC3pTES3uypkR9lxHrsbxzcnSwhI2IxBQphw==",
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "bin": {
        "tauri": "tauri.js"
      },
      "engines": {
        "node": ">= 10"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/tauri"
      },
      "optionalDependencies": {
        "@tauri-apps/cli-darwin-arm64": "2.12.4",
        "@tauri-apps/cli-darwin-x64": "2.12.4",
        "@tauri-apps/cli-linux-arm-gnueabihf": "2.12.4",
        "@tauri-apps/cli-linux-arm64-gnu": "2.12.4",
        "@tauri-apps/cli-linux-arm64-musl": "2.12.4",
        "@tauri-apps/cli-linux-riscv64-gnu": "2.12.4",
        "@tauri-apps/cli-linux-x64-gnu": "2.12.4",
        "@tauri-apps/cli-linux-x64-musl": "2.12.4",
        "@tauri-apps/cli-win32-arm64-msvc": "2.12.4",
        "@tauri-apps/cli-win32-ia32-msvc": "2.12.4",
        "@tauri-apps/cli-win32-x64-msvc": "2.12.4"
      }
    },
    "node_modules/@tauri-apps/cli-darwin-arm64": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-darwin-arm64/-/cli-darwin-arm64-2.12.4.tgz",
      "integrity": "sha512-OxqKSckIkoJ6vX2AjifIJpTasFC0Hbdoo7gEiCmAjauABO3U8m2MRsLWe+QTiBwDx1mIrvgA+rvI7tvDnbnHVg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-darwin-x64": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-darwin-x64/-/cli-darwin-x64-2.12.4.tgz",
      "integrity": "sha512-fz76/77wMMJOaaUN6n3CybRG0P/MTEjjqYk81mGPyhi9m6Ue5T+LWBnJP/AkPooNatBPI2vtulGqomyMJ44lCQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm-gnueabihf": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm-gnueabihf/-/cli-linux-arm-gnueabihf-2.12.4.tgz",
      "integrity": "sha512-K0w8Bof6Lt8QKLAYhRy0yy36ZH5iA/35VuSOvnxyjvCUZ+A3JKsUTlALviH/sVgAlisaPzzmeJSH8XOn4Q2HBA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm64-gnu": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm64-gnu/-/cli-linux-arm64-gnu-2.12.4.tgz",
      "integrity": "sha512-j5rOnjmRUwWrm1oosf0zBYl4D+fqydgUROFCk0hvKZxvbTT8SOERes0QB7rBV/XWNy+kM6pCKzb3oSm2sRglzg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-arm64-musl": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-arm64-musl/-/cli-linux-arm64-musl-2.12.4.tgz",
      "integrity": "sha512-aOue3Fy6Jb7+oWcfAVUsVHfeTybSCt2CZoU06aO4jv4d2Ks/KnaTPwMAK3CLEduGOvBLY1lbBBrIyomqLLH5Sg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-riscv64-gnu": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-riscv64-gnu/-/cli-linux-riscv64-gnu-2.12.4.tgz",
      "integrity": "sha512-Fx6GShY/RvST+t6LMlTHAwd66+1tEaAAGrnU7cysVfaiRP1BKng5Vl6rVmO6rSLOA1Sp1dRzNYM4f0OWQGb7qA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-x64-gnu": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-x64-gnu/-/cli-linux-x64-gnu-2.12.4.tgz",
      "integrity": "sha512-tNzZSa79Z1nRpHxEpQ38lsAFpKlFlYvoXzjTV+lRRn/zSf3wrdUC3wnLcq2XEadchPu4ttK0zivhYzr+XGD19Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-linux-x64-musl": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-linux-x64-musl/-/cli-linux-x64-musl-2.12.4.tgz",
      "integrity": "sha512-jmZ1pr0xEqUhuEusWtt9Yt+GF6lCnGHUmIL+KIknpbjK/XQ2qkhDBhaxK/JMHM2A8dAacVXCxXJk2EXpwhQUfA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-arm64-msvc": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-arm64-msvc/-/cli-win32-arm64-msvc-2.12.4.tgz",
      "integrity": "sha512-fGo8pgEHZxdSYgZ/J98m1usJ7NHKmKbq7k6uT0x1rpOq6Bg2YVzzpaAblWk710f5LHYBJIL5QIFS5IrD+4gmTg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-ia32-msvc": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-ia32-msvc/-/cli-win32-ia32-msvc-2.12.4.tgz",
      "integrity": "sha512-ezl8sQIcjYsye3TUnTH5VcWmWzccZASlQm7hlZt0dYyj1XD0qpVW47u2xYVrIKui0F8uQv/7QGZixdWiClBsbg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@tauri-apps/cli-win32-x64-msvc": {
      "version": "2.12.4",
      "resolved": "https://registry.npmjs.org/@tauri-apps/cli-win32-x64-msvc/-/cli-win32-x64-msvc-2.12.4.tgz",
      "integrity": "sha512-DJhDeCqjLDNMWYFy7ZS8cfeAHX2RK0RbQMLiA3bMVVkXRDJ4NBYiHriGqsUhsr9iG41aTb+dJGkFPmPw1gWwVw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "Apache-2.0 OR MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@types/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz",
      "integrity": "sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.3.0"
      }
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-6.1.2.tgz",
      "integrity": "sha512-fhJNGUdscQa4HkI0xFxwonWyhnVReCPDbXI7FH7jmzpnVCrFQI7PRrhWecO263610vOrs9tr2Y4xcf8uAdFxbw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@rolldown/pluginutils": "^1.0.1"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "peerDependencies": {
        "@rolldown/plugin-babel": "^0.1.7 || ^0.2.0",
        "babel-plugin-react-compiler": "^1.0.0",
        "oxc-transform-react": "^0.152.0",
        "vite": "^8.0.0"
      },
      "peerDependenciesMeta": {
        "@rolldown/plugin-babel": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "oxc-transform-react": {
          "optional": true
        }
      }
    },
    "node_modules/antd": {
      "version": "6.6.8",
      "resolved": "https://registry.npmjs.org/antd/-/antd-6.6.8.tgz",
      "integrity": "sha512-e+hDj/0myqbLBn8UGS0dYhPROAENruNscWe4gzyTnwx7yTip7D72wJUNxtsTplPXwRM1Mo4tXNSgaSb3UmV3RQ==",
      "license": "MIT",
      "dependencies": {
        "@ant-design/colors": "^8.0.1",
        "@ant-design/cssinjs": "^2.1.2",
        "@ant-design/cssinjs-utils": "^2.1.2",
        "@ant-design/fast-color": "^3.0.1",
        "@ant-design/icons": "^6.3.4",
        "@ant-design/react-slick": "~2.0.0",
        "@babel/runtime": "^7.29.2",
        "@rc-component/cascader": "~1.22.0",
        "@rc-component/checkbox": "~2.0.0",
        "@rc-component/collapse": "~1.2.0",
        "@rc-component/color-picker": "~3.1.1",
        "@rc-component/dialog": "~1.10.0",
        "@rc-component/drawer": "~1.4.2",
        "@rc-component/dropdown": "~1.0.3",
        "@rc-component/form": "~1.8.6",
        "@rc-component/image": "~1.10.0",
        "@rc-component/input": "~1.3.1",
        "@rc-component/input-number": "~1.6.2",
        "@rc-component/listy": "~1.2.3",
        "@rc-component/mentions": "~1.12.0",
        "@rc-component/menu": "~1.5.0",
        "@rc-component/motion": "^1.3.3",
        "@rc-component/mutate-observer": "^2.0.1",
        "@rc-component/notification": "~2.1.1",
        "@rc-component/pagination": "~1.4.0",
        "@rc-component/picker": "~1.12.2",
        "@rc-component/progress": "~1.0.3",
        "@rc-component/qrcode": "~2.0.0",
        "@rc-component/rate": "~1.0.1",
        "@rc-component/resize-observer": "^1.1.2",
        "@rc-component/segmented": "~1.4.0",
        "@rc-component/select": "~1.10.1",
        "@rc-component/slider": "~1.1.1",
        "@rc-component/steps": "~1.2.3",
        "@rc-component/switch": "~1.0.3",
        "@rc-component/table": "~1.11.1",
        "@rc-component/tabs": "~1.13.0",
        "@rc-component/tooltip": "~1.5.2",
        "@rc-component/tour": "~2.4.0",
        "@rc-component/tree": "~1.4.0",
        "@rc-component/tree-select": "~1.16.1",
        "@rc-component/trigger": "^3.10.1",
        "@rc-component/upload": "~1.1.1",
        "@rc-component/util": "^1.14.0",
        "clsx": "^2.1.1",
        "dayjs": "^1.11.11",
        "scroll-into-view-if-needed": "^3.1.0",
        "throttle-debounce": "^5.0.2"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/ant-design"
      },
      "peerDependencies": {
        "react": ">=18.0.0",
        "react-dom": ">=18.0.0"
      }
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/compute-scroll-into-view": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/compute-scroll-into-view/-/compute-scroll-into-view-3.1.1.tgz",
      "integrity": "sha512-VRhuHOLoKYOy4UbilLbUzbYg93XLjv2PncJC50EuTWPA3gaja1UjBsUP/D/9/juV3vQFr6XBEzn9KCAHdUvOHw==",
      "license": "MIT"
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "license": "MIT"
    },
    "node_modules/dayjs": {
      "version": "1.11.13",
      "resolved": "https://registry.npmjs.org/dayjs/-/dayjs-1.11.13.tgz",
      "integrity": "sha512-oaMBel6gjolK862uaPQOVTA7q3TZhuSvuMQAAglQDOWYO9A91IrAOUJEyKVlqJlHE0vq5p5UXxzdPfMH/x6xNg==",
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/echarts": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/echarts/-/echarts-6.1.0.tgz",
      "integrity": "sha512-q0yaFPggC9FUdsWH4blavRWFmxdrIodbkoKNAjJudAI6CA9gNPxHtV2RcZNEepZVlk4yvBYkOkbk6HIVpIyHZA==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "2.3.0",
        "zrender": "6.1.0"
      }
    },
    "node_modules/enhanced-resolve": {
      "version": "5.26.0",
      "resolved": "https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.26.0.tgz",
      "integrity": "sha512-9vhedylFonb2YGogzUKX6+Ja72gOJbN1QHAqdrvqLwhdl/QWbKopzoUC9EbQNVsAns/bx/4uyqalrQAoy1IByw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "graceful-fs": "^4.2.4",
        "tapable": "^2.3.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/is-mobile": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/is-mobile/-/is-mobile-5.0.0.tgz",
      "integrity": "sha512-Tz/yndySvLAEXh+Uk8liFCxOwVH6YutuR74utvOcu7I9Di+DwM0mtdPVZNaVvvBUM2OXxne/NhOs1zAO7riusQ==",
      "license": "MIT"
    },
    "node_modules/jiti": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-2.7.0.tgz",
      "integrity": "sha512-AC/7JofJvZGrrneWNaEnJeOLUx+JlGt7tNa0wZiRPT4MY1wmfKjt2+6O2p2uz2+skll8OZZmJMNqeke7kKbNgQ==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jiti": "lib/jiti-cli.mjs"
      }
    },
    "node_modules/json2mq": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/json2mq/-/json2mq-0.2.0.tgz",
      "integrity": "sha512-SzoRg7ux5DWTII9J2qkrZrqV1gt+rTaoufMxEzXbS26Uid0NwaJd123HcoB80TgubEppxxIGdNxCx50fEoEWQA==",
      "license": "MIT",
      "dependencies": {
        "string-convert": "^0.2.0"
      }
    },
    "node_modules/lightningcss": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.33.0.tgz",
      "integrity": "sha512-WkUDrojuJs0xkgGf2udWxa3yGBRxPtxUkB79i6aCZLRgc7PM8fZe9TosfPDcvEpQZbuFASnHYmRLBLUbmLOIIA==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.33.0",
        "lightningcss-darwin-arm64": "1.33.0",
        "lightningcss-darwin-x64": "1.33.0",
        "lightningcss-freebsd-x64": "1.33.0",
        "lightningcss-linux-arm-gnueabihf": "1.33.0",
        "lightningcss-linux-arm64-gnu": "1.33.0",
        "lightningcss-linux-arm64-musl": "1.33.0",
        "lightningcss-linux-x64-gnu": "1.33.0",
        "lightningcss-linux-x64-musl": "1.33.0",
        "lightningcss-win32-arm64-msvc": "1.33.0",
        "lightningcss-win32-x64-msvc": "1.33.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.33.0.tgz",
      "integrity": "sha512-gEpRTalKdosp4Bb8qWtc2iOgE5SeIHlpS1up9bFq2wAyYhl1UdTObYiHe98zEM9SQvSoqQZ1IQD0JNpg3Ml5pg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.33.0.tgz",
      "integrity": "sha512-Sciaz8eenNTKn9b3t7+xr0ipTp9YxKQY4npwQ3mrRuL0BAVHBLyZxofhaKBAVtzmtRZ/zTyo0/to4B1uWG/Djg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.33.0.tgz",
      "integrity": "sha512-Z5UPAxzrjlWNNyGy6i65cJzzvgJ5D3T6wMvs+gWpY9d7qRhANrxqAp6LhxIgZhWEw18RfJTGcRxjuLIBr+m8XQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.33.0.tgz",
      "integrity": "sha512-QQM/Ti/hQajJwCY+RiWuCZ9sdtI/XQk7nDK5vC8kkdwixezOlDgvDx7+RT+QjK6FcFT4MpsuoBnHIo/O3StRRg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.33.0.tgz",
      "integrity": "sha512-N7FVBe6iS24MlM6R/4RBTxGhQheZGs7tiQ9U32UtF75NzP5Q7xWPRqLBCKxlRQRk3rY1jCIPLzx7WzOhuUIRLQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.33.0.tgz",
      "integrity": "sha512-j2v/itmy4HlNxlc6voKXYgBqNi0Ng2LShg4z7GufpEgs05P+2suBVyi9I6YHq5uoVFx9ETin3eCEhLVyXGQnKg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.33.0.tgz",
      "integrity": "sha512-yiO5ROMuYQgXbC60yjZU5CYSFZGKXL0HFATXt9mHJn1+zW55oCtMI9NfcVhYLMFDL7gV7oBPon/EmMMGg2OvtQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.33.0.tgz",
      "integrity": "sha512-ar+Ju7LmcN0Jo4FpL4hpFybwNG9/3A/Br5KW2n2jyODg3MEZXaDYADdemoNS+BDNfMgKvylJLj4S5tyRActuAg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "glibc"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.33.0.tgz",
      "integrity": "sha512-RYiYbkokw0trfKqqzfF55lginwEPrD3OJDfTuJzFs1MK6iFnDenaz1fqLLtX4ITG3OktJQXOeTaw1awrBAlZPw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "libc": [
        "musl"
      ],
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.33.0.tgz",
      "integrity": "sha512-1K+MPfLSFVpphzpdbfkhlWk6wBrTObBzS2T6db10PNOZgR9GoVsAWzwNyuhUYYbTp23j+4RrncfujZ4uAzXvwA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.33.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.33.0.tgz",
      "integrity": "sha512-OlEICDx/Xl0FqSp4bry8zFnCvGpig3Gl4gCquvYwHuqJKEC1+n9NgDniFvqHGmMv1ZkqDJrDqKKSykTDX+ehuA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.7.tgz",
      "integrity": "sha512-qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.31",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.31.tgz",
      "integrity": "sha512-YUbWYCgErwnMAVkjUnYa+KlMBzGpHwiIt/DE7f0G33AuX2LH9UcTk6KgWxd3zRU+pN3u/C+Xl3EnMLM4Hea7Sg==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.20",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/react": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-19.3.1.tgz",
      "integrity": "sha512-QNhWdt7nrgVWWQG58QuGsAR3jv3Hbe4mb4vz7w2csnHavciZJgda1CPNaldF6eVxv90ud3jUXpKlHL69gO38yw==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.1.tgz",
      "integrity": "sha512-Y0bARz53lhEC1NMCASs0/j+faB/zqt3R8hpvg1e8+61ZVJ4UL0UdC4cBbXfZMcIuhrfgeILTLe+ZeBCavQPtKQ==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.1"
      }
    },
    "node_modules/react-is": {
      "version": "19.3.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-19.3.1.tgz",
      "integrity": "sha512-RRieF6IyxQBkcK6pP8xOHprLTPW6QjRkbGdImtqNme+/hYVwCZkLQLdlZGOhUqXwkS9IEynaGvPJtv6XB/cz0Q==",
      "license": "MIT"
    },
    "node_modules/rolldown": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/rolldown/-/rolldown-1.2.15.tgz",
      "integrity": "sha512-6odND+fel5zVw3I4Yc2e69gvguDnX0CAAGiNDZSq4ik5WUcaLrkD2GLuog0XcODbor31hZ5ayEMgVDno+KPV5g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@oxc-project/types": "=0.155.0",
        "@rolldown/pluginutils": "^1.0.0"
      },
      "bin": {
        "rolldown": "bin/cli.mjs"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "optionalDependencies": {
        "@rolldown/binding-android-arm-eabi": "1.2.15",
        "@rolldown/binding-android-arm64": "1.2.15",
        "@rolldown/binding-darwin-arm64": "1.2.15",
        "@rolldown/binding-darwin-x64": "1.2.15",
        "@rolldown/binding-freebsd-x64": "1.2.15",
        "@rolldown/binding-linux-arm-gnueabihf": "1.2.15",
        "@rolldown/binding-linux-arm64-gnu": "1.2.15",
        "@rolldown/binding-linux-arm64-musl": "1.2.15",
        "@rolldown/binding-linux-ppc64-gnu": "1.2.15",
        "@rolldown/binding-linux-s390x-gnu": "1.2.15",
        "@rolldown/binding-linux-x64-gnu": "1.2.15",
        "@rolldown/binding-linux-x64-musl": "1.2.15",
        "@rolldown/binding-openharmony-arm64": "1.2.15",
        "@rolldown/binding-win32-arm64-msvc": "1.2.15",
        "@rolldown/binding-win32-x64-msvc": "1.2.15"
      }
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
      "license": "MIT"
    },
    "node_modules/scroll-into-view-if-needed": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/scroll-into-view-if-needed/-/scroll-into-view-if-needed-3.1.0.tgz",
      "integrity": "sha512-49oNpRjWRvnU8NyGVmUaYG4jtTkNonFZI86MmGRDqBphEK2EXT9gdEUoQPZhuBM8yWHxCWbobltqYO5M4XrUvQ==",
      "license": "MIT",
      "dependencies": {
        "compute-scroll-into-view": "^3.0.2"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz",
      "integrity": "sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==",
      "dev": true,
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/string-convert": {
      "version": "0.2.1",
      "resolved": "https://registry.npmjs.org/string-convert/-/string-convert-0.2.1.tgz",
      "integrity": "sha512-u/1tdPl4yQnPBjnVrmdLo9gtuLvELKsAoRapekWggdiQNvvvum+jYF329d84NAa660KQw7pB2n36KrIKVoXa3A==",
      "license": "MIT"
    },
    "node_modules/stylis": {
      "version": "4.4.0",
      "resolved": "https://registry.npmjs.org/stylis/-/stylis-4.4.0.tgz",
      "integrity": "sha512-5Z9ZpRzfuH6l/UAvCPAPUo3665Nk2wLaZU3x+TLHKVzIz33+sbJqbtrYoC3KD4/uVOr2Zp+L0LySezP9OHV9yA==",
      "license": "MIT"
    },
    "node_modules/tailwindcss": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz",
      "integrity": "sha512-gOhV3P7ufE62QDGg1zVaTgCR+EtPv92k2nIhVcVKcLmxT1sUBsQGhnZj175j+MqRt4zLF7ic+sCYjfhxMxj7YQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tapable": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/tapable/-/tapable-2.3.3.tgz",
      "integrity": "sha512-uxc/zpqFg6x7C8vOE7lh6Lbda8eEL9zmVm/PLeTPBRhh1xCgdWaQ+J1CUieGpIfm2HdtsUpRv+HshiasBMcc6A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/webpack"
      }
    },
    "node_modules/throttle-debounce": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/throttle-debounce/-/throttle-debounce-5.0.2.tgz",
      "integrity": "sha512-B71/4oyj61iNH0KeCamLuE2rmKuTO5byTOSVwECM5FA7TiAiAW+UqTKZ9ERueC4qvgSttUhdmq1mXC3kJqGX7A==",
      "license": "MIT",
      "engines": {
        "node": ">=12.22"
      }
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tslib": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.3.0.tgz",
      "integrity": "sha512-N82ooyxVNm6h1riLCoyS9e3fuJ3AMG2zIZs2Gd1ATcSFjSA23Q0fzjjZeh0jbJvWVDZ0cJT8yaNNaaXHzueNjg==",
      "license": "0BSD"
    },
    "node_modules/typescript": {
      "version": "6.0.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz",
      "integrity": "sha512-y2TvuxSZPDyQakkFRPZHKFm+KKVqIisdg9/CZwm9ftvKXLP8NRWj38/ODjNbr43SsoXqNuAisEf1GdCxqWcdBw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/vite": {
      "version": "8.3.5",
      "resolved": "https://registry.npmjs.org/vite/-/vite-8.3.5.tgz",
      "integrity": "sha512-z1YpjieJ9g0ebTmQpLBv/oq9E3F9EIlOe+7LahW8SrE3LTiG3udBRUXQOlYXP9b+IC2q2phHeVxj9xGlw34OEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "lightningcss": "^1.33.0",
        "picomatch": "^4.0.7",
        "postcss": "^8.5.30",
        "rolldown": "~1.2.14",
        "tinyglobby": "^0.2.17"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^20.19.0 || >=22.12.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^20.19.0 || >=22.12.0",
        "@vitejs/devtools": "^0.7.1 || ^0.8.0",
        "esbuild": "^0.27.0 || ^0.28.0",
        "jiti": ">=1.21.0",
        "less": "^4.0.0",
        "sass": "^1.70.0",
        "sass-embedded": "^1.70.0",
        "stylus": ">=0.54.8",
        "sugarss": "^5.0.0",
        "terser": "^5.16.0",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "@vitejs/devtools": {
          "optional": true
        },
        "esbuild": {
          "optional": true
        },
        "jiti": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/zrender": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/zrender/-/zrender-6.1.0.tgz",
      "integrity": "sha512-oEGMDB6pOP2S6OwRR4PdVv610zrjnA3Bh+JnSG12fYJlBKjtNAoEb5fSUoCOOINlH96I2fU38/A2UpRKs67xYQ==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "tslib": "2.3.0"
      }
    }
  }
}
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\package.json

~~~~~~~~~~~~json
{
  "name": "workmemo",
  "private": true,
  "version": "0.2.5",
  "type": "module",
  "engines": {
    "node": ">=24 <25"
  },
  "scripts": {
    "dev": "vite",
    "bridge:dev": "cargo build --locked --manifest-path src-tauri/Cargo.toml --bin workmemo-browser && node scripts/stage-browser-resources.mjs --debug",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "test:themes": "node --test tests/themes.test.mjs",
    "test:workflow": "node --test tests/workflow.test.mjs",
    "test:history": "node --test tests/history.test.mjs",
    "test": "node --test tests/*.test.mjs",
    "test:web": "node scripts/verify-web-ui.mjs",
    "icons": "node scripts/prepare-icon.mjs",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "@ant-design/icons": "^6.3.4",
    "@ant-design/icons-svg": "^4.6.0",
    "@rc-component/motion": "1.3.3",
    "@tauri-apps/api": "^2",
    "antd": "6.6.8",
    "dayjs": "1.11.13",
    "echarts": "6.1.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@tauri-apps/cli": "^2",
    "@types/react": "^19.1.8",
    "@types/react-dom": "^19.1.6",
    "@vitejs/plugin-react": "^6.0.2",
    "tailwindcss": "^4.3.3",
    "typescript": "~6.0.3",
    "vite": "^8.0.16"
  }
}
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\scripts\collect-licenses.mjs

~~~~~~~~~~~~javascript
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(process.argv[2] ?? join(root, 'docs', 'THIRD-PARTY-LICENSES.txt'));
const metadata = spawnSync('cargo', ['metadata', '--locked', '--format-version', '1', '--filter-platform', 'x86_64-pc-windows-msvc', '--manifest-path', join(root, 'src-tauri', 'Cargo.toml')], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
if (metadata.status !== 0) throw new Error(metadata.stderr || 'Unable to read Cargo metadata');
const sections = ['WorkMemo third-party dependency notices',
  'Collected from locally installed package archives. Cargo entries include build and cross-platform dependencies; not every listed package is linked into the Windows executable.', ''];
let count = 0;
const supplemental = {
  'tauri-plugin@2.7.2': ['tauri-plugin-MIT.txt', 'https://github.com/tauri-apps/tauri/blob/59b63ab500da9859f12d8888c3298bc29bba0b92/LICENSE-MIT'],
  '@ant-design/icons-svg@4.6.0': ['ant-design-icons-MIT.txt', 'https://github.com/ant-design/ant-design-icons/blob/7f2516ac91226d2b41f93b35cb5197c8d94f7189/LICENSE'],
  'is-mobile@5.0.0': ['is-mobile-MIT.txt', 'https://github.com/juliangruber/is-mobile/blob/2708dd8f07d91f354a46b8dff3053abb6b840067/Readme.md'],
  'alloc-stdlib@0.3.0': ['alloc-stdlib-BSD-3-Clause.txt', 'https://github.com/dropbox/rust-alloc-no-stdlib/blob/0a81fd6928ea3b33c8cd484aa4575d50ffb98012/LICENSE'],
  'selectors@0.38.0': ['MPL-2.0.txt', 'https://www.mozilla.org/en-US/MPL/2.0/'],
  'webview2-com@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-sys@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-macros@0.8.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
};
function collect(label, directory, license, repository, supplement, source) {
  sections.push(`=== ${label} ===`, `Declared license: ${license || 'not specified'}`, `Repository: ${typeof repository === 'string' ? repository : repository?.url || 'see package manifest'}`);
  if (source) sections.push(`Package source archive (unmodified): ${source}`);
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /(^|[-_.])(licen[cs]e|copying|notice)([-_.]|$)/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!files.length) {
    if (!supplement) throw new Error(`Missing license text for ${label}; review the package before distribution.`);
    sections.push(`Supplemental license source: ${supplement[1]}`, readFileSync(join(root, 'scripts', 'third-party-licenses', supplement[0]), 'utf8'));
  }
  for (const file of files) sections.push(`--- ${file.name} ---`, readFileSync(join(directory, file.name), 'utf8'));
  sections.push('');
  count += 1;
}
const graph = JSON.parse(metadata.stdout);
const resolved = new Set(graph.resolve.nodes.map((node) => node.id));
for (const pkg of graph.packages.filter((pkg) => pkg.source && resolved.has(pkg.id)).sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`))) {
  collect(`Cargo ${pkg.name} ${pkg.version}`, dirname(pkg.manifest_path), pkg.license, pkg.repository, supplemental[`${pkg.name}@${pkg.version}`], `https://crates.io/api/v1/crates/${pkg.name}/${pkg.version}/download`);
}
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
for (const [path, entry] of Object.entries(lock.packages).filter(([path, entry]) => path && (!entry.dev || path === "node_modules/tailwindcss")).sort()) {
  const directory = join(root, path);
  const pkg = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  collect(`npm ${pkg.name} ${entry.version}`, directory, pkg.license, pkg.repository, supplemental[`${pkg.name}@${entry.version}`]);
}
const audioManifest=JSON.parse(readFileSync(join(root,'src-tauri','sounds','manifest.json'),'utf8'));
sections.push('=== Audio: Kenney Interface Sounds 1.0 ===','Declared license: CC0-1.0',`Source: ${audioManifest.source}`,`Processing: ${audioManifest.processing}`, ...audioManifest.sounds.map(item=>`${item.theme}/${item.cue}: ${item.source} -> ${item.file}`),readFileSync(join(root,'src-tauri','sounds','source','LICENSE.txt'),'utf8'),'');
mkdirSync(dirname(destination), { recursive: true });
const output = `${sections.join('\n')}\n`;
if (!existsSync(destination) || readFileSync(destination, 'utf8') !== output) writeFileSync(destination, output, 'utf8');
console.log(`Collected dependency notices for ${count} package versions.`);
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\scripts\dashboard-fixture.mjs

~~~~~~~~~~~~javascript
// HTTP fixtures for browser verification only. Never connects to a WorkMemo database.
export const keys = ["评测", "质检", "开发", "文档"];
export const fixtureDate = "2026-10-29";
export async function dashboardFixture(page) {
  const names = {
    revision: 1,
    names: { 评测: "评测", 质检: "质检", 开发: "代码开发", 文档: "文档" },
  };
  const presentation = {
    version: 1,
    revision: 0,
    background: null,
    categories: Object.fromEntries(
      keys.map((key, i) => [
        key,
        {
          icon: ["checkSquare", "safety", "code", "note"][i],
          color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
        },
      ]),
    ),
  };
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "评测" : i === 5 ? "质检" : "开发",
    quantity: i < 4 ? [30, 40, 50, 8.5][i] : i === 5 ? 0 : null,
    remark: "隔离测试记录 · 不写入用户数据库",
    start_time: Date.parse(`${fixtureDate}T09:00:00+08:00`) + i * 1800000,
    end_time: Date.parse(`${fixtureDate}T10:00:00+08:00`) + i * 1800000,
    duration_ms: i < 5 ? 1920000 : i === 5 ? 1200000 : 2250000,
    duration_seconds: i < 5 ? 1920 : i === 5 ? 1200 : 2250,
    status: "FINISHED",
    is_paused: true,
    recovery_pending: false,
    settlement_status: i < 4 || i === 5 ? "COMPLETE" : "PENDING",
    source: "MANUAL_START",
    pause_reason: null,
    confirmed_end_time: null,
    last_input_time: null,
    end_reason: "MANUAL",
    legacy_duration_ms: 0,
    revision: 0,
    control_mode: "MANUAL",
    is_demo: false,
    demo_batch: null,
  }));
  const active = {
    ...records[0],
    id: 99,
    category: "开发",
    quantity: null,
    status: "WORKING",
    settlement_status: "IN_PROGRESS",
    end_time: null,
    is_paused: false,
    duration_ms: 25000,
    duration_seconds: 25,
  };
  const state = {
    records,
    active,
    names,
    presentation,
    saveFailure: null,
    queryFailure: false,
    detailFailure: false,
    queryDelay: 0,
    delayFor: null,
    saveDelay: 0,
    saves: 0,
    queries: 0,
    details: 0,
    deletes: 0,
    currentQuery: null,
    requests: [],
    revisions: [],
    segments: [],
    many: false,
  };
  const iso = (date) => date.toISOString().slice(0, 10);
  function range(query) {
    const anchor = query.anchor_date ?? fixtureDate;
    const date = new Date(anchor + "T12:00:00Z");
    let start = query.start_date,
      end = query.end_date;
    if (query.period === "day") start = end = anchor;
    if (query.period === "week") {
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      start = iso(date);
      date.setUTCDate(date.getUTCDate() + 6);
      end = iso(date);
    }
    if (query.period === "month") {
      date.setUTCDate(1);
      start = iso(date);
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      end = iso(date);
    }
    return {
      period: query.period,
      anchor_date: query.period === "custom" ? null : anchor,
      start_date: start,
      end_date: end,
      trend_unit: query.period === "day" ? "hour" : "day",
    };
  }
  function aggregate(rows) {
    return {
      duration_ms: rows.reduce((n, row) => n + row.duration_ms, 0),
      quantity: rows
        .filter((row) => row.settlement_status === "COMPLETE")
        .reduce((n, row) => n + row.quantity, 0),
      records: rows.length,
      pending: rows.filter((row) => row.settlement_status === "PENDING").length,
      complete: rows.filter((row) => row.settlement_status === "COMPLETE")
        .length,
    };
  }
  function data(query) {
    const resolved = range(query);
    const extras = state.many
      ? Array.from({ length: 52 }, (_, i) => ({
          ...state.records[0],
          id: 200 + i,
          quantity: 1,
        }))
      : [];
    const demo = {
      ...state.records[0],
      id: 500,
      is_demo: true,
      demo_batch: "isolated-browser-fixture",
      quantity: 999,
    };
    const filtered = [
      ...state.records,
      ...extras,
      ...(state.active ? [state.active] : []),
      demo,
    ].filter((row) => {
      const date = iso(new Date(row.start_time + 8 * 3600000));
      return (
        (query.scope === "all" || row.is_demo === (query.scope === "demo")) &&
        (!resolved.start_date || date >= resolved.start_date) &&
        (!resolved.end_date || date <= resolved.end_date) &&
        (!query.category || row.category === query.category) &&
        (query.status === "all" ||
          (query.status === "working" && row.status !== "FINISHED") ||
          (query.status === "pending" && row.settlement_status === "PENDING") ||
          (query.status === "complete" && row.settlement_status === "COMPLETE"))
      );
    });
    const ended = filtered.filter((row) => row.status === "FINISHED");
    const categories = keys
      .filter((key) => !query.category || key === query.category)
      .map((category) => ({
        category,
        ...aggregate(ended.filter((row) => row.category === category)),
      }));
    const buckets =
      query.period === "day"
        ? Array.from(
            { length: 24 },
            (_, hour) => String(hour).padStart(2, "0") + ":00",
          )
        : query.period === "custom"
          ? [fixtureDate]
          : Array.from({ length: 32 }, (_, i) => {
              const date = new Date(resolved.start_date + "T12:00:00Z");
              date.setUTCDate(date.getUTCDate() + i);
              return iso(date);
            }).filter((date) => date <= resolved.end_date);
    const trend = buckets.map((date) => ({
      date,
      ...aggregate(
        ended.filter((row) =>
          query.period === "day"
            ? new Date(row.start_time + 8 * 3600000).getUTCHours() ===
              Number(date.slice(0, 2))
            : iso(new Date(row.start_time + 8 * 3600000)) === date,
        ),
      ),
    }));
    const pages = Math.max(1, Math.ceil(filtered.length / 50)),
      current = Math.min(query.page, pages);
    return {
      range: resolved,
      totals: aggregate(ended),
      categories,
      trend,
      monthly: false,
      calendar: ended.length
        ? [[fixtureDate, aggregate(ended).duration_ms]]
        : [],
      records: filtered.slice((current - 1) * 50, current * 50),
      record_count: filtered.length,
      page: current,
      pages,
      scope: query.scope,
    };
  }
  state.data = data;
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split("/").at(-1);
    const body = route.request().postData()
      ? route.request().postDataJSON()
      : null;
    state.requests.push({ endpoint, body });
    if (endpoint === "meta")
      return route.fulfill({
        json: {
          version: "0.2.5 · 隔离验收",
          category_names: names,
          presentation,
          active: state.active,
        },
      });
    if (endpoint === "query") {
      state.queries++;
      state.currentQuery = body;
      const result = data(body),
        failure = state.queryFailure;
      const delay = state.delayFor ? state.delayFor(body) : state.queryDelay;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return failure
        ? route.fulfill({ status: 500, json: { error: "隔离统计读取失败" } })
        : route.fulfill({ json: result });
    }
    if (endpoint === "detail") {
      state.details++;
      if (state.detailFailure)
        return route.fulfill({
          status: 500,
          json: { error: "隔离详情读取失败" },
        });
      const record = [
        ...state.records,
        ...(state.active ? [state.active] : []),
      ].find((row) => row.id === body.id);
      return route.fulfill({
        json: { record, segments: state.segments, revisions: state.revisions },
      });
    }
    if (endpoint === "save") {
      state.saves++;
      if (state.saveDelay)
        await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (state.saveFailure)
        return route.fulfill({
          status: state.saveFailure,
          json: {
            error:
              state.saveFailure === 409
                ? "记录已被其他窗口修改"
                : "隔离保存失败",
          },
        });
      const row = state.records.find((row) => row.id === body.id);
      const before = structuredClone(row);
      Object.assign(row, body, {
        revision: row.revision + 1,
        settlement_status: "COMPLETE",
      });
      state.revisions.push({
        revision: row.revision,
        changed_at: Date.now(),
        before,
        after: structuredClone(row),
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (endpoint === "delete") {
      state.deletes++;
      state.records = state.records.filter((row) => row.id !== body.id);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      status: 404,
      json: { error: "No fixture endpoint" },
    });
  });
  return state;
}
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\scripts\third-party-licenses\README.md

~~~~~~~~~~~~markdown
# 许可文本来源

用于补充锁定依赖包未随 crate 归档提供的根目录许可文件；不为 WorkMemo 自身选择许可。

- alloc-stdlib-BSD-3-Clause.txt：Dropbox 上游提交 0a81fd6928ea3b33c8cd484aa4575d50ffb98012 的 LICENSE，适用于 alloc-stdlib 0.3.0。
  https://github.com/dropbox/rust-alloc-no-stdlib/blob/0a81fd6928ea3b33c8cd484aa4575d50ffb98012/LICENSE
- webview2-rs-MIT.txt：上游提交 edc2caf886175ccaebe86078c9cfe1ae2a187328 的 LICENSE，适用于当前锁定的 webview2-com 0.39.1、webview2-com-sys 0.39.1 和 webview2-com-macros 0.8.1。
  https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE
- MPL-2.0.txt：标准 MPL 2.0 许可全文，从本地 cssparser 0.37.0 的 LICENSE 完整复制，补充 selectors 0.38.0。官方文本：https://www.mozilla.org/en-US/MPL/2.0/

collect-licenses.mjs 按明确的包名与版本匹配补充；依赖升级后需要重新核对，不自动套用旧版权文本。每个 Cargo 条目同时提供相应版本的 crates.io 源码归档地址；没有修改第三方依赖源码。

- tauri-plugin-MIT.txt：tauri-plugin 2.7.2 的 crate 元数据声明 Apache-2.0 OR MIT，使用其 .cargo_vcs_info.json 对应 Tauri 官方提交 59b63ab500da9859f12d8888c3298bc29bba0b92 的 LICENSE-MIT 原文。
  https://github.com/tauri-apps/tauri/blob/59b63ab500da9859f12d8888c3298bc29bba0b92/LICENSE-MIT
~~~~~~~~~~~~

## NEW FILE — E:\WorkMemo\scripts\third-party-licenses\tauri-plugin-MIT.txt

~~~~~~~~~~~~text
MIT License

Copyright (c) 2017 - Present Tauri Apps Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\src-tauri\Cargo.lock

~~~~~~~~~~~~text
# This file is automatically @generated by Cargo.
# It is not intended for manual editing.
version = 4

[[package]]
name = "adler2"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "320119579fcad9c21884f5c4861d16174d0e06250625266f50fe6898340abefa"

[[package]]
name = "aho-corasick"
version = "1.1.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c982642fa9e8606056828ee9a8505737230110bb1099153c79efe865c59d12ba"
dependencies = [
 "memchr",
]

[[package]]
name = "alloc-no-stdlib"
version = "3.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c2fb6cfd47bf496ff64095c20eaba0c201404ee38714d4142fcfa1dc334fcc7a"

[[package]]
name = "alloc-stdlib"
version = "0.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b5c1865780388bfa186411ab5f247819487fc4864c6e9c3106611fa347586e1"
dependencies = [
 "alloc-no-stdlib",
]

[[package]]
name = "android_system_properties"
version = "0.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ae221649c9976a6f6c56ae1facf410f3ddb33cc661c4b7b61020a912d4237fbc"
dependencies = [
 "libc",
]

[[package]]
name = "anyhow"
version = "1.0.104"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "330a5ed07fa54e4702c9d6c4174f74427fc0ef6e214bbd677ae50a5099946470"

[[package]]
name = "ascii"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d92bec98840b8f03a5ff5413de5293bfcd8bf96467cf5452609f939ec6f5de16"

[[package]]
name = "async-broadcast"
version = "0.7.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "435a87a52755b8f27fcf321ac4f04b2802e337c8c4872923137471ec39c37532"
dependencies = [
 "event-listener",
 "event-listener-strategy",
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "async-channel"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "924ed96dd52d1b75e9c1a3e6275715fd320f5f9439fb5a4a11fa51f4221158d2"
dependencies = [
 "concurrent-queue",
 "event-listener-strategy",
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "async-executor"
version = "1.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c96bf972d85afc50bf5ab8fe2d54d1586b4e0b46c97c50a0c9e71e2f7bcd812a"
dependencies = [
 "async-task",
 "concurrent-queue",
 "fastrand",
 "futures-lite",
 "pin-project-lite",
 "slab",
]

[[package]]
name = "async-io"
version = "2.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "456b8a8feb6f42d237746d4b3e9a178494627745c3c56c6ea55d92ba50d026fc"
dependencies = [
 "autocfg",
 "cfg-if",
 "concurrent-queue",
 "futures-io",
 "futures-lite",
 "parking",
 "polling",
 "rustix",
 "slab",
 "windows-sys 0.61.2",
]

[[package]]
name = "async-lock"
version = "3.4.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "290f7f2596bd5b78a9fec8088ccd89180d7f9f55b94b0576823bbbdc72ee8311"
dependencies = [
 "event-listener",
 "event-listener-strategy",
 "pin-project-lite",
]

[[package]]
name = "async-process"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fc50921ec0055cdd8a16de48773bfeec5c972598674347252c0399676be7da75"
dependencies = [
 "async-channel",
 "async-io",
 "async-lock",
 "async-signal",
 "async-task",
 "blocking",
 "cfg-if",
 "event-listener",
 "futures-lite",
 "rustix",
]

[[package]]
name = "async-recursion"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4f8abc12baad266b1c8cec146854c195b5864b4221d4b2ca7296a7ae82d9e451"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "async-signal"
version = "0.2.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "52b5aaafa020cf5053a01f2a60e8ff5dccf550f0f77ec54a4e47285ac2bab485"
dependencies = [
 "async-io",
 "async-lock",
 "atomic-waker",
 "cfg-if",
 "futures-core",
 "futures-io",
 "rustix",
 "signal-hook-registry",
 "slab",
 "windows-sys 0.61.2",
]

[[package]]
name = "async-task"
version = "4.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8b75356056920673b02621b35afd0f7dda9306d03c79a30f5c56c44cf256e3de"

[[package]]
name = "async-trait"
version = "0.1.92"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "82f6aeea286b8eb4dd3431a1be1b59d290ace00f5bfd8e2a159bc2a05e2c1667"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "atk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "241b621213072e993be4f6f3a9e4b45f65b7e6faad43001be957184b7bb1824b"
dependencies = [
 "atk-sys",
 "glib",
 "libc",
]

[[package]]
name = "atk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c5e48b684b0ca77d2bbadeef17424c2ea3c897d44d566a1617e7e8f30614d086"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "atomic-waker"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1505bd5d3d116872e7271a6d4e16d81d0c8570876c8de68093a09ac269d8aac0"

[[package]]
name = "auto-launch"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1f012b8cc0c850f34117ec8252a44418f2e34a2cf501de89e29b241ae5f79471"
dependencies = [
 "dirs 4.0.0",
 "thiserror 1.0.69",
 "winreg 0.10.1",
]

[[package]]
name = "autocfg"
version = "1.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f2032f911046de80f0a198e0901378627c33f59ea0ac00e363d481118bd70a53"

[[package]]
name = "base64"
version = "0.21.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9d297deb1925b89f2ccc13d7635fa0714f12c87adce1c75356b39ca9b7178567"

[[package]]
name = "base64"
version = "0.23.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ac07cdecf99051d9a5238b80f35af32cdeba5b336e55d957b318b50137e18da5"

[[package]]
name = "bit-set"
version = "0.8.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "08807e080ed7f9d5433fa9b275196cfc35414f66a0c79d864dc51a0d825231a3"
dependencies = [
 "bit-vec",
]

[[package]]
name = "bit-vec"
version = "0.8.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e764a1d40d510daf35e07be9eb06e75770908c27d411ee6c92109c9840eaaf7"

[[package]]
name = "bitflags"
version = "1.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bef38d45163c2f1dde094a7dfd33ccf595c92905c8f8f4fdc18d06fb1037718a"

[[package]]
name = "bitflags"
version = "2.13.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ded4057c258ba199e2d26386d3af3780957ecaee6c4ef4041c6b4b8b97c0b06"
dependencies = [
 "serde_core",
]

[[package]]
name = "block-buffer"
version = "0.10.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3078c7629b62d3f0439517fa394996acacc5cbc91c5a20d8c658e77abd503a71"
dependencies = [
 "generic-array",
]

[[package]]
name = "block2"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cdeb9d870516001442e364c5220d3574d2da8dc765554b4a617230d33fa58ef5"
dependencies = [
 "objc2",
]

[[package]]
name = "blocking"
version = "1.7.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a70e4329df6cb94385eed412ec92375c3cdd8a6e502493d1229b6414e4036dfa"
dependencies = [
 "async-channel",
 "async-task",
 "futures-io",
 "futures-lite",
 "piper",
]

[[package]]
name = "brotli"
version = "9.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6737ce8b81460bf9407909f73ff50bf13f7cb8577e1e76715f57ed0eba58ba44"
dependencies = [
 "alloc-no-stdlib",
 "alloc-stdlib",
 "brotli-decompressor",
]

[[package]]
name = "brotli-decompressor"
version = "6.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "34c6783f42c21c952ad7112b354f0ba2f10760e9decea5b1b60523d6e270faaf"
dependencies = [
 "alloc-no-stdlib",
 "alloc-stdlib",
]

[[package]]
name = "bs58"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bf88ba1141d185c399bee5288d850d63b8369520c1eafc32a0430b5b6c287bf4"
dependencies = [
 "tinyvec",
]

[[package]]
name = "bumpalo"
version = "3.20.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "72f5acc6cb2ba439de613abc23857ec3d78374d8ed5ac84e9d11336e87da8649"

[[package]]
name = "bytemuck"
version = "1.25.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "95832e849adfb21180ccb6826a99da14e5d266ae5c2e668e1602cf234f153797"

[[package]]
name = "byteorder"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fd0f2584146f6f2ef48085050886acf353beff7305ebd1ae69500e27c67f64b"

[[package]]
name = "byteorder-lite"
version = "0.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f1fe948ff07f4bd06c30984e69f5b4899c516a3ef74f34df92a2df2ab535495"

[[package]]
name = "bytes"
version = "1.12.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fc652a48c352aef3ea3aed32080501cf3ef6ed5da78602a020c991775b0aff04"
dependencies = [
 "serde",
]

[[package]]
name = "cairo-rs"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8ca26ef0159422fb77631dc9d17b102f253b876fe1586b03b803e63a309b4ee2"
dependencies = [
 "bitflags 2.13.2",
 "cairo-sys-rs",
 "glib",
 "libc",
 "once_cell",
 "thiserror 1.0.69",
]

[[package]]
name = "cairo-sys-rs"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "685c9fa8e590b8b3d678873528d83411db17242a73fccaed827770ea0fedda51"
dependencies = [
 "glib-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "camino"
version = "1.2.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bbbad30e4b4c14a39e3cc8aed085a12a327257c316619c93581e017bc52be591"
dependencies = [
 "serde_core",
]

[[package]]
name = "cargo-platform"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e35af189006b9c0f00a064685c727031e3ed2d8020f7ba284d78cc2671bd36ea"
dependencies = [
 "serde",
]

[[package]]
name = "cargo_metadata"
version = "0.19.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "dd5eb614ed4c27c5d706420e4320fbe3216ab31fa1c33cd8246ac36dae4479ba"
dependencies = [
 "camino",
 "cargo-platform",
 "semver",
 "serde",
 "serde_json",
 "thiserror 2.0.21",
]

[[package]]
name = "cargo_toml"
version = "1.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "82f4b26e751e711a5302649417f2da046dce6391b2ea30a4820f37462314f0b9"
dependencies = [
 "semver",
 "serde",
 "toml 1.1.8+spec-1.1.0",
]

[[package]]
name = "cc"
version = "1.10.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "86e055fa6e3e40ad6187ba25b6855eeb635d5271f8e0f0e1e9a5826b8d75bea0"
dependencies = [
 "find-msvc-tools",
 "shlex",
]

[[package]]
name = "cesu8"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6d43a04d8753f35258c91f8ec639f792891f748a1edbd759cf1dcea3382ad83c"

[[package]]
name = "cfb"
version = "0.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a347dcabdae9c31b0825fd6a8bed285ec9c2acb89c47827126d52fa4f59cece3"
dependencies = [
 "fnv",
 "uuid",
 "web-time",
]

[[package]]
name = "cfg-expr"
version = "0.15.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d067ad48b8650848b989a59a86c6c36a995d02d2bf778d45c3c5d57bc2718f02"
dependencies = [
 "smallvec",
 "target-lexicon",
]

[[package]]
name = "cfg-if"
version = "1.0.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4e7648175b45a9a48536d676f68d918270699102aa8dab5496df06904c914600"

[[package]]
name = "chrono"
version = "0.4.45"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1aa79e62e7697b8e29b513a68abacf485adcd1fe8284a4316c5ae868e6633327"
dependencies = [
 "iana-time-zone",
 "num-traits",
 "serde",
 "windows-link",
]

[[package]]
name = "chunked_transfer"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e4de3bc4ea267985becf712dc6d9eed8b04c953b3fcfb339ebc87acd9804901"

[[package]]
name = "combine"
version = "4.6.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4356eba6976435498d05a311ee9fc486da3bc81c200d3f0d7dd9703b41913f92"
dependencies = [
 "bytes",
 "memchr",
]

[[package]]
name = "concurrent-queue"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ca0197aee26d1ae37445ee532fefce43251d24cc7c166799f4d46817f1d3973"
dependencies = [
 "crossbeam-utils",
]

[[package]]
name = "cookie"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1a373e3602691c3cdea496d2f0ee5935151e6168fe87739483c463db1b2f2f87"
dependencies = [
 "time",
 "version_check",
]

[[package]]
name = "core-foundation"
version = "0.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2a6cd9ae233e7f62ba4e9353e81a88df7fc8a5987b8d445b4d90c879bd156f6"
dependencies = [
 "core-foundation-sys",
 "libc",
]

[[package]]
name = "core-foundation-sys"
version = "0.8.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "773648b94d0e5d620f64f280777445740e61fe701025087ec8b57f45c791888b"

[[package]]
name = "core-graphics"
version = "0.25.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "064badf302c3194842cf2c5d61f56cc88e54a759313879cdf03abdd27d0c3b97"
dependencies = [
 "bitflags 2.13.2",
 "core-foundation",
 "core-graphics-types",
 "foreign-types",
 "libc",
]

[[package]]
name = "core-graphics-types"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3d44a101f213f6c4cdc1853d4b78aef6db6bdfa3468798cc1d9912f4735013eb"
dependencies = [
 "bitflags 2.13.2",
 "core-foundation",
 "libc",
]

[[package]]
name = "cpufeatures"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "59ed5838eebb26a2bb2e58f6d5b5316989ae9d08bab10e0e6d103e656d1b0280"
dependencies = [
 "libc",
]

[[package]]
name = "crc32fast"
version = "1.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0ba106e844045ddc02c20768ac4b0b7cb45f2cc2ecbd833ac9f5dacb183c2055"
dependencies = [
 "cfg-if",
]

[[package]]
name = "crossbeam-channel"
version = "0.5.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "98b0cc327b5bc766e7fda9c9260cc0fa81b43a8e240440422dff70788e3f9ef1"
dependencies = [
 "crossbeam-utils",
]

[[package]]
name = "crossbeam-utils"
version = "0.8.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a31eee39dddec8330830986fcd7625edb5a24ec90ea038215273bbc3adb08ac6"

[[package]]
name = "crypto-common"
version = "0.1.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "78c8292055d1c1df0cce5d180393dc8cce0abec0a7102adb6c7b1eef6016d60a"
dependencies = [
 "generic-array",
 "typenum",
]

[[package]]
name = "cssparser"
version = "0.37.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8c9cdaae01d5ed7882b04d795e7f752f46ff52d2fa3b50a20d28c464510bba98"
dependencies = [
 "cssparser-macros",
 "dtoa-short",
 "itoa",
 "phf",
 "smallvec",
]

[[package]]
name = "cssparser-macros"
version = "0.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d045de693cb712d0b22c6a64be5b953f67b3ce00ab5ad3dd5d8b441886ab8e1a"
dependencies = [
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "ctor"
version = "1.0.13"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "914a755b7c2d4af2bdcff7ce1739e2db9a1b81a9b07123d8015786ae03c0980d"

[[package]]
name = "darling"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed17f5901b6630b993ca003def43f2f8ef4014fc13b047b57aad617ff32bc2ec"
dependencies = [
 "darling_core",
 "darling_macro",
]

[[package]]
name = "darling_core"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6837e2cf7485aaae18f86181d2f0e9a7ed297a025e220aeabf63fdebd3a2ddff"
dependencies = [
 "ident_case",
 "proc-macro2",
 "quote",
 "strsim",
 "syn 3.0.9",
]

[[package]]
name = "darling_macro"
version = "0.24.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2ac7135c3ef02b2f7833bbeb1be5ba7f966dcde8a87c6b87f65a778d71a02785"
dependencies = [
 "darling_core",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "dbus"
version = "0.9.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ab69f03cc8c4340c9c8e315114e1658e6775a9b16a04357973aa21cec22b32e"
dependencies = [
 "libc",
 "libdbus-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "defmt"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4a0795ac740cb54d7b3775c9c17345f6aaecf884c01733b39d6017738e0e3e1"
dependencies = [
 "bitflags 1.3.2",
 "defmt-macros",
]

[[package]]
name = "defmt-macros"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "840bb056bd99c495c9188198a258ab787c79f306d864db3e6e8451442d6d8366"
dependencies = [
 "defmt-parser",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "defmt-parser"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "71958f69fb2de856c5dd51ac9377e986ca1aa5919f931bf5395a807277f889a0"
dependencies = [
 "thiserror 2.0.21",
]

[[package]]
name = "deranged"
version = "0.5.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9e9de72ce2ad1f90dc62fa25f0f430ef85eb4b0d8fa0be4f30373bc40a21d28e"
dependencies = [
 "serde_core",
]

[[package]]
name = "derive_more"
version = "2.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d751e9e49156b02b44f9c1815bcb94b984cdcc4396ecc32521c739452808b134"
dependencies = [
 "derive_more-impl",
]

[[package]]
name = "derive_more-impl"
version = "2.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "799a97264921d8623a957f6c3b9011f3b5492f557bbb7a5a19b7fa6d06ba8dcb"
dependencies = [
 "proc-macro2",
 "quote",
 "rustc_version",
 "syn 2.0.119",
]

[[package]]
name = "digest"
version = "0.10.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9ed9a281f7bc9b7576e61468ba615a66a5c8cfdff42420a70aa82701a3b1e292"
dependencies = [
 "block-buffer",
 "crypto-common",
]

[[package]]
name = "dirs"
version = "4.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca3aa72a6f96ea37bbc5aa912f6788242832f75369bdfdadcb0e38423f100059"
dependencies = [
 "dirs-sys 0.3.7",
]

[[package]]
name = "dirs"
version = "7.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d57d423b3c82e89b9a24ca3091fee61f456a26edbd28d26c65906f4bc1dcd8f"
dependencies = [
 "dirs-sys 0.5.0",
]

[[package]]
name = "dirs-sys"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1b1d1d91c932ef41c0f2663aa8b0ca0342d444d842c06914aa0a7e352d0bada6"
dependencies = [
 "libc",
 "redox_users 0.4.6",
 "winapi",
]

[[package]]
name = "dirs-sys"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e01a3366d27ee9890022452ee61b2b63a67e6f13f58900b651ff5665f0bb1fab"
dependencies = [
 "libc",
 "option-ext",
 "redox_users 0.5.3",
 "windows-sys 0.61.2",
]

[[package]]
name = "dispatch2"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e0e367e4e7da84520dedcac1901e4da967309406d1e51017ae1abfb97adbd38"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "libc",
 "objc2",
]

[[package]]
name = "displaydoc"
version = "0.2.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6232dd377dcc64799954cbd3a9bb882e9cdc1308ccd87b1c098f1fb2eaf82a8"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "dlopen2"
version = "0.8.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e2c5bd4158e66d1e215c49b837e11d62f3267b30c92f1d171c4d3105e3dc4d4"
dependencies = [
 "dlopen2_derive",
 "libc",
 "once_cell",
 "winapi",
]

[[package]]
name = "dlopen2_derive"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0fbbb781877580993a8707ec48672673ec7b81eeba04cfd2310bd28c08e47c8f"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "dom_query"
version = "0.28.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fac5fca71e65e94cc718a6e2af65d6e0f9c6027751c2aa562fbb5087fda639bc"
dependencies = [
 "bit-set",
 "cssparser",
 "foldhash",
 "html5ever",
 "precomputed-hash",
 "selectors",
 "tendril",
]

[[package]]
name = "dpi"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d8b14ccef22fc6f5a8f4d7d768562a182c04ce9a3b3157b91390b52ddfdf1a76"
dependencies = [
 "serde",
]

[[package]]
name = "dtoa"
version = "1.0.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4c3cf4824e2d5f025c7b531afcb2325364084a16806f6d47fbc1f5fbd9960590"

[[package]]
name = "dtoa-short"
version = "0.3.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cd1511a7b6a56299bd043a9c167a6d2bfb37bf84a6dfceaba651168adfb43c87"
dependencies = [
 "dtoa",
]

[[package]]
name = "dunce"
version = "1.0.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92773504d58c093f6de2459af4af33faa518c13451eb8f2b5698ed3d36e7c813"

[[package]]
name = "dyn-clone"
version = "1.0.20"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d0881ea181b1df73ff77ffaaf9c7544ecc11e82fba9b5f27b262a3c73a332555"

[[package]]
name = "embed-resource"
version = "3.0.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6168487b5e7eb2673e6efe1200b1848016e436a6ca0b8031bf04bd9d493a249f"
dependencies = [
 "cc",
 "memchr",
 "rustc_version",
 "toml 1.1.8+spec-1.1.0",
 "vswhom",
 "winreg 0.56.0",
]

[[package]]
name = "embed_plist"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ef6b89e5b37196644d8796de5268852ff179b44e96276cf4290264843743bb7"

[[package]]
name = "endi"
version = "1.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "66b7e2430c6dff6a955451e2cfc438f09cea1965a9d6f87f7e3b90decc014099"

[[package]]
name = "enumflags2"
version = "0.7.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1027f7680c853e056ebcec683615fb6fbbc07dbaa13b4d5d9442b146ded4ecef"
dependencies = [
 "enumflags2_derive",
 "serde",
]

[[package]]
name = "enumflags2_derive"
version = "0.7.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67c78a4d8fdf9953a5c9d458f9efe940fd97a0cab0941c075a813ac594733827"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "equivalent"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "00d174d5400e5e8fd687ad1049e2f578285fa914201b1af7e8b112a4546bd826"

[[package]]
name = "erased-serde"
version = "0.4.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e59b668157f32d3459d4bd634861a06ffa2503a461ca5f0916b9f0252605e66"
dependencies = [
 "serde",
 "serde_core",
 "typeid",
]

[[package]]
name = "errno"
version = "0.3.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "39cab71617ae0d63f51a36d69f866391735b51691dbda63cf6f96d042b63efeb"
dependencies = [
 "libc",
 "windows-sys 0.61.2",
]

[[package]]
name = "event-listener"
version = "5.4.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5a23add41df1562121a9393cb065eab5146a1242410f23a644851e90cfd669d2"
dependencies = [
 "parking",
 "pin-project-lite",
]

[[package]]
name = "event-listener-strategy"
version = "0.5.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8be9f3dfaaffdae2972880079a491a1a8bb7cbed0b8dd7a347f668b4150a3b93"
dependencies = [
 "event-listener",
 "pin-project-lite",
]

[[package]]
name = "fallible-iterator"
version = "0.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2acce4a10f12dc2fb14a218589d4f1f62ef011b2d0cc4b3cb1bba8e94da14649"

[[package]]
name = "fallible-streaming-iterator"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7360491ce676a36bf9bb3c56c1aa791658183a54d2744120f27285738d90465a"

[[package]]
name = "fastrand"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "da7c62ceae207dd37ea5b845da6a0696c799f85e97da1ab5b7910be3c1c80223"

[[package]]
name = "fdeflate"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1e6853b52649d4ac5c0bd02320cddc5ba956bdb407c4b75a2c6b75bf51500f8c"
dependencies = [
 "simd-adler32",
]

[[package]]
name = "field-offset"
version = "0.3.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38e2275cc4e4fc009b0669731a1e5ab7ebf11f469eaede2bab9309a5b4d6057f"
dependencies = [
 "memoffset",
 "rustc_version",
]

[[package]]
name = "find-msvc-tools"
version = "0.1.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1c66915cc5391097de7a2b0b972e8505aa33c0df401fd3a6811dbdb32881ba48"

[[package]]
name = "flate2"
version = "1.1.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e634e2e0ebac1ee034020da1ca582e17ffe4e0f5e985823721e168928136dcb"
dependencies = [
 "crc32fast",
 "miniz_oxide 0.9.1",
 "zlib-rs",
]

[[package]]
name = "fnv"
version = "1.0.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f9eec918d3f24069decb9af1554cad7c880e2da24a9afd88aca000531ab82c1"

[[package]]
name = "foldhash"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "77ce24cb58228fbb8aa041425bb1050850ac19177686ea6e0f41a70416f56fdb"

[[package]]
name = "foreign-types"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d737d9aa519fb7b749cbc3b962edcf310a8dd1f4b67c91c4f83975dbdd17d965"
dependencies = [
 "foreign-types-macros",
 "foreign-types-shared",
]

[[package]]
name = "foreign-types-macros"
version = "0.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ea5190182e6915eb873ddbc16e23b711b6eb1f9c00a0d0a3a91b5f6228475225"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "foreign-types-shared"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "aa9a19cbb55df58761df49b23516a86d432839add4af60fc256da840f66ed35b"

[[package]]
name = "form_urlencoded"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cb4cb245038516f5f85277875cdaa4f7d2c9a0fa0468de06ed190163b1581fcf"
dependencies = [
 "percent-encoding",
]

[[package]]
name = "futures-channel"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b1f9e3d69d39e4862ffed03ed071a76f9a13ba1d9109d355b0f0aa6b15e393c4"
dependencies = [
 "futures-core",
]

[[package]]
name = "futures-core"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92d699e522242e69e3003b94ecc1f960f3a5e015aa7c5d7486e65ad01dd94f5e"

[[package]]
name = "futures-executor"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "031b47cf1a3c6cc8bc2fc76cd437f521619387907d469316e7c0bc278f1f5432"
dependencies = [
 "futures-core",
 "futures-task",
 "futures-util",
]

[[package]]
name = "futures-io"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "53c0fa8157de1303bfffdaa1cc2a673bfffb60102f76b0ef4441659124373fed"

[[package]]
name = "futures-lite"
version = "2.6.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f78e10609fe0e0b3f4157ffab1876319b5b0db102a2c60dc4626306dc46b44ad"
dependencies = [
 "fastrand",
 "futures-core",
 "futures-io",
 "parking",
 "pin-project-lite",
]

[[package]]
name = "futures-macro"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9fb9654ba8355388abeb8dcb4fc62f511300867002afc858860463bdd9fe0c44"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "futures-sink"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1944426bf7d03f1d14f708785e4b33efd750b36d48a157b836b3efc15ede8e1d"

[[package]]
name = "futures-task"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cd417de3d1d015fc3bfd2b1ea46dfc7bab72ef86f1cc7cc9c78e728b34a6d1fd"

[[package]]
name = "futures-util"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0d50a92467f8ba5dd6e3ee5d4bd04d73ab2e4e1c44474a0674821dfce14b79bc"
dependencies = [
 "futures-core",
 "futures-io",
 "futures-macro",
 "futures-sink",
 "futures-task",
 "memchr",
 "pin-project-lite",
 "slab",
]

[[package]]
name = "gdk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d9f245958c627ac99d8e529166f9823fb3b838d1d41fd2b297af3075093c2691"
dependencies = [
 "cairo-rs",
 "gdk-pixbuf",
 "gdk-sys",
 "gio",
 "glib",
 "libc",
 "pango",
]

[[package]]
name = "gdk-pixbuf"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "50e1f5f1b0bfb830d6ccc8066d18db35c487b1b2b1e8589b5dfe9f07e8defaec"
dependencies = [
 "gdk-pixbuf-sys",
 "gio",
 "glib",
 "libc",
 "once_cell",
]

[[package]]
name = "gdk-pixbuf-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f9839ea644ed9c97a34d129ad56d38a25e6756f99f3a88e15cd39c20629caf7"
dependencies = [
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "gdk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5c2d13f38594ac1e66619e188c6d5a1adb98d11b2fcf7894fc416ad76aa2f3f7"
dependencies = [
 "cairo-sys-rs",
 "gdk-pixbuf-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pango-sys",
 "pkg-config",
 "system-deps",
]

[[package]]
name = "gdkwayland-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "140071d506d223f7572b9f09b5e155afbd77428cd5cc7af8f2694c41d98dfe69"
dependencies = [
 "gdk-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pkg-config",
 "system-deps",
]

[[package]]
name = "gdkx11"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3caa00e14351bebbc8183b3c36690327eb77c49abc2268dd4bd36b856db3fbfe"
dependencies = [
 "gdk",
 "gdkx11-sys",
 "gio",
 "glib",
 "libc",
 "x11",
]

[[package]]
name = "gdkx11-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e2e7445fe01ac26f11601db260dd8608fe172514eb63b3b5e261ea6b0f4428d"
dependencies = [
 "gdk-sys",
 "glib-sys",
 "libc",
 "system-deps",
 "x11",
]

[[package]]
name = "generic-array"
version = "0.14.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "85649ca51fd72272d7821adaf274ad91c288277713d9c18820d8499a7ff69e9a"
dependencies = [
 "typenum",
 "version_check",
]

[[package]]
name = "getrandom"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff2abc00be7fca6ebc474524697ae276ad847ad0a6b3faa4bcb027e9a4614ad0"
dependencies = [
 "cfg-if",
 "libc",
 "wasi",
]

[[package]]
name = "getrandom"
version = "0.3.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "899def5c37c4fd7b2664648c28120ecec138e4d395b459e5ca34f9cce2dd77fd"
dependencies = [
 "cfg-if",
 "libc",
 "r-efi 5.3.0",
 "wasip2",
]

[[package]]
name = "getrandom"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "300e883d756b2e4ec94e02791f39b04b522276138852cfc41d9fb7e904106099"
dependencies = [
 "cfg-if",
 "libc",
 "r-efi 6.0.0",
]

[[package]]
name = "gio"
version = "0.18.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d4fc8f532f87b79cbc51a79748f16a6828fb784be93145a322fa14d06d354c73"
dependencies = [
 "futures-channel",
 "futures-core",
 "futures-io",
 "futures-util",
 "gio-sys",
 "glib",
 "libc",
 "once_cell",
 "pin-project-lite",
 "smallvec",
 "thiserror 1.0.69",
]

[[package]]
name = "gio-sys"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "37566df850baf5e4cb0dfb78af2e4b9898d817ed9263d1090a2df958c64737d2"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
 "winapi",
]

[[package]]
name = "glib"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "233daaf6e83ae6a12a52055f568f9d7cf4671dabb78ff9560ab6da230ce00ee5"
dependencies = [
 "bitflags 2.13.2",
 "futures-channel",
 "futures-core",
 "futures-executor",
 "futures-task",
 "futures-util",
 "gio-sys",
 "glib-macros",
 "glib-sys",
 "gobject-sys",
 "libc",
 "memchr",
 "once_cell",
 "smallvec",
 "thiserror 1.0.69",
]

[[package]]
name = "glib-macros"
version = "0.18.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0bb0228f477c0900c880fd78c8759b95c7636dbd7842707f49e132378aa2acdc"
dependencies = [
 "heck 0.4.1",
 "proc-macro-crate 2.0.2",
 "proc-macro-error",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "glib-sys"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "063ce2eb6a8d0ea93d2bf8ba1957e78dbab6be1c2220dd3daca57d5a9d869898"
dependencies = [
 "libc",
 "system-deps",
]

[[package]]
name = "glob"
version = "0.3.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4eba85ea1d0a966a983acd07deee566e67395d2d96b6fb39e62b5a833f1eb0b"

[[package]]
name = "gobject-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0850127b514d1c4a4654ead6dedadb18198999985908e6ffe4436f53c785ce44"
dependencies = [
 "glib-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "gtk"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fd56fb197bfc42bd5d2751f4f017d44ff59fbb58140c6b49f9b3b2bdab08506a"
dependencies = [
 "atk",
 "cairo-rs",
 "field-offset",
 "futures-channel",
 "gdk",
 "gdk-pixbuf",
 "gio",
 "glib",
 "gtk-sys",
 "gtk3-macros",
 "libc",
 "pango",
 "pkg-config",
]

[[package]]
name = "gtk-sys"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f29a1c21c59553eb7dd40e918be54dccd60c52b049b75119d5d96ce6b624414"
dependencies = [
 "atk-sys",
 "cairo-sys-rs",
 "gdk-pixbuf-sys",
 "gdk-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "pango-sys",
 "system-deps",
]

[[package]]
name = "gtk3-macros"
version = "0.18.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "52ff3c5b21f14f0736fed6dcfc0bfb4225ebf5725f3c0209edeec181e4d73e9d"
dependencies = [
 "proc-macro-crate 1.3.1",
 "proc-macro-error",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "hashbrown"
version = "0.12.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8a9ee70c43aaf417c914396645a0fa852624801b24ebb7ae78fe8272889ac888"

[[package]]
name = "hashbrown"
version = "0.17.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed5909b6e89a2db4456e54cd5f673791d7eca6732202bbf2a9cc504fe2f9b84a"
dependencies = [
 "foldhash",
]

[[package]]
name = "hashlink"
version = "0.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a596f1b20ed2cc5ecac41a164aaebc7258057060f06c0cf7a2ba3991ee7990fb"
dependencies = [
 "hashbrown 0.17.1",
]

[[package]]
name = "heck"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "95505c38b4572b2d910cecb0281560f54b440a19336cbbcb27bf6ce6adc6f5a8"

[[package]]
name = "heck"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2304e00983f87ffb38b55b444b5e3b60a884b5d30c0fca7d82fe33449bbe55ea"

[[package]]
name = "hermit-abi"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e17592d60ebacc7d5e169f4663c5f84f9161cc90328abcfe8456f41e4dfcb284"

[[package]]
name = "hex"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7f24254aa9a54b5c858eaee2f5bccdb46aaf0e486a595ed5fd8f86ba55232a70"

[[package]]
name = "html5ever"
version = "0.39.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "46a1761807faccc9a19e86944bbf40610014066306f96edcdedc2fb714bcb7b8"
dependencies = [
 "log",
 "markup5ever",
]

[[package]]
name = "http"
version = "1.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "918d3568bebf352712bc2ef3d46a8bcf1a75b373be6539de198e9105cbbf9ce0"
dependencies = [
 "bytes",
 "itoa",
]

[[package]]
name = "http-body"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca2a8f2913ee65f60facd6a5905613afaa448497a0230cc41ce022d93290bc2c"
dependencies = [
 "bytes",
 "http",
]

[[package]]
name = "http-body-util"
version = "0.1.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23169fe34a5fbcdd3f3862e78fb9b6fccd5f02a6dc6f732547005d45631ce71c"
dependencies = [
 "bytes",
 "futures-core",
 "http",
 "http-body",
 "pin-project-lite",
]

[[package]]
name = "httparse"
version = "1.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6dbf3de79e51f3d586ab4cb9d5c3e2c14aa28ed23d180cf89b4df0454a69cc87"

[[package]]
name = "httpdate"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df3b46402a9d5adb4c86a0cf463f42e19994e3ee891101b1841f30a545cb49a9"

[[package]]
name = "hyper"
version = "1.12.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2c3e324da4c95177d6291d4c8730197c0d1822f8a9766814a4a44fa5ab797c9c"
dependencies = [
 "atomic-waker",
 "bytes",
 "futures-core",
 "http",
 "http-body",
 "httparse",
 "itoa",
 "pin-project-lite",
 "smallvec",
 "tokio",
 "want",
]

[[package]]
name = "hyper-util"
version = "0.1.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ddc03d96684f9226b8a787cdb71488417b53ab5ea8fdb1dac946cb9431cc8bff"
dependencies = [
 "base64 0.23.1",
 "bytes",
 "futures-channel",
 "futures-util",
 "http",
 "http-body",
 "httparse",
 "hyper",
 "ipnet",
 "libc",
 "percent-encoding",
 "pin-project-lite",
 "socket2",
 "tokio",
 "tower-service",
 "tracing",
]

[[package]]
name = "iana-time-zone"
version = "0.1.65"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e31bc9ad994ba00e440a8aa5c9ef0ec67d5cb5e5cb0cc7f8b744a35b389cc470"
dependencies = [
 "android_system_properties",
 "core-foundation-sys",
 "iana-time-zone-haiku",
 "js-sys",
 "log",
 "wasm-bindgen",
 "windows-core",
]

[[package]]
name = "iana-time-zone-haiku"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f31827a206f56af32e590ba56d5d2d085f558508192593743f16b2306495269f"
dependencies = [
 "cc",
]

[[package]]
name = "ico"
version = "0.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d75e94d66081e4d8dcd098bd8dc5254800fea14a26389b298410158d834de167"
dependencies = [
 "byteorder",
 "png",
]

[[package]]
name = "icu_collections"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fe090a42a0d3140fed8c63263ed1fecc02422cb2f4bfe55cd8de2de1b8e105dd"
dependencies = [
 "displaydoc",
 "potential_utf",
 "utf8_iter",
 "yoke",
 "zerofrom",
 "zerovec",
]

[[package]]
name = "icu_locale_core"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "25d29b57c17c6528d0dc4c2141cfa2d08200465acb537a3909c8b9b8a4a984c0"
dependencies = [
 "displaydoc",
 "litemap",
 "tinystr",
 "writeable",
 "zerovec",
]

[[package]]
name = "icu_normalizer"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "404a3b8c486f205c87fe7f23ab6894d84a4ad76d6e4671ae1981ba7def87c599"
dependencies = [
 "icu_collections",
 "icu_normalizer_data",
 "icu_properties",
 "icu_provider",
 "smallvec",
 "zerovec",
]

[[package]]
name = "icu_normalizer_data"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20f0088bfb7441f7a37fa0c9e20cb1e9cba1cac6b9ce8cd2a6dc44294f8e8cbc"

[[package]]
name = "icu_properties"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2ea83d991c56158f7cf898bf86436c1dfe7c07ee82fe88951f2695c9f37a379f"
dependencies = [
 "displaydoc",
 "icu_collections",
 "icu_locale_core",
 "icu_properties_data",
 "icu_provider",
 "zerotrie",
 "zerovec",
]

[[package]]
name = "icu_properties_data"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b98f29af82d02b163fe50161388350e743bb3107cc8e8c2f7314cb505faddfcf"

[[package]]
name = "icu_provider"
version = "2.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "413099315636c588ee8f011190b329b971a09a8fae9d157e01dcae8379468514"
dependencies = [
 "displaydoc",
 "icu_locale_core",
 "writeable",
 "yoke",
 "zerofrom",
 "zerotrie",
 "zerovec",
]

[[package]]
name = "ident_case"
version = "1.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b9e0384b61958566e926dc50660321d12159025e767c18e043daf26b70104c39"

[[package]]
name = "idna"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3b0875f23caa03898994f6ddc501886a45c7d3d62d04d2d90788d47be1b1e4de"
dependencies = [
 "idna_adapter",
 "smallvec",
 "utf8_iter",
]

[[package]]
name = "idna_adapter"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cb68373c0d6620ef8105e855e7745e18b0d00d3bdb07fb532e434244cdb9a714"
dependencies = [
 "icu_normalizer",
 "icu_properties",
]

[[package]]
name = "image"
version = "0.25.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "85ab80394333c02fe689eaf900ab500fbd0c2213da414687ebf995a65d5a6104"
dependencies = [
 "bytemuck",
 "byteorder-lite",
 "image-webp",
 "moxcms",
 "num-traits",
 "png",
 "zune-core",
 "zune-jpeg",
]

[[package]]
name = "image-webp"
version = "0.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "525e9ff3e1a4be2fbea1fdf0e98686a6d98b4d8f937e1bf7402245af1909e8c3"
dependencies = [
 "byteorder-lite",
 "quick-error",
]

[[package]]
name = "indexmap"
version = "1.9.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bd070e393353796e801d209ad339e89596eb4c8d430d18ede6a1cced8fafbd99"
dependencies = [
 "autocfg",
 "hashbrown 0.12.3",
 "serde",
]

[[package]]
name = "indexmap"
version = "2.14.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cc4e190f5d26ca7051642629da2c52fc03bde85a03197c99408dcd291734c855"
dependencies = [
 "equivalent",
 "hashbrown 0.17.1",
 "serde",
 "serde_core",
]

[[package]]
name = "infer"
version = "0.22.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f4200d433cbd5178df7797c9c2e75b348b728e39631cf14520d1e2fc424201f4"
dependencies = [
 "cfb",
]

[[package]]
name = "ipnet"
version = "2.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "791930b43c0d5973160d90a8f3894509f2b273430f5c5c73b668636d0287c5c0"

[[package]]
name = "itoa"
version = "1.0.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8f42a60cbdf9a97f5d2305f08a87dc4e09308d1276d28c869c684d7777685682"

[[package]]
name = "javascriptcore-rs"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca5671e9ffce8ffba57afc24070e906da7fc4b1ba66f2cabebf61bf2ea257fcc"
dependencies = [
 "bitflags 1.3.2",
 "glib",
 "javascriptcore-rs-sys",
]

[[package]]
name = "javascriptcore-rs-sys"
version = "1.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "af1be78d14ffa4b75b66df31840478fef72b51f8c2465d4ca7c194da9f7a5124"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "jiff"
version = "0.2.38"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2b005715dcbeb0089a3c0dab99f2ff1cc3b2525323552703d648585d342a383"
dependencies = [
 "defmt",
 "jiff-core",
 "jiff-static",
 "jiff-tzdb-platform",
 "log",
 "portable-atomic",
 "portable-atomic-util",
 "serde_core",
 "windows-link",
]

[[package]]
name = "jiff-core"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5e52fe76043ccecc9005d2305ebaadf7d7fc0cc89ca6baa10a94d6bc68c7128c"
dependencies = [
 "defmt",
 "log",
]

[[package]]
name = "jiff-static"
version = "0.2.38"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2cc9817253cf7c7ee4684451bd327e88d6f3658014e54a29198625590650695c"
dependencies = [
 "jiff-core",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "jiff-tzdb"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fa8377070c6bae868759445e5a77f66d84f0b72f3a054bfb00e6d038b8282da7"

[[package]]
name = "jiff-tzdb-platform"
version = "0.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "875a5a69ac2bab1a891711cf5eccbec1ce0341ea805560dcd90b7a2e925132e8"
dependencies = [
 "jiff-tzdb",
]

[[package]]
name = "jni"
version = "0.21.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1a87aa2bb7d2af34197c04845522473242e1aa17c12f4935d5856491a7fb8c97"
dependencies = [
 "cesu8",
 "cfg-if",
 "combine",
 "jni-sys 0.3.1",
 "log",
 "thiserror 1.0.69",
 "walkdir",
 "windows-sys 0.45.0",
]

[[package]]
name = "jni-sys"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "41a652e1f9b6e0275df1f15b32661cf0d4b78d4d87ddec5e0c3c20f097433258"
dependencies = [
 "jni-sys 0.4.1",
]

[[package]]
name = "jni-sys"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6377a88cb3910bee9b0fa88d4f42e1d2da8e79915598f65fb0c7ee14c878af2"
dependencies = [
 "jni-sys-macros",
]

[[package]]
name = "jni-sys-macros"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38c0b942f458fe50cdac086d2f946512305e5631e720728f2a61aabcd47a6264"
dependencies = [
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "js-sys"
version = "0.3.106"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7883d941dae510fb2d978fc3fe018c71c9e2892fd38854de3e8b92c2e5ad9cc5"
dependencies = [
 "cfg-if",
 "futures-util",
 "wasm-bindgen",
]

[[package]]
name = "json-patch"
version = "4.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7421438de105a0827e44fadd05377727847d717c80ce29a229f85fd04c427b72"
dependencies = [
 "jsonptr",
 "serde",
 "serde_json",
 "thiserror 2.0.21",
]

[[package]]
name = "jsonptr"
version = "0.7.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a5a3cc660ba5d72bce0b3bb295bf20847ccbb40fd423f3f05b61273672e561fe"
dependencies = [
 "serde",
 "serde_json",
]

[[package]]
name = "keyboard-types"
version = "0.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0fbe853b403ae61a04233030ae8a79d94975281ed9770a1f9e246732b534b28d"
dependencies = [
 "bitflags 2.13.2",
 "serde",
]

[[package]]
name = "libappindicator"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "03589b9607c868cc7ae54c0b2a22c8dc03dd41692d48f2d7df73615c6a95dc0a"
dependencies = [
 "glib",
 "gtk",
 "gtk-sys",
 "libappindicator-sys",
 "log",
]

[[package]]
name = "libappindicator-sys"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e9ec52138abedcc58dc17a7c6c0c00a2bdb4f3427c7f63fa97fd0d859155caf"
dependencies = [
 "gtk-sys",
 "libloading",
 "once_cell",
]

[[package]]
name = "libc"
version = "0.2.191"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "65cd87c9a6d60536580b316ad985726104730a5151c99845f2490428ef91240a"

[[package]]
name = "libdbus-sys"
version = "0.2.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "328c4789d42200f1eeec05bd86c9c13c7f091d2ba9a6ea35acdf51f31bc0f043"
dependencies = [
 "pkg-config",
]

[[package]]
name = "libloading"
version = "0.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b67380fd3b2fbe7527a606e18729d21c6f3951633d0500574c4dc22d2d638b9f"
dependencies = [
 "cfg-if",
 "winapi",
]

[[package]]
name = "libredox"
version = "0.1.25"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "61ff90caf6077a803a240f62fdbe88645a890bbca49ef8174c3cb0404362171d"
dependencies = [
 "libc",
]

[[package]]
name = "libsqlite3-sys"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "14a5f01b87b92705d07b433c06f96cbc764637d81a0bffb5734ce17cf0f9a2b3"
dependencies = [
 "cc",
 "pkg-config",
 "vcpkg",
]

[[package]]
name = "linux-raw-sys"
version = "0.12.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32a66949e030da00e8c7d4434b251670a91556f4144941d37452769c25d58a53"

[[package]]
name = "litemap"
version = "0.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "47d9d19d1d6efa0109d2f65ff4c85cddd50bd572e5a00127ab10987290bcefae"

[[package]]
name = "lock_api"
version = "0.4.14"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "224399e74b87b5f3557511d98dff8b14089b3dadafcab6bb93eab67d3aace965"
dependencies = [
 "scopeguard",
]

[[package]]
name = "log"
version = "0.4.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f9f8bd3e56ce4dfc153cf470fffbfa98c7620958b312ca5c3a4b8d5181fd13c6"

[[package]]
name = "markup5ever"
version = "0.39.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7122d987ec5f704ee56f6e5b41a7d93722e9aae27ae07cafa4036c4d3f9757de"
dependencies = [
 "log",
 "tendril",
 "web_atoms",
]

[[package]]
name = "memchr"
version = "2.8.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cf8baf1c55e62ffcace7a9f06f4bd9cd3f0c4beb022d3b367256b91b87513d98"

[[package]]
name = "memoffset"
version = "0.9.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "488016bfae457b036d996092f6cb448677611ce4449e970ceaf42695203f218a"
dependencies = [
 "autocfg",
]

[[package]]
name = "mime"
version = "0.3.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6877bb514081ee2a7ff5ef9de3281f14a4dd4bceac4c09388074a6b5df8a139a"

[[package]]
name = "miniz_oxide"
version = "0.8.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fa76a2c86f704bdb222d66965fb3d63269ce38518b83cb0575fca855ebb6316"
dependencies = [
 "adler2",
 "simd-adler32",
]

[[package]]
name = "miniz_oxide"
version = "0.9.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b63fbc4a50860e98e7b2aa7804ded1db5cbc3aff9193adaff57a6931bf7c4b4c"
dependencies = [
 "adler2",
 "simd-adler32",
]

[[package]]
name = "mio"
version = "1.2.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1788edb87fdc09c7e26304471e2f5be8cdefb1b6930d6e3985fc02ff53bf86ee"
dependencies = [
 "libc",
 "wasi",
 "windows-sys 0.61.2",
]

[[package]]
name = "moxcms"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bb85c154ba489f01b25c0d36ae69a87e4a1c73a72631fc6c0eb6dde34a73e44b"
dependencies = [
 "num-traits",
 "pxfm",
]

[[package]]
name = "muda"
version = "0.20.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cca139e57da4383727f189e43e66e84fa372347027fc996f9f1a007ec0a37996"
dependencies = [
 "crossbeam-channel",
 "dpi",
 "gtk",
 "keyboard-types",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "once_cell",
 "png",
 "serde",
 "thiserror 2.0.21",
 "windows-sys 0.61.2",
]

[[package]]
name = "ndk"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3f42e7bbe13d351b6bead8286a43aac9534b82bd3cc43e47037f012ebfd62d4"
dependencies = [
 "bitflags 2.13.2",
 "jni-sys 0.3.1",
 "log",
 "ndk-sys",
 "num_enum",
 "raw-window-handle",
 "thiserror 1.0.69",
]

[[package]]
name = "ndk-context"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "27b02d87554356db9e9a873add8782d4ea6e3e58ea071a9adb9a2e8ddb884a8b"

[[package]]
name = "ndk-sys"
version = "0.6.0+11769913"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ee6cda3051665f1fb8d9e08fc35c96d5a244fb1be711a03b71118828afc9a873"
dependencies = [
 "jni-sys 0.3.1",
]

[[package]]
name = "new_debug_unreachable"
version = "1.0.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "650eef8c711430f1a879fdd01d4745a7deea475becfb90269c06775983bbf086"

[[package]]
name = "num-conv"
version = "0.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "521739c6d2bac4aa25192232afe6841231376b2b26d4d9fae5ecf8ca5772e441"

[[package]]
name = "num-traits"
version = "0.2.19"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "071dfc062690e90b734c0b2273ce72ad0ffa95f0c74596bc250dcfd960262841"
dependencies = [
 "autocfg",
]

[[package]]
name = "num_enum"
version = "0.7.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d0bca838442ec211fa11de3a8b0e0e8f3a4522575b5c4c06ed722e005036f26"
dependencies = [
 "num_enum_derive",
 "rustversion",
]

[[package]]
name = "num_enum_derive"
version = "0.7.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "680998035259dcfcafe653688bf2aa6d3e2dc05e98be6ab46afb089dc84f1df8"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "objc2"
version = "0.6.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "08849bbd4767dfae9457696856ae1c84fe4e0281bbe4a7abff2d0e06fb7981f8"
dependencies = [
 "objc2-encode",
 "objc2-exception-helper",
]

[[package]]
name = "objc2-app-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d49e936b501e5c5bf01fda3a9452ff86dc3ea98ad5f283e1455153142d97518c"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-quartz-core",
]

[[package]]
name = "objc2-cloud-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "73ad74d880bb43877038da939b7427bba67e9dd42004a18b809ba7d87cee241c"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-data"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b402a653efbb5e82ce4df10683b6b28027616a2715e90009947d50b8dd298fa"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-foundation"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2a180dd8642fa45cdb7dd721cd4c11b1cadd4929ce112ebd8b9f5803cc79d536"
dependencies = [
 "bitflags 2.13.2",
 "dispatch2",
 "objc2",
]

[[package]]
name = "objc2-core-graphics"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e022c9d066895efa1345f8e33e584b9f958da2fd4cd116792e15e07e4720a807"
dependencies = [
 "bitflags 2.13.2",
 "dispatch2",
 "objc2",
 "objc2-core-foundation",
 "objc2-io-surface",
]

[[package]]
name = "objc2-core-image"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e5d563b38d2b97209f8e861173de434bd0214cf020e3423a52624cd1d989f006"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-location"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ca347214e24bc973fc025fd0d36ebb179ff30536ed1f80252706db19ee452009"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-core-text"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0cde0dfb48d25d2b4862161a4d5fcc0e3c24367869ad306b0c9ec0073bfed92d"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
 "objc2-core-graphics",
]

[[package]]
name = "objc2-encode"
version = "4.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ef25abbcd74fb2609453eb695bd2f860d389e457f67dc17cafc8b8cbc89d0c33"

[[package]]
name = "objc2-exception-helper"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c7a1c5fbb72d7735b076bb47b578523aedc40f3c439bea6dfd595c089d79d98a"
dependencies = [
 "cc",
]

[[package]]
name = "objc2-foundation"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e3e0adef53c21f888deb4fa59fc59f7eb17404926ee8a6f59f5df0fd7f9f3272"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-core-foundation",
]

[[package]]
name = "objc2-io-surface"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "180788110936d59bab6bd83b6060ffdfffb3b922ba1396b312ae795e1de9d81d"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
]

[[package]]
name = "objc2-quartz-core"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "96c1358452b371bf9f104e21ec536d37a650eb10f7ee379fff67d2e08d537f1f"
dependencies = [
 "bitflags 2.13.2",
 "objc2",
 "objc2-core-foundation",
 "objc2-foundation",
]

[[package]]
name = "objc2-ui-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d87d638e33c06f577498cbcc50491496a3ed4246998a7fbba7ccb98b1e7eab22"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-cloud-kit",
 "objc2-core-data",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-core-image",
 "objc2-core-location",
 "objc2-core-text",
 "objc2-foundation",
 "objc2-quartz-core",
 "objc2-user-notifications",
]

[[package]]
name = "objc2-user-notifications"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9df9128cbbfef73cda168416ccf7f837b62737d748333bfe9ab71c245d76613e"
dependencies = [
 "objc2",
 "objc2-foundation",
]

[[package]]
name = "objc2-web-kit"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2e5aaab980c433cf470df9d7af96a7b46a9d892d521a2cbbb2f8a4c16751e7f"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
]

[[package]]
name = "once_cell"
version = "1.21.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9f7c3e4beb33f85d45ae3e3a1792185706c8e16d043238c593331cc7cd313b50"

[[package]]
name = "option-ext"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "04744f49eae99ab78e0d5c0b603ab218f515ea8cfe5a456d7629ad883a3b6e7d"

[[package]]
name = "ordered-stream"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9aa2b01e1d916879f73a53d01d1d6cee68adbb31d6d9177a8cfce093cced1d50"
dependencies = [
 "futures-core",
 "pin-project-lite",
]

[[package]]
name = "pango"
version = "0.18.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7ca27ec1eb0457ab26f3036ea52229edbdb74dee1edd29063f5b9b010e7ebee4"
dependencies = [
 "gio",
 "glib",
 "libc",
 "once_cell",
 "pango-sys",
]

[[package]]
name = "pango-sys"
version = "0.18.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "436737e391a843e5933d6d9aa102cb126d501e815b83601365a948a518555dc5"
dependencies = [
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "parking"
version = "2.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f38d5652c16fde515bb1ecef450ab0f6a219d619a7274976324d5e377f7dceba"

[[package]]
name = "parking_lot"
version = "0.12.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "93857453250e3077bd71ff98b6a65ea6621a19bb0f559a85248955ac12c45a1a"
dependencies = [
 "lock_api",
 "parking_lot_core",
]

[[package]]
name = "parking_lot_core"
version = "0.9.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2621685985a2ebf1c516881c026032ac7deafcda1a2c9b7850dc81e3dfcb64c1"
dependencies = [
 "cfg-if",
 "libc",
 "redox_syscall",
 "smallvec",
 "windows-link",
]

[[package]]
name = "percent-encoding"
version = "2.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9b4f627cb1b25917193a259e49bdad08f671f8d9708acfd5fe0a8c1455d87220"

[[package]]
name = "phf"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c1562dc717473dbaa4c1f85a36410e03c047b2e7df7f45ee938fbef64ae7fadf"
dependencies = [
 "phf_macros",
 "phf_shared",
 "serde",
]

[[package]]
name = "phf_codegen"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "49aa7f9d80421bca176ca8dbfebe668cc7a2684708594ec9f3c0db0805d5d6e1"
dependencies = [
 "phf_generator",
 "phf_shared",
]

[[package]]
name = "phf_generator"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "135ace3a761e564ec88c03a77317a7c6b80bb7f7135ef2544dbe054243b89737"
dependencies = [
 "fastrand",
 "phf_shared",
]

[[package]]
name = "phf_macros"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "812f032b54b1e759ccd5f8b6677695d5268c588701effba24601f6932f8269ef"
dependencies = [
 "phf_generator",
 "phf_shared",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "phf_shared"
version = "0.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e57fef6bc5981e38c2ce2d63bfa546861309f875b8a75f092d1d54ae2d64f266"
dependencies = [
 "siphasher",
]

[[package]]
name = "pin-project-lite"
version = "0.2.17"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a89322df9ebe1c1578d689c92318e070967d1042b512afbe49518723f4e6d5cd"

[[package]]
name = "piper"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c835479a4443ded371d6c535cbfd8d31ad92c5d23ae9770a61bc155e4992a3c1"
dependencies = [
 "atomic-waker",
 "fastrand",
 "futures-io",
]

[[package]]
name = "pkg-config"
version = "0.3.34"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f6b464fbc74e149a392436b17d523f769e057cb6877f6a5c4618bc6f11800548"

[[package]]
name = "plist"
version = "1.10.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "327a4cb2ad49dc48adfdc9da89e22c64d488b508c67a044d71ba729e4521a285"
dependencies = [
 "base64 0.23.1",
 "indexmap 2.14.2",
 "quick-xml",
 "serde",
 "time",
]

[[package]]
name = "png"
version = "0.18.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "60769b8b31b2a9f263dae2776c37b1b28ae246943cf719eb6946a1db05128a61"
dependencies = [
 "bitflags 2.13.2",
 "crc32fast",
 "fdeflate",
 "flate2",
 "miniz_oxide 0.8.9",
]

[[package]]
name = "polling"
version = "3.11.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5d0e4f59085d47d8241c88ead0f274e8a0cb551f3625263c05eb8dd897c34218"
dependencies = [
 "cfg-if",
 "concurrent-queue",
 "hermit-abi",
 "pin-project-lite",
 "rustix",
 "windows-sys 0.61.2",
]

[[package]]
name = "portable-atomic"
version = "1.15.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "05c8b63e8d9609db387f0324918f81d68fe27748f084ef092fb35954d0539a85"

[[package]]
name = "portable-atomic-util"
version = "0.2.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "10ab3eb7f3becc3a1cbc4f2c6f20267996cfc1a6467a873763411b136a122715"
dependencies = [
 "portable-atomic",
]

[[package]]
name = "potential_utf"
version = "0.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d83eb9bc6d8e5cf568e7a1101d60ee05e81ed50ea106026f3d18deeb046d7661"
dependencies = [
 "zerovec",
]

[[package]]
name = "powerfmt"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4a6394b9e965e73d0a289ee54f589087e2c676aedf60885baf52c76b771e4958"

[[package]]
name = "precomputed-hash"
version = "0.1.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "925383efa346730478fb4838dbe9137d2a47675ad789c546d150a6e1dd4ab31c"

[[package]]
name = "proc-macro-crate"
version = "1.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7f4c021e1093a56626774e81216a4ce732a735e5bad4868a03f3ed65ca0c3919"
dependencies = [
 "once_cell",
 "toml_edit 0.19.15",
]

[[package]]
name = "proc-macro-crate"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b00f26d3400549137f92511a46ac1cd8ce37cb5598a96d382381458b992a5d24"
dependencies = [
 "toml_datetime 0.6.3",
 "toml_edit 0.20.2",
]

[[package]]
name = "proc-macro-crate"
version = "3.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e67ba7e9b2b56446f1d419b1d807906278ffa1a658a8a5d8a39dcb1f5a78614f"
dependencies = [
 "toml_edit 0.25.17+spec-1.1.0",
]

[[package]]
name = "proc-macro-error"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "da25490ff9892aab3fcf7c36f08cfb902dd3e71ca0f9f9517bea02a73a5ce38c"
dependencies = [
 "proc-macro-error-attr",
 "proc-macro2",
 "quote",
 "syn 1.0.109",
 "version_check",
]

[[package]]
name = "proc-macro-error-attr"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a1be40180e52ecc98ad80b184934baf3d0d29f979574e439af5a55274b35f869"
dependencies = [
 "proc-macro2",
 "quote",
 "version_check",
]

[[package]]
name = "proc-macro2"
version = "1.0.107"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "985e7ec9bb745e6ce6535b544d84d6cd6f7ad8bd711c398938ae983b91a766d9"
dependencies = [
 "unicode-ident",
]

[[package]]
name = "pxfm"
version = "0.1.30"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d55d956fa96f5ec02be2e13af0e20391a5aa83d6a074e3ad368959d0fab299ea"

[[package]]
name = "quick-error"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a993555f31e5a609f617c12db6250dedcac1b0a85076912c436e6fc9b2c8e6a3"

[[package]]
name = "quick-xml"
version = "0.42.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "41b1177fdf999d2321d3fb46ff47159d9c1fb9ad66a4879f8c50a0b504615e9b"
dependencies = [
 "memchr",
]

[[package]]
name = "quote"
version = "1.0.47"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1fbf4db142a473a8d80c26bbf18454ed458bf8d26c8219c331daecfdbd079001"
dependencies = [
 "proc-macro2",
]

[[package]]
name = "r-efi"
version = "5.3.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "69cdb34c158ceb288df11e18b4bd39de994f6657d83847bdffdbd7f346754b0f"

[[package]]
name = "r-efi"
version = "6.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f8dcc9c7d52a811697d2151c701e0d08956f92b0e24136cf4cf27b57a6a0d9bf"

[[package]]
name = "raw-window-handle"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20675572f6f24e9e76ef639bc5552774ed45f1c30e2951e1e99c59888861c539"

[[package]]
name = "redox_syscall"
version = "0.5.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ed2bf2547551a7053d6fdfafda3f938979645c44812fbfcda098faae3f1a362d"
dependencies = [
 "bitflags 2.13.2",
]

[[package]]
name = "redox_users"
version = "0.4.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ba009ff324d1fc1b900bd1fdb31564febe58a8ccc8a6fdbb93b543d33b13ca43"
dependencies = [
 "getrandom 0.2.17",
 "libredox",
 "thiserror 1.0.69",
]

[[package]]
name = "redox_users"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "60dc65c0ff1a7ae1294b0c67b9f14baf70b644404010370171787bfac1038fc0"
dependencies = [
 "libredox",
 "thiserror 2.0.21",
]

[[package]]
name = "ref-cast"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7e440fb4e4b4147295338efb76001ab9e4efc0e5839df2c47fc5ac2381d365c3"
dependencies = [
 "ref-cast-impl",
]

[[package]]
name = "ref-cast-impl"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "92ecd8964f8453721699a1ed72037b0db49ce2f5a5138486ee89bed6f67cdf3a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "regex"
version = "1.13.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f020237b6c8eed93db2e2cb53c00c60a8e1bc73da7d073199a1180401450218d"
dependencies = [
 "aho-corasick",
 "memchr",
 "regex-automata",
 "regex-syntax",
]

[[package]]
name = "regex-automata"
version = "0.4.18"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ad8553b9b26413251cbf30e620595c7a41b3887f03da04579c0e6b0d6a06b4b2"
dependencies = [
 "aho-corasick",
 "memchr",
 "regex-syntax",
]

[[package]]
name = "regex-syntax"
version = "0.8.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d6f6ff9a378485b298a5286656da665ba74413d36db0979633275d2e708145d4"

[[package]]
name = "reqwest"
version = "0.13.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "16a1cfa75cc186dd73d5818e510e042e40927bccc9c236b061cea97e1eb08029"
dependencies = [
 "base64 0.23.1",
 "bytes",
 "futures-core",
 "futures-util",
 "http",
 "http-body",
 "http-body-util",
 "hyper",
 "hyper-util",
 "js-sys",
 "log",
 "percent-encoding",
 "pin-project-lite",
 "serde",
 "serde_json",
 "sync_wrapper",
 "tokio",
 "tokio-util",
 "tower",
 "tower-http",
 "tower-service",
 "url",
 "wasm-bindgen",
 "wasm-bindgen-futures",
 "wasm-streams",
 "web-sys",
]

[[package]]
name = "rsqlite-vfs"
version = "0.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "353b74f9810d5b085b6c42c9d86a5f0fdb795553235cdd48753b32e3809d18a7"
dependencies = [
 "thiserror 2.0.21",
]

[[package]]
name = "rusqlite"
version = "0.41.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9c026b4444579e8d754556c6c75d040d69c4a44283cdb648ab8a8d5965c2cfa8"
dependencies = [
 "bitflags 2.13.2",
 "fallible-iterator",
 "fallible-streaming-iterator",
 "hashlink",
 "libsqlite3-sys",
 "smallvec",
 "sqlite-wasm-rs",
]

[[package]]
name = "rustc-hash"
version = "2.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6b1e7f9a428571be2dc5bc0505c13fb6bf936822b894ec87abf8a08a4e51742d"

[[package]]
name = "rustc_version"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cfcb3a22ef46e85b45de6ee7e79d063319ebb6594faafcf1c225ea92ab6e9b92"
dependencies = [
 "semver",
]

[[package]]
name = "rustix"
version = "1.1.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e5e76742e5294153d4dde1207dbec5bdd81eef6fabdc0d2118babadabfd858aa"
dependencies = [
 "bitflags 2.13.2",
 "errno",
 "libc",
 "linux-raw-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "rustversion"
version = "1.0.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cf54715a573b99ac80df0bc206da022bcd442c974952c7b9720069370852e21f"

[[package]]
name = "same-file"
version = "1.0.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "93fc1dc3aaa9bfed95e02e6eadabb4baf7e3078b0bd1b4d7b6b0b68378900502"
dependencies = [
 "winapi-util",
]

[[package]]
name = "schemars"
version = "0.8.22"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3fbf2ae1b8bc8e02df939598064d22402220cd5bbcca1c76f7d6a310974d5615"
dependencies = [
 "dyn-clone",
 "indexmap 1.9.3",
 "schemars_derive",
 "serde",
 "serde_json",
 "url",
 "uuid",
]

[[package]]
name = "schemars"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4cd191f9397d57d581cddd31014772520aa448f65ef991055d7f61582c65165f"
dependencies = [
 "dyn-clone",
 "ref-cast",
 "serde",
 "serde_json",
]

[[package]]
name = "schemars"
version = "1.2.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ab508826f74a77ca9d5aba6ff19b522583ee3eaf28a19384ff3d0e5835fadf6e"
dependencies = [
 "dyn-clone",
 "ref-cast",
 "serde",
 "serde_json",
]

[[package]]
name = "schemars_derive"
version = "0.8.22"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32e265784ad618884abaea0600a9adf15393368d840e0222d101a072f3f7534d"
dependencies = [
 "proc-macro2",
 "quote",
 "serde_derive_internals",
 "syn 2.0.119",
]

[[package]]
name = "scopeguard"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "94143f37725109f92c262ed2cf5e59bce7498c01bcc1502d7b9afe439a4e9f49"

[[package]]
name = "selectors"
version = "0.38.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8adfa1c298912827b8a28b223b3b874357397ae706e6190acd9bf28cee99114d"
dependencies = [
 "bitflags 2.13.2",
 "cssparser",
 "derive_more",
 "log",
 "new_debug_unreachable",
 "phf",
 "phf_codegen",
 "precomputed-hash",
 "rustc-hash",
 "servo_arc",
 "smallvec",
]

[[package]]
name = "semver"
version = "1.0.28"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8a7852d02fc848982e0c167ef163aaff9cd91dc640ba85e263cb1ce46fae51cd"
dependencies = [
 "serde",
 "serde_core",
]

[[package]]
name = "serde"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4148590afebada386688f18773da617792bf2ef03ffc1e4cbd2b1d45b023e0ba"
dependencies = [
 "serde_core",
 "serde_derive",
]

[[package]]
name = "serde-untagged"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f9faf48a4a2d2693be24c6289dbe26552776eb7737074e6722891fadbe6c5058"
dependencies = [
 "erased-serde",
 "serde",
 "serde_core",
 "typeid",
]

[[package]]
name = "serde_core"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67dca2c9c51e58a4791a4b1ed58308b39c64224d349a935ab5039aa360942a48"
dependencies = [
 "serde_derive",
]

[[package]]
name = "serde_derive"
version = "1.0.229"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e7a5d71263a5a7d47b41f6b3f06ba276f10cc18b0931f1799f710578e2309348"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serde_derive_internals"
version = "0.29.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "18d26a20a969b9e3fdf2fc2d9f21eda6c40e2de84c9408bb5d3b05d499aae711"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "serde_json"
version = "1.0.154"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e7e9cc8b1b85264074fbcc02a88680c4096b1e47df8f739dceb03bf482f04bd6"
dependencies = [
 "itoa",
 "memchr",
 "serde",
 "serde_core",
 "zmij",
]

[[package]]
name = "serde_repr"
version = "0.1.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d3b1629de253c70a0508c3899572da79ca359fdab27c7920ff00406df418906"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serde_spanned"
version = "0.6.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bf41e0cfaf7226dca15e8197172c295a782857fcb97fad1808a166870dee75a3"
dependencies = [
 "serde",
]

[[package]]
name = "serde_spanned"
version = "1.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4e7523beb55eece201a2356bee0bbca0d1ab466c14c07703b2e0ee6d42cb0c2c"
dependencies = [
 "serde_core",
]

[[package]]
name = "serde_with"
version = "3.24.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df9adc193c780ef8f159aee8b61e2d5801aaa555e6eb0947fe45530ec506296f"
dependencies = [
 "base64 0.23.1",
 "bs58",
 "chrono",
 "hex",
 "indexmap 1.9.3",
 "indexmap 2.14.2",
 "jiff",
 "schemars 0.9.0",
 "schemars 1.2.3",
 "serde_core",
 "serde_json",
 "serde_with_macros",
 "time",
]

[[package]]
name = "serde_with_macros"
version = "3.24.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3e17bbc68e28663bbbb90df47e058aa7eda4fb445b89fe70457bb94fbccf6e49"
dependencies = [
 "darling",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "serialize-to-javascript"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "04f3666a07a197cdb77cdf306c32be9b7f598d7060d50cfd4d5aa04bfd92f6c5"
dependencies = [
 "serde",
 "serde_json",
 "serialize-to-javascript-impl",
]

[[package]]
name = "serialize-to-javascript-impl"
version = "0.1.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "772ee033c0916d670af7860b6e1ef7d658a4629a6d0b4c8c3e67f09b3765b75d"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "servo_arc"
version = "0.4.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "170fb83ab34de17dc69aa7c67482b22218ddb85da56546f9bd6b929e32a05930"
dependencies = [
 "stable_deref_trait",
]

[[package]]
name = "sha2"
version = "0.10.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a7507d819769d01a365ab707794a4084392c824f54a7a6a7862f8c3d0892b283"
dependencies = [
 "cfg-if",
 "cpufeatures",
 "digest",
]

[[package]]
name = "shlex"
version = "2.0.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f8fadd59c855ef2080decdef8ff161eb6661b86933c9d82e5ba29dc602a55aba"

[[package]]
name = "signal-hook-registry"
version = "1.4.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c4db69cba1110affc0e9f7bcd48bbf87b3f4fc7c61fc9155afd4c469eb3d6c1b"
dependencies = [
 "errno",
 "libc",
]

[[package]]
name = "simd-adler32"
version = "0.3.10"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3a219298ac11a56ea9a6d2120044824d6f01aeb034955e7af7bc16858527deea"

[[package]]
name = "siphasher"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "33f4fe9184a62d842c9ef383018f3306d8ba224fd9d836f56d7288308847c256"

[[package]]
name = "slab"
version = "0.4.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0c790de23124f9ab44544d7ac05d60440adc586479ce501c1d6d7da3cd8c9cf5"

[[package]]
name = "smallvec"
version = "1.16.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d0d5d4b1981b8bbbb7aed204cae5726d683d5d6ac7e74ec54122ea28f315e7c8"

[[package]]
name = "socket2"
version = "0.6.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3d1e2c7f27f8d4cb10542a02c49005dbd6e93095799d6f3be745fae9f8fedd4"
dependencies = [
 "libc",
 "windows-sys 0.61.2",
]

[[package]]
name = "softbuffer"
version = "0.4.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "aac18da81ebbf05109ab275b157c22a653bb3c12cf884450179942f81bcbf6c3"
dependencies = [
 "bytemuck",
 "js-sys",
 "ndk",
 "objc2",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-foundation",
 "objc2-quartz-core",
 "raw-window-handle",
 "redox_syscall",
 "tracing",
 "wasm-bindgen",
 "web-sys",
 "windows-sys 0.61.2",
]

[[package]]
name = "soup3"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "471f924a40f31251afc77450e781cb26d55c0b650842efafc9c6cbd2f7cc4f9f"
dependencies = [
 "futures-channel",
 "gio",
 "glib",
 "libc",
 "soup3-sys",
]

[[package]]
name = "soup3-sys"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7ebe8950a680a12f24f15ebe1bf70db7af98ad242d9db43596ad3108aab86c27"
dependencies = [
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "libc",
 "system-deps",
]

[[package]]
name = "sqlite-wasm-rs"
version = "0.6.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "36bd8e29bf08189a005b2df1df99823aa0861cabe9044e5f31ed54ca292ee618"
dependencies = [
 "cc",
 "rsqlite-vfs",
]

[[package]]
name = "stable_deref_trait"
version = "1.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6ce2be8dc25455e1f91df71bfa12ad37d7af1092ae736f3a6cd0e37bc7810596"

[[package]]
name = "static_vcruntime"
version = "3.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff7589a1859b09232522bb9edf076ca7fcf14ded96685d3fa629db73023ffbb7"

[[package]]
name = "string_cache"
version = "0.9.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a18596f8c785a729f2819c0f6a7eae6ebeebdfffbfe4214ae6b087f690e31901"
dependencies = [
 "new_debug_unreachable",
 "parking_lot",
 "phf_shared",
 "precomputed-hash",
]

[[package]]
name = "string_cache_codegen"
version = "0.6.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "585635e46db231059f76c5849798146164652513eb9e8ab2685939dd90f29b69"
dependencies = [
 "phf_generator",
 "phf_shared",
 "proc-macro2",
 "quote",
]

[[package]]
name = "strsim"
version = "0.11.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7da8b5736845d9f2fcb837ea5d9e2628564b3b043a70948a3f0b778838c5fb4f"

[[package]]
name = "swift-rs"
version = "1.0.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cefd87076fd385308ee4aff597256c902f1fbb4d031de1558efc12f8ffefadd9"
dependencies = [
 "base64 0.21.7",
 "serde",
 "serde_json",
]

[[package]]
name = "syn"
version = "1.0.109"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "72b64191b275b66ffe2469e8af2c1cfe3bafa67b529ead792a6d0160888b4237"
dependencies = [
 "proc-macro2",
 "unicode-ident",
]

[[package]]
name = "syn"
version = "2.0.119"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "872831b642d1a07999a962a351ed35b955ea2cfc8f3862091e2a240a84f17297"
dependencies = [
 "proc-macro2",
 "quote",
 "unicode-ident",
]

[[package]]
name = "syn"
version = "3.0.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d78c8dee4c7bf0e14673097256fed6142ce9d3b85a408189d07482442145823b"
dependencies = [
 "proc-macro2",
 "quote",
 "unicode-ident",
]

[[package]]
name = "sync_wrapper"
version = "1.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0bf256ce5efdfa370213c1dabab5935a12e49f2c58d15e9eac2870d3b4f27263"
dependencies = [
 "futures-core",
]

[[package]]
name = "synstructure"
version = "0.14.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "901704edd0dfe137f1987838ee4f259e4e063c31371bdb423f7ae38ec6f77f02"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "system-deps"
version = "6.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a3e535eb8dded36d55ec13eddacd30dec501792ff23a0b1682c38601b8cf2349"
dependencies = [
 "cfg-expr",
 "heck 0.5.0",
 "pkg-config",
 "toml 0.8.2",
 "version-compare",
]

[[package]]
name = "tao"
version = "0.37.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d5777b06fe6435126ae8d816eba269e050e1e10d302cf5461e9c49eccabc3548"
dependencies = [
 "bitflags 2.13.2",
 "block2",
 "core-foundation",
 "core-graphics",
 "crossbeam-channel",
 "dbus",
 "dispatch2",
 "dlopen2",
 "dpi",
 "gdkwayland-sys",
 "gdkx11-sys",
 "gtk",
 "jni",
 "libc",
 "log",
 "ndk",
 "ndk-context",
 "ndk-sys",
 "objc2",
 "objc2-app-kit",
 "objc2-foundation",
 "objc2-ui-kit",
 "parking_lot",
 "percent-encoding",
 "raw-window-handle",
 "tao-macros",
 "unicode-segmentation",
 "url",
 "windows",
 "windows-core",
 "windows-version",
 "x11-dl",
]

[[package]]
name = "tao-macros"
version = "0.1.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5f7eeb6d99155545da6150a1795945f16ac9c178deb2a5f2e74d776107bd5849"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "target-lexicon"
version = "0.12.16"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "61c41af27dd6d1e27b1b16b489db798443478cef1f06a660c96db617ba5de3b1"

[[package]]
name = "tauri"
version = "2.12.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5fb0244332cfb9cee7e2a568bf5da29a36ed8fdbd717f6f47a66b6b7b358c072"
dependencies = [
 "anyhow",
 "bytes",
 "cookie",
 "dirs 7.0.0",
 "dunce",
 "embed_plist",
 "getrandom 0.3.4",
 "glob",
 "gtk",
 "heck 0.5.0",
 "http",
 "jni",
 "libc",
 "log",
 "mime",
 "muda",
 "objc2",
 "objc2-app-kit",
 "objc2-foundation",
 "objc2-ui-kit",
 "objc2-web-kit",
 "percent-encoding",
 "plist",
 "raw-window-handle",
 "reqwest",
 "serde",
 "serde_json",
 "serde_repr",
 "serialize-to-javascript",
 "swift-rs",
 "tauri-build",
 "tauri-macros",
 "tauri-runtime",
 "tauri-runtime-wry",
 "tauri-utils",
 "thiserror 2.0.21",
 "tokio",
 "tray-icon",
 "url",
 "webkit2gtk",
 "webview2-com",
 "window-vibrancy",
 "windows",
]

[[package]]
name = "tauri-build"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "adddb0e648752aaac5da9c3c3c6a68e1e87cab55e3b757b18a9441ef8c3ac614"
dependencies = [
 "anyhow",
 "cargo_toml",
 "dirs 7.0.0",
 "glob",
 "heck 0.5.0",
 "json-patch",
 "schemars 0.8.22",
 "semver",
 "serde",
 "serde_json",
 "static_vcruntime",
 "strsim",
 "tauri-utils",
 "tauri-winres",
 "walkdir",
]

[[package]]
name = "tauri-codegen"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fb37631cf71dab5e8ab55e1bdd701e18a52653d90b78e71d0e5598b1e0a61316"
dependencies = [
 "base64 0.23.1",
 "brotli",
 "ico",
 "json-patch",
 "plist",
 "png",
 "proc-macro2",
 "quote",
 "semver",
 "serde",
 "serde_json",
 "sha2",
 "syn 2.0.119",
 "tauri-utils",
 "thiserror 2.0.21",
 "time",
 "url",
 "uuid",
 "walkdir",
]

[[package]]
name = "tauri-macros"
version = "2.7.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0cc38db58854c10fb5f91a887ed8bf82d3239bb92b5d8db86eda09e96d9963d1"
dependencies = [
 "heck 0.5.0",
 "proc-macro2",
 "quote",
 "syn 2.0.119",
 "tauri-codegen",
 "tauri-utils",
]

[[package]]
name = "tauri-plugin"
version = "2.7.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67fb21a77e8f94e8beb3325e583102488659365af0a3948b7ea244c5b779c291"
dependencies = [
 "anyhow",
 "glob",
 "plist",
 "schemars 0.8.22",
 "serde",
 "serde_json",
 "tauri-utils",
 "walkdir",
]

[[package]]
name = "tauri-plugin-autostart"
version = "2.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "459383cebc193cdd03d1ba4acc40f2c408a7abce419d64bdcd2d745bc2886f70"
dependencies = [
 "auto-launch",
 "serde",
 "serde_json",
 "tauri",
 "tauri-plugin",
 "thiserror 2.0.21",
]

[[package]]
name = "tauri-plugin-single-instance"
version = "2.5.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "726b6da0dd5bd1344f84f4108a622c07d01923baacb5c803a605189672c5352f"
dependencies = [
 "serde",
 "serde_json",
 "tauri",
 "thiserror 2.0.21",
 "tokio",
 "tracing",
 "windows-sys 0.61.2",
 "zbus",
]

[[package]]
name = "tauri-runtime"
version = "2.12.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7c55766d99cea69055904d1735b93c2049302b2e09effd462120deb5581d78e9"
dependencies = [
 "cookie",
 "dpi",
 "gtk",
 "http",
 "jni",
 "objc2",
 "objc2-ui-kit",
 "objc2-web-kit",
 "raw-window-handle",
 "serde",
 "serde_json",
 "tauri-utils",
 "thiserror 2.0.21",
 "url",
 "webkit2gtk",
 "webview2-com",
 "windows",
]

[[package]]
name = "tauri-runtime-wry"
version = "2.12.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e1aa9d8b7a120f879f44fdc1053f7b7dbf416bf0bbc6a72b714dec46b782b52f"
dependencies = [
 "gtk",
 "http",
 "jni",
 "log",
 "objc2",
 "objc2-app-kit",
 "percent-encoding",
 "raw-window-handle",
 "softbuffer",
 "tao",
 "tauri-runtime",
 "tauri-utils",
 "url",
 "webkit2gtk",
 "webview2-com",
 "windows",
 "wry",
]

[[package]]
name = "tauri-utils"
version = "2.10.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "362ab21cd4cc713f2a02b1a9b5688198b1541cfb6907c4281e9190e0f0ef4aa3"
dependencies = [
 "anyhow",
 "brotli",
 "cargo_metadata",
 "ctor",
 "dom_query",
 "dunce",
 "glob",
 "http",
 "infer",
 "json-patch",
 "log",
 "memchr",
 "phf",
 "plist",
 "proc-macro2",
 "quote",
 "regex",
 "schemars 0.8.22",
 "semver",
 "serde",
 "serde-untagged",
 "serde_json",
 "serde_with",
 "swift-rs",
 "thiserror 2.0.21",
 "toml 1.1.8+spec-1.1.0",
 "url",
 "urlpattern",
 "uuid",
 "walkdir",
]

[[package]]
name = "tauri-winres"
version = "0.3.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c52bb6904475a6ca662f15ef787f18ade61d5740a1ee12c45d3b748efdb6f796"
dependencies = [
 "dunce",
 "embed-resource",
 "toml 1.1.8+spec-1.1.0",
]

[[package]]
name = "tempfile"
version = "3.27.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "32497e9a4c7b38532efcdebeef879707aa9f794296a4f0244f6f69e9bc8574bd"
dependencies = [
 "fastrand",
 "getrandom 0.4.3",
 "once_cell",
 "rustix",
 "windows-sys 0.61.2",
]

[[package]]
name = "tendril"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5fed54709c5b3a53d09bb1c113ea4f5ceafd1e772ddcb0030a82e1d56c087b08"
dependencies = [
 "new_debug_unreachable",
]

[[package]]
name = "thiserror"
version = "1.0.69"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6aaf5339b578ea85b50e080feb250a3e8ae8cfcdff9a461c9ec2904bc923f52"
dependencies = [
 "thiserror-impl 1.0.69",
]

[[package]]
name = "thiserror"
version = "2.0.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "09e52cb86a36cede5cb101bf8908837b3e4c6e5e59fe7fd85c23fb56200d189e"
dependencies = [
 "thiserror-impl 2.0.21",
]

[[package]]
name = "thiserror-impl"
version = "1.0.69"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4fee6c4efc90059e10f81e6d42c60a18f76588c3d74cb83a0b242a2b6c7504c1"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "thiserror-impl"
version = "2.0.21"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fe5197923287db20a58125f0bc85c062f7f2c892de97b18c356f9efb14b28524"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "time"
version = "0.3.55"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "cdb87b95ec50ddfa440816d227a17b2ccbdda963a316a727fda0fc4334f7d134"
dependencies = [
 "deranged",
 "num-conv",
 "powerfmt",
 "serde_core",
 "time-core",
 "time-macros",
]

[[package]]
name = "time-core"
version = "0.1.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9e1c906769ad99c88eaa54e728060edef082f8e358ff32030cb7c7d315e81109"

[[package]]
name = "time-macros"
version = "0.2.32"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7e689342a48d2ea927c87ea50cabf8594854bf940e9310208848d680d668ed85"
dependencies = [
 "num-conv",
 "time-core",
]

[[package]]
name = "tiny_http"
version = "0.12.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "389915df6413a2e74fb181895f933386023c71110878cd0825588928e64cdc82"
dependencies = [
 "ascii",
 "chunked_transfer",
 "httpdate",
 "log",
]

[[package]]
name = "tinystr"
version = "0.8.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "abc840c238154d58f9e86b2792261edfde565a17696e1cda1a449de27979801a"
dependencies = [
 "displaydoc",
 "zerovec",
]

[[package]]
name = "tinyvec"
version = "1.13.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fd3ca314f692efd6c868f8408f53fe444634a845f96c028b97d35f6a1f79f0ee"

[[package]]
name = "tokio"
version = "1.54.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b52fd3255258d26fac7264ab5a76b53c13367136dc011d3d6ad4f8ed070396a3"
dependencies = [
 "bytes",
 "libc",
 "mio",
 "pin-project-lite",
 "socket2",
 "windows-sys 0.61.2",
]

[[package]]
name = "tokio-util"
version = "0.7.20"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e464cf451ba96ebfc6f9b6542f17ee8b8956e33f1e40d9690624e59d7a7f8a4b"
dependencies = [
 "bytes",
 "futures-core",
 "futures-sink",
 "pin-project-lite",
 "tokio",
]

[[package]]
name = "toml"
version = "0.8.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "185d8ab0dfbb35cf1399a6344d8484209c088f75f8f68230da55d48d95d43e3d"
dependencies = [
 "serde",
 "serde_spanned 0.6.9",
 "toml_datetime 0.6.3",
 "toml_edit 0.20.2",
]

[[package]]
name = "toml"
version = "1.1.8+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "20489e00e4d8741d6be680764cc12e270655e375a20d1011e844a9c3379e678d"
dependencies = [
 "indexmap 2.14.2",
 "serde_core",
 "serde_spanned 1.1.2",
 "toml_datetime 1.1.2+spec-1.1.0",
 "toml_parser",
 "toml_writer",
 "winnow 1.0.4",
]

[[package]]
name = "toml_datetime"
version = "0.6.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7cda73e2f1397b1262d6dfdcef8aafae14d1de7748d66822d3bfeeb6d03e5e4b"
dependencies = [
 "serde",
]

[[package]]
name = "toml_datetime"
version = "1.1.2+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2b86d767906c6c42421dcba507eb9d203e779497710a47782a224bb871653053"
dependencies = [
 "serde_core",
]

[[package]]
name = "toml_edit"
version = "0.19.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1b5bb770da30e5cbfde35a2d7b9b8a2c4b8ef89548a7a6aeab5c9a576e3e7421"
dependencies = [
 "indexmap 2.14.2",
 "toml_datetime 0.6.3",
 "winnow 0.5.40",
]

[[package]]
name = "toml_edit"
version = "0.20.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "396e4d48bbb2b7554c944bde63101b5ae446cff6ec4a24227428f15eb72ef338"
dependencies = [
 "indexmap 2.14.2",
 "serde",
 "serde_spanned 0.6.9",
 "toml_datetime 0.6.3",
 "winnow 0.5.40",
]

[[package]]
name = "toml_edit"
version = "0.25.17+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e3641d5bbb5349a79e1020a242d251efbc546ad8048d133958323ce9c40a9c9c"
dependencies = [
 "indexmap 2.14.2",
 "toml_datetime 1.1.2+spec-1.1.0",
 "toml_parser",
 "winnow 1.0.4",
]

[[package]]
name = "toml_parser"
version = "1.1.5+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "baa693a8032d7e1cada7d0041e96126df243179ff061456783ac7f12bda4744c"
dependencies = [
 "winnow 1.0.4",
]

[[package]]
name = "toml_writer"
version = "1.1.3+spec-1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "06bdbd8cfc056b8d2e2e85f29b56a3bdbecb527cef81eb39e3e7b98af4652770"

[[package]]
name = "tower"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ebe5ef63511595f1344e2d5cfa636d973292adc0eec1f0ad45fae9f0851ab1d4"
dependencies = [
 "futures-core",
 "futures-util",
 "pin-project-lite",
 "sync_wrapper",
 "tokio",
 "tower-layer",
 "tower-service",
]

[[package]]
name = "tower-http"
version = "0.6.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4cfcf7e2740e6fc6d4d688b4ef00650406bb94adf4731e43c096c3a19fe40840"
dependencies = [
 "bitflags 2.13.2",
 "bytes",
 "futures-util",
 "http",
 "http-body",
 "pin-project-lite",
 "tower",
 "tower-layer",
 "tower-service",
 "url",
]

[[package]]
name = "tower-layer"
version = "0.3.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "121c2a6cda46980bb0fcd1647ffaf6cd3fc79a013de288782836f6df9c48780e"

[[package]]
name = "tower-service"
version = "0.3.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8df9b6e13f2d32c91b9bd719c00d1958837bc7dec474d94952798cc8e69eeec3"

[[package]]
name = "tracing"
version = "0.1.44"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "63e71662fa4b2a2c3a26f570f037eb95bb1f85397f3cd8076caed2f026a6d100"
dependencies = [
 "pin-project-lite",
 "tracing-attributes",
 "tracing-core",
]

[[package]]
name = "tracing-attributes"
version = "0.1.31"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7490cfa5ec963746568740651ac6781f701c9c5ea257c58e057f3ba8cf69e8da"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "tracing-core"
version = "0.1.36"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "db97caf9d906fbde555dd62fa95ddba9eecfd14cb388e4f491a66d74cd5fb79a"
dependencies = [
 "once_cell",
]

[[package]]
name = "tray-icon"
version = "0.25.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b2b9c52859a94554803ccd4a24b98f74148ebc73b90676d783f3490b1bff9d72"
dependencies = [
 "crossbeam-channel",
 "dirs 7.0.0",
 "libappindicator",
 "muda",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-core-graphics",
 "objc2-foundation",
 "once_cell",
 "png",
 "serde",
 "thiserror 2.0.21",
 "windows-sys 0.61.2",
]

[[package]]
name = "try-lock"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e421abadd41a4225275504ea4d6566923418b7f05506fbc9c0fe86ba7396114b"

[[package]]
name = "typeid"
version = "1.0.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bc7d623258602320d5c55d1bc22793b57daff0ec7efc270ea7d55ce1d5f5471c"

[[package]]
name = "typenum"
version = "1.20.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6f5e870be6c3b371b77fe0ee0bafb859fa4964b4404c27de1d380043c4dda20"

[[package]]
name = "uds_windows"
version = "1.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f2f6fb2847f6742cd76af783a2a2c49e9375d0a111c7bef6f71cd9e738c72d6e"
dependencies = [
 "memoffset",
 "tempfile",
 "windows-sys 0.61.2",
]

[[package]]
name = "unicode-ident"
version = "1.0.27"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a2c754d6c33795a1c324727428e5a7dedb5b06195f9890bdbcba760d3e246563"

[[package]]
name = "unicode-segmentation"
version = "1.13.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c6f5d3c3b1bf09027a88a6bc961fc00497d651009560b5463668dc81b0fa87a8"

[[package]]
name = "url"
version = "2.5.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ff67a8a4397373c3ef660812acab3268222035010ab8680ec4215f38ba3d0eed"
dependencies = [
 "form_urlencoded",
 "idna",
 "percent-encoding",
 "serde",
 "serde_derive",
]

[[package]]
name = "urlpattern"
version = "0.6.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "df16f50ef4cc145211879a3867ba757076b25dfee812040dcb0658bd9ae7904b"
dependencies = [
 "icu_properties",
 "regex",
 "serde",
 "url",
]

[[package]]
name = "utf8_iter"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b6c140620e7ffbb22c2dee59cafe6084a59b5ffc27a8859a5f0d494b5d52b6be"

[[package]]
name = "uuid"
version = "1.29.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4a0e2d11620c50695fe12bbbfde96b3477fe606e7284c22d505c12ce51214514"
dependencies = [
 "getrandom 0.4.3",
 "js-sys",
 "serde_core",
 "wasm-bindgen",
]

[[package]]
name = "vcpkg"
version = "0.2.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "accd4ea62f7bb7a82fe23066fb0957d48ef677f6eeb8215f372f52e48bb32426"

[[package]]
name = "version-compare"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "03c2856837ef78f57382f06b2b8563a2f512f7185d732608fd9176cb3b8edf0e"

[[package]]
name = "version_check"
version = "0.9.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0b928f33d975fc6ad9f86c8f283853ad26bdd5b10b7f1542aa2fa15e2289105a"

[[package]]
name = "vswhom"
version = "0.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "be979b7f07507105799e854203b470ff7c78a1639e330a58f183b5fea574608b"
dependencies = [
 "libc",
 "vswhom-sys",
]

[[package]]
name = "vswhom-sys"
version = "0.1.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "fb067e4cbd1ff067d1df46c9194b5de0e98efd2810bbc95c5d5e5f25a3231150"
dependencies = [
 "cc",
 "libc",
]

[[package]]
name = "walkdir"
version = "2.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "29790946404f91d9c5d06f9874efddea1dc06c5efe94541a7d6863108e3a5e4b"
dependencies = [
 "same-file",
 "winapi-util",
]

[[package]]
name = "want"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ec4cdd0dd910afe868b7ef477227d8d538b46b3075031afee8a9f2acb0a2ed0b"
dependencies = [
 "try-lock",
]

[[package]]
name = "wasi"
version = "0.11.1+wasi-snapshot-preview1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ccf3ec651a847eb01de73ccad15eb7d99f80485de043efb2f370cd654f4ea44b"

[[package]]
name = "wasip2"
version = "1.0.4+wasi-0.2.12"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b67efb37e106e55ce722a510d6b5f9c17f083e5fc79afc2badeb12cc313d9487"
dependencies = [
 "wit-bindgen",
]

[[package]]
name = "wasm-bindgen"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9bb54f33acc68fd454578d9820b0bde1a1a3d17aa17bb7b6595806d02886d409"
dependencies = [
 "cfg-if",
 "once_cell",
 "rustversion",
 "wasm-bindgen-macro",
 "wasm-bindgen-shared",
]

[[package]]
name = "wasm-bindgen-futures"
version = "0.4.79"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3cbab34de2d982e9b48e18d216d04c4a6f641066ff19ffb699980f591ee3610e"
dependencies = [
 "js-sys",
 "tokio",
 "wasm-bindgen",
]

[[package]]
name = "wasm-bindgen-macro"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2e29d0c35b16e224a7eeb5cd2d25e3e1968fbd65604117b44d3b789d00ee8535"
dependencies = [
 "quote",
 "wasm-bindgen-macro-support",
]

[[package]]
name = "wasm-bindgen-macro-support"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6f501a8bc3719dba86ef8ae4728879c08001bea749eb1333ac5b91e040e2a6b7"
dependencies = [
 "bumpalo",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "wasm-bindgen-shared",
]

[[package]]
name = "wasm-bindgen-shared"
version = "0.2.129"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23f0c9c52aa7cd7d77769a4cfe2a9adb1b331f489a41d912ce14513d5ab995c6"
dependencies = [
 "unicode-ident",
]

[[package]]
name = "wasm-streams"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9d1ec4f6517c9e11ae630e200b2b65d193279042e28edd4a2cda233e46670bbb"
dependencies = [
 "futures-util",
 "js-sys",
 "wasm-bindgen",
 "wasm-bindgen-futures",
 "web-sys",
]

[[package]]
name = "web-sys"
version = "0.3.106"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "88261b9deccee56594c11a3460c462c41f58d148598fe70ad77070126a68aba4"
dependencies = [
 "js-sys",
 "wasm-bindgen",
]

[[package]]
name = "web-time"
version = "1.1.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5a6580f308b1fad9207618087a65c04e7a10bc77e02c8e84e9b00dd4b12fa0bb"
dependencies = [
 "js-sys",
 "wasm-bindgen",
]

[[package]]
name = "web_atoms"
version = "0.2.6"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ba8b815c1b593dc0baf78dd0f4fc8fdb2de53198fb1163738093e9a311c33fb3"
dependencies = [
 "phf",
 "phf_codegen",
 "string_cache",
 "string_cache_codegen",
]

[[package]]
name = "webkit2gtk"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "a1027150013530fb2eaf806408df88461ae4815a45c541c8975e61d6f2fc4793"
dependencies = [
 "bitflags 1.3.2",
 "cairo-rs",
 "gdk",
 "gdk-sys",
 "gio",
 "gio-sys",
 "glib",
 "glib-sys",
 "gobject-sys",
 "gtk",
 "gtk-sys",
 "javascriptcore-rs",
 "libc",
 "once_cell",
 "soup3",
 "webkit2gtk-sys",
]

[[package]]
name = "webkit2gtk-sys"
version = "2.0.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "916a5f65c2ef0dfe12fff695960a2ec3d4565359fdbb2e9943c974e06c734ea5"
dependencies = [
 "bitflags 1.3.2",
 "cairo-sys-rs",
 "gdk-sys",
 "gio-sys",
 "glib-sys",
 "gobject-sys",
 "gtk-sys",
 "javascriptcore-rs-sys",
 "libc",
 "pkg-config",
 "soup3-sys",
 "system-deps",
]

[[package]]
name = "webview2-com"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f89fca7a704cee10dcb3654c1dbb8941d1783132f1917358af75bec37a7d7e6"
dependencies = [
 "webview2-com-macros",
 "webview2-com-sys",
 "windows",
 "windows-core",
]

[[package]]
name = "webview2-com-macros"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "67a921c1b6914c367b2b823cd4cde6f96beec77d30a939c8199bb377cf9b9b54"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "webview2-com-sys"
version = "0.39.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b3a07132775117d6065853d9d1178157b8c90e228de47129d6bce2c7edebedfb"
dependencies = [
 "thiserror 2.0.21",
 "windows",
 "windows-core",
]

[[package]]
name = "winapi"
version = "0.3.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5c839a674fcd7a98952e593242ea400abe93992746761e38641405d28b00f419"
dependencies = [
 "winapi-i686-pc-windows-gnu",
 "winapi-x86_64-pc-windows-gnu",
]

[[package]]
name = "winapi-i686-pc-windows-gnu"
version = "0.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ac3b87c63620426dd9b991e5ce0329eff545bccbbb34f3be09ff6fb6ab51b7b6"

[[package]]
name = "winapi-util"
version = "0.1.11"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c2a7b1c03c876122aa43f3020e6c3c3ee5c05081c9a00739faf7503aeba10d22"
dependencies = [
 "windows-sys 0.61.2",
]

[[package]]
name = "winapi-x86_64-pc-windows-gnu"
version = "0.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "712e227841d057c1ee1cd2fb22fa7e5a5461ae8e48fa2ca79ec42cfc1931183f"

[[package]]
name = "window-vibrancy"
version = "0.8.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "111e51caca442cafd9bab396628ac4d814880eaea4e63dfd76a12e9f342b5580"
dependencies = [
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-quartz-core",
 "raw-window-handle",
 "windows-sys 0.61.2",
 "windows-version",
]

[[package]]
name = "windows"
version = "0.62.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "527fadee13e0c05939a6a05d5bd6eec6cd2e3dbd648b9f8e447c6518133d8580"
dependencies = [
 "windows-collections",
 "windows-core",
 "windows-future",
 "windows-numerics",
]

[[package]]
name = "windows-collections"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23b2d95af1a8a14a3c7367e1ed4fc9c20e0a26e79551b1454d72583c97cc6610"
dependencies = [
 "windows-core",
]

[[package]]
name = "windows-core"
version = "0.62.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b8e83a14d34d0623b51dce9581199302a221863196a1dde71a7663a4c2be9deb"
dependencies = [
 "windows-implement",
 "windows-interface",
 "windows-link",
 "windows-result",
 "windows-strings",
]

[[package]]
name = "windows-future"
version = "0.3.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e1d6f90251fe18a279739e78025bd6ddc52a7e22f921070ccdc67dde84c605cb"
dependencies = [
 "windows-core",
 "windows-link",
 "windows-threading",
]

[[package]]
name = "windows-implement"
version = "0.60.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "053e2e040ab57b9dc951b72c264860db7eb3b0200ba345b4e4c3b14f67855ddf"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "windows-interface"
version = "0.59.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3f316c4a2570ba26bbec722032c4099d8c8bc095efccdc15688708623367e358"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 2.0.119",
]

[[package]]
name = "windows-link"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f0805222e57f7521d6a62e36fa9163bc891acd422f971defe97d64e70d0a4fe5"

[[package]]
name = "windows-numerics"
version = "0.3.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "6e2e40844ac143cdb44aead537bbf727de9b044e107a0f1220392177d15b0f26"
dependencies = [
 "windows-core",
 "windows-link",
]

[[package]]
name = "windows-result"
version = "0.4.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7781fa89eaf60850ac3d2da7af8e5242a5ea78d1a11c49bf2910bb5a73853eb5"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-strings"
version = "0.5.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7837d08f69c77cf6b07689544538e017c1bfcf57e34b4c0ff58e6c2cd3b37091"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-sys"
version = "0.45.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "75283be5efb2831d37ea142365f009c02ec203cd29a3ebecbc093d52315b66d0"
dependencies = [
 "windows-targets",
]

[[package]]
name = "windows-sys"
version = "0.61.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ae137229bcbd6cdf0f7b80a31df61766145077ddf49416a728b02cb3921ff3fc"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-targets"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8e5180c00cd44c9b1c88adb3693291f1cd93605ded80c250a75d472756b4d071"
dependencies = [
 "windows_aarch64_gnullvm",
 "windows_aarch64_msvc",
 "windows_i686_gnu",
 "windows_i686_msvc",
 "windows_x86_64_gnu",
 "windows_x86_64_gnullvm",
 "windows_x86_64_msvc",
]

[[package]]
name = "windows-threading"
version = "0.2.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3949bd5b99cafdf1c7ca86b43ca564028dfe27d66958f2470940f73d86d75b37"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows-version"
version = "0.1.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e4060a1da109b9d0326b7262c8e12c84df67cc0dbc9e33cf49e01ccc2eb63631"
dependencies = [
 "windows-link",
]

[[package]]
name = "windows_aarch64_gnullvm"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "597a5118570b68bc08d8d59125332c54f1ba9d9adeedeef5b99b02ba2b0698f8"

[[package]]
name = "windows_aarch64_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e08e8864a60f06ef0d0ff4ba04124db8b0fb3be5776a5cd47641e942e58c4d43"

[[package]]
name = "windows_i686_gnu"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c61d927d8da41da96a81f029489353e68739737d3beca43145c8afec9a31a84f"

[[package]]
name = "windows_i686_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "44d840b6ec649f480a41c8d80f9c65108b92d89345dd94027bfe06ac444d1060"

[[package]]
name = "windows_x86_64_gnu"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8de912b8b8feb55c064867cf047dda097f92d51efad5b491dfb98f6bbb70cb36"

[[package]]
name = "windows_x86_64_gnullvm"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "26d41b46a36d453748aedef1486d5c7a85db22e56aff34643984ea85514e94a3"

[[package]]
name = "windows_x86_64_msvc"
version = "0.42.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "9aec5da331524158c6d1a4ac0ab1541149c0b9505fde06423b02f5ef0106b9f0"

[[package]]
name = "winnow"
version = "0.5.40"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f593a95398737aeed53e489c785df13f3618e41dbcd6718c6addbf1395aa6876"
dependencies = [
 "memchr",
]

[[package]]
name = "winnow"
version = "1.0.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "23b97319f7b8343df12cc98938e5c3eb436064524c8d2b4e30a1d3a36eecdf81"
dependencies = [
 "memchr",
]

[[package]]
name = "winreg"
version = "0.10.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "80d0f4e272c85def139476380b12f9ac60926689dd2e01d4923222f40580869d"
dependencies = [
 "winapi",
]

[[package]]
name = "winreg"
version = "0.56.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "7d6f32a0ff4a9f6f01231eb2059cc85479330739333e0e58cadf03b6af2cca10"
dependencies = [
 "cfg-if",
 "windows-sys 0.61.2",
]

[[package]]
name = "wit-bindgen"
version = "0.57.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "1ebf944e87a7c253233ad6766e082e3cd714b5d03812acc24c318f549614536e"

[[package]]
name = "workmemo"
version = "0.2.5"
dependencies = [
 "image",
 "rusqlite",
 "serde",
 "serde_json",
 "tauri",
 "tauri-build",
 "tauri-plugin-autostart",
 "tauri-plugin-single-instance",
 "tiny_http",
 "url",
 "windows-sys 0.61.2",
]

[[package]]
name = "writeable"
version = "0.6.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "3ad82d2a33cdc9674dc7465672f271e096168fcdbe0f799d9e6db8c5892679dc"

[[package]]
name = "wry"
version = "0.57.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "759c50ddad0ef9913bb5496cb9d509a50433a3b78cb0238d61105526589cf0e9"
dependencies = [
 "base64 0.23.1",
 "block2",
 "cookie",
 "crossbeam-channel",
 "dirs 7.0.0",
 "dom_query",
 "dpi",
 "dunce",
 "gdkx11",
 "gtk",
 "http",
 "javascriptcore-rs",
 "jni",
 "libc",
 "ndk",
 "objc2",
 "objc2-app-kit",
 "objc2-core-foundation",
 "objc2-foundation",
 "objc2-ui-kit",
 "objc2-web-kit",
 "percent-encoding",
 "raw-window-handle",
 "sha2",
 "soup3",
 "tao-macros",
 "thiserror 2.0.21",
 "url",
 "webkit2gtk",
 "webkit2gtk-sys",
 "webview2-com",
 "windows",
 "windows-core",
 "windows-version",
 "x11-dl",
]

[[package]]
name = "x11"
version = "2.21.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "502da5464ccd04011667b11c435cb992822c2c0dbde1770c988480d312a0db2e"
dependencies = [
 "libc",
 "pkg-config",
]

[[package]]
name = "x11-dl"
version = "2.21.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "38735924fedd5314a6e548792904ed8c6de6636285cb9fec04d5b1db85c1516f"
dependencies = [
 "libc",
 "once_cell",
 "pkg-config",
]

[[package]]
name = "yoke"
version = "0.8.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "417ef3fcf6c300b7dbd25c85531a746931c02ad536f3cf4786ed1e88223340b3"
dependencies = [
 "stable_deref_trait",
 "yoke-derive",
 "zerofrom",
]

[[package]]
name = "yoke-derive"
version = "0.8.4"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ec8ebde2db3681e8c9980cc27822030e68752690ddfa9473e739aeb4dbde6d71"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "synstructure",
]

[[package]]
name = "zbus"
version = "5.19.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "5db4be7c075cb421e4b7ee645541604239bd243ba7c357511f4ff3a74b555907"
dependencies = [
 "async-broadcast",
 "async-executor",
 "async-io",
 "async-lock",
 "async-process",
 "async-recursion",
 "async-task",
 "async-trait",
 "blocking",
 "enumflags2",
 "event-listener",
 "futures-core",
 "futures-lite",
 "hex",
 "libc",
 "ordered-stream",
 "rustix",
 "serde",
 "serde_repr",
 "tracing",
 "uds_windows",
 "uuid",
 "windows-sys 0.61.2",
 "winnow 1.0.4",
 "zbus_macros",
 "zbus_names",
 "zvariant",
]

[[package]]
name = "zbus_macros"
version = "5.19.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "2990635d09ade6df1868f72f8cac69a876a90981e8bd3c40b1be413f8dc88f40"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "zbus_names",
 "zvariant",
 "zvariant_utils",
]

[[package]]
name = "zbus_names"
version = "4.3.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "812a12be4ead7a59e18ea8f047d08add0066b73bc62fc1467066a2472ae088dd"
dependencies = [
 "serde",
 "winnow 1.0.4",
 "zvariant",
]

[[package]]
name = "zcheapstr"
version = "1.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "939f186d9ecebe044315a5cb6d6f78568bbc21152adc954d5a0c2f58bdbc9920"
dependencies = [
 "serde",
]

[[package]]
name = "zerofrom"
version = "0.1.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "0ec05a11813ea801ff6d75110ad09cd0824ddba17dfe17128ea0d5f68e6c5272"
dependencies = [
 "zerofrom-derive",
]

[[package]]
name = "zerofrom-derive"
version = "0.1.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f75b4683f6c7f45248d4d64056a24298c6281e0993356d7d1b4a1a962ef10d4a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "synstructure",
]

[[package]]
name = "zerotrie"
version = "0.2.5"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ea269c3bd32f0a32c321907a2ae912ba6f4649bb0fc764a15627e99a7095a3f"
dependencies = [
 "displaydoc",
 "yoke",
 "zerofrom",
]

[[package]]
name = "zerovec"
version = "0.11.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "f58a2799cfe9a1670c7ea8edbd52ef8edb93cb37a7f83bf31ba9e35d9dae6a40"
dependencies = [
 "yoke",
 "zerofrom",
 "zerovec-derive",
]

[[package]]
name = "zerovec-derive"
version = "0.11.7"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "c3743ddbf47738d929cd1ae2e199d40d0162979dfe31aef8ae646d2bf00bf97a"
dependencies = [
 "proc-macro2",
 "quote",
 "syn 3.0.9",
]

[[package]]
name = "zlib-rs"
version = "0.6.8"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "b268e58e7c693d7c271f93ffc4ba3b380412554231c85bf61ca7af91042a4112"

[[package]]
name = "zmij"
version = "1.0.23"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "29666d0abbfad1e3dc4dcf6144730dd3a3ab225bbbdac83319345b1b44ccfc1b"

[[package]]
name = "zune-core"
version = "0.5.3"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "d56377fd46368984a170bc5aac5567e52ca5da874caa60bea39fcbca78fb658b"

[[package]]
name = "zune-jpeg"
version = "0.5.15"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "27bc9d5b815bc103f142aa054f561d9187d191692ec7c2d1e2b4737f8dbd7296"
dependencies = [
 "zune-core",
]

[[package]]
name = "zvariant"
version = "5.15.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "80bf6d6cd6a4b601acb64cfb8284cdc643fcfa75ef26ae3c46ec8aa4e8a1fbb7"
dependencies = [
 "endi",
 "enumflags2",
 "serde",
 "winnow 1.0.4",
 "zcheapstr",
 "zvariant_derive",
 "zvariant_utils",
]

[[package]]
name = "zvariant_derive"
version = "5.15.1"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "ef2672456ba1cb54b5eaec136e63135b3c7495fb938e53b28a62e633496d486d"
dependencies = [
 "proc-macro-crate 3.5.0",
 "proc-macro2",
 "quote",
 "syn 3.0.9",
 "zvariant_utils",
]

[[package]]
name = "zvariant_utils"
version = "4.2.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "bad0294361a320b694a328460dc73add56c306150f5cb6bfafc44446120008a3"
dependencies = [
 "proc-macro2",
 "quote",
 "serde",
 "syn 3.0.9",
 "winnow 1.0.4",
]
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\src-tauri\Cargo.toml

~~~~~~~~~~~~toml
[package]
name = "workmemo"
version = "0.2.5"
description = "Local personal work journal and focus timer"
edition = "2024"
default-run = "workmemo"

[features]
custom-protocol = ["tauri/custom-protocol"]

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "workmemo_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }
serde_json = "1"

[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.41", features = ["bundled", "backup"] }
url = "2.5.8"
tiny_http = "0.12"
image = { version = "0.25", default-features = false, features = ["png", "jpeg", "webp"] }

[target.'cfg(windows)'.dependencies]
tauri-plugin-autostart = "=2.5.1"
tauri-plugin-single-instance = "2"
windows-sys = { version = "0.61.2", features = ["Win32_Foundation", "Win32_Media_Audio", "Win32_Security_Cryptography", "Win32_Graphics_Gdi", "Win32_System_SystemInformation", "Win32_System_Threading", "Win32_System_LibraryLoader", "Win32_System_Registry", "Win32_System_RemoteDesktop", "Win32_System_Power", "Win32_UI_WindowsAndMessaging", "Win32_UI_Shell", "Win32_UI_Controls_Dialogs", "Win32_UI_Input_KeyboardAndMouse"] }


# Read the optimization guideline for more details: https://tauri.app/concept/size/#cargo-configuration
[profile.release]
codegen-units = 1
lto = true
opt-level = 3
panic = "abort"
strip = true
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\src-tauri\src\startup.rs

~~~~~~~~~~~~rust
use serde::{Deserialize, Serialize};
use std::{path::PathBuf, sync::Mutex};
use tauri::{Emitter, Manager};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Preference {
    version: u8,
    enabled: bool,
}

pub struct StartupState {
    path: PathBuf,
    gate: Mutex<()>,
    initial_error: Mutex<Option<String>>,
}

#[derive(Serialize)]
pub struct StartupStatus {
    enabled: bool,
    available: bool,
    error: Option<String>,
}

fn decode(bytes: &[u8]) -> Result<Preference, String> {
    let value: Preference = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if value.version != 1 {
        return Err("开机启动设置版本不受支持，原文件已保留。".into());
    }
    Ok(value)
}

fn persist(path: &std::path::Path, enabled: bool) -> Result<(), String> {
    use std::io::Write;
    std::fs::create_dir_all(path.parent().ok_or("启动配置目录无效")?).map_err(|e| e.to_string())?;
    let temporary = path.with_extension("pending");
    let mut file = std::fs::File::create(&temporary).map_err(|e| e.to_string())?;
    file.write_all(
        &serde_json::to_vec(&Preference {
            version: 1,
            enabled,
        })
        .map_err(|e| e.to_string())?,
    )
    .and_then(|_| file.sync_all())
    .map_err(|e| e.to_string())?;
    drop(file);
    std::fs::rename(temporary, path).map_err(|e| e.to_string())
}

fn available(app: &tauri::AppHandle) -> bool {
    cfg!(windows) && !cfg!(debug_assertions) && app.config().identifier == "com.workmemo.desktop"
}

#[cfg(windows)]
fn register(app: &tauri::AppHandle, enabled: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let manager = app.autolaunch();
    let previous = startup_key(false)?
        .map(|key| key.read("WorkMemo"))
        .transpose()?
        .flatten();
    // The plugin opens Run rather than creating it on a fresh Windows profile.
    let _run_key = startup_key(true)?.ok_or("当前用户的开机启动目录不可用")?;
    if enabled {
        let result = manager
            .enable()
            .map_err(|e| e.to_string())
            .and_then(|_| refresh_path());
        if let Err(error) = result {
            let restored = (|| {
                if let Some(key) = startup_key(previous.is_some())? {
                    if let Some(value) = previous {
                        key.write("WorkMemo", &value)?;
                    } else {
                        key.remove("WorkMemo")?;
                    }
                }
                Ok::<_, String>(())
            })();
            return Err(match restored {
                Ok(()) => error,
                Err(restore) => format!("{error}；原启动项恢复失败：{restore}"),
            });
        }
    } else if previous.is_some() {
        manager.disable().map_err(|e| e.to_string())?;
    }
    if manager.is_enabled().map_err(|e| e.to_string())? != enabled {
        return Err("系统启动项未能应用，请重试。".into());
    }
    Ok(())
}

#[cfg(windows)]
fn startup_key(create: bool) -> Result<Option<crate::registration::windows_registry::Key>, String> {
    crate::registration::windows_registry::Key::open(
        r"Software\Microsoft\Windows\CurrentVersion\Run",
        create,
        windows_sys::Win32::System::Registry::KEY_WOW64_64KEY,
    )
    .map_err(|e| format!("无法访问当前用户的开机启动项：{e}"))
}

fn startup_command(executable: &std::path::Path) -> String {
    format!("\"{}\" --autostart", executable.display())
}

#[cfg(windows)]
fn refresh_path() -> Result<(), String> {
    let key = startup_key(true)?.ok_or("启动项不可用")?;
    let command = startup_command(&std::env::current_exe().map_err(|e| e.to_string())?);
    key.write("WorkMemo", &command)?;
    if key.read("WorkMemo")?.as_deref() != Some(command.as_str()) {
        return Err("开机启动路径写入后校验失败".into());
    }
    Ok(())
}

pub fn initialize(app: &tauri::App) -> Result<StartupState, String> {
    let path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("startup.json");
    let mut initial_error = None;
    if available(app.handle()) {
        let result = (|| {
            let mut first_run = false;
            let preference = match std::fs::read(&path) {
                Ok(bytes) => decode(&bytes)?,
                Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
                    first_run = true;
                    persist(&path, true)?;
                    Preference {
                        version: 1,
                        enabled: true,
                    }
                }
                Err(e) => return Err(e.to_string()),
            };
            #[cfg(windows)]
            {
                use tauri_plugin_autostart::ManagerExt;
                if first_run || !preference.enabled {
                    register(app.handle(), preference.enabled)?;
                } else if app.autolaunch().is_enabled().map_err(|e| e.to_string())? {
                    // Update moved/updated executables without overriding Task Manager's choice.
                    refresh_path()?;
                } else {
                    persist(&path, false)?;
                }
            }
            let _ = preference;
            Ok::<_, String>(())
        })();
        initial_error = result.err();
    }
    Ok(StartupState {
        path,
        gate: Mutex::new(()),
        initial_error: Mutex::new(initial_error),
    })
}

#[tauri::command]
pub fn get_startup_status(
    app: tauri::AppHandle,
    window: tauri::Window,
) -> Result<StartupStatus, String> {
    if !matches!(window.label(), "settings" | "main") {
        return Err("窗口不匹配".into());
    }
    let state = app.state::<StartupState>();
    let available = available(&app);
    let mut enabled = false;
    let mut error = state
        .initial_error
        .lock()
        .map_err(|_| "启动状态锁异常")?
        .clone();
    #[cfg(windows)]
    if available {
        use tauri_plugin_autostart::ManagerExt;
        match app.autolaunch().is_enabled() {
            Ok(value) => enabled = value,
            Err(e) => error = Some(e.to_string()),
        }
    }
    Ok(StartupStatus {
        enabled,
        available,
        error,
    })
}

#[tauri::command]
pub fn set_startup_enabled(
    app: tauri::AppHandle,
    window: tauri::Window,
    enabled: bool,
) -> Result<StartupStatus, String> {
    if window.label() != "settings" || !available(&app) {
        return Err("仅正式 Windows 版本的设置窗口可以修改开机启动。".into());
    }
    let state = app.state::<StartupState>();
    let _guard = state.gate.lock().map_err(|_| "启动设置锁异常")?;
    let result = (|| {
        // Never replace a malformed preference, including when a toggle is retried.
        if state.path.exists() {
            decode(&std::fs::read(&state.path).map_err(|e| e.to_string())?)?;
        }
        persist(&state.path, enabled)?;
        #[cfg(windows)]
        register(&app, enabled)?;
        Ok::<_, String>(())
    })();
    *state.initial_error.lock().map_err(|_| "启动状态锁异常")? = result.as_ref().err().cloned();
    let _ = app.emit("workmemo:startup-changed", ());
    result?;
    Ok(StartupStatus {
        enabled,
        available: true,
        error: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn startup_preference_preserves_disabled_and_rejects_corruption() {
        assert!(!decode(br#"{"version":1,"enabled":false}"#).unwrap().enabled);
        assert!(decode(br#"{"version":1,"enabled":true}"#).unwrap().enabled);
        assert!(decode(br#"{"version":2,"enabled":true}"#).is_err());
        assert!(decode(br#"{"version":1}"#).is_err());
        assert!(decode(b"broken").is_err());
    }
    #[test]
    fn login_command_quotes_paths_with_spaces() {
        assert_eq!(
            startup_command(std::path::Path::new(r"C:\Work Memo\workmemo.exe")),
            "\"C:\\Work Memo\\workmemo.exe\" --autostart"
        );
    }
}
~~~~~~~~~~~~

## UPDATE — E:\WorkMemo\src-tauri\tauri.conf.json

~~~~~~~~~~~~json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "WorkMemo",
  "version": "0.2.5",
  "identifier": "com.workmemo.desktop",
  "build": {
    "beforeDevCommand": "npm run bridge:dev && npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "beforeBundleCommand": "node scripts/stage-browser-resources.mjs",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "visible": false,
        "title": "WorkMemo",
        "width": 780,
        "height": 560,
        "minWidth": 360,
        "minHeight": 280,
        "center": true,
        "backgroundColor": "#00000000",
        "transparent": true,
        "decorations": false,
        "shadow": false,
        "noRedirectionBitmap": true,
        "resizable": true,
        "maximizable": false,
        "alwaysOnTop": false,
        "skipTaskbar": false
      }
    ],
    "security": {
      "csp": "default-src 'self'; connect-src ipc: http://ipc.localhost http://localhost:1420 ws://localhost:1420; img-src 'self' data: http://background.localhost background:; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "publisher": "noharass",
    "shortDescription": "本地工作记录与有效时长工具",
    "category": "Productivity",
    "resources": {
      "../docs/THIRD-PARTY-LICENSES.txt": "THIRD-PARTY-LICENSES.txt",
      "target/browser-resources/": ""
    },
    "windows": {
      "webviewInstallMode": {
        "type": "downloadBootstrapper",
        "silent": true
      },
      "nsis": {
        "installMode": "currentUser",
        "languages": ["SimpChinese", "English"],
        "displayLanguageSelector": false,
        "installerHooks": "installer/browser-bridge.nsh",
        "installerIcon": "icons/icon.ico",
        "uninstallerIcon": "icons/icon.ico"
      }
    },
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  }
}
~~~~~~~~~~~~
