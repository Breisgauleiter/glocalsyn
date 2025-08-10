import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { Home } from './routes/Home';
import { Quests } from './routes/Quests';
import { Map } from './routes/Map';
import { Hubs } from './routes/Hubs';
import { Me } from './routes/Me';
import { Login } from './features/auth/Login';
import { ProfileWizard } from './features/profile/ProfileWizard';
import './styles/global.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'profile-setup', element: <ProfileWizard /> },
      { path: 'quests', element: <Quests /> },
      { path: 'map', element: <Map /> },
      { path: 'hubs', element: <Hubs /> },
      { path: 'me', element: <Me /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
