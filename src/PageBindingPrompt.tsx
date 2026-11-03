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
