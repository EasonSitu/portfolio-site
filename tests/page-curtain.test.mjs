import test from 'node:test';
import assert from 'node:assert/strict';
import { curtainDestination, entryMode } from '../lib/pageCurtain.mjs';

test('only ordinary same-site page navigation gets a curtain', () => {
  const current='https://example.com/';
  assert.equal(curtainDestination({href:'/work/cic-ai-assessment/'},current),'/work/cic-ai-assessment/');
  assert.equal(curtainDestination({href:'/#project'},'https://example.com/work/cic-ai-assessment/'),'/#project');
  for (const link of [
    {href:'/#project'}, {href:'/?locale=en'}, {href:'https://other.com/work/'},
    {href:'mailto:test@example.com'}, {href:'/cv.pdf',download:true},
    {href:'/work/cic-ai-assessment/',target:'_blank'},
    {href:'/work/cic-ai-assessment/',modified:true},
  ]) assert.equal(curtainDestination(link,current),null);
});

test('reduced motion and repeat visits bypass the long entrance', () => {
  assert.equal(entryMode({seen:false,reduced:false}),'intro');
  assert.equal(entryMode({seen:true,reduced:false}),'skip');
  assert.equal(entryMode({seen:false,reduced:true}),'skip');
});
