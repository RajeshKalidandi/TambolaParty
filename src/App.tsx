import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth/AuthContext';
import { ProtectedRoute } from './lib/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import GameLobby from './pages/GameLobby';
import CreateRoom from './pages/CreateRoom';
import GameScreen from './pages/GameScreen';
import HostDashboard from './pages/HostDashboard';
import PlayerProfile from './pages/PlayerProfile';
import BuyTickets from './pages/payments/BuyTickets';
import Withdrawal from './pages/payments/Withdrawal';
import GameResults from './pages/GameResults';
import QuickJoin from './pages/QuickJoin';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/lobby',
    element: (
      <ProtectedRoute>
        <GameLobby />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create',
    element: (
      <ProtectedRoute>
        <CreateRoom />
      </ProtectedRoute>
    ),
  },
  {
    path: '/game/:gameId',
    element: (
      <ProtectedRoute>
        <GameScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/game/:gameId/results',
    element: (
      <ProtectedRoute>
        <GameResults />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <HostDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <PlayerProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/buy-tickets',
    element: (
      <ProtectedRoute>
        <BuyTickets />
      </ProtectedRoute>
    ),
  },
  {
    path: '/withdraw',
    element: (
      <ProtectedRoute>
        <Withdrawal />
      </ProtectedRoute>
    ),
  },
  {
    path: '/quick-join',
    element: (
      <ProtectedRoute>
        <QuickJoin />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;