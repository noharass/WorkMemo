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
        enabled: config.enabled, expected_revision: config.revision, times: config.times,
        poll_interval_seconds: config.poll_interval_seconds, auto_resume_manual: config.auto_resume_manual,
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
    {config && <form className="monitor-settings grid gap-4" onSubmit={(event) => { void save(event); }}>
      <label className="monitor-toggle"><input type="checkbox" checked={config.enabled} disabled={busy}
        onChange={event => setConfig({ ...config, enabled: event.target.checked })} />启用工作页面自动识别</label>
      <p className="hint">浏览器前台工作页面匹配，并有新的输入活动时开始。仅打开页面不会开始。手动计时也受空闲保护。</p>
      <fieldset className="monitor-rule"><legend>识别与恢复</legend>
        <label>浏览器状态检查间隔（秒）<select value={config.poll_interval_seconds} disabled={busy}
          onChange={event => setConfig({ ...config, poll_interval_seconds: Number(event.target.value) })}>
          {[1, 2, 3, 4, 5].map(seconds => <option key={seconds} value={seconds}>{seconds} 秒</option>)}
        </select></label>
        <p className="hint">间隔越短，状态更新通常越快，也会增加少量后台活动。网络或系统忙碌时可能延迟。</p>
        <label className="monitor-toggle"><input type="checkbox" checked={config.auto_resume_manual} disabled={busy}
          onChange={event => setConfig({ ...config, auto_resume_manual: event.target.checked })} />返回工作页面并产生新操作后，自动恢复手动暂停的任务</label>
        <p className="hint">恢复原任务，不创建新记录；需要可信的页面连接和新的输入。关闭后需手动继续。</p>
      </fieldset>
      <fieldset className="monitor-rule"><legend>计时参数（秒）</legend>
        {([
          ["away_pause_seconds", "离开工作页面后继续计时"],
          ["hold_seconds", "暂停后保留记录"],
          ["idle_warning_seconds", "无输入后提醒"],
          ["idle_end_seconds", "无输入后结束"],
        ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min={1} max={86400} step={1} required disabled={busy}
          value={config.times[key]} onChange={event => setConfig({ ...config, times: { ...config.times, [key]: event.target.valueAsNumber } })} /></label>)}
        <p className="hint">每项 1 至 86400 秒；空闲提醒须早于空闲结束。离页宽限后暂停，再等待保留期结束记录。连接中断时不计入无法确认的时间；保留期同样适用。空闲结束可能更早发生。</p>
      </fieldset>
      {config.rules.map((rule, index) => <fieldset key={rule.id} className="monitor-rule">
        <legend>工作页面 {index + 1}</legend>
        <label>工作 URL<input type="url" required maxLength={2048} disabled={busy} value={rule.url_prefix}
          placeholder="https://工作站点/路径" onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, url_prefix: event.target.value } : item) })} /></label>
        <label>默认类别<select value={rule.category} disabled={busy} onChange={event => setConfig({ ...config, rules: config.rules.map((item, i) => i === index ? { ...item, category: event.target.value } : item) })}>
          {CATEGORIES.map(category => <option key={category}>{category}</option>)}</select></label>
        <button type="button" className="text-button" disabled={busy} onClick={() => setConfig({ ...config, rules: config.rules.filter((_, i) => i !== index) })}>移除这条配置</button>
      </fieldset>)}
      <button type="button" className="secondary" disabled={busy || config.rules.length >= 50} onClick={() => setConfig({ ...config, rules: [...config.rules, { id: -Date.now(), url_prefix: "", category: "评测" }] })}>添加工作 URL</button>
      <p className="hint">匹配精确站点及路径边界；查询参数和片段不参与匹配。保存监测配置会暂停当前自动记录；重新确认工作页面并产生新的输入后才会恢复。</p>
      <button type="submit" disabled={busy}>{busy ? "正在保存…" : "保存监测配置"}</button>
      <details><summary>连接与隐私说明</summary>
        <p className="hint">第一版配套 Chrome 扩展。安装扩展和本机通信主机后，在扩展面板同步已配置站点授权。只传规则标识、前台匹配状态、连接状态和页面活动信号；不传 URL、网页内容或输入文本。连接断开时暂停自动累计。</p>
        <p className="hint">离开工作页面后按设置暂停并保留记录。空闲结束时扣除最后输入后的尾段，阅读或思考可能少计，可稍后人工修正。</p>
      </details>
    </form>}
  </UiDialog>;
}
