'use client';

import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import type { SimulationParams } from '@/lib/simulation-config';

interface ControlPanelProps {
  params: SimulationParams;
  isRunning: boolean;
  onParamsChange: (params: Partial<SimulationParams>) => void;
  onToggle: () => void;
  onReset: () => void;
  stress?: number; // 0-1 for visual effects
}

export function ControlPanel({
  params,
  isRunning,
  onParamsChange,
  onToggle,
  onReset,
  stress = 0,
}: ControlPanelProps) {
  return (
    <motion.div
      className="bg-void-soft border border-border p-6 space-y-6"
      animate={{
        skewX: stress * 2,
        borderColor: stress > 0.5 ? 'rgba(223, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)',
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs tracking-widest text-stark-muted uppercase">
          Control Matrix
        </h2>
        <motion.div
          className="w-2 h-2 bg-acid"
          animate={{
            opacity: isRunning ? [1, 0.3, 1] : 0.3,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      </div>
      
      {/* Playback controls */}
      <div className="flex gap-3">
        <Button
          onClick={onToggle}
          variant="outline"
          className="flex-1 h-12 border-stark/20 bg-transparent hover:bg-stark/5 hover:border-acid/50 text-stark font-mono text-xs tracking-wider uppercase transition-all duration-200"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Halt
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Execute
            </>
          )}
        </Button>
        
        <Button
          onClick={onReset}
          variant="outline"
          className="h-12 px-4 border-stark/20 bg-transparent hover:bg-stark/5 hover:border-acid/50 text-stark transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Parameter sliders */}
      <div className="space-y-5">
        <ParameterSlider
          label="Entropy"
          value={params.entropyLevel}
          onChange={(value) => onParamsChange({ entropyLevel: value })}
          description="Behavioral randomness"
        />
        
        <ParameterSlider
          label="Density"
          value={params.vehicleDensity}
          onChange={(value) => onParamsChange({ vehicleDensity: value })}
          description="Vehicle spawn rate"
        />
        
        <ParameterSlider
          label="Aggression"
          value={params.aggressionBias}
          onChange={(value) => onParamsChange({ aggressionBias: value })}
          description="Driver hostility bias"
        />
      </div>
      
      {/* Grid controls */}
      <div className="pt-4 border-t border-border">
        <h3 className="font-mono text-xs tracking-widest text-stark-muted uppercase mb-4">
          Grid Configuration
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-mono text-xs text-stark-dim mb-2">
              Columns
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 border-stark/20 text-stark"
                onClick={() => onParamsChange({ 
                  gridSize: { 
                    ...params.gridSize, 
                    cols: Math.max(3, params.gridSize.cols - 1) 
                  } 
                })}
              >
                -
              </Button>
              <span className="font-mono text-2xl text-stark w-8 text-center">
                {params.gridSize.cols}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 border-stark/20 text-stark"
                onClick={() => onParamsChange({ 
                  gridSize: { 
                    ...params.gridSize, 
                    cols: Math.min(10, params.gridSize.cols + 1) 
                  } 
                })}
              >
                +
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block font-mono text-xs text-stark-dim mb-2">
              Rows
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 border-stark/20 text-stark"
                onClick={() => onParamsChange({ 
                  gridSize: { 
                    ...params.gridSize, 
                    rows: Math.max(3, params.gridSize.rows - 1) 
                  } 
                })}
              >
                -
              </Button>
              <span className="font-mono text-2xl text-stark w-8 text-center">
                {params.gridSize.rows}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 border-stark/20 text-stark"
                onClick={() => onParamsChange({ 
                  gridSize: { 
                    ...params.gridSize, 
                    rows: Math.min(10, params.gridSize.rows + 1) 
                  } 
                })}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <ParameterSlider
            label="Irregularity"
            value={params.gridRandomness}
            onChange={(value) => onParamsChange({ gridRandomness: value })}
            description="Grid distortion amount"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface ParameterSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

function ParameterSlider({ label, value, onChange, description }: ParameterSliderProps) {
  const percentage = Math.round(value * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-xs tracking-wider text-stark-dim uppercase">
          {label}
        </label>
        <span className="font-mono text-lg text-acid tabular-nums">
          {percentage}
          <span className="text-xs text-stark-muted">%</span>
        </span>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={1}
        step={0.01}
        className="w-full"
      />
      
      {description && (
        <p className="font-mono text-[10px] text-stark-muted tracking-wide">
          {description}
        </p>
      )}
    </div>
  );
}
