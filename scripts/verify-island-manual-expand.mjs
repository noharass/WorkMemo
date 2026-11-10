// Isolated IPC regression. No native application or user database is opened.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { desktopFixture } from './desktop-fixture.mjs';

const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT
  ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1423/';
const output = new URL('../artifacts/island-manual-expand/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results = [], errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 320, height: 420 } });
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  await desktopFixture(page);
  const expansion = page.locator('.island-expansion');
  const expand = () => page.getByRole('button', { name: '展开任务与提醒', exact: true });
  const collapse = () => page.getByRole('button', { name: '收起展开区域', exact: true });
  async function load(query) {
    await page.goto(`${base}?notice&${query}`);
    await expand().waitFor();
    await page.waitForFunction(() => document.querySelector('.island-info small')?.textContent !== '状态不可用');
    await page.waitForTimeout(400);
  }
  async function closed(label) {
    assert.equal(await expand().getAttribute('aria-expanded'), 'false');
    assert.equal(await expansion.getAttribute('aria-hidden'), 'true');
    assert.ok(await expansion.evaluate(el => el.getBoundingClientRect().height) < 1);
    assert.equal(await expand().getAttribute('data-reminder'), 'true');
    assert.match(await page.locator('.island-info small').innerText(), new RegExp(label));
    assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'set_island_region').at(-1)?.args.height), 56);
    assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'hold_island').at(-1)?.args.holding), false);
    results.push(label);
  }
  async function update(patch) {
    const before = await page.evaluate(patch => {
      Object.assign(window.qa, patch);
      return window.qa.calls.filter(c => c.command === 'get_snapshot').length;
    }, patch);
    await page.waitForFunction(before => window.qa.calls.filter(c => c.command === 'get_snapshot').length > before, before);
    await page.waitForTimeout(350);
  }

  await load('state=empty&unknown');
  await closed('网页待处理');
  assert.equal(await page.evaluate(() => window.qa.calls.some(c => c.command === 'set_island_region' && c.args.height > 56)), false);
  await expand().click();
  await page.getByRole('button', { name: '打开主窗口处理', exact: true }).waitFor();
  await page.waitForTimeout(350);
  assert.ok(await expansion.evaluate(el => el.getBoundingClientRect().height) > 50);
  assert.equal(await collapse().getAttribute('data-reminder'), 'false');
  await collapse().click();
  await page.waitForTimeout(350);
  // Distinct page identities must not override the user's manual collapse.
  for (let index = 0; index < 3; index++) {
    await update({ unknown: `https://tab${index}.example.test/work` });
    await closed('网页待处理');
  }
  await update({ unknown: null, finishedRule: 1 });
  await closed('网页待处理');
  await update({ finishedRule: 2 });
  await closed('网页待处理');
  await update({ finishedRule: null, candidate: { id: 31, rule_id: 1, category: '开发' } });
  await closed('待确认开工');
  await update({ candidate: { id: 32, rule_id: 2, category: '文档' } });
  await closed('待确认开工');
  assert.equal(await page.getByRole('button', { name: '开始识别的工作', exact: true }).isVisible(), true);

  await load('state=empty&ended');
  await closed('工作量待填');
  await expand().click();
  await page.getByRole('button', { name: '填写工作量', exact: true }).click();
  await page.getByLabel('工作量（必填）', { exact: true }).fill('12');
  await page.getByLabel('备注（选填）').fill('不应被切页打断的草稿');
  await update({ unknown: 'https://another.example.test/work' });
  assert.equal(await collapse().getAttribute('aria-expanded'), 'true');
  assert.equal(await page.getByLabel('备注（选填）').inputValue(), '不应被切页打断的草稿');
  await collapse().click();
  await page.getByRole('button', { name: '继续填写', exact: true }).click();
  assert.equal(await page.getByLabel('工作量（必填）', { exact: true }).inputValue(), '12');
  results.push('manual editing and dirty-draft close guard preserved');

  await load('state=empty&candidate');
  await closed('待确认开工');
  // The compact start action remains usable without forcing the panel open.
  await page.getByRole('button', { name: '开始识别的工作', exact: true }).click();
  await page.waitForFunction(() => window.qa.active !== null && window.qa.candidate === null);
  await page.waitForTimeout(350);
  assert.equal(await expand().getAttribute('aria-expanded'), 'false');
  assert.equal(await expand().getAttribute('data-reminder'), 'false');
  assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'confirm_work').length), 1);
  results.push('compact start creates one task and remains collapsed');

  await load('');
  const idle = await page.evaluate(() => ({ kind: 'idle', record: window.qa.active, idle_warning_seconds: 300, idle_end_seconds: 420 }));
  await update({ notice: idle });
  await closed('空闲提醒');

  for (const theme of ['glass', 'cream', 'dark', 'neon']) {
    for (const opacity of [40, 100]) {
      await load(`state=empty&unknown&theme=${theme}&opacity=${opacity}`);
      await closed('网页待处理');
      const dot = await expand().evaluate(el => {
        const style = getComputedStyle(el, '::after');
        return { content: style.content, width: style.width, animation: style.animationName };
      });
      assert.equal(dot.content, '""');
      assert.equal(dot.width, '5px');
      assert.equal(dot.animation, 'none');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: fileURLToPath(new URL(`collapsed-${theme}-${opacity}.png`, output)) });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expand().click();
  await collapse().waitFor();
  await page.waitForTimeout(150);
  assert.ok(await expansion.evaluate(el => el.getBoundingClientRect().height) > 50);
  await collapse().click();
  await page.waitForTimeout(150);
  await closed('网页待处理');
  assert.deepEqual(errors, []);
  await writeFile(new URL('result.json', output), JSON.stringify({ isolated: true, native: false, results, errors }, null, 2));
  console.log('Manual island expansion passed: repeated page/candidate changes, compact hints, explicit controls, draft guard, native-region IPC, four skins and reduced motion.');
} finally { await browser.close(); }
