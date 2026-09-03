import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../engine/GameStore';

describe('Persistent Downstream Campaign Consequences', () => {
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState());
  });

  it('Decision 1 (Act 1 Path): choosing Aqueduct Flume increases Aris trust and alters narrative state', () => {
    const store = useGameStore.getState();

    // Act 1: Unlock and open iron door
    store.executeAction({ type: 'USE_ITEM_ON', sourceId: 'iron_key', targetId: 'iron_lock' });
    store.executeAction({ type: 'PUSH', targetId: 'heavy_door' });

    // Choose the Aqueduct Flume route
    store.executeDecision('act1_path_choice', 'aqueduct_flume');

    const state = useGameStore.getState();
    expect(state.narrative.playerDecisions['act1_path_choice']?.value).toBe('aqueduct_flume');
    expect(state.narrative.characterRelationships['aris']).toBe(65); // 50 baseline + 15 trust

    // Progress to Act 2
    store.advanceToNextChallenge();
    expect(useGameStore.getState().currentChallengeId).toBe('act_2_clock');
    // The decision persists into Act 2
    expect(useGameStore.getState().narrative.playerDecisions['act1_path_choice']?.value).toBe('aqueduct_flume');
  });

  it('Decision 2 (Act 3 Power Allocation): routing power to Laboratory powers hydraulic lift instead of archive', () => {
    const store = useGameStore.getState();

    // Set world state to Act 3
    store.transitionToScene('act_3_junction');

    // Route power to Hydraulic Sector
    store.executeDecision('power_allocation', 'laboratory');

    const state = useGameStore.getState();
    expect(state.narrative.playerDecisions['power_allocation']?.value).toBe('laboratory');
    expect(state.narrative.poweredSystems).toContain('laboratory');
    expect(state.narrative.poweredSystems).not.toContain('archive');

    // Transition to Act 4 (Dialogue)
    store.transitionToScene('act_4_navigation');
    expect(useGameStore.getState().narrative.playerDecisions['power_allocation']?.value).toBe('laboratory');

    // Transition to Act 5 (Safety Shunt)
    store.transitionToScene('act_5_adaptive');
    expect(useGameStore.getState().narrative.playerDecisions['power_allocation']?.value).toBe('laboratory');

    // Transition to Act 7 (Summit Dome)
    store.transitionToScene('act_7_dome');
    expect(useGameStore.getState().narrative.playerDecisions['power_allocation']?.value).toBe('laboratory');
  });

  it('Decision 3 (Act 4 Aris Alliance): partnering with Aris persists into Act 5 and Act 7', () => {
    const store = useGameStore.getState();

    store.transitionToScene('act_4_navigation');

    // Commit collaborative alliance decision
    store.executeDecision('aris_alliance_stance', 'collaborative_ally');

    let state = useGameStore.getState();
    expect(state.narrative.playerDecisions['aris_alliance_stance']?.value).toBe('collaborative_ally');
    expect(state.narrative.characterRelationships['aris']).toBeGreaterThanOrEqual(70);

    // Transition to Act 5: Aris speaking tube guidance remains active
    store.transitionToScene('act_5_adaptive');
    state = useGameStore.getState();
    expect(state.narrative.playerDecisions['aris_alliance_stance']?.value).toBe('collaborative_ally');

    // Transition to Act 7: Remote shutter dogs remain active
    store.transitionToScene('act_7_dome');
    state = useGameStore.getState();
    expect(state.narrative.playerDecisions['aris_alliance_stance']?.value).toBe('collaborative_ally');
  });

  it('All 3 decisions simultaneously persist into Act 7 final rotunda', () => {
    const store = useGameStore.getState();

    store.executeDecision('act1_path_choice', 'aqueduct_flume');
    store.executeDecision('power_allocation', 'archive');
    store.executeDecision('aris_alliance_stance', 'collaborative_ally');

    store.transitionToScene('act_7_dome');
    const finalState = useGameStore.getState();

    expect(finalState.narrative.playerDecisions['act1_path_choice']?.value).toBe('aqueduct_flume');
    expect(finalState.narrative.playerDecisions['power_allocation']?.value).toBe('archive');
    expect(finalState.narrative.playerDecisions['aris_alliance_stance']?.value).toBe('collaborative_ally');
  });
});
