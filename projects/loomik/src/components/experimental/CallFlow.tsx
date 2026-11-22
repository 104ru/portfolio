import { useEffect, useState } from 'react';
import { Phone, Play, Pause, SkipForward, PhoneOff, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CallRecordingPanel from '@/components/calendar/CallRecordingPanel';
import { callScript, recordingFromEntries, type CallPlan, type RecordingData } from '@/lib/callSimulation';

export interface CallResult { plan:CallPlan; recording:RecordingData; followUps:string[]; }
export function CallSuggestion({plan,onReview}:{plan:CallPlan;onReview:(plan:CallPlan)=>void}) {
 return <article className="call-suggestion"><div className="call-suggestion-label"><Phone size={14}/> A conversation could move this forward</div><div className="call-person"><Avatar><AvatarImage src={plan.person.avatar}/><AvatarFallback>{plan.person.name[0]}</AvatarFallback></Avatar><div><strong>{plan.person.name}</strong><small>{plan.person.role} · {plan.company}</small></div><span>15 min</span></div><p>{plan.reason}</p><button className="call-review-button" onClick={()=>onReview(plan)}>Review call brief <ArrowRight size={15}/></button></article>;
}
export function CallFlow({plan,onClose,onSave}:{plan:CallPlan;onClose:()=>void;onSave:(result:CallResult)=>void}) {
 const [phase,setPhase]=useState<'brief'|'live'|'ended'>('brief');
 const [count,setCount]=useState(0),[paused,setPaused]=useState(false);
 const [savedSteps,setSavedSteps]=useState<number[]>([0,1,2]);
 const script=callScript(plan);
 const recording=recordingFromEntries(plan,script.slice(0,count));
 useEffect(()=>{if(phase!=='live'||paused)return;const timer=setInterval(()=>setCount(n=>Math.min(script.length,n+1)),2600);return()=>clearInterval(timer)},[phase,paused,script.length]);
 useEffect(()=>{if(phase==='live'&&count===script.length)setPhase('ended')},[count,phase,script.length]);
 function restart(){setCount(0);setPaused(false);setPhase('brief');setSavedSteps([0,1,2])}
 return <Dialog open onOpenChange={open=>!open&&onClose()}><DialogContent className="experimental-dialog call-flow-dialog"><DialogHeader><div className="eyebrow">LOOMIK CALL STUDIO · SIMULATION</div><DialogTitle>{plan.title}</DialogTitle><DialogDescription>{plan.company} · {plan.deal.name}. A scripted rehearsal based on deal context. No real call or invitation is sent.</DialogDescription></DialogHeader>
  <div className="call-stepper">{['Brief','Conversation','Review'].map((step,i)=><span className={i===(phase==='brief'?0:phase==='live'?1:2)?'current':''} key={step}><i>{i+1}</i>{step}</span>)}</div>
  {phase==='brief'?<div className="call-brief"><div className="call-person"><Avatar><AvatarImage src={plan.person.avatar}/><AvatarFallback>{plan.person.name[0]}</AvatarFallback></Avatar><div><strong>{plan.person.name}</strong><small>{plan.person.role} · Alignment {plan.person.alignment}%</small></div></div><h3>Why this call</h3><p>{plan.reason}</p><h3>Suggested agenda · 15 minutes</h3><ol>{plan.agenda.map(item=><li key={item}>{item}</li>)}</ol><div className="call-evidence"><span>LAST RECORDED INTERACTION</span><p>{plan.person.lastInteraction.summary}</p></div><Button className="start-simulation" onClick={()=>{setCount(1);setPhase('live')}}><Play size={15}/> Start simulated call</Button></div>:<>
   {phase==='live'&&<div className="simulation-controls"><span className="simulation-status"><i className={paused?'paused':''}/>{paused?'Paused':'Simulating'} · {count}/{script.length} turns</span><button onClick={()=>setPaused(!paused)} aria-label={paused?'Resume simulation':'Pause simulation'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button><button onClick={()=>setCount(c=>Math.min(c+1,script.length))} aria-label="Next simulation turn"><SkipForward size={16}/></button><button className="end-call" onClick={()=>setPhase('ended')}><PhoneOff size={14}/> End simulation</button></div>}
   <CallRecordingPanel key={phase} eventTitle={plan.deal.name} recording={recording} duration={recording.transcript[recording.transcript.length-1]?.timestamp??'00:00'} live={phase==='live'}/>
   {phase==='live'&&<div className="live-call-hint" aria-live="polite"><span>LOOMIK IS FOLLOWING ALONG</span><p>{recording.moments[recording.moments.length-1]?.content??'Listening for decision criteria, concerns, and next steps…'}</p></div>}
   {phase==='ended'&&<div className="call-review"><h3>Bring the next steps into your workspace</h3><p>Only the conversation played so far is included. Deal scores remain unchanged.</p>{recording.summary.nextSteps.length?recording.summary.nextSteps.map((step,i)=><label key={step}><input type="checkbox" checked={savedSteps.includes(i)} onChange={()=>setSavedSteps(s=>s.includes(i)?s.filter(v=>v!==i):[...s,i])}/><span>{step}</span></label>):<p>No follow-up commitments were captured before the simulation ended.</p>}<div className="dialog-actions"><Button variant="outline" onClick={restart}>Run again</Button><Button onClick={()=>onSave({plan,recording,followUps:recording.summary.nextSteps.filter((_,i)=>savedSteps.includes(i))})}><Check size={15}/> Save recap to chat</Button></div></div>}
  </>}
 </DialogContent></Dialog>;
}
