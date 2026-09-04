import { describe, it, expect, beforeEach } from 'vitest';
import { useLearnerStore } from '../engine/LearnerStore';
import { GameDirector } from '../engine/GameDirector';
import { ScenarioCompiler } from '../engine/ScenarioCompiler';
import type { AIScenarioSpecification } from '../types/scenario';

// ============================================================================
// ADAPTIVE PIPELINE BENCHMARK TEST SUITE
// Verifies the hard acceptance test:
//   Same reading skill + different learner history → materially different games
// Reports ScenarioCompiler metrics: rejection rate, reachability, leakage, latency
// ============================================================================

describe('Adaptive Pipeline Benchmark', () => {
  beforeEach(() => {
    useLearnerStore.getState().resetProfile();
    useLearnerStore.getState().completeOnboarding('teens', 'intermediate');
  });

  // ─── 1. HARD ACCEPTANCE TEST ──────────────────────────────────────────────
  describe('Hard Acceptance: Same Skill, Different History → Different Games', () => {
    it('PROFILE_CAUSAL vs PROFILE_SEQUENCE produce at least 5 material differences', () => {
      // Profile A: Causal weakness
      useLearnerStore.getState().applySyntheticProfile('PROFILE_CAUSAL');
      const profileA = useLearnerStore.getState().profile!;
      const rxA = GameDirector.diagnoseAndPrescribe(profileA, 'act_1_vestibule');

      // Profile B: Sequencing weakness
      useLearnerStore.getState().applySyntheticProfile('PROFILE_SEQUENCE');
      const profileB = useLearnerStore.getState().profile!;
      const rxB = GameDirector.diagnoseAndPrescribe(profileB, 'act_1_vestibule');

      // Count differences across the 7 prescription dimensions
      let differences = 0;
      if (rxA.targetSkill !== rxB.targetSkill) differences++;
      if (rxA.theme !== rxB.theme) differences++;
      if (rxA.experienceArchetype !== rxB.experienceArchetype) differences++;
      if (rxA.primaryActionPattern !== rxB.primaryActionPattern) differences++;
      if (rxA.ambiguityLevel !== rxB.ambiguityLevel) differences++;
      if (rxA.scaffoldingLevel !== rxB.scaffoldingLevel) differences++;
      if (rxA.consequenceIntensity !== rxB.consequenceIntensity) differences++;

      expect(differences).toBeGreaterThanOrEqual(5);
    });

    it('PROFILE_CAUSAL vs PROFILE_NEGATION produce different worlds and action patterns', () => {
      useLearnerStore.getState().applySyntheticProfile('PROFILE_CAUSAL');
      const rxA = GameDirector.diagnoseAndPrescribe(useLearnerStore.getState().profile!, 'act_1_vestibule');

      useLearnerStore.getState().applySyntheticProfile('PROFILE_NEGATION');
      const rxC = GameDirector.diagnoseAndPrescribe(useLearnerStore.getState().profile!, 'act_1_vestibule');

      expect(rxA.targetSkill).not.toBe(rxC.targetSkill);
      expect(rxA.primaryActionPattern).not.toBe(rxC.primaryActionPattern);
      expect(rxA.experienceArchetype).not.toBe(rxC.experienceArchetype);
    });

    it('all 5 profiles produce pairwise-distinct action patterns', () => {
      const profileNames = ['PROFILE_CAUSAL', 'PROFILE_SEQUENCE', 'PROFILE_NEGATION', 'PROFILE_SURFACE_GUESSER', 'PROFILE_STRONG_TRANSFER'] as const;
      const prescriptions = profileNames.map(name => {
        useLearnerStore.getState().applySyntheticProfile(name);
        return GameDirector.diagnoseAndPrescribe(useLearnerStore.getState().profile!, 'act_2_clock');
      });

      // At least 4 distinct action patterns among the 5 profiles
      const uniquePatterns = new Set(prescriptions.map(p => p.primaryActionPattern));
      expect(uniquePatterns.size).toBeGreaterThanOrEqual(4);
    });
  });

  // ─── 2. BEHAVIORAL EVIDENCE OVERRIDE ──────────────────────────────────────
  describe('Behavioral Evidence Drives Routing (Not Just Error Counts)', () => {
    it('PROFILE_SURFACE_GUESSER triggers FORENSIC_RETRIEVAL from behavioral evidence', () => {
      useLearnerStore.getState().applySyntheticProfile('PROFILE_SURFACE_GUESSER');
      const rx = GameDirector.diagnoseAndPrescribe(useLearnerStore.getState().profile!, 'act_1_vestibule');

      expect(rx.targetSkill).toBe('literalRetrieval');
      expect(rx.primaryActionPattern).toBe('FORENSIC_RETRIEVAL');
      expect(rx.experienceArchetype).toBe('SORT');
      // Verify the insight references behavioral evidence, not just generic text
      expect(rx.learnerInsight).toContain('repeated guesses');
    });

    it('causal profile with early commitments routes to EVIDENCE archetype', () => {
      useLearnerStore.getState().applySyntheticProfile('PROFILE_CAUSAL');
      const profile = useLearnerStore.getState().profile!;

      // PROFILE_CAUSAL has earlyCommitments = 2, which should route to EVIDENCE
      const rx = GameDirector.diagnoseAndPrescribe(profile, 'act_2_clock');
      expect(rx.experienceArchetype).toBe('EVIDENCE');
    });
  });

  // ─── 3. NEGATION WORLD ALTERNATION ────────────────────────────────────────
  describe('Negation World Alternation', () => {
    it('alternates worlds for negation weakness based on experience history', () => {
      // PROFILE_NEGATION has worldsExperienced: ['lost_observatory']
      useLearnerStore.getState().applySyntheticProfile('PROFILE_NEGATION');
      const rx = GameDirector.diagnoseAndPrescribe(useLearnerStore.getState().profile!, 'act_1_vestibule');

      // Since last world was lost_observatory, should alternate to arctic_station
      expect(rx.theme).toBe('arctic_station');
    });
  });

  // ─── 4. PRESCRIPTION PRESERVATION ─────────────────────────────────────────
  describe('Prescription Diversity Preservation', () => {
    it('raw AI prescription fields are NOT collapsed into identical hardcoded values', () => {
      // Simulate two different raw prescriptions and verify they produce different validated outputs
      const profile = useLearnerStore.getState().profile!;

      const rxA = GameDirector.validateAndEnforcePrescription(
        {
          targetSkill: 'causeEffect',
          experienceArchetype: 'INVESTIGATION',
          theme: 'arctic_station',
          ambiguityLevel: 'high',
          consequenceIntensity: 'severe',
        },
        profile,
        'test_challenge'
      );

      const rxB = GameDirector.validateAndEnforcePrescription(
        {
          targetSkill: 'sequencing',
          experienceArchetype: 'TIMELINE',
          theme: 'lost_observatory',
          ambiguityLevel: 'low',
          consequenceIntensity: 'gentle',
        },
        profile,
        'test_challenge'
      );

      // Validated prescriptions must preserve the AI's intended differences
      expect(rxA.targetSkill).not.toBe(rxB.targetSkill);
      expect(rxA.theme).not.toBe(rxB.theme);
      expect(rxA.experienceArchetype).not.toBe(rxB.experienceArchetype);
      expect(rxA.primaryActionPattern).not.toBe(rxB.primaryActionPattern);
    });
  });

  // ─── 5. SCENARIO COMPILER BENCHMARK ───────────────────────────────────────
  describe('ScenarioCompiler Benchmark Metrics', () => {
    const validSpec: AIScenarioSpecification = {
      world: 'arctic_station',
      archetype: 'INVESTIGATION',
      targetSkill: 'causeEffect',
      targetMisconception: 'sequence_causation_confusion',
      difficulty: 'intermediate',
      ambiguity: 'high',
      centralMystery: 'What caused the thermal bypass failure?',
      documents: [
        {
          id: 'doc1',
          title: 'Emergency Log',
          type: 'emergency_log',
          source: 'Station Alpha',
          role: 'event_timing',
          paragraphs: ['The thermal bypass valve failed at 04:32 UTC.'],
          keyClues: ['04:32 UTC'],
          factsCovered: ['fact_1', 'fact_2'],
        },
      ],
      requiredFacts: [
        { id: 'fact_1', statement: 'Bypass failed at 04:32', sourceDocumentId: 'doc1', snippet: 'failed at 04:32' },
        { id: 'fact_2', statement: 'Coolant loop was primed', sourceDocumentId: 'doc1', snippet: 'coolant loop' },
      ],
      requiredRelations: [
        { id: 'rel_1', subjectFactId: 'fact_1', relation: 'CAUSED', objectFactId: 'fact_2', description: 'Bypass failure caused coolant overflow' },
      ],
      plausibleFalseHypothesis: 'The compressor caused the failure',
      requiredInference: 'Bypass failure preceded compressor trip',
      supportStrategy: 'Cross-reference timestamps',
      failureConsequences: ['Station freezes'],
      successConsequences: ['Thermal system restored'],
      topologyId: 'TOP-2',
      evidenceSnippet: 'failed at 04:32 UTC',
      evidenceParagraphIndex: 0,
    };

    const validEntities: Record<string, any> = {
      valve_a: { id: 'valve_a', name: 'Thermal Bypass Valve', states: { isOpen: false } },
      pump_b: { id: 'pump_b', name: 'Coolant Pump', states: { isRunning: false } },
    };

    const validRules: any[] = [
      {
        id: 'r1', action: 'ACTIVATE', targetId: 'valve_a',
        conditions: [{ type: 'ENTITY_STATE', target: 'valve_a', property: 'isOpen', expected: false }],
        onSuccess: {
          effects: [{ type: 'SET_ENTITY_STATE', target: 'valve_a', property: 'isOpen', value: true }],
          feedbackMessage: 'Valve opened.',
        },
      },
      {
        id: 'r2', action: 'ACTIVATE', targetId: 'pump_b',
        conditions: [{ type: 'ENTITY_STATE', target: 'valve_a', property: 'isOpen', expected: true }],
        onSuccess: {
          effects: [{ type: 'SET_ENTITY_STATE', target: 'pump_b', property: 'isRunning', value: true }],
          feedbackMessage: 'Pump started.',
        },
      },
    ];

    const validCompletionConditions: any[] = [
      { type: 'ENTITY_STATE', target: 'pump_b', property: 'isRunning', expected: true },
    ];

    it('validates a well-formed scenario with all 14+ checks passing', () => {
      const report = ScenarioCompiler.validateAIScenario(validSpec, validEntities, validRules, validCompletionConditions);
      expect(report.valid).toBe(true);
      expect(report.checks.length).toBeGreaterThanOrEqual(14);
      expect(report.winningPath).toEqual(['ACTIVATE:valve_a', 'ACTIVATE:pump_b']);
    });

    it('rejects scenario with invalid world', () => {
      const badSpec = { ...validSpec, world: 'invalid_world' as any };
      const report = ScenarioCompiler.validateAIScenario(badSpec, validEntities, validRules, validCompletionConditions);
      expect(report.valid).toBe(false);
      expect(report.errors.some(e => e.includes('World compatibility'))).toBe(true);
    });

    it('rejects scenario with invalid archetype', () => {
      const badSpec = { ...validSpec, archetype: 'MADE_UP_ARCHETYPE' as any };
      const report = ScenarioCompiler.validateAIScenario(badSpec, validEntities, validRules, validCompletionConditions);
      expect(report.valid).toBe(false);
      expect(report.errors.some(e => e.includes('Archetype compatibility'))).toBe(true);
    });

    it('rejects scenario with no completion conditions', () => {
      const report = ScenarioCompiler.validateAIScenario(validSpec, validEntities, validRules, []);
      expect(report.valid).toBe(false);
      expect(report.errors.some(e => e.includes('completion conditions') || e.includes('Reachability'))).toBe(true);
    });

    it('detects answer leakage in document text', () => {
      const leakySpec = {
        ...validSpec,
        documents: [{
          ...validSpec.documents[0],
          paragraphs: ['Simply activate the thermal valve to fix everything.'],
        }],
      };
      const report = ScenarioCompiler.validateAIScenario(leakySpec, validEntities, validRules, validCompletionConditions);
      const leakCheck = report.checks.find(c => c.step === 'answer_leakage_checks');
      expect(leakCheck?.passed).toBe(false);
    });

    it('runs batch benchmark and reports metrics', () => {
      const deadlockEntities: Record<string, any> = {
        lock_x: { id: 'lock_x', states: { isLocked: true } },
      };
      const deadlockRules: any[] = [{
        id: 'r_dead', action: 'ACTIVATE', targetId: 'lock_x',
        conditions: [{ type: 'ENTITY_STATE', target: 'lock_x', property: 'impossible', expected: 999 }],
        onSuccess: {
          effects: [{ type: 'SET_ENTITY_STATE', target: 'lock_x', property: 'isLocked', value: false }],
          feedbackMessage: 'Unlocked.',
        },
      }];
      const deadlockConditions: any[] = [
        { type: 'ENTITY_STATE', target: 'lock_x', property: 'isLocked', expected: false },
      ];

      const benchmark = ScenarioCompiler.runCompilerBenchmark([
        { spec: validSpec, entities: validEntities, rules: validRules, completionConditions: validCompletionConditions },
        { spec: validSpec, entities: validEntities, rules: validRules, completionConditions: validCompletionConditions },
        { spec: validSpec, entities: deadlockEntities, rules: deadlockRules, completionConditions: deadlockConditions },
      ]);

      expect(benchmark.totalSamples).toBe(3);
      expect(benchmark.passed).toBe(2);
      expect(benchmark.failed).toBe(1);
      expect(benchmark.rejectionRate).toBeCloseTo(1 / 3, 1);
      expect(benchmark.reachabilityRate).toBeCloseTo(2 / 3, 1);
      expect(benchmark.avgLatencyMs).toBeGreaterThan(0);
      expect(benchmark.perSample).toHaveLength(3);
    });
  });
});
