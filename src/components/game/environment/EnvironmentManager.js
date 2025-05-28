import * as THREE from 'three';
import Skybox from './Skybox';

/**
 * EnvironmentManager class - Manages environmental elements
 */
class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.skybox = null;
    this.ground = null;
    this.environmentObjects = [];
    this.fogEnabled = false;
  }
  
  /**
   * Initialize the environment
   * @param {Object} options - Environment options
   */
  init(options = {}) {
    const defaultOptions = {
      skyboxType: 'daytime',
      groundSize: 2000,
      groundColor: 0x1a5c1a,
      fogColor: 0xc8d8e6,
      fogDensity: 0.002
    };
    
    const config = { ...defaultOptions, ...options };
    
    // Create skybox
    this.createSkybox(config.skyboxType);
    
    // Create ground
    this.createGround(config.groundSize, config.groundColor);
    
    // Set up fog
    if (config.fogEnabled) {
      this.enableFog(config.fogColor, config.fogDensity);
    }
  }
  
  /**
   * Create the skybox
   * @param {string} type - Skybox type
   */
  createSkybox(type) {
    // Remove existing skybox if any
    if (this.skybox) {
      this.scene.remove(this.skybox.getMesh());
    }
    
    // Create new skybox
    this.skybox = new Skybox({ type });
    this.scene.add(this.skybox.getMesh());
  }
  
  /**
   * Create the ground
   * @param {number} size - Ground size
   * @param {number} color - Ground color
   */
  createGround(size, color) {
    // Remove existing ground if any
    if (this.ground) {
      this.scene.remove(this.ground);
    }
    
    // Load ground textures
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('/assets/textures/ground_diffuse.jpg');
    const groundNormalMap = textureLoader.load('/assets/textures/ground_normal.jpg');
    const groundRoughnessMap = textureLoader.load('/assets/textures/ground_roughness.jpg');
    
    // Set texture properties
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundNormalMap.wrapS = groundNormalMap.wrapT = THREE.RepeatWrapping;
    groundRoughnessMap.wrapS = groundRoughnessMap.wrapT = THREE.RepeatWrapping;
    
    const repeat = size / 20;
    groundTexture.repeat.set(repeat, repeat);
    groundNormalMap.repeat.set(repeat, repeat);
    groundRoughnessMap.repeat.set(repeat, repeat);
    
    // Create ground geometry and material
    const groundGeometry = new THREE.PlaneGeometry(size, size);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color,
      map: groundTexture,
      normalMap: groundNormalMap,
      roughnessMap: groundRoughnessMap,
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Create ground mesh
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);
  }
  
  /**
   * Enable fog
   * @param {number} color - Fog color
   * @param {number} density - Fog density
   */
  enableFog(color, density) {
    this.scene.fog = new THREE.FogExp2(color, density);
    this.fogEnabled = true;
  }
  
  /**
   * Disable fog
   */
  disableFog() {
    this.scene.fog = null;
    this.fogEnabled = false;
  }
  
  /**
   * Add trees to the environment
   * @param {number} count - Number of trees to add
   * @param {number} radius - Radius around the center to place trees
   */
  addTrees(count, radius) {
    // Load tree model
    const loader = new THREE.GLTFLoader();
    loader.load('/assets/models/tree.glb', (gltf) => {
      const treeModel = gltf.scene;
      
      // Create trees
      for (let i = 0; i < count; i++) {
        // Clone the tree model
        const tree = treeModel.clone();
        
        // Random position within radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;
        
        // Position the tree
        tree.position.set(x, 0, z);
        
        // Random scale
        const scale = 0.8 + Math.random() * 0.4;
        tree.scale.set(scale, scale, scale);
        
        // Random rotation
        tree.rotation.y = Math.random() * Math.PI * 2;
        
        // Enable shadows
        tree.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        // Add to scene
        this.scene.add(tree);
        this.environmentObjects.push(tree);
      }
    });
  }
  
  /**
   * Add mountains to the environment
   * @param {number} count - Number of mountains to add
   * @param {number} radius - Radius around the center to place mountains
   */
  addMountains(count, radius) {
    // Create mountain geometry
    const mountainGeometry = new THREE.ConeGeometry(50, 100, 8);
    const mountainMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.9,
      metalness: 0.1
    });
    
    // Create mountains
    for (let i = 0; i < count; i++) {
      // Create mountain mesh
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      
      // Random position outside radius
      const angle = Math.random() * Math.PI * 2;
      const distance = radius + Math.random() * 200;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Position the mountain
      mountain.position.set(x, 0, z);
      
      // Random scale
      const scaleX = 1 + Math.random() * 2;
      const scaleY = 1 + Math.random() * 3;
      const scaleZ = 1 + Math.random() * 2;
      mountain.scale.set(scaleX, scaleY, scaleZ);
      
      // Enable shadows
      mountain.castShadow = true;
      mountain.receiveShadow = true;
      
      // Add to scene
      this.scene.add(mountain);
      this.environmentObjects.push(mountain);
    }
  }
  
  /**
   * Add buildings to the environment
   * @param {number} count - Number of buildings to add
   * @param {number} radius - Radius around the center to place buildings
   */
  addBuildings(count, radius) {
    // Create building geometries
    const buildingGeometries = [
      new THREE.BoxGeometry(20, 40, 20),
      new THREE.BoxGeometry(15, 60, 15),
      new THREE.BoxGeometry(30, 30, 30),
      new THREE.BoxGeometry(25, 50, 25)
    ];
    
    // Create building materials
    const buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.7, metalness: 0.3 }),
      new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.7, metalness: 0.3 })
    ];
    
    // Create buildings
    for (let i = 0; i < count; i++) {
      // Random geometry and material
      const geometryIndex = Math.floor(Math.random() * buildingGeometries.length);
      const materialIndex = Math.floor(Math.random() * buildingMaterials.length);
      
      // Create building mesh
      const building = new THREE.Mesh(
        buildingGeometries[geometryIndex],
        buildingMaterials[materialIndex]
      );
      
      // Random position outside radius
      const angle = Math.random() * Math.PI * 2;
      const distance = radius + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      
      // Position the building
      building.position.set(x, building.geometry.parameters.height / 2, z);
      
      // Random rotation
      building.rotation.y = Math.random() * Math.PI * 2;
      
      // Enable shadows
      building.castShadow = true;
      building.receiveShadow = true;
      
      // Add to scene
      this.scene.add(building);
      this.environmentObjects.push(building);
    }
  }
  
  /**
   * Clear all environment objects
   */
  clearEnvironmentObjects() {
    // Remove all environment objects from the scene
    for (const object of this.environmentObjects) {
      this.scene.remove(object);
    }
    
    // Clear the array
    this.environmentObjects = [];
  }
  
  /**
   * Update the environment
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Update environment objects if needed
    // For example, animate trees swaying in the wind
  }
}

export default EnvironmentManager;
