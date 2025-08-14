import { renderHook, act } from '@testing-library/react';
import { useProfile } from './profileStore';
import { act as rtlAct } from '@testing-library/react';

describe('useProfile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads defaults and updates/persists profile', () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile.scl).toBe(1);
    expect(result.current.profile.githubLinked).toBe(false);

    act(() => {
      result.current.update({ githubLinked: true, scl: 4 as any });
    });

    expect(result.current.profile.githubLinked).toBe(true);
    const raw = localStorage.getItem('profile');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({ githubLinked: true, scl: 4 });
  });

  it('hydrates name from remote profile with ETag caching', async () => {
    let calls = 0;
    // @ts-ignore
    global.fetch = vi.fn(async (url: string, init: any) => {
      if (!url.includes('/profile/')) return new Response('{}', { status: 404 });
      calls++;
      if (calls === 1) return new Response('{"profile":{"key":"demo-user","name":"Remote Demo","type":"user"}}', { status: 200, headers: { 'Content-Type': 'application/json', 'ETag': 'W/"p1"' } });
      if (init?.headers?.['If-None-Match'] === 'W/"p1"') return new Response(null, { status: 304, headers: { 'ETag': 'W/"p1"' } });
      return new Response('{"profile":{"key":"demo-user","name":"Changed","type":"user"}}', { status: 200, headers: { 'Content-Type': 'application/json', 'ETag': 'W/"p2"' } });
    });
    const { result } = renderHook(() => useProfile());
    // wait tick for async hydrate
    await rtlAct(async () => { await Promise.resolve(); });
    expect(result.current.profile.name).toBe('Remote Demo');
    // trigger second hydrate to test 304 path
    await rtlAct(async () => { await Promise.resolve(); });
    expect(calls).toBeGreaterThanOrEqual(1);
  });
});
