'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GeometricPanelProps {
  children: ReactNode;
  className?: string;
  stress?: number; // 0-1 for visual effects
  variant?: 'default' | 'accent' | 'transparent';
}

export function GeometricPanel({
  children,
  className = '',
  stress = 0,
  variant = 'default',
}: GeometricPanelProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'accent':
        return 'bg-acid/5 border-acid/20';
      case 'transparent':
        return 'bg-transparent border-stark/10';
      default:
        return 'bg-void-soft border-border';
    }
  };
  
  return (
    <motion.div
      className={`relative border ${getVariantStyles()} ${className}`}
      animate={{
        skewX: stress * 1.5,
        skewY: stress * 0.5,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-acid/30" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-acid/30" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-acid/30" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-acid/30" />
      
      {children}
      
      {/* Stress indicator line */}
      {stress > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-acid"
          initial={{ width: 0 }}
          animate={{ width: `${stress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}

// Interlocking panel layout
interface GeometricLayoutProps {
  children: ReactNode;
  className?: string;
}

export function GeometricLayout({ children, className = '' }: GeometricLayoutProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fff 1px, transparent 1px),
            linear-gradient(to bottom, #fff 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      
      {children}
    </div>
  );
}

// Animated divider
interface GeometricDividerProps {
  className?: string;
  animated?: boolean;
}

export function GeometricDivider({ className = '', animated = false }: GeometricDividerProps) {
  return (
    <div className={`relative h-px ${className}`}>
      <div className="absolute inset-0 bg-border" />
      
      {animated && (
        <motion.div
          className="absolute top-0 left-0 w-8 h-full bg-acid"
          animate={{
            x: ['-100%', '1000%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  );
}

// Shifting block element
interface ShiftingBlockProps {
  children: ReactNode;
  className?: string;
  direction?: 'left' | 'right';
}

export function ShiftingBlock({ 
  children, 
  className = '', 
  direction = 'right' 
}: ShiftingBlockProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{
        x: direction === 'right' ? 4 : -4,
        skewX: direction === 'right' ? -1 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
