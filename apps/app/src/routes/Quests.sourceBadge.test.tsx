import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Quests } from './Quests';

describe('Quests source badge', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows Local badge for at least one local quest', () => {
    render(<MemoryRouter><Quests /></MemoryRouter>);
    const locals = screen.getAllByTestId('source-badge-local');
    expect(locals.length).toBeGreaterThan(0);
  });

  it('shows GitHub badge when unlocked and mapped quest present', () => {
    localStorage.setItem('profile', JSON.stringify({ githubLinked: true, scl: 4 }));
  render(<MemoryRouter><Quests /></MemoryRouter>);
    expect(screen.getByTestId('source-badge-github')).toBeInTheDocument();
  });
});
