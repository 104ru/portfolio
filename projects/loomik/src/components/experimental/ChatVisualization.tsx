import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { BarChart3, Table2, Maximize2, ArrowDownUp } from 'lucide-react';
import { ChartContainer } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { money } from '@/lib/prototypeAnswers';
import type { ChatDataset } from '@/lib/richAnswers';

const colors=['#23396d','#f97316','#10b981'];
export function ChatVisualization({dataset,initialView='chart'}:{dataset:ChatDataset;initialView?:'chart'|'table'}) {
 const [view,setView]=useState(initialView),[expanded,setExpanded]=useState(false);
 const [sort,setSort]=useState<{key:string;descending:boolean}|null>(null);
 const rows=sort?[...dataset.rows].sort((a,b)=>{const x=a[sort.key],y=b[sort.key];const diff=typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y));return sort.descending?-diff:diff}):dataset.rows;
 const label=(key:string)=>dataset.columns.find(c=>c.key===key)?.label??key;
 const format=(value:string|number,key:string)=>{const f=dataset.columns.find(c=>c.key===key)?.format;return typeof value==='number'?(f==='money'?money(value):f==='percent'?`${value}%`:value):value};
 const tick=(v:number)=>dataset.unit==='money'?money(v):dataset.unit==='percent'?`${v}%`:String(v);
 const config=Object.fromEntries(dataset.series.map((s,i)=>[s,{label:label(s),color:colors[i%colors.length]}]));
 function content(large=false){return <>
  <div className="viz-toolbar"><div className="view-switch" aria-label={`${dataset.title} display`}><button aria-pressed={view==='chart'} onClick={()=>setView('chart')}><BarChart3 size={14}/>Chart</button><button aria-pressed={view==='table'} onClick={()=>setView('table')}><Table2 size={14}/>Table</button></div>{!large&&<button className="icon-button" aria-label={`Expand ${dataset.title}`} onClick={()=>setExpanded(true)}><Maximize2 size={15}/></button>}</div>
  {view==='table'?<div className="viz-table" tabIndex={0} role="region" aria-label={`${dataset.title} scrollable table`}><Table aria-label={dataset.title}><TableHeader><TableRow>{dataset.columns.map(c=><TableHead key={c.key} aria-sort={sort?.key===c.key?(sort.descending?'descending':'ascending'):'none'}><button onClick={()=>setSort({key:c.key,descending:sort?.key===c.key?!sort.descending:true})}>{c.label}<ArrowDownUp size={11}/></button></TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row,i)=><TableRow key={i}>{dataset.columns.map(c=><TableCell key={c.key}>{format(row[c.key],c.key)}</TableCell>)}</TableRow>)}</TableBody></Table></div>:
  <div className="viz-chart-scroll"><ChartContainer config={config} className="chat-chart" aria-label={`${dataset.title}. Use Table for exact values.`} role="img" style={{height:dataset.chart==='line'?280:Math.max(230,dataset.rows.length*44+55),minWidth:large?460:280}}>
   {dataset.chart==='line'?<LineChart data={dataset.rows} margin={{top:14,right:16,left:-15,bottom:8}} accessibilityLayer><CartesianGrid vertical={false} strokeDasharray="3 4"/><XAxis dataKey={dataset.category} tick={{fontSize:10}} tickFormatter={v=>String(v).slice(5)} tickLine={false}/><YAxis domain={[0,100]} tickFormatter={tick} tick={{fontSize:10}} tickLine={false} axisLine={false}/><Tooltip formatter={(v:number,n:string)=>[`${v}%`,label(n)]}/><Legend formatter={label} wrapperStyle={{fontSize:11}}/>{dataset.series.map((s,i)=><Line key={s} dataKey={s} type="linear" stroke={colors[i%colors.length]} strokeWidth={2.5} dot={{r:3}} isAnimationActive={false}/>)}</LineChart>:
   <BarChart data={dataset.rows} layout="vertical" margin={{top:5,right:20,left:0,bottom:8}} accessibilityLayer><CartesianGrid horizontal={false} strokeDasharray="3 4"/><XAxis type="number" domain={dataset.unit==='percent'?[0,100]:[0,'auto']} tickFormatter={tick} allowDecimals={dataset.unit!=='count'} tick={{fontSize:10}} tickLine={false} axisLine={false}/><YAxis type="category" dataKey={dataset.category} width={dataset.category==='name'?110:82} tick={{fontSize:10}} tickLine={false} axisLine={false}/><Tooltip formatter={(v:number,n:string)=>[format(v,n),label(n)]} cursor={{fill:'#f4f5f8'}}/><Legend formatter={label} wrapperStyle={{fontSize:11}}/>{dataset.series.map((s,i)=><Bar key={s} dataKey={s} fill={colors[i%colors.length]} radius={[0,4,4,0]} maxBarSize={15} isAnimationActive={false}/>)}</BarChart>}
  </ChartContainer></div>}
  <p className="viz-source">{dataset.source}</p>
 </>}
 return <div className="chat-visualization"><h3>{dataset.title}</h3>{content()}<Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="experimental-dialog visualization-dialog"><DialogHeader><DialogTitle>{dataset.title}</DialogTitle><DialogDescription>Explore the chart or sort the underlying data.</DialogDescription></DialogHeader>{content(true)}</DialogContent></Dialog></div>;
}
