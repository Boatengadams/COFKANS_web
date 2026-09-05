/**
 * COFKANS ELECTRICALS ERP — Marketing / Growth Dashboard.
 *
 * A growth cockpit: campaign & catalog KPIs, revenue-by-category performance,
 * a best-sellers leaderboard derived from live sales, an active-campaigns board
 * and a promotions/discount worklist. Backend-free — reads the module's catalog
 * + sales services; campaigns are seeded locally until the backend lands.
 */
import { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Megaphone, Tag, Package, TrendingUp, Percent, Eye, MousePointerClick,
  Sparkles, Trophy, Layers, Plus, ChevronRight, Trash2, X,
} from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { useSales } from '../hooks/useSales';
import { formatCedis } from '../utils/format';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter,
} from '../components/ui/pro';
import { store, onStoreChange, type Campaign, type CampaignStatus, type Promotion } from '../../../pages/developer-portal/store';

const PIE_COLORS = ['#0F5132', '#10B981', '#6EE7B7', '#2563EB', '#8B5CF6', '#F59E0B', '#EC4899'];

/** Live-updating view of the persisted campaigns collection. */
function useCampaigns(): Campaign[] {
  const [list, setList] = useState<Campaign[]>(() => store.getCampaigns());
  useEffect(() => onStoreChange(() => setList(store.getCampaigns())), []);
  return list;
}

/** Live-updating view of the persisted promotions collection. */
function usePromotions(): Promotion[] {
  const [list, setList] = useState<Promotion[]>(() => store.getPromotions());
  useEffect(() => onStoreChange(() => setList(store.getPromotions())), []);
  return list;
}

const STATUS_STYLE: Record<string, string> = {
  live: 'bg-emerald-500/10 text-emerald-600',
  scheduled: 'bg-blue-500/10 text-blue-600',
  draft: 'bg-muted text-muted-foreground',
  ended: 'bg-muted text-muted-foreground',
};

export function MarketingDashboard() {
  const catalog = useCatalog();
  const sales = useSales();
  const campaigns = useCampaigns();
  const promos = usePromotions();
  const [showForm, setShowForm] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);

  const skuCategory = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of catalog) map.set(p.sku, p.category);
    return map;
  }, [catalog]);

  // Best-sellers + revenue by category, aggregated from live sales.
  const { bestSellers, byCategory, totalRevenue } = useMemo(() => {
    const prod = new Map<string, { name: string; units: number; revenue: number }>();
    const cat = new Map<string, number>();
    let total = 0;
    for (const s of sales) {
      for (const it of s.items) {
        const p = prod.get(it.sku) ?? { name: it.name, units: 0, revenue: 0 };
        p.units += it.quantity;
        p.revenue += it.lineTotal;
        prod.set(it.sku, p);
        total += it.lineTotal;
        const c = skuCategory.get(it.sku) ?? 'Other';
        cat.set(c, (cat.get(c) ?? 0) + it.lineTotal);
      }
    }
    const bestSellers = [...prod.entries()]
      .map(([sku, v]) => ({ sku, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
    const byCategory = [...cat.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
    return { bestSellers, byCategory, totalRevenue: total };
  }, [sales, skuCategory]);

  const liveCampaigns = campaigns.filter((c) => c.status === 'live');
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const avgCtr = liveCampaigns.length
    ? (liveCampaigns.reduce((s, c) => s + c.ctr, 0) / liveCampaigns.length)
    : 0;
  const avgPrice = catalog.length
    ? Math.round(catalog.reduce((s, p) => s + p.price, 0) / catalog.length)
    : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Megaphone className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Growth · Marketing"
          title="Marketing Dashboard"
          subtitle={`${liveCampaigns.length} live campaigns · ${catalog.length} catalog products`}
        />

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={<Sparkles className="h-4 w-4" />} label="Live campaigns" value={liveCampaigns.length} tone="ok" />
          <Kpi icon={<Eye className="h-4 w-4" />} label="Total reach" value={totalReach} tone="info" />
          <Kpi icon={<MousePointerClick className="h-4 w-4" />} label="Avg CTR" value={avgCtr} suffix="%" decimals tone="ok" />
          <Kpi icon={<Package className="h-4 w-4" />} label="Catalog size" value={catalog.length} />
          <Kpi icon={<Tag className="h-4 w-4" />} label="Avg price" value={avgPrice} money tone="info" />
          <Kpi icon={<Percent className="h-4 w-4" />} label="Active promos" value={promos.length} tone="warn" />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel title="Revenue by category" icon={<Layers className="h-4 w-4" />} className="xl:col-span-2">
            <div className="h-64 w-full">
              {byCategory.length === 0 ? <EmptyState label="No sales recorded yet." /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis key="x" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={54} />
                    <YAxis key="y" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={54} tickFormatter={(v) => `₵${(v / 1000).toFixed(0)}k`} />
                    <Tooltip key="tip" contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} formatter={(v: number) => formatCedis(v)} />
                    <Bar key="rev" dataKey="value" name="Revenue" fill="#0F5132" radius={[6, 6, 0, 0]} maxBarSize={46} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>

          <Panel title="Category share" icon={<TrendingUp className="h-4 w-4" />}>
            <div className="h-64 w-full">
              {byCategory.length === 0 ? <EmptyState label="No sales yet." /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie key="pie" data={byCategory} dataKey="value" nameKey="name" innerRadius={52} outerRadius={90} paddingAngle={2}>
                      {byCategory.map((p, i) => <Cell key={p.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip key="tip" contentStyle={tooltipStyle} formatter={(v: number) => formatCedis(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Panel title="Best sellers" icon={<Trophy className="h-4 w-4" />}
            action={<Pill tone="info">{formatCedis(totalRevenue)} total</Pill>}>
            {bestSellers.length === 0 ? (
              <EmptyState label="No sales recorded yet." />
            ) : (
              <div className="space-y-2">
                {bestSellers.map((p, i) => (
                  <div key={p.sku} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs text-primary">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.units} units sold</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm text-emerald-600">{formatCedis(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Active campaigns" icon={<Megaphone className="h-4 w-4" />}
            action={(
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-opacity hover:opacity-90">
                <Plus className="h-3.5 w-3.5" /> New campaign
              </button>
            )}>
            {campaigns.length === 0 ? (
              <EmptyState label="No campaigns yet — create one to get started." />
            ) : (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.channel}{c.reach ? ` · ${c.reach.toLocaleString()} reach · ${c.ctr}% CTR` : ''} · {formatCedis(c.spend)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                      {c.status !== 'ended' && (
                        <button title="Advance status" onClick={() => store.advanceCampaign(c.id)}
                          className="rounded-lg border border-border p-1 text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button title="Delete" onClick={() => store.deleteCampaign(c.id)}
                        className="rounded-lg border border-border p-1 text-muted-foreground transition-colors hover:border-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Promotions worklist" icon={<Percent className="h-4 w-4" />}
          action={(
            <button onClick={() => setShowPromoForm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-foreground transition-opacity hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> New promo
            </button>
          )}>
          {promos.length === 0 ? (
            <EmptyState label="No promotions yet — add one to get started." />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {promos.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">Ends {p.ends}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Pill tone="down">-{p.discount}%</Pill>
                    <button title="Delete" onClick={() => store.deletePromotion(p.id)}
                      className="rounded-lg border border-border p-1 text-muted-foreground transition-colors hover:border-red-500 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {showForm && <CampaignForm onClose={() => setShowForm(false)} />}
      {showPromoForm && <PromoForm onClose={() => setShowPromoForm(false)} />}
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function CampaignForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('Email + Social');
  const [status, setStatus] = useState<CampaignStatus>('draft');
  const [reach, setReach] = useState('');
  const [ctr, setCtr] = useState('');
  const [spend, setSpend] = useState('');

  const save = () => {
    if (!name.trim()) return;
    store.addCampaign({
      name: name.trim(), channel, status,
      reach: Math.max(0, parseInt(reach, 10) || 0),
      ctr: Math.max(0, parseFloat(ctr) || 0),
      spend: Math.max(0, parseFloat(spend) || 0),
    });
    onClose();
  };

  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 style={{ fontSize: '1.15rem' }}>New campaign</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Name</span>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rainy Season Lighting" /></label>
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Channel</span>
            <input className={field} value={channel} onChange={(e) => setChannel(e.target.value)} /></label>
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Status</span>
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as CampaignStatus)}>
              {(['draft', 'scheduled', 'live', 'ended'] as CampaignStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Reach</span>
              <input className={field} type="number" min={0} value={reach} onChange={(e) => setReach(e.target.value)} placeholder="0" /></label>
            <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">CTR %</span>
              <input className={field} type="number" min={0} step="0.1" value={ctr} onChange={(e) => setCtr(e.target.value)} placeholder="0" /></label>
            <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Spend ₵</span>
              <input className={field} type="number" min={0} value={spend} onChange={(e) => setSpend(e.target.value)} placeholder="0" /></label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={save} disabled={!name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
            <Plus className="h-4 w-4" /> Create campaign
          </button>
        </div>
      </div>
    </div>
  );
}

function PromoForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState('10');
  const [ends, setEnds] = useState('in 7 days');

  const save = () => {
    if (!name.trim()) return;
    store.addPromotion({
      name: name.trim(),
      discount: Math.min(100, Math.max(0, parseInt(discount, 10) || 0)),
      ends: ends.trim() || 'soon',
    });
    onClose();
  };

  const field = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary';

  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h3 style={{ fontSize: '1.15rem' }}>New promotion</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-3">
          <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Product / offer</span>
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. LED Panel 18W" /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Discount %</span>
              <input className={field} type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(e.target.value)} /></label>
            <label className="block"><span className="mb-1 block text-xs uppercase tracking-wide text-muted-foreground">Ends</span>
              <input className={field} value={ends} onChange={(e) => setEnds(e.target.value)} placeholder="in 7 days" /></label>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted">Cancel</button>
          <button onClick={save} disabled={!name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-60">
            <Plus className="h-4 w-4" /> Add promotion
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ icon, label, value, tone = 'default', money = false, suffix, decimals = false }: {
  icon: React.ReactNode; label: string; value: number; money?: boolean; suffix?: string; decimals?: boolean;
  tone?: 'ok' | 'warn' | 'info' | 'down' | 'default';
}) {
  const toneClass =
    tone === 'ok' ? 'text-emerald-600' :
    tone === 'warn' ? 'text-amber-600' :
    tone === 'down' ? 'text-red-600' :
    tone === 'info' ? 'text-primary' : 'text-foreground';
  const fmt = money ? (n: number) => formatCedis(n) : decimals ? (n: number) => n.toFixed(1) : undefined;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: money ? '1.5rem' : '1.9rem', lineHeight: 1.05 }}>
        <AnimatedCounter value={value} format={fmt} />{suffix}
      </p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12, border: '1px solid var(--border)',
  background: 'var(--popover)', color: 'var(--popover-foreground)', fontSize: 12,
} as const;

export default MarketingDashboard;
