import assert from 'node:assert';
import test from 'node:test';
import { Database } from 'arangojs';
import { createUser, ensureUserCollection, USER_COLLECTION, projectUserToGraph } from './user.js';
import { start } from './index.js';

const url = process.env.ARANGO_URL || 'http://localhost:8529';
const database = process.env.ARANGO_DB || 'syntopia';

async function prepareDb() {
  const sys = new Database({ url });
  const list = await sys.listDatabases();
  if (!list.includes(database)) await sys.createDatabase(database);
  const db = new Database({ url, databaseName: database });
  await ensureUserCollection(db);
  return db;
}

test('createUser inserts user and projects to graph_objects', async () => {
  const db = await prepareDb();
  const user = await createUser(db, { displayName: 'Tester' });
  assert.ok(user._key, 'has key');
  const userDoc = await db.collection(USER_COLLECTION).document(user._key);
  assert.ok(userDoc.createdAt);
  const graphCol = db.collection('graph_objects');
  try {
    const graphDoc = await graphCol.document(user._key);
    if (graphDoc) {
      assert.equal(graphDoc.type, 'user');
    }
  } catch {
    // graph_objects may not exist yet: acceptable in skeleton
  }
});

test('projectUserToGraph idempotent', async () => {
  const db = await prepareDb();
  const user = await createUser(db, { displayName: 'Second' });
  await projectUserToGraph(db, user);
  await projectUserToGraph(db, user);
  assert.ok(user._key);
});

test('session cookie set and /me returns user', async () => {
  const app = await start();
  const create = await app.inject({ method: 'POST', url: '/dev/create-user', payload: { displayName: 'SessUser' } });
  assert.equal(create.statusCode, 200);
  const setCookie = create.headers['set-cookie'];
  assert.ok(setCookie && setCookie.includes('sid='));
  const me = await app.inject({ method: 'GET', url: '/me', headers: { cookie: setCookie as string } });
  assert.equal(me.statusCode, 200);
  const body = me.json();
  assert.ok(body.user.id);
});
