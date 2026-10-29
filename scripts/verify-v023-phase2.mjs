// Isolated report, editor and sound-settings fixtures. Never uses a real database.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const output=new URL('../artifacts/0.2.3/qa/',import.meta.url);await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},timezoneId:'Asia/Shanghai'});
 const errors=[];context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
 await context.addInitScript(()=>{window.qaErrors=[];window.addEventListener('error',e=>window.qaErrors.push(e.message));});
 const page=await context.newPage();
 const keys=['评测','质检','开发','文档'];
 const names={revision:1,names:{'评测':'评测','质检':'质检','开发':'代码开发','文档':'文档'}};
 const presentation={version:1,revision:0,background:null,categories:Object.fromEntries(keys.map((k,i)=>[k,{icon:['checkSquare','safety','code','note'][i],color:['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i]}]))};
 let records=Array.from({length:8},(_,i)=>({id:i+1,category:i<5?'评测':i===5?'质检':'开发',quantity:i<4?[30,40,50,8.5][i]:i===5?0:null,remark:'隔离演示数据 · 不写入用户数据库',start_time:Date.parse('2026-10-29T09:00:00+08:00')+i*1800000,end_time:Date.parse('2026-10-29T10:00:00+08:00')+i*1800000,duration_ms:i<5?1920000:i===5?1200000:2250000,duration_seconds:i<5?1920:i===5?1200:2250,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:i<4||i===5?'COMPLETE':'PENDING',source:'MANUAL_START',pause_reason:null,confirmed_end_time:Date.parse('2026-10-29T10:00:00+08:00')+i*1800000,last_input_time:null,end_reason:'MANUAL',legacy_duration_ms:0,revision:0,control_mode:'MANUAL',is_demo:true,demo_batch:'isolated-phase2-fixture'}));
 const active={...records[0],id:99,category:'开发',is_demo:false,quantity:null,status:'WORKING',settlement_status:'IN_PROGRESS',end_time:null,is_paused:false,duration_ms:25000,duration_seconds:25};
 let saveFailure=null;let queryFailure=false;let saves=0;let currentQuery;
 const iso=d=>d.toISOString().slice(0,10);
 function resolveRange(q){
  const anchor=q.anchor_date??'2026-10-29';const d=new Date(anchor+'T12:00:00Z');let start=q.start_date,end=q.end_date;
  if(q.period==='day')start=end=anchor;
  if(q.period==='week'){const weekday=(d.getUTCDay()+6)%7;d.setUTCDate(d.getUTCDate()-weekday);start=iso(d);d.setUTCDate(d.getUTCDate()+6);end=iso(d);}
  if(q.period==='month'){d.setUTCDate(1);start=iso(d);d.setUTCMonth(d.getUTCMonth()+1);d.setUTCDate(0);end=iso(d);}
  return {period:q.period,anchor_date:q.period==='custom'?null:anchor,start_date:start,end_date:end,trend_unit:q.period==='day'?'hour':'day'};
 }
 function data(q){
  const range=resolveRange(q);
  const filtered=[...records,active].filter(row=>{
   const date=iso(new Date(row.start_time+8*3600000));
   return (q.scope==='all'||row.is_demo===(q.scope==='demo'))&&(!range.start_date||date>=range.start_date)&&(!range.end_date||date<=range.end_date)&&(!q.category||row.category===q.category)&&(q.status==='all'||q.status==='working'&&row.status==='WORKING'||q.status==='pending'&&row.settlement_status==='PENDING'||q.status==='complete'&&row.settlement_status==='COMPLETE');
  });
  const ended=filtered.filter(row=>row.status==='FINISHED');
  const aggregate=rows=>({duration_ms:rows.reduce((n,row)=>n+row.duration_ms,0),quantity:rows.filter(row=>row.settlement_status==='COMPLETE').reduce((n,row)=>n+row.quantity,0),records:rows.length,pending:rows.filter(row=>row.settlement_status==='PENDING').length,complete:rows.filter(row=>row.settlement_status==='COMPLETE').length});
  const categories=keys.filter(key=>!q.category||key===q.category).map(category=>({category,...aggregate(ended.filter(row=>row.category===category))}));
  const buckets=q.period==='day'?Array.from({length:24},(_,h)=>String(h).padStart(2,'0')+':00'):q.period==='custom'?['2026-10-29']:Array.from({length:32},(_,i)=>{const d=new Date(range.start_date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+i);return iso(d);}).filter(date=>date<=range.end_date);
  const trend=buckets.map(date=>({date,...aggregate(ended.filter(row=>q.period==='day'?new Date(row.start_time+8*3600000).getUTCHours()===Number(date.slice(0,2)):iso(new Date(row.start_time+8*3600000))===date))}));
  return {range,totals:aggregate(ended),categories,trend,monthly:false,calendar:[],records:filtered,record_count:filtered.length,page:1,pages:1,scope:q.scope};
 }
 await page.route('**/api/**',async route=>{
  const endpoint=new URL(route.request().url()).pathname.split('/').at(-1);const body=route.request().postDataJSON();
  if(endpoint==='meta')return route.fulfill({json:{version:'0.2.3 开发验收',presentation,category_names:names,active}});
  if(endpoint==='query'){currentQuery=body;if(queryFailure)return route.fulfill({status:500,json:{error:'隔离统计读取失败'}});return route.fulfill({json:data(body)});}
  if(endpoint==='detail')return route.fulfill({json:{record:records.find(row=>row.id===body.id),segments:[],revisions:[]}});
  if(endpoint==='save'){saves++;if(saveFailure)return route.fulfill({status:saveFailure,json:{error:saveFailure===409?'记录已被其他窗口修改':'隔离保存失败'}});const row=records.find(row=>row.id===body.id);Object.assign(row,body,{revision:row.revision+1,settlement_status:'COMPLETE'});return route.fulfill({json:{saved:true}});}
  if(endpoint==='delete'){records=records.filter(row=>row.id!==body.id);return route.fulfill({json:{deleted:true}});}
  return route.fulfill({status:404,json:{error:'fixture endpoint missing'}});
 });
 await page.goto('http://127.0.0.1:1420/dashboard#token=isolated-phase2-fixture&scope=demo');
 const report=page.locator('.dc-category-report');
 await report.getByText('128.5',{exact:true}).waitFor();
 assert.equal(currentQuery.period,'day');assert.equal(currentQuery.anchor_date,null);
 assert.equal(await report.locator('tbody tr').count(),4);
 assert.equal(await report.locator('tbody tr').nth(1).locator('strong').textContent(),'0');
 assert.equal(await report.locator('tbody tr').nth(2).locator('strong').textContent(),'待补填');
 assert.equal(await report.locator('tbody tr').nth(3).locator('strong').textContent(),'—');
 assert.equal(await page.locator('.dc-kpis article').count(),3);
 const widths=[];
 for(const width of [390,800,1024,1280,1440,1600,1920]){
  await page.setViewportSize({width,height:1000});await page.waitForTimeout(200);
  const box=await page.evaluate(()=>{const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width};};return {report:rect('.dc-category-report'),trend:rect('.dc-trend'),overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(box.overflow,false,`overflow at ${width}`);assert.ok(box.report.bottom<=box.trend.top);
  widths.push({width,...box});
  if(width===1440){await page.setViewportSize({width,height:Math.ceil(box.report.bottom)+12});await page.screenshot({path:new URL('phase2-overview-desktop.png',output).pathname.replace(/^\/(\w:)/,'$1')});await page.setViewportSize({width,height:1000});}
  await page.screenshot({path:new URL(`phase2-report-${width}.png`,output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.locator('.dc-auxiliary summary').click();await page.locator('.dc-auxiliary .dc-chart canvas').first().waitFor();
 await page.waitForTimeout(300);assert.equal(await page.locator('.dc-auxiliary .dc-chart canvas').count(),2);
 await page.locator('.dc-auxiliary summary').click();await page.locator('.dc-auxiliary canvas').first().waitFor({state:'detached'});
 await page.getByRole('button',{name:'周',exact:true}).click();await page.locator('.dc-period-nav strong').filter({hasText:'2026-10-26 — 2026-11-01'}).waitFor();
 await page.getByRole('button',{name:'下一周期'}).click();await page.locator('.dc-period-nav strong').filter({hasText:'2026-11-02 — 2026-11-08'}).waitFor();
 await page.getByRole('button',{name:'上一周期'}).click();await report.getByText('128.5',{exact:true}).waitFor();
 await page.getByRole('button',{name:'月',exact:true}).click();await page.locator('.dc-period-nav strong').filter({hasText:'2026 年 10 月'}).waitFor();
 await page.getByLabel('基准日期',{exact:true}).fill('2024-02-29');await page.getByRole('button',{name:'应用筛选'}).click();await page.locator('.dc-period-nav strong').filter({hasText:'2024 年 02 月'}).waitFor();
 assert.equal(resolveRange(currentQuery).end_date,'2024-02-29');
 await page.getByRole('button',{name:'本月',exact:true}).click();await report.getByText('128.5',{exact:true}).waitFor();
 await page.getByRole('button',{name:'自定义',exact:true}).click();await page.getByRole('button',{name:'全部日期',exact:true}).click();await report.getByText('最早记录 — 至今',{exact:false}).waitFor();
 await page.getByLabel('筛选工作类别',{exact:true}).selectOption('开发');await page.getByRole('button',{name:'应用筛选'}).click();await page.waitForTimeout(100);assert.equal(currentQuery.category,'开发');assert.equal(await report.locator('tbody tr').count(),1);assert.equal(await report.locator('tbody strong').textContent(),'待补填');
 await page.getByLabel('筛选工作类别',{exact:true}).selectOption('');await page.getByRole('button',{name:'应用筛选'}).click();await report.getByText('128.5',{exact:true}).waitFor();
 await page.locator('.dc-records').getByRole('button',{name:'详情',exact:true}).first().click();await page.getByRole('button',{name:'编辑工作量',exact:true}).click();await page.locator('#dc-editor').waitFor();assert.equal(saves,0);assert.equal(await page.locator('#dc-editor input').evaluate(el=>el===document.activeElement),true);
 await page.locator('#dc-editor input').fill('0');
 for(const status of [500,409]){saveFailure=status;await page.getByRole('button',{name:'保存工作量',exact:true}).click();await page.getByRole('alert').filter({hasText:status===409?'记录已被其他窗口修改':'隔离保存失败'}).waitFor();assert.equal(await page.locator('#dc-editor input').inputValue(),'0');}
 saveFailure=null;await page.getByRole('button',{name:'保存工作量',exact:true}).click();await page.locator('#dc-editor').waitFor({state:'detached'});await page.getByRole('button',{name:'关闭工作详情'}).click();await report.getByText('98.5',{exact:true}).waitFor();
 queryFailure=true;await page.getByRole('button',{name:'刷新连接',exact:true}).click();await page.getByRole('alert').filter({hasText:'隔离统计读取失败'}).waitFor();assert.equal(await page.locator('.dc-kpis strong').first().textContent(),'—小时');
 queryFailure=false;await page.getByRole('button',{name:'刷新连接',exact:true}).click();await report.getByText('98.5',{exact:true}).waitFor();
 await page.evaluate(()=>document.documentElement.style.zoom='1.25');await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.evaluate(()=>document.documentElement.style.zoom='1');
 names.names['开发']='超长工作类型名称用于检查窄屏的完整显示';
 await page.setViewportSize({width:390,height:1000});
 await page.getByRole('button',{name:'刷新连接',exact:true}).click();
 await report.locator('.work-badge').filter({hasText:names.names['开发']}).waitFor();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 assert.equal(await report.locator('.work-badge > span:last-child').last().evaluate(el=>getComputedStyle(el).whiteSpace),'normal');
 assert.deepEqual(await page.evaluate(()=>window.qaErrors),[]);

 const settings=await context.newPage();
 await settings.addInitScript(()=>{
  window.isTauri=true;window.qaPreview=[];window.qaSaveFails=false;
  const initial={density:'compact',revision:0,sound_enabled:false,sound_theme:'soft',font_size:14,font_weight:400,line_spacing:'standard'};
  window.qaLayout=JSON.parse(sessionStorage.getItem('qa-sound-layout')??JSON.stringify(initial));
  window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
  window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'settings'},currentWebview:{label:'settings'}},transformCallback(){return 1;},unregisterCallback(){},invoke:async(command,args)=>{
   if(command==='get_layout_settings')return structuredClone(window.qaLayout);
   if(command==='get_appearance')return {version:1,theme:'cream',opacity:94};
   if(command==='get_category_names')return {revision:0,names:Object.fromEntries(['评测','质检','开发','文档'].map(k=>[k,k]))};
   if(command==='get_presentation')return {version:1,revision:0,background:null,categories:{}};
   if(command==='preview_sound'){window.qaPreview.push(args);return;}
   if(command==='set_layout_options'){if(window.qaSaveFails)throw new Error('隔离布局保存失败');window.qaLayout={...args.input,revision:window.qaLayout.revision+1};sessionStorage.setItem('qa-sound-layout',JSON.stringify(window.qaLayout));return structuredClone(window.qaLayout);}
   return null;
  }};
 });
 await settings.goto('http://127.0.0.1:1420/?panel=settings&section=layout');
 for(const theme of ['soft','crisp']){
  await settings.getByLabel('提示音套装',{exact:true}).selectOption(theme);
  for(const label of ['开始','暂停','恢复','结束','空闲提醒'])await settings.getByRole('button',{name:'试听'+label,exact:true}).click();
 }
 assert.deepEqual(await settings.evaluate(()=>window.qaPreview),['soft','crisp'].flatMap(theme=>['start','pause','resume','end','warning'].map(cue=>({theme,cue}))));
 assert.equal(await settings.getByLabel('关键状态提示音',{exact:true}).isChecked(),false);
 await settings.evaluate(()=>window.qaSaveFails=true);await settings.getByRole('button',{name:'保存布局',exact:true}).click();await settings.getByRole('alert').filter({hasText:'隔离布局保存失败'}).waitFor();assert.equal(await settings.getByLabel('提示音套装',{exact:true}).inputValue(),'crisp');
 await settings.evaluate(()=>window.qaSaveFails=false);await settings.getByRole('button',{name:'保存布局',exact:true}).click();await settings.waitForFunction(()=>window.qaLayout.revision===1);await settings.reload();await settings.getByLabel('提示音套装',{exact:true}).waitFor();assert.equal(await settings.getByLabel('提示音套装',{exact:true}).inputValue(),'crisp');assert.equal(await settings.getByLabel('关键状态提示音',{exact:true}).isChecked(),false);
 await settings.screenshot({path:new URL('phase2-sound-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
 assert.deepEqual(errors,[]);
 await writeFile(new URL('phase2-ui-result.json',output),JSON.stringify({periodNavigation:true,leapMonth:true,zeroAndPendingSeparate:true,reportBeforeTrend:true,independentQuantity:true,auxiliaryToggle:true,editorFailureAndZeroSave:true,queryFailureNoFalseTotals:true,tenSoundPreviewCalls:true,mutePreserved:true,soundSaveReload:true,cssZoom:1.25,widths,pageErrors:errors},null,2));
 console.log('v0.2.3 phase 2 reports, editor and sound settings passed; isolated fixtures only.');
}finally{await browser.close();}
