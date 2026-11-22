import { deals, getCompanyById, getStakeholdersForDeal, type Deal, type Stakeholder } from '@/data/dealData';

export interface TranscriptEntry { id:number; timestamp:string; speaker:string; isClient:boolean; content:string }
export interface KeyMoment { id:number; timestamp:string; type:'insight'|'risk'|'action'|'question'; speaker:string; content:string }
export interface RecordingData {
 transcript: TranscriptEntry[];
 moments: KeyMoment[];
 summary: { headline:string; keyTakeaways:string[]; sentiment:'positive'|'neutral'|'negative'; nextSteps:string[]; riskFlags:string[] };
}
export interface CallPlan { deal:Deal; person:Stakeholder; company:string; title:string; reason:string; agenda:string[] }
export function suggestCall(dealId?:number):CallPlan {
 const deal=deals.find(d=>d.id===dealId)??[...deals].filter(d=>d.hasRisk).sort((a,b)=>b.valueNumeric-a.valueNumeric)[0];
 const person=[...getStakeholdersForDeal(deal.id)].sort((a,b)=>a.alignment-b.alignment)[0];
 return {deal,person,company:getCompanyById(deal.companyId)!.name,title:`Alignment call with ${person.name}`,reason:person.summary,agenda:[`Clarify ${person.name}'s current decision criteria.`, `Discuss the latest interaction: ${person.lastInteraction.summary}.`, `Agree the next step: ${deal.summary.action}`]};
}
export function callScript(plan:CallPlan):TranscriptEntry[] {
 const lines:[string,boolean,string][]=[
 ['You',false,`Thanks for joining, ${plan.person.name.split(' ')[0]}. I'd like to focus on ${plan.deal.name} and understand what you need to move forward.`],
 [plan.person.name,true,`Let's start with the topic from our last interaction: ${plan.person.lastInteraction.summary}. I need a clear answer before making a recommendation.`],
 ['You',false,`That makes sense. Our preparation identifies this next step: ${plan.deal.summary.action} What would make that useful for your review?`],
 [plan.person.name,true,`Please make the assumptions and supporting evidence explicit. I don't want us to agree to a timeline before the open questions are resolved.`],
 ['You',false,`I'll prepare a focused follow-up covering those questions. Who else should review it with you?`],
 [plan.person.name,true,`Start with me, then we can bring in the other stakeholders. A short working session would help us check the evidence together.`],
 ['You',false,`I'll send a recap of the open questions and prepare the material for that working session. We'll confirm the next meeting separately.`],
 [plan.person.name,true,`That works as a next step. Let's review the material before making any commitment.`],
 ];
 return lines.map(([speaker,isClient,content],i)=>({id:i+1,timestamp:`0${Math.floor(i*30/60)}:${i%2?'30':'00'}`,speaker,isClient,content}));
}
export function recordingFromEntries(plan:CallPlan,transcript:TranscriptEntry[]):RecordingData {
 const has=(id:number)=>transcript.some(e=>e.id===id);
 const moments:KeyMoment[]=[];
 if(has(2))moments.push({id:2,timestamp:'00:30',type:'question',speaker:plan.person.name,content:'The stakeholder asks for a clear response to the last interaction.'});
 if(has(4))moments.push({id:4,timestamp:'01:30',type:'risk',speaker:plan.person.name,content:'Evidence and assumptions remain unresolved; no timeline commitment.'});
 if(has(6))moments.push({id:6,timestamp:'02:30',type:'insight',speaker:plan.person.name,content:'The stakeholder is open to a short working session after reviewing the material.'});
 if(has(7))moments.push({id:7,timestamp:'03:00',type:'action',speaker:'You',content:'Prepare a recap and supporting material; confirm a working session separately.'});
 return {transcript,moments,summary:{
  headline:!transcript.length?'No conversation captured':has(7)?'A focused follow-up is the next step':has(4)?'Evidence is the next decision gate':'Discovery is still in progress',
  keyTakeaways: moments.filter(m=>m.type!=='action').map(m=>m.content),
  sentiment:has(6)?'positive':'neutral',
  nextSteps:has(7)?[`Prepare the requested material for ${plan.person.name}.`,`Send a recap of open questions for ${plan.deal.name}.`,`Confirm a working-session time with ${plan.person.name}.`]:[],
  riskFlags:has(4)?['No timeline or purchase commitment was made.']:[],
 }};
}
