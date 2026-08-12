import { useMemo } from 'react';
import { Heart, Package, TrendingUp, Truck, Sparkles, ArrowRight, ArrowUpRight, MapPin, Plus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { GlassCard, SectionTitle, StatusPill, EmptyState } from './primitives';
import type { FirestoreUser } from '../../../lib/firestore-schema';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export function CustomerOverview({ user }: { user: FirestoreUser }) {
  const spend = useMemo(
    () => months.map((m, i) => ({ month: m, spend: 200 + Math.round(Math.sin(i) * 80 + i * 35) })),
    [],
  );
  const first = user.displayName.split(' ')[0];

  return (
    <div className="space-y-8">
      {/* Bold hero — typography-led */}
      <div className="flex items-end justify-between gap-6 flex-wrap pt-2">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground mb-3">Hello, {first}</div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95]">
            Welcome <span className="text-primary">back.</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md text-sm">
            You've saved <span className="font-bold text-foreground">GH₵ 412</span> this season.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-3 rounded-full bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity">
            Browse new arrivals
          </button>
          <button className="px-5 py-3 rounded-full border-2 border-border text-sm font-bold hover:border-foreground transition-colors">
            Re-order last
          </button>
        </div>
      </div>

      {/* Three big stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BigStat label="Orders" value="14" delta="+2 this month" />
        <BigStat label="Total spent" value="GH₵ 2,840" delta="+18%" emphasis />
        <BigStat label="Rewards" value="412" delta="next tier · 500" />
      </div>

      {/* Spend chart (flat) + active delivery */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card/40 p-6">
          <SectionTitle title="Spend" subtitle="Last 9 months · GH₵" action={<StatusPill status="success">↑ 18%</StatusPill>} />
          <div className="h-48">
            <ResponsiveContainer>
              <AreaChart data={spend} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                <YAxis hide domain={['dataMin - 40', 'dataMax + 40']} />
                <Area type="monotone" dataKey="spend" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.08} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground mt-2">
            {spend.map(s => <span key={s.month}>{s.month}</span>)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-6">
          <SectionTitle title="Active delivery" subtitle="#B1F8E" />
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-foreground text-background flex items-center justify-center">
              <Truck className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-bold text-sm">Out for delivery</div>
              <div className="text-xs text-muted-foreground">Arrives ~ 4:30 PM</div>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Placed', done: true },
              { label: 'Packed', done: true },
              { label: 'Out for delivery', done: true, active: true },
              { label: 'Delivered', done: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.active ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : s.done ? 'bg-foreground' : 'bg-muted'}`} />
                <div className={`text-sm ${s.done ? 'font-semibold' : 'text-muted-foreground'}`}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="w-full mt-5 px-3 py-2.5 rounded-xl border border-border text-sm font-bold hover:bg-muted flex items-center justify-center gap-2">
            Track on map <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl border border-border bg-card/40 p-6">
        <SectionTitle
          title="Recent orders"
          action={
            <button className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          }
        />
        <div className="divide-y divide-border">
          {[
            { id: 'A8F2C', items: 'Energy saving bulb 30W · ×2', total: 'GH₵ 180', status: 'success', label: 'Delivered' as const },
            { id: 'B1F8E', items: 'LED Surface Panel · ×1',     total: 'GH₵ 320', status: 'info',    label: 'Shipped' as const },
            { id: 'C7K9D', items: 'Smart bulb assortment',       total: 'GH₵ 540', status: 'warn',    label: 'Processing' as const },
          ].map(o => (
            <div key={o.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Package className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">#{o.id}</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{o.items}</div>
              </div>
              <div className="text-sm font-bold tabular-nums">{o.total}</div>
              <StatusPill status={o.status as never}>{o.label}</StatusPill>
            </div>
          ))}
        </div>
      </div>

      {/* For you — horizontal strip */}
      <div>
        <SectionTitle title="For you" subtitle="Picked from your taste" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'Crystal pendant chandelier', price: 'GH₵ 120' },
            { name: 'Smart RGB strip 10m',        price: 'GH₵ 210' },
            { name: 'Outdoor flood 50W',          price: 'GH₵ 300' },
          ].map(p => (
            <div key={p.name} className="group rounded-2xl border border-border bg-card/40 p-4 hover:border-foreground transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <div className="font-bold text-sm leading-tight mb-1 truncate">{p.name}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold tabular-nums">{p.price}</span>
                <button className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BigStat({ label, value, delta, emphasis }: { label: string; value: string; delta: string; emphasis?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 transition-colors ${emphasis ? 'bg-foreground text-background' : 'border border-border bg-card/40'}`}>
      <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${emphasis ? 'text-background/60' : 'text-muted-foreground'}`}>{label}</div>
      <div className="text-4xl md:text-5xl font-black tracking-tight tabular-nums mt-3 leading-none">{value}</div>
      <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${emphasis ? 'text-background/80' : 'text-muted-foreground'}`}>
        <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2.5} />
        {delta}
      </div>
    </div>
  );
}

export function CustomerOrders() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="My orders" subtitle="All your past purchases" />
      <EmptyState icon={Package} title="Orders appear here once the backend is live" body="Your demo dashboard is wired — connect Supabase and orders will populate." />
    </GlassCard>
  );
}

export function CustomerWishlist() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Wishlist" subtitle="Items saved for later" />
      <EmptyState icon={Heart} title="Your wishlist is empty in demo mode" body="Browse the storefront and tap the heart to save items." />
    </GlassCard>
  );
}

export function CustomerActivity() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Activity" subtitle="Recent account activity" />
      <div className="space-y-3">
        {[
          { t: 'Order #A8F2C delivered', s: 'success', when: '2h ago', icon: TrendingUp },
          { t: 'Promo applied: BFRIDAY', s: 'warn',    when: '1d ago', icon: Sparkles },
          { t: 'New address added',      s: 'info',    when: '3d ago', icon: MapPin },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
            <a.icon className="w-4 h-4 text-primary" strokeWidth={2.5} />
            <div className="flex-1 text-sm font-medium">{a.t}</div>
            <div className="text-xs text-muted-foreground">{a.when}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
