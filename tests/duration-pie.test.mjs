import test from 'node:test';
import assert from 'node:assert/strict';
import { durationSlices } from '../src/dashboard/durationPie.ts';

test('duration pie leaves empty/zero work empty instead of creating equal slices', () => {
  assert.deepEqual(durationSlices([]), []);
  assert.deepEqual(durationSlices([{ category: '开发', duration_ms: 0 }]), []);
});
test('duration shares use original milliseconds and keep tiny nonzero work', () => {
  const rows = Object.freeze([
    Object.freeze({ category: '评测', duration_ms: 1 }),
    Object.freeze({ category: '开发', duration_ms: 999999 }),
    Object.freeze({ category: '文档', duration_ms: 0 }),
  ]);
  const result = durationSlices(rows);
  assert.equal(result.length, 2);
  assert.equal(result[0].value, 1);
  assert.equal(result[0].percentLabel, '不足 0.01%');
  assert.equal(result[0].percent + result[1].percent, 100);
  assert.equal(rows[0].duration_ms, 1);
});
test('single category is 100 percent; category identity and aggregate work remain unchanged', () => {
  assert.deepEqual(durationSlices([{ category: '质检', duration_ms: 1200 }]), [
    { category: '质检', value: 1200, percent: 100, percentLabel: '100%' },
  ]);
  const result = durationSlices([{ category: '评测', duration_ms: 3000 }, { category: '开发', duration_ms: 1000 }]);
  assert.deepEqual(result.map(row => row.percentLabel), ['75%', '25%']);
});
