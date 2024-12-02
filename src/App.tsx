import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import GameLobby from './pages/GameLobby';
import CreateRoom from './pages/CreateRoom';
import GameScreen from './pages/GameScreen';
import HostDashboard from './pages/HostDashboard';
import PlayerProfile from './pages/PlayerProfile';
import BuyTickets from './pages/payments/BuyTickets';
import Withdrawal from './pages/payments/Withdrawal';
import GameResults from './pages/GameResults';
import QuickJoin from './pages/QuickJoin'; // Assuming QuickJoin is in the same directory as other pages


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
    path: '/game/:gameId/results',
    element: <GameResults gameId={":gameId"} />,
  },
  {
    path: '/dashboard',
    element: <HostDashboard />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/profile',
    element: <PlayerProfile />,
  },

  {
    path: '/buy-tickets',
    element: <BuyTickets />,
  },
  {
    path: '/withdraw',
    element: <Withdrawal />,
  },
  {
    path: '/quick-join',
    element: <QuickJoin />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
