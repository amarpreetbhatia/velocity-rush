import React from 'react';
import PropTypes from 'prop-types';

/**
 * RaceResults component - Displays race results at the end of a race
 */
const RaceResults = ({ 
  isVisible = false,
  totalTime = 0,
  lapTimes = [],
  bestLapTime = null,
  position = 1,
  totalRacers = 8,
  onRestart = null,
  onExit = null
}) => {
  // Format time as mm:ss.ms
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds === null) return '--:--.--';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="card bg-base-100 shadow-xl max-w-md w-full">
        <div className="card-body">
          <h2 className="card-title text-2xl justify-center mb-4">Race Complete!</h2>
          
          <div className="stats shadow mb-4">
            <div className="stat">
              <div className="stat-title">Position</div>
              <div className="stat-value text-primary">{position}/{totalRacers}</div>
            </div>
            
            <div className="stat">
              <div className="stat-title">Total Time</div>
              <div className="stat-value text-secondary font-mono">{formatTime(totalTime)}</div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Lap</th>
                  <th>Time</th>
                  <th>Diff</th>
                </tr>
              </thead>
              <tbody>
                {lapTimes.map((time, index) => {
                  const isBest = bestLapTime === time;
                  const diff = index > 0 ? time - lapTimes[index - 1] : null;
                  
                  return (
                    <tr key={index} className={isBest ? 'bg-success bg-opacity-20' : ''}>
                      <td>{index + 1}</td>
                      <td className="font-mono">{formatTime(time)}</td>
                      <td className="font-mono">
                        {diff !== null && (
                          <span className={diff < 0 ? 'text-success' : 'text-error'}>
                            {diff < 0 ? '-' : '+'}
                            {formatTime(Math.abs(diff))}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="card-actions justify-center mt-4">
            <button 
              className="btn btn-primary"
              onClick={onRestart}
            >
              Race Again
            </button>
            <button 
              className="btn btn-outline"
              onClick={onExit}
            >
              Exit to Menu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

RaceResults.propTypes = {
  isVisible: PropTypes.bool,
  totalTime: PropTypes.number,
  lapTimes: PropTypes.arrayOf(PropTypes.number),
  bestLapTime: PropTypes.number,
  position: PropTypes.number,
  totalRacers: PropTypes.number,
  onRestart: PropTypes.func,
  onExit: PropTypes.func
};

export default RaceResults;
