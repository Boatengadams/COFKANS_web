import { useEffect, useState } from 'react'
import { Database, Mail, Phone, Shield, UserRound } from 'lucide-react'
import { useFirebaseAuth } from '../../../contexts/FirebaseAuthContext'
import { getStaffAccount, type StaffAccount } from '../../../../lib/staff'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 0' }}>
      <div style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: 'var(--foreground)', fontSize: 14, marginTop: 4 }}>{value || '—'}</div>
    </div>
  )
}

export default function Settings() {
  const { firebaseUser } = useFirebaseAuth()
  const [staff, setStaff] = useState<StaffAccount | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    if (!firebaseUser) { setLoading(false); return () => { active = false } }
    getStaffAccount(firebaseUser.uid)
      .then(account => { if (active) setStaff(account) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [firebaseUser])

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ margin: '0 0 4px', color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Account</p>
        <h1 style={{ margin: 0, color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}>Settings</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>Only information returned for the signed-in staff account is shown.</p>
      </div>

      <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <UserRound size={18} style={{ color: 'var(--primary)' }} />
          <div>
            <h2 style={{ margin: 0, color: 'var(--foreground)', fontSize: 15 }}>Staff account</h2>
            <p style={{ margin: '3px 0 0', color: 'var(--muted-foreground)', fontSize: 12 }}>Source: staffAccounts</p>
          </div>
        </div>
        {loading ? <p style={{ color: 'var(--muted-foreground)', fontSize: 13, paddingTop: 16 }}>Loading account…</p> : staff ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 32 }}>
            <Field label="Name" value={staff.displayName ?? ''} />
            <Field label="Email" value={staff.email} />
            <Field label="Phone" value={staff.phone ?? ''} />
            <Field label="Role" value={staff.role} />
            <Field label="Branch" value={staff.branchSlug ?? ''} />
            <Field label="Account status" value={staff.active ? 'Active' : 'Inactive'} />
          </div>
        ) : <p style={{ color: 'var(--muted-foreground)', fontSize: 13, paddingTop: 16 }}>No staff account record is available.</p>}
      </section>

      <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Shield size={18} style={{ color: 'var(--primary)' }} /><strong style={{ color: 'var(--foreground)', fontSize: 15 }}>Account controls</strong></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 16 }}>
          {[['Email', firebaseUser?.email ?? '', Mail], ['Phone', staff?.phone ?? '', Phone], ['Backend', staff ? 'Connected' : 'Unavailable', Database]].map(([label, value, Icon]) => {
            const ControlIcon = Icon as typeof Mail
            return <div key={label as string} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 14 }}><ControlIcon size={15} style={{ color: 'var(--muted-foreground)' }} /><div style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 8 }}>{label as string}</div><div style={{ color: 'var(--foreground)', fontSize: 13, marginTop: 3 }}>{value as string || '—'}</div></div>
          })}
        </div>
      </section>
    </div>
  )
}
