// Isolated HTTP fixtures; no live task, real database or browser registration is touched.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture, fixtureDate } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:1420';
const output = new URL('../artifacts/0.2.7/qa/web/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], results = [];
let page;
async function setup(width = 1440) {
  await page?.close();
  page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId: 'Asia/Shanghai' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  return dashboardFixture(page);
}
const sheet = () => page.locator('.dc-sheet-root .wm-drawer-section');
const list = () => page.getByRole('region', { name: '待补填记录列表' });
const quantity = () => page.getByRole('textbox', { name: '工作量', exact: true });
async function goto() {
  await page.goto(`${base}/dashboard#token=isolated-v027`);
  await page.locator('.dc-category-report').getByText('128.5', { exact: true }).waitFor();
}
async function open(count = 2) {
  await page.getByRole('button', { name: `代码开发待补填${count}条`, exact: true }).click();
  await list().waitFor();
  await page.getByRole('button', { name: '补填记录7', exact: true }).waitFor();
  await page.waitForTimeout(300);
}
async function choose(id) {
  await page.getByRole('button', { name: `补填记录${id}`, exact: true }).click();
  await page.locator('#dc-editor').waitFor();
  await page.waitForFunction(() => document.activeElement?.id === 'dc-quantity');
}
async function test(name, action) { await action(); results.push(name); }
try {
  await test('choose an arbitrary record before editing; failures preserve fields; zero saves once and returns to scoped list', async () => {
    const state = await setup(); await goto(); await open();
    assert.equal(state.details, 0); assert.equal(await page.locator('#dc-editor').count(), 0);
    const request = state.requests.filter(r => r.endpoint === 'query' && r.body.status === 'pending').at(-1).body;
    assert.equal(request.anchor_date, fixtureDate); assert.equal(request.category, '开发'); assert.equal(request.scope, 'real');
    await choose(8);
    assert.equal(await sheet().locator('.dc-eyebrow').innerText(), 'WORK RECORD #8');
    assert.equal(await page.getByRole('button', { name: '保存并下一条', exact: true }).count(), 0);
    await page.getByRole('button', { name: '保存工作量', exact: true }).click();
    assert.equal(state.saves, 0);
    await quantity().fill('0');
    state.saveFailure = 409;
    await page.getByRole('button', { name: '保存工作量', exact: true }).click();
    await sheet().getByRole('alert').filter({ hasText: '记录已被其他窗口修改' }).waitFor();
    assert.equal(await quantity().inputValue(), '0');
    state.saveFailure = null; state.saveDelay = 150;
    await page.getByRole('button', { name: '保存工作量', exact: true }).evaluate(button => { button.click(); button.click(); });
    await list().waitFor(); await list().getByText('工作量已保存，请选择下一条记录。', { exact: true }).waitFor();
    assert.equal(state.saves, 2); assert.equal(state.records.find(r => r.id === 8).quantity, 0);
    assert.equal(state.records.find(r => r.id === 7).settlement_status, 'PENDING');
    assert.equal(await page.locator('#dc-editor').count(), 0);
    await page.waitForFunction(() => document.activeElement?.dataset.pendingId === '7');
    await page.screenshot({ path: fileURLToPath(new URL('saved-list.png', output)) });
  });
  await test('dirty return and close guard preserve input; single and empty lists still require explicit selection', async () => {
    const state = await setup(390); state.records = state.records.filter(r => r.id !== 8);
    await goto(); await open(1); assert.equal(state.details, 0);
    await choose(7); await quantity().fill('12');
    await page.getByRole('button', { name: '返回列表', exact: true }).click();
    const guard = page.getByRole('dialog', { name: '保留未保存的修改？' });
    await guard.getByRole('button', { name: '继续编辑', exact: true }).click();
    assert.equal(await quantity().inputValue(), '12');
    await page.getByRole('button', { name: '返回列表', exact: true }).click();
    await guard.getByRole('button', { name: '放弃修改', exact: true }).click();
    await list().waitFor(); assert.equal(state.saves, 0);
    state.records.find(r => r.id === 7).settlement_status = 'COMPLETE';
    await page.getByRole('button', { name: '刷新待补填列表', exact: true }).click();
    await list().getByText('当前分类在这个范围已没有待补填记录。', { exact: true }).waitFor();
    const box = await sheet().boundingBox();
    assert.ok(Math.abs(box.x + box.width / 2 - 195) < 2);
    await page.screenshot({ path: fileURLToPath(new URL('empty-mobile.png', output)) });
  });
  await test('51+ pending records are selectable across pages; original period/category/scope remain fixed', async () => {
    const state = await setup();
    const seed = state.records.find(r => r.id === 7);
    state.records.push(...Array.from({ length: 51 }, (_, i) => ({ ...seed, id: 1000 + i, remark: `隔离待补填 ${i}` })));
    state.records.push({ ...seed, id: 2000, start_time: Date.parse('2026-01-01T09:00:00+08:00') });
    await goto(); await open(53);
    await list().getByTitle('2', { exact: true }).click();
    await page.getByRole('button', { name: '补填记录1050', exact: true }).waitFor();
    await choose(1050); await quantity().fill('1');
    await page.getByRole('button', { name: '保存工作量', exact: true }).click(); await list().waitFor();
    assert.equal(state.records.find(r => r.id === 1050).settlement_status, 'COMPLETE');
    assert.equal(state.records.find(r => r.id === 2000).settlement_status, 'PENDING');
    const scoped = state.requests.filter(r => r.endpoint === 'query' && r.body.status === 'pending');
    assert.ok(scoped.some(r => r.body.page === 2));
    assert.ok(scoped.every(r => r.body.category === '开发' && r.body.scope === 'real' && r.body.anchor_date === fixtureDate));
    assert.equal(state.active.id, 99);
  });
  await test('commit followed by failed refresh stays saved; retry only reads and cannot resubmit', async () => {
    const state = await setup(); await goto(); await open(); await choose(7); await quantity().fill('3');
    state.queryFailure = true;
    await page.getByRole('button', { name: '保存工作量', exact: true }).click();
    await list().getByRole('alert').filter({ hasText: '已保存，列表刷新失败' }).waitFor();
    assert.equal(state.saves, 1); assert.equal(await page.locator('#dc-editor').count(), 0);
    state.queryFailure = false;
    await page.getByRole('button', { name: '刷新待补填列表', exact: true }).click();
    await page.getByRole('button', { name: '补填记录8', exact: true }).waitFor();
    assert.equal(state.saves, 1);
  });
  await test('changed and removed rows never select a replacement; initial read failure has an explicit retry', async () => {
    const state = await setup(); await goto();
    state.queryFailure = true;
    await page.getByRole('button', { name: '代码开发待补填2条', exact: true }).click();
    await list().getByRole('alert').waitFor(); assert.equal(state.details, 0);
    state.queryFailure = false;
    await page.getByRole('button', { name: '刷新待补填列表', exact: true }).click();
    await page.getByRole('button', { name: '补填记录7', exact: true }).waitFor();
    state.records.find(r => r.id === 7).category = '文档';
    await page.getByRole('button', { name: '补填记录7', exact: true }).click();
    await list().getByText('这条记录已变化，请重新选择。', { exact: true }).waitFor();
    assert.equal(await page.locator('#dc-editor').count(), 0);
    state.records = state.records.filter(r => r.id !== 8);
    await page.getByRole('button', { name: '补填记录8', exact: true }).click();
    await list().getByRole('alert').waitFor(); assert.equal(state.saves, 0);
  });
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, results, errors }, null, 2));
  console.log(`v0.2.7 pending selection: ${results.length} scenarios passed.`);
} catch (error) {
  await page?.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  await writeFile(new URL('failure.json', output), JSON.stringify({ results, errors, message: String(error), html: await page?.content() }, null, 2));
  throw error;
} finally { await browser.close(); }
