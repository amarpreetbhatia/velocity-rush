/**
 * Track configurations for Velocity Rush
 * Defines different race tracks with their properties and layouts
 */

const tracks = {
  // Circuit track - Balanced oval track
  circuit: {
    id: 'circuit',
    name: 'Velocity Circuit',
    description: 'A balanced oval circuit with smooth turns and straightaways.',
    previewImage: '/assets/images/tracks/circuit_preview.jpg',
    unlockLevel: 1,
    price: 0, // Starting track
    
    // Track properties
    laps: 3,
    length: 3500, // meters
    difficulty: 'easy',
    environment: 'daytime',
    
    // Track layout
    trackPath: [
      { position: [0, 0, 0], width: 20, length: 100, color: '#555555' },
      { position: [50, 0, 50], width: 20, length: 100, rotation: Math.PI / 2, color: '#555555' },
      { position: [100, 0, 0], width: 20, length: 100, color: '#555555' },
      { position: [50, 0, -50], width: 20, length: 100, rotation: Math.PI / 2, color: '#555555' }
    ],
    
    // Track barriers
    barriers: [
      // Outer barriers
      { position: [0, 1, 55], width: 30, height: 2, length: 2, color: '#ff3333' },
      { position: [0, 1, -55], width: 30, height: 2, length: 2, color: '#ff3333' },
      { position: [55, 1, 0], width: 2, height: 2, length: 110, color: '#ff3333' },
      { position: [-15, 1, 0], width: 2, height: 2, length: 110, color: '#ff3333' },
      
      // Inner barriers
      { position: [25, 1, 25], width: 50, height: 2, length: 2, color: '#3333ff' },
      { position: [25, 1, -25], width: 50, height: 2, length: 2, color: '#3333ff' }
    ],
    
    // Checkpoints for lap counting and timing
    checkpoints: [
      { position: [0, 0, -50], rotation: 0, width: 20, isStart: true },
      { position: [50, 0, 0], rotation: Math.PI / 2, width: 20 },
      { position: [0, 0, 50], rotation: 0, width: 20 },
      { position: [-50, 0, 0], rotation: Math.PI / 2, width: 20 }
    ],
    
    // Environment settings
    environment: {
      groundTexture: '/assets/textures/ground_diffuse.jpg',
      groundNormalMap: '/assets/textures/ground_normal.jpg',
      groundRoughnessMap: '/assets/textures/ground_roughness.jpg',
      groundAoMap: '/assets/textures/ground_ao.jpg',
      skybox: 'daytime',
      ambientLight: 0.5,
      directionalLight: 1.0,
      fogDensity: 0.01,
      fogColor: '#87ceeb'
    }
  },
  
  // Desert track - High speed with challenging turns
  desert: {
    id: 'desert',
    name: 'Sandstorm Speedway',
    description: 'A high-speed desert track with challenging turns and jumps.',
    previewImage: '/assets/images/tracks/desert_preview.jpg',
    unlockLevel: 2,
    price: 0, // Free with level unlock
    
    // Track properties
    laps: 3,
    length: 4200, // meters
    difficulty: 'medium',
    environment: 'desert',
    
    // Track layout - more complex with elevation changes
    trackPath: [
      { position: [0, 0, 0], width: 20, length: 150, color: '#b38600' },
      { position: [75, 1, 75], width: 20, length: 150, rotation: Math.PI / 2, color: '#b38600' },
      { position: [150, 2, 150], width: 20, length: 150, color: '#b38600' },
      { position: [225, 1, 75], width: 20, length: 150, rotation: Math.PI / 2, color: '#b38600' },
      { position: [300, 0, 0], width: 20, length: 150, color: '#b38600' },
      { position: [150, 0, -75], width: 300, length: 20, rotation: 0, color: '#b38600' }
    ],
    
    // Environment settings
    environment: {
      groundTexture: '/assets/textures/sand_diffuse.jpg',
      groundNormalMap: '/assets/textures/sand_normal.jpg',
      groundRoughnessMap: '/assets/textures/sand_roughness.jpg',
      groundAoMap: '/assets/textures/sand_ao.jpg',
      skybox: 'desert',
      ambientLight: 0.7,
      directionalLight: 1.2,
      fogDensity: 0.02,
      fogColor: '#e6c35c'
    }
  },
  
  // Night city track - Technical with tight corners
  nightCity: {
    id: 'nightCity',
    name: 'Neon City Nights',
    description: 'A technical night track through a neon-lit city with tight corners.',
    previewImage: '/assets/images/tracks/night_city_preview.jpg',
    unlockLevel: 6,
    price: 45000,
    
    // Track properties
    laps: 4,
    length: 3800, // meters
    difficulty: 'hard',
    environment: 'night',
    
    // Environment settings
    environment: {
      groundTexture: '/assets/textures/asphalt_diffuse.jpg',
      groundNormalMap: '/assets/textures/asphalt_normal.jpg',
      groundRoughnessMap: '/assets/textures/asphalt_roughness.jpg',
      groundAoMap: '/assets/textures/asphalt_ao.jpg',
      skybox: 'night',
      ambientLight: 0.2,
      directionalLight: 0.1,
      fogDensity: 0.03,
      fogColor: '#0a0a1a',
      
      // Additional lighting for night city
      pointLights: [
        { position: [10, 5, 20], color: '#ff00ff', intensity: 2, distance: 50 },
        { position: [-30, 5, -10], color: '#00ffff', intensity: 2, distance: 50 },
        { position: [50, 5, -30], color: '#ffff00', intensity: 2, distance: 50 }
      ]
    }
  },
  
  // Mountain track - Challenging with elevation changes
  mountain: {
    id: 'mountain',
    name: 'Alpine Ascent',
    description: 'A challenging mountain track with significant elevation changes and hairpin turns.',
    previewImage: '/assets/images/tracks/mountain_preview.jpg',
    unlockLevel: 8,
    price: 60000,
    
    // Track properties
    laps: 2,
    length: 5500, // meters
    difficulty: 'hard',
    environment: 'mountain',
    
    // Environment settings
    environment: {
      groundTexture: '/assets/textures/rock_diffuse.jpg',
      groundNormalMap: '/assets/textures/rock_normal.jpg',
      groundRoughnessMap: '/assets/textures/rock_roughness.jpg',
      groundAoMap: '/assets/textures/rock_ao.jpg',
      skybox: 'mountain',
      ambientLight: 0.6,
      directionalLight: 0.9,
      fogDensity: 0.01,
      fogColor: '#c8d8e6'
    }
  },
  
  // Futuristic track - High-tech with special effects
  future: {
    id: 'future',
    name: 'Quantum Raceway',
    description: 'A futuristic high-tech track with gravity-defying sections and special effects.',
    previewImage: '/assets/images/tracks/future_preview.jpg',
    unlockLevel: 12,
    price: 100000,
    
    // Track properties
    laps: 3,
    length: 4800, // meters
    difficulty: 'expert',
    environment: 'future',
    
    // Special features
    specialFeatures: {
      gravitySections: true,
      speedBoosts: true,
      teleporters: true
    },
    
    // Environment settings
    environment: {
      groundTexture: '/assets/textures/tech_diffuse.jpg',
      groundNormalMap: '/assets/textures/tech_normal.jpg',
      groundRoughnessMap: '/assets/textures/tech_roughness.jpg',
      groundAoMap: '/assets/textures/tech_ao.jpg',
      skybox: 'future',
      ambientLight: 0.4,
      directionalLight: 0.8,
      fogDensity: 0.02,
      fogColor: '#120a2a'
    }
  }
};

export default tracks;
