import * as THREE from 'three';

/**
 * Skybox class - Creates a skybox for the scene
 */
class Skybox {
  constructor(options = {}) {
    this.options = {
      size: 1000,
      type: 'daytime', // 'daytime', 'sunset', 'night', 'cloudy'
      ...options
    };
    
    this.mesh = null;
    this.createSkybox();
  }
  
  /**
   * Create the skybox
   */
  createSkybox() {
    const { size, type } = this.options;
    
    // Load skybox textures
    const textureLoader = new THREE.CubeTextureLoader();
    textureLoader.setPath(`/assets/textures/skybox/${type}/`);
    
    const textureCube = textureLoader.load([
      'px.jpg', 'nx.jpg',
      'py.jpg', 'ny.jpg',
      'pz.jpg', 'nz.jpg'
    ]);
    
    // Create skybox geometry
    const geometry = new THREE.BoxGeometry(size, size, size);
    
    // Create skybox material
    const material = new THREE.MeshBasicMaterial({
      envMap: textureCube,
      side: THREE.BackSide
    });
    
    // Create skybox mesh
    this.mesh = new THREE.Mesh(geometry, material);
  }
  
  /**
   * Get the skybox mesh
   * @returns {THREE.Mesh} The skybox mesh
   */
  getMesh() {
    return this.mesh;
  }
  
  /**
   * Change the skybox type
   * @param {string} type - The skybox type ('daytime', 'sunset', 'night', 'cloudy')
   */
  changeType(type) {
    this.options.type = type;
    this.createSkybox();
  }
}

export default Skybox;
