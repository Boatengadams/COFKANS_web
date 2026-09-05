/** Shared staff login route using the canonical Cofkans login design. */
import { useRouter } from 'expo-router'
import Login from '../../pages/Login'
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext'
import { portalRoute, type StaffKind } from '@/lib/staff-auth'
import { findStaffByEmail, type StaffRole } from '@/lib/staff'

function roleToKind(role: string): StaffKind {
  switch (role) {
    case 'manager':
    case 'branch_manager': return 'manager'
    case 'technician': return 'technician'
    case 'rider':
    case 'driver':
    case 'transport_driver': return 'transport_driver'
    case 'front_desk':
    case 'branch_desk': return 'front_desk'
    case 'developer': return 'developer'
    case 'warehouse': return 'warehouse'
    case 'accountant': return 'accountant'
    case 'hr': return 'hr'
    case 'procurement': return 'procurement'
    case 'marketing': return 'marketing'
    default: return 'none'
  }
}

export default function StaffLoginPage() {
  const { signInWithEmail, resetPassword } = useFirebaseAuth()
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmail(email, password)
      const staff = await findStaffByEmail(email)
      const kind = roleToKind((staff?.role ?? 'none') as StaffRole | 'none')
      if (kind === 'none') throw new Error('This account has no staff role assigned. Contact a manager.')
      router.replace(portalRoute(kind) as never)
    } catch (err: any) {
      const code = err?.code || ''
      throw new Error(
        code.includes('invalid-credential') || code.includes('wrong-password') || code.includes('user-not-found')
          ? 'Email or password is incorrect.'
          : code.includes('too-many-requests')
          ? 'Too many attempts. Wait a moment and try again.'
          : code.includes('user-disabled')
          ? 'This account has been disabled. Contact a manager.'
          : err?.message || 'Sign-in failed. Please try again.',
      )
    }
  }

  return <Login onSubmit={handleLogin} resetPassword={resetPassword} />
}
