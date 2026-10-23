import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function: /api/agent-inbox-worker
 * URL: https://www.iacondo.com/api/agent-inbox-worker
 *
 * Agente Autónomo 24/7 (Sofía IA con Gemini 2.5 Flash) que:
 * 1. Revisa por IMAP los correos entrantes no respondidos (UNANSWERED) en:
 *    - hola@iacondo.com (IA Condo -> Ventas, Demos y Atención a Juntas de Condominio / Administradoras)
 *    - info@profesionalcercano.com (Profesional Cercano -> Solo Soporte Técnico y Requerimientos Puntuales)
 * 2. Filtra correos internos/automáticos para evitar cualquier bucle.
 * 3. Analiza la respuesta o consulta del cliente con Gemini 2.5 Flash.
 * 4. Responde automáticamente al cliente en el mismo hilo de correo (In-Reply-To / References).
 * 5. Registra la respuesta y el grado de calificación en la Oportunidad de Odoo CRM.
 * 6. Cuando un condominio queda listo para Demo (demo_ready) o hay un caso crítico de soporte,
 *    envía una alerta "Human-in-the-Loop" a alejandrosaezh@iacondo.com.
 */

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

async function analyzeAndGenerateReply({ project, senderName, senderEmail, subject, bodyText, geminiKey }) {
  const isIaCondo = project === 'iacondo';

  const systemInstruction = isIaCondo
    ? `Eres Sofía, la Ejecutiva Comercial Senior de IA de IA Condo (www.iacondo.com), plataforma líder en Venezuela para la gestión automatizada de juntas de condominio y administradoras.
Un cliente o prospecto acaba de enviar o responder un correo a hola@iacondo.com.
Conocimiento clave de IA Condo:
- Automatiza recibos de condominio multimoneda (USD y Bs a tasa oficial BCV del día).
- Conciliación bancaria automática con IA para Pago Móvil, transferencias nacionales y Zelle.
- Control de morosidad en tiempo real, fondos de reserva, cartelera digital y portal web/móvil para propietarios.
- Planes adaptados al tamaño del condominio o administradora en Venezuela.
- WhatsApp oficial de atención y Demos: +58 422-2537239.

Tu tarea:
1. Analiza lo que escribió el cliente.
2. Redacta una respuesta cálida, ejecutiva y persuasiva en HTML limpio (solo etiquetas <p>, <ul>, <li>, <strong>).
3. Si el cliente ya indicó Ciudad + Cantidad aproximada de inmuebles/apartamentos (o pide agendar la Demo ya), clasifícalo como stage = "demo_ready" y confírmale que nuestro director comercial Alejandro Sáez y tú le activarán su acceso de demostración de inmediato.
4. Si aún faltan datos clave (nombre del condominio, ciudad en Venezuela, cantidad de apartamentos o su WhatsApp), respóndele sus dudas con precisión y pídele amablemente los datos faltantes (stage = "qualifying").

Responde ÚNICAMENTE en JSON válido (sin bloques markdown) con esta estructura exacta:
{
  "should_reply": true,
  "stage": "qualifying | demo_ready",
  "extracted_condo": "nombre del condominio o null",
  "extracted_city": "ciudad en Venezuela o null",
  "extracted_units": "cantidad de apartamentos o null",
  "extracted_phone": "teléfono/WhatsApp si lo indicó o null",
  "executive_summary": "Resumen de 1 línea para Odoo CRM",
  "reply_html": "<p>Respuesta completa en HTML para el cliente...</p>"
}`
    : `Eres Sofía, la Asistente IA de Soporte Técnico y Casos Especiales de Profesional Cercano (www.profesionalcercano.com) en Venezuela.
Regla estricta:
- Profesional Cercano es una App autónoma. Solo atendemos y escalamos en el CRM problemas técnicos, soporte con cuentas/verificación KYC, pagos de suscripciones (PRO/ELITE) o requerimientos puntuales/especiales.
- NUNCA menciones ningún nombre antiguo del proyecto; usa exclusivamente "Profesional Cercano".
- Redacta una respuesta empática, resolutiva y clara en HTML limpio (<p>, <ul>, <li>, <strong>) indicando que su caso ha sido actualizado en el sistema de soporte técnico de Profesional Cercano.

Responde ÚNICAMENTE en JSON válido (sin bloques markdown) con esta estructura exacta:
{
  "should_reply": true,
  "stage": "support_escalated",
  "extracted_city": "ciudad si la menciona o null",
  "extracted_phone": "teléfono si lo menciona o null",
  "executive_summary": "Resumen técnico de 1 línea para Odoo CRM",
  "reply_html": "<p>Respuesta completa en HTML para el usuario...</p>"
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
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(rawText);
      if (parsed && parsed.reply_html) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error en análisis Gemini del correo entrante:', err);
  }

  // Fallback estructurado si Gemini no responde JSON
  return {
    should_reply: true,
    stage: isIaCondo ? 'qualifying' : 'support_escalated',
    extracted_condo: null,
    extracted_city: null,
    extracted_units: null,
    extracted_phone: null,
    executive_summary: `Respuesta entrante de ${senderName || senderEmail} atendida por Sofía IA.`,
    reply_html: isIaCondo
      ? `<p>¡Hola <strong>${senderName || ''}</strong>! 👋</p><p>Muchas gracias por tu respuesta. He actualizado la ficha de tu condominio en nuestro sistema de <strong>IA Condo</strong> y en breve te contactaremos con los detalles de tu demostración guiada. También estamos disponibles en WhatsApp al <a href="https://wa.me/584222537239">+58 422-2537239</a>.</p>`
      : `<p>¡Hola <strong>${senderName || ''}</strong>! 👋</p><p>Hemos recibido tu mensaje en el área de soporte y requerimientos puntuales de <strong>Profesional Cercano</strong> y ya lo anexamos a tu caso para darte solución a la brevedad.</p>`,
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

        // Si es un correo interno/automático, marcarlo como \Answered para no volver a evaluarlo
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

        // Marcar como respondido en IMAP antes de enviar para garantizar idempotencia (cero duplicados)
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

        // 1. Enviar respuesta automática al cliente manteniendo el hilo (In-Reply-To / References)
        await transporter.sendMail({
          from: `"Sofía | ${brandName}" <${emailUser}>`,
          replyTo: `"${brandName}" <${emailUser}>`,
          to: senderEmail,
          subject: replySubject,
          inReplyTo: messageId || undefined,
          references: threadRefs || undefined,
          html: fullReplyHtml,
        });

        // 2. Registrar el análisis y la respuesta de Sofía IA en Odoo CRM (mismo hilo)
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

        // 3. Si está listo para Demo o es un escalado importante, avisar a Alejandro (Human-in-the-Loop)
        if (aiDecision.stage === 'demo_ready' || aiDecision.stage === 'support_escalated') {
          await transporter.sendMail({
            from: `"🔔 Alerta Sofía IA | ${brandName}" <${emailUser}>`,
            replyTo: `"${senderName}" <${senderEmail}>`,
            to: 'alejandrosaezh@iacondo.com',
            subject: `🔔 [Sofía IA] ${stageBadge} — ${senderName} (${brandName})`,
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
