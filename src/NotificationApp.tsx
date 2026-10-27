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
