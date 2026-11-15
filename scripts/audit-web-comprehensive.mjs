// Evidence collection only. API traffic uses in-memory fixtures, never a work database.
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const base = process.env.WORKMEMO_WEB_URL || 'http://127.0.0.1:4174';
const output = new URL('../artifacts/web-comprehensive/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const result = {base, scenarios:{}, errors:[]};
async function setup(options={}) {
 const context = await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai',...options});
 const page = await context.newPage();
 page.setDefaultTimeout(12000);
 page.on('pageerror',e=>result.errors.push(e.message));
 const state = await dashboardFixture(page);
 await page.goto(base+'/dashboard#token=isolated-comprehensive-audit');
 await page.getByRole('button',{name:'评测待补填1条',exact:true}).waitFor();
 return {context,page,state};
}
async function shot(page,name) {await page.screenshot({path:fileURLToPath(new URL(name+'.png',output)),fullPage:false});}
async function axe(page,name) {
 if (!process.env.WORKMEMO_AXE) return;
 await page.waitForTimeout(450); // Inspect settled colors, not overlay entrance opacity.
 if (!await page.evaluate(()=>!!window.axe)) await page.addScriptTag({path:process.env.WORKMEMO_AXE});
 const report = await page.evaluate(async()=>{
  const value=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}});
  return {violations:value.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))})),incomplete:value.incomplete.map(v=>({id:v.id,count:v.nodes.length}))};
 });
 await writeFile(new URL('axe-'+name+'.json',output),JSON.stringify(report,null,2));
 result.scenarios['axe-'+name]=report.violations.map(v=>({id:v.id,impact:v.impact,count:v.nodes.length}));
}
try {
 {
  const {context,page}=await setup();
  await axe(page,'overview');
  result.scenarios.document=await page.evaluate(()=>({title:document.title,lang:document.documentElement.lang,skipLinks:[...document.querySelectorAll('a')].filter(a=>a.textContent.includes('跳')).length}));
  await page.getByRole('button',{name:'评测待补填1条',exact:true}).click();
  await page.getByRole('button',{name:'补填记录5',exact:true}).waitFor();
  result.scenarios.pendingBackground=await page.evaluate(()=>({inert:document.querySelector('.dc-page').inert,sidebarInert:document.querySelector('.dc-sidebar').inert,dialogModal:document.querySelector('[role="dialog"]')?.getAttribute('aria-modal')}));
  await axe(page,'pending');
  await shot(page,'pending');
  await page.getByRole('button',{name:'关闭',exact:true}).click();
  await page.locator('.dc-sheet-root .wm-drawer-section').waitFor({state:'hidden'});
  await page.getByRole('button',{name:'补记录',exact:true}).click();
  await page.getByRole('textbox',{name:'补录工作量',exact:true}).fill('2');
  await page.getByRole('button',{name:'取消',exact:true}).click();
  await page.getByRole('dialog',{name:'放弃这次补记录？'}).waitFor();
  result.scenarios.manualNested=await page.locator('.dc-manual-entry').evaluate(el=>({inert:!!el.closest('[inert]'),hidden:!!el.closest('[aria-hidden="true"]'),dialogs:[...document.querySelectorAll('[role="dialog"]')].map(d=>({title:d.getAttribute('aria-labelledby'),inert:!!d.closest('[inert]'),hidden:!!d.closest('[aria-hidden="true"]')}))}));
  await axe(page,'nested-manual');
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  await page.getByRole('button',{name:'辅助分析',exact:true}).click();
  await page.locator('.dc-category .dc-chart canvas').waitFor();
  for (const row of state.records) if(row.category==='评测') row.duration_ms=1000;
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.waitForTimeout(500);
  result.scenarios.chartValues=await page.locator('.dc-category .dc-chart').evaluate(el=>{
   let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber'))];
   while(f && !f.memoizedProps?.option) f=f.return;
   let hook=f.memoizedState;
   while(hook && typeof hook.memoizedState?.current?.getOption!=='function') hook=hook.next;
   const option=hook.memoizedState.current.getOption();
   return {series:option.series[0].data,inputMilliseconds:5000};
  });
  await page.route('**/api/query',async route=>{
   const data=state.data(route.request().postDataJSON());
   data.range={period:'custom',anchor_date:null,start_date:'2024-01-01',end_date:'2026-01-31',trend_unit:'month'};
   data.trend=[{date:'2024-01',duration_ms:3600000,quantity:1,records:1},{date:'2025-01',duration_ms:7200000,quantity:1,records:1},{date:'2026-01',duration_ms:3600000,quantity:1,records:1}];
   await route.fulfill({json:data});
  });
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.getByText('按开始月份汇总 · 已结束记录的有效工时',{exact:true}).waitFor();
  await page.waitForTimeout(500);
  result.scenarios.monthAxis=await page.locator('.dc-trend .dc-chart').evaluate(el=>{
   let f=el[Object.keys(el).find(k=>k.startsWith('__reactFiber'))];
   while(f && !f.memoizedProps?.option) f=f.return;
   let hook=f.memoizedState;
   while(hook && typeof hook.memoizedState?.current?.getOption!=='function') hook=hook.next;
   const axis=hook.memoizedState.current.getOption().xAxis[0];
   return {dates:axis.data,labels:axis.data.map(value=>typeof axis.axisLabel.formatter==='function'?axis.axisLabel.formatter(value):value)};
  });
  await shot(page,'monthly-axis');
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  await page.route('**/api/query',route=>route.fulfill({status:503,contentType:'text/plain',body:'busy'}));
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.getByText('WorkMemo 正忙，请稍后刷新连接。',{exact:true}).waitFor();
  result.scenarios.nonJson503={visible:await page.locator('.dc-notice').first().innerText(),manualEnabled:await page.getByRole('button',{name:'补记录',exact:true}).isEnabled()};
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  let inflight=0,peak=0,started=0,finished=0;
  await page.route('**/api/query',async route=>{
   started++;peak=Math.max(peak,++inflight);
   const data=state.data(route.request().postDataJSON());
   await new Promise(resolve=>setTimeout(resolve,2400));
   await route.fulfill({json:data}).catch(()=>{});
   inflight--;finished++;
  });
  for(let i=0;i<8;i++) {
   await page.getByRole('button',{name:'刷新连接',exact:true}).evaluate(button=>button.click());
   await page.waitForTimeout(100);
  }
  await page.waitForTimeout(2700);
  result.scenarios.refreshConcurrency={started,finished,peak};
  await context.close();
 }
 {
  const {context,page}=await setup();
  await page.locator('.dc-records').getByRole('button',{name:'编辑',exact:true}).first().click();
  await page.locator('#dc-quantity').fill('-1');
  await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'有效工作量'}).waitFor();
  result.scenarios.editorValidation=await page.locator('#dc-quantity').evaluate(el=>({invalid:el.getAttribute('aria-invalid'),description:el.getAttribute('aria-describedby'),required:el.required,active:document.activeElement?.outerHTML.slice(0,150)}));
  result.scenarios.editorErrorPosition=await page.locator('.dc-detail-content > .wm-alert').evaluate(el=>{
   const error=el.getBoundingClientRect(),body=el.closest('.wm-drawer-body').getBoundingClientRect();
   return {errorTop:error.top,errorBottom:error.bottom,bodyTop:body.top,bodyBottom:body.bottom,visibleInBody:error.top<body.bottom && error.bottom>body.top};
  });
  await axe(page,'editor');
  await shot(page,'editor');
  await context.close();
 }
 {
  const {context,page,state}=await setup();
  Object.assign(state.records[0],{status:'SUSPENDED',is_paused:true,end_time:null,settlement_status:'IN_PROGRESS'});
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();
  await page.waitForTimeout(500);
  result.scenarios.suspendedLabel=await page.locator('.dc-records tr[data-row-key="1"]').innerText();
  await context.close();
 }
 {
  const {context,page}=await setup({viewport:{width:320,height:568}});
  await page.getByRole('button',{name:'补记录',exact:true}).click();
  result.scenarios.shortMobile=await page.locator('.dc-manual-entry .wm-modal-body').evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight,overflow:getComputedStyle(el).overflowY,viewport:innerHeight,documentWidth:document.documentElement.scrollWidth}));
  await axe(page,'mobile-manual');
  await shot(page,'mobile');
  await context.close();
 }
 result.scenarios.performance=[];
 for(let sample=0;sample<3;sample++) {
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
  await context.addInitScript(()=>{
   window.auditMetrics={longTasks:[],lcp:0,cls:0};
   new PerformanceObserver(list=>{window.auditMetrics.longTasks.push(...list.getEntries().map(x=>x.duration));}).observe({type:'longtask',buffered:true});
   new PerformanceObserver(list=>{window.auditMetrics.lcp=list.getEntries().at(-1)?.startTime||0;}).observe({type:'largest-contentful-paint',buffered:true});
   new PerformanceObserver(list=>{for(const x of list.getEntries()) if(!x.hadRecentInput)window.auditMetrics.cls+=x.value;}).observe({type:'layout-shift',buffered:true});
  });
  const page=await context.newPage();
  await dashboardFixture(page);
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await page.goto(base+'/dashboard#token=isolated-performance');
  await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  await page.waitForTimeout(1000);
  result.scenarios.performance.push(await page.evaluate(()=>({...window.auditMetrics,resources:performance.getEntriesByType('resource').filter(x=>x.name.endsWith('.js')).map(x=>({name:x.name.split('/').at(-1),bytes:x.decodedBodySize}))})));
  await context.close();
 }
} finally {
 await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
 await browser.close();
}
