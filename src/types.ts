export const CATEGORIES = ["评测", "质检", "开发", "文档"] as const;

export interface WorkRecord {
  id: number;
  category: string;
  quantity: number;
  remark: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  duration_ms: number;
  status: "NOT_STARTED" | "WORKING" | "FINISHED";
  is_paused: boolean;
  recovery_pending: boolean;
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
}

export interface StartInput {
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
