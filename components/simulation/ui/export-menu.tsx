'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileJson, Code2, BarChart3, ChevronDown } from 'lucide-react';
import { GeometricPanel } from './geometric-panel';
import { 
  exportAsJSON, 
  exportAsMatlab, 
  exportScenarioParams,
  exportStatsAsCSV 
} from '@/lib/export-utils';
import { SimulationState } from '@/lib/simulation/store';

interface ExportMenuProps {
  simulationState: SimulationState;
  stats?: any[];
  scenarioName?: string;
}

export function ExportMenu({ 
  simulationState, 
  stats = [], 
  scenarioName = 'scenario' 
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportJSON = () => {
    exportAsJSON(simulationState, `${scenarioName}.json`);
    setIsOpen(false);
  };

  const handleExportMatlab = () => {
    exportAsMatlab(simulationState, `${scenarioName}.m`);
    setIsOpen(false);
  };

  const handleExportParams = () => {
    exportScenarioParams(simulationState.params, `${scenarioName}-params.json`);
    setIsOpen(false);
  };

  const handleExportStats = () => {
    if (stats.length > 0) {
      exportStatsAsCSV(stats, `${scenarioName}-stats.csv`);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-border hover:border-acid text-stark-dim hover:text-acid transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="font-mono text-xs tracking-wider uppercase">Export</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 right-0 z-50 w-56 space-y-2"
          >
            <GeometricPanel className="p-0 overflow-hidden" variant="solid">
              <div className="space-y-1">
                {/* JSON Export */}
                <button
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-void-lighter transition-colors border-b border-border last:border-b-0"
                >
                  <FileJson className="w-4 h-4 text-stark-muted" />
                  <div className="text-left">
                    <div className="font-mono text-xs text-stark tracking-widest uppercase">
                      Simulation JSON
                    </div>
                    <div className="font-mono text-[10px] text-stark-muted">
                      Full state data
                    </div>
                  </div>
                </button>

                {/* MATLAB Export */}
                <button
                  onClick={handleExportMatlab}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-void-lighter transition-colors border-b border-border last:border-b-0"
                >
                  <Code2 className="w-4 h-4 text-acid" />
                  <div className="text-left">
                    <div className="font-mono text-xs text-stark tracking-widest uppercase">
                      MATLAB Script
                    </div>
                    <div className="font-mono text-[10px] text-stark-muted">
                      Road & vehicle data
                    </div>
                  </div>
                </button>

                {/* Parameters Export */}
                <button
                  onClick={handleExportParams}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-void-lighter transition-colors border-b border-border last:border-b-0"
                >
                  <FileJson className="w-4 h-4 text-stark-muted" />
                  <div className="text-left">
                    <div className="font-mono text-xs text-stark tracking-widest uppercase">
                      Parameters
                    </div>
                    <div className="font-mono text-[10px] text-stark-muted">
                      Scenario config
                    </div>
                  </div>
                </button>

                {/* Statistics Export */}
                {stats.length > 0 && (
                  <button
                    onClick={handleExportStats}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-void-lighter transition-colors border-b border-border last:border-b-0"
                  >
                    <BarChart3 className="w-4 h-4 text-stark-muted" />
                    <div className="text-left">
                      <div className="font-mono text-xs text-stark tracking-widest uppercase">
                        Statistics CSV
                      </div>
                      <div className="font-mono text-[10px] text-stark-muted">
                        {stats.length} data points
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </GeometricPanel>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
