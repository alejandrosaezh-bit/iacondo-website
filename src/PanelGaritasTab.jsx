import React, { useState, useEffect, useCallback } from 'react';

const EMPTY_FORM = {
  _id: null,
  name: '',
  type: 'community',
  phone: '',
  zone: '',
  address: '',
  status: 'active',
  managerCondominiumId: '',
  delegateName: '',
  delegatePhone: '',
  linkedCondominiumIds: [],
  notes: ''
};

const buildWaHref = (phone, text) => {
  const digits = String(phone || '').replace(/\D/g, '');
  let wa = digits;
  if (digits.startsWith('0')) wa = `58${digits.slice(1)}`;
  else if (digits.length === 10) wa = `58${digits}`;
  const base = wa ? `https://wa.me/${wa}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
};

const formatDateShort = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '—';
  }
};

export default function PanelGaritasTab({ apiBase, onCountChange }) {
  const [garitas, setGaritas] = useState([]);
  const [condominiums, setCondominiums] = useState([]);
  const [onboardingRequests, setOnboardingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [condoSearch, setCondoSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadGaritas = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/api/panel/garitas`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error cargando Garitas');
      const list = Array.isArray(data.garitas) ? data.garitas : [];
      setGaritas(list);
      setCondominiums(Array.isArray(data.condominiums) ? data.condominiums : []);
      setOnboardingRequests(Array.isArray(data.onboardingRequests) ? data.onboardingRequests : []);
      if (typeof onCountChange === 'function') {
        onCountChange(list.length);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'No se pudieron cargar las Garitas.' });
    } finally {
      setLoading(false);
    }
  }, [apiBase, onCountChange]);

  useEffect(() => {
    loadGaritas();
  }, [loadGaritas]);

  const openCreateModal = (prefill = {}) => {
    setForm({
      ...EMPTY_FORM,
      ...prefill
    });
    setCondoSearch('');
    setModalOpen(true);
  };

  const openEditModal = (garita) => {
    const approvedIds = (garita.linkedCondominiums || [])
      .filter((l) => l.status === 'approved')
      .map((l) => String(l.condominiumId?._id || l.condominiumId));

    setForm({
      _id: garita._id,
      name: garita.name || '',
      type: garita.type || 'community',
      phone: garita.phone || '',
      zone: garita.zone || '',
      address: garita.address || '',
      status: garita.status || 'active',
      managerCondominiumId: String(garita.managerCondominiumId?._id || garita.managerCondominiumId || ''),
      delegateName: garita.delegateName || '',
      delegatePhone: garita.delegatePhone || '',
      linkedCondominiumIds: approvedIds,
      notes: garita.notes || ''
    });
    setCondoSearch('');
    setModalOpen(true);
  };

  const toggleLinkedCondo = (cid) => {
    const cleanId = String(cid);
    setForm((prev) => {
      const exists = prev.linkedCondominiumIds.includes(cleanId);
      return {
        ...prev,
        linkedCondominiumIds: exists
          ? prev.linkedCondominiumIds.filter((id) => id !== cleanId)
          : [...prev.linkedCondominiumIds, cleanId]
      };
    });
  };

  const handleSaveGarita = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setFeedback({ type: 'error', text: 'El nombre de la Garita es obligatorio.' });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const isEdit = Boolean(form._id);
      const url = isEdit
        ? `${apiBase}/api/panel/garitas/${encodeURIComponent(form._id)}`
        : `${apiBase}/api/panel/garitas`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        name: form.name.trim(),
        type: form.type,
        phone: form.phone.trim(),
        zone: form.zone.trim(),
        address: form.address.trim(),
        status: form.status,
        managerCondominiumId: form.managerCondominiumId || null,
        delegateName: form.delegateName.trim(),
        delegatePhone: form.delegatePhone.trim(),
        linkedCondominiumIds: form.linkedCondominiumIds.filter((id) => id !== form.managerCondominiumId),
        notes: form.notes.trim()
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error guardando Garita');

      setFeedback({ type: 'success', text: data.message || 'Garita guardada correctamente.' });
      setModalOpen(false);
      await loadGaritas();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error guardando la Garita.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGarita = async (garita) => {
    if (!window.confirm(`¿Eliminar definitivamente la Garita "${garita.name}"? Los condominios vinculados quedarán desconectados.`)) return;
    try {
      setFeedback(null);
      const res = await fetch(`${apiBase}/api/panel/garitas/${encodeURIComponent(garita._id)}`, {
        method: 'DELETE'
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Error eliminando Garita');
      setFeedback({ type: 'success', text: data.message || 'Garita eliminada.' });
      await loadGaritas();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Error eliminando Garita.' });
    }
  };

  const handleCopyUrl = async (garita) => {
    if (!garita?.officialGaritaUrl) return;
    try {
      await navigator.clipboard.writeText(garita.officialGaritaUrl);
      setCopiedId(garita._id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch {
      window.prompt('Copia el enlace oficial de la Garita:', garita.officialGaritaUrl);
    }
  };

  const filteredGaritas = garitas.filter((g) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const mgrName = (g.managerCondominiumId?.name || '').toLowerCase();
    const linkedNames = (g.linkedCondominiums || [])
      .map((l) => (l.condominiumId?.name || '').toLowerCase())
      .join(' ');
    return (
      (g.name || '').toLowerCase().includes(q) ||
      (g.phone || '').toLowerCase().includes(q) ||
      (g.zone || '').toLowerCase().includes(q) ||
      mgrName.includes(q) ||
      linkedNames.includes(q)
    );
  });

  const filteredCondosForModal = condominiums.filter((c) => {
    if (String(c._id) === String(form.managerCondominiumId || '')) return false;
    const q = condoSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.serviceZone || c.city || '').toLowerCase().includes(q) ||
      (c.subdomain || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      {/* HEADER */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem'
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '1.12rem', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛡️</span>
            <span>Directorio Maestro de Garitas y Vínculos Multi-Condominio</span>
          </h2>
          <p style={{ margin: '0.28rem 0 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
            Desacopla las Garitas de los condominios: da de alta garitas comunitarias o exclusivas (ej. Calle 8), asigna su condominio gestor y vincula edificios, casas y conjuntos.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Buscar garita, teléfono, zona o edificio..."
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '9px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              background: '#0b1120',
              color: '#fff',
              fontSize: '0.8rem',
              minWidth: '230px'
            }}
          />
          <button
            type="button"
            onClick={loadGaritas}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '9px',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              background: 'rgba(30, 41, 59, 0.85)',
              color: '#cbd5e1',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            🔄 Actualizar
          </button>
          <button
            type="button"
            onClick={() => openCreateModal()}
            style={{
              padding: '0.58rem 1.05rem',
              borderRadius: '9px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
            }}
          >
            ➕ Nueva Garita
          </button>
        </div>
      </div>

      {/* FEEDBACK */}
      {feedback && (
        <div
          style={{
            padding: '0.8rem 1rem',
            borderRadius: '10px',
            border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)'}`,
            background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.14)',
            color: feedback.type === 'error' ? '#fca5a5' : '#6ee7b7',
            fontSize: '0.83rem',
            fontWeight: '700',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* SOLICITUDES DE ALTA DE GARITAS COMUNITARIAS (PENDIENTES DE ONBOARDING POR AGENTE IA) */}
      {onboardingRequests.length > 0 && (
        <div
          style={{
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.45)',
            borderRadius: '14px',
            padding: '1rem 1.15rem'
          }}
        >
          <div style={{ fontWeight: '900', fontSize: '0.88rem', color: '#a5b4fc', marginBottom: '0.65rem' }}>
            🤖 Solicitudes de Alta de Garitas Externas ({onboardingRequests.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '0.7rem' }}>
            {onboardingRequests.map((req) => (
              <div
                key={req.condominiumId}
                style={{
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(129, 140, 248, 0.35)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.9rem' }}>
                  🏢 {req.condoName}
                </div>
                <div style={{ fontSize: '0.77rem', color: '#cbd5e1' }}>
                  📞 Tel. Garita solicitada: <strong style={{ color: '#a5b4fc' }}>{req.requestedGaritaPhone || '—'}</strong>
                  {req.requestedGaritaName ? ` (${req.requestedGaritaName})` : ''}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  {req.serviceZone ? `📍 ${req.serviceZone} · ` : ''}
                  Admin: {req.adminName || 'Junta'} {req.adminPhone ? `(${req.adminPhone})` : ''}
                  {req.requestedAt ? ` · ${formatDateShort(req.requestedAt)}` : ''}
                </div>
                {req.notes && (
                  <div style={{ fontSize: '0.74rem', color: '#e2e8f0', background: 'rgba(255,255,255,0.04)', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                    📝 {req.notes}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() =>
                    openCreateModal({
                      name: req.requestedGaritaName || `Garita Comunitaria (${req.serviceZone || req.condoName})`,
                      type: 'community',
                      phone: req.requestedGaritaPhone || '',
                      zone: req.serviceZone || '',
                      linkedCondominiumIds: [String(req.condominiumId)],
                      notes: req.notes || ''
                    })
                  }
                  style={{
                    marginTop: '0.35rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#6366f1',
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  ➕ Dar de alta esta Garita y vincular a {req.condoName}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTADO DE GARITAS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px' }}>
          ⏳ Cargando directorio maestro de Garitas...
        </div>
      ) : filteredGaritas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '14px', border: '1px dashed rgba(148, 163, 184, 0.25)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🛡️</div>
          <div style={{ fontWeight: '800', color: '#e2e8f0' }}>
            {search ? 'No hay Garitas que coincidan con tu búsqueda.' : 'Aún no hay Garitas registradas en IA Condo.'}
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Crea la primera Garita Comunitaria o Exclusiva con el botón <strong>“➕ Nueva Garita”</strong> para vincular condominios.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
          {filteredGaritas.map((g) => {
            const approved = (g.linkedCondominiums || []).filter((l) => l.status === 'approved');
            const pending = (g.linkedCondominiums || []).filter((l) => l.status === 'pending');
            const guardsCount = Array.isArray(g.guards) ? g.guards.length : 0;

            return (
              <div
                key={g._id}
                style={{
                  background: 'rgba(15, 23, 42, 0.92)',
                  border: `1px solid ${g.type === 'community' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.25)'}`,
                  borderRadius: '14px',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.7rem'
                }}
              >
                {/* Título + Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: '900', fontSize: '1rem', color: '#fff' }}>
                      🛡️ {g.name}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.18rem' }}>
                      {g.phone ? `📞 ${g.phone}` : 'Sin teléfono'}
                      {g.zone ? ` · 📍 ${g.zone}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        padding: '0.18rem 0.5rem',
                        borderRadius: '999px',
                        background: g.type === 'community' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(148, 163, 184, 0.16)',
                        color: g.type === 'community' ? '#38bdf8' : '#cbd5e1'
                      }}
                    >
                      {g.type === 'community' ? '🏘️ COMUNITARIA' : '🏠 EXCLUSIVA'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: '800',
                        padding: '0.18rem 0.5rem',
                        borderRadius: '999px',
                        background: g.status === 'inactive' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(16, 185, 129, 0.16)',
                        color: g.status === 'inactive' ? '#fca5a5' : '#34d399'
                      }}
                    >
                      {g.status === 'inactive' ? 'INACTIVA' : 'ACTIVA'}
                    </span>
                  </div>
                </div>

                {/* Gestor & Vigilantes */}
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', background: 'rgba(30, 41, 59, 0.6)', padding: '0.6rem 0.75rem', borderRadius: '9px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div>
                    🏛️ <strong>Gestor / Paga la Garita:</strong>{' '}
                    <span style={{ color: '#34d399', fontWeight: '700' }}>
                      {g.managerCondominiumId?.name || 'Sin condominio gestor asignado'}
                    </span>
                  </div>
                  {(g.delegateName || g.delegatePhone) && (
                    <div>
                      👤 <strong>Delegado:</strong> {g.delegateName || '—'} {g.delegatePhone ? `(${g.delegatePhone})` : ''}
                    </div>
                  )}
                  <div>
                    👮 <strong>Vigilantes registrados:</strong> {guardsCount}
                    {g.address ? ` · 📌 ${g.address}` : ''}
                  </div>
                </div>

                {/* Condominios Vinculados */}
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Condominios Vinculados ({approved.length + (g.managerCondominiumId ? 1 : 0)})
                    {pending.length > 0 && <span style={{ color: '#fbbf24' }}> · {pending.length} pendientes</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {g.managerCondominiumId?.name && (
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.16)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7' }}>
                        🏛️ {g.managerCondominiumId.name} (Gestor)
                      </span>
                    )}
                    {approved.map((l) => (
                      <span key={l.condominiumId?._id || l.condominiumId} style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', color: '#93c5fd' }}>
                        🏢 {l.condominiumId?.name || 'Condominio'}
                      </span>
                    ))}
                    {pending.map((l) => (
                      <span key={l.condominiumId?._id || l.condominiumId} style={{ fontSize: '0.72rem', fontWeight: '700', padding: '0.2rem 0.55rem', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.16)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}>
                        ⏳ {l.condominiumId?.name || 'Pendiente'}
                      </span>
                    ))}
                    {!g.managerCondominiumId?.name && approved.length === 0 && pending.length === 0 && (
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Sin condominios vinculados todavía</span>
                    )}
                  </div>
                </div>

                {/* Enlace oficial de 1 clic para el teléfono de la Garita */}
                {g.officialGaritaUrl && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.45rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(g)}
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.65rem',
                        borderRadius: '7px',
                        border: '1px solid rgba(16, 185, 129, 0.45)',
                        background: copiedId === g._id ? '#10b981' : 'rgba(16, 185, 129, 0.15)',
                        color: copiedId === g._id ? '#052e16' : '#6ee7b7',
                        fontWeight: '800',
                        fontSize: '0.74rem',
                        cursor: 'pointer'
                      }}
                    >
                      {copiedId === g._id ? '✅ Link Copiado' : '📋 Copiar Link Garita'}
                    </button>
                    <a
                      href={buildWaHref(
                        g.phone,
                        `🛡️ *IA Condo — Acceso Oficial de Garita (${g.name})*\n\nAbre este enlace en el celular de la caseta para activar el escáner QR:\n${g.officialGaritaUrl}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        padding: '0.45rem 0.65rem',
                        borderRadius: '7px',
                        border: 'none',
                        background: '#25D366',
                        color: '#052e16',
                        fontWeight: '900',
                        fontSize: '0.74rem',
                        textDecoration: 'none',
                        textAlign: 'center'
                      }}
                    >
                      📲 Enviar por WhatsApp
                    </a>
                  </div>
                )}

                {/* Acciones Editar / Eliminar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.45rem', borderTop: '1px solid rgba(148, 163, 184, 0.15)' }}>
                  <button
                    type="button"
                    onClick={() => openEditModal(g)}
                    style={{
                      flex: 1,
                      padding: '0.48rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(56, 189, 248, 0.45)',
                      background: 'rgba(56, 189, 248, 0.14)',
                      color: '#7dd3fc',
                      fontWeight: '800',
                      fontSize: '0.77rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✏️ Editar / Vincular Condominios
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGarita(g)}
                    style={{
                      padding: '0.48rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      background: 'rgba(239, 68, 68, 0.12)',
                      color: '#fca5a5',
                      fontWeight: '700',
                      fontSize: '0.77rem',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREAR / EDITAR GARITA Y VINCULAR CONDOMINIOS */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#0f172a',
              border: '1.5px solid rgba(56, 189, 248, 0.45)',
              borderRadius: '18px',
              padding: '1.4rem',
              boxShadow: '0 24px 60px rgba(0,0,0,0.75)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: '900', color: '#fff' }}>
                {form._id ? '✏️ Editar Garita y Condominios Vinculados' : '➕ Registrar Nueva Garita en IA Condo'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#cbd5e1', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGarita} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Nombre de la Garita *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej. Garita Principal Calle 8"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.62rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Tipo de Garita
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.62rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff' }}
                  >
                    <option value="community">🏘️ Comunitaria (Multi-Condominio)</option>
                    <option value="exclusive">🏠 Uso Exclusivo (Un solo Condominio)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Teléfono Oficial de la Garita
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+58 412 0000000"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.62rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Zona / Urbanización
                  </label>
                  <input
                    type="text"
                    value={form.zone}
                    onChange={(e) => setForm((p) => ({ ...p, zone: e.target.value }))}
                    placeholder="Ej. Los Naranjos, Caracas"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.62rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Dirección / Ubicación
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Ej. Entrada Calle 8"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.62rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Estado
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.62rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff' }}
                  >
                    <option value="active">✅ Activa</option>
                    <option value="inactive">⏸️ Inactiva</option>
                  </select>
                </div>
              </div>

              {/* CONDOMINIO GESTOR */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#34d399', marginBottom: '0.35rem' }}>
                  🏛️ Condominio Gestor (Quien administra y paga a los Vigilantes)
                </label>
                <select
                  value={form.managerCondominiumId}
                  onChange={(e) => {
                    const nextMgr = e.target.value;
                    setForm((p) => ({
                      ...p,
                      managerCondominiumId: nextMgr,
                      linkedCondominiumIds: p.linkedCondominiumIds.filter((id) => id !== nextMgr)
                    }));
                  }}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.62rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.35)', background: '#0b1120', color: '#fff' }}
                >
                  <option value="">— Sin condominio gestor asignado —</option>
                  {condominiums.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.serviceZone || c.city ? `(${c.serviceZone || c.city})` : ''}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.65rem' }}>
                  <input
                    type="text"
                    value={form.delegateName}
                    onChange={(e) => setForm((p) => ({ ...p, delegateName: e.target.value }))}
                    placeholder="Nombre del Delegado / Encargado"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff', fontSize: '0.8rem' }}
                  />
                  <input
                    type="text"
                    value={form.delegatePhone}
                    onChange={(e) => setForm((p) => ({ ...p, delegatePhone: e.target.value }))}
                    placeholder="WhatsApp del Delegado (+58...)"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.55rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* VINCULAR CONDOMINIOS N:M */}
              <div style={{ background: 'rgba(56, 189, 248, 0.07)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: '800', color: '#7dd3fc' }}>
                    🏘️ Condominios / Edificios Vinculados ({form.linkedCondominiumIds.length} seleccionados)
                  </label>
                  <input
                    type="text"
                    value={condoSearch}
                    onChange={(e) => setCondoSearch(e.target.value)}
                    placeholder="Filtrar edificios/conjuntos..."
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff', fontSize: '0.76rem' }}
                  />
                </div>
                <div style={{ maxHeight: '190px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.4rem', paddingRight: '0.2rem' }}>
                  {filteredCondosForModal.map((c) => {
                    const checked = form.linkedCondominiumIds.includes(String(c._id));
                    return (
                      <label
                        key={c._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          padding: '0.45rem 0.6rem',
                          borderRadius: '8px',
                          border: `1px solid ${checked ? 'rgba(56, 189, 248, 0.6)' : 'rgba(148, 163, 184, 0.2)'}`,
                          background: checked ? 'rgba(56, 189, 248, 0.16)' : '#0b1120',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          color: checked ? '#fff' : '#cbd5e1'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleLinkedCondo(c._id)}
                          style={{ accentColor: '#38bdf8', cursor: 'pointer' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.name}
                          </div>
                          {(c.serviceZone || c.city) && (
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                              📍 {c.serviceZone || c.city}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                  {filteredCondosForModal.length === 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0.5rem' }}>
                      No hay otros condominios disponibles para mostrar.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', marginBottom: '0.25rem' }}>
                  Notas / Observaciones
                </label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Observaciones internas de la garita"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.25)', background: '#0b1120', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', paddingTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  style={{ padding: '0.62rem 1.1rem', borderRadius: '9px', border: '1px solid rgba(148, 163, 184, 0.3)', background: 'transparent', color: '#cbd5e1', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '0.62rem 1.35rem', borderRadius: '9px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: '800', cursor: saving ? 'wait' : 'pointer' }}
                >
                  {saving ? '⏳ Guardando...' : form._id ? '💾 Guardar Cambios' : '💾 Crear Garita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
