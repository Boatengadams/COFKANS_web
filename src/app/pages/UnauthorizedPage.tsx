import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';

export default function UnauthorizedPage() {
  const { firebaseUser, signOut } = useFirebaseAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border-2 border-red-500/30 rounded-3xl p-8 text-center">
        <div className="inline-flex p-3 bg-red-500/10 rounded-2xl mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access denied</h1>
        <p className="text-sm text-muted-foreground mb-1">403 — Unauthorized</p>
        <p className="text-sm text-muted-foreground mb-6">
          {firebaseUser
            ? `${firebaseUser.email} does not have permission to view this page.`
            : 'You must be signed in with a staff account to access this portal.'}
        </p>
        <div className="flex justify-center gap-3">
          <a href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border font-bold text-sm hover:bg-muted">
            <ArrowLeft className="w-4 h-4" /> Staff login
          </a>
          {firebaseUser && (
            <button onClick={() => signOut()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted font-bold text-sm">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
