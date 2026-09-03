import type { ScenarioSpecification } from '../types/scenario';

// ============================================================================
// HERO TRANSFER SCENARIO: THE TRITON-IV DEEP-SEA SUBMARINE
// Same underlying topology: Causal Loop (TOP-2)
// In the Observatory:
//   Water Inlet Valve must be OPEN before Furnace Burner is fired, or Boiler overheats.
// In the Triton-IV Submarine:
//   Seawater Coolant Loop must be FLOODED before Thermal Reactor is ignited, or Core Meltdown Alarm trips.
// ============================================================================

export const TRITON_TRANSFER_SCENARIO: ScenarioSpecification = {
  id: 'hero_triton_transfer',
  topologyId: 'TOP-2',
  targetSkill: 'causeEffect',
  audience: 'teens',
  readingDifficulty: 'intermediate',
  theme: 'triton_submarine',
  title: 'Triton-IV: Geothermal Coolant Interlock',
  passage: {
    heading: 'Deep-Sea Technical Log: Reactor Station Delta',
    source: 'Submersible Systems Operational Manual, Section 4.2',
    paragraphs: [
      'The Triton-IV submersible relies on deep-sea geothermal energy to sustain cabin oxygen and propulsion at 4,000 meters.',
      'Before the thermal generator ignition coil can be engaged, the primary seawater intake valve MUST be fully opened. Engaging the thermal reactor while the chamber is dry will immediately trigger an acoustic thermal blow-off alarm and emergency system shutdown.',
      'Once seawater fills the heat exchanger coils, engage the thermal reactor toggle. The turbine will hum to life, restoring auxiliary power to the sub.'
    ],
    keyClues: ['seawater intake', 'thermal reactor', 'MUST be fully opened']
  },
  entities: {
    seawater_intake: {
      id: 'seawater_intake',
      name: 'Seawater Intake Valve',
      locationId: 'laboratory',
      description: 'A heavy titanium wheel valve connected to the ocean intake lines.',
      states: { isFlowing: false },
      isInteractable: true,
      isInInventory: false,
      allowedActions: ['ACTIVATE', 'INSPECT'],
      icon: 'Droplets'
    },
    thermal_reactor: {
      id: 'thermal_reactor',
      name: 'Thermal Reactor Coil',
      locationId: 'laboratory',
      description: 'The high-energy geothermal combustion unit providing propulsion power.',
      states: { isIgnited: false },
      isInteractable: true,
      isInInventory: false,
      allowedActions: ['ACTIVATE', 'INSPECT'],
      icon: 'Flame'
    },
    coolant_gauge: {
      id: 'coolant_gauge',
      name: 'Core Pressure Monitor',
      locationId: 'laboratory',
      description: 'Digital readout tracking core coolant pressure.',
      states: { status: 'NORMAL' },
      isInteractable: false,
      isInInventory: false,
      allowedActions: ['INSPECT'],
      icon: 'Gauge'
    }
  },
  initialInventory: [],
  rules: [
    // 1. Open seawater intake
    {
      id: 'rule_triton_open_intake',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'seawater_intake',
      conditions: [
        { type: 'ENTITY_STATE', target: 'seawater_intake', property: 'isFlowing', expected: false }
      ],
      onSuccess: {
        effects: [
          { type: 'SET_ENTITY_STATE', target: 'seawater_intake', property: 'isFlowing', value: true },
          { type: 'SET_ENTITY_STATE', target: 'coolant_gauge', property: 'status', value: 'FLOODED' }
        ],
        feedbackMessage: 'Hiss-shuck! Seawater floods through the intake manifold, chilling the titanium coils to optimal temperature.'
      },
      onFailure: {
        feedbackMessage: 'The intake valve is already open and supplying ocean water.'
      }
    },
    // 2. Failure: Firing thermal reactor when dry
    {
      id: 'rule_triton_reactor_fail_dry',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'thermal_reactor',
      conditions: [
        { type: 'ENTITY_STATE', target: 'seawater_intake', property: 'isFlowing', expected: false }
      ],
      onSuccess: {
        effects: [],
        feedbackMessage: ''
      },
      onFailure: {
        feedbackMessage: 'KLAXON ALARM! Thermal reactor ignited without seawater coolant! Safety blow-off valves open, venting emergency gas into the bay.'
      }
    },
    // 3. Success: Firing thermal reactor when flooded
    {
      id: 'rule_triton_reactor_success',
      challengeId: 'hero_triton_transfer',
      action: 'ACTIVATE',
      targetId: 'thermal_reactor',
      conditions: [
        { type: 'ENTITY_STATE', target: 'seawater_intake', property: 'isFlowing', expected: true }
      ],
      onSuccess: {
        effects: [
          { type: 'SET_ENTITY_STATE', target: 'thermal_reactor', property: 'isIgnited', value: true },
          { type: 'SET_ENTITY_STATE', target: 'coolant_gauge', property: 'status', value: 'ONLINE' }
        ],
        feedbackMessage: 'WHIRRRR! The thermal core engages smoothly within the flooded coils. Triton-IV auxiliary propulsion hums online!'
      },
      onFailure: {
        feedbackMessage: 'The reactor is already humming steadily.'
      }
    }
  ],
  completionConditions: [
    { type: 'ENTITY_STATE', target: 'thermal_reactor', property: 'isIgnited', expected: true }
  ],
  evidenceSnippet: 'primary seawater intake valve MUST be fully opened',
  evidenceParagraphIndex: 1
};
