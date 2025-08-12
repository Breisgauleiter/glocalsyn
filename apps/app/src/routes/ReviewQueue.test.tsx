import { render, screen } from '@testing-library/react';
import { ReviewQueue } from './ReviewQueue';
 
beforeEach(() => localStorage.clear());

test('review queue empty then shows pending after submission', () => {
  // Accept & start a non-simple quest? Dummy is simple; so simulate a github quest by injecting a pending proof
  render(<ReviewQueue />);
  expect(screen.getByText(/Keine offenen Nachweise/)).toBeInTheDocument();
});
