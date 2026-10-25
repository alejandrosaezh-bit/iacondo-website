import React, { useState, useEffect, useCallback } from 'react';

const API_BASE = 'https://condopro-api.onrender.com';
const DEMO_URL = 'https://iacondo.com/demo';

const ROLE_LABELS = {
  admin: { label: 'CEO & Dirección General', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  director: { label: 'Director de Operaciones y Comercial', color: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)' },
  ventas: { label: 'Agente Comercial (Ventas)', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  ia_implementacion: { label: 'Agente IA de Implementación', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
  programacion: { label: 'Programación e Implementación', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' },
  soporte: { label: 'Departamento de Soporte Técnico', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  administracion: { label: 'Administración y Facturación', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)' }
};

const CALL_STATUS_LABELS = {
  pendiente: { label: '1. Nuevo / Contacto Inicial', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  nuevo: { label: '1. Nuevo / Contacto Inicial', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  contactado: { label: '2. Contacto / Visita o Demo', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  visita_demo: { label: '2. Contacto / Visita o Demo', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  demo_realizada: { label: '3. Cotización / Propuesta (% o Fijo)', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  cotizacion: { label: '3. Cotización / Propuesta (% o Fijo)', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  en_espera: { label: '4. En Espera (Asamblea / Junta)', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' },
  implementacion: { label: '5. En Implementación (Diego IA + Programación)', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
  afiliado: { label: '6. Ganado (Condominio Activo)', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  ganado: { label: '6. Ganado (Condominio Activo)', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' },
  descartado: { label: '7. Perdido / Descartado', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  perdido: { label: '7. Perdido / Descartado', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
  diagnostico: { label: '2. En Diagnóstico Técnico', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
  en_revision: { label: '3. En Solución / Ajuste', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)' },
  validacion: { label: '4. Validación con Condominio', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)' },
  resuelto: { label: '5. Resuelto / Cerrado', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)' }
};

const CHAIN_ACTION_LABELS = {
  pendiente: '✅ Fase 1 Cumplida: Marcar Contactado + Demo Enviado → Pasar a Fase 2 (Demo)',
  nuevo: '✅ Fase 1 Cumplida: Marcar Contactado + Demo Enviado → Pasar a Fase 2 (Demo)',
  contactado: '📊 Fase 2 Cumplida: Demo Realizado → Pasar a Fase 3 (Cotización % o Fijo)',
  visita_demo: '📊 Fase 2 Cumplida: Demo Realizado → Pasar a Fase 3 (Cotización % o Fijo)',
  demo_realizada: '🚀 Fase 3 Cumplida: Cotización Aprobada → Transferir a 🤖 Diego IA + 💻 Programación',
  cotizacion: '🚀 Fase 3 Cumplida: Cotización Aprobada → Transferir a 🤖 Diego IA + 💻 Programación',
  en_espera: '🚀 Asamblea Aprobó → Transferir a 🤖 Diego IA + 💻 Programación (Implementación)',
  implementacion: '🏁 Fase 4 Cumplida: Datos y Carga Listos → Activar Condominio (Pasar a Facturación)'
};

const DEFAULT_CEO_USER = {
  id: 'user_ceo_alejandro',
  name: 'Alejandro Sáez',
  email: 'alejandrosaezh@iacondo.com',
  role: 'admin',
  roleLabel: 'CEO & Fundador'
};

export default function IACondoPanel() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('iacondo_panel_user');
      return saved ? JSON.parse(saved) : DEFAULT_CEO_USER;
    } catch {
      return DEFAULT_CEO_USER;
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
    roleLabel: '',
    functions: '',
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
  const [agentFilter, setAgentFilter] = useState('todos');
  const [callNotesDraft, setCallNotesDraft] = useState({});
  const [activityTypeDraft, setActivityTypeDraft] = useState({});
  const [activityTextDraft, setActivityTextDraft] = useState({});
  const [nextTaskDraft, setNextTaskDraft] = useState({});

  const showToast = (msg) => {
    setSyncMessage(msg);
    setTimeout(() => setSyncMessage(''), 4500);
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

  const handleQuickSwitchRole = (targetUser) => {
    setCurrentUser(targetUser);
    localStorage.setItem('iacondo_panel_user', JSON.stringify(targetUser));
    if (targetUser.role === 'soporte') {
      setActiveTab('soporte');
    } else if (targetUser.role === 'ventas' || targetUser.role === 'programacion' || targetUser.role === 'ia_implementacion') {
      setActiveTab('agenda');
      setAgentFilter(targetUser.email);
    } else {
      setActiveTab('agenda');
      setAgentFilter('todos');
    }
    showToast(`👤 Vista cambiada a: ${targetUser.name} (${targetUser.roleLabel || ROLE_LABELS[targetUser.role]?.label || targetUser.role})`);
  };

  const handleLogout = () => {
    localStorage.removeItem('iacondo_panel_user');
    setCurrentUser(null);
  };

  const handleUpdateCall = async (callId, updates, customToast) => {
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: callId, ...updates })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(customToast || '✅ Avance guardado y sincronizado en la cadena de IA Condo');
        fetchDashboard();
      }
    } catch {
      showToast('⚠️ Error al actualizar el registro');
    }
  };

  const handleAdvanceChainPhase = async (call) => {
    const callId = call.id || call._id;
    await handleUpdateCall(
      callId,
      {
        advancePhase: true,
        actorName: currentUser.name,
        actorRole: currentUser.roleLabel || ROLE_LABELS[currentUser.role]?.label || 'Equipo IA Condo'
      },
      `🚀 Fase completada: "${call.condoName}" pasó automáticamente al siguiente eslabón de la cadena`
    );
  };

  const handleAddActivityLog = async (callId) => {
    const text = (activityTextDraft[callId] || '').trim();
    if (!text) return;
    const type = activityTypeDraft[callId] || 'llamada';
    await handleUpdateCall(
      callId,
      {
        newActivity: {
          type,
          actor: `${currentUser.name} (${currentUser.roleLabel || ROLE_LABELS[currentUser.role]?.label || currentUser.role})`,
          text
        }
      },
      '📝 Registro de actividad añadido a la bitácora del condominio'
    );
    setActivityTextDraft({ ...activityTextDraft, [callId]: '' });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const rb = ROLE_LABELS[userForm.role] || ROLE_LABELS.ventas;
      const payload = {
        ...userForm,
        roleLabel: userForm.roleLabel || rb.label
      };
      const res = await fetch(`${API_BASE}/api/iacondo-panel/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✅ Integrante, rol y funciones guardados en el organigrama de IA Condo');
        setUserForm({
          id: '',
          name: '',
          email: '',
          password: '',
          role: 'ventas',
          roleLabel: '',
          functions: '',
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
        showToast('🧠 Entrenamiento de Sofía IA actualizado en vivo para WhatsApp y Web');
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
    const statusMatch = callFilter === 'todos' || (c.status || 'pendiente') === callFilter;
    const agentMatch = agentFilter === 'todos' || c.assignedAgentEmail === agentFilter;
    return statusMatch && agentMatch;
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
          maxWidth: '500px',
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
              PANEL EJECUTIVO CEO, TAREAS Y AUTOMATIZACIÓN EN CADENA
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              Control de Leads, Próximas Tareas, Handoff Automático a Programación / Agentes IA y Organigrama.
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
              Acceso rápido por rol (Usuarios de prueba listos):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleLogin(null, 'alejandrosaezh@iacondo.com', 'IACondo2026!')}
                style={{ padding: '0.5rem', fontSize: '0.75rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', cursor: 'pointer', fontWeight: '600' }}
              >
                👑 CEO (Alejandro Sáez)
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'valeria.ventas@iacondo.com', 'Ventas2026!')}
                style={{ padding: '0.5rem', fontSize: '0.75rem', borderRadius: '8px', background: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)', cursor: 'pointer', fontWeight: '600' }}
              >
                📈 Comercial (Valeria Rivas)
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'programacion@iacondo.com', 'Dev2026!')}
                style={{ padding: '0.5rem', fontSize: '0.75rem', borderRadius: '8px', background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.3)', cursor: 'pointer', fontWeight: '600' }}
              >
                💻 Programación (Ing. Miguel)
              </button>
              <button
                type="button"
                onClick={() => handleLogin(null, 'soporte@iacondo.com', 'Soporte2026!')}
                style={{ padding: '0.5rem', fontSize: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer', fontWeight: '600' }}
              >
                🛠️ Soporte (Ing. Laura)
              </button>
            </div>
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
        padding: '0.9rem 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ color: '#0ea5e9' }}>⌂</span>
            <span>PANEL<span style={{ color: '#0ea5e9' }}>.IACONDO.COM</span></span>
          </div>
          <span style={{
            padding: '0.28rem 0.7rem',
            borderRadius: '999px',
            fontSize: '0.74rem',
            fontWeight: '700',
            background: waStatus?.whatsapp_status === 'connected' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: waStatus?.whatsapp_status === 'connected' ? '#4ade80' : '#f59e0b',
            border: '1px solid rgba(74, 222, 128, 0.3)'
          }}>
            {waStatus?.whatsapp_status === 'connected'
              ? '🟢 WhatsApp 0422-2537239 + Web Chat Gemini Activos'
              : '⏳ Sincronizando línea WhatsApp...'}
          </span>
          <a
            href={DEMO_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.28rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: '700',
              background: 'rgba(192, 132, 252, 0.18)',
              color: '#e9d5ff',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              textDecoration: 'none'
            }}
          >
            🎮 Demo Oficial: iacondo.com/demo ↗
          </a>
        </div>

        {/* SIMULADOR DE ROLES EN 1 CLIC PARA PRUEBAS DEL CEO */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '600' }}>Simular Vista:</span>
          {[
            { name: 'Alejandro Sáez', email: 'alejandrosaezh@iacondo.com', role: 'admin', roleLabel: '👑 CEO & Fundador' },
            { name: 'Valeria Rivas (Demo)', email: 'valeria.ventas@iacondo.com', role: 'ventas', roleLabel: '📈 Agente Comercial 1' },
            { name: 'Ing. Miguel Torres (Demo)', email: 'programacion@iacondo.com', role: 'programacion', roleLabel: '💻 Programación + Diego IA' },
            { name: 'Ing. Laura Méndez (Demo)', email: 'soporte@iacondo.com', role: 'soporte', roleLabel: '🛠️ Soporte Técnico' }
          ].map(sim => (
            <button
              key={sim.email}
              type="button"
              onClick={() => handleQuickSwitchRole(sim)}
              style={{
                padding: '0.32rem 0.65rem',
                borderRadius: '8px',
                border: currentUser.email === sim.email ? '1px solid #38bdf8' : '1px solid rgba(148,163,184,0.25)',
                background: currentUser.email === sim.email ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                color: currentUser.email === sim.email ? '#fff' : '#cbd5e1',
                fontSize: '0.73rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {sim.roleLabel}
            </button>
          ))}

          <button
            type="button"
            onClick={fetchDashboard}
            style={{
              padding: '0.38rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer',
              fontSize: '0.76rem',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳...' : '🔄 Sincronizar'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.85)', padding: '0.32rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.2)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.68rem', color: roleBadge.color, fontWeight: '600' }}>{currentUser.roleLabel || roleBadge.label}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                fontSize: '0.7rem'
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
      <div style={{ maxWidth: '1420px', margin: '0 auto', padding: '1.5rem 1.5rem' }}>
        {/* CADENA DE AUTOMATIZACIÓN VISUAL */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.75))',
          border: '1px solid rgba(56, 189, 248, 0.28)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8' }}>
              ⚡ CADENA DE AUTOMATIZACIÓN IA CONDO (HANDOFF AUTOMÁTICO ENTRE DEPARTAMENTOS E IA):
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Al completar una fase, el sistema transfiere el condominio automáticamente al siguiente responsable
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '0.76rem' }}>
            <div style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <strong style={{ color: '#fbbf24' }}>1. Captación (Sofía IA)</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>Extrae datos en WhatsApp/Web, envía <code>iacondo.com/demo</code> y asigna a Agente Comercial.</div>
            </div>
            <div style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'rgba(74, 222, 128, 0.12)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
              <strong style={{ color: '#4ade80' }}>2. Comercial (Valeria / Andrés)</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>Llama al lead, realiza el Demo y presenta Cotización (% sobre movimientos o fijo).</div>
            </div>
            <div style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'rgba(45, 212, 191, 0.12)', border: '1px solid rgba(45, 212, 191, 0.3)' }}>
              <strong style={{ color: '#2dd4bf' }}>3. Onboarding (🤖 Diego IA)</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>Solicita automáticamente al cliente censo de propietarios, alícuotas y bancos.</div>
            </div>
            <div style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'rgba(167, 139, 250, 0.12)', border: '1px solid rgba(167, 139, 250, 0.3)' }}>
              <strong style={{ color: '#a78bfa' }}>4. Programación (Ing. Miguel)</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>Configura base de datos en <code>app.iacondo.com</code> y entrega accesos a la Junta.</div>
            </div>
            <div style={{ padding: '0.55rem 0.75rem', borderRadius: '10px', background: 'rgba(244, 114, 182, 0.12)', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
              <strong style={{ color: '#f472b6' }}>5. Facturación (Lic. Mariana + Elena IA)</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.15rem' }}>Activa cobro mensual (% movimientos o fijo) y soporte continuo.</div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{
          display: 'flex',
          gap: '0.55rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
          paddingBottom: '0.85rem'
        }}>
          {[
            { id: 'agenda', label: `👑 Panel CEO, Tareas de Agentes y Pipeline (${salesCalls.length})` },
            { id: 'usuarios', label: `👥 Organigrama, Roles y Funciones (${users.length})` },
            { id: 'ia', label: `🤖 Agentes IA y Entrenamiento de Sofía (${aiAgents.length})` },
            { id: 'soporte', label: `🛠️ Departamento Técnico (${supportTickets.length})` },
            { id: 'chats', label: `💬 Conversaciones WhatsApp / Web (${sessions.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.68rem 1.15rem',
                borderRadius: '10px',
                border: activeTab === tab.id ? '1px solid #0ea5e9' : '1px solid rgba(148, 163, 184, 0.2)',
                background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(37, 99, 235, 0.25))' : 'rgba(15, 23, 42, 0.7)',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                fontWeight: activeTab === tab.id ? '700' : '600',
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===================================================================
            TAB 1: PANEL CEO, PRÓXIMAS TAREAS DE AGENTES Y PIPELINE EN CADENA
            =================================================================== */}
        {activeTab === 'agenda' && (
          <div>
            {/* MATRIZ EJECUTIVA DEL CEO: QUIÉN TIENE QUÉ LEAD Y QUÉ AVANCES HA HECHO */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.9rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '800', color: '#fff' }}>
                    👑 Tablero de Control del CEO — Carga de Trabajo por Integrante / Agente IA
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Haz clic en cualquier miembro del equipo para filtrar sus leads asignados y ver sus próximas tareas pendientes.
                  </p>
                </div>
                {agentFilter !== 'todos' && (
                  <button
                    type="button"
                    onClick={() => setAgentFilter('todos')}
                    style={{
                      padding: '0.38rem 0.85rem',
                      borderRadius: '8px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      border: '1px solid #38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Ver Todos los Leads ({salesCalls.length})
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))', gap: '0.75rem' }}>
                {users.filter(u => ['ventas', 'programacion', 'ia_implementacion', 'director', 'administracion'].includes(u.role)).map(u => {
                  const assignedLeads = salesCalls.filter(c => c.assignedAgentEmail === u.email);
                  const rb = ROLE_LABELS[u.role] || ROLE_LABELS.ventas;
                  const isFiltered = agentFilter === u.email;
                  return (
                    <button
                      key={u.id || u._id || u.email}
                      type="button"
                      onClick={() => setAgentFilter(isFiltered ? 'todos' : u.email)}
                      style={{
                        textAlign: 'left',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        border: isFiltered ? `2px solid ${rb.color}` : '1px solid rgba(148, 163, 184, 0.2)',
                        background: isFiltered ? 'rgba(14, 165, 233, 0.14)' : 'rgba(6, 13, 24, 0.7)',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.55rem', borderRadius: '999px', background: rb.bg, color: rb.color, fontWeight: '700' }}>
                          {u.roleLabel || rb.label}
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: assignedLeads.length > 0 ? '#4ade80' : '#64748b' }}>
                          {assignedLeads.length} {assignedLeads.length === 1 ? 'lead' : 'leads'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: '800', marginTop: '0.4rem' }}>{u.name}</div>
                      {assignedLeads.length > 0 ? (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', display: 'grid', gap: '0.2rem' }}>
                          {assignedLeads.map(l => (
                            <div key={l.id || l._id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              • <strong>{l.condoName}</strong> ({l.units} unid.)
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.73rem', color: '#64748b' }}>
                          En guardia esperando próximo lead en cadena
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BARRA DE FILTROS DE ETAPA DEL TÚNEL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                  📋 Próximas Tareas de Agentes, Registro de Contactos y Avances en Cadena
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
                  Cada agente ve aquí su próxima tarea obligatoria, registra llamadas/correos, envía el demo (<code>{DEMO_URL}</code>) y avanza el condominio al siguiente departamento.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'todos', label: 'Todas las Etapas' },
                  { id: 'pendiente', label: '1. Contacto Inicial' },
                  { id: 'visita_demo', label: '2. Demo / Visita' },
                  { id: 'cotizacion', label: '3. Cotización (% o Fijo)' },
                  { id: 'implementacion', label: '4. Implementación (Diego IA + Dev)' },
                  { id: 'ganado', label: '5. Ganado (Activo)' }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCallFilter(f.id)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      border: callFilter === f.id ? '1px solid #38bdf8' : '1px solid rgba(148,163,184,0.2)',
                      background: callFilter === f.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                      color: callFilter === f.id ? '#fff' : '#94a3b8',
                      fontSize: '0.78rem',
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
                No hay oportunidades en este filtro. Haz clic en <strong>"Todas las Etapas"</strong> o <strong>"Ver Todos los Leads"</strong> para ver el pipeline completo.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.35rem' }}>
                {filteredSalesCalls.map(call => {
                  const callId = call.id || call._id;
                  const clientName = call.clientName || call.contactName || 'Interesado';
                  const rawPhone = call.clientPhone || call.phone || '';
                  const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
                  const timeLabel = call.callTimeLabel || call.callTimeDescription || 'Lo antes posible';
                  const summary = call.executiveSummary || call.executiveBriefing || 'Interesado en implementar IA Condo en su condominio.';
                  const units = call.units || call.unitsCount || 'Por confirmar';
                  const hasAccessControl = call.hasAccessControl || 'Sí (Portón / Garita)';
                  const numericUnits = String(units).replace(/\D/g, '') || '24';
                  const unitType = /apto|apartamento|edificio/i.test(String(units)) ? 'Apto' : 'Casa';
                  const accessParam = hasAccessControl === 'No' ? 'no' : 'si';
                  const personalizedDemoUrl = `${DEMO_URL}?condo=${encodeURIComponent(call.condoName || 'Mi Condominio')}&units=${encodeURIComponent(numericUnits)}&type=${unitType}&access=${accessParam}&client=${encodeURIComponent(clientName)}`;
                  const st = CALL_STATUS_LABELS[call.status || 'pendiente'] || CALL_STATUS_LABELS.pendiente;
                  const chainButtonText = CHAIN_ACTION_LABELS[call.status || 'pendiente'];
                  const logs = Array.isArray(call.activityLog) ? call.activityLog : [];

                  return (
                    <div key={callId} style={{
                      background: 'rgba(15, 23, 42, 0.92)',
                      border: '1px solid rgba(56, 189, 248, 0.28)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                      gap: '1.5rem'
                    }}>
                      {/* Columna Izquierda: Datos del Condominio, Próxima Tarea y Bitácora */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
                          <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.76rem', fontWeight: '700', background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700' }}>
                            👤 Responsable Actual: {call.assignedAgentName || 'Valeria Rivas (Demo)'}
                          </span>
                        </div>

                        <div>
                          <h3 style={{ fontSize: '1.22rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#fff' }}>
                            🏢 {call.condoName || 'Condominio por confirmar'} — {units} Unidades ({call.city || 'Venezuela'})
                          </h3>
                          <div style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: '600' }}>
                            👤 Contacto: {clientName} • 📞 +{cleanPhone} • 🚪 Acceso: {hasAccessControl}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#c084fc', marginTop: '0.2rem' }}>
                            🔗 Demo Personalizado: <code>{personalizedDemoUrl}</code>
                          </div>
                        </div>

                        {/* CAJA DESTACADA: PRÓXIMA TAREA OBLIGATORIA DEL AGENTE */}
                        <div style={{
                          padding: '0.9rem 1rem',
                          background: 'rgba(245, 158, 11, 0.12)',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '12px'
                        }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#fbbf24', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>⚡ PRÓXIMA TAREA ASIGNADA AL AGENTE ({call.assignedAgentName || 'Comercial'}):</span>
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', lineHeight: '1.4' }}>
                            {call.nextTask || '📞 Llamar al contacto del condominio, enviar demo (https://iacondo.com/demo) y registrar resultado.'}
                          </div>
                          <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.55rem' }}>
                            <input
                              type="text"
                              aria-label="Editar próxima tarea"
                              placeholder="Asignar o actualizar próxima tarea para este lead..."
                              value={nextTaskDraft[callId] !== undefined ? nextTaskDraft[callId] : ''}
                              onChange={e => setNextTaskDraft({ ...nextTaskDraft, [callId]: e.target.value })}
                              style={{ flex: 1, padding: '0.4rem 0.65rem', borderRadius: '6px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.76rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if ((nextTaskDraft[callId] || '').trim()) {
                                  handleUpdateCall(callId, {
                                    nextTask: nextTaskDraft[callId],
                                    newActivity: {
                                      type: 'tarea',
                                      actor: currentUser.name,
                                      text: `Nueva tarea asignada: ${nextTaskDraft[callId]}`
                                    }
                                  });
                                  setNextTaskDraft({ ...nextTaskDraft, [callId]: '' });
                                }
                              }}
                              style={{ padding: '0.4rem 0.7rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)', fontSize: '0.74rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Fijar Tarea
                            </button>
                          </div>
                        </div>

                        <div style={{ padding: '0.85rem', background: 'rgba(6, 13, 24, 0.75)', borderRadius: '10px', borderLeft: '3px solid #0ea5e9' }}>
                          <div style={{ fontSize: '0.73rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.25rem' }}>
                            📋 FICHA EJECUTIVA DE SOFÍA IA:
                          </div>
                          <div style={{ fontSize: '0.83rem', color: '#e2e8f0', lineHeight: '1.45', whiteSpace: 'pre-line' }}>
                            {summary}
                          </div>
                        </div>

                        {/* BITÁCORA CRONOLÓGICA DE LLAMADAS, CORREOS Y HANDOFFS */}
                        <div style={{
                          padding: '0.85rem',
                          background: 'rgba(6, 13, 24, 0.85)',
                          borderRadius: '10px',
                          border: '1px solid rgba(148, 163, 184, 0.18)',
                          maxHeight: '190px',
                          overflowY: 'auto'
                        }}>
                          <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#94a3b8', marginBottom: '0.45rem' }}>
                            🕒 HISTORIAL DE AVANCES, LLAMADAS Y AUTOMATIZACIONES ({logs.length}):
                          </div>
                          <div style={{ display: 'grid', gap: '0.45rem' }}>
                            {logs.slice().reverse().map((entry, idx) => (
                              <div key={idx} style={{ fontSize: '0.77rem', paddingBottom: '0.35rem', borderBottom: '1px dashed rgba(148,163,184,0.12)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8', fontWeight: '700' }}>
                                  <span>{entry.actor || 'Equipo IA Condo'}</span>
                                  <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                    {entry.date ? new Date(entry.date).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }) : ''}
                                  </span>
                                </div>
                                <div style={{ color: '#e2e8f0', marginTop: '0.15rem' }}>{entry.text}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Columna Derecha: Botón de Automatización en Cadena, Registro de Contacto y Demo */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                        {/* BOTÓN DE AUTOMATIZACIÓN EN CADENA (HANDOFF AUTOMÁTICO) */}
                        {chainButtonText && (
                          <div style={{
                            padding: '0.95rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(45, 212, 191, 0.15))',
                            border: '1px solid rgba(45, 212, 191, 0.45)'
                          }}>
                            <div style={{ fontSize: '0.73rem', fontWeight: '800', color: '#2dd4bf', marginBottom: '0.4rem' }}>
                              🔄 AUTOMATIZACIÓN EN CADENA (PASAR AL SIGUIENTE ESLABÓN):
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAdvanceChainPhase(call)}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                                color: '#fff',
                                fontWeight: '800',
                                fontSize: '0.84rem',
                                cursor: 'pointer',
                                boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.5)'
                              }}
                            >
                              {chainButtonText}
                            </button>
                          </div>
                        )}

                        {/* SELECTORES MANUALES DE ETAPA, FACTURACIÓN Y RESPONSABLE */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                          <div>
                            <label htmlFor={`status-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: '600' }}>
                              Fase del Túnel
                            </label>
                            <select
                              id={`status-${callId}`}
                              name="status"
                              value={call.status || 'pendiente'}
                              onChange={e => handleUpdateCall(callId, {
                                status: e.target.value,
                                newActivity: {
                                  type: 'fase',
                                  actor: currentUser.name,
                                  text: `Cambio manual de etapa a: ${CALL_STATUS_LABELS[e.target.value]?.label || e.target.value}`
                                }
                              })}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.8rem' }}
                            >
                              <option value="pendiente">1. Nuevo / Contacto Inicial</option>
                              <option value="visita_demo">2. Contacto / Visita o Demo</option>
                              <option value="cotizacion">3. Cotización / Propuesta (% o Fijo)</option>
                              <option value="en_espera">4. En Espera (Asamblea / Junta)</option>
                              <option value="implementacion">5. En Implementación (Diego IA + Dev)</option>
                              <option value="ganado">6. Ganado (Condominio Activo)</option>
                              <option value="perdido">7. Perdido / Descartado</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`billing-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: '600' }}>
                              Modalidad de Cobro IA Condo
                            </label>
                            <select
                              id={`billing-${callId}`}
                              name="billingModel"
                              value={call.billingModel || 'porcentaje_movimientos'}
                              onChange={e => handleUpdateCall(callId, { billingModel: e.target.value })}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.35)', fontSize: '0.8rem', fontWeight: '600' }}
                            >
                              <option value="porcentaje_movimientos">📊 % sobre Movimientos (Ingresos/Gastos)</option>
                              <option value="fijo_mensual">💵 Importe Fijo Mensual ($ / Condominio)</option>
                              <option value="hibrido">⚖️ Híbrido (Base Fija + % Movimientos)</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`access-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: '600' }}>
                              🚪 Control de Acceso (para Demo)
                            </label>
                            <select
                              id={`access-${callId}`}
                              name="hasAccessControl"
                              value={call.hasAccessControl || 'Sí (Portón / Garita)'}
                              onChange={e => handleUpdateCall(callId, { hasAccessControl: e.target.value })}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', fontSize: '0.8rem', fontWeight: '600' }}
                            >
                              <option value="Sí (Portón / Garita)">✅ Sí tiene Control de Acceso (Portón / Garita)</option>
                              <option value="No">❌ No tiene Control de Acceso</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor={`agent-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: '600' }}>
                              Responsable Asignado (Humano o Agente IA)
                            </label>
                            <select
                              id={`agent-${callId}`}
                              name="assignedAgentEmail"
                              value={call.assignedAgentEmail || 'valeria.ventas@iacondo.com'}
                              onChange={e => {
                                const found = users.find(u => u.email === e.target.value);
                                const newName = found ? found.name : e.target.value;
                                handleUpdateCall(callId, {
                                  assignedAgentId: found?.id || '',
                                  assignedAgentEmail: e.target.value,
                                  assignedAgentName: newName,
                                  newActivity: {
                                    type: 'asignacion',
                                    actor: currentUser.name,
                                    text: `Lead reasignado a: ${newName}`
                                  }
                                });
                              }}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.82rem' }}
                            >
                              {users.map(u => (
                                <option key={u.id || u._id || u.email} value={u.email}>
                                  {u.name} — {u.roleLabel || ROLE_LABELS[u.role]?.label || u.role}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* FORMULARIO PARA REGISTRAR LLAMADA, CORREO, DEMO O NOTA EN LA BITÁCORA */}
                        <div style={{
                          padding: '0.85rem',
                          background: 'rgba(6, 13, 24, 0.7)',
                          borderRadius: '10px',
                          border: '1px solid rgba(56, 189, 248, 0.25)'
                        }}>
                          <label htmlFor={`act-text-${callId}`} style={{ display: 'block', fontSize: '0.74rem', color: '#38bdf8', marginBottom: '0.35rem', fontWeight: '700' }}>
                            📞 Registrar Llamada, Contacto, Correo o Resultado:
                          </label>
                          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <select
                              aria-label="Tipo de contacto"
                              value={activityTypeDraft[callId] || 'llamada'}
                              onChange={e => setActivityTypeDraft({ ...activityTypeDraft, [callId]: e.target.value })}
                              style={{ padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.78rem' }}
                            >
                              <option value="llamada">📞 Llamada</option>
                              <option value="whatsapp">💬 WhatsApp</option>
                              <option value="correo">✉️ Correo</option>
                              <option value="demo">🎮 Demo Web</option>
                              <option value="ia_onboarding">🤖 Diego IA</option>
                            </select>
                            <input
                              id={`act-text-${callId}`}
                              type="text"
                              placeholder="Ej. Llamé a la Junta, envié demo personalizado y acordamos cotización..."
                              value={activityTextDraft[callId] || ''}
                              onChange={e => setActivityTextDraft({ ...activityTextDraft, [callId]: e.target.value })}
                              style={{ flex: 1, minWidth: '180px', padding: '0.5rem 0.7rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.8rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddActivityLog(callId)}
                              style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer' }}
                            >
                              + Registrar
                            </button>
                          </div>
                        </div>

                        {/* ACCIONES RÁPIDAS: ENVIAR DEMO PERSONALIZADO VS DEMO GENERAL POR WHATSAPP, CONTACTAR Y LLAMAR */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${clientName}, te saluda ${currentUser.name} del equipo de IA Condo. Hemos generado tu Demo Personalizado para *${call.condoName || 'tu condominio'}* (${numericUnits} viviendas, Control de Acceso: ${hasAccessControl}):\n\n🔗 ${personalizedDemoUrl}\n🔑 Usuario: DEMO | Clave: DEMO`)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              handleUpdateCall(callId, {
                                newActivity: {
                                  type: 'demo',
                                  actor: currentUser.name,
                                  text: `✨ Demo Personalizado (${call.condoName}, ${numericUnits} viv., Acceso: ${hasAccessControl}) enviado por WhatsApp a ${clientName}.`
                                }
                              });
                            }}
                            style={{
                              textAlign: 'center',
                              padding: '0.6rem 0.75rem',
                              borderRadius: '8px',
                              background: 'rgba(192, 132, 252, 0.22)',
                              color: '#e9d5ff',
                              border: '1px solid rgba(192, 132, 252, 0.5)',
                              textDecoration: 'none',
                              fontWeight: '800',
                              fontSize: '0.78rem'
                            }}
                          >
                            ✨ Enviar Demo Personalizado ({call.condoName || 'Condo'})
                          </a>

                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${clientName}, te saluda ${currentUser.name} del equipo de IA Condo. Aquí tienes nuestro Demo General para que puedas explorar todas las funciones en vivo:\n\n🔗 ${DEMO_URL}\n🔑 Usuario: DEMO | Clave: DEMO`)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => {
                              handleUpdateCall(callId, {
                                newActivity: {
                                  type: 'demo',
                                  actor: currentUser.name,
                                  text: `👀 Demo General (${DEMO_URL}) enviado por WhatsApp a ${clientName}.`
                                }
                              });
                            }}
                            style={{
                              textAlign: 'center',
                              padding: '0.6rem 0.75rem',
                              borderRadius: '8px',
                              background: 'rgba(148, 163, 184, 0.16)',
                              color: '#cbd5e1',
                              border: '1px solid rgba(148, 163, 184, 0.35)',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '0.78rem'
                            }}
                          >
                            👀 Enviar Demo General (Sin datos)
                          </a>

                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${clientName}, te saluda ${currentUser.name} de IA Condo (iacondo.com) respecto a ${call.condoName || 'tu condominio'}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              textAlign: 'center',
                              padding: '0.55rem 0.8rem',
                              borderRadius: '8px',
                              background: 'rgba(34, 197, 94, 0.2)',
                              color: '#4ade80',
                              border: '1px solid rgba(34, 197, 94, 0.4)',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '0.8rem'
                            }}
                          >
                            💬 WhatsApp (+{cleanPhone})
                          </a>

                          <a
                            href={`tel:+${cleanPhone}`}
                            style={{
                              textAlign: 'center',
                              padding: '0.55rem 0.8rem',
                              borderRadius: '8px',
                              background: 'rgba(56, 189, 248, 0.15)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.35)',
                              textDecoration: 'none',
                              fontWeight: '700',
                              fontSize: '0.8rem'
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
                Incidencias técnicas diagnosticadas por Marcos IA / Sofía IA y asignadas a la Ing. Laura Méndez (Soporte Técnico).
              </p>
            </div>

            {supportTickets.length === 0 ? (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px dashed rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                ✅ No hay tickets técnicos pendientes. Cuando un condominio reporte una incidencia técnica por WhatsApp o Web, se asignará automáticamente aquí al Departamento Técnico.
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
                          Responsable Asignado: <strong style={{ color: '#fff' }}>{ticket.assignedAgentName || 'Ing. Laura Méndez (Soporte)'}</strong>
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
            TAB 3: CHATS DE WHATSAPP Y WEB EN VIVO
            =================================================================== */}
        {activeTab === 'chats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '16px', padding: '1.25rem', maxHeight: '72vh', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: 0, marginBottom: '1rem' }}>
                💬 Conversaciones WhatsApp (0422-2537239) y Web (iacondo.com)
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
                        <span style={{ color: '#38bdf8', fontSize: '0.75rem' }}>{p.condoName || (s.channel === 'web' ? '🌐 Web Chat' : '📱 WhatsApp')}</span>
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
            TAB 4: ORGANIGRAMA, ROLES, FUNCIONES Y USUARIOS DEMO / REALES
            =================================================================== */}
        {activeTab === 'usuarios' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Listado del Organigrama y Funciones */}
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: 0 }}>
                👥 Organigrama de IA Condo (CEO, Directores, Agentes, Técnicos e IA)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Usuarios de prueba (Demo) e IA preconfigurados con sus funciones exactas en la cadena. Puedes editarlos o reemplazarlos por tus empleados reales a medida que se incorporen.
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {users.map(u => {
                  const rb = ROLE_LABELS[u.role] || ROLE_LABELS.ventas;
                  const userId = u.id || u._id;
                  const isActive = u.active !== false;
                  return (
                    <div key={userId} style={{
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(148, 163, 184, 0.22)',
                      borderRadius: '14px',
                      padding: '1.2rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ padding: '0.22rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', background: rb.bg, color: rb.color }}>
                            {u.roleLabel || rb.label}
                          </span>
                          <h3 style={{ fontSize: '1.08rem', fontWeight: '800', margin: '0.45rem 0 0.25rem 0' }}>{u.name}</h3>
                          {u.functions && (
                            <div style={{
                              margin: '0.4rem 0 0.6rem 0',
                              padding: '0.55rem 0.75rem',
                              background: 'rgba(6, 13, 24, 0.7)',
                              borderRadius: '8px',
                              borderLeft: `3px solid ${rb.color}`,
                              fontSize: '0.79rem',
                              color: '#e2e8f0',
                              lineHeight: '1.4'
                            }}>
                              <strong>🎯 Funciones en la Cadena:</strong> {u.functions}
                            </div>
                          )}
                          <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>🔑 Acceso: <code>{u.email}</code></div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📅 Agenda (.ics): <code>{u.calendarEmail || u.email}</code> • 📱 <code>{u.whatsappPhone || u.phone || 'Por configurar'}</code></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleUserDuty(u)}
                            style={{
                              padding: '0.38rem 0.75rem',
                              borderRadius: '999px',
                              border: 'none',
                              background: isActive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                              color: isActive ? '#4ade80' : '#94a3b8',
                              fontWeight: '700',
                              fontSize: '0.74rem',
                              cursor: 'pointer'
                            }}
                          >
                            {isActive ? '🟢 En Guardia (Activo)' : '⏸️ Fuera de Guardia'}
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
                                roleLabel: u.roleLabel || '',
                                functions: u.functions || '',
                                whatsappPhone: u.whatsappPhone || u.phone || '',
                                calendarEmail: u.calendarEmail || u.email || '',
                                active: isActive
                              })}
                              style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              ✏️ Editar / Reemplazar
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

            {/* Formulario para Registrar / Editar Integrante y Definir Funciones */}
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '1.5rem', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: 0 }}>
                {userForm.id ? '✏️ Editar Integrante / Reemplazar Usuario Demo' : '➕ Agregar Nuevo Miembro (Comercial, Técnico, Director o IA)'}
              </h3>

              <form onSubmit={handleSaveUser} method="POST" action="/api/iacondo-panel/users">
                <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.95rem' }}>
                  <legend style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                    Datos del integrante de IA Condo
                  </legend>

                  <div>
                    <label htmlFor="user-name" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Nombre y Apellido (o Nombre del Agente IA) *
                    </label>
                    <input
                      id="user-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Ej. Carlos Mendoza o 🤖 Diego IA"
                      value={userForm.name}
                      onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="user-role" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Departamento / Eslabón en la Cadena *
                    </label>
                    <select
                      id="user-role"
                      name="role"
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value, roleLabel: ROLE_LABELS[e.target.value]?.label || '' })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                    >
                      <option value="ventas">📈 Agente Comercial (Recibe Leads en Round-Robin, Llama y Envía Demo)</option>
                      <option value="ia_implementacion">🤖 Agente IA de Implementación (Solicita Censo, Alícuotas y Bancos)</option>
                      <option value="programacion">💻 Programación e Implementación (Configura Condominio en app.iacondo.com)</option>
                      <option value="soporte">🛠️ Departamento de Soporte Técnico (Atiende Tickets de Condominios)</option>
                      <option value="administracion">💳 Administración y Facturación (Cobro % sobre Movimientos o Fijo)</option>
                      <option value="director">📊 Director de Operaciones y Comercial (Supervisa Conversión y SLA)</option>
                      <option value="admin">👑 CEO & Dirección General (Control Total del Ecosistema)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="user-functions" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                      Funciones y Responsabilidades en la Cadena *
                    </label>
                    <textarea
                      id="user-functions"
                      name="functions"
                      rows={3}
                      required
                      placeholder="Describe qué hace exactamente este rol cuando recibe un condominio y qué activa su paso al siguiente eslabón..."
                      value={userForm.functions}
                      onChange={e => setUserForm({ ...userForm, functions: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.83rem' }}
                    />
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
                        Contraseña {userForm.id ? '(Opcional)' : '*'}
                      </label>
                      <input
                        id="user-password"
                        name="password"
                        type="text"
                        required={!userForm.id}
                        placeholder="Clave de acceso"
                        value={userForm.password}
                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="user-calendar" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        Correo Agenda (.ics) *
                      </label>
                      <input
                        id="user-calendar"
                        name="calendarEmail"
                        type="email"
                        required
                        placeholder="Correo Google/Apple Calendar"
                        value={userForm.calendarEmail}
                        onChange={e => setUserForm({ ...userForm, calendarEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="user-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        WhatsApp Alertas *
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
                    💾 Guardar Integrante y Funciones en el Organigrama
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
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '16px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: 0 }}>
                🧠 Entrenamiento en Vivo de Sofía IA (WhatsApp 0422-2537239 y Web)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Sofía IA envía automáticamente el enlace oficial del demo (<code>{DEMO_URL}</code>) cuando un usuario solicita ver el sistema y asigna los leads a tus agentes comerciales.
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
                      Directrices de Personalidad, Enlace Demo ({DEMO_URL}) y Reglas de Negocio
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

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: 0 }}>
                🤖 Catálogo de Agentes de IA — IA Condo
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Agentes autónomos que asisten en cada etapa de la cadena: Captación (Sofía IA), Implementación y Carga de Datos (Diego IA), Soporte Técnico (Marcos IA) y Cobranzas (Elena IA).
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
                        placeholder="Ej. Diego IA — Onboarding e Implementación"
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
                        placeholder="Ej. Solicitud de Censo, Alícuotas y Bancos para Arranque"
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
