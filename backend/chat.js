import WebSocket from 'ws';
import { updateUserActivity } from './database.js';

export function startChatListener(channelSlug) {
  const ws = new WebSocket('wss://chat.kick.com/socket.io/?EIO=4&transport=websocket');

  ws.on('open', () => {
    console.log('Conectado al chat de Kick');
  });

  ws.on('message', (data) => {
    if (typeof data === 'string' && data.includes('42["chatMessage"')) {
      const msg = JSON.parse(data.replace(/^42/, ''))[1];
      if (msg && msg.sender && msg.sender.username) {
        updateUserActivity(msg.sender.username);
        console.log(`Mensaje de ${msg.sender.username}`);
      }
    }
  });

  ws.on('close', () => {
    console.log('Chat desconectado. Reconectando en 5s...');
    setTimeout(() => startChatListener(channelSlug), 5000);
  });
}