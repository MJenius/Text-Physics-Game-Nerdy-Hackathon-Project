import React from 'react';
import { useLearnerStore } from '../engine/LearnerStore';
import { Sparkles, Compass } from 'lucide-react';

interface DirectorHUDProps {
  onOpenTransfer?: () => void;
  canTriggerTransfer?: boolean;
}

export const DirectorHUD: React.FC<DirectorHUDProps> = ({ onOpenTransfer, canTriggerTransfer }) => {
  const { profile } = useLearnerStore();

  if (!profile) return null;

  const diagnosis = profile.lastDiagnosis || {
    headline: 'The World Is Listening',
    insight: 'The observatory mechanisms respond to how you read and interpret instructions.',
    timestamp: 0
  };

  const isTransferReady = canTriggerTransfer || profile.lastDiagnosis?.headline.includes('Transfer');

  return (
    <div className="w-full bg-slate-950/70 border-b border-amber-900/30 px-6 py-2 flex items-center justify-between gap-4 backdrop-blur-md z-10 select-none animate-in fade-in duration-300">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider font-semibold">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          <span>Director</span>
        </div>

        <div className="flex items-center gap-2 truncate">
          <span className="text-xs font-serif font-bold text-amber-200/90 shrink-0">
            {diagnosis.headline}:
          </span>
          <span className="text-xs text-slate-300 truncate font-sans">
            {diagnosis.insight}
          </span>
        </div>
      </div>

      {isTransferReady && onOpenTransfer && (
        <button
          onClick={onOpenTransfer}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[11px] font-mono font-bold tracking-wide shadow-lg shadow-cyan-900/30 transition-all cursor-pointer animate-pulse"
        >
          <Compass className="w-3.5 h-3.5" />
          Launch Triton Transfer
        </button>
      )}
    </div>
  );
};
