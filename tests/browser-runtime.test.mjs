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
  const messages = [];
  let tick;
  let connections = 0;
  const native = { onMessage: event(), onDisconnect: event(), postMessage: frame => messages.push(frame), disconnect() {} };
  const chrome = {
    runtime: {
      id: 'oljcealhccdhaddceacnokihjefloaih',
      getURL: path => `chrome-extension://oljcealhccdhaddceacnokihjefloaih/${path}`,
      connectNative: () => { connections++; return native; },
      onStartup: event(), onInstalled: event(), onMessage: event(),
    },
    permissions: { contains: async () => false, onAdded: event(), onRemoved: event() },
    tabs: { onActivated: event(), onUpdated: event(), onRemoved: event(), query: async () => [] },
    windows: { onFocusChanged: event(), getLastFocused: async () => ({ focused: false }) },
    alarms: { onAlarm: event(), create: async () => {} },
  };
  globalThis.chrome = chrome;
  globalThis.setInterval = callback => { tick = callback; return 0; };
  try {
    await import(`../browser-extension/background.js?runtime-test=${++moduleId}`);
    await flush();
    const status = () => {
      let value;
      chrome.runtime.onMessage.emit({ type: 'status' }, { id: chrome.runtime.id, url: chrome.runtime.getURL('popup.html') }, reply => { value = reply; });
      return value;
    };
    await run({ native, chrome, messages, status, connections: () => connections, tick: async () => { tick(); await flush(); } });
  } finally {
    globalThis.chrome = previousChrome;
    globalThis.setInterval = previousInterval;
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
  await backgroundScenario(async ({ native, status, tick }) => {
    native.onMessage.emit({ connected: false, config: null, error: 'desktop_io' });
    assert.match(status().message, /通信连接中断/);
    await tick();
    native.onMessage.emit({ connected: true, config: { enabled: false, revision: 0, rules: [] } });
    assert.equal(status().connected, true);
    assert.equal(status().message, '已连接本机 WorkMemo');
  });
});
