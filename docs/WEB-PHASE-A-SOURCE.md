# 网页阶段A完整源码（2026-11-15）

本清单包含本轮13项实现及测试文件完整内容。项目文件为实际运行入口；交付说明见WEB-PHASE-A.md。

## E:\WorkMemo\src\Dashboard.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  DatePicker,
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
import dayjs from "dayjs";
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
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
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
import { ManualEntryModal } from "./dashboard/ManualEntryModal";
import { recordStatusLabel } from "./dashboard/recordStatus";
import { CalendarChart, CategoryChart, DurationPieChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

const minDate = dayjs("1970-01-01"),
  maxDate = dayjs("9999-12-31");
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
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
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
    <Form.Item label={label}>
      <DatePicker
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => change(date?.format("YYYY-MM-DD") ?? null)}
        inputReadOnly={false}
      />
    </Form.Item>
  );
  return (
    <div className="data-center">
      <aside className="dc-sidebar" inert={!!detail || !!confirmation || manualOpen}>
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
      <div className="dc-page" inert={!!detail || !!confirmation || manualOpen}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync" aria-live="polite">
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
              onClick={() => setRefresh((value) => value + 1)}
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
              <Form.Item label="类别">
                <Select
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
              <Form.Item label="状态">
                <Select
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
              <Form.Item label="数据范围">
                <Select
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
                description={`${data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时`}
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
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category">
                  <Select
                    id="dc-category"
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) =>
                      setFields((previous) => ({
                        ...previous,
                        category: value,
                      }))
                    }
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  extra="0 表示已确认无产出；支持小数和科学计数，最大 10 亿。"
                >
                  <Input
                    id="dc-quantity"
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark">
                  <Input.TextArea
                    id="dc-remark"
                    maxLength={4000}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        remark: event.target.value,
                      }))
                    }
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
              <Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              />
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
          <Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          />
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

## E:\WorkMemo\src\dashboard\recordStatus.ts

```ts
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
```

## E:\WorkMemo\src\dashboard\Charts.tsx

```tsx
import { memo, useEffect, useMemo, useRef } from "react";
import { init, use as registerCharts, type ECharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart, PieChart } from "echarts/charts";
import { Button, Empty } from "antd";
import { durationSlices } from "./durationPie";
import { formatDuration } from "../types";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type { Data } from "./api";
import type { Presentation } from "../desktopPreferences";
import { formatQuantity, localDate } from "../history";
import { useCategoryNames } from "../categoryNames";
import { useMediaQuery } from "../ui/UiProvider";

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#fff",
  borderColor: "#dce6df",
  textStyle: { color: "#243c33" },
};

const Chart = memo(function Chart({
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
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const host = node.current;
        if (
          host &&
          (instance.getWidth() !== host.clientWidth ||
            instance.getHeight() !== host.clientHeight)
        )
          instance.resize();
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    // Merge named series; a poll must not replace the whole chart or replay its entrance.
    chart.current?.setOption(option, {
      replaceMerge: ["series"],
      lazyUpdate: true,
    });
  }, [option]);
  return <div ref={node} className="dc-chart" role="img" aria-label={label} />;
});

export function TrendChart({ trend, range }: Pick<Data, "trend" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: {
        ...tooltip,
        trigger: "axis",
        valueFormatter: (value: unknown) =>
          `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 4 })} 小时`,
      },
      legend: { top: 0, right: 16, data: ["有效工时"] },
      grid: { left: 22, right: 24, top: 64, bottom: 20, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.map((x) => x.date),
        axisLine: { lineStyle: { color: "#dce7e0" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#718078",
          hideOverlap: true,
          showMinLabel: true,
          showMaxLabel: true,
          // Backend buckets already contain canonical HH:mm, YYYY-MM-DD or YYYY-MM.
          // Keep the year so different years cannot collapse to the same axis label.
        },
      },
      yAxis: {
        type: "value",
        name: "小时",
        min: 0,
        axisLabel: { color: "#718078" },
        splitLine: { lineStyle: { color: "#edf2ef", type: "dashed" } },
      },
      series: [
        {
          id: "work-duration",
          name: "有效工时",
          type: "line",
          smooth: false,
          symbolSize: 5,
          data: trend.map((x) => x.duration_ms / 3600000),
          lineStyle: { width: 2.5, color: "#287b63" },
          itemStyle: { color: "#287b63" },
          areaStyle: { color: "#eaf3ee", opacity: 0.7 },
        },
      ],
    }),
    [trend, range, reduced],
  );
  return <Chart option={option} label="有效工时趋势" />;
}

export function CategoryChart({
  categories,
  presentation,
  metric,
  onCategory,
}: {
  categories: Data["categories"];
  presentation: Presentation;
  metric: string;
  onCategory: (name: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: {
        ...tooltip,
        trigger: "axis",
        valueFormatter: (value: unknown) => {
          const amount = Number(value);
          if (metric !== "duration") return formatQuantity(amount);
          return amount > 0 && amount < 0.01
            ? `${(amount * 3600).toLocaleString("zh-CN", { maximumFractionDigits: 3 })} 秒（不足 0.01 小时）`
            : `${amount.toLocaleString("zh-CN", { maximumFractionDigits: 4 })} 小时`;
        },
      },
      grid: { left: 12, right: 22, top: 25, bottom: 28, containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f0" } } },
      yAxis: {
        type: "category",
        data: categories.map((x) => name(x.category)),
        axisLabel: { width: 100, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          id: "category-total",
          type: "bar",
          barMaxWidth: 24,
          data: categories.map((x) => ({
            name: name(x.category),
            value:
              metric === "duration"
                ? x.duration_ms / 3600000
                : x.quantity,
            itemStyle: {
              color: presentation.categories[x.category]?.color,
              borderRadius: [0, 5, 5, 0],
            },
          })),
        },
      ],
    }),
    [categories, presentation, metric, name, reduced],
  );
  return (
    <Chart
      option={option}
      label="按类别汇总的工作分布"
      onCategory={onCategory}
    />
  );
}

export function DurationPieChart({ categories, presentation, onCategory }: {
  categories: Data["categories"];
  presentation: Presentation;
  onCategory: (category: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const slices = useMemo(() => durationSlices(categories), [categories]);
  const option = useMemo<EChartsOption>(() => ({
    animation: !reduced,
    animationDuration: 240,
    animationDurationUpdate: 160,
    tooltip: {
      ...tooltip, trigger: "item",
      formatter: params => {
        const point = Array.isArray(params) ? params[0] : params;
        const slice = slices.find(row => row.category === point.name);
        return slice ? `${name(slice.category)}\n${formatDuration(slice.value / 1000)} · ${slice.percentLabel}` : "";
      },
    },
    series: [{
      id: "category-duration-share", type: "pie", radius: "78%", center: ["50%", "50%"],
      stillShowZeroSum: false,
      label: { show: false },
      emphasis: { scaleSize: 4 },
      data: slices.map(slice => ({
        name: slice.category, value: slice.value,
        itemStyle: { color: presentation.categories[slice.category]?.color },
      })),
    }],
  }), [slices, name, presentation, reduced]);
  if (!slices.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无有效工时" />;
  return <>
    <Chart option={option} label="按类别汇总的工时占比" onCategory={onCategory} />
    <ul className="dc-pie-legend" aria-label="工时占比明细">
      {slices.map(slice => <li key={slice.category}>
        <Button type="text" style={{ width: "100%" }} onClick={() => onCategory(slice.category)} aria-label={`${name(slice.category)}：${formatDuration(slice.value / 1000)}，${slice.percentLabel}，筛选此类别`}>
          <i aria-hidden="true" style={{ background: presentation.categories[slice.category]?.color }} />
          <span className="dc-pie-name" title={name(slice.category)}>{name(slice.category)}</span>
          <span className="dc-pie-value">{slice.percentLabel}</span>
        </Button>
      </li>)}
    </ul>
  </>;
}

export function CalendarChart({
  calendar,
  range,
}: Pick<Data, "calendar" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(() => {
    const end = range.end_date ?? localDate(new Date());
    const start = new Date(`${end}T12:00:00`);
    start.setDate(start.getDate() - 89);
    const startDate =
      range.start_date && range.start_date > localDate(start)
        ? range.start_date
        : localDate(start);
    const max = Math.max(1, ...calendar.map((v) => v[1]));
    return {
      animation: !reduced,
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
        type: "piecewise",
        show: false,
        pieces: [
          { value: 0, color: "#ebedf0" },
          ...["#9be9a8", "#40c463", "#30a14e", "#216e39"].map((color, i) => ({
            gt: (i * max) / 4,
            lte: ((i + 1) * max) / 4,
            color,
          })),
        ],
      },
      calendar: {
        range: [startDate, end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#65796f" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#718078" },
        splitLine: { lineStyle: { color: "#dce6df" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          id: "work-calendar",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendar,
        },
      ],
    };
  }, [calendar, range, reduced]);
  return <Chart option={option} label="筛选范围内的有效工时工作日历" />;
}
```

## E:\WorkMemo\src\dashboard\api.ts

```ts
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
```

## E:\WorkMemo\src\dashboard\useDashboardData.ts

```ts
import { useEffect, useRef, useState } from "react";
import { useCategoryNames } from "../categoryNames";
import { api, ApiError, type Data, type Meta, type Query } from "./api";

function equal(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}
function reconcile(previous: Data | null, value: Data): Data {
  if (!previous) return value;
  if (equal(previous, value)) return previous;
  // Keep unchanged chart inputs stable even when only a quantity or active timer changes.
  return {
    ...value,
    trend: equal(previous.trend, value.trend) ? previous.trend : value.trend,
    calendar: equal(previous.calendar, value.calendar)
      ? previous.calendar
      : value.calendar,
    categories: equal(previous.categories, value.categories)
      ? previous.categories
      : value.categories,
    range: equal(previous.range, value.range) ? previous.range : value.range,
  };
}

export function useDashboardData(query: Query, refresh: number) {
  const key = JSON.stringify(query);
  const [snapshot, setSnapshot] = useState<{ key: string; value: Data | null }>(
    { key, value: null },
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const names = useRef("");
  const { accept } = useCategoryNames();
  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    let reading = false;
    setError("");
    setRefreshing(true);
    async function load() {
      if (reading) return;
      reading = true;
      try {
        const metadata = await api<Meta>("meta", undefined, { signal: controller.signal });
        if (stopped) return;
        setMeta((previous) =>
          equal(previous, metadata) ? previous : metadata,
        );
        const nameKey = JSON.stringify(metadata.category_names);
        if (names.current !== nameKey) {
          names.current = nameKey;
          accept(metadata.category_names);
        }
        const rows = await api<Data>("query", query, { signal: controller.signal });
        if (stopped) return;
        setOnline(true);
        setSnapshot((previous) => {
          const value = reconcile(
            previous.key === key ? previous.value : null,
            rows,
          );
          return previous.key === key && previous.value === value
            ? previous
            : { key, value };
        });
        setUpdatedAt(Date.now());
        setError("");
      } catch (e) {
        if (stopped || controller.signal.aborted) return;
        setError(e instanceof Error ? e.message : String(e));
        // Business validation can fail while the connection is healthy.
        setOnline(e instanceof ApiError && e.kind === "business");
      } finally {
        reading = false;
        if (!stopped) setRefreshing(false);
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
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
    // key is the complete serialized request, including pagination and source scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refresh, accept]);
  const data = snapshot.key === key ? snapshot.value : null;
  return {
    data,
    meta,
    error,
    online,
    refreshing,
    updatedAt,
    loading: !data && !error,
  };
}
```

## E:\WorkMemo\src-tauri\src\data_center.rs

```rs
//! Authenticated dashboard queries share Store, transactions and revision checks.
use super::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

#[derive(Debug, Deserialize, Default)]
#[serde(default, deny_unknown_fields)]
pub struct DashboardQuery {
    pub period: String,
    pub anchor_date: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub category: Option<String>,
    pub scope: String,
    pub status: String,
    pub page: u32,
}
#[path = "report_periods.rs"]
mod periods;

fn tagged(row: &rusqlite::Row<'_>) -> rusqlite::Result<Value> {
    let record = read_record(row)?;
    let mut value = serde_json::to_value(record)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    value["is_demo"] = row.get::<_, bool>(21)?.into();
    value["demo_batch"] = row.get::<_, Option<String>>(22)?.into();
    Ok(value)
}
#[derive(Serialize)]
pub struct TodayWorkload {
    pub category: String,
    pub quantity: f64,
    pub pending: i64,
    pub records: i64,
    pub complete: i64,
}
impl Store {
    pub fn today_workload(&self) -> Result<Vec<TodayWorkload>> {
        self.connection.prepare("SELECT category,COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),SUM(settlement_status!='COMPLETE'),COUNT(*),SUM(settlement_status='COMPLETE') FROM work_records WHERE is_demo=0 AND date(start_time/1000,'unixepoch','localtime')=date('now','localtime') GROUP BY category ORDER BY MIN(id)").map_err(db_error)?
            .query_map([],|r|Ok(TodayWorkload{category:r.get(0)?,quantity:r.get(1)?,pending:r.get(2)?,records:r.get(3)?,complete:r.get(4)?})).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)
    }
    pub fn dashboard_query(&self, mut q: DashboardQuery) -> Result<Value> {
        let mut range = periods::ReportRange::resolve(&self.connection, &q)?;
        q.start_date = range.start_date.clone();
        q.end_date = range.end_date.clone();
        if q.category
            .as_ref()
            .is_some_and(|s| !crate::presentation::CATEGORIES.contains(&s.as_str()))
        {
            return Err("工作类别无效。".into());
        }
        let scope = if q.scope.is_empty() { "real" } else { &q.scope };
        if !["real", "demo", "all"].contains(&scope)
            || !["", "all", "pending", "complete", "working", "unfinished"]
                .contains(&q.status.as_str())
        {
            return Err("数据筛选无效。".into());
        }
        let tx = self.connection.unchecked_transaction().map_err(db_error)?;
        let filter = "(?1='all' OR is_demo=CASE WHEN ?1='demo' THEN 1 ELSE 0 END) AND (?2 IS NULL OR date(start_time/1000,'unixepoch','localtime')>=?2) AND (?3 IS NULL OR date(start_time/1000,'unixepoch','localtime')<=?3) AND (?4 IS NULL OR category=?4) AND (?5='' OR ?5='all' OR (?5='pending' AND settlement_status='PENDING') OR (?5='complete' AND settlement_status='COMPLETE') OR (?5='working' AND status='WORKING') OR (?5='unfinished' AND status IN ('WORKING','SUSPENDED')))";
        let args = params![scope, q.start_date, q.end_date, q.category, q.status];
        let record_count: i64 = self
            .connection
            .query_row(
                &format!("SELECT COUNT(*) FROM work_records WHERE {filter}"),
                args,
                |r| r.get(0),
            )
            .map_err(db_error)?;
        // Report aggregates always describe ended work, independently of list paging.
        let report_filter = format!("{filter} AND status='FINISHED'");
        let (count,duration,quantity,pending,first,last):(i64,i64,f64,i64,Option<i64>,Option<i64>) = self.connection.query_row(
            &format!("SELECT COUNT(*),COALESCE(SUM(duration_ms),0),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COALESCE(SUM(settlement_status='PENDING'),0),MIN(start_time),MAX(start_time) FROM work_records WHERE {report_filter}"),args,
            |r|Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?,r.get(4)?,r.get(5)?))
        ).map_err(db_error)?;
        let months = range.period == "custom"
            && first.zip(last).is_some_and(|(a, b)| b - a > 120 * 86400000);
        if months {
            range.trend_unit = "month".into();
        }
        let group = match range.trend_unit.as_str() {
            "hour" => "strftime('%H:00',start_time/1000,'unixepoch','localtime')",
            "month" => "strftime('%Y-%m',start_time/1000,'unixepoch','localtime')",
            _ => "date(start_time/1000,'unixepoch','localtime')",
        };
        let mut trend:Vec<Value>=self.connection.prepare(&format!("SELECT {group} AS period,SUM(duration_ms),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COUNT(*) FROM work_records WHERE {report_filter} GROUP BY period ORDER BY period")).map_err(db_error)?.query_map(args,|r|Ok(json!({"date":r.get::<_,String>(0)?,"duration_ms":r.get::<_,i64>(1)?,"quantity":r.get::<_,f64>(2)?,"records":r.get::<_,i64>(3)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        if range.period != "custom" {
            let mut by_date: std::collections::BTreeMap<String, Value> = trend
                .into_iter()
                .map(|v| (v["date"].as_str().unwrap().to_string(), v))
                .collect();
            trend = range
                .buckets(&self.connection)?
                .into_iter()
                .map(|date| {
                    by_date.remove(&date).unwrap_or_else(
                        || json!({"date":date,"duration_ms":0,"quantity":0,"records":0}),
                    )
                })
                .collect();
        }
        let aggregated:Vec<Value>=self.connection.prepare(&format!("SELECT category,SUM(duration_ms),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COUNT(*),SUM(settlement_status='PENDING'),SUM(settlement_status='COMPLETE') FROM work_records WHERE {report_filter} GROUP BY category")).map_err(db_error)?.query_map(args,|r|Ok(json!({"category":r.get::<_,String>(0)?,"duration_ms":r.get::<_,i64>(1)?,"quantity":r.get::<_,f64>(2)?,"records":r.get::<_,i64>(3)?,"pending":r.get::<_,i64>(4)?,"complete":r.get::<_,i64>(5)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let categories:Vec<Value>=crate::presentation::CATEGORIES.into_iter().filter(|key|q.category.as_deref().is_none_or(|selected|selected==*key)).map(|key|aggregated.iter().find(|v|v["category"]==key).cloned().unwrap_or_else(||json!({"category":key,"duration_ms":0,"quantity":0,"records":0,"pending":0,"complete":0}))).collect();
        let calendar:Vec<Value>=self.connection.prepare(&format!("SELECT date(start_time/1000,'unixepoch','localtime') AS day,SUM(duration_ms) FROM work_records WHERE {report_filter} AND date(start_time/1000,'unixepoch','localtime')>=date(COALESCE(?3,date('now','localtime')),'-89 days') GROUP BY day ORDER BY day")).map_err(db_error)?.query_map(args,|r|Ok(json!([r.get::<_,String>(0)?,r.get::<_,i64>(1)?]))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let page = i64::from(q.page.max(1)).min(((record_count + 49) / 50).max(1));
        let rows:Vec<Value>=self.connection.prepare(&format!("SELECT {COLUMNS},is_demo,demo_batch FROM work_records WHERE {filter} ORDER BY start_time DESC,id DESC LIMIT 50 OFFSET ?6")).map_err(db_error)?.query_map(params![scope,q.start_date,q.end_date,q.category,q.status,(page-1)*50],tagged).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(
            json!({"range":range,"totals":{"records":count,"duration_ms":duration,"quantity":quantity,"pending":pending},"record_count":record_count,"trend":trend,"monthly":months,"categories":categories,"calendar":calendar,"records":rows,"page":page,"pages":((record_count+49)/50).max(1),"scope":scope}),
        )
    }
    pub fn dashboard_detail(&self, id: i64) -> Result<Value> {
        let record = self
            .connection
            .query_row(
                &format!("SELECT {COLUMNS},is_demo,demo_batch FROM work_records WHERE id=?1"),
                [id],
                tagged,
            )
            .optional()
            .map_err(db_error)?
            .ok_or("记录已不存在。")?;
        let segments:Vec<Value>=self.connection.prepare("SELECT id,start_time,end_time,duration_ms,state FROM work_segments WHERE record_id=?1 ORDER BY id").map_err(db_error)?.query_map([id],|r|Ok(json!({"id":r.get::<_,i64>(0)?,"start_time":r.get::<_,i64>(1)?,"end_time":r.get::<_,Option<i64>>(2)?,"duration_ms":r.get::<_,i64>(3)?,"state":r.get::<_,String>(4)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let revisions:Vec<Value>=self.connection.prepare("SELECT revision,changed_at,before_json,after_json FROM record_revisions WHERE record_id=?1 ORDER BY revision").map_err(db_error)?.query_map([id],|r|Ok(json!({"revision":r.get::<_,i64>(0)?,"changed_at":r.get::<_,i64>(1)?,"before":serde_json::from_str::<Value>(&r.get::<_,String>(2)?).unwrap_or(Value::Null),"after":serde_json::from_str::<Value>(&r.get::<_,String>(3)?).unwrap_or(Value::Null)}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        Ok(json!({"record":record,"segments":segments,"revisions":revisions}))
    }
    pub fn dashboard_delete(&mut self, id: i64, expected_revision: i64) -> Result<()> {
        if self.record(id)?.revision != expected_revision {
            return Err("记录已被修改，请重新读取后删除。".into());
        }
        self.delete_record(id)
    }
    pub fn seed_demo(&mut self) -> Result<i64> {
        let batch = "workmemo-v021-demo-1";
        let existing: i64 = self
            .connection
            .query_row(
                "SELECT COUNT(*) FROM work_records WHERE is_demo=1 AND demo_batch=?1",
                [batch],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        if existing > 0 {
            return Ok(existing);
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let now: i64 = tx
            .query_row("SELECT unixepoch('now')*1000", [], |r| r.get(0))
            .map_err(db_error)?;
        let categories = ["评测", "质检", "开发", "文档"];
        let mut count = 0;
        for day in 0..90_i64 {
            let modifier = format!("-{day} days");
            let weekday: String = tx
                .query_row(
                    "SELECT strftime('%w','now','localtime',?1)",
                    [&modifier],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            if day > 0 && (weekday == "0" || weekday == "6") {
                continue;
            }
            for slot in 0..3_i64 {
                let start: i64 = if day == 0 {
                    now - 3 * 3600000 + slot * 50 * 60000
                } else {
                    tx.query_row(
                        "SELECT unixepoch(date('now','localtime',?1)||' 09:00:00','utc')*1000",
                        [&modifier],
                        |r| r.get::<_, i64>(0),
                    )
                    .map_err(db_error)?
                        + slot * 3 * 3600000
                };
                let duration = if day == 0 {
                    35 * 60000
                } else {
                    (25 + (day * 17 + slot * 19) % 80) * 60000
                };
                let half = duration / 2;
                let end = start + duration + 5 * 60000;
                let pending = (day + slot) % 9 == 0;
                let quantity = if pending {
                    None
                } else {
                    Some(((day * 11 + slot * 13) % 80 + 1) as f64)
                };
                let category = categories[((day + slot) % 4) as usize];
                let revised = !pending && (day + slot) % 13 == 0;
                tx.execute("INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,recovery_pending,settlement_status,source,confirmed_end_time,end_reason,revision,is_demo,demo_batch,control_mode) VALUES(?1,?2,'演示数据 · 用于查看图表效果',?3,?4,?5,?6,'FINISHED',1,0,?7,'MANUAL_ENTRY',?4,'MANUAL',?8,1,?9,'MANUAL')",params![category,quantity,start,end,duration,duration/1000,if pending{"PENDING"}else{"COMPLETE"},if revised{1}else{0},batch]).map_err(db_error)?;
                let id = tx.last_insert_rowid();
                for (a, b) in [(start, start + half), (start + half + 5 * 60000, end)] {
                    tx.execute("INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(?1,?2,?3,?3,?4,'CLOSED')",params![id,a,b,b-a]).map_err(db_error)?;
                }
                if revised {
                    let after = tx
                        .query_row(
                            &format!("SELECT {COLUMNS} FROM work_records WHERE id=?1"),
                            [id],
                            read_record,
                        )
                        .map_err(db_error)?;
                    let mut before = after.clone();
                    before.revision = 0;
                    before.quantity = quantity.map(|v| v - 1.0);
                    before.remark = "演示：初次填写".into();
                    tx.execute("INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(?1,1,?2,?3,?4)",params![id,end+60000,serde_json::to_string(&before).map_err(|e|e.to_string())?,serde_json::to_string(&after).map_err(|e|e.to_string())?]).map_err(db_error)?;
                }
                count += 1;
            }
        }
        tx.commit().map_err(db_error)?;
        Ok(count)
    }
    pub fn clear_demo(&mut self) -> Result<usize> {
        let tx = self.connection.transaction().map_err(db_error)?;
        let n = tx
            .execute(
                "DELETE FROM work_records WHERE is_demo=1 AND status='FINISHED'",
                [],
            )
            .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(n)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::TestClock;
    fn empty() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    #[test]
    fn demo_generation_is_idempotent_and_never_changes_real_totals_or_active_work() {
        let mut s = empty();
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "real".into(),
        })
        .unwrap();
        let before = s.active().unwrap().unwrap();
        let n = s.seed_demo().unwrap();
        assert!(n > 100);
        assert_eq!(s.seed_demo().unwrap(), n);
        assert_eq!(s.active().unwrap().unwrap().id, before.id);
        assert_eq!(s.active().unwrap().unwrap().duration_ms, before.duration_ms);
        assert_eq!(s.snapshot().unwrap().pending_count, 0);
        assert!(s.snapshot().unwrap().recent_records.is_empty());
        let demo = s
            .dashboard_query(DashboardQuery {
                scope: "demo".into(),
                ..Default::default()
            })
            .unwrap();
        assert_eq!(demo["totals"]["records"], n);
        assert!(demo["totals"]["pending"].as_i64().unwrap() > 0);
        let real = s.dashboard_query(DashboardQuery::default()).unwrap();
        assert_eq!(real["totals"]["records"], 0);
        assert_eq!(real["record_count"], 1);
        assert_eq!(real["totals"]["quantity"], 0.0);
        let history = s
            .query_history(super::super::HistoryQuery {
                start_date: "1970-01-01".into(),
                end_date: "1970-12-31".into(),
                category: None,
                page: 1,
            })
            .unwrap();
        assert_eq!(history.overview.records, 0);
        assert_eq!(s.clear_demo().unwrap() as i64, n);
        assert_eq!(s.active().unwrap().unwrap().id, before.id);
        assert_eq!(
            s.connection
                .query_row("SELECT COUNT(*) FROM work_records", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(
            s.connection
                .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |r| r
                    .get::<_, i64>(
                    0
                ))
                .unwrap(),
            0
        );
    }
    #[test]
    fn today_uses_confirmed_quantity_and_distinguishes_missing_from_zero() {
        let s = empty();
        for (qty, state, demo) in [
            (None, "PENDING", 0),
            (Some(0.0), "COMPLETE", 0),
            (Some(50.5), "COMPLETE", 0),
            (Some(999.0), "COMPLETE", 1),
        ] {
            s.connection.execute("INSERT INTO work_records(category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,is_demo) VALUES('评测',?1,unixepoch('now')*1000-60000,unixepoch('now')*1000,60000,60,'FINISHED',1,?2,?3)",params![qty,state,demo]).unwrap();
        }
        let rows = s.today_workload().unwrap();
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].quantity, 50.5);
        assert_eq!(rows[0].records, 3);
        assert_eq!(rows[0].pending, 1);
        assert_eq!(rows[0].complete, 2);
    }
    #[test]
    fn browser_edits_and_deletes_enforce_revision_and_preserve_intervals() {
        let mut s = empty();
        s.seed_demo().unwrap();
        let id = s
            .connection
            .query_row(
                "SELECT id FROM work_records WHERE settlement_status='PENDING' LIMIT 1",
                [],
                |r| r.get::<_, i64>(0),
            )
            .unwrap();
        let before = s.record(id).unwrap();
        s.settle(SettleInput {
            id,
            expected_revision: before.revision,
            category: "文档".into(),
            quantity: 0.0,
            remark: "reviewed demo".into(),
        })
        .unwrap();
        let after = s.record(id).unwrap();
        assert_eq!(after.duration_ms, before.duration_ms);
        assert_eq!(after.end_time, before.end_time);
        assert!(
            s.settle(SettleInput {
                id,
                expected_revision: before.revision,
                category: "文档".into(),
                quantity: 2.0,
                remark: "stale".into()
            })
            .is_err()
        );
        assert!(s.dashboard_delete(id, before.revision).is_err());
        let detail = s.dashboard_detail(id).unwrap();
        assert_eq!(detail["segments"].as_array().unwrap().len(), 2);
        assert_eq!(detail["revisions"].as_array().unwrap().len(), 1);
        assert_eq!(detail["record"]["is_demo"], true);
        s.dashboard_delete(id, after.revision).unwrap();
        assert!(s.dashboard_detail(id).is_err());
        assert!(
            s.dashboard_query(DashboardQuery {
                scope: "invalid".into(),
                ..Default::default()
            })
            .is_err()
        );
        assert!(
            s.dashboard_query(DashboardQuery {
                start_date: Some("2026-02-31".into()),
                ..Default::default()
            })
            .is_err()
        );
    }
}

#[cfg(test)]
#[path = "report_tests.rs"]
mod report_tests;
```

## E:\WorkMemo\src-tauri\src\report_tests.rs

```rs
use super::super::tests::TestClock;
use super::*;
fn store() -> Store {
    Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(TestClock::new()),
        None,
    )
    .unwrap()
}
fn query(period: &str, date: &str) -> DashboardQuery {
    DashboardQuery {
        period: period.into(),
        anchor_date: Some(date.into()),
        ..Default::default()
    }
}
fn ended(
    s: &Store,
    date: &str,
    category: &str,
    quantity: Option<f64>,
    complete: bool,
    duration: i64,
    demo: bool,
) -> i64 {
    s.connection.execute("INSERT INTO work_records(category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,is_demo) VALUES(?1,?2,unixepoch(?3,'utc')*1000,unixepoch(?3,'utc')*1000+?4,?4,?4/1000,'FINISHED',1,?5,?6)",params![category,quantity,date,duration,if complete{"COMPLETE"}else{"PENDING"},demo]).unwrap();
    s.connection.last_insert_rowid()
}
#[test]
fn canonical_periods_cover_leap_month_sunday_and_cross_year_weeks() {
    let s = store();
    for (period, date, start, end, buckets) in [
        ("day", "2026-10-29", "2026-10-29", "2026-10-29", 24),
        ("week", "2027-01-01", "2026-12-28", "2027-01-03", 7),
        ("week", "2026-11-01", "2026-10-26", "2026-11-01", 7),
        ("month", "2024-02-29", "2024-02-01", "2024-02-29", 29),
        ("month", "2026-02-28", "2026-02-01", "2026-02-28", 28),
        ("month", "9999-12-31", "9999-12-01", "9999-12-31", 31),
        ("week", "1970-01-01", "1970-01-01", "1970-01-04", 4),
    ] {
        let mut q = query(period, date);
        q.start_date = Some("invalid ignored natural boundary".into());
        let result = s.dashboard_query(q).unwrap();
        assert_eq!(result["range"]["start_date"], start);
        assert_eq!(result["range"]["end_date"], end);
        assert_eq!(result["trend"].as_array().unwrap().len(), buckets);
        assert_eq!(result["categories"].as_array().unwrap().len(), 4);
        assert_eq!(result["totals"]["records"], 0);
    }
}
#[test]
fn period_reports_count_ended_work_and_keep_zero_pending_decimal_and_demo_separate() {
    let mut s = store();
    ended(
        &s,
        "2026-10-29 00:00:00",
        "评测",
        Some(0.0),
        true,
        1234,
        false,
    );
    ended(
        &s,
        "2026-10-29 23:59:59",
        "评测",
        Some(2.5),
        true,
        2000,
        false,
    );
    ended(&s, "2026-10-29 10:00:00", "评测", None, false, 3000, false);
    ended(
        &s,
        "2026-10-29 10:00:00",
        "开发",
        Some(999.0),
        false,
        4000,
        false,
    );
    ended(
        &s,
        "2026-10-29 10:00:00",
        "质检",
        Some(500.0),
        true,
        1000,
        true,
    );
    ended(
        &s,
        "2026-10-28 23:59:59",
        "评测",
        Some(200.0),
        true,
        5000,
        false,
    );
    ended(
        &s,
        "2026-10-30 00:00:00",
        "评测",
        Some(300.0),
        true,
        6000,
        false,
    );
    s.start(StartInput {
        category: "文档".into(),
        quantity: Some(55.0),
        remark: String::new(),
    })
    .unwrap();
    s.connection.execute("UPDATE work_records SET start_time=unixepoch('2026-10-29 12:00:00','utc')*1000 WHERE status='WORKING'",[]).unwrap();
    let result = s.dashboard_query(query("day", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 4);
    assert_eq!(result["record_count"], 5);
    assert_eq!(result["totals"]["duration_ms"], 10234);
    assert_eq!(result["totals"]["quantity"], 2.5);
    assert_eq!(result["categories"][0]["complete"], 2);
    assert_eq!(result["categories"][0]["pending"], 1);
    assert_eq!(result["categories"][2]["quantity"], 0.0);
    assert_eq!(result["categories"][2]["complete"], 0);
    assert_eq!(result["categories"][3]["records"], 0);
    assert_eq!(result["trend"][0]["duration_ms"], 1234);
    assert_eq!(result["trend"][23]["duration_ms"], 2000);
    let mut q = query("day", "2026-10-29");
    q.category = Some("开发".into());
    q.status = "pending".into();
    let one = s.dashboard_query(q).unwrap();
    assert_eq!(one["categories"].as_array().unwrap().len(), 1);
    assert_eq!(one["totals"]["pending"], 1);
    let mut q = query("day", "2026-10-29");
    q.status = "working".into();
    let working = s.dashboard_query(q).unwrap();
    assert_eq!(working["totals"]["records"], 0);
    assert_eq!(working["record_count"], 1);
}
#[test]
fn weekly_and_monthly_totals_refresh_after_settlement_edit_delete_and_use_all_pages() {
    let mut s = store();
    for _ in 0..61 {
        ended(
            &s,
            "2026-10-26 09:00:00",
            "评测",
            Some(0.25),
            true,
            1000,
            false,
        );
    }
    let id = ended(&s, "2026-11-01 09:00:00", "评测", None, false, 2500, false);
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 62);
    assert_eq!(result["totals"]["quantity"], 15.25);
    assert_eq!(result["pages"], 2);
    assert_eq!(result["records"].as_array().unwrap().len(), 50);
    s.settle(SettleInput {
        id,
        expected_revision: 0,
        category: "开发".into(),
        quantity: 2.5,
        remark: "confirmed".into(),
    })
    .unwrap();
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["pending"], 0);
    assert_eq!(result["categories"][2]["quantity"], 2.5);
    s.settle(SettleInput {
        id,
        expected_revision: 1,
        category: "开发".into(),
        quantity: 0.0,
        remark: "edited".into(),
    })
    .unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["categories"][2]["quantity"],
        0.0
    );
    s.dashboard_delete(id, 2).unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-11-01")).unwrap()["totals"]["records"],
        0
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
}
#[test]
fn period_validation_rejects_bad_dates_and_legacy_custom_ranges_still_work() {
    let s = store();
    for (period, date) in [
        ("year", "2026-10-29"),
        ("month", "2026-02-29"),
        ("day", ""),
        ("week", "1969-12-31"),
    ] {
        assert!(s.dashboard_query(query(period, date)).is_err());
    }
    let q = DashboardQuery {
        start_date: Some("2026-10-30".into()),
        end_date: Some("2026-10-01".into()),
        ..Default::default()
    };
    assert!(s.dashboard_query(q).is_err());
    ended(
        &s,
        "2025-01-01 00:00:00",
        "评测",
        Some(1.0),
        true,
        1000,
        false,
    );
    ended(
        &s,
        "2026-01-01 00:00:00",
        "评测",
        Some(2.0),
        true,
        2000,
        false,
    );
    let result = s.dashboard_query(DashboardQuery::default()).unwrap();
    assert_eq!(result["range"]["period"], "custom");
    assert_eq!(result["range"]["trend_unit"], "month");
    assert_eq!(result["totals"]["records"], 2);
}

#[test]
fn unfinished_status_matches_browser_contract_and_preserves_legacy_working_filter() {
    let s = store();
    let contract: Value = serde_json::from_str(include_str!(
        "../../tests/fixtures/dashboard-status-contract.json"
    ))
    .unwrap();
    for row in contract["records"].as_array().unwrap() {
        let status = row["status"].as_str().unwrap();
        let settlement = row["settlement_status"].as_str().unwrap();
        s.connection.execute(
            "INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status)
             VALUES(?1,'开发',?2,0,?3,1000,1,?4,?5,?6)",
            params![row["id"].as_i64().unwrap(),if settlement == "COMPLETE" {Some(0.0)} else {None},
                if status == "FINISHED" {Some(1000)} else {None},status,status != "WORKING",settlement],
        ).unwrap();
    }
    for paused in [false, true] {
        s.connection
            .execute(
                "UPDATE work_records SET is_paused=?1 WHERE status='WORKING'",
                [paused],
            )
            .unwrap();
        for (status, expected) in contract["expected"].as_object().unwrap() {
            let value = s
                .dashboard_query(DashboardQuery {
                    status: status.clone(),
                    ..Default::default()
                })
                .unwrap();
            let mut ids: Vec<i64> = value["records"]
                .as_array()
                .unwrap()
                .iter()
                .map(|row| row["id"].as_i64().unwrap())
                .collect();
            ids.sort_unstable();
            assert_eq!(json!(ids), *expected, "{status}, paused={paused}");
            if status == "unfinished" {
                assert_eq!(value["totals"]["records"], 0);
            }
        }
    }
}
```

## E:\WorkMemo\scripts\dashboard-fixture.mjs

```mjs
// HTTP fixtures for browser verification only. Never connects to a WorkMemo database.
export const keys = ["评测", "质检", "开发", "文档"];
export const fixtureDate = "2026-10-29";
export async function dashboardFixture(page) {
  const names = {
    revision: 1,
    names: { 评测: "评测", 质检: "质检", 开发: "代码开发", 文档: "文档" },
  };
  const presentation = {
    version: 1,
    revision: 0,
    background: null,
    categories: Object.fromEntries(
      keys.map((key, i) => [
        key,
        {
          icon: ["checkSquare", "safety", "code", "note"][i],
          color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
        },
      ]),
    ),
  };
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "评测" : i === 5 ? "质检" : "开发",
    quantity: i < 4 ? [30, 40, 50, 8.5][i] : i === 5 ? 0 : null,
    remark: "隔离测试记录 · 不写入用户数据库",
    start_time: Date.parse(`${fixtureDate}T09:00:00+08:00`) + i * 1800000,
    end_time: Date.parse(`${fixtureDate}T10:00:00+08:00`) + i * 1800000,
    duration_ms: i < 5 ? 1920000 : i === 5 ? 1200000 : 2250000,
    duration_seconds: i < 5 ? 1920 : i === 5 ? 1200 : 2250,
    status: "FINISHED",
    is_paused: true,
    recovery_pending: false,
    settlement_status: i < 4 || i === 5 ? "COMPLETE" : "PENDING",
    source: "MANUAL_START",
    pause_reason: null,
    confirmed_end_time: null,
    last_input_time: null,
    end_reason: "MANUAL",
    legacy_duration_ms: 0,
    revision: 0,
    control_mode: "MANUAL",
    is_demo: false,
    demo_batch: null,
  }));
  const active = {
    ...records[0],
    id: 99,
    category: "开发",
    quantity: null,
    status: "WORKING",
    settlement_status: "IN_PROGRESS",
    end_time: null,
    is_paused: false,
    duration_ms: 25000,
    duration_seconds: 25,
  };
  const state = {
    records,
    active,
    names,
    presentation,
    saveFailure: null,
    queryFailure: false,
    detailFailure: false,
    queryDelay: 0,
    delayFor: null,
    saveDelay: 0,
    saves: 0,
    queries: 0,
    details: 0,
    deletes: 0,
    currentQuery: null,
    requests: [],
    revisions: [],
    segments: [],
    many: false,
    manualCapability: true,
    manualSaves: 0,
    manualFailure: false,
    manualDelay: 0,
    manualLoseResponse: false,
    manualEntries: new Map(),
  };
  const iso = (date) => date.toISOString().slice(0, 10);
  function range(query) {
    const anchor = query.anchor_date ?? fixtureDate;
    const date = new Date(anchor + "T12:00:00Z");
    let start = query.start_date,
      end = query.end_date;
    if (query.period === "day") start = end = anchor;
    if (query.period === "week") {
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      start = iso(date);
      date.setUTCDate(date.getUTCDate() + 6);
      end = iso(date);
    }
    if (query.period === "month") {
      date.setUTCDate(1);
      start = iso(date);
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      end = iso(date);
    }
    return {
      period: query.period,
      anchor_date: query.period === "custom" ? null : anchor,
      start_date: start,
      end_date: end,
      trend_unit: query.period === "day" ? "hour" : "day",
    };
  }
  function aggregate(rows) {
    return {
      duration_ms: rows.reduce((n, row) => n + row.duration_ms, 0),
      quantity: rows
        .filter((row) => row.settlement_status === "COMPLETE")
        .reduce((n, row) => n + row.quantity, 0),
      records: rows.length,
      pending: rows.filter((row) => row.settlement_status === "PENDING").length,
      complete: rows.filter((row) => row.settlement_status === "COMPLETE")
        .length,
    };
  }
  function data(query) {
    const resolved = range(query);
    const extras = state.many
      ? Array.from({ length: 52 }, (_, i) => ({
          ...records[0],
          id: 200 + i,
          quantity: 1,
        }))
      : [];
    const demo = {
      ...records[0],
      id: 500,
      is_demo: true,
      demo_batch: "isolated-browser-fixture",
      quantity: 999,
    };
    const filtered = [
      ...state.records,
      ...extras,
      ...(state.active ? [state.active] : []),
      demo,
    ].filter((row) => {
      const date = iso(new Date(row.start_time + 8 * 3600000));
      return (
        (query.scope === "all" || row.is_demo === (query.scope === "demo")) &&
        (!resolved.start_date || date >= resolved.start_date) &&
        (!resolved.end_date || date <= resolved.end_date) &&
        (!query.category || row.category === query.category) &&
        (query.status === "all" ||
          (query.status === "working" && row.status === "WORKING") ||
          (query.status === "unfinished" && ["WORKING", "SUSPENDED"].includes(row.status)) ||
          (query.status === "pending" && row.settlement_status === "PENDING") ||
          (query.status === "complete" && row.settlement_status === "COMPLETE"))
      );
    });
    const ended = filtered.filter((row) => row.status === "FINISHED");
    const categories = keys
      .filter((key) => !query.category || key === query.category)
      .map((category) => ({
        category,
        ...aggregate(ended.filter((row) => row.category === category)),
      }));
    const buckets =
      query.period === "day"
        ? Array.from(
            { length: 24 },
            (_, hour) => String(hour).padStart(2, "0") + ":00",
          )
        : query.period === "custom"
          ? [fixtureDate]
          : Array.from({ length: 32 }, (_, i) => {
              const date = new Date(resolved.start_date + "T12:00:00Z");
              date.setUTCDate(date.getUTCDate() + i);
              return iso(date);
            }).filter((date) => date <= resolved.end_date);
    const trend = buckets.map((date) => ({
      date,
      ...aggregate(
        ended.filter((row) =>
          query.period === "day"
            ? new Date(row.start_time + 8 * 3600000).getUTCHours() ===
              Number(date.slice(0, 2))
            : iso(new Date(row.start_time + 8 * 3600000)) === date,
        ),
      ),
    }));
    const pages = Math.max(1, Math.ceil(filtered.length / 50)),
      current = Math.min(query.page, pages);
    return {
      range: resolved,
      totals: aggregate(ended),
      categories,
      trend,
      monthly: false,
      calendar: ended.length
        ? [[fixtureDate, aggregate(ended).duration_ms]]
        : [],
      records: filtered.slice((current - 1) * 50, current * 50),
      record_count: filtered.length,
      page: current,
      pages,
      scope: query.scope,
    };
  }
  state.data = data;
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split("/").at(-1);
    const body = route.request().postData()
      ? route.request().postDataJSON()
      : null;
    state.requests.push({ endpoint, body });
    if (endpoint === "meta")
      return route.fulfill({
        json: {
          version: "0.2.5 · 隔离验收",
          manual_entry: state.manualCapability,
          category_names: names,
          presentation,
          active: state.active,
        },
      });
    if (endpoint === "query") {
      state.queries++;
      state.currentQuery = body;
      const result = data(body),
        failure = state.queryFailure;
      const delay = state.delayFor ? state.delayFor(body) : state.queryDelay;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return failure
        ? route.fulfill({ status: 500, json: { error: "隔离统计读取失败" } })
        : route.fulfill({ json: result });
    }
    if (endpoint === "detail") {
      state.details++;
      if (state.detailFailure)
        return route.fulfill({
          status: 500,
          json: { error: "隔离详情读取失败" },
        });
      const record = [
        ...state.records,
        ...(state.active ? [state.active] : []),
      ].find((row) => row.id === body.id);
      if (!record) return route.fulfill({ status: 404, json: { error: "记录已删除，请刷新列表" } });
      return route.fulfill({
        json: { record, segments: state.segments, revisions: state.revisions },
      });
    }
    if (endpoint === "manual-entry") {
      state.manualSaves++;
      if (state.manualDelay) await new Promise(resolve => setTimeout(resolve, state.manualDelay));
      if (state.manualFailure) return route.fulfill({ status: 500, json: { error: "隔离补录保存失败" } });
      let record = state.manualEntries.get(body.request_id);
      if (!record) {
        record = { ...state.records[0], ...body, id: 1000 + state.manualEntries.size,
          duration_seconds: Math.floor(body.duration_ms / 1000), legacy_duration_ms: body.duration_ms,
          source: "MANUAL_ENTRY", status: "FINISHED", settlement_status: "COMPLETE", is_demo: false, revision: 0 };
        state.manualEntries.set(body.request_id, record);
        state.records.push(record);
      }
      if (state.manualLoseResponse) { state.manualLoseResponse = false; return route.abort('connectionreset'); }
      return route.fulfill({ json: { record, segments: [], revisions: [] } });
    }
    if (endpoint === "save") {
      state.saves++;
      if (state.saveDelay)
        await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (state.saveFailure)
        return route.fulfill({
          status: state.saveFailure,
          json: {
            error:
              state.saveFailure === 409
                ? "记录已被其他窗口修改"
                : "隔离保存失败",
          },
        });
      const row = state.records.find((row) => row.id === body.id);
      const before = structuredClone(row);
      Object.assign(row, body, {
        revision: row.revision + 1,
        settlement_status: "COMPLETE",
      });
      state.revisions.push({
        revision: row.revision,
        changed_at: Date.now(),
        before,
        after: structuredClone(row),
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (endpoint === "delete") {
      state.deletes++;
      state.records = state.records.filter((row) => row.id !== body.id);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      status: 404,
      json: { error: "No fixture endpoint" },
    });
  });
  return state;
}
```

## E:\WorkMemo\scripts\audit-web-comprehensive.mjs

```mjs
// Evidence collection only. API traffic uses in-memory fixtures, never a work database.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:4174';
const output = new URL('../artifacts/web-comprehensive/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const result = {base, scenarios:{}, errors:[]};
async function setup(options={}) {
 const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai',...options});
 const page = await context.newPage();
 page.setDefaultTimeout(12000);
 page.on('pageerror',e=>result.errors.push(e.message));
 const state = await dashboardFixture(page);
 await page.goto(base+'/dashboard#token=isolated-comprehensive-audit');
 await page.getByRole('button',{name:'评测待补填1条',exact:true}).waitFor();
 return {context,page,state};
}
async function shot(page,name) {await page.screenshot({path:fileURLToPath(new URL(name+'.png',output)),fullPage:false});}
async function axe(page,name) {
 if (!process.env.WORKMEMO_AXE) return;
 await page.waitForTimeout(450); // Inspect settled colors, not overlay entrance opacity.
 if (!await page.evaluate(()=>!!window.axe)) await page.addScriptTag({path:process.env.WORKMEMO_AXE});
 const report = await page.evaluate(async()=>{
  const value=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});
  return {violations:value.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))})),incomplete:value.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
 });
 await writeFile(new URL('axe-'+name+'.json',output),JSON.stringify(report,null,2));
 result.scenarios['axe-'+name]=report.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length}));
}
try {
 {
  const {context,page}=await setup();
  await axe(page,'overview');
  result.scenarios.document=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,skipLinks:[...document.querySelectorAll('a')].filter(a=>a.textContent.includes('跳')).length}));
  await page.getByRole('button',{name:'评测待补填1条',exact:true}).click();
  await page.getByRole('button',{name:'补填记录5',exact:true}).waitFor();
  result.scenarios.pendingBackground=await page.evaluate(()=>({inert:document.querySelector('.dc-page').inert,sidebarInert:document.querySelector('.dc-sidebar').inert,dialogModal:document.querySelector('[role="dialog"]')?.getAttribute('aria-modal')}));
  await axe(page,'pending');
  await shot(page,'pending');
  await page.getByRole('button',{name:'关闭',exact:true}).click();
  await page.locator('.dc-sheet-root .wm-drawer-section').waitFor({state:'hidden'});
  await page.getByRole('button',{name:'补记录',exact:true}).click();
  await page.getByRole('textbox',{name:'补录工作量',exact:true}).fill('2');
  await page.getByRole('button',{name:'取消',exact:true}).click();
  await page.getByRole('dialog',{name:'放弃这次补记录？'}).waitFor();
  result.scenarios.manualNested=await page.locator('.dc-manual-entry').evaluate(el=>({inert:!!el.closest('[inert]'),hidden:!!el.closest('[aria-hidden="true"]'),dialogs:[...document.querySelectorAll('[role="dialog"]')].map(d=>({title:d.getAttribute('aria-labelledby'),inert:!!d.closest('[inert]'),hidden:!!d.closest('[aria-hidden="true"]')}))}));
  await axe(page,'nested-manual');
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  await page.getByRole('button',{name:'辅助分析',exact:true}).click();
  await page.locator('.dc-category .dc-chart canvas').waitFor();
  for (const row of state.records) if(row.category==='评测') row.duration_ms=1000;
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.waitForTimeout(500);
  result.scenarios.chartValues=await page.locator('.dc-category .dc-chart').evaluate(el=>{
   let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber'))];
   while(f && !f.memoizedProps?.option) f=f.return;
   let hook=f.memoizedState;
   while(hook && typeof hook.memoizedState?.current?.getOption!=='function') hook=hook.next;
   const option=hook.memoizedState.current.getOption();
   return {series:option.series[0].data,inputMilliseconds:5000};
  });
  await page.route('**/api/query',async route=>{
   const data=state.data(route.request().postDataJSON());
   data.range={period:'custom',anchor_date:null,start_date:'2024-01-01',end_date:'2026-01-31',trend_unit:'month'};
   data.trend=[{date:'2024-01',duration_ms:3600000,quantity:1,records:1},{date:'2025-01',duration_ms:7200000,quantity:1,records:1},{date:'2026-01',duration_ms:3600000,quantity:1,records:1}];
   await route.fulfill({json:data});
  });
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.getByText('按开始月份汇总 · 已结束记录的有效工时',{exact:true}).waitFor();
  await page.waitForTimeout(500);
  result.scenarios.monthAxis=await page.locator('.dc-trend .dc-chart').evaluate(el=>{
   let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber'))];
   while(f && !f.memoizedProps?.option) f=f.return;
   let hook=f.memoizedState;
   while(hook && typeof hook.memoizedState?.current?.getOption!=='function') hook=hook.next;
   const axis=hook.memoizedState.current.getOption().xAxis[0];
   return {dates:axis.data,labels:axis.data.map(value=>typeof axis.axisLabel.formatter==='function'?axis.axisLabel.formatter(value):value)};
  });
  await shot(page,'monthly-axis');
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  await page.route('**/api/query',route=>route.fulfill({status:503,contentType:'text/plain',body:'busy'}));
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.getByText('WorkMemo 正忙，请稍后刷新连接。',{exact:true}).waitFor();
  result.scenarios.nonJson503={visible:await page.locator('.dc-notice').first().innerText(),manualEnabled:await page.getByRole('button',{name:'补记录',exact:true}).isEnabled()};
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  let inflight=0,peak=0,started=0,finished=0;
  await page.route('**/api/query',async route=>{
   started++;peak=Math.max(peak,++inflight);
   const data=state.data(route.request().postDataJSON());
   await new Promise(resolve=>setTimeout(resolve,2400));
   await route.fulfill({json:data}).catch(()=>{});
   inflight--;finished++;
  });
  for(let i=0;i<8;i++) {
   await page.getByRole('button',{name:'刷新连接',exact:true}).evaluate(button=>button.click());
   await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2700);
  result.scenarios.refreshConcurrency={started,finished,peak};
  await context.close();
 }
 {
  const {context,page}=await setup();
  await page.locator('.dc-records').getByRole('button',{name:'编辑',exact:true}).first().click();
  await page.locator('#dc-quantity').fill('-1');
  await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'有效工作量'}).waitFor();
  result.scenarios.editorValidation=await page.locator('#dc-quantity').evaluate(el=>({invalid:el.getAttribute('aria-invalid'),description:el.getAttribute('aria-describedby'),required:el.required,active:document.activeElement?.outerHTML.slice(0,150)}));
  result.scenarios.editorErrorPosition=await page.locator('.dc-detail-content > .wm-alert').evaluate(el=>{
   const error=el.getBoundingClientRect(),body=el.closest('.wm-drawer-body').getBoundingClientRect();
   return {errorTop:error.top,errorBottom:error.bottom,bodyTop:body.top,bodyBottom:body.bottom,visibleInBody:error.top<body.bottom && error.bottom>body.top};
  });
  await axe(page,'editor');
  await shot(page,'editor');
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  Object.assign(state.records[0],{status:'SUSPENDED',is_paused:true,end_time:null,settlement_status:'IN_PROGRESS'});
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.waitForTimeout(500);
  result.scenarios.suspendedLabel=await page.locator('.dc-records tr[data-row-key="1"]').innerText();
  await context.close();
 }
 {
  const {context,page}=await setup({viewport:{width:320,height:568}});
  await page.getByRole('button',{name:'补记录',exact:true}).click();
  result.scenarios.shortMobile=await page.locator('.dc-manual-entry .wm-modal-body').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight,overflow:getComputedStyle(el).overflowY,viewport:innerHeight,documentWidth:document.documentElement.scrollWidth}));
  await axe(page,'mobile-manual');
  await shot(page,'mobile');
  await context.close();
 }
 result.scenarios.performance=[];
 for(let sample=0;sample<3;sample++) {
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
  await context.addInitScript(()=>{
   window.auditMetrics={longTasks:[],lcp:0,cls:0};
   new PerformanceObserver(list=>{window.auditMetrics.longTasks.push(...list.getEntries().map(x=>x.duration));}).observe({type:'longtask',buffered:true});
   new PerformanceObserver(list=>{window.auditMetrics.lcp=list.getEntries().at(-1)?.startTime||0;}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const x of list.getEntries()) if(!x.hadRecentInput)window.auditMetrics.cls+=x.value;}).observe({type:'layout-shift',buffered:true});
  });
  const page=await context.newPage();
  await dashboardFixture(page);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await page.goto(base+'/dashboard#token=isolated-performance');
  await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  await page.waitForTimeout(1000);
  result.scenarios.performance.push(await page.evaluate(()=>({...window.auditMetrics,resources:performance.getEntriesByType('resource').filter(x=>x.name.endsWith('.js')).map(x=>({name:x.name.split('/').at(-1),bytes:x.decodedBodySize}))})));
  await context.close();
 }
} finally {
 await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
 await browser.close();
}
```

## E:\WorkMemo\scripts\verify-web-phase-a.mjs

```mjs
// Production UI regression with isolated HTTP fixtures. No user database or task is touched.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const output=new URL('../artifacts/web-phase-a/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={base,passed:[],errors:[]};
let page,context;
async function setup() {
 await context?.close();
 context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
 page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',error=>result.errors.push(error.message));
 await page.route('**/dashboard',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,headers:{...response.headers(),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});
 });
 const state=await dashboardFixture(page);
 await page.goto(base+'/dashboard#token=isolated-phase-a');
 await page.locator('.dc-records tr[data-row-key="99"]').waitFor();
 await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
 return state;
}
async function select(label,text) {
 await page.getByRole('combobox',{name:label,exact:true}).click();
 await page.locator('.wm-select-dropdown:visible .wm-select-item-option-content').getByText(text,{exact:true}).click();
}
async function refresh() {
 await page.getByRole('button',{name:'刷新连接',exact:true}).click();
 await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
}
// Inspect the real ECharts option through its ref; never use React's alternating props.
function chartInstance(el) {
 let fiber=el[Object.keys(el).find(key=>key.startsWith('__reactFiber'))];
 while(fiber&&!fiber.memoizedProps?.option)fiber=fiber.return;
 let hook=fiber?.memoizedState;
 while(hook&&typeof hook.memoizedState?.current?.getOption!=='function')hook=hook.next;
 return hook?.memoizedState.current;
}
try {
 {
  const state=await setup();
  Object.assign(state.records[0],{status:'SUSPENDED',end_time:null,quantity:null,settlement_status:'IN_PROGRESS',is_paused:true});
  await select('筛选记录状态','未结束');
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();
  await page.locator('.dc-records tr[data-row-key="1"]').getByText('已挂起',{exact:true}).waitFor();
  await page.locator('.dc-records tr[data-row-key="99"]').getByText('计时中',{exact:true}).waitFor();
  assert.equal(await page.locator('.dc-records tr[data-row-key]').count(),2);
  assert.equal(state.currentQuery.status,'unfinished');
  assert.match(await page.locator('.dc-records tr[data-row-key="1"]').innerText(),/未结算/);
  state.active.is_paused=true;await refresh();
  await page.locator('.dc-records tr[data-row-key="99"]').getByText('已暂停',{exact:true}).waitFor();
  await page.screenshot({path:fileURLToPath(new URL('unfinished.png',output))});
  result.passed.push('unfinished filter includes suspended and paused work; row labels describe actual timer state');
 }
 {
  const state=await setup();
  await page.getByRole('button',{name:'辅助分析',exact:true}).click();
  const selector='.dc-category .dc-chart';
  const getChart=chartInstance.toString();
  const values=[];
  for(const duration of [1,1000,5000,17999,18000,3600000,0]) {
   for(const row of state.records)if(row.category==='评测'){row.duration_ms=0;row.duration_seconds=0;}
   state.records[0].duration_ms=duration;state.records[0].duration_seconds=Math.floor(duration/1000);
   await refresh();
   await page.waitForFunction(({selector,getChart,expected})=>{
    const instance=eval('('+getChart+')')(document.querySelector(selector));
    return instance?.getOption().series[0].data[0].value===expected;
   },{selector,getChart,expected:duration/3600000});
   values.push(await page.locator(selector).evaluate((el,getChart)=>{
    const option=eval('('+getChart+')')(el).getOption(),value=option.series[0].data[0].value;
    return {value,tooltip:option.tooltip[0].valueFormatter(value)};
   },getChart));
  }
  assert.ok(values[0].value>0);assert.match(values[2].tooltip,/5 秒/);assert.equal(values.at(-1).value,0);
  result.precision=values;
  for(const row of state.records)if(row.category==='评测'&&row.settlement_status==='COMPLETE')row.quantity=0;
  state.records[0].quantity=1e-12;
  await select('工作分布指标','工作量');await refresh();
  await page.waitForFunction(({selector,getChart})=>eval('('+getChart+')')(document.querySelector(selector))?.getOption().series[0].data[0].value===1e-12,{selector,getChart});
  const tinyQuantity=await page.locator(selector).evaluate((el,getChart)=>eval('('+getChart+')')(el).getOption().tooltip[0].valueFormatter(1e-12),getChart);
  assert.notEqual(tinyQuantity,'0');result.tinyQuantity=tinyQuantity;
  let unit='month';
  const buckets={month:['2024-01','2025-01','2026-01'],day:['2024-12-31','2025-01-01']};
  await page.route('**/api/query',async route=>{
   const data=state.data(route.request().postDataJSON());
   data.range.trend_unit=unit;
   data.trend=buckets[unit].map(date=>({date,duration_ms:3600000,quantity:1,records:1}));
   await route.fulfill({json:data});
  });
  for(unit of ['month','day']) {
   await refresh();
   const dates=buckets[unit];
   await page.waitForFunction(({getChart,dates})=>{
    const option=eval('('+getChart+')')(document.querySelector('.dc-trend .dc-chart'))?.getOption();
    return JSON.stringify(option?.xAxis[0].data)===JSON.stringify(dates);
   },{getChart,dates});
   const labels=await page.locator('.dc-trend .dc-chart').evaluate((el,getChart)=>{
    const axis=eval('('+getChart+')')(el).getOption().xAxis[0];
    return axis.data.map(value=>typeof axis.axisLabel.formatter==='function'?axis.axisLabel.formatter(value):value);
   },getChart);
   assert.deepEqual(labels,dates);
  }
  result.passed.push('chart values preserve 1ms through normal hours and true zero; day/month labels retain years');
 }
 {
  await setup();let failure=503;
  await page.route('**/api/query',async route=>{
   if(failure===0)return route.fallback();
   if(failure===400)return route.fulfill({status:400,json:{error:'隔离日期范围无效'}});
   return route.fulfill({status:failure,contentType:failure===200?'text/html':'text/plain',body:failure===200?'not json':'busy'});
  });
  for(const [status,text,enabled] of [[503,'WorkMemo 正忙',false],[400,'隔离日期范围无效',true],[403,'连接授权已失效',false],[200,'返回的数据格式异常',false],[504,'请求超时',false]]) {
   failure=status;await refresh();
   await page.getByRole('alert').filter({hasText:text}).waitFor();
   assert.equal(await page.getByRole('button',{name:'补记录',exact:true}).isEnabled(),enabled);
   assert.equal(await page.locator('.dc-records tr[data-row-key]').count(),9);
  }
  failure=0;await refresh();
  assert.equal(await page.getByRole('button',{name:'补记录',exact:true}).isEnabled(),true);
  assert.equal(await page.getByRole('alert').filter({hasText:'刷新失败'}).count(),0);
  result.passed.push('503, business validation, authorization, malformed response and timeout differ; stale data and recovery remain usable');
 }
 {
  const state=await setup();let started=0;
  await page.route('**/api/query',async route=>{
   started++;const data=state.data(route.request().postDataJSON());
   await new Promise(resolve=>setTimeout(resolve,1600));
   await route.fulfill({json:data}).catch(()=>{});
  });
  const request=page.waitForRequest('**/api/query');
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();await request;
  for(let i=0;i<8;i++) {
   await page.getByRole('button',{name:'刷新连接',exact:true}).evaluate(button=>button.click());
   await page.waitForTimeout(60);
  }
  assert.equal(started,1);
  await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
  result.refreshBurstRequests=started;
  result.passed.push('repeated refresh clicks during a slow refresh launch only one query');
 }
 {
  const state=await setup();const cancelled=[];
  page.on('requestfailed',request=>{if(request.url().endsWith('/api/query'))cancelled.push(request.postDataJSON()?.category);});
  await page.route('**/api/query',async route=>{
   const query=route.request().postDataJSON(),data=state.data(query);
   if(query.category==='评测')await new Promise(resolve=>setTimeout(resolve,1500));
   await route.fulfill({json:data}).catch(()=>{});
  });
  await select('筛选工作类别','评测');
  const oldRequest=page.waitForRequest(request=>request.url().endsWith('/api/query')&&request.postDataJSON().category==='评测');
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();await oldRequest;
  await select('筛选工作类别','质检');
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();
  await page.locator('.dc-report-table tr[data-row-key="质检"]').waitFor();
  await page.waitForTimeout(1600);
  assert.ok(cancelled.includes('评测'));
  assert.equal(await page.locator('.dc-report-table tr[data-row-key="评测"]').count(),0);
  assert.equal(await page.getByRole('alert').filter({hasText:'连接已中断'}).count(),0);
  result.passed.push('changing filters aborts the stale query without a disconnect error or late data overwrite');
 }
 assert.deepEqual(result.errors,[]);
 await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
} catch(error) {
 await page?.screenshot({path:fileURLToPath(new URL('failure.png',output))}).catch(()=>{});
 await writeFile(new URL('failure.json',output),JSON.stringify({...result,error:String(error)},null,2));
 throw error;
} finally {await browser.close();}
```

## E:\WorkMemo\tests\dashboard-api.test.mjs

```mjs
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

globalThis.location = new URL('http://127.0.0.1/dashboard#token=isolated-api-unit');
const storage=new Map();
globalThis.sessionStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
globalThis.history={replaceState:()=>{}};
const {api,ApiError}=await import('../src/dashboard/api.ts');
const originalFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=originalFetch;});

test('503 busy is unavailable, while 401/403 alone request reauthorization',async()=>{
  for(const status of [401,403,503]) {
    globalThis.fetch=async()=>new Response(status===503?'busy':'forbidden',{status});
    await assert.rejects(api('meta'),error=>error instanceof ApiError && error.status===status
      && error.kind===(status===503?'unavailable':'auth')
      && (status===503?!error.message.includes('授权'):error.message.includes('授权')));
  }
});

test('business errors retain their message and malformed success is not an authorization failure',async()=>{
  globalThis.fetch=async()=>Response.json({error:'日期范围无效'},{status:400});
  await assert.rejects(api('query',{}),error=>error.kind==='business'&&error.message==='日期范围无效');
  for(const response of [new Response('{bad',{headers:{'content-type':'application/json'}}),new Response('html'),Response.json(null)]) {
    globalThis.fetch=async()=>response;
    await assert.rejects(api('meta'),error=>error.kind==='invalid-response'&&!error.message.includes('授权'));
  }
  globalThis.fetch=async()=>Response.json({error:'隔离服务异常'},{status:500});
  await assert.rejects(api('meta'),error=>error.kind==='unavailable'&&error.message==='隔离服务异常');
});

test('read cancellation is propagated without being converted into a network error',async()=>{
  const controller=new AbortController(),reason=new DOMException('old query','AbortError');
  globalThis.fetch=async(_url,options)=>new Promise((_resolve,reject)=>{
    options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});
  });
  const request=api('query',{}, {signal:controller.signal});
  controller.abort(reason);
  await assert.rejects(request,error=>error===reason);
});

test('HTTP timeout and network failure preserve uncertain-write guidance and request identity',async()=>{
  const input={request_id:'unchanged-isolated-id',quantity:0};
  const bodies=[];
  globalThis.fetch=async(_url,options)=>{bodies.push(options.body);throw new TypeError('network');};
  for(let i=0;i<2;i++) await assert.rejects(api('manual-entry',input),error=>error.kind==='network'&&error.message.includes('原样重试'));
  assert.deepEqual(bodies,[JSON.stringify(input),JSON.stringify(input)]);
  globalThis.fetch=async()=>new Response('gateway timeout',{status:504});
  await assert.rejects(api('save',input),error=>error.kind==='timeout'&&error.message.includes('核对'));
});

test('the eight-second transport deadline stays independent of caller cancellation',async()=>{
  const originalTimeout=AbortSignal.timeout;
  const guard=setTimeout(()=>{},1000);
  try {
    AbortSignal.timeout=milliseconds=>{assert.equal(milliseconds,8000);return originalTimeout(5);};
    globalThis.fetch=async(_url,options)=>new Promise((_resolve,reject)=>{
      options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});
    });
    await assert.rejects(api('query',{}),error=>error.kind==='timeout'&&error.status===0);
  } finally {AbortSignal.timeout=originalTimeout;clearTimeout(guard);}
});
```

## E:\WorkMemo\tests\dashboard-status.test.mjs

```mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { recordStatusLabel } from '../src/dashboard/recordStatus.ts';
import { dashboardFixture } from '../scripts/dashboard-fixture.mjs';

test('timer, pause, suspension and recovery have distinct truthful labels', () => {
  const row = {status:'WORKING',is_paused:false,recovery_pending:false,settlement_status:'IN_PROGRESS'};
  assert.equal(recordStatusLabel(row),'计时中');
  assert.equal(recordStatusLabel({...row,is_paused:true}),'已暂停');
  assert.equal(recordStatusLabel({...row,is_paused:true,recovery_pending:true}),'待恢复');
  assert.equal(recordStatusLabel({...row,status:'SUSPENDED',is_paused:true}),'已挂起');
  assert.equal(recordStatusLabel({...row,status:'NOT_STARTED'}),'未开始');
  assert.equal(recordStatusLabel({...row,status:'FINISHED',settlement_status:'PENDING'}),'待补全');
  assert.equal(recordStatusLabel({...row,status:'FINISHED',settlement_status:'COMPLETE'}),'已确认');
});

test('browser fixtures obey the same status contract as the real Rust query', async () => {
  const contract = JSON.parse(await readFile(new URL('./fixtures/dashboard-status-contract.json',import.meta.url),'utf8'));
  const state = await dashboardFixture({route:async()=>{}});
  const base=state.records[0];
  state.active=null;
  for(const paused of [false,true]) {
    state.records=contract.records.map(row=>({...base,...row,start_time:0,
      is_paused:row.status!=='WORKING'||paused,
      end_time:row.status==='FINISHED'?1000:null,
      quantity:row.settlement_status==='COMPLETE'?0:null}));
    for(const [status,expected] of Object.entries(contract.expected)) {
      const value=state.data({period:'custom',anchor_date:null,start_date:null,end_date:null,category:null,scope:'real',status,page:1});
      assert.deepEqual(value.records.map(row=>row.id).sort((a,b)=>a-b),expected);
      if(status==='unfinished') assert.equal(value.totals.records,0);
    }
  }
});
```

## E:\WorkMemo\tests\fixtures\dashboard-status-contract.json

```json
{
  "records": [
    { "id": 1, "status": "WORKING", "settlement_status": "IN_PROGRESS" },
    { "id": 2, "status": "SUSPENDED", "settlement_status": "IN_PROGRESS" },
    { "id": 3, "status": "FINISHED", "settlement_status": "PENDING" },
    { "id": 4, "status": "FINISHED", "settlement_status": "COMPLETE" }
  ],
  "expected": {
    "all": [1, 2, 3, 4],
    "working": [1],
    "unfinished": [1, 2],
    "pending": [3],
    "complete": [4]
  }
}
```
