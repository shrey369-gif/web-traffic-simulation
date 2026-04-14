'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { generateRoadNetwork } from '@/lib/simulation/road-network';

interface ScenarioPreviewProps {
  cols: number;
  rows: number;
  randomness: number;
  seed: number;
  className?: string;
}

function PreviewGrid({ cols, rows, randomness, seed }: Omit<ScenarioPreviewProps, 'className'>) {
  const groupRef = useRef<THREE.Group>(null);
  
  const network = useMemo(() => {
    return generateRoadNetwork({
      cols,
      rows,
      spacing: 5,
      randomness,
      seed,
    });
  }, [cols, rows, randomness, seed]);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.01;
    }
  });
  
  const edges = useMemo(() => {
    const edgeData: {
      from: { x: number; y: number };
      to: { x: number; y: number };
    }[] = [];
    
    network.edges.forEach((edge) => {
      const fromNode = network.nodes.get(edge.from);
      const toNode = network.nodes.get(edge.to);
      
      if (fromNode && toNode) {
        edgeData.push({
          from: fromNode.position,
          to: toNode.position,
        });
      }
    });
    
    return edgeData;
  }, [network]);
  
  const nodes = useMemo(() => {
    const nodeData: { position: { x: number; y: number }; hasSignal: boolean }[] = [];
    
    network.nodes.forEach((node) => {
      nodeData.push({
        position: node.position,
        hasSignal: !!node.signal,
      });
    });
    
    return nodeData;
  }, [network]);
  
  return (
    <group ref={groupRef}>
      {/* Grid background */}
      <gridHelper 
        args={[40, 20, '#1a1a1a', '#1a1a1a']} 
        rotation={[Math.PI / 2, 0, 0]} 
        position={[0, 0, -0.5]}
      />
      
      {/* Road edges */}
      {edges.map((edge, i) => {
        const dx = edge.to.x - edge.from.x;
        const dy = edge.to.y - edge.from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const midX = (edge.from.x + edge.to.x) / 2;
        const midY = (edge.from.y + edge.to.y) / 2;
        
        return (
          <mesh 
            key={i} 
            position={[midX, midY, 0]} 
            rotation={[0, 0, angle]}
          >
            <planeGeometry args={[length, 0.3]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </mesh>
        );
      })}
      
      {/* Nodes */}
      {nodes.map((node, i) => (
        <mesh key={i} position={[node.position.x, node.position.y, 0.1]}>
          <circleGeometry args={[0.15, 8]} />
          <meshBasicMaterial 
            color={node.hasSignal ? '#DFFF00' : '#ffffff'} 
            transparent 
            opacity={node.hasSignal ? 0.8 : 0.4} 
          />
        </mesh>
      ))}
    </group>
  );
}

export function ScenarioPreview({ cols, rows, randomness, seed, className = '' }: ScenarioPreviewProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: '#000000' }}
      >
        <Suspense fallback={null}>
          <OrthographicCamera
            makeDefault
            position={[0, 0, 50]}
            zoom={12}
            near={0.1}
            far={1000}
          />
          
          <ambientLight intensity={0.5} />
          
          <PreviewGrid 
            cols={cols} 
            rows={rows} 
            randomness={randomness} 
            seed={seed} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
