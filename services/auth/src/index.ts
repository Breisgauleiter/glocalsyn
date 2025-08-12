import Fastify from 'fastify';
import { Database } from 'arangojs';
import { ensureUserCollection, createUser, USER_COLLECTION } from './user.js';

interface EnvCfg { url: string; database: string; user?: string; pass?: string; }
function load(): EnvCfg { return { url: process.env.ARANGO_URL || 'http://localhost:8529', database: process.env.ARANGO_DB || 'syntopia', user: process.env.ARANGO_USER, pass: process.env.ARANGO_PASS }; }

async function getDb(): Promise<Database> {
  const cfg = load();
  const sys = new Database({ url: cfg.url });
  if (cfg.user && cfg.pass) sys.useBasicAuth(cfg.user, cfg.pass);
  if (!(await sys.listDatabases()).includes(cfg.database)) await sys.createDatabase(cfg.database);
  const db = new Database({ url: cfg.url, databaseName: cfg.database });
  if (cfg.user && cfg.pass) db.useBasicAuth(cfg.user, cfg.pass);
  await ensureUserCollection(db);
  return db;
}

export async function start() {
  const db = await getDb();
  const app = Fastify({ logger: false });
  app.get('/health', async () => ({ ok: true }));
  app.post('/dev/create-user', async (req, reply) => {
    if (process.env.NODE_ENV === 'production') { reply.code(403); return { error: 'forbidden' }; }
    const body: any = (req as any).body || {};
    const user = await createUser(db, { displayName: body.displayName, locale: body.locale });
    return { user };
  });
  app.get('/dev/users', async () => {
    const cursor = await db.query(`FOR u IN ${USER_COLLECTION} LIMIT 20 RETURN u`);
    return { items: await cursor.all() };
  });
  const port = Number(process.env.AUTH_PORT || 4060);
  await app.listen({ port, host: '0.0.0.0' });
  console.log(`[auth] service listening :${port}`);
  return app;
}

if (process.argv[1] && process.argv[1].endsWith('src/index.ts')) start();
