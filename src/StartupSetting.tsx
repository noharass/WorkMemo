import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";

type Status = { enabled: boolean; available: boolean; error: string | null };
export function StartupSetting() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isTauri()) return;
    let stopped = false;
    void invoke<Status>("get_startup_status").then(value => { if (!stopped) setStatus(value); })
      .catch(e => { if (!stopped) setError(String(e)); });
    return () => { stopped = true; };
  }, []);
  return <div className="startup-setting">
    <label className="monitor-toggle"><input type="checkbox" checked={status?.enabled ?? false}
      disabled={busy || !status?.available} onChange={event => {
        const enabled = event.target.checked;
        setBusy(true); setError("");
        void invoke<Status>("set_startup_enabled", { enabled }).then(setStatus)
          .catch(async e => {
            setError(String(e));
            try { setStatus(await invoke<Status>("get_startup_status")); }
            catch (readError) { setError(`${String(e)}；读取当前启动状态失败：${String(readError)}`); }
          }).finally(() => setBusy(false));
      }} />开机启动</label>
    <p className="hint">立即生效。登录 Windows 后在托盘后台运行，可从托盘打开主窗口。{status && !status.available ? "开发与预览程序不注册启动项。" : ""}</p>
    {(error || status?.error) && <p className="inline-error" role="alert">{error || status?.error}</p>}
  </div>;
}
