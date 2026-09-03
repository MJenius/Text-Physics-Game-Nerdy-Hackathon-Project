import React, { useState, useEffect } from 'react';
import { useGameStore } from '../engine/GameStore';
import { useLearnerStore } from '../engine/LearnerStore';
import { TelemetryService } from '../engine/Telemetry';
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
    setWorld,
    simulateWeaknessProfile
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
                      Current AI Director Diagnosis:
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
                  </div>

                  {/* Skills Grid */}
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block mb-1.5">
                      Learner Skill Vector:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(profile.skills).map(([skill, val]) => (
                        <div key={skill} className="p-2 rounded bg-stone-900 border border-stone-800 flex justify-between">
                          <span className="text-stone-400 capitalize">{skill.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className="text-cyan-300 font-bold">{Math.round((val as number) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error Patterns */}
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase block mb-1.5">
                      Detected Cognitive Error Frequencies:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(profile.errorPatterns).map(([err, count]) => (
                        <div key={err} className="p-2 rounded bg-stone-900 border border-stone-800 flex justify-between">
                          <span className="text-stone-400 capitalize">{err.replace(/([A-Z])/g, ' $1')}:</span>
                          <span className={`${(count as number) > 0 ? 'text-rose-400 font-bold' : 'text-stone-500'}`}>
                            {count as number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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

              {/* Weakness Simulator */}
              <div>
                <span className="text-[10px] text-stone-400 uppercase block font-bold mb-2">
                  Simulate Cognitive Weakness Pattern:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => simulateWeaknessProfile('causal_inversion')}
                    className="px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 hover:border-amber-400 text-stone-300 text-xs cursor-pointer"
                  >
                    Inject Causal Inversion
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateWeaknessProfile('temporal_reversal')}
                    className="px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 hover:border-amber-400 text-stone-300 text-xs cursor-pointer"
                  >
                    Inject Temporal Reversal
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateWeaknessProfile('ignored_negation')}
                    className="px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 hover:border-amber-400 text-stone-300 text-xs cursor-pointer"
                  >
                    Inject Ignored Negation
                  </button>
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
