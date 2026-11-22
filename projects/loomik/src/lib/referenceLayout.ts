export type PaneWidths = {left:number; right:number};
export function defaultWidths(detail:boolean, viewport=1280):PaneWidths {return detail?{left:viewport>=1440?480:320,right:300}:{left:320,right:360};}
export function fitWidths(value:PaneWidths, available:number):PaneWidths {
 const room=Math.max(540,available)-280;
 const left=Math.max(240,Math.min(620,Number.isFinite(value.left)?value.left:320,room-150));
 const right=Math.max(150,Math.min(480,Number.isFinite(value.right)?value.right:360,room-left));
 return {left,right};
}
export function widthStorageKey(detail:boolean){return `loomik-reference-widths-v2-${detail?'deal':'account'}`;}
export function readWidths(detail:boolean):PaneWidths {
 try {
  const current=localStorage.getItem(widthStorageKey(detail));
  const legacy=localStorage.getItem(`loomik-reference-widths-${detail?'deal':'account'}`);
  const v=JSON.parse(current??legacy??'null');
  if(v&&Number.isFinite(v.left)&&Number.isFinite(v.right)){
   if(!current&&detail&&v.left===480&&v.right===300)return defaultWidths(detail,window.innerWidth);
   return {left:Math.max(240,Math.min(620,v.left)),right:Math.max(150,Math.min(480,v.right))};
  }
 }catch{/* Use defaults for invalid storage. */}
 return defaultWidths(detail,window.innerWidth);
}
