// Local browser fixtures only; no task data, registration or user settings are changed.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
import { desktopFixture } from './desktop-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:1420';
const desktopBase = process.env.WORKMEMO_UI_URL || base + '/';
const output = new URL('../artifacts/0.2.7/qa/feedback/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [], warnings = [];
let page;
async function setup(width = 1440, desktop = false) {
  await page?.close();
  page = await browser.newPage({ viewport: { width, height: 900 }, timezoneId: 'Asia/Shanghai' });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('status of 500')) warnings.push(message.text()); });
  if (desktop) { await desktopFixture(page); return null; }
  return dashboardFixture(page);
}
async function goto() {
  await page.goto(`${base}/dashboard#token=isolated-feedback`);
  await page.locator('.dc-category-report').getByText('128.5', { exact: true }).waitFor();
}
const hints = () => page.locator('.dc-nav-tooltip:visible');
async function expand() {
  await page.getByRole('button', { name: '辅助分析', exact: true }).click();
  await page.getByRole('list', { name: '工时占比明细' }).waitFor();
  await page.waitForTimeout(350);
  await settledCharts();
}
async function settledCharts() {
  await page.locator('.dc-auxiliary-grid').evaluate(root => new Promise((resolve, reject) => {
    const start = performance.now(); let previous = '', stable = 0;
    function sample() {
      const current = [...root.querySelectorAll('canvas')].map(canvas => canvas.toDataURL()).join('|');
      stable = previous === current ? stable + 1 : 0; previous = current;
      if (stable >= 4 && performance.now() - start >= 350) return resolve(true);
      if (performance.now() - start > 5000) return reject(Error('Analysis charts did not settle'));
      requestAnimationFrame(sample);
    }
    sample();
  }));
}
async function test(name, fn) { await fn(); results.push(name); }
try {
  await test('navigation hints close before scrolling, stay hidden until leave, and keyboard navigation remains usable', async () => {
    await setup(); await goto();
    await page.evaluate(() => {
      window.navTrace = [];
      for (const type of ['focusin', 'focusout', 'keydown']) document.addEventListener(type, event => window.navTrace.push({ type, key: event.key, text: event.target.textContent?.slice(0, 30) }), true);
      const scroll = window.scrollTo.bind(window);
      window.scrollTo = (...args) => { window.navTrace.push({ scrollTo: args }); return scroll(...args); };
    });
    const nav = page.locator('.dc-sidebar .wm-menu');
    const records = page.getByRole('menuitem', { name: '工作明细', exact: true });
    const overview = page.getByRole('menuitem', { name: '工作总览', exact: true });
    assert.equal(await records.getAttribute('title'), null);
    assert.equal(await overview.getAttribute('title'), null);
    await records.hover(); await hints().getByText('工作明细', { exact: true }).waitFor();
    const initial = await nav.boundingBox();
    await records.click();
    await hints().waitFor({ state: 'hidden' });
    await page.waitForTimeout(350);
    for (let i = 0; i < 10; i++) {
      assert.equal(await hints().count(), 0);
      assert.deepEqual(await nav.boundingBox(), initial);
      await page.waitForTimeout(60);
    }
    assert.ok(await page.evaluate(() => scrollY) > 300);
    await page.mouse.move(400, 120); await overview.hover();
    await hints().getByText('工作总览', { exact: true }).waitFor();
    await overview.click(); await hints().waitFor({ state: 'hidden' });
    await page.waitForFunction(() => Math.abs(scrollY) < 1);
    await page.mouse.move(400, 120);
    await overview.focus(); await page.keyboard.press('ArrowDown');
    await page.waitForFunction(() => document.activeElement?.textContent === '工作明细');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => scrollY > 300);
    assert.equal(await records.evaluate(el => document.activeElement === el), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(50);
    // The theme provider updates on a system motion-preference change. Enter
    // the menu again before testing its keyboard operation in the new mode.
    await records.focus(); await page.keyboard.press('Home');
    await page.waitForFunction(() => document.activeElement?.textContent === '工作总览');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => Math.abs(scrollY) < 1);
    await page.mouse.move(400, 120); await records.hover();
    await hints().getByText('工作明细', { exact: true }).waitFor();
    const fixedHint = await hints().boundingBox();
    // Keep the pointer over the fixed icon while the document scrolls.
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'instant' }));
    await page.waitForFunction(() => scrollY > 100);
    const scrolledHint = await hints().boundingBox();
    assert.ok(Math.abs(fixedHint.x - scrolledHint.x) < 1 && Math.abs(fixedHint.y - scrolledHint.y) < 1);
    await page.mouse.move(400, 160); await page.mouse.wheel(0, 400);
    await hints().waitFor({ state: 'hidden' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await records.click(); await overview.click();
    await page.waitForFunction(() => Math.abs(scrollY) < 1);
    assert.equal(await hints().count(), 0);
    await page.screenshot({ path: fileURLToPath(new URL('navigation.png', output)) });
  });
  await test('pie uses ended/pending hours and category colors, and slice click applies a category filter', async () => {
    const state = await setup(); await goto(); await expand();
    const legend = page.getByRole('list', { name: '工时占比明细' });
    assert.equal(await legend.getByRole('button').count(), 3);
    await legend.getByRole('button', { name: /评测：02:40:00，62.75%/ }).waitFor();
    await legend.getByRole('button', { name: /代码开发：01:15:00，29.41%/ }).waitFor();
    assert.equal(await legend.locator('i').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(59, 130, 246)');
    const pie = page.getByRole('img', { name: '按类别汇总的工时占比' });
    const box = await pie.boundingBox();
    await pie.click({ position: { x: box.width / 2 + 35, y: box.height / 2 } });
    await page.waitForFunction(() => document.querySelector('.dc-pie-legend')?.textContent.includes('100%'));
    assert.equal(state.currentQuery.category, '评测');
    assert.equal(await legend.getByRole('button').count(), 1);
    await page.screenshot({ path: fileURLToPath(new URL('pie-filter.png', output)) });
  });
  await test('zero and empty hours do not produce slices; tiny hours and long renamed categories stay selectable', async () => {
    const state = await setup();
    for (const row of state.records) row.duration_ms = 0;
    await goto(); await page.getByRole('button', { name: '辅助分析', exact: true }).click();
    await page.getByText('暂无有效工时', { exact: true }).waitFor();
    assert.equal(await page.getByRole('img', { name: '按类别汇总的工时占比' }).count(), 0);
    state.records = [];
    await page.reload(); await page.getByRole('button', { name: '辅助分析', exact: true }).click();
    await page.getByText('暂无有效工时', { exact: true }).waitFor();
    const next = await setup();
    next.names.names['开发'] = '很长的开发类别名称，用于检查图例溢出与类别筛选';
    next.presentation.categories['开发'].color = '#aa22cc';
    for (const row of next.records) row.duration_ms = row.category === '开发' ? 1 : 999999;
    await goto(); await expand();
    const tiny = page.getByRole('list', { name: '工时占比明细' }).getByRole('button', { name: /很长的开发类别名称.*不足 0.01%/ });
    await tiny.waitFor(); await tiny.click();
    await page.waitForFunction(() => document.querySelector('.dc-pie-legend')?.textContent.includes('100%'));
    assert.equal(next.currentQuery.category, '开发');
  });
  await test('analysis layouts use three/two/one columns and the calendar spans medium widths', async () => {
    await setup(); await goto(); await expand();
    for (const [width, columns] of [[1440, 3], [1200, 3], [1000, 2], [760, 2], [640, 1], [390, 1]]) {
      await page.setViewportSize({ width, height: 900 }); await page.waitForTimeout(250);
      const grid = await page.locator('.dc-auxiliary-grid').evaluate(el => ({
        columns: getComputedStyle(el).gridTemplateColumns.split(' ').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        boxes: [...el.children].map(node => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width }; }),
      }));
      assert.equal(grid.columns, columns); assert.equal(grid.overflow, false);
      if (columns === 2) assert.ok(grid.boxes[2].width > grid.boxes[0].width * 1.9);
      if (columns === 3) assert.ok(grid.boxes.every(box => Math.abs(box.y - grid.boxes[0].y) < 1));
      await settledCharts();
      await page.locator('.dc-auxiliary').screenshot({ path: fileURLToPath(new URL(`analysis-${width}.png`, output)) });
    }
  });
  await test('desktop keeps one monitoring explanation, rounded strips and visible failure/recovery states', async () => {
    await setup(780, true);
    await page.goto(`${desktopBase}?state=empty&background=1`);
    const status = page.getByRole('region', { name: '监测状态' }); await status.waitFor();
    const details = status.locator('details');
    assert.equal(await details.getAttribute('open'), null);
    assert.equal(await status.locator('.hint').count(), 0);
    assert.equal(await page.locator('.monitor-caption').count(), 0);
    await details.locator('summary').click();
    await details.getByText('已识别工作页面，等待新的鼠标或键盘活动', { exact: true }).waitFor();
    await details.locator('summary').click();
    for (const selector of ['.home-footer', '.today-strip']) {
      const metrics = await page.locator(selector).evaluate(el => ({ radius: parseFloat(getComputedStyle(el).borderTopLeftRadius), padding: parseFloat(getComputedStyle(el).paddingLeft) }));
      assert.ok(metrics.radius >= 6 && metrics.padding >= 7, JSON.stringify(metrics));
    }
    await page.waitForFunction(() => window.qa.calls.some(call => call.command === 'fit_main_content'));
    const naturalHeight = await page.evaluate(() => window.qa.calls.filter(call => call.command === 'fit_main_content').at(-1).args.height);
    await page.setViewportSize({ width: 780, height: Math.max(280, naturalHeight) });
    await page.waitForTimeout(150);
    await page.screenshot({ path: fileURLToPath(new URL('desktop-rounded.png', output)) });
    await page.evaluate(() => window.qa.fail = 'get_snapshot');
    await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).waitFor();
    await page.evaluate(() => { window.qa.fail = ''; window.qa.active = { ...window.qa.record, recovery_pending: true, is_paused: true }; });
    await page.getByRole('status').filter({ hasText: '上次未结束的任务保持暂停' }).waitFor();
    await page.goto(`${desktopBase}?panel=settings&section=monitor`);
    const help = page.locator('details').filter({ has: page.locator('summary', { hasText: '网址匹配说明' }) }).last();
    await help.locator('summary').click();
    await help.getByText(/路径前缀限定站点与路径边界/).waitFor();
    await page.getByText('保存会暂停当前自动记录；返回工作页操作后恢复。', { exact: true }).waitFor();
  });
  assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ base, isolated: true, native: false, results, errors, warnings }, null, 2));
  console.log(`v0.2.7 feedback: ${results.length} groups passed.`);
} catch (error) {
  await page?.screenshot({ path: fileURLToPath(new URL('failure.png', output)) });
  await writeFile(new URL('failure.json', output), JSON.stringify({ results, errors, warnings, message: String(error), scrollY: await page?.evaluate(() => scrollY), navTrace: await page?.evaluate(() => window.navTrace), html: await page?.content() }, null, 2));
  throw error;
} finally { await browser.close(); }
