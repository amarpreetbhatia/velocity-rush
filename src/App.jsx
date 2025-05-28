import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import scenes
import MainMenu from './scenes/MainMenu';
import PlayScene from './scenes/PlayScene';
import GarageScene from './scenes/GarageScene';

// Import state management
import { Provider } from 'react-redux';
import store from './state/store';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Provider store={store}>
      <div data-theme={theme} className="min-h-screen bg-base-100">
        <Router basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<MainMenu toggleTheme={toggleTheme} />} />
            <Route path="/play" element={<PlayScene />} />
            <Route path="/garage" element={<GarageScene />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </div>
    </Provider>
  );
}

export default App;
