/**
 * Collection-count snapshot. Uses Firestore's server-side count aggregation
 * so we don't pay per-document read costs just to render the dashboard.
 *
 * Counts refresh on mount and on demand — there's no live subscription,
 * because aggregation queries don't support onSnapshot.
 */
import {useCallback, useEffect, useState} from 'react';
import {collection, getCountFromServer, getFirestore} from 'firebase/firestore';

const COLLECTIONS = ['users', 'orders', 'staffAccounts', 'branchSettings', 'supportTickets', 'errorLogs'] as const;

export function StatsPanel() {
  const [counts, setCounts] = useState<Record<string, number | string>>({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    const db = getFirestore();
    const next: Record<string, number | string> = {};
    await Promise.all(
      COLLECTIONS.map(async (name) => {
        try {
          const snap = await getCountFromServer(collection(db, name));
          next[name] = snap.data().count;
        } catch (e) {
          next[name] = e instanceof Error ? e.message.split('\n')[0] : '—';
        }
      })
    );
    setCounts(next);
    setBusy(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <span>Collection sizes</span>
        <button onClick={load} disabled={busy} className="border border-border rounded px-3 py-1 disabled:opacity-50">
          {busy ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
      <ul className="divide-y divide-border">
        {COLLECTIONS.map((name) => (
          <li key={name} className="px-4 py-3 flex items-baseline justify-between">
            <span>{name}</span>
            <span className="text-muted-foreground">{counts[name] ?? '…'}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

