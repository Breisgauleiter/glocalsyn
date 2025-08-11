import { useEffect, useState } from 'react';
import type { QuestDTO, ProofPolicy } from '../../../../../shared/types/src';
import { mapIssueToQuest } from '../../../../../shared/types/src';
import { MOCK_ISSUES } from './mockIssues';
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
    setQuests(getQuestsForProfile({ githubLinked: profile.githubLinked, scl: profile.scl }));
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
