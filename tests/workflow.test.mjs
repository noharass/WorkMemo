import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkInput } from '../src/workInput.ts';
import { confirmedFinish, workView } from '../src/workView.ts';

// Only test fixtures: never loaded into the app or written to a user's database.
const record = { id: 7, category: '开发', quantity: 1.5, remark: '测试夹具',
  start_time: 1000, end_time: null, duration_seconds: 65, duration_ms: 65000,
  status: 'WORKING', is_paused: false, recovery_pending: false };
const snapshot = { active: record, recent_records: [], warning: null };
const saved = { ...record, status: 'FINISHED', end_time: 100000 };
const finished = { active: null, recent_records: [saved], warning: null };
const view = (overrides = {}) => workView({ native: true, loading: false,
  snapshot, connectionError: '', savedId: null, ...overrides });

test('数量接受明确的0、正小数、科学计数及上界，保留类别并去除备注首尾空白', () => {
  for (const [text, quantity] of [['0', 0], ['0.0', 0], ['1.25', 1.25], ['.5', .5], ['1e3', 1000], ['1000000000', 1e9]]) {
    assert.deepEqual(validateWorkInput('开发', text, '  内容  '), {
      ok: true, input: { category: '开发', quantity, remark: '内容' },
    });
  }
});

test('非有限数、负数、下溢、越界、十六进制及逗号不会启动任务', () => {
  for (const quantity of ['NaN', 'Infinity', '-1', '1000000001',
    '1e309', '1e-999', '0x10', '1,000', '1 2', 'abc']) {
    const result = validateWorkInput('开发', quantity, '');
    assert.equal(result.ok, false, quantity);
    assert.ok(result.errors.quantity, quantity);
  }
});

test('开始允许数量未填，结算必须显式填写；0与未填不同', () => {
  for (const text of ['', ' ']) {
    assert.deepEqual(validateWorkInput('开发', text, ''), { ok: true, input: { category: '开发', quantity: null, remark: '' } });
    assert.equal(validateWorkInput('开发', text, '', true).ok, false);
  }
  assert.equal(validateWorkInput('文档', '0', '', true).input.quantity, 0);
});

test('同时返回各字段错误，拒绝未知类别，按 Unicode 字符计算备注边界', () => {
  const invalid = validateWorkInput('', '-1', '😀'.repeat(2001));
  assert.equal(invalid.ok, false);
  assert.deepEqual(Object.keys(invalid.errors), ['category', 'quantity', 'remark']);
  assert.equal(validateWorkInput('任意类别', '1', '').ok, false);
  assert.equal(validateWorkInput('文档', '1', ' 😀'.trim().repeat(2000)).ok, true);
});

test('首次读取和读取失败不伪装为空任务，不提供业务操作', () => {
  for (const overrides of [{ loading: true }, { connectionError: '读取失败' }, {}]) {
    const state = view({ snapshot: null, ...overrides });
    assert.notEqual(state.mode, 'ready');
    assert.equal(state.timer, '--:--:--');
    assert.equal(state.canOperate, false);
  }
  assert.equal(view({ snapshot: { active: null, recent_records: [], warning: null } }).mode, 'ready');
});

test('断线保留上次真实任务与时长，禁用操作；恢复后重新显示进行中', () => {
  const disconnected = view({ connectionError: '断线' });
  assert.equal(disconnected.mode, 'unavailable');
  assert.equal(disconnected.record.id, record.id);
  assert.equal(disconnected.timer, '00:01:05');
  assert.equal(disconnected.canOperate, false);
  assert.equal(view().mode, 'working');
  assert.equal(view().canOperate, true);
});

test('暂停、恢复使用同一条任务及后端累计时间', () => {
  const paused = view({ snapshot: { ...snapshot, active: { ...record, is_paused: true } } });
  assert.equal(paused.mode, 'paused');
  assert.equal(paused.timer, view().timer);
  assert.equal(paused.record.id, view().record.id);
});

test('只接受本次结束操作确认的已完成记录，有结束时间且没有活动任务', () => {
  assert.equal(confirmedFinish(finished, 7), saved);
  assert.equal(confirmedFinish(finished, null), null);
  assert.equal(confirmedFinish(finished, 8), null);
  assert.equal(confirmedFinish(snapshot, 7), null);
  assert.equal(confirmedFinish({ ...finished, active: record }, 7), null);
  assert.equal(confirmedFinish({ ...finished, recent_records: [{ ...saved, end_time: null }] }, 7), null);
  assert.equal(confirmedFinish({ ...finished, recent_records: [record] }, 7), null);
});

test('保存确认保留本次时长；失败、旧记录、开始新任务均不显示完成', () => {
  assert.equal(view({ snapshot: finished, savedId: 7 }).mode, 'finished');
  assert.equal(view({ snapshot: finished, savedId: 7 }).timer, '00:01:05');
  assert.equal(view({ snapshot: finished }).mode, 'ready');
  assert.equal(view({ savedId: 7 }).mode, 'working');
  assert.equal(view({ snapshot: finished, savedId: 7, connectionError: '断线' }).mode, 'unavailable');
});

test('计时结束待补全不显示已结算，且不阻止开始下一项', () => {
  const pending = { ...saved, quantity: null, settlement_status: 'PENDING' };
  const state = view({ snapshot: { ...finished, recent_records: [pending], pending_count: 1 }, savedId: 7 });
  assert.equal(state.mode, 'finished');
  assert.equal(state.label, '计时已保存，待补全');
  assert.equal(state.canOperate, true);
  assert.equal(state.record.quantity, null);
});

test('浏览器预览不能通过已有快照启用业务操作', () => {
  assert.equal(view({ native: false }).mode, 'preview');
  assert.equal(view({ native: false }).canOperate, false);
});
