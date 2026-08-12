import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import {
  Loader2, Store, Calendar, Phone, MapPin, Truck, Search, LayoutGrid,
  ListChecks, Users, TrendingUp, Package, ChevronRight, CheckCircle2,
  Clock, RefreshCw, UserPlus, X,
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { BRANCHES } from '../../../lib/branches';
import {
  STATUS_LABEL, STATUS_COLOR, nextStatus, updateBranchOrderStatus,
  type BranchOrder, type OrderStatus,
} from '../../../lib/branch-orders';
import toast from 'react-hot-toast';

/**
 * Pro front-desk workspace. A showroom host juggles walk-ins, calls, pickups
 * and deliveries across branches, so the dashboard is organised like a real
 * desk: a live KPI strip up top, then tabbed tools — Today overview, a
 * searchable Order queue with one-tap status advance, an Appointments board,
 * a Call sheet ready to dial, and a quick Walk-in capture.
 */

type Tab = 'overview' | 'queue' | 'appointments' | 'calls' | 'walkin';

const TABS: { id: Tab; label: string; icon: typeof Store }[] = [
  { id: 'overview', label: 'Today', icon: LayoutGrid },
  { id: 'queue', label: 'Order queue', icon: ListChecks },
  { id: 'appointments', label: 'Appointments', icon: Calendar },
  { id: 'calls', label: 'Call sheet', icon: Phone },
  { id: 'walkin', label: 'Walk-in', icon: UserPlus },
];

function statusColor(s: string): string {
  return STATUS_COLOR[s as OrderStatus] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
}
function statusLabel(s: string): string {
  return STATUS_LABEL[s as OrderStatus] ?? s;
}
function itemCount(o: BranchOrder): number {
  return o.items?.reduce((n, it) => n + (it.quantity ?? 1), 0) ?? 0;
}

export function FrontDeskDashboard() {
  const [today, setToday] = useState<BranchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const todayIso = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('scheduledDate', '==', todayIso),
      orderBy('createdAt', 'desc'),
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setToday(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<BranchOrder, 'id'>) })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return unsub;
  }, [todayIso]);

  const pickupsToday = today.filter(o => o.fulfillmentType === 'pickup');
  const deliveriesToday = today.filter(o => o.fulfillmentType === 'delivery');
  const revenue = today.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const completed = today.filter(o => o.status === 'delivered').length;

  const byBranch = useMemo(() => {
    const m = new Map<string, BranchOrder[]>();
    today.forEach(o => {
      const key = o.branchSlug ?? 'unassigned';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(o);
    });
    return m;
  }, [today]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return today.filter(o => {
      if (branchFilter !== 'all' && (o.branchSlug ?? 'unassigned') !== branchFilter) return false;
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!s) return true;
      return (
        (o.shippingAddress?.fullName ?? '').toLowerCase().includes(s) ||
        (o.userEmail ?? '').toLowerCase().includes(s) ||
        (o.shippingAddress?.phone ?? '').toLowerCase().includes(s) ||
        o.id.toLowerCase().includes(s)
      );
    });
  }, [today, search, branchFilter, statusFilter]);

  const advance = async (o: BranchOrder) => {
    const ns = nextStatus(o.status, o.fulfillmentType ?? 'delivery');
    if (!ns) return;
    try {
      await updateBranchOrderStatus(o.id, ns);
      toast.success(`Marked ${STATUS_LABEL[ns]}`);
    } catch {
      toast.error('Could not update — try again');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-400 p-8">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading today's queue…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat icon={Package} label="Today total" value={today.length} tone="primary" />
        <Stat icon={Store} label="Pickups due" value={pickupsToday.length} tone="amber" />
        <Stat icon={Truck} label="Deliveries due" value={deliveriesToday.length} tone="violet" />
        <Stat icon={CheckCircle2} label="Completed" value={completed} tone="emerald" />
        <Stat icon={TrendingUp} label="Revenue (GH₵)" value={revenue.toLocaleString()} tone="primary" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 -mb-px">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                active ? 'border-primary text-primary' : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && <Overview byBranch={byBranch} todayIso={todayIso} />}

      {tab === 'queue' && (
        <Queue
          orders={filtered}
          search={search} setSearch={setSearch}
          branchFilter={branchFilter} setBranchFilter={setBranchFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          onAdvance={advance}
        />
      )}

      {tab === 'appointments' && <Appointments orders={today} />}

      {tab === 'calls' && <CallSheet orders={today} todayIso={todayIso} />}

      {tab === 'walkin' && <WalkIn />}
    </div>
  );
}

/* ---------- Overview ---------- */
function Overview({ byBranch, todayIso }: { byBranch: Map<string, BranchOrder[]>; todayIso: string }) {
  return (
    <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="font-bold mb-4 flex items-center gap-2"><Store className="w-4 h-4 text-primary" /> Today by branch · {todayIso}</h3>
      {byBranch.size === 0 ? (
        <EmptyState icon={Calendar} text="No orders scheduled for today yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...byBranch.entries()].map(([slug, list]) => (
            <motion.div
              key={slug}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="font-bold text-sm">{BRANCHES.find(b => b.slug === slug)?.name ?? slug}</div>
                <span className="text-xs font-semibold text-zinc-500">{list.length}</span>
              </div>
              <ul className="space-y-1.5">
                {list.slice(0, 6).map(o => (
                  <li key={o.id} className="text-xs flex items-center justify-between gap-2">
                    <span className="truncate flex items-center gap-1.5">
                      {o.fulfillmentType === 'pickup'
                        ? <Store className="w-3 h-3 text-amber-400 shrink-0" />
                        : <Truck className="w-3 h-3 text-violet-400 shrink-0" />}
                      {o.shippingAddress?.fullName ?? o.userEmail ?? 'Customer'}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                  </li>
                ))}
                {list.length > 6 && <li className="text-[11px] text-zinc-500 pt-0.5">+{list.length - 6} more</li>}
              </ul>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- Order queue ---------- */
function Queue({
  orders, search, setSearch, branchFilter, setBranchFilter, statusFilter, setStatusFilter, onAdvance,
}: {
  orders: BranchOrder[];
  search: string; setSearch: (v: string) => void;
  branchFilter: string; setBranchFilter: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  onAdvance: (o: BranchOrder) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone or order ID…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold">
          <option value="all">All branches</option>
          {BRANCHES.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold">
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={ListChecks} text="No orders match your filters." />
      ) : (
        <div className="space-y-2">
          {orders.map(o => {
            const ns = nextStatus(o.status, o.fulfillmentType ?? 'delivery');
            const count = itemCount(o);
            return (
              <motion.div
                key={o.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center gap-3"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${o.fulfillmentType === 'pickup' ? 'bg-amber-500/10 text-amber-400' : 'bg-violet-500/10 text-violet-400'}`}>
                  {o.fulfillmentType === 'pickup' ? <Store className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{o.shippingAddress?.fullName ?? o.userEmail ?? 'Customer'}</div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {BRANCHES.find(b => b.slug === o.branchSlug)?.name ?? '—'}
                    {o.total != null && <> · GH₵{o.total.toLocaleString()}</>}
                    {count > 0 && <> · {count} item{count === 1 ? '' : 's'}</>}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                {o.shippingAddress?.phone && (
                  <a href={`tel:${o.shippingAddress.phone}`} className="w-9 h-9 rounded-lg border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center shrink-0" title="Call">
                    <Phone className="w-4 h-4" />
                  </a>
                )}
                {ns ? (
                  <button onClick={() => onAdvance(o)}
                    className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold shrink-0 hover:opacity-90">
                    {STATUS_LABEL[ns]} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Done
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* ---------- Appointments ---------- */
function Appointments({ orders }: { orders: BranchOrder[] }) {
  const pickups = orders.filter(o => o.fulfillmentType === 'pickup');
  const deliveries = orders.filter(o => o.fulfillmentType === 'delivery');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Column title="Pickups" icon={Store} tone="amber" list={pickups} />
      <Column title="Deliveries" icon={Truck} tone="violet" list={deliveries} />
    </div>
  );
}

function Column({ title, icon: Icon, tone, list }: { title: string; icon: typeof Store; tone: string; list: BranchOrder[] }) {
  return (
    <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="font-bold mb-3 flex items-center gap-2"><Icon className={`w-4 h-4 text-${tone}-400`} /> {title} <span className="text-zinc-500 font-normal">· {list.length}</span></h3>
      {list.length === 0 ? (
        <EmptyState icon={Clock} text={`No ${title.toLowerCase()} scheduled.`} />
      ) : (
        <ul className="space-y-2">
          {list.map(o => (
            <li key={o.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-sm truncate">{o.shippingAddress?.fullName ?? o.userEmail ?? 'Customer'}</div>
                <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {o.shippingAddress?.city ?? BRANCHES.find(b => b.slug === o.branchSlug)?.name ?? '—'}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------- Call sheet ---------- */
function CallSheet({ orders, todayIso }: { orders: BranchOrder[]; todayIso: string }) {
  return (
    <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
      <h3 className="font-bold mb-3 flex items-center gap-2"><Phone className="w-4 h-4 text-primary" /> Customer call sheet · {todayIso}</h3>
      {orders.length === 0 ? (
        <EmptyState icon={Phone} text="Nothing scheduled." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-zinc-500 uppercase">
              <tr className="border-b border-zinc-800">
                <th className="py-2 pr-3">Customer</th><th className="pr-3">Branch</th>
                <th className="pr-3">Type</th><th className="pr-3">Status</th>
                <th className="pr-3">Phone</th><th>Address</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-zinc-800/60">
                  <td className="py-2 pr-3 font-medium">{o.shippingAddress?.fullName ?? o.userEmail ?? 'Customer'}</td>
                  <td className="pr-3 text-zinc-400">{BRANCHES.find(b => b.slug === o.branchSlug)?.name ?? '—'}</td>
                  <td className="pr-3 capitalize">{o.fulfillmentType ?? '—'}</td>
                  <td className="pr-3"><span className={`px-1.5 py-0.5 rounded text-[10px] border ${statusColor(o.status)}`}>{statusLabel(o.status)}</span></td>
                  <td className="pr-3">
                    {o.shippingAddress?.phone
                      ? <a className="text-primary font-semibold inline-flex items-center gap-1" href={`tel:${o.shippingAddress.phone}`}><Phone className="w-3 h-3" />{o.shippingAddress.phone}</a>
                      : <span className="text-zinc-500">—</span>}
                  </td>
                  <td className="text-zinc-400 max-w-[14rem]">
                    {o.shippingAddress?.street
                      ? <span className="flex items-start gap-1 truncate"><MapPin className="w-3 h-3 mt-0.5 shrink-0" />{o.shippingAddress.street}, {o.shippingAddress.city}</span>
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ---------- Walk-in capture ---------- */
function WalkIn() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [log, setLog] = useState<{ id: string; name: string; phone: string; reason: string; at: number }[]>([]);

  const add = () => {
    if (!name.trim()) { toast.error('Add a name'); return; }
    setLog(prev => [{ id: Math.random().toString(36).slice(2), name: name.trim(), phone: phone.trim(), reason: reason.trim(), at: Date.now() }, ...prev]);
    setName(''); setPhone(''); setReason('');
    toast.success('Walk-in logged');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2"><UserPlus className="w-4 h-4 text-primary" /> Log a walk-in enquiry</h3>
        <div className="space-y-3">
          <Field label="Customer name"><input value={name} onChange={e => setName(e.target.value)} className="ce-field" placeholder="e.g. Kwame Mensah" /></Field>
          <Field label="Phone"><input value={phone} onChange={e => setPhone(e.target.value)} className="ce-field" placeholder="024 000 0000" /></Field>
          <Field label="What do they need?"><textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="ce-field resize-none" placeholder="e.g. Quote for a 3kVA inverter + install" /></Field>
          <button onClick={add} className="w-full px-4 py-2.5 rounded-xl bg-primary text-white font-bold inline-flex items-center justify-center gap-2 hover:opacity-90">
            <UserPlus className="w-4 h-4" /> Log enquiry
          </button>
        </div>
        <style>{`.ce-field{width:100%;padding:0.625rem 0.75rem;border-radius:0.75rem;background:rgb(9 9 11);border:1px solid rgb(39 39 42);font-size:0.875rem;color:white;outline:none}.ce-field:focus{border-color:var(--primary)}`}</style>
      </section>

      <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2"><Users className="w-4 h-4 text-primary" /> Today's walk-ins <span className="text-zinc-500 font-normal">· {log.length}</span></h3>
          {log.length > 0 && (
            <button onClick={() => setLog([])} className="text-xs text-zinc-500 hover:text-white inline-flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Clear</button>
          )}
        </div>
        {log.length === 0 ? (
          <EmptyState icon={UserPlus} text="No walk-ins logged yet this session." />
        ) : (
          <ul className="space-y-2">
            {log.map(w => (
              <li key={w.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{w.name}</div>
                  {w.reason && <div className="text-xs text-zinc-400">{w.reason}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {w.phone && <a href={`tel:${w.phone}`} className="text-primary text-xs font-semibold inline-flex items-center gap-1"><Phone className="w-3 h-3" />{w.phone}</a>}
                  <button onClick={() => setLog(prev => prev.filter(x => x.id !== w.id))} className="text-zinc-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-zinc-500">This log is for your shift. Convert serious enquiries into orders from the branch dashboard.</p>
      </section>
    </div>
  );
}

/* ---------- shared bits ---------- */
const TONE: Record<string, string> = {
  primary: 'text-primary bg-primary/10',
  amber: 'text-amber-400 bg-amber-500/10',
  violet: 'text-violet-400 bg-violet-500/10',
  emerald: 'text-emerald-400 bg-emerald-500/10',
};

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Store; label: string; value: number | string; tone: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${TONE[tone] ?? TONE.primary}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="text-2xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold mb-1">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Store; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3">
        <Icon className="w-5 h-5 text-zinc-500" />
      </div>
      <p className="text-sm text-zinc-400">{text}</p>
    </div>
  );
}
