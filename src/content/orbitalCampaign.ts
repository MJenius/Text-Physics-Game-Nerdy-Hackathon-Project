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
        'POLARIZATION SPECIFICATION: According to the Faraday rotation ephemeris, coronal plasma polarization is oriented at an azimuth tilt of EXACTLY 48 DEGREES.',
        'OPERATIONAL PROCEDURE: Calibrate the Quartz Polarizer to precisely 48° before engaging the detector bus. Any divergence exceeding ±2° risks permanent sensor burnout.'
      ],
      keyClues: [
        'X-class solar flare surging hard x-ray flux',
        'opening aperture without quartz polarizer blinds photomultipliers',
        'Faraday rotation requires exactly 48 degrees polarization angle',
        'tolerance is ±2 degrees'
      ],
      documents: [
        {
          id: 'doc_orbital_ephemeris',
          type: 'scientific_report',
          title: 'Solar Flare Faraday Ephemeris',
          source: 'Aether-9 Telemetry Link',
          dateOrStamp: 'Cycle 78 • 14:02 UTC',
          paragraphs: [
            'Coronal mass ejection magnetic orientation measured at 48° relative to solar equatorial plane.',
            'Photomultiplier safe-absorption window requires quartz gimbal alignment to exactly 48 degrees.'
          ],
          keyClues: ['quartz gimbal alignment to exactly 48 degrees']
        },
        {
          id: 'doc_orbital_safety',
          type: 'maintenance_manual',
          title: 'EVA Airlock & Sensor Safety Protocol',
          source: 'Astronaut Flight Operations Manual',
          dateOrStamp: 'Rev. 4.2',
          paragraphs: [
            'Under no circumstances actuate Coronagraph shutter while polarizing angle deviates from 48°.',
            'Secondary backup filters provide zero protection against unpolarized solar corona surge.'
          ],
          keyClues: ['zero protection while angle deviates from 48 degrees']
        }
      ]
    },
    targetReadingSkill: 'literal_retrieval',
    ruleIds: ORBITAL_RULES.map((r) => r.id),
    completionCondition: [
      { type: 'FLAG_IS', target: 'orbital_coronagraph_aligned', expected: true }
    ],
    completedMessage: 'Coronagraph aperture calibrated safely! Solar corona spectrum streaming to Earth.'
  }
};
