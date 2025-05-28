import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import VirtualJoystick from './VirtualJoystick';

/**
 * TouchControls component - Provides on-screen controls for touch devices
 */
const TouchControls = ({ onControlsChange }) => {
  // Control states
  const [throttle, setThrottle] = useState(0);
  const [brake, setBrake] = useState(0);
  const [steering, setSteering] = useState(0);
  
  // Touch states for each control
  const [acceleratorTouched, setAcceleratorTouched] = useState(false);
  const [brakeTouched, setBrakeTouched] = useState(false);
  
  // Check if device is touch-enabled
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
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
    
    return () => {
      window.removeEventListener('resize', checkTouchDevice);
    };
  }, []);
  
  // Update controls when states change
  useEffect(() => {
    if (onControlsChange) {
      onControlsChange({
        throttle,
        brake,
        steering
      });
    }
  }, [throttle, brake, steering, onControlsChange]);
  
  // Handle accelerator touch events
  const handleAcceleratorStart = useCallback((e) => {
    e.preventDefault();
    setAcceleratorTouched(true);
    setThrottle(1);
  }, []);
  
  const handleAcceleratorEnd = useCallback(() => {
    setAcceleratorTouched(false);
    setThrottle(0);
  }, []);
  
  // Handle brake touch events
  const handleBrakeStart = useCallback((e) => {
    e.preventDefault();
    setBrakeTouched(true);
    setBrake(1);
  }, []);
  
  const handleBrakeEnd = useCallback(() => {
    setBrakeTouched(false);
    setBrake(0);
  }, []);
  
  // Handle steering joystick
  const handleSteeringMove = useCallback((x, y) => {
    // Only use the x-axis for steering
    setSteering(x);
  }, []);
  
  const handleSteeringEnd = useCallback(() => {
    setSteering(0);
  }, []);
  
  // Don't render if not a touch device
  if (!isTouchDevice && process.env.NODE_ENV !== 'production') {
    return (
      <div className="fixed bottom-4 left-4 text-white bg-black bg-opacity-50 p-2 rounded">
        Touch controls disabled (not a touch device)
      </div>
    );
  }
  
  if (!isTouchDevice) {
    return null;
  }
  
  return (
    <div className="touch-controls fixed inset-0 pointer-events-none">
      {/* Steering joystick (left side) */}
      <div className="absolute bottom-20 left-8 pointer-events-auto">
        <VirtualJoystick 
          size={150}
          baseColor="rgba(50, 50, 50, 0.5)"
          stickColor="rgba(100, 100, 200, 0.8)"
          onMove={handleSteeringMove}
          onEnd={handleSteeringEnd}
        />
      </div>
      
      {/* Accelerator and brake buttons (right side) */}
      <div className="absolute bottom-20 right-8 flex flex-col gap-4 pointer-events-auto">
        {/* Accelerator */}
        <button 
          className={`btn btn-circle btn-lg ${acceleratorTouched ? 'btn-success' : 'btn-outline btn-success'}`}
          onTouchStart={handleAcceleratorStart}
          onTouchEnd={handleAcceleratorEnd}
          onTouchCancel={handleAcceleratorEnd}
        >
          <span className="text-2xl">↑</span>
        </button>
        
        {/* Brake */}
        <button 
          className={`btn btn-circle btn-lg ${brakeTouched ? 'btn-error' : 'btn-outline btn-error'}`}
          onTouchStart={handleBrakeStart}
          onTouchEnd={handleBrakeEnd}
          onTouchCancel={handleBrakeEnd}
        >
          <span className="text-2xl">↓</span>
        </button>
      </div>
    </div>
  );
};

TouchControls.propTypes = {
  onControlsChange: PropTypes.func.isRequired
};

export default TouchControls;
