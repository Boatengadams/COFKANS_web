/**
 * Customer Demographics — where the customer base is concentrated, and a data
 * -driven recommendation on where a new branch would be worth opening.
 *
 * Reads Firestore `users` with role `customer`, derives each customer's city /
 * region from their default (or first) saved address, then aggregates. The
 * result is cross-referenced against the live branch network so the manager can
 * see under-served cities: high customer density with no nearby branch. When no
 * customer data has loaded yet, a small representative sample keeps the view
 * meaningful in previews.
 */
import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useBranches } from '@/lib/branches';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  Users, MapPin, Building2, Sparkles, TrendingUp, ArrowRight, Globe2,
} from 'lucide-react';
import type { FirestoreUser, Address } from '@/lib/firestore-schema';

/* ------------------------------------------------------------------ helpers */

interface CityStat {
  city: string;
  region: string;
  customers: number;
  /** Branches we already operate in this city. */
  branches: number;
}

/** Fallback distribution so the tab is legible before/without live data. */
const SAMPLE_LOCATIONS: { city: string; region: string }[] = [
  ...Array(48).fill({ city: 'Kumasi', region: 'Ashanti Region' }),
  ...Array(31).fill({ city: 'Accra', region: 'Greater Accra Region' }),
  ...Array(22).fill({ city: 'Obuasi', region: 'Ashanti Region' }),
  ...Array(19).fill({ city: 'Ejisu', region: 'Ashanti Region' }),
  ...Array(17).fill({ city: 'Sunyani', region: 'Bono Region' }),
  ...Array(14).fill({ city: 'Tema', region: 'Greater Accra Region' }),
  ...Array(12).fill({ city: 'Takoradi', region: 'Western Region' }),
  ...Array(9).fill({ city: 'Mampong', region: 'Ashanti Region' }),
];

function pickAddress(u: FirestoreUser): Address | undefined {
  if (!u.addresses?.length) return undefined;
  return u.addresses.find((a) => a.id === u.defaultAddressId) ?? u.addresses[0];
}

const norm = (s: string) => s.trim().toLowerCase();

/* ------------------------------------------------------------------- screen */

export function CustomerDemographics() {
  const branches = useBranches(false);
  const [locations, setLocations] = useState<{ city: string; region: string }[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingSample, setUsingSample] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'users'), where('role', '==', 'customer')),
        );
        const rows: { city: string; region: string }[] = [];
        snap.forEach((doc) => {
          const addr = pickAddress(doc.data() as FirestoreUser);
          if (addr?.city) rows.push({ city: addr.city, region: addr.region || 'Unknown' });
        });
        if (cancelled) return;
        if (rows.length === 0) { setLocations(SAMPLE_LOCATIONS); setUsingSample(true); }
        else setLocations(rows);
      } catch {
        if (!cancelled) { setLocations(SAMPLE_LOCATIONS); setUsingSample(true); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Aggregate by city, tagging how many branches we run there.
  const cityStats = useMemo<CityStat[]>(() => {
    if (!locations) return [];
    const branchCityCount = new Map<string, number>();
    branches.forEach((b) => {
      branchCityCount.set(norm(b.city), (branchCityCount.get(norm(b.city)) ?? 0) + 1);
    });
    const byCity = new Map<string, CityStat>();
    locations.forEach(({ city, region }) => {
      const key = norm(city);
      const cur = byCity.get(key);
      if (cur) cur.customers += 1;
      else byCity.set(key, { city, region, customers: 1, branches: branchCityCount.get(key) ?? 0 });
    });
    return [...byCity.values()].sort((a, b) => b.customers - a.customers);
  }, [locations, branches]);

  const regionStats = useMemo(() => {
    const m = new Map<string, number>();
    cityStats.forEach((c) => m.set(c.region, (m.get(c.region) ?? 0) + c.customers));
    return [...m.entries()]
      .map(([region, customers]) => ({ region, customers }))
      .sort((a, b) => b.customers - a.customers);
  }, [cityStats]);

  const totalCustomers = useMemo(() => cityStats.reduce((n, c) => n + c.customers, 0), [cityStats]);

  // Recommendation: cities where we have NO branch, ranked by customer count.
  // A "fair" threshold scales with the base so it stays sensible at any size.
  const threshold = Math.max(8, Math.round(totalCustomers * 0.08));
  const recommendations = useMemo(
    () => cityStats.filter((c) => c.branches === 0 && c.customers >= threshold),
    [cityStats, threshold],
  );

  const topCity = cityStats[0];
  const coveredCities = cityStats.filter((c) => c.branches > 0).length;
  const chartData = cityStats.slice(0, 8);
  const maxCity = chartData[0]?.customers ?? 1;

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Analysing customer locations…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Globe2 className="w-6 h-6 text-primary" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Customer Demographics</h2>
          <p className="text-sm text-muted-foreground">
            Where your customers are concentrated across Ghana — and where to grow next.
          </p>
        </div>
      </div>

      {usingSample && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          Showing a representative sample — live customer addresses will populate this automatically.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Customers Mapped" value={totalCustomers.toLocaleString()} sub="with a saved address" icon={Users} color="bg-primary/10 text-primary" />
        <Kpi label="Cities Reached" value={cityStats.length} sub={`${coveredCities} with a branch`} icon={MapPin} color="bg-emerald-500/10 text-emerald-600" />
        <Kpi label="Top City" value={topCity?.city ?? '—'} sub={topCity ? `${topCity.customers} customers` : ''} icon={TrendingUp} color="bg-blue-500/10 text-blue-600" />
        <Kpi label="Regions" value={regionStats.length} sub="represented" icon={Globe2} color="bg-amber-500/10 text-amber-600" />
      </div>

      {/* City distribution chart */}
      <div className="bg-card border-2 border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Customers by City</h3>
          <span className="text-xs text-muted-foreground">Top {chartData.length}</span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
              <XAxis key="x" type="number" hide />
              <YAxis
                key="y" type="category" dataKey="city" width={90}
                axisLine={false} tickLine={false}
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <Tooltip
                key="tip"
                cursor={{ fill: 'var(--muted)' }}
                contentStyle={{
                  background: 'var(--card)', border: '1px solid var(--border)',
                  borderRadius: 12, color: 'var(--foreground)',
                }}
                formatter={(v: number, _n, p: any) => [
                  `${v} customers${p?.payload?.branches ? ` · ${p.payload.branches} branch${p.payload.branches === 1 ? '' : 'es'}` : ' · no branch'}`,
                  p?.payload?.region ?? '',
                ]}
              />
              <Bar key="bar" dataKey="customers" radius={[0, 8, 8, 0]} isAnimationActive={false}>
                {chartData.map((c) => (
                  <Cell
                    key={c.city}
                    fill={c.branches === 0 ? 'var(--muted-foreground)' : 'var(--primary)'}
                    fillOpacity={c.branches === 0 ? 0.55 : 0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Has a branch</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/60" /> No branch yet</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Region breakdown */}
        <div className="bg-card border-2 border-border rounded-2xl p-5">
          <h3 className="font-bold text-lg mb-4">By Region</h3>
          <div className="space-y-3">
            {regionStats.map((r) => {
              const pct = totalCustomers ? Math.round((r.customers / totalCustomers) * 100) : 0;
              return (
                <div key={r.region}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium truncate">{r.region}</span>
                    <span className="text-muted-foreground flex-shrink-0 ml-2">{r.customers} · {pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expansion recommendation — the "fair cleo" */}
        <div className="bg-card border-2 border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Where to open next</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Cities with strong demand ({threshold}+ customers) but no Cofkans branch.
          </p>
          {recommendations.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Your current network already covers every high-demand city. 🎉
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((c, i) => {
                const share = totalCustomers ? Math.round((c.customers / totalCustomers) * 100) : 0;
                return (
                  <div
                    key={c.city}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-background"
                  >
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg font-bold text-sm flex-shrink-0 ${
                      i === 0 ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      #{i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate">{c.city}</p>
                        {i === 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 flex-shrink-0">
                            Best pick
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {c.region} · {c.customers} customers · {share}% of base
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                );
              })}
              {recommendations[0] && (
                <p className="text-xs text-muted-foreground pt-1">
                  Recommendation: prioritise a branch in{' '}
                  <span className="font-bold text-foreground">{recommendations[0].city}</span> — it
                  has the largest un-served customer cluster and would shorten delivery times for{' '}
                  {recommendations[0].customers} people.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Kpi({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: any; color: string;
}) {
  return (
    <div className="bg-card border-2 border-border rounded-2xl p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default CustomerDemographics;
