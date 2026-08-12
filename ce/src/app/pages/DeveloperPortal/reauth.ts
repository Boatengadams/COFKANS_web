/**
 * Tiny re-auth helper: any destructive portal action (flip a kill switch,
 * grant developer claim, force-signout) prompts for the current password
 * and re-authenticates via Firebase before the action runs. The TOTP gate
 * proves the *session* is MFA-fresh; re-auth proves the *human at the
 * keyboard* still has the credential.
 */
import {EmailAuthProvider, getAuth, reauthenticateWithCredential} from 'firebase/auth';

export async function reauthWithPassword(password: string): Promise<void> {
  const user = getAuth().currentUser;
  if (!user?.email) throw new Error('No signed-in user with email.');
  const cred = EmailAuthProvider.credential(user.email, password);
  await reauthenticateWithCredential(user, cred);
}

export function promptReauth(): Promise<string | null> {
  return new Promise((resolve) => {
    const v = window.prompt('Re-enter your password to confirm this action:');
    resolve(v && v.length > 0 ? v : null);
  });
}
