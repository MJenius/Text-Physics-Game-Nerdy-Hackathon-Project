// ============================================================================
// PHASE 3: DIRECTOR & EVIDENCE TYPES
// ============================================================================
import type { ReadingSkill, ReadingDifficulty } from './learner';

export type ErrorClassification =
  | 'temporal_reversal'
  | 'missed_prerequisite'
  | 'ignored_negation'
  | 'causal_inversion'
  | 'superficial_guessing';

export interface DirectorPrescription {
  targetSkill: ReadingSkill;
  recommendedDifficulty: ReadingDifficulty;
  scaffoldingLevel: 0 | 1 | 2; // 0=none, 1=evidence highlight prompt, 2=explicit sequence guidance
  errorDiagnosed?: ErrorClassification;
  /** Player-facing natural insight: e.g. "Notice: The machinery requires priming before power can flow." */
  learnerInsight: string;
  /** Short status for the Director HUD, e.g. "Calibrating: Order of Operations" */
  statusHeadline: string;
  triggerTransfer: boolean;
  targetTopology: 'TOP-1' | 'TOP-2' | 'TOP-3' | 'TOP-4' | 'TOP-5' | 'TOP-6';
}

export interface EvidenceTarget {
  challengeId: string;
  ruleId: string;
  correctParagraphIndex: number;
  phraseSnippet: string;
  promptQuestion: string;
  explanation: string;
}
