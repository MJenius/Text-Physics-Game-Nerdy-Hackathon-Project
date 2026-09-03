import type { Entity, GameRule, Challenge } from '../types/game';


// ==========================================
// CHALLENGE 1: THE ARCHIVE ENTRANCE
// Skill: Factual / Literal Retrieval
// Core Concept: Two distinct keys match two distinct locks.
// ==========================================

export const initialEntities: Record<string, Entity> = {
  // Inventory items initially placed in world or inventory
  oxidized_key: {
    id: 'oxidized_key',
    name: 'Oxidized Iron Key',
    locationId: 'courtyard',
    description: 'A heavy, dark iron key coated with green-grey oxidation patina.',
    states: { inspected: false },
    isInteractable: true,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'KeyRound'
  },
  brass_key: {
    id: 'brass_key',
    name: 'Polished Brass Key',
    locationId: 'courtyard',
    description: 'A slender, bright brass key with intricate high-notched teeth.',
    states: { inspected: false },
    isInteractable: true,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Key'
  },

  // Interactive fixtures in the courtyard scene
  iron_lock: {
    id: 'iron_lock',
    name: 'Heavy Iron Lock',
    locationId: 'courtyard',
    description: 'A rugged iron tumbler securing the lower deadbolt. It has a square, rusted keyway.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Lock'
  },
  brass_latch: {
    id: 'brass_latch',
    name: 'Upper Brass Latch',
    locationId: 'courtyard',
    description: 'An ornate golden-brass latch locking the high hinge bar.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'LockKeyhole'
  },
  archive_door: {
    id: 'archive_door',
    name: 'Reinforced Archive Door',
    locationId: 'courtyard',
    description: 'Massive oak door reinforced with bronze bands. Sealed by twin locks.',
    states: { isOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'DoorClosed'
  }
};

export const challenge1Rules: GameRule[] = [
  // 1. Correct: Oxidized key on Iron Lock
  {
    id: 'rule_unlock_iron',
    challengeId: 'challenge_1',
    action: 'USE_ITEM_ON',
    sourceId: 'oxidized_key',
    targetId: 'iron_lock',
    conditions: [
      { type: 'INVENTORY_HAS', target: 'oxidized_key', expected: true },
      { type: 'ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', value: true }
      ],
      feedbackMessage: 'Click! The oxidized key bites into the rusted tumbler and turns smoothly. The lower iron deadbolt retracts.'
    },
    onFailure: {
      feedbackMessage: 'The iron lock is already unlocked.'
    }
  },

  // 2. Incorrect: Brass key on Iron Lock (Natural Physical Feedback)
  {
    id: 'rule_brass_on_iron_fail',
    challengeId: 'challenge_1',
    action: 'USE_ITEM_ON',
    sourceId: 'brass_key',
    targetId: 'iron_lock',
    conditions: [
      // Deliberately impossible condition to trigger natural causal pushback
      { type: 'FLAG_IS', target: '__never_pass__', expected: true }
    ],
    onSuccess: {
      effects: [],
      feedbackMessage: ''
    },
    onFailure: {
      feedbackMessage: 'The slender brass key rattles loosely in the square iron keyway. It slips back out into your hand without catching the pins.'
    }
  },

  // 3. Correct: Brass key on Brass Latch
  {
    id: 'rule_unlock_brass',
    challengeId: 'challenge_1',
    action: 'USE_ITEM_ON',
    sourceId: 'brass_key',
    targetId: 'brass_latch',
    conditions: [
      { type: 'INVENTORY_HAS', target: 'brass_key', expected: true },
      { type: 'ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', value: true }
      ],
      feedbackMessage: 'With a musical chime, the polished brass key rotates precisely. The high latch disengages.'
    },
    onFailure: {
      feedbackMessage: 'The brass latch is already disengaged.'
    }
  },

  // 4. Incorrect: Oxidized key on Brass Latch (Natural Physical Feedback)
  {
    id: 'rule_iron_on_brass_fail',
    challengeId: 'challenge_1',
    action: 'USE_ITEM_ON',
    sourceId: 'oxidized_key',
    targetId: 'brass_latch',
    conditions: [
      { type: 'FLAG_IS', target: '__never_pass__', expected: true }
    ],
    onSuccess: {
      effects: [],
      feedbackMessage: ''
    },
    onFailure: {
      feedbackMessage: 'The rough, oxidized iron key is far too thick for the delicate brass slot. It cannot even slide in.'
    }
  },

  // 5. Door Opening Rule: Push door when both locks are open
  {
    id: 'rule_open_archive_door',
    challengeId: 'challenge_1',
    action: 'ACTIVATE',
    targetId: 'archive_door',
    conditions: [
      { type: 'ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', expected: true },
      { type: 'ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'archive_door', property: 'isOpen', value: true }
      ],
      feedbackMessage: 'With both mechanisms released, you push gently. The heavy oak door glides open, revealing the grand observatory library beyond!'
    },
    onFailure: {
      feedbackMessage: 'You push against the heavy oak door, but it will not budge. One or more latches are still firmly engaged.'
    }
  }
];

export const challenge1: Challenge = {
  id: 'challenge_1',
  order: 1,
  title: 'Stage 1: The Archive Courtyard',
  locationId: 'courtyard',
  passage: {
    heading: 'Field Journal Entry #104 — The Outer Portal',
    source: 'Found tucked beneath the archway masonry:',
    paragraphs: [
      '“The ancient gatekeeper left strict provisions for entering the observatory vaults.',
      'The massive archive door is secured by twin mechanisms of differing metallurgies.',
      'The heavy iron lock accepts ONLY the dark, oxidized key, while the slender brass key was crafted exclusively for the high latch.',
      'Only when both locks have been smoothly disengaged will the heavy door swing inward.”'
    ],
    keyClues: [
      'iron lock accepts ONLY the dark, oxidized key',
      'slender brass key was crafted exclusively for the high latch',
      'both locks have been smoothly disengaged'
    ]
  },
  targetReadingSkill: 'literal_retrieval',
  ruleIds: [
    'rule_unlock_iron',
    'rule_brass_on_iron_fail',
    'rule_unlock_brass',
    'rule_iron_on_brass_fail',
    'rule_open_archive_door'
  ],
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'archive_door', property: 'isOpen', expected: true }
  ],
  completedMessage: 'Archive Door Unlocked! You have proven how literal retrieval guides physical action.'
};
