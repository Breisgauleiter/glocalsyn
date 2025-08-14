import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser } from './authClient';
import { getMe as fetchMe, logout as doLogout } from './authClient';

interface AuthContextValue {
	user: AuthUser | null;
	refresh: () => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
	user: null,
	refresh: async () => {},
	logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthUser | null>(null);

	const refresh = useCallback(async () => {
		try { setUser(await fetchMe()); } catch { /* ignore */ }
	}, []);

	const logout = useCallback(async () => {
		try { await doLogout(); } finally { setUser(null); }
	}, []);

	useEffect(() => { refresh(); }, [refresh]);

	const value = useMemo(() => ({ user, refresh, logout }), [user, refresh, logout]);
	return React.createElement(AuthContext.Provider, { value }, children as React.ReactNode);
}

export function useAuth() { return useContext(AuthContext); }
