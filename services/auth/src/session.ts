import { randomBytes } from 'node:crypto';

export interface SessionRecord {
  id: string;
  userId: string;
  createdAt: number;
  lastAccess: number;
}

const SESSIONS = new Map<string, SessionRecord>();
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function createSession(userId: string): SessionRecord {
  const id = randomBytes(18).toString('base64url');
  const now = Date.now();
  const rec: SessionRecord = { id, userId, createdAt: now, lastAccess: now };
  SESSIONS.set(id, rec);
  return rec;
}

export function getSession(id: string | undefined | null): SessionRecord | null {
  if (!id) return null;
  const rec = SESSIONS.get(id);
  if (!rec) return null;
  if (Date.now() - rec.lastAccess > MAX_AGE_MS) { SESSIONS.delete(id); return null; }
  rec.lastAccess = Date.now();
  return rec;
}

export function destroySession(id: string) { SESSIONS.delete(id); }

export function serializeSessionCookie(id: string): string {
  const maxAge = Math.floor(MAX_AGE_MS / 1000);
  // In dev we omit Secure to work over http://localhost; set Secure in prod via proxy or env
  return `sid=${id}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
}

export function parseCookie(header: string | undefined): Record<string,string> {
  const out: Record<string,string> = {};
  if (!header) return out;
  header.split(/; */).forEach(p => { const [k,v] = p.split('='); if (k) out[k] = decodeURIComponent(v||''); });
  return out;
}
