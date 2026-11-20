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
  await title.fill('　检查记录　');
  await checklist.getByRole('button', { name: '添加' }).click();
  await checklist.getByRole('alert').filter({ hasText: '已有同名的未完成待办，请换个标题。' }).waitFor();
  assert.equal(await title.inputValue(), '　检查记录　');
  assert.equal(await title.getAttribute('aria-invalid'), 'true');
  assert.ok(await title.evaluate(el => document.activeElement === el));
  await add('整理材料');
  assert.deepEqual(await checklist.locator('.todo-check span').allTextContents(), ['检查记录', '整理材料']);
  assert.equal(await checklist.getByRole('button', { name: '改名：整理材料' }).count(), 0);
  const materialActions = checklist.getByRole('button', { name: '更多：整理材料' });
  await materialActions.press('Enter');
  await checklist.getByRole('button', { name: '加入今天' }).click();
  await checklist.getByRole('heading', { name: '今天要做' }).waitFor();
  assert.deepEqual(await checklist.locator('.todo-check span').allTextContents(), ['整理材料', '检查记录']);
  await materialActions.click();
  await checklist.getByRole('button', { name: '移出今天' }).click();
  await checklist.getByRole('heading', { name: '今天要做' }).waitFor({ state: 'hidden' });
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

  await checklist.getByRole('button', { name: '更多：检查记录' }).click();
  await checklist.getByRole('button', { name: '改名：检查记录' }).click();
  const rename = checklist.getByRole('textbox', { name: '修改标题' });
  await rename.fill('整理材料');
  await rename.press('Enter');
  await checklist.getByRole('alert').filter({ hasText: '已有同名的未完成待办，请换个标题。' }).waitFor();
  assert.equal(await rename.inputValue(), '整理材料');
  await rename.fill('复查记录');
  await rename.press('Enter');
  await checklist.getByRole('checkbox', { name: '复查记录' }).waitFor();
  await materialActions.click();
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
  await checklist.getByRole('button', { name: '查看工作：复查记录' }).click();
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
  await checklist.getByRole('button', { name: '去继续：复查记录' }).click();
  await timer.getByRole('button', { name: '继续工作' }).click();
  await timer.getByRole('button', { name: '结束', exact: true }).click();
  await entry.click();
  const available = checklist.getByRole('button', { name: '开始计时：复查记录' });
  await available.waitFor();
  assert.equal(await checklist.getByRole('checkbox', { name: '复查记录' }).isChecked(), false);
  assert.equal(await available.isEnabled(), true);
  assert.equal(await page.evaluate(() => window.qa.calls.find(call => call.command === 'start_task').args.todoId), '1');
  const history = checklist.locator('.todo-history summary').filter({ hasText: '已计时 1 次 · 共 1 分钟' });
  assert.equal(await page.evaluate(() => window.qa.calls.some(call => call.command === 'todo_work_history')), false);
  await history.press('Enter');
  await checklist.getByText('00:01:00', { exact: true }).waitFor();
  await history.press('Enter');
  await available.click();
  assert.equal(await form.getByRole('combobox', { name: '工作类别' }).inputValue(), '开发');
  await form.getByRole('combobox', { name: '工作类别' }).selectOption('质检');
  await form.getByRole('button', { name: '返回待办' }).click();

  await page.evaluate(() => {
    window.qa.todos = [
      { id: '10', title: '111', completed_at: null, open_record_id: null },
      { id: '11', title: '111', completed_at: null, open_record_id: null },
      { id: '12', title: '111', completed_at: 1000, open_record_id: null },
    ];
    window.qa.emit('workmemo:data-changed');
  });
  await checklist.getByRole('checkbox', { name: '111（编号 10）', exact: true }).waitFor();
  await checklist.getByRole('button', { name: '开始计时：111（编号 11）', exact: true }).click();
  await form.getByRole('heading', { name: '111（编号 11）', exact: true }).waitFor();
  await form.getByRole('button', { name: '返回待办' }).click();
  const completed = checklist.locator('.todo-completed');
  if (!(await completed.evaluate(details => details.open))) {
    await completed.getByText('已完成 1', { exact: true }).click();
  }
  const done = completed.getByRole('checkbox', { name: '111', exact: true });
  await done.click();
  await completed.getByRole('alert').filter({ hasText: '请先改名再取消勾选' }).waitFor();
  assert.equal(await done.isChecked(), true);
  await page.setViewportSize({ width: 360, height: 320 });
  await add('长'.repeat(80));
  assert.ok(await checklist.evaluate(dialog => dialog.scrollWidth <= dialog.clientWidth + 1));

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
