import React, { useState } from 'react';
import { useGameStore } from '../engine/GameStore';
import {
  X,
  MapPin,
  Zap,
  Compass,
  Lightbulb,
  HelpCircle,
  Brain,
  AlertCircle,
  Eye
} from 'lucide-react';

export const NotebookModal: React.FC = () => {
  const { isNotebookOpen, closeNotebook, narrative, currentAct } = useGameStore();
  const [activeTab, setActiveTab] = useState<'observed' | 'hypotheses' | 'uncertain' | 'decisions' | 'map'>('observed');

  if (!isNotebookOpen) return null;

  const acts = [
    { act: 1, title: 'Arrival at Mount Caelum', location: 'Courtyard' },
    { act: 2, title: 'The Dead Clock Tower', location: 'Horological Tower' },
    { act: 3, title: 'Power Failure & Routing Junction', location: 'Dynamo Sub-Station' },
    { act: 4, title: 'The Missing Engineer', location: 'Machinist Quarters' },
    { act: 5, title: 'Consequence & Ascent Concourse', location: 'Relay Concourse' },
    { act: 6, title: 'Director Intervention / Hero Transfer', location: 'Adaptive Sub-Chamber' },
    { act: 7, title: 'Master Celestial Synthesis', location: 'Dome Rotunda' }
  ];

  const decisionsList = Object.entries(narrative.playerDecisions);
  const hypothesesList = narrative.hypotheses || [];
  const uncertaintiesList = narrative.uncertainties || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-600/40 shadow-[0_0_50px_rgba(217,119,6,0.15)] flex flex-col max-h-[85vh] overflow-hidden text-stone-200 font-serif">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide text-amber-200">
                Investigator’s Mental Model & Field Log
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Active synthesis of verified observations, current hypotheses, and unresolved uncertainties.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeNotebook}
            className="p-1.5 rounded-lg text-stone-400 hover:text-amber-200 hover:bg-stone-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-6 font-mono text-xs overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('observed')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'observed'
                ? 'border-amber-500 text-amber-300 font-semibold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Observed ({narrative.discoveredFacts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hypotheses')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'hypotheses'
                ? 'border-amber-500 text-amber-300 font-semibold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Your Interpretation ({hypothesesList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('uncertain')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'uncertain'
                ? 'border-amber-500 text-amber-300 font-semibold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Uncertain ({uncertaintiesList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('decisions')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'decisions'
                ? 'border-amber-500 text-amber-300 font-semibold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Decisions ({decisionsList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'map'
                ? 'border-amber-500 text-amber-300 font-semibold bg-amber-500/5'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Facility Map
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 1. OBSERVED FACTS */}
          {activeTab === 'observed' && (
            <div className="space-y-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                Verified World Truths Discovered Through Reading:
              </h3>
              {narrative.discoveredFacts.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-6 text-center">
                  No facts recorded yet. Read the field journals and examine mechanisms to log discoveries.
                </p>
              ) : (
                <div className="grid gap-2.5">
                  {narrative.discoveredFacts.map((fact, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-start gap-3 shadow-sm"
                    >
                      <span className="text-[11px] font-mono font-bold text-amber-500/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-700/30">
                        #{index + 1}
                      </span>
                      <p className="text-xs text-stone-200 leading-relaxed font-serif">
                        {fact}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. YOUR INTERPRETATION / HYPOTHESES */}
          {activeTab === 'hypotheses' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                  Working Hypotheses & Mental Inferences:
                </h3>
                <span className="text-[10px] font-mono text-stone-400">
                  Updated dynamically by your choices
                </span>
              </div>

              <div className="grid gap-3">
                {hypothesesList.map((hypo) => (
                  <div
                    key={hypo.id}
                    className="p-4 rounded-xl bg-stone-900/80 border border-amber-900/40 space-y-2 shadow"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-serif font-bold text-amber-200">
                        {hypo.title}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                          Confidence: <strong className="capitalize text-amber-300">{hypo.confidence}</strong>
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded uppercase font-bold ${
                            hypo.status === 'confirmed'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {hypo.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed font-serif">
                      “{hypo.statement}”
                    </p>

                    {hypo.supportingFacts && hypo.supportingFacts.length > 0 && (
                      <div className="pt-2 border-t border-stone-800/80 text-[10px] font-mono text-stone-400">
                        <span className="text-amber-400">Supporting Evidence: </span>
                        {hypo.supportingFacts.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. UNCERTAINTIES */}
          {activeTab === 'uncertain' && (
            <div className="space-y-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                Unresolved Questions & Conflicting Clues:
              </h3>
              <p className="text-xs text-stone-400 font-sans">
                These are ambiguities in the text that require further document cross-referencing or physical inspection.
              </p>

              <div className="grid gap-2.5">
                {uncertaintiesList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 flex items-start gap-3"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-300 font-serif leading-relaxed">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DECISION HISTORY */}
          {activeTab === 'decisions' && (
            <div className="space-y-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                Strategic Decisions & Narrative Ripple Effects:
              </h3>
              {decisionsList.length === 0 ? (
                <p className="text-xs text-stone-500 italic py-6 text-center">
                  No major branch decisions taken yet. Decisions occur at the end of Act I, Act III, etc.
                </p>
              ) : (
                <div className="grid gap-3">
                  {decisionsList.map(([key, record]) => (
                    <div
                      key={key}
                      className="p-4 rounded-xl bg-stone-900/80 border border-amber-900/40 space-y-2 shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-semibold text-amber-300 uppercase">
                          Act {record.act} Decision: {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
                          Choice: <strong className="text-amber-200 capitalize">{String(record.value)}</strong>
                        </span>
                      </div>
                      {record.rationale && (
                        <p className="text-xs text-stone-300 italic font-serif">
                          “{record.rationale}”
                        </p>
                      )}
                      <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] font-mono text-stone-400">
                        <span>Status: Permanently active in world state</span>
                        <span className="text-amber-400/80">Downstream effect registered</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. FACILITY MAP */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-400/90 font-semibold">
                Observatory Campaign Map & Progression:
              </h3>
              <div className="grid gap-2">
                {acts.map((item) => {
                  const isCurrent = item.act === currentAct;
                  const isCompleted = item.act < currentAct;

                  return (
                    <div
                      key={item.act}
                      className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                        isCurrent
                          ? 'bg-amber-950/30 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : isCompleted
                          ? 'bg-stone-900/40 border-stone-800 text-stone-400'
                          : 'bg-stone-950/30 border-stone-800/40 text-stone-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                            isCurrent
                              ? 'bg-amber-500 text-stone-950 ring-2 ring-amber-400/50'
                              : isCompleted
                              ? 'bg-stone-700 text-stone-200'
                              : 'bg-stone-800 text-stone-600'
                          }`}
                        >
                          {item.act}
                        </span>
                        <div>
                          <h4 className={`text-xs font-bold font-serif ${isCurrent ? 'text-amber-200' : ''}`}>
                            Act {item.act}: {item.title}
                          </h4>
                          <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-500" /> Sector: {item.location}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 border border-stone-800">
                        {isCurrent ? 'Active Scene' : isCompleted ? 'Completed' : 'Locked'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs font-mono text-stone-400">
          <span>Active Location: <strong className="text-amber-300 capitalize">{narrative.visitedLocations[narrative.visitedLocations.length - 1]}</strong></span>
          <button
            type="button"
            onClick={closeNotebook}
            className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono transition-colors cursor-pointer"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
};
