// RoomContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface RoomContextType {
    pl1: string;
    setPl1: (username: string) => void;
    pl2: string;
    setPl2: (username: string) => void;
    roomId: string;
    setRoomId: (id: string) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pl1, setPl1] = useState<string>('');
    const [pl2, setPl2] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');

    return (
        <RoomContext.Provider value={{ pl1, setPl1, pl2, setPl2, roomId, setRoomId }}>
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
