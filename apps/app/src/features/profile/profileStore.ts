import { useEffect, useState } from 'react';
import type { SCLLevel } from '../../../../../shared/types/src';

export interface Profile {
  name?: string;
  region?: string;
  scl: SCLLevel;
  githubLinked: boolean;
  githubRepos?: string[]; // optional per-user repo selection (overrides env if set)
  githubIssueState?: 'open' | 'closed' | 'all'; // optional per-user issue state filter
  githubLabels?: string[]; // optional per-user labels filter
  githubToken?: string; // optional personal token (stored locally only)
}

const DEFAULT_PROFILE: Profile = { scl: 1 as SCLLevel, githubLinked: false };

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    const raw = localStorage.getItem('profile');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Profile>;
        // Normalize githubRepos if someone stored a string earlier
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
      } catch {}
    }
  }, []);

  function update(next: Partial<Profile>) {
    setProfile((p) => {
      const merged = { ...p, ...next };
      localStorage.setItem('profile', JSON.stringify(merged));
      return merged;
    });
  }

  return { profile, update };
}
