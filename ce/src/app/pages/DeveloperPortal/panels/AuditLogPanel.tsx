/**
 * Live feed of /auditLogs, newest first. Read-only — entries are append-only
 * (rules deny update/delete) and also mirrored to BigQuery via the Pub/Sub
 * sink so retention outlives Firestore TTLs.
 */
import {useEffect, useState} from 'react';
import {collection, getFirestore, limit, onSnapshot, orderBy, query, type Timestamp} from 'firebase/firestore';

interface Row {
  id: string;
  actorEmail?: string | null;
  actorUid: string;
  action: string;
  target?: string | null;
  meta?: Record<string, unknown> | null;
  ip?: string | null;
  at?: Timestamp;
}

export function AuditLogPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(getFirestore(), 'auditLogs'), orderBy('at', 'desc'), limit(200));
    return onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<Row, 'id'>)}))),
      (e) => setErr(e.message)
    );
  }, []);

  if (err) return <p className="text-destructive">{err}</p>;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">Audit log · last 200 events</div>
      <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {rows.length === 0 && <li className="p-6 text-muted-foreground">No events yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="px-4 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate">{r.action}</span>
              <span className="text-muted-foreground shrink-0">
                {r.at?.toDate().toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="text-muted-foreground mt-1 truncate">
              {r.actorEmail ?? r.actorUid}
              {r.target ? ` → ${r.target}` : ''}
              {r.ip ? ` · ${r.ip}` : ''}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
