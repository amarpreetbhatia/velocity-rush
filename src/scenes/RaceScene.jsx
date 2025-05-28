import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Sky,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';

// Game engine imports
import GameLoop from '../engine/loop';
import VehiclePhysics from '../engine/physics/vehiclePhysics';
import CollisionSystem from '../engine/physics/collisionSystem';

// Component imports
import Vehicle from '../components/game/vehicles/Vehicle';
import Speedometer from '../components/ui/HUD/Speedometer';

// Track and environment
const Track = ({ trackConfig }) => {
  const groundTexture = useTexture({
    map: trackConfig.groundTexture,
    normalMap: trackConfig.groundNormalMap,
    roughnessMap: trackConfig.groundRoughnessMap,
    aoMap: trackConfig.groundAoMap,
  });
  
  // Apply texture repeat
  Object.values(groundTexture).forEach(texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 50);
  });
  
  return (
    <group>
      {/* Ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
          {...groundTexture}
          envMapIntensity={0.5}
        />
      </mesh>
      
      {/* Track path */}
      {trackConfig.trackPath.map((segment, index) => (
        <mesh 
          key={`track-segment-${index}`}
          position={[segment.position[0], segment.position[1] + 0.01, segment.position[2]]}
          rotation={[0, segment.rotation || 0, 0]}
          receiveShadow
        >
          <boxGeometry args={[segment.width, 0.1, segment.length]} />
          <meshStandardMaterial 
            color={segment.color || "#333333"} 
            roughness={0.4}
          />
        </mesh>
      ))}
      
      {/* Track barriers */}
      {trackConfig.barriers.map((barrier, index) => (
        <mesh 
          key={`barrier-${index}`}
          position={[barrier.position[0], barrier.position[1], barrier.position[2]]}
          rotation={[0, barrier.rotation || 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[barrier.width, barrier.height, barrier.length]} />
          <meshStandardMaterial 
            color={barrier.color || "#ff0000"} 
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

// Main race scene
const RaceScene = () => {
  // Game state
  const [gameState, setGameState] = useState({
    isRunning: false,
    isPaused: false,
    countdown: 3,
    lap: 1,
    totalLaps: 3,
    raceTime: 0,
    bestLapTime: null,
    currentLapTime: 0,
    position: 1,
    totalRacers: 8
  });
  
  // Vehicle state
  const [vehicleState, setVehicleState] = useState({
    speed: 0,
    rpm: 0,
    gear: 1
  });
  
  // Game engine references
  const gameLoopRef = useRef(null);
  const vehiclePhysicsRef = useRef(null);
  const collisionSystemRef = useRef(null);
  const vehicleRef = useRef(null);
  const cameraRef = useRef(null);
  
  // Input state
  const inputRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false
  });
  
  // Track configuration
  const trackConfig = {
    groundTexture: '/assets/textures/ground_diffuse.jpg',
    groundNormalMap: '/assets/textures/ground_normal.jpg',
    groundRoughnessMap: '/assets/textures/ground_roughness.jpg',
    groundAoMap: '/assets/textures/ground_ao.jpg',
    trackPath: [
      { position: [0, 0, 0], width: 20, length: 100, color: '#555555' },
      { position: [50, 0, 50], width: 20, length: 100, rotation: Math.PI / 2, color: '#555555' },
      { position: [100, 0, 0], width: 20, length: 100, color: '#555555' },
      { position: [50, 0, -50], width: 20, length: 100, rotation: Math.PI / 2, color: '#555555' }
    ],
    barriers: [
      // Outer barriers
      { position: [0, 1, 55], width: 30, height: 2, length: 2, color: '#ff3333' },
      { position: [0, 1, -55], width: 30, height: 2, length: 2, color: '#ff3333' },
      { position: [55, 1, 0], width: 2, height: 2, length: 110, color: '#ff3333' },
      { position: [-15, 1, 0], width: 2, height: 2, length: 110, color: '#ff3333' },
      
      // Inner barriers
      { position: [25, 1, 25], width: 50, height: 2, length: 2, color: '#3333ff' },
      { position: [25, 1, -25], width: 50, height: 2, length: 2, color: '#3333ff' }
    ]
  };
  
  // Initialize game engine
  useEffect(() => {
    // Create game loop
    const gameLoop = new GameLoop();
    gameLoopRef.current = gameLoop;
    
    // Create vehicle physics
    const vehiclePhysics = new VehiclePhysics({
      maxSpeed: 180,
      acceleration: 15,
      deceleration: 5,
      braking: 20,
      mass: 1200
    });
    vehiclePhysicsRef.current = vehiclePhysics;
    
    // Set initial vehicle position
    vehiclePhysics.state.position.set(0, 0.5, -40);
    
    // Create collision system
    const collisionSystem = new CollisionSystem();
    collisionSystemRef.current = collisionSystem;
    
    // Set up fixed update for physics
    gameLoop.onFixedUpdate((fixedDeltaTime) => {
      // Process input
      const input = inputRef.current;
      const controls = {
        throttle: input.forward ? 1 : (input.backward ? -0.5 : 0),
        brake: input.brake ? 1 : 0,
        steering: input.left ? -1 : (input.right ? 1 : 0)
      };
      
      // Update vehicle physics
      vehiclePhysics.setControls(controls);
      vehiclePhysics.update(fixedDeltaTime, (x, z) => 0); // Simple flat ground
      
      // Update collision system
      collisionSystem.update(fixedDeltaTime);
      
      // Update vehicle state for UI
      const metrics = vehiclePhysics.getPerformanceMetrics();
      setVehicleState({
        speed: metrics.speedKmh,
        rpm: metrics.rpm,
        gear: metrics.gear
      });
    });
    
    // Set up keyboard input
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = true;
          break;
        case ' ':
          inputRef.current.brake = true;
          break;
        case 'p':
          togglePause();
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          inputRef.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          inputRef.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          inputRef.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          inputRef.current.right = false;
          break;
        case ' ':
          inputRef.current.brake = false;
          break;
      }
    };
    
    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Start game loop
    gameLoop.start();
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setGameState(prev => {
        if (prev.countdown > 1) {
          return { ...prev, countdown: prev.countdown - 1 };
        } else {
          clearInterval(countdownInterval);
          return { ...prev, countdown: 0, isRunning: true };
        }
      });
    }, 1000);
    
    // Clean up
    return () => {
      gameLoop.stop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(countdownInterval);
    };
  }, []);
  
  // Update race time
  useEffect(() => {
    if (!gameState.isRunning || gameState.isPaused) return;
    
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        raceTime: prev.raceTime + 0.1,
        currentLapTime: prev.currentLapTime + 0.1
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.isPaused]);
  
  // Toggle pause
  const togglePause = () => {
    setGameState(prev => {
      const newIsPaused = !prev.isPaused;
      
      if (newIsPaused) {
        gameLoopRef.current?.stop();
      } else {
        gameLoopRef.current?.start();
      }
      
      return { ...prev, isPaused: newIsPaused };
    });
  };
  
  // Format time as mm:ss.ms
  const formatTime = (timeInSeconds) => {
    if (timeInSeconds === null) return '--:--.--';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="race-scene w-full h-screen relative">
      {/* 3D Canvas */}
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera
          ref={cameraRef}
          makeDefault
          position={[0, 5, -10]}
          fov={75}
        />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        
        {/* Environment */}
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="sunset" />
        
        {/* Track */}
        <Track trackConfig={trackConfig} />
        
        {/* Vehicle */}
        <Vehicle 
          ref={vehicleRef}
          modelPath="/assets/models/sports_car.glb"
          physics={vehiclePhysicsRef.current}
          color="#ff3300"
        />
        
        {/* Camera controls - disabled in race mode */}
        <OrbitControls 
          target={[0, 0, 0]} 
          enablePan={false}
          enabled={false}
        />
      </Canvas>
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Speedometer */}
        <div className="absolute bottom-8 right-8">
          <Speedometer 
            speed={vehicleState.speed} 
            rpm={vehicleState.rpm} 
            gear={vehicleState.gear}
          />
        </div>
        
        {/* Race info */}
        <div className="absolute top-8 left-8 bg-black bg-opacity-50 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold mb-2">
            Lap: {gameState.lap}/{gameState.totalLaps}
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div>Position:</div>
            <div>{gameState.position}/{gameState.totalRacers}</div>
            <div>Race Time:</div>
            <div>{formatTime(gameState.raceTime)}</div>
            <div>Current Lap:</div>
            <div>{formatTime(gameState.currentLapTime)}</div>
            <div>Best Lap:</div>
            <div>{formatTime(gameState.bestLapTime)}</div>
          </div>
        </div>
        
        {/* Countdown overlay */}
        {gameState.countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-9xl font-bold text-white">
              {gameState.countdown}
            </div>
          </div>
        )}
        
        {/* Pause overlay */}
        {gameState.isPaused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 pointer-events-auto">
            <div className="text-6xl font-bold text-white mb-8">
              PAUSED
            </div>
            <div className="flex gap-4">
              <button 
                className="btn btn-primary"
                onClick={togglePause}
              >
                Resume
              </button>
              <button className="btn btn-secondary">
                Restart
              </button>
              <button className="btn">
                Quit
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls help */}
      <div className="absolute bottom-8 left-8 bg-black bg-opacity-50 p-4 rounded-lg text-white">
        <div className="text-xl font-bold mb-2">Controls</div>
        <div className="grid grid-cols-2 gap-x-4">
          <div>Accelerate:</div>
          <div>W / ↑</div>
          <div>Brake/Reverse:</div>
          <div>S / ↓</div>
          <div>Steer Left:</div>
          <div>A / ←</div>
          <div>Steer Right:</div>
          <div>D / →</div>
          <div>Handbrake:</div>
          <div>Space</div>
          <div>Pause:</div>
          <div>P</div>
        </div>
      </div>
    </div>
  );
};

export default RaceScene;
