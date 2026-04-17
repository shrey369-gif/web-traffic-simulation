/**
 * Export utilities for simulation data
 * Supports JSON and MATLAB formats
 */

import { SimulationState } from '@/lib/simulation/store';

/**
 * Export simulation state as JSON
 */
export function exportAsJSON(
  state: SimulationState,
  fileName: string = 'simulation.json'
): void {
  const dataStr = JSON.stringify(state, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(dataBlob, fileName);
}

/**
 * Export road network and vehicles as MATLAB-compatible format
 */
export function exportAsMatlab(
  state: SimulationState,
  fileName: string = 'simulation.m'
): void {
  const lines: string[] = [
    '% MATLAB Traffic Simulation Data',
    `% Generated: ${new Date().toISOString()}`,
    '',
    '% Road Network',
    'roads = struct();',
    `roads.count = ${state.network.roads.length};`,
    '',
  ];

  // Export roads
  state.network.roads.forEach((road, idx) => {
    lines.push(`roads.road_${idx} = struct(...`);
    lines.push(`  'start', [${road.start.x}, ${road.start.y}], ...`);
    lines.push(`  'end', [${road.end.x}, ${road.end.y}], ...`);
    lines.push(`  'width', ${road.width}, ...`);
    lines.push(`  'length', ${road.length});`);
  });

  lines.push('');
  lines.push('% Vehicles');
  lines.push('vehicles = struct();');
  lines.push(`vehicles.count = ${state.vehicles.length};`);
  lines.push('');

  // Export vehicles
  state.vehicles.forEach((vehicle, idx) => {
    lines.push(`vehicles.vehicle_${idx} = struct(...`);
    lines.push(`  'position', [${vehicle.position.x}, ${vehicle.position.y}], ...`);
    lines.push(`  'velocity', [${vehicle.velocity.x}, ${vehicle.velocity.y}], ...`);
    lines.push(`  'type', '${vehicle.type}', ...`);
    lines.push(`  'speed', ${vehicle.speed});`);
  });

  lines.push('');
  lines.push('% Simulation Statistics');
  lines.push('stats = struct();');
  lines.push(`stats.total_vehicles = ${state.vehicles.length};`);
  lines.push(`stats.total_roads = ${state.network.roads.length};`);

  const matlabCode = lines.join('\n');
  const dataBlob = new Blob([matlabCode], { type: 'text/plain' });
  downloadFile(dataBlob, fileName);
}

/**
 * Export scenario parameters as JSON
 */
export function exportScenarioParams(
  params: Record<string, any>,
  scenarioName: string = 'scenario.json'
): void {
  const dataStr = JSON.stringify(
    {
      name: scenarioName,
      createdAt: new Date().toISOString(),
      parameters: params,
    },
    null,
    2
  );
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  downloadFile(dataBlob, scenarioName);
}

/**
 * Import scenario parameters from JSON file
 */
export function importScenarioParams(
  file: File
): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data.parameters || data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Helper function to download a blob as a file
 */
function downloadFile(blob: Blob, fileName: string): void {
  if (typeof window === 'undefined') return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create a CSV export of statistics
 */
export function exportStatsAsCSV(
  stats: any[],
  fileName: string = 'traffic-stats.csv'
): void {
  const headers = Object.keys(stats[0] || {});
  const rows = [headers.join(',')];

  stats.forEach((stat) => {
    const values = headers.map((header) => {
      const value = stat[header];
      return typeof value === 'string' ? `"${value}"` : value;
    });
    rows.push(values.join(','));
  });

  const csvContent = rows.join('\n');
  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  downloadFile(dataBlob, fileName);
}
