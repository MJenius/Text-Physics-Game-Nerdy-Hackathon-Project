import type { Entity, GameRule, Challenge, DecisionOption } from '../types/game';

// ============================================================================
// THE 7-ACT PERSISTENT NARRATIVE CAMPAIGN: THE LOST OBSERVATORY
// Implements:
//   READ → INTERPRET → DECIDE → ACT → CONSEQUENCE → DISCOVER → REINTERPRET → CONTINUE
// Zero green answer indicators! Physical and narrative consequences carry forward.
// ============================================================================

// ============================================================================
// ACT I: ARRIVAL AT MOUNT CAELUM (Archetype: NAVIGATION & DISCOVERY)
// ============================================================================

export const ACT1_ENTITIES: Record<string, Entity> = {
  courtyard_pedestal: {
    id: 'courtyard_pedestal',
    name: 'Gatekeeper Stone Pedestal',
    locationId: 'courtyard',
    description: 'An antique carved stone pillar near the overgrown gateway. An iron key rests in an open niche.',
    states: { hasKey: true },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['INSPECT', 'PICKUP'],
    icon: 'Search'
  },
  iron_lock: {
    id: 'iron_lock',
    name: 'Wrought-Iron Deadbolt',
    locationId: 'courtyard',
    description: 'A heavy forged iron lock bolt securing the lower vestibule portal. Requires the iron master key.',
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
    description: 'A spring-tensioned brass lever arm blocking the door header. Must be lifted by hand.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sliders'
  },
  archive_door: {
    id: 'archive_door',
    name: 'Vestibule Oak Portal',
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
  // 1. Pick up key from pedestal if needed
  {
    id: 'act1_rule_pickup_key',
    challengeId: 'act_1_vestibule',
    action: 'PICKUP',
    targetId: 'courtyard_pedestal',
    conditions: [
      { type: 'ENTITY_STATE', target: 'courtyard_pedestal', property: 'hasKey', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'courtyard_pedestal', property: 'hasKey', value: false },
        { type: 'ADD_INVENTORY', target: 'iron_key', value: true },
        { type: 'DISCOVER_FACT', target: 'courtyard', value: 'The gatekeeper pedestal held the master iron deadbolt key.' }
      ],
      feedbackMessage: 'You retrieved the Wrought-Iron Master Key from the stone niche.',
      soundEffect: 'latch_click',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The pedestal niche is empty.' }
  },
  // 2. Disengage Brass Latch
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
      feedbackMessage: 'Click. The upper brass spring latch lifts smoothly and rests on its safety catch.',
      soundEffect: 'latch_click',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The brass latch is already resting open on its catch.' }
  },
  // 3. Unlock Iron Lock with Key
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
    onFailure: { feedbackMessage: 'The deadbolt is already withdrawn.' }
  },
  // 4. Push door with neither open
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
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 5. Push door with iron locked
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
      feedbackMessage: 'CLANG. The door rattles at the top, but the lower iron deadbolt refuses to yield. It requires the master key.',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 6. Push door with brass latched
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
      feedbackMessage: 'SCREEECH. The lower bolt is free, but the door wedges violently against the upper brass cross-latch!',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 7. Successful Door Push: Both locks disengaged
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
        { type: 'DISCOVER_FACT', target: 'entry', value: 'The mountain portal opens smoothly once both upper and lower interlocks are released.' }
      ],
      feedbackMessage: 'With both catches disengaged, the massive oak doors swing open on balanced bronze hinges. Warm, dry air escapes from the observatory interior.',
      soundEffect: 'door_unlock',
      consequenceVisual: 'door_unlock'
    },
    onFailure: { feedbackMessage: 'The portal is already wide open.' }
  }
];

export const ACT1_DECISIONS: DecisionOption[] = [
  {
    id: 'decision_entry_grand_portal',
    label: 'Enter via Central Grand Horological Vestibule',
    description: 'Ascend the broad marble stairs toward the Great Clock Tower to investigate facility timing systems.',
    rationaleWhy: 'Focus on restoring sidereal timekeeping first to calibrate automated instruments.',
    downstreamHint: 'Proceeds directly to the Dead Clock Tower. Horological logs remain pristine.',
    effects: [
      { type: 'RECORD_DECISION', target: 'act1_path_choice', value: 'clock_tower', rationale: 'Ascended through Grand Vestibule toward Clock Tower.' },
      { type: 'TRANSITION_SCENE', target: 'act_2_clock', value: true }
    ]
  },
  {
    id: 'decision_entry_aqueduct_flume',
    label: 'Descend via Subterranean Hydraulic Flume',
    description: 'Inspect the subterranean boiler aqueduct where water conduits enter the foundation bedrock.',
    rationaleWhy: 'Investigate the hydraulic foundations first to verify steam power reserves.',
    downstreamHint: 'Takes the lower engineering path. Discovers machinist maintenance logs early.',
    effects: [
      { type: 'RECORD_DECISION', target: 'act1_path_choice', value: 'hydraulics', rationale: 'Entered through lower aqueduct flume.' },
      { type: 'TRANSITION_SCENE', target: 'act_2_clock', value: true }
    ]
  }
];

export const ACT1_SCENE: Challenge = {
  id: 'act_1_vestibule',
  order: 1,
  act: 1,
  title: 'Act I: Arrival at Mount Caelum',
  locationId: 'courtyard',
  archetype: 'NAVIGATION',
  passage: {
    heading: 'Surveyor’s Field Journal — Outer Courtyard Approach',
    source: 'Curator Sterling’s Mount Caelum Survey Journal, Vol. IV:',
    paragraphs: [
      'October 12, 1894. The high mountain gale has died, leaving the observatory in eerie silence.',
      'The outer portal was constructed with a two-point safety interlock: a spring-tensioned upper brass latch at the header, and an antique wrought-iron deadbolt below.',
      'To enter without wedging the antique pivots: FIRST disengage the upper brass latch by hand. THEN insert the iron master key into the lower deadbolt.',
      'Only once both catches are fully withdrawn may the counterweighted oak doors be pushed inward.'
    ],
    keyClues: [
      'upper brass latch must be disengaged FIRST',
      'insert iron master key into lower deadbolt',
      'push door only after both catches are withdrawn'
    ],
    documents: [
      {
        id: 'doc_act1_survey',
        title: 'Surveyor’s Field Note',
        type: 'field_journal',
        source: 'Curator Sterling’s Field Pouch',
        dateOrStamp: 'Oct 12, 1894 - 18:40',
        paragraphs: [
          'The upper brass latch holds spring tension against the top frame.',
          'The iron deadbolt secures the bottom sill.',
          'Do not force the doors while either lock is engaged.'
        ],
        keyClues: ['disengage upper brass latch first', 'insert iron key into lower deadbolt']
      },
      {
        id: 'doc_act1_map',
        title: 'Architectural Ground Elevation',
        type: 'architectural_map',
        source: 'Cast Bronze Plaque beside Entry Portal',
        dateOrStamp: 'Erected 1888',
        paragraphs: [
          'Mount Caelum Elevation: 2,840 meters above sea level.',
          'Due North bearing aligns precisely with the Great Refractor’s polar axis.',
          'Lower level: Hydraulic conduits and emergency coal dynamos. Upper level: Master Celestial Rotunda.'
        ],
        keyClues: ['elevation 2,840m', 'due North aligns with polar axis']
      }
    ]
  },
  targetReadingSkill: 'sequencing',
  ruleIds: ACT1_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'archive_door', property: 'isOpen', expected: true }
  ],
  completedMessage: 'The Vestibule Portal swings open. Choose your entrance path to proceed.',
  availableDecisions: ACT1_DECISIONS
};

// ============================================================================
// ACT II: THE DEAD CLOCK (Archetype: CALIBRATE)
// ============================================================================

export const ACT2_CLOCK_ENTITIES: Record<string, Entity> = {
  deadbeat_escapement: {
    id: 'deadbeat_escapement',
    name: 'Sidereal Deadbeat Escapement',
    locationId: 'library',
    description: 'A two-second astronomical pendulum escapement. The vernier rate weight is currently stopped at 0 beats/min.',
    states: { rateBpm: 0, isRunning: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'CALIBRATE', 'INSPECT'],
    icon: 'Clock'
  },
  pendulum_clutch: {
    id: 'pendulum_clutch',
    name: 'Escapement Engagement Clutch',
    locationId: 'library',
    description: 'A heavy brass lever that couples the pendulum swing into the master celestial gear train.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sliders'
  },
  curator_safe: {
    id: 'curator_safe',
    name: 'Optical Crystal Safe',
    locationId: 'library',
    description: 'Curator Sterling’s fireproof optical vault. Unlocks when sidereal time ticks.',
    states: { isUnlocked: false, dialPosition: 6 },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Lock'
  },
  quartz_prism: {
    id: 'quartz_prism',
    name: '589nm Quartz Optical Prism',
    locationId: 'library',
    description: 'A flawless triangular prism of Brazilian quartz, cut for sodium D-line celestial refractometry.',
    states: {},
    isInteractable: false,
    isInInventory: false,
    allowedActions: ['PICKUP'],
    icon: 'Sparkles'
  }
};

export const ACT2_ARCHIVE_ENTITIES = ACT2_CLOCK_ENTITIES;
export const ACT2_HYDRAULIC_ENTITIES = ACT2_CLOCK_ENTITIES;

export const ACT2_CLOCK_RULES: GameRule[] = [
  // 1. Calibrate escapement rate to 58 BPM (60 - 2 BPM elevation variance from text)
  {
    id: 'act2_rule_calibrate_escapement',
    challengeId: 'act_2_clock',
    action: 'CALIBRATE',
    targetId: 'deadbeat_escapement',
    conditions: [],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'deadbeat_escapement', property: 'rateBpm', value: 58 },
        { type: 'SET_ENTITY_STATE', target: 'deadbeat_escapement', property: 'isRunning', value: true },
        { type: 'DISCOVER_FACT', target: 'escapement', value: 'At 2,840 meters, the pendulum beats true at 58 beats per minute.' }
      ],
      feedbackMessage: 'TIC-TOC. The pendulum catches the anchor pallets. The heavy mercury bob begins swinging with resonant cadence at 58 beats per minute!',
      soundEffect: 'chime',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: {
      feedbackMessage: 'CLATTER! The escapement pallets bounce off the tooth wheel. The timing frequency does not match the elevation formula.',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 2. Engage Clutch
  {
    id: 'act2_rule_engage_clutch',
    challengeId: 'act_2_clock',
    action: 'ACTIVATE',
    targetId: 'pendulum_clutch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'deadbeat_escapement', property: 'isRunning', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'pendulum_clutch', property: 'isEngaged', value: true },
        { type: 'SET_ENTITY_STATE', target: 'curator_safe', property: 'isUnlocked', value: true },
        { type: 'ADD_INVENTORY', target: 'quartz_prism', value: true },
        { type: 'DISCOVER_FACT', target: 'clock_sync', value: 'The clockwork gear train engages, unlocking the optical crystal vault.' }
      ],
      feedbackMessage: 'The clutch locks home with a satisfying click. The master clock dials spin forward. The pneumatic lock on the optical safe glides open, revealing the 589nm Quartz Prism!',
      soundEffect: 'door_unlock',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'The clutch refuses to engage: the pendulum must be calibrated and swinging first!',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  }
];

export const ACT2_CLOCK_SCENE: Challenge = {
  id: 'act_2_clock',
  order: 2,
  act: 2,
  title: 'Act II: The Dead Clock Tower',
  locationId: 'library',
  archetype: 'CALIBRATE',
  passage: {
    heading: 'The Horological Ledger — Pendulum Vernier Calibration',
    source: 'Chief Horologist Sterling’s Calibration Table (Plaque on Clock Pier):',
    paragraphs: [
      'The Great Sidereal Clock drives every tracking telescope on Mount Caelum.',
      'At sea level, standard deadbeat pendulums oscillate at 60 beats per minute.',
      'However, at Mount Caelum’s elevation of 2,840 meters, reduced gravitational acceleration requires the bob weight to be lowered by exactly 2 beats per minute, setting the true sidereal rate to precisely 58 BPM.',
      'Engaging the drive clutch before the pendulum stabilizes at 58 BPM will shear the escapement teeth.'
    ],
    keyClues: [
      'standard rate is 60 BPM at sea level',
      'elevation variance requires reduction of exactly 2 BPM (target: 58 BPM)',
      'engage drive clutch only after pendulum is swinging at 58 BPM'
    ],
    documents: [
      {
        id: 'doc_act2_ledger',
        title: 'Horologist’s Elevation Table',
        type: 'maintenance_manual',
        source: 'Sterling Horological Archive',
        dateOrStamp: 'Revised 1892',
        paragraphs: [
          'Elevation 0m: 60 BPM',
          'Elevation 1,500m: 59 BPM',
          'Elevation 2,840m: 58 BPM (Mount Caelum Summit)',
          'Never start pendulum with clutch engaged.'
        ],
        keyClues: ['Elevation 2,840m = 58 BPM']
      }
    ]
  },
  calibrateConfig: {
    variableName: 'Pendulum Oscillation Rate',
    unit: 'BPM',
    minValue: 45,
    maxValue: 75,
    step: 1,
    targetValue: 58,
    tolerance: 1,
    gaugeLabel: 'Escapement Cadence',
    instructionSnippet: 'Adjust pendulum oscillation rate to compensate for Mount Caelum summit elevation based on the horological table.'
  },
  targetReadingSkill: 'cause_effect',
  ruleIds: ACT2_CLOCK_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'pendulum_clutch', property: 'isEngaged', expected: true }
  ],
  completedMessage: 'The Sidereal Clock ticks in perfect cadence. The 589nm Quartz Prism is secured in your inventory!'
};

// ============================================================================
// ACT III: POWER FAILURE (Archetype: ROUTE / RESOURCE DECISION)
// ============================================================================

export const ACT3_ENTITIES: Record<string, Entity> = {
  archive_power_switch: {
    id: 'archive_power_switch',
    name: 'Archive Sector Breaker',
    locationId: 'junction',
    description: 'Heavy copper knife-switch routing 80 kW to the optical library and documentation safes.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Zap'
  },
  hydraulic_power_switch: {
    id: 'hydraulic_power_switch',
    name: 'Hydraulic Workshop Breaker',
    locationId: 'junction',
    description: 'Heavy copper knife-switch routing 80 kW to the machine shop and deep-well elevator lift.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Zap'
  },
  transmitter_power_switch: {
    id: 'transmitter_power_switch',
    name: 'Acoustic Telegraph Breaker',
    locationId: 'junction',
    description: 'Routes 20 kW to the long-range acoustic transmitter array.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Radio'
  }
};

export const ACT3_RULES: GameRule[] = [
  {
    id: 'act3_rule_overload_trip',
    challengeId: 'act_3_junction',
    action: 'ACTIVATE',
    targetId: 'archive_power_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'hydraulic_power_switch', property: 'isClosed', expected: true }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'OVERLOAD BREAKER TRIPPED! Combined load (160 kW) exceeds the 100 kW dynamo ceiling.',
      soundEffect: 'spark',
      consequenceVisual: 'circuit_spark'
    }
  },
  {
    id: 'act3_rule_route_commit',
    challengeId: 'act_3_junction',
    action: 'ACTIVATE',
    targetId: 'archive_power_switch',
    conditions: [],
    onSuccess: {
      effects: [{ type: 'SET_FLAG', target: 'act3_power_routed', value: true }],
      feedbackMessage: 'Power routing switchboard updated.',
      soundEffect: 'dynamo_hum',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'Routing cannot be set.' }
  }
];

export const ACT3_DECISIONS: DecisionOption[] = [
  {
    id: 'decision_power_archive',
    label: 'Route Power to Archive Sector (80 kW)',
    description: 'Illuminates the grand documentation gallery, powers microfilm projectors, and unlocks classified curator files.',
    rationaleWhy: 'Knowledge first: without historical star logs and transit coordinates, the Great Refractor cannot be aimed.',
    downstreamHint: 'East Concourse will be brightly lit in Act V. West Hydraulic Lift will remain dark and inoperable.',
    effects: [
      { type: 'RECORD_DECISION', target: 'power_allocation', value: 'archive', rationale: 'Prioritized historical documentation and optical research.' },
      { type: 'POWER_SYSTEM', target: 'archive', value: true },
      { type: 'SET_FLAG', target: 'archive_powered', value: true },
      { type: 'SET_FLAG', target: 'laboratory_powered', value: false },
      { type: 'TRANSITION_SCENE', target: 'act_4_navigation', value: true }
    ]
  },
  {
    id: 'decision_power_laboratory',
    label: 'Route Power to Hydraulic Laboratory & Workshop (80 kW)',
    description: 'Powers the heavy machine shop, mechanical foundry, and the hydraulic elevator leading up to the dome.',
    rationaleWhy: 'Mechanics first: the dome aperture is massive and cannot be moved without hydraulic pressure.',
    downstreamHint: 'West Elevator operational in Act V. East Archive will be pitch-black, requiring alternate exploration.',
    effects: [
      { type: 'RECORD_DECISION', target: 'power_allocation', value: 'laboratory', rationale: 'Prioritized heavy machinery and hydraulic elevator.' },
      { type: 'POWER_SYSTEM', target: 'laboratory', value: true },
      { type: 'SET_FLAG', target: 'archive_powered', value: false },
      { type: 'SET_FLAG', target: 'laboratory_powered', value: true },
      { type: 'TRANSITION_SCENE', target: 'act_4_navigation', value: true }
    ]
  }
];

export const ACT3_SCENE: Challenge = {
  id: 'act_3_junction',
  order: 3,
  act: 3,
  title: 'Act III: Power Failure & Routing Junction',
  locationId: 'junction',
  archetype: 'ROUTE',
  passage: {
    heading: 'Chief Machinist Aris’s Emergency Dynamo Operating Order',
    source: 'Brass warning plaque riveted directly above the Knife Switchboard:',
    paragraphs: [
      'CRITICAL WARNING: The reserve steam dynamo operates on auxiliary coal reserves with a MAXIMUM LOAD CEILING OF 100 kW.',
      'The Archive Scanners draw 80 kW. The Hydraulic Core Elevator draws 80 kW.',
      'MUTUAL EXCLUSION MANDATE: Engaging both the Archive and Hydraulic switches simultaneously draws 160 kW, which INSTANTLY TRIPS the magnetic master breaker with an explosive arc.',
      'You must allocate power to EITHER the Archive OR the Laboratory. Choose based on which facility sector you need downstream.'
    ],
    keyClues: [
      'maximum dynamo ceiling is strictly 100 kW',
      'Archive draws 80 kW, Hydraulic Lift draws 80 kW',
      'both engaged = 160 kW surge overload trip',
      'must select one sector exclusively'
    ],
    documents: [
      {
        id: 'doc_act3_power',
        title: 'Dynamo Bus Load Specs',
        type: 'maintenance_manual',
        source: 'Engineering Logbook',
        dateOrStamp: 'Dynamo Sub-Station',
        paragraphs: [
          'Bus Ceiling: 100 kW',
          'Breaker A (Archive): 80 kW',
          'Breaker B (Laboratory): 80 kW',
          'Breaker C (Telegraph): 20 kW'
        ],
        keyClues: ['ceiling 100 kW', 'Breaker A + B = overload trip']
      }
    ]
  },
  routeWiringConfig: {
    generatorBusKw: 100,
    maxLoadCeilingKw: 100,
    nodes: [
      { id: 'archive_power_switch', name: 'Archive Document Gallery', powerDemandKw: 80, description: 'Illuminates archives, safe scanners, and optical plates.' },
      { id: 'hydraulic_power_switch', name: 'Hydraulic Core Elevator', powerDemandKw: 80, description: 'Drives pressurized hoist up the central mountain shaft.' },
      { id: 'transmitter_power_switch', name: 'Acoustic Telegraph Relay', powerDemandKw: 20, description: 'Long-range telegraph transceiver array.' }
    ],
    incompatibleNodePairs: [['archive_power_switch', 'hydraulic_power_switch']]
  },
  targetReadingSkill: 'negative_constraint',
  ruleIds: ACT3_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'FLAG_IS', target: 'act3_power_committed', expected: true }
  ],
  completedMessage: 'Power routed under ceiling. Choose your strategic path forward.',
  availableDecisions: ACT3_DECISIONS
};

// ============================================================================
// ACT IV: THE MISSING ENGINEER (Archetype: INVESTIGATION & DIALOGUE)
// ============================================================================

export const ACT4_ENTITIES: Record<string, Entity> = {
  intercom_pipe: {
    id: 'intercom_pipe',
    name: 'Acoustic Speaking Tube',
    locationId: 'quarters',
    description: 'Brass speaking tube connecting the telegraph desk to Chief Machinist Aris’s fortified workshop.',
    states: { isTalking: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Radio'
  },
  aris_workbench: {
    id: 'aris_workbench',
    name: 'Machinist Workbench',
    locationId: 'quarters',
    description: 'Scattered with micrometer calipers, cracked azimuth gear teeth, and handwritten incident logs.',
    states: { isExamined: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['INSPECT'],
    icon: 'Search'
  }
};

export const ACT4_RULES: GameRule[] = [
  {
    id: 'act4_rule_talk_aris',
    challengeId: 'act_4_navigation',
    action: 'ACTIVATE',
    targetId: 'intercom_pipe',
    conditions: [],
    onSuccess: {
      effects: [
        { type: 'SET_FLAG', target: 'act4_navigation_complete', value: true },
        { type: 'DISCOVER_FACT', target: 'evacuation_truth', value: 'Aris reveals the mountain bedrock suffered tectonic faulting during the celestial alignment.' }
      ],
      feedbackMessage: 'Chief Machinist Aris speaks through the horn. His voice is raspy but intensely lucid.',
      soundEffect: 'latch_click',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'Speaking tube is silent.' }
  }
];

export const ACT4_DECISIONS: DecisionOption[] = [
  {
    id: 'decision_ally_with_aris',
    label: 'Form Alliance with Chief Machinist Aris',
    description: 'Pledge solidarity with Aris against administrative blame and agree that bedrock faulting is the real threat.',
    rationaleWhy: 'Engineering truth over institutional fear: the physical structure must be preserved.',
    downstreamHint: 'Aris transmits critical relay shunt rating over the Concourse tube in Act V, and remotely dogs dome shutter pins in Act VII.',
    effects: [
      { type: 'RECORD_DECISION', target: 'aris_alliance_stance', value: 'collaborative_ally', rationale: 'Allied with Aris on bedrock seismology.' },
      { type: 'MODIFY_RELATIONSHIP', target: 'aris', value: 30 },
      { type: 'SET_FLAG', target: 'aris_allied', value: true },
      { type: 'TRANSITION_SCENE', target: 'act_5_adaptive', value: true }
    ]
  },
  {
    id: 'decision_confront_aris',
    label: 'Hold Aris to Strict Administrative Accountability',
    description: 'Enforce Curator Sterling’s chain of command, treating Aris as an unverified obstructionist.',
    rationaleWhy: 'Chain of command: Sterling’s celestial observations cannot be compromised by unverified tremors.',
    downstreamHint: 'Aris ceases communications. You must bypass the Act V terminal lockouts and Act VII dome dogs alone.',
    effects: [
      { type: 'RECORD_DECISION', target: 'aris_alliance_stance', value: 'authoritative_investigator', rationale: 'Prioritized chain of command over Aris.' },
      { type: 'MODIFY_RELATIONSHIP', target: 'aris', value: -30 },
      { type: 'SET_FLAG', target: 'aris_allied', value: false },
      { type: 'TRANSITION_SCENE', target: 'act_5_adaptive', value: true }
    ]
  }
];

export const ACT4_SCENE: Challenge = {
  id: 'act_4_navigation',
  order: 4,
  act: 4,
  title: 'Act IV: The Missing Engineer & The Acoustic Pipe',
  locationId: 'quarters',
  archetype: 'DIALOGUE',
  passage: {
    heading: 'Conflicting Logbooks — The Great Evacuation Incident',
    source: 'Two conflicting documents recovered from the central concourse:',
    paragraphs: [
      'Document A (Curator Sterling’s Evacuation Order): "Chief Machinist Aris has lost his senses. He deliberately jammed the dome shutter dogs and severed the dynamo cables. He claims the mountain is moving under us. I have ordered immediate evacuation of all staff."',
      'Document B (Machinist Aris’s Incident Log): "Sterling is a fool who knows stars but nothing of stone. The lunar perigee triggered deep micro-seismic tremors in Mount Caelum’s granite core. The telescope pier has shifted by 3 arcseconds. If the aperture is opened without releveling the azimuth ring, the entire copper dome will collapse!"',
      'Through the acoustic speaking tube, you can converse directly with Aris in his fortified workshop.'
    ],
    keyClues: [
      'Sterling blamed Aris for deliberate sabotage',
      'Aris claimed micro-seismic bedrock tremors shifted telescope pier',
      'pier shifted by 3 arcseconds; releveling required to prevent collapse'
    ],
    documents: [
      {
        id: 'doc_act4_sterling',
        title: 'Sterling’s Private Diary',
        type: 'personal_diary',
        source: 'Curator’s Desk',
        dateOrStamp: 'Night of the Evacuation',
        paragraphs: [
          'Aris barred himself in the workshop.',
          'He refused to allow the celestial transit observations.',
          'He must not be trusted with facility keys.'
        ],
        keyClues: ['Sterling distrusts Aris completely']
      },
      {
        id: 'doc_act4_aris',
        title: 'Aris’s Bedrock Seismograph Chart',
        type: 'maintenance_manual',
        source: 'Workshop Clip-board',
        dateOrStamp: 'Recorded at 02:15 AM',
        paragraphs: [
          'Seismic needle detected 14 micro-tremors along the East Granite Fault.',
          'The Great Refractor azimuth bearing is binding on its eastern roller.',
          'True North calibration must account for the shift.'
        ],
        keyClues: ['14 micro-tremors', 'azimuth bearing binding on eastern roller']
      }
    ]
  },
  dialogueConfig: {
    characterName: 'Chief Machinist Aris',
    initialNodeId: 'aris_intro',
    nodes: {
      aris_intro: {
        id: 'aris_intro',
        speaker: 'Chief Machinist Aris',
        text: 'Who is that on the acoustic tube? If Sterling sent you to pry open the dome, tell him the mountain bedrock has fractured!',
        options: [
          {
            id: 'opt_sympathize',
            text: 'I read your seismograph log, Aris. You detected micro-tremors along the East Fault.',
            intent: 'sympathize',
            trustDelta: 20,
            consequenceHint: 'Aris gains confidence in your mechanical understanding.',
            nextNodeId: 'aris_technical'
          },
          {
            id: 'opt_challenge',
            text: 'Sterling says you sabotaged the dynamo and locked the shutters out of panic.',
            intent: 'challenge',
            trustDelta: -15,
            consequenceHint: 'Aris becomes defensive and guarded.',
            nextNodeId: 'aris_defensive'
          }
        ]
      },
      aris_technical: {
        id: 'aris_technical',
        speaker: 'Chief Machinist Aris',
        text: 'You actually read the stone telemetry! Then you know: when you ascend to the dome, you must rotate the azimuth bearing to TRUE NORTH and release the shutter dogs before hauling the main aperture lever, or the gears will strip.',
        options: [
          {
            id: 'opt_promise_align',
            text: 'Understood. I will ensure the bearing faces true North and the dogs are free.',
            intent: 'disclose',
            trustDelta: 10,
            isTerminal: true,
            effects: [
              { type: 'MODIFY_RELATIONSHIP', target: 'aris', value: 75 },
              { type: 'DISCOVER_FACT', target: 'aris_advice', value: 'Aris confirmed: align azimuth True North and release shutter dogs.' },
              { type: 'SET_FLAG', target: 'act4_navigation_complete', value: true }
            ]
          }
        ]
      },
      aris_defensive: {
        id: 'aris_defensive',
        speaker: 'Chief Machinist Aris',
        text: 'Sterling is an ivory-tower academic who ran down the mountain at the first stone groan! Look at the bearing yourself if you survive the climb.',
        options: [
          {
            id: 'opt_reluctant_proceed',
            text: 'I will inspect the telescope bearing myself.',
            intent: 'inquire',
            trustDelta: 5,
            isTerminal: true,
            effects: [
              { type: 'MODIFY_RELATIONSHIP', target: 'aris', value: 40 },
              { type: 'SET_FLAG', target: 'act4_navigation_complete', value: true }
            ]
          }
        ]
      }
    }
  },
  targetReadingSkill: 'synthesis',
  ruleIds: ACT4_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'FLAG_IS', target: 'act4_navigation_complete', expected: true }
  ],
  completedMessage: 'Dialogue concluded. Choose your stance with Aris to proceed.',
  availableDecisions: ACT4_DECISIONS
};

// ============================================================================
// ACT V: THE CONSEQUENCE (Archetype: REPAIR / ASSEMBLY & DOWNSTREAM EFFECTS)
// ============================================================================

export const ACT5_ENTITIES: Record<string, Entity> = {
  emergency_telemetry_terminal: {
    id: 'emergency_telemetry_terminal',
    name: 'Dome Relay Terminal',
    locationId: 'concourse',
    description: 'The master relay board feeding power from the lower junction to the dome roof motors.',
    states: { shuntState: 'BURNED' },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Radio'
  },
  replacement_shunt: {
    id: 'replacement_shunt',
    name: 'Ceramic Safety Shunt',
    locationId: 'concourse',
    description: 'A 20-amp stepped ceramic shunt designed to bridge the dome relay safely.',
    states: {},
    isInteractable: false,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON'],
    icon: 'Zap'
  }
};

export const ACT5_RULES: GameRule[] = [
  {
    id: 'act5_rule_install_shunt',
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
        { type: 'DISCOVER_FACT', target: 'relay_restored', value: 'The ceramic safety shunt restored communication to the dome aperture drive.' }
      ],
      feedbackMessage: 'CLICK-SNAP! The ceramic safety shunt bridges the burned terminal. The dome relay filament glows with stable amber warmth!',
      soundEffect: 'latch_click',
      consequenceVisual: 'circuit_spark'
    },
    onFailure: { feedbackMessage: 'The relay terminal is already bridged.' }
  }
];

export const ACT5_SCENE: Challenge = {
  id: 'act_5_adaptive',
  order: 5,
  act: 5,
  title: 'Act V: Consequence & Ascent Concourse',
  locationId: 'concourse',
  archetype: 'REPAIR',
  passage: {
    heading: 'Environmental Consequence of Act III Power Decision',
    source: 'Relay Sub-Station Status Register:',
    paragraphs: [
      'Your prior decision in the Power Junction echoes directly into this sector.',
      'If you powered the Archive, the East Concourse is radiant with electric glow, but the West Hydraulic Elevator is lifeless, requiring you to ascend by the stone stairs.',
      'Before the master roof motors can receive power, the burned emergency safety shunt in the relay panel must be replaced with a ceramic bridge.',
      'Do not bridge the shunt with raw copper wire: only a non-conductive ceramic casing will prevent high-voltage arcing during dome rotation.'
    ],
    keyClues: [
      'concourse lighting and routes depend on Act III power decision',
      'burned emergency shunt must be replaced with ceramic bridge',
      'raw copper wire causes high-voltage arc failure'
    ],
    documents: [
      {
        id: 'doc_act5_telemetry',
        title: 'Relay Terminal Maintenance Directive',
        type: 'maintenance_manual',
        source: 'Relay Wall Cabinet',
        dateOrStamp: 'Section 9 Directive',
        paragraphs: [
          'Warning: Relay terminal operates at 220V DC.',
          'Install Ceramic Safety Shunt directly into Socket #2.',
          'Verify filament continuity before opening dome gates.'
        ],
        keyClues: ['Ceramic Safety Shunt required']
      }
    ]
  },
  assemblyConfig: {
    slotsCount: 1,
    components: [
      { id: 'replacement_shunt', name: 'Ceramic Safety Shunt', slotIndex: 0, description: 'Stepped ceramic 20A shunt.' }
    ]
  },
  targetReadingSkill: 'cause_effect',
  ruleIds: ACT5_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'emergency_telemetry_terminal', property: 'shuntState', expected: 'RESTORED' }
  ],
  completedMessage: 'The relay bridge is energized! The path to the Master Celestial Dome is wide open.'
};

// ============================================================================
// ACT VII: FINAL SYNTHESIS (Archetype: SYNTHESIS)
// ============================================================================

export const ACT7_ENTITIES: Record<string, Entity> = {
  azimuth_dial: {
    id: 'azimuth_dial',
    name: 'Telescope Azimuth Bearing',
    locationId: 'dome',
    description: 'Massive geared bronze ring supporting the 40-foot Great Refractor. Cycles: East -> South -> North.',
    states: { heading: 'East' },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Compass'
  },
  shutter_lock_wheel: {
    id: 'shutter_lock_wheel',
    name: 'Copper Shutter Dogs Wheel',
    locationId: 'dome',
    description: 'Heavy geared wheel that releases the mechanical clamping dogs holding the copper roof petals closed.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'CircleDot'
  },
  star_clock_sync_switch: {
    id: 'star_clock_sync_switch',
    name: 'Star Clock Synchronizer',
    locationId: 'dome',
    description: 'Synchronizes the dome tracking motor with the sidereal clock pendulum started in Act II.',
    states: { isSynchronized: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Clock'
  },
  quartz_receptacle: {
    id: 'quartz_receptacle',
    name: 'Refractometer Prism Cradle',
    locationId: 'dome',
    description: 'Precision brass fitting at the telescope eyepiece focal plane. Requires the 589nm Quartz Prism.',
    states: { hasPrism: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Sparkles'
  },
  master_aperture_lever: {
    id: 'master_aperture_lever',
    name: 'Master Aperture Actuator',
    locationId: 'dome',
    description: 'The massive counterweighted haul lever that drives open the twin copper dome petals to the midnight sky.',
    states: { isDomeOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sliders'
  },
  quartz_prism: {
    id: 'quartz_prism',
    name: '589nm Quartz Optical Prism',
    locationId: 'dome',
    description: 'A flawless triangular prism of Brazilian quartz, cut for sodium D-line celestial refractometry.',
    states: {},
    isInteractable: true,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON', 'PICKUP', 'INSPECT'],
    icon: 'Sparkles'
  }
};

export const ACT7_RULES: GameRule[] = [
  // 1. Shutter dogs release
  {
    id: 'act7_rule_shutter_dogs',
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
      feedbackMessage: 'CLANK-RATTLE! The mechanical dogs retract from the copper roof rims. The shutter petals rest freely on the guide rails.',
      soundEffect: 'latch_click',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The shutter clamping dogs are already released.' }
  },
  // 2. Clock Synchronizer
  {
    id: 'act7_rule_clock_sync',
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
      feedbackMessage: 'Harmonic hum! The dome drive synchro couples with the 58 BPM sidereal clock ticks from the tower below.',
      soundEffect: 'chime',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'The telescope drive is already synchronized.' }
  },
  // 3. Prism Insertion
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
        { type: 'DISCOVER_FACT', target: 'prism_seated', value: 'The 589nm Quartz Prism is seated in the focal optical train.' }
      ],
      feedbackMessage: 'Click. The triangular quartz prism glides into the velvet-lined brass cradle. Starlight will refract directly onto the recording plate.',
      soundEffect: 'latch_click',
      consequenceVisual: 'door_unlock'
    },
    onFailure: { feedbackMessage: 'The prism cradle is already fitted.' }
  },
  // 4. Premature Actuation Failures: Azimuth misaligned
  {
    id: 'act7_rule_fail_azimuth',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'master_aperture_lever',
    conditions: [
      { type: 'ENTITY_STATE', target: 'azimuth_dial', property: 'heading', expected: 'East' }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'SCREEECH! The telescope barrel shudders violently against the eastern frame! True North alignment is required before opening.',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 5. Premature Actuation Failure: Dogs still clamped
  {
    id: 'act7_rule_fail_dogs',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'master_aperture_lever',
    conditions: [
      { type: 'ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'THUD! The drive chains pull taut, but the copper petals are pinned by the unreleased shutter dogs!',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'shutter_slam'
    }
  },
  // 6. Premature Actuation Failure: Clock not synced
  {
    id: 'act7_rule_fail_clock',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'master_aperture_lever',
    conditions: [
      { type: 'ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'The drive motor spins freely without torque: the star clock synchronizer must be engaged first!',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  // 7. Master Aperture Success!
  {
    id: 'act7_rule_master_success',
    challengeId: 'act_7_dome',
    action: 'ACTIVATE',
    targetId: 'master_aperture_lever',
    conditions: [
      { type: 'ENTITY_STATE', target: 'azimuth_dial', property: 'heading', expected: 'North' },
      { type: 'ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', expected: true },
      { type: 'ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', expected: true },
      { type: 'ENTITY_STATE', target: 'quartz_receptacle', property: 'hasPrism', expected: true },
      { type: 'ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', value: true },
        { type: 'SET_FLAG', target: 'game_won', value: true },
        { type: 'DISCOVER_FACT', target: 'finale', value: 'The Great 40-Inch Refractor is aligned with Polaris under midnight skies.' }
      ],
      feedbackMessage: 'A deep harmonic rumble echoes through the mountain bedrock! The massive counterweights descend. The copper dome petals glide open to the midnight sky. Starlight streams directly down the 40-foot brass barrel of the Great Refractor!',
      soundEffect: 'chime',
      consequenceVisual: 'door_unlock'
    },
    onFailure: { feedbackMessage: 'The dome petals are already opened to the stars. Review telemetry or conclude your journey below.' }
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
      '4. FIT the 589nm Quartz Optical Prism into the eyepiece focal cradle.',
      'Only when all four conditions are fulfilled will pulling the Master Aperture Actuator open the copper petals without tearing the drive chain.'
    ],
    keyClues: [
      'azimuth bearing must face true NORTH',
      'unseal copper shutter dogs using the wheel',
      'synchronize star clock pendulum with sidereal time',
      'fit 589nm quartz prism into cradle',
      'pull master actuator only when all conditions are fulfilled'
    ],
    documents: [
      {
        id: 'doc_act7_directive',
        title: 'Master Polaris Alignment Protocol',
        type: 'scientific_report',
        source: 'Mount Caelum Master Register',
        dateOrStamp: 'Observatory Summit',
        paragraphs: [
          'Step 1: Azimuth = North',
          'Step 2: Shutter Dogs = Released',
          'Step 3: Star Clock = Synchronized',
          'Step 4: Prism = Seated in Cradle',
          'Pull Master Aperture Lever to engage counterweights.'
        ],
        keyClues: ['North', 'Released', 'Synchronized', 'Prism seated']
      }
    ]
  },
  targetReadingSkill: 'synthesis',
  ruleIds: ACT7_RULES.map((r) => r.id),
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', expected: true }
  ],
  completedMessage: 'THE LOST OBSERVATORY LIVES AGAIN! You restored the pinnacle of Victorian astronomy through text comprehension and physical deduction!'
};

// ============================================================================
// CAMPAIGN SCENE REGISTRY
// ============================================================================

export const CAMPAIGN_SCENES: Record<string, Challenge> = {
  act_1_vestibule: ACT1_SCENE,
  act_2_clock: ACT2_CLOCK_SCENE,
  // Backwards compatibility mappings for older tests/references
  act_2_archive: ACT2_CLOCK_SCENE,
  act_2_hydraulics: ACT2_CLOCK_SCENE,
  act_3_junction: ACT3_SCENE,
  act_4_navigation: ACT4_SCENE,
  act_5_adaptive: ACT5_SCENE,
  act_7_dome: ACT7_SCENE
};

export const ALL_CAMPAIGN_RULES: GameRule[] = [
  ...ACT1_RULES,
  ...ACT2_CLOCK_RULES,
  ...ACT3_RULES,
  ...ACT4_RULES,
  ...ACT5_RULES,
  ...ACT7_RULES
];
