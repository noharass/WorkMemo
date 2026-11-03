import {useEffect,useState} from "react";
import {invoke} from "@tauri-apps/api/core";

type Task={id:number;name:string;category:string;record_id:number|null;suspended:boolean;recovery_pending:boolean};
export function SuspendedTasks({refresh,version}:{refresh:()=>Promise<unknown>;version:number}){
  const [tasks,setTasks]=useState<Task[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{let live=true;void invoke<Task[]>("get_page_tasks").then(v=>{if(live)setTasks(v)}).catch(e=>{if(live)setError(String(e))});return()=>{live=false}},[version]);
  const pending=tasks.filter(t=>t.suspended&&t.record_id!==null);
  if(!pending.length&&!error)return null;
  return <section className="start-prompt" aria-label="暂停中的任务"><strong>暂停中的任务</strong><p>选择任务后从现在继续；暂停期间没有计时。</p>
    {pending.map(t=><button type="button" className="secondary" key={t.id} disabled={busy} onClick={()=>{setBusy(true);setError("");void invoke("confirm_recovery_task",{taskId:t.id}).then(async()=>{await refresh();setTasks(items=>items.filter(item=>item.id!==t.id))}).catch(e=>setError(String(e))).finally(()=>setBusy(false))}}>{t.name} · {t.category} · 继续</button>)}
    {error&&<p className="notice" role="alert">{error}</p>}
  </section>
}
