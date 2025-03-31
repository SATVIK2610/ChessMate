// RoomContext.tsx
import React, { createContext, useContext, useState } from 'react';

// Define the game modes
export type GameMode = 'multiplayer' | 'bot' | null;

export interface RoomContextType {
    pl1: string;
    setPl1: (name: string) => void;
    pl2: string;
    setPl2: (name: string) => void;
    roomId: string;
    setRoomId: (id: string) => void;
    timer: number;
    setTimer: (minutes: number) => void;
    whiteTime: number;
    setWhiteTime: (seconds: number) => void;
    blackTime: number;
    setBlackTime: (seconds: number) => void;
    gameStarted: boolean;
    setGameStarted: (started: boolean) => void;
    activeTimer: 'white' | 'black' | null;
    setActiveTimer: (timer: 'white' | 'black' | null) => void;
    // New bot-related states
    gameMode: GameMode;
    setGameMode: (mode: GameMode) => void;
    botDifficulty: number;
    setBotDifficulty: (difficulty: number) => void;
    playerColor: 'w' | 'b';
    setPlayerColor: (color: 'w' | 'b') => void;
    isThinking: boolean;
    setIsThinking: (thinking: boolean) => void;
    lastMove: { from: string; to: string } | null;
    setLastMove: (move: { from: string; to: string } | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pl1, setPl1] = useState<string>('');
    const [pl2, setPl2] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');
    const [timer, setTimer] = useState<number>(10); // Default 10 minutes
    const [whiteTime, setWhiteTime] = useState<number>(600); // 10 minutes in seconds
    const [blackTime, setBlackTime] = useState<number>(600);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [activeTimer, setActiveTimer] = useState<'white' | 'black' | null>(null);
    // New bot-related states
    const [gameMode, setGameMode] = useState<GameMode>(null);
    const [botDifficulty, setBotDifficulty] = useState<number>(1);
    const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
    const [isThinking, setIsThinking] = useState<boolean>(false);
    const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

    return (
        <RoomContext.Provider value={{ 
            pl1, setPl1, 
            pl2, setPl2, 
            roomId, setRoomId,
            timer, setTimer,
            whiteTime, setWhiteTime,
            blackTime, setBlackTime,
            gameStarted, setGameStarted,
            activeTimer, setActiveTimer,
            // New bot-related states
            gameMode, setGameMode,
            botDifficulty, setBotDifficulty,
            playerColor, setPlayerColor,
            isThinking, setIsThinking,
            lastMove, setLastMove
        }}>
            {children}
        </RoomContext.Provider>
    );
};

export const useRoomContext = () => {
    const context = useContext(RoomContext);
    if (context === undefined) {
        throw new Error('useRoomContext must be used within a RoomProvider');
    }
    return context;
};
