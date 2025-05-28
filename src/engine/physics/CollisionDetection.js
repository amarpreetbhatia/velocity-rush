import * as THREE from 'three';

/**
 * CollisionDetection class - Handles collision detection between objects
 */
class CollisionDetection {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.tempVector = new THREE.Vector3();
    this.tempMatrix = new THREE.Matrix4();
  }
  
  /**
   * Check for collision between a vehicle and track barriers
   * @param {Object} vehicle - Vehicle object with position and size
   * @param {Array} barriers - Array of barrier objects
   * @returns {Object|null} Collision result or null if no collision
   */
  checkVehicleBarrierCollision(vehicle, barriers) {
    if (!vehicle || !barriers || barriers.length === 0) {
      return null;
    }
    
    // Get vehicle bounding box
    const vehicleBox = new THREE.Box3().setFromObject(vehicle.mesh);
    
    // Check collision with each barrier
    for (const barrier of barriers) {
      let collision = false;
      let collisionPoint = null;
      let collisionNormal = null;
      
      if (barrier.type === 'box') {
        // Create barrier bounding box
        const barrierBox = new THREE.Box3().setFromObject(barrier.mesh);
        
        // Check for intersection
        if (vehicleBox.intersectsBox(barrierBox)) {
          collision = true;
          
          // Calculate collision point (center of intersection)
          collisionPoint = new THREE.Vector3();
          vehicleBox.getCenter(collisionPoint);
          
          // Calculate collision normal (direction from barrier to vehicle)
          collisionNormal = new THREE.Vector3();
          barrierBox.getCenter(collisionNormal);
          collisionNormal.sub(collisionPoint).normalize().negate();
        }
      } else if (barrier.type === 'cylinder') {
        // For cylinder barriers, we need a more complex check
        // Get vehicle center
        const vehicleCenter = new THREE.Vector3();
        vehicleBox.getCenter(vehicleCenter);
        
        // Get barrier center
        const barrierCenter = new THREE.Vector3();
        barrier.mesh.getWorldPosition(barrierCenter);
        
        // Calculate distance from vehicle to barrier center (XZ plane only)
        const dx = vehicleCenter.x - barrierCenter.x;
        const dz = vehicleCenter.z - barrierCenter.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        // Check if vehicle is inside or outside the cylinder based on barrier type
        const vehicleRadius = Math.max(
          vehicleBox.max.x - vehicleBox.min.x,
          vehicleBox.max.z - vehicleBox.min.z
        ) / 2;
        
        // For inner barrier (vehicle should be outside)
        if (barrier.isInner && distance < barrier.radius + vehicleRadius) {
          collision = true;
          
          // Calculate collision normal (direction from barrier center to vehicle)
          collisionNormal = new THREE.Vector3(dx, 0, dz).normalize();
          
          // Calculate collision point
          collisionPoint = new THREE.Vector3()
            .copy(barrierCenter)
            .add(collisionNormal.clone().multiplyScalar(barrier.radius));
        }
        // For outer barrier (vehicle should be inside)
        else if (!barrier.isInner && distance > barrier.radius - vehicleRadius) {
          collision = true;
          
          // Calculate collision normal (direction from vehicle to barrier center)
          collisionNormal = new THREE.Vector3(dx, 0, dz).normalize().negate();
          
          // Calculate collision point
          collisionPoint = new THREE.Vector3()
            .copy(barrierCenter)
            .add(collisionNormal.clone().negate().multiplyScalar(barrier.radius));
        }
      }
      
      // If collision detected, return collision data
      if (collision) {
        return {
          collision: true,
          barrier: barrier,
          point: collisionPoint,
          normal: collisionNormal
        };
      }
    }
    
    // No collision
    return null;
  }
  
  /**
   * Check for collision between a vehicle and track checkpoints
   * @param {Object} vehicle - Vehicle object with position
   * @param {Array} checkpoints - Array of checkpoint objects
   * @param {number} nextCheckpointIndex - Index of the next checkpoint to check
   * @returns {Object|null} Checkpoint collision result or null if no collision
   */
  checkCheckpointCollision(vehicle, checkpoints, nextCheckpointIndex) {
    if (!vehicle || !checkpoints || checkpoints.length === 0) {
      return null;
    }
    
    // Get next checkpoint
    const checkpoint = checkpoints[nextCheckpointIndex];
    if (!checkpoint) {
      return null;
    }
    
    // Get vehicle position
    const vehiclePosition = new THREE.Vector3();
    vehicle.mesh.getWorldPosition(vehiclePosition);
    
    // Calculate distance to checkpoint
    const distance = vehiclePosition.distanceTo(checkpoint.position);
    
    // Check if vehicle is close enough to checkpoint
    if (distance < 10) { // Adjust threshold as needed
      return {
        checkpoint: checkpoint,
        index: nextCheckpointIndex,
        distance: distance
      };
    }
    
    // No collision
    return null;
  }
  
  /**
   * Cast rays from the vehicle to detect ground height
   * @param {Object} vehicle - Vehicle object
   * @param {THREE.Object3D} ground - Ground object
   * @param {number} numRays - Number of rays to cast
   * @returns {Array} Array of hit points
   */
  castGroundRays(vehicle, ground, numRays = 4) {
    if (!vehicle || !ground) {
      return [];
    }
    
    const hits = [];
    const vehiclePosition = new THREE.Vector3();
    vehicle.mesh.getWorldPosition(vehiclePosition);
    
    // Cast rays from vehicle corners
    const rayDirections = [
      new THREE.Vector3(1, 0, 1),   // Front right
      new THREE.Vector3(-1, 0, 1),  // Front left
      new THREE.Vector3(1, 0, -1),  // Rear right
      new THREE.Vector3(-1, 0, -1)  // Rear left
    ];
    
    for (let i = 0; i < numRays; i++) {
      // Get ray direction
      const direction = rayDirections[i % rayDirections.length].clone().normalize();
      
      // Set ray origin
      this.raycaster.set(
        vehiclePosition.clone().add(new THREE.Vector3(0, 1, 0)),
        new THREE.Vector3(0, -1, 0)
      );
      
      // Cast ray
      const intersects = this.raycaster.intersectObject(ground, true);
      
      // Check for intersection
      if (intersects.length > 0) {
        hits.push({
          point: intersects[0].point,
          distance: intersects[0].distance,
          normal: intersects[0].face ? intersects[0].face.normal : new THREE.Vector3(0, 1, 0)
        });
      }
    }
    
    return hits;
  }
  
  /**
   * Check if a point is inside a polygon (for complex track boundaries)
   * @param {THREE.Vector3} point - Point to check
   * @param {Array} polygon - Array of Vector3 points forming the polygon
   * @returns {boolean} True if point is inside polygon
   */
  isPointInPolygon(point, polygon) {
    // Ray casting algorithm
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const zi = polygon[i].z;
      const xj = polygon[j].x;
      const zj = polygon[j].z;
      
      const intersect = ((zi > point.z) !== (zj > point.z)) &&
        (point.x < (xj - xi) * (point.z - zi) / (zj - zi) + xi);
      
      if (intersect) {
        inside = !inside;
      }
    }
    
    return inside;
  }
}

export default CollisionDetection;
