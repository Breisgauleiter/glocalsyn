import { useEffect, useState } from 'react';
import type { QuestDTO, ProofPolicy } from '../../../../../shared/types/src';
import { mapIssueToQuest } from '../../../../../shared/types/src';
import { MOCK_ISSUES } from './mockIssues';
import { isGithubAdapterEnabled, createGithubAdapterFromEnv } from './githubAdapter';
import { useProfile } from '../profile/profileStore';
import type { Profile } from '../profile/profileStore';

export type QuestStatus = 'available' | 'accepted' | 'done';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'story';
  minimumSCL?: number;
  proof?: ProofPolicy;
  source?: QuestDTO['source'];
}

const DUMMY_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Begrüße deinen Hub',
    description: 'Sag Hallo im lokalen Hub‑Channel. Dauer: 1 Minute.',
    category: 'daily',
    proof: { type: 'complete', description: 'Nachweis: Quest abgeschlossen (SCL 1–3)' },
  },
];

export function getQuestsForProfile(opts: { githubLinked: boolean; scl: number }): Quest[] {
  // For SCL < 4 or no GitHub link, only dummy quests
  if (!opts.githubLinked || opts.scl < 4) return DUMMY_QUESTS;
  // For SCL >= 4 and linked, merge in mapped GitHub issues (mocked for now)
  const fromIssues: Quest[] = MOCK_ISSUES.map((iss) => {
    const q = mapIssueToQuest(iss) as QuestDTO;
    return {
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      minimumSCL: q.minimumSCL,
      proof: q.proof,
      source: q.source,
    } satisfies Quest;
  });
  return [...DUMMY_QUESTS, ...fromIssues];
}

export function useQuestStore(profileOverride?: Profile) {
  const { profile: profileFromHook } = useProfile();
  const profile = profileOverride ?? profileFromHook;
  const [quests, setQuests] = useState<Quest[]>([]);
  const [statusById, setStatusById] = useState<Record<string, QuestStatus>>({});

  useEffect(() => {
    // Always set a fast, synchronous baseline first (mock path / local)
    setQuests(getQuestsForProfile({ githubLinked: profile.githubLinked, scl: profile.scl }));

    // If SCL >= 4, GitHub is linked, and the adapter is enabled via env, try to load real issues
    let cancelled = false;
    const canUseAdapter = profile.githubLinked && profile.scl >= 4 && isGithubAdapterEnabled();
    if (!canUseAdapter) return;

  const profileRepos = Array.isArray((profile as any).githubRepos) ? (profile as any).githubRepos as string[] : undefined;
  const envAny = (import.meta as any)?.env ?? (typeof process !== 'undefined' ? (process.env as any) : {});
  const reposRaw = envAny.VITE_GITHUB_REPOS as string | undefined;
  const reposFromEnv = (reposRaw ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const repos = (profileRepos && profileRepos.length > 0) ? profileRepos : reposFromEnv;
    if (repos.length === 0) return; // no configured repos -> keep baseline

    const adapter = createGithubAdapterFromEnv();
    adapter
      .listIssues(repos)
      .then((items) => {
        if (cancelled) return;
        const mapped = items.map((iss) => {
          const q = mapIssueToQuest(iss) as QuestDTO;
          return {
            id: q.id,
            title: q.title,
            description: q.description,
            category: q.category,
            minimumSCL: q.minimumSCL,
            proof: q.proof,
            source: q.source,
          } as Quest;
        });
        // Always keep dummy quests first to preserve onboarding path
        setQuests([...DUMMY_QUESTS, ...mapped]);
      })
      .catch(() => {
        // Best-effort: ignore errors and keep baseline
      });

    return () => {
      cancelled = true;
    };
  }, [profile.githubLinked, profile.scl]);

  function accept(id: string) {
    setStatusById((s) => ({ ...s, [id]: 'accepted' }));
  }
  function complete(id: string) {
    setStatusById((s) => ({ ...s, [id]: 'done' }));
  }

  function status(id: string): QuestStatus {
    return statusById[id] ?? 'available';
  }

  return { quests, status, accept, complete };
}
