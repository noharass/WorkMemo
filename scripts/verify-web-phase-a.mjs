// Production UI regression with isolated HTTP fixtures. No user database or task is touched.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture } from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const output=new URL('../artifacts/web-phase-a/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const result={base,passed:[],errors:[]};
let page,context;
async function setup() {
 await context?.close();
 context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
 page=await context.newPage();page.setDefaultTimeout(12000);
 page.on('pageerror',error=>result.errors.push(error.message));
 await page.route('**/dashboard',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,headers:{...response.headers(),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});
 });
 const state=await dashboardFixture(page);
 await page.goto(base+'/dashboard#token=isolated-phase-a');
 await page.locator('.dc-records tr[data-row-key="99"]').waitFor();
 await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
 return state;
}
async function select(label,text) {
 await page.getByRole('combobox',{name:label,exact:true}).click();
 await page.locator('.wm-select-dropdown:visible .wm-select-item-option-content').getByText(text,{exact:true}).click();
}
async function refresh() {
 await page.getByRole('button',{name:'刷新连接',exact:true}).click();
 await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
}
// Inspect the real ECharts option through its ref; never use React's alternating props.
function chartInstance(el) {
 let fiber=el[Object.keys(el).find(key=>key.startsWith('__reactFiber'))];
 while(fiber&&!fiber.memoizedProps?.option)fiber=fiber.return;
 let hook=fiber?.memoizedState;
 while(hook&&typeof hook.memoizedState?.current?.getOption!=='function')hook=hook.next;
 return hook?.memoizedState.current;
}
try {
 {
  const state=await setup();
  Object.assign(state.records[0],{status:'SUSPENDED',end_time:null,quantity:null,settlement_status:'IN_PROGRESS',is_paused:true});
  await select('筛选记录状态','未结束');
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();
  await page.locator('.dc-records tr[data-row-key="1"]').getByText('已挂起',{exact:true}).waitFor();
  await page.locator('.dc-records tr[data-row-key="99"]').getByText('计时中',{exact:true}).waitFor();
  assert.equal(await page.locator('.dc-records tr[data-row-key]').count(),2);
  assert.equal(state.currentQuery.status,'unfinished');
  assert.match(await page.locator('.dc-records tr[data-row-key="1"]').innerText(),/未结算/);
  state.active.is_paused=true;await refresh();
  await page.locator('.dc-records tr[data-row-key="99"]').getByText('已暂停',{exact:true}).waitFor();
  await page.screenshot({path:fileURLToPath(new URL('unfinished.png',output))});
  result.passed.push('unfinished filter includes suspended and paused work; row labels describe actual timer state');
 }
 {
  const state=await setup();
  await page.getByRole('button',{name:'辅助分析',exact:true}).click();
  const selector='.dc-category .dc-chart';
  const getChart=chartInstance.toString();
  const values=[];
  for(const duration of [1,1000,5000,17999,18000,3600000,0]) {
   for(const row of state.records)if(row.category==='评测'){row.duration_ms=0;row.duration_seconds=0;}
   state.records[0].duration_ms=duration;state.records[0].duration_seconds=Math.floor(duration/1000);
   await refresh();
   await page.waitForFunction(({selector,getChart,expected})=>{
    const instance=eval('('+getChart+')')(document.querySelector(selector));
    return instance?.getOption().series[0].data[0].value===expected;
   },{selector,getChart,expected:duration/3600000});
   values.push(await page.locator(selector).evaluate((el,getChart)=>{
    const option=eval('('+getChart+')')(el).getOption(),value=option.series[0].data[0].value;
    return {value,tooltip:option.tooltip[0].valueFormatter(value)};
   },getChart));
  }
  assert.ok(values[0].value>0);assert.match(values[2].tooltip,/5 秒/);assert.equal(values.at(-1).value,0);
  result.precision=values;
  for(const row of state.records)if(row.category==='评测'&&row.settlement_status==='COMPLETE')row.quantity=0;
  state.records[0].quantity=1e-12;
  await select('工作分布指标','工作量');await refresh();
  await page.waitForFunction(({selector,getChart})=>eval('('+getChart+')')(document.querySelector(selector))?.getOption().series[0].data[0].value===1e-12,{selector,getChart});
  const tinyQuantity=await page.locator(selector).evaluate((el,getChart)=>eval('('+getChart+')')(el).getOption().tooltip[0].valueFormatter(1e-12),getChart);
  assert.notEqual(tinyQuantity,'0');result.tinyQuantity=tinyQuantity;
  let unit='month';
  const buckets={month:['2024-01','2025-01','2026-01'],day:['2024-12-31','2025-01-01']};
  await page.route('**/api/query',async route=>{
   const data=state.data(route.request().postDataJSON());
   data.range.trend_unit=unit;
   data.trend=buckets[unit].map(date=>({date,duration_ms:3600000,quantity:1,records:1}));
   await route.fulfill({json:data});
  });
  for(unit of ['month','day']) {
   await refresh();
   const dates=buckets[unit];
   await page.waitForFunction(({getChart,dates})=>{
    const option=eval('('+getChart+')')(document.querySelector('.dc-trend .dc-chart'))?.getOption();
    return JSON.stringify(option?.xAxis[0].data)===JSON.stringify(dates);
   },{getChart,dates});
   const labels=await page.locator('.dc-trend .dc-chart').evaluate((el,getChart)=>{
    const axis=eval('('+getChart+')')(el).getOption().xAxis[0];
    return axis.data.map(value=>typeof axis.axisLabel.formatter==='function'?axis.axisLabel.formatter(value):value);
   },getChart);
   assert.deepEqual(labels,dates);
  }
  result.passed.push('chart values preserve 1ms through normal hours and true zero; day/month labels retain years');
 }
 {
  await setup();let failure=503;
  await page.route('**/api/query',async route=>{
   if(failure===0)return route.fallback();
   if(failure===400)return route.fulfill({status:400,json:{error:'隔离日期范围无效'}});
   return route.fulfill({status:failure,contentType:failure===200?'text/html':'text/plain',body:failure===200?'not json':'busy'});
  });
  for(const [status,text,enabled] of [[503,'WorkMemo 正忙',false],[400,'隔离日期范围无效',true],[403,'连接授权已失效',false],[200,'返回的数据格式异常',false],[504,'请求超时',false]]) {
   failure=status;await refresh();
   await page.getByRole('alert').filter({hasText:text}).waitFor();
   assert.equal(await page.getByRole('button',{name:'补记录',exact:true}).isEnabled(),enabled);
   assert.equal(await page.locator('.dc-records tr[data-row-key]').count(),9);
  }
  failure=0;await refresh();
  assert.equal(await page.getByRole('button',{name:'补记录',exact:true}).isEnabled(),true);
  assert.equal(await page.getByRole('alert').filter({hasText:'刷新失败'}).count(),0);
  result.passed.push('503, business validation, authorization, malformed response and timeout differ; stale data and recovery remain usable');
 }
 {
  const state=await setup();let started=0;
  await page.route('**/api/query',async route=>{
   started++;const data=state.data(route.request().postDataJSON());
   await new Promise(resolve=>setTimeout(resolve,1600));
   await route.fulfill({json:data}).catch(()=>{});
  });
  const request=page.waitForRequest('**/api/query');
  await page.getByRole('button',{name:'刷新连接',exact:true}).click();await request;
  for(let i=0;i<8;i++) {
   await page.getByRole('button',{name:'刷新连接',exact:true}).evaluate(button=>button.click());
   await page.waitForTimeout(60);
  }
  assert.equal(started,1);
  await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
  result.refreshBurstRequests=started;
  result.passed.push('repeated refresh clicks during a slow refresh launch only one query');
 }
 {
  const state=await setup();const cancelled=[];
  page.on('requestfailed',request=>{if(request.url().endsWith('/api/query'))cancelled.push(request.postDataJSON()?.category);});
  await page.route('**/api/query',async route=>{
   const query=route.request().postDataJSON(),data=state.data(query);
   if(query.category==='评测')await new Promise(resolve=>setTimeout(resolve,1500));
   await route.fulfill({json:data}).catch(()=>{});
  });
  await select('筛选工作类别','评测');
  const oldRequest=page.waitForRequest(request=>request.url().endsWith('/api/query')&&request.postDataJSON().category==='评测');
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();await oldRequest;
  await select('筛选工作类别','质检');
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();
  await page.locator('.dc-report-table tr[data-row-key="质检"]').waitFor();
  await page.waitForTimeout(1600);
  assert.ok(cancelled.includes('评测'));
  assert.equal(await page.locator('.dc-report-table tr[data-row-key="评测"]').count(),0);
  assert.equal(await page.getByRole('alert').filter({hasText:'连接已中断'}).count(),0);
  result.passed.push('changing filters aborts the stale query without a disconnect error or late data overwrite');
 }
 assert.deepEqual(result.errors,[]);
 await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result,null,2));
} catch(error) {
 await page?.screenshot({path:fileURLToPath(new URL('failure.png',output))}).catch(()=>{});
 await writeFile(new URL('failure.json',output),JSON.stringify({...result,error:String(error)},null,2));
 throw error;
} finally {await browser.close();}
