import test from 'node:test';
import assert from 'node:assert/strict';
import {shiftPeriod, reportRangeLabel, trendAggregationLabel} from '../src/reportPeriod.ts';

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

test('合并月份的标签说明聚合宽度，并兼容旧后端缺少步长',()=>{
  assert.equal(trendAggregationLabel({trend_unit:'month',trend_step:81}),'每 81 个月汇总（标签为起始月份）');
  assert.equal(trendAggregationLabel({trend_unit:'month'}),'按开始月份汇总');
  assert.equal(trendAggregationLabel({trend_unit:'hour'}),'按开始小时汇总');
});
