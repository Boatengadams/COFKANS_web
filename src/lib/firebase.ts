// Backend disabled while DEMO_MODE is on (see /src/lib/demo-mode.ts).
// In demo mode all exports are inert stubs and no network calls fire.
import { DEMO_MODE, IS_WEB, getPublicEnv } from './demo-mode';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, disableNetwork, type Firestore, setLogLevel } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, type Functions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

// Firestore logs a 10-second "Backend didn't respond" warning whenever the
// sandbox/preview can't reach Cloud Firestore. It's benign — the SDK falls
// back to offline cache — but noisy. Silence info/warn everywhere.
setLogLevel('error');

// Fallback config keeps Figma Make preview working when env vars aren't set.
// In Expo, set EXPO_PUBLIC_FIREBASE_* env vars and these fallbacks are ignored.
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
  apiKey: getPublicEnv('FIREBASE_API_KEY') || fallback.apiKey,
  authDomain: getPublicEnv('FIREBASE_AUTH_DOMAIN') || fallback.authDomain,
  projectId: getPublicEnv('FIREBASE_PROJECT_ID') || fallback.projectId,
  storageBucket: getPublicEnv('FIREBASE_STORAGE_BUCKET') || fallback.storageBucket,
  messagingSenderId:
    getPublicEnv('FIREBASE_MESSAGING_SENDER_ID') || fallback.messagingSenderId,
  appId: getPublicEnv('FIREBASE_APP_ID') || fallback.appId,
  measurementId:
    getPublicEnv('FIREBASE_MEASUREMENT_ID') || fallback.measurementId,
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
  getPublicEnv('FIREBASE_APPCHECK_SITE_KEY');
if (!DEMO_MODE && IS_WEB && typeof window !== 'undefined' && APP_CHECK_SITE_KEY) {
  if (env.DEV) (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  // Defer until page load so reCAPTCHA v3 script is present before we call
  // initializeAppCheck. Calling it while the script is still loading causes
  // intermittent "reCAPTCHA not loaded" errors that block auth bootstrap.
  const _initAppCheck = () => {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(APP_CHECK_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (err) {
      console.warn('App Check init failed:', err);
    }
  };
  if (document.readyState === 'complete') {
    setTimeout(_initAppCheck, 0);
  } else {
    window.addEventListener('load', _initAppCheck, { once: true });
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

// Kill the Firestore network in environments where the backend is unreachable
// (DEMO_MODE, or the Figma Make preview iframe). Avoids the 10-second
// "Backend didn't respond" warning and the hang it implies.
const _isSandboxedPreview =
  IS_WEB && typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('figma.site') ||
    window.location.hostname.endsWith('figma.com') ||
    window.self !== window.top);
if (DEMO_MODE || _isSandboxedPreview) {
  disableNetwork(db).catch(() => { /* ignore */ });
}

/**
 * Analytics is consent-gated. Call `initAnalytics()` once the user accepts the
 * `analytics` cookie category (see `personalization-store`). Until then we
 * keep GA dormant — no network calls, no measurement IDs sent.
 */
let _analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;
export function initAnalytics() {
  if (DEMO_MODE || !IS_WEB || typeof window === 'undefined') return Promise.resolve(null);
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
