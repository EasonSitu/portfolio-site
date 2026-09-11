const ramp=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const pulse=(t,a,b)=>Math.sin(Math.PI*ramp(t,a,b));
export function sceneAt(time,reduced=false){
 const t=reduced?8200:Math.max(0,Math.min(8200,Number.isFinite(time)?time:0));
 return {phase:t<500?'settle':t<3200?'paper':t<4200?'route-in':t<5200?'work':t<6500?'route-out':t<8200?'features':'complete',paper:Math.min(48,1+Math.floor(ramp(t,500,3200)*48)),routeIn:ramp(t,3000,4200),routeOut:ramp(t,5200,6500),work:pulse(t,4200,5200),features:[pulse(t,6500,7200),pulse(t,6900,7600),pulse(t,7300,8000)],finish:pulse(t,7700,8200)};
}
