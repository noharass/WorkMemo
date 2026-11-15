import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

globalThis.location = new URL('http://127.0.0.1/dashboard#token=isolated-api-unit');
const storage=new Map();
globalThis.sessionStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
globalThis.history={replaceState:()=>{}};
const {api,ApiError}=await import('../src/dashboard/api.ts');
const originalFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=originalFetch;});

test('503 busy is unavailable, while 401/403 alone request reauthorization',async()=>{
  for(const status of [401,403,503]) {
    globalThis.fetch=async()=>new Response(status===503?'busy':'forbidden',{status});
    await assert.rejects(api('meta'),error=>error instanceof ApiError && error.status===status
      && error.kind===(status===503?'unavailable':'auth')
      && (status===503?!error.message.includes('授权'):error.message.includes('授权')));
  }
});

test('business errors retain their message and malformed success is not an authorization failure',async()=>{
  globalThis.fetch=async()=>Response.json({error:'日期范围无效'},{status:400});
  await assert.rejects(api('query',{}),error=>error.kind==='business'&&error.message==='日期范围无效');
  for(const response of [new Response('{bad',{headers:{'content-type':'application/json'}}),new Response('html'),Response.json(null)]) {
    globalThis.fetch=async()=>response;
    await assert.rejects(api('meta'),error=>error.kind==='invalid-response'&&!error.message.includes('授权'));
  }
  globalThis.fetch=async()=>Response.json({error:'隔离服务异常'},{status:500});
  await assert.rejects(api('meta'),error=>error.kind==='unavailable'&&error.message==='隔离服务异常');
});

test('read cancellation is propagated without being converted into a network error',async()=>{
  const controller=new AbortController(),reason=new DOMException('old query','AbortError');
  globalThis.fetch=async(_url,options)=>new Promise((_resolve,reject)=>{
    options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});
  });
  const request=api('query',{}, {signal:controller.signal});
  controller.abort(reason);
  await assert.rejects(request,error=>error===reason);
});

test('HTTP timeout and network failure preserve uncertain-write guidance and request identity',async()=>{
  const input={request_id:'unchanged-isolated-id',quantity:0};
  const bodies=[];
  globalThis.fetch=async(_url,options)=>{bodies.push(options.body);throw new TypeError('network');};
  for(let i=0;i<2;i++) await assert.rejects(api('manual-entry',input),error=>error.kind==='network'&&error.message.includes('原样重试'));
  assert.deepEqual(bodies,[JSON.stringify(input),JSON.stringify(input)]);
  globalThis.fetch=async()=>new Response('gateway timeout',{status:504});
  await assert.rejects(api('save',input),error=>error.kind==='timeout'&&error.message.includes('核对'));
});

test('the eight-second transport deadline stays independent of caller cancellation',async()=>{
  const originalTimeout=AbortSignal.timeout;
  const guard=setTimeout(()=>{},1000);
  try {
    AbortSignal.timeout=milliseconds=>{assert.equal(milliseconds,8000);return originalTimeout(5);};
    globalThis.fetch=async(_url,options)=>new Promise((_resolve,reject)=>{
      options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true});
    });
    await assert.rejects(api('query',{}),error=>error.kind==='timeout'&&error.status===0);
  } finally {AbortSignal.timeout=originalTimeout;clearTimeout(guard);}
});
