/**
 * Shared-logic shim — see ./auth.tsx for the rationale.
 * Re-exports the native mock-data module so `../lib/data` resolves on web too.
 */
export * from '../lib-native/data';
