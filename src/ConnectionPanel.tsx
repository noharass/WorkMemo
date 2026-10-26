import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";

interface AppInfo { name: string; version: string }
type Connection =
  | { status: "checking" }
  | { status: "ready"; info: AppInfo }
  | { status: "error"; message: string }
  | { status: "browser" };

export function ConnectionPanel() {
  const [connection, setConnection] = useState<Connection>({ status: "checking" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    if (!isTauri()) { setConnection({ status: "browser" }); return; }
    setConnection({ status: "checking" });
    void invoke<AppInfo>("app_info").then((info) => {
      if (!cancelled) setConnection({ status: "ready", info });
    }).catch((error: unknown) => {
      if (!cancelled) setConnection({ status: "error", message: String(error) });
    });
    return () => { cancelled = true; };
  }, [attempt]);
  const status = {
    checking: "正在检查桌面连接", ready: "桌面连接正常",
    error: "桌面连接失败", browser: "浏览器预览模式",
  }[connection.status];
  return <details className="connection-panel">
    <summary>基础连接检查</summary>
    <p role="status">{status}</p>
    {connection.status === "ready" && <p className="hint">{connection.info.name} {connection.info.version} · 本地 Rust 服务</p>}
    {connection.status === "error" && <pre className="inline-error">{connection.message}</pre>}
    <button className="secondary" type="button" onClick={() => setAttempt((value) => value + 1)}
      disabled={connection.status === "checking"}>重新检查</button>
  </details>;
}
