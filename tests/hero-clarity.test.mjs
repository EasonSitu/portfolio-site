import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const assetsModule = await import('../components/ArchiveGate/heroClarity/assets.mjs').catch(() => ({}));
const director = await import('../components/ArchiveGate/heroClarity/director.mjs').catch(() => ({}));
const interaction = await import('../components/ArchiveGate/heroClarity/interaction.mjs').catch(() => ({}));

test('Hero assets resolve under root and project deployments, with all frames present', () => {
  assert.equal(typeof assetsModule.getHeroAssets, 'function');
  const root = assetsModule.getHeroAssets('');
  const pages = assetsModule.getHeroAssets('/portfolio-site/');
  assert.equal(pages.poster, '/portfolio-site/hero-clarity/clarity-composite-v2-spaced.png');
  assert.equal(root.frames.length, 48);
  assert.equal(pages.frames[0], '/portfolio-site/hero-clarity/paper/001.webp');
  assert.equal(pages.frames[47], '/portfolio-site/hero-clarity/paper/048.webp');
  for (const url of [root.poster, root.plate, root.props, ...root.frames]) {
    assert.ok(fs.statSync(new URL('../public' + url, import.meta.url)).size > 1000);
  }
});

test('the approved intro stops at its final frame and reduced motion skips playback', () => {
  assert.equal(typeof director.sceneAt, 'function');
  assert.equal(director.sceneAt(0).paper, 1);
  assert.equal(director.sceneAt(2000).phase, 'paper');
  assert.equal(director.sceneAt(4500).phase, 'work');
  assert.equal(director.sceneAt(9000).paper, 48);
  assert.equal(director.sceneAt(9000).routeOut, 1);
  assert.deepEqual(director.sceneAt(9000), director.sceneAt(20000));
  assert.equal(director.sceneAt(0, true).phase, 'complete');
});

test('feedback is gated during intro, pause, loading and offscreen', () => {
  assert.equal(typeof interaction.interactionAvailability, 'function');
  const base = {ready:true, compare:false, reduced:false, elapsed:8200, paused:false};
  assert.deepEqual(interaction.interactionAvailability(base), {feedback:true, replay:true});
  for (const patch of [{ready:false}, {elapsed:2000}, {paused:true}, {visible:false}]) {
    assert.deepEqual(interaction.interactionAvailability({...base, ...patch}), {feedback:false, replay:false});
  }
  assert.deepEqual(interaction.interactionAvailability({...base, reduced:true}), {feedback:true, replay:false});
});

test('failed prop artwork disables only prop actions, preserving replay and reduced-motion feedback', () => {
  assert.equal(typeof interaction.hotspotAvailability, 'function');
  const base={ready:true, compare:false, reduced:false, elapsed:8200, paused:false};
  assert.deepEqual(interaction.hotspotAvailability({...base,propsReady:false}), [true,false,false]);
  assert.deepEqual(interaction.hotspotAvailability({...base,propsReady:true}), [true,true,true]);
  assert.deepEqual(interaction.hotspotAvailability({...base,propsReady:false,reduced:true}), [false,true,true]);
  assert.deepEqual(interaction.hotspotAvailability({...base,propsReady:true,paused:true}), [false,false,false]);
});
