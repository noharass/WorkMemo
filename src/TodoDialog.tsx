import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { UiDialog } from "./UiDialog";

export interface Todo {
  id: string;
  title: string;
  completed_at: number | null;
  open_record_id: number | null;
}

function TodoTitleForm({ initial = "", disabled, inputRef, onSave, onCancel }: {
  initial?: string;
  disabled: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSave: (title: string) => Promise<boolean>;
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
    if (!title || Array.from(title).length > 80 || /\p{Cc}/u.test(title)) {
      setError("请输入 1 到 80 个字符的单行标题。");
      field.current?.focus();
      return;
    }
    if (await onSave(title) && !onCancel) {
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

export function TodoDialog({ open, startHint, workFormOpen, activeRecordId, onClose, onStart, onShowWork }: {
  open: boolean;
  startHint: string;
  workFormOpen: boolean;
  activeRecordId: number | null;
  onClose: () => void;
  onStart: (todo: Todo) => void;
  onShowWork: (recordId: number) => void;
}) {
  const [items, setItems] = useState<Todo[] | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Todo | null>(null);
  const [busy, setBusy] = useState(false);
  const [readError, setReadError] = useState("");
  const [writeError, setWriteError] = useState("");
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
    const subscription = listen("workmemo:data-changed", () => { void refresh(); });
    void subscription.catch(() => {});
    return () => {
      request.current++;
      void subscription.then(stop => stop(), () => {});
    };
  }, [open, refresh]);

  useEffect(() => {
    if (deleting) cancelDelete.current?.focus();
  }, [deleting]);

  async function mutate(command: string, args: Record<string, unknown>, onSaved?: () => void) {
    if (saving.current) return false;
    saving.current = true;
    setBusy(true);
    setWriteError("");
    try {
      await invoke(command, args);
      await refresh();
      onSaved?.();
      return true;
    } catch (error) {
      setWriteError(String(error));
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
  const completed = items?.filter(todo => todo.completed_at !== null) ?? [];

  function row(todo: Todo) {
    const done = todo.completed_at !== null;
    const checkbox = `todo-check-${todo.id}`;
    const openRecordId = todo.open_record_id;
    return <div key={todo.id} className="todo-row" data-todo-id={todo.id}>
      {editing === todo.id ? <TodoTitleForm initial={todo.title} disabled={busy}
        onSave={title => mutate("rename_todo", { id: todo.id, title }, () => { setEditing(null); focusAction(todo.id, "rename"); })}
        onCancel={() => { setEditing(null); setWriteError(""); focusAction(todo.id, "rename"); }} /> : <>
        <label htmlFor={checkbox} className="todo-check">
          <input id={checkbox} type="checkbox" checked={done} disabled={busy} data-todo-action="check"
            onChange={event => { void mutate("set_todo_completed", { id: todo.id, completed: event.target.checked }, () => focusAction(todo.id, "check")); }} />
          <span>{todo.title}</span>
        </label>
        <div className="todo-row-actions">
          {openRecordId !== null ? <button type="button" className="text-button" disabled={busy || workFormOpen}
            aria-label={`查看未结束工作：${todo.title}`} onClick={() => onShowWork(openRecordId)}>查看未结束工作</button> :
            !done && <button type="button" className="text-button" disabled={busy || !!startHint}
              aria-label={`开始计时：${todo.title}`} onClick={() => onStart(todo)}>开始计时</button>}
          <button type="button" className="text-button" disabled={busy} data-todo-action="rename" aria-label={`改名：${todo.title}`}
            onClick={() => { setWriteError(""); setEditing(todo.id); }}>改名</button>
          <button type="button" className="text-button" disabled={busy} aria-label={`删除：${todo.title}`}
            onClick={() => { setWriteError(""); setDeleting(todo); }}>删除</button>
        </div>
      </>}
    </div>;
  }

  return <>
    <UiDialog open={open} onClose={onClose} title="待办清单" id="todo-title" className="todo-dialog" closeDisabled={busy}>
      <div ref={content} aria-busy={busy}>
        <TodoTitleForm disabled={busy} inputRef={newTitle} onSave={title => mutate("create_todo", { title })} />
        {readError && <p className="inline-error" role="alert">无法读取待办：{readError} <button type="button" className="text-button" onClick={() => { void refresh(); }}>重试</button></p>}
        {writeError && !deleting && <p className="inline-error" role="alert">{writeError}</p>}
        {startHint && (workFormOpen || pending.some(todo => todo.open_record_id === null)) && <p className="hint">{startHint}</p>}
        {items === null && !readError && <p className="hint">正在读取待办…</p>}
        {items && pending.length === 0 && <p className="hint">暂无未完成待办。</p>}
        {pending.map(row)}
        <details className="todo-completed" hidden={!completed.length}>
          <summary ref={completedHeading}>已完成 {completed.length}</summary>
          {completed.map(row)}
        </details>
      </div>
    </UiDialog>
    <UiDialog open={open && !!deleting} onClose={closeDelete} title="删除待办" id="todo-delete-title" closeDisabled={busy}>
      {deleting && <>
        <p>删除「{deleting.title}」？已记录的工时会保留。</p>
        {writeError && <p className="inline-error" role="alert">{writeError}</p>}
        <div className="settings-actions">
          <button type="button" className="secondary" ref={cancelDelete} disabled={busy} onClick={closeDelete}>取消</button>
          <button type="button" disabled={busy} onClick={() => {
            void mutate("delete_todo", { id: deleting.id }, () => {
              closeDelete();
              requestAnimationFrame(() => newTitle.current?.focus());
            });
          }}>删除</button>
        </div>
      </>}
    </UiDialog>
  </>;
}
