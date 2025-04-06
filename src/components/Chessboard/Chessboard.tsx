import { useRef, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
import { Piece, Position } from "../../models";
import { useRoomContext } from "../Room/RoomContext";
import { toast } from "react-hot-toast";
import MoveHistorySidebar, { MoveRecord } from "../MoveHistory/MoveHistorySidebar";

const socket: Socket = io("http://localhost:4000");

interface Props {
  playMove: (piece: Piece, position: Position) => boolean;
  pieces: Piece[];
  team: string;
  roomId: string;
  totalTurns?: number;
  leaveRoom: () => void;
  moveHistory: MoveRecord[];
  setMoveHistory: React.Dispatch<React.SetStateAction<MoveRecord[]>>;
}

export default function Chessboard({ playMove, pieces, team, roomId, totalTurns = 0, leaveRoom, moveHistory, setMoveHistory }: Props) {
  const { pl1, pl2, whiteTime, blackTime, activeTimer } = useRoomContext(); // Get usernames from context
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const [, setUsernames] = useState<{id: string, username: string}[]>([]);
  const [, setOpponent] = useState<string>('');
  const [lastMoveSource, setLastMoveSource] = useState<Position | null>(null);
  const [lastMoveDestination, setLastMoveDestination] = useState<Position | null>(null);
  const chessboardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // console.log("Component rendered with team:", team, "socket id:", socket.id);
    
    socket.on("opponentMove", (moveData: { 
      piece: Piece; 
      position: Position;
      highlightSource: Position;
      highlightDestination: Position;
      moveType?: string;
    }) => {
      const { piece, position, highlightSource, highlightDestination, moveType } = moveData;
      const moveSuccess = playMove(piece, position);
      
      if (moveSuccess) {
        // Update last move highlights when opponent makes a move
        setLastMoveSource(highlightSource);
        setLastMoveDestination(highlightDestination);
        
        // Add the opponent's move to the move history
        const newMove: MoveRecord = {
          piece: piece.type,
          from: highlightSource.clone(),
          to: position.clone(),
          team: piece.team as 'w' | 'b',
          capture: moveType === 'capture',
          check: moveType === 'check',
          promotion: moveType === 'promote',
          castle: moveType === 'castle' ? 
            (position.x === 6 ? 'kingside' : 'queenside') : undefined
        };
        
        setMoveHistory(prev => [...prev, newMove]);
      }
    });

    socket.on('userList', (users) => {
      console.log("Received user list:", users, "Current socket ID:", socket.id);
      
      if (!users || !Array.isArray(users)) {
        console.warn("Invalid userList received:", users);
        return;
      }
      
      // Store the complete usernames array
      setUsernames(users);
      
      // Log all users in the room
      users.forEach((user, index) => {
        console.log(`User ${index}: ID=${user.id}, Name=${user.username}, Team=${user.team}`);
      });
      
      // If we have 2 users, show their names
      if (users.length >= 2) {
        // Set opponent based on team instead of socket ID
        if (team === 'w' && users.find(u => u.team === 'b')) {
          // If I'm white, find black player
          const blackPlayer = users.find(u => u.team === 'b');
          setOpponent(blackPlayer?.username || 'Player 2');
        } else if (team === 'b' && users.find(u => u.team === 'w')) {
          // If I'm black, find white player
          const whitePlayer = users.find(u => u.team === 'w');
          setOpponent(whitePlayer?.username || 'Player 1');
        }
      }
    });

    return () => {
      socket.off("opponentMove");
      socket.off('userList');
    };
  }, [playMove, team]);

  function getPieceAtTile(e: React.MouseEvent): Piece | undefined {
    const chessboard = chessboardRef.current;
    if (!chessboard) return undefined;

    const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
    const y = isWhiteTeam ? 
      HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
      Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

    return pieces.find((piece) => piece.position.samePosition(new Position(x, y)));
  }

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    e.preventDefault();
    const currentPiece = getPieceAtTile(e);
    if (element.classList.contains("chess-piece") && chessboard && currentPiece?.team === team) {
      const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const grabY = isWhiteTeam ? 
        HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
        Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

      setGrabPosition(new Position(grabX, grabY));

      // Set positioning for the dragged piece
      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;
      element.style.position = "fixed"; // Use fixed instead of absolute
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
      element.style.zIndex = "1000";
      element.style.pointerEvents = "none"; // Prevents flickering when dragging

      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
    if (activePiece && chessboard && currentPiece?.team === team) {
      // Calculate boundaries for the entire window
      const minX = 0;
      const minY = 0;
      const maxX = window.innerWidth - GRID_SIZE;
      const maxY = window.innerHeight - GRID_SIZE;
      
      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;
      
      // Keep using fixed positioning
      activePiece.style.position = "fixed";
      activePiece.style.left = `${Math.min(maxX, Math.max(minX, x))}px`;
      activePiece.style.top = `${Math.min(maxY, Math.max(minY, y))}px`;
    }
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      // Reset pointer events
      activePiece.style.pointerEvents = '';
      
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const y = isWhiteTeam ? 
        HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
        Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

      const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
      const newPosition = new Position(x, y);

      if (currentPiece) {
        const success = playMove(currentPiece.clone(), newPosition);
        if (success) {
          // Update last move highlights when the local player makes a move
          setLastMoveSource(grabPosition);
          setLastMoveDestination(newPosition);
          
          // Determine move type
          let moveType = 'normal';
          
          // Check if it's a capture move
          const isCapture = pieces.some(p => 
            p.position.samePosition(newPosition) && p.team !== currentPiece.team
          );
          
          // Check if it's a castle move (king moves 2 squares)
          const isCastle = currentPiece.type === 'king' && 
            Math.abs(grabPosition.x - newPosition.x) === 2;
            
          // Check for promotion (pawn reaches the end)
          const isPromotion = currentPiece.type === 'pawn' && 
            (newPosition.y === 0 || newPosition.y === 7);
            
          if (isCapture) {
            moveType = 'capture';
          } else if (isCastle) {
            moveType = 'castle';
          } else if (isPromotion) {
            moveType = 'promote';
          }
          
          // Add the move to the move history
          const newMove: MoveRecord = {
            piece: currentPiece.type,
            from: grabPosition.clone(),
            to: newPosition.clone(),
            team: currentPiece.team as 'w' | 'b',
            capture: isCapture,
            check: false, // We'll know this after the move is processed
            promotion: isPromotion,
            castle: isCastle ? 
              (newPosition.x === 6 ? 'kingside' : 'queenside') : undefined
          };
          
          setMoveHistory(prev => [...prev, newMove]);
          
          socket.emit("makeMove", { 
            roomId, 
            piece: currentPiece, 
            position: newPosition,
            moveType,
            highlightSource: grabPosition,
            highlightDestination: newPosition
          });
        } else {
          // Reset piece position if move failed
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
          activePiece.style.removeProperty("z-index");
        }
      }
      setActivePiece(null);
    }
  }

  async function copyRoomId() {
      try {
          console.log('Room ID before copy:', roomId, 'Type:', typeof roomId);
          await navigator.clipboard.writeText(roomId);
          toast.success('Room ID copied!');
      } catch (err) {
          toast.error('Could not copy Room ID');
          console.error(err);
      }
  }

  const getInitials = (name: string | undefined): string => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return '?';  // Default initial if name is invalid
    }
    
    return name
      .split(' ')
      .map(word => word[0] || '')
      .filter(initial => initial)
      .join('') || '?';
  };

  // Function to generate the avatar URL
  const generateAvatar = (name: string | undefined): string => {
    const initials = getInitials(name);
    
    return `https://api.dicebear.com/6.x/initials/svg?seed=${initials}&radius=15`;
  };

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Render the board
  let board = [];
  const isWhiteTeam = team === 'w';

  for (let j = 0; j < VERTICAL_AXIS.length; j++) {
    const row = isWhiteTeam ? VERTICAL_AXIS.length - 1 - j : j;
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = row + i + 2;
      const piece = pieces.find((p) => p.samePosition(new Position(i, row)));
      let image = piece ? piece.image : undefined;

      let currentPiece = activePiece != null ? pieces.find((p) => p.samePosition(grabPosition)) : undefined;
      let highlight = currentPiece?.possibleMoves ?
        currentPiece.possibleMoves.some((p) => p.samePosition(new Position(i, row))) : false;
      
      // Check if this is a capturable opponent piece
      let isCapturable = false;
      if (highlight && piece && piece.team !== team) {
        isCapturable = true;
      }
      
      // Check if this tile is part of the last move
      const isLastMoveSource = lastMoveSource?.samePosition(new Position(i, row)) || false;
      const isLastMoveDestination = lastMoveDestination?.samePosition(new Position(i, row)) || false;

      board.push(
        <Tile 
          key={`${row},${i}`} 
          image={image} 
          number={number} 
          highlight={highlight} 
          capturable={isCapturable} 
          lastMoveSource={isLastMoveSource}
          lastMoveDestination={isLastMoveDestination}
        />
      );
    }
  }

  

  return (
    <>
      <div className="main">
        <div className="sidebar" style={{ color: "white" }}>
          <div className="upper">
            <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
            <h1>ChessMate</h1>
          </div>
          
          <div className="turn-counter">
            <span>Turn: {totalTurns}</span>
          </div>
          
          <div className="lower">
            <h3>Players</h3>
            
            {/* White player with timer */}
            <div className={`user ${activeTimer === 'white' ? 'active-timer' : ''}`}>
              <div className="user-info">
                <img src={generateAvatar(pl1)} alt="avatar-logo" />
                <span>{pl1 || "White"}</span>
              </div>
              <div className="timer-display">
                {formatTime(whiteTime)}
              </div>
            </div>
            
            {/* Black player with timer */}
            <div className={`user ${activeTimer === 'black' ? 'active-timer' : ''}`}>
              <div className="user-info">
                <img src={generateAvatar(pl2)} alt="avatar-logo" />
                <span>{pl2 || "Black"}</span>
              </div>
              <div className="timer-display">
                {formatTime(blackTime)}
              </div>
            </div>
            
            <button onClick={copyRoomId} className="roomBtn">COPY ROOM ID</button>
            <button onClick={leaveRoom} className="leave-btn sidebar-leave-btn">
                Leave Room
            </button>
          </div>
        </div>
        <div
          onMouseMove={(e) => movePiece(e)}
          onMouseDown={(e) => grabPiece(e)}
          onMouseUp={(e) => dropPiece(e)}
          id="chessboard"
          ref={chessboardRef}
        >
          {board}
        </div>
        
        {/* Add Move History Sidebar */}
        <MoveHistorySidebar moves={moveHistory} playerColor={team as 'w' | 'b'} />
      </div>
    </>
  );
}
