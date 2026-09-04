import React, { useEffect, useState } from 'react';
import { ReadingPanel } from './components/ReadingPanel';
import { StageViewport } from './components/StageViewport';
import { InventoryBar } from './components/InventoryBar';
import { FeedbackBanner } from './components/FeedbackBanner';
import { VictoryModal } from './components/VictoryModal';
import { OnboardingScreen } from './components/OnboardingScreen';
import { SettingsDrawer } from './components/SettingsDrawer';
import { ProgressView } from './components/ProgressView';
import { NotebookModal } from './components/NotebookModal';
import { useGameStore } from './engine/GameStore';
import { useLearnerStore } from './engine/LearnerStore';
import { initAIService } from './engine/AIContentService';
import { DirectorHUD } from './components/DirectorHUD';
import { EvidenceModal } from './components/EvidenceModal';
import { DynamicTransferStageViewport } from './components/DynamicTransferStageViewport';
import { DirectorInspector } from './components/DirectorInspector';
import { ALL_SCHEMAS } from './content/challengeSchemas';
import { TRITON_TRANSFER_SCENARIO } from './content/heroTransferScenario';
import { WORLD_REGISTRY, getWorldDefinition } from './worlds/worldRegistry';
import { Compass, Snowflake, Anchor, Orbit, ChevronDown, Check, RotateCcw, BarChart3, Settings, BookMarked, Terminal } from 'lucide-react';

export const App: React.FC = () => {
  const {
    resetCurrentChallenge,
    currentChallenge,
    currentAct,
    loadAdaptedPassage,
    isEvidenceModalOpen,
    closeEvidenceModal,
    isTransferModeActive,
    loadHeroTransferScenario,
    openNotebook,
    narrative,
    setWorld
  } = useGameStore();
  const { isOnboarded, profile } = useLearnerStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isWorldMenuOpen, setIsWorldMenuOpen] = useState(false);

  // Keyboard shortcut: ` (backtick) or ~ toggles Developer Director Inspector
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsInspectorOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const activeWorld = getWorldDefinition(narrative.activeWorldId || 'lost_observatory');
  const worldsList = Object.values(WORLD_REGISTRY);

  const getWorldIcon = (worldId: string) => {
    switch (worldId) {
      case 'arctic_station':
        return <Snowflake className="w-4 h-4 text-sky-400" />;
      case 'triton_deep_sea':
        return <Anchor className="w-4 h-4 text-teal-400" />;
      case 'orbital_habitat':
        return <Orbit className="w-4 h-4 text-blue-400" />;
      case 'lost_observatory':
      default:
        return <Compass className="w-4 h-4 text-amber-400" />;
    }
  };

  const getWorldBadgeStyles = (worldId: string) => {
    switch (worldId) {
      case 'arctic_station':
        return 'bg-sky-500/10 border-sky-500/40 text-sky-300 hover:bg-sky-500/20';
      case 'triton_deep_sea':
        return 'bg-teal-500/10 border-teal-500/40 text-teal-300 hover:bg-teal-500/20';
      case 'orbital_habitat':
        return 'bg-blue-500/10 border-blue-500/40 text-blue-300 hover:bg-blue-500/20';
      case 'lost_observatory':
      default:
        return 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070a11] text-stone-100 overflow-hidden select-none font-serif">
      {/* Onboarding Screen if not yet set up */}
      {!isOnboarded && <OnboardingScreen />}

      {/* Field Notebook Modal */}
      <NotebookModal />

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg border transition-colors ${
            narrative.activeWorldId === 'arctic_station'
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
              : narrative.activeWorldId === 'triton_deep_sea'
              ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
              : narrative.activeWorldId === 'orbital_habitat'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {getWorldIcon(narrative.activeWorldId)}
          </div>
          <div>
            <div className="flex items-center gap-2 relative">
              <h1 className="text-sm font-bold tracking-wider uppercase font-mono text-stone-200">
                Text Physics
              </h1>

              {/* Interactive World Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsWorldMenuOpen(!isWorldMenuOpen)}
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${getWorldBadgeStyles(narrative.activeWorldId)}`}
                  title="Switch between different playable physics worlds"
                >
                  <span className="font-bold">{activeWorld.name}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isWorldMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isWorldMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsWorldMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-[#090d16]/95 border border-stone-700 shadow-2xl backdrop-blur-lg z-40 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 font-mono">
                      <div className="px-2.5 py-1 text-[9px] uppercase tracking-wider text-stone-400 font-bold border-b border-stone-800 flex items-center justify-between">
                        <span>Switch World Attunement</span>
                        <span className="text-[8px] text-cyan-400 font-normal">4 Playable Worlds</span>
                      </div>
                      {worldsList.map((w) => {
                        const isCurrent = (narrative.activeWorldId || 'lost_observatory') === w.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setWorld(w.id);
                              setIsWorldMenuOpen(false);
                            }}
                            className={`w-full p-2 rounded-lg text-left transition-all flex items-start justify-between cursor-pointer ${
                              isCurrent
                                ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200'
                                : 'hover:bg-stone-800/80 text-stone-300 border border-transparent'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5">
                                {getWorldIcon(w.id)}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                                  {w.name}
                                </div>
                                <div className="text-[9px] text-stone-400 leading-tight mt-0.5 font-sans">
                                  {w.tagline}
                                </div>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
            <span className="text-[10px] text-stone-400 font-sans tracking-wide block -mt-0.5">
              {isTransferModeActive
                ? 'Hero Transfer Mode — Deep-Sea Station Triton-IV'
                : `Act ${currentAct}: ${currentChallenge.title}`}
            </span>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Field Notebook Button */}
          <button
            onClick={openNotebook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-300 hover:text-amber-200 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 transition-colors cursor-pointer"
            title="Open Field Notebook & Investigation Map"
          >
            <BookMarked className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Field Notebook</span>
          </button>

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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-stone-700/60 transition-colors cursor-pointer"
            title="Reading Preferences & Settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Settings</span>
          </button>

          <button
            onClick={resetCurrentChallenge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 border border-stone-700/60 transition-colors cursor-pointer"
            title="Reset current mechanism to neutral configuration"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsInspectorOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 transition-colors cursor-pointer"
            title="Director Inspector & Cognitive Debugger (~ key)"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">Dev HUD</span>
          </button>
        </div>
      </header>

      {/* AI Director Insight HUD */}
      <DirectorHUD
        onOpenTransfer={loadHeroTransferScenario}
        canTriggerTransfer={Boolean(profile && (profile.skills.causeEffect >= 0.55 || currentAct >= 3))}
      />

      {/* Main Dual-Panel Stage Layout (50/50 Split) */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Reading / Logbook Panel (50% on desktop) */}
        <section className="w-full md:w-1/2 h-full">
          <ReadingPanel />
        </section>

        {/* Right: Interactive Viewport & Feedback (50% on desktop) */}
        <section className="w-full md:w-1/2 h-full flex flex-col bg-stone-950/40 overflow-hidden">
          {/* Top Feedback Banner */}
          <div className="pt-3 px-6 shrink-0 z-10">
            <FeedbackBanner />
          </div>

          {/* Scrollable / Centered Stage Viewport */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-4">
            <div className="w-full my-auto flex flex-col items-center">
              {isTransferModeActive ? (
                <DynamicTransferStageViewport />
              ) : (
                <StageViewport />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Inventory Bar */}
      <footer className="shrink-0 z-20">
        <InventoryBar />
      </footer>

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onProfileReset={() => useGameStore.getState().restartFullGame()}
      />

      {/* Progress View */}
      <ProgressView
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
      />

      {/* Developer Director Inspector & Cognitive Debug Terminal */}
      <DirectorInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      {/* Phase 3 Evidence Attribution Modal ('Show Your Proof') */}
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={closeEvidenceModal}
        targetSkill={(currentChallenge.targetReadingSkill as any) || 'literalRetrieval'}
        challengeTitle={currentChallenge.title}
        paragraphs={currentParagraphs}
        expectedSentenceSnippet={expectedSnippet}
        onVerified={(wasCorrect) => {
          const skillKey = (currentChallenge.targetReadingSkill as any) || 'literalRetrieval';
          useLearnerStore.getState().recordEvidenceAttribution(skillKey, wasCorrect);
        }}
      />

      {/* Game Complete Victory Modal */}
      <VictoryModal />
    </div>
  );
};

export default App;
