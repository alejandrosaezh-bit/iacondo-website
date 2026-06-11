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
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: 'white', textDecoration: 'none', fontWeight: '500', display: 'none' }} className="nav-link">Características</a>
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
          <img src="/hero-image.png" alt="IACondo Background" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
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
            <a href="mailto:contacto@iacondo.com" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Solicitar una Demo</a>
            <a href="#features" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Conoce Más</a>
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
      <section style={{ padding: '6rem 5%', textAlign: 'center', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>¿Listo para modernizar tu condominio?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
            Únete a la plataforma que está cambiando la forma en que los vecinos y administradores colaboran.
          </p>
          <a href="mailto:contacto@iacondo.com" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
            Contáctanos Hoy
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#030712', padding: '3rem 5%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--accent-primary)' }}>⌂</span>
          <span style={{ color: 'white' }}>IACONDO<span style={{ color: 'var(--accent-primary)' }}>.COM</span></span>
        </div>
        <p style={{ marginBottom: '1rem' }}>© {new Date().getFullYear()} IACondo.com. Todos los derechos reservados.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.9rem' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Términos de Servicio</a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacidad</a>
          <a href="mailto:soporte@iacondo.com" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Soporte</a>
        </div>
      </footer>
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

export default App;
