import React, { useState, useEffect } from 'react';

/**
 * ControlsHelp component - Displays control instructions based on device type
 */
const ControlsHelp = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Check if device supports touch events
    const checkTouchDevice = () => {
      setIsTouchDevice('ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        navigator.msMaxTouchPoints > 0);
    };
    
    checkTouchDevice();
    
    // Also check on resize in case of device orientation change
    window.addEventListener('resize', checkTouchDevice);
    
    // Auto-hide after 10 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 10000);
    
    return () => {
      window.removeEventListener('resize', checkTouchDevice);
      clearTimeout(hideTimeout);
    };
  }, []);
  
  if (!isVisible) {
    return (
      <button 
        className="absolute bottom-4 left-4 btn btn-sm btn-circle btn-ghost bg-base-300 bg-opacity-50"
        onClick={() => setIsVisible(true)}
      >
        ?
      </button>
    );
  }
  
  return (
    <div className="absolute bottom-8 left-8 bg-base-300 bg-opacity-70 p-4 rounded-lg text-base-content shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xl font-bold">Controls</div>
        <button 
          className="btn btn-sm btn-circle btn-ghost"
          onClick={() => setIsVisible(false)}
        >
          ✕
        </button>
      </div>
      
      {isTouchDevice ? (
        <div className="grid grid-cols-2 gap-x-4">
          <div>Accelerate:</div>
          <div>Tap & hold green button</div>
          <div>Brake/Reverse:</div>
          <div>Tap & hold red button</div>
          <div>Steering:</div>
          <div>Drag steering wheel left/right</div>
          <div>Pause:</div>
          <div>Menu button</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4">
          <div>Accelerate:</div>
          <div>W / ↑</div>
          <div>Brake/Reverse:</div>
          <div>S / ↓</div>
          <div>Steer Left:</div>
          <div>A / ←</div>
          <div>Steer Right:</div>
          <div>D / →</div>
          <div>Handbrake:</div>
          <div>Space</div>
          <div>Pause:</div>
          <div>P / Esc</div>
          <div>Toggle Camera:</div>
          <div>C</div>
        </div>
      )}
    </div>
  );
};

export default ControlsHelp;
