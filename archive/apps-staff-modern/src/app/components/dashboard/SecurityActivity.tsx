import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { SecurityEventType } from '@/lib/security-service';
import { Activity, CheckCircle2, AlertTriangle, Lock, ShieldAlert } from 'lucide-react';

interface EventRow {
  id: string;
  type: SecurityEventType;
  timestamp: Date | null;
  metadata?: Record<string, any>;
}

const TYPE_META: Record<string, { label: string; tone: 'ok' | 'warn' | 'bad'; Icon: typeof Activity }> = {
  [SecurityEventType.LOGIN_SUCCESS]:        { label: 'Signed in',               tone: 'ok',   Icon: CheckCircle2 },
  [SecurityEventType.LOGIN_FAILED]:         { label: 'Failed sign-in attempt',  tone: 'warn', Icon: AlertTriangle },
  [SecurityEventType.ACCOUNT_LOCKED]:       { label: 'Account locked',          tone: 'bad',  Icon: Lock },
  [SecurityEventType.ACCOUNT_UNLOCKED]:     { label: 'Account unlocked',        tone: 'ok',   Icon: CheckCircle2 },
  [SecurityEventType.SUSPICIOUS_ACTIVITY]:  { label: 'Suspicious activity',     tone: 'bad',  Icon: ShieldAlert },
  [SecurityEventType.RATE_LIMIT_EXCEEDED]:  { label: 'Rate limit hit',          tone: 'warn', Icon: AlertTriangle },
};

function fmt(d: Date | null) {
  if (!d) return '—';
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  return d.toLocaleString();
}

export function SecurityActivity() {
  const { firebaseUser } = useFirebaseAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    (async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'securityEvents'),
          where('userId', '==', firebaseUser.uid),
          orderBy('timestamp', 'desc'),
          limit(20),
        );
        const snap = await getDocs(q);
        setEvents(snap.docs.map(d => {
          const data = d.data();
          const ts = data.timestamp as Timestamp | undefined;
          return {
            id: d.id,
            type: data.type,
            timestamp: ts ? ts.toDate() : null,
            metadata: data.metadata,
          };
        }));
      } catch (e) {
        console.warn('load security activity failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [firebaseUser?.uid]);

  if (!firebaseUser) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-1">Recent security activity</h4>
          <p className="text-sm text-muted-foreground">
            Your last 20 sign-in and security events. If you see something you didn't do, change your password.
          </p>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {!loading && events.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 border-2 border-dashed border-border rounded-xl">
          No security activity recorded yet.
        </div>
      )}

      <div className="space-y-2">
        {events.map(e => {
          const meta = TYPE_META[e.type] ?? { label: e.type, tone: 'warn' as const, Icon: Activity };
          const toneClass =
            meta.tone === 'ok' ? 'text-emerald-600' :
            meta.tone === 'bad' ? 'text-destructive' :
            'text-amber-600';
          const Icon = meta.Icon;
          const newDevice = e.metadata?.newDevice === true;
          return (
            <div
              key={e.id}
              className="flex items-center justify-between gap-3 p-3 bg-background border-2 border-border rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-5 h-5 flex-shrink-0 ${toneClass}`} />
                <div className="min-w-0">
                  <div className="font-bold text-sm truncate">
                    {meta.label}{newDevice && ' · new device'}
                  </div>
                  <div className="text-xs text-muted-foreground">{fmt(e.timestamp)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
