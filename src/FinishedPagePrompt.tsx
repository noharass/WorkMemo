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
  return <section className="start-prompt" aria-label="已结束任务处理"><strong>此网页绑定的任务已结束</strong><p>选择另一项未结束任务，或创建新任务后再继续。</p>
    <select aria-label="任务选择" value={choice} onChange={e=>setChoice(e.target.value)}><option value="new">新建任务</option>{tasks.filter(t=>!t.finished).map(t=><option key={t.id} value={t.id}>{t.name} · {t.category}</option>)}</select>
    {choice==="new"&&<div><input aria-label="新任务名称" maxLength={80} value={name} onChange={e=>setName(e.target.value)}/><select aria-label="新任务类别" value={category} onChange={e=>setCategory(e.target.value)}>{["评测","质检","开发","文档"].map(c=><option key={c}>{c}</option>)}</select></div>}
    <button type="button" disabled={busy||(choice==="new"&&!name.trim())} onClick={()=>void submit()}>确认绑定</button>{error&&<p role="alert" className="notice">{error}</p>}
  </section>
}
