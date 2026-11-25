import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BrandSplashScreen from './components/BrandSplashScreen.jsx'

const App = lazy(() => import('./App.jsx'))
const IACondoPanel = lazy(() => import('./IACondoPanel.jsx'))

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

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#070b14', color: '#e2e8f0', fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '0.95rem' }}>
    Cargando IA Condo...
  </div>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrandSplashScreen
      subtitle={isPanelRoute ? 'Panel Corporativo & Agentes IA' : 'Gestión Inteligente de Condominios'}
    />
    <Suspense fallback={<LoadingScreen />}>
      {isPanelRoute ? <IACondoPanel /> : <App />}
    </Suspense>
  </StrictMode>,
)
