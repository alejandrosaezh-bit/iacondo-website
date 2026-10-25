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
      <nav style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, 
        padding: '1.2rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: scrolled ? 'rgba(6, 13, 24, 0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-light)' : '1px solid transparent',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-primary)' }}>⌂</span>
          <span>IACONDO<span style={{ color: 'var(--accent-primary)' }}>.COM</span></span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="#features" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', display: 'none' }} className="nav-link">Características</a>
          <a href="#contacto" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>🎮 Probar Demo</a>
          <a href="https://app.iacondo.com" className="btn btn-secondary" style={{ padding: '0.5rem 1.2rem' }}>Iniciar Sesión</a>
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

        <div style={{ maxWidth: '800px', textAlign: 'center', zIndex: 1 }} className="fade-in-up">
          <span style={{ display: 'inline-block', padding: '0.4rem 1rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--accent-primary)', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
            ✨ La Nueva Era en Gestión Inmobiliaria
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '800', marginBottom: '1.5rem' }}>
            Tu Condominio, <br />
            <span className="text-gradient">Gestionado de Forma Inteligente.</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.8' }}>
            La plataforma definitiva para la administración transparente. Automatiza cobros, concilia pagos bancarios y mantén a toda tu comunidad conectada e informada.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#contacto" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>🎮 Crear Mi Demo Personalizado</a>
            <a href="https://iacondo.com/demo" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>👀 Ver Demo General</a>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '6rem 5%', background: 'var(--bg-main)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="fade-in-up delay-1">
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Todo lo que tu edificio necesita</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '1rem auto 0 auto' }}>
              Herramientas diseñadas para ahorrar horas de trabajo administrativo y brindar total claridad financiera a los vecinos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
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
      <section style={{ padding: '6rem 5%', background: 'linear-gradient(to bottom, var(--bg-main), #0a1120)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem' }}>
          
          <div className="glass-panel fade-in-up delay-2">
            <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>🛡️</span> Para Administradores
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <BenefitItem text="Ahorra hasta un 80% del tiempo en conciliaciones." />
              <BenefitItem text="Historial contable inmutable y seguro." />
              <BenefitItem text="Directorio centralizado de propietarios e inquilinos." />
              <BenefitItem text="Multimoneda: control en Dólares y moneda local." />
            </ul>
          </div>

          <div className="glass-panel fade-in-up delay-3">
            <h3 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ color: 'var(--accent-primary)' }}>👥</span> Para Propietarios
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <BenefitItem text="Reporta tus pagos en segundos desde el celular." />
              <BenefitItem text="Conoce exactamente en qué se invierte tu dinero." />
              <BenefitItem text="Accede a tus recibos históricos en cualquier momento." />
              <BenefitItem text="Participa activamente en las decisiones del edificio." />
            </ul>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section id="contacto" style={{ padding: '6rem 5%', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxInlineSize: '640px', marginInline: 'auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ display: 'inline-block', padding: '0.35rem 0.9rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', borderRadius: '999px', fontWeight: '800', fontSize: '0.82rem', marginBottom: '0.85rem', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
              🎮 VISIÓN JUNTA + VISIÓN VECINO EN TIEMPO REAL
            </span>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '0.85rem' }}>Crea tu Demo Personalizada</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Indícanos el nombre de tu condominio y cuántas viviendas tiene. Generaremos al instante un entorno de demostración con tus datos para que explores tanto la <strong>Visión de la Administración</strong> como la <strong>Visión del Vecino</strong>.
            </p>
          </div>
          <ContactForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#030712', padding: '3rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--accent-primary)' }}>⌂</span>
          <span style={{ color: 'white' }}>IACONDO<span style={{ color: 'var(--accent-primary)' }}>.COM</span></span>
        </div>
        <p style={{ marginBottom: '1rem' }}>© {new Date().getFullYear()} IACondo.com. Todos los derechos reservados.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.9rem', flexWrap: 'wrap' }}>
          <a href="mailto:hola@iacondo.com" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>📧 hola@iacondo.com</a>
          <a href="mailto:soporte@iacondo.com" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>🛠️ soporte@iacondo.com</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Términos de Servicio</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacidad</a>
        </div>
      </footer>

      <SofiaChatWidget />
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
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
      <span style={{ color: 'var(--success)', color: '#10b981', marginTop: '2px' }}>✓</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>{text}</span>
    </li>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    condominium: '',
    units: '24',
    unitType: 'Casa',
    hasAccessControl: true,
    message: ''
  });
  const [submittedData, setSubmittedData] = useState(null);
  const [status, setStatus] = useState('idle');

  const buildPersonalizedDemoUrl = (data, view = 'owner') => {
    const d = data || formData;
    const params = new URLSearchParams();
    params.set('condo', (d.condominium || 'Residencias El Mirador').trim());
    params.set('units', String(parseInt(d.units, 10) || 24));
    params.set('type', d.unitType === 'Apto' ? 'Apto' : 'Casa');
    params.set('access', d.hasAccessControl === false ? 'no' : 'si');
    if (d.name && d.name.trim()) params.set('client', d.name.trim());
    params.set('view', view);
    return `https://app.iacondo.com/demo?${params.toString()}`;
  };

  const getWhatsAppLink = (data) => {
    const d = data || formData;
    const unitLabel = d.unitType === 'Apto' ? 'apartamentos' : 'casas/viviendas';
    const accessLabel = d.hasAccessControl === false ? 'sin control de acceso' : 'con control de acceso';
    const demoUrl = buildPersonalizedDemoUrl(d, 'admin');
    const text =
      `Hola, mi nombre es *${d.name || ''}* del condominio *${d.condominium || 'Por confirmar'}* (${d.units || '24'} ${unitLabel}, ${accessLabel}).\n` +
      `Correo: ${d.email || ''}${d.phone ? `\nTeléfono: ${d.phone}` : ''}\n` +
      `Demo generada: ${demoUrl}\n\n` +
      `*Mensaje:* ${d.message || 'Quiero conocer más de IACondo y probar la demo personalizada.'}`;
    return `https://wa.me/584222537239?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    const cleanUnits = Math.min(Math.max(parseInt(formData.units, 10) || 24, 2), 300);
    const payload = {
      ...formData,
      units: String(cleanUnits),
      demoUrl: buildPersonalizedDemoUrl({ ...formData, units: String(cleanUnits) }, 'admin'),
      message: (formData.message || '').trim() || `Solicitud de Demo Personalizada para ${formData.condominium || 'nuestro condominio'} (${cleanUnits} ${formData.unitType === 'Apto' ? 'apartamentos' : 'casas'}).`
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
      } else {
        const fallbackRes = await fetch('https://condopro-api.onrender.com/api/public/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (fallbackRes.ok) {
          setStatus('success');
        } else {
          // Aun si el correo tarda, permitimos abrir su Demo personalizada de inmediato
          setStatus('success');
        }
      }
    } catch (error) {
      console.error('Error enviando formulario:', error);
      // Permitir abrir la Demo personalizada aunque haya intermitencia de red
      setStatus('success');
    }
  };

  if (status === 'success') {
    const activeData = submittedData || formData;
    const adminDemoUrl = buildPersonalizedDemoUrl(activeData, 'admin');
    const ownerDemoUrl = buildPersonalizedDemoUrl(activeData, 'owner');
    const unitLabel = activeData.unitType === 'Apto' ? 'Apartamentos' : 'Casas';

    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '2.5rem 1.75rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.6rem', color: 'white' }}>
          ¡Demo Personalizada Lista para {activeData.condominium || 'tu Condominio'}!
        </h3>
        <p style={{ color: 'var(--text-secondary)', maxInlineSize: '520px', margin: '0 auto 1.25rem auto', lineHeight: 1.55, fontSize: '0.96rem' }}>
          Hemos configurado un entorno interactivo exclusivo con <strong>{activeData.units || 24} {unitLabel}</strong> y alícuotas calculadas automáticamente. Dentro de la Demo podrás cambiar en cualquier momento entre la <strong>Visión de Administración (Junta)</strong> y la <strong>Visión del Vecino</strong>.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          <a
            href={adminDemoUrl}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              color: 'white',
              textDecoration: 'none',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 8px 20px rgba(14, 165, 233, 0.35)'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>📊</span>
            <span>Abrir Visión Administración</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600' }}>Junta, Contabilidad y Morosidad</span>
          </a>

          <a
            href={ownerDemoUrl}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              textDecoration: 'none',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.3rem',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span style={{ fontSize: '1.4rem' }}>🏡</span>
            <span>Abrir Visión Vecino</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600' }}>Recibos, Pagos, Portón y Pases QR</span>
          </a>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <a 
            href={getWhatsAppLink(activeData)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ 
              background: 'rgba(37, 211, 102, 0.16)', 
              border: '1px solid rgba(37, 211, 102, 0.45)', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.75rem 1.4rem',
              color: '#34d399',
              textDecoration: 'none',
              fontWeight: 'bold',
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}
          >
            <span>💬</span> ¿Deseas asesoría en vivo por WhatsApp? Escríbenos
          </a>
          <button 
            type="button"
            onClick={() => {
              setStatus('idle');
            }} 
            className="btn btn-secondary" 
            style={{ marginTop: '0.25rem', fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            Modificar datos del condominio
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="contact-condominium" style={{ display: 'block', marginBottom: '0.45rem', color: 'white', fontWeight: '700', fontSize: '0.92rem' }}>
            🏢 Nombre del Condominio o Conjunto *
          </label>
          <input 
            id="contact-condominium"
            name="condominium"
            type="text"
            autoComplete="organization"
            required
            placeholder="Ej: Conjunto Residencial Los Naranjos"
            value={formData.condominium}
            onChange={e => setFormData({...formData, condominium: e.target.value})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-light)', color: 'white', fontSize: '0.95rem' }} 
          />
        </div>

        <div>
          <label htmlFor="contact-units" style={{ display: 'block', marginBottom: '0.45rem', color: 'white', fontWeight: '700', fontSize: '0.92rem' }}>
            🔢 Cantidad de Viviendas / Inmuebles *
          </label>
          <input 
            id="contact-units"
            name="units"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            placeholder="Ej: 24"
            value={formData.units}
            onChange={e => setFormData({...formData, units: e.target.value.replace(/\D/g, '').slice(0, 3)})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-light)', color: 'white', fontSize: '1rem', fontWeight: '800' }} 
          />
        </div>
      </div>

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ display: 'block', marginBottom: '0.45rem', color: 'white', fontWeight: '700', fontSize: '0.92rem', padding: 0 }}>
          🏘️ Tipo de Inmuebles en tu Conjunto *
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label
            htmlFor="contact-type-casa"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: formData.unitType === 'Casa' ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
              background: formData.unitType === 'Casa' ? 'rgba(14, 165, 233, 0.16)' : 'rgba(255,255,255,0.04)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <input
              id="contact-type-casa"
              type="radio"
              name="unitType"
              value="Casa"
              checked={formData.unitType === 'Casa'}
              onChange={() => setFormData({ ...formData, unitType: 'Casa' })}
            />
            <span>🏡 Casas / Townhouses</span>
          </label>
          <label
            htmlFor="contact-type-apto"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: formData.unitType === 'Apto' ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
              background: formData.unitType === 'Apto' ? 'rgba(14, 165, 233, 0.16)' : 'rgba(255,255,255,0.04)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <input
              id="contact-type-apto"
              type="radio"
              name="unitType"
              value="Apto"
              checked={formData.unitType === 'Apto'}
              onChange={() => setFormData({ ...formData, unitType: 'Apto' })}
            />
            <span>🏢 Apartamentos</span>
          </label>
        </div>
      </fieldset>

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ display: 'block', marginBottom: '0.45rem', color: 'white', fontWeight: '700', fontSize: '0.92rem', padding: 0 }}>
          🚪 ¿Tu Condominio cuenta con Control de Acceso (Portón / Garita)? *
        </legend>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label
            htmlFor="contact-access-yes"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: formData.hasAccessControl !== false ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
              background: formData.hasAccessControl !== false ? 'rgba(14, 165, 233, 0.16)' : 'rgba(255,255,255,0.04)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <input
              id="contact-access-yes"
              type="radio"
              name="hasAccessControl"
              checked={formData.hasAccessControl !== false}
              onChange={() => setFormData({ ...formData, hasAccessControl: true })}
            />
            <span>✅ Sí tiene (Portón / Garita)</span>
          </label>
          <label
            htmlFor="contact-access-no"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: formData.hasAccessControl === false ? '2px solid var(--accent-primary)' : '1px solid var(--border-light)',
              background: formData.hasAccessControl === false ? 'rgba(14, 165, 233, 0.16)' : 'rgba(255,255,255,0.04)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <input
              id="contact-access-no"
              type="radio"
              name="hasAccessControl"
              checked={formData.hasAccessControl === false}
              onChange={() => setFormData({ ...formData, hasAccessControl: false })}
            />
            <span>❌ No tiene control de acceso</span>
          </label>
        </div>
      </fieldset>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="contact-name" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tu Nombre Completo *</label>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div>
          <label htmlFor="contact-phone" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Teléfono / WhatsApp (Opcional)</label>
          <input 
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Ej: 0414-1234567"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontSize: '0.95rem' }} 
          />
        </div>
        <div>
          <label htmlFor="contact-message" style={{ display: 'block', marginBottom: '0.45rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comentario Adicional (Opcional)</label>
          <input 
            id="contact-message"
            name="message"
            type="text"
            placeholder="Ej: Queremos automatizar cobros y portón"
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            style={{ inlineSize: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', color: 'white', fontSize: '0.95rem' }} 
          />
        </div>
      </div>

      <button type="submit" disabled={status === 'loading'} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.08rem', marginTop: '0.5rem', fontWeight: '800' }}>
        {status === 'loading' ? 'Generando tu Demo Personalizada...' : '🚀 Generar y Abrir mi Demo Personalizada'}
      </button>

      <div style={{ textAlign: 'center', marginTop: '0.35rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a
          href="https://iacondo.com/demo"
          style={{
            display: 'inline-block',
            color: '#94a3b8',
            fontSize: '0.88rem',
            fontWeight: '600',
            textDecoration: 'none',
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
        >
          👀 ¿Prefieres no ingresar datos? Ver Demo General de IA Condo →
        </a>
      </div>
    </form>
  );
}

const INITIAL_SOFIA_GREETING = {
  role: 'assistant',
  text: '¡Hola! 👋 Soy Sofía, del equipo de IA Condo. ¿Deseas información para el condominio o conjunto donde vives, o buscas soporte técnico?'
};

function SofiaChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    try {
      const existing = localStorage.getItem('iacondo_web_session_id');
      if (existing) return existing;
      const created = `web_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('iacondo_web_session_id', created);
      return created;
    } catch {
      return `web_${Date.now()}`;
    }
  });
  const [senderName, setSenderName] = useState(() => {
    try { return localStorage.getItem('iacondo_web_sender_name') || ''; } catch { return ''; }
  });
  const [senderPhone, setSenderPhone] = useState(() => {
    try { return localStorage.getItem('iacondo_web_sender_phone') || ''; } catch { return ''; }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('iacondo_web_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_SOFIA_GREETING];
  });

  useEffect(() => {
    try {
      localStorage.setItem('iacondo_web_messages', JSON.stringify(messages));
    } catch {}
    const box = document.getElementById('sofia-web-chat-messages');
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages, open, loading]);

  const handleResetChat = async () => {
    const newId = `web_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setSessionId(newId);
    setMessages([INITIAL_SOFIA_GREETING]);
    try {
      localStorage.setItem('iacondo_web_session_id', newId);
      localStorage.setItem('iacondo_web_messages', JSON.stringify([INITIAL_SOFIA_GREETING]));
      await fetch('https://condopro-api.onrender.com/api/sofia-whatsapp/web-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, reset: true })
      });
    } catch {}
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      if (senderName.trim()) localStorage.setItem('iacondo_web_sender_name', senderName.trim());
      if (senderPhone.trim()) localStorage.setItem('iacondo_web_sender_phone', senderPhone.trim());
    } catch {}

    try {
      const res = await fetch('https://condopro-api.onrender.com/api/sofia-whatsapp/web-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          senderName: senderName.trim() || 'Visitante Web',
          senderPhone: senderPhone.trim() || '',
          text: userMsg
        })
      });
      const data = await res.json();
      if (data && data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
        if (data.profile?.name && !senderName) {
          setSenderName(data.profile.name);
        }
        if (data.profile?.phone && !senderPhone) {
          setSenderPhone(data.profile.phone);
        }
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', text: 'Te leo perfecto. ¿Me comentas en qué ciudad está tu condominio o cuál es tu consulta?' }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Estamos conectando con el servidor en este segundo. También puedes escribirme directo al WhatsApp +58 422-2537239.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '22px', right: '22px', zIndex: 9999, fontFamily: 'system-ui, sans-serif' }}>
      {open ? (
        <div style={{
          width: '365px',
          maxWidth: 'calc(100vw - 32px)',
          background: '#0f172a',
          border: '1px solid rgba(14, 165, 233, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <div style={{ fontWeight: '700', color: 'white', fontSize: '0.98rem' }}>🤖 Sofía — IA Condo</div>
              <div style={{ fontSize: '0.74rem', color: '#bae6fd' }}>🟢 En línea (Gemini Flash · Memoria activa)</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleResetChat}
                title="Reiniciar conversación"
                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', color: '#e0f2fe', fontSize: '0.72rem', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
              >
                🔄 Nuevo
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>

          <div style={{ padding: '8px 12px', background: '#1e293b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <input
              placeholder="Tu nombre (opcional)"
              value={senderName}
              onChange={e => setSenderName(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '0.78rem' }}
            />
            <input
              placeholder="Tu WhatsApp (opcional)"
              value={senderPhone}
              onChange={e => setSenderPhone(e.target.value)}
              style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '0.78rem' }}
            />
          </div>

          <div
            id="sofia-web-chat-messages"
            style={{
              padding: '12px',
              height: '280px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: '#090f1d'
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? '#0284c7' : '#1e293b',
                  color: 'white',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  maxWidth: '85%',
                  fontSize: '0.86rem',
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.8rem' }}>
                Sofía está escribiendo...
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '10px', background: '#0f172a', borderTop: '1px solid #1e293b', gap: '6px' }}>
            <input
              placeholder="Escribe tu mensaje aquí..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: 'white', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', fontWeight: '700', cursor: 'pointer' }}
            >
              ➤
            </button>
          </form>

          <div style={{ padding: '6px 12px 10px', background: '#0f172a', textAlign: 'center' }}>
            <a
              href="https://wa.me/584222537239?text=Hola%20Sof%C3%ADa%2C%20vengo%20de%20iacondo.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#34d399', fontSize: '0.78rem', textDecoration: 'none', fontWeight: '600' }}
            >
              💬 Pasar este chat a WhatsApp (+58 422-2537239) ➜
            </a>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            padding: '13px 20px',
            fontWeight: '700',
            fontSize: '0.95rem',
            boxShadow: '0 8px 25px rgba(14, 165, 233, 0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🤖</span> Hablar con Sofía IA
        </button>
      )}
    </div>
  );
}

export default App;
