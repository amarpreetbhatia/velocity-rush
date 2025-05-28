import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * EnvironmentObject class - Base class for environmental objects
 */
class EnvironmentObject {
  constructor(options = {}) {
    this.options = {
      position: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
      castShadow: true,
      receiveShadow: true,
      ...options
    };
    
    this.object = null;
    this.loaded = false;
    this.onLoadCallbacks = [];
  }
  
  /**
   * Load a 3D model
   * @param {string} modelPath - Path to the model file
   * @returns {Promise} Promise that resolves when the model is loaded
   */
  loadModel(modelPath) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader();
      
      loader.load(
        modelPath,
        (gltf) => {
          this.object = gltf.scene;
          
          // Apply position, rotation, and scale
          this.object.position.copy(this.options.position);
          this.object.rotation.copy(this.options.rotation);
          this.object.scale.copy(this.options.scale);
          
          // Apply shadows
          this.object.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = this.options.castShadow;
              child.receiveShadow = this.options.receiveShadow;
            }
          });
          
          this.loaded = true;
          
          // Call onLoad callbacks
          this.onLoadCallbacks.forEach(callback => callback(this.object));
          
          resolve(this.object);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }
  
  /**
   * Create a simple geometry object
   * @param {THREE.BufferGeometry} geometry - Three.js geometry
   * @param {THREE.Material} material - Three.js material
   */
  createGeometry(geometry, material) {
    this.object = new THREE.Mesh(geometry, material);
    
    // Apply position, rotation, and scale
    this.object.position.copy(this.options.position);
    this.object.rotation.copy(this.options.rotation);
    this.object.scale.copy(this.options.scale);
    
    // Apply shadows
    this.object.castShadow = this.options.castShadow;
    this.object.receiveShadow = this.options.receiveShadow;
    
    this.loaded = true;
    
    // Call onLoad callbacks
    this.onLoadCallbacks.forEach(callback => callback(this.object));
    
    return this.object;
  }
  
  /**
   * Register a callback to be called when the object is loaded
   * @param {Function} callback - Function to call with the loaded object
   */
  onLoad(callback) {
    if (this.loaded && this.object) {
      callback(this.object);
    } else {
      this.onLoadCallbacks.push(callback);
    }
  }
  
  /**
   * Get the object
   * @returns {THREE.Object3D} The object
   */
  getObject() {
    return this.object;
  }
  
  /**
   * Set the position of the object
   * @param {THREE.Vector3} position - New position
   */
  setPosition(position) {
    this.options.position.copy(position);
    
    if (this.object) {
      this.object.position.copy(position);
    }
  }
  
  /**
   * Set the rotation of the object
   * @param {THREE.Euler} rotation - New rotation
   */
  setRotation(rotation) {
    this.options.rotation.copy(rotation);
    
    if (this.object) {
      this.object.rotation.copy(rotation);
    }
  }
  
  /**
   * Set the scale of the object
   * @param {THREE.Vector3} scale - New scale
   */
  setScale(scale) {
    this.options.scale.copy(scale);
    
    if (this.object) {
      this.object.scale.copy(scale);
    }
  }
}

/**
 * Tree class - A tree environment object
 */
export class Tree extends EnvironmentObject {
  constructor(options = {}) {
    super({
      scale: new THREE.Vector3(0.8, 0.8, 0.8),
      ...options
    });
    
    // Load tree model
    this.loadModel('/assets/models/tree.glb');
  }
}

/**
 * Rock class - A rock environment object
 */
export class Rock extends EnvironmentObject {
  constructor(options = {}) {
    super({
      scale: new THREE.Vector3(1, 1, 1),
      ...options
    });
    
    // Load rock model
    this.loadModel('/assets/models/rock.glb');
  }
}

/**
 * Building class - A building environment object
 */
export class Building extends EnvironmentObject {
  constructor(options = {}) {
    super({
      scale: new THREE.Vector3(1, 1, 1),
      ...options
    });
    
    // Create simple building geometry
    const geometry = new THREE.BoxGeometry(
      options.width || 20,
      options.height || 40,
      options.depth || 20
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: options.color || 0x888888,
      roughness: 0.7,
      metalness: 0.3
    });
    
    this.createGeometry(geometry, material);
  }
}

/**
 * Mountain class - A mountain environment object
 */
export class Mountain extends EnvironmentObject {
  constructor(options = {}) {
    super({
      scale: new THREE.Vector3(1, 1, 1),
      ...options
    });
    
    // Create simple mountain geometry
    const geometry = new THREE.ConeGeometry(
      options.radius || 50,
      options.height || 100,
      options.segments || 8
    );
    
    const material = new THREE.MeshStandardMaterial({
      color: options.color || 0x888888,
      roughness: 0.9,
      metalness: 0.1
    });
    
    this.createGeometry(geometry, material);
  }
}

export default EnvironmentObject;
