// ============================================================================
// PHASE 2: LEARNER & ADAPTIVE TYPES
// ============================================================================

export type Audience = 'kids' | 'teens' | 'adults';
export type ReadingDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type ReadingSkill =
  | 'literalRetrieval'
  | 'sequencing'
  | 'causeEffect'
  | 'negativeConstraint'
  | 'multiCondition'
  | 'synthesis';

/** Maps the Phase 1 challenge targetReadingSkill strings to Phase 2 ReadingSkill keys */
export const SKILL_KEY_MAP: Record<string, ReadingSkill> = {
  literal_retrieval: 'literalRetrieval',
  sequencing: 'sequencing',
  cause_effect: 'causeEffect',
  negative_constraint: 'negativeConstraint',
  multi_condition: 'multiCondition',
  synthesis: 'synthesis',
};

export const SKILL_DISPLAY_NAMES: Record<ReadingSkill, string> = {
  literalRetrieval: 'Finding Details',
  sequencing: 'Following Order',
  causeEffect: 'Cause & Effect',
  negativeConstraint: 'Exclusion Logic',
  multiCondition: 'Multi-Condition',
  synthesis: 'Synthesis',
};

// --- Learner Profile ---

export interface LearnerProfile {
  audience: Audience;
  readingDifficulty: ReadingDifficulty;
  aiEnabled?: boolean; // Toggle for AI dynamic generation vs deterministic fallback
  skills: Record<ReadingSkill, number>; // 0.0–1.0
  skillConfidence: Record<ReadingSkill, number>; // 0.0-1.0 confidence based on action + evidence + transfer
  evidenceSuccessCount: Record<ReadingSkill, number>;
  errorPatterns: {
    temporalReversals: number;
    missedPrerequisites: number;
    ignoredNegations: number;
    causalInversions: number;
    superficialGuesses: number;
  };
  lastDiagnosis?: {
    headline: string;
    insight: string;
    timestamp: number;
  };
  sessionStats: {
    challengesCompleted: number;
    totalAttempts: number;
    totalRereads: number;
    totalHintsUsed: number;
    averageCompletionTimeMs: number;
  };
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_SKILLS: Record<ReadingSkill, number> = {
  literalRetrieval: 0.5,
  sequencing: 0.5,
  causeEffect: 0.5,
  negativeConstraint: 0.5,
  multiCondition: 0.5,
  synthesis: 0.5,
};

// --- Difficulty Constraints ---

export interface DifficultyConstraints {
  avgSentenceLength: [number, number]; // [min, max] words
  vocabularyLevel: 'basic' | 'moderate' | 'rich';
  clauseComplexity: 'simple' | 'compound' | 'complex';
  temporalExplicitness: 'explicit' | 'moderate' | 'implicit';
  maxParagraphs: number;
  audienceTone: string; // descriptive string for the LLM prompt
}

// --- Challenge Schema (structured facts for AI) ---

export interface EvidenceMapping {
  failureCondition: string;
  paragraphIndex: number;
  evidencePhrase: string;
  hintLevels: [string, string, string]; // progressive hints
}

export interface ChallengeSchema {
  challengeId: string;
  skill: ReadingSkill;
  requiredEntities: string[];
  requiredRelationships: string[];
  requiredSequenceWords?: string[];
  solutionSteps: string[];
  evidenceSentences: EvidenceMapping[];
}

// --- Generated Passage ---

export interface GeneratedPassage {
  title: string;
  source: string;
  paragraphs: string[];
  targetVocabulary: string[];
  readingLevel: ReadingDifficulty;
  audience: Audience;
  generatedAt: number;
  isAIGenerated: boolean;
}

// --- Validation ---

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
