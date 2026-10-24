import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import IACondoPanel from './IACondoPanel.jsx'

const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';

const isPanelRoute =
  host.startsWith('panel.') ||
  host.startsWith('soporte.') ||
  host.startsWith('agenda.') ||
  path.startsWith('/panel');

if (isPanelRoute && typeof document !== 'undefined') {
  document.title = 'Panel Corporativo & IA | IACONDO.COM';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isPanelRoute ? <IACondoPanel /> : <App />}
  </StrictMode>,
)
