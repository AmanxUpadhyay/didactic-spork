import { Component, type ErrorInfo, type ReactNode } from 'react'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private reset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-dvh flex items-center justify-center bg-background px-6">
          <EmptyState
            variant="error"
            title="Something went wrong"
            description="Mochi is confused too. Try refreshing — it usually fixes it."
          >
            <Button onClick={this.reset} size="sm">
              Refresh
            </Button>
          </EmptyState>
        </div>
      )
    }

    return this.props.children
  }
}
