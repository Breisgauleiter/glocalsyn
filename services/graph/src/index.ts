/** Clean reimplementation below **/
import { Database, aql } from 'arangojs';
import Fastify from 'fastify';
import type { GraphObject as SharedGraphObject, GraphEdge as SharedGraphEdge, GraphRecommendation } from '@syntopia/types';

interface EnvConfig { url: string; database: string; username?: string; password?: string; }
const loadConfig = (): EnvConfig => ({ url: process.env.ARANGO_URL || 'http://localhost:8529', database: process.env.ARANGO_DB || 'syntopia', username: process.env.ARANGO_USER, password: process.env.ARANGO_PASS });

export interface Collections { objects: string; edges: string; }
const COLLECTIONS: Collections = { objects: 'graph_objects', edges: 'graph_edges' };

export interface GraphObject extends Omit<SharedGraphObject, '_key'> { _key?: string; type: SharedGraphObject['type']; name: string; }
export interface GraphEdge extends Omit<SharedGraphEdge, '_from' | '_to' | 'type' | 'createdAt'> { _key?: string; _from: string; _to: string; type: SharedGraphEdge['type']; createdAt: number; }

export async function ensureDatabase(db: Database, name: string) { const list = await db.listDatabases(); if (!list.includes(name)) await db.createDatabase(name); }
export async function ensureCollections(db: Database) { const existing = await db.listCollections(); const names = new Set(existing.map(c => c.name)); if (!names.has(COLLECTIONS.objects)) await db.collection(COLLECTIONS.objects).create(); if (!names.has(COLLECTIONS.edges)) await db.collection(COLLECTIONS.edges).create({ type: 3 }); }

export async function upsertObject(db: Database, obj: GraphObject) { const col = db.collection(COLLECTIONS.objects); if (obj._key) { await col.update(obj._key, obj, { keepNull: false }); return obj._key; } const meta = await col.save(obj); return meta._key; }
export async function createEdge(db: Database, edge: GraphEdge) { const col = db.collection(COLLECTIONS.edges); const meta = await col.save(edge); return meta._key; }

export async function getRecommendations(db: Database, userObjectKey: string, limit = 10): Promise<GraphRecommendation[]> { const cursor = await db.query(aql`
  FOR e IN ${db.collection(COLLECTIONS.edges)}
    FILTER e._from == CONCAT(${COLLECTIONS.objects}/, ${userObjectKey})
      AND (e.type == 'recommends' OR e.type == 'follows')
    FOR o IN ${db.collection(COLLECTIONS.objects)}
      FILTER o._id == e._to
      LIMIT ${limit}
      RETURN { node: o, reasons: [ { code: 'social_proof', explanation: 'follow/recommend edge' } ] }
`); return cursor.all(); }

export interface InMemoryEdge { _from: string; _to: string; type: GraphEdge['type']; }
export function recommendInMemory(objects: GraphObject[], edges: InMemoryEdge[], userKey: string, limit = 10): GraphRecommendation[] { const fromId = `${COLLECTIONS.objects}/${userKey}`; const targets = new Set(edges.filter(e => e._from === fromId && (e.type === 'recommends' || e.type === 'follows')).map(e => e._to)); return objects.filter(o => targets.has(`${COLLECTIONS.objects}/${o._key}`)).slice(0, limit).map(node => ({ node: node as SharedGraphObject, reasons: [{ code: 'social_proof', explanation: 'in-memory edge' }] })); }

function enrichObject<T extends Partial<GraphObject>>(o: T): T & Pick<GraphObject, 'diversityTags' | 'bridgeScore' | 'activityScore'> {
  return {
    diversityTags: Array.isArray((o as any).diversityTags) ? (o as any).diversityTags : [],
    bridgeScore: typeof (o as any).bridgeScore === 'number' ? (o as any).bridgeScore : 0,
    activityScore: typeof (o as any).activityScore === 'number' ? (o as any).activityScore : 0,
    ...o
  } as any;
}

export function buildMapSnapshot(objects: GraphObject[], edges: InMemoryEdge[], limit = 200) {
  const sliced = objects.slice(0, limit).map(enrichObject);
  return { nodes: sliced, edges: edges.slice(0, limit * 2), meta: { generatedAt: Date.now(), nodeCount: objects.length, edgeCount: edges.length } };
}

export async function bootstrap() { const cfg = loadConfig(); const sys = new Database({ url: cfg.url }); if (cfg.username && cfg.password) sys.useBasicAuth(cfg.username, cfg.password); try { await ensureDatabase(sys, cfg.database); const db = new Database({ url: cfg.url, databaseName: cfg.database }); if (cfg.username && cfg.password) db.useBasicAuth(cfg.username, cfg.password); await ensureCollections(db); const count = await db.collection(COLLECTIONS.objects).count(); if (count.count === 0) { const u = await upsertObject(db, { type: 'user', name: 'Demo User' }); const h = await upsertObject(db, { type: 'hub', name: 'Demo Hub' }); await createEdge(db, { _from: `${COLLECTIONS.objects}/${u}`, _to: `${COLLECTIONS.objects}/${h}`, type: 'joins', createdAt: Date.now() }); } const app = Fastify({ logger: false }); app.get('/health', async () => ({ ok: true })); app.get('/graph/recommendations/:userKey', async (req, reply) => { const { userKey } = req.params as any; try { return { items: await getRecommendations(db, userKey, 10) }; } catch (e) { reply.code(500); return { error: (e as Error).message }; } }); app.get('/graph/map-snapshot', async () => { const nodes: GraphObject[] = await (await db.query(aql`FOR o IN ${db.collection(COLLECTIONS.objects)} LIMIT 200 RETURN o`)).all(); const edges = await (await db.query(aql`FOR e IN ${db.collection(COLLECTIONS.edges)} LIMIT 400 RETURN e`)).all(); return { nodes, edges, meta: { generatedAt: Date.now(), nodeCount: nodes.length, edgeCount: edges.length } }; }); const port = Number(process.env.GRAPH_PORT || 4050); await app.listen({ port, host: '0.0.0.0' }); console.log(`[graph] HTTP API listening on :${port}`); } catch (err) { console.warn('[graph] Bootstrap skipped:', (err as Error).message); } }

if (process.argv[1] && process.argv[1].endsWith('src/index.ts')) bootstrap();

