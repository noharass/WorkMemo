// Read-only audit against isolated HTTP fixtures. Never connects to a real database.
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
import { dashboardFixture } from './dashboard-fixture.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
const output = new URL('../artifacts/web-audit/', import.meta.url);
await mkdir(output, { recursive: true });
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({channel:'msedge',headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
const page = await context.newPage();
const state = await dashboardFixture(page);
const result = {};
try {
 await page.goto(`${base}/dashboard#token=isolated-review`);
 await page.locator('.dc-kpi').first().waitFor();
 await page.waitForTimeout(400);
 result.title = await page.title();
 result.live = await page.locator('.dc-sync').evaluate(el => {window.auditUpdates=[]; new MutationObserver(()=>window.auditUpdates.push(el.textContent)).observe(el,{childList:true,subtree:true,characterData:true}); return el.outerHTML;});
 await page.waitForTimeout(6500);
 result.liveUpdates = await page.evaluate(()=>window.auditUpdates);
 result.layout = [];
 for (const width of [1440,1024,768,390,320]) {
  await page.setViewportSize({width,height:900});
  await page.waitForTimeout(250);
  result.layout.push(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})));
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.getByText('辅助分析',{exact:true}).click();
 await page.waitForTimeout(500);
 result.chartTree = await page.locator('.dc-auxiliary').ariaSnapshot();
 result.trendTree = await page.locator('.dc-trend').ariaSnapshot().catch(()=>page.locator('[aria-label="有效工时趋势"]').ariaSnapshot());
 await page.screenshot({path:fileURLToPath(new URL('overview.png', output)),fullPage:true});
 await page.getByRole('button',{name:'补记录',exact:true}).click();
 await page.getByRole('textbox',{name:'补录工作量',exact:true}).waitFor();
 result.manualInputs = await page.locator('.dc-manual-entry input, .dc-manual-entry textarea').evaluateAll(els=>els.map(el=>({label:el.getAttribute('aria-label'),required:el.required,ariaRequired:el.getAttribute('aria-required'),describedby:el.getAttribute('aria-describedby'),id:el.id})));
 await page.getByRole('button',{name:'保存补录',exact:true}).click();
 result.errorTree = await page.locator('.dc-manual-entry').ariaSnapshot();
 result.invalid = await page.getByRole('textbox',{name:'补录工作量',exact:true}).getAttribute('aria-invalid');
 result.manualSaves = state.manualSaves;
 await page.screenshot({path:fileURLToPath(new URL('form.png', output)),fullPage:false});
 await writeFile(new URL('result.json', output),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
} finally {await browser.close();}
