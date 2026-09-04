import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../engine/GameStore';

describe('Alternate Worlds Mini-Experiences', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
  });

  describe('Boreas Sub-Zero Station (Arctic)', () => {
    it('initializes world cleanly into Arctic Act 1 Airlock', () => {
      useGameStore.getState().setWorld('arctic_station');
      const state = useGameStore.getState();

      expect(state.narrative.activeWorldId).toBe('arctic_station');
      expect(state.currentChallengeId).toBe('arctic_act_1_airlock');
      expect(state.currentChallenge.title).toContain('Airlock');
      expect(state.entities['thermal_dog_heater']).toBeDefined();
      expect(state.entities['airlock_dump_valve']).toBeDefined();
      expect(state.entities['lab_pressure_seal']).toBeDefined();
    });

    it('enforces physical airlock sequence: heat dogs -> dump valve -> open seal', () => {
      useGameStore.getState().setWorld('arctic_station');

      // Attempting to open the seal immediately fails (frozen latch / vacuum lock)
      useGameStore.getState().executeAction({
        type: 'PUSH',
        targetId: 'lab_pressure_seal'
      });

      let state = useGameStore.getState();
      expect(state.entities['lab_pressure_seal'].states.isOpen).toBe(false);
      expect(state.lastFeedback?.type).toBe('failure');

      // Step 1: Heat the dogging latches
      useGameStore.getState().executeAction({
        type: 'ACTIVATE',
        targetId: 'thermal_dog_heater'
      });

      state = useGameStore.getState();
      expect(state.entities['thermal_dog_heater'].states.isHeated).toBe(true);

      // Step 2: Equalize pressure via barometric dump valve
      useGameStore.getState().executeAction({
        type: 'TURN',
        targetId: 'airlock_dump_valve'
      });

      state = useGameStore.getState();
      expect(state.entities['airlock_dump_valve'].states.isPurged).toBe(true);

      // Step 3: Now open the pressure seal
      useGameStore.getState().executeAction({
        type: 'PUSH',
        targetId: 'lab_pressure_seal'
      });

      state = useGameStore.getState();
      expect(state.entities['lab_pressure_seal'].states.isOpen).toBe(true);
      expect(state.isComplete).toBe(true);
    });

    it('progresses smoothly through all 4 Arctic acts', () => {
      useGameStore.getState().setWorld('arctic_station');

      // Complete Act 1
      useGameStore.getState().executeAction({ type: 'ACTIVATE', targetId: 'thermal_dog_heater' });
      useGameStore.getState().executeAction({ type: 'TURN', targetId: 'airlock_dump_valve' });
      useGameStore.getState().executeAction({ type: 'PUSH', targetId: 'lab_pressure_seal' });
      expect(useGameStore.getState().isComplete).toBe(true);

      // Advance to Act 2
      useGameStore.getState().advanceToNextChallenge();
      expect(useGameStore.getState().currentChallengeId).toBe('arctic_act_2_thermal');
      expect(useGameStore.getState().currentChallenge.archetype).toBe('RESOURCE');

      // Simulate Act 2 completion and decision
      useGameStore.getState().executeDecision('decision_arctic_prioritize_cores');
      expect(useGameStore.getState().narrative.playerDecisions['arctic_thermal_priority']?.value).toBe('cryostat');

      // Advance to Act 3
      useGameStore.getState().transitionToScene('arctic_act_3_stratigraphy');
      expect(useGameStore.getState().currentChallengeId).toBe('arctic_act_3_stratigraphy');
      expect(useGameStore.getState().currentChallenge.archetype).toBe('SORT');
      expect(useGameStore.getState().currentChallenge.sortConfig?.categories).toHaveLength(4);

      // Advance to Act 4
      useGameStore.getState().transitionToScene('arctic_act_4_radio');
      expect(useGameStore.getState().currentChallengeId).toBe('arctic_act_4_radio');
      expect(useGameStore.getState().currentChallenge.archetype).toBe('SYNTHESIS');
      expect(useGameStore.getState().currentChallenge.synthesisConfig?.parameters).toHaveLength(3);
    });
  });

  describe('Triton-IV Trench Station (Abyssal Deep-Sea)', () => {
    it('initializes world cleanly into Triton Act 1 Vapor Purge', () => {
      useGameStore.getState().setWorld('triton_deep_sea');
      const state = useGameStore.getState();

      expect(state.narrative.activeWorldId).toBe('triton_deep_sea');
      expect(state.currentChallengeId).toBe('triton_act_1_vapor');
      expect(state.currentChallenge.title).toContain('Vapor Lock');
      expect(state.entities['vapor_bypass_valve']).toBeDefined();
      expect(state.entities['recirc_pump_switch']).toBeDefined();
    });

    it('enforces hydraulic vapor lock physics: bypass first, then pump', () => {
      useGameStore.getState().setWorld('triton_deep_sea');

      // Starting pump without bypass causes cavitation shock
      useGameStore.getState().executeAction({
        type: 'ACTIVATE',
        targetId: 'recirc_pump_switch'
      });

      let state = useGameStore.getState();
      expect(state.entities['recirc_pump_switch'].states.isRunning).toBe(false);
      expect(state.lastFeedback?.type).toBe('failure');
      expect(state.lastFeedback?.message).toContain('cavitation');

      // Open bypass valve first
      useGameStore.getState().executeAction({
        type: 'TURN',
        targetId: 'vapor_bypass_valve'
      });

      state = useGameStore.getState();
      expect(state.entities['vapor_bypass_valve'].states.isOpen).toBe(true);

      // Now start pump
      useGameStore.getState().executeAction({
        type: 'ACTIVATE',
        targetId: 'recirc_pump_switch'
      });

      state = useGameStore.getState();
      expect(state.entities['recirc_pump_switch'].states.isRunning).toBe(true);
      expect(state.entities['core_temp_monitor'].states.tempC).toBe(260);
      expect(state.isComplete).toBe(true);
    });

    it('progresses smoothly through all 3 Triton acts', () => {
      useGameStore.getState().setWorld('triton_deep_sea');

      // Complete Act 1
      useGameStore.getState().executeAction({ type: 'TURN', targetId: 'vapor_bypass_valve' });
      useGameStore.getState().executeAction({ type: 'ACTIVATE', targetId: 'recirc_pump_switch' });

      // Execute Act 1 Branching Decision (transitions to Act 2)
      useGameStore.getState().executeDecision('decision_triton_recirculate_jacket');
      expect(useGameStore.getState().narrative.playerDecisions['triton_vent_mode']?.value).toBe('ballast_condense');
      expect(useGameStore.getState().currentChallengeId).toBe('triton_act_2_cavitation');
      expect(useGameStore.getState().currentChallenge.archetype).toBe('EVIDENCE');
      expect(useGameStore.getState().currentChallenge.evidenceConfig?.claims).toHaveLength(1);

      // Advance to Act 3 (Synthesis Reactor SCRAM)
      useGameStore.getState().advanceToNextChallenge();
      expect(useGameStore.getState().currentChallengeId).toBe('triton_act_3_scram');
      expect(useGameStore.getState().currentChallenge.archetype).toBe('SYNTHESIS');
      expect(useGameStore.getState().currentChallenge.synthesisConfig?.parameters).toHaveLength(3);
    });
  });

  describe('Aether-9 Orbital Observatory (Space Coronagraph)', () => {
    it('initializes world cleanly into Orbital Act 1 Coronagraph', () => {
      useGameStore.getState().setWorld('orbital_habitat');
      const state = useGameStore.getState();

      expect(state.narrative.activeWorldId).toBe('orbital_habitat');
      expect(state.currentChallengeId).toBe('orbital_act_1_coronagraph');
      expect(state.currentChallenge.title).toContain('Solar Coronagraph');
      expect(state.entities['polarizer_filter_gimbal']).toBeDefined();
    });

    it('enforces polarization calibration angle of 48 degrees', () => {
      useGameStore.getState().setWorld('orbital_habitat');

      // Attempting to activate at wrong angle fails
      useGameStore.getState().executeAction({
        type: 'ACTIVATE',
        targetId: 'polarizer_filter_gimbal'
      });
      let state = useGameStore.getState();
      expect(state.lastFeedback?.type).toBe('failure');

      // Calibrate to 48 degrees
      useGameStore.setState((draft) => {
        draft.entities['polarizer_filter_gimbal'].states.angleDeg = 48;
      });
      useGameStore.getState().executeAction({
        type: 'ACTIVATE',
        targetId: 'polarizer_filter_gimbal'
      });

      state = useGameStore.getState();
      expect(state.entities['polarizer_filter_gimbal'].states.isCalibrated).toBe(true);
      expect(state.flags['orbital_coronagraph_aligned']).toBe(true);
    });
  });

  describe('Dynamic World Switching & Transfer Mode Exit', () => {
    it('exits transfer mode cleanly when switching worlds', () => {
      // Enter Hero Transfer Mode
      useGameStore.getState().loadHeroTransferScenario();
      expect(useGameStore.getState().isTransferModeActive).toBe(true);

      // Switch to Arctic Station
      useGameStore.getState().setWorld('arctic_station');
      const state = useGameStore.getState();

      expect(state.isTransferModeActive).toBe(false);
      expect(state.narrative.activeWorldId).toBe('arctic_station');
      expect(state.currentChallengeId).toBe('arctic_act_1_airlock');
    });

    it('switches cleanly between all 4 worlds in sequence', () => {
      const worlds: Array<import('../worlds/worldTypes').WorldId> = [
        'lost_observatory',
        'arctic_station',
        'triton_deep_sea',
        'orbital_habitat'
      ];

      for (const worldId of worlds) {
        useGameStore.getState().setWorld(worldId);
        const state = useGameStore.getState();
        expect(state.narrative.activeWorldId).toBe(worldId);
        expect(state.currentChallengeId).toBeDefined();
      }
    });
  });
});
