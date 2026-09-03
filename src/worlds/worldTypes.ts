export type WorldId =
  | 'lost_observatory'
  | 'arctic_station'
  | 'triton_deep_sea'
  | 'orbital_habitat';

export interface DocumentTaxonomy {
  type: string;
  label: string;
  description: string;
  sampleSource: string;
}

export interface FailureMode {
  code: string;
  label: string;
  visualEffect: 'steam_burst' | 'gear_shudder' | 'circuit_spark' | 'shutter_slam' | 'door_unlock' | 'none';
  soundEffect: string;
  description: string;
}

export interface WorldThemePalette {
  primaryColor: string;
  accentColor: string;
  bgDark: string;
  borderTone: string;
  fontClass: string;
  atmosphereIcon: string;
}

export interface WorldDefinition {
  id: WorldId;
  name: string;
  tagline: string;
  era: string;
  settingDescription: string;
  environmentalVocabulary: string[];
  documentTaxonomies: DocumentTaxonomy[];
  failureModes: FailureMode[];
  themePalette: WorldThemePalette;
  narrativeConflicts: string[];
  defaultStartingAct: number;
}
