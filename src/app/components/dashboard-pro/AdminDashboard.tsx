import { useMemo } from 'react';
import { DollarSign, ShoppingCart, Users, AlertTriangle, Package, TrendingUp, Activity, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { GlassCard, KPI, SectionTitle, StatusPill } from './primitives';
import { useLiveSeries } from './useLiveSeries';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export function AdminOverview() {
  const live = useLiveSeries(30, 1800, 80, 30);
  const sales = useMemo(() => days.map((d, i) => ({ d, online: 800 + i*120 + Math.random()*200, instore: 400 + i*80 + Math.random()*150 })), []);
  const channels = [
    { name: 'Online', value: 62, fill: '#f59e0b' },
    { name: 'Showroom', value: 24, fill: '#8b5cf6' },
    { name: 'B2B', value: 14, fill: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Revenue (today)" value="GH₵ 12,480" delta="+24%" trend="up" icon={DollarSign} accent="emerald" sparkline={live} />
        <KPI label="Orders" value="312" delta="+12 in last hour" trend="up" icon={ShoppingCart} accent="sky" sparkline={[20,22,28,24,30,34,38,42]} />
        <KPI label="Active users" value="1,284" delta="+8% WoW" trend="up" icon={Users} accent="violet" sparkline={[800,860,920,970,1020,1100,1180,1284]} />
        <KPI label="Low stock SKUs" value="7" delta="3 critical" trend="down" icon={AlertTriangle} accent="rose" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="p-5 lg:col-span-2">
          <SectionTitle title="Sales this week" subtitle="Online vs showroom (GH₵)" action={<StatusPill status="success"><Zap className="w-3 h-3" /> live</StatusPill>} />
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={sales} margin={{ left: -10, right: 8, top: 10 }}>
                <defs>
                  <linearGradient id="aon" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient>
                  <linearGradient id="ain" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="d" stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} width={48} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.95)', border: 'none', borderRadius: 12, color: 'white' }} />
                <Area type="monotone" dataKey="online"  stroke="#f59e0b" strokeWidth={2.5} fill="url(#aon)" />
                <Area type="monotone" dataKey="instore" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#ain)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle title="Sales channels" />
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={channels} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={4} stroke="none">
                  {channels.map((c, i) => <Cell key={i} fill={c.fill} />)}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <GlassCard className="p-5">
          <SectionTitle title="Top products" subtitle="Best sellers this week" />
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={[
                { name: 'LED Panel 60×60', units: 124 },
                { name: 'Bulb 30W',        units: 98 },
                { name: 'RGB Strip 10m',   units: 76 },
                { name: 'Crystal Pendant', units: 54 },
                { name: 'Flood 50W',       units: 41 },
              ]} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="currentColor" strokeOpacity={0.06} horizontal={false} />
                <XAxis type="number" stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="currentColor" tickLine={false} axisLine={false} fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: 'rgba(20,20,20,0.95)', border: 'none', borderRadius: 12, color: 'white' }} />
                <Bar dataKey="units" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionTitle title="System activity" subtitle="Live event stream" action={<StatusPill status="success"><Activity className="w-3 h-3" /> live</StatusPill>} />
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[
              { t: 'New order #C9211 — GH₵ 480', s: 'success', when: 'now' },
              { t: 'Stock alert: LED Panel down to 8 units', s: 'warn', when: '1m' },
              { t: 'Customer "Ama K." registered', s: 'info', when: '2m' },
              { t: 'Refund processed for #C9101', s: 'neutral', when: '5m' },
              { t: 'Driver Yaw completed route', s: 'success', when: '8m' },
              { t: 'Technician assigned to SR-9281', s: 'info', when: '12m' },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/60">
                <StatusPill status={e.s as never}>•</StatusPill>
                <div className="flex-1 text-sm font-medium truncate">{e.t}</div>
                <div className="text-[11px] text-muted-foreground">{e.when}</div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export function AdminInventory() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Inventory" subtitle="Stock levels & low-stock alerts" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="py-2">SKU</th><th>Product</th><th>Stock</th><th>Sold</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[
              ['LED-60-60', 'LED Panel 60×60 60W', 8,  124, 'warn'  as const, 'Low'],
              ['BULB-30W',  'Energy Saving 30W',   42, 98,  'success' as const, 'OK'],
              ['RGB-10M',   'Smart RGB Strip 10m', 0,  76,  'error' as const, 'Out'],
              ['PEND-CR',   'Crystal Pendant',     21, 54,  'success' as const, 'OK'],
            ].map(r => (
              <tr key={r[0] as string} className="border-t border-border">
                <td className="py-3 font-mono text-xs">{r[0]}</td>
                <td className="font-semibold">{r[1]}</td>
                <td className="tabular-nums">{r[2]}</td>
                <td className="tabular-nums">{r[3]}</td>
                <td><StatusPill status={r[4]}>{r[5]}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

export function AdminUsers() {
  return (
    <GlassCard className="p-6">
      <SectionTitle title="Users" subtitle="Customers, technicians, drivers, admins" />
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <KPI label="Customers" value="1,184" icon={Users} accent="sky" />
        <KPI label="Technicians" value="12" icon={Package} accent="violet" />
        <KPI label="Drivers" value="8" icon={TrendingUp} accent="emerald" />
      </div>
      <div className="text-sm text-muted-foreground">User management table connects when Supabase is wired.</div>
    </GlassCard>
  );
}
