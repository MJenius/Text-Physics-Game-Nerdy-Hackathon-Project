import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { Lock, LockOpen, DoorClosed, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const StageViewport: React.FC = () => {
  const {
    entities,
    selectedInventoryItem,
    executeAction,
    isComplete,
    resetCurrentChallenge,
    totalAttempts
  } = useGameStore();

  const ironLock = entities['iron_lock'];
  const brassLatch = entities['brass_latch'];
  const archiveDoor = entities['archive_door'];

  const isIronUnlocked = Boolean(ironLock?.states?.isUnlocked);
  const isBrassUnlocked = Boolean(brassLatch?.states?.isUnlocked);
  const isDoorOpen = Boolean(archiveDoor?.states?.isOpen);

  // Trigger confetti once when completing the challenge
  React.useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isComplete]);

  const handleTargetClick = (targetId: string) => {
    if (selectedInventoryItem) {
      // Use currently selected inventory item on this target
      executeAction({
        type: 'USE_ITEM_ON',
        sourceId: selectedInventoryItem,
        targetId: targetId
      });
    } else {
      // Activate / push directly
      executeAction({
        type: 'ACTIVATE',
        targetId: targetId
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-6 select-none">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-[#070a11] opacity-90 -z-10" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />


      {/* Main Architectural Scene (Observatory Courtyard Entrance) */}
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Stone Arch Frame */}
        <div className="relative w-full rounded-t-3xl border-t-8 border-x-8 border-stone-800/90 bg-stone-900/60 p-6 shadow-2xl backdrop-blur-sm">
          {/* Arch Keystone Label */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[11px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Archive Vault Entryway
          </div>

          {/* Doorway Portal */}
          <div className="relative min-h-[380px] w-full rounded-t-2xl border-4 border-stone-950 bg-[#0c1017] flex flex-col items-center justify-between p-6 overflow-hidden">
            {/* Background Vault Glow if door is open */}
            {isDoorOpen ? (
              <div className="absolute inset-0 bg-radial from-amber-400/20 via-cyan-900/30 to-black/90 flex flex-col items-center justify-center animate-in fade-in duration-700">
                <Sparkles className="w-16 h-16 text-amber-300 animate-pulse mb-3" />
                <h3 className="text-xl font-serif font-bold text-amber-200">
                  Vault Door Opened!
                </h3>
                <p className="text-xs text-amber-100/70 max-w-xs text-center mt-1 font-serif">
                  The heavy oak slab glides aside into the stone recess. Beyond lies the great telescope rotunda.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={resetCurrentChallenge}
                    className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/50 transition-colors shadow"
                  >
                    Replay Stage 1
                  </button>
                </div>
              </div>
            ) : (
              /* Closed Door Surface */
              <div className="w-full h-full flex flex-col items-center justify-between z-10">
                {/* Upper Latch Area (Brass Latch) */}
                <div className="w-full flex justify-end pr-8 pt-2">
                  <button
                    onClick={() => handleTargetClick('brass_latch')}
                    className={`group relative p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                      isBrassUnlocked
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/80 border-slate-700 hover:border-amber-400/70 hover:bg-slate-800'
                    }`}
                  >
                    {isBrassUnlocked ? (
                      <LockOpen className="w-8 h-8 text-amber-400 transition-transform group-hover:scale-105" />
                    ) : (
                      <Lock className="w-8 h-8 text-amber-200/70 transition-transform group-hover:scale-105" />
                    )}
                    <span className="text-[11px] font-mono font-medium text-amber-200">
                      {brassLatch?.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                        isBrassUnlocked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isBrassUnlocked ? 'Disengaged' : 'Latched Shut'}
                    </span>
                  </button>
                </div>

                {/* Center Door Plate / Push Area */}
                <div className="my-4">
                  <button
                    onClick={() => handleTargetClick('archive_door')}
                    className="group px-6 py-4 rounded-2xl bg-stone-900/90 border-2 border-stone-700 hover:border-stone-500 hover:bg-stone-800/90 flex flex-col items-center gap-2 transition-all cursor-pointer shadow-lg"
                  >
                    <DoorClosed className="w-12 h-12 text-stone-400 group-hover:text-stone-200 transition-colors" />
                    <span className="text-xs font-serif font-semibold text-stone-200">
                      Push Archive Door
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      (Requires both locks open)
                    </span>
                  </button>
                </div>

                {/* Lower Lock Area (Iron Lock) */}
                <div className="w-full flex justify-start pl-8 pb-2">
                  <button
                    onClick={() => handleTargetClick('iron_lock')}
                    className={`group relative p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-300 cursor-pointer ${
                      isIronUnlocked
                        ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-900/80 border-slate-700 hover:border-emerald-400/70 hover:bg-slate-800'
                    }`}
                  >
                    {isIronUnlocked ? (
                      <LockOpen className="w-8 h-8 text-emerald-400 transition-transform group-hover:scale-105" />
                    ) : (
                      <Lock className="w-8 h-8 text-slate-400 transition-transform group-hover:scale-105" />
                    )}
                    <span className="text-[11px] font-mono font-medium text-slate-200">
                      {ironLock?.name}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                        isIronUnlocked
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isIronUnlocked ? 'Unlocked' : 'Deadbolt Locked'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stone Threshold Bar */}
          <div className="w-full h-4 bg-stone-800 border-t border-stone-700 mt-2 rounded" />
        </div>

        {/* Stage Status Footnote */}
        <div className="mt-4 flex items-center justify-between w-full text-xs text-slate-500 font-mono">
          <span>Action attempts: {totalAttempts}</span>
          <span>Observation: Deterministic physical feedback</span>
        </div>
      </div>
    </div>
  );
};
