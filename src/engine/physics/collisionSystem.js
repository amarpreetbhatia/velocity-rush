/**
 * Collision detection and response system for Velocity Rush
 * Handles vehicle-to-vehicle and vehicle-to-environment collisions
 */

import { Vector3, Box3, Sphere } from 'three';

class CollisionSystem {
  constructor() {
    this.colliders = [];
    this.staticColliders = [];
  }

  /**
   * Register a dynamic object (like vehicles) for collision detection
   * @param {Object} object - The object to register
   * @param {Function} onCollision - Callback when collision occurs
   */
  registerCollider(object, onCollision) {
    if (!object.userData) object.userData = {};
    object.userData.collider = {
      boundingBox: new Box3().setFromObject(object),
      boundingSphere: new Sphere(),
      onCollision: onCollision || this.defaultCollisionResponse,
    };
    
    // Calculate bounding sphere from bounding box
    object.userData.collider.boundingBox.getBoundingSphere(
      object.userData.collider.boundingSphere
    );
    
    this.colliders.push(object);
    return object;
  }

  /**
   * Register a static object (like track boundaries) for collision detection
   * @param {Object} object - The static object to register
   */
  registerStaticCollider(object) {
    if (!object.userData) object.userData = {};
    object.userData.collider = {
      boundingBox: new Box3().setFromObject(object),
      boundingSphere: new Sphere(),
      isStatic: true,
    };
    
    // Calculate bounding sphere from bounding box
    object.userData.collider.boundingBox.getBoundingSphere(
      object.userData.collider.boundingSphere
    );
    
    this.staticColliders.push(object);
    return object;
  }

  /**
   * Update collision data for a specific object
   * @param {Object} object - The object to update
   */
  updateCollider(object) {
    if (object.userData && object.userData.collider) {
      object.userData.collider.boundingBox.setFromObject(object);
      object.userData.collider.boundingBox.getBoundingSphere(
        object.userData.collider.boundingSphere
      );
    }
  }

  /**
   * Default collision response
   * @param {Object} self - The object itself
   * @param {Object} other - The object collided with
   * @param {Vector3} collisionPoint - Point of collision
   * @param {Vector3} collisionNormal - Normal vector at collision point
   */
  defaultCollisionResponse(self, other, collisionPoint, collisionNormal) {
    // Basic elastic collision response
    if (self.userData.physics && other.userData.physics) {
      const v1 = self.userData.physics.velocity;
      const v2 = other.userData.physics.velocity || new Vector3();
      const m1 = self.userData.physics.mass || 1;
      const m2 = other.userData.physics.mass || Infinity; // Static objects have infinite mass
      
      // Calculate new velocities (simplified elastic collision)
      if (m2 < Infinity) {
        // Dynamic-to-dynamic collision
        const v1Final = v1.clone().sub(
          collisionNormal.clone().multiplyScalar(
            2 * m2 / (m1 + m2) * v1.clone().sub(v2).dot(collisionNormal)
          )
        );
        
        const v2Final = v2.clone().sub(
          collisionNormal.clone().multiplyScalar(
            2 * m1 / (m1 + m2) * v2.clone().sub(v1).dot(collisionNormal)
          )
        );
        
        self.userData.physics.velocity.copy(v1Final.multiplyScalar(0.8)); // Add some energy loss
        other.userData.physics.velocity.copy(v2Final.multiplyScalar(0.8)); // Add some energy loss
      } else {
        // Dynamic-to-static collision
        const reflection = v1.clone().reflect(collisionNormal).multiplyScalar(0.5); // More energy loss for wall collisions
        self.userData.physics.velocity.copy(reflection);
      }
    }
  }

  /**
   * Check for collisions between all registered objects
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Update all dynamic colliders
    for (const object of this.colliders) {
      this.updateCollider(object);
    }
    
    // Check dynamic-to-dynamic collisions
    for (let i = 0; i < this.colliders.length; i++) {
      const objA = this.colliders[i];
      
      // Check against other dynamic objects
      for (let j = i + 1; j < this.colliders.length; j++) {
        const objB = this.colliders[j];
        
        // Quick sphere-sphere test first (broad phase)
        if (objA.userData.collider.boundingSphere.intersectsSphere(
          objB.userData.collider.boundingSphere
        )) {
          // More precise box-box test (narrow phase)
          if (objA.userData.collider.boundingBox.intersectsBox(
            objB.userData.collider.boundingBox
          )) {
            // Calculate collision details
            const collisionPoint = new Vector3();
            objA.userData.collider.boundingSphere.center.clone().add(
              objB.userData.collider.boundingSphere.center
            ).multiplyScalar(0.5);
            
            const collisionNormal = new Vector3().subVectors(
              objB.userData.collider.boundingSphere.center,
              objA.userData.collider.boundingSphere.center
            ).normalize();
            
            // Trigger collision callbacks
            if (objA.userData.collider.onCollision) {
              objA.userData.collider.onCollision(objA, objB, collisionPoint, collisionNormal);
            }
            
            if (objB.userData.collider.onCollision) {
              objB.userData.collider.onCollision(objB, objA, collisionPoint, collisionNormal.clone().negate());
            }
          }
        }
      }
      
      // Check against static objects
      for (const staticObj of this.staticColliders) {
        // Quick sphere-sphere test first
        if (objA.userData.collider.boundingSphere.intersectsSphere(
          staticObj.userData.collider.boundingSphere
        )) {
          // More precise box-box test
          if (objA.userData.collider.boundingBox.intersectsBox(
            staticObj.userData.collider.boundingBox
          )) {
            // Calculate collision details
            const collisionPoint = new Vector3();
            objA.userData.collider.boundingSphere.center.clone().add(
              staticObj.userData.collider.boundingSphere.center
            ).multiplyScalar(0.5);
            
            const collisionNormal = new Vector3().subVectors(
              staticObj.userData.collider.boundingSphere.center,
              objA.userData.collider.boundingSphere.center
            ).normalize();
            
            // Trigger collision callback
            if (objA.userData.collider.onCollision) {
              objA.userData.collider.onCollision(objA, staticObj, collisionPoint, collisionNormal);
            }
          }
        }
      }
    }
  }
}

export default CollisionSystem;
