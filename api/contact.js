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

  const { name, email, phone, condominium, units, unitType, demoUrl, message } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (name, email).' });
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
  const customDemoLink =
    demoUrl ||
    `https://app.iacondo.com/demo?condo=${encodeURIComponent(condoLabel)}&units=${cleanUnits}&type=${unitType === 'Apto' ? 'Apto' : 'Casa'}&client=${encodeURIComponent(name.trim())}`;
  const cleanMsg = (message && message.trim()) || `Solicitud de Demo Personalizada para ${condoLabel} (${cleanUnits} ${cleanType}).`;
  const leadSubject = `[IA Condo Web] ${condoLabel} (${cleanUnits} ${cleanType}) — ${name.trim()}`;

  // 1. Generar respuesta inteligente de Sofía (Agente IA Comercial de IA Condo)
  let aiReplyHtml = null;
  const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyD6qTMrJN38VEaFv31JBPWI33M2U7EpP9c';
  if (geminiKey) {
    try {
      const prompt = `Eres Sofía, la Ejecutiva Comercial de IA de IA Condo (www.iacondo.com), plataforma líder de gestión de condominios con Inteligencia Artificial en Venezuela.
Un prospecto acaba de solicitar su Demo Personalizada en la web:
- Nombre: ${name}
- Condominio: ${condoLabel}
- Cantidad de Inmuebles: ${cleanUnits} (${cleanType})
- Teléfono: ${phone || 'No indicado'}
- Correo: ${email}
- Enlace de su Demo Personalizada ya generada: ${customDemoLink}
- Mensaje: ${cleanMsg}

Redacta una respuesta en HTML limpio (solo párrafos <p> y listas <ul>/<li>, sin etiquetas <html> ni <body>), cálida, ejecutiva y persuasiva:
1. Salúdalo por su nombre y menciona que ya está lista la Demo Personalizada para ${condoLabel} configurada exactamente con ${cleanUnits} ${cleanType}.
2. Invítalo a abrir su Demo Personalizada en: <a href="${customDemoLink}">${customDemoLink}</a> (Usuario: DEMO / Clave: DEMO) explicándole que en la barra superior podrá alternar en 1 clic entre la Visión Administración (Junta) y la Visión Vecino (Propietario).
3. Destaca brevemente cómo IA Condo automatiza la conciliación bancaria a tasa BCV, recibos digitales, Carta Consulta LPH y apertura de portón.`;

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
      <p>¡Ya hemos preparado tu <strong>Demostración Interactiva Personalizada</strong> para <strong>${condoLabel}</strong> configurada con <strong>${cleanUnits} ${cleanType}</strong>!</p>
      <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>🎮 Ingresa a tu Demo Personalizada aquí:</strong></p>
        <p style="margin: 0 0 8px 0;"><a href="${customDemoLink}" style="color: #0284c7; font-weight: bold;">${customDemoLink}</a></p>
        <p style="margin: 0; font-size: 13px;">🔑 <strong>Usuario:</strong> DEMO &nbsp;|&nbsp; <strong>Clave:</strong> DEMO</p>
      </div>
      <p>Dentro de la demostración podrás alternar en la barra superior entre:</p>
      <ul>
        <li><strong>📊 Visión Administración (Junta):</strong> Contabilidad, conciliación bancaria a tasa BCV, control de morosidad, Carta Consulta LPH y control de portón.</li>
        <li><strong>🏡 Visión Vecino (Propietario):</strong> Estado de cuenta, reporte de pagos, pases QR de invitados y apertura de portón.</li>
      </ul>
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
    // A. Inyectar Lead directo al Pipeline "IA Condo" en Odoo CRM + Copia a hola@iacondo.com y dirección comercial
    await transporter.sendMail({
      from: `"${name.replace(/"/g, '')} (Web IA Condo)" <${smtpUser}>`,
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
            <li><strong>Cantidad de Viviendas / Inmuebles:</strong> ${cleanUnits} (${cleanType})</li>
            <li><strong>Demo Personalizada Generada:</strong> <a href="${customDemoLink}">${customDemoLink}</a></li>
          </ul>
          <p><strong>Mensaje del prospecto:</strong></p>
          <p style="background: #f1f5f9; padding: 12px; border-radius: 6px;">${cleanMsg}</p>
          <hr/>
          <p><em>🤖 Sofía (Agente IA) ya envió el correo con el enlace de su Demo Personalizada al prospecto.</em></p>
        </div>
      `,
    });

    // B. Enviar respuesta inmediata de Sofía (Agente IA) al cliente
    await transporter.sendMail({
      from: `"Sofía | IA Condo" <${smtpUser}>`,
      replyTo: `"IA Condo" <${smtpUser}>`,
      to: email,
      subject: `🏢 Tu Demo Personalizada de IA Condo está lista (${condoLabel})`,
      html: fullCustomerHtml,
    });

    // C. Respaldo en base de datos y notificación Push al backend principal sin duplicar correo
    fetch('https://condopro-api.onrender.com/api/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, condominium: `${condoLabel} (${cleanUnits} ${cleanType})`, message: cleanMsg, skipEmail: true }),
    }).catch(() => {});

    return res.status(200).json({ ok: true, message: 'Lead registrado en Odoo CRM y correo enviado por Sofía IA.' });
  } catch (error) {
    console.error('Error en /api/contact:', error);
    return res.status(500).json({ error: 'Error procesando solicitud', details: String(error) });
  }
}
