// UI/AX regression against isolated API fixtures, never a user database.
import assert from 'node:assert/strict';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath,pathToFileURL } from 'node:url';
import {checkContrast} from './web-contrast.mjs';
import { dashboardFixture } from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const output=new URL('../artifacts/web-phase-b/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={base,passed:[],errors:[],axe:{},contrast:{}};
let context,page;
async function setup(width=1440,height=1000){
 await context?.close();context=await browser.newContext({viewport:{width,height},timezoneId:'Asia/Shanghai'});
 page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>result.errors.push(e.message));
 await page.route('**/dashboard',async route=>{const response=await route.fetch();await route.fulfill({response,headers:{...response.headers(),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});});
 const state=await dashboardFixture(page);
 await page.goto(base+'/dashboard#token=isolated-phase-b');await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
 return state;
}
async function axe(name){
 if(!process.env.WORKMEMO_AXE)return;
 await page.waitForTimeout(450);
 if(!await page.evaluate(()=>!!window.axe))await page.evaluate(await readFile(process.env.WORKMEMO_AXE,'utf8'));
 const report=await page.evaluate(async()=>{
  const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}});
  return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
 });
 result.axe[name]=report;
 await writeFile(new URL(`axe-${name}.json`,output),JSON.stringify(report,null,2));
 assert.deepEqual(report.violations,[],`axe ${name}`);
}
async function focused(locator){await locator.evaluate(el=>new Promise((resolve,reject)=>{const end=performance.now()+1500;function check(){if(el===document.activeElement)resolve();else if(performance.now()>end)reject(new Error('Focus did not reach '+el.outerHTML.slice(0,150)));else requestAnimationFrame(check);}check();}));}
async function insideViewport(locator){
 assert.equal(await locator.evaluate(el=>{
  const rect=el.getBoundingClientRect(),host=el.closest('.wm-drawer-body,.wm-modal-body')?.getBoundingClientRect();
  return rect.top>=0&&rect.bottom<=innerHeight&&(!host||(rect.top>=host.top&&rect.bottom<=host.bottom));
 }),true);
}
async function date(name,value){const field=page.getByRole('textbox',{name,exact:true});await field.fill(value);await field.press('Enter');await page.locator('.wm-picker-dropdown:visible').waitFor({state:'hidden'});}
async function modal(){await page.getByRole('button',{name:'补记录',exact:true}).click();await page.getByRole('dialog',{name:'补记录',exact:true}).waitFor();await page.waitForTimeout(300);}
try{
 {
  const state=await setup();await axe('overview');
  result.contrast.overview=await checkContrast(page,output,'overview',['.dc-sync','.dc-eyebrow','.dc-heading p','.dc-kpi-label','.dc-card-title p','.wm-form-item-label label','.wm-table-thead th','.wm-tag']);
  await page.getByRole('button',{name:'编辑',exact:true}).first().click();
  const quantity=page.getByRole('textbox',{name:'工作量',exact:true});await quantity.fill('-1');
  await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#dc-quantity')?.getAttribute('aria-invalid')==='true');
  await focused(quantity);await insideViewport(quantity);
  assert.match(await quantity.getAttribute('aria-describedby'),/dc-quantity-error/);assert.equal(state.saves,0);
  await quantity.fill('0');assert.equal(await quantity.getAttribute('aria-invalid'),'false');
  const remark=page.getByRole('textbox',{name:'备注',exact:true});await remark.fill('😀'.repeat(2001));
  await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('#dc-remark')?.getAttribute('aria-invalid')==='true');
  await focused(remark);await insideViewport(remark);assert.equal((await remark.inputValue()).length,4002);
  await remark.fill('😀'.repeat(2000));await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.getByRole('button',{name:'编辑工作量',exact:true}).waitFor();assert.equal(state.saves,1);
  await axe('detail');
  result.contrast.detail=await checkContrast(page,output,'detail',['.wm-descriptions-item-label','.dc-sheet-root .wm-tag']);
  result.passed.push('editor errors focus visible fields, clear on edit, and preserve 2000 Unicode characters');
 }
 {
  const state=await setup();await modal();
  const quantity=page.getByRole('textbox',{name:'补录工作量',exact:true});
  assert.equal(await quantity.getAttribute('aria-invalid'),'false');
  assert.equal(await quantity.evaluate(el=>el.labels.length),1);
  assert.match(await quantity.getAttribute('aria-describedby'),/quantity-hint/);
  await page.getByRole('button',{name:'保存补录',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('input[aria-label="补录工作量"]')?.getAttribute('aria-invalid')==='true');
  await focused(quantity);await insideViewport(quantity);assert.equal(state.manualSaves,0);
  await quantity.fill('0');await date('补录开始时间','2026-10-28 11:00');await date('补录结束时间','2026-10-28 09:00');
  await page.getByRole('button',{name:'保存补录',exact:true}).click();
  const summary=page.getByRole('group',{name:'补录校验错误',exact:true});await summary.waitFor();await page.waitForTimeout(40);await focused(summary);await insideViewport(summary);
  await page.getByRole('button',{name:'检查起止时间',exact:true}).click();await focused(page.getByRole('textbox',{name:'补录开始时间',exact:true}));
  assert.equal(state.manualSaves,0);await axe('manual-error');
  result.contrast.manual=await checkContrast(page,output,'manual',['.dc-manual-entry .wm-form-item-label label','.dc-manual-entry .wm-form-item-extra','.dc-manual-entry .wm-form-item-explain-error','.dc-manual-entry .wm-alert-title']);
  result.passed.push('manual entry exposes labels, required/hint/error semantics and navigable cross-field time errors');
 }
 {
  await setup();await modal();await page.getByRole('textbox',{name:'补录工作量',exact:true}).fill('2');
  const cancel=page.getByRole('dialog',{name:'补记录',exact:true}).getByRole('button',{name:'取消',exact:true});await cancel.click();
  const guard=page.getByRole('dialog',{name:'放弃这次补记录？',exact:true});await guard.waitFor();
  assert.equal(await page.locator('input[aria-label="补录工作量"]').evaluate(el=>!!el.closest('[inert]')),true);
  for(let i=0;i<10;i++){await page.keyboard.press('Tab');assert.equal(await guard.evaluate(el=>el.contains(document.activeElement)),true);}
  await axe('manual-guard');
  await guard.getByRole('button',{name:'继续填写',exact:true}).click();await guard.waitFor({state:'hidden'});await page.waitForTimeout(300);
  assert.equal(await page.locator('input[aria-label="补录工作量"]').evaluate(el=>!!el.closest('[inert]')),false);await focused(cancel);
  result.passed.push('nested manual confirmation isolates the lower form, traps focus and restores its trigger');
 }
 {
  await setup();const trigger=page.getByRole('button',{name:'评测待补填1条',exact:true});await trigger.click();
  await page.getByRole('button',{name:'补填记录5',exact:true}).waitFor();
  assert.equal(await page.locator('.dc-page').evaluate(el=>el.inert),true);
  for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await page.locator('.dc-sheet-root .wm-drawer-section').evaluate(el=>el.contains(document.activeElement)),true);}
  await page.getByRole('button',{name:'关闭',exact:true}).click();await page.locator('.dc-sheet-root .wm-drawer-section').waitFor({state:'hidden'});await page.waitForTimeout(300);await focused(trigger);
  result.passed.push('pending selection isolates the page and restores keyboard focus on close');
 }
 {
  const state=await setup();await page.getByRole('button',{name:'查看趋势数据',exact:true}).click();
  const trend=page.getByRole('table',{name:'趋势数据',exact:true});await trend.waitFor();assert.match(await trend.innerText(),/周期/);
  const expected=state.data(state.currentQuery).trend[9].duration_ms;assert.ok((await trend.innerText()).includes(`${Math.floor(expected/3600000)}小时${Math.floor(expected%3600000/60000)}分钟`));
  await page.getByRole('button',{name:'辅助分析',exact:true}).click();await page.getByRole('button',{name:'查看工作日历数据',exact:true}).click();
  const calendar=page.getByRole('table',{name:'工作日历数据',exact:true});await calendar.waitFor();assert.match(await calendar.innerText(),/2026-10-29/);
  await axe('chart-data');await page.emulateMedia({forcedColors:'active'});
  await calendar.getByRole('columnheader',{name:'有效工时（小时/分钟）',exact:true}).waitFor();
  const chartButton=page.getByRole('button',{name:'查看工作日历数据',exact:true});await chartButton.focus();await page.keyboard.press("Shift+Tab");await page.keyboard.press("Tab");await focused(chartButton);
  assert.notEqual(await chartButton.evaluate(el=>getComputedStyle(el).outlineStyle),'none');
  await page.screenshot({path:fileURLToPath(new URL('forced-colors.png',output))});
  result.passed.push('trend/calendar tables expose server values and remain usable with forced colors');
 }
 {
  await setup();await page.waitForTimeout(350);
  await page.evaluate(()=>{window.liveChanges=[];new MutationObserver(()=>window.liveChanges.push(document.querySelector('.dc-announcer').textContent)).observe(document.querySelector('.dc-announcer'),{childList:true,subtree:true,characterData:true});});
  await page.waitForTimeout(6500);assert.deepEqual(await page.evaluate(()=>window.liveChanges),[]);
  assert.equal(await page.locator('.dc-sync').getAttribute('aria-live'),null);
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();await page.getByRole('status').filter({hasText:'工作数据已刷新'}).waitFor();
  result.passed.push('background polling is silent; explicit refresh announces completion');
 }
 {
  await setup(320,568);await modal();await page.getByRole('button',{name:'保存补录',exact:true}).click();
  const field=page.getByRole('textbox',{name:'补录工作量',exact:true});await page.waitForTimeout(350);await focused(field);await insideViewport(field);await axe('mobile-manual');
  await page.screenshot({path:fileURLToPath(new URL('mobile-error.png',output))});
  result.passed.push('short mobile viewport keeps the invalid field visible and the form scrollable');
 }
 assert.deepEqual(result.errors,[]);await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(error){await page?.screenshot({path:fileURLToPath(new URL('failure.png',output))}).catch(()=>{});await writeFile(new URL('failure.json',output),JSON.stringify({...result,error:String(error)},null,2));throw error;}
finally{await browser.close();}
