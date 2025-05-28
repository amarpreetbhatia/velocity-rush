import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * LapNotification component - Displays lap completion notifications
 */
const LapNotification = ({ 
  lap, 
  lapTime, 
  bestLap = false, 
  isVisible = false,
  onDismiss = null
}) => {
  const [visible, setVisible] = useState(isVisible);
  
  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);
  
  // Format time as mm:ss.ms
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds === null) return '--:--.--';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  if (!visible) return null;
  
  return (
    <div className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`card ${bestLap ? 'bg-success' : 'bg-primary'} text-primary-content shadow-xl`}>
        <div className="card-body p-4 text-center">
          <h2 className="card-title justify-center text-2xl">
            {bestLap ? 'NEW BEST LAP!' : `LAP ${lap} COMPLETE!`}
          </h2>
          <div className="text-3xl font-mono font-bold">
            {formatTime(lapTime)}
          </div>
          {bestLap && (
            <div className="badge badge-outline mt-2">Personal Best</div>
          )}
        </div>
      </div>
    </div>
  );
};

LapNotification.propTypes = {
  lap: PropTypes.number.isRequired,
  lapTime: PropTypes.number.isRequired,
  bestLap: PropTypes.bool,
  isVisible: PropTypes.bool,
  onDismiss: PropTypes.func
};

export default LapNotification;
