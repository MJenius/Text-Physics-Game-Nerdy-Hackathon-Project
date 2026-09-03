export type EntityId = string;
export type LocationId =
  | 'courtyard'
  | 'library'
  | 'laboratory'
  | 'junction'
  | 'concourse'
  | 'quarters'
  | 'dome'
  | 'submersible_delta'
  | 'boreas_station'
  | 'vestibule'
  | 'generator_room'
  | 'radio_room'
  | 'orbital_module';

export type ChallengeId = string;

export type InteractionArchetype =
  | 'CALIBRATE'
  | 'ROUTE'
  | 'INVESTIGATION'
  | 'SORT'
  | 'TIMELINE'
  | 'NAVIGATION'
  | 'DIALOGUE'
  | 'RESOURCE'
  | 'REPAIR'
  | 'SEARCH'
  | 'EVIDENCE'
  | 'SYNTHESIS'
  // Backwards compatibility aliases
  | 'MECHANISM'
  | 'RESOURCE_DECISION';

export type DocumentType =
  | 'field_journal'
  | 'maintenance_manual'
  | 'telegraph'
  | 'emergency_log'
  | 'architectural_map'
  | 'personal_diary'
  | 'scientific_report'
  | 'witness_transcript'
  | 'schematic_blueprint';

export interface StoryDocument {
  id: string;
  title: string;
  type: DocumentType;
  source: string;
  paragraphs: string[];
  keyClues?: string[];
  dateOrStamp?: string;
  isInspected?: boolean;
}

export interface Entity {
  id: EntityId;
  name: string;
  locationId: LocationId;
  description: string;
  states: Record<string, string | number | boolean>;
  isInteractable: boolean;
  isInInventory: boolean;
  allowedActions: string[];
  icon: string;
}

export interface Predicate {
  type:
    | 'ENTITY_STATE'
    | 'STATE_IS'
    | 'INVENTORY_HAS'
    | 'IN_INVENTORY'
    | 'FLAG_IS'
    | 'DECISION_EQUALS'
    | 'FACT_KNOWN'
    | 'POWERED_HAS'
    | 'RELATIONSHIP_AT_LEAST'
    | 'DECISION_IN'
    | 'HYPOTHESIS_CONFIRMED';
  target: string;
  property?: string;
  expected: string | number | boolean | (string | number | boolean)[];
}

export interface RuleEffect {
  type:
    | 'SET_ENTITY_STATE'
    | 'ADD_INVENTORY'
    | 'REMOVE_INVENTORY'
    | 'SET_FLAG'
    | 'RESET_CHALLENGE'
    | 'RECORD_DECISION'
    | 'DISCOVER_FACT'
    | 'POWER_SYSTEM'
    | 'TRANSITION_SCENE'
    | 'MODIFY_RELATIONSHIP'
    | 'ADD_HYPOTHESIS'
    | 'CONFIRM_HYPOTHESIS'
    | 'ADD_UNCERTAINTY'
    | 'RESOLVE_UNCERTAINTY';
  target: string;
  property?: string;
  value: string | number | boolean;
  rationale?: string;
}

export interface GameRule {
  id: string;
  challengeId: ChallengeId;
  action: string; // e.g., 'USE_ITEM_ON', 'ACTIVATE', 'INSPECT', 'SELECT_EVIDENCE', 'COMMIT_CHOICE', 'CALIBRATE', 'ROUTE_WIRE', 'DIALOGUE_CHOOSE'
  sourceId?: EntityId;
  targetId: EntityId;
  conditions: Predicate[];
  onSuccess: {
    effects: RuleEffect[];
    feedbackMessage: string;
    soundEffect?: string;
    consequenceVisual?: 'steam_burst' | 'gear_shudder' | 'circuit_spark' | 'shutter_slam' | 'door_unlock' | 'none';
  };
  onFailure: {
    feedbackMessage: string;
    effects?: RuleEffect[];
    soundEffect?: string;
    autoReset?: boolean;
    brokenConditionIndex?: number;
    consequenceVisual?: 'steam_burst' | 'gear_shudder' | 'circuit_spark' | 'shutter_slam' | 'none';
  };
}

export interface Passage {
  heading: string;
  source: string;
  paragraphs: string[];
  keyClues?: string[];
  documents?: StoryDocument[];
  activeDocumentId?: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  rationaleWhy: string;
  downstreamHint: string;
  effects: RuleEffect[];
}

export interface PlayerDecisionRecord {
  value: string | number | boolean;
  rationale?: string;
  timestamp: number;
  act: number;
}

export interface HypothesisRecord {
  id: string;
  title: string;
  statement: string;
  sourceAct: number;
  status: 'confirmed' | 'unconfirmed' | 'disproven';
  confidence: 'high' | 'moderate' | 'low';
  supportingFacts: string[];
}

export interface NarrativeWorldState {
  discoveredFacts: string[];
  visitedLocations: LocationId[];
  obtainedItems: string[];
  poweredSystems: ('archive' | 'laboratory' | 'observatory' | 'transmitter' | string)[];
  triggeredEvents: string[];
  characterRelationships: Record<string, number>; // e.g. aris: 65 (0-100)
  playerDecisions: Record<string, PlayerDecisionRecord>;
  knownWorldRules: string[];
  narrativeFlags: Record<string, boolean | number | string>;
  currentObjective: {
    id: string;
    title: string;
    description: string;
    hint?: string;
  };
  availableLocations: LocationId[];
  hypotheses: HypothesisRecord[];
  uncertainties: string[];
  forensicInspectionHistory: Array<{ targetId: string; timestamp: number }>;
  activeWorldId: 'lost_observatory' | 'arctic_station' | 'triton_deep_sea' | 'orbital_habitat';
}

export interface PhysicalConsequence {
  visualEffect: 'steam_burst' | 'gear_shudder' | 'circuit_spark' | 'shutter_slam' | 'door_unlock' | 'none';
  description: string;
  timestamp: number;
  isError?: boolean;
}

export interface WorldState {
  currentLocationId: LocationId;
  currentChallengeId: ChallengeId;
  activeArchetype: InteractionArchetype;
  currentAct: number;
  entities: Record<EntityId, Entity>;
  inventory: EntityId[];
  flags: Record<string, boolean | number | string>;
  narrative: NarrativeWorldState;
  isComplete: boolean;
  physicalConsequence?: PhysicalConsequence;
  lastFeedback: {
    type: 'neutral' | 'success' | 'failure' | 'info';
    message: string;
    timestamp: number;
  };
}

export interface PlayerAction {
  type:
    | 'PUSH'
    | 'TURN'
    | 'PULL'
    | 'USE_ITEM_ON'
    | 'ACTIVATE'
    | 'INSPECT'
    | 'PICKUP'
    | 'SELECT_EVIDENCE'
    | 'COMMIT_CHOICE'
    | 'CALIBRATE'
    | 'ROUTE_WIRE'
    | 'SORT_ITEM'
    | 'TIMELINE_ORDER'
    | 'DIALOGUE_CHOOSE'
    | 'REPAIR_ASSEMBLE'
    | 'SYNTHESIS_COMMIT';
  sourceId?: EntityId;
  targetId: EntityId;
  payload?: any;
}

export interface EvaluationResult {
  passed: boolean;
  feedback: string;
  effects: RuleEffect[];
  soundEffect?: string;
  consequenceVisual?: PhysicalConsequence['visualEffect'];
}

// Archetype Specific Configurations on Challenges:

export interface CalibrateConfig {
  variableName: string;
  unit: string;
  minValue: number;
  maxValue: number;
  step: number;
  targetValue: number;
  tolerance?: number;
  gaugeLabel: string;
  instructionSnippet: string;
}

export interface RouteNode {
  id: string;
  name: string;
  powerDemandKw: number;
  icon?: string;
  description: string;
}

export interface RouteWiringConfig {
  generatorBusKw: number;
  maxLoadCeilingKw: number;
  nodes: RouteNode[];
  requiredActiveNodeIds?: string[];
  incompatibleNodePairs?: [string, string][];
}

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  mood?: 'neutral' | 'suspicious' | 'cooperative' | 'agitated';
  options: {
    id: string;
    text: string;
    intent: 'inquire' | 'challenge' | 'disclose' | 'sympathize';
    trustDelta?: number;
    consequenceHint?: string;
    nextNodeId?: string;
    effects?: RuleEffect[];
    isTerminal?: boolean;
  }[];
}

export interface TimelineEvent {
  id: string;
  text: string;
  sourceDocId?: string;
  correctChronologicalIndex: number;
  causalParentId?: string; // Distinguish temporal precedence vs causal driver!
}

export interface SortCategory {
  id: string;
  name: string;
  description: string;
}

export interface SortItem {
  id: string;
  label: string;
  description: string;
  targetCategoryId: string; // Ground truth category from text
  isDistractor?: boolean;
}

export interface AssemblyComponent {
  id: string;
  name: string;
  slotIndex: number;
  description: string;
  requiredPrecedingComponentId?: string;
}

export interface EvidenceClaim {
  id: string;
  claimText: string;
  claimSource: string;
  isTrue: boolean;
  requiredProofSnippetId: string;
  invalidDistractorSnippetIds?: string[];
  downstreamFact?: string;
}

export interface EvidenceSnippet {
  id: string;
  documentTitle: string;
  snippetText: string;
  authorOrDate?: string;
}

export interface EvidenceConfig {
  claims: EvidenceClaim[];
  snippets: EvidenceSnippet[];
  instructionSnippet: string;
}

export interface SynthesisParameter {
  id: string;
  name: string;
  unit: string;
  minValue: number;
  maxValue: number;
  step: number;
  initialValue: number;
  targetValue: number;
  tolerance: number;
  derivationHint: string;
  subsystemLabel: string;
}

export interface SynthesisConfig {
  apparatusTitle: string;
  instructionSnippet: string;
  parameters: SynthesisParameter[];
  mutualExclusionWarning?: string;
}

export interface Challenge {
  id: ChallengeId;
  order: number;
  act?: number;
  title: string;
  locationId: LocationId;
  archetype?: InteractionArchetype;
  passage: Passage;
  targetReadingSkill:
    | 'literal_retrieval'
    | 'sequencing'
    | 'cause_effect'
    | 'negative_constraint'
    | 'multi_condition'
    | 'synthesis';
  ruleIds: string[];
  completionCondition: Predicate[];
  completedMessage: string;
  /** Phase 2: AI-adapted passage for the current learner profile */
  adaptedPassage?: import('./learner').GeneratedPassage | null;
  /** Phase 3: Agency decisions & interactive archetype state */
  availableDecisions?: DecisionOption[];
  nextSceneBranches?: {
    defaultNext: string;
    conditionalNext?: { condition: Predicate; targetSceneId: string }[];
  };

  // Archetype Configurations (optional depending on archetype):
  calibrateConfig?: CalibrateConfig;
  routeWiringConfig?: RouteWiringConfig;
  dialogueConfig?: {
    characterName: string;
    initialNodeId: string;
    nodes: Record<string, DialogueNode>;
  };
  timelineConfig?: {
    events: TimelineEvent[];
    promptQuestion: string;
  };
  sortConfig?: {
    categories: SortCategory[];
    items: SortItem[];
  };
  assemblyConfig?: {
    components: AssemblyComponent[];
    slotsCount: number;
  };
  evidenceConfig?: EvidenceConfig;
  synthesisConfig?: SynthesisConfig;
}
