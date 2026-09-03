import React from 'react';
import { useLearnerStore } from '../engine/LearnerStore';
import { SKILL_DISPLAY_NAMES, type ReadingSkill } from '../types/learner';
import { X, Award, Clock, Lightbulb, RefreshCw, BarChart3 } from 'lucide-react';

interface ProgressViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ isOpen, onClose }) => {
  const { profile } = useLearnerStore();

  if (!isOpen || !profile) return null;

  const skillOrder: ReadingSkill[] = [
    'literalRetrieval',
    'sequencing',
    'causeEffect',
    'negativeConstraint',
    'multiCondition',
    'synthesis',
  ];

  const stats = profile.sessionStats;
  const avgSeconds = Math.round((stats.averageCompletionTimeMs || 0) / 1000);
  const timeFormatted = `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-[#070b14] p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-100">
                Learner Reading Profile
              </h2>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="capitalize">{profile.audience}</span>
                <span>•</span>
                <span className="capitalize">{profile.readingDifficulty} English</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skill Bars */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-300">
              Reading Skill Estimates
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Updated via in-game actions
            </span>
          </div>

          <div className="space-y-3">
            {skillOrder.map((skill) => {
              const score = profile.skills[skill] ?? 0.5;
              const percent = Math.round(score * 100);

              // Color gradient based on proficiency
              const barColor =
                score >= 0.7
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : score >= 0.5
                  ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]';

              return (
                <div key={skill} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-200">
                      {SKILL_DISPLAY_NAMES[skill]}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {score.toFixed(2)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center">
            <Award className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-mono text-slate-400">Completed</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {stats.challengesCompleted}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center">
            <RefreshCw className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] uppercase font-mono text-slate-400">Rereads</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {stats.totalRereads}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center">
            <Lightbulb className="w-4 h-4 text-amber-300 mb-1" />
            <span className="text-[10px] uppercase font-mono text-slate-400">Hints Used</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {stats.totalHintsUsed}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col items-center text-center">
            <Clock className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] uppercase font-mono text-slate-400">Avg Time</span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {timeFormatted}
            </span>
          </div>
        </div>

        {/* Informative footer */}
        <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-900/40 text-[11px] text-cyan-200/90 leading-relaxed">
          <span className="font-semibold text-cyan-300 block mb-0.5">
            Transparent Heuristic Estimation
          </span>
          Values increase with first-try and reread-assisted completions (+0.06 to +0.10) and adjust on action failures (-0.04). No black-box grading models are used.
        </div>
      </div>
    </div>
  );
};
