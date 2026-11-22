import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { GripHorizontal, Maximize2, RotateCcw, X } from 'lucide-react';
import './portfolio-demo.css';

type Frame = { x:number; y:number; width:number; height:number };
const initialFrame = ():Frame => ({x:Math.max(12,innerWidth*.045),y:86,width:Math.max(280,innerWidth*.91),height:Math.max(300,innerHeight-142)});
export default function PortfolioDemo({children}:{children:ReactNode}) {
 const [frame,setFrame]=useState(initialFrame);
 const [glass,setGlass]=useState(72);
 const [scene,setScene]=useState<'dusk'|'day'>('dusk');
 const [moving,setMoving]=useState(false);
 const gesture=useRef<{x:number;y:number;frame:Frame;resize:boolean}|null>(null);
 useEffect(()=>{document.body.classList.add('portfolio-mode');const resize=()=>setFrame(initialFrame());window.addEventListener('resize',resize);return()=>{document.body.classList.remove('portfolio-mode');window.removeEventListener('resize',resize)}},[]);
 const begin=(e:React.PointerEvent<HTMLElement>,resize=false)=>{if(e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);gesture.current={x:e.clientX,y:e.clientY,frame,resize};setMoving(true)};
 const move=(e:React.PointerEvent<HTMLElement>)=>{const g=gesture.current;if(!g)return;const dx=e.clientX-g.x,dy=e.clientY-g.y;setFrame(g.resize?{...g.frame,width:Math.max(Math.min(540,innerWidth-24),Math.min(innerWidth-g.frame.x-12,g.frame.width+dx)),height:Math.max(Math.min(360,innerHeight-100),Math.min(innerHeight-g.frame.y-12,g.frame.height+dy))}:{...g.frame,x:Math.max(0,Math.min(innerWidth-g.frame.width,g.frame.x+dx)),y:Math.max(64,Math.min(innerHeight-48,g.frame.y+dy))})};
 const end=()=>{gesture.current=null;setMoving(false)};
 const reset=()=>{setFrame(initialFrame());setGlass(72)};
 return <div className={`portfolio-stage ${scene}`}>
  <header className="portfolio-toolbar"><div><strong>Loomik</strong><span>Floating workspace · interactive demo</span></div><div className="portfolio-controls"><label>Glass <input aria-label="Glass opacity" type="range" min="35" max="95" value={glass} onChange={e=>setGlass(+e.target.value)}/></label><button onClick={()=>setScene(scene==='dusk'?'day':'dusk')}>{scene==='dusk'?'Daylight':'Dusk'}</button><button aria-label="Reset demo layout" title="Reset layout" onClick={reset}><RotateCcw size={16}/></button><a href="/loomik/" aria-label="Exit floating demo" title="Regular prototype"><X size={18}/></a></div></header>
  <div className="portfolio-desktop" aria-hidden="true"><div className="desktop-orb"/><section className="desktop-notes"><div className="desktop-window-label"><i/><i/><i/><span>Notes</span></div><small>THE WEEK AHEAD</small><h2>Good conversations.<br/>Better decisions.</h2><p>01 &nbsp; Listen to the customer</p><p>02 &nbsp; Find the next move</p><p>03 &nbsp; Make it happen</p><div className="desktop-note-line"/></section><section className="desktop-calendar"><div className="desktop-window-label"><i/><i/><i/><span>Calendar</span></div><small>MONDAY</small><h2>A little room<br/>to think.</h2><div>09:00 &nbsp; Team check-in</div><div>11:30 &nbsp; Customer conversation</div><div>14:00 &nbsp; Focus time</div></section><div className="desktop-caption">Less noise.<br/><em>More possibility.</em></div></div>
  <section aria-label="Floating Loomik workspace" className={`portfolio-window ${moving?'is-moving':''}`} style={{left:frame.x,top:frame.y,width:frame.width,height:frame.height,'--glass-opacity':glass/100} as CSSProperties}>
   <div className="portfolio-window-bar"><button className="portfolio-drag" aria-label="Move Loomik window" title="Drag to move · arrow keys to reposition" onPointerDown={e=>begin(e)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onKeyDown={e=>{const delta={ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]}[e.key];if(delta){e.preventDefault();setFrame(f=>({...f,x:Math.max(0,Math.min(innerWidth-f.width,f.x+delta[0])),y:Math.max(64,Math.min(innerHeight-48,f.y+delta[1]))}))}}}><GripHorizontal size={18}/><span>Loomik</span><small>Floating above the everyday</small></button><button title="Fit to stage" aria-label="Fit Loomik to stage" onClick={()=>setFrame(initialFrame())}><Maximize2 size={14}/></button></div>
   <div className="portfolio-app">{children}</div>
   <button aria-label="Resize Loomik window" title="Drag to resize · arrow keys to resize" className="portfolio-resize" onPointerDown={e=>begin(e,true)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();setFrame(f=>({...f,width:Math.max(Math.min(540,innerWidth-24),Math.min(innerWidth-f.x-12,f.width+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0))),height:Math.max(300,Math.min(innerHeight-f.y-12,f.height+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0)))}))}}}/>
  </section><footer className="portfolio-footer">Drag the top bar · resize from the corner · explore the real prototype</footer>
 </div>
}
