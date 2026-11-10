import { desktopFixture } from './desktop-fixture.mjs';
// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.7/qa/island/', import.meta.url);
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
// Native region is modelled by IPC observations; this does not prove Windows rendering.
try {
  await load({notice:'1',candidate:'1',state:'empty'},320,420);
  await page.getByRole('button',{name:'展开任务与提醒',exact:true}).click();
  await page.getByRole('button',{name:'开始记录',exact:true}).waitFor();
  await page.waitForTimeout(650);
  const metrics = await page.evaluate(()=>({
    height:document.querySelector('.island-expansion').getBoundingClientRect().height,
    region:window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height ?? 56,
    calls:window.qa.calls.filter(c=>['set_island_region','hold_island'].includes(c.command)),
  }));
  if(process.argv.includes('--baseline')) {
    await writeFile(new URL('baseline.json',output),JSON.stringify(metrics,null,2));
    console.log(JSON.stringify(metrics));
  } else {
    assert.ok(metrics.height>50,JSON.stringify(metrics));
    assert.ok(metrics.region>=metrics.height+55,JSON.stringify(metrics));
    for(let i=0;i<3;i++) {
      await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height),56);
      await page.getByRole('button',{name:'展开任务与提醒',exact:true}).click();
      await page.waitForTimeout(400);
      assert.ok(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height)>100);
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.island-expansion').evaluate(el=>el.getBoundingClientRect().height),0);
    await page.getByRole('button',{name:'展开任务与提醒',exact:true}).click();
    await page.waitForTimeout(150);
    assert.ok(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='set_island_region').at(-1)?.args.height)>100);
    assert.equal(await page.getByRole('button',{name:'收起展开区域',exact:true}).getAttribute('aria-expanded'),'true');
    assert.deepEqual(errors,[]);
    await page.screenshot({path:fileURLToPath(new URL('candidate.png',output))});
    await writeFile(new URL('result.json',output),JSON.stringify({isolated:true,native:false,metrics,errors},null,2));
    console.log('Island native-region contract, repeated reveal and reduced-motion checks passed.');
  }
} finally { await browser.close(); }
