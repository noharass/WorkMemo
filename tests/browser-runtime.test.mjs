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
