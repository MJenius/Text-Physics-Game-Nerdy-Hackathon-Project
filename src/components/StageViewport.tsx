import React from 'react';
import { useGameStore } from '../engine/GameStore';
import {
  Lock,
  LockOpen,
  DoorClosed,
  RotateCw,
  Pin,
  Lamp,
  Scroll,
  Droplets,
  Flame,
  Gauge,
  Zap,
  Sun,
  Radio,
  Target,
  Sliders,
  Sparkles,
  Compass,
  CircleDot,
  Clock,
  Eye,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StageViewport: React.FC = () => {
  const {
    currentChallenge,
    currentChallengeIndex,
    entities,
    selectedInventoryItem,
    executeAction,
    isComplete,
    advanceToNextChallenge,
    totalAttempts
  } = useGameStore();

  // Trigger celebration confetti on completing any challenge
  React.useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [isComplete]);

  const handleTargetClick = (targetId: string) => {
    if (selectedInventoryItem) {
      executeAction({
        type: 'USE_ITEM_ON',
        sourceId: selectedInventoryItem,
        targetId
      });
    } else {
      executeAction({
        type: 'ACTIVATE',
        targetId
      });
    }
  };

  // --- RENDER PER-CHALLENGE SCENES ---

  // STAGE 1: Courtyard Twin Locks
  const renderChallenge1 = () => {
    const isIronUnlocked = Boolean(entities['iron_lock']?.states?.isUnlocked);
    const isBrassUnlocked = Boolean(entities['brass_latch']?.states?.isUnlocked);
    const isDoorOpen = Boolean(entities['archive_door']?.states?.isOpen);

    return (
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="relative w-full rounded-t-3xl border-t-8 border-x-8 border-stone-800/90 bg-stone-900/60 p-6 shadow-2xl backdrop-blur-sm">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[11px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Archive Vault Entryway
          </div>

          <div className="relative min-h-[360px] w-full rounded-t-2xl border-4 border-stone-950 bg-[#0c1017] flex flex-col items-center justify-between p-6 overflow-hidden">
            {isDoorOpen ? (
              <div className="absolute inset-0 bg-radial from-amber-400/20 via-cyan-900/30 to-black/90 flex flex-col items-center justify-center animate-in fade-in duration-700">
                <Sparkles className="w-16 h-16 text-amber-300 animate-pulse mb-3" />
                <h3 className="text-xl font-serif font-bold text-amber-200">
                  Vault Portal Opened!
                </h3>
                <p className="text-xs text-amber-100/70 max-w-xs text-center mt-1 font-serif">
                  The twin bolts disengage. The heavy oak door glides aside into the stone recess.
                </p>
                <button
                  onClick={advanceToNextChallenge}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Enter The Grand Library <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-between z-10">
                {/* Upper Latch Area */}
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
                      {entities['brass_latch']?.name}
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

                {/* Lower Lock Area */}
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
                      {entities['iron_lock']?.name}
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
          <div className="w-full h-3 bg-stone-800 border-t border-stone-700 mt-2 rounded" />
        </div>
      </div>
    );
  };

  // STAGE 2: Grand Library Rotating Carousel (Sequencing)
  const renderChallenge2 = () => {
    const isPinEngaged = Boolean(entities['locking_pin']?.states?.isEngaged);
    const hasRotated = Boolean(entities['catalog_crank']?.states?.hasRotated);

    return (
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="relative w-full rounded-2xl border-4 border-amber-900/60 bg-slate-950 p-6 shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-950 border border-amber-800 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-amber-300 uppercase shadow">
            Library Catalog Pedestal
          </div>

          <div className="grid grid-cols-2 gap-5 my-3">
            {/* Locking Pin (Under Table) */}
            <button
              onClick={() => handleTargetClick('locking_pin')}
              className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                !isPinEngaged
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900 border-slate-700 hover:border-amber-400/80 hover:bg-slate-850'
              }`}
            >
              <Pin className={`w-9 h-9 ${!isPinEngaged ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="text-xs font-mono font-medium text-slate-200 text-center">
                {entities['locking_pin']?.name}
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  !isPinEngaged
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {!isPinEngaged ? 'Withdrawn (Free)' : 'Engaged (Locked)'}
              </span>
            </button>

            {/* Hand Crank (To turn carousel) */}
            <button
              onClick={() => handleTargetClick('catalog_crank')}
              className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                hasRotated
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900 border-slate-700 hover:border-cyan-400/80 hover:bg-slate-850'
              }`}
            >
              <RotateCw
                className={`w-9 h-9 ${hasRotated ? 'text-emerald-400' : 'text-cyan-400 group-hover:rotate-45 transition-transform'}`}
              />
              <span className="text-xs font-mono font-medium text-slate-200 text-center">
                {entities['catalog_crank']?.name}
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  hasRotated
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {hasRotated ? 'Rotated 180°' : 'Stationary'}
              </span>
            </button>
          </div>

          {/* Environmental Desk Atmosphere */}
          <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <button
              onClick={() => handleTargetClick('reading_desk_lamp')}
              className="flex items-center gap-2 text-xs text-amber-200/80 hover:text-amber-300 cursor-pointer"
            >
              <Lamp className="w-4 h-4 text-amber-400" />
              <span>Inspect Reading Lamp</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Scroll className="w-4 h-4 text-amber-400/60" />
              <span>Catalog Stacks Mechanism</span>
            </div>
          </div>

          {hasRotated && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col items-center gap-2 animate-in fade-in">
              <div className="text-xs text-emerald-300 font-mono">
                ✓ Stacks aligned! Passage into the Laboratory Boiler opened.
              </div>
              <button
                onClick={advanceToNextChallenge}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Descend to Laboratory Boiler <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // STAGE 3: Laboratory Boiler (Cause & Effect)
  const renderChallenge3 = () => {
    const isWaterFilled = Boolean(entities['water_inlet_valve']?.states?.isFilled);
    const isBurnerIgnited = Boolean(entities['boiler_burner']?.states?.isIgnited);
    const isPistonPressurized = Boolean(entities['boiler_lift_piston']?.states?.isPressurized);

    return (
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="relative w-full rounded-2xl border-4 border-cyan-900/60 bg-slate-950 p-6 shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-cyan-950 border border-cyan-800 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-cyan-300 uppercase shadow">
            Laboratory Steam Generator
          </div>

          <div className="grid grid-cols-3 gap-4 my-3">
            {/* Water Inlet Valve */}
            <button
              onClick={() => handleTargetClick('water_inlet_valve')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isWaterFilled
                  ? 'bg-cyan-950/40 border-cyan-500/70 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-900 border-slate-700 hover:border-cyan-400/80 hover:bg-slate-850'
              }`}
            >
              <Droplets className={`w-8 h-8 ${isWaterFilled ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[11px] font-mono font-medium text-slate-200 text-center">
                Water Inlet
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  isWaterFilled
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isWaterFilled ? 'Condenser Full' : 'Empty Tank'}
              </span>
            </button>

            {/* Burner Igniter */}
            <button
              onClick={() => handleTargetClick('boiler_burner')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isBurnerIgnited
                  ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-900 border-slate-700 hover:border-amber-400/80 hover:bg-slate-850'
              }`}
            >
              <Flame className={`w-8 h-8 ${isBurnerIgnited ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-[11px] font-mono font-medium text-slate-200 text-center">
                Furnace Burner
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  isBurnerIgnited
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isBurnerIgnited ? 'Blazing 450°C' : 'Extinguished'}
              </span>
            </button>

            {/* Pressure Lift Piston */}
            <button
              onClick={() => handleTargetClick('boiler_lift_piston')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isPistonPressurized
                  ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-900 border-slate-700 hover:border-emerald-400/80 hover:bg-slate-850'
              }`}
            >
              <Gauge className={`w-8 h-8 ${isPistonPressurized ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="text-[11px] font-mono font-medium text-slate-200 text-center">
                Lift Piston
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  isPistonPressurized
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isPistonPressurized ? 'Pressurized (OK)' : 'Zero Pressure'}
              </span>
            </button>
          </div>

          {isPistonPressurized && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col items-center gap-2 animate-in fade-in">
              <div className="text-xs text-emerald-300 font-mono">
                ✓ Steam built safely without tripping the thermal safety cutoff!
              </div>
              <button
                onClick={advanceToNextChallenge}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Ascend to Control Junction <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // STAGE 4: Control Junction (Negative / Exclusion Constraint)
  const renderChallenge4 = () => {
    const isHydroOn = Boolean(entities['hydro_turbine_switch']?.states?.isEngaged);
    const isSolarOn = Boolean(entities['solar_bank_switch']?.states?.isEngaged);
    const isTransformerEnergized = Boolean(entities['transformer_master_switch']?.states?.isEnergized);

    return (
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="relative w-full rounded-2xl border-4 border-indigo-900/60 bg-slate-950 p-6 shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-950 border border-indigo-800 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-indigo-300 uppercase shadow">
            Main Electrical Distribution Board
          </div>

          <div className="grid grid-cols-2 gap-5 my-3">
            {/* Hydro Turbine Switch */}
            <button
              onClick={() => handleTargetClick('hydro_turbine_switch')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isHydroOn
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-850'
              }`}
            >
              <Zap className={`w-8 h-8 ${isHydroOn ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-xs font-mono font-medium text-slate-200">
                Hydro Turbine Line
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  isHydroOn
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isHydroOn ? 'Connected [ON]' : 'Disconnected [OFF]'}
              </span>
            </button>

            {/* Solar Accumulator Switch */}
            <button
              onClick={() => handleTargetClick('solar_bank_switch')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isSolarOn
                  ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-slate-900 border-slate-700 hover:bg-slate-850'
              }`}
            >
              <Sun className={`w-8 h-8 ${isSolarOn ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="text-xs font-mono font-medium text-slate-200">
                Solar Bank Line
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  isSolarOn
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {isSolarOn ? 'Connected [ON]' : 'Disconnected [OFF]'}
              </span>
            </button>
          </div>

          {/* Master Transformer Switch */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col items-center">
            <button
              onClick={() => handleTargetClick('transformer_master_switch')}
              className={`w-full py-4 px-6 rounded-xl border-2 flex items-center justify-center gap-3 transition-all cursor-pointer ${
                isTransformerEnergized
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'bg-stone-900 border-stone-700 hover:border-stone-500 text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Radio className={`w-6 h-6 ${isTransformerEnergized ? 'text-emerald-400 animate-pulse' : 'text-stone-400'}`} />
              <div className="text-left">
                <div className="text-xs font-mono font-bold tracking-wider uppercase">
                  Throw Master Transformer Switch
                </div>
                <div className="text-[10px] text-slate-400">
                  {isTransformerEnergized ? 'Energized to 10,000V' : 'State: De-energized (Requires exactly ONE source)'}
                </div>
              </div>
            </button>
          </div>

          {isTransformerEnergized && (
            <div className="mt-4 pt-3 flex flex-col items-center gap-2 animate-in fade-in">
              <div className="text-xs text-emerald-300 font-mono">
                ✓ Power routed safely without phase conflict! Dome relays are alive.
              </div>
              <button
                onClick={advanceToNextChallenge}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Proceed to Telescope Chamber <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // STAGE 5: Telescope Chamber (Multi-Condition Prerequisite)
  const renderChallenge5 = () => {
    const isClean = Boolean(entities['lens_cradle']?.states?.isClean);
    const isLoosened = Boolean(entities['cradle_clamp']?.states?.isLoosened);
    const hasPrism = Boolean(entities['lens_cradle']?.states?.hasPrism);

    return (
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="relative w-full rounded-2xl border-4 border-violet-900/60 bg-slate-950 p-6 shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-violet-950 border border-violet-800 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-violet-300 uppercase shadow">
            Telescope Spectrograph Mount
          </div>

          <div className="grid grid-cols-2 gap-5 my-3">
            {/* Viewfinder Optical Cradle */}
            <button
              onClick={() => handleTargetClick('lens_cradle')}
              className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                hasPrism
                  ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : isClean
                  ? 'bg-slate-900 border-cyan-700/60'
                  : 'bg-slate-900 border-slate-700 hover:border-violet-400 hover:bg-slate-850'
              }`}
            >
              <Target className={`w-9 h-9 ${hasPrism ? 'text-cyan-300 animate-spin' : isClean ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="text-xs font-mono font-medium text-slate-200 text-center">
                {entities['lens_cradle']?.name}
              </span>
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                    isClean
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {isClean ? 'Cradle Cleaned' : 'Fouled with Ash'}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                    hasPrism
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {hasPrism ? 'Prism Seated' : 'Empty Socket'}
                </span>
              </div>
            </button>

            {/* Thumbscrew Clamp */}
            <button
              onClick={() => handleTargetClick('cradle_clamp')}
              className={`p-5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                isLoosened
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-slate-900 border-slate-700 hover:border-violet-400 hover:bg-slate-850'
              }`}
            >
              <Sliders className={`w-9 h-9 ${isLoosened ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="text-xs font-mono font-medium text-slate-200 text-center">
                {entities['cradle_clamp']?.name}
              </span>
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                  isLoosened
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {isLoosened ? 'Clamp Loosened' : 'Clamp Locked Shut'}
              </span>
            </button>
          </div>

          <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            {hasPrism ? (
              <span className="text-cyan-300 font-mono">
                ✨ Quartz prism refracts bright spectral lines directly into the focal plane!
              </span>
            ) : (
              <span>
                Tip: Select the Soft Brush to clean, loosen the clamp, then apply the Quartz Prism from inventory.
              </span>
            )}
          </div>

          {hasPrism && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col items-center gap-2 animate-in fade-in">
              <button
                onClick={advanceToNextChallenge}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg cursor-pointer"
              >
                Enter Grand Observatory Dome <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // STAGE 6: Grand Observatory Dome (Synthesis)
  const renderChallenge6 = () => {
    const heading = (entities['azimuth_dial']?.states?.heading as string) || 'East';
    const isShutterUnlocked = Boolean(entities['shutter_lock_wheel']?.states?.isUnlocked);
    const isClockSynced = Boolean(entities['star_clock_sync_switch']?.states?.isSynchronized);
    const isDomeOpen = Boolean(entities['master_aperture_lever']?.states?.isDomeOpen);

    return (
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="relative w-full rounded-2xl border-4 border-amber-500/60 bg-slate-950 p-6 shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-950 border border-amber-600 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-amber-300 uppercase shadow">
            Master Celestial Control Rotunda
          </div>

          {isDomeOpen ? (
            <div className="py-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700 text-center">
              <Sparkles className="w-16 h-16 text-amber-400 animate-spin mb-3" />
              <h2 className="text-2xl font-serif font-bold text-amber-200">
                THE LOST OBSERVATORY LIVES AGAIN!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mt-2 leading-relaxed">
                The massive copper roof petals glide open to the midnight sky. The telescope, powered by steam and synchronous hydro-electric current, tracks the constellation Polaris with timeless precision.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs font-mono text-amber-300">
                ⭐ Phase 1 Vertical Slice Complete: 6 of 6 Challenges Solved via Pure Reading!
              </div>
            </div>
          ) : (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-3 gap-3">
                {/* Azimuth Bearing */}
                <button
                  onClick={() => handleTargetClick('azimuth_dial')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    heading === 'North'
                      ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900 border-slate-700 hover:border-amber-400 hover:bg-slate-850'
                  }`}
                >
                  <Compass className={`w-7 h-7 ${heading === 'North' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span className="text-[11px] font-mono font-medium text-slate-200">
                    Azimuth Bearing
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                      heading === 'North'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    Facing: {heading}
                  </span>
                </button>

                {/* Shutter Dogging Wheel */}
                <button
                  onClick={() => handleTargetClick('shutter_lock_wheel')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isShutterUnlocked
                      ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900 border-slate-700 hover:border-amber-400 hover:bg-slate-850'
                  }`}
                >
                  <CircleDot className={`w-7 h-7 ${isShutterUnlocked ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-mono font-medium text-slate-200">
                    Shutter Lock
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                      isShutterUnlocked
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isShutterUnlocked ? 'Unsealed' : 'Dogged Shut'}
                  </span>
                </button>

                {/* Star Clock Sync */}
                <button
                  onClick={() => handleTargetClick('star_clock_sync_switch')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isClockSynced
                      ? 'bg-emerald-950/40 border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900 border-slate-700 hover:border-amber-400 hover:bg-slate-850'
                  }`}
                >
                  <Clock className={`w-7 h-7 ${isClockSynced ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-mono font-medium text-slate-200">
                    Star Clock
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
                      isClockSynced
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isClockSynced ? 'Synchronized' : 'Desynced'}
                  </span>
                </button>
              </div>

              {/* Master Aperture Lever */}
              <div className="pt-3 border-t border-slate-800 flex flex-col items-center">
                <button
                  onClick={() => handleTargetClick('master_aperture_lever')}
                  className="w-full py-4 px-6 rounded-xl bg-amber-950/40 border-2 border-amber-500/70 hover:border-amber-400 hover:bg-amber-950/60 text-amber-200 flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xl"
                >
                  <Eye className="w-6 h-6 text-amber-400 animate-pulse" />
                  <div className="text-left">
                    <div className="text-xs font-mono font-bold tracking-wider uppercase">
                      Pull Master Celestial Aperture Lever
                    </div>
                    <div className="text-[10px] text-amber-300/70 font-sans">
                      Requires all 3 physical systems aligned simultaneously
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-6 select-none">
      {/* Background Ambience & Lighting */}
      <div className="absolute inset-0 bg-radial from-slate-900 via-slate-950 to-[#070a11] opacity-90 -z-10" />
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Render Active Stage Scene */}
      {currentChallengeIndex === 0 && renderChallenge1()}
      {currentChallengeIndex === 1 && renderChallenge2()}
      {currentChallengeIndex === 2 && renderChallenge3()}
      {currentChallengeIndex === 3 && renderChallenge4()}
      {currentChallengeIndex === 4 && renderChallenge5()}
      {currentChallengeIndex === 5 && renderChallenge6()}

      {/* Stage Status Footnote */}
      <div className="mt-4 flex items-center justify-between w-full max-w-xl text-xs text-slate-500 font-mono">
        <span>Attempts this session: {totalAttempts}</span>
        <span>{currentChallenge.title}</span>
      </div>
    </div>
  );
};
