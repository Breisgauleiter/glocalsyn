import { fireEvent, render, screen } from '@testing-library/react';
import { Quests } from './Quests';

function setProfile(v: any) {
  localStorage.setItem('profile', JSON.stringify(v));
}

describe('Quests source filter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('filters to GitHub-only when selected', () => {
    setProfile({ githubLinked: true, scl: 4 });
    render(<Quests />);

    // Default: shows both local and github quests
    expect(screen.getAllByTestId(/quest-item-/i).length).toBeGreaterThan(0);

    const githubRadio = screen.getByTestId('filter-github');
    fireEvent.click(githubRadio);

    // After filtering: only github quests remain
    const items = screen.getAllByTestId(/quest-item-/i);
    for (const el of items) {
      expect(el.getAttribute('data-testid')).toContain('github_issue');
    }
  });

  it('filters to Local-only when selected', () => {
    setProfile({ githubLinked: true, scl: 4 });
    render(<Quests />);

    const localRadio = screen.getByTestId('filter-local');
    fireEvent.click(localRadio);

    const items = screen.getAllByTestId(/quest-item-/i);
    for (const el of items) {
      expect(el.getAttribute('data-testid')).toContain('local');
    }
  });
});
