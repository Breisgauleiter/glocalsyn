import { render, screen } from '@testing-library/react';
import { click } from '../test/testActions';
import { MemoryRouter } from 'react-router-dom';
import { Quests } from './Quests';

function setProfile(v: any) {
  localStorage.setItem('profile', JSON.stringify(v));
}

describe('Quests source filter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('filters to GitHub-only when selected', async () => {
    setProfile({ githubLinked: true, scl: 4 });
  render(<MemoryRouter><Quests /></MemoryRouter>);

    // Default: shows both local and github quests
    expect(screen.getAllByTestId(/quest-item-/i).length).toBeGreaterThan(0);

  const githubRadio = screen.getByTestId('filter-github');
  await click(githubRadio);

    // After filtering: only github quests remain
    const items = screen.getAllByTestId(/quest-item-/i);
    for (const el of items) {
      expect(el).toHaveAttribute('data-testid', expect.stringContaining('github_issue'));
    }
  });

  it('filters to Local-only when selected', async () => {
    setProfile({ githubLinked: true, scl: 4 });
  render(<MemoryRouter><Quests /></MemoryRouter>);

  const localRadio = screen.getByTestId('filter-local');
  await click(localRadio);

    const items = screen.getAllByTestId(/quest-item-/i);
    for (const el of items) {
      expect(el).toHaveAttribute('data-testid', expect.stringContaining('local'));
    }
  });
});
