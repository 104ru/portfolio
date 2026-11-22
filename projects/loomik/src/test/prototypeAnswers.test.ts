import { describe, it, expect } from 'vitest';
import { prototypeAnswer } from '@/lib/prototypeAnswers';

describe('prototype data context', () => {
 it('calculates the source pipeline and weighted value', () => {
  const answer = prototypeAnswer('pipeline forecast');
  expect(answer).toContain('$8M');
  expect(answer).toContain('$5.2M');
  expect(answer).toContain('7 deals');
  expect(answer).not.toContain('CloudScale');
 });
 it('scopes risks to the selected deal', () => {
  const answer = prototypeAnswer('risks', 1);
  expect(answer).toContain('Budget Concern');
  expect(answer).not.toContain('Timeline Delay');
 });
 it('switches context when a company is explicitly named', () => {
  const answer = prototypeAnswer('Stripe stakeholders', 1);
  expect(answer).toContain('Patricia Wong');
  expect(answer).not.toContain('Sarah Williams');
 });
 it('does not invent ROI when inputs are missing', () => {
  expect(prototypeAnswer('Calculate ROI',1)).toContain('does not contain investment costs');
 });
});
