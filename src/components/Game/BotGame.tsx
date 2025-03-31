import React, { useEffect, useState } from 'react';
import { Chess, Move } from 'chess.js';
import { useRoomContext } from '../Room/RoomContext';
import { calculateBotMove, botLog, LogLevel } from '../../bot/BotPlayer';
import { Position } from '../../models/Position';
import { PieceType } from '../../Types';
import { TeamType } from '../../Types';
import { Piece } from '../../models/Piece';
import { Board } from '../../models/Board';

interface BotGameProps {
    board: Board;
    makeMove: (piece: Piece, destination: Position) => boolean;
}

const BotGame: React.FC<BotGameProps> = ({ board, makeMove }) => {
    const { 
        botDifficulty,
        playerColor,
        isThinking,
        setIsThinking,
        setLastMove
    } = useRoomContext();

    const [chessEngine] = useState(new Chess());

    // Convert our board state to FEN notation for chess.js
    const convertBoardToFEN = (board: Board): string => {
        let fen = '';
        for (let rank = 7; rank >= 0; rank--) {
            let emptySquares = 0;
            for (let file = 0; file < 8; file++) {
                const piece = board.pieces.find(p => 
                    p.position.x === file && p.position.y === rank
                );

                if (piece) {
                    if (emptySquares > 0) {
                        fen += emptySquares;
                        emptySquares = 0;
                    }
                    // Convert our piece type to FEN notation
                    let symbol = '';
                    switch (piece.type) {
                        case PieceType.PAWN: symbol = 'p'; break;
                        case PieceType.KNIGHT: symbol = 'n'; break;
                        case PieceType.BISHOP: symbol = 'b'; break;
                        case PieceType.ROOK: symbol = 'r'; break;
                        case PieceType.QUEEN: symbol = 'q'; break;
                        case PieceType.KING: symbol = 'k'; break;
                    }
                    // Make uppercase if white
                    if (piece.team === TeamType.OUR) {
                        symbol = symbol.toUpperCase();
                    }
                    fen += symbol;
                } else {
                    emptySquares++;
                }
            }
            if (emptySquares > 0) {
                fen += emptySquares;
            }
            if (rank > 0) {
                fen += '/';
            }
        }

        // Add current turn
        fen += board.currentTeam === TeamType.OUR ? ' w ' : ' b ';
        
        // Add castling availability (simplified for now)
        fen += '- ';
        
        // Add en passant target square (simplified for now)
        fen += '- ';
        
        // Add halfmove clock and fullmove number (simplified)
        fen += '0 1';

        return fen;
    };

    // Convert chess.js move to our Position format
    const convertChessJsMove = (move: Move): { 
        initialPosition: Position; 
        finalPosition: Position;
        piece: Piece;
    } => {
        const fileMap: { [key: string]: number } = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
        
        const fromFile = fileMap[move.from[0]];
        const fromRank = parseInt(move.from[1]) - 1;
        const toFile = fileMap[move.to[0]];
        const toRank = parseInt(move.to[1]) - 1;

        const initialPosition = new Position(fromFile, fromRank);
        const piece = board.pieces.find(p => p.position.samePosition(initialPosition));

        if (!piece) {
            throw new Error('Piece not found at initial position');
        }

        return {
            initialPosition,
            finalPosition: new Position(toFile, toRank),
            piece
        };
    };

    useEffect(() => {
        // If it's the bot's turn
        const isBotTurn = (board.currentTeam === TeamType.OUR && playerColor === 'b') ||
                         (board.currentTeam === TeamType.OPPONENT && playerColor === 'w');

        if (isBotTurn && !isThinking) {
            setIsThinking(true);
            
            // Update chess.js engine with current board state
            try {
                const fen = convertBoardToFEN(board);
                chessEngine.load(fen);
                
                // Calculate bot's move
                setTimeout(async () => {
                    try {
                        const botMove = await calculateBotMove(chessEngine.fen(), botDifficulty);
                        if (botMove) {
                            const move = chessEngine.moves({ verbose: true }).find(m => 
                                m.from + m.to === botMove
                            );
                            
                            if (!move) {
                                throw new Error('Invalid move returned by bot');
                            }
                            
                            const { piece, finalPosition } = convertChessJsMove(move);
                            
                            // Log the bot's move
                            botLog(LogLevel.INFO, `Bot moving from ${move.from} to ${move.to}`, move);
                            
                            // Update last move in context
                            setLastMove({ from: move.from, to: move.to });
                            
                            // Make the move
                            makeMove(piece, finalPosition);
                        }
                    } catch (error) {
                        console.error('Error calculating bot move:', error);
                        botLog(LogLevel.ERROR, 'Failed to calculate bot move');
                    } finally {
                        setIsThinking(false);
                    }
                }, 500); // Add a small delay to make the bot's moves feel more natural
            } catch (error) {
                console.error('Error loading FEN:', error);
                botLog(LogLevel.ERROR, 'Failed to load board state');
                setIsThinking(false);
            }
        }
    }, [board, playerColor, botDifficulty, isThinking]);

    return null; // This is a logic-only component
};

export default BotGame; 