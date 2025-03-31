import React, { useState, useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import Chessboard from './Chessboard/Chessboard';
import { Piece, Position } from '../models/index';
import { toast } from 'react-hot-toast';
import Room from './Room/Room';
import { useRoomContext } from './Room/RoomContext';
import './ChessMultiplayer.css';

const socket: Socket = io("http://localhost:4000");

const ChessMultiplayer: React.FC<{ 
  playMove: (piece: Piece, pos: Position) => boolean; 
  pieces: Piece[];
  totalTurns?: number; 
}> = ({ playMove, pieces, totalTurns = 0 }) => {
  const { 
    pl1, pl2, roomId, setRoomId, 
    timer, setTimer, whiteTime, setWhiteTime, 
    blackTime, setBlackTime, 
    gameStarted, setGameStarted,
    activeTimer, setActiveTimer,
    setPl1, setPl2
  } = useRoomContext();

  console.log("pl1", pl1);
  console.log("pl2", pl2);
  
  const [joined, setJoined] = useState<boolean>(false);
  const [team, setTeam] = useState<string>('w');
  const [userList, setUserList] = useState<{id: string, username: string, team: string}[]>([]);
  const [lastMoveTime, setLastMoveTime] = useState<number>(Date.now());
  const [timersInitialized, setTimersInitialized] = useState<boolean>(false);
  const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

  // Function to update timers (to fix type issues)
  const updateWhiteTime = useCallback((newTime: number) => {
    setWhiteTime(newTime);
  }, [setWhiteTime]);

  const updateBlackTime = useCallback((newTime: number) => {
    setBlackTime(newTime);
  }, [setBlackTime]);

  // Initialize timers only once when component mounts or timer value changes
  useEffect(() => {
    if (!timersInitialized) {
      updateWhiteTime(timer * 60);
      updateBlackTime(timer * 60);
      setTimersInitialized(true);
    }
  }, [timer, updateWhiteTime, updateBlackTime, timersInitialized]);

  useEffect(() => {
    socket.on('roomCreated', (id: string) => {
      setJoined(true);
      setTeam('w');
      setRoomId(id);
      
      // Initialize timers based on the selected timer value
      updateWhiteTime(timer * 60);
      updateBlackTime(timer * 60);
      setTimersInitialized(true);
      
      toast.success(`Room created with ID: ${id}`);
    });

    socket.on('roomJoined', (id: string) => {
      setJoined(true);
      setTeam('b');
      toast.success(`Joined room with ID: ${id}`);
      
      // When joining as black, make sure to preserve player names
      console.log(`Joined room as Black player (Team: ${team})`);
    });

    socket.on('timerInfo', (timerMinutes: number) => {
      console.log(`Received timer info: ${timerMinutes} minutes`);
      
      // Update the timer context value
      setTimer(timerMinutes);
      
      // Initialize timers based on the received timer value
      updateWhiteTime(timerMinutes * 60);
      updateBlackTime(timerMinutes * 60);
      setTimersInitialized(true);
    });

    socket.on('error', (message: string) => {
      toast.error(message);
      resetGameState();
    });

    socket.on('userList', (users: {id: string, username: string, team: string}[]) => {
      console.log('Received userList:', users);
      setUserList(users);
      
      // Extract player names from user list based on team
      const whitePlayer = users.find(user => user.team === 'w')?.username;
      const blackPlayer = users.find(user => user.team === 'b')?.username;
      
      console.log(`Extracted from userList - White: "${whitePlayer}", Black: "${blackPlayer}"`);
      
      // Only update if names are found
      if (whitePlayer) {
        setPl1(whitePlayer);
        console.log(`Updated white player name (from userList) to: "${whitePlayer}"`);
      }
      
      if (blackPlayer) {
        setPl2(blackPlayer);
        console.log(`Updated black player name (from userList) to: "${blackPlayer}"`);
      }
    });

    socket.on('playerNames', ({ pl1: whitePlayer, pl2: blackPlayer }: { pl1: string, pl2: string }) => {
      console.log(`Received playerNames event - White: "${whitePlayer}", Black: "${blackPlayer}"`);
      
      // Only update non-empty names
      if (whitePlayer) {
        setPl1(whitePlayer);
        console.log(`Updated white player name to: "${whitePlayer}"`);
      }
      
      if (blackPlayer) {
        setPl2(blackPlayer);
        console.log(`Updated black player name to: "${blackPlayer}"`);
      }
    });

    socket.on('opponentLeft', () => {
      console.log("Opponent left the room.");
      toast.error("Your opponent has left the game.");
      
      // Set opponent left flag to show the appropriate screen
      setOpponentLeft(true);
      
      // Reset game state while preserving your connection
      setGameStarted(false);
      setActiveTimer(null);
      
      // Find your team and username to preserve
      const currentPlayer = userList.find(user => user.id === socket.id);
      
      if (currentPlayer) {
        if (currentPlayer.team === 'w') {
          // You're white, black left
          setPl2('');
          
          // Update user list to show only yourself
          setUserList([currentPlayer]);
        } else {
          // You're black, white left
          setPl1('');
          
          // Update user list to show only yourself
          setUserList([currentPlayer]);
        }
      }
    });

    socket.on('opponentMove', ({ piece, position }: { piece: Piece; position: Position }) => {
      const moveSuccess = playMove(piece, position);
      
      if (moveSuccess) {
        // Switch timer when opponent makes a move
        if (activeTimer === 'white') {
          setActiveTimer('black');
        } else if (activeTimer === 'black') {
          setActiveTimer('white');
        }
        
        setLastMoveTime(Date.now());
      }
    });
    
    socket.on('gameStarted', (data: { timer: number }) => {
      if (data && data.timer) {
        console.log(`Game started with timer: ${data.timer} minutes`);
      }
      
      setGameStarted(true);
      setActiveTimer('white'); // White starts first
      setLastMoveTime(Date.now());
    });

    socket.on('timerInfo', ({ white, black, active }) => {
      if (gameStarted && timersInitialized) {
        updateWhiteTime(white);
        updateBlackTime(black);
        setActiveTimer(active);
      }
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('timerInfo');
      socket.off('error');
      socket.off('userList');
      socket.off('opponentMove');
      socket.off('gameStarted');
      socket.off('opponentLeft');
      socket.off('playerNames');
    };
  }, [playMove, setRoomId, setTimer, timer, updateWhiteTime, updateBlackTime, setGameStarted, activeTimer, setActiveTimer, setPl1, setPl2, gameStarted, timersInitialized, userList]);

  // Timer countdown effect
  useEffect(() => {
    if (!gameStarted || !activeTimer) return;
    
    const interval = setInterval(() => {
      if (activeTimer === 'white') {
        if (whiteTime <= 0) {
          clearInterval(interval);
          handleTimeUp('white');
        } else {
          updateWhiteTime(whiteTime - 1);
        }
      } else if (activeTimer === 'black') {
        if (blackTime <= 0) {
          clearInterval(interval);
          handleTimeUp('black');
        } else {
          updateBlackTime(blackTime - 1);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameStarted, activeTimer, whiteTime, blackTime, updateWhiteTime, updateBlackTime]);

  const handleTimeUp = (color: 'white' | 'black') => {
    // Check which team has more time left
    const winner = color === 'white' ? 'black' : 'white';
    toast.success(`${winner === 'white' ? 'White' : 'Black'} team wins on time!`);
    
    // Reset the game
    setGameStarted(false);
    setActiveTimer(null);
  };

  const createRoom = (username: string) => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    console.log(`Creating room with timer: ${timer} minutes and username: ${username}`);
    
    // Ensure username is not empty
    const validUsername = username.trim() || 'Player 1';
    
    // Set the username in the context immediately
    setPl1(validUsername);
    setPl2(''); // Clear P2 when creating a new room
    
    // Emit to server
    socket.emit('createRoom', newRoomId, validUsername, timer);
  };

  const joinRoom = (roomId: string, username: string) => {
    if (roomId) {
      const roomIdStr = String(roomId).trim();
      setRoomId(roomIdStr);
      
      // Ensure username is not empty
      const validUsername = username.trim() || 'Player 2';
      
      // Set own username immediately
      if (team === 'w') {
        setPl1(validUsername);
      } else {
        setPl2(validUsername);
      }
      
      // Emit to server
      socket.emit('joinRoom', { roomId: roomIdStr, username: validUsername });
    }
  };

  const leaveRoom = useCallback(() => {
    if (roomId) {
      socket.emit('leaveRoom', { roomId });
    }
    resetGameState();
    toast("You left the room.");
  }, [roomId]);

  const startGame = () => {
    socket.emit('startGame', { roomId });
    setGameStarted(true);
    setActiveTimer('white'); // White starts first
    setLastMoveTime(Date.now());
  };

  const handleMove = (piece: Piece, position: Position): boolean => {
    if (!gameStarted) return false;
    
    const moveSuccess = playMove(piece, position);

    if (moveSuccess) {
      // Switch timer after a successful move
      if ((piece.team === 'w' && activeTimer === 'white') || 
          (piece.team === 'b' && activeTimer === 'black')) {
        setActiveTimer(activeTimer === 'white' ? 'black' : 'white');
        setLastMoveTime(Date.now());
      }
      
      socket.emit('makeMove', { roomId, piece, position });
    }

    return moveSuccess;
  };

  const resetGameState = useCallback(() => {
    setJoined(false);
    setRoomId('');
    setPl1('');
    setPl2('');
    setGameStarted(false);
    setActiveTimer(null);
    setTimersInitialized(false);
    setWhiteTime(timer * 60);
    setBlackTime(timer * 60);
    setUserList([]);
    setOpponentLeft(false);
  }, [setRoomId, setPl1, setPl2, setGameStarted, setActiveTimer, setTimersInitialized, setWhiteTime, setBlackTime, timer]);

  if (!joined) {
    return <Room createRoom={createRoom} joinRoom={joinRoom} />;
  }

  if (userList.length < 2 || opponentLeft) {
    return (
      <div className="game-container">
        <div className="waiting-screen">
          {opponentLeft ? (
            <>
              <h2>Opponent Left</h2>
              <p>Your opponent has disconnected from the game.</p>
              <button onClick={leaveRoom} className="leave-btn">
                Back to Lobby
              </button>
            </>
          ) : (
            <>
              <h2>Waiting for Opponent...</h2>
              <p>Share this Room ID with your friend:</p>
              <div className="room-id-display">
                <span>{roomId}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(roomId);
                    toast.success("Room ID copied to clipboard!");
                  }} 
                  className="copy-room-id-btn"
                >
                  Copy
                </button>
              </div>
              <p>Players connected: {userList.length}/2</p>
              <p>Your username: {userList.find(u => u.id === socket.id)?.username}</p>
              <button onClick={leaveRoom} className="leave-btn">
                Leave Room
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="game-container">
        <div className="ready-to-play">
          <h2>Ready to Play!</h2>
          
          <div className="room-id-section">
            <div className="room-id-label">Room ID</div>
            <div className="room-id-value">
              {roomId}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  toast.success("Room ID copied to clipboard!");
                }} 
                className="copy-room-id-btn"
              >
                Copy
              </button>
            </div>
          </div>
          
          <div className="player-vs-section">
            <div className="player-card">
              <div className="player-avatar white-avatar">
                ♔
              </div>
              <div className="player-name">{pl1}</div>
              <div className="player-color">White</div>
            </div>
            
            <div className="vs-text">VS</div>
            
            <div className="player-card">
              <div className="player-avatar black-avatar">
                ♚
              </div>
              <div className="player-name">{pl2}</div>
              <div className="player-color">Black</div>
            </div>
          </div>
          
          <div className="timer-section">
            <span className="timer-icon">⏱</span>
            <span className="timer-value">{timer} minutes per side</span>
          </div>
          
          {team === 'w' ? (
            <button onClick={startGame} className="start-game-btn">Start Game</button>
          ) : (
            <div className="waiting-message">
              Waiting for White ({pl1}) to start the game...
            </div>
          )}
          
          <button onClick={leaveRoom} className="leave-btn">
            Leave Room
          </button>
        </div>
      </div>
    );
  }

  return (
    <Chessboard
      playMove={handleMove}
      pieces={pieces}
      team={team}
      roomId={roomId}
      totalTurns={totalTurns}
      leaveRoom={leaveRoom}
    />
  );
};

export default ChessMultiplayer;