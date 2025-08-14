import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Background } from './components/Background';
import { useAuth } from './features/auth/authStore';

export function App() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
  <a href="#main-content" className="skip-link">Zum Inhalt springen</a>
      <Background />
      <header className="app-header glass-surface glass-header" role="banner">
        <strong>Syntopia</strong>
        <nav aria-label="Sekundärnavigation">
          <ul style={{ display: 'flex', gap: 12, listStyle: 'none', margin: 0, padding: 0 }}>
            {user ? (
              <>
                <li aria-live="polite">Hallo, <strong>{user.displayName || user.id}</strong></li>
                <li><button className="btn btn-sm" onClick={() => logout()}>Logout</button></li>
              </>
            ) : (
              <li><NavLink to="/login" className={({ isActive }) => isActive ? 'active' : undefined}>Login</NavLink></li>
            )}
          </ul>
        </nav>
      </header>
  <main id="main-content" className="app-main">
        <Outlet />
      </main>
      <footer className="footer glass-surface glass-footer" aria-hidden>
        <div className="horizon" />
        <img className="tree" src={new URL('./assets/tree.png', import.meta.url).toString()} alt="" />
        <small>Made with care • Syntopia</small>
      </footer>
      <nav aria-label="Hauptnavigation" className="app-nav glass-surface">
        <ul className="app-tabs">
          <li><NavLink to="/" aria-label="Home" className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink></li>
          <li><NavLink to="/quests" aria-label="Quests" className={({ isActive }) => isActive ? 'active' : undefined}>Quests</NavLink></li>
          <li><NavLink to="/map" aria-label="Karte" className={({ isActive }) => isActive ? 'active' : undefined}>Map</NavLink></li>
          <li><NavLink to="/hubs" aria-label="Hubs" className={({ isActive }) => isActive ? 'active' : undefined}>Hubs</NavLink></li>
          <li><NavLink to="/me" aria-label="Ich" className={({ isActive }) => isActive ? 'active' : undefined}>Ich</NavLink></li>
        </ul>
      </nav>
    </div>
  );
}
