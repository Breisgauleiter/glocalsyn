import { useEffect, useState } from 'react';
import type { QuestDTO, ProofPolicy, ProofSubmission } from '../../../../../shared/types/src';
import { mapIssueToQuest } from '../../../../../shared/types/src';
import { MOCK_ISSUES } from './mockIssues';
import { isGithubAdapterEnabled, createGithubAdapterFromEnv, RealGithubAdapter } from './githubAdapter';
import { useProfile } from '../profile/profileStore';
import type { Profile } from '../profile/profileStore';

// Sprint 2: richer lifecycle (available -> accepted -> in_progress -> submitted -> completed)
// Backwards compatibility: expose 'done' as alias of 'completed' for older callers.
export type QuestStatus = 'available' | 'accepted' | 'in_progress' | 'submitted' | 'completed' | 'done';

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'story';
  minimumSCL?: number;
  proof?: ProofPolicy;
  source?: QuestDTO['source'];
  effortMinutes?: number; // optional quick effort indicator
}

const DUMMY_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Begrüße deinen Hub',
    description: 'Sag Hallo im lokalen Hub‑Channel. Dauer: 1 Minute.',
    category: 'daily',
  proof: { type: 'check_in', description: 'Check-in: Einfach abschließen (SCL 1–3)' },
  effortMinutes: 1,
  },
  {
    id: 'q2',
    title: 'Teile eine kurze Lern-Notiz',
    description: 'Schreib eine 1‑Satz Notiz was du heute gelernt hast.',
    category: 'daily',
    proof: { type: 'text_note', description: 'Kurze Notiz als Text.' },
    effortMinutes: 2,
  },
  {
    id: 'q3',
    title: 'Empfehlenswerten Link teilen',
    description: 'Teile einen hilfreichen Artikel oder Resource-Link (öffentlich zugänglich).',
    category: 'weekly',
    proof: { type: 'link', description: 'Öffentlicher URL-Link zur Ressource.' },
    effortMinutes: 3,
  },
  {
    id: 'q4',
    title: 'Foto vom Lernort hochladen',
    description: 'Mach ein Foto deines aktuellen Lern-/Projekt-Setups (keine Personen, datensparsam).',
    category: 'weekly',
    proof: { type: 'photo', description: 'Foto hochladen (Client-seitig gespeichert).' },
    effortMinutes: 2,
  },
  {
    id: 'q5',
    title: 'Hole dir eine Peer-Bestätigung',
    description: 'Bitte eine andere Person deinen Fortschritt kurz zu bestätigen (offline / Chat).',
    category: 'story',
    proof: { type: 'peer_confirm', description: 'Peer bestätigt (Review Queue).' },
    effortMinutes: 4,
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
  // Synchronous hydration to avoid race when navigating between routes before effect runs
  const [statusById, setStatusById] = useState<Record<string, QuestStatus>>(() => {
    try {
      const raw = localStorage.getItem('quests.state');
      if (raw) {
        const parsed = JSON.parse(raw) as { statuses?: Record<string, QuestStatus>; proofs?: Record<string, ProofSubmission> };
        return parsed.statuses ?? {};
      }
    } catch { /* ignore */ }
    return {};
  });
  const [proofs, setProofs] = useState<Record<string, ProofSubmission>>(() => {
    try {
      const raw = localStorage.getItem('quests.state');
      if (raw) {
        const parsed = JSON.parse(raw) as { statuses?: Record<string, QuestStatus>; proofs?: Record<string, ProofSubmission> };
        return parsed.proofs ?? {};
      }
    } catch { /* ignore */ }
    return {};
  });

  // Load persisted state once (kept for backward compatibility / future migration refresh)
  useEffect(() => {
    // No-op: already hydrated synchronously; could refresh if schema evolves
  }, []);

  // Persist on change (throttle negligible for small state)
  useEffect(() => {
    try {
      localStorage.setItem('quests.state', JSON.stringify({ statuses: statusById, proofs }));
    } catch { /* ignore */ }
  }, [statusById, proofs]);

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

    // If profile provides user token/state/labels, create a custom adapter
    const hasUserPrefs = Boolean((profile as any).githubToken || (profile as any).githubIssueState || (profile as any).githubLabels);
    const effectiveAdapter = hasUserPrefs
      ? new RealGithubAdapter({
          token: (profile as any).githubToken,
          perRepoLimit: undefined,
          state: (profile as any).githubIssueState,
          labels: (profile as any).githubLabels,
        })
      : createGithubAdapterFromEnv();
    effectiveAdapter
      .listIssues(repos)
      .then((items: import('../../../../../shared/types/src').GitHubIssueLite[]) => {
        if (cancelled) return;
        const mapped = items.map((iss: import('../../../../../shared/types/src').GitHubIssueLite) => {
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
  // Depend on the full profile so changes to repos/token/labels also refresh adapter data
  }, [profile]);

  function status(id: string): QuestStatus {
    const st = statusById[id] ?? 'available';
    return st === 'done' ? 'completed' : st; // normalize legacy
  }

  function accept(id: string) {
    setStatusById((s) => {
      const cur = s[id] ?? 'available';
      if (cur !== 'available') return s; // guard
      return { ...s, [id]: 'accepted' };
    });
  }
  function start(id: string) {
    setStatusById((s) => {
      const cur = status(id);
      if (cur !== 'accepted') return s;
      return { ...s, [id]: 'in_progress' };
    });
  }
  const XP_BY_TYPE: Record<string, number> = {
    check_in: 5,
    complete: 5, // legacy
    text_note: 8,
    link: 8,
    photo: 9,
    peer_confirm: 10,
    github_pr: 15,
  };

  function submit(id: string, proofData?: unknown) {
    const quest = quests.find(q => q.id === id);
    const proofType = quest?.proof?.type;
    // Treat legacy 'complete' and new 'check_in' as instant complete
    if (proofType === 'complete' || proofType === 'check_in') {
      markCompleted(id);
      return;
    }
    setStatusById((s) => {
      const cur = status(id);
      if (cur !== 'in_progress' && cur !== 'accepted') return s;
      return { ...s, [id]: 'submitted' };
    });
  if (quest && quest.proof) {
      setProofs(p => ({
        ...p,
        [id]: {
          questId: id,
          submittedAt: new Date().toISOString(),
          data: proofData,
          status: 'pending',
        }
      }));
    }
  }
  function markCompleted(id: string) {
    setStatusById((s) => {
      const cur = status(id);
      // Allow completion from accepted (for simple "complete" proof) or submitted (after review) or in_progress (auto-complete type)
      if (!['accepted', 'submitted', 'in_progress'].includes(cur)) return s;
      return { ...s, [id]: 'completed' };
    });
    // Award simple XP locally (placeholder logic)
    try {
      const raw = localStorage.getItem('profile');
      if (raw) {
        const parsed = JSON.parse(raw);
        const quest = quests.find(q => q.id === id);
        const t = quest?.proof?.type ?? 'check_in';
        const gained = XP_BY_TYPE[t] ?? 5;
        parsed.xp = (parsed.xp ?? 0) + gained;
        // Simple SCL bump every 50 XP (placeholder rule)
        if (parsed.xp >= 50 && (parsed.scl ?? 1) < 4) {
          parsed.scl = 4; // unlock GitHub by XP path
        }
  // Badge logic
  parsed.badges = Array.isArray(parsed.badges) ? parsed.badges : [];
  const completedCount = Object.values({ ...statusById, [id]: 'completed' }).filter(v => v === 'completed').length;
  if (completedCount >= 1 && !parsed.badges.includes('first_quest')) parsed.badges.push('first_quest');
  if (completedCount >= 5 && !parsed.badges.includes('five_quests')) parsed.badges.push('five_quests');
        localStorage.setItem('profile', JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
  }
  // Legacy API: complete() -> markCompleted
  function complete(id: string) { markCompleted(id); }

  function approve(id: string) {
    setProofs(p => {
      const cur = p[id];
      if (!cur || cur.status !== 'pending') return p;
      return { ...p, [id]: { ...cur, status: 'approved' } };
    });
    markCompleted(id);
    try {
      const raw = localStorage.getItem('profile');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.badges = Array.isArray(parsed.badges) ? parsed.badges : [];
        if (!parsed.badges.includes('reviewer')) parsed.badges.push('reviewer');
        localStorage.setItem('profile', JSON.stringify(parsed));
      }
    } catch { /* ignore */ }
  }
  function reject(id: string, note?: string) {
    setProofs(p => {
      const cur = p[id];
      if (!cur || cur.status !== 'pending') return p;
      return { ...p, [id]: { ...cur, status: 'rejected', note } };
    });
    // Optionally revert status back to in_progress for resubmission
    setStatusById(s => {
      const cur = status(id);
      if (cur !== 'submitted') return s;
      return { ...s, [id]: 'in_progress' };
    });
  }

  return { quests, status, accept, start, submit, markCompleted, complete, proofs, approve, reject };
}
