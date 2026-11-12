import { validateWorkInput } from "../workInput.ts";

export type ManualEntry = {
  request_id: string;
  category: string;
  quantity: number;
  remark: string;
  start_time: number;
  end_time: number;
  duration_ms: number;
};
export function validateManualEntry(
  requestId: string, category: string, quantity: string, remark: string,
  start: number, end: number, restMinutes: string, now = Date.now(),
): { ok: true; input: ManualEntry } | { ok: false; error: string } {
  const work = validateWorkInput(category, quantity, remark, true);
  if (!work.ok) return { ok: false, error: Object.values(work.errors)[0]! };
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end <= start)
    return { ok: false, error: "请选择有效的起止时间，结束时间须晚于开始时间。" };
  if (end > now) return { ok: false, error: "不能补录未来的工作时间。" };
  const text = restMinutes.trim();
  const rest = text === "" ? 0 : Number(text);
  if ((text !== "" && !/^\d+(?:\.\d+)?$/.test(text)) || !Number.isFinite(rest)
    || rest < 0 || rest * 60_000 > end - start)
    return { ok: false, error: "休息分钟数须大于或等于 0，且不能超过起止时间跨度。" };
  return { ok: true, input: {
    request_id: requestId, category: work.input.category, quantity: work.input.quantity!,
    remark: work.input.remark, start_time: start, end_time: end,
    duration_ms: Math.round(end - start - rest * 60_000),
  } };
}
