/**
 * Multi-Branch Module — premium shared UI kit ("Gold City" design language).
 *
 * A small set of composable, on-brand primitives used across every branch
 * portal so the whole workspace shares one elevated look: glass panels, gold
 * accents, KPI stat cards with trend deltas + sparklines, section headers and
 * subtle motion. Pure presentational components — no data fetching.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, ArrowUpRight, ChevronsUpDown, ChevronUp, ChevronDown, Download } from 'lucide-react';

/* --------------------------------------------------------------- motion */

/** Fade + rise on mount; stagger children by passing an incrementing `index`. */
export function Reveal({
  children, index = 0, className,
}: { children: ReactNode; index?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* --------------------------------------------------------------- page header */

export function PageHeader({
  eyebrow, title, subtitle, actions, icon,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="erp-card relative overflow-hidden erp-elevate-lg"
      style={{ borderRadius: '1.75rem' }}
    >
      {/* Layered depth: brand wash, dotted grid, ambient glow, floating orb */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-gold-subtle" />
      <div className="erp-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="erp-ambient" />
      <div
        className="erp-float pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--true-gold), transparent 70%)' }}
      />
      <div className="relative flex flex-wrap items-end justify-between gap-5 p-6 sm:p-8">
        <div className="flex items-start gap-4 min-w-0">
          {icon && (
            <div className="erp-sheen shrink-0 rounded-2xl bg-gradient-gold p-3.5 text-black shadow-lg ring-1 ring-white/20">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                {eyebrow}
              </p>
            )}
            <h2 className="erp-gradient-text mt-1.5" style={{ fontSize: 'clamp(1.7rem, 3.2vw, 2.6rem)', lineHeight: 1.05, letterSpacing: '-0.02em' }}>
              {title}
            </h2>
            {subtitle && <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------- sparkline */

export function Sparkline({ data, tone = 'gold' }: { data: number[]; tone?: 'gold' | 'up' | 'down' }) {
  const color =
    tone === 'up' ? '#10b981' : tone === 'down' ? '#ef4444' : 'var(--true-gold)';
  const id = `spark-${tone}-${data.length}-${Math.round(data.reduce((a, b) => a + b, 0))}`;
  const series = (data.length ? data : [0, 0]).map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs key="defs">
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            key="area" type="monotone" dataKey="v" stroke={color} strokeWidth={2}
            fill={`url(#${id})`} isAnimationActive={false} dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* --------------------------------------------------------------- stat card */

export function StatCard({
  icon, label, value, sub, delta, spark, sparkTone, index = 0,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  /** Percentage change; positive = up (green), negative = down (red). */
  delta?: number;
  spark?: number[];
  sparkTone?: 'gold' | 'up' | 'down';
  index?: number;
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <Reveal index={index}>
      <div className="erp-card erp-card-hover group relative h-full overflow-hidden p-5">
        {/* Ambient tint that blooms on hover */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="rounded-2xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:bg-primary/15 group-hover:ring-primary/25">
            {icon}
          </span>
          {typeof delta === 'number' && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
              }`}
            >
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
        <p className="relative mt-4 text-sm text-muted-foreground">{label}</p>
        <p className="relative mt-1 tabular-nums" style={{ fontSize: '1.95rem', lineHeight: 1.05, letterSpacing: '-0.02em' }}>{value}</p>
        {sub && <p className="relative mt-1 text-xs text-muted-foreground">{sub}</p>}
        {spark && spark.length > 1 && (
          <div className="relative mt-3 -mb-1">
            <Sparkline data={spark} tone={sparkTone ?? (up ? 'up' : 'down')} />
          </div>
        )}
      </div>
    </Reveal>
  );
}

/* --------------------------------------------------------------- panel */

export function Panel({
  title, icon, action, children, className, index = 0,
}: {
  title: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <Reveal index={index} className={className}>
      <section className="erp-card h-full overflow-hidden p-5">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-[var(--erp-hairline)] pb-3">
          <div className="flex items-center gap-2.5">
            {icon && <span className="rounded-lg bg-primary/10 p-1.5 text-primary ring-1 ring-primary/10">{icon}</span>}
            <h3 style={{ fontSize: '1.05rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>{title}</h3>
          </div>
          {action}
        </div>
        {children}
      </section>
    </Reveal>
  );
}

/* --------------------------------------------------------------- misc */

export function Pill({
  children, tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'muted' | 'gold' | 'up' | 'down' | 'info' | 'warn';
}) {
  const map: Record<string, string> = {
    muted: 'bg-muted text-muted-foreground',
    gold: 'bg-primary/10 text-primary',
    up: 'bg-emerald-500/10 text-emerald-600',
    down: 'bg-red-500/10 text-red-600',
    info: 'bg-sky-500/10 text-sky-600',
    warn: 'bg-amber-500/10 text-amber-600',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${map[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-muted-foreground">{label}</p>;
}

/* --------------------------------------------------------------- animated counter */

/**
 * Counts up to `value` on mount / when the value changes. `format` renders the
 * (possibly fractional) running number into the final string.
 */
export function AnimatedCounter({
  value, duration = 900, format = (n) => Math.round(n).toLocaleString(),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{format(display)}</>;
}

/* --------------------------------------------------------------- progress ring */

export function ProgressRing({
  value, size = 72, stroke = 8, label, sublabel,
}: {
  /** 0–100. */
  value: number;
  size?: number;
  stroke?: number;
  label?: ReactNode;
  sublabel?: ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {label ?? <span className="text-sm font-semibold">{Math.round(pct)}%</span>}
        {sublabel && <span className="mt-0.5 text-[10px] text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- skeleton */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`erp-skeleton ${className}`} />;
}

/* --------------------------------------------------------------- data table */

export interface DataColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  /** Raw value used for sorting + CSV export. */
  value: (row: T) => string | number;
  /** Optional rich cell renderer; falls back to `value`. */
  render?: (row: T) => ReactNode;
  /** Optional footer/totals cell. */
  footer?: (rows: T[]) => ReactNode;
  /** Disable sorting for this column. */
  sortable?: boolean;
  width?: string;
}

/**
 * Excel-style data grid: sortable columns, sticky header, zebra rows, an
 * optional totals footer and one-click CSV export. Presentational + local
 * sort state only.
 */
export function DataTable<T>({
  columns, rows, getRowId, csvName = 'export', minWidth = 720, maxHeight = 520,
  emptyLabel = 'No records for the current filters.',
}: {
  columns: DataColumn<T>[];
  rows: T[];
  getRowId: (row: T, index: number) => string;
  csvName?: string;
  minWidth?: number;
  maxHeight?: number;
  emptyLabel?: string;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [dir, setDir] = useState<'asc' | 'desc'>('desc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = col.value(a);
      const vb = col.value(b);
      let cmp: number;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
      return dir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, columns, sortKey, dir]);

  const toggleSort = (col: DataColumn<T>) => {
    if (col.sortable === false) return;
    if (sortKey === col.key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(col.key); setDir('desc'); }
  };

  const hasFooter = columns.some((c) => c.footer);

  const exportCsv = () => {
    const esc = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = columns.map((c) => esc(c.header)).join(',');
    const body = sorted.map((r) => columns.map((c) => esc(c.value(r))).join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${csvName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const alignCls = (a?: string) =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <p className="text-xs text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? 'record' : 'records'}
        </p>
        <button
          onClick={exportCsv}
          disabled={!sorted.length}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>
      {sorted.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : (
        <div className="overflow-auto scrollbar-hide" style={{ maxHeight }}>
          <table className="w-full border-collapse text-sm" style={{ minWidth }}>
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/70 backdrop-blur">
                {columns.map((c) => {
                  const isActive = sortKey === c.key;
                  return (
                    <th
                      key={c.key}
                      onClick={() => toggleSort(c)}
                      style={{ width: c.width }}
                      className={`whitespace-nowrap border-b border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${alignCls(c.align)} ${
                        c.sortable === false ? '' : 'cursor-pointer select-none hover:text-foreground'
                      }`}
                    >
                      <span className={`inline-flex items-center gap-1 ${c.align === 'right' ? 'flex-row-reverse' : ''}`}>
                        {c.header}
                        {c.sortable !== false && (
                          isActive
                            ? (dir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />)
                            : <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <tr
                  key={getRowId(row, i)}
                  className={`border-b border-border/60 transition-colors hover:bg-primary/5 ${i % 2 ? 'bg-muted/20' : ''}`}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`whitespace-nowrap px-3 py-2.5 ${alignCls(c.align)}`}>
                      {c.render ? c.render(row) : c.value(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {hasFooter && (
              <tfoot className="sticky bottom-0">
                <tr className="bg-muted/70 font-semibold backdrop-blur">
                  {columns.map((c) => (
                    <td key={c.key} className={`whitespace-nowrap border-t border-border px-3 py-2.5 ${alignCls(c.align)}`}>
                      {c.footer ? c.footer(sorted) : null}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
