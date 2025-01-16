const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST'],
  },
});

const roomUserMap = {}; // Map to hold usernames by room ID

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', (roomId) => {
    socket.join(roomId);
    roomUserMap[roomId] = roomUserMap[roomId] || [];
    socket.emit('roomCreated', roomId);
    console.log(`Room created with ID: ${roomId}`);
  });

  socket.on('joinRoom', ({ roomId, username }) => {
    if (io.sockets.adapter.rooms.has(roomId)) {  // Check if room exists
      socket.join(roomId);
      console.log(`Room ${roomId} exists, user ${username} joining`);

      // Add username to roomUserMap if not already present
      roomUserMap[roomId] = roomUserMap[roomId] || [];
      roomUserMap[roomId].push({ id: socket.id, username });

      // Emit roomJoined to the user who joined
      socket.emit('roomJoined', roomId);
      console.log(`Emitting 'roomJoined' for user ${username} in room ${roomId}`);

      // Notify all users in the room with the updated user list
      io.to(roomId).emit('userList', roomUserMap[roomId]);
      console.log(`Updated user list for room ${roomId}:`, roomUserMap[roomId]);
    } else {
      socket.emit('error', 'Room does not exist');
      console.log(`Error: Room ${roomId} does not exist`);
    }
  });



  socket.on('makeMove', (data) => {
    const { roomId, piece, position } = data;
    socket.to(roomId).emit('opponentMove', { piece, position });
    console.log(`Move in room ${roomId}:`, data);
  });


  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      if (roomUserMap[roomId]) {
        // Remove user from roomUserMap
        roomUserMap[roomId] = roomUserMap[roomId].filter(user => user.id !== socket.id);

        // Emit updated user list to remaining users in the room
        socket.to(roomId).emit('userList', roomUserMap[roomId]);
      }
    });
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});