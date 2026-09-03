import React from 'react';
import { useLearnerStore } from '../engine/LearnerStore';
import { isAIAvailable } from '../engine/AIContentService';
import type { Audience, ReadingDifficulty } from '../types/learner';
import { X, Settings, User, Sparkles, RefreshCw, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileReset?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  onProfileReset,
}) => {
  const { profile, setAudience, setDifficulty, resetProfile } = useLearnerStore();
  const aiReady = isAIAvailable();

  if (!isOpen || !profile) return null;

  const audiences: Array<{ id: Audience; label: string; desc: string }> = [
    { id: 'kids', label: 'Kids', desc: 'Shorter, concrete sentences' },
    { id: 'teens', label: 'Teens', desc: 'Moderate vocabulary & deduction' },
    { id: 'adults', label: 'Adults', desc: 'Natural authentic prose & nuance' },
  ];

  const difficulties: Array<{ id: ReadingDifficulty; label: string; desc: string }> = [
    { id: 'beginner', label: 'Gentle', desc: 'Direct clues & short syntax' },
    { id: 'intermediate', label: 'Standard', desc: 'Original balanced difficulty' },
    { id: 'advanced', label: 'Challenging', desc: 'Richer vocabulary & implicit cues' },
  ];

  const handleReset = () => {
    if (window.confirm('Reset your learner profile? You will return to the setup screen.')) {
      resetProfile();
      onProfileReset?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md h-full bg-[#080d1a] border-l border-slate-800 p-6 flex flex-col shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-100">
                Reading Preferences
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Personalized Content Controls
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting 1: Audience */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <User className="w-4 h-4 text-amber-400" />
            <span>Target Audience Profile</span>
          </div>
          <div className="space-y-2">
            {audiences.map((aud) => {
              const isSelected = profile.audience === aud.id;
              return (
                <button
                  key={aud.id}
                  onClick={() => setAudience(aud.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400 text-slate-100 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold font-sans">{aud.label}</div>
                    <div className="text-[11px] text-slate-400">{aud.desc}</div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Setting 2: Reading Difficulty */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>English Difficulty Level</span>
          </div>
          <div className="space-y-2">
            {difficulties.map((diff) => {
              const isSelected = profile.readingDifficulty === diff.id;
              return (
                <button
                  key={diff.id}
                  onClick={() => setDifficulty(diff.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold font-sans">{diff.label}</div>
                    <div className="text-[11px] text-slate-400">{diff.desc}</div>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Engine Status Card */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
              AI Generation Engine
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            {aiReady ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-300 font-semibold">
                  Connected (Gemini 2.0 Flash)
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono text-amber-300 font-semibold">
                  Fallback Mode (Local Passages Active)
                </span>
              </>
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            {aiReady
              ? 'Passages are dynamically generated and validated against the deterministic puzzle schema.'
              : 'Pre-authored, verified passages matching your selected reading difficulty are served locally.'}
          </p>
        </div>

        {/* Reset Profile */}
        <div className="mt-auto pt-4 border-t border-slate-800/80">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Learner Profile & Restart
          </button>
        </div>
      </div>
    </div>
  );
};
