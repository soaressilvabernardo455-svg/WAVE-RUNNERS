import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomUUID } from 'node:crypto';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws', perMessageDeflate: false });
const PORT = process.env.PORT || 3000;
const rooms = new Map();

app.use(express.static('public', { extensions: ['html'] }));
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    game: 'Wave Runner',
    players: [...rooms.values()].reduce((total, room) => total + room.size, 0)
  });
});
app.get('/api/status', (_req, res) => {
  const roomsStatus = [...rooms.entries()].map(([name, room]) => ({ name, players: room.size, capacity: 3 }));
  res.json({ online: true, rooms: roomsStatus });
});

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}
function snapshot(room) {
  return [...room.values()].map(({ id, x, y, z, distance, coins }) => ({ id, x, y, z, distance, coins }));
}
function broadcast(room, data, except = null) {
  for (const player of room.values()) {
    if (player.ws !== except) send(player.ws, data);
  }
}
function safeNumber(value, fallback, min, max) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

wss.on('connection', ws => {
  const id = randomUUID();
  let roomName = null;
  let player = null;
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  send(ws, { type: 'hello', id });

  ws.on('message', raw => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }

    if (message.type === 'join') {
      if (player) return;
      roomName = String(message.room || 'river-rush-3').slice(0, 32);
      if (!rooms.has(roomName)) rooms.set(roomName, new Map());
      const room = rooms.get(roomName);
      if (room.size >= 3) {
        send(ws, { type: 'room-full' });
        ws.close(1000, 'room full');
        if (room.size === 0) rooms.delete(roomName);
        return;
      }
      player = {
        id, ws, x: 0, y: 0, z: 3, distance: 0, coins: 0,
        updated: Date.now()
      };
      room.set(id, player);
      send(ws, { type: 'welcome', id, room: roomName, players: room.size });
      broadcast(room, { type: 'snapshot', players: snapshot(room) });
      return;
    }

    if (message.type === 'ping') {
      send(ws, { type: 'pong', sentAt: message.sentAt });
      return;
    }

    if (message.type === 'state' && player) {
      player.x = safeNumber(message.x, player.x, -6, 6);
      player.y = safeNumber(message.y, 0, 0, 8);
      player.z = safeNumber(message.z, 3, -150, 30);
      player.distance = safeNumber(message.distance, player.distance, 0, 100000000);
      player.coins = safeNumber(message.coins, player.coins, 0, 100000);
      player.updated = Date.now();
    }
  });

  ws.on('close', () => {
    if (!roomName) return;
    const room = rooms.get(roomName);
    if (!room) return;
    room.delete(id);
    broadcast(room, { type: 'snapshot', players: snapshot(room) });
    if (room.size === 0) rooms.delete(roomName);
  });
  ws.on('error', () => {});
});

// Keep connections alive on mobile networks and publish compact player snapshots.
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
  for (const room of rooms.values()) {
    broadcast(room, { type: 'snapshot', players: snapshot(room) });
  }
}, 250);

server.listen(PORT, '0.0.0.0', () => console.log('Wave Runner online on port ' + PORT));
server.on('close', () => clearInterval(heartbeat));
