import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { UiDialog } from "./UiDialog";
import { useCategoryNames } from "./categoryNames";
import { formatDuration, formatTime } from "./types";

export interface Todo {
  id: string;
  title: string;
  completed_at: number | null;
  open_record_id: number | null;
  duplicate_number: number | null;
  planned_today: boolean;
  finished_count: number;
  finished_duration_ms: number;
  last_category: string | null;
}

interface TodoWorkEntry {
  id: number;
  start_time: number;
  duration_ms: number;
  category: string;
}

export function todoDisplayTitle(todo: Todo) {
  return todo.duplicate_number == null ? todo.title : `${todo.title}（编号 ${todo.duplicate_number}）`;
}

function durationSummary(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60_000);
  if (minutes >= 60) return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
  if (minutes > 0) return `${minutes} 分钟`;
  if (milliseconds > 0 && milliseconds < 1000) return "不足 1 秒";
  return `${Math.floor(milliseconds / 1000)} 秒`;
}

function TodoWorkHistory({ todo, visible }: { todo: Todo; visible: boolean }) {
  const { name } = useCategoryNames();
  const [expanded, setExpanded] = useState(false);
  const [entries, setEntries] = useState<TodoWorkEntry[] | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!expanded || !visible) return;
    let current = true;
    void invoke<TodoWorkEntry[]>("todo_work_history", { id: todo.id }).then(next => {
      if (current) { setEntries(next); setError(""); }
    }).catch(reason => {
      if (current) setError(String(reason));
    });
    return () => { current = false; };
  }, [expanded, visible, todo, retry]);

  const summary = `已计时 ${todo.finished_count} 次 · 共 ${durationSummary(todo.finished_duration_ms)}`;
  return <details className="todo-history" onToggle={event => setExpanded(event.currentTarget.open)}>
    <summary aria-label={`${summary}，${todoDisplayTitle(todo)}的计时明细`}>{summary}</summary>
    {error && <p className="inline-error" role="alert">无法读取计时明细：{error} <button type="button" className="text-button"
      onClick={() => { setError(""); setRetry(value => value + 1); }}>重试</button></p>}
    {!entries && !error && <p className="hint">正在读取计时明细…</p>}
    {entries?.length === 0 && !error && <p className="hint">暂无已结束的计时。</p>}
    {!!entries?.length && <ul className="todo-history-entries">
      {entries.map(entry => <li key={entry.id}>
        <span>{formatTime(entry.start_time)} · {name(entry.category)}</span>
        <span aria-label={`有效工时 ${formatDuration(entry.duration_ms / 1000)}`}>{formatDuration(entry.duration_ms / 1000)}</span>
      </li>)}
    </ul>}
  </details>;
}

function TodoTitleForm({ initial = "", disabled, inputRef, onSave, onCancel }: {
  initial?: string;
  disabled: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSave: (title: string, reportError: (message: string) => void) => Promise<boolean>;
  onCancel?: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const fieldId = useId();
  const ownInput = useRef<HTMLInputElement>(null);
  const field = inputRef ?? ownInput;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const title = value.trim();
    function reportError(message: string) {
      setError(message);
      field.current?.focus();
    }
    if (!title || Array.from(title).length > 80 || /\p{Cc}/u.test(title)) {
      reportError("请输入 1 到 80 个字符的单行标题。");
      return;
    }
    setError("");
    if (await onSave(title, reportError) && !onCancel) {
      setValue("");
      field.current?.focus();
    }
  }

  return <form className="todo-title-form" onSubmit={event => { void submit(event); }} noValidate>
    <label htmlFor={fieldId}>{onCancel ? "修改标题" : "待办标题"}</label>
    <div className="todo-title-controls">
      <input id={fieldId} ref={field} name="title" value={value} required autoFocus={!!onCancel} readOnly={disabled}
        aria-invalid={!!error} aria-describedby={error ? `${fieldId}-error` : undefined}
        onChange={event => { setValue(event.target.value); setError(""); }} />
      <button type="submit" disabled={disabled}>{onCancel ? "保存" : "添加"}</button>
      {onCancel && <button type="button" className="secondary" disabled={disabled} onClick={onCancel}>取消</button>}
    </div>
    {error && <p id={`${fieldId}-error`} className="field-error" role="alert">{error}</p>}
  </form>;
}

export function TodoDialog({ open, startHint, workFormOpen, activeRecordId, activeRunning, onClose, onStart, onShowWork }: {
  open: boolean;
  startHint: string;
  workFormOpen: boolean;
  activeRecordId: number | null;
  activeRunning: boolean;
  onClose: () => void;
  onStart: (todo: Todo) => void;
  onShowWork: (recordId: number) => void;
}) {
  const [items, setItems] = useState<Todo[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [actionsId, setActionsId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Todo | null>(null);
  const [busy, setBusy] = useState(false);
  const [readError, setReadError] = useState("");
  const [writeError, setWriteError] = useState("");
  const [toggleError, setToggleError] = useState<{ id: string; message: string } | null>(null);
  const saving = useRef(false);
  const request = useRef(0);
  const newTitle = useRef<HTMLInputElement>(null);
  const completedHeading = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    const version = ++request.current;
    try {
      const next = await invoke<Todo[]>("list_todos");
      if (version !== request.current) return;
      setItems(next);
      setReadError("");
    } catch (error) {
      if (version === request.current) setReadError(String(error));
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void refresh();
  }, [open, activeRecordId, refresh]);

  useEffect(() => {
    if (!open) return;
    newTitle.current?.focus();
    const update = () => { void refresh(); };
    const subscription = listen("workmemo:data-changed", update);
    const timer = window.setInterval(update, 60_000);
    window.addEventListener("focus", update);
    void subscription.catch(() => {});
    return () => {
      request.current++;
      window.clearInterval(timer);
      window.removeEventListener("focus", update);
      void subscription.then(stop => stop(), () => {});
    };
  }, [open, refresh]);

  useEffect(() => {
    if (deleting) cancelDelete.current?.focus();
  }, [deleting]);

  async function mutate(command: string, args: Record<string, unknown>, {
    onSaved, onError = setWriteError,
  }: { onSaved?: () => void; onError?: (message: string) => void } = {}) {
    if (saving.current) return false;
    saving.current = true;
    setBusy(true);
    setWriteError("");
    setToggleError(null);
    try {
      await invoke(command, args);
      await refresh();
      onSaved?.();
      return true;
    } catch (error) {
      onError(String(error));
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  function focusAction(id: string, action: string) {
    requestAnimationFrame(() => {
      const target = content.current?.querySelector<HTMLElement>(`[data-todo-id="${CSS.escape(id)}"] [data-todo-action="${action}"]`);
      if (target?.getClientRects().length) target.focus();
      else (completedHeading.current ?? newTitle.current)?.focus();
    });
  }

  function closeDelete() {
    setDeleting(null);
    setWriteError("");
  }

  const pending = items?.filter(todo => todo.completed_at === null) ?? [];
  const today = pending.filter(todo => todo.planned_today);
  const later = pending.filter(todo => !todo.planned_today);
  const completed = items?.filter(todo => todo.completed_at !== null) ?? [];

  function row(todo: Todo) {
    const done = todo.completed_at !== null;
    const checkbox = `todo-check-${todo.id}`;
    const openRecordId = todo.open_record_id;
    const linkedWorkAction = activeRunning && openRecordId === activeRecordId ? "查看工作" : "去继续";
    const label = todoDisplayTitle(todo);
    const error = toggleError?.id === todo.id ? toggleError.message : null;
    const more = actionsId === todo.id;
    const morePanel = `todo-actions-${todo.id}`;
    return <div key={todo.id} className="todo-row" data-todo-id={todo.id}>
      {editing === todo.id ? <TodoTitleForm initial={todo.title} disabled={busy}
        onSave={(title, onError) => mutate("rename_todo", { id: todo.id, title }, {
          onSaved: () => { setEditing(null); focusAction(todo.id, "more"); },
          onError,
        })}
        onCancel={() => { setEditing(null); setWriteError(""); focusAction(todo.id, "more"); }} /> : <>
        <div className="todo-row-main">
          <label htmlFor={checkbox} className="todo-check">
            <input id={checkbox} type="checkbox" checked={done} disabled={busy} data-todo-action="check"
              aria-describedby={error ? `${checkbox}-error` : undefined}
              onChange={event => {
                void mutate("set_todo_completed", { id: todo.id, completed: event.target.checked }, {
                  onSaved: () => focusAction(todo.id, "check"),
                  onError: message => { setToggleError({ id: todo.id, message }); focusAction(todo.id, "check"); },
                });
              }} />
            <span>{label}</span>
          </label>
          <div className="todo-row-actions">
            {openRecordId !== null ? <button type="button" className="text-button" disabled={busy || workFormOpen}
              aria-label={`${linkedWorkAction}：${label}`} onClick={() => {
                setActionsId(null);
                onShowWork(openRecordId);
              }}>{linkedWorkAction}</button> :
              !done && <button type="button" className="text-button" disabled={busy || !!startHint}
                aria-label={`开始计时：${label}`} onClick={() => {
                  setActionsId(null);
                  onStart(todo);
                }}>开始计时</button>}
            <button type="button" className="text-button" disabled={busy} data-todo-action="more" aria-label={`更多：${label}`}
              aria-expanded={more} aria-controls={more ? morePanel : undefined}
              onClick={() => setActionsId(more ? null : todo.id)}>更多</button>
          </div>
        </div>
        {todo.finished_count > 0 && <TodoWorkHistory todo={todo} visible={open} />}
        {error && <p id={`${checkbox}-error`} className="inline-error" role="alert">{error}</p>}
        {more && <div className="todo-overflow" id={morePanel}>
          {!done && <button type="button" className="text-button" disabled={busy} onClick={() => {
            void mutate("set_todo_today", { id: todo.id, today: !todo.planned_today }, {
              onSaved: () => { setActionsId(null); focusAction(todo.id, "more"); },
              onError: message => setToggleError({ id: todo.id, message }),
            });
          }}>{todo.planned_today ? "移出今天" : "加入今天"}</button>}
          <button type="button" className="text-button" disabled={busy} aria-label={`改名：${label}`}
            onClick={() => { setWriteError(""); setActionsId(null); setEditing(todo.id); }}>改名</button>
          <button type="button" className="text-button" disabled={busy} aria-label={`删除：${label}`}
            onClick={() => { setWriteError(""); setDeleting(todo); }}>删除</button>
        </div>}
      </>}
    </div>;
  }

  const pendingRows = [
    ...(today.length ? [<h3 key="today" className="todo-group-heading">今天要做</h3>, ...today.map(row)] : []),
    ...(today.length && later.length ? [<h3 key="later" className="todo-group-heading">其他待办</h3>] : []),
    ...later.map(row),
  ];

  return <>
    <UiDialog open={open} onClose={() => { setActionsId(null); onClose(); }} title="待办清单" id="todo-title" className="todo-dialog" closeDisabled={busy}>
      <div ref={content} aria-busy={busy}>
        <TodoTitleForm disabled={busy} inputRef={newTitle} onSave={(title, onError) => mutate("create_todo", { title }, { onError })} />
        {readError && <p className="inline-error" role="alert">无法读取待办：{readError} <button type="button" className="text-button" onClick={() => { void refresh(); }}>重试</button></p>}
        {writeError && !deleting && <p className="inline-error" role="alert">{writeError}</p>}
        {startHint && (workFormOpen || pending.some(todo => todo.open_record_id === null)) && <p className="hint">{startHint}</p>}
        {items === null && !readError && <p className="hint">正在读取待办…</p>}
        {items && pending.length === 0 && <p className="hint">暂无未完成待办。</p>}
        {!!pendingRows.length && <div className="todo-groups">{pendingRows}</div>}
        <details className="todo-completed" hidden={!completed.length}>
          <summary ref={completedHeading}>已完成 {completed.length}</summary>
          {completed.map(row)}
        </details>
      </div>
    </UiDialog>
    <UiDialog open={open && !!deleting} onClose={closeDelete} title="删除待办" id="todo-delete-title" closeDisabled={busy}>
      {deleting && <>
        <p>删除「{todoDisplayTitle(deleting)}」？已记录的工时会保留。</p>
        {writeError && <p className="inline-error" role="alert">{writeError}</p>}
        <div className="settings-actions">
          <button type="button" className="secondary" ref={cancelDelete} disabled={busy} onClick={closeDelete}>取消</button>
          <button type="button" disabled={busy} onClick={() => {
            void mutate("delete_todo", { id: deleting.id }, {
              onSaved: () => {
                setActionsId(null);
                closeDelete();
                requestAnimationFrame(() => newTitle.current?.focus());
              },
            });
          }}>删除</button>
        </div>
      </>}
    </UiDialog>
  </>;
}
