'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HeroCanvas } from '@/components/landing/hero-canvas';
import { FracturedText, GeometricSubtitle } from '@/components/landing/fractured-text';
import { ArrowRight, Github, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-void overflow-hidden">
      {/* Hero Canvas Background */}
      <HeroCanvas className="opacity-60" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/50 via-transparent to-void/50 pointer-events-none" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-xs tracking-widest text-stark-muted uppercase"
        >
          Traffic Chaos
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-6"
        >
          <Link 
            href="/dashboard"
            className="font-mono text-xs tracking-wider text-stark-dim hover:text-acid transition-colors uppercase"
          >
            Dashboard
          </Link>
          <Link 
            href="/scenario"
            className="font-mono text-xs tracking-wider text-stark-dim hover:text-acid transition-colors uppercase"
          >
            Scenario
          </Link>
        </motion.div>
      </nav>
      
      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <FracturedText 
            text="SIMULATING CHAOS." 
            className="text-5xl md:text-7xl lg:text-9xl"
          />
        </motion.div>
        
        {/* Subtitle */}
        <GeometricSubtitle 
          text="Procedural Traffic Simulation Engine" 
          className="text-sm md:text-base mb-12"
        />
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/dashboard">
            <motion.button
              className="group relative flex items-center gap-3 px-8 py-4 bg-stark text-void font-mono text-sm tracking-wider uppercase overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10">Enter Simulation</span>
              <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
              
              {/* Hover effect */}
              <motion.div
                className="absolute inset-0 bg-acid"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </Link>
          
          <Link href="/scenario">
            <motion.button
              className="flex items-center gap-3 px-8 py-4 border border-stark/30 text-stark font-mono text-sm tracking-wider uppercase hover:border-acid hover:text-acid transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Build Scenario</span>
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
      
      {/* Feature highlights */}
      <div className="relative z-10 px-6 md:px-12 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          <FeatureCard
            number="01"
            title="Procedural Generation"
            description="Algorithmic road networks with noise-based irregularity and adaptive traffic signals."
          />
          <FeatureCard
            number="02"
            title="Behavioral Simulation"
            description="Driver behavior state machines with aggression levels and signal violation probability."
          />
          <FeatureCard
            number="03"
            title="Real-time Pathfinding"
            description="Dynamic weighted A* with congestion-aware rerouting and collision avoidance."
          />
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="px-6 md:px-12 py-8 flex items-center justify-between">
          <div className="font-mono text-[10px] text-stark-muted tracking-wider">
            PROCEDURAL TRAFFIC SIMULATION v1.0
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-stark-muted tracking-wider">
              BUILT WITH NEXT.JS + THREE.JS
            </span>
          </div>
        </div>
      </footer>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-px h-32 bg-gradient-to-t from-acid to-transparent" />
      <div className="absolute bottom-0 right-0 w-px h-32 bg-gradient-to-t from-acid to-transparent" />
    </main>
  );
}

interface FeatureCardProps {
  number: string;
  title: string;
  description: string;
}

function FeatureCard({ number, title, description }: FeatureCardProps) {
  return (
    <motion.div
      className="group relative p-6 border border-border bg-void-soft/50 backdrop-blur-sm"
      whileHover={{ 
        borderColor: 'rgba(223, 255, 0, 0.3)',
        x: 4,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Number */}
      <div className="font-mono text-6xl text-stark/5 absolute top-4 right-4">
        {number}
      </div>
      
      {/* Content */}
      <div className="relative">
        <div className="font-mono text-xs text-acid tracking-wider mb-3 uppercase">
          {number}
        </div>
        <h3 className="font-sans text-lg text-stark font-medium mb-2">
          {title}
        </h3>
        <p className="font-mono text-xs text-stark-muted leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Hover accent */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-acid"
        initial={{ width: 0 }}
        whileHover={{ width: '100%' }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
