import { CATEGORIES, type StartInput } from "./types.ts";

export type InputErrors = Partial<Record<keyof StartInput, string>>;
type Validation = { ok: true; input: StartInput } | { ok: false; errors: InputErrors };

export function validateWorkInput(category: string, quantity: string, remark: string): Validation {
  const errors: InputErrors = {};
  if (!CATEGORIES.some((value) => value === category)) errors.category = "请选择工作类别。";
  const text = quantity.trim();
  const amount = Number(text);
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)
    || !Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
    errors.quantity = "请输入大于 0、且不超过 10 亿的数量。";
  }
  if (Array.from(remark.trim()).length > 2000) errors.remark = "备注不能超过 2000 个字符。";
  return Object.keys(errors).length ? { ok: false, errors }
    : { ok: true, input: { category, quantity: amount, remark: remark.trim() } };
}
