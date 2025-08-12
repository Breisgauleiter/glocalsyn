import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { click } from '../test/testActions';
import { QuestDetail } from './QuestDetail';

// Helper component to inject a custom quest for testing proof submission
function TestHarness() {
  // We rely on dummy quest q1 having simple check_in proof (legacy complete). Assert simple completion flow.
  return (
    <Routes>
      <Route path="/quests/:id" element={<QuestDetail />} />
    </Routes>
  );
}

describe('QuestDetail proof submission UI', () => {
  beforeEach(() => {
    localStorage.clear();
    // baseline profile to show dummy quest
    localStorage.setItem('profile', JSON.stringify({ githubLinked: false, scl: 1 }));
  });

  it('shows accept then complete flow for simple check_in proof', async () => {
    render(
      <MemoryRouter initialEntries={['/quests/q1']}>
        <TestHarness />
      </MemoryRouter>
    );
  const acceptBtn = screen.getByTestId('detail-accept');
  await click(acceptBtn);
  const completeBtn = screen.getByTestId('detail-complete');
  await click(completeBtn);
    screen.getByText(/Erledigt/);
  });
});
