// Isolated browser IPC regression; never opens the native app or a user database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { desktopFixture } from './desktop-fixture.mjs';

const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT
  ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1423/';
const output = new URL('../artifacts/page-binding-entry/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const errors = [], results = [];
try {
  const page = await browser.newPage({ viewport: { width: 420, height: 650 } });
  page.on('pageerror', error => errors.push(error.message));
  await desktopFixture(page);
  async function load(query) { await page.goto(`${base}?state=empty&${query}`); }
  async function savedWithoutStarting(command, browsing) {
    const state = await page.evaluate(() => ({
      browsing: window.qa.browse, active: window.qa.active,
      writes: window.qa.calls.filter(call => ['bind_page', 'rebind_finished_page', 'start_task', 'confirm_work', 'confirm_recovery_task', 'enter_browsing'].includes(call.command)),
    }));
    assert.equal(state.browsing, browsing);
    assert.equal(state.active, null);
    assert.deepEqual(state.writes.map(call => call.command), [command]);
    return state.writes[0].args.input;
  }

  for (const browsing of [false, true]) {
    const suffix = browsing ? '&browse' : '';
    await load(`finished${suffix}`);
    const prompt = page.getByRole('region', { name: '已结束任务处理', exact: true });
    const create = prompt.getByRole('radio', { name: '新建任务', exact: true });
    await create.waitFor();
    assert.equal(await create.isChecked(), true);
    assert.equal(await prompt.getByRole('button', { name: '确认绑定' }).isDisabled(), true);
    await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).fill('继续处理的工作');
    await prompt.getByRole('radio', { name: '绑定已有任务', exact: true }).check();
    assert.equal(await prompt.getByRole('button', { name: '确认绑定' }).isDisabled(), true);
    await prompt.getByRole('combobox', { name: '任务选择' }).selectOption('1');
    await create.check();
    assert.equal(await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).inputValue(), '继续处理的工作');
    await page.evaluate(() => { window.qa.fail = 'rebind_finished_page'; });
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.getByRole('alert').waitFor();
    assert.equal(await prompt.getByRole('textbox', { name: '新任务名称', exact: true }).inputValue(), '继续处理的工作');
    await page.evaluate(() => { window.qa.fail = ''; window.qa.calls = []; });
    for (const width of [320, 420, 780]) {
      await page.setViewportSize({ width, height: 650 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      assert.equal(await prompt.evaluate(element => element.scrollWidth <= element.clientWidth), true);
      await page.screenshot({ path: fileURLToPath(new URL(`finished-${browsing}-${width}.png`, output)) });
    }
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.waitFor({ state: 'detached' });
    const input = await savedWithoutStarting('rebind_finished_page', browsing);
    assert.equal(input.task_id, null);
    assert.equal(input.new_name, '继续处理的工作');

    await load(`finished${suffix}`);
    await prompt.getByRole('radio', { name: '绑定已有任务', exact: true }).check();
    await prompt.getByRole('combobox', { name: '任务选择' }).selectOption('1');
    await prompt.getByRole('button', { name: '确认绑定' }).click();
    await prompt.waitFor({ state: 'detached' });
    assert.equal((await savedWithoutStarting('rebind_finished_page', browsing)).task_id, 1);

    await load(`unknown${suffix}`);
    const unknown = page.getByRole('region', { name: '新网页处理', exact: true });
    await unknown.getByRole('radio', { name: '新建任务', exact: true }).check();
    await unknown.getByRole('textbox', { name: '任务名称', exact: true }).fill('新网页工作');
    await unknown.getByRole('combobox', { name: '绑定范围' }).selectOption('origin');
    await unknown.getByRole('button', { name: '保存绑定' }).click();
    await unknown.waitFor({ state: 'detached' });
    assert.equal((await savedWithoutStarting('bind_page', browsing)).new_name, '新网页工作');

    await load(`finished&notice${suffix}`);
    const reminder = page.getByRole('region', { name: '新网页处理提醒', exact: true });
    await page.getByRole('button', { name: '展开任务与提醒', exact: true }).click();
    await reminder.getByRole('heading', { name: '绑定任务已结束' }).waitFor();
    assert.match(await reminder.innerText(), /新建任务/);
    assert.doesNotMatch(await reminder.innerText(), /忽略/);
    assert.equal(await page.getByText('网页任务待处理', { exact: true }).isVisible(), true);
    await reminder.getByRole('button', { name: '打开主窗口处理' }).click();
    assert.equal(await page.evaluate(() => window.qa.calls.some(call => call.command === 'show_main')), true);
    results.push({ browsing, finishedNew: true, finishedExisting: true, unknownNew: true, failedSaveDraft: true, islandEntry: true });
  }
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, results, errors }, null, 2));
  console.log('Page-binding entry regression passed: normal/browsing modes, new/existing tasks, save failure, 320/420/780 layouts and island guidance.');
} finally { await browser.close(); }
