import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { click, type } from '../test/testActions';
import { QuestDetail } from './QuestDetail';

describe('QuestDetail peer_confirm submission', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
  });

  it('submits peer confirmation for q5', async () => {
    render(
      <MemoryRouter initialEntries={['/quests/q5']}>
        <Routes>
          <Route path="/quests/:id" element={<QuestDetail />} />
        </Routes>
      </MemoryRouter>
    );
    await click(screen.getByTestId('detail-accept'));
    await click(screen.getByTestId('detail-start'));
    await click(screen.getByTestId('toggle-proof'));
    const textarea = screen.getByTestId('proof-peer-note');
    await type(textarea, 'Peer sagt ok');
    await click(screen.getByTestId('submit-proof'));
  await screen.findByText(/Eingereicht/i);
  });
});
