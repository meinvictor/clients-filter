import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ActiveClientsFilterApp from './ActiveClientsFilterApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActiveClientsFilterApp />
  </StrictMode>,
)
