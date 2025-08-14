import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';

function scryptAsync(password: string, salt: Buffer, keyLength: number, opts?: { N?: number; r?: number; p?: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    (_scrypt as any)(password, salt, keyLength, opts || {}, (err: any, derivedKey: Buffer) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export interface PasswordHashOptions {
  saltBytes?: number;
  keyLength?: number;
  N?: number;
  r?: number;
  p?: number;
}

const DEFAULTS: Required<PasswordHashOptions> = {
  saltBytes: 16,
  keyLength: 64,
  N: 16384,
  r: 8,
  p: 1,
};

export async function hashPassword(password: string, opts: PasswordHashOptions = {}): Promise<string> {
  const cfg = { ...DEFAULTS, ...opts };
  const salt = randomBytes(cfg.saltBytes);
  const key = await scryptAsync(password, salt, cfg.keyLength, { N: cfg.N, r: cfg.r, p: cfg.p });
  const enc = `scrypt:${cfg.N}:${cfg.r}:${cfg.p}:${salt.toString('base64url')}:${key.toString('base64url')}`;
  return enc;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  try {
    const parts = encoded.split(':');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
    const N = Number(parts[1]);
    const r = Number(parts[2]);
    const p = Number(parts[3]);
    const salt = Buffer.from(parts[4], 'base64url');
    const expected = Buffer.from(parts[5], 'base64url');
  const calc = await scryptAsync(password, salt, expected.length, { N, r, p });
    return timingSafeEqual(calc, expected);
  } catch {
    return false;
  }
}
