import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { Info, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export const FeedbackBanner: React.FC = () => {
  const { lastFeedback } = useGameStore();

  const getStyle = () => {
    switch (lastFeedback.type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        };
      case 'failure':
        return {
          bg: 'bg-rose-950/40 border-rose-500/40 text-rose-200',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        };
      case 'info':
        return {
          bg: 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200',
          icon: <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        };
      default:
        return {
          bg: 'bg-slate-850 border-slate-700 text-slate-300',
          icon: <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        };
    }
  };

  const style = getStyle();

  return (
    <div
      key={lastFeedback.timestamp}
      className={`w-full p-3.5 rounded-xl border flex items-start gap-3 backdrop-blur-sm shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${style.bg}`}
    >
      {style.icon}
      <div className="text-xs sm:text-sm font-medium leading-relaxed">
        {lastFeedback.message}
      </div>
    </div>
  );

};
