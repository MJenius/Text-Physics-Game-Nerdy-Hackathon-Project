import React, { useEffect, useState } from 'react';
import { ReadingPanel } from './components/ReadingPanel';
import { StageViewport } from './components/StageViewport';
import { InventoryBar } from './components/InventoryBar';
import { FeedbackBanner } from './components/FeedbackBanner';
import { VictoryModal } from './components/VictoryModal';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ProgressView } from './components/ProgressView';
import { useGameStore } from './engine/GameStore';
import { useLearnerStore } from './engine/LearnerStore';
import { initAIService } from './engine/AIContentService';
import { DirectorHUD } from './components/DirectorHUD';
import { EvidenceModal } from './components/EvidenceModal';
import { DynamicTransferStageViewport } from './components/DynamicTransferStageViewport';
import { ALL_SCHEMAS } from './content/challengeSchemas';
import { TRITON_TRANSFER_SCENARIO } from './content/heroTransferScenario';
import { Compass, RotateCcw, BarChart3, Settings } from 'lucide-react';

export const App: React.FC = () => {
  const {
    resetCurrentChallenge,
    currentChallengeIndex,
    currentChallenge,
    loadAdaptedPassage,
    isEvidenceModalOpen,
    closeEvidenceModal,
    isTransferModeActive,
    loadHeroTransferScenario,
  } = useGameStore();
  const { isOnboarded, profile } = useLearnerStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);

  // Initialize AI service once on mount and then load adapted passage if onboarded
  useEffect(() => {
    let mounted = true;
    initAIService().then(() => {
      if (mounted && useLearnerStore.getState().isOnboarded) {
        useGameStore.getState().loadAdaptedPassage();
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Load adapted passage whenever onboarding status changes
  useEffect(() => {
    if (isOnboarded && !isTransferModeActive) {
      loadAdaptedPassage();
    }
  }, [isOnboarded, isTransferModeActive, loadAdaptedPassage]);

  // Current passage paragraphs for evidence modal
  const adapted = currentChallenge.adaptedPassage;
  const currentParagraphs = adapted?.paragraphs || currentChallenge.passage.paragraphs;
  const currentSchema = ALL_SCHEMAS[currentChallenge.id];
  const expectedSnippet = isTransferModeActive
    ? TRITON_TRANSFER_SCENARIO.evidenceSnippet
    : currentSchema?.evidenceSentences[0]?.evidencePhrase || 'before';

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070a11] text-slate-100 overflow-hidden select-none">
      {/* Onboarding Screen if not yet set up */}
      {!isOnboarded && <OnboardingScreen />}

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Compass className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider uppercase font-mono text-slate-200">
                Text Physics
              </h1>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-300 font-mono">
                Phase 3
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans tracking-wide block -mt-0.5">
              {isTransferModeActive
                ? 'Hero Transfer Mode — Triton-IV Deep Sea Submersible'
                : `The Lost Observatory — Stage ${currentChallengeIndex + 1} of 6`}
            </span>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {profile && (
            <button
              onClick={() => setIsProgressOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/60 transition-colors cursor-pointer"
              title="View Reading Skills Progress"
            >
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline capitalize">{profile.audience}</span>
              <span className="hidden sm:inline text-cyan-500">•</span>
              <span className="capitalize">{profile.readingDifficulty}</span>
            </button>
          )}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-700/60 transition-colors cursor-pointer"
            title="Reading Preferences & Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Settings</span>
          </button>

          <button
            onClick={resetCurrentChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-700/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Stage</span>
          </button>
        </div>
      </header>

      {/* AI Director Insight HUD */}
      <DirectorHUD
        onOpenTransfer={loadHeroTransferScenario}
        canTriggerTransfer={Boolean(profile && (profile.skills.causeEffect >= 0.55 || currentChallengeIndex >= 2))}
      />

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
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
            {isTransferModeActive ? (
              <DynamicTransferStageViewport />
            ) : (
              <StageViewport />
            )}
          </div>
        </section>
      </main>

      {/* Bottom Inventory Bar */}
      <footer className="shrink-0 z-20">
        <InventoryBar />
      </footer>

      {/* Completion & Victory Modal */}
      <VictoryModal />

      {/* Evidence Attribution Modal ("Show Your Proof") */}
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={closeEvidenceModal}
        targetSkill={currentChallenge.targetReadingSkill === 'cause_effect' ? 'causeEffect' : 'sequencing'}
        challengeTitle={currentChallenge.title}
        paragraphs={currentParagraphs}
        expectedSentenceSnippet={expectedSnippet}
        onVerified={(_wasCorrect) => {
          // Closed and recorded
        }}
      />

      {/* Modals & Drawers */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <ProgressView
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
      />
    </div>
  );
};

export default App;
