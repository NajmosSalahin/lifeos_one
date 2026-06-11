import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 max-w-md text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h1 className="text-xl font-bold text-[var(--text-main)] mb-2">Something went wrong</h1>
            <p className="text-sm text-[var(--text-muted)] mb-6">An unexpected error occurred. Please try reloading.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white font-bold hover:opacity-90 transition">
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
