// RoomContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface RoomContextType {
    pl1: string;
    setPl1: (username: string) => void;
    pl2: string;
    setPl2: (username: string) => void;
    roomId: string;
    setRoomId: (id: string) => void;
    timer: number;
    setTimer: (time: number) => void;
    whiteTime: number;
    setWhiteTime: (time: number) => void;
    blackTime: number;
    setBlackTime: (time: number) => void;
    gameStarted: boolean;
    setGameStarted: (started: boolean) => void;
    activeTimer: 'white' | 'black' | null;
    setActiveTimer: (timer: 'white' | 'black' | null) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pl1, setPl1] = useState<string>('');
    const [pl2, setPl2] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');
    const [timer, setTimer] = useState<number>(10); // Default 10 minutes
    const [whiteTime, setWhiteTime] = useState<number>(10 * 60); // in seconds
    const [blackTime, setBlackTime] = useState<number>(10 * 60); // in seconds
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [activeTimer, setActiveTimer] = useState<'white' | 'black' | null>(null);

    return (
        <RoomContext.Provider value={{ 
            pl1, setPl1, 
            pl2, setPl2, 
            roomId, setRoomId,
            timer, setTimer,
            whiteTime, setWhiteTime,
            blackTime, setBlackTime,
            gameStarted, setGameStarted,
            activeTimer, setActiveTimer
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
