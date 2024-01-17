const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { uuid } = require('uuidv4');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = {};
const socketIdtoUsernameMap = new Map();
const socketIdtoRoomIdMap = new Map();

app.get('/', (req, res) => {
  res.json({ message: 'Test' });
});

io.on('connection', (socket) => {
  // console.log('User connected.');
  const username = socket.handshake.query.username;
  socketIdtoUsernameMap.set(socket.id, username);
  console.log(socket.id);
  socket.on('create-room', async () => {
    const roomId = uuid();
    socketIdtoRoomIdMap.set(socket.id, roomId);
    rooms[roomId] = [socket.id];
    await socket.join(roomId);
    console.log(username + ' joined room - ' + roomId);
  });

  socket.on('join-room', async ({ roomId }) => {
    if (!rooms.roomId) {
      socket.emit('error', { message: 'No such room found' });
      return;
    }
    rooms[roomId].push(socket.id);
    socketIdtoRoomIdMap.set(socket.id, roomId);
    await socket.join(roomId);
    console.log(username + ' joined room - ' + roomId);
    socket.emit('new-user', { username });
  });

  socket.on('offer-to', ({ offer, username }) => {
    const toSocketId = Object.keys(socketIdtoUsernameMap).find(
      (key) => socketIdtoUsernameMap.get(key) == username
    );
    socket.broadcast.to(toSocketId).emit('offer', { offer, username });
  });

  socket.on('answer', ({ answer, username }) => {
    socket.broadcast
      .to(socketIdtoRoomIdMap.get(socket.id))
      .emit('answer', { answer, username });
  });

  socket.on('ice-candidate', ({ iceCandidate, username }) => {
    socket.broadcast
      .to(socketIdtoRoomIdMap.get(socket.id))
      .emit('ice-candidate', { iceCandidate, username });
  });

  socket.on('disconnect', async () => {
    socketIdtoUsernameMap.delete(socket.id);
    const key = Object.keys(rooms).find((key) =>
      rooms[key].includes(socket.id)
    );
    rooms[key] = rooms[key].filter((value) => value != socket.id);
  });
});

server.listen(3000, () => console.log('Server running on PORT 3000'));
