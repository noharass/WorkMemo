import { useCategoryNames } from "./categoryNames";
import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { useWorkSession } from "./useWorkSession";
import { themeStyle } from "./themes";
import { formatDuration, type WorkNotice, type WorkRecord } from "./types";
import { DraftContext, type Draft } from "./Drafts";
import { SettlementForm } from "./SettlementPanel";
import { TaskList, useOpenTasks } from "./TaskList";
import { IslandExpansion } from "./IslandExpansion";
import { islandView } from "./islandView";
import "./App.css";

export function NotificationApp() {
  const session = useWorkSession();
  const snapshot = session.snapshot;
  const openTasks = useOpenTasks(snapshot, session.native);
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [editing, setEditing] = useState<WorkRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  const draft = useRef<Draft | null>(null);
  const editingRef = useRef(editing); editingRef.current = editing;
  const revision = useRef(0);
  const seen = useRef("");
  const busy = session.busy || deferring;
  const [dirty, setDirty] = useState(false);
  const registerDraft = useCallback((_id: string, value: Draft | null) => {
    draft.current = value; setDirty(!!value?.dirty);
  }, []);
  useEffect(() => {
    void invoke("set_window_dirty", { dirty: dirty || busy }).catch(e => setError(String(e)));
  }, [dirty, busy]);
  useEffect(() => () => { void invoke("set_window_dirty", { dirty: false }).catch(() => {}); }, []);
  useEffect(() => {
    let stopped = false, reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      const request = revision.current;
      try {
        const value = await invoke<WorkNotice | null>("get_notice");
        if (!stopped && request === revision.current) { setNotice(value); setReadError(""); }
      } catch (e) { if (!stopped) setReadError(String(e)); }
      finally { reading = false; }
    }
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    const unlisten = listen("workmemo:appearance-changed", () => { void appearance.reload(); });
    return () => { stopped = true; clearInterval(timer); void unlisten.then(fn => fn()); };
  }, [appearance.reload]);
  const { active, candidate, notice: visibleNotice, key } = islandView(snapshot, notice);
  const monitor = snapshot?.monitoring;
  const bindingKey = monitor?.unknown_page_url ? `new:${monitor.unknown_page_url}` : monitor?.finished_page_rule != null ? `finished:${monitor.finished_page_rule}` : null;
  const expansionKey = bindingKey ?? key;
  const reminderLabel = bindingKey ? "网页待处理" : candidate ? "待确认开工" : visibleNotice?.kind === "ended" ? "工作量待填" : visibleNotice?.kind === "idle" ? "空闲提醒" : null;
  useEffect(() => {
    if (expansionKey === seen.current) return;
    seen.current = expansionKey;
    // New reminders update the compact hint; only an explicit user action opens the island.
    if (!expansionKey && !editingRef.current) setExpanded(false);
  }, [expansionKey]);
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲暂停" : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";

  async function later(force = false) {
    if (busy) return;
    if (draft.current?.dirty && !force) { setDiscard(true); return; }
    setDeferring(true); setError("");
    try {
      if (editing) await invoke("defer_notice", { id: editing.id, kind: "ended" });
      else if (visibleNotice) await invoke("defer_notice", { id: visibleNotice.record.id, kind: visibleNotice.kind });
      revision.current++;
      if (!editing || notice?.record.id === editing.id) setNotice(null);
      setDiscard(false); setExpanded(false);
      setDirty(false);
    } catch (e) { setError(String(e)); }
    finally { setDeferring(false); }
  }
  const latestLater = useRef(later); latestLater.current = later;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const unlisten = listen("workmemo:request-close", () => {
      if (busyRef.current) { setError("正在保存，请稍候。"); return; }
      void latestLater.current();
    });
    return () => { void unlisten.then(fn => fn()); };
  }, []);
  const combinedError = error || session.commandError || session.connectionError || readError || openTasks.error;
  return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}>
    <div className="app-shell island-shell">
      <div className="island-main-row">
        <div className="island-drag" role="group" aria-label="拖动状态岛" onMouseDown={event => {
          if (event.button === 0) void getCurrentWindow().startDragging().then(() => invoke("fit_island_position")).catch(e => setError(String(e)));
        }}>
          {active || candidate || monitor?.browse_category ? <WorkBadge category={active?.category ?? candidate?.category ?? monitor?.browse_category ?? "开发"} presentation={presentation.current} showName={false} /> : <span className="work-symbol"><Icon name="read" /></span>}
          <span className="island-info"><strong>{bindingKey ? monitor?.unknown_page_url ? "新网页待处理" : "网页任务待处理" : active ? active.task_name || name(active.category) : candidate ? name(candidate.category) : visibleNotice?.kind === "ended" ? "工作已结束" : "仅浏览"}</strong>
            <small>{snapshot ? !expanded && reminderLabel ? `${reminderLabel} · 点箭头查看` : bindingKey ? monitor?.browsing_only ? "仅浏览 · 当前不计时" : "请打开主窗口处理绑定" : visibleNotice?.kind === "ended" ? "结果已保存 · 待填写工作量" : state : "状态不可用"}</small></span>
          {active && <strong className="island-time">{formatDuration(active.duration_seconds)}</strong>}
        </div>
        {candidate && <button type="button" className="island-action" aria-label="开始识别的工作" title={`开始记录 · ${name(candidate.category)}`} disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}><Icon name="play" /></button>}
        {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || !!session.connectionError || active.recovery_pending} onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}><Icon name={active.is_paused ? "play" : "pause"} /></button>}
        {!candidate && monitor?.browsing_only && <button type="button" className="island-action" aria-label={active ? "继续记录" : "开始记录"} disabled={busy || !monitor.browse_ready || !!active?.recovery_pending || !!session.connectionError} onClick={() => { void session.confirmWork(null); }}><Icon name="play" /></button>}
        {(active || openTasks.tasks.length > 0 || bindingKey || visibleNotice || candidate || editing || combinedError || (snapshot?.pending_count ?? 0) > 0) && <button type="button" className="island-action island-expand" data-reminder={!expanded && !!reminderLabel} aria-expanded={expanded} title={expanded ? "收起展开区域" : reminderLabel ? `${reminderLabel}，点击展开任务与提醒` : "展开任务与提醒"} aria-label={expanded ? "收起展开区域" : "展开任务与提醒"} onClick={() => {
          if (expanded && editing) { void later(); return; }
          setExpanded(value => !value);
        }}><Icon name={expanded ? "left" : "right"} /></button>}
        <button type="button" className="island-open" aria-label="打开WorkMemo" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}><Icon name="open" /></button>
      </div>
      <IslandExpansion open={expanded} onError={setError} onCollapsed={() => { setEditing(null); setDiscard(false); setDirty(false); }}>
        {dashboard.fallback}
        {combinedError && <p className="inline-error" role="alert">{combinedError}</p>}
        {editing ? <>
          <h2>填写工作量 · {name(editing.category)}</h2>
          {discard && <div className="island-discard" role="alert"><p>放弃本次未保存的填写？原记录仍在待补全列表。</p><button type="button" disabled={busy} onClick={() => { void later(true); }}>放弃填写并收起</button><button type="button" className="secondary" onClick={() => setDiscard(false)}>继续填写</button></div>}
          <DraftContext.Provider value={registerDraft}><SettlementForm compact key={editing.id} record={editing} busy={busy}
            onSave={async input => {
              const saved = await session.settle(input);
              if (saved) {
                revision.current++;
                setNotice(current => current?.record.id === input.id ? null : current);
                setDirty(false); setExpanded(false);
              }
              return saved;
            }} /></DraftContext.Provider>
          <button className="text-button" type="button" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
          {session.commandError && <button className="text-button" type="button" onClick={() => { void dashboard.open("pending"); }}>打开待补全列表核对</button>}
        </> : bindingKey ? <section aria-label="新网页处理提醒"><h2>{monitor?.unknown_page_url ? "发现新网页" : "绑定任务已结束"}</h2><p>{monitor?.unknown_page_url ? "请在主窗口绑定已有任务、新建任务或记住忽略。" : "请在主窗口选择另一项未结束任务，或新建任务后重新绑定。"}</p><button type="button" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}>打开主窗口处理</button></section> : candidate ? <section aria-label="开工确认"><h2>开始记录 · {name(candidate.category)}</h2><p>已匹配工作网址，确认前不计时。</p><div className="island-buttons"><button disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}>开始记录</button><button className="secondary" disabled={busy} onClick={() => { void session.browse(); }}>仅浏览</button></div></section> : visibleNotice?.kind === "ended" ? <section aria-label="工作结束提醒">
          <h2>本次工作已结束</h2><p>{name(visibleNotice.record.category)} · 有效工时 {formatDuration(visibleNotice.record.duration_seconds)}</p>
          <div className="island-buttons"><button type="button" disabled={busy || !!session.connectionError} onClick={() => { setEditing(visibleNotice.record); setExpanded(true); }}>填写工作量</button><button className="secondary" type="button" disabled={busy} onClick={() => { void later(); }}>稍后</button></div>
        </section> : visibleNotice?.kind === "idle" ? <section aria-label="空闲提醒">
          <h2>空闲提醒</h2><p>连续 {formatDuration(visibleNotice.idle_warning_seconds)} 无输入；到达 {formatDuration(visibleNotice.idle_end_seconds)} 时结束计时，最后输入后的尾段不计入工时。</p>
          <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了</button>
        </section> : null}
        {!editing && <TaskList {...openTasks} active={active} compact disabled={busy || !!session.connectionError} onSwitch={session.switchTask}/>}
        {!editing && (snapshot?.pending_count ?? 0) > 0 && <button type="button" className="text-button" onClick={() => { void dashboard.open("pending"); }}>待补全 {snapshot?.pending_count}</button>}
      </IslandExpansion>
      {combinedError && !expanded && <span className="island-error" role="alert" aria-label={combinedError} title={combinedError}>!</span>}
    </div>
  </div>;
}
