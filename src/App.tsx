import { useState } from "react";
import { ConnectionPanel } from "./ConnectionPanel";
import { DesktopWindow } from "./DesktopWindow";
import { AppearanceSettings } from "./AppearanceSettings";
import { useAppearance } from "./useAppearance";
import { THEMES, themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatDuration, formatTime } from "./types";
import { workView } from "./workView";
import { HistoryPanel } from "./HistoryPanel";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const [historyOpen, setHistoryOpen] = useState(false);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const unavailable = !view.canOperate || session.busy;

  return (
    <DesktopWindow appearanceStyle={themeStyle(appearance.current)}>
    <main className="workspace">
      <div className="workspace-toolbar">
        <span className="eyebrow">工作手记</span>
        <div className="toolbar-actions">
          <button className="text-button" type="button" disabled={appearance.loading}
            onClick={appearance.begin}>外观 · {THEMES[appearance.current.theme].name}</button>
          <button className="text-button" type="button" disabled={!session.native || session.busy}
            onClick={() => { void session.refresh(); }}>刷新记录</button>
        </div>
      </div>

      {appearance.notice && <p className="hint appearance-feedback" role="status">{appearance.notice}</p>}
      {appearance.loadError && <div className="notice" role="alert">
        <p>外观设置读取失败，暂时使用默认外观。工作记录不受影响。</p>
        <p className="appearance-error-detail">{appearance.loadError}</p>
        <button type="button" className="text-button" disabled={appearance.loading || appearance.open}
          onClick={() => { void appearance.reload(); }}>重新读取外观</button>
      </div>}

      {!session.native && <p className="notice" role="status">浏览器预览模式。请打开桌面应用，使用本地计时和保存功能。</p>}
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
        <div className="card-heading">
          <span className="eyebrow">{record ? record.category : "为今天留下一笔"}</span>
          <span className={`state-label ${view.mode === "working" ? "working" : ""}`} role="status">
            {view.label}
          </span>
        </div>
        <output className="timer" aria-label="有效工作时长" aria-live="off">
          {view.timer}
        </output>
        <p className="timer-caption">
          {view.caption}
        </p>
        {record && <>
          <div className="task-meta"><span>工作数量</span><strong>{record.quantity}</strong></div>
          {record.remark && <p className="task-remark">{record.remark}</p>}
          <p className="hint">开始于 {formatTime(record.start_time)}
            {record.end_time !== null && <><br />保存于 {formatTime(record.end_time)}</>}</p>
        </>}
        {view.mode === "finished" && <p className="saved-feedback">记录已保存在这台电脑上，可在下方查看，也可以开始下一项。</p>}
        {active && <>
          <div className="actions">
            <button type="button" disabled={unavailable}
              onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}>
              {session.pending === "resume_task" ? "正在继续…" : session.pending === "pause_task" ? "正在暂停…"
                : active.is_paused ? "继续工作" : "暂停"}
            </button>
            <button className="secondary" type="button" disabled={unavailable}
              onClick={() => { void session.finish(active.id); }}>{session.pending === "finish_task" ? "正在保存…" : "结束并保存"}</button>
          </div>
        </>}
      </section>

      {!active && (session.snapshot || !session.native) && <section className="form-card" aria-label="开始新的工作">
        <h1>{view.finished ? "下一份投入，从这里开始。" : "工作，从一次专注开始。"}</h1>
        <WorkForm disabled={unavailable} starting={session.pending === "start_task"} onStart={session.start} />
      </section>}
      {active?.is_paused && <details className="switch-panel">
        <summary>开始另一项工作</summary>
        <WorkForm disabled={unavailable} switching starting={session.pending === "start_task"} onStart={session.start} />
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
        <p className="hint">此处显示最近 5 条已完成记录。</p>
      </details>
      <button type="button" className="secondary history-entry" onClick={() => setHistoryOpen(true)}>查看历史与统计<span aria-hidden="true">↗</span></button>
      <ConnectionPanel />
      <footer>本地保存 · 让每一份投入都有迹可循</footer>
      <AppearanceSettings appearance={appearance} />
      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} onDeleted={session.recordDeleted}
        refreshKey={session.snapshot?.recent_records.map((item) => `${item.id}:${item.end_time}`).join(",") ?? ""} />
    </main>
    </DesktopWindow>
  );
}

export default App;
