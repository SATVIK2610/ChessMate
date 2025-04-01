import { Chess, Move } from 'chess.js';

/**
 * Difficulty levels for bot play
 */
export enum BotDifficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3
}

/**
 * Calculates the bot's next move based on the current board state.
 * @param fen The current board state in FEN notation
 * @param difficulty The bot difficulty level (1-3)
 * @returns The best move in SAN (Standard Algebraic Notation) format, or null if no moves possible
 */
export function calculateBotMove(fen: string, difficulty: BotDifficulty = BotDifficulty.EASY): string | null {
  const game = new Chess(fen);

  if (game.isGameOver()) {
    return null;
  }

  // Get all legal moves
  const possibleMoves = game.moves({ verbose: true });
  
  if (possibleMoves.length === 0) {
    return null;
  }

  switch (difficulty) {
    case BotDifficulty.EASY:
      return calculateRandomMove(possibleMoves);
    case BotDifficulty.MEDIUM:
      return calculateIntermediateMove(game, possibleMoves);
    case BotDifficulty.HARD:
      return calculateAdvancedMove(game, possibleMoves);
    default:
      return calculateRandomMove(possibleMoves);
  }
}

/**
 * Simple bot that makes random legal moves
 */
function calculateRandomMove(possibleMoves: Move[]): string {
  const randomIndex = Math.floor(Math.random() * possibleMoves.length);
  return possibleMoves[randomIndex].san;
}

/**
 * Intermediate bot that captures pieces when possible or makes random moves
 */
function calculateIntermediateMove(game: Chess, possibleMoves: Move[]): string {
  // Look for captures
  const captureMoves = possibleMoves.filter(move => move.flags.includes('c'));
  
  // Look for check moves
  const checkMoves = possibleMoves.filter(move => {
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move);
    return gameCopy.isCheck();
  });
  
  // Prioritize captures and checks
  if (captureMoves.length > 0) {
    const randomCapture = Math.floor(Math.random() * captureMoves.length);
    return captureMoves[randomCapture].san;
  } else if (checkMoves.length > 0) {
    const randomCheck = Math.floor(Math.random() * checkMoves.length);
    return checkMoves[randomCheck].san;
  } else {
    // If no captures, make a random move
    return calculateRandomMove(possibleMoves);
  }
}

/**
 * Advanced bot that evaluates piece values and board position
 */
function calculateAdvancedMove(game: Chess, possibleMoves: Move[]): string {
  // Simple piece values for evaluation
  const pieceValues: Record<string, number> = {
    'p': 1,    // pawn
    'n': 3,    // knight
    'b': 3,    // bishop
    'r': 5,    // rook
    'q': 9,    // queen
    'k': 0     // king (not valued for captures as it ends the game)
  };

  // Evaluate each move
  const moveScores = possibleMoves.map(move => {
    const gameCopy = new Chess(game.fen());
    gameCopy.move(move);
    
    let score = 0;
    
    // Bonus for captures based on piece value
    if (move.flags.includes('c')) {
      score += pieceValues[move.captured?.toLowerCase() || 'p'] * 10;
    }
    
    // Bonus for checks and checkmate
    if (gameCopy.isCheck()) {
      score += 5;
      // Extra bonus for checkmate
      if (gameCopy.isCheckmate()) {
        score += 1000;
      }
    }
    
    // Penalty for moving into a position where our piece can be captured
    const enemyMoves = gameCopy.moves({ verbose: true });
    for (const enemyMove of enemyMoves) {
      if (enemyMove.flags.includes('c')) {
        score -= pieceValues[enemyMove.captured?.toLowerCase() || 'p'] * 8;
      }
    }
    
    return { move, score };
  });
  
  // Sort by score descending and get the best move
  moveScores.sort((a, b) => b.score - a.score);
  
  // Choose randomly among top 3 moves to add some variety
  const topMoves = moveScores.slice(0, Math.min(3, moveScores.length));
  const selectedIndex = Math.floor(Math.random() * topMoves.length);
  
  return topMoves[selectedIndex].move.san;
} 