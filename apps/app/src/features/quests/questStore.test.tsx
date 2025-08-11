import { renderHook, act } from '@testing-library/react';
import { useQuestStore, getQuestsForProfile } from './questStore';

test('dummy quest flow: available -> accepted -> done', () => {
  const { result } = renderHook(() => useQuestStore());
  // initially
  expect(result.current.quests.length).toBeGreaterThan(0);
  const id = result.current.quests[0].id;
  expect(result.current.status(id)).toBe('available');

  // accept
  act(() => result.current.accept(id));
  expect(result.current.status(id)).toBe('accepted');

  // complete
  act(() => result.current.complete(id));
  expect(result.current.status(id)).toBe('done');
});

test('getQuestsForProfile: SCL1 no GitHub -> dummy quests with complete proof', () => {
  const qs = getQuestsForProfile({ githubLinked: false, scl: 1 });
  expect(qs.length).toBeGreaterThan(0);
  expect(qs[0].proof?.type).toBe('complete');
});

test('getQuestsForProfile: SCL4 with GitHub currently returns list (placeholder)', () => {
  const qs = getQuestsForProfile({ githubLinked: true, scl: 4 });
  expect(qs.length).toBeGreaterThan(0);
  // Expect that at least one quest comes from a GitHub issue mapping
  const ghQuest = qs.find((q) => q.source?.kind === 'github_issue');
  expect(ghQuest).toBeTruthy();
  expect(ghQuest?.proof?.type).toBe('github_pr');
});
