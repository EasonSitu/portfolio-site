import {createFeedbackGate} from './interaction.mjs';

export function propFrames(type){
 const points=type==='logo'
  ? [[0,0,0,0],[0,-18,0,.28],[0,0,0,.57],[0,-4,0,.76],[0,0,0,1]]
  : Array.from({length:25},(_,i)=>{
    if(i===0||i===24)return [0,0,0,i/24];
    const t=i/24*2*Math.PI;
    return [-45*Math.sin(t),75*(Math.cos(t)-1),-9*Math.sin(t),i/24];
   });
 return points.map(([x,y,angle,offset])=>({x,y,angle,offset}));
}

const gpt='M581 300 Q573 299 572 308 L571 389 Q570 395 577 397 L659 422 Q669 425 670 415 L672 335 Q673 327 665 324 Z';
const fish='M840 379 L922 401 Q929 403 929 412 L927 494 Q927 503 918 501 L837 479 Q830 478 830 470 L831 388 Q832 377 840 379 Z';
const head='M599 395 L607 390 L622 389 L636 393 L641 399 L641 408 L635 416 L634 425 L645 439 L626 450 L595 438 L598 423 L598 411 L596 403 Z';
const plane='M1382 729 L1236 841 L1278 848 L1283 853 L1287 853 L1293 855 L1295 857 L1304 877 L1316 862 L1333 874 L1355 859 L1357 855 L1357 851 L1368 796 L1370 791 L1374 771 Z';

// Crop source pixels with vector silhouettes. Generated imagery is used ONLY behind
// moving objects; idle appearance remains the unchanged full original image.
export function bindPropMotion(stage,assets){
 const original=assets.plate,clean=assets.props;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
 svg.setAttribute('viewBox','0 0 1448 1086');
 svg.setAttribute('aria-hidden','true');svg.classList.add('prop-motion-layer');
 const img=(url,extra='')=>`<image href="${url}" width="1448" height="1086" ${extra}/>`;
 svg.innerHTML=`<defs>
  <clipPath id="prop-gpt-clip"><path d="${gpt}"/></clipPath>
  <clipPath id="prop-fish-clip"><path d="${fish}"/></clipPath>
  <clipPath id="prop-plane-clip"><path d="${plane}"/></clipPath>
  <clipPath id="prop-head-clip"><path d="${head}"/></clipPath>
  <filter id="prop-feather" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
  <mask id="prop-desk-patch"><rect x="556" y="288" width="127" height="151" fill="white" filter="url(#prop-feather)"/><rect x="822" y="368" width="121" height="148" fill="white" filter="url(#prop-feather)"/></mask>
  <mask id="prop-plane-patch"><rect x="1213" y="710" width="192" height="218" fill="white" filter="url(#prop-feather)"/></mask>
  <mask id="prop-no-head"><rect width="1448" height="1086" fill="white"/><path d="${head}" fill="black"/></mask>
 </defs>
 <g class="prop-desk-group">
  <g class="prop-gpt"><path d="${gpt}" fill="#faf9f4"/>${img(original,'clip-path="url(#prop-gpt-clip)" mask="url(#prop-no-head)"')}</g>
  <g class="prop-fish">${img(original,'clip-path="url(#prop-fish-clip)"')}</g>
  ${img(original,'clip-path="url(#prop-head-clip)"')}
 </g>
 <g class="prop-plane-group">
  <g class="prop-plane">${img(original,'clip-path="url(#prop-plane-clip)"')}</g>
 </g>`;
 stage.append(svg);
 const backdrop=document.createElementNS('http://www.w3.org/2000/svg','svg');
 backdrop.setAttribute('viewBox','0 0 1448 1086');backdrop.setAttribute('aria-hidden','true');backdrop.classList.add('prop-motion-layer');
 backdrop.innerHTML=`<g class="prop-patch-group prop-desk-erase">${img(clean,'mask="url(#prop-desk-patch)"')}</g><g class="prop-patch-group prop-plane-erase">${img(clean,'mask="url(#prop-plane-patch)"')}</g>`;
 stage.insertBefore(backdrop,stage.querySelector('.live-overlay'));
 const deskErase=backdrop.querySelector('.prop-desk-erase'),planeErase=backdrop.querySelector('.prop-plane-erase');
 const deskGroup=svg.querySelector('.prop-desk-group'),planeGroup=svg.querySelector('.prop-plane-group');
 const deskGate=createFeedbackGate(),planeGate=createFeedbackGate();
 let loaded=false,disposed=false,deskAnimations=[],planeAnimations=[];
 const ready=Promise.all([original,clean].map(src=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=src;
 }))).then(values=>{loaded=!disposed&&values.every(Boolean);return loaded;});
 const keyframes=type=>propFrames(type).map(({x,y,angle,offset})=>({transform:`translate(${x}px, ${y}px) rotate(${angle}deg)`,offset}));
 function run(kind){
  if(!loaded||disposed)return false;
  const isDesk=kind==='desk',gate=isDesk?deskGate:planeGate,group=isDesk?deskGroup:planeGroup;
  const patch=isDesk?deskErase:planeErase;
  const token=gate.begin();if(token===null)return false;
  group.style.display='inline';patch.style.display='inline';stage.dataset[isDesk?'logosMoving':'planeMoving']='true';
  const elements=isDesk?[svg.querySelector('.prop-gpt'),svg.querySelector('.prop-fish')]:[svg.querySelector('.prop-plane')];
  const animations=elements.map((e,i)=>e.animate(keyframes(isDesk?'logo':'plane'),{duration:isDesk?850:2000,delay:isDesk?i*160:0,easing:isDesk?'cubic-bezier(.25,.65,.35,1)':'ease-in-out',fill:'both'}));
  if(isDesk)deskAnimations=animations;else planeAnimations=animations;
  Promise.all(animations.map(a=>a.finished)).then(()=>{
   animations.forEach(a=>a.cancel());group.style.display='none';patch.style.display='none';gate.finish(token);
   delete stage.dataset[isDesk?'logosMoving':'planeMoving'];
  }).catch(()=>{});
  return true;
 }
 function cancel(){
  [...deskAnimations,...planeAnimations].forEach(a=>a.cancel());deskGate.cancel();planeGate.cancel();
  deskGroup.style.display='none';planeGroup.style.display='none';
  deskErase.style.display='none';planeErase.style.display='none';
  delete stage.dataset.logosMoving;delete stage.dataset.planeMoving;
 }
 return {ready,desk:()=>run('desk'),plane:()=>run('plane'),cancel,destroy(){disposed=true;cancel();svg.remove();backdrop.remove();}};
}
