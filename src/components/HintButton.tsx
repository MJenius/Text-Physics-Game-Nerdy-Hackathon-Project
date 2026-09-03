import React from 'react';
import { useLearnerStore } from '../engine/LearnerStore';
import { ALL_SCHEMAS } from '../content/challengeSchemas';
import { getHint, getGeneralHint, inferFailureCondition } from '../engine/HintService';
import { Lightbulb, ChevronRight, HelpCircle } from 'lucide-react';

interface HintButtonProps {
  challengeId: string;
  lastAction?: {
    type: string;
    targetId: string;
    sourceId?: string;
  } | null;
  hasFailedAttempt: boolean;
}

export const HintButton: React.FC<HintButtonProps> = ({
  challengeId,
  lastAction,
  hasFailedAttempt,
}) => {
  const { getHintLevel, incrementHint } = useLearnerStore();
  const currentHintIndex = getHintLevel(challengeId);
  const schema = ALL_SCHEMAS[challengeId];

  // If no schema available for this challenge, don't show
  if (!schema) return null;

  // Determine failure condition if user failed
  const failureCondition = lastAction
    ? inferFailureCondition(challengeId, lastAction.type, lastAction.targetId, lastAction.sourceId)
    : 'general';

  // Active revealed hint
  const activeHint = currentHintIndex > 0
    ? (getHint(schema, failureCondition, currentHintIndex - 1) ||
       getGeneralHint(schema, currentHintIndex - 1))
    : null;

  const handleRequestHint = () => {
    incrementHint(challengeId);
  };

  const levelLabels = ['Point to Evidence', 'Restate Relationship', 'Guided Action'];

  return (
    <div className="mt-4 pt-3 border-t border-slate-800/80">
      {/* Revealed Hint Card */}
      {activeHint && (
        <div className="mb-3 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)] animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-amber-400 font-mono font-semibold text-[11px]">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Grounded Hint (Level {currentHintIndex} of 3)</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 border border-amber-700/50 text-amber-300">
              {levelLabels[currentHintIndex - 1]}
            </span>
          </div>
          <p className="text-slate-200 font-serif leading-relaxed text-xs">
            {activeHint}
          </p>
        </div>
      )}

      {/* Action Row */}
      <div className="flex items-center justify-between">
        {currentHintIndex < 3 ? (
          <button
            onClick={handleRequestHint}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              hasFailedAttempt
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {currentHintIndex === 0 ? 'Need a hint?' : `Get deeper hint (${currentHintIndex + 1}/3)`}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        ) : (
          <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Maximum hints revealed (3/3)
          </span>
        )}

        <span className="text-[10px] text-slate-500 font-mono">
          Hints are grounded in text facts
        </span>
      </div>
    </div>
  );
};
