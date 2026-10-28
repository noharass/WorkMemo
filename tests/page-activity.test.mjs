import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

test('页面脚本仅对可信可见焦点事件发送布尔活动信号，并去重节流', () => {
  const events = new Map(); const messages = []; let now = 1000;
  const context = vm.createContext({document:{visibilityState:'visible',hasFocus:()=>true,addEventListener:(name,fn)=>events.set(name,fn)},performance:{now:()=>now},chrome:{runtime:{sendMessage:async msg=>messages.push(msg)}}});
  const script = readFileSync(new URL('../browser-extension/activity.js',import.meta.url),'utf8');
  vm.runInContext(script, context); vm.runInContext(script, context);
  assert.equal(events.size,3);
  events.get('keydown')({isTrusted:false}); assert.equal(messages.length,0);
  events.get('keydown')({isTrusted:true,get key(){throw new Error('must not read key');}});
  events.get('pointerdown')({isTrusted:true}); assert.equal(messages.length,1);
  now+=250; events.get('wheel')({isTrusted:true});
  assert.equal(JSON.stringify(messages),JSON.stringify([{type:'page-activity'},{type:'page-activity'}]));
});
