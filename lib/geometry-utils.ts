// Cubist Geometry Generation Utilities

import * as THREE from 'three';

// Generate fragmented plane geometry for cubist effect
export function createFragmentedPlane(
  width: number,
  height: number,
  fragments: number = 5,
  displacement: number = 0.1
): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width, height, fragments, fragments);
  const positions = geometry.attributes.position;
  
  // Displace vertices for fragmented look
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    
    // Add noise-based displacement
    const noiseX = Math.sin(x * 5 + y * 3) * displacement;
    const noiseY = Math.cos(x * 3 + y * 5) * displacement;
    const noiseZ = Math.sin(x * y * 2) * displacement * 2;
    
    positions.setXYZ(
      i,
      x + noiseX,
      y + noiseY,
      noiseZ
    );
  }
  
  geometry.computeVertexNormals();
  return geometry;
}

// Generate shard-like geometry for vehicles
export function createShardGeometry(
  baseWidth: number,
  baseHeight: number,
  shardCount: number = 3
): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];
  
  for (let i = 0; i < shardCount; i++) {
    const angle = (i / shardCount) * Math.PI * 2;
    const scale = 0.8 + Math.random() * 0.4;
    
    // Create a triangular shard
    const shape = new THREE.Shape();
    const size = baseWidth * scale;
    
    shape.moveTo(0, size * 0.5);
    shape.lineTo(-size * 0.3, -size * 0.3);
    shape.lineTo(size * 0.3, -size * 0.3);
    shape.closePath();
    
    const extrudeSettings = {
      depth: baseHeight * 0.1 * (0.5 + Math.random() * 0.5),
      bevelEnabled: false,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateZ(angle);
    geometry.translate(
      Math.cos(angle) * baseWidth * 0.1,
      Math.sin(angle) * baseWidth * 0.1,
      i * 0.05
    );
    
    geometries.push(geometry);
  }
  
  return geometries;
}

// Create intersecting planes for road visualization
export function createIntersectingPlanes(
  length: number,
  width: number,
  planeCount: number = 2
): { geometry: THREE.BufferGeometry; rotation: THREE.Euler }[] {
  const planes: { geometry: THREE.BufferGeometry; rotation: THREE.Euler }[] = [];
  
  for (let i = 0; i < planeCount; i++) {
    const geometry = new THREE.PlaneGeometry(length, width);
    const rotation = new THREE.Euler(
      (i % 2 === 0 ? 0.1 : -0.1) * Math.PI,
      0,
      0
    );
    
    planes.push({ geometry, rotation });
  }
  
  return planes;
}

// Generate grid lines with distortion
export function createDistortedGrid(
  size: number,
  divisions: number,
  distortion: number = 0.5
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const step = size / divisions;
  const half = size / 2;
  
  // Horizontal lines
  for (let i = 0; i <= divisions; i++) {
    const y = -half + i * step;
    
    for (let j = 0; j <= divisions * 2; j++) {
      const t = j / (divisions * 2);
      const x = -half + t * size;
      
      // Add distortion
      const distortX = Math.sin(y * 0.5 + x * 0.3) * distortion;
      const distortY = Math.cos(x * 0.4 + y * 0.2) * distortion;
      const distortZ = Math.sin(x * y * 0.1) * distortion * 0.5;
      
      points.push(new THREE.Vector3(x + distortX, y + distortY, distortZ));
    }
  }
  
  // Vertical lines
  for (let i = 0; i <= divisions; i++) {
    const x = -half + i * step;
    
    for (let j = 0; j <= divisions * 2; j++) {
      const t = j / (divisions * 2);
      const y = -half + t * size;
      
      const distortX = Math.sin(y * 0.5 + x * 0.3) * distortion;
      const distortY = Math.cos(x * 0.4 + y * 0.2) * distortion;
      const distortZ = Math.sin(x * y * 0.1) * distortion * 0.5;
      
      points.push(new THREE.Vector3(x + distortX, y + distortY, distortZ));
    }
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return geometry;
}

// Create abstract vehicle representation
export function getVehicleShardConfig(vehicleType: string): {
  shardCount: number;
  baseScale: number;
  opacity: number;
} {
  switch (vehicleType) {
    case 'car':
      return { shardCount: 4, baseScale: 1, opacity: 0.9 };
    case 'bike':
      return { shardCount: 2, baseScale: 0.6, opacity: 0.8 };
    case 'auto':
      return { shardCount: 3, baseScale: 0.8, opacity: 0.85 };
    case 'bus':
      return { shardCount: 6, baseScale: 1.5, opacity: 0.95 };
    case 'truck':
      return { shardCount: 5, baseScale: 1.3, opacity: 0.9 };
    default:
      return { shardCount: 3, baseScale: 1, opacity: 0.9 };
  }
}

// Interpolate between two colors based on stress level
export function stressColor(stress: number): THREE.Color {
  const white = new THREE.Color('#ffffff');
  const acid = new THREE.Color('#DFFF00');
  
  return white.clone().lerp(acid, Math.min(stress, 1));
}
