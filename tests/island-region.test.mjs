import assert from 'node:assert/strict';
import test from 'node:test';
import { islandRegionSync } from '../src/islandRegion.ts';

test('late collapse completion cannot release a reopened island; latest region wins', async () => {
  const calls = [];
  let resolveCollapse;
  const done = new Promise(resolve => { resolveCollapse = resolve; });
  const sync = islandRegionSync(async (command, args) => {
    calls.push({ command, args });
    if (command === 'set_island_region' && args.height === 56) await done;
  }, error => assert.fail(error));
  sync.update(56, false);
  sync.update(180, true);
  sync.update(220, true);
  resolveCollapse();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(calls, [
    { command: 'set_island_region', args: { height: 56 } },
    { command: 'hold_island', args: { holding: true } },
    { command: 'set_island_region', args: { height: 220 } },
  ]);
  sync.update(56, false);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(calls.at(-1), { command: 'hold_island', args: { holding: false } });
  sync.dispose();
});

test('native errors are reported and subsequent updates can retry', async () => {
  const errors = [], calls = [];
  let fail = true;
  const sync = islandRegionSync(async (command, args) => {
    if (fail) throw Error('region unavailable');
    calls.push({ command, args });
  }, error => errors.push(error));
  sync.update(180, true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.match(errors[0], /region unavailable/);
  fail = false; sync.update(200, true);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(calls.at(-1).args.height, 200);
  sync.dispose();
});
