# 第二阶段完整文本源码

本文件完整收录本阶段变更文本（统一换行），不使用省略号替代代码。除汇编自身外，文件清单中的文件均完整收录；实际构建使用各原始文件。

## UPDATE E:\WorkMemo\README.md

````````markdown
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前源码正在分阶段改造自动工作记录。第一阶段已加入持久计时区间和结束后补填工作量；第二阶段已实现 Windows 输入/系统状态、Chrome 原生通信、5/7 分钟与离页计时规则、托盘和非模态提醒的代码，**真实 Chrome 接入及原生交互尚待验收**。已确认规则见 [自动记录规范](docs/AUTO-TRACKING-SPEC.md)，当前结果见 [第二阶段进度](docs/AUTO-TRACKING-PHASE-2.md)，接入步骤见 [独立验收说明](docs/BROWSER-BRIDGE.md)。源码数据库升级到版本 3 后，旧版程序会拒绝读取；本轮未迁移真实工作数据库。下文成品信息及既有验收记录对应已发布版本，不能作为此次改造的验收结果。

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

## NEW FILE E:\WorkMemo\browser-extension\background.js

````````javascript
import { HOST_NAME } from './bridge-config.js';
import { matchRule, permissionOrigins } from './matching.js';

let port = null;
let sequence = 0;
let config = null;
let connected = false;
let sending = false;
let awaitingReply = false;
let sentAt = 0;

function status() {
  return { connected, config, message: connected ? '已连接本机 WorkMemo' : '等待本机连接；请确认已注册配套主机并启动 WorkMemo' };
}

function connect() {
  if (port) return;
  try {
    const current = chrome.runtime.connectNative(HOST_NAME);
    port = current;
    sequence = 0;
    current.onMessage.addListener(message => {
      if (port !== current) return;
      awaitingReply = false;
      connected = message?.connected === true;
      config = connected && message.config && Array.isArray(message.config.rules) ? message.config : null;
    });
    current.onDisconnect.addListener(() => {
      void chrome.runtime.lastError;
      if (port === current) { port = null; connected = false; config = null; awaitingReply = false; }
    });
  } catch { port = null; connected = false; config = null; }
}

async function poll() {
  if (sending) return;
  sending = true;
  try {
    if (awaitingReply && Date.now() - sentAt > 10_000) {
      const stale = port; port = null; connected = false; config = null; awaitingReply = false; stale?.disconnect();
    }
    connect();
    if (!port || awaitingReply) return;
    const rules = config?.rules ?? [];
    const origins = permissionOrigins(rules);
    const ready = !!config && (origins.length === 0 || await chrome.permissions.contains({ origins }));
    let focused = false;
    let ruleId = null;
    if (ready && config.enabled) {
      const window = await chrome.windows.getLastFocused();
      focused = window.focused === true;
      if (focused) {
        const [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
        ruleId = matchRule(tab?.url, rules);
      }
    }
    // The native frame deliberately has no URL, title, page content, or input data.
    const frame = { version: 1, sequence: ++sequence, config_revision: config?.revision ?? -1, focused, ready, rule_id: ruleId };
    awaitingReply = true;
    sentAt = Date.now();
    port.postMessage(frame);
  } catch {
    connected = false;
    awaitingReply = false;
  } finally { sending = false; }
}

chrome.tabs.onActivated.addListener(() => { void poll(); });
chrome.tabs.onUpdated.addListener((_id, change, tab) => { if (tab.active && (change.status || change.url)) void poll(); });
chrome.tabs.onRemoved.addListener(() => { void poll(); });
chrome.windows.onFocusChanged.addListener(() => { void poll(); });
chrome.permissions.onAdded.addListener(() => { void poll(); });
chrome.permissions.onRemoved.addListener(() => { void poll(); });
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'workmemo-reconnect') void poll(); });
chrome.runtime.onStartup.addListener(() => { void poll(); });
chrome.runtime.onInstalled.addListener(() => { void poll(); });
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('popup.html')) return false;
  if (message?.type === 'status') reply(status());
  else if (message?.type === 'refresh') { void poll(); reply(status()); }
  return false;
});
void chrome.alarms.create('workmemo-reconnect', { periodInMinutes: 0.5 });
setInterval(() => { void poll(); }, 5_000);
void poll();
````````

## NEW FILE E:\WorkMemo\browser-extension\bridge-config.js

````````javascript
export const HOST_NAME = "com.workmemo.browser_bridge";
````````

## NEW FILE E:\WorkMemo\browser-extension\manifest.json

````````json
{
  "manifest_version": 3,
  "name": "WorkMemo 本地工作监测",
  "version": "0.1.0",
  "description": "仅将已配置工作页面的匹配状态传给本机 WorkMemo；不读取网页内容或输入文本。",
  "minimum_chrome_version": "120",
  "permissions": ["nativeMessaging", "alarms"],
  "optional_host_permissions": ["http://*/*", "https://*/*"],
  "background": { "service_worker": "background.js", "type": "module" },
  "action": { "default_popup": "popup.html", "default_title": "WorkMemo 工作监测" },
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtGKBoVQeI/+nL0Zq//7RFyrT35o4sVV2QMJ7kfe8vhaz471T5FxJLX1gu4WTArqWf0e+WwSHlxIiI/PfefgiWdXB/HpuamuopdfFFYuJ57D/GgzPiQvSiyifGGNtH3Tz7fDvQDVSmzhbS6/0KwHe/csgYyzrKa7OyW1R6x9+EirVYhJM1XLJ0Rvu+Y/1l6p0BApkVteGRfn7BGLK4qsUlRoow7pyG1DSlFapBUS/e9oT+ozUT2OX2fLkqtPg9M9scthII08XUATKeD3jtyUqqU0v2Pc9V4KF36J1Jnpt50PEpey/KK/TGLN9T21F8jRxHuDFFQs1mZDDvVVRWjUXCwIDAQAB"
}
````````

## NEW FILE E:\WorkMemo\browser-extension\matching.js

````````javascript
export function permissionOrigins(rules) {
  return [...new Set(rules.map(rule => `${new URL(rule.url_prefix).origin}/*`))];
}

export function matchRule(candidate, rules) {
  if (!candidate) return null;
  let url;
  try { url = new URL(candidate); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  return [...rules].sort((a, b) => new URL(b.url_prefix).pathname.length - new URL(a.url_prefix).pathname.length || a.id - b.id)
    .find(rule => {
      const prefix = new URL(rule.url_prefix);
      const path = prefix.pathname.replace(/\/+$/, '');
      return url.origin === prefix.origin && (!path || url.pathname === path || url.pathname.startsWith(`${path}/`));
    })?.id ?? null;
}
````````

## NEW FILE E:\WorkMemo\browser-extension\popup.css

````````css
:root{font:13px/1.7 "Segoe UI","Microsoft YaHei UI",sans-serif;color:#25342f;background:#f4f7f4}body{width:320px;margin:0;padding:18px;box-sizing:border-box}h1{font-size:17px;margin:0 0 12px}button{width:100%;padding:10px;margin-top:8px;border:1px solid #96b7a7;border-radius:8px;background:#e0eee6;color:#203e30;cursor:pointer}button:disabled{opacity:.5;cursor:not-allowed}button:focus-visible{outline:2px solid #116746;outline-offset:2px}li{overflow-wrap:anywhere}#error{color:#a42424}#status{font-weight:600}
````````

## NEW FILE E:\WorkMemo\browser-extension\popup.html

````````html
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WorkMemo 工作监测</title><link rel="stylesheet" href="popup.css"></head>
<body><h1>WorkMemo 工作监测</h1><p id="status" role="status">正在读取连接状态…</p>
<p>仅使用授权工作站点的当前标签页 URL 判断规则，不读取网页内容或输入文本。匹配结果只发给本机 WorkMemo。</p>
<ul id="rules"></ul><p id="permissions"></p>
<button id="grant" disabled>同步工作站点授权</button><button id="refresh">刷新连接状态</button>
<p id="error" role="alert"></p><p>修改 WorkMemo 工作 URL 后，请在这里同步授权。未授权或连接中断时不会猜测工作时间。</p>
<script type="module" src="popup.js"></script></body></html>
````````

## NEW FILE E:\WorkMemo\browser-extension\popup.js

````````javascript
import { permissionOrigins } from './matching.js';
const status = document.querySelector('#status');
const list = document.querySelector('#rules');
const permissionStatus = document.querySelector('#permissions');
const grant = document.querySelector('#grant');
const error = document.querySelector('#error');
let origins = [];
async function refresh() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'status' });
    status.textContent = state?.message ?? '连接状态不可用';
    list.replaceChildren();
    for (const rule of state?.config?.rules ?? []) {
      const item = document.createElement('li'); item.textContent = `${rule.category} · ${rule.url_prefix}`; list.append(item);
    }
    origins = permissionOrigins(state?.config?.rules ?? []);
    grant.disabled = !state?.connected || origins.length === 0;
    const allowed = origins.length > 0 && await chrome.permissions.contains({ origins });
    permissionStatus.textContent = allowed ? '工作站点已授权' : '请先在 WorkMemo 配置 URL，再同步站点授权';
  } catch { status.textContent = '无法读取连接状态，请确认扩展主机已注册'; }
}
grant.addEventListener('click', async () => {
  error.textContent = '';
  try {
    // Request only these configured origins, synchronously from the user gesture.
    const allowed = await chrome.permissions.request({ origins });
    if (!allowed) error.textContent = '未获得工作站点授权，自动识别保持暂停。';
    else await chrome.runtime.sendMessage({ type: 'refresh' });
    await refresh();
  } catch { error.textContent = '站点授权未完成，请重新打开扩展面板后重试。'; }
});
document.querySelector('#refresh').addEventListener('click', async () => { await chrome.runtime.sendMessage({ type: 'refresh' }); await refresh(); });
await refresh();
setInterval(() => { void refresh(); }, 2_000);
````````

## NEW FILE E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2-FILES.md

````````markdown
# 第二阶段完整文件清单

状态为 NEW FILE 或 UPDATE。所有路径为绝对路径；没有包含依赖、产物、测试配置、数据库或运行时端点校验文件。

| 状态 | 完整路径 |
| --- | --- |
| UPDATE | E:\WorkMemo\README.md |
| NEW FILE | E:\WorkMemo\browser-extension\background.js |
| NEW FILE | E:\WorkMemo\browser-extension\bridge-config.js |
| NEW FILE | E:\WorkMemo\browser-extension\manifest.json |
| NEW FILE | E:\WorkMemo\browser-extension\matching.js |
| NEW FILE | E:\WorkMemo\browser-extension\popup.css |
| NEW FILE | E:\WorkMemo\browser-extension\popup.html |
| NEW FILE | E:\WorkMemo\browser-extension\popup.js |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2-FILES.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2-SOURCE.md |
| NEW FILE | E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2.md |
| UPDATE | E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md |
| NEW FILE | E:\WorkMemo\docs\BROWSER-BRIDGE.md |
| UPDATE | E:\WorkMemo\docs\BUILDING.md |
| NEW FILE | E:\WorkMemo\scripts\prepare-browser-bridge.ps1 |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.lock |
| UPDATE | E:\WorkMemo\src-tauri\Cargo.toml |
| UPDATE | E:\WorkMemo\src-tauri\build.rs |
| UPDATE | E:\WorkMemo\src-tauri\capabilities\default.json |
| NEW FILE | E:\WorkMemo\src-tauri\migrations\003_monitoring.sql |
| NEW FILE | E:\WorkMemo\src-tauri\src\bin\workmemo-browser.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\browser_bridge.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\browser_protocol.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\clock.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\database_tests.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\desktop.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\history_tests.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\lib.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\main.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\monitor.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\native_activity.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\service.rs |
| UPDATE | E:\WorkMemo\src-tauri\src\settlement.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\tracking.rs |
| NEW FILE | E:\WorkMemo\src-tauri\src\tracking_tests.rs |
| NEW FILE | E:\WorkMemo\src-tauri\tests\browser_host.rs |
| UPDATE | E:\WorkMemo\src\App.css |
| UPDATE | E:\WorkMemo\src\App.tsx |
| UPDATE | E:\WorkMemo\src\DesktopWindow.tsx |
| NEW FILE | E:\WorkMemo\src\MonitoringSettings.tsx |
| NEW FILE | E:\WorkMemo\src\NotificationApp.tsx |
| UPDATE | E:\WorkMemo\src\SettlementPanel.tsx |
| UPDATE | E:\WorkMemo\src\main.tsx |
| UPDATE | E:\WorkMemo\src\types.ts |
| UPDATE | E:\WorkMemo\src\useWorkSession.ts |
| UPDATE | E:\WorkMemo\src\workView.ts |
| NEW FILE | E:\WorkMemo\tests\browser-extension.test.mjs |

文件关系：003_monitoring.sql 管理兼容迁移；monitor.rs/tracking.rs 负责纯业务时限与状态；native_activity.rs 提供 Windows 元数据；browser_protocol.rs/browser_bridge.rs 与独立原生主机构成本机通信；desktop.rs/service.rs/lib.rs 接窗口、托盘与命令；browser-extension 为配套 Chrome 扩展；React 设置与提醒界面连接实际后端；测试在隔离数据和独立进程中执行；prepare-browser-bridge.ps1 准备和注册指定配置；阶段文档记录结果与限制。

完整代码在项目原文件及 AUTO-TRACKING-PHASE-2-SOURCE.md。汇编不递归收录自身，其余本清单文本完整收录。
````````

## NEW FILE E:\WorkMemo\docs\AUTO-TRACKING-PHASE-2.md

````````markdown
# 自动记录第二阶段进度：本机监测、浏览器通信与后台提醒

日期：2026-10-27（Asia/Shanghai）。用户明确确认进入第二阶段。起点提交 1fbc8e5，工作区干净。

**状态：代码与自动检查已完成一个开发步骤，实际 Chrome 接入及原生交互验收尚未完成。本阶段仍在进行，不自动进入第三阶段，也不把保存代码进度视为功能全部验收通过。**

## 本次目标与检查

阅读 AGENTS.md、PRODUCT-SPEC.md、AUTO-TRACKING-SPEC.md 和实际计时、SQLite、前后端通信、主题及窗口代码。保留第一阶段计时区间与待补全模型，新增真实 Windows 状态与浏览器输入通道，业务判定仍由 Rust 执行。

开发前启动核对仅看见已安装程序路径，未获得独立构建的新主界面证据。电脑控制工具随后多次返回用户物理 Escape 停止信号；收到用户允许继续验收后，工具仍返回相同停止信号，之后没有继续界面输入或通过其他 UI 自动化绕过。

最近一次只读检查未发现独立验收进程或 com.workmemo.test.monitor 数据库，不能因用户选择“已完成”就声称已连通。正式数据库只读核对仍为版本 1、4 条记录、0 条活动任务，integrity_check=ok；本轮没有迁移真实库，也没有为验收结束或删除真实任务。

## 实现内容与文件关系

1. **数据库版本 3**：003_monitoring.sql 新增工作 URL、开关与配置修订号、计时控制模式、当前运行的单调时间锚点、持久结束提醒。版本 1/2 顺序迁移，旧记录、基数、区间和待补全保留；旧待补全不在升级时集中弹窗。
2. **Windows 元数据**：GetLastInputInfo 仅读最后输入时间，GetTickCount64 提供同源单调时间；处理 32 位输入计数回绕与异常值。查询只限当前会话状态和前台是否 Chrome，不保存其他进程路径、输入文本、按键或坐标。
3. **系统事件**：隐藏的原生顶层监听窗口订阅当前会话锁屏/连接变化及电源广播。锁屏、休眠、监测不可用或后台调度中断时暂停，并截断不可确认区间。没有主动锁屏、休眠或操作 Windows 安全设置。
4. **浏览器通信**：Manifest V3 Chrome 扩展、独立 workmemo-browser.exe、长度前缀 JSON 和本机回环连接。仅传配置版本、规则 ID、前台及授权状态等元数据，不传网页 URL、标题、内容或输入文本。原生主机只接受固定扩展 origin；应用端用启动时随机值校验本机连接，并拒绝重放序号。
5. **自动开始**：启用、连接可信、配置已授权、Chrome 前台活动页匹配、有进入工作环境后的新输入、没有未结束记录时创建。开始时间使用合格输入的真实时间，不以轮询时刻代替；单独打开页面不开始。后台 Chrome 配置文件不能覆盖前台配置文件的页面状态。
6. **时间规则**：5 分钟提醒、7 分钟结束均以最后输入为准。离页满 2 分钟暂停，再保留 10 分钟；先到的结束期限生效，同刻优先空闲。空闲结束回退尾段到最后输入，暂停不计时，结束先提交数据库再生成提醒。
7. **人工保护**：手动暂停与重启待恢复任务不被自动结束、恢复或绕过。手动继续开启 MANUAL 控制区间并保留原始来源；不要求 URL，仍受空闲与系统状态保护。Native 状态不可确认时拒绝开始/继续，避免先累计一段未知时间。
8. **手动命令顺序**：开始、暂停、继续、结束、结算及监测配置保存前，先用新的原生状态处理已经到期的生命周期，避免命令抢在后台轮询前执行而把应扣除的尾段保存为工时。只读快照不额外触发每秒输入采样；常规采样仍为 5 秒，到期边界会重新读取。
9. **失联处理**：心跳超过 15 秒、站点未授权、权限撤销或配置版本不同，自动计时回到最后可信边界暂停。异常暂停保留 10 分钟，期间空闲规则可更早结束；仍有其他应用输入也不能无限占用旧记录。该异常保留策略与正常离页 2+10 分钟区分。
10. **托盘与提醒**：主窗口关闭到后台；托盘打开主界面、待补全或保存退出。结束提醒为独立非模态原生透明窗口，可直接填写工作量或稍后填写；提醒状态写 SQLite。输入恢复取消空闲提醒。后台保存故障会显示主窗口错误，重复相同错误不反复激活窗口。
11. **不抢焦点**：检查实际 Tao 源码发现 focused(false) 标记只在创建阶段生效，因此后续显示没有仅依赖通用 show()，而使用 Windows SW_SHOWNOACTIVATE；显示、隐藏均走一致的原生路径。此为实现及源码核对结果，真实焦点行为仍待验收。API 依据 [ShowWindowAsync](https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-showwindowasync)。
12. **界面接入**：实际监测状态、URL 与类别配置、非模态提醒与结算表单、退出入口均接真实命令。原生透明和四皮肤继续使用既有配置/令牌，外观与业务库仍分开。

完整文件绝对路径、NEW FILE / UPDATE 见 AUTO-TRACKING-PHASE-2-FILES.md；完整文本源码见 AUTO-TRACKING-PHASE-2-SOURCE.md。没有省略代码，也没有提交编译产物、数据库或端点校验值。

## 实际执行结果

- 前端 Node 测试 26 项通过；TypeScript/Vite 生产构建通过。
- Rust 库测试 72 项通过，主机单元测试 2 项、实际子进程通信测试 2 项通过，共 76 个 Rust 执行项；与前端合计 102 个测试执行项。共享协议的两项测试分别在库和独立主机中执行，不称为 102 个互不重复的测试案例。
- 原有数据库、历史、主题、随机长流程、真实子进程退出恢复与 1 万条记录测试继续通过。
- 新增测试覆盖自动开始条件、5/7 分钟、轮询晚发现、离页保留与恢复、规则同刻到期、输入恰在截止时间恢复、手动暂停、失联及撤权、不同 Chrome 配置文件、时钟变化、版本 2 升级、自动结束保存失败、主机来源/字段/长度校验、真实回环认证与重放拒绝。
- 检查发现自动结束保存失败后仍可能留下旧空闲提醒，已修正状态并补充后台错误通知；原失败用例继续保留，通过后重跑。
- Windows 拒绝连接可能返回 EOF，也可能返回 ConnectionReset/ConnectionAborted。认证测试调整为验证这些真实拒绝结果，同时仍要求无成功回复、页面状态不变；没有放宽认证或跳过重放测试。
- Rust 格式检查与 cargo check --bins 通过。Tauri Windows debug/no-bundle 实际构建成功，已复制到稳定验收目录并与源 EXE 复算摘要一致；该结果不等于新界面正常启动已通过。
- debug 只读探针实际读取 Windows 状态，native_available=true、unlocked=true；隔离程序实际配置标识为 com.workmemo.test.monitor。探针不创建窗口或打开数据库。
- 准备脚本实际执行成功，已生成独立扩展目录、主机清单及配置。发现测试主机此前未注册后，已实际写入并读回 HKCU 的 com.workmemo.browser_bridge_test；allowed_origins 仅为 chrome-extension://oljcealhccdhaddceacnokihjefloaih/。本轮未修改正式主机注册，也未代操作 Chrome 站点授权。
- PowerShell 脚本保存为 UTF-8 BOM，语法解析通过；本轮运行于当前 PowerShell。未将解析检查称为 Windows PowerShell 5.1 的完整注册实测。

## 尚未通过的验收

真实 Chrome 扩展安装/授权后的页面信号、独立程序新主界面、实际连续等待 5/7 分钟、真实离页 2+10 分钟、锁屏/休眠恢复、托盘交互、提醒不抢焦点和四皮肤原生透明可读性，均尚未完成实际验收。实现、单元测试、只读原生探针和模拟协议进程不能替代这些证据。

浏览器加载及站点权限需要用户手动操作。依据 computer-use 技能引用的 guidance.md："Do not act on security or privacy permission requests." 工具报告用户停止时，依该规则停止界面输入。后续先完成本阶段实际验收，不自动进入第三阶段。

## PowerShell 命令与测试预期

~~~powershell
Set-Location 'E:\WorkMemo'
$env:Path = (Join-Path $env:USERPROFILE '.cargo\bin') + ';' + $env:Path
npm.cmd run build
npm.cmd test
cargo test --locked --offline --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
~~~

本机已缓存依赖，实际使用 --offline；全新源码环境应先按 BUILDING.md 安装锁定依赖。隔离配置构建、复制与接入命令完整见 BROWSER-BRIDGE.md。验收程序使用独立目录，避免修改正式数据。

建议先手动启动：

~~~powershell
& 'E:\WorkMemo\artifacts\browser-bridge\com.workmemo.test.monitor\workmemo-test.exe'
~~~

本轮稳定验收 EXE 的 SHA256：f23996f42b2ca48498079de491436cc7e402f4bd1f193becfa9036b58ad77702。仅该独立副本作为本轮验收入口；后续构建变更应重新生成并核对。

随后按 BROWSER-BRIDGE.md 检查 Chrome 前台工作页加新输入自动开始；手动暂停不自动恢复；空闲/离页结束只结算一次；关闭提醒保留待补全；恢复原记录排除暂停段。用户实际工作优先，不为验收强制结束或删除真实任务。

## 兼容性与范围

- 当前自动页面识别仅以 chrome.exe 和配套 Chrome 扩展为目标；未声明 Edge、Firefox、其他系统或 Windows 11 原生实测通过。
- 工作 URL 的真实切换时刻并非总能从快照恢复，采用可信观测边界；不伪造毫秒精度。输入状态也不保存全部事件历史；无法确认的边界采用保守分段，时间修正仍属于第三阶段。
- 锁定依赖版本未升级；新增直接依赖声明复用已有 url 2.5.8、windows-sys 0.61.2，开启 Tauri tray-icon；没有切换技术栈或增加通用 SQL/文件权限。
- 数据库版本 3 与旧版程序不兼容；迁移可回滚且已有隔离测试，真实库未迁移。正式程序、安装器与已发布 v0.1.1 均未覆盖。
- 安装包分发、完整人工补录/时间修正、重叠处理及最终交付仍属于第三阶段，未放置对应的未实现按钮。

## Git

本轮保存经检查的第二阶段代码进度；原生验收受限如实保留。暂存区排除依赖、产物、真实数据库、私密配置及校验端点文件，使用已有仓库身份，不修改全局身份。

~~~powershell
git fetch origin main
git diff --cached --check
git diff --cached --name-status
git commit -m "feat: add local browser monitoring and idle-aware work sessions"
git push origin main
git rev-parse HEAD
git ls-remote origin refs/heads/main
git status --short --branch
~~~

实际同步标识以交付回复及 Git 结果为准，不强制推送。仍等待真实接入和界面验收，不将整个目标标为完成。
````````

## UPDATE E:\WorkMemo\docs\AUTO-TRACKING-SPEC.md

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

1. **数据与手动结算基础（代码已提交，原生回归待验收）**：兼容迁移现有 SQLite；工作量可空及 0；计时区间持久化；暂停与重启恢复；结束、待补全、填写独立；真实待补全列表及保存入口；已有手动计时、历史和主题回归。此阶段不声称已提供自动监测。
2. **自动监测与后台运行（当前阶段，用户于 2026-10-27 确认进入）**：Windows 输入与系统状态、浏览器连接及 URL 配置、截止时间状态机、自动开始/暂停/结束、后台窗口生命周期和非阻塞提醒。接入真实监测，验证故障恢复与最小权限。
3. **人工补录修正与成品验收**：完整时间修正、补录、重叠处理及原始结果追溯；实际 Windows 场景、迁移、四皮肤及透明回归；打包与交付。

每阶段结束记录实际结果，提交并推送 Git，等待用户确认后进入下一阶段。完成某一阶段不代表整个自动记录功能已经完成。

## 数据迁移原则

- 旧记录的 ID、类别、数量、备注、起止时间和毫秒时长保留；旧已结束记录作为已结算历史。
- 旧版只有累计时长，不能凭开始与结束时间伪造有效区间。旧时长保留为历史基数，新产生的区间另存。
- 新旧记录继续使用同一数据库和历史入口；填写状态与计时状态分开。
- 所有业务写入由 Rust 校验并事务提交。迁移失败回滚，不重置数据库。
- 外观配置、原生透明配置及应用标识不因计时改造而改变。隔离验收使用独立应用标识，不对真实数据库制造测试任务。
````````

## NEW FILE E:\WorkMemo\docs\BROWSER-BRIDGE.md

````````markdown
# Chrome 接入与第二阶段独立验收

当前是开发验收版本，尚未发布到 Chrome 商店。第二阶段代码与自动测试已准备，真实浏览器、托盘、提醒窗口和锁屏/休眠交互仍待验收；不能把编译或模拟时钟测试当成这些场景已通过。

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

自动记录开发版本增加一个独立的 workmemo-browser 原生通信程序；Cargo 默认运行目标仍为 workmemo。Chrome 接入、独立应用标识的验收构建与当前限制见 BROWSER-BRIDGE.md 和 AUTO-TRACKING-PHASE-2.md。普通源码构建会使用正式数据目录；独立验收程序应按说明单独构建和复制。当前改造没有发布新的安装包。

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

## NEW FILE E:\WorkMemo\scripts\prepare-browser-bridge.ps1

````````powershell
param(
    [string]$BinaryPath,
    [string]$AppBinaryPath,
    [string]$ProfileId = 'com.workmemo.desktop',
    [string]$OutputDirectory,
    [switch]$Register
)
$ErrorActionPreference = 'Stop'
$taskRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).ProviderPath
if ($ProfileId -notmatch '^com\.workmemo\.(desktop|test\.[a-z0-9]+([.-][a-z0-9]+)*)$') { throw 'ProfileId 无效。' }
if (-not $BinaryPath) { $BinaryPath = Join-Path $taskRoot 'src-tauri\target\debug\workmemo-browser.exe' }
$taskBinary = (Resolve-Path -LiteralPath $BinaryPath).ProviderPath
if (-not $OutputDirectory) { $OutputDirectory = Join-Path $taskRoot ("artifacts\browser-bridge\" + $ProfileId) }
$taskOutput = [IO.Path]::GetFullPath($OutputDirectory)
[IO.Directory]::CreateDirectory($taskOutput) | Out-Null
$taskExtension = Join-Path $taskOutput 'extension'
[IO.Directory]::CreateDirectory($taskExtension) | Out-Null
$taskUtf8 = New-Object Text.UTF8Encoding($false)
$taskHostName = if ($ProfileId.StartsWith('com.workmemo.test.')) { 'com.workmemo.browser_bridge_test' } else { 'com.workmemo.browser_bridge' }
foreach ($taskFile in @('manifest.json','background.js','matching.js','popup.html','popup.js','popup.css','bridge-config.js')) {
    Copy-Item -LiteralPath (Join-Path $taskRoot ('browser-extension\' + $taskFile)) -Destination (Join-Path $taskExtension $taskFile) -Force
}
[IO.File]::WriteAllText((Join-Path $taskExtension 'bridge-config.js'), ('export const HOST_NAME = "' + $taskHostName + '";' + [Environment]::NewLine), $taskUtf8)
$taskHostBinary = Join-Path $taskOutput 'workmemo-browser.exe'
if ($taskBinary -ne $taskHostBinary) { Copy-Item -LiteralPath $taskBinary -Destination $taskHostBinary -Force }
[IO.File]::WriteAllText((Join-Path $taskOutput 'workmemo-browser.profile.json'), (@{identifier=$ProfileId} | ConvertTo-Json -Compress), $taskUtf8)
$taskExtensionManifest = Get-Content -Raw -LiteralPath (Join-Path $taskExtension 'manifest.json') -Encoding UTF8 | ConvertFrom-Json
$taskHash = [Security.Cryptography.SHA256]::Create()
try { $taskDigest = $taskHash.ComputeHash([Convert]::FromBase64String($taskExtensionManifest.key)) } finally { $taskHash.Dispose() }
$taskExtensionId = -join (0..15 | ForEach-Object { [char](97 + ($taskDigest[$_] -shr 4)); [char](97 + ($taskDigest[$_] -band 15)) })
if ($taskExtensionId -ne 'oljcealhccdhaddceacnokihjefloaih') { throw '扩展标识与原生主机不一致。' }
$taskManifestPath = Join-Path $taskOutput ($taskHostName + '.json')
$taskManifest = @{name=$taskHostName;description='WorkMemo 本地工作页面监测';path=$taskHostBinary;type='stdio';allowed_origins=@('chrome-extension://' + $taskExtensionId + '/')}
[IO.File]::WriteAllText($taskManifestPath, ($taskManifest | ConvertTo-Json -Depth 4), $taskUtf8)
if ($AppBinaryPath) {
    $taskAppSource = (Resolve-Path -LiteralPath $AppBinaryPath).ProviderPath
    $taskAppName = if ($ProfileId.StartsWith('com.workmemo.test.')) { 'workmemo-test.exe' } else { 'workmemo.exe' }
    $taskAppTarget = Join-Path $taskOutput $taskAppName
    if ($taskAppSource -ne $taskAppTarget) { Copy-Item -LiteralPath $taskAppSource -Destination $taskAppTarget -Force }
    Write-Output ('桌面程序：' + $taskAppTarget)
}
if ($Register) {
    $taskRegistryPath = 'Software\Google\Chrome\NativeMessagingHosts\' + $taskHostName
    $taskPrevious = [Microsoft.Win32.Registry]::CurrentUser.OpenSubKey($taskRegistryPath)
    if ($null -ne $taskPrevious) {
        try { $taskPreviousValue = $taskPrevious.GetValue('') } finally { $taskPrevious.Dispose() }
        if ($taskPreviousValue -and $taskPreviousValue -ne $taskManifestPath) {
            [IO.File]::WriteAllText((Join-Path $taskOutput 'previous-registration.json'), (@{key=$taskRegistryPath;value=$taskPreviousValue} | ConvertTo-Json), $taskUtf8)
        }
    }
    $taskRegistryKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($taskRegistryPath)
    try { $taskRegistryKey.SetValue('', $taskManifestPath, [Microsoft.Win32.RegistryValueKind]::String) } finally { $taskRegistryKey.Dispose() }
    Write-Output ('已注册当前用户 Chrome 本机主机：' + $taskHostName)
}
Write-Output ('扩展目录：' + $taskExtension)
Write-Output ('扩展 ID：' + $taskExtensionId)
Write-Output ('主机清单：' + $taskManifestPath)
Write-Output ('数据配置：' + $ProfileId)
if (-not $Register) { Write-Output '仅准备文件，尚未修改 Chrome 主机注册。需要接入时使用 -Register。' }
````````

## UPDATE E:\WorkMemo\src-tauri\Cargo.lock

````````toml
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
name = "combine"
version = "4.6.9"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4356eba6976435498d05a311ee9fc486da3bc81c200d3f0d7dd9703b41913f92"
dependencies = [
 "bytes",
 "memchr",
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
version = "7.0.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "8d57d423b3c82e89b9a24ca3091fee61f456a26edbd28d26c65906f4bc1dcd8f"
dependencies = [
 "dirs-sys",
]

[[package]]
name = "dirs-sys"
version = "0.5.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "e01a3366d27ee9890022452ee61b2b63a67e6f13f58900b651ff5665f0bb1fab"
dependencies = [
 "libc",
 "option-ext",
 "redox_users",
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
 "winreg",
]

[[package]]
name = "embed_plist"
version = "1.2.2"
source = "registry+https://github.com/rust-lang/crates.io-index"
checksum = "4ef6b89e5b37196644d8796de5268852ff179b44e96276cf4290264843743bb7"

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
 "dirs",
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
 "dirs",
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
 "tracing-core",
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
 "dirs",
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
version = "0.1.1"
dependencies = [
 "rusqlite",
 "serde",
 "serde_json",
 "tauri",
 "tauri-build",
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
 "dirs",
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
````````

## UPDATE E:\WorkMemo\src-tauri\Cargo.toml

````````toml
[package]
name = "workmemo"
version = "0.1.1"
description = "Local personal work journal and focus timer"
edition = "2024"
default-run = "workmemo"

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
rusqlite = { version = "0.41", features = ["bundled"] }
url = "2.5.8"

[target.'cfg(windows)'.dependencies]
windows-sys = { version = "0.61.2", features = ["Win32_Foundation", "Win32_Security_Cryptography", "Win32_Graphics_Gdi", "Win32_System_SystemInformation", "Win32_System_Threading", "Win32_System_LibraryLoader", "Win32_System_RemoteDesktop", "Win32_System_Power", "Win32_UI_WindowsAndMessaging", "Win32_UI_Input_KeyboardAndMouse"] }


# Read the optimization guideline for more details: https://tauri.app/concept/size/#cargo-configuration
[profile.release]
codegen-units = 1
lto = true
opt-level = 3
panic = "abort"
strip = true
````````

## UPDATE E:\WorkMemo\src-tauri\build.rs

````````rust
fn main() {
    println!("cargo:rerun-if-env-changed=TAURI_CONFIG");
    let base: serde_json::Value =
        serde_json::from_str(include_str!("tauri.conf.json")).expect("valid Tauri configuration");
    let overlay = std::env::var("TAURI_CONFIG")
        .ok()
        .and_then(|v| serde_json::from_str::<serde_json::Value>(&v).ok());
    let identifier = overlay
        .as_ref()
        .and_then(|v| v.get("identifier"))
        .and_then(|v| v.as_str())
        .or_else(|| base["identifier"].as_str())
        .expect("application identifier");
    println!("cargo:rustc-env=WORKMEMO_IDENTIFIER={identifier}");
    tauri_build::build()
}
````````

## UPDATE E:\WorkMemo\src-tauri\capabilities\default.json

````````json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Main window; storage errors, custom titlebar and resize handles",
  "windows": ["main", "notice"],
  "permissions": [
    "core:event:allow-listen",
    "core:event:allow-unlisten",
    "core:window:allow-minimize",
    "core:window:allow-close",
    "core:window:allow-start-dragging",
    "core:window:allow-start-resize-dragging"
  ]
}
````````

## NEW FILE E:\WorkMemo\src-tauri\migrations\003_monitoring.sql

````````sql
ALTER TABLE work_records ADD COLUMN control_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK(control_mode IN ('AUTO','MANUAL'));
ALTER TABLE work_segments ADD COLUMN clock_session TEXT;
ALTER TABLE work_segments ADD COLUMN start_ticks_ms INTEGER;
ALTER TABLE work_segments ADD COLUMN end_ticks_ms INTEGER;

CREATE TABLE monitoring_settings (
    id INTEGER PRIMARY KEY CHECK(id=1),
    enabled INTEGER NOT NULL CHECK(enabled IN (0,1)),
    revision INTEGER NOT NULL CHECK(revision>=0)
);
INSERT INTO monitoring_settings VALUES(1,0,0);
CREATE TABLE work_urls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_prefix TEXT NOT NULL UNIQUE CHECK(length(url_prefix)<=2048),
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档'))
);
CREATE TABLE end_reminders (
    record_id INTEGER PRIMARY KEY REFERENCES work_records(id) ON DELETE CASCADE,
    dismissed INTEGER NOT NULL DEFAULT 0 CHECK(dismissed IN (0,1))
);
-- Existing pending work remains in the list without a burst of upgrade popups.
INSERT INTO end_reminders(record_id,dismissed) SELECT id,1 FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING';
````````

## NEW FILE E:\WorkMemo\src-tauri\src\bin\workmemo-browser.rs

````````rust
#![cfg_attr(not(test), windows_subsystem = "windows")]
#[path = "../browser_protocol.rs"]
mod browser_protocol;
use browser_protocol::*;
use std::{
    io::{self, BufReader, Write},
    net::{Ipv4Addr, SocketAddrV4, TcpStream},
    path::PathBuf,
    time::Duration,
};

fn endpoint_path() -> Result<PathBuf, String> {
    let mut identifier = env!("WORKMEMO_IDENTIFIER").to_string();
    #[cfg(debug_assertions)]
    if let Ok(test_profile) = std::env::var("WORKMEMO_TEST_PROFILE") {
        if !test_profile.starts_with("com.workmemo.test.") {
            return Err("test profile".into());
        }
        identifier = test_profile;
    }
    let profile = std::env::current_exe()
        .map_err(|e| e.to_string())?
        .with_file_name("workmemo-browser.profile.json");
    if let Ok(bytes) = std::fs::read(profile) {
        if bytes.len() > 4096 {
            return Err("profile size".into());
        }
        let value: serde_json::Value =
            serde_json::from_slice(&bytes).map_err(|_| "profile JSON")?;
        identifier = value["identifier"]
            .as_str()
            .ok_or("profile identifier")?
            .to_string();
    }
    if !identifier.starts_with("com.workmemo.")
        || identifier.split('.').any(|part| part.is_empty())
        || identifier.is_empty()
        || identifier.len() > 128
        || !identifier
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'.' || b == b'-' || b == b'_')
    {
        return Err("profile identifier".into());
    }
    Ok(
        PathBuf::from(std::env::var_os("LOCALAPPDATA").ok_or("local data directory")?)
            .join(identifier)
            .join("browser-bridge.endpoint.json"),
    )
}

fn connect(path: &PathBuf) -> Result<(TcpStream, String), String> {
    let bytes = std::fs::read(path).map_err(|_| "WorkMemo 尚未运行")?;
    if bytes.len() > 4096 {
        return Err("endpoint size".into());
    }
    let endpoint: Endpoint = serde_json::from_slice(&bytes).map_err(|_| "endpoint JSON")?;
    if endpoint.token.len() != 64 || !endpoint.token.bytes().all(|b| b.is_ascii_hexdigit()) {
        return Err("endpoint token".into());
    }
    let socket = SocketAddrV4::new(Ipv4Addr::LOCALHOST, endpoint.port);
    let stream = TcpStream::connect_timeout(&socket.into(), Duration::from_millis(500))
        .map_err(|_| "WorkMemo 连接尚未就绪")?;
    stream
        .set_read_timeout(Some(Duration::from_secs(2)))
        .map_err(|e| e.to_string())?;
    stream
        .set_write_timeout(Some(Duration::from_secs(2)))
        .map_err(|e| e.to_string())?;
    Ok((stream, endpoint.token))
}

fn run() -> Result<(), String> {
    let origin = std::env::args()
        .nth(1)
        .ok_or("Only the WorkMemo Chrome extension may start this host")?;
    if origin.trim_end_matches('/') != ORIGIN.trim_end_matches('/') {
        return Err("extension origin".into());
    }
    let path = endpoint_path()?;
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut input = stdin.lock();
    let mut output = stdout.lock();
    let mut connection: Option<(BufReader<TcpStream>, String)> = None;
    while let Some(value) = read_native(&mut input).map_err(|e| e.to_string())? {
        let frame: BrowserFrame = serde_json::from_value(value).map_err(|_| "browser frame")?;
        if frame.version != 1 {
            return Err("protocol version".into());
        }
        if connection.is_none() {
            connection = connect(&path).ok().map(|(s, t)| (BufReader::new(s), t));
        }
        let reply = if let Some((reader, token)) = connection.as_mut() {
            let request = WireRequest {
                token: token.clone(),
                frame,
            };
            let result = (|| -> Result<serde_json::Value, String> {
                let mut bytes = serde_json::to_vec(&request).map_err(|e| e.to_string())?;
                bytes.push(b'\n');
                reader
                    .get_mut()
                    .write_all(&bytes)
                    .and_then(|_| reader.get_mut().flush())
                    .map_err(|e| e.to_string())?;
                let bytes = read_line(reader)
                    .map_err(|e| e.to_string())?
                    .ok_or("closed bridge")?;
                serde_json::from_slice(&bytes).map_err(|_| "bridge response".into())
            })();
            match result {
                Ok(value) => value,
                Err(_) => {
                    connection = None;
                    serde_json::json!({"connected":false,"config":null})
                }
            }
        } else {
            serde_json::json!({"connected":false,"config":null})
        };
        write_native(&mut output, &reply).map_err(|e| e.to_string())?;
    }
    Ok(())
}
fn main() {
    if run().is_err() {
        eprintln!("WorkMemo 浏览器连接已关闭；未记录网页或输入内容。");
        std::process::exit(1);
    }
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\browser_bridge.rs

````````rust
use crate::{
    browser_protocol::*,
    clock::{Clock, SystemClock},
    monitor::PageSample,
    service::SharedStore,
};
use std::{
    fs,
    io::{BufReader, Write},
    net::{TcpListener, TcpStream},
    path::Path,
    sync::{
        Arc,
        atomic::{AtomicU64, AtomicUsize, Ordering},
    },
    time::Duration,
};

static NEXT_CLIENT: AtomicU64 = AtomicU64::new(1);
pub fn start(shared: SharedStore, directory: &Path) -> Result<(), String> {
    let listener =
        TcpListener::bind(("127.0.0.1", 0)).map_err(|e| format!("无法创建本机浏览器连接：{e}"))?;
    listener.set_nonblocking(true).map_err(|e| e.to_string())?;
    let mut random = [0u8; 32];
    #[cfg(windows)]
    if unsafe {
        windows_sys::Win32::Security::Cryptography::BCryptGenRandom(
            std::ptr::null_mut(),
            random.as_mut_ptr(),
            random.len() as u32,
            windows_sys::Win32::Security::Cryptography::BCRYPT_USE_SYSTEM_PREFERRED_RNG,
        )
    } < 0
    {
        return Err("无法生成本机连接校验值。".into());
    }
    #[cfg(not(windows))]
    return Err("浏览器连接当前仅支持 Windows。".into());
    let token: String = random.iter().map(|byte| format!("{byte:02x}")).collect();
    let endpoint = Endpoint {
        port: listener.local_addr().map_err(|e| e.to_string())?.port(),
        token: token.clone(),
    };
    let path = directory.join("browser-bridge.endpoint.json");
    let temporary = directory.join(format!("browser-bridge.{}.pending", std::process::id()));
    let bytes = serde_json::to_vec(&endpoint).map_err(|e| e.to_string())?;
    let mut file = fs::File::create(&temporary).map_err(|e| e.to_string())?;
    file.write_all(&bytes)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())?;
    drop(file);
    fs::rename(&temporary, &path).map_err(|e| e.to_string())?;
    let weak = Arc::downgrade(&shared);
    let connections = Arc::new(AtomicUsize::new(0));
    std::thread::spawn(move || {
        while weak.strong_count() > 0 {
            match listener.accept() {
                Ok((stream, address)) => {
                    if !address.ip().is_loopback() || connections.load(Ordering::Relaxed) >= 4 {
                        continue;
                    }
                    let weak = weak.clone();
                    let token = token.clone();
                    let count = connections.clone();
                    count.fetch_add(1, Ordering::Relaxed);
                    let client = NEXT_CLIENT.fetch_add(1, Ordering::Relaxed);
                    std::thread::spawn(move || {
                        let _ = serve(stream, weak, token, client);
                        count.fetch_sub(1, Ordering::Relaxed);
                    });
                }
                Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                    std::thread::sleep(Duration::from_millis(100))
                }
                Err(_) => break,
            }
        }
        // Never remove an endpoint belonging to a replacement process.
        if fs::read(&path).ok().is_some_and(|v| {
            serde_json::from_slice::<Endpoint>(&v)
                .ok()
                .is_some_and(|v| v.token == token)
        }) {
            let _ = fs::remove_file(path);
        }
    });
    Ok(())
}

fn serve(
    mut stream: TcpStream,
    weak: std::sync::Weak<std::sync::Mutex<crate::database::Result<crate::database::Store>>>,
    token: String,
    client: u64,
) -> Result<(), String> {
    stream
        .set_read_timeout(Some(Duration::from_secs(20)))
        .map_err(|e| e.to_string())?;
    stream
        .set_write_timeout(Some(Duration::from_secs(2)))
        .map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(stream.try_clone().map_err(|e| e.to_string())?);
    let mut sequence = None;
    while let Some(bytes) = read_line(&mut reader).map_err(|e| e.to_string())? {
        let request: WireRequest =
            serde_json::from_slice(&bytes).map_err(|_| "浏览器消息格式无效。")?;
        if request.token != token
            || request.frame.version != 1
            || sequence.is_some_and(|old| request.frame.sequence <= old)
        {
            return Err("浏览器连接校验失败。".into());
        }
        sequence = Some(request.frame.sequence);
        let Some(shared) = weak.upgrade() else {
            return Ok(());
        };
        let reply = {
            let mut guard = shared.lock().map_err(|_| "数据服务锁异常。")?;
            let store = guard.as_mut().map_err(|e| e.clone())?;
            let config = store.monitor_config()?;
            let frame = request.frame;
            if frame
                .rule_id
                .is_some_and(|id| !config.rules.iter().any(|r| r.id == id))
                && frame.config_revision == config.revision
            {
                return Err("浏览器规则标识无效。".into());
            }
            store.observe_browser_page(
                client,
                PageSample {
                    at: SystemClock::new().now(),
                    focused: frame.focused,
                    rule_id: frame.rule_id,
                    revision: frame.config_revision,
                    ready: frame.ready,
                },
            );
            serde_json::json!({"connected":true,"config":config})
        };
        let mut response = serde_json::to_vec(&reply).map_err(|e| e.to_string())?;
        response.push(b'\n');
        stream
            .write_all(&response)
            .and_then(|_| stream.flush())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\browser_protocol.rs

````````rust
use serde::{Deserialize, Serialize};
use std::io::{self, BufRead, Read, Write};

#[allow(dead_code)] // Used by the standalone native host; the desktop serves TCP.
pub const ORIGIN: &str = "chrome-extension://oljcealhccdhaddceacnokihjefloaih/";
pub const MAX_MESSAGE: usize = 131_072;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct BrowserFrame {
    pub version: u32,
    pub sequence: u64,
    pub config_revision: i64,
    pub focused: bool,
    pub ready: bool,
    pub rule_id: Option<i64>,
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WireRequest {
    pub token: String,
    pub frame: BrowserFrame,
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Endpoint {
    pub port: u16,
    pub token: String,
}

#[allow(dead_code)] // Shared with the separate host executable and protocol tests.
pub fn read_native(reader: &mut impl Read) -> io::Result<Option<serde_json::Value>> {
    let mut length = [0u8; 4];
    match reader.read(&mut length[..1])? {
        0 => return Ok(None),
        _ => reader.read_exact(&mut length[1..])?,
    }
    let length = u32::from_le_bytes(length) as usize;
    if length == 0 || length > MAX_MESSAGE {
        return Err(io::Error::new(io::ErrorKind::InvalidData, "message length"));
    }
    let mut bytes = vec![0; length];
    reader.read_exact(&mut bytes)?;
    serde_json::from_slice(&bytes)
        .map(Some)
        .map_err(|_| io::Error::new(io::ErrorKind::InvalidData, "message JSON"))
}

#[allow(dead_code)] // Shared with the separate host executable and protocol tests.
pub fn write_native(writer: &mut impl Write, value: &serde_json::Value) -> io::Result<()> {
    let bytes = serde_json::to_vec(value)?;
    if bytes.len() > MAX_MESSAGE {
        return Err(io::Error::new(io::ErrorKind::InvalidData, "reply length"));
    }
    writer.write_all(&(bytes.len() as u32).to_le_bytes())?;
    writer.write_all(&bytes)?;
    writer.flush()
}

pub fn read_line(reader: &mut impl BufRead) -> io::Result<Option<Vec<u8>>> {
    let mut bytes = Vec::new();
    reader
        .take((MAX_MESSAGE + 1) as u64)
        .read_until(b'\n', &mut bytes)?;
    if bytes.is_empty() {
        return Ok(None);
    }
    if bytes.len() > MAX_MESSAGE || bytes.last() != Some(&b'\n') {
        return Err(io::Error::new(io::ErrorKind::InvalidData, "line length"));
    }
    Ok(Some(bytes))
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn native_frames_are_bounded_and_binary_safe() {
        let value = serde_json::json!({"connected":true,"message":"本地连接"});
        let mut bytes = Vec::new();
        write_native(&mut bytes, &value).unwrap();
        assert_eq!(read_native(&mut bytes.as_slice()).unwrap(), Some(value));
        assert!(read_native(&mut ((MAX_MESSAGE + 1) as u32).to_le_bytes().as_slice()).is_err());
        assert!(read_native(&mut [3u8, 0, 0].as_slice()).is_err());
        assert_eq!(read_native(&mut [].as_slice()).unwrap(), None);
    }
    #[test]
    fn browser_payload_has_no_page_or_input_content_fields() {
        let mut value = serde_json::json!({"version":1,"sequence":1,"config_revision":0,"focused":true,"ready":true,"rule_id":null});
        assert!(serde_json::from_value::<BrowserFrame>(value.clone()).is_ok());
        value["url"] = serde_json::json!("https://unconfigured.invalid/private");
        assert!(serde_json::from_value::<BrowserFrame>(value).is_err());
    }
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\clock.rs

````````rust
#[cfg(not(windows))]
use std::time::Instant;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone, Copy, Debug)]
pub struct TimePoint {
    pub wall_ms: i64,
    pub ticks_ms: i64,
}

pub trait Clock: Send {
    fn now(&self) -> TimePoint;
}

pub struct SystemClock {
    #[cfg(not(windows))]
    origin: Instant,
}

impl SystemClock {
    pub fn new() -> Self {
        Self {
            #[cfg(not(windows))]
            origin: Instant::now(),
        }
    }
}

impl Clock for SystemClock {
    fn now(&self) -> TimePoint {
        TimePoint {
            wall_ms: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_millis()
                .min(i64::MAX as u128) as i64,
            ticks_ms: system_ticks(self),
        }
    }
}

#[cfg(windows)]
fn system_ticks(_: &SystemClock) -> i64 {
    // Windows input timestamps use the same uptime clock, including sleep.
    unsafe {
        windows_sys::Win32::System::SystemInformation::GetTickCount64().min(i64::MAX as u64) as i64
    }
}
#[cfg(not(windows))]
fn system_ticks(clock: &SystemClock) -> i64 {
    clock.origin.elapsed().as_millis().min(i64::MAX as u128) as i64
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\database.rs

````````rust
use crate::clock::{Clock, TimePoint};
use crate::monitor::{MonitorStatus, Runtime};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::{fs::File, path::Path, time::Duration};
static NEXT_CLOCK_SESSION: AtomicU64 = AtomicU64::new(0);

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
    pub control_mode: String,
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
    pub monitoring: MonitorStatus,
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
    clock_session: String,
    pub(crate) monitor: Runtime,
}

const COLUMNS: &str = "id, category, quantity, remark, start_time, end_time,
    duration_seconds, duration_ms, status, is_paused, recovery_pending,
    settlement_status, source, pause_reason, confirmed_end_time, last_input_time,
    end_reason, legacy_duration_ms, revision, control_mode";

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
        control_mode: row.get(19)?,
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
            1 | 2 | 3 => {}
            _ => return Err("数据库来自较新版本，请使用较新版本的 WorkMemo；未修改数据。".into()),
        }
        if version < 2 {
            tx.execute_batch(include_str!("../migrations/002_settlement.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 2)
                .map_err(db_error)?;
        }
        if version < 3 {
            tx.execute_batch(include_str!("../migrations/003_monitoring.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 3)
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
        let now = clock.now();
        let mut store = Self {
            connection,
            clock,
            segment: None,
            warning: None,
            _instance_lock: lock,
            clock_session: format!(
                "{}:{}:{}:{}",
                std::process::id(),
                now.wall_ms,
                now.ticks_ms,
                NEXT_CLOCK_SESSION.fetch_add(1, Ordering::Relaxed)
            ),
            monitor: Runtime::default(),
        };
        store.monitor.config = store.monitor_config()?;
        Ok(store)
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
            monitoring: self.monitor.status.clone(),
        })
    }

    pub fn start(&mut self, input: StartInput) -> Result<()> {
        if self.monitor.active && !self.monitor.status.native_available {
            return Err("当前无法确认系统活动状态，暂不能开始计时；已有记录保持保存。".into());
        }
        self.start_at(input, "MANUAL_START", self.clock.now(), true)
    }

    fn start_at(
        &mut self,
        input: StartInput,
        source: &str,
        now: TimePoint,
        allow_switch: bool,
    ) -> Result<()> {
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
        if previous
            .as_ref()
            .is_some_and(|r| !r.is_paused || !allow_switch)
        {
            return Err("请先暂停或结束当前任务。".into());
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        if let Some(previous) = previous {
            finish_row(&tx, previous.id, previous.start_time, now.wall_ms, "SWITCH")?;
        }
        tx.execute("INSERT INTO work_records(category, quantity, remark, start_time, status, is_paused,settlement_status,source,control_mode,last_input_time) VALUES(?1,?2,?3,?4,'WORKING',0,'IN_PROGRESS',?5,?6,?4)",
            params![input.category, input.quantity, remark, now.wall_ms,source,if source=="AUTO"{"AUTO"}else{"MANUAL"}]).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        let row_id = insert_segment(&tx, id, now.wall_ms, &self.clock_session, now.ticks_ms)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: 0,
            started_ticks: now.ticks_ms,
            started_wall: now.wall_ms,
        });
        self.warning = None;
        self.monitor.record_changed(id, now);
        Ok(())
    }

    pub fn pause(&mut self, id: i64) -> Result<()> {
        let record = self.current(id)?;
        if record.is_paused {
            self.connection.execute("UPDATE work_records SET pause_reason='MANUAL',control_mode='MANUAL',recovery_pending=0 WHERE id=?1",[id]).map_err(db_error)?;
            self.monitor.status.idle_warning = false;
            return Ok(());
        }
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
        self.monitor.status.idle_warning = false;
        Ok(())
    }

    pub fn resume(&mut self, id: i64) -> Result<()> {
        if self.monitor.active && !self.monitor.status.native_available {
            return Err("当前无法确认系统活动状态，暂不能继续计时。".into());
        }
        self.resume_at(id, self.clock.now(), "MANUAL")
    }
    fn resume_at(&mut self, id: i64, now: TimePoint, mode: &str) -> Result<()> {
        let record = self.current(id)?;
        if !record.is_paused {
            return Ok(());
        }
        let tx = self.connection.transaction().map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET is_paused=0, recovery_pending=0,pause_reason=NULL,control_mode=?2,last_input_time=?3 WHERE id=?1",
            params![id,mode,now.wall_ms],
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
        let row_id = insert_segment(&tx, id, started_wall, &self.clock_session, now.ticks_ms)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: record.duration_ms,
            started_ticks: now.ticks_ms,
            started_wall,
        });
        self.warning = None;
        self.monitor.record_changed(id, now);
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
        self.monitor.record_ended(now);
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

fn insert_segment(
    tx: &rusqlite::Transaction<'_>,
    record_id: i64,
    start: i64,
    session: &str,
    ticks: i64,
) -> Result<i64> {
    tx.execute("INSERT INTO work_segments(record_id,start_time,checkpoint_time,state,clock_session,start_ticks_ms,end_ticks_ms) VALUES(?1,?2,?2,'OPEN',?3,?4,?4)",params![record_id,start,session,ticks]).map_err(db_error)?;
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
        end_time=CASE WHEN ?3 THEN ?2 ELSE NULL END,state=CASE WHEN ?3 THEN 'CLOSED' ELSE 'OPEN' END,end_ticks_ms=?6
        WHERE id=?4 AND record_id=?5 AND state='OPEN'",
            params![duration, checkpoint, close, segment.row_id, id,segment.started_ticks.saturating_add(duration)],
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
        end_time=MAX(?3,COALESCE((SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?4 AND duration_ms>0),CASE WHEN legacy_duration_ms>0 THEN ?1 ELSE ?3 END)) WHERE id=?4 AND status='WORKING'",
        params![confirmed,reason,start,id]).map_err(db_error)?;
    tx.execute(
        "INSERT INTO end_reminders(record_id) VALUES(?1) ON CONFLICT(record_id) DO NOTHING",
        [id],
    )
    .map_err(db_error)?;
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

#[path = "tracking.rs"]
mod tracking;
pub use tracking::Notice;
#[cfg(test)]
#[path = "tracking_tests.rs"]
mod tracking_tests;

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
    pub(super) fn jump_wall(&self, ms: i64) {
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

## NEW FILE E:\WorkMemo\src-tauri\src\desktop.rs

````````rust
use std::sync::atomic::Ordering;
use tauri::{
    Emitter, Manager, WebviewUrl, WebviewWindowBuilder,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};

pub fn show_main(app: &tauri::AppHandle, settlement: bool) -> Result<(), String> {
    let window = app.get_webview_window("main").ok_or("主窗口不可用。")?;
    set_visibility(&window.as_ref().window(), true, true)?;
    window
        .show()
        .and_then(|_| window.unminimize())
        .and_then(|_| window.set_focus())
        .map_err(|e| e.to_string())?;
    if settlement {
        window
            .emit("workmemo:open-settlement", ())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub fn setup(app: &tauri::App) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "打开 WorkMemo", true, None::<&str>)?;
    let pending = MenuItem::with_id(app, "pending", "待补全工作量", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出 WorkMemo", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open, &pending, &quit])?;
    let mut builder = TrayIconBuilder::with_id("workmemo-tray")
        .tooltip("WorkMemo · 后台工作记录")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                let _ = show_main(app, false);
            }
            "pending" => {
                let _ = show_main(app, true);
            }
            "quit" => {
                let backend = app.state::<crate::service::Backend>();
                match backend.save_on_exit() {
                    Ok(()) => {
                        backend.exiting.store(true, Ordering::Relaxed);
                        app.exit(0);
                    }
                    Err(error) => {
                        let _ = show_main(app, false);
                        let _ = app.emit("workmemo:storage-error", error);
                    }
                }
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if matches!(
                event,
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                }
            ) {
                let _ = show_main(tray.app_handle(), false);
            }
        });
    if let Some(icon) = app.default_window_icon() {
        builder = builder.icon(icon.clone());
    }
    builder.build(app)?;
    app.state::<crate::service::Backend>()
        .tray_ready
        .store(true, Ordering::Relaxed);
    Ok(())
}

pub fn present_notice(app: &tauri::AppHandle, visible: bool) -> Result<(), String> {
    if !visible {
        if let Some(window) = app.get_webview_window("notice") {
            set_visibility(&window.as_ref().window(), false, false)?;
        }
        return Ok(());
    }
    let window = match app.get_webview_window("notice") {
        Some(window) => window,
        None => {
            WebviewWindowBuilder::new(app, "notice", WebviewUrl::App("index.html?notice=1".into()))
                .title("WorkMemo 工作提醒")
                .inner_size(420.0, 460.0)
                .min_inner_size(340.0, 320.0)
                .transparent(true)
                .no_redirection_bitmap(true)
                .decorations(false)
                .shadow(false)
                .always_on_top(true)
                .skip_taskbar(true)
                .focused(false)
                .visible(false)
                .background_color(tauri::window::Color(0, 0, 0, 0))
                .build()
                .map_err(|e| e.to_string())?
        }
    };
    // Tao's creation-only focused(false) marker is cleared after creation;
    // a later generic show() may activate the window. Use the native no-activate
    // command consistently for both showing and hiding this auxiliary window.
    set_visibility(&window.as_ref().window(), true, false)
}

pub fn set_visibility(window: &tauri::Window, visible: bool, activate: bool) -> Result<(), String> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SW_HIDE, SW_SHOWNOACTIVATE, SW_SHOWNORMAL, ShowWindowAsync,
        };
        let handle = window.hwnd().map_err(|e| e.to_string())?;
        let command = if !visible {
            SW_HIDE
        } else if activate {
            SW_SHOWNORMAL
        } else {
            SW_SHOWNOACTIVATE
        };
        if unsafe { ShowWindowAsync(handle.0 as _, command) } == 0 {
            return Err(format!(
                "原生窗口显示请求失败：{}",
                std::io::Error::last_os_error()
            ));
        }
        Ok(())
    }
    #[cfg(not(windows))]
    {
        let _ = activate;
        if visible {
            window.show()
        } else {
            window.hide()
        }
        .map_err(|e| e.to_string())
    }
}
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
        assert_eq!(version, 3);
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
mod browser_bridge;
mod browser_protocol;
mod clock;
mod database;
mod desktop;
mod monitor;
mod native_activity;
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
            desktop::setup(app)?;
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
            service::get_monitor_config,
            service::save_monitor_config,
            service::get_notice,
            service::defer_notice,
            service::show_main,
            service::exit_app,
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

#[cfg(debug_assertions)]
pub fn monitor_probe() -> String {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let application_id = &context.config().identifier;
    match native_activity::sample() {
        Ok(sample)=>serde_json::json!({"application_id":application_id,"native_available":sample.reliable,"unlocked":sample.unlocked,
            "chrome_foreground":sample.chrome_foreground,"last_input_age_ms":sample.at.ticks_ms.saturating_sub(sample.last_input_ticks)}).to_string(),
        Err(error)=>serde_json::json!({"application_id":application_id,"native_available":false,"error":error}).to_string(),
    }
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\main.rs

````````rust
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(debug_assertions)]
    if std::env::args().any(|arg| arg == "--monitor-probe") {
        println!("{}", workmemo_lib::monitor_probe());
        return;
    }
    workmemo_lib::run()
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\monitor.rs

````````rust
use crate::clock::TimePoint;
use serde::{Deserialize, Serialize};

pub const INPUT_POLL_MS: i64 = 5_000;
pub const RECENT_INPUT_MS: i64 = 5_000;
pub const IDLE_WARNING_MS: i64 = 300_000;
pub const IDLE_END_MS: i64 = 420_000;
pub const AWAY_PAUSE_MS: i64 = 120_000;
pub const HOLD_MS: i64 = 600_000;
pub const BROWSER_TIMEOUT_MS: i64 = 15_000;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct WorkUrl {
    pub id: i64,
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MonitorConfig {
    pub enabled: bool,
    pub revision: i64,
    pub rules: Vec<WorkUrl>,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuleInput {
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConfigInput {
    pub enabled: bool,
    pub expected_revision: i64,
    pub rules: Vec<RuleInput>,
}

#[derive(Clone, Copy, Debug)]
pub struct NativeSample {
    pub at: TimePoint,
    pub last_input_ticks: i64,
    pub chrome_foreground: bool,
    pub unlocked: bool,
    pub reliable: bool,
}

#[derive(Clone, Debug)]
pub struct PageSample {
    pub at: TimePoint,
    pub focused: bool,
    pub rule_id: Option<i64>,
    pub revision: i64,
    pub ready: bool,
}

#[derive(Clone, Debug, Default, Serialize)]
pub struct MonitorStatus {
    pub enabled: bool,
    pub browser_connected: bool,
    pub native_available: bool,
    pub work_page: bool,
    pub idle_warning: bool,
    pub message: String,
    pub revision: i64,
}

#[derive(Default)]
pub struct Runtime {
    pub active: bool,
    pub events_failed: bool,
    pub config: MonitorConfig,
    pub native: Option<NativeSample>,
    pub page: Option<PageSample>,
    pub last_trusted_page: Option<i64>,
    pub browser_owner: Option<u64>,
    pub last_tick: Option<i64>,
    pub last_input: Option<i64>,
    pub record_id: Option<i64>,
    pub entered_at: Option<i64>,
    pub page_was_matched: bool,
    pub away_since: Option<i64>,
    pub monitor_pause_since: Option<i64>,
    pub input_floor: i64,
    pub warning_dismissed_for: Option<i64>,
    pub status: MonitorStatus,
}

impl Runtime {
    pub fn record_changed(&mut self, id: i64, at: TimePoint) {
        self.record_id = Some(id);
        self.last_input = Some(at.ticks_ms);
        self.away_since = None;
        self.monitor_pause_since = None;
        self.warning_dismissed_for = None;
        self.status.idle_warning = false;
    }
    pub fn record_ended(&mut self, at: TimePoint) {
        self.record_id = None;
        self.input_floor = at.ticks_ms;
        self.away_since = None;
        self.monitor_pause_since = None;
        self.status.idle_warning = false;
    }
}

pub fn normalize_url(value: &str) -> Result<String, String> {
    if value.len() > 2048 {
        return Err("工作 URL 不能超过 2048 字节。".into());
    }
    let mut url =
        url::Url::parse(value.trim()).map_err(|_| "请输入完整的 http 或 https 工作 URL。")?;
    if !["http", "https"].contains(&url.scheme())
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err("工作 URL 只支持不含用户名或密码的 http/https 地址。".into());
    }
    url.set_query(None);
    url.set_fragment(None);
    let result = url.to_string();
    if result.len() > 2048 {
        return Err("规范化后的 URL 过长。".into());
    }
    Ok(result)
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\native_activity.rs

````````rust
//! Input metadata only: no hooks, key values, input text, or pointer coordinates.
use crate::{
    clock::{Clock, SystemClock, TimePoint},
    monitor::NativeSample,
};
use std::sync::mpsc::{self, Receiver, Sender};

#[derive(Clone, Copy, Debug)]
pub struct SystemSignal {
    pub at: TimePoint,
    pub available: bool,
}

// LASTINPUTINFO contains a wrapping 32-bit uptime value. Never use a poll time
// as the input time; reject nonsensical/synthetic future timestamps instead.
pub fn expand_input_tick(uptime: i64, raw: u32) -> Option<i64> {
    if uptime < 0 {
        return None;
    }
    let elapsed = (uptime as u32).wrapping_sub(raw) as i64;
    (elapsed <= uptime && elapsed <= i32::MAX as i64).then_some(uptime - elapsed)
}

#[cfg(windows)]
mod platform {
    use super::*;
    use std::{
        mem::size_of,
        ptr::{null, null_mut},
    };
    use windows_sys::Win32::{
        Foundation::{CloseHandle, HWND, LPARAM, LRESULT, WPARAM},
        System::{
            LibraryLoader::GetModuleHandleW,
            RemoteDesktop::*,
            Threading::{
                OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION, QueryFullProcessImageNameW,
            },
        },
        UI::{
            Input::KeyboardAndMouse::{GetLastInputInfo, LASTINPUTINFO},
            WindowsAndMessaging::*,
        },
    };

    pub fn sample() -> Result<NativeSample, String> {
        let mut input = LASTINPUTINFO {
            cbSize: size_of::<LASTINPUTINFO>() as u32,
            dwTime: 0,
        };
        if unsafe { GetLastInputInfo(&mut input) } == 0 {
            return Err("无法读取 Windows 最后输入状态。".into());
        }
        // Read the comparison clock after the API, so an input arriving during
        // the call cannot look like a future timestamp.
        let at = SystemClock::new().now();
        let last_input_ticks = expand_input_tick(at.ticks_ms, input.dwTime)
            .ok_or("Windows 输入时间异常，已停止推测工时。")?;
        let mut buffer = null_mut();
        let mut bytes = 0;
        if unsafe {
            WTSQuerySessionInformationW(
                null_mut(),
                WTS_CURRENT_SESSION,
                WTSSessionInfoEx,
                &mut buffer,
                &mut bytes,
            )
        } == 0
        {
            return Err("无法确认当前 Windows 会话状态。".into());
        }
        let unlocked = if bytes as usize >= size_of::<WTSINFOEXW>() && !buffer.is_null() {
            // WTS owns the allocation; only access the documented level-1 data.
            let info = unsafe { &*(buffer as *const WTSINFOEXW) };
            info.Level == 1
                && unsafe { info.Data.WTSInfoExLevel1.SessionFlags }
                    == WTS_SESSIONSTATE_UNLOCK as i32
                && unsafe { info.Data.WTSInfoExLevel1.SessionState } == WTSActive
        } else {
            false
        };
        unsafe { WTSFreeMemory(buffer as _) };
        let foreground = unsafe { GetForegroundWindow() };
        let mut pid = 0;
        unsafe { GetWindowThreadProcessId(foreground, &mut pid) };
        let process = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid) };
        let mut path = [0u16; 32768];
        let mut length = path.len() as u32;
        let chrome_foreground = if !process.is_null() {
            let success =
                unsafe { QueryFullProcessImageNameW(process, 0, path.as_mut_ptr(), &mut length) }
                    != 0;
            unsafe { CloseHandle(process) };
            success
                && String::from_utf16_lossy(&path[..length as usize])
                    .rsplit(['\\', '/'])
                    .next()
                    .is_some_and(|name| name.eq_ignore_ascii_case("chrome.exe"))
        } else {
            false
        };
        Ok(NativeSample {
            at,
            last_input_ticks,
            chrome_foreground,
            unlocked,
            reliable: true,
        })
    }

    unsafe extern "system" fn procedure(
        hwnd: HWND,
        message: u32,
        wparam: WPARAM,
        lparam: LPARAM,
    ) -> LRESULT {
        if message == WM_NCCREATE {
            let create = unsafe { &*(lparam as *const CREATESTRUCTW) };
            unsafe { SetWindowLongPtrW(hwnd, GWLP_USERDATA, create.lpCreateParams as isize) };
        }
        let sender = unsafe { GetWindowLongPtrW(hwnd, GWLP_USERDATA) }
            as *const Sender<Result<SystemSignal, String>>;
        let state = match message {
            WM_WTSSESSION_CHANGE => match wparam as u32 {
                WTS_SESSION_LOCK
                | WTS_SESSION_LOGOFF
                | WTS_CONSOLE_DISCONNECT
                | WTS_REMOTE_DISCONNECT => Some(false),
                WTS_SESSION_UNLOCK | WTS_CONSOLE_CONNECT | WTS_REMOTE_CONNECT => Some(true),
                _ => None,
            },
            WM_POWERBROADCAST => match wparam as u32 {
                4 => Some(false),     // PBT_APMSUSPEND
                7 | 18 => Some(true), // PBT_APMRESUMESUSPEND / PBT_APMRESUMEAUTOMATIC
                _ => None,
            },
            _ => None,
        };
        if let Some(available) = state {
            if !sender.is_null() {
                let _ = unsafe { &*sender }.send(Ok(SystemSignal {
                    at: SystemClock::new().now(),
                    available,
                }));
            }
        }
        unsafe { DefWindowProcW(hwnd, message, wparam, lparam) }
    }

    pub fn listen() -> Receiver<Result<SystemSignal, String>> {
        let (sender, receiver) = mpsc::channel();
        std::thread::spawn(move || {
            let class: Vec<u16> = "WorkMemoSystemObserver\0".encode_utf16().collect();
            let instance = unsafe { GetModuleHandleW(null()) };
            let window_class = WNDCLASSW {
                lpfnWndProc: Some(procedure),
                hInstance: instance,
                lpszClassName: class.as_ptr(),
                ..Default::default()
            };
            if unsafe { RegisterClassW(&window_class) } == 0 {
                let _ = sender.send(Err("无法注册系统状态监听窗口。".into()));
                return;
            }
            // Hidden top-level window receives power broadcasts; a message-only
            // window would miss them. It is never shown or given focus.
            let hwnd = unsafe {
                CreateWindowExW(
                    0,
                    class.as_ptr(),
                    class.as_ptr(),
                    0,
                    0,
                    0,
                    0,
                    0,
                    null_mut(),
                    null_mut(),
                    instance,
                    &sender as *const _ as _,
                )
            };
            if hwnd.is_null() {
                let _ = sender.send(Err("无法创建系统状态监听窗口。".into()));
                return;
            }
            if unsafe { WTSRegisterSessionNotification(hwnd, NOTIFY_FOR_THIS_SESSION) } == 0 {
                let _ = sender.send(Err("无法订阅当前会话的锁屏通知。".into()));
                unsafe { DestroyWindow(hwnd) };
                return;
            }
            let mut message = MSG::default();
            while unsafe { GetMessageW(&mut message, null_mut(), 0, 0) } > 0 {
                unsafe {
                    TranslateMessage(&message);
                    DispatchMessageW(&message);
                }
            }
            unsafe {
                WTSUnRegisterSessionNotification(hwnd);
                DestroyWindow(hwnd);
            }
        });
        receiver
    }
}

#[cfg(windows)]
pub use platform::{listen, sample};
#[cfg(not(windows))]
pub fn sample() -> Result<NativeSample, String> {
    Err("本阶段输入监测仅支持 Windows。".into())
}
#[cfg(not(windows))]
pub fn listen() -> Receiver<Result<SystemSignal, String>> {
    let (_sender, receiver) = mpsc::channel();
    receiver
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn wrapping_input_clock_retains_actual_last_input() {
        let uptime = (u32::MAX as i64) + 50_000;
        let raw = (uptime - 420_123) as u32;
        assert_eq!(expand_input_tick(uptime, raw), Some(uptime - 420_123));
        assert_eq!(expand_input_tick(100, 200), None);
    }
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\service.rs

````````rust
use crate::{
    browser_bridge,
    monitor::{ConfigInput, MonitorConfig, NativeSample},
    native_activity,
};
use crate::{
    clock::{Clock, SystemClock},
    database::{
        HistoryPage, HistoryQuery, Notice, Result, SettleInput, Snapshot, StartInput, Store,
        WorkRecord,
    },
};
use std::{
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};
use tauri::{Emitter, Manager, State};

pub(crate) type SharedStore = Arc<Mutex<Result<Store>>>;
pub struct Backend {
    inner: SharedStore,
    pub tray_ready: AtomicBool,
    pub exiting: AtomicBool,
}

impl Backend {
    pub fn initialize(app: &tauri::App) -> Self {
        let directory = app.path().app_local_data_dir();
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
        if let Ok(mut guard) = inner.lock() {
            if let Ok(store) = guard.as_mut() {
                store.activate_monitoring();
            }
        }
        if let Ok(directory) = directory {
            let ready = inner.lock().ok().is_some_and(|g| g.is_ok());
            if ready {
                if let Err(error) = browser_bridge::start(inner.clone(), &directory) {
                    if let Ok(mut guard) = inner.lock() {
                        if let Ok(store) = guard.as_mut() {
                            store.warning = Some(error);
                        }
                    }
                }
            }
        }
        let weak = Arc::downgrade(&inner);
        let app_handle = app.handle().clone();
        let signals = native_activity::listen();
        std::thread::spawn(move || {
            let mut presented = None;
            let mut listener_ok = true;
            let mut reported_error: Option<String> = None;
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                let mut notice = None;
                let mut runtime_failure: Option<String> = None;
                if let Ok(mut guard) = shared.lock() {
                    if let Ok(store) = guard.as_mut() {
                        let now = SystemClock::new().now();
                        for signal in signals.try_iter() {
                            match signal {
                                Ok(signal) => {
                                    if !signal.available {
                                        if let Err(error) = store.system_unavailable(signal.at) {
                                            store.warning = Some(error.clone());
                                            runtime_failure = Some(error);
                                        }
                                    }
                                    store.monitor.native = None;
                                }
                                Err(error) => {
                                    listener_ok = false;
                                    store.monitor.events_failed = true;
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    let _ = store.system_unavailable(now);
                                }
                            }
                        }
                        let sample = if store.monitor_sample_due(now.ticks_ms) {
                            match native_activity::sample() {
                                Ok(mut sample) => {
                                    sample.reliable &= listener_ok;
                                    sample
                                }
                                Err(error) => {
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    NativeSample {
                                        at: now,
                                        last_input_ticks: 0,
                                        chrome_foreground: false,
                                        unlocked: false,
                                        reliable: false,
                                    }
                                }
                            }
                        } else {
                            store.monitor.native.unwrap()
                        };
                        let now = SystemClock::new().now();
                        if let Err(error) = store.monitor_tick(sample, now) {
                            store.warning = Some(error.clone());
                            runtime_failure = Some(error);
                        }
                        match store.current_notice() {
                            Ok(value) => notice = value,
                            Err(error) => {
                                store.warning = Some(error.clone());
                                runtime_failure = Some(error);
                            }
                        }
                    }
                }
                let key = notice
                    .as_ref()
                    .map(|n| format!("{}:{}", n.kind, n.record.id));
                if key != presented {
                    match crate::desktop::present_notice(&app_handle, notice.is_some()) {
                        Ok(()) => presented = key,
                        Err(error) => {
                            let message =
                                format!("提醒窗口未能显示，记录仍保留在待补全列表：{error}");
                            if let Ok(mut guard) = shared.lock() {
                                if let Ok(store) = guard.as_mut() {
                                    store.warning = Some(message.clone());
                                }
                            }
                            runtime_failure = Some(message);
                        }
                    }
                }
                if let Some(error) = runtime_failure {
                    if reported_error.as_ref() != Some(&error) {
                        // Surface background failures without stealing keyboard focus.
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = crate::desktop::set_visibility(
                                &window.as_ref().window(),
                                true,
                                false,
                            );
                        }
                        let _ = app_handle.emit("workmemo:runtime-error", error.clone());
                    }
                    reported_error = Some(error);
                } else if listener_ok {
                    if let Ok(mut guard) = shared.lock() {
                        if let Ok(store) = guard.as_mut() {
                            if store.monitor.native.is_some_and(|sample| sample.reliable) {
                                if let Some(previous) = reported_error.take() {
                                    if store.warning.as_ref() == Some(&previous) {
                                        store.warning = None;
                                    }
                                    let _ = app_handle.emit("workmemo:runtime-recovered", previous);
                                }
                            }
                        }
                    }
                }
            }
        });
        Self {
            inner,
            tray_ready: AtomicBool::new(false),
            exiting: AtomicBool::new(false),
        }
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
        // Resolve expired automatic deadlines before a manual command can
        // pause/finish the same record or start another one.
        before_action(store)?;
        action(store)?;
        store.snapshot()
    })
    .await
}

fn before_action(store: &mut Store) -> Result<()> {
    if store.monitor.active {
        let sample = native_activity::sample();
        let now = SystemClock::new().now();
        let mut sample = sample.unwrap_or(NativeSample {
            at: now,
            last_input_ticks: 0,
            chrome_foreground: false,
            unlocked: false,
            reliable: false,
        });
        sample.reliable &= !store.monitor.events_failed;
        store.monitor_tick(sample, now)?;
    }
    Ok(())
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
    access(state.inner.clone(), |store| store.snapshot()).await
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

#[tauri::command]
pub async fn get_monitor_config(state: State<'_, Backend>) -> Result<MonitorConfig> {
    access(state.inner.clone(), |store| store.monitor_config()).await
}
#[tauri::command]
pub async fn save_monitor_config(
    state: State<'_, Backend>,
    input: ConfigInput,
) -> Result<MonitorConfig> {
    access(state.inner.clone(), move |store| {
        before_action(store)?;
        store.save_monitor_config(input)
    })
    .await
}
#[tauri::command]
pub async fn get_notice(state: State<'_, Backend>) -> Result<Option<Notice>> {
    access(state.inner.clone(), |store| store.current_notice()).await
}
#[tauri::command]
pub async fn defer_notice(
    app: tauri::AppHandle,
    state: State<'_, Backend>,
    id: i64,
    kind: String,
) -> Result<()> {
    access(state.inner.clone(), move |store| {
        store.defer_notice(id, &kind)
    })
    .await?;
    if let Some(window) = app.get_webview_window("notice") {
        crate::desktop::set_visibility(&window.as_ref().window(), false, false)?;
    }
    Ok(())
}
#[tauri::command]
pub fn show_main(app: tauri::AppHandle, settlement: bool) -> Result<()> {
    crate::desktop::show_main(&app, settlement)
}
#[tauri::command]
pub fn exit_app(app: tauri::AppHandle, state: State<'_, Backend>) -> Result<()> {
    state.save_on_exit()?;
    state.exiting.store(true, Ordering::Relaxed);
    app.exit(0);
    Ok(())
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let backend = window.state::<Backend>();
        if window.label() == "notice" {
            api.prevent_close();
            let result = (|| -> Result<()> {
                let mut guard = backend.inner.lock().map_err(|_| "本地服务锁异常。")?;
                let store = guard.as_mut().map_err(|e| e.clone())?;
                if let Some(notice) = store.current_notice()? {
                    store.defer_notice(notice.record.id, &notice.kind)?;
                }
                crate::desktop::set_visibility(window, false, false)
            })();
            if let Err(error) = result {
                let _ = window.emit("workmemo:storage-error", error);
            }
            return;
        }
        if window.label() == "main"
            && backend.tray_ready.load(Ordering::Relaxed)
            && !backend.exiting.load(Ordering::Relaxed)
        {
            api.prevent_close();
            if let Err(error) = crate::desktop::set_visibility(window, false, false) {
                let _ = window.emit("workmemo:storage-error", error.to_string());
            }
            return;
        }
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}
````````

## UPDATE E:\WorkMemo\src-tauri\src\settlement.rs

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
        tx.execute(
            "UPDATE end_reminders SET dismissed=1 WHERE record_id=?1",
            [input.id],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(())
    }
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\tracking.rs

````````rust
use super::*;
use crate::monitor::*;
use serde::Serialize;
use std::collections::HashSet;

#[derive(Clone, Debug, Serialize)]
pub struct Notice {
    pub kind: String,
    pub record: WorkRecord,
}

impl Store {
    pub fn monitor_config(&self) -> Result<MonitorConfig> {
        let (enabled, revision) = self
            .connection
            .query_row(
                "SELECT enabled,revision FROM monitoring_settings WHERE id=1",
                [],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .map_err(db_error)?;
        let mut statement = self
            .connection
            .prepare("SELECT id,url_prefix,category FROM work_urls ORDER BY id")
            .map_err(db_error)?;
        let rules = statement
            .query_map([], |r| {
                Ok(WorkUrl {
                    id: r.get(0)?,
                    url_prefix: r.get(1)?,
                    category: r.get(2)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)?;
        Ok(MonitorConfig {
            enabled,
            revision,
            rules,
        })
    }

    pub fn save_monitor_config(&mut self, input: ConfigInput) -> Result<MonitorConfig> {
        if input.rules.len() > 50 || (input.enabled && input.rules.is_empty()) {
            return Err("请配置 1 到 50 条工作 URL 后启用自动识别。".into());
        }
        let mut seen = HashSet::new();
        let mut rules = Vec::new();
        for rule in input.rules {
            let prefix = normalize_url(&rule.url_prefix)?;
            if !seen.insert(prefix.clone()) {
                return Err("工作 URL 重复，请合并重复规则。".into());
            }
            if !["评测", "质检", "开发", "文档"].contains(&rule.category.as_str()) {
                return Err("请选择有效的工作类别。".into());
            }
            rules.push((prefix, rule.category));
        }
        let current = self.monitor_config()?;
        if input.expected_revision != current.revision {
            return Err("监测配置已变化，请重新读取。".into());
        }
        let now = self.clock.now();
        let active = self.active()?.filter(|r| {
            r.control_mode == "AUTO"
                && !r.recovery_pending
                && r.pause_reason.as_deref() != Some("MANUAL")
        });
        let duration = active.as_ref().map(|r| self.elapsed(r, now)).transpose()?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if let (Some(record), Some(duration)) = (&active, duration) {
            if !record.is_paused {
                write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
            }
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3,control_mode=?4 WHERE id=?5",
                params![duration,duration/1000,if input.enabled{"MONITOR"}else{"MANUAL"},if input.enabled{"AUTO"}else{"MANUAL"},record.id]).map_err(db_error)?;
        }
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for (prefix, category) in rules {
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category) VALUES(?1,?2)",
                params![prefix, category],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET enabled=?1,revision=revision+1 WHERE id=1",
            [input.enabled],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        if active.is_some() {
            self.segment = None;
            self.monitor.monitor_pause_since = Some(now.ticks_ms);
        }
        self.monitor.config = self.monitor_config()?;
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.input_floor = now.ticks_ms;
        Ok(self.monitor.config.clone())
    }

    pub fn activate_monitoring(&mut self) {
        self.monitor.active = true;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.enabled = self.monitor.config.enabled;
    }

    pub fn observe_page(&mut self, page: PageSample) {
        if page.ready && page.revision == self.monitor.config.revision {
            self.monitor.last_trusted_page = Some(page.at.ticks_ms);
        }
        self.monitor.page = Some(page);
    }

    pub fn monitor_sample_due(&self, now: i64) -> bool {
        self.monitor
            .native
            .is_none_or(|sample| now.saturating_sub(sample.at.ticks_ms) >= INPUT_POLL_MS)
            || self.monitor.last_input.is_some_and(|last| {
                [IDLE_WARNING_MS, IDLE_END_MS].iter().any(|threshold| {
                    now >= last + threshold
                        && self
                            .monitor
                            .native
                            .is_none_or(|s| s.at.ticks_ms < last + threshold)
                })
            })
    }

    pub fn observe_browser_page(&mut self, client: u64, page: PageSample) {
        // A background Chrome profile cannot overwrite the focused profile.
        if page.focused
            || self.monitor.browser_owner.is_none()
            || self.monitor.browser_owner == Some(client)
        {
            self.monitor.browser_owner = Some(client);
            self.observe_page(page);
        }
    }

    // Close/trim current-process intervals at a trusted monotonic boundary.
    // Old sessions and legacy baselines are never reconstructed from wall time.
    fn close_at(
        &mut self,
        cutoff: i64,
        reason: &str,
        finish: bool,
        confirmed: TimePoint,
    ) -> Result<()> {
        let Some(record) = self.active()? else {
            return Ok(());
        };
        if record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL") {
            return Ok(());
        }
        if finish {
            self.monitor.status.idle_warning = false;
        }
        let duration = self.elapsed(&record, confirmed)?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if !record.is_paused {
            write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
        }
        tx.execute(
            "UPDATE work_segments SET duration_ms=MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            checkpoint_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_ticks_ms=start_ticks_ms+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),state='CLOSED'
            WHERE record_id=?2 AND clock_session=?3 AND start_ticks_ms IS NOT NULL",
            params![cutoff, record.id, self.clock_session],
        )
        .map_err(db_error)?;
        let total:i64=tx.query_row("SELECT legacy_duration_ms+COALESCE((SELECT SUM(duration_ms) FROM work_segments WHERE record_id=?1),0) FROM work_records WHERE id=?1",[record.id],|r|r.get(0)).map_err(db_error)?;
        tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3 WHERE id=?4",params![total,total/1000,if finish{None}else{Some(reason)},record.id]).map_err(db_error)?;
        if finish {
            finish_row(&tx, record.id, record.start_time, confirmed.wall_ms, reason)?;
        }
        tx.commit().map_err(db_error)?;
        self.segment = None;
        if finish {
            self.monitor.record_ended(confirmed);
            self.monitor.input_floor = cutoff;
        }
        Ok(())
    }

    pub fn system_unavailable(&mut self, at: TimePoint) -> Result<()> {
        self.close_at(at.ticks_ms, "MONITOR", false, self.clock.now())?;
        self.monitor.monitor_pause_since.get_or_insert(at.ticks_ms);
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.idle_warning = false;
        Ok(())
    }

    pub fn monitor_tick(&mut self, sample: NativeSample, now: TimePoint) -> Result<()> {
        if !self.monitor.active {
            return Ok(());
        }
        let last_tick = self.monitor.last_tick.replace(now.ticks_ms);
        if let Some(last) = last_tick.filter(|last| now.ticks_ms.saturating_sub(*last) > 10_000) {
            self.system_unavailable(TimePoint {
                ticks_ms: last,
                wall_ms: now.wall_ms.saturating_sub(now.ticks_ms - last).max(0),
            })?;
        }
        self.monitor.native = Some(sample);
        let native_ok = sample.reliable
            && sample.unlocked
            && now.ticks_ms.saturating_sub(sample.at.ticks_ms) <= 10_000
            && sample.last_input_ticks <= now.ticks_ms
            && sample.last_input_ticks >= 0;
        if !native_ok {
            self.system_unavailable(now)?;
        }
        let old_input = self.monitor.last_input;
        let new_input = if native_ok {
            Some(old_input.map_or(sample.last_input_ticks, |old| {
                old.max(sample.last_input_ticks)
            }))
        } else {
            old_input
        };
        let protected = |record: &WorkRecord| {
            record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL")
        };
        // A restored input arriving after an expired idle deadline starts a new
        // record; it must not silently extend the old one.
        if let (Some(old), Some(new)) = (old_input, new_input) {
            if new > old
                && new >= old.saturating_add(IDLE_END_MS)
                && self.active()?.is_some_and(|r| !protected(&r))
            {
                self.close_at(old, "IDLE", true, now)?;
                self.monitor.input_floor = old.saturating_add(IDLE_END_MS).saturating_sub(1);
            }
        }
        self.monitor.last_input = new_input;
        if new_input != old_input {
            self.monitor.warning_dismissed_for = None;
        }
        let connected = self
            .monitor
            .page
            .as_ref()
            .is_some_and(|p| now.ticks_ms.saturating_sub(p.at.ticks_ms) <= BROWSER_TIMEOUT_MS);
        let page_known = connected
            && self
                .monitor
                .page
                .as_ref()
                .is_some_and(|p| p.ready && p.revision == self.monitor.config.revision);
        let rule = self
            .monitor
            .page
            .as_ref()
            .and_then(|page| {
                self.monitor
                    .config
                    .rules
                    .iter()
                    .find(|rule| Some(rule.id) == page.rule_id)
            })
            .cloned();
        let matched = page_known
            && self.monitor.config.enabled
            && sample.chrome_foreground
            && self.monitor.page.as_ref().is_some_and(|p| p.focused)
            && rule.is_some();
        if matched && !self.monitor.page_was_matched {
            self.monitor.entered_at = Some(now.ticks_ms);
        }
        if !matched {
            self.monitor.entered_at = None;
        }
        self.monitor.page_was_matched = matched;

        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if record.control_mode == "AUTO" && (!page_known || !native_ok) {
                let cutoff = self
                    .monitor
                    .last_trusted_page
                    .unwrap_or(now.ticks_ms)
                    .min(now.ticks_ms);
                if !record.is_paused || record.pause_reason.as_deref() != Some("MONITOR") {
                    self.close_at(cutoff, "MONITOR", false, now)?;
                    self.monitor.monitor_pause_since = Some(cutoff);
                }
            }
            let mut deadlines = Vec::new();
            if let Some(last) = new_input {
                deadlines.push((last.saturating_add(IDLE_END_MS), 0, "IDLE", last));
            }
            if let Some(away) = self.monitor.away_since {
                deadlines.push((
                    away.saturating_add(AWAY_PAUSE_MS + HOLD_MS),
                    1,
                    "AWAY",
                    away.saturating_add(AWAY_PAUSE_MS),
                ));
            }
            if let Some(pause) = self.monitor.monitor_pause_since {
                deadlines.push((pause.saturating_add(HOLD_MS), 2, "RECOVERY", pause));
            }
            deadlines.sort_by_key(|d| (d.0, d.1));
            if let Some((deadline, _, reason, cutoff)) =
                deadlines.first().copied().filter(|d| d.0 <= now.ticks_ms)
            {
                self.close_at(cutoff, reason, true, now)?;
                self.monitor.input_floor = deadline;
            } else if record.control_mode == "AUTO" && native_ok && page_known {
                if matched {
                    self.monitor.away_since = None;
                    let fresh = new_input.is_some_and(|last| {
                        last >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                            && last > self.monitor.input_floor
                            && now.ticks_ms - last <= RECENT_INPUT_MS
                    });
                    if record.is_paused
                        && matches!(record.pause_reason.as_deref(), Some("AWAY" | "MONITOR"))
                        && fresh
                    {
                        let last = new_input.unwrap();
                        self.resume_at(
                            record.id,
                            TimePoint {
                                ticks_ms: last,
                                wall_ms: now
                                    .wall_ms
                                    .saturating_sub(now.ticks_ms - last)
                                    .max(record.start_time),
                            },
                            "AUTO",
                        )?;
                    }
                } else {
                    let away = *self.monitor.away_since.get_or_insert(now.ticks_ms);
                    if now.ticks_ms >= away.saturating_add(AWAY_PAUSE_MS) && !record.is_paused {
                        self.close_at(away.saturating_add(AWAY_PAUSE_MS), "AWAY", false, now)?;
                    }
                }
            }
        }

        if self.active()?.is_none() && matched && native_ok {
            if let (Some(last), Some(entered), Some(rule)) =
                (self.monitor.last_input, self.monitor.entered_at, rule)
            {
                if last >= entered
                    && last > self.monitor.input_floor
                    && now.ticks_ms - last <= RECENT_INPUT_MS
                {
                    self.start_at(
                        StartInput {
                            category: rule.category,
                            quantity: None,
                            remark: String::new(),
                        },
                        "AUTO",
                        TimePoint {
                            ticks_ms: last,
                            wall_ms: now.wall_ms.saturating_sub(now.ticks_ms - last).max(0),
                        },
                        false,
                    )?;
                }
            }
        }
        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if let Some(last) = self.monitor.last_input {
                let input_wall = now
                    .wall_ms
                    .saturating_sub(now.ticks_ms.saturating_sub(last))
                    .max(record.start_time);
                if new_input != old_input || record.last_input_time.is_none() {
                    self.connection
                        .execute(
                            "UPDATE work_records SET last_input_time=?1 WHERE id=?2",
                            params![input_wall, record.id],
                        )
                        .map_err(db_error)?;
                }
                self.monitor.status.idle_warning = native_ok
                    && now.ticks_ms.saturating_sub(last) >= IDLE_WARNING_MS
                    && now.ticks_ms.saturating_sub(last) < IDLE_END_MS
                    && self.monitor.warning_dismissed_for != Some(last);
            }
        } else {
            self.monitor.status.idle_warning = false;
        }
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.revision = self.monitor.config.revision;
        self.monitor.status.native_available = native_ok;
        self.monitor.status.browser_connected = connected;
        self.monitor.status.work_page = matched;
        self.monitor.status.message = if !native_ok {
            "系统状态暂不可确认，已暂停计时"
        } else if !self.monitor.config.enabled {
            "自动页面识别未启用；手动计时仍有空闲保护"
        } else if self.active()?.is_some_and(|r| r.recovery_pending) {
            "有上次待恢复任务，请先继续或结束"
        } else if self
            .active()?
            .is_some_and(|r| r.pause_reason.as_deref() == Some("MANUAL"))
        {
            "已手动暂停，等待明确继续"
        } else if !connected {
            "等待 Chrome 扩展连接"
        } else if !page_known {
            "等待扩展同步最新工作页面规则"
        } else if !matched {
            "当前不在配置的工作页面"
        } else if self.active()?.is_none() {
            "已识别工作页面，等待新的鼠标或键盘活动"
        } else {
            "工作监测正常"
        }
        .into();
        self.checkpoint()
    }

    pub fn current_notice(&self) -> Result<Option<Notice>> {
        let id:Option<i64>=self.connection.query_row("SELECT record_id FROM end_reminders JOIN work_records ON work_records.id=end_reminders.record_id WHERE dismissed=0 AND status='FINISHED' AND settlement_status='PENDING' ORDER BY record_id LIMIT 1",[],|r|r.get(0)).optional().map_err(db_error)?;
        if let Some(id) = id {
            return Ok(Some(Notice {
                kind: "ended".into(),
                record: self.record(id)?,
            }));
        }
        if self.monitor.status.idle_warning {
            if let Some(record) = self.active()? {
                return Ok(Some(Notice {
                    kind: "idle".into(),
                    record,
                }));
            }
        }
        Ok(None)
    }
    pub fn defer_notice(&mut self, id: i64, kind: &str) -> Result<()> {
        match kind {
            "ended" => {
                self.connection
                    .execute(
                        "UPDATE end_reminders SET dismissed=1 WHERE record_id=?1",
                        [id],
                    )
                    .map_err(db_error)?;
            }
            "idle" => {
                if self.active()?.is_some_and(|r| r.id == id) {
                    self.monitor.warning_dismissed_for = self.monitor.last_input;
                    self.monitor.status.idle_warning = false;
                }
            }
            _ => return Err("提醒类型无效。".into()),
        }
        Ok(())
    }
}
````````

## NEW FILE E:\WorkMemo\src-tauri\src\tracking_tests.rs

````````rust
use super::tests::{TestClock, TestDirectory};
use super::*;
use crate::monitor::*;

struct Harness {
    store: Store,
    clock: TestClock,
    input: i64,
    connected: bool,
    matched: bool,
    ready: bool,
}
impl Harness {
    fn new() -> Self {
        let clock = TestClock::new();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: 0,
                rules: vec![RuleInput {
                    url_prefix: "https://work.example.test/tasks?ignored=1#fragment".into(),
                    category: "开发".into(),
                }],
            })
            .unwrap();
        store.activate_monitoring();
        let mut harness = Self {
            store,
            clock,
            input: 0,
            connected: true,
            matched: true,
            ready: true,
        };
        harness.tick();
        harness
    }
    fn tick(&mut self) {
        let now = self.clock.now();
        if self.connected {
            self.store.observe_page(PageSample {
                at: now,
                focused: self.matched,
                rule_id: self
                    .matched
                    .then_some(self.store.monitor.config.rules[0].id),
                revision: self.store.monitor.config.revision,
                ready: self.ready,
            });
        }
        self.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: self.input,
                    chrome_foreground: self.matched,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
    }
    fn step(&mut self, ms: i64, input: bool) {
        self.clock.advance(ms);
        if input {
            self.input = self.clock.now().ticks_ms;
        }
        self.tick();
    }
    fn advance(&mut self, mut ms: i64, input: bool) {
        while ms > 0 {
            let step = ms.min(5000);
            self.step(step, input);
            ms -= step;
        }
    }
    fn start(&mut self) -> i64 {
        self.step(1000, true);
        self.store.active().unwrap().unwrap().id
    }
    fn saved(&self, id: i64) -> WorkRecord {
        self.store.record(id).unwrap()
    }
}

#[test]
fn merely_open_or_background_page_does_not_start_and_new_input_starts_once() {
    let mut h = Harness::new();
    h.advance(30_000, false);
    assert!(h.store.active().unwrap().is_none());
    h.matched = false;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1, false);
    assert!(h.store.active().unwrap().is_none());
    let id = h.start();
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    let record = h.saved(id);
    assert_eq!(record.source, "AUTO");
    assert_eq!(record.control_mode, "AUTO");
    assert_eq!(record.quantity, None);
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn idle_thresholds_use_input_time_warning_cancels_and_seven_minutes_are_removed() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(299_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "idle");
    h.store.defer_notice(id, "idle").unwrap();
    h.step(1000, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1000, true);
    assert!(!h.store.monitor.status.idle_warning);
    let last = h.clock.now();
    h.advance(420_000, false);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 420_000));
    assert_eq!(record.duration_ms, last.ticks_ms - 1000);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "ended");
    h.step(5000, false);
    assert_eq!(
        h.store
            .connection
            .query_row(
                "SELECT count(*) FROM end_reminders WHERE record_id=?1",
                [id],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        1
    );
}

#[test]
fn idle_end_wins_over_away_and_rolls_back_the_two_minute_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(120_000, false);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    h.advance(300_000, false);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn other_application_input_cannot_extend_work_beyond_away_grace_or_twelve_minutes() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(119_999, true);
    assert!(!h.saved(id).is_paused);
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    h.advance(599_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("AWAY"));
    assert_eq!(record.duration_ms, 130_000);
    assert_eq!(
        record.confirmed_end_time.unwrap() - record.end_time.unwrap(),
        600_000
    );
}

#[test]
fn return_inside_hold_needs_new_input_and_resumes_same_record_excluding_pause() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(180_000, true);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    assert!(!h.saved(id).is_paused);
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).duration_ms, 140_000);
}

#[test]
fn equal_idle_and_away_deadlines_produce_one_idle_result() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(300_000, true);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 130_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[test]
fn first_input_at_idle_deadline_starts_new_record_instead_of_merging() {
    let mut h = Harness::new();
    let old = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    let current = h.store.active().unwrap().unwrap();
    assert_ne!(current.id, old);
    assert_eq!(current.duration_ms, 0);
    assert_eq!(h.saved(old).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_is_never_ended_resumed_or_bypassed_and_manual_resume_ignores_url() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.advance(900_000, false);
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).status, "WORKING");
    h.advance(10_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(180_000, true);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 190_000);
}

#[test]
fn lost_browser_connection_removes_unconfirmed_tail_and_recovers_only_with_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let trusted = h.clock.now();
    h.connected = false;
    h.advance(20_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.monitor.last_trusted_page, Some(trusted.ticks_ms));
    h.connected = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
}

#[test]
fn revoked_permission_is_unknown_not_a_counted_away_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.ready = false;
    h.advance(5000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn lock_or_suspended_scheduler_gap_never_counts_unknown_time() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let lock = h.clock.now();
    h.clock.advance(5000);
    h.store.system_unavailable(lock).unwrap();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.clock.advance(60_000);
    h.tick();
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn deferred_reminder_and_pending_record_survive_restart_without_blocking_new_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(id).unwrap();
        assert!(store.current_notice().unwrap().is_some());
        store.defer_notice(id, "ended").unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
    }
    let store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(store.current_notice().unwrap().is_none());
    assert_eq!(store.pending_records().unwrap()[0].id, id);
    assert!(store.active().unwrap().unwrap().recovery_pending);
}

#[test]
fn config_validation_conflict_and_storage_failure_keep_previous_rules() {
    let mut h = Harness::new();
    let original = h.store.monitor_config().unwrap();
    for url in [
        "file:///private",
        "https://name:password@work.example.test/",
        "not-a-url",
    ] {
        assert!(
            h.store
                .save_monitor_config(ConfigInput {
                    enabled: true,
                    expected_revision: original.revision,
                    rules: vec![RuleInput {
                        url_prefix: url.into(),
                        category: "开发".into()
                    }]
                })
                .is_err()
        );
    }
    h.store.connection.execute_batch("CREATE TRIGGER reject_rule BEFORE INSERT ON work_urls BEGIN SELECT RAISE(ABORT,'rule failure'); END;").unwrap();
    assert!(
        h.store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: original.revision,
                rules: vec![RuleInput {
                    url_prefix: "https://other.example.test/".into(),
                    category: "开发".into()
                }]
            })
            .is_err()
    );
    let current = h.store.monitor_config().unwrap();
    assert_eq!(current.revision, original.revision);
    assert_eq!(current.rules, original.rules);
}

#[test]
fn delayed_detection_does_not_add_poll_delay_to_effective_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(419_000, false);
    h.step(4_003, false);
    let record = h.saved(id);
    assert_eq!(record.duration_ms, 10_000);
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 423_003));
}

#[test]
fn unconfirmed_browser_outage_cannot_hold_record_forever_while_input_continues() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.connected = false;
    h.advance(615_000, true);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("RECOVERY"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn background_browser_profiles_cannot_override_the_focused_profile() {
    let mut h = Harness::new();
    let at = h.clock.now();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let page = |focused| PageSample {
        at,
        focused,
        rule_id: focused.then_some(rule),
        revision,
        ready: true,
    };
    h.store.observe_browser_page(11, page(true));
    h.store.observe_browser_page(22, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(11));
    h.store.observe_browser_page(22, page(true));
    h.store.observe_browser_page(11, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(22));
}

#[test]
fn last_input_timestamp_does_not_move_when_wall_clock_changes_without_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.saved(id).last_input_time;
    h.clock.jump_wall(3_600_000);
    h.advance(5000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn second_schema_pending_intervals_survive_upgrade_without_an_upgrade_popup() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection
        .execute_batch(include_str!("../migrations/002_settlement.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=2;
        INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time)
        VALUES(10,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);
        INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(10,1000,2250,2250,1250,'CLOSED');").unwrap();
    let mut store = Store::initialize(connection, Box::new(TestClock::new()), None).unwrap();
    let pending = store.pending_records().unwrap();
    assert_eq!(pending[0].id, 10);
    assert_eq!(pending[0].duration_ms, 1250);
    assert_eq!(pending[0].quantity, None);
    assert!(store.current_notice().unwrap().is_none());
    store
        .settle(SettleInput {
            id: 10,
            expected_revision: 0,
            category: "开发".into(),
            quantity: 0.0,
            remark: "".into(),
        })
        .unwrap();
    assert_eq!(store.record(10).unwrap().duration_ms, 1250);
}

#[test]
fn automatic_finish_failure_rolls_back_trim_and_retries_without_duplicate_reminders() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.store.connection.execute_batch("CREATE TRIGGER reject_auto_end BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'auto end failure'); END;").unwrap();
    h.clock.advance(1);
    let now = h.clock.now();
    assert!(
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: h.input,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true
                },
                now
            )
            .is_err()
    );
    assert_eq!(h.saved(id).status, "WORKING");
    assert!(h.store.current_notice().unwrap().is_none());
    h.store
        .connection
        .execute_batch("DROP TRIGGER reject_auto_end")
        .unwrap();
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_rejects_bad_auth_and_replay_before_changing_page_state() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    crate::browser_bridge::start(shared.clone(), directory.db().parent().unwrap()).unwrap();
    let endpoint_path = directory
        .db()
        .parent()
        .unwrap()
        .join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let send = |stream: &mut TcpStream, token: String, sequence, focused| {
        let frame = BrowserFrame {
            version: 1,
            sequence,
            config_revision: revision,
            focused,
            ready: true,
            rule_id: Some(rule),
        };
        let mut bytes = serde_json::to_vec(&WireRequest { token, frame }).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        stream.flush().unwrap();
    };
    let mut bad = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    bad.set_read_timeout(Some(Duration::from_secs(2))).unwrap();
    send(&mut bad, "invalid".into(), 1, false);
    let mut line = String::new();
    let rejected = |result: std::io::Result<usize>| match result {
        Ok(0) => (),
        Err(error)
            if matches!(
                error.kind(),
                std::io::ErrorKind::ConnectionReset | std::io::ErrorKind::ConnectionAborted
            ) =>
        {
            ()
        }
        other => panic!("expected a rejected connection, got {other:?}"),
    };
    // Windows may close a rejected socket with FIN or RST. Neither may return
    // a successful reply or change the page state.
    rejected(BufReader::new(bad).read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    let mut valid = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    valid
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(valid.try_clone().unwrap());
    send(&mut valid, endpoint.token.clone(), 1, true);
    reader.read_line(&mut line).unwrap();
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&line).unwrap()["connected"],
        true
    );
    line.clear();
    send(&mut valid, endpoint.token, 1, false);
    rejected(reader.read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    drop(reader);
    drop(valid);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn unavailable_native_metadata_blocks_manual_start_and_resume_without_losing_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: h.input,
                chrome_foreground: true,
                unlocked: false,
                reliable: false,
            },
            now,
        )
        .unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into()
            })
            .is_err()
    );
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert!(h.saved(id).is_paused);
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 10000);
}

#[test]
fn already_expired_record_cannot_be_resurrected_by_manual_finish_or_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    h.advance(420_000, false);
    h.store.finish(id).unwrap();
    assert!(h.store.resume(id).is_err());
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
}
````````

## NEW FILE E:\WorkMemo\src-tauri\tests\browser_host.rs

````````rust
#![cfg(all(windows, debug_assertions))]
use std::{
    fs,
    io::{BufRead, BufReader, Read, Write},
    net::TcpListener,
    os::windows::process::CommandExt,
    path::PathBuf,
    process::{Command, Stdio},
};
const ORIGIN: &str = "chrome-extension://oljcealhccdhaddceacnokihjefloaih/";
struct Profile {
    path: PathBuf,
    id: String,
}
impl Profile {
    fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let id = format!("com.workmemo.test.host.{}.{nonce}", std::process::id());
        let base = PathBuf::from(std::env::var_os("LOCALAPPDATA").unwrap());
        let path = base.join(&id);
        assert_eq!(path.parent(), Some(base.as_path()));
        fs::create_dir(&path).unwrap();
        Self { path, id }
    }
}
impl Drop for Profile {
    fn drop(&mut self) {
        let _ = fs::remove_file(self.path.join("browser-bridge.endpoint.json"));
        let _ = fs::remove_dir(&self.path);
    }
}
fn host(profile: &Profile, origin: &str) -> std::process::Child {
    Command::new(env!("CARGO_BIN_EXE_workmemo-browser"))
        .arg(origin)
        .env("WORKMEMO_TEST_PROFILE", &profile.id)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(0x08000000)
        .spawn()
        .unwrap()
}

#[test]
fn actual_native_host_round_trip_authenticates_and_forwards_only_metadata() {
    let profile = Profile::new();
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let token = "1a".repeat(32);
    fs::write(
        profile.path.join("browser-bridge.endpoint.json"),
        serde_json::to_vec(
            &serde_json::json!({"port":listener.local_addr().unwrap().port(),"token":token}),
        )
        .unwrap(),
    )
    .unwrap();
    let server = std::thread::spawn(move || {
        let (mut stream, _) = listener.accept().unwrap();
        let mut reader = BufReader::new(stream.try_clone().unwrap());
        let mut line = String::new();
        reader.read_line(&mut line).unwrap();
        let request: serde_json::Value = serde_json::from_str(&line).unwrap();
        assert_eq!(request["token"], token);
        assert_eq!(request["frame"].as_object().unwrap().len(), 6);
        assert!(request["frame"].get("url").is_none());
        stream.write_all(b"{\"connected\":true,\"config\":{\"enabled\":false,\"revision\":0,\"rules\":[]}}\n").unwrap();
    });
    let mut child = host(&profile, ORIGIN);
    let frame=serde_json::to_vec(&serde_json::json!({"version":1,"sequence":1,"config_revision":0,"focused":false,"ready":false,"rule_id":null})).unwrap();
    let mut input = child.stdin.take().unwrap();
    input
        .write_all(&(frame.len() as u32).to_le_bytes())
        .unwrap();
    input.write_all(&frame).unwrap();
    input.flush().unwrap();
    let output = child.stdout.as_mut().unwrap();
    let mut length = [0; 4];
    output.read_exact(&mut length).unwrap();
    let length = u32::from_le_bytes(length) as usize;
    assert!(length < 131072);
    let mut response = vec![0; length];
    output.read_exact(&mut response).unwrap();
    let response: serde_json::Value = serde_json::from_slice(&response).unwrap();
    assert_eq!(response["connected"], true);
    drop(input);
    assert!(child.wait().unwrap().success());
    server.join().unwrap();
}

#[test]
fn native_host_rejects_another_extension_and_unexpected_page_content() {
    let profile = Profile::new();
    let mut wrong = host(
        &profile,
        "chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/",
    );
    drop(wrong.stdin.take());
    assert!(!wrong.wait().unwrap().success());
    let mut child = host(&profile, ORIGIN);
    let frame=b"{\"version\":1,\"sequence\":1,\"config_revision\":0,\"focused\":false,\"ready\":false,\"rule_id\":null,\"url\":\"https://private.invalid\"}";
    let mut input = child.stdin.take().unwrap();
    input
        .write_all(&(frame.len() as u32).to_le_bytes())
        .unwrap();
    input.write_all(frame).unwrap();
    drop(input);
    assert!(!child.wait().unwrap().success());
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
.monitor-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; font-size: 10px; color: var(--text-muted); }
.monitor-status button { flex-shrink: 0; }
.monitor-settings { display: grid; gap: 12px; margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
````````

## UPDATE E:\WorkMemo\src\App.tsx

````````tsx
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
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
import { MonitoringSettings } from "./MonitoringSettings";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [monitorOpen, setMonitorOpen] = useState(false);
  const [navigationError, setNavigationError] = useState("");
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
  useEffect(() => {
    if (!session.native) return;
    let stopped = false; let unlisten: UnlistenFn | undefined;
    void listen("workmemo:open-settlement", () => { if (!stopped) setSettlementOpen(true); })
      .then(unsubscribe => { if (stopped) unsubscribe(); else unlisten = unsubscribe; })
      .catch((failure: unknown) => { if (!stopped) setNavigationError(String(failure)); });
    return () => { stopped = true; unlisten?.(); };
  }, [session.native]);

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
      {navigationError && <p className="error-banner" role="alert">托盘导航通知不可用：{navigationError}</p>}
      {session.native && <div className="monitor-status">
        <span role="status">{session.snapshot?.monitoring?.message || "正在读取监测状态…"}</span>
        <button type="button" className="text-button" onClick={() => setMonitorOpen(true)}>监测设置</button>
      </div>}
      {session.snapshot?.monitoring?.idle_warning && <p className="notice" role="status">已连续 5 分钟没有输入，7 分钟时将自动结束。恢复操作后会取消提醒。</p>}

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
            onClick={() => { void session.finish(active.id); }}><Icon name="check" /><span>{session.pending === "finish_task" ? "正在保存…" : "结束计时"}</span></button>}
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
      <MonitoringSettings open={monitorOpen} onClose={() => setMonitorOpen(false)} onSaved={() => { void session.refresh(); }} />
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
          <button type="button" className="secondary" disabled={!session.native || session.busy}
            onClick={() => { void invoke("exit_app").catch(failure => setNavigationError(String(failure))); }}>退出 WorkMemo</button>
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

## UPDATE E:\WorkMemo\src\DesktopWindow.tsx

````````tsx
import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

const DIRECTIONS = [
  "North", "NorthEast", "East", "SouthEast", "South", "SouthWest", "West", "NorthWest",
] as const;
type ResizeDirection = (typeof DIRECTIONS)[number];

/** Window controls stay outside the drag area; closing uses the save-on-close path. */
export function DesktopWindow({ children, appearanceStyle, navigation, categories, density = "compact" }: {
  children: ReactNode; appearanceStyle?: CSSProperties; navigation?: ReactNode; categories?: ReactNode;
  density?: "compact" | "comfortable";
}) {
  const native = isTauri();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function control(action: "minimize" | "close") {
    if (!native || busy) return;
    setBusy(true);
    setError("");
    try {
      const window = getCurrentWindow();
      if (action === "close") await window.close(); else await window.minimize();
    } catch (cause: unknown) {
      setError(`${action === "close" ? "无法关闭窗口" : "无法最小化窗口"}：${String(cause)}`);
    } finally {
      setBusy(false);
    }
  }

  async function drag(event: MouseEvent, direction?: ResizeDirection) {
    if (!native || event.button !== 0 || busy) return;
    event.preventDefault();
    setError("");
    try {
      const window = getCurrentWindow();
      if (direction) await window.startResizeDragging(direction); else await window.startDragging();
    } catch (cause: unknown) {
      setError(`${direction ? "无法调整窗口大小" : "无法移动窗口"}：${String(cause)}`);
    }
  }

  return (
    <div className="desktop-frame" data-density={density} style={appearanceStyle}>
      <div className="app-shell">
        <header className="titlebar">
          <div className="titlebar-drag" title={native ? "按住这里移动窗口" : "请在桌面应用中移动窗口"}
            onMouseDown={(event) => { void drag(event); }}>
            <img className="brand-mark" src="/workmemo.png" alt="" aria-hidden="true" draggable={false} />
            <span className="brand-name">WorkMemo</span>
          </div>
          {navigation}
          {categories}
          <div className="window-controls" aria-label="窗口操作">
            <button type="button" className="window-control" aria-label="最小化窗口"
              title={native ? "最小化" : "仅桌面应用可用"} disabled={!native || busy}
              onClick={() => { void control("minimize"); }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.5h8" /></svg>
            </button>
            <button type="button" className="window-control window-close" aria-label="关闭到后台"
              title={native ? "关闭到后台；可通过托盘退出" : "仅桌面应用可用"} disabled={!native || busy}
              onClick={() => { void control("close"); }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7" /></svg>
            </button>
          </div>
        </header>
        {error && <div className="window-error" role="alert">{error}</div>}
        <div className="window-content">{children}</div>
      </div>
      {native && DIRECTIONS.map((direction) => (
        <div key={direction} className={`resize-handle resize-${direction}`} aria-hidden="true"
          onMouseDown={(event) => { void drag(event, direction); }} />
      ))}
    </div>
  );
}
````````

## NEW FILE E:\WorkMemo\src\MonitoringSettings.tsx

````````tsx
import { useEffect, useState, type FormEvent } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES, type MonitorConfig } from "./types";
import { UiDialog } from "./UiDialog";

export function MonitoringSettings({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open || !isTauri()) return;
    let stale = false;
    setConfig(null); setError(""); setNotice("");
    void invoke<MonitorConfig>("get_monitor_config").then(value => { if (!stale) setConfig(value); })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, retry]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!config || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await invoke<MonitorConfig>("save_monitor_config", { input: {
        enabled: config.enabled, expected_revision: config.revision,
        rules: config.rules.map(({ url_prefix, category }) => ({ url_prefix, category })),
      } });
      setConfig(saved); setNotice("配置已保存。请在 Chrome 扩展中同步工作站点授权。"); onSaved();
    } catch (failure: unknown) { setError(String(failure)); }
    finally { setBusy(false); }
  }
  return <UiDialog open={open} onClose={() => { if (!busy) onClose(); }} id="monitor-settings-title" title="自动工作监测">
    {!isTauri() && <p className="notice">请在 Windows 桌面程序中配置监测。</p>}
    {error && <p className="error-banner" role="alert">{error}</p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {!config && isTauri() && <button className="secondary" type="button" onClick={() => setRetry(value => value + 1)}>读取监测配置</button>}
    {config && <form className="monitor-settings" onSubmit={(event) => { void save(event); }}>
      <label className="monitor-toggle"><input type="checkbox" checked={config.enabled} disabled={busy}
        onChange={event => setConfig({ ...config, enabled: event.target.checked })} />启用工作页面自动识别</label>
      <p className="hint">浏览器前台工作页面匹配，并有新的输入活动时开始。仅打开页面不会开始。手动计时也受 5 分钟提醒、7 分钟结束保护。</p>
      {config.rules.map((rule, index) => <fieldset key={rule.id} className="monitor-rule">
        <legend>工作页面 {index + 1}</legend>
        <label>工作 URL<input type="url" required maxLength={2048} disabled={busy} value={rule.url_prefix}
          placeholder="https://工作站点/路径" onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, url_prefix: event.target.value } : item) })} /></label>
        <label>默认类别<select value={rule.category} disabled={busy} onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, category: event.target.value } : item) })}>
          {CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
        <button type="button" className="text-button" disabled={busy} onClick={() => setConfig({ ...config, rules: config.rules.filter((_, i) => i !== index) })}>移除这条配置</button>
      </fieldset>)}
      <button type="button" className="secondary" disabled={busy || config.rules.length >= 50} onClick={() => setConfig({ ...config, rules: [...config.rules, { id: -Date.now(), url_prefix: "", category: "评测" }] })}>添加工作 URL</button>
      <p className="hint">匹配精确站点及路径边界；查询参数和片段不参与匹配。配置变化会暂停当前自动记录，等待重新确认页面与输入。</p>
      <button type="submit" disabled={busy}>{busy ? "正在保存…" : "保存监测配置"}</button>
      <details><summary>连接与隐私说明</summary>
        <p className="hint">第一版配套 Chrome 扩展。安装扩展和本机通信主机后，在扩展面板同步已配置站点授权。只传规则标识、前台匹配状态和连接状态；不传 URL、网页内容或输入文本。连接断开时暂停自动累计。</p>
        <p className="hint">离开工作页面满 2 分钟暂停，再保留 10 分钟。空闲结束时扣除最后输入后的尾段，阅读或思考可能少计，可稍后人工修正。</p>
      </details>
    </form>}
  </UiDialog>;
}
````````

## NEW FILE E:\WorkMemo\src\NotificationApp.tsx

````````tsx
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SettlementForm } from "./SettlementPanel";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { formatDuration, type Snapshot, type WorkNotice, type SettleInput } from "./types";
import "./App.css";

export function NotificationApp() {
  const appearance = useAppearance();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let stopped = false; let reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      try { const value = await invoke<WorkNotice | null>("get_notice"); if (!stopped) setNotice(value); }
      catch (failure: unknown) { if (!stopped) setError(String(failure)); }
      finally { reading = false; }
    }
    void refresh(); const timer = window.setInterval(() => { void refresh(); }, 1000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, []);
  const key = notice ? `${notice.kind}:${notice.record.id}` : "";
  useEffect(() => { if (key) void appearance.reload(); }, [key]);
  async function later() {
    if (!notice || busy) return;
    setBusy(true); setError("");
    try { await invoke("defer_notice", { id: notice.record.id, kind: notice.kind }); setNotice(null); }
    catch (failure: unknown) { setError(String(failure)); }
    finally { setBusy(false); }
  }
  async function save(input: SettleInput) {
    if (busy) return false;
    setBusy(true); setError("");
    try {
      await invoke<Snapshot>("settle_record", { input });
      await invoke("defer_notice", { id: input.id, kind: "ended" });
      setNotice(null); return true;
    } catch (failure: unknown) { setError(String(failure)); return false; }
    finally { setBusy(false); }
  }
  return <div className="desktop-frame notice-frame" style={themeStyle(appearance.current)}><div className="app-shell">
    <header className="notice-titlebar"><span onMouseDown={event => { if (event.button === 0) void getCurrentWindow().startDragging().catch(() => {}); }}>WorkMemo 工作提醒</span>
      <button className="secondary" type="button" disabled={!notice || busy} onClick={() => { void later(); }}>稍后</button></header>
    <main className="notice-content">
      {error && <p className="error-banner" role="alert">{error}</p>}
      {notice?.kind === "idle" && <section aria-label="空闲提醒">
        <h1>已连续 5 分钟没有输入活动</h1>
        <p>到达 7 分钟时将结束本次计时，最后一次输入后的尾段不计入有效工时。恢复操作后会取消此提醒。</p>
        <p>当前暂计 {formatDuration(notice.record.duration_seconds)}</p>
        <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了，继续稍后处理</button>
      </section>}
      {notice?.kind === "ended" && <section aria-label="工作结束提醒">
        <h1>本次工作已结束，请填写工作量</h1>
        <p className="hint">结果已保存。稍后填写不会影响下一段工作。</p>
        <SettlementForm key={`${notice.record.id}:${notice.record.revision}`} record={notice.record} busy={busy} onSave={save} />
        <button type="button" className="secondary" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
      </section>}
      {!notice && <p role="status">提醒已处理，正在更新。</p>}
      <button type="button" className="text-button" onClick={() => { void invoke("show_main", { settlement: true }).catch(failure => setError(String(failure))); }}>打开 WorkMemo 待补全列表</button>
    </main>
  </div></div>;
}
````````

## UPDATE E:\WorkMemo\src\SettlementPanel.tsx

````````tsx
import { useEffect, useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CATEGORIES, formatDuration, formatTime, type SettleInput, type WorkRecord } from "./types";
import { validateWorkInput } from "./workInput";

export function SettlementForm({ record, busy, onSave }: {
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

## UPDATE E:\WorkMemo\src\main.tsx

````````tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NotificationApp } from "./NotificationApp";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).has("notice") ? <NotificationApp /> : <App />}
  </React.StrictMode>,
);
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
  control_mode: "AUTO" | "MANUAL";
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
  pending_count: number;
  monitoring: MonitorStatus;
}

export interface StartInput {
  category: string;
  quantity: number | null;
  remark: string;
}

export interface MonitorStatus {
  enabled: boolean;
  browser_connected: boolean;
  native_available: boolean;
  work_page: boolean;
  idle_warning: boolean;
  message: string;
  revision: number;
}
export interface WorkUrl { id: number; url_prefix: string; category: string }
export interface MonitorConfig { enabled: boolean; revision: number; rules: WorkUrl[] }
export interface WorkNotice { kind: "idle" | "ended"; record: WorkRecord }

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
    const unlisteners: UnlistenFn[] = [];
    void listen<string>("workmemo:storage-error", ({ payload }) => {
      if (!stopped) setCommandError(`操作未完成：${payload}`);
    }).then((unsubscribe) => {
      if (stopped) unsubscribe(); else unlisteners.push(unsubscribe);
    }).catch((error: unknown) => {
      if (!stopped) setCommandError(`无法接收保存错误通知：${String(error)}`);
    });
    void listen<string>("workmemo:runtime-error", ({ payload }) => {
      if (!stopped) setCommandError(payload);
    }).then(unsubscribe => { if (stopped) unsubscribe(); else unlisteners.push(unsubscribe); })
      .catch((error: unknown) => { if (!stopped) setCommandError(`无法接收计时服务通知：${String(error)}`); });
    void listen<string>("workmemo:runtime-recovered", ({ payload }) => {
      if (!stopped) setCommandError(current => current === payload ? "" : current);
    }).then(unsubscribe => { if (stopped) unsubscribe(); else unlisteners.push(unsubscribe); })
      .catch((error: unknown) => { if (!stopped) setCommandError(`无法接收恢复通知：${String(error)}`); });
    return () => {
      stopped = true;
      mounted.current = false;
      revision.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      unlisteners.forEach(unsubscribe => unsubscribe());
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
    paused: record?.pause_reason === "AWAY" ? "离页自动暂停" : record?.pause_reason === "MONITOR" ? "监测暂停" : "已暂停",
    working: record?.control_mode === "AUTO" ? "自动记录中" : "进行中", finished: finished?.settlement_status === "PENDING" ? "计时已保存，待补全" : "已完成并保存", ready: "准备开始" };
  const captions = { preview: "请在桌面应用中开始工作", loading: "正在读取本地工作记录",
    unavailable: record ? "上次读取的时长，暂未更新" : "连接本地数据后显示时长",
    paused: "暂停期间不计时", working: "暂计工时；空闲结束会扣除最后输入后的尾段",
    finished: "本次有效工作时长", ready: "选择类别即可开始，工作量稍后填写" };
  return {
    mode, record, finished, label: labels[mode], caption: captions[mode],
    timer: record ? formatDuration(record.duration_seconds) : mode === "ready" ? "00:00:00" : "--:--:--",
    canOperate: mode === "ready" || mode === "working" || mode === "paused" || mode === "finished",
  };
}
````````

## NEW FILE E:\WorkMemo\tests\browser-extension.test.mjs

````````javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { matchRule, permissionOrigins } from '../browser-extension/matching.js';
const rules = [{ id: 1, url_prefix: 'https://work.example.test/tasks', category: '评测' },
  { id: 2, url_prefix: 'https://work.example.test/tasks/review', category: '质检' }];
test('工作页面匹配限定精确来源及路径边界，忽略查询和片段', () => {
  assert.equal(matchRule('https://work.example.test/tasks/12?secret=never-sent#x', rules), 1);
  assert.equal(matchRule('https://work.example.test/tasks/review/12', rules), 2);
  for (const url of ['https://work.example.test/taskship', 'http://work.example.test/tasks',
    'https://work.example.test.evil.test/tasks', 'https://other.example.test/tasks', 'file:///tasks', undefined]) {
    assert.equal(matchRule(url, rules), null);
  }
  assert.deepEqual(permissionOrigins(rules), ['https://work.example.test/*']);
  const local = [{ id: 3, url_prefix: 'http://127.0.0.1:1431/work', category: '开发' }];
  assert.equal(matchRule('http://127.0.0.1:1431/work?ignored=1', local), 3);
  assert.equal(matchRule('http://127.0.0.1:1432/work', local), null);
  assert.deepEqual(permissionOrigins(local), ['http://127.0.0.1:1431/*']);
});
test('扩展固定公开标识、最小权限和原生主机来源一致', () => {
  const manifest = JSON.parse(readFileSync(new URL('../browser-extension/manifest.json', import.meta.url), 'utf8'));
  const id = [...createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest().subarray(0,16)]
    .map(n => String.fromCharCode(97 + (n >> 4), 97 + (n & 15))).join('');
  const protocol = readFileSync(new URL('../src-tauri/src/browser_protocol.rs', import.meta.url), 'utf8');
  assert.ok(protocol.includes(`chrome-extension://${id}/`));
  assert.deepEqual(manifest.permissions, ['nativeMessaging', 'alarms']);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.content_scripts, undefined);
});
````````
