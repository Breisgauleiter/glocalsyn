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

const etagCache: Record<string, { etag: string; data: any }> = {};

export async function fetchRecommendations(opts: FetchRecommendationsOptions): Promise<GraphRecommendationDTO[]> {
  const { baseUrl = (import.meta as any).env?.VITE_GRAPH_URL || 'http://localhost:4050', userKey, limit = 3, timeoutMs = 2500, signal } = opts;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const url = `${baseUrl}/graph/recommendations/${encodeURIComponent(userKey)}?limit=${limit}`;
  try {
    const cached = etagCache[url];
    const res = await fetch(url, { signal: signal || ac.signal, headers: { 'Accept': 'application/json', ...(cached ? { 'If-None-Match': cached.etag } : {}) } });
    if (res.status === 304 && cached) return cached.data.items as GraphRecommendationDTO[];
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const etag = (res as any).headers?.get ? (res as any).headers.get('ETag') : undefined;
    const data = await res.json();
    if (etag) etagCache[url] = { etag, data };
    if (!data || !Array.isArray(data.items)) return [];
    return data.items as GraphRecommendationDTO[];
  } finally {
    clearTimeout(timer);
  }
}

// Generic cached fetch (ETag) for other resources if needed later
export async function fetchCachedJson(url: string, opts: { timeoutMs?: number; signal?: AbortSignal } = {}) {
  const { timeoutMs = 2500, signal } = opts;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const cached = etagCache[url];
    const res = await fetch(url, { signal: signal || ac.signal, headers: { 'Accept': 'application/json', ...(cached ? { 'If-None-Match': cached.etag } : {}) } });
    if (res.status === 304 && cached) return cached.data;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const etag = (res as any).headers?.get ? (res as any).headers.get('ETag') : undefined;
    const data = await res.json();
    if (etag) etagCache[url] = { etag, data };
    return data;
  } finally {
    clearTimeout(timer);
  }
}

export interface UserProfile { key: string; name: string; type: string; }
export async function fetchUserProfile(userKey: string, baseUrl = (import.meta as any).env?.VITE_GRAPH_URL || 'http://localhost:4050'): Promise<UserProfile | null> {
  try {
    const data = await fetchCachedJson(`${baseUrl}/profile/${encodeURIComponent(userKey)}`);
    return data?.profile || null;
  } catch {
    return null;
  }
}
