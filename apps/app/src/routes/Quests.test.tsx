import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Quests } from './Quests';

function setProfile(v: any) {
  localStorage.setItem('profile', JSON.stringify(v));
}

describe('Quests notice for GitHub unlock', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not show unlock notice by default', () => {
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Quests /></MemoryRouter>);
  expect(screen.queryByText(/GitHub‑Quests freigeschaltet/i)).not.toBeInTheDocument();
  });

  it('shows unlock notice when githubLinked and scl>=4', () => {
    setProfile({ githubLinked: true, scl: 4 });
  render(<MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}><Quests /></MemoryRouter>);
    expect(screen.getByText(/GitHub‑Quests freigeschaltet/i)).toBeInTheDocument();
  });
});
