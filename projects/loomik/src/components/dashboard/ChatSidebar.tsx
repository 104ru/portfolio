import { create } from 'zustand';
import type { ReactNode } from 'react';
const initial=Number(localStorage.getItem('loomik-chat-width'));
export const useChatWidth=create<{width:number;setWidth:(n:number)=>void}>(set=>({width:initial>=280&&initial<=640?initial:320,setWidth:n=>{const width=Math.round(Math.max(280,Math.min(640,n)));localStorage.setItem('loomik-chat-width',String(width));set({width})}}));
export default function ChatSidebar({open,children}:{open:boolean;children:ReactNode}){
 const {width,setWidth}=useChatWidth();
 return <aside style={{width:open?width:0}} className="relative shrink-0 border-l border-border bg-card flex flex-col min-w-0">
 {open&&<div role="separator" aria-label="Resize chat column" aria-orientation="vertical" tabIndex={0} aria-valuenow={width} aria-valuemin={280} aria-valuemax={640}
 onPointerDown={e=>e.currentTarget.setPointerCapture(e.pointerId)}
 onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))setWidth(Math.min(window.innerWidth-e.clientX,window.innerWidth*.55))}}
 onDoubleClick={()=>setWidth(320)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();setWidth(width+(e.key==='ArrowLeft'?20:-20))}}}
 className="absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize touch-none z-10 hover:bg-purple/20 focus:bg-purple/20"/>}
 {open&&children}
 </aside>;
}
