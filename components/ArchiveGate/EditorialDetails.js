import {useEffect,useRef} from 'react';
import {emphasisParts,magneticOffset} from '../../lib/editorialPresentation.mjs';
import styles from './EditorialPreview.module.scss';

export function EditorialEmphasis({children,phrases,limit=2}){
  return emphasisParts(children,phrases,limit).map((part,index)=>part.emphasis
    ? <strong className={styles.emphasis} key={index}>{part.text}</strong>
    : part.text);
}

export function MagneticContactLink({className='',children,...props}){
  const ref=useRef(null);
  useEffect(()=>{
    const element=ref.current;
    const enabled=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
    const controller=new AbortController(),options={signal:controller.signal};
    let frame=0,rect=null,target={x:0,y:0};
    const render=()=>{
      frame=0;
      element.style.setProperty('--magnet-x',`${target.x}px`);
      element.style.setProperty('--magnet-y',`${target.y}px`);
    };
    const reset=()=>{cancelAnimationFrame(frame);frame=0;rect=null;target={x:0,y:0};render();};
    element.addEventListener('pointerenter',event=>{
      if(enabled.matches&&event.pointerType==='mouse')rect=element.getBoundingClientRect();
    },options);
    element.addEventListener('pointermove',event=>{
      if(!enabled.matches||event.pointerType!=='mouse'||!rect)return;
      target=magneticOffset(event.clientX-rect.left,event.clientY-rect.top,rect.width,rect.height);
      if(!frame)frame=requestAnimationFrame(render);
    },options);
    for(const event of ['pointerleave','pointercancel','blur'])element.addEventListener(event,reset,options);
    enabled.addEventListener('change',reset,options);
    window.addEventListener('resize',reset,options);
    document.addEventListener('visibilitychange',reset,options);
    return ()=>{controller.abort();reset();};
  },[]);
  return <a {...props} ref={ref} className={`${className} ${styles.magneticLink}`}>{children}</a>;
}
