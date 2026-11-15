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
  manual_entry?: boolean;
  category_names: CategoryNames;
  presentation: Presentation;
  active: WorkRecord | null;
};
export class ApiError extends Error {
  status: number;
  kind: "business" | "auth" | "unavailable" | "timeout" | "network" | "invalid-response";
  constructor(
    message: string,
    status = 0,
    kind: ApiError["kind"] = status === 0 ? "network" : "business",
  ) {
    super(message);
    this.status = status;
    this.kind = kind;
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
export async function api<T>(path: string, body?: unknown, options: { signal?: AbortSignal } = {}): Promise<T> {
  if (!sessionToken)
    throw new ApiError("请从 WorkMemo 打开数据中心，以建立本机连接。", 403, "auth");
  // Forward cancellation without relying on AbortSignal.any in older WebViews.
  // Only effect-owned reads supply a signal; writes are never cancelled by a refresh.
  const timeout = AbortSignal.timeout(8000);
  const controller = new AbortController();
  const signal = options.signal;
  const abort = () => controller.abort(signal?.aborted ? signal.reason : timeout.reason);
  timeout.addEventListener("abort", abort, { once: true });
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) abort();
  const uncertainWrite = body !== undefined && path !== "query" && path !== "detail"
    ? "操作结果可能尚未确认，请保留输入，恢复连接后核对或原样重试。"
    : "请稍后刷新连接。";
  try {
    const response = await fetch(`/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
    });
    let result: unknown;
    try {
      if (response.headers.get("content-type")?.includes("json")) result = await response.json();
    } catch {
      // An HTTP failure can legitimately be plain text (e.g. the Rust 503 busy).
      // Body timeouts/cancellations still take the transport path below.
      if (controller.signal.aborted) throw controller.signal.reason;
    }
    if (response.status === 401 || response.status === 403)
      throw new ApiError("连接授权已失效，请从 WorkMemo 重新打开数据中心。", response.status, "auth");
    if (response.status === 503)
      throw new ApiError("WorkMemo 正忙，请稍后刷新连接。", 503, "unavailable");
    if (response.status === 408 || response.status === 504)
      throw new ApiError(`请求超时，${uncertainWrite}`, response.status, "timeout");
    if (!response.ok) {
      const error = result && typeof result === "object" && "error" in result && typeof result.error === "string"
        ? result.error : `操作未完成（HTTP ${response.status}），请稍后重试。`;
      throw new ApiError(error, response.status, response.status >= 500 ? "unavailable" : "business");
    }
    if (!result || typeof result !== "object" || Array.isArray(result))
      throw new ApiError(`WorkMemo 返回的数据格式异常，${uncertainWrite}`, response.status, "invalid-response");
    return result as T;
  } catch (e) {
    if (signal?.aborted) throw signal.reason;
    if (timeout.aborted) throw new ApiError(`请求超时，${uncertainWrite}`, 0, "timeout");
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      `与 WorkMemo 的连接已中断。请保持软件在后台运行。${uncertainWrite}`,
    );
  } finally {
    timeout.removeEventListener("abort", abort);
    signal?.removeEventListener("abort", abort);
  }
}
