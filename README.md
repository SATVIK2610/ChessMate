# ChessMate

ChessMate is a multiplayer chess game with timed matches, built with React and Socket.IO.

![ChessMate Screenshot](screenshot.png)

## Features

- Multiplayer chess game with real-time updates
- Create or join rooms with a room ID
- Set custom game timers (1, 3, 5, 10, 15, or 30 minutes)
- Timer-based gameplay with automatic switching between players
- Visual indication of capturable pieces
- Win by checkmate or when time runs out

## Installation and Setup

### Client (React App)

1. Clone the repository
   ```
   git clone https://github.com/yourusername/chessmate.git
   cd chessmate
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the client
   ```
   npm start
   ```

### Server (Socket.IO)

1. Navigate to the server directory
   ```
   cd server
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the server
   ```
   npm run dev
   ```

## How to Play

1. **Create a Room**:
   - Enter your username
   - Select a timer duration
   - Click "Create Game"
   - Share the Room ID with your opponent

2. **Join a Room**:
   - Enter your username
   - Enter the Room ID provided by the opponent
   - Click "Join Game"

3. **Start the Game**:
   - Once both players have joined, the white player can start the game
   - Click "Start Game" to begin

4. **Playing the Game**:
   - White moves first, and their timer starts counting down
   - After making a move, the timer switches to the black player
   - Highlighted tiles show valid moves
   - Red-highlighted tiles indicate capturable opponent pieces

5. **Winning Conditions**:
   - Checkmate the opponent's king
   - If time runs out, the player with the most time remaining wins

## Technologies Used

- React
- TypeScript
- Socket.IO
- Express
- CSS for styling

## License

MIT
