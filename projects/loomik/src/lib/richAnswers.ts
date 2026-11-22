import { deals, stakeholders, getCompanyById, stageConfig } from '@/data/dealData';
import { seedSignals } from '@/data/signalsData';
import type { DetectedSignal } from '@/stores/signalsStore';
import { prototypeAnswer, money } from './prototypeAnswers';
import { suggestCall, type CallPlan } from './callSimulation';

export type DataRow=Record<string,string|number>;
export interface DataColumn { key:string; label:string; format?:'money'|'percent' }
export interface ChatDataset {title:string; source:string; columns:DataColumn[]; rows:DataRow[]; category:string; series:string[]; chart:'bar'|'line'; unit:'money'|'percent'|'count';}
export interface RichAnswer { text:string; dataset?:ChatDataset; view?:'table'|'chart'; call?:CallPlan }
export function richAnswer(input:string,dealId?:number,previous?:ChatDataset,signalRecords:readonly Omit<DetectedSignal,'id'>[]=seedSignals):RichAnswer {
 const named=deals.filter(d=>input.toLowerCase().includes(getCompanyById(d.companyId)!.name.toLowerCase()));
 const all=/all deals|whole pipeline|entire pipeline|across (?:the )?(?:pipeline|companies)|all companies/i.test(input);
 const scope=named.length?named:all?deals:dealId?deals.filter(d=>d.id===dealId):deals;
 const scopeIds=scope.map(d=>d.id);
 const isVisual=/table|chart|graph|plot|visuali[sz]e|compare|comparison|breakdown/i.test(input);
 const view=/table/i.test(input)&&!/chart|graph|plot/i.test(input)?'table':'chart';
 if(/(?:suggest|recommend|prepare|simulate|practice|start|schedule|need|should|who).*(?:call|meeting)|(?:call|meeting).*(?:suggest|recommend|prepare|simulate)|who.*(?:talk|speak)/i.test(input)||/^(a )?call[.!?]?$/i.test(input)) {
  const plan=suggestCall(scope.length===1?scope[0].id:undefined);
  return {text:`A focused conversation with ${plan.person.name} would be useful. Their recorded alignment is ${plan.person.alignment}%. ${plan.person.lastInteraction.summary}.`,call:plan};
 }
 if(isVisual&&previous&&/\b(that|this|it|same|these)\b/i.test(input)&&!named.length&&!/risk|stakeholder|trend|alignment|sentiment|stage|probability|pipeline|value/i.test(input))return{text:`Here's the same data as a ${view}.`,dataset:previous,view};
 if(!isVisual)return {text:prototypeAnswer(input,scope.length===1?scope[0].id:undefined,signalRecords)};
 if(/roi|profit|cost|savings|revenue growth|forecast.*(?:next|month|year)|pipeline.*(?:trend|over time)|(?:trend|over time).*pipeline/i.test(input))return{text:'The Loomik records do not contain the historical pipeline or cost inputs needed for that view. I can chart current deal values, win probability, alignment, stage totals, or recorded stakeholder trends.'};
 let dataset:ChatDataset;
 if(/trend|over time|history|historical/i.test(input)) {
  const pool=stakeholders.filter(s=>scopeIds.includes(s.dealId));
  const person=pool.find(s=>input.toLowerCase().includes(s.name.toLowerCase()))??[...pool].sort((a,b)=>a.alignment-b.alignment)[0];
  dataset={title:`${person.name} · recorded trends`,source:`Loomik stakeholder history · ${person.trends[0].date} to ${person.trends[person.trends.length-1].date}. Separate historical snapshots; current scores may differ.`,columns:[{key:'date',label:'Date'}, {key:'alignment',label:'Alignment',format:'percent'},{key:'sentiment',label:'Sentiment',format:'percent'},{key:'priority',label:'Priority',format:'percent'}],rows:person.trends.map(p=>({...p})),category:'date',series:['alignment','sentiment','priority'],chart:'line',unit:'percent'};
 }else if(/stakeholder|buyer|champion|people/i.test(input)) {
  dataset={title:'Stakeholder alignment',source:'Loomik stakeholder records · current snapshot',columns:[{key:'name',label:'Stakeholder'},{key:'company',label:'Company'},{key:'alignment',label:'Alignment',format:'percent'},{key:'sentiment',label:'Sentiment',format:'percent'},{key:'engagement',label:'Engagement',format:'percent'}],rows:stakeholders.filter(s=>scopeIds.includes(s.dealId)).map(s=>({name:s.name,company:getCompanyById(s.companyId)!.name,alignment:s.alignment,sentiment:s.sentiment,engagement:s.engagement})),category:'name',series:['alignment','sentiment'],chart:'bar',unit:'percent'};
 }else if(/risk|signal/i.test(input)) {
  dataset={title:'Open signals and risks by company',source:'Loomik signal records · pending items only',columns:[{key:'company',label:'Company'},{key:'risks',label:'Risks'},{key:'signals',label:'Signals'}],rows:scope.map(d=>({company:getCompanyById(d.companyId)!.name,risks:signalRecords.filter(s=>s.dealId===d.id&&s.type==='risk'&&s.status==='pending').length,signals:signalRecords.filter(s=>s.dealId===d.id&&s.type==='signal'&&s.status==='pending').length})),category:'company',series:['risks','signals'],chart:'bar',unit:'count'};
 }else if(/stage/i.test(input)) {
  dataset={title:'Pipeline by stage',source:'Sum of Loomik deal values grouped by their recorded stage',columns:[{key:'stage',label:'Stage'},{key:'value',label:'Pipeline value',format:'money'},{key:'count',label:'Deals'}],rows:Object.entries(stageConfig).map(([key,v])=>({stage:v.label,value:scope.filter(d=>d.stage===key).reduce((n,d)=>n+d.valueNumeric,0),count:scope.filter(d=>d.stage===key).length})),category:'stage',series:['value'],chart:'bar',unit:'money'};
 }else {
  const health=/alignment|probability|win|health|sentiment|consensus/i.test(input);
  const series=health?(/sentiment/i.test(input)?['sentiment']: /consensus/i.test(input)?['consensus']:['win','alignment']):/weighted|forecast/i.test(input)?['value','weighted']:['value'];
  dataset={title:health?'Deal health comparison':'Pipeline value by company',source:health?'Loomik deal records · current snapshot':'Loomik deal records · weighted value = deal value × win probability; not a committed forecast',columns:[{key:'company',label:'Company'},{key:'value',label:'Value',format:'money'},{key:'weighted',label:'Weighted',format:'money'},{key:'win',label:'Win probability',format:'percent'},{key:'alignment',label:'Alignment',format:'percent'},{key:'sentiment',label:'Sentiment',format:'percent'},{key:'consensus',label:'Consensus',format:'percent'}],rows:scope.map(d=>({company:getCompanyById(d.companyId)!.name,value:d.valueNumeric,weighted:Math.round(d.valueNumeric*d.winProbability/100),win:d.winProbability,alignment:d.alignment,sentiment:d.sentiment,consensus:d.consensus})),category:'company',series,chart:'bar',unit:health?'percent':'money'};
 }
 return {text:scope.length===1?`Here is the recorded data for ${getCompanyById(scope[0].companyId)!.name}.`:`${scope.length} deals. ${money(scope.reduce((n,d)=>n+d.valueNumeric,0))} in play. Here's the comparison.`,dataset,view};
}
