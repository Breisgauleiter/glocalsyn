// Auth client for magic-link flow against @syntopia/auth-service
// Uses same-origin paths assuming Vite proxy for /auth and /me

export interface AuthUser { id: string; displayName?: string; locale?: string; scl?: number; flags?: Record<string, any>; }

export async function requestMagicLink(email: string): Promise<{ devToken?: string } | { ok: true }> {
  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });
  if (res.status === 204) return { ok: true } as any;
  if (res.headers.get('content-type')?.includes('application/json')) {
    const data = await res.json().catch(() => ({}));
    if ((data as any)?.token) return { devToken: (data as any).token };
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { ok: true } as any;
}

export async function consumeMagicLink(token: string): Promise<AuthUser> {
  const res = await fetch('/auth/magic-link/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data as any).user as AuthUser;
}

export async function getMe(): Promise<AuthUser | null> {
  const res = await fetch('/me', { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data as any).user as AuthUser;
}

export async function logout(): Promise<void> {
  await fetch('/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
}

export async function registerCredentials(username: string, email: string, password: string): Promise<AuthUser> {
  const res = await fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data as any).user as AuthUser;
}

export async function loginCredentials(id: string, password: string): Promise<AuthUser> {
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, password }),
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data as any).user as AuthUser;
}
