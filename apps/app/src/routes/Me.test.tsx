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
});
