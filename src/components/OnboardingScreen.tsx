import React, { useState } from 'react';
import { useLearnerStore } from '../engine/LearnerStore';
import type { Audience, ReadingDifficulty } from '../types/learner';
import { Compass, Sparkles, BookOpen, User, Users, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useLearnerStore();

  const [selectedAudience, setSelectedAudience] = useState<Audience>('adults');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ReadingDifficulty>('intermediate');

  const audienceOptions: Array<{
    id: Audience;
    label: string;
    tagline: string;
    desc: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'kids',
      label: 'Kids (Ages 7–12)',
      tagline: 'Shorter, clearer stories',
      desc: 'Concrete vocabulary, direct sentences, explicit order words (first, then, before).',
      icon: <User className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'teens',
      label: 'Teens (Ages 13–17)',
      tagline: 'Richer mysteries & puzzles',
      desc: 'Broader vocabulary, moderate clause complexity, balanced deduction.',
      icon: <Users className="w-5 h-5 text-cyan-400" />
    },
    {
      id: 'adults',
      label: 'Adults (Ages 18+)',
      tagline: 'Natural, authentic documents',
      desc: 'Field journal entries, technical schematics, realistic vocabulary and nuance.',
      icon: <GraduationCap className="w-5 h-5 text-indigo-400" />
    }
  ];

  const difficultyOptions: Array<{
    id: ReadingDifficulty;
    label: string;
    pill: string;
    desc: string;
  }> = [
    {
      id: 'beginner',
      label: 'Gentle',
      pill: 'Short & Direct',
      desc: 'Simple sentence structures, explicit clues, and foundational vocabulary.'
    },
    {
      id: 'intermediate',
      label: 'Standard',
      pill: 'Balanced Challenge',
      desc: 'Standard field journal prose with natural clues and procedural flow.'
    },
    {
      id: 'advanced',
      label: 'Challenging',
      pill: 'Richer English',
      desc: 'Sophisticated syntax, implicit relationships, and authentic technical prose.'
    }
  ];

  const handleStart = () => {
    completeOnboarding(selectedAudience, selectedDifficulty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#050811]/95 backdrop-blur-xl overflow-y-auto select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/95 via-slate-950/90 to-[#070b14] p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.15)] flex flex-col my-auto">
        {/* Header Branding */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Compass className="w-6 h-6 animate-[spin_20s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400/90 font-semibold">
                Personalized Reading Engine
              </span>
              <span className="px-2 py-0.2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-mono">
                Phase 2
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 tracking-wide">
              Text Physics: The Lost Observatory
            </h1>
          </div>
        </div>

        {/* Section 1: Audience */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-slate-200">
              1. Who is reading?
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-3 font-sans">
            We adapt sentence structure, vocabulary, and narrative framing to fit the reader.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {audienceOptions.map((opt) => {
              const isSelected = selectedAudience === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAudience(opt.id)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {opt.icon}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <span className="text-xs font-bold font-sans text-slate-200 mb-0.5">
                    {opt.label}
                  </span>
                  <span className="text-[11px] font-mono text-amber-300/90 mb-1">
                    {opt.tagline}
                  </span>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Reading Difficulty */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-mono uppercase tracking-wider font-semibold text-slate-200">
              2. How challenging should the English be?
            </h2>
          </div>
          <p className="text-xs text-slate-400 mb-3 font-sans">
            Independent of age: an adult learner can choose Gentle English, or a confident student can choose Challenging.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {difficultyOptions.map((opt) => {
              const isSelected = selectedDifficulty === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDifficulty(opt.id)}
                  className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold font-sans text-slate-200">
                      {opt.label}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {opt.pill}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Informational banner */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Deterministic Game Physics Guarantee:</strong> The interactive chamber puzzles remain identical; only the reading passage adapts to your learning level.
          </span>
        </div>

        {/* Start Button */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-500 font-mono">
            You can change this anytime in Settings.
          </span>
          <button
            onClick={handleStart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer"
          >
            Begin Expedition <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
