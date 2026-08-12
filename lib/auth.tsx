/**
 * Shared-logic shim.
 *
 * The native (React Native) portal screens under `app/` import from
 * `../lib`, `../components` and `../theme`. Those bare folders don't exist at
 * the project root — the real implementations live in `lib-native/`,
 * `components-native/` and `theme-native/`. These re-exports make the two
 * import styles point at the SAME shared modules, so auth + data logic works
 * identically on native and web from one codebase.
 */
export * from '../lib-native/auth';
