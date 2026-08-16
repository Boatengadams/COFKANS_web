import { BarChart2, Database, Package, Users } from 'lucide-react'
import { useManagerCollection, displayValue } from '../manager-live-data'

function LiveCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart2 }) {
  return <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}><Icon size={13} />{label}</div><div style={{ marginTop: 14, color: 'var(--foreground)', fontFamily: 'JetBrains Mono, monospace', fontSize: 24 }}>{value}</div></div>
}

export default function Dashboard() {
  const orders = useManagerCollection('orders')
  const products = useManagerCollection('products')
  const staff = useManagerCollection('staffAccounts')
  const branches = useManagerCollection('branches')
  const busy = orders.loading || products.loading || staff.loading || branches.loading
  const unavailable = [orders, products, staff, branches].some(source => source.error)

  return <div style={{ padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div><p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Firebase overview</p><h1 style={{ margin: 0, color: 'var(--foreground)', fontSize: 22, fontWeight: 700 }}>Dashboard</h1><p style={{ margin: '8px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>{unavailable ? 'Some live data could not be loaded.' : 'Live operational counts from the connected database.'}</p></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      <LiveCard label="Orders" value={busy ? '…' : displayValue(orders.rows.length)} icon={BarChart2} />
      <LiveCard label="Products" value={busy ? '…' : displayValue(products.rows.length)} icon={Package} />
      <LiveCard label="Staff" value={busy ? '…' : displayValue(staff.rows.length)} icon={Users} />
      <LiveCard label="Branches" value={busy ? '…' : displayValue(branches.rows.length)} icon={Database} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {[['Recent orders', orders.rows], ['Products catalogue', products.rows], ['Staff accounts', staff.rows], ['Branches', branches.rows]].map(([title, rows]) => <section key={title as string} style={{ minHeight: 150, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}><h2 style={{ margin: 0, color: 'var(--foreground)', fontSize: 15 }}>{title as string}</h2><p style={{ margin: '12px 0 0', color: 'var(--muted-foreground)', fontSize: 13 }}>{busy ? 'Loading live records…' : rows.length ? `${rows.length.toLocaleString()} records available in Firebase.` : 'No records available in Firebase.'}</p></section>)}
    </div>
  </div>
}
