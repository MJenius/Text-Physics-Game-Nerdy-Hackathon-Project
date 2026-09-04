import React, { useState, useEffect } from 'react';
import { useGameStore } from '../engine/GameStore';
import { useLearnerStore } from '../engine/LearnerStore';
import { TelemetryService } from '../engine/Telemetry';
import { GameDirector } from '../engine/GameDirector';
import { WORLD_REGISTRY } from '../worlds/worldRegistry';
import {
  Terminal,
  X,
  Activity,
  Cpu,
  RefreshCw,
  Zap,
  Database
} from 'lucide-react';

interface DirectorInspectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectorInspector: React.FC<DirectorInspectorProps> = ({ isOpen, onClose }) => {
  const {
    currentChallengeId,
    currentChallenge,
    activeArchetype,
    narrative,
    flags,
    jumpToAct,
    setWorld
  } = useGameStore();

  const { profile } = useLearnerStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'world_state' | 'telemetry' | 'controls'>('overview');
  const [telemetryEvents, setTelemetryEvents] = useState(TelemetryService.getEvents());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTelemetryEvents([...TelemetryService.getEvents()]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const worldsList = Object.values(WORLD_REGISTRY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#090d16] border-2 border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col max-h-[90vh] overflow-hidden text-stone-200 font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-cyan-950 bg-[#060a12]">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Terminal className="w-4 h-4" />
            <span className="font-bold uppercase tracking-wider text-xs">
              Director Inspector & Cognitive Debug Terminal [Developer Mode]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] text-cyan-300">
              Active Scene: {currentChallengeId}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-stone-400 hover:text-cyan-300 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-950/80 bg-[#060911] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Diagnosis & Cognitive Model
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('world_state')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'world_state'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            World State & Flags
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Live Telemetry Stream ({telemetryEvents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'controls'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Simulation & Act Jumper
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block">Active Archetype:</span>
                  <span className="text-sm font-bold text-cyan-300">{activeArchetype}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block">Target Skill:</span>
                  <span className="text-sm font-bold text-amber-300">{currentChallenge.targetReadingSkill}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 space-y-1">
                  <span className="text-[10px] text-stone-400 uppercase block">Active World:</span>
                  <span className="text-sm font-bold text-emerald-300 capitalize">{narrative.activeWorldId.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Learner Diagnosis Box */}
              {profile && (
                <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-700/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 uppercase tracking-wider">
                      Current AI Director Diagnosis & Prescription:
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Profile: {profile.audience} • {profile.readingDifficulty}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-black/40 border border-cyan-900/60 space-y-1">
                    <div className="text-xs font-bold text-amber-300">
                      {profile.lastDiagnosis?.headline || 'World Attuned'}
                    </div>
                    <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                      {profile.lastDiagnosis?.insight || 'Observatory mechanisms responding deterministically to learner dwell and reading inferences.'}
                    </p>
                    {profile.lastDiagnosis?.targetSkill && (
                      <div className="pt-1.5 flex flex-wrap gap-2 text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300">
                          Target Skill: {profile.lastDiagnosis.targetSkill}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                          Prescribed Intervention: {profile.lastDiagnosis.recommendedIntervention}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                          Prescribed World: {profile.lastDiagnosis.recommendedWorld}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-300">
                          Ambiguity: {profile.lastDiagnosis.ambiguity} • Scaffold: L{profile.lastDiagnosis.supportLevel ?? 1}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 8 Skills Grid with Confidence and Trend */}
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block mb-1.5 font-bold">
                      Learner Skill Vector (8 Skills with Confidence & Trend):
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(profile.skills).map(([skill, val]) => {
                        const detail = profile.skillDetails?.[skill as import('../types/learner').ReadingSkill];
                        const conf = profile.skillConfidence?.[skill as import('../types/learner').ReadingSkill] ?? 0.3;
                        return (
                          <div key={skill} className="p-2 rounded bg-stone-900 border border-stone-800 space-y-0.5">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-stone-400 capitalize truncate">{skill.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-cyan-300 font-bold">{Math.round((val as number) * 100)}%</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] text-stone-500">
                              <span>Conf: {Math.round(conf * 100)}%</span>
                              <span className={detail?.trend === 'improving' ? 'text-emerald-400' : detail?.trend === 'declining' ? 'text-rose-400' : 'text-stone-400'}>
                                {detail?.trend || 'stable'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 10 Misconceptions Tracked */}
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block mb-1.5 font-bold">
                      Tracked Cognitive Misconceptions (Accumulated Evidence Probabilities):
                    </span>
                    <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                      {profile.misconceptions &&
                        Object.entries(profile.misconceptions).map(([misc, detail]) => (
                          <div key={misc} className="p-2 rounded bg-stone-900 border border-stone-800 flex justify-between items-center">
                            <div className="truncate pr-2">
                              <span className="text-stone-300 text-[10px] block capitalize">{misc.replace(/_/g, ' ')}</span>
                              <span className="text-[9px] text-stone-500">Observed {detail.evidenceCount}x</span>
                            </div>
                            <span className={`font-bold text-[11px] ${detail.probability >= 0.5 ? 'text-rose-400' : detail.probability >= 0.25 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {Math.round(detail.probability * 100)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Lucky Answer Discrimination Telemetry */}
                  {profile.behavioralLog?.luckyAnswerCounts && (
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase block mb-1.5 font-bold">
                        Lucky Answer Problem Discrimination Counts:
                      </span>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-800 text-emerald-300 flex justify-between">
                          <span>Verified Proof:</span>
                          <span className="font-bold">{profile.behavioralLog.luckyAnswerCounts.correct_answer_correct_evidence || 0}</span>
                        </div>
                        <div className="p-1.5 rounded bg-amber-950/40 border border-amber-800 text-amber-300 flex justify-between">
                          <span>Lucky Answers:</span>
                          <span className="font-bold">{profile.behavioralLog.luckyAnswerCounts.correct_answer_weak_evidence || 0}</span>
                        </div>
                        <div className="p-1.5 rounded bg-cyan-950/40 border border-cyan-800 text-cyan-300 flex justify-between">
                          <span>Transfer Success:</span>
                          <span className="font-bold">{profile.behavioralLog.luckyAnswerCounts.transfer_success || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WORLD STATE */}
          {activeTab === 'world_state' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] text-stone-400 uppercase block font-bold">
                  Persistent Narrative World State (JSON):
                </span>
                <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-cyan-200 overflow-x-auto max-h-72">
                  {JSON.stringify(narrative, null, 2)}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-stone-400 uppercase block font-bold">
                  Runtime Game Flags:
                </span>
                <pre className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-amber-200 overflow-x-auto">
                  {JSON.stringify(flags, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: TELEMETRY */}
          {activeTab === 'telemetry' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-400 uppercase font-bold">
                  Real-Time Telemetry Event Log:
                </span>
                <button
                  type="button"
                  onClick={() => setTelemetryEvents([...TelemetryService.getEvents()])}
                  className="px-2 py-1 rounded bg-stone-800 text-stone-300 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {telemetryEvents.slice().reverse().map((ev, idx) => (
                  <div key={idx} className="p-2 rounded bg-stone-950 border border-stone-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">{ev.type}</span>
                      <span className="text-stone-500">[{ev.challengeId}]</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-400">
                      {ev.data && <span>{JSON.stringify(ev.data)}</span>}
                      <span className="text-[10px] text-stone-600">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLS & JUMP */}
          {activeTab === 'controls' && (
            <div className="space-y-5">
              {/* Synthetic Learner Testing Profiles (Hackathon Showcase requirement 26) */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase block font-bold mb-2">
                  Synthetic Learner Profiles (Produces Measurably Different Prescriptions):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      useLearnerStore.getState().applySyntheticProfile('PROFILE_CAUSAL');
                      const prof = useLearnerStore.getState().profile!;
                      const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                      useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                    }}
                    className="p-2.5 rounded-xl border border-rose-800/60 bg-rose-950/30 hover:bg-rose-900/50 text-left transition-all cursor-pointer"
                  >
                    <span className="text-rose-300 font-bold block text-xs">PROFILE_CAUSAL</span>
                    <span className="text-[9px] text-stone-400">Weak causal reasoning → Prescribes Arctic Investigation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      useLearnerStore.getState().applySyntheticProfile('PROFILE_SEQUENCE');
                      const prof = useLearnerStore.getState().profile!;
                      const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                      useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                    }}
                    className="p-2.5 rounded-xl border border-amber-800/60 bg-amber-950/30 hover:bg-amber-900/50 text-left transition-all cursor-pointer"
                  >
                    <span className="text-amber-300 font-bold block text-xs">PROFILE_SEQUENCE</span>
                    <span className="text-[9px] text-stone-400">Weak sequencing → Prescribes Observatory Timeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      useLearnerStore.getState().applySyntheticProfile('PROFILE_NEGATION');
                      const prof = useLearnerStore.getState().profile!;
                      const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                      useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                    }}
                    className="p-2.5 rounded-xl border border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-900/50 text-left transition-all cursor-pointer"
                  >
                    <span className="text-cyan-300 font-bold block text-xs">PROFILE_NEGATION</span>
                    <span className="text-[9px] text-stone-400">Ignored negations → Prescribes Mutual Exclusion Resource</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      useLearnerStore.getState().applySyntheticProfile('PROFILE_SURFACE_GUESSER');
                      const prof = useLearnerStore.getState().profile!;
                      const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                      useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                    }}
                    className="p-2.5 rounded-xl border border-purple-800/60 bg-purple-950/30 hover:bg-purple-900/50 text-left transition-all cursor-pointer"
                  >
                    <span className="text-purple-300 font-bold block text-xs">PROFILE_SURFACE_GUESSER</span>
                    <span className="text-[9px] text-stone-400">Rapid clicks without dwell → Prescribes Structured Sorting</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      useLearnerStore.getState().applySyntheticProfile('PROFILE_STRONG_TRANSFER');
                      const prof = useLearnerStore.getState().profile!;
                      const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                      useLearnerStore.getState().setDirectorDiagnosis(rx.statusHeadline, rx.learnerInsight);
                    }}
                    className="p-2.5 rounded-xl border border-emerald-800/60 bg-emerald-950/30 hover:bg-emerald-900/50 text-left transition-all cursor-pointer"
                  >
                    <span className="text-emerald-300 font-bold block text-xs">PROFILE_STRONG_TRANSFER</span>
                    <span className="text-[9px] text-stone-400">Causal mastery achieved → Triggers Triton Hero Transfer</span>
                  </button>
                </div>
              </div>

              {/* Act Jumper */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase block font-bold mb-2">
                  Instant Act Jumper (100% Solvable Scene Sandbox):
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { act: 1, label: 'Act I: Arrival' },
                    { act: 2, label: 'Act II: Dead Clock' },
                    { act: 3, label: 'Act III: Power Junction' },
                    { act: 4, label: 'Act IV: Missing Engineer' },
                    { act: 5, label: 'Act V: Concourse' },
                    { act: 6, label: 'Act VI: Triton Transfer' },
                    { act: 7, label: 'Act VII: Dome Synthesis' }
                  ].map((item) => (
                    <button
                      key={item.act}
                      type="button"
                      onClick={() => {
                        jumpToAct(item.act);
                        onClose();
                      }}
                      className="p-2.5 rounded-xl border border-stone-700 bg-stone-900 hover:border-cyan-400 hover:bg-stone-850 text-left transition-all cursor-pointer"
                    >
                      <span className="text-cyan-400 font-bold block">{item.label}</span>
                      <span className="text-[10px] text-stone-500">Jump immediately</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* World Switcher */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase block font-bold mb-2">
                  Active World Atmosphere Switcher:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {worldsList.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWorld(w.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        narrative.activeWorldId === w.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                          : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="font-bold block text-stone-200">{w.name}</span>
                      <span className="text-[10px] text-stone-500">{w.tagline}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-cyan-950 bg-[#060a12] flex items-center justify-between text-[11px] text-stone-400">
          <span>Toggle with <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-cyan-300 border border-stone-700">~</kbd> key anytime</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-bold cursor-pointer"
          >
            Close Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
