// ALL WELL HERE

// import { useRef, useState, useEffect } from "react";
// import io, { Socket } from "socket.io-client";
// import "./Chessboard.css";
// import Tile from "../Tile/Tile";
// import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
// import { Piece, Position } from "../../models";

// const socket: Socket = io("http://localhost:4000");

// interface Props {
//   playMove: (piece: Piece, position: Position) => boolean;
//   pieces: Piece[];
//   team: string;
//   usernameInput: string;
// }

// export default function Chessboard({ playMove, pieces, team, usernameInput }: Props) {
//   const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
//   const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
//   const [usernames, setUsernames] = useState<string[]>([]);
//   const chessboardRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     socket.on("opponentMove", (moveData: { piece: Piece; position: Position }) => {
//       const { piece, position } = moveData;
//       playMove(piece, position);
//     });

//     socket.on('userJoined', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     socket.on('userLeft', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     return () => {
//       socket.off("opponentMove");
//       socket.off('userJoined');
//       socket.off('userLeft');
//     };
//   }, [playMove]);

//   function getPieceAtTile(e: React.MouseEvent): Piece | undefined {
//     const chessboard = chessboardRef.current;
//     if (!chessboard) return undefined;

//     const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//     const y = isWhiteTeam ? 
//       HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//       Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//     return pieces.find((piece) => piece.position.samePosition(new Position(x, y)));
//   }

//   function grabPiece(e: React.MouseEvent) {
//     const element = e.target as HTMLElement;
//     const chessboard = chessboardRef.current;
//     e.preventDefault();
//     const currentPiece = getPieceAtTile(e);
//     if (element.classList.contains("chess-piece") && chessboard && currentPiece?.team === team) {
//       const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const grabY = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       setGrabPosition(new Position(grabX, grabY));

//       const x = e.clientX - GRID_SIZE / 2;
//       const y = e.clientY - GRID_SIZE / 2;
//       element.style.position = "absolute";
//       element.style.left = `${x}px`;
//       element.style.top = `${y}px`;

//       setActivePiece(element);
//     }
//   }

//   function movePiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
//     if (activePiece && chessboard && currentPiece?.team === team) {
//       const minX = chessboard.offsetLeft - 25;
//       const minY = chessboard.offsetTop - 25;
//       const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
//       const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
//       const x = e.clientX - 50;
//       const y = e.clientY - 50;
//       activePiece.style.position = "absolute";
//       activePiece.style.left = `${Math.min(maxX, Math.max(minX, x))}px`;
//       activePiece.style.top = `${Math.min(maxY, Math.max(minY, y))}px`;
//     }
//   }

//   function dropPiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     if (activePiece && chessboard) {
//       const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const y = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       const currentPiece = pieces.find((p) => p.samePosition(grabPosition));

//       if (currentPiece) {
//         const success = playMove(currentPiece.clone(), new Position(x, y));
//         if (success) {
//           socket.emit("makeMove", { piece: currentPiece, position: new Position(x, y) });
//         } else {
//           activePiece.style.position = "relative";
//           activePiece.style.removeProperty("top");
//           activePiece.style.removeProperty("left");
//         }
//       }
//       setActivePiece(null);
//     }
//   }

//   // Render the board
//   let board = [];
//   const isWhiteTeam = team === 'w';
//   const isBlackTeam = team === 'b';

//   for (let j = 0; j < VERTICAL_AXIS.length; j++) {
//     const row = isWhiteTeam ? VERTICAL_AXIS.length - 1 - j : j;
//     for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
//       const number = row + i + 2;
//       const piece = pieces.find((p) => p.samePosition(new Position(i, row)));
//       let image = piece ? piece.image : undefined;

//       let currentPiece = activePiece != null ? pieces.find((p) => p.samePosition(grabPosition)) : undefined;
//       let highlight = currentPiece?.possibleMoves ?
//         currentPiece.possibleMoves.some((p) => p.samePosition(new Position(i, row))) : false;

//       board.push(
//         <Tile key={`${row},${i}`} image={image} number={number} highlight={highlight} />
//       );
//     }
//   }

//   return (
//     <>
//       <div className="main">
//         <div className="sidebar" style={{ color: "white" }}>
//           <div className="upper">
//             <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//             <h2>Chess Game</h2>
//           </div>
//           <div className="cb"></div>
//           <div className="lower">
//             <h3>Players:</h3>
//             <ul>
//               {usernames.map((username, index) => (
//                 <li key={index}>{username}</li>
//               ))}
//             </ul>
//           </div>
//         </div>
//         <div
//           onMouseMove={(e) => movePiece(e)}
//           onMouseDown={(e) => grabPiece(e)}
//           onMouseUp={(e) => dropPiece(e)}
//           id="chessboard"
//           ref={chessboardRef}
//         >
//           {board}
//         </div>
//       </div>
//     </>
//   );
// }

// ALL FINE HERE 2

// import { useRef, useState, useEffect } from "react";
// import io, { Socket } from "socket.io-client";
// import "./Chessboard.css";
// import Tile from "../Tile/Tile";
// import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
// import { Piece, Position } from "../../models";

// const socket: Socket = io("http://localhost:4000");

// interface Props {
//   playMove: (piece: Piece, position: Position) => boolean;
//   pieces: Piece[];
//   team: string;
//   usernameInput: string;
//   roomId: string;
// }

// export default function Chessboard({ playMove, pieces, team, usernameInput, roomId }: Props) {
//   const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
//   const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
//   const [usernames, setUsernames] = useState<string[]>([]);
//   const chessboardRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     socket.on("opponentMove", (moveData: { piece: Piece; position: Position }) => {
//       const { piece, position } = moveData;
//       playMove(piece, position);
//     });

//     socket.on('userJoined', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     socket.on('userLeft', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     return () => {
//       socket.off("opponentMove");
//       socket.off('userJoined');
//       socket.off('userLeft');
//     };
//   }, [playMove]);

//   function getPieceAtTile(e: React.MouseEvent): Piece | undefined {
//     const chessboard = chessboardRef.current;
//     if (!chessboard) return undefined;

//     const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//     const y = isWhiteTeam ? 
//       HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//       Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//     return pieces.find((piece) => piece.position.samePosition(new Position(x, y)));
//   }

//   function grabPiece(e: React.MouseEvent) {
//     const element = e.target as HTMLElement;
//     const chessboard = chessboardRef.current;
//     e.preventDefault();
//     const currentPiece = getPieceAtTile(e);
//     if (element.classList.contains("chess-piece") && chessboard && currentPiece?.team === team) {
//       const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const grabY = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       setGrabPosition(new Position(grabX, grabY));

//       const x = e.clientX - GRID_SIZE / 2;
//       const y = e.clientY - GRID_SIZE / 2;
//       element.style.position = "absolute";
//       element.style.left = `${x}px`;
//       element.style.top = `${y}px`;

//       setActivePiece(element);
//     }
//   }

//   function movePiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
//     if (activePiece && chessboard && currentPiece?.team === team) {
//       const minX = chessboard.offsetLeft - 25;
//       const minY = chessboard.offsetTop - 25;
//       const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
//       const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
//       const x = e.clientX - 50;
//       const y = e.clientY - 50;
//       activePiece.style.position = "absolute";
//       activePiece.style.left = `${Math.min(maxX, Math.max(minX, x))}px`;
//       activePiece.style.top = `${Math.min(maxY, Math.max(minY, y))}px`;
//     }
//   }

//   function dropPiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     if (activePiece && chessboard) {
//       const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const y = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       const currentPiece = pieces.find((p) => p.samePosition(grabPosition));

//       if (currentPiece) {
//         const success = playMove(currentPiece.clone(), new Position(x, y));
//         if (success) {
//           socket.emit("makeMove", { piece: currentPiece, position: new Position(x, y) });
//         } else {
//           activePiece.style.position = "relative";
//           activePiece.style.removeProperty("top");
//           activePiece.style.removeProperty("left");
//         }
//       }
//       setActivePiece(null);
//     }
//   }

//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('');
//   };

//   // Function to generate the avatar URL
//   const generateAvatar = (name: string) => {
//     if (name.trim() === '') return;

//     const initials = getInitials(name);
//     console.log(initials);

//     const url = `https://api.dicebear.com/6.x/initials/svg?seed=${initials}&radius=50&size=96`;
//     return url;
//   };

//   // Render the board
//   let board = [];
//   const isWhiteTeam = team === 'w';
//   const isBlackTeam = team === 'b';

//   for (let j = 0; j < VERTICAL_AXIS.length; j++) {
//     const row = isWhiteTeam ? VERTICAL_AXIS.length - 1 - j : j;
//     for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
//       const number = row + i + 2;
//       const piece = pieces.find((p) => p.samePosition(new Position(i, row)));
//       let image = piece ? piece.image : undefined;

//       let currentPiece = activePiece != null ? pieces.find((p) => p.samePosition(grabPosition)) : undefined;
//       let highlight = currentPiece?.possibleMoves ?
//         currentPiece.possibleMoves.some((p) => p.samePosition(new Position(i, row))) : false;

//       board.push(
//         <Tile key={`${row},${i}`} image={image} number={number} highlight={highlight} />
//       );
//     }
//   }

//   return (
//     <>
//       <div className="main">
//         <div className="sidebar" style={{ color: "white" }}>
//           <div className="upper">
//             <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//             <h2>Chess Game</h2>
//           </div>
//           <div className="cb"></div>
//           <div className="lower">
//             <h3>Players:</h3>
//             <ul>
//               {usernames.map((username, index) => (
//                 <li key={index}>{username}</li>
//               ))}
//             </ul>
//           </div>
//           <p>Room ID: {roomId}</p>

//         </div>
//         <div
//           onMouseMove={(e) => movePiece(e)}
//           onMouseDown={(e) => grabPiece(e)}
//           onMouseUp={(e) => dropPiece(e)}
//           id="chessboard"
//           ref={chessboardRef}
//         >
//           {board}
//         </div>
//       </div>
//     </>
//   );
// }


// import { useRef, useState, useEffect } from "react";
// import io, { Socket } from "socket.io-client";
// import "./Chessboard.css";
// import Tile from "../Tile/Tile";
// import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
// import { Piece, Position } from "../../models";

// const socket: Socket = io("http://localhost:4000");

// interface Props {
//   playMove: (piece: Piece, position: Position) => boolean;
//   pieces: Piece[];
//   team: string;
//   usernameInput: string;
//   roomId: string;
// }

// export default function Chessboard({ playMove, pieces, team, usernameInput, roomId }: Props) {
//   const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
//   const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
//   const [usernames, setUsernames] = useState<string[]>([]);
//   const chessboardRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     socket.on("opponentMove", (moveData: { piece: Piece; position: Position }) => {
//       const { piece, position } = moveData;
//       playMove(piece, position);
//     });

//     socket.on('userJoined', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     socket.on('userLeft', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     return () => {
//       socket.off("opponentMove");
//       socket.off('userJoined');
//       socket.off('userLeft');
//     };
//   }, [playMove]);

//   function getPieceAtTile(e: React.MouseEvent): Piece | undefined {
//     const chessboard = chessboardRef.current;
//     if (!chessboard) return undefined;

//     const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//     const y = isWhiteTeam ? 
//       HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//       Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//     return pieces.find((piece) => piece.position.samePosition(new Position(x, y)));
//   }

//   function grabPiece(e: React.MouseEvent) {
//     const element = e.target as HTMLElement;
//     const chessboard = chessboardRef.current;
//     e.preventDefault();
//     const currentPiece = getPieceAtTile(e);
//     if (element.classList.contains("chess-piece") && chessboard && currentPiece?.team === team) {
//       const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const grabY = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       setGrabPosition(new Position(grabX, grabY));

//       const x = e.clientX - GRID_SIZE / 2;
//       const y = e.clientY - GRID_SIZE / 2;
//       element.style.position = "absolute";
//       element.style.left = `${x}px`;
//       element.style.top = `${y}px`;

//       setActivePiece(element);
//     }
//   }

//   function movePiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
//     if (activePiece && chessboard && currentPiece?.team === team) {
//       const minX = chessboard.offsetLeft - 25;
//       const minY = chessboard.offsetTop - 25;
//       const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
//       const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
//       const x = e.clientX - 50;
//       const y = e.clientY - 50;
//       activePiece.style.position = "absolute";
//       activePiece.style.left = `${Math.min(maxX, Math.max(minX, x))}px`;
//       activePiece.style.top = `${Math.min(maxY, Math.max(minY, y))}px`;
//     }
//   }

//   function dropPiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     if (activePiece && chessboard) {
//       const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const y = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       const currentPiece = pieces.find((p) => p.samePosition(grabPosition));

//       if (currentPiece) {
//         const success = playMove(currentPiece.clone(), new Position(x, y));
//         if (success) {
//           socket.emit("makeMove", { piece: currentPiece, position: new Position(x, y) });
//         } else {
//           activePiece.style.position = "relative";
//           activePiece.style.removeProperty("top");
//           activePiece.style.removeProperty("left");
//         }
//       }
//       setActivePiece(null);
//     }
//   }

//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(word => word[0])
//       .join('');
//   };

//   // Function to generate the avatar URL
//   const generateAvatar = (name: string) => {
//     if (name.trim() === '') return;

//     const initials = getInitials(name);
//     console.log(initials);

//     const url = `https://api.dicebear.com/6.x/initials/svg?seed=${initials}&radius=50&size=96`;
//     return url;
//   };

//   // Render the board
//   let board = [];
//   const isWhiteTeam = team === 'w';
//   const isBlackTeam = team === 'b';

//   for (let j = 0; j < VERTICAL_AXIS.length; j++) {
//     const row = isWhiteTeam ? VERTICAL_AXIS.length - 1 - j : j;
//     for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
//       const number = row + i + 2;
//       const piece = pieces.find((p) => p.samePosition(new Position(i, row)));
//       let image = piece ? piece.image : undefined;

//       let currentPiece = activePiece != null ? pieces.find((p) => p.samePosition(grabPosition)) : undefined;
//       let highlight = currentPiece?.possibleMoves ?
//         currentPiece.possibleMoves.some((p) => p.samePosition(new Position(i, row))) : false;

//       board.push(
//         <Tile key={`${row},${i}`} image={image} number={number} highlight={highlight} />
//       );
//     }
//   }

//   return (
//     <>
//       <div className="main">
//         <div className="sidebar" style={{ color: "white" }}>
//           <div className="upper">
//             <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//             <h2>Chess Game</h2>
//           </div>
//           <div className="cb"></div>
//           <div className="lower">
//             <h3>Players:</h3>
//             <ul>
//               {usernames.map((username, index) => (
//                 <li key={index}>{username}</li>
//               ))}
//             </ul>
//           </div>
//           <p>Room ID: {roomId}</p>

//         </div>
//         <div
//           onMouseMove={(e) => movePiece(e)}
//           onMouseDown={(e) => grabPiece(e)}
//           onMouseUp={(e) => dropPiece(e)}
//           id="chessboard"
//           ref={chessboardRef}
//         >
//           {board}
//         </div>
//       </div>
//     </>
//   );
// }

// import { useRef, useState, useEffect } from "react";
// import io, { Socket } from "socket.io-client";
// import "./Chessboard.css";
// import Tile from "../Tile/Tile";
// import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
// import { Piece, Position } from "../../models";

// const socket: Socket = io("http://localhost:4000");

// interface Props {
//   playMove: (piece: Piece, position: Position) => boolean;
//   pieces: Piece[];
//   team: string;
//   pl1: string;
//   setPl1: (username: string) => void;
//   pl2: string;
//   setPl2: (username: string) => void;
//   roomId: string;
// }

// export default function Chessboard({ playMove, pieces, team, pl1, setPl1, pl2, setPl2, roomId }: Props) {
//   const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
//   const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
//   const [usernames, setUsernames] = useState<string[]>([]);
//   const chessboardRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     socket.on("opponentMove", (moveData: { piece: Piece; position: Position }) => {
//       const { piece, position } = moveData;
//       playMove(piece, position);
//     });

//     socket.on('userJoined', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     socket.on('userLeft', ({ username, users }) => {
//       setUsernames(users.map((user: any) => user.username));
//     });

//     return () => {
//       socket.off("opponentMove");
//       socket.off('userJoined');
//       socket.off('userLeft');
//     };
//   }, [playMove]);

//   function getPieceAtTile(e: React.MouseEvent): Piece | undefined {
//     const chessboard = chessboardRef.current;
//     if (!chessboard) return undefined;

//     const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//     const y = isWhiteTeam ? 
//       HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//       Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//     return pieces.find((piece) => piece.position.samePosition(new Position(x, y)));
//   }

//   function grabPiece(e: React.MouseEvent) {
//     const element = e.target as HTMLElement;
//     const chessboard = chessboardRef.current;
//     e.preventDefault();
//     const currentPiece = getPieceAtTile(e);
//     if (element.classList.contains("chess-piece") && chessboard && currentPiece?.team === team) {
//       const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const grabY = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       setGrabPosition(new Position(grabX, grabY));

//       const x = e.clientX - GRID_SIZE / 2;
//       const y = e.clientY - GRID_SIZE / 2;
//       element.style.position = "absolute";
//       element.style.left = `${x}px`;
//       element.style.top = `${y}px`;

//       setActivePiece(element);
//     }
//   }

//   function movePiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
//     if (activePiece && chessboard && currentPiece?.team === team) {
//       const minX = chessboard.offsetLeft - 25;
//       const minY = chessboard.offsetTop - 25;
//       const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
//       const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
//       const x = e.clientX - 50;
//       const y = e.clientY - 50;
//       activePiece.style.position = "absolute";
//       activePiece.style.left = `${Math.min(maxX, Math.max(minX, x))}px`;
//       activePiece.style.top = `${Math.min(maxY, Math.max(minY, y))}px`;
//     }
//   }

//   function dropPiece(e: React.MouseEvent) {
//     const chessboard = chessboardRef.current;
//     if (activePiece && chessboard) {
//       const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
//       const y = isWhiteTeam ? 
//         HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
//         Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

//       const currentPiece = pieces.find((p) => p.samePosition(grabPosition));

//       if (currentPiece) {
//         const success = playMove(currentPiece.clone(), new Position(x, y));
//         if (success) {
//           socket.emit("makeMove", { piece: currentPiece, position: new Position(x, y) });
//         } else {
//           activePiece.style.position = "relative";
//           activePiece.style.removeProperty("top");
//           activePiece.style.removeProperty("left");
//         }
//       }
//       setActivePiece(null);
//     }
//   }

//   // Render the board
//   let board = [];
//   const isWhiteTeam = team === 'w';
//   const isBlackTeam = team === 'b';

//   for (let j = 0; j < VERTICAL_AXIS.length; j++) {
//     const row = isWhiteTeam ? VERTICAL_AXIS.length - 1 - j : j;
//     for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
//       const number = row + i + 2;
//       const piece = pieces.find((p) => p.samePosition(new Position(i, row)));
//       let image = piece ? piece.image : undefined;

//       let currentPiece = activePiece != null ? pieces.find((p) => p.samePosition(grabPosition)) : undefined;
//       let highlight = currentPiece?.possibleMoves ?
//         currentPiece.possibleMoves.some((p) => p.samePosition(new Position(i, row))) : false;

//       board.push(
//         <Tile key={`${row},${i}`} image={image} number={number} highlight={highlight} />
//       );
//     }
//   }

//   return (
//     <>
//       <div className="main">
//         <div className="sidebar" style={{ color: "white" }}>
//           <div className="upper">
//             <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
//             <h2>Chess Game</h2>
//           </div>
//           <div className="cb"></div>
//           <div className="lower">
//             <h3>Players:</h3>
//             {pl1}
//             {pl2}
//             <p>ROOM ID: {roomId}</p>
//           </div>
//         </div>
//         <div
//           onMouseMove={(e) => movePiece(e)}
//           onMouseDown={(e) => grabPiece(e)}
//           onMouseUp={(e) => dropPiece(e)}
//           id="chessboard"
//           ref={chessboardRef}
//         >
//           {board}
//         </div>
//       </div>
//     </>
//   );
// }

import { useRef, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";
import "./Chessboard.css";
import Tile from "../Tile/Tile";
import { VERTICAL_AXIS, HORIZONTAL_AXIS, GRID_SIZE } from "../../Constants";
import { Piece, Position } from "../../models";
import { useRoomContext } from "../Room/RoomContext";
import { toast } from "react-hot-toast";

const socket: Socket = io("http://localhost:4000");

interface Props {
  playMove: (piece: Piece, position: Position) => boolean;
  pieces: Piece[];
  team: string;
  roomId: string;
}

export default function Chessboard({ playMove, pieces, team, roomId }: Props) {
  const { pl1, pl2 } = useRoomContext(); // Get usernames from context
  const [activePiece, setActivePiece] = useState<HTMLElement | null>(null);
  const [grabPosition, setGrabPosition] = useState<Position>(new Position(-1, -1));
  const [usernames, setUsernames] = useState<string[]>([]);
  const chessboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("opponentMove", (moveData: { piece: Piece; position: Position }) => {
      const { piece, position } = moveData;
      playMove(piece, position);
    });

    socket.on('userJoined', ({ username, users }) => {
      setUsernames(users.map((user: any) => user.username));
    });

    socket.on('userLeft', ({ username, users }) => {
      setUsernames(users.map((user: any) => user.username));
    });

    return () => {
      socket.off("opponentMove");
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [playMove]);

  function getPieceAtTile(e: React.MouseEvent): Piece | undefined {
    const chessboard = chessboardRef.current;
    if (!chessboard) return undefined;

    const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
    const y = isWhiteTeam ? 
      HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
      Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

    return pieces.find((piece) => piece.position.samePosition(new Position(x, y)));
  }

  function grabPiece(e: React.MouseEvent) {
    const element = e.target as HTMLElement;
    const chessboard = chessboardRef.current;
    e.preventDefault();
    const currentPiece = getPieceAtTile(e);
    if (element.classList.contains("chess-piece") && chessboard && currentPiece?.team === team) {
      const grabX = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const grabY = isWhiteTeam ? 
        HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
        Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

      setGrabPosition(new Position(grabX, grabY));

      const x = e.clientX - GRID_SIZE / 2;
      const y = e.clientY - GRID_SIZE / 2;
      element.style.position = "absolute";
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;

      setActivePiece(element);
    }
  }

  function movePiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    const currentPiece = pieces.find((p) => p.samePosition(grabPosition));
    if (activePiece && chessboard && currentPiece?.team === team) {
      const minX = chessboard.offsetLeft - 25;
      const minY = chessboard.offsetTop - 25;
      const maxX = chessboard.offsetLeft + chessboard.clientWidth - 75;
      const maxY = chessboard.offsetTop + chessboard.clientHeight - 75;
      const x = e.clientX - 50;
      const y = e.clientY - 50;
      activePiece.style.position = "absolute";
      activePiece.style.left = `${Math.min(maxX, Math.max(minX, x))}px`;
      activePiece.style.top = `${Math.min(maxY, Math.max(minY, y))}px`;
    }
  }

  function dropPiece(e: React.MouseEvent) {
    const chessboard = chessboardRef.current;
    if (activePiece && chessboard) {
      const x = Math.floor((e.clientX - chessboard.offsetLeft) / GRID_SIZE);
      const y = isWhiteTeam ? 
        HORIZONTAL_AXIS.length - 1 - Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE) :
        Math.floor((e.clientY - chessboard.offsetTop) / GRID_SIZE);

      const currentPiece = pieces.find((p) => p.samePosition(grabPosition));

      if (currentPiece) {
        const success = playMove(currentPiece.clone(), new Position(x, y));
        if (success) {
          socket.emit("makeMove", { piece: currentPiece, position: new Position(x, y) });
        } else {
          activePiece.style.position = "relative";
          activePiece.style.removeProperty("top");
          activePiece.style.removeProperty("left");
        }
      }
      setActivePiece(null);
    }
  }

  async function copyRoomId() {
      try {
          await navigator.clipboard.writeText(roomId);
          toast.success('Room ID copied!');
      } catch (err) {
          toast.error('Could not copy Room ID');
          console.error(err);
      }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('');
  };

  // Function to generate the avatar URL
  const generateAvatar = (name: string) => {
    if (name.trim() === '') return;

    const initials = getInitials(name);
    console.log(initials);

    const url = `https://api.dicebear.com/6.x/initials/svg?seed=${initials}&radius=15`;
    return url;
  };

  // Render the board
  let board = [];
  const isWhiteTeam = team === 'w';
  const isBlackTeam = team === 'b';

  for (let j = 0; j < VERTICAL_AXIS.length; j++) {
    const row = isWhiteTeam ? VERTICAL_AXIS.length - 1 - j : j;
    for (let i = 0; i < HORIZONTAL_AXIS.length; i++) {
      const number = row + i + 2;
      const piece = pieces.find((p) => p.samePosition(new Position(i, row)));
      let image = piece ? piece.image : undefined;

      let currentPiece = activePiece != null ? pieces.find((p) => p.samePosition(grabPosition)) : undefined;
      let highlight = currentPiece?.possibleMoves ?
        currentPiece.possibleMoves.some((p) => p.samePosition(new Position(i, row))) : false;

      board.push(
        <Tile key={`${row},${i}`} image={image} number={number} highlight={highlight} />
      );
    }
  }

  return (
    <>
      <div className="main">
        <div className="sidebar" style={{ color: "white" }}>
          <div className="upper">
            <img src="https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09k.png" alt="logo" />
            <h1>ChessMate</h1>
          </div>
          <div className="cb"></div>
          <div className="lower">
            <h3>Players:</h3>
            <div className="user">
              <img src={generateAvatar(pl1)} alt="avatar-logo" />
              {pl1}
            </div>
            {pl2}
            {/* <p>ROOM ID: {roomId}</p> */}
            <button onClick={copyRoomId} className="roomBtn">COPY ROOM ID</button>
          </div>
        </div>
        <div
          onMouseMove={(e) => movePiece(e)}
          onMouseDown={(e) => grabPiece(e)}
          onMouseUp={(e) => dropPiece(e)}
          id="chessboard"
          ref={chessboardRef}
        >
          {board}
        </div>
      </div>
    </>
  );
}
