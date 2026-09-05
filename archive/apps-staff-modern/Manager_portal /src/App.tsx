import { useState, useEffect, type ComponentType } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import LoadingScreen, { type LoadStage } from './components/LoadingScreen'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Branches from './pages/Branches'
import Inventory from './pages/Inventory'
import Sales from './pages/Sales'
import Employees from './pages/Employees'
import Approvals from './pages/Approvals'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Spreadsheet from './pages/Spreadsheet'

function HelpPage() {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 32, border: '1px solid #E4E8EE', maxWidth: 480 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Help & Support</h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
          Contact <strong style={{ color: '#374151' }}>support@cofkans.com</strong> or call{' '}
          <strong style={{ color: '#374151' }}>+233 302 123 456</strong>
        </p>
      </div>
    </div>
  )
}

const PAGES: Record<string, ComponentType> = {
  dashboard:   Dashboard,
  branches:    Branches,
  inventory:   Inventory,
  sales:       Sales,
  employees:   Employees,
  approvals:   Approvals,
  reports:     Reports,
  spreadsheet: Spreadsheet,
  settings:    Settings,
  help:        HelpPage,
}

/* ─── Page nav transition ────────────────────────────────────── */

const PAGE_CSS = `
@keyframes page-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

function PageWrapper({ children, pageKey }: { children: React.ReactNode; pageKey: string }) {
  return (
    <>
      <style>{PAGE_CSS}</style>
      <div key={pageKey} style={{ animation: 'page-enter 220ms ease-out both' }}>
        {children}
      </div>
    </>
  )
}

/* ─── Boot sequence ──────────────────────────────────────────── */

const BOOT_SEQUENCE: { stage: LoadStage; duration: number }[] = [
  { stage: 'auth',        duration: 900  },
  { stage: 'permissions', duration: 800  },
  { stage: 'dashboard',   duration: 1100 },
  { stage: 'finalize',    duration: 700  },
]

function useBootSequence(autoStart = false) {
  const [stage, setStage]       = useState<LoadStage>('auth')
  const [appReady, setAppReady] = useState(false)
  const [booting, setBooting]   = useState(false)

  const run = () => {
    setBooting(true)
    setStage('auth')
    setAppReady(false)
    let elapsed = 0
    BOOT_SEQUENCE.forEach(({ stage: s, duration }) => {
      setTimeout(() => setStage(s), elapsed)
      elapsed += duration
    })
    setTimeout(() => setStage('done'),  elapsed + 500)
    setTimeout(() => setAppReady(true), elapsed + 580)
  }

  useEffect(() => { if (autoStart) run() }, [autoStart])

  return { stage, appReady, booting, retry: run }
}

/* ─── Portal slide-in CSS ────────────────────────────────────── */

const PORTAL_CSS = `
@keyframes portal-reveal {
  0%   { opacity: 0.3; transform: translateX(56px); }
  100% { opacity: 1;   transform: translateX(0); }
}
`

/* ─── Root ───────────────────────────────────────────────────── */

export default function App() {
  const [page, setPage]       = useState('dashboard')
  const [loggedIn, setLoggedIn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { stage, appReady, booting, retry } = useBootSequence(loggedIn)

  const PageComponent = PAGES[page] || Dashboard

  const handleLogin = () => setLoggedIn(true)

  /* Show login page until the user authenticates */
  if (!loggedIn && !booting) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <>
      <style>{PORTAL_CSS}</style>

      {/* Loading screen — manages its own slide-left exit */}
      <LoadingScreen stage={stage} onRetry={retry} subtitle="Enterprise Suite" />

      {/* Portal — slides in from the right as loader slides left */}
      <div className="staff-shell" style={{
        display: 'flex', height: '100vh', overflow: 'hidden', background: '#ECEEF3',
        visibility: appReady ? 'visible' : 'hidden',
        animation: appReady ? 'portal-reveal 600ms cubic-bezier(0.16,1,0.3,1) both' : undefined,
      }}>
        <Sidebar active={page} onNav={id => { setPage(id); setSidebarOpen(false) }} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <TopBar page={page} onMenu={() => setSidebarOpen(true)} />

          <main style={{ flex: 1, overflowY: 'auto', background: '#ECEEF3' }}>
            <PageWrapper pageKey={page}>
              <PageComponent />
            </PageWrapper>
          </main>
        </div>
      </div>
    </>
  )
}
