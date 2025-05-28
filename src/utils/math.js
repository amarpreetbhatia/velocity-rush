/**
 * Math utility functions for Velocity Rush
 * Provides helper functions for 3D math operations
 */

import { Vector3, Quaternion, Matrix4, Euler } from 'three';

/**
 * Linear interpolation between two values
 * @param {number} a - Start value
 * @param {number} b - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
export function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
export function radToDeg(radians) {
  return radians * 180 / Math.PI;
}

/**
 * Calculate the shortest angle between two angles
 * @param {number} a - First angle in radians
 * @param {number} b - Second angle in radians
 * @returns {number} Shortest angle in radians
 */
export function shortestAngle(a, b) {
  const diff = (b - a) % (2 * Math.PI);
  return ((diff + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
}

/**
 * Smoothly interpolate between two angles
 * @param {number} a - Start angle in radians
 * @param {number} b - End angle in radians
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated angle in radians
 */
export function lerpAngle(a, b, t) {
  return a + shortestAngle(a, b) * t;
}

/**
 * Smoothly interpolate between two vectors
 * @param {Vector3} a - Start vector
 * @param {Vector3} b - End vector
 * @param {number} t - Interpolation factor (0-1)
 * @returns {Vector3} Interpolated vector
 */
export function lerpVectors(a, b, t) {
  return new Vector3(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t),
    lerp(a.z, b.z, t)
  );
}

/**
 * Smoothly interpolate between two quaternions
 * @param {Quaternion} a - Start quaternion
 * @param {Quaternion} b - End quaternion
 * @param {number} t - Interpolation factor (0-1)
 * @returns {Quaternion} Interpolated quaternion
 */
export function slerpQuaternions(a, b, t) {
  const result = new Quaternion();
  return result.slerpQuaternions(a, b, t);
}

/**
 * Calculate the distance between two points
 * @param {Vector3|Array} a - First point
 * @param {Vector3|Array} b - Second point
 * @returns {number} Distance
 */
export function distance(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  } else if (a instanceof Vector3 && b instanceof Vector3) {
    return a.distanceTo(b);
  }
  throw new Error('Invalid arguments for distance calculation');
}

/**
 * Calculate the squared distance between two points (faster than distance)
 * @param {Vector3|Array} a - First point
 * @param {Vector3|Array} b - Second point
 * @returns {number} Squared distance
 */
export function distanceSquared(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const dz = b[2] - a[2];
    return dx * dx + dy * dy + dz * dz;
  } else if (a instanceof Vector3 && b instanceof Vector3) {
    return a.distanceToSquared(b);
  }
  throw new Error('Invalid arguments for distance calculation');
}

/**
 * Get a point on a cubic Bezier curve
 * @param {Vector3} p0 - Start point
 * @param {Vector3} p1 - First control point
 * @param {Vector3} p2 - Second control point
 * @param {Vector3} p3 - End point
 * @param {number} t - Curve parameter (0-1)
 * @returns {Vector3} Point on curve
 */
export function cubicBezier(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  
  return new Vector3(
    mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    mt3 * p0.z + 3 * mt2 * t * p1.z + 3 * mt * t2 * p2.z + t3 * p3.z
  );
}

/**
 * Get a random point inside a sphere
 * @param {number} radius - Sphere radius
 * @returns {Vector3} Random point
 */
export function randomPointInSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());
  
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  
  return new Vector3(
    r * sinPhi * cosTheta,
    r * sinPhi * sinTheta,
    r * cosPhi
  );
}

/**
 * Get a random point on a sphere surface
 * @param {number} radius - Sphere radius
 * @returns {Vector3} Random point
 */
export function randomPointOnSphere(radius) {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  
  return new Vector3(
    radius * sinPhi * cosTheta,
    radius * sinPhi * sinTheta,
    radius * cosPhi
  );
}

/**
 * Calculate the normal vector of a triangle
 * @param {Vector3} a - First vertex
 * @param {Vector3} b - Second vertex
 * @param {Vector3} c - Third vertex
 * @returns {Vector3} Normal vector
 */
export function triangleNormal(a, b, c) {
  const v1 = new Vector3().subVectors(b, a);
  const v2 = new Vector3().subVectors(c, a);
  return new Vector3().crossVectors(v1, v2).normalize();
}

/**
 * Check if a point is inside a triangle
 * @param {Vector3} p - Point to check
 * @param {Vector3} a - First vertex
 * @param {Vector3} b - Second vertex
 * @param {Vector3} c - Third vertex
 * @returns {boolean} True if point is inside triangle
 */
export function pointInTriangle(p, a, b, c) {
  // Barycentric coordinate method
  const v0 = new Vector3().subVectors(c, a);
  const v1 = new Vector3().subVectors(b, a);
  const v2 = new Vector3().subVectors(p, a);
  
  const dot00 = v0.dot(v0);
  const dot01 = v0.dot(v1);
  const dot02 = v0.dot(v2);
  const dot11 = v1.dot(v1);
  const dot12 = v1.dot(v2);
  
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  
  return (u >= 0) && (v >= 0) && (u + v <= 1);
}

/**
 * Smooth step function
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Input value
 * @returns {number} Smoothed value
 */
export function smoothStep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Smoother step function (5th order)
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Input value
 * @returns {number} Smoothed value
 */
export function smootherStep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Convert Euler angles to direction vector
 * @param {number} pitch - Pitch angle in radians
 * @param {number} yaw - Yaw angle in radians
 * @returns {Vector3} Direction vector
 */
export function eulerToDirection(pitch, yaw) {
  return new Vector3(
    Math.cos(pitch) * Math.sin(yaw),
    Math.sin(pitch),
    Math.cos(pitch) * Math.cos(yaw)
  ).normalize();
}

/**
 * Convert direction vector to Euler angles
 * @param {Vector3} dir - Direction vector
 * @returns {Object} Euler angles {pitch, yaw}
 */
export function directionToEuler(dir) {
  const normalizedDir = dir.clone().normalize();
  return {
    pitch: Math.asin(normalizedDir.y),
    yaw: Math.atan2(normalizedDir.x, normalizedDir.z)
  };
}

/**
 * Calculate the reflection vector
 * @param {Vector3} incident - Incident vector
 * @param {Vector3} normal - Surface normal
 * @returns {Vector3} Reflection vector
 */
export function reflect(incident, normal) {
  return incident.clone().sub(
    normal.clone().multiplyScalar(2 * incident.dot(normal))
  );
}

/**
 * Calculate the refraction vector
 * @param {Vector3} incident - Incident vector
 * @param {Vector3} normal - Surface normal
 * @param {number} ior - Index of refraction ratio
 * @returns {Vector3|null} Refraction vector or null for total internal reflection
 */
export function refract(incident, normal, ior) {
  const i = incident.clone().normalize();
  const n = normal.clone().normalize();
  const cosi = clamp(i.dot(n), -1, 1);
  const etai = 1;
  const etat = ior;
  let eta = etai / etat;
  
  // Handle entering/exiting surface
  if (cosi < 0) {
    // Outside surface, entering
    // cosi = -cosi;
  } else {
    // Inside surface, exiting
    eta = etat / etai;
    n.negate();
  }
  
  const k = 1 - eta * eta * (1 - cosi * cosi);
  
  if (k < 0) {
    // Total internal reflection
    return null;
  } else {
    return i.clone().multiplyScalar(eta).add(
      n.clone().multiplyScalar(eta * cosi - Math.sqrt(k))
    );
  }
}

export default {
  lerp,
  clamp,
  degToRad,
  radToDeg,
  shortestAngle,
  lerpAngle,
  lerpVectors,
  slerpQuaternions,
  distance,
  distanceSquared,
  cubicBezier,
  randomPointInSphere,
  randomPointOnSphere,
  triangleNormal,
  pointInTriangle,
  smoothStep,
  smootherStep,
  eulerToDirection,
  directionToEuler,
  reflect,
  refract
};
