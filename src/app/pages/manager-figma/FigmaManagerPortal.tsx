import { useState, type ComponentType, type ReactNode } from 'react'
import Dashboard from './pages/Dashboard'
import Branches from './pages/Branches'
import Settings from './pages/Settings'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { useManagerCollection, displayValue, dateValue } from './manager-live-data'
import { BarChart3, CheckCircle2, FileSpreadsheet, FolderOpen, PackageOpen, Sparkles } from 'lucide-react'
import cofkansLogo from './imports/cofkans-BFw8TZ-5.png'
import { DEFAULT_HERO_SLIDES } from '../../../lib/hero-slides'
import './index.css'

const PAGE_ICONS = {
  inventory: PackageOpen,
  sales: BarChart3,
  employees: FolderOpen,
  approvals: CheckCircle2,
  reports: BarChart3,
  spreadsheet: FileSpreadsheet,
}

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left: brand / hero panel (from staff login design) */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0B1220] p-12 text-white">
        <img src={typeof DEFAULT_HERO_SLIDES !== 'undefined' ? DEFAULT_HERO_SLIDES[0]?.img : ''} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(11,18,32,.88), rgba(11,18,32,.45) 58%, rgba(11,18,32,.78))' }} />
        <div className="absolute inset-x-0 top-0 h-1 bg-[#F5A524]" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[#F5A524]/10" />
        <div className="relative">
          <div className="inline-flex h-[76px] w-[178px] items-center justify-center rounded-xl bg-slate-950 px-4 py-2 shadow-lg ring-1 ring-white/15">
            <img src={typeof cofkansLogo === 'string' ? cofkansLogo : (cofkansLogo as any).uri} alt="Cofkans Electricals" className="h-12 w-auto object-contain" />
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#F5A524]">Manager Portal</p>
        </div>
        <div className="relative flex min-h-[21rem] max-w-sm items-center justify-center">
          <div className="h-1.5 w-10 rounded-full bg-[#F5A524]" aria-hidden="true" />
        </div>
        <div className="relative text-xs text-white/70">Manager workspace</div>
      </div>

      {/* Right: existing manager UI rendered inside the staff-login shell */}
      <div className="flex items-center justify-center px-4 py-10 bg-background">
        <div className="w-full max-w-[1400px]" style={{ minHeight: '100vh' }}>
          <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background)' }}>
            <Sidebar active={page} onNav={setPage} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
              <TopBar page={page} onSignOut={signOut} />
              <main style={{ flex: 1, overflowY: 'auto', background: 'var(--background)' }}>
                <PageWrapper pageKey={page}>
                  <PageComponent />
                </PageWrapper>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FigmaManagerPortal
