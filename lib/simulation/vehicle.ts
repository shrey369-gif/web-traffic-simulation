// Vehicle System - Spawning, Movement, and Behavior

import type { 
  Vehicle, 
  VehicleType, 
  DriverBehavior, 
  Vector2,
  RoadNetwork,
  RoadNode
} from '../simulation-config';
import { 
  VEHICLE_SPAWN_WEIGHTS, 
  VEHICLE_PROPERTIES, 
  BEHAVIOR_MODIFIERS 
} from '../simulation-config';
import { findPath, findRandomDestination } from './pathfinding';

let vehicleIdCounter = 0;

// Spawn a new vehicle at a given position
export function spawnVehicle(
  spawnNode: RoadNode,
  network: RoadNetwork,
  aggressionBias: number = 0.3
): Vehicle | null {
  const type = selectVehicleType();
  const behavior = selectDriverBehavior(aggressionBias);
  const properties = VEHICLE_PROPERTIES[type];
  
  // Find a destination
  const destinationId = findRandomDestination(network, spawnNode.id, 8);
  if (!destinationId) return null;
  
  // Calculate path
  const path = findPath(network, spawnNode.id, destinationId);
  if (path.length < 2) return null;
  
  vehicleIdCounter++;
  
  const vehicle: Vehicle = {
    id: `vehicle_${vehicleIdCounter}`,
    type,
    position: { ...spawnNode.position },
    velocity: { x: 0, y: 0 },
    acceleration: { x: 0, y: 0 },
    rotation: 0,
    behavior,
    targetNode: path[1] || null,
    path,
    pathIndex: 0,
    color: properties.color,
    size: { ...properties.size },
    maxSpeed: properties.maxSpeed * BEHAVIOR_MODIFIERS[behavior].speedMultiplier,
    currentSpeed: 0,
  };
  
  return vehicle;
}

// Select vehicle type based on weighted probabilities
function selectVehicleType(): VehicleType {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [type, weight] of Object.entries(VEHICLE_SPAWN_WEIGHTS)) {
    cumulative += weight;
    if (random <= cumulative) {
      return type as VehicleType;
    }
  }
  
  return 'car';
}

// Select driver behavior based on aggression bias
function selectDriverBehavior(aggressionBias: number): DriverBehavior {
  const random = Math.random();
  
  // Higher aggression bias = more aggressive/normal, less defensive
  const aggressiveThreshold = 0.15 + aggressionBias * 0.25;
  const normalThreshold = aggressiveThreshold + 0.5;
  
  if (random < aggressiveThreshold) return 'aggressive';
  if (random < normalThreshold) return 'normal';
  return 'defensive';
}

// Update vehicle position and movement
export function updateVehicle(
  vehicle: Vehicle,
  network: RoadNetwork,
  allVehicles: Map<string, Vehicle>,
  deltaTime: number,
  entropyLevel: number
): { vehicle: Vehicle; reachedDestination: boolean; collision: boolean } {
  let reachedDestination = false;
  let collision = false;
  
  // Get current target node
  const targetNode = vehicle.targetNode ? network.nodes.get(vehicle.targetNode) : null;
  
  if (!targetNode) {
    // No target - vehicle has reached destination or is lost
    reachedDestination = true;
    return { vehicle, reachedDestination, collision };
  }
  
  // Calculate direction to target
  const dx = targetNode.position.x - vehicle.position.x;
  const dy = targetNode.position.y - vehicle.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Check if reached current target node
  if (distance < 0.3) {
    // Move to next node in path
    vehicle.pathIndex++;
    
    if (vehicle.pathIndex >= vehicle.path.length - 1) {
      // Reached final destination
      reachedDestination = true;
      return { vehicle, reachedDestination, collision };
    }
    
    vehicle.targetNode = vehicle.path[vehicle.pathIndex + 1] || null;
    return { vehicle, reachedDestination, collision };
  }
  
  // Normalize direction
  const dirX = dx / distance;
  const dirY = dy / distance;
  
  // Calculate target rotation
  const targetRotation = Math.atan2(dy, dx);
  
  // Smooth rotation
  let rotationDiff = targetRotation - vehicle.rotation;
  while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
  while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
  vehicle.rotation += rotationDiff * 0.1;
  
  // Check for nearby vehicles (collision avoidance)
  const behaviorMods = BEHAVIOR_MODIFIERS[vehicle.behavior];
  const followDistance = behaviorMods.followDistance * 2;
  let shouldSlow = false;
  let avoidanceVector = { x: 0, y: 0 };
  
  allVehicles.forEach((other) => {
    if (other.id === vehicle.id) return;
    
    const odx = other.position.x - vehicle.position.x;
    const ody = other.position.y - vehicle.position.y;
    const otherDist = Math.sqrt(odx * odx + ody * ody);
    
    if (otherDist < followDistance) {
      // Check if other vehicle is ahead
      const dotProduct = dirX * odx + dirY * ody;
      
      if (dotProduct > 0) {
        shouldSlow = true;
        collision = otherDist < 0.5;
        
        // Calculate avoidance
        if (otherDist > 0.1) {
          avoidanceVector.x -= (odx / otherDist) * (1 - otherDist / followDistance);
          avoidanceVector.y -= (ody / otherDist) * (1 - otherDist / followDistance);
        }
      }
    }
  });
  
  // Check traffic signals
  const currentNode = vehicle.path[vehicle.pathIndex];
  const node = network.nodes.get(currentNode);
  
  if (node?.signal && distance < 2) {
    if (node.signal.phase === 'red') {
      // Should stop at red light
      const violationChance = behaviorMods.signalViolationChance * (1 + entropyLevel);
      if (Math.random() > violationChance) {
        shouldSlow = true;
      }
    } else if (node.signal.phase === 'yellow') {
      // Slow down for yellow
      shouldSlow = vehicle.behavior !== 'aggressive';
    }
  }
  
  // Calculate target speed
  let targetSpeed = vehicle.maxSpeed;
  
  if (shouldSlow) {
    targetSpeed *= 0.2;
  }
  
  // Add entropy-based randomness
  targetSpeed *= (1 + (Math.random() - 0.5) * entropyLevel * 0.2);
  
  // Accelerate/decelerate
  const properties = VEHICLE_PROPERTIES[vehicle.type];
  const acceleration = properties.acceleration;
  
  if (vehicle.currentSpeed < targetSpeed) {
    vehicle.currentSpeed = Math.min(vehicle.currentSpeed + acceleration * deltaTime * 60, targetSpeed);
  } else {
    vehicle.currentSpeed = Math.max(vehicle.currentSpeed - acceleration * 2 * deltaTime * 60, targetSpeed);
  }
  
  // Apply movement with avoidance
  const moveX = dirX + avoidanceVector.x * 0.3;
  const moveY = dirY + avoidanceVector.y * 0.3;
  const moveMag = Math.sqrt(moveX * moveX + moveY * moveY);
  
  if (moveMag > 0) {
    vehicle.velocity.x = (moveX / moveMag) * vehicle.currentSpeed;
    vehicle.velocity.y = (moveY / moveMag) * vehicle.currentSpeed;
  }
  
  vehicle.position.x += vehicle.velocity.x * deltaTime;
  vehicle.position.y += vehicle.velocity.y * deltaTime;
  
  return { vehicle, reachedDestination, collision };
}

// Reroute vehicle if path is congested
export function rerouteVehicle(
  vehicle: Vehicle,
  network: RoadNetwork
): Vehicle {
  if (!vehicle.targetNode || vehicle.pathIndex >= vehicle.path.length - 1) {
    return vehicle;
  }
  
  const currentNode = vehicle.path[vehicle.pathIndex];
  const destination = vehicle.path[vehicle.path.length - 1];
  
  // Recalculate path with higher congestion weight
  const newPath = findPath(network, currentNode, destination, 2.0);
  
  if (newPath.length > 1) {
    vehicle.path = newPath;
    vehicle.pathIndex = 0;
    vehicle.targetNode = newPath[1];
  }
  
  return vehicle;
}
