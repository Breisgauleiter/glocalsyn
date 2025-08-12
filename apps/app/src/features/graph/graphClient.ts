// Lightweight Graph Service Client
// Progressive enhancement: abort + timeout, graceful fallback

export interface GraphRecommendationDTO {
  node: { _key: string; type: string; name: string; [k: string]: any };
  reasons: { code: string; explanation?: string }[];
}

export interface FetchRecommendationsOptions {
  baseUrl?: string;      // e.g. http://localhost:4050
  userKey: string;       // user object key
  limit?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export async function fetchRecommendations(opts: FetchRecommendationsOptions): Promise<GraphRecommendationDTO[]> {
  const { baseUrl = (import.meta as any).env?.VITE_GRAPH_URL || 'http://localhost:4050', userKey, limit = 3, timeoutMs = 2500, signal } = opts;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/graph/recommendations/${encodeURIComponent(userKey)}?limit=${limit}`, { signal: signal || ac.signal, headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data || !Array.isArray(data.items)) return [];
    return data.items as GraphRecommendationDTO[];
  } finally {
    clearTimeout(timer);
  }
}
