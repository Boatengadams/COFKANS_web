import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import { computeDeviceFingerprint, revokeAllOtherSessions } from '../../../lib/session-service';
import { Monitor, Smartphone, Trash2, ShieldCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeviceEntry {
  fingerprint: string;
  isCurrent: boolean;
}

export function SignedInDevices() {
  const { firebaseUser } = useFirebaseAuth();
  const [devices, setDevices] = useState<DeviceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFp, setCurrentFp] = useState<string>('');

  useEffect(() => {
    if (!firebaseUser) return;
    (async () => {
      setLoading(true);
      const fp = await computeDeviceFingerprint();
      setCurrentFp(fp);
      try {
        const snap = await getDoc(doc(db, 'knownDevices', firebaseUser.uid));
        const fingerprints: string[] = snap.exists() ? (snap.data().fingerprints || []) : [];
        setDevices(fingerprints.map(f => ({ fingerprint: f, isCurrent: f === fp })));
      } catch (e) {
        console.warn('load devices failed:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [firebaseUser?.uid]);

  const revoke = async (fp: string) => {
    if (!firebaseUser) return;
    if (fp === currentFp) {
      toast.error('You can\'t revoke the device you\'re using right now.');
      return;
    }
    if (!confirm('Revoke this device? It will be flagged as new the next time it signs in.')) return;
    const next = devices.filter(d => d.fingerprint !== fp).map(d => d.fingerprint);
    try {
      await setDoc(doc(db, 'knownDevices', firebaseUser.uid), { fingerprints: next, lastSeenAt: serverTimestamp() }, { merge: true });
      setDevices(devices.filter(d => d.fingerprint !== fp));
      toast.success('Device revoked.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to revoke device.');
    }
  };

  const signOutEverywhereElse = async () => {
    if (!firebaseUser) return;
    if (!confirm('Sign out of every other browser and device? You\'ll stay signed in here.')) return;
    try {
      await revokeAllOtherSessions(firebaseUser.uid);
      toast.success('Signed out of all other devices.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to sign out other devices.');
    }
  };

  if (!firebaseUser) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold mb-1">Signed-in devices</h4>
          <p className="text-sm text-muted-foreground">
            Browsers we've seen sign in to your account. Revoke any you don't recognize.
          </p>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {!loading && devices.length === 0 && (
        <div className="text-sm text-muted-foreground p-4 border-2 border-dashed border-border rounded-xl">
          No devices tracked yet. Sign in again to register this one.
        </div>
      )}

      <div className="space-y-2">
        {devices.map(d => {
          const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) && d.isCurrent;
          const Icon = isMobile ? Smartphone : Monitor;
          return (
            <div
              key={d.fingerprint}
              className="flex items-center justify-between gap-3 p-3 bg-background border-2 border-border rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-xs truncate">{d.fingerprint.slice(0, 16)}…</div>
                  {d.isCurrent && (
                    <div className="text-xs text-primary font-bold mt-0.5">This device</div>
                  )}
                </div>
              </div>
              {!d.isCurrent && (
                <button
                  onClick={() => revoke(d.fingerprint)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  aria-label="Revoke device"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {devices.length > 1 && (
        <button
          onClick={signOutEverywhereElse}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors text-sm font-bold"
        >
          <LogOut className="w-4 h-4" />
          Sign out of all other devices
        </button>
      )}
    </div>
  );
}
