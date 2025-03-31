import React, { useState, KeyboardEvent, useCallback } from 'react';
import './Room.css';
import toast from 'react-hot-toast';
import { useRoomContext, GameMode } from './RoomContext'; // Import GameMode type

// Add a new prop for starting a bot game
const Room: React.FC<{ 
    createRoom: (username: string) => void; 
    joinRoom: (roomId: string, username: string) => void;
    startBotGame: (username: string, playerColor: 'w' | 'b', difficulty: number) => void; 
}> = ({ createRoom, joinRoom, startBotGame }) => {
    const { 
        pl1, setPl1, 
        pl2, setPl2, 
        roomId, setRoomId, 
        timer, setTimer,
        setGameMode,
        setBotDifficulty,
        setPlayerColor
    } = useRoomContext();
    
    const [roomIdInput, setRoomIdInput] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'join' | 'create' | 'bot'>('join');
    const [username, setUsername] = useState<string>('');
    const [botColor, setBotColor] = useState<'w' | 'b'>('b'); // Default: bot plays as black, player as white
    const [difficulty, setDifficulty] = useState<number>(1); // Default difficulty level

    const handleJoinRoom = () => {
        if (!username.trim()) {
            toast.error('Username is required!');
            return;
        }

        if (!roomIdInput.trim()) {
            toast.error('Room ID is required!');
            return;
        }
        
        // Sanitize roomId - remove any curly braces or quotes that might be from copying an object
        let cleanRoomId = roomIdInput.trim();
        cleanRoomId = cleanRoomId.replace(/[{}"':]/g, '');
        
        // If user accidentally copied an object string
        if (cleanRoomId.includes('roomId')) {
            try {
                // Try to extract roomId from object string
                const match = cleanRoomId.match(/roomId[,:]?\s*([a-z0-9]+)/i);
                if (match && match[1]) {
                    cleanRoomId = match[1];
                    toast('Extracted room ID from copied object');
                }
            } catch (e) {
                console.error('Failed to parse roomId:', e);
            }
        }
        
        setRoomId(cleanRoomId);
        setPl2(username);
        setGameMode('multiplayer');
        
        joinRoom(cleanRoomId, username);
    };

    const handleCreateRoom = () => {
        if (!username.trim()) {
            toast.error('Username is required!');
            return;
        }

        setPl1(username);
        setGameMode('multiplayer');
        createRoom(username);
    };
    
    const handleStartBotGame = () => {
        if (!username.trim()) {
            toast.error('Username is required!');
            return;
        }
        
        console.log(`Starting bot game: User ${username} playing as ${botColor === 'w' ? 'Black' : 'White'}, difficulty ${difficulty}`);
        
        // Set the player's color (opposite of bot color)
        const playerColorChoice = botColor === 'w' ? 'b' : 'w';
        setPlayerColor(playerColorChoice);
        
        // Set bot difficulty in context
        setBotDifficulty(difficulty);
        
        // Set game mode
        setGameMode('bot');
        
        // Start the bot game
        startBotGame(username, playerColorChoice, difficulty);
    };
    
    // Handle Enter key press
    const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (activeTab === 'join') {
                handleJoinRoom();
            } else if (activeTab === 'create') {
                handleCreateRoom();
            } else if (activeTab === 'bot') {
                handleStartBotGame();
            }
        }
    }, [activeTab, handleJoinRoom, handleCreateRoom, handleStartBotGame]);

    const timerOptions = [
        { value: 1, label: '1 minute' },
        { value: 3, label: '3 minutes' },
        { value: 5, label: '5 minutes' },
        { value: 10, label: '10 minutes' },
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' }
    ];
    
    const difficultyOptions = [
        { value: 0, label: 'Beginner' },
        { value: 1, label: 'Intermediate' },
        { value: 2, label: 'Advanced' }
    ];

    return (
        <div className="room">
            <div className="main-div flex">
                <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
                <h1>ChessMate</h1>
                
                <div className="tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
                        onClick={() => setActiveTab('join')}
                    >
                        Join Game
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                        onClick={() => setActiveTab('create')}
                    >
                        Create Game
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'bot' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bot')}
                    >
                        Play with Bot
                    </button>
                </div>
                
                {activeTab === 'join' ? (
                    <div className="tab-content">
                        <input 
                            type="text"
                            className="inp"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            onKeyDown={handleKeyPress}
                        />
                        <input 
                            type="text"
                            className="inp"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            placeholder="Enter Room ID"
                            onKeyDown={handleKeyPress}
                        />
                        <button onClick={handleJoinRoom} className="btn">Join Game</button>
                    </div>
                ) : activeTab === 'create' ? (
                    <div className="tab-content">
                        <input 
                            type="text"
                            className="inp"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            onKeyDown={handleKeyPress}
                        />
                        <select 
                            className="inp"
                            value={timer}
                            onChange={(e) => setTimer(Number(e.target.value))}
                            onKeyDown={handleKeyPress}
                        >
                            {timerOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleCreateRoom} className="btn">Create Game</button>
                    </div>
                ) : (
                    <div className="tab-content">
                        <input 
                            type="text"
                            className="inp"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            onKeyDown={handleKeyPress}
                        />
                        
                        <div className="select-group">
                            <label>Play as:</label>
                            <div className="radio-group">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="color" 
                                        checked={botColor === 'b'} 
                                        onChange={() => setBotColor('b')} 
                                    />
                                    White
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="color" 
                                        checked={botColor === 'w'} 
                                        onChange={() => setBotColor('w')} 
                                    />
                                    Black
                                </label>
                            </div>
                        </div>
                        
                        <div className="select-wrapper">
                            <label>Bot Difficulty:</label>
                            <select 
                                className="inp"
                                value={difficulty}
                                onChange={(e) => setDifficulty(Number(e.target.value))}
                                onKeyDown={handleKeyPress}
                            >
                                {difficultyOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button onClick={handleStartBotGame} className="btn">Start Game</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Room;
