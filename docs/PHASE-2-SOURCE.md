# 第二阶段完整源码与配置

以下是本阶段全部变更源码、配置与开发说明的完整文件内容，没有截断。完整依赖锁文件见 E:\WorkMemo\src-tauri\Cargo.lock；阶段报告和文件清单分别见 PHASE-2.md、PHASE-2-FILES.md。

## UPDATE — E:\WorkMemo\AGENTS.md

````
# WorkMemo 开发约束

- 开发前阅读 `docs/PRODUCT-SPEC.md`，这是用户提供的完整长期产品规范。
- 固定技术栈：Tauri 2、React、TypeScript、Vite、Rust、SQLite；保持轻量依赖。
- 优先级：数据可靠性 > 业务逻辑正确性 > 核心功能完整性 > 界面可用性 > 视觉精致度。
- 先检查实际文件、实现与启动状态，再制定最小改动；不覆盖可靠的已有功能。
- 按阶段开发，每阶段结束后总结并等待用户确认，不自动跨入下一阶段。
- 用户已确认进入第二阶段：SQLite 持久化、任务状态机、可靠计时与恢复。完成后等待确认，不自动进入透明窗口阶段。
- 不使用虚构记录、统计数据或装饰性按钮，不把未完成的功能包装为可用功能。
- Rust 校验并持久化业务数据，后续使用 SQLite；外观设置与工作记录分开管理。
- 同时只能有一个活动任务；暂停不计时；重启必须处理未完成任务。
- 计时不能只靠前端逐秒累加，必须基于真实时间和状态。
- 原生透明与 Glass / Cream / Dark / Neon 四种皮肤是必需功能，CSS 透明不能代替原生验证。
- 权限仅授予当前功能确实需要的范围。
- 只有实际执行过的启动、构建和测试才能报告为通过。
- 中文交付包含目标、检查结果、完整路径及 NEW FILE / UPDATE、完整代码、PowerShell 命令、测试方法与预期、兼容性和 Git 命令。
- 完整代码保存在项目文件中，较长交付另提供完整源码清单，不能用省略号代替代码。
- 当前阶段进度见 `docs/PHASE-2.md`，第一阶段记录见 `docs/PHASE-1.md`，启动方式见 `README.md`。

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

当前处于第二阶段：SQLite 工作记录与可靠计时。支持开始、暂停、继续、结束、暂停后切换任务，以及未结束任务恢复为暂停。界面显示最近 5 条真实完成记录，并保留基础连接检查。
原生透明、四种皮肤、完整历史查询/删除与统计尚未实现。

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
保留系统标题栏。窗口移动、缩放与完整鼠标流程尚待人工验收，不能以编译通过代替交互验收。

```powershell
npm run build
cargo test --locked --manifest-path .\src-tauri\Cargo.toml
cargo fmt --manifest-path .\src-tauri\Cargo.toml -- --check
npm run tauri build -- --no-bundle
```

Release 可执行文件：E:\WorkMemo\src-tauri\target\release\workmemo.exe。
构建不生成安装包；正式安装包在后续阶段验收。各项实际验证结果见 docs/PHASE-2.md。

`npm run dev` 仅为浏览器预览，不能证明原生能力，页面会明确提示预览模式。

## 文件关系

- src/：React 界面、表单、任务接口与轮询逻辑，不保存业务数据。
- src-tauri/src/database.rs：任务状态机、SQLite 校验与事务。
- src-tauri/src/clock.rs：单调时钟与实际日期时间。
- src-tauri/src/service.rs：Tauri 命令、后台检查点与关闭保存。
- src-tauri/migrations/：按 user_version 管理的数据库结构。
- src-tauri/tauri.conf.json：窗口、构建、安全配置。
- src-tauri/capabilities/：仅开放接收保存错误通知所需的事件订阅权限，不向界面开放文件系统或 SQL。
- docs/PRODUCT-SPEC.md：用户提供的完整产品规范。
- docs/PHASE-1.md：交付、文件清单与实际验收记录。
- docs/PHASE-2.md：第二阶段设计、完整文件清单、测试与兼容性说明。
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

````

## NEW FILE — E:\WorkMemo\src\types.ts

````
export const CATEGORIES = ["评测", "质检", "开发", "文档"] as const;

export interface WorkRecord {
  id: number;
  category: string;
  quantity: number;
  remark: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  duration_ms: number;
  status: "NOT_STARTED" | "WORKING" | "FINISHED";
  is_paused: boolean;
  recovery_pending: boolean;
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
}

export interface StartInput {
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

````

## NEW FILE — E:\WorkMemo\src\useWorkSession.ts

````
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { Snapshot, StartInput } from "./types";

export function useWorkSession() {
  const native = isTauri();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(native);
  const [busy, setBusy] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [commandError, setCommandError] = useState("");
  const mounted = useRef(false);
  const busyRef = useRef(false);
  const polling = useRef(false);
  const revision = useRef(0);

  const refresh = useCallback(async () => {
    if (!native || busyRef.current || polling.current) return;
    polling.current = true;
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>("get_snapshot");
      if (mounted.current && request === revision.current) {
        setSnapshot(data);
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

  const run = useCallback(async (command: string, args: Record<string, unknown>) => {
    if (!native || busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setCommandError("");
    const request = ++revision.current;
    try {
      const data = await invoke<Snapshot>(command, args);
      if (mounted.current && request === revision.current) {
        setSnapshot(data);
        setConnectionError("");
      }
      return true;
    } catch (error: unknown) {
      if (mounted.current) setCommandError(String(error));
      return false;
    } finally {
      busyRef.current = false;
      if (mounted.current) { setBusy(false); setLoading(false); }
    }
  }, [native]);

  return {
    native, snapshot, loading, busy, connectionError, commandError, refresh,
    start: (input: StartInput) => run("start_task", { input }),
    pause: (id: number) => run("pause_task", { id }),
    resume: (id: number) => run("resume_task", { id }),
    finish: (id: number) => run("finish_task", { id }),
  };
}

````

## NEW FILE — E:\WorkMemo\src\WorkForm.tsx

````
import { useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";

interface Props {
  disabled: boolean;
  switching?: boolean;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({ disabled, switching = false, onStart }: Props) {
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    if (!CATEGORIES.some((value) => value === category)) { setError("请选择工作类别。"); return; }
    const amount = Number(quantity);
    if (!quantity.trim() || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
      setError("数量必须大于 0，且不超过 10 亿。"); return;
    }
    if (Array.from(remark.trim()).length > 2000) { setError("备注不能超过 2000 个字符。"); return; }
    setError("");
    await onStart({ category, quantity: amount, remark });
  }

  return (
    <form className="work-form" onSubmit={(event) => { void submit(event); }} noValidate>
      <div className="field-row">
        <label>工作类别
          <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={disabled}>
            <option value="">请选择类别</option>
            {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>工作数量
          <input type="number" inputMode="decimal" min="0" max="1000000000" step="any"
            placeholder="大于 0" value={quantity} disabled={disabled}
            onChange={(event) => setQuantity(event.target.value)} />
        </label>
      </div>
      <label>备注 <span className="optional">选填</span>
        <textarea rows={2} maxLength={4000} placeholder="记下这次工作的内容…" value={remark}
          disabled={disabled} onChange={(event) => setRemark(event.target.value)} />
      </label>
      {switching && <p className="hint">开始后将结束并保存当前已暂停的任务。</p>}
      {error && <p className="inline-error" role="alert">{error}</p>}
      <button type="submit" disabled={disabled}>{switching ? "保存上一项，开始新工作" : "开始工作"}<span aria-hidden="true">↗</span></button>
    </form>
  );
}

````

## NEW FILE — E:\WorkMemo\src\ConnectionPanel.tsx

````
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";

interface AppInfo { name: string; version: string }
type Connection =
  | { status: "checking" }
  | { status: "ready"; info: AppInfo }
  | { status: "error"; message: string }
  | { status: "browser" };

export function ConnectionPanel() {
  const [connection, setConnection] = useState<Connection>({ status: "checking" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (!isTauri()) { setConnection({ status: "browser" }); return; }
    setConnection({ status: "checking" });
    void invoke<AppInfo>("app_info").then((info) => {
      if (!cancelled) setConnection({ status: "ready", info });
    }).catch((error: unknown) => {
      if (!cancelled) setConnection({ status: "error", message: String(error) });
    });
    return () => { cancelled = true; };
  }, [attempt]);
  const status = {
    checking: "正在检查桌面连接", ready: "桌面连接正常",
    error: "桌面连接失败", browser: "浏览器预览模式",
  }[connection.status];
  return <details className="connection-panel">
    <summary>基础连接检查</summary>
    <p role="status">{status}</p>
    {connection.status === "ready" && <p className="hint">{connection.info.name} {connection.info.version} · 本地 Rust 服务</p>}
    {connection.status === "error" && <pre className="inline-error">{connection.message}</pre>}
    <button className="secondary" type="button" onClick={() => setAttempt((value) => value + 1)}
      disabled={connection.status === "checking"}>重新检查</button>
  </details>;
}

````

## UPDATE — E:\WorkMemo\src\App.tsx

````
import { ConnectionPanel } from "./ConnectionPanel";
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
    <main className="workspace">
      <header className="brand">
        <span className="brand-mark" aria-hidden="true">w.</span>
        <div>
          <span className="brand-name">WorkMemo</span>
          <span className="brand-caption">留住每一份投入</span>
        </div>
        <button className="text-button" type="button" disabled={!session.native || session.busy}
          onClick={() => { void session.refresh(); }}>刷新记录</button>
      </header>

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
  );
}

export default App;

````

## UPDATE — E:\WorkMemo\src\App.css

````
:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: #f5f3ee;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  --text-muted: #71766f;
  --accent: #3b6551;
  --line: #dedfd5;
  --panel: #fffdf8;
  --error: #9b4034;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.workspace { max-width: 520px; margin: 0 auto; padding: 24px; }
.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.brand-mark { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; background: var(--accent); color: #fff; font: 600 25px Georgia, serif; padding-bottom: 5px; }
.brand-name { display: block; font-size: 15px; font-weight: 650; letter-spacing: -.3px; }
.brand-caption { display: block; margin-top: 3px; font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--accent); color: #fff; border: 1px solid transparent; border-radius: 9px; font-size: 12px; cursor: pointer; transition: background .15s; }
button:hover:not(:disabled) { background: #2c513e; }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent); border-color: var(--line); justify-content: center; }
button.secondary:hover:not(:disabled) { background: #eeeee5; }
button.text-button { width: auto; margin-left: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
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
@media (max-width: 380px) { .workspace { padding: 20px; } .timer-card { padding: 17px; } }
@media (prefers-reduced-motion: reduce) { button { transition: none; } }

````

## UPDATE — E:\WorkMemo\src-tauri\Cargo.toml

````
[package]
name = "workmemo"
version = "0.1.0"
description = "Local personal work journal and focus timer"
edition = "2024"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[lib]
# The `_lib` suffix may seem redundant but it is necessary
# to make the lib name unique and wouldn't conflict with the bin name.
# This seems to be only an issue on Windows, see https://github.com/rust-lang/cargo/issues/8519
name = "workmemo_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
rusqlite = { version = "0.41", features = ["bundled"] }


# Read the optimization guideline for more details: https://tauri.app/concept/size/#cargo-configuration
[profile.release]
codegen-units = 1
lto = true
opt-level = 3
panic = "abort"
strip = true

````

## UPDATE — E:\WorkMemo\src-tauri\capabilities\default.json

````
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Main window; local Rust commands and storage-error event subscription",
  "windows": ["main"],
  "permissions": ["core:event:allow-listen", "core:event:allow-unlisten"]
}

````

## UPDATE — E:\WorkMemo\src-tauri\src\lib.rs

````
use serde::Serialize;
use tauri::{Emitter, Manager};

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
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
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

````

## NEW FILE — E:\WorkMemo\src-tauri\src\clock.rs

````
use std::time::{Instant, SystemTime, UNIX_EPOCH};

#[derive(Clone, Copy)]
pub struct TimePoint {
    pub wall_ms: i64,
    pub ticks_ms: i64,
}

pub trait Clock: Send {
    fn now(&self) -> TimePoint;
}

pub struct SystemClock {
    origin: Instant,
}

impl SystemClock {
    pub fn new() -> Self {
        Self {
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
            ticks_ms: self.origin.elapsed().as_millis().min(i64::MAX as u128) as i64,
        }
    }
}

````

## NEW FILE — E:\WorkMemo\src-tauri\src\database.rs

````
use crate::clock::{Clock, TimePoint};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use std::{fs::File, path::Path, time::Duration};

pub type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Debug, Serialize)]
pub struct WorkRecord {
    pub id: i64,
    pub category: String,
    pub quantity: f64,
    pub remark: String,
    /// Unix milliseconds; durations use the independent monotonic clock.
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub duration_seconds: i64,
    pub duration_ms: i64,
    pub status: String,
    pub is_paused: bool,
    pub recovery_pending: bool,
}

#[derive(Debug, Deserialize)]
pub struct StartInput {
    pub category: String,
    pub quantity: f64,
    pub remark: String,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub active: Option<WorkRecord>,
    pub recent_records: Vec<WorkRecord>,
    pub warning: Option<String>,
}

struct Segment {
    id: i64,
    base_ms: i64,
    started_ticks: i64,
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
    duration_seconds, duration_ms, status, is_paused, recovery_pending";

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
            .execute_batch("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;")
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
                tx.pragma_update(None, "user_version", 1)
                    .map_err(db_error)?;
            }
            1 => {}
            _ => return Err("数据库来自较新版本，请使用较新版本的 WorkMemo；未修改数据。".into()),
        }
        // Never infer work while the application was closed from wall-clock time.
        tx.execute(
            "UPDATE work_records SET is_paused=1, recovery_pending=1 WHERE status='WORKING'",
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
        let duration = self.elapsed(&record, self.clock.now())?;
        let changed = self.connection.execute(
            "UPDATE work_records SET duration_ms=?1, duration_seconds=?2 WHERE id=?3 AND status='WORKING' AND is_paused=0",
            params![duration, duration / 1000, record.id],
        ).map_err(db_error)?;
        if changed != 1 {
            return Err("计时保存失败，任务状态已变更。".into());
        }
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
        })
    }

    pub fn start(&mut self, input: StartInput) -> Result<()> {
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if !input.quantity.is_finite() || input.quantity <= 0.0 || input.quantity > 1_000_000_000.0
        {
            return Err("数量必须大于 0，且不超过 10 亿。".into());
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
            tx.execute("UPDATE work_records SET status='FINISHED', end_time=?1, recovery_pending=0 WHERE id=?2",
                params![now.wall_ms.max(previous.start_time), previous.id]).map_err(db_error)?;
        }
        tx.execute("INSERT INTO work_records(category, quantity, remark, start_time, status, is_paused) VALUES(?1,?2,?3,?4,'WORKING',0)",
            params![input.category, input.quantity, remark, now.wall_ms]).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            base_ms: 0,
            started_ticks: now.ticks_ms,
        });
        self.warning = None;
        Ok(())
    }

    pub fn pause(&mut self, id: i64) -> Result<()> {
        let record = self.current(id)?;
        if record.is_paused {
            return Ok(());
        }
        let duration = self.elapsed(&record, self.clock.now())?;
        self.connection.execute("UPDATE work_records SET is_paused=1, duration_ms=?1, duration_seconds=?2 WHERE id=?3",
            params![duration, duration / 1000, id]).map_err(db_error)?;
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
        self.connection
            .execute(
                "UPDATE work_records SET is_paused=0, recovery_pending=0 WHERE id=?1",
                [id],
            )
            .map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            base_ms: record.duration_ms,
            started_ticks: now.ticks_ms,
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
        self.connection
            .execute(
                "UPDATE work_records SET status='FINISHED', is_paused=1, recovery_pending=0,
            duration_ms=?1, duration_seconds=?2, end_time=?3 WHERE id=?4",
                params![
                    duration,
                    duration / 1000,
                    now.wall_ms.max(record.start_time),
                    id
                ],
            )
            .map_err(db_error)?;
        self.segment = None;
        self.warning = None;
        Ok(())
    }

    pub fn pause_for_close(&mut self) -> Result<()> {
        if let Some(record) = self.active()? {
            self.pause(record.id)?;
        }
        Ok(())
    }
}

#[cfg(test)]
#[path = "database_tests.rs"]
mod tests;

````

## NEW FILE — E:\WorkMemo\src-tauri\src\database_tests.rs

````
use super::*;
use std::{
    path::PathBuf,
    sync::{Arc, Mutex},
};

#[derive(Clone)]
struct TestClock(Arc<Mutex<TimePoint>>);

impl TestClock {
    fn new() -> Self {
        Self(Arc::new(Mutex::new(TimePoint {
            wall_ms: 1_000_000,
            ticks_ms: 0,
        })))
    }
    fn advance(&self, ms: i64) {
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
        quantity: 2.5,
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

struct TestDirectory(PathBuf);
impl TestDirectory {
    fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir =
            std::env::temp_dir().join(format!("workmemo-test-{}-{nonce}", std::process::id()));
        std::fs::create_dir(&dir).unwrap();
        Self(dir)
    }
    fn db(&self) -> PathBuf {
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
    for quantity in [0.0, -1.0, f64::NAN, f64::INFINITY, 1_000_000_001.0] {
        let mut value = input();
        value.quantity = quantity;
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
    assert_eq!(saved.quantity, 2.5);
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
    invalid.quantity = 0.0;
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

````

## NEW FILE — E:\WorkMemo\src-tauri\src\service.rs

````
use crate::{
    clock::SystemClock,
    database::{Result, Snapshot, StartInput, Store},
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

async fn execute(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<()> + Send + 'static,
) -> Result<Snapshot> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = shared
            .lock()
            .map_err(|_| "本地数据服务异常，请重新打开应用。")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        action(store)?;
        store.snapshot()
    })
    .await
    .map_err(|e| format!("数据操作未能完成：{e}"))?
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

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}

````

## NEW FILE — E:\WorkMemo\src-tauri\migrations\001_initial.sql

````
CREATE TABLE work_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档')),
    quantity REAL NOT NULL CHECK(quantity > 0 AND quantity <= 1000000000),
    remark TEXT NOT NULL DEFAULT '' CHECK(length(remark) <= 2000),
    start_time INTEGER NOT NULL CHECK(start_time >= 0),
    end_time INTEGER,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms >= 0),
    status TEXT NOT NULL CHECK(status IN ('NOT_STARTED','WORKING','FINISHED')),
    is_paused INTEGER NOT NULL DEFAULT 1 CHECK(is_paused IN (0,1)),
    recovery_pending INTEGER NOT NULL DEFAULT 0 CHECK(recovery_pending IN (0,1)),
    CHECK(duration_seconds = duration_ms / 1000),
    CHECK((status='FINISHED' AND end_time IS NOT NULL AND end_time >= start_time AND is_paused=1)
       OR (status!='FINISHED' AND end_time IS NULL))
);
CREATE UNIQUE INDEX one_active_task ON work_records(status) WHERE status='WORKING';

````
