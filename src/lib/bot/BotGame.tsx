import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Piece, Position } from '../../models';
import { PieceType, TeamType } from '../../Types';
import { calculateBotMove, BotDifficulty } from './engine';
import { toast } from 'react-hot-toast';

// This custom hook handles chess game logic against bot
// It's separate from multi-player to avoid conflicts
export const useBotGame = ({
  playMove,
  pieces,
  totalTurns = 0,
  playerColor,
  botDifficulty,
  onGameOver,
  leaveGame
}: {
  playMove: (piece: Piece, pos: Position) => boolean;
  pieces: Piece[];
  totalTurns?: number;
  playerColor: 'w' | 'b';
  botDifficulty: BotDifficulty;
  onGameOver: (result: string) => void;
  leaveGame: () => void;
}) => {
  // Chess.js instance to track board state and validate moves
  const [game, setGame] = useState<Chess>(new Chess());
  const [lastMove, setLastMove] = useState<string | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(playerColor === 'w');
  const [gameStatus, setGameStatus] = useState<string>('');
  
  const botThinking = useRef<boolean>(false);

  // Initialize new game
  useEffect(() => {
    const newGame = new Chess();
    setGame(newGame);
    setIsPlayerTurn(playerColor === 'w');
    setGameStatus('');
    setLastMove(null);
    
    // If bot plays first (player is black)
    if (playerColor === 'b') {
      botThinking.current = true;
      // Small delay to make the bot's move visible
      setTimeout(() => makeBotMove(newGame), 500);
    }
  }, [playerColor]);

  // Check game state after each move
  useEffect(() => {
    if (!game) return;
    
    checkGameStatus();
    
    // Bot's turn
    if (!isPlayerTurn && !game.isGameOver() && !botThinking.current) {
      botThinking.current = true;
      // Delay bot move to simulate thinking
      setTimeout(() => makeBotMove(game), 500);
    }
  }, [isPlayerTurn, game]);

  // Make the bot's move
  const makeBotMove = (currentGame: Chess) => {
    if (currentGame.isGameOver()) {
      botThinking.current = false;
      return;
    }

    try {
      const botMoveSan = calculateBotMove(currentGame.fen(), botDifficulty);
      
      if (botMoveSan) {
        // Clone the game to keep state updates clean
        const gameCopy = new Chess(currentGame.fen());
        const moveResult = gameCopy.move(botMoveSan);
        
        if (moveResult) {
          // Update the game state
          setGame(gameCopy);
          setLastMove(botMoveSan);
          
          // Find the corresponding piece and position in our model
          const fromPos = {
            x: moveResult.from.charCodeAt(0) - 'a'.charCodeAt(0),
            y: playerColor === 'w' ? 7 - (parseInt(moveResult.from.charAt(1)) - 1) : parseInt(moveResult.from.charAt(1)) - 1
          };
          
          const toPos = {
            x: moveResult.to.charCodeAt(0) - 'a'.charCodeAt(0),
            y: playerColor === 'w' ? 7 - (parseInt(moveResult.to.charAt(1)) - 1) : parseInt(moveResult.to.charAt(1)) - 1
          };
          
          const movingPiece = pieces.find(p => 
            p.position.x === fromPos.x && 
            p.position.y === fromPos.y
          );
          
          if (movingPiece) {
            // Make the move in the board model
            playMove(movingPiece, new Position(toPos.x, toPos.y));
          }
          
          // Switch to player's turn
          setIsPlayerTurn(true);
        }
      }
    } catch (error) {
      console.error('Bot move error:', error);
      toast.error('The bot encountered an error making its move');
    } finally {
      botThinking.current = false;
    }
  };

  // Handle player's move
  const handlePlayerMove = (piece: Piece, position: Position): boolean => {
    if (!isPlayerTurn || game.isGameOver()) {
      return false;
    }

    // Convert our position model to chess.js coordinates
    const fromFile = String.fromCharCode(97 + piece.position.x);
    const fromRank = playerColor === 'w' ? 8 - piece.position.y : piece.position.y + 1;
    const toFile = String.fromCharCode(97 + position.x);
    const toRank = playerColor === 'w' ? 8 - position.y : position.y + 1;
    
    const from = `${fromFile}${fromRank}`;
    const to = `${toFile}${toRank}`;
    
    // Special case for promotion
    let promotion: string | undefined;
    if ((piece.type === PieceType.PAWN) && 
        ((playerColor === 'w' && toRank === 8) || 
         (playerColor === 'b' && toRank === 1))) {
      promotion = 'q'; // Always promote to queen for simplicity
    }
    
    try {
      // Try to make the move in chess.js
      const moveDetails = game.move({ 
        from, 
        to,
        promotion
      });
      
      if (moveDetails) {
        setLastMove(moveDetails.san);
        setGame(new Chess(game.fen())); // Update with new position
        
        // Make the move in the board model
        const moveSuccess = playMove(piece, position);
        
        if (moveSuccess) {
          // Switch to bot's turn
          setIsPlayerTurn(false);
          return true;
        }
      }
    } catch (error) {
      console.error('Move error:', error);
    }
    
    return false;
  };

  // Check the game status
  const checkGameStatus = () => {
    if (!game) return;
    
    if (game.isCheckmate()) {
      const winner = game.turn() === 'w' ? 'Black' : 'White';
      setGameStatus(`Checkmate! ${winner} wins.`);
      onGameOver(`${winner} wins by checkmate`);
    } else if (game.isDraw()) {
      let reason = 'Draw';
      if (game.isStalemate()) reason = 'Stalemate';
      else if (game.isThreefoldRepetition()) reason = 'Threefold Repetition';
      else if (game.isInsufficientMaterial()) reason = 'Insufficient Material';
      setGameStatus(`Game drawn by ${reason}`);
      onGameOver(`Draw by ${reason}`);
    } else if (game.isCheck()) {
      setGameStatus(`Check!`);
    } else {
      setGameStatus('');
    }
  };

  // For debugging
  const getCurrentFen = () => {
    return game.fen();
  };

  return {
    handlePlayerMove,
    isPlayerTurn,
    gameStatus,
    lastMove,
    getCurrentFen,
    leaveGame
  };
};

export default useBotGame; 