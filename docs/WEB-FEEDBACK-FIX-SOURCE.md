# 网页反馈修正完整源码

2026-11-16。验收与完整文件清单见 WEB-FEEDBACK-FIX.md。以下应用代码与测试脚本均完整收录。

## UPDATE E:\WorkMemo\src\Dashboard.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { loopTabWithin } from "./ui/loopTabWithin";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  Descriptions,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  type InputRef,
  type TableColumnsType,
} from "antd";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  shiftPeriod,
  reportRangeLabel,
  trendAggregationLabel,
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput, type InputErrors } from "./workInput";
import { Icon } from "./Icon";
import { UiProvider, useMediaQuery } from "./ui/UiProvider";
import { BottomSheet } from "./ui/BottomSheet";
import {
  api,
  initialQuery,
  type CategoryTotal,
  type Detail,
  type Data,
  type Query,
  type Row,
} from "./dashboard/api";
import { useDashboardData } from "./dashboard/useDashboardData";
import { FilterDateField } from "./dashboard/FilterDateField";
import { ManualEntryModal } from "./dashboard/ManualEntryModal";
import { recordStatusLabel } from "./dashboard/recordStatus";
import { CalendarChart, CategoryChart, DurationPieChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

function RecordStatus({ row }: { row: Row }) {
  return (
    <Space size={4} wrap>
    <Tag
      color={
        row.status !== "FINISHED"
          ? "processing"
          : row.settlement_status === "PENDING"
            ? "gold"
            : "success"
      }
    >
      {recordStatusLabel(row)}
    </Tag>
    {row.source === "MANUAL_ENTRY" && !row.is_demo && <Tag color="blue">人工补录</Tag>}
    </Space>
  );
}
function Title({ title, description }: { title: string; description?: string }) {
  return (
    <div className="dc-card-title">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
function DashboardContent() {
  const { message } = AntApp.useApp();
  const { name } = useCategoryNames();
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [refresh, setRefresh] = useState(0);
  const { data, meta, error, online, refreshing, updatedAt, loading } =
    useDashboardData(query, refresh);
  const [actionError, setActionError] = useState("");
  const [manualOpen, setManualOpen] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<InputErrors>({});
  const [filterError, setFilterError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const requestedRefresh = useRef(false);
  const previousOnline = useRef<boolean | null>(null);
  const editorSummary = useRef<HTMLDivElement>(null);
  const confirmSummary = useRef<HTMLDivElement>(null);
  const [detailStale, setDetailStale] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<Query | null>(null);
  const [pendingData, setPendingData] = useState<Data | null>(null);
  const [pendingError, setPendingError] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const selectedPending = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<InputRef>(null);
  const safeConfirmAction = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const recordsRef = useRef<HTMLElement>(null);
  const [confirmation, setConfirmation] = useState<"guard" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const next = useRef<(() => void) | null>(null);
  const afterConfirm = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const [section, setSection] = useState("overview");
  const [hideNavHints, setHideNavHints] = useState(false);
  const [navHint, setNavHint] = useState<string | null>(null);
  const navScrollFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(navScrollFrame.current), []);
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: name(value),
  }));
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const blocked = busy || confirmation !== null;
  const overlayOpen = sheetOpen || !!detail || !!confirmation || manualOpen;

  useEffect(() => {
    if (overlayOpen) {
      requestedRefresh.current = false; setAnnouncement("");
    } else if (requestedRefresh.current && !refreshing) {
      requestedRefresh.current = false;
      setAnnouncement(online && !error ? "工作数据已刷新。" : "");
    } else if (online && previousOnline.current === false) {
      setAnnouncement("与 WorkMemo 的连接正常。");
    }
    previousOnline.current = online;
  }, [online, refreshing, overlayOpen, error]);

  useEffect(() => {
    if (!editorError || busy) return;
    const frame = requestAnimationFrame(() => {
      if (confirmation) { confirmSummary.current?.focus(); return; }
      const field = Object.keys(fieldErrors)[0];
      if (field && editing) document.getElementById(`dc-${field}`)?.focus();
      else editorSummary.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [editorError, busy, confirmation, fieldErrors, editing]);
  function editField(field: keyof typeof fields, value: string) {
    setFields(previous => ({...previous,[field]:value}));
    setFieldErrors(previous => {const next = {...previous};delete next[field];return next;});
    setEditorError("");
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0])
          setSection(entries[0].isIntersecting ? "records" : "overview");
      },
      { rootMargin: "-64px 0px -25% 0px" },
    );
    if (recordsRef.current) observer.observe(recordsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (editing && sheetOpen && !confirmation)
      quantityInput.current?.focus({ preventScroll: true });
  }, [editing, sheetOpen, confirmation, detail?.record.id]);
  function applyQuery(value: Query) {
    setFilters(value);
    if (value.period === "custom" && value.start_date && value.end_date && value.start_date > value.end_date) {
      setFilterError("开始日期不能晚于结束日期。");
      requestAnimationFrame(() => document.getElementById("dc-filter-date-end")?.focus());
      return;
    }
    setFilterError("");
    setQuery(value);
  }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({
      ...filters,
      period,
      anchor_date:
        period === "custom"
          ? null
          : filters.anchor_date || data?.range.anchor_date || null,
      start_date: period === "custom" ? (data?.range.start_date ?? null) : null,
      end_date: period === "custom" ? (data?.range.end_date ?? null) : null,
      page: 1,
    });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    const shifted = anchor && shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  function leave(action: () => void) {
    if (busyRef.current || confirmation) return;
    if (dirty) {
      next.current = action;
      setConfirmation("guard");
      setConfirmOpen(true);
    } else action();
  }
  function showDetail(value: Detail, edit: boolean) {
    setDetail(value);
    setFieldErrors({});
    setDetailStale(false);
    setFields({
      category: value.record.category,
      quantity: value.record.quantity === null ? "" : String(value.record.quantity),
      remark: value.record.remark,
    });
    setEditing(edit && value.record.status === "FINISHED");
    setSheetOpen(true);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current || detail) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setEditorError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      setPendingQuery(null);
      showDetail(value, edit);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const readPending = useCallback(async (criteria: Query) => {
    let list = await api<Data>("query", criteria);
    if (criteria.page > list.pages && list.pages > 0)
      list = await api<Data>("query", { ...criteria, page: list.pages });
    setPendingQuery({ ...criteria, page: list.page });
    setPendingData(list);
    setPendingError("");
  }, []);
  async function refreshPending(criteria: Query) {
    if (busyRef.current || !online) return;
    busyRef.current = true; setBusy(true);
    try { await readPending(criteria); }
    catch (e) { setPendingError(String(e instanceof Error ? e.message : e)); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function returnToPending() {
    if (!pendingQuery) return;
    setDetail(null); setEditing(false); setEditorError("");
    void refreshPending(pendingQuery);
  }
  useEffect(() => {
    if (!sheetOpen || detail || !pendingData) return;
    const frame = requestAnimationFrame(() => {
      const id = selectedPending.current;
      const button = document.querySelector<HTMLElement>(`[data-pending-id="${id}"]`)
        ?? document.querySelector<HTMLElement>("[data-pending-id]")
        ?? document.querySelector<HTMLElement>(".dc-pending-refresh");
      button?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [sheetOpen, detail, pendingData]);
  async function selectPending(row: Row) {
    if (!pendingQuery || !pendingData || busyRef.current || !online) return;
    selectedPending.current = row.id;
    busyRef.current = true; setBusy(true); setPendingError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      const record = value.record;
      const date = localDate(new Date(record.start_time));
      if (record.status !== "FINISHED" || record.settlement_status !== "PENDING"
        || record.category !== pendingQuery.category
        || (pendingQuery.scope !== "all" && record.is_demo !== (pendingQuery.scope === "demo"))
        || (pendingData.range.start_date && date < pendingData.range.start_date)
        || (pendingData.range.end_date && date > pendingData.range.end_date)) {
        setPendingStatus("这条记录已变化，请重新选择。");
        await readPending(pendingQuery);
        return;
      }
      showDetail(value, true); setEditorError("");
    } catch (e) {
      // A removed row must not silently open a different record.
      try { await readPending(pendingQuery); }
      catch { /* Preserve the original error and offer an explicit retry. */ }
      setPendingError(e instanceof Error ? e.message : String(e));
    } finally { busyRef.current = false; setBusy(false); }
  }
  async function openCategoryPending(category: string) {
    if (busyRef.current || sheetOpen || !online) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const criteria: Query = { ...query, anchor_date: data?.range.anchor_date ?? query.anchor_date, category, status: "pending", page: 1 };
    setPendingQuery(criteria); setPendingData(null); setPendingError(""); setPendingStatus("");
    selectedPending.current = null; setSheetOpen(true);
    setActionError("");
    await refreshPending(criteria);
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
      setFieldErrors(result.errors);
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setFieldErrors({});
    setEditorError("");
    let committed = false;
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      committed = true;
      // A successful write remains successful if its follow-up read fails.
      const record: Row = {
        ...detail.record,
        ...result.input,
        settlement_status: "COMPLETE",
      };
      setDetail({ ...detail, record });
      setEditing(false);
      setDetailStale(true);
      setFields({
        category: record.category,
        quantity: String(record.quantity),
        remark: record.remark,
      });
      setRefresh((value) => value + 1);
      if (pendingQuery) {
        setDetail(null); setEditing(false); setEditorError("");
        setPendingStatus("工作量已保存，请选择下一条记录。");
        // A committed write stays committed even when refreshing the list fails.
        setPendingData(null);
        try { await readPending(pendingQuery); }
        catch (e) { setPendingError(`已保存，列表刷新失败：${e instanceof Error ? e.message : String(e)}`); }
        return true;
      }
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setDetailStale(false);
      void message.success({ content: "工作量已保存", key: "workload-save" });
      return true;
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      setEditorError(
        committed
          ? `已保存，详情刷新失败：${text}。请关闭后重新打开详情。`
          : text,
      );
      if (committed)
        void message.warning({
          content: "已保存，详情刷新失败",
          key: "workload-save",
        });
      return committed;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online, message, pendingQuery, readPending]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        editing &&
        sheetOpen &&
        !confirmation
      ) {
        event.preventDefault();
        void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, editing, sheetOpen, confirmation, save]);
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
      setConfirmOpen(false);
      setRefresh((value) => value + 1);
      void message.success("记录已删除");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function closeConfirmation() {
    if (!busyRef.current) {
      next.current = null;
      afterConfirm.current = null;
      setConfirmOpen(false);
    }
  }
  function restoreTrigger() {
    requestAnimationFrame(() => {
      (trigger.current?.isConnected
        ? trigger.current
        : recordsRef.current
      )?.focus({ preventScroll: true });
    });
  }
  function pendingLink(row: CategoryTotal) {
    return row.pending > 0 ? <Button type="link" size="small" className="dc-pending-link"
      aria-label={`${name(row.category)}待补填${row.pending}条`} disabled={!online || busy || sheetOpen}
      onClick={() => { void openCategoryPending(row.category); }}>{row.pending} 条</Button>
      : <span className="dc-muted">0 条</span>;
  }
  const reportColumns: TableColumnsType<CategoryTotal> = [
    {
      title: "工作类型",
      dataIndex: "category",
      width: "29%",
      render: (value: string) => (
        <WorkBadge category={value} presentation={presentation} />
      ),
    },
    {
      title: "已确认工作量",
      key: "quantity",
      render: (_, row) => (
        <div className="dc-report-quantity">
          <strong>
            {row.complete > 0
              ? formatQuantity(row.quantity)
              : row.pending > 0
                ? "待补填"
                : "—"}
          </strong>
          <small>
            {row.complete > 0
              ? `已确认 ${row.complete} 条`
              : row.pending > 0
                ? "尚未确认产出"
                : "暂无已结束记录"}
          </small>
        </div>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "已结束记录",
      dataIndex: "records",
      render: (value: number) => <span className="dc-number">{value} 条</span>,
    },
    {
      title: "待补填",
      dataIndex: "pending",
      render: (_, row) => pendingLink(row),
    },
  ];
  const recordColumns: TableColumnsType<Row> = [
    {
      title: "类别",
      dataIndex: "category",
      width: 150,
      render: (value: string, row) => (
        <Space orientation="vertical" size={4}>
          <WorkBadge category={value} presentation={presentation} />
          {row.task_name && row.task_name !== value && row.task_name !== name(value) && <span className="dc-muted">{row.task_name}</span>}
          {row.is_demo && <Tag color="gold">演示</Tag>}
        </Space>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      width: 170,
      render: (value: number) => (
        <span className="dc-date">{formatTime(value)}</span>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      width: 120,
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "工作量",
      key: "quantity",
      width: 110,
      render: (_, row) =>
        row.settlement_status === "COMPLETE" ? (
          <span className="dc-number">{formatQuantity(row.quantity)}</span>
        ) : (
          <span className="dc-muted">
            {row.status === "FINISHED" ? "待补填" : "未结算"}
          </span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_, row) => <RecordStatus row={row} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 190,
      ellipsis: true,
      render: (value: string) => (
        <span className="dc-muted">{value || "—"}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space size={2} className="dc-row-actions">
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => {
              void openDetail(row);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              void openDetail(row, true);
            }}
          >
            {row.settlement_status === "PENDING" ? "补填" : "编辑"}
          </Button>
          <Button
            type="text"
            danger
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              setEditorError("");
              setDeleting(row);
              setConfirmation("delete");
              setConfirmOpen(true);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const totals = data?.totals;
  const scrollBehavior = reduced ? "instant" : "smooth";
  const dateField = (
    label: string,
    value: string | null,
    change: (value: string | null) => void,
    required = false,
  ) => (
    <FilterDateField label={label} value={value} required={required} error={filterError}
      onChange={next => { setFilterError(""); change(next); }} />
  );
  return (
    <div className="data-center">
      <div className="dc-announcer" role="status" aria-atomic="true">{announcement}</div>
      <aside className="dc-sidebar" inert={overlayOpen}>
        <Tooltip title="WorkMemo 工作数据中心" placement="right">
          <a
            className="dc-brand"
            href="/dashboard"
            aria-label="WorkMemo 工作数据中心"
          >
            <img src="/workmemo.png" alt="" />
          </a>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[section]}
          tooltip={false}
          onMouseLeave={() => { setHideNavHints(false); setNavHint(null); }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHideNavHints(false); }}
          items={[
            {
              key: "overview",
              icon: <Tooltip title="工作总览" placement="right" trigger={[]} open={!hideNavHints && navHint === "overview"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="chart" /></span>
              </Tooltip>,
              label: "工作总览",
              onMouseEnter: () => setNavHint("overview"),
              onMouseLeave: () => setNavHint(null),
            },
            {
              key: "records",
              icon: <Tooltip title="工作明细" placement="right" trigger={[]} open={!hideNavHints && navHint === "records"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="list" /></span>
              </Tooltip>,
              label: "工作明细",
              onMouseEnter: () => setNavHint("records"),
              onMouseLeave: () => setNavHint(null),
            },
          ]}
          onClick={({ key, domEvent }) => {
            setHideNavHints(domEvent.type !== "keydown");
            setNavHint(null);
            cancelAnimationFrame(navScrollFrame.current);
            navScrollFrame.current = requestAnimationFrame(() => {
              // Commit the closed tooltip first, and cancel an older smooth scroll.
              window.scrollTo({ top: window.scrollY, behavior: "instant" });
              if (key === "records")
                recordsRef.current?.scrollIntoView({ behavior: scrollBehavior });
              else window.scrollTo({ top: 0, behavior: scrollBehavior });
            });
          }}
        />
        <div className="dc-sidebar-bottom">
          <Tooltip
            title={`${online ? "本机连接正常" : "等待本机连接"} · v${meta?.version ?? "0.2.4"}`}
            placement="right"
          >
            <span
              className={`connection-dot ${online ? "connected" : ""}`}
              role="img"
              aria-label={online ? "本机连接正常" : "等待本机连接"}
            />
          </Tooltip>
        </div>
      </aside>
      <div className="dc-page" inert={overlayOpen}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync">
              {refreshing
                ? "正在刷新…"
                : updatedAt
                  ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
                  : "等待连接"}
            </span>
            <Button type="primary" disabled={blocked || !online || !meta?.manual_entry || query.scope === "demo"}
              onClick={() => setManualOpen(true)}>补记录</Button>
            <Button
              icon={<Icon name="refresh" />}
              disabled={refreshing}
              onClick={() => {requestedRefresh.current = true;setAnnouncement("");setRefresh((value) => value + 1);}}
            >
              刷新连接
            </Button>
          </Space>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>
            <Tag variant="filled">记录保存在本机</Tag>
          </div>
          {query.scope !== "real" && (
            <Alert
              className="dc-notice"
              type="warning"
              showIcon
              title={
                query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"
              }
              description="示例仅用于查看效果，日常真实统计默认排除。"
            />
          )}
          {(error || actionError) && (
            <Alert
              className="dc-notice"
              type="error"
              showIcon
              title={
                data && error ? "刷新失败，当前显示上次结果" : "操作未完成"
              }
              description={actionError || error}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setActionError("");
                    setRefresh((value) => value + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          )}
          {meta?.active && (
            <Alert
              className="dc-notice dc-active"
              type="info"
              showIcon
              title={
                <Space wrap>
                  <WorkBadge
                    category={meta.active.category}
                    presentation={presentation}
                  />
                  <span>
                    {meta.active.is_paused
                      ? "当前任务已暂停"
                      : "当前任务正在计时"}
                  </span>
                </Space>
              }
              description="结束后可在这里补填工作量，进行中的任务不计入已结束报表。"
            />
          )}
          <Card
            className="dc-filters"
            styles={{ body: { padding: narrow ? 16 : 20 } }}
          >
            <div className="dc-period-bar">
              <Segmented
                aria-label="统计周期"
                value={filters.period}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                  { value: "custom", label: "自定义" },
                ]}
                onChange={(value) => selectPeriod(value as ReportPeriod)}
              />
              {query.period !== "custom" && (
                <div className="dc-period-nav">
                  <Button
                    aria-label="上一周期"
                    icon={<Icon name="left" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, -1)
                    }
                    onClick={() => movePeriod(-1)}
                  />
                  <strong>
                    {data ? reportRangeLabel(data.range) : "正在读取周期…"}
                  </strong>
                  <Button
                    aria-label="下一周期"
                    icon={<Icon name="right" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, 1)
                    }
                    onClick={() => movePeriod(1)}
                  />
                  <Button
                    onClick={() =>
                      applyQuery({ ...query, anchor_date: null, page: 1 })
                    }
                  >
                    {
                      {
                        day: "今天",
                        week: "本周",
                        month: "本月",
                        custom: "当前",
                      }[query.period]
                    }
                  </Button>
                </div>
              )}
            </div>
            <Form
              aria-label="工作报表筛选"
              layout="vertical"
              className="dc-filter-form"
              onFinish={() => applyQuery({ ...filters, page: 1 })}
            >
              {filters.period === "custom" ? (
                <>
                  {dateField("开始日期", filters.start_date, (value) =>
                    setFilters({ ...filters, start_date: value }),
                  )}
                  {dateField("结束日期", filters.end_date, (value) =>
                    setFilters({ ...filters, end_date: value }),
                  )}
                </>
              ) : (
                dateField(
                  "基准日期",
                  filters.anchor_date ??
                    data?.range.anchor_date ??
                    localDate(new Date()),
                  (value) => setFilters({ ...filters, anchor_date: value }),
                  true,
                )
              )}
              <Form.Item label="类别" htmlFor="dc-filter-category">
                <Select
                  id="dc-filter-category"
                  aria-label="筛选工作类别"
                  value={filters.category ?? ""}
                  options={[
                    { value: "", label: "全部类别" },
                    ...categoryOptions,
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, category: value || null })
                  }
                />
              </Form.Item>
              <Form.Item label="状态" htmlFor="dc-filter-status">
                <Select
                  id="dc-filter-status"
                  aria-label="筛选记录状态"
                  value={filters.status}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "pending", label: "待补全" },
                    { value: "complete", label: "已确认" },
                    { value: "unfinished", label: "未结束" },
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                />
              </Form.Item>
              <Form.Item label="数据范围" htmlFor="dc-filter-scope">
                <Select
                  id="dc-filter-scope"
                  aria-label="数据范围"
                  value={filters.scope}
                  options={[
                    { value: "real", label: "真实数据" },
                    { value: "demo", label: "演示数据" },
                    { value: "all", label: "全部数据" },
                  ]}
                  onChange={(value) => setFilters({ ...filters, scope: value })}
                />
              </Form.Item>
              <div className="dc-filter-actions">
                {filters.period === "custom" && (
                  <Button
                    onClick={() =>
                      applyQuery({
                        ...filters,
                        start_date: null,
                        end_date: null,
                        page: 1,
                      })
                    }
                  >
                    全部日期
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Icon name="search" />}
                >
                  应用筛选
                </Button>
              </div>
            </Form>
            {filterError && <Alert id="dc-filter-error" type="error" showIcon title={filterError} className="dc-notice" />}
            <div className="dc-filter-summary">
              {JSON.stringify(filters) !== JSON.stringify(query)
                ? "筛选条件已修改，点击应用筛选后更新结果。"
                : `当前已应用 · ${data ? reportRangeLabel(data.range) : "正在读取周期"} · ${query.category ? name(query.category) : "全部类别"} · ${({ all: "全部状态", pending: "待补全", complete: "已确认", unfinished: "未结束", working: "活动任务" } as Record<string, string>)[query.status]}`}
            </div>
          </Card>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals ? (totals.duration_ms / 3600000).toFixed(1) : "—",
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
            ].map((item) => (
              <Card key={item.label} className="dc-kpi">
                <div className="dc-kpi-label">
                  <span>{item.label}</span>
                  <Icon name={item.icon} />
                </div>
                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
                <p>{item.caption}</p>
              </Card>
            ))}
          </section>
          <Card
            className="dc-card dc-category-report"
            title={
              <Title
                title="分类工作量"
                description={`${data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计`}
              />
            }
            styles={{ body: { padding: 0 } }}
          >
            {loading ? (
              <div className="dc-loading" role="status">
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              </div>
            ) : data ? (
              <>
                {narrow ? (
                  <div className="dc-report-cards">
                    {data.categories.map((row) => (
                      <Card
                        size="small"
                        key={row.category}
                        title={
                          <WorkBadge
                            category={row.category}
                            presentation={presentation}
                          />
                        }
                      >
                        <dl>
                          <div>
                            <dt>已确认工作量</dt>
                            <dd className="dc-report-quantity">
                              <strong>
                                {row.complete > 0
                                  ? formatQuantity(row.quantity)
                                  : row.pending > 0
                                    ? "待补填"
                                    : "—"}
                              </strong>
                              <small>
                                {row.complete > 0
                                  ? `已确认 ${row.complete} 条`
                                  : row.pending > 0
                                    ? "尚未确认产出"
                                    : "暂无已结束记录"}
                              </small>
                            </dd>
                          </div>
                          <div>
                            <dt>有效工时</dt>
                            <dd className="dc-number">
                              {formatDuration(row.duration_ms / 1000)}
                            </dd>
                          </div>
                          <div>
                            <dt>已结束记录</dt>
                            <dd>{row.records} 条</dd>
                          </div>
                          <div>
                            <dt>待补填</dt>
                            <dd>
                              {pendingLink(row)}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<CategoryTotal>
                    className="dc-report-table"
                    rowKey="category"
                    columns={reportColumns}
                    dataSource={data.categories}
                    pagination={false}
                    scroll={{ x: 680 }}
                  />
                )}
                <p className="dc-report-note">
                  按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。
                </p>
                {data.totals.records === 0 && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="这个范围还没有已结束记录"
                  />
                )}
              </>
            ) : (
              <Empty
                description="暂无统计结果，请检查连接后重试"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          <Card
            className="dc-card dc-trend"
            title={
              <Title
                title="工作趋势"
                description={`${trendAggregationLabel(data?.range)} · 已结束记录的有效工时`}
              />
            }
            styles={{ body: { padding: "12px 8px 8px" } }}
          >
            {data ? (
              <TrendChart trend={data.trend} range={data.range} />
            ) : loading ? (
              <div className="dc-loading">
                <Skeleton active />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无趋势数据"
              />
            )}
          </Card>
          <Collapse
            className="dc-auxiliary"
            items={[
              {
                key: "analysis",
                label: "辅助分析",
                children: data ? (
                  <div className="dc-auxiliary-grid">
                    <Card
                      className="dc-category"
                      title={
                        <Title
                          title="工作分布"
                        />
                      }
                      extra={
                        <Select
                          aria-label="工作分布指标"
                          value={categoryMetric}
                          options={[
                            { value: "duration", label: "工时（小时）" },
                            { value: "quantity", label: "工作量" },
                          ]}
                          onChange={setCategoryMetric}
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CategoryChart
                        categories={data.categories}
                        presentation={presentation}
                        metric={categoryMetric}
                        onCategory={(label) => {
                          const key = CATEGORIES.find(
                            (value) => name(value) === label,
                          );
                          if (key)
                            applyQuery({ ...query, category: key, page: 1 });
                        }}
                      />
                    </Card>
                    <Card className="dc-pie" title={<Title title="工时占比" />} styles={{ body: { padding: 8 } }}>
                      <DurationPieChart categories={data.categories} presentation={presentation}
                        onCategory={category => applyQuery({ ...query, category, page: 1 })} />
                    </Card>
                    <Card
                      className="dc-calendar"
                      title={
                        <Title
                          title="工作的节奏"
                          description="近90天有效工时"
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CalendarChart
                        calendar={data.calendar}
                        range={data.range}
                      />
                      <div className="dc-heat-legend" aria-label="工时由少到多">
                        少{" "}
                        {[
                          "#ebedf0",
                          "#9be9a8",
                          "#40c463",
                          "#30a14e",
                          "#216e39",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}{" "}
                        多
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分析数据"
                  />
                ),
              },
            ]}
          />
          <section
            className="dc-records"
            id="records"
            ref={recordsRef}
            tabIndex={-1}
          >
            <Card
              className="dc-card"
              title={
                <Title
                  title="工作明细"
                />
              }
              extra={<Tag>{data ? data.record_count : "—"} 条记录</Tag>}
              styles={{ body: { padding: 0 } }}
            >
              {loading ? (
                <div className="dc-loading">
                  <Skeleton active paragraph={{ rows: 5 }} />
                </div>
              ) : (
                <Table<Row>
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={data?.records ?? []}
                  pagination={false}
                  scroll={{ x: 1010 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          error ? "未能读取工作明细" : "当前筛选没有工作记录"
                        }
                      />
                    ),
                  }}
                />
              )}
              <footer className="dc-pagination">
                <span>每页 50 条 · 共 {data?.pages ?? "—"} 页</span>
                <Pagination
                  current={data?.page ?? query.page}
                  total={data?.record_count ?? 0}
                  pageSize={50}
                  showSizeChanger={false}
                  size={narrow ? "small" : undefined}
                  onChange={(page) => applyQuery({ ...query, page })}
                />
              </footer>
            </Card>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      <BottomSheet
        open={sheetOpen}
        blocked={blocked}
        covered={!!confirmation}
        title={
          <div className="dc-sheet-title">
            <span className="dc-eyebrow">
              WORK RECORD {detail ? `#${detail.record.id}` : ""}
            </span>
            <h2>
              {pendingQuery && !detail ? "选择待补填记录" : editing ? "填写工作量" : "工作详情"}{" "}
              {detail?.record.is_demo && <Tag color="gold">演示数据</Tag>}
            </h2>
          </div>
        }
        drawerRender={(node) => (
          <div inert={!!confirmation} style={{ display: "contents" }}>
            {node}
          </div>
        )}
        onClose={() => leave(() => setSheetOpen(false))}
        afterOpenChange={(open) => {
          if (open && editing)
            quantityInput.current?.focus({ preventScroll: true });
          if (!open) {
            setDetail(null);
            setEditing(false);
            setEditorError("");
            setPendingQuery(null);
            setPendingData(null); setPendingError(""); setPendingStatus("");
            restoreTrigger();
          }
        }}
        footer={
          <div className="dc-sheet-footer">
            <span className={dirty ? "dc-unsaved" : "dc-muted"}>
              {pendingQuery?.category ? `${name(pendingQuery.category)} · ` : ""}
              {dirty ? "有未保存修改" : "数据保存在本机"}
            </span>
            <Space wrap>
              <Button
                disabled={blocked}
                onClick={() => leave(() => setSheetOpen(false))}
              >
                关闭
              </Button>
              {pendingQuery && detail && <Button disabled={blocked} onClick={() => leave(returnToPending)}>
                返回列表
              </Button>}
              {editing ? (
                <Button
                  key="save"
                  type="primary"
                  form="dc-editor"
                  htmlType="submit"
                  aria-label="保存工作量"
                  aria-busy={busy}
                  loading={busy ? { delay: 120 } : false}
                  disabled={!online || !!confirmation}
                >
                  保存工作量
                </Button>
              ) : detail ? (
                <Button
                  key="edit"
                  type="primary"
                  aria-label="编辑工作量"
                  disabled={
                    !online ||
                    blocked ||
                    detailStale ||
                    detail?.record.status !== "FINISHED"
                  }
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </Button>
              ) : null}
            </Space>
          </div>
        }
      >
        {pendingQuery && !detail && <section className="dc-pending-list" aria-label="待补填记录列表">
          <p>{name(pendingQuery.category ?? "")} · {pendingData ? reportRangeLabel(pendingData.range) : "当前已应用周期"} · 请选择具体记录</p>
          {pendingStatus && <Alert type={pendingStatus.startsWith("工作量已保存") ? "success" : "info"} title={pendingStatus} role="status" />}
          {pendingError && <Alert type="error" title={pendingError} showIcon />}
          <Button className="dc-pending-refresh" disabled={blocked || !online} loading={busy} onClick={() => { void refreshPending(pendingQuery); }}>刷新待补填列表</Button>
          {busy && !pendingData ? <Skeleton active /> : pendingData && <>
            <Table<Row> rowKey="id" pagination={false} dataSource={pendingData.records} scroll={{ x: 550 }}
              locale={{ emptyText: "当前分类在这个范围已没有待补填记录。" }} columns={[
                { title: "记录", key: "record", render: (_, row) => <><strong>#{row.id}</strong><div>{formatTime(row.start_time)}</div><div>至 {row.end_time ? formatTime(row.end_time) : "—"}</div></> },
                { title: "有效工时", key: "duration", render: (_, row) => formatDuration(row.duration_ms / 1000) },
                { title: "备注", dataIndex: "remark", render: (value: string) => value || "无备注" },
                { title: "操作", key: "action", render: (_, row) => <Button data-pending-id={row.id} aria-label={`补填记录${row.id}`} disabled={blocked || !online || !!pendingError} onClick={() => { void selectPending(row); }}>补填</Button> },
              ]} />
            <Pagination current={pendingData.page} total={pendingData.record_count} pageSize={50} showSizeChanger={false} disabled={blocked || !online}
              onChange={page => { void refreshPending({ ...pendingQuery, page }); }} />
          </>}
        </section>}
        {detail && (
          <div className="dc-detail-content">
            <div className="dc-record-summary">
              <WorkBadge
                category={detail.record.category}
                presentation={presentation}
              />
              <div>
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <small>有效工时</small>
              </div>
              <RecordStatus row={detail.record} />
            </div>
            <Descriptions
              className="dc-detail-times"
              size="small"
              column={narrow ? 1 : 2}
              items={[
                {
                  key: "start",
                  label: "开始",
                  children: formatTime(detail.record.start_time),
                },
                {
                  key: "end",
                  label: "结束",
                  children: detail.record.end_time
                    ? formatTime(detail.record.end_time)
                    : "尚未结束",
                },
              ]}
            />
            {editing ? (
              <Form
                id="dc-editor"
                aria-label="工作量编辑"
                noValidate
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category" required help={fieldErrors.category && <span id="dc-category-error">{fieldErrors.category}</span>} validateStatus={fieldErrors.category ? "error" : undefined}>
                  <Select
                    id="dc-category"
                    aria-required
                    aria-invalid={!!fieldErrors.category}
                    aria-describedby={fieldErrors.category ? "dc-category-error" : undefined}
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) => editField("category", value)}
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  required
                  help={fieldErrors.quantity && <span id="dc-quantity-error">{fieldErrors.quantity}</span>}
                  validateStatus={fieldErrors.quantity ? "error" : undefined}
                  extra={<span id="dc-quantity-hint">0 表示已确认无产出；支持小数和科学计数，最大 10 亿。</span>}
                >
                  <Input
                    id="dc-quantity"
                    required
                    aria-invalid={!!fieldErrors.quantity}
                    aria-describedby={`dc-quantity-hint${fieldErrors.quantity ? " dc-quantity-error" : ""}`}
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) => editField("quantity", event.target.value)}
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark" help={fieldErrors.remark && <span id="dc-remark-error">{fieldErrors.remark}</span>} validateStatus={fieldErrors.remark ? "error" : undefined} extra={<span id="dc-remark-hint">最多 2000 个字符。</span>}>
                  <Input.TextArea
                    id="dc-remark"
                    aria-invalid={!!fieldErrors.remark}
                    aria-describedby={`dc-remark-hint${fieldErrors.remark ? " dc-remark-error" : ""}`}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) => editField("remark", event.target.value)}
                  />
                </Form.Item>
                <p className="dc-muted">
                  修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                </p>
              </Form>
            ) : (
              <div>
                <div className="dc-detail-quantity">
                  <span>已确认工作量</span>
                  <strong>
                    {detail.record.settlement_status === "COMPLETE"
                      ? formatQuantity(detail.record.quantity)
                      : detail.record.status === "FINISHED"
                        ? "待补填"
                        : "进行中"}
                  </strong>
                </div>
                <div className="dc-detail-remark">
                  {detail.record.remark || "未填写备注。"}
                </div>
              </div>
            )}
            {editorError && (
              <div ref={editorSummary} role="group" tabIndex={-1} className="dc-error-summary" aria-label="工作记录操作错误"><Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              /></div>
            )}
            <Collapse
              className="dc-audit"
              items={[
                {
                  key: "segments",
                  label: `计时区间（${detail.segments.length}）`,
                  children: detail.segments.length ? (
                    detail.segments.map((segment) => (
                      <div className="dc-segment" key={segment.id}>
                        <span>
                          {formatTime(segment.start_time)}
                          <br />
                          {segment.end_time
                            ? formatTime(segment.end_time)
                            : "计时中"}
                        </span>
                        <strong className="dc-number">
                          {formatDuration(segment.duration_ms / 1000)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">
                      {detail.record.source === "MANUAL_ENTRY" && !detail.record.is_demo
                        ? "人工补录的有效工时，没有自动计时区间。"
                        : "旧记录仅保留累计工时，没有可展示的区间。"}
                    </p>
                  ),
                },
                {
                  key: "revisions",
                  label: `修正记录（${detail.revisions.length}）`,
                  children: detail.revisions.length ? (
                    detail.revisions.map((revision) => (
                      <div className="dc-revision" key={revision.revision}>
                        <strong>
                          第 {revision.revision} 次 ·{" "}
                          {formatTime(revision.changed_at)}
                        </strong>
                        <p>
                          {name(revision.before?.category)} →{" "}
                          {name(revision.after?.category)} · 数量{" "}
                          {formatQuantity(revision.before?.quantity)} →{" "}
                          {formatQuantity(revision.after?.quantity)}
                        </p>
                        <p>
                          备注：{revision.before?.remark || "未填"} →{" "}
                          {revision.after?.remark || "未填"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">尚无修正。</p>
                  ),
                },
              ]}
            />
          </div>
        )}
      </BottomSheet>
      {manualOpen && <ManualEntryModal online={online} onClose={() => setManualOpen(false)} onSaved={saved => {
        setManualOpen(false);
        applyQuery({ ...query, period: "day", anchor_date: localDate(new Date(saved.record.start_time)),
          start_date: null, end_date: null, category: null, scope: "real", status: "all", page: 1 });
        setRefresh(value => value + 1);
        void message.success("补记录已保存，可在工作明细中查看。");
      }} />}
      <Modal
        modalRender={node => <div onKeyDown={loopTabWithin} style={{display:"contents"}}>{node}</div>}
        open={confirmOpen}
        centered
        width={460}
        zIndex={1200}
        mask={{ closable: false }}
        keyboard={!busy}
        closable={false}
        destroyOnHidden
        title={
          confirmation === "delete" ? "删除这条记录？" : "保留未保存的修改？"
        }
        onCancel={closeConfirmation}
        afterOpenChange={(open) => {
          if (open) safeConfirmAction.current?.focus({ preventScroll: true });
        }}
        afterClose={() => {
          setConfirmation(null);
          setDeleting(null);
          const action = afterConfirm.current;
          afterConfirm.current = null;
          action?.();
        }}
        footer={
          confirmation === "delete" ? (
            <Space>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                取消
              </Button>
              <Button
                danger
                type="primary"
                aria-label="确认删除"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void remove();
                }}
              >
                确认删除
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button
                type="primary"
                aria-label="保存并继续"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      afterConfirm.current = next.current;
                      next.current = null;
                      setConfirmOpen(false);
                    }
                  });
                }}
              >
                保存并继续
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  afterConfirm.current = next.current;
                  next.current = null;
                  setConfirmOpen(false);
                }}
              >
                放弃修改
              </Button>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                继续编辑
              </Button>
            </Space>
          )
        }
      >
        {confirmation === "delete" ? (
          <>
            <p className="dc-confirm-description">
              {deleting &&
                `${name(deleting.category)} · ${formatTime(deleting.start_time)}${deleting.is_demo ? " · 演示数据" : ""}`}
            </p>
            <p className="dc-confirm-description">
              删除后不可撤销，计时区间和修正记录也会一同删除。
            </p>
          </>
        ) : (
          <p className="dc-confirm-description">
            保存成功后再离开；保存失败会保留输入。
          </p>
        )}
        {editorError && (
          <div ref={confirmSummary} role="group" tabIndex={-1} className="dc-error-summary" aria-label="确认操作错误"><Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          /></div>
        )}
      </Modal>
    </div>
  );
}
export default function Dashboard() {
  return (
    <UiProvider>
      <DashboardContent />
    </UiProvider>
  );
}
```

## NEW FILE E:\WorkMemo\src\dashboard\FilterDateField.tsx

```tsx
import { useMemo } from "react";
import { DatePicker, Form } from "antd";
import dayjs from "dayjs";

const minDate = dayjs("1970-01-01");
const maxDate = dayjs("9999-12-31");

export function FilterDateField({ label, value, onChange, required = false, error }: {
  label: string; value: string | null; onChange: (value: string | null) => void;
  required?: boolean; error: string;
}) {
  // Picker resets its panel when the value reference changes. Polling must not
  // replace this object while the user is browsing a different month/year.
  const date = useMemo(() => value ? dayjs(value) : null, [value]);
  const id = `dc-filter-date-${required ? "anchor" : label === "开始日期" ? "start" : "end"}`;
  return <Form.Item label={label} htmlFor={id} validateStatus={error && !required ? "error" : undefined}>
    <DatePicker id={id} aria-required={required} aria-invalid={!!error && !required}
      aria-describedby={error && !required ? "dc-filter-error" : undefined}
      aria-label={label} value={date} minDate={minDate} maxDate={maxDate}
      allowClear={!required} format="YYYY-MM-DD" inputReadOnly={false}
      onChange={next => onChange(next?.format("YYYY-MM-DD") ?? null)} />
  </Form.Item>;
}
```

## UPDATE E:\WorkMemo\src\dashboard\ChartDataTable.tsx

```tsx
import { Collapse, Table } from "antd";

/** The same server aggregates as the canvas, with keyboard-readable values. */
export function ChartDataTable({ title, rows }: {
  title: string; rows: readonly { label: string; duration_ms: number }[];
}) {
  return <Collapse className="dc-chart-data" size="small" items={[{
    key: "data", label: `查看${title}数据`,
    children: <Table aria-label={`${title}数据`} rowKey="label" size="small"
      dataSource={[...rows]} pagination={{pageSize:12,showSizeChanger:false,hideOnSinglePage:true}}
      locale={{emptyText:"当前范围没有有效工时数据。"}}
      columns={[
        {title:"周期",dataIndex:"label",rowScope:"row"},
        {title:"有效工时（小时/分钟）",dataIndex:"duration_ms",render:(value:number)=>`${Math.floor(value / 3_600_000)}小时${Math.floor(value % 3_600_000 / 60_000)}分钟${value > 0 && value < 60_000 ? "（不足1分钟）" : ""}`},
      ]} />,
  }]} />;
}
```

## UPDATE E:\WorkMemo\src\ui\BottomSheet.tsx

```tsx
import { Drawer, type DrawerProps } from "antd";
import { useMediaQuery } from "./UiProvider";
import { loopTabWithin } from "./loopTabWithin";

/** Ant Design owns motion, focus registration and scroll locking. */
export function BottomSheet({
  blocked = false,
  covered = false,
  ...props
}: DrawerProps & { blocked?: boolean; covered?: boolean }) {
  const narrow = useMediaQuery("(max-width: 640px)");
  // Percentages follow the fixed overlay's visible height, including CSS/browser zoom.
  return (
    <Drawer
      {...props}
      placement="bottom"
      size={narrow ? "calc(100% - 24px)" : "min(760px, 88%)"}
      rootClassName="dc-sheet-root"
      className="dc-sheet"
      destroyOnHidden={false}
      push={false}
      mask={{ closable: false }}
      keyboard={!blocked}
      focusable={{ trap: !covered, focusTriggerAfterClose: true }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (!covered) loopTabWithin(event);
      }}
      closable={{
        disabled: blocked,
        placement: "end",
        "aria-label": "关闭工作详情",
      }}
      styles={{
        wrapper: {
          width: narrow ? "calc(100% - 24px)" : "min(760px, calc(100% - 48px))",
          marginInline: "auto",
          marginBlock: "auto",
          insetInline: 0,
          insetBlock: 0,
          borderRadius: 20,
          overflow: "hidden",
        },
        section: {
          background: "#fafdfa",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 90px #173c2b30",
        },
        header: { padding: "20px 24px", flexShrink: 0 },
        body: {
          padding: "22px 24px",
          overscrollBehavior: "contain",
          overflowY: "auto",
        },
        footer: { flexShrink: 0, background: "rgb(255 255 255 / 38%)" },
        mask: {
          background: "rgb(20 38 30 / 30%)",
        },
      }}
    />
  );
}
```

## UPDATE E:\WorkMemo\src\ui\UiProvider.tsx

```tsx
import { App, ConfigProvider, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import "./overlayMotion.css";

dayjs.locale("zh-cn");

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches,
  );
  useEffect(() => {
    const media = window.matchMedia(query);
    const change = () => setMatches(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, [query]);
  return matches;
}

/** Shared Ant Design configuration; imported only by surfaces that opt into it. */
export function UiProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const theme = useMemo<ThemeConfig>(
    () => ({
      token: {
        colorPrimary: "#287b63",
        colorInfo: "#287b63",
        colorSuccess: "#287b63",
        colorText: "#243c33",
        colorTextSecondary: "#52685b",
        colorTextTertiary: "#52685b",
        colorTextDescription: "#52685b",
        colorTextPlaceholder: "#52685b",
        colorWarningText: "#805500",
        gold: "#805500",
        blue: "#135eb3",
        colorBgLayout: "#f4f7f5",
        colorBorder: "#75897d",
        colorBorderSecondary: "#e9efeb",
        colorError: "#b74251",
        colorInfoBg: "#eef7f2",
        colorInfoBorder: "#cfe5d8",
        colorSuccessBg: "#edf7f0",
        colorSuccessBorder: "#cfe5d8",
        colorPrimaryBg: "#eaf3ee",
        colorBgContainer: "rgb(255 255 255 / 66%)",
        colorBgElevated: "rgb(255 255 255 / 90%)",
        fontFamily: '"Segoe UI", "Microsoft YaHei UI", sans-serif',
        fontSize: 14,
        borderRadius: 10,
        controlHeight: 38,
        motion: !reducedMotion,
        motionDurationMid: "0.18s",
        motionDurationSlow: "0.24s",
      },
      components: {
        Button: {
          primaryShadow: "none",
          defaultShadow: "none",
          fontWeight: 500,
          colorPrimary: "rgb(40 123 99 / 9%)",
          colorPrimaryHover: "rgb(40 123 99 / 15%)",
          colorPrimaryActive: "rgb(40 123 99 / 22%)",
          primaryColor: "#285c49",
          defaultBg: "rgb(255 255 255 / 34%)",
          defaultColor: "#365a48",
          defaultBorderColor: "rgb(68 105 81 / 24%)",
          defaultHoverBg: "rgb(40 123 99 / 8%)",
          defaultActiveBg: "rgb(40 123 99 / 15%)",
        },
        Table: {
          headerBg: "rgb(246 249 247 / 55%)",
          headerColor: "#52685b",
          rowHoverBg: "#f7faf8",
          cellPaddingBlock: 16,
        },
        Card: { headerBg: "transparent" },
        Drawer: { footerPaddingBlock: 16, footerPaddingInline: 24 },
        Menu: {
          collapsedWidth: 68,
          itemBorderRadius: 10,
          itemSelectedBg: "#eaf3ee",
        },
      },
    }),
    [reducedMotion],
  );
  return (
    <ConfigProvider
      prefixCls="wm"
      locale={zhCN}
      theme={theme}
      button={{ autoInsertSpace: false }}
      form={{requiredMark:(label,{required}) => <>{required && <span className="dc-required-mark" aria-hidden="true">*</span>}{label}</>}}
    >
      <App className="wm-ui-root">{children}</App>
    </ConfigProvider>
  );
}
```

## NEW FILE E:\WorkMemo\src\ui\overlayMotion.css

```css
/* Keep Ant Design's lifecycle and reduced-motion handling. Animate only the
   composited panel/opacity, without scaling text or travelling a full screen. */
@media (prefers-reduced-motion: no-preference) {
  .wm-modal.wm-zoom-enter-active,
  .wm-modal.wm-zoom-appear-active {
    animation-name: wm-overlay-in;
    animation-timing-function: ease-out;
  }
  .wm-modal.wm-zoom-leave-active {
    animation-name: wm-overlay-out;
    animation-timing-function: ease-in;
  }
  .wm-drawer .wm-drawer-panel-motion-bottom-enter,
  .wm-drawer .wm-drawer-panel-motion-bottom-appear,
  .wm-drawer .wm-drawer-panel-motion-bottom-leave-active {
    transform: translateY(12px);
    opacity: 0;
  }
  .wm-drawer .wm-drawer-panel-motion-bottom-enter-active,
  .wm-drawer .wm-drawer-panel-motion-bottom-appear-active {
    transform: none;
    opacity: 1;
  }
  .wm-drawer .wm-drawer-content-wrapper {
    transition-property: transform, opacity;
  }
}
@keyframes wm-overlay-in {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
@keyframes wm-overlay-out {
  from { transform: none; opacity: 1; }
  to { transform: translateY(8px); opacity: 0; }
}
```

## NEW FILE E:\WorkMemo\scripts\verify-web-feedback.mjs

```javascript
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:4174';
const output = new URL('../artifacts/web-feedback/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const result = { passed: [], errors: [], motion: [] };
try {
 for (const reducedMotion of ['no-preference', 'reduce']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Asia/Shanghai', reducedMotion });
  const page = await context.newPage(); page.setDefaultTimeout(12000);
  page.on('pageerror', error => result.errors.push(error.message));
  const state = await dashboardFixture(page);
  await page.goto(base + '/dashboard#token=isolated-feedback');
  await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  const input = page.getByRole('textbox', { name: '基准日期', exact: true });
  await input.fill('2026-11-16'); await input.press('Enter');
  await page.locator('.wm-picker-dropdown:visible').waitFor({ state: 'hidden' });
  await input.click();
  const popup = page.locator('.wm-picker-dropdown:visible');
  await popup.locator('.wm-picker-header-prev-btn').click();
  const month = await popup.locator('.wm-picker-header-view').innerText();
  assert.match(month, /10月/);
  await page.waitForTimeout(4500); // More than two real polling cycles.
  assert.equal(await popup.locator('.wm-picker-header-view').innerText(), month);
  await popup.locator('.wm-picker-header-super-prev-btn').click();
  const year = await popup.locator('.wm-picker-header-view').innerText();
  await page.waitForTimeout(2400);
  assert.equal(await popup.locator('.wm-picker-header-view').innerText(), year);
  const cell = popup.locator('td.wm-picker-cell-in-view').filter({ hasText: /^10$/ }).first();
  const chosen = await cell.getAttribute('title'); await cell.click();
  assert.equal(await input.inputValue(), chosen);
  await page.getByRole('button', { name: '应用筛选', exact: true }).click();
  await page.waitForTimeout(300);
  assert.equal(await input.inputValue(), chosen);
  await page.locator('.wm-segmented-item').filter({ hasText: '自定义' }).click();
  for (const name of ['开始日期', '结束日期']) {
   const field = page.getByRole('textbox', { name, exact: true }); await field.click();
   await popup.locator('.wm-picker-header-prev-btn').click();
   const header = await popup.locator('.wm-picker-header-view').innerText();
   await page.waitForTimeout(2400);
   assert.equal(await popup.locator('.wm-picker-header-view').innerText(), header);
   await field.press('Escape'); await popup.waitFor({ state: 'hidden' });
  }
  result.passed.push(reducedMotion + ': anchor/start/end month and year survive polling; selected day applies');
  await page.reload(); await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  await page.getByText('查看趋势数据', { exact: true }).click();
  const table = page.getByRole('table', { name: '趋势数据', exact: true });
  await table.getByRole('columnheader', { name: '有效工时（小时/分钟）', exact: true }).waitFor();
  assert.match(await table.innerText(), /\d+小时\d+分钟/);
  assert.equal(await page.getByText('有效工时（秒）', { exact: true }).count(), 0);
  result.passed.push(reducedMotion + ': chart table displays hours/minutes');
  for (const edit of [false, true]) {
   await page.locator(edit ? '.dc-records tr[data-row-key="5"]' : '.dc-records tr[data-row-key="1"]').getByRole('button', { name: edit ? '补填' : '详情', exact: true }).click();
   const dialog = page.getByRole('dialog'); await dialog.waitFor();
   const effects = await page.locator('.dc-sheet-root').evaluate(el => ({
    blur: [...el.querySelectorAll('*')].map(n => getComputedStyle(n).backdropFilter).filter(v => v !== 'none'),
    frames: el.getAnimations({ subtree: true }).map(a => a.effect.getKeyframes().map(k => ({ transform: k.transform, opacity: k.opacity })))
   }));
   assert.deepEqual(effects.blur, []);
   for (const frames of effects.frames) for (const frame of frames) if (frame.transform) assert.ok(['translateY(12px)', 'none'].includes(frame.transform), frame.transform);
   result.motion.push({ reducedMotion, edit, ...effects });
   await page.waitForTimeout(400);
   await page.keyboard.press('Tab');
   assert.equal(await page.locator('.dc-sheet-root').evaluate(el => el.contains(document.activeElement)), true);
   await page.getByRole('button', { name: '关闭工作详情', exact: true }).click();
   await dialog.waitFor({ state: 'hidden' });
  }
  await page.getByRole('button', { name: '补记录', exact: true }).click();
  await page.getByRole('dialog', { name: '补记录', exact: true }).waitFor();
  await page.waitForTimeout(30);
  const names = await page.locator('.wm-modal').evaluate(el => el.getAnimations().map(a => a.animationName));
  if (reducedMotion === 'no-preference') assert.ok(names.includes('wm-overlay-in'), JSON.stringify(names));
  result.motion.push({ reducedMotion, modalAnimations: names });
  await page.waitForTimeout(350); await page.getByRole('button', { name: '取消', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(state.saves, 0); assert.equal(state.manualSaves, 0);
  result.passed.push(reducedMotion + ': detail/editor/manual entry open and close, focus works, no data writes');
  await page.screenshot({ path: new URL(`overview-${reducedMotion}.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
  await context.close();
 }
 assert.deepEqual(result.errors, []);
} finally {
 await writeFile(new URL('results.json', output), JSON.stringify(result, null, 2));
 await browser.close();
}
console.log(JSON.stringify(result, null, 2));
```

## UPDATE E:\WorkMemo\scripts\verify-web-phase-b.mjs

```javascript
// UI/AX regression against isolated API fixtures, never a user database.
import assert from 'node:assert/strict';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath,pathToFileURL } from 'node:url';
import {checkContrast} from './web-contrast.mjs';
import { dashboardFixture } from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const output=new URL('../artifacts/web-phase-b/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={base,passed:[],errors:[],axe:{},contrast:{}};
let context,page;
async function setup(width=1440,height=1000){
 await context?.close();context=await browser.newContext({viewport:{width,height},timezoneId:'Asia/Shanghai'});
 page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>result.errors.push(e.message));
 await page.route('**/dashboard',async route=>{const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});});
 const state=await dashboardFixture(page);
 await page.goto(base+'/dashboard#token=isolated-phase-b');await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
 return state;
}
async function axe(name){
 if(!process.env.WORKMEMO_AXE)return;
 await page.waitForTimeout(450);
 if(!await page.evaluate(()=>!!window.axe))await page.evaluate(await readFile(process.env.WORKMEMO_AXE,'utf8'));
 const report=await page.evaluate(async()=>{
  const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}});
  return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
 });
 result.axe[name]=report;
 await writeFile(new URL(`axe-${name}.json`,output),JSON.stringify(report,null,2));
 assert.deepEqual(report.violations,[],`axe ${name}`);
}
async function focused(locator){await locator.evaluate(el=>new Promise((resolve,reject)=>{const end=performance.now()+1500;function check(){if(el===document.activeElement)resolve();else if(performance.now()>end)reject(new Error('Focus did not reach '+el.outerHTML.slice(0,150)));else requestAnimationFrame(check);}check();}));}
async function insideViewport(locator){
 assert.equal(await locator.evaluate(el=>{
  const rect=el.getBoundingClientRect(),host=el.closest('.wm-drawer-body,.wm-modal-body')?.getBoundingClientRect();
  return rect.top>=0&&rect.bottom<=innerHeight&&(!host||(rect.top>=host.top&&rect.bottom<=host.bottom));
 }),true);
}
async function date(name,value){const field=page.getByRole('textbox',{name,exact:true});await field.fill(value);await field.press('Enter');await page.locator('.wm-picker-dropdown:visible').waitFor({state:'hidden'});}
async function modal(){await page.getByRole('button',{name:'补记录',exact:true}).click();await page.getByRole('dialog',{name:'补记录',exact:true}).waitFor();await page.waitForTimeout(300);}
try{
 {
  const state=await setup();await axe('overview');
  result.contrast.overview=await checkContrast(page,output,'overview',['.dc-sync','.dc-eyebrow','.dc-heading p','.dc-kpi-label','.dc-card-title p','.wm-form-item-label label','.wm-table-thead th','.wm-tag']);
  await page.getByRole('button',{name:'编辑',exact:true}).first().click();
  const quantity=page.getByRole('textbox',{name:'工作量',exact:true});await quantity.fill('-1');
  await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#dc-quantity')?.getAttribute('aria-invalid')==='true');
  await focused(quantity);await insideViewport(quantity);
  assert.match(await quantity.getAttribute('aria-describedby'),/dc-quantity-error/);assert.equal(state.saves,0);
  await quantity.fill('0');assert.equal(await quantity.getAttribute('aria-invalid'),'false');
  const remark=page.getByRole('textbox',{name:'备注',exact:true});await remark.fill('😀'.repeat(2001));
  await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#dc-remark')?.getAttribute('aria-invalid')==='true');
  await focused(remark);await insideViewport(remark);assert.equal((await remark.inputValue()).length,4002);
  await remark.fill('😀'.repeat(2000));await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.getByRole('button',{name:'编辑工作量',exact:true}).waitFor();assert.equal(state.saves,1);
  await axe('detail');
  result.contrast.detail=await checkContrast(page,output,'detail',['.wm-descriptions-item-label','.dc-sheet-root .wm-tag']);
  result.passed.push('editor errors focus visible fields, clear on edit, and preserve 2000 Unicode characters');
 }
 {
  const state=await setup();await modal();
  const quantity=page.getByRole('textbox',{name:'补录工作量',exact:true});
  assert.equal(await quantity.getAttribute('aria-invalid'),'false');
  assert.equal(await quantity.evaluate(el=>el.labels.length),1);
  assert.match(await quantity.getAttribute('aria-describedby'),/quantity-hint/);
  await page.getByRole('button',{name:'保存补录',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('input[aria-label="补录工作量"]')?.getAttribute('aria-invalid')==='true');
  await focused(quantity);await insideViewport(quantity);assert.equal(state.manualSaves,0);
  await quantity.fill('0');await date('补录开始时间','2026-10-28 11:00');await date('补录结束时间','2026-10-28 09:00');
  await page.getByRole('button',{name:'保存补录',exact:true}).click();
  const summary=page.getByRole('group',{name:'补录校验错误',exact:true});await summary.waitFor();await page.waitForTimeout(40);await focused(summary);await insideViewport(summary);
  await page.getByRole('button',{name:'检查起止时间',exact:true}).click();await focused(page.getByRole('textbox',{name:'补录开始时间',exact:true}));
  assert.equal(state.manualSaves,0);await axe('manual-error');
  result.contrast.manual=await checkContrast(page,output,'manual',['.dc-manual-entry .wm-form-item-label label','.dc-manual-entry .wm-form-item-extra','.dc-manual-entry .wm-form-item-explain-error','.dc-manual-entry .wm-alert-title']);
  result.passed.push('manual entry exposes labels, required/hint/error semantics and navigable cross-field time errors');
 }
 {
  await setup();await modal();await page.getByRole('textbox',{name:'补录工作量',exact:true}).fill('2');
  const cancel=page.getByRole('dialog',{name:'补记录',exact:true}).getByRole('button',{name:'取消',exact:true});await cancel.click();
  const guard=page.getByRole('dialog',{name:'放弃这次补记录？',exact:true});await guard.waitFor();
  assert.equal(await page.locator('input[aria-label="补录工作量"]').evaluate(el=>!!el.closest('[inert]')),true);
  for(let i=0;i<10;i++){await page.keyboard.press('Tab');assert.equal(await guard.evaluate(el=>el.contains(document.activeElement)),true);}
  await axe('manual-guard');
  await guard.getByRole('button',{name:'继续填写',exact:true}).click();await guard.waitFor({state:'hidden'});await page.waitForTimeout(300);
  assert.equal(await page.locator('input[aria-label="补录工作量"]').evaluate(el=>!!el.closest('[inert]')),false);await focused(cancel);
  result.passed.push('nested manual confirmation isolates the lower form, traps focus and restores its trigger');
 }
 {
  await setup();const trigger=page.getByRole('button',{name:'评测待补填1条',exact:true});await trigger.click();
  await page.getByRole('button',{name:'补填记录5',exact:true}).waitFor();
  assert.equal(await page.locator('.dc-page').evaluate(el=>el.inert),true);
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await page.locator('.dc-sheet-root .wm-drawer-section').evaluate(el=>el.contains(document.activeElement)),true);}
  await page.getByRole('button',{name:'关闭',exact:true}).click();await page.locator('.dc-sheet-root .wm-drawer-section').waitFor({state:'hidden'});await page.waitForTimeout(300);await focused(trigger);
  result.passed.push('pending selection isolates the page and restores keyboard focus on close');
 }
 {
  const state=await setup();await page.getByRole('button',{name:'查看趋势数据',exact:true}).click();
  const trend=page.getByRole('table',{name:'趋势数据',exact:true});await trend.waitFor();assert.match(await trend.innerText(),/周期/);
  const expected=state.data(state.currentQuery).trend[9].duration_ms;assert.ok((await trend.innerText()).includes(`${Math.floor(expected/3600000)}小时${Math.floor(expected%3600000/60000)}分钟`));
  await page.getByRole('button',{name:'辅助分析',exact:true}).click();await page.getByRole('button',{name:'查看工作日历数据',exact:true}).click();
  const calendar=page.getByRole('table',{name:'工作日历数据',exact:true});await calendar.waitFor();assert.match(await calendar.innerText(),/2026-10-29/);
  await axe('chart-data');await page.emulateMedia({forcedColors:'active'});
  await calendar.getByRole('columnheader',{name:'有效工时（小时/分钟）',exact:true}).waitFor();
  const chartButton=page.getByRole('button',{name:'查看工作日历数据',exact:true});await chartButton.focus();await page.keyboard.press("Shift+Tab");await page.keyboard.press("Tab");await focused(chartButton);
  assert.notEqual(await chartButton.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await page.screenshot({path:fileURLToPath(new URL('forced-colors.png',output))});
  result.passed.push('trend/calendar tables expose server values and remain usable with forced colors');
 }
 {
  await setup();await page.waitForTimeout(350);
  await page.evaluate(()=>{window.liveChanges=[];new MutationObserver(()=>window.liveChanges.push(document.querySelector('.dc-announcer').textContent)).observe(document.querySelector('.dc-announcer'),{childList:true,subtree:true,characterData:true});});
  await page.waitForTimeout(6500);assert.deepEqual(await page.evaluate(()=>window.liveChanges),[]);
  assert.equal(await page.locator('.dc-sync').getAttribute('aria-live'),null);
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();await page.getByRole('status').filter({hasText:'工作数据已刷新'}).waitFor();
  result.passed.push('background polling is silent; explicit refresh announces completion');
 }
 {
  await setup(320,568);await modal();await page.getByRole('button',{name:'保存补录',exact:true}).click();
  const field=page.getByRole('textbox',{name:'补录工作量',exact:true});await page.waitForTimeout(350);await focused(field);await insideViewport(field);await axe('mobile-manual');
  await page.screenshot({path:fileURLToPath(new URL('mobile-error.png',output))});
  result.passed.push('short mobile viewport keeps the invalid field visible and the form scrollable');
 }
 assert.deepEqual(result.errors,[]);await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(error){await page?.screenshot({path:fileURLToPath(new URL('failure.png',output))}).catch(()=>{});await writeFile(new URL('failure.json',output),JSON.stringify({...result,error:String(error)},null,2));throw error;}
finally{await browser.close();}
```

## UPDATE E:\WorkMemo\scripts\verify-web-ui.mjs

```javascript
// End-to-end Ant Design regression. All /api requests are intercepted in an isolated browser.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dashboardFixture } from "./dashboard-fixture.mjs";
const { chromium } = await import(
  process.env.WORKMEMO_PLAYWRIGHT
    ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href
    : "playwright"
);
const output = new URL("../artifacts/web-ui/qa/", import.meta.url);
const baseUrl = process.env.WORKMEMO_WEB_URL ?? "http://127.0.0.1:1420";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "Asia/Shanghai",
});
if (process.env.WORKMEMO_WEB_URL) {
  // Match the Rust data server's CSP while testing the compiled, local assets.
  await context.route("**/dashboard", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  });
}
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [],
  warnings = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (value) => {
  if (
    value.type() === "error" &&
    !value.text().includes("status of 500") &&
    !value.text().includes("status of 409")
  )
    warnings.push(value.text());
});
const state = await dashboardFixture(page);
const shot = (name) =>
  page.screenshot({
    path: fileURLToPath(new URL(name + ".png", output)),
    fullPage: false,
  });
const result = { baseUrl };
const layoutOnly = process.argv.includes("--layout-only");
const sheet = page.locator(".dc-sheet-root .wm-drawer-section");
const editor = page.locator("#dc-editor");
const report = page.locator(".dc-category-report");
const quantity = page.getByRole("textbox", { name: "工作量", exact: true });
async function open(edit = false, index = 0) {
  await page.locator(".dc-page").waitFor({ state: "visible" });
  const background = await page.locator(".dc-page").boundingBox();
  await page
    .locator(".dc-records")
    .getByRole("button", { name: edit ? "编辑" : "详情", exact: true })
    .nth(index)
    .click();
  await sheet.waitFor();
  await page.waitForTimeout(350);
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".wm-drawer-content-wrapper")
        ?.className.includes("-active"),
  );
  const locked = await page.locator(".dc-page").boundingBox();
  assert.ok(
    Math.abs(background.x - locked.x) < 1 &&
      Math.abs(background.width - locked.width) < 1,
    "opening the sheet must not shift the background",
  );
}
async function close() {
  await sheet.getByRole("button", { name: "关闭", exact: true }).click();
  await sheet.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.querySelector(".dc-page")?.inert === false,
  );
}
async function select(label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page
    .locator(".wm-select-dropdown:visible")
    .getByText(option, { exact: true })
    .last()
    .click();
}
try {
  await page.goto(`${baseUrl}/dashboard#token=isolated-web-ui-fixture`);
  await report.getByText("128.5", { exact: true }).waitFor();
  assert.equal(await page.locator(".dc-kpi").count(), 3);
  assert.equal(await report.locator("tbody tr[data-row-key]").count(), 4);
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(1).textContent(),
    "0",
  );
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(2).textContent(),
    "待补填",
  );
  await shot("overview-desktop");
  await page.screenshot({
    path: fileURLToPath(new URL("overview-full.png", output)),
    fullPage: true,
  });
  if (!layoutOnly) {
    // Wait for the real canvas entrance animation, including slower CI/browser scheduling.
    await page.locator(".dc-trend .dc-chart canvas").evaluate(canvas => new Promise((resolve, reject) => {
      const started = performance.now(); let previous = "", stable = 0;
      function sample() {
        const current = canvas.toDataURL();
        stable = current === previous ? stable + 1 : 0; previous = current;
        if (stable >= 4 && performance.now() - started >= 350) return resolve(true);
        if (performance.now() - started > 5000) return reject(Error("Initial chart did not settle"));
        requestAnimationFrame(sample);
      }
      sample();
    }));
    const graph = await page.locator(".dc-trend .dc-chart").screenshot();
    await page.waitForTimeout(2400);
    const polledGraph = await page.locator(".dc-trend .dc-chart").screenshot();
    await writeFile(new URL("poll-before.png", output), graph);
    await writeFile(new URL("poll-after.png", output), polledGraph);
    assert.ok(graph.equals(polledGraph), "unchanged polling must not redraw a different chart");
    result.stablePolling = true;

    await open(true);
    assert.equal(state.saves, 0, "entering edit must not submit");
    await page.waitForFunction(
      () => document.activeElement?.id === "dc-quantity",
    );
    await shot("edit-desktop");
    const geometry = await sheet.boundingBox();
    assert.ok(
      geometry.width <= 761 && geometry.height <= 881,
      JSON.stringify(geometry),
    );
    assert.ok(
      Math.abs(geometry.y + geometry.height / 2 - 500) < 2 && Math.abs(geometry.x + geometry.width / 2 - 720) < 2,
      JSON.stringify(geometry),
    );
    const scrollY = await page.evaluate(() => scrollY);
    await page.mouse.move(80, 200);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(180);
    assert.equal(
      await page.evaluate(() => window.scrollY),
      scrollY,
      "background wheel is locked",
    );
    await quantity.fill("0");
    for (const status of [500, 409]) {
      state.saveFailure = status;
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet
        .getByRole("alert")
        .filter({
          hasText: status === 409 ? "记录已被其他窗口修改" : "隔离保存失败",
        })
        .waitFor();
      assert.equal(await quantity.inputValue(), "0");
    }
    state.saveFailure = null;
    state.queryDelay = 900;
    await page.evaluate(() => {
      window.webFrames = [];
      window.webSample = true;
      const sample = () => {
        if (!window.webSample) return;
        window.webFrames.push({
          report: !!document.querySelector(".dc-report-table tbody"),
          kpi: document.querySelector(".dc-kpi strong")?.textContent,
          y: scrollY,
          loading: !!document.querySelector(".dc-category-report .dc-loading"),
        });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await page.waitForTimeout(1200);
    const frames = await page.evaluate(() => {
      window.webSample = false;
      return window.webFrames;
    });
    assert.ok(frames.length > 10);
    assert.ok(
      frames.every(
        (frame) =>
          frame.report &&
          !frame.loading &&
          !frame.kpi.startsWith("—") &&
          frame.y === scrollY,
      ),
      "save must preserve the background at every sampled frame",
    );
    await close();
    await report.getByText("98.5", { exact: true }).waitFor();
    // The Drawer restores the trigger after its leave callback, on the next frame.
    await page.waitForFunction(
      element => element === document.activeElement,
      await page.locator(".dc-records").getByRole("button", { name: "编辑", exact: true }).first().elementHandle(),
    );
    assert.equal(await page.evaluate(() => window.scrollY), scrollY);
    assert.equal(
      await page
        .locator(".dc-records")
        .getByRole("button", { name: "编辑", exact: true })
        .first()
        .evaluate((el) => el === document.activeElement),
      true,
    );
    state.queryDelay = 0;
    result.saveNoFlicker = {
      sampledFrames: frames.length,
      zero: true,
      failuresPreserveInput: true,
      focusRestored: true,
    };

    state.queryFailure = true;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor();
    await report.getByText("98.5", { exact: true }).waitFor();
    state.queryFailure = false;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor({ state: "detached" });
    result.staleSnapshotLabel = true;

    await open(true);
    await quantity.fill("12.5");
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    const guard = page.getByRole("dialog", { name: "保留未保存的修改？" });
    await guard.waitFor();
    await page.waitForFunction(
      () => document.activeElement?.textContent === "继续编辑",
    );
    await shot("unsaved-confirmation");
    await page.keyboard.press("Control+s");
    assert.equal(state.saves, 3);
    await page.keyboard.press("Escape");
    await guard.waitFor({ state: "hidden" });
    assert.equal(await quantity.inputValue(), "12.5");
    assert.equal(
      await sheet.isVisible(),
      true,
      "one Escape must close only the confirmation",
    );
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.nestedGuard = true;

    await open(true);
    await quantity.fill("1.25e2");
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.records[0].quantity, 125);
    await close();
    result.scientificQuantity = true;

    // Invalid quantities remain strings and never reach the save endpoint.
    await open(true);
    const beforeInvalid = state.saves;
    for (const value of ["-1", "1e-9999", "1000000001"]) {
      await quantity.fill(value);
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet.getByRole("alert").waitFor();
      assert.equal(state.saves, beforeInvalid);
      assert.equal(await quantity.inputValue(), value);
    }
    // Official Select popup stays inside the sheet and has keyboard selection.
    await sheet
      .getByRole("combobox", { name: "工作类别", exact: true })
      .click();
    const popup = sheet.locator(".wm-select-dropdown:visible");
    await popup.getByText("质检", { exact: true }).last().click();
    assert.equal(
      await sheet
        .getByRole("combobox", { name: "工作类别", exact: true })
        .getAttribute("aria-expanded"),
      "false",
    );
    await sheet
      .getByRole("button", { name: "关闭", exact: true })
      .last()
      .click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.validationAndSheetSelect = true;

    // Persisted writes cannot be relabelled as failed when a follow-up GET fails.
    await open(true);
    await quantity.fill("126");
    state.detailFailure = true;
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await sheet
      .getByRole("alert")
      .filter({ hasText: "已保存，详情刷新失败" })
      .waitFor();
    assert.equal(state.records[0].quantity, 126);
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    state.detailFailure = false;
    await close();
    result.committedReadFailure = true;

    // The guard's own save succeeds/fails without submitting the underlying form twice.
    await open(true);
    await quantity.fill("127");
    await page.keyboard.press("Escape");
    await guard.waitFor();
    const beforeGuardSave = state.saves;
    state.saveFailure = 500;
    await guard
      .getByRole("button", { name: "保存并继续", exact: true })
      .click();
    await guard
      .getByRole("alert")
      .filter({ hasText: "隔离保存失败" })
      .waitFor();
    assert.equal(state.saves, beforeGuardSave + 1);
    state.saveFailure = null;
    await guard.getByRole("button", { name: /保存并继续$/ }).click();
    await guard.waitFor({ state: "hidden" });
    await sheet.waitFor({ state: "hidden" });
    assert.equal(state.records[0].quantity, 127);
    result.guardSave = true;

    // DatePicker and Segmented retain natural-period and local-date semantics.
    await page
      .locator(".dc-period-bar")
      .getByText("周", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-10-26 — 2026-11-01" })
      .waitFor();
    assert.equal(
      await page.getByRole("button", { name: "下一周期" }).isEnabled(),
      true,
    );
    await page.getByRole("button", { name: "下一周期" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-11-02 — 2026-11-08" })
      .waitFor();
    await page.getByRole("button", { name: "上一周期" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("月", { exact: true })
      .click();
    const date = page.getByRole("textbox", { name: "基准日期", exact: true });
    await date.fill("2024-02-29");
    await date.press("Enter");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2024 年 02 月" })
      .waitFor();
    assert.equal(state.currentQuery.anchor_date, "2024-02-29");
    await date.click();
    await page.locator(".wm-picker-dropdown:visible").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "本月", exact: true }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("自定义", { exact: true })
      .click();
    await page.getByRole("button", { name: "全部日期", exact: true }).click();
    await page
      .locator(".dc-category-report")
      .getByText("最早记录 — 至今", { exact: false })
      .waitFor();
    await select("筛选工作类别", "代码开发");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".dc-report-table tbody tr[data-row-key]")
          .length === 1,
    );
    assert.equal(state.currentQuery.category, "开发");
    await select("筛选工作类别", "全部类别");
    await select("数据范围", "演示数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("999", { exact: true }).waitFor();
    await select("数据范围", "真实数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("日", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026.10.29" })
      .waitFor();
    result.periodsAndScopes = true;

    // An older, deliberately delayed query must not overwrite the latest result.
    state.delayFor = (query) => (query.category === "评测" ? 650 : 0);
    await select("筛选工作类别", "评测");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await select("筛选工作类别", "质检");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("0", { exact: true }).waitFor();
    await page.waitForTimeout(850);
    assert.equal(await report.locator("tbody tr[data-row-key]").count(), 1);
    assert.equal(await report.locator(".work-badge").innerText(), "质检");
    state.delayFor = null;
    await select("筛选工作类别", "全部类别");
    await page.getByRole("button", { name: "应用筛选" }).click();
    result.staleRequestIgnored = true;

    // Pagination is controlled by the existing 50-row backend contract.
    state.many = true;
    await page.getByRole("button", { name: "刷新连接" }).click();
    await page.locator(".wm-pagination-item-2").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".wm-pagination-item-active")?.textContent ===
        "2",
    );
    assert.equal(state.currentQuery.page, 2);
    state.many = false;
    await page.locator(".wm-pagination-item-1").click();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "详情", exact: true })
      .first()
      .waitFor();
    result.pagination = true;

    // Read-only active records and explicit delete confirmation.
    const activeRow = page.locator('.dc-records tr[data-row-key="99"]');
    assert.equal(
      await activeRow
        .getByRole("button", { name: "编辑", exact: true })
        .isDisabled(),
      true,
    );
    await activeRow.getByRole("button", { name: "详情", exact: true }).click();
    await sheet.waitFor();
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    await close();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "删除", exact: true })
      .first()
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion.waitFor();
    assert.equal(state.deletes, 0);
    await deletion.getByRole("button", { name: "取消", exact: true }).click();
    await deletion.waitFor({ state: "hidden" });
    assert.equal(state.deletes, 0);
    result.readOnlyAndDeleteCancel = true;

    // Body-only scrolling, nested focus, boundary chaining, short-screen footer.
    state.segments = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      start_time: state.records[0].start_time,
      end_time: state.records[0].end_time,
      duration_ms: 30000,
      state: "CLOSED",
    }));
    await page.setViewportSize({ width: 1024, height: 520 });
    await open();
    await sheet.getByRole("button", { name: "计时区间（25）" }).click();
    const body = sheet.locator(".wm-drawer-body");
    await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const bodyTop = await body.evaluate((el) => el.scrollTop),
      backgroundTop = await page.evaluate(() => scrollY);
    await body.hover();
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => scrollY), backgroundTop);
    assert.ok((await body.evaluate((el) => el.scrollTop)) >= bodyTop);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator(".dc-sheet-root")
          .evaluate((el) => el.contains(document.activeElement)),
        true,
        JSON.stringify(
          await page.evaluate(() => ({
            focused: document.activeElement?.outerHTML.slice(0, 500),
          })),
        ),
      );
    }
    const footer = await sheet.locator(".wm-drawer-footer").boundingBox();
    assert.ok(footer.y + footer.height <= 520 && footer.y >= 0);
    await close();
    state.segments = [];
    result.shortScreenScrollAndFocus = true;
  }

  const widths = [];
  for (const width of [390, 640, 800, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(160);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `page overflow ${width}`,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await shot("overview-" + width);
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(
      Math.abs(box.y + box.height / 2 - 500) < 2 && Math.abs(box.x + box.width / 2 - width / 2) < 2,
      JSON.stringify({ width, ...box }),
    );
    await shot("sheet-" + width);
    await close();
    widths.push(width);
  }
  result.widths = widths;
  const zooms = [];
  for (const zoom of [1.25, 1.5]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(
      (value) => (document.documentElement.style.zoom = String(value)),
      zoom,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(
      box.x >= 0 &&
        box.x + box.width <= 1281 &&
        box.y >= 0 &&
        box.y + box.height <= 901 && Math.abs(box.y + box.height / 2 - 450) < 2 && Math.abs(box.x + box.width / 2 - 640) < 2,
      JSON.stringify({ zoom, ...box }),
    );
    await shot("zoom-" + zoom);
    await close();
    zooms.push(zoom);
  }
  await page.evaluate(() => (document.documentElement.style.zoom = "1"));
  result.cssZooms = zooms;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(true);
  await shot("reduced-motion");
  await close();
  result.reducedMotion = true;
  if (!layoutOnly) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      window.motionFrames = [];
      window.sampleMotion = true;
      const sample = () => {
        if (!window.sampleMotion) return;
        const panel = document.querySelector(".wm-drawer-section");
        if (panel?.getClientRects().length)
          window.motionFrames.push({
            y: panel.getBoundingClientRect().y,
            locked: document.querySelector(".dc-page").inert,
          });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await open();
    const settled = await sheet.boundingBox();
    await close();
    const animation = await page.evaluate(() => {
      window.sampleMotion = false;
      return window.motionFrames;
    });
    assert.ok(
      animation.some((frame) => frame.y > settled.y + 1) &&
      animation.every((frame) => Math.abs(frame.y - settled.y) <= 13),
      "panel motion stays within a short 12px transition",
    );
    assert.ok(
      animation.every((frame) => frame.locked),
      "background remains locked throughout both motions",
    );
    result.officialMotion = { frames: animation.length };

    await open(true);
    await quantity.fill("128");
    state.saveDelay = 400;
    const before = state.saves;
    await sheet.locator('button[form="dc-editor"]').click();
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.saves, before + 1);
    await close();
    state.saveDelay = 0;
    result.noDuplicateSubmission = true;

    const count = state.records.length;
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .getByRole("button", { name: "删除", exact: true })
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion
      .getByRole("button", { name: "确认删除", exact: true })
      .click();
    await deletion.waitFor({ state: "hidden" });
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .waitFor({ state: "detached" });
    assert.equal(state.records.length, count - 1);
    assert.equal(state.deletes, 1);
    result.deleteAndRefresh = true;

    const firstFailure = await context.newPage();
    const failed = await dashboardFixture(firstFailure);
    failed.queryFailure = true;
    firstFailure.on("pageerror", (error) => errors.push(error.message));
    await firstFailure.goto(
      `${baseUrl}/dashboard#token=isolated-first-failure`,
    );
    await firstFailure
      .getByRole("alert")
      .filter({ hasText: "隔离统计读取失败" })
      .waitFor();
    assert.ok(
      (await firstFailure.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await firstFailure.close();
    const unauth = await context.newPage();
    unauth.on("pageerror", (error) => errors.push(error.message));
    await unauth.goto(`${baseUrl}/dashboard`);
    await unauth
      .getByRole("alert")
      .filter({ hasText: "请从 WorkMemo 打开数据中心" })
      .waitFor();
    assert.ok(
      (await unauth.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await unauth.close();
    result.firstLoadAndAuthorizationErrors = true;
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  await writeFile(
    new URL(
      layoutOnly
        ? "layout-result.json"
        : process.env.WORKMEMO_WEB_URL
          ? "production-result.json"
          : "result.json",
      output,
    ),
    JSON.stringify({ ...result, errors, warnings }, null, 2),
  );
  console.log(JSON.stringify(result));
} catch (error) {
  await shot("failure");
  await writeFile(
    new URL("failure-aria.txt", output),
    await sheet.ariaSnapshot().catch(() => "sheet missing"),
  );
  await writeFile(
    new URL("failure.json", output),
    JSON.stringify(
      {
        message: error.message,
        focused: await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 700)),
        errors,
        warnings,
        saves: state.saves,
        requests: state.requests.slice(-6),
        sheet: await sheet
          .evaluate((el) => ({
            inert: el.closest("[inert]")?.outerHTML.slice(0, 100),
            ariaHidden: el.closest("[aria-hidden]")?.outerHTML.slice(0, 100),
            buttons: [...el.querySelectorAll("button")].map((b) => ({
              text: b.textContent,
              disabled: b.disabled,
              hidden: b.closest("[aria-hidden]")?.getAttribute("aria-hidden"),
            })),
          }))
          .catch(() => null),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
```

## 完整暂存命令

```powershell
git add -- src/Dashboard.tsx src/dashboard/FilterDateField.tsx src/dashboard/ChartDataTable.tsx src/ui/BottomSheet.tsx src/ui/UiProvider.tsx src/ui/overlayMotion.css scripts/verify-web-feedback.mjs scripts/verify-web-phase-b.mjs scripts/verify-web-ui.mjs docs/PHASE-8.md docs/BUILDING.md docs/WEB-FEEDBACK-FIX.md docs/WEB-FEEDBACK-FIX-SOURCE.md
```
