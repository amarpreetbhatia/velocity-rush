import React from 'react';
import PropTypes from 'prop-types';

/**
 * RaceInfo component - Displays race information like lap count, time, and position
 */
const RaceInfo = ({ 
  currentLap = 1, 
  totalLaps = 3, 
  currentLapTime = 0, 
  bestLapTime = null, 
  totalRaceTime = 0,
  position = 1,
  totalRacers = 8,
  compact = false
}) => {
  // Format time as mm:ss.ms
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds === null) return '--:--.--';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  // Compact mobile view
  if (compact) {
    return (
      <div className="race-info bg-base-300 bg-opacity-70 p-2 rounded-lg text-base-content shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">
            Lap {currentLap}/{totalLaps}
          </div>
          <div className="badge badge-primary">{position}/{totalRacers}</div>
        </div>
        <div className="text-sm mt-1">
          <div className="flex justify-between">
            <span>Time:</span>
            <span className="font-mono">{formatTime(totalRaceTime)}</span>
          </div>
          <div className="flex justify-between">
            <span>Best:</span>
            <span className="font-mono">{formatTime(bestLapTime)}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Full desktop view
  return (
    <div className="race-info bg-base-300 bg-opacity-70 p-4 rounded-lg text-base-content shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="text-2xl font-bold">
          Lap {currentLap}/{totalLaps}
        </div>
        <div className="badge badge-lg badge-primary">Position: {position}/{totalRacers}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>Race Time:</div>
        <div className="font-mono font-bold">{formatTime(totalRaceTime)}</div>
        
        <div>Current Lap:</div>
        <div className="font-mono">{formatTime(currentLapTime)}</div>
        
        <div>Best Lap:</div>
        <div className="font-mono text-accent font-bold">{formatTime(bestLapTime)}</div>
      </div>
    </div>
  );
};

RaceInfo.propTypes = {
  currentLap: PropTypes.number,
  totalLaps: PropTypes.number,
  currentLapTime: PropTypes.number,
  bestLapTime: PropTypes.number,
  totalRaceTime: PropTypes.number,
  position: PropTypes.number,
  totalRacers: PropTypes.number,
  compact: PropTypes.bool
};

export default RaceInfo;
