import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { desktopFixture } from './desktop-fixture.mjs';

const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT
  ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1423/';
const browser = await chromium.launch({ channel: 'msedge', headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 360, height: 420 } });
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await desktopFixture(page);
  const checklist = page.getByRole('dialog', { name: '待办清单' });
  const entry = page.getByRole('button', { name: '待办', exact: true });
  const title = checklist.getByRole('textbox', { name: '待办标题' });

  async function add(value) {
    await title.fill(value);
    await title.press('Enter');
    await checklist.getByRole('checkbox', { name: value, exact: true }).waitFor();
  }

  await page.goto(`${base}?state=empty&openTodos`);
  await checklist.getByText('暂无未完成待办。').waitFor();
  await page.keyboard.press('Escape');
  await checklist.waitFor({ state: 'hidden' });
  await entry.focus();
  await entry.press('Enter');
  assert.ok(await title.evaluate(el => document.activeElement === el));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.imeSetComposition', { text: 'jian', selectionStart: 4, selectionEnd: 4 });
  await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 229 });
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 229 });
  assert.equal(await page.evaluate(() => window.qa.calls.some(call => call.command === 'create_todo')), false);
  await cdp.send('Input.insertText', { text: '检' });
  assert.equal(await title.inputValue(), '检');
  await title.clear();
  await title.press('Enter');
  await checklist.getByText('请输入 1 到 80 个字符的单行标题。').waitFor();

  await page.evaluate(() => { window.qa.fail = 'create_todo'; });
  await title.fill('输入保留');
  await title.press('Enter');
  await checklist.getByRole('alert').filter({ hasText: '隔离保存失败' }).waitFor();
  assert.equal(await title.inputValue(), '输入保留');
  await page.evaluate(() => { window.qa.fail = ''; });
  await add('检查记录');
  await add('整理材料');
  assert.deepEqual(await checklist.locator('.todo-check span').allTextContents(), ['检查记录', '整理材料']);

  const first = checklist.getByRole('checkbox', { name: '检查记录' });
  await first.focus();
  await page.keyboard.press('Space');
  const summary = checklist.getByText('已完成 1', { exact: true });
  await summary.waitFor();
  await first.waitFor({ state: 'hidden' });
  await summary.click();
  await first.waitFor();
  assert.ok(await first.isChecked());
  await first.uncheck();
  await summary.waitFor({ state: 'hidden' });
  await first.waitFor();

  await checklist.getByRole('button', { name: '改名：检查记录' }).click();
  const rename = checklist.getByRole('textbox', { name: '修改标题' });
  await rename.fill('复查记录');
  await rename.press('Enter');
  await checklist.getByRole('checkbox', { name: '复查记录' }).waitFor();
  await checklist.getByRole('button', { name: '删除：整理材料' }).click();
  const confirmDelete = page.getByRole('dialog', { name: '删除待办' });
  await confirmDelete.waitFor();
  assert.ok(await confirmDelete.getByRole('button', { name: '取消' }).evaluate(el => document.activeElement === el));
  await page.keyboard.press('Escape');
  await confirmDelete.waitFor({ state: 'hidden' });
  await checklist.getByRole('button', { name: '删除：整理材料' }).click();
  await confirmDelete.getByRole('button', { name: '删除', exact: true }).click();
  await checklist.getByRole('checkbox', { name: '整理材料' }).waitFor({ state: 'detached' });

  await page.keyboard.press('Escape');
  await checklist.waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: '新建任务' }).click();
  const remark = page.getByRole('textbox', { name: /备注/ });
  await remark.fill('先前手动草稿');
  await page.getByRole('button', { name: '返回监测状态' }).click();
  await entry.click();
  await checklist.getByRole('button', { name: '开始计时：复查记录' }).click();
  const form = page.getByRole('region', { name: '新建任务' });
  await form.getByRole('heading', { name: '复查记录' }).waitFor();
  assert.equal(await remark.inputValue(), '');
  await form.getByRole('button', { name: '返回待办' }).click();
  await checklist.waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '新建任务' }).click();
  assert.equal(await remark.inputValue(), '先前手动草稿');
  await page.getByRole('button', { name: '返回监测状态' }).click();

  await entry.click();
  await add('第二项');
  await checklist.getByRole('button', { name: '开始计时：复查记录' }).click();
  await form.getByRole('combobox', { name: '工作类别' }).selectOption('开发');
  await form.getByRole('button', { name: '开始工作' }).click();
  const timer = page.getByRole('region', { name: '当前工作' });
  await timer.getByText('复查记录', { exact: true }).waitFor();
  await entry.click();
  assert.ok(await checklist.getByRole('button', { name: '开始计时：第二项' }).isDisabled());
  await checklist.getByRole('button', { name: '查看未结束工作：复查记录' }).click();
  await checklist.waitFor({ state: 'hidden' });
  await timer.getByRole('button', { name: '暂停', exact: true }).click();
  await timer.getByRole('button', { name: '继续工作' }).waitFor();
  await entry.click();
  await checklist.getByRole('button', { name: '开始计时：第二项' }).click();
  const switching = page.getByRole('region', { name: '切换任务' });
  await switching.getByRole('combobox').selectOption('文档');
  await switching.getByRole('button', { name: '开始工作' }).click();
  const confirmation = page.getByRole('dialog', { name: '确认切换工作' });
  await confirmation.getByText(/第二项/).waitFor();
  await confirmation.getByRole('button', { name: '取消' }).click();
  await switching.getByRole('button', { name: '返回待办' }).click();
  await checklist.getByRole('button', { name: '查看未结束工作：复查记录' }).click();
  await timer.getByRole('button', { name: '继续工作' }).click();
  await timer.getByRole('button', { name: '结束', exact: true }).click();
  await entry.click();
  const available = checklist.getByRole('button', { name: '开始计时：复查记录' });
  await available.waitFor();
  assert.equal(await checklist.getByRole('checkbox', { name: '复查记录' }).isChecked(), false);
  assert.equal(await available.isEnabled(), true);
  assert.equal(await page.evaluate(() => window.qa.calls.find(call => call.command === 'start_task').args.todoId), '1');

  await page.goto(`${base}?notice&state=empty`);
  await page.getByRole('button', { name: '展开任务与提醒' }).click();
  await entry.click();
  await page.waitForFunction(() => window.qa.calls.some(call => call.command === 'open_todos'));
  await entry.waitFor({ state: 'hidden' });
  assert.deepEqual(errors, []);
  console.log('待办桌面交互通过（隔离 IPC fixture）');
} finally {
  await browser.close();
}
