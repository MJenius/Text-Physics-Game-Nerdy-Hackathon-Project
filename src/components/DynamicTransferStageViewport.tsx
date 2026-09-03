import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { Droplets, Flame, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DynamicTransferStageViewport: React.FC = () => {
  const {
    entities,
    executeAction,
    isComplete,
    exitHeroTransferScenario
  } = useGameStore();

  const isFlowing = Boolean(entities['seawater_intake']?.states?.isFlowing);
  const isIgnited = Boolean(entities['thermal_reactor']?.states?.isIgnited);
  const gaugeStatus = (entities['coolant_gauge']?.states?.status as string) || 'NORMAL';

  React.useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isComplete]);

  return (
    <div className="w-full max-w-xl flex flex-col items-center select-none animate-in fade-in duration-500">
      <div className="relative w-full rounded-t-3xl border-t-8 border-x-8 border-cyan-900/80 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-md">
        {/* Top Header Badge */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-950 border border-cyan-500/50 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-cyan-300 uppercase shadow-lg flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Triton-IV Submersible • Reactor Bay Delta
        </div>

        {/* Interior Chamber Viewport */}
        <div className="relative min-h-[380px] w-full rounded-t-2xl border-4 border-cyan-950 bg-[#07131e] flex flex-col items-center justify-between p-6 overflow-hidden">
          {/* Depth / Status Display & Exit button */}
          <div className="w-full flex items-center justify-between border-b border-cyan-900/50 pb-3 z-10 font-mono text-[11px]">
            <div className="flex items-center gap-3">
              <div className="text-cyan-400">
                DEPTH: <span className="text-white font-bold">4,120M</span>
              </div>
              <button
                onClick={exitHeroTransferScenario}
                className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-600 transition-colors cursor-pointer"
                title="Return to your observatory stage"
              >
                ← Return to Campaign
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">COOLANT LOOP:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                gaugeStatus === 'ONLINE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : gaugeStatus === 'FLOODED'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {gaugeStatus}
              </span>
            </div>
          </div>

          {isComplete ? (
            <div className="absolute inset-0 bg-radial from-cyan-400/20 via-blue-900/40 to-black/90 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-500 z-20">
              <Sparkles className="w-16 h-16 text-cyan-300 animate-pulse mb-3" />
              <h3 className="text-xl font-serif font-bold text-cyan-100">
                Geothermal Coolant Mastered!
              </h3>
              <p className="text-xs text-cyan-200/80 max-w-sm mt-2 font-serif leading-relaxed">
                Reading transfer verified: You successfully recognized and respected the causal loop interlock under high-pressure ocean conditions.
              </p>
              <button
                onClick={exitHeroTransferScenario}
                className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold font-mono tracking-wider shadow-lg transition-all cursor-pointer"
              >
                Return to Observatory Stage <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col justify-around py-4 z-10 gap-6">
              {/* Seawater Intake Valve */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/70 border border-cyan-900/60 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${
                    isFlowing
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <Droplets className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 font-mono">
                      Primary Seawater Intake
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isFlowing ? 'Flowing: Ocean seawater flooding heat exchanger coils' : 'Closed: Coils empty and dry'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => executeAction({ type: 'ACTIVATE', targetId: 'seawater_intake' })}
                  disabled={isFlowing}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isFlowing
                      ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 cursor-default'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/50'
                  }`}
                >
                  {isFlowing ? 'Open & Flowing' : 'Open Intake Valve'}
                </button>
              </div>

              {/* Thermal Reactor Igniter */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/70 border border-cyan-900/60 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${
                    isIgnited
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 font-mono">
                      Thermal Reactor Coil
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isIgnited ? 'Online: Geothermal power engaged safely' : 'Offline: Standing by for ignition toggle'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => executeAction({ type: 'ACTIVATE', targetId: 'thermal_reactor' })}
                  disabled={isIgnited}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isIgnited
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40 cursor-default'
                      : 'bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/50'
                  }`}
                >
                  {isIgnited ? 'Active & Huming' : 'Ignite Reactor'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
