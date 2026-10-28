import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { CATEGORIES, formatTime, type StartInput } from "./types";
import { workView } from "./workView";
import { useHistory } from "./useHistory";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import "./App.css";

function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const [noteOpen, setNoteOpen] = useState(false);
  const [switchRequest, setSwitchRequest] = useState<{ input: StartInput; id: number; category: string } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [density, setDensity] = useState<"compact" | "comfortable">("comfortable");
  const workspace = useRef<HTMLElement>(null);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const unavailable = !view.canOperate || session.busy;
  const refreshKey = `${session.dataVersion}:${session.snapshot?.pending_count ?? 0}:` + (session.snapshot?.recent_records.map((item) => `${item.id}:${item.end_time}:${item.revision}`).join(",") ?? "");
  // Reuse the existing read-only history query and its complete category aggregates.
  const categories = useHistory(session.native, refreshKey, session.recordDeleted);
  const selected = "home";
  function panel(panel:string,section?:string){void invoke("open_panel",{panel,section}).catch(e=>setNavigationError(String(e)));}
  const pauseLabel = session.pending === "resume_task" ? "正在继续…" : session.pending === "pause_task" ? "正在暂停…"
    : active?.is_paused ? "继续工作" : "暂停";
  useEffect(()=>{if(!session.native)return;const refreshLayout=()=>{void invoke<{density:"compact"|"comfortable"}>("get_layout_settings").then(v=>setDensity(v.density)).catch(e=>setNavigationError(String(e)));};refreshLayout();const ps=[listen("workmemo:layout-changed",refreshLayout),listen("workmemo:appearance-changed",()=>{void appearance.reload();}),listen("workmemo:data-changed",()=>{void session.refresh();void categories.reload();})];return()=>{ps.forEach(p=>{void p.then(f=>f());});};},[session.native]);
  useEffect(()=>{if(!session.native)return;void invoke<boolean>("detect_preview_data").then(v=>{if(v)setMigrationFound(true);}).catch(()=>{});},[session.native]);
  const [migrationFound,setMigrationFound]=useState(false);

  return (
    <DesktopWindow appearanceStyle={themeStyle(appearance.current)} density={density}
      navigation={<nav className="main-nav flex items-center gap-1" aria-label="主导航">
        <button type="button" className="nav-button" aria-label="首页" title="首页" aria-pressed={selected === "home"}
          onClick={() => { workspace.current?.focus(); workspace.current?.scrollIntoView({ block: "start" }); }}><Icon name="home" /></button>
        <button type="button" className="nav-button" aria-label="历史记录" title="历史记录" aria-pressed={false}
          onClick={() => panel("history")}><Icon name="history" /></button>
        <button type="button" className="nav-button" aria-label="皮肤设置" title="皮肤设置" aria-pressed={false}
          disabled={appearance.loading} onClick={()=>panel("settings","appearance")}><Icon name="palette" /></button>
        <button type="button" className="nav-button" aria-label="布局设置" title="布局设置" aria-pressed={false}
          onClick={() => panel("settings","layout")}><Icon name="layout" /></button>
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
      {migrationFound&&<p className="notice">发现预览版数据。<button onClick={()=>panel("settings","data")}>查看并迁移</button></p>}
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
        <button type="button" className="text-button" onClick={() => panel("settings","monitor")}>监测设置</button>
      </div>}
      {session.snapshot?.monitoring?.idle_warning && <p className="notice" role="status">已连续 {session.snapshot.monitoring.idle_warning_seconds} 秒没有输入，{session.snapshot.monitoring.idle_end_seconds} 秒时将自动结束。恢复操作后会取消提醒。</p>}

      <section className={`timer-card${view.mode === "finished" ? " finished-card" : ""}`}
        aria-label="当前工作" aria-busy={session.loading || session.busy}>
        <div className="task-row flex items-center justify-between gap-4">
          <div className="task-copy">
            <div className="task-eyebrow flex items-center gap-1.5"><Icon name="clock" /><span>当前工作</span></div>
            <h1>{record ? record.category : view.label}</h1>
            <p className="task-summary">
              {record ? <>数量 {formatQuantity(record.quantity)}<span className="meta-dot" aria-hidden="true">·</span>
                <span className={`state-label ${view.mode === "working" ? "working" : ""}`} role="status">{view.label}</span>
                <span className="task-control-mode">{record.control_mode === "AUTO" ? "自动监测" : "手动计时"}</span></>
                : view.caption}
            </p>
            {record && view.mode === "unavailable" && <p className="hint">{view.caption}</p>}
            {active && !active.is_paused && <p className="task-mode-hint">{active.control_mode === "AUTO" ? "工作页面与操作满足条件时自动记录" : "当前由你手动计时，自动监测不会覆盖此任务"}</p>}
            {active?.is_paused && active.pause_reason === "MANUAL" && <p className="task-mode-hint">可手动继续；开启自动恢复后，返回工作页面并操作也可继续。</p>}
          </div>
          <output className={`timer${view.timer.length > 9 ? " timer-long" : ""}`} aria-label="有效工作时长" title={view.caption} aria-live="off">{view.timer}</output>
        </div>
        {record && <div className="actions flex items-center gap-3">
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
        <WorkForm disabled={unavailable} switching starting={session.pending === "start_task"} onStart={async input => {
          setSwitchRequest({ input, id: active.id, category: active.category }); return false;
        }} />
      </details>}

      {session.native && session.snapshot && <div className="settlement-entry">
        <button type="button" className="secondary" onClick={() => panel("settlement")}>
          待补全工作量（{session.snapshot.pending_count}）</button>
      </div>}
      <UiDialog open={switchRequest !== null} onClose={() => { if (!session.busy) setSwitchRequest(null); }} id="switch-title" title="确认切换工作">
        {switchRequest && <div className="switch-confirm grid gap-3">
          <p>将结束并保存当前暂停的“{switchRequest.category}”，然后开始手动工作“{switchRequest.input.category}”。</p>
          <p className="hint">原任务会保留在待补全列表；此操作不会覆盖记录。</p>
          {session.commandError && <p className="error-banner" role="alert">{session.commandError}</p>}
          <div className="confirm-actions flex gap-2"><button type="button" className="secondary" disabled={session.busy} onClick={() => setSwitchRequest(null)}>取消</button>
            <button type="button" disabled={session.busy} onClick={() => { void session.start(switchRequest.input, switchRequest.id).then(saved => { if (saved) setSwitchRequest(null); }); }}>确认保存并开始</button></div>
        </div>}
      </UiDialog>
      <UiDialog open={noteOpen && !!record} onClose={() => setNoteOpen(false)} id="note-title" title="任务详情与备注">
        {record && <>
          <p className="note-heading">{record.category} · 数量 {formatQuantity(record.quantity)}</p>
          <p className="hint">开始 {formatTime(record.start_time)}
            {record.end_time !== null && <><br />保存 {formatTime(record.end_time)}</>}</p>
          <p className="task-remark">{record.remark || "这项工作未填写备注。"}</p>
        </>}
      </UiDialog>

    </main>
    </DesktopWindow>
  );
}

export default App;
