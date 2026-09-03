import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { BookOpen, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';

export const ReadingPanel: React.FC = () => {
  const {
    currentChallenge,
    currentChallengeIndex,
    rereadCount,
    recordReread,
    lastFeedback
  } = useGameStore();

  const passage = currentChallenge.passage;
  const isFeedbackFailure = lastFeedback.type === 'failure';

  const skillLabels: Record<string, string> = {
    literal_retrieval: 'Literal Retrieval',
    sequencing: 'Procedural Sequencing',
    cause_effect: 'Cause & Effect Reasoning',
    negative_constraint: 'Negative / Exclusion Constraint',
    multi_condition: 'Multi-Condition Integration',
    synthesis: 'Master Rule Synthesis'
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 p-6 backdrop-blur-md shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 text-amber-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest font-mono font-semibold">
            Field Journal & Discovery Log
          </span>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 font-semibold">
          Stage {currentChallengeIndex + 1} of 6
        </span>
      </div>

      {/* Entry Title & Source */}
      <div className="mb-4 shrink-0">
        <h2 className="text-xl font-serif font-bold text-amber-200/95 tracking-wide">
          {passage.heading}
        </h2>
        <p className="text-xs text-slate-400 italic mt-1 font-serif">
          {passage.source}
        </p>
      </div>

      {/* Passage Content Card */}
      <div
        className={`relative p-5 rounded-xl border transition-all duration-300 ${
          isFeedbackFailure
            ? 'bg-amber-950/25 border-amber-500/50 shadow-[0_0_24px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
            : 'bg-slate-950/45 border-slate-800/80'
        }`}
      >
        <div className="space-y-3.5 text-slate-200 text-sm leading-relaxed font-serif">
          {passage.paragraphs.map((p, idx) => (
            <p key={idx} className="tracking-wide">
              {p}
            </p>
          ))}
        </div>

        {/* Dynamic Clue Prompt on Failure */}
        {isFeedbackFailure && (
          <div className="mt-4 pt-3.5 border-t border-amber-500/25 flex items-start gap-2 text-xs text-amber-300 font-sans animate-in fade-in">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0 mt-0.5" />
            <span className="leading-snug">
              Notice the key rule in the text: consult the highlighted conditions before repeating your interaction.
            </span>
          </div>
        )}
      </div>

      {/* Reread / Focus Nudge */}
      <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800/60 shrink-0">
        <button
          onClick={recordReread}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 hover:text-amber-300 border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Review Passage Notes
        </button>

        {rereadCount > 0 && (
          <span className="text-[11px] text-slate-400 font-mono">
            Rereads consulted: {rereadCount}
          </span>
        )}
      </div>

      {/* Target Reading Skill Card */}
      <div className="mt-auto pt-6 shrink-0">
        <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-900/45 text-xs text-cyan-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[10px] font-mono">
              Target Reading Skill
            </span>
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-medium text-slate-200 mb-1">
            {skillLabels[currentChallenge.targetReadingSkill] || currentChallenge.targetReadingSkill}
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            The game world operates on deterministic laws directly encoded in this passage. No external guessing is needed.
          </p>
        </div>
      </div>
    </div>
  );
};
