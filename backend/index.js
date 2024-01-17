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
    rooms[roomId] = [socket.id];
    await socket.join(roomId);
    console.log(username + ' joined room - ' + roomId);
  });

  socket.on('join-room', async ({ roomId }) => {
    rooms[roomId].push(socket.id);
    await socket.join(roomId);
    console.log(username + ' joined room - ' + roomId);
    socket.emit('new-user', { username: socketIdtoUsernameMap.get(socket.id) });
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
