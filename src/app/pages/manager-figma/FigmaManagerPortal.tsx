import { useState, type ComponentType, type ReactNode } from 'react'
import Dashboard from './pages/Dashboard'
import Branches from './pages/Branches'
import Settings from './pages/Settings'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { useManagerCollection, displayValue, dateValue } from './manager-live-data'
import { BarChart3, CheckCircle2, FileSpreadsheet, FolderOpen, LayoutDashboard, LogOut, PackageOpen, Settings2, Sparkles, GitBranch, Package, TrendingUp, Users, Table2 } from 'lucide-react'
import cofkansLogo from './imports/cofkans-BFw8TZ-5.png'
import { ThemeToggle } from '../../components/ThemeToggle'
import './index.css'

const PAGE_ICONS = {
  inventory: PackageOpen,
  sales: BarChart3,
  employees: FolderOpen,
  approvals: CheckCircle2,
  reports: BarChart3,
  spreadsheet: FileSpreadsheet,
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'branches', label: 'Branches', icon: GitBranch },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'spreadsheet', label: 'Spreadsheet', icon: Table2 },
]

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="manager-page-intro">
    <div>
      <span className="manager-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
    <div className="manager-intro-mark" aria-hidden="true"><Sparkles size={18} /></div>
  </div>
}

function LiveDataEmptyPage({ title }: { title: string }) {
  return (
    <div className="manager-page">
      <PageIntro eyebrow="Workspace" title={title} description="Live workspace information will appear here when it is available in Firebase." />
      <div className="manager-empty-hero">
        <div className="manager-empty-icon"><Sparkles size={24} /></div>
        <h2>Ready for live information</h2>
        <p>No records are available for this workspace yet. The layout stays ready for your connected data.</p>
      </div>
    </div>
  )
}

function EmptyTablePage({ title, collectionName, columns, fields }: { title: string; collectionName: string; columns: string[]; fields: string[] }) {
  const { rows, loading, error } = useManagerCollection(collectionName)
  const Icon = PAGE_ICONS[collectionName as keyof typeof PAGE_ICONS] || FolderOpen
  return (
    <div className="manager-page">
      <PageIntro eyebrow={`Firebase collection · ${collectionName}`} title={title} description="A live operational view connected directly to the Firebase collection." />
      <div className="manager-table-card">
        <div className="manager-table-heading"><div><span className="manager-table-kicker"><Icon size={14} /> Live collection</span><h2>{title} register</h2></div><span className="manager-record-count">{loading ? 'Syncing…' : `${rows.length} records`}</span></div>
        <div className="manager-table-scroll"><table className="manager-table">
          <thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{loading ? <tr><td colSpan={columns.length}><div className="manager-table-state"><span className="manager-spinner" />Loading live records from Firebase…</div></td></tr> : error ? <tr><td colSpan={columns.length}><div className="manager-table-state manager-table-error">{error}</div></td></tr> : rows.length === 0 ? <tr><td colSpan={columns.length}><div className="manager-table-state"><div className="manager-empty-icon small"><Icon size={18} /></div><strong>No {title.toLowerCase()} records yet</strong><span>New records from Firebase will appear in this structured workspace.</span></div></td></tr> : rows.map(row => <tr key={row.id}>{fields.map(field => <td key={field}>{field.toLowerCase().includes('date') || field.toLowerCase().includes('at') ? dateValue(row[field]) : <span className={field.toLowerCase().includes('status') ? 'manager-status' : ''}>{displayValue(row[field])}</span>}</td>)}</tr>)}</tbody>
        </table></div>
      </div>
    </div>
  )
}

function HelpPage() {
  return (
    <LiveDataEmptyPage title="Help & Support" />
  )
}

const PAGES: Record<string, ComponentType> = {
  dashboard: Dashboard,
  branches: Branches,
  inventory: () => <EmptyTablePage title="Inventory" collectionName="inventory" columns={['SKU', 'Product', 'Category', 'Stock', 'Branch', 'Status']} fields={['sku', 'name', 'category', 'stock', 'branchSlug', 'status']} />,
  sales: () => <EmptyTablePage title="Sales" collectionName="orders" columns={['Order', 'Customer', 'Amount', 'Date', 'Branch', 'Status']} fields={['orderNumber', 'customerName', 'total', 'createdAt', 'branchSlug', 'status']} />,
  employees: () => <EmptyTablePage title="Employees" collectionName="staffAccounts" columns={['Name', 'Role', 'Department', 'Branch', 'Status']} fields={['displayName', 'role', 'department', 'branchSlug', 'active']} />,
  approvals: () => <EmptyTablePage title="Approvals" collectionName="approvals" columns={['Request', 'Requester', 'Type', 'Amount', 'Status']} fields={['id', 'requesterName', 'type', 'amount', 'status']} />,
  reports: () => <EmptyTablePage title="Reports" collectionName="reports" columns={['Report', 'Period', 'Created by', 'Created at', 'Status']} fields={['name', 'period', 'createdBy', 'createdAt', 'status']} />,
  spreadsheet: () => <EmptyTablePage title="Spreadsheet" collectionName="spreadsheet" columns={['ID', 'Name', 'Category', 'Value', 'Updated', 'Status']} fields={['id', 'name', 'category', 'value', 'updatedAt', 'status']} />,
  settings: Settings,
  help: HelpPage,
}

const PAGE_CSS = `
@keyframes page-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

function PageWrapper({ children, pageKey }: { children: ReactNode; pageKey: string }) {
  return (
    <div key={pageKey} style={{ animation: 'page-enter 220ms ease-out both' }}>
      <style>{PAGE_CSS}</style>
      {children}
    </div>
  )
}

export function FigmaManagerPortal() {
  const [page, setPage] = useState('dashboard')
  const PageComponent = PAGES[page] || Dashboard
  const { signOut } = useFirebaseAuth()

  return (
    <div
      className="manager-portal"
      style={{
        display: 'flex',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'var(--background)',
      }}
    >
      <div className="manager-demo-shell">
        <header className="manager-demo-header">
          <div className="manager-demo-header-inner">
            <div className="manager-demo-brand">
              <div className="manager-demo-logo"><img src={typeof cofkansLogo === 'string' ? cofkansLogo : (cofkansLogo as { uri: string }).uri} alt="Cofkans Electricals" /></div>
              <div><span>Manager Portal</span><strong>All branches · live access</strong></div>
            </div>
            <div className="manager-demo-actions"><ThemeToggle /><button className="manager-signout" type="button" onClick={() => void signOut()} title="Sign out"><LogOut size={15} /><span>Sign out</span></button></div>
          </div>
          <nav className="manager-demo-nav" aria-label="Manager portal sections">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setPage(id)} className={page === id ? 'active' : ''}><Icon size={14} />{label}</button>)}
            <button type="button" onClick={() => setPage('settings')} className={page === 'settings' ? 'active' : ''}><Settings2 size={14} />Settings</button>
          </nav>
        </header>
        <main className="manager-demo-content"><PageWrapper pageKey={page}><PageComponent /></PageWrapper></main>
      </div>
    </div>
  )
}

export default FigmaManagerPortal
