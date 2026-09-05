import type { ChallengeSchema } from '../types/learner';

// ============================================================================
// CHALLENGE SCHEMAS (Phase 2)
// Structured facts the AI must preserve when generating/adapting passages.
// Each schema maps 1:1 to an existing Phase 1 challenge.
// ============================================================================

export const challenge1Schema: ChallengeSchema = {
  challengeId: 'challenge_1',
  skill: 'literalRetrieval',
  requiredEntities: [
    'iron lock',
    'oxidized key',
    'brass key',
    'brass latch',
    'archive door',
  ],
  requiredRelationships: [
    'The iron lock accepts only the oxidized key',
    'The brass key is for the brass latch',
    'Both locks must be disengaged to open the door',
  ],
  solutionSteps: [
    'Use the oxidized key on the iron lock',
    'Use the brass key on the brass latch',
    'Open the archive door',
  ],
  evidenceSentences: [
    {
      failureCondition: 'brass_on_iron',
      paragraphIndex: 2,
      evidencePhrase: 'iron lock accepts ONLY the dark, oxidized key',
      hintLevels: [
        'Look closely at which key matches which lock. The passage is very specific about this.',
        'The text says the iron lock only accepts one particular key. Find which one.',
        'Use the oxidized iron key on the iron lock, not the brass key.',
      ],
    },
    {
      failureCondition: 'iron_on_brass',
      paragraphIndex: 2,
      evidencePhrase: 'brass key was crafted exclusively for the high latch',
      hintLevels: [
        'Read the passage again — each key has a specific lock it was made for.',
        'The passage mentions the brass key was crafted for a specific lock. Which one?',
        'Use the brass key on the upper brass latch.',
      ],
    },
    {
      failureCondition: 'door_locked',
      paragraphIndex: 3,
      evidencePhrase: 'both locks have been smoothly disengaged',
      hintLevels: [
        'The door needs more than one lock opened. Check if all locks are disengaged.',
        'The passage says BOTH locks must be disengaged before the door will open.',
        'Unlock the iron lock AND the brass latch, then try the door.',
      ],
    },
  ],
};

export const challenge2Schema: ChallengeSchema = {
  challengeId: 'challenge_2',
  skill: 'sequencing',
  requiredEntities: [
    'locking pin',
    'catalog carousel crank',
    'carousel',
  ],
  requiredRelationships: [
    'The locking pin must be withdrawn BEFORE the crank is rotated',
    'Forcing the crank while the pin is engaged will jam the mechanism',
  ],
  requiredSequenceWords: ['before', 'first', 'then', 'must'],
  solutionSteps: [
    'Withdraw the locking pin',
    'Turn the catalog carousel crank',
  ],
  evidenceSentences: [
    {
      failureCondition: 'crank_while_pinned',
      paragraphIndex: 1,
      evidencePhrase: 'locking pin must be withdrawn BEFORE the hand crank is rotated',
      hintLevels: [
        'Look at what the text says about the order of steps. Something must happen first.',
        'The passage mentions a part under the table that needs to be moved before the crank.',
        'Withdraw the locking pin first, then try the crank.',
      ],
    },
  ],
};

export const challenge3Schema: ChallengeSchema = {
  challengeId: 'challenge_3',
  skill: 'causeEffect',
  requiredEntities: [
    'condenser',
    'water inlet valve',
    'furnace burner',
    'hydraulic lift piston',
  ],
  requiredRelationships: [
    'The condenser must be filled with water before the burner is ignited',
    'Igniting the burner without water causes a thermal alarm and the flame is extinguished',
    'Steam pressure from heated water powers the hydraulic lift',
  ],
  requiredSequenceWords: ['before', 'causes', 'without', 'must'],
  solutionSteps: [
    'Fill the condenser with water using the inlet valve',
    'Ignite the furnace burner',
    'Activate the hydraulic lift piston',
  ],
  evidenceSentences: [
    {
      failureCondition: 'burner_without_water',
      paragraphIndex: 1,
      evidencePhrase: 'condenser must be filled before the burner is ignited',
      hintLevels: [
        'Read the passage carefully — what must happen before you can light the burner?',
        'The text says the condenser needs something before heating is safe.',
        'Fill the condenser with water first, then ignite the burner.',
      ],
    },
  ],
};

export const challenge4Schema: ChallengeSchema = {
  challengeId: 'challenge_4',
  skill: 'negativeConstraint',
  requiredEntities: [
    'hydro turbine switch',
    'solar bank switch',
    'master transformer switch',
  ],
  requiredRelationships: [
    'The master transformer accepts exactly ONE power source at a time',
    'Connecting both hydro and solar simultaneously causes a phase conflict that blows the overload breaker',
    'At least one source must be connected for the transformer to activate',
    'Never connect both sources at the same time',
  ],
  requiredSequenceWords: ['never', 'only', 'one', 'both', 'simultaneously'],
  solutionSteps: [
    'Turn on exactly ONE power switch (hydro OR solar, not both)',
    'Throw the master transformer switch',
  ],
  evidenceSentences: [
    {
      failureCondition: 'both_sources_on',
      paragraphIndex: 1,
      evidencePhrase: 'NEVER connect both sources simultaneously',
      hintLevels: [
        'The passage has a strong warning about what you must NOT do. Find that warning.',
        'The text says connecting both power sources at the same time is dangerous.',
        'Turn off one of the two power switches, then try the master transformer.',
      ],
    },
    {
      failureCondition: 'no_source_on',
      paragraphIndex: 1,
      evidencePhrase: 'master transformer accepts exactly ONE power source',
      hintLevels: [
        'The transformer needs power. What does the text say about power sources?',
        'You need to connect exactly one power source before the transformer will work.',
        'Turn on either the hydro turbine OR the solar bank switch first.',
      ],
    },
  ],
};

export const challenge5Schema: ChallengeSchema = {
  challengeId: 'challenge_5',
  skill: 'multiCondition',
  requiredEntities: [
    'quartz prism',
    'mounting cradle',
    'alignment clamp',
    'cleaning brush',
  ],
  requiredRelationships: [
    'The cradle must be swept clear of debris before the prism can be seated',
    'The alignment clamp must be loosened before the prism can be seated',
    'Both conditions (clean cradle AND loosened clamp) must be met simultaneously',
    'A dirty cradle will cause the prism to tilt on grit',
    'An engaged clamp will physically block insertion',
  ],
  requiredSequenceWords: ['and', 'both', 'before', 'must'],
  solutionSteps: [
    'Use the cleaning brush on the mounting cradle',
    'Loosen the alignment clamp',
    'Mount the quartz prism in the cradle',
  ],
  evidenceSentences: [
    {
      failureCondition: 'dirty_cradle',
      paragraphIndex: 1,
      evidencePhrase: 'cradle has been thoroughly swept clear of all grit',
      hintLevels: [
        'The passage lists conditions for mounting the prism. Have you met all of them?',
        'The text says the cradle must be clean before the prism can be placed.',
        'Use the cleaning brush on the cradle first.',
      ],
    },
    {
      failureCondition: 'clamp_locked',
      paragraphIndex: 1,
      evidencePhrase: 'thumbscrew alignment clamp has been loosened',
      hintLevels: [
        'There are TWO conditions for mounting. Check if both are satisfied.',
        'The clamp needs to be loosened, not just the cradle cleaned.',
        'Loosen the alignment clamp, then mount the prism.',
      ],
    },
  ],
};

export const challenge6Schema: ChallengeSchema = {
  challengeId: 'challenge_6',
  skill: 'synthesis',
  requiredEntities: [
    'telescope azimuth dial',
    'dome shutter dogging wheel',
    'star clock synchronizer',
    'master aperture lever',
  ],
  requiredRelationships: [
    'The telescope must point directly North toward Polaris',
    'The dome shutter dogging wheel must be unlocked',
    'The generator must be synchronized with the star clock',
    'All three conditions must be met before the master aperture lever will work',
    'If any condition is missing, the lever remains locked',
  ],
  requiredSequenceWords: ['all', 'must', 'before', 'north'],
  solutionSteps: [
    'Rotate the azimuth dial to North',
    'Unlock the dome shutter dogging wheel',
    'Synchronize the star clock',
    'Pull the master aperture lever',
  ],
  evidenceSentences: [
    {
      failureCondition: 'lever_conditions_unmet',
      paragraphIndex: 2,
      evidencePhrase: 'If any single condition is neglected, the master aperture lever will remain firmly locked',
      hintLevels: [
        'The passage lists THREE things that must all be done. Have you completed all of them?',
        'Check: Is the telescope pointing North? Is the shutter unlocked? Is the star clock synced?',
        'Complete all three tasks: rotate to North, unlock the shutter wheel, sync the star clock. Then pull the lever.',
      ],
    },
  ],
};

export const heroTritonSchema: ChallengeSchema = {
  challengeId: 'hero_triton_transfer',
  skill: 'causeEffect',
  requiredEntities: [
    'seawater intake valve',
    'thermal reactor coil',
    'coolant loop',
  ],
  requiredRelationships: [
    'The primary seawater intake valve MUST be fully opened before thermal ignition',
    'Engaging the thermal reactor while dry triggers emergency acoustic blow-off',
  ],
  solutionSteps: [
    'Open the seawater intake valve',
    'Ignite the thermal reactor coil',
  ],
  evidenceSentences: [
    {
      failureCondition: 'reactor_fail_dry',
      paragraphIndex: 1,
      evidencePhrase: 'primary seawater intake valve MUST be fully opened',
      hintLevels: [
        'Look at what the submersible manual says must be opened before igniting the reactor.',
        'Seawater must flood the titanium coils before the thermal core is engaged.',
        'Open the Seawater Intake Valve first, then ignite the Thermal Reactor.',
      ],
    },
  ],
};

export const act1Schema: ChallengeSchema = {
  challengeId: 'act_1_vestibule',
  skill: 'sequencing',
  requiredEntities: ['iron_lock', 'brass_latch', 'archive_door'],
  requiredRelationships: ['Disengage brass latch before iron lock'],
  solutionSteps: ['Disengage upper brass latch', 'Unlock iron deadbolt with master key', 'Push oak portal open'],
  evidenceSentences: [
    {
      failureCondition: 'wrong_order',
      paragraphIndex: 2,
      evidencePhrase: 'FIRST disengage the upper brass latch by hand. THEN insert the iron master key into the lower deadbolt.',
      hintLevels: [
        'The surveyor journal states which catch must be released first.',
        'Read paragraph 3 about disengaging the upper brass latch before the deadbolt.',
        'Release the upper brass latch by hand before turning the iron key.'
      ]
    }
  ]
};

export const act2Schema: ChallengeSchema = {
  challengeId: 'act_2_clock',
  skill: 'causeEffect',
  requiredEntities: ['deadbeat_escapement', 'pendulum_clutch'],
  requiredRelationships: ['Elevation reduces pendulum rate by 2 BPM to 58 BPM'],
  solutionSteps: ['Calibrate escapement rate to 58 BPM', 'Engage pendulum drive clutch'],
  evidenceSentences: [
    {
      failureCondition: 'wrong_calibration',
      paragraphIndex: 2,
      evidencePhrase: 'reduced gravitational acceleration requires the bob weight to be lowered by exactly 2 beats per minute, setting the true sidereal rate to precisely 58 BPM',
      hintLevels: [
        'Examine the horological ledger for the elevation rate at 2,840 meters.',
        'Reduced gravitational acceleration requires lowering the rate by 2 BPM from 60 BPM.',
        'The true sidereal rate is precisely 58 BPM.'
      ]
    }
  ]
};

export const act3Schema: ChallengeSchema = {
  challengeId: 'act_3_junction',
  skill: 'negativeConstraint',
  requiredEntities: ['archive_power_switch', 'hydraulic_power_switch'],
  requiredRelationships: ['Dynamo reserve load ceiling is 100 kW; Archive 80 kW + Hydraulic 80 kW = 160 kW overload'],
  solutionSteps: ['Activate Archive OR Laboratory power switch exclusively'],
  evidenceSentences: [
    {
      failureCondition: 'overload',
      paragraphIndex: 2,
      evidencePhrase: 'Engaging both the Archive and Hydraulic switches simultaneously draws 160 kW, which INSTANTLY TRIPS the magnetic master breaker with an explosive arc.',
      hintLevels: [
        'Check the maximum load ceiling on auxiliary coal reserves.',
        'Engaging both switches draws 160 kW, exceeding the 100 kW ceiling.',
        'Engaging both switches draws 160 kW and trips the master breaker.'
      ]
    }
  ]
};

export const act4Schema: ChallengeSchema = {
  challengeId: 'act_4_navigation',
  skill: 'synthesis',
  requiredEntities: ['intercom_pipe'],
  requiredRelationships: ['Bedrock seismic tremors shifted the telescope pier by 3 arcseconds'],
  solutionSteps: ['Synthesize conflicting logs from Sterling and Aris'],
  evidenceSentences: [
    {
      failureCondition: 'uninformed_dialogue',
      paragraphIndex: 1,
      evidencePhrase: 'lunar perigee triggered deep micro-seismic tremors in Mount Caelum’s granite core',
      hintLevels: [
        'Read Machinist Aris\'s incident log carefully.',
        'Look for the geological reason Aris gave for the pier shift.',
        'Bedrock micro-seismic tremors shifted the telescope pier.'
      ]
    }
  ]
};

export const act5Schema: ChallengeSchema = {
  challengeId: 'act_5_adaptive',
  skill: 'causeEffect',
  requiredEntities: ['emergency_telemetry_terminal'],
  requiredRelationships: ['Ceramic safety shunt is required to prevent arcing'],
  solutionSteps: ['Install Ceramic Safety Shunt in Socket #1'],
  evidenceSentences: [
    {
      failureCondition: 'wrong_component',
      paragraphIndex: 3,
      evidencePhrase: 'only a non-conductive ceramic casing will prevent high-voltage arcing',
      hintLevels: [
        'Read the warning about raw copper wire.',
        'Look at what material prevents high-voltage arcing during dome rotation.',
        'Only a ceramic casing prevents high-voltage arcing.'
      ]
    }
  ]
};

export const act7Schema: ChallengeSchema = {
  challengeId: 'act_7_dome',
  skill: 'synthesis',
  requiredEntities: ['azimuth_dial', 'shutter_lock_wheel', 'star_clock_sync_switch', 'quartz_receptacle', 'master_aperture_lever'],
  requiredRelationships: ['Azimuth North, shutter dogs released, star clock synced, quartz prism seated'],
  solutionSteps: ['Rotate azimuth to North', 'Release shutter dogs', 'Sync star clock', 'Insert quartz prism', 'Haul master aperture actuator'],
  evidenceSentences: [
    {
      failureCondition: 'premature_actuation',
      paragraphIndex: 4,
      evidencePhrase: 'Only when all four conditions are fulfilled will pulling the Master Aperture Actuator open',
      hintLevels: [
        'Check the bronze plaque for the four transit prerequisites.',
        'Look for the sentence describing when the Master Aperture Actuator may be pulled.',
        'All four systems must be aligned before pulling the master lever.'
      ]
    }
  ]
};

/** All schemas keyed by challenge ID */
export const ALL_SCHEMAS: Record<string, ChallengeSchema> = {
  challenge_1: challenge1Schema,
  challenge_2: challenge2Schema,
  challenge_3: challenge3Schema,
  challenge_4: challenge4Schema,
  challenge_5: challenge5Schema,
  challenge_6: challenge6Schema,
  hero_triton_transfer: heroTritonSchema,
  act_1_vestibule: act1Schema,
  act_2_clock: act2Schema,
  act_2_archive: act2Schema,
  act_2_hydraulics: act2Schema,
  act_3_junction: act3Schema,
  act_4_navigation: act4Schema,
  act_5_adaptive: act5Schema,
  act_7_dome: act7Schema,
};

