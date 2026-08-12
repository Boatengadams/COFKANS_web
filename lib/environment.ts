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

export function getPublicEnv(name: string): string {
  const processValues =
    typeof process === 'undefined'
      ? {}
      : (process.env as Record<string, string | undefined>);
  const metaValues =
    typeof import.meta === 'undefined'
      ? {}
      : ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});
  return (
    processValues[`EXPO_PUBLIC_${name}`] ??
    processValues[`VITE_${name}`] ??
    metaValues[`EXPO_PUBLIC_${name}`] ??
    metaValues[`VITE_${name}`] ??
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
