"use client";

import {useEffect, useRef, useState} from 'react';
import {getHeroAssets} from './heroClarity/assets.mjs';
import styles from './HeroClarityVisual.module.scss';

const assets=getHeroAssets();
const copy={
  en:{alt:'From unclear requirements, through AI-assisted prototyping, to usable digital products.', replay:'Replay', pause:'Pause', resume:'Resume', controls:'Illustration animation', failed:'Animation unavailable. Showing the still illustration.'},
  'zh-CN':{alt:'从模糊需求，经 AI 辅助梳理和原型验证，到可用的数字产品。', replay:'重播', pause:'暂停', resume:'继续', controls:'插画动画', failed:'动画暂不可用，已保留静态插画。'},
  'zh-HK':{alt:'從模糊需求，經 AI 輔助梳理和原型驗證，到可用的數碼產品。', replay:'重播', pause:'暫停', resume:'繼續', controls:'插畫動畫', failed:'動畫暫不可用，已保留靜態插畫。'},
};

export default function HeroClarityVisual({locale='en',onReady}) {
  const runtimeRef=useRef(null), apiRef=useRef(null), posterRef=useRef(null);
  const localeRef=useRef(locale);
  const [status,setStatus]=useState({ready:false,paused:false,reduced:false,failed:false});
  const labels=copy[locale]||copy.en;
  useEffect(()=>{
    // A cached poster may load before hydration attaches the load handler.
    if(posterRef.current?.complete)onReady?.();
  },[onReady]);
  useEffect(()=>{
    let disposed=false;
    // The static illustration is SSR content; motion code loads after hydration.
    import('./heroClarity/runtime.mjs').then(({mountHeroRuntime})=>{
      if(disposed)return;
      apiRef.current=mountHeroRuntime(runtimeRef.current,{assets,onStatus:setStatus});
      apiRef.current.setLocale(localeRef.current);
    }).catch(()=>{if(!disposed)setStatus(s=>({...s,failed:true}));});
    return ()=>{disposed=true;apiRef.current?.destroy();apiRef.current=null;};
  },[]);
  useEffect(()=>{localeRef.current=locale;apiRef.current?.setLocale(locale);},[locale]);
  return (
    <div className={styles.root} data-hero-clarity>
      <noscript><style>{'[data-hero-page-loader]{display:none!important}'}</style></noscript>
      <figure className={styles.scene}>
        {/* Raster artwork is intentionally served unchanged for fidelity. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={posterRef} className={styles.poster} src={assets.poster} width="1448" height="1086"
          loading="eager" fetchPriority="high" alt={labels.alt} onLoad={onReady} onError={onReady}/>
        <div ref={runtimeRef}/>
      </figure>
      <div className={styles.controls} role="group" aria-label={labels.controls} hidden={!status.ready||status.reduced||status.failed}>
        <button type="button" onClick={()=>apiRef.current?.replay()}>{labels.replay}</button>
        <button type="button" aria-pressed={status.paused} onClick={()=>apiRef.current?.togglePause()}>
          {status.paused?labels.resume:labels.pause}
        </button>
      </div>
      {status.failed&&<span className={styles.srOnly} role="status">{labels.failed}</span>}
    </div>
  );
}
