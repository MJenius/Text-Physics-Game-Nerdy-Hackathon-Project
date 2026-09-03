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

export interface ScenarioSpecification {
  id: string;
  topologyId: TopologyId;
  targetSkill: ReadingSkill;
  audience: Audience;
  readingDifficulty: ReadingDifficulty;
  theme: 'observatory_victorian' | 'triton_submarine' | 'orbital_station';
  title: string;
  passage: Passage;
  entities: Record<string, Entity>;
  initialInventory: string[];
  rules: GameRule[];
  completionConditions: Predicate[];
  evidenceSnippet: string;
  evidenceParagraphIndex: number;
}
