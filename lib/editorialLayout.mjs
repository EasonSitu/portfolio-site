// A lead case, paired supporting projects, then a compact closing project.
export function editorialLayout(count){
 return Array.from({length:Math.max(0,count)},(_,i)=>i===0?'featured':i===count-1&&count%2===0?'compact':'standard');
}
