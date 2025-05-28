import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage input from both keyboard and touch controls
 * @returns {Object} Input state and methods
 */
const useInputManager = () => {
  // Input state
  const [input, setInput] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false
  });
  
  // Touch controls state
  const [touchControls, setTouchControls] = useState({
    throttle: 0,
    brake: 0,
    steering: 0
  });
  
  // Update input state from keyboard
  const handleKeyDown = useCallback((e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        setInput(prev => ({ ...prev, forward: true }));
        break;
      case 's':
      case 'arrowdown':
        setInput(prev => ({ ...prev, backward: true }));
        break;
      case 'a':
      case 'arrowleft':
        setInput(prev => ({ ...prev, left: true }));
        break;
      case 'd':
      case 'arrowright':
        setInput(prev => ({ ...prev, right: true }));
        break;
      case ' ':
        setInput(prev => ({ ...prev, brake: true }));
        break;
    }
  }, []);
  
  const handleKeyUp = useCallback((e) => {
    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        setInput(prev => ({ ...prev, forward: false }));
        break;
      case 's':
      case 'arrowdown':
        setInput(prev => ({ ...prev, backward: false }));
        break;
      case 'a':
      case 'arrowleft':
        setInput(prev => ({ ...prev, left: false }));
        break;
      case 'd':
      case 'arrowright':
        setInput(prev => ({ ...prev, right: false }));
        break;
      case ' ':
        setInput(prev => ({ ...prev, brake: false }));
        break;
    }
  }, []);
  
  // Update input state from touch controls
  const handleTouchControlsChange = useCallback((controls) => {
    setTouchControls(controls);
  }, []);
  
  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
  
  // Combine keyboard and touch inputs
  const combinedInput = {
    // Forward: keyboard W/Up OR touch throttle > 0
    forward: input.forward || touchControls.throttle > 0,
    
    // Backward: keyboard S/Down OR touch brake > 0 (for reverse)
    backward: input.backward || (touchControls.brake > 0 && touchControls.throttle === 0),
    
    // Left: keyboard A/Left OR touch steering < 0
    left: input.left || touchControls.steering < -0.1,
    
    // Right: keyboard D/Right OR touch steering > 0
    right: input.right || touchControls.steering > 0.1,
    
    // Brake: keyboard Space OR touch brake > 0
    brake: input.brake || touchControls.brake > 0,
    
    // Raw values for analog control
    throttleValue: Math.max(input.forward ? 1 : 0, touchControls.throttle),
    brakeValue: Math.max(input.brake ? 1 : 0, touchControls.brake),
    steeringValue: input.left ? -1 : (input.right ? 1 : touchControls.steering)
  };
  
  return {
    input: combinedInput,
    handleTouchControlsChange
  };
};

export default useInputManager;
