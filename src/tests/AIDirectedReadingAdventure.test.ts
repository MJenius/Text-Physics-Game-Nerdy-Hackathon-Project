import { describe, it, expect, beforeEach } from 'vitest';
import { useLearnerStore } from '../engine/LearnerStore';
import { GameDirector } from '../engine/GameDirector';
import { ScenarioCompiler } from '../engine/ScenarioCompiler';
import type { AIScenarioSpecification } from '../types/scenario';

describe('AI-Directed Reading Adventure Engine', () => {
  beforeEach(() => {
    useLearnerStore.getState().resetProfile();
    useLearnerStore.getState().completeOnboarding('teens', 'intermediate');
  });

  describe('1. Learner Model & Lucky Answer Discrimination', () => {
    it('initializes with 8 skills and 10 misconceptions with probabilistic evidence tracking', () => {
      const profile = useLearnerStore.getState().profile!;
      expect(profile).toBeDefined();
      expect(Object.keys(profile.skills)).toHaveLength(8);
      expect(profile.skills.transfer).toBe(0.5);
      expect(Object.keys(profile.misconceptions)).toHaveLength(10);
      expect(profile.misconceptions.sequence_causation_confusion.probability).toBe(0.1);
    });

    it('accumulates misconception evidence probabilistically without snap 0->1 flips', () => {
      useLearnerStore.getState().recordMisconceptionEvidence('sequence_causation_confusion', 0.2);
      let profile = useLearnerStore.getState().profile!;
      expect(profile.misconceptions.sequence_causation_confusion.probability).toBeCloseTo(0.3);
      expect(profile.misconceptions.sequence_causation_confusion.evidenceCount).toBe(1);

      useLearnerStore.getState().recordMisconceptionEvidence('sequence_causation_confusion', 0.2);
      profile = useLearnerStore.getState().profile!;
      expect(profile.misconceptions.sequence_causation_confusion.probability).toBeCloseTo(0.5);
      expect(profile.misconceptions.sequence_causation_confusion.evidenceCount).toBe(2);
    });

    it('distinguishes lucky answers from verified evidence attribution', () => {
      // Lucky answer: correct answer with weak evidence
      const initialConf = useLearnerStore.getState().profile!.skillConfidence.causeEffect;
      useLearnerStore.getState().recordLuckyAnswerOutcome('correct_answer_weak_evidence', 'causeEffect');
      let profile = useLearnerStore.getState().profile!;
      expect(profile.skillConfidence.causeEffect).toBeLessThan(initialConf);

      // Verified evidence attribution
      useLearnerStore.getState().recordEvidenceAttribution('causeEffect', true);
      profile = useLearnerStore.getState().profile!;
      expect(profile.skillConfidence.causeEffect).toBeGreaterThan(0.35);
      expect(profile.behavioralLog.luckyAnswerCounts.correct_answer_weak_evidence).toBe(1);
    });
  });

  describe('2. Hard Adaptive Acceptance Test: Truly Different Games', () => {
    it('produces completely different worlds, archetypes, and action patterns for Learner A vs Learner B', () => {
      // Learner A: Causal weakness
      useLearnerStore.getState().applySyntheticProfile('PROFILE_CAUSAL');
      const profileA = useLearnerStore.getState().profile!;
      const prescriptionA = GameDirector.diagnoseAndPrescribe(profileA, 'act_1_vestibule');

      expect(prescriptionA.targetSkill).toBe('causeEffect');
      expect(prescriptionA.theme).toBe('arctic_station');
      expect(prescriptionA.experienceArchetype).toBe('EVIDENCE');
      expect(prescriptionA.primaryActionPattern).toBe('EVALUATE_AND_INSPECT');
      expect(prescriptionA.ambiguityLevel).toBe('high');

      // Learner B: Sequencing weakness
      useLearnerStore.getState().applySyntheticProfile('PROFILE_SEQUENCE');
      const profileB = useLearnerStore.getState().profile!;
      const prescriptionB = GameDirector.diagnoseAndPrescribe(profileB, 'act_1_vestibule');

      expect(prescriptionB.targetSkill).toBe('sequencing');
      expect(prescriptionB.theme).toBe('lost_observatory');
      expect(prescriptionB.experienceArchetype).toBe('TIMELINE');
      expect(prescriptionB.primaryActionPattern).toBe('ARRANGE_AND_OPERATE');
      expect(prescriptionB.ambiguityLevel).toBe('low');

      // Learner C: Negation weakness
      useLearnerStore.getState().applySyntheticProfile('PROFILE_NEGATION');
      const profileC = useLearnerStore.getState().profile!;
      const prescriptionC = GameDirector.diagnoseAndPrescribe(profileC, 'act_1_vestibule');

      expect(prescriptionC.targetSkill).toBe('negativeConstraint');
      expect(prescriptionC.experienceArchetype).toBe('RESOURCE');
      expect(prescriptionC.primaryActionPattern).toBe('ALLOCATE_UNDER_EXCLUSION');

      // Verification: Action patterns must NOT be the same
      expect(prescriptionA.primaryActionPattern).not.toBe(prescriptionB.primaryActionPattern);
      expect(prescriptionA.primaryActionPattern).not.toBe(prescriptionC.primaryActionPattern);
      expect(prescriptionB.primaryActionPattern).not.toBe(prescriptionC.primaryActionPattern);
    });

    it('triggers Triton hero transfer when cross-domain mastery is demonstrated', () => {
      useLearnerStore.getState().applySyntheticProfile('PROFILE_STRONG_TRANSFER');
      const profile = useLearnerStore.getState().profile!;
      const prescription = GameDirector.diagnoseAndPrescribe(profile, 'act_2_clock');

      expect(prescription.triggerTransfer).toBe(true);
      expect(prescription.theme).toBe('triton_deep_sea');
    });
  });

  describe('3. ScenarioCompiler: Reachability DAG & Answer Leakage Guardrails', () => {
    it('validates reachable topologies and identifies valid winning action paths', () => {
      const mockEntities: Record<string, any> = {
        valve_a: { id: 'valve_a', states: { isOpen: false } },
        pump_b: { id: 'pump_b', states: { isRunning: false } },
      };
      const mockRules: any[] = [
        {
          id: 'r1',
          action: 'ACTIVATE',
          targetId: 'valve_a',
          conditions: [{ type: 'ENTITY_STATE', target: 'valve_a', property: 'isOpen', expected: false }],
          onSuccess: {
            effects: [{ type: 'SET_ENTITY_STATE', target: 'valve_a', property: 'isOpen', value: true }],
            feedbackMessage: 'Valve opened.',
          },
        },
        {
          id: 'r2',
          action: 'ACTIVATE',
          targetId: 'pump_b',
          conditions: [{ type: 'ENTITY_STATE', target: 'valve_a', property: 'isOpen', expected: true }],
          onSuccess: {
            effects: [{ type: 'SET_ENTITY_STATE', target: 'pump_b', property: 'isRunning', value: true }],
            feedbackMessage: 'Pump running.',
          },
        },
      ];
      const mockConditions: any[] = [
        { type: 'ENTITY_STATE', target: 'pump_b', property: 'isRunning', expected: true },
      ];

      const reachability = ScenarioCompiler.searchReachabilityPath(mockEntities, mockRules, mockConditions);
      expect(reachability.reachable).toBe(true);
      expect(reachability.path).toEqual(['ACTIVATE:valve_a', 'ACTIVATE:pump_b']);
    });

    it('rejects unreachable dead-end scenarios where preconditions can never be satisfied', () => {
      const mockEntities: Record<string, any> = {
        valve_a: { id: 'valve_a', states: { isOpen: false } },
      };
      const mockRules: any[] = [
        {
          id: 'r1',
          action: 'ACTIVATE',
          targetId: 'valve_a',
          conditions: [{ type: 'ENTITY_STATE', target: 'valve_a', property: 'impossibleState', expected: 999 }],
          onSuccess: {
            effects: [{ type: 'SET_ENTITY_STATE', target: 'valve_a', property: 'isOpen', value: true }],
            feedbackMessage: 'Never reached.',
          },
        },
      ];
      const mockConditions: any[] = [
        { type: 'ENTITY_STATE', target: 'valve_a', property: 'isOpen', expected: true },
      ];

      const reachability = ScenarioCompiler.searchReachabilityPath(mockEntities, mockRules, mockConditions);
      expect(reachability.reachable).toBe(false);
    });

    it('detects and rejects answer leakage in AI-generated instructional text', () => {
      const leakySpec: AIScenarioSpecification = {
        world: 'arctic_station',
        archetype: 'INVESTIGATION',
        targetSkill: 'causeEffect',
        targetMisconception: 'sequence_causation_confusion',
        difficulty: 'intermediate',
        ambiguity: 'high',
        centralMystery: 'Investigate the freeze-up. Therefore choose the thermal bypass valve to win.',
        documents: [],
        requiredFacts: [],
        requiredRelations: [],
        plausibleFalseHypothesis: 'Frostbite',
        requiredInference: 'Vapor lock',
        supportStrategy: 'Notice timestamps',
        failureConsequences: [],
        successConsequences: [],
        topologyId: 'TOP-2',
      };

      const leakage = ScenarioCompiler.detectAnswerLeakage(leakySpec, []);
      expect(leakage.hasLeakage).toBe(true);
      expect(leakage.reasons[0]).toContain('therefore choose');
    });
  });
});
