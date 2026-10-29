import React, { useEffect, useState } from 'react';
import './index.css';

function App() {
  const [scrolled, setScrolled] = useState(false);

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
          <a href="#features" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', display: 'none' }} className="nav-link">Características</a>
          <a href="#contacto" className="btn btn-primary site-nav-btn">Solicitar Demo</a>
          <a href="https://app.iacondo.com" className="btn btn-secondary site-nav-btn">Iniciar Sesión</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{ 
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8rem 5% 4rem 5%', overflow: 'hidden'
      }}>
        {/* Background Image & Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -2 }}>
          <img src="/hero-bg-notext.png" alt="IACondo Background" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(6,13,24,0.4) 0%, rgba(6,13,24,0.9) 100%)', zIndex: -1 }}></div>

        <div style={{ maxWidth: '800px', width: '100%', minWidth: 0, textAlign: 'center', zIndex: 1 }} className="fade-in-up">
          <span style={{ display: 'inline-block', padding: '0.4rem 0.9rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-primary)', borderRadius: '20px', fontWeight: 'bold', fontSize: 'clamp(0.75rem, 0.7rem + 0.3vw, 0.85rem)', marginBottom: '1.25rem', border: '1px solid rgba(14, 165, 233, 0.3)', maxWidth: '100%' }}>
            ✨ La Nueva Era en Gestión Inmobiliaria
          </span>
          <h1 style={{ fontSize: 'clamp(1.75rem, 1.2rem + 3.8vw, 4.2rem)', fontWeight: '800', marginBottom: '1.25rem', wordBreak: 'break-word' }}>
            Tu Condominio, <br />
            <span className="text-gradient">Gestionado de Forma Inteligente.</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem, 0.88rem + 0.5vw, 1.2rem)', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: '1.7' }}>
            La plataforma definitiva para la administración transparente. Automatiza cobros, concilia pagos bancarios y mantén a toda tu comunidad conectada e informada.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
            <a href="#contacto" className="btn btn-primary" style={{ padding: 'clamp(0.8rem, 2.5vw, 1rem) clamp(1.2rem, 4vw, 2.2rem)', fontSize: 'clamp(0.92rem, 0.85rem + 0.45vw, 1.1rem)', fontWeight: '700', whiteSpace: 'normal', textAlign: 'center', maxWidth: '100%' }}>Solicitar Información / Demo</a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 5%', background: 'var(--bg-main)', width: '100%', overflowX: 'clip' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)' }} className="fade-in-up delay-1">
            <h2 style={{ fontSize: 'clamp(1.55rem, 1.2rem + 2vw, 2.5rem)', fontWeight: '700' }}>Todo lo que tu edificio necesita</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.95rem, 0.9rem + 0.35vw, 1.1rem)', maxWidth: '600px', margin: '0.85rem auto 0 auto' }}>
              Herramientas diseñadas para ahorrar horas de trabajo administrativo y brindar total claridad financiera a los vecinos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 'clamp(1.1rem, 3vw, 2rem)', width: '100%' }}>
            <FeatureCard 
              icon="🏦" 
              title="Conciliación Automática" 
              desc="Olvídate de revisar transferencias a mano. El sistema cruza automáticamente los reportes de los vecinos con tu estado de cuenta."
            />
            <FeatureCard 
              icon="🧾" 
              title="Recibos Digitales" 
              desc="Emisión instantánea de recibos de condominio detallados, enviados directamente al portal de cada propietario."
            />
            <FeatureCard 
              icon="📊" 
              title="Transparencia Total" 
              desc="Libro mayor unificado en tiempo real donde los propietarios pueden ver los ingresos y gastos del condominio con total claridad."
            />
            <FeatureCard 
              icon="🗳️" 
              title="Votaciones y Reportes" 
              desc="Realiza encuestas, votaciones para presupuestos, y recibe reportes de averías directamente desde la plataforma."
            />
          </div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 5%', background: 'linear-gradient(to bottom, var(--bg-main), #0a1120)', width: '100%', overflowX: 'clip' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 'clamp(1.25rem, 4vw, 3rem)' }}>
          
          <div className="glass-panel fade-in-up delay-2">
            <h3 style={{ fontSize: 'clamp(1.25rem, 1.05rem + 1vw, 1.75rem)', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent-primary)' }}>🛡️</span> Para Administradores
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <BenefitItem text="Ahorra hasta un 80% del tiempo en conciliaciones." />
              <BenefitItem text="Historial contable inmutable y seguro." />
              <BenefitItem text="Directorio centralizado de propietarios e inquilinos." />
              <BenefitItem text="Multimoneda: control en Dólares y moneda local." />
            </ul>
          </div>

          <div className="glass-panel fade-in-up delay-3">
            <h3 style={{ fontSize: 'clamp(1.25rem, 1.05rem + 1vw, 1.75rem)', color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--accent-primary)' }}>👥</span> Para Propietarios
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <BenefitItem text="Reporta tus pagos en segundos desde el celular." />
              <BenefitItem text="Conoce exactamente en qué se invierte tu dinero." />
              <BenefitItem text="Accede a tus recibos históricos en cualquier momento." />
              <BenefitItem text="Participa activamente en las decisiones del edificio." />
            </ul>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contacto" style={{ padding: 'clamp(3.5rem, 8vw, 6rem) 5%', borderTop: '1px solid var(--border-light)', width: '100%', overflowX: 'clip' }}>
        <div style={{ maxInlineSize: '600px', inlineSize: '100%', marginInline: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.55rem, 1.2rem + 2vw, 2.4rem)', marginBottom: '0.75rem' }}>Solicita tu Demostración</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.92rem, 0.86rem + 0.35vw, 1.05rem)', lineHeight: 1.6 }}>
              Déjanos tus datos de contacto y <strong>Sofía IA</strong> te atenderá de inmediato por correo o WhatsApp para configurar una demostración personalizada a la medida de tu condominio.
            </p>
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
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Términos de Servicio</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacidad</a>
        </div>
      </footer>

      <WhatsAppFloatingButton />
    </div>
  );
}

// Subcomponents
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-panel">
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  );
}

function BenefitItem({ text }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', minWidth: 0 }}>
      <span style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }}>✓</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 0.85rem + 0.3vw, 1.05rem)', minWidth: 0 }}>{text}</span>
    </li>
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
      `Hola Sofía, mi nombre es *${d.name || ''}*${d.condominium ? ` del condominio *${d.condominium}*` : ''}.\n` +
      `Vengo de la página web iacondo.com${d.message ? ` (${d.message})` : ''} y me gustaría conversar contigo sobre IA Condo.`;
    return `https://wa.me/584222537239?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const payload = {
      ...formData,
      message: (formData.message || '').trim() || `Solicitud de información y demostración para ${formData.condominium || 'mi condominio'}.`
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
          ¡Solicitud Recibida! Sofía ya te está atendiendo
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxInlineSize: '520px', margin: '0 auto 1.35rem auto', lineHeight: 1.6, fontSize: '0.96rem' }}>
          Hemos registrado tus datos de contacto y <strong>Sofía IA</strong> te ha enviado un correo a <strong>{activeData.email}</strong> para conocer los detalles de tu conjunto (nombre del condominio, cantidad de viviendas y si cuentan con portón/vigilancia) y generarte tu <strong>Demo Personalizada</strong> con Visión Administración y Visión Vecino.
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
            <span>💬</span> Continuar con Sofía por WhatsApp Ahora
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
          <label htmlFor="contact-condominium" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Nombre del Condominio (Opcional)</label>
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
          placeholder="Cuéntanos sobre tu condominio (cantidad aproximada de viviendas, si tienen portón eléctrico, etc.)..."
          value={formData.message}
          onChange={e => setFormData({...formData, message: e.target.value})}
          style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontFamily: 'inherit', fontSize: '0.95rem' }} 
        ></textarea>
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ padding: '0.95rem 1rem', fontSize: 'clamp(0.9rem, 0.84rem + 0.4vw, 1.05rem)', marginTop: '0.4rem', fontWeight: '800', whiteSpace: 'normal', textAlign: 'center', width: '100%' }}>
        {status === 'loading' ? 'Conectando con Sofía IA...' : 'Solicitar Atención y Demo con Sofía IA'}
      </button>
    </form>
  );
}

function WhatsAppFloatingButton() {
  const whatsappUrl =
    'https://wa.me/584222537239?text=' +
    encodeURIComponent(
      'Hola Sofía, vengo de la página web iacondo.com y me gustaría conocer más sobre IA Condo.'
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
      <span>WhatsApp</span>
    </a>
  );
}

export default App;
