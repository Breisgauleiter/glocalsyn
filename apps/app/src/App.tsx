import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Background } from './components/Background';

export function App() {
  return (
    <div className="app-shell">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">Zum Inhalt springen</a>
      <Background />
      <header className="app-header glass-surface glass-header" role="banner">
        <strong>Syntopia</strong>
        <nav aria-label="Sekundärnavigation">
          {/* ... could add language toggle or help later ... */}
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
