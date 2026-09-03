import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { useLearnerStore } from '../engine/LearnerStore';
import { HintButton } from './HintButton';
import { getPersonalizedRereadingPrompt } from '../engine/HintService';
import { SKILL_KEY_MAP } from '../types/learner';
import { BookOpen, RefreshCw, Sparkles, CheckCircle, Cpu, Loader2, Bookmark } from 'lucide-react';

export const ReadingPanel: React.FC = () => {
  const {
    currentChallenge,
    currentChallengeIndex,
    rereadCount,
    recordReread,
    lastFeedback,
    lastAction,
    failedAttempts,
    isPassageGenerating,
    isTransferModeActive,
  } = useGameStore();

  const { profile } = useLearnerStore();

  // Prefer adapted passage if available, else original passage
  const adapted = currentChallenge.adaptedPassage;
  const passageTitle = isTransferModeActive
    ? currentChallenge.passage.heading
    : (adapted?.title || currentChallenge.passage.heading);
  const passageSource = isTransferModeActive
    ? currentChallenge.passage.source
    : (adapted?.source || currentChallenge.passage.source);
  const paragraphs = isTransferModeActive
    ? currentChallenge.passage.paragraphs
    : (adapted?.paragraphs || currentChallenge.passage.paragraphs);
  const targetVocab = isTransferModeActive
    ? (currentChallenge.passage.keyClues || [])
    : (adapted?.targetVocabulary || currentChallenge.passage.keyClues || []);

  const isFeedbackFailure = lastFeedback.type === 'failure';
  const skillKey = SKILL_KEY_MAP[currentChallenge.targetReadingSkill] || 'literalRetrieval';
  const personalizedNudge = isTransferModeActive
    ? 'Notice the technical safety manual: flood the cooling coils before thermal ignition.'
    : (profile
        ? getPersonalizedRereadingPrompt(skillKey, profile.audience)
        : 'Notice the key rule in the text: consult the highlighted conditions before repeating your interaction.');

  const skillLabels: Record<string, string> = {
    literal_retrieval: 'Literal Retrieval',
    sequencing: 'Procedural Sequencing',
    cause_effect: 'Cause & Effect Reasoning',
    negative_constraint: 'Negative / Exclusion Constraint',
    multi_condition: 'Multi-Condition Integration',
    synthesis: 'Master Rule Synthesis'
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-r border-slate-800 p-6 backdrop-blur-md shadow-2xl overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 text-amber-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest font-mono font-semibold">
            {isTransferModeActive ? 'Triton-IV Technical Manual' : 'Field Journal & Discovery Log'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reading Level Badge */}
          {profile && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold capitalize flex items-center gap-1">
              {isPassageGenerating ? (
                <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
              ) : adapted?.isAIGenerated ? (
                <Cpu className="w-3 h-3 text-cyan-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              )}
              {profile.audience} • {profile.readingDifficulty}
              {profile.aiEnabled === false && <span className="text-slate-400 text-[9px]">(Fixed)</span>}
            </span>
          )}

          <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-semibold ${
            isTransferModeActive
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 animate-pulse'
              : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
          }`}>
            {isTransferModeActive ? 'Hero Transfer' : `Stage ${currentChallengeIndex + 1} of 6`}
          </span>
        </div>
      </div>

      {/* Main Content (Always visible with instant zero-flicker preview) */}
      <>
        {/* Entry Title & Source */}
        <div className="mb-4 shrink-0 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-amber-200/95 tracking-wide">
              {passageTitle}
            </h2>
            <p className="text-xs text-slate-400 italic mt-1 font-serif">
              {passageSource}
            </p>
          </div>
          {isPassageGenerating && (
            <span className="text-[10px] font-mono text-amber-300/80 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded animate-pulse shrink-0 flex items-center gap-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> AI Calibrating...
            </span>
          )}
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
              {paragraphs.map((p, idx) => (
                <p key={idx} className="tracking-wide">
                  {p}
                </p>
              ))}
            </div>

            {/* Target Vocabulary / Key Clues chips */}
            {targetVocab.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 mr-1 flex items-center gap-1">
                  <Bookmark className="w-3 h-3 text-amber-400" /> Focus terms:
                </span>
                {targetVocab.map((term, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-amber-200/90 border border-slate-700/80"
                  >
                    {term}
                  </span>
                ))}
              </div>
            )}

            {/* Dynamic Clue Prompt on Failure (Personalized) */}
            {isFeedbackFailure && (
              <div className="mt-4 pt-3.5 border-t border-amber-500/25 flex items-start gap-2 text-xs text-amber-300 font-sans animate-in fade-in">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {personalizedNudge}
                </span>
              </div>
            )}
          </div>

          {/* Progressive Hint Component */}
          <HintButton
            challengeId={currentChallenge.id}
            lastAction={lastAction}
            hasFailedAttempt={isFeedbackFailure || failedAttempts > 0}
          />

          {/* Reread / Focus Nudge */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800/60 shrink-0">
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
        </>
      </div>
    );
  };
