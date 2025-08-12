import { Database } from 'arangojs';
// Local generateId (duplicate of shared util to avoid ESM resolution issues during early skeleton phase)
let lastTs = 0; let perMsCounter = 0;
function generateId(): string { const now = Date.now(); if (now === lastTs) perMsCounter++; else { lastTs = now; perMsCounter = 0; } const timePart = now.toString(36); const counter = perMsCounter.toString(36).padStart(2,'0'); const rand = Math.random().toString(36).slice(2,8); return `${timePart}${counter}${rand}`; }

export interface UserRecord {
  _key: string; // userId
  createdAt: number;
  updatedAt: number;
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

export async function projectUserToGraph(db: Database, user: UserRecord) {
  const graphCol = db.collection(GRAPH_OBJECTS_COLLECTION);
  try {
    // Try insert; if already exists, fallback to update
    await graphCol.save({ _key: user._key, type: 'user', name: user.displayName || 'User', scl: user.scl, flags: user.flags });
  } catch {
    try { await graphCol.update(user._key, { name: user.displayName || 'User', scl: user.scl, flags: user.flags }); } catch { /* ignore */ }
  }
}
