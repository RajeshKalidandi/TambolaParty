import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth/AuthContext';
import { ProtectedRoute } from './lib/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Page imports
import LandingPage from './pages/LandingPage';
import GameLobby from './pages/GameLobby';
import CreateRoom from './pages/CreateRoom';
import GameScreen from './pages/GameScreen';
import HostDashboard from './pages/HostDashboard';
import PlayerProfile from './pages/PlayerProfile';
import GameResults from './pages/GameResults';
import QuickJoin from './pages/QuickJoin';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Tickets from './pages/Tickets';
import Notifications from './pages/Notifications';
import JoinRoom from './pages/JoinRoom';

// Payment related pages
import BuyTickets from './pages/payments/BuyTickets';
import Withdrawal from './pages/payments/Withdrawal';
import Wallet from './pages/payments/Wallet';

const router = createBrowserRouter([
  // Public routes
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
    path: '/join/:code',
    element: <JoinRoom />,
  },

  // Protected game-related routes
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
    path: '/game/:id',
    element: (
      <ProtectedRoute>
        <GameScreen />
      </ProtectedRoute>
    ),
  },
  {
    path: '/game/:id/results',
    element: (
      <ProtectedRoute>
        <GameResults />
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

  // Protected user-related routes
  {
    path: '/host',
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
    path: '/tickets',
    element: (
      <ProtectedRoute>
        <Tickets />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },

  // Protected payment-related routes
  {
    path: '/buy-tickets/:gameId',
    element: (
      <ProtectedRoute>
        <BuyTickets />
      </ProtectedRoute>
    ),
  },
  {
    path: '/withdrawal',
    element: (
      <ProtectedRoute>
        <Withdrawal />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wallet',
    element: (
      <ProtectedRoute>
        <Wallet />
      </ProtectedRoute>
    ),
  },

  // Fallback route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}