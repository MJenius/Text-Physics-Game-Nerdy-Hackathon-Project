import React from 'react';
import { useGameStore } from '../engine/GameStore';
import {
  Lock,
  LockOpen,
  DoorClosed,
  Zap,
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
import { CalibrateArchetype } from './archetypes/CalibrateArchetype';
import { RouteWiringArchetype } from './archetypes/RouteWiringArchetype';
import { DialogueArchetype } from './archetypes/DialogueArchetype';
import { RepairAssemblyArchetype } from './archetypes/RepairAssemblyArchetype';

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
        particleCount: 120,
        spread: 90,
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
              type="button"
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
              type="button"
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
  // ACT I: ARRIVAL (Vestibule Outer Portal)
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct1Vestibule = () => {
    const isIronUnlocked = Boolean(entities['iron_lock']?.states?.isUnlocked);
    const isBrassUnlocked = Boolean(entities['brass_latch']?.states?.isUnlocked);
    const isDoorOpen = Boolean(entities['archive_door']?.states?.isOpen);

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <div className="relative w-full rounded-2xl border-4 border-stone-800 bg-[#0c1017] p-6 shadow-2xl overflow-hidden">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 px-4 py-0.5 rounded text-[10px] font-mono tracking-widest text-stone-300 uppercase shadow">
            Vestibule Outer Portal — Mount Caelum Gateway
          </div>

          <div className="min-h-[320px] w-full flex flex-col items-center justify-between py-4">
            {/* Upper Brass Cross-Latch */}
            <div className="w-full flex justify-end pr-6">
              <button
                type="button"
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

            {/* Center Oak Door Plate (Physical Push Action) */}
            <div className="my-2">
              <button
                type="button"
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

            {/* Lower Wrought-Iron Deadbolt */}
            <div className="w-full flex justify-start pl-6">
              <button
                type="button"
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
  // ACT II: THE DEAD CLOCK (Calibration Archetype)
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct2Clock = () => {
    const isClutchEngaged = Boolean(entities['pendulum_clutch']?.states?.isEngaged);
    const isEscapementRunning = Boolean(entities['deadbeat_escapement']?.states?.isRunning);

    return (
      <div className="w-full max-w-xl flex flex-col items-center gap-4 font-serif">
        <CalibrateArchetype
          title="Great Sidereal Clock Pendulum"
          variableName="Escapement Cadence"
          unit="BPM"
          initialValue={50}
          minValue={45}
          maxValue={70}
          step={1}
          targetValue={58}
          tolerance={1}
          instructionSnippet={
            currentChallenge.calibrateConfig?.instructionSnippet ||
            'At 2,840 meters elevation, calibrate the pendulum escapement to exactly 58 BPM.'
          }
          onCommit={(val, isAccurate) => {
            executeAction({
              type: 'CALIBRATE',
              targetId: 'deadbeat_escapement',
              payload: { value: val, isAccurate }
            });
          }}
          disabled={isEscapementRunning}
        />

        {/* Once Escapement is running, enable Clutch Lever */}
        {isEscapementRunning && (
          <div className="w-full p-4 rounded-xl bg-stone-900 border border-amber-600/50 flex items-center justify-between animate-in fade-in">
            <div>
              <h4 className="text-xs font-bold text-amber-200 font-serif">
                Pendulum Swinging at True Sidereal Rate (58 BPM)
              </h4>
              <p className="text-[11px] text-stone-400 font-sans">
                Engage the mechanical drive clutch to connect the astronomical register.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleTargetClick('pendulum_clutch')}
              disabled={isClutchEngaged}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider cursor-pointer ${
                isClutchEngaged
                  ? 'bg-stone-800 text-stone-500 border border-stone-700'
                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 border border-amber-400 active:scale-95'
              }`}
            >
              {isClutchEngaged ? 'Clutch Engaged' : 'Engage Clutch'}
            </button>
          </div>
        )}

        {/* Once Complete, advance button */}
        {isClutchEngaged && (
          <div className="pt-2 flex justify-center animate-in fade-in">
            <button
              type="button"
              onClick={advanceToNextChallenge}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold cursor-pointer shadow-lg"
            >
              Proceed to Power Junction <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ACT III: POWER FAILURE (Route / Wiring Archetype)
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct3Junction = () => {
    const config = currentChallenge.routeWiringConfig;
    const nodes = config?.nodes || [
      { id: 'archive_power_switch', name: 'Archive Document Gallery', powerDemandKw: 80, description: 'Illuminates archives, safe scanners, and optical plates.' },
      { id: 'hydraulic_power_switch', name: 'Hydraulic Core Elevator', powerDemandKw: 80, description: 'Drives pressurized hoist up the central mountain shaft.' },
      { id: 'transmitter_power_switch', name: 'Acoustic Telegraph Relay', powerDemandKw: 20, description: 'Long-range telegraph transceiver array.' }
    ];

    return (
      <div className="w-full max-w-xl flex flex-col items-center font-serif">
        <RouteWiringArchetype
          title="Central Dynamo Switchboard"
          maxLoadCeilingKw={100}
          nodes={nodes}
          incompatiblePairs={[['archive_power_switch', 'hydraulic_power_switch']]}
          onCommitRouting={(activeIds, isOverloaded) => {
            if (isOverloaded) {
              executeAction({
                type: 'ACTIVATE',
                targetId: 'archive_power_switch'
              });
            } else {
              executeAction({
                type: 'ACTIVATE',
                targetId: activeIds[0] || 'archive_power_switch'
              });
            }
          }}
        />

        {/* Show Strategic Decision Cards for Downstream Branching */}
        {renderDecisionCards()}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ACT IV: THE MISSING ENGINEER (Dialogue Archetype)
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct4Dialogue = () => {
    const config = currentChallenge.dialogueConfig;

    return (
      <div className="w-full max-w-xl flex flex-col items-center gap-4 font-serif">
        <DialogueArchetype
          characterName={config?.characterName || 'Chief Machinist Aris'}
          characterTitle="Head of Mountain Engineering & Maintenance"
          initialTrust={narrative.characterRelationships['aris'] ?? 50}
          initialNodeId={config?.initialNodeId || 'aris_intro'}
          nodes={config?.nodes || {}}
          onDialogueComplete={(finalNodeId, trustDelta, intent) => {
            executeAction({
              type: 'ACTIVATE',
              targetId: 'intercom_pipe',
              payload: { finalNodeId, trustDelta, intent }
            });
          }}
        />

        {Boolean(useGameStore.getState().flags['act4_navigation_complete']) && (
          <div className="pt-2 flex justify-center animate-in fade-in">
            <button
              type="button"
              onClick={advanceToNextChallenge}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold cursor-pointer shadow-lg"
            >
              Ascend to Concourse & Relay Room <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ACT V: THE CONSEQUENCE (Repair / Assembly Archetype)
  // ──────────────────────────────────────────────────────────────────────────
  const renderAct5Adaptive = () => {
    const shuntState = (entities['emergency_telemetry_terminal']?.states?.shuntState as string) || 'BURNED';
    const isComplete = shuntState === 'RESTORED';
    const powerRoute = narrative.playerDecisions['power_allocation']?.value;

    return (
      <div className="w-full max-w-xl flex flex-col items-center gap-4 font-serif">
        {/* Sector Status Banner showing ripple effects */}
        <div className="w-full p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Sector Status:</span>
          </div>
          <span className="text-amber-300 font-bold uppercase">
            {powerRoute === 'laboratory' ? 'Laboratory Powered • Archive in Darkness' : 'Archive Powered • Elevator Depowered'}
          </span>
        </div>

        <RepairAssemblyArchetype
          title="Dome Relay Terminal Safety Shunt"
          instructionSnippet="Install Ceramic Safety Shunt directly into Socket #1 to re-establish dome circuit."
          slotsCount={1}
          components={[
            { id: 'replacement_shunt', name: 'Ceramic Safety Shunt', slotIndex: 0, description: 'Stepped ceramic 20A shunt.' }
          ]}
          onCommitAssembly={(_slots, isCorrect) => {
            if (isCorrect) {
              executeAction({
                type: 'USE_ITEM_ON',
                sourceId: 'replacement_shunt',
                targetId: 'emergency_telemetry_terminal'
              });
            }
          }}
          disabled={isComplete}
        />

        {isComplete && (
          <div className="pt-2 flex justify-center animate-in fade-in">
            <button
              type="button"
              onClick={advanceToNextChallenge}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-mono font-bold cursor-pointer shadow-lg"
            >
              Ascend to Master Celestial Dome <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────────────────
  // ACT VII: FINAL SYNTHESIS (Celestial Rotunda)
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
              <h2 className="text-2xl font-bold text-amber-200 font-serif">
                THE LOST OBSERVATORY LIVES AGAIN!
              </h2>
              <p className="text-xs text-stone-300 max-w-md leading-relaxed font-serif">
                The massive copper roof petals glide open to the crisp mountain midnight.
                The 40-inch Great Refractor tracks Polaris with sidereal perfection.
                Starlight refracts through the quartz prism directly onto the scholar’s recording plate.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-xs font-mono text-amber-300">
                ★ Complete 7-Act Adventure Finished Through Pure Reading Comprehension & Physical Deduction!
              </div>
            </div>
          ) : (
            <div className="space-y-4 my-2">
              <div className="grid grid-cols-3 gap-3">
                {/* 1. Azimuth Dial (Neutral Brass — Zero green cheat!) */}
                <button
                  type="button"
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

                {/* 2. Shutter Dogging Wheel */}
                <button
                  type="button"
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

                {/* 3. Star Clock Sync */}
                <button
                  type="button"
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
                  type="button"
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

              {/* Master Aperture Actuator */}
              <div className="pt-3 flex flex-col items-center">
                <button
                  type="button"
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

  // Route viewport renderer based on active scene / archetype
  const renderActiveScene = () => {
    switch (currentChallenge.id) {
      case 'act_1_vestibule':
        return renderAct1Vestibule();
      case 'act_2_clock':
      case 'act_2_archive':
      case 'act_2_hydraulics':
        return renderAct2Clock();
      case 'act_3_junction':
        return renderAct3Junction();
      case 'act_4_navigation':
        return renderAct4Dialogue();
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
