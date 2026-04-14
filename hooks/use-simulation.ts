'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSimulationStore } from '@/lib/simulation/store';
import { SimulationEngine, getSimulationEngine, resetSimulationEngine } from '@/lib/simulation/simulation-engine';
import type { SimulationParams } from '@/lib/simulation-config';

export function useSimulation(initialParams?: Partial<SimulationParams>) {
  const engineRef = useRef<SimulationEngine | null>(null);
  const store = useSimulationStore();
  
  // Initialize engine
  useEffect(() => {
    engineRef.current = getSimulationEngine(initialParams);
    
    // Subscribe to engine updates
    const unsubscribe = engineRef.current.subscribe((state) => {
      store.updateFromState(state);
    });
    
    // Initial state sync
    store.updateFromState(engineRef.current.getState());
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Start simulation
  const start = useCallback(() => {
    engineRef.current?.start();
  }, []);
  
  // Stop simulation
  const stop = useCallback(() => {
    engineRef.current?.stop();
  }, []);
  
  // Toggle simulation
  const toggle = useCallback(() => {
    if (store.isRunning) {
      stop();
    } else {
      start();
    }
  }, [store.isRunning, start, stop]);
  
  // Reset simulation
  const reset = useCallback((params?: Partial<SimulationParams>) => {
    engineRef.current = resetSimulationEngine(params || store.params);
    
    const unsubscribe = engineRef.current.subscribe((state) => {
      store.updateFromState(state);
    });
    
    store.updateFromState(engineRef.current.getState());
    
    return unsubscribe;
  }, [store.params]);
  
  // Update parameters
  const setParams = useCallback((params: Partial<SimulationParams>) => {
    store.setParams(params);
    engineRef.current?.setParams(params);
  }, []);
  
  return {
    // State
    vehicles: store.vehicles,
    network: store.network,
    stats: store.stats,
    params: store.params,
    isRunning: store.isRunning,
    tick: store.tick,
    
    // Actions
    start,
    stop,
    toggle,
    reset,
    setParams,
  };
}

// Lightweight hook for components that only need to read state
export function useSimulationState() {
  return useSimulationStore((state) => ({
    vehicles: state.vehicles,
    network: state.network,
    stats: state.stats,
    isRunning: state.isRunning,
    tick: state.tick,
  }));
}

// Hook for stats only (optimized re-renders)
export function useSimulationStats() {
  return useSimulationStore((state) => state.stats);
}
