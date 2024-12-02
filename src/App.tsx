import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GameLobby from './pages/GameLobby';
import CreateRoom from './pages/CreateRoom';
import GameScreen from './pages/GameScreen';
import HostDashboard from './pages/HostDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/lobby',
    element: <GameLobby />,
  },
  {
    path: '/create',
    element: <CreateRoom />,
  },
  {
    path: '/game/:id',
    element: <GameScreen />,
  },
  {
    path: '/dashboard',
    element: <HostDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;