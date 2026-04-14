'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FracturedTextProps {
  text: string;
  className?: string;
}

export function FracturedText({ text, className = '' }: FracturedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring animations
  const springConfig = { stiffness: 150, damping: 20 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Normalize to -1 to 1 range
        const normalizedX = (e.clientX - centerX) / (rect.width / 2);
        const normalizedY = (e.clientY - centerY) / (rect.height / 2);
        
        mouseX.set(normalizedX);
        mouseY.set(normalizedY);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);
  
  const letters = text.split('');
  
  return (
    <motion.div
      ref={containerRef}
      className={`relative select-none ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex flex-wrap justify-center">
        {letters.map((letter, i) => (
          <FracturedLetter
            key={i}
            letter={letter}
            index={i}
            total={letters.length}
            mouseX={smoothX}
            mouseY={smoothY}
            isHovered={isHovered}
          />
        ))}
      </div>
      
      {/* Glitch overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(223, 255, 0, 0.03) 50%, transparent 100%)',
        }}
        animate={{
          x: isHovered ? [-200, 200] : 0,
          opacity: isHovered ? [0, 0.5, 0] : 0,
        }}
        transition={{
          duration: 0.3,
          repeat: isHovered ? Infinity : 0,
          repeatDelay: 0.5,
        }}
      />
    </motion.div>
  );
}

interface FracturedLetterProps {
  letter: string;
  index: number;
  total: number;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
  isHovered: boolean;
}

function FracturedLetter({ 
  letter, 
  index, 
  total, 
  mouseX, 
  mouseY,
  isHovered 
}: FracturedLetterProps) {
  // Calculate offset based on position in text
  const positionFactor = (index - total / 2) / total;
  
  // Transform mouse position to letter movement
  const x = useTransform(mouseX, [-1, 1], [positionFactor * -20, positionFactor * 20]);
  const y = useTransform(mouseY, [-1, 1], [-5, 5]);
  const rotateZ = useTransform(mouseX, [-1, 1], [positionFactor * -5, positionFactor * 5]);
  
  if (letter === ' ') {
    return <span className="inline-block w-4 md:w-8" />;
  }
  
  return (
    <motion.span
      className="inline-block brutalist-display text-stark relative"
      style={{
        x,
        y,
        rotateZ,
      }}
      animate={{
        scale: isHovered ? 1.02 : 1,
        skewX: isHovered ? Math.sin(index * 0.5) * 2 : 0,
      }}
      transition={{
        scale: { duration: 0.2 },
        skewX: { duration: 0.3 },
      }}
      whileHover={{
        color: '#DFFF00',
        textShadow: '0 0 30px rgba(223, 255, 0, 0.5)',
      }}
    >
      {letter}
      
      {/* Ghost duplicate for depth */}
      <motion.span
        className="absolute inset-0 text-acid/20 pointer-events-none"
        style={{
          x: useTransform(mouseX, [-1, 1], [positionFactor * -8, positionFactor * 8]),
          y: useTransform(mouseY, [-1, 1], [-2, 2]),
        }}
      >
        {letter}
      </motion.span>
    </motion.span>
  );
}

// Simpler subtitle text with geometric animation
interface GeometricSubtitleProps {
  text: string;
  className?: string;
}

export function GeometricSubtitle({ text, className = '' }: GeometricSubtitleProps) {
  return (
    <motion.p
      className={`font-mono text-stark-muted tracking-widest uppercase ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.05, delay: 0.5 + i * 0.03 }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.p>
  );
}
