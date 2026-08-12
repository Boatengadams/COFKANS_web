import { motion, type MotionProps } from 'motion/react';
import { type ReactNode, type ComponentType } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

/** Frosted glass surface with subtle inner glow + gradient border. */
export function GlassCard({
  children,
  className = '',
  glow = false,
  ...motionProps
}: { children: ReactNode; className?: string; glow?: boolean } & MotionProps) {
  return (
    <motion.div
      {...motionProps}
      className={`relative rounded-2xl bg-card/60 backdrop-blur-2xl border border-white/10 dark:border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden ${className}`}
    >
      {/* Gradient border highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent" />
      {glow && (
        <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 bg-primary/20 blur-3xl rounded-full" />
      )}
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export type Trend = 'up' | 'down' | 'flat';

export function KPI({
  label,
  value,
  delta,
  trend = 'flat',
  icon: Icon,
  accent = 'primary',
  sparkline,
}: {
  label: string;
  value: string | number;
  delta?: string;
  trend?: Trend;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  accent?: 'primary' | 'emerald' | 'rose' | 'violet' | 'sky' | 'amber';
  sparkline?: number[];
}) {
  const accentMap: Record<string, string> = {
    primary: 'from-amber-400/30 to-amber-600/10 text-amber-500',
    emerald: 'from-emerald-400/30 to-emerald-600/10 text-emerald-500',
    rose: 'from-rose-400/30 to-rose-600/10 text-rose-500',
    violet: 'from-violet-400/30 to-violet-600/10 text-violet-500',
    sky: 'from-sky-400/30 to-sky-600/10 text-sky-500',
    amber: 'from-amber-400/30 to-amber-600/10 text-amber-500',
  };
  const trendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const TrendIcon = trendIcon;
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground';

  return (
    <GlassCard className="p-5" whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</div>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center`}>
            <Icon className="w-4 h-4" strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-bold tabular-nums tracking-tight">{value}</div>
          {delta && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
              {delta}
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 0 && (
          <Sparkline data={sparkline} accent={accent} />
        )}
      </div>
    </GlassCard>
  );
}

export function Sparkline({ data, accent = 'primary' }: { data: number[]; accent?: string }) {
  if (data.length < 2) return null;
  const w = 80;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const colorMap: Record<string, string> = {
    primary: '#f59e0b',
    emerald: '#10b981',
    rose: '#f43f5e',
    violet: '#8b5cf6',
    sky: '#0ea5e9',
    amber: '#f59e0b',
  };
  const color = colorMap[accent] || colorMap.primary;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${accent}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#spark-${accent})`} />
    </svg>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h3 className="text-lg font-bold tracking-tight">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({ status, children }: { status: 'success' | 'warn' | 'error' | 'info' | 'neutral'; children: ReactNode }) {
  const map = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warn: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    neutral: 'bg-muted text-muted-foreground border-border',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${map[status]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted to-muted/40 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" strokeWidth={2} />
      </div>
      <div className="font-bold mb-1">{title}</div>
      {body && <div className="text-sm text-muted-foreground max-w-sm">{body}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** Background mesh — soft gradients that bring the glass surfaces to life. */
export function MeshBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-amber-400/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-[120px]" />
    </div>
  );
}
