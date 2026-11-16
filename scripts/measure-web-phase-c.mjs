// Local lab measurements only: production assets, isolated HTTP data, no telemetry.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {dashboardFixture} from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const label=process.env.WORKMEMO_MEASUREMENT||'after';
assert.match(label,/^[a-z0-9-]+$/);
const output=new URL(`../artifacts/web-phase-c/${label}/`,import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const report={label,browser:browser.version(),cpu:4,viewport:[1440,1000],samples:[]};
try{
 for(let sample=1;sample<=3;sample++){
  const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
  const page=await context.newPage();page.setDefaultTimeout(20000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await dashboardFixture(page);
  await page.route('**/dashboard',async route=>{const r=await route.fetch();await route.fulfill({response:r,headers:{...r.headers(),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});});
  await context.addInitScript(()=>{
   window.lab={longTasks:[],frames:[],events:[],lcp:0,cls:0};
   const observe=(type,callback,extra={})=>{if(PerformanceObserver.supportedEntryTypes.includes(type))new PerformanceObserver(callback).observe({type,buffered:true,...extra});};
   observe('longtask',list=>window.lab.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration}))));
   observe('largest-contentful-paint',list=>window.lab.lcp=list.getEntries().at(-1)?.startTime||0);
   observe('layout-shift',list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.lab.cls+=e.value;});
   observe('long-animation-frame',list=>window.lab.frames.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration,scripts:e.scripts.map(s=>({source:s.sourceURL.split('/').at(-1),duration:s.duration,invoker:s.invoker,function:s.sourceFunctionName}))}))));
   observe('event',list=>window.lab.events.push(...list.getEntries().filter(e=>e.interactionId).map(e=>({name:e.name,duration:e.duration,interactionId:e.interactionId}))),{durationThreshold:16});
  });
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,loading,blink.user_timing',transferMode:'ReturnAsStream'});
  await page.goto(base+'/dashboard#token=isolated-phase-c-performance');
  await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  await page.locator('.dc-trend canvas').waitFor();
  await page.waitForTimeout(1000);
  const cold=await page.evaluate(()=>({...window.lab,ready:performance.now(),resources:performance.getEntriesByType('resource').filter(e=>/\.js(?:\?|$)/.test(e.name)).map(e=>({name:e.name.split('/').at(-1),bytes:e.decodedBodySize}))}));
  const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));
  await cdp.send('Tracing.end');const {stream}=await complete;
  let traceText='';while(true){const chunk=await cdp.send('IO.read',{handle:stream});traceText+=chunk.data;if(chunk.eof)break;}
  await cdp.send('IO.close',{handle:stream});
  await writeFile(new URL(`cold-${sample}.trace.json`,output),traceText);
  const events=JSON.parse(traceText).traceEvents;
  const timeline={};for(const e of events)if(e.ph==='X'&&e.dur&&['EvaluateScript','v8.compile','v8.compileModule','v8.evaluateModule','FunctionCall','Layout','UpdateLayoutTree','Paint','RunTask'].includes(e.name))timeline[e.name]=(timeline[e.name]||0)+e.dur/1000;
  const scriptEvents=events.filter(e=>e.ph==='X'&&['EvaluateScript','v8.compile','v8.compileModule','v8.evaluateModule'].includes(e.name)).map(e=>({name:e.name,duration:e.dur/1000,url:e.args?.data?.url||e.args?.data?.fileName})).sort((a,b)=>b.duration-a.duration).slice(0,12);
  const interactions=[];
  for(const value of ['周','日','月']){
   const period=({'周':'week','日':'day','月':'month'})[value];
   const response=page.waitForResponse(r=>r.url().endsWith('/api/query')&&r.request().postDataJSON()?.period===period);
   const start=performance.now();await page.locator('.dc-period-bar').getByText(value,{exact:true}).click();
   await response;
   await page.waitForFunction(()=>![...document.querySelectorAll('button')].find(b=>b.textContent==='刷新连接')?.disabled);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   interactions.push({action:`period-${value}`,clickToSettledMs:performance.now()-start});
  }
  const start=performance.now();await page.getByRole('button',{name:'辅助分析',exact:true}).click();
  await page.locator('.dc-calendar canvas').first().waitFor();
  await page.waitForTimeout(350);
  interactions.push({action:'expand-charts',clickToSettledMs:performance.now()-start});
  const eventTiming=await page.evaluate(()=>window.lab.events);
  assert.deepEqual(errors,[]);
  const entry={cold,timeline,scriptEvents,interactions,eventTiming,errors};report.samples.push(entry);
  console.log(JSON.stringify({sample,jsBytes:cold.resources.reduce((sum,r)=>sum+r.bytes,0),maxLongTask:Math.max(0,...cold.longTasks.map(x=>x.duration)),lcp:cold.lcp,cls:cold.cls,timeline,interactions}));
  await context.close();
 }
 await writeFile(new URL('result.json',output),JSON.stringify(report,null,2));
}finally{await browser.close();}
