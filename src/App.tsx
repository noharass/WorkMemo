import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm, emptyWorkDraft } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatTime, type StartInput } from "./types";
import { workView } from "./workView";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  useDashboard,
  layoutStyle,
  WorkBadge,
} from "./desktopPreferences";
import "./App.css";
import { type TodayWorkload as Today } from "./workload";
import { TodayWorkloadStrip } from "./TodayWorkloadStrip";
import { useMainContentHeight } from "./useMainContentHeight";
import { PageBindingPrompt } from "./PageBindingPrompt";
import { FinishedPagePrompt } from "./FinishedPagePrompt";
import { TaskList, useOpenTasks } from "./TaskList";
import { TodoDialog, type Todo } from "./TodoDialog";
export default function App() {
  const session = useWorkSession();
  const openTasks = useOpenTasks(session.snapshot, session.native);
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const layout = useLayout();
  const dashboard = useDashboard();
  const [noteOpen, setNoteOpen] = useState(false);
  const [switchRequest, setSwitchRequest] = useState<{
    input: StartInput;
    id: number;
    category: string;
    todoId?: string;
  } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [migrationFound, setMigrationFound] = useState(false);
  const [today, setToday] = useState<Today[] | null>(null);
  const [todayError, setTodayError] = useState("");
  const [startupError, setStartupError] = useState("");
  const [switchingFrom, setSwitchingFrom] = useState<number | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [workDraft, setWorkDraft] = useState(emptyWorkDraft);
  const [todoOpen, setTodoOpen] = useState(false);
  const [todoWork, setTodoWork] = useState<{ todo: Todo; draft: ReturnType<typeof emptyWorkDraft> } | null>(null);
  const workspace = useRef<HTMLElement>(null);
  const currentWork = useRef<HTMLElement>(null);
  const heightError = useMainContentHeight(workspace, !!session.snapshot);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const monitor = session.snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const unavailable = !view.canOperate || session.busy;
  const compact = layout.current.density === "compact";
  useEffect(() => {
    if (!session.native) return;
    let stopped = false;
    const reload = () => { void invoke<{ error: string | null }>("get_startup_status")
      .then(value => { if (!stopped) setStartupError(value.error ? `开机启动：${value.error}` : ""); })
      .catch(e => { if (!stopped) setStartupError(`无法读取开机启动状态：${String(e)}`); }); };
    reload();
    const listener = listen("workmemo:startup-changed", reload);
    return () => { stopped = true; void listener.then(fn => fn()); };
  }, [session.native]);
  function panel(section: string) {
    void invoke("open_panel", { panel: "settings", section }).catch((e) =>
      setNavigationError(String(e)),
    );
  }
  useEffect(() => {
    if (!session.native) return;
    let reading = false;
    let stopped = false;
    const load = async () => {
      if (reading) return;
      reading = true;
      try {
        const items = await invoke<Today[]>("get_today_workload");
        if (!stopped) {
          setToday(items);
          setTodayError("");
        }
      } catch (e) {
        if (!stopped) setTodayError(String(e));
      } finally {
        reading = false;
      }
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 5000);
    const p = listen("workmemo:data-changed", () => {
      void load();
      void session.refresh();
    });
    return () => {
      stopped = true;
      clearInterval(timer);
      void p.then((f) => f());
    };
  }, [session.native]);
  useEffect(() => {
    if (!session.native) return;
    void invoke<boolean>("detect_preview_data")
      .then(setMigrationFound)
      .catch(() => {});
    const p = listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    });
    return () => {
      void p.then((f) => f());
    };
  }, [session.native]);
  useEffect(() => {
    if (!session.native) return;
    let stopped = false;
    const reportError = (error: unknown) => { if (!stopped) setNavigationError(`无法打开待办：${String(error)}`); };
    const openRequested = async () => {
      if (stopped) return;
      try {
        if (await invoke<boolean>("take_todo_open_request") && !stopped) setTodoOpen(true);
      } catch (error) {
        reportError(error);
      }
    };
    const subscription = listen("workmemo:open-todos", () => { void openRequested(); });
    void subscription.then(openRequested, reportError);
    return () => {
      stopped = true;
      void subscription.then(stop => stop(), () => {});
    };
  }, [session.native]);
  const switching = switchingFrom !== null;
  const formOpen = switching || newTaskOpen;
  const switchValid = !!active?.is_paused && !active.recovery_pending && active.id === switchingFrom;
  const todoStartHint = formOpen ? "请先返回当前任务表单。"
    : active?.recovery_pending ? "请先处理上次待恢复的任务。"
    : active && !active.is_paused ? "请先暂停或结束当前计时。"
    : unavailable ? "计时暂不可用。" : "";

  function startTodo(todo: Todo) {
    if (todoStartHint) return;
    setTodoWork({ todo, draft: emptyWorkDraft() });
    setTodoOpen(false);
    if (active) setSwitchingFrom(active.id);
    else setNewTaskOpen(true);
  }

  function showTodoWork(recordId: number) {
    if (formOpen) return;
    setTodoOpen(false);
    requestAnimationFrame(() => {
      if (active?.id === recordId) currentWork.current?.focus();
      else workspace.current?.querySelector<HTMLButtonElement>(`[data-record-id="${recordId}"]`)?.focus();
    });
  }

  function closeWorkForm(saved: boolean) {
    setNewTaskOpen(false);
    setSwitchingFrom(null);
    setSwitchRequest(null);
    if (todoWork) {
      setTodoWork(null);
      if (!saved) setTodoOpen(true);
    } else if (saved) {
      setWorkDraft(emptyWorkDraft());
    }
  }
  return (
    <DesktopWindow
      density={layout.current.density}
      background={presentation.current.background}
      appearanceStyle={{
        ...themeStyle(appearance.current),
        ...layoutStyle(layout.current),
      }}
      navigation={
        <nav className="main-nav" aria-label="主导航">
          <button
            className="nav-button"
            title="设置"
            aria-label="设置"
            onClick={() => panel("monitor")}
          >
            <Icon name="settings" />
          </button>
        </nav>
      }
      categories={
        <button type="button" className="browse-toolbar" aria-label="仅浏览" aria-pressed={!!monitor?.browsing_only}
          title={monitor?.browsing_only ? monitor.browse_ready ? "退出仅浏览，开始或继续记录" : "请先返回已匹配的工作页面操作" : "仅浏览，暂停计时"}
          disabled={unavailable || (!!monitor?.browsing_only && (!monitor.browse_ready || !!active?.recovery_pending))}
          onClick={() => { void (monitor?.browsing_only ? session.confirmWork(null) : session.browse()); }}>
          <Icon name="eye" /><span>仅浏览</span><span className="browse-switch" aria-hidden="true" />
        </button>
      }
    >
      <main
        ref={workspace}
        className={`workspace ${active ? "is-active" : ""}`}
      >
        {dashboard.fallback}
        {(session.connectionError ||
          session.commandError ||
          navigationError ||
          startupError ||
          heightError ||
          appearance.loadError ||
          presentation.error ||
          layout.error) && (
          <p className="error-banner" role="alert">
            {session.connectionError ||
              session.commandError ||
              navigationError ||
              startupError ||
              heightError ||
              appearance.loadError ||
              presentation.error ||
              layout.error}
          </p>
        )}
        {session.snapshot?.warning && (
          <p className="notice" role="alert">
            {session.snapshot.warning}
          </p>
        )}
        {!session.native && (
          <p className="notice">浏览器预览 · 计时和保存请使用桌面应用</p>
        )}
        {active?.recovery_pending && (
          <p className="notice" role="status">
            上次未结束的任务保持暂停。请确认后继续，软件关闭期间不计时。
          </p>
        )}
        {monitor?.unknown_page_url && <PageBindingPrompt monitor={monitor} refresh={session.refresh}/>}
        {monitor?.finished_page_rule != null && <FinishedPagePrompt monitor={monitor} refresh={session.refresh}/>}
        {session.native && <TaskList {...openTasks} active={active ?? null} disabled={unavailable} onSwitch={session.switchTask}/>}
        {candidate && !active && !formOpen && (
          <section className="start-prompt" aria-label="开工确认">
            <WorkBadge
              category={candidate.category}
              presentation={presentation.current}
            />
            <strong>已识别工作页面</strong>
            <p>确认前不计时，工作量稍后填写。</p>
            <div>
              <button
                disabled={unavailable}
                onClick={() => {
                  void session.confirmWork(candidate.id);
                }}
              >
                开始记录
              </button>
              <button className="secondary" disabled={unavailable} onClick={() => setNewTaskOpen(true)}>新建任务</button>
            </div>
          </section>
        )}
        {!formOpen && !active && !candidate && !monitor?.unknown_page_url && monitor?.finished_page_rule == null && (session.snapshot || !session.native) && (
          <section className="form-card monitor-status-card" aria-label="监测状态">
            <h1>{monitor?.browsing_only ? "仅浏览 · 当前不计时" : monitor?.enabled ? "等待识别工作页面" : "自动监测未启用"}</h1>
            {monitor?.enabled && (!monitor.browser_connected || !monitor.native_available)
              ? <p className="notice" role="status">{monitor.message}</p>
              : <details className="help-disclosure"><summary>监测详情</summary><p>{monitor?.message || "请在桌面应用中查看监测状态。"}</p></details>}
            <button type="button" disabled={unavailable} onClick={() => setNewTaskOpen(true)}><Icon name="play" />新建任务</button>
          </section>
        )}
        {!formOpen && active && (
          <section
            className="timer-card"
            aria-label="当前工作"
            aria-busy={session.loading || session.busy}
            ref={currentWork}
            tabIndex={-1}
          >
            <div className="task-row flex items-center justify-between gap-4">
              <div className="task-copy">
                <div className="task-eyebrow auxiliary">当前工作</div>
                <h1>
                  {record ? (
                    <WorkBadge
                      category={record.category}
                      presentation={presentation.current}
                    />
                  ) : (
                    view.label
                  )}
                </h1>
                {record?.task_name && record.task_name !== record.category && record.task_name !== name(record.category) && <div className="task-name">{record.task_name}</div>}
                <p className="task-summary">
                  <span className="state-label" role="status">
                    {monitor?.browsing_only ? "仅浏览 · 已停表" : view.label}
                  </span>
                  {record && (
                    <span className="task-control-mode">
                      {record.control_mode === "AUTO" ? "自动记录" : "手动计时"}
                    </span>
                  )}
                </p>
              </div>
              <output className="timer" aria-label="有效工作时长">
                {view.timer}
              </output>
            </div>
            {record && (
              <div className="actions flex items-center gap-3">
                {active && (
                  <button
                    className="round-action"
                    disabled={unavailable}
                    title={active.is_paused ? "继续工作" : "暂停"}
                    aria-label={active.is_paused ? "继续工作" : "暂停"}
                    onClick={() => {
                      void (active.is_paused
                        ? session.resume(active.id)
                        : session.pause(active.id));
                    }}
                  >
                    <Icon name={active.is_paused ? "play" : "pause"} />
                  </button>
                )}
                <button
                  className="quiet-action"
                  onClick={() => setNoteOpen(true)}
                  title="任务备注"
                >
                  <Icon name="note" />
                  <span>备注</span>
                </button>
                {active && <button className="quiet-action switch-action" disabled={unavailable || !active.is_paused || !!active.recovery_pending}
                  title={active.is_paused ? "切换任务" : "请先暂停再切换任务"} onClick={() => setSwitchingFrom(active.id)}>
                  <Icon name="swap" /><span>切换任务</span>
                </button>}
                {active && (
                  <button
                    className="quiet-action finish-action"
                    disabled={unavailable}
                    onClick={() => {
                      void session.finish(active.id);
                    }}
                    title="结束计时"
                  >
                    <Icon name="check" />
                    <span>结束</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        {formOpen && (
          <section className="form-card new-task-page" aria-label={switching ? "切换任务" : "新建任务"}>
            {todoWork && <h2 className="todo-work-title">{todoWork.todo.title}</h2>}
            {switching && !switchValid && <p className="notice" role="status">原任务状态已变化，请返回当前任务确认。填写内容仍保留。</p>}
            {!switching && active && <p className="notice" role="status">已有任务从其他入口开始，请返回当前任务。填写内容仍保留。</p>}
            {candidate && !active && <p className="hint">已识别{name(candidate.category)}工作页面；也可在灵动岛确认开始。手动填写内容仍保留。</p>}
            <WorkForm draft={todoWork?.draft ?? workDraft} onDraftChange={draft => {
              if (todoWork) setTodoWork({ ...todoWork, draft });
              else setWorkDraft(draft);
            }} minimal={compact} switching={switching} disabled={unavailable || (switching ? !switchValid : !!active)}
              starting={session.pending === "start_task"} cancelLabel={todoWork ? "返回待办" : undefined} onCancel={() => closeWorkForm(false)}
              onStart={async input => {
                if (switching) {
                  if (!switchValid || !active) return false;
                  setSwitchRequest({input, id: switchingFrom, category: active.category, todoId: todoWork?.todo.id});
                  return false;
                }
                if (active) return false;
                const saved = await session.start(input, null, todoWork?.todo.id);
                if (saved) closeWorkForm(true);
                return saved;
              }} />
          </section>
        )}
        <div className="home-footer">
          <button
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            待补全 {session.snapshot?.pending_count ?? "—"}
          </button>
          {session.native && <button type="button" className="text-button" onClick={() => setTodoOpen(true)}>待办</button>}
        </div>
        <TodayWorkloadStrip items={today} error={todayError} onOpen={() => { void dashboard.open("today"); }} />
        {monitor?.idle_warning && (
          <p className="notice" role="status">
            已连续 {monitor.idle_warning_seconds} 秒没有输入，
            {monitor.idle_end_seconds} 秒时将自动结束。恢复操作后取消提醒。
          </p>
        )}
        {migrationFound && (
          <details className="auxiliary">
            <summary>发现预览版数据</summary>
            <button className="text-button" onClick={() => panel("data")}>
              查看并迁移
            </button>
          </details>
        )}
        <UiDialog
          open={!!switchRequest}
          onClose={() => {
            if (!session.busy) setSwitchRequest(null);
          }}
          id="switch-title"
          title="确认切换工作"
        >
          {switchRequest && (
            <>
              <p>
                结束并保存当前暂停的“{name(switchRequest.category)}”，再开始“
                {todoWork?.todo.title ?? name(switchRequest.input.category)}”。原记录保留在待补全列表。
              </p>
              {todoWork && session.commandError && <p className="inline-error" role="alert">{session.commandError}</p>}
              <div className="settings-actions">
                <button
                  className="secondary"
                  disabled={session.busy}
                  onClick={() => setSwitchRequest(null)}
                >
                  取消
                </button>
                <button
                  disabled={session.busy}
                  onClick={() => {
                    void session
                      .start(switchRequest.input, switchRequest.id, switchRequest.todoId)
                      .then((ok) => {
                        if (ok) closeWorkForm(true);
                      });
                  }}
                >
                  保存并开始
                </button>
              </div>
            </>
          )}
        </UiDialog>
        {session.native && <TodoDialog open={todoOpen && !switchRequest && !(noteOpen && record)}
          startHint={todoStartHint} workFormOpen={formOpen} activeRecordId={active?.id ?? null}
          onClose={() => setTodoOpen(false)} onStart={startTodo} onShowWork={showTodoWork} />}
        <UiDialog
          open={noteOpen && !!record}
          onClose={() => setNoteOpen(false)}
          id="note-title"
          title="任务详情与备注"
        >
          {record && (
            <>
              <p>
                {name(record.category)} · 数量 {formatQuantity(record.quantity)}
              </p>
              <p className="hint">开始 {formatTime(record.start_time)}</p>
              <p className="task-remark">
                {record.remark || "这项工作未填写备注。"}
              </p>
            </>
          )}
        </UiDialog>
      </main>
    </DesktopWindow>
  );
}
