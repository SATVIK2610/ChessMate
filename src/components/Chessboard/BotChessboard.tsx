import { useRef, useState, useEffect } from "react";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
import { Piece, Position } from "../../models";
import { PieceType } from "../../Types";
import { BotDifficulty } from "../../lib/bot/engine";
import MoveHistorySidebar, { MoveRecord } from "../MoveHistory/MoveHistorySidebar";

interface Props {
  playMove: (piece: Piece, position: Position) => boolean;
  pieces: Piece[];
  playerColor: 'w' | 'b';
  totalTurns: number;
  botDifficulty: BotDifficulty;
  isPlayerTurn: boolean;
  gameStatus: string;
  isCheck?: boolean;
  leaveGame: () => void;
  playerName: string;
  botLastMoveSource?: Position | null;
  botLastMoveDestination?: Position | null;
  moveHistory: MoveRecord[];
  setMoveHistory: React.Dispatch<React.SetStateAction<MoveRecord[]>>;
}

export default function BotChessboard({ 
  playMove, 
  pieces, 
  playerColor,
  totalTurns,
  botDifficulty,
  isPlayerTurn,
  gameStatus,
  isCheck = false,
  leaveGame,
  playerName,
  botLastMoveSource,
  botLastMoveDestination,
  moveHistory,
  setMoveHistory
}: Props) {
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const [lastMoveSource, setLastMoveSource] = useState<Position | null>(null);
  const [lastMoveDestination, setLastMoveDestination] = useState<Position | null>(null);
  const chessboardRef = useRef<HTMLDivElement>(null);
  
  // Effect to update highlight state when bot move info changes
  useEffect(() => {
    if (botLastMoveSource && botLastMoveDestination) {
      setLastMoveSource(botLastMoveSource);
      setLastMoveDestination(botLastMoveDestination);
    }
  }, [botLastMoveSource, botLastMoveDestination]);

  // Effect to clear move highlights when turn changes
  useEffect(() => {
    // We don't clear the highlights on turn change in the bot game
    // The highlights should persist until the next move is made
  }, [isPlayerTurn]);

  // Update highlights when bot makes a move (when it becomes player's turn after bot's move)
  // This will capture bot moves by looking at the previous state (if player was not in turn before and now is)
  const prevIsPlayerTurnRef = useRef(isPlayerTurn);
  useEffect(() => {
    // If it was bot's turn and now it's player's turn, the bot must have moved
    if (!prevIsPlayerTurnRef.current && isPlayerTurn) {
      // Find the move the bot made by comparing the current pieces with previous positions
      // (This is a heuristic approach, as we don't have direct bot move data)
      
      // We don't have the exact bot move, so we'll update the highlights next time the player moves
    }
    
    prevIsPlayerTurnRef.current = isPlayerTurn;
  }, [isPlayerTurn, pieces]);

  // Effect to update move history when bot makes a move
  useEffect(() => {
    if (botLastMoveSource && botLastMoveDestination && !isPlayerTurn) {
      // Find the piece that moved
      const movedPiece = pieces.find(
        p => p.position.samePosition(botLastMoveDestination!) && p.team !== playerColor
      );
      
      if (movedPiece) {
        // Check if the move was a capture
        const isCapture = pieces.some(p => 
          p.team === playerColor && 
          p.position.samePosition(botLastMoveDestination!)
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
        
        setMoveHistory(prev => [...prev, newMove]);
      }
    }
  }, [botLastMoveSource, botLastMoveDestination, isPlayerTurn, pieces, playerColor, isCheck, setMoveHistory]);

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
    
    // Only allow player to grab their own pieces when it's their turn
    if (!isPlayerTurn) return;
    
    const currentPiece = getPieceAtTile(e);
    const pieceTeam = currentPiece?.team === 'w' ? 'w' : 'b'; 
    
    if (element.classList.contains("chess-piece") && chessboard && 
        currentPiece && pieceTeam === playerColor) {
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
    const pieceTeam = currentPiece?.team === 'w' ? 'w' : 'b';
    
    if (activePiece && chessboard && pieceTeam === playerColor) {
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
      const pieceTeam = currentPiece?.team === 'w' ? 'w' : 'b';
      
      if (currentPiece && pieceTeam === playerColor) {
        const newPosition = new Position(x, y);
        const success = playMove(currentPiece.clone(), newPosition);
        
        if (success) {
          // Update last move highlights when the player makes a move
          setLastMoveSource(grabPosition);
          setLastMoveDestination(newPosition);
          
          // Check if the move was a capture
          const isCapture = pieces.some(p => 
            p.team !== playerColor && 
            p.position.samePosition(newPosition)
          );
          
          // Add player's move to history
          const newMove: MoveRecord = {
            piece: currentPiece.type,
            from: grabPosition.clone(),
            to: newPosition.clone(),
            team: currentPiece.team as 'w' | 'b',
            capture: isCapture,
            check: gameStatus === 'Check!', // Set check based on the current game status
            // Other properties would be determined from actual move data
          };
          
          setMoveHistory(prev => [...prev, newMove]);
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

  // Format difficulty level text
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

  // Generate avatar URL
  const generateAvatar = (name: string | undefined): string => {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return 'https://api.dicebear.com/6.x/initials/svg?seed=?&radius=15';
    }
    
    const initials = name
      .split(' ')
      .map(word => word[0] || '')
      .filter(initial => initial)
      .join('') || '?';
    
    return `https://api.dicebear.com/6.x/initials/svg?seed=${initials}&radius=15`;
  };

  // Render the board
  let board = [];
  const isWhiteTeam = playerColor === 'w';
  const isPlayersTurn = isPlayerTurn;

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
      if (highlight && piece && piece.team !== playerColor) {
        isCapturable = true;
      }

      // Check if this tile contains the king in check
      const isKingInCheck = isCheck && piece && 
        piece.type === PieceType.KING && 
        piece.team === playerColor;
        
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
          inCheck={isKingInCheck}
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
          
          <div className="game-info">
            <div className="turn-counter">
              <span>Turn: {totalTurns}</span>
            </div>
            
            <div className="bot-difficulty">
              <span>Difficulty: {getDifficultyText(botDifficulty)}</span>
            </div>
          </div>
          
          <div className="lower">
            <h3>Players:</h3>
            
            {/* White player */}
            <div className={`user ${(playerColor === 'w' && isPlayersTurn) || (playerColor === 'b' && !isPlayersTurn) ? 'active-timer' : ''}`}>
              <div className="user-info">
                <img src={generateAvatar(playerColor === 'w' ? playerName : 'Bot')} alt="avatar-logo" />
                <span>{playerColor === 'w' ? playerName : 'Bot'}</span>
              </div>
            </div>
            
            {/* Black player */}
            <div className={`user ${(playerColor === 'b' && isPlayersTurn) || (playerColor === 'w' && !isPlayersTurn) ? 'active-timer' : ''}`}>
              <div className="user-info">
                <img src={generateAvatar(playerColor === 'b' ? playerName : 'Bot')} alt="avatar-logo" />
                <span>{playerColor === 'b' ? playerName : 'Bot'}</span>
              </div>
            </div>
            
            <button onClick={leaveGame} className="leave-btn sidebar-leave-btn">
              Back to Menu
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
        <MoveHistorySidebar moves={moveHistory} playerColor={playerColor} />
      </div>
    </>
  );
} 