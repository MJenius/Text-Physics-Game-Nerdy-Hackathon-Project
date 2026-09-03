import React from 'react';
import { ReadingPanel } from './components/ReadingPanel';
import { StageViewport } from './components/StageViewport';
import { InventoryBar } from './components/InventoryBar';
import { FeedbackBanner } from './components/FeedbackBanner';
import { useGameStore } from './engine/GameStore';
import { Compass, RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const { resetCurrentChallenge } = useGameStore();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070a11] text-slate-100 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Compass className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase font-mono text-slate-200">
              Text Physics
            </h1>
            <span className="text-[10px] text-slate-400 font-sans tracking-wide block -mt-0.5">
              The Lost Observatory — Phase 1 Proof Spike
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetCurrentChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-700/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Stage
          </button>
        </div>
      </header>

      {/* Main Dual-Panel Stage Layout (50/50 Split) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Reading / Logbook Panel (50% on desktop) */}
        <section className="w-full md:w-1/2 h-full">
          <ReadingPanel />
        </section>

        {/* Right: Interactive Viewport & Feedback (50% on desktop) */}
        <section className="w-full md:w-1/2 h-full flex flex-col bg-slate-950/40 overflow-hidden">
          {/* Top Feedback Banner */}
          <div className="pt-3 px-6 shrink-0 z-10">
            <FeedbackBanner />
          </div>

          {/* Scrollable / Centered Stage Viewport */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <StageViewport />
          </div>
        </section>
      </main>


      {/* Bottom Inventory Bar */}
      <footer className="shrink-0 z-20">
        <InventoryBar />
      </footer>
    </div>
  );
};

export default App;
