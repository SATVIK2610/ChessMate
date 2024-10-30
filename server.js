// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000', // Your frontend URL
//     methods: ['GET', 'POST'],
//   },
// });

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   // Creating or joining a room
//   socket.on('createRoom', (roomId) => {
//     socket.join(roomId);
//     socket.emit('roomCreated', roomId);
//     console.log(`Room created with ID: ${roomId}`);
//   });

//   socket.on('joinRoom', (roomId) => {
//     if (io.sockets.adapter.rooms.get(roomId)) {
//       socket.join(roomId);
//       socket.emit('roomJoined', roomId);
//       console.log(`User joined room with ID: ${roomId}`);
//     } else {
//       socket.emit('error', 'Room does not exist');
//     }
//   });

//   // Broadcasting move within the room
//   socket.on('makeMove', (data) => {
//     const { roomId, piece, position } = data;
//     socket.to(roomId).emit('opponentMove', { piece, position });
//     console.log(`Move in room ${roomId}:`, data);
//   });

//   socket.on('disconnect', () => {
//     console.log('User disconnected');   
//   });
// });

// server.listen(4000, () => {
//   console.log('Server is running on port 4000');
// });

// USERNAME

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000', // Your frontend URL
//     methods: ['GET', 'POST'],
//   },
// });

// // Object to store usernames in each room
// const roomUserMap = {};

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   let currentRoomId = null; // Track the current room of the socket

//   // Creating or joining a room
//   socket.on('createRoom', (data) => {
//     const { roomId, username } = data;

//     // Initialize room entry if it doesn't exist
//     if (!roomUserMap[roomId]) {
//       roomUserMap[roomId] = [];
//     }

//     // Add username to the room
//     roomUserMap[roomId].push(username);
//     currentRoomId = roomId; // Update current room

//     socket.join(roomId);
//     socket.emit('roomCreated', roomId);

//     // Notify all clients in the room about the new user
//     io.to(roomId).emit('userListUpdated', roomUserMap[roomId]);

//     console.log(`Room created with ID: ${roomId} by ${username}`);
//   });

//   socket.on('joinRoom', (data) => {
//     const { roomId, username } = data;

//     if (io.sockets.adapter.rooms.get(roomId)) {
//       socket.join(roomId);

//       // Add username to the room
//       roomUserMap[roomId].push(username);
//       currentRoomId = roomId; // Update current room

//       socket.emit('roomJoined', roomId);

//       // Notify all clients in the room about the new user
//       io.to(roomId).emit('userListUpdated', roomUserMap[roomId]);

//       console.log(`User ${username} joined room with ID: ${roomId}`);
//     } else {
//       socket.emit('error', 'Room does not exist');
//     }
//   });

//   // Broadcasting move within the room
//   socket.on('makeMove', (data) => {
//     const { roomId, piece, position } = data;
//     socket.to(roomId).emit('opponentMove', { piece, position });
//     console.log(`Move in room ${roomId}:`, data);
//   });

//   // Handle user disconnection
//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);

//     // Remove username from the roomUserMap
//     if (currentRoomId) {
//       const usernameIndex = roomUserMap[currentRoomId].indexOf(socket.username);
//       if (usernameIndex !== -1) {
//         roomUserMap[currentRoomId].splice(usernameIndex, 1); // Remove username
//         // Notify remaining users in the room about the updated user list
//         io.to(currentRoomId).emit('userListUpdated', roomUserMap[currentRoomId]);
//       }
//     }
//   });
// });

// server.listen(4000, () => {
//   console.log('Server is running on port 4000');
// });

// USERNAME 2

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000', // Your frontend URL
//     methods: ['GET', 'POST'],
//   },
// });

// const roomUserMap = {}; // Map to hold usernames by room ID

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on('createRoom', (roomId) => {
//     console.log(roomId);
//     socket.join(roomId);
//     if (!roomUserMap[roomId]) {
//       roomUserMap[roomId] = [];
//     }
//     roomUserMap[roomId].push(socket.id); // Store user by socket ID
//     socket.emit('roomCreated', roomId);
//     console.log(`Room created with ID: ${roomId}`);
//   });

//   socket.on('joinRoom', ({ roomId, username }) => {
//     if (io.sockets.adapter.rooms.get(roomId)) {
//       socket.join(roomId);
//       if (!roomUserMap[roomId]) {
//         roomUserMap[roomId] = [];
//       }
//       roomUserMap[roomId].push(username); // Store username
//       socket.emit('roomJoined', roomId);
//       socket.to(roomId).emit('userJoined', { username, users: roomUserMap[roomId] });
//       console.log(`User ${username} joined room with ID: ${roomId}`);
//     } else {
//       socket.emit('error', 'Room does not exist');
//     }
//   });

//   socket.on('makeMove', (data) => {
//     const { roomId, piece, position } = data;

//     // Make sure roomId is treated as a string
//     if (typeof roomId !== 'string') {
//       console.error('Room ID is not a string:', roomId);
//       return;
//     }

//     socket.to(roomId).emit('opponentMove', { piece, position });
//     console.log(`Move in room ${roomId}:`, data);
//   });

//   socket.on('disconnecting', () => {
//     const rooms = [...socket.rooms];
//     rooms.forEach((roomId) => {
//       if (roomUserMap[roomId]) {
//         const username = socket.id; // Get username
//         roomUserMap[roomId] = roomUserMap[roomId].filter(user => user !== username);
//         socket.to(roomId).emit('userLeft', { username, users: roomUserMap[roomId] });
//       }
//     });
//   });
// });

// server.listen(4000, () => {
//   console.log('Server is running on port 4000');
// });


// ALL WELL HERE

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000', // Your frontend URL
//     methods: ['GET', 'POST'],
//   },
// });

// const roomUserMap = {}; // Map to hold usernames by room ID

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on('createRoom', (roomId) => {
//     socket.join(roomId);
//     roomUserMap[roomId] = roomUserMap[roomId] || [];
//     socket.emit('roomCreated', roomId);
//     console.log(`Room created with ID: ${roomId}`);
//   });

//   socket.on('joinRoom', ({ roomId, username }) => {
//     if (io.sockets.adapter.rooms.has(roomId)) {  // Check if room exists
//       socket.join(roomId);
//       console.log(`Room ${roomId} exists, user ${username} joining`);

//       // Add username to roomUserMap if not already present
//       roomUserMap[roomId] = roomUserMap[roomId] || [];
//       roomUserMap[roomId].push({ id: socket.id, username });

//       // Emit roomJoined to the user who joined
//       socket.emit('roomJoined', roomId);
//       console.log(`Emitting 'roomJoined' for user ${username} in room ${roomId}`);

//       // Notify all users in the room with the updated user list
//       io.to(roomId).emit('userList', roomUserMap[roomId]);
//       console.log(`Updated user list for room ${roomId}:`, roomUserMap[roomId]);
//     } else {
//       socket.emit('error', 'Room does not exist');
//       console.log(`Error: Room ${roomId} does not exist`);
//     }
//   });



//   socket.on('makeMove', (data) => {
//     const { roomId, piece, position } = data;
//     socket.to(roomId).emit('opponentMove', { piece, position });
//     console.log(`Move in room ${roomId}:`, data);
//   });


//   socket.on('disconnecting', () => {
//     const rooms = [...socket.rooms];
//     rooms.forEach((roomId) => {
//       if (roomUserMap[roomId]) {
//         // Remove user from roomUserMap
//         roomUserMap[roomId] = roomUserMap[roomId].filter(user => user.id !== socket.id);

//         // Emit updated user list to remaining users in the room
//         socket.to(roomId).emit('userList', roomUserMap[roomId]);
//       }
//     });
//   });
// });

// server.listen(4000, () => {
//   console.log('Server is running on port 4000');
// });

// ALL FINE HERE 2

// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000', // Your frontend URL
//     methods: ['GET', 'POST'],
//   },
// });

// const roomUserMap = {}; // Map to hold usernames by room ID

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on('createRoom', (roomId) => {
//     socket.join(roomId);
//     roomUserMap[roomId] = roomUserMap[roomId] || [];
//     socket.emit('roomCreated', roomId);
//     console.log(`Room created with ID: ${roomId}`);
//   });

//   socket.on('joinRoom', ({ roomId, username }) => {
//     if (io.sockets.adapter.rooms.has(roomId)) {  // Check if room exists
//       socket.join(roomId);
//       console.log(`Room ${roomId} exists, user ${username} joining`);

//       // Add username to roomUserMap if not already present
//       roomUserMap[roomId] = roomUserMap[roomId] || [];
//       roomUserMap[roomId].push({ id: socket.id, username });

//       // Emit roomJoined to the user who joined
//       socket.emit('roomJoined', roomId);
//       console.log(`Emitting 'roomJoined' for user ${username} in room ${roomId}`);

//       // Notify all users in the room with the updated user list
//       io.to(roomId).emit('userList', roomUserMap[roomId]);
//       console.log(`Updated user list for room ${roomId}:`, roomUserMap[roomId]);
//     } else {
//       socket.emit('error', 'Room does not exist');
//       console.log(`Error: Room ${roomId} does not exist`);
//     }
//   });



//   socket.on('makeMove', (data) => {
//     const { roomId, piece, position } = data;
//     socket.to(roomId).emit('opponentMove', { piece, position });
//     console.log(`Move in room ${roomId}:`, data);
//   });


//   socket.on('disconnecting', () => {
//     const rooms = [...socket.rooms];
//     rooms.forEach((roomId) => {
//       if (roomUserMap[roomId]) {
//         // Remove user from roomUserMap
//         roomUserMap[roomId] = roomUserMap[roomId].filter(user => user.id !== socket.id);

//         // Emit updated user list to remaining users in the room
//         socket.to(roomId).emit('userList', roomUserMap[roomId]);
//       }
//     });
//   });
// });

// server.listen(4000, () => {
//   console.log('Server is running on port 4000');
// });


// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000', // Your frontend URL
//     methods: ['GET', 'POST'],
//   },
// });

// const roomUserMap = {}; // Map to hold usernames by room ID

// io.on('connection', (socket) => {
//   console.log(`User connected: ${socket.id}`);

//   socket.on('createRoom', (roomId) => {
//     socket.join(roomId);
//     roomUserMap[roomId] = roomUserMap[roomId] || [];
//     socket.emit('roomCreated', roomId);
//     console.log(`Room created with ID: ${roomId}`);
//   });

//   socket.on('joinRoom', ({ roomId, username }) => {
//     if (io.sockets.adapter.rooms.has(roomId)) {  // Check if room exists
//       socket.join(roomId);
//       console.log(`Room ${roomId} exists, user ${username} joining`);

//       // Add username to roomUserMap if not already present
//       roomUserMap[roomId] = roomUserMap[roomId] || [];
//       roomUserMap[roomId].push({ id: socket.id, username });

//       // Emit roomJoined to the user who joined
//       socket.emit('roomJoined', roomId);
//       console.log(`Emitting 'roomJoined' for user ${username} in room ${roomId}`);

//       // Notify all users in the room with the updated user list
//       io.to(roomId).emit('userList', roomUserMap[roomId]);
//       console.log(`Updated user list for room ${roomId}:`, roomUserMap[roomId]);
//     } else {
//       socket.emit('error', 'Room does not exist');
//       console.log(`Error: Room ${roomId} does not exist`);
//     }
//   });



//   socket.on('makeMove', (data) => {
//     const { roomId, piece, position } = data;
//     socket.to(roomId).emit('opponentMove', { piece, position });
//     console.log(`Move in room ${roomId}:`, data);
//   });


//   socket.on('disconnecting', () => {
//     const rooms = [...socket.rooms];
//     rooms.forEach((roomId) => {
//       if (roomUserMap[roomId]) {
//         // Remove user from roomUserMap
//         roomUserMap[roomId] = roomUserMap[roomId].filter(user => user.id !== socket.id);

//         // Emit updated user list to remaining users in the room
//         socket.to(roomId).emit('userList', roomUserMap[roomId]);
//       }
//     });
//   });
// });

// server.listen(4000, () => {
//   console.log('Server is running on port 4000');
// });

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