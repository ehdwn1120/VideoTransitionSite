import test from 'node:test';
import assert from 'node:assert/strict';
import {formatBytes,sizeChange} from '../src/modules/file-size.js';
import {createWorkGuard} from '../src/modules/work-guard.js';
test('File sizes and changes retain small-file precision',()=>{
 assert.equal(formatBytes(0),'0 B');assert.equal(formatBytes(512),'512 B');
 assert.equal(formatBytes(1536),'1.5 KB');assert.equal(formatBytes(1024**3),'1 GB');
 assert.equal(sizeChange(100,50),'50.0% 감소');assert.equal(sizeChange(100,150),'50.0% 증가');
});
test('Navigation protection exists only while work or an undownloaded result remains',()=>{
 const target=new EventTarget();const guard=createWorkGuard(target);
 const blocked=()=>!target.dispatchEvent(new Event('beforeunload',{cancelable:true}));
 assert.equal(blocked(),false);guard.update(true,false);assert.equal(blocked(),true);
 guard.update(false,true);assert.equal(blocked(),true);guard.update(false,false);assert.equal(blocked(),false);
});
