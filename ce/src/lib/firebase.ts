// Backend disabled while DEMO_MODE is on (see /src/lib/demo-mode.ts).
// In demo mode all exports are inert stubs and no network calls fire.
import { DEMO_MODE } from './demo-mode';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, disableNetwork, type Firestore, setLogLevel } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const env = import.meta.env;

// Suppress noisy Firestore WebChannel transport warnings. Long-polling is
// forced below, but the SDK still logs harmless "transport errored" lines
// on every reconnect / App Check token refresh / keepalive timeout. The
// SDK auto-reconnects silently; real read/write failures still surface as
// rejected promises in our app code.
setLogLevel('silent');

// Fallback config keeps Figma Make preview working when env vars aren't set.
// In Vercel, set VITE_FIREBASE_* env vars and these fallbacks are ignored.
const fallback = {
  apiKey: 'AIzaSyBxa8-e89nw7kJEpntlLieDot1Utog8blY',
  authDomain: 'cofkanselectricals-1.firebaseapp.com',
  projectId: 'cofkanselectricals-1',
  storageBucket: 'cofkanselectricals-1.firebasestorage.app',
  messagingSenderId: '380088923938',
  appId: '1:380088923938:web:e3ccaee709e3709615d77b',
  measurementId: 'G-BSPJHD64FB',
};

const firebaseConfig = {
  apiKey: (env.VITE_FIREBASE_API_KEY as string) || fallback.apiKey,
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN as string) || fallback.authDomain,
  projectId: (env.VITE_FIREBASE_PROJECT_ID as string) || fallback.projectId,
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET as string) || fallback.storageBucket,
  messagingSenderId:
    (env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || fallback.messagingSenderId,
  appId: (env.VITE_FIREBASE_APP_ID as string) || fallback.appId,
  measurementId:
    (env.VITE_FIREBASE_MEASUREMENT_ID as string) || fallback.measurementId,
};

// Firebase SDK objects must be real, even in DEMO_MODE — many components do
// type-checks like `collection(db, ...)` that touch internal symbols (_delegate).
// Initializing the SDK is cheap and offline-safe; we block actual network use
// by stubbing the *service layer* (firestore-service) and *hooks* instead.
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// App Check — attaches a reCAPTCHA v3 token to every Firebase request so the
// public web apiKey can't be reused outside a real browser session. Runs
// browser-side only; skipped in DEMO_MODE and during SSR. Local dev sets
// `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` so Firebase prints a debug token
// to the console (paste into App Check console to allow your dev session).
const APP_CHECK_SITE_KEY =
  (env.VITE_FIREBASE_APPCHECK_SITE_KEY as string) || '6LeySfgsAAAAAN1K_-Kvfc0YtyIr-fxAUvxWwILq';
if (!DEMO_MODE && typeof window !== 'undefined' && APP_CHECK_SITE_KEY) {
  if (env.DEV) (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(APP_CHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('App Check init failed:', err);
  }
}

export const auth: Auth = getAuth(app);

// Force long-polling to avoid WebChannel connection errors
// This fixes "WebChannelConnection RPC 'Listen' stream transport errored" issues
// Long-polling is more reliable in restricted environments and works everywhere
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      // Force long-polling for maximum compatibility and to avoid WebChannel errors
      // This is slower than WebChannel but works reliably in all environments
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    });
  } catch (err) {
    console.error('[firebase] initializeFirestore failed — falling back to getFirestore. This usually means Firestore was used before initializeFirestore ran:', err);
    return getFirestore(app);
  }
})();
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app, 'us-central1');

// In demo mode, kill the Firestore network so any stray direct calls resolve
// immediately from the (empty) local cache instead of hanging for 10 s.
if (DEMO_MODE) {
  disableNetwork(db).catch(() => { /* ignore */ });
}

/**
 * Analytics is consent-gated. Call `initAnalytics()` once the user accepts the
 * `analytics` cookie category (see `personalization-store`). Until then we
 * keep GA dormant — no network calls, no measurement IDs sent.
 */
let _analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;
export function initAnalytics() {
  if (DEMO_MODE || typeof window === 'undefined') return Promise.resolve(null);
  if (_analyticsPromise) return _analyticsPromise;
  _analyticsPromise = isSupported().then(yes => (yes && app ? getAnalytics(app) : null));
  return _analyticsPromise;
}
export const analytics = Promise.resolve(null);

export const googleProvider = DEMO_MODE
  ? ({} as GoogleAuthProvider)
  : (() => { const p = new GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' }); return p; })();

export const appleProvider = DEMO_MODE
  ? ({} as OAuthProvider)
  : (() => { const p = new OAuthProvider('apple.com'); p.addScope('email'); p.addScope('name'); return p; })();

export const microsoftProvider = DEMO_MODE
  ? ({} as OAuthProvider)
  : (() => {
      const p = new OAuthProvider('microsoft.com');
      p.setCustomParameters({ prompt: 'select_account' });
      return p;
    })();

export default app;
