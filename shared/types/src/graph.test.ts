import { describe, it, expect } from 'vitest';
import { getRecommendations, getConnections, GraphObject, GraphEdge } from './graph';

describe('graph helpers', () => {
  const objects: GraphObject[] = [
    { _key: 'u1', type: 'user', name: 'User1' },
    { _key: 'u2', type: 'user', name: 'User2' },
    { _key: 'h1', type: 'hub', name: 'Hub1' },
    { _key: 'q1', type: 'quest', name: 'Quest1' },
  ];
  const edges: GraphEdge[] = [
    { _from: 'user/u1', _to: 'user/u2', type: 'follows', createdAt: Date.now() },
    { _from: 'user/u1', _to: 'hub/h1', type: 'joins', createdAt: Date.now() },
    { _from: 'user/u1', _to: 'quest/q1', type: 'recommends', createdAt: Date.now() },
  ];

  it('getRecommendations returns followed users and recommended objects', () => {
    const recs = getRecommendations(objects, edges, 'u1');
    expect(recs.find(o => o._key === 'u2')).toBeTruthy();
    expect(recs.find(o => o._key === 'q1')).toBeTruthy();
  });

  it('getConnections returns joined hubs and follows', () => {
    const conns = getConnections(objects, edges, 'u1');
    expect(conns.find(o => o._key === 'h1')).toBeTruthy();
    expect(conns.find(o => o._key === 'u2')).toBeTruthy();
  });
});
