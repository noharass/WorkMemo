import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultHistoryQuery, historyQueryError, localDate, formatQuantity } from '../src/history.ts';
import { confirmedFinish, reconcileDeleted } from '../src/workView.ts';

const query = { start_date: '2026-10-01', end_date: '2026-10-31', category: null, page: 1 };

test('默认范围使用本地日历，包含今天共30天，并正确跨越年界', () => {
  const today = new Date(2026, 0, 5, 0, 30);
  assert.deepEqual(defaultHistoryQuery(today), { start_date: '2025-12-07', end_date: '2026-01-05', category: null, page: 1 });
  assert.equal(localDate(new Date(2026, 9, 26, 23, 59)), '2026-10-26');
  assert.equal(today.getDate(), 5); // Helper must not mutate the caller's date.
});

test('本地日历范围跨闰日，不用固定毫秒回退30天', () => {
  assert.equal(defaultHistoryQuery(new Date(2024, 2, 1)).start_date, '2024-02-01');
  assert.equal(defaultHistoryQuery(new Date(2026, 2, 1)).start_date, '2026-01-31');
});

test('有效闰日、同日与最多366天可以查询', () => {
  for (const [start_date, end_date] of [['2024-02-29', '2024-02-29'], ['2024-01-01', '2024-12-31'], ['2026-10-01', '2026-10-01']]) {
    assert.equal(historyQueryError({ ...query, start_date, end_date }), '');
  }
  assert.equal(historyQueryError({ ...query, category: '质检' }), '');
});

test('拒绝无效日历日期、未填写日期、倒置日期和超过366天', () => {
  for (const date of ['', '2026-2-01', '2026-02-29', '2100-02-29', '2026-04-31', '2026-00-01', '2026-13-01', '2026-10-00', '1969-12-31']) {
    assert.notEqual(historyQueryError({ ...query, start_date: date }), '', date);
  }
  assert.notEqual(historyQueryError({ ...query, start_date: '2026-11-01' }), '');
  assert.notEqual(historyQueryError({ ...query, start_date: '2024-01-01', end_date: '2025-01-01' }), '');
});

test('未知类别和非法页码不会提交给桌面后端', () => {
  assert.notEqual(historyQueryError({ ...query, category: '未知' }), '');
  for (const page of [0, -1, 1.5, Infinity, NaN, 4294967296]) {
    assert.notEqual(historyQueryError({ ...query, page }), '');
  }
});

test('数量汇总隐藏二进制浮点尾差，同时保留小数量', () => {
  assert.equal(formatQuantity(.1 + .2), '0.3');
  assert.equal(formatQuantity(.000001), '0.000001');
  assert.equal(formatQuantity(1000.25), '1,000.25');
});

test('较早刷新结果不能复活已确认删除的记录或完成提示，同时保留其他数据', () => {
  const active = { id: 9, status: 'WORKING' };
  const saved = { id: 7, status: 'FINISHED', end_time: 1000 };
  const keep = { id: 8, status: 'FINISHED', end_time: 2000 };
  const stale = { active, recent_records: [keep, saved], warning: '原警告' };
  const reconciled = reconcileDeleted(stale, new Set([7]));
  assert.equal(reconciled.active, active);
  assert.equal(reconciled.warning, '原警告');
  assert.deepEqual(reconciled.recent_records, [keep]);
  assert.equal(stale.recent_records.length, 2);
  assert.equal(confirmedFinish({ ...reconciled, active: null }, 7), null);
  assert.deepEqual(reconcileDeleted(stale, new Set()), stale);
});
