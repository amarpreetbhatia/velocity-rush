import { useEffect, useRef, useCallback, useState } from 'react';
import GameScene from '../scenes/GameScene';

/**
 * Custom hook to integrate the GameScene with React components
 * @param {Object} options - Configuration options for the GameScene
 * @param {HTMLElement} options.container - DOM element to render the scene in
 * @param {string} options.vehicleType - Type of vehicle to use
 * @param {string} options.trackId - ID of the track to load
 * @param {string} options.environmentType - Type of environment to use
 * @param {number} options.totalLaps - Number of laps for the race
 * @param {Object} inputState - Current input state from useInputManager
 * @returns {Object} Game scene reference and control methods
 */
const useGameScene = (options = {}, inputState = null) => {
  const gameSceneRef = useRef(null);
  const [raceState, setRaceState] = useState({
    isRaceStarted: false,
    isRaceFinished: false,
    countdown: 3,
    currentLap: 1,
    totalLaps: options.totalLaps || 3,
    currentLapTime: 0,
    lastLapTime: 0,
    bestLapTime: null,
    lapTimes: [],
    raceTime: 0,
    position: 1,
    totalRacers: 8,
    currentCheckpoint: 0,
    totalCheckpoints: 0,
    checkpointPassed: false,
    lapCompleted: false
  });
  
  // Initialize game scene
  useEffect(() => {
    // Create game scene
    gameSceneRef.current = new GameScene({
      container: options.container,
      vehicleType: options.vehicleType || 'sports',
      trackId: options.trackId || 'circuit',
      environmentType: options.environmentType || 'daytime',
      totalLaps: options.totalLaps || 3
    });
    
    // Set race state change callback
    gameSceneRef.current.setRaceStateChangedCallback((newRaceState) => {
      setRaceState(newRaceState);
    });
    
    // Start game loop
    gameSceneRef.current.start();
    
    // Clean up on unmount
    return () => {
      if (gameSceneRef.current) {
        gameSceneRef.current.dispose();
        gameSceneRef.current = null;
      }
    };
  }, [options.container, options.vehicleType, options.trackId, options.environmentType, options.totalLaps]);
  
  // Update input state when it changes
  useEffect(() => {
    if (gameSceneRef.current && inputState) {
      gameSceneRef.current.updateInput(inputState);
    }
  }, [inputState]);
  
  // Start race countdown
  const startRaceCountdown = useCallback(() => {
    if (gameSceneRef.current) {
      gameSceneRef.current.startRaceCountdown();
    }
  }, []);
  
  // Toggle camera mode (for development)
  const toggleCameraMode = useCallback(() => {
    if (gameSceneRef.current && gameSceneRef.current.controls) {
      gameSceneRef.current.controls.enabled = !gameSceneRef.current.controls.enabled;
    }
  }, []);
  
  // Return game scene reference and control methods
  return {
    gameScene: gameSceneRef.current,
    raceState,
    
    // Start the game
    start: () => {
      if (gameSceneRef.current) {
        gameSceneRef.current.start();
      }
    },
    
    // Stop the game
    stop: () => {
      if (gameSceneRef.current) {
        gameSceneRef.current.stop();
      }
    },
    
    // Toggle pause
    togglePause: () => {
      if (gameSceneRef.current) {
        gameSceneRef.current.togglePause();
      }
    },
    
    // Start race countdown
    startRaceCountdown,
    
    // Toggle camera mode
    toggleCameraMode,
    
    // Get current game state
    getGameState: () => {
      if (!gameSceneRef.current) return null;
      
      return {
        isRunning: gameSceneRef.current.isRunning,
        isPaused: gameSceneRef.current.isPaused,
        vehicleState: gameSceneRef.current.vehiclePhysics ? 
          gameSceneRef.current.vehiclePhysics.getPerformanceMetrics() : null,
        togglePause: () => {
          if (gameSceneRef.current) {
            gameSceneRef.current.togglePause();
          }
        }
      };
    }
  };
};

export default useGameScene;
