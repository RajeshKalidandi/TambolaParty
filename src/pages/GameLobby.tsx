import { useState, useEffect } from 'react';
import SearchBar from '../components/lobby/SearchBar';
import RoomCard from '../components/lobby/RoomCard';
import BottomNav from '../components/lobby/BottomNav';
import CreateRoomButton from '../components/lobby/CreateRoomButton';
import type { Room } from '../types/room';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, Zap, Users, Crown, IndianRupee } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';

export default function GameLobby() {
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState({
    prizePool: 0,
    activeGames: 0,
    players: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    void loadStats();

    const channel = supabase
      .channel('lobby-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          void loadStats();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadStats = async () => {
    try {
      // Get active rooms with their prizes
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          ticket_price,
          max_players,
          prizes
        `)
        .eq('status', 'waiting');

      if (roomsError) throw roomsError;

      // Get count of paid players
      const { count: paidPlayersCount, error: playersError } = await supabase
        .from('room_players')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'PAID');

      if (playersError) throw playersError;

      // Calculate total prize pool
      const prizePool = (roomsData || []).reduce((total, room) => {
        if (!room.prizes) return total;
        const prizes = room.prizes as Room['prizes'];
        return total + Object.values(prizes).reduce((a, b) => a + b, 0);
      }, 0);

      setStats({
        prizePool,
        activeGames: roomsData?.length || 0,
        players: paidPlayersCount || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Optionally show error toast
      // toast.error('Failed to load lobby stats');
    }
  };

  if (!user) {
    return null; // or redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-indigo-600/20 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Game Lobby
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">
              Join exciting Tambola games and win big prizes
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchBar onRoomsChange={setFilteredRooms} />
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Prize Pool</p>
                <p className="mt-2 text-3xl font-bold text-white">₹{stats.prizePool.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Games</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.activeGames}</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Zap className="w-8 h-8 text-cyan-500" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl p-6 shadow-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Players</p>
                <p className="mt-2 text-3xl font-bold text-white">{stats.players}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Rooms Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRooms.map((room) => (
                <motion.div
                  key={room.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <RoomCard room={room} currentUserId={user.id} />
                </motion.div>
              ))}
              {filteredRooms.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full"
                >
                  <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-500">
                      <Crown className="mx-auto w-12 h-12 text-gray-500" />
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-200">No rooms found</h3>
                    <p className="mt-1 text-sm text-gray-400">Try adjusting your search filters</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Create Room Button */}
      <CreateRoomButton userId={user.id} />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}