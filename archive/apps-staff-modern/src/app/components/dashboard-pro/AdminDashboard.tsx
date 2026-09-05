import { Database, Package, Users } from 'lucide-react'
import { useManagerCollection, displayValue } from '../../pages/manager-figma/manager-live-data'
import { GlassCard, KPI, SectionTitle } from './primitives'

export function AdminOverview() {
  const orders = useManagerCollection('orders')
  const products = useManagerCollection('products')
  const staff = useManagerCollection('staffAccounts')
  const branches = useManagerCollection('branches')
  const loading = orders.loading || products.loading || staff.loading || branches.loading
  return <div className="space-y-6"><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    <KPI label="Orders" value={loading ? '…' : displayValue(orders.rows.length)} icon={Database} accent="sky" />
    <KPI label="Products" value={loading ? '…' : displayValue(products.rows.length)} icon={Package} accent="violet" />
    <KPI label="Staff" value={loading ? '…' : displayValue(staff.rows.length)} icon={Users} accent="emerald" />
    <KPI label="Branches" value={loading ? '…' : displayValue(branches.rows.length)} icon={Database} accent="amber" />
  </div><GlassCard className="p-5"><SectionTitle title="Live database status" subtitle={orders.error || products.error || staff.error || branches.error ? 'One or more Firebase collections could not be read.' : 'Counts are read directly from Firebase.'} /><div className="mt-5 text-sm text-muted-foreground">{loading ? 'Loading live records…' : 'No client-seeded dashboard values are used.'}</div></GlassCard></div>
}

export function AdminInventory() {
  const { rows, loading, error } = useManagerCollection('inventory')
  return <GlassCard className="p-6"><SectionTitle title="Inventory" subtitle="Firebase inventory records" /><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="py-2">SKU</th><th>Product</th><th>Stock</th><th>Branch</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Loading inventory…</td></tr> : error ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">{error}</td></tr> : rows.length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No inventory records in Firebase.</td></tr> : rows.map(row => <tr key={row.id} className="border-t border-border"><td className="py-3 font-mono text-xs">{displayValue(row.sku)}</td><td className="font-semibold">{displayValue(row.name)}</td><td>{displayValue(row.stock ?? row.totalStock)}</td><td>{displayValue(row.branchSlug)}</td><td>{displayValue(row.status)}</td></tr>)}</tbody></table></div></GlassCard>
}

export function AdminUsers() {
  const { rows, loading, error } = useManagerCollection('staffAccounts')
  return <GlassCard className="p-6"><SectionTitle title="Staff accounts" subtitle="Firebase staffAccounts records" /><div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Status</th></tr></thead><tbody>{loading ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Loading staff…</td></tr> : error ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">{error}</td></tr> : rows.length === 0 ? <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">No staff accounts in Firebase.</td></tr> : rows.map(row => <tr key={row.id} className="border-t border-border"><td className="py-3 font-semibold">{displayValue(row.displayName)}</td><td>{displayValue(row.email)}</td><td>{displayValue(row.role)}</td><td>{displayValue(row.branchSlug)}</td><td>{displayValue(row.active)}</td></tr>)}</tbody></table></div></GlassCard>
}
