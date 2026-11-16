import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dashboardFixture} from '../scripts/dashboard-fixture.mjs';

test('browser trend fixtures obey the real SQLite query contract',async()=>{
 const contract=JSON.parse(await readFile(new URL('./fixtures/dashboard-trend-contract.json',import.meta.url),'utf8'));
 const state=await dashboardFixture({route:async()=>{}}),base=state.records[0];
 state.active=null;
 state.records=contract.records.map((r,index)=>({...base,...r,id:index+1,
  start_time:Date.parse(r.date+'T12:00:00+08:00'),status:'FINISHED',
  settlement_status:r.quantity===null?'PENDING':'COMPLETE'}));
 for(const {name,query,expected:e} of contract.cases){
  const r=state.data({anchor_date:null,scope:'real',status:'all',page:1,...query});
  assert.equal(r.range.trend_unit,e.unit,name);assert.equal(r.range.trend_step,e.step,name);
  assert.equal(r.trend.length,e.count,name);
  assert.equal(r.trend[0]?.date??null,e.first,name);assert.equal(r.trend.at(-1)?.date??null,e.last,name);
  assert.equal(r.trend.reduce((n,r)=>n+r.duration_ms,0),e.duration_ms,name);
  assert.equal(r.trend.reduce((n,r)=>n+r.records,0),e.records,name);
  assert.equal(r.totals.records,e.records,name);
  assert.deepEqual(Object.fromEntries(r.trend.filter(r=>r.duration_ms!==0).map(r=>[r.date,r.duration_ms])),e.nonzero,name);
 }
});
