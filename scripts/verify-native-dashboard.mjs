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
