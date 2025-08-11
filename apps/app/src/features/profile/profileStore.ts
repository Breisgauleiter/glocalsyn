import { useEffect, useState } from 'react';
import type { SCLLevel } from '../../../../../shared/types/src';

export interface Profile {
  name?: string;
  region?: string;
  scl: SCLLevel;
  githubLinked: boolean;
}

const DEFAULT_PROFILE: Profile = { scl: 1 as SCLLevel, githubLinked: false };

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    const raw = localStorage.getItem('profile');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<Profile>;
        setProfile({ ...DEFAULT_PROFILE, ...parsed });
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
