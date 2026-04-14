'use client';

import { useEffect, useState, useCallback } from 'react';

interface MousePosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

export function useMouseParallax() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Normalize to -1 to 1 range based on viewport
    const normalizedX = (x / window.innerWidth) * 2 - 1;
    const normalizedY = (y / window.innerHeight) * 2 - 1;
    
    setMousePosition({
      x,
      y,
      normalizedX,
      normalizedY,
    });
  }, []);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);
  
  return mousePosition;
}

// Calculate parallax offset for an element
export function calculateParallax(
  normalizedX: number,
  normalizedY: number,
  strength: number = 1,
  invert: boolean = false
): { x: number; y: number } {
  const multiplier = invert ? -1 : 1;
  
  return {
    x: normalizedX * strength * 20 * multiplier,
    y: normalizedY * strength * 20 * multiplier,
  };
}
