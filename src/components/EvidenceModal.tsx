import React, { useState } from 'react';
import { useLearnerStore } from '../engine/LearnerStore';
import { CheckCircle2, AlertCircle, FileSearch, ArrowRight } from 'lucide-react';
import type { ReadingSkill } from '../types/learner';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSkill: ReadingSkill;
  challengeTitle: string;
  paragraphs: string[];
  expectedSentenceSnippet: string;
  questionText?: string;
  onVerified: (wasCorrect: boolean) => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  targetSkill,
  challengeTitle,
  paragraphs,
  expectedSentenceSnippet,
  questionText = 'Which sentence in the text directed your successful action?',
  onVerified,
}) => {
  const [selectedParagraphIndex, setSelectedParagraphIndex] = useState<number | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<'success' | 'failure' | null>(null);
  const { recordEvidenceAttribution } = useLearnerStore();

  if (!isOpen) return null;

  const handleSelectParagraph = (index: number) => {
    setSelectedParagraphIndex(index);
  };

  const handleConfirm = () => {
    if (selectedParagraphIndex === null) return;

    const selectedText = paragraphs[selectedParagraphIndex] || '';
    const isCorrect = selectedText.toLowerCase().includes(expectedSentenceSnippet.toLowerCase());

    recordEvidenceAttribution(targetSkill, isCorrect);
    setEvaluationResult(isCorrect ? 'success' : 'failure');

    setTimeout(() => {
      onVerified(isCorrect);
      onClose();
      // Reset state for next time
      setSelectedParagraphIndex(null);
      setEvaluationResult(null);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-[#070b14] p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-900/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-semibold block">
                Evidence Attribution Check
              </span>
              <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100">
                Show Your Proof: {challengeTitle}
              </h3>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans mb-4">
          {questionText} Click on the paragraph that provided the exact rule you followed.
        </p>

        {/* Paragraph Selection Cards */}
        <div className="space-y-3 mb-6">
          {paragraphs.map((p, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectParagraph(idx)}
              className={`p-3.5 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer font-serif ${
                selectedParagraphIndex === idx
                  ? 'border-amber-400 bg-amber-950/40 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div className="text-[10px] font-mono text-slate-500 mb-1">
                Paragraph {idx + 1}
              </div>
              {p}
            </div>
          ))}
        </div>

        {/* Feedback Banner on Submission */}
        {evaluationResult === 'success' && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Proof Verified!</strong> Your reading matches your mechanical action. Confidence score increased.
            </span>
          </div>
        )}

        {evaluationResult === 'failure' && (
          <div className="p-3 mb-4 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-in zoom-in-95 duration-200">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Partial Match:</strong> While the action worked, the primary rule was in another section. Director will schedule a transfer verification.
            </span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedParagraphIndex === null || evaluationResult !== null}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg cursor-pointer"
          >
            <span>Verify Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
