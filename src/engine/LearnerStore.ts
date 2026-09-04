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

export const DEFAULT_CONFIDENCE: Record<ReadingSkill, number> = {
  literalRetrieval: 0.3,
  sequencing: 0.3,
  causeEffect: 0.3,
  negativeConstraint: 0.3,
  multiCondition: 0.3,
  inference: 0.3,
  synthesis: 0.3,
  transfer: 0.25,
};

export const DEFAULT_EVIDENCE_COUNTS: Record<ReadingSkill, number> = {
  literalRetrieval: 0,
  sequencing: 0,
  causeEffect: 0,
  negativeConstraint: 0,
  multiCondition: 0,
  inference: 0,
  synthesis: 0,
  transfer: 0,
};

export const DEFAULT_SKILL_DETAILS: Record<ReadingSkill, import('../types/learner').SkillDetail> = {
  literalRetrieval: { score: 0.5, confidence: 0.3, recentEvidence: [], trend: 'stable' },
  sequencing: { score: 0.5, confidence: 0.3, recentEvidence: [], trend: 'stable' },
  causeEffect: { score: 0.5, confidence: 0.3, recentEvidence: [], trend: 'stable' },
  negativeConstraint: { score: 0.5, confidence: 0.3, recentEvidence: [], trend: 'stable' },
  multiCondition: { score: 0.5, confidence: 0.3, recentEvidence: [], trend: 'stable' },
  inference: { score: 0.5, confidence: 0.3, recentEvidence: [], trend: 'stable' },
  synthesis: { score: 0.5, confidence: 0.3, recentEvidence: [], trend: 'stable' },
  transfer: { score: 0.5, confidence: 0.25, recentEvidence: [], trend: 'stable' },
};

export const DEFAULT_MISCONCEPTIONS: Record<import('../types/learner').MisconceptionId, import('../types/learner').MisconceptionDetail> = {
  temporal_reversal: { probability: 0.1, evidenceCount: 0 },
  causal_inversion: { probability: 0.1, evidenceCount: 0 },
  ignored_negation: { probability: 0.1, evidenceCount: 0 },
  missed_prerequisite: { probability: 0.1, evidenceCount: 0 },
  superficial_keyword_matching: { probability: 0.1, evidenceCount: 0 },
  premature_commitment: { probability: 0.1, evidenceCount: 0 },
  insufficient_evidence: { probability: 0.1, evidenceCount: 0 },
  overgeneralization: { probability: 0.1, evidenceCount: 0 },
  sequence_causation_confusion: { probability: 0.1, evidenceCount: 0 },
  transfer_failure: { probability: 0.1, evidenceCount: 0 },
};

export const DEFAULT_BEHAVIORAL_LOG: LearnerProfile['behavioralLog'] = {
  documentsOpened: [],
  readingOrder: [],
  evidenceSelected: [],
  ignoredEvidence: [],
  actionsAttempted: [],
  actionOrdering: [],
  repeatedGuesses: 0,
  earlyCommitments: 0,
  hintsRequested: 0,
  recoveriesAfterFailure: 0,
  luckyAnswerCounts: {
    correct_answer_correct_evidence: 0,
    correct_answer_weak_evidence: 0,
    wrong_answer_partial_understanding: 0,
    wrong_answer_irrelevant_reasoning: 0,
    correct_answer_after_hint: 0,
    transfer_success: 0,
    transfer_failure: 0,
  },
};

interface LearnerStore {
  profile: LearnerProfile | null;
  isOnboarded: boolean;
  /** Per-challenge hint level tracking (challengeId → current hint index 0/1/2) */
  hintLevels: Record<string, number>;

  // Actions
  completeOnboarding: (audience: Audience, difficulty: ReadingDifficulty) => void;
  setAudience: (audience: Audience) => void;
  setDifficulty: (difficulty: ReadingDifficulty) => void;
  setAiEnabled: (enabled: boolean) => void;
  updateSkill: (skill: ReadingSkill, delta: number) => void;
  recordMisconceptionEvidence: (misconception: import('../types/learner').MisconceptionId, deltaProb?: number) => void;
  recordDocumentOpened: (docId: string) => void;
  recordActionAttempt: (actionType: string, targetId: string) => void;
  recordLuckyAnswerOutcome: (outcome: import('../types/learner').LuckyAnswerCategory, skill: ReadingSkill) => void;
  recordErrorPattern: (errorType: 'temporalReversals' | 'missedPrerequisites' | 'ignoredNegations' | 'causalInversions' | 'superficialGuesses') => void;
  recordEvidenceAttribution: (skill: ReadingSkill, passed: boolean) => void;
  setDirectorDiagnosis: (headline: string, insight: string, details?: Partial<NonNullable<LearnerProfile['lastDiagnosis']>>) => void;
  recordInterventionResult: (archetype: string, world: string, outcomeSuccess: boolean) => void;
  applySyntheticProfile: (profileType: 'PROFILE_CAUSAL' | 'PROFILE_SEQUENCE' | 'PROFILE_NEGATION' | 'PROFILE_SURFACE_GUESSER' | 'PROFILE_STRONG_TRANSFER') => void;
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

function createFreshProfile(audience: Audience, difficulty: ReadingDifficulty): LearnerProfile {
  const now = Date.now();
  return {
    audience,
    readingDifficulty: difficulty,
    aiEnabled: true,
    skills: { ...DEFAULT_SKILLS },
    skillDetails: JSON.parse(JSON.stringify(DEFAULT_SKILL_DETAILS)),
    skillConfidence: { ...DEFAULT_CONFIDENCE },
    evidenceSuccessCount: { ...DEFAULT_EVIDENCE_COUNTS },
    misconceptions: JSON.parse(JSON.stringify(DEFAULT_MISCONCEPTIONS)),
    errorPatterns: {
      temporalReversals: 0,
      missedPrerequisites: 0,
      ignoredNegations: 0,
      causalInversions: 0,
      superficialGuesses: 0,
    },
    behavioralLog: JSON.parse(JSON.stringify(DEFAULT_BEHAVIORAL_LOG)),
    experienceMemory: {
      interventionsUsed: [],
      archetypesExperienced: [],
      worldsExperienced: ['lost_observatory'],
      transferOutcomes: [],
    },
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
          state.profile = createFreshProfile(audience, difficulty);
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

      setAiEnabled: (enabled: boolean) => {
        set((state) => {
          if (state.profile) {
            state.profile.aiEnabled = enabled;
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
          }
        });
      },

      updateSkill: (skill: ReadingSkill, delta: number) => {
        set((state) => {
          if (state.profile) {
            const current = state.profile.skills[skill] ?? 0.5;
            const updated = Math.max(0, Math.min(1, current + delta));
            state.profile.skills[skill] = updated;

            if (!state.profile.skillDetails) {
              state.profile.skillDetails = JSON.parse(JSON.stringify(DEFAULT_SKILL_DETAILS));
            }
            const detail = state.profile.skillDetails[skill];
            if (detail) {
              detail.score = updated;
              detail.recentEvidence.push(delta > 0);
              if (detail.recentEvidence.length > 5) detail.recentEvidence.shift();
              const positiveCount = detail.recentEvidence.filter(Boolean).length;
              detail.trend = positiveCount >= 4 ? 'improving' : positiveCount <= 1 ? 'declining' : 'stable';
            }

            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
            TelemetryService.record('SKILL_UPDATED', 'engine', {
              skill,
              delta,
              newValue: updated,
            });
          }
        });
      },

      recordMisconceptionEvidence: (misconception, deltaProb = 0.15) => {
        set((state) => {
          if (state.profile) {
            if (!state.profile.misconceptions) {
              state.profile.misconceptions = JSON.parse(JSON.stringify(DEFAULT_MISCONCEPTIONS));
            }
            const current = state.profile.misconceptions[misconception] || { probability: 0.1, evidenceCount: 0 };
            // Never instant flip 0 -> 1; accumulate evidence probabilistically
            current.evidenceCount += 1;
            current.probability = Math.min(0.95, Math.max(0.05, current.probability + deltaProb));
            current.lastObservedTimestamp = Date.now();
            state.profile.misconceptions[misconception] = current;
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
            TelemetryService.record('MISCONCEPTION_UPDATED', 'engine', {
              misconception,
              probability: current.probability,
              evidenceCount: current.evidenceCount,
            });
          }
        });
      },

      recordDocumentOpened: (docId: string) => {
        set((state) => {
          if (state.profile) {
            if (!state.profile.behavioralLog) {
              state.profile.behavioralLog = JSON.parse(JSON.stringify(DEFAULT_BEHAVIORAL_LOG));
            }
            if (!state.profile.behavioralLog.documentsOpened.includes(docId)) {
              state.profile.behavioralLog.documentsOpened.push(docId);
            }
            state.profile.behavioralLog.readingOrder.push(docId);
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
            TelemetryService.record('DOCUMENT_OPENED', docId, {
              orderIndex: state.profile.behavioralLog.readingOrder.length,
            });
          }
        });
      },

      recordActionAttempt: (actionType: string, targetId: string) => {
        set((state) => {
          if (state.profile) {
            if (!state.profile.behavioralLog) {
              state.profile.behavioralLog = JSON.parse(JSON.stringify(DEFAULT_BEHAVIORAL_LOG));
            }
            const key = `${actionType}:${targetId}`;
            state.profile.behavioralLog.actionsAttempted.push(key);
            state.profile.behavioralLog.actionOrdering.push(key);
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
          }
        });
      },

      recordLuckyAnswerOutcome: (outcome, skill) => {
        set((state) => {
          if (state.profile) {
            if (!state.profile.behavioralLog) {
              state.profile.behavioralLog = JSON.parse(JSON.stringify(DEFAULT_BEHAVIORAL_LOG));
            }
            state.profile.behavioralLog.luckyAnswerCounts[outcome] =
              (state.profile.behavioralLog.luckyAnswerCounts[outcome] || 0) + 1;

            if (!state.profile.skillConfidence) {
              state.profile.skillConfidence = { ...DEFAULT_CONFIDENCE };
            }

            // Distinguish the 7 outcomes
            switch (outcome) {
              case 'correct_answer_correct_evidence':
                state.profile.skills[skill] = Math.min(1, (state.profile.skills[skill] ?? 0.5) + 0.12);
                state.profile.skillConfidence[skill] = Math.min(1, (state.profile.skillConfidence[skill] ?? 0.3) + 0.18);
                break;
              case 'correct_answer_weak_evidence':
                // LUCKY ANSWER: Correct result, but weak/missing evidence! Do NOT grant full confidence
                state.profile.skills[skill] = Math.min(1, (state.profile.skills[skill] ?? 0.5) + 0.03);
                state.profile.skillConfidence[skill] = Math.max(0.1, (state.profile.skillConfidence[skill] ?? 0.3) - 0.1);
                break;
              case 'wrong_answer_partial_understanding':
                state.profile.skills[skill] = Math.max(0, (state.profile.skills[skill] ?? 0.5) - 0.02);
                state.profile.skillConfidence[skill] = Math.min(1, (state.profile.skillConfidence[skill] ?? 0.3) + 0.02);
                break;
              case 'wrong_answer_irrelevant_reasoning':
                state.profile.skills[skill] = Math.max(0, (state.profile.skills[skill] ?? 0.5) - 0.06);
                state.profile.skillConfidence[skill] = Math.max(0.1, (state.profile.skillConfidence[skill] ?? 0.3) - 0.1);
                break;
              case 'correct_answer_after_hint':
                state.profile.skills[skill] = Math.min(1, (state.profile.skills[skill] ?? 0.5) + 0.04);
                break;
              case 'transfer_success':
                state.profile.skills.transfer = Math.min(1, (state.profile.skills.transfer ?? 0.5) + 0.18);
                state.profile.skillConfidence.transfer = Math.min(1, (state.profile.skillConfidence.transfer ?? 0.25) + 0.25);
                break;
              case 'transfer_failure':
                state.profile.skills.transfer = Math.max(0, (state.profile.skills.transfer ?? 0.5) - 0.08);
                break;
            }

            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
            TelemetryService.record('ACTION_EVALUATED', 'engine', { outcome, skill });
          }
        });
      },

      recordErrorPattern: (errorType) => {
        set((state) => {
          if (state.profile) {
            if (!state.profile.errorPatterns) {
              state.profile.errorPatterns = {
                temporalReversals: 0,
                missedPrerequisites: 0,
                ignoredNegations: 0,
                causalInversions: 0,
                superficialGuesses: 0,
              };
            }
            state.profile.errorPatterns[errorType] += 1;
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
          }
        });
      },

      recordEvidenceAttribution: (skill: ReadingSkill, passed: boolean) => {
        set((state) => {
          if (state.profile) {
            if (!state.profile.skillConfidence) {
              state.profile.skillConfidence = { ...DEFAULT_CONFIDENCE };
            }
            if (!state.profile.evidenceSuccessCount) {
              state.profile.evidenceSuccessCount = { ...DEFAULT_EVIDENCE_COUNTS };
            }

            if (passed) {
              state.profile.evidenceSuccessCount[skill] = (state.profile.evidenceSuccessCount[skill] || 0) + 1;
              const count = state.profile.evidenceSuccessCount[skill];
              state.profile.skillConfidence[skill] = Math.min(1, 0.3 + (count * 0.15));
              const currSkill = state.profile.skills[skill] ?? 0.5;
              state.profile.skills[skill] = Math.min(1, currSkill + 0.08);
            } else {
              const currConf = state.profile.skillConfidence[skill] ?? 0.3;
              state.profile.skillConfidence[skill] = Math.max(0.15, currConf - 0.1);
            }
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
          }
        });
      },

      setDirectorDiagnosis: (headline: string, insight: string, details) => {
        set((state) => {
          if (state.profile) {
            state.profile.lastDiagnosis = {
              headline,
              insight,
              timestamp: Date.now(),
              ...details,
            };
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
          }
        });
      },

      recordInterventionResult: (archetype: string, world: string, outcomeSuccess: boolean) => {
        set((state) => {
          if (state.profile) {
            if (!state.profile.experienceMemory) {
              state.profile.experienceMemory = {
                interventionsUsed: [],
                archetypesExperienced: [],
                worldsExperienced: [],
                transferOutcomes: [],
              };
            }
            state.profile.experienceMemory.interventionsUsed.push(`${archetype}@${world}:${outcomeSuccess ? 'PASSED' : 'FAILED'}`);
            if (!state.profile.experienceMemory.archetypesExperienced.includes(archetype)) {
              state.profile.experienceMemory.archetypesExperienced.push(archetype);
            }
            if (!state.profile.experienceMemory.worldsExperienced.includes(world)) {
              state.profile.experienceMemory.worldsExperienced.push(world);
            }
            state.profile.updatedAt = Date.now();
            saveToStorage(state.profile);
          }
        });
      },

      applySyntheticProfile: (profileType) => {
        set((state) => {
          const prof = createFreshProfile('teens', 'intermediate');
          switch (profileType) {
            case 'PROFILE_CAUSAL':
              prof.skills.causeEffect = 0.28;
              prof.skills.sequencing = 0.75;
              prof.skillConfidence.causeEffect = 0.2;
              prof.misconceptions.sequence_causation_confusion = { probability: 0.82, evidenceCount: 4 };
              prof.misconceptions.causal_inversion = { probability: 0.78, evidenceCount: 3 };
              prof.errorPatterns.causalInversions = 3;
              break;
            case 'PROFILE_SEQUENCE':
              prof.skills.sequencing = 0.25;
              prof.skills.causeEffect = 0.72;
              prof.skillConfidence.sequencing = 0.2;
              prof.misconceptions.temporal_reversal = { probability: 0.85, evidenceCount: 4 };
              prof.misconceptions.missed_prerequisite = { probability: 0.75, evidenceCount: 3 };
              prof.errorPatterns.temporalReversals = 3;
              break;
            case 'PROFILE_NEGATION':
              prof.skills.negativeConstraint = 0.22;
              prof.skillConfidence.negativeConstraint = 0.2;
              prof.misconceptions.ignored_negation = { probability: 0.88, evidenceCount: 4 };
              prof.errorPatterns.ignoredNegations = 3;
              break;
            case 'PROFILE_SURFACE_GUESSER':
              prof.skills.literalRetrieval = 0.35;
              prof.skillConfidence.literalRetrieval = 0.15;
              prof.misconceptions.superficial_keyword_matching = { probability: 0.90, evidenceCount: 5 };
              prof.misconceptions.premature_commitment = { probability: 0.85, evidenceCount: 4 };
              prof.errorPatterns.superficialGuesses = 4;
              prof.behavioralLog.repeatedGuesses = 6;
              break;
            case 'PROFILE_STRONG_TRANSFER':
              prof.skills.causeEffect = 0.88;
              prof.skills.sequencing = 0.85;
              prof.skills.negativeConstraint = 0.82;
              prof.skills.literalRetrieval = 0.90;
              prof.skills.multiCondition = 0.80;
              prof.skills.synthesis = 0.84;
              prof.skills.transfer = 0.45;
              prof.skillConfidence.causeEffect = 0.85;
              prof.skillConfidence.transfer = 0.35;
              break;
          }
          state.profile = prof;
          state.isOnboarded = true;
          saveToStorage(prof);
          TelemetryService.record('PROFILE_SELECTED', 'synthetic', { profileType });
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

          stats.averageCompletionTimeMs = prevTotal > 0
            ? (stats.averageCompletionTimeMs * prevTotal + data.completionTimeMs) / (prevTotal + 1)
            : data.completionTimeMs;

          let skillDelta: number;
          if (data.firstTrySuccess) {
            skillDelta = 0.10;
          } else if (data.rereads > 0 && data.hintsUsed === 0) {
            skillDelta = 0.06;
          } else if (data.hintsUsed > 0) {
            skillDelta = 0.03;
          } else {
            skillDelta = 0.06;
          }

          const current = state.profile.skills[data.skill] ?? 0.5;
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
          newLevel = Math.min(current + 1, 2);
          state.hintLevels[challengeId] = newLevel;
          if (state.profile) {
            state.profile.sessionStats.totalHintsUsed += 1;
            if (!state.profile.behavioralLog) {
              state.profile.behavioralLog = JSON.parse(JSON.stringify(DEFAULT_BEHAVIORAL_LOG));
            }
            state.profile.behavioralLog.hintsRequested += 1;
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
