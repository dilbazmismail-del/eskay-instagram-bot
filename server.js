require('dotenv').config();
const express = require('express');
const { getReply } = require('./claude');
const { sendMessage, parseIncomingMessage } = require('./instagram');
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
app.get('/', (req, res) => { res.json({ status: 'Eskay Ahsap Bot - Aktif', time: new Date().toISOString() }); });
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook dogrulandı.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});
app.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  const messages = parseIncomingMessage(req.body);
  for (const { senderId, text } of messages) {
    try {
      const reply = await getReply(senderId, text);
      await sendMessage(senderId, reply);
    } catch (err) {
      try { await sendMessage(senderId, 'Simdilik bir sorun olustu. Lutfen 0553 281 48 98 numarayi arayin.'); } catch (_) {}
    }
  }
});
app.listen(PORT, () => { console.log('Eskay Ahsap Bot calisiyor -> port ' + PORT); });
module.exports = app;