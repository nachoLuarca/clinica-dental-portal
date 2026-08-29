import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TenantBrandingProvider } from '@/context/TenantBrandingProvider'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <TenantBrandingProvider>
          <App />
        </TenantBrandingProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
