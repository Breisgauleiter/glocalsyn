import { describe, it, expect } from 'vitest';
import { canonicalString, computeEtag } from './etag.js';

describe('etag utils', () => {
  it('produces stable ordering for object keys', () => {
    const a = { b: 2, a: 1 };
    const b = { a: 1, b: 2 };
    expect(canonicalString(a)).toEqual(canonicalString(b));
    expect(computeEtag(a)).toEqual(computeEtag(b));
  });
  it('distinguishes different values', () => {
    const e1 = computeEtag({ a: 1 });
    const e2 = computeEtag({ a: 2 });
    expect(e1).not.toEqual(e2);
  });
  it('is weak etag format', () => {
    expect(computeEtag({ a: 1 })).toMatch(/^W\/"[0-9a-f]{32}"$/);
  });
});
