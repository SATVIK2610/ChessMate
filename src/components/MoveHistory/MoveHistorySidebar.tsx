import React from 'react';
import './MoveHistorySidebar.css';
import { Position } from '../../models/Position';
import { HORIZONTAL_AXIS } from '../../Constants';

// Define the structure of a move record
export interface MoveRecord {
  piece: string;
  from: Position;
  to: Position;
  team: 'w' | 'b';
  capture?: boolean;
  check?: boolean;
  promotion?: boolean;
  castle?: 'kingside' | 'queenside';
}

interface MoveHistorySidebarProps {
  moves: MoveRecord[];
  playerColor: 'w' | 'b';
}

const MoveHistorySidebar: React.FC<MoveHistorySidebarProps> = ({ moves, playerColor }) => {
  // Convert position to algebraic notation based on player's perspective
  const positionToNotation = (position: Position, team: 'w' | 'b'): string => {
    // For files (a-h), use the x coordinate (0-7) and convert to corresponding letter
    const file = HORIZONTAL_AXIS[position.x];
    
    // For ranks (1-8), calculate based on player's perspective
    let rank: number;
    
    if (playerColor === 'w') {
      // Standard board orientation (white's perspective)
      rank = 8 - position.y;
    } else {
      // Flipped board orientation (black's perspective)
      rank = position.y + 1;
    }
    
    // Apply the absolute difference with 9 to transform the rank
    rank = Math.abs(rank - 9);
    
    return `${file}${rank}`;
  };

  // Group moves into pairs (white move and black move)
  const moveRows = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    moveRows.push({
      whiteMove: moves[i],
      blackMove: i + 1 < moves.length ? moves[i + 1] : null
    });
  }

  // Format move notation with separate piece symbol and move text
  const formatMove = (move: MoveRecord): React.ReactNode => {
    if (!move) return '';
    
    // Get piece symbol
    let pieceSymbol = '';
    if (move.piece !== 'pawn') {
      // Chess piece symbols - use different symbols for white and black
      const pieceSymbols: {[key: string]: {white: string, black: string}} = {
        'king': { white: '♔', black: '♚' },
        'queen': { white: '♕', black: '♛' },
        'rook': { white: '♖', black: '♜' },
        'bishop': { white: '♗', black: '♝' },
        'knight': { white: '♘', black: '♞' }
      };
      pieceSymbol = move.team === 'w' ? pieceSymbols[move.piece].white : pieceSymbols[move.piece].black;
    } else {
      // Add pawn symbol
      pieceSymbol = move.team === 'w' ? '♙' : '♟';
    }
    
    // Handle castling
    if (move.castle) {
      return <>{move.castle === 'kingside' ? 'O-O' : 'O-O-O'}</>;
    }
    
    let moveText = '';
    
    // Add capture symbol
    if (move.capture) {
      // If it's a pawn and it captures, add the file
      if (move.piece === 'pawn') {
        moveText += HORIZONTAL_AXIS[move.from.x];
      }
      moveText += 'x';
    }
    
    // Add destination
    moveText += positionToNotation(move.to, move.team);
    
    // Add promotion
    if (move.promotion) {
      moveText += '=Q'; // Assume always promoting to queen for simplicity
    }
    
    // Add check symbol
    if (move.check) {
      moveText += '+';
    }
    
    // Return the piece symbol and move text as separate spans
    return (
      <>
        <span className="piece-symbol">{pieceSymbol}</span>{moveText}
      </>
    );
  };

  return (
    <div className="move-history-sidebar">
      <h2 className="move-history-title">Move History</h2>
      
      <div className="move-history-container">
        <table className="move-history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>White</th>
              <th>Black</th>
            </tr>
          </thead>
          <tbody>
            {moveRows.map((row, index) => (
              <tr key={index}>
                <td className="move-number">{index + 1}.</td>
                <td className={`move-cell white-move`}>
                  {row.whiteMove ? formatMove(row.whiteMove) : ''}
                </td>
                <td className={`move-cell black-move`}>
                  {row.blackMove ? formatMove(row.blackMove) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MoveHistorySidebar; 