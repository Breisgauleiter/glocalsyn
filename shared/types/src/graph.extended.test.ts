import { describe, it, expect } from 'vitest';
import { createGraphObject, isGraphEdge, getRecommendations, GraphEdge } from './graph';

describe('extended graph types', () => {
  it('createGraphObject applies defaults and overrides', () => {
    const obj = createGraphObject('quest', 'q1', 'Quest 1', { bridgeScore: 2, diversityTags: ['art'], extra: true });
    expect(obj._key).toBe('q1');
    expect(obj.type).toBe('quest');
    expect(obj.bridgeScore).toBe(2);
    expect(obj.diversityTags).toEqual(['art']);
    expect(obj.activityScore).toBe(0); // default
    expect(obj.extra).toBe(true);
  });

  it('isGraphEdge validates structural shape', () => {
    const edge: GraphEdge = { _from: 'user/u1', _to: 'quest/q1', type: 'recommends', createdAt: Date.now() };
    expect(isGraphEdge(edge)).toBe(true);
    expect(isGraphEdge({})).toBe(false);
    expect(isGraphEdge({ _from: 'a', _to: 'b', type: 'follows', createdAt: 'x' })).toBe(false);
  });

  it('getRecommendations de-duplicates and includes follows + continues', () => {
    const objects = [
      createGraphObject('user', 'u1', 'User1'),
      createGraphObject('user', 'u2', 'User2'),
      createGraphObject('quest', 'q1', 'Quest1'),
      createGraphObject('quest', 'q2', 'Quest2')
    ];
    const edges: GraphEdge[] = [
      { _from: 'user/u1', _to: 'user/u2', type: 'follows', createdAt: 1 },
      { _from: 'user/u1', _to: 'quest/q1', type: 'recommends', createdAt: 2 },
      { _from: 'user/u1', _to: 'quest/q1', type: 'recommends', createdAt: 3 }, // duplicate should collapse
      { _from: 'user/u1', _to: 'quest/q2', type: 'continues', createdAt: 4 }
    ];
    const recs = getRecommendations(objects, edges, 'u1');
    const keys = recs.map(r => r._key);
    expect(keys).toEqual(['u2', 'q1', 'q2']);
  });
});
