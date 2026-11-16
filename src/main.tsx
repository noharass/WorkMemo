import React,{lazy,Suspense} from "react";
import ReactDOM from "react-dom/client";
import { CategoryProvider } from "./categoryNames";

const Dashboard=lazy(()=>import("./Dashboard"));
const App=lazy(()=>import("./App"));
const PanelApp=lazy(()=>import("./PanelApp").then(module=>({default:module.PanelApp})));
const NotificationApp=lazy(()=>import("./NotificationApp").then(module=>({default:module.NotificationApp})));
const params=new URLSearchParams(window.location.search);
const dashboard=window.location.pathname==="/dashboard";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode><CategoryProvider>
    <Suspense fallback={<p>{dashboard?"正在打开工作数据中心…":"正在打开 WorkMemo…"}</p>}>
      {dashboard?<Dashboard/>:params.has("notice")?<NotificationApp/>:params.has("panel")?<PanelApp panel={params.get("panel")!}/>:<App/>}
    </Suspense>
  </CategoryProvider></React.StrictMode>,
);
