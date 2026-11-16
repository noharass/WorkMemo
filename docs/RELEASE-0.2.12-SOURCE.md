# WorkMemo 0.2.12 完整源码清单

2026-11-16。文件均保存在以下完整路径，版本锁文件完整内容可直接打开，原修复代码见 WEB-FEEDBACK-FIX-SOURCE.md。

- UPDATE `E:\WorkMemo\package.json`
- UPDATE `E:\WorkMemo\package-lock.json`
- UPDATE `E:\WorkMemo\src-tauri\Cargo.toml`
- UPDATE `E:\WorkMemo\src-tauri\Cargo.lock`
- UPDATE `E:\WorkMemo\src-tauri\tauri.conf.json`
- UPDATE `E:\WorkMemo\browser-extension\manifest.json`
- UPDATE `E:\WorkMemo\README.md`
- UPDATE `E:\WorkMemo\docs\USER-GUIDE.md`
- UPDATE `E:\WorkMemo\docs\BUILDING.md`
- UPDATE `E:\WorkMemo\docs\PHASE-8.md`
- NEW FILE `E:\WorkMemo\docs\RELEASE-0.2.12.md`

本清单自身为 NEW FILE `E:\WorkMemo\docs\RELEASE-0.2.12-SOURCE.md`。

## E:\WorkMemo\package.json

````json
{
  "name": "workmemo",
  "private": true,
  "version": "0.2.12",
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
````

## E:\WorkMemo\src-tauri\Cargo.toml

````toml
[package]
name = "workmemo"
version = "0.2.12"
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
````

## E:\WorkMemo\src-tauri\tauri.conf.json

````json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "WorkMemo",
  "version": "0.2.12",
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
````

## E:\WorkMemo\browser-extension\manifest.json

````json
{
  "manifest_version": 3,
  "name": "WorkMemo 本地工作监测",
  "version": "0.2.12",
  "version_name": "0.2.12",
  "description": "授权后将去除参数的网页地址和匹配状态传给本机 WorkMemo；不读取网页内容或输入文本。",
  "minimum_chrome_version": "120",
  "permissions": [
    "nativeMessaging",
    "alarms",
    "scripting"
  ],
  "optional_permissions": ["tabs"],
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
````

## E:\WorkMemo\README.md

````markdown
<p align="center">
  <img src="public/workmemo.png" width="88" height="88" alt="WorkMemo 图标" />
</p>

<h1 align="center">WorkMemo</h1>

<p align="center"><strong>让忙过的一天，有迹可循。</strong></p>
<p align="center">一个安静待在桌面上的工作记录小工具。记下做了什么、花了多久，工作量可以忙完再补。</p>

<p align="center">
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.12/WorkMemo_0.2.12_x64-setup.exe"><strong>下载 Windows 安装版</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/download/v0.2.12/WorkMemo_0.2.12_windows_x64.zip">下载免安装 ZIP</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/noharass/WorkMemo/releases/tag/v0.2.12">v0.2.12 更新说明</a>
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
2. 想先试试，点击「新建任务」，选择类别后点击「开始工作」；结束后到「待补全」填写工作量，填 `0` 也可以。
3. 想用自动记录，打开「监测设置」，按[使用说明](docs/USER-GUIDE.md#使用-chrome-自动记录)装好配套扩展、添加工作网址并同步授权。

自动记录需要 Chrome 配套扩展；手动计时不需要。软件使用 Microsoft WebView2，安装版会在缺少时引导安装。

## 这次更新：网页工时、弹窗与日期筛选修正

**v0.2.12** 将趋势和工作日历数据表的有效工时改为小时/分钟；详情、补填及确认弹窗采用短距离淡入过渡，减少移动卡片的模糊开销。日期筛选翻到上个月或上一年后，不再因后台刷新跳回已选月份。

数据库仍为 schema 12，从 v0.2.10 / v0.2.11 更新无需新增迁移；更旧版本升级前请备份。Windows x64 成品未签名，需 WebView2。实际机器的流畅体感、Narrator、系统 DPI、实际扩展联动和安装卸载未全部复验，详情见发布记录。

[查看 v0.2.12 下载与更新说明](https://github.com/noharass/WorkMemo/releases/tag/v0.2.12) · [构建校验与验收限制](docs/RELEASE-0.2.12.md)

历史版本和开发阶段记录继续保留在 docs 与 Releases 中。

## 从旧版本过来

更新前请先备份数据、从托盘退出旧版；更新后在 Chrome 扩展页重新加载配套扩展。**正式版与预览版的数据各自独立**：

- 从正式版更新：安装新版，沿用原有正式记录。
- 从预览版迁移：先退出预览版，再到新版「设置 → 数据管理」查看来源和数量，确认后合并；重复导入会跳过，有变化的记录会提示冲突。
- 想回退旧版：保留旧安装包和升级前的记录、设置备份；旧版可能无法读取新的音效、透明度设置或数据库格式。

具体步骤与数据位置见[使用说明](docs/USER-GUIDE.md#升级迁移与回退)。历史预览版仍保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。

## 你的记录，留在你的电脑里

WorkMemo 不需要云账号。工作记录、监测设置、背景图片和备份都保存在本机。数据中心也由本机软件提供，使用期间请保持 WorkMemo 在后台运行。Chrome 扩展只在你授权的工作站点观察页面是否匹配、是否发生操作，不读取输入内容、具体按键或网页正文。

自动记录依赖页面连接和输入活动；阅读、思考时可能少计。遇到连接中断，会暂停无法确认的时间。检测间隔是目标频率，浏览器休眠或系统繁忙时可能延迟。

## 有哪里不顺手，告诉我

欢迎[提一个 Issue](https://github.com/noharass/WorkMemo/issues/new)。描述一下当时做了什么、希望它怎样工作，再附上软件版本和错误提示就好。请不要上传真实工作数据库或私人备注。

[使用说明](docs/USER-GUIDE.md) · [下载与更新](https://github.com/noharass/WorkMemo/releases/latest) · [反馈问题](https://github.com/noharass/WorkMemo/issues)
````

## E:\WorkMemo\docs\USER-GUIDE.md

````markdown
# WorkMemo v0.2.12 使用说明

v0.2.12 将趋势/日历工时数据表改为小时/分钟，简化详情、补填和确认弹窗过渡，修复日期面板被后台刷新重置月份的问题。数据库仍为 schema 12，从 v0.2.10 / v0.2.11 更新无需新增迁移。

v0.2.11 修正网页报表的未结束状态、短工时精度、跨年标签和连接恢复；补齐字段错误定位、键盘焦点、趋势/日历数据表及自定义趋势的空白周期。网页加载也避开了未使用的桌面代码。数据库仍为 schema 12，从 v0.2.10 更新无需新增迁移。

v0.2.10 包含北京时间零点结束跨日暂停任务及网页直接补记录功能，数据库升级至 schema 12。升级前请先备份；升级后旧版不能直接读取新数据库。历史 v0.2.9 的功能与发布说明保留在下文。

v0.2.9 基于 0.2.8 的页面任务与多任务功能，包含灵动岛默认收起和新建／绑定入口修复，使用 schema 10；原始 0.2.7 为 schema 9。

WorkMemo 是 Windows 本地工作记录工具。可以手动计时，也可以配合 Chrome，识别工作页面并确认开工后记录。数量和备注可以忙完再补。

## 安装与启动

适用于 Windows 10 / 11 x64，需要 Microsoft Edge WebView2 Runtime。

- **安装版**：运行 `WorkMemo_0.2.12_x64-setup.exe`，按向导安装。缺少 WebView2 时需要联网安装 Microsoft 官方运行环境。
- **免安装版**：完整解压 `WorkMemo_0.2.12_windows_x64.zip`，打开 `WorkMemo/workmemo.exe`。主程序旁边的浏览器组件、`extension` 文件夹和修复脚本都请保留。缺少 WebView2 时，从 [Microsoft 官网](https://developer.microsoft.com/microsoft-edge/webview2/)安装。
- 不需要开发工具或数据库服务。免安装表示程序不用安装；记录仍存放在当前 Windows 用户的数据目录，不会随解压文件夹移动。
- 从 [WorkMemo v0.2.12 正式版](https://github.com/noharass/WorkMemo/releases/tag/v0.2.12)下载安装版或完整 ZIP。程序暂未签名，可用随附 `SHA256SUMS.txt` 核对下载文件。

## 手动记录一段工作

1. 点击「新建任务」，再选择工作类别（初始为评测、质检、开发、文档，可在设置改名），点击「开始工作」。工作量和备注可以先不填。
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
- 「布局」可选择舒展或紧凑、正文 12–18px、字重与行距，也可开关提示音、选择 FiftySounds／柔和／清脆套装并分别试听五种状态。保存后生效，原有静音选择保留；试听不受开关限制。紧凑模式说明和高级选项按需展开。
- **关闭主窗口只是隐藏到后台**。要完全关闭，从托盘选择「退出 WorkMemo」。

## Chrome 数据中心

点击底部「今日工作量」或「待补全」打开；状态岛结束提醒可直接在展开区域补填。优先使用已安装的 Chrome；未找到时可以复制本机地址或选择默认浏览器。

数据中心需要 WorkMemo 在后台运行。退出软件后连接断开，不能提交修改；重新启动后从软件重新打开数据页。页面资源在本地，不需要云账号。

- 默认查看今天，可切换自然日／周／月，前后翻周期或回到当前周期。每周从周一到周日；月份按自然月。自定义范围也可选择全部日期。
- 分类工作量表分别汇总每类已确认数量、有效工时、已结束记录和待补填数，不把不同类型数量混加。明确填写 0 显示 0，待补填不视为 0。当前任务单独显示，不计入已结束报表。右侧待补填「x 条」先列出当前周期、分类和数据范围内的记录，选择具体一条后补填；保存后返回列表，失败或冲突保留输入。
- 工时趋势按记录开始小时（日）或开始日期（周／月）汇总，跨午夜仍归入开始日；不是实时逐小时工作区间。类别分布、工时占比饼图与工作日历在「辅助分析」展开；饼图按有效工时占比，可点击扇区或图例筛选类别，日历最多展示筛选范围内的近 90 天。自定义长跨度可按月汇总；明细继续分页。
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

恢复出的未结束任务保持暂停、待恢复状态，不自动补计停机时间。恢复后请检查监测配置，并在 Chrome 扩展中同步站点授权。v0.2.9 也支持恢复兼容的旧版备份，并在临时副本中完成迁移。

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

v0.2.9 使用 schema 10，升级后的数据库不能直接交给原始 v0.2.7、v0.2.2 等旧程序读取。先从托盘退出新版，保留新版数据的副本，再安装旧版并恢复**升级前保存的整目录备份**。`.workmemo` 备份应使用支持此格式的 WorkMemo 版本恢复，不要直接交给旧版。

旧版和历史预览版安装包保留在 [Releases](https://github.com/noharass/WorkMemo/releases)。卸载或清理目录前，请确认重要备份已经另存。

## 反馈问题

在 [GitHub Issues](https://github.com/noharass/WorkMemo/issues/new) 提供软件版本、Windows 版本、错误文字和复现步骤即可。不要公开真实工作数据库、私人备注或连接信息。

第三方依赖声明见随附 `THIRD-PARTY-LICENSES.txt`。

## v0.2.7 界面、补填与提示音

- 分类待补填先选记录，保存后返回列表；已保存但刷新失败时可单独重试读取，不必重复提交。
- 辅助分析增加工时占比，包含已结束但待补填的有效工时，不包含当前任务。没有有效工时时显示空状态。
- 网页导航悬浮标签在点击后关闭；常规说明可按需展开，错误、恢复与未保存提示继续直接显示。底部两条信息卡片统一圆角。
- 四皮肤新默认不透明度为 65%，范围 40–100%；原有设置保留。滑块只影响背景，文字和图标保持清晰。
- 默认提示音为 FiftySounds，首次升级会切换，静音状态不变；保存其他套装后，后续重启不会再次覆盖。素材来源及许可保留在第三方声明中。
- 原始 0.2.7 使用 SQLite schema 9，2026-11-09 同版本修订使用 schema 10；旧版可能无法读取新数据库、低于 80% 的外观值或 fiftysounds 音效选项。回退前保留升级前的数据库与设置备份，不要假设只替换旧 EXE 就能完整还原。

## 延续 v0.2.6 的连续开工与设置保存修正

- 主窗口空闲时显示监测状态；点击「新建任务」进入手动表单，返回后输入仍保留在本次运行中。重启不承诺恢复尚未提交的手动草稿。
- 结束后继续监测；工作页出现新操作时，灵动岛优先显示识别类别和「开始记录」，确认前不计时。旧工作量未补填不阻挡下一项开工。
- 编辑旧任务工作量时，新开工通过岛顶部按钮确认，旧结算保持原记录与输入；当前任务优先显示，旧记录可从待补全继续处理。
- 设置保存不再反复重建表单；保存期间阻止重复提交和重复离开，失败保留输入，成功只执行一次目标操作，慢速保存后恢复原输入焦点。
- 本版修正了可复现的重复加载；Windows 原生闪动、透明和焦点验收受截图工具限制，不能承诺所有硬件环境均无闪动。

## 延续 v0.2.5 的桌面功能

- 顶部保留标识、设置、拖动区域和窗口操作；「仅浏览」使用眼睛图标及简短文字，开启时突出显示。
- 双箭头「切换任务」和原有暂停、备注、结束同排。新建与当前任务互斥；暂停后可切换，工作量仍可稍后填写，0 与未填不同。
- 状态岛主体保持固定尺寸和位置，允许拖动；提醒及填写区域只向下动画展开，共用背景。保存成功后收起，失败保留输入；新任务不会覆盖正在补填的旧记录。
- 默认开启当前用户开机启动，登录 Windows 后主窗口留在后台，可从托盘打开。在「设置 → 布局 → 开机启动」可以立即关闭；已有关闭选择或任务管理器禁用后不会强制重开。开发与隔离预览不注册启动项。
- 同一正式标识只运行一个实例。重复手动启动会打开已有窗口，重复自启不会抢出主窗口。
- 自启是软件完整退出后的再次启动，不会补算关闭期间工时，也不会绕过未结束任务的待恢复确认。移动 ZIP 目录后运行一次新目录的主程序可更新已启用的自启路径；不要删除正在使用的程序目录。
- 网页分类待补填先选择具体记录，保存后返回列表；详情居中，保留未保存保护、滚动和减少动态效果。

更新后请手动安装或完整解压新版，并在 Chrome 重新加载 0.2.9 配套扩展；旧程序不会自行替换。新版本验收范围与限制见 [本次发布记录](https://github.com/noharass/WorkMemo/blob/main/docs/RELEASE-0.2.9.md)。

## 延续 v0.2.3 的功能

- 键鼠空闲自动暂停，可修改阈值；继续原任务，暂停不计时，保留较长空闲结束规则。
- 四类可改名，新旧记录与网址归属保持一致。
- 自然日／周／月分类报表及新的报表优先布局，0、待补填和无记录分开显示。
- 原有柔和／清脆提示音保留，可在布局设置选回；开始、暂停、恢复、结束、空闲提醒可分别试听。
- 数据库迁移至 schema 9，保留旧记录、有效区间、修正历史及自增 ID。

### 延续 v0.2.2 的功能

- 灵动岛常态约 320×56 逻辑像素，暂停与继续位于计时右侧，继续沿用同一记录。开工确认时临时展开，浏览状态的开始入口位于右侧。
- 「监测设置 → 工作页面」可选择路径前缀、整个站点、域名后缀。已有规则默认保留路径前缀；新规则保存后，在 Chrome 扩展页重新加载 0.2.9 配套扩展并同步工作站点授权。
- 整个站点示例：`https://moonshot.feishu.cn` 覆盖该来源所有路径；域名后缀示例：`.cn-beijing-vpc.fcapp.run` 覆盖该域名及其子域名。匹配后仍需新操作和开工确认。
- 重叠时路径规则优先，其次整个站点，最后域名后缀；同类优先更具体的规则。域名后缀授权包含 HTTP 与 HTTPS，范围仅为配置的域名及子域名。
- 「布局」新增关键状态提示音开关和试听；默认开启，修改后点击保存布局。音效音量跟随 Windows 应用音量，播放失败不会影响记录。
- 总览侧栏、筛选及卡片更紧凑；工作节奏改为灰色零值与四档绿色。详情中的编辑入口修复，保存失败会保留输入。

## 一项工作使用多个网站

打开「监测设置 → 工作与网址」，展开对应工作（评测、质检、开发、文档），点击「为这项工作添加 URL」继续添加网址。每个 URL 可独立选择路径前缀、整个站点或域名后缀；例如评测可同时添加飞书站点和工作平台域名后缀。

点击「保存监测配置」后，在 Chrome 扩展中同步所有工作站点授权。已有配置会自动按归属工作分组，无需重新填写；全部工作合计最多 50 个 URL。进行中的同一工作在匹配站点之间切换时不拆分、不重复开工；空闲、离页和暂停规则保持。移除某个 URL 不影响同组其他网址；可用「归属工作」移动网址。

## 总览布局

周期与筛选在顶部，其下为有效工时、已结束记录和待补全三个概览，再展示分类工作量表。趋势和可展开的辅助分析位于下方，底部保留完整工作明细。窄屏分类表改为卡片，长名称可换行；明细表在自身区域横向滚动。趋势图例与坐标轴单位分行留出间距，不显示灰色缩放条。

## 页面与任务自动切换

v0.2.10：数据中心右上角新增「补记录」。填写类别、工作量（可明确填 0）、北京时间起止时间、需扣除的休息分钟数和备注，保存后生成「人工补录」已确认记录，计入统计并定位到记录开始日；跨日记录仍归开始日。有效工时不会超过时间跨度，不能补录未来时间，也不会修改正在计时的任务。支持 Ctrl+S；保存失败保留输入，连接中断时原样重试可避免重复新增，取消未保存输入前会提示。演示范围不能创建真实补录。

v0.2.10：北京时间每日 00:00，上一日已停止计时的暂停、挂起和待恢复任务直接结束，包含手动暂停；工时保留并转入待补全。正在计时的任务不受影响。软件关闭期间跨日，重开后的首次状态读取／后台检查会补处理；再次使用已结束任务时需新建或重新绑定。不是停表后滚动 24 小时。

v0.2.9：灵动岛默认收起；切换标签、新网页、开工确认、空闲和结束提醒只更新短文字及展开箭头旁的静态圆点，不会自动展开。点击箭头可查看并处理；手动收起后切页仍保持收起。已经打开的补填表单继续保留输入，关闭时仍会保护未保存内容。

在扩展弹窗授权识别新网页，并按需授权工作站点。新网页会暂停当前计时，可选择任务、新建任务或忽略，并选择匹配范围；已绑定网页可切换到对应未结束任务。手动暂停、仅浏览和重启待确认状态不会自动开表。返回网页后需要新的有效操作，无法可靠归属的时间不会补算。升级前请备份数据，旧版不能直接读取 schema 10。

2026-11-09 同版本修订：网页绑定的任务已结束时，点击灵动岛「打开主窗口处理」，可直接选择「新建任务」并填写名称和类别，或选择「绑定已有任务」后选择未结束任务，再点「确认绑定」。仅浏览状态下也可处理绑定；保存绑定不会退出仅浏览或开始计时。仅浏览时需明确选择开始记录。旧记录的工时和待补全信息保留。
````

## E:\WorkMemo\docs\BUILDING.md

````markdown
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

2026-11-16 用户指定发布0.2.12，包含三项网页体验修正；发布命令、实际结果和限制见 [RELEASE-0.2.12.md](RELEASE-0.2.12.md)。

2026-11-16 网页三项反馈修正与新增 `node scripts/verify-web-feedback.mjs` 见 [WEB-FEEDBACK-FIX.md](WEB-FEEDBACK-FIX.md)，公开 0.2.11 未替换。

2026-11-16 用户确认新版本0.2.11公开发布，应用与扩展版本统一，数据库仍schema12。生产构建、发布流程、完整校验及未完成的原生验收见 [RELEASE-0.2.11.md](RELEASE-0.2.11.md)。

2026-11-16 网页阶段D已完成自动验收和0.2.10候选构建，新增实际Chromium浏览器缩放、独立原生HTTP和成品内容核验。用户手动确认独立桌面窗口显示、透明和操作正常；Narrator/系统DPI/扩展联动/安装卸载未全验收。完整路径、命令、校验值和待确认发布边界见 [WEB-PHASE-D.md](WEB-PHASE-D.md)。公开0.2.10资产未替换。

2026-11-16 网页阶段C完成自定义趋势补零、有界日/月聚合和桌面入口动态加载；新增 `node scripts/verify-web-phase-c.mjs`，性能测量为 `node scripts/measure-web-phase-c.mjs`（`WORKMEMO_MEASUREMENT=after`，每次三组并覆盖同名证据）。Node/Rust 共用趋势场景契约。完整数据规则、前后 trace、命令和原生验收边界见 [WEB-PHASE-C.md](WEB-PHASE-C.md)。当前公开 0.2.10 安装包未包含 A/B/C 修正。

2026-11-16 网页阶段B完成表单语义、错误焦点、颜色/强制颜色、静默轮询、图表数据表和弹层隔离修正。新增 `node scripts/verify-web-phase-b.mjs`；可选 `WORKMEMO_AXE` 运行自动可访问性扫描，`WORKMEMO_CONTRAST=1` 使用本机 Python/Pillow 测量实际合成背景。完整命令、源码和人工验收边界见 [WEB-PHASE-B.md](WEB-PHASE-B.md)。当前公开 0.2.10 安装包仍未包含 A/B 源码修正。

2026-11-15 网页阶段A完成源码修正：新增`unfinished`筛选，旧`working` API含义不变，不迁移数据库。状态、图表及请求恢复专项为`node scripts/verify-web-phase-a.mjs`，使用`WORKMEMO_PLAYWRIGHT`和`WORKMEMO_WEB_URL`指向已有Playwright与生产资源预览；共享状态契约同时由Node及Rust测试校验。完整命令、源码和验收范围见[WEB-PHASE-A.md](WEB-PHASE-A.md)。当前公开0.2.10成品尚未包含本轮修正。

2026-11-12 零点结束源码使用 schema 11，验收使用独立标识和隔离数据库。新增 `cargo test --locked --manifest-path src-tauri/Cargo.toml day_rollover --lib`，覆盖固定北京时间边界、全部暂停原因、重启、回滚和迁移；完整结果见 [DAY-ROLLOVER.md](DAY-ROLLOVER.md)。公开 0.2.9 安装包尚不包含此变更。

同日后续网页补记录将当前源码升级为 schema 12，新增持久化请求去重表，完整备份恢复包含该表。专项为 `cargo test --locked --manifest-path src-tauri/Cargo.toml manual_entry`、`node --test tests/manual-entry.test.mjs` 和生产预览下的 `node scripts/verify-manual-entry.mjs`；网页脚本只拦截隔离 HTTP 数据，不连接正式数据库。详细命令、完整文件清单与验收限制见 [WEB-MANUAL-ENTRY.md](WEB-MANUAL-ENTRY.md)。新旧数据库不可直接降级互读，先备份；当前公开 0.2.9 成品仍是 schema 10。

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

## 构建 v0.2.12

当前版本正式成品输出 artifacts/0.2.12；v0.2.11 资产和标签保留。先停止当前项目使用 node_modules 的 Vite 进程，保留真实工作任务和独立桌面预览，再执行：

```powershell
& .\scripts\package-windows.ps1
& .\scripts\verify-windows-candidate.ps1 -Directory artifacts/0.2.12 -PreserveDirectory artifacts/0.2.11
```

校验器默认读取当前版本；PreserveDirectory 可显式验证旧版本目录，未提供时不声称已核对旧资产。独立原生 HTTP 核验默认使用 package.json 版本，也可通过 WORKMEMO_NATIVE_VERSION 指定明确的旧预览版本，不能把旧预览结果记为新程序启动通过。发布脚本使用 Python 标准库和既有 Git 凭据助手，分 inspect / prepare / publish / verify；具体可复核命令见 RELEASE-0.2.12.md。

## 构建网页改造候选（0.2.10，尚未公开）

先停止当前项目使用 node_modules 的 Vite 预览，避免 Windows 原生模块占用；保留真实应用任务。使用单独目录，不覆盖已有版本成品：

```powershell
& .\scripts\package-windows.ps1 -OutputDirectory artifacts/web-phase-d/candidate-0.2.10
& .\scripts\verify-windows-candidate.ps1
```

自定义输出限定在当前工作区 artifacts 内；不传参数仍沿用原 artifacts/版本号 目录，可能覆盖同名文件。成品核验脚本的旧资产保留检查需要 artifacts/0.2.10 中原四项文件。独立原生查看配置为 src-tauri/tauri.web-acceptance.conf.json，不能把该 debug 验收实例当作正式安装包。全部命令和人工限制见 WEB-PHASE-D.md。

## 构建 v0.2.9 成品

2026-11-10 按用户要求将基于 0.2.8 功能的当前修正版统一发布为 0.2.9，包含灵动岛默认收起、新建／绑定入口和多任务列表，数据库仍为 schema 10，详见 [RELEASE-0.2.9.md](RELEASE-0.2.9.md)。运行下方打包脚本时输出目录为 `artifacts/0.2.9`。正式构建必须使用 Tauri build，确保启用 `custom-protocol` 内嵌前端。新 v0.2.9 标签指向本次构建提交；既有标签和发布不移动、不替换。

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

## 打包 v0.2.9

```powershell
& .\scripts\package-windows.ps1
```

脚本收集第三方许可，执行前端与 Tauri release 构建，准备浏览器组件，生成 NSIS 安装器和免安装 ZIP：

- `artifacts/0.2.9/WorkMemo_0.2.9_x64-setup.exe`
- `artifacts/0.2.9/WorkMemo_0.2.9_windows_x64.zip`
- `artifacts/0.2.9/THIRD-PARTY-LICENSES.txt`
- `artifacts/0.2.9/SHA256SUMS.txt`

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
````

## E:\WorkMemo\docs\PHASE-8.md

````markdown
# WorkMemo 第八阶段：最终检查与 Windows 交付

## 2026-11-16 v0.2.12 发布准备

用户明确要求上传0.2.12，包含网页工时小时分钟、弹层短距离过渡和日期翻月不回跳修正。版本、扩展统一，schema12保持。发布准备、检查范围和最终回执见 [RELEASE-0.2.12.md](RELEASE-0.2.12.md)，不覆盖0.2.11资产，不关闭用户预览。

## 2026-11-16 网页三项反馈修正（源码）

工时数据表改为小时/分钟；稳定筛选日期对象，避免轮询重置浏览月份；Modal/Drawer 改短距离过渡并取消详情弹层模糊。69项Node、前端生产构建、完整网页回归、B阶段7组、反馈专项6组通过。未操作真实任务、未重打公开0.2.11、未重验原生流畅度。完整交付见 [WEB-FEEDBACK-FIX.md](WEB-FEEDBACK-FIX.md) 与 [WEB-FEEDBACK-FIX-SOURCE.md](WEB-FEEDBACK-FIX-SOURCE.md)。

## 2026-11-12 v0.2.10 正式发布

用户要求上传为 0.2.10。已构建并公开 Windows x64 安装版、免安装 ZIP、第三方许可和校验文件，四项公开下载的摘要均与本地一致。版本标签指向 ee76bba；Node 59、Rust 181 项通过。升级数据库至 schema 12，需事先备份；原生透明窗口、真实扩展交互和安装卸载未在本次实机验收。详见 [RELEASE-0.2.10.md](RELEASE-0.2.10.md)。

## 2026-11-12 网页直接补记录：源码阶段

按用户明确顺序，在零点结束提交 d951862 完成并同步后增加网页「补记录」。填写类别、数量、北京时间起止、休息分钟数和备注，保存已确认的人工补录，刷新开始日明细；不改变当前计时任务。schema 12 请求表保障重复提交／响应丢失、重启、时钟回拨、删除及备份恢复的可靠性。Node 59、Rust 181、补录专项 7、生产网页补录 5 组、既有完整网页回归与待补填 5 组、前端构建、Cargo 格式和 diff 检查通过。修正新增日期控件的旧样式影响和窄屏溢出；未启动正式应用、未操作真实任务。完整路径、源码、测试、命令与兼容性见 [WEB-MANUAL-ENTRY.md](WEB-MANUAL-ENTRY.md) 和 [WEB-MANUAL-ENTRY-SOURCE.md](WEB-MANUAL-ENTRY-SOURCE.md)。本次两项授权源码需求完成；未打包或替换公开 0.2.9 成品，不自动增加新功能。

## 2026-11-12 北京时间零点结束：源码阶段

用户最终明确按北京时间每天 00:00 直接结束所有暂停、挂起和待恢复任务，包含手动暂停，取代最初滚动 24 小时提议。新增持久化停表时间，正在计时任务不受影响，停机跨日首次状态读取／后台检查补处理。工时和原记录保留，转待补全；迁移 schema 11，不增加依赖或权限。Rust 174、Node 57、Cargo 格式与 git diff 检查通过，Vite 隔离开发预览启动成功；未启动正式应用、未操作真实任务。详细源码、路径和命令见 [DAY-ROLLOVER.md](DAY-ROLLOVER.md) 与 [DAY-ROLLOVER-SOURCE.md](DAY-ROLLOVER-SOURCE.md)。本步骤记录后，按用户明确的「做完上面的再做这个」继续网页补记录；未自动进入安装包发布。

## 2026-11-10 v0.2.9 正式版本

用户确认当前修正版基于 0.2.8，明确要求改发 0.2.9。Git 祖先检查确认包含原 v0.2.8 与多任务列表构建。主程序、helper、扩展和各版本文件统一为 0.2.9，计时、schema 10、权限和依赖保持。Node 57、Rust 163、Cargo 格式、前端生产构建、Windows x64 正式编译、中文 NSIS 和 15 文件完整 ZIP 核对通过；默认收起／岛区域／页面任务／绑定入口生产回归通过。已公开为 Latest，Release ID 439965579，四项服务端摘要及匿名下载复算全部通过；新标签 v0.2.9 与构建源码均为 1ea89a1562616aba8fd079694e1502102b03397c。完整回执见 [RELEASE-0.2.9.md](RELEASE-0.2.9.md)。旧 0.2.7／0.2.8 发布资产核对保持不变，既有标签保留，原生实机验收限制继续如实记录。本次交付完成，不自动增加新功能。

## 2026-11-10 v0.2.7 灵动岛收起成品

用户明确要求「还是发成0.2.7谢谢」，授权本次源码进入同版本发布。现有 11-09 公开四资产已完整备份并核对原摘要；正式 Windows x64、中文 NSIS 与 15 文件 ZIP 完成，版本 0.2.7、schema 10、权限和依赖保持。本次新生产资源的默认收起专项、岛区域、页面任务和绑定入口回归通过；成品版本、CRC 和安装器／ZIP 内容逐项一致。公开四资产已替换，服务端摘要及匿名下载复算全部通过，Latest=v0.2.7、Release ID 431201874；构建源码 2b9af50acc905eddd937fb131c16dbf0f945ac5d。完整回执见 [RELEASE-0.2.7-ISLAND.md](RELEASE-0.2.7-ISLAND.md)。原标签和 v0.2.8 保留，原生实机验收限制继续如实记录。本次交付结束，不自动增加新功能。

## 2026-11-10 灵动岛默认收起源码修订

按用户截图反馈，取消网页与提醒变化时自动展开，收起时用静态圆点和短文字提示，点箭头才展开。保留手动打开的补填与未保存保护；Rust 显示条件补充待绑定网页，保证无活动任务时收起提示仍可显示，并尊重托盘隐藏偏好。Node 57、Rust 163、Cargo 格式、前端生产构建通过；生产资源上的新增专项、原页面任务／绑定入口／岛区域回归通过。Windows 原生透明、点击与真实扩展切页仍待实机验收；版本 0.2.7、schema 10 和公开资产未变。本轮源码阶段完成，不自动发布。完整交付、测试命令与源码见 [FIX-ISLAND-MANUAL-EXPAND.md](FIX-ISLAND-MANUAL-EXPAND.md) 和 [FIX-ISLAND-MANUAL-EXPAND-SOURCE.md](FIX-ISLAND-MANUAL-EXPAND-SOURCE.md)。

## 2026-11-09 v0.2.7 同版本成品更新

用户明确要求「直接发布，还是0.2.7」。现有功能与新建／绑定入口修正统一使用 0.2.7，SQLite schema 10 保持；原 v0.2.7 标签与既有 v0.2.8 发布保留。原始 0.2.7 公开资产已下载并核对 SHA256 后备份。Node 57、Rust 162、Cargo 格式、正式 Windows x64 构建、中文 NSIS 和 15 文件 ZIP 校验通过，主程序和 helper 均为 0.2.7；生产资源入口专项、页面任务、反馈五组、补填五组、24 布局和 15 个试听绑定通过。公开四资产已更新，服务端摘要及匿名下载复算全部一致，Latest=v0.2.7，Release ID 431201874；构建源码 37a3f08b1ed56118ae9e9881e268fe582ef5ded4，原标签保持 cb031eb7。发布与摘要记录见 [RELEASE-0.2.7-REFRESH.md](RELEASE-0.2.7-REFRESH.md)。原生实机验收限制继续保留，本次交付结束，不自动增加功能。

## 2026-11-09 主窗口新建与重新绑定入口修正

用户反馈灵动岛提示绑定任务已结束，但主窗口没有新建选项。隔离复现：仅浏览状态隐藏网页处理表单，同时普通新建入口被待处理状态排除，形成无入口界面。修正为仅浏览下也可处理绑定，并直接展示「新建任务／绑定已有任务」选择；保持原 Rust 绑定、计时和数据校验。灵动岛区分新网页与旧任务结束，不再向后者提示不存在的忽略操作。Node 57、生产构建、新增入口专项、原页面任务回归和反馈五组通过；v026 前五组通过，第六组因历史「工作 URL」定位超时，全脚本未通过。源码交付记录与完整代码见 [FIX-PAGE-BINDING-ENTRY.md](FIX-PAGE-BINDING-ENTRY.md) 和 [FIX-PAGE-BINDING-ENTRY-SOURCE.md](FIX-PAGE-BINDING-ENTRY-SOURCE.md)。安装包、公开 Release 和版本号未变；真实用户当时状态及 Windows 实机流程仍待核对。

## 2026-11-04 同版本更新 0.2.8

按用户要求保留版本号并更新公开下载；任务列表构建提交、原标签关系、备份、摘要及验证见 [RELEASE-0.2.8.md](RELEASE-0.2.8.md)。

## 2026-11-04 主窗口与灵动岛多任务列表

当前及暂停任务统一展示，可在列表中点击继续；八任务、切换与窄屏隔离回归、57 项 Node 和生产构建通过。完整路径、代码清单、截图及原生限制见 [TASK-LIST-UPDATE.md](TASK-LIST-UPDATE.md)。源码阶段完成后等待确认。

## 2026-11-04 v0.2.8 成品

用户授权发布页面任务自动切换。版本、配套扩展和中文使用说明更新至 0.2.8；数据库升级至 schema 10。源码阶段测试结果与仍待实机验收的项目见 [页面任务阶段记录](PAGE-TASK-SWITCH-PHASE-1.md)，发布说明见 [RELEASE-0.2.8.md](RELEASE-0.2.8.md)。

## 2026-11-03 发布后的页面任务自动切换源码阶段

按用户新确认的方案，开发具名任务与网页绑定、原子计时段切换、新网页处理、手动暂停保护和隔离授权。新源码使用 SQLite schema 10；正式 0.2.7 安装包与公开 Release 未变。实现、检查及原生验收限制见 [PAGE-TASK-SWITCH-PHASE-1.md](PAGE-TASK-SWITCH-PHASE-1.md)。此开发阶段完成后等待用户确认，不自动进入下一阶段。

## 2026-11-02 v0.2.7 Windows 成品与公开发布授权

用户明确要求「传release吧」，授权完成 0.2.7 成品和公开发布。统一应用、helper 与扩展版本为 0.2.7；Node 56、Rust 152、Cargo 格式、生产构建、生产资源反馈／补填各 5 组、岛区域、24 视觉布局与既有桌面／完整网页回归通过。中文 NSIS、15 文件完整 ZIP、主程序版本、helper、内容和 SHA256 核对通过，依赖图、权限、正式标识及 SQLite schema 9 保持。原生透明／区域点击／焦点／系统 DPI／自启及安装卸载、人工听感的验收限制继续如实保留，未操作真实任务。本地成品与后续发布回执见 [RELEASE-0.2.7.md](RELEASE-0.2.7.md)。已公开 [WorkMemo v0.2.7](https://github.com/noharass/WorkMemo/releases/tag/v0.2.7) 为正式 Latest，Release ID 431201874，标签指向构建提交 cb031eb7d048dd26dc18e51a335058d21a60901f；四项资产的服务端摘要与匿名公开下载复算均通过。最终回执另行提交，标签不移动；本版本发布完成，不自动扩展功能。


## 2026-11-02 0.2.7 反馈修订：导航、饼图与信息精简

按确认方案修复网页导航提示在滚动中的重定位与旧悬浮状态，保留键盘导航；辅助分析新增真实类别工时饼图、筛选联动及三／二／单列排版。主界面去掉重复状态，设置和结算的长说明可展开；待补全和今日工作量条及其他独立卡片统一圆角。Node 56、生产构建、Cargo 格式、新增反馈 5 组、四皮肤 24 布局及相关网页／桌面／名称／多 URL 回归通过。Rust 未改动，本轮没有重跑 Rust 测试。独立 Windows 构建与 probe 成功；截图超时后重试被用户 Esc 停止，之后未再调用原生输入。现有隔离库 schema 9、完整性 ok，读取 193 条已结束记录，未操作记录。详细结果、完整路径、源码及命令见 [FIX-0.2.7-FEEDBACK.md](FIX-0.2.7-FEEDBACK.md)。正式版本和下载仍为 0.2.6，等待成品阶段确认。


## 2026-11-02 0.2.7 第一阶段：补填选择、轻透明与默认音效

按用户确认方案，分类待补填先列出记录再选择，保存后返回列表；修复灵动岛首次展开的原生区域观察器挂载问题及收起／重开竞态；桌面与网页统一轻透明控件，四皮肤接受 40–100%、新默认 65%，保留旧设置；接入 FiftySounds 五种离线提示并一次性迁移旧音效默认，保留静音及选回旧套装能力。

Node 53、Rust 152、Cargo 格式、生产构建、新增网页 5 组、岛区域、24 视觉布局／15 试听绑定以及既有网页／桌面／名称／多 URL 回归通过。独立标识 com.workmemo.test.v027 的 Windows 程序构建、启动、probe 和原生可访问性读取成功，隔离库 schema 9、完整性 ok、0 条任务；原生截图两次超时，输入缺少 geometry，Windows 原生透明、区域点击、焦点、系统 DPI／多屏和主观听感仍未验收。五 WAV 的 Windows 播放 API 调用与摘要通过。详情、完整路径、代码及命令见 [UPDATE-0.2.7-PHASE-1.md](UPDATE-0.2.7-PHASE-1.md)。保留原有未跟踪规划和真实数据；正式版本／下载仍为 0.2.6，等待用户确认成品阶段，不自动公开 Release。


## 2026-11-01 v0.2.6 Windows 成品与发布授权

用户明确要求「传release」，授权从已完成的第一阶段进入成品和公开发布。版本统一为 0.2.6；Node 51、Rust 151、Cargo 格式、生产构建、生产资源新增 9 组／旧桌面 10 组及 24 布局、连续补填 4 组和完整网页回归通过。中文 NSIS 与 15 文件完整 ZIP 的版本、helper、内容和 SHA256 核对通过；依赖、扩展权限、正式标识及 SQLite schema 9 保持。原生闪动／透明／焦点及完整安装卸载的验收限制如实保留，未操作真实任务。成品摘要、完整路径、源码和后续发布回执见 [RELEASE-0.2.6.md](RELEASE-0.2.6.md)。旧记录与原有未跟踪规划保留，不自动增加新功能。

已公开 [WorkMemo v0.2.6](https://github.com/noharass/WorkMemo/releases/tag/v0.2.6) 为正式 Latest，Release ID 430489519，标签指向构建提交 710c34e5dc21524453c5581dee34ff2f717b6157。四项资产服务端摘要和匿名公开下载复算均通过；最终发布回执已补入 RELEASE-0.2.6.md，构建标签不移动。本次版本发行完成，不自动进入下一版本。

## 2026-11-01 v0.2.6 第一阶段：连续开工与设置保存修正

按已确认方案，主窗口空闲时展示真实监测状态，点击新建后才进入手动表单；取消、候选到达、失败及其他窗口开工保留草稿。灵动岛和后台展示标识统一为当前任务／新候选优先，旧记录继续待补全，正在编辑的结算固定原记录；确认前不计时。隔离复现原监测配置单次保存触发 4 次读取及表单卸载，修正后保持首次加载 1 次读取、1 次写入，表单和背景节点及焦点保留。

Node 51、Rust 151、Cargo 格式与生产构建通过；新增 9 组隔离 UI 的开发／生产资源检查及现有桌面 10 组／24 布局、顶部 22 组、网页、工作名称、多 URL 回归通过。独立标识 com.workmemo.test.v026 的 Windows 程序已构建、启动并读取真实界面，隔离库 schema 9、完整性 ok、0 条任务；截图两次分别超时，点击报告 coordinate input geometry is unavailable，原生透明、焦点与闪动验收仍受限。完整路径、代码、命令、结果及阶段边界见 [UPDATE-0.2.6-PHASE-1.md](UPDATE-0.2.6-PHASE-1.md)。保留原有未跟踪规划，不处理真实任务；版本号／下载仍为 0.2.5，完成源码同步后等待用户确认成品阶段。

## 2026-10-30 v0.2.5 源码反馈修正：连续补填、居中面板与主窗收高

按用户实际截图反馈，分类工作量右侧待补填数量改为可点击入口，沿当前已应用周期、分类和数据范围逐条补填；支持保存并下一条，错误和冲突保持输入，写入成功后读取失败可单独重试。复用原 Drawer 的动画／焦点／背景锁定，改为水平垂直居中；主窗口保持宽度，按自然内容收紧高度，移除底栏上方大块空白。Node 49、Rust 147、生产构建、隔离 Windows 构建、原网页完整回归、新增网页 4 组（含 53 条连续补填）及桌面 10 组／24 组布局通过。截图为隔离夹具，窗口请求高度在 780px 测试布局中为新建 443、工作中 423；不能代替本轮真实原生高度／焦点／DPI 验收。没有处理真实任务或发布新安装包。完整路径、代码、命令与限制见 [FIX-0.2.5-FEEDBACK.md](FIX-0.2.5-FEEDBACK.md)。

## 2026-10-30 v0.2.5 第 1 阶段：现有 UI、固定状态岛与自启（源码交付）

按用户确认方案及补充参考图，完成顶部仅浏览、独立新建页、双箭头切换、底部文字统计、固定主体状态岛、动画展开／岛内结算，以及正式版默认后台自启和单实例保护。Node 49、Rust 146、生产构建、新版 9 组交互／24 组布局、顶部 22 组与原桌面／名称／多 URL 隔离回归通过；NSIS 私有命名空间内的自启清理及新所有者保护通过，真实注册项保持。隔离 Windows 程序构建、后台参数启动、单实例唤起和可访问性读取成功；原生截图超时，后续输入被用户 Esc 停止，原生透明、区域点击、焦点、DPI 和真实登录自启仍待验收。完整路径、源码、命令和限制见 [UPDATE-0.2.5-PHASE-1.md](UPDATE-0.2.5-PHASE-1.md)。未操作真实任务，未发布新安装包，保留旧阶段和原未跟踪规划；本阶段完成后等待用户确认成品阶段。

## 2026-10-29 v0.2.4 成品发布

用户明确确认「打包并发布新版成品」，授权将网页优化与主窗口顶部精简进入成品阶段。已统一 0.2.4 版本，49 项 Node、144 项 Rust、Cargo 格式、生产构建、五组隔离浏览器回归及安装器／ZIP 内容与版本核对通过。中文 NSIS、完整 ZIP、许可和校验文件已公开为 Latest；四项资产均核对服务端摘要，并匿名重新下载复核成功。构建提交与标签为 `3796547f8e582120e41cafb913caf9cec8dc1914`，Release ID 为 `427613324`；最终回执见 [RELEASE-0.2.4.md](RELEASE-0.2.4.md)。旧版与真实工作数据保持，不将模拟浏览器结果当作新的原生验收。本次成品阶段已完成，后续功能等待用户确认。

## 2026-10-29 主窗口顶部单一设置入口（源码交付）

按用户截图移除主窗口的统计、外观、布局快捷图标，只保留设置；已有功能通过设置栏目和工作量／待补全入口继续访问。顶部规划为标识、设置、独立拖动留白、限宽工作量胶囊及窗口操作；紧凑高 42px，保留至少 24px 拖动区，舒展至少 32px。49 项 Node、生产构建、22 组隔离标题栏布局与入口检查、原桌面四皮肤及窗口布局浏览器回归通过；原生动作未重验，不操作真实任务、不打包发行。完整路径、规划、源码及命令见 [TITLEBAR-UPDATE.md](TITLEBAR-UPDATE.md) 和 [TITLEBAR-SOURCE.md](TITLEBAR-SOURCE.md)。

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


## 2026-10-30 v0.2.5 成品发版授权与检查

用户明确要求「发版吧」，在现有 v0.2.5 第一阶段及反馈修正基础上进入正式发布收尾。版本统一为 0.2.5，补齐精确版本插件的官方 MIT 许可，并兼容当前用户 Run 项尚不存在时的自启注册。Node 49、Rust 147、Cargo 格式、生产构建、网页及连续补填、桌面／状态岛和现有设置隔离回归完成；中文 NSIS 与完整 15 文件 ZIP 的版本、内容、helper 和 SHA256 核对通过。旧桌面脚本依赖开发模块的限制、原生透明／点击／DPI／实际登录／安装卸载未全部复验的范围如实记录。

已公开 WorkMemo v0.2.5 为正式 Latest，Release ID 428941478，标签对应构建源码 80beca896ceafcbbfe2320707dd3c763e4bb98e7，main 与标签推送后标识核对一致。安装器、完整 ZIP、第三方许可与 SHA256SUMS 四项资产的服务端摘要一致，匿名公开下载复算全部通过；最终回执见 RELEASE-0.2.5.md。发布回执文档另行提交，标签保持在构建提交。保留用户真实任务、旧版本、历史阶段及原有未跟踪规划，不自动增加功能或进入下一版本。

## 2026-11-14 网页端审查

按用户要求安装 Modern Web Guidance，执行59项Node测试、生产构建、网页全量隔离回归与5组补录场景。确认表单字段语义、轮询播报和图表数值替代三项可访问性问题，并记录页面JS体积优化项。本轮只交付审查报告及隔离取证脚本，不改应用行为；问题、命令、完整文件清单和兼容性范围见 WEB-AUDIT-2026-11-14.md。等待确认修复范围，不操作真实任务或自动启动下一阶段。

## 2026-11-15 网页端全面审查与修改计划

按用户要求进一步审查，重新执行59项Node、181项Rust、生产构建、网页全量回归和5组补录场景。新增隔离取证确认挂起状态/筛选不一致、短工时柱图舍入、跨年标签、503误提示、刷新并发、编辑错误处于滚动区之外以及稳定颜色对比度问题，复核原有三项可访问性发现；另外记录弹层隔离、自定义趋势连续性和冷启长任务的验证边界。完整证据、文件清单、PowerShell命令及A/B/C/D分阶段修改计划见WEB-AUDIT-PLAN-2026-11-15.md。本轮仅增加审查脚本和文档，应用版本仍0.2.10，未改功能、数据库或发布资产；等待确认后才执行阶段A，不自动跨阶段。

## 2026-11-15 网页阶段A完成

按用户“执行A吧”授权修复F01–F05：未结束筛选与计时/暂停/挂起状态统一、保留旧working接口；柱图保留毫秒精度，趋势保留年月；区分授权/繁忙/业务/格式/超时/断线，查询effect取消旧读取并限制重复刷新。66项Node、182项Rust、生产构建、完整网页回归、5组补录、5组待补填及5组阶段A专项通过。没有迁移数据库、操作真实任务、增加运行依赖或重建/替换公开0.2.10安装包。完整路径、代码、PowerShell命令和验收边界见WEB-PHASE-A.md及WEB-PHASE-A-SOURCE.md；阶段B/C/D等待确认，不自动继续。


## 2026-11-16 网页阶段B完成

按用户“继续下一阶段”授权执行 F06–F09、R01：关联表单标签/必填/错误、失败聚焦可见字段或摘要，备注按现有 Unicode 规则校验；加深辅助文字，支持键盘 outline 与强制颜色；后台更新时间静默，主动刷新/恢复使用独立播报；趋势/日历增加同源语义数据表，统一弹层 inert、Tab 边界及触发点恢复。67项Node、182项Rust、生产构建、完整网页、5组补录、5组待补填、5组历史布局、5组A专项及7组B专项通过。6个axe状态无报告违规，仍有incomplete；30个实际背景文字样本最低4.67:1。真实Narrator、Windows原生及整体验收未通过本轮替代。完整路径、源码、命令和限制见WEB-PHASE-B.md、WEB-PHASE-B-SOURCE.md。版本仍0.2.10/schema12，不操作真实数据或发布资产；C/D等待确认，不自动进入。


## 2026-11-16 网页阶段C完成

按用户“继续下一阶段”授权执行R02/R03。Rust复现自定义趋势漏日期、按记录跨度误选粒度后，统一按所选本地日历范围补零：短范围最多121日点，长范围月桶、极大范围合并连续月份并限制1200点；无已结束记录保持空趋势，真实零值仍保留记录数。前端标明合并宽度，图表与数据表同源，Node/Rust共享8场景契约。入口改按网页/主窗/设置/状态岛动态加载，补齐设置窗显式样式依赖，不改Vite、不加运行依赖/遥测。最终3次冷启JS从1,948,678降至1,854,810字节（约4.82%），最大长任务中位数689→475ms；仍有长任务，实验室结果不等同现场INP。69项Node、185项Rust、格式、生产构建、C的7组专项、既有网页/补录/待补填/A/B/布局及桌面任务/状态岛隔离回归通过。完整路径、源码、测量和限制见WEB-PHASE-C.md、WEB-PHASE-C-SOURCE.md。0.2.10/schema12不变，不操作真实数据或公开资产；D及原生/读屏验收等待确认，不自动继续。


## 2026-11-16 网页阶段D自动验收与候选交付

按用户“继续下阶段”进入D；用户要求不用computer-use、自行看效果，此后未用其控制窗口。69项Node、185项Rust、格式、生产构建、网页/补录/待补填/A/B/C/布局/桌面任务/状态岛隔离回归通过；实际Chromium125/150/200%缩放、错误可见/嵌套焦点、200%强制颜色通过，Edge6状态axe无报告违规但仍有incomplete。Tauri release/NSIS/ZIP构建和版本/x64/15文件/主程序字节/profile/扩展/SHA256核对通过，候选位于artifacts/web-phase-d/candidate-0.2.10，原本地0.2.10资产校验保持一致。新增独立验收标识并实际启动，用户确认显示/透明效果/窗口操作“正常”；真实Rust网页服务的授权、内嵌资源和只读查询通过。C提交已恢复GitHub同步。

D不能整体标为全部通过：真实Narrator、系统DPI、原生四皮肤逐项、扩展真实联动、安装卸载和实际登录仍待检查。版本0.2.10/schema12不变，不操作真实任务，不覆盖公开资产或移动标签；发布目标按已确认计划另行确认。完整文件、源码、PowerShell命令、候选校验值和人工回执见WEB-PHASE-D.md、WEB-PHASE-D-SOURCE.md。不自动新增功能或继续其他开发阶段。


## 2026-11-16 v0.2.11 发布授权与构建

用户明确选择发布新版本并指定0.2.11，已统一应用、锁文件、Tauri及扩展版本，更新下载入口和使用说明。69项Node、185项Rust、格式、Tauri release/NSIS/15文件ZIP、网页/补录/待补填/A/B/C及实际125/150/200%浏览器缩放回归完成；原0.2.10本地资产核验保持一致。公开发布将使用新v0.2.11标签，不移动旧标签。真实Narrator、系统DPI、扩展联动和安装卸载仍未全部复验；用户当前0.2.10独立预览保持运行，不为新版本构建强制关闭。最终公开状态、构建提交及匿名下载校验见RELEASE-0.2.11.md；本条构建记录不等同于已经公开发布。


## 2026-11-16 v0.2.11 正式发布完成

已公开WorkMemo v0.2.11为非草稿、非预发布的正式Latest，Release ID 446559551，新标签与构建提交为5858d9312c7af2d1bc20e50a5bfc9f92ddab2e04。四项资产服务器大小/摘要及无认证公开下载复算全部通过；公开页面可匿名访问，原v0.2.10四项资产ID/大小/摘要和标签目标保持不变。主程序/扩展0.2.11，schema12，ZIP15文件；用户正在查看的独立0.2.10预览保持运行，未为发版结束真实任务。回执、完整文件/代码、命令和验收限制见RELEASE-0.2.11.md及RELEASE-0.2.11-SOURCE.md。回执另行提交，v0.2.11标签保持在构建提交；发布收尾结束，不自动新增功能或启动下一版本。
````


## 已完成的构建检查

Windows x64正式构建、ZIP15文件与本地旧版保留核验、反馈专项和完整网页回归均通过。最终发布回执见 RELEASE-0.2.12.md。
