import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import PropTypes from 'prop-types';
import * as THREE from 'three';

/**
 * Vehicle component for rendering and animating a vehicle in the scene
 */
const Vehicle = ({ 
  modelPath, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  color = '#ff3300',
  physics,
  onLoad
}) => {
  const group = useRef();
  const wheels = useRef([]);
  const bodyMaterial = useRef();
  
  // Load vehicle model
  const { scene, nodes, materials } = useGLTF(modelPath);
  
  // Set up vehicle on load
  useEffect(() => {
    if (!scene) return;
    
    // Clone the scene to avoid modifying the cached original
    const vehicleScene = scene.clone();
    
    // Find body and wheel meshes
    const bodyParts = [];
    const wheelParts = [];
    
    vehicleScene.traverse((child) => {
      if (child.isMesh) {
        // Assume parts with "wheel" or "tire" in the name are wheels
        if (child.name.toLowerCase().includes('wheel') || 
            child.name.toLowerCase().includes('tire')) {
          wheelParts.push(child);
          
          // Enable shadows for wheels
          child.castShadow = true;
          child.receiveShadow = true;
        } 
        // Otherwise assume it's part of the body
        else {
          bodyParts.push(child);
          
          // Enable shadows for body parts
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Store reference to body material if it's the main body
          if (child.name.toLowerCase().includes('body') || 
              child.name.toLowerCase().includes('chassis')) {
            bodyMaterial.current = child.material;
          }
        }
      }
    });
    
    // Store wheel references
    wheels.current = wheelParts;
    
    // Set vehicle color if body material exists
    if (bodyMaterial.current && color) {
      bodyMaterial.current.color.set(color);
    }
    
    // Add vehicle scene to group
    if (group.current) {
      // Clear previous children
      while (group.current.children.length) {
        group.current.remove(group.current.children[0]);
      }
      
      // Add new scene
      group.current.add(vehicleScene);
      
      // Set initial position and rotation
      group.current.position.set(position[0], position[1], position[2]);
      group.current.rotation.set(rotation[0], rotation[1], rotation[2]);
      group.current.scale.set(scale, scale, scale);
    }
    
    // Call onLoad callback if provided
    if (onLoad) {
      onLoad(group.current);
    }
    
    // Clean up function
    return () => {
      vehicleScene.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    };
  }, [scene, modelPath, position, rotation, scale, color, onLoad]);
  
  // Update vehicle transform based on physics
  useFrame(() => {
    if (!group.current || !physics) return;
    
    // Get transform data from physics
    const transform = physics.getTransform();
    
    // Update vehicle position and rotation
    group.current.position.copy(transform.position);
    group.current.quaternion.copy(transform.rotation);
    
    // Update wheel rotations
    if (wheels.current.length >= 4 && transform.wheels) {
      // Assuming wheels are in this order: front-left, front-right, rear-left, rear-right
      for (let i = 0; i < Math.min(wheels.current.length, transform.wheels.length); i++) {
        const wheel = wheels.current[i];
        const wheelData = transform.wheels[i];
        
        // Apply wheel rotation around local X axis
        wheel.rotation.x = wheelData.rotation;
        
        // Apply steering for front wheels
        if (i < 2) { // Front wheels
          wheel.rotation.y = wheelData.steering * Math.PI / 6; // Convert to radians
        }
      }
    }
  });
  
  return (
    <group ref={group} />
  );
};

Vehicle.propTypes = {
  modelPath: PropTypes.string.isRequired,
  position: PropTypes.arrayOf(PropTypes.number),
  rotation: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.number,
  color: PropTypes.string,
  physics: PropTypes.object,
  onLoad: PropTypes.func
};

export default Vehicle;
