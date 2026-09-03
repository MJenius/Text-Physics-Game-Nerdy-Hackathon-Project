import { describe, it, expect } from 'vitest';
import { useGameStore } from '../engine/GameStore';
import { SoundFX } from '../engine/SoundFX';

describe('Game Archetypes & Procedural Audio Engine', () => {
  it('initializes GameStore with updated narrative fields', () => {
    const state = useGameStore.getState();
    expect(state.narrative.activeWorldId).toBe('lost_observatory');
    expect(state.narrative.hypotheses).toBeDefined();
    expect(state.narrative.hypotheses.length).toBeGreaterThan(0);
    expect(state.narrative.uncertainties).toBeDefined();
    expect(state.narrative.characterRelationships['aris']).toBe(50);
  });

  it('updates character trust dynamically without exceeding [0, 100]', () => {
    const store = useGameStore.getState();
    store.updateTrust('aris', 20);
    expect(useGameStore.getState().narrative.characterRelationships['aris']).toBe(70);

    store.updateTrust('aris', 50);
    expect(useGameStore.getState().narrative.characterRelationships['aris']).toBe(100);

    store.updateTrust('aris', -150);
    expect(useGameStore.getState().narrative.characterRelationships['aris']).toBe(0);
  });

  it('changes active world state cleanly', () => {
    const store = useGameStore.getState();
    store.setWorld('triton_deep_sea');
    expect(useGameStore.getState().narrative.activeWorldId).toBe('triton_deep_sea');

    store.setWorld('lost_observatory');
    expect(useGameStore.getState().narrative.activeWorldId).toBe('lost_observatory');
  });

  it('allows jumping across all 7 acts deterministically', () => {
    const store = useGameStore.getState();

    store.jumpToAct(2);
    expect(useGameStore.getState().currentChallengeId).toBe('act_2_clock');
    expect(useGameStore.getState().activeArchetype).toBe('CALIBRATE');

    store.jumpToAct(3);
    expect(useGameStore.getState().currentChallengeId).toBe('act_3_junction');
    expect(useGameStore.getState().activeArchetype).toBe('ROUTE');

    store.jumpToAct(4);
    expect(useGameStore.getState().currentChallengeId).toBe('act_4_navigation');
    expect(useGameStore.getState().activeArchetype).toBe('DIALOGUE');

    store.jumpToAct(5);
    expect(useGameStore.getState().currentChallengeId).toBe('act_5_adaptive');
    expect(useGameStore.getState().activeArchetype).toBe('REPAIR');

    store.jumpToAct(7);
    expect(useGameStore.getState().currentChallengeId).toBe('act_7_dome');

    // Reset back to Act 1
    store.jumpToAct(1);
    expect(useGameStore.getState().currentChallengeId).toBe('act_1_vestibule');
  });

  it('SoundFX executes silently without error in headless testing environment', () => {
    expect(() => SoundFX.playClick()).not.toThrow();
    expect(() => SoundFX.playLatch()).not.toThrow();
    expect(() => SoundFX.playTumbler()).not.toThrow();
    expect(() => SoundFX.playSteam()).not.toThrow();
    expect(() => SoundFX.playSpark()).not.toThrow();
    expect(() => SoundFX.playGearShudder()).not.toThrow();
    expect(() => SoundFX.playChime()).not.toThrow();
    expect(() => SoundFX.playSoundEffect('latch_click')).not.toThrow();
    expect(() => SoundFX.playSoundEffect('steam_burst')).not.toThrow();
  });
});
