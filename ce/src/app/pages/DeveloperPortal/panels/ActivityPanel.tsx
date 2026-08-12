/**
 * Live recent-orders feed. Groups the last 100 orders by branch and rider so
 * a developer can spot stalled work at a glance — slow-moving branches, idle
 * riders, or a stack of orders pinned in one status.
 */
import {useEffect, useMemo, useState} from 'react';
import {collection, getFirestore, limit, onSnapshot, orderBy, query, type Timestamp} from 'firebase/firestore';

interface Order {
  id: string;
  status?: string;
  branchSlug?: string;
  riderUid?: string;
  total?: number;
  createdAt?: Timestamp;
}

export function ActivityPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(getFirestore(), 'orders'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      (snap) => setOrders(snap.docs.map((d) => ({id: d.id, ...(d.data() as Omit<Order, 'id'>)}))),
      (e) => setErr(e.message)
    );
  }, []);

  const byBranch = useMemo(() => groupCount(orders, (o) => o.branchSlug ?? '—'), [orders]);
  const byStatus = useMemo(() => groupCount(orders, (o) => o.status ?? '—'), [orders]);
  const byRider = useMemo(() => groupCount(orders.filter((o) => o.riderUid), (o) => o.riderUid!), [orders]);

  if (err) return <p className="text-destructive">{err}</p>;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <BucketCard title="By branch" buckets={byBranch} />
      <BucketCard title="By status" buckets={byStatus} />
      <BucketCard title="By rider" buckets={byRider} empty="No assigned riders in last 100 orders." />
    </div>
  );
}

function BucketCard({title, buckets, empty}: {title: string; buckets: [string, number][]; empty?: string}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">{title}</div>
      <ul className="divide-y divide-border max-h-80 overflow-y-auto">
        {buckets.length === 0 && (
          <li className="px-4 py-6 text-muted-foreground">{empty ?? 'No data.'}</li>
        )}
        {buckets.map(([key, n]) => (
          <li key={key} className="px-4 py-2 flex items-baseline justify-between gap-4">
            <span className="truncate">{key}</span>
            <span className="text-muted-foreground shrink-0">{n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function groupCount<T>(items: T[], pick: (item: T) => string): [string, number][] {
  const acc = new Map<string, number>();
  for (const item of items) {
    const k = pick(item);
    acc.set(k, (acc.get(k) ?? 0) + 1);
  }
  return [...acc.entries()].sort((a, b) => b[1] - a[1]);
}
