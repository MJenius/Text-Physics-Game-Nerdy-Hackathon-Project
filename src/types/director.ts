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
  | 'superficial_guessing';

export interface DirectorPrescription {
  targetSkill: ReadingSkill;
  recommendedDifficulty: ReadingDifficulty;
  scaffoldingLevel: 0 | 1 | 2; // 0=none, 1=evidence highlight prompt, 2=explicit sequence guidance
  errorDiagnosed?: ErrorClassification;
  experienceArchetype: InteractionArchetype;
  ambiguityLevel: 'low' | 'moderate' | 'high';
  consequenceIntensity: 'gentle' | 'moderate' | 'severe';
  theme: 'observatory_victorian' | 'triton_deep_sea' | 'arctic_station' | 'orbital_habitat';
  prescribedSceneId?: string;
  /** Player-facing natural insight: e.g. "Notice: Downstream manifolds cannot flow until the primary loop is primed." */
  learnerInsight: string;
  /** Short status for the Director HUD, e.g. "Calibrating: Causal Loop Investigation" */
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
