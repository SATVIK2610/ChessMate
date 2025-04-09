import { useRef, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
import { Piece, Position } from "../../models";
import { useRoomContext } from "../Room/RoomContext";
import { toast } from "react-hot-toast";
import MoveHistorySidebar, { MoveRecord } from "../MoveHistory/MoveHistorySidebar";
import { PieceType } from "../../Types";
import { BotDifficulty } from "../../lib/bot/engine";

const socket: Socket = io("http://localhost:4000");

interface BaseProps {
  playMove: (piece: Piece, position: Position) => boolean;
  pieces: Piece[];
  moveHistory: MoveRecord[];
  setMoveHistory: React.Dispatch<React.SetStateAction<MoveRecord[]>>;
  totalTurns?: number;
}

interface MultiplayerProps extends BaseProps {
  mode: 'multiplayer';
  team: string;
  roomId: string;
  leaveRoom: () => void;
}

interface BotProps extends BaseProps {
  mode: 'bot';
  playerColor: 'w' | 'b';
  botDifficulty: BotDifficulty;
  isPlayerTurn: boolean;
  gameStatus: string;
  isCheck?: boolean;
  leaveGame: () => void;
  playerName: string;
  botLastMoveSource?: Position | null;
  botLastMoveDestination?: Position | null;
}

type Props = MultiplayerProps | BotProps;

export default function Chessboard(props: Props) {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const [lastMoveSource, setLastMoveSource] = useState<Position | null>(null);
  const [lastMoveDestination, setLastMoveDestination] = useState<Position | null>(null);
  const chessboardRef = useRef<HTMLDivElement>(null);
  
  // Multiplayer specific states
  const [, setUsernames] = useState<{id: string, username: string}[]>([]);
  const [, setOpponent] = useState<string>('');
  
  // Always call hooks unconditionally at the top level
  const roomContext = useRoomContext();
  // Then conditionally use the values
  const pl1 = props.mode === 'multiplayer' ? roomContext.pl1 : undefined;
  const pl2 = props.mode === 'multiplayer' ? roomContext.pl2 : undefined;
  const whiteTime = props.mode === 'multiplayer' ? roomContext.whiteTime : undefined;
  const blackTime = props.mode === 'multiplayer' ? roomContext.blackTime : undefined;
  const activeTimer = props.mode === 'multiplayer' ? roomContext.activeTimer : undefined;

  // Determine if player is white team based on mode
  const isWhiteTeam = props.mode === 'multiplayer' 
    ? props.team === 'w' 
    : props.playerColor === 'w';
  
  // Handle bot mode highlighting
  useEffect(() => {
    // Only run this effect for bot mode
    if (props.mode !== 'bot') return;
    
    // Now we can safely cast to BotProps
    const botProps = props as BotProps;
    if (botProps.botLastMoveSource && botProps.botLastMoveDestination) {
      setLastMoveSource(botProps.botLastMoveSource);
      setLastMoveDestination(botProps.botLastMoveDestination);
    }
    // We only include props.mode in the dependency array because 
    // the other props are conditionally accessed based on props.mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode]);

  // Multiplayer socket setup
  useEffect(() => {
    if (props.mode !== 'multiplayer') return;
    
    // Now we can safely cast to MultiplayerProps
    const multiplayerProps = props as MultiplayerProps;
    const { team } = multiplayerProps;
    
    socket.on("opponentMove", (moveData: { 
      piece: Piece; 
      position: Position;
      highlightSource: Position;
      highlightDestination: Position;
      moveType?: string;
    }) => {
      const { piece, position, highlightSource, highlightDestination, moveType } = moveData;
      const moveSuccess = props.playMove(piece, position);
      
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
        
        props.setMoveHistory(prev => [...prev, newMove]);
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
    // We omit team from dependencies because it's only used when mode is 'multiplayer'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode, props.playMove, props.setMoveHistory]);

  // Bot mode - update move history when bot makes a move
  useEffect(() => {
    if (props.mode !== 'bot') return;
    
    // Cast to BotProps safely since we've checked mode
    const botProps = props as BotProps;
    const { 
      botLastMoveSource, 
      botLastMoveDestination, 
      isPlayerTurn, 
      pieces, 
      playerColor, 
      isCheck 
    } = botProps;
    
    if (botLastMoveSource && botLastMoveDestination && !isPlayerTurn) {
      // Find the piece that moved
      const movedPiece = pieces.find(
        p => p.position.samePosition(botLastMoveDestination) && p.team !== playerColor
      );
      
      if (movedPiece) {
        // Check if the move was a capture
        const isCapture = pieces.some(p => 
          p.team === playerColor && 
          p.position.samePosition(botLastMoveDestination)
        );
        
        // Add bot's move to history
        const newMove: MoveRecord = {
          piece: movedPiece.type,
          from: botLastMoveSource.clone(),
          to: botLastMoveDestination.clone(),
          team: movedPiece.team as 'w' | 'b',
          capture: isCapture,
          check: isCheck, // This will be true if the bot put the player in check
          // Other properties would be determined from actual move data
        };
        
        props.setMoveHistory(prev => [...prev, newMove]);
      }
    }
    // We only include base dependencies and handle bot-specific props conditionally
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.mode, props.pieces, props.setMoveHistory]);

  function getPieceAtTile(e: React.MouseEvent): Piece | undefined {
    const chessboard = chessboardRef.current;
    if (!chessboard) return undefined;

    const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
    const y = isWhiteTeam ? 
      HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
      Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

    return props.pieces.find((piece) => piece.position.samePosition(new Position(x, y)));
  }

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    e.preventDefault();
    
    // For bot mode, check if it's player's turn
    if (props.mode === 'bot' && !props.isPlayerTurn) return;
    
    const currentPiece = getPieceAtTile(e);
    
    // Check if it's the player's piece
    const isPlayerPiece = props.mode === 'multiplayer' 
      ? currentPiece?.team === props.team
      : currentPiece?.team === props.playerColor;
    
    if (element.classList.contains("chess-piece") && chessboard && currentPiece && isPlayerPiece) {
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
    const currentPiece = props.pieces.find((p) => p.samePosition(grabPosition));
    
    // Check if it's the player's piece
    const isPlayerPiece = props.mode === 'multiplayer' 
      ? currentPiece?.team === props.team
      : currentPiece?.team === props.playerColor;
    
    if (activePiece && chessboard && isPlayerPiece) {
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

      const currentPiece = props.pieces.find((p) => p.samePosition(grabPosition));
      const newPosition = new Position(x, y);
      
      // Check if it's the player's piece
      const isPlayerPiece = props.mode === 'multiplayer' 
        ? currentPiece?.team === props.team
        : currentPiece?.team === props.playerColor;
        
      if (currentPiece && isPlayerPiece) {
        const success = props.playMove(currentPiece.clone(), newPosition);
        
        if (success) {
          // Update last move highlights when player makes a move
          setLastMoveSource(grabPosition);
          setLastMoveDestination(newPosition);
          
          if (props.mode === 'multiplayer') {
            // Determine move type for multiplayer
            let moveType = 'normal';
            
            // Check if it's a capture move
            const isCapture = props.pieces.some(p => 
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
            
            props.setMoveHistory(prev => [...prev, newMove]);
            
            // Emit move to server for multiplayer
            socket.emit("makeMove", { 
              roomId: props.roomId, 
              piece: currentPiece, 
              position: newPosition,
              moveType,
              highlightSource: grabPosition,
              highlightDestination: newPosition
            });
          } else if (props.mode === 'bot') {
            // Bot mode handling
            // Check if the move was a capture
            const isCapture = props.pieces.some(p => 
              p.team !== props.playerColor && 
              p.position.samePosition(newPosition)
            );
            
            // Add player's move to history
            const newMove: MoveRecord = {
              piece: currentPiece.type,
              from: grabPosition.clone(),
              to: newPosition.clone(),
              team: currentPiece.team as 'w' | 'b',
              capture: isCapture,
              check: props.gameStatus === 'Check!', // Set check based on the current game status
              // Other properties would be determined from actual move data
            };
            
            props.setMoveHistory(prev => [...prev, newMove]);
          }
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
    if (props.mode !== 'multiplayer') return;
    
    try {
      console.log('Room ID before copy:', props.roomId, 'Type:', typeof props.roomId);
      await navigator.clipboard.writeText(props.roomId);
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

  // Format difficulty level text for bot mode
  const getDifficultyText = (difficulty: BotDifficulty): string => {
    switch (difficulty) {
      case BotDifficulty.EASY:
        return "Easy";
      case BotDifficulty.MEDIUM:
        return "Medium";
      case BotDifficulty.HARD:
        return "Hard";
      default:
        return "Unknown";
    }
  };

  // Render the board
  let board = [];
  
  for (let j = 0; j < VERTICAL_AXIS.length; j++) {
    const row = isWhiteTeam ? VERTICAL_AXIS.length - 1 - j : j;
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = row + i + 2;
      const piece = props.pieces.find((p) => p.samePosition(new Position(i, row)));
      let image = piece ? piece.image : undefined;

      let currentPiece = activePiece != null ? props.pieces.find((p) => p.samePosition(grabPosition)) : undefined;
      let highlight = currentPiece?.possibleMoves ?
        currentPiece.possibleMoves.some((p) => p.samePosition(new Position(i, row))) : false;
      
      // Check if this is a capturable opponent piece
      let isCapturable = false;
      if (highlight && piece) {
        const playerTeam = props.mode === 'multiplayer' ? props.team : props.playerColor;
        if (piece.team !== playerTeam) {
          isCapturable = true;
        }
      }
      
      // Check if this tile contains the king in check (bot mode only)
      const isKingInCheck = props.mode === 'bot' && props.isCheck && piece && 
        piece.type === PieceType.KING && 
        piece.team === props.playerColor;
        
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
          inCheck={!!isKingInCheck}
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
            <span>Turn: {props.totalTurns || 0}</span>
          </div>
          
          {/* Bot difficulty display (bot mode only) */}
          {props.mode === 'bot' && (
            <div className="bot-difficulty">
              <span>Difficulty: {getDifficultyText(props.botDifficulty)}</span>
            </div>
          )}
          
          <div className="lower">
            <h3>Players</h3>
            
            {props.mode === 'multiplayer' ? (
              <>
                {/* White player with timer */}
                <div className={`user ${activeTimer === 'white' ? 'active-timer' : ''}`}>
                  <div className="user-info">
                    <img src={generateAvatar(pl1)} alt="avatar-logo" />
                    <span>{pl1 || "White"}</span>
                  </div>
                  <div className="timer-display">
                    {formatTime(whiteTime || 0)}
                  </div>
                </div>
                
                {/* Black player with timer */}
                <div className={`user ${activeTimer === 'black' ? 'active-timer' : ''}`}>
                  <div className="user-info">
                    <img src={generateAvatar(pl2)} alt="avatar-logo" />
                    <span>{pl2 || "Black"}</span>
                  </div>
                  <div className="timer-display">
                    {formatTime(blackTime || 0)}
                  </div>
                </div>
                
                <button onClick={copyRoomId} className="roomBtn">COPY ROOM ID</button>
              </>
            ) : (
              <>
                {/* Bot mode players */}
                <div className={`user ${(props.playerColor === 'w' && props.isPlayerTurn) || (props.playerColor === 'b' && !props.isPlayerTurn) ? 'active-timer' : ''}`}>
                  <div className="user-info">
                    <img src={generateAvatar(props.playerColor === 'w' ? props.playerName : 'Bot')} alt="avatar-logo" />
                    <span>{props.playerColor === 'w' ? props.playerName : 'Bot'}</span>
                  </div>
                </div>
                
                <div className={`user ${(props.playerColor === 'b' && props.isPlayerTurn) || (props.playerColor === 'w' && !props.isPlayerTurn) ? 'active-timer' : ''}`}>
                  <div className="user-info">
                    <img src={generateAvatar(props.playerColor === 'b' ? props.playerName : 'Bot')} alt="avatar-logo" />
                    <span>{props.playerColor === 'b' ? props.playerName : 'Bot'}</span>
                  </div>
                </div>
              </>
            )}
            
            {/* Leave button */}
            <button 
              onClick={props.mode === 'multiplayer' ? props.leaveRoom : props.leaveGame} 
              className="leave-btn sidebar-leave-btn"
            >
              Leave {props.mode === 'multiplayer' ? 'Room' : 'Game'}
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
        <MoveHistorySidebar 
          moves={props.moveHistory} 
          playerColor={props.mode === 'multiplayer' ? (props.team as 'w' | 'b') : props.playerColor} 
        />
      </div>
    </>
  );
}
