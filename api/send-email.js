import nodemailer from 'nodemailer';

/**
 * Vercel Serverless Function: /api/send-email
 * Relay transaccional HTTPS para IA Condo (www.iacondo.com y app.iacondo.com).
 * Permite enviar correos transaccionales (recuperación de contraseñas, bienvenida,
 * notificaciones de condominio y soporte) a través de IONOS SMTP (@iacondo.com)
 * sin bloqueos de puertos SMTP en proveedores cloud como Render.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Internal-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const expectedKey = process.env.INTERNAL_EMAIL_KEY || 'iacondo_internal_mail_2026';
  const providedKey =
    req.headers['x-internal-key'] ||
    (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '') ||
    req.body?.internalKey;

  if (providedKey !== expectedKey) {
    return res.status(401).json({ error: 'No autorizado para envío de correo transaccional.' });
  }

  const {
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    fromName,
    fromEmail,
    replyTo,
    customSmtp,
  } = req.body || {};

  if (!to || !subject || (!html && !text)) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos (to, subject, html/text).' });
  }

  const smtpHost = customSmtp?.host || process.env.SMTP_HOST || 'smtp.ionos.es';
  const smtpPort = Number(customSmtp?.port || process.env.SMTP_PORT || 465);
  const smtpUser = customSmtp?.user || process.env.SMTP_USER || 'hola@iacondo.com';
  const smtpPass = customSmtp?.pass || process.env.SMTP_PASS || 'IACondo2026!Venezuela#99';

  const senderName = (fromName || 'IA Condo').replace(/"/g, '');
  // Para evitar rechazos SPF/DKIM en IONOS, el remitente autenticado debe coincidir con smtpUser
  // o ser un buzón autorizado del mismo dominio, usando replyTo para respuestas específicas.
  const senderAddress = customSmtp?.user ? customSmtp.user : smtpUser;
  const replyToHeader = replyTo || fromEmail || 'soporte@iacondo.com';

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderAddress}>`,
      replyTo: replyToHeader,
      to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      subject,
      html: html || undefined,
      text: text || undefined,
    });

    return res.status(200).json({
      ok: true,
      messageId: info.messageId,
      to,
    });
  } catch (error) {
    console.error('Error en /api/send-email:', error);
    return res.status(500).json({
      ok: false,
      error: 'Error enviando correo vía SMTP',
      details: String(error?.message || error),
    });
  }
}
