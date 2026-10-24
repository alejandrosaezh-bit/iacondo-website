export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, agent: 'Sofía IA (Gemini Flash + MongoDB Memory)' });
  }

  try {
    const body = req.body || {};
    const sessionId = body.sessionId || body.sender_id || `web_${Date.now()}`;
    const senderName = body.senderName || body.sender_name || 'Visitante Web';
    const senderPhone = body.senderPhone || body.sender_id || '';
    const text = body.text || body.message_text || 'Hola';

    const backendRes = await fetch('https://condopro-api.onrender.com/api/sofia-whatsapp/web-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        senderName,
        senderPhone,
        text,
        reset: Boolean(body.reset),
      }),
    });

    const data = await backendRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({
      ok: true,
      reply: '¡Hola! Te leo perfecto. ¿Me comentas en qué ciudad está ubicado tu condominio o cuál es tu consulta?',
    });
  }
}
