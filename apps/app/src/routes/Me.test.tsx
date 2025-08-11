import { fireEvent, render, screen } from '@testing-library/react';
import { Me } from './Me';

function resetProfile() {
  localStorage.removeItem('profile');
}

describe('Me route – Link GitHub stub', () => {
  beforeEach(() => {
    resetProfile();
  });

  it('shows current SCL and GitHub link state', () => {
    render(<Me />);
    expect(screen.getByText(/SCL/i)).toBeInTheDocument();
    expect(screen.getByText(/Nicht verknüpft/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GitHub verknüpfen/i })).toBeInTheDocument();
  });

  it('when clicking Link GitHub, persists githubLinked=true and scl>=4', () => {
    render(<Me />);
    const btn = screen.getByTestId('link-github');
    fireEvent.click(btn);

    const raw = localStorage.getItem('profile');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.githubLinked).toBe(true);
    expect(parsed.scl).toBeGreaterThanOrEqual(4);
  });

  it('shows validation error for invalid repo format and does not persist', () => {
    render(<Me />);
    // Link first to reveal settings
    fireEvent.click(screen.getByTestId('link-github'));
    const input = screen.getByLabelText(/Repos \(owner\/name/i);
    fireEvent.change(input, { target: { value: 'invalid-format' } });
    fireEvent.click(screen.getByRole('button', { name: /Speichern/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Ungültiges Format');
    const parsed = JSON.parse(localStorage.getItem('profile')!);
    expect(parsed.githubRepos || []).toEqual([]);
  });
});
