import React from 'react';
import { useTheme } from '../lib/theme/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {/* {theme === 'dark' ? '☀️' : '🌙'} */}
      <img src={theme === 'dark' ? './assets/images/brightness.png' : './assets/images/night-mode.png'} alt="theme" />
    </button>
  );
};

export default ThemeToggle; 