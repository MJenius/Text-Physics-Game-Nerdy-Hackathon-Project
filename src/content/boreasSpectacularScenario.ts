import type { Challenge, Entity, GameRule, Predicate } from '../types/game';
import type { AIScenarioSpecification } from '../types/scenario';

// ============================================================================
// FLAGSHIP SPECTACULAR SCENARIO: BOREAS SUB-ZERO STATION
// Permafrost Glaciology at 82° North during a Category-5 Katabatic Blizzard.
// Core Causal Puzzle: Primary Diesel Generator Stalling & Congealing Glycol Loops.
//
// 3 Interlocking Documents:
// 1. Chief Glaciologist Olsen's Thermal Log (Misleading correlation: pressure drop)
// 2. Machinist Lindqvist's Pre-Heater Docket (Physical mechanism: paraffin wax gelation below -5°C)
// 3. Vault Telemetry Recording (Event timing: confirms pressure drop followed fuel starvation)
//
// Mechanics: Physical intervention reveals the consequence; re-reading confirms ground truth.
// ============================================================================

export const BOREAS_SPECTACULAR_SPEC: AIScenarioSpecification = {
  world: 'arctic_station',
  archetype: 'INVESTIGATION',
  targetSkill: 'causeEffect',
  targetMisconception: 'sequence_causation_confusion',
  difficulty: 'intermediate',
  ambiguity: 'high',
  centralMystery: 'Why did the primary diesel generator stall at -42°C, and what order restores thermal equilibrium without seizing the turbine?',
  documents: [
    {
      id: 'doc_boreas_olsen_log',
      title: 'Chief Olsen’s Emergency Incident Log',
      type: 'emergency_log',
      source: 'Boreas Sub-Zero Command Terminal • 03:14 UTC',
      dateOrStamp: 'Cycle 14 • Blizzard Hour 18',
      role: 'misleading_correlation',
      paragraphs: [
        '03:10 UTC — Catastrophic generator RPM drop. Thermal siphon glycol temperature plummeted to -38°C.',
        'INITIAL DIAGNOSIS (Olsen): “The barometric depressurization valve must have vented prematurely, starving the combustion chamber of manifold pressure. I recommend opening the emergency pressure relief valve to clear back-pressure before attempting restart.”',
      ],
      keyClues: [
        'Olsen suspects premature depressurization',
        'recommends opening emergency pressure relief valve to clear back-pressure',
      ],
      factsCovered: ['fact_olsen_claim'],
    },
    {
      id: 'doc_boreas_lindqvist_docket',
      title: 'Chief Machinist Lindqvist’s Pre-Heater Docket',
      type: 'maintenance_manual',
      source: 'Generator Room Clipboard • Polar Winter Operating Directive',
      dateOrStamp: 'Directive Arctic-4B',
      role: 'physical_mechanism',
      paragraphs: [
        'CRITICAL ARCTIC FUEL SPECIFICATION: High-viscosity polar diesel contains paraffin waxes that undergo rapid gelation when glycol temperatures drop below -5°C.',
        'OPERATIONAL HAZARD: “If fuel starvation stalls the generator, do NOT actuate the fuel injection manifold while cold. Attempting to force wax-gelled diesel through high-pressure nozzles will sheer the governor gear train.”',
        'MANDATORY PROCEDURE: “First energize the Glycol Pre-Heater Coil to liquefy paraffin wax crystals in the supply manifold. Only after fuel viscosity reaches nominal flow rate may the Injection Manifold and Thermal Bypass be engaged.”',
      ],
      keyClues: [
        'paraffin wax undergoes gelation below -5°C',
        'forcing gelled diesel will sheer governor gear train',
        'must first energize Glycol Pre-Heater Coil before injection manifold and bypass',
      ],
      factsCovered: ['fact_wax_gelation', 'fact_preheater_prerequisite'],
    },
    {
      id: 'doc_boreas_vault_telemetry',
      title: 'Permafrost Core Vault Telemetry Transcript',
      type: 'scientific_report',
      source: 'Automated Barometric & Thermal Recording Strip',
      dateOrStamp: '03:00 - 03:15 UTC Telemetry Log',
      role: 'event_timing',
      paragraphs: [
        '03:04 UTC — Glycol line pre-heater circuit lost primary voltage. Line temperature crossed -6°C.',
        '03:08 UTC — Fuel line flow rate dropped to 0.02 L/min due to paraffin crystal accumulation.',
        '03:10 UTC — Engine halted from severe fuel starvation.',
        '03:12 UTC — Manifold pressure dropped to ambient 840 mbar (A CONSEQUENCE of engine halting, NOT the cause).',
      ],
      keyClues: [
        'line temperature crossed -6°C at 03:04',
        'fuel flow rate halted from wax at 03:08',
        'pressure drop occurred AFTER engine halted at 03:12',
      ],
      factsCovered: ['fact_telemetry_timing', 'fact_pressure_was_consequence'],
    },
  ],
  requiredFacts: [
    {
      id: 'fact_olsen_claim',
      statement: 'Olsen claims pressure loss caused the engine stall and recommends venting back-pressure.',
      sourceDocumentId: 'doc_boreas_olsen_log',
      snippet: 'barometric depressurization valve must have vented prematurely',
    },
    {
      id: 'fact_wax_gelation',
      statement: 'Diesel paraffin wax solidifies below -5°C causing fuel starvation.',
      sourceDocumentId: 'doc_boreas_lindqvist_docket',
      snippet: 'paraffin waxes that undergo rapid gelation when glycol temperatures drop below -5°C',
    },
    {
      id: 'fact_preheater_prerequisite',
      statement: 'Glycol pre-heater must be energized to liquefy paraffin before fuel manifold injection.',
      sourceDocumentId: 'doc_boreas_lindqvist_docket',
      snippet: 'First energize the Glycol Pre-Heater Coil to liquefy paraffin wax crystals',
    },
    {
      id: 'fact_telemetry_timing',
      statement: 'Pre-heater lost voltage at 03:04 and fuel froze at 03:08 prior to engine stall.',
      sourceDocumentId: 'doc_boreas_vault_telemetry',
      snippet: '03:08 UTC — Fuel line flow rate dropped to 0.02 L/min due to paraffin crystal accumulation',
    },
    {
      id: 'fact_pressure_was_consequence',
      statement: 'The manifold pressure drop occurred at 03:12 as a consequence of engine shutdown.',
      sourceDocumentId: 'doc_boreas_vault_telemetry',
      snippet: 'Manifold pressure dropped to ambient 840 mbar (A CONSEQUENCE of engine halting, NOT the cause)',
    },
  ],
  requiredRelations: [
    {
      id: 'rel_gelation_caused_stall',
      subjectFactId: 'fact_wax_gelation',
      relation: 'CAUSED',
      objectFactId: 'fact_telemetry_timing',
      description: 'Paraffin wax gelation caused the fuel starvation and subsequent generator halt.',
    },
    {
      id: 'rel_pressure_not_cause',
      subjectFactId: 'fact_pressure_was_consequence',
      relation: 'DID_NOT_CAUSE',
      objectFactId: 'fact_wax_gelation',
      description: 'Pressure drop occurred after the engine halted and was not the root cause.',
    },
    {
      id: 'rel_preheater_depends',
      subjectFactId: 'fact_preheater_prerequisite',
      relation: 'DEPENDS_ON',
      objectFactId: 'fact_wax_gelation',
      description: 'Pre-heating depends on overcoming paraffin crystal solidification.',
    },
  ],
  plausibleFalseHypothesis: 'Manifold depressurization caused the stall; venting pressure relief will restore fuel flow.',
  requiredInference: 'Paraffin wax gelation froze the fuel lines before the engine halted; pre-heating must precede injection.',
  supportStrategy: 'Compare telemetry timestamp of temperature drop (03:04) vs pressure drop (03:12).',
  failureConsequences: [
    'Opening the pressure relief valve vents superheated vapor, instantly freezing the lines and seizing the turbine.',
  ],
  successConsequences: [
    'Glycol coil energized -> Paraffin liquefied -> Fuel manifold engaged -> Generator restarted!',
  ],
  topologyId: 'TOP-2',
  evidenceSnippet: 'Manifold pressure dropped to ambient 840 mbar (A CONSEQUENCE of engine halting, NOT the cause)',
  evidenceParagraphIndex: 3,
};

export const BOREAS_SPECTACULAR_ENTITIES: Record<string, Entity> = {
  glycol_preheater_switch: {
    id: 'glycol_preheater_switch',
    name: 'Glycol Pre-Heater Coil Switch',
    locationId: 'boreas_station',
    description: 'Heavy porcelain rotary toggle commanding auxiliary electric heating coils wrapped around the fuel intake pipe.',
    states: { isEnergized: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Flame',
  },
  fuel_injection_manifold: {
    id: 'fuel_injection_manifold',
    name: 'Diesel Fuel Injection Manifold',
    locationId: 'boreas_station',
    description: 'Polished bronze injector distributor rail feeding atomized diesel into the cylinders.',
    states: { isOpen: false, isSheared: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Zap',
  },
  pressure_relief_valve: {
    id: 'pressure_relief_valve',
    name: 'Emergency Pressure Relief Valve',
    locationId: 'boreas_station',
    description: 'High-pressure cast-iron venting lever recommended by Chief Olsen.',
    states: { isOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sliders',
  },
  generator_starter_crank: {
    id: 'generator_starter_crank',
    name: 'Generator Ignition Starter Crank',
    locationId: 'boreas_station',
    description: 'Pneumatic starter flywheel engaging the generator shaft once fuel is primed.',
    states: { isRunning: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE'],
    icon: 'Activity',
  },
};

export const BOREAS_SPECTACULAR_RULES: GameRule[] = [
  // 1. Energize Glycol Pre-Heater (Correct Prerequisite)
  {
    id: 'rule_boreas_preheater',
    challengeId: 'boreas_spectacular_thermal',
    action: 'ACTIVATE',
    targetId: 'glycol_preheater_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'glycol_preheater_switch', property: 'isEnergized', expected: false },
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'glycol_preheater_switch', property: 'isEnergized', value: true },
        { type: 'SET_FLAG', target: 'paraffin_wax_liquefied', value: true },
        { type: 'DISCOVER_FACT', target: 'boreas_wax', value: 'Pre-heater coil energized; paraffin wax crystals liquefying inside fuel intake.' },
      ],
      feedbackMessage: 'HUMMMM-CLACK! The porcelain rotary switch snaps home. Red pilot coils glow as superheated glycol melts the waxy diesel congealment!',
      soundEffect: 'latch_click',
      consequenceVisual: 'steam_burst',
    },
    onFailure: {
      feedbackMessage: 'The pre-heater switch is already engaged and sustaining thermal liquefaction.',
      soundEffect: 'latch_click',
    },
  },

  // 2. Erroneous Pressure Relief Venting (Olsen's Misconception Trap)
  {
    id: 'rule_boreas_false_pressure_vent',
    challengeId: 'boreas_spectacular_thermal',
    action: 'ACTIVATE',
    targetId: 'pressure_relief_valve',
    conditions: [
      { type: 'ENTITY_STATE', target: 'pressure_relief_valve', property: 'isOpen', expected: false },
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'pressure_relief_valve', property: 'isOpen', value: true },
        { type: 'SET_FLAG', target: 'pressure_vented_prematurely', value: true },
      ],
      feedbackMessage: 'KSSSHHHHHH! Sub-zero draft blasts through the vent! Trapped heat escapes and wax freezes solid across the lines! Olsen was mistaken: the pressure drop was an outcome, not the cause!',
      soundEffect: 'steam_burst',
      consequenceVisual: 'steam_burst',
    },
    onFailure: {
      feedbackMessage: 'The relief valve is already open and frost is coating the guide rails.',
      soundEffect: 'steam_burst',
    },
  },

  // 3. Engage Fuel Injection Manifold (Requires Pre-Heater Active AND Pressure Relief Closed)
  {
    id: 'rule_boreas_injection',
    challengeId: 'boreas_spectacular_thermal',
    action: 'ACTIVATE',
    targetId: 'fuel_injection_manifold',
    conditions: [
      { type: 'ENTITY_STATE', target: 'glycol_preheater_switch', property: 'isEnergized', expected: true },
      { type: 'ENTITY_STATE', target: 'pressure_relief_valve', property: 'isOpen', expected: false },
      { type: 'ENTITY_STATE', target: 'fuel_injection_manifold', property: 'isOpen', expected: false },
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'fuel_injection_manifold', property: 'isOpen', value: true },
        { type: 'SET_FLAG', target: 'fuel_flowing', value: true },
        { type: 'DISCOVER_FACT', target: 'boreas_fuel', value: 'Liquid diesel atomizing freely through bronze injector distributor.' },
      ],
      feedbackMessage: 'CLICK-CHUG! With paraffin wax liquefied, bronze injector valves open effortlessly. Clean diesel primes the cylinder heads!',
      soundEffect: 'latch_click',
      consequenceVisual: 'door_unlock',
    },
    onFailure: {
      feedbackMessage: 'CRUNCH! Cold paraffin wax blocks the nozzle! You must energize the Glycol Pre-Heater and ensure pressure lines are not vented to ambient frost.',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder',
    },
  },

  // 4. Starter Flywheel Ignition (Victory Condition)
  {
    id: 'rule_boreas_ignition',
    challengeId: 'boreas_spectacular_thermal',
    action: 'ACTIVATE',
    targetId: 'generator_starter_crank',
    conditions: [
      { type: 'ENTITY_STATE', target: 'fuel_injection_manifold', property: 'isOpen', expected: true },
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'generator_starter_crank', property: 'isRunning', value: true },
        { type: 'SET_FLAG', target: 'boreas_generator_restored', value: true },
        { type: 'POWER_SYSTEM', target: 'boreas_power_grid', value: true },
      ],
      feedbackMessage: 'ROOOAAAR-THUMP-THUMP! The massive six-cylinder diesel engine roars to life! Warm exhaust floods the thermal siphon, restoring life-support across Boreas Station!',
      soundEffect: 'latch_click',
      consequenceVisual: 'door_unlock',
    },
    onFailure: {
      feedbackMessage: 'WHIRRR-cough. The starter flywheel spins dry. Fuel injection manifold is not primed with liquefied diesel.',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'circuit_spark',
    },
  },
];

export const BOREAS_COMPLETION_CONDITIONS: Predicate[] = [
  { type: 'ENTITY_STATE', target: 'generator_starter_crank', property: 'isRunning', expected: true },
];

export const BOREAS_SPECTACULAR_SCENARIO: Challenge = {
  id: 'boreas_spectacular_thermal',
  order: 98,
  act: 2,
  title: 'Boreas Sub-Zero: Thermal Runaway & Permafrost Core Cascade',
  locationId: 'boreas_station',
  archetype: 'INVESTIGATION',
  passage: {
    heading: 'Boreas Sub-Zero Station • Cold War Incident Log (1961)',
    source: 'Chief Glaciologist Olsen & Machinist Lindqvist Investigative Dossier:',
    paragraphs: [
      'CRITICAL BLIZZARD ALERT: Katabatic polar winds have plunged Boreas Station to -42°C. At 03:10 UTC, the primary diesel generator shuddered to a halt, cutting thermal circulation to the permafrost core vaults.',
      'CHIEF OLSEN’S HYPOTHESIS: “The emergency depressurization valve must have vented, starving the cylinders of manifold pressure. We must open the Pressure Relief Valve to dump back-pressure before attempting restart.”',
      'CHIEF MACHINIST LINDQVIST’S WARNING: “Olsen is confusing chronological correlation with physical causality! The telemetry records prove the temperature fell past -6°C four minutes before the stall. Polar diesel contains paraffin waxes that freeze solid below -5°C!”',
      'SYSTEM RECOVERY PROTOCOL: “Do NOT open the Pressure Relief Valve—venting heat into the blizzard will permanently freeze the core. You must first energize the Glycol Pre-Heater Coil to melt the waxy congealment, then open the Fuel Injection Manifold, and finally engage the Generator Ignition Starter Crank.”',
    ],
    keyClues: [
      'Olsen claims pressure loss caused the stall',
      'telemetry shows temperature fell to -6°C four minutes before the stall',
      'paraffin wax freezes solid below -5°C',
      'first energize Glycol Pre-Heater Coil, then Fuel Injection Manifold, then Ignition Crank',
    ],
    documents: [
      {
        id: 'doc_boreas_olsen_log',
        type: 'emergency_log',
        title: 'Chief Olsen’s Incident Log',
        source: 'Boreas Sub-Zero Command Terminal • 03:14 UTC',
        dateOrStamp: 'Hour 18 of Blizzard',
        role: 'misleading_correlation',
        paragraphs: [
          '03:10 UTC — Catastrophic generator RPM drop. Thermal siphon glycol temperature plummeted to -38°C.',
          'INITIAL DIAGNOSIS: “The barometric depressurization valve must have vented prematurely, starving the combustion chamber. Opening the emergency pressure relief valve is urgently required.”',
        ],
        keyClues: ['Olsen recommends opening emergency pressure relief valve to clear back-pressure'],
      },
      {
        id: 'doc_boreas_lindqvist_docket',
        type: 'maintenance_manual',
        title: 'Chief Machinist Lindqvist’s Pre-Heater Directive',
        source: 'Generator Room Docket • Polar Winter Directive Arctic-4B',
        dateOrStamp: 'Rev. 3.1',
        role: 'physical_mechanism',
        paragraphs: [
          'CRITICAL ARCTIC FUEL SPECIFICATION: High-viscosity polar diesel contains paraffin waxes that undergo rapid gelation when glycol temperatures drop below -5°C.',
          'OPERATIONAL HAZARD: “If fuel starvation stalls the generator, do NOT actuate the fuel injection manifold while cold. Attempting to force wax-gelled diesel will sheer the governor gear train.”',
          'MANDATORY PROCEDURE: “First energize the Glycol Pre-Heater Coil to liquefy paraffin wax crystals in the supply manifold. Only after fuel viscosity reaches nominal flow rate may the Injection Manifold and Ignition Crank be engaged.”',
        ],
        keyClues: [
          'paraffin wax solidifies below -5°C',
          'first energize Glycol Pre-Heater Coil before injection manifold and crank',
        ],
      },
      {
        id: 'doc_boreas_vault_telemetry',
        type: 'scientific_report',
        title: 'Permafrost Core Vault Telemetry Strip',
        source: 'Automated Barometric & Thermal Recording Strip',
        dateOrStamp: '03:00 - 03:15 UTC Telemetry Log',
        role: 'event_timing',
        paragraphs: [
          '03:04 UTC — Glycol line pre-heater circuit lost primary voltage. Line temperature crossed -6°C.',
          '03:08 UTC — Fuel line flow rate dropped to 0.02 L/min due to paraffin crystal accumulation.',
          '03:10 UTC — Engine halted from severe fuel starvation.',
          '03:12 UTC — Manifold pressure dropped to ambient 840 mbar (A CONSEQUENCE of engine halting, NOT the cause).',
        ],
        keyClues: [
          'line temperature crossed -6°C at 03:04',
          'fuel flow halted at 03:08 due to paraffin',
          'pressure dropped at 03:12 as a consequence of engine halt',
        ],
      },
    ],
  },
  targetReadingSkill: 'cause_effect',
  ruleIds: BOREAS_SPECTACULAR_RULES.map((r) => r.id),
  completionCondition: BOREAS_COMPLETION_CONDITIONS,
  completedMessage: '★ Ground Truth Established! You avoided Olsen’s misleading correlation, melted the paraffin gelation with the pre-heater, and restored thermal power to Boreas Sub-Zero Station!',
};
