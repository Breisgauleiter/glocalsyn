import assert from 'node:assert';
import { recommendInMemory } from '../dist/index.js';

// Basic runtime test (dist must exist)
const objs = [
  { _key: 'user1', type: 'user', name: 'U1' },
  { _key: 'hub1', type: 'hub', name: 'H1' },
  { _key: 'hub2', type: 'hub', name: 'H2' }
];
const edges = [ { _from: 'graph_objects/user1', _to: 'graph_objects/hub2', type: 'recommends' } ];
const res = recommendInMemory(objs, edges, 'user1');
assert.strictEqual(res.length, 1);
assert.strictEqual(res[0].node._key, 'hub2');
assert.ok(Array.isArray(res[0].reasons));
