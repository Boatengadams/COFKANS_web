import React from 'react';
import ReactDOM from 'react-dom/client';

// Filter out the non-actionable Firestore WebChannel transport warning
// before firebase loads. Long-polling is forced in lib/firebase.ts but
// transient reconnects (or stale service-worker caches) can still emit
// this WARN, and there's nothing the user can do about it.
const __origLog = console.log.bind(console);
const __origWarn = console.warn.bind(console);
const __origError = console.error.bind(console);
const __isFirestoreNoise = (args: unknown[]) => {
  const first = args[0];
  return typeof first === 'string'
    && first.includes('@firebase/firestore')
    && first.includes('WebChannelConnection')
    && first.includes('transport errored');
};
console.log = (...args: unknown[]) => { if (!__isFirestoreNoise(args)) __origLog(...args); };
console.warn = (...args: unknown[]) => { if (!__isFirestoreNoise(args)) __origWarn(...args); };
console.error = (...args: unknown[]) => { if (!__isFirestoreNoise(args)) __origError(...args); };

import './lib/firebase';
import { AppRouter } from './app/AppRouter';
import { installResourceHints } from './lib/perf/resource-hints';
import './styles/index.css';

declare global {
  interface Window {
    __cofkansSplashReady?: () => void;
  }
}

function StartupReadyBoundary() {
  React.useEffect(() => {
    let mounted = true;
    const frame = window.requestAnimationFrame(() => {
      (async () => {
        // Wait a short time for first paint and (optionally) for fonts to be ready
        try {
          const fontReady = (document as any).fonts?.ready ?? Promise.resolve();
          await Promise.race([new Promise((r) => setTimeout(r, 120)), fontReady]);
        } catch (e) { /* ignore */ }

        if (mounted) window.__cofkansSplashReady?.();
      })();
    });

    return () => { mounted = false; window.cancelAnimationFrame(frame); };
  }, []);

  return <AppRouter />;
}

// Warm up CDN connections before first render.
// Never let a hint failure block the app from mounting.
try { installResourceHints(); } catch { /* noop */ }

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StartupReadyBoundary />
  </React.StrictMode>
);
