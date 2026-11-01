// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.6/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 780, height: 680 } });
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  const params = new URLSearchParams(location.search), categories = ['评测', '质检', '开发', '文档'];
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离任务', start_time: Date.now() - 60000, end_time: null, confirmed_end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: params.get('state') === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'AUTO', control_mode: 'AUTO', revision: 1 };
  const ended = { ...record, id: 6, category: '文档', status: 'FINISHED', is_paused: true, settlement_status: 'PENDING', end_time: Date.now(), confirmed_end_time: Date.now() };
  const config = { enabled: true, revision: 3, times: { idle_pause_seconds: 120, away_pause_seconds: 120, hold_seconds: 600, idle_warning_seconds: 300, idle_end_seconds: 420 }, poll_interval_seconds: 1, auto_resume_manual: true, rules: [{ id: 1, category: '开发', match_mode: 'origin', url_prefix: 'https://work.example.test/' }] };
  const callbacks = new Map(), listeners = new Map(); let sequence = 0;
  const emit = (event, payload) => { for (const [id, entry] of listeners) if (entry.event === event) callbacks.get(entry.handler)?.({ event, id, payload }); };
  window.qa = { calls: [], active: params.get('state') === 'empty' ? null : record, candidate: params.has('candidate') ? { id: 21, rule_id: 1, category: '开发' } : null, notice: params.has('ended') ? { kind: 'ended', record: ended, idle_warning_seconds: 300, idle_end_seconds: 420 } : null, config, browse: false, fail: '', delay: 0, readsDelay: 100, emit, record };
  window.isTauri = true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: id => listeners.delete(id) };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: params.has('notice') ? 'notice' : params.has('panel') ? 'settings' : 'main' }, currentWebview: { label: 'fixture' } },
    transformCallback(fn) { const id = ++sequence; callbacks.set(id, fn); return id; }, unregisterCallback(id) { callbacks.delete(id); },
    convertFileSrc() { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700"><path fill="#8fa9bb" d="M0 0h800v700H0z"/><path fill="#b9ad96" d="m0 0 800 700H0z"/></svg>'); },
    async invoke(command, args = {}) {
      const q = window.qa; q.calls.push({ command, args });
      const snapshot = () => structuredClone({ active: q.active, recent_records: q.notice ? [q.notice.record] : [], pending_count: q.notice ? 1 : 0, warning: null, monitoring: { browsing_only: q.browse, browse_ready: true, browse_category: '开发', enabled: true, native_available: true, browser_connected: true, work_page: true, message: '已识别工作页面，等待新的鼠标或键盘活动', idle_warning: false, idle_warning_seconds: 300, idle_end_seconds: 420, start_candidate: q.candidate } });
      if (command.startsWith('plugin:event|')) {
        if (command.endsWith('|listen')) { const id = ++sequence; listeners.set(id, args); return id; }
        if (command.endsWith('|unlisten')) listeners.delete(args.eventId);
        if (command.endsWith('|emit')) emit(args.event, args.payload);
        return null;
      }
      if (command === q.fail) { await new Promise(r => setTimeout(r, q.delay || 120)); throw Error('隔离保存失败，请重试'); }
      if (command === 'get_snapshot') return snapshot();
      if (command === 'get_notice') return structuredClone(q.notice);
      if (command === 'get_appearance') return { version: 1, theme: params.get('theme') || 'cream', opacity: 88 };
      if (command === 'get_category_names') return { revision: 0, names: Object.fromEntries(categories.map(c => [c, c])) };
      if (command === 'get_layout_settings') return { density: params.get('density') || 'comfortable', revision: 0, sound_enabled: false, sound_theme: 'soft', font_size: params.has('large') ? 18 : 14, font_weight: 400, line_spacing: 'standard' };
      if (command === 'get_presentation') return { version: 1, revision: 0, background: params.has('background') ? { file: 'isolated-background.svg', opacity: 50 } : null, categories: Object.fromEntries(categories.map((c, i) => [c, { icon: ['checkSquare', 'safety', 'code', 'note'][i], color: '#447cba' }])) };
      if (command === 'get_monitor_config') { const value = structuredClone(q.config); await new Promise(r => setTimeout(r, q.readsDelay)); return value; }
      if (command === 'get_connection_status') return { state: 'ready', message: '隔离连接', version: 'fixture', identifier: 'fixture', host_name: 'fixture' };
      if (command === 'save_monitor_config') { await new Promise(r => setTimeout(r, q.delay)); q.config = { ...args.input, revision: q.config.revision + 1, rules: args.input.rules.map((r, i) => ({ ...r, id: i + 1 })) }; return structuredClone(q.config); }
      if (command === 'get_today_workload') return [];
      if (command === 'detect_preview_data') return false;
      if (command === 'get_startup_status') return { enabled: false, available: true, error: null };
      if (command === 'pause_task') { q.active = { ...q.active, is_paused: true, pause_reason: 'MANUAL' }; return snapshot(); }
      if (command === 'resume_task') { q.active = { ...q.active, is_paused: false, pause_reason: null }; return snapshot(); }
      if (command === 'finish_task') { q.notice = { kind: 'ended', record: { ...q.active, status: 'FINISHED', end_time: Date.now(), settlement_status: 'PENDING' } }; q.active = null; return snapshot(); }
      if (command === 'confirm_work') {
        await new Promise(r => setTimeout(r, q.delay));
        if (q.active || !q.candidate || q.candidate.id !== args.candidateId) throw Error('开工提示已失效');
        q.active = { ...record, id: 8, category: q.candidate.category, duration_ms: 0, duration_seconds: 0, is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'enter_browsing') { q.browse = true; q.candidate = null; return snapshot(); }
      if (command === 'start_task') {
        if ((q.active?.id ?? null) !== args.expectedActiveId || (q.active && !q.active.is_paused)) throw Error('当前任务已变化，请刷新后重新确认');
        q.active = { ...record, ...args.input, id: 9, control_mode: 'MANUAL', is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'settle_record') { await new Promise(r => setTimeout(r, q.delay)); if (q.notice?.record.id !== args.input.id || q.notice.record.revision !== args.input.expected_revision) throw Error('记录已变化'); q.notice = null; return snapshot(); }
      if (command === 'defer_notice') { if (q.notice?.record.id === args.id) q.notice = null; return null; }
      if (command === 'get_island_viewport') return innerHeight;
      return null;
    },
  };
});
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1420/';
async function load(params = {}, width = 780, height = 680) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(220);
}
async function test(name, fn) {
  const filter = process.argv.find(arg => arg.startsWith('--filter='))?.slice(9);
  if (filter && !name.includes(filter)) return;
  await fn(); results.push(name);
}
async function screenshot(name) { await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)) }); }
try {
  if (process.argv.includes('--baseline')) {
    await load({ panel: 'settings', section: 'monitor', background: '1' });
    await page.getByLabel('工作 URL', { exact: true }).fill('https://changed.example.test/');
    await page.evaluate(() => {
      window.qa.removedForms = 0;
      const form = document.querySelector('#monitor-form');
      new MutationObserver(() => { if (!form.isConnected) window.qa.removedForms++; }).observe(document.querySelector('.panel-app'), { childList: true, subtree: true });
    });
    await page.getByRole('button', { name: '保存监测配置', exact: true }).click();
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => ({ reads: window.qa.calls.filter(c => c.command === 'get_monitor_config').length, writes: window.qa.calls.filter(c => c.command === 'save_monitor_config').length, detachedObservations: window.qa.removedForms }));
    await load({ state: 'empty', notice: '1', ended: '1', candidate: '1' });
    metrics.visibleCandidate = await page.getByRole('region', { name: '开工确认' }).isVisible();
    metrics.endedShown = await page.getByRole('region', { name: '工作结束提醒' }).isVisible();
    await screenshot('baseline-island-priority');
    await writeFile(new URL('baseline.json', output), JSON.stringify(metrics, null, 2));
    console.log(JSON.stringify(metrics));
  } else {
    await test('idle monitoring, explicit new form, retained draft and authoritative cross-window guard', async () => {
      await load({ state: 'empty' });
      await page.getByRole('region', { name: '监测状态' }).waitFor();
      assert.equal(await page.locator('.work-form').count(), 0);
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('文档');
      await page.getByLabel('工作量（可稍后填写）').fill('0');
      await page.getByLabel('备注（选填）').fill('手动草稿');
      await page.evaluate(() => { window.qa.candidate = { id: 21, rule_id: 1, category: '开发' }; });
      await page.getByText(/已识别开发工作页面；也可在灵动岛确认开始/).waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '手动草稿');
      await page.evaluate(() => window.qa.fail = 'start_task');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).waitFor();
      assert.equal(await page.getByLabel('工作量（可稍后填写）').inputValue(), '0');
      await page.getByRole('button', { name: '返回监测状态', exact: true }).click();
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '手动草稿');
      await page.evaluate(() => { window.qa.fail = ''; window.qa.active = { ...window.qa.record, id: 99 }; window.qa.candidate = null; });
      await page.getByText(/已有任务从其他入口开始/).waitFor();
      assert.equal(await page.getByRole('button', { name: '开始工作', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: '返回监测状态', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      await screenshot('main-current-task');
    });
    await test('manual begin, finish returns to monitoring, pause and atomic switch', async () => {
      await load({ state: 'empty' });
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('文档');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      assert.equal(await page.getByRole('button', { name: '切换任务', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: '暂停', exact: true }).click();
      await page.getByRole('button', { name: '切换任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('评测');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('button', { name: '保存并开始', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'start_task').at(-1).args.expectedActiveId), 9);
      await page.getByRole('button', { name: '结束', exact: true }).click();
      await page.getByRole('region', { name: '监测状态' }).waitFor();
      assert.equal(await page.locator('.work-form').count(), 0);
      await screenshot('main-monitoring');
    });
    await test('next candidate supersedes old reminder, double confirmation creates once and old pending stays accessible', async () => {
      await load({ state: 'empty', notice: '1', ended: '1', candidate: '1' }, 320, 420);
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      assert.equal(await page.getByRole('region', { name: '工作结束提醒' }).count(), 0);
      assert.equal(await page.getByRole('button', { name: '待补全 1', exact: true }).isVisible(), true);
      await screenshot('island-next-candidate');
      await page.evaluate(() => window.qa.delay = 250);
      await page.getByRole('button', { name: '开始记录', exact: true }).evaluate(el => { el.click(); el.click(); });
      await page.waitForFunction(() => window.qa.active?.id === 8);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'confirm_work').length), 1);
      assert.equal(await page.evaluate(() => window.qa.notice.record.id), 6);
      assert.equal(await page.locator('.island-main-row').getByText('开发', { exact: true }).isVisible(), true);
      await page.getByRole('button', { name: '展开工作提醒', exact: true }).click();
      await page.getByRole('button', { name: '待补全 1', exact: true }).waitFor();
      assert.equal(await page.getByRole('region', { name: '工作结束提醒' }).count(), 0);
    });
    await test('settlement draft survives next candidate and new active work, failed save preserves original record', async () => {
      await load({ state: 'empty', notice: '1', ended: '1' }, 320, 420);
      await page.getByRole('button', { name: '填写工作量', exact: true }).click();
      await page.getByLabel('工作量（必填）', { exact: true }).fill('12');
      await page.getByLabel('备注（选填）').fill('旧任务结算草稿');
      await page.evaluate(() => { window.qa.candidate = { id: 21, rule_id: 1, category: '开发' }; });
      await page.getByRole('button', { name: '开始识别的工作', exact: true }).waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '旧任务结算草稿');
      await page.getByRole('button', { name: '开始识别的工作', exact: true }).click();
      await page.waitForFunction(() => window.qa.active?.id === 8);
      assert.equal(await page.getByLabel('工作量（必填）', { exact: true }).inputValue(), '12');
      await page.evaluate(() => window.qa.fail = 'settle_record');
      await page.getByRole('button', { name: '填写工作量并保存', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).first().waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '旧任务结算草稿');
      await screenshot('island-pinned-settlement');
      await page.evaluate(() => window.qa.fail = '');
      await page.getByRole('button', { name: '填写工作量并保存', exact: true }).click();
      await page.waitForFunction(() => window.qa.notice === null);
      const input = await page.evaluate(() => window.qa.calls.filter(c => c.command === 'settle_record').at(-1).args.input);
      assert.equal(input.id, 6); assert.equal(input.quantity, 12);
      assert.equal(await page.evaluate(() => window.qa.active.id), 8);
    });
    await test('stale candidate fails visibly, browsing creates no work', async () => {
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('button', { name: '开始记录', exact: true }).waitFor();
      await page.evaluate(() => window.qa.candidate = null);
      await page.getByRole('button', { name: '开始记录', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '开工提示已失效' }).waitFor();
      assert.equal(await page.evaluate(() => window.qa.active), null);
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('button', { name: '仅浏览', exact: true }).click();
      await page.waitForFunction(() => window.qa.browse);
      assert.equal(await page.evaluate(() => window.qa.active), null);
      assert.equal(await page.evaluate(() => window.qa.calls.some(c => c.command === 'confirm_work')), false);
    });
    await test('direct settings save keeps form, scroll, background and focus; external refresh preserves new edits', async () => {
      await load({ panel: 'settings', section: 'monitor', background: '1' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://changed.example.test/');
      await page.evaluate(() => {
        window.qa.form = document.querySelector('#monitor-form'); window.qa.background = document.querySelector('.window-background');
        window.qa.initialReads = window.qa.calls.filter(c => c.command === 'get_monitor_config').length;
        window.qa.delay = 180;
        window.qa.focusStart = document.activeElement?.outerHTML;
        window.qa.focusEvents = [];
        for (const event of ['focusin', 'focusout']) document.addEventListener(event, e => window.qa.focusEvents.push({ event, element: e.target.outerHTML?.slice(0, 200) }));
        document.querySelector('.panel-scroll').scrollTop = 260;
      });
      await page.keyboard.press('Control+s');
      await page.locator('#monitor-form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
      await page.getByText('配置已保存。请在 Chrome 扩展中同步工作站点授权。', { exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement?.getAttribute('type') === 'url');
      const metrics = await page.evaluate(() => ({ sameForm: window.qa.form === document.querySelector('#monitor-form'), sameBackground: window.qa.background === document.querySelector('.window-background'), reads: window.qa.calls.filter(c => c.command === 'get_monitor_config').length, initialReads: window.qa.initialReads, writes: window.qa.calls.filter(c => c.command === 'save_monitor_config').length, focus: document.activeElement?.getAttribute('type') }));
      assert.equal(metrics.sameForm, true); assert.equal(metrics.sameBackground, true); assert.equal(metrics.reads, metrics.initialReads); assert.equal(metrics.writes, 1); assert.equal(metrics.focus, 'url');
      await page.keyboard.press('Control+s');
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'save_monitor_config').length), 1);
      await writeFile(new URL('settings-after.json', output), JSON.stringify(metrics, null, 2));
      await page.evaluate(() => { window.qa.readsDelay = 500; window.qa.emit('workmemo:data-changed', null); });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://draft-during-refresh.example.test/');
      await page.waitForTimeout(650);
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://draft-during-refresh.example.test/');
      assert.equal(await page.evaluate(() => window.qa.form === document.querySelector('#monitor-form')), true);
      await page.evaluate(() => window.qa.emit('workmemo:data-changed', null));
      await page.waitForTimeout(650);
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://draft-during-refresh.example.test/');
    });
    await test('slow modal save submits once, holds dialog stable, blocks Escape/close and navigates once', async () => {
      await load({ panel: 'settings', section: 'monitor', background: '1' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://slow.example.test/');
      await page.getByRole('button', { name: '布局', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: '保留未保存的修改？' });
      await dialog.waitFor();
      await page.evaluate(() => {
        window.qa.delay = 650; window.qa.dialog = document.querySelector('dialog[open]'); window.qa.form = document.querySelector('#monitor-form'); window.qa.box = window.qa.dialog.getBoundingClientRect().toJSON();
        window.qa.frames = [];
        const sample = () => {
          if (window.qa.config.revision !== 3) return;
          const dialog = document.querySelector('dialog[open]'); const box = dialog?.getBoundingClientRect();
          window.qa.frames.push({ open: !!dialog, formConnected: window.qa.form.isConnected, x: box?.x, y: box?.y, width: box?.width, height: box?.height });
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await dialog.getByRole('button', { name: '保存并继续', exact: true }).evaluate(el => { el.click(); el.click(); });
      await page.keyboard.press('Control+s');
      await page.keyboard.press('Escape');
      await page.evaluate(() => window.qa.emit('workmemo:request-close', null));
      assert.equal(await dialog.isVisible(), true);
      assert.equal(await dialog.getByRole('button', { name: '关闭保留未保存的修改？', exact: true }).isDisabled(), true);
      const stable = await page.evaluate(() => { const box = window.qa.dialog.getBoundingClientRect(); return window.qa.dialog === document.querySelector('dialog[open]') && window.qa.form === document.querySelector('#monitor-form') && box.width === window.qa.box.width && box.x === window.qa.box.x; });
      assert.equal(stable, true);
      await screenshot('settings-saving-dialog');
      await page.waitForFunction(() => document.querySelector('.settings-tabs button[aria-pressed=true]')?.textContent === '布局');
      assert.equal(await dialog.isVisible(), false);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'save_monitor_config').length), 1);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'close_panel').length), 0);
      const frames = await page.evaluate(() => window.qa.frames);
      assert.ok(frames.length > 8);
      assert.ok(frames.every(f => f.open && f.formConnected));
      assert.equal(new Set(frames.map(f => JSON.stringify([f.x, f.y, f.width, f.height]))).size, 1);
      await writeFile(new URL('settings-modal-frames.json', output), JSON.stringify(frames, null, 2));
    });
    await test('failed modal save, continue editing, discard and native close preserve correct data', async () => {
      await load({ panel: 'settings', section: 'monitor' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://failure.example.test/');
      await page.getByRole('button', { name: '布局', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: '保留未保存的修改？' });
      await page.evaluate(() => window.qa.fail = 'save_monitor_config');
      await dialog.getByRole('button', { name: '保存并继续', exact: true }).click();
      await dialog.getByRole('alert').waitFor();
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://failure.example.test/');
      await dialog.getByRole('button', { name: '继续编辑', exact: true }).click();
      await page.evaluate(() => { window.qa.fail = ''; window.qa.emit('workmemo:request-close', null); });
      await dialog.waitFor();
      await dialog.getByRole('button', { name: '放弃修改', exact: true }).click();
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://work.example.test/');
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'close_panel').length), 1);
      assert.equal(await page.evaluate(() => window.qa.config.revision), 3);
    });
    await test('four skins, compact/comfortable main and island layouts, reduced motion and narrow widths', async () => {
      for (const theme of ['glass', 'cream', 'dark', 'neon']) for (const density of ['compact', 'comfortable']) {
        await load({ state: 'empty', theme, density, large: '1' }, 360, 560);
        await page.getByRole('region', { name: '监测状态' }).waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await screenshot(`main-idle-${theme}-${density}`);
        await load({ state: 'empty', notice: '1', ended: '1', candidate: '1', theme, density }, 320, 420);
        await page.getByRole('region', { name: '开工确认' }).waitFor();
        const row = await page.locator('.island-main-row').evaluate(el => ({ width: el.clientWidth, overflow: el.scrollWidth, boxes: [...el.children].map(n => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right }; }) }));
        assert.ok(row.overflow <= row.width + 1, JSON.stringify(row));
        assert.ok(row.boxes.every((b, i, all) => !i || b.left >= all[i - 1].right - 1), JSON.stringify(row));
        await screenshot(`island-candidate-${theme}-${density}`);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      assert.equal(await page.locator('.island-expansion').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    });
    assert.deepEqual(errors, []);
    await writeFile(new URL('v026-result.json', output), JSON.stringify({ results, errors }, null, 2));
    console.log(`${results.length} v0.2.6 isolated UI scenarios passed.`);
  }
} catch (error) {
  await screenshot('v026-failure');
  await writeFile(new URL('v026-failure.json', output), JSON.stringify({ results, errors, message: String(error), html: await page.content(), detail: await page.evaluate(() => ({ focused: document.activeElement?.outerHTML?.slice(0, 500), start: window.qa.focusStart, focusEvents: window.qa.focusEvents, calls: window.qa.calls })) }, null, 2));
  throw error;
} finally { await browser.close(); }
