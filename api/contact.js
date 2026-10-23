import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function: /api/contact
 * 1. Registra automáticamente el Lead en Odoo CRM (Equipo: IA Condo, Etapa: 1. Nuevo Lead (IA)).
 * 2. Responde al instante al prospecto desde "Sofía | IA Condo" <hola@iacondo.com> (vía IONOS SMTP).
 * 3. Si GEMINI_API_KEY está configurada en Vercel, genera una respuesta personalizada con IA;
 *    de lo contrario, utiliza la respuesta estructurada de Sofía para IA Condo.
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

  const { name, email, condominium, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (name, email, message).' });
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
  const leadSubject = `[IA Condo Web] ${condoLabel} — ${name.trim()}`;

  // 1. Generar respuesta inteligente de Sofía (Agente IA Comercial de IA Condo)
  let aiReplyHtml = null;
  const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyD6qTMrJN38VEaFv31JBPWI33M2U7EpP9c';
  if (geminiKey) {
    try {
      const prompt = `Eres Sofía, la Ejecutiva Comercial de IA de IA Condo (www.iacondo.com), plataforma líder de gestión de condominios con Inteligencia Artificial en Venezuela.
Un prospecto acaba de llenar el formulario en la web:
- Nombre: ${name}
- Condominio: ${condoLabel}
- Correo: ${email}
- Mensaje: ${message}

Redacta una respuesta en HTML limpio (solo párrafos <p> y listas <ul>/<li>, sin etiquetas <html> ni <body>), cálida, ejecutiva y persuasiva:
1. Salúdalo por su nombre y menciona su condominio (${condoLabel}).
2. Responde brevemente a su inquietud ("${message}") destacando cómo IA Condo automatiza la conciliación bancaria (Pago Móvil, Zelle, transferencias a tasa BCV), recibos digitales y control de morosidad.
3. Pídele que responda a este mismo correo confirmando: cantidad aproximada de apartamentos/inmuebles, ciudad y su número de WhatsApp para activarle una demostración guiada.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      );
      if (geminiRes.ok) {
        const data = await geminiRes.json();
        aiReplyHtml = data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (err) {
      console.error('Error generando respuesta Gemini, usando plantilla de Sofía:', err);
    }
  }

  if (!aiReplyHtml) {
    aiReplyHtml = `
      <p>¡Hola <strong>${name}</strong>! 👋</p>
      <p>Te saluda <strong>Sofía</strong>, del equipo comercial de <strong>IA Condo</strong> (<a href="https://www.iacondo.com">www.iacondo.com</a>).</p>
      <p>Hemos recibido tu consulta sobre <strong>${condoLabel}</strong>:</p>
      <blockquote style="margin: 12px 0; padding: 10px 14px; background: #f1f5f9; border-left: 4px solid #0ea5e9; color: #334155;">
        "${message}"
      </blockquote>
      <p>Con <strong>IA Condo</strong> podrás automatizar hasta el 80% del trabajo administrativo del edificio: conciliación automática de pagos en USD y Bs (tasa BCV), emisión instantánea de recibos digitales, control de morosidad y portal transparente para cada propietario.</p>
      <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px; margin: 16px 0;">
        <strong>Para prepararte tu Demo personalizada, ¿podrías confirmarme respondiendo a este correo?:</strong>
        <ol style="margin: 8px 0 0 0; padding-left: 20px;">
          <li>¿En qué ciudad se encuentra ubicado <strong>${condoLabel}</strong>?</li>
          <li>¿Cuántos apartamentos o inmuebles aproximadamente conforman el condominio?</li>
          <li>¿Cuál es tu número de WhatsApp para coordinar el acceso de prueba?</li>
        </ol>
      </div>
      <p>Puedes responder directamente a este correo o escribirnos por WhatsApp al <a href="https://wa.me/584222537239">+58 422-2537239</a>.</p>
    `;
  }

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
    // A. Inyectar Lead directo al Pipeline "IA Condo" en Odoo CRM + Copia a hola@iacondo.com
    await transporter.sendMail({
      from: `"${name.replace(/"/g, '')} (Web IA Condo)" <${smtpUser}>`,
      replyTo: `"${name.replace(/"/g, '')}" <${email}>`,
      to: [odooAlias, smtpUser],
      subject: leadSubject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a;">
          <h3>📥 Nuevo Lead captado desde www.iacondo.com</h3>
          <ul>
            <li><strong>Nombre:</strong> ${name}</li>
            <li><strong>Correo:</strong> <a href="mailto:${email}">${email}</a></li>
            <li><strong>Condominio:</strong> ${condoLabel}</li>
          </ul>
          <p><strong>Mensaje del prospecto:</strong></p>
          <p style="background: #f1f5f9; padding: 12px; border-radius: 6px;">${message}</p>
          <hr/>
          <p><em>🤖 Sofía (Agente IA) ya envió el correo inicial de bienvenida y calificación al prospecto.</em></p>
        </div>
      `,
    });

    // B. Enviar respuesta inmediata de Sofía (Agente IA) al cliente
    await transporter.sendMail({
      from: `"Sofía | IA Condo" <${smtpUser}>`,
      replyTo: `"IA Condo" <${smtpUser}>`,
      to: email,
      subject: `🏢 Bienvenido a IA Condo — Solicitud de Demo (${condoLabel})`,
      html: fullCustomerHtml,
    });

    // C. Respaldo opcional al backend anterior sin bloquear
    fetch('https://condopro-api.onrender.com/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, condominium, message }),
    }).catch(() => {});

    return res.status(200).json({ ok: true, message: 'Lead registrado en Odoo CRM y correo enviado por Sofía IA.' });
  } catch (error) {
    console.error('Error en /api/contact:', error);
    return res.status(500).json({ error: 'Error procesando solicitud', details: String(error) });
  }
}
