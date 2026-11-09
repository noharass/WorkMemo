# 主窗口绑定入口修正：完整源码

2026-11-09。以下为本次七个程序与脚本文件的完整内容。交付范围、文档路径、PowerShell 命令、测试和兼容性见 E:\WorkMemo\docs\FIX-PAGE-BINDING-ENTRY.md。

## UPDATE — E:\WorkMemo\src\App.tsx

SHA256: 3F5E93555456D4A2E2A22489E0608B82F42868C280EEDEB8AA753963D13A6131

```tsx

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
  } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [migrationFound, setMigrationFound] = useState(false);
  const [today, setToday] = useState<Today[] | null>(null);
  const [todayError, setTodayError] = useState("");
  const [startupError, setStartupError] = useState("");
  const [switchingFrom, setSwitchingFrom] = useState<number | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [workDraft, setWorkDraft] = useState(emptyWorkDraft);
  const workspace = useRef<HTMLElement>(null);
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
  const switching = switchingFrom !== null;
  const formOpen = switching || newTaskOpen;
  const switchValid = !!active?.is_paused && !active.recovery_pending && active.id === switchingFrom;
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
            {switching && !switchValid && <p className="notice" role="status">原任务状态已变化，请返回当前任务确认。填写内容仍保留。</p>}
            {!switching && active && <p className="notice" role="status">已有任务从其他入口开始，请返回当前任务。填写内容仍保留。</p>}
            {candidate && !active && <p className="hint">已识别{name(candidate.category)}工作页面；也可在灵动岛确认开始。手动填写内容仍保留。</p>}
            <WorkForm draft={workDraft} onDraftChange={setWorkDraft} minimal={compact} switching={switching} disabled={unavailable || (switching ? !switchValid : !!active)}
              starting={session.pending === "start_task"} onCancel={() => { setNewTaskOpen(false); setSwitchingFrom(null); setSwitchRequest(null); }}
              onStart={async input => {
                if (switching) {
                  if (!switchValid || !active) return false;
                  setSwitchRequest({input, id: switchingFrom, category: active.category});
                  return false;
                }
                if (active) return false;
                const saved = await session.start(input);
                if (saved) { setNewTaskOpen(false); setWorkDraft(emptyWorkDraft()); }
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
                {name(switchRequest.input.category)}”。原记录保留在待补全列表。
              </p>
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
                      .start(switchRequest.input, switchRequest.id)
                      .then((ok) => {
                        if (ok) { setSwitchRequest(null); setSwitchingFrom(null); setNewTaskOpen(false); setWorkDraft(emptyWorkDraft()); }
                      });
                  }}
                >
                  保存并开始
                </button>
              </div>
            </>
          )}
        </UiDialog>
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

```

## UPDATE — E:\WorkMemo\src\FinishedPagePrompt.tsx

SHA256: A1B9AB32ADD8725021F65BBB1D1D8C0D8721DA75072C86E6B3104934B74511E2

```tsx

import {useEffect,useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import type {MonitorStatus} from "./types";

type Task={id:number;name:string;category:string;finished:boolean};
export function FinishedPagePrompt({monitor,refresh}:{monitor:MonitorStatus;refresh:()=>Promise<unknown>}){
  const rule=monitor.finished_page_rule;
  const [tasks,setTasks]=useState<Task[]>([]);
  const [choice,setChoice]=useState("new");
  const [name,setName]=useState("");
  const [category,setCategory]=useState("开发");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if(rule===null)return;let live=true;void invoke<Task[]>("get_page_tasks").then(v=>{if(live)setTasks(v)}).catch(e=>{if(live)setError(String(e))});return()=>{live=false}},[rule]);
  if(rule===null)return null;
  const submit=async()=>{setBusy(true);setError("");try{await invoke("rebind_finished_page",{input:{expected_rule_id:rule,expected_revision:monitor.revision,task_id:choice==="new"?null:Number(choice),new_name:choice==="new"?name:null,category:choice==="new"?category:null}});await refresh()}catch(e){setError(String(e))}finally{setBusy(false)}};
  return <section className="start-prompt page-binding-prompt" aria-label="已结束任务处理"><strong>此网页绑定的任务已结束</strong><p>选择另一项未结束任务，或新建任务。确认绑定后，返回工作网页操作再继续计时。</p>
    {monitor.browsing_only&&<p>当前为仅浏览，保存绑定不会开始计时。</p>}
    <div className="page-binding-options" role="group" aria-label="已结束网页处理方式">
      <label><input type="radio" name="finished-page-action" checked={choice==="new"} disabled={busy} onChange={()=>setChoice("new")}/>新建任务</label>
      <label><input type="radio" name="finished-page-action" checked={choice!=="new"} disabled={busy} onChange={()=>setChoice("")}/>绑定已有任务</label>
    </div>
    {choice!=="new"&&<select aria-label="任务选择" value={choice} disabled={busy} onChange={e=>setChoice(e.target.value)}><option value="">请选择未结束任务</option>{tasks.filter(t=>!t.finished).map(t=><option key={t.id} value={t.id}>{t.name} · {t.category}</option>)}</select>}
    {choice==="new"&&<div><input aria-label="新任务名称" placeholder="新任务名称" maxLength={80} disabled={busy} value={name} onChange={e=>setName(e.target.value)}/><select aria-label="新任务类别" disabled={busy} value={category} onChange={e=>setCategory(e.target.value)}>{["评测","质检","开发","文档"].map(c=><option key={c}>{c}</option>)}</select></div>}
    <button type="button" disabled={busy||!choice||(choice==="new"&&!name.trim())} onClick={()=>void submit()}>确认绑定</button>{error&&<p role="alert" className="notice">{error}</p>}
  </section>
}

```

## UPDATE — E:\WorkMemo\src\PageBindingPrompt.tsx

SHA256: D24DE236936A3D56B691F54F13B20D2751B0C3839E504C3C2DE33F8AAF7FDE75

```tsx

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { MonitorStatus } from "./types";

type PageTask = { id:number; name:string; category:string; finished:boolean };
type MatchMode = "path_prefix" | "origin" | "domain_suffix";

export function PageBindingPrompt({monitor,refresh}:{monitor:MonitorStatus;refresh:()=>Promise<unknown>}) {
  const address=monitor.unknown_page_url;
  const [tasks,setTasks]=useState<PageTask[]>([]);
  const [action,setAction]=useState<"existing"|"new"|"ignore">("existing");
  const [taskId,setTaskId]=useState("");
  const [name,setName]=useState("");
  const [category,setCategory]=useState("开发");
  const [mode,setMode]=useState<MatchMode|null>(null);
  const [pattern,setPattern]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{if (!address)return; let alive=true; void invoke<PageTask[]>("get_page_tasks").then(v=>{if(alive)setTasks(v)}).catch(e=>{if(alive)setError(String(e))}); return()=>{alive=false}},[address]);
  useEffect(()=>{setMode(null);setPattern("");setError("")},[address]);
  const chooseMode=(next:MatchMode)=>{
    if (!address)return;
    const page=new URL(address);
    setMode(next);
    setPattern(next==="path_prefix"?`${page.origin}${page.pathname}`:next==="origin"?`${page.origin}/`:page.hostname);
  };
  const save=async()=>{
    if (!address||!mode)return;
    setBusy(true);setError("");
    try {
      await invoke("bind_page",{input:{expected_url:address,expected_revision:monitor.revision,match_mode:mode,pattern,
        task_id:action==="existing"?Number(taskId):null,new_name:action==="new"?name:null,category:action==="new"?category:null,ignore:action==="ignore"}});
      await refresh();
    } catch(e) {setError(String(e))} finally {setBusy(false)}
  };
  if (!address)return null;
  return <section className="start-prompt page-binding-prompt" aria-label="新网页处理">
    <strong>发现新网页，计时已暂停</strong>
    {monitor.browsing_only&&<p>当前为仅浏览，保存绑定不会开始计时。</p>}
    <p className="page-binding-address">{address}</p>
    <div className="page-binding-options" role="group" aria-label="处理方式">
      <label><input type="radio" checked={action==="existing"} onChange={()=>setAction("existing")}/>绑定已有任务</label>
      <label><input type="radio" checked={action==="new"} onChange={()=>setAction("new")}/>新建任务</label>
      <label><input type="radio" checked={action==="ignore"} onChange={()=>setAction("ignore")}/>记住忽略</label>
    </div>
    {action==="existing"&&<select aria-label="选择任务" value={taskId} onChange={e=>setTaskId(e.target.value)}><option value="">请选择任务</option>{tasks.filter(t=>!t.finished).map(t=><option key={t.id} value={t.id}>{t.name} · {t.category}</option>)}</select>}
    {action==="new"&&<div><input aria-label="任务名称" placeholder="任务名称" maxLength={80} value={name} onChange={e=>setName(e.target.value)}/><select aria-label="工作类别" value={category} onChange={e=>setCategory(e.target.value)}>{["评测","质检","开发","文档"].map(c=><option key={c}>{c}</option>)}</select></div>}
    <label className="page-binding-range">绑定范围<select aria-label="绑定范围" value={mode??""} onChange={e=>chooseMode(e.target.value as MatchMode)}><option value="">请选择范围</option><option value="path_prefix">当前路径及子路径</option><option value="origin">整个站点</option><option value="domain_suffix">域名及子域名</option></select></label>
    {mode&&<input aria-label="绑定地址" value={pattern} onChange={e=>setPattern(e.target.value)}/>}
    <button type="button" disabled={busy||!mode||(action==="existing"&&!taskId)||(action==="new"&&!name.trim())} onClick={()=>void save()}>{action==="ignore"?"记住忽略":"保存绑定"}</button>
    {error&&<p role="alert" className="notice">{error}</p>}
  </section>;
}

```

## UPDATE — E:\WorkMemo\src\NotificationApp.tsx

SHA256: 5FDE8100669DE7F11B058E51A10DE082EDAE00BA33CAE4C007F7C8A9CB259860

```tsx

import { useCategoryNames } from "./categoryNames";
import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { useWorkSession } from "./useWorkSession";
import { themeStyle } from "./themes";
import { formatDuration, type WorkNotice, type WorkRecord } from "./types";
import { DraftContext, type Draft } from "./Drafts";
import { SettlementForm } from "./SettlementPanel";
import { TaskList, useOpenTasks } from "./TaskList";
import { IslandExpansion } from "./IslandExpansion";
import { islandView } from "./islandView";
import "./App.css";

export function NotificationApp() {
  const session = useWorkSession();
  const snapshot = session.snapshot;
  const openTasks = useOpenTasks(snapshot, session.native);
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [editing, setEditing] = useState<WorkRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  const draft = useRef<Draft | null>(null);
  const editingRef = useRef(editing); editingRef.current = editing;
  const revision = useRef(0);
  const seen = useRef("");
  const busy = session.busy || deferring;
  const [dirty, setDirty] = useState(false);
  const registerDraft = useCallback((_id: string, value: Draft | null) => {
    draft.current = value; setDirty(!!value?.dirty);
  }, []);
  useEffect(() => {
    void invoke("set_window_dirty", { dirty: dirty || busy }).catch(e => setError(String(e)));
  }, [dirty, busy]);
  useEffect(() => () => { void invoke("set_window_dirty", { dirty: false }).catch(() => {}); }, []);
  useEffect(() => {
    let stopped = false, reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      const request = revision.current;
      try {
        const value = await invoke<WorkNotice | null>("get_notice");
        if (!stopped && request === revision.current) { setNotice(value); setReadError(""); }
      } catch (e) { if (!stopped) setReadError(String(e)); }
      finally { reading = false; }
    }
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    const unlisten = listen("workmemo:appearance-changed", () => { void appearance.reload(); });
    return () => { stopped = true; clearInterval(timer); void unlisten.then(fn => fn()); };
  }, [appearance.reload]);
  const { active, candidate, notice: visibleNotice, key } = islandView(snapshot, notice);
  const monitor = snapshot?.monitoring;
  const bindingKey = monitor?.unknown_page_url ? `new:${monitor.unknown_page_url}` : monitor?.finished_page_rule != null ? `finished:${monitor.finished_page_rule}` : null;
  const expansionKey = bindingKey ?? key;
  useEffect(() => {
    if (expansionKey === seen.current) return;
    seen.current = expansionKey;
    if (expansionKey && !editingRef.current) setExpanded(true);
    if (!expansionKey && !editingRef.current) setExpanded(false);
  }, [expansionKey]);
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲暂停" : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";

  async function later(force = false) {
    if (busy) return;
    if (draft.current?.dirty && !force) { setDiscard(true); return; }
    setDeferring(true); setError("");
    try {
      if (editing) await invoke("defer_notice", { id: editing.id, kind: "ended" });
      else if (visibleNotice) await invoke("defer_notice", { id: visibleNotice.record.id, kind: visibleNotice.kind });
      revision.current++;
      if (!editing || notice?.record.id === editing.id) setNotice(null);
      setDiscard(false); setExpanded(false);
      setDirty(false);
    } catch (e) { setError(String(e)); }
    finally { setDeferring(false); }
  }
  const latestLater = useRef(later); latestLater.current = later;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const unlisten = listen("workmemo:request-close", () => {
      if (busyRef.current) { setError("正在保存，请稍候。"); return; }
      void latestLater.current();
    });
    return () => { void unlisten.then(fn => fn()); };
  }, []);
  const combinedError = error || session.commandError || session.connectionError || readError || openTasks.error;
  return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}>
    <div className="app-shell island-shell">
      <div className="island-main-row">
        <div className="island-drag" role="group" aria-label="拖动状态岛" onMouseDown={event => {
          if (event.button === 0) void getCurrentWindow().startDragging().then(() => invoke("fit_island_position")).catch(e => setError(String(e)));
        }}>
          {active || candidate || monitor?.browse_category ? <WorkBadge category={active?.category ?? candidate?.category ?? monitor?.browse_category ?? "开发"} presentation={presentation.current} showName={false} /> : <span className="work-symbol"><Icon name="read" /></span>}
          <span className="island-info"><strong>{bindingKey ? monitor?.unknown_page_url ? "新网页待处理" : "网页任务待处理" : active ? active.task_name || name(active.category) : candidate ? name(candidate.category) : visibleNotice?.kind === "ended" ? "工作已结束" : "仅浏览"}</strong>
            <small>{snapshot ? bindingKey ? monitor?.browsing_only ? "仅浏览 · 当前不计时" : "请打开主窗口处理绑定" : visibleNotice?.kind === "ended" ? "结果已保存 · 待填写工作量" : state : "状态不可用"}</small></span>
          {active && <strong className="island-time">{formatDuration(active.duration_seconds)}</strong>}
        </div>
        {candidate && <button type="button" className="island-action" aria-label="开始识别的工作" title={`开始记录 · ${name(candidate.category)}`} disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}><Icon name="play" /></button>}
        {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || !!session.connectionError || active.recovery_pending} onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}><Icon name={active.is_paused ? "play" : "pause"} /></button>}
        {!candidate && monitor?.browsing_only && <button type="button" className="island-action" aria-label={active ? "继续记录" : "开始记录"} disabled={busy || !monitor.browse_ready || !!active?.recovery_pending || !!session.connectionError} onClick={() => { void session.confirmWork(null); }}><Icon name="play" /></button>}
        {(active || openTasks.tasks.length > 0 || bindingKey || visibleNotice || candidate || editing || combinedError || (snapshot?.pending_count ?? 0) > 0) && <button type="button" className="island-action island-expand" aria-expanded={expanded} title={expanded ? "收起展开区域" : "展开任务与提醒"} aria-label={expanded ? "收起展开区域" : "展开任务与提醒"} onClick={() => {
          if (expanded && editing) { void later(); return; }
          setExpanded(value => !value);
        }}><Icon name={expanded ? "left" : "right"} /></button>}
        <button type="button" className="island-open" aria-label="打开WorkMemo" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}><Icon name="open" /></button>
      </div>
      <IslandExpansion open={expanded} onError={setError} onCollapsed={() => { setEditing(null); setDiscard(false); setDirty(false); }}>
        {dashboard.fallback}
        {combinedError && <p className="inline-error" role="alert">{combinedError}</p>}
        {editing ? <>
          <h2>填写工作量 · {name(editing.category)}</h2>
          {discard && <div className="island-discard" role="alert"><p>放弃本次未保存的填写？原记录仍在待补全列表。</p><button type="button" disabled={busy} onClick={() => { void later(true); }}>放弃填写并收起</button><button type="button" className="secondary" onClick={() => setDiscard(false)}>继续填写</button></div>}
          <DraftContext.Provider value={registerDraft}><SettlementForm compact key={editing.id} record={editing} busy={busy}
            onSave={async input => {
              const saved = await session.settle(input);
              if (saved) {
                revision.current++;
                setNotice(current => current?.record.id === input.id ? null : current);
                setDirty(false); setExpanded(false);
              }
              return saved;
            }} /></DraftContext.Provider>
          <button className="text-button" type="button" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
          {session.commandError && <button className="text-button" type="button" onClick={() => { void dashboard.open("pending"); }}>打开待补全列表核对</button>}
        </> : bindingKey ? <section aria-label="新网页处理提醒"><h2>{monitor?.unknown_page_url ? "发现新网页" : "绑定任务已结束"}</h2><p>{monitor?.unknown_page_url ? "请在主窗口绑定已有任务、新建任务或记住忽略。" : "请在主窗口选择另一项未结束任务，或新建任务后重新绑定。"}</p><button type="button" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}>打开主窗口处理</button></section> : candidate ? <section aria-label="开工确认"><h2>开始记录 · {name(candidate.category)}</h2><p>已匹配工作网址，确认前不计时。</p><div className="island-buttons"><button disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}>开始记录</button><button className="secondary" disabled={busy} onClick={() => { void session.browse(); }}>仅浏览</button></div></section> : visibleNotice?.kind === "ended" ? <section aria-label="工作结束提醒">
          <h2>本次工作已结束</h2><p>{name(visibleNotice.record.category)} · 有效工时 {formatDuration(visibleNotice.record.duration_seconds)}</p>
          <div className="island-buttons"><button type="button" disabled={busy || !!session.connectionError} onClick={() => { setEditing(visibleNotice.record); setExpanded(true); }}>填写工作量</button><button className="secondary" type="button" disabled={busy} onClick={() => { void later(); }}>稍后</button></div>
        </section> : visibleNotice?.kind === "idle" ? <section aria-label="空闲提醒">
          <h2>空闲提醒</h2><p>连续 {formatDuration(visibleNotice.idle_warning_seconds)} 无输入；到达 {formatDuration(visibleNotice.idle_end_seconds)} 时结束计时，最后输入后的尾段不计入工时。</p>
          <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了</button>
        </section> : null}
        {!editing && <TaskList {...openTasks} active={active} compact disabled={busy || !!session.connectionError} onSwitch={session.switchTask}/>}
        {!editing && (snapshot?.pending_count ?? 0) > 0 && <button type="button" className="text-button" onClick={() => { void dashboard.open("pending"); }}>待补全 {snapshot?.pending_count}</button>}
      </IslandExpansion>
      {combinedError && !expanded && <span className="island-error" role="alert" aria-label={combinedError} title={combinedError}>!</span>}
    </div>
  </div>;
}

```

## UPDATE — E:\WorkMemo\scripts\desktop-fixture.mjs

SHA256: 964A80FFD552CA069A4DE841C70C3A47D22ADAED7DC883112C2DEF1586F7FC3A

```javascript

// Isolated IPC fixture for v0.2.7 browser checks only. No real backend is contacted.
export function desktopFixture(page) {
return page.addInitScript(() => {
  const params = new URLSearchParams(location.search), categories = ['评测', '质检', '开发', '文档'];
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离任务', start_time: Date.now() - 60000, end_time: null, confirmed_end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: params.get('state') === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'AUTO', control_mode: 'AUTO', revision: 1 };
  const ended = { ...record, id: 6, category: '文档', status: 'FINISHED', is_paused: true, settlement_status: 'PENDING', end_time: Date.now(), confirmed_end_time: Date.now() };
  const config = { enabled: true, revision: 3, times: { idle_pause_seconds: 120, away_pause_seconds: 120, hold_seconds: 600, idle_warning_seconds: 300, idle_end_seconds: 420 }, poll_interval_seconds: 1, auto_resume_manual: true, rules: [{ id: 1, category: '开发', match_mode: 'origin', url_prefix: 'https://work.example.test/' }] };
  const callbacks = new Map(), listeners = new Map(); let sequence = 0;
  const emit = (event, payload) => { for (const [id, entry] of listeners) if (entry.event === event) callbacks.get(entry.handler)?.({ event, id, payload }); };
  window.qa = { calls: [], active: params.get('state') === 'empty' ? null : record, candidate: params.has('candidate') ? { id: 21, rule_id: 1, category: '开发' } : null, unknown: params.has('unknown') ? 'https://new.example.test/work' : null, finishedRule: params.has('finished') ? 1 : null, tasks: [{id:1,name:'已有任务',category:'开发',record_id:params.has('suspended')?7:null,finished:false,suspended:params.has('suspended'),recovery_pending:params.has('suspended')}], notice: params.has('ended') ? { kind: 'ended', record: ended, idle_warning_seconds: 300, idle_end_seconds: 420 } : null, config, browse: false, fail: '', delay: 0, readsDelay: 100, emit, record };
  if (params.has('multi')) {
    window.qa.tasks = Array.from({length:Number(params.get('multi') || 2)}, (_,i) => ({id:i+1,name:i === 0 ? '当前任务' : `暂停任务 ${i+1}`,category:'开发',record_id:i === 0 ? 7 : 10+i,finished:false,suspended:i !== 0,recovery_pending:false}));
    if(window.qa.active)window.qa.active.task_name='当前任务';
  }
  window.qa.browse = params.has('browse');
  window.isTauri = true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: id => listeners.delete(id) };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: params.has('notice') ? 'notice' : params.has('panel') ? 'settings' : 'main' }, currentWebview: { label: 'fixture' } },
    transformCallback(fn) { const id = ++sequence; callbacks.set(id, fn); return id; }, unregisterCallback(id) { callbacks.delete(id); },
    convertFileSrc() { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700"><path fill="#8fa9bb" d="M0 0h800v700H0z"/><path fill="#b9ad96" d="m0 0 800 700H0z"/></svg>'); },
    async invoke(command, args = {}) {
      const q = window.qa; q.calls.push({ command, args });
      const snapshot = () => structuredClone({ active: q.active, recent_records: q.notice ? [q.notice.record] : [], pending_count: q.notice ? 1 : 0, warning: null, monitoring: { browsing_only: q.browse, browse_ready: true, browse_category: '开发', enabled: true, native_available: true, browser_connected: true, work_page: true, message: '已识别工作页面，等待新的鼠标或键盘活动', idle_warning: false, idle_warning_seconds: 300, idle_end_seconds: 420, revision:q.config.revision,unknown_page_url:q.unknown,finished_page_rule:q.finishedRule,start_candidate: q.candidate } });
      if (command.startsWith('plugin:event|')) {
        if (command.endsWith('|listen')) { const id = ++sequence; listeners.set(id, args); return id; }
        if (command.endsWith('|unlisten')) listeners.delete(args.eventId);
        if (command.endsWith('|emit')) emit(args.event, args.payload);
        return null;
      }
      if (command === q.fail) { await new Promise(r => setTimeout(r, q.delay || 120)); throw Error('隔离保存失败，请重试'); }
      if (command === 'get_snapshot') return snapshot();
      if (command === 'get_notice') return structuredClone(q.notice);
      if (command === 'get_appearance') return { version: 1, theme: params.get('theme') || 'cream', opacity: Number(params.get('opacity') || 65) };
      if (command === 'get_category_names') return { revision: 0, names: Object.fromEntries(categories.map(c => [c, c])) };
      if (command === 'get_layout_settings') return { density: params.get('density') || 'comfortable', revision: 0, sound_enabled: false, sound_theme: 'fiftysounds', font_size: params.has('large') ? 18 : 14, font_weight: 400, line_spacing: 'standard' };
      if (command === 'get_presentation') return { version: 1, revision: 0, background: params.has('background') ? { file: 'isolated-background.svg', opacity: 50 } : null, categories: Object.fromEntries(categories.map((c, i) => [c, { icon: ['checkSquare', 'safety', 'code', 'note'][i], color: '#447cba' }])) };
      if (command === 'get_monitor_config') { const value = structuredClone(q.config); await new Promise(r => setTimeout(r, q.readsDelay)); return value; }
      if (command === 'get_page_tasks') return structuredClone(q.tasks);
      if (command === 'get_ignored_pages') return [];
      if (command === 'bind_page') {q.unknown=null;q.config.revision++;return snapshot();}
      if (command === 'rebind_finished_page') {q.finishedRule=null;q.config.revision++;return snapshot();}
      if (command === 'confirm_recovery_task') {const target=q.tasks.find(t=>t.id===args.taskId);q.tasks=q.tasks.map(t=>({...t,suspended:t.id!==args.taskId,recovery_pending:false}));q.active={...record,id:target.record_id,task_name:target.name,is_paused:false,recovery_pending:false};return snapshot();}
      if (command === 'get_connection_status') return { state: 'ready', message: '隔离连接', version: 'fixture', identifier: 'fixture', host_name: 'fixture' };
      if (command === 'save_monitor_config') { await new Promise(r => setTimeout(r, q.delay)); q.config = { ...args.input, revision: q.config.revision + 1, rules: args.input.rules.map((r, i) => ({ ...r, id: i + 1 })) }; return structuredClone(q.config); }
      if (command === 'get_today_workload') return [];
      if (command === 'detect_preview_data') return false;
      if (command === 'get_startup_status') return { enabled: false, available: true, error: null };
      if (command === 'pause_task') { q.active = { ...q.active, is_paused: true, pause_reason: 'MANUAL' }; return snapshot(); }
      if (command === 'resume_task') { q.active = { ...q.active, is_paused: false, pause_reason: null }; return snapshot(); }
      if (command === 'finish_task') { q.notice = { kind: 'ended', record: { ...q.active, status: 'FINISHED', end_time: Date.now(), settlement_status: 'PENDING' } }; q.active = null; return snapshot(); }
      if (command === 'confirm_work') {
        await new Promise(r => setTimeout(r, q.delay));
        if (q.active || !q.candidate || q.candidate.id !== args.candidateId) throw Error('开工提示已失效');
        q.active = { ...record, id: 8, category: q.candidate.category, duration_ms: 0, duration_seconds: 0, is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'enter_browsing') { q.browse = true; q.candidate = null; return snapshot(); }
      if (command === 'start_task') {
        if ((q.active?.id ?? null) !== args.expectedActiveId || (q.active && !q.active.is_paused)) throw Error('当前任务已变化，请刷新后重新确认');
        q.active = { ...record, ...args.input, id: 9, control_mode: 'MANUAL', is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'settle_record') { await new Promise(r => setTimeout(r, q.delay)); if (q.notice?.record.id !== args.input.id || q.notice.record.revision !== args.input.expected_revision) throw Error('记录已变化'); q.notice = null; return snapshot(); }
      if (command === 'defer_notice') { if (q.notice?.record.id === args.id) q.notice = null; return null; }
      if (command === 'get_island_viewport') return innerHeight;
      return null;
    },
  };
});
}

```

## UPDATE — E:\WorkMemo\scripts\verify-v026.mjs

SHA256: 4747B798E04659424F1647C09A25180EF4823311569529E48A6C491262EDDD12

```javascript

// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.6/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 780, height: 680 } });
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  const params = new URLSearchParams(location.search), categories = ['评测', '质检', '开发', '文档'];
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离任务', start_time: Date.now() - 60000, end_time: null, confirmed_end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: params.get('state') === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'AUTO', control_mode: 'AUTO', revision: 1 };
  const ended = { ...record, id: 6, category: '文档', status: 'FINISHED', is_paused: true, settlement_status: 'PENDING', end_time: Date.now(), confirmed_end_time: Date.now() };
  const config = { enabled: true, revision: 3, times: { idle_pause_seconds: 120, away_pause_seconds: 120, hold_seconds: 600, idle_warning_seconds: 300, idle_end_seconds: 420 }, poll_interval_seconds: 1, auto_resume_manual: true, rules: [{ id: 1, category: '开发', match_mode: 'origin', url_prefix: 'https://work.example.test/' }] };
  const callbacks = new Map(), listeners = new Map(); let sequence = 0;
  const emit = (event, payload) => { for (const [id, entry] of listeners) if (entry.event === event) callbacks.get(entry.handler)?.({ event, id, payload }); };
  window.qa = { calls: [], active: params.get('state') === 'empty' ? null : record, candidate: params.has('candidate') ? { id: 21, rule_id: 1, category: '开发' } : null, notice: params.has('ended') ? { kind: 'ended', record: ended, idle_warning_seconds: 300, idle_end_seconds: 420 } : null, config, browse: false, fail: '', delay: 0, readsDelay: 100, emit, record };
  window.isTauri = true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: id => listeners.delete(id) };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: params.has('notice') ? 'notice' : params.has('panel') ? 'settings' : 'main' }, currentWebview: { label: 'fixture' } },
    transformCallback(fn) { const id = ++sequence; callbacks.set(id, fn); return id; }, unregisterCallback(id) { callbacks.delete(id); },
    convertFileSrc() { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700"><path fill="#8fa9bb" d="M0 0h800v700H0z"/><path fill="#b9ad96" d="m0 0 800 700H0z"/></svg>'); },
    async invoke(command, args = {}) {
      const q = window.qa; q.calls.push({ command, args });
      const snapshot = () => structuredClone({ active: q.active, recent_records: q.notice ? [q.notice.record] : [], pending_count: q.notice ? 1 : 0, warning: null, monitoring: { browsing_only: q.browse, browse_ready: true, browse_category: '开发', enabled: true, native_available: true, browser_connected: true, work_page: true, message: '已识别工作页面，等待新的鼠标或键盘活动', idle_warning: false, idle_warning_seconds: 300, idle_end_seconds: 420, start_candidate: q.candidate } });
      if (command.startsWith('plugin:event|')) {
        if (command.endsWith('|listen')) { const id = ++sequence; listeners.set(id, args); return id; }
        if (command.endsWith('|unlisten')) listeners.delete(args.eventId);
        if (command.endsWith('|emit')) emit(args.event, args.payload);
        return null;
      }
      if (command === q.fail) { await new Promise(r => setTimeout(r, q.delay || 120)); throw Error('隔离保存失败，请重试'); }
      if (command === 'get_snapshot') return snapshot();
      if (command === 'get_notice') return structuredClone(q.notice);
      if (command === 'get_appearance') return { version: 1, theme: params.get('theme') || 'cream', opacity: 88 };
      if (command === 'get_category_names') return { revision: 0, names: Object.fromEntries(categories.map(c => [c, c])) };
      if (command === 'get_layout_settings') return { density: params.get('density') || 'comfortable', revision: 0, sound_enabled: false, sound_theme: 'soft', font_size: params.has('large') ? 18 : 14, font_weight: 400, line_spacing: 'standard' };
      if (command === 'get_presentation') return { version: 1, revision: 0, background: params.has('background') ? { file: 'isolated-background.svg', opacity: 50 } : null, categories: Object.fromEntries(categories.map((c, i) => [c, { icon: ['checkSquare', 'safety', 'code', 'note'][i], color: '#447cba' }])) };
      if (command === 'get_monitor_config') { const value = structuredClone(q.config); await new Promise(r => setTimeout(r, q.readsDelay)); return value; }
      if (command === 'get_connection_status') return { state: 'ready', message: '隔离连接', version: 'fixture', identifier: 'fixture', host_name: 'fixture' };
      if (command === 'save_monitor_config') { await new Promise(r => setTimeout(r, q.delay)); q.config = { ...args.input, revision: q.config.revision + 1, rules: args.input.rules.map((r, i) => ({ ...r, id: i + 1 })) }; return structuredClone(q.config); }
      if (command === 'get_today_workload') return [];
      if (command === 'detect_preview_data') return false;
      if (command === 'get_startup_status') return { enabled: false, available: true, error: null };
      if (command === 'pause_task') { q.active = { ...q.active, is_paused: true, pause_reason: 'MANUAL' }; return snapshot(); }
      if (command === 'resume_task') { q.active = { ...q.active, is_paused: false, pause_reason: null }; return snapshot(); }
      if (command === 'finish_task') { q.notice = { kind: 'ended', record: { ...q.active, status: 'FINISHED', end_time: Date.now(), settlement_status: 'PENDING' } }; q.active = null; return snapshot(); }
      if (command === 'confirm_work') {
        await new Promise(r => setTimeout(r, q.delay));
        if (q.active || !q.candidate || q.candidate.id !== args.candidateId) throw Error('开工提示已失效');
        q.active = { ...record, id: 8, category: q.candidate.category, duration_ms: 0, duration_seconds: 0, is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'enter_browsing') { q.browse = true; q.candidate = null; return snapshot(); }
      if (command === 'start_task') {
        if ((q.active?.id ?? null) !== args.expectedActiveId || (q.active && !q.active.is_paused)) throw Error('当前任务已变化，请刷新后重新确认');
        q.active = { ...record, ...args.input, id: 9, control_mode: 'MANUAL', is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'settle_record') { await new Promise(r => setTimeout(r, q.delay)); if (q.notice?.record.id !== args.input.id || q.notice.record.revision !== args.input.expected_revision) throw Error('记录已变化'); q.notice = null; return snapshot(); }
      if (command === 'defer_notice') { if (q.notice?.record.id === args.id) q.notice = null; return null; }
      if (command === 'get_island_viewport') return innerHeight;
      return null;
    },
  };
});
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1420/';
async function load(params = {}, width = 780, height = 680) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(220);
}
async function test(name, fn) {
  const filter = process.argv.find(arg => arg.startsWith('--filter='))?.slice(9);
  if (filter && !name.includes(filter)) return;
  await fn(); results.push(name);
}
async function screenshot(name) { await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)) }); }
try {
  if (process.argv.includes('--baseline')) {
    await load({ panel: 'settings', section: 'monitor', background: '1' });
    await page.getByLabel('工作 URL', { exact: true }).fill('https://changed.example.test/');
    await page.evaluate(() => {
      window.qa.removedForms = 0;
      const form = document.querySelector('#monitor-form');
      new MutationObserver(() => { if (!form.isConnected) window.qa.removedForms++; }).observe(document.querySelector('.panel-app'), { childList: true, subtree: true });
    });
    await page.getByRole('button', { name: '保存监测配置', exact: true }).click();
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => ({ reads: window.qa.calls.filter(c => c.command === 'get_monitor_config').length, writes: window.qa.calls.filter(c => c.command === 'save_monitor_config').length, detachedObservations: window.qa.removedForms }));
    await load({ state: 'empty', notice: '1', ended: '1', candidate: '1' });
    metrics.visibleCandidate = await page.getByRole('region', { name: '开工确认' }).isVisible();
    metrics.endedShown = await page.getByRole('region', { name: '工作结束提醒' }).isVisible();
    await screenshot('baseline-island-priority');
    await writeFile(new URL('baseline.json', output), JSON.stringify(metrics, null, 2));
    console.log(JSON.stringify(metrics));
  } else {
    await test('idle monitoring, explicit new form, retained draft and authoritative cross-window guard', async () => {
      await load({ state: 'empty' });
      await page.getByRole('region', { name: '监测状态' }).waitFor();
      assert.equal(await page.locator('.work-form').count(), 0);
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('文档');
      await page.getByLabel('工作量（可稍后填写）').fill('0');
      await page.getByLabel('备注（选填）').fill('手动草稿');
      await page.evaluate(() => { window.qa.candidate = { id: 21, rule_id: 1, category: '开发' }; });
      await page.getByText(/已识别开发工作页面；也可在灵动岛确认开始/).waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '手动草稿');
      await page.evaluate(() => window.qa.fail = 'start_task');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).waitFor();
      assert.equal(await page.getByLabel('工作量（可稍后填写）').inputValue(), '0');
      await page.getByRole('button', { name: '返回监测状态', exact: true }).click();
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '手动草稿');
      await page.evaluate(() => { window.qa.fail = ''; window.qa.active = { ...window.qa.record, id: 99 }; window.qa.candidate = null; });
      await page.getByText(/已有任务从其他入口开始/).waitFor();
      assert.equal(await page.getByRole('button', { name: '开始工作', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: '返回监测状态', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      await screenshot('main-current-task');
    });
    await test('manual begin, finish returns to monitoring, pause and atomic switch', async () => {
      await load({ state: 'empty' });
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('文档');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      assert.equal(await page.getByRole('button', { name: '切换任务', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: '暂停', exact: true }).click();
      await page.getByRole('button', { name: '切换任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('评测');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('button', { name: '保存并开始', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'start_task').at(-1).args.expectedActiveId), 9);
      await page.getByRole('button', { name: '结束', exact: true }).click();
      await page.getByRole('region', { name: '监测状态' }).waitFor();
      assert.equal(await page.locator('.work-form').count(), 0);
      await screenshot('main-monitoring');
    });
    await test('next candidate supersedes old reminder, double confirmation creates once and old pending stays accessible', async () => {
      await load({ state: 'empty', notice: '1', ended: '1', candidate: '1' }, 320, 420);
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      assert.equal(await page.getByRole('region', { name: '工作结束提醒' }).count(), 0);
      assert.equal(await page.getByRole('button', { name: '待补全 1', exact: true }).isVisible(), true);
      await screenshot('island-next-candidate');
      await page.evaluate(() => window.qa.delay = 250);
      await page.getByRole('button', { name: '开始记录', exact: true }).evaluate(el => { el.click(); el.click(); });
      await page.waitForFunction(() => window.qa.active?.id === 8);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'confirm_work').length), 1);
      assert.equal(await page.evaluate(() => window.qa.notice.record.id), 6);
      assert.equal(await page.locator('.island-main-row').getByText('开发', { exact: true }).isVisible(), true);
      await page.getByRole('button', { name: '展开任务与提醒', exact: true }).click();
      await page.getByRole('button', { name: '待补全 1', exact: true }).waitFor();
      assert.equal(await page.getByRole('region', { name: '工作结束提醒' }).count(), 0);
    });
    await test('settlement draft survives next candidate and new active work, failed save preserves original record', async () => {
      await load({ state: 'empty', notice: '1', ended: '1' }, 320, 420);
      await page.getByRole('button', { name: '填写工作量', exact: true }).click();
      await page.getByLabel('工作量（必填）', { exact: true }).fill('12');
      await page.getByLabel('备注（选填）').fill('旧任务结算草稿');
      await page.evaluate(() => { window.qa.candidate = { id: 21, rule_id: 1, category: '开发' }; });
      await page.getByRole('button', { name: '开始识别的工作', exact: true }).waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '旧任务结算草稿');
      await page.getByRole('button', { name: '开始识别的工作', exact: true }).click();
      await page.waitForFunction(() => window.qa.active?.id === 8);
      assert.equal(await page.getByLabel('工作量（必填）', { exact: true }).inputValue(), '12');
      await page.evaluate(() => window.qa.fail = 'settle_record');
      await page.getByRole('button', { name: '填写工作量并保存', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).first().waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '旧任务结算草稿');
      await screenshot('island-pinned-settlement');
      await page.evaluate(() => window.qa.fail = '');
      await page.getByRole('button', { name: '填写工作量并保存', exact: true }).click();
      await page.waitForFunction(() => window.qa.notice === null);
      const input = await page.evaluate(() => window.qa.calls.filter(c => c.command === 'settle_record').at(-1).args.input);
      assert.equal(input.id, 6); assert.equal(input.quantity, 12);
      assert.equal(await page.evaluate(() => window.qa.active.id), 8);
    });
    await test('stale candidate fails visibly, browsing creates no work', async () => {
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('button', { name: '开始记录', exact: true }).waitFor();
      await page.evaluate(() => window.qa.candidate = null);
      await page.getByRole('button', { name: '开始记录', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '开工提示已失效' }).waitFor();
      assert.equal(await page.evaluate(() => window.qa.active), null);
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('button', { name: '仅浏览', exact: true }).click();
      await page.waitForFunction(() => window.qa.browse);
      assert.equal(await page.evaluate(() => window.qa.active), null);
      assert.equal(await page.evaluate(() => window.qa.calls.some(c => c.command === 'confirm_work')), false);
    });
    await test('direct settings save keeps form, scroll, background and focus; external refresh preserves new edits', async () => {
      await load({ panel: 'settings', section: 'monitor', background: '1' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://changed.example.test/');
      await page.evaluate(() => {
        window.qa.form = document.querySelector('#monitor-form'); window.qa.background = document.querySelector('.window-background');
        window.qa.initialReads = window.qa.calls.filter(c => c.command === 'get_monitor_config').length;
        window.qa.delay = 180;
        window.qa.focusStart = document.activeElement?.outerHTML;
        window.qa.focusEvents = [];
        for (const event of ['focusin', 'focusout']) document.addEventListener(event, e => window.qa.focusEvents.push({ event, element: e.target.outerHTML?.slice(0, 200) }));
        document.querySelector('.panel-scroll').scrollTop = 260;
      });
      await page.keyboard.press('Control+s');
      await page.locator('#monitor-form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
      await page.getByText('配置已保存。请在 Chrome 扩展中同步工作站点授权。', { exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement?.getAttribute('type') === 'url');
      const metrics = await page.evaluate(() => ({ sameForm: window.qa.form === document.querySelector('#monitor-form'), sameBackground: window.qa.background === document.querySelector('.window-background'), reads: window.qa.calls.filter(c => c.command === 'get_monitor_config').length, initialReads: window.qa.initialReads, writes: window.qa.calls.filter(c => c.command === 'save_monitor_config').length, focus: document.activeElement?.getAttribute('type') }));
      assert.equal(metrics.sameForm, true); assert.equal(metrics.sameBackground, true); assert.equal(metrics.reads, metrics.initialReads); assert.equal(metrics.writes, 1); assert.equal(metrics.focus, 'url');
      await page.keyboard.press('Control+s');
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'save_monitor_config').length), 1);
      await writeFile(new URL('settings-after.json', output), JSON.stringify(metrics, null, 2));
      await page.evaluate(() => { window.qa.readsDelay = 500; window.qa.emit('workmemo:data-changed', null); });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://draft-during-refresh.example.test/');
      await page.waitForTimeout(650);
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://draft-during-refresh.example.test/');
      assert.equal(await page.evaluate(() => window.qa.form === document.querySelector('#monitor-form')), true);
      await page.evaluate(() => window.qa.emit('workmemo:data-changed', null));
      await page.waitForTimeout(650);
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://draft-during-refresh.example.test/');
    });
    await test('slow modal save submits once, holds dialog stable, blocks Escape/close and navigates once', async () => {
      await load({ panel: 'settings', section: 'monitor', background: '1' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://slow.example.test/');
      await page.getByRole('button', { name: '布局', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: '保留未保存的修改？' });
      await dialog.waitFor();
      await page.evaluate(() => {
        window.qa.delay = 650; window.qa.dialog = document.querySelector('dialog[open]'); window.qa.form = document.querySelector('#monitor-form'); window.qa.box = window.qa.dialog.getBoundingClientRect().toJSON();
        window.qa.frames = [];
        const sample = () => {
          if (window.qa.config.revision !== 3) return;
          const dialog = document.querySelector('dialog[open]'); const box = dialog?.getBoundingClientRect();
          window.qa.frames.push({ open: !!dialog, formConnected: window.qa.form.isConnected, x: box?.x, y: box?.y, width: box?.width, height: box?.height });
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await dialog.getByRole('button', { name: '保存并继续', exact: true }).evaluate(el => { el.click(); el.click(); });
      await page.keyboard.press('Control+s');
      await page.keyboard.press('Escape');
      await page.evaluate(() => window.qa.emit('workmemo:request-close', null));
      assert.equal(await dialog.isVisible(), true);
      assert.equal(await dialog.getByRole('button', { name: '关闭保留未保存的修改？', exact: true }).isDisabled(), true);
      const stable = await page.evaluate(() => { const box = window.qa.dialog.getBoundingClientRect(); return window.qa.dialog === document.querySelector('dialog[open]') && window.qa.form === document.querySelector('#monitor-form') && box.width === window.qa.box.width && box.x === window.qa.box.x; });
      assert.equal(stable, true);
      await screenshot('settings-saving-dialog');
      await page.waitForFunction(() => document.querySelector('.settings-tabs button[aria-pressed=true]')?.textContent === '布局');
      assert.equal(await dialog.isVisible(), false);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'save_monitor_config').length), 1);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'close_panel').length), 0);
      const frames = await page.evaluate(() => window.qa.frames);
      assert.ok(frames.length > 8);
      assert.ok(frames.every(f => f.open && f.formConnected));
      assert.equal(new Set(frames.map(f => JSON.stringify([f.x, f.y, f.width, f.height]))).size, 1);
      await writeFile(new URL('settings-modal-frames.json', output), JSON.stringify(frames, null, 2));
    });
    await test('failed modal save, continue editing, discard and native close preserve correct data', async () => {
      await load({ panel: 'settings', section: 'monitor' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://failure.example.test/');
      await page.getByRole('button', { name: '布局', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: '保留未保存的修改？' });
      await page.evaluate(() => window.qa.fail = 'save_monitor_config');
      await dialog.getByRole('button', { name: '保存并继续', exact: true }).click();
      await dialog.getByRole('alert').waitFor();
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://failure.example.test/');
      await dialog.getByRole('button', { name: '继续编辑', exact: true }).click();
      await page.evaluate(() => { window.qa.fail = ''; window.qa.emit('workmemo:request-close', null); });
      await dialog.waitFor();
      await dialog.getByRole('button', { name: '放弃修改', exact: true }).click();
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://work.example.test/');
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'close_panel').length), 1);
      assert.equal(await page.evaluate(() => window.qa.config.revision), 3);
    });
    await test('four skins, compact/comfortable main and island layouts, reduced motion and narrow widths', async () => {
      for (const theme of ['glass', 'cream', 'dark', 'neon']) for (const density of ['compact', 'comfortable']) {
        await load({ state: 'empty', theme, density, large: '1' }, 360, 560);
        await page.getByRole('region', { name: '监测状态' }).waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await screenshot(`main-idle-${theme}-${density}`);
        await load({ state: 'empty', notice: '1', ended: '1', candidate: '1', theme, density }, 320, 420);
        await page.getByRole('region', { name: '开工确认' }).waitFor();
        const row = await page.locator('.island-main-row').evaluate(el => ({ width: el.clientWidth, overflow: el.scrollWidth, boxes: [...el.children].map(n => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right }; }) }));
        assert.ok(row.overflow <= row.width + 1, JSON.stringify(row));
        assert.ok(row.boxes.every((b, i, all) => !i || b.left >= all[i - 1].right - 1), JSON.stringify(row));
        await screenshot(`island-candidate-${theme}-${density}`);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      assert.equal(await page.locator('.island-expansion').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    });
    assert.deepEqual(errors, []);
    await writeFile(new URL('v026-result.json', output), JSON.stringify({ results, errors }, null, 2));
    console.log(`${results.length} v0.2.6 isolated UI scenarios passed.`);
  }
} catch (error) {
  await screenshot('v026-failure');
  await writeFile(new URL('v026-failure.json', output), JSON.stringify({ results, errors, message: String(error), html: await page.content(), detail: await page.evaluate(() => ({ focused: document.activeElement?.outerHTML?.slice(0, 500), start: window.qa.focusStart, focusEvents: window.qa.focusEvents, calls: window.qa.calls })) }, null, 2));
  throw error;
} finally { await browser.close(); }

```

## NEW FILE — E:\WorkMemo\scripts\verify-page-binding-entry.mjs

SHA256: 6F7AF9F2CB27350702889E3B4CCA13981564A38EE1234CEE7C1FFC66D1047EA1

```javascript

// Isolated browser IPC regression; never opens the native app or a user database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { desktopFixture } from './desktop-fixture.mjs';

const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT
  ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1423/';
const output = new URL('../artifacts/page-binding-entry/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], results = [];
try {
  const page = await browser.newPage({ viewport: { width: 420, height: 650 } });
  page.on('pageerror', error => errors.push(error.message));
  await desktopFixture(page);
  async function load(query) { await page.goto(`${base}?state=empty&${query}`); }
  async function savedWithoutStarting(command, browsing) {
    const state = await page.evaluate(() => ({
      browsing: window.qa.browse, active: window.qa.active,
      writes: window.qa.calls.filter(call => ['bind_page', 'rebind_finished_page', 'start_task', 'confirm_work', 'confirm_recovery_task', 'enter_browsing'].includes(call.command)),
    }));
    assert.equal(state.browsing, browsing);
    assert.equal(state.active, null);
    assert.deepEqual(state.writes.map(call => call.command), [command]);
    return state.writes[0].args.input;
  }

  for (const browsing of [false, true]) {
    const suffix = browsing ? '&browse' : '';
    await load(`finished${suffix}`);
    const prompt = page.getByRole('region', { name: '已结束任务处理', exact: true });
    const create = prompt.getByRole('radio', { name: '新建任务', exact: true });
    await create.waitFor();
    assert.equal(await create.isChecked(), true);
    assert.equal(await prompt.getByRole('button', { name: '确认绑定' }).isDisabled(), true);
    await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).fill('继续处理的工作');
    await prompt.getByRole('radio', { name: '绑定已有任务', exact: true }).check();
    assert.equal(await prompt.getByRole('button', { name: '确认绑定' }).isDisabled(), true);
    await prompt.getByRole('combobox', { name: '任务选择' }).selectOption('1');
    await create.check();
    assert.equal(await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).inputValue(), '继续处理的工作');
    await page.evaluate(() => { window.qa.fail = 'rebind_finished_page'; });
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.getByRole('alert').waitFor();
    assert.equal(await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).inputValue(), '继续处理的工作');
    await page.evaluate(() => { window.qa.fail = ''; window.qa.calls = []; });
    for (const width of [320, 420, 780]) {
      await page.setViewportSize({ width, height: 650 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await prompt.evaluate(element => element.scrollWidth <= element.clientWidth), true);
      await page.screenshot({ path: fileURLToPath(new URL(`finished-${browsing}-${width}.png`, output)) });
    }
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.waitFor({ state: 'detached' });
    const input = await savedWithoutStarting('rebind_finished_page', browsing);
    assert.equal(input.task_id, null);
    assert.equal(input.new_name, '继续处理的工作');

    await load(`finished${suffix}`);
    await prompt.getByRole('radio', { name: '绑定已有任务', exact: true }).check();
    await prompt.getByRole('combobox', { name: '任务选择' }).selectOption('1');
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.waitFor({ state: 'detached' });
    assert.equal((await savedWithoutStarting('rebind_finished_page', browsing)).task_id, 1);

    await load(`unknown${suffix}`);
    const unknown = page.getByRole('region', { name: '新网页处理', exact: true });
    await unknown.getByRole('radio', { name: '新建任务', exact: true }).check();
    await unknown.getByRole('textbox', { name: '任务名称', exact: true }).fill('新网页工作');
    await unknown.getByRole('combobox', { name: '绑定范围' }).selectOption('origin');
    await unknown.getByRole('button', { name: '保存绑定' }).click();
    await unknown.waitFor({ state: 'detached' });
    assert.equal((await savedWithoutStarting('bind_page', browsing)).new_name, '新网页工作');

    await load(`finished&notice${suffix}`);
    const reminder = page.getByRole('region', { name: '新网页处理提醒', exact: true });
    await reminder.getByRole('heading', { name: '绑定任务已结束' }).waitFor();
    assert.match(await reminder.innerText(), /新建任务/);
    assert.doesNotMatch(await reminder.innerText(), /忽略/);
    assert.equal(await page.getByText('网页任务待处理', { exact: true }).isVisible(), true);
    await reminder.getByRole('button', { name: '打开主窗口处理' }).click();
    assert.equal(await page.evaluate(() => window.qa.calls.some(call => call.command === 'show_main')), true);
    results.push({ browsing, finishedNew: true, finishedExisting: true, unknownNew: true, failedSaveDraft: true, islandEntry: true });
  }
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, results, errors }, null, 2));
  console.log('Page-binding entry regression passed: normal/browsing modes, new/existing tasks, save failure, 320/420/780 layouts and island guidance.');
} finally { await browser.close(); }

```
