'use client';

import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
}

/**
 * Animated counter component for displaying numbers
 */
export function AnimatedCounter({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
}: CountUpProps) {
  const [value, setValue] = useState(start);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newValue = start + (end - start) * progress;
      setValue(parseFloat(newValue.toFixed(decimals)));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, start, duration, decimals]);

  return <>{value.toLocaleString()}</>;
}
