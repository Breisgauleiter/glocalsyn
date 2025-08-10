import { describe, it, expect } from 'vitest';
import { COMMUNITY_ROLES, ROLE_DEFINITIONS } from './governance';

describe('governance roles', () => {
  it('contains 12 unique roles', () => {
    expect(COMMUNITY_ROLES.length).toBe(12);
    const unique = new Set(COMMUNITY_ROLES);
    expect(unique.size).toBe(12);
  });

  it('has definitions matching the role keys', () => {
    const keys = new Set(COMMUNITY_ROLES);
    for (const def of ROLE_DEFINITIONS) {
      expect(keys.has(def.key)).toBe(true);
      expect(def.minSCL).toBeGreaterThanOrEqual(1);
      expect(def.minSCL).toBeLessThanOrEqual(25);
      expect(def.descriptionDE.length).toBeGreaterThan(0);
      expect(def.descriptionEN.length).toBeGreaterThan(0);
    }
  });
});
