'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { GeometricPanel, GeometricDivider } from '@/components/simulation/ui/geometric-panel';
import { AnimatedCounter } from '@/components/animated-counter';
import { useSimulation } from '@/hooks/use-simulation';

const TelemetryDisplay = dynamic(
  () => import('@/components/simulation/ui/telemetry-display').then(mod => mod.TelemetryDisplay),
  { ssr: false, loading: () => <div className="h-64 bg-void-soft border border-border animate-pulse" /> }
);

export default function InsightsPage() {
  const { stats, vehicles, tick, isRunning, start } = useSimulation();
  const [historicalStats, setHistoricalStats] = useState<any[]>([]);

  // Start simulation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      start();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Track historical stats
  useEffect(() => {
    if (isRunning && tick % 10 === 0) {
      setHistoricalStats(prev => [
        ...prev.slice(-59), // Keep last 60 data points
        {
          timestamp: tick,
          vehicles: stats.totalVehicles,
          violations: stats.violations,
          speed: stats.avgSpeed,
          throughput: stats.throughput,
        }
      ]);
    }
  }, [tick, isRunning, stats]);

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
              Traffic Insights
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {isRunning && (
              <motion.div
                className="flex items-center gap-2"
                animate={{ color: '#DFFF00' }}
              >
                <div className="w-2 h-2 bg-acid animate-pulse" />
                <span className="font-mono text-xs tracking-wider uppercase">LIVE</span>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Vehicles */}
          <GeometricPanel className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] text-stark-muted uppercase tracking-widest mb-2">
                  Total Vehicles
                </div>
                <div className="brutalist-display text-4xl text-stark font-mono font-bold tabular-nums">
                  {stats.totalVehicles}
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <AlertCircle className="w-5 h-5 text-stark-dim" />
              </motion.div>
            </div>
          </GeometricPanel>

          {/* Signal Violations */}
          <GeometricPanel className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] text-stark-muted uppercase tracking-widest mb-2">
                  Signal Violations
                </div>
                <div className="brutalist-display text-4xl text-acid font-mono font-bold tabular-nums">
                  <AnimatedCounter end={stats.violations} decimals={0} />
                </div>
              </div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <AlertCircle className="w-5 h-5 text-acid" />
              </motion.div>
            </div>
          </GeometricPanel>

          {/* Total Honks */}
          <GeometricPanel className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] text-stark-muted uppercase tracking-widest mb-2">
                  Avg Speed
                </div>
                <div className="brutalist-display text-3xl text-stark font-mono font-bold tabular-nums">
                  {stats.avgSpeed.toFixed(1)}
                  <span className="text-lg text-stark-dim ml-1">u/s</span>
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-5 h-5 text-stark-dim" />
              </motion.div>
            </div>
          </GeometricPanel>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Telemetry Display */}
          <GeometricPanel className="p-6">
            <h2 className="font-mono text-xs tracking-widest text-stark uppercase mb-4">
              Live Telemetry
            </h2>
            <TelemetryDisplay stats={stats} tick={tick} isRunning={isRunning} />
          </GeometricPanel>

          {/* Stress Indicator */}
          <GeometricPanel className="p-6">
            <h2 className="font-mono text-xs tracking-widest text-stark uppercase mb-4">
              Network Stress
            </h2>
            <div className="space-y-4">
              {/* Stress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-stark-dim uppercase">
                    Congestion Level
                  </span>
                  <span className="font-mono text-xs text-acid font-bold">
                    {Math.round(stress * 100)}%
                  </span>
                </div>
                <motion.div className="w-full h-2 bg-void-lighter">
                  <motion.div
                    className="h-full bg-acid"
                    animate={{ width: `${stress * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </div>

              {/* Status text */}
              <div className="font-mono text-[10px] text-stark-muted space-y-1">
                <div>
                  Throughput: <span className="text-stark">{stats.throughput}</span>
                </div>
                <div>
                  Avg Speed: <span className="text-acid font-bold">{stats.avgSpeed.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </GeometricPanel>
        </div>

        {/* Info Section */}
        <GeometricPanel className="p-6" variant="transparent">
          <h2 className="font-mono text-xs tracking-widest text-stark uppercase mb-3">
            About These Metrics
          </h2>
          <div className="space-y-2 font-mono text-[10px] text-stark-dim leading-relaxed">
            <p>
              These real-time analytics reflect the current state of the traffic simulation network.
            </p>
            <p>
              Signal violations indicate vehicles running red lights. Honks represent frustrated drivers.
              Network stress measures congestion intensity across intersections.
            </p>
            <p className="text-acid">
              Higher entropy increases chaotic behavior and unpredictability in driver decisions.
            </p>
          </div>
        </GeometricPanel>
      </div>
    </div>
  );
}
