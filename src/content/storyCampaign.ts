import type { Entity, GameRule, Challenge, DecisionOption } from '../types/game';

// ============================================================================
// THE 7-ACT NARRATIVE CAMPAIGN: THE LOST OBSERVATORY
// Implements controlled branching, rich multi-document reading, persistent agency,
// anti-brute-force consequences, and strict zero-solution-state feedback.
// ============================================================================

// ============================================================================
// ACT I: ARRIVAL AT THE VAULT VESTIBULE (Archetype: MECHANISM & CLUE SELECTION)
// ============================================================================

export const ACT1_ENTITIES: Record<string, Entity> = {
  iron_lock: {
    id: 'iron_lock',
    name: 'Wrought-Iron Deadbolt',
    locationId: 'courtyard',
    description: 'A heavy forged iron lock bolt securing the lower vestibule portal. Needs the iron master key.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Lock'
  },
  brass_latch: {
    id: 'brass_latch',
    name: 'Upper Brass Cross-Latch',
    locationId: 'courtyard',
    description: 'A spring-tensioned brass lever arm blocking the door header.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sliders'
  },
  archive_door: {
    id: 'archive_door',
    name: 'Vestibule Oak Door',
    locationId: 'courtyard',
    description: 'Massive iron-banded oak portal leading into the central rotunda of the observatory.',
    states: { isOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'DoorClosed'
  },
  iron_key: {
    id: 'iron_key',
    name: 'Wrought-Iron Master Key',
    locationId: 'courtyard',
    description: 'An antique notched iron key found on the courtyard gatekeeper pedestal.',
    states: {},
    isInteractable: false,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON'],
    icon: 'Key'
  }
};

export const ACT1_RULES: GameRule[] = [
  // 1. Disengage Brass Latch
  {
    id: 'act1_rule_brass_latch',
    challengeId: 'act_1_vestibule',
    action: 'ACTIVATE',
    targetId: 'brass_latch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', value: true }
      ],
      feedbackMessage: 'Click. The brass spring latch lifts smoothly and rests on its catch.',
      soundEffect: 'latch_click',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: {
      feedbackMessage: 'The brass latch is already resting open on its catch.'
    }
  },
  // 2. Unlock Iron Lock with Key
  {
    id: 'act1_rule_iron_lock',
    challengeId: 'act_1_vestibule',
    action: 'USE_ITEM_ON',
    sourceId: 'iron_key',
    targetId: 'iron_lock',
    conditions: [
      { type: 'ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', value: true },
        { type: 'DISCOVER_FACT', target: 'iron_lock', value: 'The iron deadbolt accepts the gatekeeper master key.' }
      ],
      feedbackMessage: 'CLUNK. The heavy iron tumbler turns with deep mechanical resistance. The deadbolt slides back into the stone frame.',
      soundEffect: 'tumbler_turn',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'The deadbolt is already withdrawn.'
    }
  },
  // 3. Premature door push: neither open
  {
    id: 'act1_rule_door_fail_both',
    challengeId: 'act_1_vestibule',
    action: 'ACTIVATE',
    targetId: 'archive_door',
    conditions: [
      { type: 'ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', expected: false },
      { type: 'ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'THUD. The heavy oak doors remain rigid against both the upper latch and the lower deadbolt. The stone lintel shudders.',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 4. Premature door push: iron locked
  {
    id: 'act1_rule_door_fail_iron',
    challengeId: 'act_1_vestibule',
    action: 'ACTIVATE',
    targetId: 'archive_door',
    conditions: [
      { type: 'ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', expected: false },
      { type: 'ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', expected: true }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'CLANG. The door rattles slightly at the top, but the lower iron deadbolt refuses to yield. It requires the master key.',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 5. Premature door push: brass latched
  {
    id: 'act1_rule_door_fail_brass',
    challengeId: 'act_1_vestibule',
    action: 'ACTIVATE',
    targetId: 'archive_door',
    conditions: [
      { type: 'ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', expected: true },
      { type: 'ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'SNAP. The bottom of the door eases forward, but the upper brass latch snags the door header firmly in place.',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 6. Push door when both open -> SUCCESS & REVEAL BRANCHING CHOICE
  {
    id: 'act1_rule_door_success',
    challengeId: 'act_1_vestibule',
    action: 'ACTIVATE',
    targetId: 'archive_door',
    conditions: [
      { type: 'ENTITY_STATE', target: 'iron_lock', property: 'isUnlocked', expected: true },
      { type: 'ENTITY_STATE', target: 'brass_latch', property: 'isUnlocked', expected: true },
      { type: 'ENTITY_STATE', target: 'archive_door', property: 'isOpen', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'archive_door', property: 'isOpen', value: true },
        { type: 'DISCOVER_FACT', target: 'vestibule', value: 'The Great Rotunda links the East Sunken Archive and the West Hydraulic Vault.' }
      ],
      feedbackMessage: 'With a deep granite rumble, the counterweighted oak doors part. Cold mountain air rushes into the central rotunda of the Lost Observatory.',
      soundEffect: 'door_open_heavy',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'The vestibule doors are already fully open.'
    }
  }
];

export const ACT1_DECISIONS: DecisionOption[] = [
  {
    id: 'explore_archive',
    label: 'Explore East Wing: The Sunken Archive',
    description: 'Investigate the curator’s records and star charts to recover the missing optical components.',
    rationaleWhy: 'Focus on deciphering historical documents and celestial coordinate records.',
    downstreamHint: 'Unlocks the Archive path in Act II, leading to the recovery of the Quartz Optical Prism.',
    effects: [
      { type: 'RECORD_DECISION', target: 'act1_path_choice', value: 'archive', rationale: 'Prioritized historical star charts and optical recovery' },
      { type: 'TRANSITION_SCENE', target: 'act_2_archive', value: true }
    ]
  },
  {
    id: 'explore_hydraulics',
    label: 'Explore West Wing: The Hydraulic Vault',
    description: 'Descend to the subterranean boiler pumps to restore facility power and steam pressure.',
    rationaleWhy: 'Focus on mechanical stabilization and restoring the auxiliary steam loops.',
    downstreamHint: 'Unlocks the Hydraulic path in Act II, leading to auxiliary boiler stabilization.',
    effects: [
      { type: 'RECORD_DECISION', target: 'act1_path_choice', value: 'hydraulics', rationale: 'Prioritized restoring mechanical steam pressure' },
      { type: 'TRANSITION_SCENE', target: 'act_2_hydraulics', value: true }
    ]
  }
];

export const ACT1_SCENE: Challenge = {
  id: 'act_1_vestibule',
  order: 1,
  act: 1,
  title: 'Act I: The Sealed Vestibule',
  locationId: 'courtyard',
  archetype: 'MECHANISM',
  passage: {
    heading: 'Field Journal of Senior Curator Sterling — Entry #01',
    source: 'Bound leather journal discovered in the mountain gatehouse:',
    paragraphs: [
      'The storm at Mount Caelum has breached the lower perimeter. Ames and I have sealed the vestibule portal with the double security mechanism.',
      'To pass, one must disengage the upper brass cross-latch by hand, and withdraw the lower wrought-iron deadbolt using the gatekeeper key.',
      'Only when BOTH mechanisms are fully withdrawn will the oak portal yield to the counterweights. Forcing the door against either engaged bolt risks shattering the antique bronze pivot.'
    ],
    keyClues: [
      'upper brass cross-latch lifted by hand',
      'lower wrought-iron deadbolt unlocked with gatekeeper key',
      'both must be disengaged before the door is pushed'
    ],
    documents: [
      {
        id: 'doc_act1_journal',
        title: 'Curator’s Journal #01',
        type: 'field_journal',
        source: 'Mount Caelum Gatehouse',
        dateOrStamp: 'October 14, 1898',
        paragraphs: [
          'The storm at Mount Caelum has breached the lower perimeter. Ames and I have sealed the vestibule portal with the double security mechanism.',
          'To pass, one must disengage the upper brass cross-latch by hand, and withdraw the lower wrought-iron deadbolt using the gatekeeper key.',
          'Only when BOTH mechanisms are fully withdrawn will the oak portal yield to the counterweights.'
        ]
      },
      {
        id: 'doc_act1_station_map',
        title: 'Architectural Blueprint — Lower Vestibule',
        type: 'architectural_map',
        source: 'Surveyor’s Copper Plate',
        dateOrStamp: 'Plate VII — Mount Caelum Survey',
        paragraphs: [
          'Beyond the Vestibule Portal lies the Central Rotunda Concourse.',
          'The East Archway descends to the Sunken Archive (housing the library catalog and celestial glass vaults).',
          'The West Archway descends to the Subterranean Hydraulic Vault (housing the steam boilers, condensers, and main dynamos).'
        ]
      }
    ]
  },
  targetReadingSkill: 'literal_retrieval',
  ruleIds: ACT1_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'archive_door', property: 'isOpen', expected: true }
  ],
  completedMessage: 'Vestibule Unsealed! You read the security protocol and executed the dual-bolt sequence without damaging the antique pivots.',
  availableDecisions: ACT1_DECISIONS
};

// ============================================================================
// ACT II-A: THE SUNKEN ARCHIVE (Branch A: Archetype: INVESTIGATION & CLUE PINBOARD)
// ============================================================================

export const ACT2_ARCHIVE_ENTITIES: Record<string, Entity> = {
  curator_safe: {
    id: 'curator_safe',
    name: 'Curator’s Dial Safe',
    locationId: 'library',
    description: 'A heavy brass security safe embedded in the mahogany catalog desk. Features a mechanical numeral dial (0–9) and a release lever.',
    states: { dialPosition: 0, isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'CircleDot'
  },
  safe_lever: {
    id: 'safe_lever',
    name: 'Safe Release Lever',
    locationId: 'library',
    description: 'The polished bronze lever that commits the dial code to test the safe tumblers.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Sliders'
  },
  quartz_prism_item: {
    id: 'quartz_prism',
    name: '589nm Quartz Optical Prism',
    locationId: 'library',
    description: 'A flawless triangular prism of optical quartz, precision-cut to focus sodium-D spectral lines into the telescope focal plane.',
    states: { isRetrieved: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['PICKUP'],
    icon: 'Sparkles'
  }
};

export const ACT2_ARCHIVE_RULES: GameRule[] = [
  // 1. Cycle Dial (0 through 9)
  {
    id: 'act2_rule_cycle_dial',
    challengeId: 'act_2_archive',
    action: 'ACTIVATE',
    targetId: 'curator_safe',
    conditions: [
      { type: 'ENTITY_STATE', target: 'curator_safe', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        // Custom handled in store or increment dial
      ],
      feedbackMessage: 'You rotate the heavy brass dial. Tumbler pins click inside.'
    },
    onFailure: { feedbackMessage: 'The safe is already unlocked.' }
  },
  // 2. Commit Lever with WRONG DIAL (!= 4)
  {
    id: 'act2_rule_lever_fail',
    challengeId: 'act_2_archive',
    action: 'ACTIVATE',
    targetId: 'safe_lever',
    conditions: [],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'CLATTER-SNAP! The safe release lever jams solid against the misaligned tumblers. The acoustic alarm chime rings through the archive.',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 3. Commit Lever with CORRECT DIAL (== 4)
  {
    id: 'act2_rule_lever_success',
    challengeId: 'act_2_archive',
    action: 'ACTIVATE',
    targetId: 'safe_lever',
    conditions: [
      { type: 'ENTITY_STATE', target: 'curator_safe', property: 'dialPosition', expected: 4 },
      { type: 'ENTITY_STATE', target: 'curator_safe', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'curator_safe', property: 'isUnlocked', value: true },
        { type: 'SET_ENTITY_STATE', target: 'quartz_prism', property: 'isRetrieved', value: true },
        { type: 'ADD_INVENTORY', target: 'quartz_prism', value: true },
        { type: 'DISCOVER_FACT', target: 'archive', value: 'The 589nm Quartz Prism was preserved in Safe #4 according to the Solstice deduction.' }
      ],
      feedbackMessage: 'KER-CHUNK. The four internal brass discs fall into perfect alignment. The heavy circular door swings open, revealing the velvet-lined tray holding the 589nm Quartz Prism!',
      soundEffect: 'safe_unlock',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'The safe is already open.'
    }
  }
];

export const ACT2_ARCHIVE_SCENE: Challenge = {
  id: 'act_2_archive',
  order: 2,
  act: 2,
  title: 'Act II: The Sunken Archive',
  locationId: 'library',
  archetype: 'INVESTIGATION',
  passage: {
    heading: 'Curator Sterling’s Coded Memoranda',
    source: 'Recovered from the mahogany desk in the Sunken Archive:',
    paragraphs: [
      '“Ames feared the transit would bring looters, so the optical refraction prism was locked inside the desk safe.',
      'The code is simple for an astronomer, yet opaque to thieves: take the calendar month of the Summer Solstice, and subtract the number of Lunar Stations observed at Mount Caelum.',
      'Setting the dial to any other numeral and forcing the release lever will seize the locking dogs for an hour.”'
    ],
    keyClues: [
      'month of Summer Solstice minus number of Lunar Stations',
      'forcing the lever with wrong numeral seizes the locking dogs'
    ],
    documents: [
      {
        id: 'doc_archive_memo',
        title: 'Curator’s Desk Memorandum',
        type: 'personal_diary',
        source: 'Senior Curator Sterling’s Private Notebook',
        dateOrStamp: 'June 1898',
        paragraphs: [
          '“Ames feared the transit would bring looters, so the optical refraction prism was locked inside the desk safe.',
          'The code is simple for an astronomer, yet opaque to thieves: take the calendar month of the Summer Solstice, and subtract the number of Lunar Stations observed at Mount Caelum.”'
        ]
      },
      {
        id: 'doc_archive_almanac',
        title: 'Observatory Celestial Almanac',
        type: 'field_journal',
        source: 'Mount Caelum Ephemeris Table',
        dateOrStamp: 'Table 4: Solstices & Observational Stations',
        paragraphs: [
          'Summer Solstice occurs punctually in Month 06 (June).',
          'Mount Caelum maintains precisely 2 active Lunar Observation Stations (East Tower & West Parapet).',
          'The Solar meridian transit begins at solar noon (Hour 12).'
        ]
      }
    ]
  },
  targetReadingSkill: 'cause_effect',
  ruleIds: ACT2_ARCHIVE_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'curator_safe', property: 'isUnlocked', expected: true }
  ],
  completedMessage: 'Archive Safe Deciphered! You integrated the Solstice Almanac (Month 6 - 2 Stations = Code 4) to recover the 589nm Quartz Optical Prism.'
};

// ============================================================================
// ACT II-B: THE HYDRAULIC VAULT (Branch B: Archetype: MECHANISM - STEAM PRIMING)
// ============================================================================

export const ACT2_HYDRAULIC_ENTITIES: Record<string, Entity> = {
  cold_water_intake: {
    id: 'cold_water_intake',
    name: 'Condenser Cold-Water Valve',
    locationId: 'laboratory',
    description: 'A cast-iron wheel valve controlling chilled glacial spring water into the boiler jacket.',
    states: { isOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Droplets'
  },
  pilot_burner: {
    id: 'pilot_burner',
    name: 'Kerosene Pilot Burner',
    locationId: 'laboratory',
    description: 'The primary ignition nozzle beneath the boiler combustion drum.',
    states: { isLit: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Flame'
  },
  boiler_pressure_gauge: {
    id: 'boiler_pressure_gauge',
    name: 'Steam Pressure Gauge',
    locationId: 'laboratory',
    description: 'Brass dial tracking steam chamber pressure in pounds per square inch.',
    states: { psi: 0, status: 'COLD' },
    isInteractable: false,
    isInInventory: false,
    allowedActions: ['INSPECT'],
    icon: 'Gauge'
  }
};

export const ACT2_HYDRAULIC_RULES: GameRule[] = [
  // 1. Open water valve
  {
    id: 'act2_rule_water_open',
    challengeId: 'act_2_hydraulics',
    action: 'ACTIVATE',
    targetId: 'cold_water_intake',
    conditions: [
      { type: 'ENTITY_STATE', target: 'cold_water_intake', property: 'isOpen', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'cold_water_intake', property: 'isOpen', value: true },
        { type: 'SET_ENTITY_STATE', target: 'boiler_pressure_gauge', property: 'status', value: 'PRIMED' }
      ],
      feedbackMessage: 'Shhh-gurgle! Cold glacial water rushes through the intake manifold, filling the boiler cooling coils.',
      soundEffect: 'water_flow',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The water intake is already open and supplying the boiler coils.' }
  },
  // 2. Firing burner DRY -> CAUSAL BLOWOUT
  {
    id: 'act2_rule_burner_fail_dry',
    challengeId: 'act_2_hydraulics',
    action: 'ACTIVATE',
    targetId: 'pilot_burner',
    conditions: [
      { type: 'ENTITY_STATE', target: 'cold_water_intake', property: 'isOpen', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'HISSS-BANG! The dry boiler pipes warp under intense heat! The copper safety blowout disk ruptures, filling the chamber with stinging vapor.',
      consequenceVisual: 'steam_burst'
    }
  },
  // 3. Firing burner when flooded -> SUCCESSFUL STEAM BUILD
  {
    id: 'act2_rule_burner_success',
    challengeId: 'act_2_hydraulics',
    action: 'ACTIVATE',
    targetId: 'pilot_burner',
    conditions: [
      { type: 'ENTITY_STATE', target: 'cold_water_intake', property: 'isOpen', expected: true },
      { type: 'ENTITY_STATE', target: 'pilot_burner', property: 'isLit', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'pilot_burner', property: 'isLit', value: true },
        { type: 'SET_ENTITY_STATE', target: 'boiler_pressure_gauge', property: 'psi', value: 60 },
        { type: 'SET_ENTITY_STATE', target: 'boiler_pressure_gauge', property: 'status', value: 'OPTIMAL' },
        { type: 'DISCOVER_FACT', target: 'hydraulics', value: 'Boiler primary loop is stabilized at 60 PSI steam.' }
      ],
      feedbackMessage: 'ROAR. The kerosene burner ignites with a blue flame. Steam pressure builds smoothly on the gauge, rising to a steady 60 PSI.',
      soundEffect: 'furnace_ignite',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The pilot burner is already firing steadily.' }
  }
];

export const ACT2_HYDRAULIC_SCENE: Challenge = {
  id: 'act_2_hydraulics',
  order: 2,
  act: 2,
  title: 'Act II: The Subterranean Hydraulic Vault',
  locationId: 'laboratory',
  archetype: 'MECHANISM',
  passage: {
    heading: 'Chief Machinist Aris — Boiler Operating Instructions',
    source: 'Stenciled brass warning plate bolted to the steam boiler jacket:',
    paragraphs: [
      'CAUTION: The copper heat exchanger coils expand rapidly when heated.',
      'The condenser cold-water valve MUST be opened to flood the water jacket BEFORE the kerosene pilot burner is fired.',
      'Firing the burner while the water jacket is dry will instantly warp the coils, causing the safety disk to blow and flooding the gallery with steam.'
    ],
    keyClues: [
      'cold-water valve MUST be opened to flood water jacket BEFORE burner is fired',
      'firing burner dry warps coils and blows safety disk'
    ],
    documents: [
      {
        id: 'doc_boiler_manual',
        title: 'Boiler Operating Manual Plate #3',
        type: 'maintenance_manual',
        source: 'Mount Caelum Engineering Div.',
        dateOrStamp: 'Plate #3 — High Pressure Operations',
        paragraphs: [
          'The condenser cold-water valve MUST be opened to flood the water jacket BEFORE the kerosene pilot burner is fired.',
          'Firing the burner while the water jacket is dry will instantly warp the coils, causing the safety disk to blow.'
        ]
      }
    ]
  },
  targetReadingSkill: 'cause_effect',
  ruleIds: ACT2_HYDRAULIC_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'pilot_burner', property: 'isLit', expected: true }
  ],
  completedMessage: 'Hydraulic Boiler Stabilized! You verified the causal sequence: flooded water jacket first, preventing a disastrous thermal blowout.'
};

// ============================================================================
// ACT III: THE GREAT POWER JUNCTION (Archetype: RESOURCE ALLOCATION & SOCIAL TELEGRAPH)
// ============================================================================

export const ACT3_ENTITIES: Record<string, Entity> = {
  telegraph_terminal: {
    id: 'telegraph_terminal',
    name: 'Acoustic Telegraph Transceiver',
    locationId: 'junction',
    description: 'An acoustic telegraph apparatus connected to the observatory’s internal communication line. Displays logged transmissions from Chief Machinist Aris.',
    states: { activeMessageIndex: 0 },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Radio'
  },
  archive_power_switch: {
    id: 'archive_power_switch',
    name: 'Archive Optical Scanner Breaker (80 kW)',
    locationId: 'junction',
    description: 'Heavy knife switch directing dynamo current to the East Wing catalog scanners and illuminated optical galleries.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Zap'
  },
  hydraulic_power_switch: {
    id: 'hydraulic_power_switch',
    name: 'Hydraulic Core Lift Breaker (80 kW)',
    locationId: 'junction',
    description: 'Heavy knife switch directing current to the West Wing high-pressure steam pumps and dome elevator hoist.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Zap'
  },
  master_junction_bus: {
    id: 'master_junction_bus',
    name: 'Main Dynamo Bus Bar (Max 100 kW)',
    locationId: 'junction',
    description: 'The master copper conductor bar. Can safely carry 100 kW. Engaging both 80 kW breakers simultaneously will trip the master breaker.',
    states: { loadKw: 0, isTripped: false },
    isInteractable: false,
    isInInventory: false,
    allowedActions: ['INSPECT'],
    icon: 'Sliders'
  }
};

export const ACT3_RULES: GameRule[] = [
  // 1. Toggle Archive Breaker
  {
    id: 'act3_rule_toggle_archive',
    challengeId: 'act_3_junction',
    action: 'ACTIVATE',
    targetId: 'archive_power_switch',
    conditions: [],
    onSuccess: {
      effects: [
        // Managed dynamically in store
      ],
      feedbackMessage: 'You engage the Archive Optical Scanner breaker.'
    },
    onFailure: { feedbackMessage: '' }
  },
  // 2. Toggle Hydraulic Breaker
  {
    id: 'act3_rule_toggle_hydraulic',
    challengeId: 'act_3_junction',
    action: 'ACTIVATE',
    targetId: 'hydraulic_power_switch',
    conditions: [],
    onSuccess: {
      effects: [],
      feedbackMessage: 'You engage the Hydraulic Core Lift breaker.'
    },
    onFailure: { feedbackMessage: '' }
  }
];

export const ACT3_DECISIONS: DecisionOption[] = [
  {
    id: 'divert_to_archive',
    label: 'Commit Power Route: The Sunken Archive & Optical Gallery',
    description: 'Energize the optical scanner banks and illuminate the East Wing galleries. The West Hydraulic Lift will remain unpowered.',
    rationaleWhy: 'Ensures crystal-clear optical telemetry and illuminated transit through the East concourses.',
    downstreamHint: 'In Act IV, the East Optical Concourse will be brightly illuminated and safe. In Act VII, the celestial projection table will be fully automated.',
    effects: [
      { type: 'POWER_SYSTEM', target: 'archive', value: true },
      { type: 'RECORD_DECISION', target: 'power_allocation', value: 'archive', rationale: 'Allocated dynamo current to Archive Optical Scanners' },
      { type: 'DISCOVER_FACT', target: 'junction', value: 'Dynamos routed to East Wing. West Hydraulic corridors unpowered.' },
      { type: 'TRANSITION_SCENE', target: 'act_4_navigation', value: true }
    ]
  },
  {
    id: 'divert_to_hydraulics',
    label: 'Commit Power Route: The Hydraulic Core & Elevator Hoist',
    description: 'Energize the high-pressure steam pumps and activate the heavy vertical elevator. The East Archive will remain in shadow.',
    rationaleWhy: 'Ensures effortless vertical transport and maximum steam pressure for rotating the heavy dome.',
    downstreamHint: 'In Act IV, the West Elevator shaft will be active. In Act VII, the massive telescope rotation gears will spin with hydraulic ease.',
    effects: [
      { type: 'POWER_SYSTEM', target: 'laboratory', value: true },
      { type: 'RECORD_DECISION', target: 'power_allocation', value: 'laboratory', rationale: 'Allocated dynamo current to Hydraulic Core & Elevator' },
      { type: 'DISCOVER_FACT', target: 'junction', value: 'Dynamos routed to West Wing. East Archive galleries dark.' },
      { type: 'TRANSITION_SCENE', target: 'act_4_navigation', value: true }
    ]
  }
];

export const ACT3_SCENE: Challenge = {
  id: 'act_3_junction',
  order: 3,
  act: 3,
  title: 'Act III: The Great Power Junction',
  locationId: 'junction',
  archetype: 'RESOURCE_DECISION',
  passage: {
    heading: 'Chief Machinist Aris — Load Distribution Log & Telegraph',
    source: 'Pinned to the master slate distribution panel:',
    paragraphs: [
      'ATTENTION OPERATOR: The auxiliary dynamos are operating on emergency reserve, producing exactly 100 kW of continuous current.',
      'The Archive Optical Scanners draw 80 kW. The Hydraulic Lift Pumps draw 80 kW.',
      'MUTUAL EXCLUSION RULE: You must choose ONE destination to receive current. Attempting to close both breakers will overload the bus bar (160 kW total load) and instantly trip the master breaker.',
      'Your choice will determine which concourse is accessible for the ascent to the Dome.'
    ],
    keyClues: [
      'dynamos produce 100 kW total',
      'Archive draws 80 kW, Hydraulic Lift draws 80 kW',
      'must choose ONE destination to receive current',
      'closing both trips the master breaker'
    ],
    documents: [
      {
        id: 'doc_junction_telegraph',
        title: 'Telegraph Dispatch from Machinist Aris',
        type: 'telegraph',
        source: 'Internal Line — Station 4',
        dateOrStamp: 'Transmitted 22:14 GMT',
        paragraphs: [
          '“To whoever reaches the junction: Ames locked down the dome before the transit.',
          'If you need the optical charts, power the Archive. If you need the vertical elevator, power the Hydraulics.',
          'Do NOT attempt to run both on emergency dynamos. The copper coils will melt. Make your choice and lock the breaker.”'
        ]
      },
      {
        id: 'doc_junction_schematic',
        title: 'Electrical Bus Distribution Chart',
        type: 'maintenance_manual',
        source: 'Engineering Department Blueprint',
        dateOrStamp: 'Circuit #94-B',
        paragraphs: [
          'Bus Bar Capacity: 100 kW maximum continuous rating.',
          'Breaker Alpha: East Archive Scanners (80 kW).',
          'Breaker Beta: West Hydraulic Pumps (80 kW).',
          'Safety Breaker Trip Threshold: 110 kW.'
        ]
      }
    ]
  },
  targetReadingSkill: 'negative_constraint',
  ruleIds: ACT3_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'FLAG_IS', target: 'act3_power_committed', expected: true }
  ],
  completedMessage: 'Power Allocation Committed! You respected the 100 kW capacity constraint and directed power with clear strategic intent.',
  availableDecisions: ACT3_DECISIONS
};

// ============================================================================
// ACT IV: CONSEQUENTIAL NAVIGATION (Archetype: SPATIAL NAVIGATION)
// ============================================================================

export const ACT4_ENTITIES: Record<string, Entity> = {
  concourse_wayfinder: {
    id: 'concourse_wayfinder',
    name: 'Transit Wayfinder Terminal',
    locationId: 'junction',
    description: 'Directional brass station indicator pointing toward the Dome ascent routes.',
    states: { currentCorridor: 'Junction Central' },
    isInteractable: false,
    isInInventory: false,
    allowedActions: ['INSPECT'],
    icon: 'Compass'
  },
  east_optical_portal: {
    id: 'east_optical_portal',
    name: 'East Optical Concourse Gate',
    locationId: 'junction',
    description: 'Archway leading through the illuminated optical galleries toward the Dome Vestibule.',
    states: { isAccessible: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'DoorClosed'
  },
  west_hydraulic_lift: {
    id: 'west_hydraulic_lift',
    name: 'West Hydraulic Elevator Gate',
    locationId: 'junction',
    description: 'Iron cage elevator hoist ascending through the steam shaft to the Dome Rotunda.',
    states: { isAccessible: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'DoorClosed'
  }
};

export const ACT4_RULES: GameRule[] = [
  // 1. Enter East Gate when Archive was powered in Act 3
  {
    id: 'act4_rule_enter_east_success',
    challengeId: 'act_4_navigation',
    action: 'ACTIVATE',
    targetId: 'east_optical_portal',
    conditions: [
      { type: 'DECISION_EQUALS', target: 'power_allocation', expected: 'archive' }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_FLAG', target: 'act4_navigation_complete', value: true },
        { type: 'DISCOVER_FACT', target: 'navigation', value: 'Navigated East Optical Concourse under radiant electric illumination.' }
      ],
      feedbackMessage: 'The East Optical Concourse glows with warm incandescent lights. You walk along polished brass corridors, passing projection mirrors directly to the Dome entrance!',
      soundEffect: 'footsteps_stone',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'The East corridor is pitch black. The dynamos are not routing power to this sector.'
    }
  },
  // 2. Enter West Lift when Hydraulics was powered in Act 3
  {
    id: 'act4_rule_enter_west_success',
    challengeId: 'act_4_navigation',
    action: 'ACTIVATE',
    targetId: 'west_hydraulic_lift',
    conditions: [
      { type: 'DECISION_EQUALS', target: 'power_allocation', expected: 'laboratory' }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_FLAG', target: 'act4_navigation_complete', value: true },
        { type: 'DISCOVER_FACT', target: 'navigation', value: 'Ascended West Hydraulic Elevator under steady steam hoist power.' }
      ],
      feedbackMessage: 'The iron elevator car hums with steady hydraulic power. With a smooth hiss of pressurized pistons, the hoist lifts you swiftly to the Dome level!',
      soundEffect: 'elevator_run',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'The elevator sits dead and unpowered in its guide rails. The dynamos are routed elsewhere.'
    }
  }
];

export const ACT4_SCENE: Challenge = {
  id: 'act_4_navigation',
  order: 4,
  act: 4,
  title: 'Act IV: Consequential Navigation',
  locationId: 'junction',
  archetype: 'NAVIGATION',
  passage: {
    heading: 'Concourse Wayfinding & Hazard Advisory',
    source: 'Architectural notice posted at the junction crossroads:',
    paragraphs: [
      'The central concourse bifurcates into two distinct approaches to the Great Dome:',
      'EAST APPROACH (The Optical Gallery): Safe and wide, but requires active dynamo current to illuminate the hazardous reflective glass flooring.',
      'WEST APPROACH (The Hydraulic Elevator): Bypasses the stairs completely, but requires pressurized hydraulic lift current to operate the hoist car.',
      'Attempting to navigate an unpowered corridor in the dark or entering an unpowered elevator shaft will halt your progress. Choose the path matching your established power routing.'
    ],
    keyClues: [
      'East Optical Gallery requires active dynamo illumination',
      'West Hydraulic Elevator requires hydraulic lift current',
      'proceed through the corridor energized by your Act III decision'
    ]
  },
  targetReadingSkill: 'multi_condition',
  ruleIds: ACT4_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'FLAG_IS', target: 'act4_navigation_complete', expected: true }
  ],
  completedMessage: 'Concourse Navigated! Your Act III power routing directly opened your chosen approach to the summit.'
};

// ============================================================================
// ACT V: THE ADAPTIVE DIRECTOR SCENE (Archetype: INVESTIGATION OR SEQUENCING)
// Tailored dynamically by AI Game Director based on diagnosed learner weakness!
// ============================================================================

export const ACT5_ENTITIES: Record<string, Entity> = {
  emergency_telemetry_terminal: {
    id: 'emergency_telemetry_terminal',
    name: 'Emergency Relief Telemetry Screen',
    locationId: 'junction',
    description: 'Phosphor terminal monitoring steam relief pressure and relay shunt integrity.',
    states: { shuntState: 'BURNED' },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Radio'
  },
  replacement_shunt: {
    id: 'replacement_shunt',
    name: 'Ceramic Safety Shunt',
    locationId: 'junction',
    description: 'A spare ceramic current limiter to restore the blown emergency circuit.',
    states: {},
    isInteractable: false,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON'],
    icon: 'Zap'
  }
};

export const ACT5_RULES: GameRule[] = [
  // Causal Shunt Repair
  {
    id: 'act5_rule_replace_shunt',
    challengeId: 'act_5_adaptive',
    action: 'USE_ITEM_ON',
    sourceId: 'replacement_shunt',
    targetId: 'emergency_telemetry_terminal',
    conditions: [
      { type: 'ENTITY_STATE', target: 'emergency_telemetry_terminal', property: 'shuntState', expected: 'BURNED' }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'emergency_telemetry_terminal', property: 'shuntState', value: 'RESTORED' },
        { type: 'SET_FLAG', target: 'act5_adaptive_complete', value: true },
        { type: 'DISCOVER_FACT', target: 'adaptive', value: 'Diagnostic incident log analyzed: causal root determined and relay shunt restored.' }
      ],
      feedbackMessage: 'SNAP-CLICK. The ceramic shunt seats into the phosphor terminal block. The green calibration filament glows steadily: emergency relay online!',
      soundEffect: 'circuit_click',
      consequenceVisual: 'circuit_spark'
    },
    onFailure: { feedbackMessage: 'The emergency shunt is already installed and operating.' }
  }
];

export const ACT5_SCENE: Challenge = {
  id: 'act_5_adaptive',
  order: 5,
  act: 5,
  title: 'Act V: The Adaptive Diagnostic Chamber',
  locationId: 'junction',
  archetype: 'INVESTIGATION',
  passage: {
    heading: 'Incident Log #409 — Root Cause Analysis',
    source: 'Emergency terminal crash log recovered from the Relay Room:',
    paragraphs: [
      'At 23:41, the primary dome interlock failed to respond.',
      'Telemetry analysis reveals that the ceramic shunt did NOT fail due to power surge. Rather, sudden pressure drop in the auxiliary cooling lines caused thermal overheating of the relay coil, which in turn melted the ceramic shunt.',
      'To restore communication with the dome, the operator must replace the burned ceramic shunt with the insulated spare, confirming that auxiliary coolant is stable.'
    ],
    keyClues: [
      'shunt failed due to thermal overheating after coolant pressure drop',
      'replace burned ceramic shunt with insulated spare to restore communication'
    ],
    documents: [
      {
        id: 'doc_incident_log',
        title: 'Incident Log #409',
        type: 'emergency_log',
        source: 'Relay Room Terminal Memory',
        dateOrStamp: 'Log Timestamp: 23:41:04',
        paragraphs: [
          'At 23:41, the primary dome interlock failed to respond.',
          'Telemetry analysis reveals that the ceramic shunt did NOT fail due to power surge. Rather, sudden pressure drop in the auxiliary cooling lines caused thermal overheating of the relay coil, which in turn melted the ceramic shunt.',
          'To restore communication with the dome, the operator must replace the burned ceramic shunt with the insulated spare.'
        ]
      }
    ]
  },
  targetReadingSkill: 'cause_effect',
  ruleIds: ACT5_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'FLAG_IS', target: 'act5_adaptive_complete', expected: true }
  ],
  completedMessage: 'Diagnostic Chamber Cleared! You traced the causal chain through the telemetry log and restored the master dome relay.'
};

// ============================================================================
// ACT VII: THE MASTER CELESTIAL ROTUNDA (Archetype: SYNTHESIS & GRAND ACTUATION)
// Strict Zero-Solution-State UI: Neutral Dials, No Green Cheats, Committed Consequence!
// ============================================================================

export const ACT7_ENTITIES: Record<string, Entity> = {
  azimuth_dial: {
    id: 'azimuth_dial',
    name: 'Telescope Azimuth Dial',
    locationId: 'dome',
    description: 'A heavy geared circular bronze dial calibrated to rotate the 40-inch telescope carriage to cardinal compass bearings (East, South, North).',
    states: { heading: 'East' },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Compass'
  },
  shutter_lock_wheel: {
    id: 'shutter_lock_wheel',
    name: 'Copper Shutter Dogging Wheel',
    locationId: 'dome',
    description: 'Heavy geared ship’s wheel that unseals the weather locks holding the dome roof petals closed.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'CircleDot'
  },
  star_clock_sync_switch: {
    id: 'star_clock_sync_switch',
    name: 'Sidereal Star-Clock Synchronizer',
    locationId: 'dome',
    description: 'Brass pendulum clutch matching telescope tracking speed to Earth’s sidereal rotation.',
    states: { isSynchronized: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Clock'
  },
  quartz_receptacle: {
    id: 'quartz_receptacle',
    name: 'Spectroscopic Prism Cradle',
    locationId: 'dome',
    description: 'The precision optical slot inside the telescope eyepiece tube.',
    states: { hasPrism: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Sparkles'
  },
  master_aperture_lever: {
    id: 'master_aperture_lever',
    name: 'Master Celestial Actuator Lever',
    locationId: 'dome',
    description: 'The massive counterbalanced bronze lever that commits all alignments and glides open the observatory dome.',
    states: { isDomeOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Sliders'
  }
};

export const ACT7_RULES: GameRule[] = [
  // 1. Cycle Azimuth Bearing: East -> South -> North
  {
    id: 'act7_rule_cycle_azimuth',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'azimuth_dial',
    conditions: [
      { type: 'ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', expected: false }
    ],
    onSuccess: {
      effects: [],
      feedbackMessage: 'You rotate the heavy worm-drive azimuth bearing.'
    },
    onFailure: { feedbackMessage: 'The telescope bearing is locked in observation position.' }
  },
  // 2. Dog / Unseal Shutter Wheel
  {
    id: 'act7_rule_toggle_shutter',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'shutter_lock_wheel',
    conditions: [
      { type: 'ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', value: true }
      ],
      feedbackMessage: 'CLANK-RATCHET. The four heavy dogging clamps withdraw from the roof rim.',
      soundEffect: 'ratchet_turn',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The shutter dogs are already unsealed.' }
  },
  // 3. Sync Sidereal Clock
  {
    id: 'act7_rule_sync_clock',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'star_clock_sync_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', value: true }
      ],
      feedbackMessage: 'TICK... TICK... TICK. The escapement gears mesh with the master observatory chronometer.',
      soundEffect: 'clock_tick',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The star clock is already synchronized.' }
  },
  // 4. Place Quartz Prism into Receptacle
  {
    id: 'act7_rule_insert_prism',
    challengeId: 'act_7_dome',
    action: 'USE_ITEM_ON',
    sourceId: 'quartz_prism',
    targetId: 'quartz_receptacle',
    conditions: [
      { type: 'ENTITY_STATE', target: 'quartz_receptacle', property: 'hasPrism', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'quartz_receptacle', property: 'hasPrism', value: true },
        { type: 'REMOVE_INVENTORY', target: 'quartz_prism', value: true },
        { type: 'DISCOVER_FACT', target: 'dome', value: '589nm Quartz Optical Prism secured in the eyepiece focal train.' }
      ],
      feedbackMessage: 'Click. The triangular quartz prism glides into its velvet-lined brass cradle. Spectral glints sparkle across the lens.',
      soundEffect: 'prism_chime',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The prism cradle is already loaded.' }
  },
  // 5. Premature Master Lever Pull: Misaligned (Physical Consequence!)
  {
    id: 'act7_rule_master_lever_fail',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'master_aperture_lever',
    conditions: [],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'GROAN-SHUDDER! You haul back on the Master Actuator, but the dome mechanisms seize violently! The safety interlocks refuse to engage until all astronomical alignments match the Ephemeris.',
      consequenceVisual: 'shutter_slam'
    }
  },
  // 6. Master Lever Pull: PERFECT SYNTHESIS
  {
    id: 'act7_rule_master_lever_success',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'master_aperture_lever',
    conditions: [
      { type: 'ENTITY_STATE', target: 'azimuth_dial', property: 'heading', expected: 'North' },
      { type: 'ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', expected: true },
      { type: 'ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', value: true },
        { type: 'SET_FLAG', target: 'game_won', value: true },
        { type: 'DISCOVER_FACT', target: 'finale', value: 'The Great 40-Inch Refractor is fully aligned with Polaris under midnight skies.' }
      ],
      feedbackMessage: 'A deep harmonic rumble reverberates through the mountain bedrock! The massive counterweights descend. The copper dome petals glide open to the midnight sky. Starlight streams directly down the 40-foot brass barrel of the Great Refractor!',
      soundEffect: 'dome_open_magnificent',
      consequenceVisual: 'door_unlock'
    },
    onFailure: { feedbackMessage: 'The dome is already opened to the stars.' }
  }
];

export const ACT7_SCENE: Challenge = {
  id: 'act_7_dome',
  order: 7,
  act: 7,
  title: 'Act VII: Master Celestial Synthesis',
  locationId: 'dome',
  archetype: 'SYNTHESIS',
  passage: {
    heading: 'The Master Celestial Ephemeris — Final Directive',
    source: 'Engraved bronze plaque on the master observer’s pedestal:',
    paragraphs: [
      'To align the Great 40-Inch Refractor for the Polaris Celestial Transit:',
      '1. ROTATE the azimuth bearing until facing true NORTH to track the polar axis.',
      '2. UNSEAL the copper shutter dogs using the geared wheel.',
      '3. SYNCHRONIZE the star clock pendulum with sidereal time.',
      'Only when all conditions are fulfilled will pulling the Master Aperture Actuator open the copper petals without tearing the drive chain.'
    ],
    keyClues: [
      'azimuth bearing must face true NORTH',
      'unseal copper shutter dogs using the wheel',
      'synchronize star clock pendulum with sidereal time',
      'pull master actuator only when all three are fulfilled'
    ]
  },
  targetReadingSkill: 'synthesis',
  ruleIds: ACT7_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', expected: true }
  ],
  completedMessage: 'THE LOST OBSERVATORY LIVES AGAIN! Through pure reading comprehension, deliberate choice, and mental model synthesis, you restored the pinnacle of Victorian astronomy!'
};

// ============================================================================
// CAMPAIGN SCENE REGISTRY
// ============================================================================

export const CAMPAIGN_SCENES: Record<string, Challenge> = {
  act_1_vestibule: ACT1_SCENE,
  act_2_archive: ACT2_ARCHIVE_SCENE,
  act_2_hydraulics: ACT2_HYDRAULIC_SCENE,
  act_3_junction: ACT3_SCENE,
  act_4_navigation: ACT4_SCENE,
  act_5_adaptive: ACT5_SCENE,
  act_7_dome: ACT7_SCENE
};

export const ALL_CAMPAIGN_RULES: GameRule[] = [
  ...ACT1_RULES,
  ...ACT2_ARCHIVE_RULES,
  ...ACT2_HYDRAULIC_RULES,
  ...ACT3_RULES,
  ...ACT4_RULES,
  ...ACT5_RULES,
  ...ACT7_RULES
];
