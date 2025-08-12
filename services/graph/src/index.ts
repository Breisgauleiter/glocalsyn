/**
 * Graph Service (ArangoDB + TAO model)
 * Minimal bootstrap: connects to ArangoDB (if available) and ensures collections.
 * Safe to run even if DB not reachable (logs warning and exits gracefully).
 */
import { Database, aql } from 'arangojs';
import Fastify from 'fastify';

interface EnvConfig {
  url: string;
  database: string;
  username?: string;
  password?: string;
}

function loadConfig(): EnvConfig {
  return {
    url: process.env.ARANGO_URL || 'http://localhost:8529',
    database: process.env.ARANGO_DB || 'syntopia',
    username: process.env.ARANGO_USER,
    password: process.env.ARANGO_PASS,
  };
}

export interface Collections {
  objects: string;
  edges: string;
}

const COLLECTIONS: Collections = {
  objects: 'graph_objects',
  edges: 'graph_edges',
};

export async function ensureDatabase(db: Database, name: string) {
  const databases = await db.listDatabases();
  if (!databases.includes(name)) {
    await db.createDatabase(name);
  }
}

export async function ensureCollections(db: Database) {
  const existing = await db.listCollections();
  const names = new Set(existing.map(c => c.name));
  if (!names.has(COLLECTIONS.objects)) {
    await db.collection(COLLECTIONS.objects).create();
  }
  if (!names.has(COLLECTIONS.edges)) {
    await db.collection(COLLECTIONS.edges).create({ type: 3 }); // 3 = EDGE_COLLECTION
  }
}

export interface GraphObject {
  _key?: string;
  type: 'user' | 'hub' | 'quest';
  name: string;
  [k: string]: any;
}

export interface GraphEdge {
  _key?: string;
  _from: string; // e.g. graph_objects/user123
  _to: string;   // e.g. graph_objects/hub456
  type: 'follows' | 'joins' | 'recommends';
  createdAt: number;
  [k: string]: any;
}

export async function upsertObject(db: Database, obj: GraphObject) {
  const col = db.collection(COLLECTIONS.objects);
  if (obj._key) {
    await col.update(obj._key, obj, { keepNull: false });
    return obj._key;
  }
  const meta = await col.save(obj);
  return meta._key;
}

export async function createEdge(db: Database, edge: GraphEdge) {
  const col = db.collection(COLLECTIONS.edges);
  const meta = await col.save(edge);
  return meta._key;
}

export async function getRecommendations(db: Database, userObjectKey: string, limit = 10) {
  // Recommends = outward edges of type recommends or follows → objects
  const cursor = await db.query(aql`
    FOR e IN ${db.collection(COLLECTIONS.edges)}
      FILTER e._from == CONCAT(${COLLECTIONS.objects}/, ${userObjectKey})
      AND (e.type == 'recommends' OR e.type == 'follows')
      FOR o IN ${db.collection(COLLECTIONS.objects)}
        FILTER o._id == e._to
        LIMIT ${limit}
        RETURN o
  `);
  return cursor.all();
}

// Pure in-memory recommendation helper (for tests / fallback)
export interface InMemoryEdge { _from: string; _to: string; type: GraphEdge['type']; }
export function recommendInMemory(objects: GraphObject[], edges: InMemoryEdge[], userKey: string, limit = 10): GraphObject[] {
  const fromIdPrefix = `${COLLECTIONS.objects}/${userKey}`;
  const targets = edges
    .filter(e => e._from === fromIdPrefix && (e.type === 'recommends' || e.type === 'follows'))
    .map(e => e._to);
  const targetSet = new Set(targets);
  return objects.filter(o => targetSet.has(`${COLLECTIONS.objects}/${o._key}`)).slice(0, limit);
}

export async function bootstrap() {
  const cfg = loadConfig();
  const sys = new Database({ url: cfg.url });
  if (cfg.username && cfg.password) {
    sys.useBasicAuth(cfg.username, cfg.password);
  }
  try {
    await ensureDatabase(sys, cfg.database);
  const db = new Database({ url: cfg.url, databaseName: cfg.database });
    if (cfg.username && cfg.password) db.useBasicAuth(cfg.username, cfg.password);
    await ensureCollections(db);
    // Smoke insert example (only if empty)
    const count = await db.collection(COLLECTIONS.objects).count();
    if (count.count === 0) {
      const userKey = await upsertObject(db, { type: 'user', name: 'Demo User' });
      const hubKey = await upsertObject(db, { type: 'hub', name: 'Demo Hub' });
      await createEdge(db, { _from: `${COLLECTIONS.objects}/${userKey}`, _to: `${COLLECTIONS.objects}/${hubKey}`, type: 'joins', createdAt: Date.now() });
      console.log('[graph] Seeded demo objects.');
    }
    console.log('[graph] DB Ready.');
    // Start HTTP API
    const app = Fastify({ logger: false });
    app.get('/health', async () => ({ ok: true }));
    app.get('/recommendations/:userKey', async (req, reply) => {
      const { userKey } = req.params as any;
      try {
        const data = await getRecommendations(db, userKey, 10);
        return { items: data };
      } catch (e) {
        reply.code(500);
        return { error: (e as Error).message };
      }
    });
    const port = Number(process.env.GRAPH_PORT || 4050);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[graph] HTTP API listening on :${port}`);
  } catch (err) {
    console.warn('[graph] Bootstrap skipped (Arango unreachable?):', (err as Error).message);
  }
}

// Node ESM: emulate import.meta.main
const isMain = process.argv[1] && process.argv[1].endsWith('src/index.ts');
if (isMain) {
  bootstrap();
}
