import { renderHook, act } from '@testing-library/react';
import { useQuestStore, getQuestsForProfile } from './questStore';

beforeEach(() => {
  localStorage.clear();
});

test('dummy quest flow: available -> accepted -> completed via simple proof submit', () => {
  const { result } = renderHook(() => useQuestStore());
  // initially
  expect(result.current.quests.length).toBeGreaterThan(0);
  const id = result.current.quests[0].id;
  expect(result.current.status(id)).toBe('available');

  // accept
  act(() => result.current.accept(id));
  expect(result.current.status(id)).toBe('accepted');
  // submit directly (simple 'complete' proof auto-completes)
  act(() => result.current.submit(id));
  expect(result.current.status(id)).toBe('completed');
});

test('getQuestsForProfile: SCL1 no GitHub -> dummy quests with check_in proof', () => {
  const qs = getQuestsForProfile({ githubLinked: false, scl: 1 });
  expect(qs.length).toBeGreaterThan(0);
  expect(['check_in','complete']).toContain(qs[0].proof?.type as any);
});

test('getQuestsForProfile: SCL4 with GitHub currently returns list (placeholder)', () => {
  const qs = getQuestsForProfile({ githubLinked: true, scl: 4 });
  expect(qs.length).toBeGreaterThan(0);
  // Expect that at least one quest comes from a GitHub issue mapping
  const ghQuest = qs.find((q) => q.source?.kind === 'github_issue');
  expect(ghQuest).toBeTruthy();
  expect(ghQuest?.proof?.type).toBe('github_pr');
});

test('guards: cannot submit before accept; start optional for simple proof', () => {
  const { result } = renderHook(() => useQuestStore());
  const id = result.current.quests[0].id;
  // invalid submit (ignored)
  act(() => result.current.submit(id));
  expect(result.current.status(id)).toBe('available');
  // invalid start (ignored)
  act(() => result.current.start(id));
  expect(result.current.status(id)).toBe('available');
  // accept -> submit (auto complete)
  act(() => result.current.accept(id));
  act(() => result.current.submit(id));
  expect(result.current.status(id)).toBe('completed');
});

test('photo proof: accepted -> submitted (pending review) with seeded data', () => {
  const { result } = renderHook(() => useQuestStore());
  // find photo quest (q4 per dummy data)
  const photoQuest = result.current.quests.find(q => q.proof?.type === 'photo');
  expect(photoQuest).toBeTruthy();
  const id = photoQuest!.id;

  act(() => result.current.accept(id));
  expect(result.current.status(id)).toBe('accepted');

  // seed a minimal photo data URL to simulate resized image
  const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
  act(() => result.current.submit(id, { photo: dataUrl }));

  // photo proofs require review: status should be submitted, and proof stored as pending
  expect(result.current.status(id)).toBe('submitted');
  const state = JSON.parse(localStorage.getItem('quests.state') || '{}');
  expect(state.proofs?.[id]?.data?.photo).toBe(dataUrl);
  expect(state.proofs?.[id]?.status).toBe('pending');
});
