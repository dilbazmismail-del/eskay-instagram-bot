require('dotenv').config();
const express = require('express');
const { getReply } = require('./claude');
const { sendMessage, parseIncomingMessage } = require('./instagram');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

// Saglik kontrolu
app.get('/', (req, res) => {
  res.json({ status: 'Eskay Ahsap Bot - Aktif', time: new Date().toISOString() });
});

// Webhook dogrulama (Meta bir kere cagirir)
app.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook dogrulandi.');
    res.status(200).send(challenge);
  } else {
    console.error('Webhook dogrulama hatasi - token eslesmiyor');
    res.sendStatus(403);
  }
});

// Gelen mesajlari isle (dogrudan Meta webhook)
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const messages = parseIncomingMessage(req.body);
  for (const { senderId, text } of messages) {
    console.log(`Yeni mesaj [${senderId}]: ${text}`);
    try {
      const reply = await getReply(senderId, text);
      await sendMessage(senderId, reply);
    } catch (err) {
      console.error(`Hata [${senderId}]:`, err.message);
      try {
        await sendMessage(senderId, 'Simdilik bir sorun olustu. Lutfen 0553 281 48 98 numarayi arayin.');
      } catch (_) {}
    }
  }
});

// ManyChat entegrasyonu
// ManyChat bu endpoint'e POST atar, Claude yanit uretir,
// ManyChat kullaniciya gondermek uzere JSON alir.
app.post('/manychat', async (req, res) => {
  const userId = (req.body?.subscriber?.id) || req.body?.user_id || 'anon';
  const text   = req.body?.text || req.body?.message || '';

  console.log(`ManyChat mesaj [${userId}]: ${text}`);

  if (!text.trim()) {
    return res.json({
      messages: [{ type: 'text', text: 'Mesajinizi aliyorum, lutfen sorunuzu yazin.' }]
    });
  }

  try {
    const reply = await getReply(userId, text);
    res.json({ messages: [{ type: 'text', text: reply }] });
  } catch (err) {
    console.error(`ManyChat hata [${userId}]:`, err.message);
    res.json({
      messages: [{ type: 'text', text: 'Simdilik bir sorun olustu. Lutfen 0553 281 48 98 numarayi arayin.' }]
    });
  }
});

app.listen(PORT, () => {
  console.log(`Eskay Ahsap Bot calisiyor -> port ${PORT}`);
});

module.exports = app;
