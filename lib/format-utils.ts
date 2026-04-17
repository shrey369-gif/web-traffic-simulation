// Utility for animating number counters
export function useCountUp(
  end: number,
  duration: number = 2000,
  start: number = 0,
  decimals: number = 0
) {
  // This would be used with a useEffect in a client component
  // For now, we'll just export the formatting logic
  return end.toFixed(decimals);
}

// Format large numbers with proper spacing
export function formatNumber(num: number, decimals: number = 0): string {
  if (num === undefined || num === null) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
}

// Format velocity/speed
export function formatSpeed(speed: number, decimals: number = 1): string {
  return speed.toFixed(decimals);
}

// Calculate congestion percentage
export function calculateCongestion(
  activeVehicles: number,
  capacity: number
): number {
  if (capacity === 0) return 0;
  return Math.min((activeVehicles / capacity) * 100, 100);
}
