/**
 * COFKANS ELECTRICALS ERP — Human Resources Dashboard.
 *
 * People operations across the company: headcount / attendance / payroll KPIs,
 * headcount-by-branch and department-mix charts, an attendance ring, a leave
 * request queue with approve/decline, and a full staff roster with CSV export.
 *
 * There is no staff backend in this module yet, so the roster is a realistic,
 * deterministic mock distributed across the live branch list.
 */
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import {
  Users, UserCheck, CalendarOff, Briefcase, BadgeDollarSign, Gauge,
  Building2, CheckCircle2, XCircle, PlaneTakeoff,
} from 'lucide-react';
import { useBranches } from '../hooks/useBranches';
import { formatCedis } from '../utils/format';
import {
  PageHeader, Panel, Pill, EmptyState, AnimatedCounter, ProgressRing, DataTable, type DataColumn,
} from '../components/ui/pro';

type Dept = 'Management' | 'Sales' | 'Technical' | 'Logistics' | 'Warehouse' | 'Finance';
type Attendance = 'present' | 'leave' | 'off';

interface Staff {
  id: string;
  name: string;
  role: string;
  dept: Dept;
  branchSlug: string;
  branchName: string;
  salary: number;
  attendance: Attendance;
  since: string;
}

const DEPT_COLORS: Record<Dept, string> = {
  Management: '#0F5132', Sales: '#10B981', Technical: '#2563EB',
  Logistics: '#F59E0B', Warehouse: '#8B5CF6', Finance: '#6EE7B7',
};

const FIRST = ['Kwame', 'Ama', 'Yaw', 'Esi', 'Kofi', 'Akua', 'Kojo', 'Abena', 'Kwesi', 'Adjoa', 'Fiifi', 'Efua', 'Nana', 'Musah', 'Kwabena', 'Afia', 'Kojo', 'Serwaa'];
const LAST = ['Mensah', 'Owusu', 'Boateng', 'Asante', 'Adjei', 'Agyeman', 'Darko', 'Osei', 'Frimpong', 'Appiah', 'Baah', 'Danso'];
const ROLE_BY_DEPT: Record<Dept, string[]> = {
  Management: ['Branch Manager'],
  Sales: ['Cashier', 'Front Desk', 'Sales Associate'],
  Technical: ['Technician', 'Senior Technician'],
  Logistics: ['Driver', 'Dispatch Rider'],
  Warehouse: ['Stock Controller', 'Warehouse Assistant'],
  Finance: ['Accountant', 'Accounts Clerk'],
};
const SALARY: Record<Dept, number> = {
  Management: 4200, Sales: 1800, Technical: 2400, Logistics: 1600, Warehouse: 2000, Finance: 3200,
};

function rand(seed: number) { const x = Math.sin(seed * 999.13) * 43758.5453; return x - Math.floor(x); }

export function HRDashboard() {
  const branches = useBranches();
  const [leave, setLeave] = useState<Record<string, 'approved' | 'declined'>>({});

  // Deterministic roster: 3–5 staff per branch spanning departments.
  const staff = useMemo<Staff[]>(() => {
    const out: Staff[] = [];
    let n = 0;
    branches.forEach((b, bi) => {
      const depts: Dept[] = ['Management', 'Sales', 'Technical', 'Logistics', 'Warehouse', 'Finance'];
      const count = 3 + Math.floor(rand(bi + 1) * 3);
      for (let i = 0; i < count; i++) {
        const dept = depts[Math.floor(rand(n + 7) * (i === 0 ? 1 : depts.length))]; // first is Management
        const roles = ROLE_BY_DEPT[dept];
        const role = roles[Math.floor(rand(n + 3) * roles.length)];
        const att: Attendance = rand(n + 11) > 0.86 ? 'leave' : rand(n + 13) > 0.92 ? 'off' : 'present';
        const year = 2019 + Math.floor(rand(n + 5) * 6);
        out.push({
          id: `stf-${n}`,
          name: `${FIRST[Math.floor(rand(n + 2) * FIRST.length)]} ${LAST[Math.floor(rand(n + 4) * LAST.length)]}`,
          role, dept, branchSlug: b.slug, branchName: b.name,
          salary: SALARY[dept] + Math.round(rand(n + 6) * 400),
          attendance: att,
          since: `${year}`,
        });
        n++;
      }
    });
    return out;
  }, [branches]);

  const stats = useMemo(() => {
    const present = staff.filter((s) => s.attendance === 'present').length;
    const onLeave = staff.filter((s) => s.attendance === 'leave').length;
    const payroll = staff.reduce((s, x) => s + x.salary, 0);
    return {
      head: staff.length, present, onLeave,
      openRoles: 4,
      payroll,
      attendancePct: staff.length ? Math.round((present / staff.length) * 100) : 0,
    };
  }, [staff]);

  const byBranch = useMemo(() => branches.map((b) => ({
    name: b.name.replace(/^Kumasi\s*/i, '') || b.name,
    staff: staff.filter((s) => s.branchSlug === b.slug).length,
  })), [branches, staff]);

  const byDept = useMemo(() => {
    const map = new Map<Dept, number>();
    for (const s of staff) map.set(s.dept, (map.get(s.dept) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [staff]);

  const leaveRequests = useMemo(() => staff.filter((s) => s.attendance === 'leave').slice(0, 6), [staff]);

  const rosterCols: DataColumn<Staff>[] = [
    { key: 'name', header: 'Name', value: (r) => r.name },
    { key: 'role', header: 'Role', value: (r) => r.role },
    { key: 'dept', header: 'Department', value: (r) => r.dept,
      render: (r) => <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: DEPT_COLORS[r.dept] }} />{r.dept}</span> },
    { key: 'branch', header: 'Branch', value: (r) => r.branchName },
    { key: 'since', header: 'Since', align: 'right', value: (r) => r.since, sortable: true },
    { key: 'status', header: 'Status', align: 'right', value: (r) => r.attendance,
      render: (r) => <Pill tone={r.attendance === 'present' ? 'up' : r.attendance === 'leave' ? 'warn' : 'muted'}>{r.attendance}</Pill> },
    { key: 'salary', header: 'Salary', align: 'right', value: (r) => r.salary, render: (r) => formatCedis(r.salary), sortable: true,
      footer: (rs) => formatCedis(rs.reduce((s, r) => s + r.salary, 0)) },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6">
        <PageHeader
          icon={<Users className="h-6 w-6" strokeWidth={2.5} />}
          eyebrow="People · Human Resources"
          title="HR Dashboard"
          subtitle={`${stats.head} employees across ${branches.length} branches`}
        />

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
          <Kpi icon={<Users className="h-4 w-4" />} label="Headcount" value={stats.head} />
          <Kpi icon={<UserCheck className="h-4 w-4" />} label="Present today" value={stats.present} tone="ok" />
          <Kpi icon={<CalendarOff className="h-4 w-4" />} label="On leave" value={stats.onLeave} tone="warn" />
          <Kpi icon={<Briefcase className="h-4 w-4" />} label="Open roles" value={stats.openRoles} tone="info" />
          <Kpi icon={<BadgeDollarSign className="h-4 w-4" />} label="Monthly payroll" value={stats.payroll} money tone="ok" />
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel title="Headcount by branch" icon={<Building2 className="h-4 w-4" />} className="xl:col-span-2">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byBranch} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid key="grid" strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis key="x" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis key="y" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip key="tip" contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
                  <Bar key="staff" dataKey="staff" name="Staff" fill="#0F5132" radius={[6, 6, 0, 0]} maxBarSize={46} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Attendance" icon={<Gauge className="h-4 w-4" />}>
            <div className="flex flex-col items-center gap-4 py-2">
              <ProgressRing value={stats.attendancePct} label={`${stats.attendancePct}%`} sublabel="Present" />
              <div className="grid w-full grid-cols-3 gap-2 text-center">
                {byDept.slice(0, 6).map((d) => (
                  <div key={d.name} className="rounded-lg border border-border bg-background/60 p-2">
                    <p className="text-xs text-muted-foreground">{d.name}</p>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.1 }}>{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Panel title="Department mix" icon={<Users className="h-4 w-4" />}>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie key="pie" data={byDept} dataKey="value" nameKey="name" innerRadius={48} outerRadius={84} paddingAngle={2}>
                    {byDept.map((d) => <Cell key={d.name} fill={DEPT_COLORS[d.name as Dept]} />)}
                  </Pie>
                  <Tooltip key="tip" contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Leave requests" icon={<PlaneTakeoff className="h-4 w-4" />} className="xl:col-span-2"
            action={<Pill tone={leaveRequests.length ? 'warn' : 'up'}>{leaveRequests.length}</Pill>}>
            {leaveRequests.length === 0 ? (
              <EmptyState label="No pending leave requests." />
            ) : (
              <div className="space-y-2">
                {leaveRequests.map((s) => {
                  const decided = leave[s.id];
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.role} · {s.branchName}</p>
                      </div>
                      {decided ? (
                        <Pill tone={decided === 'approved' ? 'up' : 'down'}>{decided}</Pill>
                      ) : (
                        <div className="flex shrink-0 gap-1.5">
                          <button onClick={() => setLeave((l) => ({ ...l, [s.id]: 'approved' }))}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground hover:opacity-90">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </button>
                          <button onClick={() => setLeave((l) => ({ ...l, [s.id]: 'declined' }))}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-red-500/50 hover:text-red-600">
                            <XCircle className="h-3.5 w-3.5" /> Decline
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* Roster */}
        <Panel title="Staff roster" icon={<Users className="h-4 w-4" />} action={<Pill tone="muted">{staff.length}</Pill>}>
          <DataTable columns={rosterCols} rows={staff} getRowId={(r) => r.id} csvName="staff-roster" minWidth={820} maxHeight={520} />
        </Panel>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- subcomponents */

function Kpi({ icon, label, value, tone = 'default', money = false }: {
  icon: React.ReactNode; label: string; value: number; money?: boolean;
  tone?: 'ok' | 'warn' | 'info' | 'default';
}) {
  const toneClass =
    tone === 'ok' ? 'text-emerald-600' :
    tone === 'warn' ? 'text-amber-600' :
    tone === 'info' ? 'text-primary' : 'text-foreground';
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-sm">{label}</span></div>
      <p className={`mt-2 ${toneClass}`} style={{ fontSize: money ? '1.5rem' : '1.9rem', lineHeight: 1.05 }}>
        <AnimatedCounter value={value} format={money ? (n) => formatCedis(n) : undefined} />
      </p>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 12, border: '1px solid var(--border)',
  background: 'var(--popover)', color: 'var(--popover-foreground)', fontSize: 12,
} as const;

export default HRDashboard;
