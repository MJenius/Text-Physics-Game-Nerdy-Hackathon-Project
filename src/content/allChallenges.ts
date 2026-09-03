import type { Entity, GameRule, Challenge } from '../types/game';
import { challenge1, initialEntities as challenge1Entities, challenge1Rules } from './challenge1';

// ============================================================================
// ALL 6 CHALLENGES OF THE LOST OBSERVATORY
// ============================================================================

// --- CHALLENGE 2: GRAND LIBRARY (SEQUENCING) ---
const challenge2Entities: Record<string, Entity> = {
  locking_pin: {
    id: 'locking_pin',
    name: 'Under-Table Locking Pin',
    locationId: 'library',
    description: 'A heavy brass security bolt beneath the catalog pedestal, locking the carousel gears in place.',
    states: { isEngaged: true },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Pin'
  },
  catalog_crank: {
    id: 'catalog_crank',
    name: 'Catalog Carousel Crank',
    locationId: 'library',
    description: 'An iron hand-crank connected to the rotating book stacks carousel.',
    states: { hasRotated: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'RotateCw'
  },
  librarian_ledger: {
    id: 'librarian_ledger',
    name: 'Archived Boiler Blueprint',
    locationId: 'library',
    description: 'Revealed inside the rotated carousel: schematic schematics for the laboratory boiler.',
    states: { isRetrieved: false },
    isInteractable: false,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Scroll'
  },
  reading_desk_lamp: {
    id: 'reading_desk_lamp',
    name: 'Brass Reading Lamp',
    locationId: 'library',
    description: 'A glowing amber oil lamp illuminating the study desk.',
    states: { isLit: true },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Lamp'
  }
};

const challenge2Rules: GameRule[] = [
  // 1. Withdraw locking pin
  {
    id: 'rule_disengage_pin',
    challengeId: 'challenge_2',
    action: 'ACTIVATE',
    targetId: 'locking_pin',
    conditions: [
      { type: 'ENTITY_STATE', target: 'locking_pin', property: 'isEngaged', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'locking_pin', property: 'isEngaged', value: false }
      ],
      feedbackMessage: 'Clack! You slide the brass locking pin backward beneath the table. The carousel axle is now free to turn.'
    },
    onFailure: {
      feedbackMessage: 'The locking pin is already withdrawn.'
    }
  },

  // 2. Incorrect: Turning crank while pin is engaged (Sequencing failure)
  {
    id: 'rule_crank_fail_pinned',
    challengeId: 'challenge_2',
    action: 'ACTIVATE',
    targetId: 'catalog_crank',
    conditions: [
      { type: 'ENTITY_STATE', target: 'locking_pin', property: 'isEngaged', expected: true }
    ],
    onSuccess: {
      effects: [],
      feedbackMessage: ''
    },
    onFailure: {
      feedbackMessage: 'CRUNCH! The crank seizes violently against the engaged locking pin beneath the table! The gear shudders and snaps back to neutral.'
    }
  },

  // 3. Correct: Turn crank after pin is withdrawn
  {
    id: 'rule_turn_crank_success',
    challengeId: 'challenge_2',
    action: 'ACTIVATE',
    targetId: 'catalog_crank',
    conditions: [
      { type: 'ENTITY_STATE', target: 'locking_pin', property: 'isEngaged', expected: false },
      { type: 'ENTITY_STATE', target: 'catalog_crank', property: 'hasRotated', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'catalog_crank', property: 'hasRotated', value: true },
        { type: 'SET_ENTITY_STATE', target: 'librarian_ledger', property: 'isRetrieved', value: true }
      ],
      feedbackMessage: 'The gears spin smoothly with a rhythmic hum! The massive bookcase carousel revolves, revealing the secret laboratory doorway and the Boiler Blueprint.'
    },
    onFailure: {
      feedbackMessage: 'The carousel has already rotated fully to reveal the passage.'
    }
  },

  // Distractor: Inspect lamp
  {
    id: 'rule_desk_lamp',
    challengeId: 'challenge_2',
    action: 'ACTIVATE',
    targetId: 'reading_desk_lamp',
    conditions: [],
    onSuccess: {
      effects: [],
      feedbackMessage: 'The oil lamp hums with a steady golden flame, casting long shadows across the towering mahogany bookshelves.'
    },
    onFailure: {
      feedbackMessage: ''
    }
  }
];

export const challenge2: Challenge = {
  id: 'challenge_2',
  order: 2,
  title: 'Stage 2: The Grand Library',
  locationId: 'library',
  passage: {
    heading: 'Field Journal Entry #142 — The Rotating Stacks',
    source: 'Torn from the Senior Curator’s desk ledger:',
    paragraphs: [
      '“The central catalog carousel conceals the passage down into the hydraulic laboratory.',
      'The mechanism is fragile: the locking pin concealed beneath the study table MUST be withdrawn BEFORE the hand crank is rotated.',
      'Forcing the crank while the pin remains engaged will jam the brass cogs and immediately arrest the drive shaft.”'
    ],
    keyClues: [
      'locking pin beneath the study table must be withdrawn BEFORE the crank is rotated',
      'forcing the crank while pinned jams the brass cogs'
    ]
  },
  targetReadingSkill: 'sequencing',
  ruleIds: ['rule_disengage_pin', 'rule_crank_fail_pinned', 'rule_turn_crank_success', 'rule_desk_lamp'],
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'catalog_crank', property: 'hasRotated', expected: true }
  ],
  completedMessage: 'Library Carousel Aligned! You mastered procedural sequencing to preserve the delicate drive train.'
};


// --- CHALLENGE 3: LABORATORY BOILER (CAUSE & EFFECT) ---
const challenge3Entities: Record<string, Entity> = {
  water_inlet_valve: {
    id: 'water_inlet_valve',
    name: 'Condenser Water Inlet Valve',
    locationId: 'laboratory',
    description: 'A large blue spigot connecting the mountain aqueduct pipe to the boiler condenser reservoir.',
    states: { isFilled: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Droplets'
  },
  boiler_burner: {
    id: 'boiler_burner',
    name: 'Furnace Igniter Burner',
    locationId: 'laboratory',
    description: 'The primary ignition sparker beneath the copper boiling cylinder.',
    states: { isIgnited: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Flame'
  },
  boiler_lift_piston: {
    id: 'boiler_lift_piston',
    name: 'Hydraulic Lift Pressure Piston',
    locationId: 'laboratory',
    description: 'Powers the hydraulic lift up to the Control Junction once steam pressure builds.',
    states: { isPressurized: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Gauge'
  }
};

const challenge3Rules: GameRule[] = [
  // 1. Fill condenser with water
  {
    id: 'rule_fill_water',
    challengeId: 'challenge_3',
    action: 'ACTIVATE',
    targetId: 'water_inlet_valve',
    conditions: [
      { type: 'ENTITY_STATE', target: 'water_inlet_valve', property: 'isFilled', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'water_inlet_valve', property: 'isFilled', value: true }
      ],
      feedbackMessage: 'Whoosh! Crisp spring water surges through the blue valve into the condenser reservoir. The sight glass shows water at the safe line.'
    },
    onFailure: {
      feedbackMessage: 'The condenser chamber is already filled to capacity.'
    }
  },

  // 2. Incorrect: Ignite burner before water is filled (Cause & Effect failure)
  {
    id: 'rule_burner_fail_dry',
    challengeId: 'challenge_3',
    action: 'ACTIVATE',
    targetId: 'boiler_burner',
    conditions: [
      { type: 'ENTITY_STATE', target: 'water_inlet_valve', property: 'isFilled', expected: false }
    ],
    onSuccess: {
      effects: [],
      feedbackMessage: ''
    },
    onFailure: {
      feedbackMessage: 'SCREEECH! A shrill thermal alarm blares as dry heat trips the copper thermal cutoff! The flame immediately snaps out to prevent catastrophic chamber rupture.'
    }
  },

  // 3. Correct: Ignite burner after water is filled
  {
    id: 'rule_ignite_burner_success',
    challengeId: 'challenge_3',
    action: 'ACTIVATE',
    targetId: 'boiler_burner',
    conditions: [
      { type: 'ENTITY_STATE', target: 'water_inlet_valve', property: 'isFilled', expected: true },
      { type: 'ENTITY_STATE', target: 'boiler_burner', property: 'isIgnited', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'boiler_burner', property: 'isIgnited', value: true },
        { type: 'SET_ENTITY_STATE', target: 'boiler_lift_piston', property: 'isPressurized', value: true }
      ],
      feedbackMessage: 'FOOM! The burner ignites with a roaring violet blaze. With water in the condenser, pure steam builds safely, pressurizing the hydraulic lift piston!'
    },
    onFailure: {
      feedbackMessage: 'The burner is already roaring at full operating temperature.'
    }
  },

  // 4. Activate hydraulic lift
  {
    id: 'rule_engage_lift',
    challengeId: 'challenge_3',
    action: 'ACTIVATE',
    targetId: 'boiler_lift_piston',
    conditions: [
      { type: 'ENTITY_STATE', target: 'boiler_lift_piston', property: 'isPressurized', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_FLAG', target: 'lab_lift_raised', value: true }
      ],
      feedbackMessage: 'The hydraulic lift rises smoothly on a cushion of pressurized steam, elevating you directly to the Control Junction!'
    },
    onFailure: {
      feedbackMessage: 'The hydraulic piston cannot lift without steam pressure. Fill the water and ignite the burner first.'
    }
  }
];

export const challenge3: Challenge = {
  id: 'challenge_3',
  order: 3,
  title: 'Stage 3: The Laboratory Boiler',
  locationId: 'laboratory',
  passage: {
    heading: 'Field Journal Entry #188 — Thermodynamic Safety',
    source: 'Scrawled on a metal placard beside the furnace:',
    paragraphs: [
      '“The hydraulic lift to the upper observatory levels is driven by steam generated in the primary boiler.',
      'The condenser tank MUST contain water BEFORE the burner is ignited.',
      'Heating an empty chamber will immediately trigger the emergency thermal cutoff and extinguish the igniter to protect the hull.”'
    ],
    keyClues: [
      'condenser tank MUST contain water BEFORE the burner is ignited',
      'heating an empty chamber triggers the emergency thermal cutoff'
    ]
  },
  targetReadingSkill: 'cause_effect',
  ruleIds: ['rule_fill_water', 'rule_burner_fail_dry', 'rule_ignite_burner_success', 'rule_engage_lift'],
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'boiler_burner', property: 'isIgnited', expected: true },
    { type: 'ENTITY_STATE', target: 'boiler_lift_piston', property: 'isPressurized', expected: true }
  ],
  completedMessage: 'Boiler Safely Steaming! You demonstrated cause-and-effect reasoning to avoid triggering the thermal alarm.'
};


// --- CHALLENGE 4: CONTROL JUNCTION (NEGATIVE / EXCLUSION CONSTRAINT) ---
const challenge4Entities: Record<string, Entity> = {
  hydro_turbine_switch: {
    id: 'hydro_turbine_switch',
    name: 'Hydro Turbine Line Switch',
    locationId: 'junction',
    description: 'Directs alternating current from the basement water turbine.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Zap'
  },
  solar_bank_switch: {
    id: 'solar_bank_switch',
    name: 'Solar Accumulator Line Switch',
    locationId: 'junction',
    description: 'Directs stored direct current from the exterior photovoltaic array.',
    states: { isEngaged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sun'
  },
  transformer_master_switch: {
    id: 'transformer_master_switch',
    name: 'Master Step-Up Transformer',
    locationId: 'junction',
    description: 'Channels high-voltage power to the telescope dome relays. Accepts single-source current only.',
    states: { isEnergized: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Radio'
  }
};

const challenge4Rules: GameRule[] = [
  // Toggle Hydro Turbine
  {
    id: 'rule_toggle_hydro',
    challengeId: 'challenge_4',
    action: 'ACTIVATE',
    targetId: 'hydro_turbine_switch',
    conditions: [],
    onSuccess: {
      effects: [
        // Toggle logic handled dynamically or through explicit states
        { type: 'SET_ENTITY_STATE', target: 'hydro_turbine_switch', property: 'isEngaged', value: true }
      ],
      feedbackMessage: 'You engage the Hydro Turbine breaker. The line hums with a deep 60Hz vibrational frequency.'
    },
    onFailure: { feedbackMessage: '' }
  },

  // Toggle Solar Bank
  {
    id: 'rule_toggle_solar',
    challengeId: 'challenge_4',
    action: 'ACTIVATE',
    targetId: 'solar_bank_switch',
    conditions: [],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'solar_bank_switch', property: 'isEngaged', value: true }
      ],
      feedbackMessage: 'You engage the Solar Accumulator switch. A bright amber diode illuminates on the panel.'
    },
    onFailure: { feedbackMessage: '' }
  },

  // Incorrect: Throwing Master Switch when BOTH are active (Exclusion constraint violated)
  {
    id: 'rule_master_fail_both',
    challengeId: 'challenge_4',
    action: 'ACTIVATE',
    targetId: 'transformer_master_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'hydro_turbine_switch', property: 'isEngaged', expected: true },
      { type: 'ENTITY_STATE', target: 'solar_bank_switch', property: 'isEngaged', expected: true }
    ],
    onSuccess: {
      effects: [],
      feedbackMessage: ''
    },
    onFailure: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'hydro_turbine_switch', property: 'isEngaged', value: false },
        { type: 'SET_ENTITY_STATE', target: 'solar_bank_switch', property: 'isEngaged', value: false }
      ],
      feedbackMessage: 'ZZZZZT-BANG! Massive phase conflict! Connecting both sources simultaneously blew the overload breaker! Both power line switches tripped back to OFF.'
    }
  },

  // Incorrect: Throwing Master Switch when NEITHER is active
  {
    id: 'rule_master_fail_none',
    challengeId: 'challenge_4',
    action: 'ACTIVATE',
    targetId: 'transformer_master_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'hydro_turbine_switch', property: 'isEngaged', expected: false },
      { type: 'ENTITY_STATE', target: 'solar_bank_switch', property: 'isEngaged', expected: false }
    ],
    onSuccess: {
      effects: [],
      feedbackMessage: ''
    },
    onFailure: {
      feedbackMessage: 'Click... Nothing happens. The transformer cannot energize without at least one active power input.'
    }
  },

  // Correct: Master Switch with Hydro only
  {
    id: 'rule_master_hydro_success',
    challengeId: 'challenge_4',
    action: 'ACTIVATE',
    targetId: 'transformer_master_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'hydro_turbine_switch', property: 'isEngaged', expected: true },
      { type: 'ENTITY_STATE', target: 'solar_bank_switch', property: 'isEngaged', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'transformer_master_switch', property: 'isEnergized', value: true }
      ],
      feedbackMessage: 'Clean sinusoidal surge! With exactly one power source connected, the transformer energizes safely, feeding power to the dome rotunda!'
    },
    onFailure: {
      feedbackMessage: ''
    }
  },

  // Correct: Master Switch with Solar only
  {
    id: 'rule_master_solar_success',
    challengeId: 'challenge_4',
    action: 'ACTIVATE',
    targetId: 'transformer_master_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'hydro_turbine_switch', property: 'isEngaged', expected: false },
      { type: 'ENTITY_STATE', target: 'solar_bank_switch', property: 'isEngaged', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'transformer_master_switch', property: 'isEnergized', value: true }
      ],
      feedbackMessage: 'Clean direct current surge! With exactly one power source connected, the transformer energizes safely, feeding power to the dome rotunda!'
    },
    onFailure: {
      feedbackMessage: ''
    }
  }
];

export const challenge4: Challenge = {
  id: 'challenge_4',
  order: 4,
  title: 'Stage 4: The Control Junction',
  locationId: 'junction',
  passage: {
    heading: 'Field Journal Entry #219 — Power Line Distribution',
    source: 'Warning stenciled in yellow paint across the transformer panel:',
    paragraphs: [
      '“The central step-up transformer delivers high-voltage power to the telescope dome relays.',
      'The transformer may safely receive current from EITHER the hydro turbine OR the solar bank, but NEVER both simultaneously.',
      'Connecting both sources at the same time causes an instantaneous out-of-phase short circuit that immediately trips the overload breaker.”'
    ],
    keyClues: [
      'receive current from EITHER the hydro turbine OR the solar bank',
      'NEVER both simultaneously',
      'connecting both causes an instantaneous short circuit'
    ]
  },
  targetReadingSkill: 'negative_constraint',
  ruleIds: [
    'rule_toggle_hydro',
    'rule_toggle_solar',
    'rule_master_fail_both',
    'rule_master_fail_none',
    'rule_master_hydro_success',
    'rule_master_solar_success'
  ],
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'transformer_master_switch', property: 'isEnergized', expected: true }
  ],
  completedMessage: 'Transformer Energized! You respected the strict negative constraint (XOR) to prevent a circuit blowout.'
};


// --- CHALLENGE 5: DOME TELESCOPE (MULTI-CONDITION PREREQUISITE) ---
const challenge5Entities: Record<string, Entity> = {
  lens_cradle: {
    id: 'lens_cradle',
    name: 'Viewfinder Optical Cradle',
    locationId: 'dome',
    description: 'A precision brass gimbal socket where the celestial prism mounts. Currently covered in gritty debris.',
    states: { isClean: false, isClamped: true, hasPrism: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['USE_ITEM_ON', 'ACTIVATE', 'INSPECT'],
    icon: 'Target'
  },
  cleaning_brush: {
    id: 'cleaning_brush',
    name: 'Soft Horsehair Brush',
    locationId: 'dome',
    description: 'An optical instrument brush used to sweep dust and grit off mirror mountings without scratching.',
    states: { inspected: false },
    isInteractable: true,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Brush'
  },
  cradle_clamp: {
    id: 'cradle_clamp',
    name: 'Gimbal Thumbscrew Clamp',
    locationId: 'dome',
    description: 'A knurled thumbscrew that locks the prism housing. Currently tightened shut.',
    states: { isLoosened: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sliders'
  },
  quartz_prism: {
    id: 'quartz_prism',
    name: 'Hexagonal Quartz Prism',
    locationId: 'dome',
    description: 'A flawless cut quartz crystal that bends starlight into the recording spectrograph.',
    states: { inspected: false },
    isInteractable: true,
    isInInventory: true,
    allowedActions: ['USE_ITEM_ON', 'INSPECT'],
    icon: 'Diamond'
  }
};

const challenge5Rules: GameRule[] = [
  // 1. Clean cradle with brush
  {
    id: 'rule_clean_cradle',
    challengeId: 'challenge_5',
    action: 'USE_ITEM_ON',
    sourceId: 'cleaning_brush',
    targetId: 'lens_cradle',
    conditions: [
      { type: 'ENTITY_STATE', target: 'lens_cradle', property: 'isClean', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'lens_cradle', property: 'isClean', value: true }
      ],
      feedbackMessage: 'With delicate strokes of the horsehair brush, you sweep away centuries of volcanic ash and grit. The brass seating socket is spotless.'
    },
    onFailure: {
      feedbackMessage: 'The optical cradle is already clean and free of debris.'
    }
  },

  // 2. Loosen clamp
  {
    id: 'rule_loosen_clamp',
    challengeId: 'challenge_5',
    action: 'ACTIVATE',
    targetId: 'cradle_clamp',
    conditions: [
      { type: 'ENTITY_STATE', target: 'cradle_clamp', property: 'isLoosened', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'cradle_clamp', property: 'isLoosened', value: true }
      ],
      feedbackMessage: 'You turn the knurled thumbscrew counter-clockwise. The retention jaws back open smoothly.'
    },
    onFailure: {
      feedbackMessage: 'The retention clamp is already loosened and open.'
    }
  },

  // 3. Incorrect: Mounting prism when cradle is dirty
  {
    id: 'rule_mount_prism_fail_dirty',
    challengeId: 'challenge_5',
    action: 'USE_ITEM_ON',
    sourceId: 'quartz_prism',
    targetId: 'lens_cradle',
    conditions: [
      { type: 'ENTITY_STATE', target: 'lens_cradle', property: 'isClean', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'The crystal tilts precariously on grit and gritty debris in the socket! You pull the delicate prism back before it scratches.'
    }
  },

  // 4. Incorrect: Mounting prism when clamp is tight
  {
    id: 'rule_mount_prism_fail_clamped',
    challengeId: 'challenge_5',
    action: 'USE_ITEM_ON',
    sourceId: 'quartz_prism',
    targetId: 'lens_cradle',
    conditions: [
      { type: 'ENTITY_STATE', target: 'lens_cradle', property: 'isClean', expected: true },
      { type: 'ENTITY_STATE', target: 'cradle_clamp', property: 'isLoosened', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'The cradle is clean, but the closed thumbscrew clamp physically blocks the prism from sliding into the seating rails.'
    }
  },

  // 5. Correct: Mount prism when clean AND clamp is loosened
  {
    id: 'rule_mount_prism_success',
    challengeId: 'challenge_5',
    action: 'USE_ITEM_ON',
    sourceId: 'quartz_prism',
    targetId: 'lens_cradle',
    conditions: [
      { type: 'ENTITY_STATE', target: 'lens_cradle', property: 'isClean', expected: true },
      { type: 'ENTITY_STATE', target: 'cradle_clamp', property: 'isLoosened', expected: true },
      { type: 'ENTITY_STATE', target: 'lens_cradle', property: 'hasPrism', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'lens_cradle', property: 'hasPrism', value: true },
        { type: 'REMOVE_INVENTORY', target: 'quartz_prism', value: true }
      ],
      feedbackMessage: 'Click-snug! The hexagonal quartz prism glides effortlessly into the pristine socket, refracting ambient light into brilliant spectral rainbows!'
    },
    onFailure: {
      feedbackMessage: 'The quartz prism is already mounted securely in the cradle.'
    }
  }
];

export const challenge5: Challenge = {
  id: 'challenge_5',
  order: 5,
  title: 'Stage 5: The Celestial Telescope',
  locationId: 'dome',
  passage: {
    heading: 'Field Journal Entry #274 — Optical Assembly',
    source: 'Embossed in the leather optics case lid:',
    paragraphs: [
      '“The celestial spectrograph relies on the cut quartz prism to refract cosmic rays.',
      'The prism can only be seated once the mounting cradle has been thoroughly swept clear of all grit and debris, AND the thumbscrew alignment clamp has been loosened.',
      'Attempting to seat the crystal in a fouled socket will tilt the facet, while an unloosened clamp will physically block insertion.”'
    ],
    keyClues: [
      'prism can ONLY be seated once the cradle is swept clear of debris',
      'AND the alignment clamp has been loosened',
      'requires BOTH conditions before mounting'
    ]
  },
  targetReadingSkill: 'multi_condition',
  ruleIds: [
    'rule_clean_cradle',
    'rule_loosen_clamp',
    'rule_mount_prism_fail_dirty',
    'rule_mount_prism_fail_clamped',
    'rule_mount_prism_success'
  ],
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'lens_cradle', property: 'hasPrism', expected: true }
  ],
  completedMessage: 'Prism Mounted! You integrated multiple simultaneous prerequisites to achieve optical alignment.'
};


// --- CHALLENGE 6: FINAL SYNTHESIS (THE CELESTIAL ACTIVATION) ---
const challenge6Entities: Record<string, Entity> = {
  azimuth_dial: {
    id: 'azimuth_dial',
    name: 'Telescope Azimuth Dial',
    locationId: 'dome',
    description: 'Rotates the massive barrel along compass bearings: [East, South, North].',
    states: { heading: 'East' }, // Options: 'East', 'South', 'North'
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Compass'
  },
  shutter_lock_wheel: {
    id: 'shutter_lock_wheel',
    name: 'Dome Shutter Dogging Wheel',
    locationId: 'dome',
    description: 'A nautical-style dogging wheel that unseals the overhead observation slit doors.',
    states: { isUnlocked: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'CircleDot'
  },
  star_clock_sync_switch: {
    id: 'star_clock_sync_switch',
    name: 'Generator Star Clock Synchronizer',
    locationId: 'dome',
    description: 'Couples the laboratory generator’s governor to the celestial sidereal escapement.',
    states: { isSynchronized: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Clock'
  },
  master_aperture_lever: {
    id: 'master_aperture_lever',
    name: 'Master Celestial Aperture Lever',
    locationId: 'dome',
    description: 'The ceremonial brass lever that parts the dome ceiling to the open night sky.',
    states: { isDomeOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Eye'
  }
};

const challenge6Rules: GameRule[] = [
  // 1. Rotate Azimuth Dial (Cycle: East -> South -> North)
  {
    id: 'rule_rotate_azimuth',
    challengeId: 'challenge_6',
    action: 'ACTIVATE',
    targetId: 'azimuth_dial',
    conditions: [],
    onSuccess: {
      effects: [
        // Custom cycle handled dynamically in store or via toggle
        { type: 'SET_ENTITY_STATE', target: 'azimuth_dial', property: 'heading', value: 'North' }
      ],
      feedbackMessage: 'Gears rumble as you rotate the bearing wheel. The telescope barrel aligns squarely to True NORTH (Polaris Azimuth).'
    },
    onFailure: { feedbackMessage: '' }
  },

  // 2. Unlock Shutter Wheel
  {
    id: 'rule_unlock_shutter',
    challengeId: 'challenge_6',
    action: 'ACTIVATE',
    targetId: 'shutter_lock_wheel',
    conditions: [
      { type: 'ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', value: true }
      ],
      feedbackMessage: 'With a heavy metallic thud, the 8-spoke dogging wheel rotates. The copper dome shutter pins withdraw.'
    },
    onFailure: {
      feedbackMessage: 'The shutter locking wheel is already unsealed.'
    }
  },

  // 3. Synchronize Clock
  {
    id: 'rule_sync_clock',
    challengeId: 'challenge_6',
    action: 'ACTIVATE',
    targetId: 'star_clock_sync_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', value: true }
      ],
      feedbackMessage: 'Tick... tock... CHIME! The generator governor catches the sidereal clock teeth, locking the drive to the Earth’s rotational speed.'
    },
    onFailure: {
      feedbackMessage: 'The star clock synchronizer is already locked in sync.'
    }
  },

  // 4. Incorrect: Pulling master lever when conditions are missing
  {
    id: 'rule_master_lever_fail',
    challengeId: 'challenge_6',
    action: 'ACTIVATE',
    targetId: 'master_aperture_lever',
    conditions: [
      { type: 'ENTITY_STATE', target: 'azimuth_dial', property: 'heading', expected: 'North' },
      { type: 'ENTITY_STATE', target: 'shutter_lock_wheel', property: 'isUnlocked', expected: true },
      { type: 'ENTITY_STATE', target: 'star_clock_sync_switch', property: 'isSynchronized', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', value: true }
      ],
      feedbackMessage: 'GLORIOUS HARMONY! The master lever slides back. Deep underground, steam hums, electricity surges, and the massive copper dome peels open to reveal the glittering cosmos!'
    },
    onFailure: {
      feedbackMessage: 'The aperture lever resists! All three synthesis requirements must be satisfied: Azimuth pointing North, shutter wheel unlocked, and generator synchronized with the star clock.'
    }
  }
];

export const challenge6: Challenge = {
  id: 'challenge_6',
  order: 6,
  title: 'Stage 6: The Grand Observatory Dome',
  locationId: 'dome',
  passage: {
    heading: 'Field Journal Entry #300 — Master Celestial Synthesis',
    source: 'Carved in gold leaf directly above the telescope eyepiece:',
    paragraphs: [
      '“The grand culmination of the observatory requires the union of all mechanical domains.',
      'To part the celestial dome: the telescope barrel must point directly NORTH toward Polaris, the dome shutter dogging wheel must be unlocked, and the generator drive must run synchronized with the star clock.',
      'If any single condition is neglected, the master aperture lever will remain firmly locked in safety stasis.”'
    ],
    keyClues: [
      'telescope barrel must point directly NORTH',
      'dome shutter dogging wheel must be unlocked',
      'generator drive must run synchronized with the star clock'
    ]
  },
  targetReadingSkill: 'synthesis',
  ruleIds: [
    'rule_rotate_azimuth',
    'rule_unlock_shutter',
    'rule_sync_clock',
    'rule_master_lever_fail'
  ],
  completionCondition: [
    { type: 'ENTITY_STATE', target: 'master_aperture_lever', property: 'isDomeOpen', expected: true }
  ],
  completedMessage: 'OBSERVATORY ACTIVATED! You have mastered Text Physics across the entire vertical slice!'
};


// ============================================================================
// AGGREGATED CONTENT EXPORTS
// ============================================================================

export const ALL_CHALLENGES: Challenge[] = [
  challenge1,
  challenge2,
  challenge3,
  challenge4,
  challenge5,
  challenge6
];

export const ALL_INITIAL_ENTITIES: Record<string, Record<string, Entity>> = {
  challenge_1: challenge1Entities,
  challenge_2: challenge2Entities,
  challenge_3: challenge3Entities,
  challenge_4: challenge4Entities,
  challenge_5: challenge5Entities,
  challenge_6: challenge6Entities
};

export const ALL_INITIAL_INVENTORY: Record<string, string[]> = {
  challenge_1: ['oxidized_key', 'brass_key'],
  challenge_2: [],
  challenge_3: [],
  challenge_4: [],
  challenge_5: ['cleaning_brush', 'quartz_prism'],
  challenge_6: []
};

export const ALL_RULES: GameRule[] = [
  ...challenge1Rules,
  ...challenge2Rules,
  ...challenge3Rules,
  ...challenge4Rules,
  ...challenge5Rules,
  ...challenge6Rules
];
