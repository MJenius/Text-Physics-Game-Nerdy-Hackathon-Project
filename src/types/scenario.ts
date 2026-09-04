// ============================================================================
// PHASE 3: SCENARIO & TOPOLOGY TYPES
// ============================================================================
import type { ReadingSkill, ReadingDifficulty, Audience } from './learner';
import type { Entity, GameRule, Predicate, Passage } from './game';

export type TopologyId =
  | 'TOP-1' // Sequence Interlock (A -> B -> C)
  | 'TOP-2' // Causal Loop (A primed before B -> C, else hazard)
  | 'TOP-3' // Mutual Exclusion (A XOR B, never both)
  | 'TOP-4' // Multi-Condition Conjunct (A AND B AND C)
  | 'TOP-5' // Prerequisite Tool Chain (Find Tool -> Unlock)
  | 'TOP-6'; // State Deduction (Observe -> Infer -> Act)

export interface ScenarioTopology {
  id: TopologyId;
  name: string;
  description: string;
  requiredSkill: ReadingSkill;
  defaultFailureState: string;
}

export type DocumentRole =
  | 'event_timing' // Establishes chronology and precedence
  | 'physical_mechanism' // Establishes mechanical principles or causes
  | 'misleading_correlation' // Introduces plausible false correlation
  | 'confirmatory_evidence' // Confirms root cause or disconfirms false path
  | 'safety_constraint'; // States negative constraints or mutual exclusion

export interface DocumentSpecification {
  id: string;
  title: string;
  type: string;
  source: string;
  dateOrStamp?: string;
  role: DocumentRole;
  paragraphs: string[];
  keyClues: string[];
  factsCovered: string[];
}

export interface AIScenarioSpecification {
  world: 'lost_observatory' | 'arctic_station' | 'triton_deep_sea' | 'orbital_habitat';
  archetype: import('./game').InteractionArchetype;
  targetSkill: ReadingSkill;
  targetMisconception: import('./learner').MisconceptionId;
  difficulty: ReadingDifficulty;
  ambiguity: 'low' | 'moderate' | 'high';
  documents: DocumentSpecification[];
  centralMystery: string;
  requiredFacts: import('./learner').KnowledgeFact[];
  requiredRelations: import('./learner').KnowledgeRelation[];
  plausibleFalseHypothesis: string;
  requiredInference: string;
  supportStrategy: string;
  failureConsequences: string[];
  successConsequences: string[];
  topologyId: TopologyId;
  evidenceSnippet?: string;
  evidenceParagraphIndex?: number;
}

export interface ScenarioSpecification {
  id: string;
  topologyId: TopologyId;
  targetSkill: ReadingSkill;
  audience: Audience;
  readingDifficulty: ReadingDifficulty;
  theme: 'observatory_victorian' | 'triton_submarine' | 'arctic_station' | 'orbital_station';
  title: string;
  passage: Passage;
  entities: Record<string, Entity>;
  initialInventory: string[];
  rules: GameRule[];
  completionConditions: Predicate[];
  evidenceSnippet: string;
  evidenceParagraphIndex: number;
  knowledgeGraph?: import('./learner').KnowledgeGraph;
  documentRoles?: Record<string, DocumentRole>;
  archetype?: import('./game').InteractionArchetype;
}

export interface ScenarioValidationCheck {
  step:
    | 'schema_validation'
    | 'entity_validation'
    | 'fact_validation'
    | 'relation_validation'
    | 'document_coverage'
    | 'action_legality'
    | 'state_transition_simulation'
    | 'reachability_search'
    | 'failure_recovery_validation'
    | 'evidence_alignment'
    | 'answer_leakage_checks';
  passed: boolean;
  message?: string;
}

export interface ScenarioRejectionReport {
  valid: boolean;
  checks: ScenarioValidationCheck[];
  errors: string[];
  winningPath?: string[];
}
