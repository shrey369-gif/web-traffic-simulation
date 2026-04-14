'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Vehicle } from '@/lib/simulation-config';
import { getVehicleShardConfig } from '@/lib/geometry-utils';

interface CubistVehiclesProps {
  vehicles: Vehicle[];
}

// Single vehicle with cubist shards
function CubistVehicle({ vehicle }: { vehicle: Vehicle }) {
  const groupRef = useRef<THREE.Group>(null);
  const config = getVehicleShardConfig(vehicle.type);
  
  // Generate shard geometries
  const shards = useMemo(() => {
    const shardData: { 
      position: [number, number, number];
      rotation: [number, number, number];
      scale: number;
      color: string;
    }[] = [];
    
    for (let i = 0; i < config.shardCount; i++) {
      const angle = (i / config.shardCount) * Math.PI * 2;
      const radius = 0.1 * config.baseScale;
      
      shardData.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          i * 0.03
        ],
        rotation: [
          Math.random() * 0.3 - 0.15,
          Math.random() * 0.3 - 0.15,
          angle + Math.random() * 0.5
        ],
        scale: 0.15 * config.baseScale * (0.7 + Math.random() * 0.6),
        color: vehicle.type === 'auto' ? '#DFFF00' : vehicle.color,
      });
    }
    
    return shardData;
  }, [vehicle.type, config]);
  
  // Animate vehicle position and rotation
  useFrame(() => {
    if (groupRef.current) {
      // Smooth position interpolation
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        vehicle.position.x,
        0.3
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        vehicle.position.y,
        0.3
      );
      
      // Rotation based on velocity
      groupRef.current.rotation.z = vehicle.rotation - Math.PI / 2;
      
      // Scale pulse based on speed
      const speedScale = 1 + vehicle.currentSpeed * 0.02;
      groupRef.current.scale.setScalar(speedScale);
    }
  });
  
  return (
    <group ref={groupRef} position={[vehicle.position.x, vehicle.position.y, 0.5]}>
      {shards.map((shard, i) => (
        <mesh
          key={i}
          position={shard.position}
          rotation={shard.rotation}
          scale={shard.scale}
        >
          <boxGeometry args={[1, 1.5, 0.3]} />
          <meshStandardMaterial
            color={shard.color}
            transparent
            opacity={config.opacity}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      ))}
      
      {/* Core glow for active vehicles */}
      {vehicle.currentSpeed > 0.5 && (
        <mesh scale={0.08 * config.baseScale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial 
            color={vehicle.type === 'auto' ? '#DFFF00' : '#ffffff'} 
            transparent 
            opacity={0.6} 
          />
        </mesh>
      )}
    </group>
  );
}

export function CubistVehicles({ vehicles }: CubistVehiclesProps) {
  return (
    <group>
      {vehicles.map((vehicle) => (
        <CubistVehicle key={vehicle.id} vehicle={vehicle} />
      ))}
    </group>
  );
}
