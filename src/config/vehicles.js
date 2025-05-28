/**
 * Vehicle configurations for Velocity Rush
 * Defines different vehicle types with their properties and stats
 */

const vehicles = {
  // Sports car - Balanced performance
  sports: {
    id: 'sports',
    name: 'Velocity GT',
    description: 'A balanced sports car with good handling and acceleration.',
    modelPath: '/assets/models/sports_car.glb',
    previewImage: '/assets/images/vehicles/sports_preview.jpg',
    price: 0, // Starting vehicle
    unlockLevel: 1,
    colors: ['#ff3300', '#0033ff', '#ffcc00', '#33cc33', '#ffffff', '#000000'],
    
    // Performance stats (0-100 scale)
    stats: {
      speed: 80,
      acceleration: 75,
      handling: 70,
      braking: 65
    },
    
    // Physics properties
    physics: {
      maxSpeed: 180, // km/h
      acceleration: 15, // m/s²
      deceleration: 5, // m/s²
      braking: 20, // m/s²
      mass: 1200, // kg
      
      // Steering properties
      maxSteeringAngle: Math.PI / 6, // 30 degrees
      steeringSpeed: 2.5,
      steeringReturn: 1.0,
      
      // Suspension properties
      suspensionHeight: 0.5, // meters
      suspensionStiffness: 10.0,
      suspensionDamping: 0.8,
      suspensionTravel: 0.3, // meters
      
      // Wheel properties
      wheelBase: 2.8, // meters
      trackWidth: 1.6, // meters
      wheelRadius: 0.35 // meters
    }
  },
  
  // Supercar - High speed, less handling
  supercar: {
    id: 'supercar',
    name: 'Phantom X',
    description: 'A high-speed supercar with incredible acceleration but challenging handling.',
    modelPath: '/assets/models/supercar.glb',
    previewImage: '/assets/images/vehicles/supercar_preview.jpg',
    price: 50000,
    unlockLevel: 5,
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#000000'],
    
    // Performance stats (0-100 scale)
    stats: {
      speed: 95,
      acceleration: 90,
      handling: 60,
      braking: 70
    },
    
    // Physics properties
    physics: {
      maxSpeed: 220, // km/h
      acceleration: 20, // m/s²
      deceleration: 4, // m/s²
      braking: 22, // m/s²
      mass: 1100, // kg
      
      // Steering properties
      maxSteeringAngle: Math.PI / 7, // ~25 degrees
      steeringSpeed: 2.2,
      steeringReturn: 0.8,
      
      // Suspension properties
      suspensionHeight: 0.4, // meters
      suspensionStiffness: 12.0,
      suspensionDamping: 0.7,
      suspensionTravel: 0.25, // meters
      
      // Wheel properties
      wheelBase: 2.7, // meters
      trackWidth: 1.7, // meters
      wheelRadius: 0.33 // meters
    }
  },
  
  // Rally car - Best handling, medium speed
  rally: {
    id: 'rally',
    name: 'Dirt Devil',
    description: 'An all-terrain rally car with exceptional handling and off-road capabilities.',
    modelPath: '/assets/models/rally_car.glb',
    previewImage: '/assets/images/vehicles/rally_preview.jpg',
    price: 35000,
    unlockLevel: 3,
    colors: ['#3366ff', '#ff6633', '#66cc33', '#ffcc00', '#ffffff', '#000000'],
    
    // Performance stats (0-100 scale)
    stats: {
      speed: 70,
      acceleration: 75,
      handling: 90,
      braking: 85
    },
    
    // Physics properties
    physics: {
      maxSpeed: 160, // km/h
      acceleration: 14, // m/s²
      deceleration: 6, // m/s²
      braking: 25, // m/s²
      mass: 1300, // kg
      
      // Steering properties
      maxSteeringAngle: Math.PI / 5, // 36 degrees
      steeringSpeed: 3.0,
      steeringReturn: 1.2,
      
      // Suspension properties
      suspensionHeight: 0.6, // meters
      suspensionStiffness: 8.0,
      suspensionDamping: 0.9,
      suspensionTravel: 0.4, // meters
      
      // Wheel properties
      wheelBase: 2.6, // meters
      trackWidth: 1.8, // meters
      wheelRadius: 0.38 // meters
    }
  },
  
  // Muscle car - High acceleration, lower handling
  muscle: {
    id: 'muscle',
    name: 'Thunder V8',
    description: 'A powerful muscle car with incredible acceleration and raw power.',
    modelPath: '/assets/models/muscle_car.glb',
    previewImage: '/assets/images/vehicles/muscle_preview.jpg',
    price: 40000,
    unlockLevel: 4,
    colors: ['#000000', '#990000', '#003399', '#006600', '#660066', '#996633'],
    
    // Performance stats (0-100 scale)
    stats: {
      speed: 85,
      acceleration: 95,
      handling: 55,
      braking: 60
    },
    
    // Physics properties
    physics: {
      maxSpeed: 200, // km/h
      acceleration: 18, // m/s²
      deceleration: 4, // m/s²
      braking: 18, // m/s²
      mass: 1500, // kg
      
      // Steering properties
      maxSteeringAngle: Math.PI / 7, // ~25 degrees
      steeringSpeed: 2.0,
      steeringReturn: 0.7,
      
      // Suspension properties
      suspensionHeight: 0.55, // meters
      suspensionStiffness: 9.0,
      suspensionDamping: 0.75,
      suspensionTravel: 0.35, // meters
      
      // Wheel properties
      wheelBase: 3.0, // meters
      trackWidth: 1.9, // meters
      wheelRadius: 0.4 // meters
    }
  },
  
  // Formula car - Highest speed and handling, unlocked last
  formula: {
    id: 'formula',
    name: 'Apex F1',
    description: 'A professional racing car with unmatched speed and precision handling.',
    modelPath: '/assets/models/formula_car.glb',
    previewImage: '/assets/images/vehicles/formula_preview.jpg',
    price: 100000,
    unlockLevel: 10,
    colors: ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ffffff', '#000000'],
    
    // Performance stats (0-100 scale)
    stats: {
      speed: 100,
      acceleration: 95,
      handling: 95,
      braking: 90
    },
    
    // Physics properties
    physics: {
      maxSpeed: 250, // km/h
      acceleration: 22, // m/s²
      deceleration: 6, // m/s²
      braking: 28, // m/s²
      mass: 800, // kg
      
      // Steering properties
      maxSteeringAngle: Math.PI / 5, // 36 degrees
      steeringSpeed: 3.5,
      steeringReturn: 1.5,
      
      // Suspension properties
      suspensionHeight: 0.3, // meters
      suspensionStiffness: 15.0,
      suspensionDamping: 0.6,
      suspensionTravel: 0.2, // meters
      
      // Wheel properties
      wheelBase: 3.2, // meters
      trackWidth: 2.0, // meters
      wheelRadius: 0.33 // meters
    }
  }
};

export default vehicles;
