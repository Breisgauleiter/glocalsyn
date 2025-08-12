import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { click, type } from '../test/testActions';
import { QuestDetail } from './QuestDetail';

describe('QuestDetail link proof submission', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
  });

  it('submits link proof for q3', async () => {
    render(
      <MemoryRouter initialEntries={['/quests/q3']}>
        <Routes>
          <Route path="/quests/:id" element={<QuestDetail />} />
        </Routes>
      </MemoryRouter>
    );
  await click(screen.getByTestId('detail-accept'));
  await click(screen.getByTestId('detail-start'));
  await click(screen.getByTestId('toggle-proof'));
    const urlInput = screen.getByTestId('proof-link');
  await type(urlInput, 'https://example.com/article');
  await click(screen.getByTestId('submit-proof'));
  await screen.findByText(/Eingereicht/i);
  });
});
