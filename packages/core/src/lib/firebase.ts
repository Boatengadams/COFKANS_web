// Backend disabled while DEMO_MODE is on (see /src/lib/demo-mode.ts).
// In demo mode all exports are inert stubs and no network calls fire.
import { APP_ENV, DEMO_MODE, IS_WEB, getPublicEnv } from './demo-mode';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  disableNetwork,
  type Firestore,
  setLogLevel,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { connectFunctionsEmulator, getFunctions, type Functions } from 'firebase/functions';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const env = (typeof process !== 'undefined' ? process.env : {}) as Record<string, string | undefined>;

// Firestore logs a 10-second "Backend didn't respond" warning whenever the
// sandbox/preview can't reach Cloud Firestore. It's benign — the SDK falls
// back to offline cache — but noisy. Silence info/warn everywhere.
setLogLevel('error');

const requiredFirebaseConfig = {
  apiKey: getPublicEnv('FIREBASE_API_KEY'),
  authDomain: getPublicEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getPublicEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getPublicEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getPublicEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getPublicEnv('FIREBASE_APP_ID'),
};

const missingFirebaseConfig = Object.entries(requiredFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);
export const FIREBASE_CONFIGURED = missingFirebaseConfig.length === 0;

// Do not throw while this module is being imported. A missing preview/deploy
// environment used to abort the entire module graph before React mounted,
// which appeared to users as a completely white screen. Keep Firebase
// initialisable with clearly-invalid placeholders so the UI can render and
// authentication requests fail normally until the environment is configured.
if (!DEMO_MODE && !FIREBASE_CONFIGURED) {
  console.error(
    `[firebase] Missing configuration for ${APP_ENV} mode: ${missingFirebaseConfig.join(', ')}. ` +
      'Set the matching EXPO_PUBLIC_FIREBASE_* values before starting or exporting the app.',
  );
}

const safeFirebaseConfig = {
  apiKey: firebaseConfigValue(requiredFirebaseConfig.apiKey, 'missing-api-key'),
  authDomain: firebaseConfigValue(requiredFirebaseConfig.authDomain, 'missing-auth-domain.invalid'),
  projectId: firebaseConfigValue(requiredFirebaseConfig.projectId, 'missing-project'),
  storageBucket: firebaseConfigValue(requiredFirebaseConfig.storageBucket, 'missing-project.appspot.com'),
  messagingSenderId: firebaseConfigValue(requiredFirebaseConfig.messagingSenderId, '000000000000'),
  appId: firebaseConfigValue(requiredFirebaseConfig.appId, 'missing-app-id'),
};

function firebaseConfigValue(value: string, fallback: string): string {
  return value || fallback;
}

const firebaseConfig = {
  ...safeFirebaseConfig,
  measurementId: getPublicEnv('FIREBASE_MEASUREMENT_ID') || undefined,
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

/**
 * Local Firebase Emulator Suite wiring.
 *
 * Hard gates (all required) so this can never activate in a real production build:
 *   1. EXPO_PUBLIC_USE_FIREBASE_EMULATORS / VITE_USE_FIREBASE_EMULATORS === 'true'
 *   2. Vite/Expo production build flag is false (import.meta.env.PROD / NODE_ENV)
 *   3. Browser hostname is localhost / 127.0.0.1 only
 *
 * Default local `pnpm dev:customer` does NOT set the flag → live staging backend.
 * Use `pnpm dev:customer:emulators` (or set the flag explicitly) for emulator demos.
 */
function shouldUseFirebaseEmulators(): boolean {
  const flag = getPublicEnv('USE_FIREBASE_EMULATORS').trim().toLowerCase();
  if (flag !== 'true' && flag !== '1') return false;

  const isProdBuild =
    (typeof import.meta !== 'undefined' && Boolean(import.meta.env?.PROD)) ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
  if (isProdBuild) return false;

  if (!IS_WEB || typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

export const USING_FIREBASE_EMULATORS = shouldUseFirebaseEmulators();

if (USING_FIREBASE_EMULATORS) {
  // Ports match firebase.json → emulators.*
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  console.info(
    '[firebase] Connected to local Auth (9099), Firestore (8080), and Functions (5001) emulators.',
  );
}

// Kill the Firestore network in environments where the backend is unreachable
// (DEMO_MODE, or the Figma Make preview iframe). Avoids the 10-second
// "Backend didn't respond" warning and the hang it implies.
// Never disable when intentionally using the local emulator suite.
const _isSandboxedPreview =
  IS_WEB && typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('figma.site') ||
    window.location.hostname.endsWith('figma.com') ||
    window.self !== window.top);
if (!USING_FIREBASE_EMULATORS && (DEMO_MODE || !FIREBASE_CONFIGURED || _isSandboxedPreview)) {
  disableNetwork(db).catch(() => { /* ignore */ });
}

/**
 * Analytics is consent-gated. Call `initAnalytics()` once the user accepts the
 * `analytics` cookie category (see `personalization-store`). Until then we
 * keep GA dormant — no network calls, no measurement IDs sent.
 */
let _analyticsPromise: Promise<ReturnType<typeof getAnalytics> | null> | null = null;
export function initAnalytics() {
  if (DEMO_MODE || !FIREBASE_CONFIGURED || !IS_WEB || typeof window === 'undefined') return Promise.resolve(null);
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
