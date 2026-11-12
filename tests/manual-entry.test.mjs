import test from 'node:test';
import assert from 'node:assert/strict';
import { validateManualEntry } from '../src/dashboard/manualEntry.ts';
const validate = (overrides = {}) => {
  const value = { id: 'valid-request-0001', category: '开发', quantity: '2.5', remark: '  工作  ', start: 1000, end: 361000, rest: '1.5', now: 400000, ...overrides };
  return validateManualEntry(value.id, value.category, value.quantity, value.remark, value.start, value.end, value.rest, value.now);
};
test('补录按真实时间跨度扣除休息，保留小数工作量和去空白备注', () => {
  assert.deepEqual(validate(), { ok: true, input: { request_id: 'valid-request-0001', category: '开发', quantity: 2.5, remark: '工作', start_time: 1000, end_time: 361000, duration_ms: 270000 } });
  assert.equal(validate({ rest: '' }).input.duration_ms, 360000);
  assert.equal(validate({ quantity: '0', rest: '6' }).input.duration_ms, 0);
});
test('补录拒绝缺失数量、无效时间、未来时间和超长休息', () => {
  for (const input of [{ quantity: '' }, { quantity: '-1' }, { quantity: '1e-9999' }, { category: '' }, { start: NaN }, { end: NaN }, { start: -1 }, { start: 0.5 }, { end: 999 }, { end: 400001 }, { rest: '-1' }, { rest: '7' }, { rest: 'Infinity' }, { rest: '0x1' }, { rest: '1e-3' }, { remark: '😀'.repeat(2001) }]) {
    assert.equal(validate(input).ok, false, JSON.stringify(input));
  }
  assert.equal(validate({ remark: '😀'.repeat(2000) }).ok, true);
});
