import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Speedometer from './Speedometer';
import RaceInfo from './RaceInfo';
import Notification from './Notification';
import CountdownTimer from './CountdownTimer';
import LapNotification from './LapNotification';
import RaceResults from './RaceResults';

/**
 * GameHUD component - Main HUD container that manages all HUD elements
 */
const GameHUD = ({ 
  gameState = {},
  raceState = {},
  onCountdownComplete = null,
  onRestart = null,
  onExit = null
}) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const [notifications, setNotifications] = useState([]);
  const [lapNotification, setLapNotification] = useState({
    isVisible: false,
    lap: 1,
    lapTime: 0,
    bestLap: false
  });
  
  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check for lap completion
  useEffect(() => {
    if (raceState.lapCompleted) {
      // Show lap notification
      setLapNotification({
        isVisible: true,
        lap: raceState.currentLap - 1, // Already incremented in race state
        lapTime: raceState.lastLapTime,
        bestLap: raceState.lastLapTime === raceState.bestLapTime
      });
      
      // Add notification
      addNotification(
        `Lap ${raceState.currentLap - 1} completed in ${formatTime(raceState.lastLapTime)}`,
        'success'
      );
    }
  }, [raceState.lapCompleted, raceState.currentLap, raceState.lastLapTime, raceState.bestLapTime]);
  
  // Check for checkpoint passed
  useEffect(() => {
    if (raceState.checkpointPassed) {
      // Add notification
      addNotification(
        `Checkpoint ${raceState.currentCheckpoint}/${raceState.totalCheckpoints}`,
        'info'
      );
    }
  }, [raceState.checkpointPassed, raceState.currentCheckpoint, raceState.totalCheckpoints]);
  
  // Format time as mm:ss.ms
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds === null) return '--:--.--';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  // Add a notification
  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };
  
  // Dismiss lap notification
  const dismissLapNotification = () => {
    setLapNotification(prev => ({ ...prev, isVisible: false }));
  };
  
  // Determine if we're on mobile
  const isMobile = windowSize.width < 768;
  
  return (
    <div className="game-hud absolute inset-0 pointer-events-none">
      {/* Countdown timer */}
      {raceState.countdown > 0 && (
        <CountdownTimer 
          initialCount={raceState.countdown} 
          onCountdownComplete={onCountdownComplete}
        />
      )}
      
      {/* Speedometer */}
      <div className={`absolute ${isMobile ? 'bottom-4 right-4' : 'bottom-8 right-8'}`}>
        <Speedometer 
          speed={gameState.vehicleState?.speedKmh || 0} 
          rpm={gameState.vehicleState?.rpm || 0} 
          gear={gameState.vehicleState?.gear || 1}
          compact={isMobile}
        />
      </div>
      
      {/* Race info */}
      <div className={`absolute ${isMobile ? 'top-4 left-4 right-4' : 'top-8 left-8'}`}>
        <RaceInfo 
          currentLap={raceState.currentLap}
          totalLaps={raceState.totalLaps}
          currentLapTime={raceState.currentLapTime}
          bestLapTime={raceState.bestLapTime}
          totalRaceTime={raceState.raceTime}
          position={raceState.position}
          totalRacers={raceState.totalRacers}
          compact={isMobile}
        />
      </div>
      
      {/* Notifications */}
      <div className={`absolute ${isMobile ? 'top-24 left-4 right-4' : 'top-32 left-1/2 transform -translate-x-1/2'}`}>
        {notifications.map(notification => (
          <div key={notification.id} className="mb-2">
            <Notification 
              message={notification.message}
              type={notification.type}
            />
          </div>
        ))}
      </div>
      
      {/* Lap notification */}
      <LapNotification 
        lap={lapNotification.lap}
        lapTime={lapNotification.lapTime}
        bestLap={lapNotification.bestLap}
        isVisible={lapNotification.isVisible}
        onDismiss={dismissLapNotification}
      />
      
      {/* Race results */}
      <RaceResults 
        isVisible={raceState.isRaceFinished}
        totalTime={raceState.raceTime}
        lapTimes={raceState.lapTimes}
        bestLapTime={raceState.bestLapTime}
        position={raceState.position}
        totalRacers={raceState.totalRacers}
        onRestart={onRestart}
        onExit={onExit}
      />
      
      {/* Pause button (visible on touch devices) */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <button 
          className="btn btn-circle btn-ghost bg-base-300 bg-opacity-50"
          onClick={gameState.togglePause}
        >
          ⏸️
        </button>
      </div>
    </div>
  );
};

GameHUD.propTypes = {
  gameState: PropTypes.object,
  raceState: PropTypes.object,
  onCountdownComplete: PropTypes.func,
  onRestart: PropTypes.func,
  onExit: PropTypes.func
};

export default GameHUD;
