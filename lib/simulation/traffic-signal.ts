// Adaptive Traffic Signal System

import type { RoadNetwork, TrafficSignal, SignalPhase } from '../simulation-config';

// Update all traffic signals in the network
export function updateTrafficSignals(
  network: RoadNetwork,
  deltaTime: number
): void {
  network.nodes.forEach((node) => {
    if (!node.signal) return;
    
    const signal = node.signal;
    signal.timer -= deltaTime;
    
    if (signal.timer <= 0) {
      // Transition to next phase
      const nextPhase = getNextPhase(signal.phase);
      signal.phase = nextPhase;
      signal.timer = getPhaseDuration(signal, nextPhase);
      
      // Adaptive timing - adjust based on congestion
      if (signal.adaptiveMode) {
        adjustSignalTiming(signal, network, node.id);
      }
    }
  });
}

function getNextPhase(current: SignalPhase): SignalPhase {
  switch (current) {
    case 'green':
      return 'yellow';
    case 'yellow':
      return 'red';
    case 'red':
      return 'green';
    default:
      return 'red';
  }
}

function getPhaseDuration(signal: TrafficSignal, phase: SignalPhase): number {
  switch (phase) {
    case 'green':
      return signal.greenDuration;
    case 'yellow':
      return signal.yellowDuration;
    case 'red':
      return signal.redDuration;
    default:
      return signal.greenDuration;
  }
}

// Adapt signal timing based on traffic density
function adjustSignalTiming(
  signal: TrafficSignal,
  network: RoadNetwork,
  nodeId: string
): void {
  const node = network.nodes.get(nodeId);
  if (!node) return;
  
  // Count vehicles in adjacent edges
  let totalCongestion = 0;
  let edgeCount = 0;
  
  node.connections.forEach((connId) => {
    const edge1 = network.edges.get(`edge_${nodeId}_${connId}`);
    const edge2 = network.edges.get(`edge_${connId}_${nodeId}`);
    const edge = edge1 || edge2;
    
    if (edge) {
      totalCongestion += edge.congestion;
      edgeCount++;
    }
  });
  
  const avgCongestion = edgeCount > 0 ? totalCongestion / edgeCount : 0;
  
  // Adjust green duration based on congestion
  const baseDuration = 5;
  const maxDuration = 12;
  
  signal.greenDuration = baseDuration + avgCongestion * (maxDuration - baseDuration);
  signal.redDuration = signal.greenDuration + signal.yellowDuration;
}

// Get signal state for rendering
export function getSignalColor(phase: SignalPhase): string {
  switch (phase) {
    case 'green':
      return '#00ff00';
    case 'yellow':
      return '#DFFF00'; // Acid yellow
    case 'red':
      return '#ff0000';
    default:
      return '#ff0000';
  }
}
