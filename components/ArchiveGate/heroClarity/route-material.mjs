export function nodeOpacity(progress,at){
 if(!Number.isFinite(progress))return 0;
 return Math.max(0,Math.min(1,(progress-at)/.04));
}

// All distances use the same source-image coordinate system as the existing art.
export function mountMaterialRoute(svg){
 const input='M210 293 C340 278 395 374 474 464 Q496 487 520 501';
 const output='M811 631 Q851 651 879 674 C957 755 1087 830 1229 863';
 for(const selector of ['.guide-track','#route-in','#route-out','#node-in','#node-out','#guide-head'])svg.querySelector(selector)?.remove();
 const group=document.createElementNS('http://www.w3.org/2000/svg','g');
 group.classList.add('material-route');
 const bands=['shadow','rim','body','shine'];
 const stroke=(d,segment)=>bands.map(b=>`<path ${b==='body'?`id="route-${segment}"`:''} data-segment="${segment}" class="guide-line guide-${b}" pathLength="1" d="${d}"/>`).join('');
 const node=id=>`<g id="${id}" class="guide-sphere" opacity="0"><ellipse class="guide-contact" cx="3" cy="10" rx="13" ry="4.5"/><circle r="10.5" fill="url(#route-node-surface)"/><ellipse cx="-3.3" cy="-4.1" rx="3.4" ry="2" fill="#fff8d4" opacity=".5" transform="rotate(-24)"/></g>`;
 group.innerHTML=`<defs>
  <radialGradient id="route-node-surface" cx="31%" cy="25%" r="76%"><stop offset="0" stop-color="#fff0ad"/><stop offset=".24" stop-color="#ffbd51"/><stop offset=".54" stop-color="#ff8a1c"/><stop offset=".84" stop-color="#e45b08"/><stop offset="1" stop-color="#b94407"/></radialGradient>
  <filter id="route-contact-soft" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="1.8"/></filter>
  <filter id="route-line-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter>
 </defs>${stroke(input,'in')}${stroke(output,'out')}
 <g id="guide-head" opacity="0">${bands.map(b=>`<path class="guide-arrow-band guide-${b}" d="M-23 -13 L0 0 L-23 13"/>`).join('')}</g>
 ${node('node-start')}${node('node-in')}${node('node-out')}`;
 svg.insertBefore(group,svg.firstChild);
 const inPath=group.querySelector('#route-in'),outPath=group.querySelector('#route-out');
 const inLength=inPath.getTotalLength(),outLength=outPath.getTotalLength();
 const nodes=[{id:'node-start',path:inPath,length:inLength,at:.13,segment:'in'},{id:'node-in',path:inPath,length:inLength,at:.85,segment:'in'},{id:'node-out',path:outPath,length:outLength,at:.76,segment:'out'}];
 for(const n of nodes){
  n.element=group.querySelector('#'+n.id);
  const p=n.path.getPointAtLength(n.at*n.length);
  n.element.setAttribute('transform',`translate(${p.x} ${p.y})`);
 }
 const inBands=[...group.querySelectorAll('[data-segment="in"]')],outBands=[...group.querySelectorAll('[data-segment="out"]')];
 const head=group.querySelector('#guide-head');
 return {update(progressIn,progressOut){
  const values={in:Math.max(0,Math.min(1,progressIn)),out:Math.max(0,Math.min(1,progressOut))};
  for(const [key,paths] of [['in',inBands],['out',outBands]])for(const p of paths){p.style.strokeDashoffset=1-values[key];p.style.visibility=values[key]>0?'visible':'hidden';}
  for(const n of nodes)n.element.style.opacity=nodeOpacity(values[n.segment],n.at);
  const distance=values.out*outLength,p=outPath.getPointAtLength(distance),a=outPath.getPointAtLength(Math.max(0,distance-2)),b=outPath.getPointAtLength(Math.min(outLength,distance+2));
  head.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI})`);
  head.style.opacity=values.out>0?1:0;
 }};
}
