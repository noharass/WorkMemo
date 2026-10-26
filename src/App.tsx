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
