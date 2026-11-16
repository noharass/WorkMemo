// Real browser zoom in a disposable Chromium profile, never a user's browser profile.
// A temporary local-only extension calls tabs.setZoom/getZoom; no CSS zoom emulation.
import assert from 'node:assert/strict';
import {mkdir,writeFile,mkdtemp} from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dashboardFixture} from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:4174';
const output=new URL('../artifacts/web-phase-d/',import.meta.url);
await mkdir(output,{recursive:true});
const extension=new URL('zoom-extension/',output);await mkdir(extension,{recursive:true});
await writeFile(new URL('manifest.json',extension),JSON.stringify({manifest_version:3,name:'WorkMemo isolated zoom verification',version:'1.0',host_permissions:['http://127.0.0.1/*'],background:{service_worker:'worker.js'}}));
await writeFile(new URL('worker.js',extension),'chrome.runtime.onInstalled.addListener(() => {});');
const profile=await mkdtemp(fileURLToPath(new URL('chromium-profile-',output)));
const context=await chromium.launchPersistentContext(profile,{
 channel:'chromium',headless:true,viewport:null,timezoneId:'Asia/Shanghai',
 ...(process.env.WORKMEMO_CHROMIUM_EXECUTABLE?{executablePath:process.env.WORKMEMO_CHROMIUM_EXECUTABLE}:{}),
 args:['--force-device-scale-factor=1','--window-size=1440,1000',`--disable-extensions-except=${fileURLToPath(extension)}`,`--load-extension=${fileURLToPath(extension)}`],
});
const result={browser:context.browser()?.version(),zoom:[],errors:[],isolated:true};
let page;
async function visibleFocus(locator){
 await locator.evaluate(el=>new Promise((resolve,reject)=>{const end=performance.now()+1500;function poll(){if(document.activeElement===el)resolve();else if(performance.now()>end)reject(new Error('Invalid field not focused'));else requestAnimationFrame(poll);}poll();}));
 assert.equal(await locator.evaluate(el=>{const r=el.getBoundingClientRect(),body=el.closest('.wm-drawer-body,.wm-modal-body').getBoundingClientRect();return r.top>=body.top&&r.bottom<=body.bottom&&r.top>=0&&r.bottom<=innerHeight;}),true);
}
async function tabInside(dialog){for(let i=0;i<12;i++){await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true);}}
async function capture(name){
 // Keep the actual window/zoom untouched; Playwright's page screenshot resizes
 // a viewport:null window in this runtime and produces misleading clipped images.
 const cdp=await context.newCDPSession(page);
 try{const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});await writeFile(new URL(name,output),Buffer.from(shot.data,'base64'));}
 finally{await cdp.detach();}
}
try{
 const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');
 for(const factor of [1.25,1.5,2]){
  page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>result.errors.push(e.message));
  const state=await dashboardFixture(page),beforeActive=JSON.stringify(state.active);
  await page.route('**/dashboard',async route=>{const r=await route.fetch();await route.fulfill({response:r,headers:{...r.headers(),'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'"}});});
  await page.goto(base+'/dashboard#token=isolated-phase-d');await page.locator('.dc-records tr[data-row-key="1"]').waitFor();
  const before=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio}));
  const actual=await worker.evaluate(async({base,factor})=>{
   const tabs=await chrome.tabs.query({url:base+'/*'});if(tabs.length!==1)throw new Error('Expected one isolated test tab');
   const id=tabs[0].id;await chrome.tabs.setZoomSettings(id,{mode:'automatic',scope:'per-tab'});await chrome.tabs.setZoom(id,factor);return chrome.tabs.getZoom(id);
  },{base,factor});
  assert.equal(actual,factor);await page.waitForTimeout(400);
  const metrics=await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio,cssZoom:getComputedStyle(document.documentElement).zoom,documentWidth:document.documentElement.scrollWidth}));
  assert.ok(Math.abs(before.width/factor-metrics.width)<3);assert.ok(Math.abs(before.dpr*factor-metrics.dpr)<0.01);assert.equal(metrics.cssZoom,'1');
  assert.ok(metrics.documentWidth<=metrics.width+2,'Horizontal page overflow');
  await page.getByRole('button',{name:'编辑',exact:true}).first().click();
  const sheet=page.locator('.dc-sheet-root .wm-drawer-section');await sheet.waitFor();
  const quantity=page.getByRole('textbox',{name:'工作量',exact:true});await quantity.fill('-1');await page.getByRole('button',{name:'保存工作量',exact:true}).click();
  await visibleFocus(quantity);assert.equal(await quantity.getAttribute('aria-invalid'),'true');await tabInside(sheet);
  await page.keyboard.press('Escape');const guard=page.getByRole('dialog',{name:'保留未保存的修改？',exact:true});await guard.waitFor();
  assert.equal(await page.locator('#dc-quantity').evaluate(el=>!!el.closest('[inert]')),true);await tabInside(guard);
  await guard.getByRole('button',{name:'放弃修改',exact:true}).click();await sheet.waitFor({state:'hidden'});
  await page.getByRole('button',{name:'补记录',exact:true}).click();const manual=page.getByRole('dialog',{name:'补记录',exact:true});await manual.waitFor();
  await page.getByRole('button',{name:'保存补录',exact:true}).click();const field=page.getByRole('textbox',{name:'补录工作量',exact:true});await visibleFocus(field);
  await capture(`zoom-${Math.round(factor*100)}.png`);
  await tabInside(manual);
  if(factor===2){await page.emulateMedia({forcedColors:'active'});await field.focus();await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');await visibleFocus(field);assert.notEqual(await field.evaluate(el=>getComputedStyle(el).outlineStyle),'none');await capture('zoom-200-forced-colors.png');}
  assert.equal(state.saves,0);assert.equal(state.manualSaves,0);assert.equal(state.deletes,0);assert.equal(JSON.stringify(state.active),beforeActive);
  result.zoom.push({factor:actual,...metrics,editorErrorVisible:true,manualErrorVisible:true,nestedFocus:true,writes:0});
  await page.close();
 }
 assert.deepEqual(result.errors,[]);await writeFile(new URL('result.json',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}catch(e){await page?.screenshot({path:fileURLToPath(new URL('failure.png',output))}).catch(()=>{});await writeFile(new URL('failure.json',output),JSON.stringify({...result,error:String(e)},null,2));throw e;}
finally{await context.close();}
