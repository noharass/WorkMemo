import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:4174';
const output = new URL('../artifacts/web-feedback/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const result = { passed: [], errors: [], motion: [] };
try {
 for (const reducedMotion of ['no-preference', 'reduce']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Asia/Shanghai', reducedMotion });
  const page = await context.newPage(); page.setDefaultTimeout(12000);
  page.on('pageerror', error => result.errors.push(error.message));
  const state = await dashboardFixture(page);
  await page.goto(base + '/dashboard#token=isolated-feedback');
  await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  const input = page.getByRole('textbox', { name: '基准日期', exact: true });
  await input.fill('2026-11-16'); await input.press('Enter');
  await page.locator('.wm-picker-dropdown:visible').waitFor({ state: 'hidden' });
  await input.click();
  const popup = page.locator('.wm-picker-dropdown:visible');
  await popup.locator('.wm-picker-header-prev-btn').click();
  const month = await popup.locator('.wm-picker-header-view').innerText();
  assert.match(month, /10月/);
  await page.waitForTimeout(4500); // More than two real polling cycles.
  assert.equal(await popup.locator('.wm-picker-header-view').innerText(), month);
  await popup.locator('.wm-picker-header-super-prev-btn').click();
  const year = await popup.locator('.wm-picker-header-view').innerText();
  await page.waitForTimeout(2400);
  assert.equal(await popup.locator('.wm-picker-header-view').innerText(), year);
  const cell = popup.locator('td.wm-picker-cell-in-view').filter({ hasText: /^10$/ }).first();
  const chosen = await cell.getAttribute('title'); await cell.click();
  assert.equal(await input.inputValue(), chosen);
  await page.getByRole('button', { name: '应用筛选', exact: true }).click();
  await page.waitForTimeout(300);
  assert.equal(await input.inputValue(), chosen);
  await page.locator('.wm-segmented-item').filter({ hasText: '自定义' }).click();
  for (const name of ['开始日期', '结束日期']) {
   const field = page.getByRole('textbox', { name, exact: true }); await field.click();
   await popup.locator('.wm-picker-header-prev-btn').click();
   const header = await popup.locator('.wm-picker-header-view').innerText();
   await page.waitForTimeout(2400);
   assert.equal(await popup.locator('.wm-picker-header-view').innerText(), header);
   await field.press('Escape'); await popup.waitFor({ state: 'hidden' });
  }
  result.passed.push(reducedMotion + ': anchor/start/end month and year survive polling; selected day applies');
  await page.reload(); await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  await page.getByText('查看趋势数据', { exact: true }).click();
  const table = page.getByRole('table', { name: '趋势数据', exact: true });
  await table.getByRole('columnheader', { name: '有效工时（小时/分钟）', exact: true }).waitFor();
  assert.match(await table.innerText(), /\d+小时\d+分钟/);
  assert.equal(await page.getByText('有效工时（秒）', { exact: true }).count(), 0);
  result.passed.push(reducedMotion + ': chart table displays hours/minutes');
  for (const edit of [false, true]) {
   await page.locator(edit ? '.dc-records tr[data-row-key="5"]' : '.dc-records tr[data-row-key="1"]').getByRole('button', { name: edit ? '补填' : '详情', exact: true }).click();
   const dialog = page.getByRole('dialog'); await dialog.waitFor();
   const effects = await page.locator('.dc-sheet-root').evaluate(el => ({
    blur: [...el.querySelectorAll('*')].map(n => getComputedStyle(n).backdropFilter).filter(v => v !== 'none'),
    frames: el.getAnimations({ subtree: true }).map(a => a.effect.getKeyframes().map(k => ({ transform: k.transform, opacity: k.opacity })))
   }));
   assert.deepEqual(effects.blur, []);
   for (const frames of effects.frames) for (const frame of frames) if (frame.transform) assert.ok(['translateY(12px)', 'none'].includes(frame.transform), frame.transform);
   result.motion.push({ reducedMotion, edit, ...effects });
   await page.waitForTimeout(400);
   await page.keyboard.press('Tab');
   assert.equal(await page.locator('.dc-sheet-root').evaluate(el => el.contains(document.activeElement)), true);
   await page.getByRole('button', { name: '关闭工作详情', exact: true }).click();
   await dialog.waitFor({ state: 'hidden' });
  }
  await page.getByRole('button', { name: '补记录', exact: true }).click();
  await page.getByRole('dialog', { name: '补记录', exact: true }).waitFor();
  await page.waitForTimeout(30);
  const names = await page.locator('.wm-modal').evaluate(el => el.getAnimations().map(a => a.animationName));
  if (reducedMotion === 'no-preference') assert.ok(names.includes('wm-overlay-in'), JSON.stringify(names));
  result.motion.push({ reducedMotion, modalAnimations: names });
  await page.waitForTimeout(350); await page.getByRole('button', { name: '取消', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.equal(state.saves, 0); assert.equal(state.manualSaves, 0);
  result.passed.push(reducedMotion + ': detail/editor/manual entry open and close, focus works, no data writes');
  await page.screenshot({ path: new URL(`overview-${reducedMotion}.png`, output).pathname.replace(/^\/(\w:)/, '$1'), fullPage: true });
  await context.close();
 }
 assert.deepEqual(result.errors, []);
} finally {
 await writeFile(new URL('results.json', output), JSON.stringify(result, null, 2));
 await browser.close();
}
console.log(JSON.stringify(result, null, 2));
