import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './app/routing/routes.jsx'
import { AuthProvider } from './app/context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> 
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
