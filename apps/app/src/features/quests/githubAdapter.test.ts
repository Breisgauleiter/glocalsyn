import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealGithubAdapter } from './githubAdapter';

const sampleIssues = [
  {
    id: 1,
    number: 101,
    title: 'Fix login bug',
    body: 'Details...',
    html_url: 'https://github.com/foo/bar/issues/101',
    labels: [{ name: 'bug' }, { name: 'good first issue' }],
  },
  {
    id: 2,
    number: 102,
    title: 'Docs update',
    body: null,
    html_url: 'https://github.com/foo/bar/issues/102',
    labels: [],
  },
  {
    id: 3,
    number: 7,
    title: 'This is a PR not an issue',
    html_url: 'https://github.com/foo/bar/pull/7',
    pull_request: { url: 'https://api.github.com/repos/foo/bar/pulls/7' },
  },
];

describe('RealGithubAdapter (read-only)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn(async (url: any) => {
      if (String(url).includes('/repos/foo/bar/issues')) {
        return {
          ok: true,
          json: async () => sampleIssues,
        } as any;
      }
      return { ok: false, json: async () => ({}) } as any;
    }) as any;
  });

  it('applies cursor (page) when provided (base64 p:2)', async () => {
    let requestedUrl: string | undefined;
    // Mock fetch capturing page param
    // @ts-ignore
    global.fetch = async (url: string) => {
      requestedUrl = url;
      return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    const cursor = btoa('p:2');
    const adapter = new RealGithubAdapter({ perRepoLimit: 5, cursor });
    await adapter.listIssues(['owner/repo']);
    expect(requestedUrl).toMatch(/page=2/);
  });

  it('retries on 429 with Retry-After then succeeds', async () => {
    let calls = 0;
    // @ts-ignore
    global.fetch = async () => {
      calls++;
      if (calls === 1) {
        return new Response('Rate limited', { status: 429, headers: { 'Retry-After': '0' } });
      }
      return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    const adapter = new RealGithubAdapter({ perRepoLimit: 1 });
    const issues = await adapter.listIssues(['owner/repo']);
    expect(issues.length).toBe(0);
    expect(calls).toBeGreaterThanOrEqual(2);
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('maps GitHub issues to GitHubIssueLite and filters PRs', async () => {
    const adapter = new RealGithubAdapter({ perRepoLimit: 5 });
    const items = await adapter.listIssues(['foo/bar']);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      id: 1,
      number: 101,
      title: 'Fix login bug',
      body: 'Details...',
      url: 'https://github.com/foo/bar/issues/101',
      repo: 'foo/bar',
      labels: ['bug', 'good first issue'],
    });
    expect(items[1]).toMatchObject({
      id: 2,
      number: 102,
      title: 'Docs update',
      body: undefined,
      url: 'https://github.com/foo/bar/issues/102',
      repo: 'foo/bar',
    });
  });
});
