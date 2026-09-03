import { describe, it, expect } from 'vitest';
import { RuleEvaluator } from '../engine/RuleEvaluator';
import type { WorldState, Predicate } from '../types/game';

describe('RuleEvaluator Predicate Engine', () => {
  const mockWorldState: WorldState = {
    currentLocationId: 'courtyard',
    currentChallengeId: 'act_1_vestibule',
    activeArchetype: 'CALIBRATE',
    currentAct: 1,
    entities: {
      iron_lock: {
        id: 'iron_lock',
        name: 'Iron Deadbolt',
        locationId: 'courtyard',
        description: 'Heavy lock',
        states: { isUnlocked: true },
        isInteractable: true,
        isInInventory: false,
        allowedActions: ['USE_ITEM_ON'],
        icon: 'Lock'
      },
      brass_latch: {
        id: 'brass_latch',
        name: 'Brass Latch',
        locationId: 'courtyard',
        description: 'Upper latch',
        states: { isUnlocked: false },
        isInteractable: true,
        isInInventory: false,
        allowedActions: ['ACTIVATE'],
        icon: 'Sliders'
      }
    },
    inventory: ['iron_key'],
    flags: {
      steam_cleared: true,
      overheated: false
    },
    narrative: {
      discoveredFacts: ['Lost Observatory evacuated during alignment.'],
      visitedLocations: ['courtyard'],
      obtainedItems: ['iron_key'],
      poweredSystems: ['archive'],
      triggeredEvents: [],
      characterRelationships: {
        aris: 65,
        sterling: 40
      },
      playerDecisions: {
        power_allocation: {
          value: 'archive',
          rationale: 'Preserved documentation',
          timestamp: 1000,
          act: 3
        }
      },
      knownWorldRules: [],
      narrativeFlags: {},
      currentObjective: {
        id: 'test_obj',
        title: 'Test',
        description: 'Test'
      },
      availableLocations: ['courtyard'],
      hypotheses: [
        {
          id: 'hypo_evac',
          title: 'Evacuation Cause',
          statement: 'Staff evacuated under celestial transit.',
          sourceAct: 1,
          status: 'confirmed',
          confidence: 'high',
          supportingFacts: ['The Lost Observatory was evacuated.']
        }
      ],
      uncertainties: ['Where is the prism?'],
      forensicInspectionHistory: [],
      activeWorldId: 'lost_observatory'
    },
    lastFeedback: { type: 'info', message: '', timestamp: 0 },
    isComplete: false
  };

  it('evaluates STATE_IS correctly', () => {
    const condition1: Predicate = {
      type: 'STATE_IS',
      target: 'iron_lock',
      property: 'isUnlocked',
      expected: true
    };
    expect(RuleEvaluator.checkPredicate(condition1, mockWorldState)).toBe(true);

    const condition2: Predicate = {
      type: 'STATE_IS',
      target: 'brass_latch',
      property: 'isUnlocked',
      expected: true
    };
    expect(RuleEvaluator.checkPredicate(condition2, mockWorldState)).toBe(false);
  });

  it('evaluates FLAG_IS correctly', () => {
    expect(
      RuleEvaluator.checkPredicate(
        { type: 'FLAG_IS', target: 'steam_cleared', expected: true },
        mockWorldState
      )
    ).toBe(true);

    expect(
      RuleEvaluator.checkPredicate(
        { type: 'FLAG_IS', target: 'overheated', expected: true },
        mockWorldState
      )
    ).toBe(false);
  });

  it('evaluates IN_INVENTORY correctly', () => {
    expect(
      RuleEvaluator.checkPredicate(
        { type: 'IN_INVENTORY', target: 'iron_key', expected: true },
        mockWorldState
      )
    ).toBe(true);

    expect(
      RuleEvaluator.checkPredicate(
        { type: 'IN_INVENTORY', target: 'quartz_prism', expected: true },
        mockWorldState
      )
    ).toBe(false);
  });

  it('evaluates RELATIONSHIP_AT_LEAST predicate', () => {
    expect(
      RuleEvaluator.checkPredicate(
        { type: 'RELATIONSHIP_AT_LEAST', target: 'aris', expected: 60 },
        mockWorldState
      )
    ).toBe(true);

    expect(
      RuleEvaluator.checkPredicate(
        { type: 'RELATIONSHIP_AT_LEAST', target: 'aris', expected: 70 },
        mockWorldState
      )
    ).toBe(false);

    expect(
      RuleEvaluator.checkPredicate(
        { type: 'RELATIONSHIP_AT_LEAST', target: 'sterling', expected: 50 },
        mockWorldState
      )
    ).toBe(false);
  });

  it('evaluates DECISION_IN predicate for narrative branching', () => {
    expect(
      RuleEvaluator.checkPredicate(
        { type: 'DECISION_IN', target: 'power_allocation', expected: ['archive', 'both'] },
        mockWorldState
      )
    ).toBe(true);

    expect(
      RuleEvaluator.checkPredicate(
        { type: 'DECISION_IN', target: 'power_allocation', expected: ['laboratory'] },
        mockWorldState
      )
    ).toBe(false);
  });

  it('evaluates HYPOTHESIS_CONFIRMED predicate', () => {
    expect(
      RuleEvaluator.checkPredicate(
        { type: 'HYPOTHESIS_CONFIRMED', target: 'hypo_evac', expected: true },
        mockWorldState
      )
    ).toBe(true);

    expect(
      RuleEvaluator.checkPredicate(
        { type: 'HYPOTHESIS_CONFIRMED', target: 'hypo_sabotage', expected: true },
        mockWorldState
      )
    ).toBe(false);
  });
});
