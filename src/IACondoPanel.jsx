import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://condopro-api.onrender.com';

const ROLE_LABELS = {
  admin: { label: 'Dirección / Super Admin', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  ventas: { label: 'Agente de Ventas', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  soporte: { label: 'Departamento Técnico', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  administracion: { label: 'Administración', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' }
};

const CALL_STATUS_LABELS = {
  pendiente: { label: '1. Nuevo / Contacto Inicial', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  nuevo: { label: '1. Nuevo / Contacto Inicial', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  contactado: { label: '2. Contacto / Visita o Demo', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  visita_demo: { label: '2. Contacto / Visita o Demo', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  demo_realizada: { label: '3. Cotización / Propuesta (% o Fijo)', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  cotizacion: { label: '3. Cotización / Propuesta (% o Fijo)', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  en_espera: { label: '4. En Espera (Asamblea / Junta)', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  implementacion: { label: '5. En Implementación (Onboarding)', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
  afiliado: { label: '6. Ganado (Condominio Activo)', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  ganado: { label: '6. Ganado (Condominio Activo)', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  descartado: { label: '7. Perdido / Descartado', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  perdido: { label: '7. Perdido / Descartado', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  diagnostico: { label: '2. En Diagnóstico Técnico', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  en_revision: { label: '3. En Solución / Ajuste', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  validacion: { label: '4. Validación con Condominio', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
  resuelto: { label: '5. Resuelto / Cerrado', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' }
};

export default function IACondoPanel() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('iacondo_panel_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login State
  const [loginEmail, setLoginEmail] = useState('alejandrosaezh@iacondo.com');
  const [loginPassword, setLoginPassword] = useState('IACondo2026!');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Dashboard Data State
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hostname.toLowerCase().startsWith('soporte.')) {
      return 'soporte';
    }
    return 'agenda';
  });
  const [loading, setLoading] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [waStatus, setWaStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [calls, setCalls] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [aiAgents, setAiAgents] = useState([]);

  // Playbook Form State
  const [playbookForm, setPlaybookForm] = useState({
    agentName: 'Sofía',
    companyName: 'IA Condo',
    humanAgentCalendarEmail: 'solucionescreapptivas@gmail.com, alejandrosaezh@iacondo.com',
    humanAgentWhatsapp: '+34651626150',
    customInstructions: ''
  });

  // User Form State
  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'ventas',
    whatsappPhone: '',
    calendarEmail: '',
    active: true
  });

  // New/Edit AI Agent Form State
  const [agentForm, setAgentForm] = useState({
    id: '',
    name: '',
    role: '',
    channels: 'WhatsApp 0422-2537239, Correo',
    description: '',
    active: true
  });

  // Selected Session in Live Chat Tab
  const [selectedSession, setSelectedSession] = useState(null);
  const [callFilter, setCallFilter] = useState('todos');
  const [callNotesDraft, setCallNotesDraft] = useState({});

  const showToast = (msg) => {
    setSyncMessage(msg);
    setTimeout(() => setSyncMessage(''), 4000);
  };

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/api/iacondo-panel/dashboard`),
        fetch(`${API_BASE}/api/sofia-whatsapp/status`)
      ]);
      const dashData = await dashRes.json();
      const statusData = await statusRes.json();

      if (dashData.ok) {
        setUsers(dashData.users || []);
        setCalls(dashData.calls || []);
        setSessions(dashData.sessions || []);
        setAiAgents(dashData.aiAgents || []);
        if (dashData.playbook) {
          setPlaybookForm({
            agentName: dashData.playbook.agentName || 'Sofía',
            companyName: 'IA Condo',
            humanAgentCalendarEmail: dashData.playbook.humanAgentCalendarEmail || 'solucionescreapptivas@gmail.com, alejandrosaezh@iacondo.com',
            humanAgentWhatsapp: dashData.playbook.humanAgentWhatsapp || '+34651626150',
            customInstructions: dashData.playbook.customInstructions || ''
          });
        }
      }
      if (statusData) {
        setWaStatus(statusData);
      }
    } catch (e) {
      console.error('Error cargando panel IA Condo:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchDashboard();
      const interval = setInterval(fetchDashboard, 25000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchDashboard]);

  const handleLogin = async (e, quickEmail, quickPass) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const emailToUse = quickEmail || loginEmail;
    const passToUse = quickPass || loginPassword;
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse, password: passToUse })
      });
      const data = await res.json();
      if (data.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('iacondo_panel_user', JSON.stringify(data.user));
        if (data.user.role === 'soporte') {
          setActiveTab('soporte');
        } else {
          setActiveTab('agenda');
        }
      } else {
        setLoginError(data.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    } catch {
      setLoginError('Conectando con el servidor de IA Condo... Intenta de nuevo en unos segundos.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('iacondo_panel_user');
    setCurrentUser(null);
  };

  const handleUpdateCall = async (callId, updates) => {
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: callId, ...updates })
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✅ Registro actualizado y sincronizado en la agenda de IA Condo');
        fetchDashboard();
      }
    } catch {
      showToast('⚠️ Error al actualizar el registro');
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✅ Usuario y rol guardados correctamente en IA Condo');
        setUserForm({
          id: '',
          name: '',
          email: '',
          password: '',
          role: 'ventas',
          whatsappPhone: '',
          calendarEmail: '',
          active: true
        });
        fetchDashboard();
      }
    } catch {
      showToast('⚠️ No se pudo guardar el usuario');
    }
  };

  const handleToggleUserDuty = async (u) => {
    try {
      await fetch(`${API_BASE}/api/iacondo-panel/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...u,
          id: u.id || u._id,
          active: u.active === false ? true : false
        })
      });
      showToast(`✅ Estado de guardia actualizado para ${u.name}`);
      fetchDashboard();
    } catch {
      showToast('⚠️ Error cambiando estado de guardia');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await fetch(`${API_BASE}/api/iacondo-panel/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
      showToast('🗑️ Usuario eliminado');
      fetchDashboard();
    } catch {
      showToast('⚠️ Error eliminando usuario');
    }
  };

  const handleSavePlaybook = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/sofia-whatsapp/playbook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playbookForm)
      });
      const data = await res.json();
      if (data.ok) {
        showToast('🧠 Entrenamiento de Sofía IA actualizado en vivo para WhatsApp 0422-2537239');
        fetchDashboard();
      }
    } catch {
      showToast('⚠️ Error guardando el entrenamiento de Sofía IA');
    }
  };

  const handleSaveAiAgent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/ai-agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentForm)
      });
      const data = await res.json();
      if (data.ok) {
        showToast('🤖 Agente de IA guardado en el catálogo de IA Condo');
        setAgentForm({
          id: '',
          name: '',
          role: '',
          channels: 'WhatsApp 0422-2537239, Correo',
          description: '',
          active: true
        });
        fetchDashboard();
      }
    } catch {
      showToast('⚠️ Error guardando el agente de IA');
    }
  };

  // Filtered lists
  const salesCalls = calls.filter(c => c.intent !== 'support');
  const supportTickets = calls.filter(c => c.intent === 'support');

  const filteredSalesCalls = salesCalls.filter(c => {
    if (callFilter === 'todos') return true;
    return (c.status || 'pendiente') === callFilter;
  });

  // ============================================================================
  // RENDER: LOGIN CORPORATIVO IA CONDO
  // ============================================================================
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #0f2942 0%, #060d18 65%)',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.75rem',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              marginBottom: '0.5rem'
            }}>
              <span style={{ color: '#0ea5e9' }}>⌂</span>
              <span>IACONDO<span style={{ color: '#0ea5e9' }}>.COM</span></span>
            </div>
            <div style={{
              display: 'inline-block',
              padding: '0.25rem 0.85rem',
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '600',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              PANEL CORPORATIVO DE OPERACIONES E IA
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              Gestión de Llamadas Agendadas, Ventas, Soporte Técnico, Roles y Entrenamiento de Sofía IA.
            </p>
          </div>

          <form onSubmit={handleLogin} method="POST" action="/api/iacondo-panel/login">
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                Credenciales de Acceso a IA Condo
              </legend>

              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Correo Corporativo o Usuario
                </label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    background: 'rgba(6, 13, 24, 0.8)',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                  Contraseña de Acceso
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    background: 'rgba(6, 13, 24, 0.8)',
                    color: '#fff',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {loginError && (
                <div role="alert" aria-live="polite" style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px',
                  color: '#fca5a5',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 10px 20px -5px rgba(14, 165, 233, 0.4)'
                }}
              >
                {loginLoading ? 'Verificando acceso...' : 'Ingresar al Panel IA Condo'}
              </button>
            </fieldset>
          </form>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.6rem', textAlign: 'center' }}>
              Acceso rápido por departamento (Cuentas iniciales):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleLogin(null, 'alejandrosaezh@iacondo.com', 'IACondo2026!')}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                👑 Dirección
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'ventas@iacondo.com', 'Ventas2026!')}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(74, 222, 128, 0.12)',
                  color: '#4ade80',
                  border: '1px solid rgba(74, 222, 128, 0.3)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                📈 Ventas
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'soporte@iacondo.com', 'Soporte2026!')}
                style={{
                  padding: '0.5rem',
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🛠️ Técnico
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
            <a href="https://www.iacondo.com" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none' }}>
              ← Volver a la web pública www.iacondo.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  const roleBadge = ROLE_LABELS[currentUser.role] || ROLE_LABELS.ventas;

  // ============================================================================
  // RENDER: PANEL PRINCIPAL IA CONDO (panel.iacondo.com)
  // ============================================================================
  return (
    <div style={{
      minHeight: '100vh',
      background: '#060d18',
      color: '#f8fafc',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      paddingBottom: '4rem'
    }}>
      {/* TOP HEADER */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#0ea5e9' }}>⌂</span>
            <span>PANEL<span style={{ color: '#0ea5e9' }}>.IACONDO.COM</span></span>
          </div>
          <span style={{
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: '700',
            background: waStatus?.whatsapp_status === 'connected' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: waStatus?.whatsapp_status === 'connected' ? '#4ade80' : '#f59e0b',
            border: '1px solid rgba(74, 222, 128, 0.3)'
          }}>
            {waStatus?.whatsapp_status === 'connected'
              ? '🟢 WhatsApp 0422-2537239 En Línea (Sofía IA Activa)'
              : '⏳ Sincronizando línea WhatsApp...'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={fetchDashboard}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳ Actualizando...' : '🔄 Sincronizar Ahora'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: 'rgba(30, 41, 59, 0.7)', padding: '0.4rem 0.85rem', borderRadius: '10px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.72rem', color: roleBadge.color, fontWeight: '600' }}>{roleBadge.label}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                marginLeft: '0.5rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* TOAST BANNER */}
      {syncMessage && (
        <div role="status" aria-live="polite" style={{
          background: 'linear-gradient(90deg, #0284c7, #2563eb)',
          color: '#fff',
          padding: '0.75rem 2rem',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '0.9rem'
        }}>
          {syncMessage}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '1.75rem 1.5rem' }}>
        {/* ECOSISTEMA DE SUBDOMINIOS IA CONDO */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          padding: '0.75rem 1.15rem',
          marginBottom: '1.25rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(148, 163, 184, 0.15)',
          borderRadius: '12px',
          fontSize: '0.78rem'
        }}>
          <span style={{ color: '#94a3b8', fontWeight: '600' }}>🌐 Ecosistema de Subdominios Oficiales IA Condo:</span>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <a href="https://www.iacondo.com" target="_blank" rel="noreferrer" style={{ color: '#cbd5e1', textDecoration: 'none' }}>🌍 www.iacondo.com</a>
            <a href="https://panel.iacondo.com" style={{ color: '#38bdf8', fontWeight: '700', textDecoration: 'none' }}>🖥️ panel.iacondo.com</a>
            <a href="https://agenda.iacondo.com" style={{ color: '#4ade80', textDecoration: 'none' }}>📅 agenda.iacondo.com</a>
            <a href="https://soporte.iacondo.com" style={{ color: '#f59e0b', textDecoration: 'none' }}>🛠️ soporte.iacondo.com</a>
            <a href="https://app.iacondo.com" target="_blank" rel="noreferrer" style={{ color: '#c084fc', textDecoration: 'none' }}>🏢 app.iacondo.com</a>
          </div>
        </div>

        {/* KPI SUMMARY BAR */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>📅 LLAMADAS Y DEMOS (VENTAS)</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8', marginTop: '0.25rem' }}>{salesCalls.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {salesCalls.filter(c => (c.status || 'pendiente') === 'pendiente').length} pendientes por contactar
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>🛠️ SOPORTE TÉCNICO</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b', marginTop: '0.25rem' }}>{supportTickets.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Tickets reportados por clientes
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>💬 CONVERSACIONES WHATSAPP</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#4ade80', marginTop: '0.25rem' }}>{sessions.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Atendidas en vivo por Sofía IA
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(192, 132, 252, 0.25)', borderRadius: '14px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>👥 EQUIPO EN GUARDIA</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#c084fc', marginTop: '0.25rem' }}>
              {users.filter(u => u.active !== false).length} / {users.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Recibiendo agendas .ics y alertas
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginBottom: '1.75rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          paddingBottom: '0.85rem'
        }}>
          {[
            { id: 'agenda', label: `📅 Agenda de Llamadas y Ventas (${salesCalls.length})` },
            { id: 'soporte', label: `🛠️ Departamento Técnico (${supportTickets.length})` },
            { id: 'chats', label: `💬 Chats WhatsApp en Vivo (${sessions.length})` },
            { id: 'usuarios', label: `👥 Usuarios, Roles y Guardias (${users.length})` },
            { id: 'ia', label: `🧠 Entrenamiento de Sofía IA y Agentes (${aiAgents.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.7rem 1.2rem',
                borderRadius: '10px',
                border: activeTab === tab.id ? '1px solid #0ea5e9' : '1px solid rgba(148, 163, 184, 0.2)',
                background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(37, 99, 235, 0.25))' : 'rgba(15, 23, 42, 0.7)',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                fontWeight: activeTab === tab.id ? '700' : '600',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================================================================
            TAB 1: AGENDA DE LLAMADAS Y DEMOS (VENTAS)
            =================================================================== */}
        {activeTab === 'agenda' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>
                  📅 Agenda de Llamadas Comerciales y Demos — IA Condo
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                  Cada llamada coordinada por Sofía IA envía invitación <code>.ics</code> con doble alarma (10 min y 2 min antes) y Ficha Ejecutiva al agente asignado.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'todos', label: 'Todas las Etapas' },
                  { id: 'pendiente', label: '1. Nuevo / Contacto Inicial' },
                  { id: 'visita_demo', label: '2. Contacto / Visita o Demo' },
                  { id: 'cotizacion', label: '3. Cotización (% o Fijo)' },
                  { id: 'en_espera', label: '4. En Espera (Asamblea)' },
                  { id: 'implementacion', label: '5. En Implementación' },
                  { id: 'ganado', label: '6. Ganado (Activo)' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCallFilter(f.id)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '8px',
                      border: callFilter === f.id ? '1px solid #38bdf8' : '1px solid rgba(148,163,184,0.2)',
                      background: callFilter === f.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: callFilter === f.id ? '#fff' : '#94a3b8',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredSalesCalls.length === 0 ? (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px dashed rgba(148, 163, 184, 0.3)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                No hay llamadas en este filtro todavía. Cuando un interesado coordine una llamada o demo por WhatsApp (<code>0422-2537239</code>), aparecerá aquí automáticamente con su Ficha Ejecutiva.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {filteredSalesCalls.map(call => {
                  const callId = call.id || call._id;
                  const clientName = call.clientName || call.contactName || 'Interesado';
                  const rawPhone = call.clientPhone || call.phone || '';
                  const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
                  const timeLabel = call.callTimeLabel || call.callTimeDescription || 'Lo antes posible';
                  const summary = call.executiveSummary || call.executiveBriefing || 'Interesado en implementar IA Condo en su condominio.';
                  const units = call.units || call.unitsCount || 'Por confirmar';
                  const st = CALL_STATUS_LABELS[call.status || 'pendiente'] || CALL_STATUS_LABELS.pendiente;

                  return (
                    <div key={callId} style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      {/* Columna Izquierda: Datos del Cliente y Condominio */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.76rem', fontWeight: '700', background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '600' }}>
                            🕒 Hora Acordada: {timeLabel} {call.callTargetTimeCaracas ? `(${call.callTargetTimeCaracas})` : ''}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.35rem 0', color: '#fff' }}>
                          🏢 {call.condoName || 'Condominio por confirmar'} — {clientName}
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.75rem' }}>
                          <div>📍 <strong>Ubicación:</strong> {call.city || 'Por confirmar'}</div>
                          <div>🏘️ <strong>Unidades:</strong> {units}</div>
                          <div>📱 <strong>WhatsApp:</strong> +{cleanPhone}</div>
                          <div>✉️ <strong>Correo:</strong> {call.email || 'No indicado'}</div>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.9rem', background: 'rgba(6, 13, 24, 0.75)', borderRadius: '10px', borderLeft: '3px solid #0ea5e9' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.3rem' }}>
                            📋 FICHA EJECUTIVA DE SOFÍA IA PARA EL AGENTE:
                          </div>
                          <div style={{ fontSize: '0.86rem', color: '#e2e8f0', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                            {summary}
                          </div>
                        </div>
                      </div>

                      {/* Columna Derecha: Asignación de Responsable, Estado y Notas */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label htmlFor={`status-${callId}`} style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: '600' }}>
                              Estado de la Gestión
                            </label>
                            <select
                              id={`status-${callId}`}
                              name="status"
                              value={call.status || 'pendiente'}
                              onChange={e => handleUpdateCall(callId, { status: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '0.55rem',
                                borderRadius: '8px',
                                background: '#0f172a',
                                color: '#fff',
                                border: '1px solid rgba(148,163,184,0.3)',
                                fontSize: '0.83rem'
                              }}
                            >
                              <option value="pendiente">1. Nuevo / Contacto Inicial</option>
                              <option value="visita_demo">2. Contacto / Visita o Demo</option>
                              <option value="cotizacion">3. Cotización / Propuesta (% o Fijo)</option>
                              <option value="en_espera">4. En Espera (Asamblea / Junta)</option>
                              <option value="implementacion">5. En Implementación (Onboarding)</option>
                              <option value="ganado">6. Ganado (Condominio Activo)</option>
                              <option value="perdido">7. Perdido / Descartado</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`billing-${callId}`} style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: '600' }}>
                              Esquema de Facturación IA Condo
                            </label>
                            <select
                              id={`billing-${callId}`}
                              name="billingModel"
                              value={call.billingModel || 'porcentaje_movimientos'}
                              onChange={e => handleUpdateCall(callId, { billingModel: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '0.55rem',
                                borderRadius: '8px',
                                background: '#0f172a',
                                color: '#4ade80',
                                border: '1px solid rgba(74, 222, 128, 0.35)',
                                fontSize: '0.83rem',
                                fontWeight: '600'
                              }}
                            >
                              <option value="porcentaje_movimientos">📊 % sobre Ingresos/Gastos del Condominio</option>
                              <option value="fijo_mensual">💵 Importe Fijo Mensual ($ / Condominio)</option>
                              <option value="hibrido">⚖️ Híbrido (Base Fija + % Movimientos)</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`agent-${callId}`} style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: '600' }}>
                              Agente Responsable
                            </label>
                            <select
                              id={`agent-${callId}`}
                              name="assignedAgentEmail"
                              value={call.assignedAgentEmail || 'alejandrosaezh@iacondo.com'}
                              onChange={e => {
                                const found = users.find(u => u.email === e.target.value);
                                handleUpdateCall(callId, {
                                  assignedAgentId: found?.id || '',
                                  assignedAgentEmail: e.target.value,
                                  assignedAgentName: found ? found.name : e.target.value
                                });
                              }}
                              style={{
                                width: '100%',
                                padding: '0.55rem',
                                borderRadius: '8px',
                                background: '#0f172a',
                                color: '#fff',
                                border: '1px solid rgba(148,163,184,0.3)',
                                fontSize: '0.83rem'
                              }}
                            >
                              {users.map(u => (
                                <option key={u.id || u._id} value={u.email}>
                                  {u.name} ({ROLE_LABELS[u.role]?.label || u.role})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor={`notes-${callId}`} style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem', fontWeight: '600' }}>
                            Notas del Agente de Ventas / Acuerdos de la Llamada
                          </label>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                              id={`notes-${callId}`}
                              name="notes"
                              type="text"
                              placeholder="Escribe aquí el resultado de la llamada o próximos pasos..."
                              value={callNotesDraft[callId] !== undefined ? callNotesDraft[callId] : (call.notes || call.agentNotes || '')}
                              onChange={e => setCallNotesDraft({ ...callNotesDraft, [callId]: e.target.value })}
                              style={{
                                flex: 1,
                                padding: '0.55rem 0.75rem',
                                borderRadius: '8px',
                                background: '#060d18',
                                color: '#fff',
                                border: '1px solid rgba(148,163,184,0.3)',
                                fontSize: '0.83rem'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCall(callId, { notes: callNotesDraft[callId] || '' })}
                              style={{
                                padding: '0.55rem 0.9rem',
                                borderRadius: '8px',
                                background: '#0ea5e9',
                                color: '#fff',
                                border: 'none',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              Guardar
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${clientName}, te saluda ${currentUser.name} del equipo de IA Condo (iacondo.com) respecto a la llamada que coordinaste con Sofía para ${call.condoName || 'tu condominio'}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '0.6rem 1rem',
                              borderRadius: '8px',
                              background: 'rgba(34, 197, 94, 0.2)',
                              color: '#4ade80',
                              border: '1px solid rgba(34, 197, 94, 0.4)',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '0.83rem'
                            }}
                          >
                            💬 Contactar por WhatsApp (+{cleanPhone})
                          </a>
                          <a
                            href={`tel:+${cleanPhone}`}
                            style={{
                              padding: '0.6rem 1rem',
                              borderRadius: '8px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '0.83rem'
                            }}
                          >
                            📞 Llamar Ahora
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 2: DEPARTAMENTO TÉCNICO (SOPORTE)
            =================================================================== */}
        {activeTab === 'soporte' && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>
                🛠️ Departamento Técnico y Soporte — IA Condo
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                Incidencias técnicas y requerimientos de soporte diagnosticados por Sofía IA y asignados automáticamente al especialista técnico en guardia.
              </p>
            </div>

            {supportTickets.length === 0 ? (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                ✅ No hay tickets técnicos pendientes. Cuando un administrador o miembro de condominio reporte una incidencia técnica por WhatsApp, se asignará automáticamente aquí al Departamento Técnico.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {supportTickets.map(ticket => {
                  const ticketId = ticket.id || ticket._id;
                  const cleanPhone = String(ticket.clientPhone || ticket.phone || '').replace(/[^0-9]/g, '');
                  return (
                    <div key={ticketId} style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '16px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.76rem', fontWeight: '700', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                          🛠️ Ticket de Soporte Técnico
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                          Responsable Asignado: <strong style={{ color: '#fff' }}>{ticket.assignedAgentName || 'Departamento Técnico'}</strong>
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
                        {ticket.condoName || 'Condominio'} — {ticket.clientName || ticket.contactName || 'Usuario'} (+{cleanPhone})
                      </h3>

                      <div style={{ padding: '0.9rem', background: 'rgba(6, 13, 24, 0.75)', borderRadius: '10px', borderLeft: '3px solid #f59e0b', marginBottom: '1rem', fontSize: '0.86rem', whiteSpace: 'pre-line' }}>
                        {ticket.executiveSummary || ticket.executiveBriefing}
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          aria-label="Estado del Ticket"
                          value={ticket.status || 'pendiente'}
                          onChange={e => handleUpdateCall(ticketId, { status: e.target.value })}
                          style={{ padding: '0.55rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                        >
                          <option value="pendiente">1. Ticket / Reporte Recibido</option>
                          <option value="diagnostico">2. En Diagnóstico Técnico</option>
                          <option value="en_revision">3. En Solución / Ajuste</option>
                          <option value="validacion">4. Validación con Condominio</option>
                          <option value="resuelto">5. Resuelto / Cerrado</option>
                        </select>
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ padding: '0.55rem 1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', textDecoration: 'none', fontWeight: '700', fontSize: '0.83rem' }}
                        >
                          💬 Responder por WhatsApp
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 3: CHATS DE WHATSAPP EN VIVO
            =================================================================== */}
        {activeTab === 'chats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {/* Lista de Sesiones */}
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: '1.25rem', maxHeight: '72vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: 0, marginBottom: '1rem' }}>
                💬 Conversaciones en WhatsApp (0422-2537239)
              </h3>
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {sessions.map(s => {
                  const isSelected = selectedSession?._id === s._id;
                  const p = s.profile || {};
                  const lastHist = (s.history || []).slice(-1)[0];
                  return (
                    <button
                      key={s._id}
                      type="button"
                      onClick={() => setSelectedSession(s)}
                      style={{
                        textAlign: 'left',
                        padding: '0.9rem',
                        borderRadius: '12px',
                        border: isSelected ? '1px solid #0ea5e9' : '1px solid rgba(148, 163, 184, 0.15)',
                        background: isSelected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(6, 13, 24, 0.65)',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700' }}>
                        <span>{s.senderName || p.name || s.pushName || s.senderPhone || s._id}</span>
                        <span style={{ color: '#38bdf8', fontSize: '0.75rem' }}>{p.condoName || 'IA Condo Chat'}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                        📱 {s.senderPhone || s._id} {p.city ? `• 📍 ${p.city}` : ''} {p.units ? `• 🏘️ ${p.units} unid.` : ''}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lastHist?.text || ''}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visor de Conversación y Perfil Extraído */}
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: '1.25rem', maxHeight: '72vh', overflowY: 'auto' }}>
              {!selectedSession ? (
                <div style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem 1rem' }}>
                  Selecciona una conversación a la izquierda para ver los datos recabados por Sofía IA y el historial completo de mensajes.
                </div>
              ) : (
                <div>
                  <div style={{ borderBottom: '1px solid rgba(148,163,184,0.2)', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800' }}>
                      {selectedSession.senderName || selectedSession.profile?.name || selectedSession.senderPhone || selectedSession._id}
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.6rem' }}>
                      <div>🏢 <strong>Condominio:</strong> {selectedSession.profile?.condoName || 'Pendiente'}</div>
                      <div>📍 <strong>Ubicación:</strong> {selectedSession.profile?.city || 'Pendiente'}</div>
                      <div>🏘️ <strong>Unidades:</strong> {selectedSession.profile?.units || 'Pendiente'}</div>
                      <div>✉️ <strong>Correo:</strong> {selectedSession.profile?.email || 'Pendiente'}</div>
                      <div>🕒 <strong>Llamada:</strong> {selectedSession.scheduledCallInfo?.callTimeLabel || 'Pendiente'}</div>
                      <div>🎯 <strong>Área:</strong> {selectedSession.intent === 'support' ? 'Soporte Técnico' : 'Ventas / Información'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {(selectedSession.history || []).map((msg, idx) => (
                      <div key={idx} style={{
                        alignSelf: msg.role === 'assistant' ? 'flex-end' : 'flex-start',
                        background: msg.role === 'assistant' ? 'rgba(14, 165, 233, 0.18)' : 'rgba(30, 41, 59, 0.9)',
                        border: msg.role === 'assistant' ? '1px solid rgba(14, 165, 233, 0.35)' : '1px solid rgba(148, 163, 184, 0.2)',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        lineHeight: '1.45'
                      }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: msg.role === 'assistant' ? '#38bdf8' : '#94a3b8', marginBottom: '0.25rem' }}>
                          {msg.role === 'assistant' ? '🤖 Sofía IA (IA Condo)' : `👤 Cliente (${selectedSession.senderPhone || selectedSession._id})`}
                        </div>
                        <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: USUARIOS, ROLES Y GUARDIAS (EQUIPO IA CONDO)
            =================================================================== */}
        {activeTab === 'usuarios' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Listado de Usuarios y Guardias */}
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: 0 }}>
                👥 Equipo Registrado y Roles en IA Condo
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
                Activa o pausa el interruptor <strong>En Guardia</strong> de cada integrante para definir quién recibe automáticamente las llamadas agendadas por Sofía IA y las invitaciones <code>.ics</code> en su calendario.
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {users.map(u => {
                  const rb = ROLE_LABELS[u.role] || ROLE_LABELS.ventas;
                  const userId = u.id || u._id;
                  const isActive = u.active !== false;
                  return (
                    <div key={userId} style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '14px',
                      padding: '1.2rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ padding: '0.22rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', background: rb.bg, color: rb.color }}>
                            {u.roleLabel || rb.label}
                          </span>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: '800', margin: '0.4rem 0 0.2rem 0' }}>{u.name}</h3>
                          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>🔑 Login: <code>{u.email}</code></div>
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>📅 Correo Agenda (.ics): <code>{u.calendarEmail || u.email}</code></div>
                          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>📱 WhatsApp Alertas: <code>{u.whatsappPhone || u.phone || 'Por configurar'}</code></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleUserDuty(u)}
                            style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: '999px',
                              border: 'none',
                              background: isActive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                              color: isActive ? '#4ade80' : '#94a3b8',
                              fontWeight: '700',
                              fontSize: '0.76rem',
                              cursor: 'pointer'
                            }}
                          >
                            {isActive ? '🟢 En Guardia (Recibe Citas)' : '⏸️ Fuera de Guardia'}
                          </button>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => setUserForm({
                                id: userId,
                                name: u.name || '',
                                email: u.email || '',
                                password: '',
                                role: u.role || 'ventas',
                                whatsappPhone: u.whatsappPhone || u.phone || '',
                                calendarEmail: u.calendarEmail || u.email || '',
                                active: isActive
                              })}
                              style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              ✏️ Editar
                            </button>
                            {u.email !== 'alejandrosaezh@iacondo.com' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(userId)}
                                style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formulario para Registrar / Editar Integrante */}
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: 0 }}>
                {userForm.id ? '✏️ Editar Integrante del Equipo' : '➕ Registrar Nuevo Usuario / Responsable'}
              </h3>

              <form onSubmit={handleSaveUser} method="POST" action="/api/iacondo-panel/users">
                <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                  <legend style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                    Datos del integrante de IA Condo
                  </legend>

                  <div>
                    <label htmlFor="user-name" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Nombre y Apellido *
                    </label>
                    <input
                      id="user-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza"
                      value={userForm.name}
                      onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                    />
                  </div>

                  {/* Radio buttons for < 6 mutually exclusive options per modern-web-guidance forms */}
                  <div>
                    <span style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      Rol y Departamento en IA Condo *
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { value: 'ventas', label: '📈 Agente de Ventas' },
                        { value: 'soporte', label: '🛠️ Dpto. Técnico / Soporte' },
                        { value: 'administracion', label: '📊 Administración' },
                        { value: 'admin', label: '👑 Dirección / Super Admin' }
                      ].map(opt => (
                        <label key={opt.value} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.55rem 0.7rem',
                          borderRadius: '8px',
                          border: userForm.role === opt.value ? '1px solid #0ea5e9' : '1px solid rgba(148,163,184,0.2)',
                          background: userForm.role === opt.value ? 'rgba(14, 165, 233, 0.15)' : '#060d18',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="radio"
                            name="role"
                            value={opt.value}
                            checked={userForm.role === opt.value}
                            onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="user-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        Correo de Login *
                      </label>
                      <input
                        id="user-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="carlos@iacondo.com"
                        value={userForm.email}
                        onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="user-password" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        Contraseña de Acceso {userForm.id ? '(Opcional)' : '*'}
                      </label>
                      <input
                        id="user-password"
                        name="password"
                        type="text"
                        required={!userForm.id}
                        placeholder="Clave segura"
                        value={userForm.password}
                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="user-calendar" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        Correo de Agenda (.ics Calendar) *
                      </label>
                      <input
                        id="user-calendar"
                        name="calendarEmail"
                        type="email"
                        required
                        placeholder="Correo de su Google/Apple Calendar"
                        value={userForm.calendarEmail}
                        onChange={e => setUserForm({ ...userForm, calendarEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="user-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        WhatsApp Personal (Alertas) *
                      </label>
                      <input
                        id="user-phone"
                        name="whatsappPhone"
                        type="tel"
                        inputMode="tel"
                        required
                        placeholder="Ej. +584141234567"
                        value={userForm.whatsappPhone}
                        onChange={e => setUserForm({ ...userForm, whatsappPhone: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: '0.8rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                      color: '#fff',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    💾 Guardar Usuario y Activar Notificaciones de Agenda
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: ENTRENAMIENTO DE SOFÍA IA Y CATÁLOGO DE AGENTES
            =================================================================== */}
        {activeTab === 'ia' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Entrenamiento en Vivo de Sofía IA */}
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: 0 }}>
                🧠 Entrenamiento en Vivo de Sofía IA (WhatsApp 0422-2537239)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Todo cambio que guardes aquí actualiza de inmediato el razonamiento de Sofía IA en las conversaciones de WhatsApp de <strong>IA Condo</strong>.
              </p>

              <form onSubmit={handleSavePlaybook} method="POST" action="/api/sofia-whatsapp/playbook">
                <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                  <legend style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                    Parámetros de entrenamiento de Sofía IA
                  </legend>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="pb-name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        Nombre del Agente
                      </label>
                      <input
                        id="pb-name"
                        name="agentName"
                        type="text"
                        value={playbookForm.agentName}
                        onChange={e => setPlaybookForm({ ...playbookForm, agentName: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="pb-wa" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        WhatsApp Principal de Respaldo
                      </label>
                      <input
                        id="pb-wa"
                        name="humanAgentWhatsapp"
                        type="tel"
                        value={playbookForm.humanAgentWhatsapp}
                        onChange={e => setPlaybookForm({ ...playbookForm, humanAgentWhatsapp: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pb-cal" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Correos de Agenda Principal (.ics Copia Ejecutiva)
                    </label>
                    <input
                      id="pb-cal"
                      name="humanAgentCalendarEmail"
                      type="text"
                      value={playbookForm.humanAgentCalendarEmail}
                      onChange={e => setPlaybookForm({ ...playbookForm, humanAgentCalendarEmail: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="pb-instructions" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Directrices de Personalidad, Objetivos de Datos y Reglas de Negocio
                    </label>
                    <textarea
                      id="pb-instructions"
                      name="customInstructions"
                      rows={10}
                      value={playbookForm.customInstructions}
                      onChange={e => setPlaybookForm({ ...playbookForm, customInstructions: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.84rem', lineHeight: '1.5' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      padding: '0.8rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                      color: '#fff',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🚀 Aplicar Entrenamiento en Vivo a Sofía IA
                  </button>
                </fieldset>
              </form>
            </div>

            {/* Catálogo de Agentes IA de IA Condo */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: 0 }}>
                🤖 Catálogo de Agentes de IA — IA Condo
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Configura y entrena a los agentes especializados de IA Condo (Atención Comercial, Soporte Técnico Nivel 1, Cobranzas y Conciliación).
              </p>

              <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '1.5rem' }}>
                {aiAgents.map(ag => (
                  <div key={ag.id || ag._id} style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '12px', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>🤖 {ag.name}</strong>
                      <span style={{ fontSize: '0.74rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', fontWeight: '700' }}>
                        {ag.active !== false ? 'Activo' : 'En Pausa'} • {Array.isArray(ag.channels) ? ag.channels.join(', ') : (ag.channels || ag.channel || 'WhatsApp')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.25rem', fontWeight: '600' }}>{ag.role}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.35rem' }}>🎯 {ag.description || ag.Objective}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(192, 132, 252, 0.25)', borderRadius: '14px', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: 0 }}>➕ Crear Nuevo Agente de IA para IA Condo</h3>
                <form onSubmit={handleSaveAiAgent} method="POST" action="/api/iacondo-panel/ai-agents">
                  <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                    <legend style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                      Crear nuevo agente IA
                    </legend>
                    <div>
                      <label htmlFor="ag-name" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        Nombre del Agente IA *
                      </label>
                      <input
                        id="ag-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Ej. Elena IA — Conciliación de Pagos"
                        value={agentForm.name}
                        onChange={e => setAgentForm({ ...agentForm, name: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="ag-role" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        Especialidad / Departamento *
                      </label>
                      <input
                        id="ag-role"
                        name="role"
                        type="text"
                        required
                        placeholder="Ej. Administración y Cobranzas de Condominios"
                        value={agentForm.role}
                        onChange={e => setAgentForm({ ...agentForm, role: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="ag-obj" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                        Objetivo Específico e Instrucciones *
                      </label>
                      <textarea
                        id="ag-obj"
                        name="description"
                        rows={3}
                        required
                        placeholder="Describe qué datos debe solicitar y cómo debe actuar..."
                        value={agentForm.description}
                        onChange={e => setAgentForm({ ...agentForm, description: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                    <button
                      type="submit"
                      style={{ padding: '0.65rem', borderRadius: '8px', border: 'none', background: '#9333ea', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                    >
                      ➕ Registrar Agente en IA Condo
                    </button>
                  </fieldset>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
