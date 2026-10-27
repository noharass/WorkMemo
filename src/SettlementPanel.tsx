import { useEffect, useState, type FormEvent } from "react";
import { invoke } from "@tauri-apps/api/core";
import { CATEGORIES, formatDuration, formatTime, type SettleInput, type WorkRecord } from "./types";
import { validateWorkInput } from "./workInput";

export function SettlementForm({ record, busy, onSave }: {
  record: WorkRecord; busy: boolean; onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const [category, setCategory] = useState(record.category);
  const [quantity, setQuantity] = useState(record.quantity === null ? "" : String(record.quantity));
  const [remark, setRemark] = useState(record.remark);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    const result = validateWorkInput(category, quantity, remark, true);
    if (!result.ok) { setError(Object.values(result.errors).join(" ")); return; }
    if (result.input.quantity === null) return;
    setError("");
    const saved = await onSave({ ...result.input, quantity: result.input.quantity, id: record.id, expected_revision: record.revision });
    if (!saved) setError("保存未完成，请查看上方错误信息后重试。输入内容仍保留。");
  }
  return <form className="settlement-form" onSubmit={(event) => { void submit(event); }} noValidate>
    <p className="hint">开始 {formatTime(record.start_time)}<br />
      有效结束 {record.end_time === null ? "—" : formatTime(record.end_time)}<br />
      系统确认 {record.confirmed_end_time === null ? "—" : formatTime(record.confirmed_end_time)}<br />
      有效工时 {formatDuration(record.duration_seconds)}</p>
    <div className="field-row">
      <label>工作类别<select value={category} disabled={busy} onChange={(event) => setCategory(event.target.value)}>
        {CATEGORIES.map(value => <option key={value}>{value}</option>)}
      </select></label>
      <label>工作量（必填）<input type="number" min="0" max="1000000000" step="any" inputMode="decimal"
        value={quantity} disabled={busy} placeholder="0 表示无产出" onChange={(event) => setQuantity(event.target.value)} /></label>
    </div>
    <label>备注（选填）<textarea rows={2} value={remark} disabled={busy} maxLength={4000}
      onChange={(event) => setRemark(event.target.value)} /></label>
    {error && <p className="inline-error" role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? "正在保存…" : "填写工作量并保存"}</button>
  </form>;
}

export function SettlementPanel({ open, onClose, refreshKey, busy, onSave }: {
  open: boolean; onClose: () => void; refreshKey: string; busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const [records, setRecords] = useState<WorkRecord[] | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    if (!open) return;
    let stale = false;
    setError("");
    void invoke<WorkRecord[]>("get_pending_records").then(data => { if (!stale) setRecords(data); })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, refreshKey, reload]);
  if (!open) return null;
  return <section className="settlement-panel" aria-labelledby="settlement-title">
    <div className="settings-heading"><h2 id="settlement-title">待补全工作量</h2>
      <button type="button" className="secondary" onClick={onClose}>稍后填写</button></div>
    <p className="hint">计时结果已保存。可以关闭这里并继续下一项工作。</p>
    {error && <div className="error-banner" role="alert">{error}
      <button type="button" className="text-button" disabled={busy} onClick={() => setReload(value => value + 1)}>重新读取</button></div>}
    {records === null && !error && <p role="status">正在读取待补全记录…</p>}
    {records?.length === 0 && <p role="status">没有待补全记录。</p>}
    {records?.map(record => <details key={`${record.id}:${record.revision}`} className="settlement-record" open={records.length === 1}>
      <summary>{record.category} · {formatTime(record.start_time)} · {formatDuration(record.duration_seconds)}</summary>
      <SettlementForm record={record} busy={busy || error !== ""} onSave={async input => {
        const saved = await onSave(input);
        if (saved) setRecords(current => current?.filter(item => item.id !== input.id) ?? null);
        return saved;
      }} />
    </details>)}
  </section>;
}
