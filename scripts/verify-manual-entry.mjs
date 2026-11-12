// Isolated HTTP fixtures only: never opens the desktop app or a real work database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:1422';
const output = new URL('../artifacts/manual-entry/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [];
let page;
const dialog = () => page.getByRole('dialog', { name: '补记录', exact: true });
const field = name => dialog().getByRole('textbox', { name, exact: true });
const save = () => dialog().getByRole('button', { name: '保存补录', exact: true });
async function setup(width = 1440, timezoneId = 'Asia/Shanghai') {
  await page?.close();
  page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId });
  page.setDefaultTimeout(10000);
  page.on('pageerror', e => errors.push(e.message));
  // Match the production Rust server's CSP on the built frontend.
  await page.route('**/dashboard', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'" } });
  });
  return dashboardFixture(page);
}
async function goto(extra = '') {
  await page.goto(`${base}/dashboard#token=isolated-manual-entry${extra}`);
  await page.getByRole('button', { name: '刷新连接', exact: true }).waitFor();
  await page.locator('.connection-dot.connected').first().waitFor({ state: 'attached' });
}
async function open() {
  await page.getByRole('button', { name: '补记录', exact: true }).click();
  await dialog().waitFor();
  await page.waitForTimeout(300); // Wait for Ant Design's entrance focus and motion.
}
async function dates(start = '2026-10-28 09:00', end = '2026-10-28 11:00') {
  for (const [name, value] of [['补录开始时间', start], ['补录结束时间', end]]) {
    await field(name).fill(value);
    await field(name).press('Enter');
    await page.locator('.wm-picker-dropdown:visible').waitFor({ state: 'hidden' });
    assert.equal(await field(name).inputValue(), value);
  }
}
async function shot(name) { await page.screenshot({ path: fileURLToPath(new URL(name + '.png', output)) }); }
async function test(name, action) { await action(); results.push(name); }
try {
  await test('validates input; saves Beijing times and net duration once; refreshes saved day without changing active work', async () => {
    const state = await setup(); await goto(); const active = structuredClone(state.active); await open();
    await save().click(); await dialog().getByRole('alert').waitFor(); assert.equal(state.manualSaves, 0);
    await field('补录工作量').fill('12.5'); await dates(); await field('扣除休息分钟数').fill('121');
    await save().click(); await dialog().getByRole('alert').filter({ hasText: '休息分钟数' }).waitFor();
    assert.equal(state.manualSaves, 0);
    await field('扣除休息分钟数').fill('30'); await field('补录备注').fill('  网页补录验收  ');
    await dialog().getByText('01:30:00', { exact: true }).waitFor();
    await shot('filled-desktop'); state.manualDelay = 350;
    await save().evaluate(button => { button.click(); button.click(); });
    assert.equal(await dialog().getByRole('button', { name: '取消', exact: true }).isDisabled(), true);
    await dialog().waitFor({ state: 'hidden' });
    assert.equal(state.manualSaves, 1); assert.equal(state.manualEntries.size, 1);
    const record = state.records.at(-1);
    assert.equal(record.start_time, Date.parse('2026-10-28T09:00:00+08:00'));
    assert.equal(record.end_time, Date.parse('2026-10-28T11:00:00+08:00'));
    assert.equal(record.duration_ms, 5400000); assert.equal(record.quantity, 12.5); assert.equal(record.remark, '网页补录验收');
    assert.deepEqual(state.active, active);
    await page.locator('.dc-page').getByText('人工补录', { exact: true }).waitFor();
    assert.equal(state.currentQuery.anchor_date, '2026-10-28');
    assert.equal(state.currentQuery.scope, 'real'); assert.equal(state.currentQuery.status, 'all');
    await shot('saved-record');
    await page.locator('tr').filter({ hasText: '网页补录验收' }).getByRole('button', { name: '详情', exact: true }).click();
    await page.getByRole('button', { name: '计时区间（0）', exact: true }).click();
    await page.getByText('人工补录的有效工时，没有自动计时区间。', { exact: true }).waitFor();
  });
  await test('failed saves preserve drafts; lost-response retry uses the same request and creates exactly one record', async () => {
    const state = await setup(); await goto(); await open(); await field('补录工作量').fill('0'); await dates();
    state.manualFailure = true; await save().click();
    await dialog().getByRole('alert').filter({ hasText: '隔离补录保存失败' }).waitFor();
    assert.equal(await field('补录工作量').inputValue(), '0');
    await dialog().getByRole('button', { name: '取消', exact: true }).click();
    const guard = page.getByRole('dialog', { name: '放弃这次补记录？', exact: true });
    await guard.getByRole('button', { name: '继续填写', exact: true }).click();
    await guard.waitFor({ state: 'hidden' }); await page.waitForTimeout(300);
    assert.equal(await field('补录工作量').inputValue(), '0');
    state.manualFailure = false; state.manualLoseResponse = true;
    await save().click(); await dialog().getByRole('alert').filter({ hasText: '连接已中断' }).waitFor();
    assert.equal(state.manualEntries.size, 1); await save().click(); await dialog().waitFor({ state: 'hidden' });
    const requests = state.requests.filter(r => r.endpoint === 'manual-entry');
    assert.equal(requests.length, 3); assert.deepEqual(requests[0].body, requests[1].body); assert.deepEqual(requests[1].body, requests[2].body);
    assert.equal(state.manualEntries.size, 1); assert.equal(state.records.filter(r => r.source === 'MANUAL_ENTRY').length, 1);
  });
  await test('Beijing calendar values stay fixed on a computer in New York, across a daylight-saving transition', async () => {
    const state = await setup(1440, 'America/New_York'); await goto(); await open();
    const expected = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date());
    assert.equal(await field('补录结束时间').inputValue(), expected);
    await field('补录工作量').fill('1'); await dates('2026-11-01 01:00', '2026-11-01 03:00');
    await save().click(); await dialog().waitFor({ state: 'hidden' });
    const record = state.records.at(-1);
    assert.equal(record.start_time, Date.parse('2026-11-01T01:00:00+08:00'));
    assert.equal(record.end_time, Date.parse('2026-11-01T03:00:00+08:00')); assert.equal(record.duration_ms, 7200000);
  });
  await test('360px form and date panel fit; discard asks first; a fresh draft can save zero effective time', async () => {
    const state = await setup(360); await goto(); await open(); await field('补录工作量').fill('3');
    assert.equal(await page.evaluate(() => { const event = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(event); return event.defaultPrevented; }), true);
    await field('补录开始时间').click();
    const panel = page.locator('.wm-picker-dropdown:visible'); await panel.waitFor();
    await page.waitForTimeout(300);
    const bounds = await panel.boundingBox(); assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= 361, JSON.stringify(bounds));
    assert.ok(bounds.y >= -1 && bounds.y + bounds.height <= 901, JSON.stringify(bounds));
    await shot('mobile-calendar');
    await panel.getByRole('button', { name: '确定', exact: true }).click();
    await panel.waitFor({ state: 'hidden' }); await shot('mobile-form');
    const box = await dialog().boundingBox(); assert.ok(box.x >= 0 && box.x + box.width <= 360);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await dialog().getByRole('button', { name: '取消', exact: true }).click();
    await page.getByRole('dialog', { name: '放弃这次补记录？', exact: true }).getByRole('button', { name: '放弃补录', exact: true }).click();
    await dialog().waitFor({ state: 'hidden' }); assert.equal(state.manualSaves, 0);
    await open(); assert.equal(await field('补录工作量').inputValue(), '');
    await field('补录工作量').fill('0'); await dates(); await field('扣除休息分钟数').fill('120');
    await field('扣除休息分钟数').press('Control+s'); await dialog().waitFor({ state: 'hidden' }); assert.equal(state.records.at(-1).duration_ms, 0);
  });
  await test('older backend and demonstration scope do not enable real manual writes', async () => {
    const state = await setup(); state.manualCapability = false; await goto();
    assert.equal(await page.getByRole('button', { name: '补记录', exact: true }).isDisabled(), true);
    const demo = await setup(); await goto('&scope=demo');
    assert.equal(await page.getByRole('button', { name: '补记录', exact: true }).isDisabled(), true);
    assert.equal(demo.manualSaves, 0); assert.equal(state.manualSaves, 0);
  });
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ base, passed: results, pageErrors: errors }, null, 2));
  console.log(JSON.stringify({ passed: results.length, results, pageErrors: errors }, null, 2));
} catch (error) {
  await shot('failure').catch(() => {});
  await writeFile(new URL('failure-dom.txt', output), await page.locator('body').ariaSnapshot());
  await writeFile(new URL('failure.html', output), await page.content());
  await writeFile(new URL('failure.txt', output), String(error));
  throw error;
} finally { await browser.close(); }
