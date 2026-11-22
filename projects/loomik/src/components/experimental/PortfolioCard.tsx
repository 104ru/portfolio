import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { type Deal, getCompanyById, getStakeholdersForDeal, stageConfig } from '@/data/dealData';
import { money } from '@/lib/prototypeAnswers';
export function PortfolioCard({deal,onSelect}:{deal:Deal;onSelect:()=>void}) {
 const company=getCompanyById(deal.companyId)!;
 const people=getStakeholdersForDeal(deal.id);
 return <button className={`portfolio-deal ${deal.hasRisk?'needs-attention':''}`} onClick={onSelect} aria-label={`Open ${company.name} deal`}>
  <div className="portfolio-deal-top"><span className="company-logo"><img src={company.logo} alt={company.name}/></span><div><strong>{company.name}</strong><span>{stageConfig[deal.stage].label}</span></div><ArrowUpRight size={16}/></div>
  <h3>{deal.name}</h3>
  <div className="deal-value-row"><strong>{money(deal.valueNumeric)}</strong><div className="mini-win" style={{'--score':`${deal.winProbability}%`} as CSSProperties}><span>{deal.winProbability}%</span></div><small>win<br/>probability</small></div>
  <p className="deal-signal"><i/>{deal.summary.headline}</p>
  <div className="portfolio-deal-bottom"><div className="avatar-stack">{people.slice(0,4).map(s=><Avatar key={s.id}><AvatarImage src={s.avatar} alt={s.name}/><AvatarFallback>{s.name[0]}</AvatarFallback></Avatar>)}{people.length>4&&<span>+{people.length-4}</span>}</div><span><b>{deal.consensus}%</b> consensus</span><span className="deal-close">{new Date(deal.closeDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></div>
 </button>
}
