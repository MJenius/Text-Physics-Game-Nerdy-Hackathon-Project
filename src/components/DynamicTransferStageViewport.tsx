import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { Droplets, Zap, Sliders, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DynamicTransferStageViewport: React.FC = () => {
  const {
    entities,
    executeAction,
    isComplete,
    exitHeroTransferScenario,
    physicalConsequence
  } = useGameStore();

  const isBypassOpen = Boolean(entities['vapor_bypass_valve']?.states?.isOpen);
  const isPumpRunning = Boolean(entities['recirc_pump_switch']?.states?.isRunning);
  const tempC = (entities['core_temp_monitor']?.states?.tempC as number) || 480;
  const coreStatus = (entities['core_temp_monitor']?.states?.status as string) || 'CRITICAL RUNAWAY';
  const isStabilized = Boolean(entities['emergency_scram_handle']?.states?.isStabilized);

  React.useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.5 }
      });
    }
  }, [isComplete]);

  return (
    <div className="w-full max-w-xl flex flex-col items-center select-none animate-in fade-in duration-500 font-serif">
      <div className="relative w-full rounded-2xl border-4 border-cyan-900 bg-[#07131e] p-6 shadow-2xl backdrop-blur-md">
        {/* Top Header Badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-950 border border-cyan-500/50 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-cyan-300 uppercase shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Station Triton-IV • Geothermal Reactor Bay Delta (4,000m)
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-4 font-mono text-xs">
          <button
            onClick={exitHeroTransferScenario}
            className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer text-[10px]"
          >
            ← Return to Observatory
          </button>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">CORE TEMPERATURE:</span>
            <span className={`px-2 py-0.5 rounded font-bold ${
              tempC <= 120
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                : tempC <= 250
                ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                : 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse'
            }`}>
              {tempC}°C • {coreStatus}
            </span>
          </div>
        </div>

        {/* Consequence Notification */}
        {physicalConsequence && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-100 font-serif leading-relaxed">
            {physicalConsequence.description}
          </div>
        )}

        {isStabilized ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-500">
            <Sparkles className="w-14 h-14 text-cyan-300 animate-pulse" />
            <h3 className="text-xl font-bold text-cyan-100">
              TRITON-IV CRISIS RESOLVED!
            </h3>
            <p className="text-xs text-cyan-200/80 max-w-md leading-relaxed font-serif">
              Reading transfer verified: You deduced the subtle causal constraint in Chief Engineer Vance’s log, safely vented the vapor lock bypass before engaging the coolant pump, and averted catastrophic core meltdown.
            </p>
            <button
              onClick={exitHeroTransferScenario}
              className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold shadow-lg transition-all cursor-pointer"
            >
              Return to Observatory Campaign <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Vapor Lock Bypass Valve */}
              <button
                onClick={() => executeAction({ type: 'ACTIVATE', targetId: 'vapor_bypass_valve' })}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isBypassOpen
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                    : 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-300'
                }`}
              >
                <Droplets className="w-7 h-7 text-cyan-400" />
                <span className="text-xs font-mono font-medium">Vapor Bypass Valve</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  {isBypassOpen ? 'Open (Steam Purged)' : 'Closed (Vapor Locked)'}
                </span>
              </button>

              {/* 2. Recirculation Pump */}
              <button
                onClick={() => executeAction({ type: 'ACTIVATE', targetId: 'recirc_pump_switch' })}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isPumpRunning
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-200'
                    : 'bg-slate-900 border-slate-700 hover:border-cyan-400 text-slate-300'
                }`}
              >
                <Zap className="w-7 h-7 text-cyan-400" />
                <span className="text-xs font-mono font-medium">Seawater Recirc Pump</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10">
                  {isPumpRunning ? 'Running (Flooded)' : 'Standby / Stopped'}
                </span>
              </button>
            </div>

            {/* 3. Emergency Reactor Scram Handle */}
            <div className="pt-2 flex flex-col items-center">
              <button
                onClick={() => executeAction({ type: 'ACTIVATE', targetId: 'emergency_scram_handle' })}
                className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 border border-cyan-300 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                Actuate Emergency Scram Handle
              </button>
              <span className="text-[10px] font-mono text-slate-400 mt-1.5">
                (Commits boron control rod insertion to stabilize reactor core)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
