# v0.2.3 第 1 阶段完整变更源码

以下按原路径保存本阶段修改和新增的全部代码，未使用省略号替代文件内容。文档本身位于文件清单所列原路径；不在此递归复制文档。验收截图与数据不纳入源码。

## E:\WorkMemo\browser-extension\background.js

```javascript
import { HOST_NAME } from './bridge-config.js';
import { matchRule, permissionOrigins } from './matching.js';

const hosts = [HOST_NAME, ...['com.workmemo.browser_bridge', 'com.workmemo.browser_bridge_test'].filter(name => name !== HOST_NAME)];
let hostIndex = 0;
let retryAfter = 0;
let app = null;
let port = null;
let sequence = 0;
let config = null;
let connected = false;
let sending = false;
let awaitingReply = false;
let sentAt = 0;
let connectionError = '';
let pendingEvent = false;
let eventGeneration = 0;
let intervalId = null;
let intervalSeconds = 0;
let pageActivity = null;
let registeredOrigins = '';
let registrationBusy = false;
async function syncActivityScript() {
  if (!chrome.scripting || registrationBusy) return;
  registrationBusy = true;
  try {
    const allowed = [];
    for (const origin of permissionOrigins(config?.enabled ? config.rules : [])) {
      if (await chrome.permissions.contains({origins: [origin]})) allowed.push(origin);
    }
    const signature = JSON.stringify(allowed.sort());
    if (signature === registeredOrigins) return;
    const existing = await chrome.scripting.getRegisteredContentScripts({ids: ['workmemo-activity']});
    if (existing.length) await chrome.scripting.unregisterContentScripts({ids: ['workmemo-activity']});
    if (allowed.length) await chrome.scripting.registerContentScripts([{id: 'workmemo-activity', matches: allowed, js: ['activity.js'], runAt: 'document_start', allFrames: false, persistAcrossSessions: false}]);
    registeredOrigins = signature;
  } catch { registeredOrigins = ''; }
  finally { registrationBusy = false; }
}

// The older desktop protocol did not include an interval. Keep its original
// five-second behavior, while new desktop configurations specify 1–5 seconds.
function setPollingInterval(value) {
  const seconds = Number.isInteger(value) && value >= 1 && value <= 5 ? value : 5;
  if (seconds === intervalSeconds) return;
  if (intervalId !== null) clearInterval(intervalId);
  intervalSeconds = seconds;
  intervalId = setInterval(() => { void poll(); }, seconds * 1000);
}

function requestEventPoll() {
  pendingEvent = true;
  eventGeneration++;
  void poll();
}

function status() {
  return { connected, config, app, host: hosts[hostIndex], message: connected ? `已连接本机 WorkMemo${app?.version ? ' · ' + app.version + ' · ' + app.identifier : ''}` : connectionError || '等待本机连接；请启动完整 WorkMemo，软件会自动检查主机注册' };
}

function drop(message) {
  pageActivity = null;
  const stale = port; port = null; connected = false; config = null; app = null; awaitingReply = false;
  hostIndex = (hostIndex + 1) % hosts.length;
  retryAfter = Date.now() + 1000;
  connectionError = message;
  setPollingInterval(5);
  stale?.disconnect();
}
function connect() {
  if (port || Date.now() < retryAfter) return;
  try {
    const current = chrome.runtime.connectNative(hosts[hostIndex]);
    port = current;
    sequence = 0;
    current.onMessage.addListener(message => {
      if (port !== current) return;
      awaitingReply = false;
      if (message?.connected !== true || !message.config || !Array.isArray(message.config.rules)) {
        drop(message?.error === 'desktop_io' ? '本机通信连接中断，正在尝试配套主机；请确认已更新 WorkMemo'
          : '通信主机尚未连接软件，正在尝试配套主机；请启动 WorkMemo');
        return;
      }
      if (message.app && (message.app.protocol !== 1 || typeof message.app.identifier !== 'string')) {
        drop('本机通信协议不兼容，请完整更新 WorkMemo 和扩展'); return;
      }
      connected = true; config = { ...message.config, category_names: message.category_names ?? {} }; app = message.app ?? null; connectionError = '';
      setPollingInterval(config.poll_interval_seconds);
      void syncActivityScript();
      if (pendingEvent) void poll();
    });
    current.onDisconnect.addListener(() => {
      const error = chrome.runtime.lastError?.message;
      if (port === current) {
        drop(error?.includes('Specified native messaging host not found')
          ? `未找到本机主机；请先启动完整 WorkMemo，或在监测设置中修复连接。详细原因：${error.slice(0,300)}`
          : error ? `本机主机连接失败，正在尝试配套主机：${error.slice(0,300)}` : '本机通信主机已断开，正在尝试配套主机');
      }
    });
  } catch (error) {
    drop(`无法启动本机通信：${error instanceof Error ? error.message.slice(0, 300) : '请检查主机注册'}`);
  }
}

async function poll() {
  if (sending) return;
  sending = true;
  try {
    if (awaitingReply && Date.now() - sentAt > 10_000) {
      drop('本机通信响应超时，正在尝试配套主机');
    }
    connect();
    if (!port || awaitingReply) return;
    const current = port;
    const currentConfig = config;
    const generation = eventGeneration;
    pendingEvent = false;
    const rules = currentConfig?.rules ?? [];
    const origins = permissionOrigins(rules);
    const ready = !!currentConfig && (origins.length === 0 || await chrome.permissions.contains({ origins }));
    let focused = false;
    let ruleId = null;
    let activeTab = null;
    if (ready && currentConfig.enabled) {
      const window = await chrome.windows.getLastFocused();
      focused = window.focused === true;
      {
        const [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
        activeTab = tab;
        ruleId = matchRule(tab?.url, rules);
        if (focused && ruleId && chrome.scripting) void chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['activity.js']}).catch(() => {});
      }
    }
    // The native frame deliberately has no URL, title, page content, or input data.
    // Ignore an obsolete asynchronous query if the page changed while it was
    // running. A single pending refresh will query the latest page instead.
    if (port !== current || config !== currentConfig || generation !== eventGeneration) {
      pendingEvent = true;
      return;
    }
    const frame = { version: 1, sequence: ++sequence, config_revision: config?.revision ?? -1, focused, ready, rule_id: ruleId };
    if (app?.match_modes === true) frame.match_modes = true;
    if (app?.page_activity === true && pageActivity && focused && ruleId && activeTab?.id === pageActivity.tabId && activeTab?.url === pageActivity.url && pageActivity.revision === currentConfig?.revision && Date.now() - pageActivity.at <= 2000) frame.page_activity = true;
    pageActivity = null;
    awaitingReply = true;
    sentAt = Date.now();
    current.postMessage(frame);
  } catch (error) {
    connected = false;
    awaitingReply = false;
    connectionError = `页面监测暂不可用：${error instanceof Error ? error.message.slice(0, 300) : '请刷新连接状态'}`;
    pendingEvent = false;
  } finally {
    sending = false;
    if (pendingEvent && port && !awaitingReply) void poll();
  }
}

chrome.tabs.onActivated.addListener(requestEventPoll);
chrome.tabs.onUpdated.addListener((_id, change, tab) => { if (tab.active && (change.status || change.url)) requestEventPoll(); });
chrome.tabs.onRemoved.addListener(requestEventPoll);
chrome.windows.onFocusChanged.addListener(requestEventPoll);
chrome.permissions.onAdded.addListener(() => { void syncActivityScript(); requestEventPoll(); });
chrome.permissions.onRemoved.addListener(() => { pageActivity = null; void syncActivityScript(); requestEventPoll(); });
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'workmemo-reconnect') void poll(); });
chrome.runtime.onStartup.addListener(() => { void poll(); });
chrome.runtime.onInstalled.addListener(() => { void poll(); });
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id) return false;
  if (message?.type === 'page-activity' && sender.frameId === 0 && sender.tab && sender.url === sender.tab.url && config?.enabled && matchRule(sender.url, config.rules)) {
    pageActivity = {tabId: sender.tab.id, url: sender.url, revision: config.revision, at: Date.now()};
    requestEventPoll();
    return false;
  }
  if (sender.url !== chrome.runtime.getURL('popup.html')) return false;
  if (message?.type === 'status') reply(status());
  else if (message?.type === 'refresh') { retryAfter = 0; requestEventPoll(); reply(status()); }
  return false;
});
void chrome.alarms.create('workmemo-reconnect', { periodInMinutes: 0.5 });
setPollingInterval(5);
void poll();
```

## E:\WorkMemo\browser-extension\popup.js

```javascript
import { permissionOrigins } from './matching.js';
import LinkOutlined from '@ant-design/icons-svg/es/asn/LinkOutlined';
import GlobalOutlined from '@ant-design/icons-svg/es/asn/GlobalOutlined';
import SafetyCertificateOutlined from '@ant-design/icons-svg/es/asn/SafetyCertificateOutlined';
import ReloadOutlined from '@ant-design/icons-svg/es/asn/ReloadOutlined';
import './popup.css';

// Render the locally bundled Ant Design SVG definitions without injecting HTML.
function iconNode(definition) {
  function make(node) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', node.tag);
    for (const [key, value] of Object.entries(node.attrs ?? {})) element.setAttribute(key, value);
    for (const child of node.children ?? []) element.append(make(child));
    return element;
  }
  const icon = make(definition.icon);
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('fill', 'currentColor');
  return icon;
}
for (const [id, icon] of [['connection-icon', LinkOutlined], ['sites-icon', GlobalOutlined], ['grant-icon', SafetyCertificateOutlined], ['refresh-icon', ReloadOutlined]]) {
  document.getElementById(id).append(iconNode(icon));
}
const status = document.querySelector('#status');
const list = document.querySelector('#rules');
const permissionStatus = document.querySelector('#permissions');
const grant = document.querySelector('#grant');
const error = document.querySelector('#error');
let origins = [];
async function refresh() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'status' });
    status.textContent = state?.message ?? '连接状态不可用';
    list.replaceChildren();
    for (const rule of state?.config?.rules ?? []) {
      const item = document.createElement('li'); item.textContent = `${state.config.category_names?.[rule.category] ?? rule.category} · ${{path_prefix:"路径前缀",origin:"整个站点",domain_suffix:"域名后缀"}[rule.match_mode ?? "path_prefix"]} · ${rule.url_prefix}`; list.append(item);
    }
    origins = permissionOrigins(state?.config?.rules ?? []);
    grant.disabled = !state?.connected || origins.length === 0;
    const allowed = origins.length > 0 && await chrome.permissions.contains({ origins });
    permissionStatus.textContent = !state?.connected ? '先恢复本机连接，再同步工作站点授权'
      : origins.length === 0 ? '请先在 WorkMemo 配置 URL，再同步站点授权'
      : allowed ? '工作站点已授权' : '工作站点尚未授权，请点击下方按钮';
  } catch { status.textContent = '无法读取连接状态，请启动 WorkMemo，并在监测设置中检查本机连接'; }
}
grant.addEventListener('click', async () => {
  error.textContent = '';
  try {
    // Request only these configured origins, synchronously from the user gesture.
    const allowed = await chrome.permissions.request({ origins });
    if (!allowed) error.textContent = '未获得工作站点授权，自动识别保持暂停。';
    else await chrome.runtime.sendMessage({ type: 'refresh' });
    await refresh();
  } catch { error.textContent = '站点授权未完成，请重新打开扩展面板后重试。'; }
});
document.querySelector('#refresh').addEventListener('click', async () => { await chrome.runtime.sendMessage({ type: 'refresh' }); await refresh(); });
await refresh();
setInterval(() => { void refresh(); }, 2_000);
```

## E:\WorkMemo\scripts\verify-multi-url.mjs

```javascript
// Isolated settings UI/IPC fixture. Never connects to a user database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {chromium} = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.2/qa/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:720,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    window.isTauri=true;
    const initial={enabled:true,revision:3,times:{idle_pause_seconds:120,away_pause_seconds:120,hold_seconds:600,idle_warning_seconds:300,idle_end_seconds:420},poll_interval_seconds:1,auto_resume_manual:true,rules:[{id:1,category:'评测',match_mode:'origin',url_prefix:'https://moonshot.feishu.cn/'}]};
    window.qaConfig=JSON.parse(sessionStorage.getItem('qa-config')??JSON.stringify(initial));
    window.qaFail=false;window.qaSaves=[];
    window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
    window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'settings'},currentWebview:{label:'settings'}},transformCallback(){return 1;},unregisterCallback(){},invoke:async(command,args)=>{
      if(command==='get_category_names') return {revision:0,names:Object.fromEntries(['评测','质检','开发','文档'].map(key=>[key,key]))};
      if(command==='get_appearance') return {version:1,theme:'cream',opacity:94};
      if(command==='get_layout_settings') return {density:'compact',revision:0,sound_enabled:true,font_size:14,font_weight:400,line_spacing:'standard'};
      if(command==='get_presentation') return {version:1,categories:{'评测':{icon:'checkSquare',color:'#447cba'},'质检':{icon:'safety',color:'#e6a23c'},'开发':{icon:'code',color:'#8b5cf6'},'文档':{icon:'note',color:'#44aa88'}},background:null};
      if(command==='get_connection_status') return {state:'ready',message:'Isolated UI fixture',identifier:'com.workmemo.test.fixture',version:'0.2.2',host_name:'fixture',manifest_path:null,extension_path:null};
      if(command==='get_monitor_config') return JSON.parse(JSON.stringify(window.qaConfig));
      if(command==='save_monitor_config'){
        window.qaSaves.push(args.input);
        if(window.qaFail) throw new Error('测试保存失败，请重试');
        window.qaConfig={...args.input,revision:window.qaConfig.revision+1,rules:args.input.rules.map((r,i)=>({...r,id:i+1}))};
        sessionStorage.setItem('qa-config',JSON.stringify(window.qaConfig));
        return JSON.parse(JSON.stringify(window.qaConfig));
      }
      return null;
    }};
  });
  await page.goto('http://127.0.0.1:1420/?panel=settings&section=monitor');
  const group=page.locator('.monitor-work-group[aria-label="评测工作网址"]');
  await group.getByText('1 个 URL',{exact:true}).waitFor();
  await group.getByRole('button',{name:'为评测添加 URL'}).click();
  const second=group.locator('fieldset').nth(1);
  await second.getByLabel('匹配模式').selectOption('domain_suffix');
  await second.getByLabel('域名后缀',{exact:true}).fill('.cn-beijing-vpc.fcapp.run');
  await group.getByText('2 个 URL',{exact:true}).waitFor();
  // Rapid additions must keep separate React keys and remove only the chosen URL.
  await group.getByRole('button',{name:'为评测添加 URL'}).evaluate(button=>{button.click();button.click();});
  assert.equal(await group.locator('fieldset').count(),4);
  await group.locator('fieldset').nth(3).getByRole('button',{name:'移除此 URL'}).click();
  await group.locator('fieldset').nth(2).getByRole('button',{name:'移除此 URL'}).click();
  assert.equal(await group.locator('fieldset').count(),2);
  await second.getByLabel('归属工作').selectOption('开发');
  const development=page.locator('.monitor-work-group[aria-label="开发工作网址"]');
  await development.getByLabel('归属工作').selectOption('评测');
  await page.evaluate(()=>window.qaFail=true);
  await page.getByRole('button',{name:'保存监测配置',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'测试保存失败'}).waitFor();
  assert.equal(await group.locator('fieldset').count(),2);
  assert.equal(await group.getByLabel('域名后缀',{exact:true}).inputValue(),'.cn-beijing-vpc.fcapp.run');
  await page.evaluate(()=>window.qaFail=false);
  await page.getByRole('button',{name:'保存监测配置',exact:true}).click();
  await page.waitForFunction(()=>window.qaConfig.revision===4);
  await group.getByText('2 个 URL',{exact:true}).waitFor();
  const saved=await page.evaluate(()=>window.qaConfig.rules);
  assert.equal(saved.length,2);
  assert.ok(saved.every(r=>r.category==='评测'));
  assert.deepEqual(saved.map(r=>r.match_mode),['origin','domain_suffix']);
  await page.reload();
  await group.getByText('2 个 URL',{exact:true}).waitFor();
  assert.equal(await group.getByLabel('工作 URL',{exact:true}).inputValue(),'https://moonshot.feishu.cn/');
  assert.equal(await group.getByLabel('域名后缀',{exact:true}).inputValue(),'.cn-beijing-vpc.fcapp.run');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:new URL('multi-url-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
  assert.deepEqual(errors,[]);
  await writeFile(new URL('multi-url-result.json',output),JSON.stringify({sameWorkMultipleUrls:true,independentModes:true,rapidAddRemove:true,moveCategory:true,failedSaveKeepsInput:true,saveReload:true,pageErrors:errors},null,2));
  console.log('Multi-URL settings regression passed; isolated IPC only.');
} finally { await browser.close(); }
```

## E:\WorkMemo\scripts\verify-v023-phase1.mjs

```javascript
// Isolated UI/IPC fixtures. No access to real user records or native input.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {chromium} = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.3/qa/',import.meta.url);
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const context = await browser.newContext({viewport:{width:780,height:900}});
  const errors = [];
  context.on('page', page => page.on('pageerror', e => errors.push(e.message)));
  await context.addInitScript(() => {
    window.isTauri=true;
    const categories=['评测','质检','开发','文档'];
    const original={revision:0,names:Object.fromEntries(categories.map(c=>[c,c]))};
    const getNames=()=>JSON.parse(localStorage.getItem('qa-names')??JSON.stringify(original));
    const visuals={version:1,revision:0,background:null,categories:Object.fromEntries(categories.map((key,i)=>[key,{icon:['checkSquare','safety','code','note'][i],color:['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i]}]))};
    window.qaFail=false; window.qaSaves=[]; window.qaCommands=[];
    window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
    let next=1; const callbacks=new Map(); const events=new Map();
    window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'settings'},currentWebview:{label:'settings'}},
      transformCallback(callback){const id=next++;callbacks.set(id,callback);return id;},unregisterCallback(id){callbacks.delete(id);},
      invoke:async(command,args)=>{
        window.qaCommands.push(command);
        if(command==='plugin:event|listen'){events.set(next,{name:args.event,callback:args.handler});return next++;}
        if(command==='plugin:event|unlisten'){events.delete(args.eventId);return;}
        if(command==='get_category_names') return getNames();
        if(command==='save_category_names'){
          window.qaSaves.push(structuredClone(args.input));
          if(window.qaFail) throw new Error('名称保存失败测试');
          const current=getNames();
          if(args.input.revision!==current.revision) throw new Error('工作名称已被其他窗口修改，请重新读取后保存。');
          const saved={revision:current.revision+1,names:Object.fromEntries(Object.entries(args.input.names).map(([k,v])=>[k,v.trim()]))};
          localStorage.setItem('qa-names',JSON.stringify(saved));
          for(const [id,event] of events)if(event.name==='workmemo:categories-changed') callbacks.get(event.callback)?.({event:event.name,id,payload:null});
          return saved;
        }
        if(command==='get_presentation') return visuals;
        if(command==='get_appearance') return {version:1,theme:'cream',opacity:94};
        if(command==='get_layout_settings') return {density:'comfortable',revision:0,sound_enabled:true,font_size:14,font_weight:400,line_spacing:'standard'};
        if(command==='get_monitor_config') return {enabled:false,revision:0,times:{idle_pause_seconds:120,idle_warning_seconds:300,idle_end_seconds:420,away_pause_seconds:120,hold_seconds:600},poll_interval_seconds:1,auto_resume_manual:true,rules:[{id:1,category:'开发',url_prefix:'https://example.test/',match_mode:'origin'}]};
        if(command==='get_connection_status') return {state:'ready',message:'隔离验收夹具',identifier:'fixture',version:'0.2.2'};
        if(command==='app_info') return {name:'WorkMemo',version:'0.2.2'};
        if(command==='get_notice') return null;
        if(command==='get_pending_records')return [{id:1,category:'开发',quantity:null,remark:'隔离夹具',start_time:Date.now()-10000,end_time:Date.now(),duration_ms:10000,duration_seconds:10,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'PENDING',source:'MANUAL_START',pause_reason:null,confirmed_end_time:Date.now(),last_input_time:null,end_reason:'MANUAL',legacy_duration_ms:0,revision:0,control_mode:'MANUAL'}];
        if(command==='get_snapshot')return {active:null,recent_records:[],warning:null,pending_count:1,monitoring:{enabled:false,native_available:true,idle_warning:false,revision:0,away_pause_remaining_seconds:null,message:'隔离夹具'}};
        if(command==='get_today_workload')return [];
        return null;
      }};
    window.addEventListener('storage',event=>{
      if(event.key==='qa-names')for(const [id,e] of events)if(e.name==='workmemo:categories-changed')callbacks.get(e.callback)?.({event:e.name,id,payload:null});
    });
  });
  const settings=await context.newPage();
  await settings.goto('http://127.0.0.1:1420/?panel=settings&section=visuals');
  const editor=settings.locator('.category-names-editor');
  const input=editor.getByLabel('类型 3（原名：开发）');
  await input.waitFor();
  await input.fill('编程任务');
  await settings.evaluate(()=>window.qaFail=true);
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await editor.getByRole('alert').filter({hasText:'名称保存失败测试'}).waitFor();
  assert.equal(await input.inputValue(),'编程任务');
  await settings.evaluate(()=>window.qaFail=false);
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await editor.getByRole('status').filter({hasText:'工作名称已保存'}).waitFor();
  await settings.locator('legend .work-badge').filter({hasText:'编程任务'}).waitFor();
  assert.equal((await settings.evaluate(()=>JSON.parse(localStorage.getItem('qa-names')))).names['开发'],'编程任务');

  const second=await context.newPage();
  await second.goto('http://127.0.0.1:1420/?panel=settings&section=visuals');
  const secondInput=second.locator('.category-names-editor').getByLabel('类型 3（原名：开发）');
  await secondInput.fill('第二窗口草稿');
  await input.fill('第一窗口更新');
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await settings.waitForFunction(()=>JSON.parse(localStorage.getItem('qa-names')).revision===2);
  await second.waitForTimeout(100);
  assert.equal(await secondInput.inputValue(),'第二窗口草稿');
  await second.locator('.category-names-editor').getByRole('button',{name:'保存工作名称',exact:true}).click();
  await second.getByRole('alert').filter({hasText:'已被其他窗口修改'}).waitFor();
  assert.equal(await secondInput.inputValue(),'第二窗口草稿');
  await second.locator('.category-names-editor').getByRole('button',{name:'重新读取并放弃名称修改'}).click();
  await second.waitForFunction(()=>Array.from(document.querySelectorAll('.category-names-editor input')).some(input=>input.value==='第一窗口更新'));
  assert.equal(await secondInput.inputValue(),'第一窗口更新');
  await second.close();
  await settings.screenshot({path:new URL('phase1-category-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});

  const main=await context.newPage();
  await main.goto('http://127.0.0.1:1420/');
  await main.getByRole('option',{name:'第一窗口更新',exact:true}).waitFor({state:'attached'});
  assert.equal(await main.getByRole('option',{name:'第一窗口更新',exact:true}).getAttribute('value'),'开发');
  await settings.getByRole('button',{name:'监测',exact:true}).click();
  const workgroup=settings.locator('.monitor-work-group[aria-label="第一窗口更新工作网址"]');
  await workgroup.getByText('1 个 URL',{exact:true}).waitFor();
  assert.equal(await workgroup.getByLabel('归属工作').inputValue(),'开发');
  await settings.getByLabel('键鼠无操作后暂停',{exact:true}).waitFor();
  assert.equal(await settings.getByLabel('键鼠无操作后暂停',{exact:true}).inputValue(),'120');
  for(const width of [390,780]){
    await settings.setViewportSize({width,height:900});
    assert.equal(await settings.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`settings overflow ${width}`);
  }
  await settings.screenshot({path:new URL('phase1-monitor-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
  const dashboard=await context.newPage();
  const dashboardRecord={id:1,category:'开发',quantity:0,remark:'isolated rename fixture',start_time:Date.now()-10000,end_time:Date.now(),duration_ms:10000,duration_seconds:10,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'COMPLETE',source:'MANUAL_START',pause_reason:null,confirmed_end_time:Date.now(),last_input_time:null,end_reason:'MANUAL',legacy_duration_ms:0,revision:0,control_mode:'MANUAL'};
  const queries=[];
  await dashboard.route('**/api/**',async route=>{
    const endpoint=new URL(route.request().url()).pathname.split('/').at(-1);
    if(endpoint==='meta')return route.fulfill({json:{version:'0.2.2',active:null,category_names:await dashboard.evaluate(()=>JSON.parse(localStorage.getItem('qa-names')))}});
    if(endpoint==='detail')return route.fulfill({json:{record:dashboardRecord,segments:[],revisions:[]}});
    if(endpoint==='query'){
      queries.push(JSON.parse(route.request().postData()));
      return route.fulfill({json:{totals:{duration_ms:10000,quantity:0,records:1,pending:0},trend:[],monthly:false,categories:[{category:'开发',duration_ms:10000,quantity:0,records:1}],calendar:[],records:[dashboardRecord],page:1,pages:1,scope:'real'}});
    }
    return route.fulfill({json:{saved:true}});
  });
  await dashboard.goto('http://127.0.0.1:1420/dashboard#token=isolated-rename-fixture');
  await dashboard.locator('td .work-badge').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.locator('select').filter({has:dashboard.locator('option[value="开发"]')}).first().selectOption('开发');
  await dashboard.getByRole('button',{name:'应用筛选'}).click();
  await dashboard.waitForTimeout(100);
  assert.equal(queries.at(-1).category,'开发');
  await dashboard.getByRole('button',{name:'详情',exact:true}).click();
  await dashboard.locator('.dc-record-summary .work-badge').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.getByRole('button',{name:'编辑工作量',exact:true}).click();
  assert.equal(await dashboard.locator('#dc-editor select').inputValue(),'开发');
  assert.equal(await dashboard.locator('#dc-editor option[value="开发"]').textContent(),'第一窗口更新');
  assert.deepEqual(errors,[]);
  await writeFile(new URL('phase1-ui-result.json',output),JSON.stringify({renameSave:true,failedSavePreservesInput:true,multiWindowConflict:true,explicitReload:true,stableSelectIdentity:true,monitorGroupName:true,idlePauseSetting:true,dashboardNameAndStableFilter:true,widths:[390,780],pageErrors:errors},null,2));
  console.log('v0.2.3 phase 1 UI regressions passed; isolated IPC fixtures only.');
} finally {await browser.close();}
```

## E:\WorkMemo\src-tauri\migrations\009_idle_categories.sql

```sql
-- Store::initialize disables foreign keys before the transaction, validates all
-- references before commit and enables enforcement after commit (SQLite rebuild).
CREATE TABLE work_records_v9 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('评测','质检','开发','文档')),
    quantity REAL CHECK(quantity IS NULL OR (quantity >= 0 AND quantity <= 1000000000)),
    remark TEXT NOT NULL DEFAULT '' CHECK(length(remark) <= 2000),
    start_time INTEGER NOT NULL CHECK(start_time >= 0),
    end_time INTEGER,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK(duration_seconds >= 0),
    duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(duration_ms >= 0),
    status TEXT NOT NULL CHECK(status IN ('NOT_STARTED','WORKING','FINISHED')),
    is_paused INTEGER NOT NULL DEFAULT 1 CHECK(is_paused IN (0,1)),
    recovery_pending INTEGER NOT NULL DEFAULT 0 CHECK(recovery_pending IN (0,1)),
    settlement_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(settlement_status IN ('IN_PROGRESS','PENDING','COMPLETE')),
    source TEXT NOT NULL DEFAULT 'MANUAL_START' CHECK(source IN ('AUTO','MANUAL_START','MANUAL_ENTRY')),
    pause_reason TEXT CHECK(pause_reason IN ('MANUAL','APP_CLOSE','RECOVERY','AWAY','MONITOR','IDLE_PAUSE')),
    confirmed_end_time INTEGER CHECK(confirmed_end_time >= 0),
    last_input_time INTEGER CHECK(last_input_time >= 0),
    end_reason TEXT CHECK(end_reason IN ('MANUAL','SWITCH','IDLE','AWAY','RECOVERY')),
    legacy_duration_ms INTEGER NOT NULL DEFAULT 0 CHECK(legacy_duration_ms >= 0),
    revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
    control_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK(control_mode IN ('AUTO','MANUAL')),
    is_demo INTEGER NOT NULL DEFAULT 0 CHECK(is_demo IN (0,1)),
    demo_batch TEXT,
    CHECK(duration_seconds = duration_ms / 1000),
    CHECK((status='FINISHED' AND end_time IS NOT NULL AND end_time >= start_time AND is_paused=1 AND settlement_status!='IN_PROGRESS')
       OR (status!='FINISHED' AND end_time IS NULL AND settlement_status='IN_PROGRESS')),
    CHECK(settlement_status!='COMPLETE' OR quantity IS NOT NULL)
);
INSERT INTO work_records_v9 SELECT * FROM work_records;
UPDATE sqlite_sequence SET seq=MAX(seq,COALESCE((SELECT seq FROM sqlite_sequence WHERE name='work_records'),0)) WHERE name='work_records_v9';
DROP TABLE work_records;
ALTER TABLE work_records_v9 RENAME TO work_records;
CREATE UNIQUE INDEX one_active_task ON work_records(status) WHERE status='WORKING';
CREATE INDEX pending_settlement ON work_records(id) WHERE status='FINISHED' AND settlement_status='PENDING';
CREATE INDEX records_demo_date ON work_records(is_demo,start_time);

ALTER TABLE monitoring_settings ADD COLUMN idle_pause_seconds INTEGER NOT NULL DEFAULT 120 CHECK(idle_pause_seconds BETWEEN 1 AND 86400);
UPDATE monitoring_settings SET idle_pause_seconds=MIN(120,idle_end_seconds-1);
CREATE TABLE category_names (
    category TEXT PRIMARY KEY CHECK(category IN ('评测','质检','开发','文档')),
    display_name TEXT NOT NULL UNIQUE CHECK(length(display_name) BETWEEN 1 AND 20),
    revision INTEGER NOT NULL DEFAULT 0 CHECK(revision>=0)
);
INSERT INTO category_names(category,display_name) VALUES('评测','评测'),('质检','质检'),('开发','开发'),('文档','文档');
```

## E:\WorkMemo\src-tauri\src\browser_bridge.rs

```rust
use crate::{
    browser_protocol::*,
    clock::{Clock, SystemClock},
    monitor::PageSample,
    service::SharedStore,
};
use std::{
    fs,
    io::{BufReader, Write},
    net::{TcpListener, TcpStream},
    path::Path,
    sync::{
        Arc,
        atomic::{AtomicU64, AtomicUsize, Ordering},
    },
    time::Duration,
};

static NEXT_CLIENT: AtomicU64 = AtomicU64::new(1);
pub fn start(shared: SharedStore, directory: &Path) -> Result<(), String> {
    let listener =
        TcpListener::bind(("127.0.0.1", 0)).map_err(|e| format!("无法创建本机浏览器连接：{e}"))?;
    listener.set_nonblocking(true).map_err(|e| e.to_string())?;
    let mut random = [0u8; 32];
    #[cfg(windows)]
    if unsafe {
        windows_sys::Win32::Security::Cryptography::BCryptGenRandom(
            std::ptr::null_mut(),
            random.as_mut_ptr(),
            random.len() as u32,
            windows_sys::Win32::Security::Cryptography::BCRYPT_USE_SYSTEM_PREFERRED_RNG,
        )
    } < 0
    {
        return Err("无法生成本机连接校验值。".into());
    }
    #[cfg(not(windows))]
    return Err("浏览器连接当前仅支持 Windows。".into());
    let token: String = random.iter().map(|byte| format!("{byte:02x}")).collect();
    let endpoint = Endpoint {
        port: listener.local_addr().map_err(|e| e.to_string())?.port(),
        token: token.clone(),
    };
    let path = directory.join("browser-bridge.endpoint.json");
    let temporary = directory.join(format!("browser-bridge.{}.pending", std::process::id()));
    let bytes = serde_json::to_vec(&endpoint).map_err(|e| e.to_string())?;
    let mut file = fs::File::create(&temporary).map_err(|e| e.to_string())?;
    file.write_all(&bytes)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())?;
    drop(file);
    fs::rename(&temporary, &path).map_err(|e| e.to_string())?;
    let weak = Arc::downgrade(&shared);
    let connections = Arc::new(AtomicUsize::new(0));
    std::thread::spawn(move || {
        while weak.strong_count() > 0 {
            match listener.accept() {
                Ok((stream, address)) => {
                    if !address.ip().is_loopback() || connections.load(Ordering::Relaxed) >= 4 {
                        continue;
                    }
                    let weak = weak.clone();
                    let token = token.clone();
                    let count = connections.clone();
                    count.fetch_add(1, Ordering::Relaxed);
                    let client = NEXT_CLIENT.fetch_add(1, Ordering::Relaxed);
                    std::thread::spawn(move || {
                        let _ = serve(stream, weak.clone(), token, client);
                        if let Some(shared) = weak.upgrade() {
                            if let Ok(mut guard) = shared.lock() {
                                if let Ok(store) = guard.as_mut() {
                                    store.browser_disconnected(client);
                                }
                            }
                        }
                        count.fetch_sub(1, Ordering::Relaxed);
                    });
                }
                Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                    std::thread::sleep(Duration::from_millis(100))
                }
                Err(_) => break,
            }
        }
        // Never remove an endpoint belonging to a replacement process.
        if fs::read(&path).ok().is_some_and(|v| {
            serde_json::from_slice::<Endpoint>(&v)
                .ok()
                .is_some_and(|v| v.token == token)
        }) {
            let _ = fs::remove_file(path);
        }
    });
    Ok(())
}

fn serve(
    mut stream: TcpStream,
    weak: std::sync::Weak<std::sync::Mutex<crate::database::Result<crate::database::Store>>>,
    token: String,
    client: u64,
) -> Result<(), String> {
    // Windows accepted sockets inherit the listener's nonblocking mode.
    // The per-client worker must block between browser heartbeats.
    stream.set_nonblocking(false).map_err(|e| e.to_string())?;
    stream
        .set_read_timeout(Some(Duration::from_secs(20)))
        .map_err(|e| e.to_string())?;
    stream
        .set_write_timeout(Some(Duration::from_secs(2)))
        .map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(stream.try_clone().map_err(|e| e.to_string())?);
    let mut sequence = None;
    while let Some(bytes) = read_line(&mut reader).map_err(|e| e.to_string())? {
        let request: WireRequest =
            serde_json::from_slice(&bytes).map_err(|_| "浏览器消息格式无效。")?;
        if request.token != token
            || request.frame.version != 1
            || sequence.is_some_and(|old| request.frame.sequence <= old)
        {
            return Err("浏览器连接校验失败。".into());
        }
        sequence = Some(request.frame.sequence);
        let Some(shared) = weak.upgrade() else {
            return Ok(());
        };
        let reply = {
            let mut guard = shared.lock().map_err(|_| "数据服务锁异常。")?;
            let store = guard.as_mut().map_err(|e| e.clone())?;
            let config = store.monitor_config()?;
            let frame = request.frame;
            if frame
                .rule_id
                .is_some_and(|id| !config.rules.iter().any(|r| r.id == id))
                && frame.config_revision == config.revision
            {
                return Err("浏览器规则标识无效。".into());
            }
            let compatible = crate::monitor::supports_match_modes(frame.match_modes, &config.rules);
            if !compatible {
                store.warning = Some(
                    "浏览器扩展不支持新网址匹配模式，请更新配套扩展至 0.2.2 并同步站点授权。"
                        .into(),
                );
            } else if store.warning.as_deref()
                == Some("浏览器扩展不支持新网址匹配模式，请更新配套扩展至 0.2.2 并同步站点授权。")
            {
                store.warning = None;
            }
            store.observe_browser_page(
                client,
                PageSample {
                    at: SystemClock::new().now(),
                    focused: frame.focused,
                    rule_id: if compatible { frame.rule_id } else { None },
                    revision: frame.config_revision,
                    ready: frame.ready && compatible,
                },
            );
            if frame.page_activity && compatible {
                store.observe_browser_activity(client);
            }
            serde_json::json!({"connected":true,"config":config,"category_names":store.category_names()?.names,"app":{"identifier":env!("WORKMEMO_IDENTIFIER"),"version":env!("CARGO_PKG_VERSION"),"protocol":1,"page_activity":true,"match_modes":true,"update_required":!compatible}})
        };
        let mut response = serde_json::to_vec(&reply).map_err(|e| e.to_string())?;
        response.push(b'\n');
        stream
            .write_all(&response)
            .and_then(|_| stream.flush())
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
```

## E:\WorkMemo\src-tauri\src\categories.rs

```rust
//! Stable category identities stay in records and URL rules; names are metadata.
use super::*;
use std::collections::{BTreeMap, HashSet};

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct CategoryNames {
    pub revision: i64,
    pub names: BTreeMap<String, String>,
}

impl CategoryNames {
    pub fn validate(&self) -> Result<()> {
        if self.revision < 0 || self.names.len() != 4 {
            return Err("工作类别配置不完整。".into());
        }
        let mut seen = HashSet::new();
        for key in crate::presentation::CATEGORIES {
            let name = self.names.get(key).ok_or("工作类别配置不完整。")?;
            if name.is_empty()
                || name.chars().count() > 20
                || name.chars().any(char::is_control)
                || name.trim() != name
                || !seen.insert(name.to_lowercase())
            {
                return Err("工作名称须为 1 至 20 个字符，不能重复或含控制字符。".into());
            }
        }
        Ok(())
    }
}

impl Store {
    pub fn category_names(&self) -> Result<CategoryNames> {
        let mut stmt = self
            .connection
            .prepare("SELECT category,display_name,revision FROM category_names")
            .map_err(db_error)?;
        let rows = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, i64>(2)?,
                ))
            })
            .map_err(db_error)?;
        let mut names = BTreeMap::new();
        let mut revision = None;
        for row in rows {
            let (key, name, rev) = row.map_err(db_error)?;
            if revision.is_some_and(|old| old != rev) {
                return Err("工作名称版本不一致，未覆盖配置。".into());
            }
            revision = Some(rev);
            names.insert(key, name);
        }
        let result = CategoryNames {
            revision: revision.unwrap_or(0),
            names,
        };
        result.validate()?;
        Ok(result)
    }

    pub fn save_category_names(&mut self, mut input: CategoryNames) -> Result<CategoryNames> {
        for name in input.names.values_mut() {
            *name = name.trim().to_string();
        }
        input.validate()?;
        let current = self.category_names()?;
        if input.revision != current.revision {
            return Err("工作名称已被其他窗口修改，请重新读取后保存。".into());
        }
        if input.names == current.names {
            return Ok(current);
        }
        input.revision = input
            .revision
            .checked_add(1)
            .ok_or("工作名称版本超出范围。")?;
        let tx = self.connection.transaction().map_err(db_error)?;
        // Reserve names outside the user-input alphabet to support name swaps.
        tx.execute(
            "UPDATE category_names SET display_name=category||char(1)",
            [],
        )
        .map_err(db_error)?;
        for (key, name) in &input.names {
            tx.execute(
                "UPDATE category_names SET display_name=?1,revision=?2 WHERE category=?3",
                params![name, input.revision, key],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        Ok(input)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::{TestClock, TestDirectory};

    fn memory() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    fn schema_eight(c: &Connection) {
        for sql in [
            include_str!("../migrations/001_initial.sql"),
            include_str!("../migrations/002_settlement.sql"),
            include_str!("../migrations/003_monitoring.sql"),
            include_str!("../migrations/004_tracking_times.sql"),
            include_str!("../migrations/005_monitor_options.sql"),
            include_str!("../migrations/006_import_sources.sql"),
            include_str!("../migrations/007_dashboard_intent.sql"),
            include_str!("../migrations/008_url_matching.sql"),
        ] {
            c.execute_batch(sql).unwrap();
        }
        c.execute_batch("PRAGMA user_version=8;").unwrap();
    }

    #[test]
    fn rename_trims_supports_swaps_and_preserves_records_rules_and_visual_identity() {
        let mut store = memory();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: Some(0.5),
                remark: "保留".into(),
            })
            .unwrap();
        store
            .connection
            .execute(
                "INSERT INTO work_urls(url_prefix,category) VALUES('https://example.test/','开发')",
                [],
            )
            .unwrap();
        let before = serde_json::to_value(store.active().unwrap()).unwrap();
        let mut config = store.category_names().unwrap();
        config.names.insert("评测".into(), "质检".into());
        config.names.insert("质检".into(), "评测".into());
        config.names.insert("开发".into(), "  编程开发  ".into());
        let saved = store.save_category_names(config).unwrap();
        assert_eq!(saved.revision, 1);
        assert_eq!(saved.names["开发"], "编程开发");
        assert_eq!(
            serde_json::to_value(store.active().unwrap()).unwrap(),
            before
        );
        assert_eq!(store.monitor_config().unwrap().rules[0].category, "开发");
        assert_eq!(
            store.save_category_names(saved.clone()).unwrap().revision,
            1
        );
        assert_eq!(store.category_names().unwrap(), saved);
    }

    #[test]
    fn invalid_and_stale_names_never_replace_saved_config() {
        let mut store = memory();
        let initial = store.category_names().unwrap();
        for invalid in [
            "",
            " \t ",
            "质检",
            "a\nb",
            "abcdefghijklmnopqrstu",
            "零\0字",
        ] {
            let mut input = initial.clone();
            input.names.insert("开发".into(), invalid.into());
            assert!(store.save_category_names(input).is_err(), "{invalid:?}");
            assert_eq!(store.category_names().unwrap(), initial);
        }
        let mut missing = initial.clone();
        missing.names.remove("文档");
        assert!(store.save_category_names(missing).is_err());
        let mut extra = initial.clone();
        extra.names.insert("未知".into(), "新类型".into());
        assert!(store.save_category_names(extra).is_err());
        let mut changed = initial.clone();
        changed.names.insert("开发".into(), "程序".into());
        store.save_category_names(changed).unwrap();
        assert!(store.save_category_names(initial).is_err());
        let mut duplicate = store.category_names().unwrap();
        duplicate.names.insert("开发".into(), "code".into());
        duplicate.names.insert("文档".into(), "CODE".into());
        assert!(store.save_category_names(duplicate).is_err());
    }

    #[test]
    fn failed_name_transaction_rolls_back_temporary_names_and_revision() {
        let mut store = memory();
        let initial = store.category_names().unwrap();
        let mut input = initial.clone();
        input.names.insert("开发".into(), "新名字".into());
        store.connection.execute_batch("CREATE TRIGGER fail_names BEFORE UPDATE ON category_names WHEN NEW.display_name='新名字' BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(store.save_category_names(input).is_err());
        assert_eq!(store.category_names().unwrap(), initial);
    }

    #[test]
    fn eight_to_nine_preserves_children_high_water_mark_and_existing_settings() {
        let c = Connection::open_in_memory().unwrap();
        schema_eight(&c);
        c.execute_batch("INSERT INTO work_records(id,category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status) VALUES(7,'文档',0.25,'历史',1000,2250,1250,1,'FINISHED',1,'COMPLETE');
            INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(7,1000,2250,2250,1250,'CLOSED');
            INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(7,1,3000,'{}','{}');
            INSERT INTO end_reminders VALUES(7,1);
            INSERT INTO work_urls(id,url_prefix,category,match_mode) VALUES(9,'example.test','文档','domain_suffix');
            UPDATE sqlite_sequence SET seq=99 WHERE name='work_records';
            UPDATE monitoring_settings SET idle_warning_seconds=12,idle_end_seconds=23,hold_seconds=55,revision=17;").unwrap();
        let mut store = Store::initialize(c, Box::new(TestClock::new()), None).unwrap();
        assert_eq!(store.record(7).unwrap().duration_ms, 1250);
        assert_eq!(store.record(7).unwrap().quantity, Some(0.25));
        assert_eq!(store.record(7).unwrap().remark, "历史");
        for table in ["work_segments", "record_revisions", "end_reminders"] {
            assert_eq!(
                store
                    .connection
                    .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r
                        .get::<_, i64>(0))
                    .unwrap(),
                1
            );
        }
        assert_eq!(store.monitor_config().unwrap().times.idle_pause_seconds, 22);
        assert_eq!(store.monitor_config().unwrap().times.hold_seconds, 55);
        assert_eq!(store.monitor_config().unwrap().revision, 17);
        assert_eq!(store.monitor_config().unwrap().rules[0].id, 9);
        assert_eq!(
            store
                .connection
                .pragma_query_value(None, "foreign_keys", |r| r.get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(
            store
                .connection
                .query_row("PRAGMA integrity_check", [], |r| r.get::<_, String>(0))
                .unwrap(),
            "ok"
        );
        store.delete_record(7).unwrap();
        for table in ["work_segments", "record_revisions", "end_reminders"] {
            assert_eq!(
                store
                    .connection
                    .query_row(&format!("SELECT COUNT(*) FROM {table}"), [], |r| r
                        .get::<_, i64>(0))
                    .unwrap(),
                0
            );
        }
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: String::new(),
            })
            .unwrap();
        assert_eq!(store.active().unwrap().unwrap().id, 100);
    }

    #[test]
    fn migration_failure_rolls_back_rebuild_and_user_version() {
        let d = TestDirectory::new();
        let c = Connection::open(d.db()).unwrap();
        schema_eight(&c);
        // An invalid reference must be detected without deleting the original child.
        c.pragma_update(None, "foreign_keys", false).unwrap();
        c.execute_batch("INSERT INTO work_segments(record_id,start_time,checkpoint_time,state) VALUES(999,0,0,'OPEN');").unwrap();
        drop(c);
        assert!(Store::open(&d.db(), Box::new(TestClock::new())).is_err());
        let c = Connection::open(d.db()).unwrap();
        assert_eq!(
            c.pragma_query_value(None, "user_version", |r| r.get::<_, i64>(0))
                .unwrap(),
            8
        );
        assert_eq!(
            c.query_row("SELECT COUNT(*) FROM work_segments", [], |r| r
                .get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(c.query_row("SELECT COUNT(*) FROM sqlite_master WHERE name IN ('category_names','work_records_v9')", [], |r| r.get::<_,i64>(0)).unwrap(), 0);
        assert!(
            c.prepare("SELECT idle_pause_seconds FROM monitoring_settings")
                .is_err()
        );
    }

    #[test]
    fn names_persist_across_restart_without_rerunning_migration() {
        let d = TestDirectory::new();
        let saved = {
            let mut store = Store::open(&d.db(), Box::new(TestClock::new())).unwrap();
            let mut input = store.category_names().unwrap();
            input.names.insert("开发".into(), "自定义开发".into());
            store.save_category_names(input).unwrap()
        };
        let store = Store::open(&d.db(), Box::new(TestClock::new())).unwrap();
        assert_eq!(store.category_names().unwrap(), saved);
        assert_eq!(
            store
                .connection
                .pragma_query_value(None, "user_version", |r| r.get::<_, i64>(0))
                .unwrap(),
            9
        );
    }
}
```

## E:\WorkMemo\src-tauri\src\dashboard.rs

```rust
use crate::{
    database::{SettleInput, data_center::DashboardQuery},
    service::{Backend, SharedStore},
};
use serde_json::{Value, json};
use std::{
    io::Read,
    path::PathBuf,
    sync::{
        Arc,
        atomic::{AtomicUsize, Ordering},
    },
};
use tauri::{Emitter, Manager};
use tiny_http::{Header, Method, Request, Response, Server, StatusCode};
type Result<T> = std::result::Result<T, String>;
pub struct DashboardState {
    pub origin: String,
    pub token: String,
}
fn token() -> Result<String> {
    let mut bytes = [0u8; 32];
    #[cfg(windows)]
    {
        use windows_sys::Win32::Security::Cryptography::*;
        if unsafe {
            BCryptGenRandom(
                std::ptr::null_mut(),
                bytes.as_mut_ptr(),
                32,
                BCRYPT_USE_SYSTEM_PREFERRED_RNG,
            )
        } < 0
        {
            return Err("无法生成网页访问令牌".into());
        }
    }
    #[cfg(not(windows))]
    {
        return Err("数据中心目前仅支持Windows".into());
    }
    Ok(bytes.iter().map(|b| format!("{b:02x}")).collect())
}
pub fn initialize(app: &tauri::App) -> Result<DashboardState> {
    let server = Server::http(("127.0.0.1", 0)).map_err(|e| e.to_string())?;
    let address = server.server_addr().to_ip().ok_or("本机地址无效")?;
    let origin = format!("http://{address}");
    let token = token()?;
    // Runtime connection information is outside the backup whitelist and bundles.
    let directory = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let endpoint = directory.join("dashboard.endpoint.json");
    let pending = directory.join("dashboard.endpoint.pending");
    std::fs::write(
        &pending,
        serde_json::to_vec(&json!({"origin":origin,"token":token})).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    std::fs::rename(pending, endpoint).map_err(|e| e.to_string())?;
    let handle = app.handle().clone();
    let shared = app.state::<Backend>().inner.clone();
    let authority = address.to_string();
    let secret = token.clone();
    let base = origin.clone();
    let clients = Arc::new(AtomicUsize::new(0));
    std::thread::spawn(move || {
        for req in server.incoming_requests() {
            if clients.load(Ordering::Relaxed) >= 16 {
                let _ = req.respond(Response::from_string("busy").with_status_code(503));
                continue;
            }
            clients.fetch_add(1, Ordering::Relaxed);
            let count = clients.clone();
            let app = handle.clone();
            let store = shared.clone();
            let host = authority.clone();
            let key = secret.clone();
            let origin = base.clone();
            std::thread::spawn(move || {
                serve(req, &app, &store, &host, &origin, &key);
                count.fetch_sub(1, Ordering::Relaxed);
            });
        }
    });
    Ok(DashboardState { origin, token })
}
fn header<'a>(req: &'a Request, name: &str) -> Option<&'a str> {
    req.headers()
        .iter()
        .find(|h| h.field.as_str().as_str().eq_ignore_ascii_case(name))
        .map(|h| h.value.as_str())
}
fn authorize(
    host: Option<&str>,
    origin: Option<&str>,
    auth: Option<&str>,
    expected_host: &str,
    base: &str,
    key: &str,
    write: bool,
) -> bool {
    if host != Some(expected_host)
        || origin.is_some_and(|v| v != base)
        || (write && origin != Some(base))
    {
        return false;
    }
    let expected = format!("Bearer {key}");
    let actual = auth.unwrap_or("").as_bytes();
    actual.len() == expected.len()
        && actual
            .iter()
            .zip(expected.bytes())
            .fold(0u8, |a, (b, c)| a | (*b ^ c))
            == 0
}
fn serve(
    mut req: Request,
    app: &tauri::AppHandle,
    shared: &SharedStore,
    host: &str,
    origin: &str,
    key: &str,
) {
    let path = req.url().split('?').next().unwrap_or("").to_string();
    if header(&req, "Host") != Some(host) {
        respond(req, 403, b"forbidden".to_vec(), "text/plain");
        return;
    }
    if path.starts_with("/api/") {
        let write = req.method() == &Method::Post;
        if !authorize(
            header(&req, "Host"),
            header(&req, "Origin"),
            header(&req, "Authorization"),
            host,
            origin,
            key,
            write,
        ) || (!write && req.method() != &Method::Get)
        {
            respond(req, 403, b"forbidden".to_vec(), "text/plain");
            return;
        }
        if req.body_length().is_some_and(|n| n > 65536) {
            respond(req, 413, b"too large".to_vec(), "text/plain");
            return;
        }
        let result = (|| -> Result<Value> {
            let mut body = String::new();
            req.as_reader()
                .take(65537)
                .read_to_string(&mut body)
                .map_err(|e| e.to_string())?;
            if body.len() > 65536 {
                return Err("请求过大".into());
            }
            let input: Value = if body.is_empty() {
                json!({})
            } else {
                serde_json::from_str(&body).map_err(|_| "请求格式无效")?
            };
            if path == "/api/meta" && !write {
                let presentation = crate::presentation::load(
                    &app.state::<crate::presentation::PresentationState>().dir,
                )?;
                let guard = shared.lock().map_err(|_| "数据库锁异常")?;
                let store = guard.as_ref().map_err(|e| e.clone())?;
                return Ok(
                    json!({"version":env!("CARGO_PKG_VERSION"),"presentation":presentation,"active":store.active()?,"category_names":store.category_names()?}),
                );
            }
            if !write {
                return Err("此接口需要POST请求".into());
            }
            let mut guard = shared.lock().map_err(|_| "数据库锁异常")?;
            let store = guard.as_mut().map_err(|e| e.clone())?;
            let value = match path.as_str() {
                "/api/query" => store.dashboard_query(
                    serde_json::from_value::<DashboardQuery>(input).map_err(|_| "筛选参数无效")?,
                )?,
                "/api/detail" => {
                    store.dashboard_detail(input["id"].as_i64().ok_or("记录编号无效")?)?
                }
                "/api/save" => {
                    store.settle(
                        serde_json::from_value::<SettleInput>(input).map_err(|_| "保存参数无效")?,
                    )?;
                    json!({"saved":true})
                }
                "/api/delete" => {
                    store.dashboard_delete(
                        input["id"].as_i64().ok_or("记录编号无效")?,
                        input["expected_revision"].as_i64().ok_or("记录版本无效")?,
                    )?;
                    json!({"deleted":true})
                }
                _ => return Err("接口不存在".into()),
            };
            if ["/api/save", "/api/delete"].contains(&path.as_str()) {
                let _ = app.emit("workmemo:data-changed", ());
            }
            Ok(value)
        })();
        match result {
            Ok(value) => respond(
                req,
                200,
                serde_json::to_vec(&value).unwrap_or_default(),
                "application/json",
            ),
            Err(error) => respond(
                req,
                400,
                serde_json::to_vec(&json!({"error":error})).unwrap_or_default(),
                "application/json",
            ),
        };
    } else {
        if req.method() != &Method::Get {
            respond(req, 405, Vec::new(), "text/plain");
            return;
        }
        let asset = if path == "/" || path == "/dashboard" {
            "index.html"
        } else {
            path.trim_start_matches('/')
        };
        if asset.contains("..")
            || asset.contains('%')
            || asset.contains('\\')
            || !(asset == "index.html" || asset == "workmemo.png" || asset.starts_with("assets/"))
        {
            respond(req, 404, Vec::new(), "text/plain");
            return;
        }
        if let Some(content) = app.asset_resolver().get(asset.into()) {
            respond(req, 200, content.bytes, &content.mime_type);
            return;
        }
        #[cfg(debug_assertions)]
        {
            let file = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
                .join("../dist")
                .join(asset);
            if let Ok(bytes) = std::fs::read(file) {
                respond(
                    req,
                    200,
                    bytes,
                    if asset.ends_with(".js") {
                        "text/javascript"
                    } else if asset.ends_with(".css") {
                        "text/css"
                    } else {
                        "text/html"
                    },
                );
                return;
            }
        }
        respond(req, 404, Vec::new(), "text/plain");
    }
}
fn respond(req: Request, status: u16, body: Vec<u8>, mime: &str) {
    let mut response = Response::from_data(body).with_status_code(StatusCode(status));
    for (key, value) in [
        ("Content-Type", mime),
        ("Cache-Control", "no-store"),
        ("X-Content-Type-Options", "nosniff"),
        ("Referrer-Policy", "no-referrer"),
        (
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
        ),
    ] {
        response.add_header(Header::from_bytes(key, value).unwrap());
    }
    let _ = req.respond(response);
}
fn address(app: &tauri::AppHandle, view: &str, scope: &str) -> String {
    let state = app.state::<DashboardState>();
    let view = if ["today", "pending", "all"].contains(&view) {
        view
    } else {
        "all"
    };
    let scope = if scope == "demo" { "demo" } else { "real" };
    format!(
        "{}/dashboard#token={}&view={view}&scope={scope}",
        state.origin, state.token
    )
}
fn chrome_path() -> Option<PathBuf> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::System::Registry::*;
        let sub: Vec<u16> = "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe\0"
            .encode_utf16()
            .collect();
        for key in [HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE] {
            let mut data = vec![0u16; 32768];
            let mut size = (data.len() * 2) as u32;
            if unsafe {
                RegGetValueW(
                    key,
                    sub.as_ptr(),
                    std::ptr::null(),
                    RRF_RT_REG_SZ,
                    std::ptr::null_mut(),
                    data.as_mut_ptr() as _,
                    &mut size,
                )
            } == 0
            {
                let n = data.iter().position(|c| *c == 0).unwrap_or(0);
                let p = PathBuf::from(String::from_utf16_lossy(&data[..n]));
                if p.is_file() {
                    return Some(p);
                }
            }
        }
    }
    for var in ["LOCALAPPDATA", "PROGRAMFILES", "PROGRAMFILES(X86)"] {
        if let Some(root) = std::env::var_os(var) {
            let path = PathBuf::from(root).join("Google/Chrome/Application/chrome.exe");
            if path.is_file() {
                return Some(path);
            }
        }
    }
    None
}
pub fn open_impl(
    app: &tauri::AppHandle,
    view: &str,
    scope: &str,
    default_browser: bool,
) -> Result<()> {
    let url = address(app, view, scope);
    if default_browser {
        #[cfg(windows)]
        {
            use windows_sys::Win32::UI::Shell::ShellExecuteW;
            let verb: Vec<u16> = "open\0".encode_utf16().collect();
            let file: Vec<u16> = url.encode_utf16().chain(Some(0)).collect();
            let result = unsafe {
                ShellExecuteW(
                    std::ptr::null_mut(),
                    verb.as_ptr(),
                    file.as_ptr(),
                    std::ptr::null(),
                    std::ptr::null(),
                    1,
                )
            };
            if result as isize <= 32 {
                return Err("无法打开默认浏览器，请复制网页地址。".into());
            }
            return Ok(());
        }
        #[cfg(not(windows))]
        {
            return Err("仅支持Windows浏览器启动".into());
        }
    }
    let chrome = chrome_path().ok_or("未找到Chrome，请选择默认浏览器或复制数据中心地址。")?;
    let mut command = std::process::Command::new(chrome);
    command.arg(url);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    command
        .spawn()
        .map_err(|_| "无法启动Chrome，请选择默认浏览器或复制地址。")?;
    Ok(())
}
#[tauri::command]
pub async fn open_dashboard(
    app: tauri::AppHandle,
    view: Option<String>,
    scope: Option<String>,
    default_browser: Option<bool>,
) -> Result<()> {
    tauri::async_runtime::spawn_blocking(move || {
        open_impl(
            &app,
            view.as_deref().unwrap_or("all"),
            scope.as_deref().unwrap_or("real"),
            default_browser.unwrap_or(false),
        )
    })
    .await
    .map_err(|e| e.to_string())?
}
#[tauri::command]
pub fn get_dashboard_address(
    app: tauri::AppHandle,
    view: Option<String>,
    scope: Option<String>,
) -> String {
    address(
        &app,
        view.as_deref().unwrap_or("all"),
        scope.as_deref().unwrap_or("real"),
    )
}
#[tauri::command]
pub async fn get_today_workload(
    state: tauri::State<'_, Backend>,
) -> Result<Vec<crate::database::data_center::TodayWorkload>> {
    crate::service::access(state.inner.clone(), |s| s.today_workload()).await
}
#[tauri::command]
pub async fn seed_demo_data(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<i64> {
    let result = crate::service::access(state.inner.clone(), |s| s.seed_demo()).await?;
    let _ = app.emit("workmemo:data-changed", ());
    Ok(result)
}
#[tauri::command]
pub async fn clear_demo_data(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<usize> {
    let result = crate::service::access(state.inner.clone(), |s| s.clear_demo()).await?;
    let _ = app.emit("workmemo:data-changed", ());
    Ok(result)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn authentication_rejects_cross_origin_and_wrong_host() {
        let key = "test-secret";
        assert!(authorize(
            Some("127.0.0.1:1234"),
            Some("http://127.0.0.1:1234"),
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            true
        ));
        assert!(!authorize(
            Some("evil:1234"),
            None,
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            false
        ));
        assert!(!authorize(
            Some("127.0.0.1:1234"),
            Some("https://evil.test"),
            Some("Bearer test-secret"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            true
        ));
        assert!(!authorize(
            Some("127.0.0.1:1234"),
            None,
            Some("Bearer wrong"),
            "127.0.0.1:1234",
            "http://127.0.0.1:1234",
            key,
            false
        ));
    }
}

pub fn cleanup(app: &tauri::AppHandle) {
    if let (Some(state), Ok(dir)) = (
        app.try_state::<DashboardState>(),
        app.path().app_local_data_dir(),
    ) {
        let path = dir.join("dashboard.endpoint.json");
        if let Ok(bytes) = std::fs::read(&path) {
            if serde_json::from_slice::<Value>(&bytes)
                .ok()
                .is_some_and(|v| v["token"] == state.token)
            {
                let _ = std::fs::remove_file(path);
            }
        }
    }
}
```

## E:\WorkMemo\src-tauri\src\data_tools.rs

```rust
use super::*;
use crate::{
    clock::SystemClock,
    service::{self, Backend},
};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::PathBuf};
use tauri::{Emitter, Manager};
const FILES: [&str; 4] = [
    "appearance.json",
    "window-layout.json",
    "island.json",
    "presentation.json",
];
#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Archive {
    version: u32,
    database: Vec<u8>,
    settings: BTreeMap<String, Vec<u8>>,
}
#[derive(Serialize, Default)]
pub struct ImportReport {
    pub source: Option<String>,
    pub conflict_ids: Vec<i64>,
    pub skipped_active_ids: Vec<i64>,
    pub records: usize,
    pub pending: usize,
    pub active: usize,
    pub imported: usize,
    pub duplicates: usize,
    pub conflicts: usize,
    pub skipped_active: usize,
    pub backup: Option<String>,
}
struct Scratch(PathBuf);
impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_file(self.0.with_extension("lock"));
        for suffix in ["", "-wal", "-shm"] {
            let _ = std::fs::remove_file(format!("{}{suffix}", self.0.display()));
        }
    }
}
fn scratch(dir: &Path) -> Result<Scratch> {
    let n = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    Ok(Scratch(dir.join(format!(
        "snapshot-{}-{n}.sqlite3",
        std::process::id()
    ))))
}
fn configs(dir: &Path) -> Result<BTreeMap<String, Vec<u8>>> {
    let mut m = BTreeMap::new();
    for name in FILES {
        match std::fs::read(dir.join(name)) {
            Ok(b) => {
                m.insert(name.into(), b);
            }
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
            Err(e) => return Err(e.to_string()),
        }
    }
    if let Some(bytes) = m.get("presentation.json") {
        let p: crate::presentation::Presentation =
            serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
        p.validate()?;
        if let Some(bg) = p.background {
            let bytes =
                std::fs::read(dir.join("backgrounds").join(&bg.file)).map_err(|e| e.to_string())?;
            m.insert(format!("backgrounds/{}", bg.file), bytes);
        }
    }
    Ok(m)
}
fn validate_settings(settings: &BTreeMap<String, Vec<u8>>) -> Result<()> {
    for (name, b) in settings {
        if let Some(file) = name.strip_prefix("backgrounds/") {
            if !crate::presentation::image_name(file) {
                return Err("备份图片路径无效".into());
            }
            crate::presentation::validate_image(b)?;
            continue;
        }
        if !FILES.contains(&name.as_str()) || b.len() > 65536 {
            return Err("备份设置无效。".into());
        }
        let v: serde_json::Value = serde_json::from_slice(b).map_err(|e| e.to_string())?;
        match name.as_str() {
            "presentation.json" => {
                let p: crate::presentation::Presentation =
                    serde_json::from_slice(b).map_err(|e| e.to_string())?;
                p.validate()?;
                if let Some(bg) = p.background {
                    if !settings.contains_key(&format!("backgrounds/{}", bg.file)) {
                        return Err("备份缺少背景图片".into());
                    }
                }
            }
            "appearance.json" => {
                let a: crate::appearance::Appearance =
                    serde_json::from_value(v).map_err(|e| e.to_string())?;
                if ![1, 2].contains(&a.version) || !(80..=100).contains(&a.opacity) {
                    return Err("备份外观无效。".into());
                }
            }
            "island.json" => {
                crate::desktop::validate_island(b)?;
            }
            "window-layout.json" => {
                crate::windows::decode_layout(b)?;
                if !["compact", "comfortable"].contains(&v["density"].as_str().unwrap_or("")) {
                    return Err("备份布局无效。".into());
                }
            }
            _ => unreachable!(),
        }
    }
    Ok(())
}
fn write_configs(dir: &Path, settings: &BTreeMap<String, Vec<u8>>) -> Result<()> {
    validate_settings(settings)?;
    std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    for (name, bytes) in settings
        .iter()
        .filter(|(n, _)| n.starts_with("backgrounds/"))
    {
        let path = dir.join(name);
        std::fs::create_dir_all(path.parent().ok_or("图片目录无效")?).map_err(|e| e.to_string())?;
        let pending = path.with_extension("restore-pending");
        std::fs::write(&pending, bytes).map_err(|e| e.to_string())?;
        std::fs::rename(pending, path).map_err(|e| e.to_string())?;
    }
    for name in FILES {
        let path = dir.join(name);
        if let Some(b) = settings.get(name) {
            let temp = path.with_extension("restore-pending");
            std::fs::write(&temp, b).map_err(|e| e.to_string())?;
            std::fs::rename(temp, path).map_err(|e| e.to_string())?;
        } else if path.exists() {
            std::fs::remove_file(path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}
impl Store {
    fn archive(&mut self, dir: &Path) -> Result<Archive> {
        self.checkpoint()?;
        let t = scratch(dir)?;
        self.connection
            .backup("main", &t.0, None::<fn(rusqlite::backup::Progress)>)
            .map_err(db_error)?;
        Ok(Archive {
            version: 2,
            database: std::fs::read(&t.0).map_err(|e| e.to_string())?,
            settings: configs(dir)?,
        })
    }
    fn apply_image(&mut self, image: &Path) -> Result<()> {
        self.connection
            .execute(
                "ATTACH DATABASE ?1 AS restore_source",
                [image.to_string_lossy().as_ref()],
            )
            .map_err(db_error)?;
        let result = (|| {
            let tx = self
                .connection
                .transaction_with_behavior(TransactionBehavior::Immediate)
                .map_err(db_error)?;
            let tables = [
                "category_names",
                "import_sources",
                "end_reminders",
                "record_revisions",
                "work_segments",
                "work_urls",
                "monitoring_settings",
                "work_records",
            ];
            for table in tables {
                tx.execute(&format!("DELETE FROM main.{table}"), [])
                    .map_err(db_error)?;
            }
            for table in tables.into_iter().rev() {
                tx.execute(
                    &format!("INSERT INTO main.{table} SELECT * FROM restore_source.{table}"),
                    [],
                )
                .map_err(db_error)?;
            }
            tx.execute("DELETE FROM main.sqlite_sequence", [])
                .map_err(db_error)?;
            tx.execute(
                "INSERT INTO main.sqlite_sequence SELECT * FROM restore_source.sqlite_sequence",
                [],
            )
            .map_err(db_error)?;
            let invalid: Option<String> = tx
                .query_row(
                    "SELECT \"table\" FROM pragma_foreign_key_check LIMIT 1",
                    [],
                    |r| r.get(0),
                )
                .optional()
                .map_err(db_error)?;
            if invalid.is_some() {
                return Err("备份关联数据无效。".into());
            }
            tx.commit().map_err(db_error)
        })();
        let _ = self
            .connection
            .execute("DETACH DATABASE restore_source", []);
        result?;
        self.segment = None;
        self.monitor = Runtime::default();
        self.monitor.config = self.monitor_config()?;
        self.activate_monitoring();
        Ok(())
    }
}
fn read_archive(path: &Path) -> Result<Archive> {
    if std::fs::metadata(path).map_err(|e| e.to_string())?.len() > 256 * 1024 * 1024 {
        return Err("备份文件超过256MB限制。".into());
    }
    let a: Archive = serde_json::from_slice(&std::fs::read(path).map_err(|e| e.to_string())?)
        .map_err(|_| "备份格式无效。")?;
    if ![1, 2].contains(&a.version) || a.database.len() > 128 * 1024 * 1024 {
        return Err("备份版本或大小不受支持。".into());
    }
    validate_settings(&a.settings)?;
    Ok(a)
}
fn checked_image(a: &Archive, dir: &Path) -> Result<Scratch> {
    let t = scratch(dir)?;
    std::fs::write(&t.0, &a.database).map_err(|e| e.to_string())?;
    let c = Connection::open(&t.0).map_err(db_error)?;
    let ok: String = c
        .query_row("PRAGMA integrity_check", [], |r| r.get(0))
        .map_err(db_error)?;
    if ok != "ok" {
        return Err("备份数据库损坏。".into());
    }
    let store = Store::initialize(c, Box::new(SystemClock::new()), None)?;
    let invalid: Option<String> = store
        .connection
        .query_row(
            "SELECT \"table\" FROM pragma_foreign_key_check LIMIT 1",
            [],
            |r| r.get(0),
        )
        .optional()
        .map_err(db_error)?;
    if invalid.is_some() {
        return Err("备份外键校验失败。".into());
    }
    store.monitor_config()?;
    for record in store
        .connection
        .prepare(&format!("SELECT {COLUMNS} FROM work_records"))
        .map_err(db_error)?
        .query_map([], read_record)
        .map_err(db_error)?
    {
        record.map_err(db_error)?;
    }
    drop(store);
    Ok(t)
}
fn save_archive(path: &Path, a: &Archive) -> Result<()> {
    let parent = path.parent().ok_or("备份路径无效")?;
    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let t = path.with_extension("workmemo-pending");
    let mut f = std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&t)
        .map_err(|e| e.to_string())?;
    use std::io::Write;
    let result = (|| {
        serde_json::to_writer(&mut f, a).map_err(|e| e.to_string())?;
        f.flush()
            .and_then(|_| f.sync_all())
            .map_err(|e| e.to_string())
    })();
    drop(f);
    if result.is_err() {
        let _ = std::fs::remove_file(&t);
        return result;
    }
    std::fs::rename(t, path).map_err(|e| e.to_string())
}
fn automatic_backup(store: &mut Store, dir: &Path) -> Result<PathBuf> {
    let n = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_nanos();
    let path = dir
        .join("backups")
        .join(format!("before-change-{n}.workmemo"));
    save_archive(&path, &store.archive(dir)?)?;
    Ok(path)
}
// A durable rollback journal precedes every restore. Startup restores the old
// snapshot if a process stops between file writes and the SQLite commit.
pub fn recover_pending(store: &mut Store, dir: &Path) -> Result<()> {
    let p = dir.join("restore-journal.workmemo");
    if p.exists() {
        let a = read_archive(&p)?;
        let image = checked_image(&a, dir)?;
        store.apply_image(&image.0)?;
        write_configs(dir, &a.settings)?;
        std::fs::remove_file(p).map_err(|e| e.to_string())?;
    }
    Ok(())
}
pub struct ArchiveSelection(pub std::sync::Mutex<Option<Archive>>);
#[tauri::command]
pub async fn inspect_backup(app: tauri::AppHandle) -> Result<Option<ImportReport>> {
    let dir = config_dir(&app)?;
    tauri::async_runtime::spawn_blocking(move || {
        let Some(path) = native_file(false)? else {
            return Ok(None);
        };
        let a = read_archive(&path)?;
        let image = checked_image(&a, &dir)?;
        let source = Store::open(&image.0, Box::new(SystemClock::new()))?;
        let mut r = report(&source)?;
        r.backup = Some(path.display().to_string());
        *app.state::<ArchiveSelection>()
            .0
            .lock()
            .map_err(|_| "备份选择锁异常")? = Some(a);
        Ok(Some(r))
    })
    .await
    .map_err(|e| e.to_string())?
}
fn native_file(save: bool) -> Result<Option<PathBuf>> {
    #[cfg(windows)]
    {
        use windows_sys::Win32::UI::Controls::Dialogs::*;
        let mut file = vec![0u16; 32768];
        let filter: Vec<u16> = "WorkMemo Backup\0*.workmemo\0\0".encode_utf16().collect();
        let extension: Vec<u16> = "workmemo\0".encode_utf16().collect();
        let mut ofn: OPENFILENAMEW = unsafe { std::mem::zeroed() };
        ofn.lStructSize = std::mem::size_of::<OPENFILENAMEW>() as u32;
        ofn.lpstrFile = file.as_mut_ptr();
        ofn.nMaxFile = file.len() as u32;
        ofn.lpstrFilter = filter.as_ptr();
        ofn.lpstrDefExt = extension.as_ptr();
        ofn.Flags = OFN_EXPLORER
            | OFN_NOCHANGEDIR
            | if save {
                OFN_OVERWRITEPROMPT
            } else {
                OFN_FILEMUSTEXIST
            };
        let ok = unsafe {
            if save {
                GetSaveFileNameW(&mut ofn)
            } else {
                GetOpenFileNameW(&mut ofn)
            }
        };
        if ok == 0 {
            let e = unsafe { CommDlgExtendedError() };
            return if e == 0 {
                Ok(None)
            } else {
                Err(format!("文件选择失败：{e}"))
            };
        }
        let n = file.iter().position(|c| *c == 0).ok_or("路径无效")?;
        Ok(Some(PathBuf::from(
            String::from_utf16(&file[..n]).map_err(|e| e.to_string())?,
        )))
    }
    #[cfg(not(windows))]
    {
        let _ = save;
        Err("文件选择目前仅支持Windows。".into())
    }
}
fn config_dir(app: &tauri::AppHandle) -> Result<PathBuf> {
    {
        let d = app.path().app_config_dir().map_err(|e| e.to_string())?;
        std::fs::create_dir_all(&d).map_err(|e| e.to_string())?;
        Ok(d)
    }
}
#[tauri::command]
pub async fn create_backup(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<String>> {
    let dir = config_dir(&app)?;
    let shared = state.inner.clone();
    tauri::async_runtime::spawn_blocking(move || {
        let Some(path) = native_file(true)? else {
            return Ok(None);
        };
        let mut guard = shared.lock().map_err(|_| "数据锁异常")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        save_archive(&path, &store.archive(&dir)?)?;
        Ok(Some(path.display().to_string()))
    })
    .await
    .map_err(|e| e.to_string())?
}
#[tauri::command]
pub async fn restore_backup(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<String>> {
    if app
        .state::<crate::windows::WindowState>()
        .dirty
        .lock()
        .map_err(|_| "草稿状态异常")?
        .iter()
        .any(|(k, v)| k != "settings" && *v)
    {
        return Err("请先保存或放弃其他窗口中的修改，再恢复。".into());
    }
    let selected = app
        .state::<ArchiveSelection>()
        .0
        .lock()
        .map_err(|_| "备份选择锁异常")?
        .take()
        .ok_or("请先选择并校验备份。")?;
    let dir = config_dir(&app)?;
    let handle = app.clone();
    let result = service::access(state.inner.clone(), move |store| {
        if store.active()?.is_some_and(|r| !r.is_paused) {
            return Err("请先暂停当前计时，再恢复备份。".into());
        }
        let a = selected;
        let image = checked_image(&a, &dir)?;
        let backup = automatic_backup(store, &dir)?;
        let journal = dir.join("restore-journal.workmemo");
        save_archive(&journal, &store.archive(&dir)?)?;
        let result = write_configs(&dir, &a.settings).and_then(|_| store.apply_image(&image.0));
        if let Err(e) = result {
            recover_pending(store, &dir)?;
            return Err(format!("恢复失败，已回滚：{e}"));
        }
        std::fs::remove_file(journal).map_err(|e| e.to_string())?;
        Ok(Some(format!(
            "已恢复；原数据备份：{}。请重新打开设置以加载恢复后的界面设置。",
            backup.display()
        )))
    })
    .await;
    if matches!(result, Ok(Some(_))) {
        crate::windows::reload(&handle)?;
        crate::desktop::reload_island(&handle)?;
        let _ = handle.emit("workmemo:layout-changed", ());
        let _ = handle.emit("workmemo:data-changed", ());
        let _ = handle.emit("workmemo:appearance-changed", ());
        let _ = handle.emit("workmemo:presentation-changed", ());
    }
    result
}
fn preview_path(app: &tauri::AppHandle) -> Result<PathBuf> {
    let dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;
    #[cfg(debug_assertions)]
    if app.config().identifier.starts_with("com.workmemo.test.")
        && app.config().identifier != "com.workmemo.test.monitor"
    {
        // Debug QA profiles never inspect the user's actual preview records.
        return Ok(dir
            .parent()
            .ok_or("数据目录无效")?
            .join(format!("{}.migration-source", app.config().identifier))
            .join("workmemo.sqlite3"));
    }
    Ok(dir
        .parent()
        .ok_or("数据目录无效")?
        .join("com.workmemo.test.monitor")
        .join("workmemo.sqlite3"))
}
fn preview_copy(path: &Path, dir: &Path) -> Result<(Store, Scratch, File)> {
    if !path.is_file() {
        return Err("未发现预览数据。".into());
    }
    #[cfg(windows)]
    let lock = {
        use std::os::windows::fs::OpenOptionsExt;
        std::fs::OpenOptions::new()
            .read(true)
            .write(true)
            .create(true)
            .truncate(false)
            .share_mode(0)
            .open(path.with_extension("lock"))
            .map_err(|_| "请从托盘退出预览程序后再迁移。")?
    };
    #[cfg(not(windows))]
    let lock = File::open(path).map_err(|e| e.to_string())?;
    let source = Connection::open_with_flags(path, rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY)
        .map_err(db_error)?;
    let t = scratch(dir)?;
    source
        .backup("main", &t.0, None::<fn(rusqlite::backup::Progress)>)
        .map_err(db_error)?;
    let store = Store::initialize(
        Connection::open(&t.0).map_err(db_error)?,
        Box::new(SystemClock::new()),
        None,
    )?;
    Ok((store, t, lock))
}
fn report(source: &Store) -> Result<ImportReport> {
    let (records,pending,active)=source.connection.query_row("SELECT COUNT(*),COALESCE(SUM(settlement_status='PENDING'),0),COALESCE(SUM(status='WORKING'),0) FROM work_records",[],|r|Ok((r.get::<_,i64>(0)? as usize,r.get::<_,i64>(1)? as usize,r.get::<_,i64>(2)? as usize))).map_err(db_error)?;
    Ok(ImportReport {
        records,
        pending,
        active,
        ..Default::default()
    })
}
fn fingerprint(source: &Store, id: i64) -> Result<String> {
    let record = serde_json::to_value(source.record(id)?).map_err(|e| e.to_string())?;
    let segments:Vec<String>=source.connection.prepare("SELECT printf('%lld:%lld:%lld:%lld:%s',start_time,COALESCE(end_time,0),checkpoint_time,duration_ms,state) FROM work_segments WHERE record_id=?1 ORDER BY id").map_err(db_error)?.query_map([id],|r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
    let revisions:Vec<String>=source.connection.prepare("SELECT before_json||after_json FROM record_revisions WHERE record_id=?1 ORDER BY revision").map_err(db_error)?.query_map([id],|r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
    serde_json::to_string(&(record, segments, revisions)).map_err(|e| e.to_string())
}
fn copy_row(
    tx: &rusqlite::Transaction,
    source: &Connection,
    table: &str,
    source_id: i64,
    new_parent: Option<i64>,
) -> Result<i64> {
    let cols: Vec<String> = source
        .prepare(&format!("PRAGMA table_info({table})"))
        .map_err(db_error)?
        .query_map([], |r| r.get(1))
        .map_err(db_error)?
        .collect::<rusqlite::Result<_>>()
        .map_err(db_error)?;
    let mut vals: Vec<rusqlite::types::Value> = source
        .query_row(
            &format!("SELECT {} FROM {table} WHERE id=?1", cols.join(",")),
            [source_id],
            |r| (0..cols.len()).map(|i| r.get(i)).collect(),
        )
        .map_err(db_error)?;
    vals[0] = rusqlite::types::Value::Null;
    if let Some(parent) = new_parent {
        if let Some(i) = cols.iter().position(|n| n == "record_id") {
            vals[i] = parent.into();
        }
        if table == "record_revisions" {
            for field in ["before_json", "after_json"] {
                let i = cols
                    .iter()
                    .position(|n| n == field)
                    .ok_or("修正记录格式无效")?;
                if let rusqlite::types::Value::Text(text) = &vals[i] {
                    let mut json: serde_json::Value =
                        serde_json::from_str(text).map_err(|e| e.to_string())?;
                    if let Some(id) = json.get_mut("id") {
                        *id = parent.into();
                    }
                    vals[i] = serde_json::to_string(&json)
                        .map_err(|e| e.to_string())?
                        .into();
                }
            }
        }
    }
    let marks = vec!["?"; cols.len()].join(",");
    tx.execute(
        &format!("INSERT INTO {table}({}) VALUES({marks})", cols.join(",")),
        rusqlite::params_from_iter(vals),
    )
    .map_err(db_error)?;
    Ok(tx.last_insert_rowid())
}
#[cfg(test)]
fn merge(target: &mut Store, source: &Store) -> Result<ImportReport> {
    merge_options(target, source, false)
}
fn merge_options(target: &mut Store, source: &Store, include_config: bool) -> Result<ImportReport> {
    if include_config && target.active()?.is_some() {
        return Err("当前有未结束任务，请先只迁移记录；监测配置需在任务处理后导入。".into());
    }
    let config = if include_config {
        Some(source.monitor_config()?)
    } else {
        None
    };
    let names = if include_config {
        Some(source.category_names()?)
    } else {
        None
    };
    let mut r = report(source)?;
    let active = target.active()?.is_some();
    let ids: Vec<i64> = source
        .connection
        .prepare("SELECT id FROM work_records ORDER BY id")
        .map_err(db_error)?
        .query_map([], |r| r.get(0))
        .map_err(db_error)?
        .collect::<rusqlite::Result<_>>()
        .map_err(db_error)?;
    let tx = target
        .connection
        .transaction_with_behavior(TransactionBehavior::Immediate)
        .map_err(db_error)?;
    for id in ids {
        let record = source.record(id)?;
        let key = format!("preview:{id}:{}", record.start_time);
        let fp = fingerprint(source, id)?;
        let previous: Option<String> = tx
            .query_row(
                "SELECT fingerprint FROM import_sources WHERE source_key=?1",
                [&key],
                |r| r.get(0),
            )
            .optional()
            .map_err(db_error)?;
        if let Some(old) = previous {
            if old == fp {
                r.duplicates += 1
            } else {
                r.conflicts += 1;
                r.conflict_ids.push(id);
            }
            continue;
        }
        if active && record.status == "WORKING" {
            r.skipped_active += 1;
            r.skipped_active_ids.push(id);
            continue;
        }
        let new_id = copy_row(&tx, &source.connection, "work_records", id, None)?;
        for table in ["work_segments", "record_revisions"] {
            let children: Vec<i64> = source
                .connection
                .prepare(&format!(
                    "SELECT id FROM {table} WHERE record_id=?1 ORDER BY id"
                ))
                .map_err(db_error)?
                .query_map([id], |r| r.get(0))
                .map_err(db_error)?
                .collect::<rusqlite::Result<_>>()
                .map_err(db_error)?;
            for child in children {
                copy_row(&tx, &source.connection, table, child, Some(new_id))?;
            }
        }
        if record.status == "FINISHED" && record.settlement_status == "PENDING" {
            tx.execute(
                "INSERT INTO end_reminders(record_id,dismissed) VALUES(?1,1)",
                [new_id],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "INSERT INTO import_sources VALUES(?1,?2,?3)",
            params![key, new_id, fp],
        )
        .map_err(db_error)?;
        r.imported += 1;
    }
    if let Some(c) = config {
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for rule in c.rules {
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
                params![rule.url_prefix, rule.category, rule.match_mode],
            )
            .map_err(db_error)?;
        }
        tx.execute("UPDATE monitoring_settings SET enabled=0,revision=revision+1,idle_warning_seconds=?1,idle_end_seconds=?2,away_pause_seconds=?3,hold_seconds=?4,poll_interval_seconds=?5,auto_resume_manual=?6,browsing_only=?7,idle_pause_seconds=?8 WHERE id=1",params![c.times.idle_warning_seconds,c.times.idle_end_seconds,c.times.away_pause_seconds,c.times.hold_seconds,c.poll_interval_seconds,c.auto_resume_manual,c.browsing_only,c.times.idle_pause_seconds]).map_err(db_error)?;
    }
    if let Some(names) = names {
        // Temporarily use unique names so swaps never violate the UNIQUE constraint.
        tx.execute(
            "UPDATE category_names SET display_name=category||char(1)",
            [],
        )
        .map_err(db_error)?;
        for (category, name) in names.names {
            tx.execute(
                "UPDATE category_names SET display_name=?1,revision=revision+1 WHERE category=?2",
                params![name, category],
            )
            .map_err(db_error)?;
        }
    }
    tx.commit().map_err(db_error)?;
    target.monitor.config = target.monitor_config()?;
    if include_config {
        target.monitor.page = None;
        target.monitor.entered_at = None;
        target.monitor.page_was_matched = false;
    }
    Ok(r)
}
#[tauri::command]
pub async fn preview_migration(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
) -> Result<Option<ImportReport>> {
    let path = preview_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }
    let dir = config_dir(&app)?;
    service::access(state.inner.clone(), move |_| {
        let (s, _t, _lock) = preview_copy(&path, &dir)?;
        let mut r = report(&s)?;
        r.source = Some(path.display().to_string());
        Ok(Some(r))
    })
    .await
}
#[tauri::command]
pub async fn import_preview(
    app: tauri::AppHandle,
    state: tauri::State<'_, Backend>,
    include_config: bool,
) -> Result<ImportReport> {
    let path = preview_path(&app)?;
    let dir = config_dir(&app)?;
    let result = service::access(state.inner.clone(), move |store| {
        let (source, _temp, _lock) = preview_copy(&path, &dir)?;
        let backup = automatic_backup(store, &dir)?;
        let mut r = merge_options(store, &source, include_config)?;
        r.source = Some(path.display().to_string());
        r.backup = Some(backup.display().to_string());
        Ok(r)
    })
    .await;
    if result.is_ok() {
        let _ = app.emit("workmemo:data-changed", ());
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::{TestClock, TestDirectory};
    #[test]
    fn merge_is_idempotent_conflicts_do_not_replace_and_restore_rolls_back() {
        let mut a = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        let mut b = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        a.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "original".into(),
        })
        .unwrap();
        a.finish(1).unwrap();
        assert_eq!(merge(&mut b, &a).unwrap().imported, 1);
        assert_eq!(merge(&mut b, &a).unwrap().duplicates, 1);
        a.connection
            .execute("UPDATE work_records SET remark='changed' WHERE id=1", [])
            .unwrap();
        assert_eq!(merge(&mut b, &a).unwrap().conflicts, 1);
        assert_eq!(b.record(1).unwrap().remark, "original");
        let d = TestDirectory::new();
        let archive = b.archive(d.db().parent().unwrap()).unwrap();
        let image = checked_image(&archive, d.db().parent().unwrap()).unwrap();
        b.connection
            .execute("UPDATE work_records SET remark='temporary' WHERE id=1", [])
            .unwrap();
        b.apply_image(&image.0).unwrap();
        assert_eq!(b.record(1).unwrap().remark, "original");
    }
    #[test]
    fn backup_restore_keeps_names_and_idle_threshold_while_records_only_import_keeps_local_names() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        let mut names = source.category_names().unwrap();
        names.names.insert("开发".into(), "编程任务".into());
        source.save_category_names(names).unwrap();
        source
            .connection
            .execute("UPDATE monitoring_settings SET idle_pause_seconds=25", [])
            .unwrap();
        let archive = source.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        let mut target = empty();
        merge(&mut target, &source).unwrap();
        assert_eq!(target.category_names().unwrap().names["开发"], "开发");
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.category_names().unwrap(),
            source.category_names().unwrap()
        );
        assert_eq!(
            target.monitor_config().unwrap().times.idle_pause_seconds,
            25
        );
        assert_eq!(target.record(1).unwrap().category, "开发");
    }
    #[test]
    fn legacy_schema_backup_and_new_rule_modes_restore() {
        let d = TestDirectory::new();
        let dir = d.db().parent().unwrap().to_path_buf();
        let mut source = empty();
        source.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode) VALUES('cn-beijing-vpc.fcapp.run','开发','domain_suffix')",[]).unwrap();
        let image = checked_image(&source.archive(&dir).unwrap(), &dir).unwrap();
        let mut target = empty();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.monitor_config().unwrap().rules[0].match_mode,
            "domain_suffix"
        );
        source.connection.execute_batch("DELETE FROM work_urls; ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; INSERT INTO work_urls(url_prefix,category) VALUES('https://example.com/','开发'); ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;").unwrap();
        let image = checked_image(&source.archive(&dir).unwrap(), &dir).unwrap();
        target.apply_image(&image.0).unwrap();
        assert_eq!(
            target.monitor_config().unwrap().rules[0].match_mode,
            "path_prefix"
        );
    }
    fn empty() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    fn start(s: &mut Store) {
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "test".into(),
        })
        .unwrap();
    }
    #[test]
    fn active_conflicts_preserve_both_tasks_but_import_finished() {
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        start(&mut source);
        source.pause(2).unwrap();
        let mut target = empty();
        start(&mut target);
        target.pause(1).unwrap();
        let r = merge(&mut target, &source).unwrap();
        assert_eq!(r.imported, 1);
        assert_eq!(r.skipped_active_ids, vec![2]);
        assert_eq!(target.active().unwrap().unwrap().id, 1);
        assert!(source.active().unwrap().is_some());
    }
    #[test]
    fn id_collisions_remap_segments_and_audit_without_changing_times() {
        let clock = TestClock::new();
        let mut source = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        start(&mut source);
        clock.advance(12345);
        source.finish(1).unwrap();
        let before = source.record(1).unwrap();
        source
            .settle(SettleInput {
                id: 1,
                expected_revision: before.revision,
                category: "文档".into(),
                quantity: 3.5,
                remark: "corrected".into(),
            })
            .unwrap();
        let original = source.record(1).unwrap();
        let mut target = empty();
        start(&mut target);
        target.finish(1).unwrap();
        assert_eq!(merge(&mut target, &source).unwrap().imported, 1);
        let imported = target.record(2).unwrap();
        assert_eq!(imported.duration_ms, original.duration_ms);
        assert_eq!(imported.end_time, original.end_time);
        assert_eq!(imported.confirmed_end_time, original.confirmed_end_time);
        assert_eq!(imported.quantity, Some(3.5));
        let (parent, duration): (i64, i64) = target
            .connection
            .query_row(
                "SELECT record_id,duration_ms FROM work_segments WHERE record_id=2",
                [],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .unwrap();
        assert_eq!((parent, duration), (2, 12345));
        let (parent, before, after): (i64, String, String) = target
            .connection
            .query_row(
                "SELECT record_id,before_json,after_json FROM record_revisions",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
            )
            .unwrap();
        assert_eq!(parent, 2);
        let before: serde_json::Value = serde_json::from_str(&before).unwrap();
        let after: serde_json::Value = serde_json::from_str(&after).unwrap();
        assert_eq!(before["id"], 2);
        assert_eq!(after["id"], 2);
        assert_eq!(after["remark"], "corrected");
        let r = merge(&mut target, &source).unwrap();
        assert_eq!(r.duplicates, 1);
        source
            .connection
            .execute(
                "UPDATE work_records SET remark='changed again' WHERE id=1",
                [],
            )
            .unwrap();
        assert_eq!(merge(&mut target, &source).unwrap().conflict_ids, vec![1]);
    }
    #[test]
    fn unfinished_preview_is_imported_as_recovery_without_downtime() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut source = empty();
        start(&mut source);
        let archive = source.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        let recovered = Store::open(&image.0, Box::new(SystemClock::new())).unwrap();
        let mut target = empty();
        assert_eq!(merge(&mut target, &recovered).unwrap().imported, 1);
        let task = target.active().unwrap().unwrap();
        assert!(task.is_paused && task.recovery_pending);
        assert_eq!(task.duration_ms, 0);
        assert!(!source.active().unwrap().unwrap().is_paused);
    }
    #[test]
    fn migration_preserves_config_by_default_and_imports_options_only_when_requested() {
        let mut source = empty();
        let mut names = source.category_names().unwrap();
        names.names.insert("开发".into(), "编程".into());
        source.save_category_names(names).unwrap();
        source.connection.execute("UPDATE monitoring_settings SET poll_interval_seconds=5,auto_resume_manual=0,enabled=1,idle_pause_seconds=15",[]).unwrap();
        let mut target = empty();
        merge(&mut target, &source).unwrap();
        assert_eq!(target.monitor_config().unwrap().poll_interval_seconds, 1);
        assert_eq!(target.category_names().unwrap().names["开发"], "开发");
        merge_options(&mut target, &source, true).unwrap();
        let config = target.monitor_config().unwrap();
        assert_eq!(config.poll_interval_seconds, 5);
        assert_eq!(config.times.idle_pause_seconds, 15);
        assert_eq!(target.category_names().unwrap().names["开发"], "编程");
        assert!(!config.auto_resume_manual);
        assert!(!config.enabled);
        start(&mut target);
        assert!(merge_options(&mut target, &source, true).is_err());
        assert!(target.active().unwrap().is_some());
    }
    #[test]
    fn migration_failure_rolls_back_all_imported_rows() {
        let mut source = empty();
        start(&mut source);
        source.finish(1).unwrap();
        let mut target = empty();
        target.connection.execute_batch("CREATE TRIGGER refuse_import BEFORE INSERT ON import_sources BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(merge(&mut target, &source).is_err());
        assert_eq!(
            target
                .connection
                .query_row("SELECT COUNT(*) FROM work_records", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            0
        );
    }
    #[test]
    fn restore_failure_rolls_back_database_and_journal_recovers_old_snapshot() {
        let d = TestDirectory::new();
        let dir = d.db();
        let dir = dir.parent().unwrap();
        let mut store = empty();
        start(&mut store);
        store.finish(1).unwrap();
        let archive = store.archive(dir).unwrap();
        let image = checked_image(&archive, dir).unwrap();
        store
            .connection
            .execute("UPDATE work_records SET remark='current' WHERE id=1", [])
            .unwrap();
        store.connection.execute_batch("CREATE TRIGGER fail_restore BEFORE INSERT ON work_records BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
        assert!(store.apply_image(&image.0).is_err());
        assert_eq!(store.record(1).unwrap().remark, "current");
        store
            .connection
            .execute_batch("DROP TRIGGER fail_restore")
            .unwrap();
        save_archive(&dir.join("restore-journal.workmemo"), &archive).unwrap();
        recover_pending(&mut store, dir).unwrap();
        assert_eq!(store.record(1).unwrap().remark, "test");
        assert!(!dir.join("restore-journal.workmemo").exists());
    }
    #[test]
    fn corrupted_backup_and_future_layout_are_rejected() {
        let mut archive = Archive {
            version: 1,
            database: vec![1, 2, 3],
            settings: BTreeMap::new(),
        };
        let d = TestDirectory::new();
        assert!(checked_image(&archive, d.db().parent().unwrap()).is_err());
        archive.settings.insert("window-layout.json".into(),br#"{"density":"comfortable","windows":{"evil":{"x":0,"y":0,"width":400,"height":400}}}"#.to_vec());
        assert!(validate_settings(&archive.settings).is_err());
        archive.settings.clear();
        archive.settings.insert(
            "island.json".into(),
            br#"{"version":1,"enabled":true,"position":["invalid",0]}"#.to_vec(),
        );
        assert!(validate_settings(&archive.settings).is_err());
    }
}

#[tauri::command]
pub fn detect_preview_data(app: tauri::AppHandle) -> Result<bool> {
    Ok(preview_path(&app)?.is_file())
}

#[cfg(test)]
mod image_backup_tests {
    use super::*;
    use crate::{
        database::tests::{TestClock, TestDirectory},
        presentation::{Background, Presentation},
    };
    #[test]
    fn snapshot_keeps_managed_background_and_rejects_missing_image() {
        let source = TestDirectory::new();
        let path = source.db();
        let directory = path.parent().unwrap();
        let backgrounds = directory.join("backgrounds");
        std::fs::create_dir(&backgrounds).unwrap();
        let mut bytes = std::io::Cursor::new(Vec::new());
        image::DynamicImage::new_rgb8(2, 2)
            .write_to(&mut bytes, image::ImageFormat::Png)
            .unwrap();
        std::fs::write(backgrounds.join("bg-test.png"), bytes.get_ref()).unwrap();
        let p = Presentation {
            background: Some(Background {
                file: "bg-test.png".into(),
                opacity: 37,
            }),
            ..Default::default()
        };
        std::fs::write(
            directory.join("presentation.json"),
            serde_json::to_vec(&p).unwrap(),
        )
        .unwrap();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap();
        let archive = store.archive(directory).unwrap();
        assert_eq!(archive.version, 2);
        validate_settings(&archive.settings).unwrap();
        assert_eq!(
            &archive.settings["backgrounds/bg-test.png"],
            bytes.get_ref()
        );
        let target = TestDirectory::new();
        let target_path = target.db();
        let target_dir = target_path.parent().unwrap();
        write_configs(target_dir, &archive.settings).unwrap();
        assert_eq!(
            crate::presentation::load(target_dir)
                .unwrap()
                .background
                .unwrap()
                .opacity,
            37
        );
        let mut missing = archive.settings.clone();
        missing.remove("backgrounds/bg-test.png");
        assert!(validate_settings(&missing).is_err());
        let mut invalid = archive.settings.clone();
        invalid.insert("backgrounds/../secret.png".into(), vec![1]);
        assert!(validate_settings(&invalid).is_err());
        for dir in [directory, target_dir] {
            std::fs::remove_file(dir.join("backgrounds/bg-test.png")).unwrap();
            std::fs::remove_dir(dir.join("backgrounds")).unwrap();
            std::fs::remove_file(dir.join("presentation.json")).unwrap();
        }
    }
}
```

## E:\WorkMemo\src-tauri\src\database.rs

```rust
use crate::clock::{Clock, TimePoint};
use crate::monitor::{MonitorStatus, Runtime};
use rusqlite::{Connection, OptionalExtension, TransactionBehavior, params};
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::{fs::File, path::Path, time::Duration};
static NEXT_CLOCK_SESSION: AtomicU64 = AtomicU64::new(0);

pub type Result<T> = std::result::Result<T, String>;

#[derive(Clone, Debug, Serialize)]
pub struct WorkRecord {
    pub id: i64,
    pub category: String,
    pub quantity: Option<f64>,
    pub remark: String,
    /// Unix milliseconds; durations use the independent monotonic clock.
    pub start_time: i64,
    pub end_time: Option<i64>,
    pub duration_seconds: i64,
    pub duration_ms: i64,
    pub status: String,
    pub is_paused: bool,
    pub recovery_pending: bool,
    pub settlement_status: String,
    pub source: String,
    pub pause_reason: Option<String>,
    pub confirmed_end_time: Option<i64>,
    pub last_input_time: Option<i64>,
    pub end_reason: Option<String>,
    pub legacy_duration_ms: i64,
    pub revision: i64,
    pub control_mode: String,
}

#[derive(Debug, Deserialize)]
pub struct StartInput {
    pub category: String,
    pub quantity: Option<f64>,
    pub remark: String,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub active: Option<WorkRecord>,
    pub recent_records: Vec<WorkRecord>,
    pub warning: Option<String>,
    pub pending_count: i64,
    pub monitoring: MonitorStatus,
}

struct Segment {
    id: i64,
    row_id: i64,
    base_ms: i64,
    started_ticks: i64,
    started_wall: i64,
}

pub struct Store {
    pub(crate) sounds: crate::sound::Tracker,
    pub(crate) sound_config: Option<std::path::PathBuf>,
    connection: Connection,
    clock: Box<dyn Clock>,
    segment: Option<Segment>,
    pub warning: Option<String>,
    // Keep the Windows share-mode lock alive for the entire database session.
    _instance_lock: Option<File>,
    clock_session: String,
    pub(crate) monitor: Runtime,
}

const COLUMNS: &str = "id, category, quantity, remark, start_time, end_time,
    duration_seconds, duration_ms, status, is_paused, recovery_pending,
    settlement_status, source, pause_reason, confirmed_end_time, last_input_time,
    end_reason, legacy_duration_ms, revision, control_mode";

fn db_error(error: rusqlite::Error) -> String {
    format!("本地数据读写失败：{error}")
}

fn read_record(row: &rusqlite::Row<'_>) -> rusqlite::Result<WorkRecord> {
    Ok(WorkRecord {
        id: row.get(0)?,
        category: row.get(1)?,
        quantity: row.get(2)?,
        remark: row.get(3)?,
        start_time: row.get(4)?,
        end_time: row.get(5)?,
        duration_seconds: row.get(6)?,
        duration_ms: row.get(7)?,
        status: row.get(8)?,
        is_paused: row.get(9)?,
        recovery_pending: row.get(10)?,
        settlement_status: row.get(11)?,
        source: row.get(12)?,
        pause_reason: row.get(13)?,
        confirmed_end_time: row.get(14)?,
        last_input_time: row.get(15)?,
        end_reason: row.get(16)?,
        legacy_duration_ms: row.get(17)?,
        revision: row.get(18)?,
        control_mode: row.get(19)?,
    })
}

impl Store {
    pub fn open(path: &Path, clock: Box<dyn Clock>) -> Result<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| format!("无法创建数据目录：{e}"))?;
        }
        #[cfg(windows)]
        let instance_lock = {
            use std::os::windows::fs::OpenOptionsExt;
            Some(
                std::fs::OpenOptions::new()
                    .read(true)
                    .write(true)
                    .create(true)
                    .truncate(false)
                    .share_mode(0)
                    .open(path.with_extension("lock"))
                    .map_err(|e| {
                        format!("无法打开数据锁；请确认没有其他 WorkMemo 窗口正在使用数据：{e}")
                    })?,
            )
        };
        #[cfg(not(windows))]
        let instance_lock = None;
        let connection = Connection::open(path).map_err(db_error)?;
        Self::initialize(connection, clock, instance_lock)
    }

    fn initialize(
        mut connection: Connection,
        clock: Box<dyn Clock>,
        lock: Option<File>,
    ) -> Result<Self> {
        connection
            .busy_timeout(Duration::from_secs(2))
            .map_err(db_error)?;
        connection
            .execute_batch(
                "PRAGMA foreign_keys=OFF; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;",
            )
            .map_err(db_error)?;
        let tx = connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let version: i64 = tx
            .pragma_query_value(None, "user_version", |r| r.get(0))
            .map_err(db_error)?;
        match version {
            0 => {
                tx.execute_batch(include_str!("../migrations/001_initial.sql"))
                    .map_err(db_error)?;
            }
            1..=9 => {}
            _ => return Err("数据库来自较新版本，请使用较新版本的 WorkMemo；未修改数据。".into()),
        }
        if version < 2 {
            tx.execute_batch(include_str!("../migrations/002_settlement.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 2)
                .map_err(db_error)?;
        }
        if version < 3 {
            tx.execute_batch(include_str!("../migrations/003_monitoring.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 3)
                .map_err(db_error)?;
        }
        if version < 4 {
            tx.execute_batch(include_str!("../migrations/004_tracking_times.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 4)
                .map_err(db_error)?;
        }
        if version < 5 {
            tx.execute_batch(include_str!("../migrations/005_monitor_options.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 5)
                .map_err(db_error)?;
        }
        if version < 6 {
            tx.execute_batch(include_str!("../migrations/006_import_sources.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 6)
                .map_err(db_error)?;
        }
        if version < 7 {
            tx.execute_batch(include_str!("../migrations/007_dashboard_intent.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 7)
                .map_err(db_error)?;
        }
        if version < 8 {
            tx.execute_batch(include_str!("../migrations/008_url_matching.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 8)
                .map_err(db_error)?;
        }
        if version < 9 {
            tx.execute_batch(include_str!("../migrations/009_idle_categories.sql"))
                .map_err(db_error)?;
            tx.pragma_update(None, "user_version", 9)
                .map_err(db_error)?;
        }
        let invalid: Option<String> = tx
            .query_row(
                "SELECT [table] FROM pragma_foreign_key_check LIMIT 1",
                [],
                |r| r.get(0),
            )
            .optional()
            .map_err(db_error)?;
        if invalid.is_some() {
            return Err("数据库关联校验失败，迁移未提交。".into());
        }
        // Never infer work while the application was closed from wall-clock time.
        tx.execute("UPDATE work_segments SET state='RECOVERED',end_time=checkpoint_time WHERE state='OPEN'", [])
            .map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET is_paused=1, recovery_pending=1,
             pause_reason=COALESCE(pause_reason,'RECOVERY') WHERE status='WORKING'",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        connection
            .pragma_update(None, "foreign_keys", true)
            .map_err(db_error)?;
        let now = clock.now();
        let mut store = Self {
            sounds: crate::sound::Tracker::default(),
            sound_config: None,
            connection,
            clock,
            segment: None,
            warning: None,
            _instance_lock: lock,
            clock_session: format!(
                "{}:{}:{}:{}",
                std::process::id(),
                now.wall_ms,
                now.ticks_ms,
                NEXT_CLOCK_SESSION.fetch_add(1, Ordering::Relaxed)
            ),
            monitor: Runtime::default(),
        };
        store.monitor.config = store.monitor_config()?;
        store.category_names()?;
        Ok(store)
    }

    pub fn active(&self) -> Result<Option<WorkRecord>> {
        self.connection
            .query_row(
                &format!("SELECT {COLUMNS} FROM work_records WHERE status='WORKING'"),
                [],
                read_record,
            )
            .optional()
            .map_err(db_error)
    }

    fn record(&self, id: i64) -> Result<WorkRecord> {
        self.connection
            .query_row(
                &format!("SELECT {COLUMNS} FROM work_records WHERE id=?1"),
                [id],
                read_record,
            )
            .optional()
            .map_err(db_error)?
            .ok_or_else(|| "找不到这条工作记录，请刷新后重试。".into())
    }

    fn current(&self, id: i64) -> Result<WorkRecord> {
        let record = self.active()?.ok_or("当前没有活动任务。")?;
        if record.id != id {
            return Err("当前任务已变更，请刷新后重试。".into());
        }
        Ok(record)
    }

    fn elapsed(&self, record: &WorkRecord, now: TimePoint) -> Result<i64> {
        if record.is_paused {
            return Ok(record.duration_ms);
        }
        let segment = self
            .segment
            .as_ref()
            .filter(|s| s.id == record.id)
            .ok_or("计时状态不一致，请重新打开应用恢复任务。")?;
        Ok(segment
            .base_ms
            .saturating_add(now.ticks_ms.saturating_sub(segment.started_ticks).max(0)))
    }

    pub fn checkpoint(&mut self) -> Result<()> {
        if self.segment.is_none() {
            return Ok(());
        }
        let record = self.active()?.ok_or("活动任务丢失，请重新打开应用。")?;
        self.save_running(&record, None)
    }

    fn save_running(&mut self, record: &WorkRecord, pause_reason: Option<&str>) -> Result<()> {
        let duration = self.elapsed(record, self.clock.now())?;
        let tx = self.connection.transaction().map_err(db_error)?;
        write_segment(
            &tx,
            self.segment.as_ref(),
            record.id,
            duration,
            pause_reason.is_some(),
        )?;
        let changed = tx.execute(
            "UPDATE work_records SET duration_ms=?1, duration_seconds=?2 WHERE id=?3 AND status='WORKING' AND is_paused=0",
            params![duration, duration / 1000, record.id],
        ).map_err(db_error)?;
        if changed != 1 {
            return Err("计时保存失败，任务状态已变更。".into());
        }
        if let Some(reason) = pause_reason {
            tx.execute(
                "UPDATE work_records SET is_paused=1,pause_reason=?1 WHERE id=?2",
                params![reason, record.id],
            )
            .map_err(db_error)?;
        }
        tx.commit().map_err(db_error)?;
        Ok(())
    }

    pub fn snapshot(&mut self) -> Result<Snapshot> {
        self.checkpoint()?;
        let active = self.active()?;
        let mut statement = self.connection.prepare(
            &format!("SELECT {COLUMNS} FROM work_records WHERE status='FINISHED' AND is_demo=0 ORDER BY id DESC LIMIT 5")
        ).map_err(db_error)?;
        let recent_records = statement
            .query_map([], read_record)
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)?;
        Ok(Snapshot {
            active,
            recent_records,
            warning: self.warning.clone(),
            pending_count: self.connection.query_row(
                "SELECT COUNT(*) FROM work_records WHERE status='FINISHED' AND settlement_status='PENDING' AND is_demo=0", [], |r| r.get(0)
            ).map_err(db_error)?,
            monitoring: self.monitor.status.clone(),
        })
    }

    pub fn start_checked(
        &mut self,
        input: StartInput,
        expected_active_id: Option<i64>,
    ) -> Result<()> {
        if self.active()?.map(|record| record.id) != expected_active_id {
            return Err("当前任务已变化，请刷新后重新确认。".into());
        }
        self.start(input)
    }

    pub fn start(&mut self, input: StartInput) -> Result<()> {
        if self.monitor.active && !self.monitor.status.native_available {
            return Err("当前无法确认系统活动状态，暂不能开始计时；已有记录保持保存。".into());
        }
        self.start_at(input, "MANUAL_START", self.clock.now(), true)
    }

    fn start_at(
        &mut self,
        input: StartInput,
        source: &str,
        now: TimePoint,
        allow_switch: bool,
    ) -> Result<()> {
        if !["评测", "质检", "开发", "文档"].contains(&input.category.as_str()) {
            return Err("请选择工作类别。".into());
        }
        if input
            .quantity
            .is_some_and(|quantity| !valid_quantity(quantity))
        {
            return Err("工作量必须为 0 到 10 亿之间的有限数值。".into());
        }
        let remark = input.remark.trim();
        if remark.chars().count() > 2000 {
            return Err("备注不能超过 2000 个字符。".into());
        }
        let previous = self.active()?;
        if previous
            .as_ref()
            .is_some_and(|r| !r.is_paused || !allow_switch)
        {
            return Err("请先暂停或结束当前任务。".into());
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        if let Some(previous) = previous {
            finish_row(&tx, previous.id, previous.start_time, now.wall_ms, "SWITCH")?;
        }
        tx.execute("INSERT INTO work_records(category, quantity, remark, start_time, status, is_paused,settlement_status,source,control_mode,last_input_time) VALUES(?1,?2,?3,?4,'WORKING',0,'IN_PROGRESS',?5,?6,?4)",
            params![input.category, input.quantity, remark, now.wall_ms,source,if source=="AUTO"{"AUTO"}else{"MANUAL"}]).map_err(db_error)?;
        let id = tx.last_insert_rowid();
        let row_id = insert_segment(&tx, id, now.wall_ms, &self.clock_session, now.ticks_ms)?;
        tx.execute(
            "UPDATE monitoring_settings SET browsing_only=0 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: 0,
            started_ticks: now.ticks_ms,
            started_wall: now.wall_ms,
        });
        self.warning = None;
        self.monitor.record_changed(id, now);
        Ok(())
    }

    pub fn pause(&mut self, id: i64) -> Result<()> {
        let record = self.current(id)?;
        if record.is_paused {
            self.connection
                .execute(
                    "UPDATE work_records SET pause_reason='MANUAL' WHERE id=?1",
                    [id],
                )
                .map_err(db_error)?;
            self.monitor.input_floor = self.clock.now().ticks_ms;
            self.monitor.status.idle_warning = false;
            return Ok(());
        }
        self.pause_with_reason(id, "MANUAL")?;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        Ok(())
    }

    fn pause_with_reason(&mut self, id: i64, reason: &str) -> Result<()> {
        let record = self.current(id)?;
        if record.is_paused {
            return Ok(());
        }
        self.save_running(&record, Some(reason))?;
        self.segment = None;
        self.warning = None;
        self.monitor.status.idle_warning = false;
        Ok(())
    }

    pub fn resume(&mut self, id: i64) -> Result<()> {
        if self.monitor.active && !self.monitor.status.native_available {
            return Err("当前无法确认系统活动状态，暂不能继续计时。".into());
        }
        let record = self.current(id)?;
        let mode = if record.control_mode == "AUTO" {
            "AUTO"
        } else {
            "MANUAL"
        };
        self.resume_at(id, self.clock.now(), mode)
    }
    fn resume_at(&mut self, id: i64, now: TimePoint, mode: &str) -> Result<()> {
        let record = self.current(id)?;
        if !record.is_paused {
            return Ok(());
        }
        let tx = self.connection.transaction().map_err(db_error)?;
        tx.execute(
            "UPDATE work_records SET is_paused=0, recovery_pending=0,pause_reason=NULL,control_mode=?2,last_input_time=?3 WHERE id=?1",
            params![id,mode,now.wall_ms],
        )
        .map_err(db_error)?;
        // A wall-clock rollback must not make new intervals overlap old intervals.
        let previous_end: Option<i64> = tx
            .query_row(
                "SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?1",
                [id],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        let started_wall = now
            .wall_ms
            .max(record.start_time)
            .max(previous_end.unwrap_or(0));
        let row_id = insert_segment(&tx, id, started_wall, &self.clock_session, now.ticks_ms)?;
        tx.execute(
            "UPDATE monitoring_settings SET browsing_only=0 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.segment = Some(Segment {
            id,
            row_id,
            base_ms: record.duration_ms,
            started_ticks: now.ticks_ms,
            started_wall,
        });
        self.warning = None;
        self.monitor.record_changed(id, now);
        Ok(())
    }

    pub fn finish(&mut self, id: i64) -> Result<()> {
        if self.record(id)?.status == "FINISHED" {
            return Ok(());
        }
        let record = self.current(id)?;
        let now = self.clock.now();
        let duration = self.elapsed(&record, now)?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if !record.is_paused {
            write_segment(&tx, self.segment.as_ref(), id, duration, true)?;
        }
        tx.execute(
            "UPDATE work_records SET duration_ms=?1,duration_seconds=?2 WHERE id=?3",
            params![duration, duration / 1000, id],
        )
        .map_err(db_error)?;
        finish_row(&tx, id, record.start_time, now.wall_ms, "MANUAL")?;
        tx.commit().map_err(db_error)?;
        self.segment = None;
        self.warning = None;
        self.monitor.record_ended(now);
        Ok(())
    }

    pub fn pause_for_close(&mut self) -> Result<()> {
        if let Some(record) = self.active()? {
            self.pause_with_reason(record.id, "APP_CLOSE")?;
        }
        Ok(())
    }
}

fn valid_quantity(quantity: f64) -> bool {
    quantity.is_finite() && (0.0..=1_000_000_000.0).contains(&quantity)
}

fn insert_segment(
    tx: &rusqlite::Transaction<'_>,
    record_id: i64,
    start: i64,
    session: &str,
    ticks: i64,
) -> Result<i64> {
    tx.execute("INSERT INTO work_segments(record_id,start_time,checkpoint_time,state,clock_session,start_ticks_ms,end_ticks_ms) VALUES(?1,?2,?2,'OPEN',?3,?4,?4)",params![record_id,start,session,ticks]).map_err(db_error)?;
    Ok(tx.last_insert_rowid())
}

fn write_segment(
    tx: &rusqlite::Transaction<'_>,
    segment: Option<&Segment>,
    id: i64,
    total: i64,
    close: bool,
) -> Result<()> {
    let segment = segment
        .filter(|s| s.id == id)
        .ok_or("计时区间不一致，请重新打开应用恢复任务。")?;
    let duration = total.saturating_sub(segment.base_ms);
    let checkpoint = segment
        .started_wall
        .checked_add(duration)
        .ok_or("计时数值超出范围。")?;
    let changed = tx
        .execute(
            "UPDATE work_segments SET duration_ms=?1,checkpoint_time=?2,
        end_time=CASE WHEN ?3 THEN ?2 ELSE NULL END,state=CASE WHEN ?3 THEN 'CLOSED' ELSE 'OPEN' END,end_ticks_ms=?6
        WHERE id=?4 AND record_id=?5 AND state='OPEN'",
            params![duration, checkpoint, close, segment.row_id, id,segment.started_ticks.saturating_add(duration)],
        )
        .map_err(db_error)?;
    if changed != 1 {
        return Err("计时区间保存失败，未修改任务。".into());
    }
    Ok(())
}

fn finish_row(
    tx: &rusqlite::Transaction<'_>,
    id: i64,
    start: i64,
    confirmed: i64,
    reason: &str,
) -> Result<()> {
    let confirmed = confirmed.max(0);
    tx.execute("UPDATE work_records SET status='FINISHED',is_paused=1,recovery_pending=0,pause_reason=NULL,
        settlement_status='PENDING',confirmed_end_time=?1,end_reason=?2,
        end_time=MAX(?3,COALESCE((SELECT MAX(checkpoint_time) FROM work_segments WHERE record_id=?4 AND duration_ms>0),CASE WHEN legacy_duration_ms>0 THEN ?1 ELSE ?3 END)) WHERE id=?4 AND status='WORKING'",
        params![confirmed,reason,start,id]).map_err(db_error)?;
    tx.execute(
        "INSERT INTO end_reminders(record_id) VALUES(?1) ON CONFLICT(record_id) DO NOTHING",
        [id],
    )
    .map_err(db_error)?;
    Ok(())
}

#[cfg(test)]
#[path = "database_tests.rs"]
mod tests;

#[path = "history.rs"]
mod history;
pub use history::{HistoryPage, HistoryQuery};

#[path = "settlement.rs"]
mod settlement;
pub use settlement::SettleInput;

#[cfg(test)]
#[path = "settlement_tests.rs"]
mod settlement_tests;

#[path = "tracking.rs"]
mod tracking;
pub use tracking::Notice;
#[cfg(test)]
#[path = "tracking_tests.rs"]
mod tracking_tests;

#[cfg(test)]
#[path = "reliability_tests.rs"]
mod reliability_tests;

#[path = "data_center.rs"]
pub mod data_center;

#[path = "data_tools.rs"]
pub mod data_tools;

#[path = "categories.rs"]
pub mod categories;
```

## E:\WorkMemo\src-tauri\src\history_tests.rs

```rust
use super::*;
use crate::clock::{Clock, TimePoint};
use rusqlite::Connection;

struct FixedClock;
impl Clock for FixedClock {
    fn now(&self) -> TimePoint {
        TimePoint {
            wall_ms: 1_000_000,
            ticks_ms: 0,
        }
    }
}

fn memory() -> Store {
    Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(FixedClock),
        None,
    )
    .unwrap()
}

fn query() -> HistoryQuery {
    HistoryQuery {
        start_date: "2026-10-01".into(),
        end_date: "2026-10-31".into(),
        category: None,
        page: 1,
    }
}

// Fixtures live only in isolated test databases, never in the production data directory.
fn saved(store: &Store, local_time: &str, category: &str, quantity: f64, duration_ms: i64) -> i64 {
    store
        .connection
        .execute(
            "INSERT INTO work_records(category,quantity,remark,start_time,end_time,
        duration_ms,duration_seconds,status,is_paused,settlement_status) VALUES(?1,?2,'测试夹具',
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000,
        CAST(strftime('%s',?3,'utc') AS INTEGER)*1000+86400000,?4,?4/1000,'FINISHED',1,'COMPLETE')",
            params![category, quantity, local_time, duration_ms],
        )
        .unwrap();
    store.connection.last_insert_rowid()
}

#[test]
fn empty_history_has_real_zero_totals_and_no_summary_rows() {
    let mut store = memory();
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.page, 1);
    assert_eq!(result.page_size, 20);
    assert!(result.records.is_empty() && result.daily.is_empty() && result.categories.is_empty());
    assert_eq!(result.filtered.records, 0);
    assert_eq!(result.filtered.quantity, 0.0);
    assert_eq!(result.overview.duration_ms, 0);
}

#[test]
fn filters_include_local_day_boundaries_and_category_without_changing_overview() {
    let mut store = memory();
    saved(&store, "2026-09-30 23:59:59", "开发", 1.0, 1000);
    let first = saved(&store, "2026-10-01 00:00:00", "开发", 2.5, 1500);
    let last = saved(&store, "2026-10-31 23:59:59", "开发", 3.5, 2500);
    saved(&store, "2026-10-15 12:00:00", "文档", 4.0, 4000);
    saved(&store, "2026-11-01 00:00:00", "开发", 5.0, 5000);
    let mut filter = query();
    filter.category = Some("开发".into());
    let result = store.query_history(filter).unwrap();
    assert_eq!(
        result
            .records
            .iter()
            .map(|record| record.id)
            .collect::<Vec<_>>(),
        vec![last, first]
    );
    assert_eq!(result.filtered.records, 2);
    assert_eq!(result.filtered.quantity, 6.0);
    assert_eq!(result.filtered.duration_ms, 4000);
    assert_eq!(result.overview.records, 5);
    assert_eq!(result.overview.quantity, 16.0);
}

#[test]
fn pagination_is_stable_for_identical_start_times_and_clamps_after_deletion() {
    let mut store = memory();
    for _ in 0..41 {
        saved(&store, "2026-10-20 10:00:00", "开发", 1.0, 500);
    }
    let first = store.query_history(query()).unwrap();
    assert_eq!(first.records.len(), 20);
    assert_eq!(first.records[0].id, 41);
    let mut filter = query();
    filter.page = 2;
    let second = store.query_history(filter.clone()).unwrap();
    assert_eq!(second.records.len(), 20);
    assert_eq!(second.records[0].id, 21);
    assert!(
        !first
            .records
            .iter()
            .any(|r| second.records.iter().any(|other| other.id == r.id))
    );
    filter.page = u32::MAX;
    let last = store.query_history(filter.clone()).unwrap();
    assert_eq!(last.page, 3);
    assert_eq!(last.records.len(), 1);
    store.delete_record(last.records[0].id).unwrap();
    assert_eq!(store.query_history(filter).unwrap().page, 2);
}

#[test]
fn aggregates_preserve_subseconds_and_assign_cross_midnight_work_to_start_day() {
    let mut store = memory();
    saved(&store, "2026-10-20 23:59:59", "开发", 0.1, 600);
    saved(&store, "2026-10-20 23:59:59", "开发", 0.2, 600);
    saved(&store, "2026-10-21 00:00:00", "文档", 2.0, 1900);
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.filtered.duration_ms, 3100);
    assert!((result.filtered.quantity - 2.3).abs() < 1e-10);
    assert_eq!(result.daily.len(), 2);
    assert_eq!(result.daily[1].date, "2026-10-20");
    assert_eq!(result.daily[1].totals.duration_ms, 1200);
    assert_eq!(
        result
            .daily
            .iter()
            .map(|d| d.totals.duration_ms)
            .sum::<i64>(),
        result.filtered.duration_ms
    );
    assert_eq!(
        result
            .categories
            .iter()
            .map(|c| c.totals.records)
            .sum::<i64>(),
        result.filtered.records
    );
}

#[test]
fn invalid_query_is_rejected_without_deleting_or_altering_records() {
    let mut store = memory();
    saved(&store, "2026-10-01 00:00:00", "文档", 1.0, 1000);
    for date in [
        "",
        "2026-2-01",
        "2026-02-29",
        "2026-04-31",
        "1969-12-31",
        "2026-00-10",
        "2026-13-01",
        "2026-10-00",
        "2026-10-32",
        "二〇二六-10-01",
        "2026-10-01' OR 1=1--",
    ] {
        let mut filter = query();
        filter.start_date = date.into();
        assert!(store.query_history(filter).is_err(), "{date}");
    }
    let mut filter = query();
    filter.start_date = "2026-11-01".into();
    assert!(store.query_history(filter).is_err());
    let mut filter = query();
    filter.page = 0;
    assert!(store.query_history(filter).is_err());
    let mut filter = query();
    filter.category = Some("开发' OR 1=1--".into());
    assert!(store.query_history(filter).is_err());
    let mut filter = query();
    filter.start_date = "2024-01-01".into();
    filter.end_date = "2025-01-01".into();
    assert!(store.query_history(filter).is_err());
    assert_eq!(store.query_history(query()).unwrap().overview.records, 1);
}

#[test]
fn leap_day_and_maximum_range_are_validated() {
    let mut store = memory();
    let mut filter = query();
    filter.start_date = "2024-01-01".into();
    filter.end_date = "2024-12-31".into();
    assert!(store.query_history(filter).is_ok());
    let mut filter = query();
    filter.start_date = "2024-02-29".into();
    filter.end_date = "2024-02-29".into();
    assert!(store.query_history(filter).is_ok());
    let mut filter = query();
    filter.start_date = "2100-02-29".into();
    assert!(store.query_history(filter).is_err());
}

#[test]
fn active_and_paused_records_cannot_be_deleted_or_counted_and_timer_is_untouched() {
    let mut store = memory();
    let old = saved(&store, "2026-10-20 10:00:00", "开发", 1.0, 600);
    store
        .start(super::super::StartInput {
            category: "文档".into(),
            quantity: Some(2.0),
            remark: "".into(),
        })
        .unwrap();
    let active = store.active().unwrap().unwrap().id;
    assert!(store.delete_record(active).is_err());
    assert_eq!(store.query_history(query()).unwrap().overview.records, 1);
    assert_eq!(store.segment.as_ref().unwrap().id, active);
    assert!(!store.active().unwrap().unwrap().is_paused);
    store.pause(active).unwrap();
    assert!(store.delete_record(active).is_err());
    store.delete_record(old).unwrap();
    assert_eq!(store.active().unwrap().unwrap().id, active);
    assert_eq!(store.query_history(query()).unwrap().overview.records, 0);
}

#[test]
fn delete_updates_history_recent_and_all_summaries_without_affecting_other_records() {
    let mut store = memory();
    let target = saved(&store, "2026-10-20 10:00:00", "开发", 2.0, 1200);
    let keep = saved(&store, "2026-10-21 10:00:00", "文档", 3.0, 2400);
    store.delete_record(target).unwrap();
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.overview.records, 1);
    assert_eq!(result.filtered.quantity, 3.0);
    assert_eq!(result.filtered.duration_ms, 2400);
    assert_eq!(result.records[0].id, keep);
    assert_eq!(result.daily.len(), 1);
    assert_eq!(result.categories.len(), 1);
    assert_eq!(store.snapshot().unwrap().recent_records[0].id, keep);
    assert!(store.delete_record(target).is_err());
    assert!(store.delete_record(-1).is_err());
}

#[test]
fn failed_delete_rolls_back_and_keeps_history_and_totals() {
    let mut store = memory();
    let target = saved(&store, "2026-10-20 10:00:00", "开发", 2.0, 1200);
    store
        .connection
        .execute_batch(
            "CREATE TRIGGER reject_delete BEFORE DELETE ON work_records
        BEGIN SELECT RAISE(ABORT,'test disk failure'); END;",
        )
        .unwrap();
    assert!(store.delete_record(target).is_err());
    let result = store.query_history(query()).unwrap();
    assert_eq!(result.records[0].id, target);
    assert_eq!(result.filtered.quantity, 2.0);
    assert_eq!(result.filtered.duration_ms, 1200);
}

#[test]
fn deletion_persists_when_reopened_and_existing_schema_stays_compatible() {
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_nanos();
    let directory =
        std::env::temp_dir().join(format!("workmemo-history-{}-{nonce}", std::process::id()));
    std::fs::create_dir(&directory).unwrap();
    let path = directory.join("history.sqlite3");
    {
        let mut store = Store::open(&path, Box::new(FixedClock)).unwrap();
        let target = saved(&store, "2026-10-20 10:00:00", "开发", 2.0, 1200);
        saved(&store, "2026-10-21 10:00:00", "文档", 3.0, 2400);
        store.delete_record(target).unwrap();
    }
    {
        let mut reopened = Store::open(&path, Box::new(FixedClock)).unwrap();
        assert_eq!(reopened.query_history(query()).unwrap().overview.records, 1);
        let version: i64 = reopened
            .connection
            .pragma_query_value(None, "user_version", |row| row.get(0))
            .unwrap();
        assert_eq!(version, 9);
    }
    // Exact temporary test directory, created above; never a user database path.
    assert_eq!(directory.parent(), Some(std::env::temp_dir().as_path()));
    std::fs::remove_dir_all(directory).unwrap();
}
```

## E:\WorkMemo\src-tauri\src\idle_pause_tests.rs

```rust
use super::*;

#[test]
fn threshold_trims_tail_and_fresh_work_resumes_same_auto_record() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(119_999, false);
    assert!(!h.saved(id).is_paused);
    h.step(1, false);
    let paused = h.saved(id);
    assert_eq!(paused.pause_reason.as_deref(), Some("IDLE_PAUSE"));
    assert_eq!(paused.duration_ms, 10_000);
    assert_eq!(paused.status, "WORKING");
    h.advance(20_000, false);
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.step(1, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    h.advance(5_000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn manual_idle_resume_uses_any_input_without_enabling_page_monitoring() {
    let mut h = Harness::new();
    h.store.monitor.config.enabled = false;
    h.matched = false;
    h.store
        .start(StartInput {
            category: "评测".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    h.advance(120_000, false);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("IDLE_PAUSE"));
    h.step(1_000, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    h.advance(5_000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
    assert!(h.store.pending_records().unwrap().is_empty());
}

#[test]
fn auto_idle_pause_does_not_resume_for_other_apps_or_untrusted_pages() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(120_000, false);
    h.matched = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = true;
    h.ready = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.ready = true;
    h.step(1_000, false);
    assert!(h.saved(id).is_paused);
    h.step(1, true);
    assert!(!h.saved(id).is_paused);
}

#[test]
fn late_sample_catches_idle_gap_before_accepting_new_input() {
    let mut h = Harness::new();
    h.store.monitor.config.times.idle_pause_seconds = 2;
    let id = h.start();
    h.step(1_000, true);
    h.step(1_000, false); // Already observed a quiet interval before the delayed sample.
    h.step(5_000, true); // No intermediate sample: gap is longer than pause threshold.
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 1_000);
    h.step(1_000, true);
    assert_eq!(h.saved(id).duration_ms, 2_000);
}

#[test]
fn end_deadline_wins_when_input_arrives_exactly_at_deadline_for_manual_work() {
    let mut h = Harness::new();
    h.matched = false;
    h.store
        .start(StartInput {
            category: "文档".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.step(1_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    assert!(h.store.active().unwrap().is_none());
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 1_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_and_recovery_never_use_idle_auto_resume() {
    let mut h = Harness::new();
    h.matched = false;
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(120_000, false);
    h.store.pause(id).unwrap(); // Explicit pause replaces the idle reason.
    h.step(1_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MANUAL"));
    h.advance(500_000, false);
    assert_eq!(h.saved(id).status, "WORKING");
    h.store
        .connection
        .execute(
            "UPDATE work_records SET recovery_pending=1,pause_reason='IDLE_PAUSE' WHERE id=?1",
            [id],
        )
        .unwrap();
    h.step(1_000, true);
    assert!(h.saved(id).is_paused && h.saved(id).recovery_pending);
}

#[test]
fn failed_pause_is_atomic_and_retries_trim_once() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(119_000, false);
    h.store.connection.execute_batch("CREATE TRIGGER fail_idle BEFORE UPDATE ON work_records WHEN NEW.pause_reason='IDLE_PAUSE' BEGIN SELECT RAISE(ABORT,'injected'); END;").unwrap();
    h.clock.advance(1_000);
    let now = h.clock.now();
    let result = h.store.monitor_tick(
        NativeSample {
            at: now,
            last_input_ticks: h.input,
            chrome_foreground: true,
            unlocked: true,
            reliable: true,
        },
        now,
    );
    assert!(result.is_err());
    assert!(!h.saved(id).is_paused);
    assert_eq!(
        h.store
            .connection
            .query_row(
                "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        1
    );
    h.store
        .connection
        .execute_batch("DROP TRIGGER fail_idle")
        .unwrap();
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn idle_pause_threshold_validation_and_sampling_use_configured_boundary() {
    let mut times = TrackingTimes::default();
    for invalid in [0, -1, 86401, times.idle_end_seconds] {
        times.idle_pause_seconds = invalid;
        assert!(times.validate().is_err());
    }
    let mut h = Harness::new();
    h.store.monitor.config.times.idle_pause_seconds = 2;
    h.store.monitor.config.poll_interval_seconds = 5;
    h.start();
    assert!(h.store.monitor_sample_due(h.clock.now().ticks_ms + 2_000));
}

#[test]
fn continuous_input_does_not_false_pause_at_a_one_second_threshold() {
    let mut h = Harness::new();
    h.store.monitor.config.times.idle_pause_seconds = 1;
    let id = h.start();
    for _ in 0..20 {
        h.step(1_000, true);
        assert!(!h.saved(id).is_paused);
    }
    assert_eq!(h.saved(id).duration_ms, 20_000);
}

#[test]
fn scheduler_gap_excludes_downtime_and_needs_input_after_reconfirmation() {
    let mut h = Harness::new();
    h.matched = false;
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    h.step(180_000, true);
    assert!(h.saved(id).is_paused); // System gap raised the input floor to this sample.
    h.step(1, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
}
```

## E:\WorkMemo\src-tauri\src\lib.rs

```rust
use serde::Serialize;
use tauri::{Emitter, Manager};

mod appearance;
mod browser_bridge;
mod browser_protocol;
mod clock;
mod connection;
mod dashboard;
mod database;
mod desktop;
mod monitor;
mod native_activity;
mod presentation;
#[allow(dead_code)] // Shared with the separately built native host CLI.
mod registration;
mod service;
mod sound;
mod windows;

/// A real IPC round trip verifies that the desktop backend is available.
#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "WorkMemo",
        version: env!("CARGO_PKG_VERSION"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .register_uri_scheme_protocol("background", |context, request| {
            presentation::background_response(context.app_handle(), request.uri().path())
        })
        .setup(|app| {
            app.manage(database::data_tools::ArchiveSelection(
                std::sync::Mutex::new(None),
            ));
            app.manage(connection::ConnectionState::initialize(app));
            app.manage(service::Backend::initialize(app));
            app.manage(desktop::IslandState::initialize(app));
            windows::initialize(app)?;
            app.manage(appearance::AppearanceState::initialize(app));
            app.manage(presentation::initialize(app)?);
            app.manage(dashboard::initialize(app)?);
            desktop::setup(app)?;
            if std::env::args().any(|a| a == "--demo") {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn_blocking(move || {
                    let result = (|| -> Result<(), String> {
                        {
                            let backend = handle.state::<service::Backend>();
                            let mut guard = backend.inner.lock().map_err(|_| "数据锁异常")?;
                            guard.as_mut().map_err(|e| e.clone())?.seed_demo()?;
                        }
                        dashboard::open_impl(&handle, "all", "demo", false)
                    })();
                    if let Err(error) = result {
                        let _ = handle.emit("workmemo:runtime-error", error);
                    }
                });
            }
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            presentation::get_presentation,
            presentation::save_presentation,
            presentation::import_background,
            service::confirm_work,
            service::enter_browsing,
            dashboard::open_dashboard,
            dashboard::get_dashboard_address,
            dashboard::get_today_workload,
            dashboard::seed_demo_data,
            dashboard::clear_demo_data,
            database::data_tools::detect_preview_data,
            database::data_tools::inspect_backup,
            database::data_tools::create_backup,
            database::data_tools::restore_backup,
            database::data_tools::preview_migration,
            database::data_tools::import_preview,
            windows::open_panel,
            windows::get_layout_settings,
            windows::set_layout_density,
            windows::set_layout_options,
            windows::reset_window_layout,
            windows::set_window_dirty,
            windows::close_panel,
            connection::get_connection_status,
            connection::repair_browser_connection,
            connection::open_browser_extension,
            appearance::get_appearance,
            appearance::save_appearance,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
            service::query_history,
            service::delete_record,
            service::get_pending_records,
            service::settle_record,
            service::get_monitor_config,
            service::get_category_names,
            service::save_category_names,
            service::save_monitor_config,
            sound::preview_sound,
            service::get_notice,
            service::defer_notice,
            service::show_main,
            service::exit_app,
        ])
        .build(tauri::generate_context!())
        .expect("WorkMemo failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if windows::has_drafts(app) {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:request-close", ());
                    return;
                }
                for (_, w) in app.webview_windows() {
                    let _ = windows::capture(&w.as_ref().window());
                }
                if let Err(error) = desktop::save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                if let Err(error) = app.state::<service::Backend>().save_on_exit() {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:storage-error", error);
                } else {
                    dashboard::cleanup(app);
                }
            }
        });
}

#[cfg(debug_assertions)]
pub fn monitor_probe() -> String {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let application_id = &context.config().identifier;
    match native_activity::sample() {
        Ok(sample)=>serde_json::json!({"application_id":application_id,"native_available":sample.reliable,"unlocked":sample.unlocked,
            "chrome_foreground":sample.chrome_foreground,"last_input_age_ms":sample.at.ticks_ms.saturating_sub(sample.last_input_ticks)}).to_string(),
        Err(error)=>serde_json::json!({"application_id":application_id,"native_available":false,"error":error}).to_string(),
    }
}

pub fn prepare_demo_data() -> Result<String, String> {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let identifier = &context.config().identifier;
    let path = registration::data_root()?
        .join(identifier)
        .join("workmemo.sqlite3");
    let mut store = database::Store::open(&path, Box::new(clock::SystemClock::new()))?;
    let before = store.active()?.map(|r| r.id);
    let count = store.seed_demo()?;
    let after = store.active()?.map(|r| r.id);
    if before != after {
        return Err("演示准备未能保留活动任务。".into());
    }
    Ok(serde_json::json!({"version":env!("CARGO_PKG_VERSION"),"identifier":identifier,"demo_records":count,"active_preserved":true}).to_string())
}
```

## E:\WorkMemo\src-tauri\src\monitor.rs

```rust
use crate::clock::TimePoint;
use serde::{Deserialize, Serialize};

pub const RECENT_INPUT_MS: i64 = 5_000;
pub const BROWSER_TIMEOUT_MS: i64 = 15_000;

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
pub struct WorkUrl {
    pub id: i64,
    #[serde(default = "default_match_mode")]
    pub match_mode: String,
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(deny_unknown_fields)]
pub struct TrackingTimes {
    pub idle_pause_seconds: i64,
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
    pub away_pause_seconds: i64,
    pub hold_seconds: i64,
}
impl Default for TrackingTimes {
    fn default() -> Self {
        Self {
            idle_pause_seconds: 120,
            idle_warning_seconds: 300,
            idle_end_seconds: 420,
            away_pause_seconds: 120,
            hold_seconds: 600,
        }
    }
}
impl TrackingTimes {
    pub fn validate(&self) -> Result<(), String> {
        if [
            self.idle_pause_seconds,
            self.idle_warning_seconds,
            self.idle_end_seconds,
            self.away_pause_seconds,
            self.hold_seconds,
        ]
        .iter()
        .any(|v| !(1..=86400).contains(v))
        {
            return Err("计时参数必须为 1 到 86400 秒的整数。".into());
        }
        if self.idle_pause_seconds >= self.idle_end_seconds {
            return Err("空闲暂停时间必须早于空闲结束时间。".into());
        }
        if self.idle_warning_seconds >= self.idle_end_seconds {
            return Err("空闲提醒时间必须早于空闲结束时间。".into());
        }
        Ok(())
    }
}
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct MonitorConfig {
    pub enabled: bool,
    pub revision: i64,
    pub rules: Vec<WorkUrl>,
    pub times: TrackingTimes,
    pub poll_interval_seconds: i64,
    pub auto_resume_manual: bool,
    #[serde(default)]
    pub browsing_only: bool,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct RuleInput {
    #[serde(default = "default_match_mode")]
    pub match_mode: String,
    pub url_prefix: String,
    pub category: String,
}
#[derive(Clone, Debug, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ConfigInput {
    pub enabled: bool,
    pub expected_revision: i64,
    pub rules: Vec<RuleInput>,
    pub times: TrackingTimes,
    pub poll_interval_seconds: i64,
    pub auto_resume_manual: bool,
}

#[derive(Clone, Copy, Debug)]
pub struct NativeSample {
    pub at: TimePoint,
    pub last_input_ticks: i64,
    pub chrome_foreground: bool,
    pub unlocked: bool,
    pub reliable: bool,
}

#[derive(Clone, Debug)]
pub struct PageSample {
    pub at: TimePoint,
    pub focused: bool,
    pub rule_id: Option<i64>,
    pub revision: i64,
    pub ready: bool,
}

#[derive(Clone, Debug, Serialize)]
pub struct StartCandidate {
    pub id: u64,
    pub rule_id: i64,
    pub category: String,
}
#[derive(Clone, Debug, Default, Serialize)]
pub struct MonitorStatus {
    pub browsing_only: bool,
    pub browse_ready: bool,
    pub browse_category: Option<String>,
    pub start_candidate: Option<StartCandidate>,
    pub enabled: bool,
    pub browser_connected: bool,
    pub native_available: bool,
    pub work_page: bool,
    pub idle_warning: bool,
    pub message: String,
    pub revision: i64,
    pub idle_pause_seconds: i64,
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
    pub away_pause_remaining_seconds: Option<i64>,
}

#[derive(Default)]
pub struct Runtime {
    pub candidate: Option<StartCandidate>,
    pub candidate_sequence: u64,
    pub browse_ready_rule: Option<i64>,
    pub page_activity_at: Option<i64>,
    pub active: bool,
    pub events_failed: bool,
    pub config: MonitorConfig,
    pub native: Option<NativeSample>,
    pub page: Option<PageSample>,
    pub last_trusted_page: Option<i64>,
    pub browser_owner: Option<u64>,
    pub last_tick: Option<i64>,
    pub last_input: Option<i64>,
    pub record_id: Option<i64>,
    pub entered_at: Option<i64>,
    pub page_was_matched: bool,
    pub away_since: Option<i64>,
    pub monitor_pause_since: Option<i64>,
    pub input_floor: i64,
    pub warning_dismissed_for: Option<i64>,
    pub status: MonitorStatus,
}

impl Runtime {
    pub fn record_changed(&mut self, id: i64, at: TimePoint) {
        self.candidate = None;
        self.status.start_candidate = None;
        self.config.browsing_only = false;
        self.status.browsing_only = false;
        self.record_id = Some(id);
        self.last_input = Some(at.ticks_ms);
        self.away_since = None;
        self.monitor_pause_since = None;
        self.warning_dismissed_for = None;
        self.status.idle_warning = false;
    }
    pub fn record_ended(&mut self, at: TimePoint) {
        self.record_id = None;
        self.input_floor = at.ticks_ms;
        self.away_since = None;
        self.monitor_pause_since = None;
        self.status.idle_warning = false;
    }
}

pub fn normalize_url(value: &str) -> Result<String, String> {
    if value.len() > 2048 {
        return Err("工作 URL 不能超过 2048 字节。".into());
    }
    let mut url =
        url::Url::parse(value.trim()).map_err(|_| "请输入完整的 http 或 https 工作 URL。")?;
    if !["http", "https"].contains(&url.scheme())
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err("工作 URL 只支持不含用户名或密码的 http/https 地址。".into());
    }
    url.set_query(None);
    url.set_fragment(None);
    let result = url.to_string();
    if result.len() > 2048 {
        return Err("规范化后的 URL 过长。".into());
    }
    Ok(result)
}

pub fn default_match_mode() -> String {
    "path_prefix".into()
}
pub fn normalize_rule(value: &str, mode: &str) -> Result<String, String> {
    match mode {
        "path_prefix" => normalize_url(value),
        "origin" => {
            let value = normalize_url(value)?;
            let url = url::Url::parse(&value).map_err(|_| "站点无效")?;
            Ok(format!("{}/", url.origin().ascii_serialization()))
        }
        "domain_suffix" => {
            let value = value.trim().trim_start_matches('.');
            if value.is_empty()
                || value.len() > 253
                || value.contains(['/', ':', '?', '#', '@', '*', '\\'])
            {
                return Err(
                    "请输入域名，例如 cn-beijing-vpc.fcapp.run，不含协议、端口或路径。".into(),
                );
            }
            let host = url::Host::parse(value).map_err(|_| "域名无效")?;
            let url::Host::Domain(domain) = host else {
                return Err("域名后缀不能是 IP 地址。".into());
            };
            if !domain.contains('.')
                || domain.split('.').any(|label| {
                    label.is_empty()
                        || label.len() > 63
                        || label.starts_with('-')
                        || label.ends_with('-')
                        || !label
                            .bytes()
                            .all(|b| b.is_ascii_alphanumeric() || b == b'-')
                })
            {
                return Err("请输入有效的完整域名后缀。".into());
            }
            Ok(domain)
        }
        _ => Err("未知的网址匹配模式，请更新应用及扩展。".into()),
    }
}

pub fn supports_match_modes(capable: bool, rules: &[WorkUrl]) -> bool {
    capable || rules.iter().all(|r| r.match_mode == "path_prefix")
}
#[cfg(test)]
mod matching_tests {
    use super::*;
    #[test]
    fn rule_validation_and_legacy_capabilities() {
        assert_eq!(
            normalize_rule("https://moonshot.feishu.cn/sheets/a?q=1", "origin").unwrap(),
            "https://moonshot.feishu.cn/"
        );
        assert_eq!(
            normalize_rule(".CN-BEIJING-VPC.fcapp.run", "domain_suffix").unwrap(),
            "cn-beijing-vpc.fcapp.run"
        );
        for value in [
            "https://example.com",
            "localhost",
            "example.com/",
            "example.com:443",
            "evil@host.com",
            "*",
            "127.0.0.1",
            "bad..example.com",
        ] {
            assert!(normalize_rule(value, "domain_suffix").is_err(), "{value}");
        }
        assert!(normalize_rule("https://user:pass@example.com", "origin").is_err());
        assert!(normalize_rule("https://example.com", "unknown").is_err());
        let mut rules = vec![WorkUrl {
            id: 1,
            url_prefix: "https://example.com/".into(),
            category: "开发".into(),
            match_mode: default_match_mode(),
        }];
        assert!(supports_match_modes(false, &rules));
        rules[0].match_mode = "origin".into();
        assert!(!supports_match_modes(false, &rules));
        assert!(supports_match_modes(true, &rules));
    }
}
```

## E:\WorkMemo\src-tauri\src\service.rs

```rust
use crate::{
    browser_bridge,
    monitor::{ConfigInput, MonitorConfig, NativeSample},
    native_activity,
};
use crate::{
    clock::{Clock, SystemClock},
    database::{
        HistoryPage, HistoryQuery, Notice, Result, SettleInput, Snapshot, StartInput, Store,
        WorkRecord,
    },
};
use std::{
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};
use tauri::{Emitter, Manager, State};

pub(crate) type SharedStore = Arc<Mutex<Result<Store>>>;
pub struct Backend {
    pub(crate) inner: SharedStore,
    pub tray_ready: AtomicBool,
    pub exiting: AtomicBool,
}

impl Backend {
    pub fn initialize(app: &tauri::App) -> Self {
        let directory = app.path().app_local_data_dir();
        let opened = app
            .path()
            .app_local_data_dir()
            .map_err(|e| format!("无法定位本地数据目录：{e}"))
            .and_then(|directory| {
                Store::open(
                    &directory.join("workmemo.sqlite3"),
                    Box::new(SystemClock::new()),
                )
            });
        let inner = Arc::new(Mutex::new(opened));
        if let Ok(mut guard) = inner.lock() {
            if let Ok(store) = guard.as_mut() {
                if let Ok(dir) = app.path().app_config_dir() {
                    if let Err(e) = crate::database::data_tools::recover_pending(store, &dir) {
                        *guard = Err(e);
                    }
                }
                if let Ok(store) = guard.as_mut() {
                    store.sound_config = app
                        .path()
                        .app_config_dir()
                        .ok()
                        .map(|p| p.join("window-layout.json"));
                    store.activate_monitoring();
                }
            }
        }
        if let Ok(directory) = directory {
            let ready = inner.lock().ok().is_some_and(|g| g.is_ok());
            if ready {
                if let Err(error) = browser_bridge::start(inner.clone(), &directory) {
                    if let Ok(mut guard) = inner.lock() {
                        if let Ok(store) = guard.as_mut() {
                            store.warning = Some(error);
                        }
                    }
                } else {
                    let handle = app.handle().clone();
                    std::thread::spawn(move || {
                        let _ = handle
                            .state::<crate::connection::ConnectionState>()
                            .refresh(true);
                    });
                }
            }
        }
        let weak = Arc::downgrade(&inner);
        let app_handle = app.handle().clone();
        let signals = native_activity::listen();
        std::thread::spawn(move || {
            let mut presented = None;
            let mut last_pending = None;
            let mut listener_ok = true;
            let mut reported_error: Option<String> = None;
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                let mut notice = None;
                let mut active_id = None;
                let mut candidate_id = None;
                let mut browsing = false;
                let mut runtime_failure: Option<String> = None;
                // Sample after the preceding loop has finished creating and positioning the window.
                // Creation emits transient move events, so those events must not overwrite saved coordinates.
                if let Some(window) = app_handle.get_webview_window("notice") {
                    if let Ok(position) = window.outer_position() {
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .moved(position);
                    }
                }
                if let Err(error) = app_handle.state::<crate::desktop::IslandState>().flush() {
                    runtime_failure = Some(format!("状态岛设置未能保存：{error}"));
                }
                if let Ok(mut guard) = shared.lock() {
                    if let Ok(store) = guard.as_mut() {
                        observe_sound(store, false);
                        let now = SystemClock::new().now();
                        for signal in signals.try_iter() {
                            match signal {
                                Ok(signal) => {
                                    if !signal.available {
                                        if let Err(error) = store.system_unavailable(signal.at) {
                                            store.warning = Some(error.clone());
                                            runtime_failure = Some(error);
                                        }
                                    }
                                    store.monitor.native = None;
                                }
                                Err(error) => {
                                    listener_ok = false;
                                    store.monitor.events_failed = true;
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    let _ = store.system_unavailable(now);
                                }
                            }
                        }
                        let sample = if store.monitor_sample_due(now.ticks_ms) {
                            match native_activity::sample() {
                                Ok(mut sample) => {
                                    sample.reliable &= listener_ok;
                                    sample
                                }
                                Err(error) => {
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    NativeSample {
                                        at: now,
                                        last_input_ticks: 0,
                                        chrome_foreground: false,
                                        unlocked: false,
                                        reliable: false,
                                    }
                                }
                            }
                        } else {
                            store.monitor.native.unwrap()
                        };
                        let now = SystemClock::new().now();
                        if let Err(error) = store.monitor_tick(sample, now) {
                            store.warning = Some(error.clone());
                            runtime_failure = Some(error);
                        }
                        observe_sound(store, true);
                        match store.current_notice() {
                            Ok(value) => notice = value,
                            Err(error) => {
                                store.warning = Some(error.clone());
                                runtime_failure = Some(error);
                            }
                        }
                        match store.snapshot() {
                            Ok(snapshot) => {
                                if last_pending != Some(snapshot.pending_count) {
                                    let _ = app_handle.emit("workmemo:data-changed", ());
                                    last_pending = Some(snapshot.pending_count);
                                }
                                candidate_id =
                                    snapshot.monitoring.start_candidate.as_ref().map(|c| c.id);
                                browsing = snapshot.monitoring.browsing_only;
                                active_id = snapshot.active.map(|record| record.id);
                            }
                            Err(error) => runtime_failure = Some(error),
                        }
                    }
                }
                let key = notice
                    .as_ref()
                    .map(|n| format!("{}:{}", n.kind, n.record.id))
                    .or_else(|| candidate_id.map(|id| format!("candidate:{id}")))
                    .or_else(|| {
                        if browsing && app_handle.state::<crate::desktop::IslandState>().enabled() {
                            return Some("browsing".into());
                        }
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .enabled()
                            .then_some(active_id)
                            .flatten()
                            .map(|id| format!("active:{id}"))
                    });
                if key != presented {
                    match crate::desktop::present_notice(
                        &app_handle,
                        key.is_some(),
                        notice.is_some(),
                        candidate_id.is_some(),
                    ) {
                        Ok(()) => presented = key,
                        Err(error) => {
                            let message =
                                format!("提醒窗口未能显示，记录仍保留在待补全列表：{error}");
                            if let Ok(mut guard) = shared.lock() {
                                if let Ok(store) = guard.as_mut() {
                                    store.warning = Some(message.clone());
                                }
                            }
                            runtime_failure = Some(message);
                        }
                    }
                }
                if let Some(error) = runtime_failure {
                    if reported_error.as_ref() != Some(&error) {
                        // Surface background failures without stealing keyboard focus.
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = crate::desktop::set_visibility(
                                &window.as_ref().window(),
                                true,
                                false,
                            );
                        }
                        let _ = app_handle.emit("workmemo:runtime-error", error.clone());
                    }
                    reported_error = Some(error);
                } else if listener_ok {
                    if let Ok(mut guard) = shared.lock() {
                        if let Ok(store) = guard.as_mut() {
                            if store.monitor.native.is_some_and(|sample| sample.reliable) {
                                if let Some(previous) = reported_error.take() {
                                    if store.warning.as_ref() == Some(&previous) {
                                        store.warning = None;
                                    }
                                    let _ = app_handle.emit("workmemo:runtime-recovered", previous);
                                }
                            }
                        }
                    }
                }
            }
        });
        Self {
            inner,
            tray_ready: AtomicBool::new(false),
            exiting: AtomicBool::new(false),
        }
    }

    pub fn save_on_exit(&self) -> Result<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| "数据服务锁异常，未能保存当前任务。")?;
        // A window showing a startup database error must still be closable.
        if let Ok(store) = guard.as_mut() {
            if let Err(error) = store.pause_for_close() {
                store.warning = Some(format!("关闭时保存失败，已阻止关闭，请重试：{error}"));
                return Err(error);
            }
        }
        Ok(())
    }
}

pub(crate) async fn access<T: Send + 'static>(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<T> + Send + 'static,
) -> Result<T> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = shared
            .lock()
            .map_err(|_| "本地数据服务异常，请重新打开应用。")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        observe_sound(store, false);
        let result = action(store);
        observe_sound(store, true);
        result
    })
    .await
    .map_err(|e| format!("数据操作未能完成：{e}"))?
}

async fn execute(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<()> + Send + 'static,
) -> Result<Snapshot> {
    access(shared, move |store| {
        // Resolve expired automatic deadlines before a manual command can
        // pause/finish the same record or start another one.
        before_action(store)?;
        action(store)?;
        store.snapshot()
    })
    .await
}

fn before_action(store: &mut Store) -> Result<()> {
    if store.monitor.active {
        let sample = native_activity::sample();
        let now = SystemClock::new().now();
        let mut sample = sample.unwrap_or(NativeSample {
            at: now,
            last_input_ticks: 0,
            chrome_foreground: false,
            unlocked: false,
            reliable: false,
        });
        sample.reliable &= !store.monitor.events_failed;
        store.monitor_tick(sample, now)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn query_history(state: State<'_, Backend>, query: HistoryQuery) -> Result<HistoryPage> {
    access(state.inner.clone(), move |store| store.query_history(query)).await
}

#[tauri::command]
pub async fn delete_record(state: State<'_, Backend>, id: i64) -> Result<()> {
    access(state.inner.clone(), move |store| store.delete_record(id)).await
}

#[tauri::command]
pub async fn get_snapshot(state: State<'_, Backend>) -> Result<Snapshot> {
    access(state.inner.clone(), |store| store.snapshot()).await
}

#[tauri::command]
pub async fn start_task(
    state: State<'_, Backend>,
    input: StartInput,
    expected_active_id: Option<i64>,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.start_checked(input, expected_active_id)
    })
    .await
}

#[tauri::command]
pub async fn pause_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.pause(id)).await
}

#[tauri::command]
pub async fn resume_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.resume(id)).await
}

#[tauri::command]
pub async fn finish_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.finish(id)).await
}

#[tauri::command]
pub async fn get_pending_records(state: State<'_, Backend>) -> Result<Vec<WorkRecord>> {
    access(state.inner.clone(), |store| store.pending_records()).await
}

#[tauri::command]
pub async fn settle_record(state: State<'_, Backend>, input: SettleInput) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.settle(input)).await
}

#[tauri::command]
pub async fn get_monitor_config(state: State<'_, Backend>) -> Result<MonitorConfig> {
    access(state.inner.clone(), |store| store.monitor_config()).await
}
#[tauri::command]
pub async fn get_category_names(
    state: State<'_, Backend>,
) -> Result<crate::database::categories::CategoryNames> {
    access(state.inner.clone(), |store| store.category_names()).await
}
#[tauri::command]
pub async fn save_category_names(
    app: tauri::AppHandle,
    state: State<'_, Backend>,
    input: crate::database::categories::CategoryNames,
) -> Result<crate::database::categories::CategoryNames> {
    let saved = access(state.inner.clone(), move |store| {
        store.save_category_names(input)
    })
    .await?;
    let _ = app.emit("workmemo:categories-changed", ());
    Ok(saved)
}
#[tauri::command]
pub async fn save_monitor_config(
    state: State<'_, Backend>,
    input: ConfigInput,
) -> Result<MonitorConfig> {
    access(state.inner.clone(), move |store| {
        before_action(store)?;
        store.save_monitor_config(input)
    })
    .await
}
#[tauri::command]
pub async fn get_notice(state: State<'_, Backend>) -> Result<Option<Notice>> {
    access(state.inner.clone(), |store| store.current_notice()).await
}
#[tauri::command]
pub async fn defer_notice(state: State<'_, Backend>, id: i64, kind: String) -> Result<()> {
    access(state.inner.clone(), move |store| {
        store.defer_notice(id, &kind)
    })
    .await
}
#[tauri::command]
pub fn show_main(app: tauri::AppHandle, settlement: bool) -> Result<()> {
    crate::desktop::show_main(&app, settlement)
}
#[tauri::command]
pub fn exit_app(app: tauri::AppHandle, state: State<'_, Backend>) -> Result<()> {
    if let Err(error) = crate::desktop::save_island_position(&app) {
        let _ = app.emit(
            "workmemo:runtime-error",
            format!("状态岛设置未能保存：{error}"),
        );
    }
    if crate::windows::has_drafts(&app) {
        let _ = app.emit("workmemo:request-close", ());
        return Err("请先保存或放弃二级窗口中的修改，再退出。".into());
    }
    state.save_on_exit()?;
    state.exiting.store(true, Ordering::Relaxed);
    app.exit(0);
    Ok(())
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let backend = window.state::<Backend>();
        let _ = crate::windows::capture(window);
        if matches!(window.label(), "settings" | "history" | "settlement") {
            api.prevent_close();
            let _ = window.emit("workmemo:request-close", ());
            return;
        }
        if window.label() == "notice" {
            api.prevent_close();
            let result = (|| -> Result<()> {
                let mut guard = backend.inner.lock().map_err(|_| "本地服务锁异常。")?;
                let store = guard.as_mut().map_err(|e| e.clone())?;
                if let Some(notice) = store.current_notice()? {
                    store.defer_notice(notice.record.id, &notice.kind)?;
                } else {
                    window.state::<crate::desktop::IslandState>().disable()?;
                }
                Ok(())
            })();
            if let Err(error) = result {
                let _ = window.emit("workmemo:storage-error", error);
            }
            return;
        }
        if window.label() == "main"
            && backend.tray_ready.load(Ordering::Relaxed)
            && !backend.exiting.load(Ordering::Relaxed)
        {
            api.prevent_close();
            if let Err(error) = crate::desktop::set_visibility(window, false, false) {
                let _ = window.emit("workmemo:storage-error", error.to_string());
            }
            return;
        }
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}

#[tauri::command]
pub async fn enter_browsing(state: State<'_, Backend>) -> Result<Snapshot> {
    execute(state.inner.clone(), |store| store.enter_browsing()).await
}
#[tauri::command]
pub async fn confirm_work(
    state: State<'_, Backend>,
    candidate_id: Option<u64>,
) -> Result<Snapshot> {
    let own = crate::native_activity::own_process_foreground();
    execute(state.inner.clone(), move |store| {
        store.confirm_work(candidate_id, own)
    })
    .await
}

fn observe_sound(store: &mut Store, enabled: bool) {
    if let Ok(active) = store.active() {
        let state = active.map(|r| crate::sound::Status {
            id: r.id,
            paused: r.is_paused,
            recovery: r.recovery_pending,
        });
        let cues = store
            .sounds
            .observe(state, store.monitor.status.idle_warning);
        if enabled
            && store
                .sound_config
                .as_ref()
                .and_then(|p| crate::windows::load(p).ok())
                .is_some_and(|layout| layout.sound_enabled)
        {
            for cue in cues {
                let _ = crate::sound::play(cue);
            }
        }
    }
}
```

## E:\WorkMemo\src-tauri\src\tracking.rs

```rust
use super::*;
use crate::monitor::*;
use serde::Serialize;
use std::collections::HashSet;

#[derive(Clone, Debug, Serialize)]
pub struct Notice {
    pub kind: String,
    pub record: WorkRecord,
    pub idle_warning_seconds: i64,
    pub idle_end_seconds: i64,
}

impl Store {
    pub fn monitor_config(&self) -> Result<MonitorConfig> {
        let (enabled, revision, times, poll_interval_seconds, auto_resume_manual, browsing_only) = self
            .connection
            .query_row(
                "SELECT enabled,revision,idle_warning_seconds,idle_end_seconds,away_pause_seconds,hold_seconds,poll_interval_seconds,auto_resume_manual,browsing_only,idle_pause_seconds FROM monitoring_settings WHERE id=1",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, TrackingTimes { idle_pause_seconds: r.get(9)?, idle_warning_seconds: r.get(2)?, idle_end_seconds: r.get(3)?, away_pause_seconds: r.get(4)?, hold_seconds: r.get(5)? }, r.get(6)?, r.get(7)?, r.get(8)?)),
            )
            .map_err(db_error)?;
        let mut statement = self
            .connection
            .prepare("SELECT id,url_prefix,category,match_mode FROM work_urls ORDER BY id")
            .map_err(db_error)?;
        let rules = statement
            .query_map([], |r| {
                Ok(WorkUrl {
                    id: r.get(0)?,
                    url_prefix: r.get(1)?,
                    category: r.get(2)?,
                    match_mode: r.get(3)?,
                })
            })
            .map_err(db_error)?
            .collect::<rusqlite::Result<Vec<_>>>()
            .map_err(db_error)?;
        times.validate()?;
        if !(1..=5).contains(&poll_interval_seconds) {
            return Err("检测间隔必须为 1 到 5 秒。".into());
        }
        Ok(MonitorConfig {
            browsing_only,
            poll_interval_seconds,
            auto_resume_manual,
            times,
            enabled,
            revision,
            rules,
        })
    }

    pub fn save_monitor_config(&mut self, input: ConfigInput) -> Result<MonitorConfig> {
        input.times.validate()?;
        if !(1..=5).contains(&input.poll_interval_seconds) {
            return Err("检测间隔必须为 1 到 5 秒。".into());
        }
        if input.rules.len() > 50 || (input.enabled && input.rules.is_empty()) {
            return Err("请配置 1 到 50 条工作 URL 后启用自动识别。".into());
        }
        let mut seen = HashSet::new();
        let mut rules = Vec::new();
        for rule in input.rules {
            let prefix = normalize_rule(&rule.url_prefix, &rule.match_mode)?;
            if !seen.insert((rule.match_mode.clone(), prefix.clone())) {
                return Err("工作 URL 重复，请合并重复规则。".into());
            }
            if !["评测", "质检", "开发", "文档"].contains(&rule.category.as_str()) {
                return Err("请选择有效的工作类别。".into());
            }
            rules.push((prefix, rule.category, rule.match_mode));
        }
        let current = self.monitor_config()?;
        if input.expected_revision != current.revision {
            return Err("监测配置已变化，请重新读取。".into());
        }
        let now = self.clock.now();
        let active = self.active()?.filter(|r| {
            r.control_mode == "AUTO"
                && !r.recovery_pending
                && r.pause_reason.as_deref() != Some("MANUAL")
        });
        let duration = active.as_ref().map(|r| self.elapsed(r, now)).transpose()?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if let (Some(record), Some(duration)) = (&active, duration) {
            if !record.is_paused {
                write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
            }
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3,control_mode=?4 WHERE id=?5",
                params![duration,duration/1000,if input.enabled{"MONITOR"}else{"MANUAL"},if input.enabled{"AUTO"}else{"MANUAL"},record.id]).map_err(db_error)?;
        }
        tx.execute("DELETE FROM work_urls", []).map_err(db_error)?;
        for (prefix, category, mode) in rules {
            tx.execute(
                "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
                params![prefix, category, mode],
            )
            .map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET enabled=?1,revision=revision+1,idle_warning_seconds=?2,idle_end_seconds=?3,away_pause_seconds=?4,hold_seconds=?5,poll_interval_seconds=?6,auto_resume_manual=?7,idle_pause_seconds=?8 WHERE id=1",
            params![input.enabled,input.times.idle_warning_seconds,input.times.idle_end_seconds,input.times.away_pause_seconds,input.times.hold_seconds,input.poll_interval_seconds,input.auto_resume_manual,input.times.idle_pause_seconds],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        if active.is_some() {
            self.segment = None;
            self.monitor.monitor_pause_since = Some(now.ticks_ms);
        }
        self.monitor.config = self.monitor_config()?;
        self.monitor.status.idle_pause_seconds = self.monitor.config.times.idle_pause_seconds;
        self.monitor.status.idle_warning_seconds = self.monitor.config.times.idle_warning_seconds;
        self.monitor.status.idle_end_seconds = self.monitor.config.times.idle_end_seconds;
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.away_since = None;
        self.monitor.status.away_pause_remaining_seconds = None;
        self.monitor.input_floor = now.ticks_ms;
        Ok(self.monitor.config.clone())
    }

    pub fn activate_monitoring(&mut self) {
        self.monitor.active = true;
        self.monitor.status.browsing_only = self.monitor.config.browsing_only;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.idle_pause_seconds = self.monitor.config.times.idle_pause_seconds;
        self.monitor.status.idle_warning_seconds = self.monitor.config.times.idle_warning_seconds;
        self.monitor.status.idle_end_seconds = self.monitor.config.times.idle_end_seconds;
    }

    pub fn observe_page(&mut self, page: PageSample) {
        if page.ready && page.revision == self.monitor.config.revision {
            self.monitor.last_trusted_page = Some(page.at.ticks_ms);
        }
        self.monitor.page = Some(page);
    }

    pub fn monitor_sample_due(&self, now: i64) -> bool {
        self.monitor.page_activity_at.is_some()
            || self.monitor.native.is_none_or(|sample| {
                now.saturating_sub(sample.at.ticks_ms)
                    >= self.monitor.config.poll_interval_seconds * 1000
            })
            || self.monitor.last_input.is_some_and(|last| {
                [
                    self.monitor.config.times.idle_pause_seconds * 1000,
                    self.monitor.config.times.idle_warning_seconds * 1000,
                    self.monitor.config.times.idle_end_seconds * 1000,
                ]
                .iter()
                .any(|threshold| {
                    now >= last + threshold
                        && self
                            .monitor
                            .native
                            .is_none_or(|s| s.at.ticks_ms < last + threshold)
                })
            })
    }

    pub fn observe_browser_page(&mut self, client: u64, page: PageSample) {
        // A background Chrome profile cannot overwrite the focused profile.
        if page.focused
            || self.monitor.browser_owner.is_none()
            || self.monitor.browser_owner == Some(client)
        {
            self.monitor.browser_owner = Some(client);
            self.observe_page(page);
        }
    }

    pub fn observe_browser_activity(&mut self, client: u64) {
        if self.monitor.browser_owner == Some(client) {
            if let Some(page) = self.monitor.page.as_ref().filter(|p| {
                p.focused
                    && p.ready
                    && p.rule_id.is_some()
                    && p.revision == self.monitor.config.revision
            }) {
                self.monitor.page_activity_at = Some(page.at.ticks_ms);
            }
        }
    }

    // Close/trim current-process intervals at a trusted monotonic boundary.
    // Old sessions and legacy baselines are never reconstructed from wall time.
    fn close_at(
        &mut self,
        cutoff: i64,
        reason: &str,
        finish: bool,
        confirmed: TimePoint,
    ) -> Result<()> {
        let Some(record) = self.active()? else {
            return Ok(());
        };
        if record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL") {
            return Ok(());
        }
        if finish {
            self.monitor.status.idle_warning = false;
        }
        let duration = self.elapsed(&record, confirmed)?;
        let tx = self.connection.transaction().map_err(db_error)?;
        if !record.is_paused {
            write_segment(&tx, self.segment.as_ref(), record.id, duration, true)?;
        }
        tx.execute(
            "UPDATE work_segments SET duration_ms=MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            checkpoint_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_time=start_time+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),
            end_ticks_ms=start_ticks_ms+MAX(0,MIN(duration_ms,?1-start_ticks_ms)),state='CLOSED'
            WHERE record_id=?2 AND clock_session=?3 AND start_ticks_ms IS NOT NULL",
            params![cutoff, record.id, self.clock_session],
        )
        .map_err(db_error)?;
        let total:i64=tx.query_row("SELECT legacy_duration_ms+COALESCE((SELECT SUM(duration_ms) FROM work_segments WHERE record_id=?1),0) FROM work_records WHERE id=?1",[record.id],|r|r.get(0)).map_err(db_error)?;
        tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason=?3 WHERE id=?4",params![total,total/1000,if finish{None}else{Some(reason)},record.id]).map_err(db_error)?;
        if finish {
            finish_row(&tx, record.id, record.start_time, confirmed.wall_ms, reason)?;
        }
        tx.commit().map_err(db_error)?;
        self.segment = None;
        if finish {
            self.monitor.record_ended(confirmed);
            self.monitor.input_floor = cutoff;
        }
        Ok(())
    }

    fn tracking_deadlines(&self, last: Option<i64>) -> Vec<(i64, u8, &'static str, i64)> {
        let times = &self.monitor.config.times;
        let mut deadlines = Vec::new();
        if let Some(last) = last {
            deadlines.push((
                last.saturating_add(times.idle_end_seconds * 1000),
                0,
                "IDLE",
                last,
            ));
        }
        if let Some(away) = self.monitor.away_since {
            deadlines.push((
                away.saturating_add((times.away_pause_seconds + times.hold_seconds) * 1000),
                1,
                "AWAY",
                away.saturating_add(times.away_pause_seconds * 1000),
            ));
        }
        if let Some(pause) = self.monitor.monitor_pause_since {
            deadlines.push((
                pause.saturating_add(times.hold_seconds * 1000),
                2,
                "RECOVERY",
                pause,
            ));
        }
        deadlines.sort_by_key(|d| (d.0, d.1));
        deadlines
    }

    pub fn system_unavailable(&mut self, at: TimePoint) -> Result<()> {
        self.close_at(at.ticks_ms, "MONITOR", false, self.clock.now())?;
        self.monitor.monitor_pause_since.get_or_insert(at.ticks_ms);
        self.monitor.page = None;
        self.monitor.entered_at = None;
        self.monitor.page_was_matched = false;
        self.monitor.input_floor = self.clock.now().ticks_ms;
        self.monitor.status.idle_warning = false;
        Ok(())
    }

    pub fn monitor_tick(&mut self, sample: NativeSample, now: TimePoint) -> Result<()> {
        if !self.monitor.active {
            return Ok(());
        }
        let last_tick = self.monitor.last_tick.replace(now.ticks_ms);
        if let Some(last) = last_tick.filter(|last| now.ticks_ms.saturating_sub(*last) > 10_000) {
            self.system_unavailable(TimePoint {
                ticks_ms: last,
                wall_ms: now.wall_ms.saturating_sub(now.ticks_ms - last).max(0),
            })?;
        }
        let previous_native = self.monitor.native;
        self.monitor.native = Some(sample);
        let native_ok = sample.reliable
            && sample.unlocked
            && now.ticks_ms.saturating_sub(sample.at.ticks_ms) <= 10_000
            && sample.last_input_ticks <= now.ticks_ms
            && sample.last_input_ticks >= 0;
        if !native_ok {
            self.system_unavailable(now)?;
        }
        let old_input = self.monitor.last_input;
        let new_input = if native_ok {
            Some(old_input.map_or(sample.last_input_ticks, |old| {
                old.max(sample.last_input_ticks)
            }))
        } else {
            old_input
        };
        let protected = |record: &WorkRecord| {
            record.recovery_pending || record.pause_reason.as_deref() == Some("MANUAL")
        };
        // Resolve old deadlines before fresh input resets inactivity. This also
        // catches a pause crossed between two samples without counting the gap.
        if let (Some(old), Some(new)) = (old_input, new_input) {
            if new > old && self.active()?.is_some_and(|r| !protected(&r)) {
                if let Some((deadline, _, reason, cutoff)) = self
                    .tracking_deadlines(Some(old))
                    .into_iter()
                    .find(|d| d.0 <= new)
                {
                    self.close_at(cutoff, reason, true, now)?;
                    self.monitor.input_floor = deadline.saturating_sub(1);
                } else if new
                    >= old.saturating_add(self.monitor.config.times.idle_pause_seconds * 1000)
                    // A delta between two last-input values alone cannot prove
                    // inactivity: multiple inputs can happen between samples.
                    // Require an observed quiet interval (or a protected scheduler gap).
                    && (previous_native.is_some_and(|s| s.at.ticks_ms.saturating_sub(old) >= 1_000)
                        || last_tick.is_some_and(|last| now.ticks_ms.saturating_sub(last) > 10_000))
                    && self.active()?.is_some_and(|r| r.pause_reason.as_deref() != Some("IDLE_PAUSE"))
                {
                    self.close_at(old, "IDLE_PAUSE", false, now)?;
                    self.monitor.input_floor = self.monitor.input_floor.max(old);
                }
            }
        }
        self.monitor.last_input = new_input;
        if new_input != old_input {
            self.monitor.warning_dismissed_for = None;
        }
        let connected = self
            .monitor
            .page
            .as_ref()
            .is_some_and(|p| now.ticks_ms.saturating_sub(p.at.ticks_ms) <= BROWSER_TIMEOUT_MS);
        let page_known = connected
            && self
                .monitor
                .page
                .as_ref()
                .is_some_and(|p| p.ready && p.revision == self.monitor.config.revision);
        let rule = self
            .monitor
            .page
            .as_ref()
            .and_then(|page| {
                self.monitor
                    .config
                    .rules
                    .iter()
                    .find(|rule| Some(rule.id) == page.rule_id)
            })
            .cloned();
        let matched = page_known
            && self.monitor.config.enabled
            && sample.chrome_foreground
            && self.monitor.page.as_ref().is_some_and(|p| p.focused)
            && rule.is_some();
        if !page_known
            || !self.monitor.config.enabled
            || self.monitor.config.browsing_only
            || self.active()?.is_some()
            || self
                .monitor
                .candidate
                .as_ref()
                .is_some_and(|c| rule.as_ref().is_none_or(|r| r.id != c.rule_id))
        {
            self.monitor.candidate = None;
        }
        if matched && !self.monitor.page_was_matched {
            self.monitor.entered_at = self.monitor.page.as_ref().map(|page| page.at.ticks_ms);
        }
        if !matched {
            self.monitor.entered_at = None;
        }
        self.monitor.page_was_matched = matched;
        let activity = self.monitor.page_activity_at.take();
        let candidate_input = new_input.map(|last| {
            if matched
                && native_ok
                && last > self.monitor.input_floor
                && now.ticks_ms - last <= RECENT_INPUT_MS
            {
                if let Some(at) = activity.filter(|at| {
                    *at >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                        && *at <= now.ticks_ms
                        && now.ticks_ms - *at <= 2_000
                }) {
                    return last.max(at);
                }
            }
            last
        });

        if !page_known
            || !self.monitor.config.enabled
            || self
                .monitor
                .browse_ready_rule
                .is_some_and(|id| rule.as_ref().is_none_or(|r| r.id != id))
        {
            self.monitor.browse_ready_rule = None;
        }
        if matched
            && native_ok
            && candidate_input.is_some_and(|i| {
                i > self.monitor.input_floor && now.ticks_ms - i <= RECENT_INPUT_MS
            })
        {
            self.monitor.browse_ready_rule = rule.as_ref().map(|r| r.id);
        }
        // Manual pauses remain protected from deadlines. A new input after the pause,
        // on a confirmed matching page, may explicitly resume the same record under
        // automatic monitoring when the user has enabled this behavior.
        if matched
            && native_ok
            && !self.monitor.config.browsing_only
            && self.monitor.config.auto_resume_manual
        {
            if let Some(record) = self.active()?.filter(|r| {
                r.is_paused && !r.recovery_pending && r.pause_reason.as_deref() == Some("MANUAL")
            }) {
                if let (Some(last), Some(entered)) = (candidate_input, self.monitor.entered_at) {
                    if last >= entered
                        && last > self.monitor.input_floor
                        && now.ticks_ms - last <= RECENT_INPUT_MS
                    {
                        self.resume_at(
                            record.id,
                            TimePoint {
                                ticks_ms: last,
                                wall_ms: now
                                    .wall_ms
                                    .saturating_sub(now.ticks_ms - last)
                                    .max(record.start_time),
                            },
                            "AUTO",
                        )?;
                    }
                }
            }
        }

        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if record.control_mode == "AUTO" && (!page_known || !native_ok) {
                let cutoff = self
                    .monitor
                    .last_trusted_page
                    .unwrap_or(now.ticks_ms)
                    .min(now.ticks_ms);
                if !record.is_paused || record.pause_reason.as_deref() != Some("MONITOR") {
                    self.close_at(cutoff, "MONITOR", false, now)?;
                    self.monitor.monitor_pause_since = Some(cutoff);
                }
            }
            let deadlines = self.tracking_deadlines(new_input);
            if let Some((deadline, _, reason, cutoff)) =
                deadlines.first().copied().filter(|d| d.0 <= now.ticks_ms)
            {
                self.close_at(cutoff, reason, true, now)?;
                self.monitor.input_floor = deadline;
            } else {
                if native_ok
                    && new_input.is_some_and(|last| {
                        now.ticks_ms.saturating_sub(last)
                            >= self.monitor.config.times.idle_pause_seconds * 1000
                    })
                    && self
                        .active()?
                        .is_some_and(|r| !r.is_paused || r.pause_reason.as_deref() == Some("AWAY"))
                {
                    let last = new_input.unwrap();
                    self.close_at(last, "IDLE_PAUSE", false, now)?;
                    self.monitor.input_floor = self.monitor.input_floor.max(last);
                }
                // Re-read after close_at: its transaction may have just paused the record.
                if let Some(current) = self.active()? {
                    if current.control_mode == "AUTO" && native_ok && page_known {
                        if matched {
                            self.monitor.away_since = None;
                            let fresh = candidate_input.is_some_and(|last| {
                                last >= self.monitor.entered_at.unwrap_or(now.ticks_ms)
                                    && last > self.monitor.input_floor
                                    && now.ticks_ms - last <= RECENT_INPUT_MS
                            });
                            if current.is_paused
                                && matches!(
                                    current.pause_reason.as_deref(),
                                    Some("AWAY" | "MONITOR" | "IDLE_PAUSE")
                                )
                                && fresh
                                && !self.monitor.config.browsing_only
                            {
                                let last = candidate_input.unwrap();
                                self.resume_at(
                                    current.id,
                                    TimePoint {
                                        ticks_ms: last,
                                        wall_ms: now
                                            .wall_ms
                                            .saturating_sub(now.ticks_ms - last)
                                            .max(current.start_time),
                                    },
                                    "AUTO",
                                )?;
                            }
                        } else {
                            let away = *self.monitor.away_since.get_or_insert(now.ticks_ms);
                            if now.ticks_ms
                                >= away.saturating_add(
                                    self.monitor.config.times.away_pause_seconds * 1000,
                                )
                                && !current.is_paused
                            {
                                self.close_at(
                                    away.saturating_add(
                                        self.monitor.config.times.away_pause_seconds * 1000,
                                    ),
                                    "AWAY",
                                    false,
                                    now,
                                )?;
                            }
                        }
                    } else if current.control_mode == "MANUAL"
                        && native_ok
                        && current.pause_reason.as_deref() == Some("IDLE_PAUSE")
                        && !self.monitor.config.browsing_only
                        && new_input.is_some_and(|last| {
                            last > self.monitor.input_floor
                                && now.ticks_ms - last <= RECENT_INPUT_MS
                        })
                    {
                        let last = new_input.unwrap();
                        self.resume_at(
                            current.id,
                            TimePoint {
                                ticks_ms: last,
                                wall_ms: now
                                    .wall_ms
                                    .saturating_sub(now.ticks_ms - last)
                                    .max(current.start_time),
                            },
                            "MANUAL",
                        )?;
                    }
                }
            }
        }

        if self.active()?.is_none() && matched && native_ok {
            if let (Some(last), Some(entered), Some(rule)) =
                (candidate_input, self.monitor.entered_at, rule)
            {
                if last >= entered
                    && last > self.monitor.input_floor
                    && now.ticks_ms - last <= RECENT_INPUT_MS
                {
                    if !self.monitor.config.browsing_only && self.monitor.candidate.is_none() {
                        self.monitor.candidate_sequence += 1;
                        self.monitor.candidate = Some(StartCandidate {
                            id: self.monitor.candidate_sequence,
                            rule_id: rule.id,
                            category: rule.category.clone(),
                        });
                    }
                }
            }
        }
        if let Some(record) = self.active()?.filter(|r| !protected(r)) {
            if let Some(last) = self.monitor.last_input {
                let input_wall = now
                    .wall_ms
                    .saturating_sub(now.ticks_ms.saturating_sub(last))
                    .max(record.start_time);
                if new_input != old_input || record.last_input_time.is_none() {
                    self.connection
                        .execute(
                            "UPDATE work_records SET last_input_time=?1 WHERE id=?2",
                            params![input_wall, record.id],
                        )
                        .map_err(db_error)?;
                }
                self.monitor.status.idle_warning = native_ok
                    && now.ticks_ms.saturating_sub(last)
                        >= self.monitor.config.times.idle_warning_seconds * 1000
                    && now.ticks_ms.saturating_sub(last)
                        < self.monitor.config.times.idle_end_seconds * 1000
                    && self.monitor.warning_dismissed_for != Some(last);
            }
        } else {
            self.monitor.status.idle_warning = false;
        }
        self.monitor.status.away_pause_remaining_seconds = if native_ok
            && page_known
            && !matched
            && self
                .active()?
                .is_some_and(|r| r.control_mode == "AUTO" && !r.is_paused && !r.recovery_pending)
        {
            self.monitor.away_since.map(|away| {
                let remaining = away
                    .saturating_add(self.monitor.config.times.away_pause_seconds * 1000)
                    .saturating_sub(now.ticks_ms)
                    .max(0);
                (remaining + 999) / 1000
            })
        } else {
            None
        };
        self.monitor.status.browsing_only = self.monitor.config.browsing_only;
        self.monitor.status.start_candidate = self.monitor.candidate.clone();
        self.monitor.status.browse_ready = self.monitor.config.enabled
            && page_known
            && native_ok
            && self.monitor.browse_ready_rule.is_some();
        self.monitor.status.browse_category = if self.monitor.status.browse_ready {
            self.monitor
                .config
                .rules
                .iter()
                .find(|r| Some(r.id) == self.monitor.browse_ready_rule)
                .map(|r| r.category.clone())
        } else {
            None
        };
        self.monitor.status.enabled = self.monitor.config.enabled;
        self.monitor.status.revision = self.monitor.config.revision;
        self.monitor.status.native_available = native_ok;
        self.monitor.status.browser_connected = connected;
        self.monitor.status.work_page = matched;
        self.monitor.status.message = if !native_ok {
            "系统状态暂不可确认，已暂停计时"
        } else if !self.monitor.config.enabled {
            "自动页面识别未启用；手动计时仍有空闲保护"
        } else if self.monitor.config.browsing_only {
            if matched {
                "仅浏览 · 工作页面已就绪，点击开始记录"
            } else {
                "仅浏览 · 当前不计时"
            }
        } else if self.monitor.candidate.is_some() {
            "工作页面已就绪，等待确认开始记录"
        } else if self.active()?.is_some_and(|r| r.recovery_pending) {
            "有上次待恢复任务，请先继续或结束"
        } else if self
            .active()?
            .is_some_and(|r| r.pause_reason.as_deref() == Some("MANUAL"))
        {
            if self.monitor.config.auto_resume_manual {
                "已手动暂停，返回工作页面操作后自动继续"
            } else {
                "已手动暂停，等待明确继续"
            }
        } else if !connected {
            "等待 Chrome 扩展连接"
        } else if !page_known {
            "等待扩展同步最新工作页面规则"
        } else if !matched {
            "当前不在配置的工作页面"
        } else if self.active()?.is_none() {
            "已识别工作页面，等待新的鼠标或键盘活动"
        } else {
            "工作监测正常"
        }
        .into();
        self.checkpoint()
    }

    pub fn current_notice(&self) -> Result<Option<Notice>> {
        let id:Option<i64>=self.connection.query_row("SELECT record_id FROM end_reminders JOIN work_records ON work_records.id=end_reminders.record_id WHERE dismissed=0 AND status='FINISHED' AND settlement_status='PENDING' AND is_demo=0 ORDER BY record_id LIMIT 1",[],|r|r.get(0)).optional().map_err(db_error)?;
        if let Some(id) = id {
            return Ok(Some(Notice {
                kind: "ended".into(),
                idle_warning_seconds: self.monitor.config.times.idle_warning_seconds,
                idle_end_seconds: self.monitor.config.times.idle_end_seconds,
                record: self.record(id)?,
            }));
        }
        if self.monitor.status.idle_warning {
            if let Some(record) = self.active()? {
                return Ok(Some(Notice {
                    kind: "idle".into(),
                    idle_warning_seconds: self.monitor.config.times.idle_warning_seconds,
                    idle_end_seconds: self.monitor.config.times.idle_end_seconds,
                    record,
                }));
            }
        }
        Ok(None)
    }
    pub fn defer_notice(&mut self, id: i64, kind: &str) -> Result<()> {
        match kind {
            "ended" => {
                self.connection
                    .execute(
                        "UPDATE end_reminders SET dismissed=1 WHERE record_id=?1",
                        [id],
                    )
                    .map_err(db_error)?;
            }
            "idle" => {
                if self.active()?.is_some_and(|r| r.id == id) {
                    self.monitor.warning_dismissed_for = self.monitor.last_input;
                    self.monitor.status.idle_warning = false;
                }
            }
            _ => return Err("提醒类型无效。".into()),
        }
        Ok(())
    }
}

impl Store {
    pub fn enter_browsing(&mut self) -> Result<()> {
        let active = self.active()?;
        let now = self.clock.now();
        let tx = self.connection.transaction().map_err(db_error)?;
        if let Some(r) = active.as_ref() {
            let duration = match self.segment.as_ref() {
                Some(s) if s.row_id == r.id => {
                    s.base_ms + now.ticks_ms.saturating_sub(s.started_ticks).max(0)
                }
                _ => r.duration_ms,
            };
            if !r.is_paused {
                write_segment(&tx, self.segment.as_ref(), r.id, duration, true)?;
            }
            tx.execute("UPDATE work_records SET duration_ms=?1,duration_seconds=?2,is_paused=1,pause_reason='MANUAL' WHERE id=?3",params![duration,duration/1000,r.id]).map_err(db_error)?;
        }
        tx.execute(
            "UPDATE monitoring_settings SET browsing_only=1 WHERE id=1",
            [],
        )
        .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        self.segment = None;
        self.monitor.config.browsing_only = true;
        self.monitor.browse_ready_rule = None;
        self.monitor.status.browse_ready = false;
        self.monitor.candidate = None;
        self.monitor.status.start_candidate = None;
        self.monitor.status.browsing_only = true;
        self.monitor.status.idle_warning = false;
        self.monitor.status.message = "仅浏览 · 当前不计时".into();
        self.monitor.input_floor = now.ticks_ms;
        Ok(())
    }
    pub fn confirm_work(&mut self, candidate_id: Option<u64>, own_focus: bool) -> Result<()> {
        let now = self.clock.now();
        let native = self
            .monitor
            .native
            .filter(|n| {
                n.reliable
                    && n.unlocked
                    && now.ticks_ms - n.at.ticks_ms <= 5000
                    && (n.chrome_foreground || own_focus)
            })
            .ok_or("无法确认系统状态，请返回工作页面后重试。")?;
        let _ = native;
        let page = self
            .monitor
            .page
            .as_ref()
            .filter(|p| {
                p.ready
                    && p.revision == self.monitor.config.revision
                    && now.ticks_ms - p.at.ticks_ms <= BROWSER_TIMEOUT_MS
            })
            .ok_or("页面连接已变化，请返回工作页面后重试。")?;
        let rule = self
            .monitor
            .config
            .rules
            .iter()
            .find(|r| Some(r.id) == page.rule_id)
            .cloned()
            .ok_or("当前页面未匹配工作规则。")?;
        if !self.monitor.config.enabled {
            return Err("请先启用工作页面识别。".into());
        }
        let active = self.active()?;
        if let Some(c) = candidate_id {
            if self
                .monitor
                .candidate
                .as_ref()
                .is_none_or(|p| p.id != c || p.rule_id != rule.id)
                || active.is_some()
            {
                return Err("开工提示已失效，请重新确认。".into());
            }
        } else if !self.monitor.config.browsing_only
            || self.monitor.browse_ready_rule != Some(rule.id)
        {
            return Err("请返回工作页面操作后，再点击开工入口。".into());
        }
        if let Some(record) = active {
            if record.recovery_pending {
                return Err("请先在主窗口处理上次待恢复的任务。".into());
            }
            if !record.is_paused {
                return Err("当前任务已在计时。".into());
            }
            self.resume_at(record.id, now, "AUTO")?;
        } else {
            self.start_at(
                StartInput {
                    category: rule.category,
                    quantity: None,
                    remark: String::new(),
                },
                "AUTO",
                now,
                false,
            )?;
        }
        Ok(())
    }
}

impl Store {
    pub fn browser_disconnected(&mut self, client: u64) {
        if self.monitor.browser_owner != Some(client) {
            return;
        }
        self.monitor.browser_owner = None;
        self.monitor.page = None;
        self.monitor.candidate = None;
        self.monitor.browse_ready_rule = None;
        self.monitor.status.start_candidate = None;
        self.monitor.status.browse_ready = false;
        self.monitor.status.browse_category = None;
        self.monitor.status.browser_connected = false;
    }
}
```

## E:\WorkMemo\src-tauri\src\tracking_tests.rs

```rust
use super::tests::{TestClock, TestDirectory};
use super::*;
use crate::monitor::*;

struct Harness {
    store: Store,
    clock: TestClock,
    input: i64,
    connected: bool,
    matched: bool,
    ready: bool,
}
impl Harness {
    fn new() -> Self {
        let clock = TestClock::new();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: 0,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
                    url_prefix: "https://work.example.test/tasks?ignored=1#fragment".into(),
                    category: "开发".into(),
                }],
            })
            .unwrap();
        store.activate_monitoring();
        let mut harness = Self {
            store,
            clock,
            input: 0,
            connected: true,
            matched: true,
            ready: true,
        };
        harness.tick();
        harness
    }
    fn tick_unconfirmed(&mut self) {
        let now = self.clock.now();
        if self.connected {
            self.store.observe_page(PageSample {
                at: now,
                focused: self.matched,
                rule_id: self
                    .matched
                    .then_some(self.store.monitor.config.rules[0].id),
                revision: self.store.monitor.config.revision,
                ready: self.ready,
            });
        }
        self.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: self.input,
                    chrome_foreground: self.matched,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
    }
    fn tick(&mut self) {
        self.tick_unconfirmed();
        self.accept();
    }
    // Existing timer scenarios model a user accepting the initial prompt immediately.
    // Dedicated confirmation tests below leave candidates unanswered explicitly.
    fn accept(&mut self) {
        if let Some(c) = self.store.monitor.candidate.clone() {
            self.store.confirm_work(Some(c.id), false).unwrap();
        }
    }
    fn step(&mut self, ms: i64, input: bool) {
        self.clock.advance(ms);
        if input {
            self.input = self.clock.now().ticks_ms;
        }
        self.tick();
    }
    fn advance(&mut self, mut ms: i64, input: bool) {
        while ms > 0 {
            let step = ms.min(5000);
            self.step(step, input);
            ms -= step;
        }
    }
    fn start(&mut self) -> i64 {
        self.step(1000, true);
        self.store.active().unwrap().unwrap().id
    }
    fn saved(&self, id: i64) -> WorkRecord {
        self.store.record(id).unwrap()
    }
}

#[test]
fn merely_open_or_background_page_does_not_start_and_new_input_starts_once() {
    let mut h = Harness::new();
    h.advance(30_000, false);
    assert!(h.store.active().unwrap().is_none());
    h.matched = false;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1, false);
    assert!(h.store.active().unwrap().is_none());
    let id = h.start();
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    let record = h.saved(id);
    assert_eq!(record.source, "AUTO");
    assert_eq!(record.control_mode, "AUTO");
    assert_eq!(record.quantity, None);
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn idle_thresholds_use_input_time_warning_cancels_and_seven_minutes_are_removed() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(299_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "idle");
    h.store.defer_notice(id, "idle").unwrap();
    h.step(1000, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1000, true);
    assert!(!h.store.monitor.status.idle_warning);
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(420_000, false);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 420_000));
    assert_eq!(record.duration_ms, 20_000);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "ended");
    h.step(5000, false);
    assert_eq!(
        h.store
            .connection
            .query_row(
                "SELECT count(*) FROM end_reminders WHERE record_id=?1",
                [id],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        1
    );
}

#[test]
fn idle_end_wins_over_away_and_rolls_back_the_two_minute_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(120_000, false);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("IDLE_PAUSE"));
    h.advance(300_000, false);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn other_application_input_cannot_extend_work_beyond_away_grace_or_twelve_minutes() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(119_999, true);
    assert!(!h.saved(id).is_paused);
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    h.advance(599_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("AWAY"));
    assert_eq!(record.duration_ms, 130_000);
    assert_eq!(
        record.confirmed_end_time.unwrap() - record.end_time.unwrap(),
        600_000
    );
}

#[test]
fn return_inside_hold_needs_new_input_and_resumes_same_record_excluding_pause() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(180_000, true);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    assert!(!h.saved(id).is_paused);
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).duration_ms, 140_000);
}

#[test]
fn equal_idle_and_away_deadlines_produce_one_idle_result() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(300_000, true);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 130_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[test]
fn first_input_at_idle_deadline_starts_new_record_instead_of_merging() {
    let mut h = Harness::new();
    let old = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    let current = h.store.active().unwrap().unwrap();
    assert_ne!(current.id, old);
    assert_eq!(current.duration_ms, 0);
    assert_eq!(h.saved(old).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_remains_protected_when_auto_resume_disabled() {
    let mut h = Harness::new();
    h.store.monitor.config.auto_resume_manual = false;
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.advance(900_000, false);
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).status, "WORKING");
    h.advance(10_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(180_000, true);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 135_000);
}

#[test]
fn lost_browser_connection_removes_unconfirmed_tail_and_recovers_only_with_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let trusted = h.clock.now();
    h.connected = false;
    h.advance(20_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.monitor.last_trusted_page, Some(trusted.ticks_ms));
    h.connected = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
}

#[test]
fn revoked_permission_is_unknown_not_a_counted_away_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.ready = false;
    h.advance(5000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn lock_or_suspended_scheduler_gap_never_counts_unknown_time() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let lock = h.clock.now();
    h.clock.advance(5000);
    h.store.system_unavailable(lock).unwrap();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.clock.advance(60_000);
    h.tick();
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn deferred_reminder_and_pending_record_survive_restart_without_blocking_new_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(id).unwrap();
        assert!(store.current_notice().unwrap().is_some());
        store.defer_notice(id, "ended").unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
    }
    let store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(store.current_notice().unwrap().is_none());
    assert_eq!(store.pending_records().unwrap()[0].id, id);
    assert!(store.active().unwrap().unwrap().recovery_pending);
}

#[test]
fn config_validation_conflict_and_storage_failure_keep_previous_rules() {
    let mut h = Harness::new();
    let original = h.store.monitor_config().unwrap();
    for url in [
        "file:///private",
        "https://name:password@work.example.test/",
        "not-a-url",
    ] {
        assert!(
            h.store
                .save_monitor_config(ConfigInput {
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    times: TrackingTimes::default(),
                    enabled: true,
                    expected_revision: original.revision,
                    rules: vec![RuleInput {
                        match_mode: "path_prefix".into(),
                        url_prefix: url.into(),
                        category: "开发".into()
                    }]
                })
                .is_err()
        );
    }
    h.store.connection.execute_batch("CREATE TRIGGER reject_rule BEFORE INSERT ON work_urls BEGIN SELECT RAISE(ABORT,'rule failure'); END;").unwrap();
    assert!(
        h.store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: original.revision,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
                    url_prefix: "https://other.example.test/".into(),
                    category: "开发".into()
                }]
            })
            .is_err()
    );
    let current = h.store.monitor_config().unwrap();
    assert_eq!(current.revision, original.revision);
    assert_eq!(current.rules, original.rules);
}

#[test]
fn delayed_detection_does_not_add_poll_delay_to_effective_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(419_000, false);
    h.step(4_003, false);
    let record = h.saved(id);
    assert_eq!(record.duration_ms, 10_000);
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 423_003));
}

#[test]
fn unconfirmed_browser_outage_cannot_hold_record_forever_while_input_continues() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.connected = false;
    h.advance(615_000, true);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("RECOVERY"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn background_browser_profiles_cannot_override_the_focused_profile() {
    let mut h = Harness::new();
    let at = h.clock.now();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let page = |focused| PageSample {
        at,
        focused,
        rule_id: focused.then_some(rule),
        revision,
        ready: true,
    };
    h.store.observe_browser_page(11, page(true));
    h.store.observe_browser_page(22, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(11));
    h.store.observe_browser_page(22, page(true));
    h.store.observe_browser_page(11, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(22));
}

#[test]
fn last_input_timestamp_does_not_move_when_wall_clock_changes_without_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.saved(id).last_input_time;
    h.clock.jump_wall(3_600_000);
    h.advance(5000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn second_schema_pending_intervals_survive_upgrade_without_an_upgrade_popup() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection
        .execute_batch(include_str!("../migrations/002_settlement.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=2;
        INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time)
        VALUES(10,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);
        INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(10,1000,2250,2250,1250,'CLOSED');").unwrap();
    let mut store = Store::initialize(connection, Box::new(TestClock::new()), None).unwrap();
    let pending = store.pending_records().unwrap();
    assert_eq!(pending[0].id, 10);
    assert_eq!(pending[0].duration_ms, 1250);
    assert_eq!(pending[0].quantity, None);
    assert!(store.current_notice().unwrap().is_none());
    store
        .settle(SettleInput {
            id: 10,
            expected_revision: 0,
            category: "开发".into(),
            quantity: 0.0,
            remark: "".into(),
        })
        .unwrap();
    assert_eq!(store.record(10).unwrap().duration_ms, 1250);
}

#[test]
fn automatic_finish_failure_rolls_back_trim_and_retries_without_duplicate_reminders() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.store.connection.execute_batch("CREATE TRIGGER reject_auto_end BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'auto end failure'); END;").unwrap();
    h.clock.advance(1);
    let now = h.clock.now();
    assert!(
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: h.input,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true
                },
                now
            )
            .is_err()
    );
    assert_eq!(h.saved(id).status, "WORKING");
    assert!(h.store.current_notice().unwrap().is_none());
    h.store
        .connection
        .execute_batch("DROP TRIGGER reject_auto_end")
        .unwrap();
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_rejects_bad_auth_and_replay_before_changing_page_state() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    crate::browser_bridge::start(shared.clone(), directory.db().parent().unwrap()).unwrap();
    let endpoint_path = directory
        .db()
        .parent()
        .unwrap()
        .join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let send = |stream: &mut TcpStream, token: String, sequence, focused| {
        let frame = BrowserFrame {
            match_modes: true,
            page_activity: false,
            version: 1,
            sequence,
            config_revision: revision,
            focused,
            ready: true,
            rule_id: Some(rule),
        };
        let mut bytes = serde_json::to_vec(&WireRequest { token, frame }).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        stream.flush().unwrap();
    };
    let mut bad = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    bad.set_read_timeout(Some(Duration::from_secs(2))).unwrap();
    send(&mut bad, "invalid".into(), 1, false);
    let mut line = String::new();
    let rejected = |result: std::io::Result<usize>| match result {
        Ok(0) => (),
        Err(error)
            if matches!(
                error.kind(),
                std::io::ErrorKind::ConnectionReset | std::io::ErrorKind::ConnectionAborted
            ) =>
        {
            ()
        }
        other => panic!("expected a rejected connection, got {other:?}"),
    };
    // Windows may close a rejected socket with FIN or RST. Neither may return
    // a successful reply or change the page state.
    rejected(BufReader::new(bad).read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    let mut valid = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    valid
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(valid.try_clone().unwrap());
    send(&mut valid, endpoint.token.clone(), 1, true);
    reader.read_line(&mut line).unwrap();
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&line).unwrap()["connected"],
        true
    );
    line.clear();
    send(&mut valid, endpoint.token, 1, false);
    rejected(reader.read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    drop(reader);
    drop(valid);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn unavailable_native_metadata_blocks_manual_start_and_resume_without_losing_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: h.input,
                chrome_foreground: true,
                unlocked: false,
                reliable: false,
            },
            now,
        )
        .unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into()
            })
            .is_err()
    );
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert!(h.saved(id).is_paused);
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 10000);
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_keeps_one_connection_between_heartbeats() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    let folder = directory.db().parent().unwrap().to_path_buf();
    crate::browser_bridge::start(shared.clone(), &folder).unwrap();
    let endpoint_path = folder.join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let mut stream = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    stream
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(stream.try_clone().unwrap());
    for sequence in 1..=3 {
        if sequence > 1 {
            // A real browser waits between heartbeats. Windows accepted sockets
            // inherit the listener's nonblocking mode unless explicitly reset.
            std::thread::sleep(Duration::from_millis(120));
        }
        let request = WireRequest {
            token: endpoint.token.clone(),
            frame: BrowserFrame {
                match_modes: true,
                page_activity: false,
                version: 1,
                sequence,
                config_revision: revision,
                focused: false,
                ready: true,
                rule_id: None,
            },
        };
        let mut bytes = serde_json::to_vec(&request).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        let mut reply = String::new();
        let length = reader.read_line(&mut reply).unwrap();
        assert!(length > 0, "connection closed before heartbeat {sequence}");
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&reply).unwrap()["connected"],
            true
        );
    }
    drop(reader);
    drop(stream);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn already_expired_record_cannot_be_resurrected_by_manual_finish_or_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    h.advance(420_000, false);
    h.store.finish(id).unwrap();
    assert!(h.store.resume(id).is_err());
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
}

#[test]
fn configured_deadlines_control_work_and_status() {
    let mut h = Harness::new();
    let mut cfg = h.store.monitor_config().unwrap();
    cfg.times = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 20,
        idle_end_seconds: 30,
        away_pause_seconds: 4,
        hold_seconds: 6,
    };
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times.clone(),
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.matched = false;
    h.tick();
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(4));
    h.advance(3_999, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(1));
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, None);
    h.advance(5_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 4_000);
}

#[test]
fn configured_idle_deadline_and_notice_are_consistent() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: TrackingTimes {
                idle_pause_seconds: 1,
                idle_warning_seconds: 2,
                idle_end_seconds: 4,
                ..TrackingTimes::default()
            },
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(1_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    let notice = h.store.current_notice().unwrap().unwrap();
    assert_eq!(
        (notice.idle_warning_seconds, notice.idle_end_seconds),
        (2, 4)
    );
    h.advance(2_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 0);
}

#[test]
fn schema_three_migrates_defaults_and_settings_persist_with_validation() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=3; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=8 WHERE id=1;").unwrap();
    }
    let chosen = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 12,
        idle_end_seconds: 23,
        away_pause_seconds: 34,
        hold_seconds: 45,
    };
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let old = store.monitor_config().unwrap();
        assert_eq!(old.times, TrackingTimes::default());
        assert_eq!(old.revision, 8);
        let rule = || {
            vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }]
        };
        let invalid = TrackingTimes {
            idle_warning_seconds: 24,
            idle_end_seconds: 23,
            ..chosen.clone()
        };
        assert!(
            store
                .save_monitor_config(ConfigInput {
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    enabled: true,
                    expected_revision: 8,
                    times: invalid,
                    rules: rule()
                })
                .is_err()
        );
        assert_eq!(store.monitor_config().unwrap().revision, 8);
        store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                enabled: true,
                expected_revision: 8,
                times: chosen.clone(),
                rules: rule(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    assert_eq!(store.monitor_config().unwrap().times, chosen);
    assert_eq!(store.monitor_config().unwrap().rules.len(), 1);
}

#[test]
fn saving_settings_clears_old_away_deadline_and_requires_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.tick();
    h.advance(5_000, true);
    assert!(h.store.monitor.away_since.is_some());
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    assert!(h.store.monitor.away_since.is_none());
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    h.matched = true;
    h.tick();
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn manual_pause_auto_resumes_same_record_only_after_fresh_matching_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.step(1_000, false);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert_eq!(h.saved(id).id, id);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.advance(121_000, true);
    assert!(!h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    h.advance(120_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
}

#[test]
fn manual_started_active_is_not_replaced_and_automatic_resume_switches_same_record_to_auto() {
    let mut h = Harness::new();
    h.store
        .start(StartInput {
            category: "文档".into(),
            quantity: None,
            remark: "".into(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    h.store.pause(id).unwrap();
    h.step(1_000, true);
    assert_eq!(h.saved(id).id, id);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
}

#[test]
fn checked_start_rejects_stale_or_missing_confirmation_without_modifying_task() {
    let mut h = Harness::new();
    let id = h.start();
    h.store.pause(id).unwrap();
    let input = || StartInput {
        category: "文档".into(),
        quantity: None,
        remark: "".into(),
    };
    assert!(h.store.start_checked(input(), None).is_err());
    assert!(h.store.start_checked(input(), Some(id + 1)).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).status, "WORKING");
    h.store.start_checked(input(), Some(id)).unwrap();
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("SWITCH"));
    assert_ne!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn browser_evidence_time_allows_first_input_before_next_state_machine_tick() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1_000, true);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(100);
    let input = h.clock.now();
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: input.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.accept();
    let active = h
        .store
        .active()
        .unwrap()
        .expect("first input after confirmed page should start");
    assert_eq!(active.control_mode, "AUTO");
    assert_eq!(active.duration_ms, 0);
}

#[test]
fn monitor_interval_is_validated_persisted_and_changes_sample_due() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 1);
    assert!(cfg.auto_resume_manual);
    let input = |seconds| ConfigInput {
        enabled: true,
        expected_revision: cfg.revision,
        times: cfg.times.clone(),
        poll_interval_seconds: seconds,
        auto_resume_manual: false,
        rules: cfg
            .rules
            .iter()
            .map(|r| RuleInput {
                match_mode: r.match_mode.clone(),
                url_prefix: r.url_prefix.clone(),
                category: r.category.clone(),
            })
            .collect(),
    };
    assert!(h.store.save_monitor_config(input(0)).is_err());
    assert!(h.store.save_monitor_config(input(6)).is_err());
    h.store.save_monitor_config(input(5)).unwrap();
    let saved = h.store.monitor_config().unwrap();
    assert_eq!(saved.poll_interval_seconds, 5);
    assert!(!saved.auto_resume_manual);
    let now = h.clock.now();
    h.store.monitor.native = Some(NativeSample {
        at: now,
        last_input_ticks: 0,
        chrome_foreground: true,
        unlocked: true,
        reliable: true,
    });
    assert!(!h.store.monitor_sample_due(now.ticks_ms + 4_999));
    assert!(h.store.monitor_sample_due(now.ticks_ms + 5_000));
}

#[test]
fn schema_four_migrates_options_without_changing_records_or_existing_thresholds() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/004_tracking_times.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=4; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=9,idle_warning_seconds=12,idle_end_seconds=23,away_pause_seconds=34,hold_seconds=45 WHERE id=1; INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time) VALUES(17,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);").unwrap();
    }
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let cfg = store.monitor_config().unwrap();
        assert_eq!(cfg.revision, 9);
        assert_eq!(cfg.poll_interval_seconds, 1);
        assert!(cfg.auto_resume_manual);
        assert_eq!(
            cfg.times,
            TrackingTimes {
                idle_pause_seconds: 22,
                idle_warning_seconds: 12,
                idle_end_seconds: 23,
                away_pause_seconds: 34,
                hold_seconds: 45
            }
        );
        assert_eq!(store.record(17).unwrap().duration_ms, 1250);
        store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: 9,
                times: cfg.times,
                poll_interval_seconds: 5,
                auto_resume_manual: false,
                rules: cfg
                    .rules
                    .into_iter()
                    .map(|r| RuleInput {
                        match_mode: r.match_mode.clone(),
                        url_prefix: r.url_prefix,
                        category: r.category,
                    })
                    .collect(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    let cfg = store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 5);
    assert!(!cfg.auto_resume_manual);
    assert_eq!(store.record(17).unwrap().duration_ms, 1250);
}

#[test]
fn manually_paused_task_is_not_auto_resumed_after_restart() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: String::new(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        store.pause(id).unwrap();
    }
    let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
    let cfg = store.monitor_config().unwrap();
    store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }],
        })
        .unwrap();
    store.activate_monitoring();
    clock.advance(1000);
    let now = clock.now();
    store.observe_page(PageSample {
        at: now,
        focused: true,
        rule_id: Some(store.monitor.config.rules[0].id),
        revision: store.monitor.config.revision,
        ready: true,
    });
    store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    let record = store.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
}

#[test]
fn input_before_page_evidence_does_not_start_or_backfill_unknown_time() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1000, true);
    let before_evidence = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: before_evidence,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_some());
}

#[test]
fn page_activity_starts_at_confirmation_without_backfilling_earlier_input() {
    let mut h = Harness::new();
    h.step(1000, false);
    let input = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let confirmed = h.clock.now();
    h.store.observe_browser_page(
        99,
        PageSample {
            at: confirmed,
            focused: true,
            rule_id: Some(h.store.monitor.config.rules[0].id),
            revision: h.store.monitor.config.revision,
            ready: true,
        },
    );
    h.store.observe_browser_activity(99);
    h.store.monitor.page_was_matched = false;
    h.store
        .monitor_tick(
            NativeSample {
                at: confirmed,
                last_input_ticks: input,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            confirmed,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.accept();
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, confirmed.wall_ms);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn confirmation_deduplicates_and_counts_only_after_acceptance() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let candidate = h.store.monitor.candidate.clone().unwrap();
    for _ in 0..4 {
        h.clock.advance(1000);
        h.input = h.clock.now().ticks_ms;
        h.tick_unconfirmed();
        assert_eq!(h.store.monitor.candidate.as_ref().unwrap().id, candidate.id);
        assert!(h.store.active().unwrap().is_none());
    }
    let confirmed = h.clock.now();
    h.store.confirm_work(Some(candidate.id), false).unwrap();
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, confirmed.wall_ms);
    assert_eq!(record.duration_ms, 0);
    assert!(h.store.confirm_work(Some(candidate.id), false).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, record.id);
}
#[test]
fn confirmation_survives_own_window_focus_but_rejects_stale_page() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.monitor.candidate.clone().unwrap();
    h.clock.advance(3000);
    let now = h.clock.now();
    h.store.observe_page(PageSample {
        at: now,
        focused: false,
        rule_id: Some(c.rule_id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: false,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.confirm_work(Some(c.id), false).is_err());
    h.store.confirm_work(Some(c.id), true).unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().start_time, now.wall_ms);
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.monitor.candidate.clone().unwrap();
    h.connected = false;
    h.clock.advance(16000);
    h.tick_unconfirmed();
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.confirm_work(Some(c.id), true).is_err());
    assert!(h.store.active().unwrap().is_none());
}
#[test]
fn browsing_blocks_new_work_and_protects_a_paused_task_until_explicit_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.step(1, false);
    h.advance(120000, false);
    assert!(h.saved(id).is_paused);
    h.store.enter_browsing().unwrap();
    h.advance(3600000, true);
    assert_eq!(h.saved(id).status, "WORKING");
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MANUAL"));
    h.matched = true;
    h.step(1000, true);
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.status.browse_ready);
    h.store.confirm_work(None, false).unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor.config.browsing_only);
    h.store.finish(id).unwrap();
    h.store.enter_browsing().unwrap();
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.monitor.status.browse_ready);
}
#[test]
fn browsing_intent_persists_across_restart_without_ending_work() {
    let d = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut s = Store::open(&d.db(), Box::new(clock.clone())).unwrap();
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
        id = s.active().unwrap().unwrap().id;
        s.enter_browsing().unwrap();
    }
    clock.advance(600000);
    let mut s = Store::open(&d.db(), Box::new(clock)).unwrap();
    s.activate_monitoring();
    assert!(s.monitor.config.browsing_only);
    assert!(s.monitor.status.browsing_only);
    let record = s.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn leaving_browse_mode_commits_atomically_with_start_or_resume() {
    let mut h = Harness::new();
    h.store.enter_browsing().unwrap();
    let trigger = "CREATE TRIGGER refuse_work_intent BEFORE UPDATE OF browsing_only ON monitoring_settings WHEN NEW.browsing_only=0 BEGIN SELECT RAISE(ABORT,'injected intent failure'); END;";
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: String::new()
            })
            .is_err()
    );
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.config.browsing_only);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.store.enter_browsing().unwrap();
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.config.browsing_only);
    let open: i64 = h
        .store
        .connection
        .query_row(
            "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(open, 0);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store.resume(id).unwrap();
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor_config().unwrap().browsing_only);
}

#[test]
fn schema_seven_rules_migrate_and_modes_round_trip_without_touching_active_work() {
    let h = Harness::new();
    h.store
        .connection
        .execute_batch("ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; UPDATE sqlite_sequence SET seq=99 WHERE name='work_urls'; ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;")
        .unwrap();
    let c = h.store.connection;
    let mut store = Store::initialize(c, Box::new(h.clock), None).unwrap();
    let config = store.monitor_config().unwrap();
    assert_eq!(config.rules[0].match_mode, "path_prefix");
    assert_eq!(
        store
            .connection
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name='work_urls'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        99
    );
    store
        .connection
        .execute(
            "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
            params![config.rules[0].url_prefix, "开发", "origin"],
        )
        .unwrap();
    let saved = store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: false,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/sheets/a".into(),
                    category: "开发".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    assert_eq!(saved.rules[0].url_prefix, "https://moonshot.feishu.cn/");
    assert_eq!(saved.rules[1].url_prefix, "cn-beijing-vpc.fcapp.run");
    assert_eq!(store.monitor_config().unwrap().rules, saved.rules);
}

#[test]
fn multiple_sites_for_one_work_keep_one_record_and_continuous_time() {
    let mut h = Harness::new();
    let config = h.store.monitor_config().unwrap();
    let config = h
        .store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/".into(),
                    category: "评测".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(5_000, true);
    for index in 0..6 {
        h.clock.advance(1_000);
        let now = h.clock.now();
        h.input = now.ticks_ms;
        h.store.observe_page(PageSample {
            at: now,
            focused: true,
            ready: true,
            revision: config.revision,
            rule_id: Some(config.rules[(index + 1) % 2].id),
        });
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: now.ticks_ms,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
        let snapshot = h.store.snapshot().unwrap();
        let record = snapshot.active.unwrap();
        assert_eq!(record.id, id);
        assert_eq!(record.category, "评测");
        assert!(!record.is_paused);
        assert!(snapshot.monitoring.start_candidate.is_none());
        assert!(snapshot.monitoring.away_pause_remaining_seconds.is_none());
        assert_eq!(snapshot.pending_count, 0);
    }
    h.store.finish(id).unwrap();
    assert_eq!(h.saved(id).duration_ms, 11_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[path = "idle_pause_tests.rs"]
mod idle_pause_tests;
```

## E:\WorkMemo\src\App.css

```css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); --content-gap: 12px; }
.desktop-frame[data-density="comfortable"] { --content-gap: 20px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: grid; grid-template-columns: auto auto minmax(64px, 1fr) auto; align-items: center; gap: 12px; flex-shrink: 0; min-height: 56px; padding: 8px 14px; background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: block; width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
.brand-name { display: block; font-size: 13px; font-weight: 600; letter-spacing: -.25px; white-space: nowrap; }
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.main-nav { display: flex; align-items: center; gap: 3px; }
button.nav-button { position: relative; width: 31px; height: 34px; padding: 5px; justify-content: center; color: var(--text-muted); background: transparent; box-shadow: none; border-radius: 9px; }
button.nav-button:hover:not(:disabled) { background: var(--control-hover); }
button.nav-button[aria-pressed="true"] { color: var(--accent-text); }
button.nav-button[aria-pressed="true"]::after { content: ""; position: absolute; height: 2px; left: 8px; right: 8px; bottom: -3px; border-radius: 2px; background: var(--accent); }
.category-strip { display: flex; gap: 6px; min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 3px 0; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.category-strip::-webkit-scrollbar { height: 2px; }
.category-strip::-webkit-scrollbar-thumb { border-radius: 2px; background: var(--scroll-thumb); }
.category-strip:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; border-radius: 6px; }
.category-chip { display: inline-flex; align-items: center; flex: 0 0 auto; gap: 6px; padding: 5px 9px; border-radius: 9px; font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgb(var(--surface-rgb) / 30%); white-space: nowrap; }
.category-chip span { font-variant-numeric: tabular-nums; }
.category-chip[data-current="true"] { color: var(--accent-text); background: var(--control-hover); }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; justify-self: end; grid-column: -2; }
.window-content { display: flex; flex-direction: column; min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { width: 100%; max-width: 648px; margin: 0 auto; padding: var(--content-gap) 24px 18px; outline: none; }
.workspace.is-active { margin-block: auto; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: var(--control-radius); background: var(--error-background); color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.resize-handle { position: absolute; z-index: 10; touch-action: none; }
.resize-North, .resize-South { left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
.resize-North { top: 0; }
.resize-South { bottom: 0; }
.resize-East, .resize-West { top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
.resize-East { right: 0; }
.resize-West { left: 0; }
.resize-NorthEast, .resize-NorthWest, .resize-SouthEast, .resize-SouthWest { width: 12px; height: 12px; }
.resize-NorthEast { top: 0; right: 0; cursor: nesw-resize; }
.resize-NorthWest { top: 0; left: 0; cursor: nwse-resize; }
.resize-SouthEast { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-SouthWest { bottom: 0; left: 0; cursor: nesw-resize; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--accent); color: var(--on-accent); border: 1px solid transparent; border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--accent-hover); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent-text); border-color: var(--line); justify-content: center; box-shadow: none; }
button.secondary:hover:not(:disabled) { background: var(--secondary-hover); }
button.text-button { width: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; box-shadow: none; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 27px; height: 30px; padding: 5px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .62)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }

.task-copy { min-width: 0; }
.task-copy h1 { margin: 0; font-size: 20px; font-weight: 550; letter-spacing: -.4px; }
.task-summary { margin: 7px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.meta-dot { margin-inline: 7px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; flex-shrink: 0; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(24px, 4.6vw, 34px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -.8px; line-height: 1.3; white-space: nowrap; }
.timer-long { font-size: clamp(18px, 3.5vw, 26px); }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 160px; overflow-y: auto; }
.actions { margin-top: calc(var(--content-gap) + 6px); }
.actions button { width: auto; justify-content: center; }
button.round-action { width: 42px; height: 42px; padding: 11px; flex: 0 0 auto; border-radius: 50%; }
.round-action .icon-pause { stroke-width: 3; }
.round-action .icon-play { fill: currentColor; stroke-width: 1; }
button.quiet-action { padding: 7px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); font-size: 12px; box-shadow: none; }
button.quiet-action:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button.quiet-action:not(.finish-action) { margin-inline: auto; }
.form-card { width: min(100%, 560px); margin: var(--content-gap) auto 0; }
.form-card h2 { font-size: 12px; color: var(--text-muted); font-weight: 500; margin: 0 0 9px; }
.work-form { display: grid; gap: 10px; }
.work-form > button { min-height: 34px; padding: 8px 12px; }
.form-note > summary { display: flex; align-items: center; gap: 5px; width: fit-content; font-size: 11px; list-style: none; }
.form-note > summary::-webkit-details-marker { display: none; }
.form-note .icon { width: 15px; height: 15px; }
.form-note[open] > summary { margin-bottom: 3px; }

label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / 96%); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 44px; max-height: 150px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: var(--control-radius); padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: var(--notice-text); background: var(--notice-background); border: 1px solid var(--notice-border); }
.notice p { margin: 0 0 6px; }
.error-banner { color: var(--error); background: var(--error-background); border: 1px solid var(--error-border); }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.field-error { display: block; margin-top: 6px; color: var(--error); font-size: 10px; overflow-wrap: anywhere; }
.field-count { display: block; text-align: right; margin-top: 4px; color: var(--text-muted); font-size: 10px; }
[aria-invalid="true"] { border-color: var(--error); }
.finished-card { border-color: var(--accent-text); }
.saved-feedback { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.switch-panel, .recent-panel, .connection-panel { margin-top: var(--content-gap); padding-top: 4px; font-size: 11px; }
.switch-panel { max-width: 560px; margin-inline: auto; }
summary { color: var(--text-muted); cursor: pointer; padding: 3px 0; }
details[open] > summary { margin-bottom: 15px; }
.connection-panel { margin-top: 15px; font-size: 10px; }
.connection-panel > p { font-size: 11px; }
.connection-panel button { margin-top: 10px; }
.record-list { list-style: none; padding: 0; margin: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list li:last-child { border-bottom: 0; }
.record-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
.record-heading strong { font-weight: 550; }
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent-text); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
.appearance-feedback { margin: 0 0 10px; color: var(--accent-text); }
.preview-notice { padding: 6px 9px; margin-bottom: 10px; font-size: 10px; }
.appearance-error-detail { font-size: 10px; }
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }

button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb)); border: 1px solid var(--line); }
.theme-sample span { height: 2px; width: 100%; background: var(--text-muted); border-radius: 2px; }
.theme-sample span:first-child { width: 60%; height: 4px; background: var(--accent); }
.theme-label { display: grid; gap: 5px; min-width: 0; }
.theme-label strong { font-size: 12px; font-weight: 600; }
.theme-label > span { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.opacity-heading { display: flex; align-items: center; justify-content: space-between; }
.opacity-heading output { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--accent-text); }
input.opacity-slider { padding: 0; margin: 10px 0 3px; border: 0; background: transparent; min-height: 24px; accent-color: var(--accent); cursor: pointer; }
.opacity-scale { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9px; }
button.reset-opacity { margin: 15px 0 0; padding: 6px 8px; font-size: 10px; }
.settings-actions { margin-top: 20px; }
.settings-actions button { justify-content: center; }
.appearance-dialog > .notice, .appearance-dialog > .error-banner { margin: 14px 0 0; }
@media (max-width: 540px) {
  .brand-name { font-size: 12px; }
  .titlebar { gap: 8px; padding-inline: 10px; }
  .workspace { padding-inline: 14px; }
}
@media (max-width: 380px) {
  .titlebar { gap: 4px; padding-inline: 8px; }
  .titlebar-drag { gap: 6px; }
  .brand-name { font-size: 11px; }
  .brand-mark { width: 25px; height: 25px; }
  button.nav-button { width: 27px; }
  .main-nav { gap: 0; }
  .window-controls { gap: 0; }
  .titlebar .window-control { width: 24px; }
  .workspace { padding-inline: 10px; }
  .task-row { gap: 10px; }
  .timer-card { padding: var(--content-gap); }
  .task-copy h1 { font-size: 17px; }
  .actions { gap: 14px; }
}
@media (prefers-reduced-motion: reduce) { button { transition: none; } }
.history-entry { margin-top: 15px; }
.history-dialog, .delete-dialog { width: min(500px, calc(100% - 32px)); max-height: calc(100% - 32px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.history-dialog::backdrop, .delete-dialog::backdrop { background: rgb(0 0 0 / 25%); }
.history-filters { display: grid; gap: 10px; margin-top: 18px; }
.history-filters input, .history-filters select { padding: 9px 6px; font-size: 11px; }
.history-filters .hint { margin-top: 0; }
.filter-category-row { display: grid; grid-template-columns: 1fr 90px; gap: 12px; align-items: end; }
.filter-category-row button { justify-content: center; }
.history-tabs { margin: 18px 0 15px; }
.history-tabs button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--secondary-hover); }
.history-overview { font-size: 11px; line-height: 1.8; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; margin: 13px 0 18px; }
.summary-grid > div { min-width: 0; padding: 11px 7px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); }
.summary-grid dt { font-size: 10px; color: var(--text-muted); }
.summary-grid dd { margin: 7px 0 0; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.summary-grid small { font-size: 9px; font-weight: normal; }
.history-empty { margin: 15px 0; font-size: 12px; line-height: 1.9; color: var(--text-muted); }
.history-records { list-style: none; margin: 0; padding: 0; }
.history-records li { padding: 15px 0; border-bottom: 1px solid var(--line); }
.history-records .record-remark { max-height: 110px; overflow: auto; }
button.delete-link { margin: 9px 0 0 auto; color: var(--error); }
.history-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 18px; font-size: 10px; color: var(--text-muted); }
.history-pagination button { width: auto; padding: 8px 10px; font-size: 11px; }
.stats-section { margin-top: 20px; }
.stats-section h3 { font-size: 12px; font-weight: 600; }
.stats-scroll { overflow-x: auto; }
.stats-section table { width: 100%; border-collapse: collapse; font-size: 10px; font-variant-numeric: tabular-nums; }
.stats-section th, .stats-section td { padding: 9px 5px; border-bottom: 1px solid var(--line); text-align: right; overflow-wrap: anywhere; }
.stats-section th { font-weight: 500; }
.stats-section tr > :first-child { text-align: left; white-space: nowrap; }
.stats-section thead { color: var(--text-muted); }
.history-feedback { color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.delete-dialog { width: min(350px, calc(100% - 40px)); }
.delete-dialog h2 { margin: 0; font-size: 17px; }
.delete-dialog > p { font-size: 12px; line-height: 1.8; }
.delete-record-detail { padding: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 11px; line-height: 1.8; max-height: 160px; overflow: auto; }
button.danger-button { color: var(--error); background: var(--error-background); border-color: var(--error-border); }
button.danger-button:hover:not(:disabled) { background: var(--error-background); border-color: var(--error); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / 98%); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.ui-dialog::backdrop { background: rgb(0 0 0 / 18%); }
.density-settings { margin: 20px 0 0; padding: 0; border: 0; }
.density-settings legend { margin-bottom: 10px; font-size: 12px; }
.density-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.density-options button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--control-hover); }
.utilities-panel { margin-top: 20px; font-size: 11px; }
.utilities-panel > button { margin-top: 12px; }
.note-heading { margin-top: 20px; font-size: 13px; }
.settlement-entry { margin-top: 12px; }
.settlement-panel { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); }
.settlement-panel h2 { margin: 0; font-size: 16px; }
.settlement-panel .settings-heading .secondary { width: auto; flex-shrink: 0; font-size: 12px; line-height: 1.5; }
.settlement-record { padding: 12px 0; border-top: 1px solid var(--line); }
.settlement-record summary { cursor: pointer; }
.settlement-form { display: grid; gap: 12px; margin-top: 12px; }
.monitor-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; font-size: 10px; color: var(--text-muted); }
.monitor-status button { flex-shrink: 0; }
.monitor-settings { margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
.island-frame { padding: 5px; }
.island-shell { flex-direction: row; align-items: center; border-radius: 32px; padding: 0 8px 0 14px; }
.island-drag { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 100%; cursor: grab; }
.island-mark { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; color: var(--accent); border: 1px solid var(--window-border); font-weight: 700; }
.island-info { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.island-info strong, .island-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.island-info strong { font-size: 14px; }
.island-info small { font-size: 11px; color: var(--text-secondary); }
.island-time { font: 600 15px ui-monospace, monospace; white-space: nowrap; }
.island-open { flex: 0 0 30px; width: 30px; height: 30px; margin-left: 5px; padding: 0; border-radius: 50%; }
.island-error { color: var(--accent); font-weight: bold; }


/* Desktop refresh: keep all color and surface choices tied to the four theme tokens. */
.icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 18px; line-height: 1; }
.icon svg, .window-control .icon svg { display: block; width: 1em; height: 1em; fill: currentColor; stroke: none; }
.window-control .icon { width: 16px; height: 16px; font-size: 14px; }
.app-shell { border-radius: var(--window-radius); }
.titlebar { min-height: 62px; padding: 10px 17px; border-bottom: 1px solid var(--line); }
.brand-mark { width: 30px; height: 30px; }
.brand-name { font-size: 14px; letter-spacing: -.35px; }
.main-nav { gap: 5px; }
button.nav-button { width: 34px; height: 34px; border-radius: 10px; }
button.nav-button[aria-pressed="true"] { background: var(--control-hover); }
button.nav-button[aria-pressed="true"]::after { bottom: -2px; }
.category-chip { padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; }
.workspace { max-width: 680px; padding: 20px 24px 24px; }
.workspace.is-active { margin-block: 0; }
.monitor-status { min-height: 42px; padding: 7px 11px; margin: 0 auto 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--surface-rgb) / 45%); font-size: 11px; }
.monitor-status button { border: 0; color: var(--accent-text); font-size: 11px; }
.timer-card { width: 100%; max-width: none; padding: 22px; border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .72)); }
.task-eyebrow { margin-bottom: 10px; color: var(--text-muted); font-size: 10px; font-weight: 600; letter-spacing: .05em; }
.task-eyebrow .icon { width: 14px; height: 14px; font-size: 13px; }
.task-copy h1 { font-size: 22px; font-weight: 650; letter-spacing: -.5px; }
.task-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.task-summary .meta-dot { margin: 0 2px; }
.task-control-mode { padding: 2px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--text-muted); font-size: 10px; }
.task-mode-hint { max-width: 310px; margin: 8px 0 0; color: var(--text-muted); font-size: 10px; line-height: 1.6; }
.timer { font-family: ui-monospace, Consolas, monospace; font-size: clamp(23px, 4vw, 32px); letter-spacing: -1px; }
.actions { gap: 12px; margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }
button.round-action { width: 38px; height: 38px; padding: 9px; }
button.quiet-action { padding: 8px 10px; }
.form-card { width: 100%; max-width: none; padding: 16px 18px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.work-form { gap: 12px; }
.work-form > button { min-height: 40px; font-weight: 600; }
.switch-panel { max-width: none; padding: 12px 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.switch-panel summary { font-weight: 600; color: var(--text-primary); }
.switch-confirm { margin-top: 18px; font-size: 12px; line-height: 1.8; }
.switch-confirm p { margin: 0; }
.confirm-actions { margin-top: 10px; }
.confirm-actions button { justify-content: center; }
.ui-dialog, .history-dialog, .appearance-dialog, .delete-dialog { padding: 22px; }
.settings-heading { padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.settings-heading h2 { font-size: 16px; }
.monitor-settings { margin-top: 18px; }
.monitor-rule { padding: 14px; border-radius: 12px; }
.monitor-rule legend { color: var(--text-primary); font-weight: 600; }
.monitor-toggle input { accent-color: var(--accent); }
.monitor-toggle { line-height: 1.6; }
.history-records li, .settlement-record { padding: 15px 0; }
.notice-titlebar { padding: 14px 18px; border-bottom: 1px solid var(--line); }
.notice-titlebar span { font-weight: 600; }
.notice-content { padding: 8px 18px 18px; }
.island-shell { padding: 0 10px 0 14px; border-radius: 32px; }
.island-mark { color: var(--on-accent); background: var(--accent); border: 0; }
.island-info small { color: var(--text-muted); }
.island-time { font: 600 15px ui-monospace, Consolas, monospace; }
.island-open { display: flex; justify-content: center; align-items: center; color: var(--accent-text); background: var(--control-hover); }
.island-open .icon { width: 14px; height: 14px; font-size: 13px; transform: rotate(45deg); }
@media (max-width: 540px) {
  .titlebar { padding-inline: 10px; }
  .workspace { padding: 14px; }
  .timer-card { padding: 16px; }
}
@media (max-width: 380px) {
  .titlebar { padding-inline: 8px; }
  .workspace { padding: 10px; }
  .timer-card { padding: 13px; }
  .task-copy h1 { font-size: 17px; }
  .task-row { gap: 6px; }
  .timer { font-size: 22px; }
}

/* Secondary pages share the same cards, controls and token-driven typography. */
.history-dialog { width: min(540px, calc(100% - 32px)); }
.history-filters { padding: 14px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--window-rgb) / 45%); }
.history-filters label { color: var(--text-muted); font-weight: 600; }
.history-filters button { min-height: 38px; }
.history-tabs { padding: 4px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-tabs button { border-color: transparent; background: transparent; }
.history-tabs .icon, .history-pagination .icon, .history-filters .icon, .delete-link .icon { width: 15px; height: 15px; font-size: 14px; }
.history-overview { padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 45%); }
.summary-grid > div { padding: 12px 10px; }
.history-records { display: grid; gap: 9px; }
.history-records li { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-records .record-heading { align-items: flex-start; }
.stats-section { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.stats-section h3 { margin: 0 0 10px; }
.settlement-panel { padding: 18px; }
.settlement-panel .settings-heading { margin-bottom: 12px; }
.settlement-record { border-bottom: 1px solid var(--line); }
.settlement-form { padding: 0 4px 10px; }

button.theme-choice { min-height: 68px; padding: 12px; }
.theme-sample { width: 36px; height: 42px; border-radius: 9px; }
.theme-label strong { font-size: 13px; }
.theme-label > span { white-space: normal; }
.opacity-heading { margin-top: 20px; }

.notice-content h1 { margin-top: 12px; }
.notice-content p { line-height: 1.7; }

/* Independent panels reserve fixed header/footer rows. Only the body scrolls. */
.panel-app{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;overflow:hidden}
.panel-app .panel-surface{flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}
.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);flex-shrink:0}
.panel-heading h2{margin:0;font-size:18px}.panel-heading button{width:auto}
.panel-scroll{overflow:auto;min-height:0;padding:18px 24px 24px;scrollbar-width:thin}
.panel-actions{grid-row:3;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:14px 22px;border-top:1px solid var(--line);background:rgb(var(--surface-rgb)/98%)}
.panel-actions>button{width:auto;min-width:120px}.panel-actions .history-pagination{width:100%;margin:0}
.settings-tabs{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--line);flex-shrink:0}.settings-tabs button{width:auto;flex:1}
.settings-tabs button[aria-pressed=true]{border-color:var(--accent);color:var(--accent-text)}
.draft-indicator{font-size:11px;margin:0;padding:6px 24px;color:var(--accent-text);flex-shrink:0}
.panel-app>.error-banner{margin:8px 20px;flex-shrink:0;max-height:80px;overflow:auto}
.data-buttons{display:flex;gap:10px;margin:14px 0 24px;flex-wrap:wrap}.data-buttons button{width:auto}
.panel-app .monitor-settings{padding:0}.panel-app .theme-grid{max-width:760px}.panel-app .settlement-form{max-width:760px;margin-top:20px}
@media(max-width:600px){.panel-scroll{padding:14px}.panel-heading,.panel-actions{padding:12px}.settings-tabs{padding:8px}.panel-actions>button{min-width:0;flex:1}}

/* Shared preferences: every desktop surface uses the saved typography. */
.desktop-frame{font-size:var(--body-size,14px);font-weight:var(--body-weight,400);line-height:var(--body-line,1.6)}
.desktop-frame button,.desktop-frame input,.desktop-frame select,.desktop-frame textarea,.desktop-frame label,.desktop-frame summary{font-size:1em;font-weight:inherit;line-height:inherit}
.desktop-frame h1{font-size:1.5em}.desktop-frame h2{font-size:1.2em}.desktop-frame h3{font-size:1.05em}.desktop-frame .hint,.desktop-frame .task-summary{font-size:.82em}.desktop-frame .timer{font-size:2.25em}.desktop-frame .task-control-mode{font-size:.75em}
.app-shell{position:relative;isolation:isolate}.window-background{position:absolute;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center}
button.nav-button[aria-pressed="true"]::after{display:none}.desktop-frame .main-nav{display:flex;gap:3px}.desktop-frame .titlebar{grid-template-columns:auto auto minmax(0,1fr) auto}
.work-badge{display:inline-flex;align-items:center;gap:8px;min-width:0}.work-symbol{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:31px;height:31px;border-radius:9px;color:var(--work-color);background:color-mix(in srgb,var(--work-color) 12%,transparent)}.work-symbol .icon{font-size:19px}.work-badge>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button.workload-carousel{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0;overflow:hidden;padding:6px 9px;border:1px solid var(--line);border-radius:999px;background:rgb(var(--surface-rgb)/45%);color:var(--text-primary);font-size:.8em;white-space:nowrap}.workload-carousel .work-symbol{width:22px;height:22px;border-radius:50%}.workload-carousel .icon{font-size:14px}.workload-carousel .work-badge{gap:5px;flex-shrink:0}.workload-carousel small{color:var(--text-muted);font-size:.8em;overflow:hidden;text-overflow:ellipsis}.workload-carousel>span{overflow:hidden;text-overflow:ellipsis}
.home-footer{display:flex;align-items:center;gap:8px;margin-top:12px;min-width:0}.home-footer button{flex-shrink:0}.monitor-caption{font-size:.72em;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto}.start-prompt{border:1px solid var(--line);border-radius:var(--panel-radius);background:rgb(var(--surface-rgb)/94%);padding:16px;margin-bottom:12px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}.start-prompt>strong{font-size:1em}.start-prompt p{width:100%;color:var(--text-muted);font-size:.85em;margin:0}.start-prompt>div{display:flex;gap:9px;width:100%}.start-prompt button{justify-content:center}.browse-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:12px;background:rgb(var(--surface-rgb)/85%);font-size:.88em}.browse-banner button{width:auto;justify-content:center;flex-shrink:0}
.panel-actions>button,.settings-actions>button,.data-buttons>button{justify-content:center!important;text-align:center}.panel-app button{max-width:100%}.panel-heading{padding:12px 22px}.panel-heading h2{font-size:1.15em}.settings-tabs{gap:5px;padding:10px 16px}.settings-tabs button{padding:8px 9px;font-size:.88em}.layout-form{display:grid;gap:18px;max-width:650px}.layout-form input[type=range]{padding:0}.font-preview{padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.visual-category{border:1px solid var(--line);border-radius:12px;padding:15px;margin:0 0 18px;min-width:0}.visual-category legend{padding:0 7px}.color-field{display:flex!important;align-items:center;gap:12px;margin-bottom:12px}.color-field input{width:45px;height:30px;padding:2px;margin:0}.color-field span{color:var(--text-muted);font-size:.8em}.icon-picker{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin-top:12px}.icon-picker button{min-height:40px;padding:8px}.icon-picker button[aria-pressed=true]{border-color:var(--accent-text);outline:1px solid var(--accent-text);background:var(--control-hover)}.background-settings{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.compact-help{margin:8px 0;font-size:.84em;color:var(--text-muted)}.compact-help summary{cursor:pointer}.monitor-diagnostics,.advanced-settings{padding:12px 14px;border:1px solid var(--line);border-radius:10px;margin-bottom:14px}.monitor-diagnostics>summary,.advanced-settings>summary{cursor:pointer;font-weight:600}.monitor-diagnostics>p,.monitor-diagnostics>button,.monitor-diagnostics>details{margin-top:12px}.advanced-settings>fieldset{margin-top:12px}
.desktop-frame[data-density=compact]{padding:5px;--content-gap:6px}.desktop-frame[data-density=compact] .titlebar{min-height:39px;padding:5px 8px;gap:5px}.desktop-frame[data-density=compact] .brand-name{display:none}.desktop-frame[data-density=compact] .brand-mark{width:22px;height:22px}.desktop-frame[data-density=compact] .titlebar-drag{min-height:24px}.desktop-frame[data-density=compact] .nav-button{width:25px;height:25px;padding:4px}.desktop-frame[data-density=compact] .nav-button .icon{font-size:15px}.desktop-frame[data-density=compact] .window-control{width:22px;height:25px;padding:4px}.desktop-frame[data-density=compact] .window-controls{gap:0}.desktop-frame[data-density=compact] .workload-carousel{padding:3px 5px;gap:4px;font-size:.7em}.desktop-frame[data-density=compact] .workload-carousel small{display:none}.desktop-frame[data-density=compact] .workload-carousel .work-symbol{width:17px;height:17px}.desktop-frame[data-density=compact] .workload-carousel .work-symbol .icon{font-size:12px}.desktop-frame[data-density=compact] .workspace{padding:8px 10px 9px;max-width:none}.desktop-frame[data-density=compact] .auxiliary{display:none}.desktop-frame[data-density=compact] .timer-card{padding:10px 12px;border-radius:12px}.desktop-frame[data-density=compact] .task-copy h1{font-size:1em}.desktop-frame[data-density=compact] .task-summary{margin-top:3px;font-size:.7em;gap:3px}.desktop-frame[data-density=compact] .task-control-mode{font-size:.9em;padding:0 4px}.desktop-frame[data-density=compact] .task-copy .work-symbol{width:25px;height:25px}.desktop-frame[data-density=compact] .task-copy .work-symbol .icon{font-size:16px}.desktop-frame[data-density=compact] .timer{font-size:1.65em}.desktop-frame[data-density=compact] .actions{margin-top:6px;padding-top:6px;gap:8px}.desktop-frame[data-density=compact] .round-action{width:29px;height:29px;padding:6px}.desktop-frame[data-density=compact] .quiet-action{padding:3px 5px;font-size:.8em}.desktop-frame[data-density=compact] .form-card{padding:9px 11px;margin-top:0;border-radius:12px}.desktop-frame[data-density=compact] .work-form{gap:7px}.desktop-frame[data-density=compact] .work-form label{font-size:.82em}.desktop-frame[data-density=compact] .work-form select{padding:4px 8px;margin-top:2px}.desktop-frame[data-density=compact] .work-form>button{min-height:30px;padding:4px 9px;font-size:.82em;justify-content:center}.desktop-frame[data-density=compact] .form-note>summary{font-size:.72em}.desktop-frame[data-density=compact] .home-footer{margin-top:6px;gap:4px}.desktop-frame[data-density=compact] .home-footer button{font-size:.7em;padding:4px 7px}.desktop-frame[data-density=compact] .monitor-caption{font-size:.65em}.desktop-frame[data-density=compact] .switch-panel{margin-top:6px;padding:5px 9px;font-size:.8em}.desktop-frame[data-density=compact] .start-prompt{padding:10px;gap:6px;margin-bottom:7px}.desktop-frame[data-density=compact] .start-prompt p{font-size:.75em}.desktop-frame[data-density=compact] .start-prompt button{padding:5px 8px;font-size:.82em}.desktop-frame[data-density=compact] .browse-banner{padding:8px 10px;margin-bottom:7px}.desktop-frame[data-density=compact] .browse-banner button{padding:5px 8px}.desktop-frame[data-density=compact] .settings-tabs{padding:6px 10px}.desktop-frame[data-density=compact] .settings-tabs button{padding:5px 7px;font-size:.8em}.desktop-frame[data-density=compact] .panel-heading{padding:8px 14px}.desktop-frame[data-density=compact] .panel-scroll{padding:10px 14px}.desktop-frame[data-density=compact] .panel-actions{padding:8px 14px}.desktop-frame[data-density=compact] .panel-actions>button{padding:7px 12px}.desktop-frame[data-density=compact] .monitor-settings{gap:9px}.desktop-frame[data-density=compact] .monitor-rule{padding:9px;gap:6px}.desktop-frame[data-density=compact] .theme-choice{min-height:48px;padding:8px}.desktop-frame[data-density=compact] .theme-sample{width:25px;height:28px}.desktop-frame[data-density=compact] .visual-category{padding:10px;margin-bottom:10px}
/* Compact native status window: all persistent actions share the same row. */
.island-frame { padding:4px; }
.island-shell { position:relative; display:flex; flex-direction:column; align-items:stretch; justify-content:center; padding:5px 8px; border-radius:20px; gap:5px; }
.island-main-row { display:flex; align-items:center; min-height:30px; gap:5px; }
.island-drag { height:auto; gap:7px; }
.island-drag .work-symbol { width:26px; height:26px; border-radius:8px; flex-shrink:0; }
.island-drag .work-symbol .icon { font-size:16px; }
.island-info { gap:0; }
.island-info strong { font-size:12px; line-height:1.4; }
.island-info small { font-size:9px; line-height:1.4; }
.island-drag .island-time { font-size:12px; }
button.island-action, button.island-open { display:flex; justify-content:center; align-items:center; flex:0 0 26px; width:26px; height:26px; margin:0; padding:4px; border-radius:50%; background:transparent; color:var(--text-muted); box-shadow:none; }
button.island-action:hover:not(:disabled),button.island-open:hover:not(:disabled) { background:var(--control-hover); color:var(--accent-text); }
button.island-start { width:auto; flex-shrink:0; min-height:26px; padding:4px 8px; font-size:10px; border-radius:8px; }
.island-intent { display:flex; gap:6px; padding-left:33px; }
.island-intent button { width:auto; min-height:25px; padding:3px 10px; font-size:10px; justify-content:center; }
.island-error { position:absolute; left:2px; top:2px; font-size:10px; }
.layout-form { width:100%; margin-inline:auto; }
.layout-form input[type=range] { margin-inline:0; }
.panel-surface:has(.layout-form) .panel-heading, .panel-surface:has(.layout-form) .panel-actions { width:100%; max-width:694px; margin-inline:auto; }
button { transition:background-color .14s,border-color .14s,color .14s; }
button:active:not(:disabled) { box-shadow:inset 0 1px 2px rgb(0 0 0 / 12%); }
button.nav-button:hover:not(:disabled),button.text-button:hover:not(:disabled),button.workload-carousel:hover:not(:disabled) { background:var(--control-hover); }
@media (prefers-reduced-motion:reduce) { button { transition:none; } }

.monitor-work-sites { display:grid; gap:10px; min-width:0; }
.monitor-work-sites h3 { margin:0; font-size:1em; }
.monitor-work-sites > .hint { margin:0; }
.monitor-work-group { border:1px solid var(--line); border-radius:12px; min-width:0; }
.monitor-work-group > summary { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; list-style:none; }
.monitor-work-group > summary::before { content:"›"; color:var(--text-muted); transition:transform .14s; }
.monitor-work-group[open] > summary::before { transform:rotate(90deg); }
.monitor-work-group > summary span { margin-left:auto; font-size:.8em; color:var(--text-muted); }
.monitor-work-urls { display:grid; gap:10px; padding:0 12px 12px; min-width:0; }

.category-names-editor { display: grid; gap: 12px; margin-block: 16px; padding-block: 16px; border-block: 1px solid var(--border); }
```

## E:\WorkMemo\src\App.tsx

```tsx
import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatTime, type StartInput } from "./types";
import { workView } from "./workView";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  useDashboard,
  layoutStyle,
  WorkBadge,
} from "./desktopPreferences";
import "./App.css";
import { workloadLabel, type TodayWorkload as Today } from "./workload";
export default function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const layout = useLayout();
  const dashboard = useDashboard();
  const [noteOpen, setNoteOpen] = useState(false);
  const [switchRequest, setSwitchRequest] = useState<{
    input: StartInput;
    id: number;
    category: string;
  } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [migrationFound, setMigrationFound] = useState(false);
  const [today, setToday] = useState<Today[]>([]);
  const [todayError, setTodayError] = useState("");
  const [slide, setSlide] = useState(0);
  const [hover, setHover] = useState(false);
  const workspace = useRef<HTMLElement>(null);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const monitor = session.snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const unavailable = !view.canOperate || session.busy;
  const compact = layout.current.density === "compact";
  function panel(section: string) {
    void invoke("open_panel", { panel: "settings", section }).catch((e) =>
      setNavigationError(String(e)),
    );
  }
  useEffect(() => {
    if (!session.native) return;
    let reading = false;
    let stopped = false;
    const load = async () => {
      if (reading) return;
      reading = true;
      try {
        const items = await invoke<Today[]>("get_today_workload");
        if (!stopped) {
          setToday(items);
          setTodayError("");
        }
      } catch (e) {
        if (!stopped) setTodayError(String(e));
      } finally {
        reading = false;
      }
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 5000);
    const p = listen("workmemo:data-changed", () => {
      void load();
      void session.refresh();
    });
    return () => {
      stopped = true;
      clearInterval(timer);
      void p.then((f) => f());
    };
  }, [session.native]);
  useEffect(() => {
    if (today.length < 2 || hover) return;
    const timer = window.setInterval(() => setSlide((s) => s + 1), 4000);
    return () => clearInterval(timer);
  }, [today.length, hover]);
  useEffect(() => {
    if (!session.native) return;
    void invoke<boolean>("detect_preview_data")
      .then(setMigrationFound)
      .catch(() => {});
    const p = listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    });
    return () => {
      void p.then((f) => f());
    };
  }, [session.native]);
  const item = today.length ? today[slide % today.length] : null;
  return (
    <DesktopWindow
      density={layout.current.density}
      background={presentation.current.background}
      appearanceStyle={{
        ...themeStyle(appearance.current),
        ...layoutStyle(layout.current),
      }}
      navigation={
        <nav className="main-nav" aria-label="主导航">
          <button
            className="nav-button"
            title="工作数据中心"
            aria-label="历史与统计"
            onClick={() => {
              void dashboard.open();
            }}
          >
            <Icon name="chart" />
          </button>
          <button
            className="nav-button"
            title="外观"
            aria-label="外观设置"
            onClick={() => panel("appearance")}
          >
            <Icon name="palette" />
          </button>
          <button
            className="nav-button"
            title="布局"
            aria-label="布局设置"
            onClick={() => panel("layout")}
          >
            <Icon name="layout" />
          </button>
          <button
            className="nav-button"
            title="监测设置"
            aria-label="监测设置"
            onClick={() => panel("monitor")}
          >
            <Icon name="settings" />
          </button>
        </nav>
      }
      categories={
        <button
          className="workload-carousel"
          aria-label="打开当天工作量详情"
          title={todayError || "点击查看当天全部工作详情"}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          onClick={() => {
            void dashboard.open("today");
          }}
        >
          {todayError ? (
            <span>数量暂不可用</span>
          ) : item ? (
            <>
              <WorkBadge
                category={item.category}
                presentation={presentation.current}
              />
              <strong>{workloadLabel(item).main}</strong>
              {workloadLabel(item).pending && (
                <small>{workloadLabel(item).pending}</small>
              )}
            </>
          ) : (
            <span>今天还没有工作记录</span>
          )}
        </button>
      }
    >
      <main
        ref={workspace}
        className={`workspace ${active ? "is-active" : ""}`}
      >
        {dashboard.fallback}
        {(session.connectionError ||
          session.commandError ||
          navigationError ||
          appearance.loadError ||
          presentation.error ||
          layout.error) && (
          <p className="error-banner" role="alert">
            {session.connectionError ||
              session.commandError ||
              navigationError ||
              appearance.loadError ||
              presentation.error ||
              layout.error}
          </p>
        )}
        {session.snapshot?.warning && (
          <p className="notice" role="alert">
            {session.snapshot.warning}
          </p>
        )}
        {!session.native && (
          <p className="notice">浏览器预览 · 计时和保存请使用桌面应用</p>
        )}
        {active?.recovery_pending && (
          <p className="notice" role="status">
            上次未结束的任务保持暂停。请确认后继续，软件关闭期间不计时。
          </p>
        )}
        {candidate && !active && (
          <section className="start-prompt" aria-label="开工确认">
            <WorkBadge
              category={candidate.category}
              presentation={presentation.current}
            />
            <strong>准备开始工作？</strong>
            <p>确认前不计时，工作量稍后填写。</p>
            <div>
              <button
                disabled={session.busy}
                onClick={() => {
                  void session.confirmWork(candidate.id);
                }}
              >
                开始记录
              </button>
              <button
                className="secondary"
                disabled={session.busy}
                onClick={() => {
                  void session.browse();
                }}
              >
                仅浏览
              </button>
            </div>
          </section>
        )}
        {monitor?.browsing_only && (
          <section className="browse-banner" aria-label="仅浏览">
            <span>
              {monitor.browse_ready ? "工作页面已就绪" : "仅浏览 · 当前不计时"}
            </span>
            <button
              disabled={
                unavailable ||
                !monitor.browse_ready ||
                !!active?.recovery_pending
              }
              onClick={() => {
                void session.confirmWork(null);
              }}
            >
              {active ? "继续记录" : "开始记录"}
            </button>
          </section>
        )}
        {(!compact || active) && (
          <section
            className="timer-card"
            aria-label="当前工作"
            aria-busy={session.loading || session.busy}
          >
            <div className="task-row flex items-center justify-between gap-4">
              <div className="task-copy">
                <div className="task-eyebrow auxiliary">当前工作</div>
                <h1>
                  {record ? (
                    <WorkBadge
                      category={record.category}
                      presentation={presentation.current}
                    />
                  ) : (
                    view.label
                  )}
                </h1>
                <p className="task-summary">
                  <span className="state-label" role="status">
                    {monitor?.browsing_only ? "仅浏览 · 已停表" : view.label}
                  </span>
                  {record && (
                    <span className="task-control-mode">
                      {record.control_mode === "AUTO" ? "自动记录" : "手动计时"}
                    </span>
                  )}
                </p>
              </div>
              <output className="timer" aria-label="有效工作时长">
                {view.timer}
              </output>
            </div>
            {record && (
              <div className="actions flex items-center gap-3">
                {active && (
                  <button
                    className="round-action"
                    disabled={unavailable}
                    title={active.is_paused ? "继续工作" : "暂停"}
                    aria-label={active.is_paused ? "继续工作" : "暂停"}
                    onClick={() => {
                      void (active.is_paused
                        ? session.resume(active.id)
                        : session.pause(active.id));
                    }}
                  >
                    <Icon name={active.is_paused ? "play" : "pause"} />
                  </button>
                )}
                <button
                  className="quiet-action"
                  onClick={() => setNoteOpen(true)}
                  title="任务备注"
                >
                  <Icon name="note" />
                  <span>备注</span>
                </button>
                {active && (
                  <button
                    className="quiet-action finish-action"
                    disabled={unavailable}
                    onClick={() => {
                      void session.finish(active.id);
                    }}
                    title="结束计时"
                  >
                    <Icon name="check" />
                    <span>结束</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        {!active &&
          !candidate &&
          !monitor?.browsing_only &&
          (session.snapshot || !session.native) && (
            <section className="form-card" aria-label="手动开始工作">
              <WorkForm
                minimal={compact}
                disabled={unavailable}
                starting={session.pending === "start_task"}
                onStart={session.start}
              />
            </section>
          )}
        {!active && !candidate && monitor?.browsing_only && <details className="switch-panel"><summary>手动开始工作</summary><WorkForm minimal={compact} disabled={unavailable} starting={session.pending==="start_task"} onStart={session.start}/></details>}
        {active?.is_paused && (
          <details className="switch-panel">
            <summary>开始另一项工作</summary>
            <WorkForm
              minimal={compact}
              switching
              disabled={unavailable}
              onStart={async (input) => {
                setSwitchRequest({
                  input,
                  id: active.id,
                  category: active.category,
                });
                return false;
              }}
            />
          </details>
        )}
        <div className="home-footer">
          <button
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            待补全 {session.snapshot?.pending_count ?? "—"}
          </button>
          {!monitor?.browsing_only && (
            <button
              className="text-button"
              disabled={unavailable}
              onClick={() => {
                void session.browse();
              }}
            >
              仅浏览
            </button>
          )}
          <span className="monitor-caption" title={monitor?.message}>
            {monitor?.message || "正在读取状态…"}
          </span>
        </div>
        {monitor?.idle_warning && (
          <p className="notice" role="status">
            已连续 {monitor.idle_warning_seconds} 秒没有输入，
            {monitor.idle_end_seconds} 秒时将自动结束。恢复操作后取消提醒。
          </p>
        )}
        {migrationFound && (
          <details className="auxiliary">
            <summary>发现预览版数据</summary>
            <button className="text-button" onClick={() => panel("data")}>
              查看并迁移
            </button>
          </details>
        )}
        <UiDialog
          open={!!switchRequest}
          onClose={() => {
            if (!session.busy) setSwitchRequest(null);
          }}
          id="switch-title"
          title="确认切换工作"
        >
          {switchRequest && (
            <>
              <p>
                结束并保存当前暂停的“{name(switchRequest.category)}”，再开始“
                {name(switchRequest.input.category)}”。原记录保留在待补全列表。
              </p>
              <div className="settings-actions">
                <button
                  className="secondary"
                  disabled={session.busy}
                  onClick={() => setSwitchRequest(null)}
                >
                  取消
                </button>
                <button
                  disabled={session.busy}
                  onClick={() => {
                    void session
                      .start(switchRequest.input, switchRequest.id)
                      .then((ok) => {
                        if (ok) setSwitchRequest(null);
                      });
                  }}
                >
                  保存并开始
                </button>
              </div>
            </>
          )}
        </UiDialog>
        <UiDialog
          open={noteOpen && !!record}
          onClose={() => setNoteOpen(false)}
          id="note-title"
          title="任务详情与备注"
        >
          {record && (
            <>
              <p>
                {name(record.category)} · 数量 {formatQuantity(record.quantity)}
              </p>
              <p className="hint">开始 {formatTime(record.start_time)}</p>
              <p className="task-remark">
                {record.remark || "这项工作未填写备注。"}
              </p>
            </>
          )}
        </UiDialog>
      </main>
    </DesktopWindow>
  );
}
```

## E:\WorkMemo\src\CategoryNamesEditor.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES } from "./types";
import { useCategoryNames, type CategoryNames } from "./categoryNames";
import { useDraft } from "./Drafts";

export function CategoryNamesEditor() {
  const categories = useCategoryNames();
  const [draft, setDraft] = useState(categories.current);
  const [baseline, setBaseline] = useState(categories.current);
  const [busy, setBusy] = useState(false);
  const saving = useRef(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  useEffect(() => {
    if (!dirty && !busy) { setDraft(categories.current); setBaseline(categories.current); }
  }, [categories.current, dirty, busy]);
  async function save() {
    if (saving.current || !categories.loaded || !isTauri()) return false;
    saving.current = true; setBusy(true); setError(""); setNotice("");
    try {
      const value = await invoke<CategoryNames>("save_category_names", { input: draft });
      categories.accept(value); setDraft(value); setBaseline(value); setNotice("工作名称已保存，历史和网址归属保持一致。");
      return true;
    } catch (failure) { setError(String(failure)); return false; }
    finally { saving.current = false; setBusy(false); }
  }
  useDraft("category-names", dirty, busy, save, () => { setDraft(baseline); setError(""); });
  return <form className="category-names-editor" onSubmit={event => { event.preventDefault(); void save(); }}>
    <h3>工作名称</h3>
    <p className="hint">名称修改会用于已有记录和新记录；四类身份及各自绑定的网址保持不变。每项 1～20 个字符，不能重名。</p>
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIES.map((key, index) => <label key={key}>类型 {index + 1}（原名：{key}）
        <input required maxLength={40} value={draft.names[key]} disabled={busy || !categories.loaded}
          onChange={event => { setNotice(""); setDraft({ ...draft, names: { ...draft.names, [key]: event.target.value } }); }} />
      </label>)}
    </div>
    <div className="settings-actions flex gap-2">
      <button type="submit" disabled={busy || !categories.loaded || !isTauri() || !dirty}>{busy ? "正在保存名称…" : "保存工作名称"}</button>
      <button type="button" className="secondary" disabled={busy || !isTauri()} onClick={() => {
        void categories.reload().then(value => { if (value) { setDraft(value); setBaseline(value); setError(""); setNotice(""); } });
      }}>重新读取并放弃名称修改</button>
    </div>
    {error && <p role="alert" className="error-banner">{error}</p>}
    {notice && <p role="status" className="notice">{notice}</p>}
  </form>;
}
```

## E:\WorkMemo\src\Dashboard.tsx

```tsx
import { useCategoryNames, type CategoryNames } from "./categoryNames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { init, use as registerCharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ECharts, EChartsOption } from "echarts";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type WorkRecord,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  DEFAULT_PRESENTATION,
  WorkBadge,
  type Presentation,
} from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import "./Dashboard.css";

function Modal({
  children,
  label,
  onClose,
  drawer = false,
}: {
  children: React.ReactNode;
  label: string;
  onClose: () => void;
  drawer?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`dc-modal ${drawer ? "dc-drawer-modal" : "dc-confirm-modal"}`}
      aria-labelledby={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
type Row = WorkRecord & { is_demo: boolean; demo_batch: string | null };
type Query = {
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  scope: "real" | "demo" | "all";
  status: string;
  page: number;
};
type Data = {
  totals: {
    duration_ms: number;
    quantity: number;
    records: number;
    pending: number;
  };
  trend: {
    date: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  monthly: boolean;
  categories: {
    category: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  calendar: [string, number][];
  records: Row[];
  page: number;
  pages: number;
  scope: string;
};
type Detail = {
  record: Row;
  segments: {
    id: number;
    start_time: number;
    end_time: number | null;
    duration_ms: number;
    state: string;
  }[];
  revisions: {
    revision: number;
    changed_at: number;
    before: WorkRecord;
    after: WorkRecord;
  }[];
};
type Meta = {
  version: string;
  category_names: CategoryNames;
  presentation: Presentation;
  active: WorkRecord | null;
};
class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}
const entry = new URLSearchParams(location.hash.slice(1));
const incoming = entry.get("token");
if (incoming) {
  sessionStorage.setItem("workmemo-token", incoming);
  history.replaceState(null, "", location.pathname + location.search);
}
const sessionToken = incoming ?? sessionStorage.getItem("workmemo-token") ?? "";
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDate(d);
}
function initialQuery(): Query {
  const view = entry.get("view");
  return {
    start_date: view === "pending" ? null : daysAgo(view === "today" ? 0 : entry.get("scope")==="demo"?89:29),
    end_date: view === "pending" ? null : daysAgo(0),
    category: null,
    scope: entry.get("scope") === "demo" ? "demo" : "real",
    status: view === "pending" ? "pending" : "all",
    page: 1,
  };
}
async function api<T>(path: string, body?: unknown): Promise<T> {
  if (!sessionToken)
    throw new ApiError("请从 WorkMemo 打开数据中心，以建立本机连接。", 403);
  try {
    const response = await fetch(`/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        "连接授权已失效，请从 WorkMemo 重新打开数据中心。",
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiError(
        (data as { error?: string }).error ?? "操作未完成。",
        response.status,
      );
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "与 WorkMemo 的连接已中断。请保持软件在后台运行，再刷新连接。",
    );
  }
}
function Chart({
  option,
  label,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  onCategory?: (name: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const click = useRef(onCategory);
  click.current = onCategory;
  useEffect(() => {
    if (!node.current) return;
    const instance = init(node.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (p) => {
      if (typeof p.name === "string") click.current?.(p.name);
    });
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const host = node.current;
        if (host && (instance.getWidth() !== host.clientWidth || instance.getHeight() !== host.clientHeight)) {
          instance.resize();
        }
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);
  return <div ref={node} role="img" aria-label={label} className="dc-chart" />;
}
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  textStyle: { color: "#1e293b" },
  extraCssText: "",
};
function statusName(row: Row) {
  return row.status === "WORKING"
    ? "进行中"
    : row.settlement_status === "PENDING"
      ? "待补全"
      : "已确认";
}
export default function Dashboard() {
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [range, setRange] = useState(
    entry.get("view") === "today"
      ? "today"
      : entry.get("view") === "pending"
        ? "all"
        : entry.get("scope")==="demo"?"90":"30",
  );
  const [data, setData] = useState<Data | null>(null);
  const { name, accept: acceptCategoryNames } = useCategoryNames();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) { quantityInput.current?.focus(); quantityInput.current?.scrollIntoView({block:"nearest"}); } }, [editing]);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [guard, setGuard] = useState(false);
  const next = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  useEffect(() => {
    let stopped = false;
    let reading = false;
    async function load() {
      if (reading) return;
      reading = true;
      try {
        const metadata = await api<Meta>("meta");
        if (stopped) return;
        setMeta(metadata);
        acceptCategoryNames(metadata.category_names);
        setOnline(true);
        {
          const rows = await api<Data>("query", query);
          if (!stopped) {
            setData(rows);
            setError("");
          }
        }
      } catch (e) {
        if (!stopped) {
          setError(String(e instanceof Error ? e.message : e));
          if (!(e instanceof ApiError) || e.status === 0 || e.status === 403)
            setOnline(false);
        }
      } finally {
        reading = false;
        if (!stopped) setLoading(false);
      }
    }
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 2000);
    const focus = () => {
      void load();
    };
    window.addEventListener("focus", focus);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [query, refresh, acceptCategoryNames]);
  function selectRange(value: string) {
    setRange(value);
    const n = value === "today" ? 0 : Number(value) - 1;
    const update = {
      ...filters,
      start_date: value === "all" ? null : daysAgo(n),
      end_date: value === "all" ? null : daysAgo(0),
      page: 1,
    };
    setFilters(update);
    setQuery(update);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current) return;
    const action = async () => {
      busyRef.current = true;
      setBusy(true);
      setEditorError("");
      try {
        const value = await api<Detail>("detail", { id: row.id });
        setDetail(value);
        setFields({
          category: value.record.category,
          quantity:
            value.record.quantity === null ? "" : String(value.record.quantity),
          remark: value.record.remark,
        });
        setEditing(edit && value.record.status === "FINISHED");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    };
    if (dirty) {
      next.current = () => {
        void action();
      };
      setGuard(true);
    } else await action();
  }
  function leave(action: () => void) {
    if (busyRef.current) return;
    if (dirty) {
      next.current = action;
      setGuard(true);
    } else action();
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setEditing(false);
      setFields({
        category: updated.record.category,
        quantity:
          updated.record.quantity === null
            ? ""
            : String(updated.record.quantity),
        remark: updated.record.remark,
      });
      setRefresh((v) => v + 1);
      return true;
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online]);
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && editing) {
        e.preventDefault();
        void save();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (guard) {
          setGuard(false);
          next.current = null;
        } else if (deleting && !busy) setDeleting(null);
        else if (detail) leave(() => setDetail(null));
      }
    }
    function unload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, guard, deleting, detail, editing, save, busy]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      if (detail?.record.id === deleting.id) {
        setDetail(null);
        setEditing(false);
      }
      setDeleting(null);
      setRefresh((v) => v + 1);
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const trend = useMemo<EChartsOption>(
    () => ({
      animationDuration: 300,
      tooltip: { ...tooltip, trigger: "axis" },
      legend: { top: 0, right: 12, data: ["工作量", "有效工时"] },
      grid: { left: 52, right: 52, top: 40, bottom: 28, containLabel: true },
      xAxis: {
        type: "category",
        data: data?.trend.map((x) => x.date) ?? [],
        axisLine: { lineStyle: { color: "#dbe3ec" } },
        axisLabel: { color: "#64748b", hideOverlap: true, showMinLabel: true, showMaxLabel: true, formatter: (value: string) => value.slice(5) },
      },
      yAxis: [
        {
          type: "value",
          name: "数量",
          splitLine: { lineStyle: { color: "#eef2f7" } },
          axisLabel: { color: "#64748b" },
        },
        {
          type: "value",
          name: "小时",
          splitLine: { show: false },
          axisLabel: { color: "#64748b" },
        },
      ],
      series: [
        {
          name: "工作量",
          type: "bar",
          data: data?.trend.map((x) => x.quantity) ?? [],
          barMaxWidth: 26,
          itemStyle: { color: "#335ed4", borderRadius: [4, 4, 0, 0] },
        },
        {
          name: "有效工时",
          type: "line",
          yAxisIndex: 1,
          smooth: true,
          symbolSize: 6,
          data:
            data?.trend.map((x) =>
              Number((x.duration_ms / 3600000).toFixed(2)),
            ) ?? [],
          lineStyle: { width: 3, color: "#19a798" },
          itemStyle: { color: "#19a798" },
        },
      ],
    }),
    [data],
  );
  const categoryOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 300,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: { left: 56, right: 22, top: 25, bottom: 28 },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f7" } } },
      yAxis: {
        type: "category",
        data: data?.categories.map((x) => name(x.category)) ?? [],
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 24,
          data:
            data?.categories.map((x) => ({
              name: name(x.category),
              value:
                categoryMetric === "duration"
                  ? Number((x.duration_ms / 3600000).toFixed(2))
                  : x.quantity,
              itemStyle: {
                color: presentation.categories[x.category]?.color,
                borderRadius: [0, 5, 5, 0],
              },
            })) ?? [],
        },
      ],
    }),
    [data, categoryMetric, presentation, name],
  );
  const calendarOption = useMemo<EChartsOption>(() => {
    const end = query.end_date ?? daysAgo(0);
    const start = new Date(end + "T12:00:00");
    start.setDate(start.getDate() - 89);
    return {
      tooltip: {
        ...tooltip,
        formatter: (p: unknown) => {
          const point = (p as { value?: [string, number] }).value;
          return point
            ? `${point[0]}  ${(point[1] / 3600000).toFixed(2)} 小时`
            : "";
        },
      },
      visualMap: {
        type: "piecewise", show: false,
        pieces: [
          {value:0,color:"#ebedf0"},
          ...["#9be9a8","#40c463","#30a14e","#216e39"].map((color,index) => ({gt:index*Math.max(1,...(data?.calendar.map(v=>v[1])??[1]))/4,lte:(index+1)*Math.max(1,...(data?.calendar.map(v=>v[1])??[1]))/4,color})),
        ],
      },
      calendar: {
        range: [localDate(start), end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#64748b" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#94a3b8" },
        splitLine: { lineStyle: { color: "#dce4ef" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: data?.calendar ?? [],
        },
      ],
    };
  }, [data, query.end_date]);
  const totals = data?.totals;
  return (
    <div className="data-center">
      <aside className="dc-sidebar">
        <a className="dc-brand" href="/dashboard" aria-label="WorkMemo 工作数据中心" title="WorkMemo 工作数据中心">
          <img src="/workmemo.png" alt="" />
          <span>
            WorkMemo<small>工作数据中心</small>
          </span>
        </a>
        <div className="dc-side-label">WORKSPACE</div>
        <button
          className="dc-side-link selected" aria-label="工作总览" title="工作总览"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Icon name="chart" />
          <span className="dc-nav-label">工作总览</span>
        </button>
        <button
          className="dc-side-link" aria-label="工作明细" title="工作明细"
          onClick={() =>
            document
              .getElementById("records")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Icon name="list" />
          <span className="dc-nav-label">工作明细</span>
        </button>
        <div className="dc-sidebar-bottom">
          <span className={`connection-dot ${online ? "connected" : ""}`} />
          {online ? "本机连接正常" : "等待本机连接"}
          <small>
            记录保存在你的电脑中
            <br />v{meta?.version ?? "0.2.2"}
          </small>
        </div>
      </aside>
      <div className="dc-page">
        <header className="dc-topbar">
          <span>
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <button
            className="dc-button subtle"
            onClick={() => setRefresh((v) => v + 1)}
          >
            <Icon name="refresh" />
            刷新连接
          </button>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <h1>工作总览</h1>
              <p>工作量、有效工时和每一段记录，都在这里。</p>
            </div>

          </div>
          {query.scope !== "real" && (
            <div className="dc-demo-banner">
              <Icon name="bulb" />
              <span>
                {query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"}{" "}
                · 示例仅用于查看效果，日常真实统计默认排除。
              </span>
            </div>
          )}
          {error && (
            <div className="dc-error" role="alert">
              {error}
            </div>
          )}
          {meta?.active && (
            <div className="dc-active">
              <WorkBadge
                category={meta.active.category}
                presentation={presentation}
              />
              <span>
                {meta.active.is_paused ? "当前任务已暂停" : "当前任务正在计时"}{" "}
                · 结束后可在这里补填工作量
              </span>
            </div>
          )}
          <section className="dc-filters" aria-label="筛选工作数据">
            <div className="dc-ranges">
              {[
                ["today", "今天"],
                ["7", "近7天"],
                ["30", "近30天"],
                ["90", "近90天"],
                ["all", "全部"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={range === id}
                  className="dc-range"
                  onClick={() => selectRange(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuery({ ...filters, page: 1 });
                setRange("custom");
              }}
            >
              <label>
                开始日期
                <input
                  type="date"
                  value={filters.start_date ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      start_date: e.target.value || null,
                    }))
                  }
                />
              </label>
              <span className="dc-date-separator">—</span>
              <label>
                结束日期
                <input
                  type="date"
                  value={filters.end_date ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      end_date: e.target.value || null,
                    }))
                  }
                />
              </label>
              <label>
                类别
                <select
                  value={filters.category ?? ""}
                  onChange={(e) =>
                    setFilters((p) => ({
                      ...p,
                      category: e.target.value || null,
                    }))
                  }
                >
                  <option value="">全部类别</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{name(c)}</option>
                  ))}
                </select>
              </label>
              <label>
                状态
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待补全</option>
                  <option value="complete">已确认</option>
                  <option value="working">进行中</option>
                </select>
              </label>
            <label className="dc-scope">
              数据范围
              <select
                value={filters.scope}
                onChange={(e) => {
                  const updated = {
                    ...filters,
                    scope: e.target.value as Query["scope"],
                    page: 1,
                  };
                  setFilters(updated);
                  setQuery(updated);
                }}
              >
                <option value="real">真实数据</option>
                <option value="demo">演示数据</option>
                <option value="all">全部数据</option>
              </select>
            </label>
              <button type="submit" className="dc-button">
                <Icon name="search" />
                应用筛选
              </button>
            </form>
          </section>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals
                  ? `${(totals.duration_ms / 3600000).toFixed(1)}`
                  : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已确认工作量",
                value: totals ? formatQuantity(totals.quantity) : "—",
                unit: "",
                icon: "checkSquare" as const,
                caption: "仅汇总已确认的数量",
              },
              {
                label: "工作记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "当前筛选范围内的记录",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((k) => (
              <article className="dc-kpi" key={k.label}>
                <div>
                  <span>{k.label}</span>
                  <Icon name={k.icon} />
                </div>
                <strong>
                  {k.value}
                  <small>{k.unit}</small>
                </strong>
                <p>{k.caption}</p>
              </article>
            ))}
          </section>
          {loading && !data && (
            <p role="status" className="dc-loading">
              正在读取本机工作数据…
            </p>
          )}
          {data && data.totals.records === 0 && (
            <div className="dc-empty">
              <Icon name="clock" />
              <h2>这个范围里还没有记录</h2>
              <p>调整筛选，或回到 WorkMemo 开始一段工作。数据会自动更新。</p>
            </div>
          )}
          <section className="dc-chart-grid">
            <article className="dc-card dc-trend">
              <div className="dc-card-title">
                <div>
                  <h2>工作趋势</h2>
                  <p>
                    {data?.monthly ? "按月汇总" : "按日汇总"} · 工作量与有效工时
                  </p>
                </div>
                <span className="dc-chip">时间视角</span>
              </div>
              <Chart option={trend} label="工作量与有效工时趋势" />
            </article>
            <article className="dc-card dc-category">
              <div className="dc-card-title">
                <div>
                  <h2>类别分布</h2>
                  <p>点击类别条形可筛选</p>
                </div>
                <select
                  aria-label="类别统计指标"
                  value={categoryMetric}
                  onChange={(e) => setCategoryMetric(e.target.value)}
                >
                  <option value="duration">工时（小时）</option>
                  <option value="quantity">工作量</option>
                </select>
              </div>
              <Chart
                option={categoryOption}
                label="按类别汇总的工作分布"
                onCategory={(label) => {
                  const key = CATEGORIES.find(c => name(c) === label);
                  if (key) {
                    const update = { ...query, category: key, page: 1 };
                    setQuery(update);
                    setFilters(update);
                  }
                }}
              />
            </article>
            <article className="dc-card dc-calendar">
            <div className="dc-card-title">
              <div>
                <h2>工作的节奏</h2>
                <p>所选结束日之前的90天 · 颜色深浅表示有效工时</p>
              </div>
            </div>
            <Chart option={calendarOption} label="近90天有效工时工作日历" />
            <div className="dc-heat-legend" aria-label="工时由少到多">少 {["#ebedf0","#9be9a8","#40c463","#30a14e","#216e39"].map(color=><i key={color} style={{background:color}}/>)} 多</div>
            </article>
          </section>
          <section className="dc-card dc-records" id="records">
            <div className="dc-card-title">
              <div>
                <h2>每一段工作，都有来处</h2>
                <p>查看计时区间、补填工作量，或回顾修正记录。</p>
              </div>
              <span className="dc-chip">{totals?.records ?? 0} 条记录</span>
            </div>
            <div className="dc-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>类别</th>
                    <th>开始时间</th>
                    <th>有效工时</th>
                    <th>工作量</th>
                    <th>状态</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.records.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <WorkBadge
                          category={row.category}
                          presentation={presentation}
                        />
                        {row.is_demo && (
                          <small className="demo-tag">演示</small>
                        )}
                      </td>
                      <td>{formatTime(row.start_time)}</td>
                      <td className="tabular">
                        {formatDuration(row.duration_ms / 1000)}
                      </td>
                      <td className="tabular">
                        {row.settlement_status === "COMPLETE"
                          ? formatQuantity(row.quantity)
                          : "待补填"}
                      </td>
                      <td>
                        <span
                          className={`dc-status ${row.settlement_status.toLowerCase()}`}
                        >
                          {statusName(row)}
                        </span>
                      </td>
                      <td className="dc-remark" title={row.remark}>
                        {row.remark || "—"}
                      </td>
                      <td>
                        <div className="dc-row-actions">
                          <button
                            onClick={() => {
                              void openDetail(row);
                            }}
                          >
                            详情
                          </button>
                          <button
                            disabled={
                              !online || busy || row.status !== "FINISHED"
                            }
                            onClick={() => {
                              void openDetail(row, true);
                            }}
                          >
                            {row.settlement_status === "PENDING"
                              ? "补填"
                              : "编辑"}
                          </button>
                          <button
                            className="danger"
                            disabled={
                              !online || busy || row.status !== "FINISHED"
                            }
                            onClick={() => {
                              setEditorError("");
                              setDeleting(row);
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="dc-pagination">
              <span>每页50条 · 共{data?.pages ?? 1}页</span>
              <div>
                <button
                  className="dc-button subtle"
                  disabled={!data || data.page <= 1}
                  onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
                >
                  <Icon name="left" />
                  上一页
                </button>
                <span>
                  {data?.page ?? 1} / {data?.pages ?? 1}
                </span>
                <button
                  className="dc-button subtle"
                  disabled={!data || data.page >= data.pages}
                  onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
                >
                  下一页
                  <Icon name="right" />
                </button>
              </div>
            </footer>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      {detail && (
        <Modal
          drawer
          label="detail-title"
          onClose={() => leave(() => setDetail(null))}
        >
          <section className="dc-drawer">
            <header>
              <div>
                <span className="dc-eyebrow">
                  WORK RECORD #{detail.record.id}
                </span>
                <h2 id="detail-title">
                  {editing ? "填写工作量" : "工作详情"}
                  {detail.record.is_demo && (
                    <span className="demo-tag">演示数据</span>
                  )}
                </h2>
              </div>
              <button
                className="dc-icon-button"
                aria-label="关闭工作详情"
                disabled={busy}
                onClick={() => leave(() => setDetail(null))}
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="dc-drawer-body">
              <div className="dc-record-summary">
                <WorkBadge
                  category={detail.record.category}
                  presentation={presentation}
                />
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <span>{statusName(detail.record)}</span>
              </div>
              <dl className="dc-detail-times">
                <div>
                  <dt>开始</dt>
                  <dd>{formatTime(detail.record.start_time)}</dd>
                </div>
                <div>
                  <dt>结束</dt>
                  <dd>
                    {detail.record.end_time
                      ? formatTime(detail.record.end_time)
                      : "尚未结束"}
                  </dd>
                </div>
              </dl>
              {editing ? (
                <form
                  id="dc-editor"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save();
                  }}
                >
                  <label>
                    工作类别
                    <select
                      disabled={busy}
                      value={fields.category}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{name(c)}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    工作量
                    <input
                      disabled={busy}
                      ref={quantityInput}
                      type="number"
                      min={0}
                      max={1e9}
                      step="any"
                      placeholder="0表示无产出"
                      value={fields.quantity}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, quantity: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    备注
                    <textarea
                      disabled={busy}
                      maxLength={4000}
                      rows={5}
                      value={fields.remark}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, remark: e.target.value }))
                      }
                    />
                  </label>
                  <p className="dc-muted">
                    这里修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                  </p>
                </form>
              ) : (
                <>
                  <div className="dc-detail-quantity">
                    <span>已确认工作量</span>
                    <strong>
                      {detail.record.settlement_status === "COMPLETE"
                        ? formatQuantity(detail.record.quantity)
                        : "待补填"}
                    </strong>
                  </div>
                  <p className="dc-detail-remark">
                    {detail.record.remark || "未填写备注。"}
                  </p>
                </>
              )}
              {editorError && (
                <p className="dc-error" role="alert">
                  {editorError}
                </p>
              )}
              <details className="dc-audit">
                <summary>计时区间（{detail.segments.length}）</summary>
                {detail.segments.length === 0 ? (
                  <p className="dc-muted">
                    旧记录仅保留累计工时，没有可展示的区间。
                  </p>
                ) : (
                  detail.segments.map((s) => (
                    <div className="dc-segment" key={s.id}>
                      <span>
                        {formatTime(s.start_time)}
                        <br />
                        {s.end_time ? formatTime(s.end_time) : "计时中"}
                      </span>
                      <strong>{formatDuration(s.duration_ms / 1000)}</strong>
                    </div>
                  ))
                )}
              </details>
              <details className="dc-audit">
                <summary>修正记录（{detail.revisions.length}）</summary>
                {detail.revisions.length === 0 ? (
                  <p className="dc-muted">尚无修正。</p>
                ) : (
                  detail.revisions.map((r) => (
                    <div key={r.revision} className="dc-revision">
                      <strong>
                        第{r.revision}次 · {formatTime(r.changed_at)}
                      </strong>
                      <p>
                        {name(r.before?.category)} → {name(r.after?.category)} · 数量{" "}
                        {formatQuantity(r.before?.quantity)} →{" "}
                        {formatQuantity(r.after?.quantity)}
                      </p>
                      <p>
                        备注：{r.before?.remark || "未填"} →{" "}
                        {r.after?.remark || "未填"}
                      </p>
                    </div>
                  ))
                )}
              </details>
            </div>
            <footer>
              {dirty && <span className="dc-unsaved">有未保存修改</span>}
              {editing ? (
                <button
                  className="dc-button"
                  key="save-workload"
                  form="dc-editor"
                  type="submit"
                  disabled={busy || !online}
                >
                  {busy ? "正在保存…" : "保存工作量"}
                </button>
              ) : (
                <button
                  className="dc-button"
                  disabled={!online || detail.record.status !== "FINISHED"}
                  key="edit-workload"
                  type="button"
                  title={detail.record.status !== "FINISHED" ? "请先结束工作，再编辑工作量" : "编辑类别、数量和备注"}
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </button>
              )}
            </footer>
          </section>
        </Modal>
      )}
      {deleting && (
        <Modal
          label="delete-title"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <section className="dc-confirm">
            <h2 id="delete-title">删除这条记录？</h2>
            <p>
              {name(deleting.category)} · {formatTime(deleting.start_time)}
              {deleting.is_demo ? " · 演示数据" : ""}
            </p>
            <p>删除后不可撤销，计时区间和修正记录也会一同删除。</p>
            {editorError && <p className="dc-error">{editorError}</p>}
            <div>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => setDeleting(null)}
              >
                取消
              </button>
              <button
                className="dc-button danger-fill"
                disabled={busy || !online}
                onClick={() => {
                  void remove();
                }}
              >
                {busy ? "正在删除…" : "确认删除"}
              </button>
            </div>
          </section>
        </Modal>
      )}
      {guard && (
        <Modal
          label="unsaved-title"
          onClose={() => {
            if (!busy) {
              setGuard(false);
              next.current = null;
            }
          }}
        >
          <section className="dc-confirm">
            <h2 id="unsaved-title">保留未保存的修改？</h2>
            <p>保存成功后再离开；保存失败会保留输入。</p>
            {editorError && <p className="dc-error">{editorError}</p>}
            <div>
              <button
                className="dc-button"
                disabled={busy || !online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      setGuard(false);
                      const action = next.current;
                      next.current = null;
                      action?.();
                    }
                  });
                }}
              >
                保存并继续
              </button>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => {
                  setGuard(false);
                  setEditing(false);
                  const action = next.current;
                  next.current = null;
                  action?.();
                }}
              >
                放弃修改
              </button>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => {
                  setGuard(false);
                  next.current = null;
                }}
              >
                继续编辑
              </button>
            </div>
          </section>
        </Modal>
      )}
    </div>
  );
}
```

## E:\WorkMemo\src\HistoryPanel.tsx

```tsx
import { useCategoryNames } from "./categoryNames";
import { Surface } from "./Drafts";
import { Icon } from "./Icon";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CATEGORIES, formatDuration, formatTime } from "./types";
import { formatQuantity, historyQueryError, localDate, type Totals } from "./history";
import { useHistory } from "./useHistory";

interface Props {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  onDeleted: (id: number) => Promise<void>;
  children?: ReactNode;
}

function StatsTable({ label, rows }: { label: string; rows: { name: string; totals: Totals }[] }) {
  return <section className="stats-section">
    <h3>{label}</h3>
    <div className="stats-scroll"><table>
      <caption className="sr-only">{label}的记录数、待补全数、已结算数量和有效工作时长</caption>
      <thead><tr><th scope="col">{label === "每日汇总" ? "工作日期" : "工作类别"}</th>
        <th scope="col">记录</th><th scope="col">待补全</th><th scope="col">数量</th><th scope="col">有效时长</th></tr></thead>
      <tbody>{rows.map(({ name, totals }) => <tr key={name}><th scope="row">{name}</th>
        <td>{totals.records}</td><td>{totals.pending_records}</td><td>{formatQuantity(totals.quantity)}</td>
        <td>{formatDuration(totals.duration_ms / 1000)}</td></tr>)}</tbody>
    </table></div>
  </section>;
}

export function HistoryPanel({ open, onClose, refreshKey, onDeleted, children }: Props) {
  const { name } = useCategoryNames();
  const history = useHistory(open, refreshKey, onDeleted);
  const { query, result, target } = history;
  const confirmation = useRef<HTMLDialogElement>(null);
  const cancelDelete = useRef<HTMLButtonElement>(null);
  const [tab, setTab] = useState<"records" | "stats">("records");
  const [draft, setDraft] = useState(query);
  const [filterError, setFilterError] = useState("");

  useEffect(() => {
    if (target && !confirmation.current?.open) {
      confirmation.current?.showModal();
      cancelDelete.current?.focus();
    }
    if (!target && confirmation.current?.open) confirmation.current.close();
  }, [target]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = { ...draft, page: 1 };
    const message = historyQueryError(next);
    setFilterError(message);
    if (!message) history.apply(next);
  }
  const pages = result ? Math.max(1, Math.ceil(result.filtered.records / result.page_size)) : 1;

  return <Surface title="历史与统计" onClose={onClose} actions={result&&<nav className="history-pagination"><button disabled={history.loading||result.page<=1} onClick={()=>history.apply({...query,page:result.page-1})}>上一页</button><span>第 {result.page} / {pages} 页</span><button disabled={history.loading||result.page>=pages} onClick={()=>history.apply({...query,page:result.page+1})}>下一页</button></nav>}>
    {children}
    <p className="hint">按本机时间的任务开始日期查询。工时包含待补全记录，数量仅汇总已结算记录。跨午夜归入开始日。</p>
    <form className="history-filters" onSubmit={submit} noValidate>
      <div className="field-row grid grid-cols-2 gap-3">
        <label>开始日期<input type="date" min="1970-01-01" max="9999-12-31" value={draft.start_date}
          disabled={!history.native || history.deleting} onChange={(event) => { setFilterError(""); setDraft({ ...draft, start_date: event.target.value }); }} /></label>
        <label>结束日期<input type="date" min="1970-01-01" max="9999-12-31" value={draft.end_date}
          disabled={!history.native || history.deleting} onChange={(event) => { setFilterError(""); setDraft({ ...draft, end_date: event.target.value }); }} /></label>
      </div>
      <div className="filter-category-row">
        <label>工作类别<select value={draft.category ?? ""} disabled={!history.native || history.deleting}
          onChange={(event) => { setFilterError(""); setDraft({ ...draft, category: event.target.value || null }); }}>
          <option value="">全部类别</option>
          {CATEGORIES.map((category) => <option key={category} value={category}>{name(category)}</option>)}
        </select></label>
        <button type="submit" disabled={!history.native || history.loading || history.deleting}>
          <Icon name="search" />{history.loading ? "正在查询…" : "查询"}</button>
      </div>
      <p className="hint">默认最近 30 天，单次最多 366 天；可更改日期查看更早记录。</p>
      {filterError && <p className="inline-error" role="alert">{filterError}</p>}
    </form>
    <div className="history-tabs grid grid-cols-2 gap-2" aria-label="查看内容">
      <button type="button" className="secondary" aria-pressed={tab === "records"} onClick={() => setTab("records")}><Icon name="list" />工作记录</button>
      <button type="button" className="secondary" aria-pressed={tab === "stats"} onClick={() => setTab("stats")}><Icon name="chart" />统计汇总</button>
    </div>
    {!history.native && <p className="notice">浏览器预览不能查询或删除本地工作记录，请打开桌面应用。</p>}
    {history.notice && <p className="history-feedback" role="status">{history.notice}</p>}
    {history.loading && <p className="hint" role="status">正在读取记录和汇总…</p>}
    {history.error && <div className="error-banner" role="alert">
      <p>{history.error}</p><button type="button" className="text-button" disabled={history.loading || history.deleting}
        onClick={() => { void history.reload(); }}>重新读取</button>
    </div>}
    {result && <div aria-busy={history.loading}>
      <p className="history-overview">全部已结束：{result.overview.records} 条 · 待补全 {result.overview.pending_records} 条 · 已结算数量 {formatQuantity(result.overview.quantity)}
        <br />累计有效时长 {formatDuration(result.overview.duration_ms / 1000)}</p>
      <p className="hint">当前范围：{query.start_date} 至 {query.end_date} · {query.category ? name(query.category) : "全部类别"}</p>
      <dl className="summary-grid">
        <div><dt>结束记录</dt><dd>{result.filtered.records}<small> 条（待补全 {result.filtered.pending_records}）</small></dd></div>
        <div><dt>工作数量</dt><dd>{formatQuantity(result.filtered.quantity)}</dd></div>
        <div><dt>有效时长</dt><dd>{formatDuration(result.filtered.duration_ms / 1000)}</dd></div>
      </dl>
      {result.filtered.records === 0 ? <p className="history-empty">这个范围还没有已结束记录。可以调整日期或类别；结束计时后记录会出现在这里。</p>
        : tab === "records" ? <>
          <ol className="history-records">
            {result.records.map((record) => <li key={record.id}>
              <div className="record-heading"><strong>{name(record.category)} · {formatQuantity(record.quantity)} · {record.settlement_status === "PENDING" ? "待补全" : "已结算"}</strong>
                <span>{formatDuration(record.duration_seconds)}</span></div>
              <p className="hint">工作日期 {localDate(new Date(record.start_time))}<br />
                开始 {formatTime(record.start_time)}<br />结束 {record.end_time !== null ? formatTime(record.end_time) : "—"}</p>
              <p className="record-remark">{record.remark || "未填写备注"}</p>
              <button type="button" className="text-button delete-link" disabled={history.loading || history.deleting}
                aria-label={`删除 ${name(record.category)} 记录 ${record.id}`} onClick={() => history.chooseDelete(record)}><Icon name="delete" />删除记录</button>
            </li>)}
          </ol>

        </> : <>
          <StatsTable label="按类别汇总" rows={result.categories.map((row) => ({ name: name(row.category), totals: row.totals }))} />
          <StatsTable label="每日汇总" rows={result.daily.map((row) => ({ name: row.date, totals: row.totals }))} />
          <p className="hint">汇总覆盖当前全部筛选结果，不限于当前页。数量直接相加；时长先合计毫秒再显示到秒。</p>
        </>}
    </div>}

    <dialog ref={confirmation} className="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description"
      onCancel={(event) => { event.preventDefault(); event.stopPropagation(); history.cancelDelete(); }}>
      <h2 id="delete-title">删除这条记录？</h2>
      <p id="delete-description">将永久删除这条已完成记录，并重新计算统计。此操作不能撤销。</p>
      {target && <div className="delete-record-detail">
        <strong>{name(target.category)} · {formatQuantity(target.quantity)}</strong>
        <p>开始 {formatTime(target.start_time)}<br />结束 {target.end_time !== null ? formatTime(target.end_time) : "—"}
          <br />有效时长 {formatDuration(target.duration_seconds)}</p>
        <p className="record-remark">{target.remark || "未填写备注"}</p>
      </div>}
      {history.deleteError && <p className="error-banner" role="alert">{history.deleteError}</p>}
      <div className="settings-actions grid grid-cols-2 gap-3">
        <button ref={cancelDelete} type="button" className="secondary" disabled={history.deleting} onClick={history.cancelDelete}>取消</button>
        <button type="button" className="danger-button" disabled={history.deleting} onClick={() => { void history.remove(); }}>
          {history.deleting ? "正在删除…" : "确认删除"}</button>
      </div>
    </dialog>
  </Surface>;
}
```

## E:\WorkMemo\src\MonitoringSettings.tsx

```tsx
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
```

## E:\WorkMemo\src\NotificationApp.tsx

```tsx
import { useCategoryNames } from "./categoryNames";
import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { formatDuration, type Snapshot, type WorkNotice } from "./types";
import "./App.css";

export function NotificationApp() {
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  useEffect(() => {
    let stopped = false;
    let reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      try {
        const [value, current] = await Promise.all([
          invoke<WorkNotice | null>("get_notice"),
          invoke<Snapshot>("get_snapshot"),
        ]);
        if (!stopped) {
          setNotice(value);
          setSnapshot(current);
          setReadError("");
        }
      } catch (failure: unknown) {
        if (!stopped) {
          setSnapshot(null);
          setReadError(String(failure));
        }
      } finally {
        reading = false;
      }
    }
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 1000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, []);
  const key = notice ? `${notice.kind}:${notice.record.id}` : "";
  useEffect(() => {
    if (key) void appearance.reload();
  }, [key]);
  useEffect(() => {
    let stopped = false;
    let unlisten: (() => void) | undefined;
    void listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    }).then((fn) => {
      if (stopped) fn();
      else unlisten = fn;
    });
    return () => {
      stopped = true;
      unlisten?.();
    };
  }, [appearance.reload]);
  async function later() {
    if (!notice || busy) return;
    setBusy(true);
    setError("");
    try {
      await invoke("defer_notice", { id: notice.record.id, kind: notice.kind });
      setNotice(null);
    } catch (failure: unknown) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  }
  async function openSettlement() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      await dashboard.open("pending");
      if (notice)
        await invoke("defer_notice", { id: notice.record.id, kind: "ended" });
      setNotice(null);
    } catch (failure: unknown) {
      setError(String(failure));
    } finally {
      setBusy(false);
    }
  }
  async function intent(action: "confirm_work" | "enter_browsing" | "pause_task" | "resume_task") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      setSnapshot(
        await invoke<Snapshot>(
          action,
          action === "confirm_work"
            ? { candidateId: snapshot?.monitoring.start_candidate?.id ?? null }
            : action === "pause_task" || action === "resume_task" ? {id:snapshot?.active?.id} : {},
        ),
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const active = snapshot?.active;
  const monitor = snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲暂停" : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";
  if (!notice)
    return (
      <div
        className="desktop-frame island-frame"
        style={themeStyle(appearance.current)}
      >
        <div
          className={`app-shell island-shell ${candidate ? "is-confirming" : ""}`}
        >
          <div className="island-main-row">
            <div
              className="island-drag"
              onMouseDown={(event) => {
                if (event.button === 0)
                  void getCurrentWindow()
                    .startDragging()
                    .catch(() => {});
              }}
              aria-label="拖动状态岛"
            >
              {candidate || active || monitor?.browse_category ? (
                <WorkBadge
                  category={
                    candidate?.category ??
                    active?.category ??
                    monitor?.browse_category ??
                    "开发"
                  }
                  presentation={presentation.current}
                  showName={false}
                />
              ) : (
                <span className="work-symbol">
                  <Icon name="read" />
                </span>
              )}
              <span className="island-info">
                <strong>
                  {candidate?.category || active?.category ? name(candidate?.category ?? active!.category) : "仅浏览"}
                </strong>
                <small>{snapshot ? state : "状态不可用"}</small>
              </span>
              {active && (
                <strong className="island-time">
                  {formatDuration(active.duration_seconds)}
                </strong>
              )}
            </div>
            {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} title={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || active.recovery_pending} onClick={() => { void intent(active.is_paused ? "resume_task" : "pause_task"); }}><Icon name={active.is_paused ? "play" : "pause"}/></button>}
            {!candidate && monitor?.browsing_only && <button type="button" className="island-start" disabled={busy || !monitor.browse_ready || !!active?.recovery_pending} onClick={() => { void intent("confirm_work"); }}>{active ? "继续" : "开始记录"}</button>}
            <button
              className="island-open"
              aria-label="打开WorkMemo"
              onClick={() => {
                void invoke("show_main", { settlement: false }).catch((e) =>
                  setError(String(e)),
                );
              }}
            >
              <Icon name="open" />
            </button>
          </div>
          {candidate && (
            <div className="island-intent">
              <button
                disabled={
                  busy ||
                  (!candidate && !monitor?.browse_ready) ||
                  !!active?.recovery_pending
                }
                onClick={() => {
                  void intent("confirm_work");
                }}
              >
                {active ? "继续记录" : "开始记录"}
              </button>
              {candidate && (
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => {
                    void intent("enter_browsing");
                  }}
                >
                  仅浏览
                </button>
              )}
            </div>
          )}
          {(error || readError) && (
            <span
              className="island-error"
              role="alert"
              title={[error, readError].filter(Boolean).join("；")}
            >
              !
            </span>
          )}
        </div>
      </div>
    );
  return (
    <div
      className="desktop-frame notice-frame"
      style={themeStyle(appearance.current)}
    >
      <div className="app-shell">
        <header className="notice-titlebar flex items-center gap-3">
          <span
            onMouseDown={(event) => {
              if (event.button === 0)
                void getCurrentWindow()
                  .startDragging()
                  .catch(() => {});
            }}
          >
            WorkMemo 工作提醒
          </span>
          <button
            className="secondary"
            type="button"
            disabled={!notice || busy}
            onClick={() => {
              void later();
            }}
          >
            稍后
          </button>
        </header>
        <main className="notice-content">
          {dashboard.fallback}
          {error && (
            <p className="error-banner" role="alert">
              {error}
            </p>
          )}
          {readError && (
            <p className="error-banner" role="alert">
              读取状态失败：{readError}
            </p>
          )}
          {notice?.kind === "idle" && (
            <section aria-label="空闲提醒">
              <h1>
                已连续 {formatDuration(notice.idle_warning_seconds)}{" "}
                没有输入活动
              </h1>
              <p>
                到达 {formatDuration(notice.idle_end_seconds)}{" "}
                时将结束本次计时，最后一次输入后的尾段不计入有效工时。恢复操作后会取消此提醒。
              </p>
              <p>{notice.record.pause_reason === "IDLE_PAUSE" ? "键鼠空闲已暂停，有效工时" : "当前暂计"} {formatDuration(notice.record.duration_seconds)}</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void later();
                }}
              >
                知道了，继续稍后处理
              </button>
            </section>
          )}
          {notice?.kind === "ended" && (
            <section aria-label="工作结束提醒">
              <h1>本次工作已结束，请填写工作量</h1>
              <p className="hint">结果已保存。稍后填写不会影响下一段工作。</p>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  void openSettlement();
                }}
              >
                打开待补全窗口填写
              </button>
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => {
                  void later();
                }}
              >
                稍后填写
              </button>
            </section>
          )}
          {!notice && <p role="status">提醒已处理，正在更新。</p>}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            打开 WorkMemo 待补全列表
          </button>
        </main>
      </div>
    </div>
  );
}
```

## E:\WorkMemo\src\PanelApp.tsx

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { DraftContext, Surface, type Draft, useDraft } from "./Drafts";
import { AppearanceSettings } from "./AppearanceSettings";
import { MonitoringSettings } from "./MonitoringSettings";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { DraftController } from "./draftController";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  layoutStyle,
  useDashboard,
} from "./desktopPreferences";
import { VisualSettings, LayoutPanel } from "./SettingsExtras";

type Report = {
  source: string | null;
  conflict_ids: number[];
  skipped_active_ids: number[];
  records: number;
  pending: number;
  active: number;
  imported: number;
  duplicates: number;
  conflicts: number;
  skipped_active: number;
  backup: string | null;
};
function DataPanel({ onClose }: { onClose: () => void }) {
  const dashboard = useDashboard();
  const [demoConfirm, setDemoConfirm] = useState(false);
  async function demo(command: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const count = await invoke<number>(command);
      setMessage(
        command === "seed_demo_data"
          ? `演示数据已准备：${count}条。真实统计仍与演示分开。`
          : `已清理${count}条演示记录，真实记录保留。`,
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const [report, setReport] = useState<Report | null>(null);
  const [restoreInfo, setRestoreInfo] = useState<Report | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [include, setInclude] = useState(false);
  const [action, setAction] = useState<"import" | "restore" | null>(null);
  useDraft(
    "data-operation",
    false,
    busy,
    async () => false,
    () => {},
  );
  async function run(command: string, args?: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<Report | string | null>(command, args);
      if (command === "preview_migration") {
        setReport(result as Report | null);
        setMessage(result ? "请核对预览记录后确认导入。" : "未发现预览数据。");
      } else if (command === "inspect_backup") {
        if (result) {
          setRestoreInfo(result as Report);
          setAction("restore");
        }
      } else if (command === "import_preview") {
        const r = result as Report;
        setMessage(
          `导入 ${r.imported}，重复跳过 ${r.duplicates}，冲突 ${r.conflicts}，未结束冲突 ${r.skipped_active}（${r.skipped_active_ids.join(",")}），冲突记录 ${r.conflict_ids.join(",")}。备份：${r.backup}`,
        );
      } else if (result) setMessage(String(result));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (isTauri()) void run("preview_migration");
  }, []);
  return (
    <Surface title="数据管理" onClose={onClose}>
      <h3>演示数据</h3>
      <p className="hint">
        用于查看图表效果，明确标记并与真实统计分开。重复生成不会增加重复记录。
      </p>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void demo("seed_demo_data");
          }}
        >
          生成演示数据
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            void dashboard.open("all", "demo");
          }}
        >
          查看演示效果
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => setDemoConfirm(true)}
        >
          清理演示数据…
        </button>
      </div>
      {dashboard.fallback}
      <UiDialog
        open={demoConfirm}
        onClose={() => setDemoConfirm(false)}
        title="清理演示数据"
        id="clear-demo"
      >
        <p>只删除标记为演示的已结束记录。真实工作记录和当前任务保留。</p>
        <div className="settings-actions">
          <button className="secondary" onClick={() => setDemoConfirm(false)}>
            取消
          </button>
          <button
            onClick={() => {
              setDemoConfirm(false);
              void demo("clear_demo_data");
            }}
          >
            清理演示记录
          </button>
        </div>
      </UiDialog>
      <h3>从预览版迁移</h3>
      <p className="hint">
        先从托盘退出预览版。正式版原记录保留，重复导入会跳过；已导入记录有变化时列为冲突。两边都有未结束任务时，冲突任务留在原处。
      </p>
      {report && (
        <p>
          来源：{report.source}
          <br />
          记录 {report.records} · 待补全 {report.pending} · 未结束{" "}
          {report.active}
        </p>
      )}
      <label>
        <input
          type="checkbox"
          checked={include}
          disabled={busy}
          onChange={(e) => setInclude(e.target.checked)}
        />
        同时导入预览监测配置（默认保留正式配置；导入后先保持监测关闭）
      </label>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("preview_migration");
          }}
        >
          重新检查
        </button>
        <button disabled={busy || !report} onClick={() => setAction("import")}>
          备份并合并预览记录
        </button>
      </div>
      <h3>备份与恢复</h3>
      <p className="hint">
        完整备份包含工作数据库、监测配置、外观及布局，不含连接令牌和浏览器注册。恢复会整体替换当前快照，恢复前自动备份原数据；正在计时时请先暂停。
      </p>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("create_backup");
          }}
        >
          创建备份…
        </button>
        <button
          disabled={busy}
          className="secondary"
          onClick={() => {
            void run("inspect_backup");
          }}
        >
          从备份恢复…
        </button>
      </div>
      {busy && <p role="status">正在处理，请勿退出…</p>}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <UiDialog
        open={action !== null}
        onClose={() => setAction(null)}
        title="确认数据操作"
        id="confirm-data"
      >
        <p>
          {action === "import"
            ? "先备份当前数据，再合并预览记录；不会覆盖正式记录。"
            : `将从 ${restoreInfo?.backup} 恢复记录 ${restoreInfo?.records} 条（待补全 ${restoreInfo?.pending}，未结束 ${restoreInfo?.active}），替换当前数据。原数据会先自动备份。`}
        </p>
        <div className="settings-actions">
          <button className="secondary" onClick={() => setAction(null)}>
            取消
          </button>
          <button
            onClick={() => {
              const a = action;
              setAction(null);
              void run(
                a === "import" ? "import_preview" : "restore_backup",
                a === "import" ? { includeConfig: include } : undefined,
              );
            }}
          >
            确认并{action === "import" ? "导入" : "恢复备份"}
          </button>
        </div>
      </UiDialog>
    </Surface>
  );
}
export function PanelApp({ panel }: { panel: string }) {
  const layout = useLayout();
  const presentation = usePresentation();
  const appearance = useAppearance();

  const [section, setSection] = useState(
    new URLSearchParams(window.location.search).get("section") ?? "monitor",
  );
  const [version, setVersion] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(false);
  const [saving, setSaving] = useState(false);
  const drafts = useRef(new DraftController());
  const registry = { current: drafts.current.entries };
  const next = useRef<(() => void) | null>(null);
  const register = useCallback((id: string, d: Draft | null) => {
    if (d) registry.current.set(id, d);
    else registry.current.delete(id);
    const dirty = [...registry.current.values()].some((x) => x.dirty || x.busy);
    setHasDraft(dirty);
    if (isTauri())
      void invoke("set_window_dirty", { dirty }).catch((e) =>
        setError(String(e)),
      );
  }, []);
  const change = useCallback((action: () => void) => {
    if ([...registry.current.values()].some((d) => d.busy)) {
      setError("正在保存，请稍候。");
      return;
    }
    if ([...registry.current.values()].some((d) => d.dirty)) {
      next.current = action;
      setDecision(true);
    } else action();
  }, []);
  const close = useCallback(
    () =>
      change(() => {
        void invoke("close_panel").catch((e) => setError(String(e)));
      }),
    [change],
  );
  async function saveAll() {
    if (drafts.current.busy) return;
    setSaving(true);
    try {
      if (!(await drafts.current.save())) return;
      setDecision(false);
      const action = next.current;
      next.current = null;
      action?.();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.querySelector("dialog[open]")) return;
        e.preventDefault();
        close();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveAll();
      }
    };
    window.addEventListener("keydown", key);
    const unsubs: Promise<() => void>[] = [];
    if (isTauri()) {
      unsubs.push(listen("workmemo:request-close", close));
      unsubs.push(
        listen<string>("workmemo:settings-section", (e) =>
          change(() =>
            setSection(
              ["appearance", "layout", "data", "visuals"].includes(e.payload)
                ? e.payload
                : "monitor",
            ),
          ),
        ),
      );
      unsubs.push(
        listen("workmemo:data-changed", () => {
          if (![...registry.current.values()].some((d) => d.dirty))
            setVersion((v) => v + 1);
        }),
      );
      unsubs.push(
        listen("workmemo:appearance-changed", () => {
          if (![...registry.current.values()].some((d) => d.dirty))
            void appearance.reload();
        }),
      );
    }
    return () => {
      window.removeEventListener("keydown", key);
      for (const p of unsubs) void p.then((f) => f());
    };
  }, [change, close]);
  return (
    <DraftContext.Provider value={register}>
      <DesktopWindow
        density={layout.current.density}
        background={presentation.current.background}
        appearanceStyle={{
          ...themeStyle(appearance.current),
          ...layoutStyle(layout.current),
        }}
        navigation={
          <nav aria-label="二级窗口">
            <strong>
              {panel === "settings"
                ? "设置"
                : panel === "history"
                  ? "历史与统计"
                  : "待补全"}
            </strong>
          </nav>
        }
      >
        <div className="panel-app">
          {panel === "settings" && (
            <nav className="settings-tabs">
              {[
                ["appearance", "外观"],
                ["visuals", "工作名称与外观"],
                ["monitor", "监测"],
                ["layout", "布局"],
                ["data", "数据管理"],
              ].map(([id, label]) => (
                <button
                  className="secondary"
                  aria-pressed={section === id}
                  key={id}
                  onClick={() => change(() => setSection(id))}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          {hasDraft && (
            <p className="draft-indicator">有未保存修改 · Ctrl+S 保存</p>
          )}
          {section === "appearance" ? (
            <AppearanceSettings
              appearance={appearance}
              presentation={presentation}
              onClose={close}
            />
          ) : section === "visuals" ? (
            <VisualSettings presentation={presentation} />
          ) : section === "monitor" ? (
            <MonitoringSettings
              key={version}
              open
              onClose={close}
              onSaved={() => setVersion((v) => v + 1)}
            />
          ) : section === "layout" ? (
            <LayoutPanel />
          ) : (
            <DataPanel onClose={close} />
          )}
          <UiDialog
            open={decision}
            onClose={() => {
              next.current = null;
              setDecision(false);
            }}
            title="保留未保存的修改？"
            id="draft-decision"
          >
            <p>保存成功后再离开；放弃只撤销本次输入，不删除已保存记录。</p>
            <div className="settings-actions">
              <button
                disabled={saving}
                onClick={() => {
                  void saveAll();
                }}
              >
                保存并继续
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  if (!drafts.current.discard()) return;
                  setDecision(false);
                  const action = next.current;
                  next.current = null;
                  action?.();
                }}
              >
                放弃修改
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  next.current = null;
                  setDecision(false);
                }}
              >
                继续编辑
              </button>
            </div>
          </UiDialog>
        </div>
      </DesktopWindow>
    </DraftContext.Provider>
  );
}
```

## E:\WorkMemo\src\SettingsExtras.tsx

```tsx
import { CategoryNamesEditor } from "./CategoryNamesEditor";
import { useCategoryNames } from "./categoryNames";
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { CATEGORIES } from "./types";
import {
  DEFAULT_LAYOUT,
  useLayout,
  WORK_ICONS,
  WorkBadge,
  type LayoutSettings,
  type PresentationController,
} from "./desktopPreferences";
const iconLabels: Record<string, string> = {
  checkSquare: "检查",
  safety: "盾牌",
  code: "代码",
  note: "文档",
  search: "搜索",
  chart: "图表",
  list: "清单",
  clock: "时钟",
  star: "星标",
  rocket: "火箭",
  bulb: "灵感",
  tool: "工具",
  read: "阅读",
  check: "完成",
  home: "主页",
  settings: "设置",
};
export function VisualSettings({
  presentation,
}: {
  presentation: PresentationController;
}) {
  const { name } = useCategoryNames();
  const { current, setVisual } = presentation;
  const compact = useLayout().current.density === "compact";
  useDraft(
    "category-visuals",
    presentation.dirty,
    presentation.busy,
    presentation.save,
    presentation.cancel,
  );
  return (
    <Surface
      title="工作名称、图标与颜色"
      actions={
        <>
          <button
            className="secondary"
            disabled={presentation.busy}
            onClick={presentation.cancel}
          >
            取消预览
          </button>
          <button
            disabled={presentation.busy || !presentation.loaded || !isTauri()}
            onClick={() => {
              void presentation.save();
            }}
          >
            保存工作外观
          </button>
        </>
      }
    >
      <p className="hint">
        同一类别在主页、状态岛和数据中心使用相同的图标与颜色。
      </p>
      <CategoryNamesEditor />
      {CATEGORIES.map((category) => {
        const visual = current.categories[category];
        return (
          <fieldset key={category} className="visual-category">
            <legend>
              <WorkBadge category={category} presentation={current} />
            </legend>
            <label className="color-field">
              类别颜色
              <input
                aria-label={`${name(category)}颜色`}
                type="color"
                value={visual.color}
                disabled={presentation.busy}
                onChange={(e) =>
                  setVisual(category, { ...visual, color: e.target.value })
                }
              />
              <span>{visual.color}</span>
            </label>
            <details open={!compact}>
              <summary>选择图标：{iconLabels[visual.icon]}</summary>
              <div className="icon-picker">
                {WORK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={iconLabels[icon]}
                    aria-label={`${name(category)}使用${iconLabels[icon]}图标`}
                    aria-pressed={visual.icon === icon}
                    className="secondary"
                    disabled={presentation.busy}
                    onClick={() => setVisual(category, { ...visual, icon })}
                  >
                    <Icon name={icon} />
                  </button>
                ))}
              </div>
            </details>
          </fieldset>
        );
      })}
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
    </Surface>
  );
}
export function LayoutPanel() {
  const layout = useLayout();
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [saved, setSaved] = useState(DEFAULT_LAYOUT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  useEffect(() => {
    if (layout.loaded && !dirty && !busy) {
      setCurrent(layout.current);
      setSaved(layout.current);
    }
  }, [layout.current, layout.loaded]);
  async function save() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<LayoutSettings>("set_layout_options", {
        input: {
          density: current.density,
          sound_enabled: current.sound_enabled,
          font_size: current.font_size,
          font_weight: current.font_weight,
          line_spacing: current.line_spacing,
          expected_revision: saved.revision,
        },
      });
      setSaved(result);
      setCurrent(result);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  useDraft("layout", dirty, busy, save, () => {
    setCurrent(saved);
    setError("");
  });
  function field<K extends keyof LayoutSettings>(
    name: K,
    value: LayoutSettings[K],
  ) {
    setCurrent((p) => ({ ...p, [name]: value }));
  }
  return (
    <Surface
      title="布局与字体"
      actions={
        <button
          disabled={busy || !layout.loaded || !isTauri()}
          onClick={() => {
            void save();
          }}
        >
          保存布局
        </button>
      }
    >
      <div className="layout-form">
        <label className="monitor-toggle"><input type="checkbox" checked={current.sound_enabled} disabled={busy} onChange={e => field("sound_enabled", e.target.checked)}/>关键状态提示音</label>
        <button type="button" className="secondary" disabled={!isTauri() || busy} onClick={() => { void invoke("preview_sound").catch(e => setError(String(e))); }}>试听提示音</button>
        <label>
          界面模式
          <select
            disabled={busy}
            value={current.density}
            onChange={(e) =>
              field("density", e.target.value as LayoutSettings["density"])
            }
          >
            <option value="comfortable">舒展 · 完整信息</option>
            <option value="compact">紧凑 · 极简信息</option>
          </select>
        </label>
        <p className="hint">
          紧凑模式让主窗口成为小计时器，二级页面默认折叠辅助内容；错误与恢复提醒始终可见。
        </p>
        <label>
          正文字号：{current.font_size}px
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={current.font_size}
            disabled={busy}
            onChange={(e) => field("font_size", Number(e.target.value))}
          />
        </label>
        <label>
          文字粗细
          <select
            disabled={busy}
            value={current.font_weight}
            onChange={(e) => field("font_weight", Number(e.target.value))}
          >
            {[
              [400, "常规"],
              [500, "中等"],
              [600, "半粗"],
              [700, "加粗"],
            ].map(([v, n]) => (
              <option value={v} key={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          行距
          <select
            disabled={busy}
            value={current.line_spacing}
            onChange={(e) =>
              field(
                "line_spacing",
                e.target.value as LayoutSettings["line_spacing"],
              )
            }
          >
            <option value="tight">紧密</option>
            <option value="standard">标准</option>
            <option value="loose">宽松</option>
          </select>
        </label>
        <div
          className="font-preview"
          style={{
            fontSize: current.font_size,
            fontWeight: current.font_weight,
            lineHeight: { tight: 1.35, standard: 1.6, loose: 1.85 }[
              current.line_spacing
            ],
          }}
        >
          把注意力留给手上的事。
          <br />
          计时、类别和操作，清楚就好。
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void invoke("reset_window_layout")
              .then(() => invoke<LayoutSettings>("get_layout_settings"))
              .then((result) => {
                setCurrent(result);
                setSaved(result);
                void layout.reload();
              })
              .catch((e) => setError(String(e)))
              .finally(() => setBusy(false));
          }}
        >
          恢复所有窗口默认布局
        </button>
      </div>
      {(error || layout.error) && (
        <p className="error-banner" role="alert">
          {error || layout.error}
        </p>
      )}
    </Surface>
  );
}
```

## E:\WorkMemo\src\SettlementPanel.tsx

```tsx
import { useCategoryNames } from "./categoryNames";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
  type WorkRecord,
} from "./types";
import { validateWorkInput } from "./workInput";

export function SettlementForm({
  record,
  busy,
  onSave,
  externalActions = false,
}: {
  externalActions?: boolean;
  record: WorkRecord;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const { name } = useCategoryNames();
  const [category, setCategory] = useState(record.category);
  const [quantity, setQuantity] = useState(
    record.quantity === null ? "" : String(record.quantity),
  );
  const [remark, setRemark] = useState(record.remark);
  const [error, setError] = useState("");
  async function saveDraft() {
    if (busy) return false;
    const result = validateWorkInput(category, quantity, remark, true);
    if (!result.ok) {
      setError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    setError("");
    const saved = await onSave({
      ...result.input,
      quantity: result.input.quantity,
      id: record.id,
      expected_revision: record.revision,
    });
    if (!saved)
      setError("保存未完成，请查看上方错误信息后重试。输入内容仍保留。");
    return saved;
  }
  const dirty =
    category !== record.category ||
    quantity !== (record.quantity === null ? "" : String(record.quantity)) ||
    remark !== record.remark;
  useDraft(`settlement-${record.id}`, dirty, busy, saveDraft, () => {
    setCategory(record.category);
    setQuantity(record.quantity === null ? "" : String(record.quantity));
    setRemark(record.remark);
    setError("");
  });
  return (
    <form
      id="settlement-form"
      className="settlement-form"
      onSubmit={(event) => {
        event.preventDefault();
        void saveDraft();
      }}
      noValidate
    >
      <p className="hint">
        开始 {formatTime(record.start_time)}
        <br />
        有效结束 {record.end_time === null ? "—" : formatTime(record.end_time)}
        <br />
        系统确认{" "}
        {record.confirmed_end_time === null
          ? "—"
          : formatTime(record.confirmed_end_time)}
        <br />
        有效工时 {formatDuration(record.duration_seconds)}
      </p>
      <div className="field-row grid grid-cols-2 gap-3">
        <label>
          工作类别
          <select
            value={category}
            disabled={busy}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>{name(value)}</option>
            ))}
          </select>
        </label>
        <label>
          工作量（必填）
          <input
            type="number"
            min="0"
            max="1000000000"
            step="any"
            inputMode="decimal"
            value={quantity}
            disabled={busy}
            placeholder="0 表示无产出"
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
      </div>
      <label>
        备注（选填）
        <textarea
          rows={2}
          value={remark}
          disabled={busy}
          maxLength={4000}
          onChange={(event) => setRemark(event.target.value)}
        />
      </label>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {!externalActions && (
        <button type="submit" disabled={busy}>
          <span>{busy ? "正在保存…" : "填写工作量并保存"}</span>
          <Icon name="check" />
        </button>
      )}
    </form>
  );
}

export function SettlementPanel({
  open,
  onClose,
  refreshKey,
  busy,
  onSave,
  beforeChange = (action) => action(),
}: {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
  beforeChange?: (action: () => void) => void;
}) {
  const { name } = useCategoryNames();
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    let stale = false;
    void invoke<WorkRecord[]>("get_pending_records")
      .then((r) => {
        if (!stale) {
          setRecords(r);
          setSelected((id) =>
            r.some((x) => x.id === id) ? id : (r[0]?.id ?? null),
          );
        }
      })
      .catch((e) => {
        if (!stale) setError(String(e));
      });
    return () => {
      stale = true;
    };
  }, [open, refreshKey]);
  const record = records.find((r) => r.id === selected);
  return (
    <Surface
      title="待补全工作量"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="secondary" onClick={onClose}>
            稍后填写
          </button>
          <button
            form="settlement-form"
            type="submit"
            disabled={busy || !record}
          >
            填写工作量并保存
          </button>
        </>
      }
    >
      <p className="hint">计时结果已保存，稍后填写不会丢失记录。</p>
      {error && <p className="error-banner">{error}</p>}
      {records.length > 0 ? (
        <label>
          选择记录
          <select
            value={selected ?? ""}
            disabled={busy}
            onChange={(e) => {
              const id = Number(e.target.value);
              beforeChange(() => setSelected(id));
            }}
          >
            {records.map((r) => (
              <option value={r.id} key={r.id}>
                {name(r.category)} · {formatTime(r.start_time)} ·{" "}
                {formatDuration(r.duration_seconds)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p>没有待补全记录。</p>
      )}
      {record && (
        <SettlementForm
          key={`${record.id}:${record.revision}:${refreshKey}`}
          record={record}
          busy={busy}
          externalActions
          onSave={async (input) => {
            const ok = await onSave(input);
            if (ok) {
              setRecords((rs) => rs.filter((r) => r.id !== input.id));
              setSelected(records.find((r) => r.id !== input.id)?.id ?? null);
            }
            return ok;
          }}
        />
      )}
    </Surface>
  );
}
```

## E:\WorkMemo\src\WorkForm.tsx

```tsx
import { useCategoryNames } from "./categoryNames";
import { useId, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";
import { validateWorkInput, type InputErrors } from "./workInput";
import { Icon } from "./Icon";

interface Props {
  disabled: boolean;
  minimal?: boolean;
  switching?: boolean;
  starting?: boolean;
  onStart: (input: StartInput) => Promise<boolean>;
}

export function WorkForm({
  minimal = false,
  disabled,
  switching = false,
  starting = false,
  onStart,
}: Props) {
  const { name } = useCategoryNames();
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [errors, setErrors] = useState<InputErrors>({});
  const id = useId();
  const categoryRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const remarkRef = useRef<HTMLTextAreaElement>(null);
  const remarkDetails = useRef<HTMLDetailsElement>(null);

  function clearError(field: keyof StartInput) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const result = validateWorkInput(category, quantity, remark);
    if (!result.ok) {
      setErrors(result.errors);
      if (
        (result.errors.remark || result.errors.quantity) &&
        remarkDetails.current
      )
        remarkDetails.current.open = true;
      (result.errors.category
        ? categoryRef
        : result.errors.quantity
          ? quantityRef
          : remarkRef
      ).current?.focus();
      return;
    }
    setErrors({});
    await onStart(result.input);
  }

  return (
    <form
      className="work-form"
      aria-busy={starting}
      onSubmit={(event) => {
        void submit(event);
      }}
      noValidate
    >
      <div className={`field-row grid gap-3 grid-cols-1`}>
        <label>
          工作类别
          <select
            ref={categoryRef}
            value={category}
            disabled={disabled}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? `${id}-category` : undefined}
            onChange={(event) => {
              setCategory(event.target.value);
              clearError("category");
            }}
          >
            <option value="">请选择类别</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {name(value)}
              </option>
            ))}
          </select>
          {errors.category && (
            <span id={`${id}-category`} className="field-error" role="alert">
              {errors.category}
            </span>
          )}
        </label>
      </div>
      <details className="form-note" ref={remarkDetails} open={!minimal}>
        <summary>
          <Icon name="note" />
          工作量与备注 <span className="optional">选填</span>
        </summary>
        <label>
          工作量（可稍后填写）
          <input
            ref={quantityRef}
            type="number"
            inputMode="decimal"
            min="0"
            max="1000000000"
            step="any"
            placeholder="结束后填写；0 表示无产出"
            value={quantity}
            disabled={disabled}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? `${id}-quantity` : undefined}
            onChange={(event) => {
              setQuantity(event.target.value);
              clearError("quantity");
            }}
          />
          {errors.quantity && (
            <span id={`${id}-quantity`} className="field-error" role="alert">
              {errors.quantity}
            </span>
          )}
        </label>
        <label>
          <span className="sr-only">工作备注</span>
          <textarea
            ref={remarkRef}
            rows={1}
            maxLength={4000}
            placeholder="记下这次工作的内容…"
            value={remark}
            disabled={disabled}
            aria-invalid={Boolean(errors.remark)}
            aria-describedby={`${id}-remark-count${errors.remark ? ` ${id}-remark` : ""}`}
            onChange={(event) => {
              setRemark(event.target.value);
              clearError("remark");
            }}
          />
          <span id={`${id}-remark-count`} className="field-count">
            {Array.from(remark.trim()).length} / 2000
          </span>
          {errors.remark && (
            <span id={`${id}-remark`} className="field-error" role="alert">
              {errors.remark}
            </span>
          )}
        </label>
      </details>
      <p className="hint auxiliary">
        先记录时间，结束后在待补全列表确认工作量。
      </p>
      {switching && (
        <p className="hint">
          开始后将结束并保存当前已暂停的任务，工作量稍后结算。
        </p>
      )}
      <button type="submit" disabled={disabled}>
        {starting
          ? switching
            ? "正在保存并开始…"
            : "正在开始…"
          : switching
            ? "保存上一项，开始新工作"
            : "手动开始工作"}
        <Icon name="open" />
      </button>
    </form>
  );
}
```

## E:\WorkMemo\src\categoryNames.tsx

```tsx
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CATEGORIES } from "./types";

export interface CategoryNames { revision: number; names: Record<string, string> }
export const DEFAULT_CATEGORY_NAMES: CategoryNames = {
  revision: 0, names: Object.fromEntries(CATEGORIES.map(key => [key, key])),
};
const CategoryContext = createContext({
  current: DEFAULT_CATEGORY_NAMES, loaded: false,
  accept: (_value: CategoryNames) => {},
  reload: async (): Promise<CategoryNames | null> => null,
});
export function CategoryProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState(DEFAULT_CATEGORY_NAMES);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const accept = useCallback((value: CategoryNames) => {
    if (!value || !CATEGORIES.every(key => typeof value.names?.[key] === "string")) return;
    setCurrent(value); setLoaded(true); setError("");
  }, []);
  const reload = useCallback(async () => {
    if (!isTauri()) return null; // Browser dashboard receives names from authenticated /api/meta.
    try {
      const value = await invoke<CategoryNames>("get_category_names");
      accept(value); return value;
    } catch (failure) { setError(String(failure)); return null; }
  }, [accept]);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const listeners = ["workmemo:categories-changed", "workmemo:data-changed"].map(event =>
      listen(event, () => { void reload(); }));
    return () => { listeners.forEach(p => { void p.then(unlisten => unlisten()).catch(() => {}); }); };
  }, [reload]);
  return <CategoryContext.Provider value={{ current, loaded, accept, reload }}>
    {error && <div className="error-banner" role="alert">工作名称读取失败：{error}<button type="button" onClick={() => { void reload(); }}>重新读取名称</button></div>}
    {children}
  </CategoryContext.Provider>;
}
export function useCategoryNames() {
  const context = useContext(CategoryContext);
  const name = useCallback((key: string) => context.current.names[key] ?? key, [context.current]);
  return { ...context, name };
}
```

## E:\WorkMemo\src\desktopPreferences.tsx

```tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { invoke, isTauri, convertFileSrc } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CATEGORIES, type Category } from "./types";
import { useCategoryNames } from "./categoryNames";
import { Icon, type IconName } from "./Icon";

export type CategoryVisual = { icon: IconName; color: string };
export type Background = { file: string; opacity: number };
export type Presentation = {
  version: 1;
  revision: number;
  categories: Record<string, CategoryVisual>;
  background: Background | null;
};
export const DEFAULT_PRESENTATION: Presentation = {
  version: 1,
  revision: 0,
  background: null,
  categories: Object.fromEntries(
    CATEGORIES.map((name, i) => [
      name,
      {
        icon: (["checkSquare", "safety", "code", "note"] as IconName[])[i],
        color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
      },
    ]),
  ),
};
export const WORK_ICONS: IconName[] = [
  "checkSquare",
  "safety",
  "code",
  "note",
  "search",
  "chart",
  "list",
  "clock",
  "star",
  "rocket",
  "bulb",
  "tool",
  "read",
  "check",
  "home",
  "settings",
];
export type LayoutSettings = {
  density: "compact" | "comfortable";
  revision: number;
  sound_enabled: boolean;
  font_size: number;
  font_weight: number;
  line_spacing: "tight" | "standard" | "loose";
};
export const DEFAULT_LAYOUT: LayoutSettings = {
  density: "comfortable",
  revision: 0,
  sound_enabled: true,
  font_size: 14,
  font_weight: 400,
  line_spacing: "standard",
};
export function layoutStyle(layout: LayoutSettings): CSSProperties {
  return {
    "--body-size": `${layout.font_size}px`,
    "--body-weight": layout.font_weight,
    "--body-line": { tight: 1.35, standard: 1.6, loose: 1.85 }[
      layout.line_spacing
    ],
  } as CSSProperties;
}
export function backgroundStyle(background: Background): CSSProperties {
  return {
    backgroundImage: `url("${convertFileSrc(background.file, "background")}")`,
    opacity: background.opacity / 100,
  };
}
export function WorkBadge({
  category,
  presentation,
  showName = true,
}: {
  category: string;
  presentation: Presentation;
  showName?: boolean;
}) {
  const { name } = useCategoryNames();
  const visual =
    presentation.categories[category] ??
    DEFAULT_PRESENTATION.categories["开发"];
  return (
    <span
      className="work-badge"
      style={{ "--work-color": visual.color } as CSSProperties}
    >
      <span className="work-symbol">
        <Icon name={visual.icon} />
      </span>
      {showName && <span>{name(category)}</span>}
    </span>
  );
}
export function useLayout() {
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const reload = useCallback(async () => {
    if (!isTauri()) return;
    try {
      setCurrent(await invoke<LayoutSettings>("get_layout_settings"));
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:layout-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  return { current, error, loaded, reload };
}
export function usePresentation() {
  const [current, setCurrent] = useState(DEFAULT_PRESENTATION);
  const [saved, setSaved] = useState(DEFAULT_PRESENTATION);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const saving = useRef(false);
  const state = useRef({ current, saved });
  state.current = { current, saved };
  const reload = useCallback(async () => {
    if (
      !isTauri() ||
      saving.current ||
      JSON.stringify(state.current.current) !==
        JSON.stringify(state.current.saved)
    )
      return;
    try {
      const p = await invoke<Presentation>("get_presentation");
      setSaved(p);
      setCurrent(p);
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:presentation-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  async function save() {
    if (!isTauri() || saving.current) return false;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const p = await invoke<Presentation>("save_presentation", {
        settings: current,
      });
      setCurrent(p);
      setSaved(p);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  async function importImage() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const bg = await invoke<Background | null>("import_background");
      if (bg) setCurrent((p) => ({ ...p, background: bg }));
    } catch (e) {
      setError(String(e));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return {
    current,
    saved,
    busy,
    error,
    loaded,
    dirty: JSON.stringify(current) !== JSON.stringify(saved),
    save,
    reload,
    importImage,
    cancel: () => {
      if (!saving.current) {
        setCurrent(saved);
        setError("");
      }
    },
    setBackground: (background: Background | null) =>
      setCurrent((p) => ({ ...p, background })),
    setVisual: (category: Category | string, visual: CategoryVisual) =>
      setCurrent((p) => ({
        ...p,
        categories: { ...p.categories, [category]: visual },
      })),
  };
}
export type PresentationController = ReturnType<typeof usePresentation>;
export function useDashboard() {
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const last = useRef({ view: "all", scope: "real" });
  async function open(view = "all", scope = "real", defaultBrowser = false) {
    last.current = { view, scope };
    setError("");
    try {
      await invoke("open_dashboard", { view, scope, defaultBrowser });
      setUrl("");
    } catch (e) {
      setError(String(e));
      try {
        setUrl(await invoke<string>("get_dashboard_address", { view, scope }));
      } catch (f) {
        setError(String(f));
      }
    }
  }
  return {
    open,
    fallback: error && (
      <div className="error-banner" role="alert">
        <p>{error}</p>
        {url && (
          <>
            <input
              aria-label="本机数据中心地址"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
            />
            <div className="data-buttons">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(url)
                    .catch(() =>
                      setError("请选中上面的地址，按 Ctrl+C 复制。"),
                    );
                }}
              >
                复制地址
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  void open(last.current.view, last.current.scope, true);
                }}
              >
                使用默认浏览器
              </button>
            </div>
          </>
        )}
      </div>
    ),
  };
}
```

## E:\WorkMemo\src\main.tsx

```tsx
import React,{lazy,Suspense} from "react";
import ReactDOM from "react-dom/client";
import {PanelApp} from "./PanelApp";
import { CategoryProvider } from "./categoryNames";
import App from "./App";
import { NotificationApp } from "./NotificationApp";

const Dashboard=lazy(()=>import("./Dashboard"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode><CategoryProvider>
    {window.location.pathname==="/dashboard"?<Suspense fallback={<p>正在打开工作数据中心…</p>}><Dashboard/></Suspense>:new URLSearchParams(window.location.search).has("notice") ? <NotificationApp /> : new URLSearchParams(window.location.search).has("panel") ? <PanelApp panel={new URLSearchParams(window.location.search).get("panel")!}/> : <App />}
  </CategoryProvider></React.StrictMode>,
);
```

## E:\WorkMemo\src\types.ts

```typescript
export const CATEGORIES = ["评测", "质检", "开发", "文档"] as const;

export type Category = (typeof CATEGORIES)[number];

export interface WorkRecord {
  id: number;
  category: string;
  quantity: number | null;
  remark: string;
  start_time: number;
  end_time: number | null;
  duration_seconds: number;
  duration_ms: number;
  status: "NOT_STARTED" | "WORKING" | "FINISHED";
  is_paused: boolean;
  recovery_pending: boolean;
  settlement_status: "IN_PROGRESS" | "PENDING" | "COMPLETE";
  source: "AUTO" | "MANUAL_START" | "MANUAL_ENTRY";
  pause_reason: "MANUAL" | "APP_CLOSE" | "RECOVERY" | "AWAY" | "MONITOR" | "IDLE_PAUSE" | null;
  confirmed_end_time: number | null;
  last_input_time: number | null;
  end_reason: string | null;
  legacy_duration_ms: number;
  revision: number;
  control_mode: "AUTO" | "MANUAL";
}

export interface Snapshot {
  active: WorkRecord | null;
  recent_records: WorkRecord[];
  warning: string | null;
  pending_count: number;
  monitoring: MonitorStatus;
}

export interface StartInput {
  category: string;
  quantity: number | null;
  remark: string;
}

export interface MonitorStatus {
  browsing_only:boolean;
  browse_ready:boolean;
  browse_category:string|null;
  start_candidate:{id:number;rule_id:number;category:string}|null;
  enabled: boolean;
  browser_connected: boolean;
  native_available: boolean;
  work_page: boolean;
  idle_warning: boolean;
  message: string;
  revision: number;
  idle_pause_seconds: number;
  idle_warning_seconds: number;
  idle_end_seconds: number;
  away_pause_remaining_seconds: number | null;
}
export interface WorkUrl { id: number; url_prefix: string; category: string; match_mode: "path_prefix" | "origin" | "domain_suffix" }
export interface TrackingTimes { idle_pause_seconds: number; idle_warning_seconds: number; idle_end_seconds: number; away_pause_seconds: number; hold_seconds: number }
export interface MonitorConfig { enabled: boolean; revision: number; rules: WorkUrl[]; times: TrackingTimes; poll_interval_seconds: number; auto_resume_manual: boolean }
export interface WorkNotice { kind: "idle" | "ended"; record: WorkRecord; idle_warning_seconds: number; idle_end_seconds: number }

export interface SettleInput {
  id: number;
  expected_revision: number;
  category: string;
  quantity: number;
  remark: string;
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatTime(milliseconds: number): string {
  return new Date(milliseconds).toLocaleString("zh-CN", { hour12: false });
}
```

## E:\WorkMemo\src\workView.ts

```typescript
import { formatDuration, type Snapshot, type WorkRecord } from "./types.ts";

interface ViewInput {
  native: boolean;
  loading: boolean;
  snapshot: Snapshot | null;
  connectionError: string;
  savedId: number | null;
}

export function confirmedFinish(snapshot: Snapshot | null, id: number | null): WorkRecord | null {
  if (id === null || !snapshot || snapshot.active) return null;
  return snapshot.recent_records.find((record) => record.id === id
    && record.status === "FINISHED" && record.end_time !== null) ?? null;
}

// A read started before a confirmed deletion may arrive after it. Never revive that record.
export function reconcileDeleted(snapshot: Snapshot, deleted: ReadonlySet<number>): Snapshot {
  return { ...snapshot, recent_records: snapshot.recent_records.filter((record) => !deleted.has(record.id)) };
}

export function workView({ native, loading, snapshot, connectionError, savedId }: ViewInput) {
  const finished = confirmedFinish(snapshot, savedId);
  const record = snapshot?.active ?? finished;
  const mode = !native ? "preview" : loading ? "loading"
    : connectionError || !snapshot ? "unavailable"
    : snapshot.active ? (snapshot.active.is_paused ? "paused" : "working")
    : finished ? "finished" : "ready";
  const labels = { preview: "桌面预览", loading: "正在读取", unavailable: "暂不可用",
    paused: record?.recovery_pending ? "上次任务待恢复" : record?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲自动暂停" : record?.pause_reason === "AWAY" ? "离页自动暂停" : record?.pause_reason === "MONITOR" ? "监测中断暂停" : record?.pause_reason === "MANUAL" ? "手动暂停" : "已暂停",
    working: record?.control_mode === "AUTO" ? "自动记录中" : "手动计时中", finished: finished?.settlement_status === "PENDING" ? "计时已保存，待补全" : "已完成并保存", ready: "准备开始" };
  const captions = { preview: "请在桌面应用中开始工作", loading: "正在读取本地工作记录",
    unavailable: record ? "上次读取的时长，暂未更新" : "连接本地数据后显示时长",
    paused: record?.pause_reason === "IDLE_PAUSE" ? (record.control_mode === "MANUAL" ? "暂停期间不计时；新键鼠操作后继续原任务" : "暂停期间不计时；返回工作页面操作后继续原任务") : "暂停期间不计时", working: "暂计工时；空闲暂停或结束会扣除最后输入后的尾段",
    finished: "本次有效工作时长", ready: "选择类别即可开始，工作量稍后填写" };
  return {
    mode, record, finished, label: labels[mode], caption: captions[mode],
    timer: record ? formatDuration(record.duration_seconds) : mode === "ready" ? "00:00:00" : "--:--:--",
    canOperate: mode === "ready" || mode === "working" || mode === "paused" || mode === "finished",
  };
}
```

## E:\WorkMemo\tests\browser-runtime.test.mjs

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';

let moduleId = 0;
const event = () => {
  const listeners = [];
  return { addListener: callback => listeners.push(callback), emit: (...args) => listeners.forEach(callback => callback(...args)) };
};
const flush = async () => { for (let index = 0; index < 4; index++) await Promise.resolve(); };

async function backgroundScenario(run) {
  const previousChrome = globalThis.chrome;
  const previousInterval = globalThis.setInterval;
  const previousClearInterval = globalThis.clearInterval;
  const previousNow = Date.now;
  let now = previousNow();
  Date.now = () => now;
  const messages = [];
  let tick;
  let nextTimer = 0;
  const timers = new Map();
  let connections = 0;
  const ports = [];
  const names = [];
  const makePort = () => ({ onMessage: event(), onDisconnect: event(), postMessage: frame => messages.push(frame), disconnect() {} });
  const chrome = {
    runtime: {
      id: 'oljcealhccdhaddceacnokihjefloaih',
      getURL: path => `chrome-extension://oljcealhccdhaddceacnokihjefloaih/${path}`,
      connectNative: name => { connections++; names.push(name); const native = makePort(); ports.push(native); return native; },
      onStartup: event(), onInstalled: event(), onMessage: event(),
    },
    permissions: { contains: async () => false, onAdded: event(), onRemoved: event() },
    tabs: { onActivated: event(), onUpdated: event(), onRemoved: event(), query: async () => [] },
    windows: { onFocusChanged: event(), getLastFocused: async () => ({ focused: false }) },
    alarms: { onAlarm: event(), create: async () => {} },
  };
  globalThis.chrome = chrome;
  globalThis.setInterval = (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); tick = callback; return id; };
  globalThis.clearInterval = id => { timers.delete(id); };
  try {
    await import(`../browser-extension/background.js?runtime-test=${++moduleId}`);
    await flush();
    const status = () => {
      let value;
      chrome.runtime.onMessage.emit({ type: 'status' }, { id: chrome.runtime.id, url: chrome.runtime.getURL('popup.html') }, reply => { value = reply; });
      return value;
    };
    await run({ get native() { return ports.at(-1); }, ports, names, chrome, messages, status, timers, connections: () => connections, tick: async (advance = 5000) => { now += advance; tick(); await flush(); } });
  } finally {
    Date.now = previousNow;
    globalThis.chrome = previousChrome;
    globalThis.setInterval = previousInterval;
    globalThis.clearInterval = previousClearInterval;
  }
}

test('原生连接先交换配置，未授权时不发送工作页；后续心跳复用端口并递增序号', async () => {
  await backgroundScenario(async ({ native, messages, status, tick, connections }) => {
    assert.deepEqual(messages[0], { version: 1, sequence: 1, config_revision: -1, focused: false, ready: false, rule_id: null });
    const config = { enabled: true, revision: 7, rules: [{ id: 1, url_prefix: 'https://work.example.test/tasks', category: '开发' }] };
    native.onMessage.emit({ connected: true, config });
    await tick();
    native.onMessage.emit({ connected: true, config });
    await tick();
    assert.equal(connections(), 1);
    assert.deepEqual(messages.map(frame => frame.sequence), [1, 2, 3]);
    assert.equal(messages[1].config_revision, 7);
    assert.equal(messages[1].ready, false);
    assert.equal(messages[1].rule_id, null);
    assert.equal(status().connected, true);
    assert.ok(messages.every(frame => Object.keys(frame).length === 6 && !('url' in frame)));
  });
});

test('Chrome 原生主机错误显示具体原因，断开后的旧回复不能恢复连接', async () => {
  await backgroundScenario(async ({ native, chrome, status }) => {
    chrome.runtime.lastError = { message: 'Specified native messaging host not found.' };
    native.onDisconnect.emit();
    delete chrome.runtime.lastError;
    assert.equal(status().connected, false);
    assert.match(status().message, /Specified native messaging host not found/);
    native.onMessage.emit({ connected: true, config: { enabled: false, revision: 0, rules: [] } });
    assert.equal(status().connected, false);
  });
});

test('本机通信中断与站点授权分开提示，重新连通后清除旧错误', async () => {
  await backgroundScenario(async (scenario) => {
    const { native, status, tick } = scenario;
    native.onMessage.emit({ connected: false, config: null, error: 'desktop_io' });
    assert.match(status().message, /通信连接中断/);
    await tick();
    scenario.native.onMessage.emit({ connected: true, config: { enabled: false, revision: 0, rules: [] } });
    assert.equal(status().connected, true);
    assert.equal(status().message, '已连接本机 WorkMemo');
  });
});

test('正式主机缺失时回退预览主机；退避期间不重复启动，健康端口保持稳定', async () => {
  await backgroundScenario(async scenario => {
    const { native, chrome, status, tick, names, connections } = scenario;
    chrome.runtime.lastError = { message: 'Specified native messaging host not found.' };
    native.onDisconnect.emit(); delete chrome.runtime.lastError;
    await tick(10); assert.equal(connections(), 1);
    await tick(1000); assert.equal(connections(), 2);
    assert.deepEqual(names, ['com.workmemo.browser_bridge', 'com.workmemo.browser_bridge_test']);
    const app = { identifier: 'com.workmemo.test.monitor', version: '0.2.0-alpha.6', protocol: 1 };
    const config = { enabled: false, revision: 0, rules: [] };
    scenario.native.onMessage.emit({ connected: true, config, app });
    assert.equal(status().app.identifier, app.identifier);
    native.onMessage.emit({ connected: true, config });
    assert.equal(status().app.identifier, app.identifier);
    await tick(); scenario.native.onMessage.emit({ connected: true, config, app });
    await tick(); assert.equal(connections(), 2);
  });
});

test('超时会换候选主机，旧端口的断开和回复不清除新连接', async () => {
  await backgroundScenario(async scenario => {
    const old = scenario.native;
    await scenario.tick(11000);
    await scenario.tick(1000);
    assert.equal(scenario.connections(), 2);
    scenario.native.onMessage.emit({ connected: true, config: { enabled: false, revision: 0, rules: [] } });
    old.onDisconnect.emit(); old.onMessage.emit({ connected: false });
    assert.equal(scenario.status().connected, true);
  });
});

test('检测间隔随后端设置更新，始终仅保留一个计时器；旧版配置回退五秒', async () => {
  await backgroundScenario(async ({ native, timers, tick }) => {
    const cfg = { enabled: false, revision: 1, rules: [], poll_interval_seconds: 1 };
    assert.deepEqual([...timers.values()].map(t => t.delay), [5000]);
    native.onMessage.emit({ connected: true, config: cfg });
    assert.deepEqual([...timers.values()].map(t => t.delay), [1000]);
    await tick(1000);
    native.onMessage.emit({ connected: true, config: { ...cfg, revision: 2, poll_interval_seconds: 5 } });
    assert.deepEqual([...timers.values()].map(t => t.delay), [5000]);
    await tick(5000);
    native.onMessage.emit({ connected: true, config: { enabled: false, revision: 3, rules: [] } });
    assert.deepEqual([...timers.values()].map(t => t.delay), [5000]);
    await tick(5000);
    native.onMessage.emit({ connected: true, config: { ...cfg, poll_interval_seconds: 0 } });
    assert.deepEqual([...timers.values()].map(t => t.delay), [5000]);
  });
});

test('等待原生回复时发生的多次页面事件会合并并在回复后立即查询最新页面', async () => {
  await backgroundScenario(async ({ native, chrome, messages, tick }) => {
    const cfg = { enabled: true, revision: 7, poll_interval_seconds: 1, rules: [
      { id: 1, url_prefix: 'https://work.example.test/first', category: '开发' },
      { id: 2, url_prefix: 'https://work.example.test/second', category: '开发' },
    ] };
    let url = 'https://work.example.test/first';
    chrome.permissions.contains = async () => true;
    chrome.windows.getLastFocused = async () => ({ focused: true, id: 1 });
    chrome.tabs.query = async () => [{ url }];
    native.onMessage.emit({ connected: true, config: cfg });
    await tick(1000);
    assert.equal(messages.at(-1).rule_id, 1);
    url = 'https://work.example.test/second';
    chrome.tabs.onActivated.emit({ tabId: 2 });
    chrome.tabs.onUpdated.emit(2, { url }, { active: true });
    assert.equal(messages.length, 2);
    native.onMessage.emit({ connected: true, config: cfg });
    await flush(); await flush();
    assert.equal(messages.length, 3);
    assert.equal(messages.at(-1).rule_id, 2);
    assert.equal(messages.at(-1).sequence, 3);
  });
});

test('页面查询期间发生切换时，过期查询结果不发送并改为读取最新页面', async () => {
  await backgroundScenario(async ({ native, chrome, messages, tick }) => {
    const cfg = { enabled: true, revision: 7, poll_interval_seconds: 1, rules: [
      { id: 1, url_prefix: 'https://work.example.test/first', category: '开发' },
      { id: 2, url_prefix: 'https://work.example.test/second', category: '开发' },
    ] };
    let resolveFirst;
    let queries = 0;
    chrome.permissions.contains = async () => true;
    chrome.windows.getLastFocused = async () => ({ focused: true, id: 1 });
    chrome.tabs.query = () => ++queries === 1
      ? new Promise(resolve => { resolveFirst = resolve; })
      : Promise.resolve([{ url: 'https://work.example.test/second' }]);
    native.onMessage.emit({ connected: true, config: cfg });
    await tick(1000);
    assert.equal(queries, 1);
    chrome.tabs.onActivated.emit({ tabId: 2 });
    resolveFirst([{ url: 'https://work.example.test/first' }]);
    await flush(); await flush();
    assert.equal(messages.length, 2);
    assert.equal(messages.at(-1).rule_id, 2);
    assert.equal(queries, 2);
  });
});


test('页面活动仅随当前匹配标签和支持能力的软件发送；后台标签不会产生活动帧', async () => {
  await backgroundScenario(async ({native, chrome, messages, tick}) => {
    const cfg = {enabled:true,revision:2,poll_interval_seconds:1,rules:[{id:1,url_prefix:'https://work.example.test/tasks',category:'开发'}]};
    chrome.permissions.contains = async () => true;
    chrome.windows.getLastFocused = async () => ({focused:true,id:1});
    chrome.tabs.query = async () => [{id:7,url:'https://work.example.test/tasks'}];
    native.onMessage.emit({connected:true, config:cfg, app:{protocol:1,identifier:'com.workmemo.test.monitor',page_activity:true}});
    await tick(1000);
    chrome.runtime.onMessage.emit({type:'page-activity'}, {id:chrome.runtime.id,frameId:0,tab:{id:7,url:'https://work.example.test/tasks'},url:'https://work.example.test/tasks'},()=>{});
    native.onMessage.emit({connected:true,config:cfg,app:{protocol:1,identifier:'com.workmemo.test.monitor',page_activity:true}});
    await flush();await flush();
    assert.equal(messages.at(-1).page_activity,true);
    chrome.runtime.onMessage.emit({type:'page-activity'}, {id:chrome.runtime.id,frameId:0,tab:{id:8,url:'https://work.example.test/tasks'},url:'https://work.example.test/tasks'},()=>{});
    native.onMessage.emit({connected:true,config:cfg,app:{protocol:1,identifier:'com.workmemo.test.monitor',page_activity:true}});
    await flush();await flush();
    assert.equal(messages.at(-1).page_activity,undefined);
  });
});


test('活动脚本仅注册已授权的配置站点，未授权站点不注入', async () => {
  await backgroundScenario(async ({native,chrome}) => {
    const registrations=[];
    chrome.scripting={getRegisteredContentScripts:async()=>[],unregisterContentScripts:async()=>{},registerContentScripts:async entries=>registrations.push(...entries)};
    chrome.permissions.contains=async ({origins})=>origins.every(x=>x.startsWith('https://allowed.example.test/'));
    native.onMessage.emit({connected:true,config:{enabled:true,revision:1,rules:[{id:1,url_prefix:'https://allowed.example.test/tasks',category:'开发'},{id:2,url_prefix:'https://denied.example.test/tasks',category:'开发'}]}});
    await flush();await flush();
    assert.equal(registrations.length,1);
    assert.deepEqual(registrations[0].matches,['https://allowed.example.test/*']);
    assert.equal(registrations[0].allFrames,false);
  });
});

test('匹配能力只发送给声明支持的软件，旧协议不增加未知字段', async () => {
  await backgroundScenario(async ({native,messages,tick}) => {
    assert.equal(messages[0].match_modes, undefined);
    native.onMessage.emit({connected:true,config:{enabled:false,revision:1,rules:[]},app:{identifier:'com.workmemo.desktop',protocol:1,match_modes:true}});
    await tick();
    assert.equal(messages.at(-1).match_modes,true);
  });
});


test('工作改名只更新扩展显示元数据，不改变规则身份或发送输入内容', async () => {
  await backgroundScenario(async ({native, status, messages, tick}) => {
    const config = {enabled:true,revision:7,rules:[{id:1,url_prefix:'https://work.example.test/',category:'开发'}]};
    native.onMessage.emit({connected:true,config,category_names:{'开发':'编程任务'}});
    assert.equal(status().config.category_names['开发'],'编程任务');
    assert.equal(status().config.rules[0].category,'开发');
    assert.equal(status().config.revision,7);
    await tick();
    assert.ok(messages.every(frame=>!('category_names' in frame)));
    native.onMessage.emit({connected:true,config});
    assert.deepEqual(status().config.category_names,{});
  });
});
```
