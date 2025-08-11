import { fireEvent, render, screen } from '@testing-library/react';
import { Quests } from './Quests';

describe('Quests empty state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows GitHub empty state when filter is GitHub but no GitHub quests available', () => {
    // default profile has no github quests
    render(<Quests />);
    fireEvent.click(screen.getByTestId('filter-github'));
    const empty = screen.getByTestId('empty-state');
    expect(empty).toHaveTextContent(/Keine GitHub‑Quests verfügbar/i);
  });
});
