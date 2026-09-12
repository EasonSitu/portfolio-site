import test from 'node:test';
import assert from 'node:assert/strict';
const controls=await import('../components/ArchiveGate/heroClarity/control.mjs').catch(()=>({}));

test('Hero exposes one icon-only replay control in each locale',()=>{
 assert.equal(typeof controls.heroReplayControl,'function');
 for(const [locale,label] of [['en','Replay animation'],['zh-CN','重播动画'],['zh-HK','重播動畫']]){
  assert.deepEqual(controls.heroReplayControl(locale,{ready:true,reduced:false,failed:false}),{
   action:'replay',label,hidden:false,visibleText:''
  });
 }
});

test('replay control stays hidden until replay is actually available',()=>{
 for(const state of [
  {ready:false,reduced:false,failed:false},
  {ready:true,reduced:true,failed:false},
  {ready:true,reduced:false,failed:true},
 ]) assert.equal(controls.heroReplayControl('en',state).hidden,true);
});
