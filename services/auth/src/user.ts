import { Database } from 'arangojs';
// Local generateId (duplicate of shared util to avoid ESM resolution issues during early skeleton phase)
let lastTs = 0; let perMsCounter = 0;
function generateId(): string { const now = Date.now(); if (now === lastTs) perMsCounter++; else { lastTs = now; perMsCounter = 0; } const timePart = now.toString(36); const counter = perMsCounter.toString(36).padStart(2,'0'); const rand = Math.random().toString(36).slice(2,8); return `${timePart}${counter}${rand}`; }

export interface UserRecord {
  _key: string; // userId
  createdAt: number;
  updatedAt: number;
  username?: string;
  email?: string;
  passwordHash?: string; // credential-based login (scrypt)
  displayName?: string;
  locale?: 'de' | 'en';
  scl: number;
  flags?: { githubLinked?: boolean };
}

export const USER_COLLECTION = 'users';
export const GRAPH_OBJECTS_COLLECTION = 'graph_objects';

export async function ensureUserCollection(db: Database) {
  const existing: any[] = await db.listCollections();
  if (!existing.some((c: any) => c.name === USER_COLLECTION)) {
    await db.collection(USER_COLLECTION).create();
  }
  // Ensure simple indexes for username/email uniqueness (best-effort, ignore if exist)
  try {
    await (db.collection(USER_COLLECTION) as any).createHashIndex?.(['username'], { unique: true, sparse: true });
  } catch { /* index may already exist */ }
  try {
    await (db.collection(USER_COLLECTION) as any).createHashIndex?.(['email'], { unique: true, sparse: true });
  } catch { /* index may already exist */ }
}

export async function createUser(db: Database, partial: Partial<UserRecord> = {}): Promise<UserRecord> {
  const now = Date.now();
  const rec: UserRecord = {
    _key: generateId(),
    createdAt: now,
    updatedAt: now,
    scl: 1,
    ...partial,
  };
  await db.collection(USER_COLLECTION).save(rec);
  await projectUserToGraph(db, rec);
  return rec;
}

export async function findUserByEmailOrUsername(db: Database, id: string): Promise<UserRecord | null> {
  // Query by email first, then username
  try {
    const byEmail = await db.query(`FOR u IN ${USER_COLLECTION} FILTER u.email == @id LIMIT 1 RETURN u`, { id });
    const users = await byEmail.all();
    if (users[0]) return users[0] as UserRecord;
  } catch { /* ignore */ }
  try {
    const byUsername = await db.query(`FOR u IN ${USER_COLLECTION} FILTER u.username == @id LIMIT 1 RETURN u`, { id });
    const users = await byUsername.all();
    if (users[0]) return users[0] as UserRecord;
  } catch { /* ignore */ }
  return null;
}

export async function findUserByEmail(db: Database, email: string): Promise<UserRecord | null> {
  try {
    const cursor = await db.query(`FOR u IN ${USER_COLLECTION} FILTER u.email == @email LIMIT 1 RETURN u`, { email });
    const arr = await cursor.all();
    return arr[0] || null;
  } catch {
    return null;
  }
}

export async function upsertUserByEmail(db: Database, email: string, attrs: Partial<UserRecord> = {}): Promise<UserRecord> {
  const existing = await findUserByEmail(db, email);
  if (existing) {
    const merged: UserRecord = { ...existing, ...attrs, email, updatedAt: Date.now() };
    await db.collection(USER_COLLECTION).update(existing._key, merged, { keepNull: false });
    await projectUserToGraph(db, merged);
    return merged;
  }
  const created = await createUser(db, { email, ...attrs });
  return created;
}

export async function projectUserToGraph(db: Database, user: UserRecord) {
  const graphCol = db.collection(GRAPH_OBJECTS_COLLECTION);
  try {
    // Try insert; if already exists, fallback to update
    await graphCol.save({ _key: user._key, type: 'user', name: user.displayName || 'User', scl: user.scl, flags: user.flags });
  } catch {
    try { await graphCol.update(user._key, { name: user.displayName || 'User', scl: user.scl, flags: user.flags }); } catch { /* ignore */ }
  }
}
