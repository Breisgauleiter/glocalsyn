import type { GitHubIssueLite } from '../../../../../shared/types/src';

export interface GithubAdapterOptions {
  token?: string; // optional, for higher rate limits
  perRepoLimit?: number; // cap number of issues per repo
  state?: 'open' | 'closed' | 'all';
  labels?: string[];
}

export interface GithubAdapter {
  listIssues(repos: string[]): Promise<GitHubIssueLite[]>;
}

export class RealGithubAdapter implements GithubAdapter {
  private token?: string;
  private perRepoLimit: number;
  private state: 'open' | 'closed' | 'all';
  private labels?: string[];

  constructor(opts: GithubAdapterOptions = {}) {
    this.token = opts.token;
    this.perRepoLimit = opts.perRepoLimit ?? 10;
    this.state = opts.state ?? 'open';
    this.labels = opts.labels;
  }

  async listIssues(repos: string[]): Promise<GitHubIssueLite[]> {
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github+json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const qs = new URLSearchParams({ state: this.state, per_page: String(this.perRepoLimit) });
    if (this.labels?.length) qs.set('labels', this.labels.join(','));

    const results = await Promise.all(
      repos.map(async (repo) => {
        // Basic validation for owner/repo
        if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return [] as GitHubIssueLite[];
        const url = `https://api.github.com/repos/${repo}/issues?${qs.toString()}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          // Skip this repo on API error; keep adapter tolerant for now (read-only, best-effort)
          return [] as GitHubIssueLite[];
        }
        const data: any[] = await res.json();
        const mapped: GitHubIssueLite[] = [];
        for (const it of data) {
          // Filter out PRs (GitHub returns PRs in the issues list when using the issues endpoint)
          if (it.pull_request) continue;
          mapped.push({
            id: it.id,
            number: it.number,
            title: it.title,
            body: it.body ?? undefined,
            url: it.html_url,
            repo,
            labels: Array.isArray(it.labels) ? it.labels.map((l: any) => (typeof l === 'string' ? l : l?.name)).filter(Boolean) : undefined,
          });
        }
        return mapped;
      })
    );

    return results.flat();
  }
}

// Helper to read a feature flag safely (string "true" -> true)
export function isGithubAdapterEnabled(): boolean {
  // Vite: import.meta.env; fall back to process.env for tests
  const raw = (import.meta as any)?.env?.VITE_USE_GITHUB_ADAPTER ?? (typeof process !== 'undefined' ? (process.env?.VITE_USE_GITHUB_ADAPTER as any) : undefined);
  return String(raw).toLowerCase() === 'true';
}

export function createGithubAdapterFromEnv(): GithubAdapter {
  const token = (import.meta as any)?.env?.VITE_GITHUB_TOKEN ?? (typeof process !== 'undefined' ? process.env?.VITE_GITHUB_TOKEN : undefined);
  const perRepoLimitStr = (import.meta as any)?.env?.VITE_GITHUB_PER_REPO_LIMIT ?? (typeof process !== 'undefined' ? process.env?.VITE_GITHUB_PER_REPO_LIMIT : undefined);
  const perRepoLimit = perRepoLimitStr ? parseInt(String(perRepoLimitStr), 10) : undefined;
  return new RealGithubAdapter({ token, perRepoLimit });
}
