import React, { useState } from 'react';
import { FileText, Search, Bookmark } from 'lucide-react';
import { SoundFX } from '../../engine/SoundFX';
import type { StoryDocument } from '../../types/game';

interface InvestigationArchetypeProps {
  title: string;
  documents: StoryDocument[];
  hypotheses: Array<{
    id: string;
    label: string;
    description: string;
    supportingDocIds: string[];
  }>;
  onSelectHypothesis: (hypothesisId: string, pinnedClues: string[]) => void;
  disabled?: boolean;
}

export const InvestigationArchetype: React.FC<InvestigationArchetypeProps> = ({
  title,
  documents,
  hypotheses,
  onSelectHypothesis,
  disabled = false,
}) => {
  const [activeDocIndex, setActiveDocIndex] = useState<number>(0);
  const [pinnedClues, setPinnedClues] = useState<string[]>([]);
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string | null>(null);

  const activeDoc = documents[activeDocIndex] || documents[0];

  const handleToggleClue = (clue: string) => {
    if (disabled) return;
    SoundFX.playClick();
    setPinnedClues((prev) =>
      prev.includes(clue) ? prev.filter((c) => c !== clue) : [...prev, clue]
    );
  };

  const handleCommitInterpretation = () => {
    if (!selectedHypothesisId || disabled) return;
    SoundFX.playLatch();
    onSelectHypothesis(selectedHypothesisId, pinnedClues);
  };

  return (
    <div className="w-full max-w-xl p-6 rounded-2xl border-4 border-stone-800 bg-[#0c1017] shadow-2xl font-serif text-stone-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-4">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
          <Search className="w-4 h-4" />
          <span>Forensic Investigation — {title}</span>
        </div>
        <span className="text-[10px] font-mono text-stone-400 uppercase bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          Multi-Source Cross-Examination
        </span>
      </div>

      {/* Document Selector Dossier Tabs */}
      <div className="flex items-center gap-1.5 pb-2 mb-4 border-b border-stone-800 overflow-x-auto">
        {documents.map((doc, idx) => (
          <button
            key={doc.id}
            type="button"
            onClick={() => {
              SoundFX.playClick();
              setActiveDocIndex(idx);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeDocIndex === idx
                ? 'bg-amber-950/60 border-amber-500 text-amber-200 font-bold shadow-sm'
                : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>{doc.title}</span>
          </button>
        ))}
      </div>

      {/* Active Document Viewport */}
      <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 max-h-48 overflow-y-auto mb-4 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 border-b border-stone-900 pb-1">
          <span>Source: {activeDoc.source}</span>
          {activeDoc.dateOrStamp && <span>{activeDoc.dateOrStamp}</span>}
        </div>

        {activeDoc.paragraphs.map((p, pIdx) => (
          <p key={pIdx} className="text-xs text-stone-300 leading-relaxed font-serif">
            {p}
          </p>
        ))}

        {/* Highlightable Key Clues in Active Document */}
        {activeDoc.keyClues && activeDoc.keyClues.length > 0 && (
          <div className="pt-2 border-t border-stone-900 mt-2">
            <span className="text-[10px] font-mono text-stone-500 uppercase block mb-1">
              Pin Significant Clues to Notebook:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeDoc.keyClues.map((clue, cIdx) => {
                const isPinned = pinnedClues.includes(clue);
                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleToggleClue(clue)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer flex items-center gap-1 ${
                      isPinned
                        ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold shadow-sm'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <Bookmark className="w-2.5 h-2.5" />
                    <span>{clue}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Competing Interpretations / Hypotheses */}
      <div className="space-y-2 mb-5">
        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
          Select Your Deductive Interpretation:
        </span>

        <div className="grid gap-2">
          {hypotheses.map((hypo) => {
            const isSelected = selectedHypothesisId === hypo.id;
            return (
              <button
                key={hypo.id}
                type="button"
                onClick={() => {
                  SoundFX.playClick();
                  setSelectedHypothesisId(hypo.id);
                }}
                disabled={disabled}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-stone-900/80 border-stone-700/80 hover:border-amber-400/60 text-stone-300 hover:bg-stone-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-serif">
                    {hypo.label}
                  </span>
                  <div className="w-4 h-4 rounded-full border border-stone-600 flex items-center justify-center">
                    {isSelected && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                  </div>
                </div>
                <p className="text-[11px] font-sans text-stone-400 leading-tight">
                  {hypo.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Commit Button */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={handleCommitInterpretation}
          disabled={disabled || !selectedHypothesisId}
          className="w-full py-3.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-mono text-xs font-bold uppercase tracking-widest transition-all shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-amber-400"
        >
          <Search className="w-4 h-4" />
          <span>Commit Investigative Deduction</span>
        </button>
      </div>
    </div>
  );
};
