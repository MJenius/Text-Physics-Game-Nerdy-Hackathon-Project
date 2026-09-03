export type EntityId = string;
export type LocationId = 'courtyard' | 'library' | 'laboratory' | 'junction' | 'dome';
export type ChallengeId = string;

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
  type: 'ENTITY_STATE' | 'INVENTORY_HAS' | 'FLAG_IS';
  target: string;
  property?: string;
  expected: string | number | boolean;
}

export interface RuleEffect {
  type: 'SET_ENTITY_STATE' | 'ADD_INVENTORY' | 'REMOVE_INVENTORY' | 'SET_FLAG' | 'RESET_CHALLENGE';
  target: string;
  property?: string;
  value: string | number | boolean;
}

export interface GameRule {
  id: string;
  challengeId: ChallengeId;
  action: string; // e.g., 'USE_ITEM_ON', 'ACTIVATE', 'INSPECT'
  sourceId?: EntityId;
  targetId: EntityId;
  conditions: Predicate[];
  onSuccess: {
    effects: RuleEffect[];
    feedbackMessage: string;
    soundEffect?: string;
  };
  onFailure: {
    feedbackMessage: string;
    effects?: RuleEffect[];
    soundEffect?: string;
    autoReset?: boolean;
    brokenConditionIndex?: number;
  };

}

export interface Passage {
  heading: string;
  source: string;
  paragraphs: string[];
  keyClues?: string[];
}

export interface Challenge {
  id: ChallengeId;
  order: number;
  title: string;
  locationId: LocationId;
  passage: Passage;
  targetReadingSkill: 'literal_retrieval' | 'sequencing' | 'cause_effect' | 'negative_constraint' | 'multi_condition' | 'synthesis';
  ruleIds: string[];
  completionCondition: Predicate[];
  completedMessage: string;
}

export interface WorldState {
  currentLocationId: LocationId;
  currentChallengeId: ChallengeId;
  entities: Record<EntityId, Entity>;
  inventory: EntityId[];
  flags: Record<string, boolean | number | string>;
  isComplete: boolean;
  lastFeedback: {
    type: 'neutral' | 'success' | 'failure' | 'info';
    message: string;
    timestamp: number;
  };
}

export interface PlayerAction {
  type: 'USE_ITEM_ON' | 'ACTIVATE' | 'INSPECT' | 'PICKUP';
  sourceId?: EntityId;
  targetId: EntityId;
}

export interface EvaluationResult {
  passed: boolean;
  feedback: string;
  effects: RuleEffect[];
  soundEffect?: string;
}
