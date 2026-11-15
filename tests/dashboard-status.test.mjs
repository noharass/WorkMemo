import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { recordStatusLabel } from '../src/dashboard/recordStatus.ts';
import { dashboardFixture } from '../scripts/dashboard-fixture.mjs';

test('timer, pause, suspension and recovery have distinct truthful labels', () => {
  const row = {status:'WORKING',is_paused:false,recovery_pending:false,settlement_status:'IN_PROGRESS'};
  assert.equal(recordStatusLabel(row),'计时中');
  assert.equal(recordStatusLabel({...row,is_paused:true}),'已暂停');
  assert.equal(recordStatusLabel({...row,is_paused:true,recovery_pending:true}),'待恢复');
  assert.equal(recordStatusLabel({...row,status:'SUSPENDED',is_paused:true}),'已挂起');
  assert.equal(recordStatusLabel({...row,status:'NOT_STARTED'}),'未开始');
  assert.equal(recordStatusLabel({...row,status:'FINISHED',settlement_status:'PENDING'}),'待补全');
  assert.equal(recordStatusLabel({...row,status:'FINISHED',settlement_status:'COMPLETE'}),'已确认');
});

test('browser fixtures obey the same status contract as the real Rust query', async () => {
  const contract = JSON.parse(await readFile(new URL('./fixtures/dashboard-status-contract.json',import.meta.url),'utf8'));
  const state = await dashboardFixture({route:async()=>{}});
  const base=state.records[0];
  state.active=null;
  for(const paused of [false,true]) {
    state.records=contract.records.map(row=>({...base,...row,start_time:0,
      is_paused:row.status!=='WORKING'||paused,
      end_time:row.status==='FINISHED'?1000:null,
      quantity:row.settlement_status==='COMPLETE'?0:null}));
    for(const [status,expected] of Object.entries(contract.expected)) {
      const value=state.data({period:'custom',anchor_date:null,start_date:null,end_date:null,category:null,scope:'real',status,page:1});
      assert.deepEqual(value.records.map(row=>row.id).sort((a,b)=>a-b),expected);
      if(status==='unfinished') assert.equal(value.totals.records,0);
    }
  }
});
