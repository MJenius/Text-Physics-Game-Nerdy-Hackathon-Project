import type { LearnerProfile, ReadingSkill } from '../types/learner';
import type { DirectorPrescription, ErrorClassification } from '../types/director';
import { TelemetryService } from './Telemetry';

// ============================================================================
// AI GAME DIRECTOR (Phase 3)
// Generates understandable human insights (NOT debug jargon) for the player.
// Analyzes reading behavior, error patterns, and prescribes pedagogical support.
// ============================================================================

export class GameDirector {
  /**
   * Evaluates the learner profile and last action to generate an intelligent prescription.
   * Returns player-friendly explanations designed to make the judge feel:
   * "The world understands how I read."
   */
  static diagnoseAndPrescribe(
    profile: LearnerProfile,
    currentChallengeId: string,
    lastError?: ErrorClassification
  ): DirectorPrescription {
    const skills = profile.skills;
    const errors = profile.errorPatterns || {
      temporalReversals: 0,
      missedPrerequisites: 0,
      ignoredNegations: 0,
      causalInversions: 0,
      superficialGuesses: 0,
    };

    // Determine primary area of needed calibration
    let targetSkill: ReadingSkill = 'causeEffect';
    let targetTopology: DirectorPrescription['targetTopology'] = 'TOP-2';
    let headline = 'World Attuned';
    let insight = 'The observatory systems respond to your reading clarity.';
    let scaffolding: 0 | 1 | 2 = 0;
    let triggerTransfer = false;

    // 1. Immediate error intervention if triggered
    if (lastError === 'temporal_reversal' || errors.temporalReversals >= 2) {
      targetSkill = 'sequencing';
      targetTopology = 'TOP-1';
      scaffolding = 1;
      headline = 'Attention to Sequence';
      insight = 'Look for connecting words like "before" or "first" — mechanical actions require exact order.';
    } else if (lastError === 'causal_inversion' || errors.causalInversions >= 2) {
      targetSkill = 'causeEffect';
      targetTopology = 'TOP-2';
      scaffolding = 1;
      headline = 'Cause & Effect Calibration';
      insight = 'Notice what powers what: downstream valves cannot operate until the primary loop is primed.';
    } else if (lastError === 'ignored_negation' || errors.ignoredNegations >= 2) {
      targetSkill = 'negativeConstraint';
      targetTopology = 'TOP-3';
      scaffolding = 2;
      headline = 'Safety Warning Active';
      insight = 'The journal contains clear exclusion warnings: pay close attention to what must NOT be activated.';
    } else if (lastError === 'superficial_guessing' || errors.superficialGuesses >= 3) {
      targetSkill = 'literalRetrieval';
      targetTopology = 'TOP-5';
      scaffolding = 1;
      headline = 'Pacing Calibration';
      insight = 'Take a moment to inspect the text carefully. The answers are stated directly in the record.';
    } else {
      // 2. Proactive progression based on skill proficiency & evidence
      // Check if learner has demonstrated strong causal reasoning -> Trigger Hero Transfer!
      const causeScore = skills.causeEffect ?? 0.5;
      const causeConf = profile.skillConfidence?.causeEffect ?? 0.3;

      if (causeScore >= 0.65 && causeConf >= 0.5 && currentChallengeId === 'challenge_3') {
        triggerTransfer = true;
        targetSkill = 'causeEffect';
        targetTopology = 'TOP-2';
        scaffolding = 0;
        headline = 'Transfer Opportunity Unlocked';
        insight = 'You have mastered the observatory boiler loop. Let us see if your understanding transfers to a new world.';
      } else {
        // Standard adaptive status
        headline = 'Observatory Aligned';
        insight = 'System calibration normal. Reading telemetry is guiding world state reactivity.';
      }
    }

    const prescription: DirectorPrescription = {
      targetSkill,
      recommendedDifficulty: profile.readingDifficulty,
      scaffoldingLevel: scaffolding,
      errorDiagnosed: lastError,
      statusHeadline: headline,
      learnerInsight: insight,
      triggerTransfer,
      targetTopology,
    };

    TelemetryService.record('DIRECTOR_DIAGNOSIS_EMITTED', currentChallengeId, {
      headline,
      insight,
      errorDiagnosed: lastError,
      triggerTransfer,
    });

    return prescription;
  }
}
