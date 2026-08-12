/**
 * Build / runtime info. Reads vite-injected env vars set by the deploy
 * workflow (VITE_BUILD_SHA, VITE_BUILD_AT). Falls back to "dev" if missing
 * so local dev doesn't show "unknown" everywhere.
 */
import {getApp} from 'firebase/app';

export function VersionPanel() {
  const env = import.meta.env;
  const rows: [string, string][] = [
    ['Build SHA', env.VITE_BUILD_SHA ?? 'dev'],
    ['Build time', env.VITE_BUILD_AT ?? 'dev'],
    ['Firebase project', getApp().options.projectId ?? '—'],
    ['Auth domain', getApp().options.authDomain ?? '—'],
    ['Hostname', typeof window === 'undefined' ? '—' : window.location.hostname],
    ['User agent', typeof navigator === 'undefined' ? '—' : navigator.userAgent],
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">Build & environment</div>
      <ul className="divide-y divide-border">
        {rows.map(([k, v]) => (
          <li key={k} className="px-4 py-3 grid grid-cols-[8rem_1fr] gap-3">
            <span className="text-muted-foreground">{k}</span>
            <span className="break-all">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
