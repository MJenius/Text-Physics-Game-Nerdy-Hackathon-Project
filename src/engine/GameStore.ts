import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorldState, PlayerAction, EntityId, Challenge } from '../types/game';
import { ALL_CHALLENGES, ALL_INITIAL_ENTITIES, ALL_INITIAL_INVENTORY, ALL_RULES } from '../content/allChallenges';
import { RuleEvaluator } from './RuleEvaluator';
import { TelemetryService } from './Telemetry';

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

  selectInventoryItem: (id: EntityId | null) => void;
  executeAction: (action: PlayerAction) => void;
  resetCurrentChallenge: () => void;
  recordReread: () => void;
  advanceToNextChallenge: () => void;
  restartFullGame: () => void;
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
        });
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

        // Find the rule that passes, or default to the first candidate for diagnostic failure feedback
        const passingRule = relevantRules.find((r) => {
          return r.conditions.every((c) => RuleEvaluator.checkPredicate(c, state));
        });
        const rule = passingRule || relevantRules[0];

        set((draft) => {

          draft.totalAttempts += 1;

          if (!rule) {
            const target = draft.entities[action.targetId];
            const source = action.sourceId ? draft.entities[action.sourceId] : null;

            draft.failedAttempts += 1;
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
            return;
          }

          // Evaluate deterministic rule
          const result = RuleEvaluator.evaluate(rule, state);

          if (result.passed) {
            // Apply mutations
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
              TelemetryService.record('CHALLENGE_COMPLETE', draft.currentChallengeId, {
                durationMs: Date.now() - draft.readingDwellStartTime,
                attempts: draft.totalAttempts,
                failedAttempts: draft.failedAttempts
              });
            }
          } else {
            draft.failedAttempts += 1;
            draft.lastFeedback = {
              type: 'failure',
              message: result.feedback,
              timestamp: Date.now()
            };

            // Apply failure side effects if defined (e.g. tripping breakers back to false)
            if (rule.onFailure.effects) {
              for (const eff of rule.onFailure.effects) {
                if (eff.type === 'SET_ENTITY_STATE' && eff.property && draft.entities[eff.target]) {
                  draft.entities[eff.target].states[eff.property] = eff.value;
                }
              }
            }

            TelemetryService.record('ACTION_EVALUATED', draft.currentChallengeId, {
              passed: false,
              feedback: result.feedback
            });
          }
        });
      }
    };
  })
);
