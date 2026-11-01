import test from 'node:test';
import assert from 'node:assert/strict';
import { islandView } from '../src/islandView.ts';

test('new candidate masks old settlement and disappears on confirmed active work', () => {
  const old = { kind: 'ended', record: { id: 1 } };
  const snapshot = { active: null, monitoring: { start_candidate: { id: 2, category: '开发' } } };
  assert.equal(islandView(snapshot, old).key, 'candidate:2');
  assert.equal(islandView(snapshot, old).notice, null);
  assert.equal(old.record.id, 1);
  snapshot.active = { id: 3 };
  const active = islandView(snapshot, old);
  assert.equal(active.active.id, 3);
  assert.equal(active.candidate, null);
  assert.equal(active.notice, null);
  assert.equal(active.key, '');
  snapshot.active = null; snapshot.monitoring.start_candidate = null;
  assert.equal(islandView(snapshot, old).key, 'ended:1');
});

test('idle warnings belong to the current active record only', () => {
  const notice = { kind: 'idle', record: { id: 1 } };
  assert.equal(islandView({ active: { id: 1 }, monitoring: {} }, notice).key, 'idle:1');
  assert.equal(islandView({ active: { id: 2 }, monitoring: {} }, notice).notice, null);
  assert.equal(islandView(null, notice).notice, null);
});
