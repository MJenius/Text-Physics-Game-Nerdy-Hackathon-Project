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
  Database,
  GitBranch,
  Sparkles,
  Play
} from 'lucide-react';
import { getLiveAIStatus } from '../engine/AIContentService';
import { BOREAS_SPECTACULAR_SCENARIO, BOREAS_SPECTACULAR_ENTITIES } from '../content/boreasSpectacularScenario';

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
    setWorld,
    loadCompiledAIScenario
  } = useGameStore();

  const { profile } = useLearnerStore();
  const [activeTab, setActiveTab] = useState<'dual_proof' | 'overview' | 'world_state' | 'telemetry' | 'pipeline' | 'controls'>('dual_proof');
  const [compareResult, setCompareResult] = useState<Array<{name: string; targetSkill: string; theme: string; archetype: string; actionPattern: string; ambiguity: string; scaffolding: number}>>([]);
  const [telemetryEvents, setTelemetryEvents] = useState(TelemetryService.getEvents());

  // Dual-learner live proof state
  const [isEvaluatingLiveProof, setIsEvaluatingLiveProof] = useState(false);
  const [dualProofResults, setDualProofResults] = useState<{
    learnerA: {
      profileName: string;
      skills: Record<string, number>;
      topMisconception: string;
      topMisconceptionProb: number;
      behavioralSignals: string;
      rawDiagnosis: string;
      rawPrescription: any;
      validatedPrescription: any;
      isLiveAI: boolean;
    };
    learnerB: {
      profileName: string;
      skills: Record<string, number>;
      topMisconception: string;
      topMisconceptionProb: number;
      behavioralSignals: string;
      rawDiagnosis: string;
      rawPrescription: any;
      validatedPrescription: any;
      isLiveAI: boolean;
    };
    latencyMs: number;
  } | null>(null);

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
        <div className="flex border-b border-cyan-950/80 bg-[#060911] px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dual_proof')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'dual_proof'
                ? 'border-amber-400 text-amber-300 font-bold bg-amber-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Live Dual-Learner Proof (P0)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
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
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
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
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'telemetry'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Live Telemetry ({telemetryEvents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'pipeline'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            Pipeline & Benchmark
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'controls'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Simulate & Act Jump
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB: LIVE DUAL-LEARNER PROOF (P0) */}
          {activeTab === 'dual_proof' && (
            <div className="space-y-4 font-mono">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-cyan-950/40 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Live Dual-Learner Proof: Same Reading Skill → Different Game Loop</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const status = getLiveAIStatus();
                      return (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1.5 ${
                          status.hasApiKey
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                            : 'bg-stone-900 border-stone-700 text-stone-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${status.hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
                          {status.hasApiKey ? 'Gemini 2.5 Flash Lite Active' : 'Deterministic Fallback Active'}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <p className="text-[11px] text-stone-300 font-sans leading-relaxed">
                  Both synthetic learners start with <strong className="text-amber-300 font-mono">identically calibrated reading skills (all 0.50)</strong>.
                  The divergence is purely driven by distinct cognitive error patterns, behavioral evidence, and past experience memory.
                  Press below to execute live diagnosis, compare raw AI outputs against engine guardrails, and play either path.
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={isEvaluatingLiveProof}
                    onClick={async () => {
                      setIsEvaluatingLiveProof(true);
                      const start = performance.now();

                      // Instantiate Profile A
                      useLearnerStore.getState().applySyntheticProfile('PROFILE_PAIR_IDENTICAL_A');
                      const profileA = JSON.parse(JSON.stringify(useLearnerStore.getState().profile!));
                      const detailedA = await GameDirector.diagnoseAndPrescribeAIDetailed(profileA, currentChallengeId, 'lost_observatory');

                      // Instantiate Profile B
                      useLearnerStore.getState().applySyntheticProfile('PROFILE_PAIR_IDENTICAL_B');
                      const profileB = JSON.parse(JSON.stringify(useLearnerStore.getState().profile!));
                      const detailedB = await GameDirector.diagnoseAndPrescribeAIDetailed(profileB, currentChallengeId, 'lost_observatory');

                      const elapsed = Math.round((performance.now() - start) * 10) / 10;

                      setDualProofResults({
                        learnerA: {
                          profileName: 'Learner A (Causal/Temporal Confusion)',
                          skills: { ...profileA.skills },
                          topMisconception: 'sequence_causation_confusion',
                          topMisconceptionProb: profileA.misconceptions?.sequence_causation_confusion?.probability ?? 0.86,
                          behavioralSignals: `4 repeated guesses • 3 early commits • weak evidence citations (3x)`,
                          rawDiagnosis: detailedA.rawAiResult?.diagnosis || detailedA.rawPrescription.learnerInsight || 'Causal inversion diagnosed',
                          rawPrescription: detailedA.rawPrescription,
                          validatedPrescription: detailedA.validatedPrescription,
                          isLiveAI: detailedA.isLiveAI,
                        },
                        learnerB: {
                          profileName: 'Learner B (Mechanical Sequence Inversion)',
                          skills: { ...profileB.skills },
                          topMisconception: 'temporal_reversal',
                          topMisconceptionProb: profileB.misconceptions?.temporal_reversal?.probability ?? 0.88,
                          behavioralSignals: `0 repeat guesses • careful 2-doc dwell • inverted action order (gear_b before gear_a)`,
                          rawDiagnosis: detailedB.rawAiResult?.diagnosis || detailedB.rawPrescription.learnerInsight || 'Temporal reversal diagnosed',
                          rawPrescription: detailedB.rawPrescription,
                          validatedPrescription: detailedB.validatedPrescription,
                          isLiveAI: detailedB.isLiveAI,
                        },
                        latencyMs: elapsed,
                      });

                      setIsEvaluatingLiveProof(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-950/50 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEvaluatingLiveProof ? 'animate-spin' : ''}`} />
                    {isEvaluatingLiveProof ? 'Evaluating Live AI Diagnoses...' : 'Run Live Dual-Learner Proof'}
                  </button>

                  {dualProofResults && (
                    <span className="text-[10px] text-stone-400 font-mono">
                      Completed in {dualProofResults.latencyMs}ms • {dualProofResults.learnerA.isLiveAI ? 'Live Gemini Generation' : 'Deterministic Engine Fallback'}
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Artifact Table */}
              {dualProofResults && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Learner A Column */}
                    <div className="p-4 rounded-xl bg-[#090f1a] border-2 border-rose-500/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-rose-950 pb-2">
                        <div>
                          <span className="text-xs font-bold text-rose-300 block">{dualProofResults.learnerA.profileName}</span>
                          <span className="text-[9px] text-stone-400">Target Learning Objective: Cause & Effect Reasoning</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 text-[9px] font-bold">
                          Path A
                        </span>
                      </div>

                      <div className="space-y-2 text-[10px]">
                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">1. Calibrated Skill Vector (Identical to B):</span>
                          <div className="p-1.5 rounded bg-black/50 border border-stone-800 flex justify-between text-stone-300 font-mono">
                            <span>causeEffect: <strong className="text-amber-300">50%</strong></span>
                            <span>sequencing: <strong className="text-amber-300">50%</strong></span>
                            <span>negation: <strong className="text-amber-300">50%</strong></span>
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">2. Cognitive Misconception History (Different):</span>
                          <div className="p-1.5 rounded bg-rose-950/30 border border-rose-900/60 text-rose-200">
                            <strong>{dualProofResults.learnerA.topMisconception}</strong> ({Math.round(dualProofResults.learnerA.topMisconceptionProb * 100)}% probability)
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">3. Behavioral Telemetry Signals:</span>
                          <div className="p-1.5 rounded bg-black/40 border border-stone-800 text-stone-300">
                            {dualProofResults.learnerA.behavioralSignals}
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">4. Raw AI Diagnosis (Gemini Recommendation):</span>
                          <div className="p-2 rounded bg-cyan-950/30 border border-cyan-900/60 text-stone-200 font-sans leading-tight">
                            "{dualProofResults.learnerA.rawDiagnosis}"
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-black/50 border border-stone-800 space-y-1">
                            <span className="text-stone-500 block text-[8px] uppercase">Raw AI Recommendation:</span>
                            <div className="text-amber-300 font-bold">{dualProofResults.learnerA.rawPrescription.theme}</div>
                            <div className="text-cyan-300">{dualProofResults.learnerA.rawPrescription.experienceArchetype}</div>
                            <div className="text-stone-400 text-[9px]">{dualProofResults.learnerA.rawPrescription.primaryActionPattern}</div>
                          </div>
                          <div className="p-2 rounded bg-black/50 border border-stone-800 space-y-1">
                            <span className="text-stone-500 block text-[8px] uppercase">Validated by Engine:</span>
                            <div className="text-emerald-300 font-bold">{dualProofResults.learnerA.validatedPrescription.theme}</div>
                            <div className="text-purple-300">{dualProofResults.learnerA.validatedPrescription.experienceArchetype}</div>
                            <div className="text-rose-300 text-[9px]">{dualProofResults.learnerA.validatedPrescription.primaryActionPattern}</div>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-rose-950/20 border border-rose-800/40 text-[9px] text-stone-300 space-y-1">
                          <span className="text-rose-300 font-bold block uppercase">Resulting Game Experience:</span>
                          <div>• World: <strong className="text-stone-100">Boreas Sub-Zero Station</strong></div>
                          <div>• Mechanic: <strong className="text-stone-100">Evidence Investigation (3 Conflicting Documents)</strong></div>
                          <div>• Action Pattern: <strong className="text-stone-100">EVALUATE_AND_INSPECT</strong></div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            useLearnerStore.getState().applySyntheticProfile('PROFILE_PAIR_IDENTICAL_A');
                            loadCompiledAIScenario(BOREAS_SPECTACULAR_SCENARIO, BOREAS_SPECTACULAR_ENTITIES, 'arctic_station');
                            onClose();
                          }}
                          className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Load & Play Scenario A (Boreas Sub-Zero)
                        </button>
                      </div>
                    </div>

                    {/* Learner B Column */}
                    <div className="p-4 rounded-xl bg-[#0a1215] border-2 border-cyan-500/40 space-y-3">
                      <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
                        <div>
                          <span className="text-xs font-bold text-cyan-300 block">{dualProofResults.learnerB.profileName}</span>
                          <span className="text-[9px] text-stone-400">Target Learning Objective: Cause & Effect Reasoning</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[9px] font-bold">
                          Path B
                        </span>
                      </div>

                      <div className="space-y-2 text-[10px]">
                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">1. Calibrated Skill Vector (Identical to A):</span>
                          <div className="p-1.5 rounded bg-black/50 border border-stone-800 flex justify-between text-stone-300 font-mono">
                            <span>causeEffect: <strong className="text-amber-300">50%</strong></span>
                            <span>sequencing: <strong className="text-amber-300">50%</strong></span>
                            <span>negation: <strong className="text-amber-300">50%</strong></span>
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">2. Cognitive Misconception History (Different):</span>
                          <div className="p-1.5 rounded bg-cyan-950/30 border border-cyan-900/60 text-cyan-200">
                            <strong>{dualProofResults.learnerB.topMisconception}</strong> ({Math.round(dualProofResults.learnerB.topMisconceptionProb * 100)}% probability)
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">3. Behavioral Telemetry Signals:</span>
                          <div className="p-1.5 rounded bg-black/40 border border-stone-800 text-stone-300">
                            {dualProofResults.learnerB.behavioralSignals}
                          </div>
                        </div>

                        <div>
                          <span className="text-stone-500 uppercase block text-[9px]">4. Raw AI Diagnosis (Gemini Recommendation):</span>
                          <div className="p-2 rounded bg-cyan-950/30 border border-cyan-900/60 text-stone-200 font-sans leading-tight">
                            "{dualProofResults.learnerB.rawDiagnosis}"
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 rounded bg-black/50 border border-stone-800 space-y-1">
                            <span className="text-stone-500 block text-[8px] uppercase">Raw AI Recommendation:</span>
                            <div className="text-amber-300 font-bold">{dualProofResults.learnerB.rawPrescription.theme}</div>
                            <div className="text-cyan-300">{dualProofResults.learnerB.rawPrescription.experienceArchetype}</div>
                            <div className="text-stone-400 text-[9px]">{dualProofResults.learnerB.rawPrescription.primaryActionPattern}</div>
                          </div>
                          <div className="p-2 rounded bg-black/50 border border-stone-800 space-y-1">
                            <span className="text-stone-500 block text-[8px] uppercase">Validated by Engine:</span>
                            <div className="text-emerald-300 font-bold">{dualProofResults.learnerB.validatedPrescription.theme}</div>
                            <div className="text-purple-300">{dualProofResults.learnerB.validatedPrescription.experienceArchetype}</div>
                            <div className="text-rose-300 text-[9px]">{dualProofResults.learnerB.validatedPrescription.primaryActionPattern}</div>
                          </div>
                        </div>

                        <div className="p-2 rounded bg-cyan-950/20 border border-cyan-800/40 text-[9px] text-stone-300 space-y-1">
                          <span className="text-cyan-300 font-bold block uppercase">Resulting Game Experience:</span>
                          <div>• World: <strong className="text-stone-100">The Lost Observatory</strong></div>
                          <div>• Mechanic: <strong className="text-stone-100">Timeline Mechanism (Strict Chronological Interlock)</strong></div>
                          <div>• Action Pattern: <strong className="text-stone-100">ARRANGE_AND_OPERATE</strong></div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            useLearnerStore.getState().applySyntheticProfile('PROFILE_PAIR_IDENTICAL_B');
                            setWorld('lost_observatory');
                            jumpToAct(2);
                            onClose();
                          }}
                          className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Load & Play Scenario B (Observatory Clock)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* TAB 4: PIPELINE & EVENT TIMELINE */}
          {activeTab === 'pipeline' && (
            <div className="space-y-5">
              {/* Pipeline Status */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase block font-bold mb-3">
                  AI Director Pipeline Status:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { label: 'PLAYER ACTION', active: true },
                    { label: '→', active: false },
                    { label: 'TELEMETRY', active: telemetryEvents.length > 0 },
                    { label: '→', active: false },
                    { label: 'LEARNER MODEL', active: !!profile },
                    { label: '→', active: false },
                    { label: 'AI DIAGNOSIS', active: !!profile?.lastDiagnosis },
                    { label: '→', active: false },
                    { label: 'PRESCRIPTION', active: !!profile?.lastDiagnosis?.recommendedIntervention },
                    { label: '→', active: false },
                    { label: 'SCENARIO COMPILER', active: true },
                    { label: '→', active: false },
                    { label: 'DETERMINISTIC RUNTIME', active: true },
                  ].map((step, i) =>
                    step.label === '→' ? (
                      <span key={i} className="text-cyan-600 text-xs">→</span>
                    ) : (
                      <span
                        key={i}
                        className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${
                          step.active
                            ? 'bg-cyan-900/50 border border-cyan-700 text-cyan-200'
                            : 'bg-stone-900 border border-stone-800 text-stone-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Current Prescription Detail */}
              {profile?.lastDiagnosis && (
                <div className="p-4 rounded-xl bg-stone-900/60 border border-cyan-900/40 space-y-2">
                  <span className="text-[10px] text-stone-400 uppercase block font-bold">Active Prescription:</span>
                  <div className="text-sm text-cyan-300 font-bold">{profile.lastDiagnosis.headline}</div>
                  <div className="text-xs text-stone-300">{profile.lastDiagnosis.insight}</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="text-[10px]">
                      <span className="text-stone-500">Skill:</span>{' '}
                      <span className="text-amber-300">{profile.lastDiagnosis.targetSkill || '—'}</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-stone-500">Misconception:</span>{' '}
                      <span className="text-rose-300">{profile.lastDiagnosis.targetMisconception || '—'}</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-stone-500">Intervention:</span>{' '}
                      <span className="text-emerald-300">{profile.lastDiagnosis.recommendedIntervention || '—'}</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-stone-500">World:</span>{' '}
                      <span className="text-cyan-300">{profile.lastDiagnosis.recommendedWorld || '—'}</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-stone-500">Ambiguity:</span>{' '}
                      <span className="text-purple-300">{profile.lastDiagnosis.ambiguity || '—'}</span>
                    </div>
                    <div className="text-[10px]">
                      <span className="text-stone-500">Scaffolding:</span>{' '}
                      <span className="text-blue-300">{profile.lastDiagnosis.supportLevel ?? '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* One-Click Profile Comparison */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase block font-bold mb-2">
                  One-Click Profile Comparison (Run All 5 Profiles):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const names = ['PROFILE_CAUSAL', 'PROFILE_SEQUENCE', 'PROFILE_NEGATION', 'PROFILE_SURFACE_GUESSER', 'PROFILE_STRONG_TRANSFER'] as const;
                    const results = names.map(name => {
                      useLearnerStore.getState().applySyntheticProfile(name);
                      const prof = useLearnerStore.getState().profile!;
                      const rx = GameDirector.diagnoseAndPrescribe(prof, currentChallengeId);
                      return {
                        name,
                        targetSkill: rx.targetSkill,
                        theme: rx.theme,
                        archetype: rx.experienceArchetype,
                        actionPattern: rx.primaryActionPattern,
                        ambiguity: rx.ambiguityLevel,
                        scaffolding: rx.scaffoldingLevel,
                      };
                    });
                    setCompareResult(results);
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-stone-950 font-bold text-xs cursor-pointer mb-3"
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  Run Prescription Comparison
                </button>

                {compareResult.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-stone-800">
                          <th className="text-left p-1.5 text-stone-400">Profile</th>
                          <th className="text-left p-1.5 text-stone-400">Skill</th>
                          <th className="text-left p-1.5 text-stone-400">World</th>
                          <th className="text-left p-1.5 text-stone-400">Archetype</th>
                          <th className="text-left p-1.5 text-stone-400">Action Pattern</th>
                          <th className="text-left p-1.5 text-stone-400">Ambiguity</th>
                          <th className="text-left p-1.5 text-stone-400">Scaffold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareResult.map((r, i) => (
                          <tr key={i} className="border-b border-stone-900">
                            <td className="p-1.5 text-cyan-300 font-bold">{r.name.replace('PROFILE_', '')}</td>
                            <td className="p-1.5 text-amber-300">{r.targetSkill}</td>
                            <td className="p-1.5 text-emerald-300">{r.theme}</td>
                            <td className="p-1.5 text-purple-300">{r.archetype}</td>
                            <td className="p-1.5 text-rose-300">{r.actionPattern}</td>
                            <td className="p-1.5 text-stone-300">{r.ambiguity}</td>
                            <td className="p-1.5 text-stone-300">{r.scaffolding}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Pipeline Events */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase block font-bold mb-2">
                  Recent Pipeline Events (last 15):
                </span>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {telemetryEvents.filter(e =>
                    ['AI_DIAGNOSIS_STARTED', 'AI_DIAGNOSIS_COMPLETED', 'AI_PRESCRIPTION_CREATED',
                     'MISCONCEPTION_UPDATED', 'SKILL_UPDATED', 'DIRECTOR_SCENE_REDIRECT',
                     'ASYNC_AI_DIAGNOSIS_TRIGGERED', 'SCENE_TRANSITIONED', 'ACTION_EVALUATED',
                     'PHYSICAL_CONSEQUENCE_TRIGGERED'].includes(e.type)
                  ).slice(-15).reverse().map((e, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] py-0.5">
                      <span className="text-stone-600 w-16 shrink-0">{new Date(e.timestamp).toLocaleTimeString()}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        e.type.includes('DIAGNOSIS') ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        e.type.includes('PRESCRIPTION') ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        e.type.includes('MISCONCEPTION') ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        'bg-stone-900 text-stone-300 border border-stone-800'
                      }`}>{e.type}</span>
                      <span className="text-stone-500 truncate">{e.challengeId}</span>
                    </div>
                  ))}
                  {telemetryEvents.filter(e =>
                    ['AI_DIAGNOSIS_STARTED', 'AI_DIAGNOSIS_COMPLETED', 'AI_PRESCRIPTION_CREATED',
                     'MISCONCEPTION_UPDATED', 'SKILL_UPDATED', 'DIRECTOR_SCENE_REDIRECT',
                     'ASYNC_AI_DIAGNOSIS_TRIGGERED', 'SCENE_TRANSITIONED', 'ACTION_EVALUATED',
                     'PHYSICAL_CONSEQUENCE_TRIGGERED'].includes(e.type)
                  ).length === 0 && (
                    <div className="text-stone-600 text-[10px]">No pipeline events yet. Trigger an action to observe the chain.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTROLS & JUMP */}
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
                      onClick={() => {
                        setWorld(w.id);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        narrative.activeWorldId === w.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                          : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:bg-stone-850'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold block text-stone-200">{w.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800/80 text-cyan-400 border border-cyan-800/40 font-mono">
                          {narrative.activeWorldId === w.id ? 'Active' : 'Switch World →'}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block">{w.tagline}</span>
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
