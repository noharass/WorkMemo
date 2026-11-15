# 网页阶段 B 完整源码

2026-11-16。13 个实现/测试文件的完整内容，未使用省略号。交付与检查见 WEB-PHASE-B.md。

## E:\WorkMemo\src\Dashboard.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { loopTabWithin } from "./ui/loopTabWithin";
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
    <Form.Item label={label} htmlFor={`dc-filter-date-${required ? "anchor" : label === "开始日期" ? "start" : "end"}`} validateStatus={filterError && !required ? "error" : undefined}>
      <DatePicker
        id={`dc-filter-date-${required ? "anchor" : label === "开始日期" ? "start" : "end"}`}
        aria-required={required}
        aria-invalid={!!filterError && !required}
        aria-describedby={filterError && !required ? "dc-filter-error" : undefined}
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => {setFilterError("");change(date?.format("YYYY-MM-DD") ?? null);}}
        inputReadOnly={false}
      />
    </Form.Item>
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

## E:\WorkMemo\src\Dashboard.css

```css
/* Web-only layout. Ant Design owns control appearance, focus, motion and overlays. */
/* Keep specificity below the library's `html body` scroll locker. */
body:where(:has(.data-center)) {
  overflow: auto;
  background: #edf2ee;
}
/* Legacy desktop buttons use width:100%; web controls opt out without a global reset. */
.wm-ui-root .wm-btn:not(.wm-btn-icon-only),
.dc-sheet-root .wm-btn:not(.wm-btn-icon-only),
.wm-modal .wm-btn:not(.wm-btn-icon-only) {
  width: auto;
}
.dc-manual-entry .wm-picker-clear {
  width: auto;
}
.dc-manual-entry-picker button {
  width: auto;
}
@media (max-width: 640px) {
  .dc-manual-entry-picker .wm-picker-datetime-panel {
    flex-direction: column;
  }
  .dc-manual-entry-picker .wm-picker-panel-container {
    max-height: calc(100dvh - 24px);
    overflow-y: auto;
  }
  .dc-manual-entry-picker.wm-picker-dropdown .wm-picker-time-panel .wm-picker-content {
    height: 112px;
  }
}
.data-center {
  min-height: 100vh;
  color: #243c33;
  background: #edf2ee;
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
}
.data-center *,
.dc-sheet-root * {
  box-sizing: border-box;
}
.data-center h1,
.data-center h2,
.dc-sheet-title h2 {
  margin: 0;
  font-weight: 650;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 16px;
}
.data-center p {
  margin: 0;
}
.data-center .icon,
.dc-sheet-root .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 17px;
}
.data-center .work-badge,
.dc-sheet-root .work-badge {
  min-width: 0;
  gap: 9px;
  font-weight: 550;
}
.data-center .work-badge > span:last-child,
.dc-sheet-root .work-badge > span:last-child {
  white-space: normal;
  overflow-wrap: anywhere;
}
.data-center .work-symbol,
.dc-sheet-root .work-symbol {
  width: 30px;
  height: 30px;
  border-radius: 9px;
}
.data-center .work-symbol .icon,
.dc-sheet-root .work-symbol .icon {
  font-size: 16px;
}
.dc-sidebar {
  width: 68px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  background: rgb(255 255 255 / 60%);
  border-right: 1px solid #e3ebe5;
}
.dc-brand {
  display: inline-flex;
  margin-bottom: 26px;
}
.dc-brand img {
  width: 36px;
  height: 36px;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding-top: 20px;
}
.connection-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b48350;
  box-shadow: 0 0 0 4px #b4835010;
}
.connection-dot.connected {
  background: #37936d;
  box-shadow: 0 0 0 4px #37936d10;
}
.dc-page {
  margin-left: 68px;
}
.dc-topbar {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 28px;
  background: rgb(255 255 255 / 65%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e3ebe5;
}
.dc-breadcrumb {
  font-size: 12px;
  color: #52685b;
  white-space: nowrap;
}
.dc-breadcrumb > span {
  color: #52685b;
  margin-left: 12px;
}
.dc-sync {
  display: inline-block;
  min-width: 118px;
  color: #52685b;
  font-size: 11px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dc-main {
  max-width: 1380px;
  margin: auto;
  padding: 28px 28px 0;
}
.dc-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.dc-eyebrow {
  display: block;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #52685b;
  margin-bottom: 6px;
  font-weight: 600;
}
.dc-heading h1 {
  font-size: 28px;
  line-height: 1.3;
  margin-bottom: 7px;
}
.dc-heading p {
  font-size: 13px;
  color: #52685b;
}
.dc-notice {
  margin-block: 14px;
}
.dc-period-bar,
.dc-period-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-period-nav {
  justify-content: flex-start;
}
.dc-period-nav strong {
  min-width: 154px;
  text-align: center;
  color: #355b46;
  font-size: 14px;
  font-weight: 550;
}
.dc-filter-form {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.dc-filter-form > .wm-form-item {
  flex: 1 1 136px;
  min-width: 120px;
  margin-bottom: 0;
}
.dc-filter-form .wm-picker,
.dc-filter-form .wm-select {
  width: 100%;
}
.dc-filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filter-summary {
  border-top: 1px solid #edf2ee;
  margin-top: 16px;
  padding-top: 12px;
  min-height: 30px;
  font-size: 11px;
  color: #52685b;
  overflow-wrap: anywhere;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-block: 18px;
}
.dc-kpi-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #52685b;
}
.dc-kpi-label .icon {
  color: #87a58f;
}
.dc-kpi strong {
  display: block;
  font-size: 30px;
  font-weight: 650;
  line-height: 1.6;
  color: #284d3a;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-kpi strong small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 8px;
  color: #52685b;
}
.dc-kpi p {
  font-size: 11px;
  color: #52685b;
}
.dc-card {
  min-width: 0;
  margin-bottom: 18px;
}
.dc-card-title {
  padding-block: 16px;
  white-space: normal;
}
.dc-card-title p {
  margin-top: 4px;
  font-size: 11px;
  color: #52685b;
  font-weight: 400;
}
.dc-report-quantity strong {
  display: block;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.4;
  color: #284d3a;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-report-quantity small {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: #52685b;
}
.dc-number {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dc-date {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dc-muted {
  color: #52685b;
  font-size: 12px;
}
.dc-report-note {
  padding: 14px 24px;
  color: #52685b;
  font-size: 11px;
}
.dc-report-cards {
  display: grid;
  gap: 12px;
  padding: 12px;
}
.dc-report-cards dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}
.dc-report-cards dt {
  font-size: 11px;
  color: #52685b;
  margin-bottom: 6px;
}
.dc-report-cards dd {
  margin: 0;
}
.dc-chart {
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.dc-auxiliary {
  margin-bottom: 18px;
}
.dc-auxiliary small {
  margin-left: 10px;
}
.dc-auxiliary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.dc-auxiliary-grid > * {
  min-width: 0;
}
.dc-category .dc-chart {
  height: 180px;
}
.dc-calendar .dc-chart {
  height: 158px;
}
.dc-heat-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  font-size: 10px;
  color: #52685b;
}
.dc-heat-legend i {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid #1f23281a;
}
.dc-records {
  scroll-margin-top: 80px;
  outline: none;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  flex-wrap: wrap;
}
.dc-pagination > span {
  color: #52685b;
  font-size: 11px;
}
.dc-page-footer {
  text-align: center;
  color: #52685b;
  font-size: 11px;
  padding: 12px 0 28px;
}
.dc-loading {
  padding: 24px;
}
.dc-sheet-title h2 {
  font-size: 20px;
  color: #243c33;
}
.dc-sheet-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dc-unsaved {
  font-size: 12px;
  color: #9c752f;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px;
  background: #f4f8f5;
  border: 1px solid #e6eee8;
  border-radius: 12px;
}
.dc-record-summary > div {
  margin-left: auto;
  text-align: right;
}
.dc-record-summary strong {
  display: block;
  font:
    600 24px/1.4 ui-monospace,
    monospace;
  color: #284d3a;
}
.dc-record-summary small {
  display: block;
  color: #52685b;
  font-size: 11px;
}
.dc-detail-times {
  margin-block: 22px;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #52685b;
}
.dc-detail-quantity strong {
  color: #284d3a;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}
.dc-detail-remark {
  padding: 16px;
  min-height: 76px;
  background: #f7faf8;
  border-radius: 10px;
  color: #526c5d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
}
.dc-audit {
  margin-top: 22px;
}
.dc-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
}
.dc-revision {
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
  overflow-wrap: anywhere;
}
.dc-revision p {
  margin-block: 8px 0;
  white-space: pre-wrap;
}
.dc-confirm-description {
  color: #65796f;
  line-height: 1.9;
  margin-block: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 1000px) {
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 20px;
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-breadcrumb > span,
  .dc-sync {
    display: none;
  }
  .dc-main {
    padding: 20px 16px 0;
  }
  .dc-topbar {
    padding-inline: 16px;
  }
}
@media (max-width: 640px) {
  .dc-main {
    padding-inline: 12px;
  }
  .dc-heading {
    align-items: flex-start;
  }
  .dc-heading h1 {
    font-size: 24px;
  }
  .dc-heading > .wm-tag {
    display: none;
  }
  .dc-period-bar {
    justify-content: center;
  }
  .dc-period-nav {
    justify-content: center;
    gap: 6px;
  }
  .dc-period-nav strong {
    min-width: 138px;
    font-size: 12px;
  }
  .dc-filter-form {
    gap: 12px;
  }
  .dc-filter-form > .wm-form-item {
    flex-basis: calc(50% - 6px);
    min-width: 0;
  }
  .dc-filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .dc-kpis {
    gap: 8px;
  }
  .dc-kpi .wm-card-body {
    padding: 12px 10px;
  }
  .dc-kpi strong {
    font-size: 23px;
  }
  .dc-kpi strong small {
    display: block;
    margin: 0;
    line-height: 1.4;
  }
  .dc-kpi-label {
    font-size: 11px;
  }
  .dc-kpi-label .icon {
    display: none;
  }
  .dc-kpi p {
    font-size: 10px;
    margin-top: 8px;
  }
  .dc-auxiliary small {
    display: block;
    margin-left: 0;
  }
  .dc-pagination {
    padding: 16px;
  }
  .dc-sheet-footer {
    flex-wrap: wrap;
  }
  .dc-sheet-footer > span {
    font-size: 11px;
  }
  .dc-report-note {
    padding-inline: 16px;
  }
}

/* Local browser translucency: the page canvas stays a normal browser surface. */
.data-center { background: linear-gradient(145deg, #f3f2eb, #e7efea 52%, #edf0f5); }
.data-center .wm-card { backdrop-filter: blur(12px); }
.dc-pending-list { display: grid; gap: 16px; min-width: 0; }
.dc-pending-list > p { color: #536b5b; }
.dc-pending-list .wm-table-cell { overflow-wrap: anywhere; }
.dc-pending-refresh { justify-self: start; }

.dc-pie .dc-chart { height:190px; }
.dc-pie-legend { list-style:none; margin:0; padding:0 4px 4px; display:grid; gap:2px; }
.dc-pie-legend .wm-btn { display:flex; align-items:center; width:100%; height:auto; min-height:30px; padding:4px 7px; gap:7px; }
.dc-pie-legend i { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.dc-pie-name { flex:1; min-width:0; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dc-pie-value { flex-shrink:0; font-size:12px; font-variant-numeric:tabular-nums; }
@media (min-width:760px) and (max-width:1199px) {
  .dc-auxiliary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .dc-auxiliary-grid .dc-calendar { grid-column:1/-1; }
}
@media (max-width:759px) { .dc-auxiliary-grid { grid-template-columns:minmax(0,1fr); } }

.dc-announcer {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
}
.dc-chart-hint { color: #52685b; font-size: 12px; padding: 8px 12px; }
.dc-chart-data { margin: 0 8px 8px; }
.dc-error-summary { scroll-margin-block: 20px; }
.data-center :is(button, a, [role="button"]):focus-visible,
.dc-sheet-root button:focus-visible,
.wm-modal button:focus-visible,
.dc-error-summary:focus {
  outline: 2px solid #287b63; outline-offset: 3px;
}
@media (forced-colors: active) {
  .data-center, .dc-sheet-root .wm-drawer-section, .wm-modal .wm-modal-container {
    background: Canvas !important; color: CanvasText !important; backdrop-filter: none !important;
  }
  .data-center :is(button, a, [role="button"], input, textarea, [role="combobox"]):focus-visible,
  .dc-sheet-root :is(button, input, textarea, [role="combobox"]):focus-visible,
  .wm-modal :is(button, input, textarea, [role="combobox"]):focus-visible,
  .dc-error-summary:focus {
    outline: 2px solid Highlight !important; outline-offset: 3px;
  }
  .data-center .wm-card, .dc-chart-data, .dc-record-summary { border: 1px solid CanvasText; }
}
.dc-required-mark { color: #b74251; margin-inline-end: 4px; }
```

## E:\WorkMemo\src\dashboard\ManualEntryModal.tsx

```tsx
import { useEffect, useId, useRef, useState } from "react";
import { Alert, App, Button, DatePicker, Form, Input, Modal, Select, Space, Typography } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { CATEGORIES, formatDuration } from "../types";
import { useCategoryNames } from "../categoryNames";
import { loopTabWithin } from "../ui/loopTabWithin";
import { api, type Detail } from "./api";
import { validateManualEntry, type ManualEntryField } from "./manualEntry";

dayjs.extend(utc);

export function ManualEntryModal({ online, onClose, onSaved }: {
  online: boolean; onClose: () => void; onSaved: (value: Detail) => void;
}) {
  const { modal } = App.useApp();
  const { name } = useCategoryNames();
  const [requestId] = useState(() => crypto.randomUUID());
  const [initialEnd] = useState(() => dayjs().utcOffset(8).startOf("minute"));
  const [category, setCategory] = useState("开发");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [rest, setRest] = useState("");
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null] | null>([initialEnd.subtract(1, "hour"), initialEnd]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState<{field: ManualEntryField; error: string} | null>(null);
  const [covered, setCovered] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const prefix = useId();
  const id = (field: string) => `${prefix}-${field}`;
  const clearError = (field: ManualEntryField) => {
    if (!fieldError || fieldError.field === field) { setFieldError(null); setError(""); }
  };
  const feedback = (field: ManualEntryField) => fieldError?.field === field
    ? <span id={id(`${field}-error`)}>{fieldError.error}</span> : undefined;
  const attributes = (field: ManualEntryField, hint?: string) => ({
    "aria-invalid": fieldError?.field === field,
    "aria-describedby": [hint ? id(hint) : "", fieldError?.field === field ? id(`${field}-error`) : ""].filter(Boolean).join(" ") || undefined,
  });
  const saving = useRef(false);
  const confirming = useRef(false);
  // Interpret the displayed calendar components in Beijing, even on computers in other zones.
  const start = range?.[0]?.utcOffset(8, true).valueOf() ?? NaN;
  const end = range?.[1]?.utcOffset(8, true).valueOf() ?? NaN;
  const dirty = category !== "开发" || quantity !== "" || remark !== "" || rest !== ""
    || start !== initialEnd.subtract(1, "hour").valueOf() || end !== initialEnd.valueOf();
  const span = end - start;
  const restMs = Number(rest || "0") * 60_000;
  const preview = Number.isFinite(span) && span > 0 && Number.isFinite(restMs) && restMs >= 0 && restMs <= span
    ? formatDuration(Math.round(span - restMs) / 1000) : "—";
  useEffect(() => {
    if (!error || busy || confirming.current) return;
    const frame = requestAnimationFrame(() => {
      if (fieldError && fieldError.field !== "time") document.getElementById(`${prefix}-${fieldError.field}`)?.focus();
      else summary.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [error, fieldError, busy, prefix]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault(); void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty || saving.current) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => { window.removeEventListener("keydown", keys); window.removeEventListener("beforeunload", unload); };
  });
  function close() {
    if (saving.current || confirming.current) return;
    if (!dirty) { onClose(); return; }
    confirming.current = true;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCovered(true);
    modal.confirm({
      title: "放弃这次补记录？",
      content: "未确认保存的输入将被放弃。若刚才连接中断，请先原样重试或刷新明细核对。",
      okText: "放弃补录", cancelText: "继续填写", focusable: { autoFocusButton: "cancel" },
      modalRender: node => <div onKeyDown={loopTabWithin} style={{display:"contents"}}>{node}</div>,
      onOk: onClose,
      afterClose: () => {
        confirming.current = false; setCovered(false);
        requestAnimationFrame(() => { if (trigger?.isConnected) trigger.focus(); });
      },
    });
  }
  async function save() {
    if (!online || saving.current || confirming.current) return;
    const result = validateManualEntry(requestId, category, quantity, remark, start, end, rest);
    if (!result.ok) { setFieldError(result); setError(result.error); return; }
    saving.current = true; setBusy(true); setFieldError(null); setError("");
    try {
      const saved = await api<Detail>("manual-entry", result.input);
      onSaved(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "补记录未完成，请保留输入后重试。");
    } finally { saving.current = false; setBusy(false); }
  }
  return <Modal open title="补记录" onCancel={close} centered width={560} className="dc-manual-entry"
    modalRender={node => <div inert={covered} onKeyDown={event => {if (!covered) loopTabWithin(event);}} style={{display:"contents"}}>{node}</div>}
    focusable={{trap:!covered,focusTriggerAfterClose:true}}
    mask={{ closable: false }} keyboard={!busy} closable={!busy}
    styles={{ body: { maxHeight: "calc(100dvh - 220px)", overflowY: "auto" } }}
    footer={<Space wrap>
      <Button disabled={busy} onClick={close}>取消</Button>
      <Button type="primary" aria-label="保存补录" aria-busy={busy} loading={busy} disabled={!online || busy} onClick={() => void save()}>保存补录</Button>
    </Space>}>
    <p>补录已完成的工作，保存后计入统计，并标记为「人工补录」。</p>
    <Form layout="vertical" aria-label="补记录表单" noValidate disabled={busy} onFinish={() => void save()}>
      <Form.Item label="类别" htmlFor={id("category")} required help={feedback("category")} validateStatus={fieldError?.field === "category" ? "error" : undefined}>
        <Select id={id("category")} aria-label="补录类别" aria-required {...attributes("category")} value={category} onChange={value => {setCategory(value);clearError("category");}}
          options={CATEGORIES.map(value => ({ value, label: name(value) }))} />
      </Form.Item>
      <Form.Item label="工作量" htmlFor={id("quantity")} required help={feedback("quantity")} validateStatus={fieldError?.field === "quantity" ? "error" : undefined} extra={<span id={id("quantity-hint")}>0 表示无产出。</span>}>
        <Input id={id("quantity")} required {...attributes("quantity", "quantity-hint")} aria-label="补录工作量" autoFocus inputMode="decimal" value={quantity} onChange={e => {setQuantity(e.target.value);clearError("quantity");}} />
      </Form.Item>
      <Form.Item label="起止时间（北京时间）" htmlFor={id("start")} required help={feedback("time")} validateStatus={fieldError?.field === "time" ? "error" : undefined}>
        <Space wrap style={{ width: "100%" }}>
          <DatePicker id={id("start")} aria-required {...attributes("time")} aria-label="补录开始时间" value={range?.[0]} onChange={value => {setRange([value, range?.[1] ?? null]);clearError("time");}}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="开始时间" minDate={dayjs("1970-01-01")} />
          <span>至</span>
          <DatePicker id={id("end")} aria-required {...attributes("time")} aria-label="补录结束时间" value={range?.[1]} onChange={value => {setRange([range?.[0] ?? null, value]);clearError("time");}}
            classNames={{ popup: { root: "dc-manual-entry-picker" } }}
            popupAlign={{ offset: [0, 0], overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } }}
            showTime={{ format: "HH:mm" }} format="YYYY-MM-DD HH:mm" placeholder="结束时间" minDate={dayjs("1970-01-01")} />
        </Space>
      </Form.Item>
      <Form.Item label="扣除休息分钟数" htmlFor={id("rest")} help={feedback("rest")} validateStatus={fieldError?.field === "rest" ? "error" : undefined} extra={<span id={id("rest-hint")}>不填按 0 分钟计算，可填写小数。</span>}>
        <Input id={id("rest")} {...attributes("rest", "rest-hint")} aria-label="扣除休息分钟数" inputMode="decimal" value={rest} onChange={e => {setRest(e.target.value);clearError("rest");}} />
      </Form.Item>
      <Form.Item label="备注" htmlFor={id("remark")} help={feedback("remark")} validateStatus={fieldError?.field === "remark" ? "error" : undefined} extra={<span id={id("remark-hint")}>最多 2000 个字符。</span>}>
        <Input.TextArea id={id("remark")} {...attributes("remark", "remark-hint")} aria-label="补录备注" value={remark} onChange={e => {setRemark(e.target.value);clearError("remark");}} rows={3} />
      </Form.Item>
      <Typography.Paragraph>有效工时：<strong>{preview}</strong></Typography.Paragraph>
      {!online && <Alert type="warning" showIcon title="本机连接已中断，请恢复连接后保存。" />}
      {error && <div ref={summary} role="group" tabIndex={-1} className="dc-error-summary" aria-label="补录校验错误">
        <Alert type="error" showIcon title={error} action={fieldError?.field === "time" ? <Button onClick={() => document.getElementById(id("start"))?.focus()}>检查起止时间</Button> : undefined} />
      </div>}
    </Form>
  </Modal>;
}
```

## E:\WorkMemo\src\dashboard\manualEntry.ts

```ts
import { validateWorkInput } from "../workInput.ts";

export type ManualEntry = {
  request_id: string;
  category: string;
  quantity: number;
  remark: string;
  start_time: number;
  end_time: number;
  duration_ms: number;
};
export type ManualEntryField = "category" | "quantity" | "remark" | "time" | "rest";
export function validateManualEntry(
  requestId: string, category: string, quantity: string, remark: string,
  start: number, end: number, restMinutes: string, now = Date.now(),
): { ok: true; input: ManualEntry } | { ok: false; error: string; field: ManualEntryField } {
  const work = validateWorkInput(category, quantity, remark, true);
  if (!work.ok) return { ok: false, error: Object.values(work.errors)[0]!, field: Object.keys(work.errors)[0] as ManualEntryField };
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end <= start)
    return { ok: false, error: "请选择有效的起止时间，结束时间须晚于开始时间。", field: "time" };
  if (end > now) return { ok: false, error: "不能补录未来的工作时间。", field: "time" };
  const text = restMinutes.trim();
  const rest = text === "" ? 0 : Number(text);
  if ((text !== "" && !/^\d+(?:\.\d+)?$/.test(text)) || !Number.isFinite(rest)
    || rest < 0 || rest * 60_000 > end - start)
    return { ok: false, error: "休息分钟数须大于或等于 0，且不能超过起止时间跨度。", field: "rest" };
  return { ok: true, input: {
    request_id: requestId, category: work.input.category, quantity: work.input.quantity!,
    remark: work.input.remark, start_time: start, end_time: end,
    duration_ms: Math.round(end - start - rest * 60_000),
  } };
}
```

## E:\WorkMemo\src\dashboard\Charts.tsx

```tsx
import { memo, useEffect, useId, useMemo, useRef } from "react";
import { ChartDataTable } from "./ChartDataTable";
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
  descriptionId,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  descriptionId?: string;
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
  return <div ref={node} className="dc-chart" role="img" aria-label={label} aria-describedby={descriptionId} />;
});

export function TrendChart({ trend, range }: Pick<Data, "trend" | "range">) {
  const descriptionId = useId();
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
          color: "#52685b",
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
        axisLabel: { color: "#52685b" },
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
  return <>
    <Chart option={option} label="有效工时趋势" descriptionId={descriptionId} />
    <p id={descriptionId} className="dc-chart-hint">展开数据表可读取各周期工时，按秒显示。</p>
    <ChartDataTable title="趋势" rows={trend.map(row => ({label:row.date,duration_ms:row.duration_ms}))} />
  </>;
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
        <Button type="text" style={{ width: "100%" }} onClick={() => onCategory(slice.category)} aria-label={`${name(slice.category)} ${slice.percentLabel}，工时 ${formatDuration(slice.value / 1000)}，筛选此类别`}>
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
  const descriptionId = useId();
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
        monthLabel: { nameMap: "cn", color: "#52685b" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#52685b" },
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
  return <>
    <Chart option={option} label="筛选范围内的有效工时工作日历" descriptionId={descriptionId} />
    <p id={descriptionId} className="dc-chart-hint">展开数据表可读取日历中的日期及工时，按秒显示。</p>
    <ChartDataTable title="工作日历" rows={calendar.map(([label,duration_ms]) => ({label,duration_ms}))} />
  </>;
}
```

## E:\WorkMemo\src\dashboard\ChartDataTable.tsx

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
        {title:"有效工时（秒）",dataIndex:"duration_ms",render:(value:number)=>(value / 1000).toLocaleString("zh-CN",{maximumFractionDigits:3})},
      ]} />,
  }]} />;
}
```

## E:\WorkMemo\src\ui\UiProvider.tsx

```tsx
import { App, ConfigProvider, type ThemeConfig } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";

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

## E:\WorkMemo\src\ui\BottomSheet.tsx

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
          background: "rgb(250 253 250 / 86%)",
          backdropFilter: "blur(18px)",
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
          backdropFilter: "blur(3px)",
        },
      }}
    />
  );
}
```

## E:\WorkMemo\src\ui\loopTabWithin.ts

```ts
import type { KeyboardEvent } from "react";

/** Complete Ant Design's focus lock at Edge's browser-chrome Tab boundary. */
export function loopTabWithin(event: KeyboardEvent<HTMLElement>) {
  if (event.defaultPrevented || event.key !== "Tab") return;
  const controls = [...event.currentTarget.querySelectorAll<HTMLElement>(
    "button, input, textarea, select, a[href], [tabindex]",
  )].filter(element => element.tabIndex >= 0 && !element.matches(":disabled")
    && !element.closest("[inert]") && element.getClientRects().length > 0);
  const first = controls[0], last = controls[controls.length - 1];
  const target = event.shiftKey && document.activeElement === first ? last
    : !event.shiftKey && document.activeElement === last ? first : null;
  if (target) {
    event.preventDefault();
    target.focus({ preventScroll: true });
  }
}
```

## E:\WorkMemo\tests\manual-entry.test.mjs

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManualEntry } from '../src/dashboard/manualEntry.ts';
const validate = (overrides = {}) => {
  const value = { id: 'valid-request-0001', category: '开发', quantity: '2.5', remark: '  工作  ', start: 1000, end: 361000, rest: '1.5', now: 400000, ...overrides };
  return validateManualEntry(value.id, value.category, value.quantity, value.remark, value.start, value.end, value.rest, value.now);
};
test('补录按真实时间跨度扣除休息，保留小数工作量和去空白备注', () => {
  assert.deepEqual(validate(), { ok: true, input: { request_id: 'valid-request-0001', category: '开发', quantity: 2.5, remark: '工作', start_time: 1000, end_time: 361000, duration_ms: 270000 } });
  assert.equal(validate({ rest: '' }).input.duration_ms, 360000);
  assert.equal(validate({ quantity: '0', rest: '6' }).input.duration_ms, 0);
});
test('补录拒绝缺失数量、无效时间、未来时间和超长休息', () => {
  for (const input of [{ quantity: '' }, { quantity: '-1' }, { quantity: '1e-9999' }, { category: '' }, { start: NaN }, { end: NaN }, { start: -1 }, { start: 0.5 }, { end: 999 }, { end: 400001 }, { rest: '-1' }, { rest: '7' }, { rest: 'Infinity' }, { rest: '0x1' }, { rest: '1e-3' }, { remark: '😀'.repeat(2001) }]) {
    assert.equal(validate(input).ok, false, JSON.stringify(input));
  }
  assert.equal(validate({ remark: '😀'.repeat(2000) }).ok, true);
});

test('补录校验标识出错字段，时间关系错误定位到时间摘要', () => {
  for (const [input,field] of [[{quantity:''},'quantity'],[{category:''},'category'],[{remark:'😀'.repeat(2001)},'remark'],[{end:999},'time'],[{end:400001},'time'],[{rest:'7'},'rest']]) {
    const result=validate(input);
    assert.equal(result.ok,false);
    assert.equal(result.field,field);
    assert.ok(result.error);
  }
});
```

## E:\WorkMemo\scripts\verify-v027-feedback.mjs

```javascript
// Local browser fixtures only; no task data, registration or user settings are changed.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
import { desktopFixture } from './desktop-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:1420';
const desktopBase = process.env.WORKMEMO_UI_URL || base + '/';
const output = new URL('../artifacts/0.2.7/qa/feedback/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [], warnings = [];
let page;
async function setup(width = 1440, desktop = false) {
  await page?.close();
  page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId: 'Asia/Shanghai' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('status of 500')) warnings.push(message.text()); });
  if (desktop) { await desktopFixture(page); return null; }
  return dashboardFixture(page);
}
async function goto() {
  await page.goto(`${base}/dashboard#token=isolated-feedback`);
  await page.locator('.dc-category-report').getByText('128.5', { exact: true }).waitFor();
}
const hints = () => page.locator('.dc-nav-tooltip:visible');
async function expand() {
  await page.getByRole('button', { name: '辅助分析', exact: true }).click();
  await page.getByRole('list', { name: '工时占比明细' }).waitFor();
  await page.waitForTimeout(350);
  await settledCharts();
}
async function settledCharts() {
  await page.locator('.dc-auxiliary-grid').evaluate(root => new Promise((resolve, reject) => {
    const start = performance.now(); let previous = '', stable = 0;
    function sample() {
      const current = [...root.querySelectorAll('canvas')].map(canvas => canvas.toDataURL()).join('|');
      stable = previous === current ? stable + 1 : 0; previous = current;
      if (stable >= 4 && performance.now() - start >= 350) return resolve(true);
      if (performance.now() - start > 5000) return reject(Error('Analysis charts did not settle'));
      requestAnimationFrame(sample);
    }
    sample();
  }));
}
async function test(name, fn) { await fn(); results.push(name); }
try {
  await test('navigation hints close before scrolling, stay hidden until leave, and keyboard navigation remains usable', async () => {
    await setup(); await goto();
    await page.evaluate(() => {
      window.navTrace = [];
      for (const type of ['focusin', 'focusout', 'keydown']) document.addEventListener(type, event => window.navTrace.push({ type, key: event.key, text: event.target.textContent?.slice(0, 30) }), true);
      const scroll = window.scrollTo.bind(window);
      window.scrollTo = (...args) => { window.navTrace.push({ scrollTo: args }); return scroll(...args); };
    });
    const nav = page.locator('.dc-sidebar .wm-menu');
    const records = page.getByRole('menuitem', { name: '工作明细', exact: true });
    const overview = page.getByRole('menuitem', { name: '工作总览', exact: true });
    assert.equal(await records.getAttribute('title'), null);
    assert.equal(await overview.getAttribute('title'), null);
    await records.hover(); await hints().getByText('工作明细', { exact: true }).waitFor();
    const initial = await nav.boundingBox();
    await records.click();
    await hints().waitFor({ state: 'hidden' });
    await page.waitForTimeout(350);
    for (let i = 0; i < 10; i++) {
      assert.equal(await hints().count(), 0);
      assert.deepEqual(await nav.boundingBox(), initial);
      await page.waitForTimeout(60);
    }
    assert.ok(await page.evaluate(() => scrollY) > 300);
    await page.mouse.move(400, 120); await overview.hover();
    await hints().getByText('工作总览', { exact: true }).waitFor();
    await overview.click(); await hints().waitFor({ state: 'hidden' });
    await page.waitForFunction(() => Math.abs(scrollY) < 1);
    await page.mouse.move(400, 120);
    await overview.focus(); await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.activeElement?.textContent === '工作明细');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => scrollY > 300);
    assert.equal(await records.evaluate(el => document.activeElement === el), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(50);
    // The theme provider updates on a system motion-preference change. Enter
    // the menu again before testing its keyboard operation in the new mode.
    await records.focus(); await page.keyboard.press('Home');
    await page.waitForFunction(() => document.activeElement?.textContent === '工作总览');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => Math.abs(scrollY) < 1);
    await page.mouse.move(400, 120); await records.hover();
    await hints().getByText('工作明细', { exact: true }).waitFor();
    const fixedHint = await hints().boundingBox();
    // Keep the pointer over the fixed icon while the document scrolls.
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'instant' }));
    await page.waitForFunction(() => scrollY > 100);
    const scrolledHint = await hints().boundingBox();
    assert.ok(Math.abs(fixedHint.x - scrolledHint.x) < 1 && Math.abs(fixedHint.y - scrolledHint.y) < 1);
    await page.mouse.move(400, 160); await page.mouse.wheel(0, 400);
    await hints().waitFor({ state: 'hidden' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await records.click(); await overview.click();
    await page.waitForFunction(() => Math.abs(scrollY) < 1);
    assert.equal(await hints().count(), 0);
    await page.screenshot({ path: fileURLToPath(new URL('navigation.png', output)) });
  });
  await test('pie uses ended/pending hours and category colors, and slice click applies a category filter', async () => {
    const state = await setup(); await goto(); await expand();
    const legend = page.getByRole('list', { name: '工时占比明细' });
    assert.equal(await legend.getByRole('button').count(), 3);
    await legend.getByRole('button', { name: /评测 62.75%，工时 02:40:00/ }).waitFor();
    await legend.getByRole('button', { name: /代码开发 29.41%，工时 01:15:00/ }).waitFor();
    assert.equal(await legend.locator('i').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(59, 130, 246)');
    const pie = page.getByRole('img', { name: '按类别汇总的工时占比' });
    const box = await pie.boundingBox();
    await pie.click({ position: { x: box.width / 2 + 35, y: box.height / 2 } });
    await page.waitForFunction(() => document.querySelector('.dc-pie-legend')?.textContent.includes('100%'));
    assert.equal(state.currentQuery.category, '评测');
    assert.equal(await legend.getByRole('button').count(), 1);
    await page.screenshot({ path: fileURLToPath(new URL('pie-filter.png', output)) });
  });
  await test('zero and empty hours do not produce slices; tiny hours and long renamed categories stay selectable', async () => {
    const state = await setup();
    for (const row of state.records) row.duration_ms = 0;
    await goto(); await page.getByRole('button', { name: '辅助分析', exact: true }).click();
    await page.getByText('暂无有效工时', { exact: true }).waitFor();
    assert.equal(await page.getByRole('img', { name: '按类别汇总的工时占比' }).count(), 0);
    state.records = [];
    await page.reload(); await page.getByRole('button', { name: '辅助分析', exact: true }).click();
    await page.getByText('暂无有效工时', { exact: true }).waitFor();
    const next = await setup();
    next.names.names['开发'] = '很长的开发类别名称，用于检查图例溢出与类别筛选';
    next.presentation.categories['开发'].color = '#aa22cc';
    for (const row of next.records) row.duration_ms = row.category === '开发' ? 1 : 999999;
    await goto(); await expand();
    const tiny = page.getByRole('list', { name: '工时占比明细' }).getByRole('button', { name: /很长的开发类别名称.*不足 0.01%/ });
    await tiny.waitFor(); await tiny.click();
    await page.waitForFunction(() => document.querySelector('.dc-pie-legend')?.textContent.includes('100%'));
    assert.equal(next.currentQuery.category, '开发');
  });
  await test('analysis layouts use three/two/one columns and the calendar spans medium widths', async () => {
    await setup(); await goto(); await expand();
    for (const [width, columns] of [[1440, 3], [1200, 3], [1000, 2], [760, 2], [640, 1], [390, 1]]) {
      await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(250);
      const grid = await page.locator('.dc-auxiliary-grid').evaluate(el => ({
        columns: getComputedStyle(el).gridTemplateColumns.split(' ').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        boxes: [...el.children].map(node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width }; }),
      }));
      assert.equal(grid.columns, columns); assert.equal(grid.overflow, false);
      if (columns === 2) assert.ok(grid.boxes[2].width > grid.boxes[0].width * 1.9);
      if (columns === 3) assert.ok(grid.boxes.every(box => Math.abs(box.y - grid.boxes[0].y) < 1));
      await settledCharts();
      await page.locator('.dc-auxiliary').screenshot({ path: fileURLToPath(new URL(`analysis-${width}.png`, output)) });
    }
  });
  await test('desktop keeps one monitoring explanation, rounded strips and visible failure/recovery states', async () => {
    await setup(780, true);
    await page.goto(`${desktopBase}?state=empty&background=1`);
    const status = page.getByRole('region', { name: '监测状态' }); await status.waitFor();
    const details = status.locator('details');
    assert.equal(await details.getAttribute('open'), null);
    assert.equal(await status.locator('.hint').count(), 0);
    assert.equal(await page.locator('.monitor-caption').count(), 0);
    await details.locator('summary').click();
    await details.getByText('已识别工作页面，等待新的鼠标或键盘活动', { exact: true }).waitFor();
    await details.locator('summary').click();
    for (const selector of ['.home-footer', '.today-strip']) {
      const metrics = await page.locator(selector).evaluate(el => ({ radius: parseFloat(getComputedStyle(el).borderTopLeftRadius), padding: parseFloat(getComputedStyle(el).paddingLeft) }));
      assert.ok(metrics.radius >= 6 && metrics.padding >= 7, JSON.stringify(metrics));
    }
    await page.waitForFunction(() => window.qa.calls.some(call => call.command === 'fit_main_content'));
    const naturalHeight = await page.evaluate(() => window.qa.calls.filter(call => call.command === 'fit_main_content').at(-1).args.height);
    await page.setViewportSize({ width: 780, height: Math.max(280, naturalHeight) });
    await page.waitForTimeout(150);
    await page.screenshot({ path: fileURLToPath(new URL('desktop-rounded.png', output)) });
    await page.evaluate(() => window.qa.fail = 'get_snapshot');
    await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).waitFor();
    await page.evaluate(() => { window.qa.fail = ''; window.qa.active = { ...window.qa.record, recovery_pending: true, is_paused: true }; });
    await page.getByRole('status').filter({ hasText: '上次未结束的任务保持暂停' }).waitFor();
    await page.goto(`${desktopBase}?panel=settings&section=monitor`);
    const help = page.locator('details').filter({ has: page.locator('summary', { hasText: '网址匹配说明' }) }).last();
    await help.locator('summary').click();
    await help.getByText(/路径前缀限定站点与路径边界/).waitFor();
    await page.getByText('保存会暂停当前自动记录；返回工作页操作后恢复。', { exact: true }).waitFor();
  });
  assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ base, isolated: true, native: false, results, errors, warnings }, null, 2));
  console.log(`v0.2.7 feedback: ${results.length} groups passed.`);
} catch (error) {
  await page?.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  await writeFile(new URL('failure.json', output), JSON.stringify({ results, errors, warnings, message: String(error), scrollY: await page?.evaluate(() => scrollY), navTrace: await page?.evaluate(() => window.navTrace), html: await page?.content() }, null, 2));
  throw error;
} finally { await browser.close(); }
```

## E:\WorkMemo\scripts\verify-web-phase-b.mjs

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
  const expected=state.data(state.currentQuery).trend[9].duration_ms/1000;assert.match(await trend.innerText(),new RegExp(expected.toLocaleString('zh-CN').replaceAll(',','[,]')));
  await page.getByRole('button',{name:'辅助分析',exact:true}).click();await page.getByRole('button',{name:'查看工作日历数据',exact:true}).click();
  const calendar=page.getByRole('table',{name:'工作日历数据',exact:true});await calendar.waitFor();assert.match(await calendar.innerText(),/2026-10-29/);
  await axe('chart-data');await page.emulateMedia({forcedColors:'active'});
  await calendar.getByRole('columnheader',{name:'有效工时（秒）',exact:true}).waitFor();
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

## E:\WorkMemo\scripts\web-contrast.mjs

```javascript
// Sample the actual composited background under representative text in Edge.
// Python/Pillow are development-only; screenshots are never product assets.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {writeFile} from 'node:fs/promises';

export async function checkContrast(page,output,name,selectors){
 if(process.env.WORKMEMO_CONTRAST!=='1')return;
 await page.waitForTimeout(450);
 const samples=await page.evaluate(selectors=>{
  window.contrastStyles=[];
  const nodes=new Set();
  const samples=selectors.flatMap(selector=>[...document.querySelectorAll(selector)].flatMap(el=>{
   const rect=el.getBoundingClientRect(),style=getComputedStyle(el);
   if(el.closest('[inert]')||!rect.width||!rect.height||rect.top<0||rect.bottom>innerHeight||rect.left<0||rect.right>innerWidth)return [];
   const atCenter=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);
   if(atCenter!==el&&!el.contains(atCenter))return [];
   const color=style.color.match(/[\d.]+/g)?.map(Number);
   if(!color||!el.textContent?.trim())return [];
   const sample={selector,text:el.textContent.trim().slice(0,80),color,x:Math.floor(rect.left+rect.width/2),y:Math.floor(rect.top+rect.height/2)};
   for(const node of [el,...el.querySelectorAll('*')])nodes.add(node);
   return [sample];
  }));
  for(const node of nodes){
   window.contrastStyles.push([node,node.getAttribute('style')]);
   node.style.setProperty('color','transparent','important');
  }
  return samples;
 },selectors);
 const path=fileURLToPath(new URL(`contrast-${name}.png`,output));
 try{await page.screenshot({path,animations:'disabled'});}
 finally{await page.evaluate(()=>{for(const [el,style] of window.contrastStyles.reverse())if(style===null)el.removeAttribute('style');else el.setAttribute('style',style);delete window.contrastStyles;});}
 const measured=spawnSync('python',['-c',`
import json,sys
from PIL import Image
image=Image.open(sys.argv[1]).convert('RGB')
def luminance(rgb):
 c=[v/255 for v in rgb]
 c=[v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4 for v in c]
 return sum(a*b for a,b in zip(c,[.2126,.7152,.0722]))
samples=json.load(sys.stdin)
for row in samples:
 bg=image.getpixel((row['x'],row['y']))
 alpha=row['color'][3] if len(row['color'])>3 else 1
 fg=[row['color'][i]*alpha+bg[i]*(1-alpha) for i in range(3)]
 a,b=sorted([luminance(fg),luminance(bg)])
 row['background']=bg
 row['ratio']=round((b+.05)/(a+.05),3)
print(json.dumps(samples,ensure_ascii=False))
 `,path],{input:JSON.stringify(samples),encoding:'utf8'});
 assert.equal(measured.status,0,measured.stderr);
 const report=JSON.parse(measured.stdout);
 await writeFile(new URL(`contrast-${name}.json`,output),JSON.stringify(report,null,2));
 assert.ok(report.length>0,`No contrast samples for ${name}`);
 for(const sample of report)assert.ok(sample.ratio>=4.5,`${name}: ${sample.selector} ${sample.text} contrast ${sample.ratio}`);
 return {samples:report.length,minimum:Math.min(...report.map(s=>s.ratio))};
}
```
