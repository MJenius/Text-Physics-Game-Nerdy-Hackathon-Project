import React, { useState } from 'react';
import { useGameStore } from '../engine/GameStore';
import { useLearnerStore } from '../engine/LearnerStore';
import { HintButton } from './HintButton';
import { getPersonalizedRereadingPrompt } from '../engine/HintService';
import { SKILL_KEY_MAP } from '../types/learner';
import {
  BookOpen,
  RefreshCw,
  Cpu,
  Loader2,
  Bookmark,
  FileText,
  Radio,
  Map as MapIcon,
  AlertOctagon,
  Scroll,
  BookMarked
} from 'lucide-react';

export const ReadingPanel: React.FC = () => {
  const {
    currentChallenge,
    currentAct,
    rereadCount,
    recordReread,
    lastFeedback,
    lastAction,
    failedAttempts,
    isPassageGenerating,
    isTransferModeActive,
    openNotebook
  } = useGameStore();

  const { profile } = useLearnerStore();
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);

  const documents = currentChallenge.passage.documents || [];
  const hasMultipleDocs = documents.length > 1;
  const activeDoc = documents[selectedDocIndex] || null;

  // Title, source, paragraphs from active document or adapted passage
  const adapted = currentChallenge.adaptedPassage;
  const passageTitle = isTransferModeActive
    ? currentChallenge.passage.heading
    : activeDoc
    ? activeDoc.title
    : (adapted?.title || currentChallenge.passage.heading);

  const passageSource = isTransferModeActive
    ? currentChallenge.passage.source
    : activeDoc
    ? `${activeDoc.source} ${activeDoc.dateOrStamp ? `• ${activeDoc.dateOrStamp}` : ''}`
    : (adapted?.source || currentChallenge.passage.source);

  const paragraphs = isTransferModeActive
    ? currentChallenge.passage.paragraphs
    : activeDoc
    ? activeDoc.paragraphs
    : (adapted?.paragraphs || currentChallenge.passage.paragraphs);

  const targetVocab = isTransferModeActive
    ? (currentChallenge.passage.keyClues || [])
    : activeDoc?.keyClues || (adapted?.targetVocabulary || currentChallenge.passage.keyClues || []);

  const isFeedbackFailure = lastFeedback.type === 'failure';
  const skillKey = SKILL_KEY_MAP[currentChallenge.targetReadingSkill] || 'literalRetrieval';
  const personalizedNudge = isTransferModeActive
    ? 'Notice the incident log: vent vapor lock before starting the recirculation pump.'
    : (profile
        ? getPersonalizedRereadingPrompt(skillKey, profile.audience)
        : 'Notice the physical constraints stated in the text: verify order and prerequisites before acting.');

  const getDocTypeIcon = (type?: string) => {
    switch (type) {
      case 'telegraph':
        return <Radio className="w-3.5 h-3.5 text-cyan-400" />;
      case 'architectural_map':
        return <MapIcon className="w-3.5 h-3.5 text-amber-400" />;
      case 'emergency_log':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
      case 'personal_diary':
        return <Scroll className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-950/90 border-r border-stone-800 p-6 backdrop-blur-md shadow-2xl overflow-y-auto select-none font-serif">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-800/80 shrink-0">
        <div className="flex items-center gap-2.5 text-amber-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs uppercase tracking-widest font-mono font-semibold">
            {isTransferModeActive ? 'Triton-IV Crisis Terminal' : `Act ${currentAct}: Primary Source Documents`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Notebook Trigger */}
          <button
            onClick={openNotebook}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 transition-colors cursor-pointer"
            title="Open Field Notebook"
          >
            <BookMarked className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Notebook</span>
          </button>

          {/* Reading Level Badge */}
          {profile && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold capitalize flex items-center gap-1">
              {isPassageGenerating ? (
                <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
              ) : adapted?.isAIGenerated ? (
                <Cpu className="w-3 h-3 text-cyan-400" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
              )}
              {profile.audience} • {profile.readingDifficulty}
            </span>
          )}

          <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-semibold ${
            isTransferModeActive
              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 animate-pulse'
              : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
          }`}>
            {isTransferModeActive ? 'Hero Transfer' : `Act ${currentAct} of 7`}
          </span>
        </div>
      </div>

      {/* Multi-Document Tabs (If available) */}
      {hasMultipleDocs && (
        <div className="mb-4 flex items-center gap-1.5 border-b border-stone-800/60 pb-2 overflow-x-auto shrink-0 font-mono text-xs">
          <span className="text-[10px] text-stone-500 uppercase tracking-wider mr-1">Sources:</span>
          {documents.map((doc, idx) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedDocIndex === idx
                  ? 'bg-amber-950/60 border-amber-500 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.15)] font-semibold'
                  : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              {getDocTypeIcon(doc.type)}
              <span>{doc.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Content Area */}
      <>
        {/* Entry Title & Source */}
        <div className="mb-4 shrink-0 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-amber-200/95 tracking-wide">
              {passageTitle}
            </h2>
            <p className="text-xs text-stone-400 italic mt-1 font-serif">
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
              : 'bg-stone-900/60 border-stone-800/80'
          }`}
        >
          <div className="space-y-3.5 text-stone-200 text-sm leading-relaxed font-serif">
            {paragraphs.map((p, idx) => (
              <p key={idx} className="tracking-wide">
                {p}
              </p>
            ))}
          </div>

          {/* Target Vocabulary / Key Clues chips */}
          {targetVocab.length > 0 && (
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono text-stone-400 mr-1 flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-amber-400" /> Essential Clues:
              </span>
              {targetVocab.map((term, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800/80 text-amber-200/90 border border-stone-700/80"
                >
                  {term}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Context Nudge / Consequence Recovery Banner */}
        {failedAttempts > 0 && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 animate-in fade-in text-xs font-serif text-amber-200 flex items-start gap-2.5 shadow-md">
            <span className="text-amber-400 font-bold text-sm">✦</span>
            <div>
              <span className="font-bold text-amber-300 font-mono text-[11px] uppercase tracking-wide block mb-0.5">
                Investigator’s Reflection:
              </span>
              <p className="text-xs text-stone-300 leading-relaxed font-serif">
                {personalizedNudge}
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions: Re-Read & Hint */}
        <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between shrink-0">
          <button
            onClick={recordReread}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-stone-400 hover:text-amber-200 hover:bg-stone-800/80 border border-stone-700/80 transition-all cursor-pointer"
            title="Mark text as re-read to sharpen mental model"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
            <span>Re-read Document {rereadCount > 0 && `(${rereadCount})`}</span>
          </button>

          <HintButton
            challengeId={currentChallenge.id}
            lastAction={lastAction}
            hasFailedAttempt={failedAttempts > 0}
          />
        </div>
      </>
    </div>
  );
};
