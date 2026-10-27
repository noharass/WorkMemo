import { useEffect, useState, type FormEvent } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES, type MonitorConfig } from "./types";
import { UiDialog } from "./UiDialog";

type ConnectionStatus = { state: string; message: string; identifier: string; version: string; host_name: string; manifest_path: string | null; extension_path: string | null };

export function MonitoringSettings({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open || !isTauri()) return;
    let stale = false;
    setConnection(null);
    void invoke<ConnectionStatus>("get_connection_status").then(value => { if (!stale) setConnection(value); }).catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    setConfig(null); setError(""); setNotice("");
    void invoke<MonitorConfig>("get_monitor_config").then(value => { if (!stale) setConfig(value); })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, retry]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!config || busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await invoke<MonitorConfig>("save_monitor_config", { input: {
        enabled: config.enabled, expected_revision: config.revision,
        rules: config.rules.map(({ url_prefix, category }) => ({ url_prefix, category })),
      } });
      setConfig(saved); setNotice("配置已保存。请在 Chrome 扩展中同步工作站点授权。"); onSaved();
    } catch (failure: unknown) { setError(String(failure)); }
    finally { setBusy(false); }
  }
  return <UiDialog open={open} onClose={() => { if (!busy) onClose(); }} id="monitor-settings-title" title="自动工作监测">
    {!isTauri() && <p className="notice">请在 Windows 桌面程序中配置监测。</p>}
    {error && <p className="error-banner" role="alert">{error}</p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {!config && isTauri() && <button className="secondary" type="button" onClick={() => setRetry(value => value + 1)}>读取监测配置</button>}
    {isTauri() && <section className="monitor-rule" aria-label="浏览器连接诊断">
      <p role="status">{connection?.message ?? "正在检查本机连接…"}</p>
      {connection && <details><summary>连接详情</summary><p className="hint">版本 {connection.version} · {connection.identifier}<br />主机 {connection.host_name}<br />清单 {connection.manifest_path ?? "尚未就绪"}</p></details>}
      <button type="button" className="secondary" disabled={repairing} onClick={() => {
        setRepairing(true); setError("");
        void invoke<ConnectionStatus>("repair_browser_connection").then(setConnection).catch((failure: unknown) => setError(String(failure))).finally(() => setRepairing(false));
      }}>{repairing ? "正在修复…" : "修复本机连接"}</button>
      <button type="button" className="text-button" onClick={() => { void invoke("open_browser_extension").catch((failure: unknown) => setError(String(failure))); }}>打开配套扩展文件夹</button>
      <p className="hint">Chrome 扩展需加载一次本目录。EXE、ZIP 和源码版启动时均会检查并修复当前用户的本机主机注册。</p>
    </section>}
    {config && <form className="monitor-settings" onSubmit={(event) => { void save(event); }}>
      <label className="monitor-toggle"><input type="checkbox" checked={config.enabled} disabled={busy}
        onChange={event => setConfig({ ...config, enabled: event.target.checked })} />启用工作页面自动识别</label>
      <p className="hint">浏览器前台工作页面匹配，并有新的输入活动时开始。仅打开页面不会开始。手动计时也受 5 分钟提醒、7 分钟结束保护。</p>
      {config.rules.map((rule, index) => <fieldset key={rule.id} className="monitor-rule">
        <legend>工作页面 {index + 1}</legend>
        <label>工作 URL<input type="url" required maxLength={2048} disabled={busy} value={rule.url_prefix}
          placeholder="https://工作站点/路径" onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, url_prefix: event.target.value } : item) })} /></label>
        <label>默认类别<select value={rule.category} disabled={busy} onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, category: event.target.value } : item) })}>
          {CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
        <button type="button" className="text-button" disabled={busy} onClick={() => setConfig({ ...config, rules: config.rules.filter((_, i) => i !== index) })}>移除这条配置</button>
      </fieldset>)}
      <button type="button" className="secondary" disabled={busy || config.rules.length >= 50} onClick={() => setConfig({ ...config, rules: [...config.rules, { id: -Date.now(), url_prefix: "", category: "评测" }] })}>添加工作 URL</button>
      <p className="hint">匹配精确站点及路径边界；查询参数和片段不参与匹配。配置变化会暂停当前自动记录，等待重新确认页面与输入。</p>
      <button type="submit" disabled={busy}>{busy ? "正在保存…" : "保存监测配置"}</button>
      <details><summary>连接与隐私说明</summary>
        <p className="hint">第一版配套 Chrome 扩展。安装扩展和本机通信主机后，在扩展面板同步已配置站点授权。只传规则标识、前台匹配状态和连接状态；不传 URL、网页内容或输入文本。连接断开时暂停自动累计。</p>
        <p className="hint">离开工作页面满 2 分钟暂停，再保留 10 分钟。空闲结束时扣除最后输入后的尾段，阅读或思考可能少计，可稍后人工修正。</p>
      </details>
    </form>}
  </UiDialog>;
}
