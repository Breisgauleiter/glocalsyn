import { fireEvent, render, screen } from '@testing-library/react';
import { Quests } from './Quests';

describe('Quests filter persistence', () => {
  beforeEach(() => {
    localStorage.clear();
    // unlock github quests for filtering to have both
    localStorage.setItem('profile', JSON.stringify({ githubLinked: true, scl: 4 }));
  });

  it('loads initial filter from localStorage', () => {
    localStorage.setItem('quests.filter', 'github');
    render(<Quests />);
    const githubRadio = screen.getByTestId('filter-github') as HTMLInputElement;
    expect(githubRadio.checked).toBe(true);
  });

  it('persists filter selection to localStorage', () => {
    render(<Quests />);
    const localRadio = screen.getByTestId('filter-local');
    fireEvent.click(localRadio);
    expect(localStorage.getItem('quests.filter')).toBe('local');
  });

  it('inline CTA links GitHub from empty state and GitHub quests appear', async () => {
    // ensure profile is NOT linked initially
    localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
    render(<Quests />);
    // Switch to GitHub filter (empty state visible)
    fireEvent.click(screen.getByTestId('filter-github'));
    const cta = await screen.findByTestId('empty-link-github');
    fireEvent.click(cta);
    // GitHub quest becomes visible
    await screen.findByTestId('source-badge-github');
    // Filter persisted as github (radio onChange persists)
    expect(localStorage.getItem('quests.filter')).toBe('github');
  });
});
