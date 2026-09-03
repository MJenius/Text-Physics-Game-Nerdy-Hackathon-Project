import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Audience,
  ReadingDifficulty,
  ReadingSkill,
  LearnerProfile,
} from '../types/learner';
import { DEFAULT_SKILLS } from '../types/learner';
import { TelemetryService } from './Telemetry';

// ============================================================================
// LEARNER PROFILE STORE (Phase 2)
// Persisted to localStorage. Manages audience, difficulty, skills, session stats.
// ============================================================================

const STORAGE_KEY = 'text_physics_learner';

function loadFromStorage(): LearnerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as LearnerProfile;
  } catch {
    // Ignore corrupted data
  }
  return null;
}

function saveToStorage(profile: LearnerProfile | null) {
  try {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore quota/access errors
  }
}

interface LearnerStore {
  profile: LearnerProfile | null;
  isOnboarded: boolean;
  /** Per-challenge hint level tracking (challengeId → current hint index 0/1/2) */
  hintLevels: Record<string, number>;

  // Actions
  completeOnboarding: (audience: Audience, difficulty: ReadingDifficulty) => void;
  setAudience: (audience: Audience) => void;
  setDifficulty: (difficulty: ReadingDifficulty) => void;
  updateSkill: (skill: ReadingSkill, delta: number) => void;
  recordChallengeResult: (data: {
    challengeId: string;
    skill: ReadingSkill;
    attempts: number;
    rereads: number;
    hintsUsed: number;
    completionTimeMs: number;
    firstTrySuccess: boolean;
  }) => void;
  getHintLevel: (challengeId: string) => number;
  incrementHint: (challengeId: string) => number;
  resetHintsForChallenge: (challengeId: string) => void;
  resetProfile: () => void;
}

export const useLearnerStore = create<LearnerStore>()(
  immer((set, get) => {
    const saved = loadFromStorage();

    return {
      profile: saved,
      isOnboarded: saved !== null,
      hintLevels: {},

      completeOnboarding: (audience: Audience, difficulty: ReadingDifficulty) => {
        set((state) => {
          const now = Date.now();
          state.profile = {
            audience,
            readingDifficulty: difficulty,
            skills: { ...DEFAULT_SKILLS },
            sessionStats: {
              challengesCompleted: 0,
              totalAttempts: 0,
              totalRereads: 0,
              totalHintsUsed: 0,
              averageCompletionTimeMs: 0,
            },
            createdAt: now,
            updatedAt: now,
          };
          state.isOnboarded = true;
          saveToStorage(state.profile);
          TelemetryService.record('PROFILE_SELECTED', 'onboarding', {
            audience,
            readingDifficulty: difficulty,
          });
        });
      },

      setAudience: (audience: Audience) => {
        set((state) => {
          if (state.profile) {
            state.profile.audience = audience;
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
            TelemetryService.record('READING_LEVEL_SELECTED', 'settings', { audience });
          }
        });
      },

      setDifficulty: (difficulty: ReadingDifficulty) => {
        set((state) => {
          if (state.profile) {
            state.profile.readingDifficulty = difficulty;
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
            TelemetryService.record('READING_LEVEL_SELECTED', 'settings', { readingDifficulty: difficulty });
          }
        });
      },

      updateSkill: (skill: ReadingSkill, delta: number) => {
        set((state) => {
          if (state.profile) {
            const current = state.profile.skills[skill];
            state.profile.skills[skill] = Math.max(0, Math.min(1, current + delta));
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
            TelemetryService.record('SKILL_UPDATED', 'engine', {
              skill,
              delta,
              newValue: state.profile.skills[skill],
            });
          }
        });
      },

      recordChallengeResult: (data) => {
        set((state) => {
          if (!state.profile) return;

          const stats = state.profile.sessionStats;
          const prevTotal = stats.challengesCompleted;

          stats.challengesCompleted += 1;
          stats.totalAttempts += data.attempts;
          stats.totalRereads += data.rereads;
          stats.totalHintsUsed += data.hintsUsed;

          // Rolling average for completion time
          stats.averageCompletionTimeMs = prevTotal > 0
            ? (stats.averageCompletionTimeMs * prevTotal + data.completionTimeMs) / (prevTotal + 1)
            : data.completionTimeMs;

          // Skill update based on performance
          let skillDelta: number;
          if (data.firstTrySuccess) {
            skillDelta = 0.10;
          } else if (data.rereads > 0 && data.hintsUsed === 0) {
            skillDelta = 0.06;
          } else if (data.hintsUsed > 0) {
            skillDelta = 0.03;
          } else {
            skillDelta = 0.06; // completed but after failures, no hints
          }

          const current = state.profile.skills[data.skill];
          state.profile.skills[data.skill] = Math.max(0, Math.min(1, current + skillDelta));

          state.profile.updatedAt = Date.now();
          saveToStorage(state.profile);
        });
      },

      getHintLevel: (challengeId: string) => {
        return get().hintLevels[challengeId] ?? 0;
      },

      incrementHint: (challengeId: string) => {
        let newLevel = 0;
        set((state) => {
          const current = state.hintLevels[challengeId] ?? 0;
          newLevel = Math.min(current + 1, 2); // max 3 levels (0, 1, 2)
          state.hintLevels[challengeId] = newLevel;
          if (state.profile) {
            state.profile.sessionStats.totalHintsUsed += 1;
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
          }
          TelemetryService.record('HINT_USED', challengeId, { hintLevel: newLevel });
        });
        return newLevel;
      },

      resetHintsForChallenge: (challengeId: string) => {
        set((state) => {
          state.hintLevels[challengeId] = 0;
        });
      },

      resetProfile: () => {
        set((state) => {
          state.profile = null;
          state.isOnboarded = false;
          state.hintLevels = {};
          saveToStorage(null);
        });
      },
    };
  })
);
