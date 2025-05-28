import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * VirtualJoystick component - A touch-based joystick control
 */
const VirtualJoystick = ({ 
  size = 120, 
  baseColor = 'rgba(50, 50, 50, 0.5)', 
  stickColor = 'rgba(100, 100, 200, 0.8)',
  onMove = () => {},
  onEnd = () => {}
}) => {
  const joystickRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Calculate normalized values (-1 to 1)
  const maxDistance = size / 2;
  const normalizedX = position.x / maxDistance;
  const normalizedY = position.y / maxDistance;
  
  // Check if device is touch-enabled
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      navigator.msMaxTouchPoints > 0);
  }, []);
  
  // Handle touch/mouse start
  const handleStart = useCallback((clientX, clientY) => {
    if (!joystickRef.current) return;
    
    setIsDragging(true);
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setStartPosition({
      x: clientX - centerX,
      y: clientY - centerY
    });
    
    setPosition({ x: 0, y: 0 });
  }, []);
  
  // Handle touch/mouse move
  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging || !joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate new position relative to center
    let newX = clientX - centerX - startPosition.x;
    let newY = clientY - centerY - startPosition.y;
    
    // Calculate distance from center
    const distance = Math.sqrt(newX * newX + newY * newY);
    
    // Limit distance to joystick radius
    if (distance > maxDistance) {
      const angle = Math.atan2(newY, newX);
      newX = Math.cos(angle) * maxDistance;
      newY = Math.sin(angle) * maxDistance;
    }
    
    setPosition({ x: newX, y: newY });
    
    // Calculate normalized values (-1 to 1)
    const normalizedX = newX / maxDistance;
    const normalizedY = newY / maxDistance;
    
    // Call onMove callback with normalized values
    onMove(normalizedX, normalizedY);
  }, [isDragging, startPosition, maxDistance, onMove]);
  
  // Handle touch/mouse end
  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onEnd();
  }, [onEnd]);
  
  // Touch event handlers
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleStart(touch.clientX, touch.clientY);
  }, [handleStart]);
  
  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX, touch.clientY);
  }, [isDragging, handleMove]);
  
  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);
  
  // Mouse event handlers (for testing on desktop)
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);
  
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  }, [isDragging, handleMove]);
  
  const handleMouseUp = useCallback((e) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);
  
  // Add global mouse/touch event listeners
  useEffect(() => {
    if (isDragging) {
      if (isTouchDevice) {
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);
      } else {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    }
    
    return () => {
      if (isTouchDevice) {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        window.removeEventListener('touchcancel', handleTouchEnd);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [
    isDragging, 
    isTouchDevice, 
    handleTouchMove, 
    handleTouchEnd, 
    handleMouseMove, 
    handleMouseUp
  ]);
  
  // Don't render if not a touch device and not in development mode
  if (!isTouchDevice && process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div 
      ref={joystickRef}
      className="virtual-joystick rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: baseColor,
        position: 'relative',
        touchAction: 'none'
      }}
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="joystick-handle rounded-full"
        style={{
          width: size / 2,
          height: size / 2,
          backgroundColor: stickColor,
          position: 'absolute',
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      />
    </div>
  );
};

VirtualJoystick.propTypes = {
  size: PropTypes.number,
  baseColor: PropTypes.string,
  stickColor: PropTypes.string,
  onMove: PropTypes.func,
  onEnd: PropTypes.func
};

export default VirtualJoystick;
