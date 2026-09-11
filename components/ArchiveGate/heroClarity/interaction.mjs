export function interactionAvailability({ready,compare,reduced,elapsed,paused,visible=true}){
 const feedback=Boolean(ready&&!compare&&!paused&&visible&&(reduced||elapsed>=8200));
 return {feedback,replay:feedback&&!reduced};
}
export function createFeedbackGate(){
 let serial=0,active=null;
 return {
  begin(){if(active!==null)return null;active=++serial;return active;},
  finish(token){if(token===active)active=null;},
  cancel(){active=null;}
 };
}

export function hotspotAvailability(state){
 const {feedback,replay}=interactionAvailability(state);
 const props=feedback&&(state.reduced||state.propsReady===true);
 return [replay,props,props];
}
