import { deals, actions, stakeholders, getCompanyById } from '@/data/dealData';
import { seedSignals } from '@/data/signalsData';
import type { DetectedSignal } from '@/stores/signalsStore';
import { calendarEvents } from '@/data/calendarEvents';

export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
export function prototypeAnswer(input: string, dealId?: number, signalRecords: readonly Omit<DetectedSignal,'id'>[] = seedSignals): string {
  const named = deals.find(d => input.toLowerCase().includes(getCompanyById(d.companyId)!.name.toLowerCase()));
  const selected = named ?? deals.find(d => d.id === dealId);
  const scope = selected ? [selected] : deals;
  const ids = scope.map(d => d.id);
  if (/consensus/i.test(input)) return scope.map(d => `${getCompanyById(d.companyId)!.name} — Consensus ${d.consensus}% · Alignment ${d.alignment}%\n${d.summary.context}`).join('\n\n');
  if (/news|signal/i.test(input)) return `Recorded Loomik signals (prototype data):\n\n${signalRecords.filter(s=>s.status==='pending'&&ids.includes(s.dealId)).map(s=>`${s.dealName}: ${s.name}\n${s.evidence}`).join('\n\n') || 'No pending signals for this selection.'}`;
  if (/schedule|calendar|meeting/i.test(input)) {
    const events = calendarEvents.filter(e => scope.some(d => d.name === e.dealName));
    return `Schedule from the Loomik prototype:\n\n${events.slice(-5).map(e => `${e.date.toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})} · ${e.time}\n${e.company} — ${e.title} (${e.status})`).join('\n\n')}`;
  }
  if (/risk|concern|blocker/i.test(input)) {
    return `Risks to review${selected ? ` for ${getCompanyById(selected.companyId)!.name}` : ''}:\n\n${signalRecords.filter(s => s.status === 'pending' && s.type === 'risk' && ids.includes(s.dealId)).map(s => `${s.name} — ${s.trigger}\nNext step: ${s.suggestedAction}`).join('\n\n') || 'No risk records for this deal in the source prototype.'}`;
  }
  if (/stakeholder|buyer|champion/i.test(input)) {
    return stakeholders.filter(s => ids.includes(s.dealId)).map(s => `${s.name} · ${s.role}\nAlignment ${s.alignment}% · Sentiment ${s.sentiment}%\n${s.summary}`).join('\n\n');
  }
  if (/forecast|pipeline|value|revenue/i.test(input)) {
    const total = scope.reduce((n,d) => n+d.valueNumeric,0);
    const weighted = scope.reduce((n,d) => n+d.valueNumeric*d.winProbability/100,0);
    return `${scope.length} deals · ${money(total)} total pipeline\nProbability-weighted value: ${money(weighted)}. This is a calculation from the prototype's deal values and win probabilities, not a committed forecast.\n\n${scope.map(d => `${getCompanyById(d.companyId)!.name}: ${d.value} · ${d.winProbability}% win probability · closes ${d.closeDate}`).join('\n\n')}`;
  }
  if (/roi|return on investment/i.test(input)) return `The prototype does not contain investment costs or expected savings needed to calculate ROI.\n\n${scope.map(d => `${getCompanyById(d.companyId)!.name}: ${d.summary.action}`).join('\n\n')}`;
  if (/first|start|action|next|probability|priority/i.test(input)) {
    return `Recommended next steps from Loomik:\n\n${scope.map(d => `${getCompanyById(d.companyId)!.name}\n${d.summary.action}`).join('\n\n')}\n\n${actions.filter(a=>ids.includes(a.dealId)&&a.priority==='high').length} high-priority actions are recorded for this selection.`;
  }
  return scope.map(d => `${getCompanyById(d.companyId)!.name} — ${d.name}\n${d.summary.headline}\n\n${d.summary.text}\n${d.summary.context}`).join('\n\n');
}
