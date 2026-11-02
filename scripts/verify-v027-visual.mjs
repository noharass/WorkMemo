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
    metrics.push({theme,opacity,density,styles});
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
