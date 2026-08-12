import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { BRANCHES } from '../../../lib/branches';
import { provisionStaffUser, type StaffAccount, type StaffRole } from '../../../lib/staff';
import toast from 'react-hot-toast';

/**
 * Developer-only screen for provisioning staff accounts through the server
 * callable. The browser never creates Auth users or staffAccounts rows.
 */
export function StaffProvisioningPanel() {
  const [accounts, setAccounts] = useState<StaffAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<StaffRole>('branch_manager');
  const [branchSlug, setBranchSlug] = useState(BRANCHES[0].slug);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    tempPassword: string;
    resetLink: string;
  } | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'staffAccounts'));
      setAccounts(snap.docs.map(d => d.data() as StaffAccount));
    } catch {
      // ignored; UI shows empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const result = await provisionStaffUser({
        email: email.toLowerCase().trim(),
        role,
        branchSlug: (role === 'branch_manager' || role === 'rider') ? branchSlug : undefined,
        displayName: displayName || email,
        phone: phone || undefined,
        createdBy: 'callable',
      });
      toast.success(`${email} is now a ${role.replace('_', ' ')}`);
      setCreatedCredentials({
        email: email.toLowerCase().trim(),
        tempPassword: result.tempPassword,
        resetLink: result.resetLink,
      });
      setEmail(''); setDisplayName(''); setPhone('');
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to provision');
    } finally {
      setSubmitting(false);
    }
  };

  const revoke = async (uid: string, who: string) => {
    if (!confirm(`Revoke staff access for ${who}? They will lose portal access immediately.`)) return;
    try {
      await deleteDoc(doc(db, 'staffAccounts', uid));
      toast.success('Revoked');
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke');
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-card border-2 border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary"><UserPlus className="w-5 h-5" /></div>
          <div>
            <h2 className="font-bold text-lg">Provision Staff Account</h2>
            <p className="text-xs text-muted-foreground">Creates Auth, Firestore rows, and staff claims server-side.</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Company email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background"
              placeholder="staff@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Role</label>
            <select
              value={role} onChange={e => setRole(e.target.value as StaffRole)}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background"
            >
              <option value="branch_manager">Branch Manager</option>
              <option value="rider">Rider / Driver</option>
              <option value="front_desk">Front Desk / Showroom</option>
              <option value="developer">Developer (full access)</option>
            </select>
          </div>
          {(role === 'branch_manager' || role === 'rider') && (
            <div>
              <label className="block text-xs font-bold mb-1">Branch</label>
              <select
                value={branchSlug} onChange={e => setBranchSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background"
              >
                {BRANCHES.map(b => <option key={b.slug} value={b.slug}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold mb-1">Display name (optional)</label>
            <input
              type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background"
              placeholder="Vanessa Mensah"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Phone (optional)</label>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border-2 border-border bg-background"
              placeholder="+233 ..."
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <motion.button
              whileTap={{ scale: 0.97 }} type="submit" disabled={submitting}
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-bold flex items-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Provision staff
            </motion.button>
          </div>
        </form>
        {createdCredentials && (
          <div className="mt-4 rounded-lg border-2 border-border bg-background p-4 text-sm">
            <p className="font-semibold">Temporary credentials for {createdCredentials.email}</p>
            <p className="mt-2 break-all">Password: {createdCredentials.tempPassword}</p>
            <p className="mt-1 break-all">Reset link: {createdCredentials.resetLink}</p>
          </div>
        )}
      </section>

      <section className="bg-card border-2 border-border rounded-2xl p-6">
        <h2 className="font-bold text-lg mb-4">Active staff accounts</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet. Provision the first one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2">Email</th><th>Role</th><th>Branch</th><th>Name</th><th></th></tr>
              </thead>
              <tbody>
                {accounts.map(a => (
                  <tr key={a.uid} className="border-t border-border">
                    <td className="py-2.5 font-mono text-xs">{a.email}</td>
                    <td className="capitalize">{a.role.replace('_', ' ')}</td>
                    <td>{a.branchSlug ? BRANCHES.find(b => b.slug === a.branchSlug)?.name ?? a.branchSlug : '—'}</td>
                    <td className="text-muted-foreground">{a.displayName ?? '—'}</td>
                    <td className="text-right">
                      <button
                        onClick={() => revoke(a.uid, a.email)}
                        className="p-1.5 rounded hover:bg-rose-500/10 text-rose-500"
                        title="Revoke access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
