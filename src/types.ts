export const CATEGORIES = ["评测", "质检", "开发", "文档"] as const;

export interface WorkRecord {
  id: number;
  category: string;
  quantity: number | null;
  remark: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  duration_ms: number;
  status: "NOT_STARTED" | "WORKING" | "FINISHED";
  is_paused: boolean;
  recovery_pending: boolean;
  settlement_status: "IN_PROGRESS" | "PENDING" | "COMPLETE";
  source: "AUTO" | "MANUAL_START" | "MANUAL_ENTRY";
  pause_reason: "MANUAL" | "APP_CLOSE" | "RECOVERY" | "AWAY" | "MONITOR" | null;
  confirmed_end_time: number | null;
  last_input_time: number | null;
  end_reason: string | null;
  legacy_duration_ms: number;
  revision: number;
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
  pending_count: number;
}

export interface StartInput {
  category: string;
  quantity: number | null;
  remark: string;
}

export interface SettleInput {
  id: number;
  expected_revision: number;
  category: string;
  quantity: number;
  remark: string;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatTime(milliseconds: number): string {
  return new Date(milliseconds).toLocaleString("zh-CN", { hour12: false });
}
