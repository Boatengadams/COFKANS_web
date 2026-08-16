import { BarChart2, Database, Package, Users, Sparkles } from 'lucide-react'
import { useManagerCollection, displayValue } from '../manager-live-data'

function LiveCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof BarChart2; tone: string }) {
  return <div className={`manager-stat-card ${tone}`}><div className="manager-stat-icon"><Icon size={17} /></div><div><div className="manager-stat-label">{label}</div><div className="manager-stat-value">{value}</div></div></div>
}

export default function Dashboard() {
  const orders = useManagerCollection('orders')
  const products = useManagerCollection('products')
  const staff = useManagerCollection('staffAccounts')
  const branches = useManagerCollection('branches')
  const busy = orders.loading || products.loading || staff.loading || branches.loading
  const unavailable = [orders, products, staff, branches].some(source => source.error)

  return <div className="manager-page">
    <div className="manager-dashboard-hero"><div><span className="manager-eyebrow">Firebase overview</span><h1>Good to see you, manager</h1><p>{unavailable ? 'Some live data could not be loaded.' : 'Your operational workspace, connected to live Firebase data.'}</p></div><div className="manager-dashboard-orb"><Sparkles size={30} /></div></div>
    <div className="manager-stat-grid">
      <LiveCard label="Orders" value={busy ? '…' : displayValue(orders.rows.length)} icon={BarChart2} tone="violet" />
      <LiveCard label="Products" value={busy ? '…' : displayValue(products.rows.length)} icon={Package} tone="blue" />
      <LiveCard label="Staff" value={busy ? '…' : displayValue(staff.rows.length)} icon={Users} tone="pink" />
      <LiveCard label="Branches" value={busy ? '…' : displayValue(branches.rows.length)} icon={Database} tone="green" />
    </div>
    <div className="manager-dashboard-grid">
      {[['Recent orders', orders.rows], ['Products catalogue', products.rows], ['Staff accounts', staff.rows], ['Branches', branches.rows]].map(([title, rows], index) => <section key={title as string} className={`manager-overview-card card-tone-${index + 1}`}><div className="manager-overview-card-top"><h2>{title as string}</h2><span className="manager-card-dot" /></div><p>{busy ? 'Loading live records…' : rows.length ? `${rows.length.toLocaleString()} records available in Firebase.` : 'No records available in Firebase yet.'}</p><div className="manager-mini-line"><span style={{ width: `${rows.length ? 65 : 22}%` }} /></div></section>)}
    </div>
  </div>
}
