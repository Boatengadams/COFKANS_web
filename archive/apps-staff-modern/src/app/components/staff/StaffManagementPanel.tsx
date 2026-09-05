/**
 * Shared Staff Management panel.
 *
 * Mounted by BOTH the Developer portal and the Manager portal so each has the
 * same, full-power user administration: create accounts, assign roles, delete,
 * and suspend an account for a specific period (with a reason). It reads/writes
 * the single backend-free staff store (dp:staff), so both portals stay in sync.
 *
 * Pass `actor` (the email/name of whoever is acting) so every mutation is
 * attributed correctly in the activity log.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import {
  Users, Plus, Trash2, Search, X, ShieldOff, ShieldCheck, Clock, AlertTriangle, KeyRound,
} from 'lucide-react';
import {
  store, onStoreChange, isCurrentlySuspended,
  type StaffMember, type StaffRole,
} from '../../pages/developer-portal/store';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';

interface Props {
  /** Who is performing the action — used for audit log attribution. */
  actor?: string;
  /** Optional heading override. */
  title?: string;
  subtitle?: string;
}

const ROLES: StaffRole[] = [
  'manager', 'front_desk', 'branch_desk', 'driver', 'technician',
  'warehouse', 'accountant', 'hr', 'procurement', 'marketing', 'developer',
];

const ROLE_LABEL: Record<StaffRole, string> = {
  manager: 'Manager', front_desk: 'Front Desk', branch_desk: 'Branch Desk',
  driver: 'Driver', technician: 'Technician', warehouse: 'Warehouse',
  accountant: 'Accountant', hr: 'Human Resources', procurement: 'Procurement',
  marketing: 'Marketing', developer: 'Developer',
};

const SUSPEND_PRESETS: { label: string; days: number }[] = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
];

const inputCls = 'w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm';
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[9600] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="erp-card erp-elevate-lg rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: '1.15rem' }}>{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export function StaffManagementPanel({ actor = 'developer', title = 'Staff & Accounts', subtitle }: Props) {
  const [, setTick] = useState(0);
  useEffect(() => onStoreChange(() => setTick((t) => t + 1)), []);

  const { canManageUsers } = useFirebaseAuth();
  const staff = store.getStaff();
  const [q, setQ] = useState('');
  const [creating, setCreating] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<StaffMember | null>(null);
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? staff.filter((m) => (m.name + m.email + m.role + m.branch).toLowerCase().includes(s)) : staff;
  }, [staff, q]);

  const activeCount = staff.filter((m) => !isCurrentlySuspended(m)).length;
  const suspendedCount = staff.length - activeCount;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="erp-sheen p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20"><Users className="w-6 h-6 text-primary" /></div>
        <div className="flex-1">
          <h2 className="erp-gradient-text" style={{ fontSize: '1.5rem', lineHeight: 1.15 }}>{title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {subtitle ?? `${staff.length} accounts · ${activeCount} active · ${suspendedCount} suspended`}
          </p>
        </div>
        {canManageUsers && (
          <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 transition text-sm">
            <Plus className="w-4 h-4" /> New account
          </button>
        )}
      </div>

      {!canManageUsers && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/50 border border-border">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          Only a manager or developer can create, edit or delete accounts. You have read-only access.
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search staff…" className={`${inputCls} pl-9`} />
      </div>

      <div className="erp-card erp-elevate rounded-2xl p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground bg-muted/40">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Branch</th>
                <th className="text-left p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const suspended = isCurrentlySuspended(m);
                return (
                  <tr key={m.id} className="border-t border-border/60">
                    <td className="p-3">{m.name}</td>
                    <td className="p-3 text-muted-foreground">{m.email}</td>
                    <td className="p-3">
                      {canManageUsers ? (
                        <select
                          value={m.role}
                          onChange={(e) => store.updateStaff(m.id, { role: e.target.value as StaffRole })}
                          className="bg-transparent border border-border rounded-md px-2 py-1 text-xs"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                        </select>
                      ) : (
                        <span className="text-xs">{ROLE_LABEL[m.role]}</span>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">{m.branch}</td>
                    <td className="p-3">
                      {suspended ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-500/15 text-amber-600" title={m.suspendedReason || ''}>
                          <Clock className="w-3 h-3" />
                          {m.suspendedUntil ? `until ${fmtDate(m.suspendedUntil)}` : 'indefinite'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-emerald-500/15 text-emerald-600">active</span>
                      )}
                    </td>
                    <td className="p-3">
                      {canManageUsers ? (
                        <div className="flex items-center justify-end gap-1.5">
                          {suspended ? (
                            <button onClick={() => store.reinstateStaff(m.id, actor)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10">
                              <ShieldCheck className="w-3.5 h-3.5" /> Reinstate
                            </button>
                          ) : (
                            <button onClick={() => setSuspendTarget(m)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                              <ShieldOff className="w-3.5 h-3.5" /> Suspend
                            </button>
                          )}
                          <button onClick={() => setResetTarget(m)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-border text-muted-foreground hover:border-primary hover:text-foreground" title="Reset password">
                            <KeyRound className="w-3.5 h-3.5" /> Reset
                          </button>
                          <button onClick={() => { if (confirm(`Delete ${m.name}? This cannot be undone.`)) store.deleteStaff(m.id, actor); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-right text-xs text-muted-foreground">—</div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No staff match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {creating && <CreateForm actor={actor} onClose={() => setCreating(false)} />}
      {suspendTarget && <SuspendForm member={suspendTarget} actor={actor} onClose={() => setSuspendTarget(null)} />}
      {resetTarget && <ResetPasswordForm member={resetTarget} actor={actor} onClose={() => setResetTarget(null)} />}
    </div>
  );
}

function CreateForm({ actor, onClose }: { actor: string; onClose: () => void }) {
  const [form, setForm] = useState<Omit<StaffMember, 'id' | 'createdAt'>>({
    name: '', email: '', role: 'front_desk', branch: 'Asuoyeboa (Main)', status: 'active', password: '',
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => {
    if (!form.name.trim() || !form.email.trim()) { alert('Name and email are required.'); return; }
    if (!form.password || form.password.trim().length < 6) { alert('Set a password of at least 6 characters.'); return; }
    store.addStaff(form, actor);
    onClose();
  };
  return (
    <Modal title="Create staff account" onClose={onClose}>
      <div className="space-y-4">
        <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Full name</span>
          <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
        <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Email</span>
          <input className={inputCls} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@cofkanselectricals.com" /></label>
        <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Password</span>
          <input className={inputCls} type="text" value={form.password ?? ''} onChange={(e) => set('password', e.target.value)} placeholder="At least 6 characters" />
          <span className="text-[11px] text-muted-foreground mt-1 block">The user signs in with their email (or username) + this password.</span></label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Role</span>
            <select className={inputCls} value={form.role} onChange={(e) => set('role', e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select></label>
          <label className="block"><span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Branch</span>
            <input className={inputCls} value={form.branch} onChange={(e) => set('branch', e.target.value)} /></label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm">Cancel</button>
          <button onClick={save} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 text-sm"><Plus className="w-4 h-4" /> Create account</button>
        </div>
      </div>
    </Modal>
  );
}

function SuspendForm({ member, actor, onClose }: { member: StaffMember; actor: string; onClose: () => void }) {
  const [days, setDays] = useState<number>(7);
  const [indefinite, setIndefinite] = useState(false);
  const [reason, setReason] = useState('');

  const apply = () => {
    store.suspendStaff(member.id, { days: indefinite ? 0 : days, reason: reason.trim() || undefined, actor });
    onClose();
  };

  const until = !indefinite ? new Date(Date.now() + days * 86_400_000) : null;

  return (
    <Modal title={`Suspend ${member.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          A suspended account can't access its portal until the period ends or an admin reinstates it.
        </div>

        <div>
          <span className="text-xs uppercase tracking-wide text-muted-foreground block mb-2">Suspension period</span>
          <div className="flex flex-wrap gap-2">
            {SUSPEND_PRESETS.map((p) => (
              <button
                key={p.days}
                onClick={() => { setDays(p.days); setIndefinite(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs border transition ${!indefinite && days === p.days ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}
              >{p.label}</button>
            ))}
            <button
              onClick={() => setIndefinite(true)}
              className={`px-3 py-1.5 rounded-lg text-xs border transition ${indefinite ? 'bg-destructive text-destructive-foreground border-destructive' : 'border-border hover:bg-muted'}`}
            >Indefinite</button>
          </div>
        </div>

        {!indefinite && (
          <label className="block">
            <span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Custom days</span>
            <input type="number" min={1} className={inputCls} value={days} onChange={(e) => setDays(Math.max(1, Number(e.target.value)))} />
            <span className="text-xs text-muted-foreground mt-1 block">Reactivates on {until ? fmtDate(until.getTime()) : ''}.</span>
          </label>
        )}

        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">Reason (optional)</span>
          <textarea className={`${inputCls} resize-none`} rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. policy violation, pending investigation" />
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm">Cancel</button>
          <button onClick={apply} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-black hover:opacity-90 text-sm"><ShieldOff className="w-4 h-4" /> Suspend account</button>
        </div>
      </div>
    </Modal>
  );
}

function ResetPasswordForm({ member, actor, onClose }: { member: StaffMember; actor: string; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const apply = () => {
    if (password.trim().length < 6) { alert('Set a password of at least 6 characters.'); return; }
    store.setPassword(member.id, password, actor);
    onClose();
  };
  return (
    <Modal title={`Reset password — ${member.name}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/50 border border-border">
          <KeyRound className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          Set a temporary password for <b className="text-foreground">{member.email}</b>. Share it securely — they'll be required to choose their own password the next time they sign in.
        </div>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-muted-foreground block mb-1.5">New password</span>
          <input className={inputCls} type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoFocus />
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-sm">Cancel</button>
          <button onClick={apply} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground erp-glow hover:opacity-90 text-sm"><KeyRound className="w-4 h-4" /> Set password</button>
        </div>
      </div>
    </Modal>
  );
}

export default StaffManagementPanel;
