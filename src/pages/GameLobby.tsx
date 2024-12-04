import { useState, useEffect } from 'react';
import SearchBar from '../components/lobby/SearchBar';
import RoomCard from '../components/lobby/RoomCard';
import BottomNav from '../components/lobby/BottomNav';
import CreateRoomButton from '../components/lobby/CreateRoomButton';
import JoinByCode from '../components/lobby/JoinByCode';
import type { Room } from '../types/room';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, Zap, Users, Crown, IndianRupee, Clock, Search } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function GameLobby() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'prize' | 'players' | 'time'>('prize');
  const [stats, setStats] = useState({
    prizePool: 0,
    activeGames: 0,
    players: 0,
    topPrize: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    void loadRoomsAndStats();

    // Subscribe to room changes
    const channel = supabase
      .channel('lobby')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          void loadRoomsAndStats();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Filter and sort rooms when search query or sort method changes
  useEffect(() => {
    let result = [...rooms];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(room => 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.host_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'prize':
          return calculateTotalPrize(b.prizes) - calculateTotalPrize(a.prizes);
        case 'players':
          return (b.current_players || 0) - (a.current_players || 0);
        case 'time':
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredRooms(result);
  }, [rooms, searchQuery, sortBy]);

  const calculateTotalPrize = (prizes: Room['prizes']) => {
    return Object.values(prizes).reduce((sum, prize) => sum + prize, 0);
  };

  const loadRoomsAndStats = async () => {
    try {
      // Get active rooms with their details
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          host:host_id(username),
          players:room_players(count)
        `)
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (roomsError) throw roomsError;

      // Get count of paid players
      const { count: paidPlayersCount, error: playersError } = await supabase
        .from('room_players')
        .select('*', { count: 'exact', head: true })
        .eq('payment_status', 'PAID');

      if (playersError) throw playersError;

      // Process rooms data
      const processedRooms = roomsData?.map(room => ({
        ...room,
        host_name: room.host?.username,
        current_players: room.players?.[0]?.count || 0
      })) || [];

      setRooms(processedRooms);

      // Calculate stats
      const totalPrizePool = processedRooms.reduce((total, room) => 
        total + calculateTotalPrize(room.prizes), 0
      );

      const topPrize = processedRooms.reduce((max, room) => 
        Math.max(max, calculateTotalPrize(room.prizes)), 0
      );

      setStats({
        prizePool: totalPrizePool,
        activeGames: processedRooms.length,
        players: paidPlayersCount || 0,
        topPrize
      });
    } catch (error) {
      console.error('Error loading lobby data:', error);
      toast.error('Failed to load lobby data');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Stats Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600/20 to-indigo-600/20">
        <div className="max-w-7xl mx-auto py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {/* Prize Pool */}
            <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center text-emerald-400 mb-2">
                <Trophy className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Prize Pool</span>
              </div>
              <div className="text-xl font-bold text-white">₹{stats.prizePool.toLocaleString()}</div>
            </div>

            {/* Active Games */}
            <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center text-blue-400 mb-2">
                <Zap className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Active Games</span>
              </div>
              <div className="text-xl font-bold text-white">{stats.activeGames}</div>
            </div>

            {/* Online Players */}
            <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center text-purple-400 mb-2">
                <Users className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Online Players</span>
              </div>
              <div className="text-xl font-bold text-white">{stats.players}</div>
            </div>

            {/* Top Prize */}
            <div className="bg-black/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center text-amber-400 mb-2">
                <Crown className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Top Prize</span>
              </div>
              <div className="text-xl font-bold text-white">₹{stats.topPrize.toLocaleString()}</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('prize')}
              className={`px-4 py-2 rounded-lg ${
                sortBy === 'prize'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <IndianRupee className="w-4 h-4 inline mr-1" />
              Prize
            </button>
            <button
              onClick={() => setSortBy('players')}
              className={`px-4 py-2 rounded-lg ${
                sortBy === 'players'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              Players
            </button>
            <button
              onClick={() => setSortBy('time')}
              className={`px-4 py-2 rounded-lg ${
                sortBy === 'time'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1" />
              Time
            </button>
          </div>
        </div>

        {/* Rooms Grid */}
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <RoomCard room={room} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-400 text-lg">
              {searchQuery
                ? 'No rooms match your search'
                : 'No active rooms available'}
            </div>
            <CreateRoomButton className="mt-4" />
          </motion.div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Join by Code Modal */}
      <JoinByCode />
    </div>
  );
}