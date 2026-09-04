import React, { useState } from 'react';
import { Sliders, AlertTriangle } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';

export interface ResourceAllocationItem {
  id: string;
  name: string;
  currentUnits: number;
  minUnits: number; // Required minimum threshold
  maxUnits: number;
  sliderMin?: number;
  sliderMax?: number;
  unitLabel: string;
  description: string;
}

interface ResourceManagementArchetypeProps {
  title: string;
  totalBudgetUnits: number;
  unitLabel: string;
  instructionSnippet: string;
  resources: ResourceAllocationItem[];
  onCommitAllocation: (
    allocation: Record<string, number>,
    isBalanced: boolean,
    overBudget: boolean
  ) => void;
  disabled?: boolean;
}

export const ResourceManagementArchetype: React.FC<ResourceManagementArchetypeProps> = ({
  title,
  totalBudgetUnits,
  unitLabel,
  instructionSnippet,
  resources,
  onCommitAllocation,
  disabled = false,
}) => {
  const [allocation, setAllocation] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    resources.forEach((r) => {
      init[r.id] = r.currentUnits;
    });
    return init;
  });

  const totalUsed = Object.values(allocation).reduce((sum, v) => sum + v, 0);
  const isOverBudget = totalUsed > totalBudgetUnits;

  const handleSliderChange = (resId: string, val: number) => {
    if (disabled) return;
    SoundFX.playClick();
    setAllocation((prev) => ({
      ...prev,
      [resId]: val,
    }));
  };

  const handleCommit = () => {
    SoundFX.playLatch();
    const isBalanced = !isOverBudget;
    onCommitAllocation(allocation, isBalanced, isOverBudget);
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Resource Allocation — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Budget Balancing
        </span>
      </div>

      {/* Budget Meter */}
      <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 mb-4 space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-stone-300">Total Available Reserve:</span>
          <span
            className={`font-bold ${
              isOverBudget ? 'text-rose-400 animate-pulse' : 'text-amber-300'
            }`}
          >
            {totalUsed} / {totalBudgetUnits} {unitLabel}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, (totalUsed / totalBudgetUnits) * 100)}%` }}
          />
        </div>

        {isOverBudget && (
          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 pt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Budget Exceeded! Reduce allocation before actuating valve manifold.</span>
          </div>
        )}
      </div>

      <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300 font-serif mb-5 leading-relaxed">
        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wide block mb-0.5">
          Balancing Directive:
        </span>
        “{instructionSnippet}”
      </div>

      {/* Sliders for Each Resource */}
      <div className="space-y-4 mb-6">
        {resources.map((res) => {
          const currentVal = allocation[res.id] || 0;
          const sMin = res.sliderMin ?? Math.min(10, res.minUnits);
          const sMax = res.sliderMax ?? res.maxUnits;
          const isBelowThreshold = currentVal < res.minUnits;

          return (
            <div
              key={res.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isBelowThreshold
                  ? 'border-rose-900/50 bg-rose-950/10'
                  : 'border-stone-800 bg-stone-900/60'
              } space-y-2`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-stone-200">{res.name}</span>
                <div className="flex items-center gap-2">
                  {isBelowThreshold ? (
                    <span className="text-[10px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/60 font-semibold animate-pulse">
                      Min Req: {res.minUnits} {res.unitLabel}
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 font-semibold">
                      Req Met (≥{res.minUnits})
                    </span>
                  )}
                  <span className={`font-bold ${isBelowThreshold ? 'text-rose-300' : 'text-amber-300'}`}>
                    {currentVal} {res.unitLabel}
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={sMin}
                max={sMax}
                value={currentVal}
                onChange={(e) => handleSliderChange(res.id, Number(e.target.value))}
                disabled={disabled}
                className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
              />

              <p className="text-[11px] font-sans text-stone-400">
                {res.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Commit Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommit}
          disabled={disabled || isOverBudget}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <Sliders className="w-4 h-4" />
          <span>Commit Resource Allocation</span>
        </button>
      </div>
    </div>
  );
};
