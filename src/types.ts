export const CATEGORIES = ["评测", "质检", "开发", "文档"] as const;

export type Category = (typeof CATEGORIES)[number];

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
  pause_reason: "MANUAL" | "APP_CLOSE" | "RECOVERY" | "AWAY" | "MONITOR" | "IDLE_PAUSE" | null;
  confirmed_end_time: number | null;
  last_input_time: number | null;
  end_reason: string | null;
  legacy_duration_ms: number;
  revision: number;
  control_mode: "AUTO" | "MANUAL";
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
  pending_count: number;
  monitoring: MonitorStatus;
}

export interface StartInput {
  category: string;
  quantity: number | null;
  remark: string;
}

export interface MonitorStatus {
  browsing_only:boolean;
  browse_ready:boolean;
  browse_category:string|null;
  start_candidate:{id:number;rule_id:number;category:string}|null;
  enabled: boolean;
  browser_connected: boolean;
  native_available: boolean;
  work_page: boolean;
  idle_warning: boolean;
  message: string;
  revision: number;
  idle_pause_seconds: number;
  idle_warning_seconds: number;
  idle_end_seconds: number;
  away_pause_remaining_seconds: number | null;
}
export interface WorkUrl { id: number; url_prefix: string; category: string; match_mode: "path_prefix" | "origin" | "domain_suffix" }
export interface TrackingTimes { idle_pause_seconds: number; idle_warning_seconds: number; idle_end_seconds: number; away_pause_seconds: number; hold_seconds: number }
export interface MonitorConfig { enabled: boolean; revision: number; rules: WorkUrl[]; times: TrackingTimes; poll_interval_seconds: number; auto_resume_manual: boolean }
export interface WorkNotice { kind: "idle" | "ended"; record: WorkRecord; idle_warning_seconds: number; idle_end_seconds: number }

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
