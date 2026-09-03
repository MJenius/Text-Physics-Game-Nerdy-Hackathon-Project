import { describe, it, expect } from 'vitest';
import {
  CAMPAIGN_SCENES,
  ACT1_RULES,
  ACT2_CLOCK_RULES,
  ACT3_RULES,
  ACT5_RULES,
  ACT7_RULES
} from '../content/storyCampaign';
import { RuleEvaluator } from '../engine/RuleEvaluator';
import type { WorldState } from '../types/game';

describe('7-Act Unified Campaign Progression & Physical Rules', () => {
  it('contains all 7 acts in sequence', () => {
    expect(CAMPAIGN_SCENES['act_1_vestibule']).toBeDefined();
    expect(CAMPAIGN_SCENES['act_2_clock']).toBeDefined();
    expect(CAMPAIGN_SCENES['act_3_junction']).toBeDefined();
    expect(CAMPAIGN_SCENES['act_4_navigation']).toBeDefined();
    expect(CAMPAIGN_SCENES['act_5_adaptive']).toBeDefined();
    expect(CAMPAIGN_SCENES['act_7_dome']).toBeDefined();
  });

  describe('Act I: Sealed Vestibule Locks', () => {
    it('requires both brass latch and iron deadbolt unlocked before oak door pushes open', () => {
      const doorOpenRule = ACT1_RULES.find((r) => r.id === 'act1_rule_door_success');
      expect(doorOpenRule).toBeDefined();

      const baseState: WorldState = {
        currentLocationId: 'courtyard',
        currentChallengeId: 'act_1_vestibule',
        activeArchetype: 'CALIBRATE',
        currentAct: 1,
        entities: {
          brass_latch: { id: 'brass_latch', name: 'Brass Latch', locationId: 'courtyard', description: '', states: { isUnlocked: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Sliders' },
          iron_lock: { id: 'iron_lock', name: 'Iron Bolt', locationId: 'courtyard', description: '', states: { isUnlocked: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Lock' },
          archive_door: { id: 'archive_door', name: 'Oak Door', locationId: 'courtyard', description: '', states: { isOpen: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'DoorClosed' }
        },
        inventory: ['iron_key'],
        flags: {},
        narrative: { discoveredFacts: [], visitedLocations: [], obtainedItems: [], poweredSystems: [], triggeredEvents: [], characterRelationships: {}, playerDecisions: {}, knownWorldRules: [], narrativeFlags: {}, currentObjective: { id: 'o', title: 't', description: 'd' }, availableLocations: [], hypotheses: [], uncertainties: [], forensicInspectionHistory: [], activeWorldId: 'lost_observatory' },
        lastFeedback: { type: 'info', message: '', timestamp: 0 },
        isComplete: false
      };

      // When both locked -> cannot open
      expect(doorOpenRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, baseState))).toBe(false);

      // When brass unlocked only -> still cannot open
      baseState.entities['brass_latch'].states.isUnlocked = true;
      expect(doorOpenRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, baseState))).toBe(false);

      // When both unlocked -> opens!
      baseState.entities['iron_lock'].states.isUnlocked = true;
      expect(doorOpenRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, baseState))).toBe(true);

      const res = RuleEvaluator.evaluate(doorOpenRule!, baseState);
      expect(res.feedback).toContain('massive oak doors swing open');
      expect(res.consequenceVisual).toBe('door_unlock');
    });
  });

  describe('Act II: The Dead Clock Sidereal Calibration', () => {
    it('calibrates escapement to 58 BPM and unlocks the optical safe', () => {
      const calRule = ACT2_CLOCK_RULES.find((r) => r.id === 'act2_rule_calibrate_escapement');
      const clutchRule = ACT2_CLOCK_RULES.find((r) => r.id === 'act2_rule_engage_clutch');

      expect(calRule).toBeDefined();
      expect(clutchRule).toBeDefined();

      const clockState: WorldState = {
        currentLocationId: 'library',
        currentChallengeId: 'act_2_clock',
        activeArchetype: 'CALIBRATE',
        currentAct: 2,
        entities: {
          deadbeat_escapement: { id: 'deadbeat_escapement', name: 'Escapement', locationId: 'library', description: '', states: { isRunning: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Clock' },
          pendulum_clutch: { id: 'pendulum_clutch', name: 'Clutch', locationId: 'library', description: '', states: { isEngaged: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Sliders' },
          curator_safe: { id: 'curator_safe', name: 'Safe', locationId: 'library', description: '', states: { isUnlocked: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Lock' }
        },
        inventory: [],
        flags: {},
        narrative: { discoveredFacts: [], visitedLocations: [], obtainedItems: [], poweredSystems: [], triggeredEvents: [], characterRelationships: {}, playerDecisions: {}, knownWorldRules: [], narrativeFlags: {}, currentObjective: { id: 'o', title: 't', description: 'd' }, availableLocations: [], hypotheses: [], uncertainties: [], forensicInspectionHistory: [], activeWorldId: 'lost_observatory' },
        lastFeedback: { type: 'info', message: '', timestamp: 0 },
        isComplete: false
      };

      // Calibration rule executes
      const calRes = RuleEvaluator.evaluate(calRule!, clockState);
      expect(calRes.feedback).toContain('58 beats per minute');
      expect(calRes.effects.some((e) => e.property === 'isRunning' && e.value === true)).toBe(true);

      // Now clutch rule can pass
      clockState.entities['deadbeat_escapement'].states.isRunning = true;
      expect(clutchRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, clockState))).toBe(true);

      const clutchRes = RuleEvaluator.evaluate(clutchRule!, clockState);
      expect(clutchRes.effects.some((e) => e.type === 'ADD_INVENTORY' && e.target === 'quartz_prism')).toBe(true);
      expect(clutchRes.feedback).toContain('589nm Quartz Prism');
    });
  });

  describe('Act III: Power Junction Negative Constraint (100 kW Ceiling)', () => {
    it('prevents simultaneous Archive (80kW) and Hydraulic (80kW) routing', () => {
      const overloadRule = ACT3_RULES.find((r) => r.id === 'act3_rule_overload_trip');
      expect(overloadRule).toBeDefined();

      const junctionState: WorldState = {
        currentLocationId: 'junction',
        currentChallengeId: 'act_3_junction',
        activeArchetype: 'ROUTE',
        currentAct: 3,
        entities: {
          archive_power_switch: { id: 'archive_power_switch', name: 'Archive Switch', locationId: 'junction', description: '', states: { isClosed: true }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Zap' },
          hydraulic_power_switch: { id: 'hydraulic_power_switch', name: 'Hydraulic Switch', locationId: 'junction', description: '', states: { isClosed: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Zap' }
        },
        inventory: [],
        flags: {},
        narrative: { discoveredFacts: [], visitedLocations: [], obtainedItems: [], poweredSystems: [], triggeredEvents: [], characterRelationships: {}, playerDecisions: {}, knownWorldRules: [], narrativeFlags: {}, currentObjective: { id: 'o', title: 't', description: 'd' }, availableLocations: [], hypotheses: [], uncertainties: [], forensicInspectionHistory: [], activeWorldId: 'lost_observatory' },
        lastFeedback: { type: 'info', message: '', timestamp: 0 },
        isComplete: false
      };

      // With only Archive closed -> No overload
      expect(overloadRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, junctionState))).toBe(false);

      // If both closed (80kW + 80kW = 160kW > 100kW) -> Overload breaker trips!
      junctionState.entities['hydraulic_power_switch'].states.isClosed = true;
      expect(overloadRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, junctionState))).toBe(true);
      expect(overloadRule!.onFailure.feedbackMessage).toContain('OVERLOAD BREAKER TRIPPED');
      expect(overloadRule!.onFailure.consequenceVisual).toBe('circuit_spark');
    });
  });

  describe('Act V: Consequence & Repair Shunt', () => {
    it('allows installing ceramic safety shunt to restore telemetry terminal', () => {
      const shuntRule = ACT5_RULES.find((r) => r.id === 'act5_rule_install_shunt');
      expect(shuntRule).toBeDefined();

      const act5State: WorldState = {
        currentLocationId: 'concourse',
        currentChallengeId: 'act_5_adaptive',
        activeArchetype: 'REPAIR',
        currentAct: 5,
        entities: {
          emergency_telemetry_terminal: { id: 'emergency_telemetry_terminal', name: 'Terminal', locationId: 'concourse', description: '', states: { shuntState: 'BURNED' }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Radio' }
        },
        inventory: ['replacement_shunt'],
        flags: {},
        narrative: { discoveredFacts: [], visitedLocations: [], obtainedItems: [], poweredSystems: [], triggeredEvents: [], characterRelationships: {}, playerDecisions: {}, knownWorldRules: [], narrativeFlags: {}, currentObjective: { id: 'o', title: 't', description: 'd' }, availableLocations: [], hypotheses: [], uncertainties: [], forensicInspectionHistory: [], activeWorldId: 'lost_observatory' },
        lastFeedback: { type: 'info', message: '', timestamp: 0 },
        isComplete: false
      };

      expect(shuntRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, act5State))).toBe(true);
      const res = RuleEvaluator.evaluate(shuntRule!, act5State);
      expect(res.feedback).toContain('ceramic safety shunt');
      expect(res.effects.some((e) => e.property === 'shuntState' && e.value === 'RESTORED')).toBe(true);
    });
  });

  describe('Act VII: Master Celestial Dome Synthesis', () => {
    it('requires True North azimuth, released dogs, star sync, and quartz prism to open copper dome', () => {
      const masterLeverRule = ACT7_RULES.find((r) => r.id === 'act7_rule_master_success');
      expect(masterLeverRule).toBeDefined();

      const domeState: WorldState = {
        currentLocationId: 'dome',
        currentChallengeId: 'act_7_dome',
        activeArchetype: 'CALIBRATE',
        currentAct: 7,
        entities: {
          azimuth_dial: { id: 'azimuth_dial', name: 'Azimuth', locationId: 'dome', description: '', states: { heading: 'North' }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Compass' },
          shutter_lock_wheel: { id: 'shutter_lock_wheel', name: 'Shutter Dogs', locationId: 'dome', description: '', states: { isUnlocked: true }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'CircleDot' },
          star_clock_sync_switch: { id: 'star_clock_sync_switch', name: 'Star Clock', locationId: 'dome', description: '', states: { isSynchronized: true }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Clock' },
          quartz_receptacle: { id: 'quartz_receptacle', name: 'Quartz Cradle', locationId: 'dome', description: '', states: { hasPrism: true }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Sparkles' },
          master_aperture_lever: { id: 'master_aperture_lever', name: 'Master Haul', locationId: 'dome', description: '', states: { isDomeOpen: false }, isInteractable: true, isInInventory: false, allowedActions: [], icon: 'Sliders' }
        },
        inventory: [],
        flags: {},
        narrative: { discoveredFacts: [], visitedLocations: [], obtainedItems: [], poweredSystems: [], triggeredEvents: [], characterRelationships: {}, playerDecisions: {}, knownWorldRules: [], narrativeFlags: {}, currentObjective: { id: 'o', title: 't', description: 'd' }, availableLocations: [], hypotheses: [], uncertainties: [], forensicInspectionHistory: [], activeWorldId: 'lost_observatory' },
        lastFeedback: { type: 'info', message: '', timestamp: 0 },
        isComplete: false
      };

      // Fully aligned -> Success!
      expect(masterLeverRule!.conditions.every((c) => RuleEvaluator.checkPredicate(c, domeState))).toBe(true);
      const res = RuleEvaluator.evaluate(masterLeverRule!, domeState);
      expect(res.feedback).toContain('copper dome petals glide open');
      expect(res.effects.some((e) => e.property === 'isDomeOpen' && e.value === true)).toBe(true);
    });
  });
});
