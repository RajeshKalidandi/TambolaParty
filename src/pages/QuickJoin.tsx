import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, Clock, Star, ArrowRight, Ticket } from 'lucide-react';
import type { RecentRoom, PopularHost } from '../types/room';

// Mock data - replace with actual data from your backend
const mockRecentRooms: RecentRoom[] = [
  {
    id: '1',
    code: 'PARTY123',
    name: 'Weekend Fun',
    hostName: 'Priya Singh',
    ticketPrice: 100,
    startTime: new Date(Date.now() + 1800000),
    playerCount: 15
  },
  {
    id: '2',
    code: 'WIN456',
    name: 'Lucky Tuesday',
    hostName: 'Rahul Kumar',
    ticketPrice: 50,
    startTime: new Date(Date.now() + 3600000),
    playerCount: 8
  }
];

const mockPopularHosts: PopularHost[] = [
  {
    id: '1',
    name: 'Amit Patel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amit',
    rating: 4.8,
    activeRooms: 2,
    totalGamesHosted: 150
  },
  {
    id: '2',
    name: 'Priya Singh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
    rating: 4.9,
    activeRooms: 1,
    totalGamesHosted: 120
  }
];

const QuickJoin = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleJoin = (code: string) => {
    // Add your room joining logic here
    navigate(`/game/${code}`);
  };

  const handleScan = () => {
    setIsScanning(true);
    // Implement QR scanning logic
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Room Code Input */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Join Game</h1>
        <div className="relative">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter Room Code"
            className="w-full px-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 
                     focus:outline-none transition-colors"
            maxLength={8}
          />
          <button
            onClick={() => handleJoin(roomCode)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-2 
                     rounded-lg hover:bg-blue-600 transition-colors"
          >
            Join
          </button>
        </div>
        <button
          onClick={handleScan}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 
                   rounded-xl hover:bg-gray-50 transition-colors"
        >
          <QrCode className="w-5 h-5 text-gray-600" />
          <span className="text-gray-600">Scan QR Code</span>
        </button>
      </div>

      {/* Recent Rooms */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Rooms</h2>
          <button className="text-blue-500 text-sm">View All</button>
        </div>
        <div className="space-y-3">
          {mockRecentRooms.map(room => (
            <button
              key={room.id}
              onClick={() => handleJoin(room.code)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 
                       transition-colors border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{room.name}</h3>
                  <p className="text-sm text-gray-500">by {room.hostName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">₹{room.ticketPrice}</p>
                <p className="text-xs text-gray-500">{room.playerCount} players</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Hosts */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Hosts</h2>
        <div className="space-y-3">
          {mockPopularHosts.map(host => (
            <div key={host.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={host.avatar}
                  alt={host.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{host.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{host.rating}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{host.activeRooms} active</p>
                <p className="text-xs text-gray-500">{host.totalGamesHosted} games</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Purchase Floating Button */}
      <button
        onClick={() => navigate('/buy-tickets')}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg 
                 hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <Ticket className="w-5 h-5" />
        <span>Quick Buy</span>
      </button>
    </div>
  );
};

export default QuickJoin;