// ETag utilities (Sprint 03 Task 7)
// Generates weak ETags for JSON-serializable data using stable canonical stringify + sha256.

import { createHash } from 'crypto';

// Stable stringify: objects with sorted keys; arrays preserved order; no whitespace.
export function canonicalString(value: unknown): string {
  return _stringify(value);
}

function _stringify(v: any): string {
  if (v === null || typeof v === 'number' || typeof v === 'boolean') return JSON.stringify(v);
  if (typeof v === 'string') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(_stringify).join(',') + ']';
  if (typeof v === 'object') {
    const keys = Object.keys(v).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + _stringify(v[k])).join(',') + '}';
  }
  return JSON.stringify(null);
}

export function computeEtag(value: unknown): string {
  const hash = createHash('sha256').update(canonicalString(value)).digest('hex').slice(0, 32);
  return 'W/"' + hash + '"';
}
