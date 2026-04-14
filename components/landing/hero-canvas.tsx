'use client';

import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

// Autonomous hero animation - doesn't need simulation engine
function HeroGrid() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });
  
  const gridLines = useMemo(() => {
    const lines: { points: THREE.Vector3[]; opacity: number }[] = [];
    const size = 60;
    const divisions = 24;
    const step = size / divisions;
    const half = size / 2;
    
    // Create grid with wave distortion
    for (let i = 0; i <= divisions; i++) {
      const y = -half + i * step;
      const points: THREE.Vector3[] = [];
      
      for (let j = 0; j <= 100; j++) {
        const t = j / 100;
        const x = -half + t * size;
        const wave = Math.sin(x * 0.15 + y * 0.1) * 0.5;
        points.push(new THREE.Vector3(x, y + wave, 0));
      }
      
      lines.push({ points, opacity: i % 4 === 0 ? 0.12 : 0.05 });
    }
    
    for (let i = 0; i <= divisions; i++) {
      const x = -half + i * step;
      const points: THREE.Vector3[] = [];
      
      for (let j = 0; j <= 100; j++) {
        const t = j / 100;
        const y = -half + t * size;
        const wave = Math.sin(y * 0.15 + x * 0.1) * 0.5;
        points.push(new THREE.Vector3(x + wave, y, 0));
      }
      
      lines.push({ points, opacity: i % 4 === 0 ? 0.12 : 0.05 });
    }
    
    return lines;
  }, []);
  
  return (
    <group ref={groupRef}>
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
          <lineBasicMaterial color="#ffffff" transparent opacity={line.opacity} />
        </line>
      ))}
    </group>
  );
}

// Animated vehicle particles
function HeroParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 80;
  
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Random positions on grid intersections
      const gridSize = 60;
      const half = gridSize / 2;
      
      pos[i3] = (Math.random() - 0.5) * gridSize;
      pos[i3 + 1] = (Math.random() - 0.5) * gridSize;
      pos[i3 + 2] = Math.random() * 2;
      
      // Random velocities along grid
      const angle = Math.floor(Math.random() * 4) * Math.PI / 2;
      const speed = 0.02 + Math.random() * 0.03;
      vel[i3] = Math.cos(angle) * speed;
      vel[i3 + 1] = Math.sin(angle) * speed;
      vel[i3 + 2] = 0;
    }
    
    return { positions: pos, velocities: vel };
  }, []);
  
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      const bound = 30;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Update position
        positions.array[i3] += velocities[i3];
        positions.array[i3 + 1] += velocities[i3 + 1];
        
        // Wrap around bounds
        if (positions.array[i3] > bound) positions.array[i3] = -bound;
        if (positions.array[i3] < -bound) positions.array[i3] = bound;
        if (positions.array[i3 + 1] > bound) positions.array[i3 + 1] = -bound;
        if (positions.array[i3 + 1] < -bound) positions.array[i3 + 1] = bound;
      }
      
      positions.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.15}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Accent particles (acid yellow)
function AccentParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 20;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 50;
      pos[i3 + 1] = (Math.random() - 0.5) * 50;
      pos[i3 + 2] = 1 + Math.random();
    }
    
    return pos;
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions.array[i3 + 2] = 1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.5;
      }
      
      positions.needsUpdate = true;
      
      // Pulse opacity
      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#DFFF00"
        size={0.25}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

function HeroScene() {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 50]}
        zoom={18}
        near={0.1}
        far={1000}
      />
      
      <ambientLight intensity={0.3} />
      
      <HeroGrid />
      <HeroParticles />
      <AccentParticles />
    </>
  );
}

export function HeroCanvas({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
