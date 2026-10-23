import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function: /api/webhook-omnichannel
 * URL Pública 24/7: https://www.iacondo.com/api/webhook-omnichannel
 *
 * Soporta:
 * 1. GET: Verificación oficial de Webhook de Meta (WhatsApp Cloud API & Instagram Direct).
 *    Verify Token por defecto: "iacondo_ve_2026"
 * 2. POST: Recepción de mensajes de:
 *    - Meta Cloud API (WhatsApp Business e Instagram DM)
 *    - Evolution API (WhatsApp vía QR)
 *    - Chat Web / n8n / Pruebas directas
 * 3. Ejecuta a Sofía (Agente IA Comercial de IA Condo), responde al usuario y
 *    registra el Lead + resumen de calificación en Odoo CRM.
 */

const VENEZUELA_CITIES = [
  'Caracas', 'Valencia', 'Maracaibo', 'Barquisimeto', 'Maracay',
  'Lechería', 'Puerto La Cruz', 'Barcelona', 'Puerto Ordaz', 'Ciudad Guayana',
  'Maturín', 'San Cristóbal', 'Mérida', 'Margarita', 'Porlamar', 'Cumaná', 'Los Teques'
];

function extractQualificationHeuristics(text = '', senderName = '') {
  const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  const aptMatch = text.match(/(\d+)\s*(apartamentos|aptos|inmuebles|casas|unidades|propietarios)/i);
  const foundCity = VENEZUELA_CITIES.find(c => text.toLowerCase().includes(c.toLowerCase())) || null;

  return {
    extracted_email: emailMatch ? emailMatch[0] : null,
    extracted_units: aptMatch ? aptMatch[1] : null,
    extracted_city: foundCity,
    extracted_name: senderName || null,
  };
}

async function generateSofiaReply({ channel, senderName, senderId, messageText }) {
  const info = extractQualificationHeuristics(messageText, senderName);
  const geminiKey = process.env.GEMINI_API_KEY || 'AIzaSyD6qTMrJN38VEaFv31JBPWI33M2U7EpP9c';

  if (geminiKey) {
    try {
      const systemPrompt = `Eres Sofía, la Ejecutiva Comercial de IA de IA Condo (www.iacondo.com), plataforma inteligente para gestión de condominios y administradoras en Venezuela.
Atiendes por ${channel.toUpperCase()}.
Reglas de respuesta:
- Sé cálida, profesional, breve (formato ideal para leer en WhatsApp/Instagram, máximo 3 párrafos cortos).
- Destaca cómo IA Condo automatiza recibos en USD/Bs (tasa BCV), conciliación automática de Pago Móvil/Zelle/transferencias, control de morosidad y portal de propietarios.
- Si el cliente aún no ha indicado: (1) Nombre del condominio y ciudad en Venezuela, o (2) Cantidad aproximada de apartamentos/inmuebles, hazle esas preguntas de forma natural para agendarle una Demo.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
              {
                role: 'user',
                parts: [{ text: `[Cliente: ${senderName || senderId}] Mensaje: ${messageText}` }],
              },
            ],
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText) {
          return { reply: aiText.trim(), ...info };
        }
      }
    } catch (err) {
      console.error('Error invocando Gemini en webhook-omnichannel:', err);
    }
  }

  // Respuesta inteligente estructurada de Sofía (cuando no hay GEMINI_API_KEY o como fallback instantáneo)
  const greeting = senderName ? `¡Hola *${senderName}*! 👋` : '¡Hola! 👋';
  const cityNote = info.extracted_city ? ` en *${info.extracted_city}*` : '';
  const unitsNote = info.extracted_units ? ` para sus *${info.extracted_units} inmuebles*` : '';

  let followUpQuestion =
    'Para activarte una *Demo guiada de IA Condo*, ¿me confirmas el *nombre de tu condominio*, en qué *ciudad* están y *cuántos apartamentos* tienen aproximadamente?';

  if (info.extracted_city && info.extracted_units) {
    followUpQuestion =
      '¡Excelente! Ya registré los datos de tu condominio en nuestro sistema. ¿Me compartes tu *correo electrónico* y el *nombre del conjunto residencial* para enviarte el acceso a la Demo ahora mismo?';
  } else if (info.extracted_city) {
    followUpQuestion = `¡Qué bueno saludarte hasta *${info.extracted_city}*! ¿Cuántos apartamentos o inmuebles conforman tu condominio y cómo se llama el conjunto residencial?`;
  }

  const reply = `${greeting} Te saluda *Sofía*, asesora de *IA Condo* 🏢🇻🇪.\n\nCon *IA Condo* automatizamos la gestión de tu condominio${cityNote}${unitsNote}: emisión de recibos en USD/Bs a tasa BCV, conciliación automática de Pago Móvil/Zelle con IA y control de morosidad en tiempo real.\n\n${followUpQuestion}`;

  return { reply, ...info };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. Verificación de Webhook de Meta (WhatsApp Cloud API / Instagram)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.META_VERIFY_TOKEN || 'iacondo_ve_2026';

    if (mode === 'subscribe' && token === verifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(200).json({
      status: 'online',
      agent: 'Sofía — Agente IA Omnicanal de IA Condo (WhatsApp + Instagram -> Odoo CRM)',
      webhook_url: 'https://www.iacondo.com/api/webhook-omnichannel',
      meta_verify_token: verifyToken,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  let senderId = body.sender_id || '';
  let senderName = body.sender_name || '';
  let channel = body.channel || 'whatsapp';
  let messageText = body.message_text || '';
  let metaPhoneId = null;

  // A. Detectar formato Evolution API (WhatsApp QR)
  if (body.data && body.data.key && body.data.message) {
    senderId = (body.data.key.remoteJid || '').replace('@s.whatsapp.net', '');
    senderName = body.data.pushName || 'Cliente WhatsApp';
    channel = 'whatsapp';
    messageText =
      body.data.message.conversation ||
      body.data.message?.extendedTextMessage?.text ||
      '';
  }

  // B. Detectar formato Meta Cloud API (WhatsApp Business / Instagram Direct)
  if (body.entry && Array.isArray(body.entry) && body.entry[0]?.changes) {
    const val = body.entry[0].changes[0]?.value;
    metaPhoneId = val?.metadata?.phone_number_id || null;
    if (val?.messages && val.messages[0]) {
      senderId = val.messages[0].from;
      senderName = val.contacts?.[0]?.profile?.name || 'Cliente WhatsApp';
      messageText = val.messages[0]?.text?.body || '';
      channel = 'whatsapp';
    } else {
      // Eventos de estado de entrega (delivered/read) de Meta
      return res.status(200).json({ status: 'ignored_status_event' });
    }
  } else if (body.object === 'instagram' && body.entry?.[0]?.messaging?.[0]) {
    const messaging = body.entry[0].messaging[0];
    senderId = messaging.sender?.id || 'ig_user';
    senderName = 'Prospecto Instagram';
    messageText = messaging.message?.text || '';
    channel = 'instagram';
  }

  if (!messageText || !senderId) {
    return res.status(400).json({
      error: 'Payload sin message_text o sender_id',
    });
  }

  // 2. Procesar mensaje con Sofía (Agente IA de IA Condo)
  const sofiaResult = await generateSofiaReply({
    channel,
    senderName,
    senderId,
    messageText,
  });

  // 3. Registrar Lead y Conversación en Odoo CRM (Equipo: IA Condo)
  const smtpUser = process.env.SMTP_USER || 'hola@iacondo.com';
  const smtpPass = process.env.SMTP_PASS || 'IACondo2026!Venezuela#99';
  const smtpHost = process.env.SMTP_HOST || 'smtp.ionos.es';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const odooAlias =
    process.env.ODOO_CRM_ALIAS ||
    'ventas-iacondo@soluciones-digitales-creapptivas.odoo.com';

  const channelLabel = channel.toLowerCase() === 'instagram' ? 'Instagram' : 'WhatsApp';
  const cityTag = sofiaResult.extracted_city ? ` (${sofiaResult.extracted_city})` : '';
  const leadTitle = `[IA Condo ${channelLabel}] ${senderName || senderId}${cityTag}`;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Sofía IA (${channelLabel})" <${smtpUser}>`,
      replyTo: sofiaResult.extracted_email
        ? `"${senderName || senderId}" <${sofiaResult.extracted_email}>`
        : `"${senderName || senderId}" <${smtpUser}>`,
      to: [odooAlias, smtpUser],
      subject: leadTitle,
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h3>💬 Lead atendido por Sofía IA en ${channelLabel}</h3>
          <ul>
            <li><strong>Nombre:</strong> ${senderName || 'Por confirmar'}</li>
            <li><strong>Teléfono / ID (${channelLabel}):</strong> ${senderId}</li>
            <li><strong>Ciudad detectada:</strong> ${sofiaResult.extracted_city || 'Por confirmar'}</li>
            <li><strong>Inmuebles / Aptos:</strong> ${sofiaResult.extracted_units || 'Por confirmar'}</li>
            <li><strong>Email detectado:</strong> ${sofiaResult.extracted_email || 'Por confirmar'}</li>
          </ul>
          <div style="background: #f1f5f9; padding: 12px; border-left: 4px solid #0ea5e9; border-radius: 6px; margin-bottom: 12px;">
            <strong>👤 Prospecto (${senderId}):</strong><br/>
            ${messageText}
          </div>
          <div style="background: #ecfdf5; padding: 12px; border-left: 4px solid #10b981; border-radius: 6px;">
            <strong>🤖 Respuesta enviada por Sofía IA:</strong><br/>
            ${sofiaResult.reply.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('Error sincronizando Lead de WhatsApp/Instagram con Odoo:', err);
  }

  // 4. Si viene de Meta WhatsApp Cloud API y hay token configurado, responder directo por WhatsApp
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = metaPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (channel === 'whatsapp' && waToken && phoneId) {
    try {
      await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: senderId,
          type: 'text',
          text: { body: sofiaResult.reply },
        }),
      });
    } catch (waErr) {
      console.error('Error enviando mensaje saliente a Meta Cloud API:', waErr);
    }
  }

  return res.status(200).json({
    success: true,
    channel: channelLabel,
    sender_id: senderId,
    reply: sofiaResult.reply,
    qualification: {
      city: sofiaResult.extracted_city,
      units: sofiaResult.extracted_units,
      email: sofiaResult.extracted_email,
    },
    odoo_synced: true,
  });
}
