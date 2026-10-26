# 第三阶段完整源码与配置

以下为本阶段全部变更源码、配置及开发说明的完整内容，没有截断。其余未修改的业务逻辑仍以实际项目文件为准。阶段报告和完整变更清单见 PHASE-3.md、PHASE-3-FILES.md。

## UPDATE — E:\WorkMemo\AGENTS.md

````
# WorkMemo 开发约束

- 开发前阅读 `docs/PRODUCT-SPEC.md`，这是用户提供的完整长期产品规范。
- 固定技术栈：Tauri 2、React、TypeScript、Vite、Rust、SQLite；保持轻量依赖。
- 优先级：数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
- 先检查实际文件、实现与启动状态，再制定最小改动；不覆盖可靠的已有功能。
- 按阶段开发，每阶段结束后总结并等待用户确认，不自动跨入下一阶段。
- 用户已确认进入第三阶段：原生透明窗口、无边框标题栏、拖动与基础窗口操作。完成后等待确认，不自动进入四种皮肤与透明度设置阶段。
- 不使用虚构记录、统计数据或装饰性按钮，不把未完成的功能包装为可用功能。
- Rust 校验并持久化业务数据，使用 SQLite；外观设置与工作记录分开管理。
- 同时只能有一个活动任务；暂停不计时；重启必须处理未完成任务。
- 计时不能只靠前端逐秒累加，必须基于真实时间和状态。
- 原生透明与 Glass / Cream / Dark / Neon 四种皮肤是必需功能，CSS 透明不能代替原生验证。
- 权限仅授予当前功能确实需要的范围。
- 只有实际执行过的启动、构建和测试才能报告为通过。
- 中文交付包含目标、检查结果、完整路径及 NEW FILE / UPDATE、完整代码、PowerShell 命令、测试方法与预期、兼容性和 Git 命令。
- 完整代码保存在项目文件中，较长交付另提供完整源码清单，不能用省略号代替代码。
- 当前阶段进度见 `docs/PHASE-3.md`，已有阶段记录保留在 docs 中，启动方式见 `README.md`。

## GitHub 同步约定

- 用户已授权：每个明确完成的开发步骤或阶段，在完成适当检查并记录结果后，创建 Git 提交并推送到 `origin`；不需要重复询问是否推送。
- 本项目仓库为 `https://github.com/noharass/WorkMemo`，默认分支 `main`。修改远程地址、公开范围或进行破坏性操作需要新的明确授权。
- 提交身份只在当前仓库设置，使用用户提供的身份；不修改全局 Git 身份。
- 推送前检查暂存区，不提交依赖目录、构建产物、本地工作数据库、凭据或环境私密配置。
- 验收受限或未通过的项目必须如实记录。保存当前开发进度不代表相关功能已经验收通过。
- 不强制推送。远程有新提交时，先检查并安全整合，不能覆盖远程历史。
- 推送后比较本地提交和远程分支的提交标识，并检查工作区状态，确认同步结果。
- 认证、网络或冲突导致推送失败时，保留本地提交并明确报告，不声称已同步，也不将凭据写入文件或远程 URL。

````

## UPDATE — E:\WorkMemo\README.md

````
# WorkMemo

个人本地工作留痕、任务计时和工作量统计 Windows 桌面工具。

当前处于第三阶段：在 SQLite 工作记录与可靠计时基础上，接入原生透明窗口、无边框标题栏、拖动区、边缘缩放、最小化和保存关闭。支持开始、暂停、继续、结束、暂停后切换任务，以及未结束任务恢复为暂停。界面显示最近 5 条真实完成记录，并保留基础连接检查。
四种皮肤、透明度设置、完整历史查询/删除与统计尚未实现。

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
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
构建不生成安装包；正式安装包在后续阶段验收。各项实际验证结果见 docs/PHASE-3.md。

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
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
- docs/PHASE-3.md：原生透明、窗口操作与实际验收记录。
- AGENTS.md：后续开发约束。
- package-lock.json / src-tauri/Cargo.lock：锁定前后端依赖。

开发顺序：可靠持久化与计时 → 原生透明 → 主题 → 主界面 → 历史统计 → 综合验收。
每阶段结束后等待用户确认。

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
透明度目前是固定默认值，四种皮肤和透明度调节属于下一阶段。浏览器预览不能验证桌面透明效果。

````

## UPDATE — E:\WorkMemo\index.html

````
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WorkMemo</title>
    <style>html, body, #root { margin: 0; background: transparent; }</style>
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

````

## NEW FILE — E:\WorkMemo\src\DesktopWindow.tsx

````
import { useState, type MouseEvent, type ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

const DIRECTIONS = [
  "North", "NorthEast", "East", "SouthEast", "South", "SouthWest", "West", "NorthWest",
] as const;
type ResizeDirection = (typeof DIRECTIONS)[number];

/** Window controls stay outside the drag area; closing uses the save-on-close path. */
export function DesktopWindow({ children }: { children: ReactNode }) {
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
    <div className="desktop-frame">
      <div className="app-shell">
        <header className="titlebar">
          <div className="titlebar-drag" title={native ? "按住这里移动窗口" : "请在桌面应用中移动窗口"}
            onMouseDown={(event) => { void drag(event); }}>
            <span className="brand-mark" aria-hidden="true">w.</span>
            <div>
              <span className="brand-name">WorkMemo</span>
              <span className="brand-caption">留住每一份投入</span>
            </div>
            <span className="drag-grip" aria-hidden="true">⠿</span>
          </div>
          <div className="window-controls" aria-label="窗口操作">
            <button type="button" className="window-control" aria-label="最小化窗口"
              title={native ? "最小化" : "仅桌面应用可用"} disabled={!native || busy}
              onClick={() => { void control("minimize"); }}>
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 8.5h8" /></svg>
            </button>
            <button type="button" className="window-control window-close" aria-label="保存并关闭窗口"
              title={native ? "保存并关闭" : "仅桌面应用可用"} disabled={!native || busy}
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

````

## UPDATE — E:\WorkMemo\src\App.tsx

````
import { ConnectionPanel } from "./ConnectionPanel";
import { DesktopWindow } from "./DesktopWindow";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatDuration, formatTime } from "./types";
import "./App.css";

function App() {
  const session = useWorkSession();
  const active = session.snapshot?.active;
  const unavailable = !session.native || session.loading || session.busy
    || Boolean(session.connectionError) || !session.snapshot;

  return (
    <DesktopWindow>
    <main className="workspace">
      <div className="workspace-toolbar">
        <span className="eyebrow">工作手记</span>
        <button className="text-button" type="button" disabled={!session.native || session.busy}
          onClick={() => { void session.refresh(); }}>刷新记录</button>
      </div>

      {!session.native && <p className="notice" role="status">浏览器预览模式。请打开桌面应用，使用本地计时和保存功能。</p>}
      {session.loading && <p className="hint" role="status">正在读取本地工作记录…</p>}
      {session.connectionError && <div className="error-banner" role="alert">
        <strong>无法读取或保存本地数据</strong>
        <p>{session.connectionError}</p>
        <p>显示为上次读取的状态，操作暂不可用。可先尝试刷新；若已打开另一个 WorkMemo，请使用原窗口。仍无法恢复时请重新打开应用。</p>
      </div>}
      {session.commandError && <p className="error-banner" role="alert">{session.commandError}</p>}
      {session.snapshot?.warning && <p className="notice" role="alert">{session.snapshot.warning}</p>}
      {active?.recovery_pending && <p className="notice" role="status">
        已恢复上次未结束的任务，并保持暂停。应用关闭期间不计时，请确认后继续。
      </p>}

      <section className="timer-card" aria-label="当前工作">
        <div className="card-heading">
          <span className="eyebrow">{active ? active.category : "为今天留下一笔"}</span>
          <span className={`state-label ${active && !active.is_paused ? "working" : ""}`}>
            {active ? (active.is_paused ? "已暂停" : "进行中") : "准备开始"}
          </span>
        </div>
        <output className="timer" aria-label="有效工作时长">
          {formatDuration(active?.duration_seconds ?? 0)}
        </output>
        <p className="timer-caption">
          {session.connectionError ? "连接中断，时长暂未更新" : active?.is_paused ? "暂停期间不计时" : "有效工作时长"}
        </p>
        {active && <>
          <div className="task-meta"><span>工作数量</span><strong>{active.quantity}</strong></div>
          {active.remark && <p className="task-remark">{active.remark}</p>}
          <p className="hint">开始于 {formatTime(active.start_time)}</p>
          <div className="actions">
            <button type="button" disabled={unavailable}
              onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}>
              {active.is_paused ? "继续工作" : "暂停"}
            </button>
            <button className="secondary" type="button" disabled={unavailable}
              onClick={() => { void session.finish(active.id); }}>结束并保存</button>
          </div>
        </>}
      </section>

      {!active && <section className="form-card" aria-label="开始新的工作">
        <h1>工作，从一次专注开始。</h1>
        <WorkForm disabled={unavailable} onStart={session.start} />
      </section>}
      {active?.is_paused && <details className="switch-panel">
        <summary>开始另一项工作</summary>
        <WorkForm disabled={unavailable} switching onStart={session.start} />
      </details>}

      <details className="recent-panel">
        <summary>最近保存的记录</summary>
        {session.snapshot?.recent_records.length ? <ul className="record-list">
          {session.snapshot.recent_records.map((record) => <li key={record.id}>
            <div className="record-heading"><strong>{record.category} · {record.quantity}</strong>
              <span>{formatDuration(record.duration_seconds)}</span></div>
            <p className="hint">{formatTime(record.start_time)}<br />至 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
            {record.remark && <p className="record-remark">{record.remark}</p>}
          </li>)}
        </ul> : <p className="hint">{session.snapshot ? "还没有已完成的记录。完成后会保存在这台电脑上。" : "连接本地数据后可查看真实记录。"}</p>}
        <p className="hint">此处显示最近 5 条，完整历史查询将在后续阶段加入。</p>
      </details>
      <ConnectionPanel />
      <footer>本地保存 · 让每一份投入都有迹可循</footer>
    </main>
    </DesktopWindow>
  );
}

export default App;

````

## UPDATE — E:\WorkMemo\src\App.css

````
:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --text-muted: #62695f;
  --accent: #3b6551;
  --line: #dedfd5;
  --panel: rgb(255 253 248 / 94%);
  --error: #9b4034;
  --window-background: rgb(245 243 238 / 88%);
  --window-border: rgb(255 255 255 / 78%);
  --window-radius: 20px;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: var(--window-background); box-shadow: 0 2px 6px rgb(25 39 30 / 18%); }
.titlebar { display: flex; align-items: center; gap: 6px; flex-shrink: 0; min-height: 60px; padding: 8px 10px 8px 14px; border-bottom: 1px solid rgb(120 135 117 / 14%); background: rgb(255 255 255 / 15%); user-select: none; }
.titlebar-drag { display: flex; flex: 1; align-items: center; gap: 10px; min-width: 0; min-height: 40px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border-radius: 10px; background: var(--accent); color: #fff; font: 600 24px Georgia, serif; padding-bottom: 5px; }
.brand-name { display: block; font-size: 15px; font-weight: 650; letter-spacing: -.3px; }
.brand-caption { display: block; margin-top: 3px; font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }
.drag-grip { margin-left: auto; color: rgb(88 105 85 / 45%); padding: 0 5px; font-size: 18px; }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; }
.window-content { min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: rgb(95 112 91 / 36%) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: rgb(95 112 91 / 36%); }
.workspace { max-width: 520px; margin: 0 auto; padding: 20px; }
.workspace-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 17px; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: 8px; background: #f6e7e2; color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
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
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--accent); color: #fff; border: 1px solid transparent; border-radius: 9px; font-size: 12px; cursor: pointer; transition: background .15s; }
button:hover:not(:disabled) { background: #2c513e; }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent); border-color: var(--line); justify-content: center; }
button.secondary:hover:not(:disabled) { background: #eeeee5; }
button.text-button { width: auto; margin-left: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 30px; height: 30px; padding: 6px; justify-content: center; border-radius: 8px; background: transparent; color: var(--text-muted); }
button.window-control:hover:not(:disabled) { background: rgb(70 90 65 / 10%); }
button.window-close:hover:not(:disabled) { color: #fff; background: #a94f43; }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { padding: 21px; border: 1px solid var(--line); border-radius: 18px; background: var(--panel); box-shadow: 0 6px 24px #303b3505; }
.card-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.eyebrow { font-size: 11px; color: var(--accent); letter-spacing: 1px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; margin: 18px 0 4px; text-align: center; font-size: clamp(33px, 10vw, 45px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -1px; line-height: 1.4; overflow-wrap: anywhere; }
.timer-caption { font-size: 10px; color: var(--text-muted); text-align: center; margin: 0 0 16px; }
.task-meta { display: flex; align-items: center; justify-content: space-between; font-size: 11px; padding-top: 15px; border-top: 1px solid var(--line); }
.task-meta span { color: var(--text-muted); }
.task-meta strong { font-size: 14px; font-weight: 600; }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 100px; overflow-y: auto; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 15px; }
.actions button { justify-content: center; }
.form-card { margin-top: 22px; }
h1 { font-size: 16px; font-weight: 550; margin: 0 0 17px; }
.work-form { display: grid; gap: 14px; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 7px; padding: 10px 11px; min-width: 0; border: 1px solid var(--line); border-radius: 8px; color: inherit; background: var(--panel); font-size: 12px; }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 65px; max-height: 200px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: 10px; padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: #675526; background: #ece5d4; border: 1px solid #dcd0b4; }
.error-banner { color: var(--error); background: #f6e7e2; border: 1px solid #e5c8c0; }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.switch-panel, .recent-panel, .connection-panel { border-top: 1px solid var(--line); margin-top: 22px; padding-top: 14px; font-size: 11px; }
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
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
footer { margin-top: 22px; color: var(--text-muted); font-size: 9px; text-align: center; line-height: 1.8; }
@media (max-width: 380px) { .workspace { padding: 17px; } .timer-card { padding: 17px; } .drag-grip { display: none; } }
@media (prefers-reduced-motion: reduce) { button { transition: none; } }

````

## UPDATE — E:\WorkMemo\src-tauri\tauri.conf.json

````
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "WorkMemo",
  "version": "0.1.0",
  "identifier": "com.workmemo.desktop",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "WorkMemo",
        "width": 440,
        "height": 620,
        "minWidth": 360,
        "minHeight": 500,
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
      "csp": "default-src 'self'; connect-src ipc: http://ipc.localhost http://localhost:1420 ws://localhost:1420; img-src 'self' data:; style-src 'self' 'unsafe-inline'"
    }
  },
  "bundle": {
    "active": true,
    "targets": "all",
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

## UPDATE — E:\WorkMemo\src-tauri\capabilities\default.json

````
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Main window; storage errors, custom titlebar and resize handles",
  "windows": ["main"],
  "permissions": [
    "core:event:allow-listen",
    "core:event:allow-unlisten",
    "core:window:allow-minimize",
    "core:window:allow-close",
    "core:window:allow-start-dragging",
    "core:window:allow-start-resize-dragging"
  ]
}

````
