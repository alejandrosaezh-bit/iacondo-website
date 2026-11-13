import React, { useEffect, useState } from 'react';
import './index.css';

const WEBSITE_FEATURES = [
  {
    icon: '📂',
    badge: 'MIGRACIÓN IA EN SEGUNDOS',
    title: 'Sube tus Archivos y la IA Configura tu Condominio e Históricos',
    desc: '¿Tienes meses o años de cuadros en Excel, extractos bancarios, recibos antiguos o fotos de facturas? Súbelos todos juntos sin ordenarlos: nuestra IA los clasifica, extrae propietarios, deudas, pagos y gastos, y arma tu condominio completo con su historial en segundos.',
    highlights: ['Lee Excel, PDF, CSV y Fotos', 'Carga saldos e históricos al instante', 'Cero transcripción manual']
  },
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
    icon: '🎧',
    badge: 'PLAN GRATUITO + SOPORTE',
    title: 'Programa Gratis Permanente + Soporte por WhatsApp',
    desc: 'Instala y usa el programa gratis sin límite de tiempo ni cobros automáticos. Si lo deseas, envíanos tus archivos por WhatsApp y nuestro equipo junto con Sofía IA dejará tu comunidad lista en minutos.',
    highlights: ['Plan Gratuito Permanente ($0)', 'Soporte humano por WhatsApp', 'Agentes IA 24/7 (Sofía y Carlos)']
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
  const [onboardingInitialMode, setOnboardingInitialMode] = useState('wizard'); // 'wizard' | 'ai_files'

  const openOnboarding = (mode = 'wizard') => {
    setOnboardingInitialMode(mode);
    setShowOnboardingModal(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappFilesUrl =
    'https://wa.me/584222537239?text=' +
    encodeURIComponent(
      'Hola Sofía, quiero instalar el programa GRATIS de IACondo y enviarles nuestros archivos (Excel, extractos bancarios y facturas) para configurar nuestro condominio e históricos.'
    );

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
          <a href="#migracion-ia" className="btn btn-secondary site-nav-btn">📂 Subir Archivos IA</a>
          <a href="#features" className="btn btn-secondary site-nav-btn">Funcionalidades</a>
          <button
            type="button"
            onClick={() => openOnboarding('wizard')}
            className="btn btn-primary site-nav-btn"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
          >
            📲 Instalar Programa GRATIS
          </button>
          <a href="https://app.iacondo.com" className="btn btn-secondary site-nav-btn">Iniciar Sesión</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '6.5rem 3% 3.5rem 3%', overflow: 'hidden', backgroundColor: '#030914'
      }}>
        {/* Background Image & Overlay: Cerebro IA conectado a los 6 Servicios */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="/hero-cerebro-ia.jpg?v=2"
            alt="Cerebro IA conectado a Barrera de Acceso, Finanzas, Reserva Áreas Comunes, Mejoras y Reparaciones, Presupuestos y Agente de WhatsApp"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center' }}
          />
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(6,13,24,0.22) 0%, rgba(6,13,24,0.12) 60%, rgba(6,13,24,0.72) 100%), linear-gradient(to bottom, rgba(6,13,24,0.25) 0%, rgba(6,13,24,0.05) 75%, rgba(6,13,24,0.95) 100%)',
          zIndex: 0
        }}></div>

        <div
          style={{
            maxWidth: 'clamp(320px, 46vw, 620px)',
            width: '100%',
            minWidth: 0,
            textAlign: 'center',
            zIndex: 1,
            marginTop: 'clamp(2rem, 8vh, 5rem)',
            background: 'rgba(6, 13, 24, 0.78)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(56, 189, 248, 0.32)',
            borderRadius: '22px',
            padding: 'clamp(1.25rem, 2.4vw, 2rem) clamp(1.1rem, 2.2vw, 1.85rem)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.72), 0 0 40px rgba(14, 165, 233, 0.14)'
          }}
          className="fade-in-up"
        >
          <span style={{ display: 'inline-block', padding: '0.38rem 0.95rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '999px', fontWeight: '900', fontSize: 'clamp(0.68rem, 0.62rem + 0.25vw, 0.8rem)', marginBottom: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.55)', maxWidth: '100%' }}>
            ✅ PROGRAMA 100% GRATIS PARA SIEMPRE — SIN TARJETA NI COBROS SORPRESA
          </span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 1.1rem + 2.1vw, 2.75rem)', fontWeight: '900', marginBottom: '0.85rem', wordBreak: 'break-word', lineHeight: 1.15 }}>
            Instala <span style={{ color: '#34d399' }}>Gratis</span> el Programa con <span className="text-gradient">Inteligencia Artificial</span> para tu Condominio.
          </h1>
          <p style={{ fontSize: 'clamp(0.88rem, 0.82rem + 0.25vw, 1rem)', color: '#e2e8f0', maxWidth: '550px', margin: '0 auto 1.05rem auto', lineHeight: '1.56' }}>
            Instala y usa <strong>IACondo gratis de forma permanente</strong> ($0 para siempre, sin vencimiento ni cobros automáticos). ¿Tienes Excels, extractos bancarios o facturas? <strong>Súbelos todos juntos y nuestra IA ordenará todo y configurará tu condominio e históricos en segundos.</strong>
          </p>

          {/* Píldoras de Confianza: Gratis Permanente + Migración IA */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
            <span style={{ background: 'rgba(15, 23, 42, 0.88)', border: '1px solid rgba(52, 211, 153, 0.5)', color: '#6ee7b7', padding: '0.28rem 0.72rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
              ✅ Plan Gratuito Permanente ($0 siempre)
            </span>
            <span style={{ background: 'rgba(15, 23, 42, 0.88)', border: '1px solid rgba(56, 189, 248, 0.5)', color: '#7dd3fc', padding: '0.28rem 0.72rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '800' }}>
              📂 Carga tus archivos e históricos en segundos
            </span>
            <span style={{ background: 'rgba(15, 23, 42, 0.88)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#cbd5e1', padding: '0.28rem 0.72rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
              🚫 Sin tarjeta ni cobros automáticos nunca
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.68rem', alignItems: 'center', width: '100%' }}>
            <button
              type="button"
              onClick={() => openOnboarding('wizard')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.95rem 1.4rem',
                fontSize: 'clamp(0.92rem, 0.86rem + 0.3vw, 1.05rem)',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 10px 28px rgba(16, 185, 129, 0.45)',
                whiteSpace: 'normal',
                textAlign: 'center',
                borderRadius: '999px',
                border: 'none'
              }}
            >
              📲 Instalar el Programa 100% GRATIS Ahora
            </button>
            <button
              type="button"
              onClick={() => openOnboarding('ai_files')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.82rem 1.3rem',
                fontSize: 'clamp(0.84rem, 0.8rem + 0.25vw, 0.95rem)',
                fontWeight: '800',
                background: 'rgba(14, 165, 233, 0.16)',
                borderColor: 'rgba(56, 189, 248, 0.55)',
                color: '#7dd3fc',
                whiteSpace: 'normal',
                textAlign: 'center',
                borderRadius: '999px'
              }}
            >
              📂 Subir mis Archivos (Excel, PDFs, Bancos) y Configurar en Segundos
            </button>
          </div>
        </div>
      </section>

      {/* SECCIÓN ESTRELLA: SUBE TODOS TUS ARCHIVOS Y LA IA CONFIGURA TU CONDOMINIO E HISTÓRICOS EN SEGUNDOS */}
      <section
        id="migracion-ia"
        style={{
          padding: 'clamp(3.5rem, 7vw, 5.5rem) 5%',
          background: 'linear-gradient(180deg, #030914 0%, #071326 50%, var(--bg-main) 100%)',
          borderTop: '1px solid rgba(56, 189, 248, 0.18)',
          borderBottom: '1px solid rgba(16, 185, 129, 0.18)',
          width: '100%',
          overflowX: 'clip'
        }}
      >
        <div style={{ maxWidth: '1180px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.4rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.38rem 1rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              color: '#34d399',
              fontSize: '0.78rem',
              fontWeight: '900',
              letterSpacing: '0.5px',
              marginBottom: '0.85rem'
            }}>
              ⚡ MIGRACIÓN Y PUESTA EN MARCHA AUTOMÁTICA CON IA
            </span>
            <h2 style={{ fontSize: 'clamp(1.65rem, 1.25rem + 2.1vw, 2.65rem)', fontWeight: '900', color: '#ffffff', maxWidth: '900px', margin: '0 auto 0.9rem auto', lineHeight: 1.18 }}>
              ¿Tienes archivos en Excel, extractos bancarios y facturas? <span className="text-gradient">Súbelos todos juntos</span> y armamos tu condominio e históricos en segundos.
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.96rem, 0.9rem + 0.3vw, 1.12rem)', maxWidth: '780px', margin: '0 auto', lineHeight: 1.65 }}>
              No pierdas semanas pasando saldos ni recibos viejos a mano. Arrastra toda la documentación de tu comunidad sin importar cómo esté ordenada: nuestra Inteligencia Artificial lee cada documento, cruza la información y deja todo tu condominio y su historial contable configurados al instante.
            </p>
          </div>

          {/* 3 Pasos Visuales de la Carga Masiva IA */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))', gap: '1.35rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ borderColor: 'rgba(56, 189, 248, 0.35)', background: 'rgba(15, 23, 42, 0.65)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(56, 189, 248, 0.16)', color: '#38bdf8', padding: '0.28rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.85rem' }}>
                PASO 1 • SUBE TODO SIN ORDENAR
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '800', marginBottom: '0.55rem' }}>
                📥 Arrastra tus Excels, PDFs y Fotos
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.58, margin: 0 }}>
                Sube de una sola vez tus cuadros de morosidad en Excel, estados de cuenta bancarios, recibos anteriores, fotos de facturas y las reglas de tu comunidad (ej. cuota fija o alícuotas).
              </p>
            </div>

            <div className="glass-panel" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(15, 23, 42, 0.65)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.18)', color: '#34d399', padding: '0.28rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.85rem' }}>
                PASO 2 • EXTRACCIÓN Y AUDITORÍA IA
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '800', marginBottom: '0.55rem' }}>
                🧠 Ordenamos y Cruzamos Cada Dato
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.58, margin: 0 }}>
                La IA identifica cada casa o apartamento, propietarios, deudas acumuladas, pagos históricos, proveedores y saldos bancarios, separando cualquier discrepancia para tu revisión.
              </p>
            </div>

            <div className="glass-panel" style={{ borderColor: 'rgba(168, 85, 247, 0.4)', background: 'rgba(15, 23, 42, 0.65)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168, 85, 247, 0.18)', color: '#d8b4fe', padding: '0.28rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '0.85rem' }}>
                PASO 3 • LISTO EN SEGUNDOS
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '800', marginBottom: '0.55rem' }}>
                🚀 Condominio e Históricos Activos
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.58, margin: 0 }}>
                Tu condominio queda instalado gratis con todas sus viviendas, propietarios, saldos iniciales e historial contable listos para consultar desde computadora o celular.
              </p>
            </div>
          </div>

          {/* Caja de Acción: Hazlo tú mismo en segundos con IA o envíalos por WhatsApp */}
          <div
            className="glass-panel"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.16) 0%, rgba(14, 165, 233, 0.16) 100%)',
              border: '1.5px solid rgba(52, 211, 153, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: 'clamp(1.35rem, 3.5vw, 2rem)'
            }}
          >
            <div style={{ maxWidth: '620px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                {['📊 Excel (.xlsx / .csv)', '🏦 Extractos PDF', '🧾 Facturas y Recibos', '🏘️ Saldos Históricos'].map((tag, i) => (
                  <span key={i} style={{ fontSize: '0.73rem', fontWeight: '800', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(6, 13, 24, 0.7)', color: '#7dd3fc', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <h3 style={{ fontSize: 'clamp(1.15rem, 1rem + 0.9vw, 1.45rem)', color: '#ffffff', marginBottom: '0.35rem', fontWeight: '900' }}>
                Tú eliges: súbelos directo al Constructor IA o envíanos tus archivos por WhatsApp
              </h3>
              <p style={{ color: '#e2e8f0', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                Puedes cargar tus documentos directamente en el programa ahora mismo, o enviárnoslos por WhatsApp para que nuestro equipo los procese y te entregue el condominio listo.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', minWidth: 'min(100%, 300px)' }}>
              <button
                type="button"
                onClick={() => openOnboarding('ai_files')}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  padding: '0.9rem 1.4rem',
                  fontWeight: '900',
                  fontSize: '0.95rem',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.38)',
                  whiteSpace: 'normal',
                  textAlign: 'center'
                }}
              >
                📂 Subir mis Archivos y Configurar en Segundos →
              </button>
              <a
                href={whatsappFilesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{
                  background: 'rgba(6, 13, 24, 0.75)',
                  borderColor: 'rgba(37, 211, 102, 0.6)',
                  color: '#6ee7b7',
                  padding: '0.78rem 1.25rem',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  borderRadius: '12px',
                  whiteSpace: 'normal',
                  textAlign: 'center'
                }}
              >
                💬 Enviar Archivos por WhatsApp a Nuestro Equipo
              </a>
            </div>
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
              ⚡ UN PROGRAMA INTELIGENTE Y GRATUITO PARA TU COMUNIDAD
            </span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 1.3rem + 2.2vw, 2.75rem)', fontWeight: '800', color: '#ffffff' }}>
              Todo lo que tu gestión necesita para una <span className="text-gradient">Comunidad Organizada</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.98rem, 0.92rem + 0.35vw, 1.15rem)', maxWidth: '740px', margin: '0.9rem auto 0 auto', lineHeight: 1.65 }}>
              Instala el programa gratis en tu condominio sin fechas de corte ni pagos obligatorios, ahorra horas de trabajo administrativo y brinda total transparencia financiera a tus vecinos desde el primer día.
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

          {/* Banner Intermedio de Instalación Gratis Permanente */}
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
              <div style={{ fontSize: '0.78rem', fontWeight: '900', color: '#34d399', letterSpacing: '0.4px', marginBottom: '0.35rem' }}>
                ✅ PLAN GRATUITO PERMANENTE ($0 SIEMPRE • SIN COBROS SORPRESA)
              </div>
              <h3 style={{ fontSize: 'clamp(1.25rem, 1rem + 1.2vw, 1.65rem)', color: '#ffffff', marginBottom: '0.45rem', fontWeight: '800' }}>
                Instala IACondo gratis hoy y úsalo sin límite de tiempo
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0, lineHeight: 1.55 }}>
                Sin tarjetas de crédito ni cargos ocultos al pasar el primer mes: cuentas con un <strong>Plan Gratuito Permanente</strong> para gestionar tu condominio con tranquilidad, y puedes cargar tus archivos históricos en segundos con ayuda de nuestra IA.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openOnboarding('wizard')}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                padding: '1rem 1.75rem',
                fontWeight: '900',
                fontSize: '1rem',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                whiteSpace: 'normal',
                textAlign: 'center'
              }}
            >
              📲 Instalar el Programa GRATIS →
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
              <BenefitItem text="Sube tus Excels, extractos y facturas para armar tu condominio e históricos en segundos." />
              <BenefitItem text="Ahorra hasta un 85% del tiempo con conciliación bancaria y lectura de facturas con IA." />
              <BenefitItem text="Configura cobros por cuota fija mensual, alícuotas (%) o gastos en partes iguales." />
              <BenefitItem text="Controla saldos multimoneda en Dólares ($ USD) y Bolívares a tasa BCV automática." />
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
              Instala el Programa Gratis Hoy o Envíanos tus Archivos
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.92rem, 0.86rem + 0.35vw, 1.05rem)', lineHeight: 1.6 }}>
              Puedes <strong>instalar tu condominio gratis ahora mismo</strong> (desde cero o subiendo tus archivos Excel/PDF para que la IA cargue todo tu historial en segundos), o dejarnos tus datos abajo para asistirte por WhatsApp.
            </p>
            <div style={{ marginTop: '1.1rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => openOnboarding('wizard')}
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  padding: '0.85rem 1.4rem',
                  fontWeight: '900',
                  fontSize: '0.94rem'
                }}
              >
                📲 Instalar Programa GRATIS
              </button>
              <button
                type="button"
                onClick={() => openOnboarding('ai_files')}
                className="btn btn-secondary"
                style={{
                  borderColor: 'rgba(56, 189, 248, 0.5)',
                  color: '#7dd3fc',
                  background: 'rgba(14, 165, 233, 0.14)',
                  padding: '0.85rem 1.3rem',
                  fontWeight: '800',
                  fontSize: '0.9rem'
                }}
              >
                📂 Subir Archivos e Históricos con IA
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
          <a href="#migracion-ia" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Carga de Archivos IA</a>
          <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Funcionalidades</a>
          <button
            type="button"
            onClick={() => openOnboarding('wizard')}
            style={{ background: 'none', border: 'none', color: '#34d399', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            Instalar Programa Gratis
          </button>
        </div>
      </footer>

      <WhatsAppFloatingButton />

      {showOnboardingModal && (
        <WebsiteOnboardingModal
          initialMode={onboardingInitialMode}
          onClose={() => setShowOnboardingModal(false)}
        />
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

function WebsiteOnboardingModal({ initialMode = 'wizard', onClose }) {
  const [modalMode, setModalMode] = useState(initialMode === 'ai_files' ? 'ai_files' : 'wizard'); // 'wizard' | 'ai_files'
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

  const buildLaunchAppUrl = (useAiBuilder = false) => {
    const cleanUnits = Math.min(300, Math.max(2, parseInt(totalUnits, 10) || 24));
    const hasAccess = accessControlType !== 'none';
    const initialView = useAiBuilder ? 'admin' : (userRoleType === 'admin_only' ? 'admin' : 'owner');
    const params = new URLSearchParams({
      demo: '1',
      onboarding: '1',
      condo: (condoName || 'Mi Condominio').trim(),
      units: String(cleanUnits),
      type: unitType,
      access: hasAccess ? '1' : '0',
      quota: String(Number(quotaUSD) || 25),
      client: (clientName || '').trim(),
      email: (clientEmail || '').trim(),
      phone: (clientPhone || '').trim(),
      ownerUnit: String(ownerUnitNumber || 1),
      roleType: userRoleType,
      billing: billingMethod,
      currency: baseCurrency,
      banks: selectedBanks.join(','),
      areas: selectedAreas.join(','),
      view: initialView
    });
    if (useAiBuilder) {
      params.set('aiBuilder', '1');
    }
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const targetRoute = useAiBuilder ? '/admin/inicio' : '/demo';
    const baseApp = isLocal ? `http://localhost:5173${targetRoute}` : `https://app.iacondo.com${targetRoute}`;
    return `${baseApp}?${params.toString()}`;
  };

  const handleLaunchAiFilesMode = (e) => {
    e.preventDefault();
    if (!condoName.trim()) {
      alert('Ingresa el nombre de tu condominio o comunidad para crear tu espacio.');
      return;
    }
    try {
      fetch('https://condopro-api.onrender.com/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName || 'Usuario Carga Masiva IA',
          email: clientEmail || 'alta@iacondo.com',
          phone: clientPhone || '',
          condominium: condoName || 'Nuevo Condominio',
          message: `INSTALACIÓN GRATIS CON CARGA MASIVA DE ARCHIVOS IA: ${condoName}`
        })
      }).catch(() => {});
    } catch (err) {}

    window.location.href = buildLaunchAppUrl(true);
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
          message: `INSTALACIÓN GRATIS DESDE WEB: ${totalUnits} ${unitType}s | Rol: ${roleLabel} | Cobro: ${billingMethod} (${baseCurrency}) | Bancos: ${bankNames} | Áreas: ${areaNames} | Acceso: ${accessControlType}`
        })
      }).catch(() => {});
    } catch (err) {}

    window.location.href = buildLaunchAppUrl(false);
  };

  const whatsappDirectUploadUrl =
    'https://wa.me/584222537239?text=' +
    encodeURIComponent(
      `Hola Sofía, quiero instalar IACondo GRATIS para *${condoName || 'mi condominio'}* y enviarles nuestros archivos (Excel, extractos bancarios y facturas) para que configuren nuestro condominio e históricos.`
    );

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '900', color: '#34d399', letterSpacing: '0.4px' }}>
              ✅ PROGRAMA 100% GRATIS PARA SIEMPRE • SIN TARJETA NI COBROS SORPRESA
            </span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.3rem', fontWeight: '900', color: '#ffffff' }}>
              Instala IACondo Gratis en tu Comunidad
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

        {/* Selector de Modo: Subir Archivos con IA en Segundos vs Paso a Paso */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '0.55rem', marginBottom: '1.2rem' }}>
          <button
            type="button"
            onClick={() => setModalMode('ai_files')}
            style={{
              padding: '0.75rem 0.9rem',
              borderRadius: '12px',
              border: modalMode === 'ai_files' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
              background: modalMode === 'ai_files' ? 'rgba(14, 165, 233, 0.18)' : '#1e293b',
              color: '#ffffff',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: '900', fontSize: '0.86rem', color: modalMode === 'ai_files' ? '#7dd3fc' : '#ffffff' }}>
              📂 Subir mis Archivos con IA (En Segundos)
            </div>
            <div style={{ fontSize: '0.73rem', color: '#cbd5e1', marginTop: '0.18rem' }}>
              Sube tus Excels, extractos y facturas: la IA arma el condominio e históricos.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setModalMode('wizard')}
            style={{
              padding: '0.75rem 0.9rem',
              borderRadius: '12px',
              border: modalMode === 'wizard' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
              background: modalMode === 'wizard' ? 'rgba(16, 185, 129, 0.16)' : '#1e293b',
              color: '#ffffff',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ fontWeight: '900', fontSize: '0.86rem', color: modalMode === 'wizard' ? '#6ee7b7' : '#ffffff' }}>
              🛠️ Configuración Guiada desde Cero (2 min)
            </div>
            <div style={{ fontSize: '0.73rem', color: '#cbd5e1', marginTop: '0.18rem' }}>
              Configura propiedades, bancos y áreas comunes en 4 pasos simples.
            </div>
          </button>
        </div>

        {modalMode === 'ai_files' ? (
          <form onSubmit={handleLaunchAiFilesMode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(16, 185, 129, 0.14))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '14px',
              padding: '1rem 1.1rem'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '900', color: '#7dd3fc', marginBottom: '0.35rem' }}>
                ⚡ Constructor Automático de Condominio e Históricos con IA
              </div>
              <p style={{ margin: 0, fontSize: '0.83rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                Indica el nombre de tu comunidad y entra directo al <strong>Cargador Masivo IA</strong>. Podrás arrastrar todos tus archivos juntos (<strong>cuadros de Excel, estados de cuenta en PDF/CSV, recibos anteriores y fotos de facturas</strong>) para que Sofía IA ordene todo y configure tu condominio e historial en segundos.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                🏘️ Nombre de tu Condominio o Comunidad *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Conjunto Residencial Los Naranjos"
                value={condoName}
                onChange={e => setCondoName(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', background: '#1e293b', border: '1.5px solid #38bdf8', color: '#fff', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  👤 Tu Nombre (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ing. Roberto Méndez"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  📱 Tu WhatsApp (Opcional, para soporte)
                </label>
                <input
                  type="tel"
                  placeholder="Ej: 0414-1234567"
                  value={clientPhone}
                  onChange={e => setClientPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.95rem 1.4rem',
                fontSize: '0.96rem',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '12px',
                whiteSpace: 'normal',
                textAlign: 'center'
              }}
            >
              📂 Abrir el Programa GRATIS y Subir mis Archivos Ahora →
            </button>

            <a
              href={whatsappDirectUploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                fontSize: '0.86rem',
                fontWeight: '800',
                borderColor: 'rgba(37, 211, 102, 0.5)',
                color: '#6ee7b7',
                background: 'rgba(6, 13, 24, 0.65)',
                borderRadius: '12px',
                whiteSpace: 'normal',
                textAlign: 'center'
              }}
            >
              💬 O enviarles mis archivos por WhatsApp para que el equipo lo arme
            </a>
          </form>
        ) : (
          <>
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
                📲 Instalar mi Comunidad GRATIS Ahora
              </button>
            )}
          </div>
            </form>
          </>
        )}
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
