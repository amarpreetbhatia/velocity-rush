import * as THREE from 'three';
import TrackSegment from './TrackSegment';

/**
 * RampSegment class - A ramp track segment with elevation change
 */
class RampSegment extends TrackSegment {
  constructor(options = {}) {
    super({
      height: 10, // Height of the ramp
      ...options
    });
  }
  
  /**
   * Create the ramp track segment
   */
  createSegment() {
    const { width, length, height, barrierHeight, barrierWidth, trackColor, barrierColor } = this.options;
    
    // Create track surface using shape and extrusion
    const trackShape = new THREE.Shape();
    trackShape.moveTo(-width / 2, 0);
    trackShape.lineTo(width / 2, 0);
    trackShape.lineTo(width / 2, length);
    trackShape.lineTo(-width / 2, length);
    trackShape.lineTo(-width / 2, 0);
    
    // Create path for extrusion
    const extrudePath = new THREE.LineCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height, 0)
    );
    
    const extrudeSettings = {
      steps: 20,
      bevelEnabled: false,
      extrudePath: extrudePath
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
    
    // Create left barrier
    const leftBarrierShape = new THREE.Shape();
    leftBarrierShape.moveTo(0, 0);
    leftBarrierShape.lineTo(barrierWidth, 0);
    leftBarrierShape.lineTo(barrierWidth, length);
    leftBarrierShape.lineTo(0, length);
    leftBarrierShape.lineTo(0, 0);
    
    // Create path for left barrier extrusion
    const leftBarrierPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height, 0)
    ]);
    
    const leftBarrierExtrudeSettings = {
      steps: 20,
      bevelEnabled: false,
      extrudePath: leftBarrierPath
    };
    
    const leftBarrierGeometry = new THREE.ExtrudeGeometry(leftBarrierShape, leftBarrierExtrudeSettings);
    leftBarrierGeometry.rotateX(-Math.PI / 2);
    
    const barrierMaterial = new THREE.MeshStandardMaterial({
      color: barrierColor,
      map: this.barrierTextures.diffuse,
      normalMap: this.barrierTextures.normal,
      roughnessMap: this.barrierTextures.roughness,
      roughness: 0.5,
      metalness: 0.3
    });
    
    const leftBarrier = new THREE.Mesh(leftBarrierGeometry, barrierMaterial);
    leftBarrier.position.set(-width / 2 - barrierWidth, 0, 0);
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
    const rightBarrierShape = new THREE.Shape();
    rightBarrierShape.moveTo(0, 0);
    rightBarrierShape.lineTo(barrierWidth, 0);
    rightBarrierShape.lineTo(barrierWidth, length);
    rightBarrierShape.lineTo(0, length);
    rightBarrierShape.lineTo(0, 0);
    
    // Create path for right barrier extrusion
    const rightBarrierPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, height, 0)
    ]);
    
    const rightBarrierExtrudeSettings = {
      steps: 20,
      bevelEnabled: false,
      extrudePath: rightBarrierPath
    };
    
    const rightBarrierGeometry = new THREE.ExtrudeGeometry(rightBarrierShape, rightBarrierExtrudeSettings);
    rightBarrierGeometry.rotateX(-Math.PI / 2);
    
    const rightBarrier = new THREE.Mesh(rightBarrierGeometry, barrierMaterial);
    rightBarrier.position.set(width / 2, 0, 0);
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
    this.exit = new THREE.Vector3(0, height, length / 2);
    this.entryDirection = new THREE.Vector3(0, 0, 1);
    this.exitDirection = new THREE.Vector3(0, 0, 1);
  }
}

export default RampSegment;
