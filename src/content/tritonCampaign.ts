import type { Challenge, Entity, GameRule, DecisionOption } from '../types/game';

// ============================================================================
// TRITON-IV TRENCH STATION (ABYSSAL DEEP-SEA MINI-EXPERIENCE)
// Complete multi-act interactive reading adventure at 6,000m depth.
// ============================================================================

export const TRITON_ENTITIES: Record<string, Entity> = {
  vapor_bypass_valve: {
    id: 'vapor_bypass_valve',
    name: 'Vapor Lock Bypass Handwheel',
    locationId: 'submersible_delta',
    description: 'Heavy titanium valve routing trapped steam bubbles into the deep-sea ballast jacket.',
    states: { isOpen: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Droplets'
  },
  recirc_pump_switch: {
    id: 'recirc_pump_switch',
    name: 'Seawater Recirculation Pump Switch',
    locationId: 'submersible_delta',
    description: 'High-pressure electric turbine pump drawing 4°C ocean water through the reactor coils.',
    states: { isRunning: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Zap'
  },
  core_temp_monitor: {
    id: 'core_temp_monitor',
    name: 'Geothermal Core Telemetry Monitor',
    locationId: 'submersible_delta',
    description: 'Cathode display tracking core temperature and turbine cavitation acoustic sensors.',
    states: { tempC: 480, status: 'SURGING RUNAWAY' },
    isInteractable: false,
    isInInventory: false,
    allowedActions: ['INSPECT'],
    icon: 'Gauge'
  },
  emergency_scram_lever: {
    id: 'emergency_scram_lever',
    name: 'Emergency Reactor Scram Actuator',
    locationId: 'submersible_delta',
    description: 'Reinforced commit handle that locks reactor control rods into cooling position.',
    states: { isStabilized: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'SYNTHESIS_COMMIT'],
    icon: 'Sliders'
  }
};

export const TRITON_RULES: GameRule[] = [
  // 1. Open Vapor Bypass Valve
  {
    id: 'r_triton_open_bypass',
    challengeId: 'triton_act_1_vapor',
    action: 'ACTIVATE',
    targetId: 'vapor_bypass_valve',
    conditions: [
      { type: 'ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', expected: false }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', value: true },
        { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'status', value: 'VAPOR PURGED' },
        { type: 'DISCOVER_FACT', target: 'triton', value: 'Trapped steam vented into deep-sea ballast; recirculation loop purged of vapor lock.' }
      ],
      feedbackMessage: 'PSSSSSH-CLACK! High-pressure steam vents safely into the ballast jacket. The cooling loop is purged of vapor lock!',
      soundEffect: 'steam_burst',
      consequenceVisual: 'steam_burst'
    },
    onFailure: { feedbackMessage: 'Bypass valve is already open.' }
  },
  // 2. Start Recirculation Pump (Requires bypass open)
  {
    id: 'r_triton_start_pump_success',
    challengeId: 'triton_act_1_vapor',
    action: 'ACTIVATE',
    targetId: 'recirc_pump_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', expected: true }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'recirc_pump_switch', property: 'isRunning', value: true },
        { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'tempC', value: 260 },
        { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'status', value: 'COOLING FLOW ACTIVE' }
      ],
      feedbackMessage: 'HUMMMM. The primary seawater turbine starts with smooth hydrodynamic laminar flow. Chilled 4°C ocean water floods the cooling coils!',
      soundEffect: 'dynamo_hum',
      consequenceVisual: 'gear_shudder'
    },
    onFailure: { feedbackMessage: 'Pump is already running.' }
  },
  // 3. Catastrophic Cavitation failure (Starting pump while bypass is closed)
  {
    id: 'r_triton_start_pump_cavitation',
    challengeId: 'triton_act_1_vapor',
    action: 'ACTIVATE',
    targetId: 'recirc_pump_switch',
    conditions: [
      { type: 'ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', expected: false }
    ],
    onSuccess: { effects: [], feedbackMessage: '' },
    onFailure: {
      feedbackMessage: 'BANG-BANG-SHUDDER! Severe hydrodynamic cavitation! Starting the pump against trapped steam vapor violently chips the turbine impeller blades!',
      soundEffect: 'gear_shudder',
      consequenceVisual: 'gear_shudder'
    }
  }
];

export const TRITON_DECISIONS_ACT1: DecisionOption[] = [
  {
    id: 'decision_triton_vent_to_sea',
    label: 'Vent Superheated Steam to Open Abyss',
    description: 'Vents steam directly into deep ocean water outside the hull, avoiding ballast jacket strain.',
    rationaleWhy: 'Preserves the structural ballast tanks against thermal fatigue.',
    downstreamHint: 'External hydrophone arrays detect acoustic plume in Act II. Hull stress remains low.',
    effects: [
      { type: 'RECORD_DECISION', target: 'triton_vent_mode', value: 'ocean_vent', rationale: 'Vented directly to ocean.' },
      { type: 'TRANSITION_SCENE', target: 'triton_act_2_cavitation', value: true }
    ]
  },
  {
    id: 'decision_triton_recirculate_jacket',
    label: 'Condense Steam Internally into Ballast Jacket',
    description: 'Recirculates condensate internally to maintain acoustic stealth and sample isolation.',
    rationaleWhy: 'Prevents boiling ocean fauna and avoids hydrothermal plume signatures.',
    downstreamHint: 'Ballast water temperature rises 15°C. Acoustic sensors remain silent.',
    effects: [
      { type: 'RECORD_DECISION', target: 'triton_vent_mode', value: 'ballast_condense', rationale: 'Condensed into ballast.' },
      { type: 'TRANSITION_SCENE', target: 'triton_act_2_cavitation', value: true }
    ]
  }
];

export const TRITON_SCENES: Record<string, Challenge> = {
  triton_act_1_vapor: {
    id: 'triton_act_1_vapor',
    order: 1,
    act: 1,
    title: 'Act I: Abyssal Vapor Lock Purge',
    locationId: 'submersible_delta',
    archetype: 'ROUTE',
    passage: {
      heading: 'Station Delta Emergency Coolant Directive',
      source: 'Chief Engineer Vance’s Laminated Protocol on Turbine Console:',
      paragraphs: [
        'ALARM CONDITION RED: The geothermal turbine core at Station Delta is experiencing thermal runaway. Core temperature is surging toward 500°C.',
        'INCIDENT INVESTIGATION: Diagnostic scans confirm severe VAPOR LOCK inside the heat exchanger recirculation loop.',
        'OPERATIONAL CONSTRAINT: The primary Seawater Recirculation Pump MUST NOT be started while the Vapor Lock Bypass Valve is closed. Starting the pump against trapped steam vapor causes hydrodynamic cavitation, destroying the impeller blades.',
        'RECOVERY PROCEDURE: First, OPEN the manual Vapor Lock Bypass Valve to vent trapped steam into the deep-sea ballast jacket. Once lines are purged of vapor, START the Seawater Recirculation Pump.'
      ],
      keyClues: [
        'thermal surge caused by vapor lock inside loop',
        'starting pump while bypass closed causes hydrodynamic cavitation',
        'first open vapor lock bypass valve, second start recirculation pump'
      ]
    },
    targetReadingSkill: 'cause_effect',
    ruleIds: TRITON_RULES.map((r) => r.id),
    completionCondition: [
      { type: 'ENTITY_STATE', target: 'recirc_pump_switch', property: 'isRunning', expected: true }
    ],
    completedMessage: 'Cooling loop purged of vapor lock. Recirculation flow established.',
    availableDecisions: TRITON_DECISIONS_ACT1
  },

  triton_act_2_cavitation: {
    id: 'triton_act_2_cavitation',
    order: 2,
    act: 2,
    title: 'Act II: Abyssal Hull Cavitation Forensics',
    locationId: 'library',
    archetype: 'EVIDENCE',
    passage: {
      heading: 'Hydrophone Acoustic Logs & Investigation Dossier',
      source: 'Consortium Oceanic Safety Inquiry (Black Box Logbook):',
      paragraphs: [
        'At 04:12 UTC, Station Delta registered a violent acoustic shockwave, followed by seawater seepage along Bulkhead 4.',
        'COMMAND CLAIM: Base Command dispatched a report claiming: “A 5.2-magnitude tectonic fault tremor sheared the outer bulkhead seals.”',
        'CHIEF ENGINEER VANCE’S COUNTER-CLAIM: “The structural breach was NOT seismic. The acoustic sensor spectrogram at 04:08 UTC recorded 22 kHz high-frequency implosion harmonics inside Pump Housing B—the unmistakable acoustic signature of impeller cavitation occurring four minutes BEFORE the earthquake.”',
        'To settle liability and authorize the emergency scram, the investigator must pin the exact telemetry citation refuting the seismic hypothesis.'
      ],
      keyClues: [
        'command claims 5.2 tectonic tremor at 04:12 caused breach',
        'Vance claims 22 kHz cavitation harmonics inside pump B at 04:08 (4 minutes before seismic event)',
        'seismic event was consequence, not root cause'
      ]
    },
    evidenceConfig: {
      instructionSnippet: 'Pin the specific black box citation that corroborates Vance’s claim that cavitation preceded the tremor.',
      claims: [
        {
          id: 'claim_cavitation_root_cause',
          claimText: 'Hydrodynamic cavitation inside Pump Housing B occurred at 04:08 UTC, four minutes before the tectonic event, directly triggering the seal breach.',
          claimSource: 'Chief Engineer Vance (Oceanic Inquiry Docket #4)',
          isTrue: true,
          requiredProofSnippetId: 'snip_hydrophone_harmonics',
          downstreamFact: 'Black box proves cavitation occurred prior to tectonic tremor.'
        }
      ],
      snippets: [
        {
          id: 'snip_seismic_telemetry',
          documentTitle: 'Marianas Fault Seismograph Log',
          snippetText: '04:12:04 UTC: Low-frequency P-wave detected at epicenter 3.2km west of habitat.',
          authorOrDate: 'Pacific Geodetic Survey'
        },
        {
          id: 'snip_hydrophone_harmonics',
          documentTitle: 'Black Box Acoustic Sensor Spectrogram',
          snippetText: '04:08:19 UTC: Acoustic hydrophones recorded 22 kHz ultrasonic implosion harmonics inside Pump B casing, consistent with violent vapor cavitation collapse.',
          authorOrDate: 'Triton Delta Flight Recorder'
        },
        {
          id: 'snip_water_salinity',
          documentTitle: 'Bilge Salinity Monitor Record',
          snippetText: '04:15:00 UTC: Salinity level in Compartment 4 rose to 35 practical salinity units.',
          authorOrDate: 'Environmental Sensor Array'
        }
      ]
    },
    targetReadingSkill: 'literal_retrieval',
    ruleIds: [],
    completionCondition: [
      { type: 'FLAG_IS', target: 'triton_evidence_verified', expected: true }
    ],
    completedMessage: 'Evidentiary proof corroborated. Cavitation root cause established.'
  },

  triton_act_3_scram: {
    id: 'triton_act_3_scram',
    order: 3,
    act: 3,
    title: 'Act III: Geothermal Reactor Core Stabilization',
    locationId: 'dome',
    archetype: 'SYNTHESIS',
    passage: {
      heading: 'Emergency Reactor Core Scram Operating Envelope',
      source: 'Geothermal Reactor Triage Manual (Depth 6,000m Envelope):',
      paragraphs: [
        'To drop core temperature from 260°C to safe cold shutdown (below 100°C) without flashing coolant into explosive steam, 3 coupled physical variables must be harmonized simultaneously.',
        'PRIMARY VENT PRESSURE: Due to 600 atmospheres of hydrostatic backpressure, the vent manifold must be set to exactly 340 PSI to prevent back-siphonage.',
        'RECIRCULATION SEAWATER FLOW: Chilled seawater flow must be regulated to exactly 85 liters per minute to balance the heat exchanger delta-T.',
        'CONTROL ROD SCRAM INCLINE: To drop through the warped thermal guides under gravity, the scram drive incline must be tilted to exactly 45 degrees.',
        'Committing the master scram actuator while any parameter is out of tolerance will boil the remaining loop fluid and breach the titanium pressure shell.'
      ],
      keyClues: [
        'primary vent pressure must be set to exactly 340 PSI',
        'recirculation seawater flow rate must be set to exactly 85 L/min',
        'scram rod drive incline must be tilted to 45 degrees'
      ]
    },
    synthesisConfig: {
      apparatusTitle: 'Abyssal Geothermal Core Scram Console',
      instructionSnippet: 'Tune Primary Vent Pressure (340 PSI), Seawater Flow (85 L/min), and Scram Incline (45°) simultaneously.',
      mutualExclusionWarning: 'Pressure deviation will flash superheated steam and rupture the titanium bulkhead.',
      parameters: [
        {
          id: 'vent_pressure',
          name: 'Primary Vent Pressure',
          unit: 'PSI',
          minValue: 200,
          maxValue: 450,
          step: 10,
          initialValue: 280,
          targetValue: 340,
          tolerance: 0,
          derivationHint: 'Hydrostatic Backpressure Table (600 atm)',
          subsystemLabel: 'Relief Manifold'
        },
        {
          id: 'recirc_flow',
          name: 'Recirculation Flow Rate',
          unit: 'L/min',
          minValue: 50,
          maxValue: 120,
          step: 5,
          initialValue: 60,
          targetValue: 85,
          tolerance: 0,
          derivationHint: 'Heat Exchanger Delta-T Dissipation Curve',
          subsystemLabel: 'Primary Loop'
        },
        {
          id: 'scram_angle',
          name: 'Scram Rod Incline Angle',
          unit: 'deg',
          minValue: 0,
          maxValue: 90,
          step: 5,
          initialValue: 20,
          targetValue: 45,
          tolerance: 0,
          derivationHint: 'Warped Thermal Guide Incline Tolerance',
          subsystemLabel: 'Rod Drive Gimbal'
        }
      ]
    },
    targetReadingSkill: 'synthesis',
    ruleIds: [],
    completionCondition: [
      { type: 'FLAG_IS', target: 'triton_scram_stabilized', expected: true }
    ],
    completedMessage: '★ REACTOR SCRAM LOCKED! Core temperature stabilizes at 88°C. Station Triton-IV is saved!'
  }
};
