import { renderHook, act } from '@testing-library/react';
import { useQuestStore } from './questStore';

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
