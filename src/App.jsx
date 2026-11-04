import React, { useEffect, useState } from 'react';
import './index.css';

const WEBSITE_FEATURES = [
  {
    icon: '🚪',
    badge: 'SEGURIDAD Y CAPTACIÓN',
    title: 'Control de Acceso, Garita y Portón GSM',
    desc: 'Pases de visita con código QR enviados por WhatsApp en 3 segundos, notificación en vivo cuando llega tu invitado, anuncio de Deliverys, lectura OCR de placas/cédulas en garita y apertura telefónica de portón identificando qué familiar autorizó cada número.',
    highlights: ['Pases QR por WhatsApp', 'Aviso de llegada en tiempo real', 'Garita + Apertura GSM']
  },
  {
    icon: '🤖',
    badge: 'INTELIGENCIA FINANCIERA',
    title: 'Contabilidad con IA y Conciliación Automática',
    desc: 'Olvídate de revisar transferencias a mano. Escanea facturas con Inteligencia Artificial (detecta RIF, proveedor y monto automáticamente) y cruza en segundos los pagos reportados por los vecinos con el extracto bancario en PDF, Excel o CSV.',
    highlights: ['Lectura de facturas con IA', 'Cruce bancario automático', 'Auditoría de extractos']
  },
  {
    icon: '💳',
    badge: 'MULTIMONEDA USD / BCV',
    title: 'Cobros Flexibles: Cuota Fija, Alícuotas o Partes Iguales',
    desc: 'Se adapta a cualquier conjunto residencial, urbanización o condominio. Configura cobros por monto fijo mensual, división exacta por alícuota (%) o partes iguales, con conversión automática a tasa BCV y avisos de cobro por WhatsApp.',
    highlights: ['Monto Fijo o Alícuotas (%)', 'Dólares ($ USD) y Bs (BCV)', 'Recibos digitales en PDF']
  },
  {
    icon: '📈',
    badge: 'GESTIÓN EJECUTIVA',
    title: 'Panel Directivo con 19 Indicadores KPI en Vivo',
    desc: 'Toma decisiones con datos claros: monitorea la velocidad de recaudación, semáforo de morosidad, meses de reserva operativa, ejecución presupuestaria y salud financiera desde un panel interactivo 100% personalizable.',
    highlights: ['19 KPIs financieros y operativos', 'Configuración en 1 toque', 'Transparencia al centavo']
  },
  {
    icon: '🏊',
    badge: 'CONVIVENCIA ORGANIZADA',
    title: 'Reserva de Áreas Comunes y Eventos',
    desc: 'Calendario inteligente para Salón de Fiesta, Caney, Parrillera, Piscina, Canchas o Gimnasio. Automatiza reglas de uso, bloqueo opcional para inmuebles con deuda, control de horarios y lista de invitados para vigilancia.',
    highlights: ['Salón, Caney, Piscina y Canchas', 'Validación automática de solvencia', 'Control de aforo y horarios']
  },
  {
    icon: '🗳️',
    badge: 'DECISIONES LEGALES LPH',
    title: 'Cartas Consulta Digitales y Presupuestos',
    desc: 'Consulta a tu comunidad desde el celular con total validez legal: lanza sondeos de factibilidad, compara hasta 3 presupuestos de proveedores y ejecuta votaciones vinculantes con conteo automático por propiedad o alícuota.',
    highlights: ['Sondeo → Presupuestos → Votación', 'Quórum automático en vivo', 'Resultados auditables']
  },
  {
    icon: '🛠️',
    badge: 'ATENCIÓN AL PROPIETARIO',
    title: 'Reporte de Averías, Mejoras y Tickets',
    desc: 'Sustituye el caos de los grupos de WhatsApp por un canal organizado. Los vecinos reportan averías con fotos, apoyan solicitudes comunitarias y consultan el avance de cada reparación en tiempo real.',
    highlights: ['Tickets con evidencia fotográfica', 'Seguimiento de estatus en vivo', 'Historial de mantenimiento']
  },
  {
    icon: '🔄',
    badge: 'EXPERIENCIA DUAL',
    title: 'Cambio de Pantalla Junta ↔ Propietario en 1 Clic',
    desc: 'Si eres miembro de la Junta Directiva y también propietario en la comunidad, alterna instantáneamente entre el Panel de Administración y tu Vista de Vecino sin cerrar sesión ni mezclar cuentas.',
    highlights: ['Interruptor Junta / Vecino (🔄)', 'También modo Solo Administrador', 'App móvil rápida e intuitiva']
  },
  {
    icon: '🎧',
    badge: 'ACOMPAÑAMIENTO TOTAL',
    title: 'Equipo de Soporte por WhatsApp + Agentes IA',
    desc: 'Inicia hoy mismo con los datos básicos de tu comunidad y recibe acompañamiento directo de nuestro Equipo de Soporte por WhatsApp y correo para completar tus bancos, saldos iniciales y listado de vecinos.',
    highlights: ['Alta rápida en 2 minutos', 'Soporte humano por WhatsApp', 'Agentes IA 24/7 (Sofía y Carlos)']
  }
];

const ONBOARDING_BANKS = [
  { id: 'banesco', name: 'Banesco (Bs)' },
  { id: 'activo', name: 'Banco Activo (Bs)' },
  { id: 'mercantil', name: 'Mercantil (Bs)' },
  { id: 'provincial', name: 'BBVA Provincial (Bs)' },
  { id: 'bnc', name: 'BNC (Bs)' },
  { id: 'bancamiga', name: 'Bancamiga (Bs / USD)' },
  { id: 'bdv', name: 'Banco de Venezuela (Bs)' },
  { id: 'efectivo_usd', name: 'Caja Fuerte Efectivo ($ USD)' },
  { id: 'zelle_usdt', name: 'Zelle / Binance USDT ($ USD)' }
];

const ONBOARDING_AREAS = [
  { id: 'salon', name: '🎉 Salón de Fiesta' },
  { id: 'parrillera', name: '🍖 Caney / Parrillera' },
  { id: 'piscina', name: '🏊 Piscina' },
  { id: 'cancha', name: '🎾 Cancha Deportiva' },
  { id: 'gimnasio', name: '🏋️ Gimnasio' },
  { id: 'parque', name: '🛝 Parque Infantil' },
  { id: 'terraza', name: '🧘 Terraza / Lounge' }
];

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* NAVBAR */}
      <nav
        className="site-navbar"
        style={{
          background: scrolled ? 'rgba(6, 13, 24, 0.92)' : 'rgba(6, 13, 24, 0.45)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent'
        }}
      >
        <div className="site-brand">
          <img src="/logo-iacondo.png" alt="Logo IA Condo" className="site-brand-logo" />
          <span>IACONDO<span style={{ color: 'var(--accent-primary)' }}>.COM</span></span>
        </div>
        <div className="site-nav-actions">
          <a href="#features" className="btn btn-secondary site-nav-btn">Funcionalidades</a>
          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            className="btn btn-primary site-nav-btn"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
          >
            🚀 Dar de Alta mi Condominio
          </button>
          <a href="https://app.iacondo.com" className="btn btn-secondary site-nav-btn">Iniciar Sesión</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8.5rem 5% 4.5rem 5%', overflow: 'hidden'
      }}>
        {/* Background Image & Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2 }}>
          <img src="/hero-bg-notext.png" alt="IACondo Background" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(6,13,24,0.45) 0%, rgba(6,13,24,0.92) 100%)', zIndex: -1 }}></div>

        <div style={{ maxWidth: '900px', width: '100%', minWidth: 0, textAlign: 'center', zIndex: 1 }} className="fade-in-up">
          <span style={{ display: 'inline-block', padding: '0.45rem 1.1rem', background: 'rgba(16, 185, 129, 0.16)', color: '#34d399', borderRadius: '999px', fontWeight: '800', fontSize: 'clamp(0.75rem, 0.7rem + 0.3vw, 0.9rem)', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.45)', maxWidth: '100%' }}>
            🎁 ALTA 100% GRATIS + 30 DÍAS CON TODAS LAS FUNCIONES PREMIUM
          </span>
          <h1 style={{ fontSize: 'clamp(1.9rem, 1.3rem + 3.6vw, 4.15rem)', fontWeight: '900', marginBottom: '1.25rem', wordBreak: 'break-word', lineHeight: 1.14 }}>
            Descubre cómo la <span className="text-gradient">Inteligencia Artificial</span> <br />
            puede gestionar tu Condominio.
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 0.92rem + 0.45vw, 1.24rem)', color: '#e2e8f0', maxWidth: '740px', margin: '0 auto 1.4rem auto', lineHeight: '1.68' }}>
            Da de alta tu condominio <strong>totalmente gratis</strong> y disfruta durante <strong>30 días de todas las funciones Premium</strong> para que descubras cómo gestionar tu condominio de forma inteligente: control de acceso, conciliación bancaria con IA, cobros automatizados y reserva de áreas comunes.
          </p>

          {/* Píldoras de Confianza de la Promoción de 30 Días */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '2rem' }}>
            <span style={{ background: 'rgba(15, 23, 42, 0.78)', border: '1px solid rgba(52, 211, 153, 0.4)', color: '#6ee7b7', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: '700' }}>
              ✓ Registro Gratis en 2 minutos
            </span>
            <span style={{ background: 'rgba(15, 23, 42, 0.78)', border: '1px solid rgba(56, 189, 248, 0.4)', color: '#7dd3fc', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: '700' }}>
              ⭐ 30 días de Plan Premium incluidos
            </span>
            <span style={{ background: 'rgba(15, 23, 42, 0.78)', border: '1px solid rgba(255, 255, 255, 0.18)', color: '#cbd5e1', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.82rem', fontWeight: '700' }}>
              🔓 Sin compromiso (Plan Gratuito permanente disponible)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
            <button
              type="button"
              onClick={() => setShowOnboardingModal(true)}
              className="btn btn-primary"
              style={{
                padding: 'clamp(0.95rem, 2.5vw, 1.15rem) clamp(1.5rem, 4vw, 2.4rem)',
                fontSize: 'clamp(0.96rem, 0.9rem + 0.4vw, 1.12rem)',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 10px 28px rgba(16, 185, 129, 0.42)',
                whiteSpace: 'normal',
                textAlign: 'center',
                maxWidth: '100%',
                border: 'none'
              }}
            >
              🚀 Dar de Alta mi Condominio Gratis (30 Días Premium)
            </button>
            <a
              href="#features"
              className="btn btn-secondary"
              style={{
                padding: 'clamp(0.95rem, 2.5vw, 1.15rem) clamp(1.3rem, 3.5vw, 2rem)',
                fontSize: 'clamp(0.92rem, 0.86rem + 0.35vw, 1.05rem)',
                fontWeight: '700',
                background: 'rgba(15, 23, 42, 0.65)',
                borderColor: 'rgba(56, 189, 248, 0.4)',
                whiteSpace: 'normal',
                textAlign: 'center',
                maxWidth: '100%'
              }}
            >
              📖 Ver Todas las Funcionalidades
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION: TODAS LAS BONDADES Y FUNCIONALIDADES DE IACONDO */}
      <section id="features" style={{ padding: 'clamp(4rem, 8vw, 6.5rem) 5%', background: 'var(--bg-main)', width: '100%', overflowX: 'clip' }}>
        <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }} className="fade-in-up delay-1">
            <span style={{
              display: 'inline-block',
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              background: 'rgba(14, 165, 233, 0.12)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#38bdf8',
              fontSize: '0.78rem',
              fontWeight: '800',
              letterSpacing: '0.5px',
              marginBottom: '0.85rem'
            }}>
              ⚡ UN PROGRAMA INTELIGENTE PARA UNA COMUNIDAD ORGANIZADA
            </span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 1.3rem + 2.2vw, 2.75rem)', fontWeight: '800', color: '#ffffff' }}>
              Todo lo que tu gestión necesita para una <span className="text-gradient">Comunidad Organizada</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.98rem, 0.92rem + 0.35vw, 1.15rem)', maxWidth: '720px', margin: '0.9rem auto 0 auto', lineHeight: 1.65 }}>
              Conoce todas las bondades que tendrás activas desde el primer día durante tus 30 días de prueba Premium gratuita para ahorrar horas de trabajo administrativo y brindar total claridad financiera a tus vecinos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 'clamp(1.25rem, 3vw, 1.85rem)', width: '100%' }}>
            {WEBSITE_FEATURES.map((feat, idx) => (
              <FeatureCard
                key={idx}
                icon={feat.icon}
                badge={feat.badge}
                title={feat.title}
                desc={feat.desc}
                highlights={feat.highlights}
              />
            ))}
          </div>

          {/* Banner Intermedio de Alta Rápida */}
          <div
            className="glass-panel"
            style={{
              marginTop: '3.2rem',
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.16) 0%, rgba(16, 185, 129, 0.14) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              padding: 'clamp(1.5rem, 4vw, 2.25rem)'
            }}
          >
            <div style={{ maxWidth: '680px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.4px', marginBottom: '0.35rem' }}>
                🎁 ALTA GRATIS + 30 DÍAS DE PLAN PREMIUM INCLUIDOS
              </div>
              <h3 style={{ fontSize: 'clamp(1.25rem, 1rem + 1.2vw, 1.65rem)', color: '#ffffff', marginBottom: '0.45rem', fontWeight: '800' }}>
                Descubre hoy mismo cómo la Inteligencia Artificial gestiona tu condominio
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, lineHeight: 1.55 }}>
                Registra tu condominio gratis en 2 minutos y disfruta durante <strong>30 días de todas las funciones Premium sin costo</strong>. Nuestro <strong>Equipo de Soporte por WhatsApp</strong> te acompañará paso a paso en la puesta en marcha.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowOnboardingModal(true)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                padding: '1rem 1.75rem',
                fontWeight: '800',
                fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                whiteSpace: 'normal',
                textAlign: 'center'
              }}
            >
              🚀 Dar de Alta mi Condominio Gratis →
            </button>
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 5%', background: 'linear-gradient(to bottom, var(--bg-main), #0a1120)', width: '100%', overflowX: 'clip' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1.25rem, 4vw, 3rem)' }}>
          
          <div className="glass-panel fade-in-up delay-2">
            <h3 style={{ fontSize: 'clamp(1.25rem, 1.05rem + 1vw, 1.75rem)', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent-primary)' }}>🛡️</span> Para una Gestión Impecable (Junta y Administración)
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <BenefitItem text="Ahorra hasta un 85% del tiempo con conciliación bancaria y lectura de facturas con IA." />
              <BenefitItem text="Configura cobros por cuota fija mensual, alícuotas (%) o gastos en partes iguales." />
              <BenefitItem text="Controla saldos multimoneda en Dólares ($ USD) y Bolívares a tasa BCV automática." />
              <BenefitItem text="Cambia en 1 clic entre tu Vista de Junta Directiva y tu Vista de Propietario (🔄)." />
              <BenefitItem text="19 indicadores gerenciales (KPIs) para presentar cuentas claras y auditables." />
            </ul>
          </div>

          <div className="glass-panel fade-in-up delay-3">
            <h3 style={{ fontSize: 'clamp(1.25rem, 1.05rem + 1vw, 1.75rem)', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#10b981' }}>🏘️</span> Para una Comunidad Organizada (Propietarios y Vecinos)
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <BenefitItem text="Genera Pases QR de invitados por WhatsApp y recibe aviso apenas lleguen a garita." />
              <BenefitItem text="Gestiona los teléfonos autorizados de tu vivienda viendo qué familiar registró cada número." />
              <BenefitItem text="Reporta pagos en segundos desde el celular y descarga tus recibos históricos." />
              <BenefitItem text="Reserva áreas comunes (Salón, Caney, Piscina, Canchas) desde el calendario digital." />
              <BenefitItem text="Participa activamente en las decisiones de tu comunidad con Cartas Consulta LPH." />
            </ul>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contacto" style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 5%', borderTop: '1px solid var(--border-light)', width: '100%', overflowX: 'clip' }}>
        <div style={{ maxInlineSize: '640px', inlineSize: '100%', marginInline: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.55rem, 1.2rem + 2vw, 2.4rem)', marginBottom: '0.75rem' }}>
              Comienza Hoy Mismo o Conversa con Nuestro Equipo
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.92rem, 0.86rem + 0.35vw, 1.05rem)', lineHeight: 1.6 }}>
              Puedes <strong>dar de alta tu condominio directamente en 2 minutos</strong> para entrar al programa ahora mismo, o dejarnos tus datos abajo para que <strong>Sofía IA y nuestro Equipo de Soporte</strong> te asistan por WhatsApp y correo.
            </p>
            <div style={{ marginTop: '1.1rem' }}>
              <button
                type="button"
                onClick={() => setShowOnboardingModal(true)}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  padding: '0.85rem 1.5rem',
                  fontWeight: '800',
                  fontSize: '0.96rem'
                }}
              >
                🚀 Dar de Alta mi Condominio en 4 Pasos Rápidos
              </button>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#030712', padding: '3rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <img src="/logo-iacondo.png" alt="Logo IA Condo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <span style={{ color: 'white' }}>IACONDO<span style={{ color: 'var(--accent-primary)' }}>.COM</span></span>
        </div>
        <p style={{ marginBottom: '0.35rem', color: '#e2e8f0', fontWeight: '600', fontSize: '0.92rem' }}>
          © {new Date().getFullYear()} SOLUCIONES DIGITALES CREAPPTIVAS C.A. — Todos los derechos reservados.
        </p>
        <p style={{ marginBottom: '1.25rem', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          RIF: <strong style={{ color: '#cbd5e1' }}>J508901061</strong>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
          <a href="mailto:hola@iacondo.com" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>📧 hola@iacondo.com</a>
          <a href="mailto:soporte@iacondo.com" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>🛠️ soporte@iacondo.com</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Funcionalidades</a>
          <button
            type="button"
            onClick={() => setShowOnboardingModal(true)}
            style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Dar de Alta mi Condominio
          </button>
        </div>
      </footer>

      <WhatsAppFloatingButton />

      {showOnboardingModal && (
        <WebsiteOnboardingModal onClose={() => setShowOnboardingModal(false)} />
      )}
    </div>
  );
}

// Subcomponents
function FeatureCard({ icon, badge, title, desc, highlights = [] }) {
  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.9rem' }}>
          <span style={{ fontSize: '2.35rem', lineHeight: 1 }}>{icon}</span>
          {badge && (
            <span style={{
              fontSize: '0.68rem',
              fontWeight: '800',
              padding: '0.24rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(14, 165, 233, 0.14)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              letterSpacing: '0.4px'
            }}>
              {badge}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.65rem', color: '#ffffff', fontWeight: '800' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.93rem', lineHeight: 1.6, marginBottom: '1rem' }}>{desc}</p>
      </div>

      {highlights.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {highlights.map((item, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.73rem',
                fontWeight: '700',
                color: '#cbd5e1',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.22rem 0.55rem',
                borderRadius: '8px'
              }}
            >
              ✓ {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', minWidth: 0 }}>
      <span style={{ color: '#10b981', marginTop: '2px', flexShrink: 0, fontWeight: '900' }}>✓</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 0.85rem + 0.3vw, 1.05rem)', minWidth: 0 }}>{text}</span>
    </li>
  );
}

function WebsiteOnboardingModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [condoName, setCondoName] = useState('');
  const [unitType, setUnitType] = useState('Casa');
  const [totalUnits, setTotalUnits] = useState('24');
  const [userRoleType, setUserRoleType] = useState('board_and_owner'); // 'board_and_owner' | 'admin_only' | 'owner_only'
  const [ownerUnitNumber, setOwnerUnitNumber] = useState('1');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [billingMethod, setBillingMethod] = useState('fixed'); // 'fixed' | 'alicuota' | 'equal'
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [quotaUSD, setQuotaUSD] = useState('25');
  const [selectedBanks, setSelectedBanks] = useState(['banesco', 'efectivo_usd']);
  const [selectedAreas, setSelectedAreas] = useState(['salon', 'parrillera']);
  const [accessControlType, setAccessControlType] = useState('both');

  const toggleBank = (id) => {
    setSelectedBanks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleArea = (id) => {
    setSelectedAreas(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const buildLaunchAppUrl = () => {
    const cleanUnits = Math.min(300, Math.max(2, parseInt(totalUnits, 10) || 24));
    const hasAccess = accessControlType !== 'none';
    const initialView = userRoleType === 'admin_only' ? 'admin' : 'owner';
    const params = new URLSearchParams({
      demo: '1',
      onboarding: '1',
      condo: (condoName || 'Mi Comunidad').trim(),
      units: String(cleanUnits),
      type: unitType,
      access: hasAccess ? '1' : '0',
      quota: String(Number(quotaUSD) || 25),
      client: (clientName || '').trim(),
      roleType: userRoleType,
      billing: billingMethod,
      currency: baseCurrency,
      view: initialView
    });
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseApp = isLocal ? 'http://localhost:5173/demo' : 'https://app.iacondo.com/demo';
    return `${baseApp}?${params.toString()}`;
  };

  const handleLaunchNow = async (e) => {
    e.preventDefault();
    const bankNames = ONBOARDING_BANKS.filter(b => selectedBanks.includes(b.id)).map(b => b.name).join(', ');
    const areaNames = ONBOARDING_AREAS.filter(a => selectedAreas.includes(a.id)).map(a => a.name).join(', ');
    const roleLabel =
      userRoleType === 'board_and_owner'
        ? `Junta y Propietario (${unitType} ${ownerUnitNumber})`
        : userRoleType === 'admin_only'
        ? 'Solo Junta / Administrador'
        : `Propietario (${unitType} ${ownerUnitNumber})`;

    // Notificar silenciosamente al backend de contacto para registro del lead
    try {
      fetch('https://condopro-api.onrender.com/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName || 'Nuevo Usuario Alta Web',
          email: clientEmail || 'alta@iacondo.com',
          phone: clientPhone || '',
          condominium: condoName || 'Nuevo Condominio',
          message: `ALTA DIRECTA DESDE WEB: ${totalUnits} ${unitType}s | Rol: ${roleLabel} | Cobro: ${billingMethod} (${baseCurrency}) | Bancos: ${bankNames} | Áreas: ${areaNames} | Acceso: ${accessControlType}`
        })
      }).catch(() => {});
    } catch (err) {}

    window.location.href = buildLaunchAppUrl();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6, 13, 24, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        overflowY: 'auto'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f172a',
          border: '1.5px solid rgba(56, 189, 248, 0.45)',
          borderRadius: '20px',
          maxWidth: '680px',
          width: '100%',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          color: '#f8fafc',
          boxShadow: '0 25px 60px rgba(0,0,0,0.75)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#34d399', letterSpacing: '0.4px' }}>
              🎁 ALTA GRATIS + 30 DÍAS PREMIUM INCLUIDOS — PASO {step} DE 4
            </span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: '900', color: '#ffffff' }}>
              Da de Alta tu Condominio y Comienza Ahora
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Barra de progreso */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginBottom: '1.35rem' }}>
          {[1, 2, 3, 4].map(n => (
            <div
              key={n}
              style={{
                height: '6px',
                borderRadius: '999px',
                background: n <= step ? 'linear-gradient(90deg, #38bdf8, #10b981)' : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </div>

        <form onSubmit={handleLaunchNow} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {step === 1 && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                  🏘️ Nombre de tu Condominio, Urbanización o Comunidad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Conjunto Residencial Los Naranjos"
                  value={condoName}
                  onChange={e => setCondoName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Tipo de Propiedades
                  </label>
                  <select
                    value={unitType}
                    onChange={e => setUnitType(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                  >
                    <option value="Casa">🏡 Casas / Villas / Townhouses</option>
                    <option value="Apto">🏢 Apartamentos / Inmuebles</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                    Número Total de Propiedades *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="300"
                    required
                    value={totalUnits}
                    onChange={e => setTotalUnits(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    👤 Tu Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Ing. Roberto Méndez"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.92rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    📱 Tu WhatsApp (Para Soporte) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej: 0414-1234567"
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.92rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  ✉️ Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={clientEmail}
                  onChange={e => setClientEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.92rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.45rem' }}>
                  🔄 ¿Cuál es tu rol en la comunidad? (Habilita el cambio de pantalla)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    {
                      id: 'board_and_owner',
                      title: '🔄 Soy de la Junta y también Propietario',
                      sub: 'Habilita el botón para cambiar entre Vista Junta Directiva y Vista Propietario.'
                    },
                    {
                      id: 'admin_only',
                      title: '🛡️ Soy solo Administrador / Junta Externa',
                      sub: 'Muestra únicamente el Panel Administrativo sin vista de vecino.'
                    },
                    {
                      id: 'owner_only',
                      title: '🏡 Soy Propietario / Vecino',
                      sub: 'Quiero explorar la experiencia de vecino y compartirla con mi Junta.'
                    }
                  ].map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => setUserRoleType(opt.id)}
                      style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: '12px',
                        border: userRoleType === opt.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                        background: userRoleType === opt.id ? 'rgba(14, 165, 233, 0.16)' : '#1e293b',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#ffffff' }}>{opt.title}</div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.15rem' }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '0.45rem' }}>
                  💳 ¿Cómo se calculan los cobros mensuales?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.55rem' }}>
                  {[
                    { id: 'fixed', label: '💵 Monto Fijo Mensual', desc: 'Todos pagan la misma cuota fija' },
                    { id: 'alicuota', label: '📐 Por Alícuota (%)', desc: 'Gastos según % de cada inmueble' },
                    { id: 'equal', label: '⚖️ Partes Iguales', desc: 'Gastos del mes entre N° de inmuebles' }
                  ].map(m => (
                    <div
                      key={m.id}
                      onClick={() => setBillingMethod(m.id)}
                      style={{
                        padding: '0.7rem',
                        borderRadius: '12px',
                        border: billingMethod === m.id ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                        background: billingMethod === m.id ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: '800', fontSize: '0.84rem', color: '#fff' }}>{m.label}</div>
                      <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.15rem' }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Moneda Principal
                  </label>
                  <select
                    value={baseCurrency}
                    onChange={e => setBaseCurrency(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  >
                    <option value="USD">💵 Dólares ($ USD / Tasa BCV)</option>
                    <option value="VES">🇻🇪 Bolívares (Bs)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                    Cuota Estimada ($ USD)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quotaUSD}
                    onChange={e => setQuotaUSD(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  🏦 ¿Qué banco(s) o cajas utiliza la comunidad?
                </label>
                <p style={{ fontSize: '0.75rem', color: '#fbbf24', margin: '0 0 0.55rem 0' }}>
                  💡 Solo selecciona el banco ahora. El número de cuenta se te solicitará más adelante cuando vayas a registrar gastos o facturas.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '0.45rem' }}>
                  {ONBOARDING_BANKS.map(b => {
                    const active = selectedBanks.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBank(b.id)}
                        style={{
                          padding: '0.55rem 0.7rem',
                          borderRadius: '10px',
                          border: active ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                          background: active ? 'rgba(14, 165, 233, 0.18)' : '#1e293b',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {active ? '✓ ' : '+ '} {b.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '0.45rem' }}>
                  🏊 Selecciona las Áreas Comunes para gestionar reservas:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: '0.45rem' }}>
                  {ONBOARDING_AREAS.map(a => {
                    const active = selectedAreas.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleArea(a.id)}
                        style={{
                          padding: '0.6rem 0.75rem',
                          borderRadius: '10px',
                          border: active ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                          background: active ? 'rgba(16, 185, 129, 0.18)' : '#1e293b',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {active ? '✓ ' : ''} {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '0.45rem' }}>
                  🚪 ¿Cuentan con Garita de Vigilancia o Portón Eléctrico?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { id: 'both', label: '🛡️ Garita + Portón Telefónico GSM' },
                    { id: 'garita', label: '👮 Solo Garita de Vigilancia' },
                    { id: 'porton', label: '📱 Solo Portón Telefónico GSM' },
                    { id: 'none', label: '🏢 Sin control de acceso físico' }
                  ].map(ac => (
                    <button
                      key={ac.id}
                      type="button"
                      onClick={() => setAccessControlType(ac.id)}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '10px',
                        border: accessControlType === ac.id ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                        background: accessControlType === ac.id ? 'rgba(14, 165, 233, 0.18)' : '#1e293b',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {ac.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.5rem' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.2rem', fontSize: '0.88rem' }}
              >
                ← Anterior
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !condoName.trim()) {
                    alert('Ingresa el nombre de tu comunidad o condominio.');
                    return;
                  }
                  if (step === 2 && (!clientName.trim() || !clientPhone.trim())) {
                    alert('Ingresa tu nombre y WhatsApp para que nuestro Equipo de Soporte pueda asistirte.');
                    return;
                  }
                  setStep(s => s + 1);
                }}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.92rem', fontWeight: '800' }}
              >
                Siguiente Paso →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: '0.85rem 1.6rem',
                  fontSize: '0.95rem',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none'
                }}
              >
                🚀 Crear mi Comunidad y Entrar al Programa Ahora
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    condominium: '',
    message: ''
  });
  const [submittedData, setSubmittedData] = useState(null);
  const [status, setStatus] = useState('idle');

  const getWhatsAppLink = (data) => {
    const d = data || formData;
    const text =
      `Hola Sofía, mi nombre es *${d.name || ''}*${d.condominium ? ` de la comunidad *${d.condominium}*` : ''}.\n` +
      `Vengo de la página web iacondo.com${d.message ? ` (${d.message})` : ''} y me gustaría conversar contigo sobre IA Condo.`;
    return `https://wa.me/584222537239?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const payload = {
      ...formData,
      message: (formData.message || '').trim() || `Solicitud de información y puesta en marcha para ${formData.condominium || 'mi comunidad'}.`
    };
    setSubmittedData(payload);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', condominium: '', message: '' });
      } else {
        const fallbackRes = await fetch('https://condopro-api.onrender.com/api/public/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (fallbackRes.ok) {
          setStatus('success');
          setFormData({ name: '', email: '', phone: '', condominium: '', message: '' });
        } else {
          setStatus('error');
        }
      }
    } catch (error) {
      console.error('Error enviando formulario:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    const activeData = submittedData || formData;
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🤖✨</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.6rem', color: 'white' }}>
          ¡Solicitud Recibida! Sofía y el Equipo de Soporte ya te están atendiendo
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxInlineSize: '520px', margin: '0 auto 1.35rem auto', lineHeight: 1.6, fontSize: '0.96rem' }}>
          Hemos registrado tus datos de contacto y <strong>Sofía IA</strong> te ha enviado un correo a <strong>{activeData.email}</strong> para acompañarte en la configuración de tu comunidad con Visión Junta Directiva y Visión Propietario.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', alignItems: 'center' }}>
          <a 
            href={getWhatsAppLink(activeData)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ 
              background: '#25D366', 
              borderColor: '#25D366', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              padding: '0.9rem 1.6rem',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '800',
              borderRadius: '10px',
              fontSize: '0.98rem',
              boxShadow: '0 8px 20px rgba(37, 211, 102, 0.3)'
            }}
          >
            <span>💬</span> Continuar con Soporte por WhatsApp Ahora
          </a>
          <button 
            type="button"
            onClick={() => {
              setSubmittedData(null);
              setStatus('idle');
            }} 
            className="btn btn-secondary" 
            style={{ marginTop: '0.25rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            Enviar otra consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {status === 'error' && (
        <div role="alert" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', textAlign: 'center' }}>
          <span>Hubo un inconveniente temporal con el servidor de correo. Puedes continuar directamente con Sofía por WhatsApp con tus datos ya cargados:</span>
          <a 
            href={getWhatsAppLink(formData)} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ background: '#25D366', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>💬</span> Hablar con Sofía por WhatsApp
          </a>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="contact-name" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nombre Completo *</label>
          <input 
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Ej: Carlos Pérez"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontSize: '0.95rem' }} 
          />
        </div>
        <div>
          <label htmlFor="contact-email" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Correo Electrónico *</label>
          <input 
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@correo.com"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontSize: '0.95rem' }} 
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="contact-phone" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Teléfono / WhatsApp *</label>
          <input 
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="Ej: 0414-1234567"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontSize: '0.95rem' }} 
          />
        </div>
        <div>
          <label htmlFor="contact-condominium" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nombre de tu Comunidad / Condominio</label>
          <input 
            id="contact-condominium"
            name="condominium"
            type="text"
            autoComplete="organization"
            placeholder="Ej: Conjunto Residencial Los Naranjos"
            value={formData.condominium}
            onChange={e => setFormData({...formData, condominium: e.target.value})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontSize: '0.95rem' }} 
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Mensaje o Consulta (Opcional)</label>
        <textarea 
          id="contact-message"
          name="message"
          rows="3"
          placeholder="Cuéntanos sobre tu comunidad (cantidad aproximada de propiedades, bancos que utilizan, si cuentan con garita o portón, etc.)..."
          value={formData.message}
          onChange={e => setFormData({...formData, message: e.target.value})}
          style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontFamily: 'inherit', fontSize: '0.95rem' }} 
        ></textarea>
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ padding: '0.95rem 1rem', fontSize: 'clamp(0.9rem, 0.84rem + 0.4vw, 1.05rem)', marginTop: '0.4rem', fontWeight: '800', whiteSpace: 'normal', textAlign: 'center', width: '100%' }}>
        {status === 'loading' ? 'Conectando con Sofía IA...' : 'Solicitar Asesoría con Sofía IA y Soporte'}
      </button>
    </form>
  );
}

function WhatsAppFloatingButton() {
  const whatsappUrl =
    'https://wa.me/584222537239?text=' +
    encodeURIComponent(
      'Hola Sofía, vengo de la página web iacondo.com y me gustaría activar IA Condo en mi comunidad.'
    );

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Comunicarse por WhatsApp con IA Condo"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '999px',
        padding: '0.78rem 1.25rem',
        fontWeight: '700',
        fontSize: 'clamp(0.84rem, 0.8rem + 0.25vw, 0.95rem)',
        boxShadow: '0 8px 25px rgba(37, 211, 102, 0.4)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        maxWidth: 'calc(100vw - 32px)'
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.126.556 4.122 1.527 5.854l-1.527 5.576 5.714-1.499c1.682.893 3.597 1.402 5.631 1.402 6.627 0 12-5.373 12-12 0-6.627-5.373-12-12-12z" />
      </svg>
      <span>Soporte WhatsApp</span>
    </a>
  );
}

export default App;
