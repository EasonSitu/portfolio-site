export function emphasisParts(value, phrases = [], limit = 2) {
  const text=String(value??'');
  const choices=[...new Set(phrases.filter(p=>typeof p==='string'&&p.length))];
  const parts=[];let cursor=0,count=0;
  while(cursor<text.length&&count<limit){
    const matches=choices.map(phrase=>({phrase,index:text.indexOf(phrase,cursor)}))
      .filter(m=>m.index>=0).sort((a,b)=>a.index-b.index||b.phrase.length-a.phrase.length);
    const match=matches[0];if(!match)break;
    if(match.index>cursor)parts.push({text:text.slice(cursor,match.index),emphasis:false});
    parts.push({text:match.phrase,emphasis:true});
    cursor=match.index+match.phrase.length;count++;
  }
  if(cursor<text.length||!parts.length)parts.push({text:text.slice(cursor),emphasis:false});
  return parts;
}

export function magneticOffset(x,y,width,height){
  if(!(width>0&&height>0)||![x,y,width,height].every(Number.isFinite))return {x:0,y:0};
  const clamp=n=>Math.max(-1,Math.min(1,n));
  return {x:clamp(x/width*2-1)*6,y:clamp(y/height*2-1)*4};
}

export const projectEmphasis=[
  '项目负责人','項目負責人','project lead',
  '原型测试和客户演示','原型測試和客戶演示','testing and the client demo',
  '都由我完成','I built','质量检查','品質檢查','quality checks',
  '三语前端','三語前端','trilingual frontend',
];
