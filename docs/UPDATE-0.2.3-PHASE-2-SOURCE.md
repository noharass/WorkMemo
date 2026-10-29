# v0.2.3 第 2 阶段完整变更源码

以下完整保存本阶段新增／修改的代码和配置。阶段说明、素材 README、原始许可及第三方许可全文在文件清单所列原路径；音频是实际二进制文件并附 SHA256，不在 Markdown 中冒充文本代码。此前阶段快照保留，未使用省略号替代源码。

## E:\WorkMemo\.gitattributes

```
* text=auto eol=lf
*.cmd text eol=crlf

# Preserve third-party license text verbatim, including upstream whitespace.
docs/THIRD-PARTY-LICENSES.txt -text -whitespace
scripts/third-party-licenses/*.txt -text -whitespace
*.png binary
*.ico binary
*.icns binary

# Preserve the original CC0 audio license from the Kenney archive.
src-tauri/sounds/source/LICENSE.txt -text -whitespace
*.ogg binary
*.wav binary
```

## E:\WorkMemo\scripts\collect-licenses.mjs

```javascript
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const destination = resolve(process.argv[2] ?? join(root, 'docs', 'THIRD-PARTY-LICENSES.txt'));
const metadata = spawnSync('cargo', ['metadata', '--locked', '--format-version', '1', '--filter-platform', 'x86_64-pc-windows-msvc', '--manifest-path', join(root, 'src-tauri', 'Cargo.toml')], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
if (metadata.status !== 0) throw new Error(metadata.stderr || 'Unable to read Cargo metadata');
const sections = ['WorkMemo third-party dependency notices',
  'Collected from locally installed package archives. Cargo entries include build and cross-platform dependencies; not every listed package is linked into the Windows executable.', ''];
let count = 0;
const supplemental = {
  '@ant-design/icons-svg@4.6.0': ['ant-design-icons-MIT.txt', 'https://github.com/ant-design/ant-design-icons/blob/7f2516ac91226d2b41f93b35cb5197c8d94f7189/LICENSE'],
  'is-mobile@5.0.0': ['is-mobile-MIT.txt', 'https://github.com/juliangruber/is-mobile/blob/2708dd8f07d91f354a46b8dff3053abb6b840067/Readme.md'],
  'alloc-stdlib@0.3.0': ['alloc-stdlib-BSD-3-Clause.txt', 'https://github.com/dropbox/rust-alloc-no-stdlib/blob/0a81fd6928ea3b33c8cd484aa4575d50ffb98012/LICENSE'],
  'selectors@0.38.0': ['MPL-2.0.txt', 'https://www.mozilla.org/en-US/MPL/2.0/'],
  'webview2-com@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-sys@0.39.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
  'webview2-com-macros@0.8.1': ['webview2-rs-MIT.txt', 'https://github.com/wravery/webview2-rs/blob/edc2caf886175ccaebe86078c9cfe1ae2a187328/LICENSE'],
};
function collect(label, directory, license, repository, supplement, source) {
  sections.push(`=== ${label} ===`, `Declared license: ${license || 'not specified'}`, `Repository: ${typeof repository === 'string' ? repository : repository?.url || 'see package manifest'}`);
  if (source) sections.push(`Package source archive (unmodified): ${source}`);
  const files = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /(^|[-_.])(licen[cs]e|copying|notice)([-_.]|$)/i.test(entry.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!files.length) {
    if (!supplement) throw new Error(`Missing license text for ${label}; review the package before distribution.`);
    sections.push(`Supplemental license source: ${supplement[1]}`, readFileSync(join(root, 'scripts', 'third-party-licenses', supplement[0]), 'utf8'));
  }
  for (const file of files) sections.push(`--- ${file.name} ---`, readFileSync(join(directory, file.name), 'utf8'));
  sections.push('');
  count += 1;
}
const graph = JSON.parse(metadata.stdout);
const resolved = new Set(graph.resolve.nodes.map((node) => node.id));
for (const pkg of graph.packages.filter((pkg) => pkg.source && resolved.has(pkg.id)).sort((a, b) => `${a.name}@${a.version}`.localeCompare(`${b.name}@${b.version}`))) {
  collect(`Cargo ${pkg.name} ${pkg.version}`, dirname(pkg.manifest_path), pkg.license, pkg.repository, supplemental[`${pkg.name}@${pkg.version}`], `https://crates.io/api/v1/crates/${pkg.name}/${pkg.version}/download`);
}
const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
for (const [path, entry] of Object.entries(lock.packages).filter(([path, entry]) => path && (!entry.dev || path === "node_modules/tailwindcss")).sort()) {
  const directory = join(root, path);
  const pkg = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  collect(`npm ${pkg.name} ${entry.version}`, directory, pkg.license, pkg.repository, supplemental[`${pkg.name}@${entry.version}`]);
}
const audioManifest=JSON.parse(readFileSync(join(root,'src-tauri','sounds','manifest.json'),'utf8'));
sections.push('=== Audio: Kenney Interface Sounds 1.0 ===','Declared license: CC0-1.0',`Source: ${audioManifest.source}`,`Processing: ${audioManifest.processing}`, ...audioManifest.sounds.map(item=>`${item.theme}/${item.cue}: ${item.source} -> ${item.file}`),readFileSync(join(root,'src-tauri','sounds','source','LICENSE.txt'),'utf8'),'');
mkdirSync(dirname(destination), { recursive: true });
const output = `${sections.join('\n')}\n`;
if (!existsSync(destination) || readFileSync(destination, 'utf8') !== output) writeFileSync(destination, output, 'utf8');
console.log(`Collected dependency notices for ${count} package versions.`);
```

## E:\WorkMemo\scripts\prepare-sounds.mjs

```javascript
// Optional asset-authoring tool; committed WAVs need no decoder at app build/runtime.
// Decode original CC0 OGGs using an existing Chromium/Playwright installation.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const sounds=join(root,'src-tauri','sounds');
const selections={
 soft:{start:'confirmation_002',pause:'minimize_001',resume:'maximize_001',end:'confirmation_001',warning:'question_001'},
 crisp:{start:'glass_001',pause:'back_002',resume:'select_002',end:'confirmation_004',warning:'question_002'},
};
const browser=await chromium.launch({channel:'msedge',headless:true});
const manifest=[];
try{
 const page=await browser.newPage();
 for(const [theme,cues] of Object.entries(selections))for(const [cue,source] of Object.entries(cues)){
  const original=readFileSync(join(sounds,'source',source+'.ogg'));
  const decoded=await page.evaluate(async base64=>{
   const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
   const context=new OfflineAudioContext(1,1,22050);
   const buffer=await context.decodeAudioData(bytes.buffer);
   const mono=new Float32Array(buffer.length);
   for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const samples=buffer.getChannelData(channel);
    for(let i=0;i<samples.length;i++)mono[i]+=samples[i]/buffer.numberOfChannels;
   }
   return Array.from(mono);
  },original.toString('base64'));
  let begin=decoded.findIndex(v=>Math.abs(v)>0.0005);if(begin<0)throw new Error('Silent source');
  let end=decoded.length;while(end>begin&&Math.abs(decoded[end-1])<0.0005)end--;
  let samples=decoded.slice(Math.max(0,begin-110),Math.min(end+220,begin+Math.round(22050*0.85)));
  if(theme==='soft'){
   const alpha=1-Math.exp(-2*Math.PI*2800/22050);let previous=0;
   samples=samples.map(value=>(previous+=alpha*(value-previous)));
  }
  const peak=Math.max(...samples.map(Math.abs));
  const rms=Math.sqrt(samples.reduce((sum,value)=>sum+value*value,0)/samples.length);
  const gain=Math.min((theme==='soft'?0.32:0.45)/peak,(theme==='soft'?0.075:0.1)/rms);
  samples=samples.map((value,i)=>value*gain*Math.min(1,i/110,(samples.length-1-i)/882));
  const wav=Buffer.alloc(44+samples.length*2);
  wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
  wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);
  wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);
  samples.forEach((value,i)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*32767),44+i*2));
  const relative=theme==='soft'?`${cue}.wav`:`crisp/${cue}.wav`;
  mkdirSync(join(sounds,theme==='soft'?'.':'crisp'),{recursive:true});writeFileSync(join(sounds,relative),wav);
  manifest.push({theme,cue,source:`source/${source}.ogg`,file:relative,duration_ms:Math.round(samples.length/22.05),sha256:createHash('sha256').update(wav).digest('hex'),source_sha256:createHash('sha256').update(original).digest('hex')});
 }
 writeFileSync(join(sounds,'manifest.json'),JSON.stringify({source:'https://kenney.nl/assets/interface-sounds',license:'CC0-1.0',sample_rate:22050,channels:1,bits:16,processing:'trim silence; resample; soft lowpass 2800Hz; normalize gain; fade in 5ms/out 40ms; cap 850ms',sounds:manifest},null,2)+'\n');
 console.log(JSON.stringify(manifest.map(({theme,cue,duration_ms})=>({theme,cue,duration_ms}))));
}finally{await browser.close();}
```

## E:\WorkMemo\scripts\verify-ui-022.mjs

```javascript
// Optional browser regression check. Uses isolated HTTP fixtures, never a user database.
// Set WORKMEMO_PLAYWRIGHT to a local playwright package entry if it is not installed.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.env.WORKMEMO_PLAYWRIGHT ? pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href : 'playwright');
const output = new URL('../artifacts/0.2.3/qa/', import.meta.url);
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'msedge',headless:true});
const page = await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.addInitScript(()=>{window.qaWindowErrors=[];window.addEventListener('error',event=>window.qaWindowErrors.push(event.message));});
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
  const data={meta:{version:'0.2.2',active:null},query:{range:{period:'day',anchor_date:today,start_date:today,end_date:today,trend_unit:'hour'},record_count:1,totals:{duration_ms:3599000,quantity:record.quantity,records:1,pending:0},trend:graphDays,monthly:false,categories:[{category:'开发',duration_ms:3599000,quantity:record.quantity,records:1,complete:1,pending:0}],calendar:graphDays.map(d=>[d.date,d.duration_ms]),records:[record],page:1,pages:1,scope:'real'},detail:{record,segments:[],revisions:[]},save:{ok:true}}[name];
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
const layoutCases=[];
for(const width of [390,800,1024,1280,1440,1600,1920]){
  await page.setViewportSize({width,height:1000});
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`page overflow ${width}`);
  const layout=await page.evaluate(()=>{
    const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,right:r.right,bottom:r.bottom};};
    return {filters:rect('.dc-filters'),kpis:rect('.dc-kpis'),report:rect('.dc-category-report'),trend:rect('.dc-trend'),auxiliary:rect('.dc-auxiliary'),records:rect('.dc-records')};
  });
  assert.ok(Math.abs(layout.filters.width-layout.report.width)<2,JSON.stringify(layout));
  assert.ok(Math.abs(layout.kpis.width-layout.report.width)<2,JSON.stringify(layout));
  assert.ok(Math.abs(layout.trend.width-layout.report.width)<2,JSON.stringify(layout));
  assert.ok(layout.report.bottom<=layout.trend.y,JSON.stringify(layout));
  assert.ok(layout.records.y>=layout.auxiliary.bottom,JSON.stringify(layout));
  layoutCases.push({width,...layout});
  await page.screenshot({path:new URL(`dashboard-${width}.png`,output).pathname.replace(/^\/(\w:)/,'$1'),fullPage:true});
}
// Browser zoom equivalence for CSS layout (not native Windows DPI verification).
await page.evaluate(()=>document.documentElement.style.zoom='1.25');
await page.waitForTimeout(400);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
await page.evaluate(()=>document.documentElement.style.zoom='1');
assert.deepEqual(errors,[]);
assert.deepEqual(await page.evaluate(()=>window.qaWindowErrors),[]);
await writeFile(new URL('browser-result.json',output),JSON.stringify({enterEditNoSubmit:true,focus:true,zeroSave:true,failurePreservesInput:true,revisionConflictPreservesInput:true,periodReportLayout:true,widths:[390,800,1024,1280,1440,1600,1920],cssZoom:1.25,pageErrors:errors},null,2));
await writeFile(new URL('overview-layout-result.json',output),JSON.stringify(layoutCases,null,2));
if(process.argv.includes('--dashboard-only')) { await browser.close();console.log('Overview report layout and editor regressions passed; HTTP fixtures only.');process.exit(0); }
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
```

## E:\WorkMemo\scripts\verify-v023-phase1.mjs

```javascript
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
      return route.fulfill({json:{range:{period:'day',anchor_date:'2026-10-29',start_date:'2026-10-29',end_date:'2026-10-29',trend_unit:'hour'},record_count:1,totals:{duration_ms:10000,quantity:0,records:1,pending:0},trend:[],monthly:false,categories:[{category:'开发',duration_ms:10000,quantity:0,records:1,complete:1,pending:0}],calendar:[],records:[dashboardRecord],page:1,pages:1,scope:'real'}});
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
```

## E:\WorkMemo\scripts\verify-v023-phase2.mjs

```javascript
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
```

## E:\WorkMemo\src-tauri\sounds\manifest.json

```json
{
  "source": "https://kenney.nl/assets/interface-sounds",
  "license": "CC0-1.0",
  "sample_rate": 22050,
  "channels": 1,
  "bits": 16,
  "processing": "trim silence; resample; soft lowpass 2800Hz; normalize gain; fade in 5ms/out 40ms; cap 850ms",
  "sounds": [
    {
      "theme": "soft",
      "cue": "start",
      "source": "source/confirmation_002.ogg",
      "file": "start.wav",
      "duration_ms": 539,
      "sha256": "b2b95674cf0c61ff817ad9a19e140c8bae097ae78a3ae3dabeedf1a1a5c9a6a3",
      "source_sha256": "33b17a9a9a2397c62b285c52c33a907fdffb476909c99e42dde603f6a7a8b12c"
    },
    {
      "theme": "soft",
      "cue": "pause",
      "source": "source/minimize_001.ogg",
      "file": "pause.wav",
      "duration_ms": 258,
      "sha256": "42ae833612216eb4156daa773554f49d5672cfb5061ceb9238e64abcf5e01043",
      "source_sha256": "8481912bc7fa5828924a00ef15b6cd613b994956e0817bd3122065c9b2896d2d"
    },
    {
      "theme": "soft",
      "cue": "resume",
      "source": "source/maximize_001.ogg",
      "file": "resume.wav",
      "duration_ms": 258,
      "sha256": "cd910613dbe73a1a578a37dd14228c195309b8b4e7ef827ffd9678e164030c06",
      "source_sha256": "fd3e75e1de2f2fda90aceeacaeb0427ac8bddd3b07a6ce2a8f9ba923df3771f9"
    },
    {
      "theme": "soft",
      "cue": "end",
      "source": "source/confirmation_001.ogg",
      "file": "end.wav",
      "duration_ms": 290,
      "sha256": "80f847ad6e60ecc58a09fd9d88a645c729d7c92c31ce7510438c48848c5d6a98",
      "source_sha256": "063564703b6094d70718a3e787a55cc9141611e4ecd6b6637f8828f79b4a8c3a"
    },
    {
      "theme": "soft",
      "cue": "warning",
      "source": "source/question_001.ogg",
      "file": "warning.wav",
      "duration_ms": 491,
      "sha256": "83efbfa8dd75a0e082b4d07a4b85725f7c342e37db07194322d12b1ac2ea92ad",
      "source_sha256": "abb8f9e4eb2071491b0b15f84ee302386b1847609310c1b000ae174639a6cc5a"
    },
    {
      "theme": "crisp",
      "cue": "start",
      "source": "source/glass_001.ogg",
      "file": "crisp/start.wav",
      "duration_ms": 276,
      "sha256": "33d9332f89076fd1832900e42fe17069a732d2bf31a562deadc76dce7917eb99",
      "source_sha256": "183eebee20eb0a532b0b85104d139cbf2673eb66d95c3cc733ac9ea98362e7e8"
    },
    {
      "theme": "crisp",
      "cue": "pause",
      "source": "source/back_002.ogg",
      "file": "crisp/pause.wav",
      "duration_ms": 68,
      "sha256": "1934a71d3d71dc25273e62d6754e37bb8037a019462ebe13523f7a89417ee7c0",
      "source_sha256": "61581c58194e3f19f531072edabbc344204c7e0a2887b8ededce4357bcf09195"
    },
    {
      "theme": "crisp",
      "cue": "resume",
      "source": "source/select_002.ogg",
      "file": "crisp/resume.wav",
      "duration_ms": 40,
      "sha256": "6cce61ab41c1a230a1bce8f06d69f336c626dfa97a71f490160b6b31f26fb7bb",
      "source_sha256": "4cc6ac5341b9b2c86fef80c347de028e9ab9f2e037586ac7d9fa59a403a1c012"
    },
    {
      "theme": "crisp",
      "cue": "end",
      "source": "source/confirmation_004.ogg",
      "file": "crisp/end.wav",
      "duration_ms": 490,
      "sha256": "ecda546a157f298d52ab3105a682c63b35879d00fea21517b3c0955b2709b450",
      "source_sha256": "568967a3d9f8a8f6af54ea01729c4882284308f2a27d78c07ffd7ee0d6951661"
    },
    {
      "theme": "crisp",
      "cue": "warning",
      "source": "source/question_002.ogg",
      "file": "crisp/warning.wav",
      "duration_ms": 333,
      "sha256": "8fffe9b384395bb039ab29ad60dccdba8b3129c6a2613f50d91768521224bdf7",
      "source_sha256": "46056f10c70dda860e93bd27b66f4d33c0b7154eff28def06471b50028efa5b3"
    }
  ]
}
```

## E:\WorkMemo\src-tauri\src\data_center.rs

```rust
//! Authenticated dashboard queries share Store, transactions and revision checks.
use super::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

#[derive(Debug, Deserialize, Default)]
#[serde(default, deny_unknown_fields)]
pub struct DashboardQuery {
    pub period: String,
    pub anchor_date: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub category: Option<String>,
    pub scope: String,
    pub status: String,
    pub page: u32,
}
#[path = "report_periods.rs"]
mod periods;

fn tagged(row: &rusqlite::Row<'_>) -> rusqlite::Result<Value> {
    let record = read_record(row)?;
    let mut value = serde_json::to_value(record)
        .map_err(|e| rusqlite::Error::ToSqlConversionFailure(Box::new(e)))?;
    value["is_demo"] = row.get::<_, bool>(20)?.into();
    value["demo_batch"] = row.get::<_, Option<String>>(21)?.into();
    Ok(value)
}
#[derive(Serialize)]
pub struct TodayWorkload {
    pub category: String,
    pub quantity: f64,
    pub pending: i64,
    pub records: i64,
    pub complete: i64,
}
impl Store {
    pub fn today_workload(&self) -> Result<Vec<TodayWorkload>> {
        self.connection.prepare("SELECT category,COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),SUM(settlement_status!='COMPLETE'),COUNT(*),SUM(settlement_status='COMPLETE') FROM work_records WHERE is_demo=0 AND date(start_time/1000,'unixepoch','localtime')=date('now','localtime') GROUP BY category ORDER BY MIN(id)").map_err(db_error)?
            .query_map([],|r|Ok(TodayWorkload{category:r.get(0)?,quantity:r.get(1)?,pending:r.get(2)?,records:r.get(3)?,complete:r.get(4)?})).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)
    }
    pub fn dashboard_query(&self, mut q: DashboardQuery) -> Result<Value> {
        let mut range = periods::ReportRange::resolve(&self.connection, &q)?;
        q.start_date = range.start_date.clone();
        q.end_date = range.end_date.clone();
        if q.category
            .as_ref()
            .is_some_and(|s| !crate::presentation::CATEGORIES.contains(&s.as_str()))
        {
            return Err("工作类别无效。".into());
        }
        let scope = if q.scope.is_empty() { "real" } else { &q.scope };
        if !["real", "demo", "all"].contains(&scope)
            || !["", "all", "pending", "complete", "working"].contains(&q.status.as_str())
        {
            return Err("数据筛选无效。".into());
        }
        let tx = self.connection.unchecked_transaction().map_err(db_error)?;
        let filter = "(?1='all' OR is_demo=CASE WHEN ?1='demo' THEN 1 ELSE 0 END) AND (?2 IS NULL OR date(start_time/1000,'unixepoch','localtime')>=?2) AND (?3 IS NULL OR date(start_time/1000,'unixepoch','localtime')<=?3) AND (?4 IS NULL OR category=?4) AND (?5='' OR ?5='all' OR (?5='pending' AND settlement_status='PENDING') OR (?5='complete' AND settlement_status='COMPLETE') OR (?5='working' AND status='WORKING'))";
        let args = params![scope, q.start_date, q.end_date, q.category, q.status];
        let record_count: i64 = self
            .connection
            .query_row(
                &format!("SELECT COUNT(*) FROM work_records WHERE {filter}"),
                args,
                |r| r.get(0),
            )
            .map_err(db_error)?;
        // Report aggregates always describe ended work, independently of list paging.
        let report_filter = format!("{filter} AND status='FINISHED'");
        let (count,duration,quantity,pending,first,last):(i64,i64,f64,i64,Option<i64>,Option<i64>) = self.connection.query_row(
            &format!("SELECT COUNT(*),COALESCE(SUM(duration_ms),0),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COALESCE(SUM(settlement_status='PENDING'),0),MIN(start_time),MAX(start_time) FROM work_records WHERE {report_filter}"),args,
            |r|Ok((r.get(0)?,r.get(1)?,r.get(2)?,r.get(3)?,r.get(4)?,r.get(5)?))
        ).map_err(db_error)?;
        let months = range.period == "custom"
            && first.zip(last).is_some_and(|(a, b)| b - a > 120 * 86400000);
        if months {
            range.trend_unit = "month".into();
        }
        let group = match range.trend_unit.as_str() {
            "hour" => "strftime('%H:00',start_time/1000,'unixepoch','localtime')",
            "month" => "strftime('%Y-%m',start_time/1000,'unixepoch','localtime')",
            _ => "date(start_time/1000,'unixepoch','localtime')",
        };
        let mut trend:Vec<Value>=self.connection.prepare(&format!("SELECT {group} AS period,SUM(duration_ms),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COUNT(*) FROM work_records WHERE {report_filter} GROUP BY period ORDER BY period")).map_err(db_error)?.query_map(args,|r|Ok(json!({"date":r.get::<_,String>(0)?,"duration_ms":r.get::<_,i64>(1)?,"quantity":r.get::<_,f64>(2)?,"records":r.get::<_,i64>(3)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        if range.period != "custom" {
            let mut by_date: std::collections::BTreeMap<String, Value> = trend
                .into_iter()
                .map(|v| (v["date"].as_str().unwrap().to_string(), v))
                .collect();
            trend = range
                .buckets(&self.connection)?
                .into_iter()
                .map(|date| {
                    by_date.remove(&date).unwrap_or_else(
                        || json!({"date":date,"duration_ms":0,"quantity":0,"records":0}),
                    )
                })
                .collect();
        }
        let aggregated:Vec<Value>=self.connection.prepare(&format!("SELECT category,SUM(duration_ms),COALESCE(SUM(CASE WHEN settlement_status='COMPLETE' THEN quantity ELSE 0 END),0),COUNT(*),SUM(settlement_status='PENDING'),SUM(settlement_status='COMPLETE') FROM work_records WHERE {report_filter} GROUP BY category")).map_err(db_error)?.query_map(args,|r|Ok(json!({"category":r.get::<_,String>(0)?,"duration_ms":r.get::<_,i64>(1)?,"quantity":r.get::<_,f64>(2)?,"records":r.get::<_,i64>(3)?,"pending":r.get::<_,i64>(4)?,"complete":r.get::<_,i64>(5)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let categories:Vec<Value>=crate::presentation::CATEGORIES.into_iter().filter(|key|q.category.as_deref().is_none_or(|selected|selected==*key)).map(|key|aggregated.iter().find(|v|v["category"]==key).cloned().unwrap_or_else(||json!({"category":key,"duration_ms":0,"quantity":0,"records":0,"pending":0,"complete":0}))).collect();
        let calendar:Vec<Value>=self.connection.prepare(&format!("SELECT date(start_time/1000,'unixepoch','localtime') AS day,SUM(duration_ms) FROM work_records WHERE {report_filter} AND date(start_time/1000,'unixepoch','localtime')>=date(COALESCE(?3,date('now','localtime')),'-89 days') GROUP BY day ORDER BY day")).map_err(db_error)?.query_map(args,|r|Ok(json!([r.get::<_,String>(0)?,r.get::<_,i64>(1)?]))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let page = i64::from(q.page.max(1)).min(((record_count + 49) / 50).max(1));
        let rows:Vec<Value>=self.connection.prepare(&format!("SELECT {COLUMNS},is_demo,demo_batch FROM work_records WHERE {filter} ORDER BY start_time DESC,id DESC LIMIT 50 OFFSET ?6")).map_err(db_error)?.query_map(params![scope,q.start_date,q.end_date,q.category,q.status,(page-1)*50],tagged).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(
            json!({"range":range,"totals":{"records":count,"duration_ms":duration,"quantity":quantity,"pending":pending},"record_count":record_count,"trend":trend,"monthly":months,"categories":categories,"calendar":calendar,"records":rows,"page":page,"pages":((record_count+49)/50).max(1),"scope":scope}),
        )
    }
    pub fn dashboard_detail(&self, id: i64) -> Result<Value> {
        let record = self
            .connection
            .query_row(
                &format!("SELECT {COLUMNS},is_demo,demo_batch FROM work_records WHERE id=?1"),
                [id],
                tagged,
            )
            .optional()
            .map_err(db_error)?
            .ok_or("记录已不存在。")?;
        let segments:Vec<Value>=self.connection.prepare("SELECT id,start_time,end_time,duration_ms,state FROM work_segments WHERE record_id=?1 ORDER BY id").map_err(db_error)?.query_map([id],|r|Ok(json!({"id":r.get::<_,i64>(0)?,"start_time":r.get::<_,i64>(1)?,"end_time":r.get::<_,Option<i64>>(2)?,"duration_ms":r.get::<_,i64>(3)?,"state":r.get::<_,String>(4)?}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        let revisions:Vec<Value>=self.connection.prepare("SELECT revision,changed_at,before_json,after_json FROM record_revisions WHERE record_id=?1 ORDER BY revision").map_err(db_error)?.query_map([id],|r|Ok(json!({"revision":r.get::<_,i64>(0)?,"changed_at":r.get::<_,i64>(1)?,"before":serde_json::from_str::<Value>(&r.get::<_,String>(2)?).unwrap_or(Value::Null),"after":serde_json::from_str::<Value>(&r.get::<_,String>(3)?).unwrap_or(Value::Null)}))).map_err(db_error)?.collect::<rusqlite::Result<_>>().map_err(db_error)?;
        Ok(json!({"record":record,"segments":segments,"revisions":revisions}))
    }
    pub fn dashboard_delete(&mut self, id: i64, expected_revision: i64) -> Result<()> {
        if self.record(id)?.revision != expected_revision {
            return Err("记录已被修改，请重新读取后删除。".into());
        }
        self.delete_record(id)
    }
    pub fn seed_demo(&mut self) -> Result<i64> {
        let batch = "workmemo-v021-demo-1";
        let existing: i64 = self
            .connection
            .query_row(
                "SELECT COUNT(*) FROM work_records WHERE is_demo=1 AND demo_batch=?1",
                [batch],
                |r| r.get(0),
            )
            .map_err(db_error)?;
        if existing > 0 {
            return Ok(existing);
        }
        let tx = self
            .connection
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(db_error)?;
        let now: i64 = tx
            .query_row("SELECT unixepoch('now')*1000", [], |r| r.get(0))
            .map_err(db_error)?;
        let categories = ["评测", "质检", "开发", "文档"];
        let mut count = 0;
        for day in 0..90_i64 {
            let modifier = format!("-{day} days");
            let weekday: String = tx
                .query_row(
                    "SELECT strftime('%w','now','localtime',?1)",
                    [&modifier],
                    |r| r.get(0),
                )
                .map_err(db_error)?;
            if day > 0 && (weekday == "0" || weekday == "6") {
                continue;
            }
            for slot in 0..3_i64 {
                let start: i64 = if day == 0 {
                    now - 3 * 3600000 + slot * 50 * 60000
                } else {
                    tx.query_row(
                        "SELECT unixepoch(date('now','localtime',?1)||' 09:00:00','utc')*1000",
                        [&modifier],
                        |r| r.get::<_, i64>(0),
                    )
                    .map_err(db_error)?
                        + slot * 3 * 3600000
                };
                let duration = if day == 0 {
                    35 * 60000
                } else {
                    (25 + (day * 17 + slot * 19) % 80) * 60000
                };
                let half = duration / 2;
                let end = start + duration + 5 * 60000;
                let pending = (day + slot) % 9 == 0;
                let quantity = if pending {
                    None
                } else {
                    Some(((day * 11 + slot * 13) % 80 + 1) as f64)
                };
                let category = categories[((day + slot) % 4) as usize];
                let revised = !pending && (day + slot) % 13 == 0;
                tx.execute("INSERT INTO work_records(category,quantity,remark,start_time,end_time,duration_ms,duration_seconds,status,is_paused,recovery_pending,settlement_status,source,confirmed_end_time,end_reason,revision,is_demo,demo_batch,control_mode) VALUES(?1,?2,'演示数据 · 用于查看图表效果',?3,?4,?5,?6,'FINISHED',1,0,?7,'MANUAL_ENTRY',?4,'MANUAL',?8,1,?9,'MANUAL')",params![category,quantity,start,end,duration,duration/1000,if pending{"PENDING"}else{"COMPLETE"},if revised{1}else{0},batch]).map_err(db_error)?;
                let id = tx.last_insert_rowid();
                for (a, b) in [(start, start + half), (start + half + 5 * 60000, end)] {
                    tx.execute("INSERT INTO work_segments(record_id,start_time,end_time,checkpoint_time,duration_ms,state) VALUES(?1,?2,?3,?3,?4,'CLOSED')",params![id,a,b,b-a]).map_err(db_error)?;
                }
                if revised {
                    let after = tx
                        .query_row(
                            &format!("SELECT {COLUMNS} FROM work_records WHERE id=?1"),
                            [id],
                            read_record,
                        )
                        .map_err(db_error)?;
                    let mut before = after.clone();
                    before.revision = 0;
                    before.quantity = quantity.map(|v| v - 1.0);
                    before.remark = "演示：初次填写".into();
                    tx.execute("INSERT INTO record_revisions(record_id,revision,changed_at,before_json,after_json) VALUES(?1,1,?2,?3,?4)",params![id,end+60000,serde_json::to_string(&before).map_err(|e|e.to_string())?,serde_json::to_string(&after).map_err(|e|e.to_string())?]).map_err(db_error)?;
                }
                count += 1;
            }
        }
        tx.commit().map_err(db_error)?;
        Ok(count)
    }
    pub fn clear_demo(&mut self) -> Result<usize> {
        let tx = self.connection.transaction().map_err(db_error)?;
        let n = tx
            .execute(
                "DELETE FROM work_records WHERE is_demo=1 AND status='FINISHED'",
                [],
            )
            .map_err(db_error)?;
        tx.commit().map_err(db_error)?;
        Ok(n)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::database::tests::TestClock;
    fn empty() -> Store {
        Store::initialize(
            Connection::open_in_memory().unwrap(),
            Box::new(TestClock::new()),
            None,
        )
        .unwrap()
    }
    #[test]
    fn demo_generation_is_idempotent_and_never_changes_real_totals_or_active_work() {
        let mut s = empty();
        s.start(StartInput {
            category: "开发".into(),
            quantity: None,
            remark: "real".into(),
        })
        .unwrap();
        let before = s.active().unwrap().unwrap();
        let n = s.seed_demo().unwrap();
        assert!(n > 100);
        assert_eq!(s.seed_demo().unwrap(), n);
        assert_eq!(s.active().unwrap().unwrap().id, before.id);
        assert_eq!(s.active().unwrap().unwrap().duration_ms, before.duration_ms);
        assert_eq!(s.snapshot().unwrap().pending_count, 0);
        assert!(s.snapshot().unwrap().recent_records.is_empty());
        let demo = s
            .dashboard_query(DashboardQuery {
                scope: "demo".into(),
                ..Default::default()
            })
            .unwrap();
        assert_eq!(demo["totals"]["records"], n);
        assert!(demo["totals"]["pending"].as_i64().unwrap() > 0);
        let real = s.dashboard_query(DashboardQuery::default()).unwrap();
        assert_eq!(real["totals"]["records"], 0);
        assert_eq!(real["record_count"], 1);
        assert_eq!(real["totals"]["quantity"], 0.0);
        let history = s
            .query_history(super::super::HistoryQuery {
                start_date: "1970-01-01".into(),
                end_date: "1970-12-31".into(),
                category: None,
                page: 1,
            })
            .unwrap();
        assert_eq!(history.overview.records, 0);
        assert_eq!(s.clear_demo().unwrap() as i64, n);
        assert_eq!(s.active().unwrap().unwrap().id, before.id);
        assert_eq!(
            s.connection
                .query_row("SELECT COUNT(*) FROM work_records", [], |r| r
                    .get::<_, i64>(0))
                .unwrap(),
            1
        );
        assert_eq!(
            s.connection
                .query_row("SELECT COUNT(*) FROM pragma_foreign_key_check", [], |r| r
                    .get::<_, i64>(
                    0
                ))
                .unwrap(),
            0
        );
    }
    #[test]
    fn today_uses_confirmed_quantity_and_distinguishes_missing_from_zero() {
        let s = empty();
        for (qty, state, demo) in [
            (None, "PENDING", 0),
            (Some(0.0), "COMPLETE", 0),
            (Some(50.5), "COMPLETE", 0),
            (Some(999.0), "COMPLETE", 1),
        ] {
            s.connection.execute("INSERT INTO work_records(category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,is_demo) VALUES('评测',?1,unixepoch('now')*1000-60000,unixepoch('now')*1000,60000,60,'FINISHED',1,?2,?3)",params![qty,state,demo]).unwrap();
        }
        let rows = s.today_workload().unwrap();
        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].quantity, 50.5);
        assert_eq!(rows[0].records, 3);
        assert_eq!(rows[0].pending, 1);
        assert_eq!(rows[0].complete, 2);
    }
    #[test]
    fn browser_edits_and_deletes_enforce_revision_and_preserve_intervals() {
        let mut s = empty();
        s.seed_demo().unwrap();
        let id = s
            .connection
            .query_row(
                "SELECT id FROM work_records WHERE settlement_status='PENDING' LIMIT 1",
                [],
                |r| r.get::<_, i64>(0),
            )
            .unwrap();
        let before = s.record(id).unwrap();
        s.settle(SettleInput {
            id,
            expected_revision: before.revision,
            category: "文档".into(),
            quantity: 0.0,
            remark: "reviewed demo".into(),
        })
        .unwrap();
        let after = s.record(id).unwrap();
        assert_eq!(after.duration_ms, before.duration_ms);
        assert_eq!(after.end_time, before.end_time);
        assert!(
            s.settle(SettleInput {
                id,
                expected_revision: before.revision,
                category: "文档".into(),
                quantity: 2.0,
                remark: "stale".into()
            })
            .is_err()
        );
        assert!(s.dashboard_delete(id, before.revision).is_err());
        let detail = s.dashboard_detail(id).unwrap();
        assert_eq!(detail["segments"].as_array().unwrap().len(), 2);
        assert_eq!(detail["revisions"].as_array().unwrap().len(), 1);
        assert_eq!(detail["record"]["is_demo"], true);
        s.dashboard_delete(id, after.revision).unwrap();
        assert!(s.dashboard_detail(id).is_err());
        assert!(
            s.dashboard_query(DashboardQuery {
                scope: "invalid".into(),
                ..Default::default()
            })
            .is_err()
        );
        assert!(
            s.dashboard_query(DashboardQuery {
                start_date: Some("2026-02-31".into()),
                ..Default::default()
            })
            .is_err()
        );
    }
}

#[cfg(test)]
#[path = "report_tests.rs"]
mod report_tests;
```

## E:\WorkMemo\src-tauri\src\report_periods.rs

```rust
use super::*;

#[derive(Debug, Serialize)]
pub struct ReportRange {
    pub period: String,
    pub anchor_date: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub trend_unit: String,
}

impl ReportRange {
    pub fn resolve(c: &Connection, q: &DashboardQuery) -> Result<Self> {
        let period = if q.period.is_empty() {
            "custom"
        } else {
            &q.period
        };
        if !["day", "week", "month", "custom"].contains(&period) {
            return Err("统计周期无效。".into());
        }
        if period == "custom" {
            if q.start_date
                .as_ref()
                .is_some_and(|v| !super::super::history::valid_date(v))
                || q.end_date
                    .as_ref()
                    .is_some_and(|v| !super::super::history::valid_date(v))
                || matches!((&q.start_date,&q.end_date),(Some(a),Some(b)) if a>b)
            {
                return Err("请选择有效的日期范围。".into());
            }
            return Ok(Self {
                period: period.into(),
                anchor_date: None,
                start_date: q.start_date.clone(),
                end_date: q.end_date.clone(),
                trend_unit: "day".into(),
            });
        }
        let anchor = match &q.anchor_date {
            Some(value) if super::super::history::valid_date(value) => value.clone(),
            Some(_) => return Err("请选择有效的统计日期。".into()),
            None => c
                .query_row("SELECT date('now','localtime')", [], |r| r.get(0))
                .map_err(db_error)?,
        };
        let (start, end): (String, String) = match period {
            "day" => (anchor.clone(), anchor.clone()),
            "week" => c.query_row("SELECT MAX('1970-01-01',date(?1,'-'||((CAST(strftime('%w',?1) AS INTEGER)+6)%7)||' days')),MIN('9999-12-31',COALESCE(date(?1,'+'||(6-((CAST(strftime('%w',?1) AS INTEGER)+6)%7))||' days'),'9999-12-31'))", [&anchor], |r| Ok((r.get(0)?,r.get(1)?))).map_err(db_error)?,
            _ => c.query_row("SELECT date(?1,'start of month'),COALESCE(date(?1,'start of month','+1 month','-1 day'),'9999-12-31')", [&anchor], |r| Ok((r.get(0)?,r.get(1)?))).map_err(db_error)?,
        };
        Ok(Self {
            period: period.into(),
            anchor_date: Some(anchor),
            start_date: Some(start),
            end_date: Some(end),
            trend_unit: if period == "day" { "hour" } else { "day" }.into(),
        })
    }

    pub fn buckets(&self, c: &Connection) -> Result<Vec<String>> {
        if self.period == "day" {
            return Ok((0..24).map(|h| format!("{h:02}:00")).collect());
        }
        if self.period == "custom" {
            return Ok(Vec::new());
        }
        c.prepare("WITH RECURSIVE days(day) AS (SELECT ?1 UNION ALL SELECT date(day,'+1 day') FROM days WHERE day<?2 LIMIT 32) SELECT day FROM days")
            .map_err(db_error)?.query_map(params![self.start_date,self.end_date], |r|r.get(0)).map_err(db_error)?.collect::<rusqlite::Result<Vec<String>>>().map_err(db_error)
    }
}
```

## E:\WorkMemo\src-tauri\src\report_tests.rs

```rust
use super::super::tests::TestClock;
use super::*;
fn store() -> Store {
    Store::initialize(
        Connection::open_in_memory().unwrap(),
        Box::new(TestClock::new()),
        None,
    )
    .unwrap()
}
fn query(period: &str, date: &str) -> DashboardQuery {
    DashboardQuery {
        period: period.into(),
        anchor_date: Some(date.into()),
        ..Default::default()
    }
}
fn ended(
    s: &Store,
    date: &str,
    category: &str,
    quantity: Option<f64>,
    complete: bool,
    duration: i64,
    demo: bool,
) -> i64 {
    s.connection.execute("INSERT INTO work_records(category,quantity,start_time,end_time,duration_ms,duration_seconds,status,is_paused,settlement_status,is_demo) VALUES(?1,?2,unixepoch(?3,'utc')*1000,unixepoch(?3,'utc')*1000+?4,?4,?4/1000,'FINISHED',1,?5,?6)",params![category,quantity,date,duration,if complete{"COMPLETE"}else{"PENDING"},demo]).unwrap();
    s.connection.last_insert_rowid()
}
#[test]
fn canonical_periods_cover_leap_month_sunday_and_cross_year_weeks() {
    let s = store();
    for (period, date, start, end, buckets) in [
        ("day", "2026-10-29", "2026-10-29", "2026-10-29", 24),
        ("week", "2027-01-01", "2026-12-28", "2027-01-03", 7),
        ("week", "2026-11-01", "2026-10-26", "2026-11-01", 7),
        ("month", "2024-02-29", "2024-02-01", "2024-02-29", 29),
        ("month", "2026-02-28", "2026-02-01", "2026-02-28", 28),
        ("month", "9999-12-31", "9999-12-01", "9999-12-31", 31),
        ("week", "1970-01-01", "1970-01-01", "1970-01-04", 4),
    ] {
        let mut q = query(period, date);
        q.start_date = Some("invalid ignored natural boundary".into());
        let result = s.dashboard_query(q).unwrap();
        assert_eq!(result["range"]["start_date"], start);
        assert_eq!(result["range"]["end_date"], end);
        assert_eq!(result["trend"].as_array().unwrap().len(), buckets);
        assert_eq!(result["categories"].as_array().unwrap().len(), 4);
        assert_eq!(result["totals"]["records"], 0);
    }
}
#[test]
fn period_reports_count_ended_work_and_keep_zero_pending_decimal_and_demo_separate() {
    let mut s = store();
    ended(
        &s,
        "2026-10-29 00:00:00",
        "评测",
        Some(0.0),
        true,
        1234,
        false,
    );
    ended(
        &s,
        "2026-10-29 23:59:59",
        "评测",
        Some(2.5),
        true,
        2000,
        false,
    );
    ended(&s, "2026-10-29 10:00:00", "评测", None, false, 3000, false);
    ended(
        &s,
        "2026-10-29 10:00:00",
        "开发",
        Some(999.0),
        false,
        4000,
        false,
    );
    ended(
        &s,
        "2026-10-29 10:00:00",
        "质检",
        Some(500.0),
        true,
        1000,
        true,
    );
    ended(
        &s,
        "2026-10-28 23:59:59",
        "评测",
        Some(200.0),
        true,
        5000,
        false,
    );
    ended(
        &s,
        "2026-10-30 00:00:00",
        "评测",
        Some(300.0),
        true,
        6000,
        false,
    );
    s.start(StartInput {
        category: "文档".into(),
        quantity: Some(55.0),
        remark: String::new(),
    })
    .unwrap();
    s.connection.execute("UPDATE work_records SET start_time=unixepoch('2026-10-29 12:00:00','utc')*1000 WHERE status='WORKING'",[]).unwrap();
    let result = s.dashboard_query(query("day", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 4);
    assert_eq!(result["record_count"], 5);
    assert_eq!(result["totals"]["duration_ms"], 10234);
    assert_eq!(result["totals"]["quantity"], 2.5);
    assert_eq!(result["categories"][0]["complete"], 2);
    assert_eq!(result["categories"][0]["pending"], 1);
    assert_eq!(result["categories"][2]["quantity"], 0.0);
    assert_eq!(result["categories"][2]["complete"], 0);
    assert_eq!(result["categories"][3]["records"], 0);
    assert_eq!(result["trend"][0]["duration_ms"], 1234);
    assert_eq!(result["trend"][23]["duration_ms"], 2000);
    let mut q = query("day", "2026-10-29");
    q.category = Some("开发".into());
    q.status = "pending".into();
    let one = s.dashboard_query(q).unwrap();
    assert_eq!(one["categories"].as_array().unwrap().len(), 1);
    assert_eq!(one["totals"]["pending"], 1);
    let mut q = query("day", "2026-10-29");
    q.status = "working".into();
    let working = s.dashboard_query(q).unwrap();
    assert_eq!(working["totals"]["records"], 0);
    assert_eq!(working["record_count"], 1);
}
#[test]
fn weekly_and_monthly_totals_refresh_after_settlement_edit_delete_and_use_all_pages() {
    let mut s = store();
    for _ in 0..61 {
        ended(
            &s,
            "2026-10-26 09:00:00",
            "评测",
            Some(0.25),
            true,
            1000,
            false,
        );
    }
    let id = ended(&s, "2026-11-01 09:00:00", "评测", None, false, 2500, false);
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["records"], 62);
    assert_eq!(result["totals"]["quantity"], 15.25);
    assert_eq!(result["pages"], 2);
    assert_eq!(result["records"].as_array().unwrap().len(), 50);
    s.settle(SettleInput {
        id,
        expected_revision: 0,
        category: "开发".into(),
        quantity: 2.5,
        remark: "confirmed".into(),
    })
    .unwrap();
    let result = s.dashboard_query(query("week", "2026-10-29")).unwrap();
    assert_eq!(result["totals"]["pending"], 0);
    assert_eq!(result["categories"][2]["quantity"], 2.5);
    s.settle(SettleInput {
        id,
        expected_revision: 1,
        category: "开发".into(),
        quantity: 0.0,
        remark: "edited".into(),
    })
    .unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["categories"][2]["quantity"],
        0.0
    );
    s.dashboard_delete(id, 2).unwrap();
    assert_eq!(
        s.dashboard_query(query("week", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-11-01")).unwrap()["totals"]["records"],
        0
    );
    assert_eq!(
        s.dashboard_query(query("month", "2026-10-29")).unwrap()["totals"]["records"],
        61
    );
}
#[test]
fn period_validation_rejects_bad_dates_and_legacy_custom_ranges_still_work() {
    let s = store();
    for (period, date) in [
        ("year", "2026-10-29"),
        ("month", "2026-02-29"),
        ("day", ""),
        ("week", "1969-12-31"),
    ] {
        assert!(s.dashboard_query(query(period, date)).is_err());
    }
    let q = DashboardQuery {
        start_date: Some("2026-10-30".into()),
        end_date: Some("2026-10-01".into()),
        ..Default::default()
    };
    assert!(s.dashboard_query(q).is_err());
    ended(
        &s,
        "2025-01-01 00:00:00",
        "评测",
        Some(1.0),
        true,
        1000,
        false,
    );
    ended(
        &s,
        "2026-01-01 00:00:00",
        "评测",
        Some(2.0),
        true,
        2000,
        false,
    );
    let result = s.dashboard_query(DashboardQuery::default()).unwrap();
    assert_eq!(result["range"]["period"], "custom");
    assert_eq!(result["range"]["trend_unit"], "month");
    assert_eq!(result["totals"]["records"], 2);
}
```

## E:\WorkMemo\src-tauri\src\service.rs

```rust
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
                let key = notice
                    .as_ref()
                    .map(|n| format!("{}:{}", n.kind, n.record.id))
                    .or_else(|| candidate_id.map(|id| format!("candidate:{id}")))
                    .or_else(|| {
                        if browsing && app_handle.state::<crate::desktop::IslandState>().enabled() {
                            return Some("browsing".into());
                        }
                        app_handle
                            .state::<crate::desktop::IslandState>()
                            .enabled()
                            .then_some(active_id)
                            .flatten()
                            .map(|id| format!("active:{id}"))
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
```

## E:\WorkMemo\src-tauri\src\sound.rs

```rust
//! A single backend transition observer; no frontend poll or window can replay cues.
#[derive(Clone, Copy, Debug, PartialEq, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Cue {
    Start,
    Pause,
    Resume,
    End,
    Warning,
}
#[derive(Clone, Copy, Debug, Default, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SoundTheme {
    #[default]
    Soft,
    Crisp,
}
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Status {
    pub id: i64,
    pub paused: bool,
    pub recovery: bool,
}
#[derive(Default)]
pub struct Tracker {
    previous: Option<(Option<Status>, bool)>,
}
impl Tracker {
    pub fn observe(&mut self, active: Option<Status>, warning: bool) -> Vec<Cue> {
        let old = self.previous.replace((active, warning));
        let Some((previous, was_warning)) = old else {
            return vec![];
        };
        let mut cues = vec![];
        if let Some(a) = active {
            if !a.recovery {
                match previous {
                    None => cues.push(Cue::Start),
                    Some(p) if p.id != a.id => cues.push(Cue::End),
                    Some(p) if p.paused != a.paused => {
                        cues.push(if a.paused { Cue::Pause } else { Cue::Resume })
                    }
                    _ => {}
                }
            }
        } else if previous.is_some() {
            cues.push(Cue::End);
        }
        if cues.is_empty()
            && active.is_some_and(|a| !a.recovery)
            && warning
            && (!was_warning || previous.map(|p| p.id) != active.map(|p| p.id))
        {
            cues.push(Cue::Warning);
        }
        cues
    }
}
fn pcm(cue: Cue, theme: SoundTheme) -> &'static [u8] {
    match (theme, cue) {
        (SoundTheme::Soft, Cue::Start) => include_bytes!("../sounds/start.wav"),
        (SoundTheme::Soft, Cue::Pause) => include_bytes!("../sounds/pause.wav"),
        (SoundTheme::Soft, Cue::Resume) => include_bytes!("../sounds/resume.wav"),
        (SoundTheme::Soft, Cue::End) => include_bytes!("../sounds/end.wav"),
        (SoundTheme::Soft, Cue::Warning) => include_bytes!("../sounds/warning.wav"),
        (SoundTheme::Crisp, Cue::Start) => include_bytes!("../sounds/crisp/start.wav"),
        (SoundTheme::Crisp, Cue::Pause) => include_bytes!("../sounds/crisp/pause.wav"),
        (SoundTheme::Crisp, Cue::Resume) => include_bytes!("../sounds/crisp/resume.wav"),
        (SoundTheme::Crisp, Cue::End) => include_bytes!("../sounds/crisp/end.wav"),
        (SoundTheme::Crisp, Cue::Warning) => include_bytes!("../sounds/crisp/warning.wav"),
    }
}
pub fn play(cue: Cue, theme: SoundTheme) -> Result<(), String> {
    let bytes = pcm(cue, theme);
    #[cfg(windows)]
    {
        use windows_sys::Win32::Media::Audio::{PlaySoundW, SND_ASYNC, SND_MEMORY, SND_NODEFAULT};
        // Static embedded PCM stays alive for asynchronous native playback.
        if unsafe {
            PlaySoundW(
                bytes.as_ptr().cast(),
                std::ptr::null_mut(),
                SND_ASYNC | SND_MEMORY | SND_NODEFAULT,
            )
        } == 0
        {
            return Err("系统未能播放提示音，请检查音频输出。".into());
        }
    }
    #[cfg(not(windows))]
    {
        let _ = bytes;
    }
    Ok(())
}
#[tauri::command]
pub fn preview_sound(theme: Option<SoundTheme>, cue: Option<Cue>) -> Result<(), String> {
    play(cue.unwrap_or(Cue::Start), theme.unwrap_or_default())
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn transition_takes_priority_over_warning_and_muted_observations_do_not_replay() {
        let mut t = Tracker::default();
        t.observe(None, false);
        let a = Status {
            id: 1,
            paused: false,
            recovery: false,
        };
        assert_eq!(t.observe(Some(a), true), vec![Cue::Start]);
        assert_eq!(
            t.observe(Some(Status { paused: true, ..a }), true),
            vec![Cue::Pause]
        );
        // Same observer state is updated while muted; enabling sound cannot replay it.
        assert!(
            t.observe(Some(Status { paused: true, ..a }), true)
                .is_empty()
        );
        assert_eq!(t.observe(None, true), vec![Cue::End]);
        assert!(t.observe(None, true).is_empty());
        t.observe(Some(a), false);
        assert_eq!(t.observe(Some(Status { id: 2, ..a }), true), vec![Cue::End]);
        assert!(serde_json::from_str::<SoundTheme>("\"unknown\"").is_err());
        assert!(serde_json::from_str::<Cue>("\"unknown\"").is_err());
    }
    #[test]
    fn ten_embedded_cues_are_short_faded_non_silent_pcm_with_bounded_peak() {
        for theme in [SoundTheme::Soft, SoundTheme::Crisp] {
            for cue in [Cue::Start, Cue::Pause, Cue::Resume, Cue::End, Cue::Warning] {
                let wav = pcm(cue, theme);
                assert_eq!(&wav[..4], b"RIFF");
                assert_eq!(&wav[8..16], b"WAVEfmt ");
                assert_eq!(&wav[36..40], b"data");
                assert_eq!(u16::from_le_bytes(wav[20..22].try_into().unwrap()), 1);
                assert_eq!(u16::from_le_bytes(wav[22..24].try_into().unwrap()), 1);
                assert_eq!(u32::from_le_bytes(wav[24..28].try_into().unwrap()), 22050);
                assert_eq!(u16::from_le_bytes(wav[34..36].try_into().unwrap()), 16);
                assert_eq!(
                    u32::from_le_bytes(wav[40..44].try_into().unwrap()) as usize,
                    wav.len() - 44
                );
                let samples: Vec<i16> = wav[44..]
                    .chunks_exact(2)
                    .map(|b| i16::from_le_bytes([b[0], b[1]]))
                    .collect();
                assert!(samples.len() <= 18743 && samples.len() > 220);
                assert_eq!(samples[0], 0);
                assert_eq!(samples.last(), Some(&0));
                let peak = samples.iter().map(|v| i32::from(*v).abs()).max().unwrap();
                assert!(peak > 100 && peak <= 14746);
                assert_ne!(pcm(cue, SoundTheme::Soft), pcm(cue, SoundTheme::Crisp));
            }
        }
    }
    #[test]
    fn transitions_are_once_only_and_initial_recovery_is_silent() {
        let mut t = Tracker::default();
        let a = Status {
            id: 1,
            paused: false,
            recovery: false,
        };
        assert!(t.observe(None, false).is_empty());
        assert_eq!(t.observe(Some(a), false), vec![Cue::Start]);
        assert!(t.observe(Some(a), false).is_empty());
        assert_eq!(
            t.observe(Some(Status { paused: true, ..a }), false),
            vec![Cue::Pause]
        );
        assert_eq!(t.observe(Some(a), false), vec![Cue::Resume]);
        assert_eq!(t.observe(Some(a), true), vec![Cue::Warning]);
        assert!(t.observe(Some(a), true).is_empty());
        assert_eq!(t.observe(None, false), vec![Cue::End]);
        let mut restarted = Tracker::default();
        assert!(
            restarted
                .observe(
                    Some(Status {
                        paused: true,
                        recovery: true,
                        ..a
                    }),
                    true
                )
                .is_empty()
        );
    }
}
```

## E:\WorkMemo\src-tauri\src\tracking_tests.rs

```rust
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
```

## E:\WorkMemo\src-tauri\src\windows.rs

```rust
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
```

## E:\WorkMemo\src\App.css

```css
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
```

## E:\WorkMemo\src\Dashboard.css

```css
body:has(.data-center) {
  overflow: auto;
  background: #f4f7f5;
}
.data-center {
  font:
    14px/1.6 "Segoe UI",
    "Microsoft YaHei UI",
    sans-serif;
  color: #263449;
  background: #f4f7f5;
  min-height: 100vh;
  --accent: #287b63;
  --on-accent: #fff;
  --accent-text: #287b63;
  --text-muted: #64748b;
  --line: #e2e8f0;
  --control-radius: 9px;
  --input-rgb: 255 255 255;
  --button-shadow: none;
  --error: #b42332;
  --error-background: #fff0f1;
  --text-primary: #263449;
}
.data-center * {
  box-sizing: border-box;
}
.data-center button,
.data-center input,
.data-center select,
.data-center textarea {
  font: inherit;
}
.data-center button {
  width: auto;
  justify-content: center;
  gap: 7px;
  padding: 9px 14px;
  box-shadow: none;
  border: 1px solid transparent;
  border-radius: 8px;
  line-height: 1.5;
  background: #287b63;
  color: #fff;
}
.data-center button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.data-center button:hover:not(:disabled) {
  background: #20634f;
}
.data-center button:focus-visible,
.data-center input:focus-visible,
.data-center select:focus-visible,
.data-center textarea:focus-visible {
  outline: 3px solid #a6cbb7;
  outline-offset: 2px;
}
.data-center input,
.data-center select,
.data-center textarea {
  margin: 0;
  padding: 9px 11px;
  border: 1px solid #dce3ed;
  background: #fff;
  color: #263449;
  border-radius: 8px;
  line-height: 1.5;
}
.data-center label {
  font-size: 12px;
  color: #64748b;
  display: grid;
  gap: 5px;
}
.data-center a {
  color: #287b63;
  text-decoration: none;
}
.data-center p {
  margin: 0;
}
.data-center h1,
.data-center h2,
.data-center h3 {
  margin: 0;
  letter-spacing: -0.025em;
}
.data-center h2 {
  font-size: 17px;
  color: #1e293b;
  font-weight: 650;
}
.data-center .icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
}
.data-center table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-center th {
  font-size: 11px;
  font-weight: 600;
  color: #7b899d;
  background: #f8fafd;
  text-align: left;
  padding: 9px 14px;
  border-block: 1px solid #edf1f6;
  white-space: nowrap;
}
.data-center td {
  padding: 10px 14px;
  border-bottom: 1px solid #edf1f6;
  vertical-align: middle;
}
.data-center tbody tr:hover {
  background: #fafcff;
}
.data-center .work-badge {
  font-size: 13px;
  font-weight: 600;
  gap: 7px;
  white-space: nowrap;
}
.data-center .work-symbol {
  width: 28px;
  height: 28px;
}
.data-center .work-symbol .icon {
  font-size: 15px;
}
.dc-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 64px;
  background: #13223a;
  color: #c8d2e3;
  display: flex;
  flex-direction: column;
  padding: 32px 18px;
  z-index: 5;
}
.dc-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 36px;
  color: #fff !important;
  font-size: 22px;
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: -0.5px;
}
.dc-brand img {
  width: 38px;
  height: 38px;
}
.dc-brand small {
  display: block;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 2px;
  color: #9aaac2;
  margin-top: 7px;
}
.dc-side-label {
  font-size: 9px;
  letter-spacing: 2px;
  color: #72849f;
  padding: 0 14px;
  margin: 5px 0 13px;
}
.data-center button.dc-side-link {
  width: 100%;
  justify-content: flex-start;
  gap: 12px;
  background: transparent;
  color: #9fadc3;
  padding: 12px 16px;
  border-radius: 9px;
  margin-bottom: 7px;
  font-size: 13px;
}
.data-center button.dc-side-link.selected,
.data-center button.dc-side-link:hover {
  color: #eef3ff;
  background: #243c61;
}
.dc-sidebar-bottom {
  margin-top: auto;
  padding: 20px 12px 0;
  font-size: 11px;
  color: #91a3bd;
}
.dc-sidebar-bottom small {
  display: block;
  font-size: 10px;
  line-height: 1.9;
  color: #7084a0;
  margin-top: 13px;
}
.connection-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #b9815c;
  margin-right: 7px;
}
.connection-dot.connected {
  background: #4dd4ae;
}
.dc-page {
  margin-left: 64px;
}
.dc-topbar {
  height: 56px;
  padding: 0 20px;
  border-bottom: 1px solid #e5eaf2;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #475569;
  font-size: 12px;
}
.dc-topbar > span > span {
  color: #9aa5b5;
  margin-left: 16px;
}
.dc-main {
  max-width: 1440px;
  margin: auto;
  padding: 20px 20px 0;
}
.dc-heading {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-bottom: 12px;
}
.dc-eyebrow {
  color: #7c8ca4;
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 2.2px;
  margin-bottom: 8px !important;
}
.dc-heading h1 {
  font-size: 28px;
  font-weight: 650;
  color: #17263e;
  margin-bottom: 8px;
}
.dc-heading p:not(.dc-eyebrow) {
  font-size: 12px;
  color: #8190a5;
}
.dc-scope {
  min-width: 160px;
}
.dc-demo-banner,
.dc-active {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid #ead6a4;
  background: #fff9e9;
  border-radius: 10px;
  color: #8e6728;
  font-size: 12px;
  margin-bottom: 18px;
}
.dc-active {
  background: #edf8f4;
  border-color: #cfe9df;
  color: #447c67;
}
.dc-error {
  padding: 12px 15px;
  color: #a3293a;
  background: #fff0f2;
  border: 1px solid #f2cdd4;
  border-radius: 8px;
  margin: 12px 0 !important;
  font-size: 13px;
  overflow-wrap: anywhere;
}
.dc-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 16px;
  width: 100%;
  min-width: 0;
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  margin-bottom: 14px;
  padding: 12px 16px;
  box-shadow: 0 3px 15px #172f5803;
}
.dc-ranges {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 0;
}
.data-center button.dc-range {
  font-size: 12px;
  padding: 6px 13px;
  background: #fff;
  color: #718198;
}
.data-center button.dc-range[aria-pressed="true"] {
  color: #287b63;
  background: #edf2ff;
  font-weight: 600;
}
.dc-filters form {
  display: flex;
  flex: 1 1 780px;
  min-width: 0;
  align-items: end;
  gap: 8px;
  flex-wrap: wrap;
}
.dc-filters label {
  flex: 1 1 100px;
  min-width: 100px;
}
.dc-filters label:has(input[type=date]) { flex-basis: 140px; }
.dc-filters label.dc-scope { min-width: 120px; }
.dc-filters input,.dc-filters select { width:100%; }
.dc-filters input {
  min-width: 140px;
}
.dc-filters select {
  min-width: 100px;
}
.dc-date-separator {
  display: none;
  color: #b3bcc9;
  align-self: flex-end;
  padding-bottom: 10px;
}
.data-center .dc-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 37px;
  background: #287b63;
  color: #fff;
  border: 1px solid #287b63;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
}
.data-center .dc-button.subtle {
  background: #fff;
  color: #64748b;
  border-color: #dce4ef;
}
.data-center .dc-button.subtle:hover {
  background: #f7f9fd;
}
.dc-filters .dc-button {
  flex: 0 0 auto;
  margin-left: 0;
}
.dc-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.dc-kpi {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  padding: 14px 16px;
}
.dc-kpi > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #6f7f95;
}
.dc-kpi .icon {
  color: #8da4cc;
  font-size: 17px;
}
.dc-kpi > strong {
  display: block;
  font-size: 26px;
  line-height: 1.7;
  font-weight: 650;
  color: #1b2c47;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
  overflow-wrap: anywhere;
}
.dc-kpi > strong small {
  font-size: 11px;
  font-weight: 400;
  color: #8b98aa;
  margin-left: 7px;
  letter-spacing: 0;
}
.dc-kpi p {
  font-size: 10px;
  color: #93a0b2;
}
.dc-card {
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  min-width: 0;
  overflow: hidden;
}
.dc-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 14px 16px 8px;
}
.dc-card-title p {
  color: #94a0b1;
  font-size: 11px;
  margin-top: 5px;
}
.dc-card-title select {
  font-size: 11px;
  max-width: 130px;
  padding: 5px 8px;
}
.dc-chip {
  font-size: 9px;
  letter-spacing: 0.5px;
  color: #8f9db0;
  border: 1px solid #e8edf5;
  border-radius: 5px;
  padding: 4px 8px;
  white-space: nowrap;
}
.dc-chart-grid { margin: 16px 0 12px; }
.dc-trend { min-width: 0; }
.dc-trend .dc-chart { height: 250px; width: 100%; }
.dc-category .dc-chart { height: 180px; }
.dc-chart { flex:1 1 0; height:auto; min-height:280px; overflow:hidden; }
.dc-category .dc-chart { height:134px; }
.dc-chart {
  width: 100%;
  height: 260px;
}
.dc-calendar {
  grid-area: calendar;
  width: 100%;
  min-width: 0;
  margin-bottom: 0;
}
.dc-calendar .dc-chart {
  width: 100%;
  height: 148px;
}
.dc-table-scroll {
  overflow: auto;
}
.dc-records {
  scroll-margin-top: 20px;
}
.dc-records .dc-card-title {
  padding-bottom: 21px;
}
.dc-remark {
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #8a97a9;
}
.dc-status {
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 5px;
  background: #f0f4fa;
  color: #7b8aa2;
  white-space: nowrap;
}
.dc-status.complete {
  background: #eaf6f0;
  color: #36886a;
}
.dc-status.pending {
  background: #fff5df;
  color: #ac802f;
}
.demo-tag {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 9px;
  background: #fff1cc;
  color: #ae8426;
  margin-left: 6px;
  font-weight: 400;
  white-space: nowrap;
}
.dc-row-actions {
  display: flex;
  gap: 11px;
  white-space: nowrap;
}
.data-center .dc-row-actions button {
  display: inline;
  padding: 0;
  font-size: 11px;
  border: 0;
  background: transparent !important;
  color: #4469c7;
}
.data-center .dc-row-actions button.danger {
  color: #c57a82;
}
.data-center .tabular {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dc-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  color: #97a2b3;
  font-size: 11px;
}
.dc-pagination > div {
  display: flex;
  align-items: center;
  gap: 14px;
}
.dc-pagination .dc-button {
  font-size: 11px;
  padding: 6px 10px;
  min-height: 30px;
}
.dc-page-footer {
  text-align: center;
  color: #a3aec0;
  font-size: 10px;
  padding: 28px 0 25px;
}
.dc-empty {
  text-align: center;
  background: #fff;
  border: 1px dashed #dce4ef;
  border-radius: 12px;
  padding: 27px;
  color: #92a0b3;
  margin-bottom: 14px;
}
.dc-empty > .icon {
  font-size: 25px;
  width: 30px;
  height: 30px;
  color: #a9b9d1;
}
.dc-empty h2 {
  font-size: 15px;
  margin: 9px 0 5px;
  color: #64748b;
}
.dc-empty p {
  font-size: 12px;
}
.dc-loading {
  padding: 15px;
  text-align: center;
  color: #8090a6;
}
.dc-overlay,
.dc-confirm-overlay {
  position: fixed;
  inset: 0;
  background: #13223a66;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(3px);
}
.dc-drawer {
  width: min(600px, 100vw);
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -12px 0 60px #15233d26;
}
.dc-drawer > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 28px;
  border-bottom: 1px solid #e8edf4;
}
.dc-drawer > header h2 {
  margin-top: 5px;
}
.data-center button.dc-icon-button {
  display: flex;
  padding: 7px;
  background: transparent;
  color: #64748b;
  border: 0;
}
.dc-drawer-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 25px 28px;
}
.dc-record-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #f6f8fc;
  border-radius: 10px;
}
.dc-record-summary > strong {
  margin-left: auto;
  font:
    600 22px ui-monospace,
    monospace;
  color: #273c60;
}
.dc-record-summary > span:last-child {
  font-size: 11px;
  color: #8391a7;
}
.dc-detail-times {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 22px 0 26px;
}
.dc-detail-times dt {
  font-size: 10px;
  color: #96a2b3;
}
.dc-detail-times dd {
  margin: 5px 0 0;
  font-size: 12px;
  color: #53677e;
}
.dc-drawer form {
  display: grid;
  gap: 17px;
}
.dc-drawer form label {
  font-size: 12px;
  color: #60728b;
}
.dc-drawer textarea {
  resize: vertical;
}
.dc-muted {
  color: #94a0b1;
  font-size: 11px;
  line-height: 1.8;
}
.dc-detail-quantity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 12px;
  color: #8390a4;
}
.dc-detail-quantity strong {
  font-size: 22px;
  color: #263e65;
}
.dc-detail-remark {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.9;
  padding: 15px;
  background: #f8fafd;
  border-radius: 8px;
}
.dc-audit {
  margin-top: 22px;
  border-top: 1px solid #e8edf5;
  padding-top: 16px;
}
.dc-audit summary {
  font-size: 12px;
  color: #60738f;
  cursor: pointer;
}
.dc-audit .dc-muted {
  margin-top: 13px;
}
.dc-segment {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f3f7;
  font-size: 11px;
  color: #93a0b2;
}
.dc-segment strong {
  color: #60758f;
  font-variant-numeric: tabular-nums;
}
.dc-revision {
  padding: 14px 0;
  border-bottom: 1px solid #edf1f6;
  font-size: 11px;
  color: #8290a5;
}
.dc-revision strong {
  color: #5e728d;
}
.dc-revision p {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  margin-top: 7px;
}
.dc-drawer > footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
  padding: 18px 28px;
  border-top: 1px solid #e8edf4;
}
.dc-unsaved {
  font-size: 11px;
  color: #af8536;
}
.dc-confirm-overlay {
  z-index: 30;
  justify-content: center;
  align-items: center;
}
.dc-confirm {
  background: #fff;
  border-radius: 14px;
  padding: 27px;
  width: min(460px, calc(100vw - 32px));
  box-shadow: 0 20px 90px #17253a3b;
}
.dc-confirm h2 {
  margin-bottom: 13px;
}
.dc-confirm p {
  font-size: 13px;
  color: #7a8a9f;
  margin: 8px 0;
}
.dc-confirm > div {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 23px;
  flex-wrap: wrap;
}
.data-center .danger-fill {
  background: #bd4656;
  border-color: #bd4656;
}
@media (max-width: 1100px) {
  .dc-sidebar {
    width: 180px;
    padding-inline: 12px;
  }
  .dc-page {
    margin-left: 180px;
  }
  .dc-main {
    padding: 24px 20px 0;
  }
  .dc-topbar {
    padding-inline: 22px;
  }
  .dc-kpis {
    gap: 10px;
  }
  .dc-kpi {
    padding: 15px;
  }
  .dc-kpi > strong {
    font-size: 25px;
  }
  .dc-kpi p {
    min-height: 30px;
  }
}
@media (max-width: 760px) {
  .dc-sidebar {
    display: none;
  }
  .dc-page {
    margin-left: 0;
  }
  .dc-main {
    padding: 20px 12px 0;
  }
  .dc-topbar {
    height: 58px;
    padding-inline: 15px;
  }
  .dc-heading h1 {
    font-size: 22px;
  }
  .dc-heading {
    align-items: start;
    gap: 12px;
  }
  .dc-scope {
    min-width: 110px;
  }
  .dc-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dc-filters {
    padding: 13px;
  }
  .dc-filters form {
    gap: 9px;
  }
  .dc-filters label {
    flex: 1;
  }
  .dc-filters input {
    min-width: 120px;
  }
  .dc-date-separator {
    display: none;
  }
  .dc-card-title {
    padding: 17px 15px;
  }
  .dc-pagination {
    flex-wrap: wrap;
    gap: 12px;
  }
  .dc-drawer-body {
    padding: 18px;
  }
  .dc-detail-times {
    grid-template-columns: 1fr;
  }
  .dc-record-summary {
    flex-wrap: wrap;
  }
  .dc-drawer > header,
  .dc-drawer > footer {
    padding: 18px;
  }
}

.dc-modal {
  position: fixed;
  inset: 0;
  border: 0;
  margin: 0;
  padding: 0;
  background: transparent;
  width: 100vw;
  height: 100vh;
  max-width: none;
  max-height: none;
  overflow: hidden;
  color: #263449;
}
.dc-modal::backdrop {
  background: #13223a66;
  backdrop-filter: blur(3px);
}
.dc-modal[open] {
  display: flex;
}
.dc-drawer-modal {
  justify-content: flex-end;
}
.dc-drawer-modal > .dc-drawer {
  height: 100vh;
}
.dc-confirm-modal {
  justify-content: center;
  align-items: center;
}

/* Reference: compact light cards with an icon navigation rail. */
.dc-sidebar { padding:20px 10px; background:#fff; color:#64748b; border-right:1px solid #e2e8f0; }
.dc-brand { padding:0 3px 24px; }
.dc-brand img { width:34px; height:34px; }
.dc-brand > span,.dc-side-label,.dc-side-link > .dc-nav-label { display:none; }
.data-center button.dc-side-link { justify-content:center; padding:11px; color:#64748b; }
.data-center button.dc-side-link.selected,.data-center button.dc-side-link:hover:not(:disabled) { color:#284b38; background:#eaf1ec; }
.dc-sidebar-bottom { padding:12px 0 0; font-size:0; text-align:center; }
.dc-sidebar-bottom small { display:none; }
.connection-dot { margin:0; width:8px; height:8px; }
.dc-heading h1 { font-size:22px; margin-bottom:4px; }
.dc-kpi > strong { line-height:1.5; }
.dc-kpi p,.dc-card-title p { color:#64748b; }
.dc-heat-legend { display:flex; align-items:center; justify-content:center; gap:4px; padding:0 12px 12px; font-size:10px; color:#64748b; }
.dc-heat-legend i { display:block; width:11px; height:11px; border-radius:2px; border:1px solid #1f23281a; }
.data-center button { transition:background-color .14s,border-color .14s,color .14s; }
.data-center button.dc-icon-button:hover:not(:disabled) { background:#eef2f6; color:#334155; }
.data-center button.dc-range:hover:not(:disabled) { background:#f0f3f8; color:#334155; }
.data-center .dc-row-actions button:hover:not(:disabled) { color:#284b38; text-decoration:underline; }
.data-center .dc-button.subtle:hover:not(:disabled) { color:#334155; border-color:#c4ceda; }
.data-center button.danger-fill:hover:not(:disabled) { background:#a83c4c; border-color:#a83c4c; }
.data-center button.dc-range[aria-pressed="true"]:hover:not(:disabled) { background:#e3f0e8; color:#287b63; }
.dc-trend { min-width:0; }
@media (min-width:761px) and (max-width:1100px) { .dc-sidebar { width:64px; padding-inline:10px; } .dc-page { margin-left:64px; }  }



/* Period reports: quantities remain separate for each type of work. */
.dc-main { max-width: 1320px; }
.dc-heading { margin-block: 4px 18px; }
.dc-eyebrow { display: block; font-size: 10px; color: #52816b; letter-spacing: 1.8px; margin-bottom: 6px; }
.dc-heading h1 { font-size: 26px; font-weight: 650; }
.dc-filters { display: flex; flex-direction: column; align-items: stretch; padding: 16px 20px; gap: 16px; background: #fff; border-color: #e1e9e3; }
.dc-period-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.dc-period-tabs { display: inline-flex; gap: 3px; padding: 3px; background: #f1f5f2; border-radius: 9px; }
.data-center .dc-period-tabs .dc-range { margin: 0; padding: 6px 16px; border-radius: 6px; white-space: nowrap; background: transparent; color: #60776a; }
.data-center .dc-period-tabs .dc-range[aria-pressed="true"] { background: #fff; color: #24654d; box-shadow: 0 1px 4px #173e2510; }
.dc-period-nav { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.dc-period-nav strong { min-width: 150px; text-align: center; color: #304e3e; font-size: 14px; }
.data-center .dc-period-nav .dc-icon-button { height: 30px; width: 30px; padding: 0; background: #f5f8f5; border: 1px solid #e2e9e4; color: #486754; font-size: 22px; line-height: 1; }
.dc-filters form { flex: none; width: 100%; gap: 10px; }
.dc-filters form label { flex: 1 1 120px; min-width: 110px; }
.dc-filters form label:first-child { flex-grow: 1.2; }
.dc-filters form input, .dc-filters form select { width: 100%; min-width: 0; }
.dc-kpis { grid-template-columns: repeat(3,minmax(0,1fr)); margin-block: 16px; }
.dc-kpi { padding: 16px 20px; border-color: #e1e9e3; }
.dc-kpi > strong { font-size: 28px; color: #284d3a; }
.dc-category-report { border-color: #dce7df; }
.dc-report-table th:first-child { width: 28%; }
.dc-report-table tbody th { background: transparent; border-top: 0; border-bottom: 1px solid #edf2ee; color: #284232; }
.dc-report-table tbody td, .dc-report-table tbody th { padding: 14px 20px; }
.dc-report-table .work-badge { white-space: normal; overflow-wrap: anywhere; }
.dc-report-table .work-badge > span:last-child, .dc-active .work-badge > span:last-child { white-space: normal; overflow: visible; text-overflow: clip; overflow-wrap: anywhere; }
.dc-active { flex-wrap: wrap; }
.dc-active > .work-badge { flex: 0 0 auto; max-width: 100%; }
.dc-active > span:not(.work-badge) { flex: 1 1 220px; min-width: 0; }
.dc-report-table .work-symbol { flex-shrink: 0; }
.dc-report-quantity strong { overflow-wrap: anywhere; display: block; font-size: 23px; color: #284d3a; font-weight: 650; line-height: 1.3; font-variant-numeric: tabular-nums; }
.dc-report-quantity small { display: block; color: #7b8e82; font-size: 11px; margin-top: 3px; }
.dc-pending-count { display: inline-block; border-radius: 5px; padding: 2px 8px; background: #fff5df; color: #8d6b29; white-space: nowrap; }
.dc-muted { color: #93a298; }
.dc-report-note, .dc-report-empty { padding: 12px 20px; color: #7b8e82; font-size: 11px; }
.dc-report-empty { padding-top: 0; color: #5f7567; }
.dc-category-report .dc-loading { padding: 28px 20px; }
.dc-auxiliary { margin-block: 12px 16px; border: 1px solid #e1e9e3; background: #fff; border-radius: 12px; }
.dc-auxiliary > summary { cursor: pointer; padding: 14px 20px; color: #486754; font-size: 13px; }
.dc-auxiliary > summary span { margin-left: 12px; color: #91a196; font-size: 11px; }
.dc-auxiliary-grid { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 12px; padding: 0 14px 14px; }
.dc-auxiliary-grid > article { min-width: 0; grid-area: auto; }
.dc-card { border-color: #e1e9e3; }
@media (max-width:640px) {
 .dc-main { padding: 16px 12px 0; }
 .dc-filters { padding: 12px; }
 .dc-period-bar { justify-content: center; }
 .dc-period-nav { justify-content: center; gap: 5px; }
 .dc-period-nav strong { min-width: 130px; font-size: 12px; }
 .dc-kpis { gap: 8px; }
 .dc-kpi { padding: 12px 10px; }
 .dc-kpi > strong { font-size: 22px; }
 .dc-kpi p { line-height: 1.5; }
 .dc-report-table thead { display: none; }
 .dc-report-table, .dc-report-table tbody { display: block; }
 .dc-report-table tr { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14px 18px; padding: 18px; border-bottom: 1px solid #edf2ee; }
 .dc-report-table tbody th { grid-column: 1 / -1; width: auto; }
 .dc-report-table tbody td, .dc-report-table tbody th { display: block; padding: 0; border: 0; }
 .dc-report-table td::before { content: attr(data-label); display: block; color: #91a196; font-size: 11px; margin-bottom: 4px; }
 .dc-report-quantity strong { font-size: 21px; }
 .dc-auxiliary-grid { grid-template-columns: minmax(0,1fr); }
 .dc-auxiliary > summary span { display: block; margin-left: 18px; }
 .dc-trend .dc-chart { height: 240px; }
}
```

## E:\WorkMemo\src\Dashboard.tsx

```tsx
import { shiftPeriod, reportRangeLabel, type ReportPeriod, type ReportRange } from "./reportPeriod";
import { useCategoryNames, type CategoryNames } from "./categoryNames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { init, use as registerCharts } from "echarts/core";
import { BarChart, LineChart, HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { ECharts, EChartsOption } from "echarts";
import {
  CATEGORIES,
  formatDuration,
  formatTime,
  type WorkRecord,
  type SettleInput,
} from "./types";
import { formatQuantity, localDate } from "./history";
import {
  DEFAULT_PRESENTATION,
  WorkBadge,
  type Presentation,
} from "./desktopPreferences";
import { validateWorkInput } from "./workInput";
import { Icon } from "./Icon";
import "./Dashboard.css";

function Modal({
  children,
  label,
  onClose,
  drawer = false,
}: {
  children: React.ReactNode;
  label: string;
  onClose: () => void;
  drawer?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`dc-modal ${drawer ? "dc-drawer-modal" : "dc-confirm-modal"}`}
      aria-labelledby={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {children}
    </dialog>
  );
}

registerCharts([
  BarChart,
  LineChart,
  HeatmapChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  CalendarComponent,
  VisualMapComponent,
  CanvasRenderer,
]);
type Row = WorkRecord & { is_demo: boolean; demo_batch: string | null };
type Query = {
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  category: string | null;
  scope: "real" | "demo" | "all";
  status: string;
  page: number;
};
type Data = {
  range: ReportRange;
  record_count: number;
  totals: {
    duration_ms: number;
    quantity: number;
    records: number;
    pending: number;
  };
  trend: {
    date: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  monthly: boolean;
  categories: {
    complete: number;
    pending: number;
    category: string;
    duration_ms: number;
    quantity: number;
    records: number;
  }[];
  calendar: [string, number][];
  records: Row[];
  page: number;
  pages: number;
  scope: string;
};
type Detail = {
  record: Row;
  segments: {
    id: number;
    start_time: number;
    end_time: number | null;
    duration_ms: number;
    state: string;
  }[];
  revisions: {
    revision: number;
    changed_at: number;
    before: WorkRecord;
    after: WorkRecord;
  }[];
};
type Meta = {
  version: string;
  category_names: CategoryNames;
  presentation: Presentation;
  active: WorkRecord | null;
};
class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}
const entry = new URLSearchParams(location.hash.slice(1));
const incoming = entry.get("token");
if (incoming) {
  sessionStorage.setItem("workmemo-token", incoming);
  history.replaceState(null, "", location.pathname + location.search);
}
const sessionToken = incoming ?? sessionStorage.getItem("workmemo-token") ?? "";
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return localDate(d);
}
function initialQuery(): Query {
  const pending = entry.get("view") === "pending";
  return { period: pending ? "custom" : "day", anchor_date: null,
    start_date: null, end_date: null, category: null,
    scope: entry.get("scope") === "demo" ? "demo" : "real",
    status: pending ? "pending" : "all", page: 1 };
}
async function api<T>(path: string, body?: unknown): Promise<T> {
  if (!sessionToken)
    throw new ApiError("请从 WorkMemo 打开数据中心，以建立本机连接。", 403);
  try {
    const response = await fetch(`/api/${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(
        "连接授权已失效，请从 WorkMemo 重新打开数据中心。",
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiError(
        (data as { error?: string }).error ?? "操作未完成。",
        response.status,
      );
    return data as T;
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(
      "与 WorkMemo 的连接已中断。请保持软件在后台运行，再刷新连接。",
    );
  }
}
function Chart({
  option,
  label,
  onCategory,
}: {
  option: EChartsOption;
  label: string;
  onCategory?: (name: string) => void;
}) {
  const node = useRef<HTMLDivElement>(null);
  const chart = useRef<ECharts | null>(null);
  const click = useRef(onCategory);
  click.current = onCategory;
  useEffect(() => {
    if (!node.current) return;
    const instance = init(node.current, undefined, { renderer: "canvas" });
    chart.current = instance;
    instance.on("click", (p) => {
      if (typeof p.name === "string") click.current?.(p.name);
    });
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const host = node.current;
        if (host && (instance.getWidth() !== host.clientWidth || instance.getHeight() !== host.clientHeight)) {
          instance.resize();
        }
      });
    });
    observer.observe(node.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(resizeFrame);
      instance.dispose();
      chart.current = null;
    };
  }, []);
  useEffect(() => {
    chart.current?.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);
  return <div ref={node} role="img" aria-label={label} className="dc-chart" />;
}
const tooltip = {
  renderMode: "richText" as const,
  backgroundColor: "#ffffff",
  borderColor: "#e2e8f0",
  textStyle: { color: "#1e293b" },
  extraCssText: "",
};
function statusName(row: Row) {
  return row.status === "WORKING"
    ? "进行中"
    : row.settlement_status === "PENDING"
      ? "待补全"
      : "已确认";
}
export default function Dashboard() {
  const [query, setQuery] = useState<Query>(initialQuery);
  const [filters, setFilters] = useState<Query>(initialQuery);
  const [auxiliaryOpen, setAuxiliaryOpen] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const { name, accept: acceptCategoryNames } = useCategoryNames();
  const [meta, setMeta] = useState<Meta | null>(null);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({
    category: "开发",
    quantity: "",
    remark: "",
  });
  const [editorError, setEditorError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const quantityInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) { quantityInput.current?.focus(); quantityInput.current?.scrollIntoView({block:"nearest"}); } }, [editing]);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [guard, setGuard] = useState(false);
  const next = useRef<(() => void) | null>(null);
  const [categoryMetric, setCategoryMetric] = useState("duration");
  const dirty =
    !!detail &&
    editing &&
    (fields.category !== detail.record.category ||
      fields.quantity !==
        (detail.record.quantity === null
          ? ""
          : String(detail.record.quantity)) ||
      fields.remark !== detail.record.remark);
  const presentation = meta?.presentation ?? DEFAULT_PRESENTATION;
  useEffect(() => {
    let stopped = false;
    let reading = false;
    setLoading(true);
    setData(null);
    async function load() {
      if (reading) return;
      reading = true;
      try {
        const metadata = await api<Meta>("meta");
        if (stopped) return;
        setMeta(metadata);
        acceptCategoryNames(metadata.category_names);
        setOnline(true);
        {
          const rows = await api<Data>("query", query);
          if (!stopped) {
            setData(rows);
            setError("");
          }
        }
      } catch (e) {
        if (!stopped) {
          setError(String(e instanceof Error ? e.message : e));
          if (!(e instanceof ApiError) || e.status === 0 || e.status === 403)
            setOnline(false);
        }
      } finally {
        reading = false;
        if (!stopped) setLoading(false);
      }
    }
    void load();
    const timer = setInterval(() => {
      if (!document.hidden) void load();
    }, 2000);
    const focus = () => {
      void load();
    };
    window.addEventListener("focus", focus);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [query, refresh, acceptCategoryNames]);
  function applyQuery(update: Query) { setFilters(update); setQuery(update); }
  function selectPeriod(period: ReportPeriod) {
    applyQuery({ ...filters, period, anchor_date: period === "custom" ? null : (filters.anchor_date || data?.range.anchor_date || null),
      start_date: period === "custom" ? data?.range.start_date ?? null : null,
      end_date: period === "custom" ? data?.range.end_date ?? null : null, page: 1 });
  }
  function movePeriod(direction: number) {
    const anchor = data?.range.anchor_date;
    if (!anchor) return;
    const shifted = shiftPeriod(query.period, anchor, direction);
    if (shifted) applyQuery({ ...query, anchor_date: shifted, page: 1 });
  }
  async function openDetail(row: Row, edit = false) {
    if (busyRef.current) return;
    const action = async () => {
      busyRef.current = true;
      setBusy(true);
      setEditorError("");
      try {
        const value = await api<Detail>("detail", { id: row.id });
        setDetail(value);
        setFields({
          category: value.record.category,
          quantity:
            value.record.quantity === null ? "" : String(value.record.quantity),
          remark: value.record.remark,
        });
        setEditing(edit && value.record.status === "FINISHED");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    };
    if (dirty) {
      next.current = () => {
        void action();
      };
      setGuard(true);
    } else await action();
  }
  function leave(action: () => void) {
    if (busyRef.current) return;
    if (dirty) {
      next.current = action;
      setGuard(true);
    } else action();
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
    try {
      const input: SettleInput = {
        ...result.input,
        quantity: result.input.quantity,
        id: detail.record.id,
        expected_revision: detail.record.revision,
      };
      await api("save", input);
      const updated = await api<Detail>("detail", { id: detail.record.id });
      setDetail(updated);
      setEditing(false);
      setFields({
        category: updated.record.category,
        quantity:
          updated.record.quantity === null
            ? ""
            : String(updated.record.quantity),
        remark: updated.record.remark,
      });
      setRefresh((v) => v + 1);
      return true;
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [detail, fields, online]);
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s" && editing) {
        e.preventDefault();
        void save();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        if (guard) {
          setGuard(false);
          next.current = null;
        } else if (deleting && !busy) setDeleting(null);
        else if (detail) leave(() => setDetail(null));
      }
    }
    function unload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
    };
  }, [dirty, guard, deleting, detail, editing, save, busy]);
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
      if (detail?.record.id === deleting.id) {
        setDetail(null);
        setEditing(false);
      }
      setDeleting(null);
      setRefresh((v) => v + 1);
    } catch (e) {
      setEditorError(e instanceof Error ? e.message : String(e));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  const trend = useMemo<EChartsOption>(() => ({
    animationDuration: 250,
    tooltip: { ...tooltip, trigger: "axis", valueFormatter: (value: unknown) => `${Number(value).toLocaleString("zh-CN", {maximumFractionDigits:4})} 小时` },
    legend: { top: 0, right: 16, data: ["有效工时"] },
    // Preserve a separate row for axis units below the legend.
    grid: { left: 22, right: 24, top: 64, bottom: 20, containLabel: true },
    xAxis: { type: "category", boundaryGap: false,
      data: data?.trend.map(x => x.date) ?? [],
      axisLine: { lineStyle: { color: "#dce7e0" } }, axisTick: { show: false },
      axisLabel: { color: "#718078", hideOverlap: true, showMinLabel: true, showMaxLabel: true,
        formatter: (value: string) => data?.range.trend_unit === "hour" ? value : value.slice(5) } },
    yAxis: { type: "value", name: "小时", min: 0,
      splitLine: { lineStyle: { color: "#edf2ef", type: "dashed" } }, axisLabel: { color: "#718078" } },
    series: [{ name: "有效工时", type: "line", smooth: false, symbolSize: 5,
      data: data?.trend.map(x => x.duration_ms / 3600000) ?? [],
      lineStyle: { width: 2.5, color: "#287b63" }, itemStyle: { color: "#287b63" },
      areaStyle: { color: "#eaf3ee", opacity: 0.7 } }],
  }), [data]);
  const categoryOption = useMemo<EChartsOption>(
    () => ({
      animationDuration: 300,
      tooltip: { ...tooltip, trigger: "axis" },
      grid: { left: 12, right: 22, top: 25, bottom: 28, containLabel: true },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#eef2f7" } } },
      yAxis: {
        type: "category",
        data: data?.categories.map((x) => name(x.category)) ?? [],
        axisLabel: { width: 100, overflow: "truncate" },
        axisTick: { show: false },
        axisLine: { show: false },
      },
      series: [
        {
          type: "bar",
          barMaxWidth: 24,
          data:
            data?.categories.map((x) => ({
              name: name(x.category),
              value:
                categoryMetric === "duration"
                  ? Number((x.duration_ms / 3600000).toFixed(2))
                  : x.quantity,
              itemStyle: {
                color: presentation.categories[x.category]?.color,
                borderRadius: [0, 5, 5, 0],
              },
            })) ?? [],
        },
      ],
    }),
    [data, categoryMetric, presentation, name],
  );
  const calendarOption = useMemo<EChartsOption>(() => {
    const end = data?.range.end_date ?? daysAgo(0);
    const start = new Date(end + "T12:00:00");
    start.setDate(start.getDate() - 89);
    const startDate = data?.range.start_date && data.range.start_date > localDate(start) ? data.range.start_date : localDate(start);
    return {
      tooltip: {
        ...tooltip,
        formatter: (p: unknown) => {
          const point = (p as { value?: [string, number] }).value;
          return point
            ? `${point[0]}  ${(point[1] / 3600000).toFixed(2)} 小时`
            : "";
        },
      },
      visualMap: {
        type: "piecewise", show: false,
        pieces: [
          {value:0,color:"#ebedf0"},
          ...["#9be9a8","#40c463","#30a14e","#216e39"].map((color,index) => ({gt:index*Math.max(1,...(data?.calendar.map(v=>v[1])??[1]))/4,lte:(index+1)*Math.max(1,...(data?.calendar.map(v=>v[1])??[1]))/4,color})),
        ],
      },
      calendar: {
        range: [startDate, end],
        cellSize: [16, 16],
        left: "center",
        top: 32,
        yearLabel: { show: false },
        monthLabel: { nameMap: "cn", color: "#64748b" },
        dayLabel: { firstDay: 1, nameMap: "cn", color: "#94a3b8" },
        splitLine: { lineStyle: { color: "#dce4ef" } },
        itemStyle: { borderWidth: 3, borderColor: "#fff", color: "#ebedf0" },
      },
      series: [
        {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: data?.calendar ?? [],
        },
      ],
    };
  }, [data]);
  const totals = data?.totals;
  return (
    <div className="data-center">
      <aside className="dc-sidebar">
        <a className="dc-brand" href="/dashboard" aria-label="WorkMemo 工作数据中心" title="WorkMemo 工作数据中心">
          <img src="/workmemo.png" alt="" />
          <span>
            WorkMemo<small>工作数据中心</small>
          </span>
        </a>
        <div className="dc-side-label">WORKSPACE</div>
        <button
          className="dc-side-link selected" aria-label="工作总览" title="工作总览"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <Icon name="chart" />
          <span className="dc-nav-label">工作总览</span>
        </button>
        <button
          className="dc-side-link" aria-label="工作明细" title="工作明细"
          onClick={() =>
            document
              .getElementById("records")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          <Icon name="list" />
          <span className="dc-nav-label">工作明细</span>
        </button>
        <div className="dc-sidebar-bottom">
          <span className={`connection-dot ${online ? "connected" : ""}`} />
          {online ? "本机连接正常" : "等待本机连接"}
          <small>
            记录保存在你的电脑中
            <br />v{meta?.version ?? "0.2.2"}
          </small>
        </div>
      </aside>
      <div className="dc-page">
        <header className="dc-topbar">
          <span>
            我的工作空间 <span>/ 工作总览</span>
          </span>
          <button
            className="dc-button subtle"
            onClick={() => setRefresh((v) => v + 1)}
          >
            <Icon name="refresh" />
            刷新连接
          </button>
        </header>
        <main className="dc-main">
          <div className="dc-heading">
            <div>
              <span className="dc-eyebrow">WORK REPORT</span>
              <h1>工作总览</h1>
              <p>按类型看清工作量，按周期回顾投入。</p>
            </div>

          </div>
          {query.scope !== "real" && (
            <div className="dc-demo-banner">
              <Icon name="bulb" />
              <span>
                {query.scope === "demo"
                  ? "正在查看演示数据"
                  : "当前结果包含演示数据"}{" "}
                · 示例仅用于查看效果，日常真实统计默认排除。
              </span>
            </div>
          )}
          {error && (
            <div className="dc-error" role="alert">
              {error}
            </div>
          )}
          {meta?.active && (
            <div className="dc-active">
              <WorkBadge
                category={meta.active.category}
                presentation={presentation}
              />
              <span>
                {meta.active.is_paused ? "当前任务已暂停" : "当前任务正在计时"}{" "}
                · 结束后可在这里补填工作量
              </span>
            </div>
          )}
          <section className="dc-filters" aria-label="筛选工作数据">
            <div className="dc-period-bar">
              <div className="dc-period-tabs" aria-label="统计周期">
                {([["day","日"],["week","周"],["month","月"],["custom","自定义"]] as const).map(([id,label]) =>
                  <button key={id} className="dc-range" aria-pressed={filters.period===id} onClick={() => selectPeriod(id)}>{label}</button>)}
              </div>
              {query.period !== "custom" && <div className="dc-period-nav">
                <button className="dc-icon-button" aria-label="上一周期" disabled={!data?.range.anchor_date || !shiftPeriod(query.period,data.range.anchor_date,-1)} onClick={() => movePeriod(-1)}>‹</button>
                <strong>{data ? reportRangeLabel(data.range) : "正在读取周期…"}</strong>
                <button className="dc-icon-button" aria-label="下一周期" disabled={!data?.range.anchor_date || !shiftPeriod(query.period,data.range.anchor_date,1)} onClick={() => movePeriod(1)}>›</button>
                <button className="dc-button subtle" onClick={() => applyQuery({...query,anchor_date:null,page:1})}>{({day:"今天",week:"本周",month:"本月",custom:"当前"})[query.period]}</button>
              </div>}
            </div>
            <form onSubmit={e => { e.preventDefault(); applyQuery({...filters,page:1}); }}>
              {filters.period === "custom" ? <>
                <label>开始日期<input type="date" min="1970-01-01" max="9999-12-31" value={filters.start_date??""} onChange={e=>setFilters({...filters,start_date:e.target.value||null})}/></label>
                <label>结束日期<input type="date" min="1970-01-01" max="9999-12-31" value={filters.end_date??""} onChange={e=>setFilters({...filters,end_date:e.target.value||null})}/></label>
                <button type="button" className="dc-button subtle" onClick={()=>applyQuery({...filters,start_date:null,end_date:null,page:1})}>全部日期</button>
              </> : <label>基准日期<input type="date" required min="1970-01-01" max="9999-12-31" value={filters.anchor_date??data?.range.anchor_date??daysAgo(0)} onChange={e=>setFilters({...filters,anchor_date:e.target.value})}/></label>}
              <label>类别<select aria-label="筛选工作类别" value={filters.category??""} onChange={e=>setFilters({...filters,category:e.target.value||null})}>
                <option value="">全部类别</option>{CATEGORIES.map(c=><option key={c} value={c}>{name(c)}</option>)}
              </select></label>
              <label>状态<select aria-label="筛选记录状态" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
                <option value="all">全部状态</option><option value="pending">待补全</option><option value="complete">已确认</option><option value="working">进行中</option>
              </select></label>
              <label className="dc-scope">数据范围<select value={filters.scope} onChange={e=>setFilters({...filters,scope:e.target.value as Query["scope"]})}>
                <option value="real">真实数据</option><option value="demo">演示数据</option><option value="all">全部数据</option>
              </select></label>
              <button type="submit" className="dc-button"><Icon name="search"/>应用筛选</button>
            </form>
          </section>
          <section className="dc-kpis" aria-label="工作数据汇总">
            {[
              {
                label: "有效工时",
                value: totals
                  ? `${(totals.duration_ms / 3600000).toFixed(1)}`
                  : "—",
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
            ].map((k) => (
              <article className="dc-kpi" key={k.label}>
                <div>
                  <span>{k.label}</span>
                  <Icon name={k.icon} />
                </div>
                <strong>
                  {k.value}
                  <small>{k.unit}</small>
                </strong>
                <p>{k.caption}</p>
              </article>
            ))}
          </section>
          <section className="dc-card dc-category-report" aria-label="按类型汇总工作量">
            <div className="dc-card-title"><div><h2>分类工作量</h2><p>{data ? reportRangeLabel(data.range) : "正在读取…"} · 数量按类型分别合计</p></div><span className="dc-chip">自动汇总</span></div>
            {loading && !data ? <p role="status" className="dc-loading">正在读取本机工作数据…</p> : data ? <>
              <table className="dc-report-table">
                <thead><tr><th scope="col">工作类型</th><th scope="col">已确认工作量</th><th scope="col">有效工时</th><th scope="col">已结束记录</th><th scope="col">待补填</th></tr></thead>
                <tbody>{data.categories.map(row=><tr key={row.category}>
                  <th scope="row"><WorkBadge category={row.category} presentation={presentation}/></th>
                  <td data-label="已确认工作量" className="dc-report-quantity"><strong>{row.complete>0 ? formatQuantity(row.quantity) : row.pending>0 ? "待补填" : "—"}</strong><small>{row.complete>0 ? `已确认 ${row.complete} 条` : row.pending>0 ? "尚未确认产出" : "暂无已结束记录"}</small></td>
                  <td data-label="有效工时" className="tabular">{formatDuration(row.duration_ms/1000)}</td>
                  <td data-label="已结束记录" className="tabular">{row.records} 条</td>
                  <td data-label="待补填"><span className={row.pending>0?"dc-pending-count":"dc-muted"}>{row.pending} 条</span></td>
                </tr>)}</tbody>
              </table>
              <p className="dc-report-note">按记录开始日期归属周期。未补填不视为 0；当前任务不计入此报表。</p>
              {data.totals.records===0 && <p className="dc-report-empty">这个范围还没有已结束记录。结束工作后会在这里自动汇总。</p>}
            </> : <p className="dc-loading">暂无统计结果，请检查连接后重试。</p>}
          </section>
          <section className="dc-chart-grid">
            <article className="dc-card dc-trend">
              <div className="dc-card-title">
                <div>
                  <h2>工作趋势</h2>
                  <p>
                    {data?.range.trend_unit === "hour" ? "按开始小时汇总" : data?.range.trend_unit === "month" ? "按开始月份汇总" : "按开始日期汇总"} · 已结束记录的有效工时
                  </p>
                </div>
                <span className="dc-chip">时间视角</span>
              </div>
              <Chart option={trend} label="有效工时趋势" />
            </article>
          </section>
          <details className="dc-auxiliary" onToggle={event => setAuxiliaryOpen(event.currentTarget.open)}>
            <summary>辅助分析<span>类别分布与工作日历</span></summary>
            {auxiliaryOpen && <div className="dc-auxiliary-grid">
            <article className="dc-card dc-category">
              <div className="dc-card-title">
                <div>
                  <h2>类别分布</h2>
                  <p>点击类别条形可筛选</p>
                </div>
                <select
                  aria-label="类别统计指标"
                  value={categoryMetric}
                  onChange={(e) => setCategoryMetric(e.target.value)}
                >
                  <option value="duration">工时（小时）</option>
                  <option value="quantity">工作量</option>
                </select>
              </div>
              <Chart
                option={categoryOption}
                label="按类别汇总的工作分布"
                onCategory={(label) => {
                  const key = CATEGORIES.find(c => name(c) === label);
                  if (key) {
                    const update = { ...query, category: key, page: 1 };
                    setQuery(update);
                    setFilters(update);
                  }
                }}
              />
            </article>
            <article className="dc-card dc-calendar">
            <div className="dc-card-title">
              <div>
                <h2>工作的节奏</h2>
                <p>已应用筛选范围 · 最多展示近90天有效工时</p>
              </div>
            </div>
            <Chart option={calendarOption} label="筛选范围内的有效工时工作日历" />
            <div className="dc-heat-legend" aria-label="工时由少到多">少 {["#ebedf0","#9be9a8","#40c463","#30a14e","#216e39"].map(color=><i key={color} style={{background:color}}/>)} 多</div>
            </article>
            </div>}
          </details>
          <section className="dc-card dc-records" id="records">
            <div className="dc-card-title">
              <div>
                <h2>每一段工作，都有来处</h2>
                <p>查看计时区间、补填工作量，或回顾修正记录。</p>
              </div>
              <span className="dc-chip">{data?.record_count ?? 0} 条记录</span>
            </div>
            <div className="dc-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>类别</th>
                    <th>开始时间</th>
                    <th>有效工时</th>
                    <th>工作量</th>
                    <th>状态</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.records.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <WorkBadge
                          category={row.category}
                          presentation={presentation}
                        />
                        {row.is_demo && (
                          <small className="demo-tag">演示</small>
                        )}
                      </td>
                      <td>{formatTime(row.start_time)}</td>
                      <td className="tabular">
                        {formatDuration(row.duration_ms / 1000)}
                      </td>
                      <td className="tabular">
                        {row.settlement_status === "COMPLETE"
                          ? formatQuantity(row.quantity)
                          : "待补填"}
                      </td>
                      <td>
                        <span
                          className={`dc-status ${row.settlement_status.toLowerCase()}`}
                        >
                          {statusName(row)}
                        </span>
                      </td>
                      <td className="dc-remark" title={row.remark}>
                        {row.remark || "—"}
                      </td>
                      <td>
                        <div className="dc-row-actions">
                          <button
                            onClick={() => {
                              void openDetail(row);
                            }}
                          >
                            详情
                          </button>
                          <button
                            disabled={
                              !online || busy || row.status !== "FINISHED"
                            }
                            onClick={() => {
                              void openDetail(row, true);
                            }}
                          >
                            {row.settlement_status === "PENDING"
                              ? "补填"
                              : "编辑"}
                          </button>
                          <button
                            className="danger"
                            disabled={
                              !online || busy || row.status !== "FINISHED"
                            }
                            onClick={() => {
                              setEditorError("");
                              setDeleting(row);
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="dc-pagination">
              <span>每页50条 · 共{data?.pages ?? 1}页</span>
              <div>
                <button
                  className="dc-button subtle"
                  disabled={!data || data.page <= 1}
                  onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
                >
                  <Icon name="left" />
                  上一页
                </button>
                <span>
                  {data?.page ?? 1} / {data?.pages ?? 1}
                </span>
                <button
                  className="dc-button subtle"
                  disabled={!data || data.page >= data.pages}
                  onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
                >
                  下一页
                  <Icon name="right" />
                </button>
              </div>
            </footer>
          </section>
          <footer className="dc-page-footer">
            WorkMemo · 记录留在本机，注意力留给手上的事。
          </footer>
        </main>
      </div>
      {detail && (
        <Modal
          drawer
          label="detail-title"
          onClose={() => leave(() => setDetail(null))}
        >
          <section className="dc-drawer">
            <header>
              <div>
                <span className="dc-eyebrow">
                  WORK RECORD #{detail.record.id}
                </span>
                <h2 id="detail-title">
                  {editing ? "填写工作量" : "工作详情"}
                  {detail.record.is_demo && (
                    <span className="demo-tag">演示数据</span>
                  )}
                </h2>
              </div>
              <button
                className="dc-icon-button"
                aria-label="关闭工作详情"
                disabled={busy}
                onClick={() => leave(() => setDetail(null))}
              >
                <Icon name="close" />
              </button>
            </header>
            <div className="dc-drawer-body">
              <div className="dc-record-summary">
                <WorkBadge
                  category={detail.record.category}
                  presentation={presentation}
                />
                <strong>
                  {formatDuration(detail.record.duration_ms / 1000)}
                </strong>
                <span>{statusName(detail.record)}</span>
              </div>
              <dl className="dc-detail-times">
                <div>
                  <dt>开始</dt>
                  <dd>{formatTime(detail.record.start_time)}</dd>
                </div>
                <div>
                  <dt>结束</dt>
                  <dd>
                    {detail.record.end_time
                      ? formatTime(detail.record.end_time)
                      : "尚未结束"}
                  </dd>
                </div>
              </dl>
              {editing ? (
                <form
                  id="dc-editor"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void save();
                  }}
                >
                  <label>
                    工作类别
                    <select
                      disabled={busy}
                      value={fields.category}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, category: e.target.value }))
                      }
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{name(c)}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    工作量
                    <input
                      disabled={busy}
                      ref={quantityInput}
                      type="number"
                      min={0}
                      max={1e9}
                      step="any"
                      placeholder="0表示无产出"
                      value={fields.quantity}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, quantity: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    备注
                    <textarea
                      disabled={busy}
                      maxLength={4000}
                      rows={5}
                      value={fields.remark}
                      onChange={(e) =>
                        setFields((p) => ({ ...p, remark: e.target.value }))
                      }
                    />
                  </label>
                  <p className="dc-muted">
                    这里修改类别、数量和备注，计时结果保持原样。Ctrl+S 保存。
                  </p>
                </form>
              ) : (
                <>
                  <div className="dc-detail-quantity">
                    <span>已确认工作量</span>
                    <strong>
                      {detail.record.settlement_status === "COMPLETE"
                        ? formatQuantity(detail.record.quantity)
                        : "待补填"}
                    </strong>
                  </div>
                  <p className="dc-detail-remark">
                    {detail.record.remark || "未填写备注。"}
                  </p>
                </>
              )}
              {editorError && (
                <p className="dc-error" role="alert">
                  {editorError}
                </p>
              )}
              <details className="dc-audit">
                <summary>计时区间（{detail.segments.length}）</summary>
                {detail.segments.length === 0 ? (
                  <p className="dc-muted">
                    旧记录仅保留累计工时，没有可展示的区间。
                  </p>
                ) : (
                  detail.segments.map((s) => (
                    <div className="dc-segment" key={s.id}>
                      <span>
                        {formatTime(s.start_time)}
                        <br />
                        {s.end_time ? formatTime(s.end_time) : "计时中"}
                      </span>
                      <strong>{formatDuration(s.duration_ms / 1000)}</strong>
                    </div>
                  ))
                )}
              </details>
              <details className="dc-audit">
                <summary>修正记录（{detail.revisions.length}）</summary>
                {detail.revisions.length === 0 ? (
                  <p className="dc-muted">尚无修正。</p>
                ) : (
                  detail.revisions.map((r) => (
                    <div key={r.revision} className="dc-revision">
                      <strong>
                        第{r.revision}次 · {formatTime(r.changed_at)}
                      </strong>
                      <p>
                        {name(r.before?.category)} → {name(r.after?.category)} · 数量{" "}
                        {formatQuantity(r.before?.quantity)} →{" "}
                        {formatQuantity(r.after?.quantity)}
                      </p>
                      <p>
                        备注：{r.before?.remark || "未填"} →{" "}
                        {r.after?.remark || "未填"}
                      </p>
                    </div>
                  ))
                )}
              </details>
            </div>
            <footer>
              {dirty && <span className="dc-unsaved">有未保存修改</span>}
              {editing ? (
                <button
                  className="dc-button"
                  key="save-workload"
                  form="dc-editor"
                  type="submit"
                  disabled={busy || !online}
                >
                  {busy ? "正在保存…" : "保存工作量"}
                </button>
              ) : (
                <button
                  className="dc-button"
                  disabled={!online || detail.record.status !== "FINISHED"}
                  key="edit-workload"
                  type="button"
                  title={detail.record.status !== "FINISHED" ? "请先结束工作，再编辑工作量" : "编辑类别、数量和备注"}
                  onClick={() => setEditing(true)}
                >
                  编辑工作量
                </button>
              )}
            </footer>
          </section>
        </Modal>
      )}
      {deleting && (
        <Modal
          label="delete-title"
          onClose={() => {
            if (!busy) setDeleting(null);
          }}
        >
          <section className="dc-confirm">
            <h2 id="delete-title">删除这条记录？</h2>
            <p>
              {name(deleting.category)} · {formatTime(deleting.start_time)}
              {deleting.is_demo ? " · 演示数据" : ""}
            </p>
            <p>删除后不可撤销，计时区间和修正记录也会一同删除。</p>
            {editorError && <p className="dc-error">{editorError}</p>}
            <div>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => setDeleting(null)}
              >
                取消
              </button>
              <button
                className="dc-button danger-fill"
                disabled={busy || !online}
                onClick={() => {
                  void remove();
                }}
              >
                {busy ? "正在删除…" : "确认删除"}
              </button>
            </div>
          </section>
        </Modal>
      )}
      {guard && (
        <Modal
          label="unsaved-title"
          onClose={() => {
            if (!busy) {
              setGuard(false);
              next.current = null;
            }
          }}
        >
          <section className="dc-confirm">
            <h2 id="unsaved-title">保留未保存的修改？</h2>
            <p>保存成功后再离开；保存失败会保留输入。</p>
            {editorError && <p className="dc-error">{editorError}</p>}
            <div>
              <button
                className="dc-button"
                disabled={busy || !online}
                onClick={() => {
                  void save().then((ok) => {
                    if (ok) {
                      setGuard(false);
                      const action = next.current;
                      next.current = null;
                      action?.();
                    }
                  });
                }}
              >
                保存并继续
              </button>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => {
                  setGuard(false);
                  setEditing(false);
                  const action = next.current;
                  next.current = null;
                  action?.();
                }}
              >
                放弃修改
              </button>
              <button
                className="dc-button subtle"
                disabled={busy}
                onClick={() => {
                  setGuard(false);
                  next.current = null;
                }}
              >
                继续编辑
              </button>
            </div>
          </section>
        </Modal>
      )}
    </div>
  );
}
```

## E:\WorkMemo\src\SettingsExtras.tsx

```tsx
import { CategoryNamesEditor } from "./CategoryNamesEditor";
import { useCategoryNames } from "./categoryNames";
import { useEffect, useState } from "react";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { Surface, useDraft } from "./Drafts";
import { Icon } from "./Icon";
import { CATEGORIES } from "./types";
import {
  DEFAULT_LAYOUT,
  useLayout,
  WORK_ICONS,
  WorkBadge,
  type LayoutSettings,
  type PresentationController,
} from "./desktopPreferences";
const iconLabels: Record<string, string> = {
  checkSquare: "检查",
  safety: "盾牌",
  code: "代码",
  note: "文档",
  search: "搜索",
  chart: "图表",
  list: "清单",
  clock: "时钟",
  star: "星标",
  rocket: "火箭",
  bulb: "灵感",
  tool: "工具",
  read: "阅读",
  check: "完成",
  home: "主页",
  settings: "设置",
};
export function VisualSettings({
  presentation,
}: {
  presentation: PresentationController;
}) {
  const { name } = useCategoryNames();
  const { current, setVisual } = presentation;
  const compact = useLayout().current.density === "compact";
  useDraft(
    "category-visuals",
    presentation.dirty,
    presentation.busy,
    presentation.save,
    presentation.cancel,
  );
  return (
    <Surface
      title="工作名称、图标与颜色"
      actions={
        <>
          <button
            className="secondary"
            disabled={presentation.busy}
            onClick={presentation.cancel}
          >
            取消预览
          </button>
          <button
            disabled={presentation.busy || !presentation.loaded || !isTauri()}
            onClick={() => {
              void presentation.save();
            }}
          >
            保存工作外观
          </button>
        </>
      }
    >
      <p className="hint">
        同一类别在主页、状态岛和数据中心使用相同的图标与颜色。
      </p>
      <CategoryNamesEditor />
      {CATEGORIES.map((category) => {
        const visual = current.categories[category];
        return (
          <fieldset key={category} className="visual-category">
            <legend>
              <WorkBadge category={category} presentation={current} />
            </legend>
            <label className="color-field">
              类别颜色
              <input
                aria-label={`${name(category)}颜色`}
                type="color"
                value={visual.color}
                disabled={presentation.busy}
                onChange={(e) =>
                  setVisual(category, { ...visual, color: e.target.value })
                }
              />
              <span>{visual.color}</span>
            </label>
            <details open={!compact}>
              <summary>选择图标：{iconLabels[visual.icon]}</summary>
              <div className="icon-picker">
                {WORK_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={iconLabels[icon]}
                    aria-label={`${name(category)}使用${iconLabels[icon]}图标`}
                    aria-pressed={visual.icon === icon}
                    className="secondary"
                    disabled={presentation.busy}
                    onClick={() => setVisual(category, { ...visual, icon })}
                  >
                    <Icon name={icon} />
                  </button>
                ))}
              </div>
            </details>
          </fieldset>
        );
      })}
      {presentation.error && (
        <p className="error-banner" role="alert">
          {presentation.error}
        </p>
      )}
    </Surface>
  );
}
export function LayoutPanel() {
  const layout = useLayout();
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [saved, setSaved] = useState(DEFAULT_LAYOUT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(current) !== JSON.stringify(saved);
  useEffect(() => {
    if (layout.loaded && !dirty && !busy) {
      setCurrent(layout.current);
      setSaved(layout.current);
    }
  }, [layout.current, layout.loaded]);
  async function save() {
    if (busy) return false;
    setBusy(true);
    setError("");
    try {
      const result = await invoke<LayoutSettings>("set_layout_options", {
        input: {
          density: current.density,
          sound_enabled: current.sound_enabled,
          sound_theme: current.sound_theme,
          font_size: current.font_size,
          font_weight: current.font_weight,
          line_spacing: current.line_spacing,
          expected_revision: saved.revision,
        },
      });
      setSaved(result);
      setCurrent(result);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  useDraft("layout", dirty, busy, save, () => {
    setCurrent(saved);
    setError("");
  });
  function field<K extends keyof LayoutSettings>(
    name: K,
    value: LayoutSettings[K],
  ) {
    setCurrent((p) => ({ ...p, [name]: value }));
  }
  return (
    <Surface
      title="布局、字体与音效"
      actions={
        <button
          disabled={busy || !layout.loaded || !isTauri()}
          onClick={() => {
            void save();
          }}
        >
          保存布局
        </button>
      }
    >
      <div className="layout-form">
        <label className="monitor-toggle"><input type="checkbox" checked={current.sound_enabled} disabled={busy} onChange={e => field("sound_enabled", e.target.checked)}/>关键状态提示音</label>
        <label>提示音套装<select aria-label="提示音套装" value={current.sound_theme??"soft"} disabled={busy} onChange={event=>field("sound_theme",event.target.value as LayoutSettings["sound_theme"])}>
          <option value="soft">柔和轻提示</option><option value="crisp">清脆短提示</option>
        </select></label>
        <div className="sound-preview-buttons" aria-label="分别试听提示音">
          {([["start","开始"],["pause","暂停"],["resume","恢复"],["end","结束"],["warning","空闲提醒"]] as const).map(([cue,label])=><button key={cue} type="button" className="secondary" disabled={!isTauri()||busy} onClick={()=>{void invoke("preview_sound",{theme:current.sound_theme??"soft",cue}).catch(e=>setError(String(e)));}}>试听{label}</button>)}
        </div>
        <p className="hint">试听当前选择，保存布局后应用。试听不受提示音开关限制；日常只在状态变化时响一次。</p>
        <label>
          界面模式
          <select
            disabled={busy}
            value={current.density}
            onChange={(e) =>
              field("density", e.target.value as LayoutSettings["density"])
            }
          >
            <option value="comfortable">舒展 · 完整信息</option>
            <option value="compact">紧凑 · 极简信息</option>
          </select>
        </label>
        <p className="hint">
          紧凑模式让主窗口成为小计时器，二级页面默认折叠辅助内容；错误与恢复提醒始终可见。
        </p>
        <label>
          正文字号：{current.font_size}px
          <input
            type="range"
            min={12}
            max={18}
            step={1}
            value={current.font_size}
            disabled={busy}
            onChange={(e) => field("font_size", Number(e.target.value))}
          />
        </label>
        <label>
          文字粗细
          <select
            disabled={busy}
            value={current.font_weight}
            onChange={(e) => field("font_weight", Number(e.target.value))}
          >
            {[
              [400, "常规"],
              [500, "中等"],
              [600, "半粗"],
              [700, "加粗"],
            ].map(([v, n]) => (
              <option value={v} key={v}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          行距
          <select
            disabled={busy}
            value={current.line_spacing}
            onChange={(e) =>
              field(
                "line_spacing",
                e.target.value as LayoutSettings["line_spacing"],
              )
            }
          >
            <option value="tight">紧密</option>
            <option value="standard">标准</option>
            <option value="loose">宽松</option>
          </select>
        </label>
        <div
          className="font-preview"
          style={{
            fontSize: current.font_size,
            fontWeight: current.font_weight,
            lineHeight: { tight: 1.35, standard: 1.6, loose: 1.85 }[
              current.line_spacing
            ],
          }}
        >
          把注意力留给手上的事。
          <br />
          计时、类别和操作，清楚就好。
        </div>
        <button
          className="secondary"
          disabled={busy}
          onClick={() => {
            setBusy(true);
            void invoke("reset_window_layout")
              .then(() => invoke<LayoutSettings>("get_layout_settings"))
              .then((result) => {
                setCurrent(result);
                setSaved(result);
                void layout.reload();
              })
              .catch((e) => setError(String(e)))
              .finally(() => setBusy(false));
          }}
        >
          恢复所有窗口默认布局
        </button>
      </div>
      {(error || layout.error) && (
        <p className="error-banner" role="alert">
          {error || layout.error}
        </p>
      )}
    </Surface>
  );
}
```

## E:\WorkMemo\src\desktopPreferences.tsx

```tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { invoke, isTauri, convertFileSrc } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { CATEGORIES, type Category } from "./types";
import { useCategoryNames } from "./categoryNames";
import { Icon, type IconName } from "./Icon";

export type CategoryVisual = { icon: IconName; color: string };
export type Background = { file: string; opacity: number };
export type Presentation = {
  version: 1;
  revision: number;
  categories: Record<string, CategoryVisual>;
  background: Background | null;
};
export const DEFAULT_PRESENTATION: Presentation = {
  version: 1,
  revision: 0,
  background: null,
  categories: Object.fromEntries(
    CATEGORIES.map((name, i) => [
      name,
      {
        icon: (["checkSquare", "safety", "code", "note"] as IconName[])[i],
        color: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][i],
      },
    ]),
  ),
};
export const WORK_ICONS: IconName[] = [
  "checkSquare",
  "safety",
  "code",
  "note",
  "search",
  "chart",
  "list",
  "clock",
  "star",
  "rocket",
  "bulb",
  "tool",
  "read",
  "check",
  "home",
  "settings",
];
export type LayoutSettings = {
  density: "compact" | "comfortable";
  revision: number;
  sound_enabled: boolean;
  sound_theme: "soft" | "crisp";
  font_size: number;
  font_weight: number;
  line_spacing: "tight" | "standard" | "loose";
};
export const DEFAULT_LAYOUT: LayoutSettings = {
  density: "comfortable",
  revision: 0,
  sound_enabled: true,
  sound_theme: "soft",
  font_size: 14,
  font_weight: 400,
  line_spacing: "standard",
};
export function layoutStyle(layout: LayoutSettings): CSSProperties {
  return {
    "--body-size": `${layout.font_size}px`,
    "--body-weight": layout.font_weight,
    "--body-line": { tight: 1.35, standard: 1.6, loose: 1.85 }[
      layout.line_spacing
    ],
  } as CSSProperties;
}
export function backgroundStyle(background: Background): CSSProperties {
  return {
    backgroundImage: `url("${convertFileSrc(background.file, "background")}")`,
    opacity: background.opacity / 100,
  };
}
export function WorkBadge({
  category,
  presentation,
  showName = true,
}: {
  category: string;
  presentation: Presentation;
  showName?: boolean;
}) {
  const { name } = useCategoryNames();
  const visual =
    presentation.categories[category] ??
    DEFAULT_PRESENTATION.categories["开发"];
  return (
    <span
      className="work-badge"
      style={{ "--work-color": visual.color } as CSSProperties}
    >
      <span className="work-symbol">
        <Icon name={visual.icon} />
      </span>
      {showName && <span>{name(category)}</span>}
    </span>
  );
}
export function useLayout() {
  const [current, setCurrent] = useState(DEFAULT_LAYOUT);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const reload = useCallback(async () => {
    if (!isTauri()) return;
    try {
      setCurrent(await invoke<LayoutSettings>("get_layout_settings"));
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:layout-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  return { current, error, loaded, reload };
}
export function usePresentation() {
  const [current, setCurrent] = useState(DEFAULT_PRESENTATION);
  const [saved, setSaved] = useState(DEFAULT_PRESENTATION);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(!isTauri());
  const saving = useRef(false);
  const state = useRef({ current, saved });
  state.current = { current, saved };
  const reload = useCallback(async () => {
    if (
      !isTauri() ||
      saving.current ||
      JSON.stringify(state.current.current) !==
        JSON.stringify(state.current.saved)
    )
      return;
    try {
      const p = await invoke<Presentation>("get_presentation");
      setSaved(p);
      setCurrent(p);
      setError("");
      setLoaded(true);
    } catch (e) {
      setError(String(e));
    }
  }, []);
  useEffect(() => {
    void reload();
    if (!isTauri()) return;
    const p = listen("workmemo:presentation-changed", () => {
      void reload();
    });
    return () => {
      void p.then((f) => f()).catch(() => {});
    };
  }, [reload]);
  async function save() {
    if (!isTauri() || saving.current) return false;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const p = await invoke<Presentation>("save_presentation", {
        settings: current,
      });
      setCurrent(p);
      setSaved(p);
      return true;
    } catch (e) {
      setError(String(e));
      return false;
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  async function importImage() {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const bg = await invoke<Background | null>("import_background");
      if (bg) setCurrent((p) => ({ ...p, background: bg }));
    } catch (e) {
      setError(String(e));
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return {
    current,
    saved,
    busy,
    error,
    loaded,
    dirty: JSON.stringify(current) !== JSON.stringify(saved),
    save,
    reload,
    importImage,
    cancel: () => {
      if (!saving.current) {
        setCurrent(saved);
        setError("");
      }
    },
    setBackground: (background: Background | null) =>
      setCurrent((p) => ({ ...p, background })),
    setVisual: (category: Category | string, visual: CategoryVisual) =>
      setCurrent((p) => ({
        ...p,
        categories: { ...p.categories, [category]: visual },
      })),
  };
}
export type PresentationController = ReturnType<typeof usePresentation>;
export function useDashboard() {
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const last = useRef({ view: "all", scope: "real" });
  async function open(view = "all", scope = "real", defaultBrowser = false) {
    last.current = { view, scope };
    setError("");
    try {
      await invoke("open_dashboard", { view, scope, defaultBrowser });
      setUrl("");
    } catch (e) {
      setError(String(e));
      try {
        setUrl(await invoke<string>("get_dashboard_address", { view, scope }));
      } catch (f) {
        setError(String(f));
      }
    }
  }
  return {
    open,
    fallback: error && (
      <div className="error-banner" role="alert">
        <p>{error}</p>
        {url && (
          <>
            <input
              aria-label="本机数据中心地址"
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
            />
            <div className="data-buttons">
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(url)
                    .catch(() =>
                      setError("请选中上面的地址，按 Ctrl+C 复制。"),
                    );
                }}
              >
                复制地址
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  void open(last.current.view, last.current.scope, true);
                }}
              >
                使用默认浏览器
              </button>
            </div>
          </>
        )}
      </div>
    ),
  };
}
```

## E:\WorkMemo\src\reportPeriod.ts

```typescript
import { localDate } from "./history.ts";

export type ReportPeriod = "day" | "week" | "month" | "custom";
export interface ReportRange {
  period: ReportPeriod;
  anchor_date: string | null;
  start_date: string | null;
  end_date: string | null;
  trend_unit: "hour" | "day" | "month";
}
export function shiftPeriod(period: ReportPeriod, anchor: string, direction: number): string | null {
  const date = new Date(`${anchor}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || period === "custom") return null;
  if (period === "month") { date.setDate(1); date.setMonth(date.getMonth() + direction); }
  else date.setDate(date.getDate() + direction * (period === "week" ? 7 : 1));
  return date.getFullYear() >= 1970 && date.getFullYear() <= 9999 ? localDate(date) : null;
}
export function reportRangeLabel(range: ReportRange): string {
  if (range.period === "day") return range.start_date?.replace(/-/g, ".") ?? "今天";
  if (range.period === "month") return range.start_date ? range.start_date.slice(0, 7).replace("-", " 年 ") + " 月" : "本月";
  return `${range.start_date ?? "最早记录"} — ${range.end_date ?? "至今"}`;
}
```

## E:\WorkMemo\tests\report-period.test.mjs

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftPeriod, reportRangeLabel} from '../src/reportPeriod.ts';

test('自然周期切换跨年、闰月与长短月不跳过月份',()=>{
  assert.equal(shiftPeriod('month','2024-01-31',1),'2024-02-01');
  assert.equal(shiftPeriod('month','2026-12-31',1),'2027-01-01');
  assert.equal(shiftPeriod('day','2024-02-28',1),'2024-02-29');
  assert.equal(shiftPeriod('day','2024-02-29',1),'2024-03-01');
  assert.equal(shiftPeriod('week','2026-12-28',1),'2027-01-04');
  assert.equal(shiftPeriod('week','2027-01-04',-1),'2026-12-28');
});
test('周期导航拒绝越过数据日期边界，自定义范围不假装自然周期',()=>{
  assert.equal(shiftPeriod('day','1970-01-01',-1),null);
  assert.equal(shiftPeriod('month','9999-12-01',1),null);
  assert.equal(shiftPeriod('custom','2026-10-29',1),null);
  assert.equal(shiftPeriod('day','invalid',1),null);
  assert.equal(reportRangeLabel({period:'custom',start_date:null,end_date:null}),'最早记录 — 至今');
  assert.equal(reportRangeLabel({period:'month',start_date:'2026-10-01'}),'2026 年 10 月');
});
```
