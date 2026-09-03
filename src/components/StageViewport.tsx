import React from 'react';
import { useGameStore } from '../engine/GameStore';
import {
  Lock,
  LockOpen,
  DoorClosed,
  RotateCw,
  Droplets,
  Flame,
  Gauge,
  Zap,
  Radio,
  Sliders,
  Sparkles,
  Compass,
  CircleDot,
  Clock,
  ArrowRight,
  AlertTriangle,
  Wrench,
  Wind
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StageViewport: React.FC = () => {
  const {
    currentChallenge,
    entities,
    selectedInventoryItem,
    executeAction,
    executeDecision,
    isComplete,
    advanceToNextChallenge,
    physicalConsequence,
    clearPhysicalConsequence,
    narrative
  } = useGameStore();

  // Celebration confetti on final dome completion
  React.useEffect(() => {
    if (isComplete && currentChallenge.id === 'act_7_dome') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }, [isComplete, currentChallenge.id]);

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

  // ──────────────────────────────────────────────────────────────────────────
  // PHYSICAL CONSEQUENCE BANNER (Animated World Feedback)
  // ──────────────────────────────────────────────────────────────────────────
  const renderPhysicalConsequence = () => {
    if (!physicalConsequence) return null;

    const isError = physicalConsequence.isError;
    const effect = physicalConsequence.visualEffect;

    return (
      <div
        className={`w-full max-w-xl mb-4 p-4 rounded-xl border flex items-start gap-3 shadow-xl animate-in zoom-in-95 duration-300 font-serif ${
          isError
            ? 'bg-rose-950/80 border-rose-500/60 text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
            : 'bg-stone-900/90 border-amber-500/50 text-amber-100 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
        }`}
      >
        <div className="shrink-0 p-2 rounded-lg bg-black/40 border border-white/10">
          {effect === 'steam_burst' && <Wind className="w-6 h-6 text-cyan-300 animate-pulse" />}
          {effect === 'circuit_spark' && <Zap className="w-6 h-6 text-amber-400 animate-bounce" />}
          {effect === 'gear_shudder' && <Wrench className="w-6 h-6 text-stone-300 animate-spin" />}
          {effect === 'shutter_slam' && <AlertTriangle className="w-6 h-6 text-rose-400 animate-pulse" />}
          {effect === 'door_unlock' && <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />}
          {!['steam_burst', 'circuit_spark', 'gear_shudder', 'shutter_slam', 'door_unlock'].includes(effect) && (
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-amber-400">
              World Reaction
            </span>
            <button
              onClick={clearPhysicalConsequence}
              className="text-[10px] font-mono text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="text-xs mt-1 leading-relaxed">
            {physicalConsequence.description}
          </p>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // STRATEGIC BRANCH DECISION CARDS (Agency First)
  // ──────────────────────────────────────────────────────────────────────────
  const renderDecisionCards = () => {
    const decisions = currentChallenge.availableDecisions;
    if (!decisions || decisions.length === 0) return null;

    return (
      <div className="w-full max-w-xl mt-4 p-5 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/50 shadow-2xl font-serif">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-2">
          <Zap className="w-4 h-4" />
          <span>Strategic Agency Decision — Path Selection</span>
        </div>
        <p className="text-xs text-stone-300 mb-4 leading-relaxed">
          Your reading and interpretation of the facility guides this choice. The observatory will remember this decision across future acts.
        </p>
        <div className="grid gap-3">
          {decisions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => executeDecision(opt.id)}
              className="group p-4 rounded-xl bg-stone-900/90 border border-stone-700 hover:border-amber-400 hover:bg-stone-850 flex flex-col items-start gap-1.5 transition-all text-left cursor-pointer shadow-md hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold text-amber-200 group-hover:text-amber-100 font-serif">
                  {opt.label}
                </span>
                <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-300 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                {opt.description}
              </p>
              <div className="pt-2 border-t border-stone-800/80 w-full flex items-center justify-between text-[10px] font-mono text-amber-400/80">
                <span>Consequence: {opt.downstreamHint}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ARCHETYPE 1: MECHANISM (Act I: Sealed Vestibule)
  // Strict Neutral Styling: Zero Green Cheat Indicators!
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct1Vestibule = () => {
    const isIronUnlocked = Boolean(entities['iron_lock']?.states?.isUnlocked);
    const isBrassUnlocked = Boolean(entities['brass_latch']?.states?.isUnlocked);
    const isDoorOpen = Boolean(entities['archive_door']?.states?.isOpen);

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0c1017] p-6 shadow-2xl overflow-hidden">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Vestibule Outer Portal
          </div>

          <div className="min-h-[320px] w-full flex flex-col items-center justify-between py-4">
            {/* Upper Brass Cross-Latch (Neutral Bronze Styling) */}
            <div className="w-full flex justify-end pr-6">
              <button
                onClick={() => handleTargetClick('brass_latch')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isBrassUnlocked
                    ? 'bg-amber-950/30 border-amber-600/50 shadow-inner'
                    : 'bg-stone-900 border-stone-700 hover:border-amber-400'
                }`}
              >
                <Sliders className={`w-8 h-8 ${isBrassUnlocked ? 'text-amber-400' : 'text-stone-400'}`} />
                <span className="text-[11px] font-mono text-stone-200">
                  {entities['brass_latch']?.name}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                  State: {isBrassUnlocked ? 'Disengaged (Open)' : 'Latched Shut'}
                </span>
              </button>
            </div>

            {/* Center Door Plate (Physical Push Action) */}
            <div className="my-2">
              <button
                onClick={() => handleTargetClick('archive_door')}
                className="group px-8 py-5 rounded-2xl bg-stone-900 border-2 border-stone-700 hover:border-amber-500 hover:bg-stone-850 flex flex-col items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
              >
                <DoorClosed className="w-14 h-14 text-stone-400 group-hover:text-amber-300 transition-colors" />
                <span className="text-sm font-bold text-stone-200 group-hover:text-amber-100">
                  Push Vestibule Oak Door
                </span>
                <span className="text-[10px] font-mono text-stone-500">
                  (Commits physical push against both locks)
                </span>
              </button>
            </div>

            {/* Lower Wrought-Iron Deadbolt (Neutral Steel Styling) */}
            <div className="w-full flex justify-start pl-6">
              <button
                onClick={() => handleTargetClick('iron_lock')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isIronUnlocked
                    ? 'bg-stone-800/60 border-stone-600 shadow-inner'
                    : 'bg-stone-900 border-stone-700 hover:border-amber-400'
                }`}
              >
                {isIronUnlocked ? (
                  <LockOpen className="w-8 h-8 text-stone-300" />
                ) : (
                  <Lock className="w-8 h-8 text-stone-400" />
                )}
                <span className="text-[11px] font-mono text-stone-200">
                  {entities['iron_lock']?.name}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                  State: {isIronUnlocked ? 'Bolt Withdrawn' : 'Deadbolt Locked'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Once Door is Open, present the strategic choice */}
        {isDoorOpen && renderDecisionCards()}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ARCHETYPE 2: INVESTIGATION (Act II-A: Sunken Archive Safe)
  // Safe Dial (0–9) & Release Lever Commit with Zero Green UI
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct2Archive = () => {
    const dialPos = (entities['curator_safe']?.states?.dialPosition as number) || 0;
    const isUnlocked = Boolean(entities['curator_safe']?.states?.isUnlocked);

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0c1017] p-6 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Curator’s Optical Safe — Sunken Archive
          </div>

          <div className="py-6 flex flex-col items-center justify-center space-y-6">
            {/* Safe Dial Interface */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleTargetClick('curator_safe')}
                disabled={isUnlocked}
                className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center gap-1 transition-all shadow-xl cursor-pointer ${
                  isUnlocked
                    ? 'bg-stone-900/60 border-stone-700 text-stone-400'
                    : 'bg-stone-900 border-amber-600/70 hover:border-amber-400 active:scale-95'
                }`}
              >
                <RotateCw className="w-6 h-6 text-amber-400" />
                <span className="text-3xl font-mono font-bold text-amber-200">
                  {dialPos}
                </span>
                <span className="text-[9px] font-mono uppercase text-stone-400">
                  Click to Turn Dial
                </span>
              </button>
              <p className="text-[11px] text-stone-400 mt-2 font-mono">
                Formula: Month of Solstice minus Lunar Stations
              </p>
            </div>

            {/* Commit Lever */}
            <div>
              <button
                onClick={() => handleTargetClick('safe_lever')}
                disabled={isUnlocked}
                className={`px-8 py-3 rounded-xl border-2 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer ${
                  isUnlocked
                    ? 'bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-500 border-amber-400 text-stone-950 active:scale-95'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Commit Safe Release Lever
              </button>
            </div>

            {/* Inside the safe when unlocked */}
            {isUnlocked && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 flex flex-col items-center gap-2 animate-in fade-in">
                <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
                <h4 className="text-sm font-bold text-amber-200">
                  589nm Quartz Optical Prism Retrieved!
                </h4>
                <p className="text-xs text-stone-300 text-center max-w-sm">
                  The velvet safe tray glides forward. The precision optical crystal is secured in your inventory for the telescope rotunda.
                </p>
                <button
                  onClick={advanceToNextChallenge}
                  className="mt-2 flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold cursor-pointer"
                >
                  Proceed to Power Junction <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ARCHETYPE 1 (Branch B): MECHANISM (Act II-B: Hydraulic Boiler Priming)
  // Water Valve & Burner Ignition with Causal Blowout Protection
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct2Hydraulics = () => {
    const isWaterOpen = Boolean(entities['cold_water_intake']?.states?.isOpen);
    const isLit = Boolean(entities['pilot_burner']?.states?.isLit);
    const psi = (entities['boiler_pressure_gauge']?.states?.psi as number) || 0;

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0c1017] p-6 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Subterranean Boiler Vault — Steam Priming
          </div>

          <div className="py-4 space-y-6">
            {/* Pressure Readout */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-stone-900 border border-stone-800 font-mono text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <Gauge className="w-5 h-5 text-amber-400" />
                <span>Boiler Core Pressure:</span>
              </div>
              <span className={`text-base font-bold ${psi > 0 ? 'text-amber-300' : 'text-stone-500'}`}>
                {psi} PSI
              </span>
            </div>

            {/* Two Controls: Water Valve & Kerosene Burner */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cold Water Intake */}
              <button
                onClick={() => handleTargetClick('cold_water_intake')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isWaterOpen
                    ? 'bg-stone-850 border-cyan-500/60 text-cyan-200'
                    : 'bg-stone-900 border-stone-700 hover:border-cyan-400 text-stone-300'
                }`}
              >
                <Droplets className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-mono font-medium">Condenser Water Valve</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                  {isWaterOpen ? 'Valve Open (Flooded)' : 'Closed (Dry)'}
                </span>
              </button>

              {/* Pilot Burner Igniter */}
              <button
                onClick={() => handleTargetClick('pilot_burner')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isLit
                    ? 'bg-stone-850 border-amber-500/60 text-amber-200'
                    : 'bg-stone-900 border-stone-700 hover:border-amber-400 text-stone-300'
                }`}
              >
                <Flame className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-mono font-medium">Kerosene Pilot Burner</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                  {isLit ? 'Flame Active' : 'Extinguished'}
                </span>
              </button>
            </div>

            {/* Advance when stabilized */}
            {isLit && (
              <div className="pt-2 flex justify-center animate-in fade-in">
                <button
                  onClick={advanceToNextChallenge}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold cursor-pointer"
                >
                  Proceed to Power Junction <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ARCHETYPE 3: RESOURCE ALLOCATION & TELEGRAPH (Act III: Great Junction)
  // Acoustic Receiver, Knife Switches with 100 kW limit, & Agency Decision
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct3Junction = () => {
    const isArchiveEngaged = Boolean(entities['archive_power_switch']?.states?.isEngaged);
    const isHydraulicEngaged = Boolean(entities['hydraulic_power_switch']?.states?.isEngaged);

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0c1017] p-6 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Dynamo Power Routing Junction
          </div>

          <div className="py-3 space-y-4">
            {/* Bus Bar Load Meter */}
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-stone-300">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Emergency Dynamo Bus Limit:</span>
              </div>
              <span className="font-bold text-amber-300">
                100 kW Ceiling (80 kW per Breaker)
              </span>
            </div>

            {/* Knife Switches */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTargetClick('archive_power_switch')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isArchiveEngaged
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-inner'
                    : 'bg-stone-900 border-stone-700 hover:border-amber-400'
                }`}
              >
                <Zap className={`w-7 h-7 ${isArchiveEngaged ? 'text-amber-400' : 'text-stone-500'}`} />
                <span className="text-xs font-mono font-medium text-stone-200">Archive Scanners</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                  {isArchiveEngaged ? 'Engaged (80 kW)' : 'Open / Off'}
                </span>
              </button>

              <button
                onClick={() => handleTargetClick('hydraulic_power_switch')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  isHydraulicEngaged
                    ? 'bg-amber-950/30 border-amber-500/60 shadow-inner'
                    : 'bg-stone-900 border-stone-700 hover:border-amber-400'
                }`}
              >
                <Zap className={`w-7 h-7 ${isHydraulicEngaged ? 'text-amber-400' : 'text-stone-500'}`} />
                <span className="text-xs font-mono font-medium text-stone-200">Hydraulic Core Lift</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                  {isHydraulicEngaged ? 'Engaged (80 kW)' : 'Open / Off'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Show Strategic Decision Cards */}
        {renderDecisionCards()}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ARCHETYPE 4: SPATIAL NAVIGATION (Act IV: Consequential Concourse)
  // Reacts Directly to Act III Decision!
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct4Navigation = () => {
    const powerRoute = narrative.playerDecisions['power_allocation']?.value;
    const isComplete = Boolean(useGameStore.getState().flags['act4_navigation_complete']);

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0c1017] p-6 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-stone-300 uppercase shadow">
            The Concourse Crossroads — Dome Approach
          </div>

          <div className="py-4 space-y-5">
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 font-serif leading-relaxed">
              Active Facility Power: <strong className="text-amber-300 uppercase font-mono">{String(powerRoute || 'archive')}</strong> sector is energized.
              Select the corresponding corridor to traverse upward without hazard.
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* East Portal */}
              <button
                onClick={() => handleTargetClick('east_optical_portal')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  powerRoute === 'archive'
                    ? 'bg-amber-950/30 border-amber-500/60 hover:border-amber-400'
                    : 'bg-stone-900 border-stone-800 opacity-60'
                }`}
              >
                <Compass className="w-8 h-8 text-amber-400" />
                <span className="text-xs font-mono font-bold text-stone-200">
                  East Optical Gallery
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {powerRoute === 'archive' ? 'Radiant Electric Light' : 'Dark & Hazardous'}
                </span>
              </button>

              {/* West Elevator */}
              <button
                onClick={() => handleTargetClick('west_hydraulic_lift')}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                  powerRoute === 'laboratory'
                    ? 'bg-cyan-950/30 border-cyan-500/60 hover:border-cyan-400'
                    : 'bg-stone-900 border-stone-800 opacity-60'
                }`}
              >
                <DoorClosed className="w-8 h-8 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-stone-200">
                  West Hydraulic Elevator
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {powerRoute === 'laboratory' ? 'Hydraulic Hoist Online' : 'Unpowered Lift Shaft'}
                </span>
              </button>
            </div>

            {isComplete && (
              <div className="pt-2 flex justify-center animate-in fade-in">
                <button
                  onClick={advanceToNextChallenge}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold cursor-pointer"
                >
                  Enter Adaptive Diagnostic Chamber <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ARCHETYPE 2 (Act V): ADAPTIVE DIAGNOSTIC INCIDENT INVESTIGATION
  // Incident Log Analysis & Ceramic Shunt Replacement
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct5Adaptive = () => {
    const shuntState = (entities['emergency_telemetry_terminal']?.states?.shuntState as string) || 'BURNED';
    const isComplete = shuntState === 'RESTORED';

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0c1017] p-6 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Relay Room — Adaptive Incident Investigation
          </div>

          <div className="py-4 space-y-5">
            <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2 text-stone-300">
                <Radio className="w-5 h-5 text-amber-400" />
                <span>Dome Relay Filament:</span>
              </div>
              <span className={`font-bold ${shuntState === 'RESTORED' ? 'text-amber-300' : 'text-rose-400'}`}>
                {shuntState === 'RESTORED' ? 'ONLINE (Restored)' : 'MELTED / BURNED'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border border-stone-800 rounded-xl bg-stone-950/60">
              <button
                onClick={() => handleTargetClick('emergency_telemetry_terminal')}
                className="group p-5 rounded-2xl bg-stone-900 border border-stone-700 hover:border-amber-400 flex flex-col items-center gap-2 cursor-pointer"
              >
                <Zap className="w-10 h-10 text-amber-400 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-mono text-stone-200">
                  {entities['emergency_telemetry_terminal']?.name}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  (Select Ceramic Safety Shunt from inventory to install)
                </span>
              </button>
            </div>

            {isComplete && (
              <div className="pt-2 flex justify-center animate-in fade-in">
                <button
                  onClick={advanceToNextChallenge}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold cursor-pointer"
                >
                  Ascend to Master Celestial Dome <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ARCHETYPE 5: MASTER SYNTHESIS (Act VII: Celestial Rotunda)
  // Strict Zero-Solution-State UI: Neutral Dials, Committed Consequence!
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct7Dome = () => {
    const heading = (entities['azimuth_dial']?.states?.heading as string) || 'East';
    const isShutterUnlocked = Boolean(entities['shutter_lock_wheel']?.states?.isUnlocked);
    const isClockSynced = Boolean(entities['star_clock_sync_switch']?.states?.isSynchronized);
    const hasPrism = Boolean(entities['quartz_receptacle']?.states?.hasPrism);
    const isDomeOpen = Boolean(entities['master_aperture_lever']?.states?.isDomeOpen);

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-amber-600/50 bg-[#0c1017] p-6 shadow-2xl">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-950 border border-amber-600 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-amber-300 uppercase shadow">
            Master Celestial Rotunda — Mount Caelum Summit
          </div>

          {isDomeOpen ? (
            <div className="py-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-700 text-center space-y-3">
              <Sparkles className="w-16 h-16 text-amber-300 animate-spin mb-2" />
              <h2 className="text-2xl font-bold text-amber-200">
                THE LOST OBSERVATORY LIVES AGAIN!
              </h2>
              <p className="text-xs text-stone-300 max-w-md leading-relaxed font-serif">
                The massive copper roof petals glide open to the crisp mountain midnight.
                The 40-inch Great Refractor tracks Polaris with sidereal perfection.
                Starlight refracts through the quartz prism directly onto the scholar’s desk.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs font-mono text-amber-300">
                ★ 7 of 7 Acts Completed Through Pure Reading Comprehension & Mental Model Agency!
              </div>
            </div>
          ) : (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-3 gap-3">
                {/* 1. Azimuth Dial (Neutral Brass — NO green cheat!) */}
                <button
                  onClick={() => handleTargetClick('azimuth_dial')}
                  className="p-3 rounded-xl border border-stone-700 bg-stone-900 hover:border-amber-400 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Compass className="w-7 h-7 text-amber-400" />
                  <span className="text-[11px] font-mono text-stone-200">
                    Azimuth Dial
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                    Facing: {heading}
                  </span>
                </button>

                {/* 2. Shutter Dogging Wheel (Neutral Iron) */}
                <button
                  onClick={() => handleTargetClick('shutter_lock_wheel')}
                  className="p-3 rounded-xl border border-stone-700 bg-stone-900 hover:border-amber-400 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <CircleDot className="w-7 h-7 text-stone-300" />
                  <span className="text-[11px] font-mono text-stone-200">
                    Shutter Dogs
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                    {isShutterUnlocked ? 'Dogs Released' : 'Dogs Sealed'}
                  </span>
                </button>

                {/* 3. Star Clock Sync (Neutral Brass) */}
                <button
                  onClick={() => handleTargetClick('star_clock_sync_switch')}
                  className="p-3 rounded-xl border border-stone-700 bg-stone-900 hover:border-amber-400 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Clock className="w-7 h-7 text-stone-300" />
                  <span className="text-[11px] font-mono text-stone-200">
                    Star Clock
                  </span>
                  <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                    {isClockSynced ? 'Synchronized' : 'Disengaged'}
                  </span>
                </button>
              </div>

              {/* Prism Insertion Slot */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => handleTargetClick('quartz_receptacle')}
                  className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-mono text-xs transition-all cursor-pointer ${
                    hasPrism
                      ? 'bg-amber-950/30 border-amber-500/60 text-amber-200'
                      : 'bg-stone-900 border-stone-700 hover:border-amber-400 text-stone-400'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{hasPrism ? '589nm Quartz Prism Fitted in Focal Train' : 'Prism Cradle: Empty'}</span>
                </button>
              </div>

              {/* Master Aperture Actuator (The Physical Commit Lever!) */}
              <div className="pt-3 flex flex-col items-center">
                <button
                  onClick={() => handleTargetClick('master_aperture_lever')}
                  className="px-10 py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 border-2 border-amber-400 text-stone-950 text-xs font-mono font-bold uppercase tracking-widest transition-all shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] active:scale-95 cursor-pointer"
                >
                  Haul Master Aperture Actuator
                </button>
                <span className="text-[10px] font-mono text-stone-500 mt-1.5">
                  (Commits physical dome drive. Misalignment causes violent shutter lock!)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Route viewport renderer based on active scene
  const renderActiveScene = () => {
    switch (currentChallenge.id) {
      case 'act_1_vestibule':
        return renderAct1Vestibule();
      case 'act_2_archive':
        return renderAct2Archive();
      case 'act_2_hydraulics':
        return renderAct2Hydraulics();
      case 'act_3_junction':
        return renderAct3Junction();
      case 'act_4_navigation':
        return renderAct4Navigation();
      case 'act_5_adaptive':
        return renderAct5Adaptive();
      case 'act_7_dome':
        return renderAct7Dome();
      default:
        return renderAct1Vestibule();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2">
      {renderPhysicalConsequence()}
      {renderActiveScene()}
    </div>
  );
};
