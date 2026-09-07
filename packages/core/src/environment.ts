/**
 * Shared Expo environment resolution.
 *
 * `EXPO_PUBLIC_APP_ENV` is intentionally explicit:
 *   development live Firebase/Supabase services for development
 *   production  live Firebase/Supabase services for production
 *
 * A production export with no environment value is treated as production so
 * it cannot silently ship with demo authentication. Local development still
 * falls back to demo mode, but exposes a warning in the staff UI.
 */
export type AppEnvironment = 'development' | 'production';

// Expo inlines only statically named EXPO_PUBLIC_* references. Keep these
// explicit so Metro web exports receive the Firebase configuration from the
// environment files. Vite still gets the same values from import.meta.env.
const expoPublicValues: Record<string, string | undefined> =
  typeof process === 'undefined'
    ? {}
    : {
        APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
        FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        FIREBASE_MEASUREMENT_ID: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
        FIREBASE_APPCHECK_SITE_KEY: process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY,
        USE_FIREBASE_EMULATORS: process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS,
      };

const vitePublicValues: Record<string, string | undefined> = {
  APP_ENV: import.meta.env.EXPO_PUBLIC_APP_ENV ?? import.meta.env.VITE_APP_ENV,
  FIREBASE_API_KEY: import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? import.meta.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: import.meta.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: import.meta.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? import.meta.env.VITE_FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID: import.meta.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  FIREBASE_APPCHECK_SITE_KEY: import.meta.env.EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY ?? import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY,
  USE_FIREBASE_EMULATORS:
    import.meta.env.EXPO_PUBLIC_USE_FIREBASE_EMULATORS ?? import.meta.env.VITE_USE_FIREBASE_EMULATORS,
};

export function getPublicEnv(name: string): string {
  return (
    expoPublicValues[name] ??
    vitePublicValues[name] ??
    ''
  );
}

const rawEnvironment = getPublicEnv('APP_ENV').trim().toLowerCase();
const isProductionBuild = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
const validEnvironments = new Set<AppEnvironment>(['development', 'production']);

export const APP_ENV_IS_CONFIGURED = validEnvironments.has(rawEnvironment as AppEnvironment);
export const APP_ENV: AppEnvironment = APP_ENV_IS_CONFIGURED
  ? rawEnvironment as AppEnvironment
  : isProductionBuild
    ? 'production'
    : 'development';

export const APP_ENV_WARNING = APP_ENV_IS_CONFIGURED
  ? null
  : rawEnvironment
    ? `Unsupported EXPO_PUBLIC_APP_ENV "${rawEnvironment}". Use development or production.`
    : `EXPO_PUBLIC_APP_ENV is not set. This build is running in ${APP_ENV} mode; set it explicitly before deployment.`;

export const LIVE_BACKEND_ENABLED = APP_ENV === 'development' || APP_ENV === 'production';
