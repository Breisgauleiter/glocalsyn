import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export function App() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <nav aria-label="Hauptnavigation" style={{ borderTop: '1px solid #e5e7eb' }}>
        <ul style={{ display: 'flex', margin: 0, padding: '8px 0', listStyle: 'none', justifyContent: 'space-around' }}>
          <li><NavLink to="/" aria-label="Home">Home</NavLink></li>
          <li><NavLink to="/quests" aria-label="Quests">Quests</NavLink></li>
          <li><NavLink to="/map" aria-label="Karte">Map</NavLink></li>
          <li><NavLink to="/hubs" aria-label="Hubs">Hubs</NavLink></li>
          <li><NavLink to="/me" aria-label="Ich">Ich</NavLink></li>
        </ul>
      </nav>
    </div>
  );
}
