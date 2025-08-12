import { render, screen } from '@testing-library/react';
import { click } from '../test/testActions';
import { MemoryRouter } from 'react-router-dom';
import { Quests } from './Quests';

describe('Quests empty-state CTA (link GitHub)', () => {
  beforeEach(() => {
    localStorage.clear();
    // default profile is unlocked false
  });

  it('shows CTA in GitHub filter and reveals GitHub quests after clicking', async () => {
  render(<MemoryRouter><Quests /></MemoryRouter>);
    // switch to GitHub filter
  await click(screen.getByTestId('filter-github'));
    // CTA should appear
    const cta = screen.getByTestId('empty-link-github');
    expect(cta).toBeInTheDocument();

    // Click CTA to link
  await click(cta);

  // After linking, wait for GitHub quest to appear
  await screen.findByTestId('source-badge-github');
  });
});
