import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './app.css'
import App from './App'
import { AnimationProvider } from '@/providers/AnimationProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AnimationProvider>
        <App />
      </AnimationProvider>
    </ErrorBoundary>
  </StrictMode>,
)
