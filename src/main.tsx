import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthProvider'
import { TenantBrandingProvider } from '@/context/TenantBrandingProvider'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TenantBrandingProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TenantBrandingProvider>
    </BrowserRouter>
  </StrictMode>,
)
