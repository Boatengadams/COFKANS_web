/**
 * Staff provisioning + developer-claim grants. Replaces the legacy
 * DeveloperConsole staff manager. Every mutation is re-auth gated and
 * mirrored to auditLogs.
 *
 * Account *creation* (new Firebase user) is intentionally not here — that
 * happens via Firebase Auth invite-email flow. This panel only edits
 * staffAccounts rows for users who have already signed in once.
 */
import {useEffect, useState} from 'react';
import {collection, getFirestore, onSnapshot, orderBy, query} from 'firebase/firestore';
import type {StaffAccount, StaffRole} from '@/lib/staff';
import {upsertStaffAccount} from '@/lib/staff';
import {forceSignOut, setDeveloperClaim, writeAuditLog} from '@/lib/totp-client';
import {promptReauth, reauthWithPassword} from '../reauth';

type Row = StaffAccount & {developerClaimGrantedAt?: unknown};

const ROLES: StaffRole[] = ['branch_manager', 'rider', 'front_desk', 'developer'];

export function StaffPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busyUid, setBusyUid] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(getFirestore(), 'staffAccounts'), orderBy('email'));
    return onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({...(d.data() as Row), uid: d.id}))),
      (e) => setErr(e.message)
    );
  }, []);

  async function withReauth(uid: string, fn: () => Promise<void>) {
    setErr(null);
    const pwd = await promptReauth();
    if (!pwd) return;
    setBusyUid(uid);
    try {
      await reauthWithPassword(pwd);
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setBusyUid(null);
    }
  }

  async function saveRole(row: Row, role: StaffRole, branchSlug?: string) {
    await withReauth(row.uid, async () => {
      await upsertStaffAccount({...row, role, branchSlug});
      await writeAuditLog({action: 'staff.update', target: row.uid, meta: {role, branchSlug}});
    });
  }

  async function toggleActive(row: Row) {
    await withReauth(row.uid, async () => {
      await upsertStaffAccount({...row, active: !row.active});
      await writeAuditLog({action: row.active ? 'staff.deactivate' : 'staff.activate', target: row.uid});
    });
  }

  async function grantDev(row: Row, grant: boolean) {
    await withReauth(row.uid, async () => {
      await setDeveloperClaim(row.uid, grant);
      await writeAuditLog({action: grant ? 'claim.grant.developer' : 'claim.revoke.developer', target: row.uid});
    });
  }

  async function signOut(row: Row) {
    await withReauth(row.uid, async () => {
      await forceSignOut(row.uid);
      await writeAuditLog({action: 'session.forceSignOut', target: row.uid});
    });
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">Staff accounts · {rows.length}</div>
      {err && <p className="px-4 py-3 text-destructive border-b border-border">{err}</p>}
      <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {rows.map((r) => (
          <li key={r.uid} className="p-4 grid gap-3 sm:grid-cols-[1fr_auto] items-start">
            <div className="min-w-0">
              <div className="truncate">{r.email}</div>
              <div className="text-muted-foreground mt-1 truncate">
                {r.displayName ?? '—'} · {r.uid}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <select
                  value={r.role}
                  onChange={(e) => saveRole(r, e.target.value as StaffRole, r.branchSlug)}
                  className="bg-input-background border border-border rounded px-2 py-1"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {(r.role === 'branch_manager' || r.role === 'rider') && (
                  <input
                    defaultValue={r.branchSlug ?? ''}
                    placeholder="branch-slug"
                    onBlur={(e) => {
                      if (e.target.value !== (r.branchSlug ?? '')) saveRole(r, r.role, e.target.value);
                    }}
                    className="bg-input-background border border-border rounded px-2 py-1"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => toggleActive(r)}
                disabled={busyUid === r.uid}
                className="border border-border rounded px-3 py-1 disabled:opacity-50"
              >
                {r.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => grantDev(r, !r.developerClaimGrantedAt)}
                disabled={busyUid === r.uid}
                className="border border-border rounded px-3 py-1 disabled:opacity-50"
              >
                {r.developerClaimGrantedAt ? 'Revoke dev claim' : 'Grant dev claim'}
              </button>
              <button
                onClick={() => signOut(r)}
                disabled={busyUid === r.uid}
                className="border border-destructive text-destructive rounded px-3 py-1 disabled:opacity-50"
              >
                Force sign-out
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

