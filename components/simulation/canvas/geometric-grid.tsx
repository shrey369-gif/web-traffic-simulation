'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStats } from '@/hooks/use-simulation';

interface GeometricGridProps {
  size?: number;
  divisions?: number;
}

export function GeometricGrid({ size = 50, divisions = 20 }: GeometricGridProps) {
  const groupRef = useRef<THREE.Group>(null);
  const stats = useSimulationStats();
  
  // Generate grid lines with slight distortion
  const gridLines = useMemo(() => {
    const lines: { 
      points: THREE.Vector3[]; 
      opacity: number;
      isVertical: boolean;
    }[] = [];
    
    const step = size / divisions;
    const half = size / 2;
    
    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const y = -half + i * step;
      const points: THREE.Vector3[] = [];
      
      for (let j = 0; j <= divisions * 4; j++) {
        const t = j / (divisions * 4);
        const x = -half + t * size;
        
        // Subtle wave distortion
        const wave = Math.sin(x * 0.2 + y * 0.1) * 0.3;
        
        points.push(new THREE.Vector3(x, y + wave, -0.5));
      }
      
      lines.push({
        points,
        opacity: 0.05 + (i % 4 === 0 ? 0.05 : 0),
        isVertical: false,
      });
    }
    
    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = -half + i * step;
      const points: THREE.Vector3[] = [];
      
      for (let j = 0; j <= divisions * 4; j++) {
        const t = j / (divisions * 4);
        const y = -half + t * size;
        
        const wave = Math.sin(y * 0.2 + x * 0.1) * 0.3;
        
        points.push(new THREE.Vector3(x + wave, y, -0.5));
      }
      
      lines.push({
        points,
        opacity: 0.05 + (i % 4 === 0 ? 0.05 : 0),
        isVertical: true,
      });
    }
    
    return lines;
  }, [size, divisions]);
  
  // Animate grid based on simulation stress
  useFrame((state) => {
    if (groupRef.current) {
      const stress = Math.min((stats.congestionNodes || 0) / 10, 1);
      
      // Subtle rotation based on stress
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.01 * (1 + stress);
      
      // Scale pulse
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.005 * stress;
      groupRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 0, -1]}>
      {gridLines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={line.points.length}
              array={new Float32Array(line.points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={line.opacity}
          />
        </line>
      ))}
      
      {/* Accent diagonal lines */}
      <DiagonalAccents size={size} />
    </group>
  );
}

function DiagonalAccents({ size }: { size: number }) {
  const linesRef = useRef<THREE.Group>(null);
  const stats = useSimulationStats();
  
  useFrame((state) => {
    if (linesRef.current) {
      const stress = Math.min((stats.congestionNodes || 0) / 10, 1);
      linesRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Line) {
          const material = child.material as THREE.LineBasicMaterial;
          material.opacity = 0.03 + stress * 0.1 + Math.sin(state.clock.elapsedTime + i) * 0.02;
        }
      });
    }
  });
  
  const diagonals = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const half = size / 2;
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      const offset = (i - count / 2) * (size / count);
      
      lines.push([
        new THREE.Vector3(-half + offset, -half, -0.6),
        new THREE.Vector3(half + offset, half, -0.6),
      ]);
    }
    
    return lines;
  }, [size]);
  
  return (
    <group ref={linesRef}>
      {diagonals.map((points, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#DFFF00"
            transparent
            opacity={0.05}
          />
        </line>
      ))}
    </group>
  );
}
