import { render, screen } from '@testing-library/react';
import { Quests } from './Quests';

function setProfile(v: any) {
  localStorage.setItem('profile', JSON.stringify(v));
}

describe('Quests notice for GitHub unlock', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not show unlock notice by default', () => {
    render(<Quests />);
    expect(screen.queryByText(/GitHub‑Quests freigeschaltet/i)).toBeNull();
  });

  it('shows unlock notice when githubLinked and scl>=4', () => {
    setProfile({ githubLinked: true, scl: 4 });
    render(<Quests />);
    expect(screen.getByText(/GitHub‑Quests freigeschaltet/i)).toBeInTheDocument();
  });
});
