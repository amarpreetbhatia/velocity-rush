/**
 * Game loop manager for Velocity Rush
 * Handles timing, frame rate, and update/render cycle
 */

class GameLoop {
  constructor() {
    this.lastTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fpsTime = 0;
    this.fps = 0;
    
    this.isRunning = false;
    this.fixedTimeStep = 1 / 60; // 60 updates per second
    this.maxDeltaTime = 0.1; // Cap at 100ms to prevent spiral of death
    
    this.accumulatedTime = 0;
    this.timeScale = 1.0;
    
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    this.fixedUpdateCallbacks = [];
    
    this.animationFrameId = null;
    this.onFrame = this.onFrame.bind(this);
  }
  
  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now() / 1000;
    this.animationFrameId = requestAnimationFrame(this.onFrame);
  }
  
  /**
   * Stop the game loop
   */
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  /**
   * Add a callback to be called every frame for updates
   * @param {Function} callback - Function to call with deltaTime
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
    return this;
  }
  
  /**
   * Add a callback to be called every frame for rendering
   * @param {Function} callback - Function to call with deltaTime
   */
  onRender(callback) {
    this.renderCallbacks.push(callback);
    return this;
  }
  
  /**
   * Add a callback to be called at fixed time intervals
   * @param {Function} callback - Function to call with fixedTimeStep
   */
  onFixedUpdate(callback) {
    this.fixedUpdateCallbacks.push(callback);
    return this;
  }
  
  /**
   * Remove a callback
   * @param {Function} callback - Function to remove
   */
  removeCallback(callback) {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
    this.renderCallbacks = this.renderCallbacks.filter(cb => cb !== callback);
    this.fixedUpdateCallbacks = this.fixedUpdateCallbacks.filter(cb => cb !== callback);
  }
  
  /**
   * Set the fixed time step for physics and other fixed-rate updates
   * @param {number} timeStep - Time step in seconds
   */
  setFixedTimeStep(timeStep) {
    this.fixedTimeStep = timeStep;
  }
  
  /**
   * Set the time scale (slow down or speed up time)
   * @param {number} scale - Time scale factor
   */
  setTimeScale(scale) {
    this.timeScale = Math.max(0, scale);
  }
  
  /**
   * Frame update handler
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  onFrame(timestamp) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    const currentTime = timestamp / 1000;
    this.deltaTime = Math.min(currentTime - this.lastTime, this.maxDeltaTime);
    this.lastTime = currentTime;
    
    // Apply time scale
    const scaledDeltaTime = this.deltaTime * this.timeScale;
    
    // Calculate FPS
    this.frameCount++;
    this.fpsTime += this.deltaTime;
    if (this.fpsTime >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTime -= 1.0;
    }
    
    // Accumulate time for fixed updates
    this.accumulatedTime += scaledDeltaTime;
    
    // Run fixed update callbacks
    while (this.accumulatedTime >= this.fixedTimeStep) {
      for (const callback of this.fixedUpdateCallbacks) {
        callback(this.fixedTimeStep);
      }
      this.accumulatedTime -= this.fixedTimeStep;
    }
    
    // Run update callbacks
    for (const callback of this.updateCallbacks) {
      callback(scaledDeltaTime);
    }
    
    // Run render callbacks
    for (const callback of this.renderCallbacks) {
      callback(scaledDeltaTime);
    }
    
    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(this.onFrame);
  }
  
  /**
   * Get current FPS
   * @returns {number} Current frames per second
   */
  getFPS() {
    return this.fps;
  }
  
  /**
   * Get current delta time
   * @returns {number} Time since last frame in seconds
   */
  getDeltaTime() {
    return this.deltaTime;
  }
  
  /**
   * Get elapsed time since loop started
   * @returns {number} Elapsed time in seconds
   */
  getElapsedTime() {
    return this.lastTime;
  }
}

export default GameLoop;
