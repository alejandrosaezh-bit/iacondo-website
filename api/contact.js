import nodemailer from 'nodemailer';

function isLikelyBotSpamText(text = '') {
  const s = String(text || '').trim();
  if (!s) return false;
  const words = s.split(/\s+/);
  for (const w of words) {
    const cleanWord = w.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length >= 12) {
      let transitions = 0;
      for (let i = 1; i < cleanWord.length; i++) {
        const prevUpper = cleanWord[i - 1] >= 'A' && cleanWord[i - 1] <= 'Z';
        const currUpper = cleanWord[i] >= 'A' && cleanWord[i] <= 'Z';
        if (prevUpper !== currUpper) transitions++;
      }
      if (transitions >= 4) return true;
      if (/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{6,}/.test(cleanWord)) return true;
    }
  }
  return false;
}

/**
 * Vercel Serverless Function: /api/contact
 * 1. Filtra envíos de bots automatizados (cadenas aleatorias sin sentido).
 * 2. Registra el Lead en Odoo CRM y en el Panel Corporativo (panel.iacondo.com).
 * 3. Responde al instante al prospecto desde "Sofía | IA Condo" <hola@iacondo.com> con su Demo Personalizada.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, condominium, units, unitType, hasAccessControl, demoUrl, message } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (name, email).' });
  }

  // Bloqueo anti-bots (cadenas camelCase aleatorias como vjrNkHmqbGOLokZpTEEGMMA)
  if (
    isLikelyBotSpamText(name) ||
    isLikelyBotSpamText(condominium) ||
    isLikelyBotSpamText(message)
  ) {
    return res.status(200).json({ ok: true, ignored_bot: true });
  }

  const smtpUser = process.env.SMTP_USER || 'hola@iacondo.com';
  const smtpPass = process.env.SMTP_PASS || 'IACondo2026!Venezuela#99';
  const smtpHost = process.env.SMTP_HOST || 'smtp.ionos.es';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const odooAlias = process.env.ODOO_CRM_ALIAS || 'ventas-iacondo@soluciones-digitales-creapptivas.odoo.com';

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const condoLabel = condominium && condominium.trim() ? condominium.trim() : 'Condominio por confirmar';
  const cleanUnits = parseInt(units, 10) || 24;
  const cleanType = unitType === 'Apto' ? 'Apartamentos' : 'Casas';
  const cleanAccess = hasAccessControl === 'no' ? 'no' : 'si';
  const customDemoLink =
    demoUrl ||
    `https://iacondo.com/demo?condo=${encodeURIComponent(condoLabel)}&units=${cleanUnits}&type=${unitType === 'Apto' ? 'Apto' : 'Casa'}&access=${cleanAccess}&client=${encodeURIComponent(name.trim())}`;
  const cleanMsg =
    (message && message.trim()) ||
    `Solicitud de Demo Personalizada para ${condoLabel} (${cleanUnits} ${cleanType}, control de acceso: ${cleanAccess === 'si' ? 'Sí' : 'No'}).`;
  const leadSubject = `${condoLabel} — ${cleanUnits} ${cleanType} · ${name.trim()}`;

  const aiReplyHtml = `
    <p>¡Hola <strong>${name}</strong>! 👋</p>
    <p>Te saluda <strong>Sofía</strong>, del equipo comercial de <strong>IA Condo</strong> (<a href="https://www.iacondo.com">www.iacondo.com</a>).</p>
    <p>¡Ya hemos preparado tu <strong>Demostración Interactiva Personalizada</strong> para <strong>${condoLabel}</strong> configurada con <strong>${cleanUnits} ${cleanType}</strong> y control de acceso <strong>${cleanAccess === 'si' ? 'Activo' : 'No incluido'}</strong>!</p>
    <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 8px 0;"><strong>🎮 Ingresa a tu Demo Personalizada aquí:</strong></p>
      <p style="margin: 0 0 8px 0;"><a href="${customDemoLink}" style="color: #0284c7; font-weight: bold;">${customDemoLink}</a></p>
      <p style="margin: 0; font-size: 13px;">🔑 <strong>Usuario:</strong> DEMO &nbsp;|&nbsp; <strong>Clave:</strong> DEMO</p>
    </div>
    <p>Dentro de la demostración podrás alternar en la barra superior entre:</p>
    <ul>
      <li><strong>📊 Visión Administración (Junta):</strong> Contabilidad multimoneda, conciliación bancaria con IA a tasa BCV del día del pago, control de morosidad, Carta Consulta LPH y control de portón.</li>
      <li><strong>🏡 Visión Vecino (Propietario):</strong> Estado de cuenta, reporte de pagos, pases QR de invitados y apertura de portón.</li>
    </ul>
    <p>Puedes responder directamente a este correo o escribirnos por WhatsApp al <a href="https://wa.me/584222537239">+58 422-2537239</a>.</p>
  `;

  const fullCustomerHtml = `
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
      ${aiReplyHtml}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 13px; color: #64748b;">
        <strong>Sofía — Ejecutiva Comercial IA</strong><br/>
        <strong>IA Condo | Soluciones Digitales Creapptivas C.A.</strong><br/>
        📧 <a href="mailto:hola@iacondo.com">hola@iacondo.com</a> · 🌐 <a href="https://www.iacondo.com">www.iacondo.com</a>
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"${name.replace(/"/g, '')} — ${condoLabel}" <${smtpUser}>`,
      replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
      to: [odooAlias, smtpUser, 'alejandrosaezh@iacondo.com'],
      subject: leadSubject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <h3>📥 Nueva Solicitud de Demo Personalizada desde www.iacondo.com</h3>
          <ul>
            <li><strong>Nombre:</strong> ${name}</li>
            <li><strong>Correo:</strong> <a href="mailto:${email}">${email}</a></li>
            <li><strong>Teléfono / WhatsApp:</strong> ${phone || 'No indicado'}</li>
            <li><strong>Condominio:</strong> ${condoLabel}</li>
            <li><strong>Cantidad de Viviendas:</strong> ${cleanUnits} (${cleanType})</li>
            <li><strong>Control de Acceso:</strong> ${cleanAccess === 'si' ? 'Sí' : 'No'}</li>
            <li><strong>Demo Personalizada Generada:</strong> <a href="${customDemoLink}">${customDemoLink}</a></li>
          </ul>
          <p><strong>Mensaje del prospecto:</strong></p>
          <p style="background: #f1f5f9; padding: 12px; border-radius: 6px;">${cleanMsg}</p>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"Sofía | IA Condo" <${smtpUser}>`,
      replyTo: `"IA Condo" <${smtpUser}>`,
      to: email,
      subject: `🏢 Tu Demo Personalizada de IA Condo está lista (${condoLabel})`,
      html: fullCustomerHtml,
    });

    // Registrar también en panel.iacondo.com (Render backend)
    fetch('https://condopro-api.onrender.com/api/sofia-whatsapp/process-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project: 'iacondo',
        senderName: name,
        senderEmail: email,
        subject: `Solicitud Demo Web: ${condoLabel}`,
        bodyText: `Condominio ${condoLabel}, tenemos ${cleanUnits} ${cleanType}, ${cleanAccess === 'si' ? 'con control de acceso' : 'sin control de acceso'}. Teléfono: ${phone || 'No indicado'}. ${cleanMsg}`,
        source: 'web_form',
      }),
    }).catch(() => {});

    return res.status(200).json({ ok: true, message: 'Lead registrado y Demo Personalizada enviada por Sofía IA.' });
  } catch (error) {
    console.error('Error en /api/contact:', error);
    return res.status(500).json({ error: 'Error procesando solicitud', details: String(error) });
  }
}
