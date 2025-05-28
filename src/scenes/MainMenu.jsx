import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { startRace, selectVehicle, selectTrack } from '../state/gameSlice';

/**
 * MainMenu component - The game's main menu
 */
const MainMenu = ({ toggleTheme }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Start a quick race with default settings
  const handleQuickRace = () => {
    dispatch(selectVehicle('sports'));
    dispatch(selectTrack('circuit'));
    dispatch(startRace());
    navigate('/play');
  };
  
  // Go to garage to select vehicle
  const handleGarage = () => {
    navigate('/garage');
  };
  
  return (
    <div className="main-menu min-h-screen flex flex-col">
      {/* Background with parallax effect */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/assets/images/menu_bg.jpg)',
            filter: 'brightness(0.5)'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8 z-10 flex-1 flex flex-col">
        <header className="text-center py-12">
          <h1 className="text-7xl font-bold text-primary mb-4">VELOCITY RUSH</h1>
          <p className="text-xl text-white">The ultimate racing experience</p>
        </header>
        
        <main className="flex-1 flex items-center justify-center">
          <div className="card w-96 bg-base-100 bg-opacity-80 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Main Menu</h2>
              
              <div className="flex flex-col gap-4">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleQuickRace}
                >
                  Quick Race
                </button>
                
                <button 
                  className="btn btn-secondary btn-lg"
                  onClick={handleGarage}
                >
                  Garage
                </button>
                
                <button className="btn btn-outline btn-lg">
                  Career Mode
                </button>
                
                <button className="btn btn-outline btn-lg">
                  Multiplayer
                </button>
                
                <button className="btn btn-outline btn-lg">
                  Settings
                </button>
                
                <button 
                  className="btn btn-ghost btn-lg"
                  onClick={toggleTheme}
                >
                  Toggle Theme
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <footer className="text-center py-4 text-white">
          <p>© 2025 Velocity Rush - All rights reserved</p>
        </footer>
      </div>
    </div>
  );
};

MainMenu.propTypes = {
  toggleTheme: PropTypes.func.isRequired
};

export default MainMenu;
