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

test('approve pending proof: transitions to completed & adds reviewer badge', () => {
  // Seed profile so XP / badges updates persist
  localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1, xp: 0, badges: [] }));
  const { result } = renderHook(() => useQuestStore());
  // Use a peer_confirm quest for a non auto-complete proof
  const peerQuest = result.current.quests.find(q => q.proof?.type === 'peer_confirm');
  expect(peerQuest).toBeTruthy();
  const id = peerQuest!.id;
  act(() => result.current.accept(id));
  act(() => result.current.start(id));
  // submit -> goes to submitted + pending
  act(() => result.current.submit(id, { note: 'Looks good' }));
  expect(result.current.status(id)).toBe('submitted');
  // approve -> completed & reviewer badge
  act(() => result.current.approve(id));
  expect(result.current.status(id)).toBe('completed');
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  expect(profile.badges).toContain('reviewer');
});

test('reject pending proof: returns to in_progress and stores rejection note', () => {
  localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1, xp: 0, badges: [] }));
  const { result } = renderHook(() => useQuestStore());
  const textQuest = result.current.quests.find(q => q.proof?.type === 'text_note');
  expect(textQuest).toBeTruthy();
  const id = textQuest!.id;
  act(() => result.current.accept(id));
  act(() => result.current.start(id));
  act(() => result.current.submit(id, { note: 'Draft' }));
  expect(result.current.status(id)).toBe('submitted');
  act(() => result.current.reject(id, 'Needs more detail'));
  expect(result.current.status(id)).toBe('in_progress');
  const state = JSON.parse(localStorage.getItem('quests.state') || '{}');
  expect(state.proofs?.[id]?.status).toBe('rejected');
  expect(state.proofs?.[id]?.note).toBe('Needs more detail');
});

test('XP awarding bumps SCL to 4 when crossing threshold', () => {
  // Seed close-to-threshold xp
  localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1, xp: 45, badges: [] }));
  const { result } = renderHook(() => useQuestStore());
  const simpleQuest = result.current.quests.find(q => ['check_in','complete'].includes(q.proof?.type || ''))!;
  act(() => result.current.accept(simpleQuest.id));
  act(() => result.current.submit(simpleQuest.id)); // auto complete
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  expect(profile.xp).toBe(50);
  expect(profile.scl).toBe(4); // unlocked
});

// badge progression: adjust to explicitly complete five quests and then assert badges
test('five_quests badge awarded when crossing completion threshold (seeded statuses)', () => {
  // Seed 4 completed quests in legacy storage, no badges yet
  localStorage.setItem('quests.state', JSON.stringify({ statuses: { q1: 'completed', q2: 'completed', q3: 'completed', q4: 'completed' } }));
  localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1, xp: 0, badges: ['first_quest'] }));
  const { result } = renderHook(() => useQuestStore());
  // Complete 5th quest (peer_confirm) to cross threshold
  const peer = result.current.quests.find(q => q.id === 'q5')!;
  act(() => { result.current.accept(peer.id); result.current.markCompleted(peer.id); });
  const profile = JSON.parse(localStorage.getItem('profile') || '{}');
  expect(profile.badges).toContain('five_quests');
});

test('legacy status "done" normalizes to completed', () => {
  // Seed legacy status
  localStorage.setItem('quests.state', JSON.stringify({ statuses: { q1: 'done' } }));
  const { result } = renderHook(() => useQuestStore());
  expect(result.current.status('q1')).toBe('completed');
});
