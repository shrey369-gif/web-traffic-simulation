// Dynamic Weighted A* Pathfinding

import type { RoadNetwork, RoadNode, Vector2 } from '../simulation-config';

interface PathNode {
  id: string;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // Total cost
  parent: string | null;
}

// A* pathfinding with dynamic congestion weights
export function findPath(
  network: RoadNetwork,
  startId: string,
  endId: string,
  congestionWeight: number = 1.0
): string[] {
  const start = network.nodes.get(startId);
  const end = network.nodes.get(endId);
  
  if (!start || !end) return [];
  if (startId === endId) return [startId];
  
  const openSet = new Map<string, PathNode>();
  const closedSet = new Set<string>();
  
  // Initialize start node
  openSet.set(startId, {
    id: startId,
    g: 0,
    h: heuristic(start.position, end.position),
    f: heuristic(start.position, end.position),
    parent: null,
  });
  
  while (openSet.size > 0) {
    // Find node with lowest f score
    let current: PathNode | null = null;
    let currentKey = '';
    
    openSet.forEach((node, key) => {
      if (!current || node.f < current.f) {
        current = node;
        currentKey = key;
      }
    });
    
    if (!current) break;
    
    // Found the goal
    if (currentKey === endId) {
      return reconstructPath(openSet, closedSet, current);
    }
    
    // Move current to closed set
    openSet.delete(currentKey);
    closedSet.add(currentKey);
    
    // Process neighbors
    const currentNode = network.nodes.get(currentKey)!;
    
    for (const neighborId of currentNode.connections) {
      if (closedSet.has(neighborId)) continue;
      
      const neighbor = network.nodes.get(neighborId)!;
      const edge = getEdge(network, currentKey, neighborId);
      
      // Calculate cost with congestion factor
      const baseCost = edge ? edge.length : heuristic(currentNode.position, neighbor.position);
      const congestionFactor = edge ? 1 + edge.congestion * congestionWeight : 1;
      const moveCost = baseCost * congestionFactor;
      
      const tentativeG = current.g + moveCost;
      
      const existing = openSet.get(neighborId);
      
      if (!existing || tentativeG < existing.g) {
        const h = heuristic(neighbor.position, end.position);
        const newNode: PathNode = {
          id: neighborId,
          g: tentativeG,
          h,
          f: tentativeG + h,
          parent: currentKey,
        };
        openSet.set(neighborId, newNode);
      }
    }
  }
  
  // No path found - return partial path or empty
  return [];
}

function heuristic(a: Vector2, b: Vector2): number {
  // Manhattan distance for grid-like networks
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
}

function getEdge(network: RoadNetwork, from: string, to: string) {
  const id1 = `edge_${from}_${to}`;
  const id2 = `edge_${to}_${from}`;
  return network.edges.get(id1) || network.edges.get(id2);
}

function reconstructPath(
  openSet: Map<string, PathNode>,
  closedSet: Set<string>,
  endNode: PathNode
): string[] {
  const path: string[] = [];
  let current: PathNode | undefined = endNode;
  
  // Build a map of all nodes for parent lookup
  const allNodes = new Map<string, PathNode>();
  openSet.forEach((node, id) => allNodes.set(id, node));
  
  while (current) {
    path.unshift(current.id);
    if (current.parent) {
      current = allNodes.get(current.parent);
    } else {
      break;
    }
  }
  
  return path;
}

// Find random destination from current position
export function findRandomDestination(
  network: RoadNetwork,
  currentId: string,
  minDistance: number = 5
): string | null {
  const current = network.nodes.get(currentId);
  if (!current) return null;
  
  const candidates: { id: string; distance: number }[] = [];
  
  network.nodes.forEach((node, id) => {
    if (id === currentId) return;
    
    const dist = Math.abs(node.position.x - current.position.x) + 
                 Math.abs(node.position.y - current.position.y);
    
    if (dist >= minDistance) {
      candidates.push({ id, distance: dist });
    }
  });
  
  if (candidates.length === 0) {
    // If no far nodes, just pick any other node
    const nodeIds = Array.from(network.nodes.keys()).filter(id => id !== currentId);
    return nodeIds[Math.floor(Math.random() * nodeIds.length)] || null;
  }
  
  // Pick random candidate weighted by distance
  const totalWeight = candidates.reduce((sum, c) => sum + c.distance, 0);
  let random = Math.random() * totalWeight;
  
  for (const candidate of candidates) {
    random -= candidate.distance;
    if (random <= 0) {
      return candidate.id;
    }
  }
  
  return candidates[candidates.length - 1]?.id || null;
}
