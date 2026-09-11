import {interactionAvailability,hotspotAvailability,createFeedbackGate} from './interaction.mjs';
import {bindPropMotion} from './prop-motion.mjs';

const labels={
 'zh-HK':['重播需求到交付的過程','讓 AI 工具卡片輕跳','讓紙飛機繞行一圈'],
 'zh-CN':['重播需求到交付的过程','让 AI 工具卡片轻跳','让纸飞机绕行一圈'],
 en:['Replay the delivery process','Bounce the AI tool cards','Fly the paper plane once']
};

// The underlying artwork stays intact. Only these local feedback outlines animate.
export function bindHeroInteractions(stage,{readState,onReplay,assets}){
 const layer=document.createElement('div');
 layer.className='interaction-layer';
 layer.innerHTML=`<svg class="interaction-feedback" viewBox="0 0 1448 1086" aria-hidden="true">
  <defs><clipPath id="hero-product-card-visible"><path d="M1100 680 H1390 V722 L1383 728 L1234 842 H1100 Z"/></clipPath></defs>
  <path class="hover-work" d="M671 353 L816 392 L814 487 L670 448 Z"/>
  <path class="hover-feature" d="M1152 571 L1305 607 L1300 665 L1148 629 Z"/>
  <path class="hover-feature" d="M1147 647 L1299 682 L1295 740 L1144 703 Z"/>
  <path class="hover-feature" clip-path="url(#hero-product-card-visible)" d="M1160 719 L1283 747 Q1288 748 1288 753 L1285 801 Q1285 805 1280 804 L1156 776 Q1153 775 1153 771 L1156 724 Q1156 718 1160 719 Z"/>
 </svg>`;
 const buttons=['paper','work','product'].map(name=>{
  const b=document.createElement('button');
  b.type='button';b.className=`hero-hotspot hotspot-${name}`;b.disabled=true;
  layer.append(b);return b;
 });
 stage.append(layer);
 const props=bindPropMotion(stage,assets);
 const controller=new AbortController(),opts={signal:controller.signal};
 const fine=matchMedia('(hover: hover) and (pointer: fine)');
 const features=[...layer.querySelectorAll('.hover-feature')];
 const gate=createFeedbackGate();let animations=[],timer=0,lastEnabled=false,propsReady=false;
 const available=()=>interactionAvailability(readState());
 const setLocale=locale=>buttons.forEach((b,i)=>{b.setAttribute('aria-label',(labels[locale]||labels.en)[i]);b.title=(labels[locale]||labels.en)[i];});
 function clear(){
  props.cancel();
  animations.forEach(a=>a.cancel());animations=[];gate.cancel();clearTimeout(timer);
  delete stage.dataset.workHint;delete stage.dataset.productHint;delete stage.dataset.paperHint;
 }
 function product(){
  if(!available().feedback)return;
  if(readState().reduced){stage.dataset.productHint='true';return;}
  const token=gate.begin();if(token===null)return;
  props.plane();
  animations=features.map((e,i)=>e.animate([{opacity:0},{opacity:1,offset:.18},{opacity:1,offset:.7},{opacity:0}],{duration:1400,delay:i*220,easing:'ease-in-out'}));
  Promise.allSettled(animations.map(a=>a.finished)).then(()=>gate.finish(token));
 }
 function desk(tap=false){
  if(!available().feedback)return;
  stage.dataset.workHint='true';
  if(!readState().reduced)props.desk();
  clearTimeout(timer);
  if(tap&&!readState().reduced)timer=setTimeout(()=>{
   if(!(fine.matches&&buttons[1].matches(':hover'))&&!buttons[1].matches(':focus-visible'))delete stage.dataset.workHint;
  },1400);
 }
 const [paperButton,workButton,productButton]=buttons;
 paperButton.addEventListener('click',()=>{if(available().replay){clear();onReplay();}},opts);
 for(const [button,key] of [[paperButton,'paperHint'],[workButton,'workHint']]){
  button.addEventListener('pointerenter',e=>{if(fine.matches&&e.pointerType==='mouse'&&!button.disabled){if(key==='workHint')desk();else stage.dataset[key]='true';}},opts);
  button.addEventListener('pointerleave',()=>{if(!button.matches(':focus-visible'))delete stage.dataset[key];},opts);
  button.addEventListener('focus',()=>{if(button.matches(':focus-visible')&&!button.disabled){if(key==='workHint')desk();else stage.dataset[key]='true';}},opts);
  button.addEventListener('blur',()=>{delete stage.dataset[key];},opts);
 }
 workButton.addEventListener('click',()=>desk(true),opts);
 productButton.addEventListener('pointerenter',e=>{if(fine.matches&&e.pointerType==='mouse')product();},opts);
 productButton.addEventListener('focus',()=>{if(productButton.matches(':focus-visible'))product();},opts);
 productButton.addEventListener('click',product,opts);
 productButton.addEventListener('pointerleave',()=>{if(!productButton.matches(':focus-visible'))delete stage.dataset.productHint;},opts);
 productButton.addEventListener('blur',()=>{delete stage.dataset.productHint;},opts);
 document.addEventListener('pointerdown',e=>{
  if(!workButton.contains(e.target))delete stage.dataset.workHint;
  if(!productButton.contains(e.target))delete stage.dataset.productHint;
 },opts);
 function update(){
  const state=available();
  const enabled=hotspotAvailability({...readState(),propsReady});
  buttons.forEach((b,i)=>{const disabled=!enabled[i];if(b.disabled!==disabled)b.disabled=disabled;});
  if(!state.feedback&&lastEnabled)clear();
  lastEnabled=state.feedback;
  stage.dataset.interactive=String(state.feedback);
 }
 props.ready.then(value=>{if(!controller.signal.aborted){propsReady=value;stage.dataset.propsReady=String(value);update();}});
 setLocale('zh-HK');update();
 return {update,setLocale,clear,destroy(){clear();props.destroy();controller.abort();layer.remove();}};
}
