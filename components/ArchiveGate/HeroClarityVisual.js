"use client";

import {useEffect, useRef, useState} from 'react';
import {getHeroAssets} from './heroClarity/assets.mjs';
import {heroReplayControl} from './heroClarity/control.mjs';
import styles from './HeroClarityVisual.module.scss';
import {usePageRevealed} from '../PageCurtain';

const assets=getHeroAssets();
const copy={
  en:{alt:'From unclear requirements, through AI-assisted prototyping, to usable digital products.', failed:'Animation unavailable. Showing the still illustration.'},
  'zh-CN':{alt:'从模糊需求，经 AI 辅助梳理和原型验证，到可用的数字产品。', failed:'动画暂不可用，已保留静态插画。'},
  'zh-HK':{alt:'從模糊需求，經 AI 輔助梳理和原型驗證，到可用的數碼產品。', failed:'動畫暫不可用，已保留靜態插畫。'},
};

export default function HeroClarityVisual({locale='en',onReady}) {
  const pageRevealed=usePageRevealed();
  const runtimeRef=useRef(null), apiRef=useRef(null), posterRef=useRef(null);
  const localeRef=useRef(locale);
  const [status,setStatus]=useState({ready:false,paused:false,reduced:false,failed:false});
  const labels=copy[locale]||copy.en;
  const replay=heroReplayControl(locale,status);
  useEffect(()=>{
    // A cached poster may load before hydration attaches the load handler.
    if(posterRef.current?.complete)onReady?.();
  },[onReady]);
  useEffect(()=>{
    if(!pageRevealed)return undefined;
    let disposed=false;
    // The static illustration is SSR content; motion code loads after hydration.
    import('./heroClarity/runtime.mjs').then(({mountHeroRuntime})=>{
      if(disposed)return;
      apiRef.current=mountHeroRuntime(runtimeRef.current,{assets,onStatus:setStatus});
      apiRef.current.setLocale(localeRef.current);
    }).catch(()=>{if(!disposed)setStatus(s=>({...s,failed:true}));});
    return ()=>{disposed=true;apiRef.current?.destroy();apiRef.current=null;};
  },[pageRevealed]);
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
      <button className={styles.replayButton} type="button" aria-label={replay.label} hidden={replay.hidden}
        onClick={()=>apiRef.current?.replay()}>
        <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
          <path d="M4.8 8.4A8 8 0 1 1 4 14"/>
          <path d="M4.8 3.9v4.5h4.5"/>
        </svg>
      </button>
      {status.failed&&<span className={styles.srOnly} role="status">{labels.failed}</span>}
    </div>
  );
}
