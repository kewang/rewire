import { useTranslation } from 'react-i18next'
import './App.css'
import GameBoard from './components/GameBoard'
import ErrorBoundary from './components/ErrorBoundary'

function GameErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="error-fallback">
      <div className="error-fallback__icon">⚠️</div>
      <h2 className="error-fallback__title">{t('error.title', 'Something went wrong')}</h2>
      <p className="error-fallback__message">{t('error.message', 'An unexpected error occurred in the game.')}</p>
      <pre className="error-fallback__detail">{error.message}</pre>
      <button className="error-fallback__btn" onClick={reset}>
        {t('error.backToLevels', 'Back to Level Select')}
      </button>
    </div>
  )
}

function AppErrorFallback() {
  return (
    <div className="error-fallback">
      <div className="error-fallback__icon">⚠️</div>
      <h2 className="error-fallback__title">Something went wrong</h2>
      <p className="error-fallback__message">An unexpected error occurred. Please reload the page.</p>
      <button className="error-fallback__btn" onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary fallback={(error, reset) => <GameErrorFallback error={error} reset={reset} />}>
      <GameBoard />
    </ErrorBoundary>
  )
}

function AppWithTopBoundary() {
  return (
    <ErrorBoundary fallback={() => <AppErrorFallback />}>
      <App />
    </ErrorBoundary>
  )
}

export default AppWithTopBoundary
