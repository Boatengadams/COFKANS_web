import { Fragment, useMemo, useState } from 'react';
import { Wrench, ClipboardList, Star, Clock, MapPin, CheckCircle2, AlertCircle, Calendar as CalIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard, KPI, SectionTitle, StatusPill, EmptyState } from './primitives';
import { useLiveSeries } from './useLiveSeries';

interface Job {
  id: string;
  title: string;
  address: string;
  when: string;
  hour: number; // 0-23
  day: number;  // 0-6 (Mon..Sun)
  priority: 'urgent' | 'normal' | 'low';
  status: 'scheduled' | 'in_progress' | 'done';
}

const JOBS: Job[] = [
  { id: 'SR-9281', title: 'Panel installation', address: 'East Legon, Lakeside Estates', when: 'Today · 09:00', hour: 9,  day: 0, priority: 'urgent', status: 'in_progress' },
  { id: 'SR-9282', title: 'Smart switch wiring', address: 'Cantonments, 7th Ave',         when: 'Today · 13:30', hour: 13, day: 0, priority: 'normal', status: 'scheduled' },
  { id: 'SR-9283', title: 'Chandelier mount',    address: 'Airport Hills, Plot 42',       when: 'Tomorrow · 10:00', hour: 10, day: 1, priority: 'normal', status: 'scheduled' },
  { id: 'SR-9284', title: 'Safety inspection',   address: 'Tema Community 6',               when: 'Wed · 11:00', hour: 11, day: 2, priority: 'low',    status: 'scheduled' },
  { id: 'SR-9285', title: 'Generator service',   address: 'Spintex Junction',                when: 'Thu · 14:00', hour: 14, day: 3, priority: 'urgent', status: 'scheduled' },
];

const priorityTint = {
  urgent: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
  normal: 'bg-sky-500/15 text-sky-500 border-sky-500/30',
  low:    'bg-muted text-muted-foreground border-border',
} as const;

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function TechnicianOverview() {
  const live = useLiveSeries(20, 2500, 65, 12);
  const trend = useMemo(() => Array.from({ length: 14 }, (_, i) => ({ d: i + 1, jobs: Math.round(2 + Math.sin(i/2) * 2 + Math.random() * 2) })), []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Active jobs" value="4" delta="1 urgent" trend="up" icon={Wrench} accent="amber" />
        <KPI label="Completed (wk)" value="18" delta="+3 vs last wk" trend="up" icon={CheckCircle2} accent="emerald" sparkline={[8,10,11,13,14,16,18]} />
        <KPI label="Rating" value="4.9" delta="from 86 reviews" trend="flat" icon={Star} accent="violet" />
        <KPI label="On-time %" value={`${Math.round(live[live.length-1])}%`} delta="last 30 jobs" trend="up" icon={Clock} accent="sky" sparkline={live} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle title="Jobs completed" subtitle="Last 14 days" action={<StatusPill status="success">+22%</StatusPill>} />
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: -20, right: 8, top: 10 }}>
                <defs>
                  <linearGradient id="tjobs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="d" stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} width={32} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.95)', border: 'none', borderRadius: 12, color: 'white' }} />
                <Area type="monotone" dataKey="jobs" stroke="#10b981" strokeWidth={2.5} fill="url(#tjobs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard glow className="p-5">
          <SectionTitle title="Next up" subtitle="Highest priority" />
          <div className="space-y-3">
            {JOBS.filter(j => j.status !== 'done').slice(0, 3).map(j => (
              <div key={j.id} className="p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityTint[j.priority]}`}>{j.priority}</span>
                  <span className="text-[11px] text-muted-foreground">{j.when}</span>
                </div>
                <div className="font-bold text-sm">{j.title}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" /> {j.address}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <ScheduleGrid />
    </div>
  );
}

function ScheduleGrid() {
  const [weekOffset, setWeekOffset] = useState(0);
  const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 8 → 17

  return (
    <GlassCard className="p-5">
      <SectionTitle
        title="This week"
        subtitle="Drag jobs in the real app — preview only here"
        action={
          <div className="flex items-center gap-1">
            <button onClick={() => setWeekOffset(w => w - 1)} className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-2 text-xs font-semibold text-muted-foreground tabular-nums">{weekOffset === 0 ? 'This week' : weekOffset > 0 ? `+${weekOffset} wk` : `${weekOffset} wk`}</span>
            <button onClick={() => setWeekOffset(w => w + 1)} className="w-8 h-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => setWeekOffset(0)} className="ml-1 px-2.5 h-8 rounded-lg border border-border hover:bg-muted text-xs font-semibold flex items-center gap-1.5"><CalIcon className="w-3.5 h-3.5" />Today</button>
          </div>
        }
      />
      <div className="overflow-x-auto">
        <div className="min-w-[640px] grid" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
          <div />
          {days.map(d => (
            <div key={d} className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2">{d}</div>
          ))}
          {hours.map(h => (
            <Fragment key={h}>
              <div className="text-[10px] text-muted-foreground pr-2 text-right pt-1 border-t border-border/50">{h}:00</div>
              {days.map((_, dIdx) => {
                const j = weekOffset === 0 ? JOBS.find(x => x.day === dIdx && x.hour === h) : undefined;
                return (
                  <div key={`${h}-${dIdx}`} className="h-12 border-t border-l border-border/50 relative">
                    {j && (
                      <div className={`absolute inset-1 rounded-lg border px-1.5 py-1 ${priorityTint[j.priority]} text-[10px] font-semibold leading-tight overflow-hidden`}>
                        <div className="truncate">{j.title}</div>
                        <div className="opacity-70 truncate">#{j.id}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

export function TechnicianJobs() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Service requests" subtitle="All assigned jobs" />
      <div className="space-y-2">
        {JOBS.map(j => (
          <div key={j.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${j.priority === 'urgent' ? 'bg-rose-500/15 text-rose-500' : 'bg-sky-500/15 text-sky-500'}`}>
              {j.priority === 'urgent' ? <AlertCircle className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">#{j.id} — {j.title}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{j.address} · {j.when}</div>
            </div>
            <StatusPill status={j.status === 'done' ? 'success' : j.status === 'in_progress' ? 'warn' : 'info'}>
              {j.status.replace('_', ' ')}
            </StatusPill>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function TechnicianReviews() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Reviews" subtitle="Customer feedback" />
      <EmptyState icon={Star} title="Reviews appear here when customers rate jobs" body="Demo mode — wire Supabase to sync real ratings." />
    </GlassCard>
  );
}
