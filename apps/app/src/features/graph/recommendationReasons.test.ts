import { describe, it, expect } from 'vitest';
import { reasonCodeToKey, mapExplanation } from './recommendationReasons';

describe('recommendationReasons mapping', () => {
  it('maps known codes to i18n keys', () => {
    expect(reasonCodeToKey('bridge')).toBe('recs.reason.bridge');
    expect(reasonCodeToKey('diversity')).toBe('recs.reason.diversity');
    expect(reasonCodeToKey('continuation')).toBe('recs.reason.continuation');
    expect(reasonCodeToKey('activity')).toBe('recs.reason.activity');
    expect(reasonCodeToKey('social_proof')).toBe('recs.reason.social_proof');
  });
  it('falls back unknown codes to social_proof key', () => {
    expect(reasonCodeToKey('weird')).toBe('recs.reason.social_proof');
  });
  it('mapExplanation keeps override explanation but still returns key', () => {
    const mapped = mapExplanation('bridge', 'Custom explanation');
    expect(mapped.key).toBe('recs.reason.bridge');
    expect(mapped.fallback).toBe('Custom explanation');
  });
});
