import { describe, it, expect } from 'vitest';
import { richAnswer } from '@/lib/richAnswers';
import { deals, stakeholders } from '@/data/dealData';
import { suggestCall, callScript, recordingFromEntries } from '@/lib/callSimulation';

describe('structured chat responses',()=>{
 it('uses exact deal values for a real table',()=>{
  const answer=richAnswer('Show all deals in a table',1);
  expect(answer.view).toBe('table');
  expect(answer.dataset.rows).toHaveLength(7);
  expect(answer.dataset.rows.reduce((n,r)=>n+Number(r.value),0)).toBe(8000000);
  expect(answer.dataset.rows[0].weighted).toBe(deals[0].valueNumeric*deals[0].winProbability/100);
 });
 it('compares multiple named companies instead of selecting only the first',()=>{
  expect(richAnswer('Compare Stripe and Salesforce in a graph').dataset.rows.map(r=>r.company)).toEqual(['Salesforce','Stripe']);
 });
 it('reuses the exact dataset for a follow-up chart request',()=>{
  const prior=richAnswer('Show Stripe stakeholders in a table').dataset;
  const answer=richAnswer('Graph that',undefined,prior);
  expect(answer.dataset).toBe(prior);expect(answer.view).toBe('chart');
 });
 it('charts actual dated stakeholder observations without synthesized points',()=>{
  const answer=richAnswer('Graph Michael Chen trends',1);
  expect(answer.dataset.chart).toBe('line');
  expect(answer.dataset.rows).toEqual(stakeholders[0].trends);
 });
 it('does not manufacture historical pipeline or ROI data',()=>{
  expect(richAnswer('Graph pipeline over time').dataset).toBeUndefined();
  expect(richAnswer('Show ROI table').dataset).toBeUndefined();
 });
 it('suggests a call scoped to the selected deal',()=>{
  const call=richAnswer('Suggest a call',2).call;
  expect(call.deal.id).toBe(2);expect(call.person.dealId).toBe(2);
 });
});
describe('simulation review integrity',()=>{
 const plan=suggestCall(1);const script=callScript(plan);
 it('has no summary claims or commitments before the relevant turns play',()=>{
  const early=recordingFromEntries(plan,script.slice(0,3));
  expect(early.summary.nextSteps).toEqual([]);
  expect(early.summary.riskFlags).toEqual([]);
  expect(early.moments.map(m=>m.id)).toEqual([2]);
 });
 it('creates a complete review and follow-ups from the completed script',()=>{
  const result=recordingFromEntries(plan,script);
  expect(result.transcript).toHaveLength(8);
  expect(result.summary.nextSteps).toHaveLength(3);
  expect(result.summary.nextSteps[0]).toContain(plan.person.name);
  expect(result.moments).toHaveLength(4);
 });
 it('does not modify the source metrics or stakeholder history',()=>{
  const before=JSON.stringify({deals,stakeholders});
  recordingFromEntries(plan,script);
  expect(JSON.stringify({deals,stakeholders})).toBe(before);
 });
});

describe('current signal state',()=>{
 it('uses supplied pending records rather than stale seed counts',()=>{
  const answer=richAnswer('Show risks in a table',1,undefined,[]);
  expect(answer.dataset.rows[0].risks).toBe(0);
  expect(answer.dataset.rows[0].signals).toBe(0);
  expect(richAnswer('What are the risks?',1,undefined,[]).text).toContain('No risk records');
 });
});
