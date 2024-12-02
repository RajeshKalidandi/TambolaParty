import { useState } from 'react';
import SearchBar from '../components/lobby/SearchBar';
import RoomCard from '../components/lobby/RoomCard';
import BottomNav from '../components/lobby/BottomNav';
import CreateRoomButton from '../components/lobby/CreateRoomButton';
import type { Room } from '../types/room';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, Zap, Users } from 'lucide-react';

// Add more mock rooms with categories
const MOCK_ROOMS: (Room & { category: string })[] = [
  {
    id: '1',
    name: 'Weekend Bonanza',
    hostRating: 4.8,
    ticketPrice: 100,
    category: 'tournament',
    prizes: {
      fullHouse: 1000,
      topLine: 300,
      middleLine: 300,
      bottomLine: 300,
    },
    players: [
      { id: '1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1' },
      { id: '2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2' },
      { id: '3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3' },
      { id: '4', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4' },
    ],
    maxPlayers: 15,
    startTime: new Date(Date.now() + 30 * 60000).toISOString(),
  },
  {
    id: '2',
    name: 'Quick Game',
    hostRating: 4.5,
    ticketPrice: 50,
    category: 'quick',
    prizes: {
      fullHouse: 500,
      topLine: 150,
      middleLine: 150,
      bottomLine: 150,
    },
    players: [
      { id: '5', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5' },
      { id: '6', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=6' },
    ],
    maxPlayers: 10,
    startTime: new Date(Date.now() + 15 * 60000).toISOString(),
  },
  {
    id: '3',
    name: 'Casual Evening',
    hostRating: 4.2,
    ticketPrice: 30,
    category: 'casual',
    prizes: {
      fullHouse: 300,
      topLine: 100,
      middleLine: 100,
      bottomLine: 100,
    },
    players: [
      { id: '7', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=7' },
    ],
    maxPlayers: 20,
    startTime: new Date(Date.now() + 45 * 60000).toISOString(),
  },
];

const Featured = () => (
  <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-4 rounded-xl text-white mb-6">
    <h2 className="text-xl font-bold mb-2">Weekend Tournament 🏆</h2>
    <p className="text-sm opacity-90 mb-3">Join our biggest tournament of the week with a prize pool of ₹10,000!</p>
    <button className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
      Join Now
    </button>
  </div>
);

const QuickStats = () => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    <div className="bg-gray-800 p-4 rounded-xl text-center">
      <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
      <p className="text-sm text-gray-400">Prize Pool</p>
      <p className="text-lg font-bold text-white">₹25,000</p>
    </div>
    <div className="bg-gray-800 p-4 rounded-xl text-center">
      <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
      <p className="text-sm text-gray-400">Active Games</p>
      <p className="text-lg font-bold text-white">12</p>
    </div>
    <div className="bg-gray-800 p-4 rounded-xl text-center">
      <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
      <p className="text-sm text-gray-400">Players</p>
      <p className="text-lg font-bold text-white">156</p>
    </div>
  </div>
);

export default function GameLobby() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredRooms, setFilteredRooms] = useState(MOCK_ROOMS);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = MOCK_ROOMS.filter(room =>
      room.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRooms(filtered);
  };

  const handleFilterChange = (filters: { category: string; priceRange: [number, number]; startTime: string }) => {
    let filtered = MOCK_ROOMS;

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(room => room.category === filters.category);
    }

    // Apply price filter
    filtered = filtered.filter(room =>
      room.ticketPrice >= filters.priceRange[0] &&
      room.ticketPrice <= filters.priceRange[1]
    );

    // Apply time filter
    if (filters.startTime !== 'any') {
      const now = Date.now();
      filtered = filtered.filter(room => {
        const startTime = new Date(room.startTime).getTime();
        const diffMinutes = (startTime - now) / (1000 * 60);
        switch (filters.startTime) {
          case '15min': return diffMinutes <= 15;
          case '30min': return diffMinutes <= 30;
          case '1hour': return diffMinutes <= 60;
          default: return true;
        }
      });
    }

    setFilteredRooms(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Featured Section */}
        <Featured />

        {/* Quick Stats */}
        <QuickStats />

        {/* Room List */}
        <AnimatePresence mode="popLayout">
          {filteredRooms.length > 0 ? (
            <div className="space-y-4">
              {filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-400">No rooms found matching your criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  handleFilterChange({
                    priceRange: [0, 1000],
                    startTime: 'any',
                    category: 'all',
                  });
                }}
                className="mt-4 text-cyan-400 hover:text-cyan-300"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Create Room Button */}
      <CreateRoomButton />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}