import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Check, Search, LayoutGrid, CalendarDays, FolderOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { deals, actions, getCompanyById, getStakeholdersForDeal, getStakeholderById, stageConfig, type Deal, type Action } from '@/data/dealData';
import { seedSignals } from '@/data/signalsData';
import { useStakeholderPopup } from '@/contexts/StakeholderPopupContext';
import { money } from '@/lib/prototypeAnswers';
import { richAnswer, type ChatDataset } from '@/lib/richAnswers';
import { suggestCall, type CallPlan } from '@/lib/callSimulation';
import { ChatVisualization } from '@/components/experimental/ChatVisualization';
import { CallFlow, CallSuggestion, type CallResult } from '@/components/experimental/CallFlow';
import { PortfolioCard } from '@/components/experimental/PortfolioCard';
import { Sparkles, ArrowUpRight, BarChart3, Table2, Phone, RotateCcw, Layers, Compass, Zap, History } from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import type { ImperativePanelGroupHandle, ImperativePanelHandle } from 'react-resizable-panels';
import ActionEmailDialog from '@/components/dashboard/ActionEmailDialog';
import ActionMeetingDialog from '@/components/dashboard/ActionMeetingDialog';
import { useGeneratedActionsStore } from '@/stores/generatedActionsStore';
import RisksSignalsDialog from '@/components/dashboard/RisksSignalsDialog';
import { useSignalsStore } from '@/stores/signalsStore';
import { useActionsStore } from '@/stores/actionsStore';
import { loadColumns, saveColumns } from '@/lib/workspaceLayout';
import './experimental.css';
import './experimental-polish.css';

const icons = {filter:'b5403.svg', history:'af865.svg', copy:'0d770.svg', like:'f5583.svg', dislike:'2a909.svg', plus:'52ef9.svg', send:'4d9e4.svg', mic:'1bfcb.svg', clock:'25e28.svg', expand:'1f55e.svg', trend:'37793.svg'};
function Icon({name}: {name: keyof typeof icons}) { return <img className="figma-icon" src={`/loomik/figma/${icons[name]}`} alt="" />; }
function CompanyLogo({deal}: {deal:Deal}) {const c=getCompanyById(deal.companyId)!;return <span className="company-logo"><img src={c.logo} alt={c.name}/></span>;}
type Message = {role:'user'|'assistant'; text:string; dataset?:ChatDataset; view?:'table'|'chart'; call?:CallPlan; recap?:CallResult};

export default function Index() {
 const [initialColumns]=useState(loadColumns);
 const panelGroup=useRef<ImperativePanelGroupHandle>(null);
 const movesPanel=useRef<ImperativePanelHandle>(null);
 const [actionEditor,setActionEditor]=useState<Action|null>(null);
 const [params,setParams]=useSearchParams();
 const selected=deals.find(d=>d.id===Number(params.get('deal')));
 const [filter,setFilter]=useState(false),[query,setQuery]=useState(''),[stage,setStage]=useState('all');
 const [collapsed,setCollapsed]=useState(false),[mobilePane,setMobilePane]=useState('deals');
 const [conversations,setConversations]=useState<Record<string,Message[]>>(()=>{try{return JSON.parse(sessionStorage.getItem('experimental-loomik-chats')||'{}')}catch{return {}}});
 const [callPlan,setCallPlan]=useState<CallPlan|null>(null);
 const {actions:generatedActions,addActions}=useGeneratedActionsStore();
 const {doneActions,archivedActions,markAsDone,undoDoneAction}=useActionsStore();
 const completed=doneActions.map(a=>a.id);
 const [input,setInput]=useState(''),[signalType,setSignalType]=useState<'risk'|'signal'|null>(null);
 const [activeAction,setActiveAction]=useState<Action|null>(null),[draft,setDraft]=useState('');

 const [historyOpen,setHistoryOpen]=useState(false),[feedback,setFeedback]=useState<Record<string,string>>({});
 const [notice,setNotice]=useState('');
 const [listening,setListening]=useState(false);
 const recognitionRef=useRef<any>(null);
 useEffect(()=>()=>recognitionRef.current?.stop(),[]);
 function dictate(){
  const Speech=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
  if(!Speech){setNotice('Voice input is not supported in this browser. Please type your message.');return;}
  if(listening){recognitionRef.current?.stop();return;}
  const recognition=new Speech();recognitionRef.current=recognition;recognition.lang='en-US';
  recognition.onresult=(event:any)=>setInput(v=>(v+' '+event.results[0][0].transcript).trim());
  recognition.onend=()=>setListening(false);
  recognition.onerror=()=>{setListening(false);setNotice('Voice input unavailable. Please type your message.');};
  recognition.start();setListening(true);
 }
 const chatEnd=useRef<HTMLDivElement>(null);
 const {openPopup}=useStakeholderPopup();
 const key=selected?String(selected.id):'account';
 const messages=conversations[key]||[];
 const sourceSignals=useSignalsStore(s=>s.signals);
 const signals=sourceSignals.filter(s=>s.status==='pending'&&(!selected||s.dealId===selected.id));
 const allActions:Action[]=[...generatedActions,...actions];
 const scopedActions=allActions.filter(a=>(!selected||a.dealId===selected.id)&&!completed.includes(a.id)&&!archivedActions.some(item=>item.id===a.id));
 const topMove=scopedActions.find(a=>a.priority==='high')??scopedActions[0];
 const focusDeal=selected??deals.find(d=>d.id===topMove?.dealId)??deals[0];
 const pipelineValue=deals.reduce((n,d)=>n+d.valueNumeric,0);
 const people=selected?getStakeholdersForDeal(selected.id):[];
 const visibleDeals=deals.filter(d=>(stage==='all'||d.stage===stage)&&`${d.name} ${getCompanyById(d.companyId)!.name}`.toLowerCase().includes(query.toLowerCase()));
 useEffect(()=>{chatEnd.current?.scrollIntoView({block:'nearest'});},[messages.length]);
 useEffect(()=>{try{sessionStorage.setItem('experimental-loomik-chats',JSON.stringify(conversations))}catch{/* Storage can be unavailable. */}},[conversations]);
 useEffect(()=>{if(!notice)return;const id=setTimeout(()=>setNotice(''),3500);return()=>clearTimeout(id)},[notice]);
 function choose(d?:Deal){setParams(d?{deal:String(d.id)}:{});setInput('');setMobilePane('deals');}
 function ask(text:string){
  if(!text.trim())return;
  const previous=[...messages].reverse().find(m=>m.dataset)?.dataset;
  const answer=richAnswer(text,selected?.id,previous);
  setConversations(c=>({...c,[key]:[...(c[key]||[]),{role:'user',text:text.trim()},{role:'assistant',...answer}]}));setInput('');setMobilePane('chat');
 }
 function saveCall(result:CallResult){
  const targetKey=selected?String(result.plan.deal.id):'account';
  setConversations(c=>({...c,[targetKey]:[...(c[targetKey]||[]),{role:'assistant',text:`Simulated call recap · ${result.plan.company}\n${result.recording.summary.headline}`,recap:result}]}));
  const stamp=Date.now();
  addActions(result.followUps.map((title,i)=>({id:stamp+i,dealId:result.plan.deal.id,title,stakeholderIds:[result.plan.person.id],artifact:'Simulated call follow-up',basedOn:'Agreed during a scripted rehearsal; review before real outreach.',priority:'high' as const,type:'email' as const,deadline:'Review next',status:'pending' as const})));
  setCallPlan(null);setMobilePane('chat');setNotice('Simulation recap saved. Selected follow-ups are in Priority Moves.');
 }
 function completeAction(a:Action){
  const d=deals.find(d=>d.id===a.dealId)!;const c=getCompanyById(d.companyId)!;
  markAsDone({...a,stakeholders:a.stakeholderIds.map(id=>getStakeholderById(id)!).filter(Boolean),dealName:d.name,dealValue:d.value,companyName:c.name,companyLogo:c.logo,winProbability:d.winProbability,status:'done'});
 }
 function work(a:Action){setActiveAction(a);setDraft(`${a.title}\n\n${a.basedOn}\n\nPrepare: ${a.artifact}\n\nStakeholders: ${a.stakeholderIds.map(id=>getStakeholderById(id)?.name).join(', ')}\nDeadline: ${a.deadline}`);}
 async function copy(text:string){try{await navigator.clipboard.writeText(text);setNotice('Copied to clipboard.')}catch{setNotice('Clipboard unavailable. Select and copy the text.')}}
 const prompts=selected?['Deal News','Calculate ROI','Show me schedule','How to raise Probability']:['Account News','Where do I start?','What should I do first?','Account Risks'];
 return <div className={`experimental ${selected?'deal-view':''} ${collapsed?'moves-collapsed':''}`}>
  <nav className="workspace-navigation" aria-label="Loomik navigation"><Link to="/" className="current"><Sparkles size={14}/> Workspace</Link><Link to="/portfolio"><Layers size={14}/> Portfolio</Link><Link to={selected?`/deal-gps?deal=${selected.id}`:'/deal-gps'}><Compass size={14}/> Deal GPS</Link><Link to={selected?`/action-hub?deal=${encodeURIComponent(selected.name)}`:'/action-hub'}><Zap size={14}/> Action Hub</Link><Link to="/calendar"><CalendarDays size={14}/> Calendar</Link><Link to="/assets"><FolderOpen size={14}/> Assets</Link><Link to="/history"><History size={14}/> History</Link><button className="reset-columns" onClick={()=>{panelGroup.current?.setLayout([29,44,27]);setCollapsed(false);setNotice('Column widths reset. Drag the dividers to resize.')}} title="Reset column widths"><RotateCcw size={13}/> Reset widths</button></nav>
  <nav className="mobile-tabs" aria-label="Workspace panes">{['deals','chat','moves'].map(p=><button key={p} className={mobilePane===p?'active':''} onClick={()=>{setMobilePane(p);if(p==='moves'){movesPanel.current?.expand();setCollapsed(false)}}}>{p==='deals'?'Portfolio':p==='chat'?'Loomik chat':'Priority moves'}</button>)}</nav>
  <main className="workspace"><ResizablePanelGroup ref={panelGroup} direction="horizontal" className="workspace-panels" onLayout={saveColumns} keyboardResizeBy={2}>
   <ResizablePanel id="portfolio" order={1} defaultSize={initialColumns[0]} minSize={19} maxSize={55}>
   <section className={`portfolio pane ${mobilePane==='deals'?'mobile-active':''}`} aria-label="Portfolio">
    <header className="pane-header portfolio-header">{selected?<><button className="icon-button" onClick={()=>choose()} aria-label="Back to all deals"><ArrowLeft size={16}/></button><span className="deal-heading">{selected.name}: {getCompanyById(selected.companyId)!.name}</span></>:<><img className="wordmark" src="/loomik/figma/cb9f2.svg" alt="Loomik"/><span className="muted">All Deals</span></>}<button className="icon-button" aria-label="Filter deals" aria-expanded={filter} onClick={()=>setFilter(!filter)}><Icon name="filter"/></button></header>
    {filter&&<div className="filters"><Input aria-label="Search deals" placeholder="Search deals or companies" value={query} onChange={e=>{setQuery(e.target.value);if(selected)choose()}}/><select aria-label="Deal stage" value={stage} onChange={e=>{setStage(e.target.value);if(selected)choose()}}><option value="all">All stages</option>{Object.entries(stageConfig).map(([s,v])=><option key={s} value={s}>{v.label}</option>)}</select></div>}
    <div className="portfolio-content">
     {selected&&<nav className="company-rail" aria-label="Choose deal"><button onClick={()=>choose()} title="All deals" aria-label="All deals"><LayoutGrid size={17}/></button>{deals.map(d=><button key={d.id} aria-label={`Open ${getCompanyById(d.companyId)!.name}`} className={selected.id===d.id?'selected':''} onClick={()=>choose(d)}><CompanyLogo deal={d}/></button>)}</nav>}
     <div className="portfolio-scroll">
      {!selected?<><div className="portfolio-intro"><div className="eyebrow">YOUR PIPELINE</div><div><h2>{money(pipelineValue)}<span> in play</span></h2><span>{deals.length} active deals</span></div></div><div className="deal-list">{visibleDeals.map(d=><PortfolioCard key={d.id} deal={d} onSelect={()=>choose(d)}/>)}{!visibleDeals.length&&<p className="empty">No deals match your filters.</p>}</div></>:<>
      <div className="deal-total"><span>Total <b>{money(selected.valueNumeric)}</b></span><span>Close by <b>{selected.closeDate}</b></span><span className="stage-tag">{stageConfig[selected.stage].label}</span></div>
      <div className="metrics"><button className="win-card" onClick={()=>ask('How to raise probability')}><b>Win Probability</b><div className="donut" style={{background:`conic-gradient(#84b98a ${selected.winProbability}%, #e8e8ed 0)`}}><span>{selected.winProbability}%</span></div></button><div className="metric-rows">{(['sentiment','alignment','consensus'] as const).map(m=><div key={m}><span>{m[0].toUpperCase()+m.slice(1)}</span><b className={selected[m]>=70?'good':'warm'}>{selected[m]}%</b></div>)}</div></div>
      <div className="stakeholder-heading"><b>{people.length} Stakeholders</b><button onClick={()=>{movesPanel.current?.expand();setCollapsed(false);setMobilePane('moves')}}><span className="count">{scopedActions.length}</span> Moves to do</button></div>
      <div className="stakeholder-grid">{people.map(s=><button className={`person-card ${s.status}`} key={s.id} onClick={()=>openPopup(s)}><div className="person-score">Alignment <b>{s.alignment}%</b></div><Avatar className="person-avatar"><AvatarImage src={s.avatar}/><AvatarFallback>{s.name.slice(0,2)}</AvatarFallback></Avatar><strong>{s.name}</strong><small>{s.role}</small><span className="person-status">{s.engagementCategory}</span><div className="person-bottom"><span>Priority {s.priority}%</span><span>Sentiment {s.sentiment}%</span></div></button>)}</div><div className="deal-context"><h3>Deal brief</h3><p>{selected.summary.text}</p><Link to={`/deal-gps?deal=${selected.id}`}>Open full deal dashboard <ChevronRight size={14}/></Link></div></>}
     </div>
    </div>
    <footer className="portfolio-footer"><Link to="/calendar"><CalendarDays size={14}/> Calendar</Link><Link to="/assets"><FolderOpen size={14}/> Assets</Link><span>Experimental</span></footer>
   </section>
   </ResizablePanel><ResizableHandle withHandle className="workspace-divider" aria-label="Resize portfolio and chat columns" onDoubleClick={()=>panelGroup.current?.setLayout([29,44,27])}/><ResizablePanel id="chat" order={2} defaultSize={initialColumns[1]} minSize={25}>
   <section className={`chat-pane pane ${mobilePane==='chat'?'mobile-active':''}`} aria-label="Loomik chat">
    <header className="pane-header chat-header"><button onClick={()=>setSignalType('signal')}><span className="count">{signals.filter(s=>s.type==='signal').length}</span> New Signals</button><button onClick={()=>setSignalType('risk')}><span className="count red">{signals.filter(s=>s.type==='risk').length}</span> New Risks</button></header>
    <div className="chat-scroll"><div className={`chat-welcome ${messages.length?'compact':''}`} key={key}><div className="loomik-spark"><Sparkles size={24}/></div><div className="eyebrow">YOUR NEXT MOVE, CLEARER.</div><h1>{selected?<>{getCompanyById(selected.companyId)!.name}.<br/><em>Let's move it forward.</em></>:<>{deals.length} deals. {money(pipelineValue)} in play.<br/><em>Where should we focus?</em></>}</h1>{!messages.length&&<><p>Turn your pipeline into a clear picture.<br/>Explore the data, find the next step, rehearse the conversation.</p><div className="starter-prompts"><button onClick={()=>ask(selected?'Chart stakeholder alignment':'Graph pipeline by company')}><BarChart3 size={16}/>{selected?'Map stakeholder alignment':'Visualize my pipeline'}<ArrowUpRight size={15}/></button><button onClick={()=>ask(selected?'Show deal health in a table':'Show all deals in a table')}><Table2 size={16}/>Compare the numbers<ArrowUpRight size={15}/></button><button onClick={()=>ask('Suggest a call')}><Phone size={16}/>Find a conversation worth having<ArrowUpRight size={15}/></button></div></>}</div>{messages.map((m,i)=><article key={`${key}-${i}`} className={`message ${m.role}`}><p>{m.text}</p>{m.dataset&&<ChatVisualization dataset={m.dataset} initialView={m.view}/>} {m.call&&<CallSuggestion plan={m.call} onReview={setCallPlan}/>} {m.recap&&<div className="recap-card"><span className="eyebrow">SIMULATED CONVERSATION</span><h3>{m.recap.plan.person.name} · {m.recap.plan.person.role}</h3><ul>{m.recap.recording.summary.keyTakeaways.map(t=><li key={t}>{t}</li>)}</ul><p>{m.recap.followUps.length} follow-ups added to Priority Moves.</p><button onClick={()=>ask(`Show ${m.recap!.plan.company} stakeholder alignment chart`)}>Explore stakeholder alignment <ArrowUpRight size={14}/></button></div>}{m.role==='assistant'&&<div className="message-tools"><button className="icon-button" aria-label={`Copy response ${i}`} onClick={()=>copy(m.text)}><Icon name="copy"/></button>{(['like','dislike'] as const).map(v=><button className={`icon-button ${feedback[`${key}-${i}`]===v?'chosen':''}`} aria-label={`${v} response ${i}`} key={v} onClick={()=>setFeedback(f=>({...f,[`${key}-${i}`]:v}))}><Icon name={v}/></button>)}</div>}</article>)}<div ref={chatEnd}/></div>
    <form className="composer" onSubmit={e=>{e.preventDefault();ask(input)}}><textarea aria-label="Ask Loomik" placeholder="Ask a question. Request a table. Explore a graph…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(input)}}}/><div className="composer-bottom"><button type="button" className="icon-button" aria-label="Add deal context" title="Add deal context" onClick={()=>setInput(selected?`Summarize ${getCompanyById(selected.companyId)!.name}`:'Summarize my pipeline')}><Icon name="plus"/></button><span>Prototype · Loomik data</span><button className="send-button" type="submit" disabled={!input.trim()} aria-label="Send message"><Icon name="send"/></button><button type="button" className={`voice-button ${listening?'listening':''}`} aria-label={listening?'Stop dictation':'Dictate message'} onClick={dictate}><Icon name="mic"/></button></div></form>
   </section>
   </ResizablePanel><ResizableHandle withHandle className="workspace-divider" aria-label="Resize chat and priority moves columns" onDoubleClick={()=>panelGroup.current?.setLayout([29,44,27])}/><ResizablePanel ref={movesPanel} id="moves" order={3} defaultSize={initialColumns[2]} minSize={19} maxSize={50} collapsible collapsedSize={4} onResize={size=>setCollapsed(size<10)}>
   <section className={`moves-pane pane ${mobilePane==='moves'?'mobile-active':''}`} aria-label="Priority moves">
    <header className="pane-header moves-header"><button className="icon-button" onClick={()=>setHistoryOpen(true)} aria-label="Completed actions"><Icon name="history"/></button>{!collapsed&&<span>Priority Moves for the {selected?'Deal':'Account'}</span>}<button className="icon-button" onClick={()=>{if(collapsed)movesPanel.current?.expand();else movesPanel.current?.collapse()}} aria-label={collapsed?'Expand priority moves':'Collapse priority moves'}>{collapsed?<ChevronLeft size={16}/>:<Icon name="expand"/>}</button></header>
    {!collapsed&&<div className="moves-scroll">{topMove&&<article className="next-best-move"><div className="eyebrow"><Sparkles size={13}/> YOUR NEXT BEST MOVE</div><span>{getCompanyById(focusDeal.companyId)!.name} · {money(focusDeal.valueNumeric)}</span><h2>{topMove.title}</h2><p>{focusDeal.summary.headline}</p><Button onClick={()=>work(topMove)}>Prepare next step <ArrowUpRight size={15}/></Button><button className="suggest-call-link" onClick={()=>setCallPlan(suggestCall(focusDeal.id))}><Phone size={14}/> Rehearse a call first</button></article>}<div className="quick-prompts">{prompts.map(p=><Button variant="outline" key={p} onClick={()=>ask(p)}>{p}</Button>)}</div><div className="action-list">{scopedActions.map(a=>{const d=deals.find(d=>d.id===a.dealId)!;return <article className={`move-card ${a.priority}`} key={a.id}>{!selected?<div className="move-main"><CompanyLogo deal={d}/><div><small>{getCompanyById(d.companyId)!.name}</small><h3>{a.title}</h3></div><Button onClick={()=>work(a)}>Work on it</Button></div>:<><div className="move-top"><span><Icon name="clock"/>{a.deadline}</span><Button onClick={()=>work(a)}>Work on it</Button></div><div className="action-people">{a.stakeholderIds.map(id=>{const s=getStakeholderById(id)!;return <button key={id} onClick={()=>openPopup(s)}><Avatar><AvatarImage src={s.avatar}/><AvatarFallback>{s.name[0]}</AvatarFallback></Avatar>{s.name}</button>})}</div><div className="action-description"><h3>{a.title}</h3><p>{a.basedOn}</p></div></>}{!selected&&<div className="move-deadline"><Icon name="clock"/>{a.deadline}</div>}</article>})}{!scopedActions.length&&<div className="empty"><Check size={24}/><p>No pending actions for this selection.</p><Button variant="outline" onClick={()=>ask('What should I do first?')}>Review next steps</Button></div>}</div></div>}
   </section>
  </ResizablePanel></ResizablePanelGroup></main>
  <RisksSignalsDialog open={signalType!==null} onOpenChange={v=>!v&&setSignalType(null)} defaultTab={signalType==='signal'?'signals':'risks'} defaultDealName={selected?.name??'all'}/>
  <Dialog open={!!activeAction} onOpenChange={v=>!v&&setActiveAction(null)}><DialogContent className="experimental-dialog"><DialogHeader><DialogTitle>{activeAction?.title}</DialogTitle><DialogDescription>{activeAction?.artifact} · {activeAction?.deadline} · Local preparation workspace</DialogDescription></DialogHeader><label htmlFor="action-draft">Preparation notes</label><textarea id="action-draft" className="draft-textarea" value={draft} onChange={e=>setDraft(e.target.value)}/><div className="dialog-actions"><Button variant="outline" onClick={()=>{setActionEditor(activeAction);setActiveAction(null)}}>{activeAction?.type==='meeting'?'Open meeting workspace':'Open email workspace'}</Button><Button variant="outline" onClick={()=>copy(draft)}>Copy notes</Button><Button onClick={()=>{completeAction(activeAction!);setActiveAction(null);setNotice('Action marked done. You can restore it from history.')}}>Mark done</Button></div></DialogContent></Dialog>
  <Dialog open={historyOpen} onOpenChange={setHistoryOpen}><DialogContent className="experimental-dialog"><DialogHeader><DialogTitle>Completed actions</DialogTitle><DialogDescription>Changes are saved in this browser.</DialogDescription></DialogHeader>{!completed.length?<p>No completed actions yet.</p>:<div className="dialog-list">{allActions.filter(a=>completed.includes(a.id)).map(a=><article key={a.id}><h3>{a.title}</h3><Button variant="outline" onClick={()=>undoDoneAction(a.id)}>Restore action</Button></article>)}</div>}</DialogContent></Dialog>
  {actionEditor&&(()=>{const person=getStakeholderById(actionEditor.stakeholderIds[0])!;const company=getCompanyById(deals.find(d=>d.id===actionEditor.dealId)!.companyId)!;const Editor=actionEditor.type==='meeting'?ActionMeetingDialog:ActionEmailDialog;return <Editor key={actionEditor.id} open onOpenChange={v=>!v&&setActionEditor(null)} action={{...actionEditor,stakeholderName:person.name,stakeholderRole:person.role}} company={company.name} companyLogo={company.logo} onMarkDone={()=>{completeAction(actionEditor);setActionEditor(null)}}/>})()}
  {callPlan&&<CallFlow plan={callPlan} onClose={()=>setCallPlan(null)} onSave={saveCall}/>}
  {notice&&<div className="notice" role="status">{notice}</div>}
 </div>;
}
