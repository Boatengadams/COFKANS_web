import { getIdTokenResult } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Returns true iff the currently signed-in Firebase user carries the
 * `developer: true` custom claim set by the `setUserRole` Cloud Function.
 * Pass `forceRefresh=true` right after a role change to bypass the cached
 * ID token.
 */
export async function hasDeveloperClaim(forceRefresh = false): Promise<boolean> {
  const u = auth.currentUser;
  if (!u) return false;
  try {
    const res = await getIdTokenResult(u, forceRefresh);
    return res.claims?.developer === true;
  } catch {
    return false;
  }
}

/**
 * Returns true iff the signed-in user has any staff/elevated custom claim
 * (`developer`, `admin`, `technician`, `driver`, `branch_manager`).
 */
export async function hasStaffClaim(forceRefresh = false): Promise<boolean> {
  const u = auth.currentUser;
  if (!u) return false;
  try {
    const res = await getIdTokenResult(u, forceRefresh);
    const c = res.claims || {};
    return c.developer === true ||
           c.admin === true ||
           c.role === 'admin' ||
           c.role === 'technician' ||
           c.role === 'driver' ||
           c.role === 'branch_manager';
  } catch {
    return false;
  }
}
