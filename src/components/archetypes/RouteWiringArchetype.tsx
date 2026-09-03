import React, { useState } from 'react';
import { Zap, AlertTriangle, Sliders } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { RouteNode } from '../../types/game';

interface RouteWiringArchetypeProps {
  title: string;
  maxLoadCeilingKw: number;
  nodes: RouteNode[];
  initialActiveNodeIds?: string[];
  incompatiblePairs?: [string, string][];
  onCommitRouting: (activeNodeIds: string[], isOverloaded: boolean) => void;
  disabled?: boolean;
}

export const RouteWiringArchetype: React.FC<RouteWiringArchetypeProps> = ({
  title,
  maxLoadCeilingKw = 100,
  nodes,
  initialActiveNodeIds = [],
  incompatiblePairs = [],
  onCommitRouting,
  disabled = false,
}) => {
  const [activeIds, setActiveIds] = useState<string[]>(initialActiveNodeIds);
  const [isTripped, setIsTripped] = useState<boolean>(false);

  // Calculate current total electrical load
  const totalLoadKw = nodes
    .filter((n) => activeIds.includes(n.id))
    .reduce((sum, n) => sum + n.powerDemandKw, 0);

  const isOverCeiling = totalLoadKw > maxLoadCeilingKw;

  // Check mutual exclusion breaches
  const hasIncompatibleBreach = incompatiblePairs.some(
    ([a, b]) => activeIds.includes(a) && activeIds.includes(b)
  );

  const toggleNode = (nodeId: string) => {
    if (disabled || isTripped) return;
    SoundFX.playLatch();

    setActiveIds((prev) => {
      const willEnable = !prev.includes(nodeId);
      const next = willEnable ? [...prev, nodeId] : prev.filter((id) => id !== nodeId);

      // Check if this immediate toggle surges the bus past breaker tolerance
      const nextLoad = nodes
        .filter((n) => next.includes(n.id))
        .reduce((sum, n) => sum + n.powerDemandKw, 0);

      if (nextLoad > maxLoadCeilingKw * 1.5) {
        // Severe instant magnetic blowout!
        SoundFX.playSpark();
        setIsTripped(true);
      }

      return next;
    });
  };

  const resetBreakers = () => {
    SoundFX.playTumbler();
    setIsTripped(false);
    setActiveIds([]);
  };

  const handleCommit = () => {
    if (isOverCeiling || hasIncompatibleBreach) {
      SoundFX.playSpark();
      setIsTripped(true);
      onCommitRouting(activeIds, true);
    } else {
      SoundFX.playDynamoHum();
      onCommitRouting(activeIds, false);
    }
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          <span>Dynamo Power Routing — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Load Bus Interlock
        </span>
      </div>

      {/* Bus Bar Load Meter */}
      <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 mb-5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-stone-300">Dynamo Reserve Bus:</span>
          <span
            className={`font-bold text-sm ${
              isOverCeiling ? 'text-rose-400 animate-pulse' : 'text-amber-300'
            }`}
          >
            {totalLoadKw} kW / {maxLoadCeilingKw} kW Ceiling
          </span>
        </div>

        {/* Meter Bar */}
        <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-800 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverCeiling
                ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                : totalLoadKw > 0
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                : 'bg-stone-700'
            }`}
            style={{ width: `${Math.min(100, (totalLoadKw / maxLoadCeilingKw) * 100)}%` }}
          />
        </div>

        {isOverCeiling && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-rose-400 pt-1">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Overload Warning: Total draw exceeds emergency generator ceiling!</span>
          </div>
        )}
      </div>

      {/* Overload Trip Banner */}
      {isTripped && (
        <div className="p-4 mb-5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-100 flex items-center justify-between animate-in zoom-in-95 duration-200 font-serif">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-rose-400 animate-bounce" />
            <div>
              <span className="text-xs font-mono font-bold uppercase text-rose-300 block">
                Magnetic Breaker Tripped!
              </span>
              <span className="text-[11px] text-stone-300">
                Surge protection opened bus contacts. Reset required before re-routing.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={resetBreakers}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-stone-950 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer active:scale-95"
          >
            Reset Master Breaker
          </button>
        </div>
      )}

      {/* Tactile Routing Switchboard (Among Us Style Node Connections) */}
      <div className="space-y-3 mb-6">
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
          Select Subsystem Power Conduits:
        </span>

        <div className="grid gap-2.5">
          {nodes.map((node) => {
            const isEngaged = activeIds.includes(node.id);
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => toggleNode(node.id)}
                disabled={disabled || isTripped}
                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                  isEngaged
                    ? 'bg-amber-950/30 border-amber-500/80 shadow-inner'
                    : 'bg-stone-900/80 border-stone-700/80 hover:border-amber-400/60 hover:bg-stone-850'
                } disabled:opacity-50`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                      isEngaged
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-500'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-serif text-stone-200">
                      {node.name}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-sans leading-tight">
                      {node.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 font-mono shrink-0 ml-3">
                  <span className="text-[11px] font-bold text-amber-400">
                    {node.powerDemandKw} kW
                  </span>
                  <span
                    className={`text-[9px] uppercase px-2 py-0.5 rounded border ${
                      isEngaged
                        ? 'bg-amber-950 border-amber-700/60 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-500'
                    }`}
                  >
                    {isEngaged ? 'Engaged' : 'Isolated'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commit Knife Switch */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommit}
          disabled={disabled || isTripped || activeIds.length === 0}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <Sliders className="w-4 h-4" />
          <span>Commit Bus Bar Conduit Flow</span>
        </button>
        <span className="text-[10px] font-mono text-stone-500 mt-2">
          (Sets permanent power routing across Mount Caelum. Unpowered sectors lose lighting & tools.)
        </span>
      </div>
    </div>
  );
};
