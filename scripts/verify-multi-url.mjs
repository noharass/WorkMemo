// Isolated settings UI/IPC fixture. Never connects to a user database.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const {chromium} = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.2/qa/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:720,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
    window.isTauri=true;
    const initial={enabled:true,revision:3,times:{idle_pause_seconds:120,away_pause_seconds:120,hold_seconds:600,idle_warning_seconds:300,idle_end_seconds:420},poll_interval_seconds:1,auto_resume_manual:true,rules:[{id:1,category:'评测',match_mode:'origin',url_prefix:'https://moonshot.feishu.cn/'}]};
    window.qaConfig=JSON.parse(sessionStorage.getItem('qa-config')??JSON.stringify(initial));
    window.qaFail=false;window.qaSaves=[];
    window.__TAURI_EVENT_PLUGIN_INTERNALS__={unregisterListener(){}};
    window.__TAURI_INTERNALS__={metadata:{currentWindow:{label:'settings'},currentWebview:{label:'settings'}},transformCallback(){return 1;},unregisterCallback(){},invoke:async(command,args)=>{
      if(command==='get_category_names') return {revision:0,names:Object.fromEntries(['评测','质检','开发','文档'].map(key=>[key,key]))};
      if(command==='get_appearance') return {version:1,theme:'cream',opacity:94};
      if(command==='get_layout_settings') return {density:'compact',revision:0,sound_enabled:true,font_size:14,font_weight:400,line_spacing:'standard'};
      if(command==='get_presentation') return {version:1,categories:{'评测':{icon:'checkSquare',color:'#447cba'},'质检':{icon:'safety',color:'#e6a23c'},'开发':{icon:'code',color:'#8b5cf6'},'文档':{icon:'note',color:'#44aa88'}},background:null};
      if(command==='get_connection_status') return {state:'ready',message:'Isolated UI fixture',identifier:'com.workmemo.test.fixture',version:'0.2.2',host_name:'fixture',manifest_path:null,extension_path:null};
      if(command==='get_monitor_config') return JSON.parse(JSON.stringify(window.qaConfig));
      if(command==='save_monitor_config'){
        window.qaSaves.push(args.input);
        if(window.qaFail) throw new Error('测试保存失败，请重试');
        window.qaConfig={...args.input,revision:window.qaConfig.revision+1,rules:args.input.rules.map((r,i)=>({...r,id:i+1}))};
        sessionStorage.setItem('qa-config',JSON.stringify(window.qaConfig));
        return JSON.parse(JSON.stringify(window.qaConfig));
      }
      return null;
    }};
  });
  await page.goto('http://127.0.0.1:1420/?panel=settings&section=monitor');
  const group=page.locator('.monitor-work-group[aria-label="评测工作网址"]');
  await group.getByText('1 个 URL',{exact:true}).waitFor();
  await group.getByRole('button',{name:'为评测添加 URL'}).click();
  const second=group.locator('fieldset').nth(1);
  await second.getByLabel('匹配模式').selectOption('domain_suffix');
  await second.getByLabel('域名后缀',{exact:true}).fill('.cn-beijing-vpc.fcapp.run');
  await group.getByText('2 个 URL',{exact:true}).waitFor();
  // Rapid additions must keep separate React keys and remove only the chosen URL.
  await group.getByRole('button',{name:'为评测添加 URL'}).evaluate(button=>{button.click();button.click();});
  assert.equal(await group.locator('fieldset').count(),4);
  await group.locator('fieldset').nth(3).getByRole('button',{name:'移除此 URL'}).click();
  await group.locator('fieldset').nth(2).getByRole('button',{name:'移除此 URL'}).click();
  assert.equal(await group.locator('fieldset').count(),2);
  await second.getByLabel('归属工作').selectOption('开发');
  const development=page.locator('.monitor-work-group[aria-label="开发工作网址"]');
  await development.getByLabel('归属工作').selectOption('评测');
  await page.evaluate(()=>window.qaFail=true);
  await page.getByRole('button',{name:'保存监测配置',exact:true}).click();
  await page.getByRole('alert').filter({hasText:'测试保存失败'}).waitFor();
  assert.equal(await group.locator('fieldset').count(),2);
  assert.equal(await group.getByLabel('域名后缀',{exact:true}).inputValue(),'.cn-beijing-vpc.fcapp.run');
  await page.evaluate(()=>window.qaFail=false);
  await page.getByRole('button',{name:'保存监测配置',exact:true}).click();
  await page.waitForFunction(()=>window.qaConfig.revision===4);
  await group.getByText('2 个 URL',{exact:true}).waitFor();
  const saved=await page.evaluate(()=>window.qaConfig.rules);
  assert.equal(saved.length,2);
  assert.ok(saved.every(r=>r.category==='评测'));
  assert.deepEqual(saved.map(r=>r.match_mode),['origin','domain_suffix']);
  await page.reload();
  await group.getByText('2 个 URL',{exact:true}).waitFor();
  assert.equal(await group.getByLabel('工作 URL',{exact:true}).inputValue(),'https://moonshot.feishu.cn/');
  assert.equal(await group.getByLabel('域名后缀',{exact:true}).inputValue(),'.cn-beijing-vpc.fcapp.run');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:new URL('multi-url-settings.png',output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
  assert.deepEqual(errors,[]);
  await writeFile(new URL('multi-url-result.json',output),JSON.stringify({sameWorkMultipleUrls:true,independentModes:true,rapidAddRemove:true,moveCategory:true,failedSaveKeepsInput:true,saveReload:true,pageErrors:errors},null,2));
  console.log('Multi-URL settings regression passed; isolated IPC only.');
} finally { await browser.close(); }
