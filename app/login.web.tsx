/**
 * Web staff login route (Expo Router).
 * Delegates to the real, complete `StaffLoginPage` in `src/app/pages`.
 */
import StaffLoginPage from '@/app/pages/StaffLoginPage';
import { FirebaseAuthProvider } from '@/app/contexts/FirebaseAuthContext';

export default function LoginWeb() {
  return (
    <FirebaseAuthProvider>
      <StaffLoginPage />
    </FirebaseAuthProvider>
  );
}
