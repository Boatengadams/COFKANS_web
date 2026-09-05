/**
 * COFKANS ELECTRICALS ERP — Customer Geography (Executive).
 *
 * Shows where the customer base is concentrated and gives a data-driven
 * recommendation on where a new branch would be worth opening.
 *
 * Concentration is derived from the module's own sales: every customer is
 * counted (de-duplicated by phone / email / name) against the CITY of the
 * branch they bought from, then rolled up to region. For expansion, a curated
 * set of nearby catchment towns — where Cofkans has NO branch yet — is scored
 * against the demand of the region around them, surfacing the strongest
 * un-served cluster as the "best pick".
 *
 * Backend-free: consumes the module's mock/localStorage service layer via the
 * same hooks the rest of the Executive dashboard uses. Rendered inside the
 * green ".erp-theme" surface with the shared "pro" UI kit.
 */
import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Globe2, MapPin, Users, Sparkles, Building2, ArrowRight,
} from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { useSales } from '../hooks/useSales';
import { Panel, Pill, EmptyState } from '../components/ui/pro';
import type { Sale } from '../types/sale';

/* ------------------------------------------------------------------ catchment */

/**
 * Towns near the existing network with NO Cofkans branch. `weight` is the share
 * of the surrounding region's customer base we'd expect to convert once a local
 * branch opens (a conservative planning estimate).
 */
const CATCHMENT: { town: string; region: string; weight: number }[] = [
  { town: 'Ejisu',    region: 'Ashanti Region',       weight: 0.14 },
  { town: 'Mampong',  region: 'Ashanti Region',       weight: 0.10 },
  { town: 'Konongo',  region: 'Ashanti Region',       weight: 0.09 },
  { town: 'Bekwai',   region: 'Ashanti Region',       weight: 0.08 },
  { town: 'Tema',     region: 'Greater Accra Region', weight: 0.16 },
  { town: 'Kasoa',    region: 'Greater Accra Region', weight: 0.13 },
  { town: 'Madina',   region: 'Greater Accra Region', weight: 0.10 },
];

const norm = (s: string) => s.trim().toLowerCase();
const customerKey = (s: Sale) =>
  s.customer?.phone || s.customer?.email || s.customer?.name || null;

/* ------------------------------------------------------------------- component */

export function CustomerGeography() {
  const branches = useBranches();
  const sales = useSales();

  // Unique customers per branch-city and per region.
  const { cityStats, regionCustomers, totalCustomers } = useMemo(() => {
    const cityByBranch = new Map<string, { city: string; region: string }>();
    branches.forEach((b) => cityByBranch.set(b.slug, { city: b.city, region: b.region }));

    // city -> set of customer keys (dedup within a city)
    const cityCust = new Map<string, { city: string; region: string; keys: Set<string> }>();
    const allKeys = new Set<string>();

    for (const s of sales) {
      const key = customerKey(s);
      if (!key) continue;
      const loc = cityByBranch.get(s.branchSlug);
      if (!loc) continue;
      const ck = norm(loc.city);
      const cur = cityCust.get(ck) ?? { city: loc.city, region: loc.region, keys: new Set<string>() };
      cur.keys.add(key);
      cityCust.set(ck, cur);
      allKeys.add(`${key}@@${ck}`); // customer counted once per city
    }

    const cityStats = [...cityCust.values()]
      .map((c) => ({ city: c.city, region: c.region, customers: c.keys.size }))
      .sort((a, b) => b.customers - a.customers);

    const regionCustomers = new Map<string, number>();
    cityStats.forEach((c) =>
      regionCustomers.set(c.region, (regionCustomers.get(c.region) ?? 0) + c.customers),
    );

    const totalCustomers = cityStats.reduce((n, c) => n + c.customers, 0);
    return { cityStats, regionCustomers, totalCustomers };
  }, [branches, sales]);

  const regionStats = useMemo(
    () => [...regionCustomers.entries()]
      .map(([region, customers]) => ({ region, customers }))
      .sort((a, b) => b.customers - a.customers),
    [regionCustomers],
  );

  // Expansion recommendation: catchment towns scored by surrounding demand.
  const recommendations = useMemo(() => {
    const branchCities = new Set(branches.map((b) => norm(b.city)));
    return CATCHMENT
      .filter((c) => !branchCities.has(norm(c.town)))
      .map((c) => ({
        town: c.town,
        region: c.region,
        projected: Math.round((regionCustomers.get(c.region) ?? 0) * c.weight),
      }))
      .filter((c) => c.projected > 0)
      .sort((a, b) => b.projected - a.projected)
      .slice(0, 4);
  }, [branches, regionCustomers]);

  const topCity = cityStats[0];
  const chartData = cityStats.slice(0, 8);

  const empty = totalCustomers === 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Globe2 className="h-4 w-4 text-primary" />
        <h3 style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>Customer geography</h3>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat icon={<Users className="h-4 w-4" />} label="Customers" value={totalCustomers.toLocaleString()} />
        <MiniStat icon={<MapPin className="h-4 w-4" />} label="Cities served" value={String(cityStats.length)} />
        <MiniStat icon={<Building2 className="h-4 w-4" />} label="Top city" value={topCity?.city ?? '—'} sub={topCity ? `${topCity.customers} customers` : undefined} />
        <MiniStat icon={<Globe2 className="h-4 w-4" />} label="Regions" value={String(regionStats.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Concentration chart */}
        <Panel title="Customers by city" icon={<MapPin className="h-4 w-4" />} className="lg:col-span-2" index={0}>
          {empty ? <EmptyState label="No customer records captured yet." /> : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 20, left: 8, bottom: 0 }}>
                  <XAxis key="x" type="number" hide />
                  <YAxis key="y" type="category" dataKey="city" width={96}
                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} tickLine={false} axisLine={false} />
                  <Tooltip key="tip" cursor={{ fill: 'var(--muted)', opacity: 0.4 }} contentStyle={tooltipStyle}
                    formatter={(v: number, _n, p: any) => [`${v} customers`, p?.payload?.region ?? '']} />
                  <Bar key="bar" dataKey="customers" radius={[0, 8, 8, 0]} isAnimationActive={false}>
                    {chartData.map((c) => <Cell key={c.city} fill="#10B981" />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* Region split */}
        <Panel title="By region" icon={<Globe2 className="h-4 w-4" />} index={1}>
          {empty ? <EmptyState label="No data." /> : (
            <div className="space-y-3">
              {regionStats.map((r) => {
                const pct = totalCustomers ? Math.round((r.customers / totalCustomers) * 100) : 0;
                return (
                  <div key={r.region}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="truncate">{r.region}</span>
                      <span className="ml-2 shrink-0 text-muted-foreground">{r.customers} · {pct}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* Where to open next */}
      <Panel title="Where to open next" icon={<Sparkles className="h-4 w-4" />}
        action={<Pill tone="gold">Expansion</Pill>} index={0}>
        {recommendations.length === 0 ? (
          <EmptyState label="Not enough demand signal yet to recommend a new branch." />
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Nearby towns with strong regional demand but no Cofkans branch — projected local
              customers once a branch opens.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendations.map((c, i) => (
                <div key={c.town} className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-semibold ${
                    i === 0 ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                  }`}>
                    #{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{c.town}</p>
                      {i === 0 && <Pill tone="up">Best pick</Pill>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.region} · ~{c.projected} projected customers
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
            {recommendations[0] && (
              <p className="pt-1 text-xs text-muted-foreground">
                Recommendation: prioritise <span className="font-medium text-foreground">{recommendations[0].town}</span> —
                the strongest un-served cluster (~{recommendations[0].projected} customers), which would
                also shorten delivery times across {recommendations[0].region}.
              </p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function MiniStat({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}<span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 truncate" style={{ fontSize: '1.35rem', lineHeight: 1.1 }}>{value}</p>
      {sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  fontSize: 12,
} as const;

export default CustomerGeography;
