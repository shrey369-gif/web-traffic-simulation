// Core Simulation Engine - Tick-based Reactive Loop

import type { 
  SimulationState, 
  SimulationParams, 
  SimulationStats,
  Vehicle,
  RoadNetwork 
} from '../simulation-config';
import { DEFAULT_PARAMS, SIMULATION_BOUNDS } from '../simulation-config';
import { generateRoadNetwork, getSpawnNodes } from './road-network';
import { spawnVehicle, updateVehicle, rerouteVehicle } from './vehicle';
import { updateTrafficSignals } from './traffic-signal';

export class SimulationEngine {
  private state: SimulationState;
  private params: SimulationParams;
  private lastTick: number = 0;
  private accumulatedTime: number = 0;
  private tickInterval: number = 1000 / 60; // 60 FPS
  private listeners: Set<(state: SimulationState) => void> = new Set();
  private spawnTimer: number = 0;
  private rerouteTimer: number = 0;
  
  constructor(params: Partial<SimulationParams> = {}) {
    this.params = { ...DEFAULT_PARAMS, ...params };
    this.state = this.createInitialState();
  }
  
  private createInitialState(): SimulationState {
    const network = generateRoadNetwork({
      cols: this.params.gridSize.cols,
      rows: this.params.gridSize.rows,
      spacing: 6,
      randomness: this.params.gridRandomness,
      seed: Date.now(),
    });
    
    return {
      vehicles: new Map(),
      network,
      tick: 0,
      running: false,
      stats: {
        totalVehicles: 0,
        avgSpeed: 0,
        throughput: 0,
        congestionNodes: 0,
        violations: 0,
        collisionsAvoided: 0,
      },
    };
  }
  
  // Subscribe to state changes
  subscribe(listener: (state: SimulationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    const stateCopy = { ...this.state };
    this.listeners.forEach((listener) => listener(stateCopy));
  }
  
  // Start the simulation loop
  start(): void {
    if (this.state.running) return;
    
    this.state.running = true;
    this.lastTick = performance.now();
    this.loop();
  }
  
  // Stop the simulation
  stop(): void {
    this.state.running = false;
  }
  
  // Reset the simulation
  reset(): void {
    this.stop();
    this.state = this.createInitialState();
    this.spawnTimer = 0;
    this.rerouteTimer = 0;
    this.notifyListeners();
  }
  
  // Update parameters
  setParams(params: Partial<SimulationParams>): void {
    this.params = { ...this.params, ...params };
    
    // If grid size changed, regenerate network
    if (params.gridSize || params.gridRandomness !== undefined) {
      const wasRunning = this.state.running;
      this.reset();
      if (wasRunning) this.start();
    }
  }
  
  getParams(): SimulationParams {
    return { ...this.params };
  }
  
  getState(): SimulationState {
    return this.state;
  }
  
  // Main simulation loop
  private loop = (): void => {
    if (!this.state.running) return;
    
    const now = performance.now();
    const deltaTime = (now - this.lastTick) / 1000; // Convert to seconds
    this.lastTick = now;
    
    this.accumulatedTime += deltaTime;
    
    // Fixed timestep for consistent simulation
    const fixedDelta = 1 / 60;
    
    while (this.accumulatedTime >= fixedDelta) {
      this.tick(fixedDelta);
      this.accumulatedTime -= fixedDelta;
    }
    
    this.notifyListeners();
    requestAnimationFrame(this.loop);
  };
  
  // Single simulation tick
  private tick(deltaTime: number): void {
    this.state.tick++;
    
    // Update traffic signals
    updateTrafficSignals(this.state.network, deltaTime);
    
    // Spawn new vehicles
    this.handleSpawning(deltaTime);
    
    // Update all vehicles
    this.updateVehicles(deltaTime);
    
    // Periodic rerouting
    this.handleRerouting(deltaTime);
    
    // Update edge congestion
    this.updateCongestion();
    
    // Calculate statistics
    this.updateStats();
  }
  
  private handleSpawning(deltaTime: number): void {
    this.spawnTimer += deltaTime;
    
    // Spawn rate based on density parameter
    const spawnInterval = 0.5 / this.params.vehicleDensity;
    
    if (this.spawnTimer >= spawnInterval && 
        this.state.vehicles.size < this.params.maxVehicles) {
      this.spawnTimer = 0;
      
      const spawnNodes = getSpawnNodes(this.state.network);
      if (spawnNodes.length === 0) return;
      
      // Pick random spawn point
      const spawnNode = spawnNodes[Math.floor(Math.random() * spawnNodes.length)];
      
      // Check if spawn point is clear
      let canSpawn = true;
      this.state.vehicles.forEach((v) => {
        const dx = v.position.x - spawnNode.position.x;
        const dy = v.position.y - spawnNode.position.y;
        if (Math.sqrt(dx * dx + dy * dy) < 2) {
          canSpawn = false;
        }
      });
      
      if (canSpawn) {
        const vehicle = spawnVehicle(
          spawnNode, 
          this.state.network, 
          this.params.aggressionBias
        );
        
        if (vehicle) {
          this.state.vehicles.set(vehicle.id, vehicle);
        }
      }
    }
  }
  
  private updateVehicles(deltaTime: number): void {
    const toRemove: string[] = [];
    let collisionsAvoided = 0;
    
    this.state.vehicles.forEach((vehicle, id) => {
      const result = updateVehicle(
        vehicle,
        this.state.network,
        this.state.vehicles,
        deltaTime,
        this.params.entropyLevel
      );
      
      if (result.reachedDestination) {
        toRemove.push(id);
        this.state.stats.throughput++;
      } else {
        this.state.vehicles.set(id, result.vehicle);
        
        if (result.collision) {
          collisionsAvoided++;
        }
      }
      
      // Remove vehicles that left bounds
      if (this.isOutOfBounds(vehicle.position)) {
        toRemove.push(id);
      }
    });
    
    // Remove completed vehicles
    toRemove.forEach((id) => this.state.vehicles.delete(id));
    
    this.state.stats.collisionsAvoided += collisionsAvoided;
  }
  
  private handleRerouting(deltaTime: number): void {
    this.rerouteTimer += deltaTime;
    
    // Reroute check every 2 seconds
    if (this.rerouteTimer >= 2) {
      this.rerouteTimer = 0;
      
      // Only reroute some vehicles to avoid performance issues
      const vehicles = Array.from(this.state.vehicles.values());
      const toReroute = vehicles.slice(0, Math.ceil(vehicles.length * 0.1));
      
      toReroute.forEach((vehicle) => {
        const rerouted = rerouteVehicle(vehicle, this.state.network);
        this.state.vehicles.set(vehicle.id, rerouted);
      });
    }
  }
  
  private updateCongestion(): void {
    // Reset congestion
    this.state.network.edges.forEach((edge) => {
      edge.vehicles = [];
      edge.congestion = 0;
    });
    
    // Count vehicles on each edge
    this.state.vehicles.forEach((vehicle) => {
      if (vehicle.pathIndex < vehicle.path.length - 1) {
        const from = vehicle.path[vehicle.pathIndex];
        const to = vehicle.path[vehicle.pathIndex + 1];
        
        const edge = this.state.network.edges.get(`edge_${from}_${to}`) ||
                     this.state.network.edges.get(`edge_${to}_${from}`);
        
        if (edge) {
          edge.vehicles.push(vehicle.id);
        }
      }
    });
    
    // Calculate congestion based on vehicle count
    this.state.network.edges.forEach((edge) => {
      const maxVehicles = edge.lanes * 3; // 3 vehicles per lane is congested
      edge.congestion = Math.min(edge.vehicles.length / maxVehicles, 1);
    });
  }
  
  private updateStats(): void {
    const vehicles = Array.from(this.state.vehicles.values());
    
    this.state.stats.totalVehicles = vehicles.length;
    
    // Average speed
    if (vehicles.length > 0) {
      const totalSpeed = vehicles.reduce((sum, v) => sum + v.currentSpeed, 0);
      this.state.stats.avgSpeed = totalSpeed / vehicles.length;
    } else {
      this.state.stats.avgSpeed = 0;
    }
    
    // Count congested nodes
    let congestionNodes = 0;
    this.state.network.edges.forEach((edge) => {
      if (edge.congestion > 0.7) {
        congestionNodes++;
      }
    });
    this.state.stats.congestionNodes = congestionNodes;
  }
  
  private isOutOfBounds(position: { x: number; y: number }): boolean {
    return position.x < SIMULATION_BOUNDS.minX - 5 ||
           position.x > SIMULATION_BOUNDS.maxX + 5 ||
           position.y < SIMULATION_BOUNDS.minY - 5 ||
           position.y > SIMULATION_BOUNDS.maxY + 5;
  }
}

// Singleton instance for global access
let engineInstance: SimulationEngine | null = null;

export function getSimulationEngine(params?: Partial<SimulationParams>): SimulationEngine {
  if (!engineInstance) {
    engineInstance = new SimulationEngine(params);
  }
  return engineInstance;
}

export function resetSimulationEngine(params?: Partial<SimulationParams>): SimulationEngine {
  if (engineInstance) {
    engineInstance.stop();
  }
  engineInstance = new SimulationEngine(params);
  return engineInstance;
}
