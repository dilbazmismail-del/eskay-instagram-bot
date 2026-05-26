const axios = require('axios');
const GRAPH_API = 'https://graph.facebook.com/v19.0';
async function sendMessage(recipientId, messageText) {
  try {
    const r = await axios.post(GRAPH_API+'/me/messages', {recipient:{id:recipientId},message:{text:messageText}},{params:{access_token:process.env.PAGE_ACCESS_TOKEN}});
    return r.data;
  } catch(e){ console.error('mesaj hatasi:',e.response?.data||e.message); throw e; }
}
function parseIncomingMessage(body) {
  const results=[];
  if(body.object!=='instagram') return results;
  for(const entry of body.entry||[]){
    for(const m of entry.messaging||[]){
      if(m.sender?.id&&m.message?.text&&!m.message?.is_echo){results.push({senderId:m.sender.id,text:m.message.text});}
    }
  }
  return results;
}
module.exports={sendMessage,parseIncomingMessage};