import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * CountdownTimer component - Displays a countdown before race start
 */
const CountdownTimer = ({ 
  initialCount = 3, 
  onCountdownComplete = null 
}) => {
  const [count, setCount] = useState(initialCount);
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    // Reset if initial count changes
    setCount(initialCount);
    setIsComplete(false);
  }, [initialCount]);
  
  useEffect(() => {
    // Start countdown
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (count === 0 && !isComplete) {
      // Show "GO!" for 1 second
      const goTimer = setTimeout(() => {
        setIsComplete(true);
        if (onCountdownComplete) {
          onCountdownComplete();
        }
      }, 1000);
      
      return () => clearTimeout(goTimer);
    }
  }, [count, isComplete, onCountdownComplete]);
  
  // If countdown is complete, don't render anything
  if (isComplete) return null;
  
  return (
    <div className="countdown-timer fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="text-center">
        {count > 0 ? (
          <div className="text-9xl font-bold text-white animate-pulse">
            {count}
          </div>
        ) : (
          <div className="text-9xl font-bold text-green-500 animate-bounce">
            GO!
          </div>
        )}
      </div>
    </div>
  );
};

CountdownTimer.propTypes = {
  initialCount: PropTypes.number,
  onCountdownComplete: PropTypes.func
};

export default CountdownTimer;
