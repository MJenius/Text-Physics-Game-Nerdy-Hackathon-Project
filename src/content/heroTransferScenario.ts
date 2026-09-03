import type { ScenarioSpecification } from '../types/scenario';

// ============================================================================
// HERO TRANSFER SCENARIO: DEEP-SEA RESEARCH STATION TRITON-IV
// Genuine crisis triage investigation and causal system stabilization.
// Same underlying reasoning: Causal Loop (prerequisite unblocking before active pumping)
// but completely different narrative, multi-document text, and diagnostic interaction.
// ============================================================================

export const TRITON_TRANSFER_SCENARIO: ScenarioSpecification = {
  id: 'hero_triton_transfer',
  topologyId: 'TOP-2',
  targetSkill: 'causeEffect',
  audience: 'teens',
  readingDifficulty: 'intermediate',
  theme: 'triton_submarine',
  title: 'Triton-IV: Deep-Sea Reactor Thermal Runaway',
  passage: {
    heading: 'Station Triton-IV: Incident Triage & Emergency Operations Log',
    source: 'Recovered from Submersible Delta-Deck Terminal, Depth 4,000m:',
    paragraphs: [
      'ALARM CONDITION RED: The geothermal turbine core at Station Delta is experiencing thermal runaway. Core temperature is surging toward 500°C.',
      'INCIDENT INVESTIGATION NOTE (Chief Engineer Vance): “The thermal surge was NOT caused by an external seawater blockage. Diagnostic scans confirm severe VAPOR LOCK inside the heat exchanger recirculation loop.”',
      'OPERATIONAL CONSTRAINT: “The primary Seawater Recirculation Pump MUST NOT be energized while the Vapor Lock Bypass Valve is closed. Starting the pump against trapped steam vapor will cause immediate hydrodynamic cavitation, destroying the impeller blades.”',
      'RECOVERY PROCEDURE: First, OPEN the manual Vapor Lock Bypass Valve to vent trapped steam into the deep-sea ballast jacket. Once the lines are purged of vapor, ENGAGE the Seawater Recirculation Pump. Finally, ACTUATE the Emergency Scram Handle to stabilize the core temperature.”'
    ],
    keyClues: [
      'thermal surge caused by vapor lock inside recirculation loop',
      'recirculation pump MUST NOT be energized while vapor bypass is closed',
      'first open vapor lock bypass valve, then engage recirculation pump, then actuate emergency scram'
    ]
  },
  entities: {
    vapor_bypass_valve: {
      id: 'vapor_bypass_valve',
      name: 'Vapor Lock Bypass Valve',
      locationId: 'submersible_delta',
      description: 'Heavy titanium handwheel controlling the steam pressure relief bypass into the outer ocean ballast.',
      states: { isOpen: false },
      isInteractable: true,
      isInInventory: false,
      allowedActions: ['ACTIVATE', 'INSPECT'],
      icon: 'Droplets'
    },
    recirc_pump_switch: {
      id: 'recirc_pump_switch',
      name: 'Primary Seawater Recirculation Pump',
      locationId: 'submersible_delta',
      description: 'High-pressure electric turbine pump circulating 4°C ocean water through the reactor coils.',
      states: { isRunning: false },
      isInteractable: true,
      isInInventory: false,
      allowedActions: ['ACTIVATE', 'INSPECT'],
      icon: 'Zap'
    },
    core_temp_monitor: {
      id: 'core_temp_monitor',
      name: 'Geothermal Core Temperature Monitor',
      locationId: 'submersible_delta',
      description: 'Digital phosphor display tracking core temperature and acoustic cavitation sensors.',
      states: { tempC: 480, status: 'CRITICAL RUNAWAY' },
      isInteractable: false,
      isInInventory: false,
      allowedActions: ['INSPECT'],
      icon: 'Gauge'
    },
    emergency_scram_handle: {
      id: 'emergency_scram_handle',
      name: 'Emergency Reactor Stabilization Scram Handle',
      locationId: 'submersible_delta',
      description: 'High-leverage yellow-and-black commit handle that locks reactor control rods into cooling position.',
      states: { isStabilized: false },
      isInteractable: true,
      isInInventory: false,
      allowedActions: ['ACTIVATE'],
      icon: 'Sliders'
    }
  },
  initialInventory: [],
  rules: [
    // 1. Open Vapor Lock Bypass Valve
    {
      id: 'rule_triton_open_bypass',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'vapor_bypass_valve',
      conditions: [
        { type: 'ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', expected: false }
      ],
      onSuccess: {
        effects: [
          { type: 'SET_ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', value: true },
          { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'status', value: 'VAPOR PURGED' },
          { type: 'DISCOVER_FACT', target: 'triton', value: 'Trapped steam vented to deep-sea ballast; recirculation loop purged.' }
        ],
        feedbackMessage: 'PSSSSSH-CLACK! Trapped high-pressure steam vents safely into the deep ocean ballast. The recirculation lines are purged of vapor lock!',
        soundEffect: 'steam_vent',
        consequenceVisual: 'steam_burst'
      },
      onFailure: {
        feedbackMessage: 'The vapor bypass valve is already fully open.'
      }
    },
    // 2. Firing Recirculation Pump while Vapor Bypass is CLOSED -> CAVITATION FAILURE
    {
      id: 'rule_triton_pump_fail_cavitation',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'recirc_pump_switch',
      conditions: [
        { type: 'ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', expected: false }
      ],
      onSuccess: { effects: [], feedbackMessage: '' },
      onFailure: {
        feedbackMessage: 'KREEECH! Metallic shrieking echoes through the submarine hull! The pump strikes trapped vapor pockets—hydrodynamic cavitation triggers an emergency breaker trip!',
        soundEffect: 'screech_alarm',
        consequenceVisual: 'circuit_spark'
      }
    },
    // 3. Engaging Recirculation Pump when Vapor Bypass is OPEN -> SUCCESSFUL FLOOD
    {
      id: 'rule_triton_pump_success',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'recirc_pump_switch',
      conditions: [
        { type: 'ENTITY_STATE', target: 'vapor_bypass_valve', property: 'isOpen', expected: true },
        { type: 'ENTITY_STATE', target: 'recirc_pump_switch', property: 'isRunning', expected: false }
      ],
      onSuccess: {
        effects: [
          { type: 'SET_ENTITY_STATE', target: 'recirc_pump_switch', property: 'isRunning', value: true },
          { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'tempC', value: 240 },
          { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'status', value: 'FLOODING' },
          { type: 'DISCOVER_FACT', target: 'triton', value: 'Chilled ocean water flowing smoothly through reactor cooling jacket.' }
        ],
        feedbackMessage: 'A deep, rhythmic whir fills the deck. 4°C abyssal seawater floods through the titanium coils. Core temperature plunges from 480°C down to 240°C!',
        soundEffect: 'pump_hum',
        consequenceVisual: 'gear_shudder'
      },
      onFailure: {
        feedbackMessage: 'The seawater recirculation pump is already operating at full capacity.'
      }
    },
    // 4. Actuating Scram Handle before pump is running -> FAILURE
    {
      id: 'rule_triton_scram_fail_premature',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'emergency_scram_handle',
      conditions: [
        { type: 'ENTITY_STATE', target: 'recirc_pump_switch', property: 'isRunning', expected: false }
      ],
      onSuccess: { effects: [], feedbackMessage: '' },
      onFailure: {
        feedbackMessage: 'CLATTER. Scram rods cannot insert: core temperature is too high without coolant circulation! Flood the coils first.',
        consequenceVisual: 'gear_shudder'
      }
    },
    // 5. Actuating Scram Handle after pump is running -> MASTER CRISIS STABILIZATION
    {
      id: 'rule_triton_scram_success',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'emergency_scram_handle',
      conditions: [
        { type: 'ENTITY_STATE', target: 'recirc_pump_switch', property: 'isRunning', expected: true },
        { type: 'ENTITY_STATE', target: 'emergency_scram_handle', property: 'isStabilized', expected: false }
      ],
      onSuccess: {
        effects: [
          { type: 'SET_ENTITY_STATE', target: 'emergency_scram_handle', property: 'isStabilized', value: true },
          { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'tempC', value: 110 },
          { type: 'SET_ENTITY_STATE', target: 'core_temp_monitor', property: 'status', value: 'OPTIMAL NOMINAL' },
          { type: 'SET_FLAG', target: 'triton_crisis_resolved', value: true },
          { type: 'DISCOVER_FACT', target: 'triton', value: 'Station Triton-IV successfully saved from geothermal core meltdown.' }
        ],
        feedbackMessage: 'CHUNKKK. The boron-carbide scram rods lock into the reactor core. Emergency klaxons fall silent. Core temperature stabilizes at a safe 110°C. Station Triton-IV is saved!',
        soundEffect: 'reactor_stable',
        consequenceVisual: 'door_unlock'
      },
      onFailure: {
        feedbackMessage: 'The reactor core is already fully stabilized.'
      }
    }
  ],
  completionConditions: [
    { type: 'ENTITY_STATE', target: 'emergency_scram_handle', property: 'isStabilized', expected: true }
  ],
  evidenceSnippet: 'The primary Seawater Recirculation Pump MUST NOT be energized while the Vapor Lock Bypass Valve is closed',
  evidenceParagraphIndex: 2
};
