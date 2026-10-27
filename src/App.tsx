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
