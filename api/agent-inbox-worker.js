import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';

const VENEZUELA_CITIES = [
  'Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'Maracay',
  'Lechería', 'Puerto La Cruz', 'Barcelona', 'Puerto Ordaz', 'Ciudad Guayana',
  'Maturín', 'San Cristóbal', 'Mérida', 'Margarita', 'Porlamar', 'Cumaná', 'Los Teques', 'Guatire', 'Guarenas'
];

const IGNORED_SENDERS = [
  'hola@iacondo.com',
  'ventas@iacondo.com',
  'soporte@iacondo.com',
  'pagos@iacondo.com',
  'notificaciones@iacondo.com',
  'info@profesionalcercano.com',
  'soporte@profesionalcercano.com',
  'hola@profesionalcercano.com',
  'ventas@profesionalcercano.com',
  'legal@profesionalcercano.com',
  'pagos@profesionalcercano.com',
  'mailer-daemon',
  'postmaster',
  'noreply',
  'no-reply',
  'odoo.com',
  'ionos.es',
  'ionos.com',
];

const IGNORED_SUBJECT_PREFIXES = [
  '[IA Condo Web]',
  '[IA Condo WhatsApp]',
  '[IA Condo Instagram]',
  '[Profesional Cercano -',
  '🔔 [Sofía IA]',
];

function shouldIgnoreMessage(fromEmail = '', subject = '') {
  const lowerFrom = (fromEmail || '').toLowerCase().trim();
  if (!lowerFrom || !lowerFrom.includes('@')) return true;
  for (const ig of IGNORED_SENDERS) {
    if (lowerFrom.includes(ig)) return true;
  }
  for (const prefix of IGNORED_SUBJECT_PREFIXES) {
    if ((subject || '').startsWith(prefix)) return true;
  }
  return false;
}

function extractLeadEntities(text = '') {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  const city = VENEZUELA_CITIES.find(c => clean.toLowerCase().includes(c.toLowerCase())) || null;
  const unitsMatch = clean.match(/(\d+)\s*(apartamentos|aptos|inmuebles|casas|unidades|propietarios)/i);
  const units = unitsMatch ? unitsMatch[1] : null;
  const phoneMatch = clean.match(/(\+?58\s?0?\d{3}[-\s]?\d{7}|04\d{2}[-\s]?\d{7})/);
  const phone = phoneMatch ? phoneMatch[1] : null;
  const condoMatch = clean.match(
    /((?:residencias|conjunto residencial|condominio|edificio|torre|urbanizaci[oó]n|terrazas)\s+[a-záéíóúñ0-9\s]{2,35}?)(?=\s+en\s+|\s*[,.]|\s+tenemos|\s+y\s+|$)/i
  );
  const condo = condoMatch ? condoMatch[1].trim() : null;
  const asksBcv = /(bcv|bol[ií]vares|pago m[oó]vil|tasa|conciliaci[oó]n)/i.test(clean);
  const asksDemo = /(demo|demostraci[oó]n|agendar|prueba|reuni[oó]n)/i.test(clean);

  const isDemoReady = Boolean((city && units) || (units && phone) || (asksDemo && (city || units || phone)));

  return {
    condo,
    city,
    units,
    phone,
    asksBcv,
    asksDemo,
    isDemoReady,
  };
}

async function analyzeAndGenerateReply({ project, senderName, senderEmail, subject, bodyText, geminiKey }) {
  const isIaCondo = project === 'iacondo';
  const entities = extractLeadEntities(bodyText);

  const systemInstruction = isIaCondo
    ? `Eres Sofía, la Ejecutiva Comercial Senior de IA de IA Condo (www.iacondo.com), plataforma líder en Venezuela para la gestión automatizada de juntas de condominio y administradoras.
Un cliente o prospecto acaba de enviar o responder un correo a hola@iacondo.com.
Conocimiento clave de IA Condo:
- Automatiza recibos de condominio multimoneda: emite en USD referencial y permite pagar en Bolívares calculando automáticamente la tasa oficial del BCV del día del pago.
- Conciliación bancaria automática con IA: el propietario reporta su Pago Móvil, transferencia en Bs o Zelle, y la IA valida el comprobante contra el banco y actualiza el saldo al instante.
- Control de morosidad en tiempo real, fondos de reserva, cartelera digital y portal web/móvil para propietarios.
- WhatsApp oficial de atención y Demos: +58 422-2537239.
- NUNCA menciones "Odoo", "CRM" ni nombres de sistemas internos en el mensaje para el cliente (reply_html).

Responde ÚNICAMENTE en JSON válido (sin bloques markdown) con esta estructura exacta:
{
  "should_reply": true,
  "stage": "qualifying | demo_ready",
  "extracted_condo": "nombre del condominio o null",
  "extracted_city": "ciudad en Venezuela o null",
  "extracted_units": "cantidad de apartamentos o null",
  "extracted_phone": "teléfono/WhatsApp si lo indicó o null",
  "executive_summary": "Resumen interno de 1 línea",
  "reply_html": "<p>Respuesta completa en HTML limpio para el cliente (sin mencionar nunca Odoo ni CRM)...</p>"
}`
    : `Eres Sofía, la Asistente IA de Soporte Técnico y Casos Especiales de Profesional Cercano (www.profesionalcercano.com) en Venezuela.
Regla estricta:
- Profesional Cercano es una App autónoma. Solo atendemos problemas técnicos, soporte con cuentas/verificación KYC, pagos de suscripciones (PRO/ELITE) o requerimientos puntuales/especiales.
- NUNCA menciones ningún nombre antiguo del proyecto ni menciones "Odoo" o "CRM" al usuario; usa exclusivamente "Profesional Cercano".

Responde ÚNICAMENTE en JSON válido (sin bloques markdown) con esta estructura exacta:
{
  "should_reply": true,
  "stage": "support_escalated",
  "extracted_city": "ciudad si la menciona o null",
  "extracted_phone": "teléfono si lo menciona o null",
  "executive_summary": "Resumen técnico interno de 1 línea",
  "reply_html": "<p>Respuesta completa en HTML para el usuario (sin mencionar Odoo ni CRM)...</p>"
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { responseMimeType: 'application/json' },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Remitente: ${senderName} <${senderEmail}>\nAsunto: ${subject}\nMensaje del cliente:\n${bodyText.slice(0, 3500)}`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const rawText = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '')
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      const parsed = JSON.parse(rawText);
      if (parsed && parsed.reply_html) {
        return {
          ...parsed,
          stage: entities.isDemoReady ? 'demo_ready' : parsed.stage || 'qualifying',
          extracted_condo: parsed.extracted_condo || entities.condo,
          extracted_city: parsed.extracted_city || entities.city,
          extracted_units: parsed.extracted_units || entities.units,
          extracted_phone: parsed.extracted_phone || entities.phone,
        };
      }
    }
  } catch (err) {
    console.error('Error en análisis Gemini del correo entrante:', err);
  }

  // Respuesta inteligente contextual con entidades extraídas
  if (isIaCondo) {
    const condoText = entities.condo ? ` de <strong>${entities.condo}</strong>` : '';
    const cityText = entities.city ? ` en <strong>${entities.city}</strong>` : '';
    const unitsText = entities.units ? ` (${entities.units} apartamentos)` : '';
    const bcvParagraph = entities.asksBcv
      ? `<p>Sobre tu consulta de los <strong>pagos en Bolívares a tasa BCV</strong>: en <strong>IA Condo</strong> los recibos se expresan en divisas (USD) como referencia de valor, pero cada propietario puede pagar en <strong>Bolívares (Pago Móvil o transferencia bancaria)</strong> calculados automáticamente a la <strong>tasa oficial del BCV vigente el día exacto del pago</strong>. Además, nuestra IA concilia el comprobante automáticamente y emite el recibo al instante sin trabajo manual para la Junta.</p>`
      : `<p>Con <strong>IA Condo</strong> automatizamos la emisión de recibos en USD/Bs a tasa BCV, conciliación bancaria con IA (Pago Móvil, transferencias y Zelle) y control de morosidad en tiempo real.</p>`;

    const nextStepParagraph = entities.isDemoReady
      ? `<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 6px; margin: 14px 0;">
          <strong>✅ ¡Solicitud de Demo Recibida y Agendada!</strong><br/>
          Ya tomé nota de los datos${condoText}${cityText}${unitsText} y de tu WhatsApp <strong>${entities.phone || 'indicado'}</strong>. Nuestro director comercial <strong>Alejandro Sáez</strong> y yo te contactaremos a tu WhatsApp para mostrarte la Demo personalizada en vivo.
        </div>`
      : `<p>Para prepararte la Demo guiada, ¿podrías confirmarme respondiendo a este correo el nombre del condominio, ciudad, cantidad aproximada de apartamentos y tu número de WhatsApp?</p>`;

    return {
      should_reply: true,
      stage: entities.isDemoReady ? 'demo_ready' : 'qualifying',
      extracted_condo: entities.condo,
      extracted_city: entities.city,
      extracted_units: entities.units,
      extracted_phone: entities.phone,
      executive_summary: `${entities.condo || senderName} (${entities.city || 'Venezuela'}, ${entities.units ? entities.units + ' aptos' : 'por confirmar'}) — ${entities.isDemoReady ? 'Calificado para Demo' : 'En calificación'}`,
      reply_html: `<p>¡Hola <strong>${senderName || ''}</strong>! 👋 Qué gusto saludarte${condoText}${cityText}.</p>${bcvParagraph}${nextStepParagraph}`,
    };
  }

  return {
    should_reply: true,
    stage: 'support_escalated',
    extracted_city: entities.city,
    extracted_phone: entities.phone,
    executive_summary: `Caso de soporte puntual de ${senderName || senderEmail} atendido por Sofía IA.`,
    reply_html: `<p>¡Hola <strong>${senderName || ''}</strong>! 👋</p><p>Hemos recibido tu mensaje en el área de soporte técnico y requerimientos puntuales de <strong>Profesional Cercano</strong> y ya lo estamos revisando para darte solución a la brevedad.</p>`,
  };
}

async function processMailboxAccount(accountConfig, geminiKey) {
  const {
    project,
    emailUser,
    emailPass,
    odooAlias,
    brandName,
    brandUrl,
    brandColor,
  } = accountConfig;

  const client = new ImapFlow({
    host: 'imap.ionos.es',
    port: 993,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
    logger: false,
  });

  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.es',
    port: 465,
    secure: true,
    auth: { user: emailUser, pass: emailPass },
  });

  const processed = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const uids = await client.search({ answered: false, since: sinceDate }, { uid: true });

      for (const uid of uids.slice(-10)) {
        const msg = await client.fetchOne(uid, { source: true, envelope: true, flags: true }, { uid: true });
        if (!msg || !msg.source) continue;

        const parsed = await simpleParser(msg.source);
        const fromObj = parsed.from?.value?.[0] || {};
        const senderEmail = (fromObj.address || '').trim();
        const senderName = (fromObj.name || senderEmail.split('@')[0] || 'Cliente').replace(/"/g, '').trim();
        const subject = (parsed.subject || 'Consulta').trim();
        const messageId = parsed.messageId || '';
        const references = Array.isArray(parsed.references)
          ? parsed.references.join(' ')
          : parsed.references || '';

        if (shouldIgnoreMessage(senderEmail, subject)) {
          await client.messageFlagsAdd(uid, ['\\Answered', '\\Seen'], { uid: true });
          continue;
        }

        const rawText = (parsed.text || parsed.html || '').trim();
        const cleanBody = rawText.split(/\nOn .* wrote:|\nEl .* escribió:|\nDe: /i)[0].trim() || rawText.slice(0, 1500);

        const aiDecision = await analyzeAndGenerateReply({
          project,
          senderName,
          senderEmail,
          subject,
          bodyText: cleanBody,
          geminiKey,
        });

        await client.messageFlagsAdd(uid, ['\\Answered', '\\Seen'], { uid: true });

        if (!aiDecision.should_reply) {
          continue;
        }

        const replySubject = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
        const threadRefs = [references, messageId].filter(Boolean).join(' ').trim();

        const fullReplyHtml = `
          <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6;">
            ${aiDecision.reply_html}
            <p style="margin-top: 14px;">📲 WhatsApp directo: <a href="https://wa.me/584222537239" style="color: ${brandColor}; font-weight: bold;">+58 422-2537239</a></p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 13px; color: #64748b;">
              <strong>Sofía — Agente IA de Atención y Operaciones</strong><br/>
              <strong>${brandName} | Soluciones Digitales Creapptivas C.A.</strong><br/>
              📧 <a href="mailto:${emailUser}">${emailUser}</a> · 🌐 <a href="${brandUrl}">${brandUrl.replace('https://', '')}</a>
            </p>
          </div>
        `;

        await transporter.sendMail({
          from: `"Sofía | ${brandName}" <${emailUser}>`,
          replyTo: `"${brandName}" <${emailUser}>`,
          to: senderEmail,
          subject: replySubject,
          inReplyTo: messageId || undefined,
          references: threadRefs || undefined,
          html: fullReplyHtml,
        });

        const stageBadge =
          aiDecision.stage === 'demo_ready'
            ? '🟢 LISTO PARA DEMO (CALIFICADO)'
            : aiDecision.stage === 'support_escalated'
            ? '🟠 CASO DE SOPORTE / PUNTUAL'
            : '🔵 EN CALIFICACIÓN POR SOFÍA IA';

        await transporter.sendMail({
          from: `"Sofía IA (${brandName})" <${emailUser}>`,
          replyTo: `"${senderName}" <${senderEmail}>`,
          to: odooAlias,
          subject: replySubject,
          inReplyTo: messageId || undefined,
          references: threadRefs || undefined,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
              <div style="background: #f8fafc; border-left: 4px solid ${brandColor}; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                <strong>🤖 Seguimiento Automático de Sofía IA:</strong> ${stageBadge}<br/>
                <strong>Resumen IA:</strong> ${aiDecision.executive_summary || 'Respondido automáticamente'}<br/>
                ${aiDecision.extracted_condo ? `<strong>Condominio:</strong> ${aiDecision.extracted_condo}<br/>` : ''}
                ${aiDecision.extracted_city ? `<strong>Ciudad:</strong> ${aiDecision.extracted_city}<br/>` : ''}
                ${aiDecision.extracted_units ? `<strong>Inmuebles/Aptos:</strong> ${aiDecision.extracted_units}<br/>` : ''}
                ${aiDecision.extracted_phone ? `<strong>WhatsApp/Tel:</strong> ${aiDecision.extracted_phone}<br/>` : ''}
              </div>
              <p><strong>📩 Mensaje recibido de ${senderName} (${senderEmail}):</strong></p>
              <blockquote style="background: #f1f5f9; padding: 10px; border-radius: 6px;">${cleanBody}</blockquote>
              <p><strong>📤 Respuesta enviada automáticamente por Sofía IA:</strong></p>
              <div style="background: #ecfdf5; padding: 12px; border-radius: 6px;">${aiDecision.reply_html}</div>
            </div>
          `,
        });

        if (aiDecision.stage === 'demo_ready' || aiDecision.stage === 'support_escalated') {
          await transporter.sendMail({
            from: `"🔔 Alerta Sofía IA | ${brandName}" <${emailUser}>`,
            replyTo: `"${senderName}" <${senderEmail}>`,
            to: 'alejandrosaezh@iacondo.com',
            subject: `🔔 [Sofía IA] ${stageBadge} — ${aiDecision.extracted_condo || senderName} (${brandName})`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
                <h3>🔔 Hola Alejandro, Sofía IA calificó y atendió un caso prioritario en ${brandName}</h3>
                <ul>
                  <li><strong>Estado:</strong> ${stageBadge}</li>
                  <li><strong>Cliente:</strong> ${senderName} (<a href="mailto:${senderEmail}">${senderEmail}</a>)</li>
                  <li><strong>Resumen:</strong> ${aiDecision.executive_summary}</li>
                  ${aiDecision.extracted_condo ? `<li><strong>Condominio:</strong> ${aiDecision.extracted_condo}</li>` : ''}
                  ${aiDecision.extracted_city ? `<li><strong>Ciudad:</strong> ${aiDecision.extracted_city}</li>` : ''}
                  ${aiDecision.extracted_units ? `<li><strong>Inmuebles:</strong> ${aiDecision.extracted_units}</li>` : ''}
                  ${aiDecision.extracted_phone ? `<li><strong>Teléfono / WhatsApp:</strong> ${aiDecision.extracted_phone}</li>` : ''}
                </ul>
                <p>Revisa la oportunidad actualizada en tu <a href="https://soluciones-digitales-creapptivas.odoo.com/odoo/crm">Odoo CRM</a>.</p>
              </div>
            `,
          });
        }

        processed.push({
          project,
          uid,
          from: senderEmail,
          subject,
          stage: aiDecision.stage,
          condo: aiDecision.extracted_condo,
          city: aiDecision.extracted_city,
          units: aiDecision.extracted_units,
          phone: aiDecision.extracted_phone,
          summary: aiDecision.executive_summary,
        });
      }
    } finally {
      lock.release();
    }
    await client.logout();
  } catch (err) {
    console.error(`Error procesando buzón ${emailUser}:`, err);
    return { project, emailUser, error: String(err), processed };
  }

  return { project, emailUser, processed };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyD6qTMrJN38VEaFv31JBPWI33M2U7EpP9c';

  const accounts = [
    {
      project: 'iacondo',
      emailUser: process.env.SMTP_USER || 'hola@iacondo.com',
      emailPass: process.env.SMTP_PASS || 'IACondo2026!Venezuela#99',
      odooAlias: 'ventas-iacondo@soluciones-digitales-creapptivas.odoo.com',
      brandName: 'IA Condo',
      brandUrl: 'https://www.iacondo.com',
      brandColor: '#0ea5e9',
    },
    {
      project: 'profesional_cercano',
      emailUser: 'info@profesionalcercano.com',
      emailPass: 'ProCercano2026!Venezuela#99',
      odooAlias: 'ventas-profesionalcercano@soluciones-digitales-creapptivas.odoo.com',
      brandName: 'Profesional Cercano',
      brandUrl: 'https://www.profesionalcercano.com',
      brandColor: '#EA580C',
    },
  ];

  const results = [];
  for (const acc of accounts) {
    const r = await processMailboxAccount(acc, geminiKey);
    results.push(r);
  }

  return res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    agent: 'Sofía IA — Autonomous Inbox & Odoo CRM Worker (Gemini 2.5 Flash)',
    results,
  });
}
