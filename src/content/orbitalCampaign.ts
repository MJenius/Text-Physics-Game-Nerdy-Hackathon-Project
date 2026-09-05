import type { Challenge, Entity, GameRule } from '../types/game';

// ============================================================================
// AETHER-9 ORBITAL OBSERVATORY (SPACE CORONAGRAPH MINI-EXPERIENCE)
// Solar corona interferometry at Sun-Earth L1 Lagrange Point.
// ============================================================================

export const ORBITAL_ENTITIES: Record<string, Entity> = {
  polarizer_filter_gimbal: {
    id: 'polarizer_filter_gimbal',
    name: 'Coronagraph Polarizing Filter Gimbal',
    locationId: 'dome',
    description: 'Birefringent quartz optical disk protecting photomultiplier detectors from hard x-ray solar flare surge.',
    states: { angleDeg: 0, isCalibrated: false },
    isInteractable: true,
    isInInventory: false,
    allowedActions: ['ACTIVATE', 'INSPECT'],
    icon: 'Sun'
  }
};

export const ORBITAL_RULES: GameRule[] = [
  {
    id: 'rule_orbital_polarization_safety',
    challengeId: 'orbital_act_1_coronagraph',
    action: 'ACTIVATE',
    targetId: 'polarizer_filter_gimbal',
    conditions: [
      { type: 'ENTITY_STATE', target: 'polarizer_filter_gimbal', property: 'angleDeg', expected: 48 }
    ],
    onSuccess: {
      effects: [
        { type: 'SET_ENTITY_STATE', target: 'polarizer_filter_gimbal', property: 'isCalibrated', value: true },
        { type: 'SET_FLAG', target: 'orbital_coronagraph_aligned', value: true },
        { type: 'DISCOVER_FACT', target: 'orbital_coronagraph', value: 'Coronagraph polarizing gimbal locked at 48 degrees.' }
      ],
      feedbackMessage: '★ OPTICAL POLARIZATION LOCKED! Photomultiplier sensors shielded. Solar corona interferometer active.',
      soundEffect: 'latch_click',
      consequenceVisual: 'door_unlock'
    },
    onFailure: {
      feedbackMessage: 'WARNING: Polarization angle misaligned! Sensors will suffer irreversible solar flare burnout. Check Solar Ephemeris log.',
      soundEffect: 'breaker_trip',
      consequenceVisual: 'circuit_spark'
    }
  }
];

export const ORBITAL_SCENES: Record<string, Challenge> = {
  orbital_act_1_coronagraph: {
    id: 'orbital_act_1_coronagraph',
    order: 1,
    act: 1,
    title: 'Act I: Solar Coronagraph Polarization',
    locationId: 'dome',
    archetype: 'CALIBRATE',
    passage: {
      heading: 'Aether-9 Solar Corona Alignment Directive',
      source: 'Chief Flight Controller Lin’s L1 Lagrange Telemetry Dossier:',
      paragraphs: [
        'CRITICAL ALERT: Sun-Earth L1 orbit is currently intercepting an X-class solar flare. Hard x-ray photon flux is surging past 10,000 counts per second.',
        'OPTICAL DAMAGE HAZARD: Opening the primary Coronagraph aperture without tuning the quartz polarizing gimbal will instantly blind and fuse the photomultiplier sensors.',
        'POLARIZATION CALCULATION REQUIRED: Solar flare orientation cannot be read off a single dial. The safe absorption angle must be mathematically derived by synthesizing the magnetic baseline with the local Faraday rotation sheath.',
        'OPERATIONAL PROCEDURE: Synthesize the baseline angle from Telemetry Link with the plasma offset from the Faraday log. Tune the Quartz Polarizer to the net derived angle before engaging the detector bus.'
      ],
      keyClues: [
        'X-class solar flare surging hard x-ray flux',
        'opening aperture without quartz polarizer blinds photomultipliers',
        'safe absorption angle must be derived by synthesizing baseline with Faraday shift',
        'tune quartz polarizer to net derived angle'
      ],
      documents: [
        {
          id: 'doc_orbital_ephemeris',
          type: 'scientific_report',
          title: 'Solar Flare Magnetic Baseline Ephemeris',
          source: 'Aether-9 Deep Space Telemetry Link',
          dateOrStamp: 'Cycle 78 • 14:02 UTC',
          paragraphs: [
            'Coronal mass ejection unperturbed magnetic vector measured at 60° relative to the solar equatorial baseline plane.',
            'Raw primary beam orientation remains steady at positive 60 degrees prior to magnetosheath transit.'
          ],
          keyClues: ['magnetic vector measured at 60 degrees relative to solar equatorial baseline']
        },
        {
          id: 'doc_orbital_faraday',
          type: 'scientific_report',
          title: 'L1 Lagrange Plasma Faraday Rotation Log',
          source: 'Aether-9 Sub-Ionospheric Magnetometer',
          dateOrStamp: '14:05 UTC Sensor Sweep',
          paragraphs: [
            'Dense coronal plasma transit through the L1 Lagrange point induces an exact negative angular rotation of -12° upon incoming polarized wavefronts.',
            'Effective angle incident on the optical gimbal is: [Equatorial Baseline Angle] + [Induced Faraday Rotation].'
          ],
          keyClues: ['induces exact negative angular rotation of -12 degrees', 'effective angle is baseline plus induced rotation']
        },
        {
          id: 'doc_orbital_safety',
          type: 'maintenance_manual',
          title: 'EVA Airlock & Sensor Safety Protocol',
          source: 'Astronaut Flight Operations Manual',
          dateOrStamp: 'Rev. 4.2',
          paragraphs: [
            'The quartz polarizing gimbal must match the net effective incident plasma angle resulting from the equatorial baseline vector corrected by the local Faraday shift.',
            'Photomultiplier safe-absorption window tolerates zero divergence. Firing the detector bus at uncalibrated angles triggers catastrophic sensor blowout.'
          ],
          keyClues: ['quartz polarizing gimbal must match net effective incident plasma angle']
        }
      ]
    },
    targetReadingSkill: 'synthesis',
    ruleIds: ORBITAL_RULES.map((r) => r.id),
    completionCondition: [
      { type: 'FLAG_IS', target: 'orbital_coronagraph_aligned', expected: true }
    ],
    completedMessage: '★ OPTICAL SYNTHESIS VERIFIED! Derived plasma angle successfully locked. Solar corona interferometry active!'
  }
};
