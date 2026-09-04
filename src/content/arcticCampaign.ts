import type { Challenge, Entity, GameRule, DecisionOption } from '../types/game';

// ============================================================================
// BOREAS SUB-ZERO STATION (ARCTIC PERMAFROST MINI-EXPERIENCE)
// Complete multi-act interactive reading adventure at 82° North.
// ============================================================================

export const ARCTIC_ENTITIES: Record<string, Entity> = {
  // Act 1: Airlock
  airlock_dump_valve: {
    id: 'airlock_dump_valve',
    name: 'Barometric Dump Valve',
    locationId: 'vestibule',
    description: 'High-pressure brass relief valve equalizing the outer vestibule against the 80-knot gale.',
    states: { isPurged: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Wind'
  },
  thermal_dog_heater: {
    id: 'thermal_dog_heater',
    name: 'Dogging Latch Glycol Heaters',
    locationId: 'vestibule',
    description: 'Electric resistance coils keeping the heavy frozen outer latch dogs from shearing under ice.',
    states: { isHeated: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Flame'
  },
  outer_blast_shutter: {
    id: 'outer_blast_shutter',
    name: 'Outer Armor Blast Shutter',
    locationId: 'vestibule',
    description: 'Counterweighted steel storm slab that shields the airlock chamber from katabatic drift.',
    states: { isClosed: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'DoorClosed'
  },
  lab_pressure_seal: {
    id: 'lab_pressure_seal',
    name: 'Inner Laboratory Pressure Seal',
    locationId: 'vestibule',
    description: 'Pneumatic insulated bulkhead door leading into the underground bunker complex.',
    states: { isOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'DoorClosed'
  },

  // Act 2: Thermal Siphon
  diesel_preheater_circuit: {
    id: 'diesel_preheater_circuit',
    name: 'Diesel Fuel Pre-Heater Bus',
    locationId: 'generator_room',
    description: 'Maintains diesel fuel above -10°C to prevent paraffin wax crystals from choking the fuel pumps.',
    states: { powerAllocatedKw: 45 },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Flame'
  },
  core_cryostat_circuit: {
    id: 'core_cryostat_circuit',
    name: 'Permafrost Core Cryostat Bus',
    locationId: 'generator_room',
    description: 'Keeps 10,000-year-old ice core cylinders frozen at -25°C to preserve gas bubble samples.',
    states: { powerAllocatedKw: 20 },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Zap'
  },
  crew_quarters_circuit: {
    id: 'crew_quarters_circuit',
    name: 'Crew Living Quarters Thermal Loop',
    locationId: 'generator_room',
    description: 'Thermal siphon radiator keeping bunks and medical station at habitable +14°C.',
    states: { powerAllocatedKw: 20 },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Sliders'
  },

  // Act 4: Radio Transmitter
  emergency_transmitter_console: {
    id: 'emergency_transmitter_console',
    name: 'High-Frequency Polar Transmitter Console',
    locationId: 'radio_room',
    description: 'Vacuum-tube radio transceiver coupled to the roof mast antenna.',
    states: { isBroadcasting: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'SYNTHESIS_COMMIT'],
    icon: 'Radio'
  }
};

export const ARCTIC_RULES: GameRule[] = [
  // Act 1: Airlock sequence
  {
    id: 'r_arctic_heat_dogs',
    challengeId: 'arctic_act_1_airlock',
    action: 'ACTIVATE',
    targetId: 'thermal_dog_heater',
    conditions: [],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'thermal_dog_heater', property: 'isHeated', value: true },
        { type: 'DISCOVER_FACT', target: 'arctic', value: 'Glycol heaters thawed ice encrusting the airlock dogs.' }
      ],
      feedbackMessage: 'The electric resistance heaters hum to life. Steam curls as encrusted frost melts from the steel latch dogs.',
      soundEffect: 'steam_burst',
      consequenceVisual: 'steam_burst'
    },
    onFailure: { feedbackMessage: 'Heaters already energized.' }
  },
  {
    id: 'r_arctic_purge_valve',
    challengeId: 'arctic_act_1_airlock',
    action: 'ACTIVATE',
    targetId: 'airlock_dump_valve',
    conditions: [
      { type: 'ENTITY_STATE', target: 'thermal_dog_heater', property: 'isHeated', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'airlock_dump_valve', property: 'isPurged', value: true }
      ],
      feedbackMessage: 'WHOOSH! The barometric dump valve equalizes chamber pressure against the sub-zero storm front.',
      soundEffect: 'steam_burst',
      consequenceVisual: 'steam_burst'
    },
    onFailure: {
      feedbackMessage: 'The dump valve is frozen solid! Thaw the latch dogs and casing with the glycol heaters first.',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  {
    id: 'r_arctic_open_lab',
    challengeId: 'arctic_act_1_airlock',
    action: 'ACTIVATE',
    targetId: 'lab_pressure_seal',
    conditions: [
      { type: 'ENTITY_STATE', target: 'thermal_dog_heater', property: 'isHeated', expected: true },
      { type: 'ENTITY_STATE', target: 'airlock_dump_valve', property: 'isPurged', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'lab_pressure_seal', property: 'isOpen', value: true },
        { type: 'SET_FLAG', target: 'arctic_airlock_cleared', value: true },
        { type: 'DISCOVER_FACT', target: 'bunker_entry', value: 'Entered Boreas underground research hub safely.' }
      ],
      feedbackMessage: 'CLANK-HISS! The inner pressure seal unlatches and rolls smoothly back. You step into the subterranean permafrost bunker as warm air surrounds you.',
      soundEffect: 'door_unlock',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'ALARM! High differential pressure pins the seal shut. You must thaw dogs and purge the dump valve first.',
      soundEffect: 'shutter_slam',
      consequenceVisual: 'shutter_slam'
    }
  },
  {
    id: 'r_arctic_open_lab_fail_frozen',
    challengeId: 'arctic_act_1_airlock',
    action: 'ACTIVATE',
    targetId: 'lab_pressure_seal',
    conditions: [
      { type: 'ENTITY_STATE', target: 'thermal_dog_heater', property: 'isHeated', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'ALARM! Ice encrustation freezes the pivot dogs solid at -48°C! You must energize the glycol resistance heaters first.',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  },
  {
    id: 'r_arctic_open_lab_fail_pressure',
    challengeId: 'arctic_act_1_airlock',
    action: 'ACTIVATE',
    targetId: 'lab_pressure_seal',
    conditions: [
      { type: 'ENTITY_STATE', target: 'thermal_dog_heater', property: 'isHeated', expected: true },
      { type: 'ENTITY_STATE', target: 'airlock_dump_valve', property: 'isPurged', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'ALARM! High differential pressure pins the seal shut against the outer storm! Equalize via the barometric dump valve first.',
      soundEffect: 'shutter_slam',
      consequenceVisual: 'shutter_slam'
    }
  }
];

export const ARCTIC_DECISIONS_ACT2: DecisionOption[] = [
  {
    id: 'decision_arctic_prioritize_cores',
    label: 'Lock Thermal Power to Core Cryostat (35 kW)',
    description: 'Prioritizes scientific research: guarantees the 10,000-year-old ice cylinders do not melt.',
    rationaleWhy: 'Preserve irreplaceable scientific samples despite sub-zero quarters.',
    downstreamHint: 'Quarters will drop to -2°C in Act III. Core logs remain pristine.',
    effects: [
      { type: 'RECORD_DECISION', target: 'arctic_thermal_priority', value: 'cryostat', rationale: 'Prioritized glaciological ice cores.' },
      { type: 'SET_FLAG', target: 'arctic_cryostat_secured', value: true },
      { type: 'TRANSITION_SCENE', target: 'arctic_act_3_stratigraphy', value: true }
    ]
  },
  {
    id: 'decision_arctic_prioritize_quarters',
    label: 'Route Maximum Thermal Power to Living Quarters (40 kW)',
    description: 'Ensures crew survival and medical heat. Cryostat will slowly warm toward threshold.',
    rationaleWhy: 'Human survival first: maintain warmth and prevent frostbite.',
    downstreamHint: 'Quarters will stay comfortable at +18°C. Core sample outer mantle begins surface degradation.',
    effects: [
      { type: 'RECORD_DECISION', target: 'arctic_thermal_priority', value: 'quarters', rationale: 'Prioritized human habitability.' },
      { type: 'SET_FLAG', target: 'arctic_quarters_warmed', value: true },
      { type: 'TRANSITION_SCENE', target: 'arctic_act_3_stratigraphy', value: true }
    ]
  }
];

export const ARCTIC_SCENES: Record<string, Challenge> = {
  arctic_act_1_airlock: {
    id: 'arctic_act_1_airlock',
    order: 1,
    act: 1,
    title: 'Act I: Katabatic Airlock Vestibule',
    locationId: 'vestibule',
    archetype: 'TIMELINE',
    passage: {
      heading: 'Boreas Station Entry & De-icing Directive',
      source: 'Chief Engineer Olsen’s Metal Plaque inside Outer Storm Vestibule:',
      paragraphs: [
        'WARNING: During category-5 katabatic blizzards, wind gusts exceed 80 knots and air temperature drops below -45°C.',
        'The outer airlock mechanism is vulnerable to thermal shock. Forcing the inner seal while ice binds the outer dogs will fracture the titanium pivot bolts.',
        'CORRECT VESTIBULE PROTOCOL: First, ENERGIZE the electric resistance latch dog heaters to melt encrusted frost.',
        'Second, ACTUATE the barometric dump valve to vent high-pressure katabatic backdraft into the ballast chimney.',
        'Only when the dogs are thawed and pressure is equalized may the inner laboratory pressure seal be opened.'
      ],
      keyClues: [
        'temperature below -45°C causes ice seizing',
        'first energize dog heaters, second actuate barometric dump valve',
        'open inner lab seal only after thawing and pressure equalization'
      ]
    },
    targetReadingSkill: 'sequencing',
    ruleIds: ARCTIC_RULES.map((r) => r.id),
    completionCondition: [
      { type: 'ENTITY_STATE', target: 'lab_pressure_seal', property: 'isOpen', expected: true }
    ],
    completedMessage: 'Airlock traversed safely. You have entered the subterranean complex.'
  },

  arctic_act_2_thermal: {
    id: 'arctic_act_2_thermal',
    order: 2,
    act: 2,
    title: 'Act II: Glycol Thermal Siphon Balance',
    locationId: 'generator_room',
    archetype: 'RESOURCE',
    passage: {
      heading: 'Diesel Auxiliary Generator Operating Envelope',
      source: 'Thermal Engineering Logbook (Station Generator Station):',
      paragraphs: [
        'The auxiliary diesel generator is running on arctic-grade kerosene, with a strict continuous output rating of exactly 85 kW.',
        'THERMAL BUDGET REQUIREMENTS: The Diesel Manifold Pre-Heater REQUIRES AT LEAST 25 kW to prevent paraffin wax crystals from solidifying in the fuel pump.',
        'The Permafrost Core Cryostat requires at least 30 kW to prevent irreversible melting of the 10,000-year ice cylinders.',
        'The Crew Quarters radiator circuit requires at least 30 kW to maintain livable temperatures.',
        'CRITICAL LIMIT: Total allocation across all three circuits CANNOT EXCEED 85 kW without overloading and stalling the generator.'
      ],
      keyClues: [
        'strict ceiling of exactly 85 kW total generator output',
        'diesel pre-heater requires minimum 25 kW to prevent paraffin crystallization',
        'cryostat requires min 30 kW, quarters require min 30 kW',
        '25 kW + 30 kW + 30 kW = 85 kW total balance'
      ]
    },
    targetReadingSkill: 'negative_constraint',
    ruleIds: [],
    completionCondition: [
      { type: 'FLAG_IS', target: 'arctic_thermal_balanced', expected: true }
    ],
    completedMessage: 'Thermal siphon stabilized within generator envelope. Choose priority path.',
    availableDecisions: ARCTIC_DECISIONS_ACT2
  },

  arctic_act_3_stratigraphy: {
    id: 'arctic_act_3_stratigraphy',
    order: 3,
    act: 3,
    title: 'Act III: Stratigraphic Core Dating Vault',
    locationId: 'library',
    archetype: 'SORT',
    passage: {
      heading: 'Glaciological Core Sample Identification Key',
      source: 'Dr. Evelyn Ward’s Permafrost Stratigraphy Ledger:',
      paragraphs: [
        'The Boreas drill extracted 4 primary depth cylinders from the 3,000-meter Greenland ice sheet.',
        'To establish the date of the prehistoric atmospheric dust veil, samples must be organized into their verified geological bins.',
        'UPPER FIRN LAYER: Compacted granular snow containing post-1950 industrial particulates.',
        'HOLOCENE BLUE ICE: Dense crystalline ice containing bubbles of atmospheric air from the Medieval Warm Period.',
        'VOLCANIC ASH BENCHMARK: Dark banded stratum containing sharp glass shards from the 1257 Samalas caldera eruption.',
        'PRE-GLACIAL BEDROCK SILT: Gritty dark till deposited before the Pleistocene glaciation.'
      ],
      keyClues: [
        'upper firn = post-1950 granular snow',
        'holocene = crystalline blue ice with medieval gas bubbles',
        'volcanic ash = dark banded glass shard horizon',
        'bedrock till = pre-glacial silt'
      ]
    },
    sortConfig: {
      categories: [
        { id: 'cat_firn', name: 'Upper Firn (0-100m)', description: 'Recent granular compacted snow with industrial isotopes.' },
        { id: 'cat_holocene', name: 'Holocene Blue Ice (100-1500m)', description: 'Deep crystalline blue ice with medieval air pockets.' },
        { id: 'cat_volcanic', name: 'Volcanic Ash Horizon (1500-2000m)', description: 'Dark banded tephra layer with volcanic glass shards.' },
        { id: 'cat_bedrock', name: 'Basal Till (2000m+)', description: 'Pre-glacial silt, rock flour, and sub-ice bedrock.' }
      ],
      items: [
        { id: 'item_ash_band', label: 'Dark Banded Tephra Core #402', description: 'Sharp micro-vesicular volcanic glass shards.', targetCategoryId: 'cat_volcanic' },
        { id: 'item_blue_ice', label: 'Crystalline Cylinder #188', description: 'Deep azure ice with trapped 12th-century atmospheric bubbles.', targetCategoryId: 'cat_holocene' },
        { id: 'item_firn_snow', label: 'Granular Firn Slab #014', description: 'Porosity 0.45 with trace modern soot deposits.', targetCategoryId: 'cat_firn' },
        { id: 'item_basal_till', label: 'Basal Till Sediment #612', description: 'Sub-ice pulverized bedrock silt and mineral gravel.', targetCategoryId: 'cat_bedrock' }
      ]
    },
    targetReadingSkill: 'literal_retrieval',
    ruleIds: [],
    completionCondition: [
      { type: 'FLAG_IS', target: 'arctic_cores_sorted', expected: true }
    ],
    completedMessage: 'All stratigraphy strata identified and dated accurately.'
  },

  arctic_act_4_radio: {
    id: 'arctic_act_4_radio',
    order: 4,
    act: 4,
    title: 'Act IV: Emergency Radio Distress Synthesis',
    locationId: 'dome',
    archetype: 'SYNTHESIS',
    passage: {
      heading: 'Polar High-Frequency Transceiver Emergency Directive',
      source: 'Thule Air Base Emergency Protocol Manual (Section 8B):',
      paragraphs: [
        'To establish a rescue link through katabatic ionospheric noise, the Boreas transmitter must be harmonized across 3 simultaneous operational parameters.',
        'CARRIER FREQUENCY: Arctic emergency rescue monitors listen exclusively on the primary polar calling channel of 434 kHz.',
        'ANTENNA ELEVATION: To skim the lower tropospheric duct under the blizzard clouds, the directional Yagi mast must be tilted to an elevation angle of exactly 12 degrees.',
        'MODULATION DAMPING: Due to magnetic storm auroral flux, audio modulation damping must be dialed to precisely 65 percent to prevent harmonic clipping.',
        'Engaging the master broadcast actuator with any parameter misaligned will reflect the radio wave back into the transmitter tubes, burning out the final amplifier.'
      ],
      keyClues: [
        'carrier frequency must be tuned to exactly 434 kHz',
        'antenna elevation angle must be set to 12 degrees',
        'modulation damping must be dialed to exactly 65 percent',
        'any parameter misaligned burns out the transmitter amplifier'
      ]
    },
    synthesisConfig: {
      apparatusTitle: 'Polar High-Frequency Distress Array',
      instructionSnippet: 'Tune Carrier Frequency, Antenna Elevation, and Modulation Damping simultaneously to transmit the SOS.',
      mutualExclusionWarning: 'Antenna frequency mismatch against storm elevation will burn final amplifier tubes.',
      parameters: [
        {
          id: 'radio_freq',
          name: 'Carrier Frequency',
          unit: 'kHz',
          minValue: 400,
          maxValue: 460,
          step: 1,
          initialValue: 410,
          targetValue: 434,
          tolerance: 0,
          derivationHint: 'Thule Air Base Emergency Channel (Section 8B)',
          subsystemLabel: 'Oscillator Bus'
        },
        {
          id: 'antenna_elev',
          name: 'Antenna Elevation Angle',
          unit: 'deg',
          minValue: 0,
          maxValue: 45,
          step: 1,
          initialValue: 0,
          targetValue: 12,
          tolerance: 0,
          derivationHint: 'Tropospheric Cloud Duct Horizon Angle',
          subsystemLabel: 'Mast Gimbal'
        },
        {
          id: 'mod_damping',
          name: 'Modulation Damping',
          unit: '%',
          minValue: 0,
          maxValue: 100,
          step: 5,
          initialValue: 20,
          targetValue: 65,
          tolerance: 0,
          derivationHint: 'Auroral Ionization Suppression Ratio',
          subsystemLabel: 'Audio Limiter'
        }
      ]
    },
    targetReadingSkill: 'synthesis',
    ruleIds: [],
    completionCondition: [
      { type: 'FLAG_IS', target: 'arctic_sos_transmitted', expected: true }
    ],
    completedMessage: '★ SOS TRANSMITTED! Thule Air Base acknowledges signal. Polar rescue flight en route!'
  }
};
