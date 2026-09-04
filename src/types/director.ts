// ============================================================================
// PHASE 3: DIRECTOR & EXPERIENCE PRESCRIPTION TYPES
// ============================================================================
import type { ReadingSkill, ReadingDifficulty } from './learner';
import type { InteractionArchetype } from './game';

export type ErrorClassification =
  | 'temporal_reversal'
  | 'missed_prerequisite'
  | 'ignored_negation'
  | 'causal_inversion'
  | 'superficial_guessing'
  | 'sequence_causation_confusion'
  | 'premature_commitment'
  | 'insufficient_evidence'
  | 'overgeneralization'
  | 'transfer_failure';

export type PrimaryPlayerActionPattern =
  | 'EVALUATE_AND_INSPECT' // Causal / Investigation (e.g. Arctic / Triton: inspecting telemetry, proving claims)
  | 'ARRANGE_AND_OPERATE' // Sequencing / Mechanism / Timeline (e.g. Observatory: strict chronological interlock)
  | 'ALLOCATE_UNDER_EXCLUSION' // Negation / Route / Resource (e.g. Dynamo load limits, mutual exclusion)
  | 'DEDUCE_STATE_AND_COMMIT' // Synthesis / Dial / Calibrate (multi-condition state deduction)
  | 'FORENSIC_RETRIEVAL'; // Literal retrieval (locating hidden clues, cross-examining logs)

export const VALIDATED_EXPERIENCE_DOMAINS = {
  worlds: ['lost_observatory', 'arctic_station', 'triton_deep_sea', 'orbital_habitat'] as const,
  archetypes: [
    'NAVIGATION',
    'MECHANISM',
    'TIMELINE',
    'INVESTIGATION',
    'EVIDENCE',
    'ROUTE',
    'RESOURCE',
    'SORT',
    'CALIBRATE',
    'REPAIR',
    'DIALOGUE',
    'SYNTHESIS',
  ] as const,
  actionPatterns: [
    'EVALUATE_AND_INSPECT',
    'ARRANGE_AND_OPERATE',
    'ALLOCATE_UNDER_EXCLUSION',
    'DEDUCE_STATE_AND_COMMIT',
    'FORENSIC_RETRIEVAL',
  ] as const,
};

export interface DirectorPrescription {
  targetSkill: ReadingSkill;
  recommendedDifficulty: ReadingDifficulty;
  scaffoldingLevel: 0 | 1 | 2 | 3; // 0=none, 1=subtle attention cue, 2=evidence-focus cue, 3=structural scaffold
  errorDiagnosed?: ErrorClassification;
  experienceArchetype: InteractionArchetype;
  primaryActionPattern: PrimaryPlayerActionPattern;
  ambiguityLevel: 'low' | 'moderate' | 'high';
  consequenceIntensity: 'gentle' | 'moderate' | 'severe';
  theme: 'lost_observatory' | 'observatory_victorian' | 'triton_deep_sea' | 'arctic_station' | 'orbital_habitat';
  prescribedSceneId?: string;
  /** Player-facing natural insight */
  learnerInsight: string;
  /** Short status for the Director HUD */
  statusHeadline: string;
  triggerTransfer: boolean;
  targetTopology: 'TOP-1' | 'TOP-2' | 'TOP-3' | 'TOP-4' | 'TOP-5' | 'TOP-6';
  documentTypes: string[];
  supportStrategy?: string;
  reason?: string;
}

export interface EvidenceTarget {
  challengeId: string;
  ruleId: string;
  correctParagraphIndex: number;
  phraseSnippet: string;
  promptQuestion: string;
  explanation: string;
}
