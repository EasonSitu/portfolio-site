import test from 'node:test';
import assert from 'node:assert/strict';
const presentation=await import('../lib/editorialPresentation.mjs').catch(()=>({}));
import {siteContent} from '../data/content.mjs';

test('emphasis preserves every character and highlights no more than two phrases',()=>{
 assert.equal(typeof presentation.emphasisParts,'function');
 const text='我是项目负责人，推进原型测试和客户演示。';
 const parts=presentation.emphasisParts(text,['项目负责人','原型测试','客户演示']);
 assert.equal(parts.map(p=>p.text).join(''),text);
 assert.deepEqual(parts.filter(p=>p.emphasis).map(p=>p.text),['项目负责人','原型测试']);
 assert.deepEqual(presentation.emphasisParts('No matches',['']),[{text:'No matches',emphasis:false}]);
});

test('overlapping phrases prefer the complete name, without duplicating text',()=>{
 assert.equal(typeof presentation.emphasisParts,'function');
 const parts=presentation.emphasisParts('CIC AI assessment',['CIC','CIC AI']);
 assert.deepEqual(parts,[{text:'CIC AI',emphasis:true},{text:' assessment',emphasis:false}]);
 assert.equal(presentation.emphasisParts('English text',['English'],0).some(p=>p.emphasis),false);
});

test('contact button movement stays local and centres exactly',()=>{
 assert.equal(typeof presentation.magneticOffset,'function');
 assert.deepEqual(presentation.magneticOffset(50,25,100,50),{x:0,y:0});
 assert.deepEqual(presentation.magneticOffset(100,50,100,50),{x:6,y:4});
 assert.deepEqual(presentation.magneticOffset(-200,300,100,50),{x:-6,y:4});
 assert.deepEqual(presentation.magneticOffset(10,10,0,0),{x:0,y:0});
});

test('all existing project summaries retain identical text in each locale',()=>{
 for(const locale of ['en','zh-CN','zh-HK'])for(const project of siteContent[locale].selectedProjects){
  const parts=presentation.emphasisParts(project.summary,presentation.projectEmphasis);
  assert.equal(parts.map(p=>p.text).join(''),project.summary);
  assert.ok(parts.filter(p=>p.emphasis).length<=2);
 }
});
