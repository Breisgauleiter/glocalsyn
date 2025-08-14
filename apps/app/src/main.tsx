import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { Home } from './routes/Home';
import { Quests } from './routes/Quests';
import { Map } from './routes/Map';
import { ReviewQueue } from './routes/ReviewQueue';
import { QuestDetail } from './routes/QuestDetail';
import { Hubs } from './routes/Hubs';
import { Me } from './routes/Me';
import { Login } from './features/auth/Login';
import { ProfileWizard } from './features/profile/ProfileWizard';
import './styles/global.css';
import { configureFlush, getBuffer, clearBuffer } from './utils/telemetry';
import { getMe, logout as authLogout } from './features/auth/authClient';
import { AuthProvider } from './features/auth/authStore';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'profile-setup', element: <ProfileWizard /> },
      { path: 'quests', element: <Quests /> },
  { path: 'quests/:id', element: <QuestDetail /> },
      { path: 'map', element: <Map /> },
      { path: 'hubs', element: <Hubs /> },
      { path: 'me', element: <Me /> },
  { path: 'review', element: <ReviewQueue /> },
    ],
  },
], {
  // Cast to any to allow early opt-in flags even if current @types/react-router-dom version lacks them
  future: ({
    v7_startTransition: true,
    v7_relativeSplatPath: true
  } as any)
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);

// Telemetry sink configuration (frontend adoption)
// If VITE_TELEMETRY_URL is set, periodically flush buffered events using sendBeacon/fetch fallback.
try {
  const url = (import.meta as any).env?.VITE_TELEMETRY_URL as string | undefined;
  if (url) {
    const send = (events: any[]) => {
      const body = JSON.stringify({ events });
      if ('sendBeacon' in navigator) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        // Fire and forget
        fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body }).catch(() => {});
      }
    };
    configureFlush(30000, send); // 30s batch
    // Flush on page hide/unload to avoid data loss
    const onHide = () => {
      const buf = getBuffer();
      if (buf.length) { send(buf); clearBuffer(); }
    };
    window.addEventListener('pagehide', onHide);
    window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') onHide(); });
  }
} catch {
  // ignore sink setup errors
}

// Attempt to bootstrap session on load (optional; components can also call getMe())
getMe().catch(() => {});

// Expose logout for quick wiring in Me route via window (optional dev convenience)
(window as any).__syntopiaLogout = () => authLogout();
