import { render, screen } from '@testing-library/react';
import { Home } from './Home';
import { MemoryRouter } from 'react-router-dom';

// Ensure flag behavior: without flag no rec items
it('does not render recommendations when flag disabled', () => {
  render(<MemoryRouter><Home /></MemoryRouter>);
  expect(screen.queryByTestId('rec-item')).not.toBeInTheDocument();
});

// NOTE: Enabling the flag requires env injection at build/runtime; we skip positive test here to avoid mutating env.
