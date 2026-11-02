# 0.2.7 反馈修订完整源码

下列为本轮全部变更源码和测试全文，无省略段。交付文档全文在 FILES 清单列出的原路径，不重复汇编。

## UPDATE — E:\WorkMemo\scripts\dashboard-fixture.mjs

SHA256：`ce2a725c4b19e04938f4740b14c918eca2ccec6932636136699923a6f8c3def8`

````mjs
// HTTP fixtures for browser verification only. Never connects to a WorkMemo database.
export const keys = ["评测", "质检", "开发", "文档"];
export const fixtureDate = "2026-10-29";
export async function dashboardFixture(page) {
  const names = {
    revision: 1,
    names: { 评测: "评测", 质检: "质检", 开发: "代码开发", 文档: "文档" },
  };
  const presentation = {
    version: 1,
    revision: 0,
    background: null,
    categories: Object.fromEntries(
      keys.map((key, i) => [
        key,
        {
          icon: ["checkSquare", "safety", "code", "note"][i],
          color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
        },
      ]),
    ),
  };
  const records = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    category: i < 5 ? "评测" : i === 5 ? "质检" : "开发",
    quantity: i < 4 ? [30, 40, 50, 8.5][i] : i === 5 ? 0 : null,
    remark: "隔离测试记录 · 不写入用户数据库",
    start_time: Date.parse(`${fixtureDate}T09:00:00+08:00`) + i * 1800000,
    end_time: Date.parse(`${fixtureDate}T10:00:00+08:00`) + i * 1800000,
    duration_ms: i < 5 ? 1920000 : i === 5 ? 1200000 : 2250000,
    duration_seconds: i < 5 ? 1920 : i === 5 ? 1200 : 2250,
    status: "FINISHED",
    is_paused: true,
    recovery_pending: false,
    settlement_status: i < 4 || i === 5 ? "COMPLETE" : "PENDING",
    source: "MANUAL_START",
    pause_reason: null,
    confirmed_end_time: null,
    last_input_time: null,
    end_reason: "MANUAL",
    legacy_duration_ms: 0,
    revision: 0,
    control_mode: "MANUAL",
    is_demo: false,
    demo_batch: null,
  }));
  const active = {
    ...records[0],
    id: 99,
    category: "开发",
    quantity: null,
    status: "WORKING",
    settlement_status: "IN_PROGRESS",
    end_time: null,
    is_paused: false,
    duration_ms: 25000,
    duration_seconds: 25,
  };
  const state = {
    records,
    active,
    names,
    presentation,
    saveFailure: null,
    queryFailure: false,
    detailFailure: false,
    queryDelay: 0,
    delayFor: null,
    saveDelay: 0,
    saves: 0,
    queries: 0,
    details: 0,
    deletes: 0,
    currentQuery: null,
    requests: [],
    revisions: [],
    segments: [],
    many: false,
  };
  const iso = (date) => date.toISOString().slice(0, 10);
  function range(query) {
    const anchor = query.anchor_date ?? fixtureDate;
    const date = new Date(anchor + "T12:00:00Z");
    let start = query.start_date,
      end = query.end_date;
    if (query.period === "day") start = end = anchor;
    if (query.period === "week") {
      date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
      start = iso(date);
      date.setUTCDate(date.getUTCDate() + 6);
      end = iso(date);
    }
    if (query.period === "month") {
      date.setUTCDate(1);
      start = iso(date);
      date.setUTCMonth(date.getUTCMonth() + 1);
      date.setUTCDate(0);
      end = iso(date);
    }
    return {
      period: query.period,
      anchor_date: query.period === "custom" ? null : anchor,
      start_date: start,
      end_date: end,
      trend_unit: query.period === "day" ? "hour" : "day",
    };
  }
  function aggregate(rows) {
    return {
      duration_ms: rows.reduce((n, row) => n + row.duration_ms, 0),
      quantity: rows
        .filter((row) => row.settlement_status === "COMPLETE")
        .reduce((n, row) => n + row.quantity, 0),
      records: rows.length,
      pending: rows.filter((row) => row.settlement_status === "PENDING").length,
      complete: rows.filter((row) => row.settlement_status === "COMPLETE")
        .length,
    };
  }
  function data(query) {
    const resolved = range(query);
    const extras = state.many
      ? Array.from({ length: 52 }, (_, i) => ({
          ...records[0],
          id: 200 + i,
          quantity: 1,
        }))
      : [];
    const demo = {
      ...records[0],
      id: 500,
      is_demo: true,
      demo_batch: "isolated-browser-fixture",
      quantity: 999,
    };
    const filtered = [
      ...state.records,
      ...extras,
      ...(state.active ? [state.active] : []),
      demo,
    ].filter((row) => {
      const date = iso(new Date(row.start_time + 8 * 3600000));
      return (
        (query.scope === "all" || row.is_demo === (query.scope === "demo")) &&
        (!resolved.start_date || date >= resolved.start_date) &&
        (!resolved.end_date || date <= resolved.end_date) &&
        (!query.category || row.category === query.category) &&
        (query.status === "all" ||
          (query.status === "working" && row.status !== "FINISHED") ||
          (query.status === "pending" && row.settlement_status === "PENDING") ||
          (query.status === "complete" && row.settlement_status === "COMPLETE"))
      );
    });
    const ended = filtered.filter((row) => row.status === "FINISHED");
    const categories = keys
      .filter((key) => !query.category || key === query.category)
      .map((category) => ({
        category,
        ...aggregate(ended.filter((row) => row.category === category)),
      }));
    const buckets =
      query.period === "day"
        ? Array.from(
            { length: 24 },
            (_, hour) => String(hour).padStart(2, "0") + ":00",
          )
        : query.period === "custom"
          ? [fixtureDate]
          : Array.from({ length: 32 }, (_, i) => {
              const date = new Date(resolved.start_date + "T12:00:00Z");
              date.setUTCDate(date.getUTCDate() + i);
              return iso(date);
            }).filter((date) => date <= resolved.end_date);
    const trend = buckets.map((date) => ({
      date,
      ...aggregate(
        ended.filter((row) =>
          query.period === "day"
            ? new Date(row.start_time + 8 * 3600000).getUTCHours() ===
              Number(date.slice(0, 2))
            : iso(new Date(row.start_time + 8 * 3600000)) === date,
        ),
      ),
    }));
    const pages = Math.max(1, Math.ceil(filtered.length / 50)),
      current = Math.min(query.page, pages);
    return {
      range: resolved,
      totals: aggregate(ended),
      categories,
      trend,
      monthly: false,
      calendar: ended.length
        ? [[fixtureDate, aggregate(ended).duration_ms]]
        : [],
      records: filtered.slice((current - 1) * 50, current * 50),
      record_count: filtered.length,
      page: current,
      pages,
      scope: query.scope,
    };
  }
  state.data = data;
  await page.route("**/api/**", async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split("/").at(-1);
    const body = route.request().postData()
      ? route.request().postDataJSON()
      : null;
    state.requests.push({ endpoint, body });
    if (endpoint === "meta")
      return route.fulfill({
        json: {
          version: "0.2.5 · 隔离验收",
          category_names: names,
          presentation,
          active: state.active,
        },
      });
    if (endpoint === "query") {
      state.queries++;
      state.currentQuery = body;
      const result = data(body),
        failure = state.queryFailure;
      const delay = state.delayFor ? state.delayFor(body) : state.queryDelay;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      return failure
        ? route.fulfill({ status: 500, json: { error: "隔离统计读取失败" } })
        : route.fulfill({ json: result });
    }
    if (endpoint === "detail") {
      state.details++;
      if (state.detailFailure)
        return route.fulfill({
          status: 500,
          json: { error: "隔离详情读取失败" },
        });
      const record = [
        ...state.records,
        ...(state.active ? [state.active] : []),
      ].find((row) => row.id === body.id);
      if (!record) return route.fulfill({ status: 404, json: { error: "记录已删除，请刷新列表" } });
      return route.fulfill({
        json: { record, segments: state.segments, revisions: state.revisions },
      });
    }
    if (endpoint === "save") {
      state.saves++;
      if (state.saveDelay)
        await new Promise((resolve) => setTimeout(resolve, state.saveDelay));
      if (state.saveFailure)
        return route.fulfill({
          status: state.saveFailure,
          json: {
            error:
              state.saveFailure === 409
                ? "记录已被其他窗口修改"
                : "隔离保存失败",
          },
        });
      const row = state.records.find((row) => row.id === body.id);
      const before = structuredClone(row);
      Object.assign(row, body, {
        revision: row.revision + 1,
        settlement_status: "COMPLETE",
      });
      state.revisions.push({
        revision: row.revision,
        changed_at: Date.now(),
        before,
        after: structuredClone(row),
      });
      return route.fulfill({ json: { ok: true } });
    }
    if (endpoint === "delete") {
      state.deletes++;
      state.records = state.records.filter((row) => row.id !== body.id);
      return route.fulfill({ json: { ok: true } });
    }
    return route.fulfill({
      status: 404,
      json: { error: "No fixture endpoint" },
    });
  });
  return state;
}
````

## NEW FILE — E:\WorkMemo\scripts\verify-v027-feedback.mjs

SHA256：`17cf319b835fe1ed590aa8ffae1b993a2a022ed0ffabdc526864988132059e73`

````mjs
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
````

## UPDATE — E:\WorkMemo\scripts\verify-v027-visual.mjs

SHA256：`3269eaef7d925c22aff45e71c60655a78406d3bd7851c9715aa0e4d09b0bdfb6`

````mjs
import { desktopFixture } from './desktop-fixture.mjs';
// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.7/qa/visual/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 780, height: 680 } });
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
await desktopFixture(page);
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1420/';
async function load(params = {}, width = 780, height = 680) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(220);
}
try {
  const metrics=[];
  for(const theme of ['glass','cream','dark','neon']) for(const opacity of [40,65,100]) for(const density of ['compact','comfortable']) {
    await load({state:'empty',theme,opacity:String(opacity),density},420,380);
    await page.getByRole('region',{name:'监测状态'}).waitFor();
    await page.getByRole('button',{name:'新建任务',exact:true}).waitFor();
    await page.evaluate(()=>document.body.style.background='linear-gradient(110deg, #111 0%, #aaa 50%, #fff 100%)');
    const browse=page.getByRole('button',{name:'仅浏览',exact:true});
    await browse.hover();
    const styles=await browse.evaluate(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
    assert.ok(styles.background.startsWith('rgba('),JSON.stringify(styles));
    const alpha=Number(styles.background.split(',').at(-1).replace(')',''));
    assert.ok(alpha<=0.2,JSON.stringify(styles));
    assert.equal(await page.locator('.desktop-frame').evaluate(el=>getComputedStyle(el).opacity),'1');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const strips = await page.locator('.home-footer, .today-strip').evaluateAll(nodes => nodes.map(el => ({
      radius: parseFloat(getComputedStyle(el).borderTopLeftRadius), padding: parseFloat(getComputedStyle(el).paddingLeft),
    })));
    assert.ok(strips.every(strip => strip.radius >= 6 && strip.padding >= 7), JSON.stringify(strips));
    assert.equal(await page.locator('.monitor-caption').count(), 0);
    metrics.push({theme,opacity,density,styles,strips});
    await page.screenshot({path:fileURLToPath(new URL(`main-${theme}-${opacity}-${density}.png`,output))});
  }
  await load({panel:'settings',section:'layout'},780,680);
  await page.getByRole('button',{name:'布局',exact:true}).click();
  const sound=page.getByRole('combobox',{name:'提示音套装',exact:true});
  assert.equal(await sound.inputValue(),'fiftysounds');
  for(const value of ['fiftysounds','soft','crisp']){
    await sound.selectOption(value);
    for(const cue of ['开始','暂停','恢复','结束','空闲提醒'])await page.getByRole('button',{name:`试听${cue}`,exact:true}).click();
  }
  assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='preview_sound').length),15);
  assert.deepEqual(errors,[]);
  await writeFile(new URL('result.json',output),JSON.stringify({isolated:true,native:false,metrics,soundPreviewCalls:15,errors},null,2));
  console.log('24 four-skin/opacity/density layouts, hover alpha and 15 preview bindings passed.');
}finally{await browser.close();}
````

## UPDATE — E:\WorkMemo\src\App.css

SHA256：`f6e0f2a06fcfe38a820fb3a18842cd9f7ee56d58d2ff3b8f4004c49c8ba2cb6b`

````css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); --content-gap: 12px; }
.desktop-frame[data-density="comfortable"] { --content-gap: 20px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: grid; grid-template-columns: auto auto minmax(64px, 1fr) auto; align-items: center; gap: 12px; flex-shrink: 0; min-height: 56px; padding: 8px 14px; background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: block; width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
.brand-name { display: block; font-size: 13px; font-weight: 600; letter-spacing: -.25px; white-space: nowrap; }
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.main-nav { display: flex; align-items: center; gap: 3px; }
button.nav-button { position: relative; width: 31px; height: 34px; padding: 5px; justify-content: center; color: var(--text-muted); background: transparent; box-shadow: none; border-radius: 9px; }
button.nav-button:hover:not(:disabled) { background: var(--control-hover); }
button.nav-button[aria-pressed="true"] { color: var(--accent-text); }
button.nav-button[aria-pressed="true"]::after { content: ""; position: absolute; height: 2px; left: 8px; right: 8px; bottom: -3px; border-radius: 2px; background: var(--accent); }
.category-strip { display: flex; gap: 6px; min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 3px 0; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.category-strip::-webkit-scrollbar { height: 2px; }
.category-strip::-webkit-scrollbar-thumb { border-radius: 2px; background: var(--scroll-thumb); }
.category-strip:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; border-radius: 6px; }
.category-chip { display: inline-flex; align-items: center; flex: 0 0 auto; gap: 6px; padding: 5px 9px; border-radius: 9px; font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgb(var(--surface-rgb) / 30%); white-space: nowrap; }
.category-chip span { font-variant-numeric: tabular-nums; }
.category-chip[data-current="true"] { color: var(--accent-text); background: var(--control-hover); }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; justify-self: end; grid-column: -2; }
.window-content { display: flex; flex-direction: column; min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { width: 100%; max-width: 648px; margin: 0 auto; padding: var(--content-gap) 24px 18px; outline: none; }
.workspace.is-active { margin-block: auto; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: var(--control-radius); background: var(--error-background); color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.resize-handle { position: absolute; z-index: 10; touch-action: none; }
.resize-North, .resize-South { left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
.resize-North { top: 0; }
.resize-South { bottom: 0; }
.resize-East, .resize-West { top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
.resize-East { right: 0; }
.resize-West { left: 0; }
.resize-NorthEast, .resize-NorthWest, .resize-SouthEast, .resize-SouthWest { width: 12px; height: 12px; }
.resize-NorthEast { top: 0; right: 0; cursor: nesw-resize; }
.resize-NorthWest { top: 0; left: 0; cursor: nwse-resize; }
.resize-SouthEast { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-SouthWest { bottom: 0; left: 0; cursor: nesw-resize; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--control-background); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent-text); border-color: var(--line); justify-content: center; box-shadow: none; }
button.secondary:hover:not(:disabled) { background: var(--secondary-hover); }
button.text-button { width: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; box-shadow: none; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 27px; height: 30px; padding: 5px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / var(--reading-opacity)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }

.task-copy { min-width: 0; }
.task-copy h1 { margin: 0; font-size: 20px; font-weight: 550; letter-spacing: -.4px; }
.task-summary { margin: 7px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.meta-dot { margin-inline: 7px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; flex-shrink: 0; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(24px, 4.6vw, 34px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -.8px; line-height: 1.3; white-space: nowrap; }
.timer-long { font-size: clamp(18px, 3.5vw, 26px); }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 160px; overflow-y: auto; }
.actions { margin-top: calc(var(--content-gap) + 6px); }
.actions button { width: auto; justify-content: center; }
button.round-action { width: 42px; height: 42px; padding: 11px; flex: 0 0 auto; border-radius: 50%; }
.round-action .icon-pause { stroke-width: 3; }
.round-action .icon-play { fill: currentColor; stroke-width: 1; }
button.quiet-action { padding: 7px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); font-size: 12px; box-shadow: none; }
button.quiet-action:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button.quiet-action:not(.finish-action) { margin-inline: auto; }
.form-card { width: min(100%, 560px); margin: var(--content-gap) auto 0; }
.form-card h2 { font-size: 12px; color: var(--text-muted); font-weight: 500; margin: 0 0 9px; }
.work-form { display: grid; gap: 10px; }
.work-form > button { min-height: 34px; padding: 8px 12px; }
.form-note > summary { display: flex; align-items: center; gap: 5px; width: fit-content; font-size: 11px; list-style: none; }
.form-note > summary::-webkit-details-marker { display: none; }
.form-note .icon { width: 15px; height: 15px; }
.form-note[open] > summary { margin-bottom: 3px; }

label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / var(--reading-opacity)); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 44px; max-height: 150px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: var(--control-radius); padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: var(--notice-text); background: var(--notice-background); border: 1px solid var(--notice-border); }
.notice p { margin: 0 0 6px; }
.error-banner { color: var(--error); background: var(--error-background); border: 1px solid var(--error-border); }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.field-error { display: block; margin-top: 6px; color: var(--error); font-size: 10px; overflow-wrap: anywhere; }
.field-count { display: block; text-align: right; margin-top: 4px; color: var(--text-muted); font-size: 10px; }
[aria-invalid="true"] { border-color: var(--error); }
.finished-card { border-color: var(--accent-text); }
.saved-feedback { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.switch-panel, .recent-panel, .connection-panel { margin-top: var(--content-gap); padding-top: 4px; font-size: 11px; }
.switch-panel { max-width: 560px; margin-inline: auto; }
summary { color: var(--text-muted); cursor: pointer; padding: 3px 0; }
details[open] > summary { margin-bottom: 15px; }
.connection-panel { margin-top: 15px; font-size: 10px; }
.connection-panel > p { font-size: 11px; }
.connection-panel button { margin-top: 10px; }
.record-list { list-style: none; padding: 0; margin: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list li:last-child { border-bottom: 0; }
.record-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
.record-heading strong { font-weight: 550; }
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent-text); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
.appearance-feedback { margin: 0 0 10px; color: var(--accent-text); }
.preview-notice { padding: 6px 9px; margin-bottom: 10px; font-size: 10px; }
.appearance-error-detail { font-size: 10px; }
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }

button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb) / var(--surface-opacity)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--line); }
.theme-sample span { height: 2px; width: 100%; background: var(--text-muted); border-radius: 2px; }
.theme-sample span:first-child { width: 60%; height: 4px; background: var(--accent); }
.theme-label { display: grid; gap: 5px; min-width: 0; }
.theme-label strong { font-size: 12px; font-weight: 600; }
.theme-label > span { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.opacity-heading { display: flex; align-items: center; justify-content: space-between; }
.opacity-heading output { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--accent-text); }
input.opacity-slider { padding: 0; margin: 10px 0 3px; border: 0; background: transparent; min-height: 24px; accent-color: var(--accent); cursor: pointer; }
.opacity-scale { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9px; }
button.reset-opacity { margin: 15px 0 0; padding: 6px 8px; font-size: 10px; }
.settings-actions { margin-top: 20px; }
.settings-actions button { justify-content: center; }
.appearance-dialog > .notice, .appearance-dialog > .error-banner { margin: 14px 0 0; }
@media (max-width: 540px) {
  .brand-name { font-size: 12px; }
  .titlebar { gap: 8px; padding-inline: 10px; }
  .workspace { padding-inline: 14px; }
}
@media (max-width: 380px) {
  .titlebar { gap: 4px; padding-inline: 8px; }
  .titlebar-drag { gap: 6px; }
  .brand-name { font-size: 11px; }
  .brand-mark { width: 25px; height: 25px; }
  button.nav-button { width: 27px; }
  .main-nav { gap: 0; }
  .window-controls { gap: 0; }
  .titlebar .window-control { width: 24px; }
  .workspace { padding-inline: 10px; }
  .task-row { gap: 10px; }
  .timer-card { padding: var(--content-gap); }
  .task-copy h1 { font-size: 17px; }
  .actions { gap: 14px; }
}
@media (prefers-reduced-motion: reduce) { button { transition: none; } }
.history-entry { margin-top: 15px; }
.history-dialog, .delete-dialog { width: min(500px, calc(100% - 32px)); max-height: calc(100% - 32px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--surface-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.history-dialog::backdrop, .delete-dialog::backdrop { background: rgb(0 0 0 / 25%); }
.history-filters { display: grid; gap: 10px; margin-top: 18px; }
.history-filters input, .history-filters select { padding: 9px 6px; font-size: 11px; }
.history-filters .hint { margin-top: 0; }
.filter-category-row { display: grid; grid-template-columns: 1fr 90px; gap: 12px; align-items: end; }
.filter-category-row button { justify-content: center; }
.history-tabs { margin: 18px 0 15px; }
.history-tabs button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--secondary-hover); }
.history-overview { font-size: 11px; line-height: 1.8; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; margin: 13px 0 18px; }
.summary-grid > div { min-width: 0; padding: 11px 7px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); }
.summary-grid dt { font-size: 10px; color: var(--text-muted); }
.summary-grid dd { margin: 7px 0 0; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.summary-grid small { font-size: 9px; font-weight: normal; }
.history-empty { margin: 15px 0; font-size: 12px; line-height: 1.9; color: var(--text-muted); }
.history-records { list-style: none; margin: 0; padding: 0; }
.history-records li { padding: 15px 0; border-bottom: 1px solid var(--line); }
.history-records .record-remark { max-height: 110px; overflow: auto; }
button.delete-link { margin: 9px 0 0 auto; color: var(--error); }
.history-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 18px; font-size: 10px; color: var(--text-muted); }
.history-pagination button { width: auto; padding: 8px 10px; font-size: 11px; }
.stats-section { margin-top: 20px; }
.stats-section h3 { font-size: 12px; font-weight: 600; }
.stats-scroll { overflow-x: auto; }
.stats-section table { width: 100%; border-collapse: collapse; font-size: 10px; font-variant-numeric: tabular-nums; }
.stats-section th, .stats-section td { padding: 9px 5px; border-bottom: 1px solid var(--line); text-align: right; overflow-wrap: anywhere; }
.stats-section th { font-weight: 500; }
.stats-section tr > :first-child { text-align: left; white-space: nowrap; }
.stats-section thead { color: var(--text-muted); }
.history-feedback { color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.delete-dialog { width: min(350px, calc(100% - 40px)); }
.delete-dialog h2 { margin: 0; font-size: 17px; }
.delete-dialog > p { font-size: 12px; line-height: 1.8; }
.delete-record-detail { padding: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 11px; line-height: 1.8; max-height: 160px; overflow: auto; }
button.danger-button { color: var(--error); background: var(--error-background); border-color: var(--error-border); }
button.danger-button:hover:not(:disabled) { background: var(--error-background); border-color: var(--error); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / var(--reading-opacity)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.ui-dialog::backdrop { background: rgb(0 0 0 / 18%); }
.density-settings { margin: 20px 0 0; padding: 0; border: 0; }
.density-settings legend { margin-bottom: 10px; font-size: 12px; }
.density-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.density-options button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--control-hover); }
.utilities-panel { margin-top: 20px; font-size: 11px; }
.utilities-panel > button { margin-top: 12px; }
.note-heading { margin-top: 20px; font-size: 13px; }
.settlement-entry { margin-top: 12px; }
.settlement-panel { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); }
.settlement-panel h2 { margin: 0; font-size: 16px; }
.settlement-panel .settings-heading .secondary { width: auto; flex-shrink: 0; font-size: 12px; line-height: 1.5; }
.settlement-record { padding: 12px 0; border-top: 1px solid var(--line); }
.settlement-record summary { cursor: pointer; }
.settlement-form { display: grid; gap: 12px; margin-top: 12px; }
.monitor-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; font-size: 10px; color: var(--text-muted); }
.monitor-status button { flex-shrink: 0; }
.monitor-settings { margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
.island-frame { padding: 5px; }
.island-shell { flex-direction: row; align-items: center; border-radius: 32px; padding: 0 8px 0 14px; }
.island-drag { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 100%; cursor: grab; }
.island-mark { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; color: var(--accent); border: 1px solid var(--window-border); font-weight: 700; }
.island-info { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.island-info strong, .island-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.island-info strong { font-size: 14px; }
.island-info small { font-size: 11px; color: var(--text-secondary); }
.island-time { font: 600 15px ui-monospace, monospace; white-space: nowrap; }
.island-open { flex: 0 0 30px; width: 30px; height: 30px; margin-left: 5px; padding: 0; border-radius: 50%; }
.island-error { color: var(--accent); font-weight: bold; }


/* Desktop refresh: keep all color and surface choices tied to the four theme tokens. */
.icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 18px; line-height: 1; }
.icon svg, .window-control .icon svg { display: block; width: 1em; height: 1em; fill: currentColor; stroke: none; }
.window-control .icon { width: 16px; height: 16px; font-size: 14px; }
.app-shell { border-radius: var(--window-radius); }
.titlebar { min-height: 62px; padding: 10px 17px; border-bottom: 1px solid var(--line); }
.brand-mark { width: 30px; height: 30px; }
.brand-name { font-size: 14px; letter-spacing: -.35px; }
.main-nav { gap: 5px; }
button.nav-button { width: 34px; height: 34px; border-radius: 10px; }
button.nav-button[aria-pressed="true"] { background: var(--control-hover); }
button.nav-button[aria-pressed="true"]::after { bottom: -2px; }
.category-chip { padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; }
.workspace { max-width: 680px; padding: 20px 24px 24px; }
.workspace.is-active { margin-block: 0; }
.monitor-status { min-height: 42px; padding: 7px 11px; margin: 0 auto 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--surface-rgb) / 45%); font-size: 11px; }
.monitor-status button { border: 0; color: var(--accent-text); font-size: 11px; }
.timer-card { width: 100%; max-width: none; padding: 22px; border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / var(--reading-opacity)); }
.task-eyebrow { margin-bottom: 10px; color: var(--text-muted); font-size: 10px; font-weight: 600; letter-spacing: .05em; }
.task-eyebrow .icon { width: 14px; height: 14px; font-size: 13px; }
.task-copy h1 { font-size: 22px; font-weight: 650; letter-spacing: -.5px; }
.task-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.task-summary .meta-dot { margin: 0 2px; }
.task-control-mode { padding: 2px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--text-muted); font-size: 10px; }
.task-mode-hint { max-width: 310px; margin: 8px 0 0; color: var(--text-muted); font-size: 10px; line-height: 1.6; }
.timer { font-family: ui-monospace, Consolas, monospace; font-size: clamp(23px, 4vw, 32px); letter-spacing: -1px; }
.actions { gap: 12px; margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }
button.round-action { width: 38px; height: 38px; padding: 9px; }
button.quiet-action { padding: 8px 10px; }
.form-card { width: 100%; max-width: none; padding: 16px 18px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.work-form { gap: 12px; }
.work-form > button { min-height: 40px; font-weight: 600; }
.switch-panel { max-width: none; padding: 12px 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.switch-panel summary { font-weight: 600; color: var(--text-primary); }
.switch-confirm { margin-top: 18px; font-size: 12px; line-height: 1.8; }
.switch-confirm p { margin: 0; }
.confirm-actions { margin-top: 10px; }
.confirm-actions button { justify-content: center; }
.ui-dialog, .history-dialog, .appearance-dialog, .delete-dialog { padding: 22px; }
.settings-heading { padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.settings-heading h2 { font-size: 16px; }
.monitor-settings { margin-top: 18px; }
.monitor-rule { padding: 14px; border-radius: 12px; }
.monitor-rule legend { color: var(--text-primary); font-weight: 600; }
.monitor-toggle input { accent-color: var(--accent); }
.monitor-toggle { line-height: 1.6; }
.history-records li, .settlement-record { padding: 15px 0; }
.notice-titlebar { padding: 14px 18px; border-bottom: 1px solid var(--line); }
.notice-titlebar span { font-weight: 600; }
.notice-content { padding: 8px 18px 18px; }
.island-shell { padding: 0 10px 0 14px; border-radius: 32px; }
.island-mark { color: var(--on-accent); background: var(--accent); border: 0; }
.island-info small { color: var(--text-muted); }
.island-time { font: 600 15px ui-monospace, Consolas, monospace; }
.island-open { display: flex; justify-content: center; align-items: center; color: var(--accent-text); background: var(--control-hover); }
.island-open .icon { width: 14px; height: 14px; font-size: 13px; transform: rotate(45deg); }
@media (max-width: 540px) {
  .titlebar { padding-inline: 10px; }
  .workspace { padding: 14px; }
  .timer-card { padding: 16px; }
}
@media (max-width: 380px) {
  .titlebar { padding-inline: 8px; }
  .workspace { padding: 10px; }
  .timer-card { padding: 13px; }
  .task-copy h1 { font-size: 17px; }
  .task-row { gap: 6px; }
  .timer { font-size: 22px; }
}

/* Secondary pages share the same cards, controls and token-driven typography. */
.history-dialog { width: min(540px, calc(100% - 32px)); }
.history-filters { padding: 14px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--window-rgb) / 45%); }
.history-filters label { color: var(--text-muted); font-weight: 600; }
.history-filters button { min-height: 38px; }
.history-tabs { padding: 4px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-tabs button { border-color: transparent; background: transparent; }
.history-tabs .icon, .history-pagination .icon, .history-filters .icon, .delete-link .icon { width: 15px; height: 15px; font-size: 14px; }
.history-overview { padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 45%); }
.summary-grid > div { padding: 12px 10px; }
.history-records { display: grid; gap: 9px; }
.history-records li { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-records .record-heading { align-items: flex-start; }
.stats-section { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.stats-section h3 { margin: 0 0 10px; }
.settlement-panel { padding: 18px; }
.settlement-panel .settings-heading { margin-bottom: 12px; }
.settlement-record { border-bottom: 1px solid var(--line); }
.settlement-form { padding: 0 4px 10px; }

button.theme-choice { min-height: 68px; padding: 12px; }
.theme-sample { width: 36px; height: 42px; border-radius: 9px; }
.theme-label strong { font-size: 13px; }
.theme-label > span { white-space: normal; }
.opacity-heading { margin-top: 20px; }

.notice-content h1 { margin-top: 12px; }
.notice-content p { line-height: 1.7; }

/* Independent panels reserve fixed header/footer rows. Only the body scrolls. */
.panel-app{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;overflow:hidden}
.panel-app .panel-surface{flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}
.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);flex-shrink:0}
.panel-heading h2{margin:0;font-size:18px}.panel-heading button{width:auto}
.panel-scroll{overflow:auto;min-height:0;padding:18px 24px 24px;scrollbar-width:thin}
.panel-actions{grid-row:3;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:14px 22px;border-top:1px solid var(--line);background:rgb(var(--surface-rgb)/var(--reading-opacity))}
.panel-actions>button{width:auto;min-width:120px}.panel-actions .history-pagination{width:100%;margin:0}
.settings-tabs{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--line);flex-shrink:0}.settings-tabs button{width:auto;flex:1}
.settings-tabs button[aria-pressed=true]{border-color:var(--accent);color:var(--accent-text)}
.draft-indicator{font-size:11px;margin:0;padding:6px 24px;color:var(--accent-text);flex-shrink:0}
.panel-app>.error-banner{margin:8px 20px;flex-shrink:0;max-height:80px;overflow:auto}
.data-buttons{display:flex;gap:10px;margin:14px 0 24px;flex-wrap:wrap}.data-buttons button{width:auto}
.panel-app .monitor-settings{padding:0}.panel-app .theme-grid{max-width:760px}.panel-app .settlement-form{max-width:760px;margin-top:20px}
@media(max-width:600px){.panel-scroll{padding:14px}.panel-heading,.panel-actions{padding:12px}.settings-tabs{padding:8px}.panel-actions>button{min-width:0;flex:1}}

/* Shared preferences: every desktop surface uses the saved typography. */
.desktop-frame{font-size:var(--body-size,14px);font-weight:var(--body-weight,400);line-height:var(--body-line,1.6)}
.desktop-frame button,.desktop-frame input,.desktop-frame select,.desktop-frame textarea,.desktop-frame label,.desktop-frame summary{font-size:1em;font-weight:inherit;line-height:inherit}
.desktop-frame h1{font-size:1.5em}.desktop-frame h2{font-size:1.2em}.desktop-frame h3{font-size:1.05em}.desktop-frame .hint,.desktop-frame .task-summary{font-size:.82em}.desktop-frame .timer{font-size:2.25em}.desktop-frame .task-control-mode{font-size:.75em}
.app-shell{position:relative;isolation:isolate}.window-background{position:absolute;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center}
button.nav-button[aria-pressed="true"]::after{display:none}.desktop-frame .main-nav{display:flex;gap:3px}.desktop-frame .titlebar{grid-template-columns:auto auto minmax(0,1fr) auto}
.work-badge{display:inline-flex;align-items:center;gap:8px;min-width:0}.work-symbol{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:31px;height:31px;border-radius:9px;color:var(--work-color);background:color-mix(in srgb,var(--work-color) 12%,transparent)}.work-symbol .icon{font-size:19px}.work-badge>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button.workload-carousel{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0;overflow:hidden;padding:6px 9px;border:1px solid var(--line);border-radius:999px;background:rgb(var(--surface-rgb)/45%);color:var(--text-primary);font-size:.8em;white-space:nowrap}.workload-carousel .work-symbol{width:22px;height:22px;border-radius:50%}.workload-carousel .icon{font-size:14px}.workload-carousel .work-badge{gap:5px;flex-shrink:0}.workload-carousel small{color:var(--text-muted);font-size:.8em;overflow:hidden;text-overflow:ellipsis}.workload-carousel>span{overflow:hidden;text-overflow:ellipsis}
.home-footer{display:flex;align-items:center;gap:8px;margin-top:12px;min-width:0}.home-footer button{flex-shrink:0}.monitor-caption{font-size:.72em;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto}.start-prompt{border:1px solid var(--line);border-radius:var(--panel-radius);background:rgb(var(--surface-rgb)/var(--reading-opacity));padding:16px;margin-bottom:12px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}.start-prompt>strong{font-size:1em}.start-prompt p{width:100%;color:var(--text-muted);font-size:.85em;margin:0}.start-prompt>div{display:flex;gap:9px;width:100%}.start-prompt button{justify-content:center}.browse-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:12px;background:rgb(var(--surface-rgb)/85%);font-size:.88em}.browse-banner button{width:auto;justify-content:center;flex-shrink:0}
.panel-actions>button,.settings-actions>button,.data-buttons>button{justify-content:center!important;text-align:center}.panel-app button{max-width:100%}.panel-heading{padding:12px 22px}.panel-heading h2{font-size:1.15em}.settings-tabs{gap:5px;padding:10px 16px}.settings-tabs button{padding:8px 9px;font-size:.88em}.layout-form{display:grid;gap:18px;max-width:650px}.layout-form input[type=range]{padding:0}.font-preview{padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.visual-category{border:1px solid var(--line);border-radius:12px;padding:15px;margin:0 0 18px;min-width:0}.visual-category legend{padding:0 7px}.color-field{display:flex!important;align-items:center;gap:12px;margin-bottom:12px}.color-field input{width:45px;height:30px;padding:2px;margin:0}.color-field span{color:var(--text-muted);font-size:.8em}.icon-picker{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin-top:12px}.icon-picker button{min-height:40px;padding:8px}.icon-picker button[aria-pressed=true]{border-color:var(--accent-text);outline:1px solid var(--accent-text);background:var(--control-hover)}.background-settings{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.compact-help{margin:8px 0;font-size:.84em;color:var(--text-muted)}.compact-help summary{cursor:pointer}.monitor-diagnostics,.advanced-settings{padding:12px 14px;border:1px solid var(--line);border-radius:10px;margin-bottom:14px}.monitor-diagnostics>summary,.advanced-settings>summary{cursor:pointer;font-weight:600}.monitor-diagnostics>p,.monitor-diagnostics>button,.monitor-diagnostics>details{margin-top:12px}.advanced-settings>fieldset{margin-top:12px}
.desktop-frame[data-density=compact]{padding:5px;--content-gap:6px}.desktop-frame[data-density=compact] .titlebar{min-height:39px;padding:5px 8px;gap:5px}.desktop-frame[data-density=compact] .brand-name{display:none}.desktop-frame[data-density=compact] .brand-mark{width:22px;height:22px}.desktop-frame[data-density=compact] .titlebar-drag{min-height:24px}.desktop-frame[data-density=compact] .nav-button{width:25px;height:25px;padding:4px}.desktop-frame[data-density=compact] .nav-button .icon{font-size:15px}.desktop-frame[data-density=compact] .window-control{width:22px;height:25px;padding:4px}.desktop-frame[data-density=compact] .window-controls{gap:0}.desktop-frame[data-density=compact] .workload-carousel{padding:3px 5px;gap:4px;font-size:.7em}.desktop-frame[data-density=compact] .workload-carousel small{display:none}.desktop-frame[data-density=compact] .workload-carousel .work-symbol{width:17px;height:17px}.desktop-frame[data-density=compact] .workload-carousel .work-symbol .icon{font-size:12px}.desktop-frame[data-density=compact] .workspace{padding:8px 10px 9px;max-width:none}.desktop-frame[data-density=compact] .auxiliary{display:none}.desktop-frame[data-density=compact] .timer-card{padding:10px 12px;border-radius:12px}.desktop-frame[data-density=compact] .task-copy h1{font-size:1em}.desktop-frame[data-density=compact] .task-summary{margin-top:3px;font-size:.7em;gap:3px}.desktop-frame[data-density=compact] .task-control-mode{font-size:.9em;padding:0 4px}.desktop-frame[data-density=compact] .task-copy .work-symbol{width:25px;height:25px}.desktop-frame[data-density=compact] .task-copy .work-symbol .icon{font-size:16px}.desktop-frame[data-density=compact] .timer{font-size:1.65em}.desktop-frame[data-density=compact] .actions{margin-top:6px;padding-top:6px;gap:8px}.desktop-frame[data-density=compact] .round-action{width:29px;height:29px;padding:6px}.desktop-frame[data-density=compact] .quiet-action{padding:3px 5px;font-size:.8em}.desktop-frame[data-density=compact] .form-card{padding:9px 11px;margin-top:0;border-radius:12px}.desktop-frame[data-density=compact] .work-form{gap:7px}.desktop-frame[data-density=compact] .work-form label{font-size:.82em}.desktop-frame[data-density=compact] .work-form select{padding:4px 8px;margin-top:2px}.desktop-frame[data-density=compact] .work-form>button{min-height:30px;padding:4px 9px;font-size:.82em;justify-content:center}.desktop-frame[data-density=compact] .form-note>summary{font-size:.72em}.desktop-frame[data-density=compact] .home-footer{margin-top:6px;gap:4px}.desktop-frame[data-density=compact] .home-footer button{font-size:.7em;padding:4px 7px}.desktop-frame[data-density=compact] .monitor-caption{font-size:.65em}.desktop-frame[data-density=compact] .switch-panel{margin-top:6px;padding:5px 9px;font-size:.8em}.desktop-frame[data-density=compact] .start-prompt{padding:10px;gap:6px;margin-bottom:7px}.desktop-frame[data-density=compact] .start-prompt p{font-size:.75em}.desktop-frame[data-density=compact] .start-prompt button{padding:5px 8px;font-size:.82em}.desktop-frame[data-density=compact] .browse-banner{padding:8px 10px;margin-bottom:7px}.desktop-frame[data-density=compact] .browse-banner button{padding:5px 8px}.desktop-frame[data-density=compact] .settings-tabs{padding:6px 10px}.desktop-frame[data-density=compact] .settings-tabs button{padding:5px 7px;font-size:.8em}.desktop-frame[data-density=compact] .panel-heading{padding:8px 14px}.desktop-frame[data-density=compact] .panel-scroll{padding:10px 14px}.desktop-frame[data-density=compact] .panel-actions{padding:8px 14px}.desktop-frame[data-density=compact] .panel-actions>button{padding:7px 12px}.desktop-frame[data-density=compact] .monitor-settings{gap:9px}.desktop-frame[data-density=compact] .monitor-rule{padding:9px;gap:6px}.desktop-frame[data-density=compact] .theme-choice{min-height:48px;padding:8px}.desktop-frame[data-density=compact] .theme-sample{width:25px;height:28px}.desktop-frame[data-density=compact] .visual-category{padding:10px;margin-bottom:10px}
/* Main titlebar: identity + one settings entry, drag space, workload, window controls. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto auto minmax(32px,1fr) minmax(120px,320px) auto; }
.titlebar-main .titlebar-space { align-self:stretch; min-width:32px; }
.titlebar-main .workload-carousel { min-height:32px; }
.titlebar-main .workload-carousel .work-badge { flex:0 1 auto; min-width:0; }
.titlebar-main .workload-carousel strong { flex:0 0 auto; font-variant-numeric:tabular-nums; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto auto minmax(24px,1fr) minmax(100px,240px) auto; min-height:42px; gap:6px; }
.desktop-frame[data-density=compact] .titlebar-main .titlebar-space { min-width:24px; }
.desktop-frame[data-density=compact] .titlebar-main .nav-button { width:28px; height:28px; }
.desktop-frame[data-density=compact] .titlebar-main .workload-carousel { min-height:28px; padding:4px 8px; font-size:.75em; }
@media(max-width:600px) { .titlebar-main .brand-name { display:none; } }

/* Compact native status window: all persistent actions share the same row. */
.island-frame { padding:4px; }
.island-shell { position:relative; display:flex; flex-direction:column; align-items:stretch; justify-content:center; padding:5px 8px; border-radius:20px; gap:5px; }
.island-main-row { display:flex; align-items:center; min-height:30px; gap:5px; }
.island-drag { height:auto; gap:7px; }
.island-drag .work-symbol { width:26px; height:26px; border-radius:8px; flex-shrink:0; }
.island-drag .work-symbol .icon { font-size:16px; }
.island-info { gap:0; }
.island-info strong { font-size:12px; line-height:1.4; }
.island-info small { font-size:9px; line-height:1.4; }
.island-drag .island-time { font-size:12px; }
button.island-action, button.island-open { display:flex; justify-content:center; align-items:center; flex:0 0 26px; width:26px; height:26px; margin:0; padding:4px; border-radius:50%; background:transparent; color:var(--text-muted); box-shadow:none; }
button.island-action:hover:not(:disabled),button.island-open:hover:not(:disabled) { background:var(--control-hover); color:var(--accent-text); }
button.island-start { width:auto; flex-shrink:0; min-height:26px; padding:4px 8px; font-size:10px; border-radius:8px; }
.island-intent { display:flex; gap:6px; padding-left:33px; }
.island-intent button { width:auto; min-height:25px; padding:3px 10px; font-size:10px; justify-content:center; }
.island-error { position:absolute; left:2px; top:2px; font-size:10px; }
.layout-form { width:100%; margin-inline:auto; }
.layout-form input[type=range] { margin-inline:0; }
.panel-surface:has(.layout-form) .panel-heading, .panel-surface:has(.layout-form) .panel-actions { width:100%; max-width:694px; margin-inline:auto; }
button { transition:background-color .14s,border-color .14s,color .14s; }
button:active:not(:disabled) { box-shadow:inset 0 1px 2px rgb(0 0 0 / 12%); }
button.nav-button:hover:not(:disabled),button.text-button:hover:not(:disabled),button.workload-carousel:hover:not(:disabled) { background:var(--control-hover); }
@media (prefers-reduced-motion:reduce) { button { transition:none; } }

.monitor-work-sites { display:grid; gap:10px; min-width:0; }
.monitor-work-sites h3 { margin:0; font-size:1em; }
.monitor-work-sites > .hint { margin:0; }
.monitor-work-group { border:1px solid var(--line); border-radius:12px; min-width:0; }
.monitor-work-group > summary { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; list-style:none; }
.monitor-work-group > summary::before { content:"›"; color:var(--text-muted); transition:transform .14s; }
.monitor-work-group[open] > summary::before { transform:rotate(90deg); }
.monitor-work-group > summary span { margin-left:auto; font-size:.8em; color:var(--text-muted); }
.monitor-work-urls { display:grid; gap:10px; padding:0 12px 12px; min-width:0; }

.category-names-editor { display: grid; gap: 12px; margin-block: 16px; padding-block: 16px; border-block: 1px solid var(--border); }

.sound-preview-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

/* v0.2.5: retain the desktop layout and theme tokens. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
.titlebar-main .titlebar-drag:first-child { grid-column:1; grid-row:1; }
.titlebar-main .titlebar-space { grid-column:2; grid-row:1; min-width:24px; }
.titlebar-main .browse-toolbar { grid-column:3; grid-row:1; }
.titlebar-main .main-nav { grid-column:4; grid-row:1; padding-left:8px; border-left:1px solid var(--line); }
.titlebar-main .window-controls { grid-column:5; grid-row:1; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
button.browse-toolbar { width:auto; padding:4px 2px; gap:7px; color:var(--text-muted); background:transparent; box-shadow:none; font-size:12px; white-space:nowrap; }
button.browse-toolbar .icon { width:17px; height:17px; font-size:17px; }
button.browse-toolbar[aria-pressed=true] { color:var(--accent-text); }
.browse-switch { width:30px; height:18px; padding:2px; border-radius:20px; background:rgb(var(--surface-rgb)/65%); border:1px solid var(--line); }
.browse-switch::before { content:""; display:block; width:12px; height:12px; border-radius:50%; background:var(--text-muted); transition:transform .18s,background .18s; }
[aria-pressed=true] .browse-switch { background:var(--control-pressed); border-color:var(--accent-text); }
[aria-pressed=true] .browse-switch::before { transform:translateX(12px); background:var(--accent-text); }
.window-background { inset:-4px; filter:blur(2px); }
.workspace { display:flex; flex-direction:column; flex:0 0 auto; min-height:0; gap:12px; }
.workspace.is-active { margin-block:0; }
.workspace > .timer-card,.workspace > .form-card { width:100%; margin:0; border-color:var(--window-border); background:rgb(var(--surface-rgb)/var(--reading-opacity)); box-shadow:var(--panel-shadow); backdrop-filter:blur(12px); }
.monitor-status-card h1 { margin:0 0 10px; font-size:1.15em; }
.monitor-status-card p { overflow-wrap:anywhere; }
.monitor-status-card > button { margin-top:12px; }
.workspace .actions { display:flex; flex-wrap:wrap; align-items:center; gap:12px; border-top:1px solid var(--line); padding-top:18px; }
.workspace .quiet-action { gap:7px; }
.workspace .home-footer { margin-top:0; }
.workspace .home-footer .text-button { padding:3px 0; border:0; border-radius:0; }
button.browse-toolbar[aria-pressed=true]:disabled { opacity:.85; }
.workspace > .notice,.workspace > .error-banner { margin-bottom:0; }
.work-form .category-field { display:flex; align-items:center; gap:12px; }
.category-field-symbol { display:grid; place-items:center; width:40px; height:40px; flex-shrink:0; border-radius:var(--control-radius); color:var(--accent-text); background:var(--control-hover); }
.work-form .category-field label { flex:1; min-width:0; }
.work-form .category-field select { border:0; background:transparent; margin:0; padding:10px 4px; font-size:1.05em; box-shadow:none; }
.work-input-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.work-input-row label { min-width:0; }
.work-input-row textarea { min-height:42px; resize:vertical; }
.work-form .start-work { width:100%; justify-content:center; border-radius:999px; gap:9px; margin-top:2px; }
.work-form .cancel-switch { justify-content:flex-start; width:auto; color:var(--text-primary); background:transparent; padding:4px 0; box-shadow:none; }
.switch-hint { font-size:11px; color:var(--text-muted); margin:0; }
button.today-strip { display:flex; gap:13px; width:100%; flex-shrink:0; padding:10px 12px; border:1px solid var(--window-border); border-radius:var(--control-radius); box-shadow:none; background:transparent; color:var(--text-muted); font-size:12px; text-align:left; }
button.today-strip:hover { background:transparent; color:var(--text-primary); }
.today-strip-label { display:flex; align-items:center; gap:7px; flex-shrink:0; color:var(--text-primary); white-space:nowrap; }
.today-strip .icon { width:16px; height:16px; font-size:16px; }
.today-strip-viewport { display:block; flex:1; min-width:0; overflow:hidden; }
.today-strip-track { display:flex; width:max-content; gap:32px; white-space:nowrap; }
.today-strip-track > span { flex-shrink:0; }
.today-strip-track.is-scrolling { animation:today-scroll var(--scroll-duration) linear infinite; }
.today-strip:hover .today-strip-track,.today-strip:focus-visible .today-strip-track { animation-play-state:paused; }
@keyframes today-scroll { to { transform:translateX(calc(-1 * var(--scroll-distance))); } }
.desktop-frame[data-density=compact] .workspace { gap:8px; }
.desktop-frame[data-density=compact] .workspace .actions { gap:8px; padding-top:10px; }
.desktop-frame[data-density=compact] .category-field-symbol { width:30px; height:30px; }
.desktop-frame[data-density=compact] .today-strip { font-size:10px; gap:8px; padding:7px 9px; }
.desktop-frame[data-density=compact] .workspace .home-footer { margin-top:0; }
@media(max-width:440px) {
  .workspace .actions { gap:8px; }
  .workspace .quiet-action { padding-inline:4px; gap:4px; }
  .workspace .quiet-action .icon { width:17px; height:17px; font-size:17px; }
  .work-input-row { grid-template-columns:1fr; gap:8px; }
  .browse-toolbar .browse-switch { display:none; }
  .titlebar-main .main-nav { padding-left:4px; }
}
@media(prefers-reduced-motion:reduce) {
  .today-strip-track.is-scrolling { animation:none; }
  .today-strip-track > span[aria-hidden] { display:none; }
  .today-strip-viewport { overflow-x:auto; scrollbar-width:thin; }
  .browse-switch::before { transition:none; }
}

/* Fixed island body; the lower reveal shares this single material layer. */
.island-frame { padding:4px; }
.island-frame .island-shell { position:absolute; left:4px; top:4px; width:312px; height:auto; max-height:calc(100% - 8px); padding:0; gap:0; display:flex; flex-direction:column; justify-content:flex-start; border-radius:20px; overflow:hidden; backdrop-filter:blur(12px); }
.island-frame .island-main-row { position:relative; width:310px; height:46px; min-height:46px; flex:0 0 46px; padding:5px 7px; margin:0; gap:3px; border-radius:20px; }
.island-frame .island-drag { align-self:stretch; min-width:0; height:auto; }
.island-frame .island-info { min-width:0; }
.island-frame .island-drag .work-symbol { flex:0 0 25px; width:25px; height:25px; }
.island-frame .island-time { font-size:12px; }
.island-frame button.island-action,.island-frame button.island-open { flex:0 0 22px; width:22px; height:26px; padding:3px; border-radius:8px; }
.island-frame .island-action .icon,.island-frame .island-open .icon { width:14px; height:14px; font-size:14px; }
.island-expansion { width:310px; flex:none; overflow:hidden; transition:height .2s ease,opacity .2s ease,transform .2s ease; }
.island-expansion:not(.island-reveal-enter):not(.island-reveal-appear):not(.island-reveal-leave) { overflow-y:auto; scrollbar-width:thin; }
.island-expansion-content { padding:5px 13px 14px; font-size:12px; }
.island-expansion-content h2 { margin:0 0 8px; font-size:14px; font-weight:600; }
.island-expansion-content p { margin:0 0 9px; line-height:1.65; }
.island-expansion-content button { min-height:29px; padding:6px 9px; font-size:11px; justify-content:center; }
.island-buttons { display:flex; gap:8px; }
.island-expansion .settlement-form { display:flex; flex-direction:column; gap:9px; }
.island-expansion .settlement-form .hint { font-size:10px; margin:0; }
.island-expansion .settlement-form label { font-size:11px; }
.island-expansion .settlement-form input,.island-expansion .settlement-form select,.island-expansion .settlement-form textarea { margin-top:4px; padding:5px 7px; font-size:12px; }
.island-expansion .text-button { margin-top:8px; width:100%; }
.island-discard { padding:8px; margin-bottom:10px; border:1px solid var(--line); border-radius:var(--control-radius); }
.island-discard button+button { margin-top:6px; }
@media(prefers-reduced-motion:reduce) { .island-expansion { transition:none; } }

/* v0.2.7: shared translucent controls, with local reading protection rather than content opacity. */
.desktop-frame .titlebar, .desktop-frame .home-footer, .desktop-frame .footer,
.desktop-frame .settings-tabs, .desktop-frame .panel-surface,
.island-frame .island-main-row, .island-frame .island-expansion-content {
  background: rgb(var(--window-rgb) / var(--reading-opacity));
}
.desktop-frame button.today-strip, .desktop-frame button.today-strip:hover {
  background: rgb(var(--window-rgb) / var(--reading-opacity));
}
.desktop-frame .titlebar { border-radius: var(--window-radius) var(--window-radius) 0 0; }
button.secondary { background: var(--control-background); color: var(--text-primary); }
button:active:not(:disabled) { background: var(--control-pressed); box-shadow: none; }
button.browse-toolbar:hover:not(:disabled), button.browse-toolbar[aria-pressed=true] {
  background: var(--control-hover); color: var(--accent-text); border-radius: 8px;
}
button.browse-toolbar, button.window-control, button.nav-button,
button.island-action, button.island-open, button.quiet-action { border-color: transparent; }
.work-form > button:not(.cancel-switch), .monitor-status-card > button,
.settlement-form button[type=submit], .panel-actions > button:not(.secondary) {
  background: var(--primary-background); color: var(--accent-text); border-color: var(--window-border);
  justify-content: center; gap: 9px;
}
.work-form > button:hover:not(:disabled), .monitor-status-card > button:hover:not(:disabled),
.settlement-form button[type=submit]:hover:not(:disabled), .panel-actions > button:hover:not(:disabled) {
  background: var(--control-hover);
}
.desktop-frame .appearance-dialog, .desktop-frame .history-dialog, .desktop-frame .delete-dialog,
.desktop-frame .ui-dialog { background: rgb(var(--surface-rgb) / var(--reading-opacity)); backdrop-filter: blur(16px); }

/* Feedback: standalone reading strips use the same rounded material as other cards. */
.home-footer { border:1px solid var(--window-border); border-radius:var(--control-radius); padding:7px 12px; min-height:34px; }
.desktop-frame[data-density=compact] .home-footer { padding:4px 9px; min-height:29px; }
.home-footer > button { margin:0; }
.help-disclosure { color:var(--text-muted); font-size:.82em; line-height:1.65; }
.help-disclosure > summary { cursor:pointer; width:fit-content; padding-block:3px; }
.help-disclosure p { margin:7px 0 0; overflow-wrap:anywhere; }
.monitor-status-card .help-disclosure { margin-block:4px; }
.desktop-frame .start-prompt, .desktop-frame .switch-panel,
.desktop-frame .monitor-status, .desktop-frame .font-preview { border-radius:var(--panel-radius); }
````

## UPDATE — E:\WorkMemo\src\App.tsx

SHA256：`e22b789dde823474b2a5cefbf9fbffd900502f22c798d9f373511b352e12d851`

````tsx
import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm, emptyWorkDraft } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatTime, type StartInput } from "./types";
import { workView } from "./workView";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  useDashboard,
  layoutStyle,
  WorkBadge,
} from "./desktopPreferences";
import "./App.css";
import { type TodayWorkload as Today } from "./workload";
import { TodayWorkloadStrip } from "./TodayWorkloadStrip";
import { useMainContentHeight } from "./useMainContentHeight";
export default function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const layout = useLayout();
  const dashboard = useDashboard();
  const [noteOpen, setNoteOpen] = useState(false);
  const [switchRequest, setSwitchRequest] = useState<{
    input: StartInput;
    id: number;
    category: string;
  } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [migrationFound, setMigrationFound] = useState(false);
  const [today, setToday] = useState<Today[] | null>(null);
  const [todayError, setTodayError] = useState("");
  const [startupError, setStartupError] = useState("");
  const [switchingFrom, setSwitchingFrom] = useState<number | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [workDraft, setWorkDraft] = useState(emptyWorkDraft);
  const workspace = useRef<HTMLElement>(null);
  const heightError = useMainContentHeight(workspace, !!session.snapshot);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const monitor = session.snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const unavailable = !view.canOperate || session.busy;
  const compact = layout.current.density === "compact";
  useEffect(() => {
    if (!session.native) return;
    let stopped = false;
    const reload = () => { void invoke<{ error: string | null }>("get_startup_status")
      .then(value => { if (!stopped) setStartupError(value.error ? `开机启动：${value.error}` : ""); })
      .catch(e => { if (!stopped) setStartupError(`无法读取开机启动状态：${String(e)}`); }); };
    reload();
    const listener = listen("workmemo:startup-changed", reload);
    return () => { stopped = true; void listener.then(fn => fn()); };
  }, [session.native]);
  function panel(section: string) {
    void invoke("open_panel", { panel: "settings", section }).catch((e) =>
      setNavigationError(String(e)),
    );
  }
  useEffect(() => {
    if (!session.native) return;
    let reading = false;
    let stopped = false;
    const load = async () => {
      if (reading) return;
      reading = true;
      try {
        const items = await invoke<Today[]>("get_today_workload");
        if (!stopped) {
          setToday(items);
          setTodayError("");
        }
      } catch (e) {
        if (!stopped) setTodayError(String(e));
      } finally {
        reading = false;
      }
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 5000);
    const p = listen("workmemo:data-changed", () => {
      void load();
      void session.refresh();
    });
    return () => {
      stopped = true;
      clearInterval(timer);
      void p.then((f) => f());
    };
  }, [session.native]);
  useEffect(() => {
    if (!session.native) return;
    void invoke<boolean>("detect_preview_data")
      .then(setMigrationFound)
      .catch(() => {});
    const p = listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    });
    return () => {
      void p.then((f) => f());
    };
  }, [session.native]);
  const switching = switchingFrom !== null;
  const formOpen = switching || newTaskOpen;
  const switchValid = !!active?.is_paused && !active.recovery_pending && active.id === switchingFrom;
  return (
    <DesktopWindow
      density={layout.current.density}
      background={presentation.current.background}
      appearanceStyle={{
        ...themeStyle(appearance.current),
        ...layoutStyle(layout.current),
      }}
      navigation={
        <nav className="main-nav" aria-label="主导航">
          <button
            className="nav-button"
            title="设置"
            aria-label="设置"
            onClick={() => panel("monitor")}
          >
            <Icon name="settings" />
          </button>
        </nav>
      }
      categories={
        <button type="button" className="browse-toolbar" aria-label="仅浏览" aria-pressed={!!monitor?.browsing_only}
          title={monitor?.browsing_only ? monitor.browse_ready ? "退出仅浏览，开始或继续记录" : "请先返回已匹配的工作页面操作" : "仅浏览，暂停计时"}
          disabled={unavailable || (!!monitor?.browsing_only && (!monitor.browse_ready || !!active?.recovery_pending))}
          onClick={() => { void (monitor?.browsing_only ? session.confirmWork(null) : session.browse()); }}>
          <Icon name="eye" /><span>仅浏览</span><span className="browse-switch" aria-hidden="true" />
        </button>
      }
    >
      <main
        ref={workspace}
        className={`workspace ${active ? "is-active" : ""}`}
      >
        {dashboard.fallback}
        {(session.connectionError ||
          session.commandError ||
          navigationError ||
          startupError ||
          heightError ||
          appearance.loadError ||
          presentation.error ||
          layout.error) && (
          <p className="error-banner" role="alert">
            {session.connectionError ||
              session.commandError ||
              navigationError ||
              startupError ||
              heightError ||
              appearance.loadError ||
              presentation.error ||
              layout.error}
          </p>
        )}
        {session.snapshot?.warning && (
          <p className="notice" role="alert">
            {session.snapshot.warning}
          </p>
        )}
        {!session.native && (
          <p className="notice">浏览器预览 · 计时和保存请使用桌面应用</p>
        )}
        {active?.recovery_pending && (
          <p className="notice" role="status">
            上次未结束的任务保持暂停。请确认后继续，软件关闭期间不计时。
          </p>
        )}
        {candidate && !active && !formOpen && (
          <section className="start-prompt" aria-label="开工确认">
            <WorkBadge
              category={candidate.category}
              presentation={presentation.current}
            />
            <strong>已识别工作页面</strong>
            <p>确认前不计时，工作量稍后填写。</p>
            <div>
              <button
                disabled={unavailable}
                onClick={() => {
                  void session.confirmWork(candidate.id);
                }}
              >
                开始记录
              </button>
              <button className="secondary" disabled={unavailable} onClick={() => setNewTaskOpen(true)}>新建任务</button>
            </div>
          </section>
        )}
        {!formOpen && !active && !candidate && (session.snapshot || !session.native) && (
          <section className="form-card monitor-status-card" aria-label="监测状态">
            <h1>{monitor?.browsing_only ? "仅浏览 · 当前不计时" : monitor?.enabled ? "等待识别工作页面" : "自动监测未启用"}</h1>
            {monitor?.enabled && (!monitor.browser_connected || !monitor.native_available)
              ? <p className="notice" role="status">{monitor.message}</p>
              : <details className="help-disclosure"><summary>监测详情</summary><p>{monitor?.message || "请在桌面应用中查看监测状态。"}</p></details>}
            <button type="button" disabled={unavailable} onClick={() => setNewTaskOpen(true)}><Icon name="play" />新建任务</button>
          </section>
        )}
        {!formOpen && active && (
          <section
            className="timer-card"
            aria-label="当前工作"
            aria-busy={session.loading || session.busy}
          >
            <div className="task-row flex items-center justify-between gap-4">
              <div className="task-copy">
                <div className="task-eyebrow auxiliary">当前工作</div>
                <h1>
                  {record ? (
                    <WorkBadge
                      category={record.category}
                      presentation={presentation.current}
                    />
                  ) : (
                    view.label
                  )}
                </h1>
                <p className="task-summary">
                  <span className="state-label" role="status">
                    {monitor?.browsing_only ? "仅浏览 · 已停表" : view.label}
                  </span>
                  {record && (
                    <span className="task-control-mode">
                      {record.control_mode === "AUTO" ? "自动记录" : "手动计时"}
                    </span>
                  )}
                </p>
              </div>
              <output className="timer" aria-label="有效工作时长">
                {view.timer}
              </output>
            </div>
            {record && (
              <div className="actions flex items-center gap-3">
                {active && (
                  <button
                    className="round-action"
                    disabled={unavailable}
                    title={active.is_paused ? "继续工作" : "暂停"}
                    aria-label={active.is_paused ? "继续工作" : "暂停"}
                    onClick={() => {
                      void (active.is_paused
                        ? session.resume(active.id)
                        : session.pause(active.id));
                    }}
                  >
                    <Icon name={active.is_paused ? "play" : "pause"} />
                  </button>
                )}
                <button
                  className="quiet-action"
                  onClick={() => setNoteOpen(true)}
                  title="任务备注"
                >
                  <Icon name="note" />
                  <span>备注</span>
                </button>
                {active && <button className="quiet-action switch-action" disabled={unavailable || !active.is_paused || !!active.recovery_pending}
                  title={active.is_paused ? "切换任务" : "请先暂停再切换任务"} onClick={() => setSwitchingFrom(active.id)}>
                  <Icon name="swap" /><span>切换任务</span>
                </button>}
                {active && (
                  <button
                    className="quiet-action finish-action"
                    disabled={unavailable}
                    onClick={() => {
                      void session.finish(active.id);
                    }}
                    title="结束计时"
                  >
                    <Icon name="check" />
                    <span>结束</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        {formOpen && (
          <section className="form-card new-task-page" aria-label={switching ? "切换任务" : "新建任务"}>
            {switching && !switchValid && <p className="notice" role="status">原任务状态已变化，请返回当前任务确认。填写内容仍保留。</p>}
            {!switching && active && <p className="notice" role="status">已有任务从其他入口开始，请返回当前任务。填写内容仍保留。</p>}
            {candidate && !active && <p className="hint">已识别{name(candidate.category)}工作页面；也可在灵动岛确认开始。手动填写内容仍保留。</p>}
            <WorkForm draft={workDraft} onDraftChange={setWorkDraft} minimal={compact} switching={switching} disabled={unavailable || (switching ? !switchValid : !!active)}
              starting={session.pending === "start_task"} onCancel={() => { setNewTaskOpen(false); setSwitchingFrom(null); setSwitchRequest(null); }}
              onStart={async input => {
                if (switching) {
                  if (!switchValid || !active) return false;
                  setSwitchRequest({input, id: switchingFrom, category: active.category});
                  return false;
                }
                if (active) return false;
                const saved = await session.start(input);
                if (saved) { setNewTaskOpen(false); setWorkDraft(emptyWorkDraft()); }
                return saved;
              }} />
          </section>
        )}
        <div className="home-footer">
          <button
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            待补全 {session.snapshot?.pending_count ?? "—"}
          </button>
        </div>
        <TodayWorkloadStrip items={today} error={todayError} onOpen={() => { void dashboard.open("today"); }} />
        {monitor?.idle_warning && (
          <p className="notice" role="status">
            已连续 {monitor.idle_warning_seconds} 秒没有输入，
            {monitor.idle_end_seconds} 秒时将自动结束。恢复操作后取消提醒。
          </p>
        )}
        {migrationFound && (
          <details className="auxiliary">
            <summary>发现预览版数据</summary>
            <button className="text-button" onClick={() => panel("data")}>
              查看并迁移
            </button>
          </details>
        )}
        <UiDialog
          open={!!switchRequest}
          onClose={() => {
            if (!session.busy) setSwitchRequest(null);
          }}
          id="switch-title"
          title="确认切换工作"
        >
          {switchRequest && (
            <>
              <p>
                结束并保存当前暂停的“{name(switchRequest.category)}”，再开始“
                {name(switchRequest.input.category)}”。原记录保留在待补全列表。
              </p>
              <div className="settings-actions">
                <button
                  className="secondary"
                  disabled={session.busy}
                  onClick={() => setSwitchRequest(null)}
                >
                  取消
                </button>
                <button
                  disabled={session.busy}
                  onClick={() => {
                    void session
                      .start(switchRequest.input, switchRequest.id)
                      .then((ok) => {
                        if (ok) { setSwitchRequest(null); setSwitchingFrom(null); setNewTaskOpen(false); setWorkDraft(emptyWorkDraft()); }
                      });
                  }}
                >
                  保存并开始
                </button>
              </div>
            </>
          )}
        </UiDialog>
        <UiDialog
          open={noteOpen && !!record}
          onClose={() => setNoteOpen(false)}
          id="note-title"
          title="任务详情与备注"
        >
          {record && (
            <>
              <p>
                {name(record.category)} · 数量 {formatQuantity(record.quantity)}
              </p>
              <p className="hint">开始 {formatTime(record.start_time)}</p>
              <p className="task-remark">
                {record.remark || "这项工作未填写备注。"}
              </p>
            </>
          )}
        </UiDialog>
      </main>
    </DesktopWindow>
  );
}
````

## UPDATE — E:\WorkMemo\src\AppearanceSettings.tsx

SHA256：`8afa129f308c5a70dcaf55a1cea9b296c7f7d09e4359193b5ecbcb2305d14c94`

````tsx
import type { PresentationController } from "./desktopPreferences";
import { Surface, useDraft } from "./Drafts";
import {
  MAX_OPACITY,
  MIN_OPACITY,
  THEME_IDS,
  THEMES,
  themeStyle,
} from "./themes";
import type { AppearanceController } from "./useAppearance";

export function AppearanceSettings({
  appearance,
  presentation,
  onClose = appearance.cancel,
}: {
  appearance: AppearanceController;
  presentation: PresentationController;
  onClose?: () => void;
}) {
  const busy = appearance.saving || presentation.busy;
  async function save() {
    if (busy) return false;
    if (
      JSON.stringify(appearance.current) !== JSON.stringify(appearance.saved) &&
      !(await appearance.save())
    )
      return false;
    if (presentation.dirty && !(await presentation.save())) return false;
    return true;
  }
  function cancel() {
    appearance.cancel();
    presentation.cancel();
  }
  useDraft(
    "appearance",
    JSON.stringify(appearance.current) !== JSON.stringify(appearance.saved) ||
      presentation.dirty,
    busy,
    save,
    cancel,
  );
  return (
    <Surface
      title="外观设置"
      onClose={onClose}
      actions={
        <>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={cancel}
          >
            取消预览
          </button>
          <button
            type="button"
            disabled={!appearance.native || busy || !presentation.loaded}
            onClick={() => {
              void save();
            }}
          >
            {busy ? "正在保存…" : "保存外观"}
          </button>
        </>
      }
    >
      <p className="hint">即时预览，保存后下次沿用。</p>
      <fieldset disabled={busy} className="theme-fieldset">
        <legend>选择皮肤</legend>
        <div className="theme-grid grid grid-cols-2 gap-3">
          {THEME_IDS.map((id) => (
            <button
              type="button"
              key={id}
              className="theme-choice"
              aria-pressed={appearance.current.theme === id}
              style={themeStyle({
                version: 1,
                theme: id,
                opacity: THEMES[id].defaultOpacity,
              })}
              onClick={() => appearance.selectTheme(id)}
            >
              <span className="theme-sample" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="theme-label">
                <strong>{THEMES[id].name}</strong>
                <span>
                  {appearance.current.theme === id ? "✓ " : ""}
                  {THEMES[id].description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="opacity-heading">
        <label htmlFor="appearance-opacity">背景不透明度</label>
        <output htmlFor="appearance-opacity">
          {appearance.current.opacity}%
        </output>
      </div>
      <input
        id="appearance-opacity"
        className="opacity-slider"
        type="range"
        min={MIN_OPACITY}
        max={MAX_OPACITY}
        step={1}
        value={appearance.current.opacity}
        disabled={busy}
        onChange={(event) =>
          appearance.changeOpacity(Number(event.target.value))
        }
      />
      <div className="opacity-scale">
        <span>更通透</span>
        <span>更实</span>
      </div>
      <button
        type="button"
        className="text-button reset-opacity"
        disabled={busy}
        onClick={appearance.resetOpacity}
      >
        恢复 {THEMES[appearance.current.theme].name} 默认透明度
      </button>
      <details className="help-disclosure"><summary>透明度说明</summary><p>只调节背景，文字和按钮保持清晰。切换皮肤会应用该皮肤默认值。</p></details>
      <section className="background-settings">
        <h3>图片背景</h3>
        <details className="help-disclosure"><summary>图片要求</summary><p>支持 PNG、JPEG、WebP，最多 10 MiB、1600万像素。用于主窗口与二级窗口，状态岛保持类别配色。</p></details>
        <div className="data-buttons">
          <button
            type="button"
            className="secondary"
            disabled={busy || !appearance.native}
            onClick={() => {
              void presentation.importImage();
            }}
          >
            {presentation.current.background ? "更换图片…" : "选择图片…"}
          </button>
          {presentation.current.background && (
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => presentation.setBackground(null)}
            >
              移除背景
            </button>
          )}
        </div>
        {presentation.current.background && (
          <label>
            图片透明度：{presentation.current.background.opacity}%
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              disabled={busy}
              value={presentation.current.background.opacity}
              onChange={(e) => {
                const bg = presentation.current.background;
                if (bg)
                  presentation.setBackground({
                    ...bg,
                    opacity: Number(e.target.value),
                  });
              }}
            />
          </label>
        )}
      </section>
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
      {!appearance.native && (
        <p className="notice">浏览器仅预览，不能保存桌面设置。</p>
      )}
      {appearance.loadError && (
        <p className="notice">原外观设置读取失败，当前为临时预览。</p>
      )}
      {appearance.saveError && (
        <p className="error-banner" role="alert">
          {appearance.saveError}
        </p>
      )}
    </Surface>
  );
}
````

## UPDATE — E:\WorkMemo\src\Dashboard.css

SHA256：`aaa78acd3215faa45ffc294afb28443c6a27a87a35d8f87fdc834cdda5a1fabe`

````css
/* Web-only layout. Ant Design owns control appearance, focus, motion and overlays. */
/* Keep specificity below the library's `html body` scroll locker. */
body:where(:has(.data-center)) {
  overflow: auto;
  background: #edf2ee;
}
/* Legacy desktop buttons use width:100%; web controls opt out without a global reset. */
.wm-ui-root .wm-btn:not(.wm-btn-icon-only),
.dc-sheet-root .wm-btn:not(.wm-btn-icon-only),
.wm-modal .wm-btn:not(.wm-btn-icon-only) {
  width: auto;
}
.data-center {
  min-height: 100vh;
  color: #243c33;
  background: #edf2ee;
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
}
.data-center *,
.dc-sheet-root * {
  box-sizing: border-box;
}
.data-center h1,
.data-center h2,
.dc-sheet-title h2 {
  margin: 0;
  font-weight: 650;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 16px;
}
.data-center p {
  margin: 0;
}
.data-center .icon,
.dc-sheet-root .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  font-size: 17px;
}
.data-center .work-badge,
.dc-sheet-root .work-badge {
  min-width: 0;
  gap: 9px;
  font-weight: 550;
}
.data-center .work-badge > span:last-child,
.dc-sheet-root .work-badge > span:last-child {
  white-space: normal;
  overflow-wrap: anywhere;
}
.data-center .work-symbol,
.dc-sheet-root .work-symbol {
  width: 30px;
  height: 30px;
  border-radius: 9px;
}
.data-center .work-symbol .icon,
.dc-sheet-root .work-symbol .icon {
  font-size: 16px;
}
.dc-sidebar {
  width: 68px;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  background: rgb(255 255 255 / 60%);
  border-right: 1px solid #e3ebe5;
}
.dc-brand {
  display: inline-flex;
  margin-bottom: 26px;
}
.dc-brand img {
  width: 36px;
  height: 36px;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding-top: 20px;
}
.connection-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #b48350;
  box-shadow: 0 0 0 4px #b4835010;
}
.connection-dot.connected {
  background: #37936d;
  box-shadow: 0 0 0 4px #37936d10;
}
.dc-page {
  margin-left: 68px;
}
.dc-topbar {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
  padding: 0 28px;
  background: rgb(255 255 255 / 65%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e3ebe5;
}
.dc-breadcrumb {
  font-size: 12px;
  color: #64796d;
  white-space: nowrap;
}
.dc-breadcrumb > span {
  color: #89998f;
  margin-left: 12px;
}
.dc-sync {
  display: inline-block;
  min-width: 118px;
  color: #89998f;
  font-size: 11px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dc-main {
  max-width: 1380px;
  margin: auto;
  padding: 28px 28px 0;
}
.dc-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}
.dc-eyebrow {
  display: block;
  font-size: 10px;
  letter-spacing: 0.16em;
  color: #86998d;
  margin-bottom: 6px;
  font-weight: 600;
}
.dc-heading h1 {
  font-size: 28px;
  line-height: 1.3;
  margin-bottom: 7px;
}
.dc-heading p {
  font-size: 13px;
  color: #718579;
}
.dc-notice {
  margin-block: 14px;
}
.dc-period-bar,
.dc-period-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.dc-period-nav {
  justify-content: flex-start;
}
.dc-period-nav strong {
  min-width: 154px;
  text-align: center;
  color: #355b46;
  font-size: 14px;
  font-weight: 550;
}
.dc-filter-form {
  display: flex;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}
.dc-filter-form > .wm-form-item {
  flex: 1 1 136px;
  min-width: 120px;
  margin-bottom: 0;
}
.dc-filter-form .wm-picker,
.dc-filter-form .wm-select {
  width: 100%;
}
.dc-filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filter-summary {
  border-top: 1px solid #edf2ee;
  margin-top: 16px;
  padding-top: 12px;
  min-height: 30px;
  font-size: 11px;
  color: #7b8e81;
  overflow-wrap: anywhere;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-block: 18px;
}
.dc-kpi-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #718579;
}
.dc-kpi-label .icon {
  color: #87a58f;
}
.dc-kpi strong {
  display: block;
  font-size: 30px;
  font-weight: 650;
  line-height: 1.6;
  color: #284d3a;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-kpi strong small {
  font-size: 12px;
  font-weight: 400;
  margin-left: 8px;
  color: #7b8e81;
}
.dc-kpi p {
  font-size: 11px;
  color: #7b8e81;
}
.dc-card {
  min-width: 0;
  margin-bottom: 18px;
}
.dc-card-title {
  padding-block: 16px;
  white-space: normal;
}
.dc-card-title p {
  margin-top: 4px;
  font-size: 11px;
  color: #7b8e81;
  font-weight: 400;
}
.dc-report-quantity strong {
  display: block;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.4;
  color: #284d3a;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.dc-report-quantity small {
  display: block;
  margin-top: 3px;
  font-size: 11px;
  color: #7b8e81;
}
.dc-number {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dc-date {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.dc-muted {
  color: #7b8e81;
  font-size: 12px;
}
.dc-report-note {
  padding: 14px 24px;
  color: #7b8e81;
  font-size: 11px;
}
.dc-report-cards {
  display: grid;
  gap: 12px;
  padding: 12px;
}
.dc-report-cards dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}
.dc-report-cards dt {
  font-size: 11px;
  color: #7b8e81;
  margin-bottom: 6px;
}
.dc-report-cards dd {
  margin: 0;
}
.dc-chart {
  width: 100%;
  height: 260px;
  overflow: hidden;
}
.dc-auxiliary {
  margin-bottom: 18px;
}
.dc-auxiliary small {
  margin-left: 10px;
}
.dc-auxiliary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.dc-auxiliary-grid > * {
  min-width: 0;
}
.dc-category .dc-chart {
  height: 180px;
}
.dc-calendar .dc-chart {
  height: 158px;
}
.dc-heat-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding-bottom: 8px;
  font-size: 10px;
  color: #7b8e81;
}
.dc-heat-legend i {
  width: 11px;
  height: 11px;
  border-radius: 2px;
  border: 1px solid #1f23281a;
}
.dc-records {
  scroll-margin-top: 80px;
  outline: none;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  flex-wrap: wrap;
}
.dc-pagination > span {
  color: #7b8e81;
  font-size: 11px;
}
.dc-page-footer {
  text-align: center;
  color: #899c8f;
  font-size: 11px;
  padding: 12px 0 28px;
}
.dc-loading {
  padding: 24px;
}
.dc-sheet-title h2 {
  font-size: 20px;
  color: #243c33;
}
.dc-sheet-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.dc-unsaved {
  font-size: 12px;
  color: #9c752f;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 18px;
  background: #f4f8f5;
  border: 1px solid #e6eee8;
  border-radius: 12px;
}
.dc-record-summary > div {
  margin-left: auto;
  text-align: right;
}
.dc-record-summary strong {
  display: block;
  font:
    600 24px/1.4 ui-monospace,
    monospace;
  color: #284d3a;
}
.dc-record-summary small {
  display: block;
  color: #7b8e81;
  font-size: 11px;
}
.dc-detail-times {
  margin-block: 22px;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #7b8e81;
}
.dc-detail-quantity strong {
  color: #284d3a;
  font-size: 24px;
  font-variant-numeric: tabular-nums;
}
.dc-detail-remark {
  padding: 16px;
  min-height: 76px;
  background: #f7faf8;
  border-radius: 10px;
  color: #526c5d;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
}
.dc-audit {
  margin-top: 22px;
}
.dc-segment {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
}
.dc-revision {
  padding-block: 12px;
  border-bottom: 1px solid #e9efeb;
  font-size: 12px;
  color: #65796f;
  overflow-wrap: anywhere;
}
.dc-revision p {
  margin-block: 8px 0;
  white-space: pre-wrap;
}
.dc-confirm-description {
  color: #65796f;
  line-height: 1.9;
  margin-block: 12px;
  overflow-wrap: anywhere;
}
@media (max-width: 1000px) {
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 20px;
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-breadcrumb > span,
  .dc-sync {
    display: none;
  }
  .dc-main {
    padding: 20px 16px 0;
  }
  .dc-topbar {
    padding-inline: 16px;
  }
}
@media (max-width: 640px) {
  .dc-main {
    padding-inline: 12px;
  }
  .dc-heading {
    align-items: flex-start;
  }
  .dc-heading h1 {
    font-size: 24px;
  }
  .dc-heading > .wm-tag {
    display: none;
  }
  .dc-period-bar {
    justify-content: center;
  }
  .dc-period-nav {
    justify-content: center;
    gap: 6px;
  }
  .dc-period-nav strong {
    min-width: 138px;
    font-size: 12px;
  }
  .dc-filter-form {
    gap: 12px;
  }
  .dc-filter-form > .wm-form-item {
    flex-basis: calc(50% - 6px);
    min-width: 0;
  }
  .dc-filter-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .dc-kpis {
    gap: 8px;
  }
  .dc-kpi .wm-card-body {
    padding: 12px 10px;
  }
  .dc-kpi strong {
    font-size: 23px;
  }
  .dc-kpi strong small {
    display: block;
    margin: 0;
    line-height: 1.4;
  }
  .dc-kpi-label {
    font-size: 11px;
  }
  .dc-kpi-label .icon {
    display: none;
  }
  .dc-kpi p {
    font-size: 10px;
    margin-top: 8px;
  }
  .dc-auxiliary small {
    display: block;
    margin-left: 0;
  }
  .dc-pagination {
    padding: 16px;
  }
  .dc-sheet-footer {
    flex-wrap: wrap;
  }
  .dc-sheet-footer > span {
    font-size: 11px;
  }
  .dc-report-note {
    padding-inline: 16px;
  }
}

/* Local browser translucency: the page canvas stays a normal browser surface. */
.data-center { background: linear-gradient(145deg, #f3f2eb, #e7efea 52%, #edf0f5); }
.data-center .wm-card { backdrop-filter: blur(12px); }
.dc-pending-list { display: grid; gap: 16px; min-width: 0; }
.dc-pending-list > p { color: #536b5b; }
.dc-pending-list .wm-table-cell { overflow-wrap: anywhere; }
.dc-pending-refresh { justify-self: start; }

.dc-pie .dc-chart { height:190px; }
.dc-pie-legend { list-style:none; margin:0; padding:0 4px 4px; display:grid; gap:2px; }
.dc-pie-legend .wm-btn { display:flex; align-items:center; width:100%; height:auto; min-height:30px; padding:4px 7px; gap:7px; }
.dc-pie-legend i { width:9px; height:9px; border-radius:50%; flex-shrink:0; }
.dc-pie-name { flex:1; min-width:0; text-align:left; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.dc-pie-value { flex-shrink:0; font-size:12px; font-variant-numeric:tabular-nums; }
@media (min-width:760px) and (max-width:1199px) {
  .dc-auxiliary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
  .dc-auxiliary-grid .dc-calendar { grid-column:1/-1; }
}
@media (max-width:759px) { .dc-auxiliary-grid { grid-template-columns:minmax(0,1fr); } }
````

## UPDATE — E:\WorkMemo\src\Dashboard.tsx

SHA256：`be954e2eb29a524b6ff7d7dff1a94e6ed20fe3005e8fa0a8ce7dc8fed7f3915f`

````tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  type InputRef,
  type TableColumnsType,
} from "antd";
import dayjs from "dayjs";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  shiftPeriod,
  reportRangeLabel,
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import { UiProvider, useMediaQuery } from "./ui/UiProvider";
import { BottomSheet } from "./ui/BottomSheet";
import {
  api,
  initialQuery,
  type CategoryTotal,
  type Detail,
  type Data,
  type Query,
  type Row,
} from "./dashboard/api";
import { useDashboardData } from "./dashboard/useDashboardData";
import { CalendarChart, CategoryChart, DurationPieChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

const minDate = dayjs("1970-01-01"),
  maxDate = dayjs("9999-12-31");
function RecordStatus({ row }: { row: Row }) {
  return (
    <Tag
      color={
        row.status !== "FINISHED"
          ? "processing"
          : row.settlement_status === "PENDING"
            ? "gold"
            : "success"
      }
    >
      {row.status !== "FINISHED"
        ? "进行中"
        : row.settlement_status === "PENDING"
          ? "待补全"
          : "已确认"}
    </Tag>
  );
}
function Title({ title, description }: { title: string; description?: string }) {
  return (
    <div className="dc-card-title">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
function DashboardContent() {
  const { message } = AntApp.useApp();
  const { name } = useCategoryNames();
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [refresh, setRefresh] = useState(0);
  const { data, meta, error, online, refreshing, updatedAt, loading } =
    useDashboardData(query, refresh);
  const [actionError, setActionError] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [detailStale, setDetailStale] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<Query | null>(null);
  const [pendingData, setPendingData] = useState<Data | null>(null);
  const [pendingError, setPendingError] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const selectedPending = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<InputRef>(null);
  const safeConfirmAction = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const recordsRef = useRef<HTMLElement>(null);
  const [confirmation, setConfirmation] = useState<"guard" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const next = useRef<(() => void) | null>(null);
  const afterConfirm = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const [section, setSection] = useState("overview");
  const [hideNavHints, setHideNavHints] = useState(false);
  const [navHint, setNavHint] = useState<string | null>(null);
  const navScrollFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(navScrollFrame.current), []);
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: name(value),
  }));
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const blocked = busy || confirmation !== null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0])
          setSection(entries[0].isIntersecting ? "records" : "overview");
      },
      { rootMargin: "-64px 0px -25% 0px" },
    );
    if (recordsRef.current) observer.observe(recordsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (editing && sheetOpen && !confirmation)
      quantityInput.current?.focus({ preventScroll: true });
  }, [editing, sheetOpen, confirmation, detail?.record.id]);
  function applyQuery(value: Query) {
    setFilters(value);
    setQuery(value);
  }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({
      ...filters,
      period,
      anchor_date:
        period === "custom"
          ? null
          : filters.anchor_date || data?.range.anchor_date || null,
      start_date: period === "custom" ? (data?.range.start_date ?? null) : null,
      end_date: period === "custom" ? (data?.range.end_date ?? null) : null,
      page: 1,
    });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    const shifted = anchor && shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  function leave(action: () => void) {
    if (busyRef.current || confirmation) return;
    if (dirty) {
      next.current = action;
      setConfirmation("guard");
      setConfirmOpen(true);
    } else action();
  }
  function showDetail(value: Detail, edit: boolean) {
    setDetail(value);
    setDetailStale(false);
    setFields({
      category: value.record.category,
      quantity: value.record.quantity === null ? "" : String(value.record.quantity),
      remark: value.record.remark,
    });
    setEditing(edit && value.record.status === "FINISHED");
    setSheetOpen(true);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current || detail) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setEditorError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      setPendingQuery(null);
      showDetail(value, edit);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const readPending = useCallback(async (criteria: Query) => {
    let list = await api<Data>("query", criteria);
    if (criteria.page > list.pages && list.pages > 0)
      list = await api<Data>("query", { ...criteria, page: list.pages });
    setPendingQuery({ ...criteria, page: list.page });
    setPendingData(list);
    setPendingError("");
  }, []);
  async function refreshPending(criteria: Query) {
    if (busyRef.current || !online) return;
    busyRef.current = true; setBusy(true);
    try { await readPending(criteria); }
    catch (e) { setPendingError(String(e instanceof Error ? e.message : e)); }
    finally { busyRef.current = false; setBusy(false); }
  }
  function returnToPending() {
    if (!pendingQuery) return;
    setDetail(null); setEditing(false); setEditorError("");
    void refreshPending(pendingQuery);
  }
  useEffect(() => {
    if (!sheetOpen || detail || !pendingData) return;
    const frame = requestAnimationFrame(() => {
      const id = selectedPending.current;
      const button = document.querySelector<HTMLElement>(`[data-pending-id="${id}"]`)
        ?? document.querySelector<HTMLElement>("[data-pending-id]")
        ?? document.querySelector<HTMLElement>(".dc-pending-refresh");
      button?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [sheetOpen, detail, pendingData]);
  async function selectPending(row: Row) {
    if (!pendingQuery || !pendingData || busyRef.current || !online) return;
    selectedPending.current = row.id;
    busyRef.current = true; setBusy(true); setPendingError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      const record = value.record;
      const date = localDate(new Date(record.start_time));
      if (record.status !== "FINISHED" || record.settlement_status !== "PENDING"
        || record.category !== pendingQuery.category
        || (pendingQuery.scope !== "all" && record.is_demo !== (pendingQuery.scope === "demo"))
        || (pendingData.range.start_date && date < pendingData.range.start_date)
        || (pendingData.range.end_date && date > pendingData.range.end_date)) {
        setPendingStatus("这条记录已变化，请重新选择。");
        await readPending(pendingQuery);
        return;
      }
      showDetail(value, true); setEditorError("");
    } catch (e) {
      // A removed row must not silently open a different record.
      try { await readPending(pendingQuery); }
      catch { /* Preserve the original error and offer an explicit retry. */ }
      setPendingError(e instanceof Error ? e.message : String(e));
    } finally { busyRef.current = false; setBusy(false); }
  }
  async function openCategoryPending(category: string) {
    if (busyRef.current || sheetOpen || !online) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const criteria: Query = { ...query, anchor_date: data?.range.anchor_date ?? query.anchor_date, category, status: "pending", page: 1 };
    setPendingQuery(criteria); setPendingData(null); setPendingError(""); setPendingStatus("");
    selectedPending.current = null; setSheetOpen(true);
    setActionError("");
    await refreshPending(criteria);
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    let committed = false;
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      committed = true;
      // A successful write remains successful if its follow-up read fails.
      const record: Row = {
        ...detail.record,
        ...result.input,
        settlement_status: "COMPLETE",
      };
      setDetail({ ...detail, record });
      setEditing(false);
      setDetailStale(true);
      setFields({
        category: record.category,
        quantity: String(record.quantity),
        remark: record.remark,
      });
      setRefresh((value) => value + 1);
      if (pendingQuery) {
        setDetail(null); setEditing(false); setEditorError("");
        setPendingStatus("工作量已保存，请选择下一条记录。");
        // A committed write stays committed even when refreshing the list fails.
        setPendingData(null);
        try { await readPending(pendingQuery); }
        catch (e) { setPendingError(`已保存，列表刷新失败：${e instanceof Error ? e.message : String(e)}`); }
        return true;
      }
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setDetailStale(false);
      void message.success({ content: "工作量已保存", key: "workload-save" });
      return true;
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      setEditorError(
        committed
          ? `已保存，详情刷新失败：${text}。请关闭后重新打开详情。`
          : text,
      );
      if (committed)
        void message.warning({
          content: "已保存，详情刷新失败",
          key: "workload-save",
        });
      return committed;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online, message, pendingQuery, readPending]);
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        editing &&
        sheetOpen &&
        !confirmation
      ) {
        event.preventDefault();
        void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, editing, sheetOpen, confirmation, save]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      setConfirmOpen(false);
      setRefresh((value) => value + 1);
      void message.success("记录已删除");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function closeConfirmation() {
    if (!busyRef.current) {
      next.current = null;
      afterConfirm.current = null;
      setConfirmOpen(false);
    }
  }
  function restoreTrigger() {
    requestAnimationFrame(() => {
      (trigger.current?.isConnected
        ? trigger.current
        : recordsRef.current
      )?.focus({ preventScroll: true });
    });
  }
  function pendingLink(row: CategoryTotal) {
    return row.pending > 0 ? <Button type="link" size="small" className="dc-pending-link"
      aria-label={`${name(row.category)}待补填${row.pending}条`} disabled={!online || busy || sheetOpen}
      onClick={() => { void openCategoryPending(row.category); }}>{row.pending} 条</Button>
      : <span className="dc-muted">0 条</span>;
  }
  const reportColumns: TableColumnsType<CategoryTotal> = [
    {
      title: "工作类型",
      dataIndex: "category",
      width: "29%",
      render: (value: string) => (
        <WorkBadge category={value} presentation={presentation} />
      ),
    },
    {
      title: "已确认工作量",
      key: "quantity",
      render: (_, row) => (
        <div className="dc-report-quantity">
          <strong>
            {row.complete > 0
              ? formatQuantity(row.quantity)
              : row.pending > 0
                ? "待补填"
                : "—"}
          </strong>
          <small>
            {row.complete > 0
              ? `已确认 ${row.complete} 条`
              : row.pending > 0
                ? "尚未确认产出"
                : "暂无已结束记录"}
          </small>
        </div>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "已结束记录",
      dataIndex: "records",
      render: (value: number) => <span className="dc-number">{value} 条</span>,
    },
    {
      title: "待补填",
      dataIndex: "pending",
      render: (_, row) => pendingLink(row),
    },
  ];
  const recordColumns: TableColumnsType<Row> = [
    {
      title: "类别",
      dataIndex: "category",
      width: 150,
      render: (value: string, row) => (
        <Space orientation="vertical" size={4}>
          <WorkBadge category={value} presentation={presentation} />
          {row.is_demo && <Tag color="gold">演示</Tag>}
        </Space>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      width: 170,
      render: (value: number) => (
        <span className="dc-date">{formatTime(value)}</span>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      width: 120,
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "工作量",
      key: "quantity",
      width: 110,
      render: (_, row) =>
        row.settlement_status === "COMPLETE" ? (
          <span className="dc-number">{formatQuantity(row.quantity)}</span>
        ) : (
          <span className="dc-muted">
            {row.status === "FINISHED" ? "待补填" : "进行中"}
          </span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_, row) => <RecordStatus row={row} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 190,
      ellipsis: true,
      render: (value: string) => (
        <span className="dc-muted">{value || "—"}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space size={2} className="dc-row-actions">
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => {
              void openDetail(row);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              void openDetail(row, true);
            }}
          >
            {row.settlement_status === "PENDING" ? "补填" : "编辑"}
          </Button>
          <Button
            type="text"
            danger
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              setEditorError("");
              setDeleting(row);
              setConfirmation("delete");
              setConfirmOpen(true);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const totals = data?.totals;
  const scrollBehavior = reduced ? "instant" : "smooth";
  const dateField = (
    label: string,
    value: string | null,
    change: (value: string | null) => void,
    required = false,
  ) => (
    <Form.Item label={label}>
      <DatePicker
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => change(date?.format("YYYY-MM-DD") ?? null)}
        inputReadOnly={false}
      />
    </Form.Item>
  );
  return (
    <div className="data-center">
      <aside className="dc-sidebar" inert={!!detail || !!confirmation}>
        <Tooltip title="WorkMemo 工作数据中心" placement="right">
          <a
            className="dc-brand"
            href="/dashboard"
            aria-label="WorkMemo 工作数据中心"
          >
            <img src="/workmemo.png" alt="" />
          </a>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[section]}
          tooltip={false}
          onMouseLeave={() => { setHideNavHints(false); setNavHint(null); }}
          onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHideNavHints(false); }}
          items={[
            {
              key: "overview",
              icon: <Tooltip title="工作总览" placement="right" trigger={[]} open={!hideNavHints && navHint === "overview"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="chart" /></span>
              </Tooltip>,
              label: "工作总览",
              onMouseEnter: () => setNavHint("overview"),
              onMouseLeave: () => setNavHint(null),
            },
            {
              key: "records",
              icon: <Tooltip title="工作明细" placement="right" trigger={[]} open={!hideNavHints && navHint === "records"}
                classNames={{ root: "dc-nav-tooltip" }} getPopupContainer={node => node.closest<HTMLElement>(".dc-sidebar") ?? document.body}
                styles={{ root: { pointerEvents: "none", visibility: hideNavHints ? "hidden" : undefined } }}>
                <span className="dc-nav-icon"><Icon name="list" /></span>
              </Tooltip>,
              label: "工作明细",
              onMouseEnter: () => setNavHint("records"),
              onMouseLeave: () => setNavHint(null),
            },
          ]}
          onClick={({ key, domEvent }) => {
            setHideNavHints(domEvent.type !== "keydown");
            setNavHint(null);
            cancelAnimationFrame(navScrollFrame.current);
            navScrollFrame.current = requestAnimationFrame(() => {
              // Commit the closed tooltip first, and cancel an older smooth scroll.
              window.scrollTo({ top: window.scrollY, behavior: "instant" });
              if (key === "records")
                recordsRef.current?.scrollIntoView({ behavior: scrollBehavior });
              else window.scrollTo({ top: 0, behavior: scrollBehavior });
            });
          }}
        />
        <div className="dc-sidebar-bottom">
          <Tooltip
            title={`${online ? "本机连接正常" : "等待本机连接"} · v${meta?.version ?? "0.2.4"}`}
            placement="right"
          >
            <span
              className={`connection-dot ${online ? "connected" : ""}`}
              role="img"
              aria-label={online ? "本机连接正常" : "等待本机连接"}
            />
          </Tooltip>
        </div>
      </aside>
      <div className="dc-page" inert={!!detail || !!confirmation}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync" aria-live="polite">
              {refreshing
                ? "正在刷新…"
                : updatedAt
                  ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
                  : "等待连接"}
            </span>
            <Button
              icon={<Icon name="refresh" />}
              onClick={() => setRefresh((value) => value + 1)}
            >
              刷新连接
            </Button>
          </Space>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>
            <Tag variant="filled">记录保存在本机</Tag>
          </div>
          {query.scope !== "real" && (
            <Alert
              className="dc-notice"
              type="warning"
              showIcon
              title={
                query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"
              }
              description="示例仅用于查看效果，日常真实统计默认排除。"
            />
          )}
          {(error || actionError) && (
            <Alert
              className="dc-notice"
              type="error"
              showIcon
              title={
                data && error ? "刷新失败，当前显示上次结果" : "操作未完成"
              }
              description={actionError || error}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setActionError("");
                    setRefresh((value) => value + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          )}
          {meta?.active && (
            <Alert
              className="dc-notice dc-active"
              type="info"
              showIcon
              title={
                <Space wrap>
                  <WorkBadge
                    category={meta.active.category}
                    presentation={presentation}
                  />
                  <span>
                    {meta.active.is_paused
                      ? "当前任务已暂停"
                      : "当前任务正在计时"}
                  </span>
                </Space>
              }
              description="结束后可在这里补填工作量，进行中的任务不计入已结束报表。"
            />
          )}
          <Card
            className="dc-filters"
            styles={{ body: { padding: narrow ? 16 : 20 } }}
          >
            <div className="dc-period-bar">
              <Segmented
                aria-label="统计周期"
                value={filters.period}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                  { value: "custom", label: "自定义" },
                ]}
                onChange={(value) => selectPeriod(value as ReportPeriod)}
              />
              {query.period !== "custom" && (
                <div className="dc-period-nav">
                  <Button
                    aria-label="上一周期"
                    icon={<Icon name="left" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, -1)
                    }
                    onClick={() => movePeriod(-1)}
                  />
                  <strong>
                    {data ? reportRangeLabel(data.range) : "正在读取周期…"}
                  </strong>
                  <Button
                    aria-label="下一周期"
                    icon={<Icon name="right" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, 1)
                    }
                    onClick={() => movePeriod(1)}
                  />
                  <Button
                    onClick={() =>
                      applyQuery({ ...query, anchor_date: null, page: 1 })
                    }
                  >
                    {
                      {
                        day: "今天",
                        week: "本周",
                        month: "本月",
                        custom: "当前",
                      }[query.period]
                    }
                  </Button>
                </div>
              )}
            </div>
            <Form
              layout="vertical"
              className="dc-filter-form"
              onFinish={() => applyQuery({ ...filters, page: 1 })}
            >
              {filters.period === "custom" ? (
                <>
                  {dateField("开始日期", filters.start_date, (value) =>
                    setFilters({ ...filters, start_date: value }),
                  )}
                  {dateField("结束日期", filters.end_date, (value) =>
                    setFilters({ ...filters, end_date: value }),
                  )}
                </>
              ) : (
                dateField(
                  "基准日期",
                  filters.anchor_date ??
                    data?.range.anchor_date ??
                    localDate(new Date()),
                  (value) => setFilters({ ...filters, anchor_date: value }),
                  true,
                )
              )}
              <Form.Item label="类别">
                <Select
                  aria-label="筛选工作类别"
                  value={filters.category ?? ""}
                  options={[
                    { value: "", label: "全部类别" },
                    ...categoryOptions,
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, category: value || null })
                  }
                />
              </Form.Item>
              <Form.Item label="状态">
                <Select
                  aria-label="筛选记录状态"
                  value={filters.status}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "pending", label: "待补全" },
                    { value: "complete", label: "已确认" },
                    { value: "working", label: "进行中" },
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                />
              </Form.Item>
              <Form.Item label="数据范围">
                <Select
                  aria-label="数据范围"
                  value={filters.scope}
                  options={[
                    { value: "real", label: "真实数据" },
                    { value: "demo", label: "演示数据" },
                    { value: "all", label: "全部数据" },
                  ]}
                  onChange={(value) => setFilters({ ...filters, scope: value })}
                />
              </Form.Item>
              <div className="dc-filter-actions">
                {filters.period === "custom" && (
                  <Button
                    onClick={() =>
                      applyQuery({
                        ...filters,
                        start_date: null,
                        end_date: null,
                        page: 1,
                      })
                    }
                  >
                    全部日期
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Icon name="search" />}
                >
                  应用筛选
                </Button>
              </div>
            </Form>
            <div className="dc-filter-summary">
              {JSON.stringify(filters) !== JSON.stringify(query)
                ? "筛选条件已修改，点击应用筛选后更新结果。"
                : `当前已应用 · ${data ? reportRangeLabel(data.range) : "正在读取周期"} · ${query.category ? name(query.category) : "全部类别"} · ${({ all: "全部状态", pending: "待补全", complete: "已确认", working: "进行中" } as Record<string, string>)[query.status]}`}
            </div>
          </Card>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals ? (totals.duration_ms / 3600000).toFixed(1) : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已结束记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "进行中的任务单独保留",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((item) => (
              <Card key={item.label} className="dc-kpi">
                <div className="dc-kpi-label">
                  <span>{item.label}</span>
                  <Icon name={item.icon} />
                </div>
                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
                <p>{item.caption}</p>
              </Card>
            ))}
          </section>
          <Card
            className="dc-card dc-category-report"
            title={
              <Title
                title="分类工作量"
                description={`${data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计`}
              />
            }
            styles={{ body: { padding: 0 } }}
          >
            {loading ? (
              <div className="dc-loading" role="status">
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              </div>
            ) : data ? (
              <>
                {narrow ? (
                  <div className="dc-report-cards">
                    {data.categories.map((row) => (
                      <Card
                        size="small"
                        key={row.category}
                        title={
                          <WorkBadge
                            category={row.category}
                            presentation={presentation}
                          />
                        }
                      >
                        <dl>
                          <div>
                            <dt>已确认工作量</dt>
                            <dd className="dc-report-quantity">
                              <strong>
                                {row.complete > 0
                                  ? formatQuantity(row.quantity)
                                  : row.pending > 0
                                    ? "待补填"
                                    : "—"}
                              </strong>
                              <small>
                                {row.complete > 0
                                  ? `已确认 ${row.complete} 条`
                                  : row.pending > 0
                                    ? "尚未确认产出"
                                    : "暂无已结束记录"}
                              </small>
                            </dd>
                          </div>
                          <div>
                            <dt>有效工时</dt>
                            <dd className="dc-number">
                              {formatDuration(row.duration_ms / 1000)}
                            </dd>
                          </div>
                          <div>
                            <dt>已结束记录</dt>
                            <dd>{row.records} 条</dd>
                          </div>
                          <div>
                            <dt>待补填</dt>
                            <dd>
                              {pendingLink(row)}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<CategoryTotal>
                    className="dc-report-table"
                    rowKey="category"
                    columns={reportColumns}
                    dataSource={data.categories}
                    pagination={false}
                    scroll={{ x: 680 }}
                  />
                )}
                <p className="dc-report-note">
                  按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。
                </p>
                {data.totals.records === 0 && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="这个范围还没有已结束记录"
                  />
                )}
              </>
            ) : (
              <Empty
                description="暂无统计结果，请检查连接后重试"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          <Card
            className="dc-card dc-trend"
            title={
              <Title
                title="工作趋势"
                description={`${data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时`}
              />
            }
            styles={{ body: { padding: "12px 8px 8px" } }}
          >
            {data ? (
              <TrendChart trend={data.trend} range={data.range} />
            ) : loading ? (
              <div className="dc-loading">
                <Skeleton active />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无趋势数据"
              />
            )}
          </Card>
          <Collapse
            className="dc-auxiliary"
            items={[
              {
                key: "analysis",
                label: "辅助分析",
                children: data ? (
                  <div className="dc-auxiliary-grid">
                    <Card
                      className="dc-category"
                      title={
                        <Title
                          title="工作分布"
                        />
                      }
                      extra={
                        <Select
                          aria-label="工作分布指标"
                          value={categoryMetric}
                          options={[
                            { value: "duration", label: "工时（小时）" },
                            { value: "quantity", label: "工作量" },
                          ]}
                          onChange={setCategoryMetric}
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CategoryChart
                        categories={data.categories}
                        presentation={presentation}
                        metric={categoryMetric}
                        onCategory={(label) => {
                          const key = CATEGORIES.find(
                            (value) => name(value) === label,
                          );
                          if (key)
                            applyQuery({ ...query, category: key, page: 1 });
                        }}
                      />
                    </Card>
                    <Card className="dc-pie" title={<Title title="工时占比" />} styles={{ body: { padding: 8 } }}>
                      <DurationPieChart categories={data.categories} presentation={presentation}
                        onCategory={category => applyQuery({ ...query, category, page: 1 })} />
                    </Card>
                    <Card
                      className="dc-calendar"
                      title={
                        <Title
                          title="工作的节奏"
                          description="近90天有效工时"
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CalendarChart
                        calendar={data.calendar}
                        range={data.range}
                      />
                      <div className="dc-heat-legend" aria-label="工时由少到多">
                        少{" "}
                        {[
                          "#ebedf0",
                          "#9be9a8",
                          "#40c463",
                          "#30a14e",
                          "#216e39",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}{" "}
                        多
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分析数据"
                  />
                ),
              },
            ]}
          />
          <section
            className="dc-records"
            id="records"
            ref={recordsRef}
            tabIndex={-1}
          >
            <Card
              className="dc-card"
              title={
                <Title
                  title="工作明细"
                />
              }
              extra={<Tag>{data ? data.record_count : "—"} 条记录</Tag>}
              styles={{ body: { padding: 0 } }}
            >
              {loading ? (
                <div className="dc-loading">
                  <Skeleton active paragraph={{ rows: 5 }} />
                </div>
              ) : (
                <Table<Row>
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={data?.records ?? []}
                  pagination={false}
                  scroll={{ x: 1010 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          error ? "未能读取工作明细" : "当前筛选没有工作记录"
                        }
                      />
                    ),
                  }}
                />
              )}
              <footer className="dc-pagination">
                <span>每页 50 条 · 共 {data?.pages ?? "—"} 页</span>
                <Pagination
                  current={data?.page ?? query.page}
                  total={data?.record_count ?? 0}
                  pageSize={50}
                  showSizeChanger={false}
                  size={narrow ? "small" : undefined}
                  onChange={(page) => applyQuery({ ...query, page })}
                />
              </footer>
            </Card>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      <BottomSheet
        open={sheetOpen}
        blocked={blocked}
        covered={!!confirmation}
        title={
          <div className="dc-sheet-title">
            <span className="dc-eyebrow">
              WORK RECORD {detail ? `#${detail.record.id}` : ""}
            </span>
            <h2>
              {pendingQuery && !detail ? "选择待补填记录" : editing ? "填写工作量" : "工作详情"}{" "}
              {detail?.record.is_demo && <Tag color="gold">演示数据</Tag>}
            </h2>
          </div>
        }
        drawerRender={(node) => (
          <div inert={!!confirmation} style={{ display: "contents" }}>
            {node}
          </div>
        )}
        onClose={() => leave(() => setSheetOpen(false))}
        afterOpenChange={(open) => {
          if (open && editing)
            quantityInput.current?.focus({ preventScroll: true });
          if (!open) {
            setDetail(null);
            setEditing(false);
            setEditorError("");
            setPendingQuery(null);
            setPendingData(null); setPendingError(""); setPendingStatus("");
            restoreTrigger();
          }
        }}
        footer={
          <div className="dc-sheet-footer">
            <span className={dirty ? "dc-unsaved" : "dc-muted"}>
              {pendingQuery?.category ? `${name(pendingQuery.category)} · ` : ""}
              {dirty ? "有未保存修改" : "数据保存在本机"}
            </span>
            <Space wrap>
              <Button
                disabled={blocked}
                onClick={() => leave(() => setSheetOpen(false))}
              >
                关闭
              </Button>
              {pendingQuery && detail && <Button disabled={blocked} onClick={() => leave(returnToPending)}>
                返回列表
              </Button>}
              {editing ? (
                <Button
                  key="save"
                  type="primary"
                  form="dc-editor"
                  htmlType="submit"
                  aria-label="保存工作量"
                  aria-busy={busy}
                  loading={busy ? { delay: 120 } : false}
                  disabled={!online || !!confirmation}
                >
                  保存工作量
                </Button>
              ) : detail ? (
                <Button
                  key="edit"
                  type="primary"
                  aria-label="编辑工作量"
                  disabled={
                    !online ||
                    blocked ||
                    detailStale ||
                    detail?.record.status !== "FINISHED"
                  }
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </Button>
              ) : null}
            </Space>
          </div>
        }
      >
        {pendingQuery && !detail && <section className="dc-pending-list" aria-label="待补填记录列表">
          <p>{name(pendingQuery.category ?? "")} · {pendingData ? reportRangeLabel(pendingData.range) : "当前已应用周期"} · 请选择具体记录</p>
          {pendingStatus && <Alert type={pendingStatus.startsWith("工作量已保存") ? "success" : "info"} title={pendingStatus} role="status" />}
          {pendingError && <Alert type="error" title={pendingError} showIcon />}
          <Button className="dc-pending-refresh" disabled={blocked || !online} loading={busy} onClick={() => { void refreshPending(pendingQuery); }}>刷新待补填列表</Button>
          {busy && !pendingData ? <Skeleton active /> : pendingData && <>
            <Table<Row> rowKey="id" pagination={false} dataSource={pendingData.records} scroll={{ x: 550 }}
              locale={{ emptyText: "当前分类在这个范围已没有待补填记录。" }} columns={[
                { title: "记录", key: "record", render: (_, row) => <><strong>#{row.id}</strong><div>{formatTime(row.start_time)}</div><div>至 {row.end_time ? formatTime(row.end_time) : "—"}</div></> },
                { title: "有效工时", key: "duration", render: (_, row) => formatDuration(row.duration_ms / 1000) },
                { title: "备注", dataIndex: "remark", render: (value: string) => value || "无备注" },
                { title: "操作", key: "action", render: (_, row) => <Button data-pending-id={row.id} aria-label={`补填记录${row.id}`} disabled={blocked || !online || !!pendingError} onClick={() => { void selectPending(row); }}>补填</Button> },
              ]} />
            <Pagination current={pendingData.page} total={pendingData.record_count} pageSize={50} showSizeChanger={false} disabled={blocked || !online}
              onChange={page => { void refreshPending({ ...pendingQuery, page }); }} />
          </>}
        </section>}
        {detail && (
          <div className="dc-detail-content">
            <div className="dc-record-summary">
              <WorkBadge
                category={detail.record.category}
                presentation={presentation}
              />
              <div>
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <small>有效工时</small>
              </div>
              <RecordStatus row={detail.record} />
            </div>
            <Descriptions
              className="dc-detail-times"
              size="small"
              column={narrow ? 1 : 2}
              items={[
                {
                  key: "start",
                  label: "开始",
                  children: formatTime(detail.record.start_time),
                },
                {
                  key: "end",
                  label: "结束",
                  children: detail.record.end_time
                    ? formatTime(detail.record.end_time)
                    : "尚未结束",
                },
              ]}
            />
            {editing ? (
              <Form
                id="dc-editor"
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category">
                  <Select
                    id="dc-category"
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) =>
                      setFields((previous) => ({
                        ...previous,
                        category: value,
                      }))
                    }
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  extra="0 表示已确认无产出；支持小数和科学计数，最大 10 亿。"
                >
                  <Input
                    id="dc-quantity"
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark">
                  <Input.TextArea
                    id="dc-remark"
                    maxLength={4000}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        remark: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <p className="dc-muted">
                  修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                </p>
              </Form>
            ) : (
              <div>
                <div className="dc-detail-quantity">
                  <span>已确认工作量</span>
                  <strong>
                    {detail.record.settlement_status === "COMPLETE"
                      ? formatQuantity(detail.record.quantity)
                      : detail.record.status === "FINISHED"
                        ? "待补填"
                        : "进行中"}
                  </strong>
                </div>
                <div className="dc-detail-remark">
                  {detail.record.remark || "未填写备注。"}
                </div>
              </div>
            )}
            {editorError && (
              <Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              />
            )}
            <Collapse
              className="dc-audit"
              items={[
                {
                  key: "segments",
                  label: `计时区间（${detail.segments.length}）`,
                  children: detail.segments.length ? (
                    detail.segments.map((segment) => (
                      <div className="dc-segment" key={segment.id}>
                        <span>
                          {formatTime(segment.start_time)}
                          <br />
                          {segment.end_time
                            ? formatTime(segment.end_time)
                            : "计时中"}
                        </span>
                        <strong className="dc-number">
                          {formatDuration(segment.duration_ms / 1000)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">
                      旧记录仅保留累计工时，没有可展示的区间。
                    </p>
                  ),
                },
                {
                  key: "revisions",
                  label: `修正记录（${detail.revisions.length}）`,
                  children: detail.revisions.length ? (
                    detail.revisions.map((revision) => (
                      <div className="dc-revision" key={revision.revision}>
                        <strong>
                          第 {revision.revision} 次 ·{" "}
                          {formatTime(revision.changed_at)}
                        </strong>
                        <p>
                          {name(revision.before?.category)} →{" "}
                          {name(revision.after?.category)} · 数量{" "}
                          {formatQuantity(revision.before?.quantity)} →{" "}
                          {formatQuantity(revision.after?.quantity)}
                        </p>
                        <p>
                          备注：{revision.before?.remark || "未填"} →{" "}
                          {revision.after?.remark || "未填"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">尚无修正。</p>
                  ),
                },
              ]}
            />
          </div>
        )}
      </BottomSheet>
      <Modal
        open={confirmOpen}
        centered
        width={460}
        zIndex={1200}
        mask={{ closable: false }}
        keyboard={!busy}
        closable={false}
        destroyOnHidden
        title={
          confirmation === "delete" ? "删除这条记录？" : "保留未保存的修改？"
        }
        onCancel={closeConfirmation}
        afterOpenChange={(open) => {
          if (open) safeConfirmAction.current?.focus({ preventScroll: true });
        }}
        afterClose={() => {
          setConfirmation(null);
          setDeleting(null);
          const action = afterConfirm.current;
          afterConfirm.current = null;
          action?.();
        }}
        footer={
          confirmation === "delete" ? (
            <Space>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                取消
              </Button>
              <Button
                danger
                type="primary"
                aria-label="确认删除"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void remove();
                }}
              >
                确认删除
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button
                type="primary"
                aria-label="保存并继续"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      afterConfirm.current = next.current;
                      next.current = null;
                      setConfirmOpen(false);
                    }
                  });
                }}
              >
                保存并继续
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  afterConfirm.current = next.current;
                  next.current = null;
                  setConfirmOpen(false);
                }}
              >
                放弃修改
              </Button>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                继续编辑
              </Button>
            </Space>
          )
        }
      >
        {confirmation === "delete" ? (
          <>
            <p className="dc-confirm-description">
              {deleting &&
                `${name(deleting.category)} · ${formatTime(deleting.start_time)}${deleting.is_demo ? " · 演示数据" : ""}`}
            </p>
            <p className="dc-confirm-description">
              删除后不可撤销，计时区间和修正记录也会一同删除。
            </p>
          </>
        ) : (
          <p className="dc-confirm-description">
            保存成功后再离开；保存失败会保留输入。
          </p>
        )}
        {editorError && (
          <Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          />
        )}
      </Modal>
    </div>
  );
}
export default function Dashboard() {
  return (
    <UiProvider>
      <DashboardContent />
    </UiProvider>
  );
}
````

## UPDATE — E:\WorkMemo\src\MonitoringSettings.tsx

SHA256：`b588246180a4b07303e044acc5509cb52e3e5f389f3ca1404361fdbf56cdf740`

````tsx
import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {emit} from "@tauri-apps/api/event";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES, type MonitorConfig } from "./types";
import {useLayout} from "./desktopPreferences";
import { Surface, useDraft } from "./Drafts";

type ConnectionStatus = { state: string; message: string; identifier: string; version: string; host_name: string; manifest_path: string | null; extension_path: string | null };

export function MonitoringSettings({ open, onClose, refreshVersion = 0 }: { open: boolean; onClose: () => void; refreshVersion?: number }) {
  const { name } = useCategoryNames();
  const compact=useLayout().current.density==="compact";
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [baseline,setBaseline]=useState("");
  const [retry, setRetry] = useState(0);
  const nextRuleId = useRef(-1);
  const saving = useRef(false);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const readRevision = useRef(0);
  const dirty = !!config && JSON.stringify(config) !== baseline;
  const currentDraft = useRef({ dirty, busy });
  currentDraft.current = { dirty, busy };
  useEffect(() => {
    if (busy) return;
    const focused = restoreFocus.current;
    restoreFocus.current = null;
    if (focused?.isConnected && !document.hidden && document.activeElement === document.body && !document.querySelector("dialog[open]")) {
      focused.focus({ preventScroll: true });
    }
  }, [busy]);
  function addRule(category: string) {
    if (busy) return;
    const id = nextRuleId.current--;
    setConfig(previous => previous && previous.rules.length < 50 ? {
      ...previous, rules: [...previous.rules, {id, category, url_prefix: "", match_mode: "path_prefix"}],
    } : previous);
  }
  useEffect(() => {
    if (!open || !isTauri()) return;
    let stale = false;
    const request = ++readRevision.current;
    void invoke<ConnectionStatus>("get_connection_status").then(value => { if (!stale) setConnection(value); }).catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    // Keep the existing form mounted while a clean external refresh is in flight.
    void invoke<MonitorConfig>("get_monitor_config").then(value => {
      if (!stale && request === readRevision.current && !currentDraft.current.dirty && !saving.current) {
        setConfig(value); setBaseline(JSON.stringify(value)); setError("");
      }
    })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, retry, refreshVersion]);
  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (!config || saving.current) return false;
    restoreFocus.current = document.activeElement instanceof HTMLElement && document.activeElement.closest("#monitor-form")
      ? document.activeElement : null;
    saving.current = true;
    readRevision.current++;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await invoke<MonitorConfig>("save_monitor_config", { input: {
        enabled: config.enabled, expected_revision: config.revision, times: config.times,
        poll_interval_seconds: config.poll_interval_seconds, auto_resume_manual: config.auto_resume_manual,
        rules: config.rules.map(({ url_prefix, category, match_mode }) => ({ url_prefix, category, match_mode })),
      } });
      setConfig(saved); setBaseline(JSON.stringify(saved));setNotice("配置已保存。请在 Chrome 扩展中同步工作站点授权。");
      void emit("workmemo:data-changed", { source: "monitor-settings" }).catch((failure: unknown) => setNotice(`配置已保存，窗口同步失败：${String(failure)}`));
      return true;
    } catch (failure: unknown) { setError(String(failure));return false; }
    finally { saving.current = false; setBusy(false); }
  }
  useDraft("monitor",dirty,busy,()=>save(),()=>{if(baseline)setConfig(JSON.parse(baseline));});
  return <Surface onClose={onClose} title="自动工作监测" actions={<button form="monitor-form" type="submit" disabled={busy||!config}>{busy?"正在保存…":"保存监测配置"}</button>}>
    {!isTauri() && <p className="notice">请在 Windows 桌面程序中配置监测。</p>}
    {error && <p className="error-banner" role="alert">{error}</p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {!config && isTauri() && <button className="secondary" type="button" onClick={() => setRetry(value => value + 1)}>读取监测配置</button>}
    {isTauri() && <details className="monitor-diagnostics" open={!compact}><summary>浏览器连接与诊断</summary>
      <p role="status">{connection?.message ?? "正在检查本机连接…"}</p>
      {connection && <details><summary>连接详情</summary><p className="hint">版本 {connection.version} · {connection.identifier}<br />主机 {connection.host_name}<br />清单 {connection.manifest_path ?? "尚未就绪"}</p></details>}
      <button type="button" className="secondary" disabled={repairing} onClick={() => {
        setRepairing(true); setError("");
        void invoke<ConnectionStatus>("repair_browser_connection").then(setConnection).catch((failure: unknown) => setError(String(failure))).finally(() => setRepairing(false));
      }}>{repairing ? "正在修复…" : "修复本机连接"}</button>
      <button type="button" className="text-button" onClick={() => { void invoke("open_browser_extension").catch((failure: unknown) => setError(String(failure))); }}>打开配套扩展文件夹</button>
      <details className="help-disclosure"><summary>连接说明</summary><p>Chrome 扩展需加载一次配套目录。程序启动时会检查并修复当前用户的本机主机注册。</p></details>
    </details>}
    {config && <form id="monitor-form" className="monitor-settings grid gap-4" onSubmit={(event) => { void save(event); }}>
      <label className="monitor-toggle"><input type="checkbox" checked={config.enabled} disabled={busy}
        onChange={event => setConfig({ ...config, enabled: event.target.checked })} />启用工作页面自动识别</label>
      <p className="hint">确认开工后才计时；仅浏览不计时。</p>
      <fieldset className="monitor-rule"><legend>识别与恢复</legend>
        <label>浏览器状态检查间隔（秒）<select value={config.poll_interval_seconds} disabled={busy}
          onChange={event => setConfig({ ...config, poll_interval_seconds: Number(event.target.value) })}>
          {[1, 2, 3, 4, 5].map(seconds => <option key={seconds} value={seconds}>{seconds} 秒</option>)}
        </select></label>
        <label className="monitor-toggle"><input type="checkbox" checked={config.auto_resume_manual} disabled={busy}
          onChange={event => setConfig({ ...config, auto_resume_manual: event.target.checked })} />返回工作页面并产生新操作后，自动恢复手动暂停的任务</label>
        <details className="help-disclosure"><summary>识别与恢复说明</summary>
          <p>检查越频繁，后台活动越多；系统忙碌时可能延迟。自动恢复沿用原任务，需要可信页面连接和新输入；关闭后需手动继续。</p>
        </details>
      </fieldset>
      <details className="advanced-settings" open={!compact}><summary>计时参数（秒）</summary><fieldset className="monitor-rule"><legend className="sr-only">计时参数</legend>
        {([
          ["away_pause_seconds", "离开工作页面后继续计时"],
          ["hold_seconds", "暂停后保留记录"],
          ["idle_pause_seconds", "键鼠无操作后暂停"],
          ["idle_warning_seconds", "无输入后提醒"],
          ["idle_end_seconds", "无输入后结束"],
        ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min={1} max={86400} step={1} required disabled={busy}
          value={config.times[key]} onChange={event => setConfig({ ...config, times: { ...config.times, [key]: event.target.valueAsNumber } })} /></label>)}
        <p className="hint">每项 1–86400 秒；空闲暂停、提醒须早于结束。</p>
        <details className="help-disclosure"><summary>计时规则说明</summary><p>空闲暂停扣除最后输入后的尾段。手动任务有新输入即恢复，自动任务须返回工作页面操作。离页宽限后暂停，保留期结束后结束记录；空闲结束可能更早发生。连接中断时不计入无法确认的时间，手动计时同样受空闲保护。</p></details>
      </fieldset>
      </details>
      <section className="monitor-work-sites" aria-label="每项工作的多个网址">
        <h3>工作与网址</h3>
        <p className="hint">同一工作可配置多个网址。</p>
        {CATEGORIES.map(category => {
          const rules = config.rules.filter(rule => rule.category === category);
          return <details key={category} className="monitor-work-group" open={rules.length > 0} aria-label={`${name(category)}工作网址`}>
            <summary><strong>{name(category)}</strong><span>{rules.length} 个 URL</span></summary>
            <div className="monitor-work-urls">
              {rules.length === 0 && <p className="hint">还没有网址，添加这项工作需要使用的网站。</p>}
              {rules.map((rule, index) => <fieldset key={rule.id} className="monitor-rule">
                <legend>网址 {index + 1}</legend>
                <label>匹配模式<select disabled={busy} value={rule.match_mode ?? "path_prefix"} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, match_mode: event.target.value as typeof rule.match_mode } : item) })}>
                  <option value="path_prefix">路径前缀</option><option value="origin">整个站点</option><option value="domain_suffix">域名后缀（含子域名）</option>
                </select></label>
                <label>{rule.match_mode === "domain_suffix" ? "域名后缀" : "工作 URL"}<input type={rule.match_mode === "domain_suffix" ? "text" : "url"} required maxLength={2048} disabled={busy} value={rule.url_prefix}
                  placeholder={rule.match_mode === "domain_suffix" ? ".cn-beijing-vpc.fcapp.run" : "https://工作站点/路径"} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, url_prefix: event.target.value } : item) })} /></label>
                <label>归属工作<select value={rule.category} disabled={busy} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, category: event.target.value } : item) })}>
                  {CATEGORIES.map(value => <option key={value} value={value}>{name(value)}</option>)}
                </select></label>
                <button type="button" className="text-button" disabled={busy} onClick={() => setConfig({ ...config, rules: config.rules.filter(item => item.id !== rule.id) })}>移除此 URL</button>
              </fieldset>)}
              <button type="button" className="secondary" disabled={busy || config.rules.length >= 50} onClick={() => addRule(category)}>为{name(category)}添加 URL</button>
            </div>
          </details>;
        })}
        <p className="hint">最多 50 条 URL；保存后请在扩展中同步站点授权。</p>
      </section>
      <p className="hint">保存会暂停当前自动记录；返回工作页操作后恢复。</p>
      <details className="help-disclosure"><summary>网址匹配说明</summary><p>路径前缀限定站点与路径边界；整个站点覆盖该来源全部路径；域名后缀覆盖该域名与子域名。查询参数和片段不参与匹配。同一工作的网址间切换保留原记录，移除网址不影响其余规则。</p></details>

      <details><summary>连接与隐私说明</summary>
        <p className="hint">第一版配套 Chrome 扩展。安装扩展和本机通信主机后，在扩展面板同步已配置站点授权。只传规则标识、前台匹配状态、连接状态和页面活动信号；不传 URL、网页内容或输入文本。连接断开时暂停自动累计。</p>
        <p className="hint">离开工作页面后按设置暂停并保留记录。空闲结束时扣除最后输入后的尾段，阅读或思考可能少计，可稍后人工修正。</p>
      </details>
    </form>}
  </Surface>;
}
````

## UPDATE — E:\WorkMemo\src\NotificationApp.tsx

SHA256：`9afd89131616a38700e166f1d867a47ae56389c91914e0cd038bf8855d2dc0fd`

````tsx
import { useCategoryNames } from "./categoryNames";
import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { useWorkSession } from "./useWorkSession";
import { themeStyle } from "./themes";
import { formatDuration, type WorkNotice, type WorkRecord } from "./types";
import { DraftContext, type Draft } from "./Drafts";
import { SettlementForm } from "./SettlementPanel";
import { IslandExpansion } from "./IslandExpansion";
import { islandView } from "./islandView";
import "./App.css";

export function NotificationApp() {
  const session = useWorkSession();
  const snapshot = session.snapshot;
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [editing, setEditing] = useState<WorkRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  const draft = useRef<Draft | null>(null);
  const editingRef = useRef(editing); editingRef.current = editing;
  const revision = useRef(0);
  const seen = useRef("");
  const busy = session.busy || deferring;
  const [dirty, setDirty] = useState(false);
  const registerDraft = useCallback((_id: string, value: Draft | null) => {
    draft.current = value; setDirty(!!value?.dirty);
  }, []);
  useEffect(() => {
    void invoke("set_window_dirty", { dirty: dirty || busy }).catch(e => setError(String(e)));
  }, [dirty, busy]);
  useEffect(() => () => { void invoke("set_window_dirty", { dirty: false }).catch(() => {}); }, []);
  useEffect(() => {
    let stopped = false, reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      const request = revision.current;
      try {
        const value = await invoke<WorkNotice | null>("get_notice");
        if (!stopped && request === revision.current) { setNotice(value); setReadError(""); }
      } catch (e) { if (!stopped) setReadError(String(e)); }
      finally { reading = false; }
    }
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    const unlisten = listen("workmemo:appearance-changed", () => { void appearance.reload(); });
    return () => { stopped = true; clearInterval(timer); void unlisten.then(fn => fn()); };
  }, [appearance.reload]);
  const { active, candidate, notice: visibleNotice, key } = islandView(snapshot, notice);
  useEffect(() => {
    if (key === seen.current) return;
    seen.current = key;
    if (key && !editingRef.current) setExpanded(true);
    if (!key && !editingRef.current) setExpanded(false);
  }, [key]);
  const monitor = snapshot?.monitoring;
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲暂停" : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";

  async function later(force = false) {
    if (busy) return;
    if (draft.current?.dirty && !force) { setDiscard(true); return; }
    setDeferring(true); setError("");
    try {
      if (editing) await invoke("defer_notice", { id: editing.id, kind: "ended" });
      else if (visibleNotice) await invoke("defer_notice", { id: visibleNotice.record.id, kind: visibleNotice.kind });
      revision.current++;
      if (!editing || notice?.record.id === editing.id) setNotice(null);
      setDiscard(false); setExpanded(false);
      setDirty(false);
    } catch (e) { setError(String(e)); }
    finally { setDeferring(false); }
  }
  const latestLater = useRef(later); latestLater.current = later;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const unlisten = listen("workmemo:request-close", () => {
      if (busyRef.current) { setError("正在保存，请稍候。"); return; }
      void latestLater.current();
    });
    return () => { void unlisten.then(fn => fn()); };
  }, []);
  const combinedError = error || session.commandError || session.connectionError || readError;
  return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}>
    <div className="app-shell island-shell">
      <div className="island-main-row">
        <div className="island-drag" role="group" aria-label="拖动状态岛" onMouseDown={event => {
          if (event.button === 0) void getCurrentWindow().startDragging().then(() => invoke("fit_island_position")).catch(e => setError(String(e)));
        }}>
          {active || candidate || monitor?.browse_category ? <WorkBadge category={active?.category ?? candidate?.category ?? monitor?.browse_category ?? "开发"} presentation={presentation.current} showName={false} /> : <span className="work-symbol"><Icon name="read" /></span>}
          <span className="island-info"><strong>{active ? name(active.category) : candidate ? name(candidate.category) : visibleNotice?.kind === "ended" ? "工作已结束" : "仅浏览"}</strong>
            <small>{snapshot ? visibleNotice?.kind === "ended" ? "结果已保存 · 待填写工作量" : state : "状态不可用"}</small></span>
          {active && <strong className="island-time">{formatDuration(active.duration_seconds)}</strong>}
        </div>
        {candidate && <button type="button" className="island-action" aria-label="开始识别的工作" title={`开始记录 · ${name(candidate.category)}`} disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}><Icon name="play" /></button>}
        {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || !!session.connectionError || active.recovery_pending} onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}><Icon name={active.is_paused ? "play" : "pause"} /></button>}
        {!candidate && monitor?.browsing_only && <button type="button" className="island-action" aria-label={active ? "继续记录" : "开始记录"} disabled={busy || !monitor.browse_ready || !!active?.recovery_pending || !!session.connectionError} onClick={() => { void session.confirmWork(null); }}><Icon name="play" /></button>}
        {(visibleNotice || candidate || editing || combinedError || (snapshot?.pending_count ?? 0) > 0) && <button type="button" className="island-action island-expand" aria-expanded={expanded} title={expanded ? "收起展开区域" : "展开工作提醒"} aria-label={expanded ? "收起展开区域" : "展开工作提醒"} onClick={() => {
          if (expanded && editing) { void later(); return; }
          setExpanded(value => !value);
        }}><Icon name={expanded ? "left" : "right"} /></button>}
        <button type="button" className="island-open" aria-label="打开WorkMemo" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}><Icon name="open" /></button>
      </div>
      <IslandExpansion open={expanded} onError={setError} onCollapsed={() => { setEditing(null); setDiscard(false); setDirty(false); }}>
        {dashboard.fallback}
        {combinedError && <p className="inline-error" role="alert">{combinedError}</p>}
        {editing ? <>
          <h2>填写工作量 · {name(editing.category)}</h2>
          {discard && <div className="island-discard" role="alert"><p>放弃本次未保存的填写？原记录仍在待补全列表。</p><button type="button" disabled={busy} onClick={() => { void later(true); }}>放弃填写并收起</button><button type="button" className="secondary" onClick={() => setDiscard(false)}>继续填写</button></div>}
          <DraftContext.Provider value={registerDraft}><SettlementForm compact key={editing.id} record={editing} busy={busy}
            onSave={async input => {
              const saved = await session.settle(input);
              if (saved) {
                revision.current++;
                setNotice(current => current?.record.id === input.id ? null : current);
                setDirty(false); setExpanded(false);
              }
              return saved;
            }} /></DraftContext.Provider>
          <button className="text-button" type="button" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
          {session.commandError && <button className="text-button" type="button" onClick={() => { void dashboard.open("pending"); }}>打开待补全列表核对</button>}
        </> : candidate ? <section aria-label="开工确认"><h2>开始记录 · {name(candidate.category)}</h2><p>已匹配工作网址，确认前不计时。</p><div className="island-buttons"><button disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}>开始记录</button><button className="secondary" disabled={busy} onClick={() => { void session.browse(); }}>仅浏览</button></div></section> : visibleNotice?.kind === "ended" ? <section aria-label="工作结束提醒">
          <h2>本次工作已结束</h2><p>{name(visibleNotice.record.category)} · 有效工时 {formatDuration(visibleNotice.record.duration_seconds)}</p>
          <div className="island-buttons"><button type="button" disabled={busy || !!session.connectionError} onClick={() => { setEditing(visibleNotice.record); setExpanded(true); }}>填写工作量</button><button className="secondary" type="button" disabled={busy} onClick={() => { void later(); }}>稍后</button></div>
        </section> : visibleNotice?.kind === "idle" ? <section aria-label="空闲提醒">
          <h2>空闲提醒</h2><p>连续 {formatDuration(visibleNotice.idle_warning_seconds)} 无输入；到达 {formatDuration(visibleNotice.idle_end_seconds)} 时结束计时，最后输入后的尾段不计入工时。</p>
          <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了</button>
        </section> : null}
        {!editing && (snapshot?.pending_count ?? 0) > 0 && <button type="button" className="text-button" onClick={() => { void dashboard.open("pending"); }}>待补全 {snapshot?.pending_count}</button>}
      </IslandExpansion>
      {combinedError && !expanded && <span className="island-error" role="alert" aria-label={combinedError} title={combinedError}>!</span>}
    </div>
  </div>;
}
````

## UPDATE — E:\WorkMemo\src\SettingsExtras.tsx

SHA256：`5b8b1020015ab1f4f60c6c4b5896e8fc7ac2b2b75d72c48cfcacd3d29be09b13`

````tsx
import { CategoryNamesEditor } from "./CategoryNamesEditor";
import { StartupSetting } from "./StartupSetting";
import { useCategoryNames } from "./categoryNames";
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { CATEGORIES } from "./types";
import {
  DEFAULT_LAYOUT,
  useLayout,
  WORK_ICONS,
  WorkBadge,
  type LayoutSettings,
  type PresentationController,
} from "./desktopPreferences";
const iconLabels: Record<string, string> = {
  checkSquare: "检查",
  safety: "盾牌",
  code: "代码",
  note: "文档",
  search: "搜索",
  chart: "图表",
  list: "清单",
  clock: "时钟",
  star: "星标",
  rocket: "火箭",
  bulb: "灵感",
  tool: "工具",
  read: "阅读",
  check: "完成",
  home: "主页",
  settings: "设置",
};
export function VisualSettings({
  presentation,
}: {
  presentation: PresentationController;
}) {
  const { name } = useCategoryNames();
  const { current, setVisual } = presentation;
  const compact = useLayout().current.density === "compact";
  useDraft(
    "category-visuals",
    presentation.dirty,
    presentation.busy,
    presentation.save,
    presentation.cancel,
  );
  return (
    <Surface
      title="工作名称、图标与颜色"
      actions={
        <>
          <button
            className="secondary"
            disabled={presentation.busy}
            onClick={presentation.cancel}
          >
            取消预览
          </button>
          <button
            disabled={presentation.busy || !presentation.loaded || !isTauri()}
            onClick={() => {
              void presentation.save();
            }}
          >
            保存工作外观
          </button>
        </>
      }
    >
      <p className="hint">
        同一类别在主页、状态岛和数据中心使用相同的图标与颜色。
      </p>
      <CategoryNamesEditor />
      {CATEGORIES.map((category) => {
        const visual = current.categories[category];
        return (
          <fieldset key={category} className="visual-category">
            <legend>
              <WorkBadge category={category} presentation={current} />
            </legend>
            <label className="color-field">
              类别颜色
              <input
                aria-label={`${name(category)}颜色`}
                type="color"
                value={visual.color}
                disabled={presentation.busy}
                onChange={(e) =>
                  setVisual(category, { ...visual, color: e.target.value })
                }
              />
              <span>{visual.color}</span>
            </label>
            <details open={!compact}>
              <summary>选择图标：{iconLabels[visual.icon]}</summary>
              <div className="icon-picker">
                {WORK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={iconLabels[icon]}
                    aria-label={`${name(category)}使用${iconLabels[icon]}图标`}
                    aria-pressed={visual.icon === icon}
                    className="secondary"
                    disabled={presentation.busy}
                    onClick={() => setVisual(category, { ...visual, icon })}
                  >
                    <Icon name={icon} />
                  </button>
                ))}
              </div>
            </details>
          </fieldset>
        );
      })}
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
    </Surface>
  );
}
export function LayoutPanel() {
  const layout = useLayout();
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [saved, setSaved] = useState(DEFAULT_LAYOUT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  useEffect(() => {
    if (layout.loaded && !dirty && !busy) {
      setCurrent(layout.current);
      setSaved(layout.current);
    }
  }, [layout.current, layout.loaded]);
  async function save() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<LayoutSettings>("set_layout_options", {
        input: {
          density: current.density,
          sound_enabled: current.sound_enabled,
          sound_theme: current.sound_theme,
          font_size: current.font_size,
          font_weight: current.font_weight,
          line_spacing: current.line_spacing,
          expected_revision: saved.revision,
        },
      });
      setSaved(result);
      setCurrent(result);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  useDraft("layout", dirty, busy, save, () => {
    setCurrent(saved);
    setError("");
  });
  function field<K extends keyof LayoutSettings>(
    name: K,
    value: LayoutSettings[K],
  ) {
    setCurrent((p) => ({ ...p, [name]: value }));
  }
  return (
    <Surface
      title="布局、字体与音效"
      actions={
        <button
          disabled={busy || !layout.loaded || !isTauri()}
          onClick={() => {
            void save();
          }}
        >
          保存布局
        </button>
      }
    >
      <div className="layout-form">
        <StartupSetting />
        <label className="monitor-toggle"><input type="checkbox" checked={current.sound_enabled} disabled={busy} onChange={e => field("sound_enabled", e.target.checked)}/>关键状态提示音</label>
        <label>提示音套装<select aria-label="提示音套装" value={current.sound_theme??"fiftysounds"} disabled={busy} onChange={event=>field("sound_theme",event.target.value as LayoutSettings["sound_theme"])}>
          <option value="fiftysounds">FiftySounds · 默认</option><option value="soft">柔和轻提示</option><option value="crisp">清脆短提示</option>
        </select></label>
        <div className="sound-preview-buttons" aria-label="分别试听提示音">
          {([["start","开始"],["pause","暂停"],["resume","恢复"],["end","结束"],["warning","空闲提醒"]] as const).map(([cue,label])=><button key={cue} type="button" className="secondary" disabled={!isTauri()||busy} onClick={()=>{void invoke("preview_sound",{theme:current.sound_theme??"fiftysounds",cue}).catch(e=>setError(String(e)));}}>试听{label}</button>)}
        </div>
        <p className="hint">保存布局后应用；试听忽略静音开关。</p>
        <label>
          界面模式
          <select
            disabled={busy}
            value={current.density}
            onChange={(e) =>
              field("density", e.target.value as LayoutSettings["density"])
            }
          >
            <option value="comfortable">舒展 · 完整信息</option>
            <option value="compact">紧凑 · 极简信息</option>
          </select>
        </label>
        <details className="help-disclosure"><summary>界面模式说明</summary><p>紧凑模式收起辅助信息；错误与恢复提醒始终可见。</p></details>
        <label>
          正文字号：{current.font_size}px
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={current.font_size}
            disabled={busy}
            onChange={(e) => field("font_size", Number(e.target.value))}
          />
        </label>
        <label>
          文字粗细
          <select
            disabled={busy}
            value={current.font_weight}
            onChange={(e) => field("font_weight", Number(e.target.value))}
          >
            {[
              [400, "常规"],
              [500, "中等"],
              [600, "半粗"],
              [700, "加粗"],
            ].map(([v, n]) => (
              <option value={v} key={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          行距
          <select
            disabled={busy}
            value={current.line_spacing}
            onChange={(e) =>
              field(
                "line_spacing",
                e.target.value as LayoutSettings["line_spacing"],
              )
            }
          >
            <option value="tight">紧密</option>
            <option value="standard">标准</option>
            <option value="loose">宽松</option>
          </select>
        </label>
        <div
          className="font-preview"
          style={{
            fontSize: current.font_size,
            fontWeight: current.font_weight,
            lineHeight: { tight: 1.35, standard: 1.6, loose: 1.85 }[
              current.line_spacing
            ],
          }}
        >
          把注意力留给手上的事。
          <br />
          计时、类别和操作，清楚就好。
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void invoke("reset_window_layout")
              .then(() => invoke<LayoutSettings>("get_layout_settings"))
              .then((result) => {
                setCurrent(result);
                setSaved(result);
                void layout.reload();
              })
              .catch((e) => setError(String(e)))
              .finally(() => setBusy(false));
          }}
        >
          恢复所有窗口默认布局
        </button>
      </div>
      {(error || layout.error) && (
        <p className="error-banner" role="alert">
          {error || layout.error}
        </p>
      )}
    </Surface>
  );
}
````

## UPDATE — E:\WorkMemo\src\SettlementPanel.tsx

SHA256：`0675efec04630bed0363da806c3adbc8f478521d128415c34d3edf6bbc433e24`

````tsx
import { useCategoryNames } from "./categoryNames";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
  type WorkRecord,
} from "./types";
import { validateWorkInput } from "./workInput";

export function SettlementForm({
  record,
  busy,
  onSave,
  externalActions = false,
  compact = false,
}: {
  compact?: boolean;
  externalActions?: boolean;
  record: WorkRecord;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
}) {
  const { name } = useCategoryNames();
  const [category, setCategory] = useState(record.category);
  const [quantity, setQuantity] = useState(
    record.quantity === null ? "" : String(record.quantity),
  );
  const [remark, setRemark] = useState(record.remark);
  const [error, setError] = useState("");
  async function saveDraft() {
    if (busy) return false;
    const result = validateWorkInput(category, quantity, remark, true);
    if (!result.ok) {
      setError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    setError("");
    const saved = await onSave({
      ...result.input,
      quantity: result.input.quantity,
      id: record.id,
      expected_revision: record.revision,
    });
    if (!saved)
      setError("保存未完成，请查看上方错误信息后重试。输入内容仍保留。");
    return saved;
  }
  const dirty =
    category !== record.category ||
    quantity !== (record.quantity === null ? "" : String(record.quantity)) ||
    remark !== record.remark;
  useDraft(`settlement-${record.id}`, dirty, busy, saveDraft, () => {
    setCategory(record.category);
    setQuantity(record.quantity === null ? "" : String(record.quantity));
    setRemark(record.remark);
    setError("");
  });
  return (
    <form
      id="settlement-form"
      className="settlement-form"
      onSubmit={(event) => {
        event.preventDefault();
        void saveDraft();
      }}
      noValidate
    >
      <p className="hint">有效工时 {formatDuration(record.duration_seconds)} · 开始 {formatTime(record.start_time)}</p>
      {!compact && <details className="help-disclosure"><summary>时间详情</summary><p>
        开始 {formatTime(record.start_time)}
        <br />
        有效结束 {record.end_time === null ? "—" : formatTime(record.end_time)}
        <br />
        系统确认{" "}
        {record.confirmed_end_time === null
          ? "—"
          : formatTime(record.confirmed_end_time)}
        <br />
        有效工时 {formatDuration(record.duration_seconds)}
      </p></details>}
      <div className="field-row grid grid-cols-2 gap-3">
        <label>
          工作类别
          <select
            aria-label="工作类别"
            value={category}
            disabled={busy}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>{name(value)}</option>
            ))}
          </select>
        </label>
        <label>
          工作量（必填）
          <input
            type="number"
            min="0"
            max="1000000000"
            step="any"
            inputMode="decimal"
            value={quantity}
            disabled={busy}
            placeholder="0 表示无产出"
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
      </div>
      <label>
        备注（选填）
        <textarea
          rows={2}
          value={remark}
          disabled={busy}
          maxLength={4000}
          onChange={(event) => setRemark(event.target.value)}
        />
      </label>
      {error && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {!externalActions && (
        <button type="submit" disabled={busy}>
          <span>{busy ? "正在保存…" : "填写工作量并保存"}</span>
          <Icon name="check" />
        </button>
      )}
    </form>
  );
}

export function SettlementPanel({
  open,
  onClose,
  refreshKey,
  busy,
  onSave,
  beforeChange = (action) => action(),
}: {
  open: boolean;
  onClose: () => void;
  refreshKey: string;
  busy: boolean;
  onSave: (input: SettleInput) => Promise<boolean>;
  beforeChange?: (action: () => void) => void;
}) {
  const { name } = useCategoryNames();
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    let stale = false;
    void invoke<WorkRecord[]>("get_pending_records")
      .then((r) => {
        if (!stale) {
          setRecords(r);
          setSelected((id) =>
            r.some((x) => x.id === id) ? id : (r[0]?.id ?? null),
          );
        }
      })
      .catch((e) => {
        if (!stale) setError(String(e));
      });
    return () => {
      stale = true;
    };
  }, [open, refreshKey]);
  const record = records.find((r) => r.id === selected);
  return (
    <Surface
      title="待补全工作量"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="secondary" onClick={onClose}>
            稍后填写
          </button>
          <button
            form="settlement-form"
            type="submit"
            disabled={busy || !record}
          >
            填写工作量并保存
          </button>
        </>
      }
    >
      <p className="hint">计时结果已保存，稍后填写不会丢失记录。</p>
      {error && <p className="error-banner">{error}</p>}
      {records.length > 0 ? (
        <label>
          选择记录
          <select
            value={selected ?? ""}
            disabled={busy}
            onChange={(e) => {
              const id = Number(e.target.value);
              beforeChange(() => setSelected(id));
            }}
          >
            {records.map((r) => (
              <option value={r.id} key={r.id}>
                {name(r.category)} · {formatTime(r.start_time)} ·{" "}
                {formatDuration(r.duration_seconds)}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p>没有待补全记录。</p>
      )}
      {record && (
        <SettlementForm
          key={`${record.id}:${record.revision}:${refreshKey}`}
          record={record}
          busy={busy}
          externalActions
          onSave={async (input) => {
            const ok = await onSave(input);
            if (ok) {
              setRecords((rs) => rs.filter((r) => r.id !== input.id));
              setSelected(records.find((r) => r.id !== input.id)?.id ?? null);
            }
            return ok;
          }}
        />
      )}
    </Surface>
  );
}
````

## UPDATE — E:\WorkMemo\src\dashboard\Charts.tsx

SHA256：`027a1885d7849e4c2ac4469a7455d25545b18002e489acb8d65b317283d1e1b9`

````tsx
import { memo, useEffect, useMemo, useRef } from "react";
import { init, use as registerCharts, type ECharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart, PieChart } from "echarts/charts";
import { Button, Empty } from "antd";
import { durationSlices } from "./durationPie";
import { formatDuration } from "../types";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type { Data } from "./api";
import type { Presentation } from "../desktopPreferences";
import { localDate } from "../history";
import { useCategoryNames } from "../categoryNames";
import { useMediaQuery } from "../ui/UiProvider";

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#fff",
  borderColor: "#dce6df",
  textStyle: { color: "#243c33" },
};

const Chart = memo(function Chart({
  option,
  label,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  onCategory?: (name: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const click = useRef(onCategory);
  click.current = onCategory;
  useEffect(() => {
    if (!node.current) return;
    const instance = init(node.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (p) => {
      if (typeof p.name === "string") click.current?.(p.name);
    });
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const host = node.current;
        if (
          host &&
          (instance.getWidth() !== host.clientWidth ||
            instance.getHeight() !== host.clientHeight)
        )
          instance.resize();
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    // Merge named series; a poll must not replace the whole chart or replay its entrance.
    chart.current?.setOption(option, {
      replaceMerge: ["series"],
      lazyUpdate: true,
    });
  }, [option]);
  return <div ref={node} className="dc-chart" role="img" aria-label={label} />;
});

export function TrendChart({ trend, range }: Pick<Data, "trend" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: {
        ...tooltip,
        trigger: "axis",
        valueFormatter: (value: unknown) =>
          `${Number(value).toLocaleString("zh-CN", { maximumFractionDigits: 4 })} 小时`,
      },
      legend: { top: 0, right: 16, data: ["有效工时"] },
      grid: { left: 22, right: 24, top: 64, bottom: 20, containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trend.map((x) => x.date),
        axisLine: { lineStyle: { color: "#dce7e0" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#718078",
          hideOverlap: true,
          showMinLabel: true,
          showMaxLabel: true,
          formatter: (value: string) =>
            range.trend_unit === "hour" ? value : value.slice(5),
        },
      },
      yAxis: {
        type: "value",
        name: "小时",
        min: 0,
        axisLabel: { color: "#718078" },
        splitLine: { lineStyle: { color: "#edf2ef", type: "dashed" } },
      },
      series: [
        {
          id: "work-duration",
          name: "有效工时",
          type: "line",
          smooth: false,
          symbolSize: 5,
          data: trend.map((x) => x.duration_ms / 3600000),
          lineStyle: { width: 2.5, color: "#287b63" },
          itemStyle: { color: "#287b63" },
          areaStyle: { color: "#eaf3ee", opacity: 0.7 },
        },
      ],
    }),
    [trend, range, reduced],
  );
  return <Chart option={option} label="有效工时趋势" />;
}

export function CategoryChart({
  categories,
  presentation,
  metric,
  onCategory,
}: {
  categories: Data["categories"];
  presentation: Presentation;
  metric: string;
  onCategory: (name: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(
    () => ({
      animation: !reduced,
      animationDuration: 240,
      animationDurationUpdate: 160,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: { left: 12, right: 22, top: 25, bottom: 28, containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f0" } } },
      yAxis: {
        type: "category",
        data: categories.map((x) => name(x.category)),
        axisLabel: { width: 100, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          id: "category-total",
          type: "bar",
          barMaxWidth: 24,
          data: categories.map((x) => ({
            name: name(x.category),
            value:
              metric === "duration"
                ? Number((x.duration_ms / 3600000).toFixed(2))
                : x.quantity,
            itemStyle: {
              color: presentation.categories[x.category]?.color,
              borderRadius: [0, 5, 5, 0],
            },
          })),
        },
      ],
    }),
    [categories, presentation, metric, name, reduced],
  );
  return (
    <Chart
      option={option}
      label="按类别汇总的工作分布"
      onCategory={onCategory}
    />
  );
}

export function DurationPieChart({ categories, presentation, onCategory }: {
  categories: Data["categories"];
  presentation: Presentation;
  onCategory: (category: string) => void;
}) {
  const { name } = useCategoryNames();
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const slices = useMemo(() => durationSlices(categories), [categories]);
  const option = useMemo<EChartsOption>(() => ({
    animation: !reduced,
    animationDuration: 240,
    animationDurationUpdate: 160,
    tooltip: {
      ...tooltip, trigger: "item",
      formatter: params => {
        const point = Array.isArray(params) ? params[0] : params;
        const slice = slices.find(row => row.category === point.name);
        return slice ? `${name(slice.category)}\n${formatDuration(slice.value / 1000)} · ${slice.percentLabel}` : "";
      },
    },
    series: [{
      id: "category-duration-share", type: "pie", radius: "78%", center: ["50%", "50%"],
      stillShowZeroSum: false,
      label: { show: false },
      emphasis: { scaleSize: 4 },
      data: slices.map(slice => ({
        name: slice.category, value: slice.value,
        itemStyle: { color: presentation.categories[slice.category]?.color },
      })),
    }],
  }), [slices, name, presentation, reduced]);
  if (!slices.length) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无有效工时" />;
  return <>
    <Chart option={option} label="按类别汇总的工时占比" onCategory={onCategory} />
    <ul className="dc-pie-legend" aria-label="工时占比明细">
      {slices.map(slice => <li key={slice.category}>
        <Button type="text" style={{ width: "100%" }} onClick={() => onCategory(slice.category)} aria-label={`${name(slice.category)}：${formatDuration(slice.value / 1000)}，${slice.percentLabel}，筛选此类别`}>
          <i aria-hidden="true" style={{ background: presentation.categories[slice.category]?.color }} />
          <span className="dc-pie-name" title={name(slice.category)}>{name(slice.category)}</span>
          <span className="dc-pie-value">{slice.percentLabel}</span>
        </Button>
      </li>)}
    </ul>
  </>;
}

export function CalendarChart({
  calendar,
  range,
}: Pick<Data, "calendar" | "range">) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const option = useMemo<EChartsOption>(() => {
    const end = range.end_date ?? localDate(new Date());
    const start = new Date(`${end}T12:00:00`);
    start.setDate(start.getDate() - 89);
    const startDate =
      range.start_date && range.start_date > localDate(start)
        ? range.start_date
        : localDate(start);
    const max = Math.max(1, ...calendar.map((v) => v[1]));
    return {
      animation: !reduced,
      tooltip: {
        ...tooltip,
        formatter: (p: unknown) => {
          const point = (p as { value?: [string, number] }).value;
          return point
            ? `${point[0]}  ${(point[1] / 3600000).toFixed(2)} 小时`
            : "";
        },
      },
      visualMap: {
        type: "piecewise",
        show: false,
        pieces: [
          { value: 0, color: "#ebedf0" },
          ...["#9be9a8", "#40c463", "#30a14e", "#216e39"].map((color, i) => ({
            gt: (i * max) / 4,
            lte: ((i + 1) * max) / 4,
            color,
          })),
        ],
      },
      calendar: {
        range: [startDate, end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#65796f" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#718078" },
        splitLine: { lineStyle: { color: "#dce6df" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          id: "work-calendar",
          type: "heatmap",
          coordinateSystem: "calendar",
          data: calendar,
        },
      ],
    };
  }, [calendar, range, reduced]);
  return <Chart option={option} label="筛选范围内的有效工时工作日历" />;
}
````

## NEW FILE — E:\WorkMemo\src\dashboard\durationPie.ts

SHA256：`e9cc876ac6fee2b51a81fdc171376320d75f00cde45a6508949e570d4a2fe486`

````ts
/** Ratios use the unrounded backend milliseconds, including ended pending records. */
export function durationSlices(categories: readonly { category: string; duration_ms: number }[]) {
  const positive = categories.filter(row => Number.isFinite(row.duration_ms) && row.duration_ms > 0);
  const total = positive.reduce((sum, row) => sum + row.duration_ms, 0);
  return positive.map(row => {
    const percent = row.duration_ms / total * 100;
    return {
      category: row.category,
      value: row.duration_ms,
      percent,
      percentLabel: percent < 0.01 ? "不足 0.01%" : `${Number(percent.toFixed(2))}%`,
    };
  });
}
````

## NEW FILE — E:\WorkMemo\tests\duration-pie.test.mjs

SHA256：`d70f0fecbd163d41d0b43ef498d2262774ad84ce7bb45c38e3336fa3780c3854`

````mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { durationSlices } from '../src/dashboard/durationPie.ts';

test('duration pie leaves empty/zero work empty instead of creating equal slices', () => {
  assert.deepEqual(durationSlices([]), []);
  assert.deepEqual(durationSlices([{ category: '开发', duration_ms: 0 }]), []);
});
test('duration shares use original milliseconds and keep tiny nonzero work', () => {
  const rows = Object.freeze([
    Object.freeze({ category: '评测', duration_ms: 1 }),
    Object.freeze({ category: '开发', duration_ms: 999999 }),
    Object.freeze({ category: '文档', duration_ms: 0 }),
  ]);
  const result = durationSlices(rows);
  assert.equal(result.length, 2);
  assert.equal(result[0].value, 1);
  assert.equal(result[0].percentLabel, '不足 0.01%');
  assert.equal(result[0].percent + result[1].percent, 100);
  assert.equal(rows[0].duration_ms, 1);
});
test('single category is 100 percent; category identity and aggregate work remain unchanged', () => {
  assert.deepEqual(durationSlices([{ category: '质检', duration_ms: 1200 }]), [
    { category: '质检', value: 1200, percent: 100, percentLabel: '100%' },
  ]);
  const result = durationSlices([{ category: '评测', duration_ms: 3000 }, { category: '开发', duration_ms: 1000 }]);
  assert.deepEqual(result.map(row => row.percentLabel), ['75%', '25%']);
});
````
