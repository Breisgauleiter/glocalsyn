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
