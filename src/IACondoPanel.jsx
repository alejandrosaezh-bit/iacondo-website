import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = 'https://condopro-api.onrender.com';
const DEMO_URL = 'https://app.iacondo.com/demo';

const VENEZUELA_ZONES = [
  { id: 'gran_caracas', label: '📍 Gran Caracas (Distrito Capital, Miranda, La Guaira)' },
  { id: 'central', label: '📍 Región Central (Carabobo, Aragua, Cojedes)' },
  { id: 'centro_occidental', label: '📍 Centro-Occidental (Lara, Yaracuy, Falcón, Portuguesa)' },
  { id: 'zulia_andes', label: '📍 Zulia y Los Andes (Zulia, Mérida, Táchira, Trujillo, Barinas)' },
  { id: 'oriental', label: '📍 Región Oriental e Insular (Anzoátegui, Nueva Esparta, Monagas, Sucre)' },
  { id: 'guayana', label: '📍 Guayana y Sur (Bolívar, Amazonas, Apure, Guárico)' },
  { id: 'nacional', label: '🇻🇪 Cobertura Nacional / Todas las Zonas' }
];

const CONTACT_OUTCOME_OPTIONS = [
  { id: 'acordo_visita_demo', label: '🎯 Se acordó Visita / Demo en vivo (Avanza a Fase 2: Demo)' },
  { id: 'envio_cotizacion', label: '📊 Se realizó Demo y se envió Cotización (Avanza a Fase 3: Cotización)' },
  { id: 'espera_asamblea', label: '⏳ En espera de aprobación en Asamblea / Junta (Fase 4: En Espera)' },
  { id: 'aprobo_contratacion', label: '🚀 ¡Aprobó Contratación! (Pasa a Fase 5: Implementación con Diego IA)' },
  { id: 'volver_a_contactar', label: '📅 Requiere volver a contactar (Re-agendar en Calendario y Alertas)' },
  { id: 'no_contesto', label: '📵 No contestó / Buzón de voz (Re-agendar próximo intento)' },
  { id: 'descartado', label: '❌ Descartado / Sin interés por ahora (Fase 7: Perdido)' }
];

const CRM_TUNNEL_COLUMNS = [
  { id: 'pendiente', match: ['pendiente', 'nuevo'], title: '1. Nuevo / Contacto', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  { id: 'visita_demo', match: ['contactado', 'visita_demo'], title: '2. Visita / Demo', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
  { id: 'cotizacion', match: ['demo_realizada', 'cotizacion'], title: '3. Cotización', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.12)' },
  { id: 'en_espera', match: ['en_espera'], title: '4. Asamblea / Junta', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)' },
  { id: 'implementacion', match: ['implementacion'], title: '5. Implementación', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.12)' },
  { id: 'ganado', match: ['afiliado', 'ganado'], title: '6. Condominio Activo', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)' }
];

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
  const [viewMode, setViewMode] = useState('auto'); // 'auto' | 'ceo' | 'agent_app'
  const [agentAppTab, setAgentAppTab] = useState('pendientes'); // 'pendientes' | 'tunel'
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
    assignedZones: ['gran_caracas', 'central', 'centro_occidental', 'zulia_andes', 'oriental', 'guayana', 'nacional'],
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

  // Selected Session in Live Chat Tab & Selected Lead in CRM Tunnel
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('lead') || null;
    }
    return null;
  });
  const deepLinkHandledRef = useRef(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedLeadSectionRef = useRef(null);
  const [callFilter, setCallFilter] = useState('todos');
  const [agentFilter, setAgentFilter] = useState('todos');
  const [zoneFilter, setZoneFilter] = useState('todas');
  const [callNotesDraft, setCallNotesDraft] = useState({});
  const [activityTypeDraft, setActivityTypeDraft] = useState({});
  const [activityTextDraft, setActivityTextDraft] = useState({});
  const [nextTaskDraft, setNextTaskDraft] = useState({});

  // Step 4: Browser / Mobile Notification State
  const [notifPermission, setNotifPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return window.Notification.permission;
    }
    return 'default';
  });
  const notifiedCallIdsRef = useRef(new Set());

  // Step 1: Manual Lead Dialog & State
  const newLeadDialogRef = useRef(null);
  const [newLeadForm, setNewLeadForm] = useState({
    condoName: '',
    units: '',
    unitType: 'Apartamentos',
    hasAccessControl: 'Sí (Portón / Garita)',
    city: '',
    zone: '',
    clientName: '',
    clientPhone: '',
    email: '',
    contactDate: '',
    contactTime: '',
    contactChannel: 'llamada',
    notes: '',
    assignedAgentEmail: ''
  });

  // Step 5 & Step 6: Contact Outcome + Rescheduling + Live Call Transcription & AI Summary Dialog
  const outcomeDialogRef = useRef(null);
  const speechRecRef = useRef(null);
  const [activeOutcomeCall, setActiveOutcomeCall] = useState(null);
  const [isRecordingSpeech, setIsRecordingSpeech] = useState(false);
  const [aiTranscribing, setAiTranscribing] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState({
    contactMethod: 'llamada',
    outcome: 'acordo_visita_demo',
    notes: '',
    nextContactDate: '',
    nextContactTime: '',
    nextContactChannel: 'llamada',
    nextTask: '',
    rawTranscript: '',
    aiSummary: ''
  });

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

  // Abrir directamente el expediente del Lead cuando el agente entra desde el link de WhatsApp (?lead=...&phone=...)
  useEffect(() => {
    if (deepLinkHandledRef.current || !calls.length || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlLeadId = params.get('lead');
    const urlPhone = (params.get('phone') || '').replace(/\D/g, '').slice(-10);
    if (!urlLeadId && !urlPhone) return;

    const matched = calls.find((c) => {
      const cId = String(c.id || c._id || '');
      const cPhone = String(c.clientPhone || c.phone || '').replace(/\D/g, '');
      if (urlLeadId && cId === urlLeadId) return true;
      if (urlPhone && urlPhone.length >= 8 && cPhone.includes(urlPhone)) return true;
      return false;
    });

    if (matched) {
      deepLinkHandledRef.current = true;
      setActiveTab('agenda');
      setCallFilter('todos');
      setAgentFilter('todos');
      setZoneFilter('todas');
      setSelectedLeadId(matched.id || matched._id);
      setTimeout(() => {
        if (selectedLeadSectionRef.current) {
          selectedLeadSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
    }
  }, [calls]);

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
        roleLabel: userForm.roleLabel || rb.label,
        assignedZones: Array.isArray(userForm.assignedZones) && userForm.assignedZones.length > 0
          ? userForm.assignedZones
          : ['gran_caracas', 'central', 'centro_occidental', 'zulia_andes', 'oriental', 'guayana', 'nacional']
      };
      const res = await fetch(`${API_BASE}/api/iacondo-panel/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        showToast('✅ Integrante, rol, funciones y zonas asignadas guardadas en el organigrama de IA Condo');
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
          assignedZones: ['gran_caracas', 'central', 'centro_occidental', 'zulia_andes', 'oriental', 'guayana', 'nacional'],
          active: true
        });
        fetchDashboard();
      }
    } catch {
      showToast('⚠️ No se pudo guardar el usuario');
    }
  };

  // Step 4: Solicitar permiso de notificaciones push en el navegador / celular del agente
  const handleRequestMobileNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      showToast('ℹ️Las notificaciones directas llegan a tu WhatsApp y Calendario (.ics)');
      return;
    }
    try {
      const perm = await window.Notification.requestPermission();
      setNotifPermission(perm);
      if (perm === 'granted') {
        new window.Notification('🔔 Alertas de IA Condo Activadas', {
          body: 'Recibirás alertas en este dispositivo cuando se asigne un nuevo lead o toque llamarlo.'
        });
        showToast('🔔 Notificaciones activadas en este dispositivo + WhatsApp + Google/Apple Calendar (.ics)');
      } else {
        showToast('⚠️ Permiso de notificación denegado en el navegador (seguirás recibiendo alertas por WhatsApp y .ics)');
      }
    } catch {
      showToast('ℹ️ Las alertas se enviarán por WhatsApp y Calendario (.ics)');
    }
  };

  // Step 4: Monitorear llamadas programadas próximas o nuevos leads para disparar notificación local si está permitido
  useEffect(() => {
    if (notifPermission !== 'granted' || typeof window === 'undefined' || !('Notification' in window)) return;
    const now = Date.now();
    calls.forEach(c => {
      const cid = c.id || c._id;
      if (!cid) return;
      if (c.scheduledDateTimeISO && !notifiedCallIdsRef.current.has(`due_${cid}_${c.scheduledDateTimeISO}`)) {
        const dueMs = new Date(c.scheduledDateTimeISO).getTime();
        if (!isNaN(dueMs) && dueMs <= now + 5 * 60 * 1000 && dueMs >= now - 30 * 60 * 1000) {
          notifiedCallIdsRef.current.add(`due_${cid}_${c.scheduledDateTimeISO}`);
          try {
            new window.Notification(`⏰ Hora de contactar: ${c.condoName || 'Condominio'}`, {
              body: `Contacto: ${c.clientName || 'Interesado'} (${c.clientPhone || ''}) — Responsable: ${c.assignedAgentName || 'Comercial'}`
            });
          } catch {
            // ignore
          }
        }
      }
    });
  }, [calls, notifPermission]);

  // Step 1: Registrar Nuevo Lead Manualmente desde panel.iacondo.com
  const handleCreateManualLead = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLeadForm,
          scheduledDate: newLeadForm.contactDate,
          scheduledTime: newLeadForm.contactTime,
          contactMethod: newLeadForm.contactChannel,
          assignedAgentEmail: newLeadForm.assignedAgentEmail || (currentUser?.role === 'ventas' ? currentUser?.email : ''),
          actorName: currentUser?.name || 'Equipo IA Condo'
        })
      });
      const data = await res.json();
      if (data.ok) {
        if (data.calls) setCalls(data.calls);
        newLeadDialogRef.current?.close();
        setNewLeadForm({
          condoName: '',
          units: '',
          unitType: 'Apartamentos',
          hasAccessControl: 'Sí (Portón / Garita)',
          city: '',
          zone: '',
          clientName: '',
          clientPhone: '',
          email: '',
          contactDate: '',
          contactTime: '',
          contactChannel: 'llamada',
          notes: '',
          assignedAgentEmail: ''
        });
        showToast(`✅ Nuevo Lead "${data.lead?.condoName || ''}" registrado, asignado por zona (${data.lead?.zoneLabel || 'Venezuela'}) y notificado al celular del agente`);
      } else {
        showToast(`⚠️ ${data.error || 'Error registrando el lead'}`);
      }
    } catch {
      showToast('⚠️ Error conectando con el servidor al crear el lead');
    }
  };

  // Step 5 & Step 6: Abrir modal de Llamada / WhatsApp + Transcripción en Vivo + Resultado y Re-Agendamiento
  const openOutcomeAndCallModal = async (call, method = 'llamada', triggerAction = false) => {
    const callId = call.id || call._id;
    const rawPhone = call.clientPhone || call.phone || '';
    const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
    const clientName = call.clientName || call.contactName || 'Interesado';

    setActiveOutcomeCall(call);
    setOutcomeForm({
      contactMethod: method,
      outcome: 'acordo_visita_demo',
      notes: '',
      nextContactDate: call.nextContactDate || '',
      nextContactTime: call.nextContactTime || '',
      nextContactChannel: method,
      nextTask: '',
      rawTranscript: '',
      aiSummary: ''
    });

    outcomeDialogRef.current?.showModal();

    if (triggerAction && cleanPhone) {
      // Dejar constancia inmediata de que el agente pulsó el botón de Llamar o Escribir desde el panel
      handleUpdateCall(
        callId,
        {
          newActivity: {
            type: method,
            actor: `${currentUser.name} (${currentUser.roleLabel || ROLE_LABELS[currentUser.role]?.label || currentUser.role})`,
            text: method === 'whatsapp'
              ? `💬 Inició contacto por WhatsApp desde panel.iacondo.com con ${clientName} (+${cleanPhone}).`
              : `📞 Inició llamada telefónica desde panel.iacondo.com a ${clientName} (+${cleanPhone}).`
          }
        },
        method === 'whatsapp'
          ? `💬 Abriendo WhatsApp con ${clientName} y preparando registro del resultado...`
          : `📞 Marcando a ${clientName} (+${cleanPhone}) y abriendo panel de transcripción / resultado...`
      );

      if (method === 'whatsapp') {
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${clientName}, te saluda ${currentUser.name} del equipo comercial de IA Condo (iacondo.com) respecto a ${call.condoName || 'tu condominio'}.`)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } else if (method === 'llamada') {
        window.location.href = `tel:+${cleanPhone}`;
      }
    }
  };

  // Step 6: Iniciar / Detener Transcripción de Llamada en Vivo con Web Speech API (Español)
  const handleToggleLiveTranscription = () => {
    if (isRecordingSpeech) {
      if (speechRecRef.current) {
        try {
          speechRecRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecordingSpeech(false);
      showToast('🛑 Micrófono detenido. Ahora puedes pulsar "Extraer Resumen con IA"');
      return;
    }

    const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      showToast('⚠️ Tu navegador no soporta dictado directo; puedes subir el audio de la llamada o pegar las notas abajo.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-VE';
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        let addedText = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal) {
            addedText += `${event.results[i][0].transcript.trim()} `;
          }
        }
        if (addedText) {
          setOutcomeForm(prev => ({
            ...prev,
            rawTranscript: `${prev.rawTranscript ? `${prev.rawTranscript}\n` : ''}${addedText.trim()}`
          }));
        }
      };

      recognition.onerror = () => {
        setIsRecordingSpeech(false);
      };

      recognition.onend = () => {
        setIsRecordingSpeech(false);
      };

      speechRecRef.current = recognition;
      recognition.start();
      setIsRecordingSpeech(true);
      showToast('🎙️ Escuchando y transcribiendo la llamada en tiempo real (pon el altavoz del teléfono)...');
    } catch {
      showToast('⚠️ No se pudo iniciar el micrófono. Verifica los permisos del navegador.');
    }
  };

  // Step 6: Subir archivo de audio grabado para transcripción y resumen con Gemini Flash
  const handleAudioUploadForAi = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeOutcomeCall) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast('⚠️ El archivo de audio supera los 15 MB permitidos');
      return;
    }
    setAiTranscribing(true);
    showToast('🎧 Transcribiendo grabación de llamada y extrayendo resumen ejecutivo con Gemini Flash...');
    try {
      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const base64 = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/transcribe-and-summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeOutcomeCall.id || activeOutcomeCall._id,
          audioBase64: base64Audio,
          audioMimeType: file.type || 'audio/mp3',
          rawTranscript: outcomeForm.rawTranscript,
          actorName: currentUser.name,
          condoName: activeOutcomeCall.condoName,
          clientName: activeOutcomeCall.clientName
        })
      });
      const data = await res.json();
      if (data.ok && data.aiResult) {
        setOutcomeForm(prev => ({
          ...prev,
          rawTranscript: data.aiResult.cleanTranscript || prev.rawTranscript,
          aiSummary: data.aiResult.executiveSummary || prev.aiSummary,
          outcome: data.aiResult.suggestedOutcome || prev.outcome,
          nextTask: data.aiResult.suggestedNextTask || prev.nextTask
        }));
        if (data.calls) setCalls(data.calls);
        showToast('✨ Llamada transcrita y resumida automáticamente por IA Condo');
      } else {
        showToast('⚠️ No se pudo procesar el archivo de audio');
      }
    } catch {
      showToast('⚠️ Error subiendo audio para transcripción');
    } finally {
      setAiTranscribing(false);
      e.target.value = '';
    }
  };

  // Step 6: Extraer resumen ejecutivo con IA (Gemini Flash) a partir de la transcripción en vivo
  const handleGenerateAiSummary = async () => {
    if (!activeOutcomeCall) return;
    if (!outcomeForm.rawTranscript.trim()) {
      showToast('⚠️ Primero inicia la transcripción por micrófono, sube un audio o escribe puntos de la conversación');
      return;
    }
    setAiTranscribing(true);
    showToast('🧠 Analizando conversación y extrayendo acuerdos con Gemini Flash...');
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/transcribe-and-summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeOutcomeCall.id || activeOutcomeCall._id,
          rawTranscript: outcomeForm.rawTranscript,
          actorName: currentUser.name,
          condoName: activeOutcomeCall.condoName,
          clientName: activeOutcomeCall.clientName
        })
      });
      const data = await res.json();
      if (data.ok && data.aiResult) {
        setOutcomeForm(prev => ({
          ...prev,
          rawTranscript: data.aiResult.cleanTranscript || prev.rawTranscript,
          aiSummary: data.aiResult.executiveSummary || prev.aiSummary,
          outcome: data.aiResult.suggestedOutcome || prev.outcome,
          nextTask: data.aiResult.suggestedNextTask || prev.nextTask
        }));
        if (data.calls) setCalls(data.calls);
        showToast('✨ Resumen ejecutivo y resultado sugerido generados con éxito');
      }
    } catch {
      showToast('⚠️ Error generando el resumen con IA');
    } finally {
      setAiTranscribing(false);
    }
  };

  // Step 5: Guardar Resultado del Contacto y Re-Agendar automáticamente en la agenda del agente
  const handleSubmitContactOutcome = async (e) => {
    e.preventDefault();
    if (!activeOutcomeCall) return;
    if (isRecordingSpeech && speechRecRef.current) {
      try {
        speechRecRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecordingSpeech(false);
    }
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/record-outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeOutcomeCall.id || activeOutcomeCall._id,
          actorName: currentUser.name,
          actorRole: currentUser.roleLabel || ROLE_LABELS[currentUser.role]?.label || 'Agente Comercial',
          contactChannel: outcomeForm.contactMethod,
          outcomeType: outcomeForm.outcome,
          outcomeNotes: outcomeForm.notes,
          nextContactDate: outcomeForm.nextContactDate,
          nextContactTime: outcomeForm.nextContactTime,
          nextContactMethod: outcomeForm.nextContactChannel,
          callTranscript: outcomeForm.rawTranscript,
          aiCallSummary: outcomeForm.aiSummary,
          ...outcomeForm
        })
      });
      const data = await res.json();
      if (data.ok) {
        if (data.calls) setCalls(data.calls);
        outcomeDialogRef.current?.close();
        setActiveOutcomeCall(null);
        showToast(
          outcomeForm.nextContactDate
            ? `✅ Resultado registrado y nuevo contacto agendado para el ${outcomeForm.nextContactDate} ${outcomeForm.nextContactTime || ''} (Alerta enviada al celular y Calendario .ics)`
            : outcomeForm.outcome === 'no_contesto'
            ? '🚨 Marcado como "No fue posible contactar": el lead seguirá activo en tu lista de Pendientes para recordarte volver a intentarlo'
            : '✅ Resultado del contacto, transcripción y etapa del túnel actualizados con éxito'
        );
      } else {
        showToast(`⚠️ ${data.error || 'Error guardando el resultado'}`);
      }
    } catch {
      showToast('⚠️ Error conectando con el servidor al guardar el resultado');
    }
  };

  // Acción rápida 1-clic: Marcar "No fue posible contactar" y mantener el recordatorio activo en Pendientes
  const handleQuickNoAnswer = async (call) => {
    const callId = call.id || call._id;
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/record-outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: callId,
          actorName: currentUser.name,
          actorRole: currentUser.roleLabel || ROLE_LABELS[currentUser.role]?.label || 'Agente Comercial',
          contactChannel: 'llamada',
          outcomeType: 'no_contesto',
          outcomeNotes: 'Intento de contacto realizado sin respuesta — mantener recordatorio activo para reintentar.',
          nextContactDate: '',
          nextContactTime: ''
        })
      });
      const data = await res.json();
      if (data.ok) {
        if (data.calls) setCalls(data.calls);
        showToast(`🚨 "${call.condoName || 'Lead'}" marcado como "No fue posible contactar" — seguirá fijo en tus Pendientes para recordarte reintentar.`);
      }
    } catch {
      showToast('⚠️ No se pudo actualizar el estado del recordatorio');
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

  const handleDeleteCall = async (callId) => {
    try {
      const res = await fetch(`${API_BASE}/api/iacondo-panel/calls/${encodeURIComponent(callId)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.ok) {
        setCalls(data.calls || []);
        if (selectedLeadId === callId) {
          setSelectedLeadId(null);
        }
        showToast('🗑️ Registro eliminado del panel');
      }
    } catch {
      showToast('⚠️ Error eliminando el registro');
    }
  };

  const handleSelectLeadFromTunnel = (cid) => {
    if (selectedLeadId === cid) {
      setSelectedLeadId(null);
      return;
    }
    setSelectedLeadId(cid);
    setTimeout(() => {
      selectedLeadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleCheckEmailsNow = async () => {
    setLoading(true);
    try {
      showToast('📬 Revisando bandejas de correo (hola@iacondo.com) con Sofía IA...');
      const res = await fetch(`${API_BASE}/api/iacondo-panel/check-emails-now`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lookbackDays: 7 })
      });
      const data = await res.json();
      if (data.ok) {
        if (data.calls) setCalls(data.calls);
        if (data.sessions) setSessions(data.sessions);
        const processedCount = (data.inboxLastResult?.results || []).reduce(
          (acc, r) => acc + ((r.processed && r.processed.length) || 0),
          0
        );
        showToast(
          processedCount > 0
            ? `✅ Sofía IA revisó y respondió ${processedCount} correo(s) nuevo(s)`
            : '📬 Bandeja al día: No hay correos nuevos pendientes de respuesta'
        );
      }
    } catch {
      showToast('⚠️ Error al revisar correos');
    } finally {
      setLoading(false);
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

  // Filtered lists & Role-based Scopes (CEO Toda la Empresa vs App de Seguimiento de Agente Comercial)
  const isExecutiveRole = Boolean(
    currentUser &&
      (currentUser.role === 'admin' ||
        currentUser.role === 'director' ||
        currentUser.email === 'alejandrosaezh@iacondo.com')
  );
  const isAgentAppMode = !isExecutiveRole || viewMode === 'agent_app';
  const activeAgentEmailForApp = !isExecutiveRole
    ? currentUser?.email || ''
    : agentFilter !== 'todos'
    ? agentFilter
    : currentUser?.email || 'alejandrosaezh@iacondo.com';

  const salesCalls = calls.filter(c => c.intent !== 'support');
  const supportTickets = calls.filter(c => c.intent === 'support');

  // En modo App de Agente Comercial solo ve los Leads asignados a ese agente; en modo CEO ve toda la empresa (o filtra a voluntad)
  const roleScopedSalesCalls = isAgentAppMode
    ? salesCalls.filter(
        c =>
          String(c.assignedAgentEmail || 'alejandrosaezh@iacondo.com').toLowerCase() ===
          String(activeAgentEmailForApp).toLowerCase()
      )
    : salesCalls;

  const filteredSalesCalls = roleScopedSalesCalls.filter(c => {
    const statusMatch = callFilter === 'todos' || (c.status || 'pendiente') === callFilter;
    const agentMatch =
      isAgentAppMode ||
      agentFilter === 'todos' ||
      String(c.assignedAgentEmail || '').toLowerCase() === String(agentFilter).toLowerCase();
    const zoneMatch = zoneFilter === 'todas' || (c.zone || 'gran_caracas') === zoneFilter;
    const q = searchQuery.trim().toLowerCase();
    const searchMatch =
      !q ||
      [
        c.condoName,
        c.clientName,
        c.contactName,
        c.city,
        c.clientPhone,
        c.phone,
        c.email
      ].some(val => String(val || '').toLowerCase().includes(q));
    return statusMatch && agentMatch && zoneMatch && searchMatch;
  });

  // Clasificador inteligente de Seguimiento:
  // 1) "urgentPendingLeads": Toca contactar hoy/ahora, nuevos sin primer contacto, o leads que NO FUE POSIBLE CONTACTAR (no_contesto / vencidos) -> siguen apareciendo para recordar hasta lograr contacto.
  // 2) "upcomingScheduledLeads": Próximos eventos, demos, llamadas o asambleas programadas a futuro.
  const nowMs = Date.now();
  const closedStatuses = ['ganado', 'afiliado', 'perdido', 'descartado'];
  const activeFollowUpLeads = filteredSalesCalls.filter(
    c => !closedStatuses.includes(c.status || 'pendiente')
  );

  const classifyLeadFollowUp = (call) => {
    const rawTarget = call.callTargetTimeUtc || call.scheduledDateTimeISO || null;
    const targetMs = rawTarget ? new Date(rawTarget).getTime() : NaN;
    const lastContactMs = call.lastContactAt ? new Date(call.lastContactAt).getTime() : NaN;
    const status = call.status || 'pendiente';

    // Si se intentó contactar y NO fue posible (no_contesto), y no tiene una fecha futura aún no cumplida, sigue fijo en Pendientes para recordar
    const isUnreachableReminder =
      call.lastOutcomeType === 'no_contesto' &&
      (isNaN(targetMs) || targetMs <= nowMs + 15 * 60 * 1000);

    // Si tenía hora programada y ya llegó o venció sin que se haya registrado un contacto posterior
    const isDueOrOverdue =
      !isNaN(targetMs) &&
      targetMs <= nowMs + 15 * 60 * 1000 &&
      (isNaN(lastContactMs) || lastContactMs < targetMs);

    // Si es un lead nuevo/pendiente sin fecha futura programada para otro día
    const isNewImmediate =
      (status === 'pendiente' || status === 'nuevo') &&
      (isNaN(targetMs) || targetMs <= nowMs + 3 * 60 * 60 * 1000);

    if (isUnreachableReminder) {
      return {
        bucket: 'urgent',
        reasonBadge: '🚨 NO FUE POSIBLE CONTACTAR — Recordatorio activo para reintentar',
        badgeColor: '#f87171',
        badgeBg: 'rgba(239, 68, 68, 0.18)',
        borderColor: '#ef4444',
        sortKey: isNaN(targetMs) ? 0 : targetMs
      };
    }
    if (isDueOrOverdue) {
      const isPast = targetMs < nowMs - 20 * 60 * 1000;
      return {
        bucket: 'urgent',
        reasonBadge: isPast
          ? '⏰ CONTACTO PENDIENTE / VENCIDO — Sigue en espera de contacto'
          : '🔔 TOCA CONTACTAR AHORA MISMO',
        badgeColor: isPast ? '#fbbf24' : '#38bdf8',
        badgeBg: isPast ? 'rgba(245, 158, 11, 0.2)' : 'rgba(14, 165, 233, 0.2)',
        borderColor: isPast ? '#f59e0b' : '#0ea5e9',
        sortKey: targetMs
      };
    }
    if (isNewImmediate) {
      return {
        bucket: 'urgent',
        reasonBadge: '🔔 NUEVO LEAD ASIGNADO — Realizar primer contacto',
        badgeColor: '#fbbf24',
        badgeBg: 'rgba(245, 158, 11, 0.18)',
        borderColor: '#f59e0b',
        sortKey: isNaN(targetMs) ? nowMs : targetMs
      };
    }
    return {
      bucket: 'upcoming',
      reasonBadge: '📅 EVENTO / CONTACTO PROGRAMADO',
      badgeColor: '#38bdf8',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      borderColor: 'rgba(56, 189, 248, 0.45)',
      sortKey: isNaN(targetMs) ? nowMs + 86400000 * 30 : targetMs
    };
  };

  const urgentPendingLeads = [];
  const upcomingScheduledLeads = [];
  activeFollowUpLeads.forEach(c => {
    const meta = classifyLeadFollowUp(c);
    if (meta.bucket === 'urgent') {
      urgentPendingLeads.push({ call: c, meta });
    } else {
      upcomingScheduledLeads.push({ call: c, meta });
    }
  });
  urgentPendingLeads.sort((a, b) => a.meta.sortKey - b.meta.sortKey);
  upcomingScheduledLeads.sort((a, b) => a.meta.sortKey - b.meta.sortKey);

  const selectedLead = salesCalls.find(c => (c.id || c._id) === selectedLeadId) || null;

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
              gap: '0.6rem',
              fontSize: '1.75rem',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              marginBottom: '0.5rem'
            }}>
              <img src="/logo-iacondo.png" alt="Logo IA Condo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
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
              Acceso directo Dirección General:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleLogin(null, 'alejandrosaezh@iacondo.com', 'IACondo2026!')}
                style={{ padding: '0.6rem', fontSize: '0.8rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.35)', cursor: 'pointer', fontWeight: '700' }}
              >
                👑 Ingresar como Alejandro Sáez (CEO)
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
      minBlockSize: '100dvh',
      maxInlineSize: '100dvw',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      background: '#060d18',
      color: '#f8fafc',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      paddingBlockEnd: '3rem'
    }}>
      {/* TOP HEADER CON SELECTOR DE VISTA CEO (TODA LA EMPRESA) VS APP DE SEGUIMIENTO DE AGENTE */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBlockEnd: '1px solid rgba(148, 163, 184, 0.15)',
        padding: '0.65rem 1rem',
        position: 'sticky',
        insetBlockStart: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.6rem',
        maxInlineSize: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap', minInlineSize: 0 }}>
          <div style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <img src="/logo-iacondo.png" alt="Logo IA Condo" style={{ inlineSize: '26px', blockSize: '26px', objectFit: 'contain' }} />
            <span>{isAgentAppMode ? 'APP COMERCIAL' : 'PANEL CEO'}<span style={{ color: '#0ea5e9' }}>.IACONDO</span></span>
          </div>
          <span style={{
            padding: '0.2rem 0.55rem',
            borderRadius: '999px',
            fontSize: '0.7rem',
            fontWeight: '700',
            background: waStatus?.whatsapp_status === 'connected' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: waStatus?.whatsapp_status === 'connected' ? '#4ade80' : '#f59e0b',
            border: '1px solid rgba(74, 222, 128, 0.3)'
          }}>
            {waStatus?.whatsapp_status === 'connected' ? '🟢 IA Activa' : '⏳ Sincronizando'}
          </span>

          {/* Si es CEO / Director, puede alternar entre ver TODA LA EMPRESA o probar la APP DE SEGUIMIENTO DEL AGENTE */}
          {isExecutiveRole && (
            <div style={{ display: 'inline-flex', background: 'rgba(6, 13, 24, 0.85)', padding: '0.18rem', borderRadius: '999px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <button
                type="button"
                onClick={() => {
                  setViewMode('ceo');
                  setAgentFilter('todos');
                }}
                style={{
                  padding: '0.26rem 0.65rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: !isAgentAppMode ? '#0ea5e9' : 'transparent',
                  color: !isAgentAppMode ? '#fff' : '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                👑 Vista CEO (Toda la Empresa)
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('agent_app');
                  setActiveTab('agenda');
                }}
                style={{
                  padding: '0.26rem 0.65rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: isAgentAppMode ? '#10b981' : 'transparent',
                  color: isAgentAppMode ? '#fff' : '#94a3b8',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                📱 App Agente Comercial
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minInlineSize: 0 }}>
          {!isAgentAppMode && (
            <button
              type="button"
              onClick={handleCheckEmailsNow}
              style={{
                padding: '0.36rem 0.65rem',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.16)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontWeight: '700'
              }}
            >
              {loading ? '⏳...' : '📬 Revisar Emails'}
            </button>
          )}

          <button
            type="button"
            onClick={() => newLeadDialogRef.current?.showModal()}
            style={{
              padding: '0.36rem 0.7rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              color: '#fff',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: '800'
            }}
          >
            ➕ Nuevo Lead
          </button>

          <button
            type="button"
            onClick={fetchDashboard}
            title="Sincronizar"
            style={{
              padding: '0.36rem 0.6rem',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: '700'
            }}
          >
            {loading ? '⏳' : '🔄'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(30, 41, 59, 0.85)', padding: '0.25rem 0.55rem', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.2)' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#e2e8f0' }}>
              {currentUser.name?.split(' ')[0] || 'Agente'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '0.18rem 0.45rem',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                fontSize: '0.68rem',
                fontWeight: '700'
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
          padding: '0.6rem 1rem',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '0.82rem',
          overflowWrap: 'anywhere'
        }}>
          {syncMessage}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div style={{
        maxInlineSize: '1380px',
        inlineSize: '100%',
        margin: '0 auto',
        padding: '0.85rem',
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}>
        {/* NAVIGATION TABS:
            - MODO CEO: Ve TODAS las áreas de la empresa (Control CEO + CRM, Equipo y Zonas, Sofía IA, Soporte, Chats en Vivo).
            - MODO APP AGENTE COMERCIAL: App enfocada en sus Pendientes / Recordatorios, sus Próximos Eventos Programados y su Túnel de Ventas. */}
        {!isAgentAppMode ? (
          <div style={{
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap',
            marginBlockEnd: '1rem',
            borderBlockEnd: '1px solid rgba(148, 163, 184, 0.15)',
            paddingBlockEnd: '0.65rem'
          }}>
            {[
              { id: 'agenda', label: `👑 Control CEO, Agenda y CRM (${salesCalls.length})` },
              { id: 'usuarios', label: `👥 Equipo y Zonas (${users.length})` },
              { id: 'ia', label: `🤖 Sofía IA (${aiAgents.length})` },
              { id: 'soporte', label: `🛠️ Soporte (${supportTickets.length})` },
              { id: 'chats', label: `💬 Chats en Vivo (${sessions.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '8px',
                  border: activeTab === tab.id ? '1px solid #0ea5e9' : '1px solid rgba(148, 163, 184, 0.2)',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(37, 99, 235, 0.25))' : 'rgba(15, 23, 42, 0.7)',
                  color: activeTab === tab.id ? '#fff' : '#94a3b8',
                  fontWeight: activeTab === tab.id ? '800' : '600',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBlockEnd: '1rem',
            borderBlockEnd: '1px solid rgba(148, 163, 184, 0.15)',
            paddingBlockEnd: '0.65rem'
          }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                {
                  id: 'pendientes',
                  label: `⏰ Mis Pendientes y Eventos (${urgentPendingLeads.length + upcomingScheduledLeads.length})`
                },
                {
                  id: 'tunel',
                  label: `📊 Mi Túnel de Ventas y Leads (${filteredSalesCalls.length})`
                }
              ].map(sub => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setActiveTab('agenda');
                    setAgentAppTab(sub.id);
                  }}
                  style={{
                    padding: '0.52rem 0.9rem',
                    borderRadius: '10px',
                    border: agentAppTab === sub.id ? '1px solid #10b981' : '1px solid rgba(148, 163, 184, 0.2)',
                    background:
                      agentAppTab === sub.id
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(14, 165, 233, 0.25))'
                        : 'rgba(15, 23, 42, 0.75)',
                    color: agentAppTab === sub.id ? '#fff' : '#94a3b8',
                    fontWeight: '800',
                    fontSize: '0.79rem',
                    cursor: 'pointer'
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Si el CEO está previsualizando la App de Agente, puede elegir de qué agente ver la agenda */}
            {isExecutiveRole && users.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>Agente:</span>
                {users.map(u => {
                  const active = String(activeAgentEmailForApp).toLowerCase() === String(u.email).toLowerCase();
                  return (
                    <button
                      key={u.id || u._id || u.email}
                      type="button"
                      onClick={() => setAgentFilter(u.email)}
                      style={{
                        padding: '0.26rem 0.6rem',
                        borderRadius: '999px',
                        border: active ? '1px solid #10b981' : '1px solid rgba(148,163,184,0.25)',
                        background: active ? 'rgba(16, 185, 129, 0.22)' : 'rgba(15, 23, 42, 0.7)',
                        color: active ? '#fff' : '#cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {u.name.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            TAB 1: PANEL CEO (TODA LA EMPRESA) O APP DE SEGUIMIENTO DE AGENTE COMERCIAL
            =================================================================== */}
        {(activeTab === 'agenda' || isAgentAppMode) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxInlineSize: '100%', minInlineSize: 0 }}>
            {/* 1. FICHA DE ACCIÓN INMEDIATA (SE MUESTRA ARRIBA DEL TODO AL ABRIR UN LEAD O ENTRAR DESDE WHATSAPP) */}
            <div ref={selectedLeadSectionRef} style={{ maxInlineSize: '100%', minInlineSize: 0 }}>
              {selectedLead && (() => {
                const call = selectedLead;
                const callId = call.id || call._id;
                const clientName = call.clientName || call.contactName || 'Interesado';
                const rawPhone = call.clientPhone || call.phone || '';
                const cleanPhone = String(rawPhone).replace(/[^0-9]/g, '');
                const timeLabel = call.callTimeLabel || call.callTimeDescription || 'Lo antes posible';
                const summary = call.executiveSummary || call.executiveBriefing || 'Interesado en implementar IA Condo en su condominio.';
                const units = String(call.units || call.unitsCount || 'Por confirmar');
                const formattedUnitsHeader = /casa|apto|apartamento|vivienda|unid/i.test(units)
                  ? units
                  : `${units} Unidades`;
                const hasAccessControl = call.hasAccessControl || 'Sí (Portón / Garita)';
                const numericUnits = String(units).replace(/\D/g, '') || '24';
                const unitType = /apto|apartamento|edificio/i.test(String(units)) ? 'Apto' : 'Casa';
                const accessParam = hasAccessControl === 'No' ? 'no' : 'si';
                const personalizedDemoUrl = `${DEMO_URL}?condo=${encodeURIComponent(call.condoName || 'Mi Condominio')}&units=${encodeURIComponent(numericUnits)}&type=${unitType}&access=${accessParam}&client=${encodeURIComponent(clientName)}`;
                const st = CALL_STATUS_LABELS[call.status || 'pendiente'] || CALL_STATUS_LABELS.pendiente;
                const logs = Array.isArray(call.activityLog) ? call.activityLog : [];
                const transcripts = Array.isArray(call.callTranscripts) ? call.callTranscripts : [];
                const zoneObj = VENEZUELA_ZONES.find(z => z.id === call.zone);
                const zoneBadgeLabel = call.zoneLabel || zoneObj?.label || '📍 Venezuela';
                const followMeta = classifyLeadFollowUp(call);

                return (
                  <div key={callId} style={{
                    background: 'rgba(15, 23, 42, 0.96)',
                    border: '2px solid #0ea5e9',
                    borderRadius: '14px',
                    padding: '1rem',
                    boxShadow: '0 14px 32px -12px rgba(14, 165, 233, 0.35)',
                    maxInlineSize: '100%',
                    minInlineSize: 0,
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}>
                    {/* Encabezado compacto del Lead activo */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      paddingBlockEnd: '0.65rem',
                      borderBlockEnd: '1px solid rgba(56, 189, 248, 0.2)'
                    }}>
                      <div style={{ minInlineSize: 0, flex: '1 1 220px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBlockEnd: '0.3rem' }}>
                          <span style={{ padding: '0.18rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '800', background: followMeta.badgeBg, color: followMeta.badgeColor }}>
                            {followMeta.reasonBadge}
                          </span>
                          <span style={{ padding: '0.18rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700', background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                          <span style={{ padding: '0.18rem 0.55rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: '700', background: 'rgba(56, 189, 248, 0.14)', color: '#38bdf8' }}>
                            {zoneBadgeLabel}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.08rem', fontWeight: '800', margin: 0, color: '#fff', overflowWrap: 'anywhere' }}>
                          🏢 {call.condoName || 'Condominio'} — {formattedUnitsHeader}
                        </h3>
                        <div style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: '600', marginBlockStart: '0.2rem', overflowWrap: 'anywhere' }}>
                          👤 {clientName} • 📞 {cleanPhone ? `+${cleanPhone}` : 'Sin teléfono'} • 📍 {call.city || 'Venezuela'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#fbbf24', marginBlockStart: '0.2rem', fontWeight: '700', overflowWrap: 'anywhere' }}>
                          ⏰ Programado: {timeLabel} {call.nextTask ? `• 📌 ${call.nextTask.replace(/\(https?:\/\/[^)]+\)/g, '')}` : ''}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedLeadId(null)}
                        style={{
                          padding: '0.35rem 0.7rem',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.16)',
                          color: '#fca5a5',
                          border: '1px solid rgba(239, 68, 68, 0.35)',
                          fontSize: '0.74rem',
                          fontWeight: '800',
                          cursor: 'pointer'
                        }}
                      >
                        ✕ Cerrar
                      </button>
                    </div>

                    {/* ACCIONES DIRECTAS DEL AGENTE (AL FRENTE Y SIN RUIDO) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 145px), 1fr))',
                      gap: '0.5rem',
                      maxInlineSize: '100%'
                    }}>
                      <button
                        type="button"
                        onClick={() => openOutcomeAndCallModal(call, 'llamada', true)}
                        style={{
                          padding: '0.68rem 0.6rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(56, 189, 248, 0.5)',
                          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        📞 Llamar Ahora
                      </button>

                      <button
                        type="button"
                        onClick={() => openOutcomeAndCallModal(call, 'whatsapp', true)}
                        style={{
                          padding: '0.68rem 0.6rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                          color: '#fff',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        💬 Escribir WhatsApp
                      </button>

                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${clientName}, te saluda ${currentUser.name} del equipo de IA Condo. Hemos generado tu Demo Personalizado para *${call.condoName || 'tu condominio'}* (${numericUnits} viviendas, Control de Acceso: ${hasAccessControl}):\n\n🔗 ${personalizedDemoUrl}\n🔑 Usuario: DEMO | Clave: IACondo*2026!`)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => {
                          handleUpdateCall(callId, {
                            newActivity: {
                              type: 'demo',
                              actor: currentUser.name,
                              text: `✨ Demo Personalizado (${call.condoName}, ${numericUnits} viv.) enviado por WhatsApp a ${clientName}.`
                            }
                          });
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '0.68rem 0.6rem',
                          borderRadius: '10px',
                          background: 'rgba(192, 132, 252, 0.22)',
                          color: '#e9d5ff',
                          border: '1px solid rgba(192, 132, 252, 0.5)',
                          textDecoration: 'none',
                          fontWeight: '800',
                          fontSize: '0.78rem'
                        }}
                      >
                        ✨ Enviar Demo WhatsApp
                      </a>

                      <button
                        type="button"
                        onClick={() => handleQuickNoAnswer(call)}
                        style={{
                          padding: '0.68rem 0.6rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          background: 'rgba(239, 68, 68, 0.16)',
                          color: '#fca5a5',
                          fontWeight: '800',
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        📵 No Contestó (Recordar)
                      </button>

                      <button
                        type="button"
                        onClick={() => openOutcomeAndCallModal(call, 'llamada', false)}
                        style={{
                          padding: '0.68rem 0.6rem',
                          borderRadius: '10px',
                          border: '1px solid rgba(245, 158, 11, 0.55)',
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#fde68a',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        ✅ Resultado / Agendar
                      </button>
                    </div>

                    {/* Resumen puntual del caso */}
                    <div style={{
                      padding: '0.7rem 0.85rem',
                      background: 'rgba(6, 13, 24, 0.75)',
                      borderRadius: '10px',
                      borderInlineStart: '3px solid #0ea5e9',
                      fontSize: '0.8rem',
                      color: '#e2e8f0',
                      lineHeight: 1.45,
                      overflowWrap: 'anywhere'
                    }}>
                      <strong style={{ color: '#38bdf8' }}>📋 Resumen:</strong> {summary}
                    </div>

                    {/* Selectores rápidos: Fase CRM, Agente y Control de Acceso */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
                      gap: '0.55rem'
                    }}>
                      <div>
                        <label htmlFor={`status-${callId}`} style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBlockEnd: '0.2rem', fontWeight: '600' }}>
                          Etapa en el Túnel de Ventas
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
                              text: `Cambio de etapa a: ${CALL_STATUS_LABELS[e.target.value]?.label || e.target.value}`
                            }
                          })}
                          style={{ inlineSize: '100%', padding: '0.45rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.78rem' }}
                        >
                          <option value="pendiente">1. Nuevo / Contacto Inicial</option>
                          <option value="visita_demo">2. Contacto / Visita o Demo</option>
                          <option value="cotizacion">3. Cotización / Propuesta</option>
                          <option value="en_espera">4. En Espera (Junta)</option>
                          <option value="implementacion">5. En Implementación</option>
                          <option value="ganado">6. Ganado (Activo)</option>
                          <option value="perdido">7. Perdido / Descartado</option>
                        </select>
                      </div>

                      {!isAgentAppMode && (
                        <div>
                          <label htmlFor={`agent-${callId}`} style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBlockEnd: '0.2rem', fontWeight: '600' }}>
                            Agente Asignado
                          </label>
                          <select
                            id={`agent-${callId}`}
                            name="assignedAgentEmail"
                            value={call.assignedAgentEmail || 'alejandrosaezh@iacondo.com'}
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
                            style={{ inlineSize: '100%', padding: '0.45rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.78rem' }}
                          >
                            {users.map(u => (
                              <option key={u.id || u._id || u.email} value={u.email}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label htmlFor={`access-${callId}`} style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', marginBlockEnd: '0.2rem', fontWeight: '600' }}>
                          Control de Acceso (Demo)
                        </label>
                        <select
                          id={`access-${callId}`}
                          name="hasAccessControl"
                          value={call.hasAccessControl || 'Sí (Portón / Garita)'}
                          onChange={e => handleUpdateCall(callId, { hasAccessControl: e.target.value })}
                          style={{ inlineSize: '100%', padding: '0.45rem', borderRadius: '8px', background: '#0f172a', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.35)', fontSize: '0.78rem', fontWeight: '600' }}
                        >
                          <option value="Sí (Portón / Garita)">✅ Con Portón / Garita</option>
                          <option value="No">❌ Sin Control de Acceso</option>
                        </select>
                      </div>
                    </div>

                    {/* Historial y Transcripciones desplegable para no saturar la pantalla */}
                    <details style={{
                      background: 'rgba(6, 13, 24, 0.75)',
                      borderRadius: '10px',
                      border: '1px solid rgba(148, 163, 184, 0.18)',
                      padding: '0.6rem 0.8rem'
                    }}>
                      <summary style={{ cursor: 'pointer', fontSize: '0.76rem', fontWeight: '700', color: '#94a3b8' }}>
                        🕒 Ver Bitácora, Transcripciones IA y Opciones ({logs.length + transcripts.length})
                      </summary>
                      <div style={{ marginBlockStart: '0.65rem', display: 'grid', gap: '0.6rem' }}>
                        {transcripts.length > 0 && (
                          <div style={{ display: 'grid', gap: '0.4rem', padding: '0.6rem', background: 'rgba(88, 28, 135, 0.18)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#e9d5ff' }}>
                              🎙️ Resúmenes de Llamadas ({transcripts.length}):
                            </div>
                            {transcripts.slice().reverse().map((tr, idx) => (
                              <div key={tr.id || idx} style={{ fontSize: '0.74rem', color: '#f8fafc', overflowWrap: 'anywhere' }}>
                                <strong>{tr.agentName || tr.actor || 'Agente'}:</strong> {tr.aiSummary || tr.summary || tr.transcript}
                              </div>
                            ))}
                          </div>
                        )}

                        <div style={{ maxBlockSize: '150px', overflowY: 'auto', display: 'grid', gap: '0.35rem' }}>
                          {logs.slice().reverse().map((entry, idx) => (
                            <div key={idx} style={{ fontSize: '0.73rem', paddingBlockEnd: '0.3rem', borderBlockEnd: '1px dashed rgba(148,163,184,0.12)', overflowWrap: 'anywhere' }}>
                              <span style={{ color: '#38bdf8', fontWeight: '700' }}>{entry.author || entry.actor || 'IA Condo'}: </span>
                              <span style={{ color: '#cbd5e1' }}>{entry.text}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', paddingBlockStart: '0.3rem' }}>
                          <a
                            href={personalizedDemoUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#c084fc', fontSize: '0.74rem', fontWeight: '700', textDecoration: 'underline' }}
                          >
                            🎮 Probar Demo de {call.condoName || 'este Condominio'} ↗
                          </a>
                          {!isAgentAppMode && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCall(callId)}
                              style={{
                                padding: '0.35rem 0.7rem',
                                borderRadius: '6px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontWeight: '700',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Eliminar Lead
                            </button>
                          )}
                        </div>
                      </div>
                    </details>
                  </div>
                );
              })()}
            </div>

            {/* 2. SI ES MODO CEO: RESUMEN GLOBAL DE TODA LA EMPRESA Y FILTRO DE EQUIPO */}
            {!isAgentAppMode && (
              <div style={{
                background: 'rgba(15, 23, 42, 0.88)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '14px',
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxInlineSize: '100%',
                boxSizing: 'border-box'
              }}>
                {/* Indicadores Globales de la Empresa para el CEO */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                  gap: '0.5rem'
                }}>
                  <div style={{ background: 'rgba(6, 13, 24, 0.8)', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.18)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '700' }}>📊 TOTAL LEADS EMPRESA</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>{salesCalls.length}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.12)', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.35)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#fca5a5', fontWeight: '800' }}>🚨 TOCA CONTACTAR / PENDIENTES</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#f87171' }}>{urgentPendingLeads.length}</div>
                  </div>
                  <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.3)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: '800' }}>📅 PRÓXIMOS EVENTOS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#38bdf8' }}>{upcomingScheduledLeads.length}</div>
                  </div>
                  <div style={{ background: 'rgba(74, 222, 128, 0.12)', padding: '0.6rem 0.75rem', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.3)' }}>
                    <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: '800' }}>🏢 IMPLEMENTACIÓN / ACTIVOS</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#4ade80' }}>
                      {salesCalls.filter(c => ['implementacion', 'afiliado', 'ganado'].includes(c.status)).length}
                    </div>
                  </div>
                </div>

                {/* Filtros de Agente, Zona y Búsqueda para el CEO */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: '700' }}>Filtrar por Agente:</span>
                  <button
                    type="button"
                    onClick={() => setAgentFilter('todos')}
                    style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '999px',
                      border: agentFilter === 'todos' ? '1px solid #0ea5e9' : '1px solid rgba(148,163,184,0.25)',
                      background: agentFilter === 'todos' ? 'rgba(14, 165, 233, 0.22)' : 'rgba(6, 13, 24, 0.7)',
                      color: agentFilter === 'todos' ? '#fff' : '#cbd5e1',
                      fontSize: '0.73rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Toda la Empresa ({salesCalls.length})
                  </button>
                  {users.map(u => {
                    const count = salesCalls.filter(c => c.assignedAgentEmail === u.email).length;
                    const isFiltered = agentFilter === u.email;
                    return (
                      <button
                        key={u.id || u._id || u.email}
                        type="button"
                        onClick={() => setAgentFilter(isFiltered ? 'todos' : u.email)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '999px',
                          border: isFiltered ? '1px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.2)',
                          background: isFiltered ? 'rgba(56, 189, 248, 0.2)' : 'rgba(6, 13, 24, 0.7)',
                          color: isFiltered ? '#fff' : '#cbd5e1',
                          fontSize: '0.73rem',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {u.name.split(' ')[0]} ({count})
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="search"
                    aria-label="Buscar condominio, contacto o ciudad"
                    placeholder="🔍 Buscar condominio, contacto o ciudad..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      flex: '1 1 180px',
                      minInlineSize: 0,
                      padding: '0.42rem 0.7rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      color: '#fff',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      fontSize: '0.78rem'
                    }}
                  />

                  <select
                    aria-label="Filtrar por Zona del País"
                    value={zoneFilter}
                    onChange={e => setZoneFilter(e.target.value)}
                    style={{
                      flex: '1 1 160px',
                      minInlineSize: 0,
                      padding: '0.42rem 0.65rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      fontSize: '0.76rem',
                      fontWeight: '700'
                    }}
                  >
                    <option value="todas">🇻🇪 Todas las Zonas</option>
                    {VENEZUELA_ZONES.map(z => (
                      <option key={z.id} value={z.id}>{z.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 3. PANTALLA DE SEGUIMIENTO: PENDIENTES POR CONTACTAR (CON RECORDATORIO PERSISTENTE SI NO FUE POSIBLE CONTACTAR) Y PRÓXIMOS EVENTOS PROGRAMADOS */}
            {(!isAgentAppMode || agentAppTab === 'pendientes') && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                gap: '0.85rem',
                maxInlineSize: '100%'
              }}>
                {/* COLUMNA A: PENDIENTES POR CONTACTAR AHORA Y RECORDATORIOS DE NO CONTACTADOS */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: urgentPendingLeads.length > 0 ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '14px',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  minInlineSize: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderBlockEnd: '1px solid rgba(245, 158, 11, 0.25)', paddingBlockEnd: '0.45rem' }}>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#fbbf24' }}>
                        🚨 Tareas Pendientes / Toca Contactar Ahora
                      </div>
                      <div style={{ fontSize: '0.71rem', color: '#94a3b8' }}>
                        Si un lead no pudo ser contactado, sigue apareciendo aquí para recordarte hasta lograr el contacto.
                      </div>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: urgentPendingLeads.length > 0 ? 'rgba(239, 68, 68, 0.22)' : 'rgba(74, 222, 128, 0.18)',
                      color: urgentPendingLeads.length > 0 ? '#fca5a5' : '#4ade80',
                      fontSize: '0.78rem',
                      fontWeight: '800'
                    }}>
                      {urgentPendingLeads.length}
                    </span>
                  </div>

                  {urgentPendingLeads.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#4ade80', fontSize: '0.78rem', fontWeight: '600', background: 'rgba(74, 222, 128, 0.06)', borderRadius: '10px' }}>
                      ✅ ¡Al día! No tienes contactos vencidos ni llamadas pendientes sin atender en este momento.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.6rem', maxBlockSize: '440px', overflowY: 'auto' }}>
                      {urgentPendingLeads.map(({ call: item, meta }) => {
                        const cid = item.id || item._id;
                        const cPhone = String(item.clientPhone || item.phone || '').replace(/[^0-9]/g, '');
                        const st = CALL_STATUS_LABELS[item.status || 'pendiente'] || CALL_STATUS_LABELS.pendiente;
                        const rawUnitsStr = String(item.units || 'Por confirmar');
                        const compactUnitsLabel = /casa|apto|apartamento|vivienda|unid/i.test(rawUnitsStr)
                          ? rawUnitsStr
                          : `${rawUnitsStr} viv.`;

                        return (
                          <div
                            key={cid}
                            onClick={() => handleSelectLeadFromTunnel(cid)}
                            style={{
                              background: 'rgba(6, 13, 24, 0.92)',
                              border: `1px solid ${meta.borderColor}`,
                              borderRadius: '10px',
                              padding: '0.75rem',
                              display: 'grid',
                              gap: '0.35rem',
                              cursor: 'pointer',
                              minInlineSize: 0
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '999px', background: meta.badgeBg, color: meta.badgeColor }}>
                                {meta.reasonBadge}
                              </span>
                              <span style={{ fontSize: '0.66rem', fontWeight: '700', padding: '0.12rem 0.45rem', borderRadius: '999px', background: st.bg, color: st.color }}>
                                {st.label}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#fff', overflowWrap: 'anywhere' }}>
                              🏢 {item.condoName || 'Condominio'} ({compactUnitsLabel} • {item.city || 'Venezuela'})
                            </div>

                            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', overflowWrap: 'anywhere' }}>
                              👤 {item.clientName || 'Interesado'} {cPhone ? `• 📞 +${cPhone}` : ''}
                              {!isAgentAppMode && item.assignedAgentName ? ` • 👨‍💼 ${item.assignedAgentName}` : ''}
                            </div>

                            <div style={{ fontSize: '0.73rem', color: '#fde68a', background: 'rgba(245, 158, 11, 0.1)', padding: '0.3rem 0.5rem', borderRadius: '6px', overflowWrap: 'anywhere' }}>
                              📌 <strong>Acción pendiente:</strong> {(item.nextTask || item.callTimeLabel || 'Llamar o escribir para presentar Demo').replace(/\(https?:\/\/[^)]+\)/g, '')}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 105px), 1fr))', gap: '0.35rem', marginBlockStart: '0.2rem' }}>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openOutcomeAndCallModal(item, 'llamada', true);
                                }}
                                style={{ padding: '0.42rem', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.45)', background: 'rgba(2, 132, 199, 0.25)', color: '#38bdf8', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                📞 Llamar
                              </button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openOutcomeAndCallModal(item, 'whatsapp', true);
                                }}
                                style={{ padding: '0.42rem', borderRadius: '6px', border: '1px solid rgba(74,222,128,0.45)', background: 'rgba(22, 163, 74, 0.22)', color: '#4ade80', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                💬 WhatsApp
                              </button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleQuickNoAnswer(item);
                                }}
                                style={{ padding: '0.42rem', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                📵 No contestó
                              </button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openOutcomeAndCallModal(item, 'llamada', false);
                                }}
                                style={{ padding: '0.42rem', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.45)', background: 'rgba(245, 158, 11, 0.18)', color: '#fde68a', fontSize: '0.71rem', fontWeight: '800', cursor: 'pointer' }}
                              >
                                ✅ Resultado
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* COLUMNA B: PRÓXIMOS EVENTOS Y LLAMADAS PROGRAMADAS */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '14px',
                  padding: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  minInlineSize: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderBlockEnd: '1px solid rgba(56, 189, 248, 0.2)', paddingBlockEnd: '0.45rem' }}>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#38bdf8' }}>
                        📅 Próximos Eventos y Llamadas Programadas
                      </div>
                      <div style={{ fontSize: '0.71rem', color: '#94a3b8' }}>
                        Agenda de próximas llamadas, demos en vivo, seguimientos de cotización y asambleas.
                      </div>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '999px',
                      background: 'rgba(56, 189, 248, 0.18)',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: '800'
                    }}>
                      {upcomingScheduledLeads.length}
                    </span>
                  </div>

                  {upcomingScheduledLeads.length === 0 ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.76rem', background: 'rgba(6, 13, 24, 0.5)', borderRadius: '10px' }}>
                      📅 No hay eventos programados para fechas futuras. Cuando agendes una próxima llamada o visita, aparecerá aquí ordenada por fecha.
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.6rem', maxBlockSize: '440px', overflowY: 'auto' }}>
                      {upcomingScheduledLeads.map(({ call: item }) => {
                        const cid = item.id || item._id;
                        const cPhone = String(item.clientPhone || item.phone || '').replace(/[^0-9]/g, '');
                        const st = CALL_STATUS_LABELS[item.status || 'pendiente'] || CALL_STATUS_LABELS.pendiente;
                        return (
                          <div
                            key={cid}
                            onClick={() => handleSelectLeadFromTunnel(cid)}
                            style={{
                              background: 'rgba(6, 13, 24, 0.88)',
                              border: '1px solid rgba(56, 189, 248, 0.28)',
                              borderRadius: '10px',
                              padding: '0.72rem',
                              display: 'grid',
                              gap: '0.32rem',
                              cursor: 'pointer',
                              minInlineSize: 0
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#38bdf8' }}>
                                🗓️ {item.callTimeLabel || 'Próximo seguimiento'}
                              </span>
                              <span style={{ fontSize: '0.66rem', fontWeight: '700', padding: '0.12rem 0.45rem', borderRadius: '999px', background: st.bg, color: st.color }}>
                                {st.label}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#fff', overflowWrap: 'anywhere' }}>
                              🏢 {item.condoName || 'Condominio'} ({item.city || 'Venezuela'})
                            </div>

                            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', overflowWrap: 'anywhere' }}>
                              👤 {item.clientName || 'Interesado'} {cPhone ? `(+${cPhone})` : ''}
                              {!isAgentAppMode && item.assignedAgentName ? ` • 👨‍💼 ${item.assignedAgentName}` : ''}
                            </div>

                            {item.nextTask && (
                              <div style={{ fontSize: '0.72rem', color: '#94a3b8', overflowWrap: 'anywhere' }}>
                                📌 {item.nextTask.replace(/\(https?:\/\/[^)]+\)/g, '')}
                              </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.35rem', marginBlockStart: '0.2rem' }}>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openOutcomeAndCallModal(item, 'llamada', true);
                                }}
                                style={{ padding: '0.36rem', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.16)', color: '#38bdf8', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                📞 Llamar
                              </button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openOutcomeAndCallModal(item, 'whatsapp', true);
                                }}
                                style={{ padding: '0.36rem', borderRadius: '6px', border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.16)', color: '#4ade80', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                💬 WhatsApp
                              </button>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  openOutcomeAndCallModal(item, 'llamada', false);
                                }}
                                style={{ padding: '0.36rem', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.16)', color: '#fde68a', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                ✅ Resultado
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. TÚNEL DE VENTAS CRM Y ETAPAS DE LOS LEADS (VISIBLE SIEMPRE EN CEO Y EN APP DEL AGENTE) */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBlockEnd: '0.6rem' }}>
                <h2 style={{ fontSize: '0.96rem', fontWeight: '800', margin: 0, color: '#e2e8f0' }}>
                  📊 {isAgentAppMode ? 'Mi Túnel de Ventas y Etapas de Mis Leads' : 'Túnel de Ventas CRM de la Empresa'} ({filteredSalesCalls.length})
                </h2>
                {isAgentAppMode && (
                  <input
                    type="search"
                    aria-label="Buscar en mis leads"
                    placeholder="🔍 Buscar en mis leads..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      inlineSize: '100%',
                      maxInlineSize: '220px',
                      padding: '0.36rem 0.65rem',
                      borderRadius: '8px',
                      background: '#0f172a',
                      color: '#fff',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 215px), 1fr))',
                gap: '0.7rem',
                maxInlineSize: '100%'
              }}>
                {CRM_TUNNEL_COLUMNS.map(col => {
                  const colLeads = filteredSalesCalls.filter(c => col.match.includes(c.status || 'pendiente'));
                  return (
                    <div key={col.id} style={{
                      background: 'rgba(15, 23, 42, 0.88)',
                      border: `1px solid ${col.color}44`,
                      borderRadius: '12px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.55rem',
                      minInlineSize: 0,
                      maxBlockSize: '500px',
                      overflowY: 'auto'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBlockEnd: `2px solid ${col.color}`, paddingBlockEnd: '0.35rem' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: '800', color: col.color }}>{col.title}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', padding: '0.08rem 0.45rem', borderRadius: '999px', background: col.bg, color: col.color }}>
                          {colLeads.length}
                        </span>
                      </div>

                      {colLeads.length === 0 ? (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', padding: '0.35rem 0' }}>
                          Sin leads en esta etapa
                        </div>
                      ) : (
                        colLeads.map(item => {
                          const cid = item.id || item._id;
                          const cPhone = String(item.clientPhone || item.phone || '').replace(/[^0-9]/g, '');
                          const isLeadSelected = selectedLeadId === cid;
                          const rawUnitsStr = String(item.units || 'Por confirmar');
                          const compactUnitsLabel = /casa|apto|apartamento|vivienda|unid/i.test(rawUnitsStr)
                            ? rawUnitsStr
                            : `${rawUnitsStr} viv.`;
                          const isNoAnswer = item.lastOutcomeType === 'no_contesto';

                          return (
                            <div
                              key={cid}
                              onClick={() => handleSelectLeadFromTunnel(cid)}
                              style={{
                                background: isLeadSelected ? 'rgba(14, 165, 233, 0.18)' : 'rgba(6, 13, 24, 0.88)',
                                border: isLeadSelected
                                  ? '2px solid #0ea5e9'
                                  : isNoAnswer
                                  ? '1px solid rgba(239, 68, 68, 0.5)'
                                  : '1px solid rgba(148, 163, 184, 0.25)',
                                borderRadius: '10px',
                                padding: '0.68rem',
                                display: 'grid',
                                gap: '0.3rem',
                                cursor: 'pointer',
                                minInlineSize: 0
                              }}
                            >
                              {isNoAnswer && (
                                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#fca5a5', background: 'rgba(239, 68, 68, 0.18)', padding: '0.12rem 0.4rem', borderRadius: '4px', justifySelf: 'start' }}>
                                  🚨 No contestó — Reintentar
                                </span>
                              )}
                              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#fff', overflowWrap: 'anywhere' }}>
                                🏢 {item.condoName || 'Condominio'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: '600', overflowWrap: 'anywhere' }}>
                                🏘️ {compactUnitsLabel} • 📍 {item.city || 'Venezuela'}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', overflowWrap: 'anywhere' }}>
                                👤 {item.clientName || 'Interesado'} {cPhone ? `(+${cPhone})` : ''}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '0.2rem 0.45rem', borderRadius: '6px', overflowWrap: 'anywhere' }}>
                                🕒 {item.callTimeLabel || 'Contacto pendiente'}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBlockStart: '0.25rem' }}>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    openOutcomeAndCallModal(item, 'llamada', true);
                                  }}
                                  style={{ padding: '0.38rem', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.18)', color: '#38bdf8', fontSize: '0.71rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  📞 Llamar
                                </button>
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    openOutcomeAndCallModal(item, 'whatsapp', true);
                                  }}
                                  style={{ padding: '0.38rem', borderRadius: '6px', border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.18)', color: '#4ade80', fontSize: '0.71rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  💬 WhatsApp
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: DEPARTAMENTO TÉCNICO (SOPORTE)
            =================================================================== */}
        {!isAgentAppMode && activeTab === 'soporte' && (
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
        {!isAgentAppMode && activeTab === 'chats' && (
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
            TAB 4: ORGANIGRAMA, ROLES, ZONAS ASIGNADAS (PASO 3) Y FUNCIONES
            =================================================================== */}
        {!isAgentAppMode && activeTab === 'usuarios' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Listado del Organigrama, Zonas y Funciones */}
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginTop: 0 }}>
                👥 Equipo Real de IA Condo y Asignación de Zonas Geográficas (Paso 3)
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                Aquí el CEO selecciona qué zonas del país atiende cada Agente Comercial y define las funciones de cada miembro del equipo.
              </p>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {users.map(u => {
                  const rb = ROLE_LABELS[u.role] || ROLE_LABELS.ventas;
                  const userId = u.id || u._id;
                  const isActive = u.active !== false;
                  const uZones = Array.isArray(u.assignedZones) && u.assignedZones.length > 0
                    ? u.assignedZones
                    : ['gran_caracas', 'central', 'centro_occidental', 'zulia_andes', 'oriental', 'guayana', 'nacional'];
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

                          {/* ZONAS ASIGNADAS A ESTE AGENTE */}
                          <div style={{ margin: '0.45rem 0', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {VENEZUELA_ZONES.filter(z => uZones.includes(z.id)).map(z => (
                              <span key={z.id} style={{
                                padding: '0.18rem 0.55rem',
                                borderRadius: '6px',
                                background: 'rgba(56, 189, 248, 0.14)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                fontSize: '0.71rem',
                                fontWeight: '700'
                              }}>
                                {z.label}
                              </span>
                            ))}
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.35rem' }}>🔑 Acceso: <code>{u.email}</code></div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>📅 Agenda (.ics): <code>{u.calendarEmail || u.email}</code> • 📱 Alertas Móvil: <code>{u.whatsappPhone || u.phone || 'Por configurar'}</code></div>
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
                                assignedZones: uZones,
                                active: isActive
                              })}
                              style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: 'none', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              ✏️ Editar Zonas / Datos
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

            {/* Formulario para Registrar / Editar Integrante, Zonas y Definir Funciones */}
            <div style={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '16px', padding: '1.5rem', alignSelf: 'start' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: 0 }}>
                {userForm.id ? '✏️ Editar Integrante y Zonas Asignadas' : '➕ Agregar Nuevo Miembro (Comercial por Zona, Director, Técnico o IA)'}
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
                      placeholder="Ej. Carlos Mendoza"
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
                      <option value="ventas">📈 Agente Comercial (Recibe Leads según sus Zonas Asignadas)</option>
                      <option value="director">📊 Director del Equipo Comercial y Operaciones (Supervisa Conversión y SLA)</option>
                      <option value="ia_implementacion">🤖 Agente IA de Implementación (Solicita Censo, Alícuotas y Bancos)</option>
                      <option value="programacion">💻 Programación e Implementación (Configura Condominio en app.iacondo.com)</option>
                      <option value="soporte">🛠️ Departamento de Soporte Técnico (Atiende Tickets de Condominios)</option>
                      <option value="administracion">💳 Administración y Facturación (Cobro % sobre Movimientos o Fijo)</option>
                      <option value="admin">👑 CEO & Dirección General (Control Total del Ecosistema)</option>
                    </select>
                  </div>

                  {/* PASO 3: SELECTOR DE ZONAS GEOGRÁFICAS DEL PAÍS ASIGNADAS POR EL CEO */}
                  <div style={{
                    padding: '0.85rem',
                    borderRadius: '10px',
                    background: 'rgba(6, 13, 24, 0.85)',
                    border: '1px solid rgba(56, 189, 248, 0.35)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#38bdf8' }}>
                        🗺️ Selector de Zonas del País Asignadas (Paso 3):
                      </span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={() => setUserForm({ ...userForm, assignedZones: VENEZUELA_ZONES.map(z => z.id) })}
                          style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(56,189,248,0.18)', color: '#38bdf8', border: 'none', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Seleccionar Todas
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserForm({ ...userForm, assignedZones: ['gran_caracas'] })}
                          style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', background: 'rgba(148,163,184,0.18)', color: '#cbd5e1', border: 'none', fontSize: '0.7rem', cursor: 'pointer' }}
                        >
                          Solo Gran Caracas
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '0.38rem' }}>
                      {VENEZUELA_ZONES.map(zone => {
                        const checked = (userForm.assignedZones || []).includes(zone.id);
                        return (
                          <label key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: checked ? '#fff' : '#94a3b8', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => {
                                const current = Array.isArray(userForm.assignedZones) ? userForm.assignedZones : [];
                                const next = e.target.checked
                                  ? [...new Set([...current, zone.id])]
                                  : current.filter(z => z !== zone.id);
                                setUserForm({ ...userForm, assignedZones: next });
                              }}
                            />
                            <span>{zone.label}</span>
                          </label>
                        );
                      })}
                    </div>
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

                  <div style={{
                    padding: '0.65rem 0.8rem',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    fontSize: '0.75rem',
                    color: '#cbd5e1',
                    lineHeight: '1.4'
                  }}>
                    💡 <strong style={{ color: '#34d399' }}>Usuarios Ilimitados sin gastar buzones en IONOS:</strong> El <strong>Correo de Login</strong> es un usuario interno de <code>panel.iacondo.com</code> (puedes autogenerarle <code>nombre@iacondo.com</code> aquí mismo sin crearlo en IONOS, o usar su Gmail). En <strong>Correo Agenda (.ics)</strong> coloca su <code>@gmail.com</code> o <code>@icloud.com</code> personal para que le suenen las alarmas en su celular.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', gap: '0.3rem' }}>
                        <label htmlFor="user-email" style={{ fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1' }}>
                          Usuario / Correo de Login *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const slug = String(userForm.name || 'agente')
                              .normalize('NFD')
                              .replace(/[\u0300-\u036f]/g, '')
                              .toLowerCase()
                              .replace(/[^a-z0-9\s]/g, '')
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .join('.');
                            setUserForm({ ...userForm, email: `${slug || 'agente'}@iacondo.com` });
                          }}
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '5px',
                            background: 'rgba(56, 189, 248, 0.18)',
                            color: '#38bdf8',
                            border: '1px solid rgba(56, 189, 248, 0.35)',
                            fontSize: '0.68rem',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ⚡ Autogenerar @iacondo.com
                        </button>
                      </div>
                      <input
                        id="user-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="andres.hofle@iacondo.com o su Gmail"
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
                        placeholder="Clave de acceso al panel"
                        value={userForm.password}
                        onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label htmlFor="user-calendar" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        Correo Personal en Celular (Agenda .ics) *
                      </label>
                      <input
                        id="user-calendar"
                        name="calendarEmail"
                        type="email"
                        required
                        placeholder="Ej. sucorreo@gmail.com o @icloud.com"
                        value={userForm.calendarEmail}
                        onChange={e => setUserForm({ ...userForm, calendarEmail: e.target.value })}
                        style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                      />
                    </div>

                    <div>
                      <label htmlFor="user-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.3rem' }}>
                        WhatsApp Celular para Alertas (Paso 4) *
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
                    💾 Guardar Integrante, Zonas y Alertas en IA Condo
                  </button>
                </fieldset>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: ENTRENAMIENTO DE SOFÍA IA Y CATÁLOGO DE AGENTES
            =================================================================== */}
        {!isAgentAppMode && activeTab === 'ia' && (
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

      {/* =====================================================================
          MODAL 1 (PASO 1): REGISTRAR NUEVO LEAD MANUALMENTE DESDE EL PANEL
          ===================================================================== */}
      <dialog ref={newLeadDialogRef} aria-labelledby="new-lead-dialog-title">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(148,163,184,0.2)', paddingBottom: '0.75rem' }}>
          <div>
            <h2 id="new-lead-dialog-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#38bdf8' }}>
              ➕ Registrar Nuevo Lead en el CRM de IA Condo (Paso 1)
            </h2>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
              El sistema detectará la zona geográfica, lo asignará al agente comercial correspondiente y enviará alerta al celular y calendario (.ics).
            </p>
          </div>
          <button
            type="button"
            onClick={() => newLeadDialogRef.current?.close()}
            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', padding: '0.35rem 0.7rem', cursor: 'pointer', fontWeight: '700' }}
          >
            ✕ Cerrar
          </button>
        </div>

        <form onSubmit={handleCreateManualLead} style={{ display: 'grid', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="nl-condo" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                1. Nombre del Condominio o Conjunto *
              </label>
              <input
                id="nl-condo"
                type="text"
                required
                placeholder="Ej. Residencias Altamira Suites"
                value={newLeadForm.condoName}
                onChange={e => setNewLeadForm({ ...newLeadForm, condoName: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
              />
            </div>

            <div>
              <label htmlFor="nl-units" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                2. Cantidad de Viviendas (Apto/Casas) *
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  id="nl-units"
                  type="text"
                  required
                  placeholder="Ej. 64"
                  value={newLeadForm.units}
                  onChange={e => setNewLeadForm({ ...newLeadForm, units: e.target.value })}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                />
                <select
                  aria-label="Tipo de vivienda"
                  value={newLeadForm.unitType}
                  onChange={e => setNewLeadForm({ ...newLeadForm, unitType: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                >
                  <option value="Apartamentos">Apartamentos</option>
                  <option value="Casas">Casas / Townhouses</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="nl-access" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                3. ¿Tiene Control de Acceso? (Para Demo Personalizado) *
              </label>
              <select
                id="nl-access"
                value={newLeadForm.hasAccessControl}
                onChange={e => setNewLeadForm({ ...newLeadForm, hasAccessControl: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)', fontWeight: '600' }}
              >
                <option value="Sí (Portón / Garita)">✅ Sí tiene Control de Acceso (Portón / Garita)</option>
                <option value="No">❌ No tiene Control de Acceso</option>
              </select>
            </div>

            <div>
              <label htmlFor="nl-zone" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                Ciudad y Zona Geográfica (Paso 3) *
              </label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input
                  id="nl-zone"
                  type="text"
                  required
                  placeholder="Ej. Caracas, Valencia..."
                  value={newLeadForm.city}
                  onChange={e => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                />
                <select
                  aria-label="Zona de Venezuela"
                  value={newLeadForm.zone}
                  onChange={e => setNewLeadForm({ ...newLeadForm, zone: e.target.value })}
                  style={{ maxWidth: '175px', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.35)', fontSize: '0.78rem' }}
                >
                  <option value="">Auto-detectar por ciudad</option>
                  {VENEZUELA_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="nl-client" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                Persona de Contacto *
              </label>
              <input
                id="nl-client"
                type="text"
                required
                placeholder="Nombre y Apellido"
                value={newLeadForm.clientName}
                onChange={e => setNewLeadForm({ ...newLeadForm, clientName: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
              />
            </div>

            <div>
              <label htmlFor="nl-phone" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                Teléfono / WhatsApp *
              </label>
              <input
                id="nl-phone"
                type="tel"
                inputMode="tel"
                required
                placeholder="Ej. +584141234567"
                value={newLeadForm.clientPhone}
                onChange={e => setNewLeadForm({ ...newLeadForm, clientPhone: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
              />
            </div>

            <div>
              <label htmlFor="nl-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                Correo Electrónico
              </label>
              <input
                id="nl-email"
                type="email"
                placeholder="contacto@condominio.com"
                value={newLeadForm.email}
                onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', padding: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <div>
              <label htmlFor="nl-date" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.25rem' }}>
                📅 Fecha para Llamar / Contactar
              </label>
              <input
                id="nl-date"
                type="date"
                value={newLeadForm.contactDate}
                onChange={e => setNewLeadForm({ ...newLeadForm, contactDate: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
              />
            </div>

            <div>
              <label htmlFor="nl-time" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.25rem' }}>
                ⏰ Hora del Contacto
              </label>
              <input
                id="nl-time"
                type="time"
                value={newLeadForm.contactTime}
                onChange={e => setNewLeadForm({ ...newLeadForm, contactTime: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
              />
            </div>

            <div>
              <label htmlFor="nl-channel" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#38bdf8', marginBottom: '0.25rem' }}>
                📱 Vía de Contacto Concertada
              </label>
              <select
                id="nl-channel"
                value={newLeadForm.contactChannel}
                onChange={e => setNewLeadForm({ ...newLeadForm, contactChannel: e.target.value })}
                style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
              >
                <option value="llamada">📞 Llamada Telefónica</option>
                <option value="whatsapp">💬 Mensaje de WhatsApp</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="nl-notes" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
              Notas o Requerimientos del Condominio
            </label>
            <textarea
              id="nl-notes"
              rows={2}
              placeholder="Ej. Junta de condominio interesada en automatizar recibos y conciliación bancaria..."
              value={newLeadForm.notes}
              onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              onClick={() => newLeadDialogRef.current?.close()}
              style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: 'none', fontWeight: '700', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{ padding: '0.7rem 1.4rem', borderRadius: '8px', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
            >
              🚀 Crear Lead, Asignar por Zona y Enviar Alerta al Celular
            </button>
          </div>
        </form>
      </dialog>

      {/* =====================================================================
          MODAL 2 (PASOS 5 Y 6): LLAMADA + TRANSCRIPCIÓN EN VIVO CON IA +
          RESULTADO DEL CONTACTO Y RE-AGENDAMIENTO EN EL CALENDARIO DEL AGENTE
          ===================================================================== */}
      <dialog ref={outcomeDialogRef} aria-labelledby="outcome-dialog-title">
        {activeOutcomeCall && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid rgba(148,163,184,0.2)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 id="outcome-dialog-title" style={{ margin: 0, fontSize: '1.18rem', fontWeight: '800', color: '#38bdf8' }}>
                  📞 Contacto Comercial, Transcripción IA y Resultado — {activeOutcomeCall.condoName || 'Condominio'}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  👤 Contacto: <strong>{activeOutcomeCall.clientName || 'Interesado'}</strong> • 📱 Teléfono: <strong>+{String(activeOutcomeCall.clientPhone || activeOutcomeCall.phone || '').replace(/[^0-9]/g, '')}</strong> • 🏘️ {activeOutcomeCall.units || 'Por confirmar'} unid.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isRecordingSpeech && speechRecRef.current) {
                    try { speechRecRef.current.stop(); } catch { /* ignore */ }
                    setIsRecordingSpeech(false);
                  }
                  outcomeDialogRef.current?.close();
                }}
                style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '8px', padding: '0.35rem 0.7rem', cursor: 'pointer', fontWeight: '700' }}
              >
                ✕ Cerrar
              </button>
            </div>

            {/* SECCIÓN SUPERIOR (PASO 6): TRANSCRIPCIÓN DE LA LLAMADA EN VIVO O SUBIDA DE AUDIO + RESUMEN IA */}
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(88, 28, 135, 0.18)',
              border: '1px solid rgba(192, 132, 252, 0.4)',
              marginBottom: '1.1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#e9d5ff' }}>
                  🎙️ PASO 6: TRANSCRIPCIÓN DE LA LLAMADA Y EXTRACCIÓN DE RESUMEN CON IA (GEMINI FLASH)
                </div>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleToggleLiveTranscription}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: isRecordingSpeech ? '#ef4444' : '#9333ea',
                      color: '#fff',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isRecordingSpeech ? '🛑 Detener Transcripción en Vivo (Grabando...)' : '🎙️ Iniciar Transcripción por Micrófono'}
                  </button>

                  <label style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid rgba(56, 189, 248, 0.45)',
                    color: '#38bdf8',
                    fontWeight: '700',
                    fontSize: '0.76rem',
                    cursor: 'pointer'
                  }}>
                    🎧 Subir Grabación de Audio
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUploadForAi}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <button
                    type="button"
                    disabled={aiTranscribing}
                    onClick={handleGenerateAiSummary}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(74, 222, 128, 0.5)',
                      background: 'rgba(22, 163, 74, 0.25)',
                      color: '#4ade80',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {aiTranscribing ? '⏳ Procesando con Gemini IA...' : '🧠 Extraer Resumen Ejecutivo con IA'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="oc-transcript" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                    Transcripción completa de la conversación (o dicta / pega aquí):
                  </label>
                  <textarea
                    id="oc-transcript"
                    rows={4}
                    placeholder="Pulsa 'Iniciar Transcripción por Micrófono' durante la llamada en altavoz o escribe aquí lo conversado con el cliente..."
                    value={outcomeForm.rawTranscript}
                    onChange={e => setOutcomeForm({ ...outcomeForm, rawTranscript: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.78rem' }}
                  />
                </div>

                <div>
                  <label htmlFor="oc-aisummary" style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#e9d5ff', marginBottom: '0.25rem' }}>
                    🧠 Resumen Ejecutivo extraído por IA (Acuerdos, Dudas y Compromisos):
                  </label>
                  <textarea
                    id="oc-aisummary"
                    rows={4}
                    placeholder="Al pulsar 'Extraer Resumen Ejecutivo con IA', Gemini Flash resumirá aquí todos los puntos clave de la llamada..."
                    value={outcomeForm.aiSummary}
                    onChange={e => setOutcomeForm({ ...outcomeForm, aiSummary: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#f3e8ff', border: '1px solid rgba(192,132,252,0.4)', fontSize: '0.78rem' }}
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN INFERIOR (PASO 5): RESULTADO DEL CONTACTO Y RE-AGENDAMIENTO AUTOMÁTICO */}
            <form onSubmit={handleSubmitContactOutcome} style={{ display: 'grid', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="oc-method" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                    Vía del Contacto Realizado
                  </label>
                  <select
                    id="oc-method"
                    value={outcomeForm.contactMethod}
                    onChange={e => setOutcomeForm({ ...outcomeForm, contactMethod: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                  >
                    <option value="llamada">📞 Llamada Telefónica</option>
                    <option value="whatsapp">💬 Conversación por WhatsApp</option>
                    <option value="videollamada">💻 Videollamada / Demo en Vivo</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="oc-outcome" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#4ade80', marginBottom: '0.25rem' }}>
                    ¿Cuál fue el Resultado de este Contacto? (Paso 5 y Actualización del Túnel Paso 7) *
                  </label>
                  <select
                    id="oc-outcome"
                    value={outcomeForm.outcome}
                    onChange={e => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#060d18', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.45)', fontWeight: '700' }}
                  >
                    {CONTACT_OUTCOME_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* RE-AGENDAMIENTO EN LA AGENDA DEL AGENTE */}
              <div style={{
                padding: '0.85rem',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.4)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fbbf24', marginBottom: '0.45rem' }}>
                  📅 ¿Requiere volver a contactar o agendar el Demo / Seguimiento? (Genera alarma .ics y notificación al celular):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label htmlFor="oc-nextdate" style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                      Fecha del Próximo Contacto
                    </label>
                    <input
                      id="oc-nextdate"
                      type="date"
                      value={outcomeForm.nextContactDate}
                      onChange={e => setOutcomeForm({ ...outcomeForm, nextContactDate: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="oc-nexttime" style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                      Hora del Próximo Contacto
                    </label>
                    <input
                      id="oc-nexttime"
                      type="time"
                      value={outcomeForm.nextContactTime}
                      onChange={e => setOutcomeForm({ ...outcomeForm, nextContactTime: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="oc-nextchan" style={{ display: 'block', fontSize: '0.75rem', color: '#cbd5e1', marginBottom: '0.2rem' }}>
                      Medio para el Próximo Contacto
                    </label>
                    <select
                      id="oc-nextchan"
                      value={outcomeForm.nextContactChannel}
                      onChange={e => setOutcomeForm({ ...outcomeForm, nextContactChannel: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                    >
                      <option value="llamada">📞 Llamar por Teléfono</option>
                      <option value="whatsapp">💬 Escribir por WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label htmlFor="oc-notes" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                    Observaciones adicionales del Agente Comercial
                  </label>
                  <input
                    id="oc-notes"
                    type="text"
                    placeholder="Ej. Solicitaron propuesta formal para presentar el jueves..."
                    value={outcomeForm.notes}
                    onChange={e => setOutcomeForm({ ...outcomeForm, notes: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                  />
                </div>

                <div>
                  <label htmlFor="oc-nexttask" style={{ display: 'block', fontSize: '0.78rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '0.25rem' }}>
                    Próxima Tarea Obligatoria (Se actualiza automáticamente o personalízala)
                  </label>
                  <input
                    id="oc-nexttask"
                    type="text"
                    placeholder="Se generará automáticamente según el resultado si lo dejas en blanco"
                    value={outcomeForm.nextTask}
                    onChange={e => setOutcomeForm({ ...outcomeForm, nextTask: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', background: '#060d18', color: '#fff', border: '1px solid rgba(148,163,184,0.3)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => outcomeDialogRef.current?.close()}
                  style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', background: 'rgba(148,163,184,0.15)', color: '#cbd5e1', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.7rem 1.5rem', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)', color: '#fff', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                >
                  ✅ Guardar Resultado, Transcripción IA y Actualizar Túnel CRM / Agenda
                </button>
              </div>
            </form>
          </div>
        )}
      </dialog>
    </div>
  );
}
