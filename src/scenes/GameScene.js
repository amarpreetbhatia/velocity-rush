  /**
   * Setup checkpoints
   */
  setupCheckpoints() {
    // Create checkpoint system
    this.checkpointSystem = new CheckpointSystem();
    
    // Initialize with track checkpoints
    this.checkpointSystem.init(
      this.trackBuilder.getCheckpoints(),
      {
        totalLaps: this.options.totalLaps,
        onLapCompleted: this.handleLapCompleted.bind(this),
        onCheckpointPassed: this.handleCheckpointPassed.bind(this),
        onRaceFinished: this.handleRaceFinished.bind(this)
      }
    );
    
    // Add checkpoint visualizations to scene
    this.checkpointSystem.addToScene(this.scene);
    
    // Update race state
    this.raceState.totalCheckpoints = this.trackBuilder.getCheckpoints().length;
  }
  
  /**
   * Handle lap completed event
   * @param {Object} lapData - Lap completion data
   */
  handleLapCompleted(lapData) {
    // Update race state
    this.raceState.currentLap = lapData.lap + 1; // Next lap
    this.raceState.lastLapTime = lapData.lapTime;
    this.raceState.bestLapTime = lapData.bestLapTime;
    this.raceState.lapCompleted = true;
    this.raceState.lapTimes = [...this.checkpointSystem.lapTimes];
    
    // Trigger race state changed event
    if (this.onRaceStateChanged) {
      this.onRaceStateChanged(this.getRaceState());
    }
    
    // Reset lap completed flag after a short delay
    setTimeout(() => {
      this.raceState.lapCompleted = false;
    }, 100);
  }
  
  /**
   * Handle checkpoint passed event
   * @param {Object} checkpointData - Checkpoint data
   */
  handleCheckpointPassed(checkpointData) {
    // Update race state
    this.raceState.currentCheckpoint = checkpointData.index;
    this.raceState.checkpointPassed = true;
    
    // Trigger race state changed event
    if (this.onRaceStateChanged) {
      this.onRaceStateChanged(this.getRaceState());
    }
    
    // Reset checkpoint passed flag after a short delay
    setTimeout(() => {
      this.raceState.checkpointPassed = false;
    }, 100);
  }
  
  /**
   * Handle race finished event
   * @param {Object} raceData - Race completion data
   */
  handleRaceFinished(raceData) {
    // Update race state
    this.raceState.isRaceFinished = true;
    this.raceState.raceTime = raceData.totalTime;
    this.raceState.lapTimes = raceData.lapTimes;
    this.raceState.bestLapTime = raceData.bestLapTime;
    
    // Trigger race state changed event
    if (this.onRaceStateChanged) {
      this.onRaceStateChanged(this.getRaceState());
    }
  }
  /**
   * Setup game loop
   */
  setupGameLoop() {
    // Fixed update for physics
    this.gameLoop.onFixedUpdate((fixedDeltaTime) => {
      if (this.isPaused) return;
      
      // Update race time if race is started
      if (this.raceState.isRaceStarted && !this.raceState.isRaceFinished) {
        this.raceState.raceTime += fixedDeltaTime;
        this.raceState.currentLapTime += fixedDeltaTime;
      }
      
      this.updatePhysics(fixedDeltaTime);
      
      // Update checkpoint system
      if (this.checkpointSystem && this.vehicle) {
        this.checkpointSystem.update(fixedDeltaTime, this.vehicle.mesh.position);
        
        // Update race state from checkpoint system
        const checkpointState = this.checkpointSystem.getRaceState();
        this.raceState.currentLap = checkpointState.currentLap;
        this.raceState.currentLapTime = checkpointState.currentLapTime;
        this.raceState.bestLapTime = checkpointState.bestLapTime;
      }
    });
    
    // Update for animations and camera
    this.gameLoop.onUpdate((deltaTime) => {
      if (this.isPaused) return;
      
      this.updateCamera(deltaTime);
      
      // Update environment
      if (this.environmentManager) {
        this.environmentManager.update(deltaTime);
      }
    });
    
    // Render
    this.gameLoop.onRender(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }
  
  /**
   * Start the race countdown
   */
  startRaceCountdown() {
    // Reset race state
    this.raceState.isRaceStarted = false;
    this.raceState.isRaceFinished = false;
    this.raceState.countdown = 3;
    this.raceState.currentLap = 1;
    this.raceState.currentLapTime = 0;
    this.raceState.lastLapTime = 0;
    this.raceState.bestLapTime = null;
    this.raceState.lapTimes = [];
    this.raceState.raceTime = 0;
    
    // Reset checkpoint system
    if (this.checkpointSystem) {
      this.checkpointSystem.reset();
    }
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      this.raceState.countdown--;
      
      // Trigger race state changed event
      if (this.onRaceStateChanged) {
        this.onRaceStateChanged(this.getRaceState());
      }
      
      if (this.raceState.countdown <= 0) {
        clearInterval(countdownInterval);
        this.startRace();
      }
    }, 1000);
  }
  
  /**
   * Start the race
   */
  startRace() {
    this.raceState.isRaceStarted = true;
    this.raceState.countdown = 0;
    
    // Start checkpoint system
    if (this.checkpointSystem) {
      this.checkpointSystem.startRace();
    }
    
    // Trigger race state changed event
    if (this.onRaceStateChanged) {
      this.onRaceStateChanged(this.getRaceState());
    }
  }
  
  /**
   * Get current race state
   * @returns {Object} Race state object
   */
  getRaceState() {
    return { ...this.raceState };
  }
  
  /**
   * Set race state change callback
   * @param {Function} callback - Function to call when race state changes
   */
  setRaceStateChangedCallback(callback) {
    this.onRaceStateChanged = callback;
  }
