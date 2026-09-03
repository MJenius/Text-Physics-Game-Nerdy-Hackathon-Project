import type { WorldId, WorldDefinition } from './worldTypes';

export const WORLD_REGISTRY: Record<WorldId, WorldDefinition> = {
  lost_observatory: {
    id: 'lost_observatory',
    name: 'The Lost Observatory',
    tagline: 'Restoring Victorian Astronomy on Mount Caelum',
    era: 'Late 19th Century (1894)',
    settingDescription:
      'A sprawling mountain-top complex of copper domes, stone vaults, and brass gear-trains abandoned in panic during an ominous celestial alignment.',
    environmentalVocabulary: [
      'sidereal time',
      'deadbeat escapement',
      'azimuth bearing',
      'counterweight',
      'steam dynamo',
      'quartz refractometer',
      'shutter dog',
      'mercury bath',
      'cross-latch',
      'vernier scale'
    ],
    documentTaxonomies: [
      {
        type: 'field_journal',
        label: 'Field Journal',
        description: 'Bound leather notebook recording curator observations, lock states, and astronomical notes.',
        sampleSource: 'Curator Sterling’s Mount Caelum Survey Journal, Vol. IV'
      },
      {
        type: 'maintenance_manual',
        label: 'Machinist’s Ledger',
        description: 'Rigid mechanical tolerances, boiler pressure charts, and dynamo electrical specifications.',
        sampleSource: 'Chief Machinist Aris’s Workshop Docket'
      },
      {
        type: 'telegraph',
        label: 'Acoustic Telegraph Dispatch',
        description: 'Urgent wire transcript transmitting emergency orders from the Royal Astronomical Society.',
        sampleSource: 'Mount Caelum Telegraph Terminal'
      },
      {
        type: 'personal_diary',
        label: 'Private Diary',
        description: 'Handwritten confessions and suspicions detailing interpersonal friction before evacuation.',
        sampleSource: 'Curator Sterling’s Desk Drawer'
      }
    ],
    failureModes: [
      {
        code: 'gear_bind',
        label: 'Gear Train Seizure',
        visualEffect: 'gear_shudder',
        soundEffect: 'gear_shudder',
        description: 'Interlocking brass pinions bind under opposing mechanical torque.'
      },
      {
        code: 'steam_blowout',
        label: 'Boiler Vapor Venting',
        visualEffect: 'steam_burst',
        soundEffect: 'steam_burst',
        description: 'Safety burst disc pops, venting superheated steam across the floor.'
      },
      {
        code: 'circuit_overload',
        label: 'Dynamo Breaker Trip',
        visualEffect: 'circuit_spark',
        soundEffect: 'breaker_trip',
        description: 'Load exceeded 100 kW bus rating. Magnetic breaker snaps open in a shower of sparks.'
      },
      {
        code: 'shutter_lock',
        label: 'Copper Petal Jam',
        visualEffect: 'shutter_slam',
        soundEffect: 'latch_click',
        description: 'Unbalanced counterweights catch against the guide rails, locking the dome closed.'
      }
    ],
    themePalette: {
      primaryColor: '#f59e0b', // Amber 500
      accentColor: '#d97706', // Amber 600
      bgDark: '#0c1017',
      borderTone: '#78350f',
      fontClass: 'font-serif',
      atmosphereIcon: 'Compass'
    },
    narrativeConflicts: [
      'Sterling accused Aris of sabotaging the clockwork during the conjunction.',
      'Aris warned that bedrock micro-fractures were shifting the telescope pier.',
      'Power generation was insufficient to run both the archives and the hydraulic lifts.'
    ],
    defaultStartingAct: 1
  },

  arctic_station: {
    id: 'arctic_station',
    name: 'Boreas Sub-Zero Station',
    tagline: 'Permafrost Glaciology at 82° North',
    era: 'Mid 20th Century Cold War (1961)',
    settingDescription:
      'A subterranean scientific research bunker drilled directly into Greenland permafrost, cut off by a category-5 katabatic blizzard with failing thermal conduits.',
    environmentalVocabulary: [
      'permafrost core',
      'glycol loop',
      'diesel pre-heater',
      'cryostat',
      'katabatic wind',
      'barometric depression',
      'thermal siphon',
      'fuel gelation',
      'airlock vestibule',
      'generator governor'
    ],
    documentTaxonomies: [
      {
        type: 'scientific_report',
        label: 'Ice Core Density Log',
        description: 'Precision depth measurements, isotopic carbon records, and gas-pocket chemical profiles.',
        sampleSource: 'Boreas Core Vault Station Register'
      },
      {
        type: 'emergency_log',
        label: 'Base Incident Report',
        description: 'Timestamped emergency protocols for generator freeze-up and glycol line venting.',
        sampleSource: 'Chief Engineer Olsen’s Thermal Logbook'
      },
      {
        type: 'telegraph',
        label: 'Radio Distress Transcript',
        description: 'Fragmented radio dispatches detailing transport flights turned back by polar squalls.',
        sampleSource: 'Thule Air Base Relay Station'
      }
    ],
    failureModes: [
      {
        code: 'conduit_freeze',
        label: 'Glycol Congealment',
        visualEffect: 'steam_burst',
        soundEffect: 'steam_burst',
        description: 'Thermal coolant drops below -40°C and solidifies inside the primary heat exchanger.'
      },
      {
        code: 'diesel_trip',
        label: 'Generator Fuel Starvation',
        visualEffect: 'gear_shudder',
        soundEffect: 'gear_shudder',
        description: 'Paraffin wax crystals choke the diesel injection manifold, stalling the power plant.'
      },
      {
        code: 'pressure_breach',
        label: 'Vestibule Draft Blow-in',
        visualEffect: 'shutter_slam',
        soundEffect: 'shutter_slam',
        description: 'Unlatched outer vestibule door catches the 80-knot gale, blasting snow into the lab.'
      }
    ],
    themePalette: {
      primaryColor: '#38bdf8', // Sky 400
      accentColor: '#0284c7', // Sky 600
      bgDark: '#07131e',
      borderTone: '#0369a1',
      fontClass: 'font-mono',
      atmosphereIcon: 'Snowflake'
    },
    narrativeConflicts: [
      'The drilling crew drilled into an anomalous pressurized methane cavity.',
      'Ration reserves are depleted and thermal power must be rationed between incubators and crew quarters.',
      'Radio silence leaves the station uncertain whether rescue has been dispatched.'
    ],
    defaultStartingAct: 1
  },

  triton_deep_sea: {
    id: 'triton_deep_sea',
    name: 'Triton-IV Trench Station',
    tagline: 'Abyssal Geothermal Triage at 6,000 Meters',
    era: 'Near-Future Sub-Oceanic (2042)',
    settingDescription:
      'A modular titanium research habitat anchored into the Marianas Trench floor alongside active hydrothermal black smokers, suffering a secondary coolant vapor lock.',
    environmentalVocabulary: [
      'vapor lock',
      'cavitation',
      'hydrothermal vent',
      'ballast manifold',
      'titanium bulkhead',
      'salinity gradient',
      'geothermal turbine',
      'differential pressure',
      'acoustic pinger',
      'relief valve'
    ],
    documentTaxonomies: [
      {
        type: 'maintenance_manual',
        label: 'Reactor Cooling Directive',
        description: 'Operating parameters for high-salinity closed-loop geothermal heat exchangers.',
        sampleSource: 'Oceanic Research Consortium Technical Docket'
      },
      {
        type: 'emergency_log',
        label: 'Submersible Delta Incident Log',
        description: 'Critical chronology of the tectonic tremor that triggered vapor bubble cavitation in Loop B.',
        sampleSource: 'Engineer Vance’s Black Box Terminal'
      },
      {
        type: 'witness_transcript',
        label: 'Intercom Acoustic Record',
        description: 'Recorded communications between Command Hub and the diving bell prior to evacuation.',
        sampleSource: 'Triton Habitat Comm Array'
      }
    ],
    failureModes: [
      {
        code: 'vapor_lock_blowout',
        label: 'Impeller Cavitation Burst',
        visualEffect: 'steam_burst',
        soundEffect: 'steam_burst',
        description: 'Unvented superheated steam pockets explode inside the primary recirculation impeller!'
      },
      {
        code: 'bulkhead_seal_strain',
        label: 'Hydrostatic Seal Groan',
        visualEffect: 'gear_shudder',
        soundEffect: 'gear_shudder',
        description: 'Titanium compression rings groan violently under 600 atmospheres of seawater pressure.'
      },
      {
        code: 'relay_burn',
        label: 'Saltwater Short Circuit',
        visualEffect: 'circuit_spark',
        soundEffect: 'breaker_trip',
        description: 'Condensation drips onto bus bar #4, tripping emergency safety shunts.'
      }
    ],
    themePalette: {
      primaryColor: '#2dd4bf', // Teal 400
      accentColor: '#0f766e', // Teal 700
      bgDark: '#04151b',
      borderTone: '#115e59',
      fontClass: 'font-sans',
      atmosphereIcon: 'Anchor'
    },
    narrativeConflicts: [
      'Vance insisted the secondary geothermal loop was safe, while telemetry showed dangerous cavitation.',
      'Command ordered a complete facility depressurization without securing the sample bay.',
      'Ballast pumps cannot fire until thermal balance prevents explosive steam flashing.'
    ],
    defaultStartingAct: 1
  },

  orbital_habitat: {
    id: 'orbital_habitat',
    name: 'Aether-9 Orbital Observatory',
    tagline: 'Solar Corona Interferometry in Low Earth Orbit',
    era: 'Advanced Space Exploration (2078)',
    settingDescription:
      'A counter-rotating astronomical habitat positioned in the Sun-Earth L1 Lagrange point, aligning coronal coronagraphs while solar flare radiation surges across the hull.',
    environmentalVocabulary: [
      'coronagraph',
      'reaction wheel',
      'airlock interlock',
      'reaction control thruster',
      'solar flare',
      'CO2 scrubber canister',
      'quaternary bus',
      'lagrange point',
      'interferometer baseline',
      'attitude hold'
    ],
    documentTaxonomies: [
      {
        type: 'scientific_report',
        label: 'Solar Flare Ephemeris',
        description: 'Hard x-ray flux calculations, coronal mass ejection arrival vectors, and magnetic shielding angles.',
        sampleSource: 'Aether Orbital Telemetry Link'
      },
      {
        type: 'maintenance_manual',
        label: 'EVA Airlock Checklist',
        description: 'Strict 5-step depressurization, umbilical check, and solar mast drive calibration procedures.',
        sampleSource: 'Astronaut Flight Operations Manual'
      },
      {
        type: 'emergency_log',
        label: 'Habitat Life-Support Telemetry',
        description: 'Partial pressure of oxygen, carbon dioxide ppm warnings, and battery bus voltages.',
        sampleSource: 'Environmental Control Terminal'
      }
    ],
    failureModes: [
      {
        code: 'solar_overload',
        label: 'Sensor Photomultiplier Burnout',
        visualEffect: 'circuit_spark',
        soundEffect: 'breaker_trip',
        description: 'Coronagraph aperture opened without polarizing filter! Optical sensors blinded by direct solar flux.'
      },
      {
        code: 'airlock_interlock_alarm',
        label: 'Differential Pressure Hazard',
        visualEffect: 'shutter_slam',
        soundEffect: 'shutter_slam',
        description: 'Outer hatch refused actuation: chamber pressure not equalized to vacuum threshold.'
      },
      {
        code: 'attitude_drift',
        label: 'Reaction Wheel Gyro Wobble',
        visualEffect: 'gear_shudder',
        soundEffect: 'gear_shudder',
        description: 'Opposing counter-torques introduce a 2-arcsecond yaw wobble, blurring the interferometry array.'
      }
    ],
    themePalette: {
      primaryColor: '#60a5fa', // Blue 400
      accentColor: '#3b82f6', // Blue 500
      bgDark: '#05070d',
      borderTone: '#1e3a8a',
      fontClass: 'font-mono',
      atmosphereIcon: 'Orbit'
    },
    narrativeConflicts: [
      'Flight control ordered the solar shields closed, but closing them depowers the primary telescope array.',
      'A micrometeorite punctured life-support module 3, forcing crew into the unshielded observation rotunda.',
      'Ground communications are blacked out by coronal ionization for the next 4 hours.'
    ],
    defaultStartingAct: 1
  }
};

export const getWorldDefinition = (id: WorldId): WorldDefinition => {
  return WORLD_REGISTRY[id] || WORLD_REGISTRY.lost_observatory;
};
