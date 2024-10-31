# ChessMate
ChessMate is an interactive chess platform developed using React and Socket.io, enabling real-time multiplayer games. Create and join rooms with unique IDs for private matches, experience authentic chess mechanics, and enjoy low-latency gameplay optimized for responsiveness across devices.

## Features
* **Real-time Multiplayer Chess**: Play chess games with friends in real time.
* **Room Creation and Join Functionality**: Create or join private matches using unique room IDs.
* **Comprehensive Chess Mechanics**: Supports castling, en passant, pawn promotion, and more.
* **Responsive UI**: Optimized for a smooth and responsive experience across all devices.
## Technologies Used
* **Frontend**: React, TypeScript, CSS
* **Backend**: Node.js, Express, Socket.io
* **Utilities**: Concurrently for simultaneous server and client start

## Preview
* Home Page
<img width="1435" alt="home" src="https://github.com/user-attachments/assets/62fddc6a-a273-4872-8e44-89820a191de1">

* Castling Move
<img width="1053" alt="castling" src="https://github.com/user-attachments/assets/38cbeb17-e861-4102-924d-0fefc279834f">

* Pawn Promotion
<img width="1440" alt="Screenshot 2024-10-31 at 8 18 46 AM" src="https://github.com/user-attachments/assets/d8ccd103-9440-40a1-bac0-8e114a1f60cd">

### Prerequisites
Node.js and npm (Node Package Manager) installed. Download Node.js

## Installation
Clone the repository:
```
git clone https://github.com/SATVIK2610/chess-multi.git
cd chess-multi
```
### Install dependencies:
```
npm install
```
## Running the Application
To start the app, use the following commands:

Start both client and server:

bash
```
npm run start
```
This will start both the React client and the Node.js server simultaneously.

## Project Structure
public/ - Static files and images.
src/ - Source files for the React frontend.
server.js - Server-side code using Express and Socket.io.
README.md - Project documentation.


## License
Distributed under the MIT License.

## Acknowledgments
Thanks to the developers of Socket.io and React for their fantastic frameworks, making real-time chess possible.
