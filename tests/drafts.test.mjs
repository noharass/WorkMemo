import test from 'node:test';
import assert from 'node:assert/strict';
import { DraftController } from '../src/draftController.ts';

function form(overrides = {}) {
  return {dirty: true, busy: false, save: async () => true, discard: () => {}, ...overrides};
}

test('clean close is immediate; dirty or saving forms must be handled first', () => {
  const drafts = new DraftController();
  assert.equal(drafts.dirty, false);
  drafts.entries.set('settings', form());
  assert.equal(drafts.dirty, true);
  drafts.entries.set('settings', form({dirty: false, busy: true}));
  assert.equal(drafts.dirty, false);
  assert.equal(drafts.busy, true);
  assert.equal(drafts.discard(), false);
});

test('failed save preserves input and prevents the next form from being submitted', async () => {
  const drafts = new DraftController(); let discarded = false; let secondSaved = false;
  drafts.entries.set('first', form({save: async () => false, discard: () => {discarded = true;}}));
  drafts.entries.set('second', form({save: async () => {secondSaved = true; return true;}}));
  assert.equal(await drafts.save(), false);
  assert.equal(drafts.dirty, true);
  assert.equal(discarded, false);
  assert.equal(secondSaved, false);
});

test('Ctrl+S and native close cannot submit the same form twice while saving', async () => {
  const drafts = new DraftController(); let complete; let calls = 0;
  drafts.entries.set('form', form({save: () => {calls++; return new Promise(r => {complete = r;});}}));
  const first = drafts.save();
  assert.equal(drafts.busy, true);
  assert.equal(await drafts.save(), false);
  assert.equal(drafts.discard(), false);
  complete(true);
  assert.equal(await first, true);
  assert.equal(calls, 1);
  assert.equal(drafts.busy, false);
});

test('errors release the saving guard, allowing retry without discarding input', async () => {
  const drafts = new DraftController();
  drafts.entries.set('form', form({save: async () => {throw new Error('revision conflict');}}));
  await assert.rejects(drafts.save(), /revision conflict/);
  assert.equal(drafts.busy, false);
  assert.equal(drafts.dirty, true);
  drafts.entries.set('form', form());
  assert.equal(await drafts.save(), true);
});

test('saving a form that unmounts does not save newly opened forms', async () => {
  const drafts = new DraftController(); let newSaved = false;
  drafts.entries.set('first', form({save: async () => {
    drafts.entries.delete('first');
    drafts.entries.set('next', form({save: async () => {newSaved = true; return true;}}));
    return true;
  }}));
  assert.equal(await drafts.save(), true);
  assert.equal(newSaved, false);
});
