/**
 * COFKANS ELECTRICALS ERP — Technician Dashboard.
 *
 * A field-service cockpit scoped to the technician's home branch: animated KPIs
 * for today's job pipeline, a completion progress ring, a schedule board with
 * start/complete actions, and a low-stock parts panel that raises branch stock
 * requests (fulfilled by the showroom). Backend-free — jobs are session mock,
 * parts come from the branch inventory service. Rendered in the ".erp-theme".
 */
import { useMemo, useState } from 'react';
import {
  Wrench, ClipboardList, CheckCircle2, AlertTriangle, Package, Clock,
  ArrowUpFromLine, Check, MapPin, PlayCircle, Gauge, Boxes,
} from 'lucide-react';
import { useBranch } from '../hooks/useBranches';
import { useBranchInventory } from '../hooks/useBranchInventory';
import { raiseAlert } from '../services/transferService';
import { stockLevel } from '../utils/inventory';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, ProgressRing,
} from '../components/ui/pro';
import type { ProductInventory } from '../types/product-inventory';

/** A service job — mock, local to the session (no jobs backend yet). */
interface Job {
  id: string;
  customer: string;
  task: string;
  address: string;
  time: string;
  status: 'scheduled' | 'in_progress' | 'done';
}

const SEED_JOBS: Job[] = [
  { id: 'job-1', customer: 'Adjei Residence', task: 'Ceiling fan installation (2 units)', address: 'Adum, Kumasi', time: '09:00', status: 'scheduled' },
  { id: 'job-2', customer: 'Blessed Salon', task: 'Rewire distribution board', address: 'Asuoyeboa, Kumasi', time: '11:30', status: 'scheduled' },
  { id: 'job-3', customer: 'Mensah Apartments', task: 'Replace faulty MCB & sockets', address: 'Abuakwa, Kumasi', time: '14:00', status: 'in_progress' },
  { id: 'job-4', customer: 'Royal Guest House', task: 'Install 6 LED floodlights', address: 'Santasi, Kumasi', time: '16:00', status: 'scheduled' },
];

export function TechnicianDashboard({ branchId }: { branchId: string }) {
  const branch = useBranch(branchId);
  const inventory = useBranchInventory(branchId);
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS);
  const [requested, setRequested] = useState<Record<string, boolean>>({});

  const lowParts = useMemo(
    () => inventory.items.filter((i) => stockLevel(i) !== 'ok').slice(0, 8),
    [inventory.items],
  );

  const stats = useMemo(() => ({
    scheduled: jobs.filter((j) => j.status === 'scheduled').length,
    inProgress: jobs.filter((j) => j.status === 'in_progress').length,
    done: jobs.filter((j) => j.status === 'done').length,
    total: jobs.length,
  }), [jobs]);

  const completionPct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  function advance(id: string) {
    setJobs((all) => all.map((j) =>
      j.id === id
        ? { ...j, status: j.status === 'scheduled' ? 'in_progress' : 'done' }
        : j,
    ));
  }

  function requestPart(item: ProductInventory) {
    raiseAlert({
      branchSlug: branchId,
      productId: item.productId,
      sku: item.sku,
      name: item.name ?? item.sku,
      requestedQty: Math.max(item.reorderLevel ?? 5, 1),
      raisedBy: 'technician',
    });
    setRequested((r) => ({ ...r, [item.sku]: true }));
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Wrench className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="Field Service · Technician"
          title={branch?.name ?? branchId}
          subtitle="Your service jobs and branch parts for today."
        />

        {/* KPIs */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi icon={<ClipboardList className="h-4 w-4" />} label="Scheduled" value={stats.scheduled} />
          <Kpi icon={<PlayCircle className="h-4 w-4" />} label="In progress" value={stats.inProgress} tone="warn" />
          <Kpi icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={stats.done} tone="ok" />
          <Kpi icon={<Boxes className="h-4 w-4" />} label="Parts to reorder" value={lowParts.length} tone="info" />
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Jobs */}
          <Panel title="Today's jobs" icon={<Wrench className="h-4 w-4" />} className="lg:col-span-2"
            action={<Pill tone="muted">{stats.total} total</Pill>}>
            <div className="space-y-2">
              {jobs.map((j) => (
                <div key={j.id} className="rounded-xl border border-border bg-background/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate">{j.customer}</p>
                      <p className="text-sm text-muted-foreground">{j.task}</p>
                      <p className="mt-1 inline-flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{j.time}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{j.address}</span>
                      </p>
                    </div>
                    <JobBadge status={j.status} />
                  </div>
                  {j.status !== 'done' && (
                    <button onClick={() => advance(j.id)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90">
                      {j.status === 'scheduled'
                        ? <><PlayCircle className="h-4 w-4" />Start job</>
                        : <><CheckCircle2 className="h-4 w-4" />Mark complete</>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          {/* Progress + parts */}
          <div className="space-y-6">
            <Panel title="Day progress" icon={<Gauge className="h-4 w-4" />}>
              <div className="flex flex-col items-center gap-3 py-2">
                <ProgressRing value={completionPct} label={`${completionPct}%`} sublabel="Complete" />
                <p className="text-center text-sm text-muted-foreground">
                  {stats.done} of {stats.total} jobs done
                </p>
              </div>
            </Panel>

            <Panel title="Low / out-of-stock parts" icon={<Package className="h-4 w-4" />}
              action={<Pill tone={lowParts.length ? 'warn' : 'up'}>{lowParts.length}</Pill>}>
              {lowParts.length === 0 ? (
                <EmptyState label="All parts are well stocked." />
              ) : (
                <div className="space-y-2">
                  {lowParts.map((i) => (
                    <div key={i.sku} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                      <div className="min-w-0">
                        <p className="truncate">{i.name ?? i.sku}</p>
                        <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />{i.quantity} in stock
                        </p>
                      </div>
                      <button onClick={() => requestPart(i)} disabled={!!requested[i.sku]}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors ${
                          requested[i.sku]
                            ? 'cursor-default border-emerald-500/40 text-emerald-600'
                            : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                        }`}>
                        {requested[i.sku]
                          ? <><Check className="h-3.5 w-3.5" />Requested</>
                          : <><ArrowUpFromLine className="h-3.5 w-3.5" />Request</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Kpi({ icon, label, value, tone = 'default' }: {
  icon: React.ReactNode; label: string; value: number;
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
        <AnimatedCounter value={value} />
      </p>
    </div>
  );
}

const JOB_STYLE = {
  scheduled: 'bg-muted text-muted-foreground',
  in_progress: 'bg-amber-500/10 text-amber-600',
  done: 'bg-emerald-500/10 text-emerald-600',
} as const;
const JOB_LABEL = { scheduled: 'Scheduled', in_progress: 'In progress', done: 'Done' } as const;
function JobBadge({ status }: { status: Job['status'] }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs ${JOB_STYLE[status]}`}>{JOB_LABEL[status]}</span>;
}

export default TechnicianDashboard;
