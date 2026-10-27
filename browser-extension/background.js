import { HOST_NAME } from './bridge-config.js';
import { matchRule, permissionOrigins } from './matching.js';

let port = null;
let sequence = 0;
let config = null;
let connected = false;
let sending = false;
let awaitingReply = false;
let sentAt = 0;
let connectionError = '';

function status() {
  return { connected, config, message: connected ? '已连接本机 WorkMemo' : connectionError || '等待本机连接；请确认已注册配套主机并启动 WorkMemo' };
}

function connect() {
  if (port) return;
  try {
    const current = chrome.runtime.connectNative(HOST_NAME);
    port = current;
    sequence = 0;
    current.onMessage.addListener(message => {
      if (port !== current) return;
      awaitingReply = false;
      connected = message?.connected === true;
      config = connected && message.config && Array.isArray(message.config.rules) ? message.config : null;
      connectionError = connected ? '' : message?.error === 'desktop_io'
        ? '本机通信连接中断，正在重连；请确认已更新 WorkMemo'
        : '通信主机尚未连接软件，请确认 WorkMemo 已启动且使用配套版本';
    });
    current.onDisconnect.addListener(() => {
      const error = chrome.runtime.lastError?.message;
      if (port === current) {
        port = null; connected = false; config = null; awaitingReply = false;
        connectionError = error ? `本机主机连接失败：${error.slice(0, 300)}` : '本机通信主机已断开，正在重连';
      }
    });
  } catch (error) {
    port = null; connected = false; config = null;
    connectionError = `无法启动本机通信：${error instanceof Error ? error.message.slice(0, 300) : '请检查主机注册'}`;
  }
}

async function poll() {
  if (sending) return;
  sending = true;
  try {
    if (awaitingReply && Date.now() - sentAt > 10_000) {
      const stale = port; port = null; connected = false; config = null; awaitingReply = false; stale?.disconnect();
      connectionError = '本机通信响应超时，正在重连';
    }
    connect();
    if (!port || awaitingReply) return;
    const rules = config?.rules ?? [];
    const origins = permissionOrigins(rules);
    const ready = !!config && (origins.length === 0 || await chrome.permissions.contains({ origins }));
    let focused = false;
    let ruleId = null;
    if (ready && config.enabled) {
      const window = await chrome.windows.getLastFocused();
      focused = window.focused === true;
      if (focused) {
        const [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
        ruleId = matchRule(tab?.url, rules);
      }
    }
    // The native frame deliberately has no URL, title, page content, or input data.
    const frame = { version: 1, sequence: ++sequence, config_revision: config?.revision ?? -1, focused, ready, rule_id: ruleId };
    awaitingReply = true;
    sentAt = Date.now();
    port.postMessage(frame);
  } catch (error) {
    connected = false;
    awaitingReply = false;
    connectionError = `页面监测暂不可用：${error instanceof Error ? error.message.slice(0, 300) : '请刷新连接状态'}`;
  } finally { sending = false; }
}

chrome.tabs.onActivated.addListener(() => { void poll(); });
chrome.tabs.onUpdated.addListener((_id, change, tab) => { if (tab.active && (change.status || change.url)) void poll(); });
chrome.tabs.onRemoved.addListener(() => { void poll(); });
chrome.windows.onFocusChanged.addListener(() => { void poll(); });
chrome.permissions.onAdded.addListener(() => { void poll(); });
chrome.permissions.onRemoved.addListener(() => { void poll(); });
chrome.alarms.onAlarm.addListener(alarm => { if (alarm.name === 'workmemo-reconnect') void poll(); });
chrome.runtime.onStartup.addListener(() => { void poll(); });
chrome.runtime.onInstalled.addListener(() => { void poll(); });
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (sender.id !== chrome.runtime.id || sender.url !== chrome.runtime.getURL('popup.html')) return false;
  if (message?.type === 'status') reply(status());
  else if (message?.type === 'refresh') { void poll(); reply(status()); }
  return false;
});
void chrome.alarms.create('workmemo-reconnect', { periodInMinutes: 0.5 });
setInterval(() => { void poll(); }, 5_000);
void poll();
