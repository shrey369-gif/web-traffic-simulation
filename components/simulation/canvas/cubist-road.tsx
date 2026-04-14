'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { RoadNetwork } from '@/lib/simulation-config';
import { getSignalColor } from '@/lib/simulation/traffic-signal';

interface CubistRoadsProps {
  network: RoadNetwork;
}

// Individual road edge as overlapping planes
function RoadEdge({ 
  from, 
  to, 
  congestion,
  lanes 
}: { 
  from: { x: number; y: number };
  to: { x: number; y: number };
  congestion: number;
  lanes: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const { position, rotation, length } = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    return {
      position: [(from.x + to.x) / 2, (from.y + to.y) / 2, 0] as [number, number, number],
      rotation: [0, 0, angle] as [number, number, number],
      length: len,
    };
  }, [from, to]);
  
  const width = 0.3 + lanes * 0.15;
  
  // Animate based on congestion
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + congestion * 10) * 0.1;
      meshRef.current.position.z = congestion * 0.2 + pulse * congestion;
    }
  });
  
  // Color based on congestion
  const color = useMemo(() => {
    const white = new THREE.Color('#ffffff');
    const acid = new THREE.Color('#DFFF00');
    return white.lerp(acid, congestion);
  }, [congestion]);
  
  return (
    <group position={position} rotation={rotation}>
      {/* Main road plane */}
      <mesh ref={meshRef}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15 + congestion * 0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Secondary tilted plane for depth */}
      <mesh rotation={[0.15, 0, 0]} position={[0, 0, 0.05]}>
        <planeGeometry args={[length * 0.95, width * 0.8]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Road edge lines */}
      <mesh position={[0, width / 2, 0.02]}>
        <planeGeometry args={[length, 0.03]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, -width / 2, 0.02]}>
        <planeGeometry args={[length, 0.03]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Traffic signal visualization
function TrafficSignal({ 
  position, 
  phase,
  timer
}: { 
  position: { x: number; y: number };
  phase: 'green' | 'yellow' | 'red';
  timer: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = getSignalColor(phase);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Pulse effect
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      meshRef.current.scale.setScalar(pulse * 0.15);
    }
  });
  
  return (
    <mesh 
      ref={meshRef} 
      position={[position.x, position.y, 0.3]}
    >
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
}

// Intersection node
function IntersectionNode({ 
  position, 
  signal 
}: { 
  position: { x: number; y: number };
  signal?: { phase: 'green' | 'yellow' | 'red'; timer: number };
}) {
  return (
    <group position={[position.x, position.y, 0]}>
      {/* Intersection marker */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2}
        />
      </mesh>
      
      {/* Traffic signal if present */}
      {signal && (
        <TrafficSignal 
          position={{ x: 0, y: 0 }} 
          phase={signal.phase} 
          timer={signal.timer}
        />
      )}
    </group>
  );
}

export function CubistRoads({ network }: CubistRoadsProps) {
  const edges = useMemo(() => {
    const edgeData: {
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
      congestion: number;
      lanes: number;
    }[] = [];
    
    network.edges.forEach((edge) => {
      const fromNode = network.nodes.get(edge.from);
      const toNode = network.nodes.get(edge.to);
      
      if (fromNode && toNode) {
        edgeData.push({
          id: edge.id,
          from: fromNode.position,
          to: toNode.position,
          congestion: edge.congestion,
          lanes: edge.lanes,
        });
      }
    });
    
    return edgeData;
  }, [network]);
  
  const intersections = useMemo(() => {
    const nodes: {
      id: string;
      position: { x: number; y: number };
      signal?: { phase: 'green' | 'yellow' | 'red'; timer: number };
    }[] = [];
    
    network.nodes.forEach((node) => {
      if (node.isIntersection) {
        nodes.push({
          id: node.id,
          position: node.position,
          signal: node.signal ? {
            phase: node.signal.phase,
            timer: node.signal.timer,
          } : undefined,
        });
      }
    });
    
    return nodes;
  }, [network]);
  
  return (
    <group>
      {/* Road edges */}
      {edges.map((edge) => (
        <RoadEdge
          key={edge.id}
          from={edge.from}
          to={edge.to}
          congestion={edge.congestion}
          lanes={edge.lanes}
        />
      ))}
      
      {/* Intersection nodes */}
      {intersections.map((node) => (
        <IntersectionNode
          key={node.id}
          position={node.position}
          signal={node.signal}
        />
      ))}
    </group>
  );
}
