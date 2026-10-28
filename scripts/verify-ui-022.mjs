// Optional browser regression check. Uses isolated HTTP fixtures, never a user database.
// Set WORKMEMO_PLAYWRIGHT to a local playwright package entry if it is not installed.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.2/qa/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
const today = new Date().toLocaleDateString('sv-SE');
const record={id:1,category:'开发',quantity:2,remark:'UI regression fixture',start_time:Date.now()-3600000,end_time:Date.now()-1000,duration_ms:3599000,duration_seconds:3599,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'COMPLETE',revision:1,is_demo:false,demo_batch:null};
const graphDays=Array.from({length:90},(_,i)=>{
  const date=new Date();date.setDate(date.getDate()-89+i);
  return {date:date.toLocaleDateString('sv-SE'),duration_ms:(i%8)*1800000,quantity:i%5,records:i%3};
});
let saves=0, failure=null;
await page.route('**/api/**',async route=>{
  const name=new URL(route.request().url()).pathname.split('/').at(-1);
  if(name==='save'){
    saves++;
    if(failure) return route.fulfill({status:failure,contentType:'application/json',body:JSON.stringify({error:failure===409?'记录已变化，请重新读取':'保存失败，请重试'})});
    Object.assign(record,JSON.parse(route.request().postData()));record.revision++;
  }
  const data={meta:{version:'0.2.2',active:null},query:{totals:{duration_ms:3599000,quantity:record.quantity,records:1,pending:0},trend:graphDays,monthly:false,categories:[{category:'开发',duration_ms:3599000,quantity:record.quantity,records:1}],calendar:graphDays.map(d=>[d.date,d.duration_ms]),records:[record],page:1,pages:1,scope:'real'},detail:{record,segments:[],revisions:[]},save:{ok:true}}[name];
  await route.fulfill({json:data});
});
await page.goto('http://127.0.0.1:1420/dashboard#token=isolated-ui-fixture');
await page.getByRole('button',{name:'详情',exact:true}).click();
await page.getByRole('button',{name:'编辑工作量',exact:true}).click();
if(process.argv.includes('--baseline')) {
  await page.waitForTimeout(700);
  assert.equal(saves,1,'v0.2.1 should reproduce the unintended immediate submission');
  assert.equal(await page.locator('#dc-editor').count(),0);
  console.log('Reproduced v0.2.1: clicking edit immediately submits once and returns to detail.');
  await browser.close();process.exit(0);
}
await page.locator('#dc-editor').waitFor();
await page.waitForTimeout(300);
assert.equal(saves,0,'Entering edit must not submit');
assert.equal(await page.locator('#dc-editor input').evaluate(el=>el===document.activeElement),true);
await page.locator('#dc-editor input').fill('0');
failure=500;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.getByRole('alert').filter({hasText:'保存失败'}).waitFor();
assert.equal(await page.locator('#dc-editor input').inputValue(),'0');
failure=409;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.getByRole('alert').filter({hasText:'记录已变化'}).waitFor();
assert.equal(await page.locator('#dc-editor input').inputValue(),'0');
failure=null;
await page.getByRole('button',{name:'保存工作量',exact:true}).click();
await page.locator('#dc-editor').waitFor({state:'detached'});
assert.equal(record.quantity,0);
await page.getByRole('button',{name:'关闭工作详情'}).click();
for(const width of [1024,1280,1440]){
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`page overflow ${width}`);
  await page.screenshot({path:new URL(`dashboard-${width}.png`,output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
}
// Browser zoom equivalence for CSS layout (not native Windows DPI verification).
await page.evaluate(()=>document.documentElement.style.zoom='1.25');
await page.waitForTimeout(400);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.evaluate(()=>document.documentElement.style.zoom='1');
assert.deepEqual(errors,[]);
await writeFile(new URL('browser-result.json',output),JSON.stringify({enterEditNoSubmit:true,focus:true,zeroSave:true,failurePreservesInput:true,revisionConflictPreservesInput:true,widths:[1024,1280,1440],cssZoom:1.25,pageErrors:errors},null,2));
// Mock IPC only in a fresh browser page. No native work commands are sent.
const island=await browser.newPage({viewport:{width:320,height:56}});
await island.addInitScript(({record})=>{
  window.qaTheme='cream';window.qaState='working';window.qaCalls=[];
  window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
  const snapshot=()=>({active:['browse','candidate'].includes(window.qaState)?null:{...record,status:'WORKING',is_paused:window.qaState==='paused',pause_reason:window.qaState==='paused'?'MANUAL':null,control_mode:'AUTO'},monitoring:{browsing_only:window.qaState==='browse',browse_ready:true,start_candidate:window.qaState==='candidate'?{id:7,category:'评测',rule_id:1}:null,away_pause_remaining_seconds:null},recent_records:[],pending_count:0});
  window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'notice'},currentWebview:{label:'notice'}},transformCallback(){return 1;},unregisterCallback(){},invoke:async(command,args)=>{
    window.qaCalls.push(command);
    if(command==='get_snapshot') return snapshot();
    if(command==='get_notice') return null;
    if(command==='get_appearance') return {version:1,theme:window.qaTheme,opacity:94};
    if(command==='get_presentation') return {version:1,categories:{'评测':{icon:'checkSquare',color:'#447cba'},'开发':{icon:'code',color:'#8b5cf6'}},background:null};
    if(command==='pause_task'){window.qaState='paused';return snapshot();}
    if(command==='resume_task'){window.qaState='working';return snapshot();}
    if(command==='enter_browsing'){window.qaState='browse';return snapshot();}
    if(command==='confirm_work'){window.qaState='working';return snapshot();}
    return null;
  }};
},{record});
const islandResults=[];
for(const theme of ['cream','glass','dark','neon']){
  await island.goto('http://127.0.0.1:1420/?notice=1');
  await island.evaluate(t=>window.qaTheme=t,theme);
  await island.waitForTimeout(1100);
  // Appearance reload occurs on mount; reload with theme selected via init for this document.
  const vars=await island.evaluate(async t=>(await import('/src/themes.ts')).themeStyle({version:1,theme:t,opacity:94}),theme);
  await island.locator('.island-frame').evaluate((el,v)=>{for(const [k,val] of Object.entries(v))el.style.setProperty(k,String(val));},vars);
  const button=island.getByRole('button',{name:'暂停记录'});
  await button.waitFor();
  await button.hover();
  const bounds=await island.locator('.island-main-row').boundingBox();
  assert.ok(bounds.y+bounds.height<=56,`island height ${theme}`);
  assert.ok(bounds.x+bounds.width<=320,`island width ${theme}`);
  await island.screenshot({path:new URL(`island-${theme}.png`,output).pathname.replace(/^\/(\w:)/,'$1')});
  islandResults.push(theme);
}
await island.getByRole('button',{name:'暂停记录'}).click();
await island.getByRole('button',{name:'继续记录',exact:true}).click();
await island.evaluate(()=>window.qaState='browse');await island.waitForTimeout(1100);
await island.getByRole('button',{name:'开始记录',exact:true}).waitFor();
await island.getByRole('button',{name:'开始记录',exact:true}).click();
await island.getByRole('button',{name:'暂停记录'}).waitFor();
await island.evaluate(()=>window.qaState='paused');await island.waitForTimeout(1100);
await island.getByRole('button',{name:'继续记录',exact:true}).click();
await island.evaluate(()=>window.qaState='candidate');await island.setViewportSize({width:320,height:88});await island.waitForTimeout(1100);
await island.getByRole('button',{name:'开始记录',exact:true}).waitFor();
await island.screenshot({path:new URL('island-confirm.png',output).pathname.replace(/^\/(\w:)/,'$1')});
await writeFile(new URL('island-result.json',output),JSON.stringify({themes:islandResults,pauseBrowseStartResume:true,candidate:true,native:false},null,2));
const settings=await browser.newPage({viewport:{width:1024,height:850}});
await settings.goto('http://127.0.0.1:1420/?panel=settings&section=layout');
await settings.locator('.layout-form').waitFor();
for(const width of [1024,600]){
  await settings.setViewportSize({width,height:850});
  const alignment=await settings.locator('.layout-form').evaluate(el=>{
    const form=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect();
    return {centerDifference:Math.abs((form.left+form.right)-(parent.left+parent.right)),width:form.width,scrollWidth:el.scrollWidth};
  });
  assert.ok(alignment.centerDifference<2,JSON.stringify(alignment));
  assert.ok(alignment.width<=650 && alignment.scrollWidth<=alignment.width+1,JSON.stringify({width,...alignment}));
}
await settings.screenshot({path:new URL('layout-settings.png',output).pathname.replace(/^\/(\w:)/,'$1')});
await browser.close();
console.log('Dashboard UI regression passed; fixtures only.');
