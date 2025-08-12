import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { click, type } from '../test/testActions';
import { QuestDetail } from './QuestDetail';

function mount(id: string) {
  return render(
    <MemoryRouter initialEntries={[`/quests/${id}`]}>
      <Routes>
        <Route path="/quests/:id" element={<QuestDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('QuestDetail consolidated flows', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
  });

  it('check_in quest: accept -> complete', async () => {
    mount('q1');
    await click(screen.getByTestId('detail-accept'));
    await click(screen.getByTestId('detail-complete'));
    screen.getByText(/Erledigt/i);
  });

  it('text_note quest: accept -> start -> submit note', async () => {
    mount('q2');
    await click(screen.getByTestId('detail-accept'));
    await click(screen.getByTestId('detail-start'));
    await click(screen.getByTestId('toggle-proof'));
    await type(screen.getByTestId('proof-note'), 'Kurze Notiz.');
    await click(screen.getByTestId('submit-proof'));
    await screen.findByText(/Eingereicht/i);
  });

  it('link quest: accept -> start -> submit link', async () => {
    mount('q3');
    await click(screen.getByTestId('detail-accept'));
    await click(screen.getByTestId('detail-start'));
    await click(screen.getByTestId('toggle-proof'));
    await type(screen.getByTestId('proof-link'), 'https://example.org');
    await click(screen.getByTestId('submit-proof'));
    await screen.findByText(/Eingereicht/i);
  });

  it('peer_confirm quest: accept -> start -> submit peer note', async () => {
    mount('q5');
    await click(screen.getByTestId('detail-accept'));
    await click(screen.getByTestId('detail-start'));
    await click(screen.getByTestId('toggle-proof'));
    await type(screen.getByTestId('proof-peer-note'), 'Peer ok');
    await click(screen.getByTestId('submit-proof'));
    await screen.findByText(/Eingereicht/i);
  });
});
