import { useEffect, useState } from 'react';

export type QuestStatus = 'available' | 'accepted' | 'done';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'story';
  minimumSCL?: number;
}

const DUMMY_QUESTS: Quest[] = [
  { id: 'q1', title: 'Begrüße deinen Hub', description: 'Sag Hallo im lokalen Hub‑Channel. Dauer: 1 Minute.', category: 'daily' },
];

export function useQuestStore() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [statusById, setStatusById] = useState<Record<string, QuestStatus>>({});

  useEffect(() => {
    // load quests lazily (client-side mock)
    setQuests(DUMMY_QUESTS);
  }, []);

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
