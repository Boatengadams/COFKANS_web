import { useState, type ComponentType, type ReactNode } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import Branches from './pages/Branches'
import Settings from './pages/Settings'
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext'
import { useManagerCollection, displayValue, dateValue } from './manager-live-data'

function LiveDataEmptyPage({ title }: { title: string }) {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '1px dashed var(--border)', borderRadius: 12, color: 'var(--muted-foreground)', textAlign: 'center' }}>
        <h1 style={{ margin: 0, color: 'var(--foreground)', fontSize: 18 }}>{title}</h1>
        <p style={{ margin: 0, fontSize: 13 }}>No live records are available for this workspace yet.</p>
      </div>
    </div>
  )
}

function EmptyTablePage({ title, collectionName, columns, fields }: { title: string; collectionName: string; columns: string[]; fields: string[] }) {
  const { rows, loading, error } = useManagerCollection(collectionName)
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <div><p style={{ margin: '0 0 4px', color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Workspace</p><h1 style={{ margin: 0, color: 'var(--foreground)', fontSize: 22 }}>{title}</h1></div>
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>No live records</span>
      </div>
      <div style={{ overflow: 'hidden', border: '1px solid var(--border)', borderRadius: 12, background: 'var(--card)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr>{columns.map(column => <th key={column} style={{ padding: '11px 14px', textAlign: 'left', color: 'var(--muted-foreground)', background: 'var(--muted)', borderBottom: '1px solid var(--border)', fontWeight: 700, whiteSpace: 'nowrap' }}>{column}</th>)}</tr></thead>
          <tbody>{loading ? <tr><td colSpan={columns.length} style={{ height: 180, textAlign: 'center', color: 'var(--muted-foreground)' }}>Loading {title.toLowerCase()} from Firebase…</td></tr> : error ? <tr><td colSpan={columns.length} style={{ height: 180, textAlign: 'center', color: 'var(--muted-foreground)' }}>{error}</td></tr> : rows.length === 0 ? <tr><td colSpan={columns.length} style={{ height: 180, textAlign: 'center', color: 'var(--muted-foreground)' }}>No {title.toLowerCase()} records in Firebase.</td></tr> : rows.map(row => <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>{fields.map(field => <td key={field} style={{ padding: '11px 14px', color: 'var(--foreground)' }}>{field.toLowerCase().includes('date') || field.toLowerCase().includes('at') ? dateValue(row[field]) : displayValue(row[field])}</td>)}</tr>)}</tbody>
        </table>
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
      style={{
        display: 'flex',
        height: '100vh',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'var(--background)',
      }}
    >
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
  )
}

export default FigmaManagerPortal
