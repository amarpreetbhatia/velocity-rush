import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GameContainer from '../components/game/GameContainer';
import { updateRaceStats, pauseGame, resumeGame, endRace } from '../state/gameSlice';
import { addXp, addCurrency, recordRaceCompleted } from '../state/userSlice';

/**
 * PlayScene component - Main gameplay scene that integrates the game container
 */
const PlayScene = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get game state from Redux
  const { selectedVehicle, selectedTrack, isPaused } = useSelector(state => state.game);
  
  // Local state for environment
  const [environmentType, setEnvironmentType] = useState('daytime');
  
  // Handle game state changes
  const handleGameStateChange = useCallback((gameState) => {
    // Handle pause state
    if (gameState.isPaused !== isPaused) {
      if (gameState.isPaused) {
        dispatch(pauseGame());
      } else {
        dispatch(resumeGame());
      }
    }
  }, [dispatch, isPaused]);
  
  // Handle race finished
  const handleRaceFinished = useCallback((raceState, isExit = false) => {
    // If user exited the race
    if (isExit) {
      dispatch(endRace());
      navigate('/');
      return;
    }
    
    // Update race stats in Redux
    dispatch(updateRaceStats({
      raceTime: raceState.raceTime,
      bestLapTime: raceState.bestLapTime,
      lapTimes: raceState.lapTimes
    }));
    
    // Record race completion in user stats
    dispatch(recordRaceCompleted({
      trackId: selectedTrack,
      position: raceState.position,
      lapTime: raceState.bestLapTime,
      raceTime: raceState.raceTime
    }));
    
    // Award XP and currency based on performance
    const positionMultiplier = Math.max(1, 9 - raceState.position); // 1st = 8x, 8th = 1x
    const xpAwarded = 100 * positionMultiplier;
    const currencyAwarded = 200 * positionMultiplier;
    
    dispatch(addXp(xpAwarded));
    dispatch(addCurrency(currencyAwarded));
    
    // End race in Redux
    dispatch(endRace());
    
    // Navigate back to menu after a delay
    setTimeout(() => {
      navigate('/');
    }, 5000);
  }, [dispatch, navigate, selectedTrack]);
  
  // Choose environment type based on track
  useEffect(() => {
    switch (selectedTrack) {
      case 'circuit':
        setEnvironmentType('daytime');
        break;
      case 'mountain':
        setEnvironmentType('cloudy');
        break;
      case 'night':
        setEnvironmentType('night');
        break;
      default:
        setEnvironmentType('daytime');
    }
  }, [selectedTrack]);
  
  return (
    <div className="play-scene w-full h-screen relative">
      {/* Game Container */}
      <GameContainer 
        vehicleType={selectedVehicle}
        trackId={selectedTrack}
        environmentType={environmentType}
        totalLaps={3}
        onGameStateChange={handleGameStateChange}
        onRaceFinished={handleRaceFinished}
      />
    </div>
  );
};

export default PlayScene;
