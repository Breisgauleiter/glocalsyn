import { useEffect, useState } from 'react';
import { fetchUserProfile } from '../graph/graphClient';
import type { SCLLevel } from '../../../../../shared/types/src';
import { useAuth } from '../auth/authStore';

export interface Profile {
  name?: string;
  region?: string;
  scl: SCLLevel;
  githubLinked: boolean;
  xp?: number;
  badges?: string[];
  githubRepos?: string[]; // optional per-user repo selection (overrides env if set)
  githubIssueState?: 'open' | 'closed' | 'all'; // optional per-user issue state filter
  githubLabels?: string[]; // optional per-user labels filter
  githubToken?: string; // optional personal token (stored locally only)
}

const DEFAULT_PROFILE: Profile = { scl: 1 as SCLLevel, githubLinked: false, xp: 0, badges: [] };

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    const raw = localStorage.getItem('profile');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Profile>;
        const normalized: Partial<Profile> = {
          ...parsed,
          githubRepos: Array.isArray((parsed as any).githubRepos)
            ? (parsed as any).githubRepos
            : typeof (parsed as any).githubRepos === 'string'
              ? String((parsed as any).githubRepos)
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : parsed.githubRepos,
          githubLabels: Array.isArray((parsed as any).githubLabels)
            ? (parsed as any).githubLabels
            : typeof (parsed as any).githubLabels === 'string'
              ? String((parsed as any).githubLabels)
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : parsed.githubLabels,
        };
        setProfile({ ...DEFAULT_PROFILE, ...normalized });
      } catch { /* ignore */ }
    }
  // Remote hydrate using authenticated user id (fallback to demo-user for tests/guests)
    (async () => {
      try {
    const key = user?.id || 'demo-user';
    const remote = await fetchUserProfile(key);
        if (!remote || cancelled) return;
        setProfile(p => {
          if (p.name && p.name !== 'Demo User') return p; // keep local customized
          const merged = { ...p, name: remote.name };
          localStorage.setItem('profile', JSON.stringify(merged));
          return merged;
        });
      } catch { /* swallow */ }
    })();
  return () => { cancelled = true; };
  }, [user?.id]);

  function update(next: Partial<Profile>) {
    setProfile((p) => {
      const merged = { ...p, ...next };
      localStorage.setItem('profile', JSON.stringify(merged));
      return merged;
    });
  }

  return { profile, update };
}
