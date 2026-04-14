'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CubistVehicles } from './cubist-vehicle';
import { CubistRoads } from './cubist-road';
import { GeometricGrid } from './geometric-grid';
import { useSimulationState } from '@/hooks/use-simulation';

interface SimulationCanvasProps {
  className?: string;
  showGrid?: boolean;
  interactive?: boolean;
  zoom?: number;
}

function CameraController({ zoom }: { zoom: number }) {
  const { camera } = useThree();
  
  useEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
  }, [camera, zoom]);
  
  return null;
}

function Scene({ showGrid, zoom }: { showGrid: boolean; zoom: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { vehicles, network, stats, isRunning } = useSimulationState();
  
  // Subtle scene rotation based on simulation activity
  useFrame((state) => {
    if (groupRef.current && isRunning) {
      const stress = Math.min(stats.congestionNodes / 10, 1);
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.02 * (1 + stress);
    }
  });
  
  return (
    <>
      <CameraController zoom={zoom} />
      <OrthographicCamera
        makeDefault
        position={[0, 0, 50]}
        zoom={zoom}
        near={0.1}
        far={1000}
      />
      
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 10]} intensity={0.6} />
      <directionalLight position={[-10, -10, 5]} intensity={0.3} />
      
      <group ref={groupRef}>
        {/* Background grid */}
        {showGrid && <GeometricGrid size={50} divisions={20} />}
        
        {/* Road network */}
        {network && <CubistRoads network={network} />}
        
        {/* Vehicles */}
        <CubistVehicles vehicles={vehicles} />
      </group>
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial color="#0a0a0a" />
    </mesh>
  );
}

export function SimulationCanvas({ 
  className = '', 
  showGrid = true,
  interactive = true,
  zoom = 15
}: SimulationCanvasProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        style={{ background: '#000000' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene showGrid={showGrid} zoom={zoom} />
        </Suspense>
      </Canvas>
    </div>
  );
}
