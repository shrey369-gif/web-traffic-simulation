// Procedural Road Network Generation

import type { RoadNetwork, RoadNode, RoadEdge, TrafficSignal, Vector2 } from '../simulation-config';
import { createNoise, seededRandom } from '../noise';

export interface RoadNetworkParams {
  cols: number;
  rows: number;
  spacing: number;
  randomness: number;
  seed?: number;
}

export function generateRoadNetwork(params: RoadNetworkParams): RoadNetwork {
  const { cols, rows, spacing, randomness, seed = Date.now() } = params;
  const nodes = new Map<string, RoadNode>();
  const edges = new Map<string, RoadEdge>();
  
  const noise = createNoise(seed);
  const random = seededRandom(seed);
  
  const width = (cols - 1) * spacing;
  const height = (rows - 1) * spacing;
  const offsetX = -width / 2;
  const offsetY = -height / 2;
  
  // Generate nodes (intersections)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const baseX = offsetX + col * spacing;
      const baseY = offsetY + row * spacing;
      
      // Apply noise-based randomness
      const noiseX = noise(col * 0.5, row * 0.5) * randomness * spacing;
      const noiseY = noise(col * 0.5 + 100, row * 0.5 + 100) * randomness * spacing;
      
      const id = `node_${col}_${row}`;
      const position: Vector2 = {
        x: baseX + noiseX,
        y: baseY + noiseY,
      };
      
      // Determine if this is an intersection (has multiple connections)
      const isEdge = col === 0 || col === cols - 1 || row === 0 || row === rows - 1;
      const isIntersection = !isEdge || (col === 0 && row === 0) || 
                             (col === cols - 1 && row === rows - 1);
      
      const node: RoadNode = {
        id,
        position,
        connections: [],
        isIntersection,
      };
      
      // Add traffic signal to intersections (not edge nodes)
      if (isIntersection && !isEdge) {
        node.signal = createTrafficSignal(id, random);
      }
      
      nodes.set(id, node);
    }
  }
  
  // Generate edges (roads)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const currentId = `node_${col}_${row}`;
      const current = nodes.get(currentId)!;
      
      // Connect to right neighbor
      if (col < cols - 1) {
        const rightId = `node_${col + 1}_${row}`;
        const right = nodes.get(rightId)!;
        
        // Random chance to skip some roads for variety
        if (random() > 0.1) {
          createEdge(edges, current, right, random);
          current.connections.push(rightId);
          right.connections.push(currentId);
        }
      }
      
      // Connect to bottom neighbor
      if (row < rows - 1) {
        const bottomId = `node_${col}_${row + 1}`;
        const bottom = nodes.get(bottomId)!;
        
        if (random() > 0.1) {
          createEdge(edges, current, bottom, random);
          current.connections.push(bottomId);
          bottom.connections.push(currentId);
        }
      }
      
      // Diagonal connections for variety (less common)
      if (col < cols - 1 && row < rows - 1 && random() > 0.85) {
        const diagId = `node_${col + 1}_${row + 1}`;
        const diag = nodes.get(diagId)!;
        createEdge(edges, current, diag, random);
        current.connections.push(diagId);
        diag.connections.push(currentId);
      }
    }
  }
  
  // Ensure connectivity - add edges if any node has no connections
  nodes.forEach((node) => {
    if (node.connections.length === 0) {
      // Find nearest node and connect
      let nearestId: string | null = null;
      let nearestDist = Infinity;
      
      nodes.forEach((other) => {
        if (other.id !== node.id) {
          const dist = distance(node.position, other.position);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestId = other.id;
          }
        }
      });
      
      if (nearestId) {
        const nearest = nodes.get(nearestId)!;
        createEdge(edges, node, nearest, random);
        node.connections.push(nearestId);
        nearest.connections.push(node.id);
      }
    }
  });
  
  return {
    nodes,
    edges,
    width,
    height,
  };
}

function createEdge(
  edges: Map<string, RoadEdge>,
  from: RoadNode,
  to: RoadNode,
  random: () => number
): void {
  const id = `edge_${from.id}_${to.id}`;
  const reverseId = `edge_${to.id}_${from.id}`;
  
  // Don't create duplicate edges
  if (edges.has(id) || edges.has(reverseId)) return;
  
  const length = distance(from.position, to.position);
  const lanes = random() > 0.7 ? 2 : 1;
  
  edges.set(id, {
    id,
    from: from.id,
    to: to.id,
    lanes,
    length,
    congestion: 0,
    vehicles: [],
  });
}

function createTrafficSignal(nodeId: string, random: () => number): TrafficSignal {
  const baseGreen = 5 + random() * 5; // 5-10 seconds
  
  return {
    id: `signal_${nodeId}`,
    nodeId,
    phase: random() > 0.5 ? 'green' : 'red',
    timer: random() * baseGreen,
    greenDuration: baseGreen,
    yellowDuration: 2,
    redDuration: baseGreen + 2,
    adaptiveMode: true,
  };
}

function distance(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Get spawn points (edge nodes)
export function getSpawnNodes(network: RoadNetwork): RoadNode[] {
  const spawnNodes: RoadNode[] = [];
  
  network.nodes.forEach((node) => {
    // Edge nodes with at least one connection can be spawn points
    if (node.connections.length > 0 && node.connections.length <= 2) {
      spawnNodes.push(node);
    }
  });
  
  return spawnNodes;
}

// Get exit points
export function getExitNodes(network: RoadNetwork): RoadNode[] {
  return getSpawnNodes(network); // Same logic for this simulation
}
