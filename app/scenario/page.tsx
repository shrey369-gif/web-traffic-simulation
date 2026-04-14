'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ParameterInput } from '@/components/scenario/parameter-input';
import { GeometricPanel, GeometricDivider } from '@/components/simulation/ui/geometric-panel';
import { ArrowLeft, Play, Shuffle } from 'lucide-react';

// Dynamic import for preview canvas
const ScenarioPreview = dynamic(
  () => import('@/components/scenario/scenario-preview').then(mod => mod.ScenarioPreview),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-void flex items-center justify-center">
        <div className="font-mono text-xs text-stark-muted animate-pulse">
          GENERATING PREVIEW...
        </div>
      </div>
    )
  }
);

interface ScenarioParams {
  cols: number;
  rows: number;
  randomness: number;
  density: number;
  aggression: number;
  entropy: number;
}

export default function ScenarioPage() {
  const router = useRouter();
  const [seed, setSeed] = useState(Date.now());
  const [params, setParams] = useState<ScenarioParams>({
    cols: 6,
    rows: 6,
    randomness: 0.2,
    density: 0.5,
    aggression: 0.3,
    entropy: 0.3,
  });
  
  const handleParamsChange = useCallback((newParams: Partial<ScenarioParams>) => {
    setParams(prev => ({ ...prev, ...newParams }));
    // Regenerate preview with new seed when grid changes
    if (newParams.cols || newParams.rows || newParams.randomness !== undefined) {
      setSeed(Date.now());
    }
  }, []);
  
  const handleRandomize = useCallback(() => {
    setParams({
      cols: 3 + Math.floor(Math.random() * 8),
      rows: 3 + Math.floor(Math.random() * 8),
      randomness: Math.random() * 0.5,
      density: 0.3 + Math.random() * 0.5,
      aggression: Math.random() * 0.7,
      entropy: Math.random() * 0.6,
    });
    setSeed(Date.now());
  }, []);
  
  const handleApply = useCallback(() => {
    // Store params in sessionStorage and navigate to dashboard
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('scenarioParams', JSON.stringify({
        gridSize: { cols: params.cols, rows: params.rows },
        gridRandomness: params.randomness,
        vehicleDensity: params.density,
        aggressionBias: params.aggression,
        entropyLevel: params.entropy,
      }));
    }
    router.push('/dashboard');
  }, [params, router]);
  
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
              Scenario Matrix
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              onClick={handleRandomize}
              className="flex items-center gap-2 px-4 py-2 border border-border hover:border-acid text-stark-dim hover:text-acid transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shuffle className="w-4 h-4" />
              <span className="font-mono text-xs tracking-wider uppercase hidden sm:inline">
                Random
              </span>
            </motion.button>
            
            <motion.button
              onClick={handleApply}
              className="flex items-center gap-2 px-4 py-2 bg-acid text-void hover:bg-acid-glow transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-4 h-4" />
              <span className="font-mono text-xs tracking-wider uppercase">
                Launch
              </span>
            </motion.button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-65px)]">
        {/* Preview Canvas */}
        <div className="flex-1 relative">
          <ScenarioPreview
            cols={params.cols}
            rows={params.rows}
            randomness={params.randomness}
            seed={seed}
            className="absolute inset-0"
          />
          
          {/* Preview info overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <GeometricPanel variant="transparent" className="p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] text-stark-muted uppercase tracking-wider mb-1">
                    Current Configuration
                  </div>
                  <div className="font-mono text-sm text-stark">
                    {params.cols} x {params.rows} Grid
                    <span className="text-stark-muted mx-2">|</span>
                    {Math.round(params.randomness * 100)}% Irregularity
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-mono text-[10px] text-stark-muted uppercase tracking-wider mb-1">
                    Seed
                  </div>
                  <div className="font-mono text-xs text-acid tabular-nums">
                    {seed.toString(16).toUpperCase()}
                  </div>
                </div>
              </div>
            </GeometricPanel>
          </div>
          
          {/* Build animation indicator */}
          <motion.div
            key={seed}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-acid/5" />
          </motion.div>
        </div>
        
        {/* Parameter Panel */}
        <aside className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="font-mono text-xs tracking-widest text-stark-muted uppercase mb-2">
                Configuration Matrix
              </h2>
              <p className="font-mono text-[10px] text-stark-dim">
                Define simulation parameters. Changes preview in real-time.
              </p>
            </div>
            
            <ParameterInput
              params={params}
              onChange={handleParamsChange}
              onRandomize={handleRandomize}
              onApply={handleApply}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
