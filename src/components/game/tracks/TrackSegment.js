import * as THREE from 'three';

/**
 * TrackSegment class - Base class for all track segments
 */
class TrackSegment {
  constructor(options = {}) {
    this.options = {
      width: 20,
      length: 50,
      barrierHeight: 1.5,
      barrierWidth: 1,
      trackColor: 0x333333,
      barrierColor: 0xcc0000,
      textureRepeat: 2,
      ...options
    };
    
    this.group = new THREE.Group();
    this.colliders = [];
    this.entry = new THREE.Vector3(0, 0, 0);
    this.exit = new THREE.Vector3(0, 0, 0);
    this.entryDirection = new THREE.Vector3(0, 0, 1);
    this.exitDirection = new THREE.Vector3(0, 0, 1);
    
    // Load textures
    this.loadTextures();
    
    // Create segment
    this.createSegment();
  }
  
  /**
   * Load textures for the track segment
   */
  loadTextures() {
    const textureLoader = new THREE.TextureLoader();
    
    // Track textures
    this.trackTextures = {
      diffuse: textureLoader.load('/assets/textures/track_diffuse.jpg'),
      normal: textureLoader.load('/assets/textures/track_normal.jpg'),
      roughness: textureLoader.load('/assets/textures/track_roughness.jpg')
    };
    
    // Set texture properties
    Object.values(this.trackTextures).forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(this.options.textureRepeat, this.options.textureRepeat);
    });
    
    // Barrier textures
    this.barrierTextures = {
      diffuse: textureLoader.load('/assets/textures/barrier_diffuse.jpg'),
      normal: textureLoader.load('/assets/textures/barrier_normal.jpg'),
      roughness: textureLoader.load('/assets/textures/barrier_roughness.jpg')
    };
    
    // Set texture properties
    Object.values(this.barrierTextures).forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(1, 1);
    });
  }
  
  /**
   * Create the track segment (to be implemented by subclasses)
   */
  createSegment() {
    // Base implementation creates a straight segment
    this.createStraightSegment();
  }
  
  /**
   * Create a straight track segment
   */
  createStraightSegment() {
    const { width, length, barrierHeight, barrierWidth, trackColor, barrierColor } = this.options;
    
    // Create track surface
    const trackGeometry = new THREE.PlaneGeometry(width, length);
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: trackColor,
      map: this.trackTextures.diffuse,
      normalMap: this.trackTextures.normal,
      roughnessMap: this.trackTextures.roughness,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.01; // Slightly above ground to prevent z-fighting
    track.receiveShadow = true;
    this.group.add(track);
    
    // Create left barrier
    const leftBarrierGeometry = new THREE.BoxGeometry(barrierWidth, barrierHeight, length);
    const barrierMaterial = new THREE.MeshStandardMaterial({
      color: barrierColor,
      map: this.barrierTextures.diffuse,
      normalMap: this.barrierTextures.normal,
      roughnessMap: this.barrierTextures.roughness,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const leftBarrier = new THREE.Mesh(leftBarrierGeometry, barrierMaterial);
    leftBarrier.position.set(-(width / 2 + barrierWidth / 2), barrierHeight / 2, 0);
    leftBarrier.castShadow = true;
    leftBarrier.receiveShadow = true;
    this.group.add(leftBarrier);
    
    // Add left barrier collider
    this.colliders.push({
      type: 'box',
      mesh: leftBarrier,
      size: new THREE.Vector3(barrierWidth, barrierHeight, length)
    });
    
    // Create right barrier
    const rightBarrierGeometry = new THREE.BoxGeometry(barrierWidth, barrierHeight, length);
    const rightBarrier = new THREE.Mesh(rightBarrierGeometry, barrierMaterial);
    rightBarrier.position.set(width / 2 + barrierWidth / 2, barrierHeight / 2, 0);
    rightBarrier.castShadow = true;
    rightBarrier.receiveShadow = true;
    this.group.add(rightBarrier);
    
    // Add right barrier collider
    this.colliders.push({
      type: 'box',
      mesh: rightBarrier,
      size: new THREE.Vector3(barrierWidth, barrierHeight, length)
    });
    
    // Set entry and exit points
    this.entry = new THREE.Vector3(0, 0, -length / 2);
    this.exit = new THREE.Vector3(0, 0, length / 2);
    this.entryDirection = new THREE.Vector3(0, 0, 1);
    this.exitDirection = new THREE.Vector3(0, 0, 1);
  }
  
  /**
   * Get the segment's 3D group
   * @returns {THREE.Group} The segment's group
   */
  getObject3D() {
    return this.group;
  }
  
  /**
   * Get the segment's colliders
   * @returns {Array} Array of collider objects
   */
  getColliders() {
    return this.colliders;
  }
  
  /**
   * Get the segment's entry point
   * @returns {THREE.Vector3} Entry point
   */
  getEntryPoint() {
    return this.entry.clone();
  }
  
  /**
   * Get the segment's exit point
   * @returns {THREE.Vector3} Exit point
   */
  getExitPoint() {
    return this.exit.clone();
  }
  
  /**
   * Get the segment's entry direction
   * @returns {THREE.Vector3} Entry direction
   */
  getEntryDirection() {
    return this.entryDirection.clone();
  }
  
  /**
   * Get the segment's exit direction
   * @returns {THREE.Vector3} Exit direction
   */
  getExitDirection() {
    return this.exitDirection.clone();
  }
  
  /**
   * Position the segment to connect with another segment
   * @param {THREE.Vector3} position - Position to place the segment
   * @param {THREE.Vector3} direction - Direction the segment should face
   */
  positionSegment(position, direction) {
    // Calculate rotation to align with direction
    const angle = Math.atan2(direction.x, direction.z);
    
    // Position the segment
    this.group.position.copy(position);
    this.group.rotation.y = angle;
    
    // Update entry and exit points
    const rotationMatrix = new THREE.Matrix4().makeRotationY(angle);
    
    const worldEntry = this.entry.clone().applyMatrix4(rotationMatrix).add(position);
    const worldExit = this.exit.clone().applyMatrix4(rotationMatrix).add(position);
    
    const worldEntryDir = this.entryDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    const worldExitDir = this.exitDirection.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    
    this.entry = worldEntry;
    this.exit = worldExit;
    this.entryDirection = worldEntryDir;
    this.exitDirection = worldExitDir;
  }
}

export default TrackSegment;
