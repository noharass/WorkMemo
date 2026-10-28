import test from 'node:test';
import assert from 'node:assert/strict';
import {workloadLabel} from '../src/workload.ts';
test('轮播展示工作量合计，不用记录条数替代',()=>{
  assert.equal(workloadLabel({category:'评测',quantity:120,records:5,pending:0,complete:5}).main,'120');
});
test('未补填不能当成数量零，明确填写零则正常展示',()=>{
  assert.deepEqual(workloadLabel({category:'开发',quantity:0,records:1,pending:1,complete:0}),{main:'待补填',pending:null});
  assert.deepEqual(workloadLabel({category:'开发',quantity:0,records:1,pending:0,complete:1}),{main:'0',pending:null});
  assert.deepEqual(workloadLabel({category:'文档',quantity:12.5,records:4,pending:2,complete:2}),{main:'12.5',pending:'待补填 2'});
});
