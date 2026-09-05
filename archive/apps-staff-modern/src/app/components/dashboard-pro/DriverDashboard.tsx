import { useMemo } from 'react';
import { Truck, Navigation, Package, Wallet, MapPin, CheckCircle2, Clock, Fuel } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { GlassCard, KPI, SectionTitle, StatusPill, EmptyState } from './primitives';
import { useLiveSeries } from './useLiveSeries';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

interface Stop {
  id: string;
  customer: string;
  address: string;
  eta: string;
  km: number;
  status: 'done' | 'next' | 'queued';
}

const STOPS: Stop[] = [
  { id: 'D-4821', customer: 'Ama K.',  address: 'Cantonments, 7th Ave',     eta: '11:20', km: 4.2, status: 'done'   },
  { id: 'D-4822', customer: 'Yaw M.',  address: 'East Legon, Boundary Rd',  eta: '11:55', km: 6.1, status: 'next'   },
  { id: 'D-4823', customer: 'Kofi A.', address: 'Airport Residential',      eta: '12:30', km: 3.4, status: 'queued' },
  { id: 'D-4824', customer: 'Esi N.',  address: 'Spintex Coastal Estates',  eta: '13:15', km: 8.7, status: 'queued' },
];

const statusTint = {
  done:   'bg-emerald-500',
  next:   'bg-primary ring-4 ring-primary/20 animate-pulse',
  queued: 'bg-muted',
} as const;

export function DriverOverview() {
  const live = useLiveSeries(20, 2200, 42, 6);
  const earnings = useMemo(() => days.map((d, i) => ({ d, gh: 80 + i*22 + Math.round(Math.random()*40) })), []);

  return (
    <div className="space-y-6">
      {/* Active route hero */}
      <GlassCard glow className="p-6 md:p-8 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">On route</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Route R-204 · 6 stops left</h1>
          <p className="text-muted-foreground mt-1.5 max-w-md">Optimized for traffic. Next stop at Cantonments in ~12 min.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Distance</div>
            <div className="text-2xl font-bold tabular-nums">{Math.round(live[live.length - 1])} km</div>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-foreground text-background text-sm font-semibold hover:opacity-90 flex items-center gap-2">
            <Navigation className="w-4 h-4" /> Start navigation
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Today's deliveries" value="8" delta="2 completed" trend="up" icon={Package} accent="sky" sparkline={[1,1,2,2,2,2,2,2]} />
        <KPI label="Earnings (wk)" value="GH₵ 1,240" delta="+18%" trend="up" icon={Wallet} accent="emerald" sparkline={earnings.map(e => e.gh)} />
        <KPI label="On-time rate" value="96%" delta="last 30 days" trend="flat" icon={Clock} accent="violet" />
        <KPI label="Fuel used (wk)" value="42L" delta="-6L vs last wk" trend="down" icon={Fuel} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle title="Route progress" subtitle="6 stops · live ETA" action={<StatusPill status="info">live</StatusPill>} />
          <div className="space-y-2">
            {STOPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${statusTint[s.status]}`} />
                  {i < STOPS.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{s.customer} <span className="text-muted-foreground font-medium">· #{s.id}</span></div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{s.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">{s.eta}</div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">{s.km} km</div>
                </div>
                {s.status === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle title="Earnings this week" subtitle="Daily breakdown" />
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={earnings} margin={{ left: -20, right: 8, top: 10 }}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="d" stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} width={36} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.95)', border: 'none', borderRadius: 12, color: 'white' }} />
                <Bar dataKey="gh" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <SectionTitle title="Distance & time (live)" subtitle="Last 60 seconds — driving" />
        <div className="h-48">
          <ResponsiveContainer>
            <AreaChart data={live.map((v, i) => ({ t: i, km: v }))} margin={{ left: -20, right: 8 }}>
              <defs>
                <linearGradient id="dkm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="currentColor" strokeOpacity={0.06} vertical={false} />
              <XAxis dataKey="t" stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} width={32} />
              <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.95)', border: 'none', borderRadius: 12, color: 'white' }} />
              <Area type="monotone" dataKey="km" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#dkm)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}

export function DriverRoutes() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Routes" subtitle="Past and upcoming routes" />
      <div className="space-y-2">
        {[
          { r: 'R-204', when: 'Today',     stops: 8, km: 36.2, status: 'warn'    as const, label: 'Active' },
          { r: 'R-203', when: 'Yesterday', stops: 11, km: 42.7, status: 'success' as const, label: 'Done' },
          { r: 'R-202', when: '2 days ago', stops: 9, km: 31.4, status: 'success' as const, label: 'Done' },
        ].map(r => (
          <div key={r.r} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/60">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-500 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{r.r} · {r.when}</div>
              <div className="text-xs text-muted-foreground">{r.stops} stops · {r.km} km</div>
            </div>
            <StatusPill status={r.status}>{r.label}</StatusPill>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function DriverEarnings() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Earnings" subtitle="Payouts and tips" />
      <EmptyState icon={Wallet} title="Earnings will sync from Supabase" body="In demo, snapshots only — the overview chart shows live mock data." />
    </GlassCard>
  );
}
