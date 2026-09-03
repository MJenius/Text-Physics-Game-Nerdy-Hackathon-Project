import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { challenge1 } from '../content/challenge1';
import { BookOpen, RefreshCw, Sparkles } from 'lucide-react';

export const ReadingPanel: React.FC = () => {
  const { rereadCount, recordReread, lastFeedback } = useGameStore();
  const passage = challenge1.passage;

  const isFeedbackFailure = lastFeedback.type === 'failure';

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 p-6 backdrop-blur-md shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2 text-amber-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest font-mono font-semibold">
            Field Journal & Discovery Log
          </span>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
          Stage 1 / 1 (Spike)
        </span>
      </div>

      {/* Entry Title & Source */}
      <div className="mb-4">
        <h2 className="text-xl font-serif font-bold text-amber-200/90 tracking-wide">
          {passage.heading}
        </h2>
        <p className="text-xs text-slate-400 italic mt-1 font-serif">
          {passage.source}
        </p>
      </div>

      {/* Passage Content */}
      <div
        className={`relative p-5 rounded-xl border transition-all duration-300 ${
          isFeedbackFailure
            ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
            : 'bg-slate-950/40 border-slate-800/70'
        }`}
      >
        <div className="space-y-3.5 text-slate-200 text-sm leading-relaxed font-serif">
          {passage.paragraphs.map((p, idx) => (
            <p key={idx} className="tracking-wide">
              {p}
            </p>
          ))}
        </div>

        {isFeedbackFailure && (
          <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center gap-2 text-xs text-amber-300 font-sans">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>Notice what the journal says about which key fits each lock.</span>
          </div>
        )}
      </div>

      {/* Reread / Focus Nudge */}
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800/60">
        <button
          onClick={recordReread}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-amber-300 border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Review Passage Notes
        </button>

        {rereadCount > 0 && (
          <span className="text-[11px] text-slate-500 font-mono">
            Reread: {rereadCount}x
          </span>
        )}
      </div>

      {/* Skill Objective Hint Card */}
      <div className="mt-auto pt-6">
        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-900/40 text-xs text-cyan-200/80">
          <span className="font-semibold text-cyan-300 block mb-1 uppercase tracking-wider text-[10px]">
            Target Reading Skill: Literal Retrieval
          </span>
          Read carefully to extract the exact pairing between key color/material and the corresponding lock mechanism.
        </div>
      </div>
    </div>
  );
};
