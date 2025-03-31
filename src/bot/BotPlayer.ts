import { Chess } from 'chess.js';

// Log level for detailed logging
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  INFO = 2,
  DEBUG = 3
}

// Current log level
let currentLogLevel = LogLevel.INFO;

// Utility function for logging
export function botLog(level: LogLevel, message: string, data?: any): void {
  if (level <= currentLogLevel) {
    const prefix = `[BOT ${LogLevel[level]}]`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }
}

// Set the bot log level
export function setBotLogLevel(level: LogLevel): void {
  currentLogLevel = level;
  botLog(LogLevel.INFO, `Log level set to ${LogLevel[level]}`);
}

// Piece values for basic evaluation
const PIECE_VALUES: { [key: string]: number } = {
  p: 1,   // pawn
  n: 3,   // knight
  b: 3,   // bishop
  r: 5,   // rook
  q: 9,   // queen
  k: 100  // king (high value to prioritize king safety)
};

// Simple piece-square tables for positional evaluation
// These give bonuses for pieces being on good squares
const PAWN_POSITION_SCORES = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];

/**
 * Basic evaluation function - returns a score for the position
 * Positive is good for white, negative is good for black
 */
function evaluateBoard(game: Chess): number {
  botLog(LogLevel.DEBUG, "Evaluating board position");
  
  // Check for checkmate
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -1000 : 1000; // If white is in checkmate, bad for white
  }
  
  // Check for draw
  if (game.isDraw()) {
    return 0;
  }
  
  let score = 0;
  const board = game.board();
  
  // Material and positional evaluation
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        // Material score
        const materialValue = PIECE_VALUES[piece.type];
        const pieceValue = piece.color === 'w' ? materialValue : -materialValue;
        score += pieceValue;
        
        // Positional bonus for pawns
        if (piece.type === 'p') {
          // For white pawns
          if (piece.color === 'w') {
            score += PAWN_POSITION_SCORES[i][j] * 0.1;
          } else {
            // For black pawns (flip the table)
            score -= PAWN_POSITION_SCORES[7 - i][j] * 0.1;
          }
        }
      }
    }
  }
  
  botLog(LogLevel.DEBUG, `Evaluation score: ${score}`);
  return score;
}

/**
 * Calculate the bot's move based on the current position
 * @param fen FEN string representing the current board position
 * @param difficulty Bot difficulty level (0-3)
 * @returns The selected move in UCI format (e.g., "e2e4")
 */
export function calculateBotMove(fen: string, difficulty: number = 1): string | null {
  botLog(LogLevel.INFO, `Calculating bot move at difficulty ${difficulty}`, {fen});
  
  // Initialize chess.js with the current position
  const game = new Chess(fen);
  
  // Check if the game is over
  if (game.isGameOver()) {
    botLog(LogLevel.INFO, "Game is over, no moves to make");
    return null;
  }
  
  // Get all legal moves in the position
  const legalMoves = game.moves({ verbose: true });
  botLog(LogLevel.INFO, `Found ${legalMoves.length} legal moves`, legalMoves);
  
  if (legalMoves.length === 0) {
    botLog(LogLevel.ERROR, "No legal moves available but game not over");
    return null;
  }
  
  // Level 0: Random move
  if (difficulty === 0) {
    const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    botLog(LogLevel.INFO, "Random move selected", randomMove);
    return `${randomMove.from}${randomMove.to}${randomMove.promotion || ''}`;
  }
  
  // Level 1+: Basic evaluation with looking 1 move ahead
  let bestScore = -Infinity;
  let bestMove = legalMoves[0];
  
  for (const move of legalMoves) {
    // Make the move on a copy of the game
    game.move(move);
    
    // Evaluate the resulting position
    const score = -evaluateBoard(game); // Negative because we're evaluating from opponent's perspective
    botLog(LogLevel.DEBUG, `Evaluated move ${move.san} with score ${score}`);
    
    // Undo the move
    game.undo();
    
    // Update best move if this is better
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
      botLog(LogLevel.DEBUG, `New best move: ${move.san} with score ${score}`);
    }
  }
  
  botLog(LogLevel.INFO, `Selected move: ${bestMove.san} with score ${bestScore}`);
  return `${bestMove.from}${bestMove.to}${bestMove.promotion || ''}`;
}

/**
 * Convert a UCI format move to an object for chess.js
 * @param uciMove Move in UCI format (e.g., "e2e4")
 * @returns Object representing the move for chess.js
 */
export function uciToMoveObject(uciMove: string): { from: string; to: string; promotion?: string } {
  if (!uciMove || uciMove.length < 4) {
    botLog(LogLevel.ERROR, "Invalid UCI move format", uciMove);
    throw new Error("Invalid UCI move format");
  }
  
  const from = uciMove.substring(0, 2);
  const to = uciMove.substring(2, 4);
  const promotion = uciMove.length > 4 ? uciMove.substring(4, 5) : undefined;
  
  return { from, to, promotion };
} 