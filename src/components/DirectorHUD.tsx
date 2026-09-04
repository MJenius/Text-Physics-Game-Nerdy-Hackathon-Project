import React, { useState } from 'react';
import { useLearnerStore } from '../engine/LearnerStore';
import { useGameStore } from '../engine/GameStore';
import { GameDirector } from '../engine/GameDirector';
import { Sparkles, Compass, Cpu, Sliders, ChevronDown, ChevronUp } from 'lucide-react';

interface DirectorHUDProps {
  onOpenTransfer?: () => void;
  canTriggerTransfer?: boolean;
}

export const DirectorHUD: React.FC<DirectorHUDProps> = ({ onOpenTransfer, canTriggerTransfer }) => {
  const { profile } = useLearnerStore();
  const {
    jumpToAct,
    currentAct,
    activeArchetype,
    currentChallengeId
  } = useGameStore();

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  if (!profile) return null;

  const diagnosis = profile.lastDiagnosis || {
    headline: 'World Attuned',
    insight: 'The observatory mechanisms respond according to your reading deductions.',
    timestamp: 0
  };

  const isTransferReady = canTriggerTransfer || profile.lastDiagnosis?.headline.includes('Transfer');

  return (
    <div className="w-full bg-stone-950/80 border-b border-stone-800 px-6 py-2 z-20 select-none animate-in fade-in duration-300 font-serif">
      <div className="flex items-center justify-between gap-4">
        {/* Natural Narrative Insight */}
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>AI Director</span>
          </div>

          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-bold text-amber-200/95 shrink-0">
              {diagnosis.headline}:
            </span>
            <span className="text-xs text-stone-300 truncate font-sans">
              {diagnosis.insight}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Judge / Demo Inspector Toggle */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
              isInspectorOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                : 'bg-stone-900 text-stone-400 hover:text-amber-200 border-stone-700 hover:border-amber-500'
            }`}
            title="Inspect AI Director reasoning and simulate learner weaknesses"
          >
            <Cpu className="w-3 h-3" />
            <span className="hidden sm:inline">Demo Inspector</span>
            {isInspectorOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Hero Transfer Button */}
          {isTransferReady && onOpenTransfer && (
            <button
              onClick={onOpenTransfer}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-mono font-bold tracking-wide shadow-lg shadow-cyan-900/30 transition-all cursor-pointer animate-pulse"
            >
              <Compass className="w-3.5 h-3.5" />
              Triton Transfer
            </button>
          )}
        </div>
      </div>

      {/* Discreet Demo / Judge Inspector Drawer */}
      {isInspectorOpen && (
        <div className="mt-3 pt-3 border-t border-stone-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono animate-in slide-in-from-top-2 duration-200 bg-stone-900/90 p-4 rounded-xl border border-stone-700/80 shadow-2xl">
          {/* Left Column: Diagnostics */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-[11px]">
              <Cpu className="w-3.5 h-3.5" />
              <span>Director State & Pedagogical Diagnosis</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-stone-300">
              <div className="p-2 rounded bg-stone-950/70 border border-stone-800">
                <span className="text-stone-500 block">Active Scene:</span>
                <span className="text-amber-200 font-bold">{currentChallengeId}</span>
              </div>
              <div className="p-2 rounded bg-stone-950/70 border border-stone-800">
                <span className="text-stone-500 block">Active Archetype:</span>
                <span className="text-cyan-300 font-bold">{activeArchetype}</span>
              </div>
              <div className="p-2 rounded bg-stone-950/70 border border-stone-800">
                <span className="text-stone-500 block">Causal Inversions:</span>
                <span className="text-stone-200">{profile.errorPatterns.causalInversions}</span>
              </div>
              <div className="p-2 rounded bg-stone-950/70 border border-stone-800">
                <span className="text-stone-500 block">Temporal Reversals:</span>
                <span className="text-stone-200">{profile.errorPatterns.temporalReversals}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Demo Controls */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase text-[11px]">
              <Sliders className="w-3.5 h-3.5" />
              <span>Demo Controls: Simulate Learner Weakness</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  useLearnerStore.getState().applySyntheticProfile('PROFILE_CAUSAL');
                  const prof = useLearnerStore.getState().profile!;
                  const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                  useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                  useGameStore.getState().setWorld('arctic_station');
                }}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-rose-950 text-stone-200 hover:text-rose-200 border border-stone-700 hover:border-rose-500 text-[10px] transition-colors cursor-pointer"
                title="Causal weakness: routes to Arctic Boreas Investigation (Action Pattern: Evaluate & Inspect Evidence)"
              >
                ✦ Causal Weakness → Arctic Investigation
              </button>
              <button
                onClick={() => {
                  useLearnerStore.getState().applySyntheticProfile('PROFILE_SEQUENCE');
                  const prof = useLearnerStore.getState().profile!;
                  const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                  useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                  useGameStore.getState().setWorld('lost_observatory');
                }}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-amber-950 text-stone-200 hover:text-amber-200 border border-stone-700 hover:border-amber-500 text-[10px] transition-colors cursor-pointer"
                title="Sequencing weakness: routes to Observatory Timeline (Action Pattern: Arrange & Operate Mechanisms)"
              >
                ✦ Sequence Weakness → Observatory Timeline
              </button>
              <button
                onClick={() => {
                  useLearnerStore.getState().applySyntheticProfile('PROFILE_NEGATION');
                  const prof = useLearnerStore.getState().profile!;
                  const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                  useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                  jumpToAct(3);
                }}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-cyan-950 text-stone-200 hover:text-cyan-200 border border-stone-700 hover:border-cyan-500 text-[10px] transition-colors cursor-pointer"
                title="Negation weakness: routes to Power Junction Resource Allocation (Action Pattern: Allocate Under Exclusion)"
              >
                ✦ Negation Weakness → Route Exclusion
              </button>
            </div>

            <div className="pt-1.5 flex items-center gap-1.5 text-[10px] text-stone-400">
              <span>Jump Scene:</span>
              {[1, 2, 3, 4, 5, 6, 7].map((actNum) => (
                <button
                  key={actNum}
                  onClick={() => jumpToAct(actNum)}
                  className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                    currentAct === actNum
                      ? 'bg-amber-500 text-stone-950 font-bold border-amber-400'
                      : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                >
                  Act {actNum === 6 ? 'Transfer' : actNum}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
