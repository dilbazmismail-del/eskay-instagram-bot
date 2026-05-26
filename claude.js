const Anthropic = require('@anthropic-ai/sdk');
const SYSTEM_PROMPT = require('./system-prompt');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const conversations = new Map();
const MAX_HISTORY = 20;
async function getReply(senderId, userMessage) {
  if (!conversations.has(senderId)) conversations.set(senderId, []);
  const history = conversations.get(senderId);
  history.push({ role: 'user', content: userMessage });
  if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: history
    });
    const reply = response.content[0].text;
    history.push({ role: 'assistant', content: reply });
    return reply;
  } catch (error) {
    console.error('Claude API hatasi:', error.message);
    throw error;
  }
}
function clearConversation(senderId) { conversations.delete(senderId); }
module.exports = { getReply, clearConversation };