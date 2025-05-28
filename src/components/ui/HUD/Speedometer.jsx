import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Speedometer component for displaying vehicle speed, RPM, and gear
 */
const Speedometer = ({ speed, rpm, gear, maxSpeed = 300, maxRpm = 8000 }) => {
  const canvasRef = useRef(null);
  
  // Draw speedometer on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set up dimensions
    const centerX = width / 2;
    const centerY = height * 0.65;
    const radius = Math.min(width, height) * 0.4;
    
    // Draw speedometer background
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();
    
    // Draw speedometer border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    
    // Draw speed ticks
    const startAngle = Math.PI;
    const endAngle = 0;
    const totalAngle = endAngle - startAngle;
    
    for (let i = 0; i <= maxSpeed; i += 20) {
      const angle = startAngle + (i / maxSpeed) * totalAngle;
      const tickLength = i % 100 === 0 ? 15 : (i % 50 === 0 ? 10 : 5);
      
      const innerX = centerX + (radius - tickLength) * Math.cos(angle);
      const innerY = centerY + (radius - tickLength) * Math.sin(angle);
      const outerX = centerX + radius * Math.cos(angle);
      const outerY = centerY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.lineWidth = i % 100 === 0 ? 3 : (i % 50 === 0 ? 2 : 1);
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
      
      // Draw speed numbers for major ticks
      if (i % 50 === 0) {
        const textX = centerX + (radius - 25) * Math.cos(angle);
        const textY = centerY + (radius - 25) * Math.sin(angle);
        
        ctx.font = '12px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), textX, textY);
      }
    }
    
    // Draw speed needle
    const speedAngle = startAngle + (Math.min(speed, maxSpeed) / maxSpeed) * totalAngle;
    const needleLength = radius - 10;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + needleLength * Math.cos(speedAngle),
      centerY + needleLength * Math.sin(speedAngle)
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff3333';
    ctx.stroke();
    
    // Draw needle center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3333';
    ctx.fill();
    
    // Draw digital speed display
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.round(speed) + ' km/h', centerX, centerY - radius * 0.3);
    
    // Draw RPM bar
    const rpmBarWidth = width * 0.8;
    const rpmBarHeight = 15;
    const rpmBarX = (width - rpmBarWidth) / 2;
    const rpmBarY = height * 0.85;
    
    // RPM background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(rpmBarX, rpmBarY, rpmBarWidth, rpmBarHeight);
    
    // RPM fill
    const rpmRatio = Math.min(rpm / maxRpm, 1);
    const rpmFillWidth = rpmBarWidth * rpmRatio;
    
    // Gradient color based on RPM
    let rpmColor;
    if (rpmRatio < 0.7) {
      rpmColor = '#33ff33'; // Green
    } else if (rpmRatio < 0.9) {
      rpmColor = '#ffff33'; // Yellow
    } else {
      rpmColor = '#ff3333'; // Red
    }
    
    ctx.fillStyle = rpmColor;
    ctx.fillRect(rpmBarX, rpmBarY, rpmFillWidth, rpmBarHeight);
    
    // RPM border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(rpmBarX, rpmBarY, rpmBarWidth, rpmBarHeight);
    
    // Draw gear indicator
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gear.toString(), centerX, centerY + radius * 0.3);
    
    // Draw RPM text
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RPM: ' + Math.round(rpm), centerX, rpmBarY + rpmBarHeight + 15);
    
  }, [speed, rpm, gear, maxSpeed, maxRpm]);
  
  return (
    <div className="speedometer-container">
      <canvas 
        ref={canvasRef} 
        width={200} 
        height={200} 
        className="speedometer-canvas"
      />
    </div>
  );
};

Speedometer.propTypes = {
  speed: PropTypes.number.isRequired,
  rpm: PropTypes.number.isRequired,
  gear: PropTypes.number.isRequired,
  maxSpeed: PropTypes.number,
  maxRpm: PropTypes.number
};

export default Speedometer;
