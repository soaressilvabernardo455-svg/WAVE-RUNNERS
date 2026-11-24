import express from 'express';
import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { randomBytes, randomUUID } from 'node:crypto';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws', perMessageDeflate: false });
const PORT = process.env.PORT || 3000;
const MAX_ROOM_CAPACITY = 100;
const DEFAULT_ROOM_ID = 'river-rush-3';
const rooms = new Map();

function makeRoom({ id, name, isPublic, password = '' }) {
  return {
    id,
    name,
    isPublic,
    password,
    capacity: MAX_ROOM_CAPACITY,
    players: new Map(),
    createdAt: Date.now()
  };
}

rooms.set(DEFAULT_ROOM_ID, makeRoom({
  id: DEFAULT_ROOM_ID,
  name: 'Rio público',
  isPublic: true
}));

app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    game: 'Wave Runner',
    rooms: rooms.size,
    players: [...rooms.values()].reduce((total, room) => total + room.players.size, 0)
  });
});

app.get('/api/status', (_req, res) => {
  const roomsStatus = [...rooms.values()].map(room => ({
    name: room.name,
    id: room.id,
    players: room.players.size,
    capacity: room.capacity,
    public: room.isPublic
  }));
  res.json({ online: true, rooms: roomsStatus });
});

app.get('/api/rooms', (_req, res) => {
  const publicRooms = [...rooms.values()]
    .filter(room => room.isPublic)
    .map(room => ({
      id: room.id,
      name: room.name,
      players: room.players.size,
      capacity: room.capacity
    }))
    .sort((a, b) => b.players - a.players);
  res.json({ rooms: publicRooms });
});

app.post('/api/rooms', (req, res) => {
  const name = String(req.body?.name || 'Minha sala')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 24) || 'Minha sala';
  const isPublic = req.body?.visibility !== 'private';
  const password = isPublic ? '' : String(req.body?.password || '').trim().slice(0, 24);

  if (!isPublic && password.length < 3) {
    return res.status(400).json({ error: 'A senha precisa ter pelo menos 3 caracteres.' });
  }

  let id;
  do {
    id = 'WR-' + randomBytes(3).toString('hex').toUpperCase();
  } while (rooms.has(id));

  const room = makeRoom({ id, name, isPublic, password });
  rooms.set(id, room);
  res.status(201).json({
    id: room.id,
    name: room.name,
    public: room.isPublic,
    capacity: room.capacity
  });
});

app.use(express.static('public', { extensions: ['html'] }));

function send(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function snapshot(room) {
  return [...room.players.values()].map(({ id, name, x, y, z, distance, coins }) => ({
    id, name, x, y, z, distance, coins
  }));
}

function broadcast(room, data, except = null) {
  for (const player of room.players.values()) {
    if (player.ws !== except) send(player.ws, data);
  }
}

function broadcastSnapshot(room) {
  broadcast(room, {
    type: 'snapshot',
    room: room.id,
    capacity: room.capacity,
    players: snapshot(room)
  });
}

function safeNumber(value, fallback, min, max) {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
}

function safeName(value) {
  return String(value || 'SURFISTA')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16) || 'SURFISTA';
}

function findRoom(id) {
  const key = String(id || DEFAULT_ROOM_ID).trim().toLowerCase();
  for (const room of rooms.values()) {
    if (room.id.toLowerCase() === key) return room;
  }
  return null;
}

wss.on('connection', ws => {
  const id = randomUUID();
  let joinedRoom = null;
  let player = null;
  ws.isAlive = true;

  ws.on('pong', () => { ws.isAlive = true; });
  send(ws, { type: 'hello', id });

  ws.on('message', raw => {
    let message;
    try { message = JSON.parse(raw.toString()); } catch { return; }

    if (message.type === 'join') {
      if (player) return;
      const room = findRoom(message.room);
      if (!room) {
        send(ws, { type: 'room-not-found' });
        ws.close(1000, 'room not found');
        return;
      }
      if (room.password && String(message.password || '') !== room.password) {
        send(ws, { type: 'wrong-password' });
        ws.close(1000, 'wrong password');
        return;
      }
      if (room.players.size >= room.capacity) {
        send(ws, { type: 'room-full' });
        ws.close(1000, 'room full');
        return;
      }

      joinedRoom = room;
      player = {
        id,
        ws,
        name: safeName(message.name),
        x: 0,
        y: 0,
        z: 3,
        distance: 0,
        coins: 0,
        updated: Date.now()
      };
      room.players.set(id, player);
      send(ws, {
        type: 'welcome',
        id,
        room: room.id,
        roomName: room.name,
        capacity: room.capacity,
        public: room.isPublic,
        players: room.players.size
      });
      broadcastSnapshot(room);
      return;
    }

    if (message.type === 'ping') {
      send(ws, { type: 'pong', sentAt: message.sentAt });
      return;
    }

    if (message.type === 'rename' && player && joinedRoom) {
      player.name = safeName(message.name);
      broadcastSnapshot(joinedRoom);
      return;
    }

    if (message.type === 'state' && player && joinedRoom) {
      player.x = safeNumber(message.x, player.x, -6, 6);
      player.y = safeNumber(message.y, 0, 0, 8);
      player.z = safeNumber(message.z, 3, -150, 30);
      player.distance = safeNumber(message.distance, player.distance, 0, 100000000);
      player.coins = safeNumber(message.coins, player.coins, 0, 100000);
      player.updated = Date.now();
    }
  });

  ws.on('close', () => {
    if (!joinedRoom || !player) return;
    joinedRoom.players.delete(id);
    broadcastSnapshot(joinedRoom);
    if (joinedRoom.id !== DEFAULT_ROOM_ID && joinedRoom.players.size === 0) {
      rooms.delete(joinedRoom.id);
    }
  });
  ws.on('error', () => {});
});

// Heartbeat and snapshots are deliberately moderate to avoid flooding mobile connections.
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
}, 20000);

const snapshotLoop = setInterval(() => {
  for (const room of rooms.values()) {
    if (room.players.size) broadcastSnapshot(room);
  }
}, 200);

server.listen(PORT, '0.0.0.0', () => console.log('Wave Runner online on port ' + PORT));
server.on('close', () => {
  clearInterval(heartbeat);
  clearInterval(snapshotLoop);
});
