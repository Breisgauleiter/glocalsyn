import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useQuestStore, getQuestsForProfile } from './questStore';

// Helper to set and restore env between tests
const originalEnv = { ...process.env };

describe('useQuestStore with GitHub adapter flag', () => {
  beforeEach(() => {
    process.env.VITE_USE_GITHUB_ADAPTER = 'true';
    process.env.VITE_GITHUB_REPOS = 'foo/bar';
  });

  afterEach(() => {
    // Restore env
    Object.keys(process.env).forEach((k) => { delete (process.env as any)[k]; });
    Object.assign(process.env, originalEnv);
    vi.clearAllMocks();
  });

  it('keeps baseline immediately and enriches with adapter results when enabled', async () => {
    // Mock fetch to return 1 issue
    const sampleIssue = [{ id: 10, number: 77, title: 'Adapter test', html_url: 'https://github.com/foo/bar/issues/77' }];
    const originalFetch = global.fetch;
    global.fetch = vi.fn(async () => ({ ok: true, json: async () => sampleIssue })) as any;

    try {
      const { result } = renderHook(() => useQuestStore({ scl: 4, githubLinked: true } as any));
      // Baseline should include dummy quest
      expect(result.current.quests.find((q) => q.id === 'q1')).toBeTruthy();

      // Wait for enrichment
  await waitFor(() => {
        const gh = result.current.quests.find((q) => q.source?.kind === 'github_issue');
        expect(gh).toBeTruthy();
      });
    } finally {
      global.fetch = originalFetch as any;
    }
  });

  it('does not call adapter when flag is off', async () => {
    process.env.VITE_USE_GITHUB_ADAPTER = 'false';
    const spy = vi.spyOn(global, 'fetch' as any);
    const { result } = renderHook(() => useQuestStore({ scl: 4, githubLinked: true } as any));
    // Baseline only; no fetch calls
    expect(result.current.quests.find((q) => q.id === 'q1')).toBeTruthy();
  // Give microtasks a tick
  await Promise.resolve();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
