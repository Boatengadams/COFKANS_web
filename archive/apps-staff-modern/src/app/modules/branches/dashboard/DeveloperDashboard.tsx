/**
 * COFKANS ELECTRICALS ERP — Developer / System Console.
 *
 * The platform owner's cockpit — a different application from the business
 * dashboards. Surfaces system health, subsystem status, the demo data layer
 * (record counts + storage footprint with per-store reset), a request-traffic
 * chart, feature flags, and a live system event log derived from real store
 * activity. Backend-free — everything reads the module's localStorage stores.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  TerminalSquare, Activity, Database, Gauge, ShieldCheck, Zap, Cpu,
  HardDrive, RefreshCw, Trash2, CheckCircle2, AlertTriangle, GitBranch,
  ServerCog, ToggleLeft, ToggleRight, Radio,
} from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { useSales } from '../hooks/useSales';
import { useTransfers, useStockAlerts } from '../hooks/useTransfers';
import { listInventory } from '../services/inventoryService';
import { STORE_KEYS, STORE_EVENT } from '../services/storage';
import { formatDateTime } from '../utils/format';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, DataTable, type DataColumn,
} from '../components/ui/pro';

const DAY = 86_400_000;
const BUILD = 'v4.8.0';

/** Deterministic pseudo-random in [0,1) from an integer seed. */
function rand(seed: number) {
  const x = Math.sin(seed * 999.13) * 43758.5453;
  return x - Math.floor(x);
}

function byteSize(key: string): number {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    return raw ? new Blob([raw]).size : 0;
  } catch { return 0; }
}
function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

interface EventRow { id: string; time: string; kind: string; detail: string; level: 'info' | 'warn' | 'ok' }

export function DeveloperDashboard() {
  const branches = useBranches();
  const sales = useSales();
  const transfers = useTransfers();
  const alerts = useStockAlerts();
  const [, force] = useState(0);

  const inventoryCount = useMemo(
    () => branches.reduce((n, b) => n + listInventory(b.slug).length, 0),
    [branches],
  );

  const stores = useMemo(() => ([
    { key: STORE_KEYS.branches, label: 'Branches', count: branches.length },
    { key: STORE_KEYS.inventory, label: 'Inventory', count: inventoryCount },
    { key: STORE_KEYS.sales, label: 'Sales', count: sales.length },
    { key: STORE_KEYS.transfers, label: 'Transfers', count: transfers.length },
    { key: STORE_KEYS.alerts, label: 'Stock alerts', count: alerts.length },
    { key: STORE_KEYS.catalog, label: 'Catalog', count: undefined as number | undefined },
  ].map((s) => ({ ...s, size: byteSize(s.key) }))), [branches, inventoryCount, sales.length, transfers.length, alerts.length]);

  const totalRecords = branches.length + inventoryCount + sales.length + transfers.length + alerts.length;
  const totalSize = stores.reduce((n, s) => n + s.size, 0);

  // Deterministic-ish live-feeling health metrics.
  const health = useMemo(() => {
    const seed = Math.floor(Date.now() / 60000); // changes each minute
    return {
      latency: 60 + Math.round(rand(seed) * 40),        // ms
      errorRate: (rand(seed + 1) * 0.4).toFixed(2),      // %
      cpu: 20 + Math.round(rand(seed + 2) * 30),         // %
      uptime: 99.9,
    };
  }, []);

  // 7-day API request traffic (deterministic mock).
  const traffic = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const ts = today.getTime() - (6 - i) * DAY;
      const label = new Date(ts).toLocaleDateString('en-GB', { weekday: 'short' });
      return {
        label,
        requests: 800 + Math.round(rand(i + 3) * 2200),
        errors: Math.round(rand(i + 9) * 30),
      };
    });
  }, []);

  const subsystems = [
    { name: 'Authentication', icon: <ShieldCheck className="h-4 w-4" />, status: 'operational', latency: `${health.latency}ms` },
    { name: 'Data store', icon: <Database className="h-4 w-4" />, status: 'operational', latency: '4ms' },
    { name: 'Sales engine', icon: <Zap className="h-4 w-4" />, status: 'operational', latency: '11ms' },
    { name: 'Transfer service', icon: <ServerCog className="h-4 w-4" />, status: 'operational', latency: '9ms' },
    { name: 'Inventory sync', icon: <RefreshCw className="h-4 w-4" />, status: alerts.filter((a) => a.status === 'pending').length > 5 ? 'degraded' : 'operational', latency: '18ms' },
    { name: 'Storefront', icon: <Radio className="h-4 w-4" />, status: 'operational', latency: '72ms' },
  ] as const;

  const [flags, setFlags] = useState<Record<string, boolean>>({
    'ERP green theme': true,
    'POS split payment': true,
    'AI insights (beta)': false,
    'Command palette (⌘K)': false,
    'Realtime sync': true,
  });

  // Live event log derived from real store activity (most recent first).
  const events = useMemo<EventRow[]>(() => {
    const rows: EventRow[] = [];
    for (const s of sales.slice(0, 12)) rows.push({ id: `s-${s.id}`, time: s.soldAt, kind: 'sale.created', detail: `${s.reference} · ${s.branchSlug}`, level: 'ok' });
    for (const t of transfers.slice(0, 10)) rows.push({ id: `t-${t.id}`, time: t.createdAt, kind: `transfer.${t.status}`, detail: `${t.fromBranch} → ${t.toBranch}`, level: t.status === 'cancelled' ? 'warn' : 'info' });
    for (const a of alerts.slice(0, 10)) rows.push({ id: `a-${a.id}`, time: a.raisedAt, kind: 'alert.raised', detail: `${a.name} · ${a.branchSlug}`, level: a.status === 'pending' ? 'warn' : 'info' });
    return rows.sort((x, y) => new Date(y.time).getTime() - new Date(x.time).getTime()).slice(0, 20);
  }, [sales, transfers, alerts]);

  function resetStore(key: string) {
    try {
      window.localStorage.removeItem(key);
      window.dispatchEvent(new Event(STORE_EVENT));
      window.dispatchEvent(new Event('storage'));
    } catch { /* ignore */ }
    force((n) => n + 1);
  }
  function resetAll() {
    Object.values(STORE_KEYS).forEach((k) => { try { window.localStorage.removeItem(k); } catch { /* ignore */ } });
    window.dispatchEvent(new Event(STORE_EVENT));
    window.dispatchEvent(new Event('storage'));
    force((n) => n + 1);
  }

  // Re-read store sizes when data changes.
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    window.addEventListener(STORE_EVENT, fn);
    return () => window.removeEventListener(STORE_EVENT, fn);
  }, []);

  const eventColumns: DataColumn<EventRow>[] = [
    { key: 'time', header: 'Time', value: (r) => r.time, render: (r) => <span className="text-muted-foreground">{formatDateTime(r.time)}</span>, sortable: true },
    { key: 'kind', header: 'Event', value: (r) => r.kind, render: (r) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{r.kind}</code> },
    { key: 'detail', header: 'Detail', value: (r) => r.detail },
    { key: 'level', header: 'Level', align: 'right', value: (r) => r.level,
      render: (r) => <Pill tone={r.level === 'ok' ? 'up' : r.level === 'warn' ? 'warn' : 'info'}>{r.level}</Pill> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<TerminalSquare className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Platform · System Console"
          title="Developer Console"
          subtitle={<span className="inline-flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1"><GitBranch className="h-3.5 w-3.5" /> main · {BUILD}</span>
            · demo runtime · {totalRecords.toLocaleString()} records
          </span>}
          actions={
            <button onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-3.5 py-2 text-sm transition-colors hover:border-red-500/50 hover:text-red-600">
              <Trash2 className="h-4 w-4" /> Reset demo data
            </button>
          }
        />

        {/* Health KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi icon={<Activity className="h-4 w-4" />} label="API latency" value={health.latency} suffix="ms" tone="ok" />
          <Kpi icon={<AlertTriangle className="h-4 w-4" />} label="Error rate" value={Number(health.errorRate)} suffix="%" decimals={2} tone="info" />
          <Kpi icon={<Cpu className="h-4 w-4" />} label="CPU load" value={health.cpu} suffix="%" tone="warn" />
          <Kpi icon={<Gauge className="h-4 w-4" />} label="Uptime" value={health.uptime} suffix="%" decimals={1} tone="ok" />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Traffic chart */}
          <Panel title="API traffic · 7 days" icon={<Activity className="h-4 w-4" />} className="xl:col-span-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={traffic} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs key="defs">
                    <linearGradient id="devReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis key="x" dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis key="y" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip key="tip" contentStyle={tooltipStyle} cursor={{ stroke: 'var(--border)' }} />
                  <Area key="req" type="monotone" dataKey="requests" name="Requests" stroke="#0F5132" strokeWidth={2} fill="url(#devReq)" />
                  <Area key="err" type="monotone" dataKey="errors" name="Errors" stroke="#EF4444" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Subsystem status */}
          <Panel title="Platform status" icon={<ServerCog className="h-4 w-4" />}
            action={<Pill tone={subsystems.some((s) => s.status !== 'operational') ? 'warn' : 'up'}>
              {subsystems.every((s) => s.status === 'operational') ? 'All systems go' : 'Degraded'}
            </Pill>}>
            <div className="space-y-2">
              {subsystems.map((s) => (
                <div key={s.name} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-2.5">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{s.icon}</span>{s.name}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{s.latency}</span>
                    {s.status === 'operational'
                      ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />OK</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-amber-600"><AlertTriangle className="h-3.5 w-3.5" />Degraded</span>}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Data layer */}
          <Panel title="Data layer" icon={<Database className="h-4 w-4" />} className="xl:col-span-2"
            action={<Pill tone="muted">{fmtBytes(totalSize)} used</Pill>}>
            <div className="space-y-2">
              {stores.map((s) => (
                <div key={s.key} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm">{s.label}</p>
                    <p className="truncate text-xs text-muted-foreground"><code>{s.key}</code></p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm">{s.count != null ? s.count.toLocaleString() : '—'} <span className="text-xs text-muted-foreground">rows</span></p>
                      <p className="text-xs text-muted-foreground">{fmtBytes(s.size)}</p>
                    </div>
                    <button onClick={() => resetStore(s.key)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-500/50 hover:text-red-600">
                      <RefreshCw className="h-3.5 w-3.5" /> Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" /> Stores re-seed from mock data on next read after a reset.
            </div>
          </Panel>

          {/* Feature flags */}
          <Panel title="Feature flags" icon={<ToggleRight className="h-4 w-4" />}>
            <div className="space-y-1">
              {Object.entries(flags).map(([name, on]) => (
                <button key={name} onClick={() => setFlags((f) => ({ ...f, [name]: !f[name] }))}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60">
                  <span>{name}</span>
                  {on
                    ? <ToggleRight className="h-6 w-6 text-emerald-600" />
                    : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                </button>
              ))}
            </div>
          </Panel>
        </div>

        {/* System event log */}
        <Panel title="System event log" icon={<TerminalSquare className="h-4 w-4" />}
          action={<Pill tone="muted">{events.length} events</Pill>}>
          {events.length === 0 ? (
            <EmptyState label="No system events yet." />
          ) : (
            <DataTable columns={eventColumns} rows={events} getRowId={(r) => r.id} csvName="system-events" minWidth={640} maxHeight={420} />
          )}
        </Panel>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Kpi({ icon, label, value, suffix, decimals = 0, tone = 'default' }: {
  icon: React.ReactNode; label: string; value: number; suffix?: string; decimals?: number;
  tone?: 'ok' | 'warn' | 'info' | 'default';
}) {
  const toneClass =
    tone === 'ok' ? 'text-emerald-600' :
    tone === 'warn' ? 'text-amber-600' :
    tone === 'info' ? 'text-primary' : 'text-foreground';
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: '1.9rem', lineHeight: 1.05 }}>
        <AnimatedCounter value={value} format={(n) => n.toFixed(decimals)} />{suffix && <span className="text-base">{suffix}</span>}
      </p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--popover)',
  color: 'var(--popover-foreground)',
  fontSize: 12,
} as const;

export default DeveloperDashboard;
