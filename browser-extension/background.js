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
      connected = true; config = message.config; app = message.app ?? null; connectionError = '';
      setPollingInterval(config.poll_interval_seconds);
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
    if (ready && currentConfig.enabled) {
      const window = await chrome.windows.getLastFocused();
      focused = window.focused === true;
      if (focused) {
        const [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
        ruleId = matchRule(tab?.url, rules);
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
chrome.permissions.onAdded.addListener(requestEventPoll);
chrome.permissions.onRemoved.addListener(requestEventPoll);
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'workmemo-reconnect') void poll(); });
chrome.runtime.onStartup.addListener(() => { void poll(); });
chrome.runtime.onInstalled.addListener(() => { void poll(); });
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('popup.html')) return false;
  if (message?.type === 'status') reply(status());
  else if (message?.type === 'refresh') { retryAfter = 0; requestEventPoll(); reply(status()); }
  return false;
});
void chrome.alarms.create('workmemo-reconnect', { periodInMinutes: 0.5 });
setPollingInterval(5);
void poll();
