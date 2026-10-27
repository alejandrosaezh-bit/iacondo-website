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

  const condoLabel = condominium && condominium.trim() ? condominium.trim() : 'Por confirmar';
  const cleanMsg =
    (message && message.trim()) ||
    `Solicitud de información y demostración desde www.iacondo.com.`;
  const leadSubject = `${condoLabel} · ${name.trim()}`;

  const aiReplyHtml = `
    <p>¡Hola <strong>${name}</strong>! 👋</p>
    <p>Te saluda <strong>Sofía</strong>, del equipo comercial de <strong>IA Condo</strong> (<a href="https://www.iacondo.com">www.iacondo.com</a>). Gracias por ponerte en contacto con nosotros.</p>
    <p>Para prepararte y enviarte de inmediato el enlace de tu <strong>Demostración Interactiva Personalizada</strong> (donde podrás probar tanto la <strong>Visión de Junta de Condominio</strong> como la <strong>Visión del Vecino</strong>), por favor respóndeme a este correo o por WhatsApp con estos 3 datos de tu conjunto:</p>
    <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 8px; margin: 16px 0;">
      <ol style="margin: 0; padding-left: 20px; color: #0f172a;">
        <li style="margin-bottom: 6px;"><strong>Nombre del Condominio o Conjunto Residencial</strong>${condominium && condominium.trim() ? ` <em>(recibimos: ${condominium.trim()})</em>` : ''}</li>
        <li style="margin-bottom: 6px;"><strong>Cantidad de viviendas</strong> (y si son Casas/Townhouses o Apartamentos)</li>
        <li><strong>¿Cuentan con control de acceso o portón eléctrico / garita?</strong> (Sí / No)</li>
      </ol>
    </div>
    <p>Apenas me confirmes estos datos, te generaré tu entorno de prueba exclusivo a la medida de tu condominio.</p>
    <p>También puedes escribirme directamente por WhatsApp haciendo clic aquí: <a href="https://wa.me/584222537239" style="color: #0284c7; font-weight: bold;">+58 422-2537239</a>.</p>
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
          <h3>📥 Nuevo Lead captado en www.iacondo.com (Atendido por Sofía IA)</h3>
          <ul>
            <li><strong>Nombre:</strong> ${name}</li>
            <li><strong>Correo:</strong> <a href="mailto:${email}">${email}</a></li>
            <li><strong>Teléfono / WhatsApp:</strong> ${phone || 'No indicado'}</li>
            <li><strong>Condominio:</strong> ${condoLabel}</li>
          </ul>
          <p><strong>Mensaje del prospecto:</strong></p>
          <p style="background: #f1f5f9; padding: 12px; border-radius: 6px;">${cleanMsg}</p>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"Sofía | IA Condo" <${smtpUser}>`,
      replyTo: `"Sofía | IA Condo" <${smtpUser}>`,
      to: email,
      subject: `👋 ¡Hola ${name.trim().split(' ')[0]}! Datos para preparar la Demo de tu Condominio — IA Condo`,
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
        subject: `Solicitud Web: ${condoLabel}`,
        bodyText: `Hola Sofía, soy ${name} (${email}, Tel/WhatsApp: ${phone || 'No indicado'}). Condominio: ${condoLabel}. ${cleanMsg}`,
        source: 'web_form',
      }),
    }).catch(() => {});

    return res.status(200).json({ ok: true, message: 'Lead registrado y atendido por Sofía IA.' });
  } catch (error) {
    console.error('Error en /api/contact:', error);
    return res.status(500).json({ error: 'Error procesando solicitud', details: String(error) });
  }
}
