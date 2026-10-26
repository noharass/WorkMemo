import { CATEGORIES, type WorkRecord } from "./types.ts";

export interface HistoryQuery {
  start_date: string;
  end_date: string;
  category: string | null;
  page: number;
}
export interface Totals { records: number; quantity: number; duration_ms: number; pending_records: number }
export interface HistoryPage {
  records: WorkRecord[];
  page: number;
  page_size: number;
  overview: Totals;
  filtered: Totals;
  daily: { date: string; totals: Totals }[];
  categories: { category: string; totals: Totals }[];
}

export function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function defaultHistoryQuery(today = new Date()): HistoryQuery {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  start.setDate(start.getDate() - 29);
  return { start_date: localDate(start), end_date: localDate(today), category: null, page: 1 };
}

function dateDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  if (year < 1970 || year > 9999) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date.getTime() / 86_400_000;
}

export function historyQueryError(query: HistoryQuery): string {
  const start = dateDay(query.start_date);
  const end = dateDay(query.end_date);
  if (start === null || end === null || start > end) return "请选择有效日期，开始日期不能晚于结束日期。";
  if (end - start > 365) return "单次查询最多 366 天，请缩小日期范围。";
  if (query.category !== null && !CATEGORIES.some((category) => category === query.category)) return "请选择有效的工作类别。";
  if (!Number.isInteger(query.page) || query.page < 1 || query.page > 4_294_967_295) return "页码无效，请重新查询。";
  return "";
}

export function formatQuantity(quantity: number | null): string {
  if (quantity === null) return "待填写";
  return quantity.toLocaleString("zh-CN", { maximumSignificantDigits: 12 });
}
