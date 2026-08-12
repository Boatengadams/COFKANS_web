/**
 * Shared-logic shim — see ./auth.tsx for the rationale.
 * Re-exports the native config module so `../lib/config` resolves on web too.
 */
export * from '../lib-native/config';
