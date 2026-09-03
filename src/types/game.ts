export type EntityId = string;
export type LocationId = 'courtyard' | 'library' | 'laboratory' | 'junction' | 'dome' | 'submersible_delta';
export type ChallengeId = string;

export type InteractionArchetype =
  | 'MECHANISM'
  | 'INVESTIGATION'
  | 'NAVIGATION'
  | 'DIALOGUE'
  | 'RESOURCE_DECISION'
  | 'SYNTHESIS';

export type DocumentType =
  | 'field_journal'
  | 'maintenance_manual'
  | 'telegraph'
  | 'emergency_log'
  | 'architectural_map'
  | 'personal_diary';

export interface StoryDocument {
  id: string;
  title: string;
  type: DocumentType;
  source: string;
  paragraphs: string[];
  keyClues?: string[];
  dateOrStamp?: string;
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
  type: 'ENTITY_STATE' | 'INVENTORY_HAS' | 'FLAG_IS' | 'DECISION_EQUALS' | 'FACT_KNOWN' | 'POWERED_HAS';
  target: string;
  property?: string;
  expected: string | number | boolean;
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
    | 'TRANSITION_SCENE';
  target: string;
  property?: string;
  value: string | number | boolean;
  rationale?: string;
}

export interface GameRule {
  id: string;
  challengeId: ChallengeId;
  action: string; // e.g., 'USE_ITEM_ON', 'ACTIVATE', 'INSPECT', 'SELECT_EVIDENCE', 'COMMIT_CHOICE'
  sourceId?: EntityId;
  targetId: EntityId;
  conditions: Predicate[];
  onSuccess: {
    effects: RuleEffect[];
    feedbackMessage: string;
    soundEffect?: string;
    consequenceVisual?: 'steam_burst' | 'gear_shudder' | 'circuit_spark' | 'shutter_slam' | 'door_unlock';
  };
  onFailure: {
    feedbackMessage: string;
    effects?: RuleEffect[];
    soundEffect?: string;
    autoReset?: boolean;
    brokenConditionIndex?: number;
    consequenceVisual?: 'steam_burst' | 'gear_shudder' | 'circuit_spark' | 'shutter_slam';
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
}

export interface PlayerDecisionRecord {
  value: string | number | boolean;
  rationale?: string;
  timestamp: number;
  act: number;
}

export interface NarrativeWorldState {
  discoveredFacts: string[];
  visitedLocations: LocationId[];
  obtainedItems: string[];
  poweredSystems: ('archive' | 'laboratory' | 'observatory')[];
  triggeredEvents: string[];
  characterRelationships: Record<string, number>;
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
  type: 'USE_ITEM_ON' | 'ACTIVATE' | 'INSPECT' | 'PICKUP' | 'SELECT_EVIDENCE' | 'COMMIT_CHOICE';
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
