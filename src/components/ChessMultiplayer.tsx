// ALL WELL HERE

// import React, { useState, useEffect } from 'react';
// import io, { Socket } from 'socket.io-client';
// import Chessboard from './Chessboard/Chessboard';
// import { Piece, Position } from '../models';
// import { toast } from 'react-hot-toast';
// import Room from './Room/Room';

// const socket: Socket = io("http://localhost:4000");

// const ChessMultiplayer: React.FC<{ playMove: (piece: Piece, pos: Position) => boolean; pieces: Piece[] }> = ({ playMove, pieces }) => {
//   const [roomId, setRoomId] = useState<string>('');
//   const [joined, setJoined] = useState<boolean>(false);
//   const [team, setTeam] = useState<string>('w');
//   const [usernameInput, setUsernameInput] = useState<string>('');

//   useEffect(() => {
//     socket.on('roomCreated', (id: string) => {
//       setJoined(true);
//       setTeam('w');
//       toast.success(`Room created with ID: ${id}`);
//     });

//     socket.on('roomJoined', (id: string) => {
//       setJoined(true);
//       setTeam('b');
//       toast.success(`Joined room with ID: ${id}`);
//     });

//     socket.on('error', (message: string) => {
//       toast.error(message); // Using toast for errors
//     });

//     socket.on('opponentMove', ({ piece, position }: { piece: Piece; position: Position }) => {
//       playMove(piece, position);
//     });

//     return () => {
//       socket.off('roomCreated');
//       socket.off('roomJoined');
//       socket.off('error');
//       socket.off('opponentMove');
//     };
//   }, [playMove]);

//   const createRoom = () => {
//     const newRoomId = Math.random().toString(36).substr(2, 9);
//     setRoomId(newRoomId);
//     socket.emit('createRoom', newRoomId); // Emit only the room ID
//   };

//   const joinRoom = (roomId: string) => {
//     if (roomId) {
//       setRoomId(roomId);
//       socket.emit('joinRoom', { roomId, username: usernameInput }); // Ensure the room ID is correct
//     }
//   };

//   const handleMove = (piece: Piece, position: Position): boolean => {
//     const moveSuccess = playMove(piece, position);

//     if (moveSuccess) {
//       socket.emit('makeMove', { roomId, piece, position });
//     }

//     return moveSuccess;
//   };

//   return (
//     <div>
//       {!joined ? (
//         <Room
//           createRoom={createRoom}
//           joinRoom={joinRoom}
//           usernameInput={usernameInput}
//           setUsernameInput={setUsernameInput}
//         />
//       ) : (
//         <Chessboard
//           playMove={handleMove}
//           pieces={pieces}
//           team={team}
//           usernameInput={usernameInput}
//         />
//       )}
//     </div>
//   );
// };

// export default ChessMultiplayer;

// ALL FINE HERE 2

// import React, { useState, useEffect } from 'react';
// import io, { Socket } from 'socket.io-client';
// import Chessboard from './Chessboard/Chessboard';
// import { Piece, Position } from '../models';
// import { toast } from 'react-hot-toast';
// import Room from './Room/Room';

// const socket: Socket = io("http://localhost:4000");

// const ChessMultiplayer: React.FC<{ playMove: (piece: Piece, pos: Position) => boolean; pieces: Piece[] }> = ({ playMove, pieces }) => {
//   const [roomId, setRoomId] = useState<string>('');
//   const [joined, setJoined] = useState<boolean>(false);
//   const [team, setTeam] = useState<string>('w');
//   const [usernameInput, setUsernameInput] = useState<string>('');

//   useEffect(() => {
//     socket.on('roomCreated', (id: string) => {
//       setJoined(true);
//       setTeam('w');
//       toast.success(`Room created with ID: ${id}`);
//     });

//     socket.on('roomJoined', (id: string) => {
//       setJoined(true);
//       setTeam('b');
//       toast.success(`Joined room with ID: ${id}`);
//     });

//     socket.on('error', (message: string) => {
//       toast.error(message); // Using toast for errors
//     });

//     socket.on('opponentMove', ({ piece, position }: { piece: Piece; position: Position }) => {
//       playMove(piece, position);
//     });

//     return () => {
//       socket.off('roomCreated');
//       socket.off('roomJoined');
//       socket.off('error');
//       socket.off('opponentMove');
//     };
//   }, [playMove]);

//   const createRoom = () => {
//     const newRoomId = Math.random().toString(36).substr(2, 9);
//     setRoomId(newRoomId);
//     socket.emit('createRoom', newRoomId); // Emit only the room ID
//   };

//   const joinRoom = (roomId: string) => {
//     if (roomId) {
//       setRoomId(roomId);
//       socket.emit('joinRoom', { roomId, username: usernameInput }); // Ensure the room ID is correct
//     }
//   };

//   const handleMove = (piece: Piece, position: Position): boolean => {
//     const moveSuccess = playMove(piece, position);

//     if (moveSuccess) {
//       socket.emit('makeMove', { roomId, piece, position });
//     }

//     return moveSuccess;
//   };

//   return (
//     <div>
//       {!joined ? (
//         <Room
//           createRoom={createRoom}
//           joinRoom={joinRoom}
//           usernameInput={usernameInput}
//           setUsernameInput={setUsernameInput}
//         />
//       ) : (
//         <Chessboard
//           playMove={handleMove}
//           pieces={pieces}
//           team={team}
//           usernameInput={usernameInput}
//           roomId={roomId}
//         />
//       )}
//     </div>
//   );
// };

// export default ChessMultiplayer;


// import React, { useState, useEffect } from 'react';
// import io, { Socket } from 'socket.io-client';
// import Chessboard from './Chessboard/Chessboard';
// import { Piece, Position } from '../models';
// import { toast } from 'react-hot-toast';
// import Room from './Room/Room';

// const socket: Socket = io("http://localhost:4000");

// const ChessMultiplayer: React.FC<{ playMove: (piece: Piece, pos: Position) => boolean; pieces: Piece[] }> = ({ playMove, pieces }) => {
//   const [roomId, setRoomId] = useState<string>('');
//   const [joined, setJoined] = useState<boolean>(false);
//   const [team, setTeam] = useState<string>('w');
//   const [usernameInput, setUsernameInput] = useState<string>('');

//   useEffect(() => {
//     socket.on('roomCreated', (id: string) => {
//       setJoined(true);
//       setTeam('w');
//       toast.success(`Room created with ID: ${id}`);
//     });

//     socket.on('roomJoined', (id: string) => {
//       setJoined(true);
//       setTeam('b');
//       toast.success(`Joined room with ID: ${id}`);
//     });

//     socket.on('error', (message: string) => {
//       toast.error(message); // Using toast for errors
//     });

//     socket.on('opponentMove', ({ piece, position }: { piece: Piece; position: Position }) => {
//       playMove(piece, position);
//     });

//     return () => {
//       socket.off('roomCreated');
//       socket.off('roomJoined');
//       socket.off('error');
//       socket.off('opponentMove');
//     };
//   }, [playMove]);

//   const createRoom = () => {
//     const newRoomId = Math.random().toString(36).substr(2, 9);
//     setRoomId(newRoomId);
//     socket.emit('createRoom', newRoomId); // Emit only the room ID
//   };

//   const joinRoom = (roomId: string) => {
//     if (roomId) {
//       setRoomId(roomId);
//       socket.emit('joinRoom', { roomId, username: usernameInput }); // Ensure the room ID is correct
//     }
//   };

//   const handleMove = (piece: Piece, position: Position): boolean => {
//     const moveSuccess = playMove(piece, position);

//     if (moveSuccess) {
//       socket.emit('makeMove', { roomId, piece, position });
//     }

//     return moveSuccess;
//   };

//   return (
//     <div>
//       {!joined ? (
//         <Room
//           createRoom={createRoom}
//           joinRoom={joinRoom}
//           usernameInput={usernameInput}
//           setUsernameInput={setUsernameInput}
//         />
//       ) : (
//         <Chessboard
//           playMove={handleMove}
//           pieces={pieces}
//           team={team}
//           usernameInput={usernameInput}
//           roomId={roomId}
//         />
//       )}
//     </div>
//   );
// };

// export default ChessMultiplayer;

// ChessMultiplayer.tsx
// import React, { useState, useEffect } from 'react';
// import io, { Socket } from 'socket.io-client';
// import Chessboard from './Chessboard/Chessboard';
// import { Piece, Position } from '../models';
// import { toast } from 'react-hot-toast';
// import Room from './Room/Room';

// const socket: Socket = io("http://localhost:4000");

// const ChessMultiplayer: React.FC<{ playMove: (piece: Piece, pos: Position) => boolean; pieces: Piece[] }> = ({ playMove, pieces }) => {
//   const [roomId, setRoomId] = useState<string>('');
//   const [joined, setJoined] = useState<boolean>(false);
//   const [team, setTeam] = useState<string>('w');
//   const [usernameInput, setUsernameInput] = useState<string>('');
//   const [usernames, setUsernames] = useState<string[]>([]);

//   useEffect(() => {
//     socket.on('roomCreated', ({ roomId, users }) => {
//       setJoined(true);
//       setTeam('w');
//       setUsernames(users); // Directly setting usernames
//       toast.success(`Room created with ID: ${roomId}`);
//     });
  
//     socket.on('roomJoined', ({ roomId, users }) => {
//       setJoined(true);
//       setTeam('b');
//       setUsernames(users); // Directly setting usernames
//       toast.success(`Joined room with ID: ${roomId}`);
//     });
  
//     socket.on('userList', (users) => {
//       setUsernames(users); // Directly setting usernames
//     });
  
//     socket.on('error', (message: string) => {
//       toast.error(message);
//     });
  
//     socket.on('opponentMove', ({ piece, position }: { piece: Piece; position: Position }) => {
//       playMove(piece, position);
//     });
  
//     return () => {
//       socket.off('roomCreated');
//       socket.off('roomJoined');
//       socket.off('userList');
//       socket.off('error');
//       socket.off('opponentMove');
//     };
//   }, [playMove]);  


//   const createRoom = () => {
//     const newRoomId = Math.random().toString(36).substr(2, 9);
//     setRoomId(newRoomId);
//     socket.emit('createRoom', { roomId: newRoomId, username: usernameInput });
//   };

//   const joinRoom = (roomId: string) => {
//     if (roomId) {
//       setRoomId(roomId);
//       socket.emit('joinRoom', { roomId, username: usernameInput });
//     }
//   };

//   const handleMove = (piece: Piece, position: Position): boolean => {
//     const moveSuccess = playMove(piece, position);

//     if (moveSuccess) {
//       socket.emit('makeMove', { roomId, piece, position });
//     }

//     return moveSuccess;
//   };

//   return (
//     <div>
//       {!joined ? (
//         <Room
//           createRoom={createRoom}
//           joinRoom={joinRoom}
//           usernameInput={usernameInput}
//           setUsernameInput={setUsernameInput}
//         />
//       ) : (
//         <Chessboard
//           playMove={handleMove}
//           pieces={pieces}
//           team={team}
//           usernameInput={usernameInput}
//           roomId={roomId}
//         />
//       )}
//     </div>
//   );
// };

// export default ChessMultiplayer;

import React, { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import Chessboard from './Chessboard/Chessboard';
import { Piece, Position } from '../models';
import { toast } from 'react-hot-toast';
import Room from './Room/Room';

const socket: Socket = io("http://localhost:4000");

const ChessMultiplayer: React.FC<{ playMove: (piece: Piece, pos: Position) => boolean; pieces: Piece[] }> = ({ playMove, pieces }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [team, setTeam] = useState<string>('w');
  const [pl1, setPl1] = useState<string>('');
  const [pl2, setPl2] = useState<string>('');

  useEffect(() => {
    socket.on('roomCreated', (id: string) => {
      setJoined(true);
      setTeam('w');
      toast.success(`Room created with ID: ${id}`);
    });

    socket.on('roomJoined', (id: string) => {
      setJoined(true);
      setTeam('b');
      toast.success(`Joined room with ID: ${id}`);
    });

    socket.on('error', (message: string) => {
      toast.error(message); // Using toast for errors
    });

    socket.on('opponentMove', ({ piece, position }: { piece: Piece; position: Position }) => {
      playMove(piece, position);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('error');
      socket.off('opponentMove');
    };
  }, [playMove]);

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setRoomId(newRoomId);
    socket.emit('createRoom', newRoomId); // Emit only the room ID
  };

  const joinRoom = (roomId: string) => {
    if (roomId) {
      setRoomId(roomId);
      socket.emit('joinRoom', { roomId, username: pl2 }); // Ensure the room ID is correct
    }
  };

  const handleMove = (piece: Piece, position: Position): boolean => {
    const moveSuccess = playMove(piece, position);

    if (moveSuccess) {
      socket.emit('makeMove', { roomId, piece, position });
    }

    return moveSuccess;
  };

  return (
    <div>
      {!joined ? (
        <Room
          createRoom={createRoom}
          joinRoom={joinRoom}
        />
      ) : (
        <Chessboard
          playMove={handleMove}
          pieces={pieces}
          team={team}
          roomId={roomId}
        />
      )}
    </div>
  );
};

export default ChessMultiplayer;