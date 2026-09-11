import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

test('editorial preview retains the complete approved three-locale content',()=>{
 const contents=readFileSync(new URL('../data/content.mjs',import.meta.url));
 assert.equal(createHash('sha256').update(contents).digest('hex'),'695fc5c5461cfa5903a3b9bff12328ab5c7fd2a0713c678209da429c7d6882a2');
});

test('preview presentation exposes every project without a horizontal gesture',async()=>{
 const {editorialLayout}=await import('../lib/editorialLayout.mjs').catch(()=>({}));
 assert.equal(typeof editorialLayout,'function');
 assert.deepEqual(editorialLayout(4),['featured','standard','standard','compact']);
 assert.deepEqual(editorialLayout(1),['featured']);
 assert.deepEqual(editorialLayout(0),[]);
});
