import test from 'node:test';
import assert from 'node:assert/strict';
import {nodeOpacity} from '../components/ArchiveGate/heroClarity/route-material.mjs';
test('a moved node stays hidden until the route actually reaches it',()=>{
 assert.equal(nodeOpacity(0,.76),0);
 assert.equal(nodeOpacity(.5,.76),0);
 assert.equal(nodeOpacity(.76,.76),0);
 assert.ok(nodeOpacity(.78,.76)>0&&nodeOpacity(.78,.76)<1);
 assert.equal(nodeOpacity(.9,.76),1);
 assert.equal(nodeOpacity(1,.76),1);
});
test('node appearance clamps invalid and overshooting progress',()=>{
 assert.equal(nodeOpacity(-1,.13),0);
 assert.equal(nodeOpacity(NaN,.13),0);
 assert.equal(nodeOpacity(2,.13),1);
});
