import React, { useState } from 'react';
import './Room.css';
import toast from 'react-hot-toast';
import { useRoomContext } from './RoomContext'; // Adjust the import according to your file structure

const Room: React.FC<{ createRoom: () => void; joinRoom: (roomId: string) => void; }> = ({ createRoom, joinRoom }) => {
    const { pl1, setPl1, pl2, setPl2, roomId, setRoomId } = useRoomContext();
    const [roomIdInput, setRoomIdInput] = useState<string>('');
    const [isRoomCreated, setIsRoomCreated] = useState<boolean>(false);

    const handleJoinRoom = () => {
        if (!pl1.trim()) {
            toast.error('Username is required!');
            return;
        }

        if (!roomIdInput.trim()) {
            toast.error('Room ID is required!');
            return;
        }
        setRoomId(roomIdInput); // Store the room ID in context
        joinRoom(roomIdInput);
    };

    const handleCreateRoom = () => {
        if (!pl1.trim()) {
            toast.error('Username is required!');
            return;
        }

        createRoom();
        setIsRoomCreated(true);
    };

    const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (!isRoomCreated) {
            setPl1(value);
        } else {
            setPl2(value);
        }
    };

    return (
        <div className="room">
            <div className="main-div flex">
                <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
                <div className="content flex">
                    <h1>ChessMate</h1>
                    <input 
                        type="text"
                        className="inp"
                        value={isRoomCreated ? pl2 : pl1}
                        onChange={changeHandler}
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
                    <p className='line'>Don't have an invite? <a onClick={handleCreateRoom}>Create a new room</a></p>
                </div>
            </div>
        </div>
    );
};

export default Room;
