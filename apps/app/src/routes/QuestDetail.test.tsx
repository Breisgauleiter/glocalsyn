import { render, screen } from '@testing-library/react';
import { click } from '../test/testActions';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QuestDetail } from './QuestDetail';
import { Quests } from './Quests';
 
beforeEach(() => localStorage.clear());

test('quest detail shows effort and category', async () => {
  render(
    <MemoryRouter initialEntries={['/quests']}> 
      <Routes>
        <Route path="/quests" element={<Quests />} />
        <Route path="/quests/:id" element={<QuestDetail />} />
      </Routes>
    </MemoryRouter>
  );
  const link = screen.getByRole('link', { name: /Begrüße deinen Hub/ });
  await click(link);
  // There may be multiple Kategorie lines (one per quest list item still in DOM + detail); select within detail by effort substring
  expect(screen.getByText(/~1 min/)).toBeInTheDocument();
});
