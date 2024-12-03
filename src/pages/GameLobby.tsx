import { useState } from 'react';
import SearchBar from '../components/lobby/SearchBar';
import RoomCard from '../components/lobby/RoomCard';
import BottomNav from '../components/lobby/BottomNav';
import CreateRoomButton from '../components/lobby/CreateRoomButton';
import type { Room } from '../types/room';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, Zap, Users } from 'lucide-react';

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
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      {/* Search Bar */}
      <SearchBar onRoomsChange={setFilteredRooms} />

      {/* Featured Section */}
      <Featured />

      {/* Quick Stats */}
      <QuickStats />

      {/* Rooms Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
          {filteredRooms.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-400">
              No rooms found matching your criteria
            </div>
          )}
        </div>
      </div>

      {/* Create Room Button */}
      <CreateRoomButton />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}