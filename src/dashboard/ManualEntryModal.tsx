import { useEffect, useId, useRef, useState } from "react";
import { Alert, App, Button, DatePicker, Form, Input, Modal, Select, Space, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { CATEGORIES, formatDuration } from "../types";
import { useCategoryNames } from "../categoryNames";
import { loopTabWithin } from "../ui/loopTabWithin";
import { api, type Detail } from "./api";
import { validateManualEntry, type ManualEntryField } from "./manualEntry";

dayjs.extend(utc);

export function ManualEntryModal({ online, onClose, onSaved }: {
  online: boolean; onClose: () => void; onSaved: (value: Detail) => void;
}) {
  const { modal } = App.useApp();
  const { name } = useCategoryNames();
  const [requestId] = useState(() => crypto.randomUUID());
  const [initialEnd] = useState(() => dayjs().utcOffset(8).startOf("minute"));
  const [category, setCategory] = useState("开发");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [rest, setRest] = useState("");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>([initialEnd.subtract(1, "hour"), initialEnd]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{field: ManualEntryField; error: string} | null>(null);
  const [covered, setCovered] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const prefix = useId();
  const id = (field: string) => `${prefix}-${field}`;
  const clearError = (field: ManualEntryField) => {
    if (!fieldError || fieldError.field === field) { setFieldError(null); setError(""); }
  };
  const feedback = (field: ManualEntryField) => fieldError?.field === field
    ? <span id={id(`${field}-error`)}>{fieldError.error}</span> : undefined;
  const attributes = (field: ManualEntryField, hint?: string) => ({
    "aria-invalid": fieldError?.field === field,
    "aria-describedby": [hint ? id(hint) : "", fieldError?.field === field ? id(`${field}-error`) : ""].filter(Boolean).join(" ") || undefined,
  });
  const saving = useRef(false);
  const confirming = useRef(false);
  // Interpret the displayed calendar components in Beijing, even on computers in other zones.
  const start = range?.[0]?.utcOffset(8, true).valueOf() ?? NaN;
  const end = range?.[1]?.utcOffset(8, true).valueOf() ?? NaN;
  const dirty = category !== "开发" || quantity !== "" || remark !== "" || rest !== ""
    || start !== initialEnd.subtract(1, "hour").valueOf() || end !== initialEnd.valueOf();
  const span = end - start;
  const restMs = Number(rest || "0") * 60_000;
  const preview = Number.isFinite(span) && span > 0 && Number.isFinite(restMs) && restMs >= 0 && restMs <= span
    ? formatDuration(Math.round(span - restMs) / 1000) : "—";
  useEffect(() => {
    if (!error || busy || confirming.current) return;
    const frame = requestAnimationFrame(() => {
      if (fieldError && fieldError.field !== "time") document.getElementById(`${prefix}-${fieldError.field}`)?.focus();
      else summary.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [error, fieldError, busy, prefix]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault(); void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty || saving.current) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => { window.removeEventListener("keydown", keys); window.removeEventListener("beforeunload", unload); };
  });
  function close() {
    if (saving.current || confirming.current) return;
    if (!dirty) { onClose(); return; }
    confirming.current = true;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCovered(true);
    modal.confirm({
      title: "放弃这次补记录？",
      content: "未确认保存的输入将被放弃。若刚才连接中断，请先原样重试或刷新明细核对。",
      okText: "放弃补录", cancelText: "继续填写", focusable: { autoFocusButton: "cancel" },
      modalRender: node => <div onKeyDown={loopTabWithin} style={{display:"contents"}}>{node}</div>,
      onOk: onClose,
      afterClose: () => {
        confirming.current = false; setCovered(false);
        requestAnimationFrame(() => { if (trigger?.isConnected) trigger.focus(); });
      },
    });
  }
  async function save() {
    if (!online || saving.current || confirming.current) return;
    const result = validateManualEntry(requestId, category, quantity, remark, start, end, rest);
    if (!result.ok) { setFieldError(result); setError(result.error); return; }
    saving.current = true; setBusy(true); setFieldError(null); setError("");
    try {
      const saved = await api<Detail>("manual-entry", result.input);
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "补记录未完成，请保留输入后重试。");
    } finally { saving.current = false; setBusy(false); }
  }
  return <Modal open title="补记录" onCancel={close} centered width={560} className="dc-manual-entry"
    modalRender={node => <div inert={covered} onKeyDown={event => {if (!covered) loopTabWithin(event);}} style={{display:"contents"}}>{node}</div>}
    focusable={{trap:!covered,focusTriggerAfterClose:true}}
    mask={{ closable: false }} keyboard={!busy} closable={!busy}
    styles={{ body: { maxHeight: "calc(100dvh - 220px)", overflowY: "auto" } }}
    footer={<Space wrap>
      <Button disabled={busy} onClick={close}>取消</Button>
      <Button type="primary" aria-label="保存补录" aria-busy={busy} loading={busy} disabled={!online || busy} onClick={() => void save()}>保存补录</Button>
    </Space>}>
    <p>补录已完成的工作，保存后计入统计，并标记为「人工补录」。</p>
    <Form layout="vertical" aria-label="补记录表单" noValidate disabled={busy} onFinish={() => void save()}>
      <Form.Item label="类别" htmlFor={id("category")} required help={feedback("category")} validateStatus={fieldError?.field === "category" ? "error" : undefined}>
        <Select id={id("category")} aria-label="补录类别" aria-required {...attributes("category")} value={category} onChange={value => {setCategory(value);clearError("category");}}
          options={CATEGORIES.map(value => ({ value, label: name(value) }))} />
      </Form.Item>
      <Form.Item label="工作量" htmlFor={id("quantity")} required help={feedback("quantity")} validateStatus={fieldError?.field === "quantity" ? "error" : undefined} extra={<span id={id("quantity-hint")}>0 表示无产出。</span>}>
        <Input id={id("quantity")} required {...attributes("quantity", "quantity-hint")} aria-label="补录工作量" autoFocus inputMode="decimal" value={quantity} onChange={e => {setQuantity(e.target.value);clearError("quantity");}} />
      </Form.Item>
      <Form.Item label="起止时间（北京时间）" htmlFor={id("start")} required help={feedback("time")} validateStatus={fieldError?.field === "time" ? "error" : undefined}>
        <Space wrap style={{ width: "100%" }}>
          <DatePicker id={id("start")} aria-required {...attributes("time")} aria-label="补录开始时间" value={range?.[0]} onChange={value => {setRange([value, range?.[1] ?? null]);clearError("time");}}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="开始时间" minDate={dayjs("1970-01-01")} />
          <span>至</span>
          <DatePicker id={id("end")} aria-required {...attributes("time")} aria-label="补录结束时间" value={range?.[1]} onChange={value => {setRange([range?.[0] ?? null, value]);clearError("time");}}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="结束时间" minDate={dayjs("1970-01-01")} />
        </Space>
      </Form.Item>
      <Form.Item label="扣除休息分钟数" htmlFor={id("rest")} help={feedback("rest")} validateStatus={fieldError?.field === "rest" ? "error" : undefined} extra={<span id={id("rest-hint")}>不填按 0 分钟计算，可填写小数。</span>}>
        <Input id={id("rest")} {...attributes("rest", "rest-hint")} aria-label="扣除休息分钟数" inputMode="decimal" value={rest} onChange={e => {setRest(e.target.value);clearError("rest");}} />
      </Form.Item>
      <Form.Item label="备注" htmlFor={id("remark")} help={feedback("remark")} validateStatus={fieldError?.field === "remark" ? "error" : undefined} extra={<span id={id("remark-hint")}>最多 2000 个字符。</span>}>
        <Input.TextArea id={id("remark")} {...attributes("remark", "remark-hint")} aria-label="补录备注" value={remark} onChange={e => {setRemark(e.target.value);clearError("remark");}} rows={3} />
      </Form.Item>
      <Typography.Paragraph>有效工时：<strong>{preview}</strong></Typography.Paragraph>
      {!online && <Alert type="warning" showIcon title="本机连接已中断，请恢复连接后保存。" />}
      {error && <div ref={summary} role="group" tabIndex={-1} className="dc-error-summary" aria-label="补录校验错误">
        <Alert type="error" showIcon title={error} action={fieldError?.field === "time" ? <Button onClick={() => document.getElementById(id("start"))?.focus()}>检查起止时间</Button> : undefined} />
      </div>}
    </Form>
  </Modal>;
}
