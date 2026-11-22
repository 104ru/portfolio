import { useState } from 'react';
import { CalendarDays, Clock3, Mail, Phone, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getCompanyById, getStakeholdersForDeal, type Deal } from '@/data/dealData';
import { timelineEvents } from '@/data/historyData';
import { calendarEvents } from '@/data/calendarEvents';
import { useStakeholderPopup } from '@/contexts/StakeholderPopupContext';
import { useEventPopup } from '@/contexts/EventPopupContext';

export function CompanyProfile({deal,onClose}:{deal:Deal;onClose:()=>void}) {
 const [tab,setTab]=useState('overview');
 const c=getCompanyById(deal.companyId)!;
 const people=getStakeholdersForDeal(deal.id);
 const activity=timelineEvents.filter(e=>e.dealId===deal.id).sort((a,b)=>b.date.localeCompare(a.date));
 const events=calendarEvents.filter(e=>e.dealName===deal.name).sort((a,b)=>a.date.getTime()-b.date.getTime());
 const {openPopup:openPerson}=useStakeholderPopup();
 const {openPopup:openEvent}=useEventPopup();
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="ref-company-dialog"><DialogHeader><div className="ref-profile-brand"><img src={c.logo} alt=""/><div><DialogTitle>{c.name}</DialogTitle><DialogDescription>{c.industry} · {deal.name}</DialogDescription></div></div></DialogHeader>
  <div className="ref-profile-tabs" role="tablist" aria-label="Company profile">{['overview','people','activity','schedule'].map(t=><button id={`profile-tab-${t}`} key={t} role="tab" tabIndex={tab===t?0:-1} onKeyDown={e=>{const tabs=['overview','people','activity','schedule'];const i=tabs.indexOf(t);const target=e.key==='ArrowRight'?tabs[(i+1)%4]:e.key==='ArrowLeft'?tabs[(i+3)%4]:e.key==='Home'?tabs[0]:e.key==='End'?tabs[3]:null;if(target){e.preventDefault();setTab(target);document.getElementById(`profile-tab-${target}`)?.focus()}}} aria-selected={tab===t} aria-controls="profile-content" onClick={()=>setTab(t)}>{t}{t==='people'?` (${people.length})`:t==='activity'?` (${activity.length})`:''}</button>)}</div>
  <section id="profile-content" role="tabpanel" aria-labelledby={`profile-tab-${tab}`} className="ref-profile-content">
   {tab==='overview'&&<><div className="ref-profile-stats"><div><small>Deal value</small><strong>{deal.value}</strong></div><div><small>Win probability</small><strong>{deal.winProbability}%</strong></div><div><small>Stakeholders</small><strong>{people.length}</strong></div></div><h3>{deal.summary.headline}</h3><p>{deal.summary.text}</p><h3>Account context</h3><p>{deal.summary.context}</p><h3>Recommended next step</h3><p>{deal.summary.action}</p><div className="ref-profile-company-line"><Clock3 size={14}/>Recorded close date: {deal.closeDate}</div></>}
   {tab==='people'&&people.map(p=><button className="ref-profile-person" key={p.id} onClick={()=>{onClose();openPerson(p)}}><img src={p.avatar} alt=""/><div><strong>{p.name}</strong><small>{p.role}</small><p>{p.summary}</p><small>Last interaction · {p.lastInteraction.date}</small><p>{p.lastInteraction.summary}</p></div><span>{p.alignment}%<small>alignment</small></span></button>)}
   {tab==='activity'&&activity.map(e=><article className="ref-profile-event" key={e.id}><div className="ref-profile-event-title">{e.type==='email'?<Mail size={16}/>:e.type==='call'?<Phone size={16}/>:<Users size={16}/>}<h3>{e.title}</h3></div><small>{e.date} · {e.time}</small><p>{e.description}</p><div className="ref-profile-attendees">{e.stakeholders.map(name=>{const p=people.find(p=>p.name===name);return <span key={name}>{p?.avatar&&<img src={p.avatar} alt=""/>}{name}</span>})}</div>{e.nextAction&&<p><b>Next step:</b> {e.nextAction}</p>}</article>)}
   {tab==='schedule'&&events.map(e=><button className="ref-profile-event ref-profile-event-button" key={e.id} onClick={()=>{onClose();openEvent(e)}}><div className="ref-profile-event-title"><CalendarDays size={16}/><h3>{e.title}</h3><span className="ref-stage">{e.status}</span></div><small>{e.date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} · {e.time}</small><p>{e.description}</p></button>)}
   {tab==='activity'&&!activity.length&&<p>No recorded activity for this deal.</p>}{tab==='schedule'&&!events.length&&<p>No recorded events for this deal.</p>}
  </section><p className="ref-profile-source">Loomik prototype records · original dates and demo contacts</p>
 </DialogContent></Dialog>;
}
