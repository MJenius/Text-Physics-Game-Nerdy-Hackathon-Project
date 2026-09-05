import React from 'react';
import { useGameStore } from '../engine/GameStore';
import { Sparkles, RotateCcw, Clock, Target, BookOpen, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VictoryModal: React.FC = () => {
  const { hasWonGame, sessionStartTime } = useGameStore();

  React.useEffect(() => {
    if (hasWonGame) {
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f59e0b', '#06b6d4', '#10b981', '#8b5cf6'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [hasWonGame]);

  if (!hasWonGame) return null;

  return <VictoryModalContent sessionStartTime={sessionStartTime} />;
};

const VictoryModalContent: React.FC<{ sessionStartTime: number }> = ({ sessionStartTime }) => {
  const { totalAttempts, failedAttempts, rereadCount, restartFullGame, narrative } = useGameStore();
  const [durationSec] = React.useState(() => Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000)));

  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const timeFormatted = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  const accuracyRate = totalAttempts > 0 ? Math.round(((totalAttempts - failedAttempts) / totalAttempts) * 100) : 100;

  const worldId = narrative.activeWorldId || 'lost_observatory';
  const worldTitle =
    worldId === 'arctic_station'
      ? 'Boreas Sub-Zero Station Restored!'
      : worldId === 'triton_deep_sea'
      ? 'Triton-IV Trench Station Stabilized!'
      : worldId === 'orbital_habitat'
      ? 'Aether-9 Solar Coronagraph Calibrated!'
      : 'The Lost Observatory Activated!';

  const worldSubtitle =
    worldId === 'arctic_station'
      ? 'You mastered thermal siphons, katabatic locks, and prehistoric stratigraphy through rigorous reading deduction.'
      : worldId === 'triton_deep_sea'
      ? 'You resolved hydrothermal cavitation and stabilized the abyssal geothermal core using pure technical reading analysis.'
      : worldId === 'orbital_habitat'
      ? 'You synthesized multi-source baseline vectors and Faraday shifts to shield sensitive photomultipliers from coronal flares.'
      : 'You have completed the full journey through Mount Caelum. Every physical mechanism was unlocked solely through reading and understanding the text.';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-slate-900 to-[#070b14] p-8 shadow-[0_0_50px_rgba(245,158,11,0.3)] flex flex-col items-center text-center">
        {/* Glowing Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
          <Award className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200 tracking-wide">
          {worldTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 font-serif max-w-sm">
          {worldSubtitle}
        </p>

        {/* Telemetry & Performance Metrics Card */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
            <Clock className="w-4 h-4 text-cyan-400 mb-1" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Time</span>
            <span className="text-sm font-bold font-mono text-slate-200">{timeFormatted}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
            <Target className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Accuracy</span>
            <span className="text-sm font-bold font-mono text-slate-200">{accuracyRate}%</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
            <BookOpen className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Rereads</span>
            <span className="text-sm font-bold font-mono text-slate-200">{rereadCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-violet-400 mb-1" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Stages</span>
            <span className="text-sm font-bold font-mono text-slate-200">6 / 6</span>
          </div>
        </div>

        {/* Pedagogical Takeaway */}
        <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200 text-left mb-6 font-sans">
          <span className="font-semibold text-cyan-300 block mb-0.5">
            Core Text Physics Proof Demonstrated:
          </span>
          Zero multiple-choice comprehension questions were used. Your physical interactions directly demonstrated mastery of literal retrieval, procedural sequencing, causal chains, exclusion logic, multi-condition prerequisites, and synthesis.
        </div>

        {/* Action Button */}
        <button
          onClick={restartFullGame}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono tracking-wider transition-all shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Replay From Entrance Courtyard
        </button>
      </div>
    </div>
  );
};
