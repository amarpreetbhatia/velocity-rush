import * as THREE from 'three';
import TrackSegment from './TrackSegment';

/**
 * CurveSegment class - A curved track segment
 */
class CurveSegment extends TrackSegment {
  constructor(options = {}) {
    super({
      radius: 40,
      angle: Math.PI / 2, // 90 degrees by default
      segments: 20,
      ...options
    });
  }
  
  /**
   * Create the curved track segment
   */
  createSegment() {
    const { width, radius, angle, segments, barrierHeight, barrierWidth, trackColor, barrierColor } = this.options;
    
    // Calculate curve parameters
    const innerRadius = radius - width / 2;
    const outerRadius = radius + width / 2;
    
    // Create track surface using shape and extrusion
    const trackShape = new THREE.Shape();
    trackShape.moveTo(innerRadius, 0);
    trackShape.lineTo(outerRadius, 0);
    trackShape.absarc(0, 0, outerRadius, 0, angle, false);
    trackShape.lineTo(innerRadius * Math.cos(angle), innerRadius * Math.sin(angle));
    trackShape.absarc(0, 0, innerRadius, angle, 0, true);
    
    const extrudeSettings = {
      steps: segments,
      depth: 0.1,
      bevelEnabled: false
    };
    
    const trackGeometry = new THREE.ExtrudeGeometry(trackShape, extrudeSettings);
    trackGeometry.rotateX(-Math.PI / 2);
    
    const trackMaterial = new THREE.MeshStandardMaterial({
      color: trackColor,
      map: this.trackTextures.diffuse,
      normalMap: this.trackTextures.normal,
      roughnessMap: this.trackTextures.roughness,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const track = new THREE.Mesh(trackGeometry, trackMaterial);
    track.position.y = 0.01; // Slightly above ground to prevent z-fighting
    track.receiveShadow = true;
    this.group.add(track);
    
    // Create inner barrier
    const innerBarrierGeometry = new THREE.CylinderGeometry(
      innerRadius - barrierWidth / 2,
      innerRadius - barrierWidth / 2,
      barrierHeight,
      segments,
      1,
      true,
      0,
      angle
    );
    
    const barrierMaterial = new THREE.MeshStandardMaterial({
      color: barrierColor,
      map: this.barrierTextures.diffuse,
      normalMap: this.barrierTextures.normal,
      roughnessMap: this.barrierTextures.roughness,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const innerBarrier = new THREE.Mesh(innerBarrierGeometry, barrierMaterial);
    innerBarrier.position.set(0, barrierHeight / 2, 0);
    innerBarrier.castShadow = true;
    innerBarrier.receiveShadow = true;
    this.group.add(innerBarrier);
    
    // Add inner barrier collider
    this.colliders.push({
      type: 'cylinder',
      mesh: innerBarrier,
      radius: innerRadius - barrierWidth / 2,
      height: barrierHeight,
      angle: angle
    });
    
    // Create outer barrier
    const outerBarrierGeometry = new THREE.CylinderGeometry(
      outerRadius + barrierWidth / 2,
      outerRadius + barrierWidth / 2,
      barrierHeight,
      segments,
      1,
      true,
      0,
      angle
    );
    
    const outerBarrier = new THREE.Mesh(outerBarrierGeometry, barrierMaterial);
    outerBarrier.position.set(0, barrierHeight / 2, 0);
    outerBarrier.castShadow = true;
    outerBarrier.receiveShadow = true;
    this.group.add(outerBarrier);
    
    // Add outer barrier collider
    this.colliders.push({
      type: 'cylinder',
      mesh: outerBarrier,
      radius: outerRadius + barrierWidth / 2,
      height: barrierHeight,
      angle: angle
    });
    
    // Set entry and exit points
    this.entry = new THREE.Vector3(radius, 0, 0);
    this.exit = new THREE.Vector3(
      radius * Math.cos(angle),
      0,
      radius * Math.sin(angle)
    );
    
    // Set entry and exit directions
    this.entryDirection = new THREE.Vector3(0, 0, 1);
    this.exitDirection = new THREE.Vector3(
      Math.sin(angle),
      0,
      Math.cos(angle)
    );
    
    // Rotate the group to align entry with z-axis
    this.group.rotation.y = -Math.PI / 2;
    
    // Update entry and exit points after rotation
    const rotationMatrix = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
    this.entry.applyMatrix4(rotationMatrix);
    this.exit.applyMatrix4(rotationMatrix);
    this.entryDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
    this.exitDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);
  }
}

export default CurveSegment;
