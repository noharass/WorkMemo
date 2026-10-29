import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {emit} from "@tauri-apps/api/event";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES, type MonitorConfig } from "./types";
import {useLayout} from "./desktopPreferences";
import { Surface, useDraft } from "./Drafts";

type ConnectionStatus = { state: string; message: string; identifier: string; version: string; host_name: string; manifest_path: string | null; extension_path: string | null };

export function MonitoringSettings({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { name } = useCategoryNames();
  const compact=useLayout().current.density==="compact";
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [baseline,setBaseline]=useState("");
  const [retry, setRetry] = useState(0);
  const nextRuleId = useRef(-1);
  function addRule(category: string) {
    if (busy) return;
    const id = nextRuleId.current--;
    setConfig(previous => previous && previous.rules.length < 50 ? {
      ...previous, rules: [...previous.rules, {id, category, url_prefix: "", match_mode: "path_prefix"}],
    } : previous);
  }
  useEffect(() => {
    if (!open || !isTauri()) return;
    let stale = false;
    setConnection(null);
    void invoke<ConnectionStatus>("get_connection_status").then(value => { if (!stale) setConnection(value); }).catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    setConfig(null); setError(""); setNotice("");
    void invoke<MonitorConfig>("get_monitor_config").then(value => { if (!stale) {setConfig(value);setBaseline(JSON.stringify(value));} })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, retry]);
  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (!config || busy) return false;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await invoke<MonitorConfig>("save_monitor_config", { input: {
        enabled: config.enabled, expected_revision: config.revision, times: config.times,
        poll_interval_seconds: config.poll_interval_seconds, auto_resume_manual: config.auto_resume_manual,
        rules: config.rules.map(({ url_prefix, category, match_mode }) => ({ url_prefix, category, match_mode })),
      } });
      setConfig(saved); setBaseline(JSON.stringify(saved));setNotice("配置已保存。请在 Chrome 扩展中同步工作站点授权。"); onSaved();void emit("workmemo:data-changed");return true;
    } catch (failure: unknown) { setError(String(failure));return false; }
    finally { setBusy(false); }
  }
  useDraft("monitor",!!config&&JSON.stringify(config)!==baseline,busy,()=>save(),()=>{if(baseline)setConfig(JSON.parse(baseline));});
  return <Surface onClose={onClose} title="自动工作监测" actions={<button form="monitor-form" type="submit" disabled={busy||!config}>{busy?"正在保存…":"保存监测配置"}</button>}>
    {!isTauri() && <p className="notice">请在 Windows 桌面程序中配置监测。</p>}
    {error && <p className="error-banner" role="alert">{error}</p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {!config && isTauri() && <button className="secondary" type="button" onClick={() => setRetry(value => value + 1)}>读取监测配置</button>}
    {isTauri() && <details className="monitor-diagnostics" open={!compact}><summary>浏览器连接与诊断</summary>
      <p role="status">{connection?.message ?? "正在检查本机连接…"}</p>
      {connection && <details><summary>连接详情</summary><p className="hint">版本 {connection.version} · {connection.identifier}<br />主机 {connection.host_name}<br />清单 {connection.manifest_path ?? "尚未就绪"}</p></details>}
      <button type="button" className="secondary" disabled={repairing} onClick={() => {
        setRepairing(true); setError("");
        void invoke<ConnectionStatus>("repair_browser_connection").then(setConnection).catch((failure: unknown) => setError(String(failure))).finally(() => setRepairing(false));
      }}>{repairing ? "正在修复…" : "修复本机连接"}</button>
      <button type="button" className="text-button" onClick={() => { void invoke("open_browser_extension").catch((failure: unknown) => setError(String(failure))); }}>打开配套扩展文件夹</button>
      <p className="hint">Chrome 扩展需加载一次本目录。EXE、ZIP 和源码版启动时均会检查并修复当前用户的本机主机注册。</p>
    </details>}
    {config && <form id="monitor-form" className="monitor-settings grid gap-4" onSubmit={(event) => { void save(event); }}>
      <label className="monitor-toggle"><input type="checkbox" checked={config.enabled} disabled={busy}
        onChange={event => setConfig({ ...config, enabled: event.target.checked })} />启用工作页面自动识别</label>
      <p className="hint">浏览器前台工作页面匹配且有新操作时提示开工，确认后才计时；仅浏览不计时。手动计时也受空闲保护。</p>
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
      <details className="advanced-settings" open={!compact}><summary>计时参数（秒）</summary><fieldset className="monitor-rule"><legend className="sr-only">计时参数</legend>
        {([
          ["away_pause_seconds", "离开工作页面后继续计时"],
          ["hold_seconds", "暂停后保留记录"],
          ["idle_pause_seconds", "键鼠无操作后暂停"],
          ["idle_warning_seconds", "无输入后提醒"],
          ["idle_end_seconds", "无输入后结束"],
        ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min={1} max={86400} step={1} required disabled={busy}
          value={config.times[key]} onChange={event => setConfig({ ...config, times: { ...config.times, [key]: event.target.valueAsNumber } })} /></label>)}
        <p className="hint">每项 1 至 86400 秒；空闲暂停、空闲提醒均须早于空闲结束。空闲暂停扣除最后输入后的尾段；手动任务有新输入即恢复，自动任务须返回工作页面操作。离页宽限后暂停，再等待保留期结束记录。连接中断时不计入无法确认的时间；保留期同样适用。空闲结束可能更早发生。</p>
      </fieldset>
      </details>
      <section className="monitor-work-sites" aria-label="每项工作的多个网址">
        <h3>工作与网址</h3>
        <p className="hint">同一项工作可添加多个 URL，命中其中任意一个网站都属于工作页面。计时中切换这些网站会保留同一条记录，不重复开工。</p>
        {CATEGORIES.map(category => {
          const rules = config.rules.filter(rule => rule.category === category);
          return <details key={category} className="monitor-work-group" open={rules.length > 0} aria-label={`${name(category)}工作网址`}>
            <summary><strong>{name(category)}</strong><span>{rules.length} 个 URL</span></summary>
            <div className="monitor-work-urls">
              {rules.length === 0 && <p className="hint">还没有网址，添加这项工作需要使用的网站。</p>}
              {rules.map((rule, index) => <fieldset key={rule.id} className="monitor-rule">
                <legend>网址 {index + 1}</legend>
                <label>匹配模式<select disabled={busy} value={rule.match_mode ?? "path_prefix"} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, match_mode: event.target.value as typeof rule.match_mode } : item) })}>
                  <option value="path_prefix">路径前缀</option><option value="origin">整个站点</option><option value="domain_suffix">域名后缀（含子域名）</option>
                </select></label>
                <label>{rule.match_mode === "domain_suffix" ? "域名后缀" : "工作 URL"}<input type={rule.match_mode === "domain_suffix" ? "text" : "url"} required maxLength={2048} disabled={busy} value={rule.url_prefix}
                  placeholder={rule.match_mode === "domain_suffix" ? ".cn-beijing-vpc.fcapp.run" : "https://工作站点/路径"} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, url_prefix: event.target.value } : item) })} /></label>
                <label>归属工作<select value={rule.category} disabled={busy} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, category: event.target.value } : item) })}>
                  {CATEGORIES.map(value => <option key={value} value={value}>{name(value)}</option>)}
                </select></label>
                <button type="button" className="text-button" disabled={busy} onClick={() => setConfig({ ...config, rules: config.rules.filter(item => item.id !== rule.id) })}>移除此 URL</button>
              </fieldset>)}
              <button type="button" className="secondary" disabled={busy || config.rules.length >= 50} onClick={() => addRule(category)}>为{name(category)}添加 URL</button>
            </div>
          </details>;
        })}
        <p className="hint">全部工作合计最多 50 条 URL；移除一个 URL 不影响同一工作下的其他网址。配置保存后，请在扩展中同步所有工作站点授权。</p>
      </section>
      <p className="hint">路径前缀限定站点与路径边界；整个站点覆盖该来源全部路径；域名后缀覆盖该域名与子域名，例如 .cn-beijing-vpc.fcapp.run。查询参数和片段不参与匹配。保存监测配置会暂停当前自动记录；重新确认工作页面并产生新的输入后才会恢复。</p>

      <details><summary>连接与隐私说明</summary>
        <p className="hint">第一版配套 Chrome 扩展。安装扩展和本机通信主机后，在扩展面板同步已配置站点授权。只传规则标识、前台匹配状态、连接状态和页面活动信号；不传 URL、网页内容或输入文本。连接断开时暂停自动累计。</p>
        <p className="hint">离开工作页面后按设置暂停并保留记录。空闲结束时扣除最后输入后的尾段，阅读或思考可能少计，可稍后人工修正。</p>
      </details>
    </form>}
  </Surface>;
}
