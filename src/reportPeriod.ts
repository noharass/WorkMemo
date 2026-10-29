import { localDate } from "./history.ts";

export type ReportPeriod = "day" | "week" | "month" | "custom";
export interface ReportRange {
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  trend_unit: "hour" | "day" | "month";
}
export function shiftPeriod(period: ReportPeriod, anchor: string, direction: number): string | null {
  const date = new Date(`${anchor}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || period === "custom") return null;
  if (period === "month") { date.setDate(1); date.setMonth(date.getMonth() + direction); }
  else date.setDate(date.getDate() + direction * (period === "week" ? 7 : 1));
  return date.getFullYear() >= 1970 && date.getFullYear() <= 9999 ? localDate(date) : null;
}
export function reportRangeLabel(range: ReportRange): string {
  if (range.period === "day") return range.start_date?.replace(/-/g, ".") ?? "今天";
  if (range.period === "month") return range.start_date ? range.start_date.slice(0, 7).replace("-", " 年 ") + " 月" : "本月";
  return `${range.start_date ?? "最早记录"} — ${range.end_date ?? "至今"}`;
}
