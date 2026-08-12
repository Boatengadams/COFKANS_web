/**
 * Kill switches — flip a boolean inside featureFlags/global. Every flip
 * requires fresh password re-auth and is mirrored to auditLogs.
 *
 * Currently exposed flags (customer app reads these via onSnapshot):
 *   checkoutDisabled    blocks /checkout submit
 *   ordersDisabled      hides "place order" everywhere
 *   maintenanceBanner   shows a banner at the top of the customer app
 */
import {useEffect, useState} from 'react';
import {doc, getFirestore, onSnapshot} from 'firebase/firestore';
import {setFeatureFlag, writeAuditLog} from '../../../../lib/totp-client';
import {promptReauth, reauthWithPassword} from '../reauth';

const FLAGS: {key: string; label: string; warning: string}[] = [
  {key: 'checkoutDisabled', label: 'Disable checkout', warning: 'No customer will be able to pay until you flip this back.'},
  {key: 'ordersDisabled', label: 'Disable order creation', warning: 'Hides "place order" buttons across the app.'},
  {key: 'maintenanceBanner', label: 'Show maintenance banner', warning: 'Customers will see a yellow banner site-wide.'},
];

export function KillSwitchesPanel() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    return onSnapshot(doc(getFirestore(), 'featureFlags/global'), (snap) => {
      setFlags((snap.data() as Record<string, boolean>) ?? {});
    });
  }, []);

  async function toggle(key: string, label: string, next: boolean) {
    setErr(null);
    const pwd = await promptReauth();
    if (!pwd) return;
    setBusyKey(key);
    try {
      await reauthWithPassword(pwd);
      await setFeatureFlag(key, next);
      await writeAuditLog({action: `featureFlag.${next ? 'enable' : 'disable'}`, target: key, meta: {label}});
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">Kill switches</div>
      <ul className="divide-y divide-border">
        {FLAGS.map((f) => {
          const on = !!flags[f.key];
          return (
            <li key={f.key} className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div>{f.label}</div>
                <div className="text-muted-foreground mt-1">{f.warning}</div>
              </div>
              <button
                onClick={() => toggle(f.key, f.label, !on)}
                disabled={busyKey === f.key}
                className={`shrink-0 rounded-full px-4 py-1.5 border ${
                  on ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-muted border-border'
                } disabled:opacity-50`}
              >
                {busyKey === f.key ? '…' : on ? 'ON' : 'off'}
              </button>
            </li>
          );
        })}
      </ul>
      {err && <p className="px-4 py-3 text-destructive border-t border-border">{err}</p>}
    </div>
  );
}
