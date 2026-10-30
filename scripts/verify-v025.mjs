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
      if(command==='get_today_workload'){if(p.get('stats')==='loading')await new Promise(r=>setTimeout(r,1500));if(p.get('stats')==='error')throw Error('隔离统计读取失败');return q.stats;}
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
const results=[];
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
  await writeFile(new URL('ui-result.json',output),JSON.stringify({isolated:true,native:false,results,errors},null,2));
  console.log(`v0.2.5: ${results.length} interaction groups passed; 24 theme/density/width layouts; fixtures only.`);
} catch(e) {await screenshot('failure');await writeFile(new URL('failure.json',output),JSON.stringify({errors,html:await page.content(),qa:await page.evaluate(()=>window.qa)},null,2));throw e;} finally {await browser.close();}
