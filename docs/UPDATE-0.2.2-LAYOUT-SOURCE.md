# 总览网格重新排版：完整源码

以下为本轮三个实现／验证文件完整代码；文件清单、命令、测试与兼容性见 UPDATE-0.2.2-LAYOUT.md。

## E:/WorkMemo/src/Dashboard.tsx

~~~~~~~~text
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { init, use as registerCharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ECharts, EChartsOption } from "echarts";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type WorkRecord,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  DEFAULT_PRESENTATION,
  WorkBadge,
  type Presentation,
} from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import "./Dashboard.css";

function Modal({
  children,
  label,
  onClose,
  drawer = false,
}: {
  children: React.ReactNode;
  label: string;
  onClose: () => void;
  drawer?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`dc-modal ${drawer ? "dc-drawer-modal" : "dc-confirm-modal"}`}
      aria-labelledby={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
type Row = WorkRecord & { is_demo: boolean; demo_batch: string | null };
type Query = {
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  scope: "real" | "demo" | "all";
  status: string;
  page: number;
};
type Data = {
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
  categories: {
    category: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  calendar: [string, number][];
  records: Row[];
  page: number;
  pages: number;
  scope: string;
};
type Detail = {
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
type Meta = {
  version: string;
  presentation: Presentation;
  active: WorkRecord | null;
};
class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}
const entry = new URLSearchParams(location.hash.slice(1));
const incoming = entry.get("token");
if (incoming) {
  sessionStorage.setItem("workmemo-token", incoming);
  history.replaceState(null, "", location.pathname + location.search);
}
const sessionToken = incoming ?? sessionStorage.getItem("workmemo-token") ?? "";
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDate(d);
}
function initialQuery(): Query {
  const view = entry.get("view");
  return {
    start_date: view === "pending" ? null : daysAgo(view === "today" ? 0 : entry.get("scope")==="demo"?89:29),
    end_date: view === "pending" ? null : daysAgo(0),
    category: null,
    scope: entry.get("scope") === "demo" ? "demo" : "real",
    status: view === "pending" ? "pending" : "all",
    page: 1,
  };
}
async function api<T>(path: string, body?: unknown): Promise<T> {
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
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        "连接授权已失效，请从 WorkMemo 重新打开数据中心。",
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiError(
        (data as { error?: string }).error ?? "操作未完成。",
        response.status,
      );
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "与 WorkMemo 的连接已中断。请保持软件在后台运行，再刷新连接。",
    );
  }
}
function Chart({
  option,
  label,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  onCategory?: (name: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const click = useRef(onCategory);
  click.current = onCategory;
  useEffect(() => {
    if (!node.current) return;
    const instance = init(node.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (p) => {
      if (typeof p.name === "string") click.current?.(p.name);
    });
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const host = node.current;
        if (host && (instance.getWidth() !== host.clientWidth || instance.getHeight() !== host.clientHeight)) {
          instance.resize();
        }
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);
  return <div ref={node} role="img" aria-label={label} className="dc-chart" />;
}
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  textStyle: { color: "#1e293b" },
  extraCssText: "",
};
function statusName(row: Row) {
  return row.status === "WORKING"
    ? "进行中"
    : row.settlement_status === "PENDING"
      ? "待补全"
      : "已确认";
}
export default function Dashboard() {
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [range, setRange] = useState(
    entry.get("view") === "today"
      ? "today"
      : entry.get("view") === "pending"
        ? "all"
        : entry.get("scope")==="demo"?"90":"30",
  );
  const [data, setData] = useState<Data | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) { quantityInput.current?.focus(); quantityInput.current?.scrollIntoView({block:"nearest"}); } }, [editing]);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [guard, setGuard] = useState(false);
  const next = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  useEffect(() => {
    let stopped = false;
    let reading = false;
    async function load() {
      if (reading) return;
      reading = true;
      try {
        const metadata = await api<Meta>("meta");
        if (stopped) return;
        setMeta(metadata);
        setOnline(true);
        {
          const rows = await api<Data>("query", query);
          if (!stopped) {
            setData(rows);
            setError("");
          }
        }
      } catch (e) {
        if (!stopped) {
          setError(String(e instanceof Error ? e.message : e));
          if (!(e instanceof ApiError) || e.status === 0 || e.status === 403)
            setOnline(false);
        }
      } finally {
        reading = false;
        if (!stopped) setLoading(false);
      }
    }
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 2000);
    const focus = () => {
      void load();
    };
    window.addEventListener("focus", focus);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [query, refresh]);
  function selectRange(value: string) {
    setRange(value);
    const n = value === "today" ? 0 : Number(value) - 1;
    const update = {
      ...filters,
      start_date: value === "all" ? null : daysAgo(n),
      end_date: value === "all" ? null : daysAgo(0),
      page: 1,
    };
    setFilters(update);
    setQuery(update);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current) return;
    const action = async () => {
      busyRef.current = true;
      setBusy(true);
      setEditorError("");
      try {
        const value = await api<Detail>("detail", { id: row.id });
        setDetail(value);
        setFields({
          category: value.record.category,
          quantity:
            value.record.quantity === null ? "" : String(value.record.quantity),
          remark: value.record.remark,
        });
        setEditing(edit && value.record.status === "FINISHED");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    };
    if (dirty) {
      next.current = () => {
        void action();
      };
      setGuard(true);
    } else await action();
  }
  function leave(action: () => void) {
    if (busyRef.current) return;
    if (dirty) {
      next.current = action;
      setGuard(true);
    } else action();
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setEditing(false);
      setFields({
        category: updated.record.category,
        quantity:
          updated.record.quantity === null
            ? ""
            : String(updated.record.quantity),
        remark: updated.record.remark,
      });
      setRefresh((v) => v + 1);
      return true;
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online]);
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && editing) {
        e.preventDefault();
        void save();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (guard) {
          setGuard(false);
          next.current = null;
        } else if (deleting && !busy) setDeleting(null);
        else if (detail) leave(() => setDetail(null));
      }
    }
    function unload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, guard, deleting, detail, editing, save, busy]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      if (detail?.record.id === deleting.id) {
        setDetail(null);
        setEditing(false);
      }
      setDeleting(null);
      setRefresh((v) => v + 1);
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const trend = useMemo<EChartsOption>(
    () => ({
      animationDuration: 300,
      tooltip: { ...tooltip, trigger: "axis" },
      legend: { top: 0, right: 12, data: ["工作量", "有效工时"] },
      grid: { left: 52, right: 52, top: 40, bottom: 28, containLabel: true },
      xAxis: {
        type: "category",
        data: data?.trend.map((x) => x.date) ?? [],
        axisLine: { lineStyle: { color: "#dbe3ec" } },
        axisLabel: { color: "#64748b", hideOverlap: true, showMinLabel: true, showMaxLabel: true, formatter: (value: string) => value.slice(5) },
      },
      yAxis: [
        {
          type: "value",
          name: "数量",
          splitLine: { lineStyle: { color: "#eef2f7" } },
          axisLabel: { color: "#64748b" },
        },
        {
          type: "value",
          name: "小时",
          splitLine: { show: false },
          axisLabel: { color: "#64748b" },
        },
      ],
      series: [
        {
          name: "工作量",
          type: "bar",
          data: data?.trend.map((x) => x.quantity) ?? [],
          barMaxWidth: 26,
          itemStyle: { color: "#335ed4", borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "有效工时",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 6,
          data:
            data?.trend.map((x) =>
              Number((x.duration_ms / 3600000).toFixed(2)),
            ) ?? [],
          lineStyle: { width: 3, color: "#19a798" },
          itemStyle: { color: "#19a798" },
        },
      ],
    }),
    [data],
  );
  const categoryOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 300,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: { left: 56, right: 22, top: 25, bottom: 28 },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f7" } } },
      yAxis: {
        type: "category",
        data: data?.categories.map((x) => x.category) ?? [],
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 24,
          data:
            data?.categories.map((x) => ({
              name: x.category,
              value:
                categoryMetric === "duration"
                  ? Number((x.duration_ms / 3600000).toFixed(2))
                  : x.quantity,
              itemStyle: {
                color: presentation.categories[x.category]?.color,
                borderRadius: [0, 5, 5, 0],
              },
            })) ?? [],
        },
      ],
    }),
    [data, categoryMetric, presentation],
  );
  const calendarOption = useMemo<EChartsOption>(() => {
    const end = query.end_date ?? daysAgo(0);
    const start = new Date(end + "T12:00:00");
    start.setDate(start.getDate() - 89);
    return {
      tooltip: {
        ...tooltip,
        formatter: (p: unknown) => {
          const point = (p as { value?: [string, number] }).value;
          return point
            ? `${point[0]}  ${(point[1] / 3600000).toFixed(2)} 小时`
            : "";
        },
      },
      visualMap: {
        type: "piecewise", show: false,
        pieces: [
          {value:0,color:"#ebedf0"},
          ...["#9be9a8","#40c463","#30a14e","#216e39"].map((color,index) => ({gt:index*Math.max(1,...(data?.calendar.map(v=>v[1])??[1]))/4,lte:(index+1)*Math.max(1,...(data?.calendar.map(v=>v[1])??[1]))/4,color})),
        ],
      },
      calendar: {
        range: [localDate(start), end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#64748b" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#94a3b8" },
        splitLine: { lineStyle: { color: "#dce4ef" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: data?.calendar ?? [],
        },
      ],
    };
  }, [data, query.end_date]);
  const totals = data?.totals;
  return (
    <div className="data-center">
      <aside className="dc-sidebar">
        <a className="dc-brand" href="/dashboard" aria-label="WorkMemo 工作数据中心" title="WorkMemo 工作数据中心">
          <img src="/workmemo.png" alt="" />
          <span>
            WorkMemo<small>工作数据中心</small>
          </span>
        </a>
        <div className="dc-side-label">WORKSPACE</div>
        <button
          className="dc-side-link selected" aria-label="工作总览" title="工作总览"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Icon name="chart" />
          <span className="dc-nav-label">工作总览</span>
        </button>
        <button
          className="dc-side-link" aria-label="工作明细" title="工作明细"
          onClick={() =>
            document
              .getElementById("records")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Icon name="list" />
          <span className="dc-nav-label">工作明细</span>
        </button>
        <div className="dc-sidebar-bottom">
          <span className={`connection-dot ${online ? "connected" : ""}`} />
          {online ? "本机连接正常" : "等待本机连接"}
          <small>
            记录保存在你的电脑中
            <br />v{meta?.version ?? "0.2.2"}
          </small>
        </div>
      </aside>
      <div className="dc-page">
        <header className="dc-topbar">
          <span>
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <button
            className="dc-button subtle"
            onClick={() => setRefresh((v) => v + 1)}
          >
            <Icon name="refresh" />
            刷新连接
          </button>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <h1>工作总览</h1>
              <p>工作量、有效工时和每一段记录，都在这里。</p>
            </div>

          </div>
          {query.scope !== "real" && (
            <div className="dc-demo-banner">
              <Icon name="bulb" />
              <span>
                {query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"}{" "}
                · 示例仅用于查看效果，日常真实统计默认排除。
              </span>
            </div>
          )}
          {error && (
            <div className="dc-error" role="alert">
              {error}
            </div>
          )}
          {meta?.active && (
            <div className="dc-active">
              <WorkBadge
                category={meta.active.category}
                presentation={presentation}
              />
              <span>
                {meta.active.is_paused ? "当前任务已暂停" : "当前任务正在计时"}{" "}
                · 结束后可在这里补填工作量
              </span>
            </div>
          )}
          <section className="dc-filters" aria-label="筛选工作数据">
            <div className="dc-ranges">
              {[
                ["today", "今天"],
                ["7", "近7天"],
                ["30", "近30天"],
                ["90", "近90天"],
                ["all", "全部"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={range === id}
                  className="dc-range"
                  onClick={() => selectRange(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery({ ...filters, page: 1 });
                setRange("custom");
              }}
            >
              <label>
                开始日期
                <input
                  type="date"
                  value={filters.start_date ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      start_date: e.target.value || null,
                    }))
                  }
                />
              </label>
              <span className="dc-date-separator">—</span>
              <label>
                结束日期
                <input
                  type="date"
                  value={filters.end_date ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      end_date: e.target.value || null,
                    }))
                  }
                />
              </label>
              <label>
                类别
                <select
                  value={filters.category ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      category: e.target.value || null,
                    }))
                  }
                >
                  <option value="">全部类别</option>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                状态
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待补全</option>
                  <option value="complete">已确认</option>
                  <option value="working">进行中</option>
                </select>
              </label>
            <label className="dc-scope">
              数据范围
              <select
                value={filters.scope}
                onChange={(e) => {
                  const updated = {
                    ...filters,
                    scope: e.target.value as Query["scope"],
                    page: 1,
                  };
                  setFilters(updated);
                  setQuery(updated);
                }}
              >
                <option value="real">真实数据</option>
                <option value="demo">演示数据</option>
                <option value="all">全部数据</option>
              </select>
            </label>
              <button type="submit" className="dc-button">
                <Icon name="search" />
                应用筛选
              </button>
            </form>
          </section>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals
                  ? `${(totals.duration_ms / 3600000).toFixed(1)}`
                  : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已确认工作量",
                value: totals ? formatQuantity(totals.quantity) : "—",
                unit: "",
                icon: "checkSquare" as const,
                caption: "仅汇总已确认的数量",
              },
              {
                label: "工作记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "当前筛选范围内的记录",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((k) => (
              <article className="dc-kpi" key={k.label}>
                <div>
                  <span>{k.label}</span>
                  <Icon name={k.icon} />
                </div>
                <strong>
                  {k.value}
                  <small>{k.unit}</small>
                </strong>
                <p>{k.caption}</p>
              </article>
            ))}
          </section>
          {loading && !data && (
            <p role="status" className="dc-loading">
              正在读取本机工作数据…
            </p>
          )}
          {data && data.totals.records === 0 && (
            <div className="dc-empty">
              <Icon name="clock" />
              <h2>这个范围里还没有记录</h2>
              <p>调整筛选，或回到 WorkMemo 开始一段工作。数据会自动更新。</p>
            </div>
          )}
          <section className="dc-chart-grid">
            <article className="dc-card dc-trend">
              <div className="dc-card-title">
                <div>
                  <h2>工作趋势</h2>
                  <p>
                    {data?.monthly ? "按月汇总" : "按日汇总"} · 工作量与有效工时
                  </p>
                </div>
                <span className="dc-chip">时间视角</span>
              </div>
              <Chart option={trend} label="工作量与有效工时趋势" />
            </article>
            <article className="dc-card dc-category">
              <div className="dc-card-title">
                <div>
                  <h2>类别分布</h2>
                  <p>点击类别条形可筛选</p>
                </div>
                <select
                  aria-label="类别统计指标"
                  value={categoryMetric}
                  onChange={(e) => setCategoryMetric(e.target.value)}
                >
                  <option value="duration">工时（小时）</option>
                  <option value="quantity">工作量</option>
                </select>
              </div>
              <Chart
                option={categoryOption}
                label="按类别汇总的工作分布"
                onCategory={(name) => {
                  if (CATEGORIES.some((c) => c === name)) {
                    const update = { ...query, category: name, page: 1 };
                    setQuery(update);
                    setFilters(update);
                  }
                }}
              />
            </article>
            <article className="dc-card dc-calendar">
            <div className="dc-card-title">
              <div>
                <h2>工作的节奏</h2>
                <p>所选结束日之前的90天 · 颜色深浅表示有效工时</p>
              </div>
            </div>
            <Chart option={calendarOption} label="近90天有效工时工作日历" />
            <div className="dc-heat-legend" aria-label="工时由少到多">少 {["#ebedf0","#9be9a8","#40c463","#30a14e","#216e39"].map(color=><i key={color} style={{background:color}}/>)} 多</div>
            </article>
          </section>
          <section className="dc-card dc-records" id="records">
            <div className="dc-card-title">
              <div>
                <h2>每一段工作，都有来处</h2>
                <p>查看计时区间、补填工作量，或回顾修正记录。</p>
              </div>
              <span className="dc-chip">{totals?.records ?? 0} 条记录</span>
            </div>
            <div className="dc-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>类别</th>
                    <th>开始时间</th>
                    <th>有效工时</th>
                    <th>工作量</th>
                    <th>状态</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.records.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <WorkBadge
                          category={row.category}
                          presentation={presentation}
                        />
                        {row.is_demo && (
                          <small className="demo-tag">演示</small>
                        )}
                      </td>
                      <td>{formatTime(row.start_time)}</td>
                      <td className="tabular">
                        {formatDuration(row.duration_ms / 1000)}
                      </td>
                      <td className="tabular">
                        {row.settlement_status === "COMPLETE"
                          ? formatQuantity(row.quantity)
                          : "待补填"}
                      </td>
                      <td>
                        <span
                          className={`dc-status ${row.settlement_status.toLowerCase()}`}
                        >
                          {statusName(row)}
                        </span>
                      </td>
                      <td className="dc-remark" title={row.remark}>
                        {row.remark || "—"}
                      </td>
                      <td>
                        <div className="dc-row-actions">
                          <button
                            onClick={() => {
                              void openDetail(row);
                            }}
                          >
                            详情
                          </button>
                          <button
                            disabled={
                              !online || busy || row.status !== "FINISHED"
                            }
                            onClick={() => {
                              void openDetail(row, true);
                            }}
                          >
                            {row.settlement_status === "PENDING"
                              ? "补填"
                              : "编辑"}
                          </button>
                          <button
                            className="danger"
                            disabled={
                              !online || busy || row.status !== "FINISHED"
                            }
                            onClick={() => {
                              setEditorError("");
                              setDeleting(row);
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="dc-pagination">
              <span>每页50条 · 共{data?.pages ?? 1}页</span>
              <div>
                <button
                  className="dc-button subtle"
                  disabled={!data || data.page <= 1}
                  onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
                >
                  <Icon name="left" />
                  上一页
                </button>
                <span>
                  {data?.page ?? 1} / {data?.pages ?? 1}
                </span>
                <button
                  className="dc-button subtle"
                  disabled={!data || data.page >= data.pages}
                  onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
                >
                  下一页
                  <Icon name="right" />
                </button>
              </div>
            </footer>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      {detail && (
        <Modal
          drawer
          label="detail-title"
          onClose={() => leave(() => setDetail(null))}
        >
          <section className="dc-drawer">
            <header>
              <div>
                <span className="dc-eyebrow">
                  WORK RECORD #{detail.record.id}
                </span>
                <h2 id="detail-title">
                  {editing ? "填写工作量" : "工作详情"}
                  {detail.record.is_demo && (
                    <span className="demo-tag">演示数据</span>
                  )}
                </h2>
              </div>
              <button
                className="dc-icon-button"
                aria-label="关闭工作详情"
                disabled={busy}
                onClick={() => leave(() => setDetail(null))}
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="dc-drawer-body">
              <div className="dc-record-summary">
                <WorkBadge
                  category={detail.record.category}
                  presentation={presentation}
                />
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <span>{statusName(detail.record)}</span>
              </div>
              <dl className="dc-detail-times">
                <div>
                  <dt>开始</dt>
                  <dd>{formatTime(detail.record.start_time)}</dd>
                </div>
                <div>
                  <dt>结束</dt>
                  <dd>
                    {detail.record.end_time
                      ? formatTime(detail.record.end_time)
                      : "尚未结束"}
                  </dd>
                </div>
              </dl>
              {editing ? (
                <form
                  id="dc-editor"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save();
                  }}
                >
                  <label>
                    工作类别
                    <select
                      disabled={busy}
                      value={fields.category}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    工作量
                    <input
                      disabled={busy}
                      ref={quantityInput}
                      type="number"
                      min={0}
                      max={1e9}
                      step="any"
                      placeholder="0表示无产出"
                      value={fields.quantity}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, quantity: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    备注
                    <textarea
                      disabled={busy}
                      maxLength={4000}
                      rows={5}
                      value={fields.remark}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, remark: e.target.value }))
                      }
                    />
                  </label>
                  <p className="dc-muted">
                    这里修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                  </p>
                </form>
              ) : (
                <>
                  <div className="dc-detail-quantity">
                    <span>已确认工作量</span>
                    <strong>
                      {detail.record.settlement_status === "COMPLETE"
                        ? formatQuantity(detail.record.quantity)
                        : "待补填"}
                    </strong>
                  </div>
                  <p className="dc-detail-remark">
                    {detail.record.remark || "未填写备注。"}
                  </p>
                </>
              )}
              {editorError && (
                <p className="dc-error" role="alert">
                  {editorError}
                </p>
              )}
              <details className="dc-audit">
                <summary>计时区间（{detail.segments.length}）</summary>
                {detail.segments.length === 0 ? (
                  <p className="dc-muted">
                    旧记录仅保留累计工时，没有可展示的区间。
                  </p>
                ) : (
                  detail.segments.map((s) => (
                    <div className="dc-segment" key={s.id}>
                      <span>
                        {formatTime(s.start_time)}
                        <br />
                        {s.end_time ? formatTime(s.end_time) : "计时中"}
                      </span>
                      <strong>{formatDuration(s.duration_ms / 1000)}</strong>
                    </div>
                  ))
                )}
              </details>
              <details className="dc-audit">
                <summary>修正记录（{detail.revisions.length}）</summary>
                {detail.revisions.length === 0 ? (
                  <p className="dc-muted">尚无修正。</p>
                ) : (
                  detail.revisions.map((r) => (
                    <div key={r.revision} className="dc-revision">
                      <strong>
                        第{r.revision}次 · {formatTime(r.changed_at)}
                      </strong>
                      <p>
                        {r.before?.category} → {r.after?.category} · 数量{" "}
                        {formatQuantity(r.before?.quantity)} →{" "}
                        {formatQuantity(r.after?.quantity)}
                      </p>
                      <p>
                        备注：{r.before?.remark || "未填"} →{" "}
                        {r.after?.remark || "未填"}
                      </p>
                    </div>
                  ))
                )}
              </details>
            </div>
            <footer>
              {dirty && <span className="dc-unsaved">有未保存修改</span>}
              {editing ? (
                <button
                  className="dc-button"
                  key="save-workload"
                  form="dc-editor"
                  type="submit"
                  disabled={busy || !online}
                >
                  {busy ? "正在保存…" : "保存工作量"}
                </button>
              ) : (
                <button
                  className="dc-button"
                  disabled={!online || detail.record.status !== "FINISHED"}
                  key="edit-workload"
                  type="button"
                  title={detail.record.status !== "FINISHED" ? "请先结束工作，再编辑工作量" : "编辑类别、数量和备注"}
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </button>
              )}
            </footer>
          </section>
        </Modal>
      )}
      {deleting && (
        <Modal
          label="delete-title"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <section className="dc-confirm">
            <h2 id="delete-title">删除这条记录？</h2>
            <p>
              {deleting.category} · {formatTime(deleting.start_time)}
              {deleting.is_demo ? " · 演示数据" : ""}
            </p>
            <p>删除后不可撤销，计时区间和修正记录也会一同删除。</p>
            {editorError && <p className="dc-error">{editorError}</p>}
            <div>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => setDeleting(null)}
              >
                取消
              </button>
              <button
                className="dc-button danger-fill"
                disabled={busy || !online}
                onClick={() => {
                  void remove();
                }}
              >
                {busy ? "正在删除…" : "确认删除"}
              </button>
            </div>
          </section>
        </Modal>
      )}
      {guard && (
        <Modal
          label="unsaved-title"
          onClose={() => {
            if (!busy) {
              setGuard(false);
              next.current = null;
            }
          }}
        >
          <section className="dc-confirm">
            <h2 id="unsaved-title">保留未保存的修改？</h2>
            <p>保存成功后再离开；保存失败会保留输入。</p>
            {editorError && <p className="dc-error">{editorError}</p>}
            <div>
              <button
                className="dc-button"
                disabled={busy || !online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      setGuard(false);
                      const action = next.current;
                      next.current = null;
                      action?.();
                    }
                  });
                }}
              >
                保存并继续
              </button>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => {
                  setGuard(false);
                  setEditing(false);
                  const action = next.current;
                  next.current = null;
                  action?.();
                }}
              >
                放弃修改
              </button>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => {
                  setGuard(false);
                  next.current = null;
                }}
              >
                继续编辑
              </button>
            </div>
          </section>
        </Modal>
      )}
    </div>
  );
}

~~~~~~~~

## E:/WorkMemo/src/Dashboard.css

~~~~~~~~text
body:has(.data-center) {
  overflow: auto;
  background: #f5f7fb;
}
.data-center {
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
  color: #263449;
  background: #f5f7fb;
  min-height: 100vh;
  --accent: #335ed4;
  --on-accent: #fff;
  --accent-text: #335ed4;
  --text-muted: #64748b;
  --line: #e2e8f0;
  --control-radius: 9px;
  --input-rgb: 255 255 255;
  --button-shadow: none;
  --error: #b42332;
  --error-background: #fff0f1;
  --text-primary: #263449;
}
.data-center * {
  box-sizing: border-box;
}
.data-center button,
.data-center input,
.data-center select,
.data-center textarea {
  font: inherit;
}
.data-center button {
  width: auto;
  justify-content: center;
  gap: 7px;
  padding: 9px 14px;
  box-shadow: none;
  border: 1px solid transparent;
  border-radius: 8px;
  line-height: 1.5;
  background: #335ed4;
  color: #fff;
}
.data-center button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.data-center button:hover:not(:disabled) {
  background: #294eb7;
}
.data-center button:focus-visible,
.data-center input:focus-visible,
.data-center select:focus-visible,
.data-center textarea:focus-visible {
  outline: 3px solid #adc2ff;
  outline-offset: 2px;
}
.data-center input,
.data-center select,
.data-center textarea {
  margin: 0;
  padding: 9px 11px;
  border: 1px solid #dce3ed;
  background: #fff;
  color: #263449;
  border-radius: 8px;
  line-height: 1.5;
}
.data-center label {
  font-size: 12px;
  color: #64748b;
  display: grid;
  gap: 5px;
}
.data-center a {
  color: #335ed4;
  text-decoration: none;
}
.data-center p {
  margin: 0;
}
.data-center h1,
.data-center h2,
.data-center h3 {
  margin: 0;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 17px;
  color: #1e293b;
  font-weight: 650;
}
.data-center .icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
}
.data-center table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-center th {
  font-size: 11px;
  font-weight: 600;
  color: #7b899d;
  background: #f8fafd;
  text-align: left;
  padding: 9px 14px;
  border-block: 1px solid #edf1f6;
  white-space: nowrap;
}
.data-center td {
  padding: 10px 14px;
  border-bottom: 1px solid #edf1f6;
  vertical-align: middle;
}
.data-center tbody tr:hover {
  background: #fafcff;
}
.data-center .work-badge {
  font-size: 13px;
  font-weight: 600;
  gap: 7px;
  white-space: nowrap;
}
.data-center .work-symbol {
  width: 28px;
  height: 28px;
}
.data-center .work-symbol .icon {
  font-size: 15px;
}
.dc-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 64px;
  background: #13223a;
  color: #c8d2e3;
  display: flex;
  flex-direction: column;
  padding: 32px 18px;
  z-index: 5;
}
.dc-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 36px;
  color: #fff !important;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: -0.5px;
}
.dc-brand img {
  width: 38px;
  height: 38px;
}
.dc-brand small {
  display: block;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  color: #9aaac2;
  margin-top: 7px;
}
.dc-side-label {
  font-size: 9px;
  letter-spacing: 2px;
  color: #72849f;
  padding: 0 14px;
  margin: 5px 0 13px;
}
.data-center button.dc-side-link {
  width: 100%;
  justify-content: flex-start;
  gap: 12px;
  background: transparent;
  color: #9fadc3;
  padding: 12px 16px;
  border-radius: 9px;
  margin-bottom: 7px;
  font-size: 13px;
}
.data-center button.dc-side-link.selected,
.data-center button.dc-side-link:hover {
  color: #eef3ff;
  background: #243c61;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding: 20px 12px 0;
  font-size: 11px;
  color: #91a3bd;
}
.dc-sidebar-bottom small {
  display: block;
  font-size: 10px;
  line-height: 1.9;
  color: #7084a0;
  margin-top: 13px;
}
.connection-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #b9815c;
  margin-right: 7px;
}
.connection-dot.connected {
  background: #4dd4ae;
}
.dc-page {
  margin-left: 64px;
}
.dc-topbar {
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #e5eaf2;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475569;
  font-size: 12px;
}
.dc-topbar > span > span {
  color: #9aa5b5;
  margin-left: 16px;
}
.dc-main {
  max-width: 1440px;
  margin: auto;
  padding: 20px 20px 0;
}
.dc-heading {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-bottom: 12px;
}
.dc-eyebrow {
  color: #7c8ca4;
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 2.2px;
  margin-bottom: 8px !important;
}
.dc-heading h1 {
  font-size: 28px;
  font-weight: 650;
  color: #17263e;
  margin-bottom: 8px;
}
.dc-heading p:not(.dc-eyebrow) {
  font-size: 12px;
  color: #8190a5;
}
.dc-scope {
  min-width: 160px;
}
.dc-demo-banner,
.dc-active {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid #ead6a4;
  background: #fff9e9;
  border-radius: 10px;
  color: #8e6728;
  font-size: 12px;
  margin-bottom: 18px;
}
.dc-active {
  background: #edf8f4;
  border-color: #cfe9df;
  color: #447c67;
}
.dc-error {
  padding: 12px 15px;
  color: #a3293a;
  background: #fff0f2;
  border: 1px solid #f2cdd4;
  border-radius: 8px;
  margin: 12px 0 !important;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.dc-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
  width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  margin-bottom: 14px;
  padding: 12px 16px;
  box-shadow: 0 3px 15px #172f5803;
}
.dc-ranges {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 0;
}
.data-center button.dc-range {
  font-size: 12px;
  padding: 6px 13px;
  background: #fff;
  color: #718198;
}
.data-center button.dc-range[aria-pressed="true"] {
  color: #335ed4;
  background: #edf2ff;
  font-weight: 600;
}
.dc-filters form {
  display: flex;
  flex: 1 1 780px;
  min-width: 0;
  align-items: end;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filters label {
  flex: 1 1 100px;
  min-width: 100px;
}
.dc-filters label:has(input[type=date]) { flex-basis: 140px; }
.dc-filters label.dc-scope { min-width: 120px; }
.dc-filters input,.dc-filters select { width:100%; }
.dc-filters input {
  min-width: 140px;
}
.dc-filters select {
  min-width: 100px;
}
.dc-date-separator {
  display: none;
  color: #b3bcc9;
  align-self: flex-end;
  padding-bottom: 10px;
}
.data-center .dc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 37px;
  background: #335ed4;
  color: #fff;
  border: 1px solid #335ed4;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
}
.data-center .dc-button.subtle {
  background: #fff;
  color: #64748b;
  border-color: #dce4ef;
}
.data-center .dc-button.subtle:hover {
  background: #f7f9fd;
}
.dc-filters .dc-button {
  flex: 0 0 auto;
  margin-left: 0;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.dc-kpi {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  padding: 14px 16px;
}
.dc-kpi > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #6f7f95;
}
.dc-kpi .icon {
  color: #8da4cc;
  font-size: 17px;
}
.dc-kpi > strong {
  display: block;
  font-size: 26px;
  line-height: 1.7;
  font-weight: 650;
  color: #1b2c47;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
  overflow-wrap: anywhere;
}
.dc-kpi > strong small {
  font-size: 11px;
  font-weight: 400;
  color: #8b98aa;
  margin-left: 7px;
  letter-spacing: 0;
}
.dc-kpi p {
  font-size: 10px;
  color: #93a0b2;
}
.dc-card {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  min-width: 0;
  overflow: hidden;
}
.dc-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 14px 16px 8px;
}
.dc-card-title p {
  color: #94a0b1;
  font-size: 11px;
  margin-top: 5px;
}
.dc-card-title select {
  font-size: 11px;
  max-width: 130px;
  padding: 5px 8px;
}
.dc-chip {
  font-size: 9px;
  letter-spacing: 0.5px;
  color: #8f9db0;
  border: 1px solid #e8edf5;
  border-radius: 5px;
  padding: 4px 8px;
  white-space: nowrap;
}
.dc-chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  grid-template-areas: "trend category" "trend calendar";
  align-items: stretch;
  gap: 12px;
  margin-bottom: 14px;
}
.dc-trend { grid-area:trend; display:flex; flex-direction:column; }
.dc-category { grid-area:category; }
.dc-trend .dc-chart { flex:1 1 0; height:auto; min-height:280px; overflow:hidden; }
.dc-category .dc-chart { height:134px; }
.dc-chart {
  width: 100%;
  height: 260px;
}
.dc-calendar {
  grid-area: calendar;
  width: 100%;
  min-width: 0;
  margin-bottom: 0;
}
.dc-calendar .dc-chart {
  width: 100%;
  height: 148px;
}
.dc-table-scroll {
  overflow: auto;
}
.dc-records {
  scroll-margin-top: 20px;
}
.dc-records .dc-card-title {
  padding-bottom: 21px;
}
.dc-remark {
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8a97a9;
}
.dc-status {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 5px;
  background: #f0f4fa;
  color: #7b8aa2;
  white-space: nowrap;
}
.dc-status.complete {
  background: #eaf6f0;
  color: #36886a;
}
.dc-status.pending {
  background: #fff5df;
  color: #ac802f;
}
.demo-tag {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 9px;
  background: #fff1cc;
  color: #ae8426;
  margin-left: 6px;
  font-weight: 400;
  white-space: nowrap;
}
.dc-row-actions {
  display: flex;
  gap: 11px;
  white-space: nowrap;
}
.data-center .dc-row-actions button {
  display: inline;
  padding: 0;
  font-size: 11px;
  border: 0;
  background: transparent !important;
  color: #4469c7;
}
.data-center .dc-row-actions button.danger {
  color: #c57a82;
}
.data-center .tabular {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  color: #97a2b3;
  font-size: 11px;
}
.dc-pagination > div {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dc-pagination .dc-button {
  font-size: 11px;
  padding: 6px 10px;
  min-height: 30px;
}
.dc-page-footer {
  text-align: center;
  color: #a3aec0;
  font-size: 10px;
  padding: 28px 0 25px;
}
.dc-empty {
  text-align: center;
  background: #fff;
  border: 1px dashed #dce4ef;
  border-radius: 12px;
  padding: 27px;
  color: #92a0b3;
  margin-bottom: 14px;
}
.dc-empty > .icon {
  font-size: 25px;
  width: 30px;
  height: 30px;
  color: #a9b9d1;
}
.dc-empty h2 {
  font-size: 15px;
  margin: 9px 0 5px;
  color: #64748b;
}
.dc-empty p {
  font-size: 12px;
}
.dc-loading {
  padding: 15px;
  text-align: center;
  color: #8090a6;
}
.dc-overlay,
.dc-confirm-overlay {
  position: fixed;
  inset: 0;
  background: #13223a66;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(3px);
}
.dc-drawer {
  width: min(600px, 100vw);
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -12px 0 60px #15233d26;
}
.dc-drawer > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 28px;
  border-bottom: 1px solid #e8edf4;
}
.dc-drawer > header h2 {
  margin-top: 5px;
}
.data-center button.dc-icon-button {
  display: flex;
  padding: 7px;
  background: transparent;
  color: #64748b;
  border: 0;
}
.dc-drawer-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 25px 28px;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #f6f8fc;
  border-radius: 10px;
}
.dc-record-summary > strong {
  margin-left: auto;
  font:
    600 22px ui-monospace,
    monospace;
  color: #273c60;
}
.dc-record-summary > span:last-child {
  font-size: 11px;
  color: #8391a7;
}
.dc-detail-times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 22px 0 26px;
}
.dc-detail-times dt {
  font-size: 10px;
  color: #96a2b3;
}
.dc-detail-times dd {
  margin: 5px 0 0;
  font-size: 12px;
  color: #53677e;
}
.dc-drawer form {
  display: grid;
  gap: 17px;
}
.dc-drawer form label {
  font-size: 12px;
  color: #60728b;
}
.dc-drawer textarea {
  resize: vertical;
}
.dc-muted {
  color: #94a0b1;
  font-size: 11px;
  line-height: 1.8;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 12px;
  color: #8390a4;
}
.dc-detail-quantity strong {
  font-size: 22px;
  color: #263e65;
}
.dc-detail-remark {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
  padding: 15px;
  background: #f8fafd;
  border-radius: 8px;
}
.dc-audit {
  margin-top: 22px;
  border-top: 1px solid #e8edf5;
  padding-top: 16px;
}
.dc-audit summary {
  font-size: 12px;
  color: #60738f;
  cursor: pointer;
}
.dc-audit .dc-muted {
  margin-top: 13px;
}
.dc-segment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f3f7;
  font-size: 11px;
  color: #93a0b2;
}
.dc-segment strong {
  color: #60758f;
  font-variant-numeric: tabular-nums;
}
.dc-revision {
  padding: 14px 0;
  border-bottom: 1px solid #edf1f6;
  font-size: 11px;
  color: #8290a5;
}
.dc-revision strong {
  color: #5e728d;
}
.dc-revision p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-top: 7px;
}
.dc-drawer > footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
  padding: 18px 28px;
  border-top: 1px solid #e8edf4;
}
.dc-unsaved {
  font-size: 11px;
  color: #af8536;
}
.dc-confirm-overlay {
  z-index: 30;
  justify-content: center;
  align-items: center;
}
.dc-confirm {
  background: #fff;
  border-radius: 14px;
  padding: 27px;
  width: min(460px, calc(100vw - 32px));
  box-shadow: 0 20px 90px #17253a3b;
}
.dc-confirm h2 {
  margin-bottom: 13px;
}
.dc-confirm p {
  font-size: 13px;
  color: #7a8a9f;
  margin: 8px 0;
}
.dc-confirm > div {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 23px;
  flex-wrap: wrap;
}
.data-center .danger-fill {
  background: #bd4656;
  border-color: #bd4656;
}
@media (max-width: 1100px) {
  .dc-sidebar {
    width: 180px;
    padding-inline: 12px;
  }
  .dc-page {
    margin-left: 180px;
  }
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 22px;
  }
  .dc-kpis {
    gap: 10px;
  }
  .dc-kpi {
    padding: 15px;
  }
  .dc-kpi > strong {
    font-size: 25px;
  }
  .dc-kpi p {
    min-height: 30px;
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-main {
    padding: 20px 12px 0;
  }
  .dc-topbar {
    height: 58px;
    padding-inline: 15px;
  }
  .dc-heading h1 {
    font-size: 22px;
  }
  .dc-heading {
    align-items: start;
    gap: 12px;
  }
  .dc-scope {
    min-width: 110px;
  }
  .dc-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dc-filters {
    padding: 13px;
  }
  .dc-filters form {
    gap: 9px;
  }
  .dc-filters label {
    flex: 1;
  }
  .dc-filters input {
    min-width: 120px;
  }
  .dc-date-separator {
    display: none;
  }
  .dc-card-title {
    padding: 17px 15px;
  }
  .dc-pagination {
    flex-wrap: wrap;
    gap: 12px;
  }
  .dc-drawer-body {
    padding: 18px;
  }
  .dc-detail-times {
    grid-template-columns: 1fr;
  }
  .dc-record-summary {
    flex-wrap: wrap;
  }
  .dc-drawer > header,
  .dc-drawer > footer {
    padding: 18px;
  }
}

.dc-modal {
  position: fixed;
  inset: 0;
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  overflow: hidden;
  color: #263449;
}
.dc-modal::backdrop {
  background: #13223a66;
  backdrop-filter: blur(3px);
}
.dc-modal[open] {
  display: flex;
}
.dc-drawer-modal {
  justify-content: flex-end;
}
.dc-drawer-modal > .dc-drawer {
  height: 100vh;
}
.dc-confirm-modal {
  justify-content: center;
  align-items: center;
}

/* Reference: compact light cards with an icon navigation rail. */
.dc-sidebar { padding:20px 10px; background:#fff; color:#64748b; border-right:1px solid #e2e8f0; }
.dc-brand { padding:0 3px 24px; }
.dc-brand img { width:34px; height:34px; }
.dc-brand > span,.dc-side-label,.dc-side-link > .dc-nav-label { display:none; }
.data-center button.dc-side-link { justify-content:center; padding:11px; color:#64748b; }
.data-center button.dc-side-link.selected,.data-center button.dc-side-link:hover:not(:disabled) { color:#284b38; background:#eaf1ec; }
.dc-sidebar-bottom { padding:12px 0 0; font-size:0; text-align:center; }
.dc-sidebar-bottom small { display:none; }
.connection-dot { margin:0; width:8px; height:8px; }
.dc-heading h1 { font-size:22px; margin-bottom:4px; }
.dc-kpi > strong { line-height:1.5; }
.dc-kpi p,.dc-card-title p { color:#64748b; }
.dc-heat-legend { display:flex; align-items:center; justify-content:center; gap:4px; padding:0 12px 12px; font-size:10px; color:#64748b; }
.dc-heat-legend i { display:block; width:11px; height:11px; border-radius:2px; border:1px solid #1f23281a; }
.data-center button { transition:background-color .14s,border-color .14s,color .14s; }
.data-center button.dc-icon-button:hover:not(:disabled) { background:#eef2f6; color:#334155; }
.data-center button.dc-range:hover:not(:disabled) { background:#f0f3f8; color:#334155; }
.data-center .dc-row-actions button:hover:not(:disabled) { color:#284b38; text-decoration:underline; }
.data-center .dc-button.subtle:hover:not(:disabled) { color:#334155; border-color:#c4ceda; }
.data-center button.danger-fill:hover:not(:disabled) { background:#a83c4c; border-color:#a83c4c; }
.data-center button.dc-range[aria-pressed="true"]:hover:not(:disabled) { background:#e5ecfd; color:#335ed4; }
.dc-trend { min-width:0; }
@media (min-width:761px) and (max-width:1100px) { .dc-sidebar { width:64px; padding-inline:10px; } .dc-page { margin-left:64px; }  }


@media (min-width:641px) and (max-width:999px) {
  .dc-chart-grid { grid-template-columns:repeat(2,minmax(0,1fr)); grid-template-areas:"trend trend" "category calendar"; }
  .dc-trend .dc-chart { flex:none; height:280px; }
  .dc-category .dc-chart { height:180px; }
}
@media (max-width:640px) {
  .dc-chart-grid { grid-template-columns:minmax(0,1fr); grid-template-areas:"trend" "category" "calendar"; }
  .dc-trend .dc-chart { flex:none; height:260px; min-height:0; }
  .dc-category .dc-chart { height:160px; }
  .dc-filters form { flex-basis:100%; }
}

~~~~~~~~

## E:/WorkMemo/scripts/verify-ui-022.mjs

~~~~~~~~text
// Optional browser regression check. Uses isolated HTTP fixtures, never a user database.
// Set WORKMEMO_PLAYWRIGHT to a local playwright package entry if it is not installed.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.2/qa/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{window.qaWindowErrors=[];window.addEventListener('error',event=>window.qaWindowErrors.push(event.message));});
const today = new Date().toLocaleDateString('sv-SE');
const record={id:1,category:'开发',quantity:2,remark:'UI regression fixture',start_time:Date.now()-3600000,end_time:Date.now()-1000,duration_ms:3599000,duration_seconds:3599,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'COMPLETE',revision:1,is_demo:false,demo_batch:null};
const graphDays=Array.from({length:90},(_,i)=>{
  const date=new Date();date.setDate(date.getDate()-89+i);
  return {date:date.toLocaleDateString('sv-SE'),duration_ms:(i%8)*1800000,quantity:i%5,records:i%3};
});
let saves=0, failure=null;
await page.route('**/api/**',async route=>{
  const name=new URL(route.request().url()).pathname.split('/').at(-1);
  if(name==='save'){
    saves++;
    if(failure) return route.fulfill({status:failure,contentType:'application/json',body:JSON.stringify({error:failure===409?'记录已变化，请重新读取':'保存失败，请重试'})});
    Object.assign(record,JSON.parse(route.request().postData()));record.revision++;
  }
  const data={meta:{version:'0.2.2',active:null},query:{totals:{duration_ms:3599000,quantity:record.quantity,records:1,pending:0},trend:graphDays,monthly:false,categories:[{category:'开发',duration_ms:3599000,quantity:record.quantity,records:1}],calendar:graphDays.map(d=>[d.date,d.duration_ms]),records:[record],page:1,pages:1,scope:'real'},detail:{record,segments:[],revisions:[]},save:{ok:true}}[name];
  await route.fulfill({json:data});
});
await page.goto('http://127.0.0.1:1420/dashboard#token=isolated-ui-fixture');
await page.getByRole('button',{name:'详情',exact:true}).click();
await page.getByRole('button',{name:'编辑工作量',exact:true}).click();
if(process.argv.includes('--baseline')) {
  await page.waitForTimeout(700);
  assert.equal(saves,1,'v0.2.1 should reproduce the unintended immediate submission');
  assert.equal(await page.locator('#dc-editor').count(),0);
  console.log('Reproduced v0.2.1: clicking edit immediately submits once and returns to detail.');
  await browser.close();process.exit(0);
}
await page.locator('#dc-editor').waitFor();
await page.waitForTimeout(300);
assert.equal(saves,0,'Entering edit must not submit');
assert.equal(await page.locator('#dc-editor input').evaluate(el=>el===document.activeElement),true);
await page.locator('#dc-editor input').fill('0');
failure=500;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.getByRole('alert').filter({hasText:'保存失败'}).waitFor();
assert.equal(await page.locator('#dc-editor input').inputValue(),'0');
failure=409;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.getByRole('alert').filter({hasText:'记录已变化'}).waitFor();
assert.equal(await page.locator('#dc-editor input').inputValue(),'0');
failure=null;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.locator('#dc-editor').waitFor({state:'detached'});
assert.equal(record.quantity,0);
await page.getByRole('button',{name:'关闭工作详情'}).click();
const layoutCases=[];
for(const width of [390,800,1024,1280,1440,1600,1920]){
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`page overflow ${width}`);
  const layout=await page.evaluate(()=>{
    const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,right:r.right,bottom:r.bottom};};
    return {filters:rect('.dc-filters'),kpis:rect('.dc-kpis'),grid:rect('.dc-chart-grid'),trend:rect('.dc-trend'),category:rect('.dc-category'),calendar:rect('.dc-calendar'),records:rect('.dc-records')};
  });
  assert.ok(Math.abs(layout.filters.width-layout.grid.width)<2,JSON.stringify(layout));
  assert.ok(Math.abs(layout.kpis.width-layout.grid.width)<2,JSON.stringify(layout));
  if(width>=1000){
    assert.ok(Math.abs(layout.category.x-layout.calendar.x)<2,JSON.stringify(layout));
    assert.ok(Math.abs(layout.trend.y-layout.category.y)<2,JSON.stringify(layout));
    assert.ok(Math.abs(layout.trend.bottom-layout.calendar.bottom)<2,JSON.stringify(layout));
    assert.ok(Math.abs(layout.category.x-layout.trend.right-12)<2,JSON.stringify(layout));
  } else if(width>640){
    assert.ok(Math.abs(layout.category.y-layout.calendar.y)<2,JSON.stringify(layout));
    assert.ok(Math.abs(layout.trend.width-layout.grid.width)<2,JSON.stringify(layout));
  } else {
    for(const name of ['trend','category','calendar'])assert.ok(Math.abs(layout[name].width-layout.grid.width)<2,JSON.stringify(layout));
    assert.ok(layout.calendar.y>=layout.category.bottom,JSON.stringify(layout));
  }
  assert.ok(Math.abs(layout.records.y-layout.grid.bottom-14)<2,JSON.stringify(layout));
  layoutCases.push({width,...layout});
  await page.screenshot({path:new URL(`dashboard-${width}.png`,output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
}
// Browser zoom equivalence for CSS layout (not native Windows DPI verification).
await page.evaluate(()=>document.documentElement.style.zoom='1.25');
await page.waitForTimeout(400);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.evaluate(()=>document.documentElement.style.zoom='1');
assert.deepEqual(errors,[]);
assert.deepEqual(await page.evaluate(()=>window.qaWindowErrors),[]);
await writeFile(new URL('browser-result.json',output),JSON.stringify({enterEditNoSubmit:true,focus:true,zeroSave:true,failurePreservesInput:true,revisionConflictPreservesInput:true,completeGridLayout:true,widths:[390,800,1024,1280,1440,1600,1920],cssZoom:1.25,pageErrors:errors},null,2));
await writeFile(new URL('overview-layout-result.json',output),JSON.stringify(layoutCases,null,2));
if(process.argv.includes('--dashboard-only')) { await browser.close();console.log('Overview layout and editor regressions passed; HTTP fixtures only.');process.exit(0); }
// Mock IPC only in a fresh browser page. No native work commands are sent.
const island=await browser.newPage({viewport:{width:320,height:56}});
await island.addInitScript(({record})=>{
  window.qaTheme='cream';window.qaState='working';window.qaCalls=[];
  window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
  const snapshot=()=>({active:['browse','candidate'].includes(window.qaState)?null:{...record,status:'WORKING',is_paused:window.qaState==='paused',pause_reason:window.qaState==='paused'?'MANUAL':null,control_mode:'AUTO'},monitoring:{browsing_only:window.qaState==='browse',browse_ready:true,start_candidate:window.qaState==='candidate'?{id:7,category:'评测',rule_id:1}:null,away_pause_remaining_seconds:null},recent_records:[],pending_count:0});
  window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'notice'},currentWebview:{label:'notice'}},transformCallback(){return 1;},unregisterCallback(){},invoke:async(command,args)=>{
    window.qaCalls.push(command);
    if(command==='get_snapshot') return snapshot();
    if(command==='get_notice') return null;
    if(command==='get_appearance') return {version:1,theme:window.qaTheme,opacity:94};
    if(command==='get_presentation') return {version:1,categories:{'评测':{icon:'checkSquare',color:'#447cba'},'开发':{icon:'code',color:'#8b5cf6'}},background:null};
    if(command==='pause_task'){window.qaState='paused';return snapshot();}
    if(command==='resume_task'){window.qaState='working';return snapshot();}
    if(command==='enter_browsing'){window.qaState='browse';return snapshot();}
    if(command==='confirm_work'){window.qaState='working';return snapshot();}
    return null;
  }};
},{record});
const islandResults=[];
for(const theme of ['cream','glass','dark','neon']){
  await island.goto('http://127.0.0.1:1420/?notice=1');
  await island.evaluate(t=>window.qaTheme=t,theme);
  await island.waitForTimeout(1100);
  // Appearance reload occurs on mount; reload with theme selected via init for this document.
  const vars=await island.evaluate(async t=>(await import('/src/themes.ts')).themeStyle({version:1,theme:t,opacity:94}),theme);
  await island.locator('.island-frame').evaluate((el,v)=>{for(const [k,val] of Object.entries(v))el.style.setProperty(k,String(val));},vars);
  const button=island.getByRole('button',{name:'暂停记录'});
  await button.waitFor();
  await button.hover();
  const bounds=await island.locator('.island-main-row').boundingBox();
  assert.ok(bounds.y+bounds.height<=56,`island height ${theme}`);
  assert.ok(bounds.x+bounds.width<=320,`island width ${theme}`);
  await island.screenshot({path:new URL(`island-${theme}.png`,output).pathname.replace(/^\/(\w:)/,'$1')});
  islandResults.push(theme);
}
await island.getByRole('button',{name:'暂停记录'}).click();
await island.getByRole('button',{name:'继续记录',exact:true}).click();
await island.evaluate(()=>window.qaState='browse');await island.waitForTimeout(1100);
await island.getByRole('button',{name:'开始记录',exact:true}).waitFor();
await island.getByRole('button',{name:'开始记录',exact:true}).click();
await island.getByRole('button',{name:'暂停记录'}).waitFor();
await island.evaluate(()=>window.qaState='paused');await island.waitForTimeout(1100);
await island.getByRole('button',{name:'继续记录',exact:true}).click();
await island.evaluate(()=>window.qaState='candidate');await island.setViewportSize({width:320,height:88});await island.waitForTimeout(1100);
await island.getByRole('button',{name:'开始记录',exact:true}).waitFor();
await island.screenshot({path:new URL('island-confirm.png',output).pathname.replace(/^\/(\w:)/,'$1')});
await writeFile(new URL('island-result.json',output),JSON.stringify({themes:islandResults,pauseBrowseStartResume:true,candidate:true,native:false},null,2));
const settings=await browser.newPage({viewport:{width:1024,height:850}});
await settings.goto('http://127.0.0.1:1420/?panel=settings&section=layout');
await settings.locator('.layout-form').waitFor();
for(const width of [1024,600]){
  await settings.setViewportSize({width,height:850});
  const alignment=await settings.locator('.layout-form').evaluate(el=>{
    const form=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect();
    return {centerDifference:Math.abs((form.left+form.right)-(parent.left+parent.right)),width:form.width,scrollWidth:el.scrollWidth};
  });
  assert.ok(alignment.centerDifference<2,JSON.stringify(alignment));
  assert.ok(alignment.width<=650 && alignment.scrollWidth<=alignment.width+1,JSON.stringify({width,...alignment}));
}
await settings.screenshot({path:new URL('layout-settings.png',output).pathname.replace(/^\/(\w:)/,'$1')});
await browser.close();
console.log('Dashboard UI regression passed; fixtures only.');

~~~~~~~~
