import type { LearnerProfile, ReadingSkill } from '../types/learner';
import type { DirectorPrescription, ErrorClassification } from '../types/director';
import { TelemetryService } from './Telemetry';

// ============================================================================
// AI GAME DIRECTOR (Phase 3)
// Determines the learner's cognitive mental model and PRESCRIBES AN EXPERIENCE.
// Influences gameplay archetype, ambiguity, and scene selection without
// usurping authoritative deterministic runtime game state.
// ============================================================================

export class GameDirector {
  /**
   * Evaluates the learner profile and last action to generate an intelligent prescription.
   * Directly chooses the GAMEPLAY ARCHETYPE and EXPERIENCE rather than merely tweaking text.
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

    let targetSkill: ReadingSkill = 'causeEffect';
    let targetTopology: DirectorPrescription['targetTopology'] = 'TOP-2';
    let experienceArchetype: DirectorPrescription['experienceArchetype'] = 'MECHANISM';
    let ambiguityLevel: DirectorPrescription['ambiguityLevel'] = 'moderate';
    let consequenceIntensity: DirectorPrescription['consequenceIntensity'] = 'moderate';
    let theme: DirectorPrescription['theme'] = 'observatory_victorian';
    let headline = 'World Attuned';
    let insight = 'The observatory systems respond according to your reading deductions.';
    let scaffolding: 0 | 1 | 2 = 0;
    let triggerTransfer = false;
    let prescribedSceneId: string | undefined = undefined;

    // 1. Error Intervention & Experience Selection
    if (lastError === 'causal_inversion' || errors.causalInversions >= 1) {
      targetSkill = 'causeEffect';
      targetTopology = 'TOP-2';
      experienceArchetype = 'INVESTIGATION';
      prescribedSceneId = 'act_5_adaptive';
      scaffolding = 1;
      consequenceIntensity = 'moderate';
      headline = 'Director Calibration: Causal Investigation';
      insight = 'Detected difficulty with causal order. Switching experience to Multi-Document Incident Investigation.';
    } else if (lastError === 'temporal_reversal' || errors.temporalReversals >= 1) {
      targetSkill = 'sequencing';
      targetTopology = 'TOP-1';
      experienceArchetype = 'MECHANISM';
      prescribedSceneId = 'act_5_adaptive';
      scaffolding = 1;
      consequenceIntensity = 'gentle';
      headline = 'Director Calibration: Sequence Interlock';
      insight = 'Observed sequence reversal. Prescribing strict chronological interlock with tactile commit.';
    } else if (lastError === 'ignored_negation' || errors.ignoredNegations >= 1) {
      targetSkill = 'negativeConstraint';
      targetTopology = 'TOP-3';
      experienceArchetype = 'RESOURCE_DECISION';
      scaffolding = 2;
      consequenceIntensity = 'severe';
      headline = 'Director Calibration: Exclusion Constraints';
      insight = 'Safety warnings ignored. Routing into high-stakes mutual exclusion allocation.';
    } else if (lastError === 'superficial_guessing' || errors.superficialGuesses >= 2) {
      targetSkill = 'literalRetrieval';
      targetTopology = 'TOP-5';
      experienceArchetype = 'INVESTIGATION';
      scaffolding = 1;
      ambiguityLevel = 'low';
      headline = 'Director Calibration: Evidence Retrieval';
      insight = 'High click frequency detected without reading dwell. Presenting structured document cross-examination.';
    } else {
      // Proactive progression: Check if learner has demonstrated causal reasoning -> Offer Hero Transfer!
      const causeScore = skills.causeEffect ?? 0.5;
      const causeConf = profile.skillConfidence?.causeEffect ?? 0.3;

      if (causeScore >= 0.6 || causeConf >= 0.45) {
        triggerTransfer = true;
        targetSkill = 'causeEffect';
        targetTopology = 'TOP-2';
        experienceArchetype = 'INVESTIGATION';
        theme = 'triton_deep_sea';
        headline = 'Transfer Opportunity Ready: Triton-IV';
        insight = 'You have deduced causal loops in the Victorian Observatory. Prepare to transfer this skill to deep-sea reactor crisis triage.';
      } else {
        headline = 'Observatory Aligned';
        insight = 'Reading telemetry is actively tailoring world state reactivity and narrative paths.';
      }
    }

    const prescription: DirectorPrescription = {
      targetSkill,
      recommendedDifficulty: profile.readingDifficulty,
      scaffoldingLevel: scaffolding,
      errorDiagnosed: lastError,
      experienceArchetype,
      ambiguityLevel,
      consequenceIntensity,
      theme,
      prescribedSceneId,
      statusHeadline: headline,
      learnerInsight: insight,
      triggerTransfer,
      targetTopology,
    };

    TelemetryService.record('DIRECTOR_DIAGNOSIS_EMITTED', currentChallengeId, {
      headline,
      insight,
      experienceArchetype,
      errorDiagnosed: lastError,
      triggerTransfer,
    });

    return prescription;
  }
}
