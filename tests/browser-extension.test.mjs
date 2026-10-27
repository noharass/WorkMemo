import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { matchRule, permissionOrigins } from '../browser-extension/matching.js';
const rules = [{ id: 1, url_prefix: 'https://work.example.test/tasks', category: '评测' },
  { id: 2, url_prefix: 'https://work.example.test/tasks/review', category: '质检' }];
test('工作页面匹配限定精确来源及路径边界，忽略查询和片段', () => {
  assert.equal(matchRule('https://work.example.test/tasks/12?secret=never-sent#x', rules), 1);
  assert.equal(matchRule('https://work.example.test/tasks/review/12', rules), 2);
  for (const url of ['https://work.example.test/taskship', 'http://work.example.test/tasks',
    'https://work.example.test.evil.test/tasks', 'https://other.example.test/tasks', 'file:///tasks', undefined]) {
    assert.equal(matchRule(url, rules), null);
  }
  assert.deepEqual(permissionOrigins(rules), ['https://work.example.test/*']);
  const local = [{ id: 3, url_prefix: 'http://127.0.0.1:1431/work', category: '开发' }];
  assert.equal(matchRule('http://127.0.0.1:1431/work?ignored=1', local), 3);
  assert.equal(matchRule('http://127.0.0.1:1432/work', local), null);
  assert.deepEqual(permissionOrigins(local), ['http://127.0.0.1:1431/*']);
});
test('扩展固定公开标识、最小权限和原生主机来源一致', () => {
  const manifest = JSON.parse(readFileSync(new URL('../browser-extension/manifest.json', import.meta.url), 'utf8'));
  const id = [...createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest().subarray(0,16)]
    .map(n => String.fromCharCode(97 + (n >> 4), 97 + (n & 15))).join('');
  const protocol = readFileSync(new URL('../src-tauri/src/browser_protocol.rs', import.meta.url), 'utf8');
  assert.ok(protocol.includes(`chrome-extension://${id}/`));
  assert.deepEqual(manifest.permissions, ['nativeMessaging', 'alarms']);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.content_scripts, undefined);
});
