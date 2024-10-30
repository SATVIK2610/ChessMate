// // RoomActions.tsx
// import React, { useState } from 'react';
// import './Room.css';

// interface RoomProps {
//     createRoom: () => void;
//     joinRoom: (roomId: string) => void;
// }

// const Room: React.FC<RoomProps> = ({ createRoom, joinRoom }) => {
//     const [roomIdInput, setRoomIdInput] = useState<string>('');

//     const handleJoinRoom = () => {
//         if (roomIdInput.trim()) {
//             joinRoom(roomIdInput);
//         }
//     };

//     return (
//         // <div className="room-actions">
//         //   <div className="room-card">
//         //     <h2>Join or Create a Chess Room</h2>
//         //     <button className="create-room-btn" onClick={createRoom}>
//         //       Create Room
//         //     </button>
//         //     <div className="divider">OR</div>
//         //     <input
//         //       type="text"
//         //       className="room-input"
//         //       value={roomIdInput}
//         //       onChange={(e) => setRoomIdInput(e.target.value)}
//         //       placeholder="Enter Room ID"
//         //     />
//         //     <button className="join-room-btn" onClick={handleJoinRoom}>
//         //       Join Room
//         //     </button>
//         //   </div>
//         // </div>
//         <div className="room">
//             <div className="main-div flex">
//                 <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//                 <div className="content flex">
//                     <h1>Chess Game</h1>
//                     <input type="text"
//                         className="inp"
//                         value={roomIdInput}
//                         onChange={(e) => setRoomIdInput(e.target.value)}
//                         placeholder="Enter Room ID" />
//                     <button onClick={handleJoinRoom} className="btn">Join Game</button>
//                     <p className='line'>Don't have an invite? <a onClick={createRoom}>Create a new room</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Room;


// Room.tsx
// import React, { useState } from 'react';
// import './Room.css';

// interface RoomProps {
//     createRoom: () => void;
//     joinRoom: (roomId: string) => void;
//     usernameInput: string;
//     setUsernameInput: (username: string) => void;
// }

// const Room: React.FC<RoomProps> = ({ createRoom, joinRoom, usernameInput, setUsernameInput }) => {
//     const [roomIdInput, setRoomIdInput] = useState<string>('');

//     const handleJoinRoom = () => {
//         if (roomIdInput.trim()) {
//             joinRoom(roomIdInput);
//         }
//     };

//     return (
//         <div className="room">
//             <div className="main-div flex">
//                 <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//                 <div className="content flex">
//                     <h1>Chess Game</h1>
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={usernameInput}
//                         onChange={(e) => setUsernameInput(e.target.value)}
//                         placeholder="Enter username"
//                     />
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={roomIdInput}
//                         onChange={(e) => setRoomIdInput(e.target.value)}
//                         placeholder="Enter Room ID"
//                     />
//                     <button onClick={handleJoinRoom} className="btn">Join Game</button>
//                     <p className='line'>Don't have an invite? <a onClick={createRoom}>Create a new room</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Room;

// USERNAME

// ALL WELL HERE

// import React, { useState } from 'react';
// import './Room.css';

// interface RoomProps {
//     createRoom: () => void;
//     joinRoom: (roomId: string) => void;
//     usernameInput: string;
//     setUsernameInput: (username: string) => void;
// }

// const Room: React.FC<RoomProps> = ({ createRoom, joinRoom, usernameInput, setUsernameInput }) => {
//     const [roomIdInput, setRoomIdInput] = useState<string>('');
//     const [error, setError] = useState<string>('');

//     const handleJoinRoom = () => {
//         // Validate username and room ID
//         if (!usernameInput.trim()) {
//             setError('Username is required.');
//             return;
//         }

//         if (!roomIdInput.trim()) {
//             setError('Room ID is required.');
//             return;
//         }

//         setError(''); // Clear any previous errors
//         joinRoom(roomIdInput);
//     };

//     return (
//         <div className="room">
//             <div className="main-div flex">
//                 <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//                 <div className="content flex">
//                     <h1>Chess Game</h1>
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={usernameInput}
//                         onChange={(e) => setUsernameInput(e.target.value)}
//                         placeholder="Enter username"
//                     />
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={roomIdInput}
//                         onChange={(e) => setRoomIdInput(e.target.value)}
//                         placeholder="Enter Room ID"
//                     />
//                     <button onClick={handleJoinRoom} className="btn">Join Game</button>
//                     {error && <p className="error">{error}</p>} {/* Display error message */}
//                     <p className='line'>Don't have an invite? <a onClick={createRoom}>Create a new room</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Room;

// ALL FINE HERE 2

// import React, { useState } from 'react';
// import './Room.css';
// import toast from 'react-hot-toast';

// interface RoomProps {
//     createRoom: () => void;
//     joinRoom: (roomId: string) => void;
//     usernameInput: string;
//     setUsernameInput: (username: string) => void;
// }

// const Room: React.FC<RoomProps> = ({ createRoom, joinRoom, usernameInput, setUsernameInput }) => {
//     const [roomIdInput, setRoomIdInput] = useState<string>('');

//     const handleJoinRoom = () => {
//         // Validate username and room ID
//         if (!usernameInput.trim()) {
//             toast.error('Username is required!');
//             return;
//         }

//         if (!roomIdInput.trim()) {
//             toast.error('Room ID is required!');
//             return;
//         }
//         joinRoom(roomIdInput);
//     };
//     const handleCreateRoom = () => {
//         // Validate username and room ID
//         if (!usernameInput.trim()) {
//             toast.error('Username is required!');
//             return;
//         }

//         createRoom();
//     };

//     return (
//         <div className="room">
//             <div className="main-div flex">
//                 <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//                 <div className="content flex">
//                     <h1>Chess Game</h1>
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={usernameInput}
//                         onChange={(e) => setUsernameInput(e.target.value)}
//                         placeholder="Enter username"
//                     />
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={roomIdInput}
//                         onChange={(e) => setRoomIdInput(e.target.value)}
//                         placeholder="Enter Room ID"
//                     />
//                     <button onClick={handleJoinRoom} className="btn">Join Game</button>
//                     <p className='line'>Don't have an invite? <a onClick={handleCreateRoom}>Create a new room</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Room;


// TEMP CORRECT

// import React, { useState } from 'react';
// import './Room.css';
// import toast from 'react-hot-toast';

// interface RoomProps {
//     createRoom: () => void;
//     joinRoom: (roomId: string) => void;
//     usernameInput: string;
//     setUsernameInput: (username: string) => void;
// }

// const Room: React.FC<RoomProps> = ({ createRoom, joinRoom, usernameInput, setUsernameInput }) => {
//     const [roomIdInput, setRoomIdInput] = useState<string>('');

//     const handleJoinRoom = () => {
//         // Validate username and room ID
//         if (!usernameInput.trim()) {
//             toast.error('Username is required!');
//             return;
//         }

//         if (!roomIdInput.trim()) {
//             toast.error('Room ID is required!');
//             return;
//         }
//         joinRoom(roomIdInput);
//     };
//     const handleCreateRoom = () => {
//         // Validate username and room ID
//         if (!usernameInput.trim()) {
//             toast.error('Username is required!');
//             return;
//         }

//         createRoom();
//     };

//     return (
//         <div className="room">
//             <div className="main-div flex">
//                 <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//                 <div className="content flex">
//                     <h1>Chess Game</h1>
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={usernameInput}
//                         onChange={(e) => setUsernameInput(e.target.value)}
//                         placeholder="Enter username"
//                     />
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={roomIdInput}
//                         onChange={(e) => setRoomIdInput(e.target.value)}
//                         placeholder="Enter Room ID"
//                     />
//                     <button onClick={handleJoinRoom} className="btn">Join Game</button>
//                     <p className='line'>Don't have an invite? <a onClick={handleCreateRoom}>Create a new room</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Room;


// import React, { useState } from 'react';
// import './Room.css';
// import toast from 'react-hot-toast';

// interface RoomProps {
//     createRoom: () => void;
//     joinRoom: (roomId: string) => void;
//     pl1: string;
//     setPl1: (username: string) => void;
//     pl2: string;
//     setPl2: (username: string) => void;
// }

// const Room: React.FC<RoomProps> = ({ createRoom, joinRoom, pl1, setPl1, pl2, setPl2 }) => {
//     const [roomIdInput, setRoomIdInput] = useState<string>('');

//     const handleJoinRoom = () => {
//         // Validate username and room ID
//         if (!pl2.trim()) {
//             toast.error('Username is required!');
//             return;
//         }

//         if (!roomIdInput.trim()) {
//             toast.error('Room ID is required!');
//             return;
//         }
//         joinRoom(roomIdInput);
//     };
//     const handleCreateRoom = () => {
//         // Validate username and room ID
//         if (!pl1.trim()) {
//             toast.error('Username is required!');
//             return;
//         }

//         createRoom();
//     };

//     const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if(pl1.length === 0){
//             setPl1(e.target.value);
//         }
//         else setPl2(e.target.value);
//     }

//     return (
//         <div className="room">
//             <div className="main-div flex">
//                 <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//                 <div className="content flex">
//                     <h1>Chess Game</h1>
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={usernameInput}
//                         onChange={changeHandler}
//                         placeholder="Enter username"
//                     />
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={roomIdInput}
//                         onChange={(e) => setRoomIdInput(e.target.value)}
//                         placeholder="Enter Room ID"
//                     />
//                     <button onClick={handleJoinRoom} className="btn">Join Game</button>
//                     <p className='line'>Don't have an invite? <a onClick={handleCreateRoom}>Create a new room</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Room;

// import React, { useState } from 'react';
// import './Room.css';
// import toast from 'react-hot-toast';

// interface RoomProps {
//     createRoom: () => void;
//     joinRoom: (roomId: string) => void;
//     pl1: string;
//     setPl1: (username: string) => void;
//     pl2: string;
//     setPl2: (username: string) => void;
// }

// const Room: React.FC<RoomProps> = ({ createRoom, joinRoom, pl1, setPl1, pl2, setPl2 }) => {
//     const [roomIdInput, setRoomIdInput] = useState<string>('');

//     const handleJoinRoom = () => {
//         // Validate username and room ID
//         if (!pl2.trim()) {
//             toast.error('Username is required!');
//             return;
//         }

//         if (!roomIdInput.trim()) {
//             toast.error('Room ID is required!');
//             return;
//         }
//         joinRoom(roomIdInput);
//     };

//     const handleCreateRoom = () => {
//         // Validate username and room ID
//         if (!pl1.trim()) {
//             toast.error('Username is required!');
//             return;
//         }
//         createRoom();
//     };

//     const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (roomIdInput.length === 0) {
//             setPl1(e.target.value);
//             console.log("player1 : ",pl1);
            
//         }
//         else {
//             setPl2(e.target.value);
//             console.log("player2 : ",pl2);
//         }
//     };

//     return (
//         <div className="room">
//             <div className="main-div flex">
//                 <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//                 <div className="content flex">
//                     <h1>Chess Game</h1>
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={roomIdInput.length === 0 ? pl1 : pl2} // Set input value based on room creation
//                         onChange={changeHandler}
//                         placeholder="Enter username"
//                     />
//                     <input 
//                         type="text"
//                         className="inp"
//                         value={roomIdInput}
//                         onChange={(e) => setRoomIdInput(e.target.value)}
//                         placeholder="Enter Room ID"
//                     />
//                     <button onClick={handleJoinRoom} className="btn">Join Game</button>
//                     <p className='line'>Don't have an invite? <a onClick={handleCreateRoom}>Create a new room</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Room;

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
