import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchRecommendations, fetchCachedJson } from './graphClient';

describe('graphClient etag caching', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  it('uses ETag and 304 for recommendations', async () => {
    let calls = 0;
    // @ts-ignore
    global.fetch = vi.fn(async (url: string, init: any) => {
      calls++;
      if (calls === 1) {
        return new Response(JSON.stringify({ items: [{ node: { _key: 'x1', type: 'quest', name: 'Quest X' }, reasons: [] }] }), { status: 200, headers: { 'Content-Type': 'application/json', 'ETag': 'W/"abc"' } });
      }
      // second call should send If-None-Match and we reply 304
      if (init?.headers?.['If-None-Match'] === 'W/"abc"') {
        return new Response(null, { status: 304, headers: { 'ETag': 'W/"abc"' } });
      }
      return new Response('[]', { status: 500 });
    });
    const first = await fetchRecommendations({ userKey: 'u1' });
    const second = await fetchRecommendations({ userKey: 'u1' });
    expect(first.length).toBe(1);
    expect(second.length).toBe(1);
    expect(calls).toBe(2); // 2 network hits (initial + validation 304)
  });

  it('generic fetchCachedJson returns cached data on 304', async () => {
    let calls = 0;
    // @ts-ignore
    global.fetch = vi.fn(async (url: string, init: any) => {
      calls++;
      if (calls === 1) return new Response('{"value":1}', { status: 200, headers: { 'Content-Type': 'application/json', 'ETag': 'W/"etag1"' } });
      if (init?.headers?.['If-None-Match'] === 'W/"etag1"') return new Response(null, { status: 304, headers: { 'ETag': 'W/"etag1"' } });
      return new Response('{"value":2}', { status: 200, headers: { 'Content-Type': 'application/json', 'ETag': 'W/"etag2"' } });
    });
    const a = await fetchCachedJson('http://x/resource');
    const b = await fetchCachedJson('http://x/resource');
    expect(a.value).toBe(1);
    expect(b.value).toBe(1);
    expect(calls).toBe(2);
  });
});
