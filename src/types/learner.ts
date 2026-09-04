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
  | 'inference'
  | 'synthesis'
  | 'transfer';

/** Maps challenge targetReadingSkill strings to ReadingSkill keys */
export const SKILL_KEY_MAP: Record<string, ReadingSkill> = {
  literal_retrieval: 'literalRetrieval',
  literalRetrieval: 'literalRetrieval',
  sequencing: 'sequencing',
  cause_effect: 'causeEffect',
  causeEffect: 'causeEffect',
  negative_constraint: 'negativeConstraint',
  negativeConstraint: 'negativeConstraint',
  multi_condition: 'multiCondition',
  multiCondition: 'multiCondition',
  inference: 'inference',
  synthesis: 'synthesis',
  transfer: 'transfer',
};

export const SKILL_DISPLAY_NAMES: Record<ReadingSkill, string> = {
  literalRetrieval: 'Finding Details',
  sequencing: 'Following Order',
  causeEffect: 'Cause & Effect',
  negativeConstraint: 'Exclusion Logic',
  multiCondition: 'Multi-Condition',
  inference: 'Inference',
  synthesis: 'Synthesis',
  transfer: 'Skill Transfer',
};

// --- Misconceptions (10 Cognitive Traps) ---

export type MisconceptionId =
  | 'temporal_reversal'
  | 'causal_inversion'
  | 'ignored_negation'
  | 'missed_prerequisite'
  | 'superficial_keyword_matching'
  | 'premature_commitment'
  | 'insufficient_evidence'
  | 'overgeneralization'
  | 'sequence_causation_confusion'
  | 'transfer_failure';

export const ALL_MISCONCEPTIONS: MisconceptionId[] = [
  'temporal_reversal',
  'causal_inversion',
  'ignored_negation',
  'missed_prerequisite',
  'superficial_keyword_matching',
  'premature_commitment',
  'insufficient_evidence',
  'overgeneralization',
  'sequence_causation_confusion',
  'transfer_failure',
];

export interface MisconceptionDetail {
  probability: number; // 0.0 - 1.0 (accumulated evidence, never flipped 0->1 in single jump)
  evidenceCount: number;
  lastObservedTimestamp?: number;
}

export interface SkillDetail {
  score: number; // 0.0 - 1.0
  confidence: number; // 0.0 - 1.0
  recentEvidence: boolean[]; // sliding window of recent successes/failures
  trend: 'improving' | 'stable' | 'declining';
}

// --- Lucky Answer Problem & Behavioral Outcome Categories ---

export type LuckyAnswerCategory =
  | 'correct_answer_correct_evidence'
  | 'correct_answer_weak_evidence'
  | 'wrong_answer_partial_understanding'
  | 'wrong_answer_irrelevant_reasoning'
  | 'correct_answer_after_hint'
  | 'transfer_success'
  | 'transfer_failure';

// --- Knowledge Graph Types ---

export type KnowledgeRelationType =
  | 'BEFORE'
  | 'AFTER'
  | 'CAUSED'
  | 'DID_NOT_CAUSE'
  | 'DEPENDS_ON'
  | 'EXCLUDES'
  | 'EQUAL';

export interface KnowledgeFact {
  id: string;
  statement: string;
  sourceDocumentId: string;
  snippet?: string;
}

export interface KnowledgeRelation {
  id: string;
  subjectFactId: string;
  relation: KnowledgeRelationType;
  objectFactId: string;
  description: string;
}

export interface KnowledgeGraph {
  facts: KnowledgeFact[];
  relations: KnowledgeRelation[];
}

// --- Learner Profile ---

export interface LearnerProfile {
  audience: Audience;
  readingDifficulty: ReadingDifficulty;
  aiEnabled?: boolean; // Toggle for AI dynamic generation vs deterministic fallback
  skills: Record<ReadingSkill, number>; // 0.0–1.0
  skillDetails: Record<ReadingSkill, SkillDetail>;
  skillConfidence: Record<ReadingSkill, number>; // 0.0-1.0 confidence based on action + evidence + transfer
  evidenceSuccessCount: Record<ReadingSkill, number>;
  misconceptions: Record<MisconceptionId, MisconceptionDetail>;
  errorPatterns: {
    temporalReversals: number;
    missedPrerequisites: number;
    ignoredNegations: number;
    causalInversions: number;
    superficialGuesses: number;
  };
  behavioralLog: {
    documentsOpened: string[];
    readingOrder: string[];
    evidenceSelected: string[];
    ignoredEvidence: string[];
    actionsAttempted: string[];
    actionOrdering: string[];
    repeatedGuesses: number;
    earlyCommitments: number;
    hintsRequested: number;
    recoveriesAfterFailure: number;
    luckyAnswerCounts: Record<LuckyAnswerCategory, number>;
  };
  lastDiagnosis?: {
    headline: string;
    insight: string;
    diagnosisText?: string;
    targetSkill?: ReadingSkill;
    targetMisconception?: MisconceptionId;
    confidence?: number;
    recommendedIntervention?: string;
    recommendedWorld?: string;
    recommendedDifficulty?: ReadingDifficulty;
    ambiguity?: 'low' | 'moderate' | 'high';
    supportLevel?: 0 | 1 | 2 | 3;
    documentTypes?: string[];
    timestamp: number;
  };
  experienceMemory: {
    interventionsUsed: string[];
    archetypesExperienced: string[];
    worldsExperienced: string[];
    transferOutcomes: Array<{ timestamp: number; success: boolean; notes: string }>;
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
  inference: 0.5,
  synthesis: 0.5,
  transfer: 0.5,
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
