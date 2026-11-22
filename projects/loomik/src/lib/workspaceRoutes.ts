import { deals, getStakeholderById } from '@/data/dealData';
/** Resolve legacy links into the experimental workspace; never render a legacy shell. */
export function workspaceDestination(path:string, search=''):string {
 const params=new URLSearchParams(search);
 const person=getStakeholderById(Number(params.get('stakeholder')));
 const id=person?.dealId??Number(params.get('deal'));
 const base=deals.some(d=>d.id===id)?`/deal/${id}`:'/';
 if(path==='/calendar')return `${base}?view=calendar`;
 if(path==='/assets')return `${base}?view=assets`;
 if(path==='/action-hub')return `${base}?panel=moves`;
 return base;
}
