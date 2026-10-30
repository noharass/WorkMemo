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
