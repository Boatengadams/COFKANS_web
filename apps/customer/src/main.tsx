import React from 'react'
import ReactDOM from 'react-dom/client'
import CustomerApp from './app/App'
import CustomerSplash from './app/components/CustomerSplash'
import './index.css'

class StartupErrorBoundary extends React.Component<React.PropsWithChildren, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[customer-portal] startup error', error)
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <h1>Customer portal failed to start</h1>
          <p>{this.state.error.message}</p>
        </main>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StartupErrorBoundary>
      <CustomerSplash>
        <CustomerApp />
      </CustomerSplash>
    </StartupErrorBoundary>
  </React.StrictMode>,
)
