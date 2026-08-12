import { useEffect, useState } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserManagementPanel } from '../admin/UserManagementPanel';
import { Activity, Users } from 'lucide-react';

interface SessionRow {
  uid: string;
  lastSeen?: any;
  mfaVerifiedAt?: any;
  deviceLabel?: string;
  ip?: string;
}

function fmt(v: any): string {
  if (!v) return '—';
  const d = typeof v?.toDate === 'function' ? v.toDate() : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

function ActiveStaffSessions() {
  const [rows, setRows] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let snap;
        try {
          snap = await getDocs(query(
            collection(db, 'staffSessions'),
            orderBy('lastSeen', 'desc'),
            limit(50),
          ));
        } catch {
          snap = await getDocs(query(collection(db, 'staffSessions'), limit(50)));
        }
        if (cancelled) return;
        setRows(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load staff sessions.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="erp-card erp-elevate rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="erp-sheen p-3 bg-emerald-500/10 rounded-xl ring-1 ring-emerald-500/20">
          <Activity className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Active Staff Sessions</h2>
          <p className="text-sm text-muted-foreground">
            Last 50 sessions from <code>staffSessions</code>. Read-only.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading sessions…</p>
        </div>
      ) : err ? (
        <div className="text-center py-10 text-sm text-muted-foreground">{err}</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-sm text-muted-foreground">No staff sessions recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2">UID</th>
                <th className="text-left py-2 px-2">Device</th>
                <th className="text-left py-2 px-2">IP</th>
                <th className="text-left py-2 px-2">MFA Verified</th>
                <th className="text-left py-2 px-2">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.uid} className="border-b border-border/50">
                  <td className="py-2 px-2 font-mono text-xs">{r.uid.slice(0, 10)}…</td>
                  <td className="py-2 px-2">{r.deviceLabel || '—'}</td>
                  <td className="py-2 px-2">{r.ip || '—'}</td>
                  <td className="py-2 px-2">{fmt(r.mfaVerifiedAt)}</td>
                  <td className="py-2 px-2">{fmt(r.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function StaffAndSessionsPanel() {
  return (
    <div className="space-y-6">
      <div className="erp-card erp-elevate flex items-center gap-3 rounded-2xl p-4">
        <div className="erp-sheen p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20">
          <Users className="w-6 h-6 text-primary" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="erp-gradient-text" style={{ fontSize: '1.5rem', lineHeight: 1.15 }}>Staff & Sessions</h1>
          <p className="text-sm text-muted-foreground">
            Create workers, change roles, and review live staff sessions. Every mutating action requires the developer passcode.
          </p>
        </div>
      </div>

      <UserManagementPanel />
      <ActiveStaffSessions />
    </div>
  );
}
