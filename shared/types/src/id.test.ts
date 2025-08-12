import { describe, it, expect } from 'vitest';
import { generateId, isLikelyId, compareIds } from './id';

describe('id utilities', () => {
  it('generates URL-safe ids', () => {
    const id = generateId();
    expect(isLikelyId(id)).toBe(true);
  });

  it('monotonic within a burst', () => {
    const ids = Array.from({ length: 50 }, () => generateId());
    for (let i = 1; i < ids.length; i++) {
      expect(compareIds(ids[i - 1], ids[i])).toBeLessThanOrEqual(0);
    }
  });

  it('low collision probability in small sample', () => {
    const set = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const id = generateId();
      expect(set.has(id)).toBe(false);
      set.add(id);
    }
  });
});
