import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PageTransitionProvider } from '@/components/layout/PageTransition'
import { I18nProvider } from '@/i18n'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <PageTransitionProvider duration={350}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PageTransitionProvider>
    </I18nProvider>
  </StrictMode>,
)
