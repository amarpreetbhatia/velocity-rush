import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import useGameScene from '../../hooks/useGameScene';
import useInputManager from '../../hooks/useInputManager';
import Speedometer from '../ui/HUD/Speedometer';
import TouchControls from '../ui/controls/TouchControls';
import ControlsHelp from '../ui/controls/ControlsHelp';
import GameHUD from '../ui/HUD/GameHUD';

/**
 * Game container component that integrates the 3D game scene with React
 */
const GameContainer = ({ 
  vehicleType = 'sports',
  trackId = 'circuit',
  environmentType = 'daytime',
  totalLaps = 3,
  onGameStateChange,
  onRaceFinished
}) => {
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    vehicleState: {
      speedKmh: 0,
      rpm: 0,
      gear: 1
    },
    togglePause: () => {}
  });
  
  // Set up input manager
  const { input, handleTouchControlsChange } = useInputManager();
  
  // Initialize game scene with input state
  const { 
    start, 
    stop, 
    togglePause, 
    toggleCameraMode, 
    getGameState, 
    raceState,
    startRaceCountdown
  } = useGameScene({
    container: containerRef.current,
    vehicleType,
    trackId,
    environmentType,
    totalLaps
  }, input);
  
  // Handle touch controls change
  const handleTouchInput = useCallback((controls) => {
    handleTouchControlsChange(controls);
  }, [handleTouchControlsChange]);
  
  // Update game state periodically
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateInterval = setInterval(() => {
      const currentState = getGameState();
      if (currentState) {
        setGameState(currentState);
        
        // Call the callback if provided
        if (onGameStateChange) {
          onGameStateChange(currentState);
        }
      }
    }, 100); // Update 10 times per second
    
    return () => {
      clearInterval(updateInterval);
    };
  }, [getGameState, onGameStateChange]);
  
  // Handle race finished
  useEffect(() => {
    if (raceState.isRaceFinished && onRaceFinished) {
      onRaceFinished(raceState);
    }
  }, [raceState.isRaceFinished, onRaceFinished, raceState]);
  
  // Start race countdown when component mounts
  useEffect(() => {
    // Short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      startRaceCountdown();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [startRaceCountdown]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        togglePause();
      } else if (e.key.toLowerCase() === 'c') {
        toggleCameraMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePause, toggleCameraMode]);
  
  // Handle countdown complete
  const handleCountdownComplete = useCallback(() => {
    // This is handled by the game scene
  }, []);
  
  // Handle race restart
  const handleRaceRestart = useCallback(() => {
    startRaceCountdown();
  }, [startRaceCountdown]);
  
  // Handle race exit
  const handleRaceExit = useCallback(() => {
    if (onRaceFinished) {
      onRaceFinished(raceState, true); // true indicates exit
    }
  }, [onRaceFinished, raceState]);
  
  return (
    <div className="game-container relative w-full h-screen">
      {/* 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      
      {/* Touch Controls */}
      <TouchControls onControlsChange={handleTouchInput} />
      
      {/* Game HUD */}
      <GameHUD 
        gameState={gameState}
        raceState={raceState}
        onCountdownComplete={handleCountdownComplete}
        onRestart={handleRaceRestart}
        onExit={handleRaceExit}
      />
    </div>
  );
};

GameContainer.propTypes = {
  vehicleType: PropTypes.string,
  trackId: PropTypes.string,
  environmentType: PropTypes.string,
  totalLaps: PropTypes.number,
  onGameStateChange: PropTypes.func,
  onRaceFinished: PropTypes.func
};

export default GameContainer;
