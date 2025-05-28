/**
 * Vehicle physics simulation for Velocity Rush
 * Handles acceleration, braking, steering, and suspension
 */

import { Vector3, Quaternion, Raycaster } from 'three';

class VehiclePhysics {
  constructor(vehicleConfig) {
    // Vehicle properties
    this.config = {
      // Engine properties
      maxSpeed: 200, // km/h
      acceleration: 10, // m/s²
      deceleration: 5, // m/s²
      braking: 15, // m/s²
      
      // Steering properties
      maxSteeringAngle: Math.PI / 6, // 30 degrees
      steeringSpeed: 2.5, // How quickly steering responds
      steeringReturn: 1.0, // How quickly steering returns to center
      
      // Suspension properties
      suspensionHeight: 0.5, // meters
      suspensionStiffness: 10.0,
      suspensionDamping: 0.8,
      suspensionTravel: 0.3, // meters
      
      // Physics properties
      mass: 1200, // kg
      dragCoefficient: 0.3,
      rollingResistance: 0.1,
      
      // Wheel properties
      wheelBase: 2.8, // meters (distance between front and rear axles)
      trackWidth: 1.6, // meters (distance between left and right wheels)
      wheelRadius: 0.35, // meters
      
      // Override with provided config
      ...vehicleConfig
    };
    
    // Current state
    this.state = {
      position: new Vector3(0, this.config.suspensionHeight, 0),
      rotation: new Quaternion(),
      velocity: new Vector3(0, 0, 0),
      angularVelocity: new Vector3(0, 0, 0),
      
      // Control inputs (range: -1 to 1)
      throttle: 0,
      brake: 0,
      steering: 0,
      
      // Wheel states
      wheels: [
        { // Front Left
          position: new Vector3(-this.config.trackWidth/2, 0, this.config.wheelBase/2),
          onGround: false,
          suspensionForce: 0,
          rotation: 0
        },
        { // Front Right
          position: new Vector3(this.config.trackWidth/2, 0, this.config.wheelBase/2),
          onGround: false,
          suspensionForce: 0,
          rotation: 0
        },
        { // Rear Left
          position: new Vector3(-this.config.trackWidth/2, 0, -this.config.wheelBase/2),
          onGround: false,
          suspensionForce: 0,
          rotation: 0
        },
        { // Rear Right
          position: new Vector3(this.config.trackWidth/2, 0, -this.config.wheelBase/2),
          onGround: false,
          suspensionForce: 0,
          rotation: 0
        }
      ],
      
      // Performance metrics
      speedKmh: 0,
      rpm: 0,
      gear: 1
    };
    
    this.raycaster = new Raycaster();
  }
  
  /**
   * Set control inputs for the vehicle
   * @param {Object} controls - Control inputs (throttle, brake, steering)
   */
  setControls(controls) {
    if (controls.throttle !== undefined) {
      this.state.throttle = Math.max(-1, Math.min(1, controls.throttle));
    }
    
    if (controls.brake !== undefined) {
      this.state.brake = Math.max(0, Math.min(1, controls.brake));
    }
    
    if (controls.steering !== undefined) {
      // Target steering angle
      const targetSteering = Math.max(-1, Math.min(1, controls.steering));
      
      // Gradually adjust steering toward target
      if (this.state.steering < targetSteering) {
        this.state.steering = Math.min(targetSteering, 
          this.state.steering + this.config.steeringSpeed * 0.016); // Assuming 60fps
      } else if (this.state.steering > targetSteering) {
        this.state.steering = Math.max(targetSteering, 
          this.state.steering - this.config.steeringSpeed * 0.016);
      }
    }
  }
  
  /**
   * Update vehicle physics
   * @param {number} deltaTime - Time since last update in seconds
   * @param {Function} getHeightAt - Function to get terrain height at a position
   */
  update(deltaTime, getHeightAt) {
    // Cap delta time to avoid instability at low framerates
    const dt = Math.min(deltaTime, 0.1);
    
    // Calculate forces
    this.updateSuspension(getHeightAt);
    this.applyForces(dt);
    
    // Update position and rotation
    this.state.position.add(this.state.velocity.clone().multiplyScalar(dt));
    
    // Apply angular velocity to rotation
    const angularDelta = this.state.angularVelocity.clone().multiplyScalar(dt);
    const rotationDelta = new Quaternion()
      .setFromAxisAngle(new Vector3(1, 0, 0), angularDelta.x)
      .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), angularDelta.y))
      .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), angularDelta.z));
    
    this.state.rotation.premultiply(rotationDelta);
    this.state.rotation.normalize();
    
    // Update wheel rotation based on speed
    const wheelCircumference = 2 * Math.PI * this.config.wheelRadius;
    const wheelRotationPerMeter = (2 * Math.PI) / wheelCircumference;
    const distanceTraveled = this.state.velocity.length() * dt;
    
    for (const wheel of this.state.wheels) {
      if (wheel.onGround) {
        wheel.rotation += distanceTraveled * wheelRotationPerMeter;
      }
    }
    
    // Update performance metrics
    this.state.speedKmh = this.state.velocity.length() * 3.6; // m/s to km/h
    
    // Simple gear and RPM simulation
    const gearRatios = [2.66, 1.78, 1.3, 1, 0.74, 0.5];
    const finalDrive = 3.42;
    
    // Determine gear based on speed
    this.state.gear = 1;
    for (let i = 1; i < gearRatios.length; i++) {
      if (this.state.speedKmh > i * 30) {
        this.state.gear = i + 1;
      }
    }
    
    // Calculate RPM
    const wheelRpm = (this.state.speedKmh / 3.6) * 60 / wheelCircumference;
    this.state.rpm = wheelRpm * gearRatios[this.state.gear - 1] * finalDrive;
    
    // Limit RPM to realistic range
    this.state.rpm = Math.max(800, Math.min(8000, this.state.rpm));
  }
  
  /**
   * Update suspension forces based on terrain
   * @param {Function} getHeightAt - Function to get terrain height at a position
   */
  updateSuspension(getHeightAt) {
    const forwardDir = new Vector3(0, 0, 1).applyQuaternion(this.state.rotation);
    const rightDir = new Vector3(1, 0, 0).applyQuaternion(this.state.rotation);
    const upDir = new Vector3(0, 1, 0).applyQuaternion(this.state.rotation);
    
    // Check each wheel
    for (const wheel of this.state.wheels) {
      // Calculate world position of wheel
      const wheelPos = wheel.position.clone()
        .applyQuaternion(this.state.rotation)
        .add(this.state.position);
      
      // Cast ray downward to find ground
      this.raycaster.set(
        wheelPos.clone().add(upDir.clone().multiplyScalar(0.1)), // Start slightly above wheel
        upDir.clone().negate() // Cast downward
      );
      
      // Use getHeightAt function if provided, otherwise assume flat ground at y=0
      let groundHeight = 0;
      if (getHeightAt) {
        groundHeight = getHeightAt(wheelPos.x, wheelPos.z);
      }
      
      // Calculate suspension compression
      const restHeight = this.config.suspensionHeight;
      const rayLength = this.config.suspensionHeight + this.config.suspensionTravel;
      const distanceToGround = wheelPos.y - groundHeight;
      
      if (distanceToGround < rayLength) {
        wheel.onGround = true;
        
        // Calculate suspension force using spring-damper model
        const compressionRatio = 1 - (distanceToGround / restHeight);
        const springForce = compressionRatio * this.config.suspensionStiffness * this.config.mass * 9.81 / 4;
        
        // Apply damping based on vertical velocity
        const verticalVelocity = this.state.velocity.dot(upDir);
        const dampingForce = verticalVelocity * this.config.suspensionDamping;
        
        wheel.suspensionForce = Math.max(0, springForce - dampingForce);
      } else {
        wheel.onGround = false;
        wheel.suspensionForce = 0;
      }
    }
  }
  
  /**
   * Apply all forces to the vehicle
   * @param {number} dt - Delta time in seconds
   */
  applyForces(dt) {
    const forwardDir = new Vector3(0, 0, 1).applyQuaternion(this.state.rotation);
    const rightDir = new Vector3(1, 0, 0).applyQuaternion(this.state.rotation);
    const upDir = new Vector3(0, 1, 0).applyQuaternion(this.state.rotation);
    
    // Gravity
    const gravity = new Vector3(0, -9.81 * this.config.mass, 0);
    
    // Suspension forces
    let totalSuspensionForce = new Vector3(0, 0, 0);
    let wheelsOnGround = 0;
    
    for (const wheel of this.state.wheels) {
      if (wheel.onGround) {
        wheelsOnGround++;
        totalSuspensionForce.add(upDir.clone().multiplyScalar(wheel.suspensionForce));
      }
    }
    
    // Engine force
    let engineForce = new Vector3(0, 0, 0);
    if (wheelsOnGround > 0) {
      // Only apply engine force if at least one wheel is on the ground
      engineForce = forwardDir.clone().multiplyScalar(
        this.state.throttle * this.config.acceleration * this.config.mass
      );
    }
    
    // Braking force
    let brakeForce = new Vector3(0, 0, 0);
    if (this.state.brake > 0 && this.state.velocity.lengthSq() > 0.1) {
      const velDir = this.state.velocity.clone().normalize();
      brakeForce = velDir.clone().multiplyScalar(
        -this.state.brake * this.config.braking * this.config.mass
      );
    }
    
    // Steering force
    let steeringTorque = new Vector3(0, 0, 0);
    if (Math.abs(this.state.steering) > 0.01 && wheelsOnGround > 0) {
      const steeringAngle = this.state.steering * this.config.maxSteeringAngle;
      steeringTorque = upDir.clone().multiplyScalar(
        steeringAngle * this.state.velocity.length() * 0.5
      );
    }
    
    // Drag force (air resistance)
    const velocitySq = this.state.velocity.lengthSq();
    let dragForce = new Vector3(0, 0, 0);
    if (velocitySq > 0.1) {
      const velDir = this.state.velocity.clone().normalize();
      dragForce = velDir.clone().multiplyScalar(
        -this.config.dragCoefficient * velocitySq
      );
    }
    
    // Rolling resistance
    let rollingResistance = new Vector3(0, 0, 0);
    if (velocitySq > 0.1 && wheelsOnGround > 0) {
      const velDir = this.state.velocity.clone().normalize();
      rollingResistance = velDir.clone().multiplyScalar(
        -this.config.rollingResistance * this.config.mass * 9.81
      );
    }
    
    // Sum all forces
    const totalForce = new Vector3(0, 0, 0)
      .add(gravity)
      .add(totalSuspensionForce)
      .add(engineForce)
      .add(brakeForce)
      .add(dragForce)
      .add(rollingResistance);
    
    // Apply force to velocity (F = ma, so a = F/m)
    const acceleration = totalForce.clone().divideScalar(this.config.mass);
    this.state.velocity.add(acceleration.clone().multiplyScalar(dt));
    
    // Apply steering torque to angular velocity
    this.state.angularVelocity.add(steeringTorque.clone().multiplyScalar(dt));
    
    // Apply natural steering return
    if (Math.abs(this.state.steering) > 0.01 && wheelsOnGround > 0) {
      this.state.steering *= (1 - this.config.steeringReturn * dt);
      if (Math.abs(this.state.steering) < 0.01) {
        this.state.steering = 0;
      }
    }
    
    // Apply angular damping
    this.state.angularVelocity.multiplyScalar(0.95);
  }
  
  /**
   * Get the vehicle's current transform data for rendering
   * @returns {Object} Transform data
   */
  getTransform() {
    return {
      position: this.state.position.clone(),
      rotation: this.state.rotation.clone(),
      wheels: this.state.wheels.map(wheel => ({
        position: wheel.position.clone(),
        rotation: wheel.rotation,
        steering: wheel.position.z > 0 ? this.state.steering : 0 // Only front wheels steer
      }))
    };
  }
  
  /**
   * Get the vehicle's current performance metrics
   * @returns {Object} Performance data
   */
  getPerformanceMetrics() {
    return {
      speedKmh: this.state.speedKmh,
      rpm: this.state.rpm,
      gear: this.state.gear,
      wheelsOnGround: this.state.wheels.filter(w => w.onGround).length
    };
  }
}

export default VehiclePhysics;
