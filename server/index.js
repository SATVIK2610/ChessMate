const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Store rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', (roomId, username, timer = 10) => {
    if (rooms.has(roomId)) {
      socket.emit('error', 'Room already exists');
      return;
    }

    // Ensure username is valid
    username = String(username || 'Player 1').trim() || 'Player 1';

    // Create new room with specified timer
    rooms.set(roomId, {
      users: [{
        id: socket.id,
        username,
        team: 'w'  // first player is white
      }],
      timer: timer, // Timer in minutes, default 10
      gameStarted: false
    });

    // Join socket room
    socket.join(roomId);
    socket.emit('roomCreated', roomId);
    
    // Send updated user list to room (with team information)
    io.to(roomId).emit('userList', rooms.get(roomId).users.map(user => ({
      id: user.id,
      username: user.username,
      team: user.team
    })));
    
    // Send player names to room (white player only at this point)
    io.to(roomId).emit('playerNames', { pl1: username, pl2: '' });
    
    console.log(`Room created: ${roomId} by "${username}" with timer ${timer} minutes`);
  });

  socket.on('joinRoom', ({ roomId, username }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', 'Room does not exist');
      return;
    }

    // Ensure username is valid
    username = String(username || 'Player 2').trim() || 'Player 2';

    const room = rooms.get(roomId);
    
    if (room.users.length >= 2) {
      console.log(`Room ${roomId} is full, rejecting user "${username}"`);
      socket.emit('error', 'Room is full');
      return;
    }

    // Add user to room
    room.users.push({
      id: socket.id,
      username,
      team: 'b'  // second player is black
    });

    // Extract usernames
    const whitePlayer = room.users.find(u => u.team === 'w')?.username || 'Player 1';
    const blackPlayer = room.users.find(u => u.team === 'b')?.username || 'Player 2';

    // Join socket room
    socket.join(roomId);
    socket.emit('roomJoined', roomId);
    
    // Send the timer information to the joining player
    socket.emit('timerInfo', room.timer);
    
    // Send updated user list to all users in room (with team information)
    io.to(roomId).emit('userList', room.users.map(user => ({
      id: user.id,
      username: user.username,
      team: user.team
    })));
    
    // Send player names to all users in the room
    io.to(roomId).emit('playerNames', { pl1: whitePlayer, pl2: blackPlayer });
    
    // Additionally, explicitly send playerNames to joining player
    socket.emit('playerNames', { pl1: whitePlayer, pl2: blackPlayer });
    
    console.log(`User "${username}" joined room: ${roomId}`);
    console.log(`Players in room ${roomId}: White: "${whitePlayer}", Black: "${blackPlayer}"`);
  });

  socket.on('startGame', ({ roomId }) => {
    if (!rooms.has(roomId)) {
      socket.emit('error', 'Room does not exist');
      return;
    }

    const room = rooms.get(roomId);
    room.gameStarted = true;

    // Notify all users in the room that the game has started
    io.to(roomId).emit('gameStarted', { timer: room.timer });
    
    console.log(`Game started in room: ${roomId} with timer ${room.timer} minutes`);
  });

  socket.on('makeMove', ({ roomId, piece, position, moveType, highlightSource, highlightDestination }) => {
    if (!rooms.has(roomId)) return;

    // Find the other player in the room
    const room = rooms.get(roomId);
    const otherPlayers = room.users.filter(user => user.id !== socket.id);

    // Send the move and highlight positions to all other players
    otherPlayers.forEach(player => {
      io.to(player.id).emit('opponentMove', { 
        piece, 
        position,
        moveType,  // Pass the move type to trigger appropriate sound
        highlightSource,
        highlightDestination
      });
    });
  });

  socket.on('leaveRoom', ({ roomId } = {}) => {
    // If roomId is provided, check just that room
    if (roomId && rooms.has(roomId)) {
      handlePlayerLeaving(socket.id, roomId);
      return;
    }
    
    // If no roomId or room not found, check all rooms for this socket
    for (const [id, room] of rooms.entries()) {
      const userIndex = room.users.findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        handlePlayerLeaving(socket.id, id);
        break; // Found the room, no need to check more
      }
    }
  });
  
  // Helper function to handle player leaving logic
  function handlePlayerLeaving(socketId, roomId) {
    if (!rooms.has(roomId)) return;
    
    const room = rooms.get(roomId);
    const userIndex = room.users.findIndex(user => user.id === socketId);
    
    if (userIndex !== -1) {
      const leavingUser = room.users[userIndex];
      const leavingTeam = leavingUser.team;
      
      console.log(`User "${leavingUser.username}" is leaving room: ${roomId}`);
      
      // Remove user from socket room
      const socket = io.sockets.sockets.get(socketId);
      if (socket) {
        socket.leave(roomId);
      }
      
      // Remove user from room
      room.users.splice(userIndex, 1);
      
      if (room.users.length === 0) {
        // If room is empty, delete it
        rooms.delete(roomId);
        console.log(`Room deleted: ${roomId}`);
      } else {
        // Get remaining player's info
        const remainingUser = room.users[0];
        
        // Update player names based on who left
        if (leavingTeam === 'w') {
          // White player left, black remains
          io.to(roomId).emit('playerNames', { pl1: '', pl2: remainingUser.username });
        } else {
          // Black player left, white remains
          io.to(roomId).emit('playerNames', { pl1: remainingUser.username, pl2: '' });
        }
        
        // Update user list
        io.to(roomId).emit('userList', room.users);
        
        // Notify remaining users
        io.to(roomId).emit('opponentLeft');
        
        console.log(`User removed from room: ${roomId}`);
      }
    }
  }

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    // Find rooms where this user was present and handle leaving for each
    for (const [roomId, room] of rooms.entries()) {
      const userIndex = room.users.findIndex(user => user.id === socket.id);
      if (userIndex !== -1) {
        handlePlayerLeaving(socket.id, roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 