// Simulation Configuration and Type Definitions

export type VehicleType = 'car' | 'bike' | 'auto' | 'bus' | 'truck';

export type DriverBehavior = 'aggressive' | 'normal' | 'defensive';

export type SignalPhase = 'green' | 'yellow' | 'red';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vehicle {
  id: string;
  type: VehicleType;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  rotation: number;
  behavior: DriverBehavior;
  targetNode: string | null;
  path: string[];
  pathIndex: number;
  color: string;
  size: { width: number; height: number };
  maxSpeed: number;
  currentSpeed: number;
}

export interface RoadNode {
  id: string;
  position: Vector2;
  connections: string[];
  isIntersection: boolean;
  signal?: TrafficSignal;
}

export interface RoadEdge {
  id: string;
  from: string;
  to: string;
  lanes: number;
  length: number;
  congestion: number; // 0-1 scale
  vehicles: string[];
}

export interface TrafficSignal {
  id: string;
  nodeId: string;
  phase: SignalPhase;
  timer: number;
  greenDuration: number;
  yellowDuration: number;
  redDuration: number;
  adaptiveMode: boolean;
}

export interface RoadNetwork {
  nodes: Map<string, RoadNode>;
  edges: Map<string, RoadEdge>;
  width: number;
  height: number;
}

export interface SimulationState {
  vehicles: Map<string, Vehicle>;
  network: RoadNetwork;
  tick: number;
  running: boolean;
  stats: SimulationStats;
}

export interface SimulationStats {
  totalVehicles: number;
  avgSpeed: number;
  throughput: number;
  congestionNodes: number;
  violations: number;
  collisionsAvoided: number;
}

export interface SimulationParams {
  vehicleDensity: number; // 0-1: Controls spawn rate
  entropyLevel: number;   // 0-1: Randomness in behavior
  aggressionBias: number; // 0-1: Likelihood of aggressive behavior
  gridSize: { cols: number; rows: number };
  gridRandomness: number; // 0-1: How irregular the grid is
  maxVehicles: number;
  tickRate: number; // Target FPS
}

// Vehicle spawn probabilities by type
export const VEHICLE_SPAWN_WEIGHTS: Record<VehicleType, number> = {
  car: 0.35,
  bike: 0.30,
  auto: 0.20,
  bus: 0.08,
  truck: 0.07,
};

// Vehicle properties by type
export const VEHICLE_PROPERTIES: Record<VehicleType, {
  maxSpeed: number;
  acceleration: number;
  size: { width: number; height: number };
  color: string;
}> = {
  car: {
    maxSpeed: 8,
    acceleration: 0.3,
    size: { width: 0.4, height: 0.8 },
    color: '#ffffff',
  },
  bike: {
    maxSpeed: 6,
    acceleration: 0.5,
    size: { width: 0.2, height: 0.4 },
    color: '#ffffff',
  },
  auto: {
    maxSpeed: 5,
    acceleration: 0.25,
    size: { width: 0.35, height: 0.5 },
    color: '#DFFF00',
  },
  bus: {
    maxSpeed: 4,
    acceleration: 0.15,
    size: { width: 0.5, height: 1.2 },
    color: '#ffffff',
  },
  truck: {
    maxSpeed: 3.5,
    acceleration: 0.1,
    size: { width: 0.5, height: 1.0 },
    color: '#e5e5e5',
  },
};

// Driver behavior modifiers
export const BEHAVIOR_MODIFIERS: Record<DriverBehavior, {
  speedMultiplier: number;
  followDistance: number;
  signalViolationChance: number;
  laneChangeFrequency: number;
}> = {
  aggressive: {
    speedMultiplier: 1.3,
    followDistance: 0.5,
    signalViolationChance: 0.15,
    laneChangeFrequency: 0.4,
  },
  normal: {
    speedMultiplier: 1.0,
    followDistance: 1.0,
    signalViolationChance: 0.02,
    laneChangeFrequency: 0.15,
  },
  defensive: {
    speedMultiplier: 0.8,
    followDistance: 1.5,
    signalViolationChance: 0.0,
    laneChangeFrequency: 0.05,
  },
};

// Default simulation parameters
export const DEFAULT_PARAMS: SimulationParams = {
  vehicleDensity: 0.5,
  entropyLevel: 0.3,
  aggressionBias: 0.3,
  gridSize: { cols: 6, rows: 6 },
  gridRandomness: 0.2,
  maxVehicles: 150,
  tickRate: 60,
};

// Simulation bounds
export const SIMULATION_BOUNDS = {
  minX: -20,
  maxX: 20,
  minY: -20,
  maxY: 20,
};
