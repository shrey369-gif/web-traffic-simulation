'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationStats } from '@/lib/simulation-config';

interface TelemetryDisplayProps {
  stats: SimulationStats;
  tick: number;
  isRunning: boolean;
}

export function TelemetryDisplay({ stats, tick, isRunning }: TelemetryDisplayProps) {
  const stress = Math.min(stats.congestionNodes / 10, 1);
  
  return (
    <motion.div
      className="bg-void-soft border border-border p-6"
      animate={{
        borderColor: stress > 0.7 ? 'rgba(223, 255, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-mono text-xs tracking-widest text-stark-muted uppercase">
          Live Telemetry
        </h2>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-stark-muted">TICK</span>
          <motion.span
            className="font-mono text-sm text-acid tabular-nums"
            key={tick}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {tick.toString().padStart(6, '0')}
          </motion.span>
        </div>
      </div>
      
      {/* Main stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <TelemetryCard
          label="Vehicles"
          value={stats.totalVehicles}
          suffix="active"
          highlight={stats.totalVehicles > 100}
        />
        
        <TelemetryCard
          label="Avg Speed"
          value={stats.avgSpeed.toFixed(1)}
          suffix="u/s"
        />
        
        <TelemetryCard
          label="Throughput"
          value={stats.throughput}
          suffix="completed"
          accent
        />
        
        <TelemetryCard
          label="Congestion"
          value={stats.congestionNodes}
          suffix="nodes"
          highlight={stats.congestionNodes > 5}
          warning={stats.congestionNodes > 8}
        />
      </div>
      
      {/* Secondary stats */}
      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="font-mono text-[10px] text-stark-muted uppercase tracking-wider">
            Collisions Avoided
          </span>
          <span className="font-mono text-sm text-stark tabular-nums">
            {stats.collisionsAvoided}
          </span>
        </div>
        
        <div className="flex justify-between items-baseline">
          <span className="font-mono text-[10px] text-stark-muted uppercase tracking-wider">
            System Stress
          </span>
          <StressBar stress={stress} />
        </div>
        
        <div className="flex justify-between items-baseline">
          <span className="font-mono text-[10px] text-stark-muted uppercase tracking-wider">
            Status
          </span>
          <StatusIndicator isRunning={isRunning} stress={stress} />
        </div>
      </div>
    </motion.div>
  );
}

interface TelemetryCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  highlight?: boolean;
  warning?: boolean;
  accent?: boolean;
}

function TelemetryCard({ 
  label, 
  value, 
  suffix, 
  highlight = false,
  warning = false,
  accent = false,
}: TelemetryCardProps) {
  return (
    <motion.div
      className="bg-void p-4"
      animate={{
        backgroundColor: warning ? 'rgba(223, 255, 0, 0.05)' : 'rgba(0, 0, 0, 1)',
      }}
    >
      <div className="font-mono text-[10px] text-stark-muted uppercase tracking-wider mb-2">
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={String(value)}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.15 }}
          className={`brutalist-display text-4xl md:text-5xl tabular-nums ${
            accent ? 'text-acid' : warning ? 'text-acid' : highlight ? 'text-stark' : 'text-stark'
          }`}
        >
          {value}
        </motion.div>
      </AnimatePresence>
      {suffix && (
        <div className="font-mono text-[10px] text-stark-muted uppercase tracking-wider mt-1">
          {suffix}
        </div>
      )}
    </motion.div>
  );
}

function StressBar({ stress }: { stress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-void">
        <motion.div
          className="h-full bg-acid"
          initial={{ width: 0 }}
          animate={{ width: `${stress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="font-mono text-xs text-acid tabular-nums">
        {Math.round(stress * 100)}%
      </span>
    </div>
  );
}

function StatusIndicator({ isRunning, stress }: { isRunning: boolean; stress: number }) {
  const getStatus = () => {
    if (!isRunning) return { text: 'HALTED', color: 'text-stark-muted' };
    if (stress > 0.8) return { text: 'CRITICAL', color: 'text-acid' };
    if (stress > 0.5) return { text: 'STRESSED', color: 'text-acid' };
    return { text: 'NOMINAL', color: 'text-stark' };
  };
  
  const status = getStatus();
  
  return (
    <motion.span
      className={`font-mono text-xs ${status.color} uppercase tracking-wider`}
      animate={{
        opacity: isRunning && stress > 0.5 ? [1, 0.5, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        repeat: isRunning && stress > 0.5 ? Infinity : 0,
      }}
    >
      {status.text}
    </motion.span>
  );
}
