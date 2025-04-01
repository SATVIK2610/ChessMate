import './App.css';
import Referee from './components/Referee/Referee';
import { Toaster } from 'react-hot-toast';
import { RoomProvider } from './components/Room/RoomContext';

function App() {
  return (
    <RoomProvider>
      <div id="app">
        <Referee/>
        <Toaster position="top-right"/>
      </div>
    </RoomProvider>
  );
}

export default App;