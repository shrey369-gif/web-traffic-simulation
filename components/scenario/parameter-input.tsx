'use client';

import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ScenarioParams {
  cols: number;
  rows: number;
  randomness: number;
  density: number;
  aggression: number;
  entropy: number;
}

interface ParameterInputProps {
  params: ScenarioParams;
  onChange: (params: Partial<ScenarioParams>) => void;
  onRandomize: () => void;
  onApply: () => void;
}

export function ParameterInput({ params, onChange, onRandomize, onApply }: ParameterInputProps) {
  return (
    <div className="space-y-6">
      {/* Grid Configuration */}
      <section>
        <h3 className="font-mono text-xs tracking-widest text-stark-muted uppercase mb-4">
          Grid Topology
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <NumberInput
            label="Columns"
            value={params.cols}
            min={3}
            max={12}
            onChange={(v) => onChange({ cols: v })}
          />
          <NumberInput
            label="Rows"
            value={params.rows}
            min={3}
            max={12}
            onChange={(v) => onChange({ rows: v })}
          />
        </div>
        
        <div className="mt-4">
          <SliderInput
            label="Grid Irregularity"
            value={params.randomness}
            onChange={(v) => onChange({ randomness: v })}
            description="Noise-based vertex displacement"
          />
        </div>
      </section>
      
      {/* Simulation Parameters */}
      <section className="pt-6 border-t border-border">
        <h3 className="font-mono text-xs tracking-widest text-stark-muted uppercase mb-4">
          Simulation Parameters
        </h3>
        
        <div className="space-y-4">
          <SliderInput
            label="Vehicle Density"
            value={params.density}
            onChange={(v) => onChange({ density: v })}
            description="Spawn rate multiplier"
          />
          
          <SliderInput
            label="Aggression Bias"
            value={params.aggression}
            onChange={(v) => onChange({ aggression: v })}
            description="Probability of aggressive behavior"
          />
          
          <SliderInput
            label="Entropy Level"
            value={params.entropy}
            onChange={(v) => onChange({ entropy: v })}
            description="System-wide randomness factor"
          />
        </div>
      </section>
      
      {/* Vehicle Spawn Matrix */}
      <section className="pt-6 border-t border-border">
        <h3 className="font-mono text-xs tracking-widest text-stark-muted uppercase mb-4">
          Vehicle Distribution
        </h3>
        
        <div className="grid grid-cols-5 gap-2">
          <VehicleTypeIndicator type="Car" weight={35} />
          <VehicleTypeIndicator type="Bike" weight={30} />
          <VehicleTypeIndicator type="Auto" weight={20} accent />
          <VehicleTypeIndicator type="Bus" weight={8} />
          <VehicleTypeIndicator type="Truck" weight={7} />
        </div>
        
        <p className="font-mono text-[10px] text-stark-muted mt-2">
          Spawn probability weights (fixed distribution)
        </p>
      </section>
      
      {/* Actions */}
      <section className="pt-6 border-t border-border space-y-3">
        <Button
          onClick={onRandomize}
          variant="outline"
          className="w-full h-12 border-stark/20 bg-transparent hover:bg-stark/5 hover:border-acid/50 text-stark font-mono text-xs tracking-wider uppercase"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Randomize Parameters
        </Button>
        
        <Button
          onClick={onApply}
          className="w-full h-12 bg-acid text-void hover:bg-acid-glow font-mono text-xs tracking-wider uppercase"
        >
          Apply to Simulation
        </Button>
      </section>
    </div>
  );
}

interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function NumberInput({ label, value, min, max, onChange }: NumberInputProps) {
  return (
    <div>
      <label className="block font-mono text-xs text-stark-dim mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 border-stark/20 text-stark hover:border-acid hover:text-acid"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          -
        </Button>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutalist-display text-4xl text-stark w-12 text-center tabular-nums"
        >
          {value}
        </motion.span>
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 border-stark/20 text-stark hover:border-acid hover:text-acid"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </Button>
      </div>
    </div>
  );
}

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
}

function SliderInput({ label, value, onChange, description }: SliderInputProps) {
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

interface VehicleTypeIndicatorProps {
  type: string;
  weight: number;
  accent?: boolean;
}

function VehicleTypeIndicator({ type, weight, accent = false }: VehicleTypeIndicatorProps) {
  return (
    <div className="text-center">
      <div 
        className={`w-full h-16 border ${accent ? 'border-acid/50 bg-acid/10' : 'border-stark/20 bg-void-soft'} flex items-center justify-center mb-1`}
      >
        <span className={`brutalist-display text-xl ${accent ? 'text-acid' : 'text-stark'}`}>
          {weight}
        </span>
      </div>
      <span className="font-mono text-[9px] text-stark-muted uppercase tracking-wider">
        {type}
      </span>
    </div>
  );
}
