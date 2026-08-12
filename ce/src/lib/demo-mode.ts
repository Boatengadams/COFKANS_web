/**
 * Compatibility entry for files still being moved from the former Vite app.
 *
 * The root Expo application is now the owner of environment selection and
 * demo-session persistence. New code must import from `src/lib/demo-mode`;
 * this re-export prevents the legacy tree from creating a second gate.
 */
export * from '../../../src/lib/demo-mode';
