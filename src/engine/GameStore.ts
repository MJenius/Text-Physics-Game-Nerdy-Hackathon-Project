import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { WorldState, PlayerAction, EntityId } from '../types/game';

import { initialEntities, challenge1Rules, challenge1 } from '../content/challenge1';
import { RuleEvaluator } from '../engine/RuleEvaluator';

interface GameStore extends WorldState {
  selectedInventoryItem: EntityId | null;
  readingDwellStartTime: number;
  totalAttempts: number;
  rereadCount: number;
  selectInventoryItem: (id: EntityId | null) => void;
  executeAction: (action: PlayerAction) => void;
  resetCurrentChallenge: () => void;
  recordReread: () => void;
}

const initialWorldState: WorldState = {
  currentLocationId: 'courtyard',
  currentChallengeId: 'challenge_1',
  entities: JSON.parse(JSON.stringify(initialEntities)),
  inventory: ['oxidized_key', 'brass_key'],
  flags: {},
  isComplete: false,
  lastFeedback: {
    type: 'info',
    message: 'Inspect the field journal on the left, then interact with the fixtures on the right.',
    timestamp: Date.now()
  }
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...initialWorldState,
    selectedInventoryItem: null,
    readingDwellStartTime: Date.now(),
    totalAttempts: 0,
    rereadCount: 0,

    selectInventoryItem: (id: EntityId | null) => {
      set((state) => {
        state.selectedInventoryItem = state.selectedInventoryItem === id ? null : id;
      });
    },

    recordReread: () => {
      set((state) => {
        state.rereadCount += 1;
        state.lastFeedback = {
          type: 'info',
          message: 'Reviewing the Field Journal notes...',
          timestamp: Date.now()
        };
      });
    },

    resetCurrentChallenge: () => {
      set((state) => {
        state.entities = JSON.parse(JSON.stringify(initialEntities));
        state.inventory = ['oxidized_key', 'brass_key'];
        state.flags = {};
        state.isComplete = false;
        state.selectedInventoryItem = null;
        state.lastFeedback = {
          type: 'neutral',
          message: 'Courtyard mechanisms reset to initial state.',
          timestamp: Date.now()
        };
      });
    },

    executeAction: (action: PlayerAction) => {
      const state = get();
      const currentChallenge = challenge1; // In Phase 1 spike, active challenge is Challenge 1

      // Find matching rule
      const rule = challenge1Rules.find((r) => {
        if (r.action !== action.type) return false;
        if (r.targetId !== action.targetId) return false;
        if (action.sourceId && r.sourceId !== action.sourceId) return false;
        return true;
      });

      set((draft) => {
        draft.totalAttempts += 1;

        if (!rule) {
          // No rule defined for this combination
          const target = draft.entities[action.targetId];
          const source = action.sourceId ? draft.entities[action.sourceId] : null;
          
          if (action.type === 'USE_ITEM_ON' && source && target) {
            draft.lastFeedback = {
              type: 'failure',
              message: `You tried using ${source.name} on ${target.name}, but nothing happened.`,
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

        // Evaluate rule
        const result = RuleEvaluator.evaluate(rule, state);

        if (result.passed) {
          // Apply effects
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

          // Deselect used item
          draft.selectedInventoryItem = null;

          // Check for challenge completion
          const isComplete = RuleEvaluator.isChallengeComplete(currentChallenge.completionCondition, draft as WorldState);
          if (isComplete) {
            draft.isComplete = true;
          }
        } else {
          // Action failed natural condition
          draft.lastFeedback = {
            type: 'failure',
            message: result.feedback,
            timestamp: Date.now()
          };
        }
      });
    }
  }))
);
