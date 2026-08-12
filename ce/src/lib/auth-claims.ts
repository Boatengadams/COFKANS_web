/**
 * Read Firebase ID-token custom claims on the client.
 *
 * The `developer` claim is the second of three independent gates for the
 * /developer-portal route (Cloudflare IP whitelist is the first, TOTP is
 * the third). Always force-refresh before checking so a freshly-granted
 * claim is picked up without requiring a sign-out.
 */
import {getAuth} from 'firebase/auth';

export interface PortalClaims {
  developer?: boolean;
}

export async function getCurrentClaims(forceRefresh = true): Promise<PortalClaims> {
  const user = getAuth().currentUser;
  if (!user) return {};
  const token = await user.getIdTokenResult(forceRefresh);
  return token.claims as PortalClaims;
}

export async function hasDeveloperClaim(forceRefresh = true): Promise<boolean> {
  const claims = await getCurrentClaims(forceRefresh);
  return claims.developer === true;
}
