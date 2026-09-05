import { useEffect, useState } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { getStaffAccount, type StaffAccount } from '@/lib/staff';

interface State {
  loading: boolean;
  staff: StaffAccount | null;
}

/**
 * Reads the signed-in user's row from `staffAccounts`.
 * Returns null if the user is a regular customer (or signed out).
 */
export function useStaffRole(): State {
  const { firebaseUser, isLoading: authLoading } = useFirebaseAuth();
  const [state, setState] = useState<State>({ loading: true, staff: null });

  useEffect(() => {
    if (authLoading) return;
    if (!firebaseUser) {
      setState({ loading: false, staff: null });
      return;
    }
    let cancelled = false;
    getStaffAccount(firebaseUser.uid)
      .then(staff => { if (!cancelled) setState({ loading: false, staff }); })
      .catch(() => { if (!cancelled) setState({ loading: false, staff: null }); });
    return () => { cancelled = true; };
  }, [firebaseUser, authLoading]);

  return state;
}
