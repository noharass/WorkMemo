import { shiftPeriod, reportRangeLabel, type ReportPeriod, type ReportRange } from "./reportPeriod";
import { useCategoryNames, type CategoryNames } from "./categoryNames";
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
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  scope: "real" | "demo" | "all";
  status: string;
  page: number;
};
type Data = {
  range: ReportRange;
  record_count: number;
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
    complete: number;
    pending: number;
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
  category_names: CategoryNames;
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
  const pending = entry.get("view") === "pending";
  return { period: pending ? "custom" : "day", anchor_date: null,
    start_date: null, end_date: null, category: null,
    scope: entry.get("scope") === "demo" ? "demo" : "real",
    status: pending ? "pending" : "all", page: 1 };
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
  const [auxiliaryOpen, setAuxiliaryOpen] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const { name, accept: acceptCategoryNames } = useCategoryNames();
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
    setLoading(true);
    setData(null);
    async function load() {
      if (reading) return;
      reading = true;
      try {
        const metadata = await api<Meta>("meta");
        if (stopped) return;
        setMeta(metadata);
        acceptCategoryNames(metadata.category_names);
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
  }, [query, refresh, acceptCategoryNames]);
  function applyQuery(update: Query) { setFilters(update); setQuery(update); }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({ ...filters, period, anchor_date: period === "custom" ? null : (filters.anchor_date || data?.range.anchor_date || null),
      start_date: period === "custom" ? data?.range.start_date ?? null : null,
      end_date: period === "custom" ? data?.range.end_date ?? null : null, page: 1 });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    if (!anchor) return;
    const shifted = shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
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
  const trend = useMemo<EChartsOption>(() => ({
    animationDuration: 250,
    tooltip: { ...tooltip, trigger: "axis", valueFormatter: (value: unknown) => `${Number(value).toLocaleString("zh-CN", {maximumFractionDigits:4})} 小时` },
    legend: { top: 0, right: 16, data: ["有效工时"] },
    // Preserve a separate row for axis units below the legend.
    grid: { left: 22, right: 24, top: 64, bottom: 20, containLabel: true },
    xAxis: { type: "category", boundaryGap: false,
      data: data?.trend.map(x => x.date) ?? [],
      axisLine: { lineStyle: { color: "#dce7e0" } }, axisTick: { show: false },
      axisLabel: { color: "#718078", hideOverlap: true, showMinLabel: true, showMaxLabel: true,
        formatter: (value: string) => data?.range.trend_unit === "hour" ? value : value.slice(5) } },
    yAxis: { type: "value", name: "小时", min: 0,
      splitLine: { lineStyle: { color: "#edf2ef", type: "dashed" } }, axisLabel: { color: "#718078" } },
    series: [{ name: "有效工时", type: "line", smooth: false, symbolSize: 5,
      data: data?.trend.map(x => x.duration_ms / 3600000) ?? [],
      lineStyle: { width: 2.5, color: "#287b63" }, itemStyle: { color: "#287b63" },
      areaStyle: { color: "#eaf3ee", opacity: 0.7 } }],
  }), [data]);
  const categoryOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 300,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: { left: 12, right: 22, top: 25, bottom: 28, containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f7" } } },
      yAxis: {
        type: "category",
        data: data?.categories.map((x) => name(x.category)) ?? [],
        axisLabel: { width: 100, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 24,
          data:
            data?.categories.map((x) => ({
              name: name(x.category),
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
    [data, categoryMetric, presentation, name],
  );
  const calendarOption = useMemo<EChartsOption>(() => {
    const end = data?.range.end_date ?? daysAgo(0);
    const start = new Date(end + "T12:00:00");
    start.setDate(start.getDate() - 89);
    const startDate = data?.range.start_date && data.range.start_date > localDate(start) ? data.range.start_date : localDate(start);
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
        range: [startDate, end],
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
  }, [data]);
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
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
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
            <div className="dc-period-bar">
              <div className="dc-period-tabs" aria-label="统计周期">
                {([["day","日"],["week","周"],["month","月"],["custom","自定义"]] as const).map(([id,label]) =>
                  <button key={id} className="dc-range" aria-pressed={filters.period===id} onClick={() => selectPeriod(id)}>{label}</button>)}
              </div>
              {query.period !== "custom" && <div className="dc-period-nav">
                <button className="dc-icon-button" aria-label="上一周期" disabled={!data?.range.anchor_date || !shiftPeriod(query.period,data.range.anchor_date,-1)} onClick={() => movePeriod(-1)}>‹</button>
                <strong>{data ? reportRangeLabel(data.range) : "正在读取周期…"}</strong>
                <button className="dc-icon-button" aria-label="下一周期" disabled={!data?.range.anchor_date || !shiftPeriod(query.period,data.range.anchor_date,1)} onClick={() => movePeriod(1)}>›</button>
                <button className="dc-button subtle" onClick={() => applyQuery({...query,anchor_date:null,page:1})}>{({day:"今天",week:"本周",month:"本月",custom:"当前"})[query.period]}</button>
              </div>}
            </div>
            <form onSubmit={e => { e.preventDefault(); applyQuery({...filters,page:1}); }}>
              {filters.period === "custom" ? <>
                <label>开始日期<input type="date" min="1970-01-01" max="9999-12-31" value={filters.start_date??""} onChange={e=>setFilters({...filters,start_date:e.target.value||null})}/></label>
                <label>结束日期<input type="date" min="1970-01-01" max="9999-12-31" value={filters.end_date??""} onChange={e=>setFilters({...filters,end_date:e.target.value||null})}/></label>
                <button type="button" className="dc-button subtle" onClick={()=>applyQuery({...filters,start_date:null,end_date:null,page:1})}>全部日期</button>
              </> : <label>基准日期<input type="date" required min="1970-01-01" max="9999-12-31" value={filters.anchor_date??data?.range.anchor_date??daysAgo(0)} onChange={e=>setFilters({...filters,anchor_date:e.target.value})}/></label>}
              <label>类别<select aria-label="筛选工作类别" value={filters.category??""} onChange={e=>setFilters({...filters,category:e.target.value||null})}>
                <option value="">全部类别</option>{CATEGORIES.map(c=><option key={c} value={c}>{name(c)}</option>)}
              </select></label>
              <label>状态<select aria-label="筛选记录状态" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
                <option value="all">全部状态</option><option value="pending">待补全</option><option value="complete">已确认</option><option value="working">进行中</option>
              </select></label>
              <label className="dc-scope">数据范围<select value={filters.scope} onChange={e=>setFilters({...filters,scope:e.target.value as Query["scope"]})}>
                <option value="real">真实数据</option><option value="demo">演示数据</option><option value="all">全部数据</option>
              </select></label>
              <button type="submit" className="dc-button"><Icon name="search"/>应用筛选</button>
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
                label: "已结束记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "进行中的任务单独保留",
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
          <section className="dc-card dc-category-report" aria-label="按类型汇总工作量">
            <div className="dc-card-title"><div><h2>分类工作量</h2><p>{data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计</p></div><span className="dc-chip">自动汇总</span></div>
            {loading && !data ? <p role="status" className="dc-loading">正在读取本机工作数据…</p> : data ? <>
              <table className="dc-report-table">
                <thead><tr><th scope="col">工作类型</th><th scope="col">已确认工作量</th><th scope="col">有效工时</th><th scope="col">已结束记录</th><th scope="col">待补填</th></tr></thead>
                <tbody>{data.categories.map(row=><tr key={row.category}>
                  <th scope="row"><WorkBadge category={row.category} presentation={presentation}/></th>
                  <td data-label="已确认工作量" className="dc-report-quantity"><strong>{row.complete>0 ? formatQuantity(row.quantity) : row.pending>0 ? "待补填" : "—"}</strong><small>{row.complete>0 ? `已确认 ${row.complete} 条` : row.pending>0 ? "尚未确认产出" : "暂无已结束记录"}</small></td>
                  <td data-label="有效工时" className="tabular">{formatDuration(row.duration_ms/1000)}</td>
                  <td data-label="已结束记录" className="tabular">{row.records} 条</td>
                  <td data-label="待补填"><span className={row.pending>0?"dc-pending-count":"dc-muted"}>{row.pending} 条</span></td>
                </tr>)}</tbody>
              </table>
              <p className="dc-report-note">按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。</p>
              {data.totals.records===0 && <p className="dc-report-empty">这个范围还没有已结束记录。结束工作后会在这里自动汇总。</p>}
            </> : <p className="dc-loading">暂无统计结果，请检查连接后重试。</p>}
          </section>
          <section className="dc-chart-grid">
            <article className="dc-card dc-trend">
              <div className="dc-card-title">
                <div>
                  <h2>工作趋势</h2>
                  <p>
                    {data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时
                  </p>
                </div>
                <span className="dc-chip">时间视角</span>
              </div>
              <Chart option={trend} label="有效工时趋势" />
            </article>
          </section>
          <details className="dc-auxiliary" onToggle={event => setAuxiliaryOpen(event.currentTarget.open)}>
            <summary>辅助分析<span>类别分布与工作日历</span></summary>
            {auxiliaryOpen && <div className="dc-auxiliary-grid">
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
                onCategory={(label) => {
                  const key = CATEGORIES.find(c => name(c) === label);
                  if (key) {
                    const update = { ...query, category: key, page: 1 };
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
                <p>已应用筛选范围 · 最多展示近90天有效工时</p>
              </div>
            </div>
            <Chart option={calendarOption} label="筛选范围内的有效工时工作日历" />
            <div className="dc-heat-legend" aria-label="工时由少到多">少 {["#ebedf0","#9be9a8","#40c463","#30a14e","#216e39"].map(color=><i key={color} style={{background:color}}/>)} 多</div>
            </article>
            </div>}
          </details>
          <section className="dc-card dc-records" id="records">
            <div className="dc-card-title">
              <div>
                <h2>每一段工作，都有来处</h2>
                <p>查看计时区间、补填工作量，或回顾修正记录。</p>
              </div>
              <span className="dc-chip">{data?.record_count ?? 0} 条记录</span>
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
                        <option key={c} value={c}>{name(c)}</option>
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
                        {name(r.before?.category)} → {name(r.after?.category)} · 数量{" "}
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
              {name(deleting.category)} · {formatTime(deleting.start_time)}
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
