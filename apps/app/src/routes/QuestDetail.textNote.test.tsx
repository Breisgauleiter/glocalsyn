import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { click, type } from '../test/testActions';
import { QuestDetail } from './QuestDetail';

function Wrapper({ initial }: { initial: string }) {
  return (
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/quests/:id" element={<QuestDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('QuestDetail text_note submission', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
  });

  it('allows submitting text_note proof for q2', async () => {
    render(<Wrapper initial="/quests/q2" />);
  await click(screen.getByTestId('detail-accept'));
  await click(screen.getByTestId('detail-start'));
  await click(screen.getByTestId('toggle-proof'));
    const textarea = screen.getByTestId('proof-note');
  await type(textarea, 'Heute gelernt: Inline UI schneller.');
  await click(screen.getByTestId('submit-proof'));
  await screen.findByText(/Eingereicht/i);
  });
});
