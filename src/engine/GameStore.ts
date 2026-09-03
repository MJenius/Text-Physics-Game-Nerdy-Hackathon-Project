import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorldState, PlayerAction, EntityId, Challenge } from '../types/game';
import { ALL_CHALLENGES, ALL_INITIAL_ENTITIES, ALL_INITIAL_INVENTORY, ALL_RULES } from '../content/allChallenges';
import { ALL_SCHEMAS } from '../content/challengeSchemas';
import { getFallbackPassage } from '../content/fallbackPassages';
import { generatePassage, isAIAvailable, getCachedPassage } from './AIContentService';
import { getDifficultyConstraints } from './DifficultyEngine';
import { useLearnerStore } from './LearnerStore';
import { SKILL_KEY_MAP, type GeneratedPassage } from '../types/learner';
import { RuleEvaluator } from './RuleEvaluator';
import { TelemetryService } from './Telemetry';
import { GameDirector } from './GameDirector';
import { TRITON_TRANSFER_SCENARIO } from '../content/heroTransferScenario';

interface GameStore extends WorldState {
  currentChallengeIndex: number;
  currentChallenge: Challenge;
  selectedInventoryItem: EntityId | null;
  sessionStartTime: number;
  readingDwellStartTime: number;
  totalAttempts: number;
  failedAttempts: number;
  rereadCount: number;
  completedChallengesCount: number;
  hasWonGame: boolean;
  lastAction: PlayerAction | null;
  isPassageGenerating: boolean;
  // Phase 3 additions
  isEvidenceModalOpen: boolean;
  isTransferModeActive: boolean;

  selectInventoryItem: (id: EntityId | null) => void;
  executeAction: (action: PlayerAction) => void;
  resetCurrentChallenge: () => void;
  recordReread: () => void;
  advanceToNextChallenge: () => void;
  restartFullGame: () => void;
  loadAdaptedPassage: () => Promise<void>;
  openEvidenceModal: () => void;
  closeEvidenceModal: () => void;
  loadHeroTransferScenario: () => void;
}

const getInitialChallengeState = (index: number) => {
  const challenge = ALL_CHALLENGES[index];
  const entities = JSON.parse(JSON.stringify(ALL_INITIAL_ENTITIES[challenge.id] || {}));
  const inventory = [...(ALL_INITIAL_INVENTORY[challenge.id] || [])];

  return {
    currentChallengeIndex: index,
    currentChallenge: challenge,
    currentLocationId: challenge.locationId,
    currentChallengeId: challenge.id,
    entities,
    inventory,
    flags: {},
    isComplete: false,
    selectedInventoryItem: null,
    lastFeedback: {
      type: 'info' as const,
      message: `Entered ${challenge.title}. Consult the Field Journal on the left to plan your actions.`,
      timestamp: Date.now()
    }
  };
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => {
    // Initialize Telemetry on startup
    TelemetryService.init();

    return {
      ...getInitialChallengeState(0),
      sessionStartTime: Date.now(),
      readingDwellStartTime: Date.now(),
      totalAttempts: 0,
      failedAttempts: 0,
      rereadCount: 0,
      completedChallengesCount: 0,
      hasWonGame: false,
      lastAction: null,
      isPassageGenerating: false,
      isEvidenceModalOpen: false,
      isTransferModeActive: false,

      openEvidenceModal: () => {
        set((state) => {
          state.isEvidenceModalOpen = true;
          TelemetryService.record('EVIDENCE_REQUESTED', state.currentChallengeId);
        });
      },

      closeEvidenceModal: () => {
        set((state) => {
          state.isEvidenceModalOpen = false;
        });
      },

      loadHeroTransferScenario: () => {
        set((state) => {
          state.isTransferModeActive = true;
          state.currentChallengeId = TRITON_TRANSFER_SCENARIO.id;
          state.currentChallenge = {
            id: TRITON_TRANSFER_SCENARIO.id,
            order: 99,
            title: TRITON_TRANSFER_SCENARIO.title,
            locationId: 'laboratory',
            passage: TRITON_TRANSFER_SCENARIO.passage,
            targetReadingSkill: 'cause_effect',
            ruleIds: TRITON_TRANSFER_SCENARIO.rules.map((r) => r.id),
            completionCondition: TRITON_TRANSFER_SCENARIO.completionConditions,
            completedMessage: 'Transfer Verified! Deep-Sea Geothermal Loop Mastered!',
          };
          state.entities = JSON.parse(JSON.stringify(TRITON_TRANSFER_SCENARIO.entities));
          state.inventory = [...TRITON_TRANSFER_SCENARIO.initialInventory];
          state.flags = {};
          state.isComplete = false;
          state.selectedInventoryItem = null;
          state.lastFeedback = {
            type: 'info',
            message: 'Triton-IV Submersible Active: Review reactor manual to flood cooling coils before thermal ignition.',
            timestamp: Date.now(),
          };
          state.readingDwellStartTime = Date.now();
          TelemetryService.record('TRANSFER_CHALLENGE_LOADED', TRITON_TRANSFER_SCENARIO.id);
        });
      },

      loadAdaptedPassage: async () => {
        const state = get();
        const learner = useLearnerStore.getState().profile;
        if (!learner) return;

        const challenge = state.currentChallenge;
        const schema = ALL_SCHEMAS[challenge.id];
        const isAIOn = learner.aiEnabled !== false;

        // Instant deterministic fallback first
        const deterministicFallback = getFallbackPassage(
          challenge.id,
          learner.readingDifficulty,
          learner.audience,
          challenge.passage
        );

        // If AI is disabled by user, immediately apply deterministic passage with 0 latency
        if (!isAIOn || !isAIAvailable() || !schema) {
          set((draft) => {
            draft.currentChallenge.adaptedPassage = deterministicFallback;
            draft.isPassageGenerating = false;
          });
          return;
        }

        // Check if we already have a cached AI passage for this combination (instant switch!)
        const cached = getCachedPassage(challenge.id, learner.audience, learner.readingDifficulty);
        if (cached) {
          set((draft) => {
            draft.currentChallenge.adaptedPassage = cached;
            draft.isPassageGenerating = false;
          });
          return;
        }

        // Optimistic preview: immediately show verified fallback text while AI generates in background
        set((draft) => {
          draft.currentChallenge.adaptedPassage = deterministicFallback;
          draft.isPassageGenerating = true;
        });

        const constraints = getDifficultyConstraints(learner.audience, learner.readingDifficulty);
        let adapted: GeneratedPassage | null = null;

        try {
          adapted = await generatePassage(schema, constraints, learner.audience, learner.readingDifficulty);
        } catch (err) {
          console.warn('[GameStore] AI passage generation failed, retaining fallback:', err);
        }

        // Only update if learner profile is still on the same audience and difficulty
        const currentLearner = useLearnerStore.getState().profile;
        if (
          currentLearner &&
          currentLearner.audience === learner.audience &&
          currentLearner.readingDifficulty === learner.readingDifficulty &&
          currentLearner.aiEnabled !== false
        ) {
          set((draft) => {
            if (adapted) {
              draft.currentChallenge.adaptedPassage = adapted;
            }
            draft.isPassageGenerating = false;
          });
        }
      },

      selectInventoryItem: (id: EntityId | null) => {
        set((state) => {
          state.selectedInventoryItem = state.selectedInventoryItem === id ? null : id;
        });
      },

      recordReread: () => {
        set((state) => {
          state.rereadCount += 1;
          TelemetryService.record('REREAD_TRIGGERED', state.currentChallengeId, {
            totalRereads: state.rereadCount
          });
          state.lastFeedback = {
            type: 'info',
            message: 'Reviewing the Field Journal notes carefully...',
            timestamp: Date.now()
          };
        });
      },

      resetCurrentChallenge: () => {
        set((state) => {
          const fresh = getInitialChallengeState(state.currentChallengeIndex);
          state.entities = fresh.entities;
          state.inventory = fresh.inventory;
          state.flags = fresh.flags;
          state.isComplete = false;
          state.selectedInventoryItem = null;
          state.lastFeedback = {
            type: 'neutral',
            message: 'Room mechanisms reset to initial state.',
            timestamp: Date.now()
          };
          TelemetryService.record('CHALLENGE_RESET', state.currentChallengeId);
        });
      },

      advanceToNextChallenge: () => {
        set((state) => {
          const nextIndex = state.currentChallengeIndex + 1;
          if (nextIndex < ALL_CHALLENGES.length) {
            const fresh = getInitialChallengeState(nextIndex);
            state.currentChallengeIndex = fresh.currentChallengeIndex;
            state.currentChallenge = fresh.currentChallenge;
            state.currentLocationId = fresh.currentLocationId;
            state.currentChallengeId = fresh.currentChallengeId;
            state.entities = fresh.entities;
            state.inventory = fresh.inventory;
            state.flags = fresh.flags;
            state.isComplete = false;
            state.selectedInventoryItem = null;
            state.lastFeedback = fresh.lastFeedback;
            state.readingDwellStartTime = Date.now();
            state.lastAction = null;
            TelemetryService.record('PASSAGE_VIEW', fresh.currentChallengeId);
          } else {
            state.hasWonGame = true;
            TelemetryService.record('WORLD_COMPLETE', state.currentChallengeId, {
              totalDurationMs: Date.now() - state.sessionStartTime,
              totalAttempts: state.totalAttempts,
              failedAttempts: state.failedAttempts
            });
          }
        });
        // Load adapted passage for the new stage
        get().loadAdaptedPassage();
      },

      restartFullGame: () => {
        set((state) => {
          const fresh = getInitialChallengeState(0);
          state.currentChallengeIndex = 0;
          state.currentChallenge = fresh.currentChallenge;
          state.currentLocationId = fresh.currentLocationId;
          state.currentChallengeId = fresh.currentChallengeId;
          state.entities = fresh.entities;
          state.inventory = fresh.inventory;
          state.flags = fresh.flags;
          state.isComplete = false;
          state.selectedInventoryItem = null;
          state.lastFeedback = fresh.lastFeedback;
          state.sessionStartTime = Date.now();
          state.readingDwellStartTime = Date.now();
          state.totalAttempts = 0;
          state.failedAttempts = 0;
          state.rereadCount = 0;
          state.completedChallengesCount = 0;
          state.hasWonGame = false;
          state.lastAction = null;
        });
        get().loadAdaptedPassage();
      },

      executeAction: (action: PlayerAction) => {
        const state = get();
        const currentChallenge = state.currentChallenge;

        // Special handling for toggle/cycler entities (like Azimuth Dial or Power Switches)
        if (action.type === 'ACTIVATE' && action.targetId === 'azimuth_dial') {
          const currentHeading = state.entities['azimuth_dial']?.states?.heading;
          const nextHeading = currentHeading === 'East' ? 'South' : currentHeading === 'South' ? 'North' : 'East';
          set((draft) => {
            draft.totalAttempts += 1;
            draft.entities['azimuth_dial'].states.heading = nextHeading;
            draft.lastFeedback = {
              type: 'info',
              message: `You rotated the telescope azimuth bearing to face ${nextHeading}.`,
              timestamp: Date.now()
            };
          });
          return;
        }

        // Special handling for Power Switches toggle in Challenge 4
        if (action.type === 'ACTIVATE' && (action.targetId === 'hydro_turbine_switch' || action.targetId === 'solar_bank_switch')) {
          set((draft) => {
            draft.totalAttempts += 1;
            const currentEngaged = Boolean(draft.entities[action.targetId].states.isEngaged);
            draft.entities[action.targetId].states.isEngaged = !currentEngaged;
            draft.lastFeedback = {
              type: 'info',
              message: `You toggled ${draft.entities[action.targetId].name} to ${!currentEngaged ? 'ON' : 'OFF'}.`,
              timestamp: Date.now()
            };
          });
          return;
        }

        TelemetryService.record('ACTION_ATTEMPTED', state.currentChallengeId, {
          action: action.type,
          sourceId: action.sourceId,
          targetId: action.targetId
        });

        // Query active candidate rules matching the action and target
        const relevantRules = ALL_RULES.filter((r) => {
          if (r.challengeId !== state.currentChallengeId) return false;
          if (r.action !== action.type) return false;
          if (r.targetId !== action.targetId) return false;
          if (action.sourceId && r.sourceId !== action.sourceId) return false;
          return true;
        });

        // Categorize rules:
        // "Success" rules have a meaningful onSuccess (feedbackMessage or effects).
        // "Failure detection" rules have empty onSuccess and describe a bad-state
        // whose diagnostic message lives in onFailure.
        const successRules = relevantRules.filter(
          (r) => r.onSuccess.feedbackMessage || r.onSuccess.effects.length > 0
        );
        const failureDetectionRules = relevantRules.filter(
          (r) => !r.onSuccess.feedbackMessage && r.onSuccess.effects.length === 0
        );

        // 1. Try to find a success rule whose conditions all pass
        const passingSuccessRule = successRules.find((r) =>
          r.conditions.every((c) => RuleEvaluator.checkPredicate(c, state))
        );

        // 2. If no success, find a failure-detection rule whose bad-state conditions match
        const matchingFailureRule = !passingSuccessRule
          ? failureDetectionRules.find((r) =>
              r.conditions.every((c) => RuleEvaluator.checkPredicate(c, state))
            )
          : null;

        set((draft) => {

          draft.totalAttempts += 1;

          if (passingSuccessRule) {
            // ── SUCCESS PATH ─────────────────────────────────────────────
            const result = RuleEvaluator.evaluate(passingSuccessRule, state);

            for (const effect of result.effects) {
              if (effect.type === 'SET_ENTITY_STATE' && effect.property) {
                if (draft.entities[effect.target]) {
                  draft.entities[effect.target].states[effect.property] = effect.value;
                }
              } else if (effect.type === 'ADD_INVENTORY') {
                if (!draft.inventory.includes(effect.target)) {
                  draft.inventory.push(effect.target);
                }
              } else if (effect.type === 'REMOVE_INVENTORY') {
                draft.inventory = draft.inventory.filter((id) => id !== effect.target);
              } else if (effect.type === 'SET_FLAG') {
                draft.flags[effect.target] = effect.value;
              }
            }

            draft.lastFeedback = {
              type: 'success',
              message: result.feedback,
              timestamp: Date.now()
            };

            draft.selectedInventoryItem = null;

            TelemetryService.record('ACTION_EVALUATED', draft.currentChallengeId, { passed: true });

            // Check for challenge completion
            const isComplete = RuleEvaluator.isChallengeComplete(currentChallenge.completionCondition, draft as WorldState);
            if (isComplete && !draft.isComplete) {
              draft.isComplete = true;
              draft.completedChallengesCount += 1;
              draft.isEvidenceModalOpen = true; // Phase 3: trigger 'Show Your Proof'

              TelemetryService.record('CHALLENGE_COMPLETE', draft.currentChallengeId, {
                durationMs: Date.now() - draft.readingDwellStartTime,
                attempts: draft.totalAttempts,
                failedAttempts: draft.failedAttempts
              });

              // Phase 2 & 3: Record challenge outcome and update Director
              const skillKey = SKILL_KEY_MAP[currentChallenge.targetReadingSkill];
              if (skillKey) {
                useLearnerStore.getState().recordChallengeResult({
                  challengeId: draft.currentChallengeId,
                  skill: skillKey,
                  attempts: draft.totalAttempts,
                  rereads: draft.rereadCount,
                  hintsUsed: useLearnerStore.getState().getHintLevel(draft.currentChallengeId),
                  completionTimeMs: Date.now() - draft.readingDwellStartTime,
                  firstTrySuccess: draft.failedAttempts === 0
                });

                // Update GameDirector diagnosis
                const profile = useLearnerStore.getState().profile;
                if (profile) {
                  const prescription = GameDirector.diagnoseAndPrescribe(profile, draft.currentChallengeId);
                  useLearnerStore.getState().setDirectorDiagnosis(prescription.statusHeadline, prescription.learnerInsight);
                }
              }
            }

          } else if (matchingFailureRule) {
            // ── FAILURE DETECTION PATH ───────────────────────────────────
            draft.failedAttempts += 1;
            draft.lastFeedback = {
              type: 'failure',
              message: matchingFailureRule.onFailure.feedbackMessage,
              timestamp: Date.now()
            };

            TelemetryService.record('PHYSICAL_CONSEQUENCE_TRIGGERED', draft.currentChallengeId, {
              ruleId: matchingFailureRule.id,
              feedback: matchingFailureRule.onFailure.feedbackMessage,
            });

            // Phase 3: Error Classification for Director
            let errorType: 'temporal_reversal' | 'causal_inversion' | 'ignored_negation' | 'superficial_guessing' = 'causal_inversion';
            if (draft.currentChallengeId === 'challenge_2') {
              errorType = 'temporal_reversal';
              useLearnerStore.getState().recordErrorPattern('temporalReversals');
            } else if (draft.currentChallengeId === 'challenge_3') {
              errorType = 'causal_inversion';
              useLearnerStore.getState().recordErrorPattern('causalInversions');
            } else if (draft.currentChallengeId === 'challenge_4') {
              errorType = 'ignored_negation';
              useLearnerStore.getState().recordErrorPattern('ignoredNegations');
            }

            const profile = useLearnerStore.getState().profile;
            if (profile) {
              const prescription = GameDirector.diagnoseAndPrescribe(profile, draft.currentChallengeId, errorType);
              useLearnerStore.getState().setDirectorDiagnosis(prescription.statusHeadline, prescription.learnerInsight);
            }

            const skillKey = SKILL_KEY_MAP[currentChallenge.targetReadingSkill];
            if (skillKey) {
              useLearnerStore.getState().updateSkill(skillKey, -0.04);
            }

            if (matchingFailureRule.onFailure.effects) {
              for (const eff of matchingFailureRule.onFailure.effects) {
                if (eff.type === 'SET_ENTITY_STATE' && eff.property && draft.entities[eff.target]) {
                  draft.entities[eff.target].states[eff.property] = eff.value;
                }
              }
            }

            TelemetryService.record('ACTION_EVALUATED', draft.currentChallengeId, {
              passed: false,
              feedback: matchingFailureRule.onFailure.feedbackMessage
            });

          } else {
            // ── FALLBACK PATH ────────────────────────────────────────────
            // No success rule passed and no failure-detection rule matched.
            // Try evaluating success rules for their onFailure feedback
            // (e.g. "already done" messages), then failure-detection rules
            // (e.g. Challenge 1's __never_pass__ rules).
            let fallbackHandled = false;

            for (const r of successRules) {
              const result = RuleEvaluator.evaluate(r, state);
              if (!result.passed && result.feedback) {
                draft.failedAttempts += 1;
                draft.lastFeedback = {
                  type: 'failure',
                  message: result.feedback,
                  timestamp: Date.now()
                };

                const skillKey = SKILL_KEY_MAP[currentChallenge.targetReadingSkill];
                if (skillKey) {
                  useLearnerStore.getState().updateSkill(skillKey, -0.04);
                }

                if (r.onFailure.effects) {
                  for (const eff of r.onFailure.effects) {
                    if (eff.type === 'SET_ENTITY_STATE' && eff.property && draft.entities[eff.target]) {
                      draft.entities[eff.target].states[eff.property] = eff.value;
                    }
                  }
                }
                TelemetryService.record('ACTION_EVALUATED', draft.currentChallengeId, { passed: false, feedback: result.feedback });
                fallbackHandled = true;
                break;
              }
            }

            if (!fallbackHandled) {
              for (const r of failureDetectionRules) {
                const result = RuleEvaluator.evaluate(r, state);
                if (!result.passed && result.feedback) {
                  draft.failedAttempts += 1;
                  draft.lastFeedback = {
                    type: 'failure',
                    message: result.feedback,
                    timestamp: Date.now()
                  };

                  const skillKey = SKILL_KEY_MAP[currentChallenge.targetReadingSkill];
                  if (skillKey) {
                    useLearnerStore.getState().updateSkill(skillKey, -0.04);
                  }

                  if (r.onFailure.effects) {
                    for (const eff of r.onFailure.effects) {
                      if (eff.type === 'SET_ENTITY_STATE' && eff.property && draft.entities[eff.target]) {
                        draft.entities[eff.target].states[eff.property] = eff.value;
                      }
                    }
                  }
                  TelemetryService.record('ACTION_EVALUATED', draft.currentChallengeId, { passed: false, feedback: result.feedback });
                  fallbackHandled = true;
                  break;
                }
              }
            }

            if (!fallbackHandled) {
              // Generic messages for completely unmatched actions
              const target = draft.entities[action.targetId];
              const source = action.sourceId ? draft.entities[action.sourceId] : null;
              draft.failedAttempts += 1;

              const skillKey = SKILL_KEY_MAP[currentChallenge.targetReadingSkill];
              if (skillKey) {
                useLearnerStore.getState().updateSkill(skillKey, -0.04);
              }

              TelemetryService.record('ACTION_EVALUATED', draft.currentChallengeId, { passed: false, reason: 'no_rule' });

              if (action.type === 'USE_ITEM_ON' && source && target) {
                draft.lastFeedback = {
                  type: 'failure',
                  message: `You tried using ${source.name} on ${target.name}, but the mechanism does not accept it.`,
                  timestamp: Date.now()
                };
              } else if (action.type === 'INSPECT' && target) {
                draft.lastFeedback = {
                  type: 'info',
                  message: target.description,
                  timestamp: Date.now()
                };
              } else {
                draft.lastFeedback = {
                  type: 'neutral',
                  message: 'Nothing happens.',
                  timestamp: Date.now()
                };
              }
            }
          }
        });
      }
    };
  })
);

// Listen to audience / difficulty / aiEnabled changes in LearnerStore to re-adapt the active challenge passage
let prevAudience = useLearnerStore.getState().profile?.audience;
let prevDiff = useLearnerStore.getState().profile?.readingDifficulty;
let prevAiEnabled = useLearnerStore.getState().profile?.aiEnabled;

useLearnerStore.subscribe((learnerState) => {
  const p = learnerState.profile;
  if (!p) return;
  if (p.audience !== prevAudience || p.readingDifficulty !== prevDiff || p.aiEnabled !== prevAiEnabled) {
    prevAudience = p.audience;
    prevDiff = p.readingDifficulty;
    prevAiEnabled = p.aiEnabled;
    useGameStore.getState().loadAdaptedPassage();
  }
});
