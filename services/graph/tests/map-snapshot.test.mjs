import assert from 'node:assert';
import { buildMapSnapshot } from '../dist/index.js';

const objs = [
  { _key: 'u1', type: 'user', name: 'User 1' },
  { _key: 'h1', type: 'hub', name: 'Hub 1', bridgeScore: 2 }
];
const edges = [ { _from: 'graph_objects/u1', _to: 'graph_objects/h1', type: 'joins' } ];

const snap = buildMapSnapshot(objs, edges, 10);
assert.ok(Array.isArray(snap.nodes));
assert.ok(snap.nodes[0].diversityTags !== undefined, 'diversityTags default present');
assert.strictEqual(typeof snap.nodes[0].bridgeScore, 'number');
assert.strictEqual(typeof snap.nodes[0].activityScore, 'number');
assert.ok(snap.meta.nodeCount === 2 && snap.meta.edgeCount === 1);
