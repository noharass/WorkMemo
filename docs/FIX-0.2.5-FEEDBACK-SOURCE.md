# v0.2.5 反馈修正完整源码

日期：2026-10-30。以下是本次全部程序与测试完整文本，没有用省略号代替代码；图片、交付记录及完整路径清单保存在项目原文件。

## E:\WorkMemo\scripts\verify-v025-followup.mjs

~~~~~~javascript
// v0.2.5 follow-up: isolated HTTP fixtures, no WorkMemo process or user database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dashboardFixture, fixtureDate } from './dashboard-fixture.mjs';
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const output=new URL('../artifacts/0.2.5/qa/followup/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
const base=process.env.WORKMEMO_WEB_URL||'http://127.0.0.1:1420';
const errors=[],results=[];
let page;
async function setup(width=1440,height=1000){
  if(page)await page.close();
  page=await browser.newPage({viewport:{width,height},timezoneId:'Asia/Shanghai'});
  page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
  const state=await dashboardFixture(page);
  return state;
}
const sheet=()=>page.locator('.dc-sheet-root .wm-drawer-section');
const quantity=()=>page.getByRole('textbox',{name:'工作量',exact:true});
const currentId=()=>sheet().locator('.dc-sheet-title .dc-eyebrow').innerText();
const shot=async name=>page.screenshot({path:fileURLToPath(new URL(name+'.png',output))});
async function goto(){await page.goto(`${base}/dashboard#token=isolated-followup`);await page.locator('.dc-category-report').getByText('128.5',{exact:true}).waitFor();}
async function centered(){
  await page.waitForTimeout(330);
  const box=await sheet().boundingBox(),size=page.viewportSize();
  assert.ok(Math.abs(box.x+box.width/2-size.width/2)<2&&Math.abs(box.y+box.height/2-size.height/2)<2,JSON.stringify({size,box}));
}
async function openPending(count=2){
  await page.getByRole('button',{name:`代码开发待补填${count}条`,exact:true}).click();
  await page.locator('#dc-editor').waitFor();
  await centered();
}
async function test(name,fn){await fn();results.push(name);}
try{
  await test('category count opens scoped editor; failed/duplicate save is safe; next preserves original category scope',async()=>{
    const state=await setup();await goto();await openPending();
    assert.match(await currentId(),/#7$/);assert.equal(state.saves,0);
    const request=state.requests.filter(r=>r.endpoint==='query'&&r.body.status==='pending').at(-1).body;
    assert.equal(request.category,'开发');assert.equal(request.scope,'real');assert.equal(request.page,1);assert.equal(request.anchor_date,fixtureDate);
    await page.getByRole('button',{name:'保存并下一条',exact:true}).click();
    assert.equal(state.saves,0);assert.match(await currentId(),/#7$/);
    await quantity().fill('12');
    await page.getByRole('combobox',{name:'工作类别',exact:true}).click();
    await page.locator('.wm-select-dropdown:visible').getByText('评测',{exact:true}).click();
    state.saveFailure=409;
    await page.getByRole('button',{name:'保存并下一条',exact:true}).click();
    await sheet().getByRole('alert').filter({hasText:'记录已被其他窗口修改'}).waitFor();
    assert.equal(await quantity().inputValue(),'12');assert.match(await currentId(),/#7$/);
    state.saveFailure=null;state.saveDelay=100;
    await page.getByRole('button',{name:'保存并下一条',exact:true}).evaluate(button=>{button.click();button.click();});
    await sheet().getByText('WORK RECORD #8',{exact:true}).waitFor();
    await page.waitForFunction(()=>document.activeElement?.id==='dc-quantity');
    assert.equal(state.saves,2);assert.equal(state.records.find(r=>r.id===7).quantity,12);
    assert.equal(state.records.find(r=>r.id===7).category,'评测');assert.equal(await quantity().inputValue(),'');
    await shot('category-next-centered');
    await quantity().fill('0');await page.getByRole('button',{name:'保存工作量',exact:true}).click();
    await page.locator('#dc-editor').waitFor({state:'detached'});
    await page.getByRole('button',{name:'下一条',exact:true}).click();
    await sheet().getByText('本范围已全部补填',{exact:false}).waitFor();
    assert.equal(await page.getByRole('button',{name:'下一条',exact:true}).isDisabled(),true);
    assert.equal(state.records.find(r=>r.id===8).quantity,0);assert.equal(state.active.id,99);
  });
  await test('next read failure reports committed save and can retry without saving twice',async()=>{
    const state=await setup();await goto();await openPending();
    await quantity().fill('9');state.detailFailure=true;
    await page.getByRole('button',{name:'保存并下一条',exact:true}).click();
    await sheet().getByRole('alert').filter({hasText:'当前记录已保存，下一条读取失败'}).waitFor();
    assert.equal(state.records.find(r=>r.id===7).quantity,9);assert.equal(state.records.find(r=>r.id===8).settlement_status,'PENDING');
    assert.match(await currentId(),/#7$/);assert.equal(state.saves,1);
    state.detailFailure=false;
    await page.getByRole('button',{name:'下一条',exact:true}).click();
    await sheet().getByText('WORK RECORD #8',{exact:true}).waitFor();assert.equal(state.saves,1);
  });
  await test('mobile editor centered; 53 pending records cross page boundary without skips; date/demo/current task excluded',async()=>{
    const state=await setup(390,844);
    const template=structuredClone(state.records[7]);
    for(let i=0;i<51;i++)state.records.push({...template,id:1000+i});
    state.records.push({...template,id:2000,start_time:template.start_time-86400000});
    state.records.push({...template,id:2001,is_demo:true,demo_batch:'isolated'});
    await goto();await openPending(53);await shot('mobile-centered');
    for(let i=0;i<53;i++){
      const candidates=state.records.filter(r=>r.category==='开发'&&r.settlement_status==='PENDING'&&!r.is_demo&&r.id!==2000);
      const expected=candidates[1]?.id;
      await quantity().fill(String(i));
      await page.getByRole('button',{name:'保存并下一条',exact:true}).click();
      if(expected)await sheet().getByText(`WORK RECORD #${expected}`,{exact:true}).waitFor();
      else await sheet().getByText('本范围已全部补填',{exact:false}).waitFor();
    }
    assert.equal(state.saves,53);assert.equal(state.records.find(r=>r.id===2000).settlement_status,'PENDING');assert.equal(state.records.find(r=>r.id===2001).settlement_status,'PENDING');assert.equal(state.active.id,99);
    assert.ok(state.requests.filter(r=>r.endpoint==='query'&&r.body.status==='pending').every(r=>r.body.category==='开发'&&r.body.page===1&&r.body.scope==='real'));
    await centered();
  });
  await test('zero counts do not become controls; stale counts do not open an empty editor',async()=>{
    const state=await setup();await goto();
    assert.equal(await page.getByRole('button',{name:'质检待补填0条',exact:true}).count(),0);
    state.records.filter(r=>r.category==='开发').forEach(r=>r.settlement_status='COMPLETE');
    await page.getByRole('button',{name:'代码开发待补填2条',exact:true}).click();
    await page.getByText('这个分类在当前范围已没有待补填记录。',{exact:true}).waitFor();
    assert.equal(await page.locator('#dc-editor').count(),0);assert.equal(state.saves,0);
  });
  assert.deepEqual(errors,[]);
  await writeFile(new URL('result.json',output),JSON.stringify({base,isolated:true,native:false,results,errors},null,2));
  console.log(`Follow-up web: ${results.length} groups passed, including 53-record sequential settlement.`);
}catch(e){if(page){await shot('failure');await writeFile(new URL('failure.json',output),JSON.stringify({errors,html:await page.content()},null,2));}throw e;}finally{await browser.close();}
~~~~~~

## E:\WorkMemo\scripts\verify-v025.mjs

~~~~~~javascript
// Isolated IPC fixtures only: no real backend, user database, or startup registration.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.5/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel:'msedge', headless:true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  const p = new URLSearchParams(location.search), category = ['评测','质检','开发','文档'];
  const record = {id:7,category:'评测',quantity:null,remark:'隔离验收记录',start_time:Date.now()-2300000,end_time:null,confirmed_end_time:null,duration_ms:2300000,duration_seconds:2300,status:'WORKING',is_paused:p.get('state')==='paused',recovery_pending:false,settlement_status:'IN_PROGRESS',source:'MANUAL_START',control_mode:'MANUAL',revision:1};
  const ended = {...record,id:6,status:'FINISHED',is_paused:true,settlement_status:'PENDING',end_time:Date.now(),confirmed_end_time:Date.now()};
  window.qa = {calls:[],active:p.get('state')==='empty'?null:record,notice:p.get('ended')?{kind:'ended',record:ended}:null,fail:'',browse:false,ready:true,stats:p.get('stats')==='empty'?[]:category.map((c,i)=>({category:c,quantity:i*11,pending:i===2?2:0,complete:1,records:1})),startup:{enabled:true,available:true,error:null}};
  window.isTauri = true;
  const callbacks = new Map(); let callback = 0;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = {unregisterListener(){}};
  window.__TAURI_INTERNALS__ = {
    metadata:{currentWindow:{label:p.has('notice')?'notice':p.has('panel')?'settings':'main'},currentWebview:{label:'main'}},
    transformCallback(fn){callbacks.set(++callback,fn);return callback;}, unregisterCallback(id){callbacks.delete(id);},
    invoke:async(command,args={})=>{
      const q=window.qa; q.calls.push({command,args});
      const snapshot=()=>({active:q.active,recent_records:[],pending_count:q.notice?1:0,warning:null,monitoring:{browsing_only:q.browse,browse_ready:q.ready,enabled:true,native_available:true,browser_connected:true,work_page:true,message:q.browse?'仅浏览 · 当前不计时':'正在记录',idle_warning:false,idle_warning_seconds:300,idle_end_seconds:420,start_candidate:null}});
      if(command===q.fail) {await new Promise(r=>setTimeout(r,100));throw Error('隔离保存失败');}
      if(command==='get_snapshot') return snapshot();
      if(command==='get_notice') return structuredClone(q.notice);
      if(command==='get_appearance') return {version:1,theme:p.get('theme')||'cream',opacity:88};
      if(command==='get_category_names') return {revision:0,names:Object.fromEntries(category.map(c=>[c,p.get('long')?c+'超长自定义工作名称用于布局检查':c]))};
      if(command==='get_layout_settings') return {density:p.get('density')||'comfortable',revision:0,sound_enabled:false,sound_theme:'soft',font_size:p.has('large')?18:14,font_weight:400,line_spacing:'standard'};
      if(command==='get_presentation') return {version:1,revision:0,background:null,categories:Object.fromEntries(category.map((c,i)=>[c,{icon:['checkSquare','safety','code','note'][i],color:['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i]}]))};
      if(command==='get_today_workload'){if(p.get('stats')==='loading')await new Promise(r=>(q.releaseStats??=[]).push(r));if(p.get('stats')==='error')throw Error('隔离统计读取失败');return q.stats;}
      if(command==='detect_preview_data') return false;
      if(command==='pause_task'){q.active={...q.active,is_paused:true,pause_reason:'MANUAL'};return snapshot();}
      if(command==='resume_task'){q.active={...q.active,is_paused:false,pause_reason:null};return snapshot();}
      if(command==='enter_browsing'){q.browse=true;if(q.active)q.active={...q.active,is_paused:true};return snapshot();}
      if(command==='confirm_work'){q.browse=false;return snapshot();}
      if(command==='start_task'){
        if(q.active && (!q.active.is_paused||q.active.id!==args.expectedActiveId))throw Error('原任务已变化');
        q.active={...record,...args.input,id:8,is_paused:false};return snapshot();
      }
      if(command==='settle_record'){
        await new Promise(r=>setTimeout(r,140));
        if(!q.notice || args.input.id!==q.notice.record.id || args.input.expected_revision!==q.notice.record.revision)throw Error('记录已变化');
        q.notice=null;return snapshot();
      }
      if(command==='defer_notice'){if(q.notice?.record.id===args.id)q.notice=null;return null;}
      if(command==='get_island_viewport') return innerHeight;
      if(command==='set_island_region'&&q.slowRegion&&args.height===56)await new Promise(r=>setTimeout(r,200));
      if(command==='get_startup_status') return q.startup;
      if(command==='set_startup_enabled'){q.startup={...q.startup,enabled:args.enabled};return q.startup;}
      if(command==='plugin:event|listen')return callback;
      return null;
    }
  };
});
const base=process.env.WORKMEMO_UI_URL||'http://127.0.0.1:1420/';
const results=[],measurements={};
async function load(params={},width=780,height=560){
  await page.setViewportSize({width,height});
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator(params.notice?'.island-main-row':'.desktop-frame').waitFor();
  if(!params.notice&&!params.panel)await page.locator('.timer-card,.new-task-page').waitFor();
  await page.waitForTimeout(180);
}
async function screenshot(name){await page.screenshot({path:fileURLToPath(new URL(`${name}.png`,output))});}
async function record(name,fn){await fn();results.push(name);}
try {
  await record('four themes, two densities, widths, large text and header drag space',async()=>{
    for(const theme of ['cream','glass','dark','neon'])for(const density of ['compact','comfortable'])for(const width of [360,420,780]){
      await load({theme,density,state:'paused',...(width===360?{large:'1',long:'1'}:{})},width,density==='compact'?380:560);
      const geometry=await page.locator('.titlebar-main').evaluate(el=>{
        const box=n=>{const r=n.getBoundingClientRect();return{x:r.x,right:r.right,y:r.y,bottom:r.bottom,width:r.width};};
        return {header:box(el),items:[...el.children].map(box).sort((a,b)=>a.x-b.x),drag:box(el.querySelector('.titlebar-space'))};
      });
      assert.ok(geometry.drag.width>=24,JSON.stringify({theme,density,width,geometry}));
      for(let i=0;i<geometry.items.length;i++){
        const item=geometry.items[i];assert.ok(item.x>=geometry.header.x&&item.right<=geometry.header.right+1,JSON.stringify({width,geometry}));
        if(i)assert.ok(geometry.items[i-1].right<=item.x+1);
      }
      assert.equal(await page.locator('.browse-banner,.workload-carousel').count(),0);
      assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).count(),1);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
      if(width===420&&density==='comfortable')await screenshot(`main-${theme}`);
    }
  });
  await record('paused switch is exclusive, cancel preserves task, errors preserve draft and atomic ID',async()=>{
    await load({state:'working'});
    await screenshot('current-task-780');
    const originalWidth=await page.locator('.desktop-frame').evaluate(el=>el.getBoundingClientRect().width);
    const material=await page.locator('.timer-card').evaluate(el=>{const s=getComputedStyle(el);return [s.backgroundColor,s.borderColor,s.borderRadius,s.boxShadow,s.backdropFilter];});
    await page.getByRole('button',{name:'切换任务',exact:true}).isDisabled().then(value=>assert.equal(value,true));
    await page.getByRole('button',{name:'暂停',exact:true}).click();
    await page.getByRole('button',{name:'切换任务',exact:true}).click();
    assert.equal(await page.locator('.timer-card').count(),0);
    assert.equal(await page.locator('.desktop-frame').evaluate(el=>el.getBoundingClientRect().width),originalWidth);
    assert.deepEqual(await page.locator('.new-task-page').evaluate(el=>{const s=getComputedStyle(el);return [s.backgroundColor,s.borderColor,s.borderRadius,s.boxShadow,s.backdropFilter];}),material);
    await page.getByLabel('工作类别',{exact:true}).selectOption('开发');
    await page.getByLabel('工作量（可稍后填写）').fill('0');
    await page.getByLabel('备注（选填）').fill('切换草稿');
    await screenshot('new-task');
    await page.getByRole('button',{name:'开始工作',exact:true}).click();
    await page.evaluate(()=>window.qa.fail='start_task');
    await page.getByRole('button',{name:'保存并开始',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'隔离保存失败'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'切换草稿');
    await page.getByRole('button',{name:'取消',exact:true}).click();
    await page.getByRole('button',{name:'取消切换',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.qa.active.id),7);
    assert.equal(await page.evaluate(()=>window.qa.active.is_paused),true);
    await page.evaluate(()=>window.qa.fail='');
    await page.getByRole('button',{name:'切换任务',exact:true}).click();
    await page.getByLabel('工作类别',{exact:true}).selectOption('开发');
    await page.getByRole('button',{name:'开始工作',exact:true}).click();
    await page.getByRole('button',{name:'保存并开始',exact:true}).click();
    await page.getByRole('button',{name:'暂停',exact:true}).waitFor();
    const call=await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='start_task').at(-1));
    assert.equal(call.args.expectedActiveId,7);assert.equal(call.args.input.quantity,null);
  });
  await record('switch draft survives changed active task and refuses stale submission',async()=>{
    await load({state:'paused'});
    await page.getByRole('button',{name:'切换任务',exact:true}).click();
    await page.getByLabel('工作类别',{exact:true}).selectOption('文档');
    await page.getByLabel('备注（选填）').fill('保留草稿');
    await page.evaluate(()=>{window.qa.active={...window.qa.active,id:20,is_paused:false};});
    await page.getByRole('status').filter({hasText:'原任务状态已变化'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'保留草稿');
    assert.equal(await page.getByRole('button',{name:'开始工作',exact:true}).isDisabled(),true);
    assert.equal(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='start_task')),false);
    await page.getByRole('button',{name:'取消切换',exact:true}).click();
  });
  await record('browsing toolbar uses existing commands and readiness',async()=>{
    await page.getByRole('button',{name:'仅浏览',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).getAttribute('aria-pressed'),'true');
    await page.evaluate(()=>window.qa.ready=false);await page.waitForTimeout(1100);
    assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).isDisabled(),true);
    await page.evaluate(()=>window.qa.ready=true);await page.waitForTimeout(1100);
    await page.getByRole('button',{name:'仅浏览',exact:true}).click();
    assert.equal(await page.getByRole('button',{name:'仅浏览',exact:true}).getAttribute('aria-pressed'),'false');
  });
  await record('stats loading/error states, overflow loop, static fit and reduced motion',async()=>{
    await load({stats:'loading'},780,560);
    await page.getByText('正在读取今日工作量…',{exact:true}).waitFor();
    await page.evaluate(()=>window.qa.releaseStats.forEach(release=>release()));
    await page.locator('.today-strip-track').getByText(/评测 0/).first().waitFor();
    await load({stats:'error'},780,560);
    await page.getByText('工作量暂不可用',{exact:true}).waitFor();
    await load({long:'1'},360,380);
    await page.locator('.today-strip-track.is-scrolling').waitFor();
    const before=await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(220);
    assert.notEqual(await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).transform),before);
    await page.getByRole('button',{name:/打开当天工作量详情/}).hover();
    assert.equal(await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    await page.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await page.locator('.today-strip-track').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.emulateMedia({reducedMotion:'no-preference'});
    await load({stats:'empty'},780);
    assert.equal(await page.locator('.today-strip-track.is-scrolling').count(),0);
  });
  await record('island rapid reopen remains held and reduced motion collapses without animation',async()=>{
    await load({notice:'1',ended:'1'},320,420);
    await page.getByRole('button',{name:'填写工作量',exact:true}).waitFor();
    const before=await page.locator('.island-main-row').boundingBox();
    await page.evaluate(()=>window.qa.slowRegion=true);
    await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
    await page.waitForTimeout(240);
    await page.getByRole('button',{name:'展开工作提醒',exact:true}).click();
    const callsBefore=await page.evaluate(()=>window.qa.calls.length);
    await page.waitForTimeout(480);
    assert.deepEqual(await page.locator('.island-main-row').boundingBox(),before);
    assert.equal(await page.getByRole('button',{name:'填写工作量',exact:true}).isVisible(),true);
    assert.ok(await page.evaluate(start=>window.qa.calls.slice(start).filter(c=>c.command==='hold_island').every(c=>c.args.holding),callsBefore));
    assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='hold_island').at(-1).args.holding),true);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'收起展开区域',exact:true}).click();
    await page.waitForTimeout(70);
    assert.equal(await page.locator('.island-expansion').evaluate(el=>el.getBoundingClientRect().height),0);
    await page.emulateMedia({reducedMotion:'no-preference'});
  });
  await record('island pinned body, inline save failures/conflicts, new work and smooth automatic collapse',async()=>{
    await load({notice:'1',ended:'1'},320,420);
    await page.getByRole('button',{name:'填写工作量',exact:true}).click();
    await page.getByLabel('工作量（必填）').fill('0');
    await page.getByLabel('备注（选填）').fill('岛内草稿');
    await page.evaluate(()=>window.qa.fail='settle_record');
    await page.getByRole('button',{name:'填写工作量并保存',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'隔离保存失败'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'岛内草稿');
    await page.evaluate(()=>{window.qa.fail='';window.qa.notice.record.revision=2;});
    await page.getByRole('button',{name:'填写工作量并保存',exact:true}).click();
    await page.getByRole('alert').filter({hasText:'记录已变化'}).waitFor();
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'岛内草稿');
    await page.evaluate(()=>{window.qa.notice.record.revision=1;window.qa.active={...window.qa.active,id:99,category:'开发'};});
    await page.waitForTimeout(1150);
    assert.equal(await page.locator('.island-info strong').innerText(),'开发');
    assert.equal(await page.getByLabel('备注（选填）').inputValue(),'岛内草稿');
    await screenshot('island-form');
    await page.evaluate(()=>{
      window.qa.frames=[];window.qa.tracking=true;
      const tick=()=>{const el=document.querySelector('.island-main-row'),ex=document.querySelector('.island-expansion');if(el&&ex){const r=el.getBoundingClientRect();window.qa.frames.push({x:r.x,y:r.y,width:r.width,height:r.height,radius:getComputedStyle(el).borderRadius,lower:ex.getBoundingClientRect().height,opacity:getComputedStyle(ex).opacity});}if(window.qa.tracking)requestAnimationFrame(tick);};requestAnimationFrame(tick);
    });
    await page.getByRole('button',{name:'填写工作量并保存',exact:true}).click();
    await page.waitForTimeout(600);
    const frames=await page.evaluate(()=>{window.qa.tracking=false;return window.qa.frames;});
    assert.ok(frames.length>8);
    assert.equal(new Set(frames.map(({x,y,width,height,radius})=>JSON.stringify({x,y,width,height,radius}))).size,1);
    assert.ok(frames.some(f=>f.lower>2&&f.lower<200&&Number(f.opacity)>0&&Number(f.opacity)<1),JSON.stringify(frames));
    assert.ok(frames.at(-1).lower<1);
    assert.equal(await page.evaluate(()=>window.qa.calls.filter(c=>c.command==='settle_record').at(-1).args.input.id),6);
    assert.equal(await page.evaluate(()=>window.qa.active.id),99);
    await writeFile(new URL('island-frames.json',output),JSON.stringify(frames,null,2));
    await screenshot('island-collapsed');
  });
  await record('dirty island dismiss requires explicit discard and preserves pending record',async()=>{
    await load({notice:'1',ended:'1'},320,420);
    await page.getByRole('button',{name:'填写工作量',exact:true}).click();
    await page.getByLabel('工作量（必填）').fill('12');
    await page.getByRole('button',{name:'稍后填写',exact:true}).click();
    await page.getByRole('button',{name:'继续填写',exact:true}).click();
    assert.equal(await page.getByLabel('工作量（必填）').inputValue(),'12');
    await page.getByRole('button',{name:'稍后填写',exact:true}).click();
    await page.getByRole('button',{name:'放弃填写并收起',exact:true}).click();
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='settle_record')),false);
    assert.ok(await page.evaluate(()=>window.qa.calls.some(c=>c.command==='defer_notice'&&c.args.id===6)));
  });
  await record('desktop natural content height removes form/timer whitespace and preserves width',async()=>{
    await load({state:'empty'},780,560);
    await page.waitForFunction(()=>window.qa.calls.some(c=>c.command==='fit_main_content'));
    const fit=()=>page.evaluate(()=>window.qa.calls.filter(c=>c.command==='fit_main_content').at(-1).args.height);
    const formHeight=await fit();
    assert.ok(formHeight>=280&&formHeight<480,`form height ${formHeight}`);
    await page.setViewportSize({width:780,height:formHeight});
    await page.waitForTimeout(120);
    const gap=selector=>page.evaluate(selector=>{
      const card=document.querySelector(selector).getBoundingClientRect(),footer=document.querySelector('.home-footer').getBoundingClientRect(),strip=document.querySelector('.today-strip').getBoundingClientRect();
      return {gap:footer.y-card.bottom,bottom:innerHeight-strip.bottom,width:document.querySelector('.desktop-frame').getBoundingClientRect().width};
    },selector);
    const form=await gap('.new-task-page');assert.ok(form.gap<32&&form.bottom<36,JSON.stringify(form));assert.equal(form.width,780);
    await screenshot('followup-desktop-new');
    await page.getByLabel('工作类别',{exact:true}).selectOption('开发');
    await page.getByRole('button',{name:'开始工作',exact:true}).click();
    await page.getByRole('button',{name:'暂停',exact:true}).waitFor();
    await page.waitForFunction(height=>window.qa.calls.filter(c=>c.command==='fit_main_content').at(-1).args.height!==height,formHeight);
    const taskHeight=await fit();assert.ok(taskHeight>=280&&taskHeight<480);
    await page.setViewportSize({width:780,height:taskHeight});await page.waitForTimeout(100);
    const task=await gap('.timer-card');assert.ok(task.gap<32&&task.bottom<36,JSON.stringify(task));assert.equal(task.width,780);
    await screenshot('followup-desktop-working');
    assert.equal(await page.evaluate(()=>window.qa.calls.some(c=>['pause_task','finish_task'].includes(c.command))),false);
    measurements.desktop={new:formHeight,working:taskHeight};
  });
  await record('startup checkbox immediate save and failure keeps truthful status',async()=>{
    await load({panel:'settings',section:'layout'},900,800);
    await page.getByLabel('开机启动',{exact:true}).waitFor();
    await page.getByLabel('开机启动',{exact:true}).uncheck();
    assert.equal(await page.evaluate(()=>window.qa.startup.enabled),false);
    await page.evaluate(()=>window.qa.fail='set_startup_enabled');
    await page.getByLabel('开机启动',{exact:true}).click();
    await page.getByRole('alert').filter({hasText:'隔离保存失败'}).waitFor();
    assert.equal(await page.getByLabel('开机启动',{exact:true}).isChecked(),false);
  });
  assert.deepEqual(errors,[]);
  await writeFile(new URL('ui-result.json',output),JSON.stringify({isolated:true,native:false,results,measurements,errors},null,2));
  console.log(`v0.2.5: ${results.length} interaction groups passed; 24 theme/density/width layouts; fixtures only.`);
} catch(e) {await screenshot('failure');await writeFile(new URL('failure.json',output),JSON.stringify({errors,html:await page.content(),qa:await page.evaluate(()=>window.qa)},null,2));throw e;} finally {await browser.close();}
~~~~~~

## E:\WorkMemo\scripts\verify-web-ui.mjs

~~~~~~javascript
// End-to-end Ant Design regression. All /api requests are intercepted in an isolated browser.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL, fileURLToPath } from "node:url";
import { dashboardFixture } from "./dashboard-fixture.mjs";
const { chromium } = await import(
  process.env.WORKMEMO_PLAYWRIGHT
    ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href
    : "playwright"
);
const output = new URL("../artifacts/web-ui/qa/", import.meta.url);
const baseUrl = process.env.WORKMEMO_WEB_URL ?? "http://127.0.0.1:1420";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  timezoneId: "Asia/Shanghai",
});
if (process.env.WORKMEMO_WEB_URL) {
  // Match the Rust data server's CSP while testing the compiled, local assets.
  await context.route("**/dashboard", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
      },
    });
  });
}
const page = await context.newPage();
page.setDefaultTimeout(10000);
const errors = [],
  warnings = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (value) => {
  if (
    value.type() === "error" &&
    !value.text().includes("status of 500") &&
    !value.text().includes("status of 409")
  )
    warnings.push(value.text());
});
const state = await dashboardFixture(page);
const shot = (name) =>
  page.screenshot({
    path: fileURLToPath(new URL(name + ".png", output)),
    fullPage: false,
  });
const result = { baseUrl };
const layoutOnly = process.argv.includes("--layout-only");
const sheet = page.locator(".dc-sheet-root .wm-drawer-section");
const editor = page.locator("#dc-editor");
const report = page.locator(".dc-category-report");
const quantity = page.getByRole("textbox", { name: "工作量", exact: true });
async function open(edit = false, index = 0) {
  await page.locator(".dc-page").waitFor({ state: "visible" });
  const background = await page.locator(".dc-page").boundingBox();
  await page
    .locator(".dc-records")
    .getByRole("button", { name: edit ? "编辑" : "详情", exact: true })
    .nth(index)
    .click();
  await sheet.waitFor();
  await page.waitForTimeout(350);
  await page.waitForFunction(
    () =>
      !document
        .querySelector(".wm-drawer-content-wrapper")
        ?.className.includes("-active"),
  );
  const locked = await page.locator(".dc-page").boundingBox();
  assert.ok(
    Math.abs(background.x - locked.x) < 1 &&
      Math.abs(background.width - locked.width) < 1,
    "opening the sheet must not shift the background",
  );
}
async function close() {
  await sheet.getByRole("button", { name: "关闭", exact: true }).click();
  await sheet.waitFor({ state: "hidden" });
  await page.waitForFunction(
    () => document.querySelector(".dc-page")?.inert === false,
  );
}
async function select(label, option) {
  await page.getByRole("combobox", { name: label, exact: true }).click();
  await page
    .locator(".wm-select-dropdown:visible")
    .getByText(option, { exact: true })
    .last()
    .click();
}
try {
  await page.goto(`${baseUrl}/dashboard#token=isolated-web-ui-fixture`);
  await report.getByText("128.5", { exact: true }).waitFor();
  assert.equal(await page.locator(".dc-kpi").count(), 3);
  assert.equal(await report.locator("tbody tr[data-row-key]").count(), 4);
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(1).textContent(),
    "0",
  );
  assert.equal(
    await report.locator(".dc-report-quantity strong").nth(2).textContent(),
    "待补填",
  );
  await shot("overview-desktop");
  await page.screenshot({
    path: fileURLToPath(new URL("overview-full.png", output)),
    fullPage: true,
  });
  if (!layoutOnly) {
    await page.waitForTimeout(350);
    const graph = await page.locator(".dc-trend .dc-chart").screenshot();
    await page.waitForTimeout(2400);
    assert.deepEqual(
      await page.locator(".dc-trend .dc-chart").screenshot(),
      graph,
      "unchanged polling must not redraw a different chart",
    );
    result.stablePolling = true;

    await open(true);
    assert.equal(state.saves, 0, "entering edit must not submit");
    await page.waitForFunction(
      () => document.activeElement?.id === "dc-quantity",
    );
    await shot("edit-desktop");
    const geometry = await sheet.boundingBox();
    assert.ok(
      geometry.width <= 761 && geometry.height <= 881,
      JSON.stringify(geometry),
    );
    assert.ok(
      Math.abs(geometry.y + geometry.height / 2 - 500) < 2 && Math.abs(geometry.x + geometry.width / 2 - 720) < 2,
      JSON.stringify(geometry),
    );
    const scrollY = await page.evaluate(() => scrollY);
    await page.mouse.move(80, 200);
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(180);
    assert.equal(
      await page.evaluate(() => window.scrollY),
      scrollY,
      "background wheel is locked",
    );
    await quantity.fill("0");
    for (const status of [500, 409]) {
      state.saveFailure = status;
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet
        .getByRole("alert")
        .filter({
          hasText: status === 409 ? "记录已被其他窗口修改" : "隔离保存失败",
        })
        .waitFor();
      assert.equal(await quantity.inputValue(), "0");
    }
    state.saveFailure = null;
    state.queryDelay = 900;
    await page.evaluate(() => {
      window.webFrames = [];
      window.webSample = true;
      const sample = () => {
        if (!window.webSample) return;
        window.webFrames.push({
          report: !!document.querySelector(".dc-report-table tbody"),
          kpi: document.querySelector(".dc-kpi strong")?.textContent,
          y: scrollY,
          loading: !!document.querySelector(".dc-category-report .dc-loading"),
        });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await page.waitForTimeout(1200);
    const frames = await page.evaluate(() => {
      window.webSample = false;
      return window.webFrames;
    });
    assert.ok(frames.length > 10);
    assert.ok(
      frames.every(
        (frame) =>
          frame.report &&
          !frame.loading &&
          !frame.kpi.startsWith("—") &&
          frame.y === scrollY,
      ),
      "save must preserve the background at every sampled frame",
    );
    await close();
    await report.getByText("98.5", { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.scrollY), scrollY);
    assert.equal(
      await page
        .locator(".dc-records")
        .getByRole("button", { name: "编辑", exact: true })
        .first()
        .evaluate((el) => el === document.activeElement),
      true,
    );
    state.queryDelay = 0;
    result.saveNoFlicker = {
      sampledFrames: frames.length,
      zero: true,
      failuresPreserveInput: true,
      focusRestored: true,
    };

    state.queryFailure = true;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor();
    await report.getByText("98.5", { exact: true }).waitFor();
    state.queryFailure = false;
    await page.getByRole("button", { name: "刷新连接", exact: true }).click();
    await page
      .getByRole("alert")
      .filter({ hasText: "刷新失败，当前显示上次结果" })
      .waitFor({ state: "detached" });
    result.staleSnapshotLabel = true;

    await open(true);
    await quantity.fill("12.5");
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    const guard = page.getByRole("dialog", { name: "保留未保存的修改？" });
    await guard.waitFor();
    await page.waitForFunction(
      () => document.activeElement?.textContent === "继续编辑",
    );
    await shot("unsaved-confirmation");
    await page.keyboard.press("Control+s");
    assert.equal(state.saves, 3);
    await page.keyboard.press("Escape");
    await guard.waitFor({ state: "hidden" });
    assert.equal(await quantity.inputValue(), "12.5");
    assert.equal(
      await sheet.isVisible(),
      true,
      "one Escape must close only the confirmation",
    );
    await sheet.getByRole("button", { name: "关闭", exact: true }).click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.nestedGuard = true;

    await open(true);
    await quantity.fill("1.25e2");
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.records[0].quantity, 125);
    await close();
    result.scientificQuantity = true;

    // Invalid quantities remain strings and never reach the save endpoint.
    await open(true);
    const beforeInvalid = state.saves;
    for (const value of ["-1", "1e-9999", "1000000001"]) {
      await quantity.fill(value);
      await sheet.locator('button[form="dc-editor"]').click();
      await sheet.getByRole("alert").waitFor();
      assert.equal(state.saves, beforeInvalid);
      assert.equal(await quantity.inputValue(), value);
    }
    // Official Select popup stays inside the sheet and has keyboard selection.
    await sheet
      .getByRole("combobox", { name: "工作类别", exact: true })
      .click();
    const popup = sheet.locator(".wm-select-dropdown:visible");
    await popup.getByText("质检", { exact: true }).last().click();
    assert.equal(
      await sheet
        .getByRole("combobox", { name: "工作类别", exact: true })
        .getAttribute("aria-expanded"),
      "false",
    );
    await sheet
      .getByRole("button", { name: "关闭", exact: true })
      .last()
      .click();
    await guard.getByRole("button", { name: "放弃修改", exact: true }).click();
    await sheet.waitFor({ state: "hidden" });
    result.validationAndSheetSelect = true;

    // Persisted writes cannot be relabelled as failed when a follow-up GET fails.
    await open(true);
    await quantity.fill("126");
    state.detailFailure = true;
    await sheet.locator('button[form="dc-editor"]').click();
    await editor.waitFor({ state: "detached" });
    await sheet
      .getByRole("alert")
      .filter({ hasText: "已保存，详情刷新失败" })
      .waitFor();
    assert.equal(state.records[0].quantity, 126);
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    state.detailFailure = false;
    await close();
    result.committedReadFailure = true;

    // The guard's own save succeeds/fails without submitting the underlying form twice.
    await open(true);
    await quantity.fill("127");
    await page.keyboard.press("Escape");
    await guard.waitFor();
    const beforeGuardSave = state.saves;
    state.saveFailure = 500;
    await guard
      .getByRole("button", { name: "保存并继续", exact: true })
      .click();
    await guard
      .getByRole("alert")
      .filter({ hasText: "隔离保存失败" })
      .waitFor();
    assert.equal(state.saves, beforeGuardSave + 1);
    state.saveFailure = null;
    await guard.getByRole("button", { name: /保存并继续$/ }).click();
    await guard.waitFor({ state: "hidden" });
    await sheet.waitFor({ state: "hidden" });
    assert.equal(state.records[0].quantity, 127);
    result.guardSave = true;

    // DatePicker and Segmented retain natural-period and local-date semantics.
    await page
      .locator(".dc-period-bar")
      .getByText("周", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-10-26 — 2026-11-01" })
      .waitFor();
    assert.equal(
      await page.getByRole("button", { name: "下一周期" }).isEnabled(),
      true,
    );
    await page.getByRole("button", { name: "下一周期" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026-11-02 — 2026-11-08" })
      .waitFor();
    await page.getByRole("button", { name: "上一周期" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("月", { exact: true })
      .click();
    const date = page.getByRole("textbox", { name: "基准日期", exact: true });
    await date.fill("2024-02-29");
    await date.press("Enter");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2024 年 02 月" })
      .waitFor();
    assert.equal(state.currentQuery.anchor_date, "2024-02-29");
    await date.click();
    await page.locator(".wm-picker-dropdown:visible").waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "本月", exact: true }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("自定义", { exact: true })
      .click();
    await page.getByRole("button", { name: "全部日期", exact: true }).click();
    await page
      .locator(".dc-category-report")
      .getByText("最早记录 — 至今", { exact: false })
      .waitFor();
    await select("筛选工作类别", "代码开发");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page.waitForFunction(
      () =>
        document.querySelectorAll(".dc-report-table tbody tr[data-row-key]")
          .length === 1,
    );
    assert.equal(state.currentQuery.category, "开发");
    await select("筛选工作类别", "全部类别");
    await select("数据范围", "演示数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("999", { exact: true }).waitFor();
    await select("数据范围", "真实数据");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await page
      .locator(".dc-period-bar")
      .getByText("日", { exact: true })
      .click();
    await page
      .locator(".dc-period-nav strong")
      .filter({ hasText: "2026.10.29" })
      .waitFor();
    result.periodsAndScopes = true;

    // An older, deliberately delayed query must not overwrite the latest result.
    state.delayFor = (query) => (query.category === "评测" ? 650 : 0);
    await select("筛选工作类别", "评测");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await select("筛选工作类别", "质检");
    await page.getByRole("button", { name: "应用筛选" }).click();
    await report.getByText("0", { exact: true }).waitFor();
    await page.waitForTimeout(850);
    assert.equal(await report.locator("tbody tr[data-row-key]").count(), 1);
    assert.equal(await report.locator(".work-badge").innerText(), "质检");
    state.delayFor = null;
    await select("筛选工作类别", "全部类别");
    await page.getByRole("button", { name: "应用筛选" }).click();
    result.staleRequestIgnored = true;

    // Pagination is controlled by the existing 50-row backend contract.
    state.many = true;
    await page.getByRole("button", { name: "刷新连接" }).click();
    await page.locator(".wm-pagination-item-2").click();
    await page.waitForFunction(
      () =>
        document.querySelector(".wm-pagination-item-active")?.textContent ===
        "2",
    );
    assert.equal(state.currentQuery.page, 2);
    state.many = false;
    await page.locator(".wm-pagination-item-1").click();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "详情", exact: true })
      .first()
      .waitFor();
    result.pagination = true;

    // Read-only active records and explicit delete confirmation.
    const activeRow = page.locator('.dc-records tr[data-row-key="99"]');
    assert.equal(
      await activeRow
        .getByRole("button", { name: "编辑", exact: true })
        .isDisabled(),
      true,
    );
    await activeRow.getByRole("button", { name: "详情", exact: true }).click();
    await sheet.waitFor();
    assert.equal(
      await sheet
        .getByRole("button", { name: "编辑工作量", exact: true })
        .isDisabled(),
      true,
    );
    await close();
    await page
      .locator(".dc-records")
      .getByRole("button", { name: "删除", exact: true })
      .first()
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion.waitFor();
    assert.equal(state.deletes, 0);
    await deletion.getByRole("button", { name: "取消", exact: true }).click();
    await deletion.waitFor({ state: "hidden" });
    assert.equal(state.deletes, 0);
    result.readOnlyAndDeleteCancel = true;

    // Body-only scrolling, nested focus, boundary chaining, short-screen footer.
    state.segments = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      start_time: state.records[0].start_time,
      end_time: state.records[0].end_time,
      duration_ms: 30000,
      state: "CLOSED",
    }));
    await page.setViewportSize({ width: 1024, height: 520 });
    await open();
    await sheet.getByRole("button", { name: "计时区间（25）" }).click();
    const body = sheet.locator(".wm-drawer-body");
    await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
    const bodyTop = await body.evaluate((el) => el.scrollTop),
      backgroundTop = await page.evaluate(() => scrollY);
    await body.hover();
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => scrollY), backgroundTop);
    assert.ok((await body.evaluate((el) => el.scrollTop)) >= bodyTop);
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator(".dc-sheet-root")
          .evaluate((el) => el.contains(document.activeElement)),
        true,
        JSON.stringify(
          await page.evaluate(() => ({
            focused: document.activeElement?.outerHTML.slice(0, 500),
          })),
        ),
      );
    }
    const footer = await sheet.locator(".wm-drawer-footer").boundingBox();
    assert.ok(footer.y + footer.height <= 520 && footer.y >= 0);
    await close();
    state.segments = [];
    result.shortScreenScrollAndFocus = true;
  }

  const widths = [];
  for (const width of [390, 640, 800, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.waitForTimeout(160);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
      `page overflow ${width}`,
    );
    await page.evaluate(() => scrollTo(0, 0));
    await shot("overview-" + width);
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
    assert.ok(
      Math.abs(box.y + box.height / 2 - 500) < 2 && Math.abs(box.x + box.width / 2 - width / 2) < 2,
      JSON.stringify({ width, ...box }),
    );
    await shot("sheet-" + width);
    await close();
    widths.push(width);
  }
  result.widths = widths;
  const zooms = [];
  for (const zoom of [1.25, 1.5]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(
      (value) => (document.documentElement.style.zoom = String(value)),
      zoom,
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await open(true);
    const box = await sheet.boundingBox();
    assert.ok(
      box.x >= 0 &&
        box.x + box.width <= 1281 &&
        box.y >= 0 &&
        box.y + box.height <= 901 && Math.abs(box.y + box.height / 2 - 450) < 2 && Math.abs(box.x + box.width / 2 - 640) < 2,
      JSON.stringify({ zoom, ...box }),
    );
    await shot("zoom-" + zoom);
    await close();
    zooms.push(zoom);
  }
  await page.evaluate(() => (document.documentElement.style.zoom = "1"));
  result.cssZooms = zooms;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(true);
  await shot("reduced-motion");
  await close();
  result.reducedMotion = true;
  if (!layoutOnly) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => {
      window.motionFrames = [];
      window.sampleMotion = true;
      const sample = () => {
        if (!window.sampleMotion) return;
        const panel = document.querySelector(".wm-drawer-section");
        if (panel?.getClientRects().length)
          window.motionFrames.push({
            y: panel.getBoundingClientRect().y,
            locked: document.querySelector(".dc-page").inert,
          });
        requestAnimationFrame(sample);
      };
      sample();
    });
    await open();
    const settled = await sheet.boundingBox();
    await close();
    const animation = await page.evaluate(() => {
      window.sampleMotion = false;
      return window.motionFrames;
    });
    assert.ok(
      animation.some((frame) => frame.y > settled.y + 20),
      "official bottom motion must move the panel",
    );
    assert.ok(
      animation.every((frame) => frame.locked),
      "background remains locked throughout both motions",
    );
    result.officialMotion = { frames: animation.length };

    await open(true);
    await quantity.fill("128");
    state.saveDelay = 400;
    const before = state.saves;
    await sheet.locator('button[form="dc-editor"]').click();
    await page.keyboard.press("Control+s");
    await editor.waitFor({ state: "detached" });
    assert.equal(state.saves, before + 1);
    await close();
    state.saveDelay = 0;
    result.noDuplicateSubmission = true;

    const count = state.records.length;
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .getByRole("button", { name: "删除", exact: true })
      .click();
    const deletion = page.getByRole("dialog", { name: "删除这条记录？" });
    await deletion
      .getByRole("button", { name: "确认删除", exact: true })
      .click();
    await deletion.waitFor({ state: "hidden" });
    await page
      .locator('.dc-records tr[data-row-key="8"]')
      .waitFor({ state: "detached" });
    assert.equal(state.records.length, count - 1);
    assert.equal(state.deletes, 1);
    result.deleteAndRefresh = true;

    const firstFailure = await context.newPage();
    const failed = await dashboardFixture(firstFailure);
    failed.queryFailure = true;
    firstFailure.on("pageerror", (error) => errors.push(error.message));
    await firstFailure.goto(
      `${baseUrl}/dashboard#token=isolated-first-failure`,
    );
    await firstFailure
      .getByRole("alert")
      .filter({ hasText: "隔离统计读取失败" })
      .waitFor();
    assert.ok(
      (await firstFailure.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await firstFailure.close();
    const unauth = await context.newPage();
    unauth.on("pageerror", (error) => errors.push(error.message));
    await unauth.goto(`${baseUrl}/dashboard`);
    await unauth
      .getByRole("alert")
      .filter({ hasText: "请从 WorkMemo 打开数据中心" })
      .waitFor();
    assert.ok(
      (await unauth.locator(".dc-kpi strong").allTextContents()).every(
        (value) => value.startsWith("—"),
      ),
    );
    await unauth.close();
    result.firstLoadAndAuthorizationErrors = true;
  }
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
  await writeFile(
    new URL(
      layoutOnly
        ? "layout-result.json"
        : process.env.WORKMEMO_WEB_URL
          ? "production-result.json"
          : "result.json",
      output,
    ),
    JSON.stringify({ ...result, errors, warnings }, null, 2),
  );
  console.log(JSON.stringify(result));
} catch (error) {
  await shot("failure");
  await writeFile(
    new URL("failure-aria.txt", output),
    await sheet.ariaSnapshot().catch(() => "sheet missing"),
  );
  await writeFile(
    new URL("failure.json", output),
    JSON.stringify(
      {
        message: error.message,
        errors,
        warnings,
        saves: state.saves,
        requests: state.requests.slice(-6),
        sheet: await sheet
          .evaluate((el) => ({
            inert: el.closest("[inert]")?.outerHTML.slice(0, 100),
            ariaHidden: el.closest("[aria-hidden]")?.outerHTML.slice(0, 100),
            buttons: [...el.querySelectorAll("button")].map((b) => ({
              text: b.textContent,
              disabled: b.disabled,
              hidden: b.closest("[aria-hidden]")?.getAttribute("aria-hidden"),
            })),
          }))
          .catch(() => null),
      },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser.close();
}
~~~~~~

## E:\WorkMemo\src-tauri\src\lib.rs

~~~~~~rust
use serde::Serialize;
use tauri::{Emitter, Manager};

mod appearance;
mod browser_bridge;
mod browser_protocol;
mod clock;
mod connection;
mod dashboard;
mod database;
mod desktop;
mod monitor;
mod native_activity;
mod presentation;
#[allow(dead_code)] // Shared with the separately built native host CLI.
mod registration;
mod service;
mod sound;
mod startup;
mod windows;

/// A real IPC round trip verifies that the desktop backend is available.
#[derive(Serialize)]
struct AppInfo {
    name: &'static str,
    version: &'static str,
}

#[tauri::command]
fn app_info() -> AppInfo {
    AppInfo {
        name: "WorkMemo",
        version: env!("CARGO_PKG_VERSION"),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(windows)]
    let builder = builder
        .plugin(tauri_plugin_single_instance::init(|app, args, _| {
            if !args.iter().any(|arg| arg == "--autostart") {
                let _ = desktop::show_main(app, false);
            }
        }))
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .arg("--autostart")
                .app_name("WorkMemo")
                .build(),
        );
    builder
        .register_uri_scheme_protocol("background", |context, request| {
            presentation::background_response(context.app_handle(), request.uri().path())
        })
        .setup(|app| {
            app.manage(database::data_tools::ArchiveSelection(
                std::sync::Mutex::new(None),
            ));
            app.manage(connection::ConnectionState::initialize(app));
            app.manage(service::Backend::initialize(app));
            app.manage(desktop::IslandState::initialize(app));
            windows::initialize(app)?;
            app.manage(appearance::AppearanceState::initialize(app));
            app.manage(presentation::initialize(app)?);
            app.manage(dashboard::initialize(app)?);
            desktop::setup(app)?;
            app.manage(startup::initialize(app)?);
            if !std::env::args().any(|arg| arg == "--autostart") {
                desktop::show_main(app.handle(), false)?;
            }
            if std::env::args().any(|a| a == "--demo") {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn_blocking(move || {
                    let result = (|| -> Result<(), String> {
                        {
                            let backend = handle.state::<service::Backend>();
                            let mut guard = backend.inner.lock().map_err(|_| "数据锁异常")?;
                            guard.as_mut().map_err(|e| e.clone())?.seed_demo()?;
                        }
                        dashboard::open_impl(&handle, "all", "demo", false)
                    })();
                    if let Err(error) = result {
                        let _ = handle.emit("workmemo:runtime-error", error);
                    }
                });
            }
            Ok(())
        })
        .on_window_event(service::handle_window_event)
        .invoke_handler(tauri::generate_handler![
            app_info,
            desktop::get_island_viewport,
            desktop::fit_island_position,
            desktop::set_island_region,
            desktop::hold_island,
            startup::get_startup_status,
            startup::set_startup_enabled,
            presentation::get_presentation,
            presentation::save_presentation,
            presentation::import_background,
            service::confirm_work,
            service::enter_browsing,
            dashboard::open_dashboard,
            dashboard::get_dashboard_address,
            dashboard::get_today_workload,
            dashboard::seed_demo_data,
            dashboard::clear_demo_data,
            database::data_tools::detect_preview_data,
            database::data_tools::inspect_backup,
            database::data_tools::create_backup,
            database::data_tools::restore_backup,
            database::data_tools::preview_migration,
            database::data_tools::import_preview,
            windows::open_panel,
            windows::fit_main_content,
            windows::get_layout_settings,
            windows::set_layout_density,
            windows::set_layout_options,
            windows::reset_window_layout,
            windows::set_window_dirty,
            windows::close_panel,
            connection::get_connection_status,
            connection::repair_browser_connection,
            connection::open_browser_extension,
            appearance::get_appearance,
            appearance::save_appearance,
            service::get_snapshot,
            service::start_task,
            service::pause_task,
            service::resume_task,
            service::finish_task,
            service::query_history,
            service::delete_record,
            service::get_pending_records,
            service::settle_record,
            service::get_monitor_config,
            service::get_category_names,
            service::save_category_names,
            service::save_monitor_config,
            sound::preview_sound,
            service::get_notice,
            service::defer_notice,
            service::show_main,
            service::exit_app,
        ])
        .build(tauri::generate_context!())
        .expect("WorkMemo failed to start")
        .run(|app, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if windows::has_drafts(app) {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:request-close", ());
                    return;
                }
                for (_, w) in app.webview_windows() {
                    let _ = windows::capture(&w.as_ref().window());
                }
                if let Err(error) = desktop::save_island_position(app) {
                    let _ = app.emit(
                        "workmemo:runtime-error",
                        format!("状态岛设置未能保存：{error}"),
                    );
                }
                if let Err(error) = app.state::<service::Backend>().save_on_exit() {
                    api.prevent_exit();
                    let _ = app.emit("workmemo:storage-error", error);
                } else {
                    dashboard::cleanup(app);
                }
            }
        });
}

#[cfg(debug_assertions)]
pub fn monitor_probe() -> String {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let application_id = &context.config().identifier;
    match native_activity::sample() {
        Ok(sample)=>serde_json::json!({"application_id":application_id,"native_available":sample.reliable,"unlocked":sample.unlocked,
            "chrome_foreground":sample.chrome_foreground,"last_input_age_ms":sample.at.ticks_ms.saturating_sub(sample.last_input_ticks)}).to_string(),
        Err(error)=>serde_json::json!({"application_id":application_id,"native_available":false,"error":error}).to_string(),
    }
}

pub fn prepare_demo_data() -> Result<String, String> {
    let context: tauri::Context<tauri::Wry> = tauri::generate_context!();
    let identifier = &context.config().identifier;
    let path = registration::data_root()?
        .join(identifier)
        .join("workmemo.sqlite3");
    let mut store = database::Store::open(&path, Box::new(clock::SystemClock::new()))?;
    let before = store.active()?.map(|r| r.id);
    let count = store.seed_demo()?;
    let after = store.active()?.map(|r| r.id);
    if before != after {
        return Err("演示准备未能保留活动任务。".into());
    }
    Ok(serde_json::json!({"version":env!("CARGO_PKG_VERSION"),"identifier":identifier,"demo_records":count,"active_preserved":true}).to_string())
}
~~~~~~

## E:\WorkMemo\src-tauri\src\windows.rs

~~~~~~rust
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, path::PathBuf, sync::Mutex};
use tauri::{Emitter, Manager, WebviewUrl, WebviewWindowBuilder};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Geometry {
    x: i32,
    y: i32,
    width: f64,
    height: f64,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default)]
pub struct Layout {
    pub density: String,
    pub revision: u64,
    pub sound_enabled: bool,
    pub sound_theme: crate::sound::SoundTheme,
    pub font_size: u8,
    pub font_weight: u16,
    pub line_spacing: String,
    windows: BTreeMap<String, Geometry>,
}
impl Default for Layout {
    fn default() -> Self {
        Self {
            density: "comfortable".into(),
            revision: 0,
            sound_enabled: true,
            sound_theme: crate::sound::SoundTheme::Soft,
            font_size: 14,
            font_weight: 400,
            line_spacing: "standard".into(),
            windows: BTreeMap::new(),
        }
    }
}
pub struct WindowState {
    pub path: PathBuf,
    pub data: Mutex<Layout>,
    pub dirty: Mutex<BTreeMap<String, bool>>,
    opening: Mutex<()>,
}
pub fn valid_label(label: &str) -> bool {
    matches!(label, "main" | "settings" | "history" | "settlement")
}
pub fn load(path: &std::path::Path) -> Result<Layout, String> {
    if !path.exists() {
        return Ok(Layout::default());
    }
    decode_layout(&std::fs::read(path).map_err(|e| e.to_string())?)
}
pub fn decode_layout(bytes: &[u8]) -> Result<Layout, String> {
    let d: Layout = serde_json::from_slice(bytes).map_err(|e| e.to_string())?;
    if !(12..=18).contains(&d.font_size)
        || ![400, 500, 600, 700].contains(&d.font_weight)
        || !["tight", "standard", "loose"].contains(&d.line_spacing.as_str())
        || !["compact", "comfortable"].contains(&d.density.as_str())
        || d.windows.iter().any(|(k, v)| {
            !(valid_label(k) || k == "main-compact")
                || !v.width.is_finite()
                || !v.height.is_finite()
                || v.width < 100.0
                || v.height < 100.0
                || v.width > 10000.0
                || v.height > 10000.0
        })
    {
        return Err("窗口布局格式无效。".into());
    }
    Ok(d)
}
pub fn initialize(app: &tauri::App) -> Result<(), String> {
    let path = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?
        .join("window-layout.json");
    let data = match load(&path) {
        Ok(data) => data,
        Err(_) => {
            // Preserve the unreadable file before allowing future geometry saves.
            let stamp = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map_err(|e| e.to_string())?
                .as_nanos();
            std::fs::copy(&path, path.with_extension(format!("invalid-{stamp}.json")))
                .map_err(|e| format!("无法保留损坏的窗口设置：{e}"))?;
            Layout::default()
        }
    };
    app.manage(WindowState {
        path,
        data: Mutex::new(data),
        dirty: Mutex::new(BTreeMap::new()),
        opening: Mutex::new(()),
    });
    if let Some(w) = app.get_webview_window("main") {
        restore(&w)?;
    }
    Ok(())
}
fn persist(state: &WindowState) -> Result<(), String> {
    let d = state.data.lock().map_err(|_| "窗口设置锁异常")?;
    if let Some(p) = state.path.parent() {
        std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
    }
    let tmp = state.path.with_extension("pending");
    use std::io::Write;
    let mut file = std::fs::File::create(&tmp).map_err(|e| e.to_string())?;
    file.write_all(&serde_json::to_vec(&*d).map_err(|e| e.to_string())?)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())?;
    drop(file);
    std::fs::rename(tmp, &state.path).map_err(|e| e.to_string())
}
pub fn capture(window: &tauri::Window) -> Result<(), String> {
    if !valid_label(window.label()) || window.is_minimized().unwrap_or(true) {
        return Ok(());
    }
    let pos = window.outer_position().map_err(|e| e.to_string())?;
    let size = window
        .inner_size()
        .map_err(|e| e.to_string())?
        .to_logical::<f64>(window.scale_factor().map_err(|e| e.to_string())?);
    let state = window.state::<WindowState>();
    let compact = state.data.lock().map_err(|_| "窗口设置锁异常")?.density == "compact";
    let key = if window.label() == "main" && compact {
        "main-compact"
    } else {
        window.label()
    };
    state
        .data
        .lock()
        .map_err(|_| "窗口设置锁异常")?
        .windows
        .insert(
            key.into(),
            Geometry {
                x: pos.x,
                y: pos.y,
                width: size.width,
                height: size.height,
            },
        );
    persist(&state)
}
pub fn bounded(g: (i32, i32, f64, f64), area: (i32, i32, u32, u32), scale: f64) -> Geometry {
    let (ax, ay, aw, ah) = area;
    let width = g.2.max(320.0).min((aw as f64 / scale - 16.0).max(100.0));
    let height = g.3.max(220.0).min((ah as f64 / scale - 16.0).max(100.0));
    Geometry {
        x: g.0
            .clamp(ax, ax + (aw as f64 - width * scale).max(0.0) as i32),
        y: g.1
            .clamp(ay, ay + (ah as f64 - height * scale).max(0.0) as i32),
        width,
        height,
    }
}
fn restore(w: &tauri::WebviewWindow) -> Result<(), String> {
    let state = w.state::<WindowState>();
    let compact = state.data.lock().map_err(|_| "窗口设置锁异常")?.density == "compact";
    let key = if w.label() == "main" && compact {
        "main-compact"
    } else {
        w.label()
    };
    let d = state
        .data
        .lock()
        .map_err(|_| "窗口设置锁异常")?
        .windows
        .get(key)
        .cloned();
    let default = match w.label() {
        "main" if compact => (420.0, 260.0),
        "main" => (780.0, 560.0),
        "settlement" => (760.0, 620.0),
        _ => (900.0, 680.0),
    };
    let monitors = w.available_monitors().map_err(|e| e.to_string())?;
    let m = d
        .as_ref()
        .and_then(|g| {
            monitors.iter().find(|m| {
                let a = m.work_area();
                g.x >= a.position.x
                    && g.y >= a.position.y
                    && (g.x as i64) < a.position.x as i64 + a.size.width as i64
                    && (g.y as i64) < a.position.y as i64 + a.size.height as i64
            })
        })
        .or(monitors.first());
    if let Some(m) = m {
        let a = m.work_area();
        let s = m.scale_factor();
        let minimum_height: f64 = if w.label() == "main" && compact {
            220.0
        } else {
            280.0
        };
        let minimum_width: f64 = if w.label() == "main" { 360.0 } else { 320.0 };
        w.set_min_size(Some(tauri::LogicalSize::new(
            minimum_width.min((a.size.width as f64 / s - 16.0).max(100.0)),
            minimum_height.min((a.size.height as f64 / s - 16.0).max(100.0)),
        )))
        .map_err(|e| e.to_string())?;
        let (x, y) = d.as_ref().map(|g| (g.x, g.y)).unwrap_or((
            a.position.x + ((a.size.width as f64 - default.0 * s) / 2.0).max(0.0) as i32,
            a.position.y + ((a.size.height as f64 - default.1 * s) / 2.0).max(0.0) as i32,
        ));
        let g = bounded(
            (
                x,
                y,
                d.as_ref().map_or(default.0, |g| g.width),
                d.as_ref()
                    .map_or(default.1, |g| g.height)
                    .max(minimum_height),
            ),
            (a.position.x, a.position.y, a.size.width, a.size.height),
            s,
        );
        w.set_size(tauri::LogicalSize::new(g.width, g.height))
            .map_err(|e| e.to_string())?;
        w.set_position(tauri::PhysicalPosition::new(g.x, g.y))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub fn fit_main_content(window: tauri::Window, height: f64) -> Result<(), String> {
    if window.label() != "main" {
        return Err("窗口不匹配".into());
    }
    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or("无法定位主窗口显示器")?;
    let scale = window.scale_factor().map_err(|e| e.to_string())?;
    let area = monitor.work_area();
    let position = window.outer_position().map_err(|e| e.to_string())?;
    let state = window.state::<WindowState>();
    let compact = state.data.lock().map_err(|_| "窗口设置锁异常")?.density == "compact";
    let target = content_height(height, compact, area.size.height as f64 / scale)?;
    let current = window
        .inner_size()
        .map_err(|e| e.to_string())?
        .to_logical::<f64>(scale);
    if (current.height - target).abs() > 1.0 {
        window
            .set_size(tauri::LogicalSize::new(current.width, target))
            .map_err(|e| e.to_string())?;
    }
    let bottom = i64::from(area.position.y) + i64::from(area.size.height);
    let maximum_y = (bottom - (target * scale).ceil() as i64).max(i64::from(area.position.y));
    let y = i64::from(position.y).clamp(i64::from(area.position.y), maximum_y) as i32;
    if y != position.y {
        window
            .set_position(tauri::PhysicalPosition::new(position.x, y))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn content_height(requested: f64, compact: bool, work_area_height: f64) -> Result<f64, String> {
    if !requested.is_finite()
        || !(100.0..=10000.0).contains(&requested)
        || !work_area_height.is_finite()
        || work_area_height < 100.0
    {
        return Err("主窗口内容高度无效".into());
    }
    let maximum = (work_area_height - 16.0).max(100.0);
    let minimum: f64 = if compact { 220.0 } else { 280.0 };
    Ok(requested.ceil().clamp(minimum.min(maximum), maximum))
}

#[tauri::command]
pub async fn open_panel(
    app: tauri::AppHandle,
    panel: String,
    section: Option<String>,
) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || show_panel(&app, &panel, section))
        .await
        .map_err(|e| e.to_string())?
}
pub fn show_panel(
    app: &tauri::AppHandle,
    panel: &str,
    section: Option<String>,
) -> Result<(), String> {
    if panel == "history" || panel == "settlement" {
        return crate::dashboard::open_impl(
            app,
            if panel == "settlement" {
                "pending"
            } else {
                "all"
            },
            "real",
            false,
        );
    }
    let state = app.state::<WindowState>();
    let _opening = state.opening.lock().map_err(|_| "窗口创建锁异常")?;
    if !matches!(panel, "settings" | "history" | "settlement") {
        return Err("未知窗口".into());
    }
    let w = match app.get_webview_window(panel) {
        Some(w) => w,
        None => {
            let w = WebviewWindowBuilder::new(
                app,
                panel,
                WebviewUrl::App(
                    format!(
                        "index.html?panel={panel}&section={}",
                        section
                            .as_deref()
                            .filter(|s| ["appearance", "monitor", "layout", "data", "visuals"]
                                .contains(s))
                            .unwrap_or("monitor")
                    )
                    .into(),
                ),
            )
            .title(match panel {
                "settings" => "WorkMemo 设置",
                "history" => "WorkMemo 历史与统计",
                _ => "WorkMemo 待补全",
            })
            .inner_size(900.0, 680.0)
            .transparent(true)
            .no_redirection_bitmap(true)
            .decorations(false)
            .shadow(false)
            .visible(false)
            .build()
            .map_err(|e| e.to_string())?;
            restore(&w)?;
            w
        }
    };
    w.show()
        .and_then(|_| w.unminimize())
        .and_then(|_| w.set_focus())
        .map_err(|e| e.to_string())?;
    if let Some(s) = section {
        w.emit("workmemo:settings-section", s)
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
#[tauri::command]
pub fn get_layout_settings(state: tauri::State<'_, WindowState>) -> Result<Layout, String> {
    Ok(state.data.lock().map_err(|_| "窗口设置锁异常")?.clone())
}
#[tauri::command]
pub fn set_layout_density(app: tauri::AppHandle, density: String) -> Result<(), String> {
    if !["compact", "comfortable"].contains(&density.as_str()) {
        return Err("间距无效".into());
    }
    let current = get_layout_settings(app.state())?;
    set_layout_options(
        app,
        LayoutInput {
            density,
            sound_enabled: current.sound_enabled,
            sound_theme: current.sound_theme,
            font_size: current.font_size,
            font_weight: current.font_weight,
            line_spacing: current.line_spacing,
            expected_revision: current.revision,
        },
    )?;
    Ok(())
}
#[tauri::command]
pub fn reset_window_layout(app: tauri::AppHandle) -> Result<(), String> {
    let s = app.state::<WindowState>();
    {
        let mut d = s.data.lock().map_err(|_| "窗口设置锁异常")?;
        let revision = d.revision + 1;
        *d = Layout {
            revision,
            ..Layout::default()
        };
    }
    persist(&s)?;
    for (_, w) in app.webview_windows() {
        if valid_label(w.label()) {
            restore(&w)?;
        }
    }
    let _ = app.emit("workmemo:layout-changed", ());
    Ok(())
}
#[tauri::command]
pub fn set_window_dirty(window: tauri::Window, dirty: bool) -> Result<(), String> {
    window
        .state::<WindowState>()
        .dirty
        .lock()
        .map_err(|_| "草稿状态锁异常")?
        .insert(window.label().into(), dirty);
    Ok(())
}
#[tauri::command]
pub fn close_panel(window: tauri::Window) -> Result<(), String> {
    if !matches!(window.label(), "settings" | "history" | "settlement") {
        return Err("窗口不匹配".into());
    }
    capture(&window)?;
    window.hide().map_err(|e| e.to_string())
}
pub fn has_drafts(app: &tauri::AppHandle) -> bool {
    app.state::<WindowState>()
        .dirty
        .lock()
        .map(|d| d.values().any(|v| *v))
        .unwrap_or(true)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn content_height_handles_short_screens_and_rejects_invalid_values() {
        assert_eq!(content_height(412.2, false, 900.0).unwrap(), 413.0);
        assert_eq!(content_height(200.0, false, 900.0).unwrap(), 280.0);
        assert_eq!(content_height(200.0, true, 900.0).unwrap(), 220.0);
        assert_eq!(content_height(900.0, false, 300.0).unwrap(), 284.0);
        assert_eq!(content_height(500.0, false, 200.0).unwrap(), 184.0);
        assert_eq!(content_height(500.0, true, 200.0).unwrap(), 184.0);
        assert!(content_height(f64::NAN, false, 900.0).is_err());
        assert!(content_height(f64::INFINITY, false, 900.0).is_err());
        assert!(content_height(20000.0, false, 900.0).is_err());
    }
    #[test]
    fn geometry_clamps_removed_monitor_and_high_dpi() {
        assert_eq!(
            bounded((0, 0, 420.0, 260.0), (0, 0, 1920, 1080), 1.0).height,
            260.0
        );
        let g = bounded((9999, -300, 900.0, 680.0), (0, 0, 1280, 720), 1.5);
        assert!(g.x >= 0 && g.y >= 0);
        assert!(g.width * 1.5 <= 1280.0 && g.height * 1.5 <= 720.0);
    }
    #[test]
    fn geometry_keeps_negative_monitor_coordinates_and_fits_small_desktops() {
        let g = bounded((-1800, 100, 900.0, 680.0), (-1920, 0, 1920, 1080), 1.0);
        assert_eq!((g.x, g.y), (-1800, 100));
        let g = bounded((9000, 9000, 780.0, 560.0), (0, 0, 800, 600), 2.0);
        assert!(g.width * 2.0 <= 800.0 && g.height * 2.0 <= 600.0);
        assert!(g.x >= 0 && g.y >= 0);
    }
    #[test]
    fn persisted_layout_rejects_unknown_windows_and_invalid_sizes() {
        assert!(decode_layout(br#"{"density":"comfortable","windows":{"main":{"x":0,"y":0,"width":780,"height":560}}}"#).is_ok());
        assert!(decode_layout(br#"{"density":"comfortable","windows":{"main":{"x":0,"y":0,"width":0,"height":560}}}"#).is_err());
        assert!(decode_layout(br#"{"density":"unknown","windows":{}}"#).is_err());
    }
    #[test]
    fn sound_theme_defaults_persists_and_rejects_invalid_values() {
        assert_eq!(
            decode_layout(br#"{"sound_enabled":false}"#)
                .unwrap()
                .sound_theme,
            crate::sound::SoundTheme::Soft
        );
        let crisp = decode_layout(br#"{"sound_enabled":false,"sound_theme":"crisp"}"#).unwrap();
        let loaded = decode_layout(&serde_json::to_vec(&crisp).unwrap()).unwrap();
        assert_eq!(loaded.sound_theme, crate::sound::SoundTheme::Crisp);
        assert!(!loaded.sound_enabled);
        assert!(decode_layout(br#"{"sound_theme":"unknown"}"#).is_err());
    }
    #[test]
    fn typography_migrates_defaults_and_validates_saved_options() {
        let legacy = decode_layout(br#"{"density":"compact","windows":{}}"#).unwrap();
        assert!(legacy.sound_enabled);
        let muted =
            decode_layout(br#"{"density":"compact","sound_enabled":false,"windows":{}}"#).unwrap();
        assert!(!muted.sound_enabled);
        assert!(
            !decode_layout(&serde_json::to_vec(&muted).unwrap())
                .unwrap()
                .sound_enabled
        );
        assert_eq!(legacy.font_size, 14);
        assert_eq!(legacy.font_weight, 400);
        let mut settings = legacy;
        settings.font_size = 18;
        settings.font_weight = 700;
        settings.line_spacing = "loose".into();
        decode_layout(&serde_json::to_vec(&settings).unwrap()).unwrap();
        settings.font_size = 19;
        assert!(decode_layout(&serde_json::to_vec(&settings).unwrap()).is_err());
        settings.font_size = 12;
        settings.font_weight = 900;
        assert!(decode_layout(&serde_json::to_vec(&settings).unwrap()).is_err());
    }
}

pub fn reload(app: &tauri::AppHandle) -> Result<(), String> {
    let state = app.state::<WindowState>();
    *state.data.lock().map_err(|_| "窗口设置锁异常")? = load(&state.path)?;
    for (_, w) in app.webview_windows() {
        if valid_label(w.label()) {
            restore(&w)?;
        }
    }
    Ok(())
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
pub struct LayoutInput {
    pub density: String,
    pub sound_enabled: bool,
    #[serde(default)]
    pub sound_theme: crate::sound::SoundTheme,
    pub font_size: u8,
    pub font_weight: u16,
    pub line_spacing: String,
    pub expected_revision: u64,
}
#[tauri::command]
pub fn set_layout_options(app: tauri::AppHandle, input: LayoutInput) -> Result<Layout, String> {
    if let Some(main) = app.get_webview_window("main") {
        capture(&main.as_ref().window())?;
    }
    let state = app.state::<WindowState>();
    let switch;
    let previous;
    {
        let mut d = state.data.lock().map_err(|_| "窗口设置锁异常")?;
        if d.revision != input.expected_revision {
            return Err("布局已变化，请重新读取。".into());
        }
        previous = d.clone();
        let mut next = d.clone();
        next.density = input.density;
        next.sound_enabled = input.sound_enabled;
        next.sound_theme = input.sound_theme;
        next.font_size = input.font_size;
        next.font_weight = input.font_weight;
        next.line_spacing = input.line_spacing;
        next.revision += 1;
        decode_layout(&serde_json::to_vec(&next).map_err(|e| e.to_string())?)?;
        switch = next.density != d.density;
        *d = next;
    }
    if let Err(error) = persist(&state) {
        *state.data.lock().map_err(|_| "窗口设置锁异常")? = previous;
        return Err(error);
    }
    if switch {
        if let Some(main) = app.get_webview_window("main") {
            restore(&main)?;
        }
    }
    let _ = app.emit("workmemo:layout-changed", ());
    get_layout_settings(app.state())
}
~~~~~~

## E:\WorkMemo\src\App.css

~~~~~~css
@layer theme, base, components, utilities;
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);

:root {
  font-family: "Segoe UI", "Microsoft YaHei UI", sans-serif;
  color: #303b35;
  background: transparent;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
html, body, #root { width: 100%; height: 100%; margin: 0; background: transparent; }
body { overflow: hidden; }
button, input, select, textarea { font: inherit; }
button, input, select, textarea, summary { -webkit-tap-highlight-color: transparent; }
.desktop-frame { position: relative; width: 100%; height: 100%; padding: 8px; color: var(--text-primary); --panel: rgb(var(--surface-rgb) / var(--surface-opacity)); --content-gap: 12px; }
.desktop-frame[data-density="comfortable"] { --content-gap: 20px; }
.app-shell { display: flex; flex-direction: column; width: 100%; height: 100%; overflow: hidden; border: 1px solid var(--window-border); border-radius: var(--window-radius); background: rgb(var(--window-rgb) / var(--window-opacity)); box-shadow: var(--window-shadow); }
.titlebar { display: grid; grid-template-columns: auto auto minmax(64px, 1fr) auto; align-items: center; gap: 12px; flex-shrink: 0; min-height: 56px; padding: 8px 14px; background: var(--header-background); user-select: none; }
.titlebar-drag { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: 34px; cursor: grab; touch-action: none; }
.titlebar-drag:active { cursor: grabbing; }
.brand-mark { display: block; width: 28px; height: 28px; flex-shrink: 0; object-fit: contain; }
.brand-name { display: block; font-size: 13px; font-weight: 600; letter-spacing: -.25px; white-space: nowrap; }
.icon { width: 20px; height: 20px; flex-shrink: 0; }
.main-nav { display: flex; align-items: center; gap: 3px; }
button.nav-button { position: relative; width: 31px; height: 34px; padding: 5px; justify-content: center; color: var(--text-muted); background: transparent; box-shadow: none; border-radius: 9px; }
button.nav-button:hover:not(:disabled) { background: var(--control-hover); }
button.nav-button[aria-pressed="true"] { color: var(--accent-text); }
button.nav-button[aria-pressed="true"]::after { content: ""; position: absolute; height: 2px; left: 8px; right: 8px; bottom: -3px; border-radius: 2px; background: var(--accent); }
.category-strip { display: flex; gap: 6px; min-width: 0; overflow-x: auto; overflow-y: hidden; padding: 3px 0; overscroll-behavior-x: contain; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.category-strip::-webkit-scrollbar { height: 2px; }
.category-strip::-webkit-scrollbar-thumb { border-radius: 2px; background: var(--scroll-thumb); }
.category-strip:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 2px; border-radius: 6px; }
.category-chip { display: inline-flex; align-items: center; flex: 0 0 auto; gap: 6px; padding: 5px 9px; border-radius: 9px; font-size: 11px; line-height: 1.5; color: var(--text-muted); background: rgb(var(--surface-rgb) / 30%); white-space: nowrap; }
.category-chip span { font-variant-numeric: tabular-nums; }
.category-chip[data-current="true"] { color: var(--accent-text); background: var(--control-hover); }
.window-controls { display: flex; flex-shrink: 0; gap: 3px; justify-self: end; grid-column: -2; }
.window-content { display: flex; flex-direction: column; min-height: 0; flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.window-content::-webkit-scrollbar { width: 6px; }
.window-content::-webkit-scrollbar-track { background: transparent; }
.window-content::-webkit-scrollbar-thumb { border-radius: 6px; background: var(--scroll-thumb); }
.workspace { width: 100%; max-width: 648px; margin: 0 auto; padding: var(--content-gap) 24px 18px; outline: none; }
.workspace.is-active { margin-block: auto; }
.window-error { flex-shrink: 0; margin: 8px 14px 0; padding: 8px 10px; max-height: 90px; overflow: auto; border-radius: var(--control-radius); background: var(--error-background); color: var(--error); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.resize-handle { position: absolute; z-index: 10; touch-action: none; }
.resize-North, .resize-South { left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
.resize-North { top: 0; }
.resize-South { bottom: 0; }
.resize-East, .resize-West { top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
.resize-East { right: 0; }
.resize-West { left: 0; }
.resize-NorthEast, .resize-NorthWest, .resize-SouthEast, .resize-SouthWest { width: 12px; height: 12px; }
.resize-NorthEast { top: 0; right: 0; cursor: nesw-resize; }
.resize-NorthWest { top: 0; left: 0; cursor: nwse-resize; }
.resize-SouthEast { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-SouthWest { bottom: 0; left: 0; cursor: nesw-resize; }
button { display: flex; justify-content: space-between; align-items: center; gap: 8px; width: 100%; padding: 11px 13px; background: var(--accent); color: var(--on-accent); border: 1px solid transparent; border-radius: var(--control-radius); font-size: 12px; cursor: pointer; box-shadow: var(--button-shadow); transition: background .15s; }
button:hover:not(:disabled) { background: var(--accent-hover); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, summary:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid var(--accent-text); outline-offset: 3px; }
button.secondary { background: var(--panel); color: var(--accent-text); border-color: var(--line); justify-content: center; box-shadow: none; }
button.secondary:hover:not(:disabled) { background: var(--secondary-hover); }
button.text-button { width: auto; background: transparent; color: var(--text-muted); border-color: var(--line); padding: 7px 10px; font-size: 10px; box-shadow: none; }
button.text-button:hover:not(:disabled) { background: var(--panel); }
button.window-control { width: 27px; height: 30px; padding: 5px; justify-content: center; border-radius: var(--control-radius); background: transparent; color: var(--text-muted); box-shadow: none; }
button.window-control:hover:not(:disabled) { background: var(--control-hover); }
button.window-close:hover:not(:disabled) { color: var(--on-close); background: var(--close-background); }
.window-control svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.3; stroke-linecap: round; }
.timer-card { width: min(100%, 560px); margin-inline: auto; padding: calc(var(--content-gap) + 4px); border: 1px solid var(--window-border); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .62)); box-shadow: var(--panel-shadow); backdrop-filter: blur(12px); }

.task-copy { min-width: 0; }
.task-copy h1 { margin: 0; font-size: 20px; font-weight: 550; letter-spacing: -.4px; }
.task-summary { margin: 7px 0 0; color: var(--text-muted); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.meta-dot { margin-inline: 7px; }
.state-label { font-size: 10px; color: var(--text-muted); }
.state-label.working { color: var(--accent-text); }
.state-label.working::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
.timer { display: block; flex-shrink: 0; font-family: var(--timer-font); text-shadow: var(--timer-shadow); font-size: clamp(24px, 4.6vw, 34px); font-weight: 550; font-variant-numeric: tabular-nums; letter-spacing: -.8px; line-height: 1.3; white-space: nowrap; }
.timer-long { font-size: clamp(18px, 3.5vw, 26px); }
.task-remark, .record-remark { font-size: 12px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
.task-remark { max-height: 160px; overflow-y: auto; }
.actions { margin-top: calc(var(--content-gap) + 6px); }
.actions button { width: auto; justify-content: center; }
button.round-action { width: 42px; height: 42px; padding: 11px; flex: 0 0 auto; border-radius: 50%; }
.round-action .icon-pause { stroke-width: 3; }
.round-action .icon-play { fill: currentColor; stroke-width: 1; }
button.quiet-action { padding: 7px 3px; border: 0; border-radius: 7px; background: transparent; color: var(--text-muted); font-size: 12px; box-shadow: none; }
button.quiet-action:hover:not(:disabled) { background: var(--control-hover); color: var(--accent-text); }
button.quiet-action:not(.finish-action) { margin-inline: auto; }
.form-card { width: min(100%, 560px); margin: var(--content-gap) auto 0; }
.form-card h2 { font-size: 12px; color: var(--text-muted); font-weight: 500; margin: 0 0 9px; }
.work-form { display: grid; gap: 10px; }
.work-form > button { min-height: 34px; padding: 8px 12px; }
.form-note > summary { display: flex; align-items: center; gap: 5px; width: fit-content; font-size: 11px; list-style: none; }
.form-note > summary::-webkit-details-marker { display: none; }
.form-note .icon { width: 15px; height: 15px; }
.form-note[open] > summary { margin-bottom: 3px; }

label { display: block; font-size: 11px; line-height: 1.6; }
.optional { color: var(--text-muted); font-size: 10px; margin-left: 3px; }
input, select, textarea { display: block; width: 100%; margin-top: 5px; padding: 7px 10px; min-width: 0; border: 1px solid var(--line); border-radius: var(--control-radius); color: inherit; background: rgb(var(--input-rgb) / 96%); font-size: 12px; }
input::placeholder, textarea::placeholder { color: var(--text-muted); opacity: .85; }
option { color: var(--text-primary); background: rgb(var(--input-rgb)); }
input:disabled, select:disabled, textarea:disabled { opacity: .55; }
textarea { resize: vertical; min-height: 44px; max-height: 150px; line-height: 1.6; }
.hint { color: var(--text-muted); font-size: 10px; line-height: 1.8; margin: 9px 0 0; overflow-wrap: anywhere; }
.notice, .error-banner { border-radius: var(--control-radius); padding: 12px; margin: 0 0 16px; font-size: 11px; line-height: 1.8; overflow-wrap: anywhere; }
.notice { color: var(--notice-text); background: var(--notice-background); border: 1px solid var(--notice-border); }
.notice p { margin: 0 0 6px; }
.error-banner { color: var(--error); background: var(--error-background); border: 1px solid var(--error-border); }
.error-banner p { margin: 5px 0 0; }
.inline-error { font-size: 11px; color: var(--error); margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.field-error { display: block; margin-top: 6px; color: var(--error); font-size: 10px; overflow-wrap: anywhere; }
.field-count { display: block; text-align: right; margin-top: 4px; color: var(--text-muted); font-size: 10px; }
[aria-invalid="true"] { border-color: var(--error); }
.finished-card { border-color: var(--accent-text); }
.saved-feedback { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--line); color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.switch-panel, .recent-panel, .connection-panel { margin-top: var(--content-gap); padding-top: 4px; font-size: 11px; }
.switch-panel { max-width: 560px; margin-inline: auto; }
summary { color: var(--text-muted); cursor: pointer; padding: 3px 0; }
details[open] > summary { margin-bottom: 15px; }
.connection-panel { margin-top: 15px; font-size: 10px; }
.connection-panel > p { font-size: 11px; }
.connection-panel button { margin-top: 10px; }
.record-list { list-style: none; padding: 0; margin: 0; }
.record-list li { padding: 12px 0; border-bottom: 1px solid var(--line); }
.record-list li:last-child { border-bottom: 0; }
.record-heading { display: flex; justify-content: space-between; align-items: center; gap: 10px; font-size: 12px; }
.record-heading strong { font-weight: 550; }
.record-heading span { font-variant-numeric: tabular-nums; color: var(--accent-text); }
.record-remark { margin: 7px 0 0; font-size: 11px; }
.appearance-feedback { margin: 0 0 10px; color: var(--accent-text); }
.preview-notice { padding: 6px 9px; margin-bottom: 10px; font-size: 10px; }
.appearance-error-detail { font-size: 10px; }
.appearance-dialog { width: min(390px, calc(100% - 40px)); max-height: calc(100% - 36px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.appearance-dialog::backdrop { background: transparent; }
.settings-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.settings-heading h2 { margin: 0; font-size: 17px; font-weight: 600; }
.settings-heading button { font-size: 22px; line-height: 1; }
.theme-fieldset { padding: 0; margin: 20px 0; border: 0; min-width: 0; }
.theme-fieldset legend { margin-bottom: 10px; padding: 0; font-size: 11px; color: var(--text-muted); }

button.theme-choice { display: flex; align-items: center; gap: 9px; padding: 12px 10px; text-align: left; background: rgb(var(--window-rgb)); color: var(--text-primary); border: 1px solid var(--line); border-radius: var(--control-radius); box-shadow: none; }
button.theme-choice:hover:not(:disabled) { background: rgb(var(--surface-rgb)); }
button.theme-choice[aria-pressed="true"] { outline: 2px solid var(--accent-text); outline-offset: 1px; }
.theme-sample { display: grid; align-content: center; gap: 4px; flex-shrink: 0; width: 30px; height: 35px; padding: 5px; border-radius: 5px; background: rgb(var(--surface-rgb)); border: 1px solid var(--line); }
.theme-sample span { height: 2px; width: 100%; background: var(--text-muted); border-radius: 2px; }
.theme-sample span:first-child { width: 60%; height: 4px; background: var(--accent); }
.theme-label { display: grid; gap: 5px; min-width: 0; }
.theme-label strong { font-size: 12px; font-weight: 600; }
.theme-label > span { font-size: 9px; color: var(--text-muted); white-space: nowrap; }
.opacity-heading { display: flex; align-items: center; justify-content: space-between; }
.opacity-heading output { font-size: 12px; font-variant-numeric: tabular-nums; color: var(--accent-text); }
input.opacity-slider { padding: 0; margin: 10px 0 3px; border: 0; background: transparent; min-height: 24px; accent-color: var(--accent); cursor: pointer; }
.opacity-scale { display: flex; justify-content: space-between; color: var(--text-muted); font-size: 9px; }
button.reset-opacity { margin: 15px 0 0; padding: 6px 8px; font-size: 10px; }
.settings-actions { margin-top: 20px; }
.settings-actions button { justify-content: center; }
.appearance-dialog > .notice, .appearance-dialog > .error-banner { margin: 14px 0 0; }
@media (max-width: 540px) {
  .brand-name { font-size: 12px; }
  .titlebar { gap: 8px; padding-inline: 10px; }
  .workspace { padding-inline: 14px; }
}
@media (max-width: 380px) {
  .titlebar { gap: 4px; padding-inline: 8px; }
  .titlebar-drag { gap: 6px; }
  .brand-name { font-size: 11px; }
  .brand-mark { width: 25px; height: 25px; }
  button.nav-button { width: 27px; }
  .main-nav { gap: 0; }
  .window-controls { gap: 0; }
  .titlebar .window-control { width: 24px; }
  .workspace { padding-inline: 10px; }
  .task-row { gap: 10px; }
  .timer-card { padding: var(--content-gap); }
  .task-copy h1 { font-size: 17px; }
  .actions { gap: 14px; }
}
@media (prefers-reduced-motion: reduce) { button { transition: none; } }
.history-entry { margin-top: 15px; }
.history-dialog, .delete-dialog { width: min(500px, calc(100% - 32px)); max-height: calc(100% - 32px); margin: auto; padding: 19px; color: var(--text-primary); background: rgb(var(--surface-rgb)); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.history-dialog::backdrop, .delete-dialog::backdrop { background: rgb(0 0 0 / 25%); }
.history-filters { display: grid; gap: 10px; margin-top: 18px; }
.history-filters input, .history-filters select { padding: 9px 6px; font-size: 11px; }
.history-filters .hint { margin-top: 0; }
.filter-category-row { display: grid; grid-template-columns: 1fr 90px; gap: 12px; align-items: end; }
.filter-category-row button { justify-content: center; }
.history-tabs { margin: 18px 0 15px; }
.history-tabs button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--secondary-hover); }
.history-overview { font-size: 11px; line-height: 1.8; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.summary-grid { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; margin: 13px 0 18px; }
.summary-grid > div { min-width: 0; padding: 11px 7px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); }
.summary-grid dt { font-size: 10px; color: var(--text-muted); }
.summary-grid dd { margin: 7px 0 0; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
.summary-grid small { font-size: 9px; font-weight: normal; }
.history-empty { margin: 15px 0; font-size: 12px; line-height: 1.9; color: var(--text-muted); }
.history-records { list-style: none; margin: 0; padding: 0; }
.history-records li { padding: 15px 0; border-bottom: 1px solid var(--line); }
.history-records .record-remark { max-height: 110px; overflow: auto; }
button.delete-link { margin: 9px 0 0 auto; color: var(--error); }
.history-pagination { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 18px; font-size: 10px; color: var(--text-muted); }
.history-pagination button { width: auto; padding: 8px 10px; font-size: 11px; }
.stats-section { margin-top: 20px; }
.stats-section h3 { font-size: 12px; font-weight: 600; }
.stats-scroll { overflow-x: auto; }
.stats-section table { width: 100%; border-collapse: collapse; font-size: 10px; font-variant-numeric: tabular-nums; }
.stats-section th, .stats-section td { padding: 9px 5px; border-bottom: 1px solid var(--line); text-align: right; overflow-wrap: anywhere; }
.stats-section th { font-weight: 500; }
.stats-section tr > :first-child { text-align: left; white-space: nowrap; }
.stats-section thead { color: var(--text-muted); }
.history-feedback { color: var(--accent-text); font-size: 11px; line-height: 1.8; }
.delete-dialog { width: min(350px, calc(100% - 40px)); }
.delete-dialog h2 { margin: 0; font-size: 17px; }
.delete-dialog > p { font-size: 12px; line-height: 1.8; }
.delete-record-detail { padding: 12px; background: var(--panel); border: 1px solid var(--line); border-radius: var(--control-radius); font-size: 11px; line-height: 1.8; max-height: 160px; overflow: auto; }
button.danger-button { color: var(--error); background: var(--error-background); border-color: var(--error-border); }
button.danger-button:hover:not(:disabled) { background: var(--error-background); border-color: var(--error); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.ui-dialog { width: min(360px, calc(100% - 28px)); max-height: calc(100% - 28px); margin: auto; padding: 18px; color: var(--text-primary); background: rgb(var(--surface-rgb) / 98%); border: 1px solid var(--window-border); border-radius: var(--window-radius); box-shadow: var(--window-shadow); overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scroll-thumb) transparent; }
.ui-dialog::backdrop { background: rgb(0 0 0 / 18%); }
.density-settings { margin: 20px 0 0; padding: 0; border: 0; }
.density-settings legend { margin-bottom: 10px; font-size: 12px; }
.density-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.density-options button[aria-pressed="true"] { border-color: var(--accent-text); color: var(--accent-text); background: var(--control-hover); }
.utilities-panel { margin-top: 20px; font-size: 11px; }
.utilities-panel > button { margin-top: 12px; }
.note-heading { margin-top: 20px; font-size: 13px; }
.settlement-entry { margin-top: 12px; }
.settlement-panel { margin-top: 12px; padding: 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: var(--panel); }
.settlement-panel h2 { margin: 0; font-size: 16px; }
.settlement-panel .settings-heading .secondary { width: auto; flex-shrink: 0; font-size: 12px; line-height: 1.5; }
.settlement-record { padding: 12px 0; border-top: 1px solid var(--line); }
.settlement-record summary { cursor: pointer; }
.settlement-form { display: grid; gap: 12px; margin-top: 12px; }
.monitor-status { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; font-size: 10px; color: var(--text-muted); }
.monitor-status button { flex-shrink: 0; }
.monitor-settings { margin-top: 12px; }
.monitor-toggle { display: flex; align-items: center; gap: 8px; }
.monitor-toggle input { width: auto; margin: 0; }
.monitor-rule { display: grid; gap: 8px; margin: 0; padding: 10px; border: 1px solid var(--line); border-radius: var(--control-radius); min-width: 0; }
.notice-titlebar { padding: 12px 16px; }
.notice-titlebar span { flex: 1; font-size: 13px; cursor: grab; }
.notice-titlebar button { width: auto; padding: 7px 10px; }
.notice-content { padding: 0 18px 18px; overflow: auto; min-height: 0; }
.notice-content h1 { font-size: 18px; line-height: 1.5; }
.notice-content > section > .secondary, .notice-content > .text-button { margin-top: 14px; }
.island-frame { padding: 5px; }
.island-shell { flex-direction: row; align-items: center; border-radius: 32px; padding: 0 8px 0 14px; }
.island-drag { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; height: 100%; cursor: grab; }
.island-mark { display: grid; place-items: center; flex: 0 0 32px; height: 32px; border-radius: 50%; color: var(--accent); border: 1px solid var(--window-border); font-weight: 700; }
.island-info { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
.island-info strong, .island-info small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.island-info strong { font-size: 14px; }
.island-info small { font-size: 11px; color: var(--text-secondary); }
.island-time { font: 600 15px ui-monospace, monospace; white-space: nowrap; }
.island-open { flex: 0 0 30px; width: 30px; height: 30px; margin-left: 5px; padding: 0; border-radius: 50%; }
.island-error { color: var(--accent); font-weight: bold; }


/* Desktop refresh: keep all color and surface choices tied to the four theme tokens. */
.icon { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; font-size: 18px; line-height: 1; }
.icon svg, .window-control .icon svg { display: block; width: 1em; height: 1em; fill: currentColor; stroke: none; }
.window-control .icon { width: 16px; height: 16px; font-size: 14px; }
.app-shell { border-radius: var(--window-radius); }
.titlebar { min-height: 62px; padding: 10px 17px; border-bottom: 1px solid var(--line); }
.brand-mark { width: 30px; height: 30px; }
.brand-name { font-size: 14px; letter-spacing: -.35px; }
.main-nav { gap: 5px; }
button.nav-button { width: 34px; height: 34px; border-radius: 10px; }
button.nav-button[aria-pressed="true"] { background: var(--control-hover); }
button.nav-button[aria-pressed="true"]::after { bottom: -2px; }
.category-chip { padding: 6px 10px; border: 1px solid var(--line); border-radius: 999px; }
.workspace { max-width: 680px; padding: 20px 24px 24px; }
.workspace.is-active { margin-block: 0; }
.monitor-status { min-height: 42px; padding: 7px 11px; margin: 0 auto 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--surface-rgb) / 45%); font-size: 11px; }
.monitor-status button { border: 0; color: var(--accent-text); font-size: 11px; }
.timer-card { width: 100%; max-width: none; padding: 22px; border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / calc(var(--window-opacity) * .72)); }
.task-eyebrow { margin-bottom: 10px; color: var(--text-muted); font-size: 10px; font-weight: 600; letter-spacing: .05em; }
.task-eyebrow .icon { width: 14px; height: 14px; font-size: 13px; }
.task-copy h1 { font-size: 22px; font-weight: 650; letter-spacing: -.5px; }
.task-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 9px; }
.task-summary .meta-dot { margin: 0 2px; }
.task-control-mode { padding: 2px 7px; border: 1px solid var(--line); border-radius: 999px; color: var(--text-muted); font-size: 10px; }
.task-mode-hint { max-width: 310px; margin: 8px 0 0; color: var(--text-muted); font-size: 10px; line-height: 1.6; }
.timer { font-family: ui-monospace, Consolas, monospace; font-size: clamp(23px, 4vw, 32px); letter-spacing: -1px; }
.actions { gap: 12px; margin-top: 18px; padding-top: 15px; border-top: 1px solid var(--line); }
button.round-action { width: 38px; height: 38px; padding: 9px; }
button.quiet-action { padding: 8px 10px; }
.form-card { width: 100%; max-width: none; padding: 16px 18px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.work-form { gap: 12px; }
.work-form > button { min-height: 40px; font-weight: 600; }
.switch-panel { max-width: none; padding: 12px 16px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--surface-rgb) / 35%); }
.switch-panel summary { font-weight: 600; color: var(--text-primary); }
.switch-confirm { margin-top: 18px; font-size: 12px; line-height: 1.8; }
.switch-confirm p { margin: 0; }
.confirm-actions { margin-top: 10px; }
.confirm-actions button { justify-content: center; }
.ui-dialog, .history-dialog, .appearance-dialog, .delete-dialog { padding: 22px; }
.settings-heading { padding-bottom: 12px; border-bottom: 1px solid var(--line); }
.settings-heading h2 { font-size: 16px; }
.monitor-settings { margin-top: 18px; }
.monitor-rule { padding: 14px; border-radius: 12px; }
.monitor-rule legend { color: var(--text-primary); font-weight: 600; }
.monitor-toggle input { accent-color: var(--accent); }
.monitor-toggle { line-height: 1.6; }
.history-records li, .settlement-record { padding: 15px 0; }
.notice-titlebar { padding: 14px 18px; border-bottom: 1px solid var(--line); }
.notice-titlebar span { font-weight: 600; }
.notice-content { padding: 8px 18px 18px; }
.island-shell { padding: 0 10px 0 14px; border-radius: 32px; }
.island-mark { color: var(--on-accent); background: var(--accent); border: 0; }
.island-info small { color: var(--text-muted); }
.island-time { font: 600 15px ui-monospace, Consolas, monospace; }
.island-open { display: flex; justify-content: center; align-items: center; color: var(--accent-text); background: var(--control-hover); }
.island-open .icon { width: 14px; height: 14px; font-size: 13px; transform: rotate(45deg); }
@media (max-width: 540px) {
  .titlebar { padding-inline: 10px; }
  .workspace { padding: 14px; }
  .timer-card { padding: 16px; }
}
@media (max-width: 380px) {
  .titlebar { padding-inline: 8px; }
  .workspace { padding: 10px; }
  .timer-card { padding: 13px; }
  .task-copy h1 { font-size: 17px; }
  .task-row { gap: 6px; }
  .timer { font-size: 22px; }
}

/* Secondary pages share the same cards, controls and token-driven typography. */
.history-dialog { width: min(540px, calc(100% - 32px)); }
.history-filters { padding: 14px; border: 1px solid var(--line); border-radius: var(--panel-radius); background: rgb(var(--window-rgb) / 45%); }
.history-filters label { color: var(--text-muted); font-weight: 600; }
.history-filters button { min-height: 38px; }
.history-tabs { padding: 4px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-tabs button { border-color: transparent; background: transparent; }
.history-tabs .icon, .history-pagination .icon, .history-filters .icon, .delete-link .icon { width: 15px; height: 15px; font-size: 14px; }
.history-overview { padding: 12px 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 45%); }
.summary-grid > div { padding: 12px 10px; }
.history-records { display: grid; gap: 9px; }
.history-records li { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.history-records .record-heading { align-items: flex-start; }
.stats-section { padding: 14px; border: 1px solid var(--line); border-radius: 12px; background: rgb(var(--window-rgb) / 40%); }
.stats-section h3 { margin: 0 0 10px; }
.settlement-panel { padding: 18px; }
.settlement-panel .settings-heading { margin-bottom: 12px; }
.settlement-record { border-bottom: 1px solid var(--line); }
.settlement-form { padding: 0 4px 10px; }

button.theme-choice { min-height: 68px; padding: 12px; }
.theme-sample { width: 36px; height: 42px; border-radius: 9px; }
.theme-label strong { font-size: 13px; }
.theme-label > span { white-space: normal; }
.opacity-heading { margin-top: 20px; }

.notice-content h1 { margin-top: 12px; }
.notice-content p { line-height: 1.7; }

/* Independent panels reserve fixed header/footer rows. Only the body scrolls. */
.panel-app{display:flex;flex-direction:column;flex:1;min-height:0;height:100%;overflow:hidden}
.panel-app .panel-surface{flex:1;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr) auto;overflow:hidden}
.panel-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;border-bottom:1px solid var(--line);flex-shrink:0}
.panel-heading h2{margin:0;font-size:18px}.panel-heading button{width:auto}
.panel-scroll{overflow:auto;min-height:0;padding:18px 24px 24px;scrollbar-width:thin}
.panel-actions{grid-row:3;display:flex;align-items:center;justify-content:flex-end;gap:12px;padding:14px 22px;border-top:1px solid var(--line);background:rgb(var(--surface-rgb)/98%)}
.panel-actions>button{width:auto;min-width:120px}.panel-actions .history-pagination{width:100%;margin:0}
.settings-tabs{display:flex;gap:8px;padding:12px 20px;border-bottom:1px solid var(--line);flex-shrink:0}.settings-tabs button{width:auto;flex:1}
.settings-tabs button[aria-pressed=true]{border-color:var(--accent);color:var(--accent-text)}
.draft-indicator{font-size:11px;margin:0;padding:6px 24px;color:var(--accent-text);flex-shrink:0}
.panel-app>.error-banner{margin:8px 20px;flex-shrink:0;max-height:80px;overflow:auto}
.data-buttons{display:flex;gap:10px;margin:14px 0 24px;flex-wrap:wrap}.data-buttons button{width:auto}
.panel-app .monitor-settings{padding:0}.panel-app .theme-grid{max-width:760px}.panel-app .settlement-form{max-width:760px;margin-top:20px}
@media(max-width:600px){.panel-scroll{padding:14px}.panel-heading,.panel-actions{padding:12px}.settings-tabs{padding:8px}.panel-actions>button{min-width:0;flex:1}}

/* Shared preferences: every desktop surface uses the saved typography. */
.desktop-frame{font-size:var(--body-size,14px);font-weight:var(--body-weight,400);line-height:var(--body-line,1.6)}
.desktop-frame button,.desktop-frame input,.desktop-frame select,.desktop-frame textarea,.desktop-frame label,.desktop-frame summary{font-size:1em;font-weight:inherit;line-height:inherit}
.desktop-frame h1{font-size:1.5em}.desktop-frame h2{font-size:1.2em}.desktop-frame h3{font-size:1.05em}.desktop-frame .hint,.desktop-frame .task-summary{font-size:.82em}.desktop-frame .timer{font-size:2.25em}.desktop-frame .task-control-mode{font-size:.75em}
.app-shell{position:relative;isolation:isolate}.window-background{position:absolute;inset:0;z-index:-1;pointer-events:none;background-size:cover;background-position:center}
button.nav-button[aria-pressed="true"]::after{display:none}.desktop-frame .main-nav{display:flex;gap:3px}.desktop-frame .titlebar{grid-template-columns:auto auto minmax(0,1fr) auto}
.work-badge{display:inline-flex;align-items:center;gap:8px;min-width:0}.work-symbol{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:31px;height:31px;border-radius:9px;color:var(--work-color);background:color-mix(in srgb,var(--work-color) 12%,transparent)}.work-symbol .icon{font-size:19px}.work-badge>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button.workload-carousel{display:flex;align-items:center;justify-content:center;gap:7px;min-width:0;overflow:hidden;padding:6px 9px;border:1px solid var(--line);border-radius:999px;background:rgb(var(--surface-rgb)/45%);color:var(--text-primary);font-size:.8em;white-space:nowrap}.workload-carousel .work-symbol{width:22px;height:22px;border-radius:50%}.workload-carousel .icon{font-size:14px}.workload-carousel .work-badge{gap:5px;flex-shrink:0}.workload-carousel small{color:var(--text-muted);font-size:.8em;overflow:hidden;text-overflow:ellipsis}.workload-carousel>span{overflow:hidden;text-overflow:ellipsis}
.home-footer{display:flex;align-items:center;gap:8px;margin-top:12px;min-width:0}.home-footer button{flex-shrink:0}.monitor-caption{font-size:.72em;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto}.start-prompt{border:1px solid var(--line);border-radius:var(--panel-radius);background:rgb(var(--surface-rgb)/94%);padding:16px;margin-bottom:12px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}.start-prompt>strong{font-size:1em}.start-prompt p{width:100%;color:var(--text-muted);font-size:.85em;margin:0}.start-prompt>div{display:flex;gap:9px;width:100%}.start-prompt button{justify-content:center}.browse-banner{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--line);border-radius:12px;padding:10px 13px;margin-bottom:12px;background:rgb(var(--surface-rgb)/85%);font-size:.88em}.browse-banner button{width:auto;justify-content:center;flex-shrink:0}
.panel-actions>button,.settings-actions>button,.data-buttons>button{justify-content:center!important;text-align:center}.panel-app button{max-width:100%}.panel-heading{padding:12px 22px}.panel-heading h2{font-size:1.15em}.settings-tabs{gap:5px;padding:10px 16px}.settings-tabs button{padding:8px 9px;font-size:.88em}.layout-form{display:grid;gap:18px;max-width:650px}.layout-form input[type=range]{padding:0}.font-preview{padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.visual-category{border:1px solid var(--line);border-radius:12px;padding:15px;margin:0 0 18px;min-width:0}.visual-category legend{padding:0 7px}.color-field{display:flex!important;align-items:center;gap:12px;margin-bottom:12px}.color-field input{width:45px;height:30px;padding:2px;margin:0}.color-field span{color:var(--text-muted);font-size:.8em}.icon-picker{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:7px;margin-top:12px}.icon-picker button{min-height:40px;padding:8px}.icon-picker button[aria-pressed=true]{border-color:var(--accent-text);outline:1px solid var(--accent-text);background:var(--control-hover)}.background-settings{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.compact-help{margin:8px 0;font-size:.84em;color:var(--text-muted)}.compact-help summary{cursor:pointer}.monitor-diagnostics,.advanced-settings{padding:12px 14px;border:1px solid var(--line);border-radius:10px;margin-bottom:14px}.monitor-diagnostics>summary,.advanced-settings>summary{cursor:pointer;font-weight:600}.monitor-diagnostics>p,.monitor-diagnostics>button,.monitor-diagnostics>details{margin-top:12px}.advanced-settings>fieldset{margin-top:12px}
.desktop-frame[data-density=compact]{padding:5px;--content-gap:6px}.desktop-frame[data-density=compact] .titlebar{min-height:39px;padding:5px 8px;gap:5px}.desktop-frame[data-density=compact] .brand-name{display:none}.desktop-frame[data-density=compact] .brand-mark{width:22px;height:22px}.desktop-frame[data-density=compact] .titlebar-drag{min-height:24px}.desktop-frame[data-density=compact] .nav-button{width:25px;height:25px;padding:4px}.desktop-frame[data-density=compact] .nav-button .icon{font-size:15px}.desktop-frame[data-density=compact] .window-control{width:22px;height:25px;padding:4px}.desktop-frame[data-density=compact] .window-controls{gap:0}.desktop-frame[data-density=compact] .workload-carousel{padding:3px 5px;gap:4px;font-size:.7em}.desktop-frame[data-density=compact] .workload-carousel small{display:none}.desktop-frame[data-density=compact] .workload-carousel .work-symbol{width:17px;height:17px}.desktop-frame[data-density=compact] .workload-carousel .work-symbol .icon{font-size:12px}.desktop-frame[data-density=compact] .workspace{padding:8px 10px 9px;max-width:none}.desktop-frame[data-density=compact] .auxiliary{display:none}.desktop-frame[data-density=compact] .timer-card{padding:10px 12px;border-radius:12px}.desktop-frame[data-density=compact] .task-copy h1{font-size:1em}.desktop-frame[data-density=compact] .task-summary{margin-top:3px;font-size:.7em;gap:3px}.desktop-frame[data-density=compact] .task-control-mode{font-size:.9em;padding:0 4px}.desktop-frame[data-density=compact] .task-copy .work-symbol{width:25px;height:25px}.desktop-frame[data-density=compact] .task-copy .work-symbol .icon{font-size:16px}.desktop-frame[data-density=compact] .timer{font-size:1.65em}.desktop-frame[data-density=compact] .actions{margin-top:6px;padding-top:6px;gap:8px}.desktop-frame[data-density=compact] .round-action{width:29px;height:29px;padding:6px}.desktop-frame[data-density=compact] .quiet-action{padding:3px 5px;font-size:.8em}.desktop-frame[data-density=compact] .form-card{padding:9px 11px;margin-top:0;border-radius:12px}.desktop-frame[data-density=compact] .work-form{gap:7px}.desktop-frame[data-density=compact] .work-form label{font-size:.82em}.desktop-frame[data-density=compact] .work-form select{padding:4px 8px;margin-top:2px}.desktop-frame[data-density=compact] .work-form>button{min-height:30px;padding:4px 9px;font-size:.82em;justify-content:center}.desktop-frame[data-density=compact] .form-note>summary{font-size:.72em}.desktop-frame[data-density=compact] .home-footer{margin-top:6px;gap:4px}.desktop-frame[data-density=compact] .home-footer button{font-size:.7em;padding:4px 7px}.desktop-frame[data-density=compact] .monitor-caption{font-size:.65em}.desktop-frame[data-density=compact] .switch-panel{margin-top:6px;padding:5px 9px;font-size:.8em}.desktop-frame[data-density=compact] .start-prompt{padding:10px;gap:6px;margin-bottom:7px}.desktop-frame[data-density=compact] .start-prompt p{font-size:.75em}.desktop-frame[data-density=compact] .start-prompt button{padding:5px 8px;font-size:.82em}.desktop-frame[data-density=compact] .browse-banner{padding:8px 10px;margin-bottom:7px}.desktop-frame[data-density=compact] .browse-banner button{padding:5px 8px}.desktop-frame[data-density=compact] .settings-tabs{padding:6px 10px}.desktop-frame[data-density=compact] .settings-tabs button{padding:5px 7px;font-size:.8em}.desktop-frame[data-density=compact] .panel-heading{padding:8px 14px}.desktop-frame[data-density=compact] .panel-scroll{padding:10px 14px}.desktop-frame[data-density=compact] .panel-actions{padding:8px 14px}.desktop-frame[data-density=compact] .panel-actions>button{padding:7px 12px}.desktop-frame[data-density=compact] .monitor-settings{gap:9px}.desktop-frame[data-density=compact] .monitor-rule{padding:9px;gap:6px}.desktop-frame[data-density=compact] .theme-choice{min-height:48px;padding:8px}.desktop-frame[data-density=compact] .theme-sample{width:25px;height:28px}.desktop-frame[data-density=compact] .visual-category{padding:10px;margin-bottom:10px}
/* Main titlebar: identity + one settings entry, drag space, workload, window controls. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto auto minmax(32px,1fr) minmax(120px,320px) auto; }
.titlebar-main .titlebar-space { align-self:stretch; min-width:32px; }
.titlebar-main .workload-carousel { min-height:32px; }
.titlebar-main .workload-carousel .work-badge { flex:0 1 auto; min-width:0; }
.titlebar-main .workload-carousel strong { flex:0 0 auto; font-variant-numeric:tabular-nums; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto auto minmax(24px,1fr) minmax(100px,240px) auto; min-height:42px; gap:6px; }
.desktop-frame[data-density=compact] .titlebar-main .titlebar-space { min-width:24px; }
.desktop-frame[data-density=compact] .titlebar-main .nav-button { width:28px; height:28px; }
.desktop-frame[data-density=compact] .titlebar-main .workload-carousel { min-height:28px; padding:4px 8px; font-size:.75em; }
@media(max-width:600px) { .titlebar-main .brand-name { display:none; } }

/* Compact native status window: all persistent actions share the same row. */
.island-frame { padding:4px; }
.island-shell { position:relative; display:flex; flex-direction:column; align-items:stretch; justify-content:center; padding:5px 8px; border-radius:20px; gap:5px; }
.island-main-row { display:flex; align-items:center; min-height:30px; gap:5px; }
.island-drag { height:auto; gap:7px; }
.island-drag .work-symbol { width:26px; height:26px; border-radius:8px; flex-shrink:0; }
.island-drag .work-symbol .icon { font-size:16px; }
.island-info { gap:0; }
.island-info strong { font-size:12px; line-height:1.4; }
.island-info small { font-size:9px; line-height:1.4; }
.island-drag .island-time { font-size:12px; }
button.island-action, button.island-open { display:flex; justify-content:center; align-items:center; flex:0 0 26px; width:26px; height:26px; margin:0; padding:4px; border-radius:50%; background:transparent; color:var(--text-muted); box-shadow:none; }
button.island-action:hover:not(:disabled),button.island-open:hover:not(:disabled) { background:var(--control-hover); color:var(--accent-text); }
button.island-start { width:auto; flex-shrink:0; min-height:26px; padding:4px 8px; font-size:10px; border-radius:8px; }
.island-intent { display:flex; gap:6px; padding-left:33px; }
.island-intent button { width:auto; min-height:25px; padding:3px 10px; font-size:10px; justify-content:center; }
.island-error { position:absolute; left:2px; top:2px; font-size:10px; }
.layout-form { width:100%; margin-inline:auto; }
.layout-form input[type=range] { margin-inline:0; }
.panel-surface:has(.layout-form) .panel-heading, .panel-surface:has(.layout-form) .panel-actions { width:100%; max-width:694px; margin-inline:auto; }
button { transition:background-color .14s,border-color .14s,color .14s; }
button:active:not(:disabled) { box-shadow:inset 0 1px 2px rgb(0 0 0 / 12%); }
button.nav-button:hover:not(:disabled),button.text-button:hover:not(:disabled),button.workload-carousel:hover:not(:disabled) { background:var(--control-hover); }
@media (prefers-reduced-motion:reduce) { button { transition:none; } }

.monitor-work-sites { display:grid; gap:10px; min-width:0; }
.monitor-work-sites h3 { margin:0; font-size:1em; }
.monitor-work-sites > .hint { margin:0; }
.monitor-work-group { border:1px solid var(--line); border-radius:12px; min-width:0; }
.monitor-work-group > summary { display:flex; align-items:center; gap:10px; padding:10px 12px; cursor:pointer; list-style:none; }
.monitor-work-group > summary::before { content:"›"; color:var(--text-muted); transition:transform .14s; }
.monitor-work-group[open] > summary::before { transform:rotate(90deg); }
.monitor-work-group > summary span { margin-left:auto; font-size:.8em; color:var(--text-muted); }
.monitor-work-urls { display:grid; gap:10px; padding:0 12px 12px; min-width:0; }

.category-names-editor { display: grid; gap: 12px; margin-block: 16px; padding-block: 16px; border-block: 1px solid var(--border); }

.sound-preview-buttons { display: flex; flex-wrap: wrap; gap: 8px; }

/* v0.2.5: retain the desktop layout and theme tokens. */
.desktop-frame .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
.titlebar-main .titlebar-drag:first-child { grid-column:1; grid-row:1; }
.titlebar-main .titlebar-space { grid-column:2; grid-row:1; min-width:24px; }
.titlebar-main .browse-toolbar { grid-column:3; grid-row:1; }
.titlebar-main .main-nav { grid-column:4; grid-row:1; padding-left:8px; border-left:1px solid var(--line); }
.titlebar-main .window-controls { grid-column:5; grid-row:1; }
.desktop-frame[data-density=compact] .titlebar.titlebar-main { grid-template-columns:auto minmax(24px,1fr) auto auto auto; }
button.browse-toolbar { width:auto; padding:4px 2px; gap:7px; color:var(--text-muted); background:transparent; box-shadow:none; font-size:12px; white-space:nowrap; }
button.browse-toolbar .icon { width:17px; height:17px; font-size:17px; }
button.browse-toolbar[aria-pressed=true] { color:var(--accent-text); }
.browse-switch { width:30px; height:18px; padding:2px; border-radius:20px; background:rgb(var(--surface-rgb)/65%); border:1px solid var(--line); }
.browse-switch::before { content:""; display:block; width:12px; height:12px; border-radius:50%; background:var(--text-muted); transition:transform .18s,background .18s; }
[aria-pressed=true] .browse-switch { background:var(--accent); border-color:var(--accent); }
[aria-pressed=true] .browse-switch::before { transform:translateX(12px); background:var(--on-accent); }
.window-background { inset:-4px; filter:blur(2px); }
.workspace { display:flex; flex-direction:column; flex:0 0 auto; min-height:0; gap:12px; }
.workspace.is-active { margin-block:0; }
.workspace > .timer-card,.workspace > .form-card { width:100%; margin:0; border-color:var(--window-border); background:rgb(var(--surface-rgb)/calc(var(--window-opacity) * .72)); box-shadow:var(--panel-shadow); backdrop-filter:blur(12px); }
.workspace .actions { display:flex; flex-wrap:wrap; align-items:center; gap:12px; border-top:1px solid var(--line); padding-top:18px; }
.workspace .quiet-action { gap:7px; }
.workspace .home-footer { margin-top:0; }
.workspace .home-footer .text-button { padding:3px 0; border:0; border-radius:0; }
button.browse-toolbar[aria-pressed=true]:disabled { opacity:.85; }
.workspace > .notice,.workspace > .error-banner { margin-bottom:0; }
.work-form .category-field { display:flex; align-items:center; gap:12px; }
.category-field-symbol { display:grid; place-items:center; width:40px; height:40px; flex-shrink:0; border-radius:var(--control-radius); color:var(--accent-text); background:var(--control-hover); }
.work-form .category-field label { flex:1; min-width:0; }
.work-form .category-field select { border:0; background:transparent; margin:0; padding:10px 4px; font-size:1.05em; box-shadow:none; }
.work-input-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.work-input-row label { min-width:0; }
.work-input-row textarea { min-height:42px; resize:vertical; }
.work-form .start-work { width:100%; justify-content:center; border-radius:999px; gap:9px; margin-top:2px; }
.work-form .cancel-switch { justify-content:flex-start; width:auto; color:var(--text-primary); background:transparent; padding:4px 0; box-shadow:none; }
.switch-hint { font-size:11px; color:var(--text-muted); margin:0; }
button.today-strip { display:flex; gap:13px; width:100%; flex-shrink:0; padding:12px 0 2px; border:0; border-top:1px solid var(--line); border-radius:0; box-shadow:none; background:transparent; color:var(--text-muted); font-size:12px; text-align:left; }
button.today-strip:hover { background:transparent; color:var(--text-primary); }
.today-strip-label { display:flex; align-items:center; gap:7px; flex-shrink:0; color:var(--text-primary); white-space:nowrap; }
.today-strip .icon { width:16px; height:16px; font-size:16px; }
.today-strip-viewport { display:block; flex:1; min-width:0; overflow:hidden; }
.today-strip-track { display:flex; width:max-content; gap:32px; white-space:nowrap; }
.today-strip-track > span { flex-shrink:0; }
.today-strip-track.is-scrolling { animation:today-scroll var(--scroll-duration) linear infinite; }
.today-strip:hover .today-strip-track,.today-strip:focus-visible .today-strip-track { animation-play-state:paused; }
@keyframes today-scroll { to { transform:translateX(calc(-1 * var(--scroll-distance))); } }
.desktop-frame[data-density=compact] .workspace { gap:8px; }
.desktop-frame[data-density=compact] .workspace .actions { gap:8px; padding-top:10px; }
.desktop-frame[data-density=compact] .category-field-symbol { width:30px; height:30px; }
.desktop-frame[data-density=compact] .today-strip { font-size:10px; gap:8px; padding-top:8px; }
.desktop-frame[data-density=compact] .workspace .home-footer { margin-top:0; }
@media(max-width:440px) {
  .workspace .actions { gap:8px; }
  .workspace .quiet-action { padding-inline:4px; gap:4px; }
  .workspace .quiet-action .icon { width:17px; height:17px; font-size:17px; }
  .work-input-row { grid-template-columns:1fr; gap:8px; }
  .browse-toolbar .browse-switch { display:none; }
  .titlebar-main .main-nav { padding-left:4px; }
}
@media(prefers-reduced-motion:reduce) {
  .today-strip-track.is-scrolling { animation:none; }
  .today-strip-track > span[aria-hidden] { display:none; }
  .today-strip-viewport { overflow-x:auto; scrollbar-width:thin; }
  .browse-switch::before { transition:none; }
}

/* Fixed island body; the lower reveal shares this single material layer. */
.island-frame { padding:4px; }
.island-frame .island-shell { position:absolute; left:4px; top:4px; width:312px; height:auto; max-height:calc(100% - 8px); padding:0; gap:0; display:flex; flex-direction:column; justify-content:flex-start; border-radius:20px; overflow:hidden; backdrop-filter:blur(12px); }
.island-frame .island-main-row { position:relative; width:310px; height:46px; min-height:46px; flex:0 0 46px; padding:5px 7px; margin:0; gap:3px; border-radius:20px; }
.island-frame .island-drag { align-self:stretch; min-width:0; height:auto; }
.island-frame .island-info { min-width:0; }
.island-frame .island-drag .work-symbol { flex:0 0 25px; width:25px; height:25px; }
.island-frame .island-time { font-size:12px; }
.island-frame button.island-action,.island-frame button.island-open { flex:0 0 22px; width:22px; height:26px; padding:3px; border-radius:8px; }
.island-frame .island-action .icon,.island-frame .island-open .icon { width:14px; height:14px; font-size:14px; }
.island-expansion { width:310px; flex:none; overflow:hidden; transition:height .2s ease,opacity .2s ease,transform .2s ease; }
.island-expansion:not(.island-reveal-enter):not(.island-reveal-appear):not(.island-reveal-leave) { overflow-y:auto; scrollbar-width:thin; }
.island-expansion-content { padding:5px 13px 14px; font-size:12px; }
.island-expansion-content h2 { margin:0 0 8px; font-size:14px; font-weight:600; }
.island-expansion-content p { margin:0 0 9px; line-height:1.65; }
.island-expansion-content button { min-height:29px; padding:6px 9px; font-size:11px; justify-content:center; }
.island-buttons { display:flex; gap:8px; }
.island-expansion .settlement-form { display:flex; flex-direction:column; gap:9px; }
.island-expansion .settlement-form .hint { font-size:10px; margin:0; }
.island-expansion .settlement-form label { font-size:11px; }
.island-expansion .settlement-form input,.island-expansion .settlement-form select,.island-expansion .settlement-form textarea { margin-top:4px; padding:5px 7px; font-size:12px; }
.island-expansion .text-button { margin-top:8px; width:100%; }
.island-discard { padding:8px; margin-bottom:10px; border:1px solid var(--line); border-radius:var(--control-radius); }
.island-discard button+button { margin-top:6px; }
@media(prefers-reduced-motion:reduce) { .island-expansion { transition:none; } }
~~~~~~

## E:\WorkMemo\src\App.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { WorkForm } from "./WorkForm";
import { useWorkSession } from "./useWorkSession";
import { formatTime, type StartInput } from "./types";
import { workView } from "./workView";
import { formatQuantity } from "./history";
import { Icon } from "./Icon";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  useDashboard,
  layoutStyle,
  WorkBadge,
} from "./desktopPreferences";
import "./App.css";
import { type TodayWorkload as Today } from "./workload";
import { TodayWorkloadStrip } from "./TodayWorkloadStrip";
import { useMainContentHeight } from "./useMainContentHeight";
export default function App() {
  const session = useWorkSession();
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const layout = useLayout();
  const dashboard = useDashboard();
  const [noteOpen, setNoteOpen] = useState(false);
  const [switchRequest, setSwitchRequest] = useState<{
    input: StartInput;
    id: number;
    category: string;
  } | null>(null);
  const [navigationError, setNavigationError] = useState("");
  const [migrationFound, setMigrationFound] = useState(false);
  const [today, setToday] = useState<Today[] | null>(null);
  const [todayError, setTodayError] = useState("");
  const [startupError, setStartupError] = useState("");
  const [switchingFrom, setSwitchingFrom] = useState<number | null>(null);
  const workspace = useRef<HTMLElement>(null);
  const heightError = useMainContentHeight(workspace, !!session.snapshot);
  const active = session.snapshot?.active;
  const view = workView(session);
  const record = view.record;
  const monitor = session.snapshot?.monitoring;
  const candidate = monitor?.start_candidate;
  const unavailable = !view.canOperate || session.busy;
  const compact = layout.current.density === "compact";
  useEffect(() => {
    if (!session.native) return;
    let stopped = false;
    const reload = () => { void invoke<{ error: string | null }>("get_startup_status")
      .then(value => { if (!stopped) setStartupError(value.error ? `开机启动：${value.error}` : ""); })
      .catch(e => { if (!stopped) setStartupError(`无法读取开机启动状态：${String(e)}`); }); };
    reload();
    const listener = listen("workmemo:startup-changed", reload);
    return () => { stopped = true; void listener.then(fn => fn()); };
  }, [session.native]);
  function panel(section: string) {
    void invoke("open_panel", { panel: "settings", section }).catch((e) =>
      setNavigationError(String(e)),
    );
  }
  useEffect(() => {
    if (!session.native) return;
    let reading = false;
    let stopped = false;
    const load = async () => {
      if (reading) return;
      reading = true;
      try {
        const items = await invoke<Today[]>("get_today_workload");
        if (!stopped) {
          setToday(items);
          setTodayError("");
        }
      } catch (e) {
        if (!stopped) setTodayError(String(e));
      } finally {
        reading = false;
      }
    };
    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 5000);
    const p = listen("workmemo:data-changed", () => {
      void load();
      void session.refresh();
    });
    return () => {
      stopped = true;
      clearInterval(timer);
      void p.then((f) => f());
    };
  }, [session.native]);
  useEffect(() => {
    if (!session.native) return;
    void invoke<boolean>("detect_preview_data")
      .then(setMigrationFound)
      .catch(() => {});
    const p = listen("workmemo:appearance-changed", () => {
      void appearance.reload();
    });
    return () => {
      void p.then((f) => f());
    };
  }, [session.native]);
  const switching = switchingFrom !== null;
  const switchValid = !!active?.is_paused && active.id === switchingFrom;
  return (
    <DesktopWindow
      density={layout.current.density}
      background={presentation.current.background}
      appearanceStyle={{
        ...themeStyle(appearance.current),
        ...layoutStyle(layout.current),
      }}
      navigation={
        <nav className="main-nav" aria-label="主导航">
          <button
            className="nav-button"
            title="设置"
            aria-label="设置"
            onClick={() => panel("monitor")}
          >
            <Icon name="settings" />
          </button>
        </nav>
      }
      categories={
        <button type="button" className="browse-toolbar" aria-label="仅浏览" aria-pressed={!!monitor?.browsing_only}
          title={monitor?.browsing_only ? monitor.browse_ready ? "退出仅浏览，开始或继续记录" : "请先返回已匹配的工作页面操作" : "仅浏览，暂停计时"}
          disabled={unavailable || (!!monitor?.browsing_only && (!monitor.browse_ready || !!active?.recovery_pending))}
          onClick={() => { void (monitor?.browsing_only ? session.confirmWork(null) : session.browse()); }}>
          <Icon name="eye" /><span>仅浏览</span><span className="browse-switch" aria-hidden="true" />
        </button>
      }
    >
      <main
        ref={workspace}
        className={`workspace ${active ? "is-active" : ""}`}
      >
        {dashboard.fallback}
        {(session.connectionError ||
          session.commandError ||
          navigationError ||
          startupError ||
          heightError ||
          appearance.loadError ||
          presentation.error ||
          layout.error) && (
          <p className="error-banner" role="alert">
            {session.connectionError ||
              session.commandError ||
              navigationError ||
              startupError ||
              heightError ||
              appearance.loadError ||
              presentation.error ||
              layout.error}
          </p>
        )}
        {session.snapshot?.warning && (
          <p className="notice" role="alert">
            {session.snapshot.warning}
          </p>
        )}
        {!session.native && (
          <p className="notice">浏览器预览 · 计时和保存请使用桌面应用</p>
        )}
        {active?.recovery_pending && (
          <p className="notice" role="status">
            上次未结束的任务保持暂停。请确认后继续，软件关闭期间不计时。
          </p>
        )}
        {candidate && !active && !switching && (
          <section className="start-prompt" aria-label="开工确认">
            <WorkBadge
              category={candidate.category}
              presentation={presentation.current}
            />
            <strong>准备开始工作？</strong>
            <p>确认前不计时，工作量稍后填写。</p>
            <div>
              <button
                disabled={session.busy}
                onClick={() => {
                  void session.confirmWork(candidate.id);
                }}
              >
                开始记录
              </button>

            </div>
          </section>
        )}
        {!switching && active && (
          <section
            className="timer-card"
            aria-label="当前工作"
            aria-busy={session.loading || session.busy}
          >
            <div className="task-row flex items-center justify-between gap-4">
              <div className="task-copy">
                <div className="task-eyebrow auxiliary">当前工作</div>
                <h1>
                  {record ? (
                    <WorkBadge
                      category={record.category}
                      presentation={presentation.current}
                    />
                  ) : (
                    view.label
                  )}
                </h1>
                <p className="task-summary">
                  <span className="state-label" role="status">
                    {monitor?.browsing_only ? "仅浏览 · 已停表" : view.label}
                  </span>
                  {record && (
                    <span className="task-control-mode">
                      {record.control_mode === "AUTO" ? "自动记录" : "手动计时"}
                    </span>
                  )}
                </p>
              </div>
              <output className="timer" aria-label="有效工作时长">
                {view.timer}
              </output>
            </div>
            {record && (
              <div className="actions flex items-center gap-3">
                {active && (
                  <button
                    className="round-action"
                    disabled={unavailable}
                    title={active.is_paused ? "继续工作" : "暂停"}
                    aria-label={active.is_paused ? "继续工作" : "暂停"}
                    onClick={() => {
                      void (active.is_paused
                        ? session.resume(active.id)
                        : session.pause(active.id));
                    }}
                  >
                    <Icon name={active.is_paused ? "play" : "pause"} />
                  </button>
                )}
                <button
                  className="quiet-action"
                  onClick={() => setNoteOpen(true)}
                  title="任务备注"
                >
                  <Icon name="note" />
                  <span>备注</span>
                </button>
                {active && <button className="quiet-action switch-action" disabled={unavailable || !active.is_paused || !!active.recovery_pending}
                  title={active.is_paused ? "切换任务" : "请先暂停再切换任务"} onClick={() => setSwitchingFrom(active.id)}>
                  <Icon name="swap" /><span>切换任务</span>
                </button>}
                {active && (
                  <button
                    className="quiet-action finish-action"
                    disabled={unavailable}
                    onClick={() => {
                      void session.finish(active.id);
                    }}
                    title="结束计时"
                  >
                    <Icon name="check" />
                    <span>结束</span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}
        {(switching || (!active && !candidate && (session.snapshot || !session.native))) && (
          <section className="form-card new-task-page" aria-label={switching ? "切换任务" : "新建任务"}>
            {switching && !switchValid && <p className="notice" role="status">原任务状态已变化，请返回当前任务确认。填写内容仍保留。</p>}
            <WorkForm minimal={compact} switching={switching} disabled={unavailable || (switching && !switchValid)}
              starting={session.pending === "start_task"} onCancel={switching ? () => { setSwitchingFrom(null); setSwitchRequest(null); } : undefined}
              onStart={async input => {
                if (switching) {
                  if (!switchValid || !active) return false;
                  setSwitchRequest({input, id: switchingFrom, category: active.category});
                  return false;
                }
                return session.start(input);
              }} />
          </section>
        )}
        <div className="home-footer">
          <button
            className="text-button"
            onClick={() => {
              void dashboard.open("pending");
            }}
          >
            待补全 {session.snapshot?.pending_count ?? "—"}
          </button>
          <span className="monitor-caption" title={monitor?.message}>
            {monitor?.message || "正在读取状态…"}
          </span>
        </div>
        <TodayWorkloadStrip items={today} error={todayError} onOpen={() => { void dashboard.open("today"); }} />
        {monitor?.idle_warning && (
          <p className="notice" role="status">
            已连续 {monitor.idle_warning_seconds} 秒没有输入，
            {monitor.idle_end_seconds} 秒时将自动结束。恢复操作后取消提醒。
          </p>
        )}
        {migrationFound && (
          <details className="auxiliary">
            <summary>发现预览版数据</summary>
            <button className="text-button" onClick={() => panel("data")}>
              查看并迁移
            </button>
          </details>
        )}
        <UiDialog
          open={!!switchRequest}
          onClose={() => {
            if (!session.busy) setSwitchRequest(null);
          }}
          id="switch-title"
          title="确认切换工作"
        >
          {switchRequest && (
            <>
              <p>
                结束并保存当前暂停的“{name(switchRequest.category)}”，再开始“
                {name(switchRequest.input.category)}”。原记录保留在待补全列表。
              </p>
              <div className="settings-actions">
                <button
                  className="secondary"
                  disabled={session.busy}
                  onClick={() => setSwitchRequest(null)}
                >
                  取消
                </button>
                <button
                  disabled={session.busy}
                  onClick={() => {
                    void session
                      .start(switchRequest.input, switchRequest.id)
                      .then((ok) => {
                        if (ok) { setSwitchRequest(null); setSwitchingFrom(null); }
                      });
                  }}
                >
                  保存并开始
                </button>
              </div>
            </>
          )}
        </UiDialog>
        <UiDialog
          open={noteOpen && !!record}
          onClose={() => setNoteOpen(false)}
          id="note-title"
          title="任务详情与备注"
        >
          {record && (
            <>
              <p>
                {name(record.category)} · 数量 {formatQuantity(record.quantity)}
              </p>
              <p className="hint">开始 {formatTime(record.start_time)}</p>
              <p className="task-remark">
                {record.remark || "这项工作未填写备注。"}
              </p>
            </>
          )}
        </UiDialog>
      </main>
    </DesktopWindow>
  );
}
~~~~~~

## E:\WorkMemo\src\Dashboard.tsx

~~~~~~tsx
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  App as AntApp,
  Button,
  Card,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Menu,
  Modal,
  Pagination,
  Segmented,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  type InputRef,
  type TableColumnsType,
} from "antd";
import dayjs from "dayjs";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  shiftPeriod,
  reportRangeLabel,
  type ReportPeriod,
} from "./reportPeriod";
import { useCategoryNames } from "./categoryNames";
import { DEFAULT_PRESENTATION, WorkBadge } from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import { UiProvider, useMediaQuery } from "./ui/UiProvider";
import { BottomSheet } from "./ui/BottomSheet";
import {
  api,
  initialQuery,
  type CategoryTotal,
  type Detail,
  type Data,
  type Query,
  type Row,
} from "./dashboard/api";
import { useDashboardData } from "./dashboard/useDashboardData";
import { CalendarChart, CategoryChart, TrendChart } from "./dashboard/Charts";
import "./Dashboard.css";

const minDate = dayjs("1970-01-01"),
  maxDate = dayjs("9999-12-31");
function RecordStatus({ row }: { row: Row }) {
  return (
    <Tag
      color={
        row.status !== "FINISHED"
          ? "processing"
          : row.settlement_status === "PENDING"
            ? "gold"
            : "success"
      }
    >
      {row.status !== "FINISHED"
        ? "进行中"
        : row.settlement_status === "PENDING"
          ? "待补全"
          : "已确认"}
    </Tag>
  );
}
function Title({ title, description }: { title: string; description: string }) {
  return (
    <div className="dc-card-title">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}
function DashboardContent() {
  const { message } = AntApp.useApp();
  const { name } = useCategoryNames();
  const narrow = useMediaQuery("(max-width: 640px)");
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [refresh, setRefresh] = useState(0);
  const { data, meta, error, online, refreshing, updatedAt, loading } =
    useDashboardData(query, refresh);
  const [actionError, setActionError] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [detailStale, setDetailStale] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<Query | null>(null);
  const [pendingDone, setPendingDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<InputRef>(null);
  const safeConfirmAction = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const recordsRef = useRef<HTMLElement>(null);
  const [confirmation, setConfirmation] = useState<"guard" | "delete" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const next = useRef<(() => void) | null>(null);
  const afterConfirm = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const [section, setSection] = useState("overview");
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  const categoryOptions = CATEGORIES.map((value) => ({
    value,
    label: name(value),
  }));
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const blocked = busy || confirmation !== null;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0])
          setSection(entries[0].isIntersecting ? "records" : "overview");
      },
      { rootMargin: "-64px 0px -25% 0px" },
    );
    if (recordsRef.current) observer.observe(recordsRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (editing && sheetOpen && !confirmation)
      quantityInput.current?.focus({ preventScroll: true });
  }, [editing, sheetOpen, confirmation, detail?.record.id]);
  function applyQuery(value: Query) {
    setFilters(value);
    setQuery(value);
  }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({
      ...filters,
      period,
      anchor_date:
        period === "custom"
          ? null
          : filters.anchor_date || data?.range.anchor_date || null,
      start_date: period === "custom" ? (data?.range.start_date ?? null) : null,
      end_date: period === "custom" ? (data?.range.end_date ?? null) : null,
      page: 1,
    });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    const shifted = anchor && shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  function leave(action: () => void) {
    if (busyRef.current || confirmation) return;
    if (dirty) {
      next.current = action;
      setConfirmation("guard");
      setConfirmOpen(true);
    } else action();
  }
  function showDetail(value: Detail, edit: boolean) {
    setDetail(value);
    setDetailStale(false);
    setFields({
      category: value.record.category,
      quantity: value.record.quantity === null ? "" : String(value.record.quantity),
      remark: value.record.remark,
    });
    setEditing(edit && value.record.status === "FINISHED");
    setSheetOpen(true);
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current || detail) return;
    trigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    setEditorError("");
    try {
      const value = await api<Detail>("detail", { id: row.id });
      setPendingQuery(null);
      setPendingDone(false);
      showDetail(value, edit);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  async function loadPending(criteria: Query, currentId?: number) {
    const list = await api<Data>("query", criteria);
    const row = list.records.find(record => record.id !== currentId && record.status === "FINISHED" && record.settlement_status === "PENDING");
    if (!row) return false;
    const value = await api<Detail>("detail", { id: row.id });
    if (value.record.status !== "FINISHED" || value.record.settlement_status !== "PENDING") {
      throw new Error("待补填记录已变化，请重试读取下一条。");
    }
    showDetail(value, true);
    setEditorError("");
    setPendingDone(false);
    return true;
  }
  async function openCategoryPending(category: string) {
    if (busyRef.current || detail || !online) return;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const criteria: Query = { ...query, anchor_date: data?.range.anchor_date ?? query.anchor_date, category, status: "pending", page: 1 };
    busyRef.current = true;
    setBusy(true);
    setActionError("");
    try {
      if (await loadPending(criteria)) setPendingQuery(criteria);
      else { void message.info("这个分类在当前范围已没有待补填记录。"); setRefresh(value => value + 1); }
    } catch (e) { setActionError(e instanceof Error ? e.message : String(e)); }
    finally { busyRef.current = false; setBusy(false); }
  }
  const save = useCallback(async () => {
    if (!detail || busyRef.current || !online) return false;
    const result = validateWorkInput(
      fields.category,
      fields.quantity,
      fields.remark,
      true,
    );
    if (!result.ok) {
      setEditorError(Object.values(result.errors).join(" "));
      return false;
    }
    if (result.input.quantity === null) return false;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    let committed = false;
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      committed = true;
      // A successful write remains successful if its follow-up read fails.
      const record: Row = {
        ...detail.record,
        ...result.input,
        settlement_status: "COMPLETE",
      };
      setDetail({ ...detail, record });
      setEditing(false);
      setDetailStale(true);
      setFields({
        category: record.category,
        quantity: String(record.quantity),
        remark: record.remark,
      });
      setRefresh((value) => value + 1);
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setDetailStale(false);
      void message.success({ content: "工作量已保存", key: "workload-save" });
      return true;
    } catch (e) {
      const text = e instanceof Error ? e.message : String(e);
      setEditorError(
        committed
          ? `已保存，详情刷新失败：${text}。请关闭后重新打开详情。`
          : text,
      );
      if (committed)
        void message.warning({
          content: "已保存，详情刷新失败",
          key: "workload-save",
        });
      return committed;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online, message]);
  async function nextPending() {
    if (!pendingQuery || !detail || busyRef.current || !online || confirmation) return;
    const currentId = detail.record.id;
    if (editing && !(await save())) return;
    busyRef.current = true;
    setBusy(true);
    if (!editing) setEditorError("");
    try {
      if (!(await loadPending(pendingQuery, currentId))) {
        setPendingDone(true);
        void message.success("当前分类在这个范围的待补填已全部处理。");
      }
    } catch (e) {
      setEditorError(`当前记录已保存，下一条读取失败：${e instanceof Error ? e.message : String(e)}。可重试下一条。`);
    } finally { busyRef.current = false; setBusy(false); }
  }
  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        editing &&
        sheetOpen &&
        !confirmation
      ) {
        event.preventDefault();
        void save();
      }
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, editing, sheetOpen, confirmation, save]);
  async function remove() {
    if (!deleting || busyRef.current || !online) return;
    busyRef.current = true;
    setBusy(true);
    setEditorError("");
    try {
      await api("delete", {
        id: deleting.id,
        expected_revision: deleting.revision,
      });
      setConfirmOpen(false);
      setRefresh((value) => value + 1);
      void message.success("记录已删除");
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function closeConfirmation() {
    if (!busyRef.current) {
      next.current = null;
      afterConfirm.current = null;
      setConfirmOpen(false);
    }
  }
  function restoreTrigger() {
    requestAnimationFrame(() => {
      (trigger.current?.isConnected
        ? trigger.current
        : recordsRef.current
      )?.focus({ preventScroll: true });
    });
  }
  function pendingLink(row: CategoryTotal) {
    return row.pending > 0 ? <Button type="link" size="small" className="dc-pending-link"
      aria-label={`${name(row.category)}待补填${row.pending}条`} disabled={!online || busy || !!detail}
      onClick={() => { void openCategoryPending(row.category); }}>{row.pending} 条</Button>
      : <span className="dc-muted">0 条</span>;
  }
  const reportColumns: TableColumnsType<CategoryTotal> = [
    {
      title: "工作类型",
      dataIndex: "category",
      width: "29%",
      render: (value: string) => (
        <WorkBadge category={value} presentation={presentation} />
      ),
    },
    {
      title: "已确认工作量",
      key: "quantity",
      render: (_, row) => (
        <div className="dc-report-quantity">
          <strong>
            {row.complete > 0
              ? formatQuantity(row.quantity)
              : row.pending > 0
                ? "待补填"
                : "—"}
          </strong>
          <small>
            {row.complete > 0
              ? `已确认 ${row.complete} 条`
              : row.pending > 0
                ? "尚未确认产出"
                : "暂无已结束记录"}
          </small>
        </div>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "已结束记录",
      dataIndex: "records",
      render: (value: number) => <span className="dc-number">{value} 条</span>,
    },
    {
      title: "待补填",
      dataIndex: "pending",
      render: (_, row) => pendingLink(row),
    },
  ];
  const recordColumns: TableColumnsType<Row> = [
    {
      title: "类别",
      dataIndex: "category",
      width: 150,
      render: (value: string, row) => (
        <Space orientation="vertical" size={4}>
          <WorkBadge category={value} presentation={presentation} />
          {row.is_demo && <Tag color="gold">演示</Tag>}
        </Space>
      ),
    },
    {
      title: "开始时间",
      dataIndex: "start_time",
      width: 170,
      render: (value: number) => (
        <span className="dc-date">{formatTime(value)}</span>
      ),
    },
    {
      title: "有效工时",
      dataIndex: "duration_ms",
      width: 120,
      render: (value: number) => (
        <span className="dc-number">{formatDuration(value / 1000)}</span>
      ),
    },
    {
      title: "工作量",
      key: "quantity",
      width: 110,
      render: (_, row) =>
        row.settlement_status === "COMPLETE" ? (
          <span className="dc-number">{formatQuantity(row.quantity)}</span>
        ) : (
          <span className="dc-muted">
            {row.status === "FINISHED" ? "待补填" : "进行中"}
          </span>
        ),
    },
    {
      title: "状态",
      key: "status",
      width: 100,
      render: (_, row) => <RecordStatus row={row} />,
    },
    {
      title: "备注",
      dataIndex: "remark",
      width: 190,
      ellipsis: true,
      render: (value: string) => (
        <span className="dc-muted">{value || "—"}</span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 170,
      render: (_, row) => (
        <Space size={2} className="dc-row-actions">
          <Button
            type="link"
            size="small"
            disabled={busy}
            onClick={() => {
              void openDetail(row);
            }}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              void openDetail(row, true);
            }}
          >
            {row.settlement_status === "PENDING" ? "补填" : "编辑"}
          </Button>
          <Button
            type="text"
            danger
            size="small"
            disabled={!online || busy || row.status !== "FINISHED"}
            onClick={() => {
              setEditorError("");
              setDeleting(row);
              setConfirmation("delete");
              setConfirmOpen(true);
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const totals = data?.totals;
  const scrollBehavior = reduced ? "instant" : "smooth";
  const dateField = (
    label: string,
    value: string | null,
    change: (value: string | null) => void,
    required = false,
  ) => (
    <Form.Item label={label}>
      <DatePicker
        aria-label={label}
        value={value ? dayjs(value) : null}
        minDate={minDate}
        maxDate={maxDate}
        allowClear={!required}
        format="YYYY-MM-DD"
        onChange={(date) => change(date?.format("YYYY-MM-DD") ?? null)}
        inputReadOnly={false}
      />
    </Form.Item>
  );
  return (
    <div className="data-center">
      <aside className="dc-sidebar" inert={!!detail || !!confirmation}>
        <Tooltip title="WorkMemo 工作数据中心" placement="right">
          <a
            className="dc-brand"
            href="/dashboard"
            aria-label="WorkMemo 工作数据中心"
          >
            <img src="/workmemo.png" alt="" />
          </a>
        </Tooltip>
        <Menu
          mode="inline"
          inlineCollapsed
          selectedKeys={[section]}
          items={[
            {
              key: "overview",
              icon: <Icon name="chart" />,
              label: "工作总览",
              title: "工作总览",
            },
            {
              key: "records",
              icon: <Icon name="list" />,
              label: "工作明细",
              title: "工作明细",
            },
          ]}
          onClick={({ key }) => {
            if (key === "records")
              recordsRef.current?.scrollIntoView({ behavior: scrollBehavior });
            else window.scrollTo({ top: 0, behavior: scrollBehavior });
          }}
        />
        <div className="dc-sidebar-bottom">
          <Tooltip
            title={`${online ? "本机连接正常" : "等待本机连接"} · v${meta?.version ?? "0.2.4"}`}
            placement="right"
          >
            <span
              className={`connection-dot ${online ? "connected" : ""}`}
              role="img"
              aria-label={online ? "本机连接正常" : "等待本机连接"}
            />
          </Tooltip>
        </div>
      </aside>
      <div className="dc-page" inert={!!detail || !!confirmation}>
        <header className="dc-topbar">
          <span className="dc-breadcrumb">
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <Space size={12}>
            <span className="dc-sync" aria-live="polite">
              {refreshing
                ? "正在刷新…"
                : updatedAt
                  ? `更新于 ${new Date(updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}`
                  : "等待连接"}
            </span>
            <Button
              icon={<Icon name="refresh" />}
              onClick={() => setRefresh((value) => value + 1)}
            >
              刷新连接
            </Button>
          </Space>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>
            <Tag variant="filled">记录保存在本机</Tag>
          </div>
          {query.scope !== "real" && (
            <Alert
              className="dc-notice"
              type="warning"
              showIcon
              title={
                query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"
              }
              description="示例仅用于查看效果，日常真实统计默认排除。"
            />
          )}
          {(error || actionError) && (
            <Alert
              className="dc-notice"
              type="error"
              showIcon
              title={
                data && error ? "刷新失败，当前显示上次结果" : "操作未完成"
              }
              description={actionError || error}
              action={
                <Button
                  size="small"
                  onClick={() => {
                    setActionError("");
                    setRefresh((value) => value + 1);
                  }}
                >
                  重试
                </Button>
              }
            />
          )}
          {meta?.active && (
            <Alert
              className="dc-notice dc-active"
              type="info"
              showIcon
              title={
                <Space wrap>
                  <WorkBadge
                    category={meta.active.category}
                    presentation={presentation}
                  />
                  <span>
                    {meta.active.is_paused
                      ? "当前任务已暂停"
                      : "当前任务正在计时"}
                  </span>
                </Space>
              }
              description="结束后可在这里补填工作量，进行中的任务不计入已结束报表。"
            />
          )}
          <Card
            className="dc-filters"
            styles={{ body: { padding: narrow ? 16 : 20 } }}
          >
            <div className="dc-period-bar">
              <Segmented
                aria-label="统计周期"
                value={filters.period}
                options={[
                  { value: "day", label: "日" },
                  { value: "week", label: "周" },
                  { value: "month", label: "月" },
                  { value: "custom", label: "自定义" },
                ]}
                onChange={(value) => selectPeriod(value as ReportPeriod)}
              />
              {query.period !== "custom" && (
                <div className="dc-period-nav">
                  <Button
                    aria-label="上一周期"
                    icon={<Icon name="left" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, -1)
                    }
                    onClick={() => movePeriod(-1)}
                  />
                  <strong>
                    {data ? reportRangeLabel(data.range) : "正在读取周期…"}
                  </strong>
                  <Button
                    aria-label="下一周期"
                    icon={<Icon name="right" />}
                    disabled={
                      !data?.range.anchor_date ||
                      !shiftPeriod(query.period, data.range.anchor_date, 1)
                    }
                    onClick={() => movePeriod(1)}
                  />
                  <Button
                    onClick={() =>
                      applyQuery({ ...query, anchor_date: null, page: 1 })
                    }
                  >
                    {
                      {
                        day: "今天",
                        week: "本周",
                        month: "本月",
                        custom: "当前",
                      }[query.period]
                    }
                  </Button>
                </div>
              )}
            </div>
            <Form
              layout="vertical"
              className="dc-filter-form"
              onFinish={() => applyQuery({ ...filters, page: 1 })}
            >
              {filters.period === "custom" ? (
                <>
                  {dateField("开始日期", filters.start_date, (value) =>
                    setFilters({ ...filters, start_date: value }),
                  )}
                  {dateField("结束日期", filters.end_date, (value) =>
                    setFilters({ ...filters, end_date: value }),
                  )}
                </>
              ) : (
                dateField(
                  "基准日期",
                  filters.anchor_date ??
                    data?.range.anchor_date ??
                    localDate(new Date()),
                  (value) => setFilters({ ...filters, anchor_date: value }),
                  true,
                )
              )}
              <Form.Item label="类别">
                <Select
                  aria-label="筛选工作类别"
                  value={filters.category ?? ""}
                  options={[
                    { value: "", label: "全部类别" },
                    ...categoryOptions,
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, category: value || null })
                  }
                />
              </Form.Item>
              <Form.Item label="状态">
                <Select
                  aria-label="筛选记录状态"
                  value={filters.status}
                  options={[
                    { value: "all", label: "全部状态" },
                    { value: "pending", label: "待补全" },
                    { value: "complete", label: "已确认" },
                    { value: "working", label: "进行中" },
                  ]}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                />
              </Form.Item>
              <Form.Item label="数据范围">
                <Select
                  aria-label="数据范围"
                  value={filters.scope}
                  options={[
                    { value: "real", label: "真实数据" },
                    { value: "demo", label: "演示数据" },
                    { value: "all", label: "全部数据" },
                  ]}
                  onChange={(value) => setFilters({ ...filters, scope: value })}
                />
              </Form.Item>
              <div className="dc-filter-actions">
                {filters.period === "custom" && (
                  <Button
                    onClick={() =>
                      applyQuery({
                        ...filters,
                        start_date: null,
                        end_date: null,
                        page: 1,
                      })
                    }
                  >
                    全部日期
                  </Button>
                )}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Icon name="search" />}
                >
                  应用筛选
                </Button>
              </div>
            </Form>
            <div className="dc-filter-summary">
              {JSON.stringify(filters) !== JSON.stringify(query)
                ? "筛选条件已修改，点击应用筛选后更新结果。"
                : `当前已应用 · ${data ? reportRangeLabel(data.range) : "正在读取周期"} · ${query.category ? name(query.category) : "全部类别"} · ${({ all: "全部状态", pending: "待补全", complete: "已确认", working: "进行中" } as Record<string, string>)[query.status]}`}
            </div>
          </Card>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals ? (totals.duration_ms / 3600000).toFixed(1) : "—",
                unit: "小时",
                icon: "clock" as const,
                caption: "已结束记录的有效时间",
              },
              {
                label: "已结束记录",
                value: totals ? String(totals.records) : "—",
                unit: "条",
                icon: "list" as const,
                caption: "进行中的任务单独保留",
              },
              {
                label: "待补全",
                value: totals ? String(totals.pending) : "—",
                unit: "条",
                icon: "note" as const,
                caption: "工时已保存，等待填写工作量",
              },
            ].map((item) => (
              <Card key={item.label} className="dc-kpi">
                <div className="dc-kpi-label">
                  <span>{item.label}</span>
                  <Icon name={item.icon} />
                </div>
                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
                <p>{item.caption}</p>
              </Card>
            ))}
          </section>
          <Card
            className="dc-card dc-category-report"
            title={
              <Title
                title="分类工作量"
                description={`${data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计`}
              />
            }
            extra={<Tag>自动汇总</Tag>}
            styles={{ body: { padding: 0 } }}
          >
            {loading ? (
              <div className="dc-loading" role="status">
                <Skeleton active paragraph={{ rows: 4 }} title={false} />
              </div>
            ) : data ? (
              <>
                {narrow ? (
                  <div className="dc-report-cards">
                    {data.categories.map((row) => (
                      <Card
                        size="small"
                        key={row.category}
                        title={
                          <WorkBadge
                            category={row.category}
                            presentation={presentation}
                          />
                        }
                      >
                        <dl>
                          <div>
                            <dt>已确认工作量</dt>
                            <dd className="dc-report-quantity">
                              <strong>
                                {row.complete > 0
                                  ? formatQuantity(row.quantity)
                                  : row.pending > 0
                                    ? "待补填"
                                    : "—"}
                              </strong>
                              <small>
                                {row.complete > 0
                                  ? `已确认 ${row.complete} 条`
                                  : row.pending > 0
                                    ? "尚未确认产出"
                                    : "暂无已结束记录"}
                              </small>
                            </dd>
                          </div>
                          <div>
                            <dt>有效工时</dt>
                            <dd className="dc-number">
                              {formatDuration(row.duration_ms / 1000)}
                            </dd>
                          </div>
                          <div>
                            <dt>已结束记录</dt>
                            <dd>{row.records} 条</dd>
                          </div>
                          <div>
                            <dt>待补填</dt>
                            <dd>
                              {pendingLink(row)}
                            </dd>
                          </div>
                        </dl>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Table<CategoryTotal>
                    className="dc-report-table"
                    rowKey="category"
                    columns={reportColumns}
                    dataSource={data.categories}
                    pagination={false}
                    scroll={{ x: 680 }}
                  />
                )}
                <p className="dc-report-note">
                  按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。
                </p>
                {data.totals.records === 0 && (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="这个范围还没有已结束记录"
                  />
                )}
              </>
            ) : (
              <Empty
                description="暂无统计结果，请检查连接后重试"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
          <Card
            className="dc-card dc-trend"
            title={
              <Title
                title="工作趋势"
                description={`${data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时`}
              />
            }
            extra={<Tag>时间视角</Tag>}
            styles={{ body: { padding: "12px 8px 8px" } }}
          >
            {data ? (
              <TrendChart trend={data.trend} range={data.range} />
            ) : loading ? (
              <div className="dc-loading">
                <Skeleton active />
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无趋势数据"
              />
            )}
          </Card>
          <Collapse
            className="dc-auxiliary"
            items={[
              {
                key: "analysis",
                label: (
                  <span>
                    辅助分析{" "}
                    <small className="dc-muted">类别分布与工作的节奏</small>
                  </span>
                ),
                children: data ? (
                  <div className="dc-auxiliary-grid">
                    <Card
                      className="dc-category"
                      title={
                        <Title
                          title="工作分布"
                          description="按工作类别回顾投入"
                        />
                      }
                      extra={
                        <Select
                          aria-label="工作分布指标"
                          value={categoryMetric}
                          options={[
                            { value: "duration", label: "工时（小时）" },
                            { value: "quantity", label: "工作量" },
                          ]}
                          onChange={setCategoryMetric}
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CategoryChart
                        categories={data.categories}
                        presentation={presentation}
                        metric={categoryMetric}
                        onCategory={(label) => {
                          const key = CATEGORIES.find(
                            (value) => name(value) === label,
                          );
                          if (key)
                            applyQuery({ ...query, category: key, page: 1 });
                        }}
                      />
                    </Card>
                    <Card
                      className="dc-calendar"
                      title={
                        <Title
                          title="工作的节奏"
                          description="已应用筛选范围 · 最多展示近90天有效工时"
                        />
                      }
                      styles={{ body: { padding: 8 } }}
                    >
                      <CalendarChart
                        calendar={data.calendar}
                        range={data.range}
                      />
                      <div className="dc-heat-legend" aria-label="工时由少到多">
                        少{" "}
                        {[
                          "#ebedf0",
                          "#9be9a8",
                          "#40c463",
                          "#30a14e",
                          "#216e39",
                        ].map((color) => (
                          <i key={color} style={{ background: color }} />
                        ))}{" "}
                        多
                      </div>
                    </Card>
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分析数据"
                  />
                ),
              },
            ]}
          />
          <section
            className="dc-records"
            id="records"
            ref={recordsRef}
            tabIndex={-1}
          >
            <Card
              className="dc-card"
              title={
                <Title
                  title="工作明细"
                  description="查看计时区间、补填工作量，或回顾修正记录。"
                />
              }
              extra={<Tag>{data ? data.record_count : "—"} 条记录</Tag>}
              styles={{ body: { padding: 0 } }}
            >
              {loading ? (
                <div className="dc-loading">
                  <Skeleton active paragraph={{ rows: 5 }} />
                </div>
              ) : (
                <Table<Row>
                  rowKey="id"
                  columns={recordColumns}
                  dataSource={data?.records ?? []}
                  pagination={false}
                  scroll={{ x: 1010 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          error ? "未能读取工作明细" : "当前筛选没有工作记录"
                        }
                      />
                    ),
                  }}
                />
              )}
              <footer className="dc-pagination">
                <span>每页 50 条 · 共 {data?.pages ?? "—"} 页</span>
                <Pagination
                  current={data?.page ?? query.page}
                  total={data?.record_count ?? 0}
                  pageSize={50}
                  showSizeChanger={false}
                  size={narrow ? "small" : undefined}
                  onChange={(page) => applyQuery({ ...query, page })}
                />
              </footer>
            </Card>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      <BottomSheet
        open={sheetOpen}
        blocked={blocked}
        covered={!!confirmation}
        title={
          <div className="dc-sheet-title">
            <span className="dc-eyebrow">
              WORK RECORD {detail ? `#${detail.record.id}` : ""}
            </span>
            <h2>
              {editing ? "填写工作量" : "工作详情"}{" "}
              {detail?.record.is_demo && <Tag color="gold">演示数据</Tag>}
            </h2>
          </div>
        }
        drawerRender={(node) => (
          <div inert={!!confirmation} style={{ display: "contents" }}>
            {node}
          </div>
        )}
        onClose={() => leave(() => setSheetOpen(false))}
        afterOpenChange={(open) => {
          if (open && editing)
            quantityInput.current?.focus({ preventScroll: true });
          if (!open) {
            setDetail(null);
            setEditing(false);
            setEditorError("");
            setPendingQuery(null);
            setPendingDone(false);
            restoreTrigger();
          }
        }}
        footer={
          <div className="dc-sheet-footer">
            <span className={dirty ? "dc-unsaved" : "dc-muted"}>
              {pendingQuery?.category ? `${name(pendingQuery.category)} · ` : ""}
              {dirty ? "有未保存修改" : pendingDone ? "本范围已全部补填" : "数据保存在本机"}
            </span>
            <Space wrap>
              <Button
                disabled={blocked}
                onClick={() => leave(() => setSheetOpen(false))}
              >
                关闭
              </Button>
              {pendingQuery && <Button disabled={blocked || !online || pendingDone} onClick={() => { void nextPending(); }}>
                {editing ? "保存并下一条" : "下一条"}
              </Button>}
              {editing ? (
                <Button
                  key="save"
                  type="primary"
                  form="dc-editor"
                  htmlType="submit"
                  aria-label="保存工作量"
                  aria-busy={busy}
                  loading={busy ? { delay: 120 } : false}
                  disabled={!online || !!confirmation}
                >
                  保存工作量
                </Button>
              ) : (
                <Button
                  key="edit"
                  type="primary"
                  aria-label="编辑工作量"
                  disabled={
                    !online ||
                    blocked ||
                    detailStale ||
                    detail?.record.status !== "FINISHED"
                  }
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </Button>
              )}
            </Space>
          </div>
        }
      >
        {detail && (
          <div className="dc-detail-content">
            <div className="dc-record-summary">
              <WorkBadge
                category={detail.record.category}
                presentation={presentation}
              />
              <div>
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <small>有效工时</small>
              </div>
              <RecordStatus row={detail.record} />
            </div>
            <Descriptions
              className="dc-detail-times"
              size="small"
              column={narrow ? 1 : 2}
              items={[
                {
                  key: "start",
                  label: "开始",
                  children: formatTime(detail.record.start_time),
                },
                {
                  key: "end",
                  label: "结束",
                  children: detail.record.end_time
                    ? formatTime(detail.record.end_time)
                    : "尚未结束",
                },
              ]}
            />
            {editing ? (
              <Form
                id="dc-editor"
                layout="vertical"
                onFinish={() => {
                  void save();
                }}
                disabled={blocked}
              >
                <Form.Item label="工作类别" htmlFor="dc-category">
                  <Select
                    id="dc-category"
                    value={fields.category}
                    options={categoryOptions}
                    onChange={(value) =>
                      setFields((previous) => ({
                        ...previous,
                        category: value,
                      }))
                    }
                    getPopupContainer={(element) => element.parentElement!}
                  />
                </Form.Item>
                <Form.Item
                  label="工作量"
                  htmlFor="dc-quantity"
                  extra="0 表示已确认无产出；支持小数和科学计数，最大 10 亿。"
                >
                  <Input
                    id="dc-quantity"
                    ref={quantityInput}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="填写本次工作量"
                    value={fields.quantity}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <Form.Item label="备注" htmlFor="dc-remark">
                  <Input.TextArea
                    id="dc-remark"
                    maxLength={4000}
                    rows={5}
                    value={fields.remark}
                    onChange={(event) =>
                      setFields((previous) => ({
                        ...previous,
                        remark: event.target.value,
                      }))
                    }
                  />
                </Form.Item>
                <p className="dc-muted">
                  修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                </p>
              </Form>
            ) : (
              <div>
                <div className="dc-detail-quantity">
                  <span>已确认工作量</span>
                  <strong>
                    {detail.record.settlement_status === "COMPLETE"
                      ? formatQuantity(detail.record.quantity)
                      : detail.record.status === "FINISHED"
                        ? "待补填"
                        : "进行中"}
                  </strong>
                </div>
                <div className="dc-detail-remark">
                  {detail.record.remark || "未填写备注。"}
                </div>
              </div>
            )}
            {editorError && (
              <Alert
                type="error"
                showIcon
                title={editorError}
                className="dc-notice"
              />
            )}
            <Collapse
              className="dc-audit"
              items={[
                {
                  key: "segments",
                  label: `计时区间（${detail.segments.length}）`,
                  children: detail.segments.length ? (
                    detail.segments.map((segment) => (
                      <div className="dc-segment" key={segment.id}>
                        <span>
                          {formatTime(segment.start_time)}
                          <br />
                          {segment.end_time
                            ? formatTime(segment.end_time)
                            : "计时中"}
                        </span>
                        <strong className="dc-number">
                          {formatDuration(segment.duration_ms / 1000)}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">
                      旧记录仅保留累计工时，没有可展示的区间。
                    </p>
                  ),
                },
                {
                  key: "revisions",
                  label: `修正记录（${detail.revisions.length}）`,
                  children: detail.revisions.length ? (
                    detail.revisions.map((revision) => (
                      <div className="dc-revision" key={revision.revision}>
                        <strong>
                          第 {revision.revision} 次 ·{" "}
                          {formatTime(revision.changed_at)}
                        </strong>
                        <p>
                          {name(revision.before?.category)} →{" "}
                          {name(revision.after?.category)} · 数量{" "}
                          {formatQuantity(revision.before?.quantity)} →{" "}
                          {formatQuantity(revision.after?.quantity)}
                        </p>
                        <p>
                          备注：{revision.before?.remark || "未填"} →{" "}
                          {revision.after?.remark || "未填"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="dc-muted">尚无修正。</p>
                  ),
                },
              ]}
            />
          </div>
        )}
      </BottomSheet>
      <Modal
        open={confirmOpen}
        centered
        width={460}
        zIndex={1200}
        mask={{ closable: false }}
        keyboard={!busy}
        closable={false}
        destroyOnHidden
        title={
          confirmation === "delete" ? "删除这条记录？" : "保留未保存的修改？"
        }
        onCancel={closeConfirmation}
        afterOpenChange={(open) => {
          if (open) safeConfirmAction.current?.focus({ preventScroll: true });
        }}
        afterClose={() => {
          setConfirmation(null);
          setDeleting(null);
          const action = afterConfirm.current;
          afterConfirm.current = null;
          action?.();
        }}
        footer={
          confirmation === "delete" ? (
            <Space>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                取消
              </Button>
              <Button
                danger
                type="primary"
                aria-label="确认删除"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void remove();
                }}
              >
                确认删除
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button
                type="primary"
                aria-label="保存并继续"
                loading={busy ? { delay: 120 } : false}
                disabled={!online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      afterConfirm.current = next.current;
                      next.current = null;
                      setConfirmOpen(false);
                    }
                  });
                }}
              >
                保存并继续
              </Button>
              <Button
                disabled={busy}
                onClick={() => {
                  setEditing(false);
                  afterConfirm.current = next.current;
                  next.current = null;
                  setConfirmOpen(false);
                }}
              >
                放弃修改
              </Button>
              <Button
                ref={safeConfirmAction}
                disabled={busy}
                onClick={closeConfirmation}
              >
                继续编辑
              </Button>
            </Space>
          )
        }
      >
        {confirmation === "delete" ? (
          <>
            <p className="dc-confirm-description">
              {deleting &&
                `${name(deleting.category)} · ${formatTime(deleting.start_time)}${deleting.is_demo ? " · 演示数据" : ""}`}
            </p>
            <p className="dc-confirm-description">
              删除后不可撤销，计时区间和修正记录也会一同删除。
            </p>
          </>
        ) : (
          <p className="dc-confirm-description">
            保存成功后再离开；保存失败会保留输入。
          </p>
        )}
        {editorError && (
          <Alert
            className="dc-notice"
            type="error"
            title={editorError}
            showIcon
          />
        )}
      </Modal>
    </div>
  );
}
export default function Dashboard() {
  return (
    <UiProvider>
      <DashboardContent />
    </UiProvider>
  );
}
~~~~~~

## E:\WorkMemo\src\ui\BottomSheet.tsx

~~~~~~tsx
import { Drawer, type DrawerProps } from "antd";
import { useMediaQuery } from "./UiProvider";

/** Ant Design owns motion, focus registration and scroll locking. */
export function BottomSheet({
  blocked = false,
  covered = false,
  ...props
}: DrawerProps & { blocked?: boolean; covered?: boolean }) {
  const narrow = useMediaQuery("(max-width: 640px)");
  // Percentages follow the fixed overlay's visible height, including CSS/browser zoom.
  return (
    <Drawer
      {...props}
      placement="bottom"
      size={narrow ? "calc(100% - 24px)" : "min(760px, 88%)"}
      rootClassName="dc-sheet-root"
      className="dc-sheet"
      destroyOnHidden={false}
      push={false}
      mask={{ closable: false }}
      keyboard={!blocked}
      focusable={{ trap: !covered, focusTriggerAfterClose: true }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        // Ant Design 6.6's focus lock handles DOM focus changes, but Edge can move
        // Tab from the final control into browser chrome without a focusin event.
        // Complete that boundary through the official Drawer's keyboard hook.
        if (covered || event.defaultPrevented || event.key !== "Tab") return;
        const controls = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            "button, input, textarea, select, a[href], [tabindex]",
          ),
        ].filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            !element.closest("[inert]") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0],
          last = controls[controls.length - 1];
        const target =
          event.shiftKey && document.activeElement === first
            ? last
            : !event.shiftKey && document.activeElement === last
              ? first
              : null;
        if (target) {
          event.preventDefault();
          target.focus({ preventScroll: true });
        }
      }}
      closable={{
        disabled: blocked,
        placement: "end",
        "aria-label": "关闭工作详情",
      }}
      styles={{
        wrapper: {
          width: narrow ? "calc(100% - 24px)" : "min(760px, calc(100% - 48px))",
          marginInline: "auto",
          marginBlock: "auto",
          insetInline: 0,
          insetBlock: 0,
          borderRadius: 20,
          overflow: "hidden",
        },
        section: {
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 24px 90px #173c2b30",
        },
        header: { padding: "20px 24px", flexShrink: 0 },
        body: {
          padding: "22px 24px",
          overscrollBehavior: "contain",
          overflowY: blocked ? "hidden" : "auto",
        },
        footer: { flexShrink: 0, background: "#fff" },
        mask: {
          background: "rgb(20 38 30 / 30%)",
          backdropFilter: "blur(3px)",
        },
      }}
    />
  );
}
~~~~~~

## E:\WorkMemo\src\useMainContentHeight.ts

~~~~~~typescript
import { useEffect, useState, type RefObject } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";

/** Size the main window to natural content without changing its width or work state. */
export function useMainContentHeight(content: RefObject<HTMLElement | null>, ready: boolean) {
  const [error, setError] = useState("");
  useEffect(() => {
    if (!ready || !isTauri() || !content.current) return;
    const workspace = content.current;
    const frame = workspace.closest<HTMLElement>(".desktop-frame");
    const shell = frame?.querySelector<HTMLElement>(".app-shell");
    const header = frame?.querySelector<HTMLElement>(".titlebar");
    if (!frame || !shell || !header) return;
    let stopped = false, sending = false, scheduled = 0;
    let queued: number | null = null;
    let previous = 0;
    const send = async () => {
      if (sending) return;
      sending = true;
      while (queued !== null && !stopped) {
        const height = queued; queued = null;
        try { await invoke("fit_main_content", { height }); if (!stopped) setError(""); }
        catch (e) { if (!stopped) setError(`窗口高度未能调整：${String(e)}`); }
      }
      sending = false;
    };
    const measure = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(() => {
        const frameStyle = getComputedStyle(frame), shellStyle = getComputedStyle(shell);
        const windowError = frame.querySelector<HTMLElement>(".window-error");
        const errorStyle = windowError && getComputedStyle(windowError);
        const height = Math.ceil(workspace.getBoundingClientRect().height + header.getBoundingClientRect().height
          + parseFloat(frameStyle.paddingTop) + parseFloat(frameStyle.paddingBottom)
          + parseFloat(shellStyle.borderTopWidth) + parseFloat(shellStyle.borderBottomWidth)
          + (windowError ? windowError.getBoundingClientRect().height + parseFloat(errorStyle!.marginTop) + parseFloat(errorStyle!.marginBottom) : 0));
        if (Math.abs(height - previous) < 1) return;
        previous = height; queued = height;
        void send();
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(workspace); observer.observe(header);
    measure();
    return () => { stopped = true; cancelAnimationFrame(scheduled); observer.disconnect(); };
  }, [content, ready]);
  return error;
}
~~~~~~
