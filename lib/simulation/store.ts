// Zustand Store for Simulation State Management

import { create } from 'zustand';
import type { SimulationState, SimulationParams, SimulationStats, Vehicle, RoadNetwork } from '../simulation-config';
import { DEFAULT_PARAMS } from '../simulation-config';

interface SimulationStore {
  // State
  vehicles: Vehicle[];
  network: RoadNetwork | null;
  stats: SimulationStats;
  params: SimulationParams;
  isRunning: boolean;
  tick: number;
  
  // Actions
  setVehicles: (vehicles: Vehicle[]) => void;
  setNetwork: (network: RoadNetwork) => void;
  setStats: (stats: SimulationStats) => void;
  setParams: (params: Partial<SimulationParams>) => void;
  setIsRunning: (running: boolean) => void;
  setTick: (tick: number) => void;
  updateFromState: (state: SimulationState) => void;
  reset: () => void;
}

const initialStats: SimulationStats = {
  totalVehicles: 0,
  avgSpeed: 0,
  throughput: 0,
  congestionNodes: 0,
  violations: 0,
  collisionsAvoided: 0,
};

export const useSimulationStore = create<SimulationStore>((set) => ({
  // Initial state
  vehicles: [],
  network: null,
  stats: initialStats,
  params: DEFAULT_PARAMS,
  isRunning: false,
  tick: 0,
  
  // Actions
  setVehicles: (vehicles) => set({ vehicles }),
  
  setNetwork: (network) => set({ network }),
  
  setStats: (stats) => set({ stats }),
  
  setParams: (params) => set((state) => ({
    params: { ...state.params, ...params }
  })),
  
  setIsRunning: (isRunning) => set({ isRunning }),
  
  setTick: (tick) => set({ tick }),
  
  updateFromState: (simState) => set({
    vehicles: Array.from(simState.vehicles.values()),
    network: simState.network,
    stats: simState.stats,
    isRunning: simState.running,
    tick: simState.tick,
  }),
  
  reset: () => set({
    vehicles: [],
    stats: initialStats,
    isRunning: false,
    tick: 0,
  }),
}));

// Derived selectors
export const selectVehicleCount = (state: SimulationStore) => state.vehicles.length;
export const selectAvgSpeed = (state: SimulationStore) => state.stats.avgSpeed;
export const selectThroughput = (state: SimulationStore) => state.stats.throughput;
export const selectCongestion = (state: SimulationStore) => state.stats.congestionNodes;
export const selectIsRunning = (state: SimulationStore) => state.isRunning;
