'use client';

import { motion } from 'framer-motion';

export function SkeletonLoader({ 
  count = 1, 
  type = 'card',
  className = '',
}: {
  count?: number;
  type?: 'card' | 'text' | 'line' | 'chart';
  className?: string;
}) {
  const variants = {
    card: 'h-32 rounded-none border border-border',
    text: 'h-4 rounded-none w-3/4',
    line: 'h-1 rounded-none w-full',
    chart: 'h-48 rounded-none border border-border',
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${variants[type]} bg-stark-muted/10`}
          animate={{ 
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
