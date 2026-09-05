import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight, AlertCircle, Inbox } from 'lucide-react'
import { useManagerCollection, type ManagerRecord } from '../../../src/app/pages/manager-figma/manager-live-data'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

/* ─────────────────────────────────────────────────────────────────
   Design tokens — Cofkans Electricals brand
   Purple = brand / emphasis. Green = positive delta only.
   Red = alert / negative. Amber = warning.
   ───────────────────────────────────────────────────────────────── */

const COLOR = {
  brand: '#4F3FF0',
  brandDim: 'rgba(79,63,240,0.12)',
  ink: '#0A0F1E',
  body: '#334155',
  muted: '#64748B',
  faint: '#94A3B8',
  line: 'rgba(10,15,30,0.06)',
  lineSoft: 'rgba(10,15,30,0.04)',
  surface: '#fff',
  wash: '#F8F9FC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  up: '#16A34A',
  upBg: '#F0FDF4',
  down: '#DC2626',
  downBg: '#FEF2F2',
  warn: '#D97706',
  warnBg: '#FFFBEB',
}

const FONT = {
  display: `'Fraunces', Georgia, serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`,
  mono: `'IBM Plex Mono', 'SFMono-Regular', monospace`,
}

/* ─────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────── */

type Range = 'Today' | 'Week' | 'Month' | 'Year'

interface SeriesPoint { x: string; sales: number; profit: number }
interface Branch { name: string; sales: number; target: number; change: number; offline?: boolean }
interface StockItem { name: string; sku: string; branch: string; qty: number; reorderAt: number }
interface ActivityEvent { time: string; action: string; user: string; ref: string; icon: LucideIcon }
type Tone = 'up' | 'down' | 'warn' | 'alert' | 'neutral'

/* ─────────────────────────────────────────────────────────────────
   Data — wire these to Firestore. All reset to empty/zero for now.
   ───────────────────────────────────────────────────────────────── */

const RANGES: Range[] = ['Today', 'Week', 'Month', 'Year']

const RANGE_CONFIG: Record<Range, { n: number; label: (i: number) => string; target: number; secondaryLabel: string }> = {
  Today: { n: 24, target: 0, secondaryLabel: 'This Hour', label: i => `${i}:00` },
  Week: { n: 7, target: 0, secondaryLabel: 'Today', label: i => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] },
  Month: { n: 30, target: 0, secondaryLabel: 'Today', label: i => String(i + 1) },
  Year: { n: 12, target: 0, secondaryLabel: 'This Month', label: i => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i] },
}

/* ─────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────── */

const fmtGHS = (n: number) => `GH₵ ${Math.round(n).toLocaleString()}`
const fmtCompact = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${Math.round(n)}`)
const stockPct = (item: StockItem) => (item.reorderAt > 0 ? Math.min(100, Math.round((item.qty / item.reorderAt) * 100)) : 0)

function recordNumber(record: ManagerRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return 0
}

function recordDate(record: ManagerRecord) {
  const value = record.createdAt ?? record.date ?? record.timestamp ?? record.updatedAt
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  const date = value ? new Date(String(value)) : new Date(0)
  return Number.isNaN(date.getTime()) ? new Date(0) : date
}

function buildSeries(range: Range, orders: ManagerRecord[]): SeriesPoint[] {
  const cfg = RANGE_CONFIG[range]
  const now = new Date()
  const buckets = Array.from({ length: cfg.n }, (_, i) => ({ x: cfg.label(i), sales: 0, profit: 0 }))
  for (const order of orders) {
    const date = recordDate(order)
    const amount = recordNumber(order, 'total', 'amount', 'revenue', 'subtotal')
    if (!amount || date.getTime() === 0) continue
    let index = -1
    if (range === 'Today' && date.toDateString() === now.toDateString()) index = date.getHours()
    if (range === 'Week') {
      const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0)
      index = Math.floor((date.getTime() - monday.getTime()) / 86400000)
    }
    if (range === 'Month' && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) index = date.getDate() - 1
    if (range === 'Year' && date.getFullYear() === now.getFullYear()) index = date.getMonth()
    if (index >= 0 && index < buckets.length) {
      buckets[index].sales += amount
      buckets[index].profit += recordNumber(order, 'profit', 'netProfit') || amount * 0.2
    }
  }
  return buckets
}

/* ─────────────────────────────────────────────────────────────────
   Shared primitives
   ───────────────────────────────────────────────────────────────── */

function SectionHeader({ eyebrow, title, right }: { eyebrow: string; title: string; right?: React.ReactNode }) {
  return (
    <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3 style={{ fontFamily: FONT.body, fontSize: 15, fontWeight: 600, color: COLOR.ink, margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>
      </div>
      {right}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: COLOR.line, margin: '0 20px' }} />
}

/** Signature element: a thin PCB-style trace divider — a quiet nod to Cofkans' electrical trade. */
function CircuitDivider() {
  return (
    <svg width="100%" height="14" viewBox="0 0 400 14" preserveAspectRatio="none" style={{ display: 'block', margin: '4px 0' }} aria-hidden="true">
      <line x1="0" y1="7" x2="400" y2="7" stroke={COLOR.line} strokeWidth="1" />
      {[40, 140, 260, 360].map((x, i) => (
        <rect key={i} x={x - 3} y="4" width="6" height="6" rx="1" fill={i === 1 ? COLOR.brand : COLOR.slate300} opacity={i === 1 ? 0.9 : 0.6} />
      ))}
    </svg>
  )
}

function TrendPill({ value, tone, size = 'sm' }: { value: string; tone: Tone; size?: 'sm' | 'md' }) {
  const map: Record<Tone, { bg: string; fg: string }> = {
    up: { bg: COLOR.upBg, fg: COLOR.up },
    down: { bg: COLOR.downBg, fg: COLOR.down },
    warn: { bg: COLOR.warnBg, fg: COLOR.warn },
    alert: { bg: COLOR.downBg, fg: COLOR.down },
    neutral: { bg: COLOR.wash, fg: COLOR.faint },
  }
  const { bg, fg } = map[tone]
  const Icon = tone === 'alert' ? AlertCircle : tone === 'down' ? ArrowDownRight : ArrowUpRight
  const showIcon = tone === 'up' || tone === 'down' || tone === 'alert'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: size === 'sm' ? '2px 7px' : '3px 8px', borderRadius: size === 'sm' ? 5 : 6, fontFamily: FONT.mono, fontSize: size === 'sm' ? 10 : 12, fontWeight: 600, background: bg, color: fg }}>
      {showIcon && <Icon size={size === 'sm' ? 9 : 12} />}
      {value}
    </span>
  )
}

function ProgressBar({ pct, tone = 'brand' }: { pct: number; tone?: 'brand' | 'muted' }) {
  return (
    <div style={{ height: 3, borderRadius: 2, background: COLOR.slate100, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: tone === 'brand' ? COLOR.brand : COLOR.slate300, transition: 'width 0.6s ease' }} />
    </div>
  )
}

/** Consistent empty state for any list-driven card. Names what's missing and implies the fix. */
function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <Inbox size={20} style={{ color: COLOR.slate300 }} />
      <p style={{ fontSize: 12, color: COLOR.faint, margin: 0, maxWidth: 230, lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}

function ChartTip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: COLOR.ink, borderRadius: 8, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ fontFamily: FONT.mono, fontSize: 10, color: COLOR.faint }}>{p.name}</span>
          <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 600, color: '#F1F5F9' }}>{fmtGHS(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────────── */

export default function Dashboard() {
  const [range, setRange] = useState<Range>('Month')
  const ordersSource = useManagerCollection('orders')
  const productsSource = useManagerCollection('products')
  const staffSource = useManagerCollection('staffAccounts')
  const branchesSource = useManagerCollection('branches')
  const approvalsSource = useManagerCollection('approvals')
  const activitySource = useManagerCollection('auditLogs')
  const orders = ordersSource.rows
  const products = productsSource.rows
  const branches = useMemo<Branch[]>(() => branchesSource.rows.map(row => ({
    name: String(row.name ?? row.branchName ?? row.slug ?? row.id),
    sales: recordNumber(row, 'sales', 'monthlySales', 'revenue', 'todaySales'),
    target: recordNumber(row, 'target', 'monthlyTarget', 'salesTarget'),
    change: recordNumber(row, 'change', 'growth', 'percentChange'),
    offline: row.status === 'offline' || row.active === false,
  })), [branchesSource.rows])
  const lowStock = useMemo<StockItem[]>(() => products.flatMap(row => {
    const qty = recordNumber(row, 'totalStock', 'stock', 'quantity', 'qty')
    const reorderAt = recordNumber(row, 'lowStockThreshold', 'reorderAt', 'reorderLevel')
    return reorderAt > 0 && qty <= reorderAt ? [{
      name: String(row.name ?? row.title ?? row.id), sku: String(row.sku ?? row.id),
      branch: String(row.branchSlug ?? row.branch ?? 'All branches'), qty, reorderAt,
    }] : []
  }), [products])
  const category = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of orders) for (const item of Array.isArray(row.items) ? row.items as ManagerRecord[] : []) {
      const name = String(item.categoryName ?? item.category ?? 'Other')
      totals.set(name, (totals.get(name) ?? 0) + recordNumber(item, 'subtotal', 'price') * (recordNumber(item, 'quantity') || 1))
    }
    const total = [...totals.values()].reduce((sum, value) => sum + value, 0)
    const colors = [COLOR.brand, '#94A3B8', '#CBD5E1', '#E2E8F0', '#F1F5F9']
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({ name, value: total ? Math.round(value / total * 100) : 0, color: colors[i] }))
  }, [orders])
  const activity = useMemo<ActivityEvent[]>(() => activitySource.rows.slice().sort((a, b) => recordDate(b).getTime() - recordDate(a).getTime()).slice(0, 5).map(row => ({
    time: recordDate(row).getTime() ? recordDate(row).toLocaleString() : '—',
    action: String(row.action ?? row.event ?? row.type ?? 'Activity recorded'),
    user: String(row.userName ?? row.actorName ?? row.userEmail ?? 'System'),
    ref: String(row.reference ?? row.ref ?? row.id), icon: Inbox,
  })), [activitySource.rows])
  const snapshot = useMemo(() => ({
    activeStaff: staffSource.rows.filter(row => row.active !== false).length,
    inventoryValue: products.reduce((sum, row) => sum + recordNumber(row, 'costPrice', 'price') * recordNumber(row, 'totalStock', 'stock', 'quantity'), 0),
    pendingApprovals: approvalsSource.rows.filter(row => String(row.status ?? 'pending').toLowerCase() === 'pending').length,
    avgOrderValue: orders.length ? orders.reduce((sum, row) => sum + recordNumber(row, 'total', 'amount', 'revenue'), 0) / orders.length : 0,
  }), [approvalsSource.rows, orders, products, staffSource.rows])
  const series = useMemo(() => buildSeries(range, orders), [range, orders])
  const dataLoading = ordersSource.loading || productsSource.loading || staffSource.loading || branchesSource.loading
  const dataError = [ordersSource, productsSource, staffSource, branchesSource].some(source => source.error)
  const cfg = RANGE_CONFIG[range]

  const revenue = useMemo(() => series.reduce((s, p) => s + p.sales, 0), [series])
  const profit = useMemo(() => series.reduce((s, p) => s + p.profit, 0), [series])
  const target = branches.reduce((sum, branch) => sum + branch.target, 0)
  const targetPct = target > 0 ? Math.min(100, Math.round((revenue / target) * 100)) : 0
  const latestSales = series[series.length - 1]?.sales ?? 0
  const hasSales = revenue > 0
  const today = new Date().toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })
  const xInterval = range === 'Today' ? 3 : range === 'Month' ? 4 : 0

  const lowerStrip: { label: string; value: string; sub: string }[] = [
    { label: 'Active Staff', value: dataLoading ? '…' : String(snapshot.activeStaff), sub: 'From staffAccounts' },
    { label: 'Inventory Value', value: dataLoading ? '…' : fmtGHS(snapshot.inventoryValue), sub: 'From products' },
    { label: 'Pending Approvals', value: dataLoading ? '…' : String(snapshot.pendingApprovals), sub: 'From approvals' },
    { label: 'Avg. Order Value', value: dataLoading ? '…' : fmtGHS(snapshot.avgOrderValue), sub: 'From orders' },
  ]

  return (
    <div style={{ padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', gap: 16, fontFamily: FONT.body, background: COLOR.wash }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        .eyebrow { font-family: ${FONT.body}; font-size: 10.5px; font-weight: 600; color: ${COLOR.faint}; letter-spacing: 0.07em; margin: 0 0 4px; text-transform: uppercase; }
        .card { background: ${COLOR.surface}; border-radius: 12px; box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.06); }
        .card--lift { transition: box-shadow 0.2s ease, transform 0.2s ease; }
        .card--lift:hover { box-shadow: 0 0 0 1px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.1); transform: translateY(-1px); }
        .row-hover { transition: background 0.12s ease; }
        .row-hover:hover { background: ${COLOR.wash}; }
        .range-btn { font-family: ${FONT.body}; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; border: none; cursor: pointer; background: transparent; color: ${COLOR.faint}; transition: all 0.15s ease; }
        .range-btn.active { background: #fff; color: ${COLOR.ink}; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .range-btn:focus-visible, .link-btn:focus-visible { outline: 2px solid ${COLOR.brand}; outline-offset: 2px; }
        .link-btn { font-family: ${FONT.body}; font-size: 12px; font-weight: 500; color: ${COLOR.brand}; background: none; border: none; cursor: pointer; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 900px) {
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-2 { grid-template-columns: 1fr; }
          .hero-kpis { grid-template-columns: 1fr !important; }
          .hero-kpi-item { border-left: none !important; margin-left: 0 !important; padding-left: 0 !important; border-top: 1px solid ${COLOR.line}; padding-top: 12px !important; }
        }
        @media (max-width: 560px) {
          .grid-4 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p className="eyebrow">{today} · All Branches</p>
          <h1 style={{ fontFamily: FONT.display, fontSize: 24, fontWeight: 600, color: COLOR.ink, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            Good morning.
          </h1>
          {dataError && <p style={{ fontSize: 11, color: COLOR.warn, margin: '5px 0 0' }}>Some Firebase data could not be loaded.</p>}
        </div>
        <div role="group" aria-label="Date range" style={{ display: 'flex', gap: 1, background: 'rgba(0,0,0,0.07)', borderRadius: 8, padding: 2 }}>
          {RANGES.map(r => (
            <button key={r} aria-pressed={range === r} onClick={() => setRange(r)} className={`range-btn ${range === r ? 'active' : ''}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* ── Revenue Hero ─────────────────────────────────────────── */}
      <div className="card">
        <div className="hero-kpis" style={{ padding: '20px 24px 16px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: 0, alignItems: 'start' }}>
          <div>
            <p className="eyebrow">{range} Revenue</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 36, fontWeight: 700, color: COLOR.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {fmtGHS(revenue)}
              </span>
              <TrendPill value="No data yet" tone="neutral" size="md" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
              <div style={{ flex: 1, maxWidth: 260 }}><ProgressBar pct={targetPct} tone="muted" /></div>
              <span style={{ fontSize: 11, color: COLOR.faint, whiteSpace: 'nowrap' }}>
                {target > 0 ? `${targetPct}% of ${fmtGHS(target)} target` : 'Set a target to track progress'}
              </span>
            </div>
          </div>

          {[
            { label: cfg.secondaryLabel, value: fmtGHS(latestSales) },
            { label: 'Net Profit', value: fmtGHS(profit) },
            { label: 'Orders', value: orders.length.toLocaleString() },
          ].map(kpi => (
            <div key={kpi.label} className="hero-kpi-item" style={{ padding: '0 0 0 28px', borderLeft: `1px solid ${COLOR.line}`, marginLeft: 28 }}>
              <p className="eyebrow">{kpi.label}</p>
              <div style={{ fontFamily: FONT.mono, fontSize: 17, fontWeight: 700, color: COLOR.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ marginTop: 5 }}><TrendPill value="—" tone="neutral" /></div>
            </div>
          ))}
        </div>

        <Divider />

        <div style={{ padding: '16px 16px 8px' }}>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={series} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR.brand} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={COLOR.brand} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR.faint} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={COLOR.faint} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke={COLOR.lineSoft} vertical={false} />
                <XAxis dataKey="x" tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: COLOR.slate300 }} tickLine={false} axisLine={false} interval={xInterval} />
                <YAxis tick={{ fontFamily: 'IBM Plex Mono', fontSize: 9, fill: COLOR.slate300 }} tickLine={false} axisLine={false} tickFormatter={v => fmtCompact(v)} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="sales" name="Sales" stroke={COLOR.brand} strokeWidth={2} fill="url(#gSales)" dot={false} activeDot={{ r: 3, fill: COLOR.brand, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke={COLOR.faint} strokeWidth={1.5} fill="url(#gProfit)" dot={false} activeDot={{ r: 3, fill: COLOR.faint, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
            {!hasSales && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <p style={{ fontSize: 12, color: COLOR.faint, background: 'rgba(255,255,255,0.9)', padding: '6px 14px', borderRadius: 20, margin: 0 }}>No sales data for this period</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 16, paddingLeft: 8, marginTop: 2 }}>
            {[{ c: COLOR.brand, l: 'Revenue' }, { c: COLOR.faint, l: 'Profit' }].map(({ c, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 20, height: 2, background: c, display: 'inline-block', borderRadius: 1 }} />
                <span style={{ fontSize: 11, color: COLOR.faint }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Lower KPI strip ──────────────────────────────────────── */}
      <div className="grid-4">
        {lowerStrip.map(({ label, value, sub }) => (
          <div key={label} className="card card--lift" style={{ padding: '16px 18px' }}>
            <p className="eyebrow">{label}</p>
            <div style={{ fontFamily: FONT.mono, fontSize: 25, fontWeight: 700, color: COLOR.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
            <p style={{ fontSize: 11, color: COLOR.faint, margin: '5px 0 8px', lineHeight: 1.4 }}>{sub}</p>
            <TrendPill value="—" tone="neutral" />
          </div>
        ))}
      </div>

      {/* ── Branch + Category/Stock ──────────────────────────────── */}
      <div className="grid-2">
        <div className="card">
          <SectionHeader
            eyebrow="Branch Rankings"
            title="Monthly performance"
            right={<span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: COLOR.brandDim, color: COLOR.brand, letterSpacing: '0.05em' }}>LIVE</span>}
          />
          <Divider />
          {branches.length === 0 ? (
            <EmptyState message="No branches added yet. Branches will appear here once connected to your data source." />
          ) : (
            <div style={{ padding: '6px 0' }}>
              {branches.map((b, i) => {
                const pct = b.target > 0 ? Math.min(100, Math.round((b.sales / b.target) * 100)) : 0
                return (
                  <div key={b.name} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '9px 20px' }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 700, color: i === 0 ? COLOR.brand : COLOR.slate300, width: 14, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: b.offline ? COLOR.slate300 : COLOR.ink, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                        {b.offline && <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: COLOR.downBg, color: COLOR.down, flexShrink: 0 }}>OFFLINE</span>}
                      </div>
                      <ProgressBar pct={pct} tone={i === 0 ? 'brand' : 'muted'} />
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: b.offline ? COLOR.slate200 : COLOR.ink, letterSpacing: '-0.02em' }}>
                        {b.offline ? '—' : `GH₵ ${fmtCompact(b.sales)}`}
                      </div>
                      {!b.offline && (
                        <div style={{ marginTop: 3 }}>
                          <TrendPill value={`${Math.abs(b.change)}%`} tone={b.change >= 0 ? 'up' : 'down'} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <SectionHeader eyebrow="Category Mix" title="Revenue by product line" />
            <Divider />
            {category.length === 0 ? (
              <EmptyState message="No category data yet. This fills in once products are tagged and sold." />
            ) : (
              <div style={{ padding: '16px 20px 18px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ position: 'relative', flexShrink: 0, width: 96, height: 96 }}>
                  <ResponsiveContainer width={96} height={96}>
                    <PieChart>
                      <Pie data={category} cx="50%" cy="50%" innerRadius={32} outerRadius={46} dataKey="value" paddingAngle={2} strokeWidth={0}>
                        {category.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontFamily: FONT.mono, fontSize: 17, fontWeight: 700, color: COLOR.ink, letterSpacing: '-0.02em', lineHeight: 1 }}>{category[0].value}%</span>
                    <span style={{ fontSize: 8.5, color: COLOR.faint, marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>{category[0].name}</span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {category.map(c => (
                    <div key={c.name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                          <span style={{ width: 7, height: 7, borderRadius: 2, background: c.color, display: 'inline-block', flexShrink: 0, border: c.color === COLOR.slate100 ? `1px solid ${COLOR.slate200}` : 'none' }} />
                          <span style={{ fontSize: 11, color: COLOR.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                        </div>
                        <span style={{ fontFamily: FONT.mono, fontSize: 11, fontWeight: 600, color: COLOR.ink, flexShrink: 0 }}>{c.value}%</span>
                      </div>
                      <ProgressBar pct={c.value} tone="muted" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <SectionHeader
              eyebrow="Inventory"
              title="Low stock"
              right={<span style={{ fontFamily: FONT.mono, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: COLOR.slate100, color: COLOR.faint, letterSpacing: '0.05em' }}>{lowStock.length}</span>}
            />
            <Divider />
            {lowStock.length === 0 ? (
              <EmptyState message="No inventory data yet. Low-stock items will surface here automatically." />
            ) : (
              <div style={{ padding: '4px 0 8px' }}>
                {lowStock.map(item => (
                  <div key={item.sku} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: COLOR.ink, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: COLOR.slate100, color: COLOR.faint, flexShrink: 0 }}>{item.branch}</span>
                      </div>
                      <ProgressBar pct={stockPct(item)} tone="muted" />
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <div style={{ fontFamily: FONT.mono, fontSize: 13, fontWeight: 700, color: COLOR.down, letterSpacing: '-0.02em' }}>{item.qty} left</div>
                      <div style={{ fontFamily: FONT.mono, fontSize: 9, color: COLOR.faint, marginTop: 2 }}>reorder at {item.reorderAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Activity ─────────────────────────────────────────────── */}
      <div className="card">
        <SectionHeader eyebrow="Activity Log" title="Recent events" right={<button className="link-btn">View all →</button>} />
        <CircuitDivider />
        {activity.length === 0 ? (
          <EmptyState message="No activity yet. Actions across your branches will show up here as they happen." />
        ) : (
          <div>
            {activity.map(({ time, action, user, ref, icon: Icon }, i) => (
              <div key={i} className="row-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderTop: i > 0 ? `1px solid ${COLOR.lineSoft}` : 'none' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: COLOR.slate100, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={13} style={{ color: COLOR.faint }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: COLOR.ink, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action}</div>
                  <div style={{ fontSize: 11, color: COLOR.faint, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user} · <span style={{ fontFamily: FONT.mono, fontSize: 10 }}>{ref}</span>
                  </div>
                </div>
                <div style={{ fontFamily: FONT.mono, fontSize: 10, color: COLOR.slate300, flexShrink: 0, whiteSpace: 'nowrap' }}>{time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
