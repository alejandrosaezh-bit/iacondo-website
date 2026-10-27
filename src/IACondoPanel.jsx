import React, { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = 'https://condopro-api.onrender.com';
const DEMO_URL = 'https://iacondo.com/demo';

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

  // Selected Session in Live Chat Tab
  const [selectedSession, setSelectedSession] = useState(null);
  const [callFilter, setCallFilter] = useState('todos');
  const [agentFilter, setAgentFilter] = useState('todos');
  const [zoneFilter, setZoneFilter] = useState('todas');
  const [crmViewMode, setCrmViewMode] = useState('ambas'); // 'ambas' | 'tunel' | 'tarjetas'
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
            : '✅ Resultado del contacto, transcripción y etapa del túnel actualizados con éxito'
        );
      } else {
        showToast(`⚠️ ${data.error || 'Error guardando el resultado'}`);
      }
    } catch {
      showToast('⚠️ Error conectando con el servidor al guardar el resultado');
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
        showToast('🗑️ Registro eliminado del panel');
      }
    } catch {
      showToast('⚠️ Error eliminando el registro');
    }
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

  // Filtered lists
  const salesCalls = calls.filter(c => c.intent !== 'support');
  const supportTickets = calls.filter(c => c.intent === 'support');

  const filteredSalesCalls = salesCalls.filter(c => {
    const statusMatch = callFilter === 'todos' || (c.status || 'pendiente') === callFilter;
    const agentMatch = agentFilter === 'todos' || c.assignedAgentEmail === agentFilter;
    const zoneMatch = zoneFilter === 'todas' || (c.zone || 'gran_caracas') === zoneFilter;
    return statusMatch && agentMatch && zoneMatch;
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
          <div style={{ fontSize: '1.35rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <img src="/logo-iacondo.png" alt="Logo IA Condo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
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

        {/* SELECTOR DINÁMICO DE INTEGRANTES REALES REGISTRADOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {users.length > 1 && (
            <>
              <span style={{ fontSize: '0.73rem', color: '#94a3b8', fontWeight: '600' }}>Ver como:</span>
              {users.map(u => (
                <button
                  key={u.id || u.email}
                  type="button"
                  onClick={() => handleQuickSwitchRole(u)}
                  style={{
                    padding: '0.32rem 0.65rem',
                    borderRadius: '8px',
                    border: currentUser.email === u.email ? '1px solid #38bdf8' : '1px solid rgba(148,163,184,0.25)',
                    background: currentUser.email === u.email ? 'rgba(56, 189, 248, 0.22)' : 'rgba(30, 41, 59, 0.6)',
                    color: currentUser.email === u.email ? '#fff' : '#cbd5e1',
                    fontSize: '0.73rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {u.name}
                </button>
              ))}
            </>
          )}

          <button
            type="button"
            onClick={() => newLeadDialogRef.current?.showModal()}
            style={{
              padding: '0.38rem 0.8rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              color: '#fff',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              cursor: 'pointer',
              fontSize: '0.76rem',
              fontWeight: '800',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.35)'
            }}
          >
            ➕ Registrar Nuevo Lead
          </button>

          <button
            type="button"
            onClick={handleRequestMobileNotifications}
            style={{
              padding: '0.38rem 0.75rem',
              borderRadius: '8px',
              background: notifPermission === 'granted' ? 'rgba(74, 222, 128, 0.16)' : 'rgba(245, 158, 11, 0.18)',
              color: notifPermission === 'granted' ? '#4ade80' : '#fbbf24',
              border: notifPermission === 'granted' ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(245, 158, 11, 0.45)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '700'
            }}
          >
            {notifPermission === 'granted' ? '🔔 Alertas Móvil Activas' : '🔔 Activar Alertas Móvil'}
          </button>

          <button
            type="button"
            onClick={handleCheckEmailsNow}
            style={{
              padding: '0.38rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.16)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              cursor: 'pointer',
              fontSize: '0.76rem',
              fontWeight: '700'
            }}
          >
            {loading ? '⏳ Revisando...' : '📬 Revisar Emails Ahora'}
          </button>

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
        {/* PROCESO COMERCIAL DE 8 PASOS IA CONDO */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.75))',
          border: '1px solid rgba(56, 189, 248, 0.28)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#38bdf8' }}>
              ⚡ FLUJO COMERCIAL Y OPERATIVO DE 8 PASOS — IA CONDO:
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Captación Omnicanal → Sofía IA → Asignación por Zonas → Alerta al Celular → Llamada + Transcripción IA → Túnel CRM → Control CEO y Director Comercial
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))', gap: '0.55rem', fontSize: '0.74rem' }}>
            <div style={{ padding: '0.5rem 0.7rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <strong style={{ color: '#fbbf24' }}>Pasos 1 y 2: Captación + Sofía IA</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.12rem' }}>Recibe Lead por Email, WhatsApp, Web o Manual; pide los 3 datos del Demo Personalizado y concierta llamada.</div>
            </div>
            <div style={{ padding: '0.5rem 0.7rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              <strong style={{ color: '#38bdf8' }}>Pasos 3 y 4: Zonas + Alerta Móvil</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.12rem' }}>Asigna según la Zona del país configurada por el CEO y avisa al celular del agente (WhatsApp + Alarma .ics).</div>
            </div>
            <div style={{ padding: '0.5rem 0.7rem', borderRadius: '10px', background: 'rgba(74, 222, 128, 0.12)', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
              <strong style={{ color: '#4ade80' }}>Pasos 5 y 6: Llamada + Resumen IA</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.12rem' }}>El agente llama/escribe desde el panel, transcribe la llamada con IA, registra resultado y re-agenda.</div>
            </div>
            <div style={{ padding: '0.5rem 0.7rem', borderRadius: '10px', background: 'rgba(192, 132, 252, 0.12)', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
              <strong style={{ color: '#c084fc' }}>Pasos 7 y 8: Túnel CRM + Control CEO</strong>
              <div style={{ color: '#cbd5e1', marginTop: '0.12rem' }}>Actualiza la etapa en el Túnel CRM Kanban con visibilidad total para el CEO y Director Comercial.</div>
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
            { id: 'agenda', label: `👑 Túnel CRM, Agenda de Llamadas y Control CEO (${salesCalls.length})` },
            { id: 'usuarios', label: `👥 Equipo Comercial por Zonas, Roles y Funciones (${users.length})` },
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
            TAB 1: PANEL CEO, TÚNEL CRM (PASO 7), CONTROL DIRECTOR (PASO 8) Y AGENDA
            =================================================================== */}
        {activeTab === 'agenda' && (
          <div>
            {/* PASO 8: MATRIZ EJECUTIVA DEL CEO Y DIRECTOR COMERCIAL */}
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
                    👑 Supervisión Ejecutiva (CEO y Director Comercial) — Seguimiento de Solicitudes y Zonas
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                    Filtra por integrante o por zona geográfica del país, o registra un nuevo lead manualmente (Paso 1).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => newLeadDialogRef.current?.showModal()}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ Registrar Nuevo Lead en el CRM
                  </button>
                  {(agentFilter !== 'todos' || zoneFilter !== 'todas' || callFilter !== 'todos') && (
                    <button
                      type="button"
                      onClick={() => {
                        setAgentFilter('todos');
                        setZoneFilter('todas');
                        setCallFilter('todos');
                      }}
                      style={{
                        padding: '0.42rem 0.85rem',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.2)',
                        color: '#38bdf8',
                        border: '1px solid #38bdf8',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      🔄 Limpiar Filtros ({salesCalls.length})
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {users.map(u => {
                  const assignedLeads = salesCalls.filter(c => c.assignedAgentEmail === u.email);
                  const rb = ROLE_LABELS[u.role] || ROLE_LABELS.ventas;
                  const isFiltered = agentFilter === u.email;
                  const userZones = Array.isArray(u.assignedZones) && u.assignedZones.length > 0
                    ? u.assignedZones
                    : ['nacional'];
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
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', marginTop: '0.2rem' }}>
                        🗺️ Zonas: {userZones.includes('nacional') || userZones.length >= 6 ? '🇻🇪 Cobertura Nacional' : `${userZones.length} zona(s) asignada(s)`}
                      </div>
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
                          En guardia esperando próximo lead en su zona
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BARRA DE FILTROS DE ZONA (PASO 3), ETAPA Y MODO DE VISTA DEL TÚNEL CRM (PASO 7) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                  📊 Túnel CRM de IA Condo y Agenda de Llamadas / Seguimiento Comercial
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0.2rem 0 0 0' }}>
                  Llama o escribe directamente desde cada oportunidad, transcribe la llamada con IA, registra el resultado y re-agenda automáticamente.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  aria-label="Filtrar por Zona del País"
                  value={zoneFilter}
                  onChange={e => setZoneFilter(e.target.value)}
                  style={{
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    background: '#0f172a',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    fontSize: '0.78rem',
                    fontWeight: '700'
                  }}
                >
                  <option value="todas">🇻🇪 Todas las Zonas del País</option>
                  {VENEZUELA_ZONES.map(z => (
                    <option key={z.id} value={z.id}>{z.label}</option>
                  ))}
                </select>

                <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '8px', padding: '0.2rem', border: '1px solid rgba(148,163,184,0.2)' }}>
                  {[
                    { id: 'ambas', label: '📊 Túnel + Fichas' },
                    { id: 'tunel', label: '🏛️ Solo Túnel CRM' },
                    { id: 'tarjetas', label: '📋 Solo Fichas' }
                  ].map(vm => (
                    <button
                      key={vm.id}
                      type="button"
                      onClick={() => setCrmViewMode(vm.id)}
                      style={{
                        padding: '0.32rem 0.65rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: crmViewMode === vm.id ? '#0ea5e9' : 'transparent',
                        color: crmViewMode === vm.id ? '#fff' : '#94a3b8',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {vm.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PASO 7: TÚNEL VISUAL TIPO CRM (KANBAN INTERACTIVO POR ETAPAS) */}
            {(crmViewMode === 'ambas' || crmViewMode === 'tunel') && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '0.8rem',
                marginBottom: '1.6rem'
              }}>
                {CRM_TUNNEL_COLUMNS.map(col => {
                  const colLeads = filteredSalesCalls.filter(c => col.match.includes(c.status || 'pendiente'));
                  return (
                    <div key={col.id} style={{
                      background: 'rgba(15, 23, 42, 0.88)',
                      border: `1px solid ${col.color}44`,
                      borderRadius: '14px',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      minHeight: '210px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${col.color}`, paddingBottom: '0.45rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: col.color }}>{col.title}</span>
                        <span style={{ fontSize: '0.74rem', fontWeight: '800', padding: '0.1rem 0.5rem', borderRadius: '999px', background: col.bg, color: col.color }}>
                          {colLeads.length}
                        </span>
                      </div>

                      {colLeads.length === 0 ? (
                        <div style={{ fontSize: '0.73rem', color: '#64748b', textAlign: 'center', padding: '1.5rem 0.4rem' }}>
                          Sin solicitudes en esta etapa
                        </div>
                      ) : (
                        colLeads.map(item => {
                          const cid = item.id || item._id;
                          const cPhone = String(item.clientPhone || item.phone || '').replace(/[^0-9]/g, '');
                          return (
                            <div key={cid} style={{
                              background: 'rgba(6, 13, 24, 0.85)',
                              border: '1px solid rgba(148, 163, 184, 0.22)',
                              borderRadius: '10px',
                              padding: '0.7rem',
                              display: 'grid',
                              gap: '0.35rem'
                            }}>
                              <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#fff' }}>
                                🏢 {item.condoName || 'Condominio'}
                              </div>
                              <div style={{ fontSize: '0.73rem', color: '#38bdf8', fontWeight: '600' }}>
                                🏘️ {item.units || 'Por confirmar'} viv. • 📍 {item.city || 'Venezuela'}
                              </div>
                              <div style={{ fontSize: '0.73rem', color: '#cbd5e1' }}>
                                👤 {item.clientName || 'Interesado'} {cPhone ? `(+$${cPhone.replace(/^\$+/, '')})` : ''}
                              </div>
                              <div style={{ fontSize: '0.7rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.45rem', borderRadius: '6px' }}>
                                🕒 {item.callTimeLabel || 'Contacto pendiente'}
                              </div>
                              <div style={{ fontSize: '0.69rem', color: '#94a3b8' }}>
                                Agente: <strong style={{ color: '#e2e8f0' }}>{item.assignedAgentName || 'Alejandro Sáez'}</strong>
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginTop: '0.25rem' }}>
                                <button
                                  type="button"
                                  onClick={() => openOutcomeAndCallModal(item, 'llamada', true)}
                                  style={{ padding: '0.35rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.18)', color: '#38bdf8', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  📞 Llamar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openOutcomeAndCallModal(item, 'whatsapp', true)}
                                  style={{ padding: '0.35rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.18)', color: '#4ade80', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  💬 WhatsApp
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openOutcomeAndCallModal(item, 'llamada', false)}
                                  style={{ gridColumn: '1 / -1', padding: '0.35rem 0.4rem', borderRadius: '6px', border: '1px solid rgba(192,132,252,0.4)', background: 'rgba(192,132,252,0.18)', color: '#e9d5ff', fontSize: '0.7rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  🎙️ Transcribir / Resultado / Re-Agendar
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
            )}

            {/* FILTROS RÁPIDOS DE ETAPA PARA LAS FICHAS DETALLADAS */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.1rem' }}>
                {[
                  { id: 'todos', label: 'Todas las Etapas' },
                  { id: 'pendiente', label: '1. Contacto Inicial' },
                  { id: 'visita_demo', label: '2. Demo / Visita' },
                  { id: 'cotizacion', label: '3. Cotización (% o Fijo)' },
                  { id: 'en_espera', label: '4. Asamblea / Junta' },
                  { id: 'implementacion', label: '5. Implementación (Diego IA + Dev)' },
                  { id: 'ganado', label: '6. Ganado (Activo)' }
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

            {(crmViewMode === 'ambas' || crmViewMode === 'tarjetas') && (
              filteredSalesCalls.length === 0 ? (
                <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px dashed rgba(148, 163, 184, 0.3)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                  No hay oportunidades en este filtro. Haz clic en <strong>"Todas las Etapas"</strong> o <strong>"Limpiar Filtros"</strong> para ver el pipeline completo.
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
                    const transcripts = Array.isArray(call.callTranscripts) ? call.callTranscripts : [];
                    const zoneObj = VENEZUELA_ZONES.find(z => z.id === call.zone);
                    const zoneBadgeLabel = call.zoneLabel || zoneObj?.label || '📍 Venezuela';

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
                        {/* Columna Izquierda: Datos del Condominio, Zona, Próxima Tarea, Transcripciones y Bitácora */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.76rem', fontWeight: '700', background: st.bg, color: st.color }}>
                                {st.label}
                              </span>
                              <span style={{ padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700', background: 'rgba(56, 189, 248, 0.14)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                                {zoneBadgeLabel}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: '700' }}>
                              👤 Agente Asignado: {call.assignedAgentName || 'Alejandro Sáez'}
                            </span>
                          </div>

                          <div>
                            <h3 style={{ fontSize: '1.22rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: '#fff' }}>
                              🏢 {call.condoName || 'Condominio por confirmar'} — {units} Unidades ({call.city || 'Venezuela'})
                            </h3>
                            <div style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: '600' }}>
                              👤 Contacto: {clientName} • 📞 {cleanPhone ? `+${cleanPhone}` : 'Sin teléfono'} {call.email ? `• ✉️ ${call.email}` : ''} • 🚪 Acceso: {hasAccessControl}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#fbbf24', marginTop: '0.25rem', fontWeight: '700' }}>
                              ⏰ Horario Concertado / Próximo Contacto: {timeLabel}
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
                              <span>⚡ PRÓXIMA TAREA ASIGNADA AL AGENTE ({call.assignedAgentName || 'Alejandro Sáez'}):</span>
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
                              📋 FICHA EJECUTIVA Y RESUMEN DE IA CONDO:
                            </div>
                            <div style={{ fontSize: '0.83rem', color: '#e2e8f0', lineHeight: '1.45', whiteSpace: 'pre-line' }}>
                              {summary}
                            </div>
                          </div>

                          {/* PASO 6: TRANSCRIPCIONES Y RESÚMENES DE LLAMADAS GUARDADOS */}
                          {transcripts.length > 0 && (
                            <div style={{
                              padding: '0.85rem',
                              background: 'rgba(88, 28, 135, 0.18)',
                              border: '1px solid rgba(192, 132, 252, 0.35)',
                              borderRadius: '10px',
                              maxHeight: '175px',
                              overflowY: 'auto'
                            }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#e9d5ff', marginBottom: '0.4rem' }}>
                                🎙️ TRANSCRIPCIONES Y RESÚMENES DE LLAMADAS CON IA ({transcripts.length}):
                              </div>
                              <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {transcripts.slice().reverse().map((tr, idx) => (
                                  <div key={tr.id || idx} style={{ fontSize: '0.76rem', paddingBottom: '0.4rem', borderBottom: '1px dashed rgba(192,132,252,0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c084fc', fontWeight: '700' }}>
                                      <span>🎙️ {tr.actor || 'Agente Comercial'}</span>
                                      <span>{tr.date ? new Date(tr.date).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' }) : ''}</span>
                                    </div>
                                    {tr.summary && (
                                      <div style={{ color: '#f8fafc', marginTop: '0.2rem', whiteSpace: 'pre-line' }}>
                                        <strong>🧠 Resumen IA:</strong> {tr.summary}
                                      </div>
                                    )}
                                    {tr.transcript && (
                                      <div style={{ color: '#cbd5e1', marginTop: '0.2rem', fontStyle: 'italic' }}>
                                        <strong>📝 Transcripción:</strong> "{tr.transcript}"
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

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
                                  <div style={{ color: '#e2e8f0', marginTop: '0.15rem', whiteSpace: 'pre-line' }}>{entry.text}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Columna Derecha: Botones Paso 5 y 6 (Llamar/Escribir + Transcribir + Resultado + Re-Agendar), Etapa y Demo */}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem' }}>
                          {/* PASO 5 Y PASO 6: PANEL DE CONTACTO DIRECTO, TRANSCRIPCIÓN IA Y RE-AGENDAMIENTO */}
                          <div style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.18), rgba(147, 51, 234, 0.15))',
                            border: '1px solid rgba(56, 189, 248, 0.45)'
                          }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#38bdf8', marginBottom: '0.5rem' }}>
                              📞 PASOS 5 Y 6: LLAMAR / ESCRIBIR DESDE EL PANEL + TRANSCRIBIR CON IA + REGISTRAR RESULTADO:
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <button
                                type="button"
                                onClick={() => openOutcomeAndCallModal(call, 'llamada', true)}
                                style={{
                                  padding: '0.7rem 0.75rem',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(56, 189, 248, 0.5)',
                                  background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                                  color: '#fff',
                                  fontWeight: '800',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                📞 Llamar y Transcribir (+{cleanPhone || 'Tel'})
                              </button>

                              <button
                                type="button"
                                onClick={() => openOutcomeAndCallModal(call, 'whatsapp', true)}
                                style={{
                                  padding: '0.7rem 0.75rem',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(34, 197, 94, 0.5)',
                                  background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                                  color: '#fff',
                                  fontWeight: '800',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                💬 Escribir por WhatsApp y Registrar
                              </button>

                              <button
                                type="button"
                                onClick={() => openOutcomeAndCallModal(call, 'llamada', false)}
                                style={{
                                  gridColumn: '1 / -1',
                                  padding: '0.65rem 0.85rem',
                                  borderRadius: '10px',
                                  border: '1px solid rgba(192, 132, 252, 0.55)',
                                  background: 'rgba(147, 51, 234, 0.25)',
                                  color: '#f3e8ff',
                                  fontWeight: '800',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                🎙️ Abrir Transcriptor de Llamada con IA / Cargar Resultado / Re-Agendar en Calendario
                              </button>
                            </div>
                          </div>

                          {/* BOTÓN DE AUTOMATIZACIÓN EN CADENA (HANDOFF AUTOMÁTICO) */}
                          {chainButtonText && (
                            <div style={{
                              padding: '0.85rem',
                              borderRadius: '12px',
                              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(45, 212, 191, 0.12))',
                              border: '1px solid rgba(45, 212, 191, 0.4)'
                            }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2dd4bf', marginBottom: '0.35rem' }}>
                                🔄 AVANCE RÁPIDO EN CADENA (PASO 7):
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAdvanceChainPhase(call)}
                                style={{
                                  width: '100%',
                                  padding: '0.68rem 1rem',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: 'linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)',
                                  color: '#fff',
                                  fontWeight: '800',
                                  fontSize: '0.82rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {chainButtonText}
                              </button>
                            </div>
                          )}

                          {/* SELECTORES MANUALES DE ETAPA, ZONA, FACTURACIÓN Y RESPONSABLE */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                            <div>
                              <label htmlFor={`status-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: '600' }}>
                                Fase del Túnel CRM
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
                              <label htmlFor={`zone-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: '600' }}>
                                📍 Zona Geográfica (Paso 3)
                              </label>
                              <select
                                id={`zone-${callId}`}
                                name="zone"
                                value={call.zone || 'gran_caracas'}
                                onChange={e => {
                                  const zFound = VENEZUELA_ZONES.find(z => z.id === e.target.value);
                                  handleUpdateCall(callId, {
                                    zone: e.target.value,
                                    zoneLabel: zFound ? zFound.label : e.target.value
                                  });
                                }}
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.35)', fontSize: '0.8rem', fontWeight: '600' }}
                              >
                                {VENEZUELA_ZONES.map(z => (
                                  <option key={z.id} value={z.id}>{z.label}</option>
                                ))}
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
                                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0f172a', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.35)', fontSize: '0.8rem', fontWeight: '600' }}
                              >
                                <option value="Sí (Portón / Garita)">✅ Sí tiene Control de Acceso (Portón / Garita)</option>
                                <option value="No">❌ No tiene Control de Acceso</option>
                              </select>
                            </div>

                            <div>
                              <label htmlFor={`agent-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#94a3b8', marginBottom: '0.2rem', fontWeight: '600' }}>
                                Agente Responsable Asignado
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

                          {/* FORMULARIO RÁPIDO PARA NOTA EN LA BITÁCORA */}
                          <div style={{
                            padding: '0.75rem',
                            background: 'rgba(6, 13, 24, 0.7)',
                            borderRadius: '10px',
                            border: '1px solid rgba(56, 189, 248, 0.25)'
                          }}>
                            <label htmlFor={`act-text-${callId}`} style={{ display: 'block', fontSize: '0.73rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: '700' }}>
                              📝 Nota rápida en la bitácora:
                            </label>
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <select
                                aria-label="Tipo de contacto"
                                value={activityTypeDraft[callId] || 'llamada'}
                                onChange={e => setActivityTypeDraft({ ...activityTypeDraft, [callId]: e.target.value })}
                                style={{ padding: '0.45rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.76rem' }}
                              >
                                <option value="llamada">📞 Llamada</option>
                                <option value="whatsapp">💬 WhatsApp</option>
                                <option value="correo">✉️ Correo</option>
                                <option value="demo">🎮 Demo Web</option>
                              </select>
                              <input
                                id={`act-text-${callId}`}
                                type="text"
                                placeholder="Añadir nota rápida..."
                                value={activityTextDraft[callId] || ''}
                                onChange={e => setActivityTextDraft({ ...activityTextDraft, [callId]: e.target.value })}
                                style={{ flex: 1, minWidth: '160px', padding: '0.45rem 0.65rem', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid rgba(148,163,184,0.3)', fontSize: '0.78rem' }}
                              />
                              <button
                                type="button"
                                onClick={() => handleAddActivityLog(callId)}
                                style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', background: '#0ea5e9', color: '#fff', border: 'none', fontWeight: '700', fontSize: '0.76rem', cursor: 'pointer' }}
                              >
                                + Nota
                              </button>
                            </div>
                          </div>

                          {/* ACCIONES RÁPIDAS: ENVIAR DEMO PERSONALIZADO VS DEMO GENERAL POR WHATSAPP */}
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
                                padding: '0.58rem 0.7rem',
                                borderRadius: '8px',
                                background: 'rgba(192, 132, 252, 0.22)',
                                color: '#e9d5ff',
                                border: '1px solid rgba(192, 132, 252, 0.5)',
                                textDecoration: 'none',
                                fontWeight: '800',
                                fontSize: '0.76rem'
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
                                padding: '0.58rem 0.7rem',
                                borderRadius: '8px',
                                background: 'rgba(148, 163, 184, 0.16)',
                                color: '#cbd5e1',
                                border: '1px solid rgba(148, 163, 184, 0.35)',
                                textDecoration: 'none',
                                fontWeight: '700',
                                fontSize: '0.76rem'
                              }}
                            >
                              👀 Enviar Demo General (Sin datos)
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteCall(callId)}
                              style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '0.45rem 0.8rem',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Eliminar Registro del Panel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
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
            TAB 4: ORGANIGRAMA, ROLES, ZONAS ASIGNADAS (PASO 3) Y FUNCIONES
            =================================================================== */}
        {activeTab === 'usuarios' && (
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
                        placeholder="agente@iacondo.com"
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
                        Correo Agenda (.ics en Celular) *
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
