import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { SettlementForm } from "./SettlementPanel";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { formatDuration, type Snapshot, type WorkNotice, type SettleInput } from "./types";
import "./App.css";

export function NotificationApp() {
  const appearance = useAppearance();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  useEffect(() => {
    let stopped = false; let reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      try {
        const [value, current] = await Promise.all([invoke<WorkNotice | null>("get_notice"), invoke<Snapshot>("get_snapshot")]);
        if (!stopped) { setNotice(value); setSnapshot(current); setReadError(""); }
      }
      catch (failure: unknown) { if (!stopped) { setSnapshot(null); setReadError(String(failure)); } }
      finally { reading = false; }
    }
    void refresh(); const timer = window.setInterval(() => { void refresh(); }, 1000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, []);
  const key = notice ? `${notice.kind}:${notice.record.id}` : "";
  useEffect(() => { if (key) void appearance.reload(); }, [key]);
  useEffect(() => {
    let stopped = false;
    let unlisten: (() => void) | undefined;
    void listen("workmemo:appearance-changed", () => { void appearance.reload(); }).then(fn => { if (stopped) fn(); else unlisten = fn; });
    return () => { stopped = true; unlisten?.(); };
  }, [appearance.reload]);
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
  const active = snapshot?.active;
  const state = active?.recovery_pending ? "上次工作待恢复"
    : active?.pause_reason === "MANUAL" ? "手动暂停 · 已停表"
    : active?.pause_reason === "AWAY" ? "离页暂停 · 已停表"
    : active?.pause_reason === "MONITOR" ? "监测中断 · 已停表"
    : active?.is_paused ? "已暂停 · 已停表"
    : snapshot?.monitoring.idle_warning ? "空闲提醒 · 暂计"
    : snapshot?.monitoring.away_pause_remaining_seconds != null ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
    : active?.control_mode === "AUTO" ? "自动记录中 · 暂计" : "手动计时 · 暂计";
  if (!notice) return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}><div className="app-shell island-shell">
    <div className="island-drag" onMouseDown={event => { if (event.button === 0) void getCurrentWindow().startDragging().catch(() => {}); }} aria-label="拖动状态岛">
      <span className="island-mark">C</span><span className="island-info"><strong>{active?.category ?? "状态读取中"}</strong><small>{snapshot ? (active ? state : "无活动任务") : "状态不可用"}</small></span>
      <strong className="island-time">{active ? formatDuration(active.duration_seconds) : "--:--:--"}</strong>
    </div>
    <button type="button" className="island-open" onClick={() => { void invoke("show_main", { settlement: false }).catch(failure => setError(String(failure))); }} aria-label="打开 WorkMemo">↗</button>
    {(error || readError) && <span className="island-error" role="alert" title={[error, readError].filter(Boolean).join("；")}>!</span>}
  </div></div>;
  return <div className="desktop-frame notice-frame" style={themeStyle(appearance.current)}><div className="app-shell">
    <header className="notice-titlebar"><span onMouseDown={event => { if (event.button === 0) void getCurrentWindow().startDragging().catch(() => {}); }}>WorkMemo 工作提醒</span>
      <button className="secondary" type="button" disabled={!notice || busy} onClick={() => { void later(); }}>稍后</button></header>
    <main className="notice-content">
      {error && <p className="error-banner" role="alert">{error}</p>}
      {readError && <p className="error-banner" role="alert">读取状态失败：{readError}</p>}
      {notice?.kind === "idle" && <section aria-label="空闲提醒">
        <h1>已连续 {formatDuration(notice.idle_warning_seconds)} 没有输入活动</h1>
        <p>到达 {formatDuration(notice.idle_end_seconds)} 时将结束本次计时，最后一次输入后的尾段不计入有效工时。恢复操作后会取消此提醒。</p>
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
