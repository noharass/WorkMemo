import { useCategoryNames } from "./categoryNames";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
  type WorkRecord,
} from "./types";
import { validateWorkInput } from "./workInput";

export function SettlementForm({
  record,
  busy,
  onSave,
  externalActions = false,
  compact = false,
}: {
  compact?: boolean;
  externalActions?: boolean;
  record: WorkRecord;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const { name } = useCategoryNames();
  const [category, setCategory] = useState(record.category);
  const [quantity, setQuantity] = useState(
    record.quantity === null ? "" : String(record.quantity),
  );
  const [remark, setRemark] = useState(record.remark);
  const [error, setError] = useState("");
  async function saveDraft() {
    if (busy) return false;
    const result = validateWorkInput(category, quantity, remark, true);
    if (!result.ok) {
      setError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    setError("");
    const saved = await onSave({
      ...result.input,
      quantity: result.input.quantity,
      id: record.id,
      expected_revision: record.revision,
    });
    if (!saved)
      setError("保存未完成，请查看上方错误信息后重试。输入内容仍保留。");
    return saved;
  }
  const dirty =
    category !== record.category ||
    quantity !== (record.quantity === null ? "" : String(record.quantity)) ||
    remark !== record.remark;
  useDraft(`settlement-${record.id}`, dirty, busy, saveDraft, () => {
    setCategory(record.category);
    setQuantity(record.quantity === null ? "" : String(record.quantity));
    setRemark(record.remark);
    setError("");
  });
  return (
    <form
      id="settlement-form"
      className="settlement-form"
      onSubmit={(event) => {
        event.preventDefault();
        void saveDraft();
      }}
      noValidate
    >
      {compact ? <p className="hint">有效工时 {formatDuration(record.duration_seconds)} · 开始 {formatTime(record.start_time)}</p> : <p className="hint">
        开始 {formatTime(record.start_time)}
        <br />
        有效结束 {record.end_time === null ? "—" : formatTime(record.end_time)}
        <br />
        系统确认{" "}
        {record.confirmed_end_time === null
          ? "—"
          : formatTime(record.confirmed_end_time)}
        <br />
        有效工时 {formatDuration(record.duration_seconds)}
      </p>}
      <div className="field-row grid grid-cols-2 gap-3">
        <label>
          工作类别
          <select
            aria-label="工作类别"
            value={category}
            disabled={busy}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>{name(value)}</option>
            ))}
          </select>
        </label>
        <label>
          工作量（必填）
          <input
            type="number"
            min="0"
            max="1000000000"
            step="any"
            inputMode="decimal"
            value={quantity}
            disabled={busy}
            placeholder="0 表示无产出"
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
      </div>
      <label>
        备注（选填）
        <textarea
          rows={2}
          value={remark}
          disabled={busy}
          maxLength={4000}
          onChange={(event) => setRemark(event.target.value)}
        />
      </label>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {!externalActions && (
        <button type="submit" disabled={busy}>
          <span>{busy ? "正在保存…" : "填写工作量并保存"}</span>
          <Icon name="check" />
        </button>
      )}
    </form>
  );
}

export function SettlementPanel({
  open,
  onClose,
  refreshKey,
  busy,
  onSave,
  beforeChange = (action) => action(),
}: {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
  beforeChange?: (action: () => void) => void;
}) {
  const { name } = useCategoryNames();
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    let stale = false;
    void invoke<WorkRecord[]>("get_pending_records")
      .then((r) => {
        if (!stale) {
          setRecords(r);
          setSelected((id) =>
            r.some((x) => x.id === id) ? id : (r[0]?.id ?? null),
          );
        }
      })
      .catch((e) => {
        if (!stale) setError(String(e));
      });
    return () => {
      stale = true;
    };
  }, [open, refreshKey]);
  const record = records.find((r) => r.id === selected);
  return (
    <Surface
      title="待补全工作量"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="secondary" onClick={onClose}>
            稍后填写
          </button>
          <button
            form="settlement-form"
            type="submit"
            disabled={busy || !record}
          >
            填写工作量并保存
          </button>
        </>
      }
    >
      <p className="hint">计时结果已保存，稍后填写不会丢失记录。</p>
      {error && <p className="error-banner">{error}</p>}
      {records.length > 0 ? (
        <label>
          选择记录
          <select
            value={selected ?? ""}
            disabled={busy}
            onChange={(e) => {
              const id = Number(e.target.value);
              beforeChange(() => setSelected(id));
            }}
          >
            {records.map((r) => (
              <option value={r.id} key={r.id}>
                {name(r.category)} · {formatTime(r.start_time)} ·{" "}
                {formatDuration(r.duration_seconds)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p>没有待补全记录。</p>
      )}
      {record && (
        <SettlementForm
          key={`${record.id}:${record.revision}:${refreshKey}`}
          record={record}
          busy={busy}
          externalActions
          onSave={async (input) => {
            const ok = await onSave(input);
            if (ok) {
              setRecords((rs) => rs.filter((r) => r.id !== input.id));
              setSelected(records.find((r) => r.id !== input.id)?.id ?? null);
            }
            return ok;
          }}
        />
      )}
    </Surface>
  );
}
