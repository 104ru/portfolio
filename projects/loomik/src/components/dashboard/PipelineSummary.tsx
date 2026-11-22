import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { deals, stageConfig, getCompanyById } from '@/data/dealData';
const money=(v:number)=>v>=1000000?`$${(v/1000000).toFixed(1).replace('.0','')}M`:`$${Math.round(v/1000)}K`;
const total = deals.reduce((sum, deal) => sum + deal.valueNumeric, 0);
const best = deals.reduce((a, b) => a.valueNumeric > b.valueNumeric ? a : b);
export default function PipelineSummary() {
  return <section className="mb-6 space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm text-muted-foreground">Pipeline value</p><div className="flex items-baseline gap-3"><span className="text-5xl font-bold tracking-tight">{money(total)}</span><span className="text-sm text-muted-foreground">{deals.length} open deals</span></div></div>
      <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
        <div className="rounded-lg bg-[hsl(var(--primary-subtle))] p-4 sm:min-w-[140px]"><p className="text-xs">Win rate</p><div className="flex items-baseline gap-2"><b className="text-2xl">63%</b><span className="text-xs font-semibold">↓3%</span></div></div>
        <div className="rounded-lg bg-card border border-border p-4 sm:min-w-[140px]"><p className="text-xs text-muted-foreground">Alignment</p><div className="flex items-baseline gap-2"><b className="text-2xl">72%</b><span className="text-xs font-semibold text-green">↑5%</span></div></div>
        <Link to={`/deal-gps?deal=${best.id}`} className="rounded-lg bg-foreground text-background p-4 sm:min-w-[160px]"><p className="flex items-center justify-between text-xs opacity-70">Best deal<ArrowUpRight size={14}/></p><p className="text-2xl font-bold">{money(best.valueNumeric)}</p><p className="text-xs opacity-70">{getCompanyById(best.companyId)?.name}</p></Link>
      </div>
    </div>
    <div className="flex gap-2 overflow-x-auto sm:flex-wrap">{Object.entries(stageConfig).map(([stage, config]) => {const value=deals.filter(d=>d.stage===stage).reduce((sum,d)=>sum+d.valueNumeric,0);return <div key={stage} className="flex shrink-0 sm:flex-1 sm:min-w-[140px] items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 text-sm"><span className={`w-2 h-2 rounded-full ${config.dotColor}`}/><span className="text-muted-foreground">{config.label}</span><span className="ml-auto font-semibold">{value?money(value):'—'}</span>{value>0&&<span className="text-xs text-muted-foreground">{Math.round(value/total*100)}%</span>}</div>})}</div>
  </section>;
}
