// Isolated desktop IPC: never sends commands to a real WorkMemo process or database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/titlebar/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 420, height: 260 } });
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  window.isTauri = true; window.headerCalls = [];
  const params = new URLSearchParams(location.search);
  const density = params.get('density') ?? 'compact', state = params.get('state') ?? 'normal';
  const keys = ['评测', '质检', '开发', '文档'];
  const names = Object.fromEntries(keys.map(key => [key, key]));
  if (state === 'long') names['开发'] = '这是二十个字的超长工作名称用于布局验证';
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离布局测试，不写入真实记录', start_time: Date.now() - 60000, end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: state === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'MANUAL_START', control_mode: 'MANUAL', revision: 0 };
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
  let callbackId = 0;
  window.__TAURI_INTERNALS__ = { metadata: { currentWindow: { label: 'main' }, currentWebview: { label: 'main' } }, transformCallback() { return ++callbackId; }, unregisterCallback() {}, invoke: async (command, args) => {
    window.headerCalls.push({ command, args });
    if (command === 'get_startup_status') return {enabled:false,available:false,error:null};
    if (command === 'get_layout_settings') return { density, revision: 0, sound_enabled: false, sound_theme: 'soft', font_size: params.get('large') ? 18 : 14, font_weight: 400, line_spacing: 'standard' };
    if (command === 'get_appearance') return { version: 1, theme: params.get('theme') ?? 'cream', opacity: 94 };
    if (command === 'get_presentation') return { version: 1, revision: 0, background: null, categories: Object.fromEntries(keys.map((key, i) => [key, { icon: ['checkSquare', 'safety', 'code', 'note'][i], color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][i] }])) };
    if (command === 'get_category_names') return { revision: 0, names };
    if (command === 'get_today_workload') {
      if (state === 'empty') return [];
      if (state === 'error') throw new Error('隔离读取失败');
      return [{ category: '开发', quantity: state === 'zero' ? 0 : state === 'long' ? 1e9 : 1111, pending: state === 'pending' ? 3 : 0, complete: state === 'pending' ? 0 : 1, records: 1 }];
    }
    if (command === 'get_snapshot') return { active: ['working', 'paused'].includes(state) ? record : null, recent_records: [], warning: null, pending_count: 13, monitoring: { browsing_only: true, browse_ready: true, enabled: true, native_available: true, browser_connected: true, work_page: true, idle_warning: false, message: '仅浏览 · 当前不计时', idle_warning_seconds: 300, idle_end_seconds: 420, revision: 0 } };
    if (command === 'detect_preview_data') return false;
    return null;
  } };
});
const cases = [];
async function inspect(width, density, state = 'normal', theme = 'cream', large = false) {
  await page.setViewportSize({ width, height: density === 'compact' ? 260 : 560 });
  await page.goto(`http://127.0.0.1:1420/?density=${density}&state=${state}&theme=${theme}${large ? '&large=1' : ''}`);
  await page.locator(`.desktop-frame[data-density="${density}"]`).waitFor();
  await page.getByRole('button', { name: '设置', exact: true }).waitFor();
  await page.getByRole('button', { name: '待补全 13', exact: true }).waitFor();
  await page.locator('.today-strip-track').getByText(state === 'empty' ? '今天还没有工作记录' : state === 'error' ? '工作量暂不可用' : state === 'pending' ? '待补填' : state === 'zero' ? '开发 0' : state === 'long' ? '1,000,000,000' : '1,111').first().waitFor();
  assert.equal(await page.locator('.main-nav button').count(), 1);
  const geometry = await page.locator('.titlebar-main').evaluate(el => {
    const box = node => { const r = node.getBoundingClientRect(); return { x: r.x, right: r.right, y: r.y, bottom: r.bottom, width: r.width }; };
    return { header: box(el), items: [...el.children].map(box).sort((a,b)=>a.x-b.x), drag: box(el.querySelector('.titlebar-space')), bodyOverflow: document.documentElement.scrollWidth > innerWidth };
  });
  assert.equal(geometry.bodyOverflow, false, JSON.stringify({ width, density, state, geometry }));
  assert.ok(geometry.drag.width >= 24);
  for (let i = 0; i < geometry.items.length; i++) {
    const item = geometry.items[i];
    assert.ok(item.x >= geometry.header.x && item.right <= geometry.header.right + 1);
    assert.ok(item.y >= geometry.header.y && item.bottom <= geometry.header.bottom + 1);
    if (i) assert.ok(geometry.items[i - 1].right <= item.x + 1);
  }
  assert.equal(await page.locator('.workload-carousel').count(),0);
  assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).count(),1);
  assert.ok(await page.evaluate(() => [document.documentElement, document.body, document.getElementById('root')].every(el => getComputedStyle(el).backgroundColor === 'rgba(0, 0, 0, 0)')));
  cases.push({ width, density, state, theme, large, ...geometry });
}
try {
  for (const density of ['compact', 'comfortable']) for (const width of [360, 420, 600, 780]) await inspect(width, density);
  for (const state of ['empty', 'zero', 'pending', 'long', 'working', 'paused', 'error']) await inspect(420, 'compact', state);
  for (const theme of ['glass', 'cream', 'dark', 'neon']) {
    await inspect(420, 'compact', 'normal', theme);
    await page.screenshot({ path: fileURLToPath(new URL(`compact-${theme}.png`, output)) });
  }
  await inspect(360, 'comfortable', 'long', 'cream', true);
  await inspect(420, 'compact');
  await page.getByRole('button', { name: '设置', exact: true }).click();
  let calls = await page.evaluate(() => window.headerCalls);
  assert.deepEqual(calls.filter(c => c.command === 'open_panel').at(-1).args, { panel: 'settings', section: 'monitor' });
  assert.equal(calls.some(c => c.command === 'plugin:window|start_dragging'), false, 'settings must not drag');
  await page.getByRole('button', { name: '打开当天工作量详情' }).click();
  calls = await page.evaluate(() => window.headerCalls);
  assert.equal(calls.filter(c => c.command === 'open_dashboard').at(-1).args.view, 'today');
  await page.locator('.titlebar-space').click();
  calls = await page.evaluate(() => window.headerCalls);
  assert.equal(calls.filter(c => c.command === 'plugin:window|start_dragging').length, 1);
  await page.getByRole('button', { name: '最小化窗口' }).click();
  await page.getByRole('button', { name: '关闭到后台' }).click();
  calls = await page.evaluate(() => window.headerCalls);
  assert.equal(calls.filter(c => c.command === 'plugin:window|minimize').length, 1);
  assert.equal(calls.filter(c => c.command === 'plugin:window|close').length, 1);
  assert.equal(calls.some(c => ['start_task', 'finish_task', 'pause_task', 'resume_task', 'settle_record'].includes(c.command)), false);
  await page.screenshot({ path: fileURLToPath(new URL('compact-420.png', output)) });
  await inspect(780, 'comfortable');
  await page.screenshot({ path: fileURLToPath(new URL('comfortable-780.png', output)) });
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, oneSettingsEntry: true, settingsAndDashboard: true, dragAndControls: true, cases, errors }, null, 2));
  console.log(`Titlebar: ${cases.length} isolated layouts, settings/drag/workload/window controls passed.`);
} catch (error) {
  await page.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  throw error;
} finally { await browser.close(); }
