import { render, screen } from '@testing-library/react';
import { click } from '../test/testActions';
import { MemoryRouter } from 'react-router-dom';
import { Quests } from './Quests';

describe('Quests filter persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    // unlock github quests for filtering to have both
    localStorage.setItem('profile', JSON.stringify({ githubLinked: true, scl: 4 }));
  });

  it('loads initial filter from localStorage', () => {
    localStorage.setItem('quests.filter', 'github');
  render(<MemoryRouter><Quests /></MemoryRouter>);
    const githubRadio = screen.getByTestId('filter-github') as HTMLInputElement;
    expect(githubRadio).toBeChecked();
  });

  it('persists filter selection to localStorage', async () => {
  render(<MemoryRouter><Quests /></MemoryRouter>);
  const localRadio = screen.getByTestId('filter-local');
  await click(localRadio);
    expect(localStorage.getItem('quests.filter')).toBe('local');
  });

  it('inline CTA links GitHub from empty state and GitHub quests appear', async () => {
    // ensure profile is NOT linked initially
    localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
  render(<MemoryRouter><Quests /></MemoryRouter>);
    // Switch to GitHub filter (empty state visible)
  await click(screen.getByTestId('filter-github'));
    const cta = await screen.findByTestId('empty-link-github');
  await click(cta);
    // GitHub quest becomes visible
    await screen.findByTestId('source-badge-github');
    // Filter persisted as github (radio onChange persists)
    expect(localStorage.getItem('quests.filter')).toBe('github');
  });
});
