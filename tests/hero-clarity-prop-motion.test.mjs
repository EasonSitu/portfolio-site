import test from 'node:test';
import assert from 'node:assert/strict';
import {propFrames} from '../components/ArchiveGate/heroClarity/prop-motion.mjs';
test('moving props start and end at their exact resting pose',()=>{
 for(const type of ['logo','plane']){
  const frames=propFrames(type);
  assert.ok(frames.length>=5);
  assert.deepEqual(frames[0],{x:0,y:0,angle:0,offset:0});
  assert.deepEqual(frames.at(-1),{x:0,y:0,angle:0,offset:1});
  assert.ok(frames.every((f,i)=>i===0||f.offset>frames[i-1].offset));
 }
});
test('logos jump locally and the plane stays near its own stage',()=>{
 const logos=propFrames('logo'),plane=propFrames('plane');
 assert.ok(logos.some(f=>f.y<=-14));
 assert.ok(logos.every(f=>f.x===0&&Math.abs(f.y)<=20));
 assert.ok(plane.some(f=>f.x<0)&&plane.some(f=>f.x>0));
 assert.ok(plane.some(f=>f.y<=-140));
 assert.ok(plane.every(f=>Math.abs(f.x)<=48&&f.y>=-155&&f.y<=0&&Math.abs(f.angle)<=10));
});
