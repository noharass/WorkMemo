import { useEffect, useRef, useState } from "react";
import { Alert, App, Button, DatePicker, Form, Input, Modal, Select, Space, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { CATEGORIES, formatDuration } from "../types";
import { useCategoryNames } from "../categoryNames";
import { api, type Detail } from "./api";
import { validateManualEntry } from "./manualEntry";

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
  useEffect(() => { setError(""); }, [category, quantity, remark, rest, start, end]);
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
    modal.confirm({
      title: "放弃这次补记录？",
      content: "未确认保存的输入将被放弃。若刚才连接中断，请先原样重试或刷新明细核对。",
      okText: "放弃补录", cancelText: "继续填写", autoFocusButton: "cancel",
      onOk: onClose,
      afterClose: () => { confirming.current = false; },
    });
  }
  async function save() {
    if (!online || saving.current || confirming.current) return;
    const result = validateManualEntry(requestId, category, quantity, remark, start, end, rest);
    if (!result.ok) { setError(result.error); return; }
    saving.current = true; setBusy(true); setError("");
    try {
      const saved = await api<Detail>("manual-entry", result.input);
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "补记录未完成，请保留输入后重试。");
    } finally { saving.current = false; setBusy(false); }
  }
  return <Modal open title="补记录" onCancel={close} centered width={560} className="dc-manual-entry"
    mask={{ closable: false }} keyboard={!busy} closable={!busy}
    styles={{ body: { maxHeight: "calc(100dvh - 220px)", overflowY: "auto" } }}
    footer={<Space wrap>
      <Button disabled={busy} onClick={close}>取消</Button>
      <Button type="primary" aria-label="保存补录" aria-busy={busy} loading={busy} disabled={!online || busy} onClick={() => void save()}>保存补录</Button>
    </Space>}>
    <p>补录已完成的工作，保存后计入统计，并标记为「人工补录」。</p>
    <Form layout="vertical" disabled={busy} onFinish={() => void save()}>
      <Form.Item label="工作类别" required>
        <Select aria-label="补录类别" value={category} onChange={setCategory}
          options={CATEGORIES.map(value => ({ value, label: name(value) }))} />
      </Form.Item>
      <Form.Item label="工作量" required extra="0 表示无产出。">
        <Input aria-label="补录工作量" autoFocus inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)} />
      </Form.Item>
      <Form.Item label="起止时间（北京时间）" required>
        <Space wrap style={{ width: "100%" }}>
          <DatePicker aria-label="补录开始时间" value={range?.[0]} onChange={value => setRange([value, range?.[1] ?? null])}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="开始时间" minDate={dayjs("1970-01-01")} />
          <span>至</span>
          <DatePicker aria-label="补录结束时间" value={range?.[1]} onChange={value => setRange([range?.[0] ?? null, value])}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="结束时间" minDate={dayjs("1970-01-01")} />
        </Space>
      </Form.Item>
      <Form.Item label="扣除休息（分钟）" extra="不填按 0 分钟计算，可填写小数。">
        <Input aria-label="扣除休息分钟数" inputMode="decimal" value={rest} onChange={e => setRest(e.target.value)} />
      </Form.Item>
      <Form.Item label="备注">
        <Input.TextArea aria-label="补录备注" value={remark} onChange={e => setRemark(e.target.value)} rows={3} />
      </Form.Item>
      <Typography.Paragraph>有效工时：<strong>{preview}</strong></Typography.Paragraph>
      {!online && <Alert type="warning" showIcon title="本机连接已中断，请恢复连接后保存。" />}
      {error && <Alert type="error" showIcon title={error} />}
    </Form>
  </Modal>;
}
