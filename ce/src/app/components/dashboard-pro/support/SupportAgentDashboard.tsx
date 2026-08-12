import { useMemo, useState } from 'react';
import { Headphones, Users, Clock, Star, CheckCircle2, Send, Inbox } from 'lucide-react';
import { useSupportStore } from '@/stores/support-store';
import { GlassCard, SectionTitle, StatusPill, EmptyState } from '../primitives';
import { statusLabel } from '@/lib/support/business-hours';
import type { AgentStatus } from '@/lib/support/types';

// We map the demo support_agent role to the first agent (Ama).
const SELF_ID = 'agent-ama';

export function SupportAgentOverview() {
  const agents = useSupportStore(s => s.agents);
  const sessions = useSupportStore(s => s.sessions);
  const setStatus = useSupportStore(s => s.setAgentStatus);
  const self = agents.find(a => a.id === SELF_ID)!;
  const status = statusLabel();

  const queued = sessions.filter(s => s.status === 'queued');
  const live = sessions.filter(s => s.status === 'live');
  const resolvedToday = sessions.filter(s => s.status === 'resolved' && s.resolvedAt && Date.now() - s.resolvedAt < 24 * 3600_000);

  return (
    <div className="space-y-6">
      {/* Self status hero */}
      <GlassCard glow className="p-6 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4">
          <img src={self.avatar} alt="" className="w-14 h-14 rounded-2xl bg-muted" />
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Support · {status.label}</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{self.name}</h1>
            <div className="text-sm text-muted-foreground mt-0.5">{self.phone}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(['online', 'busy', 'away', 'offline'] as AgentStatus[]).map(s => (
            <button
              key={s}
              onClick={() => setStatus(SELF_ID, s)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                self.status === s ? 'bg-foreground text-background border-foreground' : 'border-border hover:bg-muted'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${s === 'online' ? 'bg-emerald-500' : s === 'busy' ? 'bg-rose-500' : s === 'away' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
              {s}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="In queue" value={queued.length} icon={Inbox} />
        <StatTile label="Active chats" value={live.length} icon={Headphones} />
        <StatTile label="Resolved today" value={resolvedToday.length} icon={CheckCircle2} />
        <StatTile label="Your rating" value={self.rating.toFixed(1)} icon={Star} />
      </div>

      {/* Team */}
      <GlassCard className="p-5">
        <SectionTitle title="Team availability" subtitle="3 support agents" />
        <div className="grid sm:grid-cols-3 gap-3">
          {agents.map(a => (
            <div key={a.id} className="p-3 rounded-xl border border-border bg-muted/30 flex items-center gap-3">
              <div className="relative">
                <img src={a.avatar} alt="" className="w-10 h-10 rounded-xl" />
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${a.status === 'online' ? 'bg-emerald-500' : a.status === 'busy' ? 'bg-rose-500' : a.status === 'away' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{a.name}</div>
                <div className="text-[11px] text-muted-foreground">{a.phone}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold tabular-nums">{a.resolvedToday}</div>
                <div className="text-[10px] text-muted-foreground">today</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function StatTile({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="rounded-2xl border border-border bg-card/40 p-5">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
      </div>
      <div className="text-4xl font-black tracking-tight tabular-nums mt-3 leading-none">{value}</div>
    </div>
  );
}

export function SupportAgentQueue() {
  const sessions = useSupportStore(s => s.sessions);
  const agentSend = useSupportStore(s => s.agentSend);
  const close = useSupportStore(s => s.closeSession);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const queueAndLive = useMemo(
    () => sessions.filter(s => s.status === 'queued' || s.status === 'live' || s.status === 'ai').sort((a, b) => b.startedAt - a.startedAt),
    [sessions],
  );
  const active = sessions.find(s => s.id === selected) ?? queueAndLive[0] ?? null;

  if (queueAndLive.length === 0) {
    return (
      <GlassCard className="p-6">
        <SectionTitle title="Queue" subtitle="Live chats and waiting customers" />
        <EmptyState icon={Inbox} title="Inbox is empty" body="When customers escalate from the AI assistant, they'll appear here." />
      </GlassCard>
    );
  }

  const send = () => {
    if (!active || !draft.trim()) return;
    agentSend(active.id, SELF_ID, draft.trim());
    setDraft('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-280px)] min-h-[480px]">
      {/* Queue list */}
      <GlassCard className="lg:col-span-1 p-0 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <SectionTitle title="Queue" subtitle={`${queueAndLive.length} conversation${queueAndLive.length === 1 ? '' : 's'}`} />
        </div>
        <div className="flex-1 overflow-y-auto">
          {queueAndLive.map(s => {
            const last = s.messages[s.messages.length - 1];
            const isActive = (active?.id ?? '') === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                className={`w-full text-left px-4 py-3 border-b border-border hover:bg-muted/60 ${isActive ? 'bg-muted' : ''}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-sm truncate">{s.customerName}</span>
                  <StatusPill status={s.status === 'live' ? 'success' : s.status === 'queued' ? 'warn' : 'info'}>{s.status}</StatusPill>
                </div>
                <div className="text-xs text-muted-foreground truncate">{last?.text}</div>
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Conversation */}
      <GlassCard className="lg:col-span-2 p-0 flex flex-col overflow-hidden">
        {active ? (
          <>
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <div>
                <div className="font-bold">{active.customerName}</div>
                <div className="text-xs text-muted-foreground">{active.customerEmail ?? 'guest'} · session #{active.id}</div>
              </div>
              <button onClick={() => close(active.id)} className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-sm">
              {active.messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? '' : 'justify-end'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${m.role === 'user' ? 'bg-muted text-foreground rounded-bl-md' : m.role === 'agent' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 rounded-br-md' : m.role === 'ai' ? 'bg-amber-500/10 text-foreground rounded-br-md' : 'bg-transparent text-[11px] text-muted-foreground text-center mx-auto'}`}>
                    {m.role !== 'system' && m.authorName && <div className="text-[10px] font-bold opacity-70 mb-0.5">{m.authorName}</div>}
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') send(); }}
                placeholder="Reply to customer…"
                className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button onClick={send} className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center hover:opacity-90">
                <Send className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </>
        ) : (
          <EmptyState icon={Headphones} title="Pick a conversation" body="Choose a session from the queue on the left." />
        )}
      </GlassCard>
    </div>
  );
}

export function SupportAgentHistory() {
  const sessions = useSupportStore(s => s.sessions.filter(s => s.status === 'resolved'));
  if (sessions.length === 0) {
    return (
      <GlassCard className="p-6">
        <SectionTitle title="History" subtitle="Resolved sessions" />
        <EmptyState icon={Clock} title="Nothing resolved yet" body="Wrap up a conversation and it'll show up here." />
      </GlassCard>
    );
  }
  return (
    <GlassCard className="p-5">
      <SectionTitle title="History" subtitle={`${sessions.length} resolved`} />
      <div className="divide-y divide-border">
        {sessions.map(s => (
          <div key={s.id} className="py-3 flex items-center gap-4">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{s.customerName}</div>
              <div className="text-xs text-muted-foreground truncate">{s.messages.length} messages · {s.assignedAgentName ?? 'AI only'}</div>
            </div>
            {s.satisfaction && (
              <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                <Star className="w-3.5 h-3.5 fill-current" /> {s.satisfaction}
              </div>
            )}
            <div className="text-xs text-muted-foreground">{new Date(s.resolvedAt ?? s.startedAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
