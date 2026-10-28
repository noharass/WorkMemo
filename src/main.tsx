import React,{lazy,Suspense} from "react";
import ReactDOM from "react-dom/client";
import {PanelApp} from "./PanelApp";
import App from "./App";
import { NotificationApp } from "./NotificationApp";

const Dashboard=lazy(()=>import("./Dashboard"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {window.location.pathname==="/dashboard"?<Suspense fallback={<p>正在打开工作数据中心…</p>}><Dashboard/></Suspense>:new URLSearchParams(window.location.search).has("notice") ? <NotificationApp /> : new URLSearchParams(window.location.search).has("panel") ? <PanelApp panel={new URLSearchParams(window.location.search).get("panel")!}/> : <App />}
  </React.StrictMode>,
);
