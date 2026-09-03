import { describe, it, expect } from 'vitest';
import { getWorldDefinition } from '../worlds/worldRegistry';
import type { WorldId } from '../worlds/worldTypes';

describe('World Registry Architecture', () => {
  const worldIds: WorldId[] = [
    'lost_observatory',
    'arctic_station',
    'triton_deep_sea',
    'orbital_habitat'
  ];

  it('contains all 4 distinct alternate worlds', () => {
    worldIds.forEach((id) => {
      const world = getWorldDefinition(id);
      expect(world).toBeDefined();
      expect(world.id).toBe(id);
      expect(world.name.length).toBeGreaterThan(0);
      expect(world.settingDescription.length).toBeGreaterThan(0);
    });
  });

  it('provides specialized document taxonomy per world', () => {
    const observatory = getWorldDefinition('lost_observatory');
    const triton = getWorldDefinition('triton_deep_sea');
    const arctic = getWorldDefinition('arctic_station');
    const orbital = getWorldDefinition('orbital_habitat');

    expect(observatory.documentTaxonomies.length).toBeGreaterThan(0);
    expect(triton.documentTaxonomies.length).toBeGreaterThan(0);
    expect(arctic.documentTaxonomies.length).toBeGreaterThan(0);
    expect(orbital.documentTaxonomies.length).toBeGreaterThan(0);

    expect(observatory.documentTaxonomies.some((d) => d.type === 'field_journal')).toBe(true);
    expect(triton.documentTaxonomies.some((d) => d.type === 'maintenance_manual')).toBe(true);
    expect(arctic.documentTaxonomies.some((d) => d.type === 'scientific_report')).toBe(true);
    expect(orbital.documentTaxonomies.some((d) => d.type === 'scientific_report')).toBe(true);
  });

  it('defines distinct physical failure modes per world', () => {
    const observatory = getWorldDefinition('lost_observatory');
    const triton = getWorldDefinition('triton_deep_sea');
    const arctic = getWorldDefinition('arctic_station');
    const orbital = getWorldDefinition('orbital_habitat');

    expect(observatory.failureModes.some((f) => f.code === 'gear_bind')).toBe(true);
    expect(triton.failureModes.some((f) => f.code === 'vapor_lock_blowout')).toBe(true);
    expect(arctic.failureModes.some((f) => f.code === 'conduit_freeze')).toBe(true);
    expect(orbital.failureModes.some((f) => f.code === 'attitude_drift')).toBe(true);
  });

  it('provides tailored visual theme palettes', () => {
    worldIds.forEach((id) => {
      const world = getWorldDefinition(id);
      expect(world.themePalette.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(world.themePalette.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(world.themePalette.bgDark).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(world.themePalette.borderTone).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
