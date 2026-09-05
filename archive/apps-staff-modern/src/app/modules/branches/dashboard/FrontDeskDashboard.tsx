/**
 * COFKANS ELECTRICALS ERP — Unified Front Desk Dashboard.
 *
 * The Front Desk is the single customer-facing hub: it absorbs the former
 * Cashier, Sales Representative and Customer Service portals into one tabbed
 * workspace so one desk "does it all":
 *
 *   • Overview  — the day at a glance + quick actions
 *   • Till      — POS access + cash-drawer reconciliation + recent receipts
 *   • Catalog   — live stock availability & retail prices, start an order
 *   • Support   — customer-service ticket queue + orders to follow up
 *
 * Live figures come from the branch sales & inventory stores; support tickets
 * are a deterministic mock (no support backend yet).
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';
import {
  LayoutDashboard, Wallet, Store, Headset, ShoppingCart, Receipt, Banknote,
  Coins, Clock, ArrowRight, Search, PackageCheck, PackageX, AlertTriangle,
  Tag, ShoppingBag, Ticket, CheckCircle2, Smile, PackageSearch, Phone,
} from 'lucide-react';
import { useBranchSales } from '../hooks/useSales';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { stockLevel } from '../utils/inventory';
import { formatCedis, formatDateTime } from '../utils/format';
import { branchPath } from '../routes/paths';
import { ImageWithFallback } from '../../../components/figma/ImageWithFallback';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, ProgressRing,
} from '../components/ui/pro';
import type { Sale, PaymentMethod } from '../types/sale';
import type { ProductInventory } from '../types/product-inventory';

type Tab = 'overview' | 'till' | 'catalog' | 'support';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'till', label: 'Till', icon: <Wallet className="h-4 w-4" /> },
  { id: 'catalog', label: 'Catalog', icon: <Store className="h-4 w-4" /> },
  { id: 'support', label: 'Support', icon: <Headset className="h-4 w-4" /> },
];

const OPENING_FLOAT = 500;

const PM_LABEL: Record<PaymentMethod, string> = {
  cash: 'Cash', 'mobile-money': 'Mobile Money', card: 'Card',
  'bank-transfer': 'Bank Transfer', credit: 'Credit',
};
const PM_COLOR: Record<PaymentMethod, string> = {
  cash: '#0F5132', 'mobile-money': '#F5A524', card: '#0EA5E9',
  'bank-transfer': '#8B5CF6', credit: '#EF4444',
};

function isToday(iso: string) {
  const d = new Date(iso); const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
function rand(seed: number) { const x = Math.sin(seed * 999.13) * 43758.5453; return x - Math.floor(x); }
const DAY = 86_400_000;

export function FrontDeskDashboard({ branchId }: { branchId: string }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');

  const sales = useBranchSales(branchId);
  const inventory = useBranchInventory(branchId);

  const todaySales = useMemo(() => sales.filter((s) => isToday(s.soldAt)), [sales]);

  const till = useMemo(() => {
    let rungUp = 0, cashTaken = 0;
    const byMethod: Partial<Record<PaymentMethod, number>> = {};
    todaySales.forEach((s) => {
      rungUp += s.totals.total;
      byMethod[s.paymentMethod] = (byMethod[s.paymentMethod] ?? 0) + s.totals.total;
      if (s.paymentMethod === 'cash') cashTaken += s.amountPaid;
    });
    return { count: todaySales.length, rungUp, cashTaken, expectedDrawer: OPENING_FLOAT + cashTaken, byMethod };
  }, [todaySales]);

  const tickets = useMemo(() => buildTickets(), []);
  const openTickets = tickets.filter((t) => t.status !== 'resolved').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<LayoutDashboard className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Front Desk · Sales, Till & Support"
          title="Front Desk"
          subtitle={`${till.count} sale${till.count === 1 ? '' : 's'} today · ${inventory.totals.skuCount} products · ${openTickets} open ticket${openTickets === 1 ? '' : 's'}`}
          actions={
            <button
              onClick={() => navigate(branchPath(branchId, 'sales'))}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ShoppingCart className="h-4 w-4" /> Open POS
            </button>
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 scrollbar-hide">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${
                tab === t.id ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <OverviewTab till={till} inventory={inventory} openTickets={openTickets}
            onGo={(seg) => navigate(branchPath(branchId, seg))} setTab={setTab} />
        )}
        {tab === 'till' && <TillTab till={till} sales={todaySales} branchId={branchId} navigate={navigate} />}
        {tab === 'catalog' && <CatalogTab inventory={inventory} onOrder={() => navigate(branchPath(branchId, 'sales'))} />}
        {tab === 'support' && <SupportTab tickets={tickets} sales={sales} />}
      </div>
    </div>
  );
}

/* =================================================================== Overview */

function OverviewTab({ till, inventory, openTickets, onGo, setTab }: {
  till: TillStats; inventory: ReturnType<typeof useBranchInventory>; openTickets: number;
  onGo: (seg: 'sales' | 'receipts' | 'products' | 'transfers') => void; setTab: (t: Tab) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={<Receipt className="h-4 w-4" />} label="Rung up today" value={till.rungUp} money tone="ok" />
        <Kpi icon={<Coins className="h-4 w-4" />} label="Expected drawer" value={till.expectedDrawer} money tone="warn" />
        <Kpi icon={<PackageCheck className="h-4 w-4" />} label="Units available" value={inventory.totals.unitsOnHand} tone="info" />
        <Kpi icon={<Ticket className="h-4 w-4" />} label="Open tickets" value={openTickets} tone="danger" />
      </section>

      <Panel title="Quick actions" icon={<LayoutDashboard className="h-4 w-4" />}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction icon={<ShoppingCart className="h-5 w-5" />} label="New sale" onClick={() => onGo('sales')} />
          <QuickAction icon={<Store className="h-5 w-5" />} label="Check stock" onClick={() => setTab('catalog')} />
          <QuickAction icon={<Headset className="h-5 w-5" />} label="Support queue" onClick={() => setTab('support')} />
          <QuickAction icon={<Receipt className="h-5 w-5" />} label="Receipts" onClick={() => onGo('receipts')} />
        </div>
      </Panel>
    </div>
  );
}

/* ======================================================================= Till */

function TillTab({ till, sales, branchId, navigate }: {
  till: TillStats; sales: Sale[]; branchId: string; navigate: (to: string) => void;
}) {
  const mixData = useMemo(
    () => (Object.entries(till.byMethod) as [PaymentMethod, number][])
      .map(([method, value]) => ({ method, name: PM_LABEL[method], value })),
    [till.byMethod],
  );
  const recent = useMemo(() => [...sales].sort((a, b) => (a.soldAt < b.soldAt ? 1 : -1)).slice(0, 6), [sales]);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={<ShoppingCart className="h-4 w-4" />} label="Sales today" value={till.count} tone="info" />
        <Kpi icon={<Receipt className="h-4 w-4" />} label="Total rung up" value={till.rungUp} money tone="ok" />
        <Kpi icon={<Banknote className="h-4 w-4" />} label="Cash taken" value={till.cashTaken} money tone="ok" />
        <Kpi icon={<Coins className="h-4 w-4" />} label="Expected drawer" value={till.expectedDrawer} money tone="warn" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Cash drawer" icon={<Wallet className="h-4 w-4" />} action={<Pill tone="info">Shift</Pill>}>
          <dl className="space-y-3">
            <Row label="Opening float" value={formatCedis(OPENING_FLOAT)} />
            <Row label="Cash sales" value={`+ ${formatCedis(till.cashTaken)}`} tone="text-emerald-600" />
            <div className="my-1 border-t border-border" />
            <Row label="Expected in drawer" value={formatCedis(till.expectedDrawer)} strong />
          </dl>
          <p className="mt-4 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground">
            Count the drawer at close of shift and confirm it matches the expected total before handover.
          </p>
        </Panel>

        <Panel title="Payment mix" icon={<Coins className="h-4 w-4" />} className="xl:col-span-2">
          {mixData.length === 0 ? (
            <EmptyState label="No sales yet today — open the POS to start the shift." />
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie key="pie" data={mixData} dataKey="value" nameKey="name" cx="40%" cy="50%"
                    innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {mixData.map((d) => <Cell key={d.method} fill={PM_COLOR[d.method]} />)}
                  </Pie>
                  <Tooltip key="tip" formatter={(v: number) => formatCedis(v)} contentStyle={tooltipStyle} />
                  <Legend key="lg" verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Recent receipts" icon={<Receipt className="h-4 w-4" />}
        action={
          <button onClick={() => navigate(branchPath(branchId, 'receipts'))}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            All receipts <ArrowRight className="h-3.5 w-3.5" />
          </button>
        }>
        {recent.length === 0 ? (
          <EmptyState label="No receipts issued yet today." />
        ) : (
          <div className="space-y-2">
            {recent.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">{s.reference}</p>
                  <p className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />{formatDateTime(s.soldAt)} · {PM_LABEL[s.paymentMethod]}
                  </p>
                </div>
                <span className="shrink-0 text-sm">{formatCedis(s.totals.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ==================================================================== Catalog */

function CatalogTab({ inventory, onOrder }: {
  inventory: ReturnType<typeof useBranchInventory>; onOrder: () => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const items = inventory.items;

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category && set.add(i.category));
    return ['All', ...[...set].sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) => {
      if (category !== 'All' && i.category !== category) return false;
      if (!q) return true;
      return (i.name ?? '').toLowerCase().includes(q) || i.sku.toLowerCase().includes(q);
    });
  }, [items, query, category]);

  const t = inventory.totals;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={<PackageCheck className="h-4 w-4" />} label="Products carried" value={t.skuCount} tone="info" />
        <Kpi icon={<Tag className="h-4 w-4" />} label="Units available" value={t.unitsOnHand} tone="ok" />
        <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="Low stock" value={t.lowStockCount} tone="warn" />
        <Kpi icon={<PackageX className="h-4 w-4" />} label="Out of stock" value={t.outOfStockCount} tone="danger" />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products or SKU…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <button onClick={onOrder} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:opacity-90">
          <ShoppingBag className="h-4 w-4" /> Start order
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.slice(0, 10).map((c) => (
          <button key={c} onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              category === c ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
            }`}>{c}</button>
        ))}
      </div>

      <Panel title="Catalog & availability" icon={<Store className="h-4 w-4" />}
        action={<Pill tone="info">{filtered.length} shown</Pill>}>
        {filtered.length === 0 ? (
          <EmptyState label="No products match your search." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.slice(0, 24).map((item) => <ProductCard key={item.productId} item={item} />)}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ProductCard({ item }: { item: ProductInventory }) {
  const level = stockLevel(item);
  const badge =
    level === 'out' ? { tone: 'down' as const, text: 'Out of stock' } :
    level === 'low' ? { tone: 'warn' as const, text: `Low · ${item.quantity} left` } :
    { tone: 'up' as const, text: `${item.quantity} in stock` };
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        <ImageWithFallback src={item.image ?? ''} alt={item.name ?? item.sku} className="h-full w-full object-cover" />
      </div>
      <div className="space-y-1.5 p-3">
        <p className="truncate text-sm" title={item.name}>{item.name ?? item.sku}</p>
        <p className="truncate text-xs text-muted-foreground">{item.category ?? '—'}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm text-primary">{formatCedis(item.price)}</span>
          <Pill tone={badge.tone}>{badge.text}</Pill>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================== Support */

interface SupportTicket {
  id: string; ref: string; customer: string; subject: string; channel: string;
  priority: 'low' | 'normal' | 'high'; status: 'open' | 'pending' | 'resolved'; createdAt: string;
}

const SUBJECTS = [
  'Faulty circuit breaker under warranty', 'Delivery delay enquiry', 'Request installation quote',
  'Wrong cable gauge delivered', 'Bulk order for LED floodlights', 'Refund for damaged socket',
  'Product availability — 3-phase meter', 'Invoice copy request', 'Fan not working after install',
  'Price match request', 'Change delivery address', 'Warranty claim — surge protector',
];
const NAMES = ['Adjei Residence', 'Blessed Salon', 'Mensah Apartments', 'Royal Guest House', 'Kwame Boateng', 'Ama Owusu', 'Santasi Hardware', 'Unity Church', 'Golden Foods Ltd', 'Peter Asare'];
const CS_CHANNELS = ['Phone', 'Email', 'WhatsApp', 'Walk-in'];

function buildTickets(): SupportTicket[] {
  return Array.from({ length: 12 }, (_, i) => {
    const status = rand(i + 1) > 0.55 ? 'open' : rand(i + 2) > 0.5 ? 'pending' : 'resolved';
    const priority = rand(i + 3) > 0.8 ? 'high' : rand(i + 4) > 0.4 ? 'normal' : 'low';
    return {
      id: `tkt-${i}`, ref: `CS-${1024 + i}`,
      customer: NAMES[Math.floor(rand(i + 5) * NAMES.length)],
      subject: SUBJECTS[i % SUBJECTS.length],
      channel: CS_CHANNELS[Math.floor(rand(i + 6) * CS_CHANNELS.length)],
      priority: priority as SupportTicket['priority'],
      status: status as SupportTicket['status'],
      createdAt: new Date(Date.now() - Math.floor(rand(i + 7) * 5 * DAY)).toISOString(),
    };
  });
}

function SupportTab({ tickets, sales }: { tickets: SupportTicket[]; sales: Sale[] }) {
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const effResolved = (t: SupportTicket) => resolved[t.id] || t.status === 'resolved';

  const queue = useMemo(
    () => tickets.filter((t) => !effResolved(t)).sort((a, b) => rank(b.priority) - rank(a.priority)),
    [tickets, resolved],
  );
  const followUps = useMemo(
    () => sales.filter((s) => s.channel === 'delivery' || s.channel === 'phone-order' || s.channel === 'online-pickup').slice(0, 8),
    [sales],
  );
  const csat = 94;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={<Ticket className="h-4 w-4" />} label="Open tickets" value={queue.length} tone="info" />
        <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Resolved" value={tickets.length - queue.length} tone="ok" />
        <Kpi icon={<PackageSearch className="h-4 w-4" />} label="Follow-ups" value={followUps.length} tone="warn" />
        <Kpi icon={<Smile className="h-4 w-4" />} label="CSAT" value={csat} suffix="%" tone="ok" />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Panel title="Ticket queue" icon={<Ticket className="h-4 w-4" />} className="xl:col-span-2"
          action={<Pill tone={queue.length ? 'warn' : 'up'}>{queue.length} active</Pill>}>
          {queue.length === 0 ? (
            <EmptyState label="Inbox zero — no open tickets." />
          ) : (
            <div className="space-y-2">
              {queue.map((t) => (
                <div key={t.id} className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{t.ref}</span>
                      <Pill tone={t.priority === 'high' ? 'down' : t.priority === 'normal' ? 'info' : 'muted'}>{t.priority}</Pill>
                      <span className="text-xs text-muted-foreground">{t.channel}</span>
                    </div>
                    <p className="mt-0.5 truncate text-sm">{t.subject}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.customer} · {formatDateTime(t.createdAt)}</p>
                  </div>
                  <button onClick={() => setResolved((r) => ({ ...r, [t.id]: true }))}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground hover:opacity-90">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                  </button>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Satisfaction" icon={<Smile className="h-4 w-4" />}>
            <div className="flex flex-col items-center gap-3 py-2">
              <ProgressRing value={csat} label={`${csat}%`} sublabel="CSAT" />
              <p className="text-center text-sm text-muted-foreground">4.7 average from 312 reviews</p>
            </div>
          </Panel>

          <Panel title="Orders to follow up" icon={<PackageSearch className="h-4 w-4" />} action={<Pill tone="info">{followUps.length}</Pill>}>
            {followUps.length === 0 ? (
              <EmptyState label="No delivery or phone orders pending." />
            ) : (
              <div className="space-y-2">
                {followUps.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{s.customer?.name ?? s.reference}</p>
                      <p className="truncate text-xs capitalize text-muted-foreground">{s.channel.replace('-', ' ')} · {formatCedis(s.totals.total)}</p>
                    </div>
                    <a href={s.customer?.phone ? `tel:${s.customer.phone}` : undefined}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                      <Phone className="h-3.5 w-3.5" /> Call
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function rank(p: SupportTicket['priority']) { return p === 'high' ? 3 : p === 'normal' ? 2 : 1; }

/* --------------------------------------------------------------- shared pieces */

interface TillStats {
  count: number; rungUp: number; cashTaken: number; expectedDrawer: number;
  byMethod: Partial<Record<PaymentMethod, number>>;
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background/60 p-4 text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
      <span className="text-primary">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}

function Row({ label, value, tone, strong }: { label: string; value: string; tone?: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className={`text-sm ${tone ?? ''}`} style={strong ? { fontSize: '1.05rem' } : undefined}>{value}</dd>
    </div>
  );
}

function Kpi({ icon, label, value, tone = 'default', money, suffix }: {
  icon: React.ReactNode; label: string; value: number; money?: boolean; suffix?: string;
  tone?: 'ok' | 'warn' | 'info' | 'danger' | 'default';
}) {
  const toneClass =
    tone === 'ok' ? 'text-emerald-600' :
    tone === 'warn' ? 'text-amber-600' :
    tone === 'danger' ? 'text-red-600' :
    tone === 'info' ? 'text-primary' : 'text-foreground';
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: '1.9rem', lineHeight: 1.05 }}>
        <AnimatedCounter value={value} format={money ? (n) => formatCedis(n) : undefined} />{suffix && <span className="text-base">{suffix}</span>}
      </p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12, border: '1px solid var(--border)',
  background: 'var(--popover)', color: 'var(--popover-foreground)', fontSize: 12,
} as const;

export default FrontDeskDashboard;
