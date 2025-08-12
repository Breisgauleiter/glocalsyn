import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { click } from '../test/testActions';
import { ReviewQueue } from './ReviewQueue';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
});

describe('ReviewQueue filters & rendering', () => {
  it('shows photo proof with filter (seeded state)', async () => {
    localStorage.setItem('quests.state', JSON.stringify({
      statuses: { q4: 'submitted' },
      proofs: { q4: { questId: 'q4', submittedAt: new Date().toISOString(), status: 'pending', data: { photo: 'data:image/png;base64,iVBORw==' } } }
    }));
    render(
      <MemoryRouter initialEntries={['/review']}>
        <Routes>
          <Route path="/review" element={<ReviewQueue />} />
        </Routes>
      </MemoryRouter>
    );
    const items = await screen.findAllByTestId('rq-item');
    expect(items.length).toBe(1);
    await click(screen.getByTestId('rq-filter-photo'));
    expect(screen.getAllByTestId('rq-item').length).toBe(1);
  });
});
