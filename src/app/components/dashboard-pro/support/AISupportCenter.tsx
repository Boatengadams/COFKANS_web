import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, BookOpen, Brain, Cpu, Download, FlaskConical, Gauge, MessageSquare,
  Plus, Search, ShieldAlert, Sparkles, ThumbsUp, TrendingUp, Users,
  CheckCircle2, XCircle, Clock, AlertTriangle, ChevronRight, Play, Trash2,
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useSupportStore } from '@/stores/support-store';
import { GlassCard } from '../primitives';
import { CATEGORY_LABEL, TRAINING_SUITE, runTrainingSuite } from '@/lib/support/training';
import type { KbKind, KbSubmission, TestCategory } from '@/lib/support/types';
import toast from 'react-hot-toast';

type CenterTab = 'overview' | 'analytics' | 'knowledge' | 'training' | 'routing' | 'security';

export function AISupportCenter({ currentUserId = 'admin' }: { currentUserId?: string }) {
  const [tab, setTab] = useState<CenterTab>('overview');

  const tabs: { id: CenterTab; label: string; icon: typeof Activity }[] = [
    { id: 'overview', label: 'Overview', icon: Gauge },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'training', label: 'Training Lab', icon: FlaskConical },
    { id: 'routing', label: 'Smart Routing', icon: Cpu },
    { id: 'security', label: 'Security', icon: ShieldAlert },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-secondary/10 to-primary/5 border border-border p-6 md:p-8">
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
            <Brain className="w-7 h-7" strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">AI Operations</div>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight">AI Support Center</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Unified command centre for customer-AI interactions, knowledge curation, adversarial testing and live agent routing.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-muted/60 rounded-2xl overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                active ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.2} />
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          {tab === 'overview' && <Overview />}
          {tab === 'analytics' && <Analytics />}
          {tab === 'knowledge' && <KnowledgeBase currentUserId={currentUserId} />}
          {tab === 'training' && <TrainingLab />}
          {tab === 'routing' && <SmartRouting />}
          {tab === 'security' && <SecurityPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============ OVERVIEW ============

function Overview() {
  const sessions = useSupportStore(s => s.sessions);
  const threats = useSupportStore(s => s.threats);
  const kb = useSupportStore(s => s.kb);
  const runs = useSupportStore(s => s.trainingRuns);

  const totals = useMemo(() => {
    const resolved = sessions.filter(s => s.status === 'resolved').length;
    const aiOnly = sessions.filter(s => s.status === 'resolved' && !s.assignedAgentId).length;
    const escalated = sessions.filter(s => s.assignedAgentId).length;
    const ratings = sessions.filter(s => s.satisfaction).map(s => s.satisfaction!);
    const csat = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
    const lastRun = runs[0];
    const accuracy = lastRun ? Math.round((lastRun.passed / (lastRun.passed + lastRun.failed)) * 100) : null;
    return {
      total: sessions.length,
      resolved,
      deflection: sessions.length ? Math.round((aiOnly / sessions.length) * 100) : 0,
      escalated,
      csat,
      blocked: threats.filter(t => t.blocked).length,
      kbApproved: kb.filter(k => k.status === 'approved').length,
      kbPending: kb.filter(k => k.status === 'pending').length,
      accuracy,
    };
  }, [sessions, threats, kb, runs]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={MessageSquare} label="Total conversations" value={totals.total.toString()} sub={`${totals.resolved} resolved`} accent="primary" />
        <MetricCard icon={Sparkles} label="AI deflection" value={`${totals.deflection}%`} sub={`${totals.escalated} escalated`} accent="emerald" />
        <MetricCard icon={ThumbsUp} label="CSAT" value={`${totals.csat}`} sub="avg out of 5" accent="amber" />
        <MetricCard icon={ShieldAlert} label="Threats blocked" value={totals.blocked.toString()} sub="auto-mitigated" accent="rose" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={BookOpen} label="KB approved" value={totals.kbApproved.toString()} sub={`${totals.kbPending} pending`} />
        <MetricCard icon={FlaskConical} label="AI accuracy" value={totals.accuracy != null ? `${totals.accuracy}%` : '—'} sub="last training run" />
        <MetricCard icon={Users} label="Active sessions" value={sessions.filter(s => s.status !== 'resolved').length.toString()} sub="live or queued" />
        <MetricCard icon={Activity} label="Training runs" value={runs.length.toString()} sub="historical" />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, sub, accent = 'default',
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; value: string; sub?: string;
  accent?: 'default' | 'primary' | 'emerald' | 'amber' | 'rose';
}) {
  const tints: Record<string, string> = {
    default: 'bg-muted text-foreground',
    primary: 'bg-primary/15 text-primary',
    emerald: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  };
  return (
    <div className="p-5 rounded-2xl border border-border bg-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tints[accent]}`}>
        <Icon className="w-5 h-5" strokeWidth={2.4} />
      </div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tracking-tight mt-0.5">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

// ============ ANALYTICS ============

function Analytics() {
  const sessions = useSupportStore(s => s.sessions);
  const threats = useSupportStore(s => s.threats);

  const hourly = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: `${h}:00`, count: 0 }));
    for (const s of sessions) {
      const h = new Date(s.startedAt).getHours();
      buckets[h].count++;
    }
    return buckets;
  }, [sessions]);

  const daily = useMemo(() => {
    const map = new Map<string, { day: string; total: number; ai: number; escalated: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-GB', { weekday: 'short' });
      map.set(key, { day: key, total: 0, ai: 0, escalated: 0 });
    }
    for (const s of sessions) {
      const key = new Date(s.startedAt).toLocaleDateString('en-GB', { weekday: 'short' });
      const b = map.get(key);
      if (!b) continue;
      b.total++;
      if (s.assignedAgentId) b.escalated++; else b.ai++;
    }
    return Array.from(map.values());
  }, [sessions]);

  const csatRatings = sessions.filter(s => s.satisfaction);
  const csatBreakdown = useMemo(() => {
    const buckets = [1, 2, 3, 4, 5].map(r => ({ rating: `${r}★`, count: csatRatings.filter(s => s.satisfaction === r).length }));
    return buckets;
  }, [csatRatings]);

  const topIssues = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of sessions) {
      const first = s.messages.find(m => m.role === 'user');
      if (!first) continue;
      const key = first.text.split(/[?.,!]/)[0].slice(0, 40).toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, v]) => ({ topic: k, count: v }));
  }, [sessions]);

  const handleExport = () => {
    const csv = [
      ['Metric', 'Value'],
      ['Total conversations', sessions.length],
      ['Resolved', sessions.filter(s => s.status === 'resolved').length],
      ['Escalated', sessions.filter(s => s.assignedAgentId).length],
      ['Threats blocked', threats.filter(t => t.blocked).length],
      ['Average CSAT', csatRatings.length ? (csatRatings.reduce((a, b) => a + (b.satisfaction ?? 0), 0) / csatRatings.length).toFixed(2) : '—'],
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `support-report-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-lg">Conversation analytics</h2>
          <p className="text-sm text-muted-foreground">Volume, satisfaction, peak hours and recurring issues.</p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold">7-day volume</h3>
              <p className="text-xs text-muted-foreground">AI vs human-escalated</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="ai-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="esc-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Area type="monotone" dataKey="ai" stroke="hsl(var(--primary))" fill="url(#ai-grad)" strokeWidth={2} />
                <Area type="monotone" dataKey="escalated" stroke="hsl(var(--secondary))" fill="url(#esc-grad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4">
            <h3 className="font-bold">Peak support hours</h3>
            <p className="text-xs text-muted-foreground">Conversations by hour of day</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={2} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4">
            <h3 className="font-bold">CSAT breakdown</h3>
            <p className="text-xs text-muted-foreground">{csatRatings.length} rated sessions</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={csatBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="rating" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={40} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="mb-4">
            <h3 className="font-bold">Top issues</h3>
            <p className="text-xs text-muted-foreground">Most common first-message topics</p>
          </div>
          {topIssues.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-10">No sessions yet.</div>
          ) : (
            <div className="space-y-2">
              {topIssues.map((t, i) => (
                <div key={t.topic} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/40">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <div className="flex-1 text-sm truncate">{t.topic}</div>
                  <div className="text-sm font-bold tabular-nums">{t.count}</div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

// ============ KNOWLEDGE BASE ============

function KnowledgeBase({ currentUserId }: { currentUserId: string }) {
  const kb = useSupportStore(s => s.kb);
  const submitKb = useSupportStore(s => s.submitKb);
  const reviewKb = useSupportStore(s => s.reviewKb);
  const deleteKb = useSupportStore(s => s.deleteKb);

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kb.filter(k =>
      (filter === 'all' || k.status === filter) &&
      (!q || k.question.toLowerCase().includes(q) || k.answer.toLowerCase().includes(q)),
    );
  }, [kb, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="font-bold text-lg">Knowledge contributions</h2>
          <p className="text-sm text-muted-foreground">Support agents submit improvements; admins approve before the AI uses them.</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Submit entry'}
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <KbForm
              onSubmit={(input) => {
                submitKb({ ...input, submittedBy: currentUserId, submittedByName: 'Current user' });
                setShowForm(false);
                toast.success('Submitted for review');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search submissions…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-muted rounded-xl">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-card shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
              <span className="ml-1.5 text-muted-foreground">
                {f === 'all' ? kb.length : kb.filter(k => k.status === f).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
          No entries yet. Submit the first one to start growing the knowledge base.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(k => (
            <KbCard key={k.id} entry={k} onReview={(s) => reviewKb(k.id, s, currentUserId)} onDelete={() => deleteKb(k.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function KbCard({ entry, onReview, onDelete }: { entry: KbSubmission; onReview: (s: 'approved' | 'rejected') => void; onDelete: () => void }) {
  const kindLabel: Record<KbKind, { label: string; tint: string }> = {
    faq: { label: 'FAQ', tint: 'bg-primary/10 text-primary' },
    response: { label: 'Response', tint: 'bg-secondary/10 text-secondary' },
    troubleshoot: { label: 'Troubleshoot', tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    workflow: { label: 'Workflow', tint: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  };
  const k = kindLabel[entry.kind];
  const statusTint: Record<typeof entry.status, string> = {
    pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    approved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    rejected: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl border border-border bg-card"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${k.tint}`}>{k.label}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusTint[entry.status]}`}>{entry.status}</span>
            {entry.tags.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted text-muted-foreground">#{t}</span>
            ))}
          </div>
          <div className="font-bold text-sm mb-1">{entry.question}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{entry.answer}</div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
            <span>By {entry.submittedByName}</span>
            <span>·</span>
            <span>{new Date(entry.submittedAt).toLocaleDateString()}</span>
            {entry.status === 'approved' && (
              <>
                <span>·</span>
                <span>{entry.uses} uses</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {entry.status === 'pending' && (
            <>
              <button
                onClick={() => onReview('approved')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 hover:bg-emerald-500/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => onReview('rejected')}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 hover:bg-rose-500/20"
              >
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
          <button onClick={onDelete} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-rose-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function KbForm({ onSubmit }: { onSubmit: (input: { kind: KbKind; question: string; answer: string; tags: string[] }) => void }) {
  const [kind, setKind] = useState<KbKind>('faq');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [tags, setTags] = useState('');

  const submit = () => {
    if (!question.trim() || !answer.trim()) return toast.error('Question and answer required');
    onSubmit({
      kind, question: question.trim(), answer: answer.trim(),
      tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    });
    setQuestion(''); setAnswer(''); setTags('');
  };

  return (
    <div className="p-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5">
      <div className="grid gap-3">
        <div className="grid sm:grid-cols-[160px_1fr] gap-3">
          <select
            value={kind}
            onChange={e => setKind(e.target.value as KbKind)}
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold"
          >
            <option value="faq">FAQ</option>
            <option value="response">Better response</option>
            <option value="troubleshoot">Troubleshooting</option>
            <option value="workflow">Workflow</option>
          </select>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Customer question or scenario…"
            className="px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          rows={3}
          placeholder="Ideal AI response or step-by-step procedure…"
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex gap-3 flex-wrap">
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags, comma separated (e.g. solar, install)"
            className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button onClick={submit} className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90">
            Submit for review
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ TRAINING LAB ============

function TrainingLab() {
  const runs = useSupportStore(s => s.trainingRuns);
  const recordRun = useSupportStore(s => s.recordTrainingRun);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: TRAINING_SUITE.length });
  const latest = runs[0];

  const handleRun = async () => {
    setRunning(true);
    setProgress({ done: 0, total: TRAINING_SUITE.length });
    try {
      const run = await runTrainingSuite((done, total) => setProgress({ done, total }));
      recordRun(run);
      toast.success(`Run complete: ${run.passed}/${run.passed + run.failed} passed`);
    } catch {
      toast.error('Training run failed');
    } finally {
      setRunning(false);
    }
  };

  const categoryBreakdown = useMemo(() => {
    if (!latest) return [];
    const byCat = new Map<TestCategory, { passed: number; failed: number }>();
    for (const r of latest.results) {
      const cur = byCat.get(r.category) ?? { passed: 0, failed: 0 };
      if (r.passed) cur.passed++; else cur.failed++;
      byCat.set(r.category, cur);
    }
    return Array.from(byCat.entries()).map(([cat, v]) => ({
      cat, ...v, total: v.passed + v.failed,
      pct: Math.round((v.passed / (v.passed + v.failed)) * 100),
    }));
  }, [latest]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-lg">Adversarial training lab</h2>
          <p className="text-sm text-muted-foreground">Run the test suite to surface AI weaknesses and security gaps.</p>
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-60"
        >
          {running ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Running… {progress.done}/{progress.total}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" fill="currentColor" /> Run {TRAINING_SUITE.length}-test suite
            </>
          )}
        </button>
      </div>

      {latest ? (
        <>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Latest run</div>
                <div className="font-bold text-2xl">
                  {Math.round((latest.passed / (latest.passed + latest.failed)) * 100)}% accuracy
                </div>
                <div className="text-xs text-muted-foreground">
                  {latest.passed} passed · {latest.failed} failed · {new Date(latest.at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge ok={latest.failed === 0} okLabel="All passing" failLabel={`${latest.failed} regressions`} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {categoryBreakdown.map(c => (
                <div key={c.cat} className="p-3 rounded-xl border border-border bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold">{CATEGORY_LABEL[c.cat]}</span>
                    <span className={`text-xs font-bold ${c.pct === 100 ? 'text-emerald-600' : c.pct >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {c.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${c.pct === 100 ? 'bg-emerald-500' : c.pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">{c.passed}/{c.total} passed</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <div>
            <h3 className="font-bold text-sm mb-2">Test results</h3>
            <div className="space-y-1.5">
              {latest.results.map(r => {
                const test = TRAINING_SUITE.find(t => t.id === r.testId);
                return (
                  <div key={r.testId} className={`p-3 rounded-xl border ${r.passed ? 'border-border bg-card' : 'border-rose-500/30 bg-rose-500/5'}`}>
                    <div className="flex items-start gap-3">
                      {r.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.4} />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" strokeWidth={2.4} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{CATEGORY_LABEL[r.category]}</span>
                          <span className="text-[10px] text-muted-foreground">expect: {test?.expect}</span>
                        </div>
                        <div className="text-sm font-semibold mb-1">{test?.prompt}</div>
                        <div className="text-xs text-muted-foreground italic line-clamp-2">→ {r.response}</div>
                        {r.note && <div className="text-[11px] text-rose-600 mt-1">⚠ {r.note}</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="font-bold mb-1">No training runs yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            The suite includes product Q&A, troubleshooting, jailbreak attempts, credential probing and SQL/XSS injection. Run it to score the AI.
          </p>
        </div>
      )}

      {runs.length > 1 && (
        <div>
          <h3 className="font-bold text-sm mb-2">Run history</h3>
          <div className="space-y-1.5">
            {runs.slice(1, 6).map(r => {
              const pct = Math.round((r.passed / (r.passed + r.failed)) * 100);
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 text-sm">{new Date(r.at).toLocaleString()}</div>
                  <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {pct}%
                  </span>
                  <span className="text-xs text-muted-foreground">{r.passed}/{r.passed + r.failed}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({ ok, okLabel, failLabel }: { ok: boolean; okLabel: string; failLabel: string }) {
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${ok ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'}`}>
      {ok ? okLabel : failLabel}
    </span>
  );
}

// ============ SMART ROUTING ============

function SmartRouting() {
  const agents = useSupportStore(s => s.agents);

  // Demo: enrich agents with expertise/language tags
  const enriched = agents.map((a, i) => ({
    ...a,
    expertise: i === 0 ? ['Solar', 'Inverters'] : i === 1 ? ['Lighting', 'Smart-home'] : ['Wiring', 'Industrial'],
    languages: i === 1 ? ['English', 'Twi', 'Ga'] : ['English', 'Twi'],
    tier: i === 0 ? 'Senior' : i === 1 ? 'Senior' : 'Mid',
  }));

  const ROUTING_RULES = [
    { when: 'Solar / inverter installation', to: 'Senior · Solar', priority: 'High' },
    { when: 'Smart-home / lighting setup', to: 'Senior · Lighting', priority: 'Normal' },
    { when: 'Industrial / contractor B2B', to: 'Senior · Industrial', priority: 'High' },
    { when: 'General product / order', to: 'Any available agent', priority: 'Normal' },
    { when: 'Repeat low-CSAT customer', to: 'Senior tier · auto-priority', priority: 'High' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-lg">Smart routing</h2>
        <p className="text-sm text-muted-foreground">How conversations are matched to agents — by expertise, language, tier and load.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <h3 className="font-bold mb-3">Routing rules</h3>
          <div className="space-y-2">
            {ROUTING_RULES.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <span className="text-xs font-mono font-bold bg-card px-2 py-1 rounded text-muted-foreground">#{i + 1}</span>
                <div className="flex-1 text-sm">{r.when}</div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="text-xs font-semibold text-foreground">{r.to}</div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r.priority === 'High' ? 'bg-rose-500/15 text-rose-600' : 'bg-muted text-muted-foreground'}`}>{r.priority}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="font-bold mb-3">Agent capability matrix</h3>
          <div className="space-y-2">
            {enriched.map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <img src={a.avatar} alt="" className="w-10 h-10 rounded-xl object-cover bg-card" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{a.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">{a.tier}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {a.expertise.map(e => <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-card font-semibold">{e}</span>)}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Speaks: {a.languages.join(', ')}</div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${a.status === 'online' ? 'bg-emerald-500 animate-pulse' : a.status === 'busy' ? 'bg-amber-500' : 'bg-muted-foreground'}`} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900 dark:text-amber-200">
          <strong>Anti-overload guarantee:</strong> the router prevents double-assignment — busy agents are skipped until they free up,
          and queue load is balanced across senior agents first. Outside hours, customers see an estimated next-business-day reply.
        </div>
      </div>
    </div>
  );
}

// ============ SECURITY (compact reuse) ============

function SecurityPanel() {
  const threats = useSupportStore(s => s.threats);
  const breakdown = useMemo(() => {
    const c = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const t of threats) c[t.severity]++;
    return c;
  }, [threats]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-bold text-lg">AI security firewall</h2>
        <p className="text-sm text-muted-foreground">Real-time threat detection at the input boundary — prompt-injection, jailbreak, credential probing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={ShieldAlert} label="Total threats" value={threats.length.toString()} accent="rose" />
        <MetricCard icon={ShieldAlert} label="Blocked" value={threats.filter(t => t.blocked).length.toString()} accent="rose" />
        <MetricCard icon={AlertTriangle} label="High / critical" value={(breakdown.high + breakdown.critical).toString()} accent="amber" />
        <MetricCard icon={CheckCircle2} label="Avg risk" value={threats.length ? Math.round(threats.reduce((s, t) => s + t.riskScore, 0) / threats.length).toString() : '0'} accent="primary" />
      </div>

      <GlassCard className="p-5">
        <h3 className="font-bold mb-3">Recent threat log</h3>
        {threats.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">No threats detected — system clean.</div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {threats.slice(0, 30).map(t => (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  t.severity === 'critical' ? 'bg-rose-600' :
                  t.severity === 'high' ? 'bg-rose-500' :
                  t.severity === 'medium' ? 'bg-amber-500' : 'bg-sky-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider">{t.reason}</span>
                    <span className="text-[10px] text-muted-foreground">risk {t.riskScore}</span>
                    {t.blocked && <span className="text-[10px] font-bold bg-rose-500/15 text-rose-600 px-1.5 py-0.5 rounded">BLOCKED</span>}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono truncate">{t.input}</div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{new Date(t.at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
