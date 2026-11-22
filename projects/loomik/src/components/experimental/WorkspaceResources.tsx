import { useState } from 'react';
import { CalendarDays, FileText, Search, ArrowUpRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { calendarEvents } from '@/data/calendarEvents';
import { deals, getCompanyById } from '@/data/dealData';
import { useAssetsStore } from '@/stores/assetsStore';
import { useEventPopup } from '@/contexts/EventPopupContext';
export function WorkspaceResources({view,dealId,onClose}:{view:'calendar'|'assets';dealId?:number;onClose:()=>void}) {
 const [search,setSearch]=useState('');const [scope,setScope]=useState(dealId?String(dealId):'all');
 const assets=useAssetsStore(s=>s.assets);const {openPopup}=useEventPopup();
 const events=calendarEvents.filter(e=>(scope==='all'||e.dealName===deals.find(d=>d.id===Number(scope))?.name)&&`${e.title} ${e.company} ${e.description}`.toLowerCase().includes(search.toLowerCase()));
 const files=assets.filter(a=>(scope==='all'||!a.dealId||a.dealId===Number(scope))&&`${a.name} ${a.description} ${a.category}`.toLowerCase().includes(search.toLowerCase()));
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="ref-resource-dialog"><DialogHeader><DialogTitle>{view==='calendar'?'Calendar':'Assets'}</DialogTitle><DialogDescription>{view==='calendar'?'Recorded meetings and calls':'Sales material and shared documents'}</DialogDescription></DialogHeader><div className="ref-resource-filters"><label><Search size={15}/><input aria-label={`Search ${view}`} placeholder={`Search ${view}`} value={search} onChange={e=>setSearch(e.target.value)}/></label><select aria-label="Company filter" value={scope} onChange={e=>setScope(e.target.value)}><option value="all">All companies</option>{deals.map(d=><option key={d.id} value={d.id}>{getCompanyById(d.companyId)?.name}</option>)}</select></div><div className="ref-resource-list">
 {view==='calendar'?events.map(e=>{const c=getCompanyById(deals.find(d=>d.name===e.dealName)?.companyId??0);return <button className="ref-resource-row" key={e.id} onClick={()=>{onClose();openPopup(e)}}><CalendarDays size={17}/><div><strong>{e.title}</strong><small>{e.date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · {e.time}</small></div><span className="ref-stage">{e.status}</span>{c&&<img src={c.logo} alt={c.name} title={c.name}/>}</button>}):files.map(a=><article className="ref-resource-row" key={a.id}><FileText size={17}/><div><strong>{a.name}</strong><small>{a.description}</small></div><span className="ref-stage">{a.type}</span>{a.url?<a href={a.url} target="_blank" rel="noreferrer" aria-label={`Open ${a.name}`} title="Open document"><ArrowUpRight size={17}/></a>:<small>No file attached</small>}</article>)}
 {!(view==='calendar'?events.length:files.length)&&<p className="ref-empty">No matching records.</p>}
 </div><small className="ref-profile-source">Loomik prototype records · original dates{view==='assets'?' · sample documents':''}</small></DialogContent></Dialog>;
}
