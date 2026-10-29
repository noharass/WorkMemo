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
  await dashboard.route('**/api/**',async route=>{
    const endpoint=new URL(route.request().url()).pathname.split('/').at(-1);
    if(endpoint==='meta')return route.fulfill({json:{version:'0.2.2',active:null,category_names:await dashboard.evaluate(()=>JSON.parse(localStorage.getItem('qa-names')))}});
    if(endpoint==='detail')return route.fulfill({json:{record:dashboardRecord,segments:[],revisions:[]}});
    if(endpoint==='query'){
      queries.push(JSON.parse(route.request().postData()));
      return route.fulfill({json:{totals:{duration_ms:10000,quantity:0,records:1,pending:0},trend:[],monthly:false,categories:[{category:'开发',duration_ms:10000,quantity:0,records:1}],calendar:[],records:[dashboardRecord],page:1,pages:1,scope:'real'}});
    }
    return route.fulfill({json:{saved:true}});
  });
  await dashboard.goto('http://127.0.0.1:1420/dashboard#token=isolated-rename-fixture');
  await dashboard.locator('td .work-badge').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.locator('select').filter({has:dashboard.locator('option[value="开发"]')}).first().selectOption('开发');
  await dashboard.getByRole('button',{name:'应用筛选'}).click();
  await dashboard.waitForTimeout(100);
  assert.equal(queries.at(-1).category,'开发');
  await dashboard.getByRole('button',{name:'详情',exact:true}).click();
  await dashboard.locator('.dc-record-summary .work-badge').filter({hasText:'第一窗口更新'}).waitFor();
  await dashboard.getByRole('button',{name:'编辑工作量',exact:true}).click();
  assert.equal(await dashboard.locator('#dc-editor select').inputValue(),'开发');
  assert.equal(await dashboard.locator('#dc-editor option[value="开发"]').textContent(),'第一窗口更新');
  assert.deepEqual(errors,[]);
  await writeFile(new URL('phase1-ui-result.json',output),JSON.stringify({renameSave:true,failedSavePreservesInput:true,multiWindowConflict:true,explicitReload:true,stableSelectIdentity:true,monitorGroupName:true,idlePauseSetting:true,dashboardNameAndStableFilter:true,widths:[390,780],pageErrors:errors},null,2));
  console.log('v0.2.3 phase 1 UI regressions passed; isolated IPC fixtures only.');
} finally {await browser.close();}
