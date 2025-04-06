import './App.css';
import Referee from './components/Referee/Referee';
import { Toaster } from 'react-hot-toast';
import { RoomProvider } from './components/Room/RoomContext';
import { ThemeProvider } from './lib/theme/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <RoomProvider>
        <div id="app">
          <Referee/>
          <Toaster position="top-right"/>
        </div>
      </RoomProvider>
    </ThemeProvider>
  );
}

export default App;