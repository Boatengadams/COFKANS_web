import { useMemo } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, ThumbsUp, Sparkles, Lightbulb } from 'lucide-react';
import { useSupportStore } from '@/stores/support-store';
import { GlassCard, SectionTitle, StatusPill, EmptyState } from '../primitives';
import type { ThreatSeverity } from '@/lib/support/types';

const severityTint: Record<ThreatSeverity, string> = {
  low:      'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
  medium:   'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  high:     'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  critical: 'bg-rose-600/15 text-rose-700 dark:text-rose-300 border-rose-600/30',
};

export function AISecurityOverview() {
  const threats = useSupportStore(s => s.threats);
  const sessions = useSupportStore(s => s.sessions);

  const counts = useMemo(() => {
    const c = { low: 0, medium: 0, high: 0, critical: 0, blocked: 0 };
    for (const t of threats) { c[t.severity]++; if (t.blocked) c.blocked++; }
    return c;
  }, [threats]);

  const avgRisk = threats.length ? Math.round(threats.reduce((s, t) => s + t.riskScore, 0) / threats.length) : 0;
  const aiResolved = sessions.filter(s => s.status === 'resolved' && !s.assignedAgentId).length;
  const total = sessions.length || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label="Total threats" value={threats.length} icon={ShieldAlert} accent="rose" />
        <Tile label="Blocked" value={counts.blocked} icon={ShieldCheck} accent="emerald" />
        <Tile label="Avg risk score" value={avgRisk} icon={AlertTriangle} accent="amber" />
        <Tile label="AI deflection" value={`${Math.round((aiResolved / total) * 100)}%`} icon={Sparkles} accent="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle title="Threat log" subtitle="Most recent suspicious inputs" />
          {threats.length === 0 ? (
            <EmptyState icon={ShieldCheck} title="No threats detected" body="The AI guard hasn't flagged anything yet. Patterns include prompt-injection, jailbreaks, SQL, and script attempts." />
          ) : (
            <div className="space-y-2 max-h-[480px] overflow-y-auto">
              {threats.slice(0, 80).map(t => (
                <div key={t.id} className="p-3 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${severityTint[t.severity]}`}>{t.severity}</span>
                      <span className="text-xs font-semibold">{t.reason}</span>
                      {t.blocked && <StatusPill status="error">blocked</StatusPill>}
                    </div>
                    <div className="text-[11px] text-muted-foreground">risk {t.riskScore} · {new Date(t.at).toLocaleTimeString()}</div>
                  </div>
                  <div className="text-xs text-foreground/80 font-mono bg-card/60 rounded-lg p-2 line-clamp-2">{t.input}</div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle title="Severity mix" />
          <div className="space-y-3">
            {(['critical', 'high', 'medium', 'low'] as ThreatSeverity[]).map(s => {
              const v = counts[s];
              const pct = threats.length ? (v / threats.length) * 100 : 0;
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="capitalize">{s}</span>
                    <span className="tabular-nums">{v}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${s === 'critical' ? 'bg-rose-600' : s === 'high' ? 'bg-rose-500' : s === 'medium' ? 'bg-amber-500' : 'bg-sky-500'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function Tile({ label, value, icon: Icon, accent }: { label: string; value: number | string; icon: any; accent: string }) {
  const tint: Record<string, string> = {
    rose: 'text-rose-500', emerald: 'text-emerald-500', amber: 'text-amber-500', violet: 'text-violet-500',
  };
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <Icon className={`w-4 h-4 ${tint[accent] ?? ''}`} strokeWidth={2.5} />
      </div>
      <div className="text-4xl font-black tracking-tight tabular-nums mt-3 leading-none">{value}</div>
    </div>
  );
}

export function AIFeedbackHub() {
  const sessions = useSupportStore(s => s.sessions);
  const suggestions = useSupportStore(s => s.suggestions);
  const vote = useSupportStore(s => s.voteSuggestion);

  const rated = sessions.filter(s => s.satisfaction);
  const avgSat = rated.length ? (rated.reduce((s, x) => s + (x.satisfaction ?? 0), 0) / rated.length) : 0;
  const escalated = sessions.filter(s => s.assignedAgentId).length;
  const total = sessions.length || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label="Satisfaction" value={avgSat ? avgSat.toFixed(1) : '—'} icon={ThumbsUp} accent="emerald" />
        <Tile label="Rated sessions" value={rated.length} icon={Sparkles} accent="violet" />
        <Tile label="Escalation rate" value={`${Math.round((escalated / total) * 100)}%`} icon={AlertTriangle} accent="amber" />
        <Tile label="Suggestions" value={suggestions.length} icon={Lightbulb} accent="rose" />
      </div>

      <GlassCard className="p-5">
        <SectionTitle title="Customer suggestions" subtitle="Feature & service requests" />
        {suggestions.length === 0 ? (
          <EmptyState icon={Lightbulb} title="No suggestions yet" body="Customers can suggest features from inside the support chat." />
        ) : (
          <div className="space-y-2">
            {suggestions.map(sg => (
              <div key={sg.id} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30">
                <button onClick={() => vote(sg.id)} className="flex flex-col items-center gap-0.5 w-10 py-1 rounded-lg hover:bg-muted">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tabular-nums">{sg.votes}</span>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{sg.text}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{sg.customerName} · {new Date(sg.at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
