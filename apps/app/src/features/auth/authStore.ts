import { useState } from 'react';

export function useAuthMock() {
  const [user, setUser] = useState<{ id: string; name?: string; region?: string } | null>(null);
  const login = (name: string) => setUser({ id: 'u1', name });
  const logout = () => setUser(null);
  return { user, login, logout };
}
