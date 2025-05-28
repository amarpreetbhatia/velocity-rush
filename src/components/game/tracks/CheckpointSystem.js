import * as THREE from 'three';

/**
 * CheckpointSystem class - Manages race checkpoints and lap counting
 */
class CheckpointSystem {
  constructor() {
    this.checkpoints = [];
    this.startFinishLine = null;
    this.currentCheckpoint = 0;
    this.laps = 0;
    this.totalLaps = 3; // Default total laps
    this.lapTimes = [];
    this.currentLapTime = 0;
    this.bestLapTime = null;
    this.raceStartTime = 0;
    this.raceTime = 0;
    this.isRaceStarted = false;
    this.isRaceFinished = false;
    this.onLapCompleted = null;
    this.onCheckpointPassed = null;
    this.onRaceFinished = null;
    
    // Checkpoint visualization
    this.checkpointObjects = [];
    this.startFinishObject = null;
  }
  
  /**
   * Initialize the checkpoint system
   * @param {Array} checkpoints - Array of checkpoint objects
   * @param {Object} options - Configuration options
   */
  init(checkpoints, options = {}) {
    this.checkpoints = checkpoints || [];
    this.totalLaps = options.totalLaps || 3;
    this.onLapCompleted = options.onLapCompleted;
    this.onCheckpointPassed = options.onCheckpointPassed;
    this.onRaceFinished = options.onRaceFinished;
    
    // Find start/finish line
    this.startFinishLine = this.checkpoints.find(cp => cp.isStartFinish);
    
    // Reset state
    this.reset();
    
    // Create checkpoint visualizations
    this.createCheckpointVisualizations();
  }
  
  /**
   * Reset the checkpoint system
   */
  reset() {
    this.currentCheckpoint = 0;
    this.laps = 0;
    this.lapTimes = [];
    this.currentLapTime = 0;
    this.raceStartTime = 0;
    this.raceTime = 0;
    this.isRaceStarted = false;
    this.isRaceFinished = false;
  }
  
  /**
   * Start the race
   */
  startRace() {
    this.reset();
    this.raceStartTime = performance.now();
    this.isRaceStarted = true;
  }
  
  /**
   * Create visual representations of checkpoints
   */
  createCheckpointVisualizations() {
    // Clear existing checkpoint objects
    this.checkpointObjects.forEach(obj => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });
    this.checkpointObjects = [];
    
    // Create new checkpoint objects
    this.checkpoints.forEach((checkpoint, index) => {
      if (checkpoint.isStartFinish) {
        // Create start/finish line
        const startFinishGeometry = new THREE.PlaneGeometry(20, 5);
        const startFinishMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.5,
          side: THREE.DoubleSide
        });
        
        // Create checkerboard pattern
        const texture = new THREE.CanvasTexture(this.createCheckerboardTexture());
        startFinishMaterial.map = texture;
        
        const startFinishLine = new THREE.Mesh(startFinishGeometry, startFinishMaterial);
        startFinishLine.rotation.x = -Math.PI / 2;
        startFinishLine.position.copy(checkpoint.position);
        startFinishLine.position.y += 0.05; // Slightly above track
        
        this.startFinishObject = startFinishLine;
        this.checkpointObjects.push(startFinishLine);
      } else {
        // Create regular checkpoint
        const checkpointGeometry = new THREE.PlaneGeometry(20, 2);
        const checkpointMaterial = new THREE.MeshBasicMaterial({
          color: index === this.currentCheckpoint ? 0x00ff00 : 0x0088ff,
          transparent: true,
          opacity: 0.3,
          side: THREE.DoubleSide
        });
        
        const checkpointObject = new THREE.Mesh(checkpointGeometry, checkpointMaterial);
        checkpointObject.rotation.x = -Math.PI / 2;
        checkpointObject.position.copy(checkpoint.position);
        checkpointObject.position.y += 0.05; // Slightly above track
        
        this.checkpointObjects.push(checkpointObject);
      }
    });
  }
  
  /**
   * Create a checkerboard texture for the start/finish line
   * @returns {HTMLCanvasElement} Canvas with checkerboard pattern
   */
  createCheckerboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const squareSize = 64;
    for (let x = 0; x < canvas.width; x += squareSize) {
      for (let y = 0; y < canvas.height; y += squareSize) {
        const isEven = ((x / squareSize) + (y / squareSize)) % 2 === 0;
        ctx.fillStyle = isEven ? '#ffffff' : '#000000';
        ctx.fillRect(x, y, squareSize, squareSize);
      }
    }
    
    return canvas;
  }
  
  /**
   * Add checkpoint objects to the scene
   * @param {THREE.Scene} scene - Three.js scene
   */
  addToScene(scene) {
    this.checkpointObjects.forEach(obj => {
      scene.add(obj);
    });
  }
  
  /**
   * Update checkpoint system
   * @param {number} deltaTime - Time since last update in seconds
   * @param {THREE.Vector3} vehiclePosition - Current vehicle position
   */
  update(deltaTime, vehiclePosition) {
    if (!this.isRaceStarted || this.isRaceFinished) return;
    
    // Update race time
    this.raceTime = (performance.now() - this.raceStartTime) / 1000;
    this.currentLapTime += deltaTime;
    
    // Check if vehicle has passed the current checkpoint
    const checkpoint = this.checkpoints[this.currentCheckpoint];
    if (checkpoint && this.isVehicleAtCheckpoint(vehiclePosition, checkpoint)) {
      // Mark checkpoint as passed
      this.checkpointPassed();
    }
  }
  
  /**
   * Check if vehicle is at a checkpoint
   * @param {THREE.Vector3} vehiclePosition - Vehicle position
   * @param {Object} checkpoint - Checkpoint object
   * @returns {boolean} True if vehicle is at checkpoint
   */
  isVehicleAtCheckpoint(vehiclePosition, checkpoint) {
    // Simple distance-based check
    const distance = vehiclePosition.distanceTo(checkpoint.position);
    return distance < 10; // Adjust threshold as needed
  }
  
  /**
   * Handle checkpoint passed event
   */
  checkpointPassed() {
    // Update checkpoint visualization
    if (this.checkpointObjects[this.currentCheckpoint]) {
      const material = this.checkpointObjects[this.currentCheckpoint].material;
      material.color.set(0x00ff00); // Green for passed checkpoint
    }
    
    // Check if this is the start/finish line
    if (this.checkpoints[this.currentCheckpoint].isStartFinish && this.laps > 0) {
      this.lapCompleted();
    }
    
    // Call checkpoint passed callback
    if (this.onCheckpointPassed) {
      this.onCheckpointPassed({
        index: this.currentCheckpoint,
        checkpoint: this.checkpoints[this.currentCheckpoint]
      });
    }
    
    // Move to next checkpoint
    this.currentCheckpoint = (this.currentCheckpoint + 1) % this.checkpoints.length;
    
    // If we've looped back to the start, increment lap counter
    if (this.currentCheckpoint === 0) {
      this.laps++;
      
      // Check if race is finished
      if (this.laps >= this.totalLaps) {
        this.raceFinished();
      }
    }
    
    // Update next checkpoint visualization
    if (this.checkpointObjects[this.currentCheckpoint]) {
      const material = this.checkpointObjects[this.currentCheckpoint].material;
      material.color.set(0xff8800); // Orange for next checkpoint
    }
  }
  
  /**
   * Handle lap completed event
   */
  lapCompleted() {
    // Record lap time
    this.lapTimes.push(this.currentLapTime);
    
    // Update best lap time
    if (this.bestLapTime === null || this.currentLapTime < this.bestLapTime) {
      this.bestLapTime = this.currentLapTime;
    }
    
    // Reset current lap time
    this.currentLapTime = 0;
    
    // Call lap completed callback
    if (this.onLapCompleted) {
      this.onLapCompleted({
        lap: this.laps,
        lapTime: this.lapTimes[this.lapTimes.length - 1],
        bestLapTime: this.bestLapTime
      });
    }
  }
  
  /**
   * Handle race finished event
   */
  raceFinished() {
    this.isRaceFinished = true;
    
    // Call race finished callback
    if (this.onRaceFinished) {
      this.onRaceFinished({
        totalTime: this.raceTime,
        lapTimes: this.lapTimes,
        bestLapTime: this.bestLapTime
      });
    }
  }
  
  /**
   * Get current race state
   * @returns {Object} Race state object
   */
  getRaceState() {
    return {
      currentCheckpoint: this.currentCheckpoint,
      totalCheckpoints: this.checkpoints.length,
      currentLap: this.laps + 1,
      totalLaps: this.totalLaps,
      currentLapTime: this.currentLapTime,
      bestLapTime: this.bestLapTime,
      lapTimes: this.lapTimes,
      raceTime: this.raceTime,
      isRaceStarted: this.isRaceStarted,
      isRaceFinished: this.isRaceFinished
    };
  }
}

export default CheckpointSystem;
