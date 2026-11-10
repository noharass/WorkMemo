# 灵动岛默认收起：完整源码

2026-11-10。以下七个程序／脚本文件完整保留，无省略。全部 NEW FILE / UPDATE、文档路径、PowerShell 命令、测试与兼容性见 E:\WorkMemo\docs\FIX-ISLAND-MANUAL-EXPAND.md。

## UPDATE — E:\WorkMemo\src\NotificationApp.tsx

```tsx

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

```

## UPDATE — E:\WorkMemo\src\App.css

```css

@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

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
.window-controls { display: flex; flex-shrink: 0; gap: 3px; justify-self: end; grid-column: -2; }
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
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--control-background); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
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
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / var(--reading-opacity)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }

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
.actions { margin-top: calc(var(--content-gap) + 6px); }
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

label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / var(--reading-opacity)); font-size: 12px; }
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
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }

button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb) / var(--surface-opacity)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--line); }
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
.settings-actions { margin-top: 20px; }
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
.history-dialog, .delete-dialog { width: min(500px, calc(100% - 32px)); max-height: calc(100% - 32px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.history-dialog::backdrop, .delete-dialog::backdrop { background: rgb(0 0 0 / 25%); }
.history-filters { display: grid; gap: 10px; margin-top: 18px; }
.history-filters input, .history-filters select { padding: 9px 6px; font-size: 11px; }
.history-filters .hint { margin-top: 0; }
.filter-category-row { display: grid; grid-template-columns: 1fr 90px; gap: 12px; align-items: end; }
.filter-category-row button { justify-content: center; }
.history-tabs { margin: 18px 0 15px; }
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
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--reading-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
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
.monitor-settings { margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
.island-frame { padding: 5px; }
.island-shell { flex-direction: row; align-items: center; border-radius: 32px; padding: 0 8px 0 14px; }
.island-drag { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 100%; cursor: grab; }
.island-mark { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; color: var(--accent); border: 1px solid var(--window-border); font-weight: 700; }
.island-info { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.island-info strong, .island-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.island-info strong { font-size: 14px; }
.island-info small { font-size: 11px; color: var(--text-secondary); }
.island-time { font: 600 15px ui-monospace, monospace; white-space: nowrap; }
.island-open { flex: 0 0 30px; width: 30px; height: 30px; margin-left: 5px; padding: 0; border-radius: 50%; }
.island-error { color: var(--accent); font-weight: bold; }


/* Desktop refresh: keep all color and surface choices tied to the four theme tokens. */
.icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 18px; line-height: 1; }
.icon svg, .window-control .icon svg { display: block; width: 1em; height: 1em; fill: currentColor; stroke: none; }
.window-control .icon { width: 16px; height: 16px; font-size: 14px; }
.app-shell { border-radius: var(--window-radius); }
.titlebar { min-height: 62px; padding: 10px 17px; border-bottom: 1px solid var(--line); }
.brand-mark { width: 30px; height: 30px; }
.brand-name { font-size: 14px; letter-spacing: -.35px; }
.main-nav { gap: 5px; }
button.nav-button { width: 34px; height: 34px; border-radius: 10px; }
button.nav-button[aria-pressed="true"] { background: var(--control-hover); }
button.nav-button[aria-pressed="true"]::after { bottom: -2px; }
.category-chip { padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; }
.workspace { max-width: 680px; padding: 20px 24px 24px; }
.workspace.is-active { margin-block: 0; }
.monitor-status { min-height: 42px; padding: 7px 11px; margin: 0 auto 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--surface-rgb) / 45%); font-size: 11px; }
.monitor-status button { border: 0; color: var(--accent-text); font-size: 11px; }
.timer-card { width: 100%; max-width: none; padding: 22px; border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / var(--reading-opacity)); }
.task-eyebrow { margin-bottom: 10px; color: var(--text-muted); font-size: 10px; font-weight: 600; letter-spacing: .05em; }
.task-eyebrow .icon { width: 14px; height: 14px; font-size: 13px; }
.task-copy h1 { font-size: 22px; font-weight: 650; letter-spacing: -.5px; }
.task-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.task-summary .meta-dot { margin: 0 2px; }
.task-control-mode { padding: 2px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--text-muted); font-size: 10px; }
.task-mode-hint { max-width: 310px; margin: 8px 0 0; color: var(--text-muted); font-size: 10px; line-height: 1.6; }
.timer { font-family: ui-monospace, Consolas, monospace; font-size: clamp(23px, 4vw, 32px); letter-spacing: -1px; }
.actions { gap: 12px; margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }
button.round-action { width: 38px; height: 38px; padding: 9px; }
button.quiet-action { padding: 8px 10px; }
.form-card { width: 100%; max-width: none; padding: 16px 18px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.work-form { gap: 12px; }
.work-form > button { min-height: 40px; font-weight: 600; }
.switch-panel { max-width: none; padding: 12px 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.switch-panel summary { font-weight: 600; color: var(--text-primary); }
.switch-confirm { margin-top: 18px; font-size: 12px; line-height: 1.8; }
.switch-confirm p { margin: 0; }
.confirm-actions { margin-top: 10px; }
.confirm-actions button { justify-content: center; }
.ui-dialog, .history-dialog, .appearance-dialog, .delete-dialog { padding: 22px; }
.settings-heading { padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.settings-heading h2 { font-size: 16px; }
.monitor-settings { margin-top: 18px; }
.monitor-rule { padding: 14px; border-radius: 12px; }
.monitor-rule legend { color: var(--text-primary); font-weight: 600; }
.monitor-toggle input { accent-color: var(--accent); }
.monitor-toggle { line-height: 1.6; }
.history-records li, .settlement-record { padding: 15px 0; }
.notice-titlebar { padding: 14px 18px; border-bottom: 1px solid var(--line); }
.notice-titlebar span { font-weight: 600; }
.notice-content { padding: 8px 18px 18px; }
.island-shell { padding: 0 10px 0 14px; border-radius: 32px; }
.island-mark { color: var(--on-accent); background: var(--accent); border: 0; }
.island-info small { color: var(--text-muted); }
.island-time { font: 600 15px ui-monospace, Consolas, monospace; }
.island-open { display: flex; justify-content: center; align-items: center; color: var(--accent-text); background: var(--control-hover); }
.island-open .icon { width: 14px; height: 14px; font-size: 13px; transform: rotate(45deg); }
@media (max-width: 540px) {
  .titlebar { padding-inline: 10px; }
  .workspace { padding: 14px; }
  .timer-card { padding: 16px; }
}
@media (max-width: 380px) {
  .titlebar { padding-inline: 8px; }
  .workspace { padding: 10px; }
  .timer-card { padding: 13px; }
  .task-copy h1 { font-size: 17px; }
  .task-row { gap: 6px; }
  .timer { font-size: 22px; }
}

/* Secondary pages share the same cards, controls and token-driven typography. */
.history-dialog { width: min(540px, calc(100% - 32px)); }
.history-filters { padding: 14px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--window-rgb) / 45%); }
.history-filters label { color: var(--text-muted); font-weight: 600; }
.history-filters button { min-height: 38px; }
.history-tabs { padding: 4px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-tabs button { border-color: transparent; background: transparent; }
.history-tabs .icon, .history-pagination .icon, .history-filters .icon, .delete-link .icon { width: 15px; height: 15px; font-size: 14px; }
.history-overview { padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 45%); }
.summary-grid > div { padding: 12px 10px; }
.history-records { display: grid; gap: 9px; }
.history-records li { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-records .record-heading { align-items: flex-start; }
.stats-section { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.stats-section h3 { margin: 0 0 10px; }
.settlement-panel { padding: 18px; }
.settlement-panel .settings-heading { margin-bottom: 12px; }
.settlement-record { border-bottom: 1px solid var(--line); }
.settlement-form { padding: 0 4px 10px; }

button.theme-choice { min-height: 68px; padding: 12px; }
.theme-sample { width: 36px; height: 42px; border-radius: 9px; }
.theme-label strong { font-size: 13px; }
.theme-label > span { white-space: normal; }
.opacity-heading { margin-top: 20px; }

.notice-content h1 { margin-top: 12px; }
.notice-content p { line-height: 1.7; }

/* Independent panels reserve fixed header/footer rows. Only the body scrolls. */
.panel-app{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;overflow:hidden}
.panel-app .panel-surface{flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}
.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);flex-shrink:0}
.panel-heading h2{margin:0;font-size:18px}.panel-heading button{width:auto}
.panel-scroll{overflow:auto;min-height:0;padding:18px 24px 24px;scrollbar-width:thin}
.panel-actions{grid-row:3;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:14px 22px;border-top:1px solid var(--line);background:rgb(var(--surface-rgb)/var(--reading-opacity))}
.panel-actions>button{width:auto;min-width:120px}.panel-actions .history-pagination{width:100%;margin:0}
.settings-tabs{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--line);flex-shrink:0}.settings-tabs button{width:auto;flex:1}
.settings-tabs button[aria-pressed=true]{border-color:var(--accent);color:var(--accent-text)}
.draft-indicator{font-size:11px;margin:0;padding:6px 24px;color:var(--accent-text);flex-shrink:0}
.panel-app>.error-banner{margin:8px 20px;flex-shrink:0;max-height:80px;overflow:auto}
.data-buttons{display:flex;gap:10px;margin:14px 0 24px;flex-wrap:wrap}.data-buttons button{width:auto}
.panel-app .monitor-settings{padding:0}.panel-app .theme-grid{max-width:760px}.panel-app .settlement-form{max-width:760px;margin-top:20px}
@media(max-width:600px){.panel-scroll{padding:14px}.panel-heading,.panel-actions{padding:12px}.settings-tabs{padding:8px}.panel-actions>button{min-width:0;flex:1}}

/* Shared preferences: every desktop surface uses the saved typography. */
.desktop-frame{font-size:var(--body-size,14px);font-weight:var(--body-weight,400);line-height:var(--body-line,1.6)}
.desktop-frame button,.desktop-frame input,.desktop-frame select,.desktop-frame textarea,.desktop-frame label,.desktop-frame summary{font-size:1em;font-weight:inherit;line-height:inherit}
.desktop-frame h1{font-size:1.5em}.desktop-frame h2{font-size:1.2em}.desktop-frame h3{font-size:1.05em}.desktop-frame .hint,.desktop-frame .task-summary{font-size:.82em}.desktop-frame .timer{font-size:2.25em}.desktop-frame .task-control-mode{font-size:.75em}
.app-shell{position:relative;isolation:isolate}.window-background{position:absolute;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center}
button.nav-button[aria-pressed="true"]::after{display:none}.desktop-frame .main-nav{display:flex;gap:3px}.desktop-frame .titlebar{grid-template-columns:auto auto minmax(0,1fr) auto}
.work-badge{display:inline-flex;align-items:center;gap:8px;min-width:0}.work-symbol{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:31px;height:31px;border-radius:9px;color:var(--work-color);background:color-mix(in srgb,var(--work-color) 12%,transparent)}.work-symbol .icon{font-size:19px}.work-badge>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button.workload-carousel{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0;overflow:hidden;padding:6px 9px;border:1px solid var(--line);border-radius:999px;background:rgb(var(--surface-rgb)/45%);color:var(--text-primary);font-size:.8em;white-space:nowrap}.workload-carousel .work-symbol{width:22px;height:22px;border-radius:50%}.workload-carousel .icon{font-size:14px}.workload-carousel .work-badge{gap:5px;flex-shrink:0}.workload-carousel small{color:var(--text-muted);font-size:.8em;overflow:hidden;text-overflow:ellipsis}.workload-carousel>span{overflow:hidden;text-overflow:ellipsis}
.home-footer{display:flex;align-items:center;gap:8px;margin-top:12px;min-width:0}.home-footer button{flex-shrink:0}.monitor-caption{font-size:.72em;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto}.start-prompt{border:1px solid var(--line);border-radius:var(--panel-radius);background:rgb(var(--surface-rgb)/var(--reading-opacity));padding:16px;margin-bottom:12px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}.start-prompt>strong{font-size:1em}.start-prompt p{width:100%;color:var(--text-muted);font-size:.85em;margin:0}.start-prompt>div{display:flex;gap:9px;width:100%}.start-prompt button{justify-content:center}.browse-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:12px;background:rgb(var(--surface-rgb)/85%);font-size:.88em}.browse-banner button{width:auto;justify-content:center;flex-shrink:0}
.panel-actions>button,.settings-actions>button,.data-buttons>button{justify-content:center!important;text-align:center}.panel-app button{max-width:100%}.panel-heading{padding:12px 22px}.panel-heading h2{font-size:1.15em}.settings-tabs{gap:5px;padding:10px 16px}.settings-tabs button{padding:8px 9px;font-size:.88em}.layout-form{display:grid;gap:18px;max-width:650px}.layout-form input[type=range]{padding:0}.font-preview{padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.visual-category{border:1px solid var(--line);border-radius:12px;padding:15px;margin:0 0 18px;min-width:0}.visual-category legend{padding:0 7px}.color-field{display:flex!important;align-items:center;gap:12px;margin-bottom:12px}.color-field input{width:45px;height:30px;padding:2px;margin:0}.color-field span{color:var(--text-muted);font-size:.8em}.icon-picker{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin-top:12px}.icon-picker button{min-height:40px;padding:8px}.icon-picker button[aria-pressed=true]{border-color:var(--accent-text);outline:1px solid var(--accent-text);background:var(--control-hover)}.background-settings{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.compact-help{margin:8px 0;font-size:.84em;color:var(--text-muted)}.compact-help summary{cursor:pointer}.monitor-diagnostics,.advanced-settings{padding:12px 14px;border:1px solid var(--line);border-radius:10px;margin-bottom:14px}.monitor-diagnostics>summary,.advanced-settings>summary{cursor:pointer;font-weight:600}.monitor-diagnostics>p,.monitor-diagnostics>button,.monitor-diagnostics>details{margin-top:12px}.advanced-settings>fieldset{margin-top:12px}
.desktop-frame[data-density=compact]{padding:5px;--content-gap:6px}.desktop-frame[data-density=compact] .titlebar{min-height:39px;padding:5px 8px;gap:5px}.desktop-frame[data-density=compact] .brand-name{display:none}.desktop-frame[data-density=compact] .brand-mark{width:22px;height:22px}.desktop-frame[data-density=compact] .titlebar-drag{min-height:24px}.desktop-frame[data-density=compact] .nav-button{width:25px;height:25px;padding:4px}.desktop-frame[data-density=compact] .nav-button .icon{font-size:15px}.desktop-frame[data-density=compact] .window-control{width:22px;height:25px;padding:4px}.desktop-frame[data-density=compact] .window-controls{gap:0}.desktop-frame[data-density=compact] .workload-carousel{padding:3px 5px;gap:4px;font-size:.7em}.desktop-frame[data-density=compact] .workload-carousel small{display:none}.desktop-frame[data-density=compact] .workload-carousel .work-symbol{width:17px;height:17px}.desktop-frame[data-density=compact] .workload-carousel .work-symbol .icon{font-size:12px}.desktop-frame[data-density=compact] .workspace{padding:8px 10px 9px;max-width:none}.desktop-frame[data-density=compact] .auxiliary{display:none}.desktop-frame[data-density=compact] .timer-card{padding:10px 12px;border-radius:12px}.desktop-frame[data-density=compact] .task-copy h1{font-size:1em}.desktop-frame[data-density=compact] .task-summary{margin-top:3px;font-size:.7em;gap:3px}.desktop-frame[data-density=compact] .task-control-mode{font-size:.9em;padding:0 4px}.desktop-frame[data-density=compact] .task-copy .work-symbol{width:25px;height:25px}.desktop-frame[data-density=compact] .task-copy .work-symbol .icon{font-size:16px}.desktop-frame[data-density=compact] .timer{font-size:1.65em}.desktop-frame[data-density=compact] .actions{margin-top:6px;padding-top:6px;gap:8px}.desktop-frame[data-density=compact] .round-action{width:29px;height:29px;padding:6px}.desktop-frame[data-density=compact] .quiet-action{padding:3px 5px;font-size:.8em}.desktop-frame[data-density=compact] .form-card{padding:9px 11px;margin-top:0;border-radius:12px}.desktop-frame[data-density=compact] .work-form{gap:7px}.desktop-frame[data-density=compact] .work-form label{font-size:.82em}.desktop-frame[data-density=compact] .work-form select{padding:4px 8px;margin-top:2px}.desktop-frame[data-density=compact] .work-form>button{min-height:30px;padding:4px 9px;font-size:.82em;justify-content:center}.desktop-frame[data-density=compact] .form-note>summary{font-size:.72em}.desktop-frame[data-density=compact] .home-footer{margin-top:6px;gap:4px}.desktop-frame[data-density=compact] .home-footer button{font-size:.7em;padding:4px 7px}.desktop-frame[data-density=compact] .monitor-caption{font-size:.65em}.desktop-frame[data-density=compact] .switch-panel{margin-top:6px;padding:5px 9px;font-size:.8em}.desktop-frame[data-density=compact] .start-prompt{padding:10px;gap:6px;margin-bottom:7px}.desktop-frame[data-density=compact] .start-prompt p{font-size:.75em}.desktop-frame[data-density=compact] .start-prompt button{padding:5px 8px;font-size:.82em}.desktop-frame[data-density=compact] .browse-banner{padding:8px 10px;margin-bottom:7px}.desktop-frame[data-density=compact] .browse-banner button{padding:5px 8px}.desktop-frame[data-density=compact] .settings-tabs{padding:6px 10px}.desktop-frame[data-density=compact] .settings-tabs button{padding:5px 7px;font-size:.8em}.desktop-frame[data-density=compact] .panel-heading{padding:8px 14px}.desktop-frame[data-density=compact] .panel-scroll{padding:10px 14px}.desktop-frame[data-density=compact] .panel-actions{padding:8px 14px}.desktop-frame[data-density=compact] .panel-actions>button{padding:7px 12px}.desktop-frame[data-density=compact] .monitor-settings{gap:9px}.desktop-frame[data-density=compact] .monitor-rule{padding:9px;gap:6px}.desktop-frame[data-density=compact] .theme-choice{min-height:48px;padding:8px}.desktop-frame[data-density=compact] .theme-sample{width:25px;height:28px}.desktop-frame[data-density=compact] .visual-category{padding:10px;margin-bottom:10px}
/* Main titlebar: identity + one settings entry, drag space, workload, window controls. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto auto minmax(32px,1fr) minmax(120px,320px) auto; }
.titlebar-main .titlebar-space { align-self:stretch; min-width:32px; }
.titlebar-main .workload-carousel { min-height:32px; }
.titlebar-main .workload-carousel .work-badge { flex:0 1 auto; min-width:0; }
.titlebar-main .workload-carousel strong { flex:0 0 auto; font-variant-numeric:tabular-nums; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto auto minmax(24px,1fr) minmax(100px,240px) auto; min-height:42px; gap:6px; }
.desktop-frame[data-density=compact] .titlebar-main .titlebar-space { min-width:24px; }
.desktop-frame[data-density=compact] .titlebar-main .nav-button { width:28px; height:28px; }
.desktop-frame[data-density=compact] .titlebar-main .workload-carousel { min-height:28px; padding:4px 8px; font-size:.75em; }
@media(max-width:600px) { .titlebar-main .brand-name { display:none; } }

/* Compact native status window: all persistent actions share the same row. */
.island-frame { padding:4px; }
.island-shell { position:relative; display:flex; flex-direction:column; align-items:stretch; justify-content:center; padding:5px 8px; border-radius:20px; gap:5px; }
.island-main-row { display:flex; align-items:center; min-height:30px; gap:5px; }
.island-drag { height:auto; gap:7px; }
.island-drag .work-symbol { width:26px; height:26px; border-radius:8px; flex-shrink:0; }
.island-drag .work-symbol .icon { font-size:16px; }
.island-info { gap:0; }
.island-info strong { font-size:12px; line-height:1.4; }
.island-info small { font-size:9px; line-height:1.4; }
.island-drag .island-time { font-size:12px; }
button.island-action, button.island-open { display:flex; justify-content:center; align-items:center; flex:0 0 26px; width:26px; height:26px; margin:0; padding:4px; border-radius:50%; background:transparent; color:var(--text-muted); box-shadow:none; }
button.island-action:hover:not(:disabled),button.island-open:hover:not(:disabled) { background:var(--control-hover); color:var(--accent-text); }
button.island-start { width:auto; flex-shrink:0; min-height:26px; padding:4px 8px; font-size:10px; border-radius:8px; }
.island-intent { display:flex; gap:6px; padding-left:33px; }
.island-intent button { width:auto; min-height:25px; padding:3px 10px; font-size:10px; justify-content:center; }
.island-error { position:absolute; left:2px; top:2px; font-size:10px; }
.layout-form { width:100%; margin-inline:auto; }
.layout-form input[type=range] { margin-inline:0; }
.panel-surface:has(.layout-form) .panel-heading, .panel-surface:has(.layout-form) .panel-actions { width:100%; max-width:694px; margin-inline:auto; }
button { transition:background-color .14s,border-color .14s,color .14s; }
button:active:not(:disabled) { box-shadow:inset 0 1px 2px rgb(0 0 0 / 12%); }
button.nav-button:hover:not(:disabled),button.text-button:hover:not(:disabled),button.workload-carousel:hover:not(:disabled) { background:var(--control-hover); }
@media (prefers-reduced-motion:reduce) { button { transition:none; } }

.monitor-work-sites { display:grid; gap:10px; min-width:0; }
.monitor-work-sites h3 { margin:0; font-size:1em; }
.monitor-work-sites > .hint { margin:0; }
.monitor-work-group { border:1px solid var(--line); border-radius:12px; min-width:0; }
.monitor-work-group > summary { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; list-style:none; }
.monitor-work-group > summary::before { content:"›"; color:var(--text-muted); transition:transform .14s; }
.monitor-work-group[open] > summary::before { transform:rotate(90deg); }
.monitor-work-group > summary span { margin-left:auto; font-size:.8em; color:var(--text-muted); }
.monitor-work-urls { display:grid; gap:10px; padding:0 12px 12px; min-width:0; }

.category-names-editor { display: grid; gap: 12px; margin-block: 16px; padding-block: 16px; border-block: 1px solid var(--border); }

.sound-preview-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

/* v0.2.5: retain the desktop layout and theme tokens. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
.titlebar-main .titlebar-drag:first-child { grid-column:1; grid-row:1; }
.titlebar-main .titlebar-space { grid-column:2; grid-row:1; min-width:24px; }
.titlebar-main .browse-toolbar { grid-column:3; grid-row:1; }
.titlebar-main .main-nav { grid-column:4; grid-row:1; padding-left:8px; border-left:1px solid var(--line); }
.titlebar-main .window-controls { grid-column:5; grid-row:1; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
button.browse-toolbar { width:auto; padding:4px 2px; gap:7px; color:var(--text-muted); background:transparent; box-shadow:none; font-size:12px; white-space:nowrap; }
button.browse-toolbar .icon { width:17px; height:17px; font-size:17px; }
button.browse-toolbar[aria-pressed=true] { color:var(--accent-text); }
.browse-switch { width:30px; height:18px; padding:2px; border-radius:20px; background:rgb(var(--surface-rgb)/65%); border:1px solid var(--line); }
.browse-switch::before { content:""; display:block; width:12px; height:12px; border-radius:50%; background:var(--text-muted); transition:transform .18s,background .18s; }
[aria-pressed=true] .browse-switch { background:var(--control-pressed); border-color:var(--accent-text); }
[aria-pressed=true] .browse-switch::before { transform:translateX(12px); background:var(--accent-text); }
.window-background { inset:-4px; filter:blur(2px); }
.workspace { display:flex; flex-direction:column; flex:0 0 auto; min-height:0; gap:12px; }
.workspace.is-active { margin-block:0; }
.workspace > .timer-card,.workspace > .form-card { width:100%; margin:0; border-color:var(--window-border); background:rgb(var(--surface-rgb)/var(--reading-opacity)); box-shadow:var(--panel-shadow); backdrop-filter:blur(12px); }
.monitor-status-card h1 { margin:0 0 10px; font-size:1.15em; }
.monitor-status-card p { overflow-wrap:anywhere; }
.monitor-status-card > button { margin-top:12px; }
.workspace .actions { display:flex; flex-wrap:wrap; align-items:center; gap:12px; border-top:1px solid var(--line); padding-top:18px; }
.workspace .quiet-action { gap:7px; }
.workspace .home-footer { margin-top:0; }
.workspace .home-footer .text-button { padding:3px 0; border:0; border-radius:0; }
button.browse-toolbar[aria-pressed=true]:disabled { opacity:.85; }
.workspace > .notice,.workspace > .error-banner { margin-bottom:0; }
.work-form .category-field { display:flex; align-items:center; gap:12px; }
.category-field-symbol { display:grid; place-items:center; width:40px; height:40px; flex-shrink:0; border-radius:var(--control-radius); color:var(--accent-text); background:var(--control-hover); }
.work-form .category-field label { flex:1; min-width:0; }
.work-form .category-field select { border:0; background:transparent; margin:0; padding:10px 4px; font-size:1.05em; box-shadow:none; }
.work-input-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.work-input-row label { min-width:0; }
.work-input-row textarea { min-height:42px; resize:vertical; }
.work-form .start-work { width:100%; justify-content:center; border-radius:999px; gap:9px; margin-top:2px; }
.work-form .cancel-switch { justify-content:flex-start; width:auto; color:var(--text-primary); background:transparent; padding:4px 0; box-shadow:none; }
.switch-hint { font-size:11px; color:var(--text-muted); margin:0; }
button.today-strip { display:flex; gap:13px; width:100%; flex-shrink:0; padding:10px 12px; border:1px solid var(--window-border); border-radius:var(--control-radius); box-shadow:none; background:transparent; color:var(--text-muted); font-size:12px; text-align:left; }
button.today-strip:hover { background:transparent; color:var(--text-primary); }
.today-strip-label { display:flex; align-items:center; gap:7px; flex-shrink:0; color:var(--text-primary); white-space:nowrap; }
.today-strip .icon { width:16px; height:16px; font-size:16px; }
.today-strip-viewport { display:block; flex:1; min-width:0; overflow:hidden; }
.today-strip-track { display:flex; width:max-content; gap:32px; white-space:nowrap; }
.today-strip-track > span { flex-shrink:0; }
.today-strip-track.is-scrolling { animation:today-scroll var(--scroll-duration) linear infinite; }
.today-strip:hover .today-strip-track,.today-strip:focus-visible .today-strip-track { animation-play-state:paused; }
@keyframes today-scroll { to { transform:translateX(calc(-1 * var(--scroll-distance))); } }
.desktop-frame[data-density=compact] .workspace { gap:8px; }
.desktop-frame[data-density=compact] .workspace .actions { gap:8px; padding-top:10px; }
.desktop-frame[data-density=compact] .category-field-symbol { width:30px; height:30px; }
.desktop-frame[data-density=compact] .today-strip { font-size:10px; gap:8px; padding:7px 9px; }
.desktop-frame[data-density=compact] .workspace .home-footer { margin-top:0; }
@media(max-width:440px) {
  .workspace .actions { gap:8px; }
  .workspace .quiet-action { padding-inline:4px; gap:4px; }
  .workspace .quiet-action .icon { width:17px; height:17px; font-size:17px; }
  .work-input-row { grid-template-columns:1fr; gap:8px; }
  .browse-toolbar .browse-switch { display:none; }
  .titlebar-main .main-nav { padding-left:4px; }
}
@media(prefers-reduced-motion:reduce) {
  .today-strip-track.is-scrolling { animation:none; }
  .today-strip-track > span[aria-hidden] { display:none; }
  .today-strip-viewport { overflow-x:auto; scrollbar-width:thin; }
  .browse-switch::before { transition:none; }
}

/* Fixed island body; the lower reveal shares this single material layer. */
.island-frame { padding:4px; }
.island-frame .island-shell { position:absolute; left:4px; top:4px; width:312px; height:auto; max-height:calc(100% - 8px); padding:0; gap:0; display:flex; flex-direction:column; justify-content:flex-start; border-radius:20px; overflow:hidden; backdrop-filter:blur(12px); }
.island-frame .island-main-row { position:relative; width:310px; height:46px; min-height:46px; flex:0 0 46px; padding:5px 7px; margin:0; gap:3px; border-radius:20px; }
.island-frame .island-drag { align-self:stretch; min-width:0; height:auto; }
.island-frame .island-info { min-width:0; }
.island-frame .island-drag .work-symbol { flex:0 0 25px; width:25px; height:25px; }
.island-frame .island-time { font-size:12px; }
.island-frame button.island-action,.island-frame button.island-open { flex:0 0 22px; width:22px; height:26px; padding:3px; border-radius:8px; }
.island-frame .island-action .icon,.island-frame .island-open .icon { width:14px; height:14px; font-size:14px; }
.island-frame .island-expand { position:relative; }
.island-frame .island-expand[data-reminder="true"]::after { content:""; position:absolute; top:2px; right:2px; width:5px; height:5px; border-radius:50%; background:var(--accent-text); pointer-events:none; }
.island-expansion { width:310px; flex:none; overflow:hidden; transition:height .2s ease,opacity .2s ease,transform .2s ease; }
.island-expansion:not(.island-reveal-enter):not(.island-reveal-appear):not(.island-reveal-leave) { overflow-y:auto; scrollbar-width:thin; }
.island-expansion-content { padding:5px 13px 14px; font-size:12px; }
.island-expansion-content h2 { margin:0 0 8px; font-size:14px; font-weight:600; }
.island-expansion-content p { margin:0 0 9px; line-height:1.65; }
.island-expansion-content button { min-height:29px; padding:6px 9px; font-size:11px; justify-content:center; }
.island-buttons { display:flex; gap:8px; }
.island-expansion .settlement-form { display:flex; flex-direction:column; gap:9px; }
.island-expansion .settlement-form .hint { font-size:10px; margin:0; }
.island-expansion .settlement-form label { font-size:11px; }
.island-expansion .settlement-form input,.island-expansion .settlement-form select,.island-expansion .settlement-form textarea { margin-top:4px; padding:5px 7px; font-size:12px; }
.island-expansion .text-button { margin-top:8px; width:100%; }
.island-discard { padding:8px; margin-bottom:10px; border:1px solid var(--line); border-radius:var(--control-radius); }
.island-discard button+button { margin-top:6px; }
@media(prefers-reduced-motion:reduce) { .island-expansion { transition:none; } }

/* v0.2.7: shared translucent controls, with local reading protection rather than content opacity. */
.desktop-frame .titlebar, .desktop-frame .home-footer, .desktop-frame .footer,
.desktop-frame .settings-tabs, .desktop-frame .panel-surface,
.island-frame .island-main-row, .island-frame .island-expansion-content {
  background: rgb(var(--window-rgb) / var(--reading-opacity));
}
.desktop-frame button.today-strip, .desktop-frame button.today-strip:hover {
  background: rgb(var(--window-rgb) / var(--reading-opacity));
}
.desktop-frame .titlebar { border-radius: var(--window-radius) var(--window-radius) 0 0; }
button.secondary { background: var(--control-background); color: var(--text-primary); }
button:active:not(:disabled) { background: var(--control-pressed); box-shadow: none; }
button.browse-toolbar:hover:not(:disabled), button.browse-toolbar[aria-pressed=true] {
  background: var(--control-hover); color: var(--accent-text); border-radius: 8px;
}
button.browse-toolbar, button.window-control, button.nav-button,
button.island-action, button.island-open, button.quiet-action { border-color: transparent; }
.work-form > button:not(.cancel-switch), .monitor-status-card > button,
.settlement-form button[type=submit], .panel-actions > button:not(.secondary) {
  background: var(--primary-background); color: var(--accent-text); border-color: var(--window-border);
  justify-content: center; gap: 9px;
}
.work-form > button:hover:not(:disabled), .monitor-status-card > button:hover:not(:disabled),
.settlement-form button[type=submit]:hover:not(:disabled), .panel-actions > button:hover:not(:disabled) {
  background: var(--control-hover);
}
.desktop-frame .appearance-dialog, .desktop-frame .history-dialog, .desktop-frame .delete-dialog,
.desktop-frame .ui-dialog { background: rgb(var(--surface-rgb) / var(--reading-opacity)); backdrop-filter: blur(16px); }

/* Feedback: standalone reading strips use the same rounded material as other cards. */
.home-footer { border:1px solid var(--window-border); border-radius:var(--control-radius); padding:7px 12px; min-height:34px; }
.desktop-frame[data-density=compact] .home-footer { padding:4px 9px; min-height:29px; }
.home-footer > button { margin:0; }
.help-disclosure { color:var(--text-muted); font-size:.82em; line-height:1.65; }
.help-disclosure > summary { cursor:pointer; width:fit-content; padding-block:3px; }
.help-disclosure p { margin:7px 0 0; overflow-wrap:anywhere; }
.monitor-status-card .help-disclosure { margin-block:4px; }
.desktop-frame .start-prompt, .desktop-frame .switch-panel,
.desktop-frame .monitor-status, .desktop-frame .font-preview { border-radius:var(--panel-radius); }
.page-binding-address{overflow-wrap:anywhere;max-height:3.5em;overflow:auto}.page-binding-prompt .page-binding-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.page-binding-prompt .page-binding-options label{display:flex;align-items:center;justify-content:flex-start;gap:6px;white-space:nowrap;margin:0}.page-binding-prompt .page-binding-options input[type=radio]{width:auto;flex:none;margin:0}.page-binding-prompt .page-binding-range{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:10px;margin:0;white-space:nowrap}.page-binding-prompt input:not([type=radio]),.page-binding-prompt select{min-width:0;max-width:100%;padding:6px 9px;border-radius:9px;border:1px solid var(--border,rgba(90,110,99,.3));background:var(--panel-background,rgba(255,255,255,.55));color:inherit}.page-binding-prompt>button{width:100%}@media(max-width:460px){.page-binding-prompt .page-binding-options{grid-template-columns:1fr}}
.task-name{color:var(--text-muted);font-size:.84em;max-width:24em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* Shared unfinished-task overview in the main window and status island. */
.task-list{border:1px solid var(--line);border-radius:var(--panel-radius);padding:12px;margin-bottom:12px;background:rgb(var(--surface-rgb)/var(--reading-opacity));min-width:0}
.task-list-heading{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:.85em}.task-list-heading>span{color:var(--text-muted);font-variant-numeric:tabular-nums}
.task-list-rows{display:flex;flex-direction:column;gap:5px;max-height:220px;overflow-y:auto;scrollbar-width:thin}
.task-list .task-list-row{display:flex;align-items:center;gap:8px;width:100%;min-width:0;min-height:38px;padding:7px 9px;border-radius:10px;text-align:left;justify-content:flex-start}
.task-list-row[aria-current=true]{border-color:var(--line);background:rgb(var(--surface-rgb)/.25)}
.task-list-row[aria-current=true]:disabled{opacity:1;color:var(--text-primary)}
.task-list-dot{width:6px;height:6px;flex:none;border:1px solid currentColor;border-radius:50%;opacity:.55}.task-list-row[aria-current=true] .task-list-dot{background:currentColor}
.task-list-copy{display:flex;flex-direction:column;flex:1;min-width:0;gap:2px}.task-list-copy strong{font-size:.9em;font-weight:600;overflow-wrap:anywhere}.task-list-copy small{font-size:.75em;color:var(--text-muted)}
.task-list-status{font-size:.75em;color:var(--text-muted);flex:none}.task-list-resume{font-size:.75em;flex:none}
.task-list-compact{padding:9px;margin:8px 0 0;border-radius:12px}.task-list-compact .task-list-rows{max-height:190px}.task-list-compact .task-list-row{padding:6px;gap:6px}.task-list-compact .task-list-heading{font-size:11px}

```

## UPDATE — E:\WorkMemo\src-tauri\src\service.rs

```rust

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

// Use the same priority as the island frontend; old settlements stay persisted.
fn island_presentation_key(
    active: Option<i64>,
    candidate: Option<u64>,
    notice: Option<(&str, i64)>,
    enabled: bool,
    browsing: bool,
    binding_pending: bool,
) -> Option<String> {
    if let Some(id) = active {
        if notice == Some(("idle", id)) {
            return Some(format!("idle:{id}"));
        }
        return enabled.then(|| format!("active:{id}"));
    }
    if let Some(id) = candidate {
        return Some(format!("candidate:{id}"));
    }
    notice
        .map(|(kind, id)| format!("{kind}:{id}"))
        .or_else(|| (enabled && binding_pending).then(|| "page-binding".into()))
        .or_else(|| (enabled && browsing).then(|| "browsing".into()))
}

pub struct Backend {
    pub(crate) inner: SharedStore,
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
                if let Ok(dir) = app.path().app_config_dir() {
                    if let Err(e) = crate::database::data_tools::recover_pending(store, &dir) {
                        *guard = Err(e);
                    }
                }
                if let Ok(store) = guard.as_mut() {
                    store.sound_config = app
                        .path()
                        .app_config_dir()
                        .ok()
                        .map(|p| p.join("window-layout.json"));
                    store.activate_monitoring();
                }
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
                } else {
                    let handle = app.handle().clone();
                    std::thread::spawn(move || {
                        let _ = handle
                            .state::<crate::connection::ConnectionState>()
                            .refresh(true);
                    });
                }
            }
        }
        let weak = Arc::downgrade(&inner);
        let app_handle = app.handle().clone();
        let signals = native_activity::listen();
        std::thread::spawn(move || {
            let mut presented = None;
            let mut last_pending = None;
            let mut listener_ok = true;
            let mut reported_error: Option<String> = None;
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                let mut notice = None;
                let mut active_id = None;
                let mut candidate_id = None;
                let mut browsing = false;
                let mut binding_pending = false;
                let mut runtime_failure: Option<String> = None;
                // Sample after the preceding loop has finished creating and positioning the window.
                // Creation emits transient move events, so those events must not overwrite saved coordinates.
                if let Some(window) = app_handle.get_webview_window("notice") {
                    if let Ok(position) = window.outer_position() {
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .moved(position);
                    }
                }
                if let Err(error) = app_handle.state::<crate::desktop::IslandState>().flush() {
                    runtime_failure = Some(format!("状态岛设置未能保存：{error}"));
                }
                if let Ok(mut guard) = shared.lock() {
                    if let Ok(store) = guard.as_mut() {
                        observe_sound(store, false);
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
                        observe_sound(store, true);
                        match store.current_notice() {
                            Ok(value) => notice = value,
                            Err(error) => {
                                store.warning = Some(error.clone());
                                runtime_failure = Some(error);
                            }
                        }
                        match store.snapshot() {
                            Ok(snapshot) => {
                                if last_pending != Some(snapshot.pending_count) {
                                    let _ = app_handle.emit("workmemo:data-changed", ());
                                    last_pending = Some(snapshot.pending_count);
                                }
                                candidate_id =
                                    snapshot.monitoring.start_candidate.as_ref().map(|c| c.id);
                                browsing = snapshot.monitoring.browsing_only;
                                binding_pending = snapshot.monitoring.unknown_page_url.is_some()
                                    || snapshot.monitoring.finished_page_rule.is_some();
                                active_id = snapshot.active.map(|record| record.id);
                            }
                            Err(error) => runtime_failure = Some(error),
                        }
                    }
                }
                let key = island_presentation_key(
                    active_id,
                    candidate_id,
                    notice.as_ref().map(|n| (n.kind.as_str(), n.record.id)),
                    app_handle.state::<crate::desktop::IslandState>().enabled(),
                    browsing,
                    binding_pending,
                );
                let key = key.or_else(|| {
                    app_handle
                        .state::<crate::desktop::IslandState>()
                        .holding
                        .load(Ordering::Relaxed)
                        .then(|| "expanded".into())
                });
                if key != presented {
                    match crate::desktop::present_notice(
                        &app_handle,
                        key.is_some(),
                        notice.is_some(),
                        candidate_id.is_some(),
                    ) {
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

pub(crate) async fn access<T: Send + 'static>(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<T> + Send + 'static,
) -> Result<T> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = shared
            .lock()
            .map_err(|_| "本地数据服务异常，请重新打开应用。")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        observe_sound(store, false);
        let result = action(store);
        observe_sound(store, true);
        result
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
pub async fn start_task(
    state: State<'_, Backend>,
    input: StartInput,
    expected_active_id: Option<i64>,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.start_checked(input, expected_active_id)
    })
    .await
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
pub async fn get_page_tasks(state: State<'_, Backend>) -> Result<Vec<crate::database::PageTask>> {
    access(state.inner.clone(), |store| store.page_tasks()).await
}
#[tauri::command]
pub async fn bind_page(
    state: State<'_, Backend>,
    input: crate::database::BindPageInput,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.bind_page(input)).await
}
#[tauri::command]
pub async fn get_ignored_pages(
    state: State<'_, Backend>,
) -> Result<Vec<crate::database::IgnoredPage>> {
    access(state.inner.clone(), |store| store.ignored_pages()).await
}
#[tauri::command]
pub async fn remove_ignored_page(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.remove_ignored_page(id)
    })
    .await
}
#[tauri::command]
pub async fn rebind_finished_page(
    state: State<'_, Backend>,
    input: crate::database::RebindPageInput,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.rebind_finished_page(input)
    })
    .await
}
#[tauri::command]
pub async fn confirm_recovery_task(state: State<'_, Backend>, task_id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.confirm_recovery_task(task_id)
    })
    .await
}
#[tauri::command]
pub async fn get_category_names(
    state: State<'_, Backend>,
) -> Result<crate::database::categories::CategoryNames> {
    access(state.inner.clone(), |store| store.category_names()).await
}
#[tauri::command]
pub async fn save_category_names(
    app: tauri::AppHandle,
    state: State<'_, Backend>,
    input: crate::database::categories::CategoryNames,
) -> Result<crate::database::categories::CategoryNames> {
    let saved = access(state.inner.clone(), move |store| {
        store.save_category_names(input)
    })
    .await?;
    let _ = app.emit("workmemo:categories-changed", ());
    Ok(saved)
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
pub async fn defer_notice(state: State<'_, Backend>, id: i64, kind: String) -> Result<()> {
    access(state.inner.clone(), move |store| {
        store.defer_notice(id, &kind)
    })
    .await
}
#[tauri::command]
pub fn show_main(app: tauri::AppHandle, settlement: bool) -> Result<()> {
    crate::desktop::show_main(&app, settlement)
}
#[tauri::command]
pub fn exit_app(app: tauri::AppHandle, state: State<'_, Backend>) -> Result<()> {
    if let Err(error) = crate::desktop::save_island_position(&app) {
        let _ = app.emit(
            "workmemo:runtime-error",
            format!("状态岛设置未能保存：{error}"),
        );
    }
    if crate::windows::has_drafts(&app) {
        let _ = app.emit("workmemo:request-close", ());
        return Err("请先保存或放弃二级窗口中的修改，再退出。".into());
    }
    state.save_on_exit()?;
    state.exiting.store(true, Ordering::Relaxed);
    app.exit(0);
    Ok(())
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let backend = window.state::<Backend>();
        let _ = crate::windows::capture(window);
        if matches!(window.label(), "settings" | "history" | "settlement") {
            api.prevent_close();
            let _ = window.emit("workmemo:request-close", ());
            return;
        }
        if window.label() == "notice" {
            api.prevent_close();
            if window
                .state::<crate::desktop::IslandState>()
                .holding
                .load(Ordering::Relaxed)
            {
                let _ = window.emit("workmemo:request-close", ());
                return;
            }
            let result = (|| -> Result<()> {
                let mut guard = backend.inner.lock().map_err(|_| "本地服务锁异常。")?;
                let store = guard.as_mut().map_err(|e| e.clone())?;
                if let Some(notice) = store.current_notice()? {
                    store.defer_notice(notice.record.id, &notice.kind)?;
                } else {
                    window.state::<crate::desktop::IslandState>().disable()?;
                }
                Ok(())
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

#[tauri::command]
pub async fn enter_browsing(state: State<'_, Backend>) -> Result<Snapshot> {
    execute(state.inner.clone(), |store| store.enter_browsing()).await
}
#[tauri::command]
pub async fn confirm_work(
    state: State<'_, Backend>,
    candidate_id: Option<u64>,
) -> Result<Snapshot> {
    let own = crate::native_activity::own_process_foreground();
    execute(state.inner.clone(), move |store| {
        store.confirm_work(candidate_id, own)
    })
    .await
}

fn observe_sound(store: &mut Store, enabled: bool) {
    if let Ok(active) = store.active() {
        let state = active.map(|r| crate::sound::Status {
            id: r.id,
            paused: r.is_paused,
            recovery: r.recovery_pending,
        });
        let cues = store
            .sounds
            .observe(state, store.monitor.status.idle_warning);
        if enabled {
            if let Some(layout) = store
                .sound_config
                .as_ref()
                .and_then(|p| crate::windows::load(p).ok())
                .filter(|layout| layout.sound_enabled)
            {
                if let Some(cue) = cues.first() {
                    let _ = crate::sound::play(*cue, layout.sound_theme);
                }
            }
        }
    }
}

#[cfg(test)]
mod island_tests {
    use super::island_presentation_key as key;

    #[test]
    fn new_work_supersedes_old_reminders_without_changing_visibility_preference() {
        assert_eq!(
            key(None, Some(2), Some(("ended", 1)), false, false, false).as_deref(),
            Some("candidate:2")
        );
        assert_eq!(
            key(Some(3), None, Some(("ended", 1)), true, false, false).as_deref(),
            Some("active:3")
        );
        assert_eq!(
            key(Some(3), None, Some(("ended", 1)), false, false, false),
            None
        );
        assert_eq!(
            key(None, None, Some(("ended", 1)), false, false, false).as_deref(),
            Some("ended:1")
        );
        assert_eq!(
            key(Some(3), None, Some(("idle", 3)), false, false, false).as_deref(),
            Some("idle:3")
        );
        assert_eq!(
            key(None, None, None, true, true, false).as_deref(),
            Some("browsing")
        );
    }

    #[test]
    fn collapsed_binding_hint_stays_visible_without_holding_or_an_active_task() {
        assert_eq!(
            key(None, None, None, true, false, true).as_deref(),
            Some("page-binding")
        );
        assert_eq!(key(None, None, None, true, false, false), None);
        // Respect an explicit tray hide while the page still needs processing.
        assert_eq!(key(None, None, None, false, false, true), None);
    }
}

```

## UPDATE — E:\WorkMemo\scripts\verify-page-task-ui.mjs

```javascript

// Isolated browser UI fixture. No native app or user database is opened.
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {desktopFixture} from './desktop-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const output=new URL('../artifacts/page-tasks/qa/',import.meta.url);
await mkdir(output,{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:780,height:700}});
  await desktopFixture(page);
  const base=process.env.WORKMEMO_UI_URL||'http://127.0.0.1:1420/';
  await page.goto(`${base}?state=empty&unknown`);
  const prompt=page.getByRole('region',{name:'新网页处理'});
  await prompt.waitFor();
  await page.screenshot({path:fileURLToPath(new URL('new-page.png',output))});
  await page.setViewportSize({width:420,height:700});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:fileURLToPath(new URL('new-page-narrow.png',output))});
  await page.setViewportSize({width:780,height:700});
  assert.match(await prompt.innerText(),/计时已暂停/);
  assert.equal(await prompt.getByRole('button',{name:'保存绑定'}).isDisabled(),true);
  await prompt.getByRole('combobox',{name:'选择任务'}).selectOption('1');
  await prompt.getByRole('combobox',{name:'绑定范围'}).selectOption('path_prefix');
  await prompt.getByRole('button',{name:'保存绑定'}).click();
  await prompt.waitFor({state:'detached'});
  const bind=await page.evaluate(()=>window.qa.calls.find(c=>c.command==='bind_page'));
  assert.equal(bind.args.input.expected_url,'https://new.example.test/work');
  assert.equal(bind.args.input.task_id,1);
  await page.screenshot({path:fileURLToPath(new URL('bound.png',output))});
  await page.goto(`${base}?state=empty&finished`);
  const finished=page.getByRole('region',{name:'已结束任务处理'});
  await finished.waitFor();
  await page.screenshot({path:fileURLToPath(new URL('finished-page.png',output))});
  await finished.getByRole('textbox',{name:'新任务名称'}).fill('新工作');
  await finished.getByRole('button',{name:'确认绑定'}).click();
  await finished.waitFor({state:'detached'});
  const rebound=await page.evaluate(()=>window.qa.calls.find(c=>c.command==='rebind_finished_page'));
  assert.equal(rebound.args.input.new_name,'新工作');
  await page.screenshot({path:fileURLToPath(new URL('rebound.png',output))});
  await page.goto(`${base}?state=empty&suspended`);
  const suspended=page.getByRole('region',{name:'进行中的任务'});
  await suspended.waitFor();
  await page.screenshot({path:fileURLToPath(new URL('suspended.png',output))});
  await suspended.getByRole('button',{name:/已有任务/}).click();
  assert.equal(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='confirm_recovery_task')),true);
  await suspended.getByRole('button',{name:/计时中/}).waitFor();
  await page.goto(`${base}?state=empty&unknown&notice`);
  const island=page.getByRole('region',{name:'新网页处理提醒'});
  await page.getByRole('button',{name:'展开任务与提醒',exact:true}).click();
  await island.waitFor();
  await page.waitForTimeout(450);
  assert.ok((await island.boundingBox())?.height>50);
  await page.screenshot({path:fileURLToPath(new URL('island-new-page.png',output))});
  await island.getByRole('button',{name:'打开主窗口处理'}).click();
  assert.equal(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='show_main')),true);
  for (const suffix of ['', '&notice']) {
    await page.goto(`${base}?multi=8${suffix}`);
    if (suffix) await page.getByRole('button',{name:'展开任务与提醒'}).click();
    const list=page.getByRole('region',{name:'进行中的任务'});
    await list.getByRole('button',{name:'当前任务，计时中'}).waitFor();
    assert.equal(await list.getByRole('button').count(),8);
    await list.getByRole('button',{name:'暂停任务 2，已暂停，继续'}).click();
    await list.getByRole('button',{name:'暂停任务 2，计时中'}).waitFor();
    await list.getByRole('button',{name:'当前任务，已暂停，继续'}).waitFor();
    await page.screenshot({path:fileURLToPath(new URL(suffix?'island-tasks.png':'main-tasks.png',output))});
    await page.setViewportSize({width:360,height:600});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.setViewportSize({width:780,height:700});
  }
  console.log('Isolated new-page binding, finished-task rebinding and suspended-task resume passed.');
}finally{await browser.close()}

```

## UPDATE — E:\WorkMemo\scripts\verify-page-binding-entry.mjs

```javascript

// Isolated browser IPC regression; never opens the native app or a user database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { desktopFixture } from './desktop-fixture.mjs';

const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT
  ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1423/';
const output = new URL('../artifacts/page-binding-entry/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], results = [];
try {
  const page = await browser.newPage({ viewport: { width: 420, height: 650 } });
  page.on('pageerror', error => errors.push(error.message));
  await desktopFixture(page);
  async function load(query) { await page.goto(`${base}?state=empty&${query}`); }
  async function savedWithoutStarting(command, browsing) {
    const state = await page.evaluate(() => ({
      browsing: window.qa.browse, active: window.qa.active,
      writes: window.qa.calls.filter(call => ['bind_page', 'rebind_finished_page', 'start_task', 'confirm_work', 'confirm_recovery_task', 'enter_browsing'].includes(call.command)),
    }));
    assert.equal(state.browsing, browsing);
    assert.equal(state.active, null);
    assert.deepEqual(state.writes.map(call => call.command), [command]);
    return state.writes[0].args.input;
  }

  for (const browsing of [false, true]) {
    const suffix = browsing ? '&browse' : '';
    await load(`finished${suffix}`);
    const prompt = page.getByRole('region', { name: '已结束任务处理', exact: true });
    const create = prompt.getByRole('radio', { name: '新建任务', exact: true });
    await create.waitFor();
    assert.equal(await create.isChecked(), true);
    assert.equal(await prompt.getByRole('button', { name: '确认绑定' }).isDisabled(), true);
    await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).fill('继续处理的工作');
    await prompt.getByRole('radio', { name: '绑定已有任务', exact: true }).check();
    assert.equal(await prompt.getByRole('button', { name: '确认绑定' }).isDisabled(), true);
    await prompt.getByRole('combobox', { name: '任务选择' }).selectOption('1');
    await create.check();
    assert.equal(await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).inputValue(), '继续处理的工作');
    await page.evaluate(() => { window.qa.fail = 'rebind_finished_page'; });
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.getByRole('alert').waitFor();
    assert.equal(await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).inputValue(), '继续处理的工作');
    await page.evaluate(() => { window.qa.fail = ''; window.qa.calls = []; });
    for (const width of [320, 420, 780]) {
      await page.setViewportSize({ width, height: 650 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await prompt.evaluate(element => element.scrollWidth <= element.clientWidth), true);
      await page.screenshot({ path: fileURLToPath(new URL(`finished-${browsing}-${width}.png`, output)) });
    }
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.waitFor({ state: 'detached' });
    const input = await savedWithoutStarting('rebind_finished_page', browsing);
    assert.equal(input.task_id, null);
    assert.equal(input.new_name, '继续处理的工作');

    await load(`finished${suffix}`);
    await prompt.getByRole('radio', { name: '绑定已有任务', exact: true }).check();
    await prompt.getByRole('combobox', { name: '任务选择' }).selectOption('1');
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.waitFor({ state: 'detached' });
    assert.equal((await savedWithoutStarting('rebind_finished_page', browsing)).task_id, 1);

    await load(`unknown${suffix}`);
    const unknown = page.getByRole('region', { name: '新网页处理', exact: true });
    await unknown.getByRole('radio', { name: '新建任务', exact: true }).check();
    await unknown.getByRole('textbox', { name: '任务名称', exact: true }).fill('新网页工作');
    await unknown.getByRole('combobox', { name: '绑定范围' }).selectOption('origin');
    await unknown.getByRole('button', { name: '保存绑定' }).click();
    await unknown.waitFor({ state: 'detached' });
    assert.equal((await savedWithoutStarting('bind_page', browsing)).new_name, '新网页工作');

    await load(`finished&notice${suffix}`);
    const reminder = page.getByRole('region', { name: '新网页处理提醒', exact: true });
    await page.getByRole('button', { name: '展开任务与提醒', exact: true }).click();
    await reminder.getByRole('heading', { name: '绑定任务已结束' }).waitFor();
    assert.match(await reminder.innerText(), /新建任务/);
    assert.doesNotMatch(await reminder.innerText(), /忽略/);
    assert.equal(await page.getByText('网页任务待处理', { exact: true }).isVisible(), true);
    await reminder.getByRole('button', { name: '打开主窗口处理' }).click();
    assert.equal(await page.evaluate(() => window.qa.calls.some(call => call.command === 'show_main')), true);
    results.push({ browsing, finishedNew: true, finishedExisting: true, unknownNew: true, failedSaveDraft: true, islandEntry: true });
  }
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, results, errors }, null, 2));
  console.log('Page-binding entry regression passed: normal/browsing modes, new/existing tasks, save failure, 320/420/780 layouts and island guidance.');
} finally { await browser.close(); }

```

## UPDATE — E:\WorkMemo\scripts\verify-v027-island.mjs

```javascript

import { desktopFixture } from './desktop-fixture.mjs';
// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.7/qa/island/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 780, height: 680 } });
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
await desktopFixture(page);
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1420/';
async function load(params = {}, width = 780, height = 680) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(220);
}
// Native region is modelled by IPC observations; this does not prove Windows rendering.
try {
  await load({notice:'1',candidate:'1',state:'empty'},320,420);
  await page.getByRole('button',{name:'展开任务与提醒',exact:true}).click();
  await page.getByRole('button',{name:'开始记录',exact:true}).waitFor();
  await page.waitForTimeout(650);
  const metrics = await page.evaluate(()=>({
    height:document.querySelector('.island-expansion').getBoundingClientRect().height,
    region:window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height ?? 56,
    calls:window.qa.calls.filter(c=>['set_island_region','hold_island'].includes(c.command)),
  }));
  if(process.argv.includes('--baseline')) {
    await writeFile(new URL('baseline.json',output),JSON.stringify(metrics,null,2));
    console.log(JSON.stringify(metrics));
  } else {
    assert.ok(metrics.height>50,JSON.stringify(metrics));
    assert.ok(metrics.region>=metrics.height+55,JSON.stringify(metrics));
    for(let i=0;i<3;i++) {
      await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height),56);
      await page.getByRole('button',{name:'展开任务与提醒',exact:true}).click();
      await page.waitForTimeout(400);
      assert.ok(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height)>100);
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.island-expansion').evaluate(el=>el.getBoundingClientRect().height),0);
    await page.getByRole('button',{name:'展开任务与提醒',exact:true}).click();
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height)>100);
    assert.equal(await page.getByRole('button',{name:'收起展开区域',exact:true}).getAttribute('aria-expanded'),'true');
    assert.deepEqual(errors,[]);
    await page.screenshot({path:fileURLToPath(new URL('candidate.png',output))});
    await writeFile(new URL('result.json',output),JSON.stringify({isolated:true,native:false,metrics,errors},null,2));
    console.log('Island native-region contract, repeated reveal and reduced-motion checks passed.');
  }
} finally { await browser.close(); }

```

## NEW FILE — E:\WorkMemo\scripts\verify-island-manual-expand.mjs

```javascript

// Isolated IPC regression. No native application or user database is opened.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { desktopFixture } from './desktop-fixture.mjs';

const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT
  ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1423/';
const output = new URL('../artifacts/island-manual-expand/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 420 } });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  await desktopFixture(page);
  const expansion = page.locator('.island-expansion');
  const expand = () => page.getByRole('button', { name: '展开任务与提醒', exact: true });
  const collapse = () => page.getByRole('button', { name: '收起展开区域', exact: true });
  async function load(query) {
    await page.goto(`${base}?notice&${query}`);
    await expand().waitFor();
    await page.waitForFunction(() => document.querySelector('.island-info small')?.textContent !== '状态不可用');
    await page.waitForTimeout(400);
  }
  async function closed(label) {
    assert.equal(await expand().getAttribute('aria-expanded'), 'false');
    assert.equal(await expansion.getAttribute('aria-hidden'), 'true');
    assert.ok(await expansion.evaluate(el => el.getBoundingClientRect().height) < 1);
    assert.equal(await expand().getAttribute('data-reminder'), 'true');
    assert.match(await page.locator('.island-info small').innerText(), new RegExp(label));
    assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'set_island_region').at(-1)?.args.height), 56);
    assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'hold_island').at(-1)?.args.holding), false);
    results.push(label);
  }
  async function update(patch) {
    const before = await page.evaluate(patch => {
      Object.assign(window.qa, patch);
      return window.qa.calls.filter(c => c.command === 'get_snapshot').length;
    }, patch);
    await page.waitForFunction(before => window.qa.calls.filter(c => c.command === 'get_snapshot').length > before, before);
    await page.waitForTimeout(350);
  }

  await load('state=empty&unknown');
  await closed('网页待处理');
  assert.equal(await page.evaluate(() => window.qa.calls.some(c => c.command === 'set_island_region' && c.args.height > 56)), false);
  await expand().click();
  await page.getByRole('button', { name: '打开主窗口处理', exact: true }).waitFor();
  await page.waitForTimeout(350);
  assert.ok(await expansion.evaluate(el => el.getBoundingClientRect().height) > 50);
  assert.equal(await collapse().getAttribute('data-reminder'), 'false');
  await collapse().click();
  await page.waitForTimeout(350);
  // Distinct page identities must not override the user's manual collapse.
  for (let index = 0; index < 3; index++) {
    await update({ unknown: `https://tab${index}.example.test/work` });
    await closed('网页待处理');
  }
  await update({ unknown: null, finishedRule: 1 });
  await closed('网页待处理');
  await update({ finishedRule: 2 });
  await closed('网页待处理');
  await update({ finishedRule: null, candidate: { id: 31, rule_id: 1, category: '开发' } });
  await closed('待确认开工');
  await update({ candidate: { id: 32, rule_id: 2, category: '文档' } });
  await closed('待确认开工');
  assert.equal(await page.getByRole('button', { name: '开始识别的工作', exact: true }).isVisible(), true);

  await load('state=empty&ended');
  await closed('工作量待填');
  await expand().click();
  await page.getByRole('button', { name: '填写工作量', exact: true }).click();
  await page.getByLabel('工作量（必填）', { exact: true }).fill('12');
  await page.getByLabel('备注（选填）').fill('不应被切页打断的草稿');
  await update({ unknown: 'https://another.example.test/work' });
  assert.equal(await collapse().getAttribute('aria-expanded'), 'true');
  assert.equal(await page.getByLabel('备注（选填）').inputValue(), '不应被切页打断的草稿');
  await collapse().click();
  await page.getByRole('button', { name: '继续填写', exact: true }).click();
  assert.equal(await page.getByLabel('工作量（必填）', { exact: true }).inputValue(), '12');
  results.push('manual editing and dirty-draft close guard preserved');

  await load('state=empty&candidate');
  await closed('待确认开工');
  // The compact start action remains usable without forcing the panel open.
  await page.getByRole('button', { name: '开始识别的工作', exact: true }).click();
  await page.waitForFunction(() => window.qa.active !== null && window.qa.candidate === null);
  await page.waitForTimeout(350);
  assert.equal(await expand().getAttribute('aria-expanded'), 'false');
  assert.equal(await expand().getAttribute('data-reminder'), 'false');
  assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'confirm_work').length), 1);
  results.push('compact start creates one task and remains collapsed');

  await load('');
  const idle = await page.evaluate(() => ({ kind: 'idle', record: window.qa.active, idle_warning_seconds: 300, idle_end_seconds: 420 }));
  await update({ notice: idle });
  await closed('空闲提醒');

  for (const theme of ['glass', 'cream', 'dark', 'neon']) {
    for (const opacity of [40, 100]) {
      await load(`state=empty&unknown&theme=${theme}&opacity=${opacity}`);
      await closed('网页待处理');
      const dot = await expand().evaluate(el => {
        const style = getComputedStyle(el, '::after');
        return { content: style.content, width: style.width, animation: style.animationName };
      });
      assert.equal(dot.content, '""');
      assert.equal(dot.width, '5px');
      assert.equal(dot.animation, 'none');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: fileURLToPath(new URL(`collapsed-${theme}-${opacity}.png`, output)) });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expand().click();
  await collapse().waitFor();
  await page.waitForTimeout(150);
  assert.ok(await expansion.evaluate(el => el.getBoundingClientRect().height) > 50);
  await collapse().click();
  await page.waitForTimeout(150);
  await closed('网页待处理');
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, results, errors }, null, 2));
  console.log('Manual island expansion passed: repeated page/candidate changes, compact hints, explicit controls, draft guard, native-region IPC, four skins and reduced motion.');
} finally { await browser.close(); }

```
