import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  WorldState,
  PlayerAction,
  EntityId,
  Challenge,
  InteractionArchetype,
  NarrativeWorldState
} from '../types/game';
import {
  CAMPAIGN_SCENES,
  ALL_CAMPAIGN_RULES,
  ACT1_ENTITIES,
  ACT2_ARCHIVE_ENTITIES,
  ACT2_HYDRAULIC_ENTITIES,
  ACT3_ENTITIES,
  ACT4_ENTITIES,
  ACT5_ENTITIES,
  ACT7_ENTITIES
} from '../content/storyCampaign';
import { ALL_SCHEMAS } from '../content/challengeSchemas';
import { getFallbackPassage } from '../content/fallbackPassages';
import { generatePassage, isAIAvailable, getCachedPassage } from './AIContentService';
import { getDifficultyConstraints } from './DifficultyEngine';
import { useLearnerStore } from './LearnerStore';
import { SKILL_KEY_MAP } from '../types/learner';
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
  isEvidenceModalOpen: boolean;
  isNotebookOpen: boolean;
  isTransferModeActive: boolean;
  returnSceneId: string;

  // Actions
  selectInventoryItem: (id: EntityId | null) => void;
  executeAction: (action: PlayerAction) => void;
  executeDecision: (decisionId: string) => void;
  transitionToScene: (sceneId: string) => void;
  resetCurrentChallenge: () => void;
  recordReread: () => void;
  advanceToNextChallenge: () => void;
  restartFullGame: () => void;
  loadAdaptedPassage: () => Promise<void>;
  openEvidenceModal: () => void;
  closeEvidenceModal: () => void;
  openNotebook: () => void;
  closeNotebook: () => void;
  clearPhysicalConsequence: () => void;
  loadHeroTransferScenario: () => void;
  exitHeroTransferScenario: () => void;
  simulateWeaknessProfile: (weakness: 'causal_inversion' | 'temporal_reversal' | 'ignored_negation') => void;
  jumpToAct: (actNumber: number) => void;
}

const INITIAL_NARRATIVE: NarrativeWorldState = {
  discoveredFacts: [
    'The Lost Observatory was evacuated during a mysterious celestial alignment.',
    'Senior Curator Sterling and Chief Machinist Aris secured the facility with sequential interlocks.'
  ],
  visitedLocations: ['courtyard'],
  obtainedItems: ['iron_key'],
  poweredSystems: [],
  triggeredEvents: [],
  characterRelationships: {
    aris: 50,
    sterling: 50,
    vale: 50
  },
  playerDecisions: {},
  knownWorldRules: [
    'Counterweighted portals require all locks disengaged before actuation.',
    'Copper boiler jackets require flooded water coolant before combustion.',
    'Dynamos have a strict 100 kW load ceiling on emergency reserve.'
  ],
  narrativeFlags: {},
  currentObjective: {
    id: 'obj_vestibule',
    title: 'Unseal the Mountain Vestibule',
    description: 'Examine Curator Sterling’s field journal to disengage both locks without damaging the antique pivots.',
    hint: 'Disengage the upper brass latch by hand, and unlock the iron bolt with the gatekeeper key.'
  },
  availableLocations: ['courtyard']
};

const getSceneEntities = (sceneId: string): Record<string, any> => {
  switch (sceneId) {
    case 'act_1_vestibule':
      return JSON.parse(JSON.stringify(ACT1_ENTITIES));
    case 'act_2_archive':
      return JSON.parse(JSON.stringify(ACT2_ARCHIVE_ENTITIES));
    case 'act_2_hydraulics':
      return JSON.parse(JSON.stringify(ACT2_HYDRAULIC_ENTITIES));
    case 'act_3_junction':
      return JSON.parse(JSON.stringify(ACT3_ENTITIES));
    case 'act_4_navigation':
      return JSON.parse(JSON.stringify(ACT4_ENTITIES));
    case 'act_5_adaptive':
      return JSON.parse(JSON.stringify(ACT5_ENTITIES));
    case 'act_7_dome':
      return JSON.parse(JSON.stringify(ACT7_ENTITIES));
    default:
      return JSON.parse(JSON.stringify(ACT1_ENTITIES));
  }
};

const getInitialSceneState = (sceneId: string = 'act_1_vestibule') => {
  const challenge = CAMPAIGN_SCENES[sceneId] || CAMPAIGN_SCENES['act_1_vestibule'];
  const entities = getSceneEntities(challenge.id);
  const inventory = ['iron_key'];

  return {
    currentChallengeIndex: challenge.order - 1,
    currentChallenge: challenge,
    currentLocationId: challenge.locationId,
    currentChallengeId: challenge.id,
    activeArchetype: challenge.archetype || ('MECHANISM' as InteractionArchetype),
    currentAct: challenge.act || 1,
    entities,
    inventory,
    flags: {},
    narrative: JSON.parse(JSON.stringify(INITIAL_NARRATIVE)),
    isComplete: false,
    selectedInventoryItem: null,
    physicalConsequence: undefined,
    lastFeedback: {
      type: 'info' as const,
      message: `Entered ${challenge.title}. Consult the Field Journal and documents to formulate your interpretation.`,
      timestamp: Date.now()
    }
  };
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => {
    TelemetryService.init();

    return {
      ...getInitialSceneState('act_1_vestibule'),
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
      isNotebookOpen: false,
      isTransferModeActive: false,
      returnSceneId: 'act_1_vestibule',

      openNotebook: () => {
        set((state) => {
          state.isNotebookOpen = true;
          TelemetryService.record('NOTEBOOK_OPENED', state.currentChallengeId);
        });
      },

      closeNotebook: () => {
        set((state) => {
          state.isNotebookOpen = false;
        });
      },

      clearPhysicalConsequence: () => {
        set((state) => {
          state.physicalConsequence = undefined;
        });
      },

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

      selectInventoryItem: (id: EntityId | null) => {
        set((state) => {
          state.selectedInventoryItem = state.selectedInventoryItem === id ? null : id;
        });
      },

      recordReread: () => {
        set((state) => {
          state.rereadCount += 1;
        });
        useLearnerStore.getState().updateSkill('literalRetrieval', 0.02);
        TelemetryService.record('REREAD_RECORDED', get().currentChallengeId);
      },

      executeDecision: (decisionId: string) => {
        const state = get();
        const decision = state.currentChallenge.availableDecisions?.find((d) => d.id === decisionId);
        if (!decision) return;

        set((draft) => {
          // Execute all effects associated with this meaningful player decision
          for (const effect of decision.effects) {
            if (effect.type === 'RECORD_DECISION') {
              draft.narrative.playerDecisions[effect.target] = {
                value: effect.value,
                rationale: effect.rationale,
                timestamp: Date.now(),
                act: draft.currentAct
              };
            } else if (effect.type === 'POWER_SYSTEM') {
              if (!draft.narrative.poweredSystems.includes(effect.target as any)) {
                draft.narrative.poweredSystems.push(effect.target as any);
              }
            } else if (effect.type === 'DISCOVER_FACT') {
              if (!draft.narrative.discoveredFacts.includes(effect.value as string)) {
                draft.narrative.discoveredFacts.push(effect.value as string);
              }
            } else if (effect.type === 'SET_FLAG') {
              draft.flags[effect.target] = effect.value;
            }
          }

          draft.lastFeedback = {
            type: 'info',
            message: `Decision Committed: ${decision.label}. The world state updates accordingly.`,
            timestamp: Date.now()
          };

          draft.physicalConsequence = {
            visualEffect: 'gear_shudder',
            description: decision.downstreamHint,
            timestamp: Date.now()
          };

          TelemetryService.record('MEANINGFUL_DECISION_COMMITTED', draft.currentChallengeId, {
            decisionId,
            label: decision.label,
            rationale: decision.rationaleWhy
          });
        });

        // If this decision contains a scene transition effect, transition seamlessly!
        const transitionEffect = decision.effects.find((e) => e.type === 'TRANSITION_SCENE');
        if (transitionEffect && typeof transitionEffect.target === 'string') {
          setTimeout(() => {
            get().transitionToScene(transitionEffect.target);
          }, 400);
        }
      },

      transitionToScene: (sceneId: string) => {
        const nextScene = CAMPAIGN_SCENES[sceneId];
        if (!nextScene) return;

        set((draft) => {
          draft.currentChallengeId = nextScene.id;
          draft.currentChallenge = nextScene;
          draft.currentLocationId = nextScene.locationId;
          draft.currentAct = nextScene.act || draft.currentAct;
          draft.activeArchetype = nextScene.archetype || 'MECHANISM';
          draft.isComplete = false;
          draft.selectedInventoryItem = null;
          draft.readingDwellStartTime = Date.now();

          // Merge newly revealed scene entities while retaining current inventory items
          const freshEntities = getSceneEntities(sceneId);
          draft.entities = freshEntities;

          // Provide essential narrative items if entering Act 5 or Act 7
          if (sceneId === 'act_5_adaptive' && !draft.inventory.includes('replacement_shunt')) {
            draft.inventory.push('replacement_shunt');
            if (!draft.narrative.obtainedItems.includes('replacement_shunt')) {
              draft.narrative.obtainedItems.push('replacement_shunt');
            }
          }
          if (sceneId === 'act_7_dome' && !draft.inventory.includes('quartz_prism') && !freshEntities['quartz_receptacle']?.states?.hasPrism) {
            draft.inventory.push('quartz_prism');
            if (!draft.narrative.obtainedItems.includes('quartz_prism')) {
              draft.narrative.obtainedItems.push('quartz_prism');
            }
          }

          // Track visited locations
          if (!draft.narrative.visitedLocations.includes(nextScene.locationId)) {
            draft.narrative.visitedLocations.push(nextScene.locationId);
          }

          // Update objective
          draft.narrative.currentObjective = {
            id: `obj_${sceneId}`,
            title: nextScene.title,
            description: nextScene.passage.heading,
            hint: nextScene.passage.keyClues?.[0]
          };

          draft.lastFeedback = {
            type: 'info',
            message: `Entered ${nextScene.title}. The consequences of your prior deductions linger in the machinery.`,
            timestamp: Date.now()
          };

          draft.physicalConsequence = undefined;
          TelemetryService.record('SCENE_TRANSITIONED', sceneId, { act: nextScene.act });
        });

        get().loadAdaptedPassage();
      },

      advanceToNextChallenge: () => {
        const state = get();
        const currentScene = state.currentChallenge;

        // If scene has explicit branching decisions, player must select a decision!
        if (currentScene.availableDecisions && currentScene.availableDecisions.length > 0) {
          set((draft) => {
            draft.lastFeedback = {
              type: 'info',
              message: 'Make your strategic route choice below to proceed.',
              timestamp: Date.now()
            };
          });
          return;
        }

        // Automatic story arc progression
        let nextSceneId = 'act_7_dome';
        if (currentScene.id === 'act_1_vestibule') {
          nextSceneId = state.narrative.playerDecisions['act1_path_choice']?.value === 'hydraulics'
            ? 'act_2_hydraulics'
            : 'act_2_archive';
        } else if (currentScene.id === 'act_2_archive' || currentScene.id === 'act_2_hydraulics') {
          nextSceneId = 'act_3_junction';
        } else if (currentScene.id === 'act_3_junction') {
          nextSceneId = 'act_4_navigation';
        } else if (currentScene.id === 'act_4_navigation') {
          nextSceneId = 'act_5_adaptive';
        } else if (currentScene.id === 'act_5_adaptive') {
          nextSceneId = 'act_7_dome';
        }

        get().transitionToScene(nextSceneId);
      },

      resetCurrentChallenge: () => {
        const state = get();
        const sceneId = state.currentChallengeId;
        const freshEntities = getSceneEntities(sceneId);

        set((draft) => {
          draft.entities = freshEntities;
          draft.isComplete = false;
          draft.selectedInventoryItem = null;
          draft.physicalConsequence = undefined;
          draft.lastFeedback = {
            type: 'neutral',
            message: `Mechanism reset to neutral configuration. Review the text carefully before acting.`,
            timestamp: Date.now()
          };
          draft.readingDwellStartTime = Date.now();
        });
      },

      restartFullGame: () => {
        const fresh = getInitialSceneState('act_1_vestibule');
        set((draft) => {
          Object.assign(draft, fresh);
          draft.sessionStartTime = Date.now();
          draft.readingDwellStartTime = Date.now();
          draft.totalAttempts = 0;
          draft.failedAttempts = 0;
          draft.rereadCount = 0;
          draft.completedChallengesCount = 0;
          draft.hasWonGame = false;
          draft.lastAction = null;
          draft.isTransferModeActive = false;
          draft.isNotebookOpen = false;
        });
        get().loadAdaptedPassage();
      },

      loadHeroTransferScenario: () => {
        set((state) => {
          state.returnSceneId = state.currentChallengeId;
          state.isTransferModeActive = true;
          state.currentChallengeId = TRITON_TRANSFER_SCENARIO.id;
          state.currentChallenge = {
            id: TRITON_TRANSFER_SCENARIO.id,
            order: 99,
            act: 6,
            title: TRITON_TRANSFER_SCENARIO.title,
            locationId: 'submersible_delta',
            archetype: 'INVESTIGATION',
            passage: TRITON_TRANSFER_SCENARIO.passage,
            targetReadingSkill: 'cause_effect',
            ruleIds: TRITON_TRANSFER_SCENARIO.rules.map((r) => r.id),
            completionCondition: TRITON_TRANSFER_SCENARIO.completionConditions,
            completedMessage: 'Transfer Verified! Deep-Sea Geothermal Thermal Runaway Neutralized!'
          };
          state.entities = JSON.parse(JSON.stringify(TRITON_TRANSFER_SCENARIO.entities));
          state.flags = {};
          state.isComplete = false;
          state.selectedInventoryItem = null;
          state.physicalConsequence = undefined;
          state.lastFeedback = {
            type: 'info',
            message: 'Deep-Sea Crisis Active: Read Vance’s incident report to resolve vapor lock before firing pumps.',
            timestamp: Date.now()
          };
          state.readingDwellStartTime = Date.now();
          TelemetryService.record('HERO_TRANSFER_SCENARIO_LOADED', TRITON_TRANSFER_SCENARIO.id);
        });
      },

      exitHeroTransferScenario: () => {
        const state = get();
        const returnId = state.returnSceneId || 'act_1_vestibule';
        set((draft) => {
          draft.isTransferModeActive = false;
        });
        get().transitionToScene(returnId);
      },

      simulateWeaknessProfile: (weakness: 'causal_inversion' | 'temporal_reversal' | 'ignored_negation') => {
        useLearnerStore.getState().recordErrorPattern(
          weakness === 'causal_inversion'
            ? 'causalInversions'
            : weakness === 'temporal_reversal'
            ? 'temporalReversals'
            : 'ignoredNegations'
        );
        const profile = useLearnerStore.getState().profile;
        if (profile) {
          const prescription = GameDirector.diagnoseAndPrescribe(profile, get().currentChallengeId, weakness);
          useLearnerStore.getState().setDirectorDiagnosis(prescription.statusHeadline, prescription.learnerInsight);
        }
      },

      jumpToAct: (actNumber: number) => {
        const targetSceneMap: Record<number, string> = {
          1: 'act_1_vestibule',
          2: 'act_2_archive',
          3: 'act_3_junction',
          4: 'act_4_navigation',
          5: 'act_5_adaptive',
          6: 'hero_triton_transfer',
          7: 'act_7_dome'
        };
        const targetSceneId = targetSceneMap[actNumber];
        if (targetSceneId === 'hero_triton_transfer') {
          get().loadHeroTransferScenario();
        } else if (targetSceneId) {
          if (get().isTransferModeActive) {
            set((draft) => {
              draft.isTransferModeActive = false;
            });
          }
          get().transitionToScene(targetSceneId);
        }
      },

      loadAdaptedPassage: async () => {
        const state = get();
        const learner = useLearnerStore.getState().profile;
        if (!learner) return;

        const challenge = state.currentChallenge;
        const schema = ALL_SCHEMAS[challenge.id];
        const isAIOn = learner.aiEnabled !== false;

        // Instant deterministic fallback
        const deterministicFallback = getFallbackPassage(
          challenge.id,
          learner.readingDifficulty,
          learner.audience,
          challenge.passage
        );

        if (!isAIOn || !isAIAvailable() || !schema) {
          set((draft) => {
            draft.currentChallenge.adaptedPassage = deterministicFallback;
            draft.isPassageGenerating = false;
          });
          return;
        }

        const cached = getCachedPassage(challenge.id, learner.audience, learner.readingDifficulty);
        if (cached) {
          set((draft) => {
            draft.currentChallenge.adaptedPassage = cached;
            draft.isPassageGenerating = false;
          });
          return;
        }

        set((draft) => {
          draft.currentChallenge.adaptedPassage = deterministicFallback;
          draft.isPassageGenerating = true;
        });

        const constraints = getDifficultyConstraints(learner.audience, learner.readingDifficulty);
        generatePassage(schema, constraints, learner.audience, learner.readingDifficulty)
          .then((generated) => {
            if (generated) {
              set((draft) => {
                draft.currentChallenge.adaptedPassage = generated;
                draft.isPassageGenerating = false;
              });
            } else {
              set((draft) => {
                draft.isPassageGenerating = false;
              });
            }
          })
          .catch(() => {
            set((draft) => {
              draft.isPassageGenerating = false;
            });
          });
      },

      executeAction: (action: PlayerAction) => {
        const state = get();
        const currentChallenge = state.currentChallenge;

        // 1. Tactile Neutral Rotary / Toggle Handling (Zero-Solution-State Feedback)
        // Azimuth Dial (Act VII): East -> South -> North -> East (Neutral text, NO green indicator!)
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
            draft.physicalConsequence = {
              visualEffect: 'gear_shudder',
              description: `Bearing rotated to ${nextHeading}.`,
              timestamp: Date.now()
            };
          });
          return;
        }

        // Curator Safe Dial (Act II-A): Cycles 0 through 9 (Neutral dial, NO green indicator!)
        if (action.type === 'ACTIVATE' && action.targetId === 'curator_safe') {
          const currentDial = (state.entities['curator_safe']?.states?.dialPosition as number) || 0;
          const nextDial = (currentDial + 1) % 10;
          set((draft) => {
            draft.totalAttempts += 1;
            draft.entities['curator_safe'].states.dialPosition = nextDial;
            draft.lastFeedback = {
              type: 'info',
              message: `Tumbler dial adjusted to position [${nextDial}].`,
              timestamp: Date.now()
            };
          });
          return;
        }

        // Power Switches (Act III): Mutual exclusion check with physical breaker trip!
        if (action.type === 'ACTIVATE' && (action.targetId === 'archive_power_switch' || action.targetId === 'hydraulic_power_switch')) {
          set((draft) => {
            draft.totalAttempts += 1;
            const targetEntity = draft.entities[action.targetId];
            const otherTargetId = action.targetId === 'archive_power_switch' ? 'hydraulic_power_switch' : 'archive_power_switch';
            const otherEntity = draft.entities[otherTargetId];

            const willBeEngaged = !Boolean(targetEntity.states.isEngaged);
            targetEntity.states.isEngaged = willBeEngaged;

            // Check if BOTH switches are engaged simultaneously (Exclusion breach: 80kW + 80kW = 160kW > 100kW!)
            if (willBeEngaged && otherEntity?.states.isEngaged) {
              // Trip the master breaker immediately with consequence!
              targetEntity.states.isEngaged = false;
              otherEntity.states.isEngaged = false;
              draft.failedAttempts += 1;
              draft.lastFeedback = {
                type: 'failure',
                message: 'BZZZZT-CLACK! Total load surged to 160 kW! The magnetic master breaker trips with a shower of copper sparks.',
                timestamp: Date.now()
              };
              draft.physicalConsequence = {
                visualEffect: 'circuit_spark',
                description: 'Circuit breaker overload! Both breakers tripped.',
                timestamp: Date.now(),
                isError: true
              };
              useLearnerStore.getState().recordErrorPattern('ignoredNegations');
              const profile = useLearnerStore.getState().profile;
              if (profile) {
                const prescription = GameDirector.diagnoseAndPrescribe(profile, draft.currentChallengeId, 'ignored_negation');
                useLearnerStore.getState().setDirectorDiagnosis(prescription.statusHeadline, prescription.learnerInsight);
              }
              return;
            }

            // Normal toggle
            draft.lastFeedback = {
              type: 'info',
              message: `${targetEntity.name} is now ${willBeEngaged ? 'ENGAGED' : 'DISENGAGED'}.`,
              timestamp: Date.now()
            };
            draft.flags['act3_power_committed'] = willBeEngaged;
            draft.physicalConsequence = {
              visualEffect: 'gear_shudder',
              description: `${targetEntity.name} ${willBeEngaged ? 'engaged' : 'disengaged'}.`,
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

        // 2. Query Candidate Rules
        const allAvailableRules = state.isTransferModeActive
          ? [...TRITON_TRANSFER_SCENARIO.rules]
          : ALL_CAMPAIGN_RULES;

        const relevantRules = allAvailableRules.filter((r) => {
          if (r.challengeId !== state.currentChallengeId) return false;
          if (r.action !== action.type) return false;
          if (r.targetId !== action.targetId) return false;
          if (action.sourceId && r.sourceId !== action.sourceId) return false;
          return true;
        });

        const successRules = relevantRules.filter(
          (r) => r.onSuccess.feedbackMessage || r.onSuccess.effects.length > 0
        );
        const failureDetectionRules = relevantRules.filter(
          (r) => !r.onSuccess.feedbackMessage && r.onSuccess.effects.length === 0
        );

        const passingSuccessRule = successRules.find((r) =>
          r.conditions.every((c) => RuleEvaluator.checkPredicate(c, state))
        );

        const matchingFailureRule = !passingSuccessRule
          ? failureDetectionRules.find((r) =>
              r.conditions.every((c) => RuleEvaluator.checkPredicate(c, state))
            )
          : null;

        set((draft) => {
          draft.totalAttempts += 1;

          if (passingSuccessRule) {
            // ── SUCCESS CONVOLUTION ─────────────────────────────────────
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
                if (!draft.narrative.obtainedItems.includes(effect.target)) {
                  draft.narrative.obtainedItems.push(effect.target);
                }
              } else if (effect.type === 'REMOVE_INVENTORY') {
                draft.inventory = draft.inventory.filter((id) => id !== effect.target);
              } else if (effect.type === 'SET_FLAG') {
                draft.flags[effect.target] = effect.value;
              } else if (effect.type === 'DISCOVER_FACT') {
                if (!draft.narrative.discoveredFacts.includes(effect.value as string)) {
                  draft.narrative.discoveredFacts.push(effect.value as string);
                }
              } else if (effect.type === 'RECORD_DECISION') {
                draft.narrative.playerDecisions[effect.target] = {
                  value: effect.value,
                  rationale: effect.rationale,
                  timestamp: Date.now(),
                  act: draft.currentAct
                };
              }
            }

            draft.lastFeedback = {
              type: 'info',
              message: result.feedback,
              timestamp: Date.now()
            };

            draft.physicalConsequence = {
              visualEffect: result.consequenceVisual || 'gear_shudder',
              description: result.feedback,
              timestamp: Date.now()
            };

            draft.selectedInventoryItem = null;
            TelemetryService.record('ACTION_EVALUATED', draft.currentChallengeId, { passed: true });

            // Check completion
            const isComplete = RuleEvaluator.isChallengeComplete(currentChallenge.completionCondition, draft as WorldState);
            if (isComplete && !draft.isComplete) {
              draft.isComplete = true;
              draft.completedChallengesCount += 1;

              if (draft.currentChallengeId === 'act_7_dome') {
                draft.hasWonGame = true;
              }

              TelemetryService.record('SCENE_COMPLETE', draft.currentChallengeId, {
                durationMs: Date.now() - draft.readingDwellStartTime,
                attempts: draft.totalAttempts
              });

              // Update skills
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

                const profile = useLearnerStore.getState().profile;
                if (profile) {
                  const prescription = GameDirector.diagnoseAndPrescribe(profile, draft.currentChallengeId);
                  useLearnerStore.getState().setDirectorDiagnosis(prescription.statusHeadline, prescription.learnerInsight);
                }
              }
            }

          } else if (matchingFailureRule) {
            // ── FAILURE DETECTION PATH (CONSEQUENCE ENGINE) ──────────────
            draft.failedAttempts += 1;
            draft.lastFeedback = {
              type: 'failure',
              message: matchingFailureRule.onFailure.feedbackMessage,
              timestamp: Date.now()
            };

            draft.physicalConsequence = {
              visualEffect: matchingFailureRule.onFailure.consequenceVisual || 'steam_burst',
              description: matchingFailureRule.onFailure.feedbackMessage,
              timestamp: Date.now(),
              isError: true
            };

            // Classify error pattern
            let errorType: 'causal_inversion' | 'temporal_reversal' | 'ignored_negation' | 'superficial_guessing' = 'causal_inversion';
            if (draft.currentChallengeId === 'act_2_hydraulics' || draft.currentChallengeId === 'hero_triton_transfer') {
              errorType = 'causal_inversion';
              useLearnerStore.getState().recordErrorPattern('causalInversions');
            } else if (draft.currentChallengeId === 'act_1_vestibule') {
              errorType = 'temporal_reversal';
              useLearnerStore.getState().recordErrorPattern('temporalReversals');
            } else if (draft.currentChallengeId === 'act_3_junction') {
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

            TelemetryService.record('PHYSICAL_CONSEQUENCE_TRIGGERED', draft.currentChallengeId, {
              ruleId: matchingFailureRule.id,
              feedback: matchingFailureRule.onFailure.feedbackMessage
            });

          } else {
            // ── FALLBACK PATH ────────────────────────────────────────────
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
                draft.physicalConsequence = {
                  visualEffect: result.consequenceVisual || 'gear_shudder',
                  description: result.feedback,
                  timestamp: Date.now(),
                  isError: true
                };
                fallbackHandled = true;
                break;
              }
            }

            if (!fallbackHandled) {
              const target = draft.entities[action.targetId];
              const source = action.sourceId ? draft.entities[action.sourceId] : null;
              draft.failedAttempts += 1;

              if (action.type === 'USE_ITEM_ON' && source && target) {
                draft.lastFeedback = {
                  type: 'failure',
                  message: `You applied ${source.name} to ${target.name}, but the fitting does not accept it.`,
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
                  message: 'The mechanism does not respond to that action.',
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
