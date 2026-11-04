import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useCategoryNames } from "./categoryNames";
import type { Snapshot, WorkRecord } from "./types";

type Task = {id:number;name:string;category:string;record_id:number|null;finished:boolean;recovery_pending:boolean};
export function useOpenTasks(snapshot: Snapshot | null, enabled: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    void invoke<Task[]>("get_page_tasks").then(value => {
      if (live) { setTasks(value.filter(t => t.record_id !== null && !t.finished)); setError(""); }
    }).catch(e => { if (live) setError(String(e)); });
    return () => { live = false; };
  }, [snapshot, enabled]);
  return {tasks, error};
}
export function TaskList({tasks, error, active, disabled, onSwitch, compact = false}: {
  tasks:Task[];error:string;active:WorkRecord|null;disabled:boolean;onSwitch:(id:number)=>Promise<boolean>;compact?:boolean;
}) {
  const {name} = useCategoryNames();
  const rows = tasks.map(t => ({...t, current:t.record_id === active?.id}));
  if (active && !rows.some(t => t.current)) rows.unshift({id:-1,name:active.task_name || name(active.category),category:active.category,record_id:active.id,finished:false,recovery_pending:active.recovery_pending,current:true});
  if (!rows.length && !error) return null;
  return <section className={`task-list ${compact ? "task-list-compact" : ""}`} aria-label="进行中的任务">
    <div className="task-list-heading"><strong>进行中的任务</strong><span>{rows.length}</span></div>
    {error && <p className="inline-error" role="alert">任务列表读取失败：{error}</p>}
    <div className="task-list-rows">{rows.map(t => {
      const running = t.current && !active?.is_paused;
      const category = name(t.category);
      const status = running ? "计时中" : t.recovery_pending || (t.current && active?.recovery_pending) ? "待恢复" : "已暂停";
      return <button type="button" className="task-list-row secondary" key={t.record_id} aria-current={t.current ? "true" : undefined}
        aria-label={`${t.name}，${status}${running ? "" : "，继续"}`} disabled={disabled || running || t.id < 0}
        onClick={() => { void onSwitch(t.id); }}>
        <span className="task-list-dot" aria-hidden="true"/><span className="task-list-copy"><strong>{t.name}</strong>{t.name !== category && <small>{category}</small>}</span>
        <span className="task-list-status">{status}</span>{!running && t.id >= 0 && <span className="task-list-resume">继续</span>}
      </button>;
    })}</div>
  </section>;
}
