const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
app.use(cors());

const rooms = {};
const socketIdtoUsernameMap = new Map();
const socketIdtoRoomIdMap = new Map();

app.get('/checkRoom/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  if (!rooms[roomId]) {
    return res.json({ isRoom: false });
  }
  res.json({ isRoom: true });
});

io.on('connection', (socket) => {
  // console.log('User connected.');
  const username = socket.handshake.query.username;
  socketIdtoUsernameMap.set(socket.id, username);
  socket.on('create-room', async ({ roomId }) => {
    socketIdtoRoomIdMap.set(socket.id, roomId);
    rooms[roomId] = [socket.id];
    await socket.join(roomId);
    console.log(username + ' created room - ' + roomId);
  });

  socket.on('join-room', async ({ roomId }) => {
    if (!rooms[roomId]) {
      console.log('No such room');
      socket.emit('error', { message: 'No such room found' });
      return;
    }
    if (!rooms[roomId]?.includes(socket.id)) {
      rooms[roomId].push(socket.id);
    }
    socketIdtoRoomIdMap.set(socket.id, roomId);
    await socket.join(roomId);
    console.log(username + ' joined room - ' + roomId);
    socket.broadcast.to(roomId).emit('new-user', { username });
  });

  socket.on('offer-to', ({ offer, to, from }) => {
    let toSocketId = '';
    socketIdtoUsernameMap.forEach((value, key) => {
      if (value == to) {
        toSocketId = key;
      }
    });
    socket.broadcast.to(toSocketId).emit('offer', { offer, username: from });
  });

  socket.on('answer-to', ({ answer, to, from }) => {
    let toSocketId = '';
    socketIdtoUsernameMap.forEach((value, key) => {
      if (value == to) {
        toSocketId = key;
      }
    });
    socket.broadcast.to(toSocketId).emit('answer', { answer, username: from });
  });

  socket.on('ice-candidate', ({ iceCandidate }) => {
    socket.broadcast
      .to(socketIdtoRoomIdMap.get(socket.id))
      .emit('ice-candidate', {
        iceCandidate,
        username: socketIdtoUsernameMap.get(socket.id),
      });
  });

  socket.on('disconnect', async () => {
    socketIdtoUsernameMap.delete(socket.id);
    const key = Object.keys(rooms).find(
      (key) => rooms[key] && rooms[key].includes(socket.id)
    );
    if (rooms[key]) {
      rooms[key] = rooms[key]?.filter((value) => value != socket.id);
    }
  });
});

server.listen(3000, () => console.log('Server running on PORT 3000'));
