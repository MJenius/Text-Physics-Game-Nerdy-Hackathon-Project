import type { LearnerProfile, ReadingSkill } from '../types/learner';
import type { DirectorPrescription, ErrorClassification, PrimaryPlayerActionPattern } from '../types/director';
import { VALIDATED_EXPERIENCE_DOMAINS } from '../types/director';
import { TelemetryService } from './Telemetry';
import { requestAIDiagnosis } from './AIContentService';

// ============================================================================
// AI GAME DIRECTOR (Hybrid AI-Assisted Architecture)
//
// Deterministic learner state
//         ↓
// AI diagnosis (Gemini structured JSON)
//         ↓
// Structured experience prescription
//         ↓
// Deterministic validation & repetition prevention
//         ↓
// Scenario compiler / Playable scenario
//         ↓
// Deterministic runtime
//
// AI recommends. The engine decides.
// ============================================================================

export class GameDirector {
  /**
   * Deterministic experience selector and validator.
   * Ensures that prescriptions strictly conform to registered worlds, archetypes, and action patterns.
   */
  static validateAndEnforcePrescription(
    rawPrescription: Partial<DirectorPrescription>,
    profile: LearnerProfile,
    currentChallengeId: string
  ): DirectorPrescription {
    let world = rawPrescription.theme || 'lost_observatory';
    let archetype = rawPrescription.experienceArchetype || 'MECHANISM';
    let actionPattern: PrimaryPlayerActionPattern = rawPrescription.primaryActionPattern || 'ARRANGE_AND_OPERATE';
    let targetSkill: ReadingSkill = rawPrescription.targetSkill || 'causeEffect';
    let ambiguity = rawPrescription.ambiguityLevel || 'moderate';
    let scaffolding = (rawPrescription.scaffoldingLevel ?? 1) as 0 | 1 | 2 | 3;
    let consequenceIntensity = rawPrescription.consequenceIntensity || 'moderate';
    let targetTopology = rawPrescription.targetTopology || 'TOP-2';
    let documentTypes = rawPrescription.documentTypes || ['emergency_log', 'scientific_report'];
    let triggerTransfer = Boolean(rawPrescription.triggerTransfer);

    // 1. Enforce Validated Experience Domains (AI cannot freely invent worlds or archetypes)
    if (!VALIDATED_EXPERIENCE_DOMAINS.worlds.includes(world as any)) {
      world = 'arctic_station';
    }
    if (!VALIDATED_EXPERIENCE_DOMAINS.archetypes.includes(archetype as any)) {
      archetype = 'INVESTIGATION';
    }

    // 2. Action Pattern Binding (Requirement: Action pattern must genuinely differ)
    if (targetSkill === 'causeEffect' || archetype === 'INVESTIGATION' || archetype === 'EVIDENCE') {
      actionPattern = 'EVALUATE_AND_INSPECT';
    } else if (targetSkill === 'sequencing' || archetype === 'TIMELINE' || archetype === 'MECHANISM') {
      actionPattern = 'ARRANGE_AND_OPERATE';
    } else if (targetSkill === 'negativeConstraint' || archetype === 'RESOURCE' || archetype === 'ROUTE') {
      actionPattern = 'ALLOCATE_UNDER_EXCLUSION';
    } else if (targetSkill === 'synthesis' || archetype === 'SYNTHESIS' || archetype === 'CALIBRATE') {
      actionPattern = 'DEDUCE_STATE_AND_COMMIT';
    } else {
      actionPattern = 'FORENSIC_RETRIEVAL';
    }

    // 3. Experience Memory & Repetition Prevention
    const recentArchetypes = profile.experienceMemory?.archetypesExperienced || [];
    if (recentArchetypes.length >= 2) {
      const lastTwo = recentArchetypes.slice(-2);
      if (lastTwo[0] === archetype && lastTwo[1] === archetype) {
        // Diversify archetype
        if (targetSkill === 'causeEffect') {
          archetype = archetype === 'INVESTIGATION' ? 'EVIDENCE' : 'INVESTIGATION';
        } else if (targetSkill === 'sequencing') {
          archetype = archetype === 'TIMELINE' ? 'MECHANISM' : 'TIMELINE';
        }
      }
    }

    const prescription: DirectorPrescription = {
      targetSkill,
      recommendedDifficulty: rawPrescription.recommendedDifficulty || profile.readingDifficulty,
      scaffoldingLevel: scaffolding,
      errorDiagnosed: rawPrescription.errorDiagnosed,
      experienceArchetype: archetype,
      primaryActionPattern: actionPattern,
      ambiguityLevel: ambiguity,
      consequenceIntensity,
      theme: world,
      prescribedSceneId: rawPrescription.prescribedSceneId,
      statusHeadline: rawPrescription.statusHeadline || 'Director Calibrated',
      learnerInsight: rawPrescription.learnerInsight || 'The world adapts to your reading deductions.',
      triggerTransfer,
      targetTopology,
      documentTypes,
      supportStrategy: rawPrescription.supportStrategy,
      reason: rawPrescription.reason,
    };

    TelemetryService.record('AI_PRESCRIPTION_CREATED', currentChallengeId, {
      targetSkill,
      world,
      archetype,
      actionPattern,
      scaffolding,
    });

    return prescription;
  }

  /**
   * Deterministic fallback prescription when AI is unavailable or offline.
   */
  static getDeterministicFallback(
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
    const misconceptions = (profile.misconceptions || {}) as Partial<Record<import('../types/learner').MisconceptionId, import('../types/learner').MisconceptionDetail>>;

    let targetSkill: ReadingSkill = 'causeEffect';
    let targetTopology: DirectorPrescription['targetTopology'] = 'TOP-2';
    let experienceArchetype: DirectorPrescription['experienceArchetype'] = 'INVESTIGATION';
    let primaryActionPattern: PrimaryPlayerActionPattern = 'EVALUATE_AND_INSPECT';
    let ambiguityLevel: DirectorPrescription['ambiguityLevel'] = 'high';
    let consequenceIntensity: DirectorPrescription['consequenceIntensity'] = 'moderate';
    let theme: DirectorPrescription['theme'] = 'arctic_station';
    let headline = 'Director: Causal Forensic Investigation';
    let insight = 'Detected difficulty with causal order. Switching experience to Multi-Document Incident Investigation at Boreas Sub-Zero Station.';
    let scaffolding: 0 | 1 | 2 | 3 = 1;
    let triggerTransfer = false;
    let prescribedSceneId: string | undefined = undefined;
    let documentTypes = ['emergency_log', 'witness_transcript', 'scientific_report'];

    // 1. Check Misconception Probabilities and Error Patterns
    const causalProb = misconceptions.sequence_causation_confusion?.probability ?? 0;
    const inversionProb = misconceptions.causal_inversion?.probability ?? 0;
    const temporalProb = misconceptions.temporal_reversal?.probability ?? 0;
    const negationProb = misconceptions.ignored_negation?.probability ?? 0;

    if (lastError === 'causal_inversion' || lastError === 'sequence_causation_confusion' || causalProb >= 0.5 || inversionProb >= 0.5 || errors.causalInversions >= 1) {
      targetSkill = 'causeEffect';
      targetTopology = 'TOP-2';
      experienceArchetype = 'INVESTIGATION';
      primaryActionPattern = 'EVALUATE_AND_INSPECT';
      theme = 'arctic_station';
      prescribedSceneId = 'arctic_act_2_thermal';
      ambiguityLevel = 'high';
      scaffolding = 1;
      consequenceIntensity = 'moderate';
      documentTypes = ['emergency_log', 'witness_transcript', 'scientific_report'];
      headline = 'Director Calibration: Causal Investigation [Arctic Boreas]';
      insight = 'Learner repeatedly treats temporal precedence as causal evidence. Prescribing multi-document investigation to isolate mechanisms from timing.';
    } else if (lastError === 'temporal_reversal' || temporalProb >= 0.5 || errors.temporalReversals >= 1) {
      targetSkill = 'sequencing';
      targetTopology = 'TOP-1';
      experienceArchetype = 'TIMELINE';
      primaryActionPattern = 'ARRANGE_AND_OPERATE';
      theme = 'lost_observatory';
      prescribedSceneId = 'act_1_vestibule';
      ambiguityLevel = 'low';
      scaffolding = 2;
      consequenceIntensity = 'gentle';
      documentTypes = ['field_journal', 'maintenance_manual'];
      headline = 'Director Calibration: Sequence Interlock [Lost Observatory]';
      insight = 'Observed sequence reversal. Prescribing strict chronological interlock with tactile commit.';
    } else if (lastError === 'ignored_negation' || negationProb >= 0.5 || errors.ignoredNegations >= 1) {
      targetSkill = 'negativeConstraint';
      targetTopology = 'TOP-3';
      experienceArchetype = 'RESOURCE';
      primaryActionPattern = 'ALLOCATE_UNDER_EXCLUSION';
      theme = 'lost_observatory';
      prescribedSceneId = 'act_3_junction';
      ambiguityLevel = 'moderate';
      scaffolding = 2;
      consequenceIntensity = 'severe';
      documentTypes = ['maintenance_manual', 'incident_report'];
      headline = 'Director Calibration: Exclusion Constraints [Power Junction]';
      insight = 'Safety warnings overlooked. Routing into high-stakes mutual exclusion allocation.';
    } else if (lastError === 'superficial_guessing' || errors.superficialGuesses >= 2) {
      targetSkill = 'literalRetrieval';
      targetTopology = 'TOP-5';
      experienceArchetype = 'SORT';
      primaryActionPattern = 'FORENSIC_RETRIEVAL';
      theme = 'arctic_station';
      prescribedSceneId = 'arctic_act_3_stratigraphy';
      scaffolding = 1;
      ambiguityLevel = 'low';
      headline = 'Director Calibration: Evidence Retrieval [Core Vault]';
      insight = 'High click frequency without reading dwell. Presenting structured document cross-examination.';
    } else {
      // Transfer check
      const causeScore = skills.causeEffect ?? 0.5;
      const causeConf = profile.skillConfidence?.causeEffect ?? 0.3;

      if (causeScore >= 0.65 || causeConf >= 0.45) {
        triggerTransfer = true;
        targetSkill = 'causeEffect';
        targetTopology = 'TOP-2';
        experienceArchetype = 'INVESTIGATION';
        primaryActionPattern = 'EVALUATE_AND_INSPECT';
        theme = 'triton_deep_sea';
        headline = 'Transfer Opportunity Ready: Triton-IV';
        insight = 'You have deduced causal loops in prior domains. Prepare to transfer this skill to deep-sea reactor crisis triage.';
      } else {
        headline = 'World Attuned';
        insight = 'Reading telemetry is actively tailoring world state reactivity and narrative paths.';
      }
    }

    return this.validateAndEnforcePrescription(
      {
        targetSkill,
        recommendedDifficulty: profile.readingDifficulty,
        scaffoldingLevel: scaffolding,
        errorDiagnosed: lastError,
        experienceArchetype,
        primaryActionPattern,
        ambiguityLevel,
        consequenceIntensity,
        theme,
        prescribedSceneId,
        statusHeadline: headline,
        learnerInsight: insight,
        triggerTransfer,
        targetTopology,
        documentTypes,
      },
      profile,
      currentChallengeId
    );
  }

  /**
   * Main Director entrypoint: Evaluates learner profile, attempts AI diagnosis,
   * falls back deterministically on latency/failure, and validates prescription.
   */
  static async diagnoseAndPrescribeAI(
    profile: LearnerProfile,
    currentChallengeId: string,
    currentWorldId: string,
    lastError?: ErrorClassification
  ): Promise<DirectorPrescription> {
    const fallback = this.getDeterministicFallback(profile, currentChallengeId, lastError);

    if (profile.aiEnabled === false) {
      return fallback;
    }

    try {
      const aiResult = await requestAIDiagnosis(profile, currentWorldId);
      if (aiResult) {
        return this.validateAndEnforcePrescription(
          {
            targetSkill: aiResult.targetSkill,
            recommendedDifficulty: aiResult.recommendedDifficulty,
            scaffoldingLevel: aiResult.supportLevel,
            errorDiagnosed: lastError || (aiResult.targetMisconception as ErrorClassification),
            experienceArchetype: aiResult.recommendedIntervention,
            primaryActionPattern: aiResult.primaryActionPattern,
            ambiguityLevel: aiResult.ambiguity,
            consequenceIntensity: aiResult.ambiguity === 'high' ? 'severe' : 'moderate',
            theme: aiResult.recommendedWorld,
            statusHeadline: `AI Director: ${aiResult.recommendedIntervention} [${aiResult.recommendedWorld.replace(/_/g, ' ').toUpperCase()}]`,
            learnerInsight: aiResult.diagnosis,
            triggerTransfer: aiResult.targetSkill === 'transfer',
            targetTopology: aiResult.targetSkill === 'sequencing' ? 'TOP-1' : 'TOP-2',
            documentTypes: aiResult.documentTypes,
            supportStrategy: aiResult.reason,
          },
          profile,
          currentChallengeId
        );
      }
    } catch (err) {
      console.warn('[GameDirector] AI diagnosis call threw, using fallback:', err);
    }

    return fallback;
  }

  /**
   * Synchronous diagnosis method for backward-compatibility and instantaneous evaluation.
   */
  static diagnoseAndPrescribe(
    profile: LearnerProfile,
    currentChallengeId: string,
    lastError?: ErrorClassification
  ): DirectorPrescription {
    return this.getDeterministicFallback(profile, currentChallengeId, lastError);
  }
}

