import { render, screen } from '@testing-library/react';
import { Quests } from './Quests';

describe('Quests source badge', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows Local badge for local quest', () => {
    // default profile → only local dummy quest
    render(<Quests />);
    expect(screen.getByTestId('source-badge-local')).toBeInTheDocument();
  });

  it('shows GitHub badge when unlocked and mapped quest present', () => {
    localStorage.setItem('profile', JSON.stringify({ githubLinked: true, scl: 4 }));
    render(<Quests />);
    expect(screen.getByTestId('source-badge-github')).toBeInTheDocument();
  });
});
