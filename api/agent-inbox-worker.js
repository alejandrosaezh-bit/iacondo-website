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
  'kundenserver.de',
];

const IGNORED_SUBJECT_PREFIXES = [
  '[IA Condo Web]',
  '[IA Condo WhatsApp]',
  '[IA Condo Instagram]',
  '[Profesional Cercano -',
  '🔔 [Sofía IA]',
  '📅 [LLAMADA AGENDADA',
  'NUEVA SOLICITUD DE DEMO',
  'Mail delivery failed',
];

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

function shouldIgnoreMessage(fromEmail = '', senderName = '', subject = '', bodyText = '') {
  const lowerFrom = (fromEmail || '').toLowerCase().trim();
  if (!lowerFrom || !lowerFrom.includes('@')) return true;
  for (const ig of IGNORED_SENDERS) {
    if (lowerFrom.includes(ig)) return true;
  }
  for (const prefix of IGNORED_SUBJECT_PREFIXES) {
    if ((subject || '').startsWith(prefix)) return true;
  }
  if (
    isLikelyBotSpamText(senderName) ||
    isLikelyBotSpamText(subject) ||
    isLikelyBotSpamText(bodyText.slice(0, 300))
  ) {
    return true;
  }
  return false;
}

function extractLeadEntities(text = '') {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  const city = VENEZUELA_CITIES.find((c) => clean.toLowerCase().includes(c.toLowerCase())) || null;
  const unitsMatch = clean.match(/(\d+)\s*(apartamentos|aptos|inmuebles|casas|viviendas|unidades|propietarios)/i);
  const units = unitsMatch ? `${unitsMatch[1]} ${/casa/i.test(unitsMatch[2]) ? 'Casas' : 'Apartamentos'}` : null;
  const numericUnits = unitsMatch ? unitsMatch[1] : null;
  const unitType = unitsMatch && /casa/i.test(unitsMatch[2]) ? 'Casa' : 'Apto';
  const phoneMatch = clean.match(/(\+?58\s?0?\d{3}[-\s]?\d{7}|04\d{2}[-\s]?\d{7}|\+34\s?\d[\d\s]{7,12})/);
  const phone = phoneMatch ? phoneMatch[1].trim() : null;
  const strippedForCondo = clean
    .replace(/\b\d{1,4}\s*(?:apartamentos?|aptos?|inmuebles?|casas?|viviendas?|unidades?|propietarios?|quintas?)\b.*$/i, '')
    .replace(/\b(?:con|sin|tenemos|tiene)?\s*(?:control\s+de\s+acceso|garita(?:\s+de\s+vigilancia)?|port[oó]n(?:\s+el[eé]ctrico)?|vigilancia)\b.*$/i, '')
    .trim();
  const condoMatch = strippedForCondo.match(
    /((?:conjunto\s+residencial\s+calle|conjunto\s+residencial|conjunto|residencias|residencia|condominio|edificio|torre|urbanizaci[oó]n|terrazas|calle|villas)\s+[a-záéíóúñ0-9\s]{2,55}?)(?=\s+en\s+|\s*[,.]|\s+tenemos|\s+con\s+|\s+y\s+|$)/i
  );
  const condo = condoMatch ? condoMatch[1].trim() : null;

  let hasAccessControl = null;
  if (
    /(sin\s+control\s+de\s+acceso|no\s+tenemos\s+control\s+de\s+acceso|no\s+tiene\s+control\s+de\s+acceso|sin\s+port[oó]n|sin\s+vigilancia)/i.test(
      clean
    )
  ) {
    hasAccessControl = 'no';
  } else if (
    /(con\s+control\s+de\s+acceso|s[ií]\s+tenemos\s+control\s+de\s+acceso|s[ií]\s+tiene\s+control\s+de\s+acceso|tenemos\s+port[oó]n|port[oó]n\s+el[eé]ctrico|garita(?:\s+de\s+vigilancia)?|control\s+de\s+acceso\s*:\s*s[ií])/i.test(
      clean
    )
  ) {
    hasAccessControl = 'si';
  }

  const wantsGeneralDemoOnly =
    /(no\s+quiero\s+dar\s+datos|sin\s+dar\s+datos|solo\s+quiero\s+ver\s+un\s+demo|demo\s+general|prefiero\s+no\s+dar)/i.test(
      clean
    );

  const readyForPersonalizedDemo = Boolean(condo && numericUnits && hasAccessControl);
  const personalizedDemoUrl = readyForPersonalizedDemo
    ? `https://iacondo.com/demo?condo=${encodeURIComponent(condo)}&units=${encodeURIComponent(
        numericUnits
      )}&type=${encodeURIComponent(unitType)}&access=${encodeURIComponent(hasAccessControl)}`
    : null;
  const generalDemoUrl = 'https://iacondo.com/demo';

  return {
    condo,
    city,
    units,
    numericUnits,
    unitType,
    hasAccessControl,
    wantsGeneralDemoOnly,
    readyForPersonalizedDemo,
    personalizedDemoUrl,
    generalDemoUrl,
    phone,
  };
}

async function analyzeAndGenerateReply({ project, senderName, senderEmail, subject, bodyText, geminiKey }) {
  // 1. Intentar delegar primero al motor central de Sofía IA en Render (usa la API Key activa de MongoDB Atlas y registra en panel.iacondo.com)
  try {
    const backendRes = await fetch('https://condopro-api.onrender.com/api/sofia-whatsapp/process-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project,
        senderName,
        senderEmail,
        subject,
        bodyText,
        source: 'imap_inbox',
      }),
    });
    if (backendRes.ok) {
      const backendData = await backendRes.json();
      if (backendData && (backendData.reply_html || backendData.ignored_bot || backendData.should_reply === false)) {
        return backendData;
      }
    }
  } catch (err) {
    console.warn('[InboxWorker] Fallback local porque Render tardó en responder:', err.message);
  }

  // 2. Fallback local con la misma regla de los 3 datos para Demo Personalizado vs Demo General
  const isIaCondo = project === 'iacondo';
  const entities = extractLeadEntities(`${subject}\n${bodyText}`);

  if (!isIaCondo) {
    return {
      should_reply: true,
      stage: 'support_escalated',
      extracted_city: entities.city,
      extracted_phone: entities.phone,
      executive_summary: `Caso de soporte puntual de ${senderName || senderEmail} atendido por Sofía IA.`,
      reply_html: `<p>¡Hola <strong>${senderName || ''}</strong>! 👋</p><p>Hemos recibido tu mensaje en el área de soporte técnico y requerimientos puntuales de <strong>Profesional Cercano</strong> y ya lo estamos revisando para darte solución a la brevedad.</p>`,
    };
  }

  for (const modelName of ['gemini-flash-lite-latest', 'gemini-flash-latest', 'gemini-2.5-flash']) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Eres Sofía, la Ejecutiva Comercial Senior de IA de IA Condo (www.iacondo.com).
Responde al correo de ${senderName} <${senderEmail}> (Asunto: ${subject}):
"""
${bodyText.slice(0, 2500)}
"""
Regla obligatoria para ofrecer el Demo:
- Para generar un Demo Personalizado solicitamos 3 datos: 1) Nombre del condominio, 2) Cantidad de viviendas (casas o apartamentos), 3) Si tiene control de acceso (portón / vigilancia).
- Si ya dio los 3 datos, entrégale su enlace personalizado: ${entities.personalizedDemoUrl || 'https://iacondo.com/demo'} (Usuario: DEMO / Clave: IACondo#Demo2026!).
- Si faltan datos, responde sus preguntas con calidez y pídele los datos que faltan para crearle su Demo Personalizado, indicando también que si prefiere ver un Demo General sin dar datos puede entrar a https://iacondo.com/demo (Usuario: DEMO / Clave: IACondo#Demo2026!).
Devuelve únicamente HTML limpio (<p>, <ul>, <li>, <strong>, <a>).`,
                  },
                ],
              },
            ],
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const rawHtml = (data?.candidates?.[0]?.content?.parts?.[0]?.text || '')
          .replace(/^```html\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        if (rawHtml && rawHtml.length > 20) {
          return {
            should_reply: true,
            stage: entities.readyForPersonalizedDemo ? 'demo_ready' : 'qualifying',
            extracted_condo: entities.condo,
            extracted_city: entities.city,
            extracted_units: entities.units,
            extracted_access: entities.hasAccessControl,
            extracted_phone: entities.phone,
            executive_summary: `${entities.condo || senderName} — Respondido por Sofía IA (${modelName})`,
            reply_html: rawHtml,
          };
        }
      }
    } catch {}
  }

  const demoSection = entities.readyForPersonalizedDemo
    ? `<div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 14px; border-radius: 8px; margin: 14px 0;">
        <p style="margin: 0 0 6px 0;"><strong>🎮 Tu Demo Personalizado de IA Condo está listo:</strong></p>
        <p style="margin: 0 0 6px 0;"><a href="${entities.personalizedDemoUrl}" style="color: #0284c7; font-weight: bold;">${entities.personalizedDemoUrl}</a></p>
        <p style="margin: 0; font-size: 13px;">🔑 <strong>Usuario:</strong> DEMO &nbsp;|&nbsp; <strong>Clave:</strong> IACondo#Demo2026!</p>
      </div>`
    : `<p>En <strong>IA Condo</strong> preparamos un <strong>Demo Personalizado</strong> a la medida de tu comunidad. Para generarlo y enviártelo de inmediato, ¿podrías confirmarme respondiendo a este correo estos 3 datos?</p>
      <ul>
        <li><strong>1. Nombre del condominio o conjunto residencial:</strong> ${entities.condo || 'Por confirmar'}</li>
        <li><strong>2. Cantidad de viviendas (casas o apartamentos):</strong> ${entities.units || 'Por confirmar'}</li>
        <li><strong>3. ¿Cuentan con control de acceso (portón / vigilancia)?:</strong> ${entities.hasAccessControl ? (entities.hasAccessControl === 'si' ? 'Sí' : 'No') : 'Por confirmar (Sí / No)'}</li>
      </ul>
      <p><em>💡 Si prefieres explorar primero un Demo General sin indicar estos datos, puedes ingresar directamente en <a href="https://iacondo.com/demo">https://iacondo.com/demo</a> (<strong>Usuario:</strong> DEMO / <strong>Clave:</strong> IACondo#Demo2026!).</em></p>`;

  return {
    should_reply: true,
    stage: entities.readyForPersonalizedDemo ? 'demo_ready' : 'qualifying',
    extracted_condo: entities.condo,
    extracted_city: entities.city,
    extracted_units: entities.units,
    extracted_access: entities.hasAccessControl,
    extracted_phone: entities.phone,
    executive_summary: `${entities.condo || senderName} — Atendido por Sofía IA`,
    reply_html: `<p>¡Hola <strong>${senderName || ''}</strong>! 👋 Qué gusto saludarte de parte del equipo de <strong>IA Condo</strong>.</p>
      <p>Con <strong>IA Condo</strong> automatizamos la emisión de recibos en USD/Bs a la <strong>tasa oficial del BCV del día del pago</strong>, la conciliación bancaria con IA (Pago Móvil, transferencias y Zelle), el control de morosidad en tiempo real y el control de acceso/portón inteligente.</p>
      ${demoSection}`,
  };
}

async function processMailboxAccount(accountConfig, geminiKey, lookbackDays = 7) {
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
  let ignoredCount = 0;

  try {
    await client.connect();
    const lock = await client.getMailboxLock('INBOX');
    try {
      const sinceDate = new Date(Date.now() - Math.max(1, Number(lookbackDays) || 7) * 24 * 60 * 60 * 1000);
      const uids = await client.search({ answered: false, since: sinceDate }, { uid: true });

      for (const uid of uids.slice(-15)) {
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

        const rawText = (parsed.text || parsed.html || '').trim();
        const cleanBody = rawText.split(/\nOn .* wrote:|\nEl .* escribió:|\nDe: /i)[0].trim() || rawText.slice(0, 1500);

        if (shouldIgnoreMessage(senderEmail, senderName, subject, cleanBody)) {
          await client.messageFlagsAdd(uid, ['\\Answered', '\\Seen'], { uid: true });
          ignoredCount++;
          continue;
        }

        const aiDecision = await analyzeAndGenerateReply({
          project,
          senderName,
          senderEmail,
          subject,
          bodyText: cleanBody,
          geminiKey,
        });

        await client.messageFlagsAdd(uid, ['\\Answered', '\\Seen'], { uid: true });

        if (!aiDecision.should_reply || aiDecision.ignored_bot) {
          ignoredCount++;
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
            ? '🟢 DEMO PERSONALIZADO ENVIADO'
            : aiDecision.stage === 'support_escalated'
            ? '🟠 CASO DE SOPORTE / PUNTUAL'
            : '🔵 EN CALIFICACIÓN POR SOFÍA IA';

        const cleanOdooSubject = aiDecision.extracted_condo
          ? `${aiDecision.extracted_condo}${aiDecision.extracted_units ? ' — ' + aiDecision.extracted_units : ''} · ${senderName}`
          : `${senderName} — ${subject}`;

        await transporter.sendMail({
          from: `"${senderName} (${brandName})" <${emailUser}>`,
          replyTo: `"${senderName}" <${senderEmail}>`,
          to: odooAlias,
          subject: cleanOdooSubject,
          inReplyTo: messageId || undefined,
          references: threadRefs || undefined,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
              <div style="background: #f8fafc; border-left: 4px solid ${brandColor}; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                <strong>🤖 Seguimiento Automático de Sofía IA:</strong> ${stageBadge}<br/>
                <strong>Resumen IA:</strong> ${aiDecision.executive_summary || 'Respondido automáticamente'}<br/>
                ${aiDecision.extracted_condo ? `<strong>Condominio:</strong> ${aiDecision.extracted_condo}<br/>` : ''}
                ${aiDecision.extracted_city ? `<strong>Ciudad:</strong> ${aiDecision.extracted_city}<br/>` : ''}
                ${aiDecision.extracted_units ? `<strong>Viviendas:</strong> ${aiDecision.extracted_units}<br/>` : ''}
                ${aiDecision.extracted_access ? `<strong>Control de Acceso:</strong> ${aiDecision.extracted_access === 'si' ? 'Sí' : 'No'}<br/>` : ''}
                ${aiDecision.extracted_phone ? `<strong>WhatsApp/Tel:</strong> ${aiDecision.extracted_phone}<br/>` : ''}
              </div>
              <p><strong>📩 Mensaje recibido de ${senderName} (${senderEmail}):</strong></p>
              <blockquote style="background: #f1f5f9; padding: 10px; border-radius: 6px;">${cleanBody}</blockquote>
              <p><strong>📤 Respuesta enviada automáticamente por Sofía IA:</strong></p>
              <div style="background: #ecfdf5; padding: 12px; border-radius: 6px;">${aiDecision.reply_html}</div>
            </div>
          `,
        });

        processed.push({
          project,
          uid,
          from: senderEmail,
          senderName,
          subject,
          stage: aiDecision.stage,
          condo: aiDecision.extracted_condo,
          city: aiDecision.extracted_city,
          units: aiDecision.extracted_units,
          accessControl: aiDecision.extracted_access,
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
    return { project, emailUser, error: String(err), processed, ignoredCount };
  }

  return { project, emailUser, processed, ignoredCount };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyD6qTMrJN38VEaFv31JBPWI33M2U7EpP9c';
  const lookbackDays = Number(req.body?.lookbackDays || req.query?.lookbackDays || 7);

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
    const r = await processMailboxAccount(acc, geminiKey, lookbackDays);
    results.push(r);
  }

  return res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    agent: 'Sofía IA — Autonomous Inbox & Odoo CRM Worker (Personalized Demo + Anti-Bot)',
    results,
  });
}
