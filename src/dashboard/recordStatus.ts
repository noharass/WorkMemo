import type { WorkRecord } from "../types";

/** Record lifecycle and timer state are separate; suspended work is never counting. */
export function recordStatusLabel(row: Pick<WorkRecord, "status" | "is_paused" | "recovery_pending" | "settlement_status">): string {
  if (row.status === "FINISHED")
    return row.settlement_status === "PENDING" ? "待补全" : "已确认";
  if (row.status === "SUSPENDED") return "已挂起";
  if (row.status === "NOT_STARTED") return "未开始";
  if (row.recovery_pending) return "待恢复";
  return row.is_paused ? "已暂停" : "计时中";
}
