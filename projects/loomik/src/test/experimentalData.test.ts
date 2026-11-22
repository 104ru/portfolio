import { describe, expect, it } from 'vitest';
import { actions, companies, deals, stakeholders, getActionsForDeal, getActionsForStakeholder } from '@/data/dealData';
import { timelineEvents } from '@/data/historyData';

describe('experimental company coverage',()=>{
 it('gives every company an identity, people, activity and actionable moves',()=>{
  for(const deal of deals){
   expect(companies.find(c=>c.id===deal.companyId)?.logo).toBeTruthy();
   expect(stakeholders.filter(p=>p.dealId===deal.id).every(p=>!!p.avatar)).toBe(true);
   expect(getActionsForDeal(deal.id).length).toBeGreaterThan(0);
   expect(timelineEvents.some(e=>e.dealId===deal.id)).toBe(true);
  }
 });
 it('keeps move IDs unique and recipients within the correct deal',()=>{
  expect(new Set(actions.map(a=>a.id)).size).toBe(actions.length);
  for(const a of actions)for(const id of a.stakeholderIds){expect(stakeholders.find(p=>p.id===id)?.dealId).toBe(a.dealId)}
 });
 it('links the nine new draft follow-ups to source stakeholders without inventing booked dates',()=>{
  const added=actions.filter(a=>a.id>=101&&a.id<=109);
  expect(added).toHaveLength(9);
  for(const a of added){expect(a.deadline).toBe('To schedule');for(const id of a.stakeholderIds){expect(getActionsForStakeholder(id)).toContain(a);expect(stakeholders.find(p=>p.id===id)?.relatedActionIds).toContain(a.id)}}
 });
});
