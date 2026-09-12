const labels={
 en:'Replay animation',
 'zh-CN':'重播动画',
 'zh-HK':'重播動畫',
};

export function heroReplayControl(locale,{ready,reduced,failed}){
 return {
  action:'replay',
  label:labels[locale]||labels.en,
  hidden:!ready||reduced||failed,
  visibleText:'',
 };
}
