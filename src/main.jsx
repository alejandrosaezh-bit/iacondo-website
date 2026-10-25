import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import IACondoPanel from './IACondoPanel.jsx'

const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
const path = typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '';

if (typeof window !== 'undefined' && (path === '/demo' || path.startsWith('/demo/') || host.startsWith('demo.'))) {
  window.location.replace('https://app.iacondo.com/demo' + (window.location.search || ''));
}

const isPanelRoute =
  host.startsWith('panel.') ||
  host.startsWith('soporte.') ||
  host.startsWith('agenda.') ||
  host.startsWith('ventas.') ||
  path.startsWith('/panel');

if (isPanelRoute && typeof document !== 'undefined') {
  document.title = 'Panel Corporativo & IA | IACONDO.COM';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isPanelRoute ? <IACondoPanel /> : <App />}
  </StrictMode>,
)
