import type { WorkRecord } from "../types";
import type { CategoryNames } from "../categoryNames";
import type { Presentation } from "../desktopPreferences";
import type { ReportPeriod, ReportRange } from "../reportPeriod";

export type Row = WorkRecord & { is_demo: boolean; demo_batch: string | null };
export type Query = {
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  scope: "real" | "demo" | "all";
  status: string;
  page: number;
};
export type CategoryTotal = {
  category: string;
  duration_ms: number;
  quantity: number;
  records: number;
  complete: number;
  pending: number;
};
export type Data = {
  range: ReportRange;
  totals: {
    duration_ms: number;
    quantity: number;
    records: number;
    pending: number;
  };
  trend: {
    date: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  monthly: boolean;
  categories: CategoryTotal[];
  calendar: [string, number][];
  records: Row[];
  record_count: number;
  page: number;
  pages: number;
  scope: string;
};
export type Detail = {
  record: Row;
  segments: {
    id: number;
    start_time: number;
    end_time: number | null;
    duration_ms: number;
    state: string;
  }[];
  revisions: {
    revision: number;
    changed_at: number;
    before: WorkRecord;
    after: WorkRecord;
  }[];
};
export type Meta = {
  version: string;
  category_names: CategoryNames;
  presentation: Presentation;
  active: WorkRecord | null;
};
export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}
const entry = new URLSearchParams(location.hash.slice(1));
const incoming = entry.get("token");
if (incoming) {
  sessionStorage.setItem("workmemo-token", incoming);
  history.replaceState(null, "", location.pathname + location.search);
}
const sessionToken = incoming ?? sessionStorage.getItem("workmemo-token") ?? "";
export function initialQuery(): Query {
  const pending = entry.get("view") === "pending";
  return {
    period: pending ? "custom" : "day",
    anchor_date: null,
    start_date: null,
    end_date: null,
    category: null,
    scope: entry.get("scope") === "demo" ? "demo" : "real",
    status: pending ? "pending" : "all",
    page: 1,
  };
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  if (!sessionToken)
    throw new ApiError("请从 WorkMemo 打开数据中心，以建立本机连接。", 403);
  try {
    const response = await fetch(`/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(8000),
    });
    let result: T & { error?: string };
    try {
      result = await response.json();
    } catch {
      throw new ApiError(
        "连接授权已失效，请从 WorkMemo 重新打开数据中心。",
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiError(result.error ?? "操作未完成。", response.status);
    return result;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "与 WorkMemo 的连接已中断。请保持软件在后台运行，再刷新连接。",
    );
  }
}
