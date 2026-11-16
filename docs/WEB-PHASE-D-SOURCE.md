# 网页阶段 D 完整脚本与配置

2026-11-16。5 个脚本/配置完整内容，无省略；验收和候选交付见 WEB-PHASE-D.md。

## E:\WorkMemo\scripts\package-windows.ps1

```powershell
[CmdletBinding()]
param([string]$OutputDirectory)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
if ($env:OS -ne 'Windows_NT') { throw 'This packaging script requires Windows x64.' }
foreach ($tool in @('node', 'npm.cmd', 'cargo')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Missing build tool: $tool. See docs/BUILDING.md." }
}
$nodeMajor = & node -p "process.versions.node.split('.')[0]"
$nodeArch = & node -p 'process.arch'
if ($nodeMajor -ne '24' -or $nodeArch -ne 'x64') { throw 'Use Node.js 24 x64 for this Windows x64 package.' }
$configuration = Get-Content -LiteralPath (Join-Path $taskRoot 'src-tauri/tauri.conf.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$package = Get-Content -LiteralPath (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$version = [string]$configuration.version
if ($version -notmatch '^\d+\.\d+\.\d+$' -or $version -ne $package.version) { throw 'Invalid or mismatched release version.' }
# Only the executable being overwritten must be stopped. Installed/ZIP copies
# may keep running: packaging reads source resources, never their work database.
$releaseExecutable = [IO.Path]::GetFullPath((Join-Path $taskRoot 'src-tauri/target/release/workmemo.exe'))
$running = Get-Process -Name workmemo -ErrorAction SilentlyContinue | Where-Object {
    -not $_.Path -or [IO.Path]::GetFullPath($_.Path) -eq $releaseExecutable
}
if ($running) { throw 'The build output is running or cannot be identified. Close that copy before packaging.' }
$artifactRoot = [IO.Path]::GetFullPath((Join-Path $taskRoot 'artifacts'))
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
    $output = Join-Path $artifactRoot $version
} else {
    $output = [IO.Path]::GetFullPath($(if ([IO.Path]::IsPathRooted($OutputDirectory)) { $OutputDirectory } else { Join-Path $taskRoot $OutputDirectory }))
    if (-not $output.StartsWith($artifactRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
        throw 'A custom output directory must be inside the workspace artifacts directory.'
    }
}

Push-Location $taskRoot
try {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
    & node 'scripts/collect-licenses.mjs'
    if ($LASTEXITCODE -ne 0) { throw 'Dependency notice collection failed.' }
    & node 'node_modules/@tauri-apps/cli/tauri.js' build --ci --no-binary-patching
    if ($LASTEXITCODE -ne 0) { throw 'Tauri build failed.' }
    $binary = Join-Path $taskRoot 'src-tauri/target/release/workmemo.exe'
    $setupName = "WorkMemo_${version}_x64-setup.exe"
    $setup = Join-Path $taskRoot "src-tauri/target/release/bundle/nsis/$setupName"
    if (-not (Test-Path -LiteralPath $setup -PathType Leaf)) { throw "Installer not found: $setup" }
    [System.IO.Directory]::CreateDirectory($output) | Out-Null
    $notices = Join-Path $output 'THIRD-PARTY-LICENSES.txt'
    Copy-Item -LiteralPath (Join-Path $taskRoot 'docs/THIRD-PARTY-LICENSES.txt') -Destination $notices -Force
    Copy-Item -LiteralPath $setup -Destination (Join-Path $output $setupName) -Force

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zipName = "WorkMemo_${version}_windows_x64.zip"
    $zipPath = Join-Path $output $zipName
    $stream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
    try {
        $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $true)
        try {
            foreach ($entry in @(
                @{ Source = $binary; Name = 'WorkMemo/workmemo.exe' },
                @{ Source = (Join-Path $taskRoot 'docs/USER-GUIDE.md'); Name = 'WorkMemo/使用说明.md' },
                @{ Source = $notices; Name = 'WorkMemo/THIRD-PARTY-LICENSES.txt' }
            )) {
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $entry.Source, $entry.Name, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
            $browserResources = Join-Path $taskRoot 'src-tauri/target/browser-resources'
            foreach ($resource in (Get-ChildItem -LiteralPath $browserResources -Recurse -File)) {
                $relative = $resource.FullName.Substring($browserResources.Length + 1).Replace('\','/')
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $resource.FullName, ('WorkMemo/' + $relative), [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
            }
        } finally { $archive.Dispose() }
    } finally { $stream.Dispose() }
    $checksums = foreach ($name in @($setupName, $zipName, 'THIRD-PARTY-LICENSES.txt')) {
        $hash = (Get-FileHash -LiteralPath (Join-Path $output $name) -Algorithm SHA256).Hash.ToLowerInvariant()
        "$hash  $name"
    }
    [System.IO.File]::WriteAllLines((Join-Path $output 'SHA256SUMS.txt'), $checksums, [System.Text.UTF8Encoding]::new($false))
    Write-Output "Delivery files: $output"
} finally { Pop-Location }
```

## E:\WorkMemo\scripts\verify-web-phase-d.mjs

```javascript
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
```

## E:\WorkMemo\scripts\verify-native-dashboard.mjs

```javascript
// Read-only smoke check of the isolated Tauri server and its embedded web assets.
// Never print the endpoint token, metadata, work records, or browser storage.
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const path=process.env.WORKMEMO_NATIVE_ENDPOINT;
assert.ok(path,'Set WORKMEMO_NATIVE_ENDPOINT to the isolated preview endpoint file');
assert.match(path,/com\.workmemo\.test\.webacceptance[\\/]dashboard\.endpoint\.json$/);
const endpoint=JSON.parse(await readFile(path,'utf8'));
const origin=new URL(endpoint.origin);assert.equal(origin.protocol,'http:');assert.equal(origin.hostname,'127.0.0.1');assert.ok(origin.port);
const {chromium}=await import(process.env.WORKMEMO_PLAYWRIGHT?pathToFileURL(process.env.WORKMEMO_PLAYWRIGHT).href:'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const output=new URL('../artifacts/web-phase-d/',import.meta.url);await mkdir(output,{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 const errors=[],requests=[];page.on('pageerror',()=>errors.push('Page runtime error'));
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin.origin)return route.abort();
  if(url.pathname.startsWith('/api/')&&!['/api/meta','/api/query'].includes(url.pathname))throw new Error('Unexpected write endpoint');
  requests.push(url.pathname);return route.continue();
 });
 const denied=await context.request.get(origin.origin+'/api/meta');assert.equal(denied.status(),403);
 const meta=await context.request.get(origin.origin+'/api/meta',{headers:{Authorization:'Bearer '+endpoint.token}});
 assert.equal(meta.status(),200);const version=(await meta.json()).version;assert.equal(version,'0.2.10');
 const response=await page.goto(origin.origin+'/dashboard#token='+endpoint.token);
 assert.equal(response.status(),200);assert.match(response.headers()['content-security-policy'],/script-src 'self'/);
 await page.getByRole('heading',{name:'工作总览',exact:true}).waitFor();
 await page.waitForFunction(()=>!!document.querySelector('.dc-sync')?.textContent.includes('更新于'));
 assert.equal(await page.locator('.dc-page').count(),1);assert.deepEqual(errors,[]);
 assert.ok(requests.includes('/api/query'));assert.ok(requests.some(p=>p.endsWith('.js')));
 const result={authorizationEnforced:true,version,embeddedPageLoaded:true,requests:[...new Set(requests)],errors,readOnly:true};
 await writeFile(new URL('native-http-result.json',output),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
```

## E:\WorkMemo\scripts\verify-windows-candidate.ps1

```powershell
[CmdletBinding()]
param([string]$Directory='artifacts/web-phase-d/candidate-0.2.10')
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$candidate=[IO.Path]::GetFullPath($(if ([IO.Path]::IsPathRooted($Directory)) { $Directory } else { Join-Path $taskRoot $Directory }))
$version=(Get-Content (Join-Path $taskRoot 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json).version
$setupName="WorkMemo_${version}_x64-setup.exe"
$zipName="WorkMemo_${version}_windows_x64.zip"
$expected=@($setupName,$zipName,'THIRD-PARTY-LICENSES.txt')
function Verify-Checksums([string]$folder) {
    $seen=@()
    foreach($line in Get-Content -LiteralPath (Join-Path $folder 'SHA256SUMS.txt')) {
        if($line -notmatch '^([a-f0-9]{64})  ([^/\\]+)$') { throw 'Invalid checksum format' }
        $expectedHash=$Matches[1];$name=$Matches[2]
        if($name -notin $expected -or $name -in $seen) { throw 'Unexpected or duplicate checksum entry' }
        $seen+=$name
        if((Get-FileHash -LiteralPath (Join-Path $folder $name) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expectedHash) { throw "Checksum mismatch: $name" }
    }
    if($seen.Count -ne $expected.Count) { throw 'Incomplete checksum manifest' }
}
Verify-Checksums $candidate
$release=Join-Path $taskRoot 'src-tauri/target/release/workmemo.exe'
$info=[Diagnostics.FileVersionInfo]::GetVersionInfo($release)
if($info.ProductVersion -ne $version -or $info.FileVersion -notmatch ('^'+[regex]::Escape($version)+'(?:\.0)?$')) { throw 'Executable version mismatch' }
$reader=[IO.BinaryReader]::new([IO.File]::OpenRead($release))
try {
    if($reader.ReadUInt16() -ne 0x5a4d) { throw 'Invalid DOS signature' }
    $reader.BaseStream.Position=0x3c;$pe=$reader.ReadUInt32();$reader.BaseStream.Position=$pe
    if($reader.ReadUInt32() -ne 0x4550 -or $reader.ReadUInt16() -ne 0x8664) { throw 'Expected Windows x64 executable' }
} finally { $reader.Dispose() }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive=[IO.Compression.ZipFile]::OpenRead((Join-Path $candidate $zipName))
try {
    $entries=@('WorkMemo/workmemo.exe','WorkMemo/使用说明.md','WorkMemo/THIRD-PARTY-LICENSES.txt','WorkMemo/workmemo-browser.exe','WorkMemo/Register-Browser.cmd','WorkMemo/Register-Browser.ps1','WorkMemo/workmemo-browser.profile.json')
    foreach($resource in (Get-Content (Join-Path $PSScriptRoot 'browser-resource-files.json') -Raw -Encoding UTF8 | ConvertFrom-Json)) { $entries+='WorkMemo/extension/'+$resource }
    if(Compare-Object ($entries|Sort-Object) (@($archive.Entries.FullName)|Sort-Object)) { throw 'Unexpected ZIP entries' }
    $stream=$archive.GetEntry('WorkMemo/workmemo.exe').Open();$sha=[Security.Cryptography.SHA256]::Create()
    try { $zipHash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose();$sha.Dispose() }
    if($zipHash -ne (Get-FileHash $release -Algorithm SHA256).Hash.ToLowerInvariant()) { throw 'ZIP executable differs from build output' }
    foreach($entry in $archive.Entries | Where-Object { $_.FullName -eq 'WorkMemo/workmemo-browser.profile.json' -or $_.FullName -eq 'WorkMemo/extension/manifest.json' }) {
        $text=[IO.StreamReader]::new($entry.Open())
        try { $data=$text.ReadToEnd()|ConvertFrom-Json } finally { $text.Dispose() }
        if($entry.FullName.EndsWith('profile.json')) { if($data.identifier -ne 'com.workmemo.desktop') { throw 'Browser profile mismatch' } }
        elseif($data.version_name -ne $version) { throw 'Extension version mismatch' }
    }
    foreach($entry in $archive.Entries) {
        $relative=$entry.FullName.Substring('WorkMemo/'.Length)
        $source=switch($relative) {
            'workmemo.exe' { $release }
            '使用说明.md' { Join-Path $taskRoot 'docs/USER-GUIDE.md' }
            'THIRD-PARTY-LICENSES.txt' { Join-Path $candidate 'THIRD-PARTY-LICENSES.txt' }
            default { Join-Path (Join-Path $taskRoot 'src-tauri/target/browser-resources') $relative }
        }
        $stream=$entry.Open();$sha=[Security.Cryptography.SHA256]::Create()
        try { $hash=[BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLowerInvariant() } finally { $stream.Dispose();$sha.Dispose() }
        if($hash -ne (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant()) { throw "ZIP payload differs from source: $relative" }
    }
    $zipCount=$archive.Entries.Count
} finally { $archive.Dispose() }
$original=Join-Path $taskRoot "artifacts/$version"
Verify-Checksums $original
$checkpoint=Join-Path $taskRoot 'artifacts/phase-d-published-local-before.json'
if(Test-Path $checkpoint) {
    $before=Get-Content $checkpoint -Raw -Encoding UTF8|ConvertFrom-Json
    if((Get-FileHash (Join-Path $original 'SHA256SUMS.txt') -Algorithm SHA256).Hash -ne $before.Hash) { throw 'Original checksum file changed' }
}
$files=foreach($name in @($setupName,$zipName,'THIRD-PARTY-LICENSES.txt','SHA256SUMS.txt')) {
    $file=Get-Item -LiteralPath (Join-Path $candidate $name)
    @{name=$name;bytes=$file.Length;sha256=(Get-FileHash $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$receipt=@{version=$version;zip_entries=$zipCount;architecture='x64';checksums_verified=$true;original_local_release_preserved=$true;files=@($files);published=$false}
$receipt|ConvertTo-Json -Depth 5|Set-Content (Join-Path $taskRoot 'artifacts/web-phase-d/package-verification.json') -Encoding utf8
$receipt|ConvertTo-Json -Depth 5
```

## E:\WorkMemo\src-tauri\tauri.web-acceptance.conf.json

```json
{
  "identifier": "com.workmemo.test.webacceptance",
  "productName": "WorkMemo Acceptance",
  "app": {
    "windows": [
      {
        "label": "main",
        "visible": false,
        "title": "WorkMemo 网页改造验收（独立数据）",
        "width": 780,
        "height": 560,
        "minWidth": 360,
        "minHeight": 280,
        "center": true,
        "backgroundColor": "#00000000",
        "transparent": true,
        "decorations": false,
        "shadow": false,
        "noRedirectionBitmap": true,
        "resizable": true,
        "maximizable": false,
        "alwaysOnTop": false,
        "skipTaskbar": false
      }
    ]
  }
}
```
