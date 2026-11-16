// Verify trend contracts and route loading using isolated HTTP/IPC fixtures only.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dashboardFixture} from './dashboard-fixture.mjs';
import {desktopFixture} from './desktop-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const output=new URL('../artifacts/web-phase-c/qa/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const contract=JSON.parse(await readFile(new URL('../tests/fixtures/dashboard-trend-contract.json',import.meta.url),'utf8'));
const result={passed:[],errors:[],routes:[]};
let context,page;
function chartOption(el){
 let fiber=el[Object.keys(el).find(key=>key.startsWith('__reactFiber'))];
 while(fiber&&!fiber.memoizedProps?.option)fiber=fiber.return;
 let hook=fiber?.memoizedState;while(hook&&typeof hook.memoizedState?.current?.getOption!=='function')hook=hook.next;
 const option=hook.memoizedState.current.getOption();return {axis:option.xAxis[0].data,values:option.series[0].data};
}
async function setup(){
 await context?.close();context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
 page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>result.errors.push(e.message));
 return page;
}
async function date(name,value){const field=page.getByRole('textbox',{name,exact:true});await field.fill(value||'');await field.press('Enter');await page.locator('.wm-picker-dropdown:visible').waitFor({state:'hidden'});}
try{
 for(const index of [0,1,2,3,7]){
  await setup();const state=await dashboardFixture(page),row=state.records[0];state.active=null;
  state.records=contract.records.map((r,i)=>({...row,...r,id:i+1,start_time:Date.parse(r.date+'T12:00:00+08:00'),status:'FINISHED',settlement_status:r.quantity===null?'PENDING':'COMPLETE'}));
  const test=contract.cases[index];
  await page.goto(base+'/dashboard#token=isolated-phase-c');await page.getByRole('button',{name:'应用筛选',exact:true}).waitFor();
  await page.locator('.dc-period-bar').getByText('自定义',{exact:true}).click();
  await date('开始日期',test.query.start_date);await date('结束日期',test.query.end_date);
  if(test.query.category){await page.getByRole('combobox',{name:'筛选工作类别',exact:true}).click();await page.locator('.wm-select-dropdown:visible').getByText(test.query.category,{exact:true}).click();}
  const response=page.waitForResponse(r=>r.url().endsWith('/api/query')&&r.request().postDataJSON()?.start_date===test.query.start_date&&r.request().postDataJSON()?.category===test.query.category);
  await page.getByRole('button',{name:'应用筛选',exact:true}).click();await response;
  await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
  if(!test.expected.count){await page.locator('.dc-trend').getByText('当前范围没有已结束记录。',{exact:true}).waitFor();assert.equal(await page.locator('.dc-trend canvas').count(),0);}
  else{
   await page.locator('.dc-trend canvas').first().waitFor();await page.waitForTimeout(250);
   const option=await page.locator('.dc-trend .dc-chart').evaluate(chartOption);
   assert.equal(option.axis.length,test.expected.count);assert.equal(option.axis[0],test.expected.first);assert.equal(option.axis.at(-1),test.expected.last);
   assert.ok(Math.abs(option.values.reduce((n,v)=>n+v,0)*3600000-test.expected.duration_ms)<0.000001);
   assert.deepEqual(Object.fromEntries(option.axis.flatMap((date,i)=>option.values[i]===0?[]:[[date,Math.round(option.values[i]*3600000)]])),test.expected.nonzero);
   await page.getByRole('button',{name:'查看趋势数据',exact:true}).click();
   const table=page.getByRole('table',{name:'趋势数据',exact:true});await table.getByText(test.expected.first,{exact:true}).waitFor();
   if(index===0)await table.getByRole('row').filter({hasText:'2024-02-29'}).getByRole('cell',{name:'0',exact:true}).waitFor();
   if(index===2){await page.locator('.dc-trend').getByText('每 81 个月汇总（标签为起始月份）',{exact:false}).waitFor();await page.locator('.dc-trend .wm-pagination-item-100').click();await table.getByText(test.expected.last,{exact:true}).waitFor();}
   if(index===0||index===2)await page.locator('.dc-trend').screenshot({path:fileURLToPath(new URL(index===0?'trend-leap-day.png':'trend-bounded.png',output))});
  }
  result.passed.push(test.name);
 }
 await setup();await dashboardFixture(page);const resources=[];page.on('request',r=>{if(/\.(js|css)(?:\?|$)/.test(r.url()))resources.push(r.url().split('/').at(-1));});
 await page.goto(base+'/dashboard#token=isolated-route-loading');await page.locator('.dc-records tr[data-row-key="1"]').waitFor();await page.waitForTimeout(500);
 assert.ok(!resources.some(n=>/^(App-|PanelApp-|NotificationApp-|TaskList-)/.test(n)),JSON.stringify(resources));
 result.routes.push({route:'dashboard',resources});result.passed.push('dashboard avoids desktop-only JavaScript and CSS');
 for(const [query,route] of [['?state=empty','main'],['?panel=settings','panel'],['?notice=1&candidate=1&state=empty','notice']]){
  await setup();await desktopFixture(page);await page.goto(base+'/'+query);await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(200);assert.equal(await page.locator('.data-center').count(),0);
  assert.equal(await page.locator('.desktop-frame').evaluate(el=>getComputedStyle(el).position),'relative',route);
  result.routes.push({route,loaded:true});
 }
 result.passed.push('main, panel and notice routes load their own components and desktop styles');
 assert.deepEqual(result.errors,[]);await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(e){await page?.screenshot({path:fileURLToPath(new URL('failure.png',output))}).catch(()=>{});throw e;}
finally{await browser.close();}
