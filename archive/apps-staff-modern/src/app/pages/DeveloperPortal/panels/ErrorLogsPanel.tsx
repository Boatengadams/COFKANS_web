/**
 * Client error feed. Reads /errorLogs (append-only via Firestore rules) —
 * the customer app's global error boundary writes here when it catches an
 * uncaught exception. Useful for spotting regressions before users report.
 */
import {useEffect, useState} from 'react';
import {collection, getFirestore, limit, onSnapshot, orderBy, query, type Timestamp} from 'firebase/firestore';

interface Entry {
  id: string;
  message?: string;
  stack?: string;
  url?: string;
  uid?: string;
  ua?: string;
  at?: Timestamp;
}

export function ErrorLogsPanel() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(getFirestore(), 'errorLogs'), orderBy('at', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snap) => setEntries(snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<Entry, 'id'>)}))),
      (e) => setErr(e.message)
    );
  }, []);

  if (err) return <p className="text-destructive">{err}</p>;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">Client errors · last 100</div>
      <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {entries.length === 0 && <li className="p-6 text-muted-foreground">No errors logged.</li>}
        {entries.map((e) => (
          <li key={e.id} className="px-4 py-3">
            <button
              onClick={() => setOpenId(openId === e.id ? null : e.id)}
              className="w-full text-left"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="truncate">{e.message ?? '(no message)'}</span>
                <span className="text-muted-foreground shrink-0">
                  {e.at?.toDate().toLocaleString() ?? '—'}
                </span>
              </div>
              <div className="text-muted-foreground mt-1 truncate">
                {e.url ?? '—'} · {e.uid ?? 'anon'}
              </div>
            </button>
            {openId === e.id && e.stack && (
              <pre className="mt-2 bg-muted p-3 rounded overflow-x-auto text-muted-foreground">{e.stack}</pre>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

