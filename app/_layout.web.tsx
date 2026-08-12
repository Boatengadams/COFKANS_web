/**
 * Root layout (Web) — the web SPA in `src/app/App.tsx` already wraps itself
 * in its own providers (FirebaseAuthProvider, HoverProvider, …) and renders
 * the full storefront + role-aware staff portals. So the web router layout
 * only needs to pull in the global styles and render the matched route.
 *
 * Native uses `./_layout.tsx`; this `.web` variant overrides it on web.
 */
import '../src/styles/index.css';
import '../src/styles/tailwind.css';
import type { CSSProperties } from 'react';
import { Slot } from 'expo-router';
import { StartupSplash } from './components/StartupSplash';

// Pre-signal that auth initialization is pending before the route mounts.
// This prevents StartupSplash from incorrectly thinking auth is ready before
// the app (and its FirebaseAuthProvider) has even started mounting.
if (typeof window !== 'undefined') {
  window.__cofkansAuthBootPending = true;
}

export default function RootLayout() {
  return (
    <div style={styles.root}>
      <StartupSplash>
        <Slot />
      </StartupSplash>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#ffffff',
  },
};
