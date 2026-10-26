import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CATEGORIES, formatDuration, formatTime } from "./types";
import { formatQuantity, historyQueryError, localDate, type Totals } from "./history";
import { useHistory } from "./useHistory";

interface Props {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  onDeleted: (id: number) => Promise<void>;
  children?: ReactNode;
}

function StatsTable({ label, rows }: { label: string; rows: { name: string; totals: Totals }[] }) {
  return <section className="stats-section">
    <h3>{label}</h3>
    <div className="stats-scroll"><table>
      <caption className="sr-only">{label}的记录数、数量和有效工作时长</caption>
      <thead><tr><th scope="col">{label === "每日汇总" ? "工作日期" : "工作类别"}</th>
        <th scope="col">记录</th><th scope="col">数量</th><th scope="col">有效时长</th></tr></thead>
      <tbody>{rows.map(({ name, totals }) => <tr key={name}><th scope="row">{name}</th>
        <td>{totals.records}</td><td>{formatQuantity(totals.quantity)}</td>
        <td>{formatDuration(totals.duration_ms / 1000)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}

export function HistoryPanel({ open, onClose, refreshKey, onDeleted, children }: Props) {
  const history = useHistory(open, refreshKey, onDeleted);
  const { query, result, target } = history;
  const dialog = useRef<HTMLDialogElement>(null);
  const confirmation = useRef<HTMLDialogElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<"records" | "stats">("records");
  const [draft, setDraft] = useState(query);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (target && !confirmation.current?.open) {
      confirmation.current?.showModal();
      cancelDelete.current?.focus();
    }
    if (!target && confirmation.current?.open) confirmation.current.close();
  }, [target]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = { ...draft, page: 1 };
    const message = historyQueryError(next);
    setFilterError(message);
    if (!message) history.apply(next);
  }
  const pages = result ? Math.max(1, Math.ceil(result.filtered.records / result.page_size)) : 1;

  return <dialog ref={dialog} className="history-dialog" aria-labelledby="history-title"
    onCancel={(event) => { event.preventDefault(); if (!history.deleting) onClose(); }}>
    <div className="settings-heading">
      <h2 id="history-title">历史与统计</h2>
      <button type="button" className="window-control" aria-label="关闭历史与统计"
        disabled={history.deleting} onClick={onClose}>×</button>
    </div>
    {children}
    <p className="hint">按本机时间的任务开始日期查询，仅统计已完成记录。跨午夜任务归入开始日。</p>
    <form className="history-filters" onSubmit={submit} noValidate>
      <div className="field-row">
        <label>开始日期<input type="date" min="1970-01-01" max="9999-12-31" value={draft.start_date}
          disabled={!history.native || history.deleting} onChange={(event) => { setFilterError(""); setDraft({ ...draft, start_date: event.target.value }); }} /></label>
        <label>结束日期<input type="date" min="1970-01-01" max="9999-12-31" value={draft.end_date}
          disabled={!history.native || history.deleting} onChange={(event) => { setFilterError(""); setDraft({ ...draft, end_date: event.target.value }); }} /></label>
      </div>
      <div className="filter-category-row">
        <label>工作类别<select value={draft.category ?? ""} disabled={!history.native || history.deleting}
          onChange={(event) => { setFilterError(""); setDraft({ ...draft, category: event.target.value || null }); }}>
          <option value="">全部类别</option>
          {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select></label>
        <button type="submit" disabled={!history.native || history.loading || history.deleting}>
          {history.loading ? "正在查询…" : "查询"}</button>
      </div>
      <p className="hint">默认最近 30 天，单次最多 366 天；可更改日期查看更早记录。</p>
      {filterError && <p className="inline-error" role="alert">{filterError}</p>}
    </form>
    <div className="history-tabs" aria-label="查看内容">
      <button type="button" className="secondary" aria-pressed={tab === "records"} onClick={() => setTab("records")}>工作记录</button>
      <button type="button" className="secondary" aria-pressed={tab === "stats"} onClick={() => setTab("stats")}>统计汇总</button>
    </div>
    {!history.native && <p className="notice">浏览器预览不能查询或删除本地工作记录，请打开桌面应用。</p>}
    {history.notice && <p className="history-feedback" role="status">{history.notice}</p>}
    {history.loading && <p className="hint" role="status">正在读取记录和汇总…</p>}
    {history.error && <div className="error-banner" role="alert">
      <p>{history.error}</p><button type="button" className="text-button" disabled={history.loading || history.deleting}
        onClick={() => { void history.reload(); }}>重新读取</button>
    </div>}
    {result && <div aria-busy={history.loading}>
      <p className="history-overview">全部已完成：{result.overview.records} 条 · 数量 {formatQuantity(result.overview.quantity)}
        <br />累计有效时长 {formatDuration(result.overview.duration_ms / 1000)}</p>
      <p className="hint">当前范围：{query.start_date} 至 {query.end_date} · {query.category ?? "全部类别"}</p>
      <dl className="summary-grid">
        <div><dt>完成记录</dt><dd>{result.filtered.records}<small> 条</small></dd></div>
        <div><dt>工作数量</dt><dd>{formatQuantity(result.filtered.quantity)}</dd></div>
        <div><dt>有效时长</dt><dd>{formatDuration(result.filtered.duration_ms / 1000)}</dd></div>
      </dl>
      {result.filtered.records === 0 ? <p className="history-empty">这个范围还没有已完成记录。可以调整日期或类别；完成工作后记录会出现在这里。</p>
        : tab === "records" ? <>
          <ol className="history-records">
            {result.records.map((record) => <li key={record.id}>
              <div className="record-heading"><strong>{record.category} · {formatQuantity(record.quantity)}</strong>
                <span>{formatDuration(record.duration_seconds)}</span></div>
              <p className="hint">工作日期 {localDate(new Date(record.start_time))}<br />
                开始 {formatTime(record.start_time)}<br />结束 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
              <p className="record-remark">{record.remark || "未填写备注"}</p>
              <button type="button" className="text-button delete-link" disabled={history.loading || history.deleting}
                aria-label={`删除 ${record.category} 记录 ${record.id}`} onClick={() => history.chooseDelete(record)}>删除记录</button>
            </li>)}
          </ol>
          <nav className="history-pagination" aria-label="历史记录分页">
            <button type="button" className="secondary" disabled={history.loading || result.page <= 1}
              onClick={() => history.apply({ ...query, page: result.page - 1 })}>上一页</button>
            <span>第 {result.page} / {pages} 页</span>
            <button type="button" className="secondary" disabled={history.loading || result.page >= pages}
              onClick={() => history.apply({ ...query, page: result.page + 1 })}>下一页</button>
          </nav>
        </> : <>
          <StatsTable label="按类别汇总" rows={result.categories.map((row) => ({ name: row.category, totals: row.totals }))} />
          <StatsTable label="每日汇总" rows={result.daily.map((row) => ({ name: row.date, totals: row.totals }))} />
          <p className="hint">汇总覆盖当前全部筛选结果，不限于当前页。数量直接相加；时长先合计毫秒再显示到秒。</p>
        </>}
    </div>}

    <dialog ref={confirmation} className="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); history.cancelDelete(); }}>
      <h2 id="delete-title">删除这条记录？</h2>
      <p id="delete-description">将永久删除这条已完成记录，并重新计算统计。此操作不能撤销。</p>
      {target && <div className="delete-record-detail">
        <strong>{target.category} · {formatQuantity(target.quantity)}</strong>
        <p>开始 {formatTime(target.start_time)}<br />结束 {target.end_time !== null ? formatTime(target.end_time) : "—"}
          <br />有效时长 {formatDuration(target.duration_seconds)}</p>
        <p className="record-remark">{target.remark || "未填写备注"}</p>
      </div>}
      {history.deleteError && <p className="error-banner" role="alert">{history.deleteError}</p>}
      <div className="settings-actions">
        <button ref={cancelDelete} type="button" className="secondary" disabled={history.deleting} onClick={history.cancelDelete}>取消</button>
        <button type="button" className="danger-button" disabled={history.deleting} onClick={() => { void history.remove(); }}>
          {history.deleting ? "正在删除…" : "确认删除"}</button>
      </div>
    </dialog>
  </dialog>;
}
