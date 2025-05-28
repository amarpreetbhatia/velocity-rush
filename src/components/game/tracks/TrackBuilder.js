import * as THREE from 'three';
import StraightSegment from './StraightSegment';
import CurveSegment from './CurveSegment';
import RampSegment from './RampSegment';

/**
 * TrackBuilder class - Builds a complete track from segments
 */
class TrackBuilder {
  constructor() {
    this.segments = [];
    this.group = new THREE.Group();
    this.colliders = [];
    this.checkpoints = [];
    this.startPosition = new THREE.Vector3(0, 0, 0);
    this.startRotation = 0;
  }
  
  /**
   * Add a track segment
   * @param {TrackSegment} segment - The segment to add
   * @returns {TrackBuilder} This builder for chaining
   */
  addSegment(segment) {
    // If this is the first segment, position it at the origin
    if (this.segments.length === 0) {
      segment.positionSegment(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1));
      this.startPosition = segment.getEntryPoint().clone();
      this.startRotation = Math.atan2(segment.getEntryDirection().x, segment.getEntryDirection().z);
    } else {
      // Otherwise, position it to connect with the previous segment
      const prevSegment = this.segments[this.segments.length - 1];
      const exitPoint = prevSegment.getExitPoint();
      const exitDirection = prevSegment.getExitDirection();
      
      segment.positionSegment(exitPoint, exitDirection);
    }
    
    // Add segment to the list
    this.segments.push(segment);
    
    // Add segment's 3D object to the group
    this.group.add(segment.getObject3D());
    
    // Add segment's colliders to the list
    this.colliders.push(...segment.getColliders());
    
    return this;
  }
  
  /**
   * Add a straight segment
   * @param {Object} options - Options for the straight segment
   * @returns {TrackBuilder} This builder for chaining
   */
  addStraight(options = {}) {
    const segment = new StraightSegment(options);
    return this.addSegment(segment);
  }
  
  /**
   * Add a curve segment
   * @param {Object} options - Options for the curve segment
   * @returns {TrackBuilder} This builder for chaining
   */
  addCurve(options = {}) {
    const segment = new CurveSegment(options);
    return this.addSegment(segment);
  }
  
  /**
   * Add a ramp segment
   * @param {Object} options - Options for the ramp segment
   * @returns {TrackBuilder} This builder for chaining
   */
  addRamp(options = {}) {
    const segment = new RampSegment(options);
    return this.addSegment(segment);
  }
  
  /**
   * Add a checkpoint
   * @param {number} segmentIndex - Index of the segment to add the checkpoint to
   * @param {number} position - Position along the segment (0-1)
   * @returns {TrackBuilder} This builder for chaining
   */
  addCheckpoint(segmentIndex, position = 0.5) {
    if (segmentIndex < 0 || segmentIndex >= this.segments.length) {
      console.error('Invalid segment index for checkpoint');
      return this;
    }
    
    const segment = this.segments[segmentIndex];
    const entry = segment.getEntryPoint();
    const exit = segment.getExitPoint();
    
    // Interpolate between entry and exit
    const checkpointPosition = new THREE.Vector3().lerpVectors(entry, exit, position);
    
    // Create checkpoint object
    const checkpoint = {
      position: checkpointPosition,
      index: this.checkpoints.length,
      segmentIndex: segmentIndex
    };
    
    this.checkpoints.push(checkpoint);
    
    return this;
  }
  
  /**
   * Add a start/finish line
   * @param {number} segmentIndex - Index of the segment to add the start/finish line to
   * @param {number} position - Position along the segment (0-1)
   * @returns {TrackBuilder} This builder for chaining
   */
  addStartFinishLine(segmentIndex, position = 0.5) {
    if (segmentIndex < 0 || segmentIndex >= this.segments.length) {
      console.error('Invalid segment index for start/finish line');
      return this;
    }
    
    const segment = this.segments[segmentIndex];
    const entry = segment.getEntryPoint();
    const exit = segment.getExitPoint();
    
    // Interpolate between entry and exit
    const linePosition = new THREE.Vector3().lerpVectors(entry, exit, position);
    
    // Create start/finish line object
    const startFinishLine = {
      position: linePosition,
      isStartFinish: true
    };
    
    // Add as first checkpoint
    this.checkpoints.unshift(startFinishLine);
    
    return this;
  }
  
  /**
   * Build a predefined track layout
   * @param {string} layout - Name of the layout to build
   * @returns {TrackBuilder} This builder for chaining
   */
  buildLayout(layout = 'oval') {
    switch (layout) {
      case 'oval':
        return this.buildOvalTrack();
      case 'figure8':
        return this.buildFigure8Track();
      case 'circuit':
        return this.buildCircuitTrack();
      case 'mountain':
        return this.buildMountainTrack();
      default:
        console.error('Unknown track layout:', layout);
        return this;
    }
  }
  
  /**
   * Build an oval track
   * @returns {TrackBuilder} This builder for chaining
   */
  buildOvalTrack() {
    // Clear any existing segments
    this.clear();
    
    // Add segments
    this.addStraight({ length: 100 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addStraight({ length: 100 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addStraight({ length: 100 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addStraight({ length: 100 })
      .addCurve({ angle: Math.PI / 2, radius: 40 });
    
    // Add checkpoints
    this.addStartFinishLine(0, 0.5);
    this.addCheckpoint(2, 0.5);
    this.addCheckpoint(4, 0.5);
    this.addCheckpoint(6, 0.5);
    
    return this;
  }
  
  /**
   * Build a figure-8 track
   * @returns {TrackBuilder} This builder for chaining
   */
  buildFigure8Track() {
    // Clear any existing segments
    this.clear();
    
    // Add segments
    this.addStraight({ length: 80 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addStraight({ length: 40 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addStraight({ length: 80 })
      .addCurve({ angle: -Math.PI / 2, radius: 40 })
      .addStraight({ length: 40 })
      .addCurve({ angle: -Math.PI / 2, radius: 40 });
    
    // Add checkpoints
    this.addStartFinishLine(0, 0.5);
    this.addCheckpoint(2, 0.5);
    this.addCheckpoint(4, 0.5);
    this.addCheckpoint(6, 0.5);
    
    return this;
  }
  
  /**
   * Build a circuit track with varied segments
   * @returns {TrackBuilder} This builder for chaining
   */
  buildCircuitTrack() {
    // Clear any existing segments
    this.clear();
    
    // Add segments
    this.addStraight({ length: 100 })
      .addCurve({ angle: Math.PI / 4, radius: 60 })
      .addStraight({ length: 50 })
      .addCurve({ angle: -Math.PI / 4, radius: 60 })
      .addStraight({ length: 80 })
      .addCurve({ angle: Math.PI / 2, radius: 30 })
      .addStraight({ length: 60 })
      .addCurve({ angle: Math.PI / 2, radius: 30 })
      .addStraight({ length: 40 })
      .addCurve({ angle: -Math.PI / 2, radius: 40 })
      .addStraight({ length: 40 })
      .addCurve({ angle: -Math.PI / 2, radius: 40 });
    
    // Add checkpoints
    this.addStartFinishLine(0, 0.5);
    this.addCheckpoint(2, 0.5);
    this.addCheckpoint(4, 0.5);
    this.addCheckpoint(6, 0.5);
    this.addCheckpoint(8, 0.5);
    this.addCheckpoint(10, 0.5);
    
    return this;
  }
  
  /**
   * Build a mountain track with elevation changes
   * @returns {TrackBuilder} This builder for chaining
   */
  buildMountainTrack() {
    // Clear any existing segments
    this.clear();
    
    // Add segments
    this.addStraight({ length: 80 })
      .addRamp({ length: 60, height: 15 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addStraight({ length: 60 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addRamp({ length: 60, height: -15 })
      .addStraight({ length: 80 })
      .addCurve({ angle: Math.PI / 2, radius: 40 })
      .addStraight({ length: 60 })
      .addCurve({ angle: Math.PI / 2, radius: 40 });
    
    // Add checkpoints
    this.addStartFinishLine(0, 0.5);
    this.addCheckpoint(2, 0.5);
    this.addCheckpoint(4, 0.5);
    this.addCheckpoint(6, 0.5);
    this.addCheckpoint(8, 0.5);
    
    return this;
  }
  
  /**
   * Clear all segments
   * @returns {TrackBuilder} This builder for chaining
   */
  clear() {
    // Remove all segments from the group
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    
    // Clear arrays
    this.segments = [];
    this.colliders = [];
    this.checkpoints = [];
    
    return this;
  }
  
  /**
   * Get the track's 3D group
   * @returns {THREE.Group} The track's group
   */
  getObject3D() {
    return this.group;
  }
  
  /**
   * Get the track's colliders
   * @returns {Array} Array of collider objects
   */
  getColliders() {
    return this.colliders;
  }
  
  /**
   * Get the track's checkpoints
   * @returns {Array} Array of checkpoint objects
   */
  getCheckpoints() {
    return this.checkpoints;
  }
  
  /**
   * Get the track's start position
   * @returns {THREE.Vector3} Start position
   */
  getStartPosition() {
    return this.startPosition;
  }
  
  /**
   * Get the track's start rotation
   * @returns {number} Start rotation in radians
   */
  getStartRotation() {
    return this.startRotation;
  }
}

export default TrackBuilder;
