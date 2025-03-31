import React, { useState } from 'react';
import './Room.css';
import toast from 'react-hot-toast';
import { useRoomContext } from './RoomContext'; // Adjust the import according to your file structure

const Room: React.FC<{ createRoom: (username: string) => void; joinRoom: (roomId: string, username: string) => void; }> = ({ createRoom, joinRoom }) => {
    const { pl1, setPl1, pl2, setPl2, roomId, setRoomId, timer, setTimer } = useRoomContext();
    const [roomIdInput, setRoomIdInput] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
    const [username, setUsername] = useState<string>('');

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
        
        joinRoom(cleanRoomId, username);
    };

    const handleCreateRoom = () => {
        if (!username.trim()) {
            toast.error('Username is required!');
            return;
        }

        setPl1(username);
        createRoom(username);
    };

    const timerOptions = [
        { value: 1, label: '1 minute' },
        { value: 3, label: '3 minutes' },
        { value: 5, label: '5 minutes' },
        { value: 10, label: '10 minutes' },
        { value: 15, label: '15 minutes' },
        { value: 30, label: '30 minutes' }
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
                </div>
                
                {activeTab === 'join' ? (
                    <div className="tab-content">
                        <input 
                            type="text"
                            className="inp"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                        <input 
                            type="text"
                            className="inp"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            placeholder="Enter Room ID"
                        />
                        <button onClick={handleJoinRoom} className="btn">Join Game</button>
                    </div>
                ) : (
                    <div className="tab-content">
                        <input 
                            type="text"
                            className="inp"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                        />
                        <select 
                            className="inp"
                            value={timer}
                            onChange={(e) => setTimer(Number(e.target.value))}
                        >
                            {timerOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button onClick={handleCreateRoom} className="btn">Create Game</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Room;
