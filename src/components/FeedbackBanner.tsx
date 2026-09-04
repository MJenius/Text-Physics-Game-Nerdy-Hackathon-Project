import React, { useState, useEffect } from 'react';
import { useGameStore } from '../engine/GameStore';
import { Info, CheckCircle2, AlertTriangle, HelpCircle, X } from 'lucide-react';

export const FeedbackBanner: React.FC = () => {
  const { lastFeedback } = useGameStore();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(false);
  }, [lastFeedback?.timestamp]);

  if (isDismissed || !lastFeedback?.message) return null;

  const getStyle = () => {
    switch (lastFeedback.type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        };
      case 'failure':
        return {
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.15)]',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        };
      case 'info':
        return {
          bg: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.15)]',
          icon: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        };
      default:
        return {
          bg: 'bg-stone-900/90 border-stone-700 text-stone-300',
          icon: <HelpCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        };
    }
  };

  const style = getStyle();

  return (
    <div
      key={lastFeedback.timestamp}
      className={`w-full p-3 rounded-xl border flex items-start justify-between gap-3 backdrop-blur-md shadow-lg transition-all animate-in fade-in slide-in-from-top-1 duration-200 ${style.bg}`}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {style.icon}
        <div className="text-xs sm:text-[13px] font-medium leading-relaxed font-sans min-w-0">
          {lastFeedback.message}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setIsDismissed(true)}
        className="p-1 rounded hover:bg-black/30 text-stone-400 hover:text-stone-100 transition-colors cursor-pointer shrink-0 ml-1"
        title="Dismiss feedback message"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
