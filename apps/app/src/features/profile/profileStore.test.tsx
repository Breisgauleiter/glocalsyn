import { renderHook, act } from '@testing-library/react';
import { useProfile } from './profileStore';

describe('useProfile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads defaults and updates/persists profile', () => {
    const { result } = renderHook(() => useProfile());
    expect(result.current.profile.scl).toBe(1);
    expect(result.current.profile.githubLinked).toBe(false);

    act(() => {
      result.current.update({ githubLinked: true, scl: 4 as any });
    });

    expect(result.current.profile.githubLinked).toBe(true);
    const raw = localStorage.getItem('profile');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({ githubLinked: true, scl: 4 });
  });
});
