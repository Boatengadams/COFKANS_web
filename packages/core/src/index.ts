/**
 * Shared Cofkans core boundary.
 *
 * Backend services, shared schemas, and cross-portal utilities will move here
 * incrementally. Keeping this entrypoint small during migration lets both
 * apps adopt the package without duplicating business logic.
 */
export const COFKANS_CORE_VERSION = '1.0.0';

export { COLLECTIONS } from './collections';
