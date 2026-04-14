'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSimulation } from '@/hooks/use-simulation';
import { ControlPanel } from '@/components/simulation/ui/control-panel';
import { TelemetryDisplay } from '@/components/simulation/ui/telemetry-display';
import { GeometricPanel, GeometricDivider } from '@/components/simulation/ui/geometric-panel';
import { ArrowLeft, Maximize2, Grid3X3 } from 'lucide-react';

// Dynamic import for canvas to avoid SSR issues
const SimulationCanvas = dynamic(
  () => import('@/components/simulation/canvas/simulation-canvas').then(mod => mod.SimulationCanvas),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-void flex items-center justify-center">
        <div className="font-mono text-xs text-stark-muted animate-pulse">
          INITIALIZING SIMULATION...
        </div>
      </div>
    )
  }
);

export default function DashboardPage() {
  const { 
    vehicles, 
    network, 
    stats, 
    params, 
    isRunning, 
    tick,
    start,
    stop,
    toggle,
    reset,
    setParams,
  } = useSimulation();
  
  // Load scenario params and auto-start simulation on mount
  useEffect(() => {
    // Check for scenario params from scenario builder
    if (typeof window !== 'undefined') {
      const scenarioParams = sessionStorage.getItem('scenarioParams');
      if (scenarioParams) {
        try {
          const parsed = JSON.parse(scenarioParams);
          setParams(parsed);
          sessionStorage.removeItem('scenarioParams');
          // Reset with new params
          reset(parsed);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    
    const timer = setTimeout(() => {
      start();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      stop();
    };
  }, []);
  
  const stress = Math.min(stats.congestionNodes / 10, 1);
  
  return (
    <div className="min-h-screen bg-void">
      {/* Header */}
      <header className="border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link 
              href="/"
              className="flex items-center gap-2 text-stark-muted hover:text-stark transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-mono text-xs tracking-wider uppercase">Back</span>
            </Link>
            
            <GeometricDivider className="w-px h-6 hidden sm:block" />
            
            <h1 className="font-mono text-xs tracking-widest text-stark uppercase hidden sm:block">
              Simulation Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/scenario"
              className="flex items-center gap-2 px-4 py-2 border border-border hover:border-acid text-stark-dim hover:text-acid transition-colors"
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="font-mono text-xs tracking-wider uppercase hidden sm:inline">
                Scenario
              </span>
            </Link>
            
            <motion.div
              className="flex items-center gap-2"
              animate={{
                color: isRunning ? '#DFFF00' : '#a3a3a3',
              }}
            >
              <div className={`w-2 h-2 ${isRunning ? 'bg-acid' : 'bg-stark-muted'}`} />
              <span className="font-mono text-xs tracking-wider uppercase">
                {isRunning ? 'LIVE' : 'PAUSED'}
              </span>
            </motion.div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
        {/* Simulation Canvas - Main Area */}
        <div className="flex-1 relative">
          <SimulationCanvas 
            className="absolute inset-0" 
            showGrid={true}
            zoom={15}
          />
          
          {/* Canvas overlays */}
          <div className="absolute top-4 left-4 z-10">
            <GeometricPanel 
              stress={stress} 
              variant="transparent"
              className="p-3 backdrop-blur-sm"
            >
              <div className="font-mono text-[10px] text-stark-muted uppercase tracking-wider">
                Vehicles Active
              </div>
              <div className="brutalist-display text-3xl text-stark tabular-nums">
                {stats.totalVehicles}
              </div>
            </GeometricPanel>
          </div>
          
          <div className="absolute top-4 right-4 z-10 lg:hidden">
            <GeometricPanel 
              stress={stress} 
              variant="transparent"
              className="p-3 backdrop-blur-sm"
            >
              <div className="font-mono text-[10px] text-stark-muted uppercase tracking-wider">
                Throughput
              </div>
              <div className="brutalist-display text-3xl text-acid tabular-nums">
                {stats.throughput}
              </div>
            </GeometricPanel>
          </div>
          
          {/* Stress indicator bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-acid"
            animate={{ width: `${stress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        
        {/* Sidebar - Controls & Telemetry */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Telemetry */}
            <TelemetryDisplay 
              stats={stats} 
              tick={tick} 
              isRunning={isRunning} 
            />
            
            {/* Controls */}
            <ControlPanel
              params={params}
              isRunning={isRunning}
              onParamsChange={setParams}
              onToggle={toggle}
              onReset={() => reset()}
              stress={stress}
            />
            
            {/* Info panel */}
            <GeometricPanel className="p-4" variant="transparent">
              <h3 className="font-mono text-xs tracking-widest text-stark-muted uppercase mb-3">
                About This Simulation
              </h3>
              <div className="space-y-2 font-mono text-[10px] text-stark-dim leading-relaxed">
                <p>
                  Procedural traffic simulation with lane-less Indian-style flow dynamics.
                </p>
                <p>
                  Vehicles use dynamic A* pathfinding with congestion-aware rerouting. 
                  Traffic signals adapt timing based on real-time density.
                </p>
                <p className="text-acid">
                  Adjust entropy and aggression to observe behavioral chaos.
                </p>
              </div>
            </GeometricPanel>
          </div>
        </aside>
      </div>
    </div>
  );
}
