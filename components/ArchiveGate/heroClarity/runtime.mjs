import {sceneAt} from './director.mjs';
import {bindHeroInteractions} from './hero-hotspots.mjs';
import {mountMaterialRoute} from './route-material.mjs';

// React owns the poster and controls. Only this effect owns this empty island.
export function mountHeroRuntime(stage, {assets, onStatus}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = new AbortController();
  const opts = {signal:controller.signal};
  let disposed=false, ready=false, loading=false, failed=false, paused=false;
  let elapsed=0, last=0, raf=0, images=[], inView=false;
  const site=stage.closest('[data-hero-site]');
  let revealed=!site?.querySelector('[data-hero-page-loader]');
  stage.className='quality-scene';
  stage.innerHTML=`<img class="quality-art live-art" width="1448" height="1086" alt="" aria-hidden="true">
    <div class="live-overlay" aria-hidden="true"><svg class="guide-layer" viewBox="0 0 1448 1086">
      <path class="work-feedback" d="M685 378 L734 391 L734 450 L685 435 Z"/>
      <path class="feature-feedback" d="M1164 584 L1319 615 L1313 657 L1159 624"/>
      <path class="feature-feedback" d="M1160 661 L1313 693 L1308 729 L1155 698"/>
      <path class="feature-feedback" d="M1156 733 L1308 767 L1304 793 L1152 766"/>
      <circle class="finish-feedback" cx="1310" cy="575" r="37"/>
    </svg><img class="paper-layer" width="512" height="512" alt=""></div>`;
  const art=stage.querySelector('.live-art'), paper=stage.querySelector('.paper-layer');
  const work=stage.querySelector('.work-feedback');
  const features=[...stage.querySelectorAll('.feature-feedback')];
  const finish=stage.querySelector('.finish-feedback');
  const route=mountMaterialRoute(stage.querySelector('.guide-layer'));
  const interactions=bindHeroInteractions(stage, {
    assets,
    readState:()=>({ready:reduced.matches||ready, compare:failed, paused, elapsed,
      reduced:reduced.matches, visible:inView&&revealed&&!document.hidden}),
    onReplay:()=>replay(),
  });
  const notify=()=>{if(!disposed)onStatus({ready, paused, reduced:reduced.matches, failed});};
  function render() {
    if(disposed)return;
    const live=ready&&!reduced.matches&&!failed;
    stage.dataset.live=String(live);
    stage.dataset.paused=String(paused);
    interactions.update();
    if(!live){stage.dataset.phase='static';return;}
    const s=sceneAt(elapsed);
    stage.dataset.phase=s.phase;
    const src=images[s.paper-1].src;
    if(paper.src!==src)paper.src=src;
    route.update(s.routeIn,s.routeOut);
    work.style.opacity=s.work*.65;
    features.forEach((e,i)=>{e.style.opacity=s.features[i]*.8;});
    finish.style.opacity=s.finish*.65;
  }
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
  function tick(now){
    raf=0;
    if(last)elapsed=Math.min(8200,elapsed+now-last);
    last=now;render();
    if(elapsed<8200)raf=requestAnimationFrame(tick);else stop();
  }
  function schedule(){
    stop();render();
    if(!disposed&&ready&&!failed&&!paused&&!reduced.matches&&inView&&revealed&&!document.hidden&&elapsed<8200)
      raf=requestAnimationFrame(tick);
  }
  function load(src){
    return new Promise((resolve,reject)=>{
      const image=new Image();
      let settled=false;
      const done=error=>{
        if(settled)return;settled=true;
        clearTimeout(timer);controller.signal.removeEventListener('abort',abort);
        image.onload=null;image.onerror=null;
        if(error)reject(error);else resolve(image);
      };
      const abort=()=>done(new Error('Hero disposed'));
      const timer=setTimeout(()=>done(new Error('Hero asset timed out')),20000);
      image.onload=()=>{
        if(image.decode)image.decode().then(()=>done(),done);else done();
      };
      image.onerror=()=>done(new Error('Hero asset unavailable'));
      controller.signal.addEventListener('abort',abort,{once:true});
      image.src=src;
    });
  }
  async function prepare(){
    if(disposed||loading||ready||failed||reduced.matches||!inView||!revealed)return;
    loading=true;
    try {
      const loaded=await Promise.all([load(assets.plate),...assets.frames.map(load)]);
      if(disposed)return;
      images=loaded.slice(1);art.src=loaded[0].src;ready=true;
      notify();schedule();
    }catch{
      if(!disposed){failed=true;notify();schedule();}
    }
  }
  function replay(){
    if(!ready||reduced.matches||failed)return;
    interactions.clear();elapsed=0;paused=false;notify();schedule();
  }
  function togglePause(){paused=!paused;interactions.clear();notify();schedule();}
  const onPreference=()=>{interactions.clear();notify();schedule();prepare();};
  reduced.addEventListener('change',onPreference,opts);
  document.addEventListener('visibilitychange',schedule,opts);
  window.addEventListener('pagehide',()=>{stop();interactions.clear();},opts);
  window.addEventListener('pageshow',schedule,opts);
  const observer='IntersectionObserver' in window ? new IntersectionObserver(entries=>{
    inView=entries[0].isIntersecting;
    schedule();prepare();
  },{threshold:.15}) : null;
  if(observer)observer.observe(stage);else inView=true;
  const loaderObserver=site&&!revealed ? new MutationObserver(()=>{
    if(!site.querySelector('[data-hero-page-loader]')){
      revealed=true;loaderObserver.disconnect();schedule();prepare();
    }
  }) : null;
  loaderObserver?.observe(site,{childList:true,subtree:true});
  notify();schedule();prepare();
  return {
    replay, togglePause, setLocale:interactions.setLocale,
    destroy(){
      disposed=true;stop();controller.abort();observer?.disconnect();loaderObserver?.disconnect();
      interactions.destroy();stage.replaceChildren();
      delete stage.dataset.live;delete stage.dataset.phase;delete stage.dataset.paused;
    },
  };
}
