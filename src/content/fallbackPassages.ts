import type { GeneratedPassage, Audience, ReadingDifficulty } from '../types/learner';
import type { Passage } from '../types/game';

// ============================================================================
// FALLBACK PASSAGES (Phase 2)
// Hand-authored difficulty-tiered passages for when AI is unavailable.
// The existing Phase 1 passages serve as the 'intermediate' tier.
// ============================================================================

interface FallbackEntry {
  beginner: GeneratedPassage;
  advanced: GeneratedPassage;
}

const fallbacks: Record<string, FallbackEntry> = {
  // ── CHALLENGE 1: Archive Courtyard (Literal Retrieval) ──
  challenge_1: {
    beginner: {
      title: 'How to Open the Big Door',
      source: 'A note pinned to the gate:',
      paragraphs: [
        'There are two locks on the big door.',
        'The dark, rusty key opens the iron lock at the bottom.',
        'The shiny brass key opens the brass latch at the top.',
        'You need to open BOTH locks. Then the door will swing open.',
      ],
      targetVocabulary: ['iron lock', 'brass latch', 'oxidized key', 'brass key'],
      readingLevel: 'beginner',
      audience: 'kids',
      generatedAt: 0,
      isAIGenerated: false,
    },
    advanced: {
      title: 'Field Journal Entry #104 — The Outer Portal Mechanism',
      source: 'Recovered from beneath the archway masonry, the gatekeeper\'s original proviso:',
      paragraphs: [
        'The observatory\'s main entrance is secured by a dual-mechanism locking system of deliberately mismatched metallurgies, designed to prevent unauthorized entry even if a single key were compromised.',
        'The lower deadbolt — a rugged iron tumbler with a square, corroded keyway — will yield exclusively to the dark, oxidized iron key whose patina precisely matches the lock\'s internal pin configuration.',
        'Conversely, the ornate upper latch mechanism, fashioned from polished brass with high-notched teeth, was crafted to accept only the slender brass key; no other implement will engage its delicate tumblers.',
        'The reinforced oak door, bound by bronze bands, will not swing inward unless both the iron deadbolt has been retracted and the brass latch has been fully disengaged.',
      ],
      targetVocabulary: ['metallurgy', 'tumbler', 'keyway', 'oxidized', 'patina', 'implement'],
      readingLevel: 'advanced',
      audience: 'adults',
      generatedAt: 0,
      isAIGenerated: false,
    },
  },

  // ── CHALLENGE 2: Grand Library (Sequencing) ──
  challenge_2: {
    beginner: {
      title: 'The Spinning Book Shelf',
      source: 'A label on the desk:',
      paragraphs: [
        'The big bookshelf can spin around like a carousel.',
        'But first, you MUST pull out the locking pin under the table.',
        'Then you can turn the crank to spin it.',
        'If you turn the crank before pulling the pin, it will get stuck!',
      ],
      targetVocabulary: ['locking pin', 'crank', 'carousel'],
      readingLevel: 'beginner',
      audience: 'kids',
      generatedAt: 0,
      isAIGenerated: false,
    },
    advanced: {
      title: 'Field Journal Entry #142 — The Rotating Stacks Mechanism',
      source: 'Extracted from the Senior Curator\'s classified maintenance ledger:',
      paragraphs: [
        'The central catalog carousel — a precision-engineered rotating assembly of mahogany book stacks — conceals the descending passage to the hydraulic laboratory beneath its platform.',
        'Critical operational sequence: the brass security bolt (designated the "locking pin"), recessed beneath the study table\'s lower frame, must be fully withdrawn before any rotational force is applied to the iron hand-crank.',
        'Failure to observe this procedural prerequisite will result in catastrophic engagement: the drive shaft cogs, still constrained by the engaged pin, will seize violently under torque, arresting the entire mechanism and potentially shearing the brass gear teeth.',
      ],
      targetVocabulary: ['carousel', 'recessed', 'prerequisite', 'torque', 'arresting', 'shearing'],
      readingLevel: 'advanced',
      audience: 'adults',
      generatedAt: 0,
      isAIGenerated: false,
    },
  },

  // ── CHALLENGE 3: Laboratory Boiler (Cause & Effect) ──
  challenge_3: {
    beginner: {
      title: 'The Steam Machine',
      source: 'A sign on the boiler:',
      paragraphs: [
        'This machine makes steam to power the lift.',
        'First, fill the tank with water using the blue valve.',
        'Then, light the burner under the tank.',
        'If you light the burner without water, an alarm will go off and the fire goes out!',
      ],
      targetVocabulary: ['water inlet valve', 'burner', 'steam', 'lift'],
      readingLevel: 'beginner',
      audience: 'kids',
      generatedAt: 0,
      isAIGenerated: false,
    },
    advanced: {
      title: 'Field Journal Entry #178 — Hydraulic Boiler Operations',
      source: 'From the laboratory safety protocols, embossed on copper plate:',
      paragraphs: [
        'The hydraulic lift system is powered by steam pressure generated in the copper boiling cylinder. The condenser reservoir must be filled to operational capacity via the mountain aqueduct inlet valve before any thermal activation is attempted.',
        'Igniting the furnace burner beneath a dry condenser will trigger the thermal overload safety system: a shrill alarm sounds as the automatic extinguisher kills the flame to prevent catastrophic chamber rupture from uncontrolled dry heating.',
        'Only when the condenser is properly charged with water and the burner has been ignited will sufficient steam pressure accumulate to actuate the hydraulic lift piston, raising the platform to the Control Junction level.',
      ],
      targetVocabulary: ['condenser', 'aqueduct', 'thermal overload', 'actuate', 'piston'],
      readingLevel: 'advanced',
      audience: 'adults',
      generatedAt: 0,
      isAIGenerated: false,
    },
  },

  // ── CHALLENGE 4: Control Junction (Negative Constraint) ──
  challenge_4: {
    beginner: {
      title: 'The Power Switches',
      source: 'A warning card on the wall:',
      paragraphs: [
        'The big switch needs power to work.',
        'You can turn on the water power OR the sun power.',
        'But NEVER turn on both at the same time!',
        'If both are on when you flip the big switch, it will break and both turn off!',
      ],
      targetVocabulary: ['hydro turbine', 'solar bank', 'transformer', 'overload'],
      readingLevel: 'beginner',
      audience: 'kids',
      generatedAt: 0,
      isAIGenerated: false,
    },
    advanced: {
      title: 'Field Journal Entry #215 — Power Distribution Protocol',
      source: 'From the Chief Engineer\'s safety memorandum, stamped CRITICAL:',
      paragraphs: [
        'The master transformer serving the observatory dome operates on a strict single-source topology. It accepts input from either the hydro turbine generator line or the photovoltaic solar bank line — but categorically not from both simultaneously.',
        'Attempting to close the master transformer switch while both power feeds are energized will produce an instantaneous phase conflict across the relay coils, resulting in a violent overload condition: the breaker trips explosively, automatically disconnecting both source lines and requiring manual re-engagement.',
        'To safely energize the dome circuit: activate exactly one generation source, verify the other remains de-energized, then and only then throw the master transformer switch to connect the selected feed through to the dome bus.',
      ],
      targetVocabulary: ['topology', 'photovoltaic', 'phase conflict', 'relay coils', 'de-energized'],
      readingLevel: 'advanced',
      audience: 'adults',
      generatedAt: 0,
      isAIGenerated: false,
    },
  },

  // ── CHALLENGE 5: Celestial Telescope (Multi-Condition) ──
  challenge_5: {
    beginner: {
      title: 'Setting Up the Telescope',
      source: 'Instructions in the optics case:',
      paragraphs: [
        'The telescope needs a special crystal called a prism.',
        'Before you put the prism in its holder, you need to do TWO things:',
        'First, sweep the holder clean with the brush. Second, loosen the clamp.',
        'If the holder is dirty, the prism will wobble. If the clamp is tight, you can\'t fit it in.',
      ],
      targetVocabulary: ['prism', 'cradle', 'clamp', 'brush'],
      readingLevel: 'beginner',
      audience: 'kids',
      generatedAt: 0,
      isAIGenerated: false,
    },
    advanced: {
      title: 'Field Journal Entry #274 — Optical Assembly Procedure',
      source: 'Embossed in the leather optics case lid, a precision alignment protocol:',
      paragraphs: [
        'The celestial spectrograph\'s refractive capability depends entirely upon the hexagonal-cut quartz prism being seated with absolute precision in the mounting cradle.',
        'Two prerequisite conditions must be simultaneously satisfied before insertion is attempted: the mounting cradle cavity must be thoroughly swept clear of all accumulated grit, dust, and mineral debris using the provided bristle brush; and the thumbscrew alignment clamp — which secures the cradle\'s receiving aperture — must be loosened to its fully retracted position.',
        'Attempting to seat the crystal in a fouled socket will result in angular displacement as the facet tilts on particulate matter, destroying calibration. An unloosened clamp will present a physical obstruction that prevents the prism from passing through the aperture entirely.',
      ],
      targetVocabulary: ['spectrograph', 'refractive', 'hexagonal', 'aperture', 'angular displacement', 'particulate'],
      readingLevel: 'advanced',
      audience: 'adults',
      generatedAt: 0,
      isAIGenerated: false,
    },
  },

  // ── CHALLENGE 6: Grand Observatory Dome (Synthesis) ──
  challenge_6: {
    beginner: {
      title: 'Opening the Observatory Roof',
      source: 'Written above the big telescope:',
      paragraphs: [
        'To open the roof and see the stars, THREE things must be ready:',
        'The telescope must point NORTH, toward the North Star.',
        'The round shutter wheel must be unlocked.',
        'The star clock must be connected to the generator.',
        'When all three are done, pull the big lever to open the roof!',
      ],
      targetVocabulary: ['azimuth', 'shutter wheel', 'star clock', 'aperture lever'],
      readingLevel: 'beginner',
      audience: 'kids',
      generatedAt: 0,
      isAIGenerated: false,
    },
    advanced: {
      title: 'Field Journal Entry #300 — Master Celestial Synthesis Protocol',
      source: 'Inscribed in gold leaf directly above the primary telescope eyepiece:',
      paragraphs: [
        'The grand culmination of the observatory requires the harmonious union of all three mechanical subsystems, each drawing upon principles mastered in the preceding chambers.',
        'To part the celestial dome: the telescope barrel\'s azimuth bearing must be rotated to point directly North toward Polaris (the celestial pole reference); the dome shutter dogging wheel must be disengaged from its sealed position, retracting the copper observation slit doors; and the laboratory generator drive governor must be coupled to the celestial sidereal clock escapement, synchronizing the tracking mechanism to Earth\'s rotational velocity.',
        'Should any single subsystem remain in its default state — the barrel misaligned, the shutters sealed, or the generator unsynchronized — the master celestial aperture lever will remain firmly locked in its safety stasis position, preventing dome activation.',
      ],
      targetVocabulary: ['azimuth bearing', 'Polaris', 'sidereal', 'escapement', 'governor', 'stasis'],
      readingLevel: 'advanced',
      audience: 'adults',
      generatedAt: 0,
      isAIGenerated: false,
    },
  },
};

/**
 * Returns the appropriate fallback passage for a challenge based on difficulty.
 * The existing Phase 1 passage serves as the 'intermediate' tier.
 */
export function getFallbackPassage(
  challengeId: string,
  difficulty: ReadingDifficulty,
  _audience: Audience,
  originalPassage: Passage
): GeneratedPassage {
  const entry = fallbacks[challengeId];

  if (!entry) {
    // No fallback authored — wrap original passage
    return {
      title: originalPassage.heading,
      source: originalPassage.source,
      paragraphs: [...originalPassage.paragraphs],
      targetVocabulary: originalPassage.keyClues || [],
      readingLevel: 'intermediate',
      audience: 'adults',
      generatedAt: 0,
      isAIGenerated: false,
    };
  }

  switch (difficulty) {
    case 'beginner':
      return { ...entry.beginner, generatedAt: Date.now() };
    case 'advanced':
      return { ...entry.advanced, generatedAt: Date.now() };
    case 'intermediate':
    default:
      // Use the original Phase 1 passage
      return {
        title: originalPassage.heading,
        source: originalPassage.source,
        paragraphs: [...originalPassage.paragraphs],
        targetVocabulary: originalPassage.keyClues || [],
        readingLevel: 'intermediate',
        audience: 'adults',
        generatedAt: 0,
        isAIGenerated: false,
      };
  }
}
