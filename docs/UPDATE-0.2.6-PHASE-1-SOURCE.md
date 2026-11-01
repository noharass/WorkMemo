# WorkMemo 0.2.6 第一阶段：完整程序与测试源码

日期：2026-11-01（Asia/Shanghai）。本阶段所有改动程序、样式和测试文件全文如下；未使用省略号替代内容。文档全文分别保存在原文件中，完整路径和状态见 UPDATE-0.2.6-PHASE-1-FILES.md。

## E:\WorkMemo\scripts\verify-v023-phase1.mjs

~~~~~~javascript
// Isolated UI/IPC fixtures. No access to real user records or native input.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {chromium} = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.3/qa/',import.meta.url);
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
try {
  const context = await browser.newContext({viewport:{width:780,height:900}});
  const errors = [];
  context.on('page', page => page.on('pageerror', e => errors.push(e.message)));
  await context.addInitScript(() => {
    window.isTauri=true;
    const categories=['评测','质检','开发','文档'];
    const original={revision:0,names:Object.fromEntries(categories.map(c=>[c,c]))};
    const getNames=()=>JSON.parse(localStorage.getItem('qa-names')??JSON.stringify(original));
    const visuals={version:1,revision:0,background:null,categories:Object.fromEntries(categories.map((key,i)=>[key,{icon:['checkSquare','safety','code','note'][i],color:['#3b82f6','#10b981','#8b5cf6','#f59e0b'][i]}]))};
    window.qaFail=false; window.qaSaves=[]; window.qaCommands=[];
    window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
    let next=1; const callbacks=new Map(); const events=new Map();
    window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'settings'},currentWebview:{label:'settings'}},
      transformCallback(callback){const id=next++;callbacks.set(id,callback);return id;},unregisterCallback(id){callbacks.delete(id);},
      invoke:async(command,args)=>{
        window.qaCommands.push(command);
        if(command==='plugin:event|listen'){events.set(next,{name:args.event,callback:args.handler});return next++;}
        if(command==='plugin:event|unlisten'){events.delete(args.eventId);return;}
        if(command==='get_category_names') return getNames();
        if(command==='save_category_names'){
          window.qaSaves.push(structuredClone(args.input));
          if(window.qaFail) throw new Error('名称保存失败测试');
          const current=getNames();
          if(args.input.revision!==current.revision) throw new Error('工作名称已被其他窗口修改，请重新读取后保存。');
          const saved={revision:current.revision+1,names:Object.fromEntries(Object.entries(args.input.names).map(([k,v])=>[k,v.trim()]))};
          localStorage.setItem('qa-names',JSON.stringify(saved));
          for(const [id,event] of events)if(event.name==='workmemo:categories-changed') callbacks.get(event.callback)?.({event:event.name,id,payload:null});
          return saved;
        }
        if(command==='get_presentation') return visuals;
        if(command==='get_appearance') return {version:1,theme:'cream',opacity:94};
        if(command==='get_layout_settings') return {density:'comfortable',revision:0,sound_enabled:true,font_size:14,font_weight:400,line_spacing:'standard'};
        if(command==='get_monitor_config') return {enabled:false,revision:0,times:{idle_pause_seconds:120,idle_warning_seconds:300,idle_end_seconds:420,away_pause_seconds:120,hold_seconds:600},poll_interval_seconds:1,auto_resume_manual:true,rules:[{id:1,category:'开发',url_prefix:'https://example.test/',match_mode:'origin'}]};
        if(command==='get_connection_status') return {state:'ready',message:'隔离验收夹具',identifier:'fixture',version:'0.2.2'};
        if(command==='app_info') return {name:'WorkMemo',version:'0.2.2'};
        if(command==='get_notice') return null;
        if(command==='get_pending_records')return [{id:1,category:'开发',quantity:null,remark:'隔离夹具',start_time:Date.now()-10000,end_time:Date.now(),duration_ms:10000,duration_seconds:10,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'PENDING',source:'MANUAL_START',pause_reason:null,confirmed_end_time:Date.now(),last_input_time:null,end_reason:'MANUAL',legacy_duration_ms:0,revision:0,control_mode:'MANUAL'}];
        if(command==='get_snapshot')return {active:null,recent_records:[],warning:null,pending_count:1,monitoring:{enabled:false,native_available:true,idle_warning:false,revision:0,away_pause_remaining_seconds:null,message:'隔离夹具'}};
        if(command==='get_today_workload')return [];
        return null;
      }};
    window.addEventListener('storage',event=>{
      if(event.key==='qa-names')for(const [id,e] of events)if(e.name==='workmemo:categories-changed')callbacks.get(e.callback)?.({event:e.name,id,payload:null});
    });
  });
  const settings=await context.newPage();
  await settings.goto('http://127.0.0.1:1420/?panel=settings&section=visuals');
  const editor=settings.locator('.category-names-editor');
  const input=editor.getByLabel('类型 3（原名：开发）');
  await input.waitFor();
  await input.fill('编程任务');
  await settings.evaluate(()=>window.qaFail=true);
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await editor.getByRole('alert').filter({hasText:'名称保存失败测试'}).waitFor();
  assert.equal(await input.inputValue(),'编程任务');
  await settings.evaluate(()=>window.qaFail=false);
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await editor.getByRole('status').filter({hasText:'工作名称已保存'}).waitFor();
  await settings.locator('legend .work-badge').filter({hasText:'编程任务'}).waitFor();
  assert.equal((await settings.evaluate(()=>JSON.parse(localStorage.getItem('qa-names')))).names['开发'],'编程任务');

  const second=await context.newPage();
  await second.goto('http://127.0.0.1:1420/?panel=settings&section=visuals');
  const secondInput=second.locator('.category-names-editor').getByLabel('类型 3（原名：开发）');
  await secondInput.fill('第二窗口草稿');
  await input.fill('第一窗口更新');
  await editor.getByRole('button',{name:'保存工作名称',exact:true}).click();
  await settings.waitForFunction(()=>JSON.parse(localStorage.getItem('qa-names')).revision===2);
  await second.waitForTimeout(100);
  assert.equal(await secondInput.inputValue(),'第二窗口草稿');
  await second.locator('.category-names-editor').getByRole('button',{name:'保存工作名称',exact:true}).click();
  await second.getByRole('alert').filter({hasText:'已被其他窗口修改'}).waitFor();
  assert.equal(await secondInput.inputValue(),'第二窗口草稿');
  await second.locator('.category-names-editor').getByRole('button',{name:'重新读取并放弃名称修改'}).click();
  await second.waitForFunction(()=>Array.from(document.querySelectorAll('.category-names-editor input')).some(input=>input.value==='第一窗口更新'));
  assert.equal(await secondInput.inputValue(),'第一窗口更新');
  await second.close();
  await settings.screenshot({path:new URL('phase1-category-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});

  const main=await context.newPage();
  await main.goto('http://127.0.0.1:1420/');
  await main.getByRole('button',{name:'新建任务',exact:true}).click();
  await main.getByRole('option',{name:'第一窗口更新',exact:true}).waitFor({state:'attached'});
  assert.equal(await main.getByRole('option',{name:'第一窗口更新',exact:true}).getAttribute('value'),'开发');
  await settings.getByRole('button',{name:'监测',exact:true}).click();
  const workgroup=settings.locator('.monitor-work-group[aria-label="第一窗口更新工作网址"]');
  await workgroup.getByText('1 个 URL',{exact:true}).waitFor();
  assert.equal(await workgroup.getByLabel('归属工作').inputValue(),'开发');
  await settings.getByLabel('键鼠无操作后暂停',{exact:true}).waitFor();
  assert.equal(await settings.getByLabel('键鼠无操作后暂停',{exact:true}).inputValue(),'120');
  for(const width of [390,780]){
    await settings.setViewportSize({width,height:900});
    assert.equal(await settings.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`settings overflow ${width}`);
  }
  await settings.screenshot({path:new URL('phase1-monitor-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
  const dashboard=await context.newPage();
  const dashboardRecord={id:1,category:'开发',quantity:0,remark:'isolated rename fixture',start_time:Date.now()-10000,end_time:Date.now(),duration_ms:10000,duration_seconds:10,status:'FINISHED',is_paused:true,recovery_pending:false,settlement_status:'COMPLETE',source:'MANUAL_START',pause_reason:null,confirmed_end_time:Date.now(),last_input_time:null,end_reason:'MANUAL',legacy_duration_ms:0,revision:0,control_mode:'MANUAL'};
  const queries=[];
  const dashboardNames=await settings.evaluate(()=>JSON.parse(localStorage.getItem('qa-names')));
  await dashboard.route('**/api/**',async route=>{
    const endpoint=new URL(route.request().url()).pathname.split('/').at(-1);
    if(endpoint==='meta')return route.fulfill({json:{version:'0.2.2',active:null,category_names:dashboardNames}});
    if(endpoint==='detail')return route.fulfill({json:{record:dashboardRecord,segments:[],revisions:[]}});
    if(endpoint==='query'){
      queries.push(JSON.parse(route.request().postData()));
      return route.fulfill({json:{range:{period:'day',anchor_date:'2026-10-29',start_date:'2026-10-29',end_date:'2026-10-29',trend_unit:'hour'},record_count:1,totals:{duration_ms:10000,quantity:0,records:1,pending:0},trend:[],monthly:false,categories:[{category:'开发',duration_ms:10000,quantity:0,records:1,complete:1,pending:0}],calendar:[],records:[dashboardRecord],page:1,pages:1,scope:'real'}});
    }
    return route.fulfill({json:{saved:true}});
  });
  await dashboard.goto('http://127.0.0.1:1420/dashboard#token=isolated-rename-fixture');
  await dashboard.locator('td .work-badge').filter({hasText:'第一窗口更新'}).first().waitFor();
  await dashboard.getByRole('combobox',{name:'筛选工作类别',exact:true}).click();
  await dashboard.locator('.wm-select-dropdown:visible').getByText('第一窗口更新',{exact:true}).last().click();
  await dashboard.getByRole('button',{name:'应用筛选'}).click();
  await dashboard.waitForTimeout(100);
  assert.equal(queries.at(-1).category,'开发');
  await dashboard.getByRole('button',{name:'详情',exact:true}).click();
  await dashboard.locator('.dc-record-summary .work-badge').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.getByRole('button',{name:'编辑工作量',exact:true}).click();
  await dashboard.locator('#dc-editor .wm-select-content').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.getByRole('combobox',{name:'工作类别',exact:true}).click();
  await dashboard.locator('.wm-select-dropdown:visible').getByText('第一窗口更新',{exact:true}).last().waitFor();
  await dashboard.keyboard.press('Escape');
  assert.deepEqual(errors,[]);
  await writeFile(new URL('phase1-ui-result.json',output),JSON.stringify({renameSave:true,failedSavePreservesInput:true,multiWindowConflict:true,explicitReload:true,stableSelectIdentity:true,monitorGroupName:true,idlePauseSetting:true,dashboardNameAndStableFilter:true,widths:[390,780],pageErrors:errors},null,2));
  console.log('v0.2.3 phase 1 UI regressions passed; isolated IPC fixtures only.');
} finally {await browser.close();}
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
  window.qa = {calls:[],template:record,active:p.get('state')==='empty'?null:record,notice:p.get('ended')?{kind:'ended',record:ended}:null,fail:'',browse:false,ready:true,stats:p.get('stats')==='empty'?[]:category.map((c,i)=>({category:c,quantity:i*11,pending:i===2?2:0,complete:1,records:1})),startup:{enabled:true,available:true,error:null}};
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
  if(!params.notice&&!params.panel)await page.locator('.timer-card,.new-task-page,.monitor-status-card').waitFor();
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
    assert.equal(call.args.expectedActiveId,7);assert.equal(call.args.input.quantity,0); // Cancel/reopen retains the draft.
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
    await load({notice:'1',ended:'1',state:'empty'},320,420);
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
    await load({notice:'1',ended:'1',state:'empty'},320,420);
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
    await page.evaluate(()=>{window.qa.notice.record.revision=1;window.qa.active={...window.qa.template,id:99,category:'开发'};});
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
    await load({notice:'1',ended:'1',state:'empty'},320,420);
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
    await page.getByRole('button',{name:'新建任务',exact:true}).click();
    await page.waitForFunction(()=>window.qa.calls.some(c=>c.command==='fit_main_content'));
    const fit=()=>page.evaluate(()=>window.qa.calls.filter(c=>c.command==='fit_main_content').at(-1).args.height);
    const formHeight=await fit();
    assert.ok(formHeight>=280&&formHeight<540,`form height ${formHeight}`); // Explicit manual page includes a return action.
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

## E:\WorkMemo\scripts\verify-v026.mjs

~~~~~~javascript
// Browser-only IPC fixtures. No real backend, database, registration or work task is used.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL, fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.6/qa/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 780, height: 680 } });
const errors = [], results = [];
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => {
  const params = new URLSearchParams(location.search), categories = ['评测', '质检', '开发', '文档'];
  const record = { id: 7, category: '开发', quantity: null, remark: '隔离任务', start_time: Date.now() - 60000, end_time: null, confirmed_end_time: null, duration_ms: 60000, duration_seconds: 60, status: 'WORKING', is_paused: params.get('state') === 'paused', recovery_pending: false, settlement_status: 'IN_PROGRESS', source: 'AUTO', control_mode: 'AUTO', revision: 1 };
  const ended = { ...record, id: 6, category: '文档', status: 'FINISHED', is_paused: true, settlement_status: 'PENDING', end_time: Date.now(), confirmed_end_time: Date.now() };
  const config = { enabled: true, revision: 3, times: { idle_pause_seconds: 120, away_pause_seconds: 120, hold_seconds: 600, idle_warning_seconds: 300, idle_end_seconds: 420 }, poll_interval_seconds: 1, auto_resume_manual: true, rules: [{ id: 1, category: '开发', match_mode: 'origin', url_prefix: 'https://work.example.test/' }] };
  const callbacks = new Map(), listeners = new Map(); let sequence = 0;
  const emit = (event, payload) => { for (const [id, entry] of listeners) if (entry.event === event) callbacks.get(entry.handler)?.({ event, id, payload }); };
  window.qa = { calls: [], active: params.get('state') === 'empty' ? null : record, candidate: params.has('candidate') ? { id: 21, rule_id: 1, category: '开发' } : null, notice: params.has('ended') ? { kind: 'ended', record: ended, idle_warning_seconds: 300, idle_end_seconds: 420 } : null, config, browse: false, fail: '', delay: 0, readsDelay: 100, emit, record };
  window.isTauri = true;
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener: id => listeners.delete(id) };
  window.__TAURI_INTERNALS__ = {
    metadata: { currentWindow: { label: params.has('notice') ? 'notice' : params.has('panel') ? 'settings' : 'main' }, currentWebview: { label: 'fixture' } },
    transformCallback(fn) { const id = ++sequence; callbacks.set(id, fn); return id; }, unregisterCallback(id) { callbacks.delete(id); },
    convertFileSrc() { return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700"><path fill="#8fa9bb" d="M0 0h800v700H0z"/><path fill="#b9ad96" d="m0 0 800 700H0z"/></svg>'); },
    async invoke(command, args = {}) {
      const q = window.qa; q.calls.push({ command, args });
      const snapshot = () => structuredClone({ active: q.active, recent_records: q.notice ? [q.notice.record] : [], pending_count: q.notice ? 1 : 0, warning: null, monitoring: { browsing_only: q.browse, browse_ready: true, browse_category: '开发', enabled: true, native_available: true, browser_connected: true, work_page: true, message: '已识别工作页面，等待新的鼠标或键盘活动', idle_warning: false, idle_warning_seconds: 300, idle_end_seconds: 420, start_candidate: q.candidate } });
      if (command.startsWith('plugin:event|')) {
        if (command.endsWith('|listen')) { const id = ++sequence; listeners.set(id, args); return id; }
        if (command.endsWith('|unlisten')) listeners.delete(args.eventId);
        if (command.endsWith('|emit')) emit(args.event, args.payload);
        return null;
      }
      if (command === q.fail) { await new Promise(r => setTimeout(r, q.delay || 120)); throw Error('隔离保存失败，请重试'); }
      if (command === 'get_snapshot') return snapshot();
      if (command === 'get_notice') return structuredClone(q.notice);
      if (command === 'get_appearance') return { version: 1, theme: params.get('theme') || 'cream', opacity: 88 };
      if (command === 'get_category_names') return { revision: 0, names: Object.fromEntries(categories.map(c => [c, c])) };
      if (command === 'get_layout_settings') return { density: params.get('density') || 'comfortable', revision: 0, sound_enabled: false, sound_theme: 'soft', font_size: params.has('large') ? 18 : 14, font_weight: 400, line_spacing: 'standard' };
      if (command === 'get_presentation') return { version: 1, revision: 0, background: params.has('background') ? { file: 'isolated-background.svg', opacity: 50 } : null, categories: Object.fromEntries(categories.map((c, i) => [c, { icon: ['checkSquare', 'safety', 'code', 'note'][i], color: '#447cba' }])) };
      if (command === 'get_monitor_config') { const value = structuredClone(q.config); await new Promise(r => setTimeout(r, q.readsDelay)); return value; }
      if (command === 'get_connection_status') return { state: 'ready', message: '隔离连接', version: 'fixture', identifier: 'fixture', host_name: 'fixture' };
      if (command === 'save_monitor_config') { await new Promise(r => setTimeout(r, q.delay)); q.config = { ...args.input, revision: q.config.revision + 1, rules: args.input.rules.map((r, i) => ({ ...r, id: i + 1 })) }; return structuredClone(q.config); }
      if (command === 'get_today_workload') return [];
      if (command === 'detect_preview_data') return false;
      if (command === 'get_startup_status') return { enabled: false, available: true, error: null };
      if (command === 'pause_task') { q.active = { ...q.active, is_paused: true, pause_reason: 'MANUAL' }; return snapshot(); }
      if (command === 'resume_task') { q.active = { ...q.active, is_paused: false, pause_reason: null }; return snapshot(); }
      if (command === 'finish_task') { q.notice = { kind: 'ended', record: { ...q.active, status: 'FINISHED', end_time: Date.now(), settlement_status: 'PENDING' } }; q.active = null; return snapshot(); }
      if (command === 'confirm_work') {
        await new Promise(r => setTimeout(r, q.delay));
        if (q.active || !q.candidate || q.candidate.id !== args.candidateId) throw Error('开工提示已失效');
        q.active = { ...record, id: 8, category: q.candidate.category, duration_ms: 0, duration_seconds: 0, is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'enter_browsing') { q.browse = true; q.candidate = null; return snapshot(); }
      if (command === 'start_task') {
        if ((q.active?.id ?? null) !== args.expectedActiveId || (q.active && !q.active.is_paused)) throw Error('当前任务已变化，请刷新后重新确认');
        q.active = { ...record, ...args.input, id: 9, control_mode: 'MANUAL', is_paused: false }; q.candidate = null; return snapshot();
      }
      if (command === 'settle_record') { await new Promise(r => setTimeout(r, q.delay)); if (q.notice?.record.id !== args.input.id || q.notice.record.revision !== args.input.expected_revision) throw Error('记录已变化'); q.notice = null; return snapshot(); }
      if (command === 'defer_notice') { if (q.notice?.record.id === args.id) q.notice = null; return null; }
      if (command === 'get_island_viewport') return innerHeight;
      return null;
    },
  };
});
const base = process.env.WORKMEMO_UI_URL || 'http://127.0.0.1:1420/';
async function load(params = {}, width = 780, height = 680) {
  await page.setViewportSize({ width, height });
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.locator('.desktop-frame').waitFor();
  await page.waitForTimeout(220);
}
async function test(name, fn) {
  const filter = process.argv.find(arg => arg.startsWith('--filter='))?.slice(9);
  if (filter && !name.includes(filter)) return;
  await fn(); results.push(name);
}
async function screenshot(name) { await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, output)) }); }
try {
  if (process.argv.includes('--baseline')) {
    await load({ panel: 'settings', section: 'monitor', background: '1' });
    await page.getByLabel('工作 URL', { exact: true }).fill('https://changed.example.test/');
    await page.evaluate(() => {
      window.qa.removedForms = 0;
      const form = document.querySelector('#monitor-form');
      new MutationObserver(() => { if (!form.isConnected) window.qa.removedForms++; }).observe(document.querySelector('.panel-app'), { childList: true, subtree: true });
    });
    await page.getByRole('button', { name: '保存监测配置', exact: true }).click();
    await page.waitForTimeout(500);
    const metrics = await page.evaluate(() => ({ reads: window.qa.calls.filter(c => c.command === 'get_monitor_config').length, writes: window.qa.calls.filter(c => c.command === 'save_monitor_config').length, detachedObservations: window.qa.removedForms }));
    await load({ state: 'empty', notice: '1', ended: '1', candidate: '1' });
    metrics.visibleCandidate = await page.getByRole('region', { name: '开工确认' }).isVisible();
    metrics.endedShown = await page.getByRole('region', { name: '工作结束提醒' }).isVisible();
    await screenshot('baseline-island-priority');
    await writeFile(new URL('baseline.json', output), JSON.stringify(metrics, null, 2));
    console.log(JSON.stringify(metrics));
  } else {
    await test('idle monitoring, explicit new form, retained draft and authoritative cross-window guard', async () => {
      await load({ state: 'empty' });
      await page.getByRole('region', { name: '监测状态' }).waitFor();
      assert.equal(await page.locator('.work-form').count(), 0);
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('文档');
      await page.getByLabel('工作量（可稍后填写）').fill('0');
      await page.getByLabel('备注（选填）').fill('手动草稿');
      await page.evaluate(() => { window.qa.candidate = { id: 21, rule_id: 1, category: '开发' }; });
      await page.getByText(/已识别开发工作页面；也可在灵动岛确认开始/).waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '手动草稿');
      await page.evaluate(() => window.qa.fail = 'start_task');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).waitFor();
      assert.equal(await page.getByLabel('工作量（可稍后填写）').inputValue(), '0');
      await page.getByRole('button', { name: '返回监测状态', exact: true }).click();
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '手动草稿');
      await page.evaluate(() => { window.qa.fail = ''; window.qa.active = { ...window.qa.record, id: 99 }; window.qa.candidate = null; });
      await page.getByText(/已有任务从其他入口开始/).waitFor();
      assert.equal(await page.getByRole('button', { name: '开始工作', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: '返回监测状态', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      await screenshot('main-current-task');
    });
    await test('manual begin, finish returns to monitoring, pause and atomic switch', async () => {
      await load({ state: 'empty' });
      await page.getByRole('button', { name: '新建任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('文档');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      assert.equal(await page.getByRole('button', { name: '切换任务', exact: true }).isDisabled(), true);
      await page.getByRole('button', { name: '暂停', exact: true }).click();
      await page.getByRole('button', { name: '切换任务', exact: true }).click();
      await page.getByLabel('工作类别', { exact: true }).selectOption('评测');
      await page.getByRole('button', { name: '开始工作', exact: true }).click();
      await page.getByRole('button', { name: '保存并开始', exact: true }).click();
      await page.getByRole('region', { name: '当前工作' }).waitFor();
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'start_task').at(-1).args.expectedActiveId), 9);
      await page.getByRole('button', { name: '结束', exact: true }).click();
      await page.getByRole('region', { name: '监测状态' }).waitFor();
      assert.equal(await page.locator('.work-form').count(), 0);
      await screenshot('main-monitoring');
    });
    await test('next candidate supersedes old reminder, double confirmation creates once and old pending stays accessible', async () => {
      await load({ state: 'empty', notice: '1', ended: '1', candidate: '1' }, 320, 420);
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      assert.equal(await page.getByRole('region', { name: '工作结束提醒' }).count(), 0);
      assert.equal(await page.getByRole('button', { name: '待补全 1', exact: true }).isVisible(), true);
      await screenshot('island-next-candidate');
      await page.evaluate(() => window.qa.delay = 250);
      await page.getByRole('button', { name: '开始记录', exact: true }).evaluate(el => { el.click(); el.click(); });
      await page.waitForFunction(() => window.qa.active?.id === 8);
      await page.waitForTimeout(400);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'confirm_work').length), 1);
      assert.equal(await page.evaluate(() => window.qa.notice.record.id), 6);
      assert.equal(await page.locator('.island-main-row').getByText('开发', { exact: true }).isVisible(), true);
      await page.getByRole('button', { name: '展开工作提醒', exact: true }).click();
      await page.getByRole('button', { name: '待补全 1', exact: true }).waitFor();
      assert.equal(await page.getByRole('region', { name: '工作结束提醒' }).count(), 0);
    });
    await test('settlement draft survives next candidate and new active work, failed save preserves original record', async () => {
      await load({ state: 'empty', notice: '1', ended: '1' }, 320, 420);
      await page.getByRole('button', { name: '填写工作量', exact: true }).click();
      await page.getByLabel('工作量（必填）', { exact: true }).fill('12');
      await page.getByLabel('备注（选填）').fill('旧任务结算草稿');
      await page.evaluate(() => { window.qa.candidate = { id: 21, rule_id: 1, category: '开发' }; });
      await page.getByRole('button', { name: '开始识别的工作', exact: true }).waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '旧任务结算草稿');
      await page.getByRole('button', { name: '开始识别的工作', exact: true }).click();
      await page.waitForFunction(() => window.qa.active?.id === 8);
      assert.equal(await page.getByLabel('工作量（必填）', { exact: true }).inputValue(), '12');
      await page.evaluate(() => window.qa.fail = 'settle_record');
      await page.getByRole('button', { name: '填写工作量并保存', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '隔离保存失败' }).first().waitFor();
      assert.equal(await page.getByLabel('备注（选填）').inputValue(), '旧任务结算草稿');
      await screenshot('island-pinned-settlement');
      await page.evaluate(() => window.qa.fail = '');
      await page.getByRole('button', { name: '填写工作量并保存', exact: true }).click();
      await page.waitForFunction(() => window.qa.notice === null);
      const input = await page.evaluate(() => window.qa.calls.filter(c => c.command === 'settle_record').at(-1).args.input);
      assert.equal(input.id, 6); assert.equal(input.quantity, 12);
      assert.equal(await page.evaluate(() => window.qa.active.id), 8);
    });
    await test('stale candidate fails visibly, browsing creates no work', async () => {
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('button', { name: '开始记录', exact: true }).waitFor();
      await page.evaluate(() => window.qa.candidate = null);
      await page.getByRole('button', { name: '开始记录', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: '开工提示已失效' }).waitFor();
      assert.equal(await page.evaluate(() => window.qa.active), null);
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('button', { name: '仅浏览', exact: true }).click();
      await page.waitForFunction(() => window.qa.browse);
      assert.equal(await page.evaluate(() => window.qa.active), null);
      assert.equal(await page.evaluate(() => window.qa.calls.some(c => c.command === 'confirm_work')), false);
    });
    await test('direct settings save keeps form, scroll, background and focus; external refresh preserves new edits', async () => {
      await load({ panel: 'settings', section: 'monitor', background: '1' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://changed.example.test/');
      await page.evaluate(() => {
        window.qa.form = document.querySelector('#monitor-form'); window.qa.background = document.querySelector('.window-background');
        window.qa.initialReads = window.qa.calls.filter(c => c.command === 'get_monitor_config').length;
        window.qa.delay = 180;
        window.qa.focusStart = document.activeElement?.outerHTML;
        window.qa.focusEvents = [];
        for (const event of ['focusin', 'focusout']) document.addEventListener(event, e => window.qa.focusEvents.push({ event, element: e.target.outerHTML?.slice(0, 200) }));
        document.querySelector('.panel-scroll').scrollTop = 260;
      });
      await page.keyboard.press('Control+s');
      await page.locator('#monitor-form').evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
      await page.getByText('配置已保存。请在 Chrome 扩展中同步工作站点授权。', { exact: true }).waitFor();
      await page.waitForFunction(() => document.activeElement?.getAttribute('type') === 'url');
      const metrics = await page.evaluate(() => ({ sameForm: window.qa.form === document.querySelector('#monitor-form'), sameBackground: window.qa.background === document.querySelector('.window-background'), reads: window.qa.calls.filter(c => c.command === 'get_monitor_config').length, initialReads: window.qa.initialReads, writes: window.qa.calls.filter(c => c.command === 'save_monitor_config').length, focus: document.activeElement?.getAttribute('type') }));
      assert.equal(metrics.sameForm, true); assert.equal(metrics.sameBackground, true); assert.equal(metrics.reads, metrics.initialReads); assert.equal(metrics.writes, 1); assert.equal(metrics.focus, 'url');
      await page.keyboard.press('Control+s');
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'save_monitor_config').length), 1);
      await writeFile(new URL('settings-after.json', output), JSON.stringify(metrics, null, 2));
      await page.evaluate(() => { window.qa.readsDelay = 500; window.qa.emit('workmemo:data-changed', null); });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://draft-during-refresh.example.test/');
      await page.waitForTimeout(650);
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://draft-during-refresh.example.test/');
      assert.equal(await page.evaluate(() => window.qa.form === document.querySelector('#monitor-form')), true);
      await page.evaluate(() => window.qa.emit('workmemo:data-changed', null));
      await page.waitForTimeout(650);
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://draft-during-refresh.example.test/');
    });
    await test('slow modal save submits once, holds dialog stable, blocks Escape/close and navigates once', async () => {
      await load({ panel: 'settings', section: 'monitor', background: '1' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://slow.example.test/');
      await page.getByRole('button', { name: '布局', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: '保留未保存的修改？' });
      await dialog.waitFor();
      await page.evaluate(() => {
        window.qa.delay = 650; window.qa.dialog = document.querySelector('dialog[open]'); window.qa.form = document.querySelector('#monitor-form'); window.qa.box = window.qa.dialog.getBoundingClientRect().toJSON();
        window.qa.frames = [];
        const sample = () => {
          if (window.qa.config.revision !== 3) return;
          const dialog = document.querySelector('dialog[open]'); const box = dialog?.getBoundingClientRect();
          window.qa.frames.push({ open: !!dialog, formConnected: window.qa.form.isConnected, x: box?.x, y: box?.y, width: box?.width, height: box?.height });
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });
      await dialog.getByRole('button', { name: '保存并继续', exact: true }).evaluate(el => { el.click(); el.click(); });
      await page.keyboard.press('Control+s');
      await page.keyboard.press('Escape');
      await page.evaluate(() => window.qa.emit('workmemo:request-close', null));
      assert.equal(await dialog.isVisible(), true);
      assert.equal(await dialog.getByRole('button', { name: '关闭保留未保存的修改？', exact: true }).isDisabled(), true);
      const stable = await page.evaluate(() => { const box = window.qa.dialog.getBoundingClientRect(); return window.qa.dialog === document.querySelector('dialog[open]') && window.qa.form === document.querySelector('#monitor-form') && box.width === window.qa.box.width && box.x === window.qa.box.x; });
      assert.equal(stable, true);
      await screenshot('settings-saving-dialog');
      await page.waitForFunction(() => document.querySelector('.settings-tabs button[aria-pressed=true]')?.textContent === '布局');
      assert.equal(await dialog.isVisible(), false);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'save_monitor_config').length), 1);
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'close_panel').length), 0);
      const frames = await page.evaluate(() => window.qa.frames);
      assert.ok(frames.length > 8);
      assert.ok(frames.every(f => f.open && f.formConnected));
      assert.equal(new Set(frames.map(f => JSON.stringify([f.x, f.y, f.width, f.height]))).size, 1);
      await writeFile(new URL('settings-modal-frames.json', output), JSON.stringify(frames, null, 2));
    });
    await test('failed modal save, continue editing, discard and native close preserve correct data', async () => {
      await load({ panel: 'settings', section: 'monitor' });
      await page.getByLabel('工作 URL', { exact: true }).fill('https://failure.example.test/');
      await page.getByRole('button', { name: '布局', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: '保留未保存的修改？' });
      await page.evaluate(() => window.qa.fail = 'save_monitor_config');
      await dialog.getByRole('button', { name: '保存并继续', exact: true }).click();
      await dialog.getByRole('alert').waitFor();
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://failure.example.test/');
      await dialog.getByRole('button', { name: '继续编辑', exact: true }).click();
      await page.evaluate(() => { window.qa.fail = ''; window.qa.emit('workmemo:request-close', null); });
      await dialog.waitFor();
      await dialog.getByRole('button', { name: '放弃修改', exact: true }).click();
      assert.equal(await page.getByLabel('工作 URL', { exact: true }).inputValue(), 'https://work.example.test/');
      assert.equal(await page.evaluate(() => window.qa.calls.filter(c => c.command === 'close_panel').length), 1);
      assert.equal(await page.evaluate(() => window.qa.config.revision), 3);
    });
    await test('four skins, compact/comfortable main and island layouts, reduced motion and narrow widths', async () => {
      for (const theme of ['glass', 'cream', 'dark', 'neon']) for (const density of ['compact', 'comfortable']) {
        await load({ state: 'empty', theme, density, large: '1' }, 360, 560);
        await page.getByRole('region', { name: '监测状态' }).waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await screenshot(`main-idle-${theme}-${density}`);
        await load({ state: 'empty', notice: '1', ended: '1', candidate: '1', theme, density }, 320, 420);
        await page.getByRole('region', { name: '开工确认' }).waitFor();
        const row = await page.locator('.island-main-row').evaluate(el => ({ width: el.clientWidth, overflow: el.scrollWidth, boxes: [...el.children].map(n => { const r = n.getBoundingClientRect(); return { left: r.left, right: r.right }; }) }));
        assert.ok(row.overflow <= row.width + 1, JSON.stringify(row));
        assert.ok(row.boxes.every((b, i, all) => !i || b.left >= all[i - 1].right - 1), JSON.stringify(row));
        await screenshot(`island-candidate-${theme}-${density}`);
      }
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await load({ state: 'empty', notice: '1', candidate: '1' }, 320, 420);
      await page.getByRole('region', { name: '开工确认' }).waitFor();
      assert.equal(await page.locator('.island-expansion').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    });
    assert.deepEqual(errors, []);
    await writeFile(new URL('v026-result.json', output), JSON.stringify({ results, errors }, null, 2));
    console.log(`${results.length} v0.2.6 isolated UI scenarios passed.`);
  }
} catch (error) {
  await screenshot('v026-failure');
  await writeFile(new URL('v026-failure.json', output), JSON.stringify({ results, errors, message: String(error), html: await page.content(), detail: await page.evaluate(() => ({ focused: document.activeElement?.outerHTML?.slice(0, 500), start: window.qa.focusStart, focusEvents: window.qa.focusEvents, calls: window.qa.calls })) }, null, 2));
  throw error;
} finally { await browser.close(); }
~~~~~~

## E:\WorkMemo\src-tauri\src\service.rs

~~~~~~rust
use crate::{
    browser_bridge,
    monitor::{ConfigInput, MonitorConfig, NativeSample},
    native_activity,
};
use crate::{
    clock::{Clock, SystemClock},
    database::{
        HistoryPage, HistoryQuery, Notice, Result, SettleInput, Snapshot, StartInput, Store,
        WorkRecord,
    },
};
use std::{
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, Ordering},
    },
    time::Duration,
};
use tauri::{Emitter, Manager, State};

pub(crate) type SharedStore = Arc<Mutex<Result<Store>>>;

// Use the same priority as the island frontend; old settlements stay persisted.
fn island_presentation_key(
    active: Option<i64>,
    candidate: Option<u64>,
    notice: Option<(&str, i64)>,
    enabled: bool,
    browsing: bool,
) -> Option<String> {
    if let Some(id) = active {
        if notice == Some(("idle", id)) {
            return Some(format!("idle:{id}"));
        }
        return enabled.then(|| format!("active:{id}"));
    }
    if let Some(id) = candidate {
        return Some(format!("candidate:{id}"));
    }
    notice
        .map(|(kind, id)| format!("{kind}:{id}"))
        .or_else(|| (enabled && browsing).then(|| "browsing".into()))
}

pub struct Backend {
    pub(crate) inner: SharedStore,
    pub tray_ready: AtomicBool,
    pub exiting: AtomicBool,
}

impl Backend {
    pub fn initialize(app: &tauri::App) -> Self {
        let directory = app.path().app_local_data_dir();
        let opened = app
            .path()
            .app_local_data_dir()
            .map_err(|e| format!("无法定位本地数据目录：{e}"))
            .and_then(|directory| {
                Store::open(
                    &directory.join("workmemo.sqlite3"),
                    Box::new(SystemClock::new()),
                )
            });
        let inner = Arc::new(Mutex::new(opened));
        if let Ok(mut guard) = inner.lock() {
            if let Ok(store) = guard.as_mut() {
                if let Ok(dir) = app.path().app_config_dir() {
                    if let Err(e) = crate::database::data_tools::recover_pending(store, &dir) {
                        *guard = Err(e);
                    }
                }
                if let Ok(store) = guard.as_mut() {
                    store.sound_config = app
                        .path()
                        .app_config_dir()
                        .ok()
                        .map(|p| p.join("window-layout.json"));
                    store.activate_monitoring();
                }
            }
        }
        if let Ok(directory) = directory {
            let ready = inner.lock().ok().is_some_and(|g| g.is_ok());
            if ready {
                if let Err(error) = browser_bridge::start(inner.clone(), &directory) {
                    if let Ok(mut guard) = inner.lock() {
                        if let Ok(store) = guard.as_mut() {
                            store.warning = Some(error);
                        }
                    }
                } else {
                    let handle = app.handle().clone();
                    std::thread::spawn(move || {
                        let _ = handle
                            .state::<crate::connection::ConnectionState>()
                            .refresh(true);
                    });
                }
            }
        }
        let weak = Arc::downgrade(&inner);
        let app_handle = app.handle().clone();
        let signals = native_activity::listen();
        std::thread::spawn(move || {
            let mut presented = None;
            let mut last_pending = None;
            let mut listener_ok = true;
            let mut reported_error: Option<String> = None;
            loop {
                std::thread::sleep(Duration::from_secs(1));
                let Some(shared) = weak.upgrade() else {
                    break;
                };
                let mut notice = None;
                let mut active_id = None;
                let mut candidate_id = None;
                let mut browsing = false;
                let mut runtime_failure: Option<String> = None;
                // Sample after the preceding loop has finished creating and positioning the window.
                // Creation emits transient move events, so those events must not overwrite saved coordinates.
                if let Some(window) = app_handle.get_webview_window("notice") {
                    if let Ok(position) = window.outer_position() {
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .moved(position);
                    }
                }
                if let Err(error) = app_handle.state::<crate::desktop::IslandState>().flush() {
                    runtime_failure = Some(format!("状态岛设置未能保存：{error}"));
                }
                if let Ok(mut guard) = shared.lock() {
                    if let Ok(store) = guard.as_mut() {
                        observe_sound(store, false);
                        let now = SystemClock::new().now();
                        for signal in signals.try_iter() {
                            match signal {
                                Ok(signal) => {
                                    if !signal.available {
                                        if let Err(error) = store.system_unavailable(signal.at) {
                                            store.warning = Some(error.clone());
                                            runtime_failure = Some(error);
                                        }
                                    }
                                    store.monitor.native = None;
                                }
                                Err(error) => {
                                    listener_ok = false;
                                    store.monitor.events_failed = true;
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    let _ = store.system_unavailable(now);
                                }
                            }
                        }
                        let sample = if store.monitor_sample_due(now.ticks_ms) {
                            match native_activity::sample() {
                                Ok(mut sample) => {
                                    sample.reliable &= listener_ok;
                                    sample
                                }
                                Err(error) => {
                                    store.warning = Some(error.clone());
                                    runtime_failure = Some(error);
                                    NativeSample {
                                        at: now,
                                        last_input_ticks: 0,
                                        chrome_foreground: false,
                                        unlocked: false,
                                        reliable: false,
                                    }
                                }
                            }
                        } else {
                            store.monitor.native.unwrap()
                        };
                        let now = SystemClock::new().now();
                        if let Err(error) = store.monitor_tick(sample, now) {
                            store.warning = Some(error.clone());
                            runtime_failure = Some(error);
                        }
                        observe_sound(store, true);
                        match store.current_notice() {
                            Ok(value) => notice = value,
                            Err(error) => {
                                store.warning = Some(error.clone());
                                runtime_failure = Some(error);
                            }
                        }
                        match store.snapshot() {
                            Ok(snapshot) => {
                                if last_pending != Some(snapshot.pending_count) {
                                    let _ = app_handle.emit("workmemo:data-changed", ());
                                    last_pending = Some(snapshot.pending_count);
                                }
                                candidate_id =
                                    snapshot.monitoring.start_candidate.as_ref().map(|c| c.id);
                                browsing = snapshot.monitoring.browsing_only;
                                active_id = snapshot.active.map(|record| record.id);
                            }
                            Err(error) => runtime_failure = Some(error),
                        }
                    }
                }
                let key = island_presentation_key(
                    active_id,
                    candidate_id,
                    notice.as_ref().map(|n| (n.kind.as_str(), n.record.id)),
                    app_handle.state::<crate::desktop::IslandState>().enabled(),
                    browsing,
                );
                let key = key.or_else(|| {
                    app_handle
                        .state::<crate::desktop::IslandState>()
                        .holding
                        .load(Ordering::Relaxed)
                        .then(|| "expanded".into())
                });
                if key != presented {
                    match crate::desktop::present_notice(
                        &app_handle,
                        key.is_some(),
                        notice.is_some(),
                        candidate_id.is_some(),
                    ) {
                        Ok(()) => presented = key,
                        Err(error) => {
                            let message =
                                format!("提醒窗口未能显示，记录仍保留在待补全列表：{error}");
                            if let Ok(mut guard) = shared.lock() {
                                if let Ok(store) = guard.as_mut() {
                                    store.warning = Some(message.clone());
                                }
                            }
                            runtime_failure = Some(message);
                        }
                    }
                }
                if let Some(error) = runtime_failure {
                    if reported_error.as_ref() != Some(&error) {
                        // Surface background failures without stealing keyboard focus.
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = crate::desktop::set_visibility(
                                &window.as_ref().window(),
                                true,
                                false,
                            );
                        }
                        let _ = app_handle.emit("workmemo:runtime-error", error.clone());
                    }
                    reported_error = Some(error);
                } else if listener_ok {
                    if let Ok(mut guard) = shared.lock() {
                        if let Ok(store) = guard.as_mut() {
                            if store.monitor.native.is_some_and(|sample| sample.reliable) {
                                if let Some(previous) = reported_error.take() {
                                    if store.warning.as_ref() == Some(&previous) {
                                        store.warning = None;
                                    }
                                    let _ = app_handle.emit("workmemo:runtime-recovered", previous);
                                }
                            }
                        }
                    }
                }
            }
        });
        Self {
            inner,
            tray_ready: AtomicBool::new(false),
            exiting: AtomicBool::new(false),
        }
    }

    pub fn save_on_exit(&self) -> Result<()> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| "数据服务锁异常，未能保存当前任务。")?;
        // A window showing a startup database error must still be closable.
        if let Ok(store) = guard.as_mut() {
            if let Err(error) = store.pause_for_close() {
                store.warning = Some(format!("关闭时保存失败，已阻止关闭，请重试：{error}"));
                return Err(error);
            }
        }
        Ok(())
    }
}

pub(crate) async fn access<T: Send + 'static>(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<T> + Send + 'static,
) -> Result<T> {
    tauri::async_runtime::spawn_blocking(move || {
        let mut guard = shared
            .lock()
            .map_err(|_| "本地数据服务异常，请重新打开应用。")?;
        let store = guard.as_mut().map_err(|e| e.clone())?;
        observe_sound(store, false);
        let result = action(store);
        observe_sound(store, true);
        result
    })
    .await
    .map_err(|e| format!("数据操作未能完成：{e}"))?
}

async fn execute(
    shared: SharedStore,
    action: impl FnOnce(&mut Store) -> Result<()> + Send + 'static,
) -> Result<Snapshot> {
    access(shared, move |store| {
        // Resolve expired automatic deadlines before a manual command can
        // pause/finish the same record or start another one.
        before_action(store)?;
        action(store)?;
        store.snapshot()
    })
    .await
}

fn before_action(store: &mut Store) -> Result<()> {
    if store.monitor.active {
        let sample = native_activity::sample();
        let now = SystemClock::new().now();
        let mut sample = sample.unwrap_or(NativeSample {
            at: now,
            last_input_ticks: 0,
            chrome_foreground: false,
            unlocked: false,
            reliable: false,
        });
        sample.reliable &= !store.monitor.events_failed;
        store.monitor_tick(sample, now)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn query_history(state: State<'_, Backend>, query: HistoryQuery) -> Result<HistoryPage> {
    access(state.inner.clone(), move |store| store.query_history(query)).await
}

#[tauri::command]
pub async fn delete_record(state: State<'_, Backend>, id: i64) -> Result<()> {
    access(state.inner.clone(), move |store| store.delete_record(id)).await
}

#[tauri::command]
pub async fn get_snapshot(state: State<'_, Backend>) -> Result<Snapshot> {
    access(state.inner.clone(), |store| store.snapshot()).await
}

#[tauri::command]
pub async fn start_task(
    state: State<'_, Backend>,
    input: StartInput,
    expected_active_id: Option<i64>,
) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| {
        store.start_checked(input, expected_active_id)
    })
    .await
}

#[tauri::command]
pub async fn pause_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.pause(id)).await
}

#[tauri::command]
pub async fn resume_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.resume(id)).await
}

#[tauri::command]
pub async fn finish_task(state: State<'_, Backend>, id: i64) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.finish(id)).await
}

#[tauri::command]
pub async fn get_pending_records(state: State<'_, Backend>) -> Result<Vec<WorkRecord>> {
    access(state.inner.clone(), |store| store.pending_records()).await
}

#[tauri::command]
pub async fn settle_record(state: State<'_, Backend>, input: SettleInput) -> Result<Snapshot> {
    execute(state.inner.clone(), move |store| store.settle(input)).await
}

#[tauri::command]
pub async fn get_monitor_config(state: State<'_, Backend>) -> Result<MonitorConfig> {
    access(state.inner.clone(), |store| store.monitor_config()).await
}
#[tauri::command]
pub async fn get_category_names(
    state: State<'_, Backend>,
) -> Result<crate::database::categories::CategoryNames> {
    access(state.inner.clone(), |store| store.category_names()).await
}
#[tauri::command]
pub async fn save_category_names(
    app: tauri::AppHandle,
    state: State<'_, Backend>,
    input: crate::database::categories::CategoryNames,
) -> Result<crate::database::categories::CategoryNames> {
    let saved = access(state.inner.clone(), move |store| {
        store.save_category_names(input)
    })
    .await?;
    let _ = app.emit("workmemo:categories-changed", ());
    Ok(saved)
}
#[tauri::command]
pub async fn save_monitor_config(
    state: State<'_, Backend>,
    input: ConfigInput,
) -> Result<MonitorConfig> {
    access(state.inner.clone(), move |store| {
        before_action(store)?;
        store.save_monitor_config(input)
    })
    .await
}
#[tauri::command]
pub async fn get_notice(state: State<'_, Backend>) -> Result<Option<Notice>> {
    access(state.inner.clone(), |store| store.current_notice()).await
}
#[tauri::command]
pub async fn defer_notice(state: State<'_, Backend>, id: i64, kind: String) -> Result<()> {
    access(state.inner.clone(), move |store| {
        store.defer_notice(id, &kind)
    })
    .await
}
#[tauri::command]
pub fn show_main(app: tauri::AppHandle, settlement: bool) -> Result<()> {
    crate::desktop::show_main(&app, settlement)
}
#[tauri::command]
pub fn exit_app(app: tauri::AppHandle, state: State<'_, Backend>) -> Result<()> {
    if let Err(error) = crate::desktop::save_island_position(&app) {
        let _ = app.emit(
            "workmemo:runtime-error",
            format!("状态岛设置未能保存：{error}"),
        );
    }
    if crate::windows::has_drafts(&app) {
        let _ = app.emit("workmemo:request-close", ());
        return Err("请先保存或放弃二级窗口中的修改，再退出。".into());
    }
    state.save_on_exit()?;
    state.exiting.store(true, Ordering::Relaxed);
    app.exit(0);
    Ok(())
}

pub fn handle_window_event(window: &tauri::Window, event: &tauri::WindowEvent) {
    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
        let backend = window.state::<Backend>();
        let _ = crate::windows::capture(window);
        if matches!(window.label(), "settings" | "history" | "settlement") {
            api.prevent_close();
            let _ = window.emit("workmemo:request-close", ());
            return;
        }
        if window.label() == "notice" {
            api.prevent_close();
            if window
                .state::<crate::desktop::IslandState>()
                .holding
                .load(Ordering::Relaxed)
            {
                let _ = window.emit("workmemo:request-close", ());
                return;
            }
            let result = (|| -> Result<()> {
                let mut guard = backend.inner.lock().map_err(|_| "本地服务锁异常。")?;
                let store = guard.as_mut().map_err(|e| e.clone())?;
                if let Some(notice) = store.current_notice()? {
                    store.defer_notice(notice.record.id, &notice.kind)?;
                } else {
                    window.state::<crate::desktop::IslandState>().disable()?;
                }
                Ok(())
            })();
            if let Err(error) = result {
                let _ = window.emit("workmemo:storage-error", error);
            }
            return;
        }
        if window.label() == "main"
            && backend.tray_ready.load(Ordering::Relaxed)
            && !backend.exiting.load(Ordering::Relaxed)
        {
            api.prevent_close();
            if let Err(error) = crate::desktop::set_visibility(window, false, false) {
                let _ = window.emit("workmemo:storage-error", error.to_string());
            }
            return;
        }
        if let Err(error) = window.state::<Backend>().save_on_exit() {
            api.prevent_close();
            let _ = window.emit("workmemo:storage-error", error);
        }
    }
}

#[tauri::command]
pub async fn enter_browsing(state: State<'_, Backend>) -> Result<Snapshot> {
    execute(state.inner.clone(), |store| store.enter_browsing()).await
}
#[tauri::command]
pub async fn confirm_work(
    state: State<'_, Backend>,
    candidate_id: Option<u64>,
) -> Result<Snapshot> {
    let own = crate::native_activity::own_process_foreground();
    execute(state.inner.clone(), move |store| {
        store.confirm_work(candidate_id, own)
    })
    .await
}

fn observe_sound(store: &mut Store, enabled: bool) {
    if let Ok(active) = store.active() {
        let state = active.map(|r| crate::sound::Status {
            id: r.id,
            paused: r.is_paused,
            recovery: r.recovery_pending,
        });
        let cues = store
            .sounds
            .observe(state, store.monitor.status.idle_warning);
        if enabled {
            if let Some(layout) = store
                .sound_config
                .as_ref()
                .and_then(|p| crate::windows::load(p).ok())
                .filter(|layout| layout.sound_enabled)
            {
                if let Some(cue) = cues.first() {
                    let _ = crate::sound::play(*cue, layout.sound_theme);
                }
            }
        }
    }
}

#[cfg(test)]
mod island_tests {
    use super::island_presentation_key as key;

    #[test]
    fn new_work_supersedes_old_reminders_without_changing_visibility_preference() {
        assert_eq!(
            key(None, Some(2), Some(("ended", 1)), false, false).as_deref(),
            Some("candidate:2")
        );
        assert_eq!(
            key(Some(3), None, Some(("ended", 1)), true, false).as_deref(),
            Some("active:3")
        );
        assert_eq!(key(Some(3), None, Some(("ended", 1)), false, false), None);
        assert_eq!(
            key(None, None, Some(("ended", 1)), false, false).as_deref(),
            Some("ended:1")
        );
        assert_eq!(
            key(Some(3), None, Some(("idle", 3)), false, false).as_deref(),
            Some("idle:3")
        );
        assert_eq!(
            key(None, None, None, true, true).as_deref(),
            Some("browsing")
        );
    }
}
~~~~~~

## E:\WorkMemo\src-tauri\src\tracking_tests.rs

~~~~~~rust
use super::tests::{TestClock, TestDirectory};
use super::*;
use crate::monitor::*;

struct Harness {
    store: Store,
    clock: TestClock,
    input: i64,
    connected: bool,
    matched: bool,
    ready: bool,
}
impl Harness {
    fn new() -> Self {
        let clock = TestClock::new();
        let mut store = Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(clock.clone()),
            None,
        )
        .unwrap();
        store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: 0,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
                    url_prefix: "https://work.example.test/tasks?ignored=1#fragment".into(),
                    category: "开发".into(),
                }],
            })
            .unwrap();
        store.activate_monitoring();
        let mut harness = Self {
            store,
            clock,
            input: 0,
            connected: true,
            matched: true,
            ready: true,
        };
        harness.tick();
        harness
    }
    fn tick_unconfirmed(&mut self) {
        let now = self.clock.now();
        if self.connected {
            self.store.observe_page(PageSample {
                at: now,
                focused: self.matched,
                rule_id: self
                    .matched
                    .then_some(self.store.monitor.config.rules[0].id),
                revision: self.store.monitor.config.revision,
                ready: self.ready,
            });
        }
        self.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: self.input,
                    chrome_foreground: self.matched,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
    }
    fn tick(&mut self) {
        self.tick_unconfirmed();
        self.accept();
    }
    // Existing timer scenarios model a user accepting the initial prompt immediately.
    // Dedicated confirmation tests below leave candidates unanswered explicitly.
    fn accept(&mut self) {
        if let Some(c) = self.store.monitor.candidate.clone() {
            self.store.confirm_work(Some(c.id), false).unwrap();
        }
    }
    fn step(&mut self, ms: i64, input: bool) {
        self.clock.advance(ms);
        if input {
            self.input = self.clock.now().ticks_ms;
        }
        self.tick();
    }
    fn advance(&mut self, mut ms: i64, input: bool) {
        while ms > 0 {
            let step = ms.min(5000);
            self.step(step, input);
            ms -= step;
        }
    }
    fn start(&mut self) -> i64 {
        self.step(1000, true);
        self.store.active().unwrap().unwrap().id
    }
    fn saved(&self, id: i64) -> WorkRecord {
        self.store.record(id).unwrap()
    }
}

#[test]
fn merely_open_or_background_page_does_not_start_and_new_input_starts_once() {
    let mut h = Harness::new();
    h.advance(30_000, false);
    assert!(h.store.active().unwrap().is_none());
    h.matched = false;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1, false);
    assert!(h.store.active().unwrap().is_none());
    let id = h.start();
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    let record = h.saved(id);
    assert_eq!(record.source, "AUTO");
    assert_eq!(record.control_mode, "AUTO");
    assert_eq!(record.quantity, None);
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn idle_thresholds_use_input_time_warning_cancels_and_seven_minutes_are_removed() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(299_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "idle");
    h.store.defer_notice(id, "idle").unwrap();
    h.step(1000, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1000, true);
    assert!(!h.store.monitor.status.idle_warning);
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(420_000, false);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 420_000));
    assert_eq!(record.duration_ms, 20_000);
    assert_eq!(h.store.current_notice().unwrap().unwrap().kind, "ended");
    h.step(5000, false);
    assert_eq!(
        h.store
            .connection
            .query_row(
                "SELECT count(*) FROM end_reminders WHERE record_id=?1",
                [id],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        1
    );
}

#[test]
fn idle_end_wins_over_away_and_rolls_back_the_two_minute_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(120_000, false);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("IDLE_PAUSE"));
    h.advance(300_000, false);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("IDLE"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn other_application_input_cannot_extend_work_beyond_away_grace_or_twelve_minutes() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(119_999, true);
    assert!(!h.saved(id).is_paused);
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    h.advance(599_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    let record = h.saved(id);
    assert_eq!(record.end_reason.as_deref(), Some("AWAY"));
    assert_eq!(record.duration_ms, 130_000);
    assert_eq!(
        record.confirmed_end_time.unwrap() - record.end_time.unwrap(),
        600_000
    );
}

#[test]
fn return_inside_hold_needs_new_input_and_resumes_same_record_excluding_pause() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(180_000, true);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    assert!(!h.saved(id).is_paused);
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).duration_ms, 140_000);
}

#[test]
fn equal_idle_and_away_deadlines_produce_one_idle_result() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.matched = false;
    h.tick();
    h.advance(300_000, true);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 130_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[test]
fn first_input_at_idle_deadline_starts_new_record_instead_of_merging() {
    let mut h = Harness::new();
    let old = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.step(1, true);
    let current = h.store.active().unwrap().unwrap();
    assert_ne!(current.id, old);
    assert_eq!(current.duration_ms, 0);
    assert_eq!(h.saved(old).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[test]
fn manual_pause_remains_protected_when_auto_resume_disabled() {
    let mut h = Harness::new();
    h.store.monitor.config.auto_resume_manual = false;
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.advance(900_000, false);
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).status, "WORKING");
    h.advance(10_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(180_000, true);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 135_000);
}

#[test]
fn lost_browser_connection_removes_unconfirmed_tail_and_recovers_only_with_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let trusted = h.clock.now();
    h.connected = false;
    h.advance(20_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.monitor.last_trusted_page, Some(trusted.ticks_ms));
    h.connected = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1000, true);
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 15_000);
}

#[test]
fn revoked_permission_is_unknown_not_a_counted_away_grace() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.ready = false;
    h.advance(5000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn lock_or_suspended_scheduler_gap_never_counts_unknown_time() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let lock = h.clock.now();
    h.clock.advance(5000);
    h.store.system_unavailable(lock).unwrap();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.clock.advance(60_000);
    h.tick();
    assert!(h.saved(id).is_paused);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn deferred_reminder_and_pending_record_survive_restart_without_blocking_new_work() {
    let directory = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&directory.db(), Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        clock.advance(1250);
        store.finish(id).unwrap();
        assert!(store.current_notice().unwrap().is_some());
        store.defer_notice(id, "ended").unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: "".into(),
            })
            .unwrap();
    }
    let store = Store::open(&directory.db(), Box::new(clock)).unwrap();
    assert!(store.current_notice().unwrap().is_none());
    assert_eq!(store.pending_records().unwrap()[0].id, id);
    assert!(store.active().unwrap().unwrap().recovery_pending);
}

#[test]
fn config_validation_conflict_and_storage_failure_keep_previous_rules() {
    let mut h = Harness::new();
    let original = h.store.monitor_config().unwrap();
    for url in [
        "file:///private",
        "https://name:password@work.example.test/",
        "not-a-url",
    ] {
        assert!(
            h.store
                .save_monitor_config(ConfigInput {
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    times: TrackingTimes::default(),
                    enabled: true,
                    expected_revision: original.revision,
                    rules: vec![RuleInput {
                        match_mode: "path_prefix".into(),
                        url_prefix: url.into(),
                        category: "开发".into()
                    }]
                })
                .is_err()
        );
    }
    h.store.connection.execute_batch("CREATE TRIGGER reject_rule BEFORE INSERT ON work_urls BEGIN SELECT RAISE(ABORT,'rule failure'); END;").unwrap();
    assert!(
        h.store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                times: TrackingTimes::default(),
                enabled: true,
                expected_revision: original.revision,
                rules: vec![RuleInput {
                    match_mode: "path_prefix".into(),
                    url_prefix: "https://other.example.test/".into(),
                    category: "开发".into()
                }]
            })
            .is_err()
    );
    let current = h.store.monitor_config().unwrap();
    assert_eq!(current.revision, original.revision);
    assert_eq!(current.rules, original.rules);
}

#[test]
fn delayed_detection_does_not_add_poll_delay_to_effective_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.clock.now();
    h.advance(419_000, false);
    h.step(4_003, false);
    let record = h.saved(id);
    assert_eq!(record.duration_ms, 10_000);
    assert_eq!(record.end_time, Some(last.wall_ms));
    assert_eq!(record.confirmed_end_time, Some(last.wall_ms + 423_003));
}

#[test]
fn unconfirmed_browser_outage_cannot_hold_record_forever_while_input_continues() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.connected = false;
    h.advance(615_000, true);
    let record = h.saved(id);
    assert_eq!(record.status, "FINISHED");
    assert_eq!(record.end_reason.as_deref(), Some("RECOVERY"));
    assert_eq!(record.duration_ms, 10_000);
}

#[test]
fn background_browser_profiles_cannot_override_the_focused_profile() {
    let mut h = Harness::new();
    let at = h.clock.now();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let page = |focused| PageSample {
        at,
        focused,
        rule_id: focused.then_some(rule),
        revision,
        ready: true,
    };
    h.store.observe_browser_page(11, page(true));
    h.store.observe_browser_page(22, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(11));
    h.store.observe_browser_page(22, page(true));
    h.store.observe_browser_page(11, page(false));
    assert!(h.store.monitor.page.as_ref().unwrap().focused);
    assert_eq!(h.store.monitor.browser_owner, Some(22));
}

#[test]
fn last_input_timestamp_does_not_move_when_wall_clock_changes_without_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    let last = h.saved(id).last_input_time;
    h.clock.jump_wall(3_600_000);
    h.advance(5000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    h.advance(420_000, false);
    assert_eq!(h.saved(id).last_input_time, last);
    assert_eq!(h.saved(id).duration_ms, 10_000);
}

#[test]
fn second_schema_pending_intervals_survive_upgrade_without_an_upgrade_popup() {
    let connection = Connection::open_in_memory().unwrap();
    connection
        .execute_batch(include_str!("../migrations/001_initial.sql"))
        .unwrap();
    connection
        .execute_batch(include_str!("../migrations/002_settlement.sql"))
        .unwrap();
    connection.execute_batch("PRAGMA user_version=2;
        INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time)
        VALUES(10,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);
        INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(10,1000,2250,2250,1250,'CLOSED');").unwrap();
    let mut store = Store::initialize(connection, Box::new(TestClock::new()), None).unwrap();
    let pending = store.pending_records().unwrap();
    assert_eq!(pending[0].id, 10);
    assert_eq!(pending[0].duration_ms, 1250);
    assert_eq!(pending[0].quantity, None);
    assert!(store.current_notice().unwrap().is_none());
    store
        .settle(SettleInput {
            id: 10,
            expected_revision: 0,
            category: "开发".into(),
            quantity: 0.0,
            remark: "".into(),
        })
        .unwrap();
    assert_eq!(store.record(10).unwrap().duration_ms, 1250);
}

#[test]
fn automatic_finish_failure_rolls_back_trim_and_retries_without_duplicate_reminders() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.advance(419_999, false);
    h.store.connection.execute_batch("CREATE TRIGGER reject_auto_end BEFORE UPDATE ON work_records WHEN NEW.status='FINISHED' BEGIN SELECT RAISE(ABORT,'auto end failure'); END;").unwrap();
    h.clock.advance(1);
    let now = h.clock.now();
    assert!(
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: h.input,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true
                },
                now
            )
            .is_err()
    );
    assert_eq!(h.saved(id).status, "WORKING");
    assert!(h.store.current_notice().unwrap().is_none());
    h.store
        .connection
        .execute_batch("DROP TRIGGER reject_auto_end")
        .unwrap();
    h.tick();
    assert_eq!(h.saved(id).duration_ms, 10_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
    assert_eq!(
        h.store
            .connection
            .query_row("SELECT count(*) FROM end_reminders", [], |r| r
                .get::<_, i64>(0))
            .unwrap(),
        1
    );
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_rejects_bad_auth_and_replay_before_changing_page_state() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let rule = h.store.monitor.config.rules[0].id;
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    crate::browser_bridge::start(shared.clone(), directory.db().parent().unwrap()).unwrap();
    let endpoint_path = directory
        .db()
        .parent()
        .unwrap()
        .join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let send = |stream: &mut TcpStream, token: String, sequence, focused| {
        let frame = BrowserFrame {
            match_modes: true,
            page_activity: false,
            version: 1,
            sequence,
            config_revision: revision,
            focused,
            ready: true,
            rule_id: Some(rule),
        };
        let mut bytes = serde_json::to_vec(&WireRequest { token, frame }).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        stream.flush().unwrap();
    };
    let mut bad = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    bad.set_read_timeout(Some(Duration::from_secs(2))).unwrap();
    send(&mut bad, "invalid".into(), 1, false);
    let mut line = String::new();
    let rejected = |result: std::io::Result<usize>| match result {
        Ok(0) => (),
        Err(error)
            if matches!(
                error.kind(),
                std::io::ErrorKind::ConnectionReset | std::io::ErrorKind::ConnectionAborted
            ) =>
        {
            ()
        }
        other => panic!("expected a rejected connection, got {other:?}"),
    };
    // Windows may close a rejected socket with FIN or RST. Neither may return
    // a successful reply or change the page state.
    rejected(BufReader::new(bad).read_line(&mut line));
    assert!(line.is_empty());
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .unwrap()
            .focused
    );
    let mut valid = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    valid
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(valid.try_clone().unwrap());
    send(&mut valid, endpoint.token.clone(), 1, true);
    reader.read_line(&mut line).unwrap();
    assert_eq!(
        serde_json::from_str::<serde_json::Value>(&line).unwrap()["connected"],
        true
    );
    line.clear();
    send(&mut valid, endpoint.token, 1, false);
    rejected(reader.read_line(&mut line));
    assert!(line.is_empty());
    // Rejecting a replay may already have cleared the disconnected page.
    // A replay must never publish the supplied focused=false state.
    assert!(
        shared
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .monitor
            .page
            .as_ref()
            .is_none_or(|page| page.focused)
    );
    drop(reader);
    drop(valid);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn unavailable_native_metadata_blocks_manual_start_and_resume_without_losing_work() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: h.input,
                chrome_foreground: true,
                unlocked: false,
                reliable: false,
            },
            now,
        )
        .unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: "".into()
            })
            .is_err()
    );
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert!(h.saved(id).is_paused);
    h.tick();
    h.store.resume(id).unwrap();
    h.advance(5000, true);
    assert_eq!(h.saved(id).duration_ms, 10000);
}

#[cfg(windows)]
#[test]
fn real_loopback_bridge_keeps_one_connection_between_heartbeats() {
    use crate::browser_protocol::{BrowserFrame, Endpoint, WireRequest};
    use std::{
        io::{BufRead, BufReader, Write},
        net::TcpStream,
        sync::{Arc, Mutex},
        time::Duration,
    };
    let directory = TestDirectory::new();
    let h = Harness::new();
    let revision = h.store.monitor.config.revision;
    let shared = Arc::new(Mutex::new(Ok(h.store)));
    let folder = directory.db().parent().unwrap().to_path_buf();
    crate::browser_bridge::start(shared.clone(), &folder).unwrap();
    let endpoint_path = folder.join("browser-bridge.endpoint.json");
    let endpoint: Endpoint =
        serde_json::from_slice(&std::fs::read(&endpoint_path).unwrap()).unwrap();
    let mut stream = TcpStream::connect(("127.0.0.1", endpoint.port)).unwrap();
    stream
        .set_read_timeout(Some(Duration::from_secs(2)))
        .unwrap();
    let mut reader = BufReader::new(stream.try_clone().unwrap());
    for sequence in 1..=3 {
        if sequence > 1 {
            // A real browser waits between heartbeats. Windows accepted sockets
            // inherit the listener's nonblocking mode unless explicitly reset.
            std::thread::sleep(Duration::from_millis(120));
        }
        let request = WireRequest {
            token: endpoint.token.clone(),
            frame: BrowserFrame {
                match_modes: true,
                page_activity: false,
                version: 1,
                sequence,
                config_revision: revision,
                focused: false,
                ready: true,
                rule_id: None,
            },
        };
        let mut bytes = serde_json::to_vec(&request).unwrap();
        bytes.push(b'\n');
        stream.write_all(&bytes).unwrap();
        let mut reply = String::new();
        let length = reader.read_line(&mut reply).unwrap();
        assert!(length > 0, "connection closed before heartbeat {sequence}");
        assert_eq!(
            serde_json::from_str::<serde_json::Value>(&reply).unwrap()["connected"],
            true
        );
    }
    drop(reader);
    drop(stream);
    drop(shared);
    for _ in 0..20 {
        if !endpoint_path.exists() {
            break;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(!endpoint_path.exists());
}

#[test]
fn already_expired_record_cannot_be_resurrected_by_manual_finish_or_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(5000, true);
    h.advance(420_000, false);
    h.store.finish(id).unwrap();
    assert!(h.store.resume(id).is_err());
    assert_eq!(h.saved(id).duration_ms, 5000);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
}

#[test]
fn configured_deadlines_control_work_and_status() {
    let mut h = Harness::new();
    let mut cfg = h.store.monitor_config().unwrap();
    cfg.times = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 20,
        idle_end_seconds: 30,
        away_pause_seconds: 4,
        hold_seconds: 6,
    };
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times.clone(),
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.matched = false;
    h.tick();
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(4));
    h.advance(3_999, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, Some(1));
    h.step(1, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.store.monitor.status.away_pause_remaining_seconds, None);
    h.advance(5_999, true);
    assert_eq!(h.saved(id).status, "WORKING");
    h.step(1, true);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("AWAY"));
    assert_eq!(h.saved(id).duration_ms, 4_000);
}

#[test]
fn configured_idle_deadline_and_notice_are_consistent() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: TrackingTimes {
                idle_pause_seconds: 1,
                idle_warning_seconds: 2,
                idle_end_seconds: 4,
                ..TrackingTimes::default()
            },
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(1_999, false);
    assert!(h.store.current_notice().unwrap().is_none());
    h.step(1, false);
    let notice = h.store.current_notice().unwrap().unwrap();
    assert_eq!(
        (notice.idle_warning_seconds, notice.idle_end_seconds),
        (2, 4)
    );
    h.advance(2_000, false);
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("IDLE"));
    assert_eq!(h.saved(id).duration_ms, 0);
}

#[test]
fn schema_three_migrates_defaults_and_settings_persist_with_validation() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=3; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=8 WHERE id=1;").unwrap();
    }
    let chosen = TrackingTimes {
        idle_pause_seconds: 10,
        idle_warning_seconds: 12,
        idle_end_seconds: 23,
        away_pause_seconds: 34,
        hold_seconds: 45,
    };
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let old = store.monitor_config().unwrap();
        assert_eq!(old.times, TrackingTimes::default());
        assert_eq!(old.revision, 8);
        let rule = || {
            vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }]
        };
        let invalid = TrackingTimes {
            idle_warning_seconds: 24,
            idle_end_seconds: 23,
            ..chosen.clone()
        };
        assert!(
            store
                .save_monitor_config(ConfigInput {
                    poll_interval_seconds: 1,
                    auto_resume_manual: true,
                    enabled: true,
                    expected_revision: 8,
                    times: invalid,
                    rules: rule()
                })
                .is_err()
        );
        assert_eq!(store.monitor_config().unwrap().revision, 8);
        store
            .save_monitor_config(ConfigInput {
                poll_interval_seconds: 1,
                auto_resume_manual: true,
                enabled: true,
                expected_revision: 8,
                times: chosen.clone(),
                rules: rule(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    assert_eq!(store.monitor_config().unwrap().times, chosen);
    assert_eq!(store.monitor_config().unwrap().rules.len(), 1);
}

#[test]
fn saving_settings_clears_old_away_deadline_and_requires_fresh_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.tick();
    h.advance(5_000, true);
    assert!(h.store.monitor.away_since.is_some());
    let cfg = h.store.monitor_config().unwrap();
    h.store
        .save_monitor_config(ConfigInput {
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            rules: cfg
                .rules
                .into_iter()
                .map(|r| RuleInput {
                    match_mode: r.match_mode.clone(),
                    url_prefix: r.url_prefix,
                    category: r.category,
                })
                .collect(),
        })
        .unwrap();
    assert!(h.store.monitor.away_since.is_none());
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MONITOR"));
    h.matched = true;
    h.tick();
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn manual_pause_auto_resumes_same_record_only_after_fresh_matching_input() {
    let mut h = Harness::new();
    let id = h.start();
    h.advance(10_000, true);
    h.store.pause(id).unwrap();
    h.step(1_000, false);
    assert!(h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    assert!(h.saved(id).is_paused);
    h.matched = true;
    h.step(1, false);
    assert!(h.saved(id).is_paused);
    h.step(1_000, true);
    assert_eq!(h.saved(id).id, id);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
    assert_eq!(h.saved(id).duration_ms, 10_000);
    h.advance(121_000, true);
    assert!(!h.saved(id).is_paused);
    h.matched = false;
    h.step(1_000, true);
    h.advance(120_000, true);
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("AWAY"));
}

#[test]
fn manual_started_active_is_not_replaced_and_automatic_resume_switches_same_record_to_auto() {
    let mut h = Harness::new();
    h.store
        .start(StartInput {
            category: "文档".into(),
            quantity: None,
            remark: "".into(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.advance(10_000, true);
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).control_mode, "MANUAL");
    h.store.pause(id).unwrap();
    h.step(1_000, true);
    assert_eq!(h.saved(id).id, id);
    assert!(!h.saved(id).is_paused);
    assert_eq!(h.saved(id).control_mode, "AUTO");
}

#[test]
fn checked_start_rejects_stale_or_missing_confirmation_without_modifying_task() {
    let mut h = Harness::new();
    let id = h.start();
    h.store.pause(id).unwrap();
    let input = || StartInput {
        category: "文档".into(),
        quantity: None,
        remark: "".into(),
    };
    assert!(h.store.start_checked(input(), None).is_err());
    assert!(h.store.start_checked(input(), Some(id + 1)).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.saved(id).status, "WORKING");
    h.store.start_checked(input(), Some(id)).unwrap();
    assert_eq!(h.saved(id).end_reason.as_deref(), Some("SWITCH"));
    assert_ne!(h.store.active().unwrap().unwrap().id, id);
}

#[test]
fn browser_evidence_time_allows_first_input_before_next_state_machine_tick() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1_000, true);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(100);
    let input = h.clock.now();
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: input.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.accept();
    let active = h
        .store
        .active()
        .unwrap()
        .expect("first input after confirmed page should start");
    assert_eq!(active.control_mode, "AUTO");
    assert_eq!(active.duration_ms, 0);
}

#[test]
fn monitor_interval_is_validated_persisted_and_changes_sample_due() {
    let mut h = Harness::new();
    let cfg = h.store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 1);
    assert!(cfg.auto_resume_manual);
    let input = |seconds| ConfigInput {
        enabled: true,
        expected_revision: cfg.revision,
        times: cfg.times.clone(),
        poll_interval_seconds: seconds,
        auto_resume_manual: false,
        rules: cfg
            .rules
            .iter()
            .map(|r| RuleInput {
                match_mode: r.match_mode.clone(),
                url_prefix: r.url_prefix.clone(),
                category: r.category.clone(),
            })
            .collect(),
    };
    assert!(h.store.save_monitor_config(input(0)).is_err());
    assert!(h.store.save_monitor_config(input(6)).is_err());
    h.store.save_monitor_config(input(5)).unwrap();
    let saved = h.store.monitor_config().unwrap();
    assert_eq!(saved.poll_interval_seconds, 5);
    assert!(!saved.auto_resume_manual);
    let now = h.clock.now();
    h.store.monitor.native = Some(NativeSample {
        at: now,
        last_input_ticks: 0,
        chrome_foreground: true,
        unlocked: true,
        reliable: true,
    });
    assert!(!h.store.monitor_sample_due(now.ticks_ms + 4_999));
    assert!(h.store.monitor_sample_due(now.ticks_ms + 5_000));
}

#[test]
fn schema_four_migrates_options_without_changing_records_or_existing_thresholds() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    {
        let c = Connection::open(&path).unwrap();
        c.execute_batch(include_str!("../migrations/001_initial.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/002_settlement.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/003_monitoring.sql"))
            .unwrap();
        c.execute_batch(include_str!("../migrations/004_tracking_times.sql"))
            .unwrap();
        c.execute_batch("PRAGMA user_version=4; INSERT INTO work_urls(url_prefix,category) VALUES('https://work.example/','开发'); UPDATE monitoring_settings SET enabled=1,revision=9,idle_warning_seconds=12,idle_end_seconds=23,away_pause_seconds=34,hold_seconds=45 WHERE id=1; INSERT INTO work_records(id,category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,confirmed_end_time) VALUES(17,'开发',NULL,1000,2250,1250,1,'FINISHED',1,'PENDING',7000);").unwrap();
    }
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        let cfg = store.monitor_config().unwrap();
        assert_eq!(cfg.revision, 9);
        assert_eq!(cfg.poll_interval_seconds, 1);
        assert!(cfg.auto_resume_manual);
        assert_eq!(
            cfg.times,
            TrackingTimes {
                idle_pause_seconds: 22,
                idle_warning_seconds: 12,
                idle_end_seconds: 23,
                away_pause_seconds: 34,
                hold_seconds: 45
            }
        );
        assert_eq!(store.record(17).unwrap().duration_ms, 1250);
        store
            .save_monitor_config(ConfigInput {
                enabled: true,
                expected_revision: 9,
                times: cfg.times,
                poll_interval_seconds: 5,
                auto_resume_manual: false,
                rules: cfg
                    .rules
                    .into_iter()
                    .map(|r| RuleInput {
                        match_mode: r.match_mode.clone(),
                        url_prefix: r.url_prefix,
                        category: r.category,
                    })
                    .collect(),
            })
            .unwrap();
    }
    let store = Store::open(&path, Box::new(clock)).unwrap();
    let cfg = store.monitor_config().unwrap();
    assert_eq!(cfg.poll_interval_seconds, 5);
    assert!(!cfg.auto_resume_manual);
    assert_eq!(store.record(17).unwrap().duration_ms, 1250);
}

#[test]
fn manually_paused_task_is_not_auto_resumed_after_restart() {
    let directory = TestDirectory::new();
    let path = directory.db();
    let clock = TestClock::new();
    let id;
    {
        let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
        store
            .start(StartInput {
                category: "开发".into(),
                quantity: None,
                remark: String::new(),
            })
            .unwrap();
        id = store.active().unwrap().unwrap().id;
        store.pause(id).unwrap();
    }
    let mut store = Store::open(&path, Box::new(clock.clone())).unwrap();
    let cfg = store.monitor_config().unwrap();
    store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: cfg.revision,
            times: cfg.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![RuleInput {
                match_mode: "path_prefix".into(),
                url_prefix: "https://work.example/".into(),
                category: "开发".into(),
            }],
        })
        .unwrap();
    store.activate_monitoring();
    clock.advance(1000);
    let now = clock.now();
    store.observe_page(PageSample {
        at: now,
        focused: true,
        rule_id: Some(store.monitor.config.rules[0].id),
        revision: store.monitor.config.revision,
        ready: true,
    });
    store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    let record = store.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
}

#[test]
fn input_before_page_evidence_does_not_start_or_backfill_unknown_time() {
    let mut h = Harness::new();
    h.matched = false;
    h.step(1000, true);
    let before_evidence = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let at = h.clock.now();
    h.store.observe_page(PageSample {
        at,
        focused: true,
        rule_id: Some(h.store.monitor.config.rules[0].id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.clock.advance(400);
    let now = h.clock.now();
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: before_evidence,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.matched = true;
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_some());
}

#[test]
fn page_activity_starts_at_confirmation_without_backfilling_earlier_input() {
    let mut h = Harness::new();
    h.step(1000, false);
    let input = h.clock.now().ticks_ms;
    h.clock.advance(100);
    let confirmed = h.clock.now();
    h.store.observe_browser_page(
        99,
        PageSample {
            at: confirmed,
            focused: true,
            rule_id: Some(h.store.monitor.config.rules[0].id),
            revision: h.store.monitor.config.revision,
            ready: true,
        },
    );
    h.store.observe_browser_activity(99);
    h.store.monitor.page_was_matched = false;
    h.store
        .monitor_tick(
            NativeSample {
                at: confirmed,
                last_input_ticks: input,
                chrome_foreground: true,
                unlocked: true,
                reliable: true,
            },
            confirmed,
        )
        .unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.accept();
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, confirmed.wall_ms);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn confirmation_deduplicates_and_counts_only_after_acceptance() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let candidate = h.store.monitor.candidate.clone().unwrap();
    for _ in 0..4 {
        h.clock.advance(1000);
        h.input = h.clock.now().ticks_ms;
        h.tick_unconfirmed();
        assert_eq!(h.store.monitor.candidate.as_ref().unwrap().id, candidate.id);
        assert!(h.store.active().unwrap().is_none());
    }
    let confirmed = h.clock.now();
    h.store.confirm_work(Some(candidate.id), false).unwrap();
    let record = h.store.active().unwrap().unwrap();
    assert_eq!(record.start_time, confirmed.wall_ms);
    assert_eq!(record.duration_ms, 0);
    assert!(h.store.confirm_work(Some(candidate.id), false).is_err());
    assert_eq!(h.store.active().unwrap().unwrap().id, record.id);
}

#[test]
fn manual_finish_rearms_same_or_other_rule_without_settling_the_previous_record() {
    for other_rule in [false, true] {
        let mut h = Harness::new();
        if other_rule {
            h.store.connection.execute("INSERT INTO work_urls(url_prefix,category,match_mode) VALUES('https://other.example.test/','文档','origin')", []).unwrap();
            h.store.monitor.config = h.store.monitor_config().unwrap();
        }
        let id = h.start();
        h.clock.advance(1000);
        h.store.finish(id).unwrap();
        let floor = h.clock.now();
        h.tick_unconfirmed();
        assert!(h.store.monitor.candidate.is_none());
        assert!(h.store.active().unwrap().is_none());
        // Browser heartbeats alone cannot reuse the input that ended the work.
        h.clock.advance(1000);
        h.tick_unconfirmed();
        assert!(h.store.monitor.candidate.is_none());
        h.input = h.clock.now().ticks_ms;
        if other_rule {
            h.store.monitor.config.rules.reverse();
        }
        h.tick_unconfirmed();
        let candidate = h.store.monitor.candidate.clone().unwrap();
        assert_eq!(candidate.category, if other_rule { "文档" } else { "开发" });
        assert!(h.store.active().unwrap().is_none());
        assert_eq!(h.store.current_notice().unwrap().unwrap().record.id, id);
        assert_eq!(h.saved(id).settlement_status, "PENDING");
        h.clock.advance(1000);
        h.tick_unconfirmed();
        h.store.confirm_work(Some(candidate.id), true).unwrap();
        let active = h.store.active().unwrap().unwrap();
        assert_ne!(active.id, id);
        assert!(active.start_time > floor.wall_ms);
        assert_eq!(active.duration_ms, 0);
        assert_eq!(h.store.snapshot().unwrap().pending_count, 1);
        assert!(h.store.confirm_work(Some(candidate.id), true).is_err());
        assert_eq!(h.store.active().unwrap().unwrap().id, active.id);
    }
}

#[test]
fn automatic_finish_waits_for_fresh_input_and_explicit_confirmation() {
    let mut h = Harness::new();
    let id = h.start();
    h.clock.advance(420_000);
    h.tick_unconfirmed();
    assert_eq!(h.saved(id).status, "FINISHED");
    assert!(h.store.monitor.candidate.is_none());
    h.clock.advance(1000);
    h.tick_unconfirmed();
    assert!(h.store.monitor.candidate.is_none());
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let candidate = h.store.monitor.candidate.clone().unwrap();
    assert!(h.store.active().unwrap().is_none());
    h.clock.advance(2000);
    h.tick_unconfirmed();
    assert_eq!(h.store.monitor.candidate.as_ref().unwrap().id, candidate.id);
    h.store.confirm_work(Some(candidate.id), true).unwrap();
    assert_ne!(h.store.active().unwrap().unwrap().id, id);
    assert_eq!(h.store.snapshot().unwrap().pending_count, 1);
}

#[test]
fn failed_candidate_start_preserves_candidate_and_previous_pending_record() {
    let mut h = Harness::new();
    let id = h.start();
    h.store.finish(id).unwrap();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let candidate = h.store.monitor.candidate.clone().unwrap();
    h.store.connection.execute_batch("CREATE TRIGGER reject_start BEFORE INSERT ON work_records BEGIN SELECT RAISE(ABORT,'injected start failure'); END;").unwrap();
    assert!(h.store.confirm_work(Some(candidate.id), true).is_err());
    assert!(h.store.active().unwrap().is_none());
    assert_eq!(h.store.monitor.candidate.as_ref().unwrap().id, candidate.id);
    assert_eq!(h.saved(id).settlement_status, "PENDING");
    h.store
        .connection
        .execute_batch("DROP TRIGGER reject_start")
        .unwrap();
    h.store.confirm_work(Some(candidate.id), true).unwrap();
    assert_ne!(h.store.active().unwrap().unwrap().id, id);
}
#[test]
fn confirmation_survives_own_window_focus_but_rejects_stale_page() {
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.monitor.candidate.clone().unwrap();
    h.clock.advance(3000);
    let now = h.clock.now();
    h.store.observe_page(PageSample {
        at: now,
        focused: false,
        rule_id: Some(c.rule_id),
        revision: h.store.monitor.config.revision,
        ready: true,
    });
    h.store
        .monitor_tick(
            NativeSample {
                at: now,
                last_input_ticks: now.ticks_ms,
                chrome_foreground: false,
                unlocked: true,
                reliable: true,
            },
            now,
        )
        .unwrap();
    assert!(h.store.confirm_work(Some(c.id), false).is_err());
    h.store.confirm_work(Some(c.id), true).unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().start_time, now.wall_ms);
    let mut h = Harness::new();
    h.clock.advance(1000);
    h.input = h.clock.now().ticks_ms;
    h.tick_unconfirmed();
    let c = h.store.monitor.candidate.clone().unwrap();
    h.connected = false;
    h.clock.advance(16000);
    h.tick_unconfirmed();
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.confirm_work(Some(c.id), true).is_err());
    assert!(h.store.active().unwrap().is_none());
}
#[test]
fn browsing_blocks_new_work_and_protects_a_paused_task_until_explicit_resume() {
    let mut h = Harness::new();
    let id = h.start();
    h.matched = false;
    h.step(1, false);
    h.advance(120000, false);
    assert!(h.saved(id).is_paused);
    h.store.enter_browsing().unwrap();
    h.advance(3600000, true);
    assert_eq!(h.saved(id).status, "WORKING");
    assert_eq!(h.saved(id).pause_reason.as_deref(), Some("MANUAL"));
    h.matched = true;
    h.step(1000, true);
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.status.browse_ready);
    h.store.confirm_work(None, false).unwrap();
    assert_eq!(h.store.active().unwrap().unwrap().id, id);
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor.config.browsing_only);
    h.store.finish(id).unwrap();
    h.store.enter_browsing().unwrap();
    h.step(1000, true);
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.candidate.is_none());
    assert!(h.store.monitor.status.browse_ready);
}
#[test]
fn browsing_intent_persists_across_restart_without_ending_work() {
    let d = TestDirectory::new();
    let clock = TestClock::new();
    let id;
    {
        let mut s = Store::open(&d.db(), Box::new(clock.clone())).unwrap();
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
        id = s.active().unwrap().unwrap().id;
        s.enter_browsing().unwrap();
    }
    clock.advance(600000);
    let mut s = Store::open(&d.db(), Box::new(clock)).unwrap();
    s.activate_monitoring();
    assert!(s.monitor.config.browsing_only);
    assert!(s.monitor.status.browsing_only);
    let record = s.active().unwrap().unwrap();
    assert_eq!(record.id, id);
    assert!(record.is_paused && record.recovery_pending);
    assert_eq!(record.duration_ms, 0);
}

#[test]
fn leaving_browse_mode_commits_atomically_with_start_or_resume() {
    let mut h = Harness::new();
    h.store.enter_browsing().unwrap();
    let trigger = "CREATE TRIGGER refuse_work_intent BEFORE UPDATE OF browsing_only ON monitoring_settings WHEN NEW.browsing_only=0 BEGIN SELECT RAISE(ABORT,'injected intent failure'); END;";
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(
        h.store
            .start(StartInput {
                category: "文档".into(),
                quantity: None,
                remark: String::new()
            })
            .is_err()
    );
    assert!(h.store.active().unwrap().is_none());
    assert!(h.store.monitor.config.browsing_only);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store
        .start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: String::new(),
        })
        .unwrap();
    let id = h.store.active().unwrap().unwrap().id;
    h.store.enter_browsing().unwrap();
    h.store.connection.execute_batch(trigger).unwrap();
    assert!(h.store.resume(id).is_err());
    assert!(h.saved(id).is_paused);
    assert!(h.store.monitor.config.browsing_only);
    let open: i64 = h
        .store
        .connection
        .query_row(
            "SELECT COUNT(*) FROM work_segments WHERE state='OPEN'",
            [],
            |r| r.get(0),
        )
        .unwrap();
    assert_eq!(open, 0);
    h.store
        .connection
        .execute_batch("DROP TRIGGER refuse_work_intent")
        .unwrap();
    h.store.resume(id).unwrap();
    assert!(!h.saved(id).is_paused);
    assert!(!h.store.monitor_config().unwrap().browsing_only);
}

#[test]
fn schema_seven_rules_migrate_and_modes_round_trip_without_touching_active_work() {
    let h = Harness::new();
    h.store
        .connection
        .execute_batch("ALTER TABLE work_urls RENAME TO temporary_rules; CREATE TABLE work_urls(id INTEGER PRIMARY KEY AUTOINCREMENT,url_prefix TEXT NOT NULL UNIQUE,category TEXT NOT NULL); INSERT INTO work_urls(id,url_prefix,category) SELECT id,url_prefix,category FROM temporary_rules; DROP TABLE temporary_rules; UPDATE sqlite_sequence SET seq=99 WHERE name='work_urls'; ALTER TABLE monitoring_settings DROP COLUMN idle_pause_seconds; DROP TABLE category_names; PRAGMA user_version=7;")
        .unwrap();
    let c = h.store.connection;
    let mut store = Store::initialize(c, Box::new(h.clock), None).unwrap();
    let config = store.monitor_config().unwrap();
    assert_eq!(config.rules[0].match_mode, "path_prefix");
    assert_eq!(
        store
            .connection
            .query_row(
                "SELECT seq FROM sqlite_sequence WHERE name='work_urls'",
                [],
                |r| r.get::<_, i64>(0)
            )
            .unwrap(),
        99
    );
    store
        .connection
        .execute(
            "INSERT INTO work_urls(url_prefix,category,match_mode) VALUES(?1,?2,?3)",
            params![config.rules[0].url_prefix, "开发", "origin"],
        )
        .unwrap();
    let saved = store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: false,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/sheets/a".into(),
                    category: "开发".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    assert_eq!(saved.rules[0].url_prefix, "https://moonshot.feishu.cn/");
    assert_eq!(saved.rules[1].url_prefix, "cn-beijing-vpc.fcapp.run");
    assert_eq!(store.monitor_config().unwrap().rules, saved.rules);
}

#[test]
fn multiple_sites_for_one_work_keep_one_record_and_continuous_time() {
    let mut h = Harness::new();
    let config = h.store.monitor_config().unwrap();
    let config = h
        .store
        .save_monitor_config(ConfigInput {
            enabled: true,
            expected_revision: config.revision,
            times: config.times,
            poll_interval_seconds: 1,
            auto_resume_manual: true,
            rules: vec![
                RuleInput {
                    match_mode: "origin".into(),
                    url_prefix: "https://moonshot.feishu.cn/".into(),
                    category: "评测".into(),
                },
                RuleInput {
                    match_mode: "domain_suffix".into(),
                    url_prefix: ".cn-beijing-vpc.fcapp.run".into(),
                    category: "评测".into(),
                },
            ],
        })
        .unwrap();
    h.tick();
    let id = h.start();
    h.advance(5_000, true);
    for index in 0..6 {
        h.clock.advance(1_000);
        let now = h.clock.now();
        h.input = now.ticks_ms;
        h.store.observe_page(PageSample {
            at: now,
            focused: true,
            ready: true,
            revision: config.revision,
            rule_id: Some(config.rules[(index + 1) % 2].id),
        });
        h.store
            .monitor_tick(
                NativeSample {
                    at: now,
                    last_input_ticks: now.ticks_ms,
                    chrome_foreground: true,
                    unlocked: true,
                    reliable: true,
                },
                now,
            )
            .unwrap();
        let snapshot = h.store.snapshot().unwrap();
        let record = snapshot.active.unwrap();
        assert_eq!(record.id, id);
        assert_eq!(record.category, "评测");
        assert!(!record.is_paused);
        assert!(snapshot.monitoring.start_candidate.is_none());
        assert!(snapshot.monitoring.away_pause_remaining_seconds.is_none());
        assert_eq!(snapshot.pending_count, 0);
    }
    h.store.finish(id).unwrap();
    assert_eq!(h.saved(id).duration_ms, 11_000);
    assert_eq!(h.store.pending_records().unwrap().len(), 1);
}

#[path = "idle_pause_tests.rs"]
mod idle_pause_tests;
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
.monitor-status-card h1 { margin:0 0 10px; font-size:1.15em; }
.monitor-status-card p { overflow-wrap:anywhere; }
.monitor-status-card > button { margin-top:12px; }
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
import { WorkForm, emptyWorkDraft } from "./WorkForm";
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
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [workDraft, setWorkDraft] = useState(emptyWorkDraft);
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
  const formOpen = switching || newTaskOpen;
  const switchValid = !!active?.is_paused && !active.recovery_pending && active.id === switchingFrom;
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
        {candidate && !active && !formOpen && (
          <section className="start-prompt" aria-label="开工确认">
            <WorkBadge
              category={candidate.category}
              presentation={presentation.current}
            />
            <strong>已识别工作页面</strong>
            <p>确认前不计时，工作量稍后填写。</p>
            <div>
              <button
                disabled={unavailable}
                onClick={() => {
                  void session.confirmWork(candidate.id);
                }}
              >
                开始记录
              </button>
              <button className="secondary" disabled={unavailable} onClick={() => setNewTaskOpen(true)}>新建任务</button>
            </div>
          </section>
        )}
        {!formOpen && !active && !candidate && (session.snapshot || !session.native) && (
          <section className="form-card monitor-status-card" aria-label="监测状态">
            <h1>{monitor?.browsing_only ? "仅浏览 · 当前不计时" : monitor?.enabled ? "等待识别工作页面" : "自动监测未启用"}</h1>
            <p role="status">{monitor?.message || "请在桌面应用中查看监测状态。"}</p>
            <p className="hint">工作页面出现新操作后，可在灵动岛确认开工；工作量稍后填写。</p>
            <button type="button" disabled={unavailable} onClick={() => setNewTaskOpen(true)}><Icon name="play" />新建任务</button>
          </section>
        )}
        {!formOpen && active && (
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
        {formOpen && (
          <section className="form-card new-task-page" aria-label={switching ? "切换任务" : "新建任务"}>
            {switching && !switchValid && <p className="notice" role="status">原任务状态已变化，请返回当前任务确认。填写内容仍保留。</p>}
            {!switching && active && <p className="notice" role="status">已有任务从其他入口开始，请返回当前任务。填写内容仍保留。</p>}
            {candidate && !active && <p className="hint">已识别{name(candidate.category)}工作页面；也可在灵动岛确认开始。手动填写内容仍保留。</p>}
            <WorkForm draft={workDraft} onDraftChange={setWorkDraft} minimal={compact} switching={switching} disabled={unavailable || (switching ? !switchValid : !!active)}
              starting={session.pending === "start_task"} onCancel={() => { setNewTaskOpen(false); setSwitchingFrom(null); setSwitchRequest(null); }}
              onStart={async input => {
                if (switching) {
                  if (!switchValid || !active) return false;
                  setSwitchRequest({input, id: switchingFrom, category: active.category});
                  return false;
                }
                if (active) return false;
                const saved = await session.start(input);
                if (saved) { setNewTaskOpen(false); setWorkDraft(emptyWorkDraft()); }
                return saved;
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
                        if (ok) { setSwitchRequest(null); setSwitchingFrom(null); setNewTaskOpen(false); setWorkDraft(emptyWorkDraft()); }
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

## E:\WorkMemo\src\MonitoringSettings.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {emit} from "@tauri-apps/api/event";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { CATEGORIES, type MonitorConfig } from "./types";
import {useLayout} from "./desktopPreferences";
import { Surface, useDraft } from "./Drafts";

type ConnectionStatus = { state: string; message: string; identifier: string; version: string; host_name: string; manifest_path: string | null; extension_path: string | null };

export function MonitoringSettings({ open, onClose, refreshVersion = 0 }: { open: boolean; onClose: () => void; refreshVersion?: number }) {
  const { name } = useCategoryNames();
  const compact=useLayout().current.density==="compact";
  const [connection, setConnection] = useState<ConnectionStatus | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [config, setConfig] = useState<MonitorConfig | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [baseline,setBaseline]=useState("");
  const [retry, setRetry] = useState(0);
  const nextRuleId = useRef(-1);
  const saving = useRef(false);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const readRevision = useRef(0);
  const dirty = !!config && JSON.stringify(config) !== baseline;
  const currentDraft = useRef({ dirty, busy });
  currentDraft.current = { dirty, busy };
  useEffect(() => {
    if (busy) return;
    const focused = restoreFocus.current;
    restoreFocus.current = null;
    if (focused?.isConnected && !document.hidden && document.activeElement === document.body && !document.querySelector("dialog[open]")) {
      focused.focus({ preventScroll: true });
    }
  }, [busy]);
  function addRule(category: string) {
    if (busy) return;
    const id = nextRuleId.current--;
    setConfig(previous => previous && previous.rules.length < 50 ? {
      ...previous, rules: [...previous.rules, {id, category, url_prefix: "", match_mode: "path_prefix"}],
    } : previous);
  }
  useEffect(() => {
    if (!open || !isTauri()) return;
    let stale = false;
    const request = ++readRevision.current;
    void invoke<ConnectionStatus>("get_connection_status").then(value => { if (!stale) setConnection(value); }).catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    // Keep the existing form mounted while a clean external refresh is in flight.
    void invoke<MonitorConfig>("get_monitor_config").then(value => {
      if (!stale && request === readRevision.current && !currentDraft.current.dirty && !saving.current) {
        setConfig(value); setBaseline(JSON.stringify(value)); setError("");
      }
    })
      .catch((failure: unknown) => { if (!stale) setError(String(failure)); });
    return () => { stale = true; };
  }, [open, retry, refreshVersion]);
  async function save(event?: FormEvent) {
    event?.preventDefault();
    if (!config || saving.current) return false;
    restoreFocus.current = document.activeElement instanceof HTMLElement && document.activeElement.closest("#monitor-form")
      ? document.activeElement : null;
    saving.current = true;
    readRevision.current++;
    setBusy(true); setError(""); setNotice("");
    try {
      const saved = await invoke<MonitorConfig>("save_monitor_config", { input: {
        enabled: config.enabled, expected_revision: config.revision, times: config.times,
        poll_interval_seconds: config.poll_interval_seconds, auto_resume_manual: config.auto_resume_manual,
        rules: config.rules.map(({ url_prefix, category, match_mode }) => ({ url_prefix, category, match_mode })),
      } });
      setConfig(saved); setBaseline(JSON.stringify(saved));setNotice("配置已保存。请在 Chrome 扩展中同步工作站点授权。");
      void emit("workmemo:data-changed", { source: "monitor-settings" }).catch((failure: unknown) => setNotice(`配置已保存，窗口同步失败：${String(failure)}`));
      return true;
    } catch (failure: unknown) { setError(String(failure));return false; }
    finally { saving.current = false; setBusy(false); }
  }
  useDraft("monitor",dirty,busy,()=>save(),()=>{if(baseline)setConfig(JSON.parse(baseline));});
  return <Surface onClose={onClose} title="自动工作监测" actions={<button form="monitor-form" type="submit" disabled={busy||!config}>{busy?"正在保存…":"保存监测配置"}</button>}>
    {!isTauri() && <p className="notice">请在 Windows 桌面程序中配置监测。</p>}
    {error && <p className="error-banner" role="alert">{error}</p>}
    {notice && <p className="notice" role="status">{notice}</p>}
    {!config && isTauri() && <button className="secondary" type="button" onClick={() => setRetry(value => value + 1)}>读取监测配置</button>}
    {isTauri() && <details className="monitor-diagnostics" open={!compact}><summary>浏览器连接与诊断</summary>
      <p role="status">{connection?.message ?? "正在检查本机连接…"}</p>
      {connection && <details><summary>连接详情</summary><p className="hint">版本 {connection.version} · {connection.identifier}<br />主机 {connection.host_name}<br />清单 {connection.manifest_path ?? "尚未就绪"}</p></details>}
      <button type="button" className="secondary" disabled={repairing} onClick={() => {
        setRepairing(true); setError("");
        void invoke<ConnectionStatus>("repair_browser_connection").then(setConnection).catch((failure: unknown) => setError(String(failure))).finally(() => setRepairing(false));
      }}>{repairing ? "正在修复…" : "修复本机连接"}</button>
      <button type="button" className="text-button" onClick={() => { void invoke("open_browser_extension").catch((failure: unknown) => setError(String(failure))); }}>打开配套扩展文件夹</button>
      <p className="hint">Chrome 扩展需加载一次本目录。EXE、ZIP 和源码版启动时均会检查并修复当前用户的本机主机注册。</p>
    </details>}
    {config && <form id="monitor-form" className="monitor-settings grid gap-4" onSubmit={(event) => { void save(event); }}>
      <label className="monitor-toggle"><input type="checkbox" checked={config.enabled} disabled={busy}
        onChange={event => setConfig({ ...config, enabled: event.target.checked })} />启用工作页面自动识别</label>
      <p className="hint">浏览器前台工作页面匹配且有新操作时提示开工，确认后才计时；仅浏览不计时。手动计时也受空闲保护。</p>
      <fieldset className="monitor-rule"><legend>识别与恢复</legend>
        <label>浏览器状态检查间隔（秒）<select value={config.poll_interval_seconds} disabled={busy}
          onChange={event => setConfig({ ...config, poll_interval_seconds: Number(event.target.value) })}>
          {[1, 2, 3, 4, 5].map(seconds => <option key={seconds} value={seconds}>{seconds} 秒</option>)}
        </select></label>
        <p className="hint">间隔越短，状态更新通常越快，也会增加少量后台活动。网络或系统忙碌时可能延迟。</p>
        <label className="monitor-toggle"><input type="checkbox" checked={config.auto_resume_manual} disabled={busy}
          onChange={event => setConfig({ ...config, auto_resume_manual: event.target.checked })} />返回工作页面并产生新操作后，自动恢复手动暂停的任务</label>
        <p className="hint">恢复原任务，不创建新记录；需要可信的页面连接和新的输入。关闭后需手动继续。</p>
      </fieldset>
      <details className="advanced-settings" open={!compact}><summary>计时参数（秒）</summary><fieldset className="monitor-rule"><legend className="sr-only">计时参数</legend>
        {([
          ["away_pause_seconds", "离开工作页面后继续计时"],
          ["hold_seconds", "暂停后保留记录"],
          ["idle_pause_seconds", "键鼠无操作后暂停"],
          ["idle_warning_seconds", "无输入后提醒"],
          ["idle_end_seconds", "无输入后结束"],
        ] as const).map(([key, label]) => <label key={key}>{label}<input type="number" min={1} max={86400} step={1} required disabled={busy}
          value={config.times[key]} onChange={event => setConfig({ ...config, times: { ...config.times, [key]: event.target.valueAsNumber } })} /></label>)}
        <p className="hint">每项 1 至 86400 秒；空闲暂停、空闲提醒均须早于空闲结束。空闲暂停扣除最后输入后的尾段；手动任务有新输入即恢复，自动任务须返回工作页面操作。离页宽限后暂停，再等待保留期结束记录。连接中断时不计入无法确认的时间；保留期同样适用。空闲结束可能更早发生。</p>
      </fieldset>
      </details>
      <section className="monitor-work-sites" aria-label="每项工作的多个网址">
        <h3>工作与网址</h3>
        <p className="hint">同一项工作可添加多个 URL，命中其中任意一个网站都属于工作页面。计时中切换这些网站会保留同一条记录，不重复开工。</p>
        {CATEGORIES.map(category => {
          const rules = config.rules.filter(rule => rule.category === category);
          return <details key={category} className="monitor-work-group" open={rules.length > 0} aria-label={`${name(category)}工作网址`}>
            <summary><strong>{name(category)}</strong><span>{rules.length} 个 URL</span></summary>
            <div className="monitor-work-urls">
              {rules.length === 0 && <p className="hint">还没有网址，添加这项工作需要使用的网站。</p>}
              {rules.map((rule, index) => <fieldset key={rule.id} className="monitor-rule">
                <legend>网址 {index + 1}</legend>
                <label>匹配模式<select disabled={busy} value={rule.match_mode ?? "path_prefix"} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, match_mode: event.target.value as typeof rule.match_mode } : item) })}>
                  <option value="path_prefix">路径前缀</option><option value="origin">整个站点</option><option value="domain_suffix">域名后缀（含子域名）</option>
                </select></label>
                <label>{rule.match_mode === "domain_suffix" ? "域名后缀" : "工作 URL"}<input type={rule.match_mode === "domain_suffix" ? "text" : "url"} required maxLength={2048} disabled={busy} value={rule.url_prefix}
                  placeholder={rule.match_mode === "domain_suffix" ? ".cn-beijing-vpc.fcapp.run" : "https://工作站点/路径"} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, url_prefix: event.target.value } : item) })} /></label>
                <label>归属工作<select value={rule.category} disabled={busy} onChange={event => setConfig({ ...config, rules: config.rules.map(item => item.id === rule.id ? { ...item, category: event.target.value } : item) })}>
                  {CATEGORIES.map(value => <option key={value} value={value}>{name(value)}</option>)}
                </select></label>
                <button type="button" className="text-button" disabled={busy} onClick={() => setConfig({ ...config, rules: config.rules.filter(item => item.id !== rule.id) })}>移除此 URL</button>
              </fieldset>)}
              <button type="button" className="secondary" disabled={busy || config.rules.length >= 50} onClick={() => addRule(category)}>为{name(category)}添加 URL</button>
            </div>
          </details>;
        })}
        <p className="hint">全部工作合计最多 50 条 URL；移除一个 URL 不影响同一工作下的其他网址。配置保存后，请在扩展中同步所有工作站点授权。</p>
      </section>
      <p className="hint">路径前缀限定站点与路径边界；整个站点覆盖该来源全部路径；域名后缀覆盖该域名与子域名，例如 .cn-beijing-vpc.fcapp.run。查询参数和片段不参与匹配。保存监测配置会暂停当前自动记录；重新确认工作页面并产生新的输入后才会恢复。</p>

      <details><summary>连接与隐私说明</summary>
        <p className="hint">第一版配套 Chrome 扩展。安装扩展和本机通信主机后，在扩展面板同步已配置站点授权。只传规则标识、前台匹配状态、连接状态和页面活动信号；不传 URL、网页内容或输入文本。连接断开时暂停自动累计。</p>
        <p className="hint">离开工作页面后按设置暂停并保留记录。空闲结束时扣除最后输入后的尾段，阅读或思考可能少计，可稍后人工修正。</p>
      </details>
    </form>}
  </Surface>;
}
~~~~~~

## E:\WorkMemo\src\NotificationApp.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { usePresentation, WorkBadge, useDashboard } from "./desktopPreferences";
import { Icon } from "./Icon";
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { useAppearance } from "./useAppearance";
import { useWorkSession } from "./useWorkSession";
import { themeStyle } from "./themes";
import { formatDuration, type WorkNotice, type WorkRecord } from "./types";
import { DraftContext, type Draft } from "./Drafts";
import { SettlementForm } from "./SettlementPanel";
import { IslandExpansion } from "./IslandExpansion";
import { islandView } from "./islandView";
import "./App.css";

export function NotificationApp() {
  const session = useWorkSession();
  const snapshot = session.snapshot;
  const appearance = useAppearance();
  const { name } = useCategoryNames();
  const presentation = usePresentation();
  const dashboard = useDashboard();
  const [notice, setNotice] = useState<WorkNotice | null>(null);
  const [editing, setEditing] = useState<WorkRecord | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");
  const draft = useRef<Draft | null>(null);
  const editingRef = useRef(editing); editingRef.current = editing;
  const revision = useRef(0);
  const seen = useRef("");
  const busy = session.busy || deferring;
  const [dirty, setDirty] = useState(false);
  const registerDraft = useCallback((_id: string, value: Draft | null) => {
    draft.current = value; setDirty(!!value?.dirty);
  }, []);
  useEffect(() => {
    void invoke("set_window_dirty", { dirty: dirty || busy }).catch(e => setError(String(e)));
  }, [dirty, busy]);
  useEffect(() => () => { void invoke("set_window_dirty", { dirty: false }).catch(() => {}); }, []);
  useEffect(() => {
    let stopped = false, reading = false;
    async function refresh() {
      if (reading) return;
      reading = true;
      const request = revision.current;
      try {
        const value = await invoke<WorkNotice | null>("get_notice");
        if (!stopped && request === revision.current) { setNotice(value); setReadError(""); }
      } catch (e) { if (!stopped) setReadError(String(e)); }
      finally { reading = false; }
    }
    void refresh();
    const timer = setInterval(() => { void refresh(); }, 1000);
    const unlisten = listen("workmemo:appearance-changed", () => { void appearance.reload(); });
    return () => { stopped = true; clearInterval(timer); void unlisten.then(fn => fn()); };
  }, [appearance.reload]);
  const { active, candidate, notice: visibleNotice, key } = islandView(snapshot, notice);
  useEffect(() => {
    if (key === seen.current) return;
    seen.current = key;
    if (key && !editingRef.current) setExpanded(true);
    if (!key && !editingRef.current) setExpanded(false);
  }, [key]);
  const monitor = snapshot?.monitoring;
  const state = monitor?.browsing_only
    ? monitor.browse_ready
      ? "工作页面已就绪"
      : "仅浏览 · 当前不计时"
    : candidate
      ? "准备开始工作？"
      : active?.recovery_pending
        ? "上次工作待恢复"
        : active?.pause_reason === "MANUAL"
          ? "手动暂停 · 已停表"
          : active?.pause_reason === "IDLE_PAUSE" ? "键鼠空闲暂停" : active?.pause_reason === "AWAY"
            ? "离页暂停 · 已停表"
            : active?.pause_reason === "MONITOR"
              ? "监测中断 · 已停表"
              : active?.is_paused
                ? "已暂停 · 已停表"
                : snapshot?.monitoring.idle_warning
                  ? "空闲提醒 · 暂计"
                  : snapshot?.monitoring.away_pause_remaining_seconds != null
                    ? `离页宽限 · ${formatDuration(snapshot.monitoring.away_pause_remaining_seconds)} 后暂停`
                    : active?.control_mode === "AUTO"
                      ? "自动记录中 · 暂计"
                      : "手动计时 · 暂计";

  async function later(force = false) {
    if (busy) return;
    if (draft.current?.dirty && !force) { setDiscard(true); return; }
    setDeferring(true); setError("");
    try {
      if (editing) await invoke("defer_notice", { id: editing.id, kind: "ended" });
      else if (visibleNotice) await invoke("defer_notice", { id: visibleNotice.record.id, kind: visibleNotice.kind });
      revision.current++;
      if (!editing || notice?.record.id === editing.id) setNotice(null);
      setDiscard(false); setExpanded(false);
      setDirty(false);
    } catch (e) { setError(String(e)); }
    finally { setDeferring(false); }
  }
  const latestLater = useRef(later); latestLater.current = later;
  const busyRef = useRef(busy); busyRef.current = busy;
  useEffect(() => {
    const unlisten = listen("workmemo:request-close", () => {
      if (busyRef.current) { setError("正在保存，请稍候。"); return; }
      void latestLater.current();
    });
    return () => { void unlisten.then(fn => fn()); };
  }, []);
  const combinedError = error || session.commandError || session.connectionError || readError;
  return <div className="desktop-frame island-frame" style={themeStyle(appearance.current)}>
    <div className="app-shell island-shell">
      <div className="island-main-row">
        <div className="island-drag" role="group" aria-label="拖动状态岛" onMouseDown={event => {
          if (event.button === 0) void getCurrentWindow().startDragging().then(() => invoke("fit_island_position")).catch(e => setError(String(e)));
        }}>
          {active || candidate || monitor?.browse_category ? <WorkBadge category={active?.category ?? candidate?.category ?? monitor?.browse_category ?? "开发"} presentation={presentation.current} showName={false} /> : <span className="work-symbol"><Icon name="read" /></span>}
          <span className="island-info"><strong>{active ? name(active.category) : candidate ? name(candidate.category) : visibleNotice?.kind === "ended" ? "工作已结束" : "仅浏览"}</strong>
            <small>{snapshot ? visibleNotice?.kind === "ended" ? "结果已保存 · 待填写工作量" : state : "状态不可用"}</small></span>
          {active && <strong className="island-time">{formatDuration(active.duration_seconds)}</strong>}
        </div>
        {candidate && <button type="button" className="island-action" aria-label="开始识别的工作" title={`开始记录 · ${name(candidate.category)}`} disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}><Icon name="play" /></button>}
        {!candidate && active && !monitor?.browsing_only && <button type="button" className="island-action" aria-label={active.is_paused ? "继续记录" : "暂停记录"} disabled={busy || !!session.connectionError || active.recovery_pending} onClick={() => { void (active.is_paused ? session.resume(active.id) : session.pause(active.id)); }}><Icon name={active.is_paused ? "play" : "pause"} /></button>}
        {!candidate && monitor?.browsing_only && <button type="button" className="island-action" aria-label={active ? "继续记录" : "开始记录"} disabled={busy || !monitor.browse_ready || !!active?.recovery_pending || !!session.connectionError} onClick={() => { void session.confirmWork(null); }}><Icon name="play" /></button>}
        {(visibleNotice || candidate || editing || combinedError || (snapshot?.pending_count ?? 0) > 0) && <button type="button" className="island-action island-expand" aria-label={expanded ? "收起展开区域" : "展开工作提醒"} onClick={() => {
          if (expanded && editing) { void later(); return; }
          setExpanded(value => !value);
        }}><Icon name={expanded ? "left" : "right"} /></button>}
        <button type="button" className="island-open" aria-label="打开WorkMemo" onClick={() => { void invoke("show_main", {settlement:false}).catch(e => setError(String(e))); }}><Icon name="open" /></button>
      </div>
      <IslandExpansion open={expanded} onError={setError} onCollapsed={() => { setEditing(null); setDiscard(false); setDirty(false); }}>
        {dashboard.fallback}
        {combinedError && <p className="inline-error" role="alert">{combinedError}</p>}
        {editing ? <>
          <h2>填写工作量 · {name(editing.category)}</h2>
          {discard && <div className="island-discard" role="alert"><p>放弃本次未保存的填写？原记录仍在待补全列表。</p><button type="button" disabled={busy} onClick={() => { void later(true); }}>放弃填写并收起</button><button type="button" className="secondary" onClick={() => setDiscard(false)}>继续填写</button></div>}
          <DraftContext.Provider value={registerDraft}><SettlementForm compact key={editing.id} record={editing} busy={busy}
            onSave={async input => {
              const saved = await session.settle(input);
              if (saved) {
                revision.current++;
                setNotice(current => current?.record.id === input.id ? null : current);
                setDirty(false); setExpanded(false);
              }
              return saved;
            }} /></DraftContext.Provider>
          <button className="text-button" type="button" disabled={busy} onClick={() => { void later(); }}>稍后填写</button>
          {session.commandError && <button className="text-button" type="button" onClick={() => { void dashboard.open("pending"); }}>打开待补全列表核对</button>}
        </> : candidate ? <section aria-label="开工确认"><h2>开始记录 · {name(candidate.category)}</h2><p>已匹配工作网址，确认前不计时。</p><div className="island-buttons"><button disabled={busy || !!session.connectionError} onClick={() => { void session.confirmWork(candidate.id); }}>开始记录</button><button className="secondary" disabled={busy} onClick={() => { void session.browse(); }}>仅浏览</button></div></section> : visibleNotice?.kind === "ended" ? <section aria-label="工作结束提醒">
          <h2>本次工作已结束</h2><p>{name(visibleNotice.record.category)} · 有效工时 {formatDuration(visibleNotice.record.duration_seconds)}</p>
          <p>结果已保存，工作量可稍后填写。</p>
          <div className="island-buttons"><button type="button" disabled={busy || !!session.connectionError} onClick={() => { setEditing(visibleNotice.record); setExpanded(true); }}>填写工作量</button><button className="secondary" type="button" disabled={busy} onClick={() => { void later(); }}>稍后</button></div>
        </section> : visibleNotice?.kind === "idle" ? <section aria-label="空闲提醒">
          <h2>空闲提醒</h2><p>连续 {formatDuration(visibleNotice.idle_warning_seconds)} 无输入；到达 {formatDuration(visibleNotice.idle_end_seconds)} 时结束计时，最后输入后的尾段不计入工时。</p>
          <button type="button" disabled={busy} onClick={() => { void later(); }}>知道了</button>
        </section> : null}
        {!editing && (snapshot?.pending_count ?? 0) > 0 && <button type="button" className="text-button" onClick={() => { void dashboard.open("pending"); }}>待补全 {snapshot?.pending_count}</button>}
      </IslandExpansion>
      {combinedError && !expanded && <span className="island-error" role="alert" aria-label={combinedError} title={combinedError}>!</span>}
    </div>
  </div>;
}
~~~~~~

## E:\WorkMemo\src\PanelApp.tsx

~~~~~~tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { DesktopWindow } from "./DesktopWindow";
import { DraftContext, Surface, type Draft, useDraft } from "./Drafts";
import { AppearanceSettings } from "./AppearanceSettings";
import { MonitoringSettings } from "./MonitoringSettings";
import { useAppearance } from "./useAppearance";
import { themeStyle } from "./themes";
import { DraftController } from "./draftController";
import { UiDialog } from "./UiDialog";
import {
  useLayout,
  usePresentation,
  layoutStyle,
  useDashboard,
} from "./desktopPreferences";
import { VisualSettings, LayoutPanel } from "./SettingsExtras";

type Report = {
  source: string | null;
  conflict_ids: number[];
  skipped_active_ids: number[];
  records: number;
  pending: number;
  active: number;
  imported: number;
  duplicates: number;
  conflicts: number;
  skipped_active: number;
  backup: string | null;
};
function DataPanel({ onClose }: { onClose: () => void }) {
  const dashboard = useDashboard();
  const [demoConfirm, setDemoConfirm] = useState(false);
  async function demo(command: string) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const count = await invoke<number>(command);
      setMessage(
        command === "seed_demo_data"
          ? `演示数据已准备：${count}条。真实统计仍与演示分开。`
          : `已清理${count}条演示记录，真实记录保留。`,
      );
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  const [report, setReport] = useState<Report | null>(null);
  const [restoreInfo, setRestoreInfo] = useState<Report | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [include, setInclude] = useState(false);
  const [action, setAction] = useState<"import" | "restore" | null>(null);
  useDraft(
    "data-operation",
    false,
    busy,
    async () => false,
    () => {},
  );
  async function run(command: string, args?: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<Report | string | null>(command, args);
      if (command === "preview_migration") {
        setReport(result as Report | null);
        setMessage(result ? "请核对预览记录后确认导入。" : "未发现预览数据。");
      } else if (command === "inspect_backup") {
        if (result) {
          setRestoreInfo(result as Report);
          setAction("restore");
        }
      } else if (command === "import_preview") {
        const r = result as Report;
        setMessage(
          `导入 ${r.imported}，重复跳过 ${r.duplicates}，冲突 ${r.conflicts}，未结束冲突 ${r.skipped_active}（${r.skipped_active_ids.join(",")}），冲突记录 ${r.conflict_ids.join(",")}。备份：${r.backup}`,
        );
      } else if (result) setMessage(String(result));
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (isTauri()) void run("preview_migration");
  }, []);
  return (
    <Surface title="数据管理" onClose={onClose}>
      <h3>演示数据</h3>
      <p className="hint">
        用于查看图表效果，明确标记并与真实统计分开。重复生成不会增加重复记录。
      </p>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void demo("seed_demo_data");
          }}
        >
          生成演示数据
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            void dashboard.open("all", "demo");
          }}
        >
          查看演示效果
        </button>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => setDemoConfirm(true)}
        >
          清理演示数据…
        </button>
      </div>
      {dashboard.fallback}
      <UiDialog
        open={demoConfirm}
        onClose={() => setDemoConfirm(false)}
        title="清理演示数据"
        id="clear-demo"
      >
        <p>只删除标记为演示的已结束记录。真实工作记录和当前任务保留。</p>
        <div className="settings-actions">
          <button className="secondary" onClick={() => setDemoConfirm(false)}>
            取消
          </button>
          <button
            onClick={() => {
              setDemoConfirm(false);
              void demo("clear_demo_data");
            }}
          >
            清理演示记录
          </button>
        </div>
      </UiDialog>
      <h3>从预览版迁移</h3>
      <p className="hint">
        先从托盘退出预览版。正式版原记录保留，重复导入会跳过；已导入记录有变化时列为冲突。两边都有未结束任务时，冲突任务留在原处。
      </p>
      {report && (
        <p>
          来源：{report.source}
          <br />
          记录 {report.records} · 待补全 {report.pending} · 未结束{" "}
          {report.active}
        </p>
      )}
      <label>
        <input
          type="checkbox"
          checked={include}
          disabled={busy}
          onChange={(e) => setInclude(e.target.checked)}
        />
        同时导入预览监测配置（默认保留正式配置；导入后先保持监测关闭）
      </label>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("preview_migration");
          }}
        >
          重新检查
        </button>
        <button disabled={busy || !report} onClick={() => setAction("import")}>
          备份并合并预览记录
        </button>
      </div>
      <h3>备份与恢复</h3>
      <p className="hint">
        完整备份包含工作数据库、监测配置、外观及布局，不含连接令牌和浏览器注册。恢复会整体替换当前快照，恢复前自动备份原数据；正在计时时请先暂停。
      </p>
      <div className="data-buttons">
        <button
          disabled={busy}
          onClick={() => {
            void run("create_backup");
          }}
        >
          创建备份…
        </button>
        <button
          disabled={busy}
          className="secondary"
          onClick={() => {
            void run("inspect_backup");
          }}
        >
          从备份恢复…
        </button>
      </div>
      {busy && <p role="status">正在处理，请勿退出…</p>}
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}
      <UiDialog
        open={action !== null}
        onClose={() => setAction(null)}
        title="确认数据操作"
        id="confirm-data"
      >
        <p>
          {action === "import"
            ? "先备份当前数据，再合并预览记录；不会覆盖正式记录。"
            : `将从 ${restoreInfo?.backup} 恢复记录 ${restoreInfo?.records} 条（待补全 ${restoreInfo?.pending}，未结束 ${restoreInfo?.active}），替换当前数据。原数据会先自动备份。`}
        </p>
        <div className="settings-actions">
          <button className="secondary" onClick={() => setAction(null)}>
            取消
          </button>
          <button
            onClick={() => {
              const a = action;
              setAction(null);
              void run(
                a === "import" ? "import_preview" : "restore_backup",
                a === "import" ? { includeConfig: include } : undefined,
              );
            }}
          >
            确认并{action === "import" ? "导入" : "恢复备份"}
          </button>
        </div>
      </UiDialog>
    </Surface>
  );
}
export function PanelApp({ panel }: { panel: string }) {
  const layout = useLayout();
  const presentation = usePresentation();
  const appearance = useAppearance();

  const [section, setSection] = useState(
    new URLSearchParams(window.location.search).get("section") ?? "monitor",
  );
  const [version, setVersion] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(false);
  const [saving, setSaving] = useState(false);
  const drafts = useRef(new DraftController());
  const registry = { current: drafts.current.entries };
  const next = useRef<(() => void) | null>(null);
  const register = useCallback((id: string, d: Draft | null) => {
    if (d) registry.current.set(id, d);
    else registry.current.delete(id);
    const dirty = [...registry.current.values()].some((x) => x.dirty || x.busy);
    setHasDraft(dirty);
    if (isTauri())
      void invoke("set_window_dirty", { dirty }).catch((e) =>
        setError(String(e)),
      );
  }, []);
  const change = useCallback((action: () => void) => {
    if (drafts.current.busy) {
      return;
    }
    if (next.current) return;
    if ([...registry.current.values()].some((d) => d.dirty)) {
      next.current = action;
      setDecision(true);
    } else action();
  }, []);
  const close = useCallback(
    () =>
      change(() => {
        void invoke("close_panel").catch((e) => setError(String(e)));
      }),
    [change],
  );
  async function saveAll() {
    if (drafts.current.busy) return;
    if (!drafts.current.dirty) {
      const action = next.current; next.current = null; setDecision(false); action?.();
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (!(await drafts.current.save())) { setError("保存未完成，请继续编辑并查看表单错误。"); return; }
      setDecision(false);
      const action = next.current;
      next.current = null;
      action?.();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.querySelector("dialog[open]")) return;
        e.preventDefault();
        close();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!e.repeat) void saveAll();
      }
    };
    window.addEventListener("keydown", key);
    const unsubs: Promise<() => void>[] = [];
    if (isTauri()) {
      unsubs.push(listen("workmemo:request-close", close));
      unsubs.push(
        listen<string>("workmemo:settings-section", (e) =>
          change(() =>
            setSection(
              ["appearance", "layout", "data", "visuals"].includes(e.payload)
                ? e.payload
                : "monitor",
            ),
          ),
        ),
      );
      unsubs.push(
        listen<{ source?: string } | null>("workmemo:data-changed", ({ payload }) => {
          if (payload?.source === "monitor-settings") return;
          if (!drafts.current.dirty && !drafts.current.busy && !next.current)
            setVersion((v) => v + 1);
        }),
      );
      unsubs.push(
        listen("workmemo:appearance-changed", () => {
          if (!drafts.current.dirty && !drafts.current.busy && !next.current)
            void appearance.reload();
        }),
      );
    }
    return () => {
      window.removeEventListener("keydown", key);
      for (const p of unsubs) void p.then((f) => f());
    };
  }, [change, close]);
  return (
    <DraftContext.Provider value={register}>
      <DesktopWindow
        density={layout.current.density}
        background={presentation.current.background}
        appearanceStyle={{
          ...themeStyle(appearance.current),
          ...layoutStyle(layout.current),
        }}
        navigation={
          <nav aria-label="二级窗口">
            <strong>
              {panel === "settings"
                ? "设置"
                : panel === "history"
                  ? "历史与统计"
                  : "待补全"}
            </strong>
          </nav>
        }
      >
        <div className="panel-app">
          {panel === "settings" && (
            <nav className="settings-tabs">
              {[
                ["appearance", "外观"],
                ["visuals", "工作名称与外观"],
                ["monitor", "监测"],
                ["layout", "布局"],
                ["data", "数据管理"],
              ].map(([id, label]) => (
                <button
                  className="secondary"
                  aria-pressed={section === id}
                  key={id}
                  onClick={() => change(() => setSection(id))}
                >
                  {label}
                </button>
              ))}
            </nav>
          )}
          {error && (
            <p role="alert" className="error-banner">
              {error}
            </p>
          )}
          {hasDraft && (
            <p className="draft-indicator">有未保存修改 · Ctrl+S 保存</p>
          )}
          {section === "appearance" ? (
            <AppearanceSettings
              appearance={appearance}
              presentation={presentation}
              onClose={close}
            />
          ) : section === "visuals" ? (
            <VisualSettings presentation={presentation} />
          ) : section === "monitor" ? (
            <MonitoringSettings
              refreshVersion={version}
              open
              onClose={close}
            />
          ) : section === "layout" ? (
            <LayoutPanel />
          ) : (
            <DataPanel onClose={close} />
          )}
          <UiDialog
            open={decision}
            closeDisabled={saving}
            onClose={() => {
              if (drafts.current.busy) return;
              next.current = null;
              setDecision(false);
            }}
            title="保留未保存的修改？"
            id="draft-decision"
          >
            <p>保存成功后再离开；放弃只撤销本次输入，不删除已保存记录。</p>
            {error && <p className="error-banner" role="alert">{error}</p>}
            <div className="settings-actions">
              <button
                disabled={saving}
                onClick={() => {
                  void saveAll();
                }}
              >
                保存并继续
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  if (!drafts.current.discard()) return;
                  setDecision(false);
                  const action = next.current;
                  next.current = null;
                  action?.();
                }}
              >
                放弃修改
              </button>
              <button
                disabled={saving}
                className="secondary"
                onClick={() => {
                  next.current = null;
                  setDecision(false);
                }}
              >
                继续编辑
              </button>
            </div>
          </UiDialog>
        </div>
      </DesktopWindow>
    </DraftContext.Provider>
  );
}
~~~~~~

## E:\WorkMemo\src\UiDialog.tsx

~~~~~~tsx
import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

/** Presentation-only dialogs keep Escape, focus trapping and focus restoration native. */
export function UiDialog({ open, onClose, title, id, children, closeDisabled = false }: {
  open: boolean; onClose: () => void; title: string; id: string; children: ReactNode; closeDisabled?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current?.close();
  }, [open]);
  return <dialog ref={dialog} className="ui-dialog" aria-labelledby={id}
    onCancel={(event) => { event.preventDefault(); if (!closeDisabled) onClose(); }}>
    <div className="settings-heading">
      <h2 id={id}>{title}</h2>
      <button className="window-control" type="button" aria-label={`关闭${title}`} disabled={closeDisabled} onClick={onClose}><Icon name="close" /></button>
    </div>
    {children}
  </dialog>;
}
~~~~~~

## E:\WorkMemo\src\WorkForm.tsx

~~~~~~tsx
import { useCategoryNames } from "./categoryNames";
import { useId, useRef, useState, type FormEvent } from "react";
import { CATEGORIES, type StartInput } from "./types";
import { validateWorkInput, type InputErrors } from "./workInput";
import { Icon } from "./Icon";

interface Props {
  draft: WorkFormDraft;
  onDraftChange: (draft: WorkFormDraft) => void;
  disabled: boolean;
  minimal?: boolean;
  switching?: boolean;
  starting?: boolean;
  onCancel?: () => void;
  onStart: (input: StartInput) => Promise<boolean>;
}

export interface WorkFormDraft { category: string; quantity: string; remark: string }
export const emptyWorkDraft = (): WorkFormDraft => ({ category: "", quantity: "", remark: "" });

export function WorkForm({
  draft,
  onDraftChange,
  minimal: _minimal = false,
  disabled,
  switching = false,
  starting = false,
  onStart,
  onCancel,
}: Props) {
  const { name } = useCategoryNames();
  const { category, quantity, remark } = draft;
  const [errors, setErrors] = useState<InputErrors>({});
  const id = useId();
  const categoryRef = useRef<HTMLSelectElement>(null);
  const quantityRef = useRef<HTMLInputElement>(null);
  const remarkRef = useRef<HTMLTextAreaElement>(null);

  function clearError(field: keyof StartInput) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (disabled) return;
    const result = validateWorkInput(category, quantity, remark);
    if (!result.ok) {
      setErrors(result.errors);
      (result.errors.category
        ? categoryRef
        : result.errors.quantity
          ? quantityRef
          : remarkRef
      ).current?.focus();
      return;
    }
    setErrors({});
    await onStart(result.input);
  }

  return (
    <form
      className="work-form"
      aria-busy={starting}
      onSubmit={(event) => {
        void submit(event);
      }}
      noValidate
    >
      <div className="category-field">
        <span className="category-field-symbol" aria-hidden="true"><Icon name="list" /></span>
        <label>
          <span className="sr-only">工作类别</span>
          <select
            aria-label="工作类别"
            ref={categoryRef}
            value={category}
            disabled={disabled}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={errors.category ? `${id}-category` : undefined}
            onChange={(event) => {
              onDraftChange({ ...draft, category: event.target.value });
              clearError("category");
            }}
          >
            <option value="">选择工作类别</option>
            {CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {name(value)}
              </option>
            ))}
          </select>
          {errors.category && (
            <span id={`${id}-category`} className="field-error" role="alert">
              {errors.category}
            </span>
          )}
        </label>
      </div>
      <div className="work-input-row">
        <label>
          工作量（可稍后填写）
          <input
            ref={quantityRef}
            type="number"
            inputMode="decimal"
            min="0"
            max="1000000000"
            step="any"
            placeholder="结束后填写；0 表示无产出"
            value={quantity}
            disabled={disabled}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? `${id}-quantity` : undefined}
            onChange={(event) => {
              onDraftChange({ ...draft, quantity: event.target.value });
              clearError("quantity");
            }}
          />
          {errors.quantity && (
            <span id={`${id}-quantity`} className="field-error" role="alert">
              {errors.quantity}
            </span>
          )}
        </label>
        <label>
          <span>备注（选填）</span>
          <textarea
            ref={remarkRef}
            rows={1}
            maxLength={4000}
            placeholder="添加备注（可选）"
            value={remark}
            disabled={disabled}
            aria-invalid={Boolean(errors.remark)}
            aria-describedby={`${id}-remark-count${errors.remark ? ` ${id}-remark` : ""}`}
            onChange={(event) => {
              onDraftChange({ ...draft, remark: event.target.value });
              clearError("remark");
            }}
          />
          <span id={`${id}-remark-count`} className="field-count">
            {Array.from(remark.trim()).length} / 2000
          </span>
          {errors.remark && (
            <span id={`${id}-remark`} className="field-error" role="alert">
              {errors.remark}
            </span>
          )}
        </label>
      </div>
      {switching && <p className="switch-hint">开始后会保存上一项为待补全记录。</p>}
      <button type="submit" className="start-work" disabled={disabled}>
        <Icon name="play" />
        <span>{starting ? "正在开始…" : "开始工作"}</span>
      </button>
      {onCancel && <button type="button" className="cancel-switch" disabled={starting} onClick={onCancel}><Icon name="left" />{switching ? "取消切换" : "返回监测状态"}</button>}
    </form>
  );
}
~~~~~~

## E:\WorkMemo\src\islandView.ts

~~~~~~typescript
import type { Snapshot, WorkNotice } from "./types.ts";

/** Old settlement reminders never mask a new candidate or an active task. */
export function islandView(snapshot: Snapshot | null, storedNotice: WorkNotice | null) {
  const active = snapshot?.active ?? null;
  const candidate = active ? null : snapshot?.monitoring.start_candidate ?? null;
  const notice = candidate ? null : storedNotice?.kind === "idle"
    ? active?.id === storedNotice.record.id ? storedNotice : null
    : active ? null : storedNotice;
  const key = candidate ? `candidate:${candidate.id}` : notice ? `${notice.kind}:${notice.record.id}` : "";
  return { active, candidate, notice, key };
}
~~~~~~

## E:\WorkMemo\tests\island.test.mjs

~~~~~~javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { islandView } from '../src/islandView.ts';

test('new candidate masks old settlement and disappears on confirmed active work', () => {
  const old = { kind: 'ended', record: { id: 1 } };
  const snapshot = { active: null, monitoring: { start_candidate: { id: 2, category: '开发' } } };
  assert.equal(islandView(snapshot, old).key, 'candidate:2');
  assert.equal(islandView(snapshot, old).notice, null);
  assert.equal(old.record.id, 1);
  snapshot.active = { id: 3 };
  const active = islandView(snapshot, old);
  assert.equal(active.active.id, 3);
  assert.equal(active.candidate, null);
  assert.equal(active.notice, null);
  assert.equal(active.key, '');
  snapshot.active = null; snapshot.monitoring.start_candidate = null;
  assert.equal(islandView(snapshot, old).key, 'ended:1');
});

test('idle warnings belong to the current active record only', () => {
  const notice = { kind: 'idle', record: { id: 1 } };
  assert.equal(islandView({ active: { id: 1 }, monitoring: {} }, notice).key, 'idle:1');
  assert.equal(islandView({ active: { id: 2 }, monitoring: {} }, notice).notice, null);
  assert.equal(islandView(null, notice).notice, null);
});
~~~~~~
