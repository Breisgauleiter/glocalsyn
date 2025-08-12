import { render, screen } from '@testing-library/react';
import { click } from '../test/testActions';
import { Quests } from './Quests';
import { MemoryRouter } from 'react-router-dom';

describe('Quests empty state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows GitHub empty state when filter is GitHub but no GitHub quests available', async () => {
    // default profile has no github quests
  render(<MemoryRouter><Quests /></MemoryRouter>);
  await click(screen.getByTestId('filter-github'));
    const empty = screen.getByTestId('empty-state');
    expect(empty).toHaveTextContent(/Keine GitHub‑Quests verfügbar/i);
  });
});
