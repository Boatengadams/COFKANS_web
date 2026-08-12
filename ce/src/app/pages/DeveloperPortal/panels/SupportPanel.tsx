/**
 * Read-only support-ticket inbox. Tickets are created from the customer
 * support widget; the developer portal reads them so on-call can triage
 * without granting full admin to every staffer.
 */
import {useEffect, useState} from 'react';
import {collection, getFirestore, limit, onSnapshot, orderBy, query, type Timestamp} from 'firebase/firestore';

interface Ticket {
  id: string;
  uid?: string;
  email?: string;
  subject?: string;
  body?: string;
  status?: string;
  createdAt?: Timestamp;
}

export function SupportPanel() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(getFirestore(), 'supportTickets'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snap) => setTickets(snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<Ticket, 'id'>)}))),
      (e) => setErr(e.message)
    );
  }, []);

  if (err) return <p className="text-destructive">{err}</p>;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">Support inbox · {tickets.length}</div>
      <ul className="divide-y divide-border max-h-[60vh] overflow-y-auto">
        {tickets.length === 0 && <li className="p-6 text-muted-foreground">No tickets yet.</li>}
        {tickets.map((t) => (
          <li key={t.id} className="px-4 py-3">
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate">{t.subject ?? '(no subject)'}</span>
              <span className="text-muted-foreground shrink-0">
                {t.createdAt?.toDate().toLocaleString() ?? '—'}
              </span>
            </div>
            <div className="text-muted-foreground mt-1 truncate">
              {t.email ?? t.uid ?? '—'} · {t.status ?? 'open'}
            </div>
            {t.body && <p className="mt-2 text-muted-foreground line-clamp-3">{t.body}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
