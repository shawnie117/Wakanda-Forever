import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('Application crashed:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#020204] via-[#07010f] to-[#140024] text-slate-100 flex items-center justify-center px-4">
          <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-2xl p-6">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-slate-300 mb-4">
              The app hit an unexpected error. Reload the page after checking setup values.
            </p>
            {this.state.error?.message && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10">
                <p className="text-red-300 text-xs font-semibold mb-1">Error</p>
                <p className="text-red-200 text-xs break-words">{this.state.error.message}</p>
              </div>
            )}
            {this.state.errorInfo?.componentStack && (
              <details className="mb-4 p-3 rounded-lg border border-white/10 bg-black/20">
                <summary className="cursor-pointer text-xs text-slate-300">Show stack trace</summary>
                <pre className="mt-2 text-[10px] leading-relaxed text-slate-400 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white"
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
